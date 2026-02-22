import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Employee } from '@/api/client'
import competenciesData from '@/data/competencies.json'
import roleRequirementsData from '@/data/roleRequirements.json'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CompetencyCategory = 'Technical' | 'Quality' | 'Mandatory'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH_CRITICAL'
export type CompetenceStatus = 'VALID' | 'REQUIRED' | 'IN_PROGRESS' | 'N_A'
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

type RoleRequirementsJson = Record<string, {
  setId: string
  gatingCompetencyIds: string[]
  requirements: Array<{ competencyLibraryItemId: string; isGating: boolean }>
}>

const requirementsJson = roleRequirementsData as RoleRequirementsJson

// Map JSON competency items to the Competency interface used by the matrix
const COMPETENCIES: Competency[] = (competenciesData as Array<{
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
}>).map(c => ({
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
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/** Returns a stable 0.0–1.0 float for a given employee+competency pair */
function seededRand(employeeId: string, competencyId: string): number {
  return (hashString(employeeId + competencyId) % 10000) / 10000
}

// ─── Matrix row builder ────────────────────────────────────────────────────────

/** Find the gating competency IDs for a job title by name keyword match */
function getGatingIdsForJobTitle(jobTitleName: string): string[] {
  const key = Object.keys(requirementsJson).find(k =>
    jobTitleName.toLowerCase().includes(k.toLowerCase())
  )
  return key ? (requirementsJson[key]?.gatingCompetencyIds ?? []) : []
}

function buildMatrixRow(employee: Employee): EmployeeMatrixRow {
  const jobTitleName = employee.jobTitle?.name ?? ''
  const gatingForRole = getGatingIdsForJobTitle(jobTitleName)
  const today = new Date()

  const competenceItems = new Map<string, EmployeeCompetenceItem>()
  let validCount = 0
  let expiringCount = 0
  let expiredCount = 0
  let requiredCount = 0
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
    const isQhseRole = jobTitleName.toLowerCase().includes('qhse') ||
                       jobTitleName.toLowerCase().includes('hse') ||
                       jobTitleName.toLowerCase().includes('safety')

    if (isFirstAid && !isQhseRole) {
      status = 'N_A'
      derivedStatus = 'N_A'
    } else if (rand < 0.55) {
      // VALID
      status = 'VALID'
      lastCompletedAt = new Date(today.getTime() - hashString(employee.id + comp.id + 'lc') % (180 * 86400000)).toISOString().split('T')[0]
      evidenceRef = `EV-${employee.employeeNo}-${comp.code}`

      if (comp.requiresExpiry) {
        const validityDays = comp.defaultValidityDays ?? 365
        const remainingDays = hashString(employee.id + comp.id + 'rd') % validityDays
        expiryDate = new Date(today.getTime() + remainingDays * 86400000).toISOString().split('T')[0]

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
    } else if (rand < 0.70) {
      // EXPIRED (for expiry-required) or VALID (for non-expiry)
      status = 'VALID'
      lastCompletedAt = new Date(today.getTime() - hashString(employee.id + comp.id + 'lc') % (180 * 86400000)).toISOString().split('T')[0]
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
    } else if (rand < 0.85) {
      status = 'IN_PROGRESS'
      derivedStatus = 'IN_PROGRESS'
      requiredCount++
    } else {
      status = 'REQUIRED'
      derivedStatus = 'REQUIRED'
      requiredCount++
    }

    if (isGating && (derivedStatus === 'EXPIRED' || derivedStatus === 'REQUIRED' || derivedStatus === 'IN_PROGRESS')) {
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
    const expiredItem = Array.from(competenceItems.values()).find(item => item.derivedStatus === 'EXPIRED')
    if (expiredItem) {
      const comp = COMPETENCIES.find(c => c.id === expiredItem.competencyId)
      topAction = `Renew ${comp?.code ?? 'certification'}`
    }
  } else if (expiringCount > 0) {
    const expiringItem = Array.from(competenceItems.values()).find(item => item.derivedStatus === 'EXPIRING')
    if (expiringItem) {
      const comp = COMPETENCIES.find(c => c.id === expiringItem.competencyId)
      topAction = `Schedule ${comp?.code ?? 'renewal'}`
    }
  } else if (requiredCount > 0) {
    const requiredItem = Array.from(competenceItems.values()).find(item => item.status === 'REQUIRED')
    if (requiredItem) {
      const comp = COMPETENCIES.find(c => c.id === requiredItem.competencyId)
      topAction = `Complete ${comp?.code ?? 'training'}`
    }
  }

  const managerName = employee.manager
    ? (employee.manager.displayName ?? (`${employee.manager.firstName ?? ''} ${employee.manager.lastName ?? ''}`.trim() || undefined))
    : undefined

  return {
    employeeId: employee.id,
    employeeNo: employee.employeeNo,
    firstName: employee.firstName,
    lastName: employee.lastName,
    displayName: employee.displayName ?? `${employee.firstName} ${employee.lastName}`,
    jobTitle: jobTitleName,
    department: employee.department?.name ?? '',
    businessUnit: employee.businessUnit?.name ?? '',
    managerName,
    isAuthorised: gatingFailed.length === 0,
    requiredCount,
    expiringCount,
    expiredCount,
    validCount,
    gatingFailed,
    topAction,
    competenceItems,
  }
}

// ─── Column persistence ───────────────────────────────────────────────────────

function getStoredColumns(): string[] {
  if (typeof window === 'undefined') return COMPETENCIES.map(c => c.id)
  try {
    const stored = localStorage.getItem('skillsMatrix_visibleColumns')
    if (stored) return JSON.parse(stored)
  } catch {}
  return COMPETENCIES.map(c => c.id)
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
    jobTitle: '',
    department: '',
    businessUnit: '',
    search: '',
  })

  const viewMode = ref<'summary' | 'grid'>('grid')
  const expandedCategories = ref<CompetencyCategory[]>(['Technical', 'Quality', 'Mandatory'])
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
        e =>
          e.displayName.toLowerCase().includes(query) ||
          e.employeeNo.toLowerCase().includes(query) ||
          e.jobTitle.toLowerCase().includes(query) ||
          e.department.toLowerCase().includes(query)
      )
    }

    if (filters.value.jobTitle) {
      result = result.filter(e => e.jobTitle === filters.value.jobTitle)
    }

    if (filters.value.department) {
      result = result.filter(e => e.department === filters.value.department)
    }

    if (filters.value.businessUnit) {
      result = result.filter(e => e.businessUnit === filters.value.businessUnit)
    }

    if (filters.value.gatingOnly) {
      result = result.filter(e => e.gatingFailed.length > 0 || !e.isAuthorised)
    }

    if (filters.value.issuesOnly) {
      result = result.filter(e => e.expiredCount > 0 || e.expiringCount > 0 || e.requiredCount > 0)
    }

    if (filters.value.status) {
      result = result.filter(e => {
        for (const item of e.competenceItems.values()) {
          if (item.derivedStatus === filters.value.status) return true
        }
        return false
      })
    }

    if (filters.value.risk) {
      const compIds = COMPETENCIES.filter(c => c.riskLevel === filters.value.risk).map(c => c.id)
      result = result.filter(e => {
        for (const compId of compIds) {
          if (e.competenceItems.has(compId)) return true
        }
        return false
      })
    }

    if (filters.value.category) {
      const compIds = COMPETENCIES.filter(c => c.category === filters.value.category).map(c => c.id)
      result = result.filter(e => {
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
        case 'displayName': aVal = a.displayName; bVal = b.displayName; break
        case 'employeeNo': aVal = a.employeeNo; bVal = b.employeeNo; break
        case 'jobTitle': aVal = a.jobTitle; bVal = b.jobTitle; break
        case 'department': aVal = a.department; bVal = b.department; break
        case 'businessUnit': aVal = a.businessUnit; bVal = b.businessUnit; break
        case 'isAuthorised': aVal = a.isAuthorised; bVal = b.isAuthorised; break
        case 'expiredCount': aVal = a.expiredCount; bVal = b.expiredCount; break
        case 'expiringCount': aVal = a.expiringCount; bVal = b.expiringCount; break
        case 'requiredCount': aVal = a.requiredCount; bVal = b.requiredCount; break
        default: aVal = a.displayName; bVal = b.displayName
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sorting.value.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sorting.value.direction === 'asc' ? aVal - bVal : bVal - aVal
      }
      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        const aN = aVal ? 1 : 0; const bN = bVal ? 1 : 0
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
    const authorised = mockEmployeeRows.value.filter(e => e.isAuthorised).length
    const notAuthorised = total - authorised
    const withIssues = mockEmployeeRows.value.filter(
      e => e.expiredCount > 0 || e.expiringCount > 0 || e.requiredCount > 0
    ).length
    const totalExpired = mockEmployeeRows.value.reduce((sum, e) => sum + e.expiredCount, 0)
    const totalExpiring = mockEmployeeRows.value.reduce((sum, e) => sum + e.expiringCount, 0)
    const totalRequired = mockEmployeeRows.value.reduce((sum, e) => sum + e.requiredCount, 0)

    return {
      totalEmployees: total,
      authorised,
      notAuthorised,
      withIssues,
      totalExpired,
      totalExpiring,
      totalRequired,
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
    visibleColumns.value = COMPETENCIES.map(c => c.id)
    setStoredColumns(visibleColumns.value)
  }

  function getEmployeeById(id: string): EmployeeMatrixRow | undefined {
    return mockEmployeeRows.value.find(e => e.employeeId === id)
  }

  function getCompetencyById(id: string): Competency | undefined {
    return competencies.value.find(c => c.id === id)
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
  }
})
