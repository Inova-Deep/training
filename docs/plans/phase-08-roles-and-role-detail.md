# Phase 8 — Roles & Role Detail Enrichment

## Goal

Make Roles feel like controlled competence profiles with readiness metrics, and turn the Role Detail page into a hero demo screen showing requirements, assigned people, risk, and linked awareness for any given role.

## Punch list alignment

- Section 6: Roles — list view columns, filters, actions
- Section 7: Role Detail — role summary, required competencies, assigned people, risk summary, linked awareness, readiness score

## Prerequisites

- Phase 0 complete (expanded competency catalogue, AM role requirement sets)
- Phase 2 complete (supervised work status, supervisionStatus on EmployeeMatrixRow)

## Tasks

### 8.1 Enrich the Roles list view

**Files:** `src/views/RolesView.vue`

**What to do:** Expand the role list table to include readiness and risk columns.

**Details:**

Current columns: Role Name, Department, Competencies, People, Actions

New columns:

| Column | Content |
|--------|---------|
| Role Name | Role title |
| Department | Department name |
| Assigned People | Count of people with this job title |
| Fully Compliant | Count where all requirements met (isAuthorised === true) |
| With Gaps | Count where any requirement is REQUIRED or EXPIRED |
| Under Supervision | Count where supervisionStatus === 'SUPERVISED' |
| Expiring Items | Count of people with any EXPIRING competency in this role |
| Risk | Badge: Critical (>50% not compliant), High (>30%), Moderate (>10%), Low |

Data source: cross-reference `roleRequirements.json` role sets against `skillsMatrix` store's employee matrix rows, grouped by job title.

**Risk indicator computation logic:**

| Risk level | Condition |
|-----------|-----------|
| Critical | Any safety-critical gating competency has a gap rate >25% (i.e. >25% of assigned people are missing it) |
| High | Any gating (non-safety-critical) competency has a gap rate >25% |
| Moderate | Any mandatory competency has a gap rate >25% |
| Low | No mandatory or gating competency has a gap rate >25% |

"Gap rate" = (count of employees where status is EXPIRED or REQUIRED) / (total assigned employees).
Evaluate conditions in priority order: Critical overrides High, which overrides Moderate.

---

### 8.2 Add filters to Roles list

**Files:** `src/views/RolesView.vue`

**What to do:** Add filter dropdowns above the roles table.

**Details:**

Filters:
- Department (All / Additive Manufacturing / Welding & Fabrication / Robotics / Materials Testing / Quality Assurance / HSE / Operations)
- Critical roles only (switch toggle — shows only roles with Critical or High risk)
- Roles with open gaps (switch toggle)
- Roles with expiring mandatory items (switch toggle)

---

### 8.3 Redesign Role Detail — Role Summary section

**Files:** `src/views/RoleDetailView.vue`

**What to do:** Add a prominent role summary card at the top of the page.

**Details:**

Role summary card fields:

| Field | Content |
|-------|---------|
| Role Name | From job title |
| Department | From role requirement set or job title data |
| Role Purpose | Short description (mock, e.g. "Operates and maintains additive manufacturing equipment...") |
| Criticality | Badge: Critical / High / Standard |
| Assigned People | Count |
| Fully Ready | Count (all requirements met) |
| Under Supervision | Count |
| Readiness Score | Percentage = (fully ready / assigned) × 100, shown as progress bar |

Place this above the existing tabs.

---

### 8.4 Enhance Required Competencies tab

**Files:** `src/views/RoleDetailView.vue`

**What to do:** Expand the requirements table with additional columns matching punch list section 7.

**Details:**

| Column | Content |
|--------|---------|
| Code | Competency code |
| Item | Competency title |
| Type | Skill / Training / Certification / etc. |
| Category | Category badge (AM categories) |
| Required Level | "Required" / "Gating" badge |
| Mandatory | Flag badge if mandatory |
| Reassessment Interval | e.g. "12 months", "24 months", "No expiry" |
| Team Status | Mini summary: "3/5 met" or progress indicator |

---

### 8.5 Add Assigned People tab

**Files:** `src/views/RoleDetailView.vue`

**What to do:** Add a new tab showing all employees assigned to this role with their competence status.

**Details:**

Tab: "Assigned People"

Table columns:

| Column | Content |
|--------|---------|
| Name | Employee name |
| Current Status | IWA badge (Authorised / Under Supervision / Not Authorised) |
| Gap Count | Number of requirements not met |
| Supervised Items | Count of UNDER_SUPERVISION items |
| Expiry Issues | Count of EXPIRING or EXPIRED items |
| Readiness | Percentage of requirements met |
| Actions | View profile (link to person detail or My Competencies) |

Data source: filter `skillsMatrix` store employees where job title matches this role's job title.

---

### 8.6 Add Role Risk Summary section

**Files:** `src/views/RoleDetailView.vue`

**What to do:** Add a risk summary section showing the highest-risk missing requirements and common gaps across the assigned team.

**Details:**

Two sub-sections:

**Highest-Risk Missing Requirements:**
- List competencies where the most assigned people have gaps
- Show: competency title, gap count (e.g. "3 of 5 people missing"), gating flag, severity badge

**Common Gaps Across Team:**
- Show competencies where ≥50% of assigned people have a gap
- Show: competency title, percentage missing, recommended action

Render as a card below the tabs or as a dedicated tab.

---

### 8.7 Add Linked Awareness & Mandatory Communications section

**Files:** `src/views/RoleDetailView.vue`

**What to do:** Show awareness topics that target this role's job title.

**Details:**

Filter `awarenessTopics.json` where `requiredAudience` includes this role's job title or "All Employees".

Table columns:
- Topic title
- Topic type badge
- Effective date
- Completion status (e.g. "3/5 acknowledged")
- Delivery method

---

### 8.8 Add AM-specific role data

**Files:** `src/data/roleRequirements.json`

**What to do:** Ensure the role requirement sets include the AM-oriented roles from the punch list.

**Details:**

Roles to ensure are present (some may already exist from Phase 0):
- Additive Manufacturing Technician
- Welding / Fabrication Technician
- Robotics Operator
- Materials Testing Technician
- QA Inspector

Each should have a meaningful set of required competencies drawn from the expanded catalogue:
- AM Technician: additive manufacturing machine setup, materials/powder handling, materials traceability, LOTO, PPE, HSE induction, robot cell operation
- Welding Technician: coded welder qualification, weld procedure awareness, abrasive tools, LOTO, PTW, PPE, HSE induction
- Robotics Operator: robot cell operation, robot programming basics, LOTO, PTW, PPE, HSE induction
- Materials Testing Technician: materials testing method awareness, tensile/hardness/dimensional inspection, materials traceability, PPE, HSE induction
- QA Inspector: internal audit, root cause analysis, CAPA, NCR, document control, HSE induction

---

## Acceptance criteria

- [ ] Roles list shows readiness and risk columns with correct counts
- [ ] Risk badge computes correctly (Critical / High / Moderate / Low)
- [ ] Filters for department, critical roles, gaps, and expiring items work
- [ ] Role Detail shows prominent summary card with readiness score
- [ ] Required Competencies tab shows expanded columns including type, category, mandatory, reassessment interval
- [ ] Assigned People tab shows all employees for this role with status and gap data
- [ ] Role Risk Summary shows highest-risk missing requirements and common gaps
- [ ] Linked Awareness section shows relevant awareness topics
- [ ] AM-oriented roles have complete requirement sets
- [ ] The app builds and runs without errors

## Files modified

- `src/views/RolesView.vue`
- `src/views/RoleDetailView.vue`
- `src/data/roleRequirements.json` (if not already done in Phase 0)

## Files created

None.

## Demo story

"For any role — Additive Manufacturing Technician, Welding Technician, Robotics Operator — I can see who's assigned, who's ready, who's supervised, and the biggest risks. Here's the Welding Technician role: 5 people assigned, readiness score 60%. The risk summary shows coded welder qualification is the highest-risk gap — 2 of 5 people are missing it, and it's a gating item. Common gaps include abrasive tools and weld procedure awareness. The linked awareness section shows a welding procedure revision briefing is in communication — 3 of 5 have acknowledged."
