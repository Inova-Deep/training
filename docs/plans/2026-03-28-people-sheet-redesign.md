# People Sheet Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the People table action dropdown with one clean entrypoint and redesign the employee profile drawer into a single tabbed sheet with `Profile`, `Competencies`, and `Training History`.

**Architecture:** Keep the existing People table intact and convert the current multi-action dropdown into one `Open` action that always launches the same employee workspace sheet. Rebuild `PersonDetailDrawer.vue` into a wider, tab-driven sheet with a sticky summary header, then route the former action concepts into tabs instead of separate menu items. Reuse the existing data already assembled from the employees and skills-matrix stores, and update guide copy so it reflects the shipped design instead of the old accordion drawer.

**Tech Stack:** Vue 3 SFCs, Pinia stores, Vue Router, existing `@/components/ui/tabs` primitives, existing Sheet/Table/Button/Card UI components, TypeScript, Vite.

---

## Implementation Notes

- There is no automated test harness in this repo today. Do not invent one in this pass.
- Use `npm run type-check` and `npm run build-only -- --outDir /tmp/training-build-people-sheet` as the required verification gates.
- Prefer minimal data-shape changes. This is a UI architecture refactor, not a store rewrite.
- Reuse the existing `PersonDetailDrawer.vue` component rather than adding a second employee-detail container.
- Keep the table layout stable. The only People table change should be the final column control.

### Task 1: Replace The Dropdown With One Entry Link

**Files:**
- Modify: `src/views/PeopleView.vue`
- Modify: `src/components/people/PersonDetailDrawer.vue`

**Step 1: Define the sheet entry contract**

- In `src/views/PeopleView.vue`, add a small local tab type:

```ts
type PersonSheetTab = 'profile' | 'competencies' | 'training-history'
```

- Replace the current `openDrawer(employee)` helper with:

```ts
const activeSheetTab = ref<PersonSheetTab>('profile')

function openDrawer(employee: Employee, tab: PersonSheetTab = 'profile') {
  selectedEmployee.value = employee
  activeSheetTab.value = tab
  drawerOpen.value = true
}
```

**Step 2: Remove the row dropdown**

- Delete the `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, and `DropdownMenuSeparator` usage from the table action cell in `src/views/PeopleView.vue`.
- Remove now-unused imports: `MoreHorizontal` and dropdown-menu imports.

**Step 3: Replace the action cell with a single control**

- Change the final table header label from `Actions` to `Profile`.
- Replace the menu button with one compact text-style button:

```vue
<TableCell class="table-actions-cell">
  <Button
    variant="ghost"
    size="sm"
    class="table-open-link"
    :aria-label="`Open profile for ${formatName(employee)}`"
    @click="openDrawer(employee, 'profile')"
  >
    Open
  </Button>
</TableCell>
```

**Step 4: Pass the initial tab into the sheet**

- Update the sheet usage in `src/views/PeopleView.vue`:

```vue
<PersonDetailDrawer
  v-model:open="drawerOpen"
  :employee="selectedEmployee"
  :initial-tab="activeSheetTab"
/>
```

**Step 5: Verify the table compiles**

Run:

```bash
npm run type-check
```

Expected:
- PASS with no TypeScript errors from `PeopleView.vue`

**Step 6: Commit**

```bash
git add src/views/PeopleView.vue src/components/people/PersonDetailDrawer.vue
git commit -m "refactor: simplify people table profile action"
```

### Task 2: Rebuild The Drawer Into A Tabbed Employee Sheet Shell

**Files:**
- Modify: `src/components/people/PersonDetailDrawer.vue`

**Step 1: Add the tab prop and internal tab state**

- Extend the props to accept the initial tab:

```ts
type PersonSheetTab = 'profile' | 'competencies' | 'training-history'

const props = defineProps<{
  open: boolean
  employee: Employee | null
  initialTab?: PersonSheetTab
}>()
```

- Add a controlled local tab ref:

```ts
const activeTab = ref<PersonSheetTab>('profile')
```

- Watch `props.initialTab` and `props.employee` so the selected tab updates when the user opens a different employee from the table.

**Step 2: Remove accordion-first interaction**

- Delete:
  - `ChevronDown` / `ChevronUp` imports if they are no longer used
  - `sectionsOpen`
  - `toggleSection`
  - `scrollToTraining`
  - `scrollToAwareness`
  - section-header collapse buttons

- Keep the underlying computed data sources where they are still useful.

**Step 3: Add the sheet shell layout**

- Import the tab primitives already used elsewhere in the repo:

```ts
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
```

- Replace the current long stacked body with this structure:
  - sticky sheet header
  - employee identity / work-status / summary strip
  - tab bar
  - tab content area

**Step 4: Widen and stabilise the sheet layout**

- Increase the sheet width from the current 680px to a workspace-style width, for example:

```css
.person-drawer {
  width: min(1040px, 96vw) !important;
  max-width: 1040px;
}
```

- Add a sticky top region so employee identity and status remain visible while tab content scrolls.

**Step 5: Verify the shell compiles**

Run:

```bash
npm run type-check
```

Expected:
- PASS with no prop/type/import errors from `PersonDetailDrawer.vue`

**Step 6: Commit**

```bash
git add src/components/people/PersonDetailDrawer.vue
git commit -m "refactor: convert people drawer to tabbed employee sheet"
```

### Task 3: Build The Profile Tab

**Files:**
- Modify: `src/components/people/PersonDetailDrawer.vue`

**Step 1: Create a summary header block**

- Keep the employee avatar/name/role block.
- Add a more operational summary strip with:
  - work authorisation badge
  - expired count
  - expiring count
  - required/open gap count
  - valid count

- Keep the restrictions banner immediately below this header if the employee is supervised/restricted/non-compliant.

**Step 2: Replace the accordion sections with cards**

- Build the `profile` tab from summary cards instead of collapsible panels:
  - `Profile Summary`
  - `Authorisation & Restrictions`
  - `Open Gaps Snapshot`
  - `Evidence Snapshot`
  - `Awareness Snapshot`

- Use the existing data sources:
  - `employee`
  - `matrixRow`
  - `openGaps`
  - `evidenceRecords`
  - `relevantAwarenessTopics`

**Step 3: Keep action buttons intentional**

- If `canTakeAction` remains, keep only actions that fit the new profile tab:
  - `Change Status`
  - `Record Evidence`

- Remove jump buttons that were only compensating for the old accordion structure.

**Step 4: Add empty states**

- Provide explicit empty-state copy for:
  - no matrix row
  - no open gaps
  - no awareness items
  - no evidence records

**Step 5: Manual visual check**

Run:

```bash
npm run build-only -- --outDir /tmp/training-build-people-sheet
```

Expected:
- PASS build output
- The `Profile` tab reads as a concise summary dashboard, not a stacked admin form

**Step 6: Commit**

```bash
git add src/components/people/PersonDetailDrawer.vue
git commit -m "feat: add profile summary tab to people sheet"
```

### Task 4: Build The Competencies Tab

**Files:**
- Modify: `src/components/people/PersonDetailDrawer.vue`

**Step 1: Add competencies tab summary metrics**

- At the top of the `competencies` tab, add four compact summary cards:
  - `Total Required`
  - `Valid`
  - `Open Gaps`
  - `Gating Failures`

- Derive these from `competencyRows`, `openGaps`, and `matrixRow`.

**Step 2: Add a small filter state**

- Create a local filter ref:

```ts
const competencyFilter = ref<'all' | 'gating' | 'open-gaps' | 'expiring' | 'valid'>('all')
```

- Add a computed list:

```ts
const visibleCompetencyRows = computed(() => {
  // filter competencyRows based on competencyFilter
})
```

**Step 3: Replace the old requirements table with a focused competency table**

- Use one dense table with columns:
  - `Competency`
  - `Category`
  - `Gating`
  - `Status`
  - `Last Assessed`
  - `Expiry`
  - `Action` (only if `canTakeAction`)

- If category is not already available in `CompetencyTableRow`, extend that row shape by reading the competency object from `matrixStore.getCompetencyById`.

**Step 4: Keep action links narrow**

- For gap items, keep action links small and explicit:
  - `Reassess`
  - `Assign Intervention`

- Do not add new workflows in this task.

**Step 5: Verify filtered rendering**

Run:

```bash
npm run type-check
npm run build-only -- --outDir /tmp/training-build-people-sheet
```

Expected:
- PASS
- Competencies tab shows a scannable operational table with gating-first ordering

**Step 6: Commit**

```bash
git add src/components/people/PersonDetailDrawer.vue
git commit -m "feat: add competencies tab to people sheet"
```

### Task 5: Build The Training History Tab

**Files:**
- Modify: `src/components/people/PersonDetailDrawer.vue`

**Step 1: Define the tab sections**

- Build the `training-history` tab with three stacked blocks:
  - `Recent Assessments`
  - `Open Training Actions`
  - `Recent Evidence / Certifications`

- Reuse existing data:
  - `assessmentHistory`
  - `trainingNeeds`
  - `evidenceRecords`

**Step 2: Choose a presentation shape**

- Use a simple vertical timeline/list for assessments if it reads well.
- If timeline styling becomes noisy, use a compact card list with date, competency, method, outcome, and assessor.
- Keep `trainingNeeds` as a small table or card list with status chips.

**Step 3: Ensure the action label now matches reality**

- `Training History` from the old dropdown is now represented by opening the same sheet and selecting the `training-history` tab.
- Make sure the tab contains actual history, not only future actions.

**Step 4: Add empty states**

- Explicit empty states for:
  - no assessment history
  - no open training actions
  - no recent evidence

**Step 5: Verify the tab is meaningful**

Run:

```bash
npm run build-only -- --outDir /tmp/training-build-people-sheet
```

Expected:
- PASS
- The tab provides a distinct historical/completion view, not a duplicate of `Profile` or `Competencies`

**Step 6: Commit**

```bash
git add src/components/people/PersonDetailDrawer.vue
git commit -m "feat: add training history tab to people sheet"
```

### Task 6: Align Guide Copy With The New People Experience

**Files:**
- Modify: `src/views/GuideView.vue`

**Step 1: Update outdated People descriptions**

- Replace phrases like:
  - `person detail drawer with 8 sections`
  - `open detail drawer with 8 sections of competence data`

- With language that matches the shipped design, for example:
  - `tabbed employee sheet with Profile, Competencies, and Training History`

**Step 2: Update feature bullets**

- In the People page description bullets, make sure the list reflects:
  - one `Open` action from the table
  - tabbed employee sheet
  - profile summary
  - competencies tab
  - training history tab

**Step 3: Verify guide accuracy**

Run:

```bash
npm run type-check
```

Expected:
- PASS
- No remaining guide copy promises the old accordion drawer structure

**Step 4: Commit**

```bash
git add src/views/GuideView.vue
git commit -m "docs: align guide with people sheet redesign"
```

### Task 7: Final Verification And Manual Regression Sweep

**Files:**
- Verify only:
  - `src/views/PeopleView.vue`
  - `src/components/people/PersonDetailDrawer.vue`
  - `src/views/GuideView.vue`

**Step 1: Run full verification**

Run:

```bash
npm run type-check
npm run build-only -- --outDir /tmp/training-build-people-sheet
```

Expected:
- Both commands exit 0
- Existing known Vite warnings may still appear, but there should be no new People-sheet-specific errors

**Step 2: Manual regression checklist**

- Open `People`
- Confirm each row now shows one action link/button, not a dropdown
- Click `Open` and confirm the sheet lands on `Profile`
- Confirm the sheet header stays visible while content scrolls
- Confirm tabs render in this order:
  - `Profile`
  - `Competencies`
  - `Training History`
- Confirm `Competencies` is distinct from `Profile`
- Confirm `Training History` is distinct from `Competencies`
- Confirm empty states render cleanly for sparse data
- Confirm `Manager` and `HR Admin` can still access the People page

**Step 3: Final commit**

```bash
git add src/views/PeopleView.vue src/components/people/PersonDetailDrawer.vue src/views/GuideView.vue
git commit -m "feat: redesign people profile sheet"
```

