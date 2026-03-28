<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { MoreHorizontal, Plus, Search, Archive, Edit, Eye } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCompetencyLibraryStore } from '@/stores/competencyLibrary'
import { useReferenceListsStore } from '@/stores/referenceLists'
import type { CompetencyLibraryItem } from '@/types'
import CompetencyFormSheet from '@/components/competency/CompetencyFormSheet.vue'

const store = useCompetencyLibraryStore()
const refStore = useReferenceListsStore()

const search = ref('')
const categoryFilter = ref('all')
const isFormOpen = ref(false)
const editingCompetency = ref<CompetencyLibraryItem | null>(null)

const filteredCompetencies = computed(() => {
  return store.competencies.filter(c => {
    const matchesSearch = !search.value || 
      c.title.toLowerCase().includes(search.value.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.value.toLowerCase())
    const matchesCategory = categoryFilter.value === 'all' || c.category === categoryFilter.value
    return matchesSearch && matchesCategory
  })
})

const categories = ['Technical', 'Quality', 'Mandatory']

function openAddForm() {
  editingCompetency.value = null
  isFormOpen.value = true
}

function openEditForm(comp: CompetencyLibraryItem) {
  editingCompetency.value = comp
  isFormOpen.value = true
}

function handleSaved() {
  // Logic to refresh or just rely on store reactivity
}

function getRiskLevelName(code: string) {
  return refStore.riskLevelByCode(code)?.name || code
}

function getTrainingTypeName(code: string) {
  return refStore.trainingTypeByCode(code)?.name || code
}

function formatValidity(comp: CompetencyLibraryItem) {
  if (!comp.defaultRequiresExpiry) return 'No Expiry'
  return comp.defaultValidityDays ? `${comp.defaultValidityDays} days` : 'Required'
}

onMounted(() => {
  if (store.competencies.length === 0) {
    store.fetchCompetencies()
  }
  refStore.fetchAll()
})
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">Competency Library</h1>
    <p class="page-subtitle">Controlled library of competence requirements — skills, certifications, qualifications, and procedure awareness</p>
  </div>

  <Card class="data-card">
    <CardHeader class="data-card-header">
      <CardTitle class="data-card-title">Library Items</CardTitle>
      <div class="data-card-actions">
        <Button size="sm" @click="openAddForm">
          <Plus class="icon-xs icon-mr" />
          Add Competency
        </Button>
      </div>
    </CardHeader>
    <CardContent class="data-card-content">
      <div class="toolbar">
        <div class="toolbar-search">
          <div class="search-input-wrapper">
            <Search class="search-input-icon" />
            <Input
              v-model="search"
              class="global-search"
              placeholder="Search code or title..."
              style="padding-left: 2.25rem"
            />
          </div>
        </div>
        <div class="toolbar-actions">
          <Select v-model="categoryFilter">
            <SelectTrigger style="width: 180px">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="table-wrapper">
        <Table class="dense-table">
          <TableHeader>
            <TableRow>
              <TableHead style="width: 120px">Code</TableHead>
              <TableHead>Competency Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Default Training</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead class="table-actions-header">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="comp in filteredCompetencies" :key="comp.id">
              <TableCell class="code-cell">
                {{ comp.code || '-' }}
              </TableCell>
              <TableCell class="table-name-cell">{{ comp.title }}</TableCell>
              <TableCell>
                <span class="badge badge-neutral">{{ comp.category }}</span>
              </TableCell>
              <TableCell>
                <span class="badge" :class="{
                  'badge-critical': comp.riskLevelCode === 'HIGH_CRITICAL',
                  'badge-warning': comp.riskLevelCode === 'MEDIUM',
                  'badge-primary': comp.riskLevelCode === 'LOW'
                }">
                  {{ getRiskLevelName(comp.riskLevelCode) }}
                </span>
              </TableCell>
              <TableCell>{{ getTrainingTypeName(comp.defaultTrainingTypeCode) }}</TableCell>
              <TableCell>{{ formatValidity(comp) }}</TableCell>
              <TableCell class="table-actions-cell">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="table-action-btn" :aria-label="`Actions for ${comp.title}`">
                      <MoreHorizontal class="icon-xs" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="openEditForm(comp)">
                      <Edit class="icon-xs icon-mr" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye class="icon-xs icon-mr" />
                      View Assignments
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="destructive-action">
                      <Archive class="icon-xs icon-mr" />
                      Archive Item
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            <TableRow v-if="filteredCompetencies.length === 0">
              <TableCell colspan="7" class="empty-state-cell">
                No competencies found matching your criteria
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  <CompetencyFormSheet
    v-model:open="isFormOpen"
    :competency="editingCompetency"
    @saved="handleSaved"
  />
</template>

<style scoped>
.table-wrapper {
  overflow-x: auto;
}

.code-cell {
  font-family: var(--font-mono);
  font-size: 0.75rem;
}

.table-name-cell {
  font-weight: 500;
}

.data-card-actions {
  display: flex;
  gap: var(--space-sm);
}

.empty-state-cell {
  text-align: center;
  padding: var(--space-xl);
  color: var(--text-caption);
}
</style>
