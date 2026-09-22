-- ==============================================================================
-- Created: 2026-09-16 | Purpose: E-Secure 1.0 Database Schema
-- Target: Google Cloud SQL (PostgreSQL 16+) / Local Compatible PostgreSQL
-- Components:
--   1. Tactical Units & Group Management (Unit Numbering)
--   2. Member Roster with Physical & Rescue Capability Ratings
--   3. Privacy-Preserving Fast Attendance Logging
--   4. Anonymous Incident & Concern Reporting (Referenced from POD-AI Concern model)
--   5. Real-Time Views for Live Attendance and Rescue Capability Verification
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Organizations / Facilities
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    jurisdiction_code VARCHAR(50) DEFAULT 'SECTOR-ALPHA',
    privacy_policy_version VARCHAR(20) DEFAULT '2026.1-TACTICAL',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Managed Events (Admin Multi-Event Management System)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    event_code VARCHAR(30) UNIQUE NOT NULL, -- e.g. "EVT-2026-TAC1"
    title VARCHAR(150) NOT NULL,            -- e.g. "Annual Criminology Agility & Security Drill"
    event_type VARCHAR(50) DEFAULT 'TACTICAL_DRILL',
    location VARCHAR(120) NOT NULL,         -- e.g. "Main Campus & Athletic Stadium"
    event_date DATE DEFAULT CURRENT_DATE,
    cutoff_am_in TIME DEFAULT '08:00:00',
    cutoff_am_out TIME DEFAULT '12:00:00',
    cutoff_pm_in TIME DEFAULT '13:30:00',
    cutoff_pm_out TIME DEFAULT '17:30:00',
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tactical Units / Numbered Squads
CREATE TABLE IF NOT EXISTS tactical_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL, -- Unit deployment tied to event
    unit_number INTEGER UNIQUE NOT NULL, -- e.g. 1, 2, 3, 101, 102
    callsign VARCHAR(60) NOT NULL,       -- e.g. "Alpha Rescue", "Bravo Sentinel"
    patrol_sector VARCHAR(80) NOT NULL,  -- e.g. "Sector 1 - North Gate"
    lead_member_id UUID,                 -- Squad Leader
    min_rescue_required INTEGER DEFAULT 1, -- Mandatory rescue-certified operatives
    is_deployed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Students, Cadets & Security Personnel Roster
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    assigned_unit_id UUID REFERENCES tactical_units(id) ON DELETE SET NULL,
    member_type VARCHAR(20) DEFAULT 'STUDENT' CHECK (member_type IN ('STUDENT', 'OFFICER', 'LEADER', 'ADMIN')),
    identifier_code VARCHAR(64) UNIQUE NOT NULL,  -- Token / Badge SHA-256
    student_id_number VARCHAR(50),                -- e.g. "2026-CRIM-0412"
    display_name VARCHAR(100) NOT NULL,
    section_name VARCHAR(60) DEFAULT 'BS-CRIM 3-A', -- e.g. "BS-CRIM 3-A", "BS-CRIM 2-B"
    department VARCHAR(80) NOT NULL,              -- e.g. "College of Criminology"
    role_title VARCHAR(80) NOT NULL,              -- e.g. "Student Cadet", "Rescue Specialist"
    physical_rating INTEGER CHECK (physical_rating BETWEEN 1 AND 5) DEFAULT 3,
    is_rescue_certified BOOLEAN DEFAULT FALSE,
    specialties TEXT[] DEFAULT ARRAY['PATROL'],
    phone_number VARCHAR(30),                     -- Direct call for tactical cadet mesh
    radio_channel VARCHAR(30) DEFAULT 'TAC-1',    -- VHF/UHF tactical radio channel
    duty_station VARCHAR(100),                    -- Assigned physical post / checkpoint
    duty_status VARCHAR(20) DEFAULT 'OFF_DUTY' CHECK (duty_status IN ('OFF_DUTY', 'ON_DUTY', 'DEPLOYED', 'STANDBY')),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'REVOKED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Foreign key for tactical_units leader
ALTER TABLE tactical_units 
    DROP CONSTRAINT IF EXISTS fk_unit_lead;
ALTER TABLE tactical_units 
    ADD CONSTRAINT fk_unit_lead FOREIGN KEY (lead_member_id) REFERENCES members(id) ON DELETE SET NULL;

-- 5. Student Daily Shift Compliance Tracker (Morning AM & Afternoon PM)
CREATE TABLE IF NOT EXISTS student_event_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    am_in_at TIMESTAMPTZ,
    am_out_at TIMESTAMPTZ,
    pm_in_at TIMESTAMPTZ,
    pm_out_at TIMESTAMPTZ,
    compliance_status VARCHAR(25) DEFAULT 'PENDING' CHECK (compliance_status IN ('COMPLIANT', 'PARTIAL', 'LATE', 'ABSENT', 'PENDING')),
    total_hours_rendered NUMERIC(4, 2) DEFAULT 0.00,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (event_id, student_id)
);

-- 4. Security Kiosks / Scanning Terminals
CREATE TABLE IF NOT EXISTS security_terminals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    terminal_code VARCHAR(50) UNIQUE NOT NULL,
    location_label VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_heartbeat TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Fast Attendance Logs (Partitioned for High-Volume Check-Ins)
CREATE TABLE IF NOT EXISTS attendance_logs (
    id UUID DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    terminal_id UUID REFERENCES security_terminals(id),
    shift_type VARCHAR(20) DEFAULT 'AM_IN' CHECK (shift_type IN ('AM_IN', 'AM_OUT', 'PM_IN', 'PM_OUT', 'EMERGENCY_RECALL')),
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('CHECK_IN', 'CHECK_OUT', 'SECURITY_PING', 'DUTY_SHIFT')),
    verification_method VARCHAR(30) NOT NULL CHECK (verification_method IN ('QR_CODE', 'SMARTPHONE_BADGE', 'EDGE_VECTOR', 'ENCRYPTED_BADGE', 'EPHEMERAL_TOKEN', 'ADMIN_MANUAL')),
    verification_latency_ms INTEGER NOT NULL DEFAULT 120,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tamper_proof_hash VARCHAR(64),
    PRIMARY KEY (id, logged_at)
) PARTITION BY RANGE (logged_at);

-- Partition for current active range
CREATE TABLE IF NOT EXISTS attendance_logs_2026_09 PARTITION OF attendance_logs
    FOR VALUES FROM ('2026-09-01 00:00:00+00') TO ('2026-10-01 00:00:00+00');

-- 6. Anonymous Reports & Concerns (Referenced from POD-AI Concern model)
CREATE TABLE IF NOT EXISTS anonymous_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_code VARCHAR(12) UNIQUE NOT NULL, -- e.g. "REF-7A9B2C" (Cryptographically secure random)
    category VARCHAR(40) NOT NULL CHECK (category IN (
        'EMERGENCY_RESCUE', 
        'HAZARD_OBSTACLE', 
        'SUSPICIOUS_PERSON', 
        'MEDICAL_INCIDENT', 
        'TACTICAL_ALERT', 
        'CIVILIAN_CONCERN'
    )),
    urgency VARCHAR(20) DEFAULT 'MEDIUM' CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    -- Mandatory 5 W's Intelligence Framework
    reporter_type VARCHAR(30) DEFAULT 'ANONYMOUS_CIVILIAN' CHECK (reporter_type IN ('ANONYMOUS_CIVILIAN', 'DEPT_SECTION_LEADER', 'CADET_OFFICER')),
    reporter_name VARCHAR(100),                      -- Optional for civilians; provided by non-CJS leaders
    reporter_contact VARCHAR(50),                   -- Phone/contact number for follow-up
    reporter_department VARCHAR(100),               -- e.g. "College of Nursing", "College of Engineering"
    reporter_section VARCHAR(50),                   -- e.g. "BSN 3-B", "BSCE 2-A"
    who_involved TEXT NOT NULL,                     -- [WHO] Person/students involved, victims, suspects
    what_happened TEXT NOT NULL,                    -- [WHAT] Specific nature of emergency, injuries, hazard
    where_location VARCHAR(200) NOT NULL,           -- [WHERE] Campus Building, Floor, Room/Wing, Landmark
    when_occurred TIMESTAMPTZ DEFAULT NOW(),        -- [WHEN] Exact timestamp of occurrence
    why_how_details TEXT NOT NULL,                  -- [WHY / HOW] How situation unfolded, cause, hazards present
    
    -- Geolocation & Reference
    location_hint VARCHAR(150),
    gps_latitude NUMERIC(10, 7),
    gps_longitude NUMERIC(10, 7),
    gps_accuracy_meters NUMERIC(6, 2),
    is_anonymous BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'TRIAGED', 'DISPATCHED', 'RESOLVED', 'CLOSED')),
    assigned_unit_id UUID REFERENCES tactical_units(id) ON DELETE SET NULL,
    
    -- Dedicated Government Bureau Rescue Escalation
    gov_escalation_status VARCHAR(35) DEFAULT 'NONE' CHECK (gov_escalation_status IN (
        'NONE', 
        'DISPATCHED_TO_BFP', 
        'DISPATCHED_TO_PNP', 
        'DISPATCHED_TO_CDRRMO', 
        'DISPATCHED_TO_RED_CROSS', 
        'DISPATCHED_TO_COAST_GUARD', 
        'RESOLVED_BY_GOV'
    )),
    gov_agency_name VARCHAR(100),                   -- e.g. "Bureau of Fire Protection - Station 4"
    gov_dossier_code VARCHAR(50),                   -- e.g. "DOSSIER-2026-BFP-0412"
    gov_escalated_at TIMESTAMPTZ,                   -- Timestamp when escalated
    gov_operator_notes TEXT,                        -- Dispatcher relay remarks
    
    admin_notes TEXT,
    resolution_details TEXT,
    responded_by VARCHAR(100),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Public & Tactical Emergency Hotlines Directory
CREATE TABLE IF NOT EXISTS emergency_hotlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_name VARCHAR(100) NOT NULL,
    short_code VARCHAR(20) NOT NULL,             -- e.g. "911", "160", "143", "117"
    primary_phone VARCHAR(50) NOT NULL,
    secondary_phone VARCHAR(50),
    radio_freq VARCHAR(50),                      -- e.g. "142.200 MHz"
    category VARCHAR(40) NOT NULL CHECK (category IN ('NATIONAL', 'FIRE_RESCUE', 'DISASTER_RESCUE', 'MEDICAL_EMS', 'POLICE_SECURITY', 'CAMPUS_INTERNAL')),
    description TEXT NOT NULL,
    priority_order INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Optimized Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_logs_recent 
    ON attendance_logs (logged_at DESC, member_id);

CREATE INDEX IF NOT EXISTS idx_members_assigned_unit 
    ON members (assigned_unit_id);

CREATE INDEX IF NOT EXISTS idx_anonymous_reports_ref 
    ON anonymous_reports (reference_code);

CREATE INDEX IF NOT EXISTS idx_anonymous_reports_status 
    ON anonymous_reports (status, urgency);

-- 8. View: Live Attendance Stream & Duty Roster
CREATE OR REPLACE VIEW v_live_attendance_stream AS
SELECT 
    l.id AS log_id,
    l.logged_at,
    l.event_type,
    l.verification_method,
    l.verification_latency_ms,
    m.display_name,
    m.department,
    m.role_title,
    m.duty_status,
    m.identifier_code,
    u.unit_number,
    u.callsign AS unit_callsign,
    t.location_label,
    t.terminal_code
FROM attendance_logs l
JOIN members m ON l.member_id = m.id
LEFT JOIN tactical_units u ON m.assigned_unit_id = u.id
LEFT JOIN security_terminals t ON l.terminal_id = t.id
ORDER BY l.logged_at DESC;

-- 9. View: Unit Rescue Capability & Safety Compliance View
-- Enforces requirement: Every unit must have at least one capable and rescue-certified operative
CREATE OR REPLACE VIEW v_unit_rescue_readiness AS
SELECT 
    u.id AS unit_id,
    u.unit_number,
    u.callsign,
    u.patrol_sector,
    u.is_deployed,
    u.min_rescue_required,
    COUNT(m.id) AS total_assigned,
    COUNT(CASE WHEN m.is_rescue_certified = TRUE AND m.physical_rating >= 4 THEN 1 END) AS rescue_capable_count,
    ROUND(AVG(m.physical_rating)::numeric, 1) AS avg_squad_strength,
    CASE 
        WHEN COUNT(CASE WHEN m.is_rescue_certified = TRUE AND m.physical_rating >= 4 THEN 1 END) >= u.min_rescue_required 
        THEN 'RESCUE_READY' 
        ELSE 'INSUFFICIENT_RESCUE_CAPABILITY' 
    END AS rescue_readiness_status
FROM tactical_units u
LEFT JOIN members m ON u.id = m.assigned_unit_id AND m.status = 'ACTIVE'
GROUP BY u.id, u.unit_number, u.callsign, u.patrol_sector, u.is_deployed, u.min_rescue_required;
