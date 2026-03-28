# Phase 4 — My Competencies → Readiness Profile

## Goal

Transform from a single-table status view into a structured employee readiness profile with sections for requirements, gaps, evidence, authorisations, and awareness actions.

## Punch list alignment

- Section 3: My Competencies — all sub-sections

## Prerequisites

- Phase 2 complete (supervised work status, three-state IWA badge)

## Tasks

### 4.1 Add tab/section structure

**Files:** `src/views/MyCompetenciesView.vue`

**What to do:** Replace the single requirements table with a tabbed layout. Keep the overview strip at the top (profile + IWA badge + stats row + alert banner).

**Details:**

| Tab | Content |
|-----|---------|
| My Role Requirements | Current requirements table, enhanced with new statuses (existing table, improved) |
| My Open Gaps | Filtered view: only REQUIRED / EXPIRED / UNDER_SUPERVISION items with recommended action and severity |
| My Evidence | List of evidence records linked to this employee |
| My Authorisations | Gating items only, with clear PASS/FAIL per item and IWA summary |
| My Awareness Actions | Awareness topics assigned, with acknowledgement status |

Use the existing `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` components.

---

### 4.2 Enhance the requirements table

**Files:** `src/views/MyCompetenciesView.vue`

**What to do:** Expand column set and status rendering for the My Role Requirements tab.

**Details:**

| Column | Content |
|--------|---------|
| Code | Competency code |
| Requirement | Competency title |
| Category | Category badge (AM categories) |
| Gating | "Gating" badge if isGating |
| Status | StatusChip with full status range including UNDER_SUPERVISION |
| Last Assessed | Date of last completion (from mock data) |
| Next Reassessment | Expiry date or "No Expiry" |
| Action Required | Context-sensitive: "Renew WELD", "Await supervisor sign-off", etc. |
| Responsible | Employee / Line Manager / Assessor |

---

### 4.3 Build the Open Gaps tab

**Files:** `src/views/MyCompetenciesView.vue`

**What to do:** Create a focused view of only items that need action, sorted by severity.

**Details:**

Filter competence items where `derivedStatus` is REQUIRED, EXPIRED, UNDER_SUPERVISION, or EXPIRING.

Table columns:
- Competency (title)
- Gap severity (badge: Critical for gating+expired, High for expired non-gating, Moderate for expiring, Low for required)
- Current status (StatusChip)
- Recommended action (text)
- Due date (if applicable)

---

### 4.4 Build the Evidence tab

**Files:** `src/views/MyCompetenciesView.vue`, new `src/data/employeeEvidence.json`

**What to do:** Create a mock evidence list and display it as a table. Include AM-specific evidence examples.

**Details — mock data:**

| Evidence | Type | Competency | Issuer/Source | Issue date | Expiry | Review status |
|----------|------|-----------|--------------|-----------|--------|--------------|
| Coded Welder Certificate — BS EN ISO 9606-1 | Certificate | WELD | TWI Certification | 2025-04-10 | 2027-04-10 | Accepted |
| Robot Cell Operation Sign-off | Sign-off | ROBOT-OP | Production Supervisor | 2025-09-15 | 2026-09-15 | Accepted |
| LOTO Practical Observation Record | Observation Record | LOTO | HSE Coordinator | 2025-06-01 | 2026-06-01 | Accepted |
| HSE Induction Completion | Sign-off | HSE-IND | HR Coordinator | 2025-03-10 | — | Accepted |
| Abrasive Wheels Certificate | Certificate | ABR | External Provider | 2025-07-20 | 2026-07-20 | Accepted |
| Materials Handling Toolbox Talk | Toolbox Talk Attendance | POWDER | Shift Supervisor | 2026-01-15 | — | Accepted |
| Competence Assessment — Welding Sign-off | Manager Sign-off / Verification | WELD | Line Manager | 2025-04-12 | — | Accepted |

Display as a card-based or table view with type icon, status badge, and view action.

---

### 4.5 Build the Authorisations tab

**Files:** `src/views/MyCompetenciesView.vue`

**What to do:** Show only gating competency items with a clear pass/fail for each, plus the overall IWA status.

**Details:**

Top section: large IWA status card (reuse from overview, but more prominent here).

Table of gating items:
- Competency
- Required
- Current status
- Evidence reference
- Expiry date
- Pass/Fail indicator (checkmark or X)

Summary line: "3 of 5 gating requirements met — Independent Work NOT Authorised"

---

### 4.6 Build the Awareness Actions tab

**Files:** `src/views/MyCompetenciesView.vue`

**What to do:** Embed awareness topics for the current persona. Reuse acknowledge logic from AwarenessTopicsView.

**Details:**

Show awareness topics where the employee is in the target audience (by job title or "All Employees").

Table columns:
- Topic title
- Type badge
- Effective date
- Acknowledgement status (Pending / Acknowledged)
- Action button (Acknowledge)

This is a lightweight version of the employee awareness view, embedded as a tab.

---

### 4.7 Add action buttons

**Files:** `src/views/MyCompetenciesView.vue`

**What to do:** Add actionable buttons for the employee persona.

**Details:**

| Button | Location | Behaviour |
|--------|----------|-----------|
| "Upload Evidence" | Evidence tab header | Open file dropzone mock (toast: "Evidence upload submitted for review") |
| "Request Reassessment" | Per-row action on Role Requirements tab | Toast: "Reassessment request submitted to your supervisor" |
| "View Assessment History" | Per-row action on Role Requirements tab | Open a sheet with mock assessment history (date, method, outcome, assessor) |

---

### 4.8 Add assessment recording component (supervisor action)

**Files:** New `src/components/competency/AssessmentRecordSheet.vue`

**What to do:** Create a sheet that allows a supervisor/manager to record an assessment outcome for a specific person × competency combination. This is what moves someone from UNDER_SUPERVISION → VALID (or records a failure).

**Details:**

Form fields:
- Employee (pre-filled from context)
- Competency (pre-filled from context)
- Assessment date (date picker, default: today)
- Assessment method (select: Practical Observation, Written Assessment, Supervisor Sign-off, Portfolio Review, External Exam)
- Outcome (radio: Competent / Not Yet Competent / Partially Competent)
- Assessor name (pre-filled from current persona — e.g. "Shwan Hassan, Production Supervisor")
- Notes / comments (textarea)
- Evidence reference (text input, optional — e.g. "EV-2026-008")

On save:
- If outcome = Competent → update the competency item's status to VALID, set `supervisionStatus` to progress toward INDEPENDENT
- If outcome = Not Yet Competent → status remains REQUIRED, add recommended action
- If outcome = Partially Competent → status remains UNDER_SUPERVISION
- Show toast: "Assessment recorded — [competency] marked [outcome] for [employee]"

Wire this button in the Supervisor persona view on the Role Requirements tab (shown for UNDER_SUPERVISION items).
Wire this in the Person Detail Drawer (Phase 9) for UNDER_SUPERVISION rows.

This closes the supervised-to-authorised demo loop.

---

## Acceptance criteria

- [ ] 5 tabs render and switch correctly
- [ ] Role Requirements table shows all competencies with expanded columns
- [ ] Open Gaps tab filters correctly and sorts by severity
- [ ] Evidence tab shows ~6 AM-specific mock evidence records
- [ ] Authorisations tab shows only gating items with pass/fail
- [ ] Awareness tab shows assigned topics with acknowledge action
- [ ] "Upload Evidence" and "Request Reassessment" buttons show appropriate toasts
- [ ] AssessmentRecordSheet opens for supervisor persona on UNDER_SUPERVISION items
- [ ] Recording a Competent outcome updates the status to VALID (in-memory) and shows toast
- [ ] Evidence tab includes 7 mock records, including a "Manager Sign-off / Verification" entry
- [ ] View works for all personas (employee shows full profile, supervisor can record assessments)

## Files modified

- `src/views/MyCompetenciesView.vue`

## Files created

- `src/data/employeeEvidence.json`
- `src/components/competency/AssessmentRecordSheet.vue`

## Demo story

"This is Karwan's readiness profile. Overview shows he's Under Supervision — not yet authorised for independent work. The Role Requirements tab lists everything needed for a Welding Technician. Open Gaps tab highlights two critical items: his coded welder qualification is expiring and he hasn't completed robot programming basics yet. Evidence tab shows his uploaded certificates and observation records. Authorisations tab shows 3 of 5 gating items met — he can't work independently until the remaining two are signed off."
