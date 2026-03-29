<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, CheckCircle2, Clock, Send, XCircle, Eye, MoreHorizontal, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table as IoiTable } from '@ioi-dev/vue-table/unstyled'
import type { ColumnDef, CellSlotProps, SortState, HeaderFilterSlotProps } from '@ioi-dev/vue-table/unstyled'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
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
import { roleAudienceIncludes } from '@/lib/demoDomain'
import AwarenessTopicFormSheet from '@/components/awareness/AwarenessTopicFormSheet.vue'
import type { AwarenessTopic } from '@/components/awareness/AwarenessTopicFormSheet.vue'

// ─── Auth ──────────────────────────────────────────────────────────────────────

const authStore = useAuthStore()
const isEmployee = computed(() => authStore.userRole === 'EMPLOYEE')
const canCreateTopic = computed(() => ['QHSE', 'HR_ADMIN', 'ADMIN'].includes(authStore.userRole))

// ─── Topic data (reactive, so new topics can be added) ────────────────────────

const topics = ref<AwarenessTopic[]>(topicsData as AwarenessTopic[])

// ─── Constants ─────────────────────────────────────────────────────────────────

const TOPIC_TYPE_LABELS: Record<string, string> = {
  PROCEDURE_REVISION: 'Procedure Revision',
  SAFETY_BRIEFING: 'Safety Briefing',
  QUALITY_ALERT: 'Quality Alert',
  CUSTOMER_REQUIREMENT: 'Customer Requirement',
  MANAGEMENT_SYSTEM_UPDATE: 'Management System Update',
  TOOLBOX_TALK: 'Toolbox Talk',
  NEW_EQUIPMENT_INTRODUCTION: 'New Equipment Intro',
  INCIDENT_LEARNING: 'Incident Learning',
}

const TOPIC_TYPE_BADGE: Record<string, string> = {
  PROCEDURE_REVISION: 'badge-primary',
  SAFETY_BRIEFING: 'badge-critical',
  QUALITY_ALERT: 'badge-warning',
  CUSTOMER_REQUIREMENT: 'badge-neutral',
  MANAGEMENT_SYSTEM_UPDATE: 'badge-neutral',
  TOOLBOX_TALK: 'badge-success',
  NEW_EQUIPMENT_INTRODUCTION: 'badge-primary',
  INCIDENT_LEARNING: 'badge-critical',
}

const WORKFLOW_LABELS: Record<string, string> = {
  DRAFTED: 'Drafted',
  ISSUED: 'Issued',
  IN_COMMUNICATION: 'In Communication',
  AWAITING_ACKNOWLEDGEMENT: 'Awaiting Ack.',
  VERIFICATION_PENDING: 'Verification Pending',
  CLOSED: 'Closed',
}

const WORKFLOW_BADGE: Record<string, string> = {
  DRAFTED: 'badge badge-neutral',
  ISSUED: 'badge badge-primary',
  IN_COMMUNICATION: 'badge badge-primary',
  AWAITING_ACKNOWLEDGEMENT: 'badge badge-warning',
  VERIFICATION_PENDING: 'badge badge-warning',
  CLOSED: 'badge badge-success',
}

const DELIVERY_LABELS: Record<string, string> = {
  READ_AND_ACKNOWLEDGE: 'Read & Acknowledge',
  TEAM_BRIEFING: 'Team Briefing',
  TOOLBOX_TALK: 'Toolbox Talk',
  SUPERVISOR_CASCADE: 'Supervisor Cascade',
  FORMAL_RETRAINING: 'Formal Retraining',
}

// ─── Admin action handlers ─────────────────────────────────────────────────────

function issueTopic(topic: AwarenessTopic) {
  const idx = topics.value.findIndex((t) => t.id === topic.id)
  if (idx !== -1) {
    topics.value[idx] = Object.assign({}, topics.value[idx], {
      workflowStatus: 'ISSUED',
    }) as AwarenessTopic
    toast.success(`"${topic.title}" issued`)
  }
}

function closeTopic(topic: AwarenessTopic) {
  const idx = topics.value.findIndex((t) => t.id === topic.id)
  if (idx !== -1) {
    topics.value[idx] = Object.assign({}, topics.value[idx], {
      workflowStatus: 'CLOSED',
    }) as AwarenessTopic
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
  return topics.value.filter((t) => {
    if (t.workflowStatus === 'DRAFTED' || t.workflowStatus === 'CLOSED') return false
    return linkedJobTitle.value !== null && roleAudienceIncludes(t.requiredAudience, linkedJobTitle.value)
  })
})

const acknowledged = ref(new Set<string>())

function acknowledge(topicId: string, topicTitle: string) {
  acknowledged.value = new Set([...acknowledged.value, topicId])
  toast.success(`Acknowledged: ${topicTitle}`)
}

const pendingCount = computed(
  () => assignedTopics.value.filter((t) => !acknowledged.value.has(t.id)).length,
)

const briefingCount = computed(
  () =>
    assignedTopics.value.filter((t) => t.briefingRequired && !acknowledged.value.has(t.id)).length,
)

// ── Shared helpers ────────────────────────────────────────────────────────────

function buildTopicRow(t: AwarenessTopic, isAcked: boolean) {
  return {
    id: t.id,
    title: t.title,
    topicTypeBadgeClass: TOPIC_TYPE_BADGE[t.topicType] ?? 'badge badge-neutral',
    topicTypeLabel: TOPIC_TYPE_LABELS[t.topicType] ?? t.topicType,
    trigger: t.trigger,
    deliveryMethodLabel: DELIVERY_LABELS[t.deliveryMethod] ?? t.deliveryMethod,
    effectiveDate: t.effectiveDate,
    requiredAudience: t.requiredAudience,
    workflowBadgeClass: WORKFLOW_BADGE[t.workflowStatus] ?? 'badge badge-neutral',
    workflowStatusLabel: WORKFLOW_LABELS[t.workflowStatus] ?? t.workflowStatus,
    workflowStatus: t.workflowStatus,
    completionAcknowledged: (t as any).completionAcknowledged ?? (isAcked ? 1 : 0),
    completionTotal: (t as any).completionTotal ?? 1,
    isAcked,
    _raw: t,
  }
}

type TopicRow = ReturnType<typeof buildTopicRow>

const empRows = computed<TopicRow[]>(() =>
  assignedTopics.value.map((t) => buildTopicRow(t, acknowledged.value.has(t.id))),
)

const adminRows = computed<TopicRow[]>(() =>
  topics.value.map((t) => buildTopicRow(t, false)),
)

// ── Sort ──────────────────────────────────────────────────────────────────────

interface IoiTableRef { setSortState: (s: SortState[]) => void }
const empTableRef   = ref<IoiTableRef | null>(null)
const adminTableRef = ref<IoiTableRef | null>(null)
const empSortStates   = ref<SortState[]>([])
const adminSortStates = ref<SortState[]>([])

function getSortDir(states: SortState[], field: string): 'asc' | 'desc' | '' {
  return states.find(s => s.field === field)?.direction ?? ''
}

function headerSortEmp(field: string) {
  if (field === '_actions') return
  const cur = getSortDir(empSortStates.value, field)
  const next: SortState[] = !cur ? [{ field, direction: 'asc' }] : cur === 'asc' ? [{ field, direction: 'desc' }] : []
  empSortStates.value = next
  empTableRef.value?.setSortState(next)
}

function headerSortAdmin(field: string) {
  if (field === '_actions') return
  const cur = getSortDir(adminSortStates.value, field)
  const next: SortState[] = !cur ? [{ field, direction: 'asc' }] : cur === 'asc' ? [{ field, direction: 'desc' }] : []
  adminSortStates.value = next
  adminTableRef.value?.setSortState(next)
}

const topicColumns: ColumnDef<TopicRow>[] = [
  { id: 'title',               field: 'title',               header: 'Title',            type: 'text', headerFilter: 'text'            },
  { id: 'topicTypeLabel',      field: 'topicTypeLabel',      header: 'Topic Type',       type: 'text', headerFilter: 'select'          },
  { id: 'trigger',             field: 'trigger',             header: 'Trigger',          type: 'text'                                  },
  { id: 'deliveryMethodLabel', field: 'deliveryMethodLabel', header: 'Delivery Method',  type: 'text', headerFilter: 'select'          },
  { id: 'effectiveDate',       field: 'effectiveDate',       header: 'Effective Date',   type: 'text',                         width: 130 },
  { id: 'requiredAudience',    field: 'requiredAudience',    header: 'Audience',         type: 'text'                                  },
  { id: 'workflowStatusLabel', field: 'workflowStatusLabel', header: 'Workflow Status',  type: 'text', headerFilter: 'select', width: 150 },
  { id: 'completion',          field: 'completion',          header: 'Completion',       type: 'text',                         width: 120 },
  { id: '_actions',            field: '_actions',            header: 'Actions',                                                width: 72  },
]
</script>

<template>
  <!-- ── Employee view ──────────────────────────────────────────────────────── -->
  <template v-if="isEmployee">
    <div class="page-header">
      <h1 class="page-title">Awareness Topics</h1>
      <p class="page-subtitle">
        Awareness communications assigned to you — procedure changes, safety briefings, quality
        alerts
      </p>
    </div>

    <!-- Summary banner -->
    <div v-if="pendingCount > 0" class="pending-banner">
      <Clock class="pending-icon" />
      <span>
        You have <strong>{{ pendingCount }}</strong> topic{{
          pendingCount !== 1 ? 's' : ''
        }}
        pending acknowledgement
        <template v-if="briefingCount > 0">
          and <strong>{{ briefingCount }}</strong>
          requiring briefing attendance </template
        >.
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
          <IoiTable
            ref="empTableRef"
            :rows="empRows"
            :columns="topicColumns"
            row-key="id"
            :page-size="10000"
            :row-class="(row: TopicRow) => row.isAcked ? 'row-acknowledged' : ''"
            aria-label="My Awareness Topics"
          >
            <template #header="{ column }">
              <div
                class="sort-header"
                :class="{ 'sort-header--no-sort': column.id === '_actions', 'sort-header--right': column.id === '_actions' }"
                @click.stop="headerSortEmp(String(column.field))"
              >
                <span>{{ column.header ?? column.field }}</span>
                <ChevronUp      v-if="getSortDir(empSortStates, String(column.field)) === 'asc'"  class="sort-icon" />
                <ChevronDown    v-else-if="getSortDir(empSortStates, String(column.field)) === 'desc'" class="sort-icon" />
                <ChevronsUpDown v-else-if="column.id !== '_actions'" class="sort-icon sort-icon-inactive" />
              </div>
            </template>

            <template #header-filter="{ column, mode, value, options, setValue }: HeaderFilterSlotProps<TopicRow>">
              <Select
                v-if="mode === 'select'"
                :model-value="value || '__all__'"
                @update:model-value="(v) => setValue(!v || v === '__all__' ? '' : String(v))"
              >
                <SelectTrigger size="sm" class="table-filter-select" :aria-label="`Filter by ${column.header ?? column.field}`">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  <SelectItem v-for="opt in options" :key="opt" :value="opt">{{ opt }}</SelectItem>
                </SelectContent>
              </Select>
              <Input
                v-else-if="mode === 'text'"
                :model-value="value"
                class="table-filter-input"
                :placeholder="`Filter ${column.header ?? column.field}…`"
                :aria-label="`Filter by ${column.header ?? column.field}`"
                @input="(e: Event) => setValue((e.target as HTMLInputElement).value)"
              />
            </template>

            <template #cell="{ column, row }: CellSlotProps<TopicRow>">
              <template v-if="column.field === 'title'">
                <span class="table-name-cell">{{ row.title }}</span>
              </template>
              <template v-else-if="column.field === 'topicTypeLabel'">
                <span class="badge" :class="row.topicTypeBadgeClass">{{ row.topicTypeLabel }}</span>
              </template>
              <template v-else-if="column.field === 'trigger'">
                <span class="trigger-cell">{{ row.trigger }}</span>
              </template>
              <template v-else-if="column.field === 'deliveryMethodLabel'">
                <span class="badge badge-neutral">{{ row.deliveryMethodLabel }}</span>
              </template>
              <template v-else-if="column.field === 'effectiveDate'">
                <span class="date-cell">{{ row.effectiveDate }}</span>
              </template>
              <template v-else-if="column.field === 'requiredAudience'">
                <div class="audience-tags">
                  <span v-for="aud in row.requiredAudience.slice(0, 2)" :key="aud" class="audience-tag">{{ aud }}</span>
                  <span v-if="row.requiredAudience.length > 2" class="audience-tag audience-tag-more">+{{ row.requiredAudience.length - 2 }}</span>
                </div>
              </template>
              <template v-else-if="column.field === 'workflowStatusLabel'">
                <span :class="row.workflowBadgeClass">{{ row.workflowStatusLabel }}</span>
              </template>
              <template v-else-if="column.field === 'completion'">
                <div class="completion-cell">
                  <span class="completion-label">{{ row.isAcked ? '1' : '0' }}/1 ack.</span>
                  <div class="progress-bar-track">
                    <div class="progress-bar-fill" :class="{ 'progress-bar-done': row.isAcked }" :style="{ width: row.isAcked ? '100%' : '0%' }" />
                  </div>
                </div>
              </template>
              <template v-else-if="column.field === '_actions'">
                <div class="cell-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="icon" class="table-action-btn" :aria-label="`Actions for ${row.title}`">
                        <MoreHorizontal class="icon-xs" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="viewTopic(row._raw)">
                        <Eye class="icon-xs icon-mr" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem v-if="!row.isAcked" @click="acknowledge(row.id, row.title)">
                        <CheckCircle2 class="icon-xs icon-mr" /> Acknowledge
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </template>
            </template>

            <template #empty>
              <div class="empty-state-block">
                <CheckCircle2 class="empty-state-icon" />
                <p class="empty-state-message">No awareness topics assigned to your role at this time.</p>
              </div>
            </template>
          </IoiTable>
        </div>
      </CardContent>
    </Card>
  </template>

  <!-- ── Admin / Manager view ───────────────────────────────────────────────── -->
  <template v-else>
    <div class="page-header">
      <h1 class="page-title">Awareness Topics</h1>
      <p class="page-subtitle">
        Controlled awareness communications — issue, track delivery, verify acknowledgement
      </p>
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

      <CardContent class="data-card-content">
        <div class="table-wrapper">
          <IoiTable
            ref="adminTableRef"
            :rows="adminRows"
            :columns="topicColumns"
            row-key="id"
            :page-size="10000"
            aria-label="Awareness Topics"
          >
            <template #header="{ column }">
              <div
                class="sort-header"
                :class="{ 'sort-header--no-sort': column.id === '_actions', 'sort-header--right': column.id === '_actions' }"
                @click.stop="headerSortAdmin(String(column.field))"
              >
                <span>{{ column.header ?? column.field }}</span>
                <ChevronUp      v-if="getSortDir(adminSortStates, String(column.field)) === 'asc'"  class="sort-icon" />
                <ChevronDown    v-else-if="getSortDir(adminSortStates, String(column.field)) === 'desc'" class="sort-icon" />
                <ChevronsUpDown v-else-if="column.id !== '_actions'" class="sort-icon sort-icon-inactive" />
              </div>
            </template>

            <template #header-filter="{ column, mode, value, options, setValue }: HeaderFilterSlotProps<TopicRow>">
              <Select
                v-if="mode === 'select'"
                :model-value="value || '__all__'"
                @update:model-value="(v) => setValue(!v || v === '__all__' ? '' : String(v))"
              >
                <SelectTrigger size="sm" class="table-filter-select" :aria-label="`Filter by ${column.header ?? column.field}`">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  <SelectItem v-for="opt in options" :key="opt" :value="opt">{{ opt }}</SelectItem>
                </SelectContent>
              </Select>
              <Input
                v-else-if="mode === 'text'"
                :model-value="value"
                class="table-filter-input"
                :placeholder="`Filter ${column.header ?? column.field}…`"
                :aria-label="`Filter by ${column.header ?? column.field}`"
                @input="(e: Event) => setValue((e.target as HTMLInputElement).value)"
              />
            </template>

            <template #cell="{ column, row }: CellSlotProps<TopicRow>">
              <template v-if="column.field === 'title'">
                <span class="table-name-cell">{{ row.title }}</span>
              </template>
              <template v-else-if="column.field === 'topicTypeLabel'">
                <span class="badge" :class="row.topicTypeBadgeClass">{{ row.topicTypeLabel }}</span>
              </template>
              <template v-else-if="column.field === 'trigger'">
                <span class="trigger-cell">{{ row.trigger }}</span>
              </template>
              <template v-else-if="column.field === 'deliveryMethodLabel'">
                <span class="badge badge-neutral">{{ row.deliveryMethodLabel }}</span>
              </template>
              <template v-else-if="column.field === 'effectiveDate'">
                <span class="date-cell">{{ row.effectiveDate }}</span>
              </template>
              <template v-else-if="column.field === 'requiredAudience'">
                <div class="audience-tags">
                  <span v-for="aud in row.requiredAudience.slice(0, 2)" :key="aud" class="audience-tag">{{ aud }}</span>
                  <span v-if="row.requiredAudience.length > 2" class="audience-tag audience-tag-more">+{{ row.requiredAudience.length - 2 }}</span>
                </div>
              </template>
              <template v-else-if="column.field === 'workflowStatusLabel'">
                <span :class="row.workflowBadgeClass">{{ row.workflowStatusLabel }}</span>
              </template>
              <template v-else-if="column.field === 'completion'">
                <div class="completion-cell">
                  <span class="completion-label">{{ row.completionAcknowledged }}/{{ row.completionTotal }} ack.</span>
                  <div class="progress-bar-track">
                    <div class="progress-bar-fill" :style="{ width: row.completionTotal > 0 ? `${Math.round((row.completionAcknowledged / row.completionTotal) * 100)}%` : '0%' }" />
                  </div>
                </div>
              </template>
              <template v-else-if="column.field === '_actions'">
                <div class="cell-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="icon" class="table-action-btn" :aria-label="`Actions for ${row.title}`">
                        <MoreHorizontal class="icon-xs" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="viewTopic(row._raw)">
                        <Eye class="icon-xs icon-mr" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem v-if="row.workflowStatus === 'DRAFTED'" @click="issueTopic(row._raw)">
                        <Send class="icon-xs icon-mr" /> Issue
                      </DropdownMenuItem>
                      <DropdownMenuItem v-if="row.workflowStatus !== 'CLOSED' && row.workflowStatus !== 'DRAFTED'" @click="closeTopic(row._raw)">
                        <XCircle class="icon-xs icon-mr" /> Close
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </template>
            </template>

            <template #empty>
              <div class="empty-cell">No topics match the selected filters.</div>
            </template>
          </IoiTable>
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

.sort-header {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  user-select: none;
  width: 100%;
}
.sort-header--no-sort { cursor: default; }
.sort-header--right   { justify-content: flex-end; }
.sort-icon            { width: 12px; height: 12px; flex-shrink: 0; }
.sort-icon-inactive   { opacity: 0.25; }
.cell-right           { display: flex; justify-content: flex-end; width: 100%; }

:global(.row-acknowledged) .ioi-table__cell,
:global(.row-acknowledged td) {
  opacity: 0.6;
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
  background-color: oklch(from var(--brand-success) l c h / 0.08);
  border: 1px solid oklch(from var(--brand-success) l c h / 0.25);
  color: var(--brand-success);
}

.pending-icon,
.done-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* ── Row acknowledged (employee) ────────────────────────── */
.row-acknowledged td {
  opacity: 0.6;
}

/* type-badge-* removed — now using global .badge-* semantic classes */

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
  background-color: oklch(0 0 0 / 0.06);
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

.progress-bar-done {
  background-color: var(--brand-success);
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
