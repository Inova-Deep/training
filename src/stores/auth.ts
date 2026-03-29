import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { getDemoEmployeeByDisplayName } from '@/lib/demoEmployees'
import { getFirstAccessibleRoute } from '@/lib/navigation'
import { useEmployeesStore } from '@/stores/employees'
import type { AppUser, User, UserRole } from '@/types'

export type DemoPersonaKey =
  | 'employee'
  | 'supervisor'
  | 'manager'
  | 'qhse'
  | 'hr_admin'
  | 'leadership'
  | 'system_admin'

export interface DemoPersona {
  key: DemoPersonaKey
  displayName: string
  roleLabel: string
  role: UserRole
  email: string
  initials: string
  linkedJobTitle: string | null
  employeeId: string | null
  defaultRoute: string
}

const PERSONA_STORAGE_KEY = 'demo_persona_key'
const DEMO_TOKEN = 'demo-local-token'

function buildPersona(
  key: DemoPersonaKey,
  roleLabel: string,
  role: UserRole,
  linkedJobTitle: string | null,
  defaultRoute: string,
  fallbackDisplayName: string,
  fallbackEmail: string,
  fallbackInitials: string,
): DemoPersona {
  const employee = getDemoEmployeeByDisplayName(fallbackDisplayName)
  return {
    key,
    displayName: employee?.displayName ?? fallbackDisplayName,
    roleLabel,
    role,
    email: employee?.workEmail ?? fallbackEmail,
    initials: fallbackInitials,
    linkedJobTitle,
    employeeId: employee?.id ?? null,
    defaultRoute,
  }
}

export const DEMO_PERSONAS: Record<DemoPersonaKey, DemoPersona> = {
  employee: buildPersona(
    'employee',
    'Employee',
    'EMPLOYEE',
    'Welding / Fabrication Technician',
    '/my-competencies',
    'James Fletcher',
    'james.fletcher@deepmanufacturing.co.uk',
    'JF',
  ),
  supervisor: buildPersona(
    'supervisor',
    'Supervisor',
    'SUPERVISOR',
    'Production Supervisor',
    '/dashboard',
    'Tom Bradley',
    'tom.bradley@deepmanufacturing.co.uk',
    'TB',
  ),
  manager: buildPersona(
    'manager',
    'Production Manager',
    'MANAGER',
    'Production Manager',
    '/dashboard',
    'David Clarke',
    'david.clarke@deepmanufacturing.co.uk',
    'DC',
  ),
  qhse: buildPersona(
    'qhse',
    'QHSE',
    'QHSE',
    'QHSE Coordinator',
    '/dashboard',
    'Helen Marsh',
    'helen.marsh@deepmanufacturing.co.uk',
    'HM',
  ),
  hr_admin: buildPersona(
    'hr_admin',
    'HR Admin',
    'HR_ADMIN',
    'HR / Training Coordinator',
    '/dashboard',
    'Sarah Bennett',
    'sarah.bennett@deepmanufacturing.co.uk',
    'SB',
  ),
  leadership: buildPersona(
    'leadership',
    'Leadership',
    'LEADERSHIP_VIEWER',
    'Technical Director',
    '/dashboard',
    'Robert Ashford',
    'robert.ashford@deepmanufacturing.co.uk',
    'RA',
  ),
  system_admin: {
    key: 'system_admin',
    displayName: 'Layla Hassan',
    roleLabel: 'System Admin',
    role: 'ADMIN',
    email: 'layla.hassan@deepmanufacturing.co.uk',
    initials: 'LH',
    linkedJobTitle: null,
    employeeId: null,
    defaultRoute: '/admin/reference-lists',
  },
}

function buildAppUser(persona: DemoPersona): AppUser {
  const now = new Date().toISOString()
  return {
    id: `demo-${persona.key}`,
    email: persona.email,
    displayName: persona.displayName,
    role: persona.role,
    erpEmployeeId: persona.employeeId ?? undefined,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }
}

function buildLocalUser(persona: DemoPersona): User | null {
  if (!persona.employeeId) return null
  const now = new Date().toISOString()
  return {
    id: `user-${persona.key}`,
    tenantId: 'demo',
    employeeId: persona.employeeId,
    email: persona.email,
    displayName: persona.displayName,
    isActive: true,
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now,
  }
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const employeesStore = useEmployeesStore()

  const user = ref<AppUser | null>(null)
  const dmlUser = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const currentPersonaKey = ref<DemoPersonaKey>('manager')
  const isInitializing = ref(true)

  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed<UserRole>(() => user.value?.role ?? 'EMPLOYEE')
  const isAdmin = computed(() => ['HR_ADMIN', 'ADMIN'].includes(userRole.value))
  const isManager = computed(() => userRole.value === 'MANAGER' || isAdmin.value)
  const activePersona = computed(() => DEMO_PERSONAS[currentPersonaKey.value])
  const scopedEmployeeIds = computed(() => {
    const employeeId = activePersona.value.employeeId

    switch (activePersona.value.role) {
      case 'EMPLOYEE':
        return employeeId ? [employeeId] : []
      case 'SUPERVISOR':
        return employeesStore.getDirectReports(employeeId).map((employee) => employee.id)
      case 'MANAGER':
        return employeesStore.getAllReportIds(employeeId)
      case 'QHSE':
      case 'HR_ADMIN':
      case 'ADMIN':
      case 'LEADERSHIP_VIEWER':
      default:
        return employeesStore.allEmployees.map((employee) => employee.id)
    }
  })

  function applyPersona(key: DemoPersonaKey) {
    const persona = DEMO_PERSONAS[key]
    currentPersonaKey.value = key
    user.value = buildAppUser(persona)
    dmlUser.value = buildLocalUser(persona)
    token.value = DEMO_TOKEN
    localStorage.setItem(PERSONA_STORAGE_KEY, key)
    return persona
  }

  async function login(email: string, _password: string) {
    isLoading.value = true
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const persona =
        Object.values(DEMO_PERSONAS).find((candidate) => candidate.email === normalizedEmail) ??
        DEMO_PERSONAS.manager
      applyPersona(persona.key)
      toast.success('Welcome back!')
      await router.push(getFirstAccessibleRoute(persona.role, persona.defaultRoute))
    } finally {
      isLoading.value = false
    }
  }

  function switchPersona(key: DemoPersonaKey) {
    const persona = applyPersona(key)
    toast.success(`Viewing as ${persona.displayName} (${persona.roleLabel})`)
    void router.push(getFirstAccessibleRoute(persona.role, persona.defaultRoute))
  }

  function logout() {
    const persona = applyPersona('manager')
    toast.success(`Viewing as ${persona.displayName} (${persona.roleLabel})`)
    void router.push(getFirstAccessibleRoute(persona.role, persona.defaultRoute))
  }

  function initializeAuth() {
    const storedKey = localStorage.getItem(PERSONA_STORAGE_KEY)
    const personaKey =
      storedKey && storedKey in DEMO_PERSONAS
        ? (storedKey as DemoPersonaKey)
        : ('manager' as DemoPersonaKey)
    applyPersona(personaKey)
    isInitializing.value = false
  }

  initializeAuth()

  return {
    user,
    dmlUser,
    token,
    isLoading,
    isInitializing,
    isAuthenticated,
    userRole,
    isAdmin,
    isManager,
    currentPersonaKey,
    activePersona,
    scopedEmployeeIds,
    login,
    logout,
    switchPersona,
    initializeAuth,
  }
})
