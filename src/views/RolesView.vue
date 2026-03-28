<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  ShieldAlert,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useSkillsMatrixStore } from '@/stores/skillsMatrix'
import { useEmployeesStore } from '@/stores/employees'
import roleRequirementsData from '@/data/roleRequirements.json'
import {
  DEMO_DEPARTMENTS,
  DEMO_ROLES,
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
const DEPARTMENTS = DEMO_DEPARTMENTS

const matrixStore = useSkillsMatrixStore()
const employeesStore = useEmployeesStore()
const router = useRouter()

const search = ref('')
const filterDept = ref('All')
const filterCriticalOnly = ref(false)
const filterOpenGaps = ref(false)
const filterExpiringMandatory = ref(false)

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

interface RoleStats {
  name: string
  department: string
  assigned: number
  fullyCompliant: number
  withGaps: number
  underSupervision: number
  expiringItems: number
  risk: RiskLevel
  id: string
}

const roleStats = computed((): RoleStats[] => {
  return DEMO_ROLES.map((role) => {
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
        name: role.name,
        department: role.department,
        assigned,
        fullyCompliant,
        withGaps,
        underSupervision,
        expiringItems,
        risk,
        id: encodeURIComponent(role.name),
      }
    })
})

const filteredRoles = computed(() => {
  return roleStats.value.filter((r) => {
    if (search.value) {
      const s = search.value.toLowerCase()
      if (
        !r.name.toLowerCase().includes(s) &&
        !r.department.toLowerCase().includes(s)
      )
        return false
    }
    if (filterDept.value && filterDept.value !== 'All') {
      if (r.department !== filterDept.value) return false
    }
    if (filterCriticalOnly.value) {
      if (r.risk !== 'Critical' && r.risk !== 'High') return false
    }
    if (filterOpenGaps.value) {
      if (r.withGaps === 0) return false
    }
    if (filterExpiringMandatory.value) {
      if (r.expiringItems === 0) return false
    }
    return true
  })
})

function riskClass(risk: RiskLevel) {
  switch (risk) {
    case 'Critical':
      return 'badge-critical'
    case 'High':
      return 'badge-high'
    case 'Moderate':
      return 'badge-warning'
    default:
      return 'badge-neutral'
  }
}

function navigateToRole(id: string) {
  router.push(`/roles/${id}`)
}
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
      <div class="filter-bar">
        <div class="filter-bar-left">
          <div class="search-input-wrapper">
            <Search class="search-input-icon" />
            <Input
              v-model="search"
              class="global-search"
              placeholder="Search roles..."
              style="padding-left: 2.25rem; min-width: 200px"
            />
          </div>

          <div class="filter-select-wrap">
            <Filter class="filter-icon" />
            <Select v-model="filterDept">
              <SelectTrigger class="dept-select" aria-label="Filter by department">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="d in DEPARTMENTS" :key="d" :value="d">{{
                  d
                }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="filter-toggles">
          <div class="filter-toggle-item">
            <Switch
              id="filter-critical"
              v-model:checked="filterCriticalOnly"
              aria-label="Show critical roles only"
            />
            <Label for="filter-critical" class="toggle-label">
              <ShieldAlert class="icon-xxs" />
              Critical roles only
            </Label>
          </div>
          <div class="filter-toggle-item">
            <Switch
              id="filter-gaps"
              v-model:checked="filterOpenGaps"
              aria-label="Show roles with open gaps"
            />
            <Label for="filter-gaps" class="toggle-label">
              <AlertTriangle class="icon-xxs" />
              Roles with open gaps
            </Label>
          </div>
          <div class="filter-toggle-item">
            <Switch
              id="filter-expiring"
              v-model:checked="filterExpiringMandatory"
              aria-label="Show roles with expiring mandatory items"
            />
            <Label for="filter-expiring" class="toggle-label">
              <Clock class="icon-xxs" />
              Expiring mandatory items
            </Label>
          </div>
        </div>
      </div>

      <div class="table-wrapper">
        <Table class="dense-table">
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead class="col-center">
                <span class="col-header-icon"
                  ><Users class="icon-xxs" /> Assigned</span
                >
              </TableHead>
              <TableHead class="col-center">
                <span class="col-header-icon"
                  ><CheckCircle2 class="icon-xxs" /> Compliant</span
                >
              </TableHead>
              <TableHead class="col-center">
                <span class="col-header-icon"
                  ><AlertTriangle class="icon-xxs" /> With Gaps</span
                >
              </TableHead>
              <TableHead class="col-center">Under Supervision</TableHead>
              <TableHead class="col-center">
                <span class="col-header-icon"
                  ><Clock class="icon-xxs" /> Expiring</span
                >
              </TableHead>
              <TableHead class="col-center">Risk</TableHead>
              <TableHead class="table-actions-header">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="role in filteredRoles" :key="role.id">
              <TableCell class="table-name-cell">{{ role.name }}</TableCell>
              <TableCell>
                <span class="dept-badge">{{ role.department }}</span>
              </TableCell>
              <TableCell class="col-center">
                <span class="stat-count">{{ role.assigned }}</span>
              </TableCell>
              <TableCell class="col-center">
                <span
                  v-if="role.assigned > 0"
                  class="stat-count stat-good"
                  >{{ role.fullyCompliant }}</span
                >
                <span v-else class="empty-value">—</span>
              </TableCell>
              <TableCell class="col-center">
                <span
                  v-if="role.withGaps > 0"
                  class="stat-count stat-warn"
                  >{{ role.withGaps }}</span
                >
                <span
                  v-else-if="role.assigned > 0"
                  class="stat-count stat-good"
                  >0</span
                >
                <span v-else class="empty-value">—</span>
              </TableCell>
              <TableCell class="col-center">
                <span
                  v-if="role.underSupervision > 0"
                  class="stat-count stat-info"
                  >{{ role.underSupervision }}</span
                >
                <span v-else-if="role.assigned > 0" class="empty-value"
                  >0</span
                >
                <span v-else class="empty-value">—</span>
              </TableCell>
              <TableCell class="col-center">
                <span
                  v-if="role.expiringItems > 0"
                  class="stat-count stat-warn"
                  >{{ role.expiringItems }}</span
                >
                <span v-else-if="role.assigned > 0" class="empty-value"
                  >0</span
                >
                <span v-else class="empty-value">—</span>
              </TableCell>
              <TableCell class="col-center">
                <span class="badge" :class="riskClass(role.risk)">{{
                  role.risk
                }}</span>
              </TableCell>
              <TableCell class="table-actions-cell">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="table-action-btn"
                      :aria-label="`Actions for ${role.name}`"
                    >
                      <MoreHorizontal class="icon-xs" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="navigateToRole(role.id)">
                      <Eye class="icon-xs icon-mr" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pencil class="icon-xs icon-mr" />
                      Edit Requirements
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            <TableRow v-if="filteredRoles.length === 0">
              <TableCell colspan="9" class="empty-state">
                No roles match the current filters.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <p class="table-footer-note">
        {{ filteredRoles.length }} role{{
          filteredRoles.length !== 1 ? 's' : ''
        }}
        shown. Risk is computed from competency gap rates across assigned
        employees.
      </p>
    </CardContent>
  </Card>
</template>

<style scoped>
.filter-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.filter-bar-left {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.filter-select-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.filter-icon {
  width: 14px;
  height: 14px;
  color: var(--text-caption);
  flex-shrink: 0;
}

.dept-select {
  min-width: 200px;
}

.filter-toggles {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.filter-toggle-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8125rem;
  color: var(--text-body);
  cursor: pointer;
  user-select: none;
}

.table-wrapper {
  overflow-x: auto;
}

.table-name-cell {
  font-weight: 500;
}

.col-center {
  text-align: center;
}

.col-header-icon {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

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

.stat-good {
  color: var(--brand-success);
}

.stat-warn {
  color: var(--brand-warning);
}

.stat-info {
  color: var(--brand-primary);
}

.empty-value {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.badge-critical {
  background-color: oklch(0.5 0.2 25 / 0.15);
  color: oklch(0.45 0.2 25);
  border: 1px solid oklch(0.5 0.2 25 / 0.3);
}

.badge-high {
  background-color: oklch(0.65 0.18 50 / 0.15);
  color: oklch(0.5 0.18 50);
  border: 1px solid oklch(0.65 0.18 50 / 0.3);
}

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

.icon-xxs {
  width: 12px;
  height: 12px;
}

.icon-xs {
  width: 14px;
  height: 14px;
}

.icon-mr {
  margin-right: 0.25rem;
}
</style>
