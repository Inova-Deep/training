<script setup lang="ts">
import { MoreHorizontal, Plus } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import topicsData from '@/data/awarenessTopics.json'

const topics = topicsData
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">Awareness Topics</h1>
    <p class="page-subtitle">Create and target awareness topics to employees</p>
  </div>

  <Card class="data-card">
    <CardHeader class="data-card-header">
      <CardTitle class="data-card-title">Awareness Topics</CardTitle>
      <div class="data-card-actions">
        <Button size="sm">
          <Plus class="icon-xs" style="margin-right: var(--space-xs)" />
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
</style>
