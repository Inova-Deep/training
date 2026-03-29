<script setup lang="ts">
import { ref, watch } from 'vue'
import { Save } from 'lucide-vue-next'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'vue-sonner'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AwarenessTopic {
  id: string
  title: string
  description: string
  category: string
  targetAudience: string
  dueDate: string
  completion: string
  completionAcknowledged: number
  completionTotal: number
  status: string
  topicType: string
  deliveryMethod: string
  trigger: string
  relatedDocumentRef: string
  effectiveDate: string
  workflowStatus: string
  acknowledgementRequired: boolean
  briefingRequired: boolean
  verificationRequired: boolean
  requiredAudience: string[]
}

// ─── Props & emits ─────────────────────────────────────────────────────────────

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'saved', topic: AwarenessTopic): void
}>()

// ─── Constants ─────────────────────────────────────────────────────────────────

const TOPIC_TYPES = [
  { value: 'PROCEDURE_REVISION', label: 'Procedure Revision' },
  { value: 'SAFETY_BRIEFING', label: 'Safety Briefing' },
  { value: 'QUALITY_ALERT', label: 'Quality Alert' },
  { value: 'CUSTOMER_REQUIREMENT', label: 'Customer Requirement' },
  { value: 'MANAGEMENT_SYSTEM_UPDATE', label: 'Management System Update' },
  { value: 'TOOLBOX_TALK', label: 'Toolbox Talk' },
  { value: 'NEW_EQUIPMENT_INTRODUCTION', label: 'New Equipment Introduction' },
  { value: 'INCIDENT_LEARNING', label: 'Incident Learning' },
]

const DELIVERY_METHODS = [
  { value: 'READ_AND_ACKNOWLEDGE', label: 'Read & Acknowledge' },
  { value: 'TEAM_BRIEFING', label: 'Team Briefing' },
  { value: 'TOOLBOX_TALK', label: 'Toolbox Talk' },
  { value: 'SUPERVISOR_CASCADE', label: 'Supervisor Cascade' },
  { value: 'FORMAL_RETRAINING', label: 'Formal Retraining' },
]

const AUDIENCE_OPTIONS = [
  'All Employees',
  'Welding / Fabrication Technician',
  'Additive Manufacturing Technician',
  'Robotics Operator',
  'Materials Testing Technician',
  'QA Inspector',
  'Production Supervisor',
  'HSE Coordinator',
  'HR / Training Coordinator',
]

// ─── Form state ────────────────────────────────────────────────────────────────

const defaultForm = () => ({
  title: '',
  topicType: '',
  trigger: '',
  relatedDocumentRef: '',
  effectiveDate: '',
  deliveryMethod: '',
  acknowledgementRequired: true,
  briefingRequired: false,
  verificationRequired: false,
})

const formData = ref(defaultForm())
const selectedAudience = ref<string[]>([])
const isSaving = ref(false)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      formData.value = defaultForm()
      selectedAudience.value = []
    }
  },
)

// ─── Audience checkboxes ───────────────────────────────────────────────────────

function toggleAudience(option: string) {
  const idx = selectedAudience.value.indexOf(option)
  if (idx === -1) {
    selectedAudience.value = [...selectedAudience.value, option]
  } else {
    selectedAudience.value = selectedAudience.value.filter((a) => a !== option)
  }
}

// ─── Save ──────────────────────────────────────────────────────────────────────

function handleSave() {
  if (!formData.value.title.trim() || !formData.value.topicType || !formData.value.deliveryMethod) {
    toast.error('Please fill in all required fields.')
    return
  }

  isSaving.value = true

  const audience = selectedAudience.value.length > 0 ? selectedAudience.value : ['All Employees']

  const newTopic: AwarenessTopic = {
    id: `at-${Date.now()}`,
    title: formData.value.title,
    description: formData.value.trigger,
    category: 'General',
    targetAudience: audience.join(', '),
    dueDate: formData.value.effectiveDate,
    completion: '0%',
    completionAcknowledged: 0,
    completionTotal: 0,
    status: 'Scheduled',
    topicType: formData.value.topicType,
    deliveryMethod: formData.value.deliveryMethod,
    trigger: formData.value.trigger,
    relatedDocumentRef: formData.value.relatedDocumentRef,
    effectiveDate: formData.value.effectiveDate,
    workflowStatus: 'DRAFTED',
    acknowledgementRequired: formData.value.acknowledgementRequired,
    briefingRequired: formData.value.briefingRequired,
    verificationRequired: formData.value.verificationRequired,
    requiredAudience: audience,
  }

  emit('saved', newTopic)
  toast.success('Awareness topic created')
  emit('update:open', false)
  isSaving.value = false
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent class="sheet-panel">
      <SheetHeader class="sheet-header">
        <SheetTitle class="sheet-title">Create Awareness Topic</SheetTitle>
        <SheetDescription class="sheet-description">
          Define a new controlled awareness communication for your workforce.
        </SheetDescription>
      </SheetHeader>

      <div class="sheet-body">
        <!-- Basic Info -->
        <div class="form-section">
          <div class="section-title">Topic Details</div>
          <div class="form-grid">
            <div class="form-field form-field-full">
              <Label for="at-title" class="form-label"
                >Title <span class="required-mark">*</span></Label
              >
              <Input
                id="at-title"
                v-model="formData.title"
                placeholder="e.g. Welding Procedure Revision Briefing"
              />
            </div>

            <div class="form-field">
              <Label for="at-type" class="form-label"
                >Topic Type <span class="required-mark">*</span></Label
              >
              <Select v-model="formData.topicType">
                <SelectTrigger id="at-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="type in TOPIC_TYPES" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="form-field">
              <Label for="at-delivery" class="form-label"
                >Delivery Method <span class="required-mark">*</span></Label
              >
              <Select v-model="formData.deliveryMethod">
                <SelectTrigger id="at-delivery">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="method in DELIVERY_METHODS"
                    :key="method.value"
                    :value="method.value"
                  >
                    {{ method.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="form-field form-field-full">
              <Label for="at-trigger" class="form-label">Trigger Description</Label>
              <Input
                id="at-trigger"
                v-model="formData.trigger"
                placeholder="e.g. CTA-PRO-004 revised to v2.0"
              />
            </div>

            <div class="form-field">
              <Label for="at-doc-ref" class="form-label">Related Document / Revision</Label>
              <Input
                id="at-doc-ref"
                v-model="formData.relatedDocumentRef"
                placeholder="e.g. CTA-PRO-004 v2.0"
              />
            </div>

            <div class="form-field">
              <Label for="at-effective-date" class="form-label">Effective Date</Label>
              <Input id="at-effective-date" v-model="formData.effectiveDate" type="date" />
            </div>
          </div>
        </div>

        <!-- Audience -->
        <div class="form-section">
          <div class="section-title">Required Audience</div>
          <div class="audience-grid">
            <label
              v-for="option in AUDIENCE_OPTIONS"
              :key="option"
              class="audience-option"
              :class="{ selected: selectedAudience.includes(option) }"
            >
              <input
                type="checkbox"
                class="audience-checkbox"
                :checked="selectedAudience.includes(option)"
                @change="toggleAudience(option)"
              />
              <span class="audience-label-text">{{ option }}</span>
            </label>
          </div>
          <p class="form-description">If none selected, defaults to "All Employees".</p>
        </div>

        <!-- Flags -->
        <div class="form-section">
          <div class="section-title">Requirements</div>
          <div class="toggles-stack">
            <div class="form-toggle-row">
              <div>
                <p class="form-toggle-label">Acknowledgement Required</p>
                <p class="form-toggle-desc">Employees must confirm they have read this topic.</p>
              </div>
              <Switch v-model:checked="formData.acknowledgementRequired" />
            </div>
            <div class="form-toggle-row">
              <div>
                <p class="form-toggle-label">Briefing Attendance Required</p>
                <p class="form-toggle-desc">Employees must attend a briefing session.</p>
              </div>
              <Switch v-model:checked="formData.briefingRequired" />
            </div>
            <div class="form-toggle-row">
              <div>
                <p class="form-toggle-label">Verification Required</p>
                <p class="form-toggle-desc">Supervisor must verify understanding before closure.</p>
              </div>
              <Switch v-model:checked="formData.verificationRequired" />
            </div>
          </div>
        </div>
      </div>

      <SheetFooter class="sheet-footer">
        <Button variant="outline" @click="emit('update:open', false)">Cancel</Button>
        <Button :disabled="isSaving" @click="handleSave">
          <Save class="icon-xs" />
          Create Topic
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.required-mark {
  color: var(--brand-critical);
  margin-left: 2px;
}

/* ── Audience checkboxes ─────────────────────────────────── */
.audience-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
}

.audience-option {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-sm);
  border: var(--border-subtle);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
  background-color: var(--bg-surface);
}

.audience-option:hover {
  border-color: var(--brand-primary);
  background-color: oklch(0 0 0 / 0.03);
}

.audience-option.selected {
  border-color: var(--brand-primary);
  background-color: oklch(0 0 0 / 0.05);
}

.audience-checkbox {
  width: 14px;
  height: 14px;
  accent-color: var(--brand-primary);
  flex-shrink: 0;
}

.audience-label-text {
  font-size: 0.8125rem;
  color: var(--text-body);
  line-height: 1.4;
}

/* ── Toggles ─────────────────────────────────────────────── */
.toggles-stack {
  display: flex;
  flex-direction: column;
  gap: 0;
  background-color: var(--bg-subtle);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.form-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-bottom: var(--border-subtle);
}

.form-toggle-row:last-child {
  border-bottom: none;
}

.form-toggle-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-heading);
  margin: 0 0 2px 0;
}

.form-toggle-desc {
  font-size: 0.6875rem;
  color: var(--text-caption);
  margin: 0;
}
</style>
