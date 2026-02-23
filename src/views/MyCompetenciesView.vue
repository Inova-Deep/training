<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useEmployeesStore } from '@/stores/employees'
import { useSkillsMatrixStore, type EmployeeCompetenceItem } from '@/stores/skillsMatrix'
import { StatusChip } from '@/components/ui/status-chip'
import { AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-vue-next'

const authStore = useAuthStore()
const employeesStore = useEmployeesStore()
const matrixStore = useSkillsMatrixStore()

const CATEGORY_ORDER = ['Technical', 'Quality', 'Mandatory'] as const

onMounted(async () => {
  if (matrixStore.mockEmployeeRows.length === 0) {
    await employeesStore.fetchEmployees()
    await matrixStore.fetchAndBuildMatrix(employeesStore.filteredEmployees)
  }
})

const linkedJobTitle = computed(() => authStore.activePersona.linkedJobTitle)

const myRow = computed(() => {
  if (!linkedJobTitle.value) return null
  const needle = linkedJobTitle.value.toLowerCase()
  return (
    matrixStore.mockEmployeeRows.find(r => r.jobTitle.toLowerCase().includes(needle)) ?? null
  )
})

const alertItems = computed(() => {
  if (!myRow.value) return []
  return [...myRow.value.competenceItems.values()].filter(
    item => item.derivedStatus === 'EXPIRING' || item.derivedStatus === 'EXPIRED'
  )
})

const stats = computed(() => {
  if (!myRow.value) return { valid: 0, expiring: 0, expired: 0, required: 0 }
  return {
    valid: myRow.value.validCount,
    expiring: myRow.value.expiringCount,
    expired: myRow.value.expiredCount,
    required: myRow.value.requiredCount,
  }
})

function getItem(competencyId: string): EmployeeCompetenceItem | undefined {
  return myRow.value?.competenceItems.get(competencyId)
}

function getActionRequired(item: EmployeeCompetenceItem): string | undefined {
  switch (item.derivedStatus) {
    case 'REQUIRED':     return 'Complete training'
    case 'IN_PROGRESS':  return 'Submit evidence'
    case 'EXPIRED':      return 'Renew certification'
    case 'EXPIRING':     return 'Schedule renewal'
    default:             return undefined
  }
}

function getResponsible(item: EmployeeCompetenceItem): string {
  return item.isGating ? 'Employee + Manager' : 'Employee'
}

function getExpiryClass(item: EmployeeCompetenceItem): string {
  if (item.derivedStatus === 'EXPIRED')  return 'expiry-expired'
  if (item.derivedStatus === 'EXPIRING') return 'expiry-expiring'
  return ''
}
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">My Competencies</h1>
    <p class="page-subtitle">
      Your personal competence profile — requirements, statuses, expiry dates and required actions
    </p>
  </div>

  <!-- No profile state (HR Admin or unlinked persona) -->
  <div v-if="!linkedJobTitle" class="empty-state">
    <ShieldCheck class="empty-icon" />
    <p class="empty-title">No personal competence profile</p>
    <p class="empty-desc">
      Switch to the <strong>Employee</strong> or <strong>Manager</strong> persona to view a
      competence profile.
    </p>
  </div>

  <!-- Loading -->
  <div v-else-if="matrixStore.isLoading" class="loading-state">
    <p>Loading competence profile…</p>
  </div>

  <!-- No matching row -->
  <div v-else-if="!myRow" class="empty-state">
    <ShieldCheck class="empty-icon" />
    <p class="empty-title">Profile not found</p>
    <p class="empty-desc">No employee row found for job title "{{ linkedJobTitle }}".</p>
  </div>

  <template v-else>
    <!-- Employee header strip -->
    <div class="profile-strip">
      <div class="profile-cell">
        <span class="profile-label">Job Title</span>
        <span class="profile-value">{{ myRow.jobTitle }}</span>
      </div>
      <div class="profile-cell">
        <span class="profile-label">Department</span>
        <span class="profile-value">{{ myRow.department || '—' }}</span>
      </div>
      <div class="profile-cell">
        <span class="profile-label">Business Unit</span>
        <span class="profile-value">{{ myRow.businessUnit || '—' }}</span>
      </div>
      <div class="profile-cell">
        <span class="profile-label">Manager</span>
        <span class="profile-value">{{ myRow.managerName || '—' }}</span>
      </div>
      <div class="profile-cell">
        <span class="profile-label">IWA Status</span>
        <span v-if="myRow.isAuthorised" class="iwa-badge iwa-authorised">
          <ShieldCheck class="iwa-icon" /> Authorised
        </span>
        <span v-else class="iwa-badge iwa-not-authorised">
          <ShieldAlert class="iwa-icon" /> Not Authorised
        </span>
      </div>
    </div>

    <!-- Alert banner -->
    <div v-if="alertItems.length > 0" class="alert-banner">
      <AlertTriangle class="alert-icon" />
      <span>
        You have <strong>{{ alertItems.length }}</strong>
        competence{{ alertItems.length !== 1 ? 's' : '' }} that
        {{ alertItems.length !== 1 ? 'are' : 'is' }} expiring or expired — action required.
      </span>
    </div>

    <!-- Summary stats -->
    <div class="stats-row">
      <div class="stat-pill stat-valid">
        <span class="stat-value">{{ stats.valid }}</span>
        <span class="stat-label">Valid</span>
      </div>
      <div class="stat-pill stat-expiring">
        <span class="stat-value">{{ stats.expiring }}</span>
        <span class="stat-label">Expiring</span>
      </div>
      <div class="stat-pill stat-expired">
        <span class="stat-value">{{ stats.expired }}</span>
        <span class="stat-label">Expired</span>
      </div>
      <div class="stat-pill stat-required">
        <span class="stat-value">{{ stats.required }}</span>
        <span class="stat-label">Required</span>
      </div>
    </div>

    <!-- Requirements by category -->
    <div
      v-for="category in CATEGORY_ORDER"
      :key="category"
      class="category-section"
    >
      <template v-if="matrixStore.competenciesByCategory.get(category)?.length">
        <div class="category-header">
          <span class="category-title">{{ category }}</span>
          <span class="category-count">
            {{ matrixStore.competenciesByCategory.get(category)!.length }} requirements
          </span>
        </div>

        <div class="requirements-table">
          <div class="table-header-row">
            <span class="col-code">Code</span>
            <span class="col-title">Requirement</span>
            <span class="col-gating">Gating</span>
            <span class="col-expiry">Expiry</span>
            <span class="col-action">Action Required</span>
            <span class="col-responsible">Responsible</span>
            <span class="col-status">Status</span>
          </div>

          <div
            v-for="comp in matrixStore.competenciesByCategory.get(category)"
            :key="comp.id"
            class="table-row"
            :class="{
              'row-attention':
                getItem(comp.id)?.derivedStatus === 'EXPIRED' ||
                getItem(comp.id)?.derivedStatus === 'EXPIRING',
            }"
          >
            <span class="col-code comp-code">{{ comp.code }}</span>
            <span class="col-title comp-title">{{ comp.title }}</span>
            <span class="col-gating">
              <span v-if="getItem(comp.id)?.isGating" class="gating-badge">Gating</span>
              <span v-else class="text-muted">—</span>
            </span>
            <span
              class="col-expiry"
              :class="getItem(comp.id) ? getExpiryClass(getItem(comp.id)!) : ''"
            >
              {{ getItem(comp.id)?.expiryDate ?? '—' }}
            </span>
            <span class="col-action action-text">
              {{ getItem(comp.id) ? (getActionRequired(getItem(comp.id)!) ?? '—') : '—' }}
            </span>
            <span class="col-responsible responsible-text">
              {{ getItem(comp.id) ? getResponsible(getItem(comp.id)!) : '—' }}
            </span>
            <span class="col-status">
              <StatusChip
                v-if="getItem(comp.id)"
                :status="getItem(comp.id)!.derivedStatus"
                :expiry-date="getItem(comp.id)?.expiryDate"
                :action-required="getItem(comp.id) ? getActionRequired(getItem(comp.id)!) : undefined"
                :responsible="getItem(comp.id) ? getResponsible(getItem(comp.id)!) : undefined"
                :evidence-expected="comp.assessmentMethod"
                compact
              />
            </span>
          </div>
        </div>
      </template>
    </div>
  </template>
</template>

<style scoped>
/* ── Profile strip ──────────────────────────────────────────── */
.profile-strip {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-lg);
  padding: var(--space-md) var(--space-lg);
  background-color: var(--bg-surface);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-md);
}

.profile-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 120px;
}

.profile-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--text-caption);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.profile-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-heading);
}

.iwa-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.iwa-authorised { color: var(--brand-success); }
.iwa-not-authorised { color: var(--brand-critical); }

.iwa-icon {
  width: 14px;
  height: 14px;
}

/* ── Alert banner ───────────────────────────────────────────── */
.alert-banner {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background-color: oklch(0.7 0.18 50 / 0.1);
  border: 1px solid oklch(0.7 0.18 50 / 0.3);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
  font-size: 0.875rem;
  color: oklch(0.6 0.18 50);
}

.alert-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* ── Stats row ──────────────────────────────────────────────── */
.stats-row {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
}

.stat-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  min-width: 80px;
  background-color: var(--bg-surface);
  border: var(--border-subtle);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--text-caption);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-top: 2px;
}

.stat-valid    .stat-value { color: var(--brand-success); }
.stat-expiring .stat-value { color: oklch(0.65 0.18 60); }
.stat-expired  .stat-value { color: var(--brand-critical); }
.stat-required .stat-value { color: var(--brand-primary); }

/* ── Category section ───────────────────────────────────────── */
.category-section {
  margin-bottom: var(--space-xl);
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xs) 0 var(--space-sm);
  border-bottom: var(--border-subtle);
  margin-bottom: var(--space-xs);
}

.category-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-heading);
}

.category-count {
  font-size: 0.75rem;
  color: var(--text-caption);
}

/* ── Requirements table ─────────────────────────────────────── */
.requirements-table {
  width: 100%;
}

.table-header-row,
.table-row {
  display: grid;
  grid-template-columns: 76px 1fr 68px 100px 160px 140px 100px;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
}

.table-header-row {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-caption);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border-bottom: var(--border-subtle);
  padding-bottom: var(--space-sm);
}

.table-row {
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
  min-height: 42px;
}

.table-row:last-child {
  border-bottom: none;
}

.row-attention {
  background-color: oklch(0.7 0.18 50 / 0.04);
}

.comp-code {
  font-size: 0.75rem;
  font-weight: 600;
  font-family: var(--font-mono, monospace);
  color: var(--text-caption);
}

.comp-title {
  font-size: 0.875rem;
  color: var(--text-body);
}

.gating-badge {
  display: inline-flex;
  padding: 1px 6px;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  background-color: oklch(0.55 0.18 30 / 0.12);
  color: var(--brand-critical);
  border-radius: var(--radius-full);
}

.text-muted {
  color: var(--text-caption);
  font-size: 0.875rem;
}

.expiry-expired {
  color: var(--brand-critical);
  font-weight: 600;
  font-size: 0.8125rem;
}

.expiry-expiring {
  color: oklch(0.65 0.18 60);
  font-weight: 600;
  font-size: 0.8125rem;
}

.action-text,
.responsible-text {
  font-size: 0.8125rem;
  color: var(--text-body);
}

/* ── Empty / loading states ─────────────────────────────────── */
.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-2xl) var(--space-lg);
  text-align: center;
  color: var(--text-caption);
}

.empty-icon {
  width: 40px;
  height: 40px;
  color: var(--text-caption);
  opacity: 0.4;
}

.empty-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-heading);
}

.empty-desc {
  font-size: 0.875rem;
  max-width: 380px;
}

/* ── Responsive ─────────────────────────────────────────────── */
@media (max-width: 900px) {
  .table-header-row,
  .table-row {
    grid-template-columns: 70px 1fr 60px 90px 100px;
  }

  .col-action,
  .col-responsible {
    display: none;
  }
}
</style>
