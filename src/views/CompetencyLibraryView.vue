<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { MoreHorizontal, Plus, Search, Archive, Edit, Eye } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useCompetencyLibraryStore } from '@/stores/competencyLibrary'
import { useReferenceListsStore } from '@/stores/referenceLists'
import { useAuthStore } from '@/stores/auth'
import type { CompetencyLibraryItem } from '@/types'
import CompetencyFormSheet from '@/components/competency/CompetencyFormSheet.vue'

const store = useCompetencyLibraryStore()
const refStore = useReferenceListsStore()
const authStore = useAuthStore()

const canAddCompetency = computed(() =>
  ['QHSE', 'HR_ADMIN', 'ADMIN'].includes(authStore.userRole)
)

const search = ref('')
const typeFilter = ref('all')
const categoryFilter = ref('all')
const mandatoryOnly = ref(false)
const safetyCriticalOnly = ref(false)
const deptFilter = ref('all')

const isFormOpen = ref(false)
const editingCompetency = ref<CompetencyLibraryItem | null>(null)

const COMPETENCY_TYPES = [
  { value: 'SKILL',                      label: 'Skill' },
  { value: 'TRAINING',                   label: 'Training' },
  { value: 'CERTIFICATION',              label: 'Certification' },
  { value: 'AWARENESS_TOPIC',            label: 'Awareness Topic' },
  { value: 'OJT_COACHING',              label: 'OJT / Coaching' },
  { value: 'PROCEDURE_BRIEFING',         label: 'Procedure Briefing' },
  { value: 'EXTERNAL_QUALIFICATION',     label: 'External Qualification' },
  { value: 'EQUIPMENT_QUALIFICATION',    label: 'Equipment Qualification' },
]

const CATEGORIES = [
  'Mandatory',
  'Additive Manufacturing Operations',
  'Welding & Fabrication',
  'Robotics & Automation',
  'Materials & Powder Handling',
  'Materials Testing & Inspection',
  'Quality & Compliance',
  'HSE / Workshop Safety',
  'Equipment-Specific Qualification',
  'Technical',
]

const ALL_DEPARTMENTS = [
  'Additive Manufacturing',
  'Welding & Fabrication',
  'Robotics & Automation',
  'Quality Assurance',
  'Materials Testing',
  'Maintenance',
  'QHSE',
  'HR',
  'Logistics',
]

const filteredCompetencies = computed(() => {
  return store.competencies.filter(c => {
    const matchesSearch = !search.value ||
      c.title.toLowerCase().includes(search.value.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.value.toLowerCase())

    const matchesType = typeFilter.value === 'all' || c.competencyType === typeFilter.value

    const matchesCategory = categoryFilter.value === 'all' || c.category === categoryFilter.value

    const matchesMandatory = !mandatoryOnly.value || c.mandatory === true

    const matchesSafety = !safetyCriticalOnly.value || c.safetyCritical === true

    const matchesDept = deptFilter.value === 'all' ||
      !c.applicableDepartments ||
      c.applicableDepartments.some(d =>
        d.toLowerCase() === deptFilter.value.toLowerCase() || d === 'All'
      )

    return matchesSearch && matchesType && matchesCategory && matchesMandatory && matchesSafety && matchesDept
  })
})

function typeBadgeClass(type: string | undefined): string {
  switch (type) {
    case 'CERTIFICATION':           return 'badge-primary'
    case 'EXTERNAL_QUALIFICATION':  return 'badge-primary'
    case 'EQUIPMENT_QUALIFICATION': return 'badge-warning'
    case 'SKILL':                   return 'badge-success'
    case 'TRAINING':                return 'badge-neutral'
    case 'OJT_COACHING':           return 'badge-neutral'
    case 'AWARENESS_TOPIC':         return 'badge-neutral'
    case 'PROCEDURE_BRIEFING':      return 'badge-neutral'
    default:                        return 'badge-neutral'
  }
}

function typeBadgeLabel(type: string | undefined): string {
  return COMPETENCY_TYPES.find(t => t.value === type)?.label ?? (type ?? '—')
}

function openAddForm() {
  editingCompetency.value = null
  isFormOpen.value = true
}

function openEditForm(comp: CompetencyLibraryItem) {
  editingCompetency.value = comp
  isFormOpen.value = true
}

function handleSaved() {
  // store reactivity handles refresh
}

function getRiskLevelName(code: string) {
  return refStore.riskLevelByCode(code)?.name || code
}

function formatValidity(comp: CompetencyLibraryItem) {
  if (comp.validityInterval) return comp.validityInterval
  if (!comp.defaultRequiresExpiry) return 'No Expiry'
  return comp.defaultValidityDays ? `${comp.defaultValidityDays} days` : 'Required'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleTypeChange(value: any) {
  typeFilter.value = value ?? 'all'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleCategoryChange(value: any) {
  categoryFilter.value = value ?? 'all'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleDeptChange(value: any) {
  deptFilter.value = value ?? 'all'
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
        <Button v-if="canAddCompetency" size="sm" @click="openAddForm">
          <Plus class="icon-xs icon-mr" />
          Add Competency
        </Button>
      </div>
    </CardHeader>
    <CardContent class="data-card-content">

      <!-- Filter bar -->
      <div class="filter-bar">
        <div class="search-input-wrapper">
          <Search class="search-input-icon" />
          <Input
            v-model="search"
            class="global-search"
            placeholder="Search code or title..."
            style="padding-left: 2.25rem"
          />
        </div>

        <Select :model-value="typeFilter" @update:model-value="handleTypeChange">
          <SelectTrigger class="filter-select">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem v-for="t in COMPETENCY_TYPES" :key="t.value" :value="t.value">
              {{ t.label }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select :model-value="categoryFilter" @update:model-value="handleCategoryChange">
          <SelectTrigger class="filter-select">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem v-for="cat in CATEGORIES" :key="cat" :value="cat">
              {{ cat }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select :model-value="deptFilter" @update:model-value="handleDeptChange">
          <SelectTrigger class="filter-select">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem v-for="dept in ALL_DEPARTMENTS" :key="dept" :value="dept">
              {{ dept }}
            </SelectItem>
          </SelectContent>
        </Select>

        <div class="filter-toggle">
          <Switch id="mandatory-switch" v-model:checked="mandatoryOnly" />
          <Label for="mandatory-switch" class="filter-toggle-label">Mandatory only</Label>
        </div>

        <div class="filter-toggle">
          <Switch id="safety-switch" v-model:checked="safetyCriticalOnly" />
          <Label for="safety-switch" class="filter-toggle-label">Safety-critical only</Label>
        </div>
      </div>

      <div class="results-count">
        Showing {{ filteredCompetencies.length }} of {{ store.competencies.length }} items
      </div>

      <div class="table-wrapper">
        <Table class="dense-table">
          <TableHeader>
            <TableRow>
              <TableHead style="width: 90px">Code</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead>Assessment Method</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Applicable Depts</TableHead>
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
                <span v-if="comp.competencyType" class="badge badge-sm" :class="typeBadgeClass(comp.competencyType)">
                  {{ typeBadgeLabel(comp.competencyType) }}
                </span>
                <span v-else class="text-caption">—</span>
              </TableCell>
              <TableCell>
                <span class="badge badge-neutral badge-sm">{{ comp.category }}</span>
              </TableCell>
              <TableCell>
                <div class="flag-badges">
                  <span v-if="comp.mandatory" class="badge badge-primary badge-sm">Mandatory</span>
                  <span v-if="comp.safetyCritical" class="badge badge-critical badge-sm">Safety Critical</span>
                </div>
              </TableCell>
              <TableCell class="text-caption-sm">
                {{ comp.assessmentMethod || '—' }}
              </TableCell>
              <TableCell class="text-caption-sm">
                {{ formatValidity(comp) }}
              </TableCell>
              <TableCell>
                <div v-if="comp.applicableDepartments && comp.applicableDepartments.length" class="dept-tags">
                  <span
                    v-for="dept in comp.applicableDepartments.slice(0, 2)"
                    :key="dept"
                    class="badge badge-neutral badge-sm"
                  >{{ dept }}</span>
                  <span v-if="comp.applicableDepartments.length > 2" class="more-tag">
                    +{{ comp.applicableDepartments.length - 2 }}
                  </span>
                </div>
                <span v-else class="text-caption">—</span>
              </TableCell>
              <TableCell class="table-actions-cell">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="table-action-btn" :aria-label="`Actions for ${comp.title}`">
                      <MoreHorizontal class="icon-xs" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem v-if="canAddCompetency" @click="openEditForm(comp)">
                      <Edit class="icon-xs icon-mr" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye class="icon-xs icon-mr" />
                      View Assignments
                    </DropdownMenuItem>
                    <DropdownMenuSeparator v-if="canAddCompetency" />
                    <DropdownMenuItem v-if="canAddCompetency" class="destructive-action">
                      <Archive class="icon-xs icon-mr" />
                      Archive Item
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            <TableRow v-if="filteredCompetencies.length === 0">
              <TableCell colspan="9" class="empty-state-cell">
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
  max-width: 220px;
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

/* Filter bar */
.filter-bar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  border-bottom: var(--border-subtle);
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-icon {
  position: absolute;
  left: var(--space-sm);
  width: 16px;
  height: 16px;
  color: var(--text-caption);
  pointer-events: none;
}

.global-search {
  width: 220px;
}

.filter-select {
  width: 160px;
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.filter-toggle-label {
  font-size: 0.8125rem;
  color: var(--text-body);
  white-space: nowrap;
  cursor: pointer;
}

.results-count {
  font-size: 0.75rem;
  color: var(--text-caption);
  padding: var(--space-xs) var(--space-md);
}

/* Badge overrides */
.badge-sm {
  font-size: 0.6875rem;
  padding: 1px 6px;
  height: auto;
}

.flag-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.dept-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.more-tag {
  font-size: 0.6875rem;
  color: var(--text-caption);
  display: inline-flex;
  align-items: center;
}

.text-caption {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.text-caption-sm {
  font-size: 0.75rem;
  color: var(--text-body);
}

.icon-xs {
  width: 14px;
  height: 14px;
}

.icon-mr {
  margin-right: 0.25rem;
}
</style>
