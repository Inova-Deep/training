<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { FileText, ShieldAlert, User } from 'lucide-vue-next'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useSkillsMatrixStore, type SupervisionStatus } from '@/stores/skillsMatrix'
import { useAuthStore } from '@/stores/auth'
import type { Employee } from '@/api/client'

type PersonSheetTab = 'profile' | 'competencies' | 'training-history'

const props = defineProps<{
  open: boolean
  employee: Employee | null
  initialTab?: PersonSheetTab
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const matrixStore = useSkillsMatrixStore()
const authStore = useAuthStore()

const activeTab = ref<PersonSheetTab>('profile')

const canTakeAction = computed(() =>
  ['MANAGER', 'HR_ADMIN', 'ADMIN'].includes(authStore.userRole),
)

const matrixRow = computed(() =>
  props.employee ? (matrixStore.getEmployeeById(props.employee.id) ?? null) : null,
)

const statusMap: Record<SupervisionStatus, { label: string; badgeClass: string }> = {
  FIT_FOR_INDEPENDENT_WORK: { label: 'Independent', badgeClass: 'badge-success' },
  SUPERVISED_ONLY: { label: 'Supervised', badgeClass: 'badge-warning' },
  RESTRICTED_SCOPE: { label: 'Restricted Scope', badgeClass: 'badge-warning' },
  REASSESSMENT_REQUIRED: { label: 'Reassessment Due', badgeClass: 'badge-warning' },
  NON_COMPLIANT_MANDATORY: { label: 'Non-Compliant', badgeClass: 'badge-critical' },
}

const workStatusInfo = computed(() => {
  if (!matrixRow.value) return null
  return statusMap[matrixRow.value.supervisionStatus]
})

const showRestrictionsBanner = computed(() => {
  if (!matrixRow.value) return false
  return (
    matrixRow.value.supervisionStatus === 'SUPERVISED_ONLY' ||
    matrixRow.value.supervisionStatus === 'RESTRICTED_SCOPE' ||
    matrixRow.value.supervisionStatus === 'NON_COMPLIANT_MANDATORY'
  )
})

const restrictionItems = computed(() => matrixRow.value?.gatingFailed ?? [])

function changeSupervisionStatus() {
  const statuses: SupervisionStatus[] = [
    'FIT_FOR_INDEPENDENT_WORK',
    'SUPERVISED_ONLY',
    'RESTRICTED_SCOPE',
  ]
  if (!matrixRow.value) return
  const currentIndex = statuses.indexOf(matrixRow.value.supervisionStatus as SupervisionStatus)
  const next = statuses[(currentIndex + 1) % statuses.length]!
  const labels: Record<string, string> = {
    FIT_FOR_INDEPENDENT_WORK: 'Independent',
    SUPERVISED_ONLY: 'Supervised Only',
    RESTRICTED_SCOPE: 'Restricted Scope',
  }
  toast.success(`Supervision status updated to ${labels[next] ?? next}`)
}

function recordEvidence() {
  toast.success('Evidence upload submitted for review')
}

function formatName(emp: Employee): string {
  return emp.displayName || `${emp.firstName} ${emp.lastName}`
}

watch(
  () => [props.employee?.id, props.initialTab] as const,
  ([, initialTab]) => {
    activeTab.value = initialTab ?? 'profile'
  },
  { immediate: true },
)
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent class="person-drawer">
      <SheetHeader>
        <SheetTitle class="visually-hidden">Employee Workspace</SheetTitle>
        <SheetDescription class="visually-hidden">
          Summary workspace for the selected employee
        </SheetDescription>
      </SheetHeader>

      <div v-if="!employee" class="drawer-empty">Select an employee to view their profile.</div>

      <Tabs v-else v-model="activeTab" class="drawer-body">
        <div class="drawer-top">
          <div class="person-header-section">
            <div class="person-avatar-block">
              <div class="person-avatar-lg">
                {{ employee.firstName.charAt(0) }}{{ employee.lastName.charAt(0) }}
              </div>
              <div class="person-meta">
                <h2 class="person-name">{{ formatName(employee) }}</h2>
                <p class="person-sub">{{ employee.jobTitle?.name || '—' }}</p>
                <p class="person-sub muted">
                  {{ employee.department?.name || '—' }} · {{ employee.businessUnit?.name || '—' }}
                </p>
                <p v-if="employee.manager" class="person-sub muted">
                  Manager:
                  {{
                    employee.manager.displayName ||
                    `${employee.manager.firstName ?? ''} ${employee.manager.lastName ?? ''}`.trim()
                  }}
                </p>
              </div>
            </div>

            <div class="person-header-badges">
              <span v-if="workStatusInfo" class="badge" :class="workStatusInfo.badgeClass">
                {{ workStatusInfo.label }}
              </span>
              <span class="badge" :class="employee.status === 'active' ? 'badge-success' : 'badge-neutral'">
                {{ employee.status === 'active' ? 'Active' : 'Inactive' }}
              </span>
              <span v-if="!workStatusInfo" class="badge badge-neutral">No Matrix Data</span>
            </div>

            <div v-if="canTakeAction" class="person-header-actions">
              <Button v-if="matrixRow" size="sm" variant="outline" @click="changeSupervisionStatus">
                <User class="icon-xs icon-mr" />
                Change Status
              </Button>
              <Button size="sm" variant="outline" @click="recordEvidence">
                <FileText class="icon-xs icon-mr" />
                Record Evidence
              </Button>
            </div>
          </div>

          <div v-if="showRestrictionsBanner" class="restriction-banner">
            <ShieldAlert class="restriction-icon" />
            <div>
              <p class="restriction-title">
                {{
                  matrixRow?.supervisionStatus === 'NON_COMPLIANT_MANDATORY'
                    ? 'Non-Compliant — Work Restricted'
                    : 'Supervision Required'
                }}
              </p>
              <p class="restriction-body">
                {{
                  matrixRow?.supervisionStatus === 'NON_COMPLIANT_MANDATORY'
                    ? 'This employee cannot perform independent work until mandatory items are renewed.'
                    : 'This employee must work under supervision until the listed gating items are fully met.'
                }}
              </p>
              <div v-if="restrictionItems.length" class="restriction-items">
                <span v-for="item in restrictionItems" :key="item" class="badge badge-critical badge-sm">
                  {{ item }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="matrixRow" class="readiness-cards">
            <div class="readiness-card">
              <span class="readiness-card-value" :class="matrixRow.expiredCount > 0 ? 'value-red' : 'value-green'">
                {{ matrixRow.expiredCount }}
              </span>
              <span class="readiness-card-label">Expired</span>
            </div>
            <div class="readiness-card">
              <span class="readiness-card-value" :class="matrixRow.expiringCount > 0 ? 'value-amber' : 'value-green'">
                {{ matrixRow.expiringCount }}
              </span>
              <span class="readiness-card-label">Expiring</span>
            </div>
            <div class="readiness-card">
              <span class="readiness-card-value" :class="matrixRow.requiredCount > 0 ? 'value-amber' : 'value-green'">
                {{ matrixRow.requiredCount }}
              </span>
              <span class="readiness-card-label">Required</span>
            </div>
            <div class="readiness-card">
              <span class="readiness-card-value value-green">{{ matrixRow.validCount }}</span>
              <span class="readiness-card-label">Valid</span>
            </div>
          </div>

          <TabsList class="person-tabs-list">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="competencies">Competencies</TabsTrigger>
            <TabsTrigger value="training-history">Training History</TabsTrigger>
          </TabsList>
        </div>

        <div class="tab-panels">
          <TabsContent value="profile" class="person-tab-content">
            <div class="tab-placeholder">
              <h3 class="tab-placeholder-title">Profile Summary</h3>
              <p class="tab-placeholder-copy">
                The redesigned profile summary cards are being added in this batch.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="competencies" class="person-tab-content">
            <div class="tab-placeholder">
              <h3 class="tab-placeholder-title">Competencies</h3>
              <p class="tab-placeholder-copy">
                This tab will become the operational competency view in the next batch.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="training-history" class="person-tab-content">
            <div class="tab-placeholder">
              <h3 class="tab-placeholder-title">Training History</h3>
              <p class="tab-placeholder-copy">
                This tab will become the training and assessment history view in the next batch.
              </p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
.person-drawer {
  width: min(1040px, 96vw) !important;
  max-width: 1040px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.drawer-empty {
  padding: var(--space-xl);
  text-align: center;
  color: var(--text-caption);
}

.drawer-body {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}

.drawer-top {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md);
  border-bottom: var(--border-subtle);
  background: var(--bg-surface);
}

.tab-panels {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
}

.person-tab-content {
  margin-top: 0;
}

.person-header-section {
  background: linear-gradient(135deg, rgba(14, 116, 144, 0.08), rgba(255, 255, 255, 0.98));
  border: var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  display: grid;
  gap: var(--space-md);
}

.person-avatar-block {
  display: flex;
  gap: var(--space-md);
  align-items: flex-start;
}

.person-avatar-lg {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #0f766e, #155e75);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.person-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.person-name {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-heading);
}

.person-sub {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-body);
}

.person-sub.muted {
  color: var(--text-caption);
}

.person-header-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.person-header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.restriction-banner {
  display: flex;
  gap: var(--space-sm);
  background: rgba(220, 38, 38, 0.06);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
}

.restriction-icon {
  width: 20px;
  height: 20px;
  color: #dc2626;
  flex-shrink: 0;
  margin-top: 2px;
}

.restriction-title {
  margin: 0 0 4px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #dc2626;
}

.restriction-body {
  margin: 0 0 6px;
  font-size: 0.8125rem;
  color: var(--text-body);
}

.restriction-items {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.readiness-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-sm);
}

.readiness-card {
  background: var(--bg-subtle);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.readiness-card-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.readiness-card-label {
  font-size: 0.6875rem;
  color: var(--text-caption);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.value-red {
  color: #dc2626;
}

.value-amber {
  color: #d97706;
}

.value-green {
  color: #16a34a;
}

.person-tabs-list {
  width: fit-content;
  gap: var(--space-xs);
  padding: 0.25rem;
}

.tab-placeholder {
  border: var(--border-subtle);
  border-radius: var(--radius-xl);
  background: var(--bg-card);
  padding: var(--space-xl);
}

.tab-placeholder-title {
  margin: 0 0 var(--space-xs);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-heading);
}

.tab-placeholder-copy {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-caption);
  line-height: 1.6;
}

.badge-sm {
  font-size: 0.6875rem;
  padding: 1px 6px;
  height: auto;
}

.icon-xs {
  width: 14px;
  height: 14px;
}

.icon-mr {
  margin-right: 0.25rem;
}

@media (max-width: 1024px) {
  .person-drawer {
    width: min(92vw, 840px) !important;
    max-width: 840px;
  }
}

@media (max-width: 768px) {
  .readiness-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .person-tabs-list {
    width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
  }

  .person-header-section {
    padding: var(--space-md);
  }
}
</style>
