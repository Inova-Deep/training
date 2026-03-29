import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import type { Employee } from '@/api/client'
import competenciesData from '@/data/competencies.json'
import roleRequirementsData from '@/data/roleRequirements.json'
import { getRequirementRoleKey, normalizeBusinessUnitName, normalizeRoleName } from '@/lib/demoDomain'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CompetencyCategory =
  | 'Technical'
  | 'Quality'
  | 'Mandatory'
  | 'HSE / Workshop Safety'
  | 'Equipment-Specific Qualification'
  | 'Quality & Compliance'
  | 'Welding & Fabrication'
  | 'Robotics & Automation'
  | 'Additive Manufacturing Operations'
  | 'Materials & Powder Handling'
  | 'Materials Testing & Inspection'
  | 'Health & Safety'
  | 'Regulatory Compliance'
  | 'Workshop'
  | 'Plant & Machinery'
  | 'Business / Systems'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH_CRITICAL'
export type CompetenceStatus =
  | 'VALID'
  | 'REQUIRED'
  | 'IN_PROGRESS'
  | 'N_A'
  | 'UNDER_SUPERVISION'
  | 'PARTIALLY_MET'
  | 'REASSESSMENT_DUE'
export type DerivedStatus = CompetenceStatus | 'EXPIRING' | 'EXPIRED'

export interface Competency {
  id: string
  code: string
  title: string
  category: CompetencyCategory
  riskLevel: RiskLevel
  criticalityDomain?: string
  trainingType: string
  assessmentMethod: string
  requiresExpiry: boolean
  defaultValidityDays?: number
  isGatingDefault: boolean
}

export interface EmployeeCompetenceItem {
  employeeId: string
  competencyId: string
  status: CompetenceStatus
  expiryDate?: string
  lastCompletedAt?: string
  evidenceRef?: string
  isGating: boolean
  derivedStatus: DerivedStatus
}

export type SupervisionStatus =
  | 'FIT_FOR_INDEPENDENT_WORK'
  | 'SUPERVISED_ONLY'
  | 'RESTRICTED_SCOPE'
  | 'REASSESSMENT_REQUIRED'
  | 'NON_COMPLIANT_MANDATORY'

export interface EmployeeMatrixRow {
  employeeId: string
  employeeNo: string
  firstName: string
  lastName: string
  displayName: string
  jobTitle: string
  department: string
  businessUnit: string
  managerName?: string
  isAuthorised: boolean
  requiredCount: number
  expiringCount: number
  expiredCount: number
  validCount: number
  supervisedCount: number
  supervisionStatus: SupervisionStatus
  gatingFailed: string[]
  topAction: string
  competenceItems: Map<string, EmployeeCompetenceItem>
}

export interface MatrixFilters {
  status: DerivedStatus | ''
  risk: RiskLevel | ''
  category: CompetencyCategory | ''
  gatingOnly: boolean
  issuesOnly: boolean
  supervisionOnly: boolean
  criticalOnly: boolean
  jobTitle: string
  department: string
  businessUnit: string
  search: string
}

export interface MatrixSorting {
  field: keyof EmployeeMatrixRow
  direction: 'asc' | 'desc'
}

// ─── Competency data from JSON ─────────────────────────────────────────────────

type RoleRequirementsJson = Record<
  string,
  {
    setId: string
    gatingCompetencyIds: string[]
    requirements: Array<{ competencyLibraryItemId: string; isGating: boolean; mandatory: boolean }>
  }
>

const requirementsJson = roleRequirementsData as RoleRequirementsJson

export { requirementsJson }

// Map JSON competency items to the Competency interface used by the matrix
const COMPETENCIES: Competency[] = (
  competenciesData as Array<{
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
  }>
).map((c) => ({
  id: c.id,
  code: c.code,
  title: c.title,
  category: c.category as CompetencyCategory,
  riskLevel: c.riskLevelCode as RiskLevel,
  criticalityDomain: c.criticalityDomain,
  trainingType: c.defaultTrainingTypeCode,
  assessmentMethod: c.defaultAssessmentMethodCode,
  requiresExpiry: c.defaultRequiresExpiry,
  defaultValidityDays: c.defaultValidityDays,
  isGatingDefault: c.riskLevelCode === 'HIGH_CRITICAL',
}))

// ─── Deterministic seed helpers ───────────────────────────────────────────────

function hashString(str: string): number {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return h2 >>> 0
}

function seededRand(employeeId: string, competencyId: string): number {
  return (hashString(employeeId + '|' + competencyId) % 10000) / 10000
}

// ─── Matrix row builder ────────────────────────────────────────────────────────

/** Find the gating competency IDs for a job title by name keyword match */
function getGatingIdsForJobTitle(jobTitleName: string): string[] {
  const key = getRequirementRoleKey(jobTitleName)
  return key ? (requirementsJson[key]?.gatingCompetencyIds ?? []) : []
}

/** Compute supervision status for a row (priority order per spec) */
function computeSupervisionStatus(
  competenceItems: Map<string, EmployeeCompetenceItem>,
  gatingIds: string[],
): SupervisionStatus {
  const items = Array.from(competenceItems.values())
  const gatingItems = items.filter((i) => gatingIds.includes(i.competencyId))
  const nonGatingItems = items.filter((i) => !gatingIds.includes(i.competencyId))

  // Find mandatory (HIGH_CRITICAL) gating items
  const mandatoryGatingIds = COMPETENCIES.filter(
    (c) => c.riskLevel === 'HIGH_CRITICAL' && gatingIds.includes(c.id),
  ).map((c) => c.id)
  const mandatoryGatingItems = items.filter((i) => mandatoryGatingIds.includes(i.competencyId))

  // 1. Any mandatory gating EXPIRED or REQUIRED → NON_COMPLIANT_MANDATORY
  if (
    mandatoryGatingItems.some(
      (i) => i.derivedStatus === 'EXPIRED' || i.derivedStatus === 'REQUIRED',
    )
  ) {
    return 'NON_COMPLIANT_MANDATORY'
  }
  // 2. Any (non-mandatory) gating EXPIRED or REQUIRED → REASSESSMENT_REQUIRED
  if (gatingItems.some((i) => i.derivedStatus === 'EXPIRED' || i.derivedStatus === 'REQUIRED')) {
    return 'REASSESSMENT_REQUIRED'
  }
  // 3. Any gating UNDER_SUPERVISION → SUPERVISED_ONLY
  if (gatingItems.some((i) => i.derivedStatus === 'UNDER_SUPERVISION')) {
    return 'SUPERVISED_ONLY'
  }
  // 4. Any non-gating UNDER_SUPERVISION → RESTRICTED_SCOPE
  if (nonGatingItems.some((i) => i.derivedStatus === 'UNDER_SUPERVISION')) {
    return 'RESTRICTED_SCOPE'
  }
  // 5. Otherwise → FIT_FOR_INDEPENDENT_WORK
  return 'FIT_FOR_INDEPENDENT_WORK'
}

function buildMatrixRow(employee: Employee): EmployeeMatrixRow {
  const jobTitleName = normalizeRoleName(employee.jobTitle?.name)
  const gatingForRole = getGatingIdsForJobTitle(jobTitleName)
  const today = new Date()

  const competenceItems = new Map<string, EmployeeCompetenceItem>()
  let validCount = 0
  let expiringCount = 0
  let expiredCount = 0
  let requiredCount = 0
  let supervisedCount = 0
  const gatingFailed: string[] = []

  COMPETENCIES.forEach((comp) => {
    const isGating = gatingForRole.includes(comp.id)
    const rand = seededRand(employee.id, comp.id)

    let status: CompetenceStatus
    let expiryDate: string | undefined
    let lastCompletedAt: string | undefined
    let evidenceRef: string | undefined
    let derivedStatus: DerivedStatus

    // First Aid (comp-015) only for QHSE/Safety roles
    const isFirstAid = comp.id === 'comp-015'
    const isQhseRole =
      jobTitleName.toLowerCase().includes('qhse') ||
      jobTitleName.toLowerCase().includes('hse') ||
      jobTitleName.toLowerCase().includes('safety')

    if (isFirstAid && !isQhseRole) {
      status = 'N_A'
      derivedStatus = 'N_A'
    } else if (rand < 0.45) {
      // VALID (45%)
      status = 'VALID'
      lastCompletedAt = new Date(
        today.getTime() - (hashString(employee.id + comp.id + 'lc') % (180 * 86400000)),
      )
        .toISOString()
        .split('T')[0]
      evidenceRef = `EV-${employee.employeeNo}-${comp.code}`

      if (comp.requiresExpiry) {
        const validityDays = comp.defaultValidityDays ?? 365
        const remainingDays = hashString(employee.id + comp.id + 'rd') % validityDays
        expiryDate = new Date(today.getTime() + remainingDays * 86400000)
          .toISOString()
          .split('T')[0]

        if (remainingDays <= 30) {
          derivedStatus = 'EXPIRING'
          expiringCount++
        } else {
          derivedStatus = 'VALID'
          validCount++
        }
      } else {
        derivedStatus = 'VALID'
        validCount++
      }
    } else if (rand < 0.55) {
      // UNDER_SUPERVISION (10%)
      status = 'UNDER_SUPERVISION'
      derivedStatus = 'UNDER_SUPERVISION'
      lastCompletedAt = new Date(
        today.getTime() - (hashString(employee.id + comp.id + 'lc') % (60 * 86400000)),
      )
        .toISOString()
        .split('T')[0]
      supervisedCount++
    } else if (rand < 0.67) {
      // EXPIRED (for expiry-required) or VALID (for non-expiry) (12%)
      status = 'VALID'
      lastCompletedAt = new Date(
        today.getTime() - (hashString(employee.id + comp.id + 'lc') % (180 * 86400000)),
      )
        .toISOString()
        .split('T')[0]
      evidenceRef = `EV-${employee.employeeNo}-${comp.code}`

      if (comp.requiresExpiry) {
        const daysOverdue = (hashString(employee.id + comp.id + 'od') % 90) + 1
        expiryDate = new Date(today.getTime() - daysOverdue * 86400000).toISOString().split('T')[0]
        derivedStatus = 'EXPIRED'
        expiredCount++
      } else {
        derivedStatus = 'VALID'
        validCount++
      }
    } else if (rand < 0.8) {
      // IN_PROGRESS (13%)
      status = 'IN_PROGRESS'
      derivedStatus = 'IN_PROGRESS'
      requiredCount++
    } else {
      // REQUIRED (12%)
      status = 'REQUIRED'
      derivedStatus = 'REQUIRED'
      requiredCount++
    }

    if (
      isGating &&
      (derivedStatus === 'EXPIRED' ||
        derivedStatus === 'REQUIRED' ||
        derivedStatus === 'IN_PROGRESS' ||
        derivedStatus === 'UNDER_SUPERVISION')
    ) {
      gatingFailed.push(comp.code)
    }

    competenceItems.set(comp.id, {
      employeeId: employee.id,
      competencyId: comp.id,
      status,
      expiryDate,
      lastCompletedAt,
      evidenceRef,
      isGating,
      derivedStatus,
    })
  })

  // Determine top action
  let topAction = 'All requirements met'
  if (gatingFailed.length > 0) {
    topAction = `Renew ${gatingFailed[0]}`
  } else if (expiredCount > 0) {
    const expiredItem = Array.from(competenceItems.values()).find(
      (item) => item.derivedStatus === 'EXPIRED',
    )
    if (expiredItem) {
      const comp = COMPETENCIES.find((c) => c.id === expiredItem.competencyId)
      topAction = `Renew ${comp?.code ?? 'certification'}`
    }
  } else if (expiringCount > 0) {
    const expiringItem = Array.from(competenceItems.values()).find(
      (item) => item.derivedStatus === 'EXPIRING',
    )
    if (expiringItem) {
      const comp = COMPETENCIES.find((c) => c.id === expiringItem.competencyId)
      topAction = `Schedule ${comp?.code ?? 'renewal'}`
    }
  } else if (requiredCount > 0) {
    const requiredItem = Array.from(competenceItems.values()).find(
      (item) => item.status === 'REQUIRED',
    )
    if (requiredItem) {
      const comp = COMPETENCIES.find((c) => c.id === requiredItem.competencyId)
      topAction = `Complete ${comp?.code ?? 'training'}`
    }
  }

  const managerName = employee.manager
    ? (employee.manager.displayName ??
      (`${employee.manager.firstName ?? ''} ${employee.manager.lastName ?? ''}`.trim() ||
        undefined))
    : undefined

  // Determine supervision status (priority order)
  const supervisionStatus = computeSupervisionStatus(competenceItems, gatingForRole)

  return {
    employeeId: employee.id,
    employeeNo: employee.employeeNo,
    firstName: employee.firstName,
    lastName: employee.lastName,
    displayName: employee.displayName ?? `${employee.firstName} ${employee.lastName}`,
    jobTitle: jobTitleName,
    department: employee.department?.name ?? '',
    businessUnit: normalizeBusinessUnitName(employee.businessUnit?.name),
    managerName,
    isAuthorised: gatingFailed.length === 0,
    requiredCount,
    expiringCount,
    expiredCount,
    validCount,
    supervisedCount,
    supervisionStatus,
    gatingFailed,
    topAction,
    competenceItems,
  }
}

// ─── Row stats recompute (after in-place mutations) ──────────────────────────

function recomputeRowStats(row: EmployeeMatrixRow) {
  let validCount = 0
  let expiringCount = 0
  let expiredCount = 0
  let requiredCount = 0
  let supervisedCount = 0
  const gatingFailed: string[] = []
  const gatingIds = Array.from(row.competenceItems.values())
    .filter((i) => i.isGating)
    .map((i) => i.competencyId)

  for (const item of row.competenceItems.values()) {
    switch (item.derivedStatus) {
      case 'VALID':
        validCount++
        break
      case 'EXPIRING':
        expiringCount++
        break
      case 'EXPIRED':
        expiredCount++
        break
      case 'REQUIRED':
      case 'IN_PROGRESS':
        requiredCount++
        break
      case 'UNDER_SUPERVISION':
        supervisedCount++
        break
    }
    if (
      item.isGating &&
      (item.derivedStatus === 'EXPIRED' ||
        item.derivedStatus === 'REQUIRED' ||
        item.derivedStatus === 'IN_PROGRESS' ||
        item.derivedStatus === 'UNDER_SUPERVISION')
    ) {
      const comp = COMPETENCIES.find((c) => c.id === item.competencyId)
      if (comp) gatingFailed.push(comp.code)
    }
  }

  row.validCount = validCount
  row.expiringCount = expiringCount
  row.expiredCount = expiredCount
  row.requiredCount = requiredCount
  row.supervisedCount = supervisedCount
  row.gatingFailed.splice(0, row.gatingFailed.length, ...gatingFailed)
  row.isAuthorised = gatingFailed.length === 0
  row.supervisionStatus = computeSupervisionStatus(row.competenceItems, gatingIds)

  // Recompute topAction
  if (gatingFailed.length > 0) {
    row.topAction = `Renew ${gatingFailed[0]}`
  } else if (expiredCount > 0) {
    const item = [...row.competenceItems.values()].find((i) => i.derivedStatus === 'EXPIRED')
    const comp = item ? COMPETENCIES.find((c) => c.id === item.competencyId) : null
    row.topAction = comp ? `Renew ${comp.code}` : 'Renew certification'
  } else if (expiringCount > 0) {
    const item = [...row.competenceItems.values()].find((i) => i.derivedStatus === 'EXPIRING')
    const comp = item ? COMPETENCIES.find((c) => c.id === item.competencyId) : null
    row.topAction = comp ? `Schedule ${comp.code}` : 'Schedule renewal'
  } else if (requiredCount > 0) {
    const item = [...row.competenceItems.values()].find((i) => i.status === 'REQUIRED')
    const comp = item ? COMPETENCIES.find((c) => c.id === item.competencyId) : null
    row.topAction = comp ? `Complete ${comp.code}` : 'Complete training'
  } else {
    row.topAction = 'All requirements met'
  }
}

// ─── Responsible party helper ─────────────────────────────────────────────────

export function getResponsibleParty(item: EmployeeCompetenceItem): string {
  switch (item.derivedStatus) {
    case 'REQUIRED':
      return 'Employee'
    case 'IN_PROGRESS':
      return 'Manager'
    case 'EXPIRED':
      return item.isGating ? 'Manager' : 'Employee'
    case 'EXPIRING':
      return 'Employee'
    case 'UNDER_SUPERVISION':
      return 'Line Manager'
    default:
      return '—'
  }
}

// ─── Column persistence ───────────────────────────────────────────────────────

function getStoredColumns(): string[] {
  if (typeof window === 'undefined') return COMPETENCIES.map((c) => c.id)
  try {
    const stored = localStorage.getItem('skillsMatrix_visibleColumns')
    if (stored) return JSON.parse(stored)
  } catch {}
  return COMPETENCIES.map((c) => c.id)
}

function setStoredColumns(columns: string[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('skillsMatrix_visibleColumns', JSON.stringify(columns))
  } catch {}
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSkillsMatrixStore = defineStore('skillsMatrix', () => {
  const competencies = ref<Competency[]>(COMPETENCIES)
  const mockEmployeeRows = ref<EmployeeMatrixRow[]>([])
  const isLoading = ref(false)

  const filters = ref<MatrixFilters>({
    status: '',
    risk: '',
    category: '',
    gatingOnly: false,
    issuesOnly: false,
    supervisionOnly: false,
    criticalOnly: false,
    jobTitle: '',
    department: '',
    businessUnit: '',
    search: '',
  })

  const viewMode = ref<'summary' | 'grid'>('grid')
  const expandedCategories = ref<CompetencyCategory[]>([
    'Mandatory',
    'Additive Manufacturing Operations',
    'Welding & Fabrication',
    'Robotics & Automation',
    'Materials & Powder Handling',
    'Materials Testing & Inspection',
    'Quality',
    'Health & Safety',
    'Regulatory Compliance',
    'Workshop',
    'Plant & Machinery',
    'Business / Systems',
    // legacy / alternate category names kept for data compatibility
    'Technical',
    'HSE / Workshop Safety',
    'Equipment-Specific Qualification',
    'Quality & Compliance',
  ])
  const visibleColumns = ref<string[]>(getStoredColumns())
  const sorting = ref<MatrixSorting>({
    field: 'displayName',
    direction: 'asc',
  })

  /** Build the matrix from a list of real API employees */
  async function fetchAndBuildMatrix(employees: Employee[]) {
    isLoading.value = true
    try {
      mockEmployeeRows.value = employees.map(buildMatrixRow)
    } finally {
      isLoading.value = false
    }
  }

  const filteredEmployees = computed(() => {
    let result = [...mockEmployeeRows.value]

    if (filters.value.search) {
      const query = filters.value.search.toLowerCase()
      result = result.filter(
        (e) =>
          e.displayName.toLowerCase().includes(query) ||
          e.employeeNo.toLowerCase().includes(query) ||
          e.jobTitle.toLowerCase().includes(query) ||
          e.department.toLowerCase().includes(query),
      )
    }

    if (filters.value.jobTitle) {
      result = result.filter((e) => e.jobTitle === filters.value.jobTitle)
    }

    if (filters.value.department) {
      result = result.filter((e) => e.department === filters.value.department)
    }

    if (filters.value.businessUnit) {
      result = result.filter((e) => e.businessUnit === filters.value.businessUnit)
    }

    if (filters.value.gatingOnly) {
      result = result.filter((e) => e.gatingFailed.length > 0 || !e.isAuthorised)
    }

    if (filters.value.issuesOnly) {
      result = result.filter(
        (e) => e.expiredCount > 0 || e.expiringCount > 0 || e.requiredCount > 0,
      )
    }

    if (filters.value.supervisionOnly) {
      result = result.filter((e) => e.supervisionStatus === 'SUPERVISED_ONLY')
    }

    if (filters.value.status) {
      result = result.filter((e) => {
        for (const item of e.competenceItems.values()) {
          if (item.derivedStatus === filters.value.status) return true
        }
        return false
      })
    }

    if (filters.value.risk) {
      const compIds = COMPETENCIES.filter((c) => c.riskLevel === filters.value.risk).map(
        (c) => c.id,
      )
      result = result.filter((e) => {
        for (const compId of compIds) {
          if (e.competenceItems.has(compId)) return true
        }
        return false
      })
    }

    if (filters.value.category) {
      const compIds = COMPETENCIES.filter((c) => c.category === filters.value.category).map(
        (c) => c.id,
      )
      result = result.filter((e) => {
        for (const compId of compIds) {
          if (e.competenceItems.has(compId)) return true
        }
        return false
      })
    }

    result.sort((a, b) => {
      let aVal: string | number | boolean = ''
      let bVal: string | number | boolean = ''

      switch (sorting.value.field) {
        case 'displayName':
          aVal = a.displayName
          bVal = b.displayName
          break
        case 'employeeNo':
          aVal = a.employeeNo
          bVal = b.employeeNo
          break
        case 'jobTitle':
          aVal = a.jobTitle
          bVal = b.jobTitle
          break
        case 'department':
          aVal = a.department
          bVal = b.department
          break
        case 'businessUnit':
          aVal = a.businessUnit
          bVal = b.businessUnit
          break
        case 'isAuthorised':
          aVal = a.isAuthorised
          bVal = b.isAuthorised
          break
        case 'expiredCount':
          aVal = a.expiredCount
          bVal = b.expiredCount
          break
        case 'expiringCount':
          aVal = a.expiringCount
          bVal = b.expiringCount
          break
        case 'requiredCount':
          aVal = a.requiredCount
          bVal = b.requiredCount
          break
        default:
          aVal = a.displayName
          bVal = b.displayName
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sorting.value.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sorting.value.direction === 'asc' ? aVal - bVal : bVal - aVal
      }
      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        const aN = aVal ? 1 : 0
        const bN = bVal ? 1 : 0
        return sorting.value.direction === 'asc' ? aN - bN : bN - aN
      }
      return 0
    })

    return result
  })

  const groupedByJobTitle = computed(() => {
    const groups = new Map<string, EmployeeMatrixRow[]>()
    for (const emp of filteredEmployees.value) {
      const existing = groups.get(emp.jobTitle) || []
      existing.push(emp)
      groups.set(emp.jobTitle, existing)
    }
    return groups
  })

  const summaryStats = computed(() => {
    const total = mockEmployeeRows.value.length
    const authorised = mockEmployeeRows.value.filter((e) => e.isAuthorised).length
    const notAuthorised = total - authorised
    const withIssues = mockEmployeeRows.value.filter(
      (e) => e.expiredCount > 0 || e.expiringCount > 0 || e.requiredCount > 0,
    ).length
    const totalExpired = mockEmployeeRows.value.reduce((sum, e) => sum + e.expiredCount, 0)
    const totalExpiring = mockEmployeeRows.value.reduce((sum, e) => sum + e.expiringCount, 0)
    const totalRequired = mockEmployeeRows.value.reduce((sum, e) => sum + e.requiredCount, 0)
    const totalSupervised = mockEmployeeRows.value.filter(
      (e) => e.supervisionStatus === 'SUPERVISED_ONLY',
    ).length
    const totalRestricted = mockEmployeeRows.value.filter(
      (e) => e.supervisionStatus === 'RESTRICTED_SCOPE',
    ).length
    const totalReassessmentRequired = mockEmployeeRows.value.filter(
      (e) => e.supervisionStatus === 'REASSESSMENT_REQUIRED',
    ).length
    const totalNonCompliant = mockEmployeeRows.value.filter(
      (e) => e.supervisionStatus === 'NON_COMPLIANT_MANDATORY',
    ).length

    return {
      totalEmployees: total,
      authorised,
      notAuthorised,
      withIssues,
      totalExpired,
      totalExpiring,
      totalRequired,
      totalSupervised,
      totalRestricted,
      totalReassessmentRequired,
      totalNonCompliant,
      complianceRate: total > 0 ? Math.round((authorised / total) * 100) : 0,
    }
  })

  const competenciesByCategory = computed(() => {
    const groups = new Map<CompetencyCategory, Competency[]>()
    for (const comp of competencies.value) {
      const existing = groups.get(comp.category) || []
      existing.push(comp)
      groups.set(comp.category, existing)
    }
    return groups
  })

  /** IDs of competencies considered safety-critical or HIGH_CRITICAL risk */
  const criticalActivityIds = computed(() =>
    COMPETENCIES.filter((c) => c.riskLevel === 'HIGH_CRITICAL' || c.isGatingDefault).map(
      (c) => c.id,
    ),
  )

  /**
   * Vacancy rows — one per role requirement set that has NO employees assigned.
   * The row shape is a minimal EmployeeMatrixRow-like object with isVacancy marker.
   */
  const vacancyRows = computed(
    (): (EmployeeMatrixRow & { isVacancy: true; estStart?: string })[] => {
      const assignedTitles = new Set(mockEmployeeRows.value.map((r) => r.jobTitle))

      return Object.entries(requirementsJson)
        .filter(([title, reqSet]) => !assignedTitles.has(title) && reqSet != null)
        .map(([title, reqSet]) => {
          const rs = reqSet!
          const competenceItems = new Map<string, EmployeeCompetenceItem>()
          const reqCompIds = new Set(rs.requirements.map((r) => r.competencyLibraryItemId))
          const gatingIds = new Set(rs.gatingCompetencyIds)

          COMPETENCIES.forEach((comp) => {
            const isRequired = reqCompIds.has(comp.id)
            competenceItems.set(comp.id, {
              employeeId: `vacancy-${title}`,
              competencyId: comp.id,
              status: isRequired ? 'REQUIRED' : 'N_A',
              derivedStatus: isRequired ? 'REQUIRED' : 'N_A',
              isGating: gatingIds.has(comp.id),
            })
          })

          return {
            isVacancy: true as const,
            employeeId: `vacancy-${title}`,
            employeeNo: '—',
            firstName: 'Vacancy',
            lastName: `— ${title}`,
            displayName: `Vacancy — ${title}`,
            jobTitle: title,
            department: '—',
            businessUnit: '—',
            managerName: undefined,
            isAuthorised: false,
            requiredCount: rs.requirements.length,
            expiringCount: 0,
            expiredCount: 0,
            validCount: 0,
            supervisedCount: 0,
            supervisionStatus: 'NON_COMPLIANT_MANDATORY' as const,
            gatingFailed: rs.gatingCompetencyIds,
            topAction: 'Unfilled',
            competenceItems,
          }
        })
    },
  )

  function toggleCategory(category: CompetencyCategory) {
    const index = expandedCategories.value.indexOf(category)
    if (index === -1) {
      expandedCategories.value.push(category)
    } else {
      expandedCategories.value.splice(index, 1)
    }
  }

  function setFilter<K extends keyof MatrixFilters>(key: K, value: MatrixFilters[K]) {
    filters.value[key] = value
  }

  function clearFilters() {
    filters.value = {
      status: '',
      risk: '',
      category: '',
      gatingOnly: false,
      issuesOnly: false,
      supervisionOnly: false,
      criticalOnly: false,
      jobTitle: '',
      department: '',
      businessUnit: '',
      search: '',
    }
  }

  function setViewMode(mode: 'summary' | 'grid') {
    viewMode.value = mode
  }

  function toggleColumn(columnId: string) {
    const index = visibleColumns.value.indexOf(columnId)
    if (index === -1) {
      visibleColumns.value.push(columnId)
    } else if (visibleColumns.value.length > 1) {
      visibleColumns.value.splice(index, 1)
    }
    setStoredColumns(visibleColumns.value)
  }

  function setSorting(field: keyof EmployeeMatrixRow) {
    if (sorting.value.field === field) {
      sorting.value.direction = sorting.value.direction === 'asc' ? 'desc' : 'asc'
    } else {
      sorting.value.field = field
      sorting.value.direction = 'asc'
    }
  }

  function resetColumns() {
    visibleColumns.value = COMPETENCIES.map((c) => c.id)
    setStoredColumns(visibleColumns.value)
  }

  function getEmployeeById(id: string): EmployeeMatrixRow | undefined {
    return mockEmployeeRows.value.find((e) => e.employeeId === id)
  }

  function getCompetencyById(id: string): Competency | undefined {
    return competencies.value.find((c) => c.id === id)
  }

  function reviewEvidence(
    employeeId: string,
    competencyId: string,
    outcome: 'ACCEPT' | 'REJECT',
    reason?: string,
  ) {
    const row = mockEmployeeRows.value.find((r) => r.employeeId === employeeId)
    if (!row) return
    const item = row.competenceItems.get(competencyId)
    if (!item) return

    if (outcome === 'ACCEPT') {
      item.status = 'VALID'
      item.derivedStatus = 'VALID'
      toast.success('Evidence accepted — competence marked Valid')
    } else {
      item.status = 'REQUIRED'
      item.derivedStatus = 'REQUIRED'
      toast.info(reason ? `Evidence rejected: ${reason}` : 'Evidence rejected')
    }
    recomputeRowStats(row)
  }

  function markNotApplicable(employeeId: string, competencyId: string, justification: string) {
    const row = mockEmployeeRows.value.find((r) => r.employeeId === employeeId)
    if (!row) return
    const item = row.competenceItems.get(competencyId)
    if (!item) return

    item.status = 'N_A'
    item.derivedStatus = 'N_A'
    recomputeRowStats(row)
    toast.success(`Marked N/A — ${justification}`)
  }

  return {
    competencies,
    mockEmployeeRows,
    isLoading,
    filters,
    viewMode,
    expandedCategories,
    visibleColumns,
    sorting,
    filteredEmployees,
    groupedByJobTitle,
    summaryStats,
    competenciesByCategory,
    criticalActivityIds,
    vacancyRows,
    fetchAndBuildMatrix,
    toggleCategory,
    setFilter,
    clearFilters,
    setViewMode,
    toggleColumn,
    setSorting,
    resetColumns,
    getEmployeeById,
    getCompetencyById,
    reviewEvidence,
    markNotApplicable,
  }
})
