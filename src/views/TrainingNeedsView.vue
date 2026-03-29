<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import {
  MoreHorizontal,
  Plus,
  AlertTriangle,
  UserCheck,
  GraduationCap,
  ChevronRight,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table as IoiTable } from '@ioi-dev/vue-table/unstyled'
import type { ColumnDef, CellSlotProps, SortState, RowClickPayload, HeaderFilterSlotProps } from '@ioi-dev/vue-table/unstyled'
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

const newHireCount = computed(() => {
  return trainingStore.trainingNeeds.filter(
    (n) =>
      n.createdReason === 'NEW_HIRE' && (n.workflowStatus === 'IDENTIFIED' || n.status === 'OPEN'),
  ).length
})

// ── IoiTable ──────────────────────────────────────────────────────────────────

type TrainingNeedRow = {
  id: string
  employeeDisplayName: string
  employeeInitial: string
  employeeJobTitle: string
  competencyCode: string
  competencyTitle: string
  isGatingCritical: boolean
  trainingTypeCode: string
  riskLevelCode: string
  riskIsCritical: boolean
  sourceTypeLabel: string
  sourceTypeBadgeClass: string
  sourceReference: string
  dueDate: string
  dueDateDisplay: string
  isOverdue: boolean
  workflowStatusLabel: string
  workflowStatusBadgeClass: string
  workflowStatus: string
}

const rows = computed<TrainingNeedRow[]>(() =>
  trainingStore.trainingNeeds.map((need) => {
    const emp  = getEmployee(need.erpEmployeeId)
    const comp = getCompetency(need.employeeCompetenceItemId || '')
    const dueDate = need.dueDate || ''
    const overdue =
      dueDate &&
      new Date(dueDate) < new Date() &&
      need.workflowStatus !== 'CLOSED'
    return {
      id: need.id,
      employeeDisplayName: emp.displayName ?? 'Unknown',
      employeeInitial: (emp.displayName ?? '?').charAt(0),
      employeeJobTitle: emp.jobTitle?.name ?? '',
      competencyCode: comp.code ?? '???',
      competencyTitle: comp.title ?? 'Unknown',
      isGatingCritical: comp.riskLevelCode === 'HIGH_CRITICAL',
      trainingTypeCode: need.trainingTypeCode ?? '',
      riskLevelCode: comp.riskLevelCode ?? '',
      riskIsCritical: comp.riskLevelCode === 'HIGH_CRITICAL',
      sourceTypeLabel: getSourceLabel(need.sourceType),
      sourceTypeBadgeClass: getSourceBadgeClass(need.sourceType),
      sourceReference: need.sourceReference ?? '',
      dueDate,
      dueDateDisplay: dueDate
        ? new Date(dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
        : '—',
      isOverdue: !!overdue,
      workflowStatusLabel: getWorkflowLabel(need),
      workflowStatusBadgeClass: getWorkflowBadgeClass(need),
      workflowStatus: need.workflowStatus ?? '',
    }
  }),
)

interface IoiTableRef { setSortState: (s: SortState[]) => void }
const tableRef   = ref<IoiTableRef | null>(null)
const sortStates = ref<SortState[]>([])

function getSortDir(field: string): 'asc' | 'desc' | '' {
  return sortStates.value.find(s => s.field === field)?.direction ?? ''
}

function headerSort(field: string): void {
  if (field === '_actions') return
  const cur = getSortDir(field)
  const next: SortState[] = !cur
    ? [{ field, direction: 'asc' }]
    : cur === 'asc' ? [{ field, direction: 'desc' }] : []
  sortStates.value = next
  tableRef.value?.setSortState(next)
}

function handleRowClick(payload: RowClickPayload<TrainingNeedRow>) {
  openDetails(payload.row.id)
}

function rowClass(row: TrainingNeedRow) {
  return row.workflowStatus === 'CLOSED' ? 'row-inactive clickable-row' : 'clickable-row'
}

const columns: ColumnDef<TrainingNeedRow>[] = [
  { id: 'employee',    field: 'employeeDisplayName', header: 'Employee',       type: 'text', headerFilter: 'text',   width: 200 },
  { id: 'requirement', field: 'competencyTitle',     header: 'Requirement',    type: 'text', headerFilter: 'text',   width: 220 },
  { id: 'gating',      field: 'isGatingCritical',    header: 'Gating',         type: 'text',                         width: 90  },
  { id: 'typeRisk',    field: 'trainingTypeCode',     header: 'Type & Risk',    type: 'text', headerFilter: 'select', width: 130 },
  { id: 'source',      field: 'sourceTypeLabel',      header: 'Source',         type: 'text', headerFilter: 'select', width: 160 },
  { id: 'dueDate',     field: 'dueDate',              header: 'Due Date',       type: 'text',                         width: 100 },
  { id: 'status',      field: 'workflowStatusLabel',  header: 'Status',         type: 'text', headerFilter: 'select', width: 150 },
  { id: '_actions',    field: '_actions',             header: 'Actions',                                              width: 72  },
]
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

  <Card class="data-card">
    <CardContent class="table-card-content">
      <div class="table-wrapper">
        <IoiTable
          ref="tableRef"
          :rows="rows"
          :columns="columns"
          row-key="id"
          :page-size="10000"
          :row-class="rowClass"
          aria-label="Training Needs"
          @row-click="handleRowClick"
        >
          <template #header="{ column }">
            <div
              class="sort-header"
              :class="{
                'sort-header--no-sort': column.id === '_actions',
                'sort-header--right':   column.id === '_actions',
              }"
              @click.stop="headerSort(String(column.field))"
            >
              <span>{{ column.header ?? column.field }}</span>
              <ChevronUp      v-if="getSortDir(String(column.field)) === 'asc'"  class="sort-icon" />
              <ChevronDown    v-else-if="getSortDir(String(column.field)) === 'desc'" class="sort-icon" />
              <ChevronsUpDown v-else-if="column.id !== '_actions'" class="sort-icon sort-icon-inactive" />
            </div>
          </template>

          <template #header-filter="{ column, mode, value, options, setValue }: HeaderFilterSlotProps<TrainingNeedRow>">
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

          <template #cell="{ column, row }: CellSlotProps<TrainingNeedRow>">
            <template v-if="column.field === 'employeeDisplayName'">
              <div class="table-user">
                <div class="table-avatar table-avatar-primary">{{ row.employeeInitial }}</div>
                <div class="user-info-col">
                  <span class="user-name">{{ row.employeeDisplayName }}</span>
                  <span class="user-job-title">{{ row.employeeJobTitle }}</span>
                </div>
              </div>
            </template>

            <template v-else-if="column.field === 'competencyTitle'">
              <div class="requirement-cell">
                <span class="requirement-code">{{ row.competencyCode }}</span>
                <span class="requirement-title">{{ row.competencyTitle }}</span>
              </div>
            </template>

            <template v-else-if="column.field === 'isGatingCritical'">
              <div v-if="row.isGatingCritical" class="badge badge-critical badge-compact">
                <AlertTriangle class="icon-xxs" /> Critical
              </div>
              <span v-else class="empty-indicator">—</span>
            </template>

            <template v-else-if="column.field === 'trainingTypeCode'">
              <div class="type-risk-cell">
                <span class="training-type-badge">{{ row.trainingTypeCode }}</span>
                <div class="risk-level-row">
                  <span class="status-dot" :class="row.riskIsCritical ? 'status-dot-critical' : 'status-dot-warning'"></span>
                  <span class="risk-level-text">{{ row.riskLevelCode }}</span>
                </div>
              </div>
            </template>

            <template v-else-if="column.field === 'sourceTypeLabel'">
              <div class="source-cell">
                <span class="badge badge-compact" :class="row.sourceTypeBadgeClass">{{ row.sourceTypeLabel }}</span>
                <span v-if="row.sourceReference" class="source-reference">{{ row.sourceReference }}</span>
              </div>
            </template>

            <template v-else-if="column.field === 'dueDate'">
              <div class="date-cell">
                <span class="date-text">{{ row.dueDateDisplay }}</span>
                <span v-if="row.isOverdue" class="overdue-label">Overdue</span>
              </div>
            </template>

            <template v-else-if="column.field === 'workflowStatusLabel'">
              <span class="badge" :class="row.workflowStatusBadgeClass">{{ row.workflowStatusLabel }}</span>
            </template>

            <template v-else-if="column.field === '_actions'">
              <div class="cell-right" @click.stop>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="table-action-btn" :aria-label="`Actions for ${row.employeeDisplayName}`">
                      <MoreHorizontal class="icon-xs" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="dropdown-wide">
                    <DropdownMenuItem @click="openDetails(row.id)">
                      <ChevronRight class="icon-xs icon-mr" /> Resolve...
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserCheck class="icon-xs icon-mr" /> Assign to Me
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="destructive-action">
                      <AlertCircle class="icon-xs icon-mr" /> Escalate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </template>

            <template v-else>{{ String(row[column.field as keyof TrainingNeedRow] ?? '') }}</template>
          </template>

          <template #empty>
            <div class="training-empty-state">
              <AlertCircle class="training-empty-icon" />
              <p class="training-empty-title">No training needs identified</p>
              <p class="training-empty-subtitle">
                Training needs are created when competence gaps, NCRs, or other triggers are detected.
              </p>
            </div>
          </template>
        </IoiTable>
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
  background-color: oklch(0 0 0 / 0.04);
  border: 1px solid oklch(0 0 0 / 0.12);
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

/* Table Card */
.table-card-content {
  padding: 0;
}

.table-wrapper {
  overflow-x: auto;
}

/* Table rows */
:global(.clickable-row) {
  cursor: pointer;
}

:global(.row-inactive) {
  opacity: 0.6;
}

/* Sort header */
.sort-header {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  user-select: none;
  width: 100%;
}
.sort-header--no-sort { cursor: default; }
.sort-header--right   { justify-content: flex-end; }
.sort-icon            { width: 12px; height: 12px; flex-shrink: 0; }
.sort-icon-inactive   { opacity: 0.25; }
.cell-right           { display: flex; justify-content: flex-end; width: 100%; }

/* User Cell */
.table-avatar-primary {
  background-color: oklch(0 0 0 / 0.08);
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
