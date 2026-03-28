<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { ChevronDown, ChevronUp, FileText, ShieldAlert, User } from 'lucide-vue-next'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { useSkillsMatrixStore, type SupervisionStatus } from '@/stores/skillsMatrix'
import { useAuthStore } from '@/stores/auth'
import type { Employee } from '@/api/client'
import employeeEvidenceData from '@/data/employeeEvidence.json'
import awarenessTopicsData from '@/data/awarenessTopics.json'
import { matchRoleName } from '@/lib/demoDomain'

// Props
type PersonSheetTab = 'profile' | 'competencies' | 'training-history'

const props = defineProps<{
  open: boolean
  employee: Employee | null
  initialTab?: PersonSheetTab
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

// Stores
const matrixStore = useSkillsMatrixStore()
const authStore = useAuthStore()
const activeTab = ref<PersonSheetTab>('profile')

// Access control
const canTakeAction = computed(
  () => authStore.userRole === 'MANAGER' || authStore.userRole === 'HR_ADMIN',
)

// Matrix row for this employee
const matrixRow = computed(() =>
  props.employee ? (matrixStore.getEmployeeById(props.employee.id) ?? null) : null,
)

// Work status badge helper
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

// Competency table rows
interface CompetencyTableRow {
  competencyId: string
  code: string
  title: string
  isGating: boolean
  derivedStatus: string
  isGap: boolean
  expiryDate: string | undefined
  lastCompletedAt: string | undefined
}

const competencyRows = computed((): CompetencyTableRow[] => {
  if (!matrixRow.value) return []
  const rows: CompetencyTableRow[] = []
  for (const [compId, item] of matrixRow.value.competenceItems.entries()) {
    const comp = matrixStore.getCompetencyById(compId)
    if (!comp) continue
    const isGap = ['REQUIRED', 'EXPIRED', 'UNDER_SUPERVISION', 'EXPIRING'].includes(
      item.derivedStatus,
    )
    rows.push({
      competencyId: compId,
      code: comp.code,
      title: comp.title,
      isGating: item.isGating,
      derivedStatus: item.derivedStatus,
      isGap,
      expiryDate: item.expiryDate,
      lastCompletedAt: item.lastCompletedAt,
    })
  }
  rows.sort((a, b) => {
    if (a.isGating && !b.isGating) return -1
    if (!a.isGating && b.isGating) return 1
    return a.code.localeCompare(b.code)
  })
  return rows
})

const openGaps = computed(() => competencyRows.value.filter((r) => r.isGap))

// Status badge helpers
function statusBadgeClass(status: string): string {
  switch (status) {
    case 'VALID':
      return 'badge-success'
    case 'EXPIRING':
      return 'badge-warning'
    case 'EXPIRED':
      return 'badge-critical'
    case 'REQUIRED':
      return 'badge-neutral'
    case 'IN_PROGRESS':
      return 'badge-primary'
    case 'UNDER_SUPERVISION':
      return 'badge-warning'
    default:
      return 'badge-neutral'
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'VALID':
      return 'Valid'
    case 'EXPIRING':
      return 'Expiring'
    case 'EXPIRED':
      return 'Expired'
    case 'REQUIRED':
      return 'Required'
    case 'IN_PROGRESS':
      return 'In Progress'
    case 'UNDER_SUPERVISION':
      return 'Under Supervision'
    case 'N_A':
      return 'N/A'
    default:
      return status
  }
}

function gapSeverityClass(row: CompetencyTableRow): string {
  if (row.isGating && (row.derivedStatus === 'EXPIRED' || row.derivedStatus === 'REQUIRED'))
    return 'badge-critical'
  if (row.derivedStatus === 'EXPIRED') return 'badge-critical'
  if (row.isGating && row.derivedStatus === 'UNDER_SUPERVISION') return 'badge-warning'
  if (row.derivedStatus === 'EXPIRING') return 'badge-warning'
  return 'badge-neutral'
}

function gapSeverityLabel(row: CompetencyTableRow): string {
  if (row.isGating && (row.derivedStatus === 'EXPIRED' || row.derivedStatus === 'REQUIRED'))
    return 'Critical'
  if (row.derivedStatus === 'EXPIRED') return 'High'
  if (row.isGating && row.derivedStatus === 'UNDER_SUPERVISION') return 'High'
  if (row.derivedStatus === 'EXPIRING') return 'Moderate'
  return 'Low'
}

// Evidence records
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

const evidenceRecords = computed((): EvidenceRecord[] => {
  return employeeEvidenceData as EvidenceRecord[]
})

// Assessment history (mock)
interface AssessmentEvent {
  date: string
  competency: string
  method: string
  outcome: string
  assessor: string
}

const assessmentHistory = computed((): AssessmentEvent[] => {
  if (!props.employee) return []
  const hash = props.employee.id.charCodeAt(0) % 5
  const allEvents: AssessmentEvent[] = [
    {
      date: '2025-11-14',
      competency: 'LOTO',
      method: 'Practical Observation',
      outcome: 'Pass',
      assessor: 'David Clarke',
    },
    {
      date: '2025-09-22',
      competency: 'ROBOT-OP',
      method: 'Practical Demonstration',
      outcome: 'Pass',
      assessor: 'James Roberts',
    },
    {
      date: '2025-07-05',
      competency: 'AM-SETUP',
      method: 'Practical Demonstration',
      outcome: 'Pass',
      assessor: 'David Clarke',
    },
    {
      date: '2025-04-18',
      competency: 'HSE-IND',
      method: 'Record Review',
      outcome: 'Pass',
      assessor: 'Sarah Bennett',
    },
    {
      date: '2025-02-10',
      competency: 'WELD',
      method: 'External Exam',
      outcome: 'Pass',
      assessor: 'TWI Certification',
    },
  ]
  const start = hash % 3
  return allEvents.slice(start, start + 4)
})

// Awareness acknowledgements
interface AwarenessTopic {
  id: string
  title: string
  targetAudience: string
  dueDate: string
  status: string
  workflowStatus?: string
}

const relevantAwarenessTopics = computed((): { topic: AwarenessTopic; acknowledged: boolean }[] => {
  if (!props.employee) return []
  const jobTitleName = props.employee.jobTitle?.name ?? ''
  const deptName = (props.employee.department?.name ?? '').toLowerCase()

  return (awarenessTopicsData as AwarenessTopic[])
    .map((topic) => {
      const audience = (topic.targetAudience ?? '').toLowerCase()
      const relevant =
        audience.includes('all') ||
        audience.split(/[,/]/).some((a) => {
          const trimmed = a.trim()
          return matchRoleName(trimmed, jobTitleName) || trimmed.includes(deptName)
        })
      if (!relevant) return null
      const hash = (props.employee!.id.charCodeAt(0) + topic.id.charCodeAt(topic.id.length - 1)) % 3
      return { topic, acknowledged: hash !== 0 }
    })
    .filter((x): x is { topic: AwarenessTopic; acknowledged: boolean } => x !== null)
})

// Training needs (mock subset for demo)
const MOCK_TRAINING_NEEDS = [
  {
    id: 'tn-a',
    title: 'LOTO Renewal',
    source: 'EXPIRY_RENEWAL',
    status: 'IDENTIFIED',
    interventionType: 'CERTIFICATION_RENEWAL',
  },
  {
    id: 'tn-b',
    title: 'AM Setup Practical',
    source: 'COMPETENCE_GAP',
    status: 'IN_PROGRESS',
    interventionType: 'COACHING_OJT',
  },
  {
    id: 'tn-c',
    title: 'HSE Toolbox Talk',
    source: 'AUDIT_FINDING',
    status: 'APPROVED',
    interventionType: 'TOOLBOX_TALK',
  },
]

const trainingNeeds = computed(() => {
  if (!matrixRow.value) return []
  const hash = (props.employee?.id.charCodeAt(0) ?? 0) % 3
  return MOCK_TRAINING_NEEDS.slice(0, hash + 1)
})

// Restrictions banner
const showRestrictionsBanner = computed(() => {
  if (!matrixRow.value) return false
  return (
    matrixRow.value.supervisionStatus === 'SUPERVISED_ONLY' ||
    matrixRow.value.supervisionStatus === 'RESTRICTED_SCOPE' ||
    matrixRow.value.supervisionStatus === 'NON_COMPLIANT_MANDATORY'
  )
})

const restrictionItems = computed(() => matrixRow.value?.gatingFailed ?? [])

// Section collapse state
const sectionsOpen = ref({
  requirements: true,
  gaps: true,
  evidence: true,
  history: false,
  awareness: false,
  training: false,
})

function toggleSection(key: keyof typeof sectionsOpen.value) {
  sectionsOpen.value[key] = !sectionsOpen.value[key]
}

// Actions
function startReassessment(competencyCode: string) {
  toast.success(`Reassessment initiated for ${competencyCode}`)
}

function assignIntervention(competencyCode: string) {
  toast.success(`Training need created for ${competencyCode}`)
}

function recordEvidence() {
  toast.success('Evidence upload submitted for review')
}

function changeSupervisionStatus() {
  const statuses: SupervisionStatus[] = [
    'FIT_FOR_INDEPENDENT_WORK',
    'SUPERVISED_ONLY',
    'RESTRICTED_SCOPE',
  ]
  if (!matrixRow.value) return
  const currentIndex = statuses.indexOf(matrixRow.value.supervisionStatus as SupervisionStatus)
  const next = statuses[(currentIndex + 1) % statuses.length]!
  const labels: Record<string, string> = {
    FIT_FOR_INDEPENDENT_WORK: 'Independent',
    SUPERVISED_ONLY: 'Supervised Only',
    RESTRICTED_SCOPE: 'Restricted Scope',
  }
  toast.success(`Supervision status updated to ${labels[next] ?? next}`)
}

// Scroll to sections
const trainingSection = ref<HTMLElement | null>(null)
const awarenessSection = ref<HTMLElement | null>(null)

function scrollToTraining() {
  sectionsOpen.value.training = true
  setTimeout(() => trainingSection.value?.scrollIntoView({ behavior: 'smooth' }), 50)
}

function scrollToAwareness() {
  sectionsOpen.value.awareness = true
  setTimeout(() => awarenessSection.value?.scrollIntoView({ behavior: 'smooth' }), 50)
}

function formatName(emp: Employee): string {
  return emp.displayName || `${emp.firstName} ${emp.lastName}`
}

watch(
  () => [props.employee?.id, props.initialTab] as const,
  ([, initialTab]) => {
    activeTab.value = initialTab ?? 'profile'
  },
  { immediate: true },
)
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent class="person-drawer">
      <SheetHeader>
        <SheetTitle class="visually-hidden">Person Detail</SheetTitle>
        <SheetDescription class="visually-hidden"
          >Full readiness profile for the selected employee</SheetDescription
        >
      </SheetHeader>

      <div v-if="!employee" class="drawer-empty">Select an employee to view their profile.</div>

      <div v-else class="drawer-body">
        <!-- 1. Person Header -->
        <div class="person-header-section">
          <div class="person-avatar-block">
            <div class="person-avatar-lg">
              {{ employee.firstName.charAt(0) }}{{ employee.lastName.charAt(0) }}
            </div>
            <div class="person-meta">
              <h2 class="person-name">{{ formatName(employee) }}</h2>
              <p class="person-sub">{{ employee.jobTitle?.name || '—' }}</p>
              <p class="person-sub muted">
                {{ employee.department?.name || '—' }} · {{ employee.businessUnit?.name || '—' }}
              </p>
              <p v-if="employee.manager" class="person-sub muted">
                Manager:
                {{
                  employee.manager.displayName ||
                  `${employee.manager.firstName ?? ''} ${employee.manager.lastName ?? ''}`.trim()
                }}
              </p>
            </div>
          </div>
          <div class="person-header-badges">
            <span v-if="workStatusInfo" class="badge" :class="workStatusInfo.badgeClass">{{
              workStatusInfo.label
            }}</span>
            <span v-else class="badge badge-neutral">No Matrix Data</span>
          </div>
          <div v-if="canTakeAction && matrixRow" class="person-header-actions">
            <Button size="sm" variant="outline" @click="changeSupervisionStatus">
              <User class="icon-xs icon-mr" />
              Change Status
            </Button>
            <Button size="sm" variant="ghost" @click="scrollToTraining">View Training Needs</Button>
            <Button size="sm" variant="ghost" @click="scrollToAwareness"
              >View Awareness Topics</Button
            >
          </div>
        </div>

        <!-- Restrictions banner -->
        <div v-if="showRestrictionsBanner" class="restriction-banner">
          <ShieldAlert class="restriction-icon" />
          <div>
            <p class="restriction-title">
              {{
                matrixRow?.supervisionStatus === 'NON_COMPLIANT_MANDATORY'
                  ? 'Non-Compliant — Work Restricted'
                  : 'Supervision Required'
              }}
            </p>
            <p class="restriction-body">
              {{
                matrixRow?.supervisionStatus === 'NON_COMPLIANT_MANDATORY'
                  ? 'This employee cannot perform independent work until mandatory safety certifications are renewed.'
                  : 'This employee must work under supervision. The following gating items are not fully met:'
              }}
            </p>
            <div v-if="restrictionItems.length" class="restriction-items">
              <span
                v-for="item in restrictionItems"
                :key="item"
                class="badge badge-critical badge-sm"
                >{{ item }}</span
              >
            </div>
          </div>
        </div>

        <!-- Readiness summary cards -->
        <div v-if="matrixRow" class="readiness-cards">
          <div class="readiness-card">
            <span
              class="readiness-card-value"
              :class="matrixRow.expiredCount > 0 ? 'value-red' : 'value-green'"
              >{{ matrixRow.expiredCount }}</span
            >
            <span class="readiness-card-label">Expired</span>
          </div>
          <div class="readiness-card">
            <span
              class="readiness-card-value"
              :class="matrixRow.expiringCount > 0 ? 'value-amber' : 'value-green'"
              >{{ matrixRow.expiringCount }}</span
            >
            <span class="readiness-card-label">Expiring</span>
          </div>
          <div class="readiness-card">
            <span
              class="readiness-card-value"
              :class="matrixRow.requiredCount > 0 ? 'value-amber' : 'value-green'"
              >{{ matrixRow.requiredCount }}</span
            >
            <span class="readiness-card-label">Required</span>
          </div>
          <div class="readiness-card">
            <span class="readiness-card-value value-green">{{ matrixRow.validCount }}</span>
            <span class="readiness-card-label">Valid</span>
          </div>
        </div>

        <!-- 2. Role Requirements vs Current -->
        <div class="drawer-section">
          <button class="section-header" @click="toggleSection('requirements')">
            <span class="section-title">Role Requirements vs Current</span>
            <ChevronUp v-if="sectionsOpen.requirements" class="icon-sm" />
            <ChevronDown v-else class="icon-sm" />
          </button>
          <div v-if="sectionsOpen.requirements" class="section-content">
            <div v-if="competencyRows.length === 0" class="section-empty">
              No competency data available.
            </div>
            <div v-else class="mini-table-wrapper">
              <Table class="dense-table mini-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Competency</TableHead>
                    <TableHead>Gating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gap</TableHead>
                    <TableHead>Last Assessed</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead v-if="canTakeAction">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="row in competencyRows" :key="row.competencyId">
                    <TableCell>
                      <span class="comp-code">{{ row.code }}</span>
                      <span class="comp-title-small">{{ row.title }}</span>
                    </TableCell>
                    <TableCell>
                      <span v-if="row.isGating" class="badge badge-primary badge-sm">Gating</span>
                      <span v-else class="text-muted-sm">—</span>
                    </TableCell>
                    <TableCell>
                      <span class="badge badge-sm" :class="statusBadgeClass(row.derivedStatus)">
                        {{ statusLabel(row.derivedStatus) }}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span v-if="row.isGap" class="badge badge-sm badge-critical">Yes</span>
                      <span v-else class="text-muted-sm">No</span>
                    </TableCell>
                    <TableCell class="text-muted-sm">{{ row.lastCompletedAt || '—' }}</TableCell>
                    <TableCell class="text-muted-sm">{{ row.expiryDate || '—' }}</TableCell>
                    <TableCell v-if="canTakeAction">
                      <Button
                        v-if="row.isGap"
                        size="sm"
                        variant="ghost"
                        class="action-link"
                        @click="startReassessment(row.code)"
                      >
                        Reassess
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <!-- 3. Open Gaps -->
        <div class="drawer-section">
          <button class="section-header" @click="toggleSection('gaps')">
            <span class="section-title">
              Open Gaps
              <span v-if="openGaps.length" class="section-count">{{ openGaps.length }}</span>
            </span>
            <ChevronUp v-if="sectionsOpen.gaps" class="icon-sm" />
            <ChevronDown v-else class="icon-sm" />
          </button>
          <div v-if="sectionsOpen.gaps" class="section-content">
            <div v-if="openGaps.length === 0" class="section-empty section-empty-success">
              No open gaps — all competencies are current.
            </div>
            <div v-else class="gaps-list">
              <div v-for="gap in openGaps" :key="gap.competencyId" class="gap-item">
                <div class="gap-item-info">
                  <span class="comp-code">{{ gap.code }}</span>
                  <span class="gap-title">{{ gap.title }}</span>
                </div>
                <div class="gap-item-meta">
                  <span class="badge badge-sm" :class="statusBadgeClass(gap.derivedStatus)">{{
                    statusLabel(gap.derivedStatus)
                  }}</span>
                  <span class="badge badge-sm" :class="gapSeverityClass(gap)">{{
                    gapSeverityLabel(gap)
                  }}</span>
                </div>
                <div v-if="canTakeAction" class="gap-item-actions">
                  <Button
                    size="sm"
                    variant="ghost"
                    class="action-link"
                    @click="startReassessment(gap.code)"
                    >Reassess</Button
                  >
                  <Button
                    size="sm"
                    variant="ghost"
                    class="action-link"
                    @click="assignIntervention(gap.code)"
                    >Assign Intervention</Button
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Evidence & Attachments -->
        <div class="drawer-section">
          <button class="section-header" @click="toggleSection('evidence')">
            <span class="section-title">Evidence &amp; Attachments</span>
            <ChevronUp v-if="sectionsOpen.evidence" class="icon-sm" />
            <ChevronDown v-else class="icon-sm" />
          </button>
          <div v-if="sectionsOpen.evidence" class="section-content">
            <div v-if="canTakeAction" class="section-action-row">
              <Button size="sm" variant="outline" @click="recordEvidence">
                <FileText class="icon-xs icon-mr" />
                Record Evidence
              </Button>
            </div>
            <div class="mini-table-wrapper">
              <Table class="dense-table mini-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Competency</TableHead>
                    <TableHead>Issuer</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="ev in evidenceRecords" :key="ev.id">
                    <TableCell class="text-muted-sm">{{ ev.type }}</TableCell>
                    <TableCell
                      ><span class="comp-code">{{ ev.competencyCode }}</span></TableCell
                    >
                    <TableCell class="text-muted-sm">{{ ev.issuer }}</TableCell>
                    <TableCell class="text-muted-sm">{{ ev.issueDate }}</TableCell>
                    <TableCell class="text-muted-sm">{{ ev.expiryDate || 'No Expiry' }}</TableCell>
                    <TableCell>
                      <span
                        class="badge badge-sm"
                        :class="ev.reviewStatus === 'Accepted' ? 'badge-success' : 'badge-neutral'"
                      >
                        {{ ev.reviewStatus }}
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <!-- 5. Assessment History -->
        <div class="drawer-section">
          <button class="section-header" @click="toggleSection('history')">
            <span class="section-title">Assessment History</span>
            <ChevronUp v-if="sectionsOpen.history" class="icon-sm" />
            <ChevronDown v-else class="icon-sm" />
          </button>
          <div v-if="sectionsOpen.history" class="section-content">
            <div class="mini-table-wrapper">
              <Table class="dense-table mini-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Competency</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Assessor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="(ev, idx) in assessmentHistory" :key="idx">
                    <TableCell class="text-muted-sm">{{ ev.date }}</TableCell>
                    <TableCell
                      ><span class="comp-code">{{ ev.competency }}</span></TableCell
                    >
                    <TableCell class="text-muted-sm">{{ ev.method }}</TableCell>
                    <TableCell>
                      <span
                        class="badge badge-sm"
                        :class="ev.outcome === 'Pass' ? 'badge-success' : 'badge-critical'"
                        >{{ ev.outcome }}</span
                      >
                    </TableCell>
                    <TableCell class="text-muted-sm">{{ ev.assessor }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <!-- 6. Awareness Acknowledgements -->
        <div ref="awarenessSection" class="drawer-section">
          <button class="section-header" @click="toggleSection('awareness')">
            <span class="section-title">Awareness Acknowledgements</span>
            <ChevronUp v-if="sectionsOpen.awareness" class="icon-sm" />
            <ChevronDown v-else class="icon-sm" />
          </button>
          <div v-if="sectionsOpen.awareness" class="section-content">
            <div v-if="relevantAwarenessTopics.length === 0" class="section-empty">
              No awareness topics assigned to this role.
            </div>
            <div v-else class="awareness-list">
              <div
                v-for="{ topic, acknowledged } in relevantAwarenessTopics"
                :key="topic.id"
                class="awareness-item"
              >
                <div class="awareness-info">
                  <span class="awareness-title">{{ topic.title }}</span>
                  <span class="text-muted-sm">Due: {{ topic.dueDate }}</span>
                </div>
                <span
                  class="badge badge-sm"
                  :class="acknowledged ? 'badge-success' : 'badge-warning'"
                >
                  {{ acknowledged ? 'Acknowledged' : 'Pending' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 7. Training Actions -->
        <div ref="trainingSection" class="drawer-section">
          <button class="section-header" @click="toggleSection('training')">
            <span class="section-title">Training Actions</span>
            <ChevronUp v-if="sectionsOpen.training" class="icon-sm" />
            <ChevronDown v-else class="icon-sm" />
          </button>
          <div v-if="sectionsOpen.training" class="section-content">
            <div v-if="trainingNeeds.length === 0" class="section-empty">
              No training actions in progress.
            </div>
            <div v-else class="mini-table-wrapper">
              <Table class="dense-table mini-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Intervention</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="need in trainingNeeds" :key="need.id">
                    <TableCell class="text-muted-sm">{{ need.title }}</TableCell>
                    <TableCell class="text-muted-sm">{{
                      need.source.replace(/_/g, ' ')
                    }}</TableCell>
                    <TableCell>
                      <span class="badge badge-sm badge-neutral">{{
                        need.status.replace(/_/g, ' ')
                      }}</span>
                    </TableCell>
                    <TableCell class="text-muted-sm">{{
                      need.interventionType?.replace(/_/g, ' ') || '—'
                    }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
.person-drawer {
  width: min(680px, 92vw) !important;
  max-width: 680px;
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

.drawer-empty {
  padding: var(--space-xl);
  text-align: center;
  color: var(--text-caption);
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* Person Header */
.person-header-section {
  background: var(--bg-card);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.person-avatar-block {
  display: flex;
  gap: var(--space-md);
  align-items: flex-start;
}

.person-avatar-lg {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  background: var(--color-primary, #6366f1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.person-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.person-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0;
}

.person-sub {
  font-size: 0.8125rem;
  color: var(--text-body);
  margin: 0;
}

.person-sub.muted {
  color: var(--text-caption);
}

.person-header-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.person-header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  padding-top: var(--space-xs);
  border-top: var(--border-subtle);
}

/* Restriction Banner */
.restriction-banner {
  display: flex;
  gap: var(--space-sm);
  background: rgba(220, 38, 38, 0.06);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
}

.restriction-icon {
  width: 20px;
  height: 20px;
  color: #dc2626;
  flex-shrink: 0;
  margin-top: 2px;
}

.restriction-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #dc2626;
  margin: 0 0 4px;
}

.restriction-body {
  font-size: 0.8125rem;
  color: var(--text-body);
  margin: 0 0 6px;
}

.restriction-items {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

/* Readiness Cards */
.readiness-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
}

.readiness-card {
  background: var(--bg-subtle);
  border: var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.readiness-card-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.readiness-card-label {
  font-size: 0.6875rem;
  color: var(--text-caption);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.value-red {
  color: #dc2626;
}
.value-amber {
  color: #d97706;
}
.value-green {
  color: #16a34a;
}

/* Sections */
.drawer-section {
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.section-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-subtle);
  border: none;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-heading);
  text-align: left;
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.section-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 0 0.25rem;
  background: rgba(220, 38, 38, 0.15);
  color: #dc2626;
}

.section-content {
  padding: var(--space-sm);
}

.section-empty {
  text-align: center;
  padding: var(--space-md);
  font-size: 0.8125rem;
  color: var(--text-caption);
}

.section-empty-success {
  color: #16a34a;
}

.section-action-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--space-sm);
}

/* Mini tables */
.mini-table-wrapper {
  overflow-x: auto;
}
.mini-table {
  font-size: 0.75rem;
}

.comp-code {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  background: var(--bg-subtle);
  padding: 1px 4px;
  border-radius: 3px;
  display: inline-block;
  margin-right: 4px;
}

.comp-title-small {
  font-size: 0.75rem;
  color: var(--text-body);
}

.text-muted-sm {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.badge-sm {
  font-size: 0.6875rem;
  padding: 1px 6px;
  height: auto;
}

.action-link {
  font-size: 0.6875rem;
  height: 1.5rem;
  padding: 0 0.375rem;
}

/* Gaps */
.gaps-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.gap-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: var(--bg-card);
  border: var(--border-subtle);
  border-radius: var(--radius-md);
}

.gap-item-info {
  flex: 1;
  min-width: 120px;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.gap-title {
  font-size: 0.75rem;
  color: var(--text-body);
}

.gap-item-meta {
  display: flex;
  gap: var(--space-xs);
}
.gap-item-actions {
  display: flex;
  gap: var(--space-xs);
}

/* Awareness */
.awareness-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.awareness-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xs) var(--space-sm);
  background: var(--bg-card);
  border: var(--border-subtle);
  border-radius: var(--radius-md);
}

.awareness-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.awareness-title {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-body);
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
</style>
