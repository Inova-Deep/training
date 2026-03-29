import type { FunctionalComponent } from 'vue'
import type { LucideProps } from 'lucide-vue-next'
import {
  LayoutDashboard,
  Grid3x3,
  Users,
  Briefcase,
  Library,
  GraduationCap,
  Megaphone,
  ListChecks,
  Database,
  Sparkles,
  UserCircle2,
} from 'lucide-vue-next'
import type { UserRole } from '@/types'
import { appRoutes, type AppRouteName } from '@/router/routes'

export interface NavigationItem {
  title: string
  icon: FunctionalComponent<LucideProps>
  routeName: AppRouteName
  to: string
  tooltip: string
  group: 'My Work' | 'Operations' | 'Training & Awareness' | 'Admin'
  footer?: boolean
}

export interface NavigationGroup {
  title: NavigationItem['group']
  items: NavigationItem[]
}

const GROUP_ORDER: NavigationItem['group'][] = [
  'My Work',
  'Operations',
  'Training & Awareness',
  'Admin',
]

const NAV_ITEMS: NavigationItem[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    routeName: 'dashboard',
    to: '/dashboard',
    tooltip: 'Organisation view of competence compliance, gating risks, and upcoming expiries',
    group: 'My Work',
  },
  {
    title: 'My Competence Profile',
    icon: UserCircle2,
    routeName: 'my-competencies',
    to: '/my-competencies',
    tooltip:
      'Your readiness profile — role requirements, assessed competencies, gaps, evidence, and authorisation status',
    group: 'My Work',
  },
  {
    title: 'Skills Matrix',
    icon: Grid3x3,
    routeName: 'skills-matrix',
    to: '/skills-matrix',
    tooltip:
      'Organisational competence matrix — required vs. assessed vs. gap, filtered by department, role, and risk',
    group: 'Operations',
  },
  {
    title: 'People',
    icon: Users,
    routeName: 'people',
    to: '/people',
    tooltip:
      'Browse/search employees from ERP and view competence records, evidence, and training history',
    group: 'Operations',
  },
  {
    title: 'Roles',
    icon: Briefcase,
    routeName: 'roles',
    to: '/roles',
    tooltip:
      'Configure Job Title applicability, role requirements, and gating rules for independent work',
    group: 'Operations',
  },
  {
    title: 'Competency Library',
    icon: Library,
    routeName: 'competency-library',
    to: '/competency-library',
    tooltip:
      'Maintain the reusable list of competency requirements, categories, risk levels, and default evidence rules',
    group: 'Operations',
  },
  {
    title: 'Training & Gap Actions',
    icon: GraduationCap,
    routeName: 'training-needs',
    to: '/training-needs',
    tooltip:
      'Track gap-closure actions by source — NCR, audit, expiry, procedure change — and verify effectiveness',
    group: 'Training & Awareness',
  },
  {
    title: 'Awareness & Communications',
    icon: Megaphone,
    routeName: 'awareness-topics',
    to: '/awareness-topics',
    tooltip:
      'Controlled awareness communications — procedure revisions, safety briefings, quality alerts — with acknowledgement tracking',
    group: 'Training & Awareness',
  },
  {
    title: 'Reference Lists',
    icon: ListChecks,
    routeName: 'admin-reference-lists',
    to: '/admin/reference-lists',
    tooltip:
      'Manage controlled values (risk/status/training types/assessment methods) and key thresholds',
    group: 'Admin',
  },
  {
    title: 'ERP Connection',
    icon: Database,
    routeName: 'admin-erp-connection',
    to: '/admin/erp-connection',
    tooltip:
      'Test ERP connectivity, validate credentials, and view integration status for demo environment',
    group: 'Admin',
  },
  {
    title: 'Guide',
    icon: Sparkles,
    routeName: 'guide',
    to: '/guide',
    tooltip: 'Explore the platform guide and see how competence management works',
    group: 'Admin',
    footer: true,
  },
]

function getRouteByName(routeName: AppRouteName) {
  return appRoutes.find((route) => route.name === routeName)
}

export function canRoleAccessRoute(role: UserRole, routeName: AppRouteName): boolean {
  const route = getRouteByName(routeName)
  const allowedRoles = route?.meta?.allowedRoles as UserRole[] | undefined
  if (!route) return false
  if (!allowedRoles) return true
  return allowedRoles.includes(role)
}

export function canRoleAccessPath(role: UserRole, path: string): boolean {
  const route = appRoutes.find((candidate) => candidate.path === path)
  if (!route || typeof route.name !== 'string') return false
  return canRoleAccessRoute(role, route.name as AppRouteName)
}

export function getVisibleNavigation(role: UserRole): NavigationGroup[] {
  const visibleItems = NAV_ITEMS.filter((item) => !item.footer && canRoleAccessRoute(role, item.routeName))

  return GROUP_ORDER.map((groupTitle) => ({
    title: groupTitle,
    items: visibleItems.filter((item) => item.group === groupTitle),
  })).filter((group) => group.items.length > 0)
}

export function getVisibleFooterNavigation(role: UserRole): NavigationItem[] {
  return NAV_ITEMS.filter((item) => item.footer && canRoleAccessRoute(role, item.routeName))
}

export function getFirstAccessibleRoute(role: UserRole, preferredPath?: string | null): string {
  if (preferredPath && canRoleAccessPath(role, preferredPath)) {
    return preferredPath
  }

  const firstVisible = getVisibleNavigation(role)[0]?.items[0]
  if (firstVisible) return firstVisible.to

  const firstFooter = getVisibleFooterNavigation(role)[0]
  if (firstFooter) return firstFooter.to

  return '/dashboard'
}
