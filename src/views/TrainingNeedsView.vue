<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { 
  MoreHorizontal, Plus, Filter, Search, 
  AlertTriangle, Clock, UserCheck, GraduationCap,
  ChevronRight, Info, CheckCircle2, AlertCircle
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useTrainingNeedsStore } from '@/stores/trainingNeeds'
import { useEmployeesStore } from '@/stores/employees'
import { useCompetencyLibraryStore } from '@/stores/competencyLibrary'
import TrainingNeedDetailsSheet from '@/components/training/TrainingNeedDetailsSheet.vue'

const trainingStore = useTrainingNeedsStore()
const empStore = useEmployeesStore()
const compStore = useCompetencyLibraryStore()

const selectedNeedId = ref<string | null>(null)
const isDetailsOpen = ref(false)

onMounted(async () => {
  await Promise.all([
    trainingStore.fetchTrainingNeeds(),
    empStore.fetchEmployees(),
    empStore.fetchAllReferenceData(),
    compStore.fetchCompetencies()
  ])
})

const openDetails = (id: string) => {
  selectedNeedId.value = id
  isDetailsOpen.value = true
}

const getEmployee = (id: string) => {
  const emp = empStore.employees.find(e => e.id === id)
  if (emp) return emp
  return { 
    id: 'unknown', 
    displayName: 'Unknown', 
    employeeNo: '???', 
    jobTitle: { name: 'Unknown' } 
  } as any
}

const getCompetency = (id: string) => {
  const comp = compStore.competencies.find(c => c.id === id)
  if (comp) return comp
  return { 
    id: 'unknown', 
    title: 'Unknown', 
    code: '???',
    riskLevelCode: 'LOW' 
  } as any
}

const getReasonLabel = (reason?: string) => {
  switch (reason) {
    case 'EXPIRED_RENEWAL': return 'Renewal (Expired)'
    case 'EXPIRING_RENEWAL': return 'Renewal (Expiring)'
    case 'NEW_REQUIREMENT': return 'New Requirement'
    case 'NEW_HIRE': return 'New Hire Onboarding'
    default: return 'System Generated'
  }
}

const getActionRecommendation = (need: any) => {
  const comp = getCompetency(need.employeeCompetenceItemId || '')
  if (need.createdReason === 'NEW_HIRE') return 'Complete Onboarding Assessment'
  if (need.createdReason === 'EXPIRED_RENEWAL') return 'Urgent Renewal / Re-assessment'
  return 'Review evidence or schedule training'
}

const isGating = (need: any) => {
  // In a real app, this would check the RoleRequirement snapshot
  // For demo, we'll assume HIGH_CRITICAL items are gating
  const comp = getCompetency(need.employeeCompetenceItemId || '')
  return comp.riskLevelCode === 'HIGH_CRITICAL'
}

const newHireCount = computed(() => {
  return trainingStore.trainingNeeds.filter(n => n.createdReason === 'NEW_HIRE' && n.status === 'OPEN').length
})
</script>

<template>
  <div class="page-header">
    <div class="header-content">
      <h1 class="page-title">Training Needs & Competence Actions</h1>
      <p class="page-subtitle">Queue of gaps, renewals, and actions required to maintain compliance.</p>
    </div>
    <div class="header-actions">
      <Button variant="outline" size="sm">
        <GraduationCap class="icon-xs" style="margin-right: var(--space-xs)" />
        Bulk Schedule
      </Button>
      <Button size="sm">
        <Plus class="icon-xs" style="margin-right: var(--space-xs)" />
        Create Request
      </Button>
    </div>
  </div>

  <!-- New Hire Banner (Option 2) -->
  <div v-if="newHireCount > 0" class="onboarding-banner">
    <div class="banner-icon">
      <UserCheck class="icon-md" />
    </div>
    <div class="banner-content">
      <span class="banner-title">New Hire Competence Onboarding</span>
      <span class="banner-description">
        There are {{ newHireCount }} new hires requiring certificate uploads or initial assessments.
      </span>
    </div>
    <Button variant="secondary" size="sm">
      Handle Onboarding
    </Button>
  </div>

  <!-- Filters -->
  <Card class="filter-card border-none shadow-none bg-transparent mb-6">
    <div class="filter-toolbar">
      <div class="filter-group">
        <div class="search-wrapper">
          <Search class="search-icon icon-xs" />
          <Input placeholder="Search employee or competency..." class="filter-input-search" v-model="trainingStore.filters.search" />
        </div>
        
        <Select v-model="trainingStore.filters.departmentId">
          <SelectTrigger class="filter-select w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem v-for="dept in empStore.departments" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="trainingStore.filters.priority">
          <SelectTrigger class="filter-select w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="CRITICAL">Critical / Gating</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" size="sm" class="h-9">
          <Filter class="icon-xs mr-2" />
          More Filters
        </Button>
      </div>
    </div>
  </Card>

  <Card class="data-card overflow-hidden">
    <CardContent class="p-0">
      <div class="table-wrapper">
        <Table class="dense-table border-none">
          <TableHeader>
            <TableRow class="bg-muted/30">
              <TableHead class="w-[200px]">Employee</TableHead>
              <TableHead class="w-[240px]">Requirement</TableHead>
              <TableHead class="w-[120px]">Gating</TableHead>
              <TableHead class="w-[140px]">Type & Risk</TableHead>
              <TableHead class="w-[140px]">Reason</TableHead>
              <TableHead>Recommended Action</TableHead>
              <TableHead class="w-[100px]">Due Date</TableHead>
              <TableHead class="table-actions-header">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow 
              v-for="need in trainingStore.trainingNeeds" 
              :key="need.id"
              class="cursor-pointer hover:bg-muted/50 transition-colors"
              @click="openDetails(need.id)"
            >
              <TableCell>
                <div class="table-user">
                  <div class="table-avatar bg-primary/10 text-primary font-medium">
                    {{ getEmployee(need.erpEmployeeId).displayName?.charAt(0) }}
                  </div>
                  <div class="flex flex-col">
                    <span class="font-medium text-foreground">{{ getEmployee(need.erpEmployeeId).displayName }}</span>
                    <span class="text-xs text-muted-foreground">{{ getEmployee(need.erpEmployeeId).jobTitle?.name }}</span>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div class="flex flex-col">
                  <span class="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest leading-none mb-1">
                    {{ getCompetency(need.employeeCompetenceItemId || '').code }}
                  </span>
                  <span class="text-sm font-semibold text-foreground leading-snug">
                    {{ getCompetency(need.employeeCompetenceItemId || '').title }}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div v-if="isGating(need)" class="badge badge-critical text-[9px] py-0.5 px-1.5 uppercase font-bold tracking-wider rounded-sm shadow-sm inline-flex items-center">
                  <AlertTriangle class="w-2.5 h-2.5 mr-1" />
                  Critical
                </div>
                <span v-else class="text-[10px] text-muted-foreground/40 font-medium uppercase tracking-wider ml-2">—</span>
              </TableCell>
              
              <TableCell>
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-1.5">
                    <span class="text-[10px] font-bold bg-muted px-1 rounded text-muted-foreground tracking-tighter">{{ need.trainingTypeCode }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <div 
                      class="w-1.5 h-1.5 rounded-full" 
                      :class="getCompetency(need.employeeCompetenceItemId || '').riskLevelCode === 'HIGH_CRITICAL' ? 'bg-destructive' : 'bg-warning'"
                    ></div>
                    <span class="text-[11px] font-medium text-muted-foreground">{{ getCompetency(need.employeeCompetenceItemId || '').riskLevelCode }}</span>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div class="flex items-center gap-1">
                  <Clock v-if="need.createdReason === 'EXPIRING_RENEWAL'" class="icon-xs text-warning" />
                  <AlertTriangle v-if="need.createdReason === 'EXPIRED_RENEWAL'" class="icon-xs text-destructive" />
                  <span class="text-sm">{{ getReasonLabel(need.createdReason) }}</span>
                </div>
              </TableCell>

              <TableCell>
                <span class="text-sm font-medium text-primary/80 italic">
                  {{ getActionRecommendation(need) }}
                </span>
              </TableCell>

              <TableCell>
                <div class="flex flex-col">
                  <span class="text-sm">{{ new Date(need.dueDate || '').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) }}</span>
                  <span v-if="new Date(need.dueDate || '') < new Date()" class="text-[10px] text-destructive font-bold uppercase">Overdue</span>
                </div>
              </TableCell>

              <TableCell class="table-actions-cell" @click.stop>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="table-action-btn">
                      <MoreHorizontal class="icon-xs" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-48">
                    <DropdownMenuItem @click="openDetails(need.id)">
                      <ChevronRight class="icon-xs mr-2" />
                      Resolve...
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserCheck class="icon-xs mr-2" />
                      Assign to Me
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="text-destructive">
                      <AlertCircle class="icon-xs mr-2" />
                      Escalate
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

  <TrainingNeedDetailsSheet 
    :isOpen="isDetailsOpen" 
    :needId="selectedNeedId" 
    @update:isOpen="isDetailsOpen = $event"
  />
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-xl);
}

.onboarding-banner {
  background-color: var(--primary-light);
  border: 1px solid var(--primary-border);
  border-radius: var(--radius-lg);
  padding: var(--space-md) var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.banner-icon {
  width: 40px;
  height: 40px;
  background-color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.banner-content {
  flex: 1;
}

.banner-title {
  display: block;
  font-weight: 600;
  color: var(--primary-dark);
  font-size: var(--font-size-md);
}

.banner-description {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.filter-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  width: 300px;
}

.search-icon {
  position: absolute;
  left: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.filter-input-search {
  padding-left: calc(var(--space-md) * 2.5);
  height: 36px;
  background-color: white;
}

.filter-select {
  height: 36px;
  background-color: white;
}

.badge-critical {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fee2e2;
}

.dense-table :deep(td) {
  padding-top: var(--space-md);
  padding-bottom: var(--space-md);
}

.table-user .table-avatar {
  width: 32px;
  height: 32px;
  font-size: 0.75rem;
}

.letter-spacing-wider {
  letter-spacing: 0.05em;
}
</style>
