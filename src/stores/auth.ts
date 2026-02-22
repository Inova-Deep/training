import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { authApi, usersApi, setToken } from '@/api/client'
import type { AppUser, User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  
  const user = ref<AppUser | null>(null)
  const dmlUser = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || 'EMPLOYEE')
  const isAdmin = computed(() => userRole.value === 'HR_ADMIN')
  const isManager = computed(() => userRole.value === 'MANAGER' || isAdmin.value)
  
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
  
  function logout() {
    token.value = null
    user.value = null
    dmlUser.value = null
    localStorage.removeItem('token')
    setToken('')
    toast.info('Logged out successfully')
    router.push('/login')
  }
  
  function initializeAuth() {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      token.value = storedToken
      setToken(storedToken)
      user.value = {
        id: 'demo-user-id',
        email: 'admin@inova.krd',
        displayName: 'Admin User',
        role: 'HR_ADMIN',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
  }
  
  initializeAuth()
  
  return {
    user,
    dmlUser,
    token,
    isLoading,
    isAuthenticated,
    userRole,
    isAdmin,
    isManager,
    login,
    logout,
    initializeAuth,
  }
})
