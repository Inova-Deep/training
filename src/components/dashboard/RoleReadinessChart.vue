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
  const roleMap = new Map<
    string,
    { authorised: number; supervised: number; notAuthorised: number }
  >()

  for (const emp of props.employees) {
    const role = emp.jobTitle || 'Unknown'
    if (!roleMap.has(role)) {
      roleMap.set(role, { authorised: 0, supervised: 0, notAuthorised: 0 })
    }
    const entry = roleMap.get(role)!

    if (!emp.isAuthorised) {
      entry.notAuthorised++
    } else if (emp.supervisionStatus === 'SUPERVISED_ONLY') {
      entry.supervised++
    } else {
      entry.authorised++
    }
  }

  // Sort by total headcount descending, take top 6
  const sorted = Array.from(roleMap.entries())
    .sort((a, b) => {
      const totalA = a[1].authorised + a[1].supervised + a[1].notAuthorised
      const totalB = b[1].authorised + b[1].supervised + b[1].notAuthorised
      return totalB - totalA
    })
    .slice(0, 6)

  // Shorten long role titles
  const shorten = (t: string) => (t.length > 22 ? t.substring(0, 20) + '…' : t)

  return {
    labels: sorted.map(([role]) => shorten(role)),
    datasets: [
      {
        label: 'Authorised',
        data: sorted.map(([, v]) => v.authorised),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 2,
        stack: 'readiness',
      },
      {
        label: 'Supervised',
        data: sorted.map(([, v]) => v.supervised),
        backgroundColor: 'rgba(234, 179, 8, 0.7)',
        borderRadius: 2,
        stack: 'readiness',
      },
      {
        label: 'Not Authorised',
        data: sorted.map(([, v]) => v.notAuthorised),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderRadius: 2,
        stack: 'readiness',
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: { font: { size: 10 }, boxWidth: 12, padding: 8 },
    },
    tooltip: { mode: 'index' as const, intersect: false },
  },
  scales: {
    x: {
      stacked: true,
      grid: { display: false },
      ticks: { font: { size: 10 } },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: { precision: 0 },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
  },
}
</script>

<template>
  <div class="chart-card">
    <div class="chart-card-header">
      <h3 class="chart-card-title">Role Readiness</h3>
      <span class="chart-card-subtitle">Authorised / Supervised / Not Authorised per role</span>
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
