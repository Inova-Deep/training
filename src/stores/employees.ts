import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import {
  employeesApi,
  organizationApi,
  type Employee,
  type JobTitle,
  type Department,
  type BusinessUnit,
} from '@/api/client'
import {
  DEMO_BUSINESS_UNITS,
  DEMO_DEPARTMENTS,
  DEMO_ROLE_NAMES,
  createDemoBusinessUnit,
  createDemoDepartment,
  createDemoJobTitle,
  isTrackedDemoRole,
  normalizeEmployeeForDemo,
} from '@/lib/demoDomain'

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
    jobTitle: {
      id: 'jt-am-tech',
      code: 'AM-TECH',
      name: 'Additive Manufacturing Technician',
      grade: null,
    },
    manager: {
      id: 'mgr-1',
      employeeNo: 'MGR-001',
      firstName: 'David',
      lastName: 'Clarke',
      displayName: 'David Clarke',
    },
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
    jobTitle: {
      id: 'jt-mat-test',
      code: 'MAT-TEST',
      name: 'Materials Testing Technician',
      grade: null,
    },
    manager: {
      id: 'mgr-2',
      employeeNo: 'MGR-002',
      firstName: 'Sarah',
      lastName: 'Bennett',
      displayName: 'Sarah Bennett',
    },
  },
  {
    id: 'demo-emp-jf',
    tenantId: 'demo',
    employeeNo: 'JF-001',
    firstName: 'James',
    lastName: 'Fletcher',
    displayName: 'James Fletcher',
    workEmail: 'james.fletcher@demo.com',
    status: 'active',
    isActive: true,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    businessUnit: { id: 'bu-amops', code: 'AMO', name: 'AM Operations' },
    department: { id: 'dept-weld', code: 'WF', name: 'Welding & Fabrication' },
    jobTitle: {
      id: 'jt-weld-fab',
      code: 'WELD-FAB',
      name: 'Welding / Fabrication Technician',
      grade: null,
    },
    manager: {
      id: 'mgr-1',
      employeeNo: 'MGR-001',
      firstName: 'David',
      lastName: 'Clarke',
      displayName: 'David Clarke',
    },
  },
  {
    id: 'demo-emp-ra',
    tenantId: 'demo',
    employeeNo: 'RA-001',
    firstName: 'Rana',
    lastName: 'Aziz',
    displayName: 'Rana Aziz',
    workEmail: 'rana.aziz@demo.com',
    status: 'active',
    isActive: true,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    businessUnit: { id: 'bu-robotics', code: 'ROB', name: 'Robotics & Automation' },
    department: { id: 'dept-robotics', code: 'ROB', name: 'Robotics' },
    jobTitle: {
      id: 'jt-robot-op',
      code: 'ROBOT-OP',
      name: 'Robotics Operator',
      grade: null,
    },
    manager: {
      id: 'mgr-1',
      employeeNo: 'MGR-001',
      firstName: 'David',
      lastName: 'Clarke',
      displayName: 'David Clarke',
    },
  },
  {
    id: 'demo-emp-ya',
    tenantId: 'demo',
    employeeNo: 'YA-001',
    firstName: 'Yana',
    lastName: 'Amin',
    displayName: 'Yana Amin',
    workEmail: 'yana.amin@demo.com',
    status: 'active',
    isActive: true,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    businessUnit: { id: 'bu-robotics', code: 'ROB', name: 'Robotics & Automation' },
    department: { id: 'dept-robotics', code: 'ROB', name: 'Robotics' },
    jobTitle: {
      id: 'jt-robot-prog',
      code: 'ROBOT-PROG',
      name: 'Robot Programmer / Cell Technician',
      grade: null,
    },
    manager: {
      id: 'mgr-1',
      employeeNo: 'MGR-001',
      firstName: 'David',
      lastName: 'Clarke',
      displayName: 'David Clarke',
    },
  },
  {
    id: 'demo-emp-tb',
    tenantId: 'demo',
    employeeNo: 'TB-001',
    firstName: 'Tom',
    lastName: 'Bradley',
    displayName: 'Tom Bradley',
    workEmail: 'tom.bradley@demo.com',
    status: 'active',
    isActive: true,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    businessUnit: { id: 'bu-amops', code: 'AMO', name: 'AM Operations' },
    department: { id: 'dept-ops', code: 'OPS', name: 'Operations' },
    jobTitle: {
      id: 'jt-prod-supervisor',
      code: 'PROD-SUP',
      name: 'Production Supervisor',
      grade: null,
    },
    manager: {
      id: 'mgr-3',
      employeeNo: 'DIR-001',
      firstName: 'Robert',
      lastName: 'Ashford',
      displayName: 'Robert Ashford',
    },
  },
  {
    id: 'demo-emp-hm',
    tenantId: 'demo',
    employeeNo: 'HM-001',
    firstName: 'Helen',
    lastName: 'Marsh',
    displayName: 'Helen Marsh',
    workEmail: 'helen.marsh@demo.com',
    status: 'active',
    isActive: true,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    businessUnit: { id: 'bu-quality', code: 'QR', name: 'Quality & Readiness' },
    department: { id: 'dept-hse', code: 'HSE', name: 'HSE' },
    jobTitle: {
      id: 'jt-qhse',
      code: 'QHSE',
      name: 'QHSE Coordinator',
      grade: null,
    },
    manager: {
      id: 'mgr-3',
      employeeNo: 'DIR-001',
      firstName: 'Robert',
      lastName: 'Ashford',
      displayName: 'Robert Ashford',
    },
  },
  {
    id: 'demo-emp-ra2',
    tenantId: 'demo',
    employeeNo: 'RA-002',
    firstName: 'Robert',
    lastName: 'Ashford',
    displayName: 'Robert Ashford',
    workEmail: 'robert.ashford@demo.com',
    status: 'active',
    isActive: true,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    businessUnit: { id: 'bu-leadership', code: 'PL', name: 'Plant Leadership' },
    department: { id: 'dept-ops', code: 'OPS', name: 'Operations' },
    jobTitle: {
      id: 'jt-tech-dir',
      code: 'TECH-DIR',
      name: 'Technical Director',
      grade: null,
    },
    manager: null,
  },
  {
    id: 'demo-emp-sb',
    tenantId: 'demo',
    employeeNo: 'SB-001',
    firstName: 'Sarah',
    lastName: 'Bennett',
    displayName: 'Sarah Bennett',
    workEmail: 'sarah.bennett@demo.com',
    status: 'active',
    isActive: true,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    businessUnit: { id: 'bu-people', code: 'PC', name: 'People & Capability' },
    department: { id: 'dept-people', code: 'PC', name: 'People & Capability' },
    jobTitle: {
      id: 'jt-hr-training',
      code: 'HR-TRAIN',
      name: 'HR / Training Coordinator',
      grade: null,
    },
    manager: {
      id: 'mgr-3',
      employeeNo: 'DIR-001',
      firstName: 'Robert',
      lastName: 'Ashford',
      displayName: 'Robert Ashford',
    },
  },
]

const EMPLOYEE_CAP = 50
const PAGE_SIZE = 20

export const useEmployeesStore = defineStore('employees', () => {
  const allEmployees = ref<Employee[]>([]) // All employees from API
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
    return (id: string) => allEmployees.value.find((e) => e.id === id)
  })

  // Filter to AM-manufacturing demo roles, capped at EMPLOYEE_CAP
  const targetJobTitleEmployees = computed(() => {
    const filtered = allEmployees.value.filter((emp) => {
      return isTrackedDemoRole(emp.jobTitle?.name)
    })
    return filtered.slice(0, EMPLOYEE_CAP)
  })

  // Then apply user filters (search, department, etc.)
  const filteredEmployees = computed(() => {
    let result = targetJobTitleEmployees.value

    if (filters.value.search) {
      const query = filters.value.search.toLowerCase()
      result = result.filter(
        (emp) =>
          emp.firstName.toLowerCase().includes(query) ||
          emp.lastName.toLowerCase().includes(query) ||
          emp.displayName?.toLowerCase().includes(query) ||
          emp.employeeNo.toLowerCase().includes(query),
      )
    }

    if (filters.value.departmentId) {
      result = result.filter((emp) => emp.department?.id === filters.value.departmentId)
    }

    if (filters.value.businessUnitId) {
      result = result.filter((emp) => emp.businessUnit?.id === filters.value.businessUnitId)
    }

    if (filters.value.jobTitleId) {
      result = result.filter((emp) => emp.jobTitle?.id === filters.value.jobTitleId)
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
      const apiEmployees = (response.data || []).map(normalizeEmployeeForDemo)

      // Inject demo profiles if not already present (by employeeNo)
      const existingNos = new Set(apiEmployees.map((e: Employee) => e.employeeNo))
      const profilesToInject = DEMO_PROFILES.map(normalizeEmployeeForDemo).filter(
        (p) => !existingNos.has(p.employeeNo),
      )

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
      const normalized = (response.data || [])
        .map((title) => normalizeEmployeeForDemo({ jobTitle: title } as unknown as Employee).jobTitle)
        .filter((title): title is JobTitle => title !== null && isTrackedDemoRole(title.name))
      const merged = [...normalized]
      for (const roleName of DEMO_ROLE_NAMES) {
        if (!merged.some((title) => title.name === roleName)) {
          merged.push(createDemoJobTitle(roleName))
        }
      }
      jobTitles.value = merged
    } catch {
      toast.error('Failed to fetch job titles')
    }
  }

  async function fetchDepartments() {
    try {
      const response = await organizationApi.getDepartments({ size: 1000 })
      const normalized = (response.data || []).filter((dept) =>
        DEMO_DEPARTMENTS.includes(dept.name ?? ''),
      )
      const merged = [...normalized]
      for (const departmentName of DEMO_DEPARTMENTS.filter((name) => name !== 'All')) {
        if (!merged.some((dept) => dept.name === departmentName)) {
          merged.push(createDemoDepartment(departmentName))
        }
      }
      departments.value = merged
    } catch {
      toast.error('Failed to fetch departments')
    }
  }

  async function fetchBusinessUnits() {
    try {
      const response = await organizationApi.getBusinessUnits({ size: 1000 })
      const normalized = (response.data || [])
        .map((businessUnit) => ({
          ...businessUnit,
          name: normalizeEmployeeForDemo({ businessUnit } as unknown as Employee).businessUnit?.name ?? '',
        }))
        .filter((businessUnit) => DEMO_BUSINESS_UNITS.includes(businessUnit.name))
      const merged = [...normalized]
      for (const businessUnitName of DEMO_BUSINESS_UNITS.filter((name) => name !== 'All')) {
        if (!merged.some((businessUnit) => businessUnit.name === businessUnitName)) {
          merged.push(createDemoBusinessUnit(businessUnitName))
        }
      }
      businessUnits.value = merged
    } catch {
      toast.error('Failed to fetch business units')
    }
  }

  async function fetchAllReferenceData() {
    await Promise.all([fetchJobTitles(), fetchDepartments(), fetchBusinessUnits()])
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
