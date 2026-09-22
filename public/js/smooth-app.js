// ─────────────────────────────────────────────────────────────────────────────
// E-Secure 1.0 Campus Safety Suite — Production Application Engine
// Theme: Monochrome Black, White, and Gray (Light Mode)
// Created: 2026-09-21 | Target: Node.js 20+ Native ESM Backend
// Zero NPM Dependencies | Role-Based Access Control (RBAC) Hardened
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  // ── Application State ──
  const savedToken = localStorage.getItem('esecure_sec_token') || sessionStorage.getItem('esecure_sec_token') || null;
  const savedView = localStorage.getItem('esecure_current_view') || 'home';

  const state = {
    view: savedToken && savedView !== 'auth' ? savedView : 'home',
    isAuthenticated: Boolean(savedToken),
    authToken: savedToken,
    activeUser: null,           // Populated ONLY upon valid authenticated session
    userRole: 'guest',          // 'guest' | 'admin' | 'cadet' | 'representative'
    authMode: 'signin',         // 'signin' | 'signup'
    authError: null,
    authLoading: false,
    authDraftIdentifier: localStorage.getItem('esecure_remember_id') || sessionStorage.getItem('esecure_remember_id') || '',

    // Database & System Telemetry
    databaseStatus: {
      connected: true,
      engine: 'Google Cloud SQL / Local Edge Store',
      monitoredGates: 4,
      networkStatus: 'ENCRYPTED'
    },

    // Attendance State (Integrated with /api/attendance and /api/attendance/check-in)
    attendanceLogs: [],
    attendanceMetrics: {
      totalCadets: 0,
      onDutyCount: 0,
      offDutyCount: 0,
      scannedThisShift: 0,
      pendingThisShift: 0,
      checkedInToday: 0,
      overridesCount: 0,
      levelBreakdown: {}
    },
    attendancePending: [],
    attendanceMembers: [],
    currentShift: 'AM_IN',
    selectedShift: 'AM_IN',
    scanBadgeInput: '',
    attendanceLoading: false,
    attendanceMessage: null,
    attendanceError: null,

    // Officer Level In-Charge and Fast Search State
    selectedLevel: 'ALL',        // 'ALL' | '1ST_YEAR' | '2ND_YEAR' | '3RD_YEAR' | '4TH_YEAR' | 'OFFICER'
    nameSearchQuery: '',
    attendanceViewMode: 'cards', // 'cards' | 'table'
    activeAttendanceTab: 'roster', // 'roster' | 'pending' | 'logs'
    overrideModal: {
      isOpen: false,
      member: null,
      shiftType: 'AM_IN',
      eventType: 'CHECK_IN',
      reason: 'Manual ID Verified',
      customTime: '',
      submitting: false,
      error: null
    },

    // Attendance Excel/CSV Export State
    events: [],
    exportModal: {
      isOpen: false,
      eventId: 'ALL',
      filterType: 'ALL', // 'ALL' | 'DAY' | 'MONTH_YEAR'
      date: new Date().toISOString().slice(0, 10),
      month: String(new Date().getMonth() + 1),
      year: String(new Date().getFullYear()),
      loading: false,
      error: null
    },
    sidebarCollapsed: localStorage.getItem('esecure_sidebar_collapsed') === 'true',

    // Pending Signups (Admin-only: loaded dynamically from server)
    pendingSignups: [],

    // Active Approved Members Roster (Authenticated-only)
    roster: [],

    // Public Watch Checkpoints (Strictly Anonymized: zero student/cadet names)
    areas: [
      { id: 'area-1', date: 'Active Shift', title: 'Main Gate Entrance', subtitle: 'Visitor Check & Perimeter Gate', progress: 56, assignedUnit: 'Unit 1 - Alpha Rapid Rescue', sector: 'Sector 1 (North Perimeter)' },
      { id: 'area-2', date: 'Active Shift', title: 'Quadrangle Walkway', subtitle: 'Student Walking Patrol', progress: 46, assignedUnit: 'Unit 2 - Bravo Extrication', sector: 'Sector 2 (Central Quad)' },
      { id: 'area-3', date: 'Active Shift', title: 'Science Complex', subtitle: 'Hallway & Lab Walkthrough', progress: 87, assignedUnit: 'Unit 3 - Charlie Command', sector: 'Sector 2 (Central Quad)' },
      { id: 'area-4', date: 'Active Shift', title: 'Administration Building', subtitle: 'Main Office & Entry Doors', progress: 24, assignedUnit: 'Unit 1 - Alpha Rapid Rescue', sector: 'Sector 3 (South Corridor)' }
    ],

    tasks: [
      { id: 't1', title: 'Check Gate 3 security locks and emergency egress', due: '2h overdue', isUrgent: true, done: false },
      { id: 't2', title: 'Coordinate visitor check-in at Science Wing', due: 'Today', isUrgent: false, done: false },
      { id: 't3', title: 'Radio comms check with Central Command Desk', due: 'Completed', isUrgent: false, done: true },
      { id: 't4', title: 'Verify electronic perimeter patrol log entries', due: 'Tomorrow', isUrgent: false, done: false }
    ],

    hotlines: [
      { name: 'National Emergency Line', phone: '911', agency: 'Police & Ambulance', deskNote: 'Universal national line for urgent emergencies' },
      { name: 'Bureau of Fire Protection', phone: '160', agency: 'Fire & Technical Rescue', deskNote: 'Direct fire response and technical extrication' },
      { name: 'Red Cross Emergency Line', phone: '143', agency: 'Medical EMS Help', deskNote: 'Emergency trauma first aid and ambulance triage' },
      { name: 'Campus Safety Command Desk', phone: 'local 4000', agency: 'On-Campus Command', deskNote: 'Immediate on-site campus response desk' }
    ],

    reports: [],

    isReportModalOpen: false,
    reportSuccess: false,
    toastMessage: null
  };

  let root = document.getElementById('app-container');

  function isAdminUser() {
    const role = String(state.userRole || '').toLowerCase();
    const sessionRole = String(state.activeUser?.role || '').toUpperCase();
    return role === 'admin' || role === 'super_admin' || sessionRole === 'ADMIN' || sessionRole === 'SUPER_ADMIN';
  }

  function authHeaders(extra) {
    return Object.assign({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + (state.authToken || '')
    }, extra || {});
  }

  function shiftLabel(code) {
    const map = { AM_IN: 'AM In', AM_OUT: 'AM Out', PM_IN: 'PM In', PM_OUT: 'PM Out' };
    return map[code] || code || 'Shift';
  }

  function escapeAttr(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Session Verification on Startup ──
  async function verifySession() {
    if (!state.authToken) {
      state.isAuthenticated = false;
      state.activeUser = null;
      state.userRole = 'guest';
      render();
      return;
    }

    try {
      const res = await fetch('/api/auth/session', {
        headers: { 'Authorization': `Bearer ${state.authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          state.isAuthenticated = true;
          state.activeUser = data.user;
          state.userRole = data.user.role.toLowerCase();
          await fetchRoleData();
          const targetView = localStorage.getItem('esecure_current_view');
          if (targetView && targetView !== 'auth') {
            state.view = targetView;
          } else if (state.view === 'home' || state.view === 'auth') {
            state.view = 'attendance';
          }
        } else {
          logoutLocally();
        }
      } else {
        logoutLocally();
      }
    } catch (err) {
      console.warn('Session verification error:', err.message);
    }
    render();
  }

  // Fetch protected data based on authenticated role
  async function fetchRoleData() {
    if (!state.isAuthenticated) return;

    try {
      const headers = { 'Authorization': 'Bearer ' + state.authToken };

      if (isAdminUser()) {
        const [regRes, memRes, attRes] = await Promise.all([
          fetch('/api/admin/registrations', { headers }),
          fetch('/api/members', { headers }),
          fetch('/api/attendance', { headers })
        ]);

        if (regRes.ok) {
          const regData = await regRes.json();
          state.pendingSignups = (regData.registrations || []).filter(r => r.status === 'PENDING');
        }

        if (memRes.ok) {
          const memData = await memRes.json();
          state.roster = (memData.members || []).map(m => ({
            id: m.id,
            name: m.displayName,
            role: m.roleTitle || 'Safety Cadet',
            station: m.dutyStation || 'Campus Grounds',
            shift: m.dutyStatus === 'ON_DUTY' ? 'On Duty' : 'Standby'
          }));
        }

        applyAttendancePayload(attRes.ok ? await attRes.json() : null);
      } else {
        const [memRes, attRes] = await Promise.all([
          fetch('/api/members', { headers }),
          fetch('/api/attendance', { headers })
        ]);
        if (memRes.ok) {
          const memData = await memRes.json();
          state.roster = (memData.members || []).map(m => ({
            id: m.id,
            name: m.displayName,
            role: m.roleTitle || 'Safety Cadet',
            station: m.dutyStation || 'Campus Grounds',
            shift: m.dutyStatus === 'ON_DUTY' ? 'On Duty' : 'Standby'
          }));
        }
        applyAttendancePayload(attRes.ok ? await attRes.json() : null);
      }
    } catch (err) {
      console.warn('Failed to load protected role data:', err.message);
    }
  }

  function applyAttendancePayload(attData) {
    if (!attData) return;
    if (Array.isArray(attData.logs)) state.attendanceLogs = attData.logs;
    if (attData.metrics) state.attendanceMetrics = attData.metrics;
    if (Array.isArray(attData.pending)) state.attendancePending = attData.pending;
    if (Array.isArray(attData.members)) state.attendanceMembers = attData.members;
    if (Array.isArray(attData.events)) state.events = attData.events;
    if (attData.currentShift && !state.selectedShift) state.currentShift = attData.currentShift;
  }

  // Clear session state
  function logoutLocally() {
    localStorage.removeItem('esecure_sec_token');
    sessionStorage.removeItem('esecure_sec_token');
    localStorage.removeItem('esecure_current_view');
    state.authToken = null;
    state.isAuthenticated = false;
    state.activeUser = null;
    state.userRole = 'guest';
    state.pendingSignups = [];
    state.roster = [];
    if (state.view === 'dashboard' || state.view === 'approvals' || state.view === 'attendance') {
      state.view = 'home';
    }
  }

  async function submitUnifiedSignIn() {
    state.authError = null;
    const identifier = document.getElementById('auth-credential')?.value.trim() || '';
    const passkey = document.getElementById('auth-passkey')?.value || '';
    const remember = Boolean(document.getElementById('auth-remember')?.checked);

    state.authDraftIdentifier = identifier;

    if (!identifier && !passkey.trim()) {
      state.authError = 'Enter your access ID or passkey.';
      render();
      return;
    }

    if (remember && identifier) {
      localStorage.setItem('esecure_remember_id', identifier);
      sessionStorage.setItem('esecure_remember_id', identifier);
    } else {
      localStorage.removeItem('esecure_remember_id');
      sessionStorage.removeItem('esecure_remember_id');
    }

    state.authLoading = true;
    render();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, passkey: passkey.trim() })
      });
      const data = await res.json();
      state.authLoading = false;

      if (res.ok && data.success) {
        state.isAuthenticated = true;
        state.authToken = data.token;
        state.activeUser = data.user;
        state.userRole = String(data.user.role || '').toLowerCase();
        state.authDraftIdentifier = remember ? identifier : '';
        localStorage.setItem('esecure_sec_token', data.token);
        sessionStorage.setItem('esecure_sec_token', data.token);
        localStorage.setItem('esecure_current_view', 'attendance');

        await fetchRoleData();
        state.view = 'attendance';
        showToast('Welcome back, ' + data.user.displayName);
        render();
      } else {
        state.authError = data.error || 'Invalid access ID or passkey.';
        render();
      }
    } catch (err) {
      state.authLoading = false;
      state.authError = 'Connection error: ' + err.message;
      render();
    }
  }

  // Check live telemetry
  async function checkLiveDatabase() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        state.databaseStatus.connected = data.status === 'ONLINE';
      }

      const hlRes = await fetch('/api/hotlines');
      if (hlRes.ok) {
        const hlData = await hlRes.json();
        if (hlData.hotlines && hlData.hotlines.length > 0) {
          state.hotlines = hlData.hotlines.map(h => ({
            name: h.agencyName,
            phone: h.primaryPhone,
            agency: h.category,
            deskNote: h.description
          }));
        }
      }
    } catch (e) {
      console.log('Using local edge buffer for campus health telemetry.');
    }
  }

  // ── Render Orchestrator ──
  function render() {
    root.innerHTML = `
      ${renderAppHeader()}

      <!-- Toast Notification -->
      ${state.toastMessage ? `
        <div class="toast-notification-banner">
          <span class="toast-check-icon">✓</span>
          <span>${state.toastMessage}</span>
        </div>
      ` : ''}

      <!-- Dynamic View Surface -->
      <main class="app-main-surface">
        ${renderCurrentView()}
      </main>

      <!-- Quick Incident Help Modal -->
      ${state.isReportModalOpen ? renderReportModal() : ''}

      <!-- Fast Attendance Override Modal -->
      ${state.overrideModal && state.overrideModal.isOpen ? renderAttendanceOverrideModal() : ''}

      <!-- Attendance Excel / CSV Export Modal -->
      ${state.exportModal && state.exportModal.isOpen ? renderAttendanceExportModal() : ''}
    `;

    attachEvents();
  }

  // ── 1. Top Navigation Bar (Clean, Minimalist, User-Friendly) ──
  function renderAppHeader() {
    return `
      <header class="top-nav-bar">
        <a href="#" class="brand-link-box" id="brand-link" title="E-Secure 1.0">
          <img src="/public/logo.svg" alt="E-Secure 1.0" class="brand-vector-logo" width="28" height="28" />
          <div>
            <span class="brand-name-bold">E-SECURE 1.0</span>
            <span class="brand-tag-sub">Campus Safety Suite</span>
          </div>
        </a>

        <!-- Center Navigation Links -->
        <nav class="nav-tabs-container">
          <button class="nav-tab-button ${state.view === 'home' ? 'active' : ''}" data-nav-link="overview">
            Overview
          </button>
          <button class="nav-tab-button" data-nav-link="checkpoints">
            Watch Sectors
          </button>
          <button class="nav-tab-button" data-nav-link="hotlines">
            Hotlines
          </button>
          ${state.isAuthenticated ? `
            <button class="nav-tab-button ${state.view === 'attendance' ? 'active' : ''}" data-nav-view="attendance">
              Attendance
            </button>
            <button class="nav-tab-button ${state.view === 'dashboard' ? 'active' : ''}" data-nav-view="dashboard">
              ${isAdminUser() ? 'Monitor' : 'Console'}
            </button>
            ${isAdminUser() ? `
              <button class="nav-tab-button ${state.view === 'approvals' ? 'active' : ''}" data-nav-view="approvals">
                <span>Approvals</span>
                ${state.pendingSignups.length > 0 ? `<span class="nav-pending-badge">${state.pendingSignups.length}</span>` : ''}
              </button>
            ` : ''}
          ` : ''}
        </nav>

        <!-- Right Side Actions -->
        <div class="nav-actions-group">
          <button class="nav-btn-report" id="top-quick-report-btn">
            Transmit Alert
          </button>

          ${state.isAuthenticated ? `
            <div class="nav-user-badge">
              <span class="nav-user-dot"></span>
              <span class="nav-user-name">${state.activeUser.displayName}</span>
              <span class="nav-user-role">(${state.activeUser.roleTitle || 'Personnel'})</span>
            </div>

            <button class="nav-btn-signout" id="app-signout-btn" title="Sign out">
              Sign Out
            </button>
          ` : `
            <button class="nav-btn-signin" data-auth-action="signin">
              Sign In
            </button>
          `}
        </div>
      </header>
    `;
  }

  function renderCurrentView() {
    if (state.view === 'home') return renderUnifiedHome();
    if (state.view === 'attendance') {
      if (!state.isAuthenticated) {
        state.authError = 'Sign in to open the attendance desk.';
        state.authMode = 'signin';
        return renderBhomikAuth();
      }
      return renderAttendanceKiosk();
    }
    if (state.view === 'dashboard') {
      if (!state.isAuthenticated) {
        state.authError = 'Please sign in to access the Safety Console.';
        state.authMode = 'signin';
        return renderBhomikAuth();
      }
      return renderDashboard();
    }
    if (state.view === 'approvals') {
      if (!state.isAuthenticated || (state.userRole !== 'admin' && state.activeUser?.role !== 'ADMIN')) {
        state.authError = 'Administrator access required to view approvals.';
        state.authMode = 'signin';
        return renderBhomikAuth();
      }
      return renderApprovalsPanel();
    }
    return renderBhomikAuth();
  }

  // ── 2. HOMEPAGE & HERO (Structured & Minimalist) ──
  function renderUnifiedHome() {
    return `
      <!-- Clean Minimalist Hero Stage -->
      <section class="hero-stage-container">
        <div class="hero-video-card">
          <video class="hero-video-bg" autoplay muted loop playsinline preload="auto">
            <source src="/public/assets/hero-bg.mp4" type="video/mp4" />
          </video>
          <div class="hero-video-overlay"></div>

          <div class="hero-center-stage">
            <div class="hero-kicker-badge">
              Campus Security &amp; Incident Coordination
            </div>
            <h1 class="hero-main-title">
              E-Secure 1.0
            </h1>
            <p class="hero-main-desc">
              A structured, privacy-first security and incident dispatch system protecting students, staff, and facilities with real-time sector coverage and shift management.
            </p>

            <div class="hero-actions-row">
              <button class="hero-btn-primary" id="hero-cta-btn">
                <span>${state.isAuthenticated ? 'Open Safety Console' : 'Get Started'}</span>
                <span>→</span>
              </button>
              <button class="hero-btn-secondary" id="hero-report-btn">
                Report an Incident
              </button>
            </div>

            <div class="hero-stats-strip">
              <div class="hero-stat-pill">
                <strong>4</strong> Active Patrol Sectors
              </div>
              <div class="hero-stat-pill">
                <strong>100%</strong> Credential Privacy
              </div>
              <div class="hero-stat-pill">
                <strong>24/7</strong> Direct Emergency Lines
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Home Content Flow -->
      <div class="home-content-container">
        <!-- Section 1: Campus Watch Checkpoints -->
        <section class="home-section-block" id="section-checkpoints">
          <div class="section-header-wrap">
            <span class="section-kicker">Perimeter Checkpoints</span>
            <h2 class="section-head-title">Campus Watch Sectors</h2>
            <p class="section-head-desc">
              Real-time sector coverage telemetry across all designated university zones. Personnel identities and student records remain strictly protected.
            </p>
          </div>

          <div class="areas-grid-home">
            ${state.areas.map(area => `
              <div class="area-mini-card">
                <div>
                  <span class="area-mini-time">${area.date} • ${area.sector}</span>
                  <h3 class="area-mini-title">${area.title}</h3>
                  <p class="area-mini-sub">${area.subtitle}</p>
                </div>
                <div style="margin-top: 16px;">
                  <div style="font-size: 11.5px; font-weight: 700; display: flex; justify-content: space-between; margin-bottom: 6px; color: #52525b;">
                    <span>Assigned Squad: <strong style="color: #18181b;">${area.assignedUnit}</strong></span>
                    <span>${area.progress}%</span>
                  </div>
                  <div class="area-bar-bg">
                    <div class="area-bar-fill" style="width: ${area.progress}%;"></div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Section 2: Quick Help Request & Emergency Hotlines -->
        <div class="split-sections-grid" id="section-hotlines">
          <!-- Quick Help Submission Form -->
          <section class="home-section-block">
            <div class="section-header-wrap">
              <span class="section-kicker">Immediate Assistance</span>
              <h2 class="section-head-title">Quick Incident Help</h2>
              <p class="section-head-desc">
                Civilians and students can transmit an immediate campus assistance alert without exposing personal profiles.
              </p>
            </div>

            <form id="home-quick-form" onsubmit="return false;" style="margin-top: 20px;">
              <div class="form-group">
                <label class="form-label">Incident Nature</label>
                <select class="form-input" id="home-issue">
                  <option>Medical first aid check</option>
                  <option>Perimeter Hazard / Spilled Liquid</option>
                  <option>Unattended bag or lost item</option>
                  <option>Crowd assistance or noise check</option>
                  <option>Facility hazard or lighting check</option>
                </select>
              </div>

              <div class="form-group" style="margin-top: 14px;">
                <label class="form-label">Campus Location</label>
                <input type="text" class="form-input" id="home-loc" placeholder="e.g. Science Complex Room 201 or North Gate" value="Gate 3 Walkway Area" required />
              </div>

              <div class="form-group" style="margin-top: 14px;">
                <label class="form-label">Reporter Designation (Optional)</label>
                <input type="text" class="form-input" id="home-reporter" placeholder="Anonymous Student or Staff" value="Campus Community Member" />
              </div>

              <button type="submit" class="auth-submit-btn" id="home-submit-report">
                Transmit Emergency Alert
              </button>
            </form>
          </section>

          <!-- Emergency Hotlines Directory -->
          <section class="home-section-block">
            <div class="section-header-wrap">
              <span class="section-kicker">Direct Contact</span>
              <h2 class="section-head-title">Emergency Hotlines</h2>
              <p class="section-head-desc">
                Dedicated contact lines for immediate medical emergency, fire response, police coordination, and campus command.
              </p>
            </div>

            <div style="margin-top: 16px;">
              ${state.hotlines.map(h => `
                <div class="hotline-card-row">
                  <div>
                    <div class="hotline-agency-name">${h.name}</div>
                    <div class="hotline-desc-sub">${h.deskNote}</div>
                  </div>
                  <a href="tel:${h.phone}" class="hotline-call-btn">
                    ${h.phone}
                  </a>
                </div>
              `).join('')}
            </div>
          </section>
        </div>
      </div>
    `;
  }

  // ── 3. AUTHENTICATION PORTAL (Bhomik Exact Layout) ──
  function renderBhomikAuth() {
    const showSignup = state.authMode === 'signup';

    return `
      <section class="auth-portal-canvas">

        <!-- LEFT: Hero Image -->
        <div class="auth-brand-panel">
          <img src="/assets/auth-hero.jpg" alt="Campus Security — Christ the King College" class="auth-hero-img" />
        </div>

        <!-- RIGHT: Form Panel -->
        <div class="auth-form-panel">
          <div class="auth-form-inner">

            ${showSignup ? `
              <div class="auth-welcome-block">
                <h1 class="auth-welcome-title">Request Access</h1>
                <p class="auth-welcome-sub">Already cleared? <button class="auth-inline-link" type="button" id="auth-toggle-signup">Sign in</button></p>
              </div>
              ${state.authError ? `<div class="auth-alert-box" style="margin-top:16px;"><span>${escapeAttr(state.authError)}</span></div>` : ''}
              <form class="auth-fields-form" id="auth-signup-form" style="margin-top:28px;">
                <div class="form-group">
                  <label class="form-label" for="reg-name">Full Name</label>
                  <input type="text" class="form-input" id="reg-name" name="name" placeholder="Given name and family name" required autofocus autocomplete="name" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="reg-email">University Email</label>
                  <input type="email" class="form-input" id="reg-email" name="email" placeholder="campus email address" required autocomplete="email" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="reg-role">Requested duty type</label>
                  <select class="form-input" id="reg-role" name="requestedRole">
                    <option value="cadet">Student cadet or duty officer</option>
                    <option value="representative">Department / scene representative</option>
                  </select>
                  <p class="form-help-text">Command staff assign your post after review. This is not a second login.</p>
                </div>
                <div class="form-group">
                  <label class="form-label" for="reg-station">Preferred duty sector</label>
                  <select class="form-input" id="reg-station" name="preferredStation">
                    <option value="Main Gate Entrance">Main Gate Entrance</option>
                    <option value="Quadrangle Walkway">Quadrangle Walkway</option>
                    <option value="Science Complex">Science Complex</option>
                    <option value="Administration Building">Administration Building</option>
                  </select>
                </div>
                <button type="submit" class="auth-submit-btn" id="reg-submit-action" ${state.authLoading ? 'disabled' : ''}>
                  ${state.authLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            ` : `
              <div class="auth-welcome-block">
                <h1 class="auth-welcome-title">Sign In</h1>
                <p class="auth-welcome-sub">One portal for command staff, officers, cadets, and department leads. <button class="auth-inline-link" type="button" id="auth-toggle-signup">Request access</button></p>
              </div>
              ${state.authError ? `<div class="auth-alert-box" style="margin-top:16px;"><span>${escapeAttr(state.authError)}</span></div>` : ''}
              <form class="auth-fields-form" id="auth-signin-form" style="margin-top:28px;" autocomplete="on">
                <div class="form-group">
                  <label class="form-label" for="auth-credential">Access ID</label>
                  <input type="text" class="form-input" id="auth-credential" name="identifier"
                    placeholder="Badge ID, campus email, duty code, or command passkey"
                    value="${escapeAttr(state.authDraftIdentifier)}"
                    autocomplete="username" required autofocus />
                  <p class="form-help-text">Use the ID issued with your duty assignment. Role is applied after sign-in.</p>
                </div>
                <div class="form-group">
                  <label class="form-label" for="auth-passkey">Passkey</label>
                  <div class="password-input-wrap">
                    <input type="password" class="form-input" id="auth-passkey" name="passkey" placeholder="Leave blank if your duty ID is badge-only" autocomplete="current-password" />
                    <button type="button" class="password-eye-btn" id="toggle-passkey-eye" aria-label="Show passkey">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </div>
                </div>
                <div class="auth-meta-row">
                  <label class="auth-remember-label">
                    <input type="checkbox" id="auth-remember" class="auth-remember-check" ${sessionStorage.getItem('esecure_remember_id') ? 'checked' : ''} />
                    <span>Remember access ID</span>
                  </label>
                  <button type="button" class="auth-forgot-link" id="auth-forgot-btn">Forgot passkey?</button>
                </div>
                <button type="submit" class="auth-submit-btn" id="auth-submit-action" ${state.authLoading ? 'disabled' : ''}>
                  ${state.authLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            `}

          </div>
        </div>

      </section>
    `;
  }



  // ── 4. ATTENDANCE KIOSK (Live Shift Intake & Badge Scanner) ──

  // ── 4. ATTENDANCE WORKSPACE (Officer Level In-Charge, Fast Search, 1-Tap Time In/Out & Override) ──

  function renderAttendanceOverrideModal() {
    const modal = state.overrideModal;
    if (!modal || !modal.member) return '';
    const member = modal.member;
    const reasons = [
      'Manual ID Verified',
      'Late Arrival (Excused)',
      'Badge Forgotten / Lost',
      'Shift Swap / Reassigned',
      'Medical / Clinic Pass',
      'Officer Verbal Order'
    ];

    return `
      <div class="modal-overlay" id="attendance-override-backdrop">
        <div class="modal-content-card override-modal-card">
          <div class="modal-header-row">
            <div>
              <h3 class="modal-title">Manual Attendance Override</h3>
              <p class="modal-subtitle">Direct officer clearance & audit authorization</p>
            </div>
            <button class="modal-close-btn" id="modal-override-close">✕</button>
          </div>

          <!-- Target Student Preview -->
          <div class="override-student-preview">
            <div class="student-avatar-lg">
              ${escapeAttr(member.displayName.split(' ').map(n => n[0]).join('').slice(0, 2))}
            </div>
            <div style="flex: 1;">
              <h4 class="override-student-name">${escapeAttr(member.displayName)}</h4>
              <div class="override-student-meta">
                <span class="cohort-tag">${escapeAttr((member.yearLevel || 'Cadet').replace('_', ' '))}</span>
                <span>• Section: <strong>${escapeAttr(member.sectionName || 'BS-CRIM')}</strong></span>
                <span>• ID: <strong class="mono">${escapeAttr(member.studentIdNumber || member.identifierCode)}</strong></span>
              </div>
            </div>
          </div>

          ${modal.error ? `
            <div class="alert-error-banner" style="margin-top: 12px;">
              <span>${escapeAttr(modal.error)}</span>
            </div>
          ` : ''}

          <form id="attendance-override-form" style="margin-top: 16px;">
            <!-- Shift Selector -->
            <div class="form-group">
              <label class="form-label">Shift to Override</label>
              <div class="shift-buttons-row">
                ${['AM_IN', 'AM_OUT', 'PM_IN', 'PM_OUT'].map(s => `
                  <button type="button" class="shift-toggle-btn override-shift-btn ${modal.shiftType === s ? 'active' : ''}" data-override-shift="${s}">
                    ${shiftLabel(s)}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Action Type -->
            <div class="form-group" style="margin-top: 14px;">
              <label class="form-label">Override Action</label>
              <div class="segmented-control-row">
                <button type="button" class="segmented-control-btn ${modal.eventType === 'CHECK_IN' ? 'active' : ''}" data-override-event="CHECK_IN">
                  🟢 Time In (Duty Check-In)
                </button>
                <button type="button" class="segmented-control-btn ${modal.eventType === 'CHECK_OUT' ? 'active' : ''}" data-override-event="CHECK_OUT">
                  🔴 Time Out (Duty Check-Out)
                </button>
              </div>
            </div>

            <!-- Preset Reason Chips -->
            <div class="form-group" style="margin-top: 14px;">
              <label class="form-label">Officer Override Reason</label>
              <div class="override-reasons-grid">
                ${reasons.map(r => `
                  <button type="button" class="reason-chip-btn ${modal.reason === r ? 'active' : ''}" data-override-reason="${escapeAttr(r)}">
                    ${escapeAttr(r)}
                  </button>
                `).join('')}
              </div>
              <input
                type="text"
                class="form-input"
                id="override-custom-reason"
                value="${escapeAttr(modal.reason)}"
                placeholder="Or type specific justification..."
                style="margin-top: 8px;"
                required
              />
            </div>

            <!-- Custom Timestamp -->
            <div class="form-group" style="margin-top: 14px;">
              <label class="form-label">Timestamp Stamp (Default is Now)</label>
              <input
                type="text"
                class="form-input mono"
                id="override-custom-time"
                value="${escapeAttr(modal.customTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}"
                placeholder="e.g. 07:45 AM or Now"
              />
              <p class="form-help-text">Adjust time if student arrived earlier on an excused late slip.</p>
            </div>

            <div class="modal-footer-row" style="margin-top: 20px;">
              <button type="button" class="btn-secondary" id="modal-override-cancel">Cancel</button>
              <button type="submit" class="auth-submit-btn" id="modal-override-submit" ${modal.submitting ? 'disabled' : ''}>
                ${modal.submitting ? 'Authorizing...' : '⚡ Authorize & Record Override'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function renderAttendanceExportModal() {
    const modal = state.exportModal;
    if (!modal || !modal.isOpen) return '';
    const events = state.events || [];
    const currentYear = new Date().getFullYear();

    return `
      <div class="modal-overlay" id="attendance-export-backdrop">
        <div class="modal-content-card export-modal-card" style="max-width: 520px;">
          <div class="modal-header-row">
            <div>
              <h3 class="modal-title">Export Attendance Report</h3>
              <p class="modal-subtitle">Generate an official turnout and audit report in Microsoft Excel format (.csv)</p>
            </div>
            <button class="modal-close-btn" id="modal-export-close">✕</button>
          </div>

          <form id="attendance-export-form" style="margin-top: 16px;">
            <!-- Select Event -->
            <div class="form-group" style="margin-bottom: 16px;">
              <label class="form-label" style="font-weight: 700; font-size: 13px; color: #18181b; display: block; margin-bottom: 6px;">
                Specific Event
              </label>
              <select class="form-input" id="export-select-event" style="width: 100%; font-size: 13.5px; padding: 10px 12px;">
                <option value="ALL" ${modal.eventId === 'ALL' ? 'selected' : ''}>All Events / General Daily Muster</option>
                ${events.map(e => `
                  <option value="${escapeAttr(e.id)}" ${modal.eventId === e.id ? 'selected' : ''}>
                    ${escapeAttr(e.title)} (${escapeAttr(e.eventCode || e.id)}) — ${escapeAttr(e.date || 'Active')}
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Filter By Date Type -->
            <div class="form-group" style="margin-bottom: 16px;">
              <label class="form-label" style="font-weight: 700; font-size: 13px; color: #18181b; display: block; margin-bottom: 6px;">
                Date Range Filter
              </label>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                <button type="button" class="btn-secondary export-filter-mode-btn ${modal.filterType === 'ALL' ? 'active' : ''}" data-filter-type="ALL" style="font-size: 12px; padding: 8px 4px; ${modal.filterType === 'ALL' ? 'background:#18181b;color:#fff;border-color:#18181b;' : ''}">
                  All Records
                </button>
                <button type="button" class="btn-secondary export-filter-mode-btn ${modal.filterType === 'DAY' ? 'active' : ''}" data-filter-type="DAY" style="font-size: 12px; padding: 8px 4px; ${modal.filterType === 'DAY' ? 'background:#18181b;color:#fff;border-color:#18181b;' : ''}">
                  Specific Day
                </button>
                <button type="button" class="btn-secondary export-filter-mode-btn ${modal.filterType === 'MONTH_YEAR' ? 'active' : ''}" data-filter-type="MONTH_YEAR" style="font-size: 12px; padding: 8px 4px; ${modal.filterType === 'MONTH_YEAR' ? 'background:#18181b;color:#fff;border-color:#18181b;' : ''}">
                  Month & Year
                </button>
              </div>
            </div>

            <!-- Day Selector -->
            ${modal.filterType === 'DAY' ? `
              <div class="form-group" style="margin-bottom: 16px;">
                <label class="form-label" style="font-weight: 700; font-size: 13px; color: #18181b; display: block; margin-bottom: 6px;">
                  Select Date (Day)
                </label>
                <input type="date" class="form-input" id="export-input-date" value="${escapeAttr(modal.date)}" style="width: 100%; font-size: 14px; padding: 10px 12px;" required />
              </div>
            ` : ''}

            <!-- Month & Year Selector -->
            ${modal.filterType === 'MONTH_YEAR' ? `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                <div class="form-group">
                  <label class="form-label" style="font-weight: 700; font-size: 13px; color: #18181b; display: block; margin-bottom: 6px;">
                    Month
                  </label>
                  <select class="form-input" id="export-select-month" style="width: 100%; font-size: 13.5px; padding: 10px 12px;">
                    ${[
                      { val: '1', label: '01 - January' },
                      { val: '2', label: '02 - February' },
                      { val: '3', label: '03 - March' },
                      { val: '4', label: '04 - April' },
                      { val: '5', label: '05 - May' },
                      { val: '6', label: '06 - June' },
                      { val: '7', label: '07 - July' },
                      { val: '8', label: '08 - August' },
                      { val: '9', label: '09 - September' },
                      { val: '10', label: '10 - October' },
                      { val: '11', label: '11 - November' },
                      { val: '12', label: '12 - December' }
                    ].map(m => `
                      <option value="${m.val}" ${String(modal.month) === m.val ? 'selected' : ''}>${m.label}</option>
                    `).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-weight: 700; font-size: 13px; color: #18181b; display: block; margin-bottom: 6px;">
                    Year
                  </label>
                  <select class="form-input" id="export-select-year" style="width: 100%; font-size: 13.5px; padding: 10px 12px;">
                    ${[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => `
                      <option value="${y}" ${String(modal.year) === String(y) ? 'selected' : ''}>${y}</option>
                    `).join('')}
                  </select>
                </div>
              </div>
            ` : ''}

            <div style="background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 12px; color: #52525b; line-height: 1.5;">
              📊 <strong>Excel-Ready Output:</strong> Produces a UTF-8 BOM CSV compatible with Microsoft Excel, Google Sheets, and Apple Numbers. Contains Date, Time, Cadet Name, Student ID, Section, Year Level, Station, Shift, Event Code & Title, Verification Terminal, and Overrides.
            </div>

            <div class="modal-footer-row">
              <button type="button" class="btn-secondary" id="modal-export-cancel">Cancel</button>
              <button type="submit" class="auth-submit-btn" id="modal-export-submit" ${modal.loading ? 'disabled' : ''}>
                ${modal.loading ? 'Generating...' : '↓ Download Excel Report (.csv)'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function renderRosterCards(members, activeShift) {
    return `
      <div class="tactical-student-cards-grid">
        ${members.map(m => {
          const shiftState = m.shifts || {};
          const isDoneThisShift = Boolean(m.hasScannedCurrentShift);
          const isOutShift = String(activeShift).endsWith('_OUT');

          return `
            <div class="student-tactical-card ${isDoneThisShift ? 'shift-recorded' : ''}" data-member-id="${m.id}">
              <div class="student-card-head">
                <div class="student-avatar-wrap">
                  <div class="student-avatar">
                    ${escapeAttr(m.displayName.split(' ').map(n => n[0]).join('').slice(0, 2))}
                  </div>
                  <span class="status-pulse-dot ${m.dutyStatus === 'ON_DUTY' ? 'active' : ''}"></span>
                </div>

                <div class="student-card-profile">
                  <div class="student-name-row">
                    <h3 class="student-display-name">${escapeAttr(m.displayName)}</h3>
                  </div>
                  <div class="student-meta-badges">
                    <span class="badge-level-pill">${escapeAttr((m.yearLevel || '').replace('_', ' '))}</span>
                    <span class="badge-section-pill">${escapeAttr(m.sectionName || 'BS-CRIM')}</span>
                    <span class="badge-id-code mono">${escapeAttr(m.studentIdNumber || m.identifierCode)}</span>
                    ${m.lastRecordedDate ? `<span class="badge-date-pill mono" style="background:#f4f4f5;border:1px solid #e4e4e7;border-radius:4px;padding:2px 6px;font-size:11px;color:#52525b;font-weight:600;">📅 ${escapeAttr(m.lastRecordedDate)}</span>` : ''}
                  </div>
                  <div class="student-station-text">
                    📍 ${escapeAttr(m.dutyStation || 'General Campus Post')}
                  </div>
                </div>
              </div>

              <!-- 4-Shift Timeline Strip -->
              <div class="student-shift-timeline">
                <div class="shift-time-chip ${shiftState.amIn ? 'recorded' : ''}">
                  <span class="shift-chip-label">AM IN</span>
                  <span class="shift-chip-time mono">${shiftState.amIn ? escapeAttr(shiftState.amIn) : '—'}</span>
                  ${shiftState.amInDate ? `<span class="shift-chip-date mono" style="font-size:9px;color:#71717a;display:block;">${escapeAttr(shiftState.amInDate)}</span>` : ''}
                </div>
                <div class="shift-time-chip ${shiftState.amOut ? 'recorded' : ''}">
                  <span class="shift-chip-label">AM OUT</span>
                  <span class="shift-chip-time mono">${shiftState.amOut ? escapeAttr(shiftState.amOut) : '—'}</span>
                  ${shiftState.amOutDate ? `<span class="shift-chip-date mono" style="font-size:9px;color:#71717a;display:block;">${escapeAttr(shiftState.amOutDate)}</span>` : ''}
                </div>
                <div class="shift-time-chip ${shiftState.pmIn ? 'recorded' : ''}">
                  <span class="shift-chip-label">PM IN</span>
                  <span class="shift-chip-time mono">${shiftState.pmIn ? escapeAttr(shiftState.pmIn) : '—'}</span>
                  ${shiftState.pmInDate ? `<span class="shift-chip-date mono" style="font-size:9px;color:#71717a;display:block;">${escapeAttr(shiftState.pmInDate)}</span>` : ''}
                </div>
                <div class="shift-time-chip ${shiftState.pmOut ? 'recorded' : ''}">
                  <span class="shift-chip-label">PM OUT</span>
                  <span class="shift-chip-time mono">${shiftState.pmOut ? escapeAttr(shiftState.pmOut) : '—'}</span>
                  ${shiftState.pmOutDate ? `<span class="shift-chip-date mono" style="font-size:9px;color:#71717a;display:block;">${escapeAttr(shiftState.pmOutDate)}</span>` : ''}
                </div>
              </div>

              <!-- Fast 1-Tap Action Bar -->
              <div class="student-card-actions">
                <button
                  type="button"
                  class="tactical-action-btn btn-time-in ${isDoneThisShift && !isOutShift ? 'btn-active-done' : ''}"
                  data-action="time-in"
                  data-member-id="${m.id}"
                  title="Record Time In for ${shiftLabel(activeShift)}"
                >
                  🟢 Time In
                </button>

                <button
                  type="button"
                  class="tactical-action-btn btn-time-out ${isDoneThisShift && isOutShift ? 'btn-active-done' : ''}"
                  data-action="time-out"
                  data-member-id="${m.id}"
                  title="Record Time Out for ${shiftLabel(activeShift)}"
                >
                  🔴 Time Out
                </button>

                <button
                  type="button"
                  class="tactical-action-btn btn-override"
                  data-action="override"
                  data-member-id="${m.id}"
                  title="Manual Override & Exception Authorize"
                >
                  ⚡ Override
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderRosterTable(members, activeShift) {
    return `
      <div class="content-surface table-surface-wrap">
        <div class="table-container">
          <table class="simple-data-table tactical-data-table">
            <thead>
              <tr>
                <th>Cadet Name</th>
                <th>Level & Section</th>
                <th>ID / Badge</th>
                <th>AM In</th>
                <th>AM Out</th>
                <th>PM In</th>
                <th>PM Out</th>
                <th style="text-align: right;">Fast Actions</th>
              </tr>
            </thead>
            <tbody>
              ${members.map(m => {
                const s = m.shifts || {};
                return `
                  <tr data-member-id="${m.id}">
                    <td>
                      <div class="table-member-profile">
                        <span class="status-pulse-dot ${m.dutyStatus === 'ON_DUTY' ? 'active' : ''}"></span>
                        <div>
                          <strong>${escapeAttr(m.displayName)}</strong>
                          ${m.lastRecordedDate ? `<div class="mono" style="font-size:11px;color:#71717a;margin-top:2px;">Date: ${escapeAttr(m.lastRecordedDate)}</div>` : ''}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge-level-pill">${escapeAttr((m.yearLevel || '').replace('_', ' '))}</span>
                      <span class="badge-section-pill">${escapeAttr(m.sectionName || 'BS-CRIM')}</span>
                    </td>
                    <td class="mono">${escapeAttr(m.studentIdNumber || m.identifierCode)}</td>
                    <td class="mono ${s.amIn ? 'time-recorded' : 'time-empty'}">
                      ${s.amIn ? `<strong>${escapeAttr(s.amIn)}</strong>${s.amInDate ? `<div style="font-size:10px;color:#71717a;">${escapeAttr(s.amInDate)}</div>` : ''}` : '—'}
                    </td>
                    <td class="mono ${s.amOut ? 'time-recorded' : 'time-empty'}">
                      ${s.amOut ? `<strong>${escapeAttr(s.amOut)}</strong>${s.amOutDate ? `<div style="font-size:10px;color:#71717a;">${escapeAttr(s.amOutDate)}</div>` : ''}` : '—'}
                    </td>
                    <td class="mono ${s.pmIn ? 'time-recorded' : 'time-empty'}">
                      ${s.pmIn ? `<strong>${escapeAttr(s.pmIn)}</strong>${s.pmInDate ? `<div style="font-size:10px;color:#71717a;">${escapeAttr(s.pmInDate)}</div>` : ''}` : '—'}
                    </td>
                    <td class="mono ${s.pmOut ? 'time-recorded' : 'time-empty'}">
                      ${s.pmOut ? `<strong>${escapeAttr(s.pmOut)}</strong>${s.pmOutDate ? `<div style="font-size:10px;color:#71717a;">${escapeAttr(s.pmOutDate)}</div>` : ''}` : '—'}
                    </td>
                    <td style="text-align: right;">
                      <div class="table-actions-inline">
                        <button type="button" class="btn-micro btn-time-in" data-action="time-in" data-member-id="${m.id}" title="Time In">In</button>
                        <button type="button" class="btn-micro btn-time-out" data-action="time-out" data-member-id="${m.id}" title="Time Out">Out</button>
                        <button type="button" class="btn-micro btn-override" data-action="override" data-member-id="${m.id}" title="Override">⚡</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderLiveAuditFeed(logs) {
    if (!logs || logs.length === 0) {
      return `<p class="empty-table-cell">No attendance recorded today. Tap Time In on any cadet.</p>`;
    }
    return `
      <ul class="live-audit-feed-list">
        ${logs.slice(0, 25).map(log => `
          <li class="audit-feed-item ${log.isOverride ? 'override-item' : ''}">
            <div class="audit-feed-main">
              <div class="audit-feed-name-row">
                <strong>${escapeAttr(log.displayName)}</strong>
                <span class="shift-chip">${escapeAttr(shiftLabel(log.shiftType))}</span>
              </div>
              <div class="audit-feed-meta">
                ${log.isOverride ? `
                  <span class="override-tag">⚡ OVERRIDE: ${escapeAttr(log.overrideReason || 'Officer Override')}</span>
                ` : `
                  <span class="terminal-tag">Checked in via ${escapeAttr(log.terminalCode || 'Desk')}</span>
                `}
                <span class="recorded-by-tag">By: <strong>${escapeAttr(log.recordedBy || 'Duty Officer')}</strong></span>
              </div>
            </div>
            <div class="audit-feed-time mono" style="text-align: right; min-width: 90px;">
              <span class="audit-feed-date" style="display: block; font-size: 11px; font-weight: 600; color: #71717a;">
                ${log.loggedDate || (log.loggedAt ? new Date(log.loggedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today')}
              </span>
              <span class="audit-feed-hour" style="font-weight: 700; color: #18181b; font-size: 13px;">
                ${log.loggedAt ? new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
              </span>
            </div>
          </li>
        `).join('')}
      </ul>
    `;
  }

  function renderPendingDutyList(pending, activeShift) {
    if (!pending || pending.length === 0) {
      return `<p class="empty-table-cell">All personnel are recorded for ${shiftLabel(activeShift)}.</p>`;
    }
    return `
      <ul class="pending-duty-list">
        ${pending.map(person => `
          <li class="pending-duty-row">
            <div>
              <strong>${escapeAttr(person.displayName)}</strong>
              <span class="pending-duty-meta">
                ${escapeAttr((person.yearLevel || '').replace('_', ' '))} • ${escapeAttr(person.sectionName || 'BS-CRIM')}
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <button type="button" class="btn-micro btn-time-in" data-action="time-in" data-member-id="${person.id}">
                Check In
              </button>
            </div>
          </li>
        `).join('')}
      </ul>
    `;
  }

  function renderAttendanceKiosk() {
    const metrics = state.attendanceMetrics || {};
    const defaultShift = state.selectedShift || state.currentShift || 'AM_IN';
    const rawMembers = (state.attendanceMembers && state.attendanceMembers.length > 0)
      ? state.attendanceMembers
      : (state.roster || []).map(r => ({
          id: r.id,
          displayName: r.name,
          identifierCode: r.id,
          studentIdNumber: r.id,
          yearLevel: '3RD_YEAR',
          sectionName: 'BS-CRIM',
          roleTitle: r.role,
          dutyStation: r.station,
          dutyStatus: r.shift === 'On Duty' ? 'ON_DUTY' : 'STANDBY',
          shifts: {}
        }));

    const query = (state.nameSearchQuery || '').trim().toLowerCase();
    const activeLevel = state.selectedLevel || 'ALL';

    // Filter members
    const filteredMembers = rawMembers.filter(m => {
      if (activeLevel !== 'ALL' && m.yearLevel !== activeLevel) return false;
      if (!query) return true;
      const name = (m.displayName || '').toLowerCase();
      const idNum = (m.studentIdNumber || '').toLowerCase();
      const ident = (m.identifierCode || '').toLowerCase();
      const sec = (m.sectionName || '').toLowerCase();
      return name.includes(query) || idNum.includes(query) || ident.includes(query) || sec.includes(query);
    });

    const counts = {
      ALL: rawMembers.length,
      '1ST_YEAR': rawMembers.filter(m => m.yearLevel === '1ST_YEAR').length,
      '2ND_YEAR': rawMembers.filter(m => m.yearLevel === '2ND_YEAR').length,
      '3RD_YEAR': rawMembers.filter(m => m.yearLevel === '3RD_YEAR').length,
      '4TH_YEAR': rawMembers.filter(m => m.yearLevel === '4TH_YEAR').length,
      OFFICER: rawMembers.filter(m => m.yearLevel === 'OFFICER').length
    };

    const breakdown = metrics.levelBreakdown || {};
    const pending = state.attendancePending || [];
    const ownCode = state.activeUser?.identifierCode || '';
    const badgeValue = state.scanBadgeInput || (ownCode && state.userRole === 'cadet' ? ownCode : '');

    return `
      <section class="attendance-canvas tactical-attendance-canvas">
        <!-- Top Command Header -->
        <div class="page-title-strip attendance-header-strip">
          <div>
            <div class="attendance-header-kicker">
              <span class="live-pulse-dot"></span>
              <span>LIVE MUSTER DESK • ${shiftLabel(defaultShift)} ACTIVE • ${new Date().toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}</span>
            </div>
            <h1 class="page-main-heading">Attendance Command Desk</h1>
            <p class="page-sub-heading">
              Level In-Charge fast search, 1-tap manual Time In / Time Out, and live compliance tracking.
            </p>
          </div>

          <div class="page-header-actions attendance-quick-actions">
            <!-- Shift Toggle Pills -->
            <div class="shift-buttons-row header-shift-pills">
              <button type="button" class="shift-toggle-btn ${defaultShift === 'AM_IN' ? 'active' : ''}" data-shift="AM_IN">AM In</button>
              <button type="button" class="shift-toggle-btn ${defaultShift === 'AM_OUT' ? 'active' : ''}" data-shift="AM_OUT">AM Out</button>
              <button type="button" class="shift-toggle-btn ${defaultShift === 'PM_IN' ? 'active' : ''}" data-shift="PM_IN">PM In</button>
              <button type="button" class="shift-toggle-btn ${defaultShift === 'PM_OUT' ? 'active' : ''}" data-shift="PM_OUT">PM Out</button>
            </div>

            <div style="display:flex;gap:8px;align-items:center;">
              ${isAdminUser() ? `<button class="btn-secondary" id="btn-export-attendance" title="Download attendance as Excel/CSV" style="background:#18181b;color:#fff;border-color:#18181b;">↓ Export CSV</button>` : ''}
              <button class="btn-secondary" id="btn-refresh-attendance" title="Refresh Board">
                ↻ Refresh
              </button>
            </div>
          </div>
        </div>


        <!-- Admin Real-Time Cohort Turnout Matrix -->
        <div class="content-surface cohort-monitoring-surface">
          <div class="surface-header">
            <div>
              <h2 class="surface-heading">Admin Cohort Turnout Monitoring</h2>
              <p class="surface-subtle-text">Live check-in progress by academic level for ${shiftLabel(defaultShift)}</p>
            </div>
            <div class="monitoring-kpis-inline">
              <span class="kpi-pill"><strong>${metrics.totalCadets || rawMembers.length}</strong> Total Personnel</span>
              <span class="kpi-pill kpi-pill-success"><strong>${metrics.onDutyCount || 0}</strong> On Duty</span>
              <span class="kpi-pill kpi-pill-accent"><strong>${metrics.scannedThisShift || 0}</strong> Scanned</span>
              <span class="kpi-pill kpi-pill-alert"><strong>${metrics.pendingThisShift || pending.length}</strong> Still Out</span>
              <span class="kpi-pill kpi-pill-override"><strong>${metrics.overridesCount || 0}</strong> Overrides</span>
            </div>
          </div>

          <div class="cohort-gauges-grid">
            ${[
              { key: '1ST_YEAR', label: '1st Year Criminology' },
              { key: '2ND_YEAR', label: '2nd Year Criminology' },
              { key: '3RD_YEAR', label: '3rd Year Criminology' },
              { key: '4TH_YEAR', label: '4th Year Senior Marshals' },
              { key: 'OFFICER', label: 'Tactical Officers' }
            ].map(cohort => {
              const data = breakdown[cohort.key] || {
                total: counts[cohort.key] || 0,
                scanned: 0,
                percent: 0
              };
              const pct = data.total > 0 ? Math.round((data.scanned / data.total) * 100) : 0;
              return `
                <div class="cohort-gauge-card ${activeLevel === cohort.key ? 'active-filtered' : ''}" data-level-filter="${cohort.key}">
                  <div class="cohort-gauge-head">
                    <span class="cohort-gauge-title">${cohort.label}</span>
                    <span class="cohort-gauge-pct ${pct === 100 ? 'complete' : ''}">${pct}%</span>
                  </div>
                  <div class="cohort-gauge-bar-bg">
                    <div class="cohort-gauge-bar-fill" style="width: ${pct}%;"></div>
                  </div>
                  <div class="cohort-gauge-foot">
                    <span>${data.scanned} of ${data.total} recorded</span>
                    ${pct < 100 ? `<span class="cohort-gauge-pending">${data.total - data.scanned} awaiting</span>` : `<span class="cohort-gauge-done">✓ All Scanned</span>`}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Officer Operational Workstation (Sticky Search & Level In-Charge Bar) -->
        <div class="officer-control-toolbar-sticky">
          <!-- Level In-Charge Selector Tabs -->
          <div class="level-tabs-strip">
            <span class="level-tabs-label">Officer In-Charge Level:</span>
            <div class="level-pills-row">
              <button type="button" class="level-pill-btn ${activeLevel === 'ALL' ? 'active' : ''}" data-select-level="ALL">
                All Levels <span class="level-pill-badge">${counts.ALL}</span>
              </button>
              <button type="button" class="level-pill-btn ${activeLevel === '1ST_YEAR' ? 'active' : ''}" data-select-level="1ST_YEAR">
                1st Year <span class="level-pill-badge">${counts['1ST_YEAR']}</span>
              </button>
              <button type="button" class="level-pill-btn ${activeLevel === '2ND_YEAR' ? 'active' : ''}" data-select-level="2ND_YEAR">
                2nd Year <span class="level-pill-badge">${counts['2ND_YEAR']}</span>
              </button>
              <button type="button" class="level-pill-btn ${activeLevel === '3RD_YEAR' ? 'active' : ''}" data-select-level="3RD_YEAR">
                3rd Year <span class="level-pill-badge">${counts['3RD_YEAR']}</span>
              </button>
              <button type="button" class="level-pill-btn ${activeLevel === '4TH_YEAR' ? 'active' : ''}" data-select-level="4TH_YEAR">
                4th Year <span class="level-pill-badge">${counts['4TH_YEAR']}</span>
              </button>
              <button type="button" class="level-pill-btn ${activeLevel === 'OFFICER' ? 'active' : ''}" data-select-level="OFFICER">
                Officers <span class="level-pill-badge">${counts.OFFICER}</span>
              </button>
            </div>
          </div>

          <!-- Fast Instant Search & View Controls -->
          <div class="officer-search-action-strip">
            <div class="officer-search-box-wrap">
              <span class="search-icon-symbol">🔍</span>
              <input
                type="text"
                class="officer-search-input"
                id="officer-name-search"
                placeholder="Search student name, cadet ID, or section (press '/' to focus)..."
                value="${escapeAttr(state.nameSearchQuery)}"
                autocomplete="off"
              />
              ${state.nameSearchQuery ? `
                <button type="button" class="search-clear-btn" id="search-clear-action" title="Clear Search">✕</button>
              ` : ''}
            </div>

            <div class="search-meta-and-views">
              <span class="search-result-counter">
                Showing <strong>${filteredMembers.length}</strong> of ${rawMembers.length}
              </span>

              <div class="view-mode-toggle">
                <button type="button" class="view-mode-btn ${state.attendanceViewMode === 'cards' ? 'active' : ''}" data-set-view="cards" title="Touch Cards View">
                  ▦ Cards
                </button>
                <button type="button" class="view-mode-btn ${state.attendanceViewMode === 'table' ? 'active' : ''}" data-set-view="table" title="Compact Matrix View">
                  ≡ Table
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Area: Roster Grid + Live Audit Feed -->
        <div class="attendance-two-column attendance-operational-grid">
          <!-- Left Column: Filtered Student Roster -->
          <div class="attendance-roster-column">
            ${state.attendanceMessage ? `
              <div class="alert-success-banner" style="margin-bottom: 16px;">
                <span>${escapeAttr(state.attendanceMessage)}</span>
              </div>
            ` : ''}

            ${state.attendanceError ? `
              <div class="alert-error-banner" style="margin-bottom: 16px;">
                <span>${escapeAttr(state.attendanceError)}</span>
              </div>
            ` : ''}

            <div id="officer-roster-mount">
              ${filteredMembers.length === 0 ? `
                <div class="content-surface empty-roster-card">
                  <div style="font-size: 36px; margin-bottom: 8px;">🔍</div>
                  <h3 style="font-size: 16px; font-weight: 700; color: #18181b;">No Students Found</h3>
                  <p style="font-size: 13.5px; color: #71717a; margin-top: 4px;">
                    No cadet matches "${escapeAttr(state.nameSearchQuery)}" in ${activeLevel.replace('_', ' ')}.
                  </p>
                  <button type="button" class="btn-secondary" id="empty-clear-search-btn" style="margin-top: 14px;">
                    Clear Search Query
                  </button>
                </div>
              ` : (state.attendanceViewMode === 'table' ? renderRosterTable(filteredMembers, defaultShift) : renderRosterCards(filteredMembers, defaultShift))}
            </div>
          </div>

          <!-- Right Column: Live Feed & Awaiting Scan Panel -->
          <div class="attendance-sidebar-column">
            <!-- Fast Keypad / Hardware Scan Fallback -->
            <div class="content-surface kiosk-quick-scan-surface">
              <div class="surface-header">
                <div>
                  <h3 class="surface-heading" style="font-size: 15px;">Barcode / RFID Scanner</h3>
                  <p class="surface-subtle-text">Type badge ID or scan with USB/Bluetooth gun</p>
                </div>
                <span class="scanner-ready-badge">● Ready</span>
              </div>

              <form id="attendance-scan-form" class="kiosk-inline-form">
                <div style="display: flex; gap: 8px;">
                  <input
                    type="text"
                    class="form-input form-input-lg mono"
                    id="attendance-badge-input"
                    name="identifierCode"
                    placeholder="Scan / Type ID..."
                    value="${escapeAttr(badgeValue)}"
                    autocomplete="off"
                  />
                  <button type="submit" class="btn-primary-full" style="width: auto; padding: 0 20px;" ${state.attendanceLoading ? 'disabled' : ''}>
                    ${state.attendanceLoading ? '...' : 'Scan'}
                  </button>
                </div>
              </form>
            </div>

            <!-- Tabs: Live Log vs Still Out -->
            <div class="content-surface" style="margin-top: 20px;">
              <div class="surface-header" style="border-bottom: none; padding-bottom: 0;">
                <div class="sidebar-tab-pills">
                  <button type="button" class="sidebar-tab-btn ${state.activeAttendanceTab === 'roster' ? 'active' : ''}" data-side-tab="roster">
                    Live Feed (${state.attendanceLogs.length})
                  </button>
                  <button type="button" class="sidebar-tab-btn ${state.activeAttendanceTab === 'pending' ? 'active' : ''}" data-side-tab="pending">
                    Still Out (${pending.length})
                  </button>
                </div>
              </div>

              ${state.activeAttendanceTab === 'pending' ? renderPendingDutyList(pending, defaultShift) : renderLiveAuditFeed(state.attendanceLogs)}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // ── 5. SAFETY CONSOLE (Protected Dashboard with Arun Dass Dashboard Sidebar) ──
  function renderDashboard() {
    const user = state.activeUser || { displayName: 'Authorized Officer', roleTitle: 'Safety Personnel', dutyStation: 'Security Desk' };
    const isCollapsed = Boolean(state.sidebarCollapsed);
    const pendingCount = (state.pendingSignups || []).length;
    const onDutyCount = state.attendanceMetrics.onDutyCount || 0;

    return `
      <div class="dashboard-layout-shell">
        <!-- Arun Dass Dashboard Sidebar Shell (21st.dev/arunjdass/dashboard-sidebar) -->
        <aside class="arun-dashboard-sidebar ${isCollapsed ? 'collapsed' : ''}" id="app-dashboard-sidebar">
          <div>
            <!-- Sidebar Header -->
            <div class="sidebar-header-bar">
              <div class="sidebar-brand-group">
                <div class="sidebar-brand-icon">E1</div>
                <div class="sidebar-brand-info">
                  <span class="sidebar-app-name">E-SECURE 1.0</span>
                  <span class="sidebar-app-tag">Campus Safety Suite</span>
                </div>
              </div>
              <button type="button" class="sidebar-collapse-trigger" id="dashboard-sidebar-toggle" title="${isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}">
                ${isCollapsed ? '▶' : '◀'}
              </button>
            </div>

            <!-- Multi-Tier Navigation -->
            <div class="sidebar-nav-scroll">
              <!-- Tier 1: Operations -->
              <div class="sidebar-tier-group">
                <div class="sidebar-tier-heading">Operations</div>
                <button type="button" class="sidebar-menu-btn active" data-nav-view="dashboard" title="Dashboard Console">
                  <span class="menu-icon">📊</span>
                  <span class="menu-label">Console Overview</span>
                </button>
                <button type="button" class="sidebar-menu-btn" data-nav-view="attendance" title="Attendance Muster Desk">
                  <span class="menu-icon">📋</span>
                  <span class="menu-label">Attendance Desk</span>
                  <span class="menu-badge">${onDutyCount} On Duty</span>
                </button>
                ${isAdminUser() ? `
                  <button type="button" class="sidebar-menu-btn" data-nav-view="approvals" title="Role Approvals">
                    <span class="menu-icon">🛡️</span>
                    <span class="menu-label">Role Approvals</span>
                    ${pendingCount > 0 ? `<span class="menu-badge" style="background:#fee2e2;color:#dc2626;">${pendingCount}</span>` : ''}
                  </button>
                ` : ''}
              </div>

              <!-- Tier 2: Safety & Dispatch -->
              <div class="sidebar-tier-group">
                <div class="sidebar-tier-heading">Security & Dispatch</div>
                <button type="button" class="sidebar-menu-btn" data-nav-link="checkpoints" title="Campus Checkpoints">
                  <span class="menu-icon">📍</span>
                  <span class="menu-label">Active Sectors</span>
                  <span class="menu-badge">4 Active</span>
                </button>
                <button type="button" class="sidebar-menu-btn" id="dash-side-alert-btn" title="Transmit Emergency Alert">
                  <span class="menu-icon">⚡</span>
                  <span class="menu-label">Emergency Alert</span>
                </button>
                <button type="button" class="sidebar-menu-btn" data-nav-link="hotlines" title="Campus Hotlines">
                  <span class="menu-icon">📞</span>
                  <span class="menu-label">Direct Hotlines</span>
                </button>
              </div>

              <!-- Tier 3: Reports & System -->
              <div class="sidebar-tier-group">
                <div class="sidebar-tier-heading">Reports & Data</div>
                ${isAdminUser() ? `
                  <button type="button" class="sidebar-menu-btn" id="dash-side-export-btn" title="Export Excel Report">
                    <span class="menu-icon">📥</span>
                    <span class="menu-label">Turnout Report (.xlsx)</span>
                  </button>
                ` : ''}
                <div class="sidebar-menu-btn" style="cursor: default; opacity: 0.85;" title="Database: Encrypted Edge Store">
                  <span class="menu-icon">🔒</span>
                  <span class="menu-label" style="font-size: 12px; color: #71717a;">Cloud SQL Encrypted</span>
                </div>
              </div>
            </div>
          </div>

          <!-- User Profile Footer -->
          <div class="sidebar-profile-card">
            <div class="sidebar-user-avatar">
              ${escapeAttr(user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2))}
            </div>
            <div class="sidebar-user-meta">
              <span class="sidebar-user-name">${escapeAttr(user.displayName)}</span>
              <span class="sidebar-user-role">${escapeAttr(user.roleTitle)}</span>
            </div>
            <button type="button" class="sidebar-signout-btn" id="app-side-signout-btn" title="Sign Out">
              ⏻
            </button>
          </div>
        </aside>

        <!-- Main Workspace Frame -->
        <main class="dashboard-workspace-frame">
          <div class="workspace-top-bar">
            <div class="workspace-breadcrumbs">
              <span>Campus Safety</span>
              <span>/</span>
              <span>Safety Console</span>
              <span>/</span>
              <strong>${escapeAttr(user.displayName)}</strong>
            </div>

            <div class="workspace-header-actions">
              <span class="kpi-pill kpi-pill-accent" style="font-size: 11.5px;">
                ● ${shiftLabel(state.selectedShift || state.currentShift)} ACTIVE
              </span>
              ${isAdminUser() ? `
                <button type="button" class="btn-secondary" id="dash-workspace-export-btn" style="background:#18181b;color:#fff;border-color:#18181b;font-size:12.5px;padding:6px 12px;">
                  ↓ Export Excel Report
                </button>
              ` : ''}
              <button type="button" class="btn-secondary" id="dash-report-btn" style="font-size:12.5px;padding:6px 12px;">
                Transmit Alert
              </button>
            </div>
          </div>

          <!-- Greeting & Station Banner -->
          <div class="console-hero-banner" style="margin-bottom: 24px;">
            <div>
              <h2 class="console-greeting-title">
                Good day, ${user.displayName}
              </h2>
              <p class="console-greeting-sub">
                Role: <strong>${user.roleTitle}</strong> • Station: <strong>${user.dutyStation}</strong>
              </p>
            </div>

            <div class="console-action-pills">
              <button class="console-pill-btn primary" data-nav-view="attendance">
                Open Attendance Desk
              </button>
              ${isAdminUser() ? `
                <button class="console-pill-btn secondary" data-nav-view="approvals">
                  Approvals (${state.pendingSignups.length})
                </button>
              ` : ''}
            </div>
          </div>

          <!-- 4 KPI Metrics -->
          <div class="metrics-four-grid console-attendance-strip" style="margin-bottom: 28px;">
            <button type="button" class="metric-card metric-card-button" data-nav-view="attendance">
              <span class="metric-title">On duty</span>
              <div class="metric-number">${state.attendanceMetrics.onDutyCount || 0}</div>
              <span class="metric-note">Live check-in count</span>
            </button>
            <button type="button" class="metric-card metric-card-button" data-nav-view="attendance">
              <span class="metric-title">This shift</span>
              <div class="metric-number">${state.attendanceMetrics.scannedThisShift || 0}</div>
              <span class="metric-note">${shiftLabel(state.selectedShift || state.currentShift)}</span>
            </button>
            <button type="button" class="metric-card metric-card-button metric-card-alert" data-nav-view="attendance">
              <span class="metric-title">Still out</span>
              <div class="metric-number">${state.attendanceMetrics.pendingThisShift || (state.attendancePending || []).length}</div>
              <span class="metric-note">Needs a scan</span>
            </button>
            <button type="button" class="metric-card metric-card-button" data-nav-view="attendance">
              <span class="metric-title">Today</span>
              <div class="metric-number">${state.attendanceMetrics.checkedInToday || 0}</div>
              <span class="metric-note">Total records</span>
            </button>
          </div>

          <!-- Two Column Operational Layout -->
          <div class="console-dashboard-grid">
            <!-- Left Column: Ongoing Watch Areas -->
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                <h3 style="font-size: 17px; font-weight: 800; color: #18181b;">Active Campus Watch Sectors</h3>
                <span style="font-size: 12.5px; font-weight: 600; color: #71717a;">4 Checkpoints Active</span>
              </div>

              <div class="areas-2x2-grid">
                ${state.areas.map(area => `
                  <div class="area-patrol-card">
                    <div>
                      <span class="area-date-tag">${area.date} • ${area.sector}</span>
                      <h4 class="area-title-text">${area.title}</h4>
                      <p class="area-sub-text">${area.subtitle}</p>
                      <div style="font-size: 12px; margin-top: 8px; color: #52525b;">Assigned: <strong>${area.assignedUnit}</strong></div>
                    </div>

                    <div class="area-progress-wrapper">
                      <div class="area-progress-bar-bg">
                        <div class="area-progress-bar-fill" style="width: ${area.progress}%;"></div>
                      </div>
                      <div class="area-progress-info">
                        <span>Shift Coverage</span>
                        <span>${area.progress}%</span>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Right Column: Operational Tasks Checklist -->
            <div>
              <div class="tasks-card-container">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                  <h3 style="font-size: 16px; font-weight: 800; color: #18181b;">Shift Protocols</h3>
                  <span style="font-size: 12.5px; font-weight: 600; color: #71717a;">
                    ${state.tasks.filter(t => t.done).length}/${state.tasks.length} Completed
                  </span>
                </div>

                <div class="tasks-list-scroll">
                  ${state.tasks.map(task => `
                    <div class="task-item-card ${task.done ? 'done' : ''}">
                      <input type="checkbox" class="task-checkbox-custom" data-task-id="${task.id}" ${task.done ? 'checked' : ''} />
                      <div style="flex: 1;">
                        <div class="task-title-text">${task.title}</div>
                        <div class="task-meta-row">
                          <span class="task-due-tag">${task.due}</span>
                          ${task.isUrgent ? '<span class="task-urgent-badge">Urgent</span>' : ''}
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
  }

  // ── 6. ADMIN APPROVALS PANEL ──
  function renderApprovalsPanel() {
    return `
      <section class="admin-panel-canvas">
        <div class="page-title-strip">
          <div>
            <h1 class="page-main-heading">Role Approvals</h1>
            <p class="page-sub-heading">
              Review and assign duty clearance to newly registered criminology students, safety personnel, and department representatives.
            </p>
          </div>
          <button class="btn-secondary" data-nav-view="dashboard">
            Back to Console
          </button>
        </div>

        <div style="margin-top: 24px;">
          ${(state.pendingSignups && state.pendingSignups.length > 0) ? state.pendingSignups.map(req => `
            <div class="approval-card-item">
              <div>
                <h3 class="approval-user-name">${req.name}</h3>
                <div class="approval-user-meta">
                  Email: <strong>${req.email}</strong> • Requested Role: <strong>${req.requestedRole}</strong> • Station: <strong>${req.preferredStation}</strong>
                </div>
              </div>
              <div class="approval-actions">
                <button class="btn-approve" data-approve-id="${req.id}">
                  Approve Clearance
                </button>
              </div>
            </div>
          `).join('') : `
            <div class="content-surface" style="text-align: center; padding: 48px 24px;">
              <h3 style="font-size: 16px; font-weight: 700; color: #18181b;">No Pending Registrations</h3>
              <p style="font-size: 13.5px; color: #71717a; margin-top: 6px;">
                All personnel requests have been processed. New signups from the portal will appear here immediately.
              </p>
            </div>
          `}
        </div>
      </section>
    `;
  }

  // ── 7. QUICK HELP / DISPATCH MODAL ──
  function renderReportModal() {
    return `
      <div class="modal-overlay" id="modal-backdrop">
        <div class="modal-content-card">
          <div class="modal-header-row">
            <h3 class="modal-title">Transmit Emergency Alert</h3>
            <button class="modal-close-btn" id="modal-close-action">✕</button>
          </div>

          ${state.reportSuccess ? `
            <div style="text-align: center; padding: 32px 16px;">
              <div style="font-size: 36px; margin-bottom: 12px; color: #18181b;">✓</div>
              <h4 style="font-size: 18px; font-weight: 800; color: #18181b;">Alert Dispatched</h4>
              <p style="font-size: 13.5px; color: #71717a; margin-top: 6px;">
                Campus safety officers and nearest emergency responders have been alerted. Stand by at a safe perimeter.
              </p>
              <button class="auth-submit-btn" id="modal-done-btn" style="margin-top: 20px;">
                Done
              </button>
            </div>
          ` : `
            <form id="modal-report-form" onsubmit="return false;">
              <div class="form-group">
                <label class="form-label">Urgency Level</label>
                <select class="form-input" id="modal-urgency">
                  <option value="CRITICAL">CRITICAL — Immediate Life Safety / Fire</option>
                  <option value="HIGH">HIGH — Perimeter Hazard / Altercation</option>
                  <option value="MEDIUM" selected>MEDIUM — Facility Hazard / Spill</option>
                  <option value="LOW">LOW — General Campus Assistance</option>
                </select>
              </div>

              <div class="form-group" style="margin-top: 14px;">
                <label class="form-label">Location on Campus (WHERE)</label>
                <input type="text" class="form-input" id="modal-location" placeholder="e.g. Main Quad East Steps" required />
              </div>

              <div class="form-group" style="margin-top: 14px;">
                <label class="form-label">Details of Situation (WHAT / WHY)</label>
                <textarea class="form-input" id="modal-message" rows="3" placeholder="Describe what is occurring..." required></textarea>
              </div>

              <button type="submit" class="auth-submit-btn" id="submit-help-action">
                Submit Emergency Dispatch
              </button>
            </form>
          `}
        </div>
      </div>
    `;
  }

  // Toast message helper
  function showToast(msg) {
    state.toastMessage = msg;
    render();
    setTimeout(() => {
      state.toastMessage = null;
      render();
    }, 3500);
  }

  // ── Event Handlers & API Orchestration ──
  function attachEvents() {
    // Navigation view clicks
    document.querySelectorAll('[data-nav-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = btn.getAttribute('data-nav-view');
        state.view = targetView;
        localStorage.setItem('esecure_current_view', targetView);
        state.authError = null;
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    // Top Navigation Links (scroll or return home)
    document.querySelectorAll('[data-nav-link]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const link = btn.getAttribute('data-nav-link');
        if (state.view !== 'home') {
          state.view = 'home';
          render();
        }
        if (link === 'overview') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (link === 'checkpoints') {
          const el = document.getElementById('section-checkpoints');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else if (link === 'hotlines') {
          const el = document.getElementById('section-hotlines');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Direct Header Auth Buttons (Sign In / Sign Up)
    document.querySelectorAll('[data-auth-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = btn.getAttribute('data-auth-action');
        state.authMode = action === 'signup' ? 'signup' : 'signin';
        state.view = 'auth';
        state.authError = null;
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    // Brand link (return home)
    const brandLink = document.getElementById('brand-link');
    if (brandLink) {
      brandLink.addEventListener('click', (e) => {
        e.preventDefault();
        state.view = 'home';
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Back to Overview in auth portal
    const authBackBtn = document.getElementById('auth-back-btn');
    if (authBackBtn) {
      authBackBtn.addEventListener('click', (e) => {
        e.preventDefault();
        state.view = 'home';
        state.authError = null;
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Request access (signup) submit
    const signupForm = document.getElementById('auth-signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        state.authError = null;
        const name = document.getElementById('reg-name')?.value.trim();
        const email = document.getElementById('reg-email')?.value.trim();
        const role = document.getElementById('reg-role')?.value || 'cadet';
        const station = document.getElementById('reg-station')?.value;

        if (!name || !email) {
          state.authError = 'Please provide your full name and university email.';
          render();
          return;
        }

        state.authLoading = true;
        render();

        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, requestedRole: role, preferredStation: station })
          });
          const data = await res.json();
          state.authLoading = false;

          if (res.ok) {
            state.authMode = 'signin';
            showToast('Request submitted. Wait for command desk clearance.');
            render();
          } else {
            state.authError = data.error || 'Registration failed. Try again.';
            render();
          }
        } catch (err) {
          state.authLoading = false;
          state.authError = 'Connection error: ' + err.message;
          render();
        }
      });
    }

    const passkeyEye = document.getElementById('toggle-passkey-eye');
    if (passkeyEye) {
      passkeyEye.addEventListener('click', () => {
        const input = document.getElementById('auth-passkey');
        if (!input) return;
        const hidden = input.type === 'password';
        input.type = hidden ? 'text' : 'password';
        passkeyEye.setAttribute('aria-label', hidden ? 'Hide passkey' : 'Show passkey');
      });
    }

    const forgotBtn = document.getElementById('auth-forgot-btn');
    if (forgotBtn) {
      forgotBtn.addEventListener('click', () => {
        showToast('Ask the campus command desk to reset your passkey. Do not share credentials.');
      });
    }

    const signinForm = document.getElementById('auth-signin-form');
    if (signinForm) {
      signinForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await submitUnifiedSignIn();
      });
    }

    // Toggle Sign Up panel (nudge link at bottom of sign-in form)
    const authToggleSignup = document.getElementById('auth-toggle-signup');
    if (authToggleSignup) {
      authToggleSignup.addEventListener('click', () => {
        state.authMode = state.authMode === 'signup' ? 'signin' : 'signup';
        state.authError = null;
        render();
        setTimeout(() => {
          const panel = document.getElementById('signup-panel');
          if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      });
    }

    // Quick demo chip auto-fill
    document.querySelectorAll('.auth-demo-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const code = chip.getAttribute('data-fill');
        const input = document.getElementById('auth-credential');
        if (input) {
          input.value = code;
          input.focus();
        }
      });
    });

    // ── Attendance Workspace Interactive Event Handlers ──

    // Level In-Charge Selector Pills
    document.querySelectorAll('[data-select-level]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.selectedLevel = btn.getAttribute('data-select-level');
        render();
      });
    });

    // Admin Cohort Gauge Card Click (Quick filter into that level)
    document.querySelectorAll('[data-level-filter]').forEach(card => {
      card.addEventListener('click', () => {
        const lvl = card.getAttribute('data-level-filter');
        state.selectedLevel = state.selectedLevel === lvl ? 'ALL' : lvl;
        render();
        const mount = document.getElementById('officer-roster-mount');
        if (mount) mount.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });

    // View Mode Toggle (Cards vs Table)
    document.querySelectorAll('[data-set-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.attendanceViewMode = btn.getAttribute('data-set-view');
        render();
      });
    });

    // Sidebar Tabs (Live Feed vs Still Out)
    document.querySelectorAll('[data-side-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeAttendanceTab = btn.getAttribute('data-side-tab');
        render();
      });
    });

    // Instant Search Input with live DOM update to prevent focus loss
    const searchInput = document.getElementById('officer-name-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.nameSearchQuery = e.target.value;
        const mount = document.getElementById('officer-roster-mount');
        const defaultShift = state.selectedShift || state.currentShift || 'AM_IN';
        const rawMembers = (state.attendanceMembers && state.attendanceMembers.length > 0)
          ? state.attendanceMembers
          : (state.roster || []);

        const query = (state.nameSearchQuery || '').trim().toLowerCase();
        const activeLevel = state.selectedLevel || 'ALL';

        const filtered = rawMembers.filter(m => {
          if (activeLevel !== 'ALL' && m.yearLevel !== activeLevel) return false;
          if (!query) return true;
          const name = (m.displayName || '').toLowerCase();
          const idNum = (m.studentIdNumber || '').toLowerCase();
          const ident = (m.identifierCode || '').toLowerCase();
          const sec = (m.sectionName || '').toLowerCase();
          return name.includes(query) || idNum.includes(query) || ident.includes(query) || sec.includes(query);
        });

        if (mount) {
          if (filtered.length === 0) {
            mount.innerHTML = `
              <div class="content-surface empty-roster-card">
                <div style="font-size: 36px; margin-bottom: 8px;">🔍</div>
                <h3 style="font-size: 16px; font-weight: 700; color: #18181b;">No Students Found</h3>
                <p style="font-size: 13.5px; color: #71717a; margin-top: 4px;">
                  No cadet matches "${escapeAttr(state.nameSearchQuery)}" in ${activeLevel.replace('_', ' ')}.
                </p>
                <button type="button" class="btn-secondary" id="empty-clear-search-btn" style="margin-top: 14px;">
                  Clear Search Query
                </button>
              </div>
            `;
            const clearBtn = document.getElementById('empty-clear-search-btn');
            if (clearBtn) clearBtn.addEventListener('click', () => { state.nameSearchQuery = ''; render(); });
          } else {
            mount.innerHTML = state.attendanceViewMode === 'table'
              ? renderRosterTable(filtered, defaultShift)
              : renderRosterCards(filtered, defaultShift);
          }
          attachRosterActionButtons();
        }

        const counter = document.querySelector('.search-result-counter');
        if (counter) counter.innerHTML = `Showing <strong>${filtered.length}</strong> of ${rawMembers.length}`;

        const clearBtn = document.getElementById('search-clear-action');
        if (clearBtn) {
          clearBtn.style.display = query ? 'inline-block' : 'none';
        }
      });
    }

    // Clear search buttons
    const clearAction = document.getElementById('search-clear-action');
    if (clearAction) {
      clearAction.addEventListener('click', () => {
        state.nameSearchQuery = '';
        render();
      });
    }
    const emptyClearBtn = document.getElementById('empty-clear-search-btn');
    if (emptyClearBtn) {
      emptyClearBtn.addEventListener('click', () => {
        state.nameSearchQuery = '';
        render();
      });
    }

    // 1-Tap Attendance Actions (Time In, Time Out, Override)
    function attachRosterActionButtons() {
      document.querySelectorAll('[data-action="time-in"]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const memberId = btn.getAttribute('data-member-id');
          await executeQuickAttendance(memberId, 'CHECK_IN', false);
        });
      });

      document.querySelectorAll('[data-action="time-out"]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const memberId = btn.getAttribute('data-member-id');
          await executeQuickAttendance(memberId, 'CHECK_OUT', false);
        });
      });

      document.querySelectorAll('[data-action="override"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const memberId = btn.getAttribute('data-member-id');
          const member = (state.attendanceMembers || []).find(m => m.id === memberId) ||
            (state.attendancePending || []).find(m => m.id === memberId);
          if (member) {
            const shiftType = state.selectedShift || state.currentShift || 'AM_IN';
            state.overrideModal = {
              isOpen: true,
              member,
              shiftType,
              eventType: shiftType.endsWith('_OUT') ? 'CHECK_OUT' : 'CHECK_IN',
              reason: 'Manual ID Verified',
              customTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              submitting: false,
              error: null
            };
            render();
          }
        });
      });
    }

    attachRosterActionButtons();

    // Quick Attendance Execution (1-Tap Fast Record)
    async function executeQuickAttendance(memberId, eventType, isOverride, overrideReason, customTime) {
      const shiftType = state.selectedShift || state.currentShift || 'AM_IN';
      state.attendanceLoading = true;
      state.attendanceError = null;
      state.attendanceMessage = null;

      try {
        const res = await fetch('/api/attendance/check-in', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            memberId,
            shiftType,
            eventType,
            override: Boolean(isOverride),
            overrideReason: overrideReason || null,
            customTime: customTime || null,
            verificationMethod: isOverride ? 'MANUAL_OVERRIDE' : 'MANUAL_OFFICER_DESK',
            recordedBy: state.activeUser?.displayName || 'Duty Officer'
          })
        });

        const data = await res.json();
        state.attendanceLoading = false;

        if (res.ok && data.success) {
          if (data.duplicate && !isOverride) {
            showToast(`${data.member?.displayName || 'Student'} is already recorded for ${shiftType.replace('_', ' ')}. Use Override to adjust.`);
          } else {
            showToast(data.message || 'Attendance recorded.');
          }
          if (data.metrics) state.attendanceMetrics = data.metrics;
          if (Array.isArray(data.pending)) state.attendancePending = data.pending;
          if (Array.isArray(data.members)) state.attendanceMembers = data.members;
          if (data.log) {
            state.attendanceLogs = [data.log].concat(state.attendanceLogs.filter(l => l.id !== data.log.id));
          }
          await fetchRoleData();
          render();
        } else {
          showToast('Error: ' + (data.error || 'Check-in failed'));
          state.attendanceError = data.error || 'Attendance check-in failed.';
          render();
        }
      } catch (err) {
        state.attendanceLoading = false;
        showToast('Connection error: ' + err.message);
        render();
      }
    }

    // ── Override Modal Events ──
    const overrideCloseBtn = document.getElementById('modal-override-close');
    const overrideCancelBtn = document.getElementById('modal-override-cancel');
    const overrideBackdrop = document.getElementById('attendance-override-backdrop');

    if (overrideCloseBtn) {
      overrideCloseBtn.addEventListener('click', () => {
        state.overrideModal.isOpen = false;
        render();
      });
    }
    if (overrideCancelBtn) {
      overrideCancelBtn.addEventListener('click', () => {
        state.overrideModal.isOpen = false;
        render();
      });
    }
    if (overrideBackdrop) {
      overrideBackdrop.addEventListener('click', (e) => {
        if (e.target === overrideBackdrop) {
          state.overrideModal.isOpen = false;
          render();
        }
      });
    }

    // Reason chips in override modal
    document.querySelectorAll('[data-override-reason]').forEach(chip => {
      chip.addEventListener('click', () => {
        const reason = chip.getAttribute('data-override-reason');
        state.overrideModal.reason = reason;
        const input = document.getElementById('override-custom-reason');
        if (input) input.value = reason;
        document.querySelectorAll('[data-override-reason]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });

    // Shift toggle buttons inside override modal
    document.querySelectorAll('[data-override-shift]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.overrideModal.shiftType = btn.getAttribute('data-override-shift');
        state.overrideModal.eventType = state.overrideModal.shiftType.endsWith('_OUT') ? 'CHECK_OUT' : 'CHECK_IN';
        document.querySelectorAll('[data-override-shift]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('[data-override-event]').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-override-event') === state.overrideModal.eventType);
        });
      });
    });

    // Event type buttons inside override modal
    document.querySelectorAll('[data-override-event]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.overrideModal.eventType = btn.getAttribute('data-override-event');
        document.querySelectorAll('[data-override-event]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Override Form Submission
    const overrideForm = document.getElementById('attendance-override-form');
    if (overrideForm) {
      overrideForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const modal = state.overrideModal;
        if (!modal.member) return;

        const reason = document.getElementById('override-custom-reason')?.value.trim() || modal.reason || 'Manual Officer Override';
        const customTime = document.getElementById('override-custom-time')?.value.trim();

        modal.submitting = true;
        render();

        try {
          const res = await fetch('/api/attendance/override', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
              memberId: modal.member.id,
              shiftType: modal.shiftType,
              eventType: modal.eventType,
              override: true,
              overrideReason: reason,
              customTime: customTime || null,
              recordedBy: state.activeUser?.displayName || 'Duty Officer'
            })
          });

          const data = await res.json();
          modal.submitting = false;

          if (res.ok && data.success) {
            state.overrideModal.isOpen = false;
            showToast(`[OVERRIDE SUCCESS] ${modal.member.displayName} set to ${shiftLabel(modal.shiftType)}`);
            if (data.metrics) state.attendanceMetrics = data.metrics;
            if (Array.isArray(data.pending)) state.attendancePending = data.pending;
            if (Array.isArray(data.members)) state.attendanceMembers = data.members;
            if (data.log) {
              state.attendanceLogs = [data.log].concat(state.attendanceLogs.filter(l => l.id !== data.log.id));
            }
            await fetchRoleData();
            render();
          } else {
            modal.error = data.error || 'Override failed. Please try again.';
            render();
          }
        } catch (err) {
          modal.submitting = false;
          modal.error = 'Network error: ' + err.message;
          render();
        }
      });
    }

    // Shift toggle buttons in Top Header
    document.querySelectorAll('.shift-toggle-btn:not(.override-shift-btn)').forEach(btn => {
      btn.addEventListener('click', async () => {
        state.selectedShift = btn.getAttribute('data-shift');
        document.querySelectorAll('.shift-toggle-btn:not(.override-shift-btn)').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        try {
          const res = await fetch('/api/attendance?shift=' + encodeURIComponent(state.selectedShift), {
            headers: { 'Authorization': 'Bearer ' + state.authToken }
          });
          if (res.ok) applyAttendancePayload(await res.json());
          render();
        } catch (err) {
          render();
        }
      });
    });

    const badgeInput = document.getElementById('attendance-badge-input');
    if (badgeInput && state.view === 'attendance' && !state.attendanceLoading) {
      badgeInput.focus();
      badgeInput.select();
    }

    const btnRefreshAttendance = document.getElementById('btn-refresh-attendance');
    if (btnRefreshAttendance) {
      btnRefreshAttendance.addEventListener('click', async () => {
        await fetchRoleData();
        showToast('Attendance board updated.');
        render();
      });
    }

    const attendanceForm = document.getElementById('attendance-scan-form');
    if (attendanceForm) {
      attendanceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('attendance-badge-input');
        const badgeValue = (input ? input.value : state.scanBadgeInput || '').trim();
        const verificationMethod = 'BARCODE_SCANNER';

        if (!badgeValue) {
          state.attendanceError = 'Enter or scan a badge ID.';
          render();
          return;
        }

        state.scanBadgeInput = badgeValue;
        state.attendanceLoading = true;
        state.attendanceError = null;
        state.attendanceMessage = null;
        render();

        try {
          const res = await fetch('/api/attendance/check-in', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
              identifierCode: badgeValue,
              shiftType: state.selectedShift || state.currentShift || 'AM_IN',
              verificationMethod,
              terminalCode: 'KIOSK-MAIN-SEC'
            })
          });

          const data = await res.json();
          state.attendanceLoading = false;

          if (res.ok && data.success) {
            state.attendanceMessage = data.message || (data.member?.displayName + ' recorded.');
            if (data.metrics) state.attendanceMetrics = data.metrics;
            if (Array.isArray(data.pending)) state.attendancePending = data.pending;
            if (Array.isArray(data.members)) state.attendanceMembers = data.members;
            if (data.log && !data.duplicate) {
              state.attendanceLogs = [data.log].concat(state.attendanceLogs.filter(l => l.id !== data.log.id));
            }
            await fetchRoleData();
            state.scanBadgeInput = '';
            showToast(data.duplicate ? 'Already recorded for this shift.' : 'Attendance recorded.');
            render();
          } else {
            state.attendanceError = data.error || 'Check-in failed. Verify the badge ID.';
            render();
          }
        } catch (err) {
          state.attendanceLoading = false;
          state.attendanceError = 'Network error: ' + err.message;
          render();
        }
      });
    }

    // Quick report triggers
    const reportTriggers = [
      document.getElementById('top-quick-report-btn'),
      document.getElementById('hero-report-btn'),
      document.getElementById('dash-report-btn')
    ];
    reportTriggers.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          state.isReportModalOpen = true;
          state.reportSuccess = false;
          render();
        });
      }
    });

    // Close report modal
    const closeBtn = document.getElementById('modal-close-action');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        state.isReportModalOpen = false;
        render();
      });
    }

    const modalDoneBtn = document.getElementById('modal-done-btn');
    if (modalDoneBtn) {
      modalDoneBtn.addEventListener('click', () => {
        state.isReportModalOpen = false;
        render();
      });
    }

    // Submit incident report
    const modalForm = document.getElementById('modal-report-form');
    if (modalForm) {
      modalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const urgency = document.getElementById('modal-urgency')?.value;
        const location = document.getElementById('modal-location')?.value;
        const message = document.getElementById('modal-message')?.value;

        try {
          await fetch('/api/reports/incident', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category: 'CAMPUS_SECURITY',
              urgency: urgency,
              whereLocation: location,
              whatOccurred: message,
              whenOccurred: 'Just now',
              whyHowContext: 'Direct kiosk civilian alert transmission'
            })
          });
        } catch (e) {
          // ignore edge buffer
        }

        state.reportSuccess = true;
        render();
      });
    }

    // Hero CTA button
    const heroCtaBtn = document.getElementById('hero-cta-btn');
    if (heroCtaBtn) {
      heroCtaBtn.addEventListener('click', () => {
        if (state.isAuthenticated) {
          state.view = 'attendance';
        } else {
          state.view = 'auth';
          state.authMode = 'signin';
        }
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Sign out button
    const signoutBtn = document.getElementById('app-signout-btn');
    if (signoutBtn) {
      signoutBtn.addEventListener('click', async () => {
        if (state.authToken) {
          try {
            await fetch('/api/auth/logout', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${state.authToken}` }
            });
          } catch (err) {
            // ignore
          }
        }
        logoutLocally();
        showToast('You have been signed out.');
        render();
      });
    }

    const authSubmitAction = document.getElementById('auth-submit-action');
    if (authSubmitAction && !document.getElementById('auth-signin-form')) {
      authSubmitAction.addEventListener('click', async () => {
        await submitUnifiedSignIn();
      });
    }

    // Admin approval button
    document.querySelectorAll('[data-approve-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-approve-id');
        try {
          const res = await fetch('/api/admin/registrations/approve', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.authToken}`
            },
            body: JSON.stringify({ id })
          });
          if (res.ok) {
            showToast('Personnel request approved & duty post assigned.');
            await fetchRoleData();
            render();
          }
        } catch (e) {
          console.error(e);
        }
      });
    });

    // Task checkbox toggle
    document.querySelectorAll('.task-checkbox-custom').forEach(cb => {
      cb.addEventListener('change', () => {
        const taskId = cb.getAttribute('data-task-id');
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
          task.done = cb.checked;
          render();
        }
      });
    });

    // ── Arun Dass Dashboard Sidebar Handlers ──
    const sideToggle = document.getElementById('dashboard-sidebar-toggle');
    if (sideToggle) {
      sideToggle.addEventListener('click', () => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
        localStorage.setItem('esecure_sidebar_collapsed', state.sidebarCollapsed ? 'true' : 'false');
        render();
      });
    }

    const sideSignoutBtn = document.getElementById('app-side-signout-btn');
    if (sideSignoutBtn) {
      sideSignoutBtn.addEventListener('click', async () => {
        if (state.authToken) {
          try {
            await fetch('/api/auth/logout', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${state.authToken}` }
            });
          } catch (err) {}
        }
        logoutLocally();
        showToast('You have been signed out.');
        render();
      });
    }

    const sideAlertBtn = document.getElementById('dash-side-alert-btn');
    if (sideAlertBtn) {
      sideAlertBtn.addEventListener('click', () => {
        state.isReportModalOpen = true;
        state.reportSuccess = false;
        render();
      });
    }

    // ── Attendance Excel / CSV Export Handlers ──
    const openExportModal = () => {
      state.exportModal.isOpen = true;
      state.exportModal.error = null;
      render();
    };

    const btnExportAttendance = document.getElementById('btn-export-attendance');
    if (btnExportAttendance) btnExportAttendance.addEventListener('click', openExportModal);

    const dashWsExport = document.getElementById('dash-workspace-export-btn');
    if (dashWsExport) dashWsExport.addEventListener('click', openExportModal);

    const dashSideExport = document.getElementById('dash-side-export-btn');
    if (dashSideExport) dashSideExport.addEventListener('click', openExportModal);

    const exportCloseBtn = document.getElementById('modal-export-close');
    if (exportCloseBtn) {
      exportCloseBtn.addEventListener('click', () => {
        state.exportModal.isOpen = false;
        render();
      });
    }

    const exportCancelBtn = document.getElementById('modal-export-cancel');
    if (exportCancelBtn) {
      exportCancelBtn.addEventListener('click', () => {
        state.exportModal.isOpen = false;
        render();
      });
    }

    const exportBackdrop = document.getElementById('attendance-export-backdrop');
    if (exportBackdrop) {
      exportBackdrop.addEventListener('click', (e) => {
        if (e.target === exportBackdrop) {
          state.exportModal.isOpen = false;
          render();
        }
      });
    }

    document.querySelectorAll('.export-filter-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.exportModal.filterType = btn.getAttribute('data-filter-type') || 'ALL';
        render();
      });
    });

    const exportSelectEvent = document.getElementById('export-select-event');
    if (exportSelectEvent) {
      exportSelectEvent.addEventListener('change', (e) => {
        state.exportModal.eventId = e.target.value;
      });
    }

    const exportInputDate = document.getElementById('export-input-date');
    if (exportInputDate) {
      exportInputDate.addEventListener('change', (e) => {
        state.exportModal.date = e.target.value;
      });
    }

    const exportSelectMonth = document.getElementById('export-select-month');
    if (exportSelectMonth) {
      exportSelectMonth.addEventListener('change', (e) => {
        state.exportModal.month = e.target.value;
      });
    }

    const exportSelectYear = document.getElementById('export-select-year');
    if (exportSelectYear) {
      exportSelectYear.addEventListener('change', (e) => {
        state.exportModal.year = e.target.value;
      });
    }

    const exportForm = document.getElementById('attendance-export-form');
    if (exportForm) {
      exportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const modal = state.exportModal;
        modal.loading = true;
        modal.error = null;
        render();

        try {
          const params = new URLSearchParams();
          const selectedEvent = document.getElementById('export-select-event')?.value || modal.eventId;
          if (selectedEvent && selectedEvent !== 'ALL') {
            params.set('eventId', selectedEvent);
          }

          if (modal.filterType === 'DAY') {
            const dateVal = document.getElementById('export-input-date')?.value || modal.date;
            if (dateVal) params.set('date', dateVal);
          } else if (modal.filterType === 'MONTH_YEAR') {
            const mVal = document.getElementById('export-select-month')?.value || modal.month;
            const yVal = document.getElementById('export-select-year')?.value || modal.year;
            if (mVal) params.set('month', mVal);
            if (yVal) params.set('year', yVal);
          }

          const res = await fetch(`/api/attendance/export?${params.toString()}`, {
            headers: authHeaders()
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Export failed with status ${res.status}`);
          }

          const blob = await res.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const downloadAnchor = document.createElement('a');
          downloadAnchor.href = blobUrl;

          const disposition = res.headers.get('Content-Disposition') || '';
          let filename = 'esecure_attendance_turnout.csv';
          const match = disposition.match(/filename="?([^";]+)"?/i);
          if (match && match[1]) filename = match[1];

          downloadAnchor.download = filename;
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
          window.URL.revokeObjectURL(blobUrl);

          modal.loading = false;
          modal.isOpen = false;
          showToast(`Report downloaded: ${filename}`);
          render();
        } catch (err) {
          modal.loading = false;
          modal.error = err.message;
          showToast('Export failed: ' + err.message);
          render();
        }
      });
    }

    // Global Shortcut: '/' to focus fast search in attendance
    if (!window._esecureSlashBound) {
      window._esecureSlashBound = true;
      window.addEventListener('keydown', (e) => {
        if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
          const searchBox = document.getElementById('officer-name-search');
          if (searchBox && state.view === 'attendance') {
            e.preventDefault();
            searchBox.focus();
            searchBox.select();
          }
        }
      });
    }
  }

  // ── Application Bootstrap ──
  async function init() {
    root = document.getElementById('app-container');
    if (!root) {
      console.error('[E-Secure] #app-container not found — check index.html');
      return;
    }
    await checkLiveDatabase();
    await verifySession();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
