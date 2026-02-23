# Demo Scope — Features to Build

This document defines the remaining features to implement for the demo.
**No "Add" flows.** Edit flows are in scope where noted. Keep everything wired to mock/local data.

---

## 0. User Switcher (Demo Persona Switcher)

**Affects:** `auth` store · `AppHeader` · `AppSidebar`

A persistent, always-visible switcher that lets the demo presenter instantly switch between three personas without logging out. This is the **first thing to build** because everything else (My Competencies, role-gated nav, evidence review) depends on which persona is active.

### The three personas

| Key | Display Name | Role | Job Title | Linked employee in mock data |
|-----|-------------|------|-----------|------------------------------|
| `employee` | Alex Morgan | `EMPLOYEE` | Maintenance Technician | First tech employee in the mock dataset |
| `manager` | Sarah Ahmed | `MANAGER` | Maintenance Supervisor | Manager employee in the mock dataset |
| `hr_admin` | Demo Admin | `HR_ADMIN` | HR Administrator | — (no linked ERP employee needed) |

### Where the switcher lives

A pill/segmented control in **`AppHeader`**, left of the notification bell. It shows three short labels — **Employee · Manager · HR Admin** — with the active one highlighted. Clicking any label calls `authStore.switchPersona(key)` and triggers a toast: *"Viewing as Sarah Ahmed (Manager)"*.

Do **not** put this inside the user dropdown — it needs to be immediately visible during a demo walkthrough.

### What changes on switch

| Thing that changes | Detail |
|--------------------|--------|
| `authStore.user.displayName` | Updates to the persona's name |
| `authStore.user.role` | Updates to `EMPLOYEE` / `MANAGER` / `HR_ADMIN` |
| `authStore.user.erpEmployeeId` | Set for Employee and Manager personas; `undefined` for HR Admin |
| `authStore.isAdmin` / `isManager` | Recompute automatically from `user.role` |
| Sidebar nav items | Role-gated (see below) |
| "My Competencies" view | Shows data for the active persona's linked employee |
| Evidence Review / N/A buttons | Only visible when `isManager` or `isAdmin` |
| Avatar initials (header + sidebar footer) | Reflect the active persona |

### Sidebar nav — role gating

| Nav item | Employee | Manager | HR Admin |
|----------|----------|---------|----------|
| My Competencies *(new)* | ✓ | — | — |
| Dashboard | — | ✓ | ✓ |
| Skills Matrix | — | ✓ | ✓ |
| People | — | ✓ | ✓ |
| Training Needs | ✓ *(own needs only)* | ✓ *(team view)* | ✓ |
| Awareness Topics | ✓ *(acknowledge tab)* | — | ✓ *(admin tab)* |
| Roles | — | — | ✓ |
| Competency Library | — | — | ✓ |
| Reference Lists | — | — | ✓ |
| ERP Connection | — | — | ✓ |

### Implementation notes

- Add a `DEMO_PERSONAS` constant map in `auth.ts` keyed by `'employee' | 'manager' | 'hr_admin'`
- Add `switchPersona(key: DemoPersonaKey)` action — directly mutates `user.value`, no API call, no page reload
- `AppSidebar` reads `authStore.userRole` to filter `navigationGroups` — make nav groups computed instead of a static `const`
- The existing `initializeAuth()` should default to `hr_admin` so the app loads the same as today when no persona is chosen

---

## 1. Employee Self-View — "My Competencies"

**New route:** `/my-competencies`

A read-only personal dashboard scoped to the logged-in employee.

### What to show
- **Header strip:** Job Title, Department, Business Unit, Manager name, IWA badge (Authorised / Not Authorised)
- **Requirements grouped by category** (Technical / Quality / Mandatory), each row showing:
  - Competency code + title
  - Status chip (Valid / Expiring / Expired / Required / In Progress / N/A)
  - Expiry date (if applicable), highlighted in amber when Expiring, red when Expired
  - System-generated **Action Required** text (same logic as Skills Matrix `topAction`)
- **Gating badge** on any gating requirement row
- **Expiring banner** at the top if any item is within 30 days

### What NOT to build
- No file upload — show a disabled "Submit Evidence" button as a placeholder
- No evidence history table

### Implementation notes
- Reuse `EmployeeMatrixRow` data from the skills matrix store — just pick one employee as the demo persona
- Add the route and a sidebar nav entry visible when logged in as Employee role

---

## 2. Awareness Acknowledgement — Employee Side

**Extend route:** `/awareness-topics` gains an employee tab

### What to show
- A simple list of topics assigned to the logged-in employee (from `awarenessTopics.json`)
- Each row: topic title, category, due date, status chip (Pending / Acknowledged)
- **Acknowledge button** per row — clicking it flips the row status to Acknowledged and shows a toast confirmation

### What NOT to build
- No targeting configuration
- No contractor/intern logic

### Implementation notes
- Add a local `acknowledged` Set in component state (or store) — no API call needed
- The admin tab (existing topic management list) stays unchanged

---

## 3. Evidence Review — Manager Sheet

**Extends:** Skills Matrix employee drawer and Training Needs details sheet

When a manager opens an employee's competence item that has status `IN_PROGRESS` or `REQUIRED`, they see a **Review Evidence** section:

- Evidence description (stubbed text — "Certificate upload pending review")
- Two buttons: **Accept** (marks item `VALID`, shows success toast) and **Reject** (opens a one-field reason input + confirm button, marks item back to `REQUIRED` with a toast)
- After Accept: the row in the matrix updates to `VALID` (reactive store update)
- After Reject: the reason is shown in a small inline note on the row

### What NOT to build
- No PASS/FAIL/LIMITED assessment outcome — that is out of scope for the demo click-through
- No file viewer

### Implementation notes
- Add `reviewEvidence(employeeId, competencyId, outcome: 'ACCEPT' | 'REJECT', reason?: string)` action to the skills matrix store — mutates the in-memory `EmployeeCompetenceItem`
- Wire into the employee drawer in `SkillsMatrixView` and into `TrainingNeedDetailsSheet`

---

## 4. N/A Exception — Manager Action

**Extends:** Skills Matrix employee drawer

On any competence item row in the drawer that is `REQUIRED` or `EXPIRED`, a manager can click **"Mark N/A"**, enter a justification, and confirm.

- The item's `derivedStatus` updates to `N_A` reactively
- A small italic justification note appears under the row
- The employee's authorisation status recomputes (N/A items do not block authorisation)

### Implementation notes
- Add `markNotApplicable(employeeId, competencyId, justification: string)` to the skills matrix store
- Show the action only when `isManager` or `isAdmin` is true

---

## 5. Role Requirement — Edit Row

**Extends:** `RoleDetailView` → Requirements tab

The existing table has Edit/Remove menu items that do nothing. Wire up **Edit only**.

### Edit sheet fields (same component pattern as `CompetencyFormSheet`)
- Risk Level (select)
- Mandatory toggle
- Gating toggle
- Training Type (select)
- Assessment Method (select)

On save: update the row in `store.roleRequirements` reactively and show a toast.

### What NOT to build
- No Add flow (button can remain visible but disabled or removed)
- No Remove — remove the menu item entirely to keep the demo clean
- No Publish / versioning

---

## 6. Training Need — Status Progression

**Extends:** `TrainingNeedDetailsSheet` (already partially built)

The sheet already has a `selectedPath` radio and form. Ensure these three paths actually work end-to-end:

| Path | What happens on Submit |
|------|------------------------|
| `UPLOAD` | Training need status → `IN_PROGRESS`, toast "Evidence submitted for review" |
| `EXTERNAL_REF` | Same status change + stores the reference string on the need |
| `SCHEDULE` | Status → `IN_PROGRESS`, stores scheduled date |

After submission the row in `TrainingNeedsView` should reflect the new status without a page reload.

### What NOT to build
- No real file upload
- No evidence file viewer

---

## 7. Awareness Topics — Create Topic Form (Admin)

The **Create Topic** button already exists in `AwarenessTopicsView`. Wire it to a slide-over sheet.

### Form fields
- Title (text)
- Category (select: Policy / Safety / HR / Quality)
- Target Audience (select: All Staff with Manager / Operations / QHSE)
- Due Date (date picker)

On save: push new topic to the local array and close sheet. Show success toast.

This is the one "add" flow included because the admin view is otherwise completely static.

---

## 8. Computed AUTO Fields — Responsible

**Extends:** Skills Matrix summary table and employee drawer

Add a **Responsible** column/field alongside the existing `topAction`:

| Condition | Responsible |
|-----------|-------------|
| Status is `REQUIRED` (never started) | Employee |
| Status is `IN_PROGRESS` (evidence submitted) | Manager |
| Status is `EXPIRED` on a gating item | Manager |
| Status is `EXPIRING` | Employee |

- Compute this in the skills matrix store as `responsibleParty` on `EmployeeCompetenceItem`
- Show it in the drawer competency list and in the Skills Matrix summary table (new column, narrow)

---

## Out of scope for demo

- File upload (real)
- Audit log
- Publish / version role requirements
- ERP hierarchy (direct vs all-level team toggle)
- Notification system
- Expiry threshold configuration
- Evidence attached to multiple requirements
- Completion milestone history
