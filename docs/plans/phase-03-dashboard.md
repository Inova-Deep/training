# Phase 3 — Dashboard Rework

## Goal

Transform the dashboard from a simple KPI summary into a management control room for operational readiness and compliance risk, with AM-specific charts and data.

## Punch list alignment

- Section 2: Dashboard — widgets, charts, table/card sections, UI/UX changes, demo data

## Prerequisites

- Phase 2 complete (supervised work status available in stores)
- Decision D1 locked (charting library — recommended: Chart.js via `vue-chartjs`)

## Tasks

### 3.1 Install charting library

**Files:** `package.json`

**What to do:** Install Chart.js and its Vue wrapper.

```bash
npm install chart.js vue-chartjs
```

---

### 3.2 Redesign KPI grid

**Files:** `src/views/DashboardView.vue`

**What to do:** Replace current 6 KPI cards with 8 readiness/risk-oriented cards.

**Details:**

| Card | Icon | Data source | Subtitle |
|------|------|------------|----------|
| Open Competence Gaps | AlertTriangle | summaryStats.totalRequired + summaryStats.totalExpired | "Requiring action" |
| Personnel Under Supervision | Eye | summaryStats.totalSupervised | "Awaiting independent work sign-off" |
| Not Authorised | UserX | summaryStats.notAuthorised | "Gating requirements not met" |
| Certifications Expiring (30d) | Clock | summaryStats.totalExpiring | "Expiring within 30 days" |
| Certifications Expiring (60d) | Clock | summaryStats.totalExpiring60 | "Expiring within 60 days" |
| NCR/CAPA-Linked Actions | FileWarning | trainingNeeds filtered by sourceType NCR_CAPA, status OPEN | "Open corrective actions" |
| Awareness Pending | Megaphone | count of active awareness topics with < 100% completion | "Awaiting acknowledgement" |
| Critical Roles at Risk | ShieldAlert | count of roles where > 50% of employees are not authorised | "Roles below readiness threshold" |
| Overdue Reassessments | RefreshCw | trainingNeeds where status OPEN and dueDate < today | "Past due date" |

---

### 3.3 Create chart components

**Files:** Create new files in `src/components/dashboard/`

**What to do:** Create 4 small chart components. Each receives data as props.

| Component file | Chart type | Data |
|---------------|-----------|------|
| `GapByDepartmentChart.vue` | Horizontal bar | Gap count per department from matrix store |
| `GapByCategoryChart.vue` | Donut | Gap count per competency category from matrix store |
| `SourceBreakdownChart.vue` | Donut | Training needs grouped by sourceType |
| `RoleReadinessChart.vue` | Stacked bar | Per role: authorised / supervised / not authorised counts |
| `ExpiryTrendChart.vue` | Line | 12-month certifications expiry count — past 6 months (actual) + next 6 months (forecast) |

The expiry trend chart uses mock monthly data: generate counts per month based on competency expiry dates from the matrix store. For past months, group actual expired items by month. For future months, group items with expiry dates in the next 6 months. This shows whether the expiry problem is improving or worsening.

Each component:
- Accepts a `data` prop (array of { label, value } or similar)
- Uses `vue-chartjs` Bar/Doughnut/Pie component
- Has a card wrapper with title
- Renders a reasonable size (~250px height)

---

### 3.4 Add charts section to dashboard

**Files:** `src/views/DashboardView.vue`

**What to do:** Add a 2x2 chart grid below the KPI cards.

**Details:**

Layout:
```
[Gap by Department]  [Gap by Category]
[Source Breakdown]    [Role Readiness]
[Expiry Trend (full width — line chart)]
```

Each chart card has a title and the chart component. Data is computed from stores.
The expiry trend line chart spans the full width at the bottom of the chart grid.

---

### 3.5 Redesign list sections

**Files:** `src/views/DashboardView.vue`

**What to do:** Replace current "Not Authorised" and "Expiring Soon" lists with 4 AM-specific list sections.

**Details:**

| Section | Content | Items | Badge |
|---------|---------|-------|-------|
| Highest-Risk Open Gaps | Top 5 items: gating competencies that are EXPIRED or REQUIRED | Employee, competency, risk level, days overdue | badge-critical |
| People Under Supervised Work | Top 4 employees where supervisionStatus === 'SUPERVISED' | Name, job title, supervised item count | badge-supervised |
| Procedure Changes Awaiting Acknowledgement | Active awareness topics with completion < 100% | Topic title, completion %, audience | badge-warning |
| Overdue Competence Reviews | Top 4 training needs past due date | Employee, competency, days overdue, source | badge-critical |

---

### 3.6 Add filters

**Files:** `src/views/DashboardView.vue`

**What to do:** Add a filter bar at the top of the dashboard.

**Details:**

Filters:
- Department selector (from employees store departments)
- Role selector (from job titles)
- "My Team" toggle (for manager/supervisor persona — filter to direct reports if manager data available)

When a filter is active, all KPI cards, charts, and lists re-compute based on the filtered employee set.

---

### 3.7 Make widgets click-through

**Files:** `src/views/DashboardView.vue`

**What to do:** Each KPI card navigates to the relevant page with a pre-applied filter when clicked.

**Details:**

| KPI Card | Route | Pre-applied filter |
|----------|-------|--------------------|
| Open Competence Gaps | /training-needs | status=OPEN |
| Personnel Under Supervision | /skills-matrix | underSupervisionOnly=true |
| Not Authorised | /skills-matrix | gatingOnly=true |
| Certifications Expiring | /skills-matrix | status=EXPIRING |
| NCR/CAPA-Linked Actions | /training-needs | source=NCR_CAPA |
| Awareness Pending | /awareness-topics | (admin view) |
| Critical Roles at Risk | /roles | (critical only toggle) |
| Overdue Reassessments | /training-needs | overdue=true |

Implementation: wrap each KPI card in a `<router-link>` or add `@click="router.push(...)"`. Store the intended filter in query params or set it via store action before navigating.

---

## Acceptance criteria

- [ ] 8 KPI cards display correct values computed from stores
- [ ] 5 chart components render with real data from stores (including expiry trend line chart)
- [ ] Charts respond to dashboard filter changes
- [ ] 4 list sections show AM-relevant data (no generic examples)
- [ ] Department and Role filter dropdowns work
- [ ] Clicking a KPI card navigates to the correct page
- [ ] Dashboard loads without errors when switching between personas
- [ ] Activity feed shows AM-specific messages (from Phase 1.6)

## Files modified

- `src/views/DashboardView.vue`

## Files created

- `src/components/dashboard/GapByDepartmentChart.vue`
- `src/components/dashboard/GapByCategoryChart.vue`
- `src/components/dashboard/SourceBreakdownChart.vue`
- `src/components/dashboard/RoleReadinessChart.vue`
- `src/components/dashboard/ExpiryTrendChart.vue`

## Demo story

"The dashboard is a management control room. Top line: 12 open competence gaps, 4 people under supervision awaiting sign-off, 2 NCR-linked corrective actions open. The bar chart shows Welding & Fabrication has the most gaps. The donut shows most training needs come from expiry renewals and NCR root causes. I can click 'Not Authorised' and go straight to the matrix filtered to gating failures."
