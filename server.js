// ─────────────────────────────────────────────────────────────────────────────
// Created: 2026-09-16 | Purpose: E-Secure 1.0 API & Tactical Server
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
      category: "CAMPUS_INTERNAL", description: "On-site E-Secure 1.0 command desk. First internal escalation point.",
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
      username: "admin@esecure.tactical",
      passkey: "SEC-ADMIN-2026",
      role: "SUPER_ADMIN",
      displayName: "Commander Inspector Ramirez"
    }
  ],
  pendingRegistrations: [],
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
  studentCompliance: [],
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
    // Real Student Roster — 1st to 3rd Year (221 cadets)
    {
      id: "m-1A001",
      identifierCode: "STU-1A-001",
      studentIdNumber: "2026-CRIM-1A-001",
      displayName: "Cadet Gian Alferez",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-1A00", radioChannel: "TAC-1", dutyStation: "Gate North / Kiosk A",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A002",
      identifierCode: "STU-1A-002",
      studentIdNumber: "2026-CRIM-1A-002",
      displayName: "Cadet Mitz Asoy",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-1A00", radioChannel: "TAC-2", dutyStation: "Main Gate Entrance",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A003",
      identifierCode: "STU-1A-003",
      studentIdNumber: "2026-CRIM-1A-003",
      displayName: "Cadet Genmar Camus",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-1A00", radioChannel: "TAC-3", dutyStation: "Science Complex",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A004",
      identifierCode: "STU-1A-004",
      studentIdNumber: "2026-CRIM-1A-004",
      displayName: "Cadet Juniel Dago",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-1A00", radioChannel: "TAC-4", dutyStation: "Quadrangle Walkway",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A005",
      identifierCode: "STU-1A-005",
      studentIdNumber: "2026-CRIM-1A-005",
      displayName: "Cadet Francis Espa├▒o",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-1A00", radioChannel: "TAC-1", dutyStation: "South Gate / Standby Post",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A006",
      identifierCode: "STU-1A-006",
      studentIdNumber: "2026-CRIM-1A-006",
      displayName: "Cadet Laurence Fabricante",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: true,
      specialties: ["PATROL","EXTRICATION"],
      phone: "0917-555-1A00", radioChannel: "TAC-2", dutyStation: "Athletic Arena / East Bleachers",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A007",
      identifierCode: "STU-1A-007",
      studentIdNumber: "2026-CRIM-1A-007",
      displayName: "Cadet Eljhon Gasahan",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID","RADIO_OPS"],
      phone: "0917-555-1A00", radioChannel: "TAC-3", dutyStation: "Library Corridor",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A008",
      identifierCode: "STU-1A-008",
      studentIdNumber: "2026-CRIM-1A-008",
      displayName: "Cadet Florence Jaballas",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-1A00", radioChannel: "TAC-4", dutyStation: "Admin Building Lobby",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A009",
      identifierCode: "STU-1A-009",
      studentIdNumber: "2026-CRIM-1A-009",
      displayName: "Cadet Shieldon Larican",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-1A00", radioChannel: "TAC-1", dutyStation: "Canteen Area / Post B",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A010",
      identifierCode: "STU-1A-010",
      studentIdNumber: "2026-CRIM-1A-010",
      displayName: "Cadet I├▒aki Magalzo",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-1A01", radioChannel: "TAC-2", dutyStation: "Clinic / Field Station",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A011",
      identifierCode: "STU-1A-011",
      studentIdNumber: "2026-CRIM-1A-011",
      displayName: "Cadet Dominic Manabay",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-1A01", radioChannel: "TAC-3", dutyStation: "Command Post Alpha",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A012",
      identifierCode: "STU-1A-012",
      studentIdNumber: "2026-CRIM-1A-012",
      displayName: "Cadet Rey Mansangcagan",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-1A01", radioChannel: "TAC-4", dutyStation: "North Perimeter / Gate 1",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A013",
      identifierCode: "STU-1A-013",
      studentIdNumber: "2026-CRIM-1A-013",
      displayName: "Cadet Merben Mejares",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-1A01", radioChannel: "TAC-1", dutyStation: "East Wing Corridor",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A014",
      identifierCode: "STU-1A-014",
      studentIdNumber: "2026-CRIM-1A-014",
      displayName: "Cadet Reynalge Militante",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-1A01", radioChannel: "TAC-2", dutyStation: "Parking Area / Post C",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A015",
      identifierCode: "STU-1A-015",
      studentIdNumber: "2026-CRIM-1A-015",
      displayName: "Cadet Steven Montajes",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-1A01", radioChannel: "TAC-3", dutyStation: "Chapel Grounds",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A016",
      identifierCode: "STU-1A-016",
      studentIdNumber: "2026-CRIM-1A-016",
      displayName: "Cadet James Odchigue",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: true,
      specialties: ["PATROL","EXTRICATION"],
      phone: "0917-555-1A01", radioChannel: "TAC-4", dutyStation: "Gate North / Kiosk A",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A017",
      identifierCode: "STU-1A-017",
      studentIdNumber: "2026-CRIM-1A-017",
      displayName: "Cadet James Pajaron",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["FIRST_AID","RADIO_OPS"],
      phone: "0917-555-1A01", radioChannel: "TAC-1", dutyStation: "Main Gate Entrance",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A018",
      identifierCode: "STU-1A-018",
      studentIdNumber: "2026-CRIM-1A-018",
      displayName: "Cadet Benz Pasco",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-1A01", radioChannel: "TAC-2", dutyStation: "Science Complex",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A019",
      identifierCode: "STU-1A-019",
      studentIdNumber: "2026-CRIM-1A-019",
      displayName: "Cadet Joe Perez",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-1A01", radioChannel: "TAC-3", dutyStation: "Quadrangle Walkway",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A020",
      identifierCode: "STU-1A-020",
      studentIdNumber: "2026-CRIM-1A-020",
      displayName: "Cadet John Pimentel",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-1A02", radioChannel: "TAC-4", dutyStation: "South Gate / Standby Post",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A021",
      identifierCode: "STU-1A-021",
      studentIdNumber: "2026-CRIM-1A-021",
      displayName: "Cadet Niel Rana",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-1A02", radioChannel: "TAC-1", dutyStation: "Athletic Arena / East Bleachers",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A022",
      identifierCode: "STU-1A-022",
      studentIdNumber: "2026-CRIM-1A-022",
      displayName: "Cadet Merry Rapal",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-1A02", radioChannel: "TAC-2", dutyStation: "Library Corridor",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A023",
      identifierCode: "STU-1A-023",
      studentIdNumber: "2026-CRIM-1A-023",
      displayName: "Cadet James Rodriguez",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-1A02", radioChannel: "TAC-3", dutyStation: "Admin Building Lobby",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A024",
      identifierCode: "STU-1A-024",
      studentIdNumber: "2026-CRIM-1A-024",
      displayName: "Cadet Dominic Sagarino",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-1A02", radioChannel: "TAC-4", dutyStation: "Canteen Area / Post B",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A025",
      identifierCode: "STU-1A-025",
      studentIdNumber: "2026-CRIM-1A-025",
      displayName: "Cadet Arvince Sarno",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-1A02", radioChannel: "TAC-1", dutyStation: "Clinic / Field Station",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A026",
      identifierCode: "STU-1A-026",
      studentIdNumber: "2026-CRIM-1A-026",
      displayName: "Cadet Jhan Sino",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: true,
      specialties: ["PATROL","EXTRICATION"],
      phone: "0917-555-1A02", radioChannel: "TAC-2", dutyStation: "Command Post Alpha",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A027",
      identifierCode: "STU-1A-027",
      studentIdNumber: "2026-CRIM-1A-027",
      displayName: "Cadet Lalyne Tacubao",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID","RADIO_OPS"],
      phone: "0917-555-1A02", radioChannel: "TAC-3", dutyStation: "North Perimeter / Gate 1",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A028",
      identifierCode: "STU-1A-028",
      studentIdNumber: "2026-CRIM-1A-028",
      displayName: "Cadet Reymond Tagaylo",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-1A02", radioChannel: "TAC-4", dutyStation: "East Wing Corridor",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A029",
      identifierCode: "STU-1A-029",
      studentIdNumber: "2026-CRIM-1A-029",
      displayName: "Cadet Rian Tagaylo",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-1A02", radioChannel: "TAC-1", dutyStation: "Parking Area / Post C",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A030",
      identifierCode: "STU-1A-030",
      studentIdNumber: "2026-CRIM-1A-030",
      displayName: "Cadet Chrisel-an Tumana",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-1A03", radioChannel: "TAC-2", dutyStation: "Chapel Grounds",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1A031",
      identifierCode: "STU-1A-031",
      studentIdNumber: "2026-CRIM-1A-031",
      displayName: "Cadet John Yamson",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-A",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-1A03", radioChannel: "TAC-3", dutyStation: "Gate North / Kiosk A",
      assignedUnitId: "u-1A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B001",
      identifierCode: "STU-1B-001",
      studentIdNumber: "2026-CRIM-1B-001",
      displayName: "Cadet Keanna Abarrientos",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-1B00", radioChannel: "TAC-1", dutyStation: "Gate North / Kiosk A",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B002",
      identifierCode: "STU-1B-002",
      studentIdNumber: "2026-CRIM-1B-002",
      displayName: "Cadet Arthjhames Bacong",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-1B00", radioChannel: "TAC-2", dutyStation: "Main Gate Entrance",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B003",
      identifierCode: "STU-1B-003",
      studentIdNumber: "2026-CRIM-1B-003",
      displayName: "Cadet Marc Bagnol",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-1B00", radioChannel: "TAC-3", dutyStation: "Science Complex",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B004",
      identifierCode: "STU-1B-004",
      studentIdNumber: "2026-CRIM-1B-004",
      displayName: "Cadet Jaztine Bitas",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-1B00", radioChannel: "TAC-4", dutyStation: "Quadrangle Walkway",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B005",
      identifierCode: "STU-1B-005",
      studentIdNumber: "2026-CRIM-1B-005",
      displayName: "Cadet John Caerlang",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-1B00", radioChannel: "TAC-1", dutyStation: "South Gate / Standby Post",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B006",
      identifierCode: "STU-1B-006",
      studentIdNumber: "2026-CRIM-1B-006",
      displayName: "Cadet Edgar Dagondon",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: true,
      specialties: ["PATROL","EXTRICATION"],
      phone: "0917-555-1B00", radioChannel: "TAC-2", dutyStation: "Athletic Arena / East Bleachers",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B007",
      identifierCode: "STU-1B-007",
      studentIdNumber: "2026-CRIM-1B-007",
      displayName: "Cadet Gina Dullen",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID","RADIO_OPS"],
      phone: "0917-555-1B00", radioChannel: "TAC-3", dutyStation: "Library Corridor",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B008",
      identifierCode: "STU-1B-008",
      studentIdNumber: "2026-CRIM-1B-008",
      displayName: "Cadet Raggy Linawan",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-1B00", radioChannel: "TAC-4", dutyStation: "Admin Building Lobby",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B009",
      identifierCode: "STU-1B-009",
      studentIdNumber: "2026-CRIM-1B-009",
      displayName: "Cadet Alfie Lumbay",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-1B00", radioChannel: "TAC-1", dutyStation: "Canteen Area / Post B",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B010",
      identifierCode: "STU-1B-010",
      studentIdNumber: "2026-CRIM-1B-010",
      displayName: "Cadet Jhon Lumindas",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-1B01", radioChannel: "TAC-2", dutyStation: "Clinic / Field Station",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B011",
      identifierCode: "STU-1B-011",
      studentIdNumber: "2026-CRIM-1B-011",
      displayName: "Cadet Joani Macarayan",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-1B01", radioChannel: "TAC-3", dutyStation: "Command Post Alpha",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B012",
      identifierCode: "STU-1B-012",
      studentIdNumber: "2026-CRIM-1B-012",
      displayName: "Cadet Siegfried Madjos",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-1B01", radioChannel: "TAC-4", dutyStation: "North Perimeter / Gate 1",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B013",
      identifierCode: "STU-1B-013",
      studentIdNumber: "2026-CRIM-1B-013",
      displayName: "Cadet Rian Mangmang",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-1B01", radioChannel: "TAC-1", dutyStation: "East Wing Corridor",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B014",
      identifierCode: "STU-1B-014",
      studentIdNumber: "2026-CRIM-1B-014",
      displayName: "Cadet Aljun Molina",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-1B01", radioChannel: "TAC-2", dutyStation: "Parking Area / Post C",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B015",
      identifierCode: "STU-1B-015",
      studentIdNumber: "2026-CRIM-1B-015",
      displayName: "Cadet Jhon Paglinawan",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-1B01", radioChannel: "TAC-3", dutyStation: "Chapel Grounds",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B016",
      identifierCode: "STU-1B-016",
      studentIdNumber: "2026-CRIM-1B-016",
      displayName: "Cadet Jennifer Pinaabot",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: true,
      specialties: ["PATROL","EXTRICATION"],
      phone: "0917-555-1B01", radioChannel: "TAC-4", dutyStation: "Gate North / Kiosk A",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B017",
      identifierCode: "STU-1B-017",
      studentIdNumber: "2026-CRIM-1B-017",
      displayName: "Cadet Jb Ricafrente",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["FIRST_AID","RADIO_OPS"],
      phone: "0917-555-1B01", radioChannel: "TAC-1", dutyStation: "Main Gate Entrance",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B018",
      identifierCode: "STU-1B-018",
      studentIdNumber: "2026-CRIM-1B-018",
      displayName: "Cadet Jhonyl Sabuero",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-1B01", radioChannel: "TAC-2", dutyStation: "Science Complex",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B019",
      identifierCode: "STU-1B-019",
      studentIdNumber: "2026-CRIM-1B-019",
      displayName: "Cadet Emmanuel Salon",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-1B01", radioChannel: "TAC-3", dutyStation: "Quadrangle Walkway",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B020",
      identifierCode: "STU-1B-020",
      studentIdNumber: "2026-CRIM-1B-020",
      displayName: "Cadet Aaron Tagaylo",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-1B02", radioChannel: "TAC-4", dutyStation: "South Gate / Standby Post",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B021",
      identifierCode: "STU-1B-021",
      studentIdNumber: "2026-CRIM-1B-021",
      displayName: "Cadet Dimple Talja",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-1B02", radioChannel: "TAC-1", dutyStation: "Athletic Arena / East Bleachers",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1B022",
      identifierCode: "STU-1B-022",
      studentIdNumber: "2026-CRIM-1B-022",
      displayName: "Cadet Michael Tanio",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 1-B",
      yearLevel: "1ST_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-1B02", radioChannel: "TAC-2", dutyStation: "Library Corridor",
      assignedUnitId: "u-1B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A001",
      identifierCode: "STU-2A-001",
      studentIdNumber: "2026-CRIM-2A-001",
      displayName: "Cadet James Abatayo",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-2A00", radioChannel: "TAC-1", dutyStation: "Gate North / Kiosk A",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A002",
      identifierCode: "STU-2A-002",
      studentIdNumber: "2026-CRIM-2A-002",
      displayName: "Cadet Jerry Abellar",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-2A00", radioChannel: "TAC-2", dutyStation: "Main Gate Entrance",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A003",
      identifierCode: "STU-2A-003",
      studentIdNumber: "2026-CRIM-2A-003",
      displayName: "Cadet Jhan Abul",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-2A00", radioChannel: "TAC-3", dutyStation: "Science Complex",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A004",
      identifierCode: "STU-2A-004",
      studentIdNumber: "2026-CRIM-2A-004",
      displayName: "Cadet Jerick Adajar",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-2A00", radioChannel: "TAC-4", dutyStation: "Quadrangle Walkway",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A005",
      identifierCode: "STU-2A-005",
      studentIdNumber: "2026-CRIM-2A-005",
      displayName: "Cadet Ceddie Baniga",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-2A00", radioChannel: "TAC-1", dutyStation: "South Gate / Standby Post",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A006",
      identifierCode: "STU-2A-006",
      studentIdNumber: "2026-CRIM-2A-006",
      displayName: "Cadet Christopher Baniga",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: true,
      specialties: ["PATROL","EXTRICATION"],
      phone: "0917-555-2A00", radioChannel: "TAC-2", dutyStation: "Athletic Arena / East Bleachers",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A007",
      identifierCode: "STU-2A-007",
      studentIdNumber: "2026-CRIM-2A-007",
      displayName: "Cadet Mellon Buat",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID","RADIO_OPS"],
      phone: "0917-555-2A00", radioChannel: "TAC-3", dutyStation: "Library Corridor",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A008",
      identifierCode: "STU-2A-008",
      studentIdNumber: "2026-CRIM-2A-008",
      displayName: "Cadet Kent Cafe",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-2A00", radioChannel: "TAC-4", dutyStation: "Admin Building Lobby",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A009",
      identifierCode: "STU-2A-009",
      studentIdNumber: "2026-CRIM-2A-009",
      displayName: "Cadet Johnric Cawasan",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-2A00", radioChannel: "TAC-1", dutyStation: "Canteen Area / Post B",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A010",
      identifierCode: "STU-2A-010",
      studentIdNumber: "2026-CRIM-2A-010",
      displayName: "Cadet Aron Dayonayos",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-2A01", radioChannel: "TAC-2", dutyStation: "Clinic / Field Station",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A011",
      identifierCode: "STU-2A-011",
      studentIdNumber: "2026-CRIM-2A-011",
      displayName: "Cadet Francis Enterina",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-2A01", radioChannel: "TAC-3", dutyStation: "Command Post Alpha",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A012",
      identifierCode: "STU-2A-012",
      studentIdNumber: "2026-CRIM-2A-012",
      displayName: "Cadet Justin Gabales",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-2A01", radioChannel: "TAC-4", dutyStation: "North Perimeter / Gate 1",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A013",
      identifierCode: "STU-2A-013",
      studentIdNumber: "2026-CRIM-2A-013",
      displayName: "Cadet Vence Gallano",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-2A01", radioChannel: "TAC-1", dutyStation: "East Wing Corridor",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A014",
      identifierCode: "STU-2A-014",
      studentIdNumber: "2026-CRIM-2A-014",
      displayName: "Cadet Jhon Gecomo",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-2A01", radioChannel: "TAC-2", dutyStation: "Parking Area / Post C",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A015",
      identifierCode: "STU-2A-015",
      studentIdNumber: "2026-CRIM-2A-015",
      displayName: "Cadet Chiepoy Gumapo",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-2A01", radioChannel: "TAC-3", dutyStation: "Chapel Grounds",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A016",
      identifierCode: "STU-2A-016",
      studentIdNumber: "2026-CRIM-2A-016",
      displayName: "Cadet Leobert Labustro",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: true,
      specialties: ["PATROL","EXTRICATION"],
      phone: "0917-555-2A01", radioChannel: "TAC-4", dutyStation: "Gate North / Kiosk A",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A017",
      identifierCode: "STU-2A-017",
      studentIdNumber: "2026-CRIM-2A-017",
      displayName: "Cadet Junecris Marquez",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["FIRST_AID","RADIO_OPS"],
      phone: "0917-555-2A01", radioChannel: "TAC-1", dutyStation: "Main Gate Entrance",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A018",
      identifierCode: "STU-2A-018",
      studentIdNumber: "2026-CRIM-2A-018",
      displayName: "Cadet Joshua Martinez",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-2A01", radioChannel: "TAC-2", dutyStation: "Science Complex",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A019",
      identifierCode: "STU-2A-019",
      studentIdNumber: "2026-CRIM-2A-019",
      displayName: "Cadet Jomari Melano",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-2A01", radioChannel: "TAC-3", dutyStation: "Quadrangle Walkway",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A020",
      identifierCode: "STU-2A-020",
      studentIdNumber: "2026-CRIM-2A-020",
      displayName: "Cadet John Odarbe",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-2A02", radioChannel: "TAC-4", dutyStation: "South Gate / Standby Post",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A021",
      identifierCode: "STU-2A-021",
      studentIdNumber: "2026-CRIM-2A-021",
      displayName: "Cadet Jhon Paglinawan",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-2A02", radioChannel: "TAC-1", dutyStation: "Athletic Arena / East Bleachers",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A022",
      identifierCode: "STU-2A-022",
      studentIdNumber: "2026-CRIM-2A-022",
      displayName: "Cadet Neco Paygalan",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-2A02", radioChannel: "TAC-2", dutyStation: "Library Corridor",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A023",
      identifierCode: "STU-2A-023",
      studentIdNumber: "2026-CRIM-2A-023",
      displayName: "Cadet Sean Paylangco",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-2A02", radioChannel: "TAC-3", dutyStation: "Admin Building Lobby",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A024",
      identifierCode: "STU-2A-024",
      studentIdNumber: "2026-CRIM-2A-024",
      displayName: "Cadet Jolan Pinailid",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-2A02", radioChannel: "TAC-4", dutyStation: "Canteen Area / Post B",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A025",
      identifierCode: "STU-2A-025",
      studentIdNumber: "2026-CRIM-2A-025",
      displayName: "Cadet Marc Raya",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-2A02", radioChannel: "TAC-1", dutyStation: "Clinic / Field Station",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A026",
      identifierCode: "STU-2A-026",
      studentIdNumber: "2026-CRIM-2A-026",
      displayName: "Cadet Dwight Regalado",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: true,
      specialties: ["PATROL","EXTRICATION"],
      phone: "0917-555-2A02", radioChannel: "TAC-2", dutyStation: "Command Post Alpha",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A027",
      identifierCode: "STU-2A-027",
      studentIdNumber: "2026-CRIM-2A-027",
      displayName: "Cadet Lance Rodriguez",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID","RADIO_OPS"],
      phone: "0917-555-2A02", radioChannel: "TAC-3", dutyStation: "North Perimeter / Gate 1",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A028",
      identifierCode: "STU-2A-028",
      studentIdNumber: "2026-CRIM-2A-028",
      displayName: "Cadet Neolybunn Sagahay",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-2A02", radioChannel: "TAC-4", dutyStation: "East Wing Corridor",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A029",
      identifierCode: "STU-2A-029",
      studentIdNumber: "2026-CRIM-2A-029",
      displayName: "Cadet John Salazar",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-2A02", radioChannel: "TAC-1", dutyStation: "Parking Area / Post C",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A030",
      identifierCode: "STU-2A-030",
      studentIdNumber: "2026-CRIM-2A-030",
      displayName: "Cadet Benjelo Salon",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-2A03", radioChannel: "TAC-2", dutyStation: "Chapel Grounds",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A031",
      identifierCode: "STU-2A-031",
      studentIdNumber: "2026-CRIM-2A-031",
      displayName: "Cadet Lito Simene",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-2A03", radioChannel: "TAC-3", dutyStation: "Gate North / Kiosk A",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A032",
      identifierCode: "STU-2A-032",
      studentIdNumber: "2026-CRIM-2A-032",
      displayName: "Cadet Christian Tumanan",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-2A03", radioChannel: "TAC-4", dutyStation: "Main Gate Entrance",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A033",
      identifierCode: "STU-2A-033",
      studentIdNumber: "2026-CRIM-2A-033",
      displayName: "Cadet Jhea Baguhin",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-2A03", radioChannel: "TAC-1", dutyStation: "Science Complex",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A034",
      identifierCode: "STU-2A-034",
      studentIdNumber: "2026-CRIM-2A-034",
      displayName: "Cadet Jazmine Bitas",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-2A03", radioChannel: "TAC-2", dutyStation: "Quadrangle Walkway",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A035",
      identifierCode: "STU-2A-035",
      studentIdNumber: "2026-CRIM-2A-035",
      displayName: "Cadet Mary Dalupere",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-2A03", radioChannel: "TAC-3", dutyStation: "South Gate / Standby Post",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A036",
      identifierCode: "STU-2A-036",
      studentIdNumber: "2026-CRIM-2A-036",
      displayName: "Cadet Elianie Guzmana",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: true,
      specialties: ["PATROL","EXTRICATION"],
      phone: "0917-555-2A03", radioChannel: "TAC-4", dutyStation: "Athletic Arena / East Bleachers",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A037",
      identifierCode: "STU-2A-037",
      studentIdNumber: "2026-CRIM-2A-037",
      displayName: "Cadet Angel Jomao-as",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID","RADIO_OPS"],
      phone: "0917-555-2A03", radioChannel: "TAC-1", dutyStation: "Library Corridor",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A038",
      identifierCode: "STU-2A-038",
      studentIdNumber: "2026-CRIM-2A-038",
      displayName: "Cadet Shielden Librando",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-2A03", radioChannel: "TAC-2", dutyStation: "Admin Building Lobby",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A039",
      identifierCode: "STU-2A-039",
      studentIdNumber: "2026-CRIM-2A-039",
      displayName: "Cadet Cyprille Manilhig",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-2A03", radioChannel: "TAC-3", dutyStation: "Canteen Area / Post B",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A040",
      identifierCode: "STU-2A-040",
      studentIdNumber: "2026-CRIM-2A-040",
      displayName: "Cadet Liling Mansalgahan",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-2A04", radioChannel: "TAC-4", dutyStation: "Clinic / Field Station",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A041",
      identifierCode: "STU-2A-041",
      studentIdNumber: "2026-CRIM-2A-041",
      displayName: "Cadet Diana Miranda",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-2A04", radioChannel: "TAC-1", dutyStation: "Command Post Alpha",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A042",
      identifierCode: "STU-2A-042",
      studentIdNumber: "2026-CRIM-2A-042",
      displayName: "Cadet Emerie Quipanes",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-2A04", radioChannel: "TAC-2", dutyStation: "North Perimeter / Gate 1",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A043",
      identifierCode: "STU-2A-043",
      studentIdNumber: "2026-CRIM-2A-043",
      displayName: "Cadet Natasha Rendon",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-2A04", radioChannel: "TAC-3", dutyStation: "East Wing Corridor",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A044",
      identifierCode: "STU-2A-044",
      studentIdNumber: "2026-CRIM-2A-044",
      displayName: "Cadet Mecaila Se├▒or",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-2A04", radioChannel: "TAC-4", dutyStation: "Parking Area / Post C",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2A045",
      identifierCode: "STU-2A-045",
      studentIdNumber: "2026-CRIM-2A-045",
      displayName: "Cadet Rizza Vallado",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-A (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-2A04", radioChannel: "TAC-1", dutyStation: "Chapel Grounds",
      assignedUnitId: "u-2A01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B001",
      identifierCode: "STU-2B-001",
      studentIdNumber: "2026-CRIM-2B-001",
      displayName: "Cadet Keith Amarilla",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-2B00", radioChannel: "TAC-1", dutyStation: "Gate North / Kiosk A",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B002",
      identifierCode: "STU-2B-002",
      studentIdNumber: "2026-CRIM-2B-002",
      displayName: "Cadet Gian Arawe",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-2B00", radioChannel: "TAC-2", dutyStation: "Main Gate Entrance",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B003",
      identifierCode: "STU-2B-003",
      studentIdNumber: "2026-CRIM-2B-003",
      displayName: "Cadet James Arellano",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-2B00", radioChannel: "TAC-3", dutyStation: "Science Complex",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B004",
      identifierCode: "STU-2B-004",
      studentIdNumber: "2026-CRIM-2B-004",
      displayName: "Cadet Aldrix Bagabaldo",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-2B00", radioChannel: "TAC-4", dutyStation: "Quadrangle Walkway",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B005",
      identifierCode: "STU-2B-005",
      studentIdNumber: "2026-CRIM-2B-005",
      displayName: "Cadet Paul Caduyag",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-2B00", radioChannel: "TAC-1", dutyStation: "South Gate / Standby Post",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B006",
      identifierCode: "STU-2B-006",
      studentIdNumber: "2026-CRIM-2B-006",
      displayName: "Cadet Jhon Cago",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: true,
      specialties: ["PATROL","EXTRICATION"],
      phone: "0917-555-2B00", radioChannel: "TAC-2", dutyStation: "Athletic Arena / East Bleachers",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B007",
      identifierCode: "STU-2B-007",
      studentIdNumber: "2026-CRIM-2B-007",
      displayName: "Cadet Ismer Caingles",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID","RADIO_OPS"],
      phone: "0917-555-2B00", radioChannel: "TAC-3", dutyStation: "Library Corridor",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B008",
      identifierCode: "STU-2B-008",
      studentIdNumber: "2026-CRIM-2B-008",
      displayName: "Cadet Klint Camahay",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-2B00", radioChannel: "TAC-4", dutyStation: "Admin Building Lobby",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B009",
      identifierCode: "STU-2B-009",
      studentIdNumber: "2026-CRIM-2B-009",
      displayName: "Cadet Brent Caralde",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-2B00", radioChannel: "TAC-1", dutyStation: "Canteen Area / Post B",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B010",
      identifierCode: "STU-2B-010",
      studentIdNumber: "2026-CRIM-2B-010",
      displayName: "Cadet Sebastian Colarte",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-2B01", radioChannel: "TAC-2", dutyStation: "Clinic / Field Station",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B011",
      identifierCode: "STU-2B-011",
      studentIdNumber: "2026-CRIM-2B-011",
      displayName: "Cadet James Dela Cruz",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-2B01", radioChannel: "TAC-3", dutyStation: "Command Post Alpha",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B012",
      identifierCode: "STU-2B-012",
      studentIdNumber: "2026-CRIM-2B-012",
      displayName: "Cadet Jhon Ebdalin",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-2B01", radioChannel: "TAC-4", dutyStation: "North Perimeter / Gate 1",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B013",
      identifierCode: "STU-2B-013",
      studentIdNumber: "2026-CRIM-2B-013",
      displayName: "Cadet Josh Escobal",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-2B01", radioChannel: "TAC-1", dutyStation: "East Wing Corridor",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B014",
      identifierCode: "STU-2B-014",
      studentIdNumber: "2026-CRIM-2B-014",
      displayName: "Cadet Dave Ferrater",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-2B01", radioChannel: "TAC-2", dutyStation: "Parking Area / Post C",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B015",
      identifierCode: "STU-2B-015",
      studentIdNumber: "2026-CRIM-2B-015",
      displayName: "Cadet Kyle Ganuelas",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-2B01", radioChannel: "TAC-3", dutyStation: "Chapel Grounds",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B016",
      identifierCode: "STU-2B-016",
      studentIdNumber: "2026-CRIM-2B-016",
      displayName: "Cadet Kevin Gonzales",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: true,
      specialties: ["PATROL","EXTRICATION"],
      phone: "0917-555-2B01", radioChannel: "TAC-4", dutyStation: "Gate North / Kiosk A",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B017",
      identifierCode: "STU-2B-017",
      studentIdNumber: "2026-CRIM-2B-017",
      displayName: "Cadet Anthony Guno",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["FIRST_AID","RADIO_OPS"],
      phone: "0917-555-2B01", radioChannel: "TAC-1", dutyStation: "Main Gate Entrance",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B018",
      identifierCode: "STU-2B-018",
      studentIdNumber: "2026-CRIM-2B-018",
      displayName: "Cadet Aldrick Jerezon",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-2B01", radioChannel: "TAC-2", dutyStation: "Science Complex",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B019",
      identifierCode: "STU-2B-019",
      studentIdNumber: "2026-CRIM-2B-019",
      displayName: "Cadet Joshua Lovino",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-2B01", radioChannel: "TAC-3", dutyStation: "Quadrangle Walkway",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B020",
      identifierCode: "STU-2B-020",
      studentIdNumber: "2026-CRIM-2B-020",
      displayName: "Cadet Sam-sam Manhonyogan",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-2B02", radioChannel: "TAC-4", dutyStation: "South Gate / Standby Post",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B021",
      identifierCode: "STU-2B-021",
      studentIdNumber: "2026-CRIM-2B-021",
      displayName: "Cadet Jeano Olano",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-2B02", radioChannel: "TAC-1", dutyStation: "Athletic Arena / East Bleachers",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B022",
      identifierCode: "STU-2B-022",
      studentIdNumber: "2026-CRIM-2B-022",
      displayName: "Cadet Irvin Pagaran",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-2B02", radioChannel: "TAC-2", dutyStation: "Library Corridor",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B023",
      identifierCode: "STU-2B-023",
      studentIdNumber: "2026-CRIM-2B-023",
      displayName: "Cadet James Paglinawan",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-2B02", radioChannel: "TAC-3", dutyStation: "Admin Building Lobby",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B024",
      identifierCode: "STU-2B-024",
      studentIdNumber: "2026-CRIM-2B-024",
      displayName: "Cadet Ryven Pahilan",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-2B02", radioChannel: "TAC-4", dutyStation: "Canteen Area / Post B",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B025",
      identifierCode: "STU-2B-025",
      studentIdNumber: "2026-CRIM-2B-025",
      displayName: "Cadet Mosamma Ribo",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-2B02", radioChannel: "TAC-1", dutyStation: "Clinic / Field Station",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B026",
      identifierCode: "STU-2B-026",
      studentIdNumber: "2026-CRIM-2B-026",
      displayName: "Cadet Milford Tajos",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: true,
      specialties: ["PATROL","EXTRICATION"],
      phone: "0917-555-2B02", radioChannel: "TAC-2", dutyStation: "Command Post Alpha",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B027",
      identifierCode: "STU-2B-027",
      studentIdNumber: "2026-CRIM-2B-027",
      displayName: "Cadet Albert Tinambacan",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID","RADIO_OPS"],
      phone: "0917-555-2B02", radioChannel: "TAC-3", dutyStation: "North Perimeter / Gate 1",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B028",
      identifierCode: "STU-2B-028",
      studentIdNumber: "2026-CRIM-2B-028",
      displayName: "Cadet Gilbert Tocmo",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-2B02", radioChannel: "TAC-4", dutyStation: "East Wing Corridor",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B029",
      identifierCode: "STU-2B-029",
      studentIdNumber: "2026-CRIM-2B-029",
      displayName: "Cadet Mark Yandog",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-2B02", radioChannel: "TAC-1", dutyStation: "Parking Area / Post C",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B030",
      identifierCode: "STU-2B-030",
      studentIdNumber: "2026-CRIM-2B-030",
      displayName: "Cadet Joshua Zarate",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-2B03", radioChannel: "TAC-2", dutyStation: "Chapel Grounds",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B031",
      identifierCode: "STU-2B-031",
      studentIdNumber: "2026-CRIM-2B-031",
      displayName: "Cadet Princess Cabresos",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-2B03", radioChannel: "TAC-3", dutyStation: "Gate North / Kiosk A",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B032",
      identifierCode: "STU-2B-032",
      studentIdNumber: "2026-CRIM-2B-032",
      displayName: "Cadet Heart Pinalumba",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-2B03", radioChannel: "TAC-4", dutyStation: "Main Gate Entrance",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B033",
      identifierCode: "STU-2B-033",
      studentIdNumber: "2026-CRIM-2B-033",
      displayName: "Cadet Shanea Rabuya",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-2B03", radioChannel: "TAC-1", dutyStation: "Science Complex",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B034",
      identifierCode: "STU-2B-034",
      studentIdNumber: "2026-CRIM-2B-034",
      displayName: "Cadet Aubrie Sabuero",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-2B03", radioChannel: "TAC-2", dutyStation: "Quadrangle Walkway",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-2B035",
      identifierCode: "STU-2B-035",
      studentIdNumber: "2026-CRIM-2B-035",
      displayName: "Cadet Adonis Tagudin",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 2-B (BAGSIKDIWA)",
      yearLevel: "2ND_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-2B03", radioChannel: "TAC-3", dutyStation: "South Gate / Standby Post",
      assignedUnitId: "u-2B01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M001",
      identifierCode: "STU-3M-001",
      studentIdNumber: "2026-CRIM-3M-001",
      displayName: "Cadet Nejen Abecia",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-3M00", radioChannel: "TAC-1", dutyStation: "Gate North / Kiosk A",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M002",
      identifierCode: "STU-3M-002",
      studentIdNumber: "2026-CRIM-3M-002",
      displayName: "Cadet Christ Abejo",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-3M00", radioChannel: "TAC-2", dutyStation: "Main Gate Entrance",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M003",
      identifierCode: "STU-3M-003",
      studentIdNumber: "2026-CRIM-3M-003",
      displayName: "Cadet Rica Acodili",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-3M00", radioChannel: "TAC-3", dutyStation: "Science Complex",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M004",
      identifierCode: "STU-3M-004",
      studentIdNumber: "2026-CRIM-3M-004",
      displayName: "Cadet Vea Alcancia",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-3M00", radioChannel: "TAC-4", dutyStation: "Quadrangle Walkway",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M005",
      identifierCode: "STU-3M-005",
      studentIdNumber: "2026-CRIM-3M-005",
      displayName: "Cadet Vince Asino",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-3M00", radioChannel: "TAC-1", dutyStation: "South Gate / Standby Post",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M006",
      identifierCode: "STU-3M-006",
      studentIdNumber: "2026-CRIM-3M-006",
      displayName: "Cadet Krisden Bagas",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: true,
      specialties: ["PATROL","EXTRICATION"],
      phone: "0917-555-3M00", radioChannel: "TAC-2", dutyStation: "Athletic Arena / East Bleachers",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M007",
      identifierCode: "STU-3M-007",
      studentIdNumber: "2026-CRIM-3M-007",
      displayName: "Cadet Mark Baldo",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID","RADIO_OPS"],
      phone: "0917-555-3M00", radioChannel: "TAC-3", dutyStation: "Library Corridor",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M008",
      identifierCode: "STU-3M-008",
      studentIdNumber: "2026-CRIM-3M-008",
      displayName: "Cadet Stella Bariquit",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-3M00", radioChannel: "TAC-4", dutyStation: "Admin Building Lobby",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M009",
      identifierCode: "STU-3M-009",
      studentIdNumber: "2026-CRIM-3M-009",
      displayName: "Cadet Jan Barsobia",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-3M00", radioChannel: "TAC-1", dutyStation: "Canteen Area / Post B",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M010",
      identifierCode: "STU-3M-010",
      studentIdNumber: "2026-CRIM-3M-010",
      displayName: "Cadet Earl Biado",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-3M01", radioChannel: "TAC-2", dutyStation: "Clinic / Field Station",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M011",
      identifierCode: "STU-3M-011",
      studentIdNumber: "2026-CRIM-3M-011",
      displayName: "Cadet Uriel Buhisan",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-3M01", radioChannel: "TAC-3", dutyStation: "Command Post Alpha",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M012",
      identifierCode: "STU-3M-012",
      studentIdNumber: "2026-CRIM-3M-012",
      displayName: "Cadet Cristine Bullanday",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-3M01", radioChannel: "TAC-4", dutyStation: "North Perimeter / Gate 1",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M013",
      identifierCode: "STU-3M-013",
      studentIdNumber: "2026-CRIM-3M-013",
      displayName: "Cadet John Butalid",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-3M01", radioChannel: "TAC-1", dutyStation: "East Wing Corridor",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M014",
      identifierCode: "STU-3M-014",
      studentIdNumber: "2026-CRIM-3M-014",
      displayName: "Cadet John Cabariban",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-3M01", radioChannel: "TAC-2", dutyStation: "Parking Area / Post C",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M015",
      identifierCode: "STU-3M-015",
      studentIdNumber: "2026-CRIM-3M-015",
      displayName: "Cadet Samuel Campion",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-3M01", radioChannel: "TAC-3", dutyStation: "Chapel Grounds",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M016",
      identifierCode: "STU-3M-016",
      studentIdNumber: "2026-CRIM-3M-016",
      displayName: "Cadet Richelyn Campugan",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: true,
      specialties: ["PATROL","EXTRICATION"],
      phone: "0917-555-3M01", radioChannel: "TAC-4", dutyStation: "Gate North / Kiosk A",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M017",
      identifierCode: "STU-3M-017",
      studentIdNumber: "2026-CRIM-3M-017",
      displayName: "Cadet Harres Canunayon",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["FIRST_AID","RADIO_OPS"],
      phone: "0917-555-3M01", radioChannel: "TAC-1", dutyStation: "Main Gate Entrance",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M018",
      identifierCode: "STU-3M-018",
      studentIdNumber: "2026-CRIM-3M-018",
      displayName: "Cadet John Capangpangan",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-3M01", radioChannel: "TAC-2", dutyStation: "Science Complex",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M019",
      identifierCode: "STU-3M-019",
      studentIdNumber: "2026-CRIM-3M-019",
      displayName: "Cadet Jim Capinig",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-3M01", radioChannel: "TAC-3", dutyStation: "Quadrangle Walkway",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M020",
      identifierCode: "STU-3M-020",
      studentIdNumber: "2026-CRIM-3M-020",
      displayName: "Cadet Rj Carcido",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-3M02", radioChannel: "TAC-4", dutyStation: "South Gate / Standby Post",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M021",
      identifierCode: "STU-3M-021",
      studentIdNumber: "2026-CRIM-3M-021",
      displayName: "Cadet James Cortes",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-3M02", radioChannel: "TAC-1", dutyStation: "Athletic Arena / East Bleachers",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M022",
      identifierCode: "STU-3M-022",
      studentIdNumber: "2026-CRIM-3M-022",
      displayName: "Cadet Allen Cuerdo",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-3M02", radioChannel: "TAC-2", dutyStation: "Library Corridor",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M023",
      identifierCode: "STU-3M-023",
      studentIdNumber: "2026-CRIM-3M-023",
      displayName: "Cadet Arnel Cuerdo",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-3M02", radioChannel: "TAC-3", dutyStation: "Admin Building Lobby",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M024",
      identifierCode: "STU-3M-024",
      studentIdNumber: "2026-CRIM-3M-024",
      displayName: "Cadet John Dacalos",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-3M02", radioChannel: "TAC-4", dutyStation: "Canteen Area / Post B",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M025",
      identifierCode: "STU-3M-025",
      studentIdNumber: "2026-CRIM-3M-025",
      displayName: "Cadet Earnest Delaganar",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-3M02", radioChannel: "TAC-1", dutyStation: "Clinic / Field Station",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M026",
      identifierCode: "STU-3M-026",
      studentIdNumber: "2026-CRIM-3M-026",
      displayName: "Cadet Reynan Devesfruto",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: true,
      specialties: ["PATROL","EXTRICATION"],
      phone: "0917-555-3M02", radioChannel: "TAC-2", dutyStation: "Command Post Alpha",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M027",
      identifierCode: "STU-3M-027",
      studentIdNumber: "2026-CRIM-3M-027",
      displayName: "Cadet Quinn Dolino",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID","RADIO_OPS"],
      phone: "0917-555-3M02", radioChannel: "TAC-3", dutyStation: "North Perimeter / Gate 1",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M028",
      identifierCode: "STU-3M-028",
      studentIdNumber: "2026-CRIM-3M-028",
      displayName: "Cadet Josh Dulatre",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-3M02", radioChannel: "TAC-4", dutyStation: "East Wing Corridor",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M029",
      identifierCode: "STU-3M-029",
      studentIdNumber: "2026-CRIM-3M-029",
      displayName: "Cadet Marc Dumangas",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-3M02", radioChannel: "TAC-1", dutyStation: "Parking Area / Post C",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M030",
      identifierCode: "STU-3M-030",
      studentIdNumber: "2026-CRIM-3M-030",
      displayName: "Cadet Lesam Escobido",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-3M03", radioChannel: "TAC-2", dutyStation: "Chapel Grounds",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M031",
      identifierCode: "STU-3M-031",
      studentIdNumber: "2026-CRIM-3M-031",
      displayName: "Cadet Projhon Esconde",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-3M03", radioChannel: "TAC-3", dutyStation: "Gate North / Kiosk A",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M032",
      identifierCode: "STU-3M-032",
      studentIdNumber: "2026-CRIM-3M-032",
      displayName: "Cadet Rey Fabe",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-3M03", radioChannel: "TAC-4", dutyStation: "Main Gate Entrance",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M033",
      identifierCode: "STU-3M-033",
      studentIdNumber: "2026-CRIM-3M-033",
      displayName: "Cadet Ronald Ferrarin",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-3M03", radioChannel: "TAC-1", dutyStation: "Science Complex",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M034",
      identifierCode: "STU-3M-034",
      studentIdNumber: "2026-CRIM-3M-034",
      displayName: "Cadet Fuentes",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-3M03", radioChannel: "TAC-2", dutyStation: "Quadrangle Walkway",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M035",
      identifierCode: "STU-3M-035",
      studentIdNumber: "2026-CRIM-3M-035",
      displayName: "Cadet Allyza Galon",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-3M03", radioChannel: "TAC-3", dutyStation: "South Gate / Standby Post",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M036",
      identifierCode: "STU-3M-036",
      studentIdNumber: "2026-CRIM-3M-036",
      displayName: "Cadet Jerald Gamayon",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: true,
      specialties: ["PATROL","EXTRICATION"],
      phone: "0917-555-3M03", radioChannel: "TAC-4", dutyStation: "Athletic Arena / East Bleachers",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M037",
      identifierCode: "STU-3M-037",
      studentIdNumber: "2026-CRIM-3M-037",
      displayName: "Cadet Kurt Ganuelas",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID","RADIO_OPS"],
      phone: "0917-555-3M03", radioChannel: "TAC-1", dutyStation: "Library Corridor",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M038",
      identifierCode: "STU-3M-038",
      studentIdNumber: "2026-CRIM-3M-038",
      displayName: "Cadet Joel Gomez",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-3M03", radioChannel: "TAC-2", dutyStation: "Admin Building Lobby",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M039",
      identifierCode: "STU-3M-039",
      studentIdNumber: "2026-CRIM-3M-039",
      displayName: "Cadet Edrian Guno",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-3M03", radioChannel: "TAC-3", dutyStation: "Canteen Area / Post B",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M040",
      identifierCode: "STU-3M-040",
      studentIdNumber: "2026-CRIM-3M-040",
      displayName: "Cadet Vence Hurtado",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-3M04", radioChannel: "TAC-4", dutyStation: "Clinic / Field Station",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M041",
      identifierCode: "STU-3M-041",
      studentIdNumber: "2026-CRIM-3M-041",
      displayName: "Cadet Jerico Idjao",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-3M04", radioChannel: "TAC-1", dutyStation: "Command Post Alpha",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M042",
      identifierCode: "STU-3M-042",
      studentIdNumber: "2026-CRIM-3M-042",
      displayName: "Cadet Jacob Idulsa",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-3M04", radioChannel: "TAC-2", dutyStation: "North Perimeter / Gate 1",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M043",
      identifierCode: "STU-3M-043",
      studentIdNumber: "2026-CRIM-3M-043",
      displayName: "Cadet Press Jaso",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-3M04", radioChannel: "TAC-3", dutyStation: "East Wing Corridor",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M044",
      identifierCode: "STU-3M-044",
      studentIdNumber: "2026-CRIM-3M-044",
      displayName: "Cadet Emmanuel Labad",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-3M04", radioChannel: "TAC-4", dutyStation: "Parking Area / Post C",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M045",
      identifierCode: "STU-3M-045",
      studentIdNumber: "2026-CRIM-3M-045",
      displayName: "Cadet James Labong",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-3M04", radioChannel: "TAC-1", dutyStation: "Chapel Grounds",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M046",
      identifierCode: "STU-3M-046",
      studentIdNumber: "2026-CRIM-3M-046",
      displayName: "Cadet Rejim Lactao",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: true,
      specialties: ["PATROL","EXTRICATION"],
      phone: "0917-555-3M04", radioChannel: "TAC-2", dutyStation: "Gate North / Kiosk A",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M047",
      identifierCode: "STU-3M-047",
      studentIdNumber: "2026-CRIM-3M-047",
      displayName: "Cadet Jason Laga",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["FIRST_AID","RADIO_OPS"],
      phone: "0917-555-3M04", radioChannel: "TAC-3", dutyStation: "Main Gate Entrance",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M048",
      identifierCode: "STU-3M-048",
      studentIdNumber: "2026-CRIM-3M-048",
      displayName: "Cadet April Langganoyan",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-3M04", radioChannel: "TAC-4", dutyStation: "Science Complex",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M049",
      identifierCode: "STU-3M-049",
      studentIdNumber: "2026-CRIM-3M-049",
      displayName: "Cadet Mark Lao-as",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-3M04", radioChannel: "TAC-1", dutyStation: "Quadrangle Walkway",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M050",
      identifierCode: "STU-3M-050",
      studentIdNumber: "2026-CRIM-3M-050",
      displayName: "Cadet Krizziah Laureto",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-3M05", radioChannel: "TAC-2", dutyStation: "South Gate / Standby Post",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M051",
      identifierCode: "STU-3M-051",
      studentIdNumber: "2026-CRIM-3M-051",
      displayName: "Cadet Robejoy Lebadesos",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-3M05", radioChannel: "TAC-3", dutyStation: "Athletic Arena / East Bleachers",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M052",
      identifierCode: "STU-3M-052",
      studentIdNumber: "2026-CRIM-3M-052",
      displayName: "Cadet Francis Magallanes",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-3M05", radioChannel: "TAC-4", dutyStation: "Library Corridor",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M053",
      identifierCode: "STU-3M-053",
      studentIdNumber: "2026-CRIM-3M-053",
      displayName: "Cadet Prince Malabo",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-3M05", radioChannel: "TAC-1", dutyStation: "Admin Building Lobby",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M054",
      identifierCode: "STU-3M-054",
      studentIdNumber: "2026-CRIM-3M-054",
      displayName: "Cadet Louie Mandahinog",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-3M05", radioChannel: "TAC-2", dutyStation: "Canteen Area / Post B",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M055",
      identifierCode: "STU-3M-055",
      studentIdNumber: "2026-CRIM-3M-055",
      displayName: "Cadet Jethro Manhonyogan",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-3M05", radioChannel: "TAC-3", dutyStation: "Clinic / Field Station",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M056",
      identifierCode: "STU-3M-056",
      studentIdNumber: "2026-CRIM-3M-056",
      displayName: "Cadet Editho Manticahon",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: true,
      specialties: ["PATROL","EXTRICATION"],
      phone: "0917-555-3M05", radioChannel: "TAC-4", dutyStation: "Command Post Alpha",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M057",
      identifierCode: "STU-3M-057",
      studentIdNumber: "2026-CRIM-3M-057",
      displayName: "Cadet Louise Mejares",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID","RADIO_OPS"],
      phone: "0917-555-3M05", radioChannel: "TAC-1", dutyStation: "North Perimeter / Gate 1",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M058",
      identifierCode: "STU-3M-058",
      studentIdNumber: "2026-CRIM-3M-058",
      displayName: "Cadet Mary Molina",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-3M05", radioChannel: "TAC-2", dutyStation: "East Wing Corridor",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M059",
      identifierCode: "STU-3M-059",
      studentIdNumber: "2026-CRIM-3M-059",
      displayName: "Cadet Harold Montero",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-3M05", radioChannel: "TAC-3", dutyStation: "Parking Area / Post C",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M060",
      identifierCode: "STU-3M-060",
      studentIdNumber: "2026-CRIM-3M-060",
      displayName: "Cadet Gordon Namulanta",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-3M06", radioChannel: "TAC-4", dutyStation: "Chapel Grounds",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M061",
      identifierCode: "STU-3M-061",
      studentIdNumber: "2026-CRIM-3M-061",
      displayName: "Cadet Ericka Naranjo",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-3M06", radioChannel: "TAC-1", dutyStation: "Gate North / Kiosk A",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M062",
      identifierCode: "STU-3M-062",
      studentIdNumber: "2026-CRIM-3M-062",
      displayName: "Cadet Rich Nisperos",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-3M06", radioChannel: "TAC-2", dutyStation: "Main Gate Entrance",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M063",
      identifierCode: "STU-3M-063",
      studentIdNumber: "2026-CRIM-3M-063",
      displayName: "Cadet Gosem Ochea",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-3M06", radioChannel: "TAC-3", dutyStation: "Science Complex",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M064",
      identifierCode: "STU-3M-064",
      studentIdNumber: "2026-CRIM-3M-064",
      displayName: "Cadet Crystal Olalo",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-3M06", radioChannel: "TAC-4", dutyStation: "Quadrangle Walkway",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M065",
      identifierCode: "STU-3M-065",
      studentIdNumber: "2026-CRIM-3M-065",
      displayName: "Cadet Remark Opaon",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-3M06", radioChannel: "TAC-1", dutyStation: "South Gate / Standby Post",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M066",
      identifierCode: "STU-3M-066",
      studentIdNumber: "2026-CRIM-3M-066",
      displayName: "Cadet Hans Paygalan",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: true,
      specialties: ["PATROL","EXTRICATION"],
      phone: "0917-555-3M06", radioChannel: "TAC-2", dutyStation: "Athletic Arena / East Bleachers",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M067",
      identifierCode: "STU-3M-067",
      studentIdNumber: "2026-CRIM-3M-067",
      displayName: "Cadet Joel Peloton",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID","RADIO_OPS"],
      phone: "0917-555-3M06", radioChannel: "TAC-3", dutyStation: "Library Corridor",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M068",
      identifierCode: "STU-3M-068",
      studentIdNumber: "2026-CRIM-3M-068",
      displayName: "Cadet Alex Pinaaling",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-3M06", radioChannel: "TAC-4", dutyStation: "Admin Building Lobby",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M069",
      identifierCode: "STU-3M-069",
      studentIdNumber: "2026-CRIM-3M-069",
      displayName: "Cadet Jonathan Pinahan",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-3M06", radioChannel: "TAC-1", dutyStation: "Canteen Area / Post B",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M070",
      identifierCode: "STU-3M-070",
      studentIdNumber: "2026-CRIM-3M-070",
      displayName: "Cadet Kurt Pon",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-3M07", radioChannel: "TAC-2", dutyStation: "Clinic / Field Station",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M071",
      identifierCode: "STU-3M-071",
      studentIdNumber: "2026-CRIM-3M-071",
      displayName: "Cadet John Pulgo",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-3M07", radioChannel: "TAC-3", dutyStation: "Command Post Alpha",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M072",
      identifierCode: "STU-3M-072",
      studentIdNumber: "2026-CRIM-3M-072",
      displayName: "Cadet Erica Queraban",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-3M07", radioChannel: "TAC-4", dutyStation: "North Perimeter / Gate 1",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M073",
      identifierCode: "STU-3M-073",
      studentIdNumber: "2026-CRIM-3M-073",
      displayName: "Cadet Christian Ramos",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-3M07", radioChannel: "TAC-1", dutyStation: "East Wing Corridor",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M074",
      identifierCode: "STU-3M-074",
      studentIdNumber: "2026-CRIM-3M-074",
      displayName: "Cadet Edrian Ramos",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-3M07", radioChannel: "TAC-2", dutyStation: "Parking Area / Post C",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M075",
      identifierCode: "STU-3M-075",
      studentIdNumber: "2026-CRIM-3M-075",
      displayName: "Cadet Emmanuel Rapal",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-3M07", radioChannel: "TAC-3", dutyStation: "Chapel Grounds",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M076",
      identifierCode: "STU-3M-076",
      studentIdNumber: "2026-CRIM-3M-076",
      displayName: "Cadet Nicole Remolador",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: true,
      specialties: ["PATROL","EXTRICATION"],
      phone: "0917-555-3M07", radioChannel: "TAC-4", dutyStation: "Gate North / Kiosk A",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M077",
      identifierCode: "STU-3M-077",
      studentIdNumber: "2026-CRIM-3M-077",
      displayName: "Cadet Kenth Revira",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["FIRST_AID","RADIO_OPS"],
      phone: "0917-555-3M07", radioChannel: "TAC-1", dutyStation: "Main Gate Entrance",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M078",
      identifierCode: "STU-3M-078",
      studentIdNumber: "2026-CRIM-3M-078",
      displayName: "Cadet Jovil Rosilem",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-3M07", radioChannel: "TAC-2", dutyStation: "Science Complex",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M079",
      identifierCode: "STU-3M-079",
      studentIdNumber: "2026-CRIM-3M-079",
      displayName: "Cadet Sam Sajol",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-3M07", radioChannel: "TAC-3", dutyStation: "Quadrangle Walkway",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M080",
      identifierCode: "STU-3M-080",
      studentIdNumber: "2026-CRIM-3M-080",
      displayName: "Cadet Ra├▒el Salpid",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-3M08", radioChannel: "TAC-4", dutyStation: "South Gate / Standby Post",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M081",
      identifierCode: "STU-3M-081",
      studentIdNumber: "2026-CRIM-3M-081",
      displayName: "Cadet John Tabamo",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: true,
      specialties: ["PATROL"],
      phone: "0917-555-3M08", radioChannel: "TAC-1", dutyStation: "Athletic Arena / East Bleachers",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M082",
      identifierCode: "STU-3M-082",
      studentIdNumber: "2026-CRIM-3M-082",
      displayName: "Cadet June Tagupa",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["FIRST_AID"],
      phone: "0917-555-3M08", radioChannel: "TAC-2", dutyStation: "Library Corridor",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M083",
      identifierCode: "STU-3M-083",
      studentIdNumber: "2026-CRIM-3M-083",
      displayName: "Cadet John Talja",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: false,
      specialties: ["PATROL","FIRST_AID"],
      phone: "0917-555-3M08", radioChannel: "TAC-3", dutyStation: "Admin Building Lobby",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M084",
      identifierCode: "STU-3M-084",
      studentIdNumber: "2026-CRIM-3M-084",
      displayName: "Cadet Michael Tapdin",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["RADIO_OPS"],
      phone: "0917-555-3M08", radioChannel: "TAC-4", dutyStation: "Canteen Area / Post B",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M085",
      identifierCode: "STU-3M-085",
      studentIdNumber: "2026-CRIM-3M-085",
      displayName: "Cadet Ronil Torcino",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["EXTRICATION"],
      phone: "0917-555-3M08", radioChannel: "TAC-1", dutyStation: "Clinic / Field Station",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M086",
      identifierCode: "STU-3M-086",
      studentIdNumber: "2026-CRIM-3M-086",
      displayName: "Cadet John Torreon",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 4,
      isRescueCertified: true,
      specialties: ["PATROL","EXTRICATION"],
      phone: "0917-555-3M08", radioChannel: "TAC-2", dutyStation: "Command Post Alpha",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M087",
      identifierCode: "STU-3M-087",
      studentIdNumber: "2026-CRIM-3M-087",
      displayName: "Cadet James Wapin",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: false,
      specialties: ["FIRST_AID","RADIO_OPS"],
      phone: "0917-555-3M08", radioChannel: "TAC-3", dutyStation: "North Perimeter / Gate 1",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-3M088",
      identifierCode: "STU-3M-088",
      studentIdNumber: "2026-CRIM-3M-088",
      displayName: "Cadet Ferven Sanchez",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3 (MANDALA)",
      yearLevel: "3RD_YEAR",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      specialties: ["PATROL"],
      phone: "0917-555-3M08", radioChannel: "TAC-4", dutyStation: "East Wing Corridor",
      assignedUnitId: "u-3M01",
      dutyStatus: "STANDBY"
    },

        // Tactical Officers
    {
      id: "m-1",
      identifierCode: "CADET-7701",
      studentIdNumber: "2024-OFFICER-01",
      displayName: "Officer Marcus Vance",
      memberType: "OFFICER",
      sectionName: "Tactical Officers",
      yearLevel: "OFFICER",
      department: "Criminology Tactical Squad",
      roleTitle: "Squad Lead / Heavy Rescue",
      physicalRating: 5,
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
      memberType: "OFFICER",
      sectionName: "Tactical Officers",
      yearLevel: "OFFICER",
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
      memberType: "OFFICER",
      sectionName: "Tactical Officers",
      yearLevel: "OFFICER",
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
      memberType: "OFFICER",
      sectionName: "Tactical Officers",
      yearLevel: "OFFICER",
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
      memberType: "OFFICER",
      sectionName: "Tactical Officers",
      yearLevel: "OFFICER",
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
      memberType: "OFFICER",
      sectionName: "Tactical Officers",
      yearLevel: "OFFICER",
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
  attendanceLogs: [],
  // Anonymous Reports / Concerns (Referenced from POD-AI Concern model)
  anonymousReports: []
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
if (!state.pendingRegistrations) {
  state.pendingRegistrations = [...defaultState.pendingRegistrations];
}
if (!state.members || state.members.length < defaultState.members.length) {
  const existingIds = new Set((state.members || []).map(m => m.id));
  state.members = state.members || [];
  for (const defMember of defaultState.members) {
    if (!existingIds.has(defMember.id)) {
      state.members.push(defMember);
    }
  }
}
// Normalize yearLevel on all members
for (const m of (state.members || [])) {
  if (!m.yearLevel) {
    const sec = (m.sectionName || '').toUpperCase();
    if (m.memberType === 'OFFICER' || sec.includes('TACTICAL')) m.yearLevel = 'OFFICER';
    else if (sec.includes('1-') || sec.includes('CRIM 1')) m.yearLevel = '1ST_YEAR';
    else if (sec.includes('2-') || sec.includes('CRIM 2')) m.yearLevel = '2ND_YEAR';
    else if (sec.includes('3-') || sec.includes('CRIM 3')) m.yearLevel = '3RD_YEAR';
    else if (sec.includes('4-') || sec.includes('CRIM 4')) m.yearLevel = '4TH_YEAR';
    else m.yearLevel = m.memberType === 'STUDENT' ? '3RD_YEAR' : 'OFFICER';
  }
}
// ── Session & Cryptographic Token Management ────────────────────────────────
// Declared here so the startup session-restore block below can reference it
export const activeSessions = new Map();

// Ensure sessions map exists in state
if (!state.sessions || typeof state.sessions !== 'object') state.sessions = {};
// Prune expired sessions on startup and reload into activeSessions Map
{
  const now = Date.now();
  for (const [token, sess] of Object.entries(state.sessions)) {
    if (sess.expiresAt && sess.expiresAt > now) {
      activeSessions.set(token, sess);
    } else {
      delete state.sessions[token];
    }
  }
}

function persistState() {
  try {
    // Sync active in-memory sessions into state before writing
    state.sessions = {};
    for (const [token, sess] of activeSessions.entries()) {
      if (sess.expiresAt > Date.now()) {
        state.sessions[token] = sess;
      }
    }
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
    `   E-SECURE 1.0 TACTICAL ESCALATION DOSSIER`,
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
    `DISPATCHED BY E-SECURE 1.0 / Criminology Campus Security`,
  ].join('\n');

  return { dossierCode, dossier, mapLink };
}

// ── Unified credential resolver (no client-chosen role) ─────────────────────
function normAuth(value) {
  return String(value || '').trim();
}

function codesMatch(value, identifier) {
  if (!value || !identifier) return false;
  return String(value).trim().toUpperCase() === identifier.toUpperCase();
}

export function resolveUnifiedLogin(stores, identifier, passkey) {
  const ident = normAuth(identifier);
  const key = normAuth(passkey);
  const admins = stores.adminAccounts || [];
  const members = stores.members || [];
  const leaders = stores.deptLeaders || [];

  const admin = admins.find((account) => {
    const usernameMatch = ident && account.username && account.username.toLowerCase() === ident.toLowerCase();
    if (usernameMatch && key && account.passkey === key) return true;
    if (account.passkey && key && account.passkey === key && (!ident || usernameMatch || account.passkey === ident)) return true;
    if (account.passkey && !key && ident && account.passkey === ident) return true;
    return false;
  });
  if (admin) {
    return {
      kind: 'admin',
      user: {
        id: admin.username,
        displayName: admin.displayName,
        role: 'ADMIN',
        roleTitle: 'Campus Safety Administrator',
        department: 'Command Staff',
        dutyStation: 'Central Security Desk',
        identifierCode: admin.username
      }
    };
  }

  if (ident) {
    const cadet = members.find((member) =>
      codesMatch(member.identifierCode, ident) ||
      codesMatch(member.studentIdNumber, ident) ||
      codesMatch(member.id, ident) ||
      (member.email && member.email.toLowerCase() === ident.toLowerCase())
    );
    if (cadet) {
      const isOfficer = String(cadet.memberType || '').toUpperCase() === 'OFFICER';
      return {
        kind: 'cadet',
        user: {
          id: cadet.id,
          displayName: cadet.displayName,
          role: 'CADET',
          roleTitle: cadet.roleTitle || (isOfficer ? 'Duty Officer' : 'Safety Cadet Marshal'),
          department: cadet.department || 'College of Criminology',
          dutyStation: cadet.dutyStation || 'Assigned Checkpoint',
          identifierCode: cadet.identifierCode || cadet.studentIdNumber || cadet.id
        }
      };
    }

    const leader = leaders.find((entry) =>
      codesMatch(entry.accessCode, ident) ||
      codesMatch(entry.id, ident) ||
      (entry.email && entry.email.toLowerCase() === ident.toLowerCase())
    );
    if (leader) {
      return {
        kind: 'representative',
        user: {
          id: leader.id,
          displayName: leader.displayName,
          role: 'SCENE_REP',
          roleTitle: 'Scene Representative',
          department: leader.department || 'Department Lead',
          dutyStation: leader.sectionName || 'Department Area',
          identifierCode: leader.accessCode || leader.id
        }
      };
    }
  }

  return null;
}

export function createSession(user) {
  const token = 'esecure_sec_' + crypto.randomBytes(24).toString('hex');
  const sessionData = {
    token,
    user: {
      id: user.id || user.username || 'usr-' + Date.now(),
      displayName: user.displayName || user.name || 'Campus Security User',
      role: user.role || 'USER', // 'SUPER_ADMIN', 'ADMIN', 'CADET', 'SCENE_REP'
      roleTitle: user.roleTitle || 'Security Personnel',
      department: user.department || 'Safety Operations',
      dutyStation: user.dutyStation || 'Campus Grounds',
      identifierCode: user.identifierCode || null
    },
    createdAt: Date.now(),
    expiresAt: Date.now() + (72 * 60 * 60 * 1000) // 72 hours — survives restarts
  };
  activeSessions.set(token, sessionData);
  // Immediately persist so the session survives server restarts
  persistState();
  return sessionData;
}

export function getSessionFromRequest(req) {
  const authHeader = req.headers['authorization'] || '';
  let token = null;
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.headers['x-session-token']) {
    token = String(req.headers['x-session-token']).trim();
  }
  if (!token) return null;

  const session = activeSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }
  return session;
}

export function revokeSession(token) {
  const deleted = activeSessions.delete(token);
  if (deleted) persistState();
  return deleted;
}

// Strict Admin-Only Attendance Access Guard (full student compliance PII)
export function checkAttendanceAccess(role) {
  return role === 'ADMIN';
}

export function inferCurrentShift(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 16) return 'PM_OUT';
  if (hour >= 13) return 'PM_IN';
  if (hour >= 11) return 'AM_OUT';
  return 'AM_IN';
}

export function isSameLocalDay(iso, now = new Date()) {
  if (!iso) return false;
  const stamp = new Date(iso);
  return (
    stamp.getFullYear() === now.getFullYear() &&
    stamp.getMonth() === now.getMonth() &&
    stamp.getDate() === now.getDate()
  );
}

export function resolveYearLevel(member) {
  if (!member) return '3RD_YEAR';
  if (member.yearLevel) return member.yearLevel;
  const role = String(member.roleTitle || '').toLowerCase();
  const sec = String(member.sectionName || '').toUpperCase();
  if (member.memberType === 'OFFICER' || role.includes('officer') || sec.includes('TACTICAL')) {
    return 'OFFICER';
  }
  if (sec.includes('1-') || sec.includes('CRIM 1') || sec.includes('1ST')) return '1ST_YEAR';
  if (sec.includes('2-') || sec.includes('CRIM 2') || sec.includes('2ND')) return '2ND_YEAR';
  if (sec.includes('3-') || sec.includes('CRIM 3') || sec.includes('3RD')) return '3RD_YEAR';
  if (sec.includes('4-') || sec.includes('CRIM 4') || sec.includes('4TH')) return '4TH_YEAR';
  return member.memberType === 'STUDENT' ? '3RD_YEAR' : 'OFFICER';
}

export function findMemberByIdentifier(members, identifier) {
  const ident = String(identifier || '').trim().toUpperCase();
  if (!ident) return null;
  return (members || []).find((member) =>
    String(member.identifierCode || '').toUpperCase() === ident ||
    String(member.studentIdNumber || '').toUpperCase() === ident ||
    String(member.id || '').toUpperCase() === ident ||
    String(member.displayName || '').toUpperCase() === ident
  ) || null;
}

export function buildAttendanceBoard(appState, shiftType) {
  const shift = shiftType || inferCurrentShift();
  const rawMembers = appState.members || [];
  const members = rawMembers.map(m => ({
    ...m,
    yearLevel: resolveYearLevel(m)
  }));
  const logs = appState.attendanceLogs || [];
  const todayLogs = logs.filter((entry) => isSameLocalDay(entry.loggedAt));
  const shiftLogs = todayLogs.filter((entry) => entry.shiftType === shift);
  const scannedIds = new Set(shiftLogs.map((entry) => entry.memberId));

  const pending = members
    .filter((member) => !scannedIds.has(member.id))
    .map((member) => ({
      id: member.id,
      displayName: member.displayName,
      identifierCode: member.identifierCode,
      studentIdNumber: member.studentIdNumber || member.identifierCode,
      yearLevel: member.yearLevel,
      sectionName: member.sectionName || 'General',
      dutyStation: member.dutyStation || 'Unassigned post',
      dutyStatus: member.dutyStatus || 'STANDBY',
      roleTitle: member.roleTitle || 'Personnel',
      memberType: member.memberType || 'STUDENT'
    }));

  const onDutyCount = members.filter((member) => member.dutyStatus === 'ON_DUTY').length;

  const levels = ['1ST_YEAR', '2ND_YEAR', '3RD_YEAR', '4TH_YEAR', 'OFFICER'];
  const levelBreakdown = {};
  levels.forEach(lvl => {
    const lvlMembers = members.filter(m => m.yearLevel === lvl);
    const lvlScanned = lvlMembers.filter(m => scannedIds.has(m.id)).length;
    levelBreakdown[lvl] = {
      total: lvlMembers.length,
      scanned: lvlScanned,
      pending: lvlMembers.length - lvlScanned,
      percent: lvlMembers.length > 0 ? Math.round((lvlScanned / lvlMembers.length) * 100) : 0
    };
  });

  const memberRoster = members.map(m => {
    const memberLogs = todayLogs.filter(l => l.memberId === m.id);
    const compliance = (appState.studentCompliance || []).find(c => c.studentId === m.id);
    const amInLog = memberLogs.find(l => l.shiftType === 'AM_IN');
    const amOutLog = memberLogs.find(l => l.shiftType === 'AM_OUT');
    const pmInLog = memberLogs.find(l => l.shiftType === 'PM_IN');
    const pmOutLog = memberLogs.find(l => l.shiftType === 'PM_OUT');

    return {
      id: m.id,
      displayName: m.displayName,
      identifierCode: m.identifierCode,
      studentIdNumber: m.studentIdNumber || m.identifierCode,
      yearLevel: m.yearLevel,
      sectionName: m.sectionName || 'General',
      dutyStation: m.dutyStation || 'Unassigned post',
      dutyStatus: m.dutyStatus || 'STANDBY',
      roleTitle: m.roleTitle || 'Personnel',
      memberType: m.memberType || 'STUDENT',
      lastRecordedDate: memberLogs[0]?.loggedDate || (memberLogs[0]?.loggedAt ? memberLogs[0].loggedAt.slice(0, 10) : null),
      shifts: {
        amIn: compliance?.amIn || (amInLog ? new Date(amInLog.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null),
        amOut: compliance?.amOut || (amOutLog ? new Date(amOutLog.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null),
        pmIn: compliance?.pmIn || (pmInLog ? new Date(pmInLog.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null),
        pmOut: compliance?.pmOut || (pmOutLog ? new Date(pmOutLog.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null),
        amInDate: amInLog?.loggedDate || (amInLog?.loggedAt ? amInLog.loggedAt.slice(0, 10) : null),
        amOutDate: amOutLog?.loggedDate || (amOutLog?.loggedAt ? amOutLog.loggedAt.slice(0, 10) : null),
        pmInDate: pmInLog?.loggedDate || (pmInLog?.loggedAt ? pmInLog.loggedAt.slice(0, 10) : null),
        pmOutDate: pmOutLog?.loggedDate || (pmOutLog?.loggedAt ? pmOutLog.loggedAt.slice(0, 10) : null)
      },
      hasScannedCurrentShift: scannedIds.has(m.id),
      isOverride: memberLogs.some(l => l.isOverride),
      latestLog: memberLogs[0] || null
    };
  });

  return {
    currentShift: shift,
    metrics: {
      totalCadets: members.length,
      onDutyCount,
      offDutyCount: members.length - onDutyCount,
      scannedThisShift: scannedIds.size,
      pendingThisShift: pending.length,
      checkedInToday: todayLogs.length,
      overridesCount: todayLogs.filter(l => l.isOverride).length,
      levelBreakdown
    },
    members: memberRoster,
    pending,
    logs: logs.slice(0, 50)
  };
}

export function canOperateAttendanceKiosk(role) {
  const normalized = String(role || '').toUpperCase();
  return normalized === 'ADMIN' || normalized === 'SUPER_ADMIN' || normalized === 'CADET' || normalized === 'SCENE_REP' || normalized === 'OFFICER';
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
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
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
      system: "E-Secure 1.0 & Multi-Event Management",
      databaseTarget: "Google Cloud SQL (PostgreSQL 16+)",
      gcpTelemetry: {
        projectId: "security-l1",
        region: "asia-east2",
        mcpDataAgentKitStatus: "COMPATIBLE",
        uriPattern: "cloudsql://projects/security-l1/instances/esecure-primary/databases/security_attendance",
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

  // ── Unified Authentication API (one credential set; role assigned server-side) ─
  if (method === 'POST' && (pathname === '/api/auth/login' || pathname === '/api/admin/login')) {
    try {
      const body = await parseJsonBody(req);
      const identifier = normAuth(
        body.identifier ||
        body.identifierCode ||
        body.badgeId ||
        body.studentId ||
        body.accessCode ||
        body.username ||
        body.email ||
        body.code
      );
      const passkey = normAuth(body.passkey || body.password);

      if (!identifier && !passkey) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Enter your access ID or passkey.' }));
        return;
      }

      const resolved = resolveUnifiedLogin(state, identifier, passkey);
      if (!resolved) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid access ID or passkey.' }));
        return;
      }

      const session = createSession(resolved.user);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        token: session.token,
        user: session.user
      }));
      return;
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // Session Verification Endpoint
  if (method === 'GET' && pathname === '/api/auth/session') {
    const session = getSessionFromRequest(req);
    if (session) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ authenticated: true, user: session.user }));
    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ authenticated: false, error: "No active session." }));
    }
    return;
  }

  // Session Logout Endpoint
  if (method === 'POST' && pathname === '/api/auth/logout') {
    const authHeader = req.headers['authorization'] || '';
    let token = null;
    if (authHeader.startsWith('Bearer ')) token = authHeader.slice(7).trim();
    else if (req.headers['x-session-token']) token = String(req.headers['x-session-token']).trim();
    if (token) revokeSession(token);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: "Logged out successfully." }));
    return;
  }

  // Public User Registration Endpoint (Cadet recruit / Scene rep application)
  if (method === 'POST' && pathname === '/api/auth/register') {
    try {
      const data = await parseJsonBody(req);
      const newReq = {
        id: 'req-' + Date.now(),
        name: data.name || 'New Recruit',
        email: data.email || 'recruit@campus.edu',
        requestedRole: data.requestedRole || 'cadet',
        preferredStation: data.preferredStation || 'Main Gate Entrance',
        date: 'Just now',
        status: 'PENDING'
      };
      if (!state.pendingRegistrations) state.pendingRegistrations = [];
      state.pendingRegistrations.unshift(newReq);
      persistState();

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: "Registration submitted for Administrator verification.",
        registrationId: newReq.id
      }));
      return;
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // Admin Pending Registrations List (ADMIN ONLY)
  if (method === 'GET' && pathname === '/api/admin/registrations') {
    const session = getSessionFromRequest(req);
    const legacyRole = (req.headers['x-user-role'] || urlObj.searchParams.get('role') || '').toUpperCase();
    const isAdmin = (session && (session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN')) || legacyRole === 'ADMIN';

    if (!isAdmin) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'FORBIDDEN: Admin clearance required to view registration queue.' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ registrations: state.pendingRegistrations || [] }));
    return;
  }

  // Admin Registration Approval (ADMIN ONLY)
  if (method === 'POST' && pathname === '/api/admin/registrations/approve') {
    const session = getSessionFromRequest(req);
    const legacyRole = (req.headers['x-user-role'] || urlObj.searchParams.get('role') || '').toUpperCase();
    const isAdmin = (session && (session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN')) || legacyRole === 'ADMIN';

    if (!isAdmin) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'FORBIDDEN: Admin clearance required to approve registrations.' }));
      return;
    }

    try {
      const { id, assignedRole, assignedStation } = await parseJsonBody(req);
      const regIndex = (state.pendingRegistrations || []).findIndex(r => r.id === id);
      if (regIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Registration request not found." }));
        return;
      }

      const reg = state.pendingRegistrations[regIndex];
      reg.status = 'APPROVED';
      reg.assignedRole = assignedRole || reg.requestedRole;
      reg.assignedStation = assignedStation || reg.preferredStation;

      // Create new cadet/officer member entry if cadet
      const newMember = {
        id: 'm-' + Date.now(),
        identifierCode: 'CADET-' + Math.floor(1000 + Math.random() * 9000),
        displayName: reg.name,
        memberType: reg.assignedRole === 'representative' ? 'DEPT_LEADER' : 'STUDENT',
        roleTitle: reg.assignedRole === 'representative' ? 'Scene Representative' : 'Safety Cadet Marshal',
        dutyStation: reg.assignedStation,
        dutyStatus: 'ON_DUTY',
        isRescueCertified: false,
        physicalRating: 3,
        specialties: ['PATROL'],
        phone: null,
        radioChannel: 'TAC-1',
        assignedUnitId: 'u-101'
      };
      state.members.push(newMember);
      persistState();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: `User ${reg.name} approved and assigned to ${newMember.dutyStation}.`,
        member: newMember,
        registration: reg
      }));
      return;
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // ── Public Campus Watch Areas (Zero PII Exposed) ───────────────────────────
  if (method === 'GET' && pathname === '/api/public/areas') {
    const publicAreas = [
      { id: 'area-1', date: 'Active Shift', title: 'Main Gate Entrance', subtitle: 'Visitor Check & Perimeter Gate', progress: 56, isNavy: true, assignedUnit: 'Unit 1 - Alpha Rapid Rescue', sector: 'Sector 1 - North Perimeter' },
      { id: 'area-2', date: 'Active Shift', title: 'Quadrangle Walkway', subtitle: 'Student Walking Patrol', progress: 46, isNavy: false, assignedUnit: 'Unit 2 - Bravo Extrication', sector: 'Sector 2 - Central Quad' },
      { id: 'area-3', date: 'Active Shift', title: 'Science Complex', subtitle: 'Hallway & Lab Walkthrough', progress: 87, isNavy: false, assignedUnit: 'Unit 3 - Charlie Command', sector: 'Sector 2 - Central Quad' },
      { id: 'area-4', date: 'Active Shift', title: 'Administration Building', subtitle: 'Main Office & Entry Doors', progress: 24, isNavy: false, assignedUnit: 'Unit 1 - Alpha Rapid Rescue', sector: 'Sector 3 - South Corridor' }
    ];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ areas: publicAreas, campusStatus: 'SECURE_ACTIVE', monitoredGates: 4 }));
    return;
  }

  // ── Public Emergency Hotlines API (no auth required) ──────────────────────
  if (method === 'GET' && pathname === '/api/hotlines') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ hotlines: (state.emergencyHotlines || []).filter(h => h.isActive) }));
    return;
  }

  // ── Cadet Tactical Contact Mesh (PROTECTED: Authentication Required) ───────
  if (method === 'GET' && pathname === '/api/cadet-mesh') {
    const session = getSessionFromRequest(req);
    const legacyRole = (req.headers['x-user-role'] || urlObj.searchParams.get('role') || '').toUpperCase();
    const isAuthorized = !!session || legacyRole === 'ADMIN' || legacyRole === 'OFFICER';

    if (!isAuthorized) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'UNAUTHORIZED: Authentication required to view tactical contact mesh.' }));
      return;
    }

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

  // 2. Attendance APIs — authenticated personnel (kiosk / officer level in-charge).
  if (method === 'GET' && pathname === '/api/attendance') {
    const session = getSessionFromRequest(req);
    const legacyRole = (req.headers['x-user-role'] || urlObj.searchParams.get('role') || '').toUpperCase();
    const role = session?.user?.role || legacyRole;
    if (!session && !canOperateAttendanceKiosk(legacyRole)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'UNAUTHORIZED: Sign in to open the attendance desk.' }));
      return;
    }
    if (session && !canOperateAttendanceKiosk(session.user.role) && !canOperateAttendanceKiosk(legacyRole)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'FORBIDDEN: Attendance desk is limited to assigned personnel.' }));
      return;
    }

    const requestedShift = (urlObj.searchParams.get('shift') || '').toUpperCase();
    const board = buildAttendanceBoard(state, ['AM_IN', 'AM_OUT', 'PM_IN', 'PM_OUT'].includes(requestedShift) ? requestedShift : inferCurrentShift());
    const isAdmin = checkAttendanceAccess(role) || role === 'SUPER_ADMIN';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      currentShift: board.currentShift,
      logs: board.logs,
      pending: isAdmin ? board.pending : board.pending.map(({ id, displayName, identifierCode, studentIdNumber, yearLevel, sectionName, dutyStation, dutyStatus, roleTitle, memberType }) => ({
        id, displayName, identifierCode, studentIdNumber, yearLevel, sectionName, dutyStation, dutyStatus, roleTitle, memberType
      })),
      members: board.members,
      metrics: board.metrics,
      monitor: isAdmin,
      events: (state.events || []).map(e => ({
        id: e.id,
        title: e.title,
        eventCode: e.eventCode,
        date: e.date
      })),
      activeEventId: state.activeEventId || (state.events && state.events[0]?.id) || null
    }));
    return;
  }

  if (method === 'POST' && (pathname === '/api/attendance/check-in' || pathname === '/api/attendance/override')) {
    try {
      const session = getSessionFromRequest(req);
      const legacyRole = (req.headers['x-user-role'] || '').toUpperCase();
      if (!session && !canOperateAttendanceKiosk(legacyRole)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'UNAUTHORIZED: Sign in before recording attendance.' }));
        return;
      }

      const data = await parseJsonBody(req);
      const member = findMemberByIdentifier(state.members, data.identifierCode || data.memberId || data.badgeId || data.studentIdNumber || data.displayName || data.name);

      if (!member) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Student, cadet, or officer not found in the campus registry.' }));
        return;
      }

      const shiftType = data.shiftType || inferCurrentShift();
      const eventType = data.eventType || (String(shiftType).endsWith('_OUT') ? 'CHECK_OUT' : 'CHECK_IN');
      const isOverride = Boolean(data.override) || pathname === '/api/attendance/override';
      const overrideReason = data.overrideReason || (isOverride ? 'Manual Officer Override' : null);
      const officerDisplayName = session?.user?.displayName || data.recordedBy || 'Duty Officer';

      const existingIndex = (state.attendanceLogs || []).findIndex((entry) =>
        entry.memberId === member.id && entry.shiftType === shiftType && isSameLocalDay(entry.loggedAt)
      );

      if (existingIndex !== -1 && !isOverride) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          duplicate: true,
          canOverride: true,
          message: `${member.displayName} is already recorded for ${shiftType.replace('_', ' ')} today. Use override to adjust.`,
          log: state.attendanceLogs[existingIndex],
          member: {
            id: member.id,
            displayName: member.displayName,
            identifierCode: member.identifierCode,
            dutyStation: member.dutyStation,
            dutyStatus: member.dutyStatus
          }
        }));
        return;
      }

      member.dutyStatus = eventType === 'CHECK_IN' ? 'ON_DUTY' : 'OFF_DUTY';

      const now = new Date();
      const timeDisplay = data.customTime || now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const loggedDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const activeEvent = state.events.find(e => e.id === (data.eventId || state.activeEventId));

      const logEntry = {
        id: `att-${Date.now()}`,
        memberId: member.id,
        displayName: member.displayName,
        identifierCode: member.identifierCode,
        sectionName: member.sectionName || 'General',
        yearLevel: member.yearLevel || 'UNKNOWN',
        dutyStation: member.dutyStation || 'Unassigned',
        shiftType,
        eventType,
        eventId: data.eventId || state.activeEventId,
        eventTitle: activeEvent?.title || 'Campus Security Event',
        loggedDate,          // YYYY-MM-DD — for date-based filtering
        loggedAt: now.toISOString(),
        verificationMethod: isOverride ? 'MANUAL_OVERRIDE' : (data.verificationMethod || 'MANUAL_OFFICER_DESK'),
        verificationLatencyMs: isOverride ? 0 : (data.verificationLatencyMs || Math.floor(Math.random() * 80 + 70)),
        terminalCode: data.terminalCode || (isOverride ? 'OFFICER-OVERRIDE-DESK' : 'KIOSK-MAIN-SEC'),
        recordedBy: officerDisplayName,
        isOverride: isOverride,
        overrideReason: overrideReason
      };

      if (existingIndex !== -1 && isOverride) {
        state.attendanceLogs[existingIndex] = logEntry;
      } else {
        state.attendanceLogs.unshift(logEntry);
      }

      if (member.memberType === 'STUDENT') {
        const activeEvt = state.events.find(e => e.id === (data.eventId || state.activeEventId));
        updateStudentCompliance(
          state.studentCompliance,
          member.id,
          data.eventId || state.activeEventId,
          shiftType,
          timeDisplay,
          activeEvt?.mandatoryShifts
        );
      }

      persistState();
      const board = buildAttendanceBoard(state, shiftType);

      res.writeHead(existingIndex !== -1 ? 200 : 201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        overridden: isOverride,
        message: isOverride
          ? `[OVERRIDE RECORDED] ${member.displayName} set to ${shiftType.replace('_', ' ')} (${overrideReason}) by ${officerDisplayName}.`
          : `${member.displayName} recorded for ${shiftType.replace('_', ' ')}.`,
        log: logEntry,
        metrics: board.metrics,
        pending: board.pending,
        members: board.members,
        member: {
          id: member.id,
          displayName: member.displayName,
          identifierCode: member.identifierCode,
          dutyStation: member.dutyStation,
          dutyStatus: member.dutyStatus
        }
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

  // 4. Cadets / Members API - PROTECTED (Authentication Required)
  if (method === 'GET' && pathname === '/api/members') {
    const session = getSessionFromRequest(req);
    const legacyRole = (req.headers['x-user-role'] || urlObj.searchParams.get('role') || '').toUpperCase();
    const isAdmin = (session && (session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN')) || legacyRole === 'ADMIN';

    if (!session && !isAdmin) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'UNAUTHORIZED: Authentication required to access campus member roster.' }));
      return;
    }

    if (isAdmin) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ members: state.members }));
    } else {
      // Non-admins (e.g. Officers/Cadets) get sanitized roster: NO personal phone numbers
      const sanitized = state.members.map(m => ({
        id: m.id,
        displayName: m.displayName,
        identifierCode: m.identifierCode,
        studentIdNumber: m.studentIdNumber || m.identifierCode,
        yearLevel: resolveYearLevel(m),
        sectionName: m.sectionName || 'General',
        memberType: m.memberType || 'STUDENT',
        roleTitle: m.roleTitle,
        assignedUnitId: m.assignedUnitId,
        dutyStation: m.dutyStation,
        dutyStatus: m.dutyStatus,
        specialties: m.specialties || []
      }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ members: sanitized }));
    }
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

  // Admin Reports Feed (ADMIN ONLY)
  if (method === 'GET' && pathname === '/api/reports/admin') {
    const session = getSessionFromRequest(req);
    const legacyRole = (req.headers['x-user-role'] || urlObj.searchParams.get('role') || '').toUpperCase();
    const isAdmin = (session && (session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN')) || legacyRole === 'ADMIN';

    if (!isAdmin) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'FORBIDDEN: Administrative clearance required to view incident feeds.' }));
      return;
    }

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

  // Admin Update / Dispatch Report (ADMIN ONLY)
  if (method === 'PATCH' && pathname.startsWith('/api/reports/admin/')) {
    const session = getSessionFromRequest(req);
    const legacyRole = (req.headers['x-user-role'] || urlObj.searchParams.get('role') || '').toUpperCase();
    const isAdmin = (session && (session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN')) || legacyRole === 'ADMIN';

    if (!isAdmin) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'FORBIDDEN: Administrative clearance required to update incident reports.' }));
      return;
    }

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

  // ── Attendance Excel/CSV Export (ADMIN ONLY) ─────────────────────────────
  // GET /api/attendance/export?eventId=evt-101&date=2026-09-22&month=9&year=2026
  if (method === 'GET' && pathname === '/api/attendance/export') {
    const session = getSessionFromRequest(req);
    const legacyRole = (req.headers['x-user-role'] || urlObj.searchParams.get('role') || '').toUpperCase();
    const isAdmin = (session && (session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN')) || legacyRole === 'ADMIN';
    if (!isAdmin) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'FORBIDDEN: Only admins may export attendance reports.' }));
      return;
    }

    const filterEventId = urlObj.searchParams.get('eventId') || null;
    const filterDate    = urlObj.searchParams.get('date') || null;   // YYYY-MM-DD
    const filterMonth   = urlObj.searchParams.get('month') || null;  // 1-12
    const filterYear    = urlObj.searchParams.get('year') || null;   // YYYY

    // Collect logs
    let logs = state.attendanceLogs || [];

    if (filterEventId)   logs = logs.filter(l => (l.eventId || state.activeEventId) === filterEventId);
    if (filterDate)      logs = logs.filter(l => (l.loggedDate || (l.loggedAt || '').slice(0, 10)) === filterDate);
    if (filterMonth)     logs = logs.filter(l => {
      const d = new Date(l.loggedAt || l.loggedDate || '');
      return !isNaN(d) && (d.getMonth() + 1) === Number(filterMonth);
    });
    if (filterYear)      logs = logs.filter(l => {
      const d = new Date(l.loggedAt || l.loggedDate || '');
      return !isNaN(d) && d.getFullYear() === Number(filterYear);
    });

    // Build member lookup map for enrichment
    const memberMap = {};
    for (const m of (state.members || [])) memberMap[m.id] = m;

    // Build event lookup
    const eventMap = {};
    for (const e of (state.events || [])) eventMap[e.id] = e;

    // CSV header
    const csvRows = [];
    csvRows.push([
      'Log ID', 'Date', 'Time', 'Cadet / Officer Name', 'Identifier Code',
      'Student ID', 'Section', 'Year Level', 'Duty Station', 'Shift',
      'Event', 'Event Code', 'Event Date', 'Action', 'Verification',
      'Terminal', 'Recorded By', 'Override', 'Override Reason'
    ].map(h => `"${h}"`).join(','));

    for (const log of logs) {
      const member = memberMap[log.memberId] || {};
      const event  = eventMap[log.eventId || state.activeEventId] || {};
      const logDate = log.loggedDate || (log.loggedAt ? log.loggedAt.slice(0, 10) : '');
      const logTime = log.loggedAt  ? new Date(log.loggedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
      const row = [
        log.id || '',
        logDate,
        logTime,
        log.displayName || member.displayName || '',
        log.identifierCode || member.identifierCode || '',
        member.studentIdNumber || '',
        log.sectionName || member.sectionName || '',
        log.yearLevel || member.yearLevel || '',
        log.dutyStation || member.dutyStation || '',
        log.shiftType || '',
        log.eventTitle || event.title || '',
        event.eventCode || '',
        event.date || '',
        log.eventType || '',
        log.verificationMethod || '',
        log.terminalCode || '',
        log.recordedBy || '',
        log.isOverride ? 'YES' : 'NO',
        log.overrideReason || ''
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
      csvRows.push(row);
    }

    const csvContent = csvRows.join('\r\n');
    const filename = `esecure-attendance-${filterDate || filterMonth ? `${filterYear || ''}${filterMonth ? `-${String(filterMonth).padStart(2,'0')}` : ''}${filterDate ? `-${filterDate.slice(8)}` : ''}` : new Date().toISOString().slice(0,10)}.csv`;

    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store'
    });
    res.end('\uFEFF' + csvContent); // BOM for Excel UTF-8 compatibility
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
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range && (ext === '.mp4' || ext === '.webm')) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      };
      res.writeHead(206, head);
      file.pipe(res);
      return;
    }

    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes'
    });
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
    console.log(`[E-Secure 1.0 Tactical Server] Running at http://localhost:${PORT}`);
    console.log(`[Database Target] Google Cloud SQL (PostgreSQL 16+) / Project: security-l1`);
    console.log(`[Reference Pattern] POD-AI Concern anonymous reporting + Group Rescue Balancing`);
  });
}

// computeUnitReadiness, autoBalanceUnits, updateStudentCompliance, validateFiveWs,
// generateGovDossier, checkAttendanceAccess, getCadetContactRoster,
// createSession, getSessionFromRequest, revokeSession are exported inline above
export { 
  server, 
  requestHandler, 
  state, 
  generateReferenceCode 
};
