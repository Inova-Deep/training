import type { RouteRecordRaw } from 'vue-router'
import type { UserRole } from '@/types'

export type AppRouteName =
  | 'dashboard'
  | 'my-competencies'
  | 'skills-matrix'
  | 'people'
  | 'roles'
  | 'role-detail'
  | 'competency-library'
  | 'training-needs'
  | 'awareness-topics'
  | 'admin-reference-lists'
  | 'admin-erp-connection'
  | 'components'
  | 'guide'
  | 'sales-pitch'

export const ALL_ROLES: UserRole[] = [
  'EMPLOYEE',
  'SUPERVISOR',
  'MANAGER',
  'QHSE',
  'HR_ADMIN',
  'ADMIN',
  'LEADERSHIP_VIEWER',
]

export const MGMT_ROLES: UserRole[] = [
  'SUPERVISOR',
  'MANAGER',
  'QHSE',
  'HR_ADMIN',
  'ADMIN',
  'LEADERSHIP_VIEWER',
]

export const appRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true, allowedRoles: ALL_ROLES },
  },
  {
    path: '/my-competencies',
    name: 'my-competencies',
    component: () => import('@/views/MyCompetenciesView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['EMPLOYEE', 'SUPERVISOR', 'MANAGER'] as UserRole[],
    },
  },
  {
    path: '/skills-matrix',
    name: 'skills-matrix',
    component: () => import('@/views/SkillsMatrixView.vue'),
    meta: { requiresAuth: true, allowedRoles: MGMT_ROLES },
  },
  {
    path: '/people',
    name: 'people',
    component: () => import('@/views/PeopleView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['MANAGER', 'HR_ADMIN', 'ADMIN'] as UserRole[],
    },
  },
  {
    path: '/roles',
    name: 'roles',
    component: () => import('@/views/RolesView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['MANAGER', 'QHSE', 'HR_ADMIN', 'ADMIN', 'LEADERSHIP_VIEWER'] as UserRole[],
    },
  },
  {
    path: '/roles/:id',
    name: 'role-detail',
    component: () => import('@/views/RoleDetailView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['MANAGER', 'QHSE', 'HR_ADMIN', 'ADMIN', 'LEADERSHIP_VIEWER'] as UserRole[],
    },
  },
  {
    path: '/competency-library',
    name: 'competency-library',
    component: () => import('@/views/CompetencyLibraryView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['QHSE', 'HR_ADMIN', 'ADMIN'] as UserRole[],
    },
  },
  {
    path: '/training-needs',
    name: 'training-needs',
    component: () => import('@/views/TrainingNeedsView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['SUPERVISOR', 'MANAGER', 'QHSE', 'HR_ADMIN', 'ADMIN'] as UserRole[],
    },
  },
  {
    path: '/awareness-topics',
    name: 'awareness-topics',
    component: () => import('@/views/AwarenessTopicsView.vue'),
    meta: { requiresAuth: true, allowedRoles: ALL_ROLES },
  },
  {
    path: '/admin/reference-lists',
    name: 'admin-reference-lists',
    component: () => import('@/views/ReferenceListsView.vue'),
    meta: { requiresAuth: true, allowedRoles: ['ADMIN'] as UserRole[] },
  },
  {
    path: '/admin/erp-connection',
    name: 'admin-erp-connection',
    component: () => import('@/views/ErpConnectionView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN'] as UserRole[],
    },
  },
  {
    path: '/components',
    name: 'components',
    component: () => import('@/views/ComponentsView.vue'),
    meta: { requiresAuth: true, allowedRoles: ALL_ROLES },
  },
  {
    path: '/guide',
    name: 'guide',
    component: () => import('@/views/GuideView.vue'),
    meta: { requiresAuth: true, allowedRoles: ALL_ROLES },
  },
  {
    path: '/sales-pitch',
    name: 'sales-pitch',
    component: () => import('@/views/GuideView.vue'),
    meta: { requiresAuth: true, allowedRoles: ALL_ROLES },
  },
]
