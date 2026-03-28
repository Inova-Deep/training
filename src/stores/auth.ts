import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { authApi, usersApi, setToken } from '@/api/client'
import type { AppUser, User, UserRole } from '@/types'

// ─── Demo persona types ────────────────────────────────────────────────────────

export type DemoPersonaKey = 'employee' | 'manager' | 'hr_admin'

export interface DemoPersona {
  key: DemoPersonaKey
  displayName: string
  roleLabel: string
  role: UserRole
  email: string
  initials: string
  /** Job title used to find this persona's employee row in the Skills Matrix store */
  linkedJobTitle: string | null
  /** Route to navigate to when switching to this persona */
  defaultRoute: string
}

export const DEMO_PERSONAS: Record<DemoPersonaKey, DemoPersona> = {
  employee: {
    key: 'employee',
    displayName: 'James Fletcher',
    roleLabel: 'Employee',
    role: 'EMPLOYEE',
    email: 'james.fletcher@demo.com',
    initials: 'JF',
    linkedJobTitle: 'Welding / Fabrication Technician',
    defaultRoute: '/training-needs',
  },
  manager: {
    key: 'manager',
    displayName: 'David Clarke',
    roleLabel: 'Manager',
    role: 'MANAGER',
    email: 'david.clarke@demo.com',
    initials: 'DC',
    linkedJobTitle: 'Production Supervisor',
    defaultRoute: '/dashboard',
  },
  hr_admin: {
    key: 'hr_admin',
    displayName: 'Sarah Bennett',
    roleLabel: 'HR Admin',
    role: 'HR_ADMIN',
    email: 'sarah.bennett@demo.com',
    initials: 'SB',
    linkedJobTitle: 'HR / Training Coordinator',
    defaultRoute: '/dashboard',
  },
}

// ─── Hardcoded demo credentials ────────────────────────────────────────────────

const DEMO_EMAIL = 'hemish.patel@inova.krd' // matches hr_admin persona email
const DEMO_PASSWORD = 'Testing123!'

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const user = ref<AppUser | null>(null)
  const dmlUser = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const currentPersonaKey = ref<DemoPersonaKey>('hr_admin')

  const isInitializing = ref(true)
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || 'EMPLOYEE')
  const isAdmin = computed(() => userRole.value === 'HR_ADMIN')
  const isManager = computed(() => userRole.value === 'MANAGER' || isAdmin.value)
  const activePersona = computed(() => DEMO_PERSONAS[currentPersonaKey.value])

  async function login(email: string, password: string) {
    isLoading.value = true
    try {
      const response = await authApi.login(email, password)
      token.value = response.token
      setToken(response.token)
      localStorage.setItem('token', response.token)

      await fetchUserInfo(email)

      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      toast.error(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUserInfo(email: string) {
    try {
      const dmlUserData = await usersApi.getByEmail(email)
      dmlUser.value = dmlUserData

      user.value = {
        id: dmlUserData.id,
        email: dmlUserData.email,
        displayName: dmlUserData.displayName ?? email.split('@')[0] ?? 'Unknown User',
        role: 'HR_ADMIN',
        erpEmployeeId: dmlUserData.employeeId ?? undefined,
        isActive: dmlUserData.isActive,
        createdAt: dmlUserData.createdAt,
        updatedAt: dmlUserData.updatedAt,
      }
    } catch {
      const namePart = email.split('@')[0]
      user.value = {
        id: 'demo-user-id',
        email,
        displayName: namePart || 'Unknown User',
        role: 'HR_ADMIN',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
  }

  function switchPersona(key: DemoPersonaKey) {
    const persona = DEMO_PERSONAS[key]
    currentPersonaKey.value = key
    user.value = {
      id: `demo-${key}`,
      email: persona.email,
      displayName: persona.displayName,
      role: persona.role,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    toast.success(`Viewing as ${persona.displayName} (${persona.roleLabel})`)
    router.push(persona.defaultRoute)
  }

  function logout() {
    switchPersona('hr_admin')
  }

  function initializeAuth() {
    const persona = DEMO_PERSONAS.hr_admin
    currentPersonaKey.value = 'hr_admin'

    // Restore a previously obtained real token so return visits are instant
    const storedToken = localStorage.getItem('demo_token')
    if (storedToken) {
      token.value = storedToken
      setToken(storedToken)
      user.value = {
        id: 'demo-hr-admin',
        email: DEMO_EMAIL,
        displayName: persona.displayName,
        role: persona.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    // Always refresh — gets a real token and updates user info
    authApi.login(DEMO_EMAIL, DEMO_PASSWORD)
      .then(async (response) => {
        token.value = response.token
        setToken(response.token)
        localStorage.setItem('demo_token', response.token)
        await fetchUserInfo(DEMO_EMAIL)
      })
      .catch(() => {
        // API unavailable — if we have a stored token keep it, otherwise fail gracefully
      })
      .finally(() => {
        isInitializing.value = false
      })
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
    login,
    logout,
    switchPersona,
    initializeAuth,
  }
})
