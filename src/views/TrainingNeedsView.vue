<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import {
  MoreHorizontal,
  Plus,
  Filter,
  Search,
  AlertTriangle,
  Clock,
  UserCheck,
  GraduationCap,
  ChevronRight,
  AlertCircle,
} from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useTrainingNeedsStore } from '@/stores/trainingNeeds'
import { useEmployeesStore } from '@/stores/employees'
import { useCompetencyLibraryStore } from '@/stores/competencyLibrary'
import { useAuthStore } from '@/stores/auth'
import TrainingNeedDetailsSheet from '@/components/training/TrainingNeedDetailsSheet.vue'
import type { TrainingNeedSource, TrainingNeedWorkflowStatus } from '@/types'

const trainingStore = useTrainingNeedsStore()
const empStore = useEmployeesStore()
const compStore = useCompetencyLibraryStore()
const authStore = useAuthStore()

const canCreateTrainingNeed = computed(() =>
  ['SUPERVISOR', 'MANAGER', 'QHSE', 'HR_ADMIN', 'ADMIN'].includes(authStore.userRole),
)

const selectedNeedId = ref<string | null>(null)
const isDetailsOpen = ref(false)

onMounted(async () => {
  await Promise.all([
    trainingStore.fetchTrainingNeeds(),
    empStore.fetchEmployees(),
    empStore.fetchAllReferenceData(),
    compStore.fetchCompetencies(),
  ])
})

const openDetails = (id: string) => {
  selectedNeedId.value = id
  isDetailsOpen.value = true
}

const getEmployee = (id: string) => {
  const emp = empStore.employees.find((e) => e.id === id)
  if (emp) return emp
  return {
    id: 'unknown',
    displayName: 'Unknown',
    employeeNo: '???',
    jobTitle: { name: 'Unknown' },
  } as any
}

const getCompetency = (id: string) => {
  const comp = compStore.competencies.find((c) => c.id === id)
  if (comp) return comp
  return {
    id: 'unknown',
    title: 'Unknown',
    code: '???',
    riskLevelCode: 'LOW',
  } as any
}

// Source type display helpers
const sourceTypeLabels: Record<TrainingNeedSource, string> = {
  NCR_CAPA: 'NCR / CAPA',
  INCIDENT_NEAR_MISS: 'Incident / Near Miss',
  AUDIT_FINDING: 'Audit Finding',
  EXPIRY_RENEWAL: 'Expiry / Renewal',
  PROCEDURE_CHANGE: 'Procedure Change',
  NEW_EQUIPMENT: 'New Equipment',
  NEW_STARTER: 'New Starter',
  MANAGER_REQUEST: 'Manager Request',
  COMPETENCE_GAP: 'Competence Gap',
}

const sourceTypeBadgeClass: Record<TrainingNeedSource, string> = {
  NCR_CAPA: 'badge-critical',
  INCIDENT_NEAR_MISS: 'badge-critical',
  AUDIT_FINDING: 'badge-warning',
  EXPIRY_RENEWAL: 'badge-warning',
  PROCEDURE_CHANGE: 'badge-primary',
  NEW_EQUIPMENT: 'badge-primary',
  NEW_STARTER: 'badge-success',
  MANAGER_REQUEST: 'badge-neutral',
  COMPETENCE_GAP: 'badge-neutral',
}

const getSourceLabel = (sourceType?: string) =>
  sourceType ? (sourceTypeLabels[sourceType as TrainingNeedSource] ?? sourceType) : '—'

const getSourceBadgeClass = (sourceType?: string) =>
  sourceType
    ? (sourceTypeBadgeClass[sourceType as TrainingNeedSource] ?? 'badge-neutral')
    : 'badge-neutral'

// Workflow status display helpers
const workflowStatusLabels: Record<TrainingNeedWorkflowStatus, string> = {
  IDENTIFIED: 'Identified',
  APPROVED: 'Approved',
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  EVIDENCE_SUBMITTED: 'Evidence Submitted',
  EFFECTIVENESS_REVIEW: 'Effectiveness Review',
  CLOSED: 'Closed',
}

const workflowStatusBadgeClass: Record<TrainingNeedWorkflowStatus, string> = {
  IDENTIFIED: 'badge-neutral',
  APPROVED: 'badge-primary',
  SCHEDULED: 'badge-primary',
  IN_PROGRESS: 'badge-primary',
  EVIDENCE_SUBMITTED: 'badge-warning',
  EFFECTIVENESS_REVIEW: 'badge-warning',
  CLOSED: 'badge-success',
}

const getWorkflowLabel = (need: any) => {
  const ws: TrainingNeedWorkflowStatus | undefined = need.workflowStatus
  if (ws) return workflowStatusLabels[ws] ?? ws
  // Fallback to old status field
  const s = need.status
  if (s === 'OPEN') return 'Identified'
  if (s === 'IN_PROGRESS') return 'In Progress'
  if (s === 'COMPLETED') return 'Closed'
  return s
}

const getWorkflowBadgeClass = (need: any) => {
  const ws: TrainingNeedWorkflowStatus | undefined = need.workflowStatus
  if (ws) return workflowStatusBadgeClass[ws] ?? 'badge-neutral'
  const s = need.status
  if (s === 'OPEN') return 'badge-neutral'
  if (s === 'IN_PROGRESS') return 'badge-primary'
  if (s === 'COMPLETED') return 'badge-success'
  return 'badge-neutral'
}

const isGating = (need: any) => {
  const comp = getCompetency(need.employeeCompetenceItemId || '')
  return comp.riskLevelCode === 'HIGH_CRITICAL'
}

const newHireCount = computed(() => {
  return trainingStore.trainingNeeds.filter(
    (n) =>
      n.createdReason === 'NEW_HIRE' && (n.workflowStatus === 'IDENTIFIED' || n.status === 'OPEN'),
  ).length
})
</script>

<template>
  <div class="page-header">
    <div class="header-content">
      <h1 class="page-title">Training Needs & Competence Actions</h1>
      <p class="page-subtitle">
        Gap-closure actions — tracked by source, assigned with due dates, closed with evidence
      </p>
    </div>
    <div class="header-actions">
      <Button v-if="canCreateTrainingNeed" variant="outline" size="sm">
        <GraduationCap class="icon-xs icon-mr" />
        Bulk Schedule
      </Button>
      <Button v-if="canCreateTrainingNeed" size="sm">
        <Plus class="icon-xs icon-mr" />
        Create Request
      </Button>
    </div>
  </div>

  <!-- New Hire Banner -->
  <div v-if="newHireCount > 0" class="onboarding-banner">
    <div class="banner-icon">
      <UserCheck class="icon-md" />
    </div>
    <div class="banner-content">
      <span class="banner-title">New Hire Competence Onboarding</span>
      <span class="banner-description">
        There are {{ newHireCount }} new hires requiring certificate uploads or initial assessments.
      </span>
    </div>
    <Button variant="secondary" size="sm"> Handle Onboarding </Button>
  </div>

  <!-- Filters -->
  <Card class="filter-card">
    <div class="filter-toolbar">
      <div class="filter-group">
        <div class="search-wrapper">
          <Search class="search-icon icon-xs" />
          <Input
            placeholder="Search source or reference..."
            class="filter-input-search"
            v-model="trainingStore.filters.search"
          />
        </div>

        <Select v-model="trainingStore.filters.departmentId">
          <SelectTrigger class="filter-select filter-select-wide">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem v-for="dept in empStore.departments" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="trainingStore.filters.priority">
          <SelectTrigger class="filter-select filter-select-narrow">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="CRITICAL">Critical / Gating</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="trainingStore.filters.status">
          <SelectTrigger class="filter-select filter-select-narrow">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="IDENTIFIED">Identified</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="EVIDENCE_SUBMITTED">Evidence Submitted</SelectItem>
            <SelectItem value="EFFECTIVENESS_REVIEW">Effectiveness Review</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="trainingStore.filters.sourceType">
          <SelectTrigger class="filter-select filter-select-wide">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="NCR_CAPA">NCR / CAPA</SelectItem>
            <SelectItem value="AUDIT_FINDING">Audit Finding</SelectItem>
            <SelectItem value="EXPIRY_RENEWAL">Expiry / Renewal</SelectItem>
            <SelectItem value="PROCEDURE_CHANGE">Procedure Change</SelectItem>
            <SelectItem value="NEW_EQUIPMENT">New Equipment</SelectItem>
            <SelectItem value="NEW_STARTER">New Starter</SelectItem>
            <SelectItem value="INCIDENT_NEAR_MISS">Incident / Near Miss</SelectItem>
            <SelectItem value="MANAGER_REQUEST">Manager Request</SelectItem>
            <SelectItem value="COMPETENCE_GAP">Competence Gap</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" size="sm">
          <Filter class="icon-xs icon-mr" />
          More Filters
        </Button>
      </div>
    </div>
  </Card>

  <Card class="data-card">
    <CardContent class="table-card-content">
      <div class="table-wrapper">
        <Table class="dense-table">
          <TableHeader>
            <TableRow class="table-header-row">
              <TableHead class="col-employee">Employee</TableHead>
              <TableHead class="col-requirement">Requirement</TableHead>
              <TableHead class="col-gating">Gating</TableHead>
              <TableHead class="col-type">Type &amp; Risk</TableHead>
              <TableHead class="col-source">Source</TableHead>
              <TableHead class="col-date">Due Date</TableHead>
              <TableHead class="col-status">Status</TableHead>
              <TableHead class="table-actions-header">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="need in trainingStore.filteredNeeds"
              :key="need.id"
              class="clickable-row"
              :class="{ 'row-inactive': need.workflowStatus === 'CLOSED' }"
              @click="openDetails(need.id)"
            >
              <TableCell>
                <div class="table-user">
                  <div class="table-avatar table-avatar-primary">
                    {{ getEmployee(need.erpEmployeeId).displayName?.charAt(0) }}
                  </div>
                  <div class="user-info-col">
                    <span class="user-name">{{ getEmployee(need.erpEmployeeId).displayName }}</span>
                    <span class="user-job-title">{{
                      getEmployee(need.erpEmployeeId).jobTitle?.name
                    }}</span>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div class="requirement-cell">
                  <span class="requirement-code">
                    {{ getCompetency(need.employeeCompetenceItemId || '').code }}
                  </span>
                  <span class="requirement-title">
                    {{ getCompetency(need.employeeCompetenceItemId || '').title }}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div v-if="isGating(need)" class="badge badge-critical badge-compact">
                  <AlertTriangle class="icon-xxs" />
                  Critical
                </div>
                <span v-else class="empty-indicator">—</span>
              </TableCell>

              <TableCell>
                <div class="type-risk-cell">
                  <span class="training-type-badge">{{ need.trainingTypeCode }}</span>
                  <div class="risk-level-row">
                    <span
                      class="status-dot"
                      :class="
                        getCompetency(need.employeeCompetenceItemId || '').riskLevelCode ===
                        'HIGH_CRITICAL'
                          ? 'status-dot-critical'
                          : 'status-dot-warning'
                      "
                    ></span>
                    <span class="risk-level-text">{{
                      getCompetency(need.employeeCompetenceItemId || '').riskLevelCode
                    }}</span>
                  </div>
                </div>
              </TableCell>

              <!-- Source column (replaces Reason) -->
              <TableCell>
                <div class="source-cell">
                  <span class="badge badge-compact" :class="getSourceBadgeClass(need.sourceType)">
                    {{ getSourceLabel(need.sourceType) }}
                  </span>
                  <span v-if="need.sourceReference" class="source-reference">
                    {{ need.sourceReference }}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div class="date-cell">
                  <span class="date-text">{{
                    new Date(need.dueDate || '').toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                    })
                  }}</span>
                  <span
                    v-if="
                      need.dueDate &&
                      new Date(need.dueDate) < new Date() &&
                      need.workflowStatus !== 'CLOSED'
                    "
                    class="overdue-label"
                    >Overdue</span
                  >
                </div>
              </TableCell>

              <TableCell>
                <span class="badge" :class="getWorkflowBadgeClass(need)">
                  {{ getWorkflowLabel(need) }}
                </span>
              </TableCell>

              <TableCell class="table-actions-cell" @click.stop>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="table-action-btn"
                      :aria-label="`Actions for ${getEmployee(need.erpEmployeeId).displayName}`"
                    >
                      <MoreHorizontal class="icon-xs" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="dropdown-wide">
                    <DropdownMenuItem @click="openDetails(need.id)">
                      <ChevronRight class="icon-xs icon-mr" />
                      Resolve...
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserCheck class="icon-xs icon-mr" />
                      Assign to Me
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="destructive-action">
                      <AlertCircle class="icon-xs icon-mr" />
                      Escalate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            <TableRow v-if="trainingStore.filteredNeeds.length === 0">
              <TableCell colspan="8" class="training-empty-cell">
                <div class="training-empty-state">
                  <AlertCircle class="training-empty-icon" />
                  <p class="training-empty-title">No training needs identified</p>
                  <p class="training-empty-subtitle">
                    Training needs are created when competence gaps, NCRs, or other triggers are
                    detected.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  <TrainingNeedDetailsSheet
    :isOpen="isDetailsOpen"
    :needId="selectedNeedId"
    @update:isOpen="isDetailsOpen = $event"
  />
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-xl);
}

.header-content {
  flex: 1;
}

.header-actions {
  display: flex;
  gap: var(--space-sm);
}

/* Banner */
.onboarding-banner {
  background-color: oklch(0.38 0.14 266 / 0.08);
  border: 1px solid oklch(0.38 0.14 266 / 0.2);
  border-radius: var(--radius-lg);
  padding: var(--space-md) var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.banner-icon {
  width: 40px;
  height: 40px;
  background-color: var(--bg-surface);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--brand-primary);
  box-shadow: var(--shadow-card);
}

.banner-content {
  flex: 1;
}

.banner-title {
  display: block;
  font-weight: 600;
  color: var(--text-heading);
  font-size: 0.9375rem;
}

.banner-description {
  display: block;
  font-size: 0.8125rem;
  color: var(--text-body);
}

/* Filter Card */
.filter-card {
  background: transparent;
  border: none;
  box-shadow: none;
  margin-bottom: var(--space-lg);
}

.filter-card :deep(.card-content) {
  padding: 0;
}

.filter-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  width: 280px;
}

.search-icon {
  position: absolute;
  left: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-caption);
  pointer-events: none;
}

.filter-input-search {
  padding-left: calc(var(--space-sm) * 2.5);
}

.filter-select {
  background-color: var(--bg-surface);
}

.filter-select-wide {
  width: 180px;
}

.filter-select-narrow {
  width: 150px;
}

/* Table Card */
.table-card-content {
  padding: 0;
}

.table-wrapper {
  overflow-x: auto;
}

/* Table Header */
.table-header-row {
  background-color: var(--bg-subtle);
}

.col-employee {
  width: 200px;
}
.col-requirement {
  width: 220px;
}
.col-gating {
  width: 90px;
}
.col-type {
  width: 130px;
}
.col-source {
  width: 160px;
}
.col-date {
  width: 100px;
}
.col-status {
  width: 150px;
}

/* Table Rows */
.clickable-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.clickable-row:hover {
  background-color: var(--bg-hover);
}

.row-inactive {
  opacity: 0.6;
}

/* User Cell */
.table-avatar-primary {
  background-color: oklch(0.38 0.14 266 / 0.1);
  color: var(--brand-primary);
  font-weight: 500;
}

.user-info-col {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: var(--text-heading);
}

.user-job-title {
  font-size: 0.75rem;
  color: var(--text-caption);
}

/* Requirement Cell */
.requirement-cell {
  display: flex;
  flex-direction: column;
}

.requirement-code {
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--text-caption);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  line-height: 1;
  margin-bottom: 2px;
}

.requirement-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-heading);
  line-height: 1.3;
}

/* Badge Compact */
.badge-compact {
  font-size: 9px;
  padding: 2px 6px;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
  display: inline-flex;
  align-items: center;
}

.empty-indicator {
  font-size: 0.625rem;
  color: var(--text-caption);
  opacity: 0.4;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-left: var(--space-xs);
}

/* Type & Risk Cell */
.type-risk-cell {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.training-type-badge {
  font-size: 0.625rem;
  font-weight: 700;
  background-color: var(--bg-subtle);
  padding: 2px 4px;
  border-radius: var(--radius-sm);
  color: var(--text-caption);
  letter-spacing: 0.02em;
}

.risk-level-row {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
}

.status-dot-critical {
  background-color: var(--brand-critical);
}

.status-dot-warning {
  background-color: var(--brand-warning);
}

.risk-level-text {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--text-caption);
}

/* Source Cell */
.source-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.source-reference {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-caption);
  letter-spacing: 0.02em;
  font-family: var(--font-mono, monospace);
}

/* Date Cell */
.date-cell {
  display: flex;
  flex-direction: column;
}

.date-text {
  font-size: 0.875rem;
}

.overdue-label {
  font-size: 0.625rem;
  color: var(--brand-critical);
  font-weight: 700;
  text-transform: uppercase;
}

/* Dropdown */
.dropdown-wide {
  width: 200px;
}

/* Empty state */
.training-empty-cell {
  padding: 0;
}

.training-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-2xl) var(--space-lg);
  text-align: center;
}

.training-empty-icon {
  width: 36px;
  height: 36px;
  color: var(--text-caption);
  opacity: 0.5;
}

.training-empty-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0;
}

.training-empty-subtitle {
  font-size: 0.8125rem;
  color: var(--text-caption);
  max-width: 480px;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--space-md);
  }

  .header-actions {
    width: 100%;
  }

  .search-wrapper {
    width: 100%;
  }

  .filter-group {
    width: 100%;
  }

  .filter-select-wide,
  .filter-select-narrow {
    width: 100%;
  }
}
</style>
