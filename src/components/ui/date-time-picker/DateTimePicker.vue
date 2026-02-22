<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CalendarIcon, Clock } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { DateValue } from '@internationalized/date'

interface Props {
  modelValue?: DateValue
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Pick date and time',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: DateValue | undefined]
}>()

const open = ref(false)
const selectedDate = ref<DateValue | undefined>(props.modelValue)
const hours = ref('09')
const minutes = ref('00')

watch(() => props.modelValue, (val) => {
  selectedDate.value = val
})

const formattedValue = computed(() => {
  if (!selectedDate.value) return ''
  const date = selectedDate.value.toDate('UTC')
  return `${date.toLocaleDateString()} ${hours.value}:${minutes.value}`
})

const handleDateSelect = (value: unknown) => {
  if (value && typeof value === 'object' && 'toDate' in value && !Array.isArray(value)) {
    selectedDate.value = value as DateValue
    emit('update:modelValue', value as DateValue)
  }
}

const handleTimeChange = () => {
  let h = parseInt(hours.value)
  let m = parseInt(minutes.value)
  
  if (isNaN(h) || h < 0) h = 0
  if (h > 23) h = 23
  if (isNaN(m) || m < 0) m = 0
  if (m > 59) m = 59
  
  hours.value = h.toString().padStart(2, '0')
  minutes.value = m.toString().padStart(2, '0')
}

const handleConfirm = () => {
  if (selectedDate.value) {
    emit('update:modelValue', selectedDate.value as any)
  }
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :disabled="disabled"
        class="date-time-trigger"
      >
        <CalendarIcon class="trigger-icon" />
        <span v-if="formattedValue">{{ formattedValue }}</span>
        <span v-else class="placeholder-text">{{ placeholder }}</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="date-time-popover" align="start">
      <div class="date-time-content">
        <div class="calendar-section">
          <Calendar
            :model-value="(selectedDate as any)"
            layout="month-and-year"
            @update:model-value="(val: any) => handleDateSelect(val)"
          />
        </div>
        <div class="time-section">
          <div class="time-header">
            <Clock class="time-icon" />
            <span>Time</span>
          </div>
          <div class="time-inputs">
            <div class="time-input-group">
              <Label class="time-label">Hour</Label>
              <Input
                v-model="hours"
                type="number"
                min="0"
                max="23"
                class="time-input"
                @change="handleTimeChange"
              />
            </div>
            <span class="time-separator">:</span>
            <div class="time-input-group">
              <Label class="time-label">Minute</Label>
              <Input
                v-model="minutes"
                type="number"
                min="0"
                max="59"
                class="time-input"
                @change="handleTimeChange"
              />
            </div>
          </div>
        </div>
        <div class="actions-section">
          <Button variant="outline" size="sm" @click="open = false">
            Cancel
          </Button>
          <Button size="sm" @click="handleConfirm">
            Confirm
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>

<style scoped>
.date-time-trigger {
  justify-content: flex-start;
  width: 100%;
  font-weight: normal;
}

.trigger-icon {
  width: 16px;
  height: 16px;
  margin-right: var(--space-sm);
  opacity: 0.7;
}

.placeholder-text {
  color: var(--text-caption);
}

.date-time-popover {
  width: auto;
  padding: 0;
}

.date-time-content {
  display: flex;
  flex-direction: column;
}

.calendar-section {
  padding: var(--space-sm);
}

.time-section {
  padding: var(--space-md);
  border-top: var(--border-subtle);
  background-color: var(--bg-subtle);
}

.time-header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-heading);
}

.time-icon {
  width: 14px;
  height: 14px;
}

.time-inputs {
  display: flex;
  align-items: flex-end;
  gap: var(--space-xs);
}

.time-input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.time-label {
  font-size: 0.6875rem;
  color: var(--text-caption);
}

.time-input {
  width: 60px;
  text-align: center;
}

.time-separator {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--text-heading);
  margin-bottom: 0.25rem;
}

.actions-section {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding: var(--space-md);
  border-top: var(--border-subtle);
}
</style>
