<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import {
  Search,
  Download,
  Settings2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Columns,
  FileSpreadsheet,
  Users,
  Clock,
  X,
} from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import StatusChip from '@/components/ui/status-chip/StatusChip.vue'
import { useSkillsMatrixStore, getResponsibleParty, type EmployeeMatrixRow, type EmployeeCompetenceItem, type CompetencyCategory, type MatrixFilters, type Competency } from '@/stores/skillsMatrix'
import { useEmployeesStore } from '@/stores/employees'
import { useAuthStore } from '@/stores/auth'

const store = useSkillsMatrixStore()
const employeesStore = useEmployeesStore()
const authStore = useAuthStore()

const selectedEmployee = ref<EmployeeMatrixRow | null>(null)
const selectedCompetenceItem = ref<EmployeeCompetenceItem | null>(null)
const isDrawerOpen = ref(false)
const lastRefreshTime = ref(new Date())
const demoView = ref<string>('')

const JOB_TITLES = [
  'Maintenance Technician',
  'Maintenance Supervisor',
  'QHSE Coordinator',
  'Operations Manager',
  'Shift Lead',
  'Electrical Technician',
  'Instrumentation Technician',
]

const DEPARTMENTS = ['Maintenance', 'Operations', 'QHSE', 'Engineering']
const BUSINESS_UNITS = ['Upstream', 'Midstream', 'Downstream', 'Corporate']

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'VALID', label: 'Valid' },
  { value: 'EXPIRING', label: 'Expiring' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'REQUIRED', label: 'Required' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
]

const RISK_OPTIONS = [
  { value: 'all', label: 'All Risks' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH_CRITICAL', label: 'High/Critical' },
]

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'Technical', label: 'Technical' },
  { value: 'Quality', label: 'Quality' },
  { value: 'Mandatory', label: 'Mandatory' },
]

const DEMO_VIEWS = [
  { value: 'compliance', label: 'Compliance Overview' },
  { value: 'gating', label: 'Gating Risks' },
  { value: 'expiring', label: 'Expiring 30 Days' },
  { value: 'backlog', label: 'Training Backlog' },
]

const filteredEmployees = store.filteredEmployees
const summaryStats = store.summaryStats
const competenciesByCategory = store.competenciesByCategory
const competencies = store.competencies
const visibleColumns = store.visibleColumns
const expandedCategories = store.expandedCategories
const viewMode = store.viewMode
const filters = store.filters
const isAdmin = computed(() => authStore.isAdmin)
const isManager = computed(() => authStore.isManager)

const formattedRefreshTime = computed(() => {
  return lastRefreshTime.value.toLocaleTimeString()
})

const categoryOrder: CompetencyCategory[] = ['Technical', 'Quality', 'Mandatory']

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function getRowResponsible(employee: EmployeeMatrixRow): string {
  if (!employee.isAuthorised && employee.gatingFailed.length > 0) {
    const item = [...employee.competenceItems.values()].find(
      i => i.isGating && (i.derivedStatus === 'EXPIRED' || i.derivedStatus === 'REQUIRED' || i.derivedStatus === 'IN_PROGRESS')
    )
    if (item) return getResponsibleParty(item)
  }
  if (employee.expiredCount > 0) {
    const item = [...employee.competenceItems.values()].find(i => i.derivedStatus === 'EXPIRED')
    if (item) return getResponsibleParty(item)
  }
  if (employee.expiringCount > 0) return 'Employee'
  if (employee.requiredCount > 0) return 'Employee'
  return '—'
}

function handleRowClick(employee: EmployeeMatrixRow) {
  selectedEmployee.value = employee
  isDrawerOpen.value = true
}

function handleCellClick(item: EmployeeCompetenceItem) {
  selectedCompetenceItem.value = item
}

function closeDrawer() {
  isDrawerOpen.value = false
  selectedEmployee.value = null
  showingRejectFor.value = null
  showingNaFor.value = null
}

// ─── Evidence Review + N/A state ──────────────────────────────────────────────

const showingRejectFor = ref<string | null>(null)
const showingNaFor = ref<string | null>(null)
const rejectReasons = reactive<Record<string, string>>({})
const naJustifications = reactive<Record<string, string>>({})

function handleAccept(item: EmployeeCompetenceItem) {
  if (!selectedEmployee.value) return
  store.reviewEvidence(selectedEmployee.value.employeeId, item.competencyId, 'ACCEPT')
}

function startReject(compId: string) {
  showingRejectFor.value = compId
  showingNaFor.value = null
  if (rejectReasons[compId] === undefined) rejectReasons[compId] = ''
}

function confirmReject(item: EmployeeCompetenceItem) {
  if (!selectedEmployee.value) return
  store.reviewEvidence(selectedEmployee.value.employeeId, item.competencyId, 'REJECT', rejectReasons[item.competencyId])
  showingRejectFor.value = null
}

function startNa(compId: string) {
  showingNaFor.value = compId
  showingRejectFor.value = null
  if (naJustifications[compId] === undefined) naJustifications[compId] = ''
}

function confirmNa(item: EmployeeCompetenceItem) {
  if (!selectedEmployee.value) return
  const j = naJustifications[item.competencyId]?.trim()
  if (!j) return
  store.markNotApplicable(selectedEmployee.value.employeeId, item.competencyId, j)
  showingNaFor.value = null
}

function setViewMode(mode: 'summary' | 'grid') {
  store.setViewMode(mode)
}

function toggleCategory(category: CompetencyCategory) {
  store.toggleCategory(category)
}

function isCategoryExpanded(category: CompetencyCategory): boolean {
  return expandedCategories.includes(category)
}

function handleFilterChange(key: keyof MatrixFilters, value: string | boolean) {
  store.setFilter(key, value as MatrixFilters[typeof key])
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleBusinessUnitChange(value: any) {
  store.setFilter('businessUnit', value === 'all' ? '' : value)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleDepartmentChange(value: any) {
  store.setFilter('department', value === 'all' ? '' : value)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleJobTitleChange(value: any) {
  store.setFilter('jobTitle', value === 'all' ? '' : value)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleStatusChange(value: any) {
  store.setFilter('status', value === 'all' ? '' : value)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleRiskChange(value: any) {
  store.setFilter('risk', value === 'all' ? '' : value)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleSearchChange(value: any) {
  store.setFilter('search', value || '')
}

function handleGatingToggle(value: boolean) {
  store.setFilter('gatingOnly', value)
}

function handleIssuesToggle(value: boolean) {
  store.setFilter('issuesOnly', value)
}

function handleSupervisionToggle(value: boolean) {
  store.setFilter('supervisionOnly', value)
}

function handleColumnToggle(columnId: string) {
  store.toggleColumn(columnId)
}

function handleResetColumns() {
  store.resetColumns()
}

function handleSort(field: keyof EmployeeMatrixRow) {
  store.setSorting(field)
}

function handleClearFilters() {
  store.clearFilters()
  demoView.value = ''
}

function handleDemoViewChange(view: string) {
  demoView.value = view
  store.clearFilters()
  
  switch (view) {
    case 'compliance':
      break
    case 'gating':
      store.setFilter('gatingOnly', true)
      break
    case 'expiring':
      store.setFilter('status', 'EXPIRING')
      break
    case 'backlog':
      store.setFilter('status', 'REQUIRED')
      break
  }
}

function handleExportExcel() {
  const data = store.filteredEmployees.map((emp: EmployeeMatrixRow) => ({
    'Employee No': emp.employeeNo,
    'Name': emp.displayName,
    'Job Title': emp.jobTitle,
    'Department': emp.department,
    'Business Unit': emp.businessUnit,
    'Authorised': emp.isAuthorised ? 'Yes' : 'No',
    'Required': emp.requiredCount,
    'Expiring': emp.expiringCount,
    'Expired': emp.expiredCount,
    'Gating Failed': emp.gatingFailed.join(', '),
    'Top Action': emp.topAction,
    'Responsible': getRowResponsible(emp),
  }))
  
  const headers = Object.keys(data[0] || {})
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => `"${row[h as keyof typeof row] || ''}"`).join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `skills-matrix-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

function getCompetencyById(id: string) {
  return store.getCompetencyById(id)
}

function getEmployeeCompetenceItem(employee: EmployeeMatrixRow, competencyId: string): EmployeeCompetenceItem | undefined {
  return employee.competenceItems.get(competencyId)
}

function getVisibleCompetenciesForCategory(category: CompetencyCategory) {
  const categoryComps = store.competenciesByCategory.get(category) || []
  return categoryComps.filter((c: Competency) => store.visibleColumns.includes(c.id))
}

function refreshData() {
  lastRefreshTime.value = new Date()
}

onMounted(async () => {
  await employeesStore.fetchEmployees()
  await store.fetchAndBuildMatrix(employeesStore.filteredEmployees)
  refreshData()
})
</script>

<template>
  <div class="skills-matrix-view">
    <div class="page-header">
      <h1 class="page-title">Skills Matrix</h1>
      <p class="page-subtitle">Organisation-wide competence tracking and compliance overview</p>
    </div>
    <div class="sticky-top-bar">
      <div class="top-bar-header">
        <div class="scope-selector">
          <Users class="icon-sm" />
          <span v-if="isAdmin" class="scope-label">Org Scope</span>
          <span v-else-if="isManager" class="scope-label">My Team (Direct/All Levels)</span>
          <span v-else class="scope-label">My Profile</span>
        </div>
        
        <div class="view-mode-toggle">
          <Button
            :variant="viewMode === 'summary' ? 'default' : 'outline'"
            size="sm"
            @click="setViewMode('summary')"
          >
            Employee Summary
          </Button>
          <Button
            :variant="viewMode === 'grid' ? 'default' : 'outline'"
            size="sm"
            @click="setViewMode('grid')"
          >
            Requirement Grid
          </Button>
        </div>
      </div>
      
      <div class="filters-row">
        <div class="filters-left">
          <div class="search-wrapper">
            <Search class="search-icon" />
            <Input
              :model-value="filters.search"
              class="search-input"
              placeholder="Search employee name or ID..."
              @update:model-value="handleSearchChange"
            />
          </div>
          
          <Select
            :model-value="filters.businessUnit || 'all'"
            @update:model-value="handleBusinessUnitChange"
          >
            <SelectTrigger class="filter-select">
              <SelectValue placeholder="Business Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Business Units</SelectItem>
              <SelectItem v-for="bu in BUSINESS_UNITS" :key="bu" :value="bu">
                {{ bu }}
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            :model-value="filters.department || 'all'"
            @update:model-value="handleDepartmentChange"
          >
            <SelectTrigger class="filter-select">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem v-for="dept in DEPARTMENTS" :key="dept" :value="dept">
                {{ dept }}
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            :model-value="filters.jobTitle || 'all'"
            @update:model-value="handleJobTitleChange"
          >
            <SelectTrigger class="filter-select">
              <SelectValue placeholder="Job Title" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Job Titles</SelectItem>
              <SelectItem v-for="title in JOB_TITLES" :key="title" :value="title">
                {{ title }}
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            :model-value="filters.status || 'all'"
            @update:model-value="handleStatusChange"
          >
            <SelectTrigger class="filter-select">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="status in STATUS_OPTIONS" :key="status.value" :value="status.value">
                {{ status.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            :model-value="filters.risk || 'all'"
            @update:model-value="handleRiskChange"
          >
            <SelectTrigger class="filter-select narrow">
              <SelectValue placeholder="Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="risk in RISK_OPTIONS" :key="risk.value" :value="risk.value">
                {{ risk.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          
          <div class="toggle-wrapper">
            <div class="toggle-label">
              <Switch
                :checked="filters.gatingOnly"
                @update:checked="handleGatingToggle"
              />
              <span>Gating only</span>
            </div>
          </div>

          <div class="toggle-wrapper">
            <div class="toggle-label">
              <Switch
                :checked="filters.supervisionOnly"
                @update:checked="handleSupervisionToggle"
              />
              <span>Under Supervision Only</span>
            </div>
          </div>
        </div>
        
        <div class="filters-right">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" size="sm">
                <FileSpreadsheet class="icon-xs" />
                Demo Views
                <ChevronDown class="icon-xs" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Quick Filters</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                v-for="view in DEMO_VIEWS"
                :key="view.value"
                @click="handleDemoViewChange(view.value)"
              >
                {{ view.label }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" @click="handleExportExcel">
            <Download class="icon-xs" />
            Export Excel
          </Button>
          
          <DropdownMenu v-if="viewMode === 'grid'">
            <DropdownMenuTrigger as-child>
              <Button variant="outline" size="sm">
                <Columns class="icon-xs" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="columns-dropdown">
              <DropdownMenuLabel>Visible Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <template v-for="category in categoryOrder" :key="category">
                <DropdownMenuLabel class="category-label">{{ category }}</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  v-for="comp in competenciesByCategory.get(category) || []"
                  :key="comp.id"
                  :checked="visibleColumns.includes(comp.id)"
                  @select.prevent
                  @update:checked="handleColumnToggle(comp.id)"
                >
                  {{ comp.code }} - {{ comp.title }}
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
              </template>
              <DropdownMenuItem @click="handleResetColumns">
                Reset to Default
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div class="toggle-wrapper">
            <div class="toggle-label">
              <Switch
                :checked="filters.issuesOnly"
                @update:checked="handleIssuesToggle"
              />
              <span>Issues Only</span>
            </div>
          </div>
          
          <Button
            v-if="filters.search || filters.businessUnit || filters.department || filters.jobTitle || filters.status || filters.risk || filters.gatingOnly || filters.issuesOnly || filters.supervisionOnly"
            variant="ghost"
            size="sm"
            @click="handleClearFilters"
          >
            <X class="icon-xs" />
            Clear
          </Button>
        </div>
      </div>
    </div>
    
    <div class="matrix-content">
      <div class="summary-bar">
        <div class="summary-stat">
          <span class="stat-value">{{ summaryStats.totalEmployees }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="summary-stat success">
          <span class="stat-value">{{ summaryStats.authorised }}</span>
          <span class="stat-label">Authorised</span>
        </div>
        <div class="summary-stat danger">
          <span class="stat-value">{{ summaryStats.notAuthorised }}</span>
          <span class="stat-label">Not Authorised</span>
        </div>
        <div class="summary-stat supervised">
          <span class="stat-value">{{ summaryStats.totalSupervised }}</span>
          <span class="stat-label">Under Supervision</span>
        </div>
        <div class="summary-stat warning">
          <span class="stat-value">{{ summaryStats.totalExpiring }}</span>
          <span class="stat-label">Expiring</span>
        </div>
        <div class="summary-stat danger">
          <span class="stat-value">{{ summaryStats.totalExpired }}</span>
          <span class="stat-label">Expired</span>
        </div>
        <div class="summary-stat">
          <span class="stat-value">{{ summaryStats.complianceRate }}%</span>
          <span class="stat-label">Compliance</span>
        </div>
      </div>
      
      <Card class="matrix-card">
        <CardContent class="matrix-card-content">
          <template v-if="viewMode === 'summary'">
            <div class="table-wrapper">
              <Table class="dense-table summary-table">
                <TableHeader>
                  <TableRow>
                    <TableHead class="sortable" @click="handleSort('displayName')">
                      Employee
                    </TableHead>
                    <TableHead class="sortable" @click="handleSort('jobTitle')">
                      Job Title / Dept / BU
                    </TableHead>
                    <TableHead class="sortable" @click="handleSort('isAuthorised')">
                      Authorisation
                    </TableHead>
                    <TableHead class="sortable numeric" @click="handleSort('supervisedCount')">
                      Supervised
                    </TableHead>
                    <TableHead class="sortable numeric" @click="handleSort('requiredCount')">
                      Required
                    </TableHead>
                    <TableHead class="sortable numeric" @click="handleSort('expiringCount')">
                      Expiring ≤30
                    </TableHead>
                    <TableHead class="sortable numeric" @click="handleSort('expiredCount')">
                      Expired
                    </TableHead>
                    <TableHead>Gating Failed</TableHead>
                    <TableHead>Top Action</TableHead>
                    <TableHead>Responsible</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow
                    v-for="employee in filteredEmployees"
                    :key="employee.employeeId"
                    class="clickable-row"
                    @click="handleRowClick(employee)"
                  >
                    <TableCell>
                      <div class="employee-cell">
                        <div class="employee-avatar">
                          {{ getInitials(employee.firstName, employee.lastName) }}
                        </div>
                        <div class="employee-info">
                          <span class="employee-name">{{ employee.displayName }}</span>
                          <span class="employee-no">{{ employee.employeeNo }}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div class="job-info">
                        <span class="job-title">{{ employee.jobTitle }}</span>
                        <span class="job-dept">{{ employee.department }} / {{ employee.businessUnit }}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span :class="['badge', employee.isAuthorised ? 'badge-success' : 'badge-critical']">
                        {{ employee.isAuthorised ? 'Authorised' : 'Not Authorised' }}
                      </span>
                    </TableCell>
                    <TableCell class="numeric">
                      <span v-if="employee.supervisedCount > 0" class="count-supervised">
                        {{ employee.supervisedCount }}
                      </span>
                      <span v-else>{{ employee.supervisedCount }}</span>
                    </TableCell>
                    <TableCell class="numeric">{{ employee.requiredCount }}</TableCell>
                    <TableCell class="numeric">
                      <span v-if="employee.expiringCount > 0" class="count-warning">
                        {{ employee.expiringCount }}
                      </span>
                      <span v-else>{{ employee.expiringCount }}</span>
                    </TableCell>
                    <TableCell class="numeric">
                      <span v-if="employee.expiredCount > 0" class="count-danger">
                        {{ employee.expiredCount }}
                      </span>
                      <span v-else>{{ employee.expiredCount }}</span>
                    </TableCell>
                    <TableCell>
                      <div v-if="employee.gatingFailed.length > 0" class="gating-codes">
                        <span
                          v-for="code in employee.gatingFailed.slice(0, 3)"
                          :key="code"
                          class="badge badge-critical"
                        >
                          {{ code }}
                        </span>
                        <span v-if="employee.gatingFailed.length > 3" class="more-codes">
                          +{{ employee.gatingFailed.length - 3 }}
                        </span>
                      </div>
                      <span v-else class="none-text">-</span>
                    </TableCell>
                    <TableCell>
                      <div class="action-cell">
                        <AlertTriangle
                          v-if="!employee.isAuthorised"
                          class="action-icon danger"
                        />
                        <span :class="{ 'action-urgent': !employee.isAuthorised }">
                          {{ employee.topAction }}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        class="responsible-badge"
                        :class="getRowResponsible(employee) === 'Manager' ? 'responsible-manager' : getRowResponsible(employee) === 'Employee' ? 'responsible-employee' : ''"
                      >
                        {{ getRowResponsible(employee) }}
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow v-if="filteredEmployees.length === 0">
                    <TableCell colspan="10" class="empty-cell">
                      No employees match the current filters
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </template>
          
          <template v-else>
            <div class="grid-wrapper">
              <Table class="dense-table grid-table">
                <TableHeader>
                  <TableRow>
                    <TableHead class="frozen-column employee-header">
                      Employee
                    </TableHead>
                    <TableHead class="frozen-column">Job Title</TableHead>
                    <TableHead class="frozen-column">Dept/BU</TableHead>
                    <TableHead class="frozen-column">Authorisation</TableHead>
                    <template v-for="category in categoryOrder" :key="category">
                      <template v-if="getVisibleCompetenciesForCategory(category).length > 0">
                        <TableHead
                          :colspan="isCategoryExpanded(category) ? getVisibleCompetenciesForCategory(category).length : 1"
                          class="category-header"
                          @click="toggleCategory(category)"
                        >
                          <div class="category-header-content">
                            <component
                              :is="isCategoryExpanded(category) ? ChevronDown : ChevronRight"
                              class="icon-xs"
                            />
                            <span>{{ category }}</span>
                            <span v-if="isCategoryExpanded(category)" class="category-count">
                              ({{ getVisibleCompetenciesForCategory(category).length }})
                            </span>
                          </div>
                        </TableHead>
                      </template>
                    </template>
                  </TableRow>
                  <TableRow>
                    <TableHead class="frozen-column sub-header"></TableHead>
                    <TableHead class="frozen-column sub-header"></TableHead>
                    <TableHead class="frozen-column sub-header"></TableHead>
                    <TableHead class="frozen-column sub-header"></TableHead>
                    <template v-for="category in categoryOrder" :key="`${category}-sub`">
                      <template v-if="isCategoryExpanded(category)">
                        <TableHead
                          v-for="comp in getVisibleCompetenciesForCategory(category)"
                          :key="comp.id"
                          class="competency-header"
                          :title="comp.title"
                        >
                          <div class="competency-code">{{ comp.code }}</div>
                        </TableHead>
                      </template>
                      <template v-else>
                        <TableHead class="competency-header summary-header">
                          <div class="competency-code">Summ.</div>
                        </TableHead>
                      </template>
                    </template>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow
                    v-for="employee in filteredEmployees"
                    :key="employee.employeeId"
                    class="grid-row"
                  >
                    <TableCell class="frozen-column employee-cell-grid">
                      <div class="employee-cell">
                        <div class="employee-avatar small">
                          {{ getInitials(employee.firstName, employee.lastName) }}
                        </div>
                        <div class="employee-info">
                          <span class="employee-name">{{ employee.displayName }}</span>
                          <span class="employee-no">{{ employee.employeeNo }}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell class="frozen-column">{{ employee.jobTitle }}</TableCell>
                    <TableCell class="frozen-column">
                      <span class="dept-bu">{{ employee.department }}/{{ employee.businessUnit }}</span>
                    </TableCell>
                    <TableCell class="frozen-column">
                      <span :class="['badge', employee.isAuthorised ? 'badge-success' : 'badge-critical']">
                        {{ employee.isAuthorised ? 'Auth' : 'No Auth' }}
                      </span>
                    </TableCell>
                    <template v-for="category in categoryOrder" :key="`${category}-cells`">
                      <template v-if="isCategoryExpanded(category)">
                        <TableCell
                          v-for="comp in getVisibleCompetenciesForCategory(category)"
                          :key="comp.id"
                          class="competency-cell"
                        >
                          <StatusChip
                            v-if="getEmployeeCompetenceItem(employee, comp.id)"
                            :status="getEmployeeCompetenceItem(employee, comp.id)!.derivedStatus"
                            :expiry-date="getEmployeeCompetenceItem(employee, comp.id)!.expiryDate"
                            compact
                          />
                        </TableCell>
                      </template>
                      <template v-else>
                        <TableCell class="competency-cell summary-cell">
                          <div class="category-summary-dots">
                             <div 
                               v-for="item in Array.from(employee.competenceItems.values()).filter(i => getCompetencyById(i.competencyId)?.category === category)"
                               :key="item.competencyId"
                               class="summary-dot"
                               :class="`dot-${item.derivedStatus.toLowerCase().replace('_', '-')}`"
                             ></div>
                          </div>
                        </TableCell>
                      </template>
                    </template>
                  </TableRow>
                  <TableRow v-if="filteredEmployees.length === 0">
                    <TableCell colspan="100" class="empty-cell">
                      No employees match the current filters
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </template>
        </CardContent>
      </Card>
    </div>
    
    <div class="bottom-bar">
      <div class="legend">
        <div class="legend-item">
          <span class="legend-chip chip-valid"></span>
          <span>Valid</span>
        </div>
        <div class="legend-item">
          <span class="legend-chip chip-expiring"></span>
          <span>Expiring</span>
        </div>
        <div class="legend-item">
          <span class="legend-chip chip-expired"></span>
          <span>Expired</span>
        </div>
        <div class="legend-item">
          <span class="legend-chip chip-required"></span>
          <span>Required</span>
        </div>
        <div class="legend-item">
          <span class="legend-chip chip-in-progress"></span>
          <span>In Progress</span>
        </div>
        <div class="legend-item">
          <span class="legend-chip chip-na"></span>
          <span>N/A</span>
        </div>
      </div>
      <div class="refresh-info">
        <Clock class="icon-xs" />
        <span>Last refreshed from ERP: {{ formattedRefreshTime }}</span>
        <Button variant="ghost" size="sm" @click="refreshData">
          Refresh
        </Button>
      </div>
    </div>
    
    <Sheet :open="isDrawerOpen" @update:open="closeDrawer">
      <SheetContent class="employee-drawer">
        <SheetHeader class="sheet-header">
          <SheetTitle v-if="selectedEmployee">
            {{ selectedEmployee.displayName }}
          </SheetTitle>
          <SheetDescription v-if="selectedEmployee">
            {{ selectedEmployee.employeeNo }} • {{ selectedEmployee.jobTitle }}
          </SheetDescription>
        </SheetHeader>

        <div v-if="selectedEmployee" class="drawer-body">
          <div class="drawer-section">
            <div class="section-title">Employee Details</div>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Department</span>
                <span class="detail-value">{{ selectedEmployee.department }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Business Unit</span>
                <span class="detail-value">{{ selectedEmployee.businessUnit }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Manager</span>
                <span class="detail-value">{{ selectedEmployee.managerName || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Authorisation</span>
                <span :class="['badge', selectedEmployee.isAuthorised ? 'badge-success' : 'badge-critical']">
                  {{ selectedEmployee.isAuthorised ? 'Authorised' : 'Not Authorised' }}
                </span>
              </div>
            </div>
          </div>

          <div class="drawer-section">
            <div class="section-title">Compliance Summary</div>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-value">{{ selectedEmployee.validCount }}</span>
                <span class="summary-label">Valid</span>
              </div>
              <div class="summary-item warning">
                <span class="summary-value">{{ selectedEmployee.expiringCount }}</span>
                <span class="summary-label">Expiring</span>
              </div>
              <div class="summary-item danger">
                <span class="summary-value">{{ selectedEmployee.expiredCount }}</span>
                <span class="summary-label">Expired</span>
              </div>
              <div class="summary-item">
                <span class="summary-value">{{ selectedEmployee.requiredCount }}</span>
                <span class="summary-label">Required</span>
              </div>
            </div>
          </div>

          <div v-if="selectedEmployee.gatingFailed.length > 0" class="drawer-section">
            <div class="section-title">Gating Failures</div>
            <div class="gating-failures">
              <span
                v-for="code in selectedEmployee.gatingFailed"
                :key="code"
                class="badge badge-critical"
              >
                {{ code }}
              </span>
            </div>
          </div>

          <div class="drawer-section">
            <div class="section-title">Top Action Required</div>
            <div class="action-box">
              <AlertTriangle v-if="!selectedEmployee.isAuthorised" class="action-icon danger" />
              <span :class="{ 'action-urgent': !selectedEmployee.isAuthorised }">
                {{ selectedEmployee.topAction }}
              </span>
            </div>
          </div>

          <div class="drawer-section">
            <div class="section-title">Competencies</div>
            <div class="competencies-list">
              <div
                v-for="category in categoryOrder"
                :key="category"
                class="competency-category"
              >
                <div class="category-name">{{ category }}</div>
                <div class="category-items">
                  <div
                    v-for="comp in competenciesByCategory.get(category) || []"
                    :key="comp.id"
                    class="competency-row"
                  >
                    <!-- Main row: info + status + action buttons -->
                    <div class="comp-row-main">
                      <div class="competency-info">
                        <span class="competency-code">{{ comp.code }}</span>
                        <span class="competency-title">{{ comp.title }}</span>
                        <span v-if="comp.isGatingDefault" class="badge badge-neutral gating-indicator">
                          Gating
                        </span>
                      </div>
                      <div class="comp-row-right">
                        <StatusChip
                          v-if="getEmployeeCompetenceItem(selectedEmployee, comp.id)"
                          :status="getEmployeeCompetenceItem(selectedEmployee, comp.id)!.derivedStatus"
                          :expiry-date="getEmployeeCompetenceItem(selectedEmployee, comp.id)!.expiryDate"
                        />
                        <span
                          v-if="getEmployeeCompetenceItem(selectedEmployee, comp.id) && getResponsibleParty(getEmployeeCompetenceItem(selectedEmployee, comp.id)!) !== '—'"
                          class="responsible-badge"
                          :class="getResponsibleParty(getEmployeeCompetenceItem(selectedEmployee, comp.id)!) === 'Manager' ? 'responsible-manager' : 'responsible-employee'"
                        >
                          {{ getResponsibleParty(getEmployeeCompetenceItem(selectedEmployee, comp.id)!) }}
                        </span>
                        <!-- Evidence review: visible to managers when IN_PROGRESS or REQUIRED -->
                        <template
                          v-if="isManager &&
                            getEmployeeCompetenceItem(selectedEmployee, comp.id) &&
                            (getEmployeeCompetenceItem(selectedEmployee, comp.id)!.derivedStatus === 'IN_PROGRESS' ||
                             getEmployeeCompetenceItem(selectedEmployee, comp.id)!.derivedStatus === 'REQUIRED')"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            class="review-btn accept-btn"
                            @click="handleAccept(getEmployeeCompetenceItem(selectedEmployee, comp.id)!)"
                          >Accept</Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            class="review-btn reject-btn"
                            @click="startReject(comp.id)"
                          >Reject</Button>
                        </template>
                        <!-- N/A: visible to managers when REQUIRED or EXPIRED -->
                        <Button
                          v-if="isManager &&
                            getEmployeeCompetenceItem(selectedEmployee, comp.id) &&
                            (getEmployeeCompetenceItem(selectedEmployee, comp.id)!.derivedStatus === 'REQUIRED' ||
                             getEmployeeCompetenceItem(selectedEmployee, comp.id)!.derivedStatus === 'EXPIRED')"
                          size="sm"
                          variant="ghost"
                          class="review-btn na-btn"
                          @click="startNa(comp.id)"
                        >N/A</Button>
                      </div>
                    </div>

                    <!-- Reject inline form -->
                    <div v-if="showingRejectFor === comp.id" class="inline-review-form">
                      <Input
                        v-model="rejectReasons[comp.id]"
                        placeholder="Reason for rejection…"
                        class="inline-form-input"
                        @keyup.enter="confirmReject(getEmployeeCompetenceItem(selectedEmployee, comp.id)!)"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        @click="confirmReject(getEmployeeCompetenceItem(selectedEmployee, comp.id)!)"
                      >Confirm</Button>
                      <Button size="sm" variant="ghost" @click="showingRejectFor = null">Cancel</Button>
                    </div>

                    <!-- N/A inline form -->
                    <div v-if="showingNaFor === comp.id" class="inline-review-form">
                      <Input
                        v-model="naJustifications[comp.id]"
                        placeholder="Justification for N/A…"
                        class="inline-form-input"
                        @keyup.enter="confirmNa(getEmployeeCompetenceItem(selectedEmployee, comp.id)!)"
                      />
                      <Button
                        size="sm"
                        :disabled="!naJustifications[comp.id]?.trim()"
                        @click="confirmNa(getEmployeeCompetenceItem(selectedEmployee, comp.id)!)"
                      >Confirm</Button>
                      <Button size="sm" variant="ghost" @click="showingNaFor = null">Cancel</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter class="sheet-footer">
          <Button variant="outline" @click="closeDrawer">Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  </div>
</template>

<style scoped>
/* ─── Layout ─────────────────────────────────────────────────── */

.skills-matrix-view {
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin: calc(-1 * var(--space-xl));
  width: calc(100% + 2 * var(--space-xl));
  height: calc(100vh - 64px);
}

.page-header {
  padding: var(--space-lg) var(--space-md);
  border-bottom: var(--border-subtle);
  background-color: var(--bg-surface);
  flex-shrink: 0;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0 0 var(--space-xs) 0;
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--text-caption);
  margin: 0;
}

.sticky-top-bar {
  background-color: var(--bg-surface);
  border-bottom: var(--border-subtle);
  padding: var(--space-sm) var(--space-md);
  flex-shrink: 0;
}

.top-bar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.scope-selector {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--text-caption);
}

.scope-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.view-mode-toggle {
  display: flex;
  gap: var(--space-xs);
}

.filters-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  flex-wrap: wrap;
  width: 100%;
}

.filters-left,
.filters-right {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-caption);
  pointer-events: none;
}

.search-input {
  padding-left: 2.25rem;
  width: 220px;
}

.filter-select {
  width: 140px;
}

.filter-select.narrow {
  width: 100px;
}

.toggle-wrapper {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.875rem;
  cursor: pointer;
}

.icon-xs {
  width: 14px;
  height: 14px;
}

.icon-sm {
  width: 16px;
  height: 16px;
}

.matrix-content {
  flex: 1;
  overflow: hidden;
  padding: var(--space-sm) var(--space-md);
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.summary-bar {
  display: flex;
  flex-shrink: 0;
  gap: var(--space-lg);
  padding: var(--space-sm) var(--space-md);
  background-color: var(--bg-subtle);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
}

.summary-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
}

.summary-stat.success .stat-value {
  color: var(--brand-success);
}

.summary-stat.warning .stat-value {
  color: var(--brand-warning);
}

.summary-stat.danger .stat-value {
  color: var(--brand-critical);
}

.summary-stat.supervised .stat-value {
  color: oklch(0.50 0.13 60);
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-heading);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.matrix-card {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.matrix-card-content {
  padding: 0;
  min-width: 0;
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.table-wrapper {
  overflow-x: auto;
}

.summary-table .clickable-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.summary-table .clickable-row:hover {
  background-color: var(--bg-subtle);
}

.employee-cell {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.employee-avatar {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background-color: var(--bg-subtle);
  color: var(--text-body);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 600;
  flex-shrink: 0;
}

.employee-info {
  display: flex;
  flex-direction: column;
}

.employee-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-heading);
}

.employee-no {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.job-info {
  display: flex;
  flex-direction: column;
}

.job-title {
  font-size: 0.8125rem;
  font-weight: 500;
}

.job-dept {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.dept-bu {
  font-size: 0.8125rem;
  white-space: nowrap;
}

.numeric {
  text-align: right;
}

.count-warning {
  color: var(--brand-warning);
  font-weight: 600;
}

.count-danger {
  color: var(--brand-critical);
  font-weight: 600;
}

.count-supervised {
  color: oklch(0.50 0.13 60);
  font-weight: 600;
}

.gating-codes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.more-codes {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.action-cell {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.action-icon.danger {
  color: var(--brand-critical);
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.action-urgent {
  color: var(--brand-critical);
  font-weight: 500;
}

.none-text {
  color: var(--text-caption);
}

.empty-cell {
  text-align: center;
  padding: var(--space-xl);
  color: var(--text-caption);
}

.grid-wrapper {
  min-width: 0;
  height: 100%;
}

/* Force the shadcn table-container to fill the grid-wrapper height
   so the horizontal scrollbar stays within the viewport */
.grid-wrapper :deep([data-slot="table-container"]) {
  height: 100%;
  overflow: auto;
}

.grid-table .frozen-column {
  position: sticky;
  background-color: var(--bg-surface);
}

/* Header frozen cells sit above scrolling body cells */
.grid-table thead .frozen-column {
  z-index: 21;
}

.grid-table tbody .frozen-column {
  z-index: 11;
}

/* Column 1 — Employee (200px) */
.grid-table .frozen-column:nth-child(1) {
  left: 0;
  width: 200px;
  min-width: 200px;
}

/* Column 2 — Job Title (160px) */
.grid-table .frozen-column:nth-child(2) {
  left: 200px;
  width: 160px;
  min-width: 160px;
}

/* Column 3 — Dept/BU (120px) */
.grid-table .frozen-column:nth-child(3) {
  left: 360px;
  width: 120px;
  min-width: 120px;
}

/* Column 4 — Authorisation (110px) + visual separator */
.grid-table .frozen-column:nth-child(4) {
  left: 480px;
  width: 110px;
  min-width: 110px;
  border-right: var(--border-strong);
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.04);
}

.category-header {
  background-color: var(--bg-subtle);
  cursor: pointer;
  user-select: none;
}

.category-header:hover {
  background-color: var(--bg-hover);
}

.category-header-content {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  white-space: nowrap;
}

.category-count {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.category-label {
  font-size: 0.75rem;
  color: var(--text-caption);
  padding-top: var(--space-xs);
}

.competency-header {
  min-width: 70px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.competency-code {
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
}

.sub-header {
  padding: 0;
  height: 1px;
}

.grid-row {
  height: 40px;
}

.grid-row .frozen-column {
  background-color: var(--bg-surface);
}

.grid-row:hover .frozen-column {
  background-color: var(--bg-subtle);
}

.employee-cell-grid {
  left: 0;
  min-width: 200px;
}

.competency-cell {
  padding: var(--space-xs);
  text-align: center;
  vertical-align: middle;
}

.columns-dropdown {
  max-height: 400px;
  overflow-y: auto;
}

.category-summary-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  justify-content: center;
  align-items: center;
  max-width: 60px;
  margin: 0 auto;
}

.summary-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.dot-valid { background-color: var(--brand-success); }
.dot-expiring { background-color: var(--brand-warning); }
.dot-expired { background-color: var(--brand-critical); }
.dot-required { background-color: var(--text-caption); }
.dot-in-progress { background-color: var(--brand-primary); }
.dot-n-a { background-color: var(--text-caption); }

.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  background-color: var(--bg-surface);
  border-top: var(--border-subtle);
  flex-shrink: 0;
}

.legend {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.75rem;
  color: var(--text-caption);
}

.legend-chip {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

/* Legend dots — use solid brand colours so the small circles are readable */
.chip-valid    { background-color: var(--brand-success); }
.chip-expiring { background-color: var(--brand-warning); }
.chip-expired  { background-color: var(--brand-critical); }
.chip-required { background-color: var(--text-caption); }
.chip-in-progress { background-color: var(--brand-primary); }
.chip-na       { background-color: var(--text-caption); }

.refresh-info {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.75rem;
  color: var(--text-caption);
}

.employee-drawer {
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md) var(--space-lg);
  min-height: 0;
}

.drawer-section {
  margin-bottom: var(--space-lg);
}

.section-title {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-caption);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: var(--space-sm);
  padding-bottom: var(--space-xs);
  border-bottom: var(--border-subtle);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-body);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-sm);
  background-color: var(--bg-subtle);
  border: var(--border-subtle);
  border-radius: var(--radius-md);
}

.summary-item.warning {
  background-color: color-mix(in oklch, var(--brand-warning) 12%, transparent);
}

.summary-item.warning .summary-value {
  color: var(--brand-warning);
}

.summary-item.danger {
  background-color: color-mix(in oklch, var(--brand-critical) 10%, transparent);
}

.summary-item.danger .summary-value {
  color: var(--brand-critical);
}

.summary-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-heading);
}

.summary-label {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.gating-failures {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.action-box {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background-color: var(--bg-subtle);
  border: var(--border-subtle);
  border-radius: var(--radius-md);
}

.competencies-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.competency-category {
  border: var(--border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.category-name {
  padding: var(--space-xs) var(--space-sm);
  background-color: var(--bg-subtle);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-caption);
}

.category-items {
  padding: var(--space-xs);
}

.competency-row {
  display: flex;
  flex-direction: column;
  padding: var(--space-xs) var(--space-sm);
  border-bottom: var(--border-subtle);
}

.competency-row:last-child {
  border-bottom: none;
}

.comp-row-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.comp-row-right {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-shrink: 0;
}

/* ── Manager action buttons ─────────────────────────────────── */
.review-btn {
  height: 22px;
  font-size: 0.6875rem;
  padding: 0 var(--space-sm);
}

.accept-btn {
  color: var(--brand-success);
  border-color: var(--brand-success);
}

.accept-btn:hover {
  background-color: color-mix(in oklch, var(--brand-success) 10%, transparent);
}

.reject-btn {
  color: var(--brand-critical);
}

.na-btn {
  color: var(--text-caption);
}

/* ── Inline forms ────────────────────────────────────────────── */
.inline-review-form {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-xs);
  padding: var(--space-xs) var(--space-xs) 0;
  border-top: var(--border-subtle);
}

.inline-form-input {
  height: 28px;
  font-size: 0.8125rem;
  flex: 1;
}

/* ─── Responsible party badge ──────────────────────────────── */
.responsible-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  border-radius: var(--radius-full);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.responsible-manager {
  background-color: oklch(0.38 0.14 266 / 0.1);
  color: var(--brand-primary);
}

.responsible-employee {
  background-color: oklch(0.62 0.14 162 / 0.1);
  color: var(--brand-success);
}

.competency-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex: 1;
  min-width: 0;
}

.competency-code {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--brand-primary);
  white-space: nowrap;
}

.competency-title {
  font-size: 0.8125rem;
  color: var(--text-body);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gating-indicator {
  white-space: nowrap;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: var(--bg-subtle);
}
</style>
