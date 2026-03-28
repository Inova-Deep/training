import { createRouter, createWebHistory } from 'vue-router'
import { toast } from 'vue-sonner'
import type { UserRole } from '@/types'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    allowedRoles?: UserRole[]
  }
}

const ALL_ROLES: UserRole[] = ['EMPLOYEE', 'SUPERVISOR', 'MANAGER', 'QHSE', 'HR_ADMIN', 'ADMIN', 'LEADERSHIP_VIEWER']
const MGMT_ROLES: UserRole[] = ['SUPERVISOR', 'MANAGER', 'QHSE', 'HR_ADMIN', 'ADMIN', 'LEADERSHIP_VIEWER']

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true, allowedRoles: ALL_ROLES }
  },
  {
    path: '/my-competencies',
    name: 'my-competencies',
    component: () => import('@/views/MyCompetenciesView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['EMPLOYEE', 'SUPERVISOR', 'MANAGER', 'QHSE', 'HR_ADMIN', 'ADMIN'] as UserRole[]
    }
  },
  {
    path: '/skills-matrix',
    name: 'skills-matrix',
    component: () => import('@/views/SkillsMatrixView.vue'),
    meta: { requiresAuth: true, allowedRoles: MGMT_ROLES }
  },
  {
    path: '/people',
    name: 'people',
    component: () => import('@/views/PeopleView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['MANAGER', 'HR_ADMIN', 'ADMIN'] as UserRole[]
    }
  },
  {
    path: '/roles',
    name: 'roles',
    component: () => import('@/views/RolesView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['MANAGER', 'QHSE', 'HR_ADMIN', 'ADMIN', 'LEADERSHIP_VIEWER'] as UserRole[]
    }
  },
  {
    path: '/roles/:id',
    name: 'role-detail',
    component: () => import('@/views/RoleDetailView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['MANAGER', 'QHSE', 'HR_ADMIN', 'ADMIN', 'LEADERSHIP_VIEWER'] as UserRole[]
    }
  },
  {
    path: '/competency-library',
    name: 'competency-library',
    component: () => import('@/views/CompetencyLibraryView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['QHSE', 'HR_ADMIN', 'ADMIN'] as UserRole[]
    }
  },
  {
    path: '/training-needs',
    name: 'training-needs',
    component: () => import('@/views/TrainingNeedsView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['SUPERVISOR', 'MANAGER', 'QHSE', 'HR_ADMIN', 'ADMIN'] as UserRole[]
    }
  },
  {
    path: '/awareness-topics',
    name: 'awareness-topics',
    component: () => import('@/views/AwarenessTopicsView.vue'),
    meta: { requiresAuth: true, allowedRoles: ALL_ROLES }
  },
  {
    path: '/admin/reference-lists',
    name: 'admin-reference-lists',
    component: () => import('@/views/ReferenceListsView.vue'),
    meta: { requiresAuth: true, allowedRoles: ALL_ROLES }
  },
  {
    path: '/admin/erp-connection',
    name: 'admin-erp-connection',
    component: () => import('@/views/ErpConnectionView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['HR_ADMIN', 'ADMIN'] as UserRole[]
    }
  },
  {
    path: '/components',
    name: 'components',
    component: () => import('@/views/ComponentsView.vue'),
    meta: { requiresAuth: true, allowedRoles: ALL_ROLES }
  },
  {
    path: '/guide',
    name: 'guide',
    component: () => import('@/views/GuideView.vue'),
    meta: { requiresAuth: true, allowedRoles: ALL_ROLES }
  },
  {
    path: '/sales-pitch',
    name: 'sales-pitch',
    component: () => import('@/views/GuideView.vue'),
    meta: { requiresAuth: true, allowedRoles: ALL_ROLES }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
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
