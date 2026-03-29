import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import type { BusinessUnit, Department, Employee, JobTitle } from '@/api/client'
import type { UserRole } from '@/types'
import { cloneDemoEmployees, getDemoEmployeeById } from '@/lib/demoEmployees'

const PAGE_SIZE = 20
const REFERENCE_TIMESTAMP = '2026-03-01T00:00:00Z'

function toBusinessUnit(reference: Employee['businessUnit']): BusinessUnit | null {
  if (!reference) return null
  return {
    ...reference,
    name: reference.name ?? '',
    isActive: true,
    createdAt: REFERENCE_TIMESTAMP,
    updatedAt: REFERENCE_TIMESTAMP,
  }
}

function toDepartment(reference: Employee['department']): Department | null {
  if (!reference) return null
  return {
    ...reference,
    name: reference.name ?? '',
    parentDepartmentId: null,
    isActive: true,
    createdAt: REFERENCE_TIMESTAMP,
    updatedAt: REFERENCE_TIMESTAMP,
  }
}

function toJobTitle(reference: Employee['jobTitle']): JobTitle | null {
  if (!reference) return null
  return {
    ...reference,
    name: reference.name ?? '',
    isActive: true,
    createdAt: REFERENCE_TIMESTAMP,
    updatedAt: REFERENCE_TIMESTAMP,
  }
}

function sortByName<T extends { name: string | null }>(items: T[]): T[] {
  return [...items].sort((left, right) => (left.name ?? '').localeCompare(right.name ?? ''))
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Map<string, T>()
  items.forEach((item) => {
    if (!seen.has(item.id)) {
      seen.set(item.id, item)
    }
  })
  return [...seen.values()]
}

export const useEmployeesStore = defineStore('employees', () => {
  const allEmployees = ref<Employee[]>(cloneDemoEmployees())
  const currentEmployee = ref<Employee | null>(null)
  const jobTitles = ref<JobTitle[]>([])
  const departments = ref<Department[]>([])
  const businessUnits = ref<BusinessUnit[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)

  const filters = ref({
    search: '',
    departmentId: '',
    businessUnitId: '',
    jobTitleId: '',
  })

  function rebuildReferenceData() {
    const derivedJobTitles = uniqueById(
      allEmployees.value
        .map((employee) => toJobTitle(employee.jobTitle))
        .filter((jobTitle): jobTitle is JobTitle => jobTitle !== null),
    )
    const derivedDepartments = uniqueById(
      allEmployees.value
        .map((employee) => toDepartment(employee.department))
        .filter((department): department is Department => department !== null),
    )
    const derivedBusinessUnits = uniqueById(
      allEmployees.value
        .map((employee) => toBusinessUnit(employee.businessUnit))
        .filter((businessUnit): businessUnit is BusinessUnit => businessUnit !== null),
    )

    jobTitles.value = sortByName(derivedJobTitles)
    departments.value = sortByName(derivedDepartments)
    businessUnits.value = sortByName(derivedBusinessUnits)
  }

  rebuildReferenceData()

  const employeeById = computed(() => {
    return (id: string) => allEmployees.value.find((employee) => employee.id === id)
  })

  const filteredEmployees = computed(() => {
    let result = allEmployees.value

    if (filters.value.search) {
      const query = filters.value.search.toLowerCase()
      result = result.filter((employee) => {
        const managerName =
          employee.manager?.displayName ??
          `${employee.manager?.firstName ?? ''} ${employee.manager?.lastName ?? ''}`.trim()
        return (
          employee.firstName.toLowerCase().includes(query) ||
          employee.lastName.toLowerCase().includes(query) ||
          employee.displayName?.toLowerCase().includes(query) ||
          employee.employeeNo.toLowerCase().includes(query) ||
          employee.department?.name?.toLowerCase().includes(query) ||
          employee.businessUnit?.name?.toLowerCase().includes(query) ||
          employee.jobTitle?.name?.toLowerCase().includes(query) ||
          managerName.toLowerCase().includes(query)
        )
      })
    }

    if (filters.value.departmentId) {
      result = result.filter((employee) => employee.department?.id === filters.value.departmentId)
    }

    if (filters.value.businessUnitId) {
      result = result.filter((employee) => employee.businessUnit?.id === filters.value.businessUnitId)
    }

    if (filters.value.jobTitleId) {
      result = result.filter((employee) => employee.jobTitle?.id === filters.value.jobTitleId)
    }

    return result
  })

  const employees = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE
    return filteredEmployees.value.slice(start, end)
  })

  const pagination = computed(() => ({
    currentPage: currentPage.value,
    pageSize: PAGE_SIZE,
    totalCount: filteredEmployees.value.length,
    totalPages: Math.ceil(filteredEmployees.value.length / PAGE_SIZE) || 1,
  }))

  async function fetchEmployees() {
    isLoading.value = true
    error.value = null
    try {
      allEmployees.value = cloneDemoEmployees()
      rebuildReferenceData()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to load employees'
      toast.error(error.value)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchEmployeeById(id: string) {
    isLoading.value = true
    error.value = null
    try {
      currentEmployee.value = getDemoEmployeeById(id)
      if (!currentEmployee.value) {
        throw new Error('Employee not found')
      }
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to load employee'
      toast.error(error.value)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchJobTitles() {
    rebuildReferenceData()
  }

  async function fetchDepartments() {
    rebuildReferenceData()
  }

  async function fetchBusinessUnits() {
    rebuildReferenceData()
  }

  async function fetchAllReferenceData() {
    rebuildReferenceData()
  }

  function getEmployeeById(id: string | null | undefined): Employee | null {
    if (!id) return null
    return allEmployees.value.find((employee) => employee.id === id) ?? null
  }

  function getEmployeeByDisplayName(displayName: string | null | undefined): Employee | null {
    if (!displayName) return null
    return allEmployees.value.find((employee) => employee.displayName === displayName) ?? null
  }

  function getDirectReports(managerId: string | null | undefined): Employee[] {
    if (!managerId) return []
    return allEmployees.value.filter((employee) => employee.manager?.id === managerId)
  }

  function getAllReportIds(managerId: string | null | undefined): string[] {
    if (!managerId) return []
    const discoveredIds = new Set<string>()
    const queue = getDirectReports(managerId).map((employee) => employee.id)

    while (queue.length > 0) {
      const nextId = queue.shift()
      if (!nextId || discoveredIds.has(nextId)) continue
      discoveredIds.add(nextId)
      getDirectReports(nextId).forEach((employee) => {
        if (!discoveredIds.has(employee.id)) {
          queue.push(employee.id)
        }
      })
    }

    return [...discoveredIds]
  }

  function getScopedEmployeesForRole(role: UserRole, employeeId?: string | null): Employee[] {
    switch (role) {
      case 'EMPLOYEE': {
        const employee = getEmployeeById(employeeId)
        return employee ? [employee] : []
      }
      case 'SUPERVISOR':
        return getDirectReports(employeeId)
      case 'MANAGER':
        return getAllReportIds(employeeId)
          .map((id) => getEmployeeById(id))
          .filter((employee): employee is Employee => employee !== null)
      case 'QHSE':
      case 'HR_ADMIN':
      case 'ADMIN':
      case 'LEADERSHIP_VIEWER':
      default:
        return allEmployees.value
    }
  }

  function setFilter(key: keyof typeof filters.value, value: string) {
    filters.value[key] = value
    currentPage.value = 1
  }

  function setPage(page: number) {
    currentPage.value = page
  }

  function clearFilters() {
    filters.value = {
      search: '',
      departmentId: '',
      businessUnitId: '',
      jobTitleId: '',
    }
    currentPage.value = 1
  }

  return {
    employees,
    allEmployees,
    currentEmployee,
    jobTitles,
    departments,
    businessUnits,
    isLoading,
    error,
    pagination,
    filters,
    employeeById,
    filteredEmployees,
    fetchEmployees,
    fetchEmployeeById,
    fetchJobTitles,
    fetchDepartments,
    fetchBusinessUnits,
    fetchAllReferenceData,
    getEmployeeById,
    getEmployeeByDisplayName,
    getDirectReports,
    getAllReportIds,
    getScopedEmployeesForRole,
    setFilter,
    setPage,
    clearFilters,
  }
})
