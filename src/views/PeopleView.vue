<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Search, ChevronLeft, ChevronRight, X, MoreHorizontal } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useEmployeesStore } from '@/stores/employees'
import { useSkillsMatrixStore, type SupervisionStatus } from '@/stores/skillsMatrix'
import type { Employee } from '@/api/client'
import PersonDetailDrawer from '@/components/people/PersonDetailDrawer.vue'

type PersonSheetTab = 'profile' | 'competencies' | 'training-history'

const store = useEmployeesStore()
const matrixStore = useSkillsMatrixStore()

function getWorkStatusInfo(employeeId: string): { label: string; badgeClass: string } | null {
  const row = matrixStore.getEmployeeById(employeeId)
  if (!row) return null
  const map: Record<SupervisionStatus, { label: string; badgeClass: string }> = {
    FIT_FOR_INDEPENDENT_WORK: { label: 'Independent', badgeClass: 'badge-success' },
    SUPERVISED_ONLY: { label: 'Supervised', badgeClass: 'badge-warning' },
    RESTRICTED_SCOPE: { label: 'Restricted', badgeClass: 'badge-warning' },
    REASSESSMENT_REQUIRED: { label: 'Reassessment Due', badgeClass: 'badge-warning' },
    NON_COMPLIANT_MANDATORY: { label: 'Non-Compliant', badgeClass: 'badge-critical' },
  }
  return map[row.supervisionStatus]
}

function getMatrixRow(employeeId: string) {
  return matrixStore.getEmployeeById(employeeId) ?? null
}

const searchQuery = ref('')
const selectedDepartment = ref('')
const selectedBusinessUnit = ref('')
const selectedJobTitle = ref('')

// Drawer state
const drawerOpen = ref(false)
const selectedEmployee = ref<Employee | null>(null)
const activeSheetTab = ref<PersonSheetTab>('profile')

function openDrawer(employee: Employee, tab: PersonSheetTab = 'profile') {
  selectedEmployee.value = employee
  activeSheetTab.value = tab
  drawerOpen.value = true
}

// Use store.employees (paginated) instead of filteredEmployees
const employees = computed(() => store.employees)
const isLoading = computed(() => store.isLoading)
const pagination = computed(() => store.pagination)
const departments = computed(() => store.departments)
const businessUnits = computed(() => store.businessUnits)
const jobTitles = computed(() => store.jobTitles)

const currentPage = computed(() => pagination.value.currentPage)
const totalPages = computed(() => pagination.value.totalPages)
const totalCount = computed(() => pagination.value.totalCount)

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function formatName(employee: {
  firstName: string
  lastName: string
  displayName: string | null
}): string {
  return employee.displayName || `${employee.firstName} ${employee.lastName}`
}

function getManagerName(
  manager:
    | { firstName: string | null; lastName: string | null; displayName: string | null }
    | null
    | undefined,
): string {
  if (!manager) return '-'
  return manager.displayName || `${manager.firstName || ''} ${manager.lastName || ''}`.trim() || '-'
}

function handleSearch() {
  store.setFilter('search', searchQuery.value)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleDepartmentChange(value: any) {
  selectedDepartment.value = value === '__all__' ? '' : value
  store.setFilter('departmentId', value === '__all__' ? '' : value)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleBusinessUnitChange(value: any) {
  selectedBusinessUnit.value = value === '__all__' ? '' : value
  store.setFilter('businessUnitId', value === '__all__' ? '' : value)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleJobTitleChange(value: any) {
  selectedJobTitle.value = value === '__all__' ? '' : value
  store.setFilter('jobTitleId', value === '__all__' ? '' : value)
}

function clearFilters() {
  searchQuery.value = ''
  selectedDepartment.value = ''
  selectedBusinessUnit.value = ''
  selectedJobTitle.value = ''
  store.clearFilters()
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    store.setPage(page)
  }
}

function previousPage() {
  goToPage(currentPage.value - 1)
}

function nextPage() {
  goToPage(currentPage.value + 1)
}

watch(searchQuery, (value) => {
  if (value === '') {
    store.setFilter('search', '')
  }
})

onMounted(async () => {
  await Promise.all([store.fetchAllReferenceData(), store.fetchEmployees()])
  if (matrixStore.mockEmployeeRows.length === 0) {
    await matrixStore.fetchAndBuildMatrix(store.filteredEmployees)
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
              @keyup.enter="handleSearch"
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

      <div class="table-wrapper">
        <Table class="dense-table">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Business Unit</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Work Status</TableHead>
              <TableHead>Open Gaps</TableHead>
              <TableHead>Mandatory Compliance</TableHead>
              <TableHead>Expiring Certs</TableHead>
              <TableHead class="table-actions-header">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell colspan="11" class="loading-cell"> Loading employees... </TableCell>
            </TableRow>
            <TableRow v-else-if="employees.length === 0">
              <TableCell colspan="11" class="empty-cell"> No employees found </TableCell>
            </TableRow>
            <TableRow v-for="employee in employees" :key="employee.id">
              <TableCell>
                <div class="table-user">
                  <div class="table-avatar">
                    {{ getInitials(employee.firstName, employee.lastName) }}
                  </div>
                  <span>{{ formatName(employee) }}</span>
                </div>
              </TableCell>
              <TableCell>{{ employee.jobTitle?.name || '-' }}</TableCell>
              <TableCell>{{ employee.department?.name || '-' }}</TableCell>
              <TableCell>{{ employee.businessUnit?.name || '-' }}</TableCell>
              <TableCell>{{ getManagerName(employee.manager) }}</TableCell>
              <TableCell>
                <span
                  class="badge"
                  :class="employee.status === 'active' ? 'badge-success' : 'badge-neutral'"
                >
                  {{ employee.status === 'active' ? 'Active' : 'Inactive' }}
                </span>
              </TableCell>
              <TableCell>
                <template v-if="getWorkStatusInfo(employee.id)">
                  <span class="badge" :class="getWorkStatusInfo(employee.id)!.badgeClass">
                    {{ getWorkStatusInfo(employee.id)!.label }}
                  </span>
                </template>
                <span v-else class="text-muted">—</span>
              </TableCell>
              <TableCell>
                <template v-if="getMatrixRow(employee.id)">
                  <span
                    class="gap-count"
                    :class="
                      getMatrixRow(employee.id)!.requiredCount +
                        getMatrixRow(employee.id)!.expiredCount >
                      0
                        ? 'gap-count-high'
                        : 'gap-count-zero'
                    "
                  >
                    {{
                      getMatrixRow(employee.id)!.requiredCount +
                      getMatrixRow(employee.id)!.expiredCount
                    }}
                  </span>
                </template>
                <span v-else class="text-muted">—</span>
              </TableCell>
              <TableCell>
                <template v-if="getMatrixRow(employee.id)">
                  <span
                    class="badge"
                    :class="
                      getMatrixRow(employee.id)!.isAuthorised ? 'badge-success' : 'badge-critical'
                    "
                  >
                    {{ getMatrixRow(employee.id)!.isAuthorised ? 'Compliant' : 'Non-Compliant' }}
                  </span>
                </template>
                <span v-else class="text-muted">—</span>
              </TableCell>
              <TableCell>
                <template v-if="getMatrixRow(employee.id)">
                  <span
                    class="gap-count"
                    :class="
                      getMatrixRow(employee.id)!.expiringCount > 0
                        ? 'gap-count-warn'
                        : 'gap-count-zero'
                    "
                  >
                    {{ getMatrixRow(employee.id)!.expiringCount }}
                  </span>
                </template>
                <span v-else class="text-muted">—</span>
              </TableCell>
              <TableCell class="table-actions-cell">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="table-action-btn" :aria-label="`Actions for ${formatName(employee)}`">
                      <MoreHorizontal class="icon-xs" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="openDrawer(employee, 'profile')">View Profile</DropdownMenuItem>
                    <DropdownMenuItem @click="openDrawer(employee, 'competencies')">Competencies</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem @click="openDrawer(employee, 'training-history')">Training History</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div v-if="totalCount > 0" class="pagination-wrapper">
        <div class="pagination-info">
          Showing {{ (currentPage - 1) * pagination.pageSize + 1 }} to
          {{ Math.min(currentPage * pagination.pageSize, totalCount) }}
          of {{ totalCount }} employees
        </div>
        <div class="pagination-controls">
          <Button
            variant="outline"
            size="sm"
            class="pagination-btn"
            :disabled="currentPage === 1"
            @click="goToPage(1)"
          >
            First
          </Button>
          <Button
            variant="outline"
            size="icon"
            class="pagination-btn"
            :disabled="currentPage === 1"
            @click="previousPage"
          >
            <ChevronLeft class="icon-sm" />
          </Button>
          <span class="pagination-page-info"> Page {{ currentPage }} of {{ totalPages }} </span>
          <Button
            variant="outline"
            size="icon"
            class="pagination-btn"
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            <ChevronRight class="icon-sm" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            class="pagination-btn"
            :disabled="currentPage === totalPages"
            @click="goToPage(totalPages)"
          >
            Last
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Person Detail Drawer -->
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

.icon-mr {
  margin-right: 0.25rem;
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

.table-actions-header,
.table-actions-cell {
  text-align: right;
}

</style>
