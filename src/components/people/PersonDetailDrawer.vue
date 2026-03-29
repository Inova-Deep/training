<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ShieldAlert, ShieldCheck, Search, MoreHorizontal } from 'lucide-vue-next'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Table as IoiTable } from '@ioi-dev/vue-table/unstyled'
import type { ColumnDef, CellSlotProps } from '@ioi-dev/vue-table/unstyled'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { StatusChip } from '@/components/ui/status-chip'
import { useSkillsMatrixStore, type SupervisionStatus, type EmployeeCompetenceItem } from '@/stores/skillsMatrix'
import { useTrainingNeedsStore } from '@/stores/trainingNeeds'
import { roleAudienceIncludes } from '@/lib/demoDomain'
import type { Employee } from '@/api/client'
import type { TrainingNeedSource, TrainingNeedWorkflowStatus } from '@/types'
import evidenceData from '@/data/employeeEvidence.json'
import awarenessTopicsData from '@/data/awarenessTopics.json'

// ─── Types ─────────────────────────────────────────────────────────────────────

type PersonSheetTab = 'profile' | 'competencies' | 'training-history'
type DerivedStatus = EmployeeCompetenceItem['derivedStatus']

interface EvidenceRecord {
  id: string
  title: string
  type: string
  competencyCode: string
  issuer: string
  issueDate: string
  expiryDate: string | null
  reviewStatus: string
}

interface AwarenessTopic {
  id: string
  title: string
  category?: string
  dueDate: string
  workflowStatus: string
  requiredAudience: string[]
}

// ─── Props / Emits ─────────────────────────────────────────────────────────────

const props = defineProps<{
  open: boolean
  employee: Employee | null
  initialTab?: PersonSheetTab
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

// ─── Stores ────────────────────────────────────────────────────────────────────

const matrixStore = useSkillsMatrixStore()
const trainingStore = useTrainingNeedsStore()

// ─── State ─────────────────────────────────────────────────────────────────────

const activeTab = ref<PersonSheetTab>('profile')
const compSearch = ref('')

// ─── Computed — matrix row ──────────────────────────────────────────────────────

const matrixRow = computed(() =>
  props.employee ? (matrixStore.getEmployeeById(props.employee.id) ?? null) : null,
)

// ─── statusMap ─────────────────────────────────────────────────────────────────

const statusMap: Record<SupervisionStatus, { label: string; badgeClass: string }> = {
  FIT_FOR_INDEPENDENT_WORK: { label: 'Independent', badgeClass: 'badge-success' },
  SUPERVISED_ONLY: { label: 'Supervised', badgeClass: 'badge-warning' },
  RESTRICTED_SCOPE: { label: 'Restricted Scope', badgeClass: 'badge-warning' },
  REASSESSMENT_REQUIRED: { label: 'Reassessment Due', badgeClass: 'badge-warning' },
  NON_COMPLIANT_MANDATORY: { label: 'Non-Compliant', badgeClass: 'badge-critical' },
}

const workStatusInfo = computed(() => {
  if (!matrixRow.value) return null
  return statusMap[matrixRow.value.supervisionStatus]
})

const showRestrictionsBanner = computed(() => {
  if (!matrixRow.value) return false
  return (
    matrixRow.value.supervisionStatus === 'SUPERVISED_ONLY' ||
    matrixRow.value.supervisionStatus === 'RESTRICTED_SCOPE' ||
    matrixRow.value.supervisionStatus === 'NON_COMPLIANT_MANDATORY'
  )
})

const restrictionItems = computed(() => matrixRow.value?.gatingFailed ?? [])

// ─── Helpers — copied from MyCompetenciesView (pure functions) ─────────────────

function getActionRequired(item: EmployeeCompetenceItem, compCode?: string): string {
  switch (item.derivedStatus) {
    case 'REQUIRED':
      return 'Complete training'
    case 'IN_PROGRESS':
      return 'Submit evidence'
    case 'EXPIRED':
      return compCode ? `Renew ${compCode}` : 'Renew certification'
    case 'EXPIRING':
      return 'Schedule renewal'
    case 'UNDER_SUPERVISION':
      return 'Await supervisor sign-off'
    default:
      return '—'
  }
}

function getResponsible(item: EmployeeCompetenceItem): string {
  switch (item.derivedStatus) {
    case 'REQUIRED':
      return 'Employee'
    case 'IN_PROGRESS':
      return 'Manager'
    case 'EXPIRED':
      return item.isGating ? 'Employee + Manager' : 'Employee'
    case 'EXPIRING':
      return 'Employee'
    case 'UNDER_SUPERVISION':
      return 'Line Manager'
    default:
      return 'Employee'
  }
}

function getExpiryClass(item: EmployeeCompetenceItem): string {
  if (item.derivedStatus === 'EXPIRED') return 'expiry-expired'
  if (item.derivedStatus === 'EXPIRING') return 'expiry-expiring'
  return ''
}

// Severity ordering for competencies
const SEVERITY_ORDER: Record<DerivedStatus, number> = {
  EXPIRED: 0,
  REQUIRED: 1,
  EXPIRING: 2,
  UNDER_SUPERVISION: 3,
  IN_PROGRESS: 4,
  VALID: 5,
  N_A: 6,
  PARTIALLY_MET: 7,
  REASSESSMENT_DUE: 8,
}

// ─── Profile tab — competency data ────────────────────────────────────────────

const GAP_STATUSES = new Set<DerivedStatus>([
  'REQUIRED', 'EXPIRED', 'UNDER_SUPERVISION', 'EXPIRING', 'IN_PROGRESS',
])

const allCompetencies = computed(() => {
  const result: Array<{ id: string; code: string; title: string }> = []
  for (const [, comps] of matrixStore.competenciesByCategory) {
    for (const comp of comps) {
      result.push({ id: comp.id, code: comp.code, title: comp.title })
    }
  }
  return result
})

const topOpenGaps = computed(() => {
  if (!matrixRow.value) return []
  const gaps: Array<{
    id: string
    code: string
    title: string
    item: EmployeeCompetenceItem
  }> = []
  for (const comp of allCompetencies.value) {
    const item = matrixRow.value.competenceItems.get(comp.id)
    if (!item || !GAP_STATUSES.has(item.derivedStatus)) continue
    gaps.push({ id: comp.id, code: comp.code, title: comp.title, item })
  }
  gaps.sort(
    (a, b) => (SEVERITY_ORDER[a.item.derivedStatus] ?? 9) - (SEVERITY_ORDER[b.item.derivedStatus] ?? 9),
  )
  return gaps.slice(0, 5)
})

const upcomingExpiries = computed(() => {
  if (!matrixRow.value) return []
  const items: Array<{ code: string; title: string; expiryDate: string }> = []
  for (const comp of allCompetencies.value) {
    const item = matrixRow.value.competenceItems.get(comp.id)
    if (!item || item.derivedStatus !== 'EXPIRING' || !item.expiryDate) continue
    items.push({ code: comp.code, title: comp.title, expiryDate: item.expiryDate })
  }
  return items.slice(0, 5)
})

// ─── Awareness (role-filtered) ─────────────────────────────────────────────────

const awarenessTopics = computed((): AwarenessTopic[] => {
  if (!props.employee) return []
  const jt = props.employee.jobTitle?.name ?? ''
  return (awarenessTopicsData as AwarenessTopic[]).filter((topic) => {
    if (!Array.isArray(topic.requiredAudience)) return false
    return roleAudienceIncludes(topic.requiredAudience, jt)
  })
})

// ─── Evidence (mock, unscoped) ────────────────────────────────────────────────

const allEvidence = evidenceData as EvidenceRecord[]

// ─── Competencies tab ─────────────────────────────────────────────────────────

const filteredCompetencies = computed(() => {
  if (!matrixRow.value) return []
  const q = compSearch.value.toLowerCase().trim()
  const items: Array<{
    id: string
    code: string
    title: string
    item: EmployeeCompetenceItem
  }> = []
  for (const comp of allCompetencies.value) {
    const item = matrixRow.value.competenceItems.get(comp.id)
    if (!item) continue
    if (q && !comp.code.toLowerCase().includes(q) && !comp.title.toLowerCase().includes(q)) continue
    items.push({ id: comp.id, code: comp.code, title: comp.title, item })
  }
  items.sort(
    (a, b) => (SEVERITY_ORDER[a.item.derivedStatus] ?? 9) - (SEVERITY_ORDER[b.item.derivedStatus] ?? 9),
  )
  return items
})

// ─── Training History tab ─────────────────────────────────────────────────────

// Source type helpers — exact strings from TrainingNeedsView
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

function getSourceLabel(sourceType?: string): string {
  return sourceType ? (sourceTypeLabels[sourceType as TrainingNeedSource] ?? sourceType) : '—'
}

function getSourceBadgeClass(sourceType?: string): string {
  return sourceType
    ? (sourceTypeBadgeClass[sourceType as TrainingNeedSource] ?? 'badge-neutral')
    : 'badge-neutral'
}

// Workflow status helpers — exact strings from TrainingNeedsView
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

function getWorkflowLabel(need: { workflowStatus?: TrainingNeedWorkflowStatus; status?: string }): string {
  const ws = need.workflowStatus
  if (ws) return workflowStatusLabels[ws] ?? ws
  const s = need.status
  if (s === 'OPEN') return 'Identified'
  if (s === 'IN_PROGRESS') return 'In Progress'
  if (s === 'COMPLETED') return 'Closed'
  return s ?? '—'
}

function getWorkflowBadgeClass(need: { workflowStatus?: TrainingNeedWorkflowStatus; status?: string }): string {
  const ws = need.workflowStatus
  if (ws) return workflowStatusBadgeClass[ws] ?? 'badge-neutral'
  const s = need.status
  if (s === 'OPEN') return 'badge-neutral'
  if (s === 'IN_PROGRESS') return 'badge-primary'
  if (s === 'COMPLETED') return 'badge-success'
  return 'badge-neutral'
}

const employeeNeeds = computed(() => {
  if (!props.employee) return []
  return trainingStore.trainingNeeds.filter((n) => n.erpEmployeeId === props.employee!.id)
})

const openNeeds = computed(() =>
  employeeNeeds.value.filter((n) => n.workflowStatus !== 'CLOSED'),
)

const closedNeeds = computed(() =>
  employeeNeeds.value.filter((n) => n.workflowStatus === 'CLOSED'),
)

function getCompetencyLabel(competenceItemId?: string): { code: string; title: string } {
  if (!competenceItemId) return { code: '—', title: '—' }
  const comp = matrixStore.getCompetencyById(competenceItemId)
  return { code: comp?.code ?? '—', title: comp?.title ?? competenceItemId }
}

function isOverdue(dueDate?: string, workflowStatus?: TrainingNeedWorkflowStatus): boolean {
  if (!dueDate || workflowStatus === 'CLOSED') return false
  return new Date(dueDate) < new Date()
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatShortDate(dateStr?: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

// ─── Helper — format employee name ────────────────────────────────────────────

function formatName(emp: Employee): string {
  return emp.displayName || `${emp.firstName} ${emp.lastName}`
}

// ─── Awareness workflow status badge class ────────────────────────────────────

function getAwarenessBadgeClass(workflowStatus: string): string {
  switch (workflowStatus) {
    case 'CLOSED': return 'badge-success'
    case 'IN_COMMUNICATION': return 'badge-primary'
    case 'ISSUED': return 'badge-primary'
    case 'AWAITING_ACKNOWLEDGEMENT': return 'badge-warning'
    case 'VERIFICATION_PENDING': return 'badge-warning'
    default: return 'badge-neutral'
  }
}

// ─── IoiTable column definitions ─────────────────────────────────────────────

type CompRow = {
  id: string
  code: string
  title: string
  isGating: boolean
  derivedStatus: string
  actionRequired: string
  responsible: string
  lastAssessed: string
  expiry: string
  expiryClass: string
  _item: EmployeeCompetenceItem
}

const compColumns: ColumnDef<CompRow>[] = [
  { id: 'competency',    field: 'title',          header: 'Competency',      type: 'text' },
  { id: 'gating',        field: 'isGating',       header: 'Gating',          type: 'text', width: 80  },
  { id: 'status',        field: 'derivedStatus',  header: 'Status',          type: 'text', width: 140 },
  { id: 'action',        field: 'actionRequired', header: 'Action Required', type: 'text' },
  { id: 'responsible',   field: 'responsible',    header: 'Responsible',     type: 'text', width: 130 },
  { id: 'lastAssessed',  field: 'lastAssessed',   header: 'Last Assessed',   type: 'text', width: 120 },
  { id: 'expiry',        field: 'expiry',         header: 'Expiry',          type: 'text', width: 110 },
  { id: '_actions',      field: '_actions',       header: 'Actions',                       width: 72  },
]

const compRows = computed<CompRow[]>(() =>
  filteredCompetencies.value.map((comp) => ({
    id: comp.id,
    code: comp.code,
    title: comp.title,
    isGating: comp.item.isGating,
    derivedStatus: comp.item.derivedStatus,
    actionRequired: getActionRequired(comp.item, comp.code),
    responsible: getResponsible(comp.item),
    lastAssessed: comp.item.lastCompletedAt ? formatDate(comp.item.lastCompletedAt) : '—',
    expiry: comp.item.expiryDate ? formatDate(comp.item.expiryDate) : '—',
    expiryClass: getExpiryClass(comp.item),
    _item: comp.item,
  })),
)

type TnRow = {
  id: string
  competencyCode: string
  competencyTitle: string
  sourceBadgeClass: string
  sourceLabel: string
  dueDateDisplay: string
  isOverdue: boolean
  workflowBadgeClass: string
  workflowLabel: string
}

const tnColumns: ColumnDef<TnRow>[] = [
  { id: 'requirement', field: 'competencyTitle', header: 'Requirement', type: 'text' },
  { id: 'source',      field: 'sourceLabel',     header: 'Source',      type: 'text', width: 150 },
  { id: 'dueDate',     field: 'dueDateDisplay',  header: 'Due Date',    type: 'text', width: 100 },
  { id: 'status',      field: 'workflowLabel',   header: 'Status',      type: 'text', width: 160 },
]

const openNeedRows = computed<TnRow[]>(() =>
  openNeeds.value.map((need) => {
    const { code, title } = getCompetencyLabel(need.employeeCompetenceItemId)
    return {
      id: need.id,
      competencyCode: code,
      competencyTitle: title,
      sourceBadgeClass: getSourceBadgeClass(need.sourceType),
      sourceLabel: getSourceLabel(need.sourceType),
      dueDateDisplay: formatShortDate(need.dueDate),
      isOverdue: isOverdue(need.dueDate, need.workflowStatus),
      workflowBadgeClass: getWorkflowBadgeClass(need),
      workflowLabel: getWorkflowLabel(need),
    }
  }),
)

const closedNeedRows = computed<TnRow[]>(() =>
  closedNeeds.value.map((need) => {
    const { code, title } = getCompetencyLabel(need.employeeCompetenceItemId)
    return {
      id: need.id,
      competencyCode: code,
      competencyTitle: title,
      sourceBadgeClass: getSourceBadgeClass(need.sourceType),
      sourceLabel: getSourceLabel(need.sourceType),
      dueDateDisplay: formatShortDate(need.dueDate),
      isOverdue: false,
      workflowBadgeClass: getWorkflowBadgeClass(need),
      workflowLabel: getWorkflowLabel(need),
    }
  }),
)

// ─── Watcher — reset tab on employee change ───────────────────────────────────

watch(
  () => [props.employee?.id, props.initialTab] as const,
  ([, initialTab]) => {
    activeTab.value = initialTab ?? 'profile'
    compSearch.value = ''
  },
  { immediate: true },
)
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent class="person-drawer">
      <!-- Visually hidden title/description for accessibility -->
      <SheetHeader>
        <SheetTitle class="visually-hidden">Employee Workspace</SheetTitle>
        <SheetDescription class="visually-hidden">
          Summary workspace for the selected employee
        </SheetDescription>
      </SheetHeader>

      <div v-if="!employee" class="drawer-empty-state">
        Select an employee to view their profile.
      </div>

      <Tabs v-else v-model="activeTab" class="drawer-body">
        <!-- ── Sticky top: header + tabs ─────────────────────────── -->
        <div class="drawer-top">
          <!-- Row 1: Identity + badges -->
          <div class="drawer-header">
            <div class="drawer-header-row1">
              <div class="drawer-avatar">
                {{ employee.firstName.charAt(0) }}{{ employee.lastName.charAt(0) }}
              </div>
              <div class="drawer-identity">
                <p class="drawer-name">{{ formatName(employee) }}</p>
                <p class="drawer-role">{{ employee.jobTitle?.name || '—' }}</p>
                <p class="drawer-org">
                  {{ employee.department?.name || '—' }}
                  <template v-if="employee.businessUnit?.name">
                    · {{ employee.businessUnit.name }}
                  </template>
                </p>
              </div>
              <div class="drawer-header-badges">
                <span
                  v-if="workStatusInfo"
                  class="badge"
                  :class="workStatusInfo.badgeClass"
                >
                  {{ workStatusInfo.label }}
                </span>
                <span
                  class="badge"
                  :class="employee.status === 'active' ? 'badge-success' : 'badge-neutral'"
                >
                  {{ employee.status === 'active' ? 'Active' : 'Inactive' }}
                </span>
                <span v-if="!workStatusInfo" class="badge badge-neutral">No Matrix Data</span>
              </div>
            </div>

            <!-- Row 2: Manager · Employee No + stat strip -->
            <div class="drawer-header-row2">
              <span v-if="employee.manager">
                Manager:
                {{
                  employee.manager.displayName ||
                  `${employee.manager.firstName ?? ''} ${employee.manager.lastName ?? ''}`.trim()
                }}
              </span>
              <span v-if="employee.employeeNo">· No. {{ employee.employeeNo }}</span>

              <div v-if="matrixRow" class="drawer-stat-strip">
                <div class="drawer-stat-item">
                  <span
                    class="drawer-stat-value"
                    :class="matrixRow.expiredCount > 0 ? 'drawer-stat-value-critical' : 'drawer-stat-value-success'"
                  >{{ matrixRow.expiredCount }}</span>
                  <span class="drawer-stat-label">Expired</span>
                </div>
                <div class="drawer-stat-item">
                  <span
                    class="drawer-stat-value"
                    :class="matrixRow.expiringCount > 0 ? 'drawer-stat-value-warning' : 'drawer-stat-value-success'"
                  >{{ matrixRow.expiringCount }}</span>
                  <span class="drawer-stat-label">Expiring</span>
                </div>
                <div class="drawer-stat-item">
                  <span
                    class="drawer-stat-value"
                    :class="matrixRow.requiredCount > 0 ? 'drawer-stat-value-warning' : 'drawer-stat-value-success'"
                  >{{ matrixRow.requiredCount }}</span>
                  <span class="drawer-stat-label">Required</span>
                </div>
                <div class="drawer-stat-item">
                  <span class="drawer-stat-value drawer-stat-value-success">{{ matrixRow.validCount }}</span>
                  <span class="drawer-stat-label">Valid</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Restriction banner (below row 2, before tabs) -->
          <div v-if="showRestrictionsBanner" class="drawer-restriction-banner">
            <ShieldAlert class="restriction-icon-sm" />
            <div>
              <p class="restriction-title-sm">
                {{
                  matrixRow?.supervisionStatus === 'NON_COMPLIANT_MANDATORY'
                    ? 'Non-Compliant — Work Restricted'
                    : 'Supervision Required'
                }}
              </p>
              <p class="restriction-body-sm">
                {{
                  matrixRow?.supervisionStatus === 'NON_COMPLIANT_MANDATORY'
                    ? 'This employee cannot perform independent work until mandatory items are renewed.'
                    : 'This employee must work under supervision until gating items are fully met.'
                }}
              </p>
              <div v-if="restrictionItems.length" class="restriction-items-sm">
                <span
                  v-for="item in restrictionItems"
                  :key="item"
                  class="badge badge-critical badge-sm"
                >
                  {{ item }}
                </span>
              </div>
            </div>
          </div>

          <!-- Tab bar -->
          <div class="drawer-tabs">
            <TabsList class="person-tabs-list">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="competencies">Competencies</TabsTrigger>
              <TabsTrigger value="training-history">Training History</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <!-- ── Tab panels ────────────────────────────────────────── -->
        <div class="drawer-panels">

          <!-- ── PROFILE TAB ──────────────────────────────────────── -->
          <TabsContent value="profile" class="person-tab-content">

            <!-- 1. Role context -->
            <div class="drawer-section">
              <p class="drawer-section-label">Role Context</p>
              <div class="drawer-dl">
                <span class="drawer-dl-label">Employee No</span>
                <span class="drawer-dl-value">{{ employee.employeeNo || '—' }}</span>

                <span class="drawer-dl-label">Job Title</span>
                <span class="drawer-dl-value">{{ employee.jobTitle?.name || '—' }}</span>

                <span class="drawer-dl-label">Department</span>
                <span class="drawer-dl-value">{{ employee.department?.name || '—' }}</span>

                <span class="drawer-dl-label">Business Unit</span>
                <span class="drawer-dl-value">{{ employee.businessUnit?.name || '—' }}</span>

                <span class="drawer-dl-label">Manager</span>
                <span class="drawer-dl-value">
                  <template v-if="employee.manager">
                    {{
                      employee.manager.displayName ||
                      `${employee.manager.firstName ?? ''} ${employee.manager.lastName ?? ''}`.trim()
                    }}
                  </template>
                  <template v-else>—</template>
                </span>
              </div>
            </div>

            <Separator />

            <!-- 2. Authorisation status -->
            <div class="drawer-section">
              <p class="drawer-section-label">Authorisation Status</p>
              <template v-if="matrixRow">
                <div v-if="matrixRow.supervisionStatus === 'FIT_FOR_INDEPENDENT_WORK'" class="iwa-positive">
                  <ShieldCheck class="iwa-icon-sm" />
                  <span>Authorised for Independent Work</span>
                </div>
                <template v-else>
                  <div class="drawer-dl">
                    <span class="drawer-dl-label">Status</span>
                    <span class="drawer-dl-value">
                      <span class="badge" :class="workStatusInfo?.badgeClass">
                        {{ workStatusInfo?.label }}
                      </span>
                    </span>
                    <template v-if="restrictionItems.length">
                      <span class="drawer-dl-label">Blocking items</span>
                      <span class="drawer-dl-value">
                        <span
                          v-for="g in restrictionItems"
                          :key="g"
                          class="badge badge-critical badge-sm"
                          style="margin-right: 4px"
                        >{{ g }}</span>
                      </span>
                    </template>
                  </div>
                </template>
              </template>
              <p v-else class="drawer-section-empty">No matrix data available for this employee.</p>
            </div>

            <Separator />

            <!-- 3. Top open gaps (max 5) -->
            <div class="drawer-section">
              <p class="drawer-section-label">Top Open Gaps</p>
              <template v-if="topOpenGaps.length">
                <div
                  v-for="gap in topOpenGaps"
                  :key="gap.id"
                  class="drawer-gap-row"
                >
                  <span class="drawer-gap-code">{{ gap.code }}</span>
                  <span class="drawer-gap-title">{{ gap.title }}</span>
                  <div class="drawer-gap-chips">
                    <StatusChip :status="gap.item.derivedStatus" :compact="true" />
                    <span v-if="gap.item.isGating" class="badge badge-critical">Gating</span>
                  </div>
                  <span class="drawer-gap-action">{{ getActionRequired(gap.item, gap.code) }}</span>
                </div>
              </template>
              <p v-else class="drawer-section-empty">No open gaps identified.</p>
            </div>

            <Separator />

            <!-- 4. Upcoming expiries (max 5) -->
            <div class="drawer-section">
              <p class="drawer-section-label">Upcoming Expiries</p>
              <template v-if="upcomingExpiries.length">
                <div
                  v-for="exp in upcomingExpiries"
                  :key="exp.code"
                  class="drawer-expiry-row"
                >
                  <span class="drawer-gap-code">{{ exp.code }}</span>
                  <span class="drawer-gap-title">{{ exp.title }}</span>
                  <span class="drawer-expiry-date drawer-expiry-date-warn">{{ formatDate(exp.expiryDate) }}</span>
                </div>
              </template>
              <p v-else class="drawer-section-empty">No items expiring soon.</p>
            </div>

            <Separator />

            <!-- 5. Evidence on file (mock, unscoped) -->
            <div class="drawer-section">
              <p class="drawer-section-label">Evidence on File</p>
              <p class="drawer-data-note">
                Mock data — not scoped to this employee. Shown for illustrative purposes only.
              </p>
              <div class="drawer-evidence-list">
                <div
                  v-for="ev in allEvidence"
                  :key="ev.id"
                  class="drawer-evidence-item"
                >
                  <span class="drawer-evidence-title">{{ ev.title }}</span>
                  <span class="badge badge-success">{{ ev.reviewStatus }}</span>
                  <span class="drawer-evidence-meta">
                    {{ ev.type }} · {{ ev.issuer }}
                    <template v-if="ev.expiryDate"> · Exp {{ formatDate(ev.expiryDate) }}</template>
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <!-- 6. Awareness topics (role-filtered) -->
            <div class="drawer-section">
              <p class="drawer-section-label">Awareness Topics</p>
              <p class="drawer-data-note">
                Role-based awareness topics — individual acknowledgement status is not tracked here.
              </p>
              <template v-if="awarenessTopics.length">
                <div class="drawer-awareness-list">
                  <div
                    v-for="topic in awarenessTopics"
                    :key="topic.id"
                    class="drawer-awareness-item"
                  >
                    <span class="drawer-awareness-title">{{ topic.title }}</span>
                    <span class="drawer-awareness-meta">Due {{ formatDate(topic.dueDate) }} · {{ topic.category }}</span>
                    <div class="drawer-awareness-badge">
                      <span class="badge" :class="getAwarenessBadgeClass(topic.workflowStatus)">
                        {{ topic.workflowStatus.replace(/_/g, ' ').toLowerCase() }}
                      </span>
                    </div>
                  </div>
                </div>
              </template>
              <p v-else class="drawer-section-empty">No awareness topics for this role.</p>
            </div>

          </TabsContent>

          <!-- ── COMPETENCIES TAB ─────────────────────────────────── -->
          <TabsContent value="competencies" class="person-tab-content">

            <template v-if="matrixRow">
              <!-- KPI strip -->
              <div class="drawer-kpi-strip">
                <div class="drawer-kpi-item">
                  <span class="drawer-kpi-value drawer-stat-value-success">{{ matrixRow.validCount }}</span>
                  <span class="drawer-kpi-label">Valid</span>
                </div>
                <div class="drawer-kpi-item">
                  <span
                    class="drawer-kpi-value"
                    :class="matrixRow.expiringCount > 0 ? 'drawer-stat-value-warning' : 'drawer-stat-value-success'"
                  >{{ matrixRow.expiringCount }}</span>
                  <span class="drawer-kpi-label">Expiring</span>
                </div>
                <div class="drawer-kpi-item">
                  <span
                    class="drawer-kpi-value"
                    :class="matrixRow.expiredCount > 0 ? 'drawer-stat-value-critical' : 'drawer-stat-value-success'"
                  >{{ matrixRow.expiredCount }}</span>
                  <span class="drawer-kpi-label">Expired</span>
                </div>
                <div class="drawer-kpi-item">
                  <span
                    class="drawer-kpi-value"
                    :class="matrixRow.requiredCount > 0 ? 'drawer-stat-value-warning' : 'drawer-stat-value-success'"
                  >{{ matrixRow.requiredCount }}</span>
                  <span class="drawer-kpi-label">Required</span>
                </div>
              </div>

              <!-- Note banner -->
              <p class="drawer-data-note">
                Competency status is computed from role requirements using seeded synthetic data. Individual assessment records are not stored.
              </p>

              <!-- Search -->
              <div class="comp-search-wrapper">
                <Search class="comp-search-icon icon-xs" />
                <Input
                  v-model="compSearch"
                  class="comp-search-input"
                  placeholder="Search competency title or code..."
                  aria-label="Search competencies"
                />
              </div>

              <!-- Competency table -->
              <div class="comp-table-wrapper">
                <IoiTable
                  :rows="compRows"
                  :columns="compColumns"
                  row-key="id"
                  :page-size="10000"
                  aria-label="Competencies"
                >
                  <template #cell="{ column, row }: CellSlotProps<CompRow>">
                    <template v-if="column.field === 'title'">
                      <div class="comp-cell">
                        <span class="comp-code-label">{{ row.code }}</span>
                        <span class="comp-title-label">{{ row.title }}</span>
                      </div>
                    </template>
                    <template v-else-if="column.field === 'isGating'">
                      <span v-if="row.isGating" class="badge badge-critical badge-sm">Gating</span>
                      <span v-else class="text-muted">—</span>
                    </template>
                    <template v-else-if="column.field === 'derivedStatus'">
                      <StatusChip :status="row.derivedStatus as any" compact />
                    </template>
                    <template v-else-if="column.field === 'actionRequired'">
                      <span class="comp-action-text">{{ row.actionRequired }}</span>
                    </template>
                    <template v-else-if="column.field === 'responsible'">
                      <span class="comp-action-text">{{ row.responsible }}</span>
                    </template>
                    <template v-else-if="column.field === 'lastAssessed'">
                      <span class="comp-action-text">{{ row.lastAssessed }}</span>
                    </template>
                    <template v-else-if="column.field === 'expiry'">
                      <span class="comp-action-text" :class="row.expiryClass">{{ row.expiry }}</span>
                    </template>
                    <template v-else-if="column.field === '_actions'">
                      <div class="cell-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger as-child>
                            <Button variant="ghost" size="icon" class="table-action-btn" :aria-label="`Actions for ${row.title}`">
                              <MoreHorizontal class="icon-xs" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Request Reassessment</DropdownMenuItem>
                            <DropdownMenuItem>Upload Evidence</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </template>
                  </template>
                  <template #empty>
                    <div class="empty-cell">No competencies match your search.</div>
                  </template>
                </IoiTable>
              </div>
            </template>
            <p v-else class="drawer-section-empty">No competency matrix data for this employee.</p>

          </TabsContent>

          <!-- ── TRAINING HISTORY TAB ─────────────────────────────── -->
          <TabsContent value="training-history" class="person-tab-content">

            <!-- Loading state -->
            <div v-if="trainingStore.isLoading" class="drawer-section">
              <p class="drawer-section-empty">Loading training needs…</p>
            </div>

            <template v-else>
              <!-- Empty state: shown only when both active and completed are empty -->
              <div v-if="openNeeds.length === 0 && closedNeeds.length === 0" class="drawer-section">
                <p class="drawer-section-empty">No training needs recorded for this employee.</p>
              </div>

              <!-- Section A: Open / Active -->
              <div v-if="openNeeds.length > 0" class="drawer-section">
                <p class="drawer-section-label">Open / Active</p>
                <div class="comp-table-wrapper">
                  <IoiTable
                    :rows="openNeedRows"
                    :columns="tnColumns"
                    row-key="id"
                    :page-size="10000"
                    aria-label="Open Training Needs"
                  >
                    <template #cell="{ column, row }: CellSlotProps<TnRow>">
                      <template v-if="column.field === 'competencyTitle'">
                        <div class="comp-cell">
                          <span class="comp-code-label">{{ row.competencyCode }}</span>
                          <span class="comp-title-label">{{ row.competencyTitle }}</span>
                        </div>
                      </template>
                      <template v-else-if="column.field === 'sourceLabel'">
                        <span class="badge" :class="row.sourceBadgeClass">{{ row.sourceLabel }}</span>
                      </template>
                      <template v-else-if="column.field === 'dueDateDisplay'">
                        <div class="tn-date-cell">
                          <span>{{ row.dueDateDisplay }}</span>
                          <span v-if="row.isOverdue" class="overdue-tag">Overdue</span>
                        </div>
                      </template>
                      <template v-else-if="column.field === 'workflowLabel'">
                        <span class="badge" :class="row.workflowBadgeClass">{{ row.workflowLabel }}</span>
                      </template>
                    </template>
                  </IoiTable>
                </div>
              </div>

              <Separator v-if="openNeeds.length > 0 && closedNeeds.length > 0" />

              <!-- Section B: Completed -->
              <div v-if="closedNeeds.length > 0" class="drawer-section">
                <p class="drawer-section-label">Completed</p>
                <div class="comp-table-wrapper">
                  <IoiTable
                    :rows="closedNeedRows"
                    :columns="tnColumns"
                    row-key="id"
                    :page-size="10000"
                    row-class="row-inactive"
                    aria-label="Completed Training Needs"
                  >
                    <template #cell="{ column, row }: CellSlotProps<TnRow>">
                      <template v-if="column.field === 'competencyTitle'">
                        <div class="comp-cell">
                          <span class="comp-code-label">{{ row.competencyCode }}</span>
                          <span class="comp-title-label">{{ row.competencyTitle }}</span>
                        </div>
                      </template>
                      <template v-else-if="column.field === 'sourceLabel'">
                        <span class="badge" :class="row.sourceBadgeClass">{{ row.sourceLabel }}</span>
                      </template>
                      <template v-else-if="column.field === 'dueDateDisplay'">
                        <span>{{ row.dueDateDisplay }}</span>
                      </template>
                      <template v-else-if="column.field === 'workflowLabel'">
                        <span class="badge" :class="row.workflowBadgeClass">{{ row.workflowLabel }}</span>
                      </template>
                    </template>
                  </IoiTable>
                </div>
              </div>

              <Separator v-if="openNeeds.length > 0 || closedNeeds.length > 0" />

              <!-- Evidence on file (mock, unscoped) -->
              <div class="drawer-section">
                <p class="drawer-section-label">Evidence on File</p>
                <p class="drawer-data-note">
                  Mock data — not scoped to this employee. Shown for illustrative purposes only.
                </p>
                <div class="drawer-evidence-list">
                  <div
                    v-for="ev in allEvidence"
                    :key="ev.id"
                    class="drawer-evidence-item"
                  >
                    <span class="drawer-evidence-title">{{ ev.title }}</span>
                    <span class="badge badge-success">{{ ev.reviewStatus }}</span>
                    <span class="drawer-evidence-meta">
                      {{ ev.type }} · {{ ev.issuer }}
                      <template v-if="ev.expiryDate"> · Exp {{ formatDate(ev.expiryDate) }}</template>
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <!-- Awareness topics (role-filtered) -->
              <div class="drawer-section">
                <p class="drawer-section-label">Awareness Topics</p>
                <p class="drawer-data-note">
                  Role-based awareness topics — individual acknowledgement status is not tracked here.
                </p>
                <template v-if="awarenessTopics.length">
                  <div class="drawer-awareness-list">
                    <div
                      v-for="topic in awarenessTopics"
                      :key="topic.id"
                      class="drawer-awareness-item"
                    >
                      <span class="drawer-awareness-title">{{ topic.title }}</span>
                      <span class="drawer-awareness-meta">Due {{ formatDate(topic.dueDate) }} · {{ topic.category }}</span>
                      <div class="drawer-awareness-badge">
                        <span class="badge" :class="getAwarenessBadgeClass(topic.workflowStatus)">
                          {{ topic.workflowStatus.replace(/_/g, ' ').toLowerCase() }}
                        </span>
                      </div>
                    </div>
                  </div>
                </template>
                <p v-else class="drawer-section-empty">No awareness topics for this role.</p>
              </div>

            </template>
          </TabsContent>

        </div>
      </Tabs>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
.person-drawer {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.drawer-empty-state {
  padding: var(--space-xl);
  text-align: center;
  color: var(--text-caption);
}

.drawer-body {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}

.person-tab-content {
  margin-top: 0;
}

/* Restriction banner internal layout */
.restriction-icon-sm {
  width: 18px;
  height: 18px;
  color: var(--brand-critical);
  flex-shrink: 0;
  margin-top: 2px;
}

.restriction-title-sm {
  margin: 0 0 2px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--brand-critical);
}

.restriction-body-sm {
  margin: 0 0 4px;
  font-size: 0.75rem;
  color: var(--text-body);
}

.restriction-items-sm {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-top: var(--space-xs);
}

.badge-sm {
  font-size: 0.6875rem;
  padding: 1px 6px;
  height: auto;
}

/* Tab list in drawer */
.person-tabs-list {
  width: fit-content;
  gap: var(--space-xs);
  padding: 0.25rem;
}

/* IWA positive state */
.iwa-positive {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--brand-success);
  font-size: 0.875rem;
  font-weight: 500;
}

.iwa-icon-sm {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Expiry text colours */
.expiry-expired {
  color: var(--brand-critical);
  font-weight: 600;
}

.expiry-expiring {
  color: var(--brand-warning);
  font-weight: 600;
}

/* Gap action text in gap rows */
.drawer-gap-action {
  font-size: 0.75rem;
  color: var(--text-caption);
  white-space: nowrap;
  margin-left: auto;
}

/* Evidence main block */
.evidence-main {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

/* Competency table search */
.comp-search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin: var(--space-sm) 0;
}

.comp-search-icon {
  position: absolute;
  left: var(--space-sm);
  color: var(--text-caption);
  pointer-events: none;
}

.comp-search-input {
  padding-left: 2.25rem;
  width: 100%;
}

.comp-table-wrapper {
  overflow-x: auto;
}

/* Competency cell — code + title stacked */
.comp-cell {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.comp-code-label {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-caption);
  line-height: 1;
}

.comp-title-label {
  font-size: 0.8125rem;
  color: var(--text-heading);
  line-height: 1.3;
}

.comp-action-text {
  font-size: 0.8125rem;
  color: var(--text-body);
}

.cell-right {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

/* Training Needs date cell */
.tn-date-cell {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.overdue-tag {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--brand-critical);
}

@media (max-width: 768px) {
  .person-tabs-list {
    width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
  }

  .drawer-header-row1 {
    flex-wrap: wrap;
  }

  .drawer-header-badges {
    margin-left: 0;
  }

  .drawer-stat-strip {
    margin-left: 0;
  }
}
</style>
