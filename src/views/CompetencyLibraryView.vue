<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { MoreHorizontal, Plus, Archive, Edit, Eye, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table as IoiTable } from '@ioi-dev/vue-table/unstyled'
import type { ColumnDef, CellSlotProps, SortState, HeaderFilterSlotProps } from '@ioi-dev/vue-table/unstyled'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCompetencyLibraryStore } from '@/stores/competencyLibrary'
import { useReferenceListsStore } from '@/stores/referenceLists'
import { useAuthStore } from '@/stores/auth'
import type { CompetencyLibraryItem } from '@/types'
import CompetencyFormSheet from '@/components/competency/CompetencyFormSheet.vue'

const store = useCompetencyLibraryStore()
const refStore = useReferenceListsStore()
const authStore = useAuthStore()

const canAddCompetency = computed(() => ['QHSE', 'HR_ADMIN', 'ADMIN'].includes(authStore.userRole))

const isFormOpen = ref(false)
const editingCompetency = ref<CompetencyLibraryItem | null>(null)

const COMPETENCY_TYPES = [
  { value: 'SKILL', label: 'Skill' },
  { value: 'TRAINING', label: 'Training' },
  { value: 'CERTIFICATION', label: 'Certification' },
  { value: 'AWARENESS_TOPIC', label: 'Awareness Topic' },
  { value: 'OJT_COACHING', label: 'OJT / Coaching' },
  { value: 'PROCEDURE_BRIEFING', label: 'Procedure Briefing' },
  { value: 'EXTERNAL_QUALIFICATION', label: 'External Qualification' },
  { value: 'EQUIPMENT_QUALIFICATION', label: 'Equipment Qualification' },
]

function typeBadgeClass(type: string | undefined): string {
  switch (type) {
    case 'CERTIFICATION':          return 'badge-primary'
    case 'EXTERNAL_QUALIFICATION': return 'badge-primary'
    case 'EQUIPMENT_QUALIFICATION':return 'badge-warning'
    case 'SKILL':                  return 'badge-success'
    default:                       return 'badge-neutral'
  }
}

function typeBadgeLabel(type: string | undefined): string {
  return COMPETENCY_TYPES.find((t) => t.value === type)?.label ?? type ?? '—'
}

function openAddForm() {
  editingCompetency.value = null
  isFormOpen.value = true
}

function openEditForm(comp: CompetencyLibraryItem) {
  editingCompetency.value = comp
  isFormOpen.value = true
}

function handleSaved() {}

function formatValidity(comp: CompetencyLibraryItem) {
  if (comp.validityInterval) return comp.validityInterval
  if (!comp.defaultRequiresExpiry) return 'No Expiry'
  return comp.defaultValidityDays ? `${comp.defaultValidityDays} days` : 'Required'
}

onMounted(() => {
  if (store.competencies.length === 0) store.fetchCompetencies()
  refStore.fetchAll()
})

// ── Row type ──────────────────────────────────────────────────────────────────
type CompLibRow = {
  id: string
  code: string
  title: string
  typeValue: string
  typeBadgeClass: string
  typeBadgeLabel: string
  category: string
  mandatory: boolean
  safetyCritical: boolean
  assessmentMethod: string
  validity: string
  applicableDepartments: string[]
  _raw: CompetencyLibraryItem
}

const rows = computed<CompLibRow[]>(() =>
  store.competencies
    .map((c) => ({
      id: c.id,
      code: c.code || '-',
      title: c.title,
      typeValue: c.competencyType ?? '',
      typeBadgeClass: typeBadgeClass(c.competencyType),
      typeBadgeLabel: typeBadgeLabel(c.competencyType),
      category: c.category ?? '',
      mandatory: !!c.mandatory,
      safetyCritical: !!c.safetyCritical,
      assessmentMethod: c.assessmentMethod || '—',
      validity: formatValidity(c),
      applicableDepartments: c.applicableDepartments ?? [],
      _raw: c,
    })),
)

// ── Sort ──────────────────────────────────────────────────────────────────────
interface IoiTableRef { setSortState: (s: SortState[]) => void }
const tableRef   = ref<IoiTableRef | null>(null)
const sortStates = ref<SortState[]>([])

function getSortDir(field: string): 'asc' | 'desc' | '' {
  return sortStates.value.find(s => s.field === field)?.direction ?? ''
}

function headerSort(field: string): void {
  if (field === '_actions') return
  const cur = getSortDir(field)
  const next: SortState[] = !cur
    ? [{ field, direction: 'asc' }]
    : cur === 'asc' ? [{ field, direction: 'desc' }] : []
  sortStates.value = next
  tableRef.value?.setSortState(next)
}

const columns: ColumnDef<CompLibRow>[] = [
  { id: 'code',                 field: 'code',                 header: 'Code',               type: 'text', headerFilter: 'text',   width: 90 },
  { id: 'title',                field: 'title',                header: 'Title',              type: 'text', headerFilter: 'text'            },
  { id: 'typeValue',            field: 'typeBadgeLabel',       header: 'Type',               type: 'text', headerFilter: 'select'          },
  { id: 'category',             field: 'category',             header: 'Category',           type: 'text', headerFilter: 'select'          },
  { id: 'flags',                field: 'flags',                header: 'Flags',              type: 'text'                                  },
  { id: 'assessmentMethod',     field: 'assessmentMethod',     header: 'Assessment Method',  type: 'text'                                  },
  { id: 'validity',             field: 'validity',             header: 'Validity',           type: 'text'                                  },
  { id: 'applicableDepartments',field: 'applicableDepartments',header: 'Applicable Depts',   type: 'text'                                  },
  { id: '_actions',             field: '_actions',             header: 'Actions',                                                  width: 72 },
]
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">Competency Library</h1>
    <p class="page-subtitle">
      Controlled library of competence requirements — skills, certifications, qualifications, and
      procedure awareness
    </p>
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
      <div class="table-wrapper">
        <IoiTable
          ref="tableRef"
          :rows="rows"
          :columns="columns"
          row-key="id"
          :page-size="10000"
          aria-label="Competency Library"
        >
          <template #header="{ column }">
            <div
              class="sort-header"
              :class="{
                'sort-header--no-sort': column.id === '_actions',
                'sort-header--right':   column.id === '_actions',
              }"
              @click.stop="headerSort(String(column.field))"
            >
              <span>{{ column.header ?? column.field }}</span>
              <ChevronUp      v-if="getSortDir(String(column.field)) === 'asc'"  class="sort-icon" />
              <ChevronDown    v-else-if="getSortDir(String(column.field)) === 'desc'" class="sort-icon" />
              <ChevronsUpDown v-else-if="column.id !== '_actions'" class="sort-icon sort-icon-inactive" />
            </div>
          </template>

          <template #header-filter="{ column, mode, value, options, setValue }: HeaderFilterSlotProps<CompLibRow>">
            <Select
              v-if="mode === 'select'"
              :model-value="value || '__all__'"
              @update:model-value="(v) => setValue(!v || v === '__all__' ? '' : String(v))"
            >
              <SelectTrigger size="sm" class="table-filter-select" :aria-label="`Filter by ${column.header ?? column.field}`">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All</SelectItem>
                <SelectItem v-for="opt in options" :key="opt" :value="opt">{{ opt }}</SelectItem>
              </SelectContent>
            </Select>
            <Input
              v-else-if="mode === 'text'"
              :model-value="value"
              class="table-filter-input"
              :placeholder="`Filter ${column.header ?? column.field}…`"
              :aria-label="`Filter by ${column.header ?? column.field}`"
              @input="(e: Event) => setValue((e.target as HTMLInputElement).value)"
            />
          </template>

          <template #cell="{ column, row }: CellSlotProps<CompLibRow>">
            <template v-if="column.field === 'code'">
              <span class="code-cell">{{ row.code }}</span>
            </template>

            <template v-else-if="column.field === 'title'">
              <span class="table-name-cell">{{ row.title }}</span>
            </template>

            <template v-else-if="column.field === 'typeBadgeLabel'">
              <span v-if="row.typeValue" class="badge badge-sm" :class="row.typeBadgeClass">
                {{ row.typeBadgeLabel }}
              </span>
              <span v-else class="text-caption">—</span>
            </template>

            <template v-else-if="column.field === 'category'">
              <span class="badge badge-neutral badge-sm">{{ row.category }}</span>
            </template>

            <template v-else-if="column.field === 'flags'">
              <div class="flag-badges">
                <span v-if="row.mandatory"     class="badge badge-primary badge-sm">Mandatory</span>
                <span v-if="row.safetyCritical" class="badge badge-critical badge-sm">Safety Critical</span>
              </div>
            </template>

            <template v-else-if="column.field === 'assessmentMethod'">
              <span class="text-caption-sm">{{ row.assessmentMethod }}</span>
            </template>

            <template v-else-if="column.field === 'validity'">
              <span class="text-caption-sm">{{ row.validity }}</span>
            </template>

            <template v-else-if="column.field === 'applicableDepartments'">
              <div v-if="row.applicableDepartments.length" class="dept-tags">
                <span v-for="dept in row.applicableDepartments.slice(0, 2)" :key="dept" class="badge badge-neutral badge-sm">{{ dept }}</span>
                <span v-if="row.applicableDepartments.length > 2" class="more-tag">+{{ row.applicableDepartments.length - 2 }}</span>
              </div>
              <span v-else class="text-caption">—</span>
            </template>

            <template v-else-if="column.field === '_actions'">
              <div class="cell-right">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="table-action-btn" :aria-label="`Actions for ${row.title}`">
                      <MoreHorizontal class="icon-xs" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem v-if="canAddCompetency" @click="openEditForm(row._raw)">
                      <Edit class="icon-xs icon-mr" /> Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye class="icon-xs icon-mr" /> View Assignments
                    </DropdownMenuItem>
                    <DropdownMenuSeparator v-if="canAddCompetency" />
                    <DropdownMenuItem v-if="canAddCompetency" class="destructive-action">
                      <Archive class="icon-xs icon-mr" /> Archive Item
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </template>

            <template v-else>{{ String(row[column.field as keyof CompLibRow] ?? '') }}</template>
          </template>

          <template #empty>
            <div class="empty-state-cell">No competencies found matching your criteria</div>
          </template>
        </IoiTable>
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
.table-wrapper { overflow-x: auto; }

.sort-header {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  user-select: none;
  width: 100%;
}
.sort-header--no-sort { cursor: default; }
.sort-header--right   { justify-content: flex-end; }
.sort-icon            { width: 12px; height: 12px; flex-shrink: 0; }
.sort-icon-inactive   { opacity: 0.25; }
.cell-right           { display: flex; justify-content: flex-end; width: 100%; }

.code-cell { font-family: var(--font-mono); font-size: 0.75rem; }

.table-name-cell {
  font-weight: 500;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.data-card-actions { display: flex; gap: var(--space-sm); }

.empty-state-cell {
  text-align: center;
  padding: var(--space-xl);
  color: var(--text-caption);
}

.badge-sm { font-size: 0.6875rem; padding: 1px 6px; height: auto; }

.flag-badges { display: flex; flex-wrap: wrap; gap: 3px; }
.dept-tags   { display: flex; flex-wrap: wrap; gap: 3px; }

.more-tag {
  font-size: 0.6875rem;
  color: var(--text-caption);
  display: inline-flex;
  align-items: center;
}

.text-caption    { font-size: 0.75rem; color: var(--text-caption); }
.text-caption-sm { font-size: 0.75rem; color: var(--text-body); }

.icon-xs { width: 14px; height: 14px; }
.icon-mr { margin-right: 0.25rem; }
</style>
