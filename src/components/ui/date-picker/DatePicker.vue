<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CalendarIcon } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import type { DateValue } from '@internationalized/date'
import type { CalendarRootProps } from 'reka-ui'

interface Props {
  modelValue?: DateValue
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Pick a date',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: DateValue | undefined]
}>()

const open = ref(false)
const selectedDate = ref<DateValue | undefined>(props.modelValue)

watch(() => props.modelValue, (val) => {
  selectedDate.value = val
})

const formattedValue = computed(() => {
  if (!selectedDate.value) return ''
  const date = selectedDate.value.toDate('UTC')
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  })
})

const handleDateSelect = (value: CalendarRootProps['modelValue']) => {
  if (value && !Array.isArray(value)) {
    selectedDate.value = value as DateValue
  }
}

const handleConfirm = () => {
  if (selectedDate.value) {
    emit('update:modelValue', selectedDate.value)
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
        class="date-picker-trigger"
      >
        <CalendarIcon class="trigger-icon" />
        <span v-if="formattedValue">{{ formattedValue }}</span>
        <span v-else class="placeholder-text">{{ placeholder }}</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="date-picker-popover" align="start">
      <div class="date-picker-content">
        <Calendar
          :model-value="selectedDate"
          layout="month-and-year"
          @update:model-value="handleDateSelect"
        />
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
.date-picker-trigger {
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

.date-picker-popover {
  width: auto;
  padding: 0;
}

.date-picker-content {
  display: flex;
  flex-direction: column;
}

.actions-section {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding: var(--space-md);
  border-top: var(--border-subtle);
}
</style>
