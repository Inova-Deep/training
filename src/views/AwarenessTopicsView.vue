<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, CheckCircle2, Clock, FileText, Send, XCircle, Eye } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'
import topicsData from '@/data/awarenessTopics.json'
import AwarenessTopicFormSheet from '@/components/awareness/AwarenessTopicFormSheet.vue'
import type { AwarenessTopic } from '@/components/awareness/AwarenessTopicFormSheet.vue'

// ─── Auth ──────────────────────────────────────────────────────────────────────

const authStore = useAuthStore()
const isEmployee = computed(() => authStore.userRole === 'EMPLOYEE')
const canCreateTopic = computed(() =>
  ['QHSE', 'HR_ADMIN', 'ADMIN'].includes(authStore.userRole)
)

// ─── Topic data (reactive, so new topics can be added) ────────────────────────

const topics = ref<AwarenessTopic[]>(topicsData as AwarenessTopic[])

// ─── Constants ─────────────────────────────────────────────────────────────────

const TOPIC_TYPE_LABELS: Record<string, string> = {
  PROCEDURE_REVISION:      'Procedure Revision',
  SAFETY_BRIEFING:         'Safety Briefing',
  QUALITY_ALERT:           'Quality Alert',
  CUSTOMER_REQUIREMENT:    'Customer Requirement',
  MANAGEMENT_SYSTEM_UPDATE:'Management System Update',
  TOOLBOX_TALK:            'Toolbox Talk',
  NEW_EQUIPMENT_INTRODUCTION: 'New Equipment Intro',
  INCIDENT_LEARNING:       'Incident Learning',
}

const TOPIC_TYPE_BADGE: Record<string, string> = {
  PROCEDURE_REVISION:      'type-badge-blue',
  SAFETY_BRIEFING:         'type-badge-red',
  QUALITY_ALERT:           'type-badge-orange',
  CUSTOMER_REQUIREMENT:    'type-badge-purple',
  MANAGEMENT_SYSTEM_UPDATE:'type-badge-grey',
  TOOLBOX_TALK:            'type-badge-green',
  NEW_EQUIPMENT_INTRODUCTION: 'type-badge-blue',
  INCIDENT_LEARNING:       'type-badge-red',
}

const WORKFLOW_LABELS: Record<string, string> = {
  DRAFTED:                  'Drafted',
  ISSUED:                   'Issued',
  IN_COMMUNICATION:         'In Communication',
  AWAITING_ACKNOWLEDGEMENT: 'Awaiting Ack.',
  VERIFICATION_PENDING:     'Verification Pending',
  CLOSED:                   'Closed',
}

const WORKFLOW_BADGE: Record<string, string> = {
  DRAFTED:                  'badge badge-neutral',
  ISSUED:                   'badge badge-primary',
  IN_COMMUNICATION:         'badge badge-primary',
  AWAITING_ACKNOWLEDGEMENT: 'badge badge-warning',
  VERIFICATION_PENDING:     'badge badge-warning',
  CLOSED:                   'badge badge-success',
}

const DELIVERY_LABELS: Record<string, string> = {
  READ_AND_ACKNOWLEDGE: 'Read & Acknowledge',
  TEAM_BRIEFING:        'Team Briefing',
  TOOLBOX_TALK:         'Toolbox Talk',
  SUPERVISOR_CASCADE:   'Supervisor Cascade',
  FORMAL_RETRAINING:    'Formal Retraining',
}

// ─── Admin filters ─────────────────────────────────────────────────────────────

const filterType     = ref('__all__')
const filterStatus   = ref('__all__')
const filterDelivery = ref('__all__')

const filteredTopics = computed(() => {
  return topics.value.filter(t => {
    const matchType     = filterType.value     === '__all__' || t.topicType      === filterType.value
    const matchStatus   = filterStatus.value   === '__all__' || t.workflowStatus === filterStatus.value
    const matchDelivery = filterDelivery.value === '__all__' || t.deliveryMethod  === filterDelivery.value
    return matchType && matchStatus && matchDelivery
  })
})

// ─── Admin action handlers ─────────────────────────────────────────────────────

function issueTopic(topic: AwarenessTopic) {
  const idx = topics.value.findIndex(t => t.id === topic.id)
  if (idx !== -1) {
    topics.value[idx] = Object.assign({}, topics.value[idx], { workflowStatus: 'ISSUED' }) as AwarenessTopic
    toast.success(`"${topic.title}" issued`)
  }
}

function closeTopic(topic: AwarenessTopic) {
  const idx = topics.value.findIndex(t => t.id === topic.id)
  if (idx !== -1) {
    topics.value[idx] = Object.assign({}, topics.value[idx], { workflowStatus: 'CLOSED' }) as AwarenessTopic
    toast.success(`"${topic.title}" closed`)
  }
}

function viewTopic(topic: AwarenessTopic) {
  toast.info(`Viewing: ${topic.title}`)
}

// ─── Form sheet ────────────────────────────────────────────────────────────────

const isFormOpen = ref(false)

function onTopicSaved(newTopic: AwarenessTopic) {
  topics.value = [newTopic, ...topics.value]
}

// ─── Employee view ─────────────────────────────────────────────────────────────

const linkedJobTitle = computed(() => authStore.activePersona?.linkedJobTitle ?? null)

const assignedTopics = computed(() => {
  return topics.value.filter(t => {
    if (t.workflowStatus === 'DRAFTED' || t.workflowStatus === 'CLOSED') return false
    return (
      t.requiredAudience.includes('All Employees') ||
      (linkedJobTitle.value !== null && t.requiredAudience.includes(linkedJobTitle.value))
    )
  })
})

const acknowledged = ref(new Set<string>())

function acknowledge(topicId: string, topicTitle: string) {
  acknowledged.value = new Set([...acknowledged.value, topicId])
  toast.success(`Acknowledged: ${topicTitle}`)
}

const pendingCount = computed(
  () => assignedTopics.value.filter(t => !acknowledged.value.has(t.id)).length
)

const briefingCount = computed(
  () => assignedTopics.value.filter(t => t.briefingRequired && !acknowledged.value.has(t.id)).length
)
</script>

<template>
  <!-- ── Employee view ──────────────────────────────────────────────────────── -->
  <template v-if="isEmployee">
    <div class="page-header">
      <h1 class="page-title">Awareness Topics</h1>
      <p class="page-subtitle">Awareness communications assigned to you — procedure changes, safety briefings, quality alerts</p>
    </div>

    <!-- Summary banner -->
    <div v-if="pendingCount > 0" class="pending-banner">
      <Clock class="pending-icon" />
      <span>
        You have <strong>{{ pendingCount }}</strong>
        topic{{ pendingCount !== 1 ? 's' : '' }} pending acknowledgement
        <template v-if="briefingCount > 0">
          and <strong>{{ briefingCount }}</strong>
          requiring briefing attendance
        </template>.
      </span>
    </div>
    <div v-else class="all-done-banner">
      <CheckCircle2 class="done-icon" />
      <span>All topics acknowledged — you're up to date.</span>
    </div>

    <Card class="data-card">
      <CardHeader class="data-card-header">
        <CardTitle class="data-card-title">My Topics</CardTitle>
        <span class="topic-count">{{ assignedTopics.length }} assigned</span>
      </CardHeader>
      <CardContent class="data-card-content">
        <div class="table-wrapper">
          <Table class="dense-table">
            <TableHeader>
              <TableRow>
                <TableHead>Topic</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Document Ref</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead class="table-actions-header">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="topic in assignedTopics"
                :key="topic.id"
                :class="{ 'row-acknowledged': acknowledged.has(topic.id) }"
              >
                <TableCell class="table-name-cell">{{ topic.title }}</TableCell>
                <TableCell>
                  <span class="badge" :class="TOPIC_TYPE_BADGE[topic.topicType]">
                    {{ TOPIC_TYPE_LABELS[topic.topicType] ?? topic.topicType }}
                  </span>
                </TableCell>
                <TableCell>
                  <span class="doc-ref">
                    <FileText class="doc-ref-icon" />
                    {{ topic.relatedDocumentRef || '—' }}
                  </span>
                </TableCell>
                <TableCell class="delivery-cell">
                  {{ DELIVERY_LABELS[topic.deliveryMethod] ?? topic.deliveryMethod }}
                </TableCell>
                <TableCell class="date-cell">{{ topic.effectiveDate }}</TableCell>
                <TableCell>
                  <span
                    class="ack-badge"
                    :class="acknowledged.has(topic.id) ? 'ack-badge-done' : 'ack-badge-pending'"
                  >
                    <CheckCircle2 v-if="acknowledged.has(topic.id)" class="ack-badge-icon" />
                    <Clock v-else class="ack-badge-icon" />
                    {{ acknowledged.has(topic.id) ? 'Acknowledged' : 'Pending' }}
                  </span>
                </TableCell>
                <TableCell class="table-actions-cell emp-actions-cell">
                  <Button
                    v-if="!acknowledged.has(topic.id)"
                    size="sm"
                    @click="acknowledge(topic.id, topic.title)"
                  >
                    Acknowledge
                  </Button>
                  <a
                    v-if="topic.relatedDocumentRef"
                    href="#"
                    class="view-doc-link"
                    @click.prevent="toast.info(`Viewing document: ${topic.relatedDocumentRef}`)"
                  >
                    View Doc
                  </a>
                  <span v-if="acknowledged.has(topic.id) && !topic.relatedDocumentRef" class="ack-done-label">Done</span>
                </TableCell>
              </TableRow>
              <TableRow v-if="assignedTopics.length === 0">
                <TableCell colspan="7" class="empty-cell">
                  <div class="empty-state-block">
                    <CheckCircle2 class="empty-state-icon" />
                    <p class="empty-state-message">No awareness topics assigned to your role at this time.</p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </template>

  <!-- ── Admin / Manager view ───────────────────────────────────────────────── -->
  <template v-else>
    <div class="page-header">
      <h1 class="page-title">Awareness Topics</h1>
      <p class="page-subtitle">Controlled awareness communications — issue, track delivery, verify acknowledgement</p>
    </div>

    <Card class="data-card">
      <CardHeader class="data-card-header">
        <CardTitle class="data-card-title">Awareness Topics</CardTitle>
        <div class="data-card-actions">
          <Button v-if="canCreateTopic" size="sm" @click="isFormOpen = true">
            <Plus class="icon-xs icon-mr" />
            Create Awareness Topic
          </Button>
        </div>
      </CardHeader>

      <!-- Filters toolbar -->
      <div class="filter-toolbar">
        <Select v-model="filterType">
          <SelectTrigger class="filter-select">
            <SelectValue placeholder="Topic Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Types</SelectItem>
            <SelectItem v-for="(label, key) in TOPIC_TYPE_LABELS" :key="key" :value="key">
              {{ label }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="filterStatus">
          <SelectTrigger class="filter-select">
            <SelectValue placeholder="Workflow Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Statuses</SelectItem>
            <SelectItem v-for="(label, key) in WORKFLOW_LABELS" :key="key" :value="key">
              {{ label }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="filterDelivery">
          <SelectTrigger class="filter-select">
            <SelectValue placeholder="Delivery Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Methods</SelectItem>
            <SelectItem value="READ_AND_ACKNOWLEDGE">Read & Acknowledge</SelectItem>
            <SelectItem value="TEAM_BRIEFING">Team Briefing</SelectItem>
            <SelectItem value="TOOLBOX_TALK">Toolbox Talk</SelectItem>
            <SelectItem value="SUPERVISOR_CASCADE">Supervisor Cascade</SelectItem>
            <SelectItem value="FORMAL_RETRAINING">Formal Retraining</SelectItem>
          </SelectContent>
        </Select>

        <span class="filter-count">{{ filteredTopics.length }} result{{ filteredTopics.length !== 1 ? 's' : '' }}</span>
      </div>

      <CardContent class="data-card-content">
        <div class="table-wrapper">
          <Table class="dense-table">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Topic Type</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Delivery Method</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Workflow Status</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead class="table-actions-header">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="topic in filteredTopics" :key="topic.id">
                <TableCell class="table-name-cell">{{ topic.title }}</TableCell>

                <TableCell>
                  <span class="badge" :class="TOPIC_TYPE_BADGE[topic.topicType]">
                    {{ TOPIC_TYPE_LABELS[topic.topicType] ?? topic.topicType }}
                  </span>
                </TableCell>

                <TableCell class="trigger-cell">{{ topic.trigger }}</TableCell>

                <TableCell>
                  <span class="badge badge-neutral">
                    {{ DELIVERY_LABELS[topic.deliveryMethod] ?? topic.deliveryMethod }}
                  </span>
                </TableCell>

                <TableCell class="date-cell">{{ topic.effectiveDate }}</TableCell>

                <TableCell>
                  <div class="audience-tags">
                    <span
                      v-for="aud in topic.requiredAudience.slice(0, 2)"
                      :key="aud"
                      class="audience-tag"
                    >{{ aud }}</span>
                    <span
                      v-if="topic.requiredAudience.length > 2"
                      class="audience-tag audience-tag-more"
                    >+{{ topic.requiredAudience.length - 2 }}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <span :class="WORKFLOW_BADGE[topic.workflowStatus] ?? 'badge badge-neutral'">
                    {{ WORKFLOW_LABELS[topic.workflowStatus] ?? topic.workflowStatus }}
                  </span>
                </TableCell>

                <TableCell>
                  <div class="completion-cell">
                    <span class="completion-label">
                      {{ topic.completionAcknowledged }}/{{ topic.completionTotal }} ack.
                    </span>
                    <div class="progress-bar-track">
                      <div
                        class="progress-bar-fill"
                        :style="{
                          width: topic.completionTotal > 0
                            ? `${Math.round((topic.completionAcknowledged / topic.completionTotal) * 100)}%`
                            : '0%'
                        }"
                      />
                    </div>
                  </div>
                </TableCell>

                <TableCell class="table-actions-cell admin-actions-cell">
                  <div class="action-btns">
                    <Button
                      variant="ghost"
                      size="icon"
                      class="table-action-btn"
                      :aria-label="`View ${topic.title}`"
                      @click="viewTopic(topic)"
                    >
                      <Eye class="icon-xs" />
                    </Button>
                    <Button
                      v-if="topic.workflowStatus === 'DRAFTED'"
                      variant="ghost"
                      size="icon"
                      class="table-action-btn action-issue"
                      :aria-label="`Issue ${topic.title}`"
                      @click="issueTopic(topic)"
                    >
                      <Send class="icon-xs" />
                    </Button>
                    <Button
                      v-if="topic.workflowStatus !== 'CLOSED' && topic.workflowStatus !== 'DRAFTED'"
                      variant="ghost"
                      size="icon"
                      class="table-action-btn action-close"
                      :aria-label="`Close ${topic.title}`"
                      @click="closeTopic(topic)"
                    >
                      <XCircle class="icon-xs" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow v-if="filteredTopics.length === 0">
                <TableCell colspan="9" class="empty-cell">No topics match the selected filters.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- Create topic sheet -->
    <AwarenessTopicFormSheet
      :open="isFormOpen"
      @update:open="isFormOpen = $event"
      @saved="onTopicSaved"
    />
  </template>
</template>

<style scoped>
.table-wrapper {
  overflow-x: auto;
}

.table-name-cell {
  font-weight: 500;
  min-width: 200px;
}

.data-card-actions {
  display: flex;
  gap: var(--space-sm);
}

.topic-count {
  font-size: 0.8125rem;
  color: var(--text-caption);
}

/* ── Filters toolbar ─────────────────────────────────────── */
.filter-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  border-bottom: var(--border-subtle);
  flex-wrap: wrap;
}

.filter-select {
  width: 172px;
}

.filter-count {
  font-size: 0.8125rem;
  color: var(--text-caption);
  margin-left: auto;
}

/* ── Banners ─────────────────────────────────────────────── */
.pending-banner,
.all-done-banner {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
  font-size: 0.875rem;
}

.pending-banner {
  background-color: oklch(0.7 0.18 50 / 0.1);
  border: 1px solid oklch(0.7 0.18 50 / 0.3);
  color: oklch(0.6 0.18 50);
}

.all-done-banner {
  background-color: oklch(0.62 0.14 162 / 0.1);
  border: 1px solid oklch(0.62 0.14 162 / 0.25);
  color: var(--brand-success);
}

.pending-icon,
.done-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* ── Ack badge (employee) ────────────────────────────────── */
.ack-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.ack-badge-icon {
  width: 11px;
  height: 11px;
}

.ack-badge-pending {
  background-color: oklch(0.7 0.18 50 / 0.12);
  color: oklch(0.6 0.18 50);
}

.ack-badge-done {
  background-color: oklch(0.62 0.14 162 / 0.12);
  color: var(--brand-success);
}

/* ── Row acknowledged (employee) ────────────────────────── */
.row-acknowledged td {
  opacity: 0.6;
}

.ack-done-label {
  font-size: 0.8125rem;
  color: var(--brand-success);
  font-weight: 500;
}

/* ── Document ref (employee) ────────────────────────────── */
.doc-ref {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8125rem;
  color: var(--text-body);
}

.doc-ref-icon {
  width: 12px;
  height: 12px;
  color: var(--text-caption);
  flex-shrink: 0;
}

.delivery-cell {
  font-size: 0.8125rem;
  color: var(--text-body);
  white-space: nowrap;
}

/* ── View doc link (employee) ────────────────────────────── */
.view-doc-link {
  font-size: 0.8125rem;
  color: var(--brand-primary);
  text-decoration: none;
  font-weight: 500;
}

.view-doc-link:hover {
  text-decoration: underline;
}

.emp-actions-cell {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-wrap: nowrap;
}

/* ── Topic type badges ───────────────────────────────────── */
.type-badge-blue {
  background-color: oklch(0.45 0.12 265 / 0.12);
  color: var(--brand-primary);
}

.type-badge-red {
  background-color: oklch(0.62 0.2 25 / 0.12);
  color: var(--brand-critical);
}

.type-badge-orange {
  background-color: oklch(0.72 0.18 38 / 0.14);
  color: oklch(0.52 0.18 38);
}

.type-badge-purple {
  background-color: oklch(0.50 0.16 310 / 0.12);
  color: oklch(0.40 0.16 310);
}

.type-badge-grey {
  background-color: var(--bg-subtle);
  color: var(--text-body);
}

.type-badge-green {
  background-color: oklch(0.62 0.14 162 / 0.12);
  color: var(--brand-success);
}

/* ── Trigger cell ────────────────────────────────────────── */
.trigger-cell {
  font-size: 0.75rem;
  color: var(--text-caption);
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Audience tags ───────────────────────────────────────── */
.audience-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.audience-tag {
  font-size: 0.625rem;
  font-weight: 500;
  padding: 2px 6px;
  background-color: var(--bg-subtle);
  color: var(--text-body);
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.audience-tag-more {
  background-color: oklch(0.45 0.12 265 / 0.1);
  color: var(--brand-primary);
}

/* ── Completion ──────────────────────────────────────────── */
.completion-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 90px;
}

.completion-label {
  font-size: 0.75rem;
  color: var(--text-body);
}

.progress-bar-track {
  height: 4px;
  background-color: var(--bg-subtle);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: var(--brand-primary);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

/* ── Action buttons (admin) ──────────────────────────────── */
.admin-actions-cell {
  white-space: nowrap;
}

.action-btns {
  display: flex;
  align-items: center;
  gap: 2px;
  justify-content: flex-end;
}

.action-issue {
  color: var(--brand-primary);
}

.action-issue:hover {
  background-color: oklch(0.45 0.12 265 / 0.1);
}

.action-close {
  color: var(--brand-critical);
}

.action-close:hover {
  background-color: oklch(0.62 0.2 25 / 0.1);
}

/* ── Date cell ───────────────────────────────────────────── */
.date-cell {
  font-size: 0.8125rem;
  color: var(--text-body);
  white-space: nowrap;
}

/* ── Empty state ─────────────────────────────────────────── */
.empty-cell {
  text-align: center;
  padding: var(--space-xl) 0;
  color: var(--text-caption);
  font-size: 0.875rem;
}

.empty-state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg) 0;
}

.empty-state-icon {
  width: 32px;
  height: 32px;
  color: var(--text-caption);
  opacity: 0.5;
}

.empty-state-message {
  font-size: 0.875rem;
  color: var(--text-caption);
  margin: 0;
}
</style>
