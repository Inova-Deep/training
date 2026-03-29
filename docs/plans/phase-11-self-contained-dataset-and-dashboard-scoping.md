# Phase 11 — Self-Contained Dataset & Scoped Offline Demo

## Goal

Make the whole demo run credibly without network access by replacing live employee/auth/role dependencies with a deterministic local data spine, then apply consistent persona scoping across the operational views.

## Punch list alignment

- Section 2: Dashboard — persona-appropriate scope and management storytelling
- Section 5: People — realistic scoped employee visibility
- Section 6 / 7: Roles and Role Detail — fully local, AM-aligned role catalogue and detail resolution
- Section 9: Training Needs — scoped operational actions tied to the correct population
- Section 11 / 12 / 13: Reference data, mocked ERP status, and persona behaviour

## Why this phase exists

The demo currently mixes local AM fixtures with live/API-derived employee, auth, and role resolution paths. That creates three problems:

1. The demo is not actually offline-capable.
2. Persona scoping is inconsistent across Dashboard, People, Skills Matrix, and Training Needs.
3. Roles and Role Detail can still drift back to raw ERP-style data even after the visible AM catalogue was tightened.

This phase fixes those issues together rather than leaving "offline mode" only partially true.

## Locked decisions

- The whole demo must be offline-capable, not just the employee store.
- Headcount is fixed at `64` employees.
- UK naming stays in place.
- The current agreed AM job titles and departments stay in place. Do not reopen them in this phase.
- The app auto-boots into the default persona locally. No live login flow is required for the demo.
- Default persona is `Production Manager`.
- Default landing page is `/dashboard`.
- The top-bar label should say `Production Manager`, not generic `Manager`.
- The dataset contains `3` production supervisor teams.
- Only `1` Production Supervisor persona appears in the header switcher.
- `Production Manager` sees only the `3` production teams in operational views.
- `QHSE`, `HR Admin`, and `Leadership` see the full organisation in-app.
- `System Admin` remains outside the employee dataset and keeps full navigation visibility.
- `Roles` and `Role Detail` become fully local and self-contained in this phase.
- `Production Manager` exists in the dataset and requirement model, but stays out of the visible Roles catalogue.
- `/admin/erp-connection` remains in the product as a mocked integration-status page backed by local data only.

## Prerequisites

- Phases 0–10 complete
- Current AM role naming, department naming, and RBAC route rules already settled

## Target organisation model

### Headcount split

| Role | Count |
|------|------:|
| Technical Director | 1 |
| Production Manager | 1 |
| Production Supervisor | 3 |
| QHSE Coordinator | 1 |
| HR / Training Coordinator | 1 |
| Additive Manufacturing Technician | 20 |
| Welding / Fabrication Technician | 14 |
| Robotics Operator | 10 |
| Materials Testing Technician | 6 |
| QA Inspector | 7 |

Total: `64`

### Reporting structure

Use one deterministic org chart:

- `Technical Director`
  - `Production Manager`
    - `Production Supervisor` — Additive Manufacturing team
      - `20` Additive Manufacturing Technicians
    - `Production Supervisor` — Welding & Fabrication team
      - `14` Welding / Fabrication Technicians
    - `Production Supervisor` — Robotics team
      - `10` Robotics Operators
  - `QHSE Coordinator`
    - `7` QA Inspectors
    - `6` Materials Testing Technicians
  - `HR / Training Coordinator`

### Persona and scope model

| Persona | Backing role | Data scope |
|--------|--------------|-----------|
| Employee | EMPLOYEE | self only |
| Production Supervisor | SUPERVISOR | one production team only |
| Production Manager | MANAGER | all three production teams only |
| QHSE Coordinator | QHSE | full organisation |
| HR Admin | HR_ADMIN | full organisation |
| Leadership | LEADERSHIP_VIEWER | full organisation |
| System Admin | ADMIN | platform-wide access; not part of employee hierarchy |

Scope rules:

- Scoped operational pages are `Dashboard`, `People`, `Skills Matrix`, and `Training & Gap Actions`.
- Scoped personas must not see out-of-scope people at all. This is not just a default filter.
- `Roles`, `Role Detail`, `Competency Library`, `Awareness`, and admin pages remain RBAC-driven rather than team-scoped in the same way.

### Storytelling notes

- Keep the employee persona anchored to the approved employee record already used in the demo.
- Keep only one supervisor persona switchable in the header. The other two supervisors still exist in the local dataset.
- If the employee persona remains a Welding / Fabrication Technician, prefer making the visible supervisor persona the Welding & Fabrication supervisor so the story stays coherent.

## Architecture approach

Create one canonical local data spine for:

- employees
- departments
- business units
- roles
- role detail resolution
- mock ERP integration status

Every runtime view/store should derive from that local spine. Views should stop fetching live reference data on mount. The router guard remains as a fallback for forbidden direct URL access, but normal demo navigation must work entirely from local data.

## Tasks

### 11.1 Create the canonical local employee dataset

**Files:** `src/data/employees.json`, `src/types/index.ts` or local employee typing module if needed

**What to do:** Create a deterministic `64`-employee local dataset that matches the current employee shape closely enough for the rest of the app to consume it without live API translation.

**Details:**

- Use stable employee identifiers such as `emp-001` through `emp-064`.
- Use stable employee numbers such as `DML-001` through `DML-064`.
- Keep the current agreed AM job titles and departments exactly as already approved.
- Use UK-style person naming throughout the generated roster.
- Include manager/reporting links explicitly so scoped views can be derived without heuristics.
- Keep business-unit values local and AM-appropriate only. Do not reintroduce `Upstream`, `Midstream`, `Downstream`, or `Corporate`.
- Keep the dataset deterministic so dashboard cards, counts, and charts remain stable across reloads.

---

### 11.2 Make auth/bootstrap fully local

**Files:** `src/stores/auth.ts`

**What to do:** Remove live auth/user lookup from the runtime demo path and make persona bootstrapping local and deterministic.

**Details:**

- Remove demo runtime dependence on `authApi.login`, `usersApi.getByEmail`, and token-setting as part of normal startup.
- Auto-bootstrap directly into the default persona without network access.
- Change the default persona to `Production Manager`.
- Rename the persona label everywhere from generic `Manager` to `Production Manager`.
- Keep the existing persona set, including `System Admin`.
- Add explicit links from personas to local employee IDs where the persona represents a real employee.
- Keep `System Admin` outside the employee hierarchy.
- Preserve route-guard behaviour; only the source of auth/persona state changes.

---

### 11.3 Refactor the employee store into a local data spine

**Files:** `src/stores/employees.ts`, `src/data/employees.json`

**What to do:** Replace API-backed employee/reference fetching with local derivation from the dataset.

**Details:**

- Load employees from `src/data/employees.json`.
- Derive departments, job titles, and business units locally from the dataset.
- Replace injected demo profiles with the real local employee records used by personas.
- Add helper accessors for:
  - `getEmployeeById`
  - `getEmployeeByDisplayName`
  - `getDirectReports`
  - `getAllReportIds`
  - `getScopedEmployeesForRole`
- Keep temporary compatibility wrappers for `fetchEmployees()` and `fetchAllReferenceData()` if needed while views are migrated, but they must become local/no-op rather than network-backed.
- Remove any remaining runtime dependence on `employeesApi` and `organizationApi`.

---

### 11.4 Add a shared scoping helper and make scope rules explicit

**Files:** `src/lib/demoScope.ts` (new), `src/stores/auth.ts`, `src/stores/employees.ts`

**What to do:** Introduce one shared source of truth for persona-based employee scoping.

**Details:**

- Compute scoped employee IDs once and reuse them across Dashboard, People, Skills Matrix, and Training Needs.
- Support these scope modes:
  - self only
  - one supervisor team
  - all three production teams
  - full organisation
- Keep `Production Manager` scoped to production teams only.
- Keep QA Inspectors and Materials Testing Technicians outside Production Manager scope.
- Keep `QHSE`, `HR Admin`, and `Leadership` on full-org scope.
- Allow `System Admin` to consume full-org scope when opening operational pages, even though they are not part of the employee hierarchy.

---

### 11.5 Make the dashboard fully local and correctly scoped

**Files:** `src/views/DashboardView.vue`, `src/stores/trainingNeeds.ts`, `src/data/dashboardActivity.json` if narrative activity data needs aligning

**What to do:** Rebuild the dashboard data path to use only local/scoped data and make the default persona story credible.

**Details:**

- Stop calling `employeesStore.fetchEmployees()` on mount.
- Replace any ad hoc manager-name filtering with the shared scoping helper.
- Default dashboard experience should be the `Production Manager` view.
- The manager dashboard should reflect only the three production teams, not QA / Materials Testing / HR / QHSE populations.
- Employee and supervisor dashboard variants should still work under the local scope model.
- Ensure dashboard lists, cards, and charts all use the same scoped employee population.
- Keep deterministic numbers; do not let sample activity/data drift between reloads.

---

### 11.6 Hard-scope the People, Skills Matrix, and Training Needs pages

**Files:** `src/views/PeopleView.vue`, `src/views/SkillsMatrixView.vue`, `src/views/TrainingNeedsView.vue`, `src/stores/skillsMatrix.ts`, `src/stores/trainingNeeds.ts`

**What to do:** Ensure all operational pages respect the same persona scope model as the dashboard.

**Details:**

- `People`: only render people inside the current persona scope.
- `Skills Matrix`: only render rows for employees inside the current persona scope.
- `Training & Gap Actions`: only show actions generated from the scoped employee set.
- Do not rely on default filters alone; out-of-scope people/items must not appear.
- Remove any remaining fallback calls to `fetchEmployees()` that exist only to make these pages work.
- Keep filter options realistic for the remaining visible population.
- Reconcile any `normalizeBusinessUnitName()` or similar helper use so the local data path remains internally consistent.

---

### 11.7 Update My Competencies to use the local employee spine

**Files:** `src/views/MyCompetenciesView.vue`, `src/stores/employees.ts`, `src/stores/skillsMatrix.ts`, `src/data/roleRequirements.json`

**What to do:** Make My Competencies work from the local persona-to-employee mapping with no employee API bootstrap.

**Details:**

- Stop calling `employeesStore.fetchEmployees()` on mount for normal demo operation.
- Resolve the active employee row from the local persona/employee mapping.
- Keep the manager persona compatible by adding a real `Production Manager` requirement set.
- Ensure manager, supervisor, QHSE, and HR personas do not end up with missing or empty profiles because their local role requirements are absent.
- Preserve current AM terminology and readiness framing.

---

### 11.8 Make Roles and Role Detail fully self-contained

**Files:** `src/views/RolesView.vue`, `src/views/RoleDetailView.vue`, `src/stores/roles.ts`, `src/lib/demoDomain.ts`, `src/data/roleRequirements.json`, `src/data/roleApplicability.json`

**What to do:** Remove remaining ERP/job-title dependency from the role experience and make role detail resolve locally only.

**Details:**

- Keep the visible Roles catalogue AM-focused and aligned to the already approved visible role set.
- Keep `Production Manager` in role metadata and requirement data, but hide it from the visible Roles catalogue.
- Replace any remaining `organizationApi.getJobTitles()` fallback or raw ERP ID lookup.
- Resolve role detail using canonical local role slugs/aliases only.
- Keep compatibility aliases so older names still resolve safely where needed.
- Make sure assigned-people and readiness views use the same local employee dataset as the rest of the app.

---

### 11.9 Mock ERP Connection locally

**Files:** `src/views/ErpConnectionView.vue`, `src/data/erpConnectionStatus.json`

**What to do:** Keep the ERP Connection page in the demo, but back it with local mock connector state only.

**Details:**

- Provide local connector cards, last-sync timestamps, and sync-log items.
- Do not make any live network or connector checks.
- Keep the page practical and modest; it is a mocked integration-status page, not a promise of live ERP sync.
- Keep visibility aligned to `System Admin` / `ADMIN` access only.

---

### 11.10 Sweep remaining runtime API dependencies from views and stores

**Files:** `src/stores/auth.ts`, `src/stores/employees.ts`, `src/stores/trainingNeeds.ts`, `src/stores/skillsMatrix.ts`, `src/views/DashboardView.vue`, `src/views/PeopleView.vue`, `src/views/TrainingNeedsView.vue`, `src/views/SkillsMatrixView.vue`, `src/views/RolesView.vue`, `src/views/RoleDetailView.vue`, `src/views/MyCompetenciesView.vue`

**What to do:** Remove the remaining runtime paths that still assume live API bootstrap.

**Details:**

- Search for and eliminate meaningful runtime use of:
  - `authApi`
  - `usersApi`
  - `employeesApi`
  - `organizationApi`
  - `fetchEmployees()`
  - `fetchAllReferenceData()`
- The demo may still keep generated API clients in the repo, but the runtime demo path must not depend on them.
- Roles and Role Detail are explicitly in-scope here; do not leave them as partial exceptions.

---

### 11.11 Update guide/manual copy affected by offline mode and scoping

**Files:** `src/views/GuideView.vue`, any user-facing guide/reference copy that describes personas, default landing state, or the ERP page

**What to do:** Ensure the guide does not describe a live-login or live-ERP story that the UI no longer implements.

**Details:**

- Update persona descriptions to match the new default `Production Manager` starting point.
- Make sure operational page descriptions reflect real scoped behaviour.
- Keep `/admin/erp-connection` described as a mocked integration-status page.
- Do not describe live sync/auth behaviour if the demo is now fully local.

## Acceptance criteria

- The app boots with network disabled.
- The default persona is `Production Manager`.
- The default landing page is `/dashboard`.
- Persona switching works with network disabled.
- `Dashboard`, `People`, `Skills Matrix`, and `Training & Gap Actions` all respect the same hard scope rules.
- `Production Manager` sees only the three production teams in those operational views.
- `QHSE`, `HR Admin`, and `Leadership` see the full organisation in those operational views.
- `Roles` and `Role Detail` both work with network disabled and use local role resolution only.
- `Production Manager` has a real requirement set and does not appear as a broken/empty edge case.
- `/admin/erp-connection` loads from local mock data only.
- No user-facing O&G business-unit values reappear anywhere in the runtime demo path.
- No runtime demo path depends on `authApi`, `usersApi`, `employeesApi`, or `organizationApi`.
- `npm run type-check` passes.
- `npm run build` passes.

## Verification commands

- `npm run type-check`
- `npm run build`
- If the workspace still has an existing `dist/` write issue, use: `npm run build-only -- --outDir /tmp/training-build-phase-11`
- `rg -n "authApi|usersApi|employeesApi|organizationApi" src/stores src/views`
- Manual smoke test with network disabled across:
  - default boot into `Production Manager`
  - persona switching
  - Dashboard
  - People
  - Skills Matrix
  - Training & Gap Actions
  - My Competencies
  - Roles
  - Role Detail
  - ERP Connection

## Files modified

- `src/stores/auth.ts`
- `src/stores/employees.ts`
- `src/stores/skillsMatrix.ts`
- `src/stores/trainingNeeds.ts`
- `src/stores/roles.ts`
- `src/lib/demoDomain.ts`
- `src/views/DashboardView.vue`
- `src/views/PeopleView.vue`
- `src/views/SkillsMatrixView.vue`
- `src/views/TrainingNeedsView.vue`
- `src/views/MyCompetenciesView.vue`
- `src/views/RolesView.vue`
- `src/views/RoleDetailView.vue`
- `src/views/ErpConnectionView.vue`
- `src/views/GuideView.vue`
- `src/data/roleRequirements.json`
- `src/data/roleApplicability.json`
- `src/data/dashboardActivity.json` if names or events need aligning to the new roster

## Files created

- `src/data/employees.json`
- `src/data/erpConnectionStatus.json`
- `src/lib/demoScope.ts`

## Demo story

"This demo now runs entirely from a self-contained local AM manufacturing dataset. It opens as a Production Manager looking at three production teams, while QHSE, HR, Leadership, and System Admin each see the right level of visibility for their role. Roles, Role Detail, and even the ERP Connection page now work without any live dependency on external systems, so the story is coherent whether the demo is online or offline."
