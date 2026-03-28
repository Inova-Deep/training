<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ChevronLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  History as HistoryIcon,
  ShieldCheck,
  Plus,
  ExternalLink,
  AlertTriangle,
  MoreHorizontal,
  Users,
  TrendingUp,
  Bell,
  UserCheck,
  Flag
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRolesStore } from '@/stores/roles'
import { useCompetencyLibraryStore } from '@/stores/competencyLibrary'
import { useSkillsMatrixStore } from '@/stores/skillsMatrix'
import { useEmployeesStore } from '@/stores/employees'
import { useAuthStore } from '@/stores/auth'
import { organizationApi } from '@/api/client'
import type { JobTitle } from '@/api/client'
import type { RoleRequirement } from '@/types'
import roleRequirementsData from '@/data/roleRequirements.json'
import competenciesData from '@/data/competencies.json'
import awarenessTopicsData from '@/data/awarenessTopics.json'

// ── Types ───────────────────────────────────────────────────────
type RoleReqJson = Record<string, {
  setId: string
  gatingCompetencyIds: string[]
  requirements: Array<{
    id: string
    competencyLibraryItemId: string
    isGating: boolean
    mandatory: boolean
    riskLevelCode: string
    requiresExpiry?: boolean
    validityDays?: number
    trainingTypeCode: string
    assessmentMethodCode: string
    sortOrder: number
  }>
}>

interface CompetencyJson {
  id: string
  code: string
  title: string
  category: string
  riskLevelCode: string
  criticalityDomain?: string
  defaultTrainingTypeCode: string
  defaultAssessmentMethodCode: string
  defaultRequiresExpiry: boolean
  defaultValidityDays?: number
  competencyType?: string
}

interface AwarenessTopic {
  id: string
  title: string
  topicType: string
  effectiveDate: string
  completion: string
  deliveryMethod: string
  workflowStatus: string
  requiredAudience: string[]
  status: string
  dueDate: string
}

const requirementsJson = roleRequirementsData as RoleReqJson
const allCompetencies = competenciesData as CompetencyJson[]
const allTopics = awarenessTopicsData as AwarenessTopic[]

// ── Dept mapping ─────────────────────────────────────────────────
const DEPT_MAP: Record<string, string> = {
  'Additive Manufacturing Technician': 'Additive Manufacturing',
  'Welding / Fabrication Technician': 'Welding & Fabrication',
  'Robotics Operator': 'Robotics',
  'Materials Testing Technician': 'Materials Testing',
  'QA Inspector': 'Quality Assurance',
  'QHSE Coordinator': 'HSE',
  'Maintenance Technician': 'Operations',
  'Maintenance Supervisor': 'Operations',
  'Shift Lead': 'Operations',
  'Electrical Technician': 'Operations',
  'Instrumentation Technician': 'Operations',
}

const ROLE_PURPOSE_MAP: Record<string, string> = {
  'Additive Manufacturing Technician': 'Operates and maintains additive manufacturing equipment; responsible for machine setup, powder handling, and process quality.',
  'Welding / Fabrication Technician': 'Performs coded welding and fabrication tasks to approved procedures; responsible for joint quality and weld inspection sign-off.',
  'Robotics Operator': 'Operates robotic manufacturing cells; ensures safe robot cell operation, emergency stop awareness, and qualification maintenance.',
  'Materials Testing Technician': 'Performs tensile, hardness, and dimensional inspection activities; maintains materials traceability records.',
  'QA Inspector': 'Conducts final inspection, raises NCRs, drives CAPA closure, and signs off product conformity documentation.',
  'QHSE Coordinator': 'Coordinates health, safety, environmental and quality activities; manages audits, incidents and regulatory compliance.',
  'Maintenance Technician': 'Carries out planned and reactive maintenance on plant and equipment; responsible for safe isolation and LOTO compliance.',
  'Maintenance Supervisor': 'Supervises maintenance team activities; ensures PTW compliance, team competence and maintenance quality.',
  'Shift Lead': 'Leads shift operations; responsible for team safety briefings, production output, and escalation of quality issues.',
  'Electrical Technician': 'Performs electrical maintenance and fault-finding; requires LOTO, WAH and confined space authorisations as applicable.',
  'Instrumentation Technician': 'Maintains and calibrates instrumentation and control systems; responsible for safe isolation and calibration records.',
}

const CRITICALITY_MAP: Record<string, 'Critical' | 'High' | 'Standard'> = {
  'Additive Manufacturing Technician': 'High',
  'Welding / Fabrication Technician': 'Critical',
  'Robotics Operator': 'High',
  'Materials Testing Technician': 'High',
  'QA Inspector': 'High',
  'QHSE Coordinator': 'High',
  'Maintenance Technician': 'Critical',
  'Maintenance Supervisor': 'Critical',
  'Shift Lead': 'High',
  'Electrical Technician': 'Critical',
  'Instrumentation Technician': 'Critical',
}

// ── Stores ────────────────────────────────────────────────────────
const route = useRoute()
const router = useRouter()
const store = useRolesStore()
const libraryStore = useCompetencyLibraryStore()
const matrixStore = useSkillsMatrixStore()
const employeesStore = useEmployeesStore()
const authStore = useAuthStore()

const canEditRoleRequirements = computed(() =>
  ['QHSE', 'HR_ADMIN', 'ADMIN'].includes(authStore.userRole)
)

const jobId = route.params.id as string
const jobTitle = ref<JobTitle | null>(null)
const activeTab = ref('applicability')

// ── Applicability form ────────────────────────────────────────────
const applicabilityForm = reactive({
  q1HandsOnOperational: false,
  q2ConformitySignOff: false,
  q3ErrorCausesImpact: false,
  q4SpecificCompetenceRequired: false,
  q5ObjectiveEvidenceRequired: false,
  notes: ''
})

watch(() => store.currentRole, (newRole) => {
  if (newRole) {
    applicabilityForm.q1HandsOnOperational = !!newRole.q1HandsOnOperational
    applicabilityForm.q2ConformitySignOff = !!newRole.q2ConformitySignOff
    applicabilityForm.q3ErrorCausesImpact = !!newRole.q3ErrorCausesImpact
    applicabilityForm.q4SpecificCompetenceRequired = !!newRole.q4SpecificCompetenceRequired
    applicabilityForm.q5ObjectiveEvidenceRequired = !!newRole.q5ObjectiveEvidenceRequired
    applicabilityForm.notes = newRole.notes || ''
  }
}, { immediate: true })

const computedResult = computed((): 'INCLUDED' | 'AWARENESS_ONLY' | 'OUT_OF_SCOPE' => {
  if (!applicabilityForm.q1HandsOnOperational && !applicabilityForm.q2ConformitySignOff) return 'OUT_OF_SCOPE'
  if (!applicabilityForm.q3ErrorCausesImpact) return 'OUT_OF_SCOPE'
  if (!applicabilityForm.q4SpecificCompetenceRequired) return 'AWARENESS_ONLY'
  if (!applicabilityForm.q5ObjectiveEvidenceRequired) return 'OUT_OF_SCOPE'
  return 'INCLUDED'
})

function getStatusLabel(status: string) {
  switch (status) {
    case 'INCLUDED': return 'Applicable – Include in Skills Matrix'
    case 'AWARENESS_ONLY': return 'Manage via Awareness / Induction'
    case 'OUT_OF_SCOPE': return 'Not in Skills Matrix'
    default: return 'Decision Pending'
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case 'INCLUDED': return 'badge-success'
    case 'AWARENESS_ONLY': return 'badge-warning'
    case 'OUT_OF_SCOPE': return 'badge-neutral'
    default: return 'badge-primary'
  }
}

function formatDate(date: string | null | undefined) {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Data load ─────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const response = await organizationApi.getJobTitles({ size: 1000 })
    jobTitle.value = response.data.find((t) => t.id === jobId) || null

    if (jobTitle.value) {
      await store.fetchRole(jobTitle.value.name)
      await libraryStore.fetchCompetencies()
      await store.fetchRequirementSets()
      const jobSet = store.requirementSets.find(s =>
        jobTitle.value?.name.toLowerCase().includes(s.erpJobTitleId.toLowerCase())
      )
      if (jobSet) {
        await store.fetchRoleRequirements(jobSet.id)
      }
    }

    // Ensure matrix is built
    if (matrixStore.mockEmployeeRows.length === 0) {
      if (employeesStore.allEmployees.length === 0) {
        await employeesStore.fetchEmployees()
      }
      if (employeesStore.allEmployees.length > 0) {
        await matrixStore.fetchAndBuildMatrix(employeesStore.allEmployees)
      }
    }
  } catch (error) {
    console.error('Failed to load role details', error)
  }
})

async function handleSaveApplicability() {
  if (!jobTitle.value) return
  try {
    await store.updateRole(jobTitle.value.name, {
      ...applicabilityForm,
      result: computedResult.value
    })
  } catch (error) {
    console.error('Save failed', error)
  }
}

function getCompetencyName(id: string) {
  const comp = libraryStore.competencies.find(c => c.id === id)
  return comp?.title ?? id
}

// ── Requirement edit sheet ────────────────────────────────────────
const editingReqId = ref<string | null>(null)
const isEditSheetOpen = ref(false)
const editForm = reactive({
  riskLevelCode: 'HIGH_CRITICAL',
  mandatory: false,
  isGating: false,
  trainingTypeCode: 'CERT_LICENCE',
  assessmentMethodCode: 'OBSERVATION'
})

function openEditSheet(req: RoleRequirement) {
  editingReqId.value = req.id
  editForm.riskLevelCode = req.riskLevelCode
  editForm.mandatory = req.mandatory
  editForm.isGating = req.isGating
  editForm.trainingTypeCode = req.trainingTypeCode
  editForm.assessmentMethodCode = req.assessmentMethodCode
  isEditSheetOpen.value = true
}

async function handleSaveRequirement() {
  if (!editingReqId.value) return
  await store.updateRequirement('', editingReqId.value, { ...editForm })
  isEditSheetOpen.value = false
}

function goBack() {
  router.push('/roles')
}

// ── Role summary computed ─────────────────────────────────────────
const roleName = computed(() => jobTitle.value?.name ?? '')

const assignedEmployees = computed(() => {
  if (!roleName.value) return []
  return matrixStore.mockEmployeeRows.filter(e =>
    e.jobTitle.toLowerCase() === roleName.value.toLowerCase()
  )
})

const roleSummary = computed(() => {
  const employees = assignedEmployees.value
  const assigned = employees.length
  const fullyReady = employees.filter(e => e.isAuthorised).length
  const underSupervision = employees.filter(e => e.supervisionStatus === 'SUPERVISED_ONLY').length
  const readinessScore = assigned > 0 ? Math.round((fullyReady / assigned) * 100) : 0
  const department = DEPT_MAP[roleName.value] ?? 'Operations'
  const purpose = ROLE_PURPOSE_MAP[roleName.value] ?? 'Performs specialist work requiring verified competence.'
  const criticality = CRITICALITY_MAP[roleName.value] ?? 'Standard'
  return { assigned, fullyReady, underSupervision, readinessScore, department, purpose, criticality }
})

function criticalityClass(c: string) {
  switch (c) {
    case 'Critical': return 'badge-critical'
    case 'High':     return 'badge-high'
    default:         return 'badge-neutral'
  }
}

// ── Enriched requirements table ───────────────────────────────────
const enrichedRequirements = computed(() => {
  const rn = roleName.value
  const reqSet = requirementsJson[rn]
  if (!reqSet) return []

  const employees = assignedEmployees.value
  const total = employees.length

  return reqSet.requirements.map(req => {
    const comp = allCompetencies.find(c => c.id === req.competencyLibraryItemId)
    const metCount = total > 0
      ? employees.filter(emp => {
          const item = emp.competenceItems.get(req.competencyLibraryItemId)
          return item && (item.derivedStatus === 'VALID' || item.derivedStatus === 'EXPIRING')
        }).length
      : 0

    const intervalLabel = req.requiresExpiry && req.validityDays
      ? `${Math.round(req.validityDays / 30)} months`
      : (comp?.defaultRequiresExpiry && comp?.defaultValidityDays
          ? `${Math.round(comp.defaultValidityDays / 30)} months`
          : 'No expiry')

    return {
      id: req.id,
      compId: req.competencyLibraryItemId,
      code: comp?.code ?? req.competencyLibraryItemId,
      title: comp?.title ?? req.competencyLibraryItemId,
      compType: comp?.competencyType ?? '—',
      category: comp?.category ?? '—',
      isGating: req.isGating,
      mandatory: req.mandatory,
      riskLevelCode: req.riskLevelCode,
      interval: intervalLabel,
      metCount,
      total,
    }
  })
})

function compTypeBadgeClass(t: string) {
  switch (t) {
    case 'CERTIFICATION':           return 'badge-primary'
    case 'EQUIPMENT_QUALIFICATION': return 'badge-primary'
    case 'TRAINING':                return 'badge-warning'
    case 'OJT_COACHING':            return 'badge-neutral'
    case 'AWARENESS_TOPIC':         return 'badge-info'
    default:                        return 'badge-neutral'
  }
}

function compTypeLabel(t: string) {
  switch (t) {
    case 'CERTIFICATION':           return 'Certification'
    case 'EQUIPMENT_QUALIFICATION': return 'Equipment Qual.'
    case 'TRAINING':                return 'Training'
    case 'OJT_COACHING':            return 'OJT / Coaching'
    case 'AWARENESS_TOPIC':         return 'Awareness'
    default:                        return t.replace(/_/g, ' ')
  }
}

// ── Assigned People tab ───────────────────────────────────────────
interface AssignedPersonRow {
  employeeId: string
  name: string
  status: 'Authorised' | 'Under Supervision' | 'Not Authorised'
  gapCount: number
  supervisedItems: number
  expiryIssues: number
  readiness: number
}

const assignedPeopleRows = computed((): AssignedPersonRow[] => {
  const reqSet = requirementsJson[roleName.value]
  if (!reqSet) return assignedEmployees.value.map(e => {
    const reqIds = Object.values(requirementsJson)
      .find(rs => rs.setId)?.requirements.map(r => r.competencyLibraryItemId) ?? []
    return buildPersonRow(e, reqIds)
  })

  const reqIds = reqSet.requirements.map(r => r.competencyLibraryItemId)
  return assignedEmployees.value.map(e => buildPersonRow(e, reqIds))
})

function buildPersonRow(e: typeof matrixStore.mockEmployeeRows[0], reqIds: string[]): AssignedPersonRow {
  let metCount = 0
  let gapCount = 0
  let supervisedItems = 0
  let expiryIssues = 0

  for (const id of reqIds) {
    const item = e.competenceItems.get(id)
    if (!item) { gapCount++; continue }
    const ds = item.derivedStatus
    if (ds === 'VALID') { metCount++ }
    else if (ds === 'EXPIRING') { metCount++; expiryIssues++ }
    else if (ds === 'UNDER_SUPERVISION') { supervisedItems++ }
    else if (ds === 'EXPIRED') { gapCount++; expiryIssues++ }
    else if (ds === 'REQUIRED' || ds === 'IN_PROGRESS') { gapCount++ }
  }

  const total = reqIds.length
  const readiness = total > 0 ? Math.round((metCount / total) * 100) : 0

  let status: AssignedPersonRow['status'] = 'Not Authorised'
  if (e.isAuthorised) status = 'Authorised'
  else if (e.supervisionStatus === 'SUPERVISED_ONLY') status = 'Under Supervision'

  return {
    employeeId: e.employeeId,
    name: e.displayName,
    status,
    gapCount,
    supervisedItems,
    expiryIssues,
    readiness,
  }
}

function statusBadgeClass(s: string) {
  switch (s) {
    case 'Authorised':        return 'badge-success'
    case 'Under Supervision': return 'badge-warning'
    default:                  return 'badge-critical'
  }
}

// ── Risk Summary ──────────────────────────────────────────────────
interface RiskCompItem {
  compId: string
  title: string
  gapCount: number
  total: number
  isGating: boolean
  isSafetyCritical: boolean
  gapPct: number
}

const riskCompetencies = computed((): RiskCompItem[] => {
  const reqSet = requirementsJson[roleName.value]
  if (!reqSet) return []

  const employees = assignedEmployees.value
  const total = employees.length
  if (total === 0) return []

  return reqSet.requirements
    .map(req => {
      const gapCount = employees.filter(emp => {
        const item = emp.competenceItems.get(req.competencyLibraryItemId)
        return item && (item.derivedStatus === 'EXPIRED' || item.derivedStatus === 'REQUIRED' || item.derivedStatus === 'IN_PROGRESS')
      }).length
      const comp = allCompetencies.find(c => c.id === req.competencyLibraryItemId)
      return {
        compId: req.competencyLibraryItemId,
        title: comp?.title ?? req.competencyLibraryItemId,
        gapCount,
        total,
        isGating: req.isGating,
        isSafetyCritical: comp?.criticalityDomain === 'Safety Critical',
        gapPct: Math.round((gapCount / total) * 100),
      }
    })
    .filter(r => r.gapCount > 0)
    .sort((a, b) => b.gapCount - a.gapCount)
})

const highestRiskItems = computed(() => riskCompetencies.value.slice(0, 5))

const commonGaps = computed(() => riskCompetencies.value.filter(r => r.gapPct >= 50))

function riskSeverityBadge(item: RiskCompItem) {
  if (item.isSafetyCritical && item.isGating) return 'badge-critical'
  if (item.isGating) return 'badge-high'
  return 'badge-warning'
}

function riskSeverityLabel(item: RiskCompItem) {
  if (item.isSafetyCritical && item.isGating) return 'Critical'
  if (item.isGating) return 'High'
  return 'Moderate'
}

function recommendedAction(item: RiskCompItem): string {
  if (item.isSafetyCritical) return 'Schedule immediate retraining — safety-critical gap'
  if (item.isGating) return 'Block authorisation until resolved — gating requirement'
  return 'Add to next training cycle'
}

// ── Linked Awareness ──────────────────────────────────────────────
const linkedAwareness = computed(() => {
  const rn = roleName.value
  if (!rn) return []
  return allTopics.filter(t =>
    t.requiredAudience.some(a =>
      a === 'All Employees' || a.toLowerCase() === rn.toLowerCase()
    )
  )
})

function topicTypeBadgeClass(t: string) {
  switch (t) {
    case 'SAFETY_BRIEFING':       return 'badge-critical'
    case 'PROCEDURE_REVISION':    return 'badge-warning'
    case 'NEW_EQUIPMENT_INTRO':   return 'badge-primary'
    case 'MANAGEMENT_SYSTEM_UPDATE': return 'badge-info'
    case 'CUSTOMER_REQUIREMENT':  return 'badge-neutral'
    default:                      return 'badge-neutral'
  }
}

function topicTypeLabel(t: string) {
  switch (t) {
    case 'SAFETY_BRIEFING':          return 'Safety Briefing'
    case 'PROCEDURE_REVISION':       return 'Procedure Rev.'
    case 'NEW_EQUIPMENT_INTRO':      return 'New Equipment'
    case 'MANAGEMENT_SYSTEM_UPDATE': return 'System Update'
    case 'CUSTOMER_REQUIREMENT':     return 'Customer Req.'
    default:                         return t.replace(/_/g, ' ')
  }
}

function workflowLabel(s: string) {
  switch (s) {
    case 'AWAITING_ACKNOWLEDGEMENT': return 'Awaiting Ack.'
    case 'IN_COMMUNICATION':         return 'In Communication'
    case 'VERIFICATION_PENDING':     return 'Verification Pending'
    case 'ISSUED':                   return 'Issued'
    default:                         return s.replace(/_/g, ' ')
  }
}

function deliveryLabel(d: string) {
  switch (d) {
    case 'READ_AND_ACKNOWLEDGE': return 'Read & Acknowledge'
    case 'TEAM_BRIEFING':        return 'Team Briefing'
    case 'TOOLBOX_TALK':         return 'Toolbox Talk'
    case 'FORMAL_RETRAINING':    return 'Formal Retraining'
    case 'SUPERVISOR_CASCADE':   return 'Supervisor Cascade'
    default:                     return d.replace(/_/g, ' ')
  }
}
</script>

<template>
  <div v-if="jobTitle">

    <!-- ── Page Header ───────────────────────────────────────── -->
    <div class="role-header">
      <Button variant="ghost" size="icon" @click="goBack" aria-label="Back to Roles">
        <ChevronLeft class="icon-sm" aria-hidden="true" />
      </Button>
      <div class="role-header-text">
        <h1 class="page-title">{{ jobTitle.name }}</h1>
        <p class="page-subtitle">{{ jobTitle.code || 'No code' }} · Job Title Workspace</p>
      </div>
      <div v-if="store.currentRole" class="role-header-badge">
        <span class="badge" :class="getStatusClass(store.currentRole.result)">
          <CheckCircle2 v-if="store.currentRole.result === 'INCLUDED'" class="icon-xxs" aria-hidden="true" />
          <AlertCircle v-else-if="store.currentRole.result === 'AWARENESS_ONLY'" class="icon-xxs" aria-hidden="true" />
          <HelpCircle v-else class="icon-xxs" aria-hidden="true" />
          {{ getStatusLabel(store.currentRole.result) }}
        </span>
      </div>
    </div>

    <!-- ── 8.3 Role Summary Card ──────────────────────────────── -->
    <Card class="summary-card">
      <CardContent class="summary-card-content">
        <!-- Left: role meta -->
        <div class="summary-meta">
          <div class="summary-meta-top">
            <div>
              <p class="summary-role-name">{{ roleName }}</p>
              <p class="summary-dept">{{ roleSummary.department }}</p>
            </div>
            <span class="badge summary-criticality-badge" :class="criticalityClass(roleSummary.criticality)">
              {{ roleSummary.criticality }}
            </span>
          </div>
          <p class="summary-purpose">{{ roleSummary.purpose }}</p>
        </div>

        <!-- Right: stats -->
        <div class="summary-stats">
          <div class="summary-stat">
            <Users class="summary-stat-icon" />
            <div>
              <p class="summary-stat-value">{{ roleSummary.assigned }}</p>
              <p class="summary-stat-label">Assigned</p>
            </div>
          </div>
          <div class="summary-stat">
            <CheckCircle2 class="summary-stat-icon stat-icon-good" />
            <div>
              <p class="summary-stat-value">{{ roleSummary.fullyReady }}</p>
              <p class="summary-stat-label">Fully Ready</p>
            </div>
          </div>
          <div class="summary-stat">
            <UserCheck class="summary-stat-icon stat-icon-warn" />
            <div>
              <p class="summary-stat-value">{{ roleSummary.underSupervision }}</p>
              <p class="summary-stat-label">Under Supervision</p>
            </div>
          </div>
          <div class="summary-readiness">
            <div class="readiness-header">
              <span class="readiness-label">Readiness Score</span>
              <span class="readiness-value">{{ roleSummary.readinessScore }}%</span>
            </div>
            <div class="readiness-bar-track" role="progressbar" :aria-valuenow="roleSummary.readinessScore" aria-valuemin="0" aria-valuemax="100">
              <div
                class="readiness-bar-fill"
                :style="{ width: roleSummary.readinessScore + '%' }"
                :class="{
                  'bar-fill-good': roleSummary.readinessScore >= 75,
                  'bar-fill-warn': roleSummary.readinessScore >= 40 && roleSummary.readinessScore < 75,
                  'bar-fill-danger': roleSummary.readinessScore < 40
                }"
              />
            </div>
            <p class="readiness-subtext">{{ roleSummary.fullyReady }} of {{ roleSummary.assigned }} people fully authorised</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- ── Tabs ───────────────────────────────────────────────── -->
    <Tabs v-model="activeTab">
      <TabsList>
        <TabsTrigger value="applicability">
          <ShieldCheck class="icon-xs" aria-hidden="true" />
          Applicability
        </TabsTrigger>
        <TabsTrigger value="requirements">
          <FileText class="icon-xs" aria-hidden="true" />
          Competencies
        </TabsTrigger>
        <TabsTrigger value="people">
          <Users class="icon-xs" aria-hidden="true" />
          Assigned People
        </TabsTrigger>
        <TabsTrigger value="risk">
          <TrendingUp class="icon-xs" aria-hidden="true" />
          Risk Summary
        </TabsTrigger>
        <TabsTrigger value="awareness">
          <Bell class="icon-xs" aria-hidden="true" />
          Linked Awareness
        </TabsTrigger>
        <TabsTrigger value="history">
          <HistoryIcon class="icon-xs" aria-hidden="true" />
          History
        </TabsTrigger>
      </TabsList>

      <!-- ── 8.3 Applicability Tab ──────────────────────────── -->
      <TabsContent value="applicability">
        <div class="applicability-layout">
          <!-- Questions Column -->
          <div class="questions-column">
            <Card>
              <CardHeader>
                <CardTitle>Applicability Decision Questions</CardTitle>
                <CardDescription>Answer YES/NO for each question in order. The decision output is calculated automatically.</CardDescription>
              </CardHeader>
              <CardContent class="questions-content">

                <div class="question-item">
                  <div class="question-meta">
                    <span class="question-badge" aria-hidden="true">Q1</span>
                    <div class="question-text">
                      <p class="question-label">Hands-On Operational Work</p>
                      <p class="question-desc">Does this role perform hands-on operational work — production, fabrication, maintenance, or inspection?</p>
                      <p class="question-examples">e.g. Operator, Welder, Inspector, Maintenance Technician</p>
                      <div class="question-flow" aria-hidden="true">
                        <span class="flow-yes">YES → continue</span>
                        <span class="flow-sep">·</span>
                        <span class="flow-no">NO → likely not in matrix (unless Q2 is YES)</span>
                      </div>
                    </div>
                  </div>
                  <Switch v-model:checked="applicabilityForm.q1HandsOnOperational" aria-label="Q1: Does this role perform hands-on operational work?" />
                </div>

                <Separator />

                <div class="question-item">
                  <div class="question-meta">
                    <span class="question-badge" aria-hidden="true">Q2</span>
                    <div class="question-text">
                      <p class="question-label">Conformity / Compliance Sign-Off</p>
                      <p class="question-desc">Does this role approve, release, inspect, certify, or sign off work that affects conformity or compliance?</p>
                      <p class="question-examples">e.g. Product release, final inspection sign-off, supplier approval, MOC approval</p>
                      <div class="question-flow" aria-hidden="true">
                        <span class="flow-yes">YES → continue</span>
                        <span class="flow-sep">·</span>
                        <span class="flow-no">NO → go to Q3</span>
                      </div>
                    </div>
                  </div>
                  <Switch v-model:checked="applicabilityForm.q2ConformitySignOff" aria-label="Q2: Does this role approve or sign off work affecting conformity?" />
                </div>

                <Separator />

                <div class="question-item">
                  <div class="question-meta">
                    <span class="question-badge" aria-hidden="true">Q3</span>
                    <div class="question-text">
                      <p class="question-label">Error Causes Safety / Quality Impact</p>
                      <p class="question-desc">Can an error in this role cause a safety, quality, environmental, or compliance impact?</p>
                      <p class="question-examples">e.g. Injury risk, major NCR, regulatory breach, customer rejection</p>
                      <div class="question-flow" aria-hidden="true">
                        <span class="flow-yes">YES → continue</span>
                        <span class="flow-sep">·</span>
                        <span class="flow-no">NO → not in matrix</span>
                      </div>
                    </div>
                  </div>
                  <Switch v-model:checked="applicabilityForm.q3ErrorCausesImpact" aria-label="Q3: Can an error in this role cause safety or quality impact?" />
                </div>

                <Separator />

                <div class="question-item">
                  <div class="question-meta">
                    <span class="question-badge" aria-hidden="true">Q4</span>
                    <div class="question-text">
                      <p class="question-label">Specific Competence Required</p>
                      <p class="question-desc">Is specific competence required to perform or approve the task — not just general awareness?</p>
                      <p class="question-examples">e.g. Anti-bribery awareness is not a competence; electrical isolation authority is</p>
                      <div class="question-flow" aria-hidden="true">
                        <span class="flow-yes">YES → continue</span>
                        <span class="flow-sep">·</span>
                        <span class="flow-no">NO → manage via awareness / induction only</span>
                      </div>
                    </div>
                  </div>
                  <Switch v-model:checked="applicabilityForm.q4SpecificCompetenceRequired" aria-label="Q4: Is specific competence required, not just general awareness?" />
                </div>

                <Separator />

                <div class="question-item">
                  <div class="question-meta">
                    <span class="question-badge" aria-hidden="true">Q5</span>
                    <div class="question-text">
                      <p class="question-label">Objective Evidence Required</p>
                      <p class="question-desc">Is objective evidence required to prove competence — certificate, licence, OJT record, observation, or documented output?</p>
                      <p class="question-examples">e.g. For managers/engineers: evidence can be approvals, MOCs, CAPAs</p>
                      <div class="question-flow" aria-hidden="true">
                        <span class="flow-yes">YES → INCLUDE in Skills Matrix</span>
                        <span class="flow-sep">·</span>
                        <span class="flow-no">NO → not in matrix</span>
                      </div>
                    </div>
                  </div>
                  <Switch v-model:checked="applicabilityForm.q5ObjectiveEvidenceRequired" aria-label="Q5: Is objective evidence required to prove competence?" />
                </div>

                <Separator />

                <div class="question-notes">
                  <Label for="decision-notes">Notes & Justification</Label>
                  <Input id="decision-notes" v-model="applicabilityForm.notes" placeholder="Provide reasoning for the decision above..." />
                </div>

                <div class="escalation-tip" role="note">
                  <AlertTriangle class="icon-xs" aria-hidden="true" />
                  <p>
                    If you answer NO on Q3, Q4, or Q5, this role should not be tracked in the Skills Matrix.
                    Escalate borderline cases to QHSE/HR.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Result Column -->
          <div class="result-column">
            <Card class="result-card">
              <CardHeader>
                <CardTitle class="result-card-title">Matrix Applicability Determination</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="result-label">Decision Output</p>
                <div
                  class="result-outcome"
                  :class="`result-outcome-${computedResult.toLowerCase().replace('_', '-')}`"
                  role="status"
                  :aria-label="`Computed result: ${getStatusLabel(computedResult)}`"
                >
                  <span style="display:inline-flex;align-items:center;margin-right:0.5rem;flex-shrink:0;" aria-hidden="true">
                    <CheckCircle2 v-if="computedResult === 'INCLUDED'" :size="16" />
                    <AlertCircle v-else-if="computedResult === 'AWARENESS_ONLY'" :size="16" />
                    <HelpCircle v-else :size="16" />
                  </span>
                  <span>{{ getStatusLabel(computedResult) }}</span>
                </div>
                <p class="result-hint">Based on the answers provided above.</p>
                <Button v-if="canEditRoleRequirements" class="result-save-btn" :disabled="store.isSaving" @click="handleSaveApplicability" aria-label="Save applicability decision">
                  <Save v-if="!store.isSaving" class="icon-xs" aria-hidden="true" />
                  <span v-else class="result-spinner" aria-hidden="true" />
                  {{ store.isSaving ? 'Saving…' : 'Save Decision' }}
                </Button>
              </CardContent>
            </Card>

            <Card v-if="store.currentRole">
              <CardHeader>
                <CardTitle class="audit-title">Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="audit-row">
                  <span class="audit-label">Last Reviewed By</span>
                  <span class="audit-value">{{ store.currentRole.createdByUserId }}</span>
                </div>
                <div class="audit-row">
                  <span class="audit-label">Last Review Date</span>
                  <span class="audit-value">{{ formatDate(store.currentRole.createdAt) }}</span>
                </div>
                <div class="audit-row">
                  <span class="audit-label">Saved Result</span>
                  <span class="badge" :class="getStatusClass(store.currentRole.result)">
                    {{ getStatusLabel(store.currentRole.result) }}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <!-- ── 8.4 Enhanced Requirements Tab ─────────────────── -->
      <TabsContent value="requirements">
        <div class="requirements-section">
          <div class="requirements-header">
            <div>
              <h2 class="requirements-title">Required Competencies</h2>
              <p class="requirements-subtitle">Competencies required for this role to be considered authorised. Team status shows how many people currently meet each requirement.</p>
            </div>
            <Button size="sm" aria-label="Add competency requirement">
              <Plus class="icon-xs" aria-hidden="true" />
              Add Competency
            </Button>
          </div>

          <Card>
            <CardContent class="requirements-table-wrap">
              <Table class="dense-table">
                <TableHeader>
                  <TableRow>
                    <TableHead style="width: 70px">Code</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead class="col-center">Mandatory</TableHead>
                    <TableHead>Interval</TableHead>
                    <TableHead class="col-center">Team Status</TableHead>
                    <TableHead class="table-actions-header">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="req in enrichedRequirements" :key="req.id">
                    <TableCell class="code-cell">{{ req.code }}</TableCell>
                    <TableCell class="req-name">{{ req.title }}</TableCell>
                    <TableCell>
                      <span class="badge" :class="compTypeBadgeClass(req.compType)">
                        {{ compTypeLabel(req.compType) }}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span class="category-text">{{ req.category }}</span>
                    </TableCell>
                    <TableCell>
                      <span v-if="req.isGating" class="badge badge-critical">Gating</span>
                      <span v-else class="badge badge-neutral">Required</span>
                    </TableCell>
                    <TableCell class="col-center">
                      <Flag v-if="req.mandatory" class="icon-xs flag-icon" aria-label="Mandatory" />
                      <span v-else class="req-empty">—</span>
                    </TableCell>
                    <TableCell>
                      <span class="interval-text">{{ req.interval }}</span>
                    </TableCell>
                    <TableCell class="col-center">
                      <div v-if="req.total > 0" class="team-status">
                        <span class="team-status-text" :class="req.metCount === req.total ? 'stat-good' : 'stat-warn'">
                          {{ req.metCount }}/{{ req.total }}
                        </span>
                        <div class="team-bar-track">
                          <div
                            class="team-bar-fill"
                            :style="{ width: (req.total > 0 ? (req.metCount / req.total) * 100 : 0) + '%' }"
                            :class="req.metCount === req.total ? 'bar-fill-good' : 'bar-fill-warn'"
                          />
                        </div>
                      </div>
                      <span v-else class="req-empty">—</span>
                    </TableCell>
                    <TableCell class="table-actions-cell">
                      <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                          <Button variant="ghost" size="icon" class="table-action-btn" aria-label="Requirement actions">
                            <MoreHorizontal class="icon-xs" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem @click="() => {
                            const r = store.roleRequirements.find(x => x.id === req.id)
                            if (r) openEditSheet(r)
                          }">Edit</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  <TableRow v-if="enrichedRequirements.length === 0">
                    <TableCell colspan="9" class="req-empty-state">
                      No requirements configured for this role yet.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <!-- ── 8.5 Assigned People Tab ────────────────────────── -->
      <TabsContent value="people">
        <div class="requirements-section">
          <div class="requirements-header">
            <div>
              <h2 class="requirements-title">Assigned People</h2>
              <p class="requirements-subtitle">All employees with the job title "{{ roleName }}" and their current competence status.</p>
            </div>
          </div>

          <Card>
            <CardContent class="requirements-table-wrap">
              <Table class="dense-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Current Status</TableHead>
                    <TableHead class="col-center">Gap Count</TableHead>
                    <TableHead class="col-center">Supervised Items</TableHead>
                    <TableHead class="col-center">Expiry Issues</TableHead>
                    <TableHead class="col-center">Readiness</TableHead>
                    <TableHead class="table-actions-header">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="person in assignedPeopleRows" :key="person.employeeId">
                    <TableCell class="req-name">{{ person.name }}</TableCell>
                    <TableCell>
                      <span class="badge" :class="statusBadgeClass(person.status)">
                        {{ person.status }}
                      </span>
                    </TableCell>
                    <TableCell class="col-center">
                      <span v-if="person.gapCount > 0" class="stat-count stat-warn">{{ person.gapCount }}</span>
                      <span v-else class="stat-count stat-good">0</span>
                    </TableCell>
                    <TableCell class="col-center">
                      <span v-if="person.supervisedItems > 0" class="stat-count stat-info">{{ person.supervisedItems }}</span>
                      <span v-else class="empty-value">0</span>
                    </TableCell>
                    <TableCell class="col-center">
                      <span v-if="person.expiryIssues > 0" class="stat-count stat-warn">{{ person.expiryIssues }}</span>
                      <span v-else class="empty-value">0</span>
                    </TableCell>
                    <TableCell class="col-center">
                      <div class="readiness-cell">
                        <span class="readiness-pct" :class="person.readiness >= 75 ? 'stat-good' : person.readiness >= 40 ? 'stat-warn' : 'stat-danger'">
                          {{ person.readiness }}%
                        </span>
                        <div class="team-bar-track">
                          <div
                            class="team-bar-fill"
                            :style="{ width: person.readiness + '%' }"
                            :class="{
                              'bar-fill-good': person.readiness >= 75,
                              'bar-fill-warn': person.readiness >= 40 && person.readiness < 75,
                              'bar-fill-danger': person.readiness < 40
                            }"
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell class="table-actions-cell">
                      <Button variant="ghost" size="sm" class="link-btn" aria-label="View employee profile">
                        <ExternalLink class="icon-xxs" aria-hidden="true" />
                        Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow v-if="assignedPeopleRows.length === 0">
                    <TableCell colspan="7" class="req-empty-state">
                      <div class="role-empty-state">
                        <Users class="role-empty-icon" />
                        <p class="role-empty-message">No employees currently assigned to this role.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <!-- ── 8.6 Risk Summary Tab ───────────────────────────── -->
      <TabsContent value="risk">
        <div class="requirements-section">
          <div class="requirements-header">
            <div>
              <h2 class="requirements-title">Role Risk Summary</h2>
              <p class="requirements-subtitle">Highest-risk competency gaps and common deficiencies across the assigned team.</p>
            </div>
          </div>

          <div v-if="assignedEmployees.length === 0" class="empty-panel">
            <AlertTriangle class="empty-panel-icon" />
            <p>No employee data available. Ensure the skills matrix has been built.</p>
          </div>

          <template v-else>
            <!-- Highest-Risk Missing Requirements -->
            <Card>
              <CardHeader>
                <CardTitle class="section-title">Highest-Risk Missing Requirements</CardTitle>
                <CardDescription>Competencies where the most assigned people have gaps, ordered by gap count.</CardDescription>
              </CardHeader>
              <CardContent>
                <div v-if="highestRiskItems.length === 0" class="req-empty-state">
                  No gaps found — all requirements are met across the team.
                </div>
                <Table v-else class="dense-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Competency</TableHead>
                      <TableHead class="col-center">Gap Count</TableHead>
                      <TableHead class="col-center">Gap Rate</TableHead>
                      <TableHead>Gating</TableHead>
                      <TableHead>Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="item in highestRiskItems" :key="item.compId">
                      <TableCell class="req-name">{{ item.title }}</TableCell>
                      <TableCell class="col-center">
                        <span class="gap-count-text">{{ item.gapCount }} of {{ item.total }} people missing</span>
                      </TableCell>
                      <TableCell class="col-center">
                        <span class="stat-count" :class="item.gapPct >= 50 ? 'stat-warn' : 'stat-info'">{{ item.gapPct }}%</span>
                      </TableCell>
                      <TableCell>
                        <span v-if="item.isGating" class="badge badge-critical">Gating</span>
                        <span v-else class="badge badge-neutral">Non-Gating</span>
                      </TableCell>
                      <TableCell>
                        <span class="badge" :class="riskSeverityBadge(item)">{{ riskSeverityLabel(item) }}</span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <!-- Common Gaps -->
            <Card>
              <CardHeader>
                <CardTitle class="section-title">Common Gaps Across Team</CardTitle>
                <CardDescription>Competencies where ≥ 50% of assigned people have a gap. These indicate systemic training needs.</CardDescription>
              </CardHeader>
              <CardContent>
                <div v-if="commonGaps.length === 0" class="req-empty-state">
                  No common gaps — no competency has a gap rate ≥ 50%.
                </div>
                <Table v-else class="dense-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Competency</TableHead>
                      <TableHead class="col-center">% Missing</TableHead>
                      <TableHead>Recommended Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="item in commonGaps" :key="item.compId">
                      <TableCell class="req-name">{{ item.title }}</TableCell>
                      <TableCell class="col-center">
                        <span class="stat-count stat-warn">{{ item.gapPct }}%</span>
                      </TableCell>
                      <TableCell class="action-text">{{ recommendedAction(item) }}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </template>
        </div>
      </TabsContent>

      <!-- ── 8.7 Linked Awareness Tab ───────────────────────── -->
      <TabsContent value="awareness">
        <div class="requirements-section">
          <div class="requirements-header">
            <div>
              <h2 class="requirements-title">Linked Awareness & Mandatory Communications</h2>
              <p class="requirements-subtitle">Active awareness topics and communications targeted at this role or all employees.</p>
            </div>
          </div>

          <Card>
            <CardContent class="requirements-table-wrap">
              <Table class="dense-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Completion</TableHead>
                    <TableHead>Delivery Method</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="topic in linkedAwareness" :key="topic.id">
                    <TableCell class="req-name">{{ topic.title }}</TableCell>
                    <TableCell>
                      <span class="badge" :class="topicTypeBadgeClass(topic.topicType)">
                        {{ topicTypeLabel(topic.topicType) }}
                      </span>
                    </TableCell>
                    <TableCell class="date-cell">{{ formatDate(topic.effectiveDate) }}</TableCell>
                    <TableCell>
                      <div class="completion-cell">
                        <span class="completion-pct">{{ topic.completion }}</span>
                      </div>
                    </TableCell>
                    <TableCell class="req-code">{{ deliveryLabel(topic.deliveryMethod) }}</TableCell>
                    <TableCell>
                      <span class="badge" :class="topic.status === 'Completed' ? 'badge-success' : topic.status === 'Active' ? 'badge-primary' : 'badge-neutral'">
                        {{ workflowLabel(topic.workflowStatus) }}
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow v-if="linkedAwareness.length === 0">
                    <TableCell colspan="6" class="req-empty-state">
                      No awareness topics are currently targeted at this role.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <!-- ── History Tab ────────────────────────────────────── -->
      <TabsContent value="history">
        <Card>
          <CardHeader>
            <div class="history-header">
              <div>
                <CardTitle>Version History</CardTitle>
                <CardDescription>Published versions of this role's requirements.</CardDescription>
              </div>
              <Button variant="outline" size="sm" aria-label="Open comparison tool">
                <ExternalLink class="icon-xs" aria-hidden="true" />
                Comparison Tool
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="store.requirementSets.length === 0" class="history-empty">
              No version history found.
            </div>
            <div v-else class="history-list">
              <div v-for="set in store.requirementSets" :key="set.id" class="history-item">
                <div class="history-version" aria-hidden="true">v{{ set.version }}</div>
                <div class="history-info">
                  <div class="history-status">
                    {{ set.status }}
                    <span v-if="set.status === 'PUBLISHED'" class="badge badge-success">Active</span>
                  </div>
                  <div class="history-date">Published {{ formatDate(set.publishedAt) }}</div>
                </div>
                <Button variant="ghost" size="sm" aria-label="View version details">View Details</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <!-- ── Edit Requirement Sheet ──────────────────────────── -->
    <Sheet :open="isEditSheetOpen" @update:open="isEditSheetOpen = $event">
      <SheetContent class="sheet-panel">
        <SheetHeader class="sheet-header">
          <SheetTitle>Edit Requirement</SheetTitle>
          <SheetDescription>Update the risk classification and assessment parameters for this competency.</SheetDescription>
        </SheetHeader>
        <div class="sheet-body">
          <div class="form-grid">
            <div class="form-field form-field-full">
              <Label for="edit-risk-level">Risk Level</Label>
              <Select v-model="editForm.riskLevelCode">
                <SelectTrigger id="edit-risk-level" aria-label="Select risk level">
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH_CRITICAL">High / Critical</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="form-field form-field-full">
              <Label for="edit-training-type">Training Type</Label>
              <Select v-model="editForm.trainingTypeCode">
                <SelectTrigger id="edit-training-type" aria-label="Select training type">
                  <SelectValue placeholder="Select training type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CERT_LICENCE">Certificate / Licence</SelectItem>
                  <SelectItem value="OJT_COACHING">OJT / Coaching</SelectItem>
                  <SelectItem value="AWARENESS">Awareness</SelectItem>
                  <SelectItem value="INDUCTION">Induction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="form-field form-field-full">
              <Label for="edit-assessment-method">Assessment Method</Label>
              <Select v-model="editForm.assessmentMethodCode">
                <SelectTrigger id="edit-assessment-method" aria-label="Select assessment method">
                  <SelectValue placeholder="Select assessment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OBSERVATION">Observation</SelectItem>
                  <SelectItem value="MANAGER_SIGNOFF">Manager Sign-Off</SelectItem>
                  <SelectItem value="RECORD_REVIEW">Record Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="form-divider" />
            <div class="form-field form-field-full">
              <div class="form-toggle-row">
                <div>
                  <p class="form-toggle-label">Mandatory</p>
                  <p class="form-toggle-desc">All employees in this role must hold this competency.</p>
                </div>
                <Switch v-model:checked="editForm.mandatory" aria-label="Toggle mandatory" />
              </div>
            </div>
            <div class="form-field form-field-full">
              <div class="form-toggle-row">
                <div>
                  <p class="form-toggle-label">Gating</p>
                  <p class="form-toggle-desc">Employee is not authorised until this competency is VALID.</p>
                </div>
                <Switch v-model:checked="editForm.isGating" aria-label="Toggle gating" />
              </div>
            </div>
          </div>
        </div>
        <SheetFooter class="sheet-footer">
          <Button variant="ghost" @click="isEditSheetOpen = false">Cancel</Button>
          <Button v-if="canEditRoleRequirements" :disabled="store.isSaving" @click="handleSaveRequirement">
            <span v-if="store.isSaving">Saving…</span>
            <span v-else>Save Changes</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>

  </div>

  <!-- Loading state -->
  <div v-else class="role-loading" aria-label="Loading role workspace" role="status">
    <span class="role-loading-spinner" aria-hidden="true" />
    <span>Loading role workspace…</span>
  </div>
</template>

<style scoped>
/* ─── Header ───────────────────────────────────────────── */
.role-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.role-header-text { flex: 1; }
.role-header-badge { display: flex; align-items: center; }

/* ─── 8.3 Summary Card ─────────────────────────────────── */
.summary-card {
  margin-bottom: var(--space-lg);
  border-left: 4px solid var(--brand-primary);
}

.summary-card-content {
  display: flex;
  gap: var(--space-2xl);
  padding: var(--space-lg);
  flex-wrap: wrap;
}

.summary-meta {
  flex: 1;
  min-width: 220px;
}

.summary-meta-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-sm);
}

.summary-role-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-heading);
  margin: 0 0 var(--space-xs) 0;
}

.summary-dept {
  font-size: 0.8125rem;
  color: var(--text-caption);
  margin: 0;
}

.summary-criticality-badge {
  white-space: nowrap;
  flex-shrink: 0;
}

.summary-purpose {
  font-size: 0.8125rem;
  color: var(--text-body);
  line-height: 1.5;
  margin: 0;
}

.summary-stats {
  display: flex;
  align-items: flex-start;
  gap: var(--space-xl);
  flex-wrap: wrap;
}

.summary-stat {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.summary-stat-icon {
  width: 20px;
  height: 20px;
  color: var(--text-caption);
  flex-shrink: 0;
}

.stat-icon-good { color: var(--brand-success); }
.stat-icon-warn { color: var(--brand-warning); }

.summary-stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-heading);
  margin: 0;
  line-height: 1;
}

.summary-stat-label {
  font-size: 0.75rem;
  color: var(--text-caption);
  margin: 2px 0 0 0;
}

/* Readiness block */
.summary-readiness {
  min-width: 160px;
}

.readiness-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}

.readiness-label {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.readiness-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-heading);
}

.readiness-bar-track {
  height: 8px;
  background: var(--bg-subtle);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 4px;
}

.readiness-bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.4s ease;
}

.readiness-subtext {
  font-size: 0.6875rem;
  color: var(--text-caption);
  margin: 0;
}

/* ─── Progress bar fills ───────────────────────────────── */
.bar-fill-good   { background: var(--brand-success); }
.bar-fill-warn   { background: var(--brand-warning); }
.bar-fill-danger { background: oklch(0.5 0.2 25); }

/* ─── Applicability layout ─────────────────────────────── */
.applicability-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--space-lg);
  margin-top: var(--space-lg);
  align-items: start;
}

.questions-column { min-width: 0; }

.result-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  position: sticky;
  top: var(--space-lg);
}

/* ─── Questions ────────────────────────────────────────── */
.questions-content {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: var(--space-md);
}

.question-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-lg);
  padding: var(--space-md) 0;
}

.question-meta {
  display: flex;
  gap: var(--space-md);
  align-items: flex-start;
  flex: 1;
  min-width: 0;
}

.question-badge {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-full);
  background: var(--brand-primary);
  color: oklch(1 0 0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 700;
  margin-top: 2px;
}

.question-text { flex: 1; min-width: 0; }
.question-label { font-size: 0.875rem; font-weight: 600; color: var(--text-heading); margin: 0 0 var(--space-xs) 0; }
.question-desc { font-size: 0.8125rem; color: var(--text-body); margin: 0 0 var(--space-xs) 0; line-height: 1.5; }
.question-examples { font-size: 0.75rem; color: var(--text-caption); font-style: italic; margin: 0 0 var(--space-xs) 0; }

.question-flow { display: flex; align-items: center; gap: var(--space-xs); flex-wrap: wrap; }
.flow-yes { font-size: 0.6875rem; font-weight: 600; color: var(--brand-success); }
.flow-sep { font-size: 0.6875rem; color: var(--text-caption); }
.flow-no  { font-size: 0.6875rem; color: var(--text-caption); }

.question-notes { padding: var(--space-md) 0 var(--space-sm); display: flex; flex-direction: column; gap: var(--space-xs); }

.escalation-tip {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: oklch(0.72 0.15 58 / 0.08);
  border-left: 3px solid var(--brand-warning);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin-top: var(--space-xs);
}

.escalation-tip svg { color: var(--brand-warning); flex-shrink: 0; margin-top: 2px; }
.escalation-tip p { font-size: 0.75rem; color: var(--text-body); margin: 0; line-height: 1.5; }

/* ─── Result card ──────────────────────────────────────── */
.result-card-title { font-size: 0.8125rem; }
.result-label { font-size: 0.75rem; color: var(--text-caption); margin: 0 0 var(--space-sm) 0; }

.result-outcome {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.result-outcome-included      { background: oklch(0.62 0.14 162 / 0.1); color: var(--brand-success); }
.result-outcome-awareness-only { background: oklch(0.72 0.15 58 / 0.1); color: var(--brand-warning); }
.result-outcome-out-of-scope   { background: var(--bg-subtle); color: var(--text-caption); }

.result-hint { font-size: 0.75rem; color: var(--text-caption); margin: 0 0 var(--space-md) 0; }
.result-save-btn { width: 100%; }

.result-spinner {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: var(--radius-full);
  animation: spin 0.6s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ─── Audit card ───────────────────────────────────────── */
.audit-title { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-caption); }

.audit-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs) 0;
  font-size: 0.8125rem;
  border-bottom: var(--border-subtle);
}

.audit-row:last-child { border-bottom: none; }
.audit-label { color: var(--text-caption); }
.audit-value { font-weight: 500; color: var(--text-body); }

/* ─── Requirements / People / Risk / Awareness sections ── */
.requirements-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

.requirements-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.requirements-title { font-size: 1rem; font-weight: 600; color: var(--text-heading); margin: 0 0 var(--space-xs) 0; }
.requirements-subtitle { font-size: 0.8125rem; color: var(--text-caption); margin: 0; }
.requirements-table-wrap { padding: 0; }

.section-title { font-size: 0.9375rem; }

/* ─── Table helpers ────────────────────────────────────── */
.col-center { text-align: center; }
.code-cell { font-family: var(--font-mono); font-size: 0.75rem; }
.req-name { font-weight: 500; color: var(--text-heading); }
.req-code { font-size: 0.75rem; text-transform: uppercase; color: var(--text-caption); letter-spacing: 0.02em; }
.req-empty { color: var(--text-caption); }
.req-empty-state { text-align: center; padding: var(--space-2xl); color: var(--text-caption); font-style: italic; }

.role-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xl) 0;
  font-style: normal;
}

.role-empty-icon {
  width: 32px;
  height: 32px;
  color: var(--text-caption);
  opacity: 0.4;
}

.role-empty-message {
  font-size: 0.875rem;
  color: var(--text-caption);
  margin: 0;
}
.date-cell { font-size: 0.8125rem; white-space: nowrap; }
.category-text { font-size: 0.75rem; color: var(--text-caption); }
.interval-text { font-size: 0.8125rem; white-space: nowrap; }
.action-text { font-size: 0.8125rem; color: var(--text-body); }
.gap-count-text { font-size: 0.8125rem; color: var(--text-body); }
.completion-pct { font-size: 0.875rem; font-weight: 600; color: var(--text-body); }

/* ─── Team status mini bar ─────────────────────────────── */
.team-status { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.team-status-text { font-size: 0.75rem; font-weight: 600; }
.team-bar-track { width: 48px; height: 4px; background: var(--bg-subtle); border-radius: var(--radius-full); overflow: hidden; }
.team-bar-fill { height: 100%; border-radius: var(--radius-full); transition: width 0.3s ease; }

/* ─── Readiness cell ───────────────────────────────────── */
.readiness-cell { display: flex; flex-direction: column; align-items: center; gap: 3px; }
.readiness-pct { font-size: 0.8125rem; font-weight: 600; }

/* ─── Stat counts ──────────────────────────────────────── */
.stat-count { font-size: 0.875rem; font-weight: 600; display: inline-block; min-width: 24px; text-align: center; }
.stat-good   { color: var(--brand-success); }
.stat-warn   { color: var(--brand-warning); }
.stat-info   { color: var(--brand-primary); }
.stat-danger { color: oklch(0.5 0.2 25); }
.empty-value { font-size: 0.75rem; color: var(--text-caption); }

/* ─── Flag icon ────────────────────────────────────────── */
.flag-icon { color: var(--brand-primary); }

/* ─── Link button ──────────────────────────────────────── */
.link-btn { font-size: 0.75rem; gap: 4px; }

/* ─── Risk badges ──────────────────────────────────────── */
.badge-critical {
  background-color: oklch(0.5 0.2 25 / 0.15);
  color: oklch(0.45 0.2 25);
  border: 1px solid oklch(0.5 0.2 25 / 0.3);
}

.badge-high {
  background-color: oklch(0.65 0.18 50 / 0.15);
  color: oklch(0.5 0.18 50);
  border: 1px solid oklch(0.65 0.18 50 / 0.3);
}

.badge-info {
  background-color: oklch(0.55 0.15 255 / 0.12);
  color: oklch(0.45 0.15 255);
  border: 1px solid oklch(0.55 0.15 255 / 0.25);
}

/* ─── Empty panel ──────────────────────────────────────── */
.empty-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-2xl);
  color: var(--text-caption);
  text-align: center;
}

.empty-panel-icon { width: 32px; height: 32px; color: var(--brand-warning); }

/* ─── History tab ──────────────────────────────────────── */
.history-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-md); }
.history-list { display: flex; flex-direction: column; gap: var(--space-sm); }

.history-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border: var(--border-subtle);
  border-radius: var(--radius-md);
  transition: background 0.15s ease;
}

.history-item:hover { background: var(--bg-subtle); }

.history-version {
  width: 40px; height: 40px;
  border-radius: var(--radius-full);
  background: oklch(0.38 0.14 266 / 0.1);
  color: var(--brand-primary);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
}

.history-info { flex: 1; }
.history-status { font-size: 0.875rem; font-weight: 600; color: var(--text-heading); display: flex; align-items: center; gap: var(--space-xs); margin-bottom: 2px; }
.history-date { font-size: 0.75rem; color: var(--text-caption); }
.history-empty { text-align: center; padding: var(--space-2xl); color: var(--text-caption); font-style: italic; }

/* ─── Sheet panel ──────────────────────────────────────── */
.sheet-body { padding: var(--space-lg); overflow-y: auto; flex: 1; }
.form-grid { display: flex; flex-direction: column; gap: var(--space-md); }
.form-field { display: flex; flex-direction: column; gap: var(--space-xs); }
.form-field-full { width: 100%; }
.form-divider { border-top: var(--border-subtle); margin: var(--space-xs) 0; }
.form-toggle-row { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-md); }
.form-toggle-label { font-size: 0.875rem; font-weight: 500; color: var(--text-heading); margin: 0 0 2px 0; }
.form-toggle-desc { font-size: 0.75rem; color: var(--text-caption); margin: 0; }

/* ─── Loading ──────────────────────────────────────────── */
.role-loading {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: var(--space-md); padding: var(--space-2xl); color: var(--text-caption);
}

.role-loading-spinner {
  display: inline-block;
  width: 24px; height: 24px;
  border: 2px solid var(--brand-primary);
  border-top-color: transparent;
  border-radius: var(--radius-full);
  animation: spin 0.6s linear infinite;
}

/* ─── Icon sizes ───────────────────────────────────────── */
.icon-xxs { width: 12px; height: 12px; }

/* ─── Responsive ───────────────────────────────────────── */
@media (max-width: 1024px) {
  .applicability-layout { grid-template-columns: 1fr; }
  .result-column { position: static; }
  .summary-card-content { flex-direction: column; }
  .summary-stats { gap: var(--space-lg); }
}
</style>
