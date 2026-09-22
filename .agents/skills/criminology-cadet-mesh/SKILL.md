---
name: criminology-cadet-mesh
description: Specialized tactical protocol for criminology students and officers managing zero-internet emergency mesh dispatch, civilian reporting, attendance verification, and what-if incident lifecycles without repetitive work.
---

# Criminology Cadet Mesh Skill

## Mission & Purpose
This skill governs operational requirements, architecture, and code conventions for **offline community emergency reporting, security gate attendance, and field officer coordination**.

## Core Non-Negotiable Rules
1. **Zero Raw Biometrics**: Never store raw face photos or video feeds. Only salted cryptographic hashes or client-computed mathematical vectors are allowed in schemas.
2. **Zero Internet Dependency**: All communication and dispatch tools must run client-side on standard smartphones via offline P2P (Bluetooth Low Energy, Wi-Fi Direct, or offline Local Hotspot Web App).
3. **Deterministic What-If Lifecycle**:
   - Every incident begins as `UNASSIGNED`.
   - Any officer claiming moves it to `RESPONDING` (assigning their specific call-sign).
   - If overwhelmed, officer triggers `BACKUP_REQUESTED` (flashes priority banner to all screens).
   - Once resolved, officer triggers `RESOLVED` (stamping resolution time and archiving).
4. **Friendly, Stress-Tested UI**:
   - Minimum 2-tap civilian reporting (Where + What).
   - Big touch targets for one-handed operation.
   - High contrast, dark mode, no visual icon clutter.
5. **Privacy-by-Design**:
   - Never expose officer, cadet, or student accounts or phone numbers to unauthorized or public users.
   - Anonymize all civilian incident reports unless caller voluntarily shares identity.
