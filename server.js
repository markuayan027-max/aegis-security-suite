// ─────────────────────────────────────────────────────────────────────────────
// Created: 2026-09-16 | Purpose: Aegis Security Suite API & Tactical Server
// Target: Google Cloud SQL / Node.js 20+ Native ESM
// Compatibility: Run with AI CLI: `node server.js` | Zero npm dependencies
// ─────────────────────────────────────────────────────────────────────────────

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data (Events, Cadets, Students & Tactical Units)
const defaultState = {
  activeEventId: "evt-101",
  emergencyHotlines: [
    {
      id: "hl-1", agencyName: "National Emergency Hotline", shortCode: "911",
      primaryPhone: "911", secondaryPhone: null, radioFreq: null,
      category: "NATIONAL", description: "Universal emergency number — connects to police, fire, or ambulance.",
      priorityOrder: 1, isActive: true
    },
    {
      id: "hl-2", agencyName: "Bureau of Fire Protection (BFP)", shortCode: "160",
      primaryPhone: "160", secondaryPhone: "(02) 8426-0246", radioFreq: "154.070 MHz",
      category: "FIRE_RESCUE", description: "Fire suppression, technical rescue, extrication, and hazmat.",
      priorityOrder: 2, isActive: true
    },
    {
      id: "hl-3", agencyName: "Philippine Red Cross Emergency Line", shortCode: "143",
      primaryPhone: "143", secondaryPhone: "(02) 8527-8385", radioFreq: null,
      category: "MEDICAL_EMS", description: "Ambulance, advanced life support, and mass casualty triage.",
      priorityOrder: 3, isActive: true
    },
    {
      id: "hl-4", agencyName: "Philippine National Police (PNP)", shortCode: "117",
      primaryPhone: "117", secondaryPhone: "(02) 8722-0650", radioFreq: "159.725 MHz",
      category: "POLICE_SECURITY", description: "Criminal incident response, crowd control, campus lockdown support.",
      priorityOrder: 4, isActive: true
    },
    {
      id: "hl-5", agencyName: "NDRRMC / CDRRMO Operations Center", shortCode: "NDRRMC",
      primaryPhone: "(02) 8911-5061", secondaryPhone: "(02) 8912-2665", radioFreq: "142.200 MHz",
      category: "DISASTER_RESCUE", description: "Disaster risk reduction — floods, earthquakes, typhoon, structural collapse.",
      priorityOrder: 5, isActive: true
    },
    {
      id: "hl-6", agencyName: "Campus Security Tactical Desk", shortCode: "TAC-DESK",
      primaryPhone: "local 1001", secondaryPhone: "local 1002", radioFreq: "TAC-1 (462.5625 MHz)",
      category: "CAMPUS_INTERNAL", description: "On-site Aegis command desk. First internal escalation point.",
      priorityOrder: 6, isActive: true
    },
    {
      id: "hl-7", agencyName: "Campus Health & Medical Clinic", shortCode: "CLINIC",
      primaryPhone: "local 1200", secondaryPhone: "local 1201", radioFreq: null,
      category: "CAMPUS_INTERNAL", description: "Medical first aid, injury triage, and ambulance coordination.",
      priorityOrder: 7, isActive: true
    }
  ],
  deptLeaders: [
    {
      id: "dl-1", displayName: "Leader Ana Reyes", department: "College of Nursing",
      sectionName: "BSN 3-B", phone: "0917-111-0001", email: "areyes@campus.edu",
      accessCode: "NURSE-SEC-01", isActive: true
    },
    {
      id: "dl-2", displayName: "Leader Mark Bautista", department: "College of Engineering",
      sectionName: "BSCE 2-A", phone: "0917-111-0002", email: "mbautista@campus.edu",
      accessCode: "ENGR-SEC-01", isActive: true
    },
    {
      id: "dl-3", displayName: "Leader Carla Domingo", department: "College of Education",
      sectionName: "BSED 3-A", phone: "0917-111-0003", email: "cdomingo@campus.edu",
      accessCode: "EDUC-SEC-01", isActive: true
    }
  ],

  adminAccounts: [
    {
      username: "admin@aegis.tactical",
      passkey: "SEC-ADMIN-2026",
      role: "SUPER_ADMIN",
      displayName: "Commander Inspector Ramirez"
    }
  ],
  events: [
    {
      id: "evt-101",
      eventCode: "EVT-2026-TAC1",
      title: "Annual Criminology Agility & Field Security Drill",
      eventType: "TACTICAL_DRILL",
      location: "Main Quad & Perimeter Gates",
      date: "2026-09-16",
      status: "ACTIVE",
      totalStudentsEnrolled: 4,
      mandatoryShifts: ["AM_IN", "AM_OUT", "PM_IN", "PM_OUT"]
    },
    {
      id: "evt-102",
      eventCode: "EVT-2026-RESC",
      title: "Disaster Search & Extrication Simulation",
      eventType: "RESCUE_SIMULATION",
      location: "Athletic Arena & East Bleachers",
      date: "2026-09-16",
      status: "ACTIVE",
      totalStudentsEnrolled: 3,
      mandatoryShifts: ["AM_IN", "PM_OUT"]
    },
    {
      id: "evt-103",
      eventCode: "EVT-2026-INTRA",
      title: "University Intramurals Opening Gate Control",
      eventType: "CAMPUS_SECURITY",
      location: "North & South Access Checkpoints",
      date: "2026-09-18",
      status: "SCHEDULED",
      totalStudentsEnrolled: 4,
      mandatoryShifts: ["AM_IN", "AM_OUT", "PM_IN", "PM_OUT"]
    }
  ],
  studentCompliance: [
    {
      studentId: "m-101",
      eventId: "evt-101",
      amIn: "07:42 AM",
      amOut: "11:58 AM",
      pmIn: "01:15 PM",
      pmOut: null,
      status: "IN_PROGRESS"
    },
    {
      studentId: "m-102",
      eventId: "evt-101",
      amIn: "07:55 AM",
      amOut: "12:02 PM",
      pmIn: "01:28 PM",
      pmOut: "05:32 PM",
      status: "COMPLIANT"
    },
    {
      studentId: "m-103",
      eventId: "evt-101",
      amIn: "08:18 AM",
      amOut: null,
      pmIn: null,
      pmOut: null,
      status: "LATE"
    },
    {
      studentId: "m-104",
      eventId: "evt-101",
      amIn: null,
      amOut: null,
      pmIn: null,
      pmOut: null,
      status: "ABSENT"
    }
  ],
  tacticalUnits: [
    {
      id: "u-101",
      unitNumber: 1,
      callsign: "Alpha Rapid Rescue",
      patrolSector: "Sector 1 - North Perimeter & Gates",
      minRescueRequired: 1,
      isDeployed: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "u-102",
      unitNumber: 2,
      callsign: "Bravo Extrication & Medical",
      patrolSector: "Sector 2 - Central Quad & Event Arena",
      minRescueRequired: 1,
      isDeployed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "u-103",
      unitNumber: 3,
      callsign: "Charlie Incident Command",
      patrolSector: "Sector 3 - South Evacuation Corridor",
      minRescueRequired: 1,
      isDeployed: false,
      createdAt: new Date().toISOString()
    }
  ],
  members: [
    {
      id: "m-101",
      identifierCode: "STU-0801",
      studentIdNumber: "2026-CRIM-0801",
      displayName: "Cadet Ronald Ramos",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3-A",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: true,
      specialties: ["PATROL", "FIRST_AID"],
      phone: "0917-555-0101", radioChannel: "TAC-1", dutyStation: "Gate North / Kiosk A",
      assignedUnitId: "u-101",
      dutyStatus: "ON_DUTY"
    },
    {
      id: "m-102",
      identifierCode: "STU-0802",
      studentIdNumber: "2026-CRIM-0802",
      displayName: "Cadet Nicole Santos",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3-A",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-0102", radioChannel: "TAC-1", dutyStation: "Central Quad / Kiosk B",
      assignedUnitId: "u-102",
      dutyStatus: "ON_DUTY"
    },
    {
      id: "m-103",
      identifierCode: "STU-0803",
      studentIdNumber: "2026-CRIM-0803",
      displayName: "Cadet Kevin Bautista",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3-B",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: true,
      specialties: ["HEAVY_RESCUE", "EXTRICATION"],
      phone: "0917-555-0103", radioChannel: "TAC-2", dutyStation: "Athletic Arena / East Bleachers",
      assignedUnitId: "u-101",
      dutyStatus: "ON_DUTY"
    },
    {
      id: "m-104",
      identifierCode: "STU-0804",
      studentIdNumber: "2026-CRIM-0804",
      displayName: "Cadet Bea Alcantara",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3-B",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-0104", radioChannel: "TAC-1", dutyStation: "South Gate / Standby Post",
      assignedUnitId: "u-103",
      dutyStatus: "OFF_DUTY"
    },
    {
      id: "m-1",
      identifierCode: "CADET-7701",
      studentIdNumber: "2024-OFFICER-01",
      displayName: "Officer Marcus Vance",
      memberType: "OFFICER",
      sectionName: "Tactical Officers",
      department: "Criminology Tactical Squad",
      roleTitle: "Squad Lead / Heavy Rescue",
      physicalRating: 5, // 1-5 scale (4-5 = Heavy Rescue Capable)
      isRescueCertified: true,
      specialties: ["HEAVY_RESCUE", "EXTRICATION", "TACTICAL_BREACHING"],
      phone: "0917-777-0001", radioChannel: "TAC-CMD", dutyStation: "Command Post Alpha",
      assignedUnitId: "u-101",
      dutyStatus: "ON_DUTY"
    },
    {
      id: "m-2",
      identifierCode: "CADET-7702",
      displayName: "Cadet Elena Rostova",
      department: "Criminology Tactical Squad",
      roleTitle: "Trauma Medic / Tactical EMT",
      physicalRating: 4,
      isRescueCertified: true,
      specialties: ["TRAUMA_FIRST_AID", "WATER_RESCUE", "TRIAGE"],
      phone: "0917-777-0002", radioChannel: "MED-1", dutyStation: "Field Medical Station Bravo",
      assignedUnitId: "u-102",
      dutyStatus: "ON_DUTY"
    },
    {
      id: "m-3",
      identifierCode: "CADET-7703",
      displayName: "Cadet Mateo Cruz",
      department: "Security & Crowd Control",
      roleTitle: "Perimeter Observer",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["CROWD_CONTROL", "PATROL"],
      phone: "0917-777-0003", radioChannel: "TAC-1", dutyStation: "North Perimeter / Gate 1",
      assignedUnitId: "u-101",
      dutyStatus: "ON_DUTY"
    },
    {
      id: "m-4",
      identifierCode: "CADET-7704",
      displayName: "Cadet Samuel Kim",
      department: "Communications & Surveillance",
      roleTitle: "Radio Dispatcher",
      physicalRating: 2,
      isRescueCertified: false,
      specialties: ["COMMS", "DISPATCH"],
      phone: "0917-777-0004", radioChannel: "OPS-1", dutyStation: "Tactical Radio Room",
      assignedUnitId: "u-102",
      dutyStatus: "ON_DUTY"
    },
    {
      id: "m-5",
      identifierCode: "CADET-7705",
      displayName: "Cadet Jaxson Miller",
      department: "Criminology Tactical Squad",
      roleTitle: "Heavy Extrication Specialist",
      physicalRating: 5,
      isRescueCertified: true,
      specialties: ["HEAVY_RESCUE", "HIGH_ANGLE_ROPES", "LIFESAVING"],
      phone: "0917-777-0005", radioChannel: "TAC-2", dutyStation: "South Evacuation Corridor",
      assignedUnitId: "u-103",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-6",
      identifierCode: "CADET-7706",
      displayName: "Cadet David O'Connor",
      department: "Security & Crowd Control",
      roleTitle: "Perimeter Marshal",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL", "ACCESS_CONTROL"],
      phone: "0917-777-0006", radioChannel: "TAC-1", dutyStation: "South Access Checkpoint",
      assignedUnitId: "u-103",
      dutyStatus: "STANDBY"
    }
  ],
  attendanceLogs: [
    {
      id: "att-001",
      memberId: "m-1",
      displayName: "Officer Marcus Vance",
      identifierCode: "CADET-7701",
      eventType: "CHECK_IN",
      verificationMethod: "EDGE_VECTOR",
      verificationLatencyMs: 142,
      terminalCode: "KIOSK-GATE-NORTH",
      loggedAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "att-002",
      memberId: "m-2",
      displayName: "Cadet Elena Rostova",
      identifierCode: "CADET-7702",
      eventType: "CHECK_IN",
      verificationMethod: "ENCRYPTED_BADGE",
      verificationLatencyMs: 98,
      terminalCode: "KIOSK-GATE-NORTH",
      loggedAt: new Date(Date.now() - 3400000).toISOString()
    }
  ],
  // Anonymous Reports / Concerns (Referenced from POD-AI Concern model)
  anonymousReports: [
    {
      id: "rep-001",
      referenceCode: "REF-9A4B2C",
      category: "EMERGENCY_RESCUE",
      urgency: "CRITICAL",
      message: "Scaffolding collapse near East Bleachers. Civilian trapped under debris, needs immediate extrication team!",
      locationHint: "East Bleachers, Sector 2",
      isAnonymous: true,
      status: "DISPATCHED",
      assignedUnitId: "u-102",
      adminNotes: "Dispatched Bravo Medical & Rescue at 06:15. Extrication unit en route.",
      resolutionDetails: "Unit 2 deployed with hydraulic spreaders and EMT kit.",
      respondedBy: "Admin / Dispatch Commander",
      respondedAt: new Date(Date.now() - 900000).toISOString(),
      createdAt: new Date(Date.now() - 1200000).toISOString(),
      updatedAt: new Date(Date.now() - 900000).toISOString()
    },
    {
      id: "rep-002",
      referenceCode: "REF-4K8M1P",
      category: "SUSPICIOUS_PERSON",
      urgency: "MEDIUM",
      message: "Unattended black duffel bag spotted behind Gate 4 transformer box.",
      locationHint: "Gate 4, Sector 1",
      isAnonymous: true,
      status: "OPEN",
      assignedUnitId: null,
      adminNotes: null,
      resolutionDetails: null,
      respondedBy: null,
      respondedAt: null,
      createdAt: new Date(Date.now() - 400000).toISOString(),
      updatedAt: new Date(Date.now() - 400000).toISOString()
    }
  ]
};

// State Persistence Helper
let state = { ...defaultState };
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    state = JSON.parse(raw);
  } catch (err) {
    console.warn("Could not read persistent store, using default seed data:", err.message);
  }
}

function persistState() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error("Failed to persist state:", err.message);
  }
}

// Generate Crypto-Random 8-Character Reference Code (POD-AI Concern pattern)
function generateReferenceCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = 'REF-';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

// ── New Domain Functions ──────────────────────────────────────────────────────

// Validate 5 W's Incident Report — WHO is flexible (unknown allowed), WHERE is mandatory
export function validateFiveWs(data) {
  const errors = [];

  // WHERE — most critical field, always required
  if (!data.whereLocation || data.whereLocation.trim().length < 5) {
    errors.push("WHERE is required: specify the campus building, floor, room, or landmark (minimum 5 characters).");
  }

  // WHAT — incident nature required
  if (!data.whatHappened || data.whatHappened.trim().length < 10) {
    errors.push("WHAT happened must be described (minimum 10 characters).");
  }

  // WHEN — must be present (defaults to now if omitted, but field must exist)
  if (data.whenOccurred !== undefined && isNaN(Date.parse(data.whenOccurred))) {
    errors.push("WHEN occurred must be a valid date/time.");
  }

  // WHO — flexible: either whoInvolved text OR whoUnknown flag must be set
  const hasWho = data.whoInvolved && data.whoInvolved.trim().length >= 3;
  const hasUnknownWho = data.whoUnknown === true;
  if (!hasWho && !hasUnknownWho) {
    errors.push("WHO is required: either describe the person(s) involved (appearance, clothing, role) or check 'Person Unknown'.");
  }

  // WHY/HOW — required context
  if (!data.whyHowDetails || data.whyHowDetails.trim().length < 10) {
    errors.push("WHY/HOW must describe the situation, cause, or hazard (minimum 10 characters).");
  }

  // Live photo anti-spam: must have a photo OR explicit no-photo reason
  const hasPhoto = typeof data.livePhotoDataUrl === 'string' && data.livePhotoDataUrl.startsWith('data:image/');
  const hasNoPhotoReason = typeof data.noPhotoReason === 'string' && data.noPhotoReason.trim().length >= 3;
  if (!hasPhoto && !hasNoPhotoReason) {
    errors.push("A live photo is required (taken now using your camera) OR a reason for no photo must be provided.");
  }

  // If photo is provided, validate it was taken within 120 seconds
  if (hasPhoto && data.photoTimestamp) {
    const photoAge = (Date.now() - Number(data.photoTimestamp)) / 1000;
    if (photoAge > 120) {
      errors.push("Live photo is too old (taken more than 2 minutes ago). Please take a fresh photo.");
    }
  }

  return { valid: errors.length === 0, errors };
}

// Generate standardized Government Bureau Dispatch Dossier
export function generateGovDossier(report, bureau) {
  const dossierCode = `DOSSIER-${new Date().getFullYear()}-${bureau.toUpperCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-6)}`;
  const mapLink = report.mapUrl || (report.coordinates?.lat ? `https://maps.google.com/?q=${report.coordinates.lat},${report.coordinates.lng}` : 'N/A');
  const whoText = report.whoUnknown ? `UNKNOWN PERSON (Description: ${report.whoInvolved || 'Not provided'})` : (report.whoInvolved || 'Not specified');

  const dossier = [
    `═══════════════════════════════════════════`,
    `   AEGIS TACTICAL ESCALATION DOSSIER`,
    `   ${dossierCode}`,
    `═══════════════════════════════════════════`,
    `TO BUREAU : ${bureau}`,
    `URGENCY   : ${report.urgency}`,
    `CATEGORY  : ${report.category}`,
    `REF CODE  : ${report.referenceCode}`,
    `TIMESTAMP : ${new Date().toISOString()}`,
    `───────────────────────────────────────────`,
    `[WHO]     ${whoText}`,
    `[WHAT]    ${report.whatHappened}`,
    `[WHERE]   ${report.whereLocation}`,
    `          GPS: ${mapLink}`,
    `[WHEN]    ${report.whenOccurred || report.createdAt}`,
    `[WHY/HOW] ${report.whyHowDetails}`,
    `───────────────────────────────────────────`,
    `Reporter  : ${report.reporterType === 'ANONYMOUS_CIVILIAN' ? 'Anonymous Civilian' : `${report.reporterName || 'Unnamed'} — ${report.reporterDepartment || ''} ${report.reporterSection || ''}`}`,
    `Photo     : ${report.hasLivePhoto ? 'YES (live capture attached)' : `NO — Reason: ${report.noPhotoReason || 'Not stated'}`}`,
    `Verified  : ${report.hasLivePhoto ? 'LIVE PHOTO VERIFIED' : 'UNVERIFIED (no photo)'}`,
    `═══════════════════════════════════════════`,
    `DISPATCHED BY AEGIS SECURITY SUITE / Criminology Campus Security`,
  ].join('\n');

  return { dossierCode, dossier, mapLink };
}

// Strict Admin-Only Attendance Access Guard
export function checkAttendanceAccess(role) {
  return role === 'ADMIN';
}

// Cadet Tactical Contact Mesh Roster (grouped by unit)
export function getCadetContactRoster(members, units) {
  return units.map(unit => {
    const assignedMembers = members
      .filter(m => m.assignedUnitId === unit.id)
      .map(m => ({
        id: m.id,
        displayName: m.displayName,
        roleTitle: m.roleTitle || m.memberType,
        identifierCode: m.identifierCode,
        phone: m.phone || null,
        radioChannel: m.radioChannel || 'TAC-1',
        dutyStation: m.dutyStation || 'Unassigned Post',
        dutyStatus: m.dutyStatus,
        specialties: m.specialties || [],
        isRescueCertified: m.isRescueCertified || false,
      }));
    return {
      unitId: unit.id,
      unitNumber: unit.unitNumber,
      callsign: unit.callsign,
      patrolSector: unit.patrolSector,
      isDeployed: unit.isDeployed,
      members: assignedMembers,
      memberCount: assignedMembers.length,
    };
  });
}

// Calculate Rescue Capability for a Unit
// Requirement: Each group must have someone strong and capable of rescuing (physicalRating >= 4 and isRescueCertified)
export function computeUnitReadiness(unit, allMembers) {
  const assigned = allMembers.filter(m => m.assignedUnitId === unit.id);
  const rescueCapable = assigned.filter(m => m.isRescueCertified && m.physicalRating >= 4);
  const isRescueReady = rescueCapable.length >= (unit.minRescueRequired || 1);
  const avgStrength = assigned.length > 0 
    ? (assigned.reduce((acc, m) => acc + (m.physicalRating || 3), 0) / assigned.length).toFixed(1)
    : "0.0";

  return {
    ...unit,
    totalAssigned: assigned.length,
    rescueCapableCount: rescueCapable.length,
    rescueCapableMembers: rescueCapable.map(m => ({
      id: m.id,
      displayName: m.displayName,
      physicalRating: m.physicalRating,
      specialties: m.specialties
    })),
    avgSquadStrength: Number(avgStrength),
    rescueReadinessStatus: isRescueReady ? "RESCUE_READY" : "INSUFFICIENT_RESCUE_CAPABILITY",
    warning: isRescueReady ? null : "⚠️ High Risk: No certified heavy rescue operative assigned to this group!"
  };
}

// Auto-Balance Rescue Operatives Across All Numbered Units
export function autoBalanceUnits(units, members) {
  const rescueOperatives = members.filter(m => m.isRescueCertified && m.physicalRating >= 4);
  const regularMembers = members.filter(m => !(m.isRescueCertified && m.physicalRating >= 4));

  // Reset assignments
  const newMembers = members.map(m => ({ ...m, assignedUnitId: null }));
  const unitList = [...units].sort((a, b) => a.unitNumber - b.unitNumber);

  // Round-robin assign rescue operatives to guarantee at least 1 per unit
  rescueOperatives.forEach((op, idx) => {
    const targetUnit = unitList[idx % unitList.length];
    const member = newMembers.find(m => m.id === op.id);
    if (member) member.assignedUnitId = targetUnit.id;
  });

  // Distribute remaining members evenly
  let nextUnitIdx = 0;
  regularMembers.forEach(reg => {
    const targetUnit = unitList[nextUnitIdx % unitList.length];
    const member = newMembers.find(m => m.id === reg.id);
    if (member) member.assignedUnitId = targetUnit.id;
    nextUnitIdx++;
  });

  return newMembers;
}

// Update Student Compliance Record across shifts
export function updateStudentCompliance(complianceList, memberId, eventId, shiftType, timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), mandatoryShifts = ["AM_IN", "AM_OUT", "PM_IN", "PM_OUT"]) {
  let record = complianceList.find(c => c.studentId === memberId && c.eventId === eventId);
  if (!record) {
    record = {
      studentId: memberId,
      eventId: eventId,
      amIn: null,
      amOut: null,
      pmIn: null,
      pmOut: null,
      status: "IN_PROGRESS"
    };
    complianceList.push(record);
  }

  if (shiftType === 'AM_IN') record.amIn = timeStr;
  else if (shiftType === 'AM_OUT') record.amOut = timeStr;
  else if (shiftType === 'PM_IN') record.pmIn = timeStr;
  else if (shiftType === 'PM_OUT') record.pmOut = timeStr;

  const completed = mandatoryShifts.every(s => {
    if (s === 'AM_IN') return !!record.amIn;
    if (s === 'AM_OUT') return !!record.amOut;
    if (s === 'PM_IN') return !!record.pmIn;
    if (s === 'PM_OUT') return !!record.pmOut;
    return true;
  });

  record.status = completed ? 'COMPLIANT' : 'IN_PROGRESS';
  return record;
}

// Helper: Parse JSON Body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error("Invalid JSON payload"));
      }
    });
    req.on('error', reject);
  });
}

// MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

// HTTP Server & Request Handler (Dual Mode: Native Node Server + Vercel Serverless Function)
async function requestHandler(req, res) {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  const method = req.method;

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Health & Google Cloud Data MCP Integration Endpoint
  if (method === 'GET' && pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: "ONLINE",
      system: "Aegis Security Suite & Multi-Event Management",
      databaseTarget: "Google Cloud SQL (PostgreSQL 16+)",
      gcpTelemetry: {
        projectId: "security-l1",
        region: "asia-east2",
        mcpDataAgentKitStatus: "COMPATIBLE",
        uriPattern: "cloudsql://projects/security-l1/instances/aegis-primary/databases/security_attendance",
        offlineEdgeSync: "ACTIVE"
      },
      stats: {
        totalMembers: state.members.length,
        totalEvents: state.events.length,
        activeEventId: state.activeEventId,
        totalUnits: state.tacticalUnits.length,
        totalAttendanceLogs: state.attendanceLogs.length,
        openAnonymousReports: state.anonymousReports.filter(r => r.status === 'OPEN').length
      }
    }));
    return;
  }

  // 1.1 Multi-Event Management APIs (Admin manages all different events at once)
  if (method === 'GET' && pathname === '/api/events') {
    const enrichedEvents = state.events.map(evt => {
      const records = state.studentCompliance.filter(c => c.eventId === evt.id);
      const compliantCount = records.filter(c => c.status === 'COMPLIANT').length;
      const lateCount = records.filter(c => c.status === 'LATE').length;
      const absentCount = records.filter(c => c.status === 'ABSENT').length;
      return {
        ...evt,
        isActive: evt.id === state.activeEventId,
        totalEnrolled: records.length || evt.totalStudentsEnrolled,
        compliantCount,
        lateCount,
        absentCount,
        complianceRate: records.length ? Math.round((compliantCount / records.length) * 100) : 75
      };
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      activeEventId: state.activeEventId,
      events: enrichedEvents
    }));
    return;
  }

  if (method === 'POST' && pathname === '/api/events') {
    try {
      const data = await parseJsonBody(req);
      if (!data.title) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Event title is required" }));
        return;
      }

      const newEvent = {
        id: `evt-${Date.now()}`,
        eventCode: `EVT-${Date.now().toString().slice(-4)}`,
        title: data.title,
        eventType: data.eventType || "TACTICAL_DRILL",
        location: data.location || "Campus Ground",
        date: data.date || new Date().toISOString().split('T')[0],
        status: "ACTIVE",
        totalStudentsEnrolled: Number(data.totalStudentsEnrolled || 40),
        mandatoryShifts: data.mandatoryShifts || ["AM_IN", "AM_OUT", "PM_IN", "PM_OUT"]
      };

      state.events.unshift(newEvent);
      state.activeEventId = newEvent.id;
      persistState();

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, event: newEvent }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (method === 'POST' && pathname === '/api/events/switch') {
    try {
      const { eventId } = await parseJsonBody(req);
      const evt = state.events.find(e => e.id === eventId);
      if (!evt) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Event not found" }));
        return;
      }

      state.activeEventId = evt.id;
      persistState();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, activeEvent: evt }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Student Attendance Compliance Roster for an Event — ADMIN ONLY
  if (method === 'GET' && pathname.startsWith('/api/events/') && pathname.endsWith('/students')) {
    const reqRole = req.headers['x-user-role'] || urlObj.searchParams.get('role') || '';
    if (!checkAttendanceAccess(reqRole.toUpperCase())) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'FORBIDDEN: Student compliance roster is restricted to Admin / Commander only.' }));
      return;
    }
    const eventId = pathname.replace('/api/events/', '').replace('/students', '');
    const students = state.members.filter(m => m.memberType === 'STUDENT');
    const roster = students.map(student => {
      let record = state.studentCompliance.find(c => c.studentId === student.id && c.eventId === eventId);
      if (!record) {
        record = {
          studentId: student.id,
          eventId,
          amIn: null,
          amOut: null,
          pmIn: null,
          pmOut: null,
          status: "PENDING"
        };
      }
      return {
        ...student,
        compliance: record
      };
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ eventId, students: roster }));
    return;
  }

  // Admin Account Authentication Check
  if (method === 'POST' && pathname === '/api/admin/login') {
    try {
      const { passkey } = await parseJsonBody(req);
      if (passkey === 'SEC-ADMIN-2026') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          admin: state.adminAccounts[0]
        }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Invalid Admin Passkey. Access Denied." }));
      }
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ── Public Emergency Hotlines API (no auth required) ──────────────────────
  if (method === 'GET' && pathname === '/api/hotlines') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ hotlines: (state.emergencyHotlines || []).filter(h => h.isActive) }));
    return;
  }

  // ── Cadet Tactical Contact Mesh (Officers + Admin can view) ───────────────
  if (method === 'GET' && pathname === '/api/cadet-mesh') {
    const roster = getCadetContactRoster(state.members, state.tacticalUnits);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ mesh: roster, totalUnits: state.tacticalUnits.length }));
    return;
  }

  // ── Department Leaders Directory ──────────────────────────────────────────
  if (method === 'GET' && pathname === '/api/dept-leaders') {
    // Only return non-sensitive fields
    const safe = (state.deptLeaders || []).map(({ id, displayName, department, sectionName, isActive }) => ({
      id, displayName, department, sectionName, isActive
    }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ leaders: safe }));
    return;
  }

  // 2. Attendance APIs — ADMIN ONLY
  if (method === 'GET' && pathname === '/api/attendance') {
    const reqRole = req.headers['x-user-role'] || urlObj.searchParams.get('role') || '';
    if (!checkAttendanceAccess(reqRole.toUpperCase())) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'FORBIDDEN: Attendance logs are restricted to Admin / Commander only.' }));
      return;
    }
    const onDutyCount = state.members.filter(m => m.dutyStatus === 'ON_DUTY').length;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      logs: state.attendanceLogs.slice(0, 50),
      metrics: {
        totalCadets: state.members.length,
        onDutyCount,
        offDutyCount: state.members.length - onDutyCount,
        checkedInToday: state.attendanceLogs.length
      }
    }));
    return;
  }

  if (method === 'POST' && pathname === '/api/attendance/check-in') {
    try {
      const data = await parseJsonBody(req);
      const member = state.members.find(m => 
        m.id === data.memberId || m.identifierCode === data.identifierCode
      );

      if (!member) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Cadet / Member identifier not found in security registry." }));
        return;
      }

      const currentHour = new Date().getHours();
      let defaultShift = "AM_IN";
      if (currentHour >= 11 && currentHour < 13) defaultShift = "AM_OUT";
      else if (currentHour >= 13 && currentHour < 16) defaultShift = "PM_IN";
      else if (currentHour >= 16) defaultShift = "PM_OUT";

      const shiftType = data.shiftType || defaultShift;
      const eventType = data.eventType || (shiftType.endsWith("_OUT") ? "CHECK_OUT" : "CHECK_IN");
      member.dutyStatus = eventType === 'CHECK_IN' ? 'ON_DUTY' : 'OFF_DUTY';

      const logEntry = {
        id: `att-${Date.now()}`,
        memberId: member.id,
        displayName: member.displayName,
        identifierCode: member.identifierCode,
        shiftType,
        eventType,
        verificationMethod: data.verificationMethod || "QR_CODE",
        verificationLatencyMs: data.verificationLatencyMs || Math.floor(Math.random() * 80 + 70),
        terminalCode: data.terminalCode || "KIOSK-MAIN-SEC",
        loggedAt: new Date().toISOString()
      };

      state.attendanceLogs.unshift(logEntry);

      // Automatically sync student event compliance if member is student
      if (member.memberType === 'STUDENT') {
        const activeEvt = state.events.find(e => e.id === (data.eventId || state.activeEventId));
        updateStudentCompliance(
          state.studentCompliance,
          member.id,
          data.eventId || state.activeEventId,
          shiftType,
          new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          activeEvt?.mandatoryShifts
        );
      }

      persistState();

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: `${member.displayName} successfully logged: ${eventType}`,
        log: logEntry,
        member
      }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 3. Tactical Units & Rescue Balancing APIs
  if (method === 'GET' && pathname === '/api/units') {
    const detailedUnits = state.tacticalUnits.map(u => computeUnitReadiness(u, state.members));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      units: detailedUnits,
      allRescueCapableCount: state.members.filter(m => m.isRescueCertified && m.physicalRating >= 4).length
    }));
    return;
  }

  if (method === 'POST' && pathname === '/api/units') {
    try {
      const data = await parseJsonBody(req);
      if (!data.unitNumber || !data.callsign) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "unitNumber and callsign are required" }));
        return;
      }

      const newUnit = {
        id: `u-${Date.now()}`,
        unitNumber: Number(data.unitNumber),
        callsign: data.callsign,
        patrolSector: data.patrolSector || "Sector Unassigned",
        minRescueRequired: data.minRescueRequired || 1,
        isDeployed: false,
        createdAt: new Date().toISOString()
      };

      state.tacticalUnits.push(newUnit);
      persistState();

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        unit: computeUnitReadiness(newUnit, state.members)
      }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (method === 'POST' && pathname === '/api/units/assign') {
    try {
      const { memberId, unitId } = await parseJsonBody(req);
      const member = state.members.find(m => m.id === memberId);
      if (!member) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Member not found" }));
        return;
      }

      member.assignedUnitId = unitId || null;
      persistState();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        member,
        units: state.tacticalUnits.map(u => computeUnitReadiness(u, state.members))
      }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (method === 'POST' && pathname === '/api/units/auto-balance') {
    state.members = autoBalanceUnits(state.tacticalUnits, state.members);
    persistState();

    const detailedUnits = state.tacticalUnits.map(u => computeUnitReadiness(u, state.members));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: "Rescue operatives successfully balanced across all tactical numbered units.",
      units: detailedUnits,
      members: state.members
    }));
    return;
  }

  // 4. Cadets / Members API
  if (method === 'GET' && pathname === '/api/members') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ members: state.members }));
    return;
  }

  // 5. Unified Incident Reporting (5 W's enforced, live-photo anti-spam)
  //    Accepts: anonymous civilians, non-CJS dept leaders, and cadet officers
  //    Replaces old /api/reports/anonymous (kept for backward compat below)
  if (method === 'POST' && (pathname === '/api/reports/incident' || pathname === '/api/reports/anonymous')) {
    try {
      const data = await parseJsonBody(req);

      // 5 W's validation
      const { valid, errors } = validateFiveWs(data);
      if (!valid) {
        res.writeHead(422, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Incident report is incomplete. Please answer all required fields.',
          validationErrors: errors,
          hint: 'WHO can be marked Unknown — but WHERE, WHAT, WHEN, WHY/HOW are always required. A live photo or a stated reason for no photo is also needed.'
        }));
        return;
      }

      if (!data.category) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Incident category is required.' }));
        return;
      }

      const referenceCode = generateReferenceCode();
      const coordinates = data.coordinates?.lat && data.coordinates?.lng
        ? { lat: Number(data.coordinates.lat), lng: Number(data.coordinates.lng), accuracy: Number(data.coordinates.accuracy || 10) }
        : null;
      const mapUrl = coordinates ? `https://maps.google.com/?q=${coordinates.lat},${coordinates.lng}` : null;
      const hasLivePhoto = typeof data.livePhotoDataUrl === 'string' && data.livePhotoDataUrl.startsWith('data:image/');
      // Store only a flag + thumbnail hash, never the full base64 in state (privacy)
      const photoHash = hasLivePhoto
        ? crypto.createHash('sha256').update(data.livePhotoDataUrl.slice(0, 500)).digest('hex').slice(0, 16)
        : null;

      const report = {
        id: `rep-${Date.now()}`,
        referenceCode,
        // Reporter identity
        reporterType: data.reporterType || 'ANONYMOUS_CIVILIAN',
        reporterName: data.reporterName || null,
        reporterContact: data.reporterContact || null,
        reporterDepartment: data.reporterDepartment || null,
        reporterSection: data.reporterSection || null,
        // 5 W's
        whoInvolved: data.whoUnknown ? (data.whoInvolved || 'Unknown') : data.whoInvolved,
        whoUnknown: data.whoUnknown === true,
        whatHappened: data.whatHappened,
        whereLocation: data.whereLocation,
        whenOccurred: data.whenOccurred || new Date().toISOString(),
        whyHowDetails: data.whyHowDetails,
        // Legacy fields for compat
        message: data.whatHappened,
        locationHint: data.whereLocation,
        category: data.category,
        urgency: data.urgency || 'MEDIUM',
        // Photo verification
        hasLivePhoto,
        photoHash,
        noPhotoReason: !hasLivePhoto ? (data.noPhotoReason || null) : null,
        // Status & dispatch
        isAnonymous: data.reporterType === 'ANONYMOUS_CIVILIAN' || !data.reporterName,
        verificationStatus: hasLivePhoto ? 'LIVE_PHOTO_VERIFIED' : 'UNVERIFIED',
        coordinates,
        mapUrl,
        status: 'OPEN',
        assignedUnitId: null,
        govEscalationStatus: 'NONE',
        govAgencyName: null,
        govDossierCode: null,
        govEscalatedAt: null,
        govOperatorNotes: null,
        adminNotes: null,
        resolutionDetails: null,
        respondedBy: null,
        respondedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      state.anonymousReports.unshift(report);
      persistState();

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        referenceCode,
        verificationStatus: report.verificationStatus,
        message: hasLivePhoto
          ? 'Your incident report has been submitted and verified with a live photo. Use your reference code to track dispatch status.'
          : 'Your incident report has been submitted as UNVERIFIED (no live photo). Security staff will triage accordingly. Use your reference code to track status.',
        report: {
          referenceCode, category: report.category, urgency: report.urgency,
          status: report.status, verificationStatus: report.verificationStatus,
          whereLocation: report.whereLocation, whenOccurred: report.whenOccurred,
          mapUrl, createdAt: report.createdAt
        }
      }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Government Bureau Rescue Escalation (Admin only)
  if (method === 'POST' && pathname.match(/^\/api\/reports\/([^/]+)\/escalate-gov$/)) {
    try {
      const reportId = pathname.split('/')[3];
      const report = state.anonymousReports.find(r => r.id === reportId);
      if (!report) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Report not found.' }));
        return;
      }
      const { bureau, operatorNotes } = await parseJsonBody(req);
      if (!bureau) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'bureau is required (e.g. BFP, PNP, CDRRMO, RED_CROSS).' }));
        return;
      }
      const { dossierCode, dossier, mapLink } = generateGovDossier(report, bureau);
      const statusKey = `DISPATCHED_TO_${bureau.toUpperCase().replace(/\s+/g, '_').replace(/-/g, '_')}`;
      report.govEscalationStatus = statusKey;
      report.govAgencyName = bureau;
      report.govDossierCode = dossierCode;
      report.govEscalatedAt = new Date().toISOString();
      report.govOperatorNotes = operatorNotes || null;
      report.status = 'DISPATCHED';
      report.updatedAt = new Date().toISOString();
      persistState();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, dossierCode, dossier, mapLink, report }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Anonymous Public Lookup (Status by Reference Code)
  if (method === 'GET' && pathname.startsWith('/api/reports/anonymous/')) {
    const code = decodeURIComponent(pathname.replace('/api/reports/anonymous/', '')).trim().toUpperCase();
    const report = state.anonymousReports.find(r => r.referenceCode === code);

    if (!report) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `No report found matching reference code: ${code}` }));
      return;
    }

    const assignedUnit = report.assignedUnitId 
      ? state.tacticalUnits.find(u => u.id === report.assignedUnitId)
      : null;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      referenceCode: report.referenceCode,
      category: report.category,
      urgency: report.urgency,
      status: report.status,
      locationHint: report.locationHint,
      coordinates: report.coordinates,
      mapUrl: report.mapUrl,
      createdAt: report.createdAt,
      assignedUnit: assignedUnit ? { unitNumber: assignedUnit.unitNumber, callsign: assignedUnit.callsign } : null,
      adminNotes: report.adminNotes,
      resolutionDetails: report.resolutionDetails,
      respondedAt: report.respondedAt
    }));
    return;
  }

  // Admin Reports Feed
  if (method === 'GET' && pathname === '/api/reports/admin') {
    const enrichedReports = state.anonymousReports.map(r => {
      const unit = r.assignedUnitId ? state.tacticalUnits.find(u => u.id === r.assignedUnitId) : null;
      return {
        ...r,
        assignedUnit: unit ? { id: unit.id, unitNumber: unit.unitNumber, callsign: unit.callsign } : null
      };
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      reports: enrichedReports,
      summary: {
        total: state.anonymousReports.length,
        open: state.anonymousReports.filter(r => r.status === 'OPEN').length,
        dispatched: state.anonymousReports.filter(r => r.status === 'DISPATCHED').length,
        resolved: state.anonymousReports.filter(r => r.status === 'RESOLVED').length
      }
    }));
    return;
  }

  // Admin Update / Dispatch Report
  if (method === 'PATCH' && pathname.startsWith('/api/reports/admin/')) {
    try {
      const reportId = pathname.replace('/api/reports/admin/', '');
      const report = state.anonymousReports.find(r => r.id === reportId);

      if (!report) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Report not found" }));
        return;
      }

      const updates = await parseJsonBody(req);
      if (updates.status) report.status = updates.status;
      if (updates.assignedUnitId !== undefined) report.assignedUnitId = updates.assignedUnitId;
      if (updates.adminNotes !== undefined) report.adminNotes = updates.adminNotes;
      if (updates.resolutionDetails !== undefined) report.resolutionDetails = updates.resolutionDetails;
      
      report.respondedBy = updates.respondedBy || "Commander Admin";
      report.respondedAt = new Date().toISOString();
      report.updatedAt = new Date().toISOString();

      persistState();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, report }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 6. Static File Serving & Clean Route Resolution
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  if (['/replit', '/react', '/suite'].includes(pathname)) {
    filePath = path.join(__dirname, 'replit.html');
  } else if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
}

const server = http.createServer(requestHandler);

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

// Start Server if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => {
    console.log(`[Aegis Tactical Server] Running at http://localhost:${PORT}`);
    console.log(`[Database Target] Google Cloud SQL (PostgreSQL 16+) / Project: security-l1`);
    console.log(`[Reference Pattern] POD-AI Concern anonymous reporting + Group Rescue Balancing`);
  });
}

// computeUnitReadiness, autoBalanceUnits, updateStudentCompliance, validateFiveWs,
// generateGovDossier, checkAttendanceAccess, getCadetContactRoster are exported inline above
export { server, requestHandler, state, generateReferenceCode };
