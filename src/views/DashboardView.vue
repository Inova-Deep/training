<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useEmployeesStore } from '@/stores/employees'
import { useSkillsMatrixStore } from '@/stores/skillsMatrix'
import { useTrainingNeedsStore } from '@/stores/trainingNeeds'
import { CheckCircle, AlertTriangle, XCircle, UserX, Clock, ShieldAlert, FileText, Users } from 'lucide-vue-next'
import activityData from '@/data/dashboardActivity.json'

const authStore = useAuthStore()
const employeesStore = useEmployeesStore()
const matrixStore = useSkillsMatrixStore()
const trainingStore = useTrainingNeedsStore()

const recentActivity = ref(activityData)

const kpis = computed(() => {
  const stats = matrixStore.summaryStats
  const today = new Date().toISOString().split('T')[0]!
  const openNeeds = trainingStore.trainingNeeds.filter(n => n.status === 'OPEN').length
  const overdueNeeds = trainingStore.trainingNeeds.filter(
    n => n.status === 'OPEN' && n.dueDate != null && n.dueDate < today
  ).length
  return {
    required: stats.totalRequired,
    expiring: stats.totalExpiring,
    expired: stats.totalExpired,
    notAuthorised: stats.notAuthorised,
    openTrainingNeeds: openNeeds,
    overdueTrainingNeeds: overdueNeeds,
  }
})

const notAuthorisedList = computed(() =>
  matrixStore.mockEmployeeRows
    .filter(emp => !emp.isAuthorised)
    .slice(0, 4)
    .map(emp => {
      const missingItem = emp.gatingFailed[0] ?? 'Unknown'
      const failedItem = [...emp.competenceItems.values()].find(
        item => item.isGating && (item.derivedStatus === 'EXPIRED' || item.derivedStatus === 'REQUIRED')
      )
      const daysExpired = failedItem?.expiryDate
        ? Math.max(0, Math.ceil((Date.now() - new Date(failedItem.expiryDate).getTime()) / 86400000))
        : 0
      return { id: emp.employeeId, name: emp.displayName, jobTitle: emp.jobTitle, missingItem, daysExpired }
    })
)

const expiringSoonList = computed(() => {
  const results: Array<{ id: string; name: string; requirement: string; expiryDate: string; daysRemaining: number; responsible: string }> = []
  const now = Date.now()
  for (const emp of matrixStore.mockEmployeeRows) {
    for (const item of emp.competenceItems.values()) {
      if (item.derivedStatus === 'EXPIRING' && item.expiryDate) {
        const daysRemaining = Math.max(0, Math.ceil((new Date(item.expiryDate).getTime() - now) / 86400000))
        const comp = matrixStore.getCompetencyById(item.competencyId)
        results.push({
          id: `${emp.employeeId}-${item.competencyId}`,
          name: emp.displayName,
          requirement: comp?.title ?? 'Unknown',
          expiryDate: item.expiryDate,
          daysRemaining,
          responsible: 'Employee',
        })
      }
    }
    if (results.length >= 4) break
  }
  return results.slice(0, 4)
})

onMounted(async () => {
  await employeesStore.fetchEmployees()
  await matrixStore.fetchAndBuildMatrix(employeesStore.filteredEmployees)
  await trainingStore.fetchTrainingNeeds()
})
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">Dashboard</h1>
    <p class="page-subtitle">Organisation view of competence compliance, gating risks, and upcoming expiries</p>
  </div>

  <!-- KPI Grid -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-card-header">
        <span class="kpi-card-title">Required</span>
        <CheckCircle class="kpi-card-icon" />
      </div>
      <div class="kpi-card-value">{{ kpis.required }}</div>
      <div class="kpi-card-change kpi-card-change-positive">
        Competencies required
      </div>
    </div>
    <div class="kpi-card">
      <div class="kpi-card-header">
        <span class="kpi-card-title">Expiring</span>
        <AlertTriangle class="kpi-card-icon" />
      </div>
      <div class="kpi-card-value">{{ kpis.expiring }}</div>
      <div class="kpi-card-change kpi-card-change-negative">
        Within 30 days
      </div>
    </div>
    <div class="kpi-card">
      <div class="kpi-card-header">
        <span class="kpi-card-title">Expired</span>
        <XCircle class="kpi-card-icon" />
      </div>
      <div class="kpi-card-value">{{ kpis.expired }}</div>
      <div class="kpi-card-change kpi-card-change-negative">
        Requires attention
      </div>
    </div>
    <div class="kpi-card">
      <div class="kpi-card-header">
        <span class="kpi-card-title">Not Authorised</span>
        <UserX class="kpi-card-icon" />
      </div>
      <div class="kpi-card-value">{{ kpis.notAuthorised }}</div>
      <div class="kpi-card-change">
        Missing qualifications
      </div>
    </div>
  </div>

  <!-- Additional KPIs -->
  <div class="kpi-grid" style="margin-top: var(--space-lg);">
    <div class="kpi-card">
      <div class="kpi-card-header">
        <span class="kpi-card-title">Open Training</span>
        <Clock class="kpi-card-icon" />
      </div>
      <div class="kpi-card-value">{{ kpis.openTrainingNeeds }}</div>
      <div class="kpi-card-change">
        Training needs
      </div>
    </div>
    <div class="kpi-card">
      <div class="kpi-card-header">
        <span class="kpi-card-title">Overdue Training</span>
        <ShieldAlert class="kpi-card-icon" />
      </div>
      <div class="kpi-card-value">{{ kpis.overdueTrainingNeeds }}</div>
      <div class="kpi-card-change kpi-card-change-negative">
        Past due date
      </div>
    </div>
  </div>

  <!-- Top Lists Section -->
  <div class="dashboard-lists" style="margin-top: var(--space-xl);">
    <div class="dashboard-list">
      <div class="dashboard-list-header">
        <h2 class="dashboard-list-title">Not Authorised (Gating Failed)</h2>
      </div>
      <div class="dashboard-list-content">
        <div v-for="item in notAuthorisedList" :key="item.id" class="dashboard-list-item">
          <div class="dashboard-list-item-main">
            <span class="dashboard-list-item-title">{{ item.name }}</span>
            <span class="dashboard-list-item-subtitle">{{ item.jobTitle }}</span>
          </div>
          <div class="dashboard-list-item-meta">
            <span class="badge badge-critical">{{ item.missingItem }}</span>
            <span class="dashboard-list-item-date">{{ item.daysExpired }} days expired</span>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-list">
      <div class="dashboard-list-header">
        <h2 class="dashboard-list-title">Expiring Soon</h2>
      </div>
      <div class="dashboard-list-content">
        <div v-for="item in expiringSoonList" :key="item.id" class="dashboard-list-item">
          <div class="dashboard-list-item-main">
            <span class="dashboard-list-item-title">{{ item.name }}</span>
            <span class="dashboard-list-item-subtitle">{{ item.requirement }}</span>
          </div>
          <div class="dashboard-list-item-meta">
            <span class="badge badge-warning">{{ item.daysRemaining }} days</span>
            <span class="dashboard-list-item-date">{{ item.expiryDate }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Recent Activity -->
  <div class="dashboard-activity" style="margin-top: var(--space-xl);">
    <div class="dashboard-list-header">
      <h2 class="dashboard-list-title">Recent Activity</h2>
    </div>
    <div class="activity-feed">
      <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
        <FileText class="activity-icon" />
        <div class="activity-content">
          <span class="activity-message">{{ activity.message }}</span>
          <span class="activity-time">{{ activity.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-lists {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

.dashboard-list {
  background: var(--bg-surface);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
}

.dashboard-list-header {
  padding: var(--space-md);
  border-bottom: var(--border-subtle);
}

.dashboard-list-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0;
}

.dashboard-list-content {
  padding: var(--space-sm);
}

.dashboard-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
}

.dashboard-list-item:hover {
  background: var(--bg-hover);
}

.dashboard-list-item-main {
  display: flex;
  flex-direction: column;
}

.dashboard-list-item-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-body);
}

.dashboard-list-item-subtitle {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.dashboard-list-item-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.dashboard-list-item-date {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.dashboard-activity {
  background: var(--bg-surface);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
}

.activity-feed {
  padding: var(--space-md);
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
}

.activity-icon {
  width: 20px;
  height: 20px;
  color: var(--brand-primary);
  flex-shrink: 0;
}

.activity-content {
  display: flex;
  flex-direction: column;
}

.activity-message {
  font-size: 0.875rem;
  color: var(--text-body);
}

.activity-time {
  font-size: 0.75rem;
  color: var(--text-caption);
}
</style>
