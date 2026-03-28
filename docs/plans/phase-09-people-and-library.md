# Phase 9 — People & Competency Library

## Goal

Make the People page operationally useful for managers, HR, and QHSE with readiness columns and a person detail drawer. Upgrade the Competency Library into a controlled catalogue with AM-specific fields and filters.

## Punch list alignment

- Section 5: People — columns, person detail drawer, status ideas, actions, demo polish
- Section 8: Competency Library — fields, competency types, filters, demo data

## Prerequisites

- Phase 0 complete (expanded types, competency catalogue)
- Phase 2 complete (supervised work status, supervisionStatus on EmployeeMatrixRow)

## Tasks

### 9.1 Add readiness columns to People table

**Files:** `src/views/PeopleView.vue`

**What to do:** Add operational readiness columns by cross-referencing each employee against the skills matrix store.

**Details:**

Current columns: Name, Department, Business Unit, Job Title, Manager, Status, Actions

New columns to add after existing ones:

| Column | Content | Source |
|--------|---------|--------|
| Work Status | Badge: Independent / Supervised / Restricted | `matrixRow.supervisionStatus` |
| Open Gaps | Count of REQUIRED + EXPIRED items | `matrixRow.requiredCount + matrixRow.expiredCount` |
| Mandatory Compliance | Badge: Compliant (green) / Non-Compliant (red) | `matrixRow.isAuthorised` |
| Expiring Certs | Count of EXPIRING items | `matrixRow.expiringCount` |
| Overdue | Count of training needs past due date | trainingNeeds store filtered by employee |

If no matrix row exists for an employee (job title not in roleRequirements), show "—" in all readiness columns.

---

### 9.2 Build person detail drawer

**Files:** `src/views/PeopleView.vue`, new `src/components/people/PersonDetailDrawer.vue`

**What to do:** When clicking a person row or "View" action, open a drawer/sheet showing the full readiness profile for that person.

**Details:**

Drawer sections:

**1. Person Header**
- Name, job title, department, business unit
- Work status badge (Independent / Supervised / Restricted)
- Line manager name

**2. Role Requirements vs Current Assessments**
- Table of competency items for this person's role
- Columns: Competency, Required, Current Status (StatusChip), Gap, Last Assessed, Next Due

**3. Open Gaps**
- Filtered to items where status is REQUIRED, EXPIRED, UNDER_SUPERVISION, or EXPIRING
- Show severity badge (Critical / High / Moderate / Low)

**4. Evidence & Attachments**
- If employee evidence data exists (from Phase 4's `employeeEvidence.json`), show relevant records
- Columns: Evidence type, Competency, Issuer, Issue date, Expiry, Status

**5. Assessment History**
- Mock data: last 3-5 assessment events for this person
- Columns: Date, Competency, Method, Outcome, Assessor

**6. Awareness Acknowledgements**
- Topics assigned to this person (by job title match)
- Show acknowledged vs pending

**7. Training Actions in Progress**
- Training needs assigned to this person from trainingNeeds store
- Show: title, source, status, intervention type

**8. Restrictions / Limitations**
- If supervisionStatus is SUPERVISED or RESTRICTED, show a prominent banner
- List specific gating items that are not met

---

### 9.3 Add action buttons to People view

**Files:** `src/views/PeopleView.vue`, `src/components/people/PersonDetailDrawer.vue`

**What to do:** Add actionable buttons for manager/HR personas.

**Details:**

| Button | Location | Behaviour |
|--------|----------|-----------|
| Start Reassessment | Person detail drawer, per competency row | Toast: "Reassessment initiated for [competency]" |
| Assign Intervention | Person detail drawer, gaps section | Toast: "Training need created for [competency]" |
| Record Evidence | Person detail drawer, evidence section | Toast: "Evidence upload submitted for review" |
| Change Supervision Status | Person detail drawer, header | Toast: "Supervision status updated to [new status]" |
| View Linked Training Needs | Person detail drawer | Scrolls to training actions section |
| View Linked Awareness Topics | Person detail drawer | Scrolls to awareness section |

---

### 9.4 Enhance Competency Library fields

**Files:** `src/views/CompetencyLibraryView.vue`, `src/stores/competencyLibrary.ts`, `src/data/competencies.json`

**What to do:** Expand competency records with additional fields from punch list section 8.

**Details:**

New fields per competency item:

| Field | Type | Example |
|-------|------|---------|
| type | string | SKILL, TRAINING, CERTIFICATION, AWARENESS_TOPIC, OJT_COACHING, PROCEDURE_BRIEFING, EXTERNAL_QUALIFICATION, EQUIPMENT_VENDOR_QUALIFICATION |
| description | string | "Ability to safely operate and program the robot cell..." |
| applicableDepartments | string[] | ["Additive Manufacturing", "Welding & Fabrication"] |
| applicableRoles | string[] | ["AM Technician", "Robotics Operator"] |
| mandatory | boolean | true |
| safetyCritical | boolean | true |
| qualityCritical | boolean | false |
| assessmentMethod | string | "Practical observation", "Written assessment", "External exam" |
| evidenceType | string | "Certificate", "Sign-off", "Observation record" |
| validityInterval | string | "12 months", "24 months", "No expiry" |
| internalExternal | string | "Internal" / "External" |
| provider | string | "TWI Certification", "Internal HSE Team" |
| linkedDocument | string | "CTA-PRO-004", "BS EN ISO 9606-1" |

Update `CompetencyLibraryItem` type in `src/types/index.ts` (or extend in store) to include these fields.

---

### 9.5 Expand Competency Library table

**Files:** `src/views/CompetencyLibraryView.vue`

**What to do:** Update the table to show the new fields.

**Details:**

Current columns: Code, Title, Category, Risk Level, Actions

New columns:

| Column | Content |
|--------|---------|
| Code | Competency code |
| Title | Competency title |
| Type | Type badge (SKILL, CERTIFICATION, etc.) |
| Category | Category badge (AM categories) |
| Mandatory | Flag badge |
| Safety-Critical | Flag badge |
| Assessment Method | Text |
| Validity | Interval text |
| Applicable Depts | Dept tags (truncated if many) |
| Actions | View, Edit |

---

### 9.6 Add filters to Competency Library

**Files:** `src/views/CompetencyLibraryView.vue`

**What to do:** Replace the single category filter with a richer filter bar.

**Details:**

Filters:
- Type (All / Skill / Training / Certification / Awareness Topic / OJT / Procedure Briefing / External Qualification / Equipment Qualification)
- Category (All / Mandatory / AM Operations / Welding & Fabrication / Robotics & Automation / Materials & Powder Handling / Materials Testing & Inspection / Quality & Compliance / HSE / Equipment-Specific)
- Mandatory only (switch toggle)
- Safety-critical only (switch toggle)
- Department applicability (select, filters to competencies where applicableDepartments includes selected)

---

### 9.7 Update competency form sheet

**Files:** `src/components/competency/CompetencyFormSheet.vue`

**What to do:** Update the create/edit form to include the new fields.

**Details:**

Add form fields for:
- Type (select from 8 competency types)
- Description (textarea)
- Applicable departments (multi-select)
- Applicable roles (multi-select)
- Mandatory (switch)
- Safety-critical (switch)
- Quality-critical (switch)
- Assessment method (select)
- Evidence type (select)
- Validity interval (select: 6 months / 12 months / 24 months / 36 months / No expiry)
- Internal/External (radio)
- Provider/Owner (text input)
- Linked document (text input)

---

### 9.8 Add high-risk and specialist demo employee examples

**Files:** `src/stores/employees.ts` or mock data layer

**What to do:** Ensure the employee dataset includes two specific demo profiles for storytelling.

**Details:**

**High-risk profile (for "this person should be restricted" demo story):**
- Name: Dara Karim
- Job title: Additive Manufacturing Technician
- Department: Additive Manufacturing
- Status: NON_COMPLIANT_MANDATORY (multiple expired safety-critical competencies)
- Key gaps: LOTO expired, AM-SETUP expired, HSE-IND expired
- Narrative: "Dara has not renewed his mandatory safety certifications — he cannot work on the AM cell until LOTO and HSE induction are renewed."

**Specialist profile (for "niche role support" demo story):**
- Name: Sarvin Nawroz
- Job title: Materials Testing Technician
- Department: Quality Assurance / Materials Testing
- Status: FIT_FOR_INDEPENDENT_WORK
- Key competencies: MAT-TEST (Valid), MAT-TRACE (Valid), TOOLS (Valid), internal audit trained
- Narrative: "Sarvin holds all required materials testing competencies including tensile test awareness and inspection methods."

If the employee data is fetched from the real API, add these as injected mock rows in the store if their names are not present — do not modify the API.

---

### 9.9 Ensure AM-specific demo data in library

**Files:** `src/data/competencies.json`

**What to do:** Verify the competency catalogue contains AM-specific items with the new fields populated.

**Details:**

Ensure items like these are present with full field data (many added in Phase 0):
- Coded Welder Qualification (CERTIFICATION, External, TWI, 24 months validity)
- Robot Cell Operation (SKILL, Internal, 12 months)
- Robot Programming Basics (TRAINING, Internal, No expiry)
- Additive Manufacturing Machine Setup (SKILL, Internal, 12 months)
- Materials / Powder Handling Controls (TRAINING, Internal, 12 months)
- Materials Traceability (AWARENESS_TOPIC, Internal, No expiry)
- Materials Testing Method Awareness (TRAINING, Internal, 12 months)
- Root Cause Analysis (TRAINING, Internal, No expiry)
- CAPA (TRAINING, Internal, No expiry)
- Internal Audit (EXTERNAL_QUALIFICATION, External, 36 months)

---

## Acceptance criteria

- [ ] People table shows Work Status, Open Gaps, Mandatory Compliance, Expiring Certs, and Overdue columns
- [ ] Clicking a person row opens the detail drawer
- [ ] Person detail drawer shows all 8 sections with correct data
- [ ] Action buttons in drawer show appropriate toasts
- [ ] Competency Library table shows expanded columns (type, mandatory, safety-critical, validity, depts)
- [ ] Competency Library filters work for type, category, mandatory, safety-critical, and department
- [ ] Competency form sheet includes all new fields
- [ ] Library contains AM-specific items with all fields populated
- [ ] The app builds and runs without errors

## Files modified

- `src/views/PeopleView.vue`
- `src/views/CompetencyLibraryView.vue`
- `src/stores/competencyLibrary.ts`
- `src/components/competency/CompetencyFormSheet.vue`
- `src/data/competencies.json`
- `src/types/index.ts` (CompetencyLibraryItem type expansion)

## Files created

- `src/components/people/PersonDetailDrawer.vue`

## Demo story

"Click any person to see their full readiness profile. Here's Karwan — he's a Welding Technician, currently Under Supervision. The drawer shows his role requirements versus current assessments. He has 2 open gaps: coded welder qualification is expiring and robot programming basics is required. His evidence tab shows his certificates and observation records. The competency library is a controlled catalogue — filter by type to see all certifications, by category to see Welding & Fabrication items, or toggle safety-critical to see just the items that matter most. Each item has a linked procedure, validity interval, and assessment method defined."
