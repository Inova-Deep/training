<script setup lang="ts">
import { computed } from 'vue'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

type Status = 'VALID' | 'REQUIRED' | 'IN_PROGRESS' | 'N_A' | 'EXPIRING' | 'EXPIRED'

interface Props {
  status: Status
  expiryDate?: string
  evidenceExpected?: string
  actionRequired?: string
  responsible?: string
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
})

const statusConfig: Record<Status, { label: string; chipClass: string }> = {
  VALID:       { label: 'Valid',        chipClass: 'chip-valid' },
  EXPIRING:    { label: 'Expiring',     chipClass: 'chip-expiring' },
  EXPIRED:     { label: 'Expired',      chipClass: 'chip-expired' },
  REQUIRED:    { label: 'Required',     chipClass: 'chip-required' },
  IN_PROGRESS: { label: 'In Progress',  chipClass: 'chip-in-progress' },
  N_A:         { label: 'N/A',          chipClass: 'chip-na' },
}

const config = computed(() => statusConfig[props.status])
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="ghost"
        class="status-chip"
        :class="[config.chipClass, { 'status-chip-compact': compact }]"
        :aria-label="`Status: ${config.label}${expiryDate ? `, expires ${expiryDate}` : ''}`"
      >
        {{ config.label }}
      </Button>
    </PopoverTrigger>

    <PopoverContent class="status-popover" align="start">
      <div class="popover-header">
        <span class="popover-status-title">{{ config.label }}</span>
      </div>

      <div
        v-if="expiryDate || evidenceExpected || actionRequired || responsible"
        class="popover-body"
      >
        <div v-if="expiryDate" class="popover-row">
          <span class="popover-label">Expiry</span>
          <span class="popover-value">{{ expiryDate }}</span>
        </div>
        <div v-if="evidenceExpected" class="popover-row">
          <span class="popover-label">Evidence Expected</span>
          <span class="popover-value">{{ evidenceExpected }}</span>
        </div>
        <div v-if="actionRequired" class="popover-row">
          <span class="popover-label">Action Required</span>
          <span class="popover-value">{{ actionRequired }}</span>
        </div>
        <div v-if="responsible" class="popover-row">
          <span class="popover-label">Responsible</span>
          <span class="popover-value">{{ responsible }}</span>
        </div>
      </div>

      <div class="popover-actions">
        <Button size="sm" variant="outline">View Evidence</Button>
        <Button size="sm">Upload Evidence</Button>
      </div>
    </PopoverContent>
  </Popover>
</template>

<style scoped>
/* Base chip — matches .badge sizing so all chips are identical height */
.status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.1875rem 0.625rem;
  border-radius: var(--radius-full);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  min-width: 4.5rem;
  white-space: nowrap;
  transition: opacity 0.15s ease;
}

.status-chip:hover {
  opacity: 0.75;
}

.status-chip:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

/* Compact variant used inside the grid cells */
.status-chip-compact {
  padding: 0.125rem 0.5rem;
  font-size: 0.625rem;
  min-width: 3.5rem;
}

/* Popover */
.status-popover {
  min-width: 220px;
}

.popover-header {
  margin-bottom: var(--space-sm);
  padding-bottom: var(--space-xs);
  border-bottom: var(--border-subtle);
}

.popover-status-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-heading);
}

.popover-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.popover-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.popover-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--text-caption);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.popover-value {
  font-size: 0.8125rem;
  color: var(--text-body);
}

.popover-actions {
  display: flex;
  gap: var(--space-xs);
  padding-top: var(--space-xs);
  border-top: var(--border-subtle);
}

.popover-actions :deep(button) {
  flex: 1;
}
</style>
