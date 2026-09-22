---
name: zero-trust-privacy-guard
description: Use when implementing, auditing, or refactoring authentication, access control, and privacy protections in web applications. Ensures user accounts, passwords, admin clearances, and student/cadet PII are never leaked on public interfaces or unprotected APIs.
---

# Zero-Trust Privacy Guard Skill

## Mission
Protect user privacy, prevent credential leakage, and enforce zero-trust role-based access control across all frontend interfaces and API endpoints.

## Core Directives

### 1. Zero Account / PII Exposure on Public Surfaces
- **No Client State Pre-Authentication**: Never initialize client application state with pre-populated user accounts, admin names, or default clearance.
- **Anonymize Public Telemetry**:
  - Checkpoint cards visible to guests must display sector names, tactical unit callsigns, and progress percentage.
  - Never display individual student names, cadet marshal names, phone numbers, or badge IDs to unauthenticated public visitors.
- **Empty Credential Inputs**: Authentication forms must never pre-fill default passwords or emails (`value="password123"` is strictly prohibited).

### 2. Cryptographic Session Token Architecture
- **Token Generation**:
  ```javascript
  const token = 'E-Secure_sec_' + crypto.randomBytes(24).toString('hex');
  ```
- **Session Metadata**:
  - User ID, sanitized display name, role (`ADMIN`, `CADET`, `SCENE_REP`), assigned duty post.
  - Expiration timestamp (e.g. 12 hours).
- **Transport**: Transmit via `Authorization: Bearer <token>` or `x-session-token` headers.
- **Client Storage**: Store in `sessionStorage` (not `localStorage`) so clearance clears when the browser tab closes.

### 3. API Defense & Route Sanitization
- **Strict Guard Checks**:
  - Routes exposing sensitive personnel rosters (e.g. `/api/members`, `/api/cadet-mesh`) must check `getSessionFromRequest(req)`.
  - Reject unauthenticated calls with `401 Unauthorized` (`{ error: "UNAUTHORIZED: Authentication required." }`).
- **Data Sanitization**:
  - Non-administrators (e.g. Cadets, Scene Reps) must receive sanitized rosters:
    - Omit personal phone numbers.
    - Omit full student registration numbers.
    - Expose only callsigns, duty stations, and active duty statuses.
- **Admin Clearance Verification**:
  - Approvals (`/api/admin/registrations`) and full incident logs (`/api/reports/admin`) must verify `session.user.role === 'ADMIN'`. Reject non-admins with `403 Forbidden`.

### 4. Anti-Rationalization Checklist
- ❌ *"It's just a demo, so hardcoding an admin account is fine."* → **Violation**. Implement local ephemeral sessions instead.
- ❌ *"Showing student phone numbers on the public map helps in emergencies."* → **Violation**. Route alerts through dispatch hotlines; never doxx students.
- ❌ *"Hiding the link in the UI is sufficient security."* → **Violation**. Always enforce verification on backend API handlers.
