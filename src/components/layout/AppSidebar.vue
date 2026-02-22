<script setup lang="ts">
import { ref } from 'vue'
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
  Sparkles
} from 'lucide-vue-next'

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
const { isMobile, setOpenMobile } = useSidebar()

const handleNavClick = (to: string) => {
  if (isMobile.value) {
    setOpenMobile(false)
  }
  router.push(to)
}

const navigationGroups: NavGroup[] = [
  {
    title: 'Operations',
    items: [
      {
        title: 'Dashboard',
        icon: LayoutDashboard,
        to: '/dashboard',
        tooltip: 'Organisation view of competence compliance, gating risks, and upcoming expiries'
      },
      {
        title: 'Skills Matrix',
        icon: Grid3x3,
        to: '/skills-matrix',
        tooltip: 'Org-wide skills matrix with BU/Department/Job Title filters and Excel export'
      },
      {
        title: 'People',
        icon: Users,
        to: '/people',
        tooltip: 'Browse/search employees from ERP and view competence records, evidence, and training history'
      }
    ]
  },
  {
    title: 'Build & Control',
    items: [
      {
        title: 'Roles',
        icon: Briefcase,
        to: '/roles',
        tooltip: 'Configure Job Title applicability, role requirements, and gating rules for independent work'
      },
      {
        title: 'Competency Library',
        icon: Library,
        to: '/competency-library',
        tooltip: 'Maintain the reusable list of competency requirements, categories, risk levels, and default evidence rules'
      }
    ]
  },
  {
    title: 'Training & Awareness',
    items: [
      {
        title: 'Training Needs',
        icon: GraduationCap,
        to: '/training-needs',
        tooltip: 'Track and manage training needs across the organisation; ensure gaps are closed and verified'
      },
      {
        title: 'Awareness Topics',
        icon: Megaphone,
        to: '/awareness-topics',
        tooltip: 'Create and target awareness topics to employees (all staff with a manager) and track acknowledgements'
      }
    ]
  },
  {
    title: 'Admin',
    items: [
      {
        title: 'Reference Lists',
        icon: ListChecks,
        to: '/admin/reference-lists',
        tooltip: 'Manage controlled values (risk/status/training types/assessment methods) and key thresholds'
      },
      {
        title: 'ERP Connection',
        icon: Database,
        to: '/admin/erp-connection',
        tooltip: 'Test ERP connectivity, validate credentials, and view integration status for demo environment'
      }
    ]
  }
]

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
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div class="user-info">
                    <span class="user-name">John Doe</span>
                    <span class="user-role">Administrator</span>
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
                <DropdownMenuItem variant="destructive">
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
