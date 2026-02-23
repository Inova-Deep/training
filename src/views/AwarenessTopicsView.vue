<script setup lang="ts">
import { ref, computed } from 'vue'
import { MoreHorizontal, Plus, CheckCircle2, Clock } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'
import topicsData from '@/data/awarenessTopics.json'

const authStore = useAuthStore()

const isEmployee = computed(() => authStore.userRole === 'EMPLOYEE')

// ─── Admin view ────────────────────────────────────────────────────────────────

const topics = topicsData

// ─── Employee view ─────────────────────────────────────────────────────────────

// Active and Scheduled topics are "assigned" to the employee
const assignedTopics = topicsData.filter(t => t.status === 'Active' || t.status === 'Scheduled')

const acknowledged = ref(new Set<string>())

function acknowledge(topicId: string, topicTitle: string) {
  acknowledged.value = new Set([...acknowledged.value, topicId])
  toast.success(`Acknowledged: ${topicTitle}`)
}

const pendingCount = computed(
  () => assignedTopics.filter(t => !acknowledged.value.has(t.id)).length
)
</script>

<template>
  <!-- ── Employee view ──────────────────────────────────────────────────────── -->
  <template v-if="isEmployee">
    <div class="page-header">
      <h1 class="page-title">Awareness Topics</h1>
      <p class="page-subtitle">Topics assigned to you that require acknowledgement</p>
    </div>

    <div v-if="pendingCount > 0" class="pending-banner">
      <Clock class="pending-icon" />
      <span>
        You have <strong>{{ pendingCount }}</strong>
        topic{{ pendingCount !== 1 ? 's' : '' }} pending acknowledgement.
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
                <TableHead>Category</TableHead>
                <TableHead>Due Date</TableHead>
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
                  <span class="category-tag">{{ topic.category }}</span>
                </TableCell>
                <TableCell class="date-cell">{{ topic.dueDate }}</TableCell>
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
                <TableCell class="table-actions-cell">
                  <Button
                    v-if="!acknowledged.has(topic.id)"
                    size="sm"
                    @click="acknowledge(topic.id, topic.title)"
                  >
                    Acknowledge
                  </Button>
                  <span v-else class="ack-done-label">Done</span>
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
      <p class="page-subtitle">Create and target awareness topics to employees</p>
    </div>

    <Card class="data-card">
      <CardHeader class="data-card-header">
        <CardTitle class="data-card-title">Awareness Topics</CardTitle>
        <div class="data-card-actions">
          <Button size="sm">
            <Plus class="icon-xs icon-mr" />
            Create Topic
          </Button>
        </div>
      </CardHeader>
      <CardContent class="data-card-content">
        <div class="table-wrapper">
          <Table class="dense-table">
            <TableHeader>
              <TableRow>
                <TableHead>Topic Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Target Audience</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Status</TableHead>
                <TableHead class="table-actions-header">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="topic in topics" :key="topic.id">
                <TableCell class="table-name-cell">{{ topic.title }}</TableCell>
                <TableCell>{{ topic.category }}</TableCell>
                <TableCell>{{ topic.targetAudience }}</TableCell>
                <TableCell>{{ topic.dueDate }}</TableCell>
                <TableCell>{{ topic.completion }}</TableCell>
                <TableCell>
                  <span class="badge" :class="{
                    'badge-success': topic.status === 'Completed',
                    'badge-primary': topic.status === 'Active',
                    'badge-neutral': topic.status === 'Scheduled'
                  }">
                    {{ topic.status }}
                  </span>
                </TableCell>
                <TableCell class="table-actions-cell">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="icon" class="table-action-btn" :aria-label="`Actions for ${topic.title}`">
                        <MoreHorizontal class="icon-xs" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Topic</DropdownMenuItem>
                      <DropdownMenuItem>View Progress</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem class="destructive-action">Deactivate</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </template>
</template>

<style scoped>
.table-wrapper {
  overflow-x: auto;
}

.table-name-cell {
  font-weight: 500;
}

.data-card-actions {
  display: flex;
  gap: var(--space-sm);
}

.topic-count {
  font-size: 0.8125rem;
  color: var(--text-caption);
}

/* ── Banners ─────────────────────────────────────────────────── */
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

/* ── Acknowledgement badge ────────────────────────────────────── */
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

/* ── Category tag ───────────────────────────────────────────── */
.category-tag {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.date-cell {
  font-size: 0.8125rem;
  color: var(--text-body);
}

/* ── Acknowledged row ────────────────────────────────────────── */
.row-acknowledged td {
  opacity: 0.6;
}

.ack-done-label {
  font-size: 0.8125rem;
  color: var(--brand-success);
  font-weight: 500;
}
</style>
