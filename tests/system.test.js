// ─────────────────────────────────────────────────────────────────────────────
// Created: 2026-09-16 | Purpose: Aegis Security Suite Automated Verification
// Target: Node.js 20+ Native Test Runner (node --test)
// ─────────────────────────────────────────────────────────────────────────────

import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  computeUnitReadiness, 
  autoBalanceUnits, 
  generateReferenceCode,
  updateStudentCompliance,
  validateFiveWs,
  generateGovDossier,
  checkAttendanceAccess,
  getCadetContactRoster
} from '../server.js';

test('Reference Code Generator conforms to POD-AI Concern pattern', () => {
  const code = generateReferenceCode();
  assert.match(code, /^REF-[A-Z0-9]{6}$/, 'Reference code must match format REF-XXXXXX');
});

test('Unit Rescue Readiness: flags units lacking qualified rescue personnel', () => {
  const testUnit = {
    id: 'unit-99',
    unitNumber: 99,
    callsign: 'Test Squad',
    minRescueRequired: 1
  };

  // Only basic personnel (physical rating < 4 or not certified)
  const weakMembers = [
    { id: 'm1', assignedUnitId: 'unit-99', physicalRating: 3, isRescueCertified: false },
    { id: 'm2', assignedUnitId: 'unit-99', physicalRating: 3, isRescueCertified: true }
  ];

  const resultWeak = computeUnitReadiness(testUnit, weakMembers);
  assert.equal(resultWeak.rescueReadinessStatus, 'INSUFFICIENT_RESCUE_CAPABILITY');
  assert.equal(resultWeak.rescueCapableCount, 0);
  assert.ok(resultWeak.warning.includes('No certified heavy rescue operative'));

  // Add a strong rescue operative (rating >= 4 and certified)
  const strongMembers = [
    ...weakMembers,
    { id: 'm3', assignedUnitId: 'unit-99', physicalRating: 5, isRescueCertified: true }
  ];

  const resultStrong = computeUnitReadiness(testUnit, strongMembers);
  assert.equal(resultStrong.rescueReadinessStatus, 'RESCUE_READY');
  assert.equal(resultStrong.rescueCapableCount, 1);
  assert.equal(resultStrong.warning, null);
});

test('Auto-Balancer: distributes strong rescue operatives so all units are capable', () => {
  const units = [
    { id: 'u-1', unitNumber: 1, minRescueRequired: 1 },
    { id: 'u-2', unitNumber: 2, minRescueRequired: 1 },
    { id: 'u-3', unitNumber: 3, minRescueRequired: 1 }
  ];

  // Imbalanced members: 3 rescue operatives all in Unit 1
  const members = [
    { id: 'm1', physicalRating: 5, isRescueCertified: true, assignedUnitId: 'u-1' },
    { id: 'm2', physicalRating: 4, isRescueCertified: true, assignedUnitId: 'u-1' },
    { id: 'm3', physicalRating: 5, isRescueCertified: true, assignedUnitId: 'u-1' },
    { id: 'm4', physicalRating: 2, isRescueCertified: false, assignedUnitId: 'u-2' },
    { id: 'm5', physicalRating: 3, isRescueCertified: false, assignedUnitId: 'u-3' },
    { id: 'm6', physicalRating: 2, isRescueCertified: false, assignedUnitId: 'u-3' }
  ];

  const balancedMembers = autoBalanceUnits(units, members);

  // Verify that every unit now has at least one rescue-capable member
  units.forEach(unit => {
    const readiness = computeUnitReadiness(unit, balancedMembers);
    assert.equal(
      readiness.rescueReadinessStatus, 
      'RESCUE_READY', 
      `Unit ${unit.unitNumber} should have at least 1 rescue operative after balancing`
    );
    assert.ok(readiness.rescueCapableCount >= 1);
  });
});

test('Student Compliance Tracker: progresses through AM/PM shifts to COMPLIANT status', () => {
  const complianceList = [];
  const studentId = 'stu-2026-001';
  const eventId = 'evt-101';
  const mandatoryShifts = ['AM_IN', 'AM_OUT', 'PM_IN', 'PM_OUT'];

  // 1. Morning Check In
  const step1 = updateStudentCompliance(complianceList, studentId, eventId, 'AM_IN', '07:45 AM', mandatoryShifts);
  assert.equal(step1.status, 'IN_PROGRESS');
  assert.equal(step1.amIn, '07:45 AM');
  assert.equal(step1.amOut, null);

  // 2. Morning Check Out (Lunch)
  const step2 = updateStudentCompliance(complianceList, studentId, eventId, 'AM_OUT', '12:00 PM', mandatoryShifts);
  assert.equal(step2.status, 'IN_PROGRESS');
  assert.equal(step2.amOut, '12:00 PM');

  // 3. Afternoon Check In
  const step3 = updateStudentCompliance(complianceList, studentId, eventId, 'PM_IN', '01:00 PM', mandatoryShifts);
  assert.equal(step3.status, 'IN_PROGRESS');
  assert.equal(step3.pmIn, '01:00 PM');

  // 4. Afternoon Check Out (Dismissal)
  const step4 = updateStudentCompliance(complianceList, studentId, eventId, 'PM_OUT', '05:00 PM', mandatoryShifts);
  assert.equal(step4.status, 'COMPLIANT');
  assert.equal(step4.pmOut, '05:00 PM');
});

test('Student Compliance Tracker: supports partial events with customized mandatory shifts', () => {
  const complianceList = [];
  const studentId = 'stu-2026-002';
  const eventId = 'evt-102';
  // Event only requires AM_IN and PM_OUT
  const mandatoryShifts = ['AM_IN', 'PM_OUT'];

  updateStudentCompliance(complianceList, studentId, eventId, 'AM_IN', '08:00 AM', mandatoryShifts);
  const finalStep = updateStudentCompliance(complianceList, studentId, eventId, 'PM_OUT', '04:30 PM', mandatoryShifts);

  assert.equal(finalStep.status, 'COMPLIANT', 'Should be COMPLIANT when all custom mandatory shifts are fulfilled');
});

// ─────────────────────────────────────────────────────────────────────────────
// NEW TESTS: 5 W's, Gov Dossier, Attendance Access, Cadet Mesh
// ─────────────────────────────────────────────────────────────────────────────

test('5 W\'s Validator: accepts report with unknown WHO when whoUnknown=true, rejects missing WHERE/WHAT/WHY', () => {
  // Full valid report with live photo
  const fakePhoto = 'data:image/jpeg;base64,/9j/validphoto==';
  const now = Date.now();
  const validReport = {
    whoUnknown: true,
    whoInvolved: null,
    whatHappened: 'Student collapsed near restroom and is unresponsive.',
    whereLocation: 'Science Building 3, Floor 2, Room 204',
    whenOccurred: new Date().toISOString(),
    whyHowDetails: 'Witness says student fainted suddenly, no apparent cause, needs medical attention.',
    livePhotoDataUrl: fakePhoto,
    photoTimestamp: now,
  };
  const { valid, errors } = validateFiveWs(validReport);
  assert.equal(valid, true, `Expected valid but got errors: ${errors.join('; ')}`);
  assert.equal(errors.length, 0);

  // Missing WHERE — must fail
  const missingWhere = { ...validReport, whereLocation: 'ok' }; // too short
  const r2 = validateFiveWs(missingWhere);
  assert.equal(r2.valid, false);
  assert.ok(r2.errors.some(e => e.includes('WHERE')));

  // Missing WHAT — must fail
  const missingWhat = { ...validReport, whatHappened: 'short' };
  const r3 = validateFiveWs(missingWhat);
  assert.equal(r3.valid, false);
  assert.ok(r3.errors.some(e => e.includes('WHAT')));

  // No WHO and whoUnknown not set — must fail
  const missingWho = { ...validReport, whoInvolved: null, whoUnknown: false };
  const r4 = validateFiveWs(missingWho);
  assert.equal(r4.valid, false);
  assert.ok(r4.errors.some(e => e.includes('WHO')));

  // No photo and no noPhotoReason — must fail
  const noPhoto = { ...validReport, livePhotoDataUrl: undefined, noPhotoReason: undefined };
  const r5 = validateFiveWs(noPhoto);
  assert.equal(r5.valid, false);
  assert.ok(r5.errors.some(e => e.includes('live photo')));

  // Stale photo (3 minutes old) — must fail
  const staleReport = { ...validReport, photoTimestamp: Date.now() - 200000 };
  const r6 = validateFiveWs(staleReport);
  assert.equal(r6.valid, false);
  assert.ok(r6.errors.some(e => e.includes('too old')));

  // No photo but with noPhotoReason — must be accepted
  const noPhotoWithReason = { ...validReport, livePhotoDataUrl: undefined, noPhotoReason: 'Phone camera is broken' };
  const r7 = validateFiveWs(noPhotoWithReason);
  assert.equal(r7.valid, true, `Expected valid but got: ${r7.errors.join('; ')}`);
});

test('Gov Dossier Generator: formats all 5 W\'s into dispatch-ready text with correct dossier code', () => {
  const mockReport = {
    referenceCode: 'REF-9TESTX',
    category: 'MEDICAL_INCIDENT',
    urgency: 'CRITICAL',
    whatHappened: 'Student collapsed and is unresponsive.',
    whereLocation: 'Science Building 3, Floor 2',
    whenOccurred: '2026-09-17T09:00:00.000Z',
    whyHowDetails: 'Sudden fainting, no apparent trauma, needs immediate EMS.',
    whoInvolved: 'Unknown',
    whoUnknown: true,
    reporterType: 'ANONYMOUS_CIVILIAN',
    hasLivePhoto: false,
    noPhotoReason: 'No camera',
    mapUrl: 'https://maps.google.com/?q=14.5995,120.9842',
    createdAt: '2026-09-17T09:00:00.000Z',
  };
  const { dossierCode, dossier, mapLink } = generateGovDossier(mockReport, 'Red Cross');
  assert.match(dossierCode, /^DOSSIER-\d{4}-RED-CROSS-\d{6}$/);
  assert.ok(dossier.includes('[WHO]'), 'Dossier must include WHO section');
  assert.ok(dossier.includes('[WHAT]'), 'Dossier must include WHAT section');
  assert.ok(dossier.includes('[WHERE]'), 'Dossier must include WHERE section');
  assert.ok(dossier.includes('[WHEN]'), 'Dossier must include WHEN section');
  assert.ok(dossier.includes('[WHY/HOW]'), 'Dossier must include WHY/HOW section');
  assert.ok(dossier.includes('REF-9TESTX'), 'Dossier must include the reference code');
  assert.ok(dossier.includes('CRITICAL'), 'Dossier must include urgency level');
  assert.equal(mapLink, mockReport.mapUrl);
});

test('Attendance Access Guard: permits ADMIN only, denies all other roles', () => {
  assert.equal(checkAttendanceAccess('ADMIN'), true, 'ADMIN should have access');
  assert.equal(checkAttendanceAccess('OFFICER'), false, 'OFFICER must not access attendance');
  assert.equal(checkAttendanceAccess('DEPT_LEADER'), false, 'DEPT_LEADER must not access attendance');
  assert.equal(checkAttendanceAccess('ANONYMOUS'), false, 'ANONYMOUS must not access attendance');
  assert.equal(checkAttendanceAccess(''), false, 'Empty role must not access attendance');
  assert.equal(checkAttendanceAccess('admin'), false, 'Lowercase admin must not bypass guard (expects exact ADMIN)');
});

test('Cadet Mesh: getCadetContactRoster groups members by unit with phone, radio, and duty station', () => {
  const units = [
    { id: 'u-T1', unitNumber: 1, callsign: 'Alpha Rescue', patrolSector: 'Sector North', isDeployed: true },
    { id: 'u-T2', unitNumber: 2, callsign: 'Bravo Medical', patrolSector: 'Sector South', isDeployed: false }
  ];
  const members = [
    { id: 'm-T1', displayName: 'Cadet A', roleTitle: 'Student Cadet', identifierCode: 'STU-001',
      phone: '0917-111-0001', radioChannel: 'TAC-1', dutyStation: 'Gate 1', dutyStatus: 'ON_DUTY',
      specialties: ['PATROL'], isRescueCertified: false, assignedUnitId: 'u-T1' },
    { id: 'm-T2', displayName: 'Cadet B', roleTitle: 'Rescue Specialist', identifierCode: 'STU-002',
      phone: '0917-111-0002', radioChannel: 'TAC-2', dutyStation: 'Medic Post', dutyStatus: 'STANDBY',
      specialties: ['HEAVY_RESCUE'], isRescueCertified: true, assignedUnitId: 'u-T2' },
    { id: 'm-T3', displayName: 'Cadet C', roleTitle: 'Patrol Officer', identifierCode: 'STU-003',
      phone: null, radioChannel: 'TAC-1', dutyStation: null, dutyStatus: 'ON_DUTY',
      specialties: ['CROWD_CONTROL'], isRescueCertified: false, assignedUnitId: 'u-T1' }
  ];

  const roster = getCadetContactRoster(members, units);

  assert.equal(roster.length, 2, 'Should have 2 unit entries');

  const unit1 = roster.find(r => r.unitId === 'u-T1');
  assert.ok(unit1, 'Unit T1 should be in roster');
  assert.equal(unit1.members.length, 2, 'Unit T1 should have 2 members (Cadet A and C)');
  assert.equal(unit1.callsign, 'Alpha Rescue');
  const cadetA = unit1.members.find(m => m.id === 'm-T1');
  assert.equal(cadetA.phone, '0917-111-0001');
  assert.equal(cadetA.radioChannel, 'TAC-1');
  assert.equal(cadetA.dutyStation, 'Gate 1');

  const unit2 = roster.find(r => r.unitId === 'u-T2');
  assert.equal(unit2.members.length, 1);
  const cadetB = unit2.members[0];
  assert.equal(cadetB.isRescueCertified, true);
  assert.equal(cadetB.dutyStation, 'Medic Post');

  // Cadet C has no phone — should still appear with null
  const cadetC = unit1.members.find(m => m.id === 'm-T3');
  assert.equal(cadetC.phone, null);
  assert.equal(cadetC.dutyStation, 'Unassigned Post', 'Null duty station should default to Unassigned Post');
});

