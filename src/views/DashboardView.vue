<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useEmployeesStore } from '@/stores/employees'
import { useSkillsMatrixStore } from '@/stores/skillsMatrix'
import { useTrainingNeedsStore } from '@/stores/trainingNeeds'
import {
  AlertTriangle,
  Eye,
  UserX,
  Clock,
  FileWarning,
  Megaphone,
  ShieldAlert,
  RefreshCw,
  FileText,
  SlidersHorizontal,
  UserCircle2,
} from 'lucide-vue-next'
import activityData from '@/data/dashboardActivity.json'
import awarenessData from '@/data/awarenessTopics.json'
import { roleAudienceIncludes } from '@/lib/demoDomain'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import GapByDepartmentChart from '@/components/dashboard/GapByDepartmentChart.vue'
import GapByCategoryChart from '@/components/dashboard/GapByCategoryChart.vue'
import SourceBreakdownChart from '@/components/dashboard/SourceBreakdownChart.vue'
import RoleReadinessChart from '@/components/dashboard/RoleReadinessChart.vue'
import ExpiryTrendChart from '@/components/dashboard/ExpiryTrendChart.vue'

// ─── Stores & router ──────────────────────────────────────────────────────────

const router = useRouter()
const authStore = useAuthStore()
const employeesStore = useEmployeesStore()
const matrixStore = useSkillsMatrixStore()
const trainingStore = useTrainingNeedsStore()

// ─── Static data ──────────────────────────────────────────────────────────────

const recentActivity = ref(activityData)

interface AwarenessTopicRaw {
  id: string
  title: string
  completion: string
  status: string
  targetAudience: string
  requiredAudience?: string[] | string
}

const awarenessTopics = awarenessData as AwarenessTopicRaw[]

// ─── Dashboard filters ────────────────────────────────────────────────────────

const filterDepartment = ref('')
const filterRole = ref('')

function clearFilters() {
  filterDepartment.value = ''
  filterRole.value = ''
}

// ─── Scope and filters ────────────────────────────────────────────────────────

const scopedEmployeeIdSet = computed(() => new Set(authStore.scopedEmployeeIds))

const scopedEmployees = computed(() => {
  const scopedIds = scopedEmployeeIdSet.value
  return matrixStore.mockEmployeeRows.filter((employee) => scopedIds.has(employee.employeeId))
})

const showDepartmentFilter = computed(() =>
  ['MANAGER', 'QHSE', 'HR_ADMIN', 'ADMIN', 'LEADERSHIP_VIEWER'].includes(authStore.userRole),
)

const showRoleFilter = computed(() =>
  ['MANAGER', 'QHSE', 'HR_ADMIN', 'ADMIN', 'LEADERSHIP_VIEWER'].includes(authStore.userRole),
)

const showFilterBar = computed(() => showDepartmentFilter.value || showRoleFilter.value)

const roleFilterEmployees = computed(() => {
  if (!filterDepartment.value) return scopedEmployees.value
  return scopedEmployees.value.filter((employee) => employee.department === filterDepartment.value)
})

const scopeBanner = computed(() => {
  const scopedCount = scopedEmployees.value.length

  switch (authStore.userRole) {
    case 'SUPERVISOR':
      return {
        title: `${authStore.activePersona.displayName}'s Team`,
        subtitle: `${scopedCount} direct reports`,
      }
    case 'MANAGER':
      return {
        title: `${authStore.activePersona.displayName}'s Production Area`,
        subtitle: `${scopedCount} reports`,
      }
    case 'QHSE':
    case 'HR_ADMIN':
    case 'ADMIN':
    case 'LEADERSHIP_VIEWER':
      return {
        title: 'Full Organisation',
        subtitle: `${scopedCount} employees`,
      }
    default:
      return null
  }
})

const availableDepartments = computed(() => {
  const depts = new Set<string>()
  for (const emp of scopedEmployees.value) {
    if (emp.department) depts.add(emp.department)
  }
  return Array.from(depts).sort()
})

const availableRoles = computed(() => {
  const roles = new Set<string>()
  for (const emp of roleFilterEmployees.value) {
    if (emp.jobTitle) roles.add(emp.jobTitle)
  }
  return Array.from(roles).sort()
})

watch(
  [() => authStore.userRole, availableDepartments, availableRoles],
  () => {
    if (!showDepartmentFilter.value) {
      filterDepartment.value = ''
    } else if (
      filterDepartment.value &&
      !availableDepartments.value.includes(filterDepartment.value)
    ) {
      filterDepartment.value = ''
    }

    if (!showRoleFilter.value) {
      filterRole.value = ''
    } else if (filterRole.value && !availableRoles.value.includes(filterRole.value)) {
      filterRole.value = ''
    }
  },
  { immediate: true },
)

const filteredEmployees = computed(() => {
  let result = scopedEmployees.value

  if (filterDepartment.value) {
    result = result.filter((e) => e.department === filterDepartment.value)
  }
  if (filterRole.value) {
    result = result.filter((e) => e.jobTitle === filterRole.value)
  }
  return result
})

const filteredEmployeeIds = computed(() => new Set(filteredEmployees.value.map((employee) => employee.employeeId)))

const scopedTrainingNeeds = computed(() =>
  trainingStore.trainingNeeds.filter((need) => filteredEmployeeIds.value.has(need.erpEmployeeId)),
)

const scopedRoleNames = computed(() => {
  const roleNames = new Set<string>()
  filteredEmployees.value.forEach((employee) => {
    if (employee.jobTitle) {
      roleNames.add(employee.jobTitle)
    }
  })
  return [...roleNames]
})

const scopedAwarenessTopics = computed(() =>
  awarenessTopics.filter((topic) => {
    const completionPercent = parseInt(topic.completion, 10)
    return (
      topic.status === 'Active' &&
      completionPercent < 100 &&
      scopedRoleNames.value.some((roleName) =>
        roleAudienceIncludes(topic.requiredAudience ?? topic.targetAudience, roleName),
      )
    )
  }),
)

const scopedRecentActivity = computed(() => {
  if (
    ['QHSE', 'HR_ADMIN', 'ADMIN', 'LEADERSHIP_VIEWER'].includes(authStore.userRole) &&
    !filterDepartment.value &&
    !filterRole.value
  ) {
    return recentActivity.value
  }

  const keywords = new Set<string>()

  filteredEmployees.value.forEach((employee) => {
    keywords.add(employee.displayName)

    switch (employee.department) {
      case 'Welding & Fabrication':
        keywords.add('Welding')
        keywords.add('Abrasive Wheels')
        keywords.add('Forklift')
        break
      case 'Robotics':
        keywords.add('Robot')
        keywords.add('Robot cell')
        break
      case 'Additive Manufacturing':
        keywords.add('Additive Manufacturing')
        break
      case 'Materials Testing':
        keywords.add('Materials Testing')
        break
      case 'Quality Assurance':
        keywords.add('QA')
        break
      default:
        break
    }
  })

  return recentActivity.value.filter((activity) =>
    [...keywords].some((keyword) => activity.message.includes(keyword)),
  )
})

// ─── KPIs computed from filtered employees ────────────────────────────────────

const today = new Date().toISOString().split('T')[0]!

const kpis = computed(() => {
  const employees = filteredEmployees.value

  const totalRequired = employees.reduce((s, e) => s + e.requiredCount, 0)
  const totalExpired = employees.reduce((s, e) => s + e.expiredCount, 0)
  const totalExpiring = employees.reduce((s, e) => s + e.expiringCount, 0)
  const totalSupervised = employees.filter((e) => e.supervisionStatus === 'SUPERVISED_ONLY').length
  const notAuthorised = employees.filter((e) => !e.isAuthorised).length

  const ncrCapaCount = scopedTrainingNeeds.value.filter(
    (n) => n.sourceType === 'NCR_CAPA' && n.status === 'OPEN',
  ).length

  const awarenessPending = scopedAwarenessTopics.value.length

  const roleMap = new Map<string, { total: number; notAuth: number }>()
  for (const emp of employees) {
    const r = emp.jobTitle || 'Unknown'
    if (!roleMap.has(r)) roleMap.set(r, { total: 0, notAuth: 0 })
    const entry = roleMap.get(r)!
    entry.total++
    if (!emp.isAuthorised) entry.notAuth++
  }
  const criticalRoles = Array.from(roleMap.values()).filter(
    (v) => v.total > 0 && v.notAuth / v.total > 0.5,
  ).length

  const overdueReassessments = scopedTrainingNeeds.value.filter(
    (n) => n.status === 'OPEN' && n.dueDate != null && n.dueDate < today,
  ).length

  return {
    openGaps: totalRequired + totalExpired,
    totalSupervised,
    notAuthorised,
    totalExpiring,
    ncrCapaCount,
    awarenessPending,
    criticalRoles,
    overdueReassessments,
  }
})

// ─── List sections ────────────────────────────────────────────────────────────

/** 3.5.1 — Highest-risk open gaps (top 5 gating EXPIRED or REQUIRED) */
const highestRiskGaps = computed(() => {
  const results: Array<{
    id: string
    name: string
    jobTitle: string
    competency: string
    riskLevel: string
    daysOverdue: number
  }> = []

  for (const emp of filteredEmployees.value) {
    for (const item of emp.competenceItems.values()) {
      if (
        item.isGating &&
        (item.derivedStatus === 'EXPIRED' || item.derivedStatus === 'REQUIRED')
      ) {
        const comp = matrixStore.getCompetencyById(item.competencyId)
        const daysOverdue = item.expiryDate
          ? Math.max(0, Math.ceil((Date.now() - new Date(item.expiryDate).getTime()) / 86400000))
          : 30 // mock fallback
        results.push({
          id: `${emp.employeeId}-${item.competencyId}`,
          name: emp.displayName,
          jobTitle: emp.jobTitle,
          competency: comp?.title ?? 'Unknown',
          riskLevel: comp?.riskLevel ?? 'MEDIUM',
          daysOverdue,
        })
        if (results.length >= 5) break
      }
    }
    if (results.length >= 5) break
  }

  return results.slice(0, 5)
})

/** 3.5.2 — People under supervised work (top 4 SUPERVISED_ONLY) */
const supervisedPeople = computed(() =>
  filteredEmployees.value
    .filter((e) => e.supervisionStatus === 'SUPERVISED_ONLY')
    .slice(0, 4)
    .map((e) => ({
      id: e.employeeId,
      name: e.displayName,
      jobTitle: e.jobTitle,
      supervisedCount: e.supervisedCount,
    })),
)

const pendingAwareness = computed(() =>
  scopedAwarenessTopics.value.slice(0, 5).map((topic) => ({
    id: topic.id,
    title: topic.title,
    completion: parseInt(topic.completion, 10),
    audience: topic.targetAudience,
  })),
)

/** 3.5.4 — Overdue competence reviews (top 4 training needs past due) */
const overdueReviews = computed(() => {
  return scopedTrainingNeeds.value
    .filter((n) => {
      return n.status === 'OPEN' && n.dueDate != null && n.dueDate < today
    })
    .slice(0, 4)
    .map((n) => {
      const emp = matrixStore.getEmployeeById(n.erpEmployeeId)
      const daysOverdue = n.dueDate
        ? Math.max(0, Math.ceil((Date.now() - new Date(n.dueDate).getTime()) / 86400000))
        : 0
      return {
        id: n.id,
        employeeName: emp?.displayName ?? 'Unknown',
        competency: n.employeeCompetenceItemId ?? n.trainingTypeCode,
        source: n.sourceType ?? '—',
        daysOverdue,
      }
    })
})

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  await employeesStore.fetchEmployees()
  await matrixStore.fetchAndBuildMatrix(employeesStore.allEmployees)
  await trainingStore.fetchTrainingNeeds()
})

// ─── Navigation helpers ───────────────────────────────────────────────────────

function navigate(path: string, query?: Record<string, string>) {
  router.push({ path, query })
}

// ─── Employee-specific view ───────────────────────────────────────────────────

const isEmployee = computed(() => authStore.userRole === 'EMPLOYEE')

/** Personal gap count for the current employee persona */
const currentEmployeeRow = computed(() =>
  authStore.activePersona.employeeId
    ? matrixStore.getEmployeeById(authStore.activePersona.employeeId)
    : undefined,
)

const myGapCount = computed(() => {
  return (currentEmployeeRow.value?.expiredCount ?? 0) + (currentEmployeeRow.value?.requiredCount ?? 0)
})

/** Expiring items for current employee persona */
const myExpiringCount = computed(() => {
  return currentEmployeeRow.value?.expiringCount ?? 0
})

/** Pending awareness topics for current employee */
const myPendingAwareness = computed(() =>
  awarenessTopics
    .filter((t) => t.status === 'Active' && parseInt(t.completion, 10) < 100)
    .filter((topic) =>
      roleAudienceIncludes(
        topic.requiredAudience ?? topic.targetAudience,
        authStore.activePersona.linkedJobTitle,
      ),
    )
    .slice(0, 3)
    .map((t) => ({ id: t.id, title: t.title, completion: parseInt(t.completion, 10) })),
)
</script>

<template>
  <!-- ── Employee personal view ─────────────────────────────────────────────── -->
  <template v-if="isEmployee">
    <div class="page-header">
      <h1 class="page-title">My Dashboard</h1>
      <p class="page-subtitle">
        Your personal competence status — gaps, expiring items, and pending awareness topics
      </p>
    </div>

    <div class="kpi-grid">
      <div
        class="kpi-card kpi-card-clickable"
        role="button"
        tabindex="0"
        @click="navigate('/my-competencies')"
        @keyup.enter="navigate('/my-competencies')"
      >
        <div class="kpi-card-header">
          <span class="kpi-card-title">My Open Gaps</span>
          <AlertTriangle class="kpi-card-icon kpi-icon-danger" />
        </div>
        <div class="kpi-card-value">{{ myGapCount }}</div>
        <div class="kpi-card-change kpi-card-change-negative">Competencies requiring action</div>
      </div>

      <div
        class="kpi-card kpi-card-clickable"
        role="button"
        tabindex="0"
        @click="navigate('/my-competencies')"
        @keyup.enter="navigate('/my-competencies')"
      >
        <div class="kpi-card-header">
          <span class="kpi-card-title">Expiring Soon</span>
          <Clock class="kpi-card-icon kpi-icon-warning" />
        </div>
        <div class="kpi-card-value">{{ myExpiringCount }}</div>
        <div class="kpi-card-change">Expiring within 30 days</div>
      </div>

      <div
        class="kpi-card kpi-card-clickable"
        role="button"
        tabindex="0"
        @click="navigate('/awareness-topics')"
        @keyup.enter="navigate('/awareness-topics')"
      >
        <div class="kpi-card-header">
          <span class="kpi-card-title">Pending Awareness Topics</span>
          <Megaphone class="kpi-card-icon kpi-icon-warning" />
        </div>
        <div class="kpi-card-value">{{ myPendingAwareness.length }}</div>
        <div class="kpi-card-change">Awaiting your acknowledgement</div>
      </div>
    </div>

    <div class="employee-cta" style="margin-top: var(--space-xl)">
      <div class="employee-cta-content">
        <UserCircle2 class="employee-cta-icon" />
        <div>
          <p class="employee-cta-title">View My Readiness Profile</p>
          <p class="employee-cta-subtitle">
            See your full competence profile, role requirements, evidence records, and authorisation
            status
          </p>
        </div>
      </div>
      <Button class="employee-cta-btn" @click="navigate('/my-competencies')">
        View My Readiness Profile
      </Button>
    </div>

    <div
      v-if="myPendingAwareness.length > 0"
      class="dashboard-list"
      style="margin-top: var(--space-xl)"
    >
      <div class="dashboard-list-header">
        <h2 class="dashboard-list-title">Pending Awareness Topics</h2>
        <span class="dashboard-list-subtitle">Topics awaiting your acknowledgement</span>
      </div>
      <div class="dashboard-list-content">
        <div v-for="item in myPendingAwareness" :key="item.id" class="dashboard-list-item">
          <div class="dashboard-list-item-main">
            <span class="dashboard-list-item-title">{{ item.title }}</span>
          </div>
          <div class="dashboard-list-item-meta">
            <span class="badge badge-warning">{{ item.completion }}% done</span>
          </div>
        </div>
      </div>
    </div>
  </template>

  <!-- ── Management dashboard ───────────────────────────────────────────────── -->
  <template v-else>
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">
        Operational readiness — competence gaps, authorisation status, expiring certifications, and
        outstanding actions
      </p>
    </div>

    <div v-if="scopeBanner" class="dashboard-scope-banner">
      <div class="dashboard-scope-banner-content">
        <span class="dashboard-scope-banner-title">{{ scopeBanner.title }}</span>
        <span class="dashboard-scope-banner-subtitle">{{ scopeBanner.subtitle }}</span>
      </div>
    </div>

    <!-- ── Filter Bar ─────────────────────────────────────────────────────────── -->
    <div v-if="showFilterBar" class="filter-bar">
      <SlidersHorizontal class="filter-bar-icon" />
      <Select v-if="showDepartmentFilter" v-model="filterDepartment">
        <SelectTrigger class="filter-select" aria-label="Filter by department">
          <SelectValue placeholder="All Departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="dept in availableDepartments" :key="dept" :value="dept">{{ dept }}</SelectItem>
        </SelectContent>
      </Select>

      <Select v-if="showRoleFilter" v-model="filterRole">
        <SelectTrigger class="filter-select" aria-label="Filter by role">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="role in availableRoles" :key="role" :value="role">{{ role }}</SelectItem>
        </SelectContent>
      </Select>

      <Button
        v-if="filterDepartment || filterRole"
        variant="ghost"
        class="filter-clear-btn"
        @click="clearFilters"
      >
        Clear filters
      </Button>
    </div>

    <!-- ── KPI Grid ───────────────────────────────────────────────────────────── -->
    <div class="kpi-grid">
      <!-- 1. Open Competence Gaps -->
      <div
        class="kpi-card kpi-card-clickable"
        @click="navigate('/training-needs', { status: 'OPEN' })"
        role="button"
        tabindex="0"
        @keyup.enter="navigate('/training-needs', { status: 'OPEN' })"
      >
        <div class="kpi-card-header">
          <span class="kpi-card-title">Open Competence Gaps</span>
          <AlertTriangle class="kpi-card-icon kpi-icon-danger" />
        </div>
        <div class="kpi-card-value">{{ kpis.openGaps }}</div>
        <div class="kpi-card-change kpi-card-change-negative">Requiring action</div>
      </div>

      <!-- 2. Personnel Under Supervision -->
      <div
        class="kpi-card kpi-card-clickable"
        @click="navigate('/skills-matrix', { underSupervisionOnly: 'true' })"
        role="button"
        tabindex="0"
        @keyup.enter="navigate('/skills-matrix', { underSupervisionOnly: 'true' })"
      >
        <div class="kpi-card-header">
          <span class="kpi-card-title">Personnel Under Supervision</span>
          <Eye class="kpi-card-icon kpi-icon-warning" />
        </div>
        <div class="kpi-card-value">{{ kpis.totalSupervised }}</div>
        <div class="kpi-card-change">Awaiting independent work sign-off</div>
      </div>

      <!-- 3. Not Authorised -->
      <div
        class="kpi-card kpi-card-clickable"
        @click="navigate('/skills-matrix', { gatingOnly: 'true' })"
        role="button"
        tabindex="0"
        @keyup.enter="navigate('/skills-matrix', { gatingOnly: 'true' })"
      >
        <div class="kpi-card-header">
          <span class="kpi-card-title">Not Authorised</span>
          <UserX class="kpi-card-icon kpi-icon-danger" />
        </div>
        <div class="kpi-card-value">{{ kpis.notAuthorised }}</div>
        <div class="kpi-card-change kpi-card-change-negative">Gating requirements not met</div>
      </div>

      <!-- 4. Certifications Expiring -->
      <div
        class="kpi-card kpi-card-clickable"
        @click="navigate('/skills-matrix', { status: 'EXPIRING' })"
        role="button"
        tabindex="0"
        @keyup.enter="navigate('/skills-matrix', { status: 'EXPIRING' })"
      >
        <div class="kpi-card-header">
          <span class="kpi-card-title">Certifications Expiring (30d)</span>
          <Clock class="kpi-card-icon kpi-icon-warning" />
        </div>
        <div class="kpi-card-value">{{ kpis.totalExpiring }}</div>
        <div class="kpi-card-change kpi-card-change-negative">Expiring within 30 days</div>
      </div>

      <!-- 5. NCR/CAPA-Linked Actions -->
      <div
        class="kpi-card kpi-card-clickable"
        @click="navigate('/training-needs', { source: 'NCR_CAPA' })"
        role="button"
        tabindex="0"
        @keyup.enter="navigate('/training-needs', { source: 'NCR_CAPA' })"
      >
        <div class="kpi-card-header">
          <span class="kpi-card-title">NCR/CAPA-Linked Actions</span>
          <FileWarning class="kpi-card-icon kpi-icon-danger" />
        </div>
        <div class="kpi-card-value">{{ kpis.ncrCapaCount }}</div>
        <div class="kpi-card-change">Open corrective actions</div>
      </div>

      <!-- 6. Awareness Pending -->
      <div
        class="kpi-card kpi-card-clickable"
        @click="navigate('/awareness-topics')"
        role="button"
        tabindex="0"
        @keyup.enter="navigate('/awareness-topics')"
      >
        <div class="kpi-card-header">
          <span class="kpi-card-title">Awareness Pending</span>
          <Megaphone class="kpi-card-icon kpi-icon-warning" />
        </div>
        <div class="kpi-card-value">{{ kpis.awarenessPending }}</div>
        <div class="kpi-card-change">Awaiting acknowledgement</div>
      </div>

      <!-- 7. Critical Roles at Risk -->
      <div
        class="kpi-card kpi-card-clickable"
        @click="navigate('/roles')"
        role="button"
        tabindex="0"
        @keyup.enter="navigate('/roles')"
      >
        <div class="kpi-card-header">
          <span class="kpi-card-title">Critical Roles at Risk</span>
          <ShieldAlert class="kpi-card-icon kpi-icon-danger" />
        </div>
        <div class="kpi-card-value">{{ kpis.criticalRoles }}</div>
        <div class="kpi-card-change kpi-card-change-negative">Roles below readiness threshold</div>
      </div>

      <!-- 8. Overdue Reassessments -->
      <div
        class="kpi-card kpi-card-clickable"
        @click="navigate('/training-needs', { overdue: 'true' })"
        role="button"
        tabindex="0"
        @keyup.enter="navigate('/training-needs', { overdue: 'true' })"
      >
        <div class="kpi-card-header">
          <span class="kpi-card-title">Overdue Reassessments</span>
          <RefreshCw class="kpi-card-icon kpi-icon-danger" />
        </div>
        <div class="kpi-card-value">{{ kpis.overdueReassessments }}</div>
        <div class="kpi-card-change kpi-card-change-negative">Past due date</div>
      </div>
    </div>

    <!-- ── Charts Grid ─────────────────────────────────────────────────────────── -->
    <div class="charts-grid" style="margin-top: var(--space-xl)">
      <GapByDepartmentChart :employees="filteredEmployees" />
      <GapByCategoryChart :employees="filteredEmployees" />
      <SourceBreakdownChart :needs="scopedTrainingNeeds" />
      <RoleReadinessChart :employees="filteredEmployees" />
    </div>

    <!-- Expiry Trend — full width -->
    <div style="margin-top: var(--space-lg)">
      <ExpiryTrendChart :employees="filteredEmployees" />
    </div>

    <!-- ── List Sections ───────────────────────────────────────────────────────── -->
    <div class="dashboard-lists" style="margin-top: var(--space-xl)">
      <!-- 1. Highest-Risk Open Gaps -->
      <div class="dashboard-list">
        <div class="dashboard-list-header">
          <h2 class="dashboard-list-title">Highest-Risk Open Gaps</h2>
          <span class="dashboard-list-subtitle">Top gating items — EXPIRED or REQUIRED</span>
        </div>
        <div class="dashboard-list-content">
          <div v-if="highestRiskGaps.length === 0" class="dashboard-list-empty">
            No open gating gaps found
          </div>
          <div v-for="item in highestRiskGaps" :key="item.id" class="dashboard-list-item">
            <div class="dashboard-list-item-main">
              <span class="dashboard-list-item-title">{{ item.name }}</span>
              <span class="dashboard-list-item-subtitle">{{ item.competency }}</span>
            </div>
            <div class="dashboard-list-item-meta">
              <span
                class="badge"
                :class="item.riskLevel === 'HIGH_CRITICAL' ? 'badge-critical' : 'badge-warning'"
                >{{ item.riskLevel === 'HIGH_CRITICAL' ? 'HIGH' : item.riskLevel }}</span
              >
              <span class="dashboard-list-item-date">{{ item.daysOverdue }}d overdue</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. People Under Supervised Work -->
      <div class="dashboard-list">
        <div class="dashboard-list-header">
          <h2 class="dashboard-list-title">People Under Supervised Work</h2>
          <span class="dashboard-list-subtitle">Awaiting sign-off for independent operation</span>
        </div>
        <div class="dashboard-list-content">
          <div v-if="supervisedPeople.length === 0" class="dashboard-list-empty">
            No employees currently under supervised work
          </div>
          <div v-for="item in supervisedPeople" :key="item.id" class="dashboard-list-item">
            <div class="dashboard-list-item-main">
              <span class="dashboard-list-item-title">{{ item.name }}</span>
              <span class="dashboard-list-item-subtitle">{{ item.jobTitle }}</span>
            </div>
            <div class="dashboard-list-item-meta">
              <span class="badge badge-supervised">{{ item.supervisedCount }} supervised</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Procedure Changes Awaiting Acknowledgement -->
      <div class="dashboard-list">
        <div class="dashboard-list-header">
          <h2 class="dashboard-list-title">Procedure Changes Awaiting Acknowledgement</h2>
          <span class="dashboard-list-subtitle"
            >Active awareness topics with incomplete acknowledgement</span
          >
        </div>
        <div class="dashboard-list-content">
          <div v-if="pendingAwareness.length === 0" class="dashboard-list-empty">
            All procedure changes acknowledged
          </div>
          <div v-for="item in pendingAwareness" :key="item.id" class="dashboard-list-item">
            <div class="dashboard-list-item-main">
              <span class="dashboard-list-item-title">{{ item.title }}</span>
              <span class="dashboard-list-item-subtitle">{{ item.audience }}</span>
            </div>
            <div class="dashboard-list-item-meta">
              <span class="badge badge-warning">{{ item.completion }}% done</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Overdue Competence Reviews -->
      <div class="dashboard-list">
        <div class="dashboard-list-header">
          <h2 class="dashboard-list-title">Overdue Competence Reviews</h2>
          <span class="dashboard-list-subtitle">Training needs past their due date</span>
        </div>
        <div class="dashboard-list-content">
          <div v-if="overdueReviews.length === 0" class="dashboard-list-empty">
            No overdue competence reviews
          </div>
          <div v-for="item in overdueReviews" :key="item.id" class="dashboard-list-item">
            <div class="dashboard-list-item-main">
              <span class="dashboard-list-item-title">{{ item.employeeName }}</span>
              <span class="dashboard-list-item-subtitle">{{ item.source }}</span>
            </div>
            <div class="dashboard-list-item-meta">
              <span class="badge badge-critical">{{ item.daysOverdue }}d overdue</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Recent Activity ─────────────────────────────────────────────────────── -->
    <div class="dashboard-activity" style="margin-top: var(--space-xl)">
      <div class="dashboard-list-header">
        <h2 class="dashboard-list-title">Recent Activity</h2>
      </div>
      <div class="activity-feed">
        <div v-if="scopedRecentActivity.length === 0" class="dashboard-list-empty">
          No recent activity in the current scope
        </div>
        <div v-for="activity in scopedRecentActivity" :key="activity.id" class="activity-item">
          <FileText class="activity-icon" />
          <div class="activity-content">
            <span class="activity-message">{{ activity.message }}</span>
            <span class="activity-time">{{ activity.time }}</span>
          </div>
        </div>
      </div>
    </div> </template
  ><!-- end v-else management dashboard -->
</template>

<style scoped>
/* ── Filter bar ───────────────────────────────────────────────────────────── */
.filter-bar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-surface);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  flex-wrap: wrap;
}

.filter-bar-icon {
  width: 16px;
  height: 16px;
  color: var(--text-caption);
  flex-shrink: 0;
}

.filter-select {
  min-width: 160px;
  font-size: 0.875rem;
}

.filter-clear-btn {
  margin-left: auto;
  color: var(--text-caption);
  font-size: 0.8125rem;
}

/* ── KPI cards ────────────────────────────────────────────────────────────── */
.kpi-card-clickable {
  cursor: pointer;
  transition:
    box-shadow 0.15s,
    transform 0.1s;
}

.kpi-card-clickable:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  transform: translateY(-1px);
}

.kpi-card-clickable:active {
  transform: translateY(0);
}

.kpi-icon-danger {
  color: var(--brand-critical);
}

.kpi-icon-warning {
  color: var(--brand-warning);
}

/* ── Charts grid ──────────────────────────────────────────────────────────── */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

/* ── List sections ────────────────────────────────────────────────────────── */
.dashboard-lists {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

.dashboard-list {
  background: var(--bg-surface);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
}

.dashboard-list-header {
  padding: var(--space-md);
  border-bottom: var(--border-subtle);
}

.dashboard-list-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0 0 2px 0;
}

.dashboard-list-subtitle {
  font-size: 0.75rem;
  color: var(--text-caption);
  display: block;
}

.dashboard-list-content {
  padding: var(--space-sm);
}

.dashboard-list-empty {
  padding: var(--space-md);
  font-size: 0.875rem;
  color: var(--text-caption);
  text-align: center;
}

.dashboard-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
}

.dashboard-list-item:hover {
  background: var(--bg-hover);
}

.dashboard-list-item-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
  margin-right: var(--space-sm);
}

.dashboard-list-item-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-body);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dashboard-list-item-subtitle {
  font-size: 0.75rem;
  color: var(--text-caption);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dashboard-list-item-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.dashboard-list-item-date {
  font-size: 0.75rem;
  color: var(--text-caption);
  white-space: nowrap;
}

/* badge-supervised — warning variant */
.badge-supervised {
  background: oklch(from var(--brand-warning) l c h / 0.12);
  color: var(--brand-warning);
  border: 1px solid oklch(from var(--brand-warning) l c h / 0.3);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
}

/* ── Recent activity ──────────────────────────────────────────────────────── */
.dashboard-activity {
  background: var(--bg-surface);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
}

.activity-feed {
  padding: var(--space-md);
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
}

.activity-icon {
  width: 20px;
  height: 20px;
  color: var(--brand-primary);
  flex-shrink: 0;
}

.activity-content {
  display: flex;
  flex-direction: column;
}

.activity-message {
  font-size: 0.875rem;
  color: var(--text-body);
}

.activity-time {
  font-size: 0.75rem;
  color: var(--text-caption);
}

/* ── Employee CTA ─────────────────────────────────────────────────────────── */
.employee-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  padding: var(--space-lg) var(--space-xl);
  background: var(--bg-surface);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  flex-wrap: wrap;
}

.employee-cta-content {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.employee-cta-icon {
  width: 36px;
  height: 36px;
  color: var(--brand-primary);
  flex-shrink: 0;
}

.employee-cta-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0 0 2px 0;
}

.employee-cta-subtitle {
  font-size: 0.8125rem;
  color: var(--text-caption);
  margin: 0;
}

.employee-cta-btn {
  white-space: nowrap;
}

/* ── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .charts-grid,
  .dashboard-lists {
    grid-template-columns: 1fr;
  }
}
</style>
