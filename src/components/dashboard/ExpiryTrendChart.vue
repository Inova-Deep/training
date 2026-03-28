<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import type { EmployeeMatrixRow } from '@/stores/skillsMatrix'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{
  employees: EmployeeMatrixRow[]
}>()

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(date: Date): string {
  return date.toLocaleString('default', { month: 'short', year: '2-digit' })
}

const chartData = computed(() => {
  const today = new Date()

  // Build 12-month window: past 6 + next 6
  const months: Array<{ key: string; label: string; isPast: boolean }> = []
  for (let i = -5; i <= 6; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
    months.push({
      key: monthKey(d),
      label: monthLabel(d),
      isPast: i <= 0,
    })
  }

  // Count expired items per past month, expiring items per future month
  const expiredByMonth = new Map<string, number>()
  const expiringByMonth = new Map<string, number>()

  for (const emp of props.employees) {
    for (const item of emp.competenceItems.values()) {
      if (!item.expiryDate) continue
      const expiryMonth = item.expiryDate.substring(0, 7) // YYYY-MM
      if (item.derivedStatus === 'EXPIRED') {
        expiredByMonth.set(expiryMonth, (expiredByMonth.get(expiryMonth) ?? 0) + 1)
      } else if (item.derivedStatus === 'EXPIRING') {
        expiringByMonth.set(expiryMonth, (expiringByMonth.get(expiryMonth) ?? 0) + 1)
      }
    }
  }

  const expiredData = months.map(m => m.isPast ? (expiredByMonth.get(m.key) ?? 0) : null)
  const forecastData = months.map(m => !m.isPast ? (expiringByMonth.get(m.key) ?? 0) : null)

  return {
    labels: months.map(m => m.label),
    datasets: [
      {
        label: 'Expired (past)',
        data: expiredData,
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        spanGaps: false,
      },
      {
        label: 'Expiring (forecast)',
        data: forecastData,
        borderColor: 'rgba(249, 115, 22, 1)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderDash: [5, 4],
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        spanGaps: false,
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
      labels: { font: { size: 11 }, boxWidth: 14, padding: 10 },
    },
    tooltip: { mode: 'index' as const, intersect: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 } },
    },
    y: {
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
      <h3 class="chart-card-title">Certification Expiry Trend</h3>
      <span class="chart-card-subtitle">Past 6 months expired · Next 6 months forecast expiring</span>
    </div>
    <div class="chart-body">
      <Line :data="chartData" :options="chartOptions" />
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
  height: 280px;
  position: relative;
}
</style>
