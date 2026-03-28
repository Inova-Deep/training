<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Clock,
  Activity,
  Zap,
  FileDown,
  FileText,
  Settings2,
  Shield,
  ArrowUpRight,
  Users,
} from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const connectionStatus = ref({
  connected: true,
  endpoint: 'https://erp.company.com/api/v2',
  version: 'v2.4.1',
  environment: 'Production',
  lastSync: '2026-02-21 14:32:00',
  nextSync: '2026-02-21 20:32:00',
  syncInterval: 'Every 6 hours',
  uptime: '99.97%',
  responseTime: '142ms',
})

const syncMetrics = ref([
  { label: 'Employee Master Synced', value: '1,247', icon: Users, trend: '+12 this week' },
  { label: 'Response Time', value: '142ms', icon: Zap, trend: 'Within threshold' },
  { label: 'Uptime', value: '99.97%', icon: Activity, trend: 'Last 30 days' },
  { label: 'Data Integrity', value: '100%', icon: Shield, trend: 'All checks passed' },
])

const syncScope = ref([
  { label: 'Employee & Organisation Data', status: 'synced', lastSync: '2026-02-21 14:32' },
  { label: 'Department & Cost Centre Structure', status: 'synced', lastSync: '2026-02-21 14:32' },
  { label: 'Job Titles & Roles', status: 'synced', lastSync: '2026-02-21 14:32' },
  { label: 'Reporting Lines (Manager Hierarchy)', status: 'synced', lastSync: '2026-02-21 08:32' },
])

const syncHistory = ref([
  { id: '1', time: '14:32', date: 'Today', status: 'success', records: 1247, duration: '2.3s' },
  { id: '2', time: '08:32', date: 'Today', status: 'success', records: 1247, duration: '2.1s' },
  { id: '3', time: '02:32', date: 'Today', status: 'success', records: 1245, duration: '2.4s' },
  { id: '4', time: '20:32', date: 'Yesterday', status: 'success', records: 1245, duration: '2.2s' },
  { id: '5', time: '14:32', date: 'Yesterday', status: 'warning', records: 1243, duration: '4.8s' },
])

const handleTestConnection = () => {
  toast.info('Demo Mode', {
    description: 'In production, this would test the ERP connection and display results.',
  })
}

const handleForceSync = () => {
  toast.info('Demo Mode', {
    description: 'In production, this would trigger a full synchronization with the ERP system.',
  })
}

const handleViewLogs = () => {
  toast.info('Demo Mode', {
    description: 'In production, this would open detailed sync logs and error reports.',
  })
}

const handleExportData = () => {
  toast.info('Demo Mode', {
    description: 'In production, this would export synchronization data as CSV or Excel.',
  })
}

const handleConfigureEndpoint = () => {
  toast.info('Demo Mode', {
    description: 'In production, this would open endpoint configuration settings.',
  })
}
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">ERP Connection</h1>
    <p class="page-subtitle">
      Monitor integration health and manage synchronization with the ERP system
    </p>
  </div>

  <!-- Hero Status Section -->
  <div
    class="status-hero"
    :class="connectionStatus.connected ? 'status-connected' : 'status-disconnected'"
  >
    <div class="status-hero-content">
      <div class="status-hero-indicator">
        <component
          :is="connectionStatus.connected ? CheckCircle2 : AlertCircle"
          class="status-hero-icon"
        />
      </div>
      <div class="status-hero-text">
        <h2 class="status-hero-title">
          {{ connectionStatus.connected ? 'Connected to ERP' : 'Connection Lost' }}
        </h2>
        <p class="status-hero-description">
          {{
            connectionStatus.connected
              ? 'Synchronization is active and running normally'
              : 'Unable to reach the ERP system. Check network settings.'
          }}
        </p>
      </div>
    </div>
    <div class="status-hero-meta">
      <div class="status-meta-item">
        <span class="status-meta-label">Environment</span>
        <span class="status-meta-value">{{ connectionStatus.environment }}</span>
      </div>
      <div class="status-meta-divider" />
      <div class="status-meta-item">
        <span class="status-meta-label">API Version</span>
        <span class="status-meta-value">{{ connectionStatus.version }}</span>
      </div>
      <div class="status-meta-divider" />
      <div class="status-meta-item">
        <span class="status-meta-label">Next Sync</span>
        <span class="status-meta-value">{{ connectionStatus.nextSync }}</span>
      </div>
    </div>
    <Button
      variant="outline"
      class="status-hero-action"
      @click="handleTestConnection"
      aria-label="Test ERP connection"
    >
      <RefreshCw class="icon-xs" />
      Test Connection
    </Button>
  </div>

  <!-- KPI Metrics Grid -->
  <div class="erp-metrics-grid">
    <div v-for="metric in syncMetrics" :key="metric.label" class="kpi-card">
      <div class="kpi-card-header">
        <span class="kpi-card-title">{{ metric.label }}</span>
        <component :is="metric.icon" class="kpi-card-icon" />
      </div>
      <div class="kpi-card-value">{{ metric.value }}</div>
      <div class="kpi-card-change">{{ metric.trend }}</div>
    </div>
  </div>

  <!-- Sync Scope Summary -->
  <Card class="erp-card erp-scope-card">
    <CardHeader class="erp-card-header">
      <div>
        <CardTitle class="erp-card-title">Sync Scope</CardTitle>
        <CardDescription class="erp-card-description"
          >Data entities currently synchronised from ERP</CardDescription
        >
      </div>
    </CardHeader>
    <CardContent class="erp-card-content">
      <div class="sync-scope-grid">
        <div v-for="scope in syncScope" :key="scope.label" class="scope-item">
          <CheckCircle2 class="scope-icon" />
          <div class="scope-content">
            <span class="scope-label">{{ scope.label }}</span>
            <span class="scope-meta">Last synced {{ scope.lastSync }}</span>
          </div>
          <span class="badge badge-success scope-badge">Synced</span>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Main Content Grid -->
  <div class="erp-content-grid">
    <!-- Connection Details -->
    <Card class="erp-card">
      <CardHeader class="erp-card-header">
        <div>
          <CardTitle class="erp-card-title">Connection Details</CardTitle>
          <CardDescription class="erp-card-description"
            >Endpoint configuration and sync schedule</CardDescription
          >
        </div>
        <Button
          variant="ghost"
          size="sm"
          @click="handleConfigureEndpoint"
          aria-label="Configure endpoint"
        >
          <Settings2 class="icon-sm" />
        </Button>
      </CardHeader>
      <CardContent class="erp-card-content">
        <div class="detail-list">
          <div class="detail-item">
            <div class="detail-item-icon">
              <Server class="icon-xs" />
            </div>
            <div class="detail-item-content">
              <span class="detail-item-label">Endpoint URL</span>
              <span class="detail-item-value">{{ connectionStatus.endpoint }}</span>
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-item-icon">
              <Clock class="icon-xs" />
            </div>
            <div class="detail-item-content">
              <span class="detail-item-label">Sync Interval</span>
              <span class="detail-item-value">{{ connectionStatus.syncInterval }}</span>
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-item-icon">
              <RefreshCw class="icon-xs" />
            </div>
            <div class="detail-item-content">
              <span class="detail-item-label">Last Successful Sync</span>
              <span class="detail-item-value">{{ connectionStatus.lastSync }}</span>
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-item-icon">
              <Activity class="icon-xs" />
            </div>
            <div class="detail-item-content">
              <span class="detail-item-label">Next Scheduled Sync</span>
              <span class="detail-item-value">{{ connectionStatus.nextSync }}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Sync History -->
    <Card class="erp-card">
      <CardHeader class="erp-card-header">
        <div>
          <CardTitle class="erp-card-title">Recent Sync Activity</CardTitle>
          <CardDescription class="erp-card-description"
            >Last 5 synchronization events</CardDescription
          >
        </div>
        <Button variant="ghost" size="sm" @click="handleViewLogs" aria-label="View all logs">
          <ArrowUpRight class="icon-sm" />
        </Button>
      </CardHeader>
      <CardContent class="erp-card-content">
        <div class="sync-history">
          <div v-for="event in syncHistory" :key="event.id" class="sync-event">
            <div
              class="sync-event-indicator"
              :class="event.status === 'warning' ? 'sync-warning' : 'sync-success'"
            />
            <div class="sync-event-content">
              <div class="sync-event-row">
                <span class="sync-event-time">{{ event.time }}</span>
                <span class="sync-event-date">{{ event.date }}</span>
              </div>
              <div class="sync-event-meta">
                <span class="sync-event-records">{{ event.records }} records</span>
                <span class="sync-event-duration">{{ event.duration }}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Quick Actions -->
  <Card class="erp-actions-card">
    <CardHeader class="erp-card-header">
      <CardTitle class="erp-card-title">Quick Actions</CardTitle>
      <CardDescription class="erp-card-description"
        >Manage ERP integration and data</CardDescription
      >
    </CardHeader>
    <CardContent class="erp-card-content">
      <div class="actions-grid">
        <Button
          variant="outline"
          class="action-button"
          @click="handleForceSync"
          aria-label="Force full sync"
        >
          <RefreshCw class="icon-sm" />
          <span>Force Full Sync</span>
        </Button>
        <Button
          variant="outline"
          class="action-button"
          @click="handleViewLogs"
          aria-label="View sync logs"
        >
          <FileText class="icon-sm" />
          <span>View Sync Logs</span>
        </Button>
        <Button
          variant="outline"
          class="action-button"
          @click="handleExportData"
          aria-label="Export data"
        >
          <FileDown class="icon-sm" />
          <span>Export Data</span>
        </Button>
        <Button
          variant="outline"
          class="action-button"
          @click="handleConfigureEndpoint"
          aria-label="Configure endpoint"
        >
          <Settings2 class="icon-sm" />
          <span>Configure</span>
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<style scoped>
/* Hero Status Section */
.status-hero {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-xl);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-xl);
  position: relative;
  overflow: hidden;
}

.status-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.5;
  pointer-events: none;
}

.status-connected {
  background: linear-gradient(
    135deg,
    oklch(0.62 0.08 162 / 0.08) 0%,
    oklch(0.62 0.08 162 / 0.02) 100%
  );
  border: 1px solid oklch(0.62 0.08 162 / 0.2);
}

.status-connected::before {
  background: radial-gradient(ellipse at top left, oklch(0.62 0.08 162 / 0.06) 0%, transparent 50%);
}

.status-disconnected {
  background: linear-gradient(
    135deg,
    oklch(0.62 0.15 25 / 0.08) 0%,
    oklch(0.62 0.15 25 / 0.02) 100%
  );
  border: 1px solid oklch(0.62 0.15 25 / 0.2);
}

.status-disconnected::before {
  background: radial-gradient(ellipse at top left, oklch(0.62 0.15 25 / 0.06) 0%, transparent 50%);
}

.status-hero-content {
  display: flex;
  align-items: flex-start;
  gap: var(--space-lg);
}

.status-hero-indicator {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-connected .status-hero-indicator {
  background: oklch(0.62 0.1 162 / 0.15);
}

.status-disconnected .status-hero-indicator {
  background: oklch(0.62 0.15 25 / 0.15);
}

.status-hero-icon {
  width: 28px;
  height: 28px;
}

.status-connected .status-hero-icon {
  color: var(--brand-success);
}

.status-disconnected .status-hero-icon {
  color: var(--brand-critical);
}

.status-hero-text {
  flex: 1;
}

.status-hero-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0 0 var(--space-xs) 0;
  letter-spacing: -0.02em;
}

.status-hero-description {
  font-size: 0.9375rem;
  color: var(--text-body);
  margin: 0;
}

.status-hero-meta {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.status-meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.status-meta-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--text-caption);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-meta-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-heading);
}

.status-meta-divider {
  width: 1px;
  height: 32px;
  background: var(--border-subtle);
}

.status-hero-action {
  position: absolute;
  top: var(--space-xl);
  right: var(--space-xl);
  background: var(--bg-surface);
  border-color: var(--border);
}

.status-hero-action:hover {
  background: var(--bg-subtle);
}

/* Metrics Grid */
.erp-metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

/* Content Grid */
.erp-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

/* Cards */
.erp-card {
  background: var(--bg-surface);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.erp-card-header {
  padding: var(--space-lg);
  border-bottom: var(--border-subtle);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.erp-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0;
}

.erp-card-description {
  font-size: 0.8125rem;
  color: var(--text-caption);
  margin-top: 2px;
}

.erp-card-content {
  padding: 0;
}

/* Detail List */
.detail-list {
  display: flex;
  flex-direction: column;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  border-bottom: var(--border-subtle);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--brand-primary);
  flex-shrink: 0;
}

.detail-item-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.detail-item-label {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.detail-item-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-heading);
  word-break: break-all;
}

/* Sync History */
.sync-history {
  display: flex;
  flex-direction: column;
}

.sync-event {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  border-bottom: var(--border-subtle);
}

.sync-event:last-child {
  border-bottom: none;
}

.sync-event:hover {
  background: var(--bg-subtle);
}

.sync-event-indicator {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  margin-top: 6px;
  flex-shrink: 0;
}

.sync-success {
  background: var(--brand-success);
}

.sync-warning {
  background: var(--brand-warning);
}

.sync-event-content {
  flex: 1;
  min-width: 0;
}

.sync-event-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
}

.sync-event-time {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-heading);
}

.sync-event-date {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.sync-event-meta {
  display: flex;
  gap: var(--space-sm);
  margin-top: 2px;
}

.sync-event-records {
  font-size: 0.75rem;
  color: var(--text-body);
}

.sync-event-duration {
  font-size: 0.75rem;
  color: var(--text-caption);
}

/* Sync Scope */
.erp-scope-card {
  margin-bottom: var(--space-xl);
  background: var(--bg-surface);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.sync-scope-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
}

.scope-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  border-bottom: var(--border-subtle);
  border-right: var(--border-subtle);
}

.scope-item:nth-child(2n) {
  border-right: none;
}

.scope-item:nth-last-child(-n + 2) {
  border-bottom: none;
}

.scope-icon {
  width: 16px;
  height: 16px;
  color: var(--brand-success);
  flex-shrink: 0;
}

.scope-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.scope-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-heading);
}

.scope-meta {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.scope-badge {
  font-size: 0.6875rem;
  flex-shrink: 0;
}

/* Actions Card */
.erp-actions-card {
  background: var(--bg-surface);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.erp-actions-card .erp-card-header {
  border-bottom: none;
  padding-bottom: var(--space-md);
}

.erp-actions-card .erp-card-content {
  padding: 0 var(--space-lg) var(--space-lg);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  height: auto;
  padding: var(--space-md);
  text-align: center;
}

.action-button span {
  font-size: 0.8125rem;
}

/* Responsive */
@media (max-width: 1280px) {
  .erp-metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .erp-content-grid {
    grid-template-columns: 1fr;
  }

  .status-hero-meta {
    display: none;
  }
}

@media (max-width: 768px) {
  .status-hero {
    padding: var(--space-lg);
  }

  .status-hero-action {
    position: static;
    margin-top: var(--space-md);
    width: 100%;
  }

  .status-hero-title {
    font-size: 1.25rem;
  }

  .status-hero-indicator {
    width: 48px;
    height: 48px;
  }

  .status-hero-icon {
    width: 24px;
    height: 24px;
  }

  .erp-metrics-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
