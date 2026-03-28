<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FunctionalComponent } from 'vue'
import type { LucideProps } from 'lucide-vue-next'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
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
  UserCog,
  Settings,
  ChevronUp,
  Sparkles,
  UserCircle2
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

interface NavItem {
  title: string
  icon: FunctionalComponent<LucideProps>
  to: string
  tooltip: string
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { isMobile, setOpenMobile } = useSidebar()

const handleNavClick = (to: string) => {
  if (isMobile.value) {
    setOpenMobile(false)
  }
  router.push(to)
}

// ─── All possible nav items ────────────────────────────────────────────────────

const NAV_MY_COMPETENCIES: NavItem = {
  title: 'My Competence Profile',
  icon: UserCircle2,
  to: '/my-competencies',
  tooltip: 'Your readiness profile — role requirements, assessed competencies, gaps, evidence, and authorisation status'
}

const NAV_DASHBOARD: NavItem = {
  title: 'Dashboard',
  icon: LayoutDashboard,
  to: '/dashboard',
  tooltip: 'Organisation view of competence compliance, gating risks, and upcoming expiries'
}

const NAV_SKILLS_MATRIX: NavItem = {
  title: 'Skills Matrix',
  icon: Grid3x3,
  to: '/skills-matrix',
  tooltip: 'Organisational competence matrix — required vs. assessed vs. gap, filtered by department, role, and risk'
}

const NAV_PEOPLE: NavItem = {
  title: 'People',
  icon: Users,
  to: '/people',
  tooltip: 'Browse/search employees from ERP and view competence records, evidence, and training history'
}

const NAV_ROLES: NavItem = {
  title: 'Roles',
  icon: Briefcase,
  to: '/roles',
  tooltip: 'Configure Job Title applicability, role requirements, and gating rules for independent work'
}

const NAV_COMPETENCY_LIBRARY: NavItem = {
  title: 'Competency Library',
  icon: Library,
  to: '/competency-library',
  tooltip: 'Maintain the reusable list of competency requirements, categories, risk levels, and default evidence rules'
}

const NAV_TRAINING_NEEDS: NavItem = {
  title: 'Training & Gap Actions',
  icon: GraduationCap,
  to: '/training-needs',
  tooltip: 'Track gap-closure actions by source — NCR, audit, expiry, procedure change — and verify effectiveness'
}

const NAV_AWARENESS_TOPICS: NavItem = {
  title: 'Awareness & Communications',
  icon: Megaphone,
  to: '/awareness-topics',
  tooltip: 'Controlled awareness communications — procedure revisions, safety briefings, quality alerts — with acknowledgement tracking'
}

const NAV_REFERENCE_LISTS: NavItem = {
  title: 'Reference Lists',
  icon: ListChecks,
  to: '/admin/reference-lists',
  tooltip: 'Manage controlled values (risk/status/training types/assessment methods) and key thresholds'
}

const NAV_ERP_CONNECTION: NavItem = {
  title: 'ERP Connection',
  icon: Database,
  to: '/admin/erp-connection',
  tooltip: 'Test ERP connectivity, validate credentials, and view integration status for demo environment'
}

// ─── Role-gated navigation groups ─────────────────────────────────────────────

const navigationGroups = computed<NavGroup[]>(() => {
  const role = authStore.userRole

  if (role === 'EMPLOYEE') {
    return [
      {
        title: 'My Work',
        items: [NAV_MY_COMPETENCIES, NAV_TRAINING_NEEDS, NAV_AWARENESS_TOPICS],
      },
    ]
  }

  if (role === 'MANAGER') {
    return [
      {
        title: 'Operations',
        items: [NAV_DASHBOARD, NAV_SKILLS_MATRIX, NAV_PEOPLE],
      },
      {
        title: 'Training & Awareness',
        items: [NAV_TRAINING_NEEDS],
      },
    ]
  }

  // HR_ADMIN — full access
  return [
    {
      title: 'Operations',
      items: [NAV_DASHBOARD, NAV_SKILLS_MATRIX, NAV_PEOPLE],
    },
    {
      title: 'Competence Framework',
      items: [NAV_ROLES, NAV_COMPETENCY_LIBRARY],
    },
    {
      title: 'Training & Awareness',
      items: [NAV_TRAINING_NEEDS, NAV_AWARENESS_TOPICS],
    },
    {
      title: 'Admin',
      items: [NAV_REFERENCE_LISTS, NAV_ERP_CONNECTION],
    },
  ]
})

const userInitials = computed(() => authStore.activePersona.initials)
const userName = computed(() => authStore.user?.displayName ?? authStore.activePersona.displayName)
const userRoleLabel = computed(() => authStore.activePersona.roleLabel)

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<template>
  <TooltipProvider>
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" as-child>
              <a @click="handleNavClick('/dashboard')" class="nav-link">
                <div class="sidebar-logo">
                  <span>C</span>
                </div>
                <div class="sidebar-brand-text">
                  <span class="sidebar-brand-name">Competence</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup v-for="group in navigationGroups" :key="group.title">
          <SidebarGroupLabel>{{ group.title }}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in group.items" :key="item.title">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <SidebarMenuButton
                      as-child
                      :is-active="isActive(item.to)"
                    >
                      <a @click="handleNavClick(item.to)" class="nav-link">
                        <component :is="item.icon" />
                        <span>{{ item.title }}</span>
                      </a>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" class="nav-tooltip">
                    {{ item.tooltip }}
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Tooltip>
              <TooltipTrigger as-child>
                <SidebarMenuButton as-child>
                  <a @click="handleNavClick('/guide')" class="nav-link">
                    <Sparkles />
                    <span>Guide</span>
                  </a>
                </SidebarMenuButton>
              </TooltipTrigger>
              <TooltipContent side="right" class="nav-tooltip">
                Explore the platform guide and see how competence management works
              </TooltipContent>
            </Tooltip>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <SidebarMenuButton
                  size="lg"
                  class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar class="avatar-footer">
                    <AvatarFallback>{{ userInitials }}</AvatarFallback>
                  </Avatar>
                  <div class="user-info">
                    <span class="user-name">{{ userName }}</span>
                    <span class="user-role">{{ userRoleLabel }}</span>
                  </div>
                  <ChevronUp class="chevron-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top">
                <DropdownMenuItem>
                  <UserCog class="dropdown-icon" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings class="dropdown-icon" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" @click="authStore.logout">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  </TooltipProvider>
</template>

<style scoped>
.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: var(--brand-primary);
  border-radius: var(--radius-md);
  color: var(--primary-foreground);
  font-size: 0.875rem;
  font-weight: 700;
  flex-shrink: 0;
}

.sidebar-brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1;
  min-width: 0;
  overflow: hidden;
}

.sidebar-brand-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-heading);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  cursor: pointer;
}

.chevron-auto {
  margin-left: auto;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.avatar-footer {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  overflow: hidden;
}

.user-name {
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.6875rem;
  color: var(--text-caption);
  line-height: 1.2;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  margin-right: var(--space-sm);
}

.nav-tooltip {
  max-width: 280px;
  font-size: 0.75rem;
  line-height: 1.4;
}
</style>
