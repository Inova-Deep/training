# Frontend Extraction Report

**Project:** DML Training & Competence Management System
**Date:** 2026-03-27
**Source:** `/Users/rawandhawez/Desktop/INOVA/Hemish/training`
**Stack:** Vue 3.5 + TypeScript + Pinia + Tailwind CSS 4 + shadcn-vue (Reka UI)

---

## 1. Executive Summary

This is a **well-structured Vue 3 frontend** for a manufacturing competence management system, branded "Competence" in the sidebar. It connects to a real backend API at `https://dmlapi.inova.krd/api/v1` for employee/organisation data, while competency definitions, role requirements, training need templates, and awareness topics are served from **local JSON fixtures**.

**What it does well:** The domain model is genuinely competence-oriented, not a generic LMS. It models role-based competency requirements, gating/authorisation logic, expiry tracking, a skills matrix with derived statuses, and a 5-question applicability decision tree. The 15 competencies are all industrial (PTW, LOTO, Confined Space, etc.). Three demo personas (Employee, Manager, HR Admin) show differentiated views.

**Where it still feels like a demo shell:** Most CRUD operations are stubs (create/update/delete don't persist). The skills matrix competence data is **deterministically generated from a seed hash**, not stored. Training needs are generated at runtime from 7 templates. Awareness topics are static JSON. Evidence upload is a visual dropzone with no actual file handling. Several action buttons (e.g. "Create Topic", "Bulk Schedule", "View Profile") are non-functional.

**Biggest risk for a product reviewer:** The data layer is sophisticated enough to *look* real in screenshots, but no domain data persists across page reloads (except employee data from the API). A live demo would reveal the gap quickly.

---

## 2. Route Map

| Path | Route Name | Component | Auth | Persona Access | Purpose |
|------|-----------|-----------|------|---------------|---------|
| `/` | — | redirect → `/dashboard` | — | All | Entry redirect |
| `/dashboard` | `dashboard` | `DashboardView.vue` | Yes | Manager, HR Admin | Org-wide compliance KPIs |
| `/my-competencies` | `my-competencies` | `MyCompetenciesView.vue` | Yes | Employee | Personal competence profile |
| `/skills-matrix` | `skills-matrix` | `SkillsMatrixView.vue` | Yes | Manager, HR Admin | Org-wide required vs. current vs. gap grid |
| `/people` | `people` | `PeopleView.vue` | Yes | Manager, HR Admin | Employee directory from ERP |
| `/roles` | `roles` | `RolesView.vue` | Yes | HR Admin | Job title applicability list |
| `/roles/:id` | `role-detail` | `RoleDetailView.vue` | Yes | HR Admin | Applicability decision + requirements per role |
| `/competency-library` | `competency-library` | `CompetencyLibraryView.vue` | Yes | HR Admin | Master competency catalogue |
| `/training-needs` | `training-needs` | `TrainingNeedsView.vue` | Yes | Employee, Manager, HR Admin | Training action queue |
| `/awareness-topics` | `awareness-topics` | `AwarenessTopicsView.vue` | Yes | Employee, HR Admin | Awareness acknowledgement / management |
| `/admin/reference-lists` | `admin-reference-lists` | `ReferenceListsView.vue` | Yes | HR Admin | Controlled value management |
| `/admin/erp-connection` | `admin-erp-connection` | `ErpConnectionView.vue` | Yes | HR Admin | ERP integration status |
| `/components` | `components` | `ComponentsView.vue` | Yes | (Dev only) | UI component showcase |
| `/guide` | `guide` | `GuideView.vue` | Yes | All | Platform onboarding guide |
| `/sales-pitch` | `sales-pitch` | `GuideView.vue` | Yes | (Sales) | Sales presentation view |

**Notes:**
- No route-level `meta.permission` or `meta.role` guards exist. All routes only check `requiresAuth: true`. Role-based access is enforced exclusively through **sidebar visibility** — a user who knows the URL can navigate to any page.
- No 404/catch-all route.
- `/components` and `/sales-pitch` are demo/internal routes, not intended for production.
- `/sales-pitch` reuses `GuideView.vue` (appears to be an oversight or intentional alias).

---

## 3. Navigation and Personas

### Sidebar structure (`AppSidebar.vue`)

Navigation is built via a **computed property** that returns different menu group arrays per `authStore.userRole`. It is not a static config file — the menu is inline in the component.

| Group | Item | Icon | Route | Employee | Manager | HR Admin |
|-------|------|------|-------|----------|---------|----------|
| My Work | My Competencies | BookOpen | `/my-competencies` | Yes | — | — |
| My Work | Training Needs | ClipboardList | `/training-needs` | Yes | — | — |
| My Work | Awareness Topics | Megaphone | `/awareness-topics` | Yes | — | — |
| Operations | Dashboard | LayoutDashboard | `/dashboard` | — | Yes | Yes |
| Operations | Skills Matrix | Grid3x3 | `/skills-matrix` | — | Yes | Yes |
| Operations | People | Users | `/people` | — | Yes | Yes |
| Build & Control | Roles | Briefcase | `/roles` | — | — | Yes |
| Build & Control | Competency Library | Library | `/competency-library` | — | — | Yes |
| Training & Awareness | Training Needs | ClipboardList | `/training-needs` | — | Yes | Yes |
| Training & Awareness | Awareness Topics | Megaphone | `/awareness-topics` | — | — | Yes |
| Admin | Reference Lists | Settings | `/admin/reference-lists` | — | — | Yes |
| Admin | ERP Connection | Plug | `/admin/erp-connection` | — | — | Yes |

**Footer:** Guide link (all roles) + User profile dropdown.

### Information Architecture Assessment

The IA is organized around **functions/capabilities**, not pure entity types:
- "Operations" = monitoring (dashboard, matrix, people)
- "Build & Control" = configuration (roles, library)
- "Training & Awareness" = action management
- "Admin" = system settings

This is a **reasonable** IA for competence management. It is NOT organized like a typical LMS ("Courses", "Learners", "Certificates").

### Header (`AppHeader.vue`)

- **Demo Persona Switcher:** Three buttons to switch between Employee / Manager / HR Admin. Visible to all users.
- **Sync Status:** "Synced" / "Syncing..." indicator with animation.
- **Notifications:** Static dropdown with 2 hardcoded items: "Training assigned" (2h ago) and "Certificate expiring" (1d ago). Badge count is hardcoded.
- **User Menu:** Avatar, name, role. "Sign out" action resets to HR Admin persona (does not actually sign out).

---

## 4. RBAC / Permission Model

### Roles

| Role | Code | Description |
|------|------|-------------|
| Employee | `EMPLOYEE` | Personal competence view, acknowledgement |
| Manager | `MANAGER` | Operational oversight, team matrix |
| HR Admin | `HR_ADMIN` | Full access, configuration, admin |

### Guards and enforcement

| Layer | Mechanism | Status |
|-------|-----------|--------|
| Route guard | `meta.requiresAuth: true` on all routes | Present but NO role check |
| Route-level role restriction | Not implemented | **Missing** — any authenticated user can hit any URL |
| Sidebar filtering | Computed navigation per `userRole` | Working |
| View-level conditional | `v-if="isEmployee"` in AwarenessTopicsView, `v-if` blocks in MyCompetenciesView | Partial |
| Component-level permission | None found | **Missing** |
| API-level permission | Not visible from frontend | Unknown |
| Feature flags | None found | **Missing** |

### Hardcoded/Inconsistent items

1. **`fetchUserInfo()` always assigns `role: 'HR_ADMIN'`** regardless of what the API returns (line 111 of `auth.ts`). The role is only changed by the persona switcher. Real RBAC from the backend is not consumed.
2. **Logout = switch to HR Admin persona.** It does not clear the token or redirect to login.
3. **No permission granularity** — there are no fine-grained permissions like `canEditCompetency`, `canApproveEvidence`, etc. The system only knows 3 coarse roles.
4. **Employee persona can technically access `/dashboard` by URL** — there is no route guard to prevent it.

---

## 5. Domain Entities Discovered

### 5.1 Employee / Person

**Source:** `types/index.ts` (Employee), `api/client.ts` (Employee API type)
**Data:** Real API data from `/employees` endpoint
**Status:** Fully implemented for read; no create/edit in UI

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | From ERP |
| tenantId | string | Multi-tenant |
| employeeNo | string | ERP employee number |
| firstName, lastName | string | |
| displayName | string | null | |
| workEmail | string | null | |
| status | 'active' \| 'inactive' | |
| isActive | boolean | |
| businessUnit | BusinessUnitSummary | null | Nested object |
| department | DepartmentSummary | null | Nested object |
| jobTitle | JobTitleSummary | null | Nested object with grade |
| manager | ManagerSummary | null | Nested object |
| createdAt, updatedAt | string (ISO) | |

### 5.2 Competency Library Item

**Source:** `types/index.ts`, `data/competencies.json`
**Data:** 15 items in local JSON
**Status:** Fully defined; CRUD stubs exist but don't persist

| Field | Type | Notes |
|-------|------|-------|
| id | string | e.g. `comp-001` |
| code | string | e.g. `PTW`, `LOTO`, `WAH` |
| title | string | e.g. "Permit to Work (PTW)" |
| description | string | Optional |
| category | string | Technical, Quality, Mandatory |
| riskLevelCode | string | LOW, MEDIUM, HIGH_CRITICAL |
| criticalityDomain | string | Optional, e.g. "Safety Critical" |
| defaultTrainingTypeCode | string | CERT_LICENCE, OJT_COACHING, etc. |
| defaultAssessmentMethodCode | string | OBSERVATION, RECORD_REVIEW, etc. |
| defaultValidityDays | number | Optional (365, 730) |
| defaultRequiresExpiry | boolean | |
| archivedAt | string | Optional |

**Competencies in demo data (all 15):**

| Code | Title | Category | Risk | Gating Default | Expiry |
|------|-------|----------|------|----------------|--------|
| PTW | Permit to Work | Technical | HIGH_CRITICAL | Yes | No |
| LOTO | Lockout/Tagout | Technical | HIGH_CRITICAL | Yes | 365d |
| WAH | Working at Height | Technical | HIGH_CRITICAL | Yes | 365d |
| CSE | Confined Space Entry | Technical | HIGH_CRITICAL | Yes | 365d |
| LIFT | Lifting Operations | Technical | HIGH_CRITICAL | Yes | 365d |
| MECH | Basic Mechanical Maintenance | Technical | MEDIUM | No | No |
| TOOLS | Calibrated Measuring Tools | Technical | MEDIUM | No | No |
| DOC | Document Control Awareness | Quality | MEDIUM | No | No |
| NCR | Nonconformance Reporting | Quality | MEDIUM | No | No |
| CAPA | Corrective Action Participation | Quality | MEDIUM | No | No |
| HSE-IND | HSE Induction | Mandatory | MEDIUM | No | No |
| FIRE | Fire Safety / Emergency Response | Mandatory | MEDIUM | No | 365d |
| MH | Manual Handling Awareness | Mandatory | LOW | No | No |
| PPE | PPE Compliance & Hazard Awareness | Mandatory | MEDIUM | No | No |
| FA | First Aid (nominated staff only) | Mandatory | HIGH_CRITICAL | Yes | 730d |

### 5.3 Role Applicability Decision

**Source:** `types/index.ts`, `data/roleApplicability.json`
**Data:** 6 decisions in local JSON
**Status:** Fully modelled with 5-question decision tree in RoleDetailView

| Field | Type | Notes |
|-------|------|-------|
| id | string | |
| erpJobTitleId | string | Links to ERP job title |
| q1HandsOnOperational | boolean | Hands-on work? |
| q2ConformitySignOff | boolean | Approve/certify work? |
| q3ErrorCausesImpact | boolean | Error → safety/quality impact? |
| q4SpecificCompetenceRequired | boolean | Specific competence needed? |
| q5ObjectiveEvidenceRequired | boolean | Objective evidence needed? |
| result | INCLUDED / AWARENESS_ONLY / OUT_OF_SCOPE | Computed |
| notes | string | Justification |
| version | number | |
| createdByUserId, updatedByUserId | string | Audit |

### 5.4 Role Requirement Set + Role Requirement

**Source:** `types/index.ts`, `data/roleRequirements.json`
**Status:** Fully modelled; 6 published sets with 8-12 requirements each

**RoleRequirementSet:**

| Field | Type |
|-------|------|
| id | string |
| erpJobTitleId | string |
| version | number |
| status | DRAFT / PUBLISHED / RETIRED |
| publishedAt | string |
| notes | string |

**RoleRequirement:**

| Field | Type | Notes |
|-------|------|-------|
| id | string | |
| roleRequirementSetId | string | FK to set |
| competencyLibraryItemId | string | FK to competency |
| mandatory | boolean | |
| trainingTypeCode | string | Override from library default |
| assessmentMethodCode | string | Override from library default |
| riskLevelCode | string | Per-role risk override |
| isGating | boolean | **Key concept** — blocks authorisation |
| validityDays | number | Optional |
| requiresExpiry | boolean | |
| sortOrder | number | |

### 5.5 Employee Competence Item (Matrix Cell)

**Source:** `types/index.ts`, `stores/skillsMatrix.ts`
**Data:** Generated at runtime via deterministic seed
**Status:** Type fully defined; data is synthetic

| Field | Type | Notes |
|-------|------|-------|
| id | string | |
| erpEmployeeId | string | |
| competencyLibraryItemId | string | |
| baseStatusCode | N_A / REQUIRED / IN_PROGRESS / VALID | Stored status |
| derivedStatusCode | + EXPIRING / EXPIRED | Computed from base + expiry |
| expiryDate | string | |
| lastCompletedAt | string | |
| validFrom | string | |
| assignedAssessorUserId | string | |
| evidenceRef | string | Generated as `EV-{empNo}-{compCode}` |
| notes | string | |

### 5.6 Evidence Record

**Source:** `types/index.ts`
**Status:** Type defined; **no UI for listing/managing evidence records**; upload dropzone exists in TrainingNeedDetailsSheet but is non-functional

| Field | Type |
|-------|------|
| id | string |
| evidenceTypeCode | CERTIFICATE / RECORD / OBSERVATION_NOTE / SIGNOFF / EXTERNAL_REFERENCE |
| storageProvider, storageBucket, storageKey | string |
| originalFilename, contentType | string |
| fileSizeBytes | number |
| referenceNumber, issuer | string |
| issueDate, expiryDate | string |
| reviewStatus | SUBMITTED / ACCEPTED / REJECTED |
| reviewedByUserId, reviewedAt, reviewComment | string |

### 5.7 Assessment Event

**Source:** `types/index.ts`
**Status:** Type defined; **no dedicated UI** — only `reviewEvidence()` and `markNotApplicable()` in skillsMatrix store

| Field | Type |
|-------|------|
| outcome | PASS / FAIL / LIMITED |
| assessmentMethodCode | string |
| assessedByUserId | string |
| expiryDateSet | string |
| validityDaysApplied | number |

### 5.8 Training Need

**Source:** `types/index.ts`, `stores/trainingNeeds.ts`, `data/trainingNeedTemplates.json`
**Data:** Generated from 7 templates at runtime for top 7 employees
**Status:** Partially implemented — list view works, resolution sheet opens but doesn't truly persist

| Field | Type |
|-------|------|
| status | OPEN / IN_PROGRESS / COMPLETED / CANCELLED |
| createdReason | EXPIRED_RENEWAL / EXPIRING_RENEWAL / NEW_REQUIREMENT / NEW_HIRE |
| trainingTypeCode | string |
| dueDate | string |
| assignedToUserId | string |

**Resolution types:** UPLOAD, RENEWAL, OJT, ASSESSMENT — each with specific form fields.

### 5.9 Awareness Topic

**Source:** `types/index.ts`, `data/awarenessTopics.json`
**Data:** 5 static items
**Status:** Read-only; employee can "acknowledge" (in-memory only)

| Field | Type |
|-------|------|
| title | string |
| category | Safety / Environment / Compliance / Emergency / Quality |
| targetAudience | string (freetext in JSON; typed as AwarenessTopicTargetRule in types) |
| dueDate | string |
| completion | string (percentage) |
| status | Active / Scheduled / Completed |

### 5.10 Awareness Acknowledgement

**Source:** `types/index.ts`
**Status:** Type defined; in-memory tracking only via `ref(new Set<string>())`

### 5.11 Training Completion

**Source:** `types/index.ts`
**Status:** Type defined; **no UI or store logic references it**

### 5.12 Reference Lists (Controlled Values)

**Source:** `data/referenceLists.json`
**Status:** Fully defined in JSON; read-only in UI (ReferenceListsView shows cards but no edit forms)

| List | Values |
|------|--------|
| Risk Levels | LOW, MEDIUM, HIGH_CRITICAL |
| Training Types | CERT_LICENCE, OJT_COACHING, EXPERIENCE_VALIDATED, INDUCTION, AWARENESS |
| Assessment Methods | RECORD_REVIEW, OBSERVATION, TEST, INTERVIEW, MANAGER_SIGNOFF |
| Statuses | N_A, REQUIRED, IN_PROGRESS, VALID, EXPIRING (derived), EXPIRED (derived) |
| Evidence Types | CERTIFICATE, RECORD, OBSERVATION_NOTE, SIGNOFF, EXTERNAL_REFERENCE |
| Responsible Parties | EMPLOYEE, LINE_MANAGER, HR_ADMIN, ASSESSOR, QHSE |
| Expiring Threshold | 30 days |

### 5.13 Organisation Entities (from ERP API)

| Entity | API Endpoint | Status |
|--------|-------------|--------|
| Business Unit | `GET /business-units` | Live API |
| Department | `GET /departments` | Live API |
| Job Title | `GET /job-titles` | Live API |
| Manager (hierarchy) | `GET /employees/{id}/hierarchy` | Endpoint exists, not used in UI |

---

## 6. Page-by-Page Findings

### 6.1 Dashboard (`DashboardView.vue`)

**Purpose:** Organisation-wide compliance overview for managers/HR.

**KPI Cards (6):**
1. Required — count of competencies in REQUIRED/IN_PROGRESS status
2. Expiring — count within 30 days
3. Expired — count past expiry
4. Not Authorised — employees with gating failures
5. Open Training — open training needs
6. Overdue Training — past due date

**Lists:**
- "Not Authorised (Gating Failed)" — top 4 employees, showing name, job title, missing competency badge, days expired
- "Expiring Soon" — top 4 items, showing name, requirement, days remaining badge, expiry date

**Recent Activity:** 4 static items from `dashboardActivity.json`:
- "Certificate uploaded for LOTO competency" (2h ago)
- "Working at Height evidence accepted by assessor" (4h ago)
- "Confined Space assessment passed" (1d ago)
- "Role requirements published for Maintenance Supervisor" (2d ago)

**Data source:** Computed from skillsMatrix store (deterministic mock) + trainingNeeds store (generated).
**Charts/graphs:** None (missed opportunity for compliance trend, department comparison).
**DML-specific feel:** Strong — language is "competence compliance", "gating risks", "authorisation", not "course completion".

### 6.2 My Competencies (`MyCompetenciesView.vue`)

**Purpose:** Employee's personal competence profile.

**Profile strip:** Job Title, Department, Business Unit, Manager, IWA Status badge.
**Alert banner:** Shows if items are expiring/expired.
**Stats row:** 4 pills — Valid, Expiring, Expired, Required counts.
**Requirements table:** Grouped by category (Technical, Quality, Mandatory).

| Column | Notes |
|--------|-------|
| Code | Competency code |
| Requirement | Competency title |
| Gating | "Gating" badge if isGating |
| Expiry | Date or "No Expiry" |
| Action Required | e.g. "Renew LOTO", "Complete HSE-IND" |
| Responsible | Employee / Manager |
| Status | StatusChip component |

**IWA concept:** "Independent Work Authorisation" — badge shows "Authorised" (green shield) or "Not Authorised" (red shield). This is the **key DML concept** — it means all gating competencies are valid.

**Data source:** Skills matrix store (synthetic).
**Missing:** No evidence upload from this view, no history of past completions, no link to resolve individual items.

### 6.3 Skills Matrix (`SkillsMatrixView.vue`)

**Purpose:** The core compliance view — org-wide matrix of employees x competencies.

**Two view modes:**
1. **Employee Summary** — table with: Employee, Job Title/Dept/BU, Authorisation, Required, Expiring ≤30, Expired, Gating Failed, Top Action, Responsible
2. **Requirement Grid** — frozen employee columns + expandable category columns (Technical, Quality, Mandatory) with individual competency status cells (StatusChip)

**Filter bar (extensive):**
- Scope: Org / Team / Personal (selector, but Team/Personal may not filter differently)
- Search (name or ID)
- Business Unit, Department, Job Title selects
- Status: All / Valid / Expiring / Expired / Required / In Progress
- Risk: All / Low / Medium / High/Critical
- Gating Only toggle
- Issues Only toggle
- Demo Views dropdown: Compliance, Gating, Expiring 30 Days, Training Backlog
- Export Excel button (generates CSV)
- Columns selector (toggle individual competencies)

**Summary bar:** Total, Authorised, Not Authorised, Expiring, Expired, Compliance %

**Drawer:** Clicking an employee opens a detail sheet showing per-competency breakdown with actions (Review Evidence: Accept/Reject, Mark N/A).

**Hardcoded filter values:**
- Job Titles: Maintenance Technician, Maintenance Supervisor, QHSE Coordinator, Operations Manager, Shift Lead, Electrical Technician, Instrumentation Technician
- Departments: Maintenance, Operations, QHSE, Engineering
- Business Units: Upstream, Midstream, Downstream, Corporate

**Data source:** Deterministically generated from real API employees + seed hash. **No actual competence data from API.**
**DML-specific feel:** Very strong — "Authorisation", "Gating Failed", risk-based filtering, category grouping.
**Weakness:** Data is synthetic; the same employee will always show the same statuses.

### 6.4 People (`PeopleView.vue`)

**Purpose:** Employee directory sourced from ERP.

**Table columns:** Name (avatar), Job Title, Department, Business Unit, Manager, Status, Actions.
**Filters:** Search, Department, Business Unit, Job Title. Clear filters button.
**Pagination:** First/Prev/Next/Last with page info.
**Actions menu:** View Profile, View Competencies, Training History, Edit Record — **all non-functional** (no navigation or handlers visible).

**Data source:** Real API (`GET /employees`).
**Employee filtering:** Only shows employees matching target job title keywords: 'maintenance', 'technician', 'operator', 'supervisor', 'qhse', 'hse', 'shift lead', 'electrical', 'instrumentation'. Capped at 50.
**Note:** Active/Inactive status badges are present. No employee detail/profile page exists.

### 6.5 Roles (`RolesView.vue`)

**Purpose:** List all ERP job titles and their applicability decisions.

**Table columns:** Code, Job Title, Applicability (badge), Published (badge), Version, Actions.
**Filters:** Search by name or code.
**Actions menu:** Applicability Decision, Role Requirements, History.
**Click row → navigates to `/roles/:id`.**

**Applicability badges:** INCLUDED (green), AWARENESS_ONLY (yellow), OUT_OF_SCOPE (grey), PENDING (blue).
**Published badges:** Published (green + check icon), Drafting (blue + shield icon).
**Exclusion logic:** Rows where job title name contains 'chief' or 'director' are excluded from display.

**Data source:** Job titles from real API; applicability decisions from local JSON matched by name keyword.

### 6.6 Role Detail (`RoleDetailView.vue`)

**Purpose:** Configure applicability decision and competency requirements for one job title.

**Three tabs:**

**Tab 1 — Applicability Decision:**
- 5 questions (Q1-Q5) with switches, descriptions, examples, decision flow hints
- Q1: Hands-On Operational Work?
- Q2: Conformity / Compliance Sign-Off?
- Q3: Error Causes Safety / Quality Impact?
- Q4: Specific Competence Required?
- Q5: Objective Evidence Required?
- Notes field for justification
- Computed result: INCLUDED / AWARENESS_ONLY / OUT_OF_SCOPE
- "Escalation Tip" callout
- Result card with determination + Save Decision button
- Audit trail card (Last Reviewed By, Date, Saved Result)

**Tab 2 — Role Requirements:**
- "Add Competency" button
- Table: Competency, Risk Level, Mandatory, Gating, Training Type, Assessment, Actions (Edit)
- Edit sheet: Risk Level, Mandatory toggle, Gating toggle, Training Type, Assessment Method

**Tab 3 — History:**
- Content not confirmed from code (tab exists, content may be placeholder).

**DML-specific feel:** Extremely strong. The 5-question applicability decision tree is a genuine ISO 9001 / manufacturing competence framework pattern.

### 6.7 Competency Library (`CompetencyLibraryView.vue`)

**Purpose:** Master catalogue of competency definitions.

**Table columns:** Code, Competency Title, Category (badge), Risk Level (colour-coded badge), Default Training Type, Validity, Actions.
**Filters:** Search (code or title), Category dropdown.
**Actions menu:** Edit Details, View Assignments, Archive Item.
**Add button:** Opens CompetencyFormSheet side panel.

**CompetencyFormSheet fields:**
- Code (text, e.g. "PTW-01")
- Category (select: Technical, Quality, Mandatory)
- Competency Title (text)
- Description (text)
- Risk Level (select from reference lists)
- Criticality Domain (text, e.g. "Safety Critical")
- Training Type (select)
- Assessment Method (select)
- Requires Expiry / Renewal (switch)
- Default Validity Days (number, conditional)

**Data source:** Local JSON (15 items). Create/update are stubs.
**Validity display:** "365 days", "730 days", "No Expiry", or "Required".

### 6.8 Training Needs (`TrainingNeedsView.vue`)

**Purpose:** Action queue for closing competence gaps.

**Header actions:** "Bulk Schedule" button, "Create Request" button.
**New Hire banner:** Shows count of NEW_HIRE needs with "Handle Onboarding" button.

**Filter card:** Search, Department, Priority (Critical/Gating, High, Medium), "More Filters" button.

**Table columns:**
| Column | Content |
|--------|---------|
| Employee | Avatar + name + job title |
| Requirement | Code + competency title |
| Gating | "Critical" badge or dash |
| Type & Risk | Training type + risk dot |
| Reason | Icon + EXPIRED_RENEWAL / EXPIRING_RENEWAL / NEW_REQUIREMENT / NEW_HIRE |
| Recommended Action | Context-sensitive text |
| Due Date | Date + "Overdue" label if past |
| Status | OPEN / IN_PROGRESS / COMPLETED |
| Actions | Resolve, Assign to Me, Escalate |

**Reason display labels:**
- EXPIRED_RENEWAL → "Renewal (Expired)"
- EXPIRING_RENEWAL → "Renewal (Expiring)"
- NEW_REQUIREMENT → "New Requirement"
- NEW_HIRE → "New Hire Onboarding"

**"Resolve" action** opens TrainingNeedDetailsSheet with 4 resolution paths:
1. Upload Cert (file dropzone + issue/expiry dates)
2. Book Training (provider name + planned date)
3. OJT / Coaching (trainer name)
4. Assessment Only (assessor name)

**Data source:** Generated from 7 templates × top 7 filtered employees. Needs are re-generated on each mount.

### 6.9 Awareness Topics (`AwarenessTopicsView.vue`)

**Purpose:** Dual view — employee acknowledgement / admin management.

**Employee view:**
- Pending banner with count
- "My Topics" card with table: Topic, Category, Due Date, Status (Pending/Acknowledged), Action (Acknowledge button)
- Acknowledgement is in-memory only (lost on reload)

**Admin view:**
- "Create Topic" button (non-functional)
- Table: Topic Title, Category, Target Audience, Due Date, Completion %, Status
- Actions: View Details, Edit Topic, View Progress, Deactivate (all non-functional)

**Data source:** 5 static JSON items.
**Topics in demo:**

| Title | Category | Audience | Status |
|-------|----------|----------|--------|
| Q1 Safety Briefing 2026 | Safety | All Employees | Active |
| Environmental Awareness | Environment | Operations | Active |
| Data Protection Update | Compliance | All Employees | Completed |
| Emergency Response Drill | Emergency | Site Personnel | Scheduled |
| Quality Management Refresher | Quality | Supervisors | Active |

### 6.10 Reference Lists (`ReferenceListsView.vue`)

**Purpose:** Admin view of controlled vocabulary.

**Display:** Grid of 6 cards, each showing title, icon, item count, description, "Manage" button.

| Card | Count |
|------|-------|
| Business Units | — |
| Departments | — |
| Job Titles | — |
| Competency Categories | — |
| Validity Thresholds | — |
| Compliance Levels | — |

**All "Manage" buttons are non-functional.** No edit forms exist.

### 6.11 ERP Connection (`ErpConnectionView.vue`)

**Purpose:** Monitor ERP integration status.

**Displays:**
- Hero status: Connected / Disconnected with icon
- Meta: Environment, API Version, Next Sync
- KPI cards: Employees Synced, Response Time, Uptime, Data Integrity
- Connection details: Endpoint URL, Sync Interval, Last/Next Sync
- Recent sync activity feed (5 events)
- Quick actions: Force Full Sync, View Sync Logs, Export Data, Configure Endpoint

**All data is hardcoded/static.** Quick actions show toast "Demo mode" messages. This is purely a visual mock of ERP integration status.

### 6.12 Guide (`GuideView.vue`)

Multi-section scrollable onboarding guide with: The Problem (4 challenges), The Solution, How It Works (5 steps), Who It's For (3 personas), Try It Yourself, The Impact (metrics), Ready to Dive In (8 feature cards linking to routes).

### 6.13 Sales Pitch (`SalesPitchView.vue`)

Dedicated sales presentation with: Problem (6 cards), Solution (5 items), Workflow (6 steps), Users (3 personas with quotes), Safety example (authorisation logic), Benefits (4 cards), Demo feature cards, CTA buttons.

### 6.14 Components (`ComponentsView.vue`)

Developer-facing UI component showcase. Not production-relevant.

---

## 7. API / Store / Data Flow Findings

### API Client (`api/client.ts`)

**Base URL:** `https://dmlapi.inova.krd/api/v1`

| Module | Endpoints | Live? |
|--------|-----------|-------|
| `authApi` | `POST /auth/login` | Yes |
| `organizationApi` | `GET /business-units`, `/departments`, `/job-titles` (+by ID) | Yes |
| `employeesApi` | `GET /employees`, `/employees/{id}`, `/employees/{id}/hierarchy`, `POST /employees` | Yes (read), POST untested |
| `usersApi` | `GET /users`, `/users/{id}`, `/users/by-email`, `POST /users`, POST/DELETE roles | Yes (read) |
| `rolesApi` | `GET /roles`, `/roles/{id}`, `POST /roles` | Defined but unclear if used |
| `auditApi` | `GET /audit-logs` | Defined but not referenced in UI |

### API Wrapper (`api/index.ts`)

| Wrapper | Source | Notes |
|---------|--------|-------|
| `erpApi` | Real API (size: 1000 pagesize) | Convenience wrapper |
| `competencyLibraryApi` | Local JSON | CRUD stubs return input as-is |
| `rolesApi` | Local JSON | CRUD stubs return input as-is |
| `trainingNeedsApi` | Empty stubs | `getAll()` returns `[]` |

### Store-to-data mapping

| Store | Real API Data | Local JSON Data | Generated Data |
|-------|--------------|-----------------|----------------|
| `auth` | Login, user info | — | Persona objects |
| `employees` | Employees, job titles, departments, BUs | — | — |
| `competencyLibrary` | — | `competencies.json` | — |
| `roles` | — | `roleApplicability.json`, `roleRequirements.json` | — |
| `skillsMatrix` | Uses employee list | `competencies.json`, `roleRequirements.json` | **Competence items generated via seed hash** |
| `trainingNeeds` | — | `trainingNeedTemplates.json` | **Training needs generated per employee** |
| `referenceLists` | — | `referenceLists.json` | — |

### Backend readiness assessment

| Aspect | Status |
|--------|--------|
| Auth/login flow | Working with real API |
| Employee CRUD | Read working; create endpoint exists but not used |
| Competency CRUD | **Frontend shell only** — no API endpoints defined |
| Role applicability CRUD | **Frontend shell only** |
| Role requirements CRUD | **Frontend shell only** |
| Skills matrix (competence items) | **Entirely synthetic** — no API endpoints |
| Training needs CRUD | **Frontend shell only** — API stubs return empty |
| Evidence upload | **Visual mock only** — no file handling |
| Assessment events | **Type only** — no API or UI |
| Awareness topics CRUD | **Static JSON only** — no API endpoints |
| Audit logs | API endpoint defined but not used in any view |

**Conclusion:** The app is a **frontend shell with a real authentication and employee data layer**. All domain-specific data (competencies, requirements, matrix cells, training needs) would require backend implementation to become functional.

---

## 8. Demo Data and Terminology Audit

### Terminology Assessment

| Term Used | Context | Feel |
|-----------|---------|------|
| "Competence" | Sidebar brand, page titles | Manufacturing / ISO |
| "Competency" | Library items, form labels | Acceptable (interchangeable) |
| "Skills Matrix" | Page name, nav item | Industrial standard |
| "Gating" / "Gating Failed" | Matrix, dashboard, badges | **Strong manufacturing** — work authorisation gate |
| "Independent Work Authorisation (IWA)" | My Competencies badge | **Very DML** — specific to manufacturing |
| "Authorised / Not Authorised" | Matrix, dashboard | Industrial (not "certified" or "trained") |
| "Applicability Decision" | Role detail tab | ISO-style language |
| "Conformity / Compliance Sign-Off" | Q2 question | ISO 9001 terminology |
| "Evidence" | Evidence types, upload, review | Quality management |
| "Nonconformance Reporting" | Competency | ISO / quality |
| "Corrective Action Participation" | Competency | ISO / CAPA |
| "Permit to Work" | Competency | Industrial safety |
| "LOTO (Lockout/Tagout)" | Competency | OSHA / industrial |
| "OJT / Coaching" | Training type, resolution path | Industrial training |
| "Manager Sign-off" | Assessment method | Manufacturing |
| "Training Needs" | Page, nav | Could be LMS, but context is gap-driven |
| "Awareness Topics" | Page, nav | Manufacturing quality system |
| "Resolve Competence Gap" | Sheet title | Competence management |
| "Book Training" | Resolution label | Slightly generic |
| "Acknowledge" | Employee awareness action | Compliance/quality |

### Language that feels generic/LMS-like

| Term | Where | Concern |
|------|-------|---------|
| "Training assigned" | Notification | Sounds like an LMS push |
| "Certificate expiring" | Notification | OK but could be "Competence record expiring" |
| "GraduationCap" icon | Training details sheet | Academic, not industrial |
| "Complete Onboarding Assessment" | Recommended action | Could be more specific |
| "Schedule Training" | Resolution button | Could be "Book Renewal" |
| "Learning" | Not used | Good — avoided LMS term |
| "Course" | Not used | Good — not present anywhere |

### Language that is already strong DML

- "Gating Requirement" badge
- "Not Authorised (Gating Failed)" dashboard section
- "Hands-On Operational Work" (Q1)
- "Error Causes Safety / Quality Impact" (Q3)
- "Objective Evidence Required" (Q5)
- "Renew LOTO", "Schedule WAH", "Complete HSE-IND" (action labels)
- "Safety Critical" (criticality domain)
- Competency codes: PTW, LOTO, WAH, CSE, LIFT, MECH, NCR, CAPA

### Demo data quality

| Aspect | Assessment |
|--------|-----------|
| Competency names | **Excellent** — all industrial: PTW, LOTO, WAH, CSE, LIFT, etc. |
| Job titles | **Excellent** — Maintenance Technician, QHSE Coordinator, Shift Lead, etc. |
| Departments | **Good** — Maintenance, Operations, QHSE, Engineering |
| Business Units | **Good** — Upstream, Midstream, Downstream, Corporate |
| Awareness topics | **Good** — Safety Briefing, Environmental Awareness, Emergency Response Drill |
| Persona names | **OK** — generic names (Alex Morgan, Sarah Ahmed), not recognisably industrial |
| Activity messages | **Good** — "Certificate uploaded for LOTO", "Working at Height evidence accepted" |
| Training providers | **Placeholder** — only "Red Cross, OPITO" as placeholder text in input |
| Employee data | **Real from ERP** — authentic names and structure |

### Missing manufacturing terminology

- No reference to "Management of Change (MOC)"
- No "Process Safety" category
- No "Hot Work" competency (common in manufacturing)
- No "Scaffolding" or "Rigging" competencies
- No "Welding Procedure Qualification" or NDE competencies
- No reference to "ISO 9001", "ISO 14001", "ISO 45001" in UI labels
- No "Toolbox Talk" in awareness topics
- No plant/site/location as an organisational dimension

---

## 9. DML Alignment Scorecard

| Capability | Evidence | Status | Notes |
|-----------|---------|--------|-------|
| Role-based competence requirements | `roleRequirements.json`, RoleDetailView tabs | **Clearly supported** | 6 roles, 8-12 requirements each, with gating flags |
| Person-level assessment | `EmployeeCompetenceItem` type, statusChip rendering | **Partially supported** | Types exist, data is synthetic — no real assessment workflow |
| Matrix: required vs current vs gap | SkillsMatrixView grid mode with StatusChip cells | **Clearly supported** | Two view modes, extensive filtering, category grouping |
| Awareness topics and procedural communication | AwarenessTopicsView, dual employee/admin view | **Partially supported** | 5 demo topics, acknowledge flow exists, but create/edit non-functional |
| Training needs driven by gaps or change | TrainingNeedsView, 4 reason codes, resolution sheet | **Partially supported** | Generated from templates, not from actual gap detection |
| Certificate/licence tracking | CERT_LICENCE training type, expiry dates, evidence types | **Partially supported** | Types and display exist; no actual upload or storage |
| Supervised work status | Not visible | **Not visible in frontend** | No "supervised" vs "independent" progression tracker |
| Independent-work authorisation | `isAuthorised` boolean, IWA badge in My Competencies | **Clearly supported** | Gating logic drives authorisation calculation |
| Evidence-backed competence records | EvidenceRecord type, reviewStatus (SUBMITTED/ACCEPTED/REJECTED) | **Weakly implied** | Type defined, evidence refs generated synthetically, no evidence list UI |
| Department/function ownership | Department filter in matrix, people, training needs | **Clearly supported** | Real department data from ERP |
| Manufacturing-relevant categories | Technical, Quality, Mandatory categories + 15 industrial competencies | **Clearly supported** | All competencies are industrial: PTW, LOTO, WAH, CSE, etc. |
| Applicability decision framework | 5-question decision tree in RoleDetailView | **Clearly supported** | ISO-style decision logic |
| Expiry/renewal cycle | derivedStatus EXPIRING/EXPIRED, 30-day threshold, expiry dates | **Clearly supported** | Dashboard expiring list, matrix filtering |
| Compliance rate / health metrics | `summaryStats.complianceRate` in skills matrix | **Clearly supported** | Dashboard KPIs, summary bar |
| Gating / authorisation gate | `isGating` flag, `gatingFailed` array, "Not Authorised" label | **Clearly supported** | Core concept throughout |
| Responsible party tracking | `getResponsibleParty()` function, matrix column | **Partially supported** | Computed from status, not configurable per record |
| Audit trail | `AuditLog` type, `auditApi`, role detail audit card | **Weakly implied** | API exists, UI shows last reviewed in role detail only |
| Bulk operations | "Bulk Schedule" button in Training Needs | **Weakly implied** | Button exists, no handler |
| Re-assessment triggers | EXPIRING/EXPIRED status computation from expiry date | **Partially supported** | Automatic via derived status, no configurable trigger rules |
| Multi-tenant / multi-site | `tenantId` in API types | **Weakly implied** | Present in API data, no UI to switch tenants/sites |

---

## 10. Gaps / Unknowns

### Cannot be concluded from frontend alone

| Question | Requires |
|----------|----------|
| Do competency CRUD endpoints exist in the backend? | Backend/API inspection |
| Is there a real competence item table (the matrix cell data)? | Database schema review |
| How is training completion actually recorded and linked to evidence? | Backend logic inspection |
| Is the audit log API populated with real events? | Live API testing |
| What triggers training need creation — is it automated from gap detection? | Backend logic |
| How does evidence upload work (S3, local storage)? | Backend infrastructure review |
| Is the gating/authorisation calculation done server-side or frontend-only? | Backend inspection |
| Can the system actually sync ERP data on a schedule? | Infrastructure/cron review |
| Are there any mobile views or offline capabilities? | Live demo on mobile |
| How does the system handle role changes (employee moves to different job title)? | Backend logic |
| Is there any notification system beyond the hardcoded dropdown? | Backend/infrastructure |
| What happens when a requirement set version is retired and a new one published? | Backend logic |
| Are there any reports or exports beyond the CSV from skills matrix? | Backend inspection |

### Requires screenshots or live demo

- How the skills matrix grid scrolls and performs with 50 employees × 15 competencies
- Whether the StatusChip popover shows useful detail
- How the employee drawer in the matrix looks with real data
- Whether the persona switcher is obvious enough for a demo audience
- Loading states and error states

---

## 11. Appendix: File Evidence

### Critical domain files

| File | Why it matters |
|------|---------------|
| `src/router/index.ts` | All 15 routes, auth metadata |
| `src/stores/auth.ts` | 3 demo personas, login flow, role assignment |
| `src/stores/skillsMatrix.ts` | Core matrix logic, deterministic seed, gating calculation, 668 lines |
| `src/stores/roles.ts` | Role applicability decisions, requirement management |
| `src/stores/trainingNeeds.ts` | Training need generation, resolution types |
| `src/stores/employees.ts` | Employee API integration, keyword filtering |
| `src/stores/competencyLibrary.ts` | Competency CRUD stubs |
| `src/types/index.ts` | Complete domain model (473 lines, 30+ interfaces) |
| `src/api/client.ts` | API client with all endpoint definitions |
| `src/api/index.ts` | API wrappers, JSON loaders, stub APIs |
| `src/components/layout/AppSidebar.vue` | Navigation config, role-based menu (397 lines) |
| `src/components/layout/AppHeader.vue` | Persona switcher, notifications (410 lines) |
| `src/data/competencies.json` | 15 industrial competencies |
| `src/data/roleRequirements.json` | 6 role × requirement sets with gating |
| `src/data/referenceLists.json` | All controlled vocabularies |
| `src/data/trainingNeedTemplates.json` | 7 training need templates |
| `src/data/awarenessTopics.json` | 5 awareness topics |

### Critical view files

| File | Lines | Why |
|------|-------|-----|
| `src/views/SkillsMatrixView.vue` | ~800+ | The most complex view; dual-mode matrix, filters, drawer |
| `src/views/RoleDetailView.vue` | ~500+ | Applicability decision tree, requirements tab |
| `src/views/DashboardView.vue` | 317 | KPI dashboard, gating/expiring lists |
| `src/views/TrainingNeedsView.vue` | ~400+ | Training queue with resolution workflow |
| `src/views/MyCompetenciesView.vue` | ~300+ | Personal profile with IWA status |
| `src/components/training/TrainingNeedDetailsSheet.vue` | 440 | Resolution path selection (4 paths) |
| `src/components/competency/CompetencyFormSheet.vue` | ~200+ | Competency create/edit form |

---

## 12. What I Would Send to a Product Reviewer

### Top 10-20 files to review

1. `src/stores/skillsMatrix.ts` — the heart of the system
2. `src/views/SkillsMatrixView.vue` — the showcase screen
3. `src/views/RoleDetailView.vue` — the applicability decision framework
4. `src/types/index.ts` — the complete domain model
5. `src/data/competencies.json` — the 15 competency definitions
6. `src/data/roleRequirements.json` — gating requirements per role
7. `src/stores/auth.ts` — persona switching, demo flow
8. `src/views/DashboardView.vue` — compliance KPIs
9. `src/views/TrainingNeedsView.vue` — gap closure queue
10. `src/components/training/TrainingNeedDetailsSheet.vue` — resolution workflow
11. `src/views/MyCompetenciesView.vue` — employee personal view
12. `src/components/layout/AppSidebar.vue` — navigation architecture
13. `src/data/referenceLists.json` — controlled vocabularies
14. `src/views/AwarenessTopicsView.vue` — awareness module
15. `src/api/client.ts` — API structure

### 5 screens that matter most

1. **Skills Matrix (Grid View)** — this is the money shot for any DML demo. Required vs. current vs. gap for every employee × competency.
2. **Role Detail — Applicability Tab** — the 5-question decision tree that determines which roles need competence management. Unique to manufacturing.
3. **Dashboard** — executive view of compliance health, gating failures, and expiring items.
4. **Training Needs + Resolution Sheet** — shows the gap-to-action workflow with 4 resolution paths.
5. **My Competencies** — the employee-facing view with IWA (Independent Work Authorisation) status.

### Biggest frontend strengths

1. **Domain model is genuinely competence-oriented, not LMS-shaped.** There are no "courses", "modules", "quizzes", or "learners". The vocabulary is competencies, gating, authorisation, evidence, assessment, and risk levels.
2. **The applicability decision tree** is a real manufacturing framework pattern. It distinguishes INCLUDED / AWARENESS_ONLY / OUT_OF_SCOPE with reasoned logic.
3. **Gating / IWA concept is first-class.** The system clearly communicates "this person is NOT authorised for independent work because [specific gating competency] is expired/missing."
4. **The 15 competencies are all industrial** — PTW, LOTO, WAH, CSE, LIFT, NCR, CAPA. No generic "Communication Skills" or "Time Management."
5. **The matrix grid view** with collapsible categories, column toggling, and per-cell status chips is a sophisticated and appropriate visualisation.
6. **Three-persona demo** allows rapid switching to show different user experiences.
7. **Real ERP integration** for employee data grounds the demo in authentic organisational structure.

### Biggest signs the demo still feels generic

1. **No supervised-work concept.** The DML operating model includes "support supervised work until competence is proven" — the frontend has no concept of a supervised/mentored work period between "required" and "authorised."
2. **Training needs are generated, not derived from actual gaps.** The system generates needs from static templates rather than detecting them from the delta between requirements and actual competence records.
3. **No evidence management UI.** Evidence is a core concept in the type system but there is no screen to view, list, or review evidence records. The upload dropzone is a visual mock.
4. **No assessment workflow.** Assessment events are typed but have no dedicated UI for conducting assessments, recording outcomes, or tracking assessment schedules.
5. **Awareness topics are flat and static.** The type system supports rich targeting rules (by department, BU, job title) but the JSON data uses freetext strings. No content/attachment model.
6. **"Create Topic", "Bulk Schedule", "Handle Onboarding", "Create Request" buttons are non-functional.** In a live demo, clicking these reveals the shell.
7. **Reference Lists page is display-only cards** — cannot actually manage controlled values.
8. **Persona names are generic** (Alex Morgan, Sarah Ahmed). Could be "Karwan Ali, Maintenance Technician" or similar DML-authentic names.
9. **No charts or trend visualisation.** The dashboard shows point-in-time counts but no compliance trend, department comparison, or expiry forecast graph.
10. **No Management of Change (MOC) integration** — procedure changes that trigger re-training or re-assessment are a key DML concept, not represented anywhere.
