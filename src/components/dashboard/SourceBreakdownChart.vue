<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import type { TrainingNeed } from '@/types'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  needs: TrainingNeed[]
}>()

const SOURCE_LABELS: Record<string, string> = {
  COMPETENCE_GAP: 'Competence Gap',
  NCR_CAPA: 'NCR / CAPA',
  AUDIT_FINDING: 'Audit Finding',
  PROCEDURE_CHANGE: 'Procedure Change',
  NEW_EQUIPMENT: 'New Equipment',
  NEW_STARTER: 'New Starter',
  EXPIRY_RENEWAL: 'Expiry Renewal',
  MANAGER_REQUEST: 'Manager Request',
  INCIDENT_NEAR_MISS: 'Incident / Near Miss',
}

const CHART_COLORS = [
  'rgba(59, 130, 246, 0.8)',
  'rgba(239, 68, 68, 0.8)',
  'rgba(234, 179, 8, 0.8)',
  'rgba(16, 185, 129, 0.8)',
  'rgba(139, 92, 246, 0.8)',
  'rgba(249, 115, 22, 0.8)',
  'rgba(236, 72, 153, 0.8)',
  'rgba(20, 184, 166, 0.8)',
  'rgba(99, 102, 241, 0.8)',
]

const chartData = computed(() => {
  const sourceMap = new Map<string, number>()
  for (const need of props.needs) {
    const src = need.sourceType ?? 'UNKNOWN'
    sourceMap.set(src, (sourceMap.get(src) ?? 0) + 1)
  }

  const sorted = Array.from(sourceMap.entries()).sort((a, b) => b[1] - a[1])

  return {
    labels: sorted.map(([src]) => SOURCE_LABELS[src] ?? src),
    datasets: [
      {
        data: sorted.map(([, count]) => count),
        backgroundColor: sorted.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        borderWidth: 2,
        borderColor: 'transparent',
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        font: { size: 10 },
        boxWidth: 12,
        padding: 8,
      },
    },
    tooltip: { mode: 'index' as const },
  },
}
</script>

<template>
  <div class="chart-card">
    <div class="chart-card-header">
      <h3 class="chart-card-title">Training Needs by Source</h3>
      <span class="chart-card-subtitle">All needs grouped by originating source</span>
    </div>
    <div class="chart-body">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<style scoped>
.chart-card {
  background: var(--bg-surface);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.chart-card-header {
  padding: var(--space-md) var(--space-md) var(--space-sm);
  border-bottom: var(--border-subtle);
}

.chart-card-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0 0 2px 0;
}

.chart-card-subtitle {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.chart-body {
  padding: var(--space-md);
  height: 250px;
  position: relative;
}
</style>
