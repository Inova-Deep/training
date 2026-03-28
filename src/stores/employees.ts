import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import { employeesApi, organizationApi, type Employee, type JobTitle, type Department, type BusinessUnit } from '@/api/client'

// Keywords to match against real API job title names (case-insensitive substring match)
const TARGET_KEYWORDS = [
  'maintenance',
  'technician',
  'operator',
  'supervisor',
  'qhse',
  'hse',
  'shift lead',
  'electrical',
  'instrumentation',
]

// ─── Demo profiles injected for storytelling ──────────────────────────────────
// These are not fetched from the API — they are synthetic rows for demo purposes.

const DEMO_PROFILES: Employee[] = [
  {
    id: 'demo-emp-dk',
    tenantId: 'demo',
    employeeNo: 'DK-001',
    firstName: 'Dan',
    lastName: 'Kerrigan',
    displayName: 'Dan Kerrigan',
    workEmail: 'dan.kerrigan@demo.com',
    status: 'active',
    isActive: true,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    businessUnit: { id: 'bu-am', code: 'AM', name: 'Additive Manufacturing' },
    department: { id: 'dept-am', code: 'AM', name: 'Additive Manufacturing' },
    jobTitle: { id: 'jt-am-tech', code: 'AM-TECH', name: 'Additive Manufacturing Technician', grade: null },
    manager: { id: 'mgr-1', employeeNo: 'MGR-001', firstName: 'David', lastName: 'Clarke', displayName: 'David Clarke' },
  },
  {
    id: 'demo-emp-sn',
    tenantId: 'demo',
    employeeNo: 'SN-001',
    firstName: 'Sarah',
    lastName: 'Norris',
    displayName: 'Sarah Norris',
    workEmail: 'sarah.norris@demo.com',
    status: 'active',
    isActive: true,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    businessUnit: { id: 'bu-qa', code: 'QA', name: 'Quality Assurance' },
    department: { id: 'dept-qa', code: 'QA', name: 'Quality Assurance' },
    jobTitle: { id: 'jt-mat-test', code: 'MAT-TEST', name: 'Materials Testing Technician', grade: null },
    manager: { id: 'mgr-2', employeeNo: 'MGR-002', firstName: 'Sarah', lastName: 'Bennett', displayName: 'Sarah Bennett' },
  },
]

const EMPLOYEE_CAP = 50
const PAGE_SIZE = 20

export const useEmployeesStore = defineStore('employees', () => {
  const allEmployees = ref<Employee[]>([])  // All employees from API
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

  const employeeById = computed(() => {
    return (id: string) => allEmployees.value.find(e => e.id === id)
  })

  // Filter by keyword match against real API job title names, capped at EMPLOYEE_CAP
  const targetJobTitleEmployees = computed(() => {
    const filtered = allEmployees.value.filter(emp => {
      const jobTitleName = emp.jobTitle?.name?.toLowerCase()
      if (!jobTitleName) return false
      return TARGET_KEYWORDS.some(keyword => jobTitleName.includes(keyword))
    })
    return filtered.slice(0, EMPLOYEE_CAP)
  })

  // Then apply user filters (search, department, etc.)
  const filteredEmployees = computed(() => {
    let result = targetJobTitleEmployees.value

    if (filters.value.search) {
      const query = filters.value.search.toLowerCase()
      result = result.filter(emp =>
        emp.firstName.toLowerCase().includes(query) ||
        emp.lastName.toLowerCase().includes(query) ||
        emp.displayName?.toLowerCase().includes(query) ||
        emp.employeeNo.toLowerCase().includes(query)
      )
    }

    if (filters.value.departmentId) {
      result = result.filter(emp => emp.department?.id === filters.value.departmentId)
    }

    if (filters.value.businessUnitId) {
      result = result.filter(emp => emp.businessUnit?.id === filters.value.businessUnitId)
    }

    if (filters.value.jobTitleId) {
      result = result.filter(emp => emp.jobTitle?.id === filters.value.jobTitleId)
    }

    return result
  })

  // Paginated results
  const employees = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE
    return filteredEmployees.value.slice(start, end)
  })

  // Pagination metadata based on filtered results
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
      // Fetch all employees (up to 200) - we'll filter locally
      const response = await employeesApi.getAll({ size: 200 })
      const apiEmployees = response.data || []

      // Inject demo profiles if not already present (by employeeNo)
      const existingNos = new Set(apiEmployees.map((e: Employee) => e.employeeNo))
      const profilesToInject = DEMO_PROFILES.filter(p => !existingNos.has(p.employeeNo))

      allEmployees.value = [...apiEmployees, ...profilesToInject]
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch employees'
      toast.error(error.value)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchEmployeeById(id: string) {
    isLoading.value = true
    error.value = null
    try {
      currentEmployee.value = await employeesApi.getById(id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch employee'
      toast.error(error.value)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchJobTitles() {
    try {
      const response = await organizationApi.getJobTitles({ size: 1000 })
      jobTitles.value = response.data || []
    } catch {
      toast.error('Failed to fetch job titles')
    }
  }

  async function fetchDepartments() {
    try {
      const response = await organizationApi.getDepartments({ size: 1000 })
      departments.value = response.data || []
    } catch {
      toast.error('Failed to fetch departments')
    }
  }

  async function fetchBusinessUnits() {
    try {
      const response = await organizationApi.getBusinessUnits({ size: 1000 })
      businessUnits.value = response.data || []
    } catch {
      toast.error('Failed to fetch business units')
    }
  }

  async function fetchAllReferenceData() {
    await Promise.all([
      fetchJobTitles(),
      fetchDepartments(),
      fetchBusinessUnits(),
    ])
  }

  function setFilter(key: keyof typeof filters.value, value: string) {
    filters.value[key] = value
    currentPage.value = 1 // Reset to first page when filter changes
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
    setFilter,
    setPage,
    clearFilters,
  }
})
