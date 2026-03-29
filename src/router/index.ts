import { createRouter, createWebHistory } from 'vue-router'
import { toast } from 'vue-sonner'
import type { UserRole } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { appRoutes } from './routes'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    allowedRoles?: UserRole[]
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: appRoutes,
})

// ─── Role-based access guard ───────────────────────────────────────────────────
// useAuthStore() is safe to call outside setup when called after createPinia()
// is passed to the app, because Pinia stores initialise eagerly (initializeAuth
// runs in the store body).  The guard runs at navigation time, by which point
// the Pinia instance is active.

router.beforeEach((to) => {
  let userRole: UserRole
  try {
    const authStore = useAuthStore()
    userRole = (authStore.userRole as UserRole) ?? 'EMPLOYEE'
  } catch {
    // Pinia not yet active (SSR / cold start edge case) — allow navigation
    return true
  }

  const allowedRoles = to.meta?.allowedRoles

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    toast.error("You don't have access to this page")
    return { name: 'dashboard' }
  }

  return true
})

export default router
