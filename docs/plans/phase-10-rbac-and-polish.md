# Phase 10 — RBAC, Personas & Polish

## Goal

Tighten role-based access control beyond sidebar visibility, refine personas for demo storytelling, standardise badges/statuses/empty states across all screens, and ensure the reference data is internally consistent.

## Punch list alignment

- Section 11: Reference Lists — departments, competency categories/types, evidence types, statuses, delivery methods, etc.
- Section 12: ERP Connection — keep practical, don't overplay
- Section 13: RBAC and persona refinement — route guards, persona-specific views, action restrictions

## Prerequisites

- All previous phases (0–9) complete — this phase cross-cuts everything

## Tasks

### 10.1 Add route-level access guards

**Files:** `src/router/index.ts`, `src/stores/auth.ts`

**What to do:** Add role-based route guards so that direct URL access is restricted, not just sidebar visibility.

**Details:**

Current state: all routes have `meta: { requiresAuth: true }` but no role check. RBAC is only enforced by hiding sidebar items.

Add `meta.allowedRoles` to route definitions:

| Route | Allowed Roles |
|-------|--------------|
| /dashboard | ALL |
| /my-competencies | ALL except LEADERSHIP_VIEWER |
| /skills-matrix | SUPERVISOR, MANAGER, QHSE, HR_ADMIN, ADMIN, LEADERSHIP_VIEWER |
| /training-needs | SUPERVISOR, MANAGER, QHSE, HR_ADMIN, ADMIN |
| /awareness-topics | ALL (employee view) / admin view restricted |
| /people | MANAGER, HR_ADMIN, ADMIN |
| /roles | MANAGER, QHSE, HR_ADMIN, ADMIN |
| /roles/:id | MANAGER, QHSE, HR_ADMIN, ADMIN |
| /competency-library | QHSE, HR_ADMIN, ADMIN |
| /erp-connection | HR_ADMIN, ADMIN |
| /settings | ALL |

Add a `beforeEach` guard in the router:
```
if (route.meta.allowedRoles && !route.meta.allowedRoles.includes(userRole)) {
  redirect to /dashboard with toast "You don't have access to this page"
}
```

---

### 10.2 Expand persona set

**Files:** `src/stores/auth.ts`, `src/components/layout/AppHeader.vue`

**What to do:** Expand from 3 personas to 5 for richer demo storytelling.

**Details:**

Current personas: Employee (Alex Morgan), Manager (Sarah Ahmed), HR Admin (Demo Admin)

New persona set:

| Key | Name | Job Title | Role | Department |
|-----|------|-----------|------|------------|
| employee | Karwan Ali | Welding / Fabrication Technician | EMPLOYEE | Welding & Fabrication |
| supervisor | Shwan Hassan | Production Supervisor | SUPERVISOR | Additive Manufacturing |
| manager | Dana Ibrahim | Operations Manager | MANAGER | Operations |
| qhse | Hemish Patel | QHSE Coordinator | QHSE | Quality Assurance |
| hr_admin | Lara Mustafa | HR & Training Coordinator | HR_ADMIN | Human Resources |
| leadership | Avan Aziz | Technical Director | LEADERSHIP_VIEWER | Leadership |

**Leadership Viewer** is read-only: sees Dashboard summary, Skills Matrix overview, and Roles readiness but has no edit actions. This represents executive stakeholders (Technical Director, Plant Manager) who need compliance visibility without operational access.

Update persona switcher in AppHeader to show all 5 personas.
Update `authStore.demoPersonas` to include the new entries.
Update `authStore.userRole` to use the expanded role set.

---

### 10.3 Tailor sidebar navigation per persona

**Files:** `src/components/layout/AppSidebar.vue`

**What to do:** Update sidebar items to be persona-appropriate.

**Details:**

| Sidebar Item | Employee | Supervisor | Manager | QHSE | HR Admin | Leadership |
|-------------|----------|-----------|---------|------|----------|-----------|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (read-only) |
| My Competencies | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Skills Matrix | — | ✓ | ✓ | ✓ | ✓ | ✓ (read-only) |
| Training Needs | — | ✓ | ✓ | ✓ | ✓ | — |
| Awareness Topics | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| People | — | — | ✓ | — | ✓ | — |
| Roles | — | — | ✓ | ✓ | ✓ | ✓ (read-only) |
| Competency Library | — | — | — | ✓ | ✓ | — |
| ERP Connection | — | — | — | — | ✓ | — |
| Settings | ✓ | ✓ | ✓ | ✓ | ✓ | — |

---

### 10.4 Tailor dashboard landing state per persona

**Files:** `src/views/DashboardView.vue`

**What to do:** Adjust which KPI cards, charts, and lists are most prominent per persona.

**Details:**

| Persona | Dashboard emphasis |
|---------|-------------------|
| Employee | Redirect to /my-competencies instead (or show personal KPIs only) |
| Supervisor | Team gaps, supervised work status, team reassessment queue |
| Manager | Full dashboard with all widgets |
| QHSE | Mandatory compliance, procedure change awareness, NCR-linked actions, high-risk gaps |
| HR Admin | Full dashboard — records, scheduling, expiry tracking |

For Employee: if landing on /dashboard, show a simplified view with:
- My gap count
- My expiring items
- My pending awareness topics
- Link to "View My Readiness Profile"

Or redirect Employee to /my-competencies on login.

---

### 10.5 Restrict edit actions by role

**Files:** Multiple views (all views with action buttons)

**What to do:** Conditionally show or hide edit/create actions based on the current persona's role.

**Details:**

| Action | Who can do it |
|--------|--------------|
| Create awareness topic | QHSE, HR_ADMIN |
| Edit role requirements | QHSE, HR_ADMIN |
| Create training need | SUPERVISOR, MANAGER, QHSE, HR_ADMIN |
| Record evidence | SUPERVISOR, MANAGER, HR_ADMIN |
| Change supervision status | SUPERVISOR, MANAGER |
| Acknowledge awareness topic | EMPLOYEE, SUPERVISOR (for themselves) |
| Upload evidence | EMPLOYEE (for themselves) |
| Request reassessment | EMPLOYEE (for themselves) |
| Add competency to library | QHSE, HR_ADMIN |

Use `authStore.userRole` in `v-if` conditions on action buttons.

---

### 10.6 Standardise badge and status colours

**Files:** Global styles or component-level — `src/components/ui/StatusChip.vue`, view files

**What to do:** Ensure all badges, status chips, and severity indicators use a consistent colour palette across all screens.

**Details:**

Status colour standard:

| Status/Concept | Colour | CSS class |
|---------------|--------|-----------|
| Valid / Authorised / Compliant / Closed | Green | badge-success |
| Under Supervision / Evidence Submitted / Expiring | Amber/Yellow | badge-supervised / badge-warning |
| In Progress / Scheduled / Approved | Blue | badge-primary |
| Required / Identified / Drafted | Grey | badge-neutral |
| Expired / Not Authorised / Restricted / Critical | Red | badge-critical |

Severity colours:

| Severity | Colour |
|----------|--------|
| Critical | Red |
| High | Orange |
| Moderate | Yellow |
| Low | Grey |

Audit all views for inconsistent badge usage and normalise.

---

### 10.7 Add empty states

**Files:** Multiple views

**What to do:** Add meaningful empty state messages when tables/lists have no data.

**Details:**

| Page/Section | Empty state message |
|-------------|-------------------|
| Skills Matrix (no employees match filter) | "No employees match the current filters. Try adjusting department, role, or status filters." |
| Training Needs (no items) | "No training needs identified. Training needs are created when competence gaps, NCRs, or other triggers are detected." |
| Awareness Topics — employee (none assigned) | "No awareness topics assigned to your role at this time." |
| My Competencies — Evidence tab (no evidence) | "No evidence records found. Upload certificates, observation records, or other supporting documents." |
| Person detail drawer — gaps (no gaps) | "No open gaps — all role requirements are met." |
| Role Detail — assigned people (none) | "No employees currently assigned to this role." |

Each empty state should include an icon (e.g. InboxIcon) and a brief message. No action button unless relevant.

---

### 10.8 Wire remaining action button labels

**Files:** Multiple views

**What to do:** Ensure all action buttons use competence-management terminology, not LMS language.

**Details:**

Replace any remaining generic labels:

| Current label | Replace with |
|--------------|-------------|
| "Complete" | "Close" or "Mark Closed" |
| "Enrol" | "Assign Intervention" |
| "Course" | "Training" or "Intervention" |
| "Student" | "Employee" / "Person" |
| "Learning Plan" | "Competence Development Plan" |
| "Certificate" (as action) | "Record Evidence" |
| "Pass/Fail" (generic) | "Competent / Not Yet Competent" |

Scan all views for any lingering generic training/LMS language and replace.

Also cover:

**Notification text in AppHeader:**
| Current | Replace with |
|---------|-------------|
| "Training assigned" | "Competence gap action assigned" |
| "Certificate expiring" | "Competence record expiring" |

**Icon replacements:**
| Location | Current icon | Replace with |
|----------|-------------|-------------|
| Training details sheet | `GraduationCap` | `HardHat` or `Shield` |
| Any training-related nav item | `GraduationCap` | `BookOpen` or `ClipboardCheck` |

Note: Phase 1 task 1.2 already rewrites the hardcoded notification content. This task ensures no new uses of the old language appear after Phase 1.

---

### 10.9 Verify reference lists consistency

**Files:** `src/data/referenceLists.json`

**What to do:** Ensure the reference lists file includes all the list types from punch list section 11 and that values are used consistently across the app.

**Details:**

Ensure these lists exist:

| List | Values |
|------|--------|
| Departments / Functions | Additive Manufacturing, Welding & Fabrication, Robotics, Materials Testing, Quality Assurance, HSE, Operations, Maintenance, Human Resources |
| Competency Categories | (8 AM categories from Phase 0) |
| Competency Types | Skill, Training, Certification, Awareness Topic, OJT/Coaching, Procedure Briefing, External Qualification, Equipment/Vendor Qualification |
| Evidence Types | Certificate, Sign-off, Observation Record, Assessment Record, Toolbox Talk Attendance, Procedure Acknowledgement |
| Assessment Statuses | Valid, Under Supervision, In Progress, Required, Expiring, Expired, N/A |
| Supervision Statuses | Independent, Supervised, Restricted |
| Gap Severity Levels | Critical, High, Moderate, Low |
| Awareness Delivery Methods | Read & Acknowledge, Team Briefing, Toolbox Talk, Supervisor Cascade, Formal Retraining |
| Training Delivery Methods | Coaching/OJT, Toolbox Talk, External Course, Internal Briefing, Procedure Read & Acknowledge, Supervisor Observation, Certification Renewal |
| Reassessment Triggers | Time-based expiry, NCR/CAPA, Audit finding, Procedure change, Manager request, Incident |
| Training Need Sources | (9 sources from Phase 5) |
| Risk Levels | Critical, High, Moderate, Low |

---

### 10.10 ERP Connection page — light touch

**Files:** `src/views/ErpConnectionView.vue`

**What to do:** Keep the ERP page practical. Ensure the demo story supports realistic admin needs without overpromising.

**Details:**

Verify the page shows:
- Employee master sync status
- Department / role sync status
- Reporting line sync
- Last sync timestamp
- Connection health indicator

If existing content already covers this, no changes needed. If it uses overly technical or generic language, update labels to match DML context:
- "Organisation Sync" → "Employee & Organisation Data"
- Show department list as synced from ERP

Do not add deep process integration features — the punch list explicitly says to keep this supportive, not hero.

---

## Acceptance criteria

- [ ] Route guards prevent direct URL access for unauthorised roles
- [ ] 6 personas available in the persona switcher (including Leadership Viewer — Avan Aziz, Technical Director)
- [ ] Leadership Viewer sees Dashboard, Skills Matrix, and Roles in read-only; cannot access My Competencies, Training Needs, People, Library, or ERP
- [ ] Sidebar items shown/hidden correctly per persona
- [ ] Dashboard shows persona-appropriate content (or redirects Employee to My Competencies)
- [ ] Edit/create actions are restricted by role
- [ ] Badge and status colours are consistent across all screens
- [ ] Empty states display meaningful messages with icons
- [ ] Action button labels use competence-management terminology
- [ ] Reference lists are complete and consistent
- [ ] ERP page is presentable without overpromising
- [ ] The app builds and runs without errors

## Files modified

- `src/router/index.ts`
- `src/stores/auth.ts`
- `src/components/layout/AppHeader.vue`
- `src/components/layout/AppSidebar.vue`
- `src/views/DashboardView.vue`
- `src/views/SkillsMatrixView.vue`
- `src/views/TrainingNeedsView.vue`
- `src/views/AwarenessTopicsView.vue`
- `src/views/PeopleView.vue`
- `src/views/RolesView.vue`
- `src/views/RoleDetailView.vue`
- `src/views/CompetencyLibraryView.vue`
- `src/views/ErpConnectionView.vue`
- `src/data/referenceLists.json`
- `src/components/ui/StatusChip.vue` (if needed)

## Files created

None.

## Demo story

"Different personas see different things. Switch to Karwan — the welder — and he sees his own readiness profile, his pending awareness topics, and his certificates. Switch to Shwan the supervisor and he sees his team's gaps, who's under supervision, and the reassessment queue. Hemish the QHSE coordinator sees mandatory compliance, NCR-linked actions, and procedure change awareness completion. Try navigating directly to /people as the employee — you're redirected back to the dashboard. Every persona gets the right view, the right actions, and the right data."
