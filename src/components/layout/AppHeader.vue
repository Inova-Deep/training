<script setup lang="ts">
import { ref } from 'vue'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Search,
  Bell,
  RefreshCw,
  User,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-vue-next'

const searchQuery = ref('')
const isSyncing = ref(false)
const notificationCount = ref(2)

const SYNC_DURATION_MS = 2000

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
      <div class="search-wrapper desktop-only">
        <Search class="search-icon" />
        <Input
          v-model="searchQuery"
          class="global-search"
          placeholder="Search anything..."
          aria-label="Search"
        />
      </div>
    </div>

    <div class="header-actions">
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

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" class="user-menu-trigger" aria-label="User menu">
            <Avatar class="user-avatar">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <ChevronDown class="user-chevron" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div class="user-dropdown-header">
              <span class="user-dropdown-name">John Doe</span>
              <span class="user-dropdown-email">john.doe@company.com</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User class="dropdown-icon" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings class="dropdown-icon" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="logout-item">
            <LogOut class="dropdown-icon" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>

<style scoped>
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

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--space-sm);
  width: var(--icon-sm, 16px);
  height: var(--icon-sm, 16px);
  color: var(--text-caption);
  pointer-events: none;
  z-index: 1;
}

.global-search {
  padding-left: 2.25rem;
  width: 280px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.header-icon-button {
  position: relative;
}

.header-icon {
  width: var(--icon-md, 20px);
  height: var(--icon-md, 20px);
}

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

.user-menu-trigger {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
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
  margin-top: var(--notification-dot-offset, 4px);
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
}

.user-dropdown-name {
  font-weight: 500;
  color: var(--text-heading);
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
