import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-competencies',
    name: 'my-competencies',
    component: () => import('@/views/MyCompetenciesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/skills-matrix',
    name: 'skills-matrix',
    component: () => import('@/views/SkillsMatrixView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/people',
    name: 'people',
    component: () => import('@/views/PeopleView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/roles',
    name: 'roles',
    component: () => import('@/views/RolesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/roles/:id',
    name: 'role-detail',
    component: () => import('@/views/RoleDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/competency-library',
    name: 'competency-library',
    component: () => import('@/views/CompetencyLibraryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/training-needs',
    name: 'training-needs',
    component: () => import('@/views/TrainingNeedsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/awareness-topics',
    name: 'awareness-topics',
    component: () => import('@/views/AwarenessTopicsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/reference-lists',
    name: 'admin-reference-lists',
    component: () => import('@/views/ReferenceListsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/erp-connection',
    name: 'admin-erp-connection',
    component: () => import('@/views/ErpConnectionView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/components',
    name: 'components',
    component: () => import('@/views/ComponentsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/guide',
    name: 'guide',
    component: () => import('@/views/GuideView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sales-pitch',
    name: 'sales-pitch',
    component: () => import('@/views/GuideView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
