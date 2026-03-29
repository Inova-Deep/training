<script setup lang="ts">
import { ref, computed } from 'vue'
import { onMounted } from 'vue'
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Eye,
  FileText,
  Award,
  Wrench,
  ClipboardList,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Upload,
  RotateCcw,
  History,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'
import { useEmployeesStore } from '@/stores/employees'
import { useSkillsMatrixStore, type EmployeeCompetenceItem } from '@/stores/skillsMatrix'
import { StatusChip } from '@/components/ui/status-chip'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import AssessmentRecordSheet from '@/components/competency/AssessmentRecordSheet.vue'
import evidenceData from '@/data/employeeEvidence.json'
import awarenessTopicsData from '@/data/awarenessTopics.json'
import { matchRoleName, roleAudienceIncludes } from '@/lib/demoDomain'

// ─── Stores ───────────────────────────────────────────────────────────────────

const authStore = useAuthStore()
const employeesStore = useEmployeesStore()
const matrixStore = useSkillsMatrixStore()

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface AssessmentHistoryEntry {
  date: string
  method: string
  outcome: string
  assessor: string
}

// ─── Init ──────────────────────────────────────────────────────────────────────

onMounted(async () => {
  if (matrixStore.mockEmployeeRows.length === 0) {
    await employeesStore.fetchEmployees()
    await matrixStore.fetchAndBuildMatrix(employeesStore.filteredEmployees)
  }
})

// ─── Profile data ─────────────────────────────────────────────────────────────

const linkedJobTitle = computed(() => authStore.activePersona.linkedJobTitle)

const myRow = computed(() => {
  if (!linkedJobTitle.value) return null
  return matrixStore.mockEmployeeRows.find((r) => matchRoleName(r.jobTitle, linkedJobTitle.value!)) ?? null
})

const alertItems = computed(() => {
  if (!myRow.value) return []
  return [...myRow.value.competenceItems.values()].filter(
    (item) => item.derivedStatus === 'EXPIRING' || item.derivedStatus === 'EXPIRED',
  )
})

const stats = computed(() => {
  if (!myRow.value) return { valid: 0, supervised: 0, expiring: 0, expired: 0, required: 0 }
  return {
    valid: myRow.value.validCount,
    supervised: myRow.value.supervisedCount,
    expiring: myRow.value.expiringCount,
    expired: myRow.value.expiredCount,
    required: myRow.value.requiredCount,
  }
})

const iwaStatus = computed(() => {
  if (!myRow.value) return 'not-authorised'
  const items = [...myRow.value.competenceItems.values()]
  const gatingItems = items.filter((i) => i.isGating)
  if (gatingItems.some((i) => i.derivedStatus === 'EXPIRED' || i.derivedStatus === 'REQUIRED')) {
    return 'not-authorised'
  }
  if (gatingItems.some((i) => i.derivedStatus === 'UNDER_SUPERVISION')) {
    return 'under-supervision'
  }
  return 'authorised'
})

function getItem(competencyId: string): EmployeeCompetenceItem | undefined {
  return myRow.value?.competenceItems.get(competencyId)
}

// ─── All competencies (flat list) ─────────────────────────────────────────────

const allCompetencies = computed(() => {
  const result: Array<{
    id: string
    code: string
    title: string
    category: string
    assessmentMethod: string
  }> = []
  for (const [, comps] of matrixStore.competenciesByCategory) {
    for (const comp of comps) {
      result.push(comp)
    }
  }
  return result
})

// ─── My Role Requirements helpers ─────────────────────────────────────────────

const MOCK_LAST_ASSESSED: Record<string, string> = {}

function getLastAssessed(competencyId: string): string {
  if (!MOCK_LAST_ASSESSED[competencyId]) {
    const item = getItem(competencyId)
    if (item?.lastCompletedAt) return item.lastCompletedAt
    return '—'
  }
  return MOCK_LAST_ASSESSED[competencyId]
}

function getNextReassessment(competencyId: string): string {
  const item = getItem(competencyId)
  if (!item) return '—'
  if (item.expiryDate) return item.expiryDate
  return 'No Expiry'
}

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

// ─── Open Gaps tab ────────────────────────────────────────────────────────────

const GAP_STATUSES = new Set([
  'REQUIRED',
  'EXPIRED',
  'UNDER_SUPERVISION',
  'EXPIRING',
  'IN_PROGRESS',
])

function getGapSeverity(item: EmployeeCompetenceItem): { label: string; cls: string } {
  if (item.isGating && (item.derivedStatus === 'EXPIRED' || item.derivedStatus === 'REQUIRED')) {
    return { label: 'Critical', cls: 'severity-critical' }
  }
  if (item.derivedStatus === 'EXPIRED') {
    return { label: 'High', cls: 'severity-high' }
  }
  if (item.derivedStatus === 'EXPIRING') {
    return { label: 'Moderate', cls: 'severity-moderate' }
  }
  return { label: 'Low', cls: 'severity-low' }
}

const SEVERITY_ORDER: Record<string, number> = { Critical: 0, High: 1, Moderate: 2, Low: 3 }

interface GapItem {
  competencyId: string
  title: string
  code: string
  item: EmployeeCompetenceItem
  severity: { label: string; cls: string }
  recommendedAction: string
  dueDate: string
}

const openGaps = computed<GapItem[]>(() => {
  if (!myRow.value) return []
  const gaps: GapItem[] = []
  for (const comp of allCompetencies.value) {
    const item = getItem(comp.id)
    if (!item || !GAP_STATUSES.has(item.derivedStatus)) continue
    const sev = getGapSeverity(item)
    gaps.push({
      competencyId: comp.id,
      title: comp.title,
      code: comp.code,
      item,
      severity: sev,
      recommendedAction: getActionRequired(item, comp.code),
      dueDate: item.expiryDate ?? '—',
    })
  }
  gaps.sort(
    (a, b) => (SEVERITY_ORDER[a.severity.label] ?? 9) - (SEVERITY_ORDER[b.severity.label] ?? 9),
  )
  return gaps
})

// ─── Authorisations tab ───────────────────────────────────────────────────────

interface GatingItem {
  competencyId: string
  title: string
  code: string
  item: EmployeeCompetenceItem
  evidenceRef: string
  expiryDate: string
  pass: boolean
}

const gatingItems = computed<GatingItem[]>(() => {
  if (!myRow.value) return []
  const result: GatingItem[] = []
  for (const comp of allCompetencies.value) {
    const item = getItem(comp.id)
    if (!item || !item.isGating) continue
    const pass = item.derivedStatus === 'VALID' || item.derivedStatus === 'EXPIRING'
    result.push({
      competencyId: comp.id,
      title: comp.title,
      code: comp.code,
      item,
      evidenceRef: item.evidenceRef ?? '—',
      expiryDate: item.expiryDate ?? 'No Expiry',
      pass,
    })
  }
  return result
})

const gatingPassCount = computed(() => gatingItems.value.filter((g) => g.pass).length)
const gatingTotalCount = computed(() => gatingItems.value.length)

// ─── Awareness Actions tab ────────────────────────────────────────────────────

const myAwarenessTopics = computed(() => {
  const jt = authStore.activePersona.linkedJobTitle ?? ''
  return awarenessTopicsData.filter((topic) => {
    if (!Array.isArray(topic.requiredAudience)) return false
    return roleAudienceIncludes(topic.requiredAudience, jt)
  })
})

const acknowledgedTopics = ref(new Set<string>())

function acknowledgeAwarenessTopic(topicId: string, topicTitle: string) {
  acknowledgedTopics.value = new Set([...acknowledgedTopics.value, topicId])
  toast.success(`Acknowledged: ${topicTitle}`)
}

// ─── Evidence tab ─────────────────────────────────────────────────────────────

const evidence: EvidenceRecord[] = evidenceData as EvidenceRecord[]

function getEvidenceTypeIcon(type: string) {
  if (type.toLowerCase().includes('certificate')) return Award
  if (type.toLowerCase().includes('observation')) return Eye
  if (type.toLowerCase().includes('toolbox')) return Wrench
  if (type.toLowerCase().includes('sign-off') || type.toLowerCase().includes('sign off'))
    return CheckCircle2
  if (type.toLowerCase().includes('manager')) return ClipboardList
  return FileText
}

function isEvidenceExpired(ev: EvidenceRecord): boolean {
  if (!ev.expiryDate) return false
  return new Date(ev.expiryDate) < new Date()
}

function uploadEvidence() {
  toast.success('Evidence upload submitted for review')
}

function requestReassessment(compTitle: string) {
  toast.success(`Reassessment request submitted to your supervisor`)
}

// ─── Assessment history mock ──────────────────────────────────────────────────

const historySheetOpen = ref(false)
const historyCompetency = ref('')
const historyEntries = ref<AssessmentHistoryEntry[]>([])

const MOCK_HISTORY_POOL: AssessmentHistoryEntry[][] = [
  [
    {
      date: '2024-04-15',
      method: 'Practical Observation',
      outcome: 'Competent',
      assessor: 'David Clarke',
    },
    {
      date: '2023-04-10',
      method: 'Supervisor Sign-off',
      outcome: 'Not Yet Competent',
      assessor: 'Mark Hughes',
    },
  ],
  [
    {
      date: '2025-01-20',
      method: 'External Exam',
      outcome: 'Competent',
      assessor: 'TWI Certification',
    },
  ],
  [
    {
      date: '2025-06-01',
      method: 'Practical Observation',
      outcome: 'Competent',
      assessor: 'QHSE Coordinator',
    },
    {
      date: '2024-06-05',
      method: 'Practical Observation',
      outcome: 'Partially Competent',
      assessor: 'David Clarke',
    },
  ],
]

let historyPoolIndex = 0

function viewAssessmentHistory(compTitle: string) {
  historyCompetency.value = compTitle
  historyEntries.value = MOCK_HISTORY_POOL[historyPoolIndex % MOCK_HISTORY_POOL.length] ?? []
  historyPoolIndex++
  historySheetOpen.value = true
}

// ─── Assessment record sheet (supervisor/manager) ─────────────────────────────

const assessmentSheetOpen = ref(false)
const assessmentCompetencyId = ref('')
const assessmentCompetencyTitle = ref('')

const canRecordAssessment = computed(() => {
  const role = authStore.userRole
  return role === 'MANAGER' || role === 'HR_ADMIN'
})

function openAssessmentSheet(compId: string, compTitle: string) {
  assessmentCompetencyId.value = compId
  assessmentCompetencyTitle.value = compTitle
  assessmentSheetOpen.value = true
}

const currentEmployeeId = computed(() => myRow.value?.employeeId ?? '')
const currentEmployeeName = computed(() => authStore.activePersona.displayName)

// ─── Tab state ────────────────────────────────────────────────────────────────

const activeTab = ref('requirements')
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">My Competencies</h1>
    <p class="page-subtitle">
      Your personal readiness profile — requirements, gaps, evidence, authorisations, and awareness
      actions
    </p>
  </div>

  <!-- No profile state -->
  <div v-if="!linkedJobTitle" class="empty-state">
    <ShieldCheck class="empty-icon" />
    <p class="empty-title">No personal competence profile</p>
    <p class="empty-desc">
      Switch to the <strong>Employee</strong> or <strong>Manager</strong> persona to view a
      competence profile.
    </p>
  </div>

  <!-- Loading -->
  <div v-else-if="matrixStore.isLoading" class="loading-state">
    <p>Loading competence profile…</p>
  </div>

  <!-- No matching row -->
  <div v-else-if="!myRow" class="empty-state">
    <ShieldCheck class="empty-icon" />
    <p class="empty-title">Profile not found</p>
    <p class="empty-desc">No employee row found for job title "{{ linkedJobTitle }}".</p>
  </div>

  <template v-else>
    <!-- ── Overview strip ────────────────────────────────────────────────────── -->
    <div class="profile-strip">
      <div class="profile-cell">
        <span class="profile-label">Job Title</span>
        <span class="profile-value">{{ myRow.jobTitle }}</span>
      </div>
      <div class="profile-cell">
        <span class="profile-label">Department</span>
        <span class="profile-value">{{ myRow.department || '—' }}</span>
      </div>
      <div class="profile-cell">
        <span class="profile-label">Business Unit</span>
        <span class="profile-value">{{ myRow.businessUnit || '—' }}</span>
      </div>
      <div class="profile-cell">
        <span class="profile-label">Manager</span>
        <span class="profile-value">{{ myRow.managerName || '—' }}</span>
      </div>
      <div class="profile-cell">
        <span class="profile-label">IWA Status</span>
        <span v-if="iwaStatus === 'authorised'" class="iwa-badge iwa-authorised">
          <ShieldCheck class="iwa-icon" /> Authorised for Independent Work
        </span>
        <span v-else-if="iwaStatus === 'under-supervision'" class="iwa-badge iwa-supervised">
          <Eye class="iwa-icon" /> Under Supervision
        </span>
        <span v-else class="iwa-badge iwa-not-authorised">
          <ShieldAlert class="iwa-icon" /> Not Authorised
        </span>
      </div>
    </div>

    <!-- ── Alert banner ──────────────────────────────────────────────────────── -->
    <div v-if="alertItems.length > 0" class="alert-banner">
      <AlertTriangle class="alert-icon" />
      <span>
        You have <strong>{{ alertItems.length }}</strong> competence{{
          alertItems.length !== 1 ? 's' : ''
        }}
        that {{ alertItems.length !== 1 ? 'are' : 'is' }} expiring or expired — action required.
      </span>
    </div>

    <!-- ── Stats row ─────────────────────────────────────────────────────────── -->
    <div class="stats-row">
      <div class="stat-pill stat-valid">
        <span class="stat-value">{{ stats.valid }}</span>
        <span class="stat-label">Valid</span>
      </div>
      <div class="stat-pill stat-supervised">
        <span class="stat-value">{{ stats.supervised }}</span>
        <span class="stat-label">Supervised</span>
      </div>
      <div class="stat-pill stat-expiring">
        <span class="stat-value">{{ stats.expiring }}</span>
        <span class="stat-label">Expiring</span>
      </div>
      <div class="stat-pill stat-expired">
        <span class="stat-value">{{ stats.expired }}</span>
        <span class="stat-label">Expired</span>
      </div>
      <div class="stat-pill stat-required">
        <span class="stat-value">{{ stats.required }}</span>
        <span class="stat-label">Required</span>
      </div>
    </div>

    <!-- ── Tabbed content ────────────────────────────────────────────────────── -->
    <Tabs v-model="activeTab" class="tabs-root">
      <TabsList class="tabs-list">
        <TabsTrigger value="requirements">My Role Requirements</TabsTrigger>
        <TabsTrigger value="gaps">
          My Open Gaps
          <span v-if="openGaps.length > 0" class="tab-badge">{{ openGaps.length }}</span>
        </TabsTrigger>
        <TabsTrigger value="evidence">My Evidence</TabsTrigger>
        <TabsTrigger value="authorisations">My Authorisations</TabsTrigger>
        <TabsTrigger value="awareness">My Awareness Actions</TabsTrigger>
      </TabsList>

      <!-- ── Tab 1: My Role Requirements ──────────────────────────────────── -->
      <TabsContent value="requirements" class="tab-content">
        <div
          v-for="[category, comps] in matrixStore.competenciesByCategory"
          :key="category"
          class="category-section"
        >
          <template v-if="comps.length">
            <div class="category-header">
              <span class="category-badge">{{ category }}</span>
              <span class="category-count">{{ comps.length }} requirements</span>
            </div>

            <div class="req-table-wrapper">
              <table class="req-table">
                <thead>
                  <tr>
                    <th class="col-code">Code</th>
                    <th class="col-title">Requirement</th>
                    <th class="col-gating">Gating</th>
                    <th class="col-status">Status</th>
                    <th class="col-last">Last Assessed</th>
                    <th class="col-next">Next Reassessment</th>
                    <th class="col-action">Action Required</th>
                    <th class="col-responsible">Responsible</th>
                    <th class="col-acts">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="comp in comps"
                    :key="comp.id"
                    :class="{
                      'row-attention':
                        getItem(comp.id)?.derivedStatus === 'EXPIRED' ||
                        getItem(comp.id)?.derivedStatus === 'EXPIRING',
                      'row-supervised': getItem(comp.id)?.derivedStatus === 'UNDER_SUPERVISION',
                    }"
                  >
                    <td class="col-code comp-code">{{ comp.code }}</td>
                    <td class="col-title comp-title">{{ comp.title }}</td>
                    <td class="col-gating">
                      <span v-if="getItem(comp.id)?.isGating" class="gating-badge">Gating</span>
                      <span v-else class="text-muted">—</span>
                    </td>
                    <td class="col-status">
                      <StatusChip
                        v-if="getItem(comp.id)"
                        :status="getItem(comp.id)!.derivedStatus"
                        :expiry-date="getItem(comp.id)?.expiryDate"
                        compact
                      />
                    </td>
                    <td class="col-last date-cell">{{ getLastAssessed(comp.id) }}</td>
                    <td
                      class="col-next date-cell"
                      :class="getItem(comp.id) ? getExpiryClass(getItem(comp.id)!) : ''"
                    >
                      {{ getNextReassessment(comp.id) }}
                    </td>
                    <td class="col-action action-text">
                      {{ getItem(comp.id) ? getActionRequired(getItem(comp.id)!, comp.code) : '—' }}
                    </td>
                    <td class="col-responsible responsible-text">
                      {{ getItem(comp.id) ? getResponsible(getItem(comp.id)!) : '—' }}
                    </td>
                    <td class="col-acts">
                      <div class="row-actions">
                        <Button
                          size="sm"
                          variant="ghost"
                          class="row-action-btn"
                          title="View Assessment History"
                          @click="viewAssessmentHistory(comp.title)"
                        >
                          <History class="icon-xs" />
                          History
                        </Button>
                        <Button
                          v-if="
                            getItem(comp.id)?.derivedStatus !== 'VALID' &&
                            getItem(comp.id)?.derivedStatus !== 'N_A'
                          "
                          size="sm"
                          variant="ghost"
                          class="row-action-btn"
                          title="Request Reassessment"
                          @click="requestReassessment(comp.title)"
                        >
                          <RotateCcw class="icon-xs" />
                          Reassess
                        </Button>
                        <Button
                          v-if="
                            canRecordAssessment &&
                            getItem(comp.id)?.derivedStatus === 'UNDER_SUPERVISION'
                          "
                          size="sm"
                          variant="outline"
                          class="row-action-btn row-action-record"
                          @click="openAssessmentSheet(comp.id, comp.title)"
                        >
                          <ClipboardList class="icon-xs" />
                          Record
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </TabsContent>

      <!-- ── Tab 2: My Open Gaps ───────────────────────────────────────────── -->
      <TabsContent value="gaps" class="tab-content">
        <div v-if="openGaps.length === 0" class="empty-tab-state">
          <CheckCircle2 class="empty-tab-icon success-icon" />
          <p class="empty-tab-title">No open gaps</p>
          <p class="empty-tab-desc">
            All competencies are current — nothing requires action right now.
          </p>
        </div>
        <template v-else>
          <div class="gaps-header">
            <p class="gaps-summary">
              <strong>{{ openGaps.length }}</strong> competenc{{
                openGaps.length !== 1 ? 'ies require' : 'y requires'
              }}
              action — sorted by severity.
            </p>
          </div>
          <div class="req-table-wrapper">
            <table class="req-table">
              <thead>
                <tr>
                  <th>Competency</th>
                  <th>Gap Severity</th>
                  <th>Current Status</th>
                  <th>Recommended Action</th>
                  <th>Due / Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="gap in openGaps" :key="gap.competencyId">
                  <td>
                    <span class="comp-code-inline">{{ gap.code }}</span>
                    {{ gap.title }}
                  </td>
                  <td>
                    <span class="severity-badge" :class="gap.severity.cls">{{
                      gap.severity.label
                    }}</span>
                  </td>
                  <td>
                    <StatusChip :status="gap.item.derivedStatus" compact />
                  </td>
                  <td class="action-text">{{ gap.recommendedAction }}</td>
                  <td
                    class="date-cell"
                    :class="gap.item.derivedStatus === 'EXPIRED' ? 'expiry-expired' : ''"
                  >
                    {{ gap.dueDate }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </TabsContent>

      <!-- ── Tab 3: My Evidence ────────────────────────────────────────────── -->
      <TabsContent value="evidence" class="tab-content">
        <div class="tab-section-header">
          <div>
            <p class="tab-section-title">Evidence Portfolio</p>
            <p class="tab-section-subtitle">{{ evidence.length }} evidence records on file</p>
          </div>
          <Button size="sm" @click="uploadEvidence">
            <Upload class="icon-xs" />
            Upload Evidence
          </Button>
        </div>

        <div class="req-table-wrapper">
          <table class="req-table">
            <thead>
              <tr>
                <th>Evidence</th>
                <th>Type</th>
                <th>Competency</th>
                <th>Issuer / Source</th>
                <th>Issue Date</th>
                <th>Expiry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ev in evidence" :key="ev.id">
                <td class="evidence-title-cell">
                  <component :is="getEvidenceTypeIcon(ev.type)" class="ev-type-icon" />
                  <span>{{ ev.title }}</span>
                </td>
                <td>
                  <span class="ev-type-badge">{{ ev.type }}</span>
                </td>
                <td class="comp-code ev-comp-code">{{ ev.competencyCode }}</td>
                <td class="action-text">{{ ev.issuer }}</td>
                <td class="date-cell">{{ ev.issueDate }}</td>
                <td class="date-cell" :class="isEvidenceExpired(ev) ? 'expiry-expired' : ''">
                  {{ ev.expiryDate ?? 'No Expiry' }}
                </td>
                <td>
                  <span
                    class="ev-status-badge"
                    :class="
                      ev.reviewStatus === 'Accepted' ? 'ev-status-accepted' : 'ev-status-pending'
                    "
                  >
                    <CheckCircle2 v-if="ev.reviewStatus === 'Accepted'" class="ev-status-icon" />
                    <Clock v-else class="ev-status-icon" />
                    {{ ev.reviewStatus }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </TabsContent>

      <!-- ── Tab 4: My Authorisations ──────────────────────────────────────── -->
      <TabsContent value="authorisations" class="tab-content">
        <!-- IWA Status Card -->
        <div class="iwa-status-card" :class="`iwa-card-${iwaStatus}`">
          <div class="iwa-card-icon-wrap">
            <ShieldCheck v-if="iwaStatus === 'authorised'" class="iwa-card-icon" />
            <Eye v-else-if="iwaStatus === 'under-supervision'" class="iwa-card-icon" />
            <ShieldAlert v-else class="iwa-card-icon" />
          </div>
          <div class="iwa-card-body">
            <p class="iwa-card-title">
              <template v-if="iwaStatus === 'authorised'">Authorised for Independent Work</template>
              <template v-else-if="iwaStatus === 'under-supervision'">Under Supervision</template>
              <template v-else>Not Authorised for Independent Work</template>
            </p>
            <p class="iwa-card-sub">
              <template v-if="iwaStatus === 'authorised'">
                All gating requirements met — {{ currentEmployeeName }} may work independently.
              </template>
              <template v-else-if="iwaStatus === 'under-supervision'">
                One or more gating competencies are under supervision — independent work requires
                sign-off.
              </template>
              <template v-else>
                One or more gating requirements are expired or incomplete — independent work is not
                permitted.
              </template>
            </p>
            <p class="iwa-card-summary">
              {{ gatingPassCount }} of {{ gatingTotalCount }} gating requirements met
            </p>
          </div>
        </div>

        <div v-if="gatingItems.length === 0" class="empty-tab-state">
          <BookOpen class="empty-tab-icon" />
          <p class="empty-tab-title">No gating competencies found</p>
          <p class="empty-tab-desc">Gating requirements are not configured for this job title.</p>
        </div>
        <div v-else class="req-table-wrapper">
          <table class="req-table">
            <thead>
              <tr>
                <th>Competency</th>
                <th>Code</th>
                <th>Current Status</th>
                <th>Evidence Ref</th>
                <th>Expiry Date</th>
                <th class="text-center">Pass / Fail</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="g in gatingItems" :key="g.competencyId">
                <td class="comp-title">{{ g.title }}</td>
                <td class="comp-code">{{ g.code }}</td>
                <td>
                  <StatusChip :status="g.item.derivedStatus" compact />
                </td>
                <td class="date-cell ev-ref-text">{{ g.evidenceRef }}</td>
                <td
                  class="date-cell"
                  :class="g.item.derivedStatus === 'EXPIRED' ? 'expiry-expired' : ''"
                >
                  {{ g.expiryDate }}
                </td>
                <td class="text-center">
                  <span v-if="g.pass" class="pass-indicator">
                    <CheckCircle2 class="pass-icon" /> Pass
                  </span>
                  <span v-else class="fail-indicator"> <XCircle class="fail-icon" /> Fail </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="gating-summary-line">
          <strong>{{ gatingPassCount }}</strong> of <strong>{{ gatingTotalCount }}</strong> gating
          requirements met —
          <span :class="iwaStatus === 'authorised' ? 'text-success' : 'text-critical'">
            Independent Work {{ iwaStatus === 'authorised' ? 'Authorised' : 'NOT Authorised' }}
          </span>
        </p>
      </TabsContent>

      <!-- ── Tab 5: My Awareness Actions ──────────────────────────────────── -->
      <TabsContent value="awareness" class="tab-content">
        <div v-if="myAwarenessTopics.length === 0" class="empty-tab-state">
          <CheckCircle2 class="empty-tab-icon success-icon" />
          <p class="empty-tab-title">No awareness topics assigned</p>
          <p class="empty-tab-desc">You have no active awareness topics at this time.</p>
        </div>
        <template v-else>
          <div class="tab-section-header">
            <div>
              <p class="tab-section-title">Assigned Awareness Topics</p>
              <p class="tab-section-subtitle">
                {{ myAwarenessTopics.length }} topic{{
                  myAwarenessTopics.length !== 1 ? 's' : ''
                }}
                assigned to your role
              </p>
            </div>
          </div>
          <div class="req-table-wrapper">
            <table class="req-table">
              <thead>
                <tr>
                  <th>Topic Title</th>
                  <th>Type</th>
                  <th>Effective Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th class="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="topic in myAwarenessTopics"
                  :key="topic.id"
                  :class="{ 'row-acknowledged': acknowledgedTopics.has(topic.id) }"
                >
                  <td class="comp-title">{{ topic.title }}</td>
                  <td>
                    <span class="ev-type-badge">{{ topic.topicType.replace(/_/g, ' ') }}</span>
                  </td>
                  <td class="date-cell">{{ topic.effectiveDate }}</td>
                  <td class="date-cell">{{ topic.dueDate }}</td>
                  <td>
                    <span
                      class="ack-badge"
                      :class="
                        acknowledgedTopics.has(topic.id) ? 'ack-badge-done' : 'ack-badge-pending'
                      "
                    >
                      <CheckCircle2
                        v-if="acknowledgedTopics.has(topic.id)"
                        class="ack-badge-icon"
                      />
                      <Clock v-else class="ack-badge-icon" />
                      {{ acknowledgedTopics.has(topic.id) ? 'Acknowledged' : 'Pending' }}
                    </span>
                  </td>
                  <td class="text-center">
                    <Button
                      v-if="!acknowledgedTopics.has(topic.id)"
                      size="sm"
                      @click="acknowledgeAwarenessTopic(topic.id, topic.title)"
                    >
                      Acknowledge
                    </Button>
                    <span v-else class="ack-done-label">Done</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </TabsContent>
    </Tabs>

    <!-- ── Assessment History Sheet ──────────────────────────────────────────── -->
    <Sheet :open="historySheetOpen" @update:open="historySheetOpen = $event">
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Assessment History</SheetTitle>
          <SheetDescription>{{ historyCompetency }}</SheetDescription>
        </SheetHeader>
        <div class="history-body">
          <div v-if="historyEntries.length === 0" class="empty-tab-state">
            <p class="empty-tab-desc">No assessment history found for this competency.</p>
          </div>
          <table v-else class="req-table history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Method</th>
                <th>Outcome</th>
                <th>Assessor</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(entry, i) in historyEntries" :key="i">
                <td class="date-cell">{{ entry.date }}</td>
                <td class="action-text">{{ entry.method }}</td>
                <td>
                  <span
                    class="outcome-chip"
                    :class="{
                      'outcome-competent': entry.outcome === 'Competent',
                      'outcome-not-yet': entry.outcome === 'Not Yet Competent',
                      'outcome-partial': entry.outcome === 'Partially Competent',
                    }"
                    >{{ entry.outcome }}</span
                  >
                </td>
                <td class="action-text">{{ entry.assessor }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </SheetContent>
    </Sheet>

    <!-- ── Assessment Record Sheet ───────────────────────────────────────────── -->
    <AssessmentRecordSheet
      :open="assessmentSheetOpen"
      :employee-name="currentEmployeeName"
      :employee-id="currentEmployeeId"
      :competency-title="assessmentCompetencyTitle"
      :competency-id="assessmentCompetencyId"
      @update:open="assessmentSheetOpen = $event"
      @saved="assessmentSheetOpen = false"
    />
  </template>
</template>

<style scoped>
/* ── Profile strip ──────────────────────────────────────────── */
.profile-strip {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-lg);
  padding: var(--space-md) var(--space-lg);
  background-color: var(--bg-surface);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-md);
}

.profile-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 120px;
}

.profile-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--text-caption);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.profile-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-heading);
}

.iwa-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.iwa-authorised {
  color: var(--brand-success);
}
.iwa-supervised {
  color: oklch(0.5 0.13 60);
}
.iwa-not-authorised {
  color: var(--brand-critical);
}

.iwa-icon {
  width: 14px;
  height: 14px;
}

/* ── Alert banner ───────────────────────────────────────────── */
.alert-banner {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background-color: oklch(0.7 0.18 50 / 0.1);
  border: 1px solid oklch(0.7 0.18 50 / 0.3);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
  font-size: 0.875rem;
  color: oklch(0.6 0.18 50);
}

.alert-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* ── Stats row ──────────────────────────────────────────────── */
.stats-row {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
}

.stat-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  min-width: 80px;
  background-color: var(--bg-surface);
  border: var(--border-subtle);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--text-caption);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-top: 2px;
}

.stat-valid .stat-value {
  color: var(--brand-success);
}
.stat-supervised .stat-value {
  color: oklch(0.5 0.13 60);
}
.stat-expiring .stat-value {
  color: oklch(0.65 0.18 60);
}
.stat-expired .stat-value {
  color: var(--brand-critical);
}
.stat-required .stat-value {
  color: var(--brand-primary);
}

/* ── Tabs ────────────────────────────────────────────────────── */
.tabs-root {
  margin-top: var(--space-md);
}

.tabs-list {
  flex-wrap: wrap;
  height: auto;
  gap: 2px;
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  background-color: var(--brand-critical);
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  margin-left: 4px;
}

.tab-content {
  padding-top: var(--space-md);
}

/* ── Category header ─────────────────────────────────────────── */
.category-section {
  margin-bottom: var(--space-xl);
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xs) 0 var(--space-sm);
  border-bottom: var(--border-subtle);
  margin-bottom: var(--space-xs);
}

.category-badge {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-heading);
}

.category-count {
  font-size: 0.75rem;
  color: var(--text-caption);
}

/* ── Requirements table ─────────────────────────────────────── */
.req-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.req-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}

.req-table th {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-caption);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  padding: var(--space-xs) var(--space-sm);
  border-bottom: var(--border-subtle);
  text-align: left;
  white-space: nowrap;
}

.req-table td {
  padding: var(--space-xs) var(--space-sm);
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
  vertical-align: middle;
}

.req-table tr:last-child td {
  border-bottom: none;
}

.row-attention {
  background-color: oklch(0.7 0.18 50 / 0.04);
}
.row-supervised {
  background-color: oklch(from var(--brand-warning) l c h / 0.06);
}
.row-acknowledged td {
  opacity: 0.65;
}

.comp-code {
  font-size: 0.75rem;
  font-weight: 600;
  font-family: var(--font-mono, monospace);
  color: var(--text-caption);
  white-space: nowrap;
}

.comp-title {
  font-size: 0.875rem;
  color: var(--text-body);
}

.comp-code-inline {
  display: inline-block;
  font-size: 0.6875rem;
  font-weight: 600;
  font-family: var(--font-mono, monospace);
  color: var(--text-caption);
  margin-right: 4px;
}

.gating-badge {
  display: inline-flex;
  padding: 1px 6px;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  background-color: oklch(0.55 0.18 30 / 0.12);
  color: var(--brand-critical);
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.text-muted {
  color: var(--text-caption);
}

.date-cell {
  font-size: 0.8125rem;
  color: var(--text-body);
  white-space: nowrap;
}

.expiry-expired {
  color: var(--brand-critical);
  font-weight: 600;
}

.expiry-expiring {
  color: oklch(0.65 0.18 60);
  font-weight: 600;
}

.action-text {
  font-size: 0.8125rem;
  color: var(--text-body);
}

.responsible-text {
  font-size: 0.8125rem;
  color: var(--text-body);
  white-space: nowrap;
}

.text-center {
  text-align: center;
}

/* ── Row actions ─────────────────────────────────────────────── */
.row-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: nowrap;
}

.row-action-btn {
  font-size: 0.75rem;
  padding: 2px 6px;
  height: auto;
  white-space: nowrap;
}

.row-action-record {
  border-color: var(--brand-primary);
  color: var(--brand-primary);
}

/* ── Open Gaps tab ───────────────────────────────────────────── */
.gaps-header {
  margin-bottom: var(--space-md);
}

.gaps-summary {
  font-size: 0.875rem;
  color: var(--text-body);
}

.severity-badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.severity-critical {
  background-color: oklch(0.55 0.18 30 / 0.15);
  color: var(--brand-critical);
}

.severity-high {
  background-color: oklch(0.6 0.18 40 / 0.15);
  color: oklch(0.55 0.2 35);
}

.severity-moderate {
  background-color: oklch(0.7 0.18 60 / 0.15);
  color: oklch(0.55 0.18 55);
}

.severity-low {
  background-color: oklch(0 0 0 / 0.05);
  color: var(--brand-primary);
}

/* ── Evidence tab ────────────────────────────────────────────── */
.tab-section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-md);
  gap: var(--space-md);
}

.tab-section-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0;
}

.tab-section-subtitle {
  font-size: 0.8125rem;
  color: var(--text-caption);
  margin: 2px 0 0;
}

.evidence-title-cell {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.ev-type-icon {
  width: 14px;
  height: 14px;
  color: var(--text-caption);
  flex-shrink: 0;
}

.ev-type-badge {
  display: inline-block;
  font-size: 0.6875rem;
  color: var(--text-caption);
  background-color: var(--bg-subtle);
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.ev-comp-code {
  font-size: 0.75rem;
  font-family: var(--font-mono, monospace);
}

.ev-ref-text {
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
  color: var(--text-caption);
}

.ev-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.ev-status-icon {
  width: 11px;
  height: 11px;
}

.ev-status-accepted {
  background-color: oklch(from var(--brand-success) l c h / 0.1);
  color: var(--brand-success);
}

.ev-status-pending {
  background-color: oklch(0.7 0.18 50 / 0.12);
  color: oklch(0.6 0.18 50);
}

/* ── Authorisations tab ──────────────────────────────────────── */
.iwa-status-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-lg);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-lg);
  border: 2px solid transparent;
}

.iwa-card-authorised {
  background-color: oklch(from var(--brand-success) l c h / 0.06);
  border-color: oklch(from var(--brand-success) l c h / 0.25);
}

.iwa-card-under-supervision {
  background-color: oklch(from var(--brand-warning) l c h / 0.06);
  border-color: oklch(from var(--brand-warning) l c h / 0.25);
}

.iwa-card-not-authorised {
  background-color: oklch(from var(--brand-critical) l c h / 0.06);
  border-color: oklch(from var(--brand-critical) l c h / 0.25);
}

.iwa-card-icon-wrap {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-surface);
}

.iwa-card-authorised .iwa-card-icon-wrap {
  color: var(--brand-success);
}
.iwa-card-under-supervision .iwa-card-icon-wrap {
  color: oklch(0.5 0.13 60);
}
.iwa-card-not-authorised .iwa-card-icon-wrap {
  color: var(--brand-critical);
}

.iwa-card-icon {
  width: 22px;
  height: 22px;
}

.iwa-card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.iwa-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-heading);
  margin: 0;
}

.iwa-card-sub {
  font-size: 0.875rem;
  color: var(--text-body);
  margin: 0;
}

.iwa-card-summary {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-caption);
  margin: 0;
}

.pass-indicator,
.fail-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.pass-indicator {
  color: var(--brand-success);
}
.fail-indicator {
  color: var(--brand-critical);
}

.pass-icon,
.fail-icon {
  width: 14px;
  height: 14px;
}

.gating-summary-line {
  margin-top: var(--space-md);
  font-size: 0.875rem;
  color: var(--text-body);
  text-align: right;
}

.text-success {
  color: var(--brand-success);
}
.text-critical {
  color: var(--brand-critical);
}

/* ── Awareness tab ───────────────────────────────────────────── */
.ack-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.ack-badge-icon {
  width: 11px;
  height: 11px;
}

.ack-badge-pending {
  background-color: oklch(0.7 0.18 50 / 0.12);
  color: oklch(0.6 0.18 50);
}

.ack-badge-done {
  background-color: oklch(from var(--brand-success) l c h / 0.1);
  color: var(--brand-success);
}

.ack-done-label {
  font-size: 0.8125rem;
  color: var(--brand-success);
  font-weight: 500;
}

/* ── Assessment history sheet ────────────────────────────────── */
.history-body {
  padding: var(--space-md) 0;
  overflow-y: auto;
}

.history-table {
  margin-top: var(--space-md);
}

.outcome-chip {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.outcome-competent {
  background-color: oklch(from var(--brand-success) l c h / 0.1);
  color: var(--brand-success);
}

.outcome-not-yet {
  background-color: oklch(0.55 0.18 30 / 0.12);
  color: var(--brand-critical);
}

.outcome-partial {
  background-color: oklch(0.65 0.18 60 / 0.12);
  color: oklch(0.55 0.18 55);
}

/* ── Empty states ─────────────────────────────────────────────── */
.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-2xl) var(--space-lg);
  text-align: center;
  color: var(--text-caption);
}

.empty-icon {
  width: 40px;
  height: 40px;
  color: var(--text-caption);
  opacity: 0.4;
}

.empty-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-heading);
}

.empty-desc {
  font-size: 0.875rem;
  max-width: 380px;
}

.empty-tab-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xl) var(--space-lg);
  text-align: center;
}

.empty-tab-icon {
  width: 32px;
  height: 32px;
  color: var(--text-caption);
  opacity: 0.4;
}

.success-icon {
  color: var(--brand-success);
  opacity: 0.7;
}

.empty-tab-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0;
}

.empty-tab-desc {
  font-size: 0.8125rem;
  color: var(--text-caption);
  max-width: 340px;
  margin: 0;
}

.icon-xs {
  width: 13px;
  height: 13px;
}
</style>
