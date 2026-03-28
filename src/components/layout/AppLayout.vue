<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'

const isMobile = ref(false)
</script>

<template>
  <SidebarProvider :defaultOpen="true">
    <AppSidebar />
    <SidebarInset>
      <AppHeader />
      <main class="app-main">
        <div class="app-content">
          <RouterView />
        </div>
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
