<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { MoreHorizontal, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table as IoiTable } from '@ioi-dev/vue-table/unstyled'
import type { ColumnDef, CellSlotProps, SortState, IoiPaginationChangePayload, HeaderFilterSlotProps } from '@ioi-dev/vue-table/unstyled'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  { id: '_actions',      field: '_actions',      header: 'Actions',                                                      width: 72  },
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
                :class="{
                  'sort-header--no-sort': column.id === '_actions',
                  'sort-header--center': column.type === 'number',
                  'sort-header--right': column.id === '_actions',
                }"
                @click.stop="headerSort(String(column.field))"
              >
                <span>{{ column.header ?? column.field }}</span>
                <ChevronUp    v-if="getSortDir(String(column.field)) === 'asc'"  class="sort-icon" />
                <ChevronDown  v-else-if="getSortDir(String(column.field)) === 'desc'" class="sort-icon" />
                <ChevronsUpDown v-else-if="column.id !== '_actions'" class="sort-icon sort-icon-inactive" />
              </div>
            </template>

            <template #header-filter="{ column, mode, value, options, setValue }: HeaderFilterSlotProps<PeopleRow>">
              <Select
                v-if="mode === 'select'"
                :model-value="value || '__all__'"
                @update:model-value="(v) => setValue(!v || v === '__all__' ? '' : String(v))"
              >
                <SelectTrigger size="sm" class="table-filter-select" :aria-label="`Filter by ${column.header ?? column.field}`">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  <SelectItem v-for="opt in options" :key="opt" :value="opt">{{ opt }}</SelectItem>
                </SelectContent>
              </Select>
              <Input
                v-else-if="mode === 'text'"
                :model-value="value"
                class="table-filter-input"
                :placeholder="`Filter ${column.header ?? column.field}…`"
                :aria-label="`Filter by ${column.header ?? column.field}`"
                @input="(e: Event) => setValue((e.target as HTMLInputElement).value)"
              />
            </template>

            <template #cell="{ column, row, value }: CellSlotProps<PeopleRow>">
              <template v-if="column.field === 'name'">
                <div class="table-user">
                  <div class="table-avatar">{{ row.initials }}</div>
                  <span>{{ row.name }}</span>
                </div>
              </template>

              <template v-else-if="column.field === 'status'">
                <span class="badge" :class="row.status === 'Active' ? 'badge-success' : 'badge-neutral'">
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
                <div class="cell-center">
                  <span
                    v-if="row.openGaps !== null"
                    class="gap-count"
                    :class="row.openGaps > 0 ? 'gap-count-high' : 'gap-count-zero'"
                  >
                    {{ row.openGaps }}
                  </span>
                  <span v-else class="text-muted">—</span>
                </div>
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
                <div class="cell-center">
                  <span
                    v-if="row.expiringCerts !== null"
                    class="gap-count"
                    :class="row.expiringCerts > 0 ? 'gap-count-warn' : 'gap-count-zero'"
                  >
                    {{ row.expiringCerts }}
                  </span>
                  <span v-else class="text-muted">—</span>
                </div>
              </template>

              <template v-else-if="column.field === '_actions'">
                <div class="cell-right">
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
                </div>
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
            <Button variant="outline" size="sm" class="pagination-btn" :disabled="pageIndex === 0" @click="pageIndex = 0">First</Button>
            <Button variant="outline" size="icon" class="pagination-btn" :disabled="pageIndex === 0" @click="pageIndex--">
              <ChevronLeft class="icon-sm" />
            </Button>
            <span class="pagination-page-info">Page {{ pageIndex + 1 }} of {{ pageCount }}</span>
            <Button variant="outline" size="icon" class="pagination-btn" :disabled="pageIndex >= pageCount - 1" @click="pageIndex++">
              <ChevronRight class="icon-sm" />
            </Button>
            <Button variant="outline" size="sm" class="pagination-btn" :disabled="pageIndex >= pageCount - 1" @click="pageIndex = pageCount - 1">Last</Button>
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
  font-family: var(--font-sans);
}

.pagination-info {
  font-size: 0.8125rem;
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
  font-size: 0.8125rem;
  font-family: var(--font-sans);
}

.pagination-page-info {
  padding: 0 var(--space-sm);
  font-size: 0.8125rem;
  color: var(--text-body);
  font-family: var(--font-sans);
}

.icon-xs { width: 14px; height: 14px; }
.icon-sm { width: 16px; height: 16px; }

.text-muted {
  font-size: 0.875rem;
  color: var(--text-caption);
}

.sort-header--center {
  justify-content: center;
}

.sort-header--right {
  justify-content: flex-end;
}

.cell-right {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.cell-center {
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>
