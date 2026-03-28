# Phase 6 — Skills Matrix Enhancements

## Goal

Make the skills matrix the digital expression of the DML spreadsheet model with clear required/current/gap modes, AM-specific categories, a status legend, and improved cell drill-down.

## Punch list alignment

- Section 4: Skills Matrix — mode toggle, categories, filters, visual rules, drill-down, demo data

## Prerequisites

- Phase 2 complete (supervised work status in matrix store, UNDER_SUPERVISION cells)

## Tasks

### 6.1 Add mode toggle

**Files:** `src/views/SkillsMatrixView.vue`

**What to do:** Replace the current "Employee Summary / Requirement Grid" toggle with a 3-mode toggle: Requirements / Current / Gap Analysis.

**Details:**

| Mode | What grid cells show | Use case |
|------|---------------------|----------|
| Requirements | What is required per role — cells show "Required" / "Gating" / "N/A" based on roleRequirements data | "What do we need?" |
| Current | Current assessed status per person — cells show VALID / UNDER_SUPERVISION / EXPIRED / etc. (existing behaviour) | "What do we have?" |
| Gap Analysis | Delta — cells only highlight where a gap exists (REQUIRED, EXPIRED, UNDER_SUPERVISION, EXPIRING) — everything else is greyed/empty | "Where are the problems?" |

Implementation:
- Add a `matrixMode` ref: `'requirements' | 'current' | 'gap'`
- In the grid cell rendering, switch cell content based on mode
- Requirements mode needs to cross-reference `roleRequirements.json` by job title → competency to determine what is required vs. N/A
- Gap mode applies a CSS class to suppress cells that are VALID or N_A, highlighting only problematic cells

The "Employee Summary" table remains available as a 4th option or is always visible above the grid.

---

### 6.2 Update category grouping

**Files:** `src/views/SkillsMatrixView.vue`, `src/stores/skillsMatrix.ts`

**What to do:** Expand from 3 categories (Technical, Quality, Mandatory) to the 8 AM-oriented categories.

**Details:**

New category order (all 12 from punch list section 4):
1. Mandatory
2. Additive Manufacturing Operations
3. Welding & Fabrication
4. Robotics & Automation
5. Materials & Powder Handling
6. Materials Testing & Inspection
7. Quality
8. Health & Safety
9. Regulatory Compliance
10. Workshop
11. Plant & Machinery
12. Business / Systems

Categories with no current demo data (Regulatory Compliance, Workshop, Plant & Machinery, Business / Systems) should still render as collapsible group headers in the grid — they will show as empty but confirm the framework is present.

Update `CompetencyCategory` type union in `skillsMatrix.ts`.
Update `expandedCategories` default to include all categories.
Update `CATEGORY_OPTIONS` in the view.
Update the grid header rendering to handle more groups.

---

### 6.3 Add status legend

**Files:** `src/views/SkillsMatrixView.vue`

**What to do:** Add a collapsible legend bar below the filter bar.

**Details:**

| Status | Colour | Symbol | Meaning |
|--------|--------|--------|---------|
| Valid | Green | Filled circle | Competence confirmed, within validity |
| Under Supervision | Amber | Eye icon | Competence in progress, supervised work only |
| In Progress | Blue | Half circle | Training or assessment underway |
| Required | Red outline | Empty circle | Not yet started |
| Expiring | Yellow | Warning triangle | Within 30 days of expiry |
| Expired | Red | X circle | Past expiry, lapsed |
| N/A | Grey | Dash | Not applicable to this role |

Render as a horizontal strip of colour swatches + labels. Collapsible via a "Legend" toggle button.

---

### 6.4 Improve cell drill-down

**Files:** `src/views/SkillsMatrixView.vue`

**What to do:** When clicking a cell in the grid, show a popover or sheet with detailed information about that specific employee × competency combination.

**Details:**

Drill-down content:
- Competency title and code
- Category
- Required status (from role requirements) and gating flag
- Current assessed status
- Last assessment date
- Evidence reference (e.g. "EV-1001-WELD")
- Assessor (mock: supervisor name)
- Next reassessment due date (expiry date)
- Source of requirement (role requirement set ID / job title)

If using the existing StatusChip popover, enhance it with these fields.
If that is too limited, open a small Sheet with the full detail.

---

### 6.5 Add "Under Supervision Only" and "Critical Activities Only" filters

**Files:** `src/views/SkillsMatrixView.vue`

**What to do:** Add two switch toggles.

**Details:**

**Under Supervision Only:**
- Add alongside existing "Gating Only" and "Issues Only" toggles
- Label: "Under Supervision Only"
- Logic: filters `filteredEmployees` to those where `supervisionStatus === 'SUPERVISED_ONLY'`

**Critical Activities Only:**
- Add as a second toggle
- Label: "Critical Activities Only"
- Logic: filters the competency columns to those where `riskLevelCode === 'HIGH_CRITICAL'` or `safetyCritical === true` in the competency catalogue
- When active, only safety-critical and gating competency columns are shown; all others are hidden

---

### 6.6 Add vacancy rows

**Files:** `src/views/SkillsMatrixView.vue`, `src/stores/skillsMatrix.ts`

**What to do:** For every role requirement set that has no assigned employees, show a placeholder row in the grid clearly marked as a vacancy.

**Details:**

Logic:
1. Get all job titles that have a `roleRequirements.json` entry
2. Cross-reference against the employee list
3. Any job title with a requirement set but zero employees → generate a vacancy row

Vacancy row appearance:
- Name column: "Vacancy — [Role Name]" (e.g. "Vacancy — Robotics Operator")
- Show an optional "Est. Start" field if available (mock data only — e.g. "Q2 2026")
- All competency cells show "REQUIRED" for items that are required for this role
- Background: slightly different shade (dashed or muted row styling) to visually distinguish from employee rows
- No authorisation status badge (or show "Unfilled")

This allows a supervisor to see: "We have no one qualified for Robot Cell Operation, and this vacancy opens in June."

---

### 6.7 Add team readiness summary

**Files:** `src/views/SkillsMatrixView.vue`

**What to do:** Above the matrix table, add a summary grouped by job title showing readiness.

**Details:**

Use the existing `groupedByJobTitle` computed property.

Display a row per job title:

| Job Title | People | Authorised | Supervised | Not Authorised | Readiness % |
|-----------|--------|-----------|-----------|---------------|-------------|
| Welding Technician | 5 | 3 | 1 | 1 | 60% |
| AM Technician | 3 | 2 | 0 | 1 | 67% |
| ... | ... | ... | ... | ... | ... |

Render readiness % as a small progress bar or coloured text.

Collapsible — show/hide via a "Team Readiness" toggle.

---

### 6.8 Update hardcoded filter values

**Files:** `src/views/SkillsMatrixView.vue`

**What to do:** Update the hardcoded JOB_TITLES, DEPARTMENTS, BUSINESS_UNITS arrays to include AM-specific roles.

**Details:**

JOB_TITLES — add:
- Additive Manufacturing Technician
- Welding / Fabrication Technician
- Robotics Operator
- Materials Testing Technician

DEPARTMENTS — add:
- Additive Manufacturing
- Welding / Fabrication
- Robotics
- Materials Testing
- Quality Assurance

BUSINESS_UNITS: keep existing (Upstream, Midstream, Downstream, Corporate) or adjust to DML-appropriate values if needed.

---

## Acceptance criteria

- [ ] 3-mode toggle renders and switches between Requirements / Current / Gap views
- [ ] Requirements mode shows what is required per role with gating indicators
- [ ] Gap mode highlights only problematic cells
- [ ] All 12 category groups render in the grid header (including empty groups for Regulatory Compliance, Workshop, Plant & Machinery, Business / Systems)
- [ ] Vacancy rows render for roles with no assigned employees, showing required items
- [ ] "Critical Activities Only" toggle filters columns to safety-critical items only
- [ ] Legend bar is visible and collapsible
- [ ] Clicking a cell shows detailed drill-down information
- [ ] "Under Supervision Only" filter works
- [ ] Team readiness summary displays per job title with readiness %
- [ ] Filter dropdowns include AM-specific roles and departments
- [ ] The app builds and runs without errors

## Files modified

- `src/views/SkillsMatrixView.vue`
- `src/stores/skillsMatrix.ts`

## Files created

None.

## Demo story

"The matrix has three views. Requirements view shows what each role needs — you can see the Welding Technician requires coded welder qualification, robot awareness, and all the mandatory HSE items. Current view shows what each person actually holds — green for valid, amber for supervised, red for expired. Gap Analysis view strips away everything that's fine and highlights only the problems. Categories match our AM operations: Welding & Fabrication, Robotics & Automation, Materials Testing. The team readiness summary at the top shows the Welding team is at 60% — three authorised, one supervised, one not authorised."
