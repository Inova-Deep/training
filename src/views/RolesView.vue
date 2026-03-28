<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  MoreHorizontal, 
  Search, 
  FileText, 
  Settings, 
  History, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table'
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu'
import { useRolesStore } from '@/stores/roles'
import { organizationApi } from '@/api/client'
import type { JobTitle } from '@/api/client'

const store = useRolesStore()
const router = useRouter()
const erpJobTitles = ref<JobTitle[]>([])
const search = ref('')

onMounted(async () => {
  try {
    const [titlesResponse] = await Promise.all([
      organizationApi.getJobTitles({ size: 1000 }),
      store.fetchRoles()
    ])
    erpJobTitles.value = titlesResponse?.data || []
  } catch (error) {
    console.error('Failed to load roles data', error)
  }
})

const EXCLUDED_KEYWORDS = ['chief', 'director']

const jobTitleList = computed(() => {
  return erpJobTitles.value
    .filter(title => {
      const name = title.name.toLowerCase()
      return !EXCLUDED_KEYWORDS.some(kw => name.includes(kw))
    })
    .map(title => {
      const decision = store.roles.find(r => r.erpJobTitleId === title.name || r.erpJobTitleId === title.id)
      const latestSet = store.requirementSets.find(s => s.erpJobTitleId === title.name)
      return {
        ...title,
        decision,
        status: decision?.result || 'PENDING',
        version: latestSet?.version || 0,
        isPublished: latestSet?.status === 'PUBLISHED',
        updatedAt: decision?.createdAt || ''
      }
    })
    .filter(t => {
      if (!search.value) return true
      const s = search.value.toLowerCase()
      return t.name.toLowerCase().includes(s) || (t.code ?? '').toLowerCase().includes(s)
    })
})

function getStatusLabel(status: string) {
  switch (status) {
    case 'INCLUDED': return 'Included'
    case 'AWARENESS_ONLY': return 'Awareness Only'
    case 'OUT_OF_SCOPE': return 'Out of Scope'
    default: return 'Decision Pending'
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case 'INCLUDED': return 'badge-success'
    case 'AWARENESS_ONLY': return 'badge-warning'
    case 'OUT_OF_SCOPE': return 'badge-neutral'
    case 'PENDING': return 'badge-primary'
    default: return 'badge-outline'
  }
}

function navigateToRole(id: string) {
  router.push(`/roles/${id}`)
}
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">Roles</h1>
    <p class="page-subtitle">Job title competence profiles — applicability decisions, requirements, and team readiness</p>
  </div>

  <Card class="data-card">
    <CardHeader class="data-card-header">
      <CardTitle class="data-card-title">Job Titles (ERP)</CardTitle>
    </CardHeader>
    <CardContent class="data-card-content">
      <div class="toolbar">
        <div class="toolbar-search">
          <div class="search-input-wrapper">
            <Search class="search-input-icon" />
            <Input
              v-model="search"
              class="global-search"
              placeholder="Filter job titles..."
              style="padding-left: 2.25rem"
            />
          </div>
        </div>
      </div>

      <div class="table-wrapper">
        <Table class="dense-table">
          <TableHeader>
            <TableRow>
              <TableHead style="width: 100px">Code</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Applicability</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Version</TableHead>
              <TableHead class="table-actions-header">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow 
              v-for="job in jobTitleList" 
              :key="job.id" 
              class="clickable-row" 
              @click="navigateToRole(job.id)"
            >
              <TableCell class="code-cell">
                {{ job.code || '-' }}
              </TableCell>
              <TableCell class="table-name-cell">{{ job.name }}</TableCell>
              <TableCell>
                <span class="badge badge-with-icon" :class="getStatusClass(job.status)">
                  <CheckCircle2 v-if="job.status === 'INCLUDED'" class="icon-xxs" />
                  <AlertCircle v-else-if="job.status === 'AWARENESS_ONLY'" class="icon-xxs" />
                  <HelpCircle v-else-if="job.status === 'PENDING'" class="icon-xxs" />
                  <span v-else-if="job.status === 'OUT_OF_SCOPE'" class="status-dot-neutral"></span>
                  {{ getStatusLabel(job.status) }}
                </span>
              </TableCell>
              <TableCell>
                <span v-if="job.isPublished" class="badge badge-success badge-with-icon">
                  <CheckCircle2 class="icon-xxs" />
                  Published
                </span>
                <span v-else class="badge badge-warning badge-with-icon">
                  <ShieldCheck class="icon-xxs" />
                  Drafting
                </span>
              </TableCell>
              <TableCell>
                <span v-if="job.version" class="version-badge">
                  v{{ job.version }}
                </span>
                <span v-else class="empty-value">-</span>
              </TableCell>
              <TableCell class="table-actions-cell" @click.stop>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="table-action-btn" :aria-label="`Actions for ${job.name}`">
                      <MoreHorizontal class="icon-xs" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="navigateToRole(job.id)">
                      <Settings class="icon-xs icon-mr" />
                      Applicability Decision
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="navigateToRole(job.id)">
                      <FileText class="icon-xs icon-mr" />
                      Role Requirements
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <History class="icon-xs icon-mr" />
                      History
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
</template>

<style scoped>
.table-wrapper {
  overflow-x: auto;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.clickable-row:hover {
  background-color: var(--bg-hover);
}

.code-cell {
  font-family: var(--font-mono);
  font-size: 0.75rem;
}

.table-name-cell {
  font-weight: 500;
}

/* Badge with icon */
.badge-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-dot-neutral {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background-color: currentColor;
  opacity: 0.6;
}

/* Version badge */
.version-badge {
  font-size: 0.75rem;
  font-family: var(--font-mono);
  background-color: var(--bg-subtle);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  border: var(--border-subtle);
}

.empty-value {
  font-size: 0.75rem;
  color: var(--text-caption);
}
</style>
