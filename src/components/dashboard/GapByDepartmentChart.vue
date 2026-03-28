<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import type { EmployeeMatrixRow } from '@/stores/skillsMatrix'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  employees: EmployeeMatrixRow[]
}>()

const chartData = computed(() => {
  const deptMap = new Map<string, number>()
  for (const emp of props.employees) {
    const dept = emp.department || 'Unknown'
    const gaps = emp.requiredCount + emp.expiredCount
    deptMap.set(dept, (deptMap.get(dept) ?? 0) + gaps)
  }

  const sorted = Array.from(deptMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  return {
    labels: sorted.map(([dept]) => dept),
    datasets: [
      {
        label: 'Open Gaps',
        data: sorted.map(([, count]) => count),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }
})

const chartOptions = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { mode: 'index' as const },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: { precision: 0 },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
    y: {
      grid: { display: false },
      ticks: {
        font: { size: 11 },
      },
    },
  },
}
</script>

<template>
  <div class="chart-card">
    <div class="chart-card-header">
      <h3 class="chart-card-title">Gaps by Department</h3>
      <span class="chart-card-subtitle">REQUIRED + EXPIRED per department</span>
    </div>
    <div class="chart-body">
      <Bar :data="chartData" :options="chartOptions" />
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
