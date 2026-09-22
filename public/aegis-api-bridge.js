// ─────────────────────────────────────────────────────────────────────────────
// Created: 2026-09-17 | Purpose: E-Secure API Bridge — Replit UI ↔ Node.js Backend
// Last verified with: Node.js 20+ native backend | E-Secure 1.0 v2.1
// Compatible with OpenCode plugin: paste this into prompt for handoff
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const BASE = window.location.origin;
  let _role = 'admin';

  // ── Role Token (synced with Replit role ribbon) ──────────────────────────
  const roleHeader = () => ({
    'Content-Type': 'application/json',
    'x-user-role': _role.toUpperCase(),
  });

  // ── Expose on window so React compiled app can call via global hooks ──────
  window.E-SecureAPI = {

    // ── Set current role (called by role ribbon buttons) ─────────────────
    setRole(role) {
      _role = role;
      console.log(`[E-SecureBridge] Role → ${role.toUpperCase()}`);
    },

    // ── Fetch live emergency hotlines from backend ─────────────────────
    async getHotlines() {
      try {
        const r = await fetch(`${BASE}/api/hotlines`);
        const d = await r.json();
        return d.hotlines ?? [];
      } catch (e) {
        console.warn('[E-SecureBridge] getHotlines failed, using mock:', e.message);
        return [];
      }
    },

    // ── Fetch cadet tactical mesh (squad roster, phones, radio, station) ─
    async getCadetMesh() {
      try {
        const r = await fetch(`${BASE}/api/cadet-mesh`, { headers: roleHeader() });
        const d = await r.json();
        return d.mesh ?? [];
      } catch (e) {
        console.warn('[E-SecureBridge] getCadetMesh failed:', e.message);
        return [];
      }
    },

    // ── Fetch tactical units (squads) ─────────────────────────────────
    async getUnits() {
      try {
        const r = await fetch(`${BASE}/api/units`, { headers: roleHeader() });
        const d = await r.json();
        return d.units ?? [];
      } catch (e) {
        console.warn('[E-SecureBridge] getUnits failed:', e.message);
        return [];
      }
    },

    // ── Auto-balance squads (rescue operative balancing) ─────────────
    async autoBalance() {
      try {
        const r = await fetch(`${BASE}/api/units/auto-balance`, {
          method: 'POST',
          headers: roleHeader(),
        });
        const d = await r.json();
        console.log('[E-SecureBridge] Auto-balance result:', d.message);
        return d;
      } catch (e) {
        console.warn('[E-SecureBridge] autoBalance failed:', e.message);
        return null;
      }
    },

    // ── Transfer cadet to another unit ───────────────────────────────
    async transferMember(memberId, targetUnitId) {
      try {
        const r = await fetch(`${BASE}/api/units/assign`, {
          method: 'POST',
          headers: roleHeader(),
          body: JSON.stringify({ memberId, unitId: targetUnitId }),
        });
        return await r.json();
      } catch (e) {
        console.warn('[E-SecureBridge] transferMember failed:', e.message);
        return null;
      }
    },

    // ── Fetch dept leaders registry ──────────────────────────────────
    async getDeptLeaders() {
      try {
        const r = await fetch(`${BASE}/api/dept-leaders`);
        const d = await r.json();
        return d.leaders ?? [];
      } catch (e) {
        console.warn('[E-SecureBridge] getDeptLeaders failed:', e.message);
        return [];
      }
    },

    // ── Submit a 5 W's incident report (with anti-spam live photo) ────
    async submitIncident(payload) {
      try {
        const r = await fetch(`${BASE}/api/reports/incident`, {
          method: 'POST',
          headers: roleHeader(),
          body: JSON.stringify({
            whoName: payload.who !== 'Unknown identity' ? payload.who : undefined,
            whoUnknown: payload.who === 'Unknown identity',
            whatCategory: payload.type,
            whereLocation: payload.location,
            whenOccurred: payload.when || new Date().toISOString(),
            whyDescription: payload.summary,
            category: _mapIncidentCategory(payload.type),
            urgency: payload.priority === 'CRITICAL' ? 'CRITICAL' : payload.priority === 'HIGH' ? 'HIGH' : 'MEDIUM',
            reporterType: _role === 'civilian' ? 'ANONYMOUS_CIVILIAN'
              : _role === 'leader' ? 'DEPT_LEADER'
              : 'CADET_OFFICER',
            message: payload.summary,
            locationHint: payload.location,
            livePhotoDataUrl: payload.photoDataUrl || null,
            livePhotoTimestamp: payload.photoDataUrl ? new Date().toISOString() : null,
          }),
        });

        const d = await r.json();
        if (!r.ok) {
          console.error('[E-SecureBridge] submitIncident validation error:', d);
          return { error: d.error || 'Submission failed', details: d.validationErrors };
        }
        console.log(`[E-SecureBridge] Incident filed: ${d.referenceCode}`);
        return { success: true, referenceCode: d.referenceCode, ...d };
      } catch (e) {
        console.error('[E-SecureBridge] submitIncident network error:', e.message);
        return { error: e.message };
      }
    },

    // ── Get all incident reports (admin feed) ─────────────────────────
    async getReports() {
      try {
        const r = await fetch(`${BASE}/api/reports/admin`, { headers: roleHeader() });
        const d = await r.json();
        return d.reports ?? [];
      } catch (e) {
        console.warn('[E-SecureBridge] getReports failed:', e.message);
        return [];
      }
    },

    // ── Update incident status ────────────────────────────────────────
    async updateStatus(reportId, status) {
      const _statusMap = { LIVE: 'OPEN', ASSIGNED: 'DISPATCHED', MONITOR: 'DISPATCHED', CLOSED: 'RESOLVED' };
      try {
        const r = await fetch(`${BASE}/api/reports/admin/${reportId}`, {
          method: 'PATCH',
          headers: roleHeader(),
          body: JSON.stringify({ status: _statusMap[status] ?? status }),
        });
        return await r.json();
      } catch (e) {
        console.warn('[E-SecureBridge] updateStatus failed:', e.message);
        return null;
      }
    },

    // ── Escalate to government bureau (BFP, PNP, CDRRMO, etc.) ───────
    async escalateGov(reportId, bureau) {
      try {
        const r = await fetch(`${BASE}/api/reports/${reportId}/escalate-gov`, {
          method: 'POST',
          headers: roleHeader(),
          body: JSON.stringify({ bureau }),
        });
        const d = await r.json();
        console.log(`[E-SecureBridge] Gov dossier staged: ${d.dossierCode}`);
        return d;
      } catch (e) {
        console.warn('[E-SecureBridge] escalateGov failed:', e.message);
        return null;
      }
    },

    // ── Public tracker: lookup by reference code ──────────────────────
    async lookupByCode(code) {
      try {
        const r = await fetch(`${BASE}/api/reports/anonymous/${encodeURIComponent(code.trim().toUpperCase())}`);
        if (r.status === 404) return null;
        return await r.json();
      } catch (e) {
        console.warn('[E-SecureBridge] lookupByCode failed:', e.message);
        return null;
      }
    },

    // ── Attendance (Admin only — 403 if non-admin) ────────────────────
    async getAttendance() {
      try {
        const r = await fetch(`${BASE}/api/attendance`, { headers: roleHeader() });
        if (r.status === 403) return { forbidden: true };
        return await r.json();
      } catch (e) {
        console.warn('[E-SecureBridge] getAttendance failed:', e.message);
        return null;
      }
    },

    // ── Scan attendance badge / kiosk ─────────────────────────────────
    async scanAttendance(identifierCode) {
      try {
        const r = await fetch(`${BASE}/api/attendance/scan`, {
          method: 'POST',
          headers: roleHeader(),
          body: JSON.stringify({ identifierCode }),
        });
        return await r.json();
      } catch (e) {
        console.warn('[E-SecureBridge] scanAttendance failed:', e.message);
        return { error: e.message };
      }
    },
  };

  // ── Internal: map Replit incident type strings to backend categories ──────
  function _mapIncidentCategory(type) {
    const m = {
      'Medical assistance': 'MEDICAL',
      'Access control': 'SECURITY_BREACH',
      'Safety concern': 'HAZARD',
      'Missing person': 'MISSING_PERSON',
      'Fire / evacuation': 'FIRE_EVACUATION',
      'Welfare check': 'WELFARE',
      'Other': 'OTHER',
    };
    return m[type] ?? 'OTHER';
  }

  // ── Bootstrap: Load live backend data and patch into DOM ─────────────────
  // This uses a MutationObserver to wait for React root to mount, then
  // enriches the Replit UI with real backend data via console signals.
  const _boot = async () => {
    console.log('[E-SecureBridge] Booting E-Secure API Bridge v2.1...');

    // Load hotlines
    const hotlines = await window.E-SecureAPI.getHotlines();
    if (hotlines.length) {
      console.log(`[E-SecureBridge] ${hotlines.length} emergency hotlines loaded from backend.`);
      // Dispatch custom event so React app can optionally listen
      window.dispatchEvent(new CustomEvent('E-Secure:hotlines', { detail: hotlines }));
    }

    // Load cadet mesh
    const mesh = await window.E-SecureAPI.getCadetMesh();
    if (mesh.length) {
      console.log(`[E-SecureBridge] Cadet mesh: ${mesh.length} units loaded from backend.`);
      window.dispatchEvent(new CustomEvent('E-Secure:mesh', { detail: mesh }));
    }

    // Load reports
    const reports = await window.E-SecureAPI.getReports();
    if (reports.length) {
      console.log(`[E-SecureBridge] ${reports.length} incident reports loaded from backend.`);
      window.dispatchEvent(new CustomEvent('E-Secure:reports', { detail: reports }));
    }

    console.log('[E-SecureBridge] Ready. Call window.E-SecureAPI.* to interact with the live backend.');
    console.log('[E-SecureBridge] Backend endpoints:', {
      hotlines: `${BASE}/api/hotlines`,
      mesh: `${BASE}/api/cadet-mesh`,
      reports: `${BASE}/api/reports/admin`,
      submit: `${BASE}/api/reports/incident`,
      escalate: `${BASE}/api/reports/:id/escalate-gov`,
      attendance: `${BASE}/api/attendance`,
    });
  };

  // Run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _boot);
  } else {
    setTimeout(_boot, 500); // React hydration buffer
  }

})();
