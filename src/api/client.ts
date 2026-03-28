const API_BASE = 'https://dmlapi.inova.krd/api/v1'

let authToken: string | null = null

export function getToken(): string | null {
  return authToken
}

export function setToken(token: string): void {
  authToken = token
}

export function clearToken(): void {
  authToken = null
}

function buildQueryString(query?: Record<string, string | number | undefined>): string {
  if (!query) return ''

  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  })

  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export async function apiFetch<T>(
  endpoint: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    body?: unknown
    query?: Record<string, string | number | undefined>
  },
): Promise<T> {
  const { method = 'GET', body, query } = options || {}

  const url = `${API_BASE}${endpoint}${buildQueryString(query)}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
  }

  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body)
  }

  const response = await fetch(url, fetchOptions)

  if (response.status === 401) {
    clearToken()
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(errorBody || `HTTP ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export interface PaginatedResponse<T> {
  data: T[]
  metadata: {
    currentPage: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

export interface BusinessUnit {
  id: string
  code: string | null
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Department {
  id: string
  code: string | null
  name: string
  parentDepartmentId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface JobTitle {
  id: string
  code: string | null
  name: string
  grade: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Employee {
  id: string
  tenantId: string
  employeeNo: string
  firstName: string
  lastName: string
  displayName: string | null
  workEmail: string | null
  status: 'active' | 'inactive'
  isActive: boolean
  createdAt: string
  updatedAt: string
  businessUnit: {
    id: string
    code: string | null
    name: string | null
  } | null
  department: {
    id: string
    code: string | null
    name: string | null
  } | null
  jobTitle: {
    id: string
    code: string | null
    name: string | null
    grade: string | null
  } | null
  manager: {
    id: string
    employeeNo: string | null
    firstName: string | null
    lastName: string | null
    displayName: string | null
  } | null
}

export interface EmployeeHierarchy {
  id: string
  employeeNo: string
  firstName: string
  lastName: string
  managerId: string | null
}

export interface User {
  id: string
  tenantId: string
  employeeId: string | null
  email: string
  displayName: string | null
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  code: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: string
  tenantId: string
  actorId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  entityType: string
  entityId: string
  changes: Record<string, unknown>
  createdAt: string
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string }>('/auth/login', { method: 'POST', body: { email, password } }),
}

export const organizationApi = {
  getBusinessUnits: (params?: { page?: number; size?: number; search?: string }) =>
    apiFetch<PaginatedResponse<BusinessUnit>>('/business-units', { query: params }),
  getBusinessUnit: (id: string) => apiFetch<BusinessUnit>(`/business-units/${id}`),

  getDepartments: (params?: { page?: number; size?: number; search?: string }) =>
    apiFetch<PaginatedResponse<Department>>('/departments', { query: params }),
  getDepartment: (id: string) => apiFetch<Department>(`/departments/${id}`),

  getJobTitles: (params?: { page?: number; size?: number; search?: string }) =>
    apiFetch<PaginatedResponse<JobTitle>>('/job-titles', { query: params }),
  getJobTitle: (id: string) => apiFetch<JobTitle>(`/job-titles/${id}`),
}

export const employeesApi = {
  getAll: (params?: { page?: number; size?: number; search?: string }) =>
    apiFetch<PaginatedResponse<Employee>>('/employees', { query: params }),
  getById: (id: string) => apiFetch<Employee>(`/employees/${id}`),
  getHierarchy: (id: string) => apiFetch<EmployeeHierarchy[]>(`/employees/${id}/hierarchy`),
  create: (data: Partial<Employee>) =>
    apiFetch<Employee>('/employees', { method: 'POST', body: data }),
}

export const usersApi = {
  getAll: (params?: { page?: number; size?: number; search?: string }) =>
    apiFetch<PaginatedResponse<User>>('/users', { query: params }),
  getById: (id: string) => apiFetch<User>(`/users/${id}`),
  getByEmail: (email: string) =>
    apiFetch<User>(`/users/by-email?email=${encodeURIComponent(email)}`),
  create: (data: Partial<User>) => apiFetch<User>('/users', { method: 'POST', body: data }),
  assignRole: (userId: string, roleId: string) =>
    apiFetch<{ message: string }>(`/users/${userId}/roles`, { method: 'POST', body: { roleId } }),
  revokeRole: (userId: string, roleId: string) =>
    apiFetch<{ message: string }>(`/users/${userId}/roles/${roleId}`, { method: 'DELETE' }),
}

export const rolesApi = {
  getAll: () => apiFetch<Role[]>('/roles'),
  getById: (id: string) => apiFetch<Role>(`/roles/${id}`),
  create: (data: Partial<Role>) => apiFetch<Role>('/roles', { method: 'POST', body: data }),
}

export const auditApi = {
  getLogs: (params?: { page?: number; size?: number; entityType?: string; action?: string }) =>
    apiFetch<PaginatedResponse<AuditLog>>('/audit-logs', { query: params }),
}
