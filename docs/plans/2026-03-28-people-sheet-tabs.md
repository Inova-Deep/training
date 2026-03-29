# Person Sheet Tab Fill-In Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the placeholder Competencies and Training History tabs in PersonDetailDrawer.vue with fully populated, data-driven content.

**Architecture:** The drawer already has the tabbed shell, summary card, and Profile tab built out. The Competencies tab gets a dense table showing all competence items for the employee, filtered by a local filter toggle. The Training History tab gets three stacked sections (Evidence Records, Training Needs, Awareness Topics) with timeline-style cards. All data comes from existing stores and JSON files already imported in the component.

**Tech Stack:** Vue 3 SFC, shadcn-vue (Table, Card, Button, Badge classes), Pinia (skillsMatrix, trainingNeeds), TypeScript, existing semantic CSS from `src/main.css`.

---

## Constraints

- **RULE 1**: shadcn-vue components only. ZERO raw `<table>`, `<button>`, `<input>` in templates.
- **RULE 2**: Semantic CSS classes from `src/main.css` only. ZERO Tailwind in `<template>`.
- **RULE 3**: Light theme only.
- **RULE 4**: Design tokens only, no magic numbers.
- **RULE 5**: ARIA labels on all icon-only buttons.
- No new store files. Reuse `useSkillsMatrixStore`, `useTrainingNeedsStore`, existing JSON imports.
- No test harness exists. Verify with `npm run type-check` and `npm run build`.

## Data Sources Available

### Already imported and computed in PersonDetailDrawer.vue

| Computed | Type | Description |
|---|---|---|
| `competencyRows` | `CompetencyTableRow[]` | All competencies: `competencyId`, `code`, `title`, `isGating`, `derivedStatus`, `isGap`. Sorted gating-first, then by code. |
| `openGaps` | `CompetencyTableRow[]` | Rows where `isGap === true` |
| `evidenceRecords` | `EvidenceRecord[]` | All evidence sorted by `issueDate` desc. Fields: `id`, `title`, `type`, `competencyCode`, `issuer`, `issueDate`, `expiryDate`, `reviewStatus` |
| `relevantAwarenessTopics` | `{ topic: AwarenessTopic; acknowledged: boolean }[]` | Topics matching employee's role/dept |
| `canTakeAction` | `boolean` | Whether current user is MANAGER/HR_ADMIN/ADMIN |
| `matrixRow` | `EmployeeMatrixRow \| null` | Full matrix row |

### To add

| Source | How |
|---|---|
| Training needs per employee | Import `useTrainingNeedsStore`, filter `trainingNeeds` by `erpEmployeeId === employee.id` |
| Competency details (category, riskLevel) | Use `matrixStore.getCompetencyById(compId)` on each row |

### Existing helper functions (reuse as-is)

- `statusBadgeClass(status)` → `'badge-success'` | `'badge-warning'` | `'badge-critical'` | `'badge-neutral'` | `'badge-primary'`
- `statusLabel(status)` → `'Valid'` | `'Expiring'` | `'Expired'` | `'Required'` | `'In Progress'` | `'Under Supervision'`
- `gapSeverityClass(row)` / `gapSeverityLabel(row)` → severity badge

### Interfaces needed from stores

```ts
// From skillsMatrix store — already used
interface EmployeeCompetenceItem {
  employeeId: string
  competencyId: string
  status: CompetenceStatus
  expiryDate?: string
  lastCompletedAt?: string
  evidenceRef?: string
  isGating: boolean
  derivedStatus: DerivedStatus
}

interface Competency {
  id: string; code: string; title: string; category: CompetencyCategory
  riskLevel: RiskLevel; requiresExpiry: boolean; isGatingDefault: boolean
}

// From trainingNeeds store
interface TrainingNeed {
  id: string
  erpEmployeeId: string
  employeeCompetenceItemId?: string
  trainingTypeCode: string
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  dueDate?: string
  sourceType?: TrainingNeedSource
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  workflowStatus?: TrainingNeedWorkflowStatus
  createdReason?: string
}
```

---

## Task 1: Add Training Needs Data Source

**Files:**
- Modify: `src/components/people/PersonDetailDrawer.vue`

**Step 1: Import the training needs store**

Add after the existing `useSkillsMatrixStore()` line:

```ts
import { useTrainingNeedsStore } from '@/stores/trainingNeeds'

const trainingNeedsStore = useTrainingNeedsStore()
```

**Step 2: Add employee-scoped training needs computed**

```ts
const employeeTrainingNeeds = computed(() => {
  if (!props.employee) return []
  return trainingNeedsStore.trainingNeeds.filter(
    (tn) => tn.erpEmployeeId === props.employee!.id,
  )
})

const openTrainingNeeds = computed(() =>
  employeeTrainingNeeds.value.filter((tn) => tn.status === 'OPEN' || tn.status === 'IN_PROGRESS'),
)

const completedTrainingNeeds = computed(() =>
  employeeTrainingNeeds.value.filter((tn) => tn.status === 'COMPLETED'),
)
```

**Step 3: Add competency detail enrichment computed**

Each `competencyRows` entry already has `competencyId`. Enrich with category and risk level:

```ts
interface EnrichedCompetencyRow {
  competencyId: string
  code: string
  title: string
  isGating: boolean
  derivedStatus: string
  isGap: boolean
  category: string
  riskLevel: string
  expiryDate?: string
  lastCompletedAt?: string
}

const enrichedCompetencyRows = computed((): EnrichedCompetencyRow[] => {
  return competencyRows.value.map((row) => {
    const comp = matrixStore.getCompetencyById(row.competencyId)
    const item = matrixRow.value?.competenceItems.get(row.competencyId)
    return {
      ...row,
      category: comp?.category ?? '—',
      riskLevel: comp?.riskLevel ?? '—',
      expiryDate: item?.expiryDate,
      lastCompletedAt: item?.lastCompletedAt,
    }
  })
})
```

**Step 4: Add filter state for competency table**

```ts
const competencyFilter = ref<'all' | 'gaps' | 'gating' | 'valid'>('all')

const filteredCompetencyRows = computed(() => {
  switch (competencyFilter.value) {
    case 'gaps':
      return enrichedCompetencyRows.value.filter((r) => r.isGap)
    case 'gating':
      return enrichedCompetencyRows.value.filter((r) => r.isGating)
    case 'valid':
      return enrichedCompetencyRows.value.filter((r) => r.derivedStatus === 'VALID')
    default:
      return enrichedCompetencyRows.value
  }
})
```

**Step 5: Verify compilation**

Run: `npm run type-check`
Expected: PASS

**Step 6: Commit**

```bash
git add src/components/people/PersonDetailDrawer.vue
git commit -m "feat(person-sheet): add training needs data and competency enrichment"
```

---

## Task 2: Build The Competencies Tab

**Files:**
- Modify: `src/components/people/PersonDetailDrawer.vue`

**Step 1: Add competency tab summary KPIs**

Replace the entire `<TabsContent value="competencies">` block with:

```vue
<TabsContent value="competencies" class="person-sheet-tab-content">
  <div class="person-sheet-stack">
    <div class="person-sheet-kpis">
      <Card class="kpi-card">
        <CardContent class="data-card-content">
          <div class="kpi-card-header">
            <span class="kpi-card-title">Total</span>
          </div>
          <div class="kpi-card-value">{{ enrichedCompetencyRows.length }}</div>
        </CardContent>
      </Card>
      <Card class="kpi-card">
        <CardContent class="data-card-content">
          <div class="kpi-card-header">
            <span class="kpi-card-title">Valid</span>
          </div>
          <div class="kpi-card-value">{{ enrichedCompetencyRows.filter(r => r.derivedStatus === 'VALID').length }}</div>
        </CardContent>
      </Card>
      <Card class="kpi-card">
        <CardContent class="data-card-content">
          <div class="kpi-card-header">
            <span class="kpi-card-title">Open Gaps</span>
          </div>
          <div class="kpi-card-value">{{ openGaps.length }}</div>
        </CardContent>
      </Card>
      <Card class="kpi-card">
        <CardContent class="data-card-content">
          <div class="kpi-card-header">
            <span class="kpi-card-title">Gating Failures</span>
          </div>
          <div class="kpi-card-value">{{ restrictionItems.length }}</div>
        </CardContent>
      </Card>
    </div>

    <div class="toolbar">
      <div class="toolbar-filters">
        <Button
          v-for="opt in [
            { value: 'all', label: 'All' },
            { value: 'gaps', label: 'Open Gaps' },
            { value: 'gating', label: 'Gating' },
            { value: 'valid', label: 'Valid' },
          ]"
          :key="opt.value"
          :variant="competencyFilter === opt.value ? 'default' : 'outline'"
          size="sm"
          @click="competencyFilter = opt.value as typeof competencyFilter"
        >
          {{ opt.label }}
        </Button>
      </div>
    </div>

    <Card class="data-card">
      <CardContent class="data-card-content">
        <div class="table-wrapper">
          <Table class="dense-table">
            <TableHeader>
              <TableRow>
                <TableHead>Competency</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Gating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Assessed</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead class="table-actions-header">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="filteredCompetencyRows.length === 0">
                <TableCell colspan="8" class="empty-cell">
                  No competencies match the selected filter.
                </TableCell>
              </TableRow>
              <TableRow
                v-for="row in filteredCompetencyRows"
                :key="row.competencyId"
              >
                <TableCell>
                  <div>
                    <span class="person-sheet-code">{{ row.code }}</span>
                    <span class="person-sheet-row-title">{{ row.title }}</span>
                  </div>
                </TableCell>
                <TableCell>{{ row.category }}</TableCell>
                <TableCell>
                  <span
                    class="badge"
                    :class="row.riskLevel === 'HIGH_CRITICAL' ? 'badge-critical' : row.riskLevel === 'MEDIUM' ? 'badge-warning' : 'badge-neutral'"
                  >
                    {{ row.riskLevel === 'HIGH_CRITICAL' ? 'High' : row.riskLevel === 'MEDIUM' ? 'Medium' : 'Low' }}
                  </span>
                </TableCell>
                <TableCell>
                  <span v-if="row.isGating" class="badge badge-primary">Gating</span>
                  <span v-else class="person-sheet-text">—</span>
                </TableCell>
                <TableCell>
                  <span class="badge" :class="statusBadgeClass(row.derivedStatus)">
                    {{ statusLabel(row.derivedStatus) }}
                  </span>
                </TableCell>
                <TableCell>{{ row.lastCompletedAt ?? '—' }}</TableCell>
                <TableCell>{{ row.expiryDate ?? '—' }}</TableCell>
                <TableCell class="table-actions-cell">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="icon" class="table-action-btn" aria-label="Competency actions">
                        <MoreHorizontal class="icon-xs" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="toast.info('Assessment recording coming soon')">
                        Record Assessment
                      </DropdownMenuItem>
                      <DropdownMenuItem v-if="row.isGap && canTakeAction" @click="toast.info('Intervention assignment coming soon')">
                        Assign Intervention
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click="toast.info('Evidence upload coming soon')">
                        Upload Evidence
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</TabsContent>
```

**Step 2: Add required imports**

Ensure these are in the `<script setup>` imports:

```ts
import { MoreHorizontal } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
```

**Step 3: Add CSS for competency code + title layout**

In `<style scoped>`, add:

```css
.competency-code-title {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  min-width: 0;
}
```

Actually, the `person-sheet-code` and `person-sheet-row-title` classes already exist in `main.css`. Wrap them in a `<div class="person-sheet-row-main">` which also already exists:

```vue
<TableCell>
  <div class="person-sheet-row-main">
    <span class="person-sheet-code">{{ row.code }}</span>
    <span class="person-sheet-row-title">{{ row.title }}</span>
  </div>
</TableCell>
```

**Step 4: Verify compilation**

Run: `npm run type-check`
Expected: PASS

**Step 5: Visual check**

Run: `npm run build`
Expected: Build succeeds. Open People, click `...` > View Profile, switch to Competencies tab — see KPI strip, filter buttons, and dense competency table.

**Step 6: Commit**

```bash
git add src/components/people/PersonDetailDrawer.vue
git commit -m "feat(person-sheet): populate competencies tab with table and filters"
```

---

## Task 3: Build The Training History Tab

**Files:**
- Modify: `src/components/people/PersonDetailDrawer.vue`

**Step 1: Replace the Training History placeholder**

Replace the entire `<TabsContent value="training-history">` block with three sections:

```vue
<TabsContent value="training-history" class="person-sheet-tab-content">
  <div class="person-sheet-stack">
    <!-- Section 1: Evidence Records -->
    <Card class="data-card">
      <CardHeader class="data-card-header">
        <CardTitle class="data-card-title">Evidence & Certifications</CardTitle>
        <CardDescription>
          Certification records and evidence linked to this employee.
        </CardDescription>
      </CardHeader>
      <CardContent class="data-card-content">
        <div v-if="evidenceRecords.length === 0" class="person-sheet-empty-inline">
          No evidence records are available for this employee.
        </div>
        <div v-else class="person-sheet-stack">
          <div
            v-for="record in evidenceRecords"
            :key="record.id"
            class="person-sheet-row"
          >
            <div class="person-sheet-row-main">
              <span class="person-sheet-row-title">{{ record.title }}</span>
              <span class="person-sheet-row-meta">
                {{ record.type }} · {{ record.issuer }} · Issued {{ record.issueDate }}
                <template v-if="record.expiryDate"> · Expires {{ record.expiryDate }}</template>
              </span>
              <span class="person-sheet-row-meta">Competency: {{ record.competencyCode }}</span>
            </div>
            <div class="person-sheet-row-badges">
              <span
                class="badge"
                :class="record.reviewStatus === 'Accepted' ? 'badge-success' : 'badge-neutral'"
              >
                {{ record.reviewStatus }}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Section 2: Open Training Actions -->
    <Card class="data-card">
      <CardHeader class="data-card-header">
        <CardTitle class="data-card-title">Open Training Actions</CardTitle>
        <CardDescription>
          Active training needs requiring resolution.
        </CardDescription>
      </CardHeader>
      <CardContent class="data-card-content">
        <div v-if="openTrainingNeeds.length === 0" class="person-sheet-empty-inline person-sheet-empty-inline-success">
          No open training actions for this employee.
        </div>
        <div v-else class="person-sheet-stack">
          <div
            v-for="need in openTrainingNeeds"
            :key="need.id"
            class="person-sheet-row"
          >
            <div class="person-sheet-row-main">
              <span class="person-sheet-row-title">{{ need.createdReason || need.trainingTypeCode }}</span>
              <span class="person-sheet-row-meta">
                {{ need.sourceType || '—' }} · Priority: {{ need.priority || '—' }}
                <template v-if="need.dueDate"> · Due {{ need.dueDate }}</template>
              </span>
              <span class="person-sheet-row-meta">
                Workflow: {{ need.workflowStatus || need.status }}
              </span>
            </div>
            <div class="person-sheet-row-badges">
              <span
                class="badge"
                :class="
                  need.priority === 'CRITICAL' ? 'badge-critical' :
                  need.priority === 'HIGH' ? 'badge-warning' :
                  need.priority === 'MEDIUM' ? 'badge-primary' : 'badge-neutral'
                "
              >
                {{ need.priority || 'Normal' }}
              </span>
              <span
                class="badge"
                :class="
                  need.status === 'OPEN' ? 'badge-warning' : 'badge-primary'
                "
              >
                {{ need.status }}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Section 3: Completed Training -->
    <Card class="data-card">
      <CardHeader class="data-card-header">
        <CardTitle class="data-card-title">Completed Training</CardTitle>
        <CardDescription>
          Resolved training actions and completed interventions.
        </CardDescription>
      </CardHeader>
      <CardContent class="data-card-content">
        <div v-if="completedTrainingNeeds.length === 0" class="person-sheet-empty-inline">
          No completed training records yet.
        </div>
        <div v-else class="person-sheet-stack">
          <div
            v-for="need in completedTrainingNeeds"
            :key="need.id"
            class="person-sheet-row"
          >
            <div class="person-sheet-row-main">
              <span class="person-sheet-row-title">{{ need.createdReason || need.trainingTypeCode }}</span>
              <span class="person-sheet-row-meta">
                {{ need.sourceType || '—' }}
              </span>
            </div>
            <div class="person-sheet-row-badges">
              <span class="badge badge-success">Completed</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Section 4: Awareness Topics -->
    <Card class="data-card">
      <CardHeader class="data-card-header">
        <CardTitle class="data-card-title">Awareness Topics</CardTitle>
        <CardDescription>
          Targeted communications and acknowledgement status.
        </CardDescription>
      </CardHeader>
      <CardContent class="data-card-content">
        <div v-if="relevantAwarenessTopics.length === 0" class="person-sheet-empty-inline">
          No awareness topics are currently targeted to this employee.
        </div>
        <div v-else class="person-sheet-stack">
          <div
            v-for="item in relevantAwarenessTopics"
            :key="item.topic.id"
            class="person-sheet-row"
          >
            <div class="person-sheet-row-main">
              <span class="person-sheet-row-title">{{ item.topic.title }}</span>
              <span class="person-sheet-row-meta">
                {{ item.topic.category }} · Due {{ item.topic.dueDate }}
              </span>
            </div>
            <div class="person-sheet-row-badges">
              <span
                class="badge"
                :class="item.acknowledged ? 'badge-success' : 'badge-warning'"
              >
                {{ item.acknowledged ? 'Acknowledged' : 'Pending' }}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</TabsContent>
```

**Step 2: Verify compilation**

Run: `npm run type-check`
Expected: PASS

**Step 3: Visual check**

Run: `npm run build`
Expected: Build succeeds. Open People, click `...` > View Profile, switch to Training History tab — see four stacked card sections with data.

**Step 4: Commit**

```bash
git add src/components/people/PersonDetailDrawer.vue
git commit -m "feat(person-sheet): populate training history tab with evidence, needs, and awareness"
```

---

## Task 4: Add New Semantic CSS Classes

**Files:**
- Modify: `src/main.css`

**Step 1: Review existing classes**

All `person-sheet-*` classes needed already exist in `main.css`:
- `.person-sheet-stack` — flex column with gap
- `.person-sheet-row` — flex row for list items
- `.person-sheet-row-main`, `.person-sheet-row-title`, `.person-sheet-row-meta`
- `.person-sheet-row-badges`
- `.person-sheet-empty-inline`, `.person-sheet-empty-inline-success`
- `.person-sheet-code`
- `.person-sheet-kpis` — 4-column grid

**Step 2: Add any missing filter-bar spacing**

If the filter buttons in the Competencies tab need a container class, add to `src/main.css` after the existing `.toolbar` rules:

```css
.person-sheet-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}
```

Use `class="person-sheet-filter-bar"` in the template for the filter buttons row instead of `class="toolbar-filters"` if the toolbar class adds unwanted styling.

**Step 3: Verify**

Run: `npm run type-check && npm run build`
Expected: Both pass.

**Step 4: Commit**

```bash
git add src/main.css
git commit -m "style: add person sheet filter bar class"
```

---

## Task 5: Final Verification

**Files:**
- Verify only

**Step 1: Full build check**

Run:
```bash
npm run type-check && npm run build
```

Expected: Both commands exit 0.

**Step 2: Manual regression checklist**

- Open People page
- Click `...` dropdown > View Profile on any employee
- **Profile tab**: verify still renders correctly (no regressions)
- **Competencies tab**:
  - KPI cards show correct counts
  - Filter buttons toggle (All / Open Gaps / Gating / Valid)
  - Dense table renders with all 8 columns
  - `...` dropdown on each row works
  - Empty state shows when filter returns no results
- **Training History tab**:
  - Evidence & Certifications section renders with records
  - Open Training Actions section shows relevant needs
  - Completed Training section shows completed needs
  - Awareness Topics section shows acknowledgement status
  - All empty states render cleanly for sparse data
- Sheet scrolls properly with sticky header
- Close sheet works

**Step 3: Final commit (only if any fixups needed)**

```bash
git add -A
git commit -m "fix(person-sheet): address review findings from tab fill-in"
```
