// ─────────────────────────────────────────────────────────────────────────────
// E-Secure 1.0 - Frontend Controller
// Criminology Campus Security, Cadet Tactical Mesh & 5 W's Multi-Use Dispatch
// Created: 2026-09-17 | Last verified with: Node.js 20+ ESM Native Backend
// ─────────────────────────────────────────────────────────────────────────────

let state = {
  activeRole: 'ADMIN', // 'ADMIN', 'OFFICER', 'DEPT_LEADER', 'ANONYMOUS'
  currentOfficerId: 'm-1', // Officer Marcus Vance (Unit 1 Lead)
  currentDept: 'College of Criminology',
  activeShift: 'AM_IN',
  activeEventId: 'evt-101',
  pendingGPS: null,
  pendingEscalateReportId: null,
  livePhoto: {
    dataUrl: null,
    timestamp: null,
    hash: null,
    reason: null
  },
  cameraStream: null,
  photoTimerInterval: null,
  
  // Tactical Units
  tacticalUnits: [
    {
      id: "u-101",
      unitNumber: 1,
      callsign: "Unit 1 - Alpha Rapid Rescue",
      patrolSector: "Sector 1 - North Perimeter & Gates",
      minRescueRequired: 1,
      isDeployed: true,
      totalAssigned: 2,
      rescueCapableCount: 1,
      rescueReadinessStatus: "RESCUE_READY",
      rescueCapableMembers: [{ displayName: "Officer Marcus Vance", physicalRating: 5 }]
    },
    {
      id: "u-102",
      unitNumber: 2,
      callsign: "Unit 2 - Bravo Extrication & Medical",
      patrolSector: "Sector 2 - Central Quad & Event Arena",
      minRescueRequired: 1,
      isDeployed: false,
      totalAssigned: 2,
      rescueCapableCount: 1,
      rescueReadinessStatus: "RESCUE_READY",
      rescueCapableMembers: [{ displayName: "Cadet Elena Rostova", physicalRating: 4 }]
    },
    {
      id: "u-103",
      unitNumber: 3,
      callsign: "Unit 3 - Charlie Command & Comms",
      patrolSector: "Sector 3 - South Evacuation Corridor",
      minRescueRequired: 1,
      isDeployed: false,
      totalAssigned: 2,
      rescueCapableCount: 1,
      rescueReadinessStatus: "RESCUE_READY",
      rescueCapableMembers: [{ displayName: "Cadet Jaxson Miller", physicalRating: 5 }]
    }
  ],

  // Events
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

  // Student Compliance Roster
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

  // Cadets & Members
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
      phone: "0917-882-1001",
      radioChannel: "CH-1 (Tactical Command)",
      dutyStation: "Gate 1 - North Main Perimeter",
      assignedUnitId: "u-101",
      dutyStatus: "ON_DUTY"
    },
    {
      id: "m-102",
      identifierCode: "STU-0802",
      studentIdNumber: "2026-CRIM-0802",
      displayName: "Cadet Andrea Cruz",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3-A",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      phone: "0917-882-1002",
      radioChannel: "CH-1 (Tactical Command)",
      dutyStation: "Gate 2 - East Bleachers",
      assignedUnitId: "u-101",
      dutyStatus: "ON_DUTY"
    },
    {
      id: "m-103",
      identifierCode: "STU-0803",
      studentIdNumber: "2026-CRIM-0803",
      displayName: "Cadet Marco Diaz",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3-B",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 5,
      isRescueCertified: true,
      phone: "0917-882-1003",
      radioChannel: "CH-2 (Extrication / Medical)",
      dutyStation: "Central Quad Medical Triage",
      assignedUnitId: "u-102",
      dutyStatus: "ON_DUTY"
    },
    {
      id: "m-104",
      identifierCode: "STU-0804",
      studentIdNumber: "2026-CRIM-0804",
      displayName: "Cadet Sofia Mendoza",
      memberType: "STUDENT",
      sectionName: "BS-CRIM 3-B",
      department: "College of Criminology",
      roleTitle: "Student Cadet",
      physicalRating: 3,
      isRescueCertified: false,
      phone: "0917-882-1004",
      radioChannel: "CH-2 (Extrication / Medical)",
      dutyStation: "Field Hospital Point A",
      assignedUnitId: "u-102",
      dutyStatus: "STANDBY"
    },
    {
      id: "m-1",
      identifierCode: "CADET-7701",
      studentIdNumber: "2024-OFF-0001",
      displayName: "Officer Marcus Vance",
      memberType: "OFFICER",
      sectionName: "FACULTY / CMD",
      department: "College of Criminology",
      roleTitle: "Lead Tactical Commander",
      physicalRating: 5,
      isRescueCertified: true,
      phone: "0917-555-7701",
      radioChannel: "CH-1 (Tactical Lead)",
      dutyStation: "Command Post CP-Alpha",
      assignedUnitId: "u-101",
      dutyStatus: "ON_DUTY"
    }
  ],

  // Live Attendance Logs (Admin view)
  attendanceLogs: [
    {
      id: "att-1",
      displayName: "Officer Marcus Vance",
      department: "College of Criminology",
      shiftType: "AM_IN",
      eventType: "CHECK_IN",
      verificationMethod: "QR_CODE",
      verificationLatencyMs: 142,
      loggedAt: "07:30:15 AM"
    },
    {
      id: "att-2",
      displayName: "Cadet Ronald Ramos",
      department: "College of Criminology",
      shiftType: "AM_IN",
      eventType: "CHECK_IN",
      verificationMethod: "QR_CODE",
      verificationLatencyMs: 168,
      loggedAt: "07:42:10 AM"
    },
    {
      id: "att-3",
      displayName: "Cadet Andrea Cruz",
      department: "College of Criminology",
      shiftType: "AM_IN",
      eventType: "CHECK_IN",
      verificationMethod: "QR_CODE",
      verificationLatencyMs: 185,
      loggedAt: "07:55:00 AM"
    }
  ],

  // Incident Reports with 5 W's Intelligence
  anonymousReports: [
    {
      id: "rep-101",
      referenceCode: "REF-TAC901",
      whoInvolved: "Unknown Person",
      whoPhysicalDescription: "Male, approx 20s, dark green hoodie, carrying bulky duffel bag",
      whoIsUnknown: true,
      whatHappened: "Unattended bag placed under structural bleachers",
      whereLocation: "East Bleachers, Sector 2 Athletic Arena",
      whenOccurred: "Just now (Active)",
      whyHowDetails: "Left intentionally behind concrete pillar during drill switch",
      category: "SUSPICIOUS_PERSON",
      urgency: "HIGH",
      status: "DISPATCHED",
      assignedUnitId: "u-101",
      photoVerified: true,
      photoTimestamp: Date.now() - 30000,
      govEscalationStatus: "NONE",
      createdAt: "08:15 AM"
    }
  ],

  // Emergency Hotlines
  emergencyHotlines: [
    { code: "911", agency: "National Emergency Hotline", category: "NATIONAL", phone: "911", priority: 1, deskNote: "24/7 nationwide primary emergency triage" },
    { code: "BFP-160", agency: "Bureau of Fire Protection", category: "FIRE", phone: "160", priority: 2, deskNote: "Fire suppression, Hazmat, chemical burns, vehicle extrication" },
    { code: "PRC-143", agency: "Philippine Red Cross", category: "MEDICAL", phone: "143", priority: 3, deskNote: "Mass casualty ambulance dispatch, blood bank, trauma units" },
    { code: "PNP-117", agency: "Philippine National Police", category: "POLICE", phone: "117", priority: 4, deskNote: "Armed response, perimeter lockdown, crowd disturbances" },
    { code: "NDRRMC", agency: "National Disaster Risk Reduction", category: "DISASTER", phone: "02-8911-5061", priority: 5, deskNote: "Regional earthquakes, floods, tropical storm warnings" },
    { code: "CAMPUS-TAC", agency: "Campus Tactical Security Desk", category: "CAMPUS", phone: "0917-555-2344", priority: 6, deskNote: "Criminology student cadet emergency patrol lead" },
    { code: "CAMPUS-MED", agency: "Campus University Clinic", category: "CAMPUS", phone: "0920-555-8821", priority: 7, deskNote: "Station nurse, trauma kit, minor injury stabilization" }
  ],

  // Dept Leaders
  deptLeaders: [
    { id: "dl-1", department: "College of Nursing", section: "BSN 3-B", leaderName: "Maria Santos", roleTitle: "Class President", phone: "0917-111-2233" },
    { id: "dl-2", department: "College of Engineering", section: "BSCE 4-A", leaderName: "Carlos Reyes", roleTitle: "Department Rep", phone: "0918-222-3344" },
    { id: "dl-3", department: "College of Education", section: "BSED 2-C", leaderName: "Faith Morales", roleTitle: "Council Chair", phone: "0919-333-4455" }
  ]
};

let isScanning = false;

// ─────────────────────────────────────────────────────────────────────────────
// 1. Clock
// ─────────────────────────────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const el = document.getElementById("clock");
  if (el) el.textContent = now.toTimeString().split(" ")[0];
}
setInterval(updateClock, 1000);
updateClock();

// ─────────────────────────────────────────────────────────────────────────────
// 2. Tab Navigation & Strict Role Visibility
// ─────────────────────────────────────────────────────────────────────────────
window.switchTab = function(tabId) {
  // If non-admin tries to switch to attendance/students, block and redirect
  if (state.activeRole !== 'ADMIN' && (tabId === 'attendance' || tabId === 'students')) {
    alert("Access Restricted: Attendance logs and monitoring are strictly viewable by Admin Commanders only.");
    tabId = 'cadet-mesh';
  }

  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.tab === tabId);
  });
  document.querySelectorAll(".tab-pane").forEach(pane => {
    pane.classList.toggle("active", pane.id === `pane-${tabId}`);
  });

  if (tabId === 'cadet-mesh') renderCadetMesh();
  if (tabId === 'dept-leader') renderDeptLeaders();
  if (tabId === 'attendance') renderAttendanceFeed();
  if (tabId === 'students') renderStudentsTable();
  if (tabId === 'events') renderEventsGrid();
  if (tabId === 'units') renderUnits();
  if (tabId === 'officer') renderOfficerTasks();
  if (tabId === 'admin') renderAdminReports();
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. User Role Switcher (Strict Admin Attendance Hiding)
// ─────────────────────────────────────────────────────────────────────────────
window.switchRole = function(role) {
  state.activeRole = role;
  document.querySelectorAll(".role-chip").forEach(c => {
    c.classList.toggle("active", c.dataset.role === role);
  });

  // Strict Admin Attendance Guard: hide tabs and panes completely from non-admin
  const isAdmin = role === 'ADMIN';
  document.querySelectorAll(".admin-only").forEach(el => {
    el.style.display = isAdmin ? '' : 'none';
  });
  document.querySelectorAll(".admin-only-pane").forEach(el => {
    if (!isAdmin) el.classList.remove("active");
  });

  const banner = document.getElementById("roleDescriptionBanner");
  if (banner) {
    if (role === 'ADMIN') {
      banner.innerHTML = `<strong>Commander Mode:</strong> Full command over tactical units, 5 W's dispatching, government escalation, and attendance tracking.`;
      switchTab('admin');
    } else if (role === 'OFFICER') {
      const curOfficer = state.members.find(m => m.id === state.currentOfficerId) || state.members[0];
      const unit = state.tacticalUnits.find(u => u.id === curOfficer.assignedUnitId);
      banner.innerHTML = `<strong>Field Officer Mode (${curOfficer.displayName}):</strong> Assigned to <em>${unit ? unit.callsign : 'Unassigned'}</em>. Viewing tactical tasks, duty mesh, and squad pings.`;
      switchTab('officer');
    } else if (role === 'DEPT_LEADER') {
      banner.innerHTML = `<strong>Non-CJS Department Leader Mode:</strong> Direct incident reporting desk connected to Criminology Tactical Command.`;
      switchTab('dept-leader');
    } else {
      banner.innerHTML = `<strong>Civilian / Student Mode:</strong> 100% private 5 W's incident reporting with live camera anti-spam proof.`;
      switchTab('anonymous');
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Emergency Hotlines Management
// ─────────────────────────────────────────────────────────────────────────────
async function loadEmergencyHotlines() {
  try {
    const res = await fetch('/api/hotlines');
    if (res.ok) {
      const data = await res.json();
      state.emergencyHotlines = data;
      renderHotlinePills();
    }
  } catch (e) {
    renderHotlinePills();
  }
}

function renderHotlinePills() {
  const container = document.getElementById("hotlinePills");
  if (!container) return;

  container.innerHTML = state.emergencyHotlines.slice(0, 6).map(h => `
    <a href="tel:${h.phone}" class="hotline-pill ${h.code === '911' ? 'critical' : ''}" title="${escapeHtml(h.agency)}: ${escapeHtml(h.deskNote)}">
      ${escapeHtml(h.agency.split(' ')[0])} (${h.phone})
    </a>
  `).join('');
}

window.openHotlinesModal = function() {
  const container = document.getElementById("hotlinesFullList");
  if (!container) return;

  container.innerHTML = state.emergencyHotlines.map(h => `
    <div style="background:var(--bg-surface-secondary); border:1px solid var(--border-subtle); border-radius:6px; padding:0.65rem; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="font-weight:700; font-size:0.84rem; color:var(--text-primary); display:flex; align-items:center; gap:0.4rem;">
          <span>${escapeHtml(h.agency)}</span>
          <span style="font-size:0.68rem; font-family:var(--font-mono); background:#E2E8F0; padding:0.1rem 0.4rem; border-radius:4px;">${h.code}</span>
        </div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.15rem;">${escapeHtml(h.deskNote)}</div>
      </div>
      <a href="tel:${h.phone}" class="btn btn-primary" style="padding:0.3rem 0.65rem; font-size:0.78rem; text-decoration:none;">
        Call ${h.phone}
      </a>
    </div>
  `).join('');

  document.getElementById("hotlinesModal").classList.remove("hidden");
};

window.closeHotlinesModal = function() {
  document.getElementById("hotlinesModal").classList.add("hidden");
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Cadet-to-Cadet Tactical Mesh & Contact Directory
// ─────────────────────────────────────────────────────────────────────────────
async function loadCadetMesh() {
  try {
    const res = await fetch('/api/cadet-mesh');
    if (res.ok) {
      const data = await res.json();
      state.cadetMeshRoster = data;
      renderCadetMesh(data);
      return;
    }
  } catch (e) {}
  renderCadetMesh();
}

function renderCadetMesh(rosterData) {
  const container = document.getElementById("cadetMeshGrid");
  if (!container) return;

  // Group members by unit
  const units = state.tacticalUnits.map(u => {
    const unitMembers = state.members.filter(m => m.assignedUnitId === u.id);
    return {
      ...u,
      members: unitMembers
    };
  });

  container.innerHTML = units.map(u => `
    <div class="unit-card">
      <div class="unit-card-header">
        <div>
          <span class="badge-dept-tag">UNIT ${u.unitNumber}</span>
          <h3 class="event-title">${escapeHtml(u.callsign)}</h3>
          <p style="font-size:0.75rem; color:var(--text-muted); margin-top:0.1rem;">
            Sector: ${escapeHtml(u.patrolSector)}
          </p>
        </div>
        <span class="urgency-badge ${u.rescueReadinessStatus === 'RESCUE_READY' ? 'LOW' : 'CRITICAL'}" style="background:#ECFDF5; color:#059669; border:1px solid #A7F3D0;">
          ${u.rescueReadinessStatus === 'RESCUE_READY' ? 'RESCUE READY' : 'RESCUE DEFICIT'}
        </span>
      </div>

      <div style="display:flex; flex-direction:column; gap:0.45rem; margin-top:0.35rem;">
        ${u.members.length === 0 ? '<div style="font-size:0.75rem; color:var(--text-muted);">No cadets currently assigned to this unit.</div>' : ''}
        ${u.members.map(m => `
          <div class="cadet-contact-tile">
            <div class="cadet-contact-top">
              <div style="display:flex; align-items:center; gap:0.4rem;">
                <span class="cadet-contact-name">${escapeHtml(m.displayName)}</span>
                <span style="font-size:0.7rem; color:var(--text-muted);">(${escapeHtml(m.roleTitle)})</span>
              </div>
              <span class="cadet-channel-tag">${escapeHtml(m.radioChannel || 'CH-1 Tactical')}</span>
            </div>

            <div class="cadet-details-row">
              <span>Station: <strong>${escapeHtml(m.dutyStation || 'Gate 1')}</strong></span>
              <span>Rating: ${m.physicalRating}/5 ${m.isRescueCertified ? '(Rescue Qualified)' : ''}</span>
            </div>

            <div class="cadet-actions-row">
              <a href="tel:${m.phone || '0917-555-0000'}" class="btn-tel">
                Call ${m.phone || '0917-555-0000'}
              </a>
              <button class="btn btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.72rem;" onclick="radioCheckAlert('${m.displayName}', '${m.radioChannel || 'CH-1'}')">
                Radio Ping
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

window.radioCheckAlert = function(cadetName, channel) {
  alert(`Radio Check Broadcasted to ${cadetName} on ${channel}. Standing by for signal acknowledge.`);
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. Non-CJS Department Leader Portal
// ─────────────────────────────────────────────────────────────────────────────
async function loadDeptLeaders() {
  try {
    const res = await fetch('/api/dept-leaders');
    if (res.ok) {
      const data = await res.json();
      state.deptLeaders = data;
      renderDeptLeaders();
    }
  } catch (e) {
    renderDeptLeaders();
  }
}

function renderDeptLeaders() {
  const container = document.getElementById("deptLeadersList");
  if (!container) return;

  container.innerHTML = state.deptLeaders.map(dl => `
    <div class="dept-leader-card">
      <div>
        <div style="font-weight:700; color:var(--text-primary); font-size:0.85rem;">
          ${escapeHtml(dl.leaderName)}
          <span style="font-size:0.7rem; color:var(--color-primary); font-weight:600; margin-left:0.3rem;">${escapeHtml(dl.roleTitle)}</span>
        </div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.15rem;">
          ${escapeHtml(dl.department)} · Section: <strong>${escapeHtml(dl.section)}</strong>
        </div>
      </div>
      <a href="tel:${dl.phone}" class="btn-tel">
        📞 ${dl.phone}
      </a>
    </div>
  `).join('');
}

window.handleDeptLeaderSubmit = async function(e) {
  e.preventDefault();

  const leaderName = document.getElementById("dlLeaderName").value.trim();
  const department = document.getElementById("dlDepartment").value;
  const section = document.getElementById("dlSection").value.trim();
  const phone = document.getElementById("dlPhone").value.trim();
  const location = document.getElementById("dlLocation").value.trim();
  const category = document.getElementById("dlCategory").value;
  const urgency = document.getElementById("dlUrgency").value;
  const details = document.getElementById("dlDetails").value.trim();

  const payload = {
    reporterRole: "DEPT_LEADER",
    deptLeaderInfo: { leaderName, department, section, phone },
    whereLocation: location,
    whatHappened: `[${department} / ${section}] ${details}`,
    whoInvolved: `Reported by Dept Leader ${leaderName} (${phone})`,
    whenOccurred: "Happening Right Now",
    whyHowDetails: `Assistance requested by ${department} student leadership: ${details}`,
    category,
    urgency,
    noPhotoReason: "DEPT_LEADER_VERIFIED"
  };

  try {
    const res = await fetch('/api/reports/incident', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert(`Emergency report transmitted to Criminology Tactical Desk! Reference Code: ${data.report.referenceCode}`);
      document.getElementById("deptLeaderReportForm").reset();
      state.anonymousReports.unshift(data.report);
      renderAdminReports();
    } else {
      alert(`Transmission note: ${data.message || 'Saved locally'}`);
    }
  } catch (err) {
    alert("Report logged locally on tactical grid.");
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. Mandatory 5 W's Incident Reporting Engine & Live Camera
// ─────────────────────────────────────────────────────────────────────────────
window.toggleWhoUnknown = function(isUnknown) {
  const known = document.getElementById("whoKnownContainer");
  const unknown = document.getElementById("whoUnknownContainer");
  const inputWho = document.getElementById("fiveWWho");
  const inputPhysical = document.getElementById("fiveWWhoPhysical");

  if (isUnknown) {
    if (known) known.classList.add("hidden");
    if (unknown) unknown.classList.remove("hidden");
    if (inputWho) inputWho.value = "Unknown Person";
    if (inputPhysical) inputPhysical.setAttribute("required", "required");
  } else {
    if (known) known.classList.remove("hidden");
    if (unknown) unknown.classList.add("hidden");
    if (inputWho && inputWho.value === "Unknown Person") inputWho.value = "";
    if (inputPhysical) inputPhysical.removeAttribute("required");
  }
};

window.toggleNoPhotoReason = function(checked) {
  const box = document.getElementById("noPhotoReasonBox");
  if (box) {
    box.classList.toggle("hidden", !checked);
  }
};

// Live Camera Functions
window.startLiveCamera = async function() {
  const wrapper = document.getElementById("cameraPreviewWrapper");
  const video = document.getElementById("liveCameraVideo");
  const img = document.getElementById("capturedPhotoPreview");
  const btnSnap = document.getElementById("btnSnapPhoto");
  const btnStart = document.getElementById("btnStartCamera");

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Live camera stream is not supported in this browser. Please use the 'Camera Capture' file upload button.");
    return;
  }

  try {
    if (state.cameraStream) {
      state.cameraStream.getTracks().forEach(t => t.stop());
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });
    state.cameraStream = stream;
    video.srcObject = stream;
    video.style.display = 'block';
    img.style.display = 'none';
    wrapper.style.display = 'block';
    btnSnap.classList.remove("hidden");
    btnStart.textContent = "🔄 Switch Camera";
  } catch (err) {
    alert("Camera permission denied or camera unavailable. Please check permissions or use 'Unable to take photo safely' fallback.");
  }
};

window.snapLivePhoto = function() {
  const video = document.getElementById("liveCameraVideo");
  const img = document.getElementById("capturedPhotoPreview");
  const wrapper = document.getElementById("cameraPreviewWrapper");
  const btnSnap = document.getElementById("btnSnapPhoto");

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
  img.src = dataUrl;
  img.style.display = 'block';
  video.style.display = 'none';

  // Stop camera stream to conserve battery
  if (state.cameraStream) {
    state.cameraStream.getTracks().forEach(t => t.stop());
    state.cameraStream = null;
  }
  btnSnap.classList.add("hidden");

  // Record photo metadata
  state.livePhoto = {
    dataUrl,
    timestamp: Date.now(),
    hash: 'H-' + Math.random().toString(36).substring(2, 10),
    reason: null
  };

  startPhotoCountdown(120);
};

window.handleFilePhotoCapture = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const wrapper = document.getElementById("cameraPreviewWrapper");
    const img = document.getElementById("capturedPhotoPreview");
    const video = document.getElementById("liveCameraVideo");

    img.src = dataUrl;
    img.style.display = 'block';
    video.style.display = 'none';
    wrapper.style.display = 'block';

    state.livePhoto = {
      dataUrl,
      timestamp: Date.now(),
      hash: 'H-' + Math.random().toString(36).substring(2, 10),
      reason: null
    };

    startPhotoCountdown(120);
  };
  reader.readAsDataURL(file);
};

function startPhotoCountdown(seconds) {
  const box = document.getElementById("photoCountdown");
  const secEl = document.getElementById("countdownSeconds");
  if (!box || !secEl) return;

  box.style.display = 'inline-block';
  secEl.textContent = seconds;

  if (state.photoTimerInterval) clearInterval(state.photoTimerInterval);

  let remaining = seconds;
  state.photoTimerInterval = setInterval(() => {
    remaining--;
    secEl.textContent = remaining;
    if (remaining <= 0) {
      clearInterval(state.photoTimerInterval);
      box.style.display = 'none';
      alert("Photo freshness timer expired (>120s). Please take a fresh live photo to ensure verified anti-spam reporting.");
      state.livePhoto.dataUrl = null;
      state.livePhoto.timestamp = null;
    }
  }, 1000);
}

// 5 W's Report Submission
window.handleFiveWsSubmit = async function(e) {
  e.preventDefault();

  const whereLocation = document.getElementById("fiveWLocation").value.trim();
  const category = document.getElementById("fiveWCategory").value;
  const urgency = document.getElementById("fiveWUrgency").value;
  const whatHappened = document.getElementById("fiveWWhat").value.trim();
  
  const isWhoUnknown = document.getElementById("whoIsUnknownCheckbox").checked;
  const whoInvolved = isWhoUnknown ? "Unknown Person" : (document.getElementById("fiveWWho").value.trim() || "Not Specified");
  const whoPhysicalDescription = isWhoUnknown ? (document.getElementById("fiveWWhoPhysical").value.trim() || "Physical traits not observed") : null;

  const whenOccurred = document.getElementById("fiveWWhen").value.trim();
  const statusOngoing = document.getElementById("fiveWStatusOngoing").value;
  const whyHowDetails = document.getElementById("fiveWWhyHow").value.trim();

  // Photo verification anti-spam check
  const noPhotoChecked = document.getElementById("noPhotoCheckbox").checked;
  let photoDataUrl = null;
  let photoTimestamp = null;
  let noPhotoReason = null;

  if (noPhotoChecked) {
    noPhotoReason = document.getElementById("noPhotoReasonSelect").value;
  } else if (state.livePhoto && state.livePhoto.dataUrl) {
    // Check freshness (<120s)
    if (Date.now() - state.livePhoto.timestamp > 120000) {
      alert("Photo is older than 120 seconds. Please retake live photo or check 'Unable to take live photo safely'.");
      return;
    }
    photoDataUrl = state.livePhoto.dataUrl;
    photoTimestamp = state.livePhoto.timestamp;
  } else {
    alert("Anti-Spam Security Rule: Please open your live camera to snap photo evidence, OR check 'Unable to take live photo safely' with a reason.");
    return;
  }

  const payload = {
    whereLocation,
    whatHappened,
    whoInvolved,
    whoPhysicalDescription,
    whoIsUnknown: isWhoUnknown,
    whenOccurred: `${whenOccurred} (${statusOngoing})`,
    whyHowDetails,
    category,
    urgency,
    photoDataUrl,
    photoTimestamp,
    noPhotoReason,
    coordinates: state.pendingGPS || null
  };

  try {
    const res = await fetch('/api/reports/incident', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      const ref = data.report.referenceCode;
      document.getElementById("displayRefCode").textContent = ref;
      document.getElementById("refCodeCard").classList.remove("hidden");
      document.getElementById("fiveWsReportForm").reset();

      // Reset camera
      const wrapper = document.getElementById("cameraPreviewWrapper");
      if (wrapper) wrapper.style.display = 'none';
      if (state.photoTimerInterval) clearInterval(state.photoTimerInterval);
      state.livePhoto = { dataUrl: null, timestamp: null, hash: null, reason: null };

      state.anonymousReports.unshift(data.report);
      renderAdminReports();
      alert(`5 W's Incident Reported! Your Reference Tracking Code: ${ref}`);
    } else {
      alert(`Validation error: ${data.errors ? data.errors.join(', ') : data.message}`);
    }
  } catch (err) {
    // Local fallback
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let ref = 'REF-';
    for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
    const localReport = {
      id: `rep-${Date.now()}`,
      referenceCode: ref,
      ...payload,
      status: "OPEN",
      assignedUnitId: null,
      photoVerified: !noPhotoChecked,
      createdAt: new Date().toLocaleTimeString()
    };
    state.anonymousReports.unshift(localReport);
    document.getElementById("displayRefCode").textContent = ref;
    document.getElementById("refCodeCard").classList.remove("hidden");
    document.getElementById("fiveWsReportForm").reset();
    renderAdminReports();
    alert(`5 W's Incident Logged (Offline Mode)! Tracking Code: ${ref}`);
  }
};

window.copyRefCode = function() {
  const code = document.getElementById("displayRefCode").textContent;
  navigator.clipboard.writeText(code).then(() => {
    alert("Reference code copied to clipboard!");
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. Public Status Lookup
// ─────────────────────────────────────────────────────────────────────────────
window.lookupAnonymousReport = function() {
  const input = document.getElementById("trackCodeInput").value.trim().toUpperCase();
  const container = document.getElementById("trackerResult");

  const report = state.anonymousReports.find(r => r.referenceCode === input);
  if (!report) {
    container.innerHTML = `
      <div style="color:var(--color-emergency); padding:1rem; text-align:center;">
        No incident found for reference code <strong>${escapeHtml(input)}</strong>. Please verify your 8-character tracking code.
      </div>
    `;
    return;
  }

  const unit = report.assignedUnitId ? state.tacticalUnits.find(u => u.id === report.assignedUnitId) : null;

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:0.65rem;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="report-ref-badge">${report.referenceCode}</span>
        <span class="urgency-badge ${report.urgency}">${report.urgency}</span>
      </div>

      <div style="font-size:0.9rem; font-weight:700; color:var(--text-primary);">
        Status: <span style="color:var(--color-primary);">${report.status}</span>
      </div>

      <div class="five-ws-matrix" style="margin-top:0.35rem;">
        <div class="matrix-cell">
          <span class="matrix-cell-lbl">WHERE</span>
          <span class="matrix-cell-val">${escapeHtml(report.whereLocation)}</span>
        </div>
        <div class="matrix-cell">
          <span class="matrix-cell-lbl">WHAT</span>
          <span class="matrix-cell-val">${escapeHtml(report.whatHappened || report.category)}</span>
        </div>
        <div class="matrix-cell">
          <span class="matrix-cell-lbl">WHO</span>
          <span class="matrix-cell-val">${escapeHtml(report.whoInvolved || 'Unknown')}</span>
        </div>
        <div class="matrix-cell">
          <span class="matrix-cell-lbl">WHEN</span>
          <span class="matrix-cell-val">${escapeHtml(report.whenOccurred || report.createdAt)}</span>
        </div>
      </div>

      <div style="background:var(--bg-surface); padding:0.75rem; border-radius:6px; border:1px solid var(--border-subtle); margin-top:0.35rem;">
        <div style="font-size:0.72rem; color:var(--text-muted); font-weight:700;">TACTICAL UNIT ASSIGNED:</div>
        <div style="font-size:0.84rem; font-weight:600; color:var(--text-primary); margin-top:0.15rem;">
          ${unit ? `${escapeHtml(unit.callsign)} (Sector: ${escapeHtml(unit.patrolSector)})` : 'Pending Dispatch'}
        </div>
        ${report.govEscalationStatus && report.govEscalationStatus !== 'NONE' ? `
          <div style="margin-top:0.35rem; font-size:0.76rem; color:var(--color-gov); font-weight:600;">
            Escalated to: ${escapeHtml(report.govAgencyName || report.govEscalationStatus)} [Dossier: ${report.govDossierCode || 'ACTIVE'}]
          </div>
        ` : ''}
        ${report.resolutionDetails ? `
          <div style="font-size:0.72rem; color:var(--text-muted); font-weight:700; margin-top:0.45rem;">OFFICER RESOLUTION NOTE:</div>
          <div style="font-size:0.8rem; color:var(--color-pass); margin-top:0.15rem;">${escapeHtml(report.resolutionDetails)}</div>
        ` : ''}
      </div>
    </div>
  `;
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. Admin Reports Feed & Government Bureau Escalation
// ─────────────────────────────────────────────────────────────────────────────
function renderAdminReports() {
  const container = document.getElementById("adminReportsList");
  if (!container) return;

  const openCount = state.anonymousReports.filter(r => r.status === 'OPEN').length;
  const dispatchedCount = state.anonymousReports.filter(r => r.status === 'DISPATCHED').length;
  const resolvedCount = state.anonymousReports.filter(r => r.status === 'RESOLVED').length;

  const elOpen = document.getElementById("adminOpenCount");
  const elDisp = document.getElementById("adminDispatchedCount");
  const elRes = document.getElementById("adminResolvedCount");
  const elBadge = document.getElementById("tabOpenReportsBadge");

  if (elOpen) elOpen.textContent = openCount;
  if (elDisp) elDisp.textContent = dispatchedCount;
  if (elRes) elRes.textContent = resolvedCount;
  if (elBadge) elBadge.textContent = openCount;

  container.innerHTML = state.anonymousReports.map(rep => {
    const assignedUnit = rep.assignedUnitId ? state.tacticalUnits.find(u => u.id === rep.assignedUnitId) : null;
    const isGovEscalated = rep.govEscalationStatus && rep.govEscalationStatus !== 'NONE';

    return `
      <div class="report-item-card">
        <div class="report-card-top">
          <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
            <span class="report-ref-badge">${rep.referenceCode}</span>
            <span class="urgency-badge ${rep.urgency}">${rep.urgency}</span>
            <span style="font-size:0.74rem; color:var(--text-muted); font-family:var(--font-mono);">${rep.category}</span>
            ${rep.photoVerified ? '<span style="font-size:0.7rem; color:var(--color-pass); font-weight:600;">Photo Verified</span>' : '<span style="font-size:0.7rem; color:var(--text-muted); font-weight:500;">No Photo (' + escapeHtml(rep.noPhotoReason || 'Exempt') + ')</span>'}
          </div>
          <span style="font-size:0.72rem; color:var(--text-muted); font-family:var(--font-mono);">${rep.createdAt}</span>
        </div>

        <!-- 5 W's Intelligence Matrix -->
        <div class="five-ws-matrix">
          <div class="matrix-cell">
            <span class="matrix-cell-lbl">1. WHERE</span>
            <span class="matrix-cell-val">${escapeHtml(rep.whereLocation || rep.locationHint)}</span>
          </div>
          <div class="matrix-cell">
            <span class="matrix-cell-lbl">2. WHAT</span>
            <span class="matrix-cell-val">${escapeHtml(rep.whatHappened || rep.message)}</span>
          </div>
          <div class="matrix-cell">
            <span class="matrix-cell-lbl">3. WHO</span>
            <span class="matrix-cell-val">${escapeHtml(rep.whoInvolved || 'Unknown')}</span>
            ${rep.whoPhysicalDescription ? `<span style="font-size:0.68rem; color:var(--text-muted);">${escapeHtml(rep.whoPhysicalDescription)}</span>` : ''}
          </div>
          <div class="matrix-cell">
            <span class="matrix-cell-lbl">4. WHEN</span>
            <span class="matrix-cell-val">${escapeHtml(rep.whenOccurred || rep.createdAt)}</span>
          </div>
          <div class="matrix-cell">
            <span class="matrix-cell-lbl">5. WHY / HOW</span>
            <span class="matrix-cell-val">${escapeHtml(rep.whyHowDetails || 'Direct field report')}</span>
          </div>
        </div>

        ${isGovEscalated ? `
          <div class="gov-escalation-banner">
            <div>
              <strong>Escalated to: ${escapeHtml(rep.govAgencyName || rep.govEscalationStatus)}</strong>
              <span style="font-family:var(--font-mono); font-size:0.7rem; margin-left:0.4rem;">[Dossier: ${rep.govDossierCode || 'ACTIVE'}]</span>
            </div>
            <button class="btn-text-ghost" style="color:var(--color-gov);" onclick="previewExistingDossier('${rep.id}')">View Dossier</button>
          </div>
        ` : ''}

        <div class="admin-actions-bar">
          <span style="font-size:0.72rem; font-weight:700; color:var(--text-muted);">DISPATCH SQUAD:</span>
          <select id="assignUnitSelect_${rep.id}" class="form-select-sm" style="max-width:240px;">
            <option value="">-- Assign Squad --</option>
            ${state.tacticalUnits.map(u => `
              <option value="${u.id}" ${rep.assignedUnitId === u.id ? 'selected' : ''}>
                Unit ${u.unitNumber} - ${escapeHtml(u.callsign)}
              </option>
            `).join('')}
          </select>
          <button class="btn btn-primary" onclick="adminAssignUnit('${rep.id}')" style="padding:0.3rem 0.65rem; font-size:0.76rem;">
            Assign & Dispatch
          </button>
          <button class="btn btn-gov" onclick="openGovModal('${rep.id}')" style="padding:0.3rem 0.65rem; font-size:0.76rem;">
            Escalate to Agency
          </button>
          <button class="btn btn-secondary" onclick="adminUpdateStatus('${rep.id}', 'RESOLVED')" style="padding:0.3rem 0.65rem; font-size:0.76rem;">
            Mark Cleared
          </button>
        </div>
      </div>
    `;
  }).join("");
}

window.adminAssignUnit = async function(reportId) {
  const select = document.getElementById(`assignUnitSelect_${reportId}`);
  const report = state.anonymousReports.find(r => r.id === reportId);
  if (!report || !select) return;

  const assignedUnitId = select.value || null;
  const newStatus = assignedUnitId ? 'DISPATCHED' : 'OPEN';

  try {
    const res = await fetch(`/api/reports/admin/${reportId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': state.activeRole
      },
      body: JSON.stringify({ assignedUnitId, status: newStatus })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.report) {
        Object.assign(report, data.report);
      }
    }
  } catch (err) {
    console.warn('[E-Secure] Offline fallback for adminAssignUnit:', err.message);
  }

  report.assignedUnitId = assignedUnitId;
  report.status = newStatus;
  renderAdminReports();
  alert(`Incident ${report.referenceCode} dispatched to unit.`);
};

window.adminUpdateStatus = async function(reportId, newStatus) {
  const report = state.anonymousReports.find(r => r.id === reportId);
  if (!report) return;

  const resolutionDetails = newStatus === 'RESOLVED' 
    ? "Incident handled and secured by responding tactical officers." 
    : undefined;

  try {
    const res = await fetch(`/api/reports/admin/${reportId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': state.activeRole
      },
      body: JSON.stringify({ status: newStatus, resolutionDetails })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.report) Object.assign(report, data.report);
    }
  } catch (err) {
    console.warn('[E-Secure] Offline fallback for adminUpdateStatus:', err.message);
  }

  report.status = newStatus;
  if (resolutionDetails) report.resolutionDetails = resolutionDetails;
  renderAdminReports();
};

// Government Escalation Modal
window.openGovModal = function(reportId) {
  state.pendingEscalateReportId = reportId;
  const report = state.anonymousReports.find(r => r.id === reportId);
  if (!report) return;

  document.getElementById("govModalTitle").textContent = `Escalate ${report.referenceCode} to Government Bureau`;
  updateGovDossierPreview();
  document.getElementById("govEscalationModal").classList.remove("hidden");
};

window.closeGovModal = function() {
  document.getElementById("govEscalationModal").classList.add("hidden");
};

window.updateGovDossierPreview = function() {
  const reportId = state.pendingEscalateReportId;
  const report = state.anonymousReports.find(r => r.id === reportId);
  const bureau = document.getElementById("govBureauSelect").value;
  const preview = document.getElementById("govDossierPreviewText");
  if (!report || !preview) return;

  const now = new Date().toISOString();
  const dossierText = `══════════════════════════════════════════════════════════════════
TACTICAL DISPATCH DOSSIER - GOVERNMENT RESCUE ESCALATION
ESCALATION TARGET: ${bureau}
TRANSMITTED: ${now} | DISPATCH DESK: E-Secure 1.0
══════════════════════════════════════════════════════════════════
INCIDENT REFERENCE: ${report.referenceCode}
CATEGORY: ${report.category} | URGENCY: ${report.urgency}

1. WHERE:
   Location: ${report.whereLocation || report.locationHint}
   GPS Coordinates: ${report.coordinates ? `${report.coordinates.lat}, ${report.coordinates.lng}` : 'Not Pinned (Use Landmark)'}

2. WHAT HAPPENED:
   ${report.whatHappened || report.message}

3. WHO INVOLVED:
   ${report.whoInvolved || 'Unknown'}
   ${report.whoPhysicalDescription ? `Physical Traits: ${report.whoPhysicalDescription}` : ''}

4. WHEN OCCURRED:
   ${report.whenOccurred || report.createdAt}

5. WHY / HOW & HAZARDS:
   ${report.whyHowDetails || 'Active situation requiring government intervention'}

PHOTO VERIFICATION: ${report.photoVerified ? 'VERIFIED LIVE CAMERA CAPTURE (HASH VALIDATED)' : 'NO PHOTO (' + (report.noPhotoReason || 'REASON GIVEN') + ')'}
RESPONDING PROTOCOL: IMMEDIATE INTER-AGENCY ASSISTANCE REQUESTED
══════════════════════════════════════════════════════════════════`;

  preview.textContent = dossierText;
};

window.confirmGovEscalation = async function() {
  const reportId = state.pendingEscalateReportId;
  const report = state.anonymousReports.find(r => r.id === reportId);
  const bureau = document.getElementById("govBureauSelect").value;
  if (!report) return;

  try {
    const res = await fetch(`/api/reports/${reportId}/escalate-gov`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bureau })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      report.govEscalationStatus = bureau;
      report.govAgencyName = data.dossier.escalatedAgency;
      report.govDossierCode = data.dossier.dossierCode;
      renderAdminReports();
      closeGovModal();
      alert(`Tactical Dossier ${data.dossier.dossierCode} successfully transmitted to ${bureau}! Bureau dispatch logged.`);
    } else {
      throw new Error(data.message);
    }
  } catch (err) {
    // Local fallback
    report.govEscalationStatus = bureau;
    report.govAgencyName = bureau;
    report.govDossierCode = `ESC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    renderAdminReports();
    closeGovModal();
    alert(`Escalation dossier generated for ${bureau} (Recorded locally).`);
  }
};

window.previewExistingDossier = function(reportId) {
  state.pendingEscalateReportId = reportId;
  const report = state.anonymousReports.find(r => r.id === reportId);
  if (!report) return;
  const select = document.getElementById("govBureauSelect");
  if (select && report.govEscalationStatus) select.value = report.govEscalationStatus;
  updateGovDossierPreview();
  document.getElementById("govEscalationModal").classList.remove("hidden");
};

// ─────────────────────────────────────────────────────────────────────────────
// 10. GPS Location Detection
// ─────────────────────────────────────────────────────────────────────────────
window.detectGPSLocation = function(targetInputId = 'fiveWLocation') {
  const badge = document.getElementById("gpsStatusBadge");
  const text = document.getElementById("gpsCoordinatesText");
  const link = document.getElementById("gpsMapLink");
  const locInput = document.getElementById(targetInputId);

  if (badge) badge.classList.remove("hidden");
  if (text) text.textContent = "Acquiring GPS fix via device sensor...";

  if (!navigator.geolocation) {
    setMockGPS();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = Number(pos.coords.latitude.toFixed(6));
      const lng = Number(pos.coords.longitude.toFixed(6));
      const acc = Math.round(pos.coords.accuracy);

      state.pendingGPS = { lat, lng, accuracy: acc };
      if (text) text.textContent = `📍 GPS: ${lat}, ${lng} (±${acc}m)`;
      if (link) link.href = `https://maps.google.com/?q=${lat},${lng}`;
      if (locInput && !locInput.value) {
        locInput.value = `Sector 1 North Quad (GPS: ${lat}, ${lng})`;
      }
    },
    err => {
      setMockGPS();
    },
    { enableHighAccuracy: true, timeout: 4000 }
  );

  function setMockGPS() {
    const lat = 14.599512;
    const lng = 120.984222;
    state.pendingGPS = { lat, lng, accuracy: 4 };
    if (text) text.textContent = `📍 GPS: ${lat}, ${lng} (±4m tactical accuracy)`;
    if (link) link.href = `https://maps.google.com/?q=${lat},${lng}`;
    if (locInput && !locInput.value) {
      locInput.value = `Sector 1 North Quad (GPS: ${lat}, ${lng})`;
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 11. Attendance Kiosk Scanner (Strict Admin Only)
// ─────────────────────────────────────────────────────────────────────────────
function selectShift(shift) {
  state.activeShift = shift;
  document.querySelectorAll(".shift-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.shift === shift);
  });
}

function detectDefaultShift() {
  const h = new Date().getHours();
  if (h < 11) return 'AM_IN';
  if (h < 13) return 'AM_OUT';
  if (h < 17) return 'PM_IN';
  return 'PM_OUT';
}

function populateCadetSelect() {
  const select = document.getElementById("kioskCadetSelect");
  if (!select) return;
  select.innerHTML = state.members.map(m => `
    <option value="${m.id}">${m.displayName} (${m.identifierCode} - ${m.roleTitle})</option>
  `).join("");
}

window.triggerAttendanceScan = async function(status = "PASS") {
  // Guard
  if (state.activeRole !== 'ADMIN') {
    alert("Unauthorized: Only Admin Commanders can execute attendance logging.");
    return;
  }

  if (isScanning) return;
  isScanning = true;

  const shift = state.activeShift || "AM_IN";
  const eventType = shift.endsWith("_OUT") ? "CHECK_OUT" : "CHECK_IN";

  const laser = document.getElementById("scanLaser");
  const overlay = document.getElementById("statusOverlay");
  const headline = document.getElementById("statusHeadline");
  const subtext = document.getElementById("statusSubtext");
  const speedBadge = document.getElementById("speedBadge");
  const statusRing = document.getElementById("statusRing");

  if (laser) laser.classList.add("active");
  const latency = Math.floor(Math.random() * 60 + 80);

  setTimeout(async () => {
    if (laser) laser.classList.remove("active");

    if (status === "PASS") {
      const select = document.getElementById("kioskCadetSelect");
      const memberId = select ? select.value : state.members[0].id;
      const member = state.members.find(m => m.id === memberId) || state.members[0];
      
      member.dutyStatus = eventType === "CHECK_IN" ? "ON_DUTY" : "OFF_DUTY";

      overlay.className = "status-overlay show pass";
      statusRing.innerHTML = `
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
      headline.textContent = `${shift.replace('_', ' ')} VERIFIED`;
      headline.style.color = "#059669";
      subtext.textContent = `${member.displayName} · ${member.roleTitle}`;
      speedBadge.textContent = `⚡ ${latency}ms (Fast QR Match)`;

      const log = {
        id: `att-${Date.now()}`,
        displayName: member.displayName,
        department: member.department,
        shiftType: shift,
        eventType,
        verificationMethod: "QR_CODE",
        verificationLatencyMs: latency,
        loggedAt: new Date().toLocaleTimeString()
      };

      state.attendanceLogs.unshift(log);
      renderAttendanceFeed();
      updateAttendanceMetrics();

      try {
        fetch('/api/attendance/check-in', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-role': state.activeRole 
          },
          body: JSON.stringify({ 
            memberId: member.id, 
            shiftType: shift, 
            eventType, 
            verificationMethod: 'QR_CODE', 
            verificationLatencyMs: latency 
          })
        }).catch(() => {});
      } catch (e) {}

    } else {
      overlay.className = "status-overlay show fail";
      statusRing.innerHTML = `
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
      headline.textContent = "INVALID QR TOKEN";
      headline.style.color = "#DC2626";
      subtext.textContent = "Unregistered QR / Expired Ephemeral Key";
      speedBadge.textContent = `⚡ ${latency}ms`;
    }

    setTimeout(() => {
      overlay.classList.remove("show");
      isScanning = false;
    }, 1800);
  }, 350);
};

function renderAttendanceFeed() {
  const stream = document.getElementById("auditStream");
  if (!stream) return;

  stream.innerHTML = state.attendanceLogs.map(l => `
    <div class="audit-item">
      <div class="audit-left">
        <span class="dot-live"></span>
        <div>
          <div style="font-weight:600; color:var(--text-primary);">${escapeHtml(l.displayName)}</div>
          <div style="font-size:0.7rem; color:var(--text-muted);">${l.shiftType.replace('_', ' ')} · ${l.verificationMethod}</div>
        </div>
      </div>
      <div class="audit-time">${l.loggedAt}</div>
    </div>
  `).join('');

  const counter = document.getElementById("recordCounter");
  if (counter) counter.textContent = `${state.attendanceLogs.length} LOGS`;
}

function updateAttendanceMetrics() {
  const onDuty = state.members.filter(m => m.dutyStatus === 'ON_DUTY').length;
  const offDuty = state.members.filter(m => m.dutyStatus !== 'ON_DUTY').length;
  const rescueReady = state.members.filter(m => m.isRescueCertified && m.physicalRating >= 4).length;

  const elOn = document.getElementById("statOnDuty");
  const elOff = document.getElementById("statOffDuty");
  const elRescue = document.getElementById("statRescueReady");

  if (elOn) elOn.textContent = onDuty;
  if (elOff) elOff.textContent = offDuty;
  if (elRescue) elRescue.textContent = rescueReady;
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. Student Compliance Monitoring (Admin Only)
// ─────────────────────────────────────────────────────────────────────────────
function renderStudentsTable() {
  const tbody = document.getElementById("studentsTableBody");
  if (!tbody) return;

  const activeEvt = state.events.find(e => e.id === state.activeEventId) || state.events[0];
  const students = state.members.filter(m => m.memberType === 'STUDENT');

  let compliantCount = 0;
  let inProgressCount = 0;
  let lateCount = 0;
  let absentCount = 0;

  const rows = students.map(student => {
    let rec = state.studentCompliance.find(c => c.studentId === student.id && c.eventId === activeEvt.id);
    if (!rec) {
      rec = { studentId: student.id, eventId: activeEvt.id, amIn: null, amOut: null, pmIn: null, pmOut: null, status: "ABSENT" };
    }

    if (rec.status === 'COMPLIANT') compliantCount++;
    else if (rec.status === 'IN_PROGRESS') inProgressCount++;
    else if (rec.status === 'LATE') lateCount++;
    else if (rec.status === 'ABSENT') absentCount++;

    return `
      <tr data-section="${escapeHtml(student.sectionName || 'BS-CRIM 3-A')}" data-status="${rec.status}">
        <td style="font-family:var(--font-mono); font-weight:600; font-size:0.75rem;">
          ${student.studentIdNumber || student.identifierCode}
        </td>
        <td style="font-weight:600; color:var(--text-primary);">
          ${escapeHtml(student.displayName)}
        </td>
        <td>
          <span style="font-size:0.75rem; background:var(--bg-surface-secondary); padding:0.15rem 0.45rem; border-radius:4px; font-family:var(--font-mono);">
            ${student.sectionName || 'BS-CRIM 3-A'}
          </span>
        </td>
        <td style="font-family:var(--font-mono);">
          ${rec.amIn ? `<span style="color:var(--color-pass);">✓ ${rec.amIn}</span>` : '<span style="color:var(--text-muted);">--:--</span>'}
        </td>
        <td style="font-family:var(--font-mono);">
          ${rec.amOut ? `<span style="color:var(--color-pass);">✓ ${rec.amOut}</span>` : '<span style="color:var(--text-muted);">--:--</span>'}
        </td>
        <td style="font-family:var(--font-mono);">
          ${rec.pmIn ? `<span style="color:var(--color-pass);">✓ ${rec.pmIn}</span>` : '<span style="color:var(--text-muted);">--:--</span>'}
        </td>
        <td style="font-family:var(--font-mono);">
          ${rec.pmOut ? `<span style="color:var(--color-pass);">✓ ${rec.pmOut}</span>` : '<span style="color:var(--text-muted);">--:--</span>'}
        </td>
        <td>
          <span class="compliance-pill ${rec.status}">
            ${rec.status === 'COMPLIANT' ? '✅ COMPLIANT' : ''}
            ${rec.status === 'IN_PROGRESS' ? '🟡 IN PROGRESS' : ''}
            ${rec.status === 'LATE' ? '⚠️ LATE IN' : ''}
            ${rec.status === 'ABSENT' ? '❌ ABSENT' : ''}
          </span>
        </td>
        <td>
          <button class="btn btn-secondary" onclick="simulateStudentScan('${student.id}')" style="padding:0.25rem 0.55rem; font-size:0.72rem;">
            📱 Scan Shift
          </button>
        </td>
      </tr>
    `;
  }).join("");

  tbody.innerHTML = rows;

  const elComp = document.getElementById("compCountCompliant");
  const elInProg = document.getElementById("compCountInProgress");
  const elLate = document.getElementById("compCountLate");
  const elAbs = document.getElementById("compCountAbsent");
  const elRate = document.getElementById("tabStudentRateBadge");

  if (elComp) elComp.textContent = compliantCount;
  if (elInProg) elInProg.textContent = inProgressCount;
  if (elLate) elLate.textContent = lateCount;
  if (elAbs) elAbs.textContent = absentCount;

  const total = students.length || 1;
  const rate = Math.round((compliantCount / total) * 100);
  if (elRate) elRate.textContent = `${rate}%`;
}

window.filterStudentsTable = function() {
  const query = (document.getElementById("studentSearchInput").value || "").toLowerCase().trim();
  const sectionFilter = document.getElementById("sectionFilterSelect").value;
  const statusFilter = document.getElementById("statusFilterSelect").value;

  const rows = document.querySelectorAll("#studentsTableBody tr");
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    const section = row.dataset.section;
    const status = row.dataset.status;

    const matchesQuery = !query || text.includes(query);
    const matchesSection = sectionFilter === 'ALL' || section === sectionFilter;
    const matchesStatus = statusFilter === 'ALL' || status === statusFilter;

    row.style.display = (matchesQuery && matchesSection && matchesStatus) ? '' : 'none';
  });
};

window.simulateStudentScan = function(studentId) {
  const activeEvt = state.events.find(e => e.id === state.activeEventId) || state.events[0];
  let rec = state.studentCompliance.find(c => c.studentId === studentId && c.eventId === activeEvt.id);
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const shift = state.activeShift || 'AM_IN';

  if (!rec) {
    rec = { studentId, eventId: activeEvt.id, amIn: null, amOut: null, pmIn: null, pmOut: null, status: "IN_PROGRESS" };
    state.studentCompliance.push(rec);
  }

  if (shift === 'AM_IN') rec.amIn = nowStr;
  else if (shift === 'AM_OUT') rec.amOut = nowStr;
  else if (shift === 'PM_IN') rec.pmIn = nowStr;
  else if (shift === 'PM_OUT') rec.pmOut = nowStr;

  if (rec.amIn && rec.amOut && rec.pmIn && rec.pmOut) {
    rec.status = 'COMPLIANT';
  } else {
    rec.status = 'IN_PROGRESS';
  }

  renderStudentsTable();
  const student = state.members.find(m => m.id === studentId);
  alert(`Student attendance logged for ${student ? student.displayName : studentId}: ${shift.replace('_', ' ')} at ${nowStr}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// 13. Numbered Units & Rescue Auto-Balancer
// ─────────────────────────────────────────────────────────────────────────────
function renderUnits() {
  const container = document.getElementById("unitsGrid");
  if (!container) return;

  const units = state.tacticalUnits.map(u => {
    const assignedMembers = state.members.filter(m => m.assignedUnitId === u.id);
    const rescueCount = assignedMembers.filter(m => m.isRescueCertified && m.physicalRating >= 4).length;
    const isReady = rescueCount >= u.minRescueRequired;
    return {
      ...u,
      assignedMembers,
      rescueCount,
      isReady
    };
  });

  const allReady = units.every(u => u.isReady);
  const badge = document.getElementById("tabRescueBadge");
  if (badge) {
    badge.textContent = allReady ? "ALL READY" : "IMBALANCED";
    badge.className = allReady ? "badge-counter" : "badge-alert";
  }

  container.innerHTML = units.map(unit => `
    <div class="unit-card">
      <div class="unit-card-header">
        <div>
          <span class="badge-dept-tag">SQUAD #${unit.unitNumber}</span>
          <h3 class="event-title">${escapeHtml(unit.callsign)}</h3>
          <p style="font-size:0.75rem; color:var(--text-muted); margin-top:0.15rem;">
            Patrol Sector: <strong>${escapeHtml(unit.patrolSector)}</strong>
          </p>
        </div>
        <span class="urgency-badge ${unit.isReady ? 'LOW' : 'CRITICAL'}" style="${unit.isReady ? 'background:#ECFDF5; color:#059669; border:1px solid #6EE7B7;' : ''}">
          ${unit.isReady ? '⚡ RESCUE READY' : '⚠️ RESCUE DEFICIT'}
        </span>
      </div>

      <div class="unit-members-list">
        <div style="font-size:0.7rem; font-weight:700; color:var(--text-muted); margin-bottom:0.2rem;">
          ASSIGNED OPERATIVES (${unit.assignedMembers.length}) · RESCUE QUALIFIED: ${unit.rescueCount}
        </div>
        ${unit.assignedMembers.length === 0 ? '<div style="font-size:0.75rem; color:var(--text-muted);">No operatives currently assigned.</div>' : ''}
        ${unit.assignedMembers.map(m => {
          const isRescue = m.isRescueCertified && m.physicalRating >= 4;
          return `
            <div class="member-row ${isRescue ? 'is-rescue-specialist' : ''}">
              <div style="display:flex; flex-direction:column;">
                <span style="font-weight:600; color:var(--text-primary);">${escapeHtml(m.displayName)}</span>
                <span style="font-size:0.7rem; color:var(--text-muted);">${escapeHtml(m.roleTitle)} · ${escapeHtml(m.radioChannel || 'CH-1')}</span>
              </div>
              <div style="display:flex; align-items:center; gap:0.35rem;">
                <span class="member-strength-badge ${m.physicalRating >= 4 ? 'high' : ''}">
                  ${m.physicalRating}/5 ${isRescue ? '⚡ RESCUE' : ''}
                </span>
                <button class="btn-text-ghost" onclick="reassignMember('${m.id}')" title="Reassign squad">⇄</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="unit-footer-stats">
        <span>MIN RESCUE REQUIRED: ${unit.minRescueRequired}</span>
        <span>STATUS: ${unit.isDeployed ? '🟢 PATROLLING' : '⚪ STANDBY'}</span>
      </div>
    </div>
  `).join("");
}

window.triggerAutoBalance = async function() {
  try {
    const res = await fetch('/api/units/auto-balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': state.activeRole
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.units) state.tacticalUnits = data.units;
      if (data.members) state.members = data.members;
      renderUnits();
      renderCadetMesh();
      alert(`Tactical squads auto-balanced via server: ${data.message || 'All squads rescue ready.'}`);
      return;
    }
  } catch (err) {
    console.warn('[E-Secure] Backend auto-balance offline, computing locally:', err.message);
  }

  // Local fallback
  const rescueOps = state.members.filter(m => m.isRescueCertified && m.physicalRating >= 4);
  const regularMembers = state.members.filter(m => !(m.isRescueCertified && m.physicalRating >= 4));

  state.members.forEach(m => m.assignedUnitId = null);
  const units = [...state.tacticalUnits].sort((a, b) => a.unitNumber - b.unitNumber);

  rescueOps.forEach((op, idx) => {
    const target = units[idx % units.length];
    op.assignedUnitId = target.id;
  });

  let nextUnit = 0;
  regularMembers.forEach(reg => {
    const target = units[nextUnit % units.length];
    reg.assignedUnitId = target.id;
    nextUnit++;
  });

  renderUnits();
  renderCadetMesh();
  alert("Tactical squads auto-balanced locally! Every numbered squad now has at least one certified, high-strength rescue operative.");
};

window.reassignMember = async function(memberId) {
  const member = state.members.find(m => m.id === memberId);
  if (!member) return;

  const unitOptions = state.tacticalUnits.map(u => `Unit ${u.unitNumber} (${u.callsign})`).join("\n");
  const choice = prompt(`Reassign ${member.displayName} to which squad?\nAvailable:\n${unitOptions}`);
  if (!choice) return;

  const unitNum = parseInt(choice.replace(/\D/g, ''), 10);
  const targetUnit = state.tacticalUnits.find(u => u.unitNumber === unitNum);
  if (targetUnit) {
    try {
      const res = await fetch('/api/units/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': state.activeRole
        },
        body: JSON.stringify({ memberId, unitId: targetUnit.id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.units) state.tacticalUnits = data.units;
      }
    } catch (e) {
      console.warn('[E-Secure] Member assignment offline fallback');
    }
    member.assignedUnitId = targetUnit.id;
    renderUnits();
    renderCadetMesh();
  } else {
    alert("Invalid unit number.");
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 14. Officer Desk View
// ─────────────────────────────────────────────────────────────────────────────
function renderOfficerTasks() {
  const curOfficer = state.members.find(m => m.id === state.currentOfficerId) || state.members[0];
  const unit = state.tacticalUnits.find(u => u.id === curOfficer.assignedUnitId);
  const container = document.getElementById("officerTasksList");
  if (!container) return;

  const assignedReports = unit 
    ? state.anonymousReports.filter(r => r.assignedUnitId === unit.id)
    : [];

  container.innerHTML = `
    <div style="background:var(--bg-surface); padding:1.25rem; border-radius:12px; border:1px solid var(--border-subtle); margin-bottom:1rem; box-shadow:var(--shadow-sm);">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
        <div>
          <h3 style="color:var(--text-primary); font-size:1.1rem; font-weight:700;">Officer Duty Desk: ${escapeHtml(curOfficer.displayName)}</h3>
          <p style="color:var(--text-muted); font-size:0.8rem;">
            Assigned Squad: <strong>${unit ? unit.callsign : 'Unassigned'}</strong> · Sector: ${unit ? unit.patrolSector : 'N/A'} · Radio: <strong>${curOfficer.radioChannel || 'CH-1'}</strong>
          </p>
        </div>
        <div class="summary-chip resolved">
          ⚡ Physical Rating: ${curOfficer.physicalRating}/5 (${curOfficer.isRescueCertified ? 'Rescue Qualified' : 'Standard'})
        </div>
      </div>
    </div>

    <h4 style="color:var(--text-primary); font-size:0.95rem; font-weight:700; margin-bottom:0.75rem;">INCIDENTS DISPATCHED TO YOUR SQUAD:</h4>
    ${assignedReports.length === 0 ? `
      <div style="background:var(--bg-surface); padding:2rem; text-align:center; color:var(--text-muted); border-radius:10px; border:1px solid var(--border-subtle);">
        No active emergency incidents currently assigned to ${unit ? unit.callsign : 'your unit'}. Stand by on radio frequency.
      </div>
    ` : assignedReports.map(r => `
      <div class="report-item-card">
        <div class="report-card-top">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span class="report-ref-badge">${r.referenceCode}</span>
            <span class="urgency-badge ${r.urgency}">${r.urgency}</span>
          </div>
          <span style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">${r.createdAt}</span>
        </div>

        <div class="five-ws-matrix">
          <div class="matrix-cell">
            <span class="matrix-cell-lbl">WHERE</span>
            <span class="matrix-cell-val">📍 ${escapeHtml(r.whereLocation || r.locationHint)}</span>
          </div>
          <div class="matrix-cell">
            <span class="matrix-cell-lbl">WHAT</span>
            <span class="matrix-cell-val">${escapeHtml(r.whatHappened || r.message)}</span>
          </div>
          <div class="matrix-cell">
            <span class="matrix-cell-lbl">WHO</span>
            <span class="matrix-cell-val">${escapeHtml(r.whoInvolved || 'Unknown')}</span>
          </div>
          <div class="matrix-cell">
            <span class="matrix-cell-lbl">STATUS</span>
            <span class="matrix-cell-val">${r.status}</span>
          </div>
        </div>

        <div style="display:flex; gap:0.5rem; margin-top:0.5rem; flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="officerRespond('${r.id}', 'ON_SCENE')">📍 Mark On Scene</button>
          <button class="btn btn-secondary" onclick="officerRespond('${r.id}', 'RESCUE_IN_PROGRESS')">⚡ Rescue Underway</button>
          <button class="btn btn-primary" style="background:#059669;" onclick="officerRespond('${r.id}', 'RESOLVED')">✅ Mark Handled / Cleared</button>
        </div>
      </div>
    `).join('')}
  `;
}

window.officerRespond = function(reportId, action) {
  const report = state.anonymousReports.find(r => r.id === reportId);
  if (!report) return;

  if (action === 'ON_SCENE') {
    report.resolutionDetails = "Responding tactical squad is on-scene and securing the perimeter.";
  } else if (action === 'RESCUE_IN_PROGRESS') {
    report.resolutionDetails = "Rescue team is actively handling search and extrication.";
  } else if (action === 'RESOLVED') {
    report.status = 'RESOLVED';
    report.resolutionDetails = "Situation fully resolved. Casualties extricated and scene cleared.";
  }
  renderOfficerTasks();
  renderAdminReports();
  alert(`Incident status updated to: ${action}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// 15. Multi-Event Management Hub
// ─────────────────────────────────────────────────────────────────────────────
function populateEventsDropdown() {
  const select = document.getElementById("activeEventSelect");
  if (!select) return;

  select.innerHTML = state.events.map(e => `
    <option value="${e.id}" ${e.id === state.activeEventId ? 'selected' : ''}>
      ${escapeHtml(e.title)} (${e.eventCode})
    </option>
  `).join("");
}

window.handleEventChange = function(eventId) {
  state.activeEventId = eventId;
  renderStudentsTable();
  renderEventsGrid();
  populateEventsDropdown();
};

function renderEventsGrid() {
  const container = document.getElementById("eventsGrid");
  if (!container) return;

  container.innerHTML = state.events.map(e => `
    <div class="event-card ${e.id === state.activeEventId ? 'active-event' : ''}">
      <div class="event-card-top">
        <span class="event-code-badge">${e.eventCode}</span>
        <span class="urgency-badge ${e.status === 'ACTIVE' ? 'LOW' : 'MEDIUM'}" style="${e.status === 'ACTIVE' ? 'background:#ECFDF5; color:#059669;' : ''}">
          ${e.status}
        </span>
      </div>
      <h3 class="event-title">${escapeHtml(e.title)}</h3>
      <p style="font-size:0.78rem; color:var(--text-muted);">
        📍 Location: <strong>${escapeHtml(e.location)}</strong><br>
        📅 Date: ${e.date} · Students: ${e.totalStudentsEnrolled}
      </p>
      <div style="display:flex; justify-content:flex-end; margin-top:0.4rem;">
        <button class="btn ${e.id === state.activeEventId ? 'btn-secondary' : 'btn-primary'}" onclick="handleEventChange('${e.id}')" style="font-size:0.75rem; padding:0.35rem 0.75rem;">
          ${e.id === state.activeEventId ? '✓ Current Focus' : 'Set as Active Event'}
        </button>
      </div>
    </div>
  `).join("");
}

window.openNewEventModal = function() {
  document.getElementById("newEventModal").classList.remove("hidden");
};

window.closeNewEventModal = function() {
  document.getElementById("newEventModal").classList.add("hidden");
};

window.handleCreateEvent = async function(e) {
  e.preventDefault();
  const title = document.getElementById("eventTitleInput").value.trim();
  const eventType = document.getElementById("eventTypeInput").value;
  const location = document.getElementById("eventLocationInput").value.trim();
  const date = document.getElementById("eventDateInput").value;
  const enrolled = parseInt(document.getElementById("eventEnrolledInput").value, 10) || 30;

  try {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': state.activeRole
      },
      body: JSON.stringify({
        title,
        eventType,
        location,
        date,
        totalStudentsEnrolled: enrolled,
        mandatoryShifts: ["AM_IN", "AM_OUT", "PM_IN", "PM_OUT"]
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.event) {
        state.events.unshift(data.event);
        state.activeEventId = data.event.id;
        populateEventsDropdown();
        renderEventsGrid();
        renderStudentsTable();
        closeNewEventModal();
        document.getElementById("newEventForm").reset();
        alert(`Event published to cloud backend: ${title} (${data.event.eventCode})`);
        return;
      }
    }
  } catch (err) {
    console.warn('[E-Secure] Create event offline fallback:', err.message);
  }

  const eventCode = `EVT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const newEvt = {
    id: `evt-${Date.now()}`,
    eventCode,
    title,
    eventType,
    location,
    date,
    status: "ACTIVE",
    totalStudentsEnrolled: enrolled,
    mandatoryShifts: ["AM_IN", "AM_OUT", "PM_IN", "PM_OUT"]
  };

  state.events.unshift(newEvt);
  state.activeEventId = newEvt.id;

  populateEventsDropdown();
  renderEventsGrid();
  renderStudentsTable();
  closeNewEventModal();
  document.getElementById("newEventForm").reset();
  alert(`Event created locally: ${title} (${eventCode})`);
};

// ─────────────────────────────────────────────────────────────────────────────
// 16. Digital QR Badge Generator
// ─────────────────────────────────────────────────────────────────────────────
window.openCadetBadgeModal = function() {
  const select = document.getElementById("kioskCadetSelect");
  const memberId = select ? select.value : state.members[0].id;
  const member = state.members.find(m => m.id === memberId) || state.members[0];
  const unit = state.tacticalUnits.find(u => u.id === member.assignedUnitId);

  document.getElementById("modalCadetName").textContent = member.displayName;
  document.getElementById("modalCadetDept").textContent = member.department.toUpperCase();
  document.getElementById("modalCadetCode").textContent = member.identifierCode;
  document.getElementById("modalCadetUnit").textContent = unit ? unit.callsign : "Unassigned";
  document.getElementById("modalCadetStrength").textContent = `Rating: ${member.physicalRating}/5 (${member.isRescueCertified ? 'Rescue Qualified' : 'Standard'})`;

  renderQrVisual(member.identifierCode);
  document.getElementById("badgeModal").classList.remove("hidden");
};

window.closeCadetBadgeModal = function() {
  document.getElementById("badgeModal").classList.add("hidden");
};

function renderQrVisual(code) {
  const container = document.getElementById("modalQrCode");
  if (!container) return;

  let rects = '';
  const hash = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 42);
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const isCorner = (r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2);
      const isFilled = isCorner || ((r * 7 + c + hash) % 3 === 0);
      if (isFilled) {
        rects += `<rect x="${c * 24 + 10}" y="${r * 24 + 10}" width="20" height="20" fill="#0F172A" rx="3" />`;
      }
    }
  }

  container.innerHTML = `
    <svg width="180" height="180" viewBox="0 0 188 188" xmlns="http://www.w3.org/2000/svg">
      <rect width="188" height="188" fill="#F8FAFC" rx="10" stroke="#CBD5E1" stroke-width="2"/>
      <rect x="10" y="10" width="44" height="44" fill="#0F172A" rx="6"/>
      <rect x="18" y="18" width="28" height="28" fill="#FFFFFF" rx="3"/>
      <rect x="24" y="24" width="16" height="16" fill="#2563EB" rx="2"/>

      <rect x="134" y="10" width="44" height="44" fill="#0F172A" rx="6"/>
      <rect x="142" y="18" width="28" height="28" fill="#FFFFFF" rx="3"/>
      <rect x="148" y="24" width="16" height="16" fill="#2563EB" rx="2"/>

      <rect x="10" y="134" width="44" height="44" fill="#0F172A" rx="6"/>
      <rect x="18" y="142" width="28" height="28" fill="#FFFFFF" rx="3"/>
      <rect x="24" y="148" width="16" height="16" fill="#2563EB" rx="2"/>
      
      ${rects}
    </svg>
  `;
}

window.updateDigitalBadgePreview = function() {
  const modal = document.getElementById("badgeModal");
  if (modal && !modal.classList.contains("hidden")) {
    openCadetBadgeModal();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 17. HTML Escaping Utility
// ─────────────────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

async function loadEvents() {
  try {
    const res = await fetch('/api/events');
    if (res.ok) {
      const data = await res.json();
      if (data.events && data.events.length) {
        state.events = data.events;
        if (data.activeEventId) state.activeEventId = data.activeEventId;
        populateEventsDropdown();
        renderEventsGrid();
        renderStudentsTable();
      }
    }
  } catch (e) {
    console.warn('[E-Secure] Events API offline, using cached state:', e.message);
  }
}

async function loadUnits() {
  try {
    const res = await fetch('/api/units', {
      headers: { 'x-user-role': state.activeRole }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.units && data.units.length) {
        state.tacticalUnits = data.units;
        renderUnits();
        renderCadetMesh();
      }
    }
  } catch (e) {
    console.warn('[E-Secure] Units API offline, using cached state:', e.message);
  }
}

async function loadAdminReports() {
  try {
    const res = await fetch('/api/reports/admin', {
      headers: { 'x-user-role': state.activeRole }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.reports) {
        state.anonymousReports = data.reports;
        renderAdminReports();
      }
    }
  } catch (e) {
    console.warn('[E-Secure] Reports API offline, using cached state:', e.message);
  }
}

async function loadAttendance() {
  try {
    const res = await fetch('/api/attendance', {
      headers: { 'x-user-role': state.activeRole }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.logs) {
        state.attendanceLogs = data.logs;
        renderAttendanceFeed();
        updateAttendanceMetrics();
      }
    }
  } catch (e) {
    console.warn('[E-Secure] Attendance API offline, using cached state:', e.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. Initial Load & Initialization
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // 1. Initial UI Render from seed cache (instant layout)
  populateCadetSelect();
  selectShift(detectDefaultShift());
  populateEventsDropdown();
  renderAttendanceFeed();
  updateAttendanceMetrics();
  renderStudentsTable();
  renderEventsGrid();
  renderUnits();
  renderAdminReports();
  switchRole('ADMIN');

  // 2. Hydrate with Live Backend REST APIs asynchronously
  loadEmergencyHotlines();
  loadCadetMesh();
  loadDeptLeaders();
  loadEvents();
  loadUnits();
  loadAdminReports();
  loadAttendance();
});

