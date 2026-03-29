<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  MoreHorizontal,
  Eye,
  Pencil,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table as IoiTable } from '@ioi-dev/vue-table/unstyled'
import type { ColumnDef, CellSlotProps, SortState, HeaderFilterSlotProps } from '@ioi-dev/vue-table/unstyled'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useSkillsMatrixStore } from '@/stores/skillsMatrix'
import { useEmployeesStore } from '@/stores/employees'
import roleRequirementsData from '@/data/roleRequirements.json'
import {
  VISIBLE_DEMO_ROLES,
  matchRoleName,
  normalizeRoleName,
} from '@/lib/demoDomain'

type RoleRequirementsJson = Record<
  string,
  {
    setId: string
    gatingCompetencyIds: string[]
    requirements: Array<{
      competencyLibraryItemId: string
      isGating: boolean
      mandatory: boolean
      riskLevelCode: string
    }>
  }
>

const requirementsJson = roleRequirementsData as RoleRequirementsJson

const matrixStore = useSkillsMatrixStore()
const employeesStore = useEmployeesStore()
const router = useRouter()

onMounted(async () => {
  try {
    await employeesStore.fetchEmployees()
    if (employeesStore.allEmployees.length > 0) {
      await matrixStore.fetchAndBuildMatrix(employeesStore.allEmployees)
    }
  } catch (error) {
    console.error('Failed to load roles data', error)
  }
})

type RiskLevel = 'Critical' | 'High' | 'Moderate' | 'Low'

function computeRisk(roleName: string): RiskLevel {
  const normalizedRole = normalizeRoleName(roleName)
  const req = requirementsJson[normalizedRole]
  if (!req) return 'Low'

  const employees = matrixStore.mockEmployeeRows.filter(
    (e) => matchRoleName(e.jobTitle, normalizedRole),
  )
  const total = employees.length
  if (total === 0) return 'Low'

  for (const r of req.requirements) {
    const compId = r.competencyLibraryItemId
    const gapCount = employees.filter((emp) => {
      const item = emp.competenceItems.get(compId)
      return item && (item.derivedStatus === 'EXPIRED' || item.derivedStatus === 'REQUIRED')
    }).length
    const gapRate = gapCount / total

    if (gapRate > 0.25) {
      const comp = matrixStore.competencies.find((c) => c.id === compId)
      if (!comp) continue

      if (comp.criticalityDomain === 'Safety Critical') return 'Critical'
      if (r.isGating) return 'High'
      if (r.mandatory) return 'Moderate'
    }
  }
  return 'Low'
}

type RolesRow = {
  id: string
  name: string
  department: string
  assigned: number
  fullyCompliant: number
  withGaps: number
  underSupervision: number
  expiringItems: number
  risk: string
  riskBadgeClass: string
}

function riskClass(risk: RiskLevel) {
  switch (risk) {
    case 'Critical': return 'badge-critical'
    case 'High': return 'badge-high'
    case 'Moderate': return 'badge-warning'
    default: return 'badge-neutral'
  }
}

function navigateToRole(id: string) {
  router.push(`/roles/${id}`)
}

const roleStats = computed((): RolesRow[] => {
  return VISIBLE_DEMO_ROLES.map((role) => {
    const employees = matrixStore.mockEmployeeRows.filter(
      (e) => matchRoleName(e.jobTitle, role.name),
    )
    const assigned = employees.length
    const fullyCompliant = employees.filter((e) => e.isAuthorised).length
    const withGaps = employees.filter((e) => e.expiredCount > 0 || e.requiredCount > 0).length
    const underSupervision = employees.filter(
      (e) => e.supervisionStatus === 'SUPERVISED_ONLY',
    ).length
    const expiringItems = employees.filter((e) => e.expiringCount > 0).length
    const risk = computeRisk(role.name)

    return {
      id: encodeURIComponent(role.name),
      name: role.name,
      department: role.department,
      assigned,
      fullyCompliant,
      withGaps,
      underSupervision,
      expiringItems,
      risk,
      riskBadgeClass: riskClass(risk),
    }
  })
})

const rows = computed<RolesRow[]>(() => roleStats.value)

// Table sort
interface IoiTableRef { setSortState: (s: SortState[]) => void }
const tableRef = ref<IoiTableRef | null>(null)
const sortStates = ref<SortState[]>([])

function getSortDir(field: string): 'asc' | 'desc' | '' {
  return sortStates.value.find(s => s.field === field)?.direction ?? ''
}

function headerSort(field: string): void {
  if (field === '_actions') return
  const cur = getSortDir(field)
  const next: SortState[] = !cur
    ? [{ field, direction: 'asc' }]
    : cur === 'asc'
      ? [{ field, direction: 'desc' }]
      : []
  sortStates.value = next
  tableRef.value?.setSortState(next)
}

const columns: ColumnDef<RolesRow>[] = [
  { id: 'name',            field: 'name',            header: 'Role Name',        type: 'text',   headerFilter: 'text'            },
  { id: 'department',      field: 'department',      header: 'Department',       type: 'text',   headerFilter: 'select'          },
  { id: 'assigned',        field: 'assigned',        header: 'Assigned',         type: 'number',                         width: 100 },
  { id: 'fullyCompliant',  field: 'fullyCompliant',  header: 'Compliant',        type: 'number',                         width: 110 },
  { id: 'withGaps',        field: 'withGaps',        header: 'With Gaps',        type: 'number',                         width: 110 },
  { id: 'underSupervision',field: 'underSupervision',header: 'Under Supervision',type: 'number',                         width: 150 },
  { id: 'expiringItems',   field: 'expiringItems',   header: 'Expiring',         type: 'number',                         width: 100 },
  { id: 'risk',            field: 'risk',            header: 'Risk',             type: 'text',   headerFilter: 'select', width: 100 },
  { id: '_actions',        field: '_actions',        header: 'Actions',                                                  width: 72  },
]
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">Roles</h1>
    <p class="page-subtitle">
      Job title competence profiles — readiness, risk, and team status
    </p>
  </div>

  <Card class="data-card">
    <CardHeader class="data-card-header">
      <CardTitle class="data-card-title">Role Readiness Overview</CardTitle>
    </CardHeader>
    <CardContent class="data-card-content">
      <div class="table-wrapper">
        <IoiTable
          ref="tableRef"
          :rows="rows"
          :columns="columns"
          row-key="id"
          :page-size="10000"
          aria-label="Role Readiness Overview"
        >
          <template #header="{ column }">
            <div
              class="sort-header"
              :class="{
                'sort-header--no-sort': column.id === '_actions',
                'sort-header--center': column.type === 'number',
                'sort-header--right': column.id === '_actions',
              }"
              @click.stop="headerSort(String(column.field))"
            >
              <span>{{ column.header ?? column.field }}</span>
              <ChevronUp    v-if="getSortDir(String(column.field)) === 'asc'"  class="sort-icon" />
              <ChevronDown  v-else-if="getSortDir(String(column.field)) === 'desc'" class="sort-icon" />
              <ChevronsUpDown v-else-if="column.id !== '_actions'" class="sort-icon sort-icon-inactive" />
            </div>
          </template>

          <template #header-filter="{ column, mode, value, options, setValue }: HeaderFilterSlotProps<RolesRow>">
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

          <template #cell="{ column, row }: CellSlotProps<RolesRow>">
            <template v-if="column.field === 'name'">
              <span class="table-name-cell">{{ row.name }}</span>
            </template>

            <template v-else-if="column.field === 'department'">
              <span class="dept-badge">{{ row.department }}</span>
            </template>

            <template v-else-if="column.field === 'assigned'">
              <div class="cell-center">
                <span class="stat-count">{{ row.assigned }}</span>
              </div>
            </template>

            <template v-else-if="column.field === 'fullyCompliant'">
              <div class="cell-center">
                <span v-if="row.assigned > 0" class="stat-count stat-good">{{ row.fullyCompliant }}</span>
                <span v-else class="empty-value">—</span>
              </div>
            </template>

            <template v-else-if="column.field === 'withGaps'">
              <div class="cell-center">
                <span v-if="row.withGaps > 0" class="stat-count stat-warn">{{ row.withGaps }}</span>
                <span v-else-if="row.assigned > 0" class="stat-count stat-good">0</span>
                <span v-else class="empty-value">—</span>
              </div>
            </template>

            <template v-else-if="column.field === 'underSupervision'">
              <div class="cell-center">
                <span v-if="row.underSupervision > 0" class="stat-count stat-info">{{ row.underSupervision }}</span>
                <span v-else-if="row.assigned > 0" class="empty-value">0</span>
                <span v-else class="empty-value">—</span>
              </div>
            </template>

            <template v-else-if="column.field === 'expiringItems'">
              <div class="cell-center">
                <span v-if="row.expiringItems > 0" class="stat-count stat-warn">{{ row.expiringItems }}</span>
                <span v-else-if="row.assigned > 0" class="empty-value">0</span>
                <span v-else class="empty-value">—</span>
              </div>
            </template>

            <template v-else-if="column.field === 'risk'">
              <div class="cell-center">
                <span class="badge" :class="row.riskBadgeClass">{{ row.risk }}</span>
              </div>
            </template>

            <template v-else-if="column.field === '_actions'">
              <div class="cell-right">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="table-action-btn" :aria-label="`Actions for ${row.name}`">
                      <MoreHorizontal class="icon-xs" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="navigateToRole(row.id)">
                      <Eye class="icon-xs icon-mr" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pencil class="icon-xs icon-mr" /> Edit Requirements
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </template>

            <template v-else>{{ String(row[column.field as keyof RolesRow] ?? '') }}</template>
          </template>

          <template #empty>
            <div class="empty-state">No roles match the current filters.</div>
          </template>
        </IoiTable>
      </div>

      <p class="table-footer-note">
        {{ rows.length }} role{{ rows.length !== 1 ? 's' : '' }} shown.
        Risk is computed from competency gap rates across assigned employees.
      </p>
    </CardContent>
  </Card>
</template>

<style scoped>
.table-wrapper {
  overflow-x: auto;
}

.sort-header {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  user-select: none;
  width: 100%;
}

.sort-header--no-sort { cursor: default; }
.sort-header--center  { justify-content: center; }
.sort-header--right   { justify-content: flex-end; }

.sort-icon { width: 12px; height: 12px; flex-shrink: 0; }
.sort-icon-inactive { opacity: 0.25; }

.cell-center { display: flex; justify-content: center; width: 100%; }
.cell-right  { display: flex; justify-content: flex-end; width: 100%; }

.table-name-cell { font-weight: 500; }

.dept-badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  color: var(--text-caption);
  white-space: nowrap;
}

.stat-count {
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-block;
  min-width: 24px;
  text-align: center;
}

.stat-good  { color: var(--brand-success); }
.stat-warn  { color: var(--brand-warning); }
.stat-info  { color: var(--brand-primary); }

.empty-value {
  font-size: 0.75rem;
  color: var(--text-caption);
}

/* badge-critical and badge-high are defined globally in main.css */

.table-footer-note {
  font-size: 0.75rem;
  color: var(--text-caption);
  margin-top: var(--space-sm);
  text-align: right;
}

.empty-state {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--text-caption);
  font-style: italic;
}

.icon-xxs { width: 12px; height: 12px; }
.icon-xs  { width: 14px; height: 14px; }
.icon-mr  { margin-right: 0.25rem; }
</style>
