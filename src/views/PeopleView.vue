<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import {
  Search,
  X,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table as IoiTable } from '@ioi-dev/vue-table/unstyled'
import type { ColumnDef, CellSlotProps, SortState, IoiPaginationChangePayload } from '@ioi-dev/vue-table/unstyled'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useEmployeesStore } from '@/stores/employees'
import { useSkillsMatrixStore, type SupervisionStatus } from '@/stores/skillsMatrix'
import { useTrainingNeedsStore } from '@/stores/trainingNeeds'
import type { Employee } from '@/api/client'
import PersonDetailDrawer from '@/components/people/PersonDetailDrawer.vue'

type PersonSheetTab = 'profile' | 'competencies' | 'training-history'

type PeopleRow = {
  id: string
  name: string
  initials: string
  jobTitle: string
  department: string
  businessUnit: string
  manager: string
  status: string
  workStatus: string
  workStatusBadgeClass: string
  openGaps: number | null
  isCompliant: string
  expiringCerts: number | null
}

const store = useEmployeesStore()
const matrixStore = useSkillsMatrixStore()
const trainingStore = useTrainingNeedsStore()

// Drawer state
const drawerOpen = ref(false)
const selectedEmployee = ref<Employee | null>(null)
const activeSheetTab = ref<PersonSheetTab>('profile')

function openDrawerByEmployeeId(id: string, tab: PersonSheetTab = 'profile') {
  const emp = store.filteredEmployees.find(e => e.id === id) ?? null
  if (emp) {
    selectedEmployee.value = emp
    activeSheetTab.value = tab
    drawerOpen.value = true
  }
}

// Toolbar filter state
const searchQuery = ref('')
const selectedDepartment = ref('')
const selectedBusinessUnit = ref('')
const selectedJobTitle = ref('')

// Column definitions
const columns: ColumnDef<PeopleRow>[] = [
  { id: 'name',          field: 'name',          header: 'Name',                 type: 'text',   headerFilter: 'text',   width: 200 },
  { id: 'jobTitle',      field: 'jobTitle',      header: 'Job Title',            type: 'text',   headerFilter: 'select'          },
  { id: 'department',    field: 'department',    header: 'Department',           type: 'text',   headerFilter: 'select'          },
  { id: 'businessUnit',  field: 'businessUnit',  header: 'Business Unit',        type: 'text',   headerFilter: 'select'          },
  { id: 'manager',       field: 'manager',       header: 'Manager',              type: 'text',   headerFilter: 'text'            },
  { id: 'status',        field: 'status',        header: 'Status',               type: 'text',   headerFilter: 'select', width: 110 },
  { id: 'workStatus',    field: 'workStatus',    header: 'Work Status',          type: 'text',   headerFilter: 'select', width: 160 },
  { id: 'openGaps',      field: 'openGaps',      header: 'Open Gaps',            type: 'number',                         width: 110 },
  { id: 'isCompliant',   field: 'isCompliant',   header: 'Mandatory Compliance', type: 'text',   headerFilter: 'select', width: 190 },
  { id: 'expiringCerts', field: 'expiringCerts', header: 'Expiring Certs',       type: 'number',                         width: 130 },
  { id: '_actions',      field: '_actions',      header: '',                                                             width: 60  },
]

// Table ref & sort
interface IoiTableRef {
  setSortState: (s: SortState[]) => void
}
const tableRef = ref<IoiTableRef | null>(null)
const sortStates = ref<SortState[]>([])
const pageIndex = ref(0)
const pageSize = ref(20)
const tableTotal = ref(0)
const tablePageCount = ref(0)

function getSortDir(field: string): 'asc' | 'desc' | '' {
  return sortStates.value.find(s => s.field === field)?.direction ?? ''
}

function headerSort(field: string): void {
  if (field === '_actions') return
  const cur = getSortDir(field)
  const next: SortState[] = !cur
    ? [{ field, direction: 'asc' }]
    : cur === 'asc'
      ? [{ field, direction: 'desc' }]
      : []
  sortStates.value = next
  tableRef.value?.setSortState(next)
  pageIndex.value = 0
}

function handlePaginationChange(payload: IoiPaginationChangePayload) {
  tableTotal.value = payload.rowCount
  tablePageCount.value = payload.pageCount
}

const pageCount = computed(() =>
  tablePageCount.value > 0
    ? tablePageCount.value
    : Math.ceil(rows.value.length / pageSize.value),
)

const totalCount = computed(() => tableTotal.value || rows.value.length)

// Flatten employee + matrix data into PeopleRow
const supervisionMap: Record<SupervisionStatus, { label: string; badgeClass: string }> = {
  FIT_FOR_INDEPENDENT_WORK:  { label: 'Independent',      badgeClass: 'badge-success'  },
  SUPERVISED_ONLY:           { label: 'Supervised',        badgeClass: 'badge-warning'  },
  RESTRICTED_SCOPE:          { label: 'Restricted',        badgeClass: 'badge-warning'  },
  REASSESSMENT_REQUIRED:     { label: 'Reassessment Due',  badgeClass: 'badge-warning'  },
  NON_COMPLIANT_MANDATORY:   { label: 'Non-Compliant',     badgeClass: 'badge-critical' },
}

const rows = computed<PeopleRow[]>(() =>
  store.filteredEmployees.map(emp => {
    const matrix = matrixStore.getEmployeeById(emp.id)
    const workInfo = matrix ? supervisionMap[matrix.supervisionStatus] : null
    return {
      id: emp.id,
      name: emp.displayName || `${emp.firstName} ${emp.lastName}`,
      initials: `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`.toUpperCase(),
      jobTitle: emp.jobTitle?.name ?? '-',
      department: emp.department?.name ?? '-',
      businessUnit: emp.businessUnit?.name ?? '-',
      manager: emp.manager
        ? emp.manager.displayName ||
          `${emp.manager.firstName ?? ''} ${emp.manager.lastName ?? ''}`.trim() ||
          '-'
        : '-',
      status: emp.status === 'active' ? 'Active' : 'Inactive',
      workStatus: workInfo?.label ?? '',
      workStatusBadgeClass: workInfo?.badgeClass ?? '',
      openGaps: matrix ? matrix.requiredCount + matrix.expiredCount : null,
      isCompliant: matrix ? (matrix.isAuthorised ? 'Compliant' : 'Non-Compliant') : '',
      expiringCerts: matrix ? matrix.expiringCount : null,
    }
  }),
)

const isLoading = computed(() => store.isLoading)

// Derive toolbar filter options from filteredEmployees
const departments = computed(() => {
  const map = new Map<string, { id: string; name: string }>()
  for (const emp of store.filteredEmployees) {
    if (emp.department && !map.has(emp.department.id))
      map.set(emp.department.id, { id: emp.department.id, name: emp.department.name ?? '' })
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
})

const businessUnits = computed(() => {
  const map = new Map<string, { id: string; name: string }>()
  for (const emp of store.filteredEmployees) {
    if (emp.businessUnit && !map.has(emp.businessUnit.id))
      map.set(emp.businessUnit.id, { id: emp.businessUnit.id, name: emp.businessUnit.name ?? '' })
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
})

const jobTitles = computed(() => {
  const map = new Map<string, { id: string; name: string }>()
  for (const emp of store.filteredEmployees) {
    if (emp.jobTitle && !map.has(emp.jobTitle.id))
      map.set(emp.jobTitle.id, { id: emp.jobTitle.id, name: emp.jobTitle.name ?? '' })
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
})

// Debounced search
let searchTimer: ReturnType<typeof setTimeout> | null = null
onUnmounted(() => { if (searchTimer) clearTimeout(searchTimer) })

function handleSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    store.setFilter('search', searchQuery.value)
    pageIndex.value = 0
  }, 300)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleDepartmentChange(value: any) {
  selectedDepartment.value = value === '__all__' ? '' : value
  store.setFilter('departmentId', value === '__all__' ? '' : value)
  pageIndex.value = 0
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleBusinessUnitChange(value: any) {
  selectedBusinessUnit.value = value === '__all__' ? '' : value
  store.setFilter('businessUnitId', value === '__all__' ? '' : value)
  pageIndex.value = 0
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleJobTitleChange(value: any) {
  selectedJobTitle.value = value === '__all__' ? '' : value
  store.setFilter('jobTitleId', value === '__all__' ? '' : value)
  pageIndex.value = 0
}

function clearFilters() {
  searchQuery.value = ''
  selectedDepartment.value = ''
  selectedBusinessUnit.value = ''
  selectedJobTitle.value = ''
  store.clearFilters()
  sortStates.value = []
  tableRef.value?.setSortState([])
  pageIndex.value = 0
}

watch(searchQuery, () => { handleSearch() })

watch(() => rows.value.length, () => { pageIndex.value = 0 })

onMounted(async () => {
  await Promise.all([store.fetchAllReferenceData(), store.fetchEmployees()])
  if (matrixStore.mockEmployeeRows.length === 0) {
    await matrixStore.fetchAndBuildMatrix(store.filteredEmployees)
  }
  if (trainingStore.trainingNeeds.length === 0) {
    await trainingStore.fetchTrainingNeeds()
  }
})
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">People</h1>
    <p class="page-subtitle">
      Employee directory — competence status, authorisation, gaps, and expiring certifications
    </p>
  </div>

  <Card class="data-card">
    <CardHeader class="data-card-header">
      <CardTitle class="data-card-title">Employee Directory</CardTitle>
    </CardHeader>
    <CardContent class="data-card-content">
      <div class="toolbar">
        <div class="toolbar-filters">
          <div class="search-input-wrapper">
            <Search class="search-input-icon" />
            <Input
              v-model="searchQuery"
              class="toolbar-search-input"
              placeholder="Search employees..."
              aria-label="Search employees"
            />
          </div>

          <Select :model-value="selectedDepartment" @update:model-value="handleDepartmentChange">
            <SelectTrigger class="filter-select">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Departments</SelectItem>
              <SelectItem v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            :model-value="selectedBusinessUnit"
            @update:model-value="handleBusinessUnitChange"
          >
            <SelectTrigger class="filter-select">
              <SelectValue placeholder="Business Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Business Units</SelectItem>
              <SelectItem v-for="bu in businessUnits" :key="bu.id" :value="bu.id">
                {{ bu.name }}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select :model-value="selectedJobTitle" @update:model-value="handleJobTitleChange">
            <SelectTrigger class="filter-select">
              <SelectValue placeholder="Job Title" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Job Titles</SelectItem>
              <SelectItem v-for="title in jobTitles" :key="title.id" :value="title.id">
                {{ title.name }}
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            v-if="searchQuery || selectedDepartment || selectedBusinessUnit || selectedJobTitle"
            variant="ghost"
            size="sm"
            class="clear-filters-btn"
            @click="clearFilters"
          >
            <X class="icon-xs" />
            Clear
          </Button>
        </div>
      </div>

      <div v-if="isLoading" class="loading-cell">Loading employees...</div>

      <template v-else>
        <div class="table-wrapper">
          <IoiTable
            ref="tableRef"
            :rows="rows"
            :columns="columns"
            row-key="id"
            v-model:pageIndex="pageIndex"
            v-model:pageSize="pageSize"
            aria-label="Employee Directory"
            @pagination-change="handlePaginationChange"
          >
            <template #header="{ column }">
              <div
                class="sort-header"
                :class="{ 'sort-header--no-sort': column.id === '_actions' }"
                @click.stop="headerSort(String(column.field))"
              >
                <span>{{ column.header ?? column.field }}</span>
                <ChevronUp
                  v-if="getSortDir(String(column.field)) === 'asc'"
                  class="sort-icon"
                />
                <ChevronDown
                  v-else-if="getSortDir(String(column.field)) === 'desc'"
                  class="sort-icon"
                />
                <ChevronsUpDown
                  v-else-if="column.id !== '_actions'"
                  class="sort-icon sort-icon-inactive"
                />
              </div>
            </template>

            <template #cell="{ column, row, value }: CellSlotProps<PeopleRow>">
              <template v-if="column.field === 'name'">
                <div class="table-user">
                  <div class="table-avatar">{{ row.initials }}</div>
                  <span>{{ row.name }}</span>
                </div>
              </template>

              <template v-else-if="column.field === 'status'">
                <span
                  class="badge"
                  :class="row.status === 'Active' ? 'badge-success' : 'badge-neutral'"
                >
                  {{ row.status }}
                </span>
              </template>

              <template v-else-if="column.field === 'workStatus'">
                <span v-if="row.workStatus" class="badge" :class="row.workStatusBadgeClass">
                  {{ row.workStatus }}
                </span>
                <span v-else class="text-muted">—</span>
              </template>

              <template v-else-if="column.field === 'openGaps'">
                <span
                  v-if="row.openGaps !== null"
                  class="gap-count"
                  :class="row.openGaps > 0 ? 'gap-count-high' : 'gap-count-zero'"
                >
                  {{ row.openGaps }}
                </span>
                <span v-else class="text-muted">—</span>
              </template>

              <template v-else-if="column.field === 'isCompliant'">
                <span
                  v-if="row.isCompliant"
                  class="badge"
                  :class="row.isCompliant === 'Compliant' ? 'badge-success' : 'badge-critical'"
                >
                  {{ row.isCompliant }}
                </span>
                <span v-else class="text-muted">—</span>
              </template>

              <template v-else-if="column.field === 'expiringCerts'">
                <span
                  v-if="row.expiringCerts !== null"
                  class="gap-count"
                  :class="row.expiringCerts > 0 ? 'gap-count-warn' : 'gap-count-zero'"
                >
                  {{ row.expiringCerts }}
                </span>
                <span v-else class="text-muted">—</span>
              </template>

              <template v-else-if="column.field === '_actions'">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="table-action-btn"
                      :aria-label="`Actions for ${row.name}`"
                    >
                      <MoreHorizontal class="icon-xs" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="openDrawerByEmployeeId(row.id, 'profile')">
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </template>

              <template v-else>{{ value }}</template>
            </template>

            <template #empty>
              <div class="empty-cell">No employees found</div>
            </template>
          </IoiTable>
        </div>

        <div v-if="totalCount > 0" class="pagination-wrapper">
          <div class="pagination-info">
            Showing {{ pageIndex * pageSize + 1 }} to
            {{ Math.min((pageIndex + 1) * pageSize, totalCount) }}
            of {{ totalCount }} employees
          </div>
          <div class="pagination-controls">
            <Button
              variant="outline"
              size="sm"
              class="pagination-btn"
              :disabled="pageIndex === 0"
              @click="pageIndex = 0"
            >
              First
            </Button>
            <Button
              variant="outline"
              size="icon"
              class="pagination-btn"
              :disabled="pageIndex === 0"
              @click="pageIndex--"
            >
              <ChevronLeft class="icon-sm" />
            </Button>
            <span class="pagination-page-info">Page {{ pageIndex + 1 }} of {{ pageCount }}</span>
            <Button
              variant="outline"
              size="icon"
              class="pagination-btn"
              :disabled="pageIndex >= pageCount - 1"
              @click="pageIndex++"
            >
              <ChevronRight class="icon-sm" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              class="pagination-btn"
              :disabled="pageIndex >= pageCount - 1"
              @click="pageIndex = pageCount - 1"
            >
              Last
            </Button>
          </div>
        </div>
      </template>
    </CardContent>
  </Card>

  <PersonDetailDrawer
    v-model:open="drawerOpen"
    :employee="selectedEmployee"
    :initial-tab="activeSheetTab"
  />
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  border-bottom: var(--border-subtle);
}

.toolbar-filters {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-icon {
  position: absolute;
  left: var(--space-sm);
  width: 16px;
  height: 16px;
  color: var(--text-caption);
  pointer-events: none;
}

.toolbar-search-input {
  padding-left: 2.25rem;
  width: 280px;
}

.filter-select {
  width: 160px;
}

.clear-filters-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.table-wrapper {
  overflow-x: auto;
}

.sort-header {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  user-select: none;
  width: 100%;
}

.sort-header--no-sort {
  cursor: default;
}

.sort-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.sort-icon-inactive {
  opacity: 0.25;
}

.loading-cell,
.empty-cell {
  text-align: center;
  padding: var(--space-xl);
  color: var(--text-caption);
}

.pagination-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  border-top: var(--border-subtle);
}

.pagination-info {
  font-size: var(--font-size-sm);
  color: var(--text-caption);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-page-info {
  padding: 0 var(--space-sm);
  font-size: var(--font-size-sm);
}

.icon-xs {
  width: 14px;
  height: 14px;
}

.icon-sm {
  width: 16px;
  height: 16px;
}

.text-muted {
  font-size: 0.875rem;
  color: var(--text-caption);
}

.gap-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0 0.375rem;
}

.gap-count-zero {
  background: var(--bg-subtle);
  color: var(--text-caption);
}

.gap-count-high {
  background: oklch(from var(--brand-critical) l c h / 0.1);
  color: var(--brand-critical);
}

.gap-count-warn {
  background: oklch(from var(--brand-warning) l c h / 0.1);
  color: var(--brand-warning);
}

/* ── IoiTable → dense-table skin ─────────────────────────────── */
:deep(.ioi-table table) {
  width: 100%;
  border-collapse: collapse;
}

:deep(.ioi-table thead tr:first-child th) {
  padding: 0 var(--space-sm);
  height: 40px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--text-caption);
  background-color: var(--bg-surface);
  vertical-align: middle;
  text-align: left;
  border-bottom: var(--border-subtle);
  white-space: nowrap;
}

:deep(.ioi-table__row) {
  height: 44px;
}

:deep(.ioi-table__row:hover) {
  background-color: var(--bg-subtle) !important;
}

:deep(.ioi-table__cell) {
  padding: 0 var(--space-sm) !important;
  font-size: 0.8125rem;
  vertical-align: middle;
  border-bottom: var(--border-subtle);
  font-family: inherit;
  color: var(--text-body);
}

:deep(.ioi-table__row:last-child .ioi-table__cell) {
  border-bottom: none;
}

/* Filter row */
:deep(.ioi-table__filter-row th) {
  background-color: var(--bg-surface);
  padding: var(--space-xs) var(--space-sm);
  border-bottom: var(--border-subtle);
}

:deep(.ioi-table__filter-input),
:deep(.ioi-table__filter-select) {
  width: 100%;
  font-size: 0.75rem;
  font-family: inherit;
  padding: 0.25rem var(--space-sm);
  border: var(--border-strong);
  border-radius: var(--radius-sm);
  background-color: var(--bg-surface);
  color: var(--text-body);
  line-height: 1.4;
}

:deep(.ioi-table__filter-input:focus),
:deep(.ioi-table__filter-select:focus) {
  outline: none;
  border-color: oklch(0.7200 0 0);
}
</style>
