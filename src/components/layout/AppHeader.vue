<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  SidebarTrigger
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Bell,
  RefreshCw,
  LogOut,
  ChevronDown
} from 'lucide-vue-next'
import { useAuthStore, DEMO_PERSONAS, type DemoPersonaKey } from '@/stores/auth'

const authStore = useAuthStore()

const isSyncing = ref(false)
const notificationCount = ref(2)

const SYNC_DURATION_MS = 2000

const personas: { key: DemoPersonaKey; label: string }[] = [
  { key: 'employee', label: 'Employee' },
  { key: 'manager', label: 'Manager' },
  { key: 'hr_admin', label: 'HR Admin' },
]

const userInitials = computed(() => authStore.activePersona.initials)
const userName = computed(() => authStore.user?.displayName ?? authStore.activePersona.displayName)
const userEmail = computed(() => authStore.user?.email ?? authStore.activePersona.email)
const userRoleLabel = computed(() => authStore.activePersona.roleLabel)

const handleSync = async () => {
  isSyncing.value = true
  await new Promise(resolve => setTimeout(resolve, SYNC_DURATION_MS))
  isSyncing.value = false
}
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <SidebarTrigger class="header-trigger" />
    </div>

    <div class="header-actions">
      <!-- ── Demo Persona Switcher ─────────────────────────────── -->
      <div class="persona-switcher" role="group" aria-label="Switch demo persona">
        <span class="persona-switcher-label desktop-only">Demo:</span>
        <div class="persona-pills">
          <Button
            v-for="p in personas"
            :key="p.key"
            variant="ghost"
            size="sm"
            class="persona-pill"
            :class="{ 'persona-pill-active': authStore.currentPersonaKey === p.key }"
            :aria-pressed="authStore.currentPersonaKey === p.key"
            @click="authStore.switchPersona(p.key)"
          >
            {{ p.label }}
          </Button>
        </div>
      </div>

      <!-- ── Sync status ──────────────────────────────────────── -->
      <div
        class="sync-status desktop-only"
        :class="{ 'sync-status-syncing': isSyncing }"
        @click="handleSync"
        role="button"
        tabindex="0"
        aria-label="Sync status, click to sync"
      >
        <RefreshCw
          class="sync-status-icon"
          :class="{ 'sync-status-spin': isSyncing }"
        />
        <span v-if="!isSyncing">Synced</span>
        <span v-else>Syncing...</span>
      </div>

      <!-- ── Notifications ───────────────────────────────────── -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="icon" class="header-icon-button" aria-label="Notifications">
            <Bell class="header-icon" />
            <span v-if="notificationCount > 0" class="notification-badge" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <div class="notification-item">
              <div class="notification-dot" />
              <div class="notification-content">
                <span class="notification-title">Training assigned</span>
                <span class="notification-time">2 hours ago</span>
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <div class="notification-item">
              <div class="notification-dot" />
              <div class="notification-content">
                <span class="notification-title">Certificate expiring</span>
                <span class="notification-time">1 day ago</span>
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="view-all">
            View all notifications
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <!-- ── User menu ───────────────────────────────────────── -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" class="user-menu-trigger" aria-label="User menu">
            <Avatar class="user-avatar">
              <AvatarFallback>{{ userInitials }}</AvatarFallback>
            </Avatar>
            <span class="user-name-label desktop-only">{{ userName }}</span>
            <ChevronDown class="user-chevron" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div class="user-dropdown-header">
              <span class="user-dropdown-name">{{ userName }}</span>
              <span class="user-dropdown-role">{{ userRoleLabel }}</span>
              <span class="user-dropdown-email">{{ userEmail }}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="logout-item" @click="authStore.logout">
            <LogOut class="dropdown-icon" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 var(--space-lg);
  border-bottom: var(--border-subtle);
  background-color: var(--bg-surface);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.header-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--header-button-size, 36px);
  height: var(--header-button-size, 36px);
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-body);
  transition: background-color 0.15s ease;
}

.header-trigger:hover {
  background-color: var(--bg-hover);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

/* ── Persona switcher ───────────────────────────────────────── */
.persona-switcher {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.persona-switcher-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-caption);
  white-space: nowrap;
}

.persona-pills {
  display: flex;
  align-items: center;
  background-color: var(--bg-subtle);
  border: var(--border-subtle);
  border-radius: var(--radius-full);
  padding: 2px;
  gap: 1px;
}

.persona-pill {
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-caption);
  background: transparent;
  border: none;
  box-shadow: none;
  line-height: 1.4;
  height: auto;
  min-height: unset;
}

.persona-pill:hover:not(.persona-pill-active) {
  background-color: var(--bg-hover);
  color: var(--text-body);
}

.persona-pill-active {
  background-color: var(--bg-surface);
  color: var(--brand-primary);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* ── Sync status ────────────────────────────────────────────── */
.sync-status {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background-color: oklch(0.62 0.14 162 / 0.1);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  color: var(--brand-success);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.sync-status:hover {
  background-color: oklch(0.62 0.14 162 / 0.15);
}

.sync-status-syncing {
  cursor: wait;
}

.sync-status-icon {
  width: var(--icon-xs, 12px);
  height: var(--icon-xs, 12px);
}

.sync-status-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ── User menu ──────────────────────────────────────────────── */
.header-icon-button {
  position: relative;
}

.header-icon {
  width: var(--icon-md, 20px);
  height: var(--icon-md, 20px);
}

.notification-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 7px;
  height: 7px;
  background-color: var(--brand-critical);
  border-radius: var(--radius-full);
  border: 2px solid var(--bg-surface);
}

.user-menu-trigger {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.user-name-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-body);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-chevron {
  width: 14px;
  height: 14px;
  color: var(--text-caption);
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  margin-right: var(--space-sm);
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  width: 100%;
}

.notification-dot {
  width: var(--space-xs);
  height: var(--space-xs);
  background-color: var(--brand-primary);
  border-radius: var(--radius-full);
  margin-top: 4px;
  flex-shrink: 0;
}

.notification-content {
  display: flex;
  flex-direction: column;
}

.notification-title {
  font-size: 0.875rem;
  color: var(--text-heading);
}

.notification-time {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.view-all {
  text-align: center;
  color: var(--brand-primary);
}

.user-dropdown-header {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.user-dropdown-name {
  font-weight: 600;
  color: var(--text-heading);
}

.user-dropdown-role {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--brand-primary);
}

.user-dropdown-email {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.logout-item {
  color: var(--brand-critical);
}

.desktop-only {
  display: flex;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .header-left {
    flex: 1;
  }
}
</style>
