# 🛡️ E-Secure 1.0

> **Criminology Campus Multi-Event Security · Cadet Tactical Mesh · 5 W's Incident Reporting · Rescue Operative Balancing**  
> **Live Production on Vercel:** [https://E-Secure-security-suite-nu.vercel.app/](https://E-Secure-security-suite-nu.vercel.app/)  
> **Replit React Console:** [https://E-Secure-security-suite-nu.vercel.app/replit](https://E-Secure-security-suite-nu.vercel.app/replit)  

─────── Created: 2026-09-17 | Production Target: Vercel Serverless + Google Cloud SQL | Status: Operational ───────

---

## 🏛️ Why "E-Secure 1.0"?

In classical Greek mythology, the **E-Secure** (*αἰγίς*) was the legendary shield and mantle forged by Hephaestus, carried by **Athena**, goddess of tactical wisdom and strategic justice, and **Zeus**, protector of civilization. 

Unlike weapons of aggression, the E-Secure is the ultimate symbol of **impenetrable sanctuary, ethical vigilance, and proactive defense**.

### The Criminology & Public Safety Doctrine

In law enforcement, criminology, and campus security, the name **E-Secure** embodies our foundational mission:

1. **Defense Over Aggression (Sanctuary)**:  
   Security is not merely enforcement; it is creating a safe, trustworthy perimeter where students, faculty, and civilians are shielded from harm and fear.
2. **Athena's Tactical Wisdom (5 W's Intelligence)**:  
   In chaotic emergencies, emotional panic leads to errors. E-Secure enforces structured 5 W's intelligence (**Where, What, Who, When, Why/How**), transforming ambiguous reports into decisive, factual dispatch dossiers.
3. **The Unbroken Shield (Cadet Tactical Mesh)**:  
   A shield is only as strong as its interlocked parts. The Cadet Mesh binds student officers, sector radios, and patrol squads into a synchronized grid that functions even in zero-internet offline conditions.
4. **Duty of Care (Rescue Operative Balancing)**:  
   Every quadrant on campus deserves equal protection. Through mathematical squad balancing, E-Secure guarantees no numbered squad enters the field without certified, high-strength rescue personnel.
5. **Guardian of Civil Liberties (Privacy-Preserving Reporting)**:  
   True security protects personal dignity. E-Secure provides anonymous reporting with non-reversible reference codes (`REF-XXXXXX`), allowing civilians to speak up without fear of retaliation.

---

## 🚀 Dual Console Architecture

E-Secure provides two distinct, interoperable operations consoles:

| Console | Production URL | Technology | Focus |
| :--- | :--- | :--- | :--- |
| **Tactical Command Matrix** | [`/`](https://E-Secure-security-suite-nu.vercel.app/) | Vanilla JS (Zero-Dep), Quixotic/Insightlancer UI | Sub-millisecond latency, zero-runtime overhead, high-contrast operational readiness. |
| **Replit React Suite** | [`/replit`](https://E-Secure-security-suite-nu.vercel.app/replit) | React 18, Vite, TailwindCSS, Radix UI | Modern component hierarchy, modular panels, rich animations. |

*Both consoles are wired to the same unified REST API via [`public/E-Secure-api-bridge.js`](public/E-Secure-api-bridge.js).*

---

## ⚡ Core Operational Capabilities

### 1. 5 W's Multi-Use Incident Reporting Engine
- **Structured Fields**: Mandatory `WHERE` (landmark/room), `WHAT` (nature/category), `WHO` (identity or explicit "Unknown" flag), `WHEN` (timestamp), and `WHY/HOW` (hazards).
- **Anti-Spam Live Camera Proof**: Requires a live camera capture taken within 120 seconds or an explicit, verified override reason.
- **Government Bureau Escalation**: 1-click generation of formatted dispatch dossiers for **BFP (160)**, **PNP (117)**, **Red Cross (143)**, and **CDRRMO**.

### 2. Cadet Tactical Mesh & Numbered Squads
- **Squad Rosters**: Unit 1 (Alpha Rescue), Unit 2 (Bravo Extrication), Unit 3 (Charlie Comms).
- **Rescue Readiness Engine**: Calculates physical ratings and rescue certifications to detect under-strength squads.
- **Auto-Balancer**: Mathematically redistributes certified rescue operatives so every active squad is capable.

### 3. Emergency Hotline Directory
- Instant 1-tap fast-dial pills for National 911, BFP, Red Cross, PNP, Campus Tactical Desk, and Medical Clinic.

### 4. Privacy-Preserving Attendance Kiosk
- High-speed QR badge check-in with latency tracking.
- Strict **403 Admin Guard** protecting student and cadet compliance rosters.

---

## 🛠️ Local Development & Quick Start

```bash
# Clone repository
git clone <repo-url>
cd "security 1"

# Start native Node server (Zero npm dependencies required)
node server.js
# → http://localhost:3000/       (Tactical Command Matrix)
# → http://localhost:3000/replit (Replit React UI)

# Run automated test suite (Node 20+ native runner)
npm test
```

---

## 🌐 Cloud Deployment (Vercel CLI)

The project is pre-configured with [`vercel.json`](vercel.json) and [`api/index.js`](api/index.js) for serverless deployment:

```bash
# Deploy to Vercel production
vercel --prod --yes --scope <your-vercel-team>
```

---

## 🧪 Automated Verification Suite

All 9 native test suites pass with zero dependencies:

```bash
✔ Reference Code Generator conforms to POD-AI Concern pattern (2.2ms)
✔ Unit Rescue Readiness: flags units lacking qualified rescue personnel (0.7ms)
✔ Auto-Balancer: distributes strong rescue operatives so all units are capable (0.7ms)
✔ Student Compliance Tracker: progresses through AM/PM shifts to COMPLIANT status (0.6ms)
✔ Student Compliance Tracker: supports partial events with customized mandatory shifts (0.3ms)
✔ 5 W's Validator: accepts report with unknown WHO when whoUnknown=true, rejects missing WHERE/WHAT/WHY (0.8ms)
✔ Gov Dossier Generator: formats all 5 W's into dispatch-ready text with correct dossier code (0.6ms)
✔ Attendance Access Guard: permits ADMIN only, denies all other roles (0.4ms)
✔ Cadet Mesh: getCadetContactRoster groups members by unit with phone, radio, and duty station (1.0ms)
ℹ tests 9 | pass 9 | fail 0
```

---

## 🤝 Cross-AI Interoperability & Handoff Guide

- **RovoDev CLI**: `rovodev run "Audit E-Secure API endpoints against http://localhost:3000/api/health"`
- **Trae / Cursor / VS Code**: Open root directory; run `node server.js` for backend, edit `public/` for static assets, or `api/` for serverless functions.
