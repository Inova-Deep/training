# Phase 1 — Terminology & Demo Data

## Goal

Every label, tooltip, subtitle, notification, and sample datum should sound like a Deep Manufacturing additive manufacturing operation — not a generic LMS or broad-industry training tool.

## Punch list alignment

- Section 1: Global terminology changes, AM-specific terms
- Section 14: Demo data rewrite recommendations

## Prerequisites

- Phase 0 complete (expanded types, reference lists, competency catalogue)

## Tasks

### 1.1 Sidebar labels and tooltips

**Files:** `src/components/layout/AppSidebar.vue`

**What to do:** Update navigation item titles, group names, and tooltip descriptions.

**Details:**

| Current | Change to |
|---------|-----------|
| "My Competencies" | "My Competence Profile" |
| Tooltip: "Your personal competence profile…" | "Your readiness profile — role requirements, assessed competencies, gaps, evidence, and authorisation status" |
| Tooltip: "Org-wide skills matrix…" | "Organisational competence matrix — required vs. assessed vs. gap, filtered by department, role, and risk" |
| "Build & Control" group | "Competence Framework" |
| "Training Needs" | "Training & Gap Actions" |
| Tooltip for Training Needs | "Track gap-closure actions by source — NCR, audit, expiry, procedure change — and verify effectiveness" |
| "Awareness Topics" | "Awareness & Communications" |
| Tooltip for Awareness | "Controlled awareness communications — procedure revisions, safety briefings, quality alerts — with acknowledgement tracking" |

All other items remain unchanged.

---

### 1.2 Header and notifications

**Files:** `src/components/layout/AppHeader.vue`

**What to do:** Replace hardcoded notification items with AM-specific examples. Add a third notification.

**Details:**

| Current | Change to |
|---------|-----------|
| "Training assigned" (2h ago) | "Welding qualification renewal scheduled — due 15 Apr" (2h ago) |
| "Certificate expiring" (1d ago) | "Robot cell operation authorisation expiring in 12 days — Karwan Ali" (1d ago) |
| (add new) | "Additive Manufacturing Process Control Briefing — awaiting your acknowledgement" (3h ago) |

---

### 1.3 Persona names and linked titles

**Files:** `src/stores/auth.ts`

**What to do:** Update demo persona names and linked job titles to reflect DML/AM context.

**Details:**

| Key | Current name | New name | Job title |
|-----|-------------|----------|-----------|
| employee | Alex Morgan | Karwan Ali | Welding / Fabrication Technician |
| manager | Sarah Ahmed | Shwan Hassan | Production Supervisor |
| hr_admin | Demo Admin | Hemish Patel | HR / Training Coordinator |

Update `linkedJobTitle` values to match the new role requirement sets from Phase 0.

---

### 1.4 Rewrite awareness topics data

**Files:** `src/data/awarenessTopics.json`

**What to do:** Replace all 5 items with AM-specific controlled communications.

**Details:**

**Important:** The existing `awarenessTopics.json` has a flat structure that does not match the extended `AwarenessTopic` TypeScript interface (11 new fields added in Phase 0). This task must fully restructure the JSON to match — not just replace the text content but also add all new fields (`topicType`, `deliveryMethod`, `trigger`, `relatedDocumentRef`, `effectiveDate`, `workflowStatus`, `acknowledgementRequired`, `briefingRequired`, `verificationRequired`, `requiredAudience`). If the JSON fields don't match the type, the Phase 7 UI will render undefined values.

| Title | Type | Category | Audience | Status |
|-------|------|----------|----------|--------|
| Revised Competence, Training & Awareness Procedure v3.1 | PROCEDURE_REVISION | Quality & Compliance | All Employees | Active |
| Welding Procedure Revision Briefing — WPS-2026-04 | PROCEDURE_REVISION | Welding & Fabrication | Welding Technicians | Active |
| Robot Cell Safety and Operation Briefing | SAFETY_BRIEFING | Robotics & Automation | Robotics Operators, Production | Active |
| Materials Testing Method Update — Tensile Test ISO 6892 | MANAGEMENT_SYSTEM_UPDATE | Materials Testing & Inspection | Materials Testing, QA | Scheduled |
| Customer Quality Requirement Alert — Batch Traceability | CUSTOMER_REQUIREMENT | Quality & Compliance | QA Inspectors, Production | Active |
| Updated NCR Escalation Process | PROCEDURE_REVISION | Quality & Compliance | Supervisors, QA | Completed |
| New AM Cell Start-up Safety Communication | NEW_EQUIPMENT_INTRO | Additive Manufacturing Operations | AM Technicians, HSE | Scheduled |

Expand from 5 to 7 items. Include new fields: `topicType`, `deliveryMethod`, `trigger`, `relatedDocumentRef`, `workflowStatus` (matching types from Phase 0).

---

### 1.5 Rewrite training need templates

**Files:** `src/data/trainingNeedTemplates.json`

**What to do:** Expand from 7 to ~10 templates. Every template must have a `sourceType` and `sourceReference`. Use AM-specific examples.

**Details:**

**Coverage requirement:** All 9 `TrainingNeedSource` values must be represented in these templates. Phase 5 task 5.7 verifies this, but the templates must be correct here. Check after writing:

| Source type | Template(s) covering it |
|------------|------------------------|
| COMPETENCE_GAP | (add one if none present) |
| NCR_CAPA | FLT — NCR-2026-047 |
| AUDIT_FINDING | RCA — AF-2026-003 |
| PROCEDURE_CHANGE | POWDER — CTA-PRO-004 |
| NEW_EQUIPMENT | ROBOT-OP — EC-2026-001 |
| NEW_STARTER | HSE-IND |
| EXPIRY_RENEWAL | LOTO, FA, WELD |
| MANAGER_REQUEST | PTW |
| INCIDENT_NEAR_MISS | ABR — IR-2026-012 |

| Competency | Source type | Source reference | Description | Due |
|-----------|-----------|-----------------|-------------|-----|
| LOTO | EXPIRY_RENEWAL | — | LOTO certification renewal overdue | -5d |
| FA (First Aid) | EXPIRY_RENEWAL | — | First Aid certificate expiring | +12d |
| FLT (Forklift) | NCR_CAPA | NCR-2026-047 | Forklift near-miss — competence gap identified in root cause | +14d |
| ABR (Abrasive Tools) | INCIDENT_NEAR_MISS | IR-2026-012 | Abrasive wheel breakage incident — operator retraining | +7d |
| RCA (Root Cause Analysis) | AUDIT_FINDING | AF-2026-003 | Internal audit finding — RCA capability gap | +30d |
| WELD | EXPIRY_RENEWAL | — | Coded welder qualification renewal due | +21d |
| ROBOT-OP | NEW_EQUIPMENT | EC-2026-001 | New robot cell installation — operator qualification required | +30d |
| POWDER | PROCEDURE_CHANGE | CTA-PRO-004 v2.0 | Material handling procedure revised — retraining required | +21d |
| HSE-IND | NEW_STARTER | — | New starter site HSE induction | +5d |
| PTW | MANAGER_REQUEST | — | Manager-requested PTW refresher following near-miss | +14d |

---

### 1.6 Rewrite dashboard activity

**Files:** `src/data/dashboardActivity.json`

**What to do:** Replace all 4 items with AM-specific activity messages. Expand to 6 items.

**Details:**

| Type | Message |
|------|---------|
| evidence_uploaded | Welding qualification record uploaded for Karwan Ali (Welding Technician) |
| evidence_accepted | Robot cell operation evidence accepted by QHSE Coordinator |
| assessment_pass | Abrasive Wheels practical assessment passed — Ahmad Rashid |
| ncr_linked | Training need created from NCR-2026-047: Forklift near-miss root cause |
| awareness_issued | Welding Procedure Revision Briefing issued to 8 employees |
| requirements_published | Role requirements v1 published for Additive Manufacturing Technician |

---

### 1.7 View subtitles and section titles

**Files:** All views in `src/views/`

**What to do:** Pass through every `page-subtitle`, empty-state message, and section heading. Replace any generic or LMS-sounding language with competence/readiness/AM language.

**Details:**

| File | Element | Current (approx) | Change to |
|------|---------|------------------|-----------|
| DashboardView | page-subtitle | "Organisation view of competence compliance, gating risks, and upcoming expiries" | "Operational readiness — competence gaps, authorisation status, expiring certifications, and outstanding actions" |
| TrainingNeedsView | page-subtitle | (implied generic) | "Gap-closure actions — tracked by source, assigned with due dates, closed with evidence" |
| AwarenessTopicsView (employee) | page-subtitle | "Topics assigned to you that require acknowledgement" | "Awareness communications assigned to you — procedure changes, safety briefings, quality alerts" |
| AwarenessTopicsView (admin) | page-subtitle | "Create and target awareness topics to employees" | "Controlled awareness communications — issue, track delivery, verify acknowledgement" |
| CompetencyLibraryView | page-subtitle | (implied generic) | "Controlled library of competence requirements — skills, certifications, qualifications, and procedure awareness" |
| RolesView | page-subtitle | (implied generic) | "Job title competence profiles — applicability decisions, requirements, and team readiness" |
| PeopleView | page-subtitle | (implied generic) | "Employee directory — competence status, authorisation, gaps, and expiring certifications" |

---

## Acceptance criteria

- [ ] All sidebar item titles and tooltips updated — no LMS language remains
- [ ] Header notifications use AM-specific examples (welding, robot, AM process)
- [ ] Persona names and linked job titles updated
- [ ] `awarenessTopics.json` has 7 AM-specific items with new type fields
- [ ] `trainingNeedTemplates.json` has 10 items, all with `sourceType` and AM-relevant descriptions
- [ ] `dashboardActivity.json` has 6 AM-specific activity items
- [ ] All view subtitles reviewed and updated
- [ ] The app builds and runs without errors

## Files modified

- `src/components/layout/AppSidebar.vue`
- `src/components/layout/AppHeader.vue`
- `src/stores/auth.ts`
- `src/data/awarenessTopics.json`
- `src/data/trainingNeedTemplates.json`
- `src/data/dashboardActivity.json`
- `src/views/DashboardView.vue`
- `src/views/TrainingNeedsView.vue`
- `src/views/AwarenessTopicsView.vue`
- `src/views/CompetencyLibraryView.vue`
- `src/views/RolesView.vue`
- `src/views/PeopleView.vue`

## Files created

None.

## Demo story

"Look at the language — this is competence management for an additive manufacturing operation, not a generic LMS. The competencies are welding qualification, robot cell operation, materials testing, powder handling. The awareness topics are procedure revisions and equipment safety briefings. The training needs trace back to NCRs, audit findings, and new equipment installations."
