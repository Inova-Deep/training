<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Upload, Calendar, UserCheck, GraduationCap,
  FileText
} from 'lucide-vue-next'
import { useTrainingNeedsStore, type ResolutionType, type ResolutionData } from '@/stores/trainingNeeds'
import { useEmployeesStore } from '@/stores/employees'
import { useCompetencyLibraryStore } from '@/stores/competencyLibrary'
import type { DateValue } from '@internationalized/date'

const props = defineProps<{
  isOpen: boolean
  needId: string | null
}>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
}>()

const trainingStore = useTrainingNeedsStore()
const empStore = useEmployeesStore()
const compStore = useCompetencyLibraryStore()

const currentNeed = computed(() => {
  if (!props.needId) return null
  return trainingStore.trainingNeeds.find(n => n.id === props.needId) || null
})

const employee = computed(() => {
  if (!currentNeed.value) return null
  return empStore.employees.find(e => e.id === currentNeed.value?.erpEmployeeId) || null
})

const competency = computed(() => {
  if (!currentNeed.value) return null
  return compStore.competencies.find(c => c.id === currentNeed.value?.employeeCompetenceItemId) || null
})

const selectedPath = ref<ResolutionType>('UPLOAD')
const issueDate = ref<DateValue>()
const expiryDate = ref<DateValue>()
const plannedDate = ref<DateValue>()
const formData = ref<Partial<ResolutionData>>({
  type: 'UPLOAD',
  notes: ''
})

const isSubmitting = ref(false)

const submitLabel = computed(() => {
  const labels: Record<ResolutionType, string> = {
    UPLOAD:     'Submit Evidence',
    RENEWAL:    'Schedule Training',
    OJT:        'Schedule OJT',
    ASSESSMENT: 'Book Assessment',
  }
  return labels[selectedPath.value]
})

watch(() => props.isOpen, (val) => {
  if (val) {
    selectedPath.value = 'UPLOAD'
    issueDate.value = undefined
    expiryDate.value = undefined
    plannedDate.value = undefined
    formData.value = { type: 'UPLOAD', notes: '' }
  }
})

const handleSubmit = async () => {
  if (!props.needId) return
  isSubmitting.value = true
  try {
    await trainingStore.resolveNeed(props.needId, {
      ...formData.value,
      type: selectedPath.value,
      issueDate: issueDate.value?.toString(),
      expiryDate: expiryDate.value?.toString(),
      plannedDate: plannedDate.value?.toString()
    } as ResolutionData)
    emit('update:isOpen', false)
  } catch (e) {
    // Error handled by store
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Sheet :open="isOpen" @update:open="emit('update:isOpen', $event)">
    <SheetContent class="sheet-panel">
      <SheetHeader class="sheet-header">
        <div class="sheet-meta">
          <span class="badge badge-primary">Gating Requirement</span>
          <span class="sheet-meta-id">ID: {{ needId }}</span>
        </div>
        <SheetTitle>Resolve Competence Gap</SheetTitle>
        <SheetDescription>
          Choose a resolution path to address this requirement for {{ employee?.firstName }} {{ employee?.lastName }}.
        </SheetDescription>
      </SheetHeader>

      <div class="sheet-body">
        <!-- Context Card -->
        <div class="context-info">
          <div class="context-info-inner">
            <div class="comp-icon">
              <GraduationCap class="icon-md" />
            </div>
            <div class="context-text">
              <h4 class="context-comp-title">{{ competency?.title }}</h4>
              <p class="context-comp-desc">{{ competency?.description }}</p>
              <div class="context-meta-grid">
                <div class="context-meta-item">
                  <span class="context-meta-label">Reason</span>
                  <span class="context-meta-value">{{ currentNeed?.createdReason }}</span>
                </div>
                <div class="context-meta-item">
                  <span class="context-meta-label">Risk Level</span>
                  <span class="context-meta-value">{{ competency?.riskLevelCode }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="path-section-label">Resolution Path</div>

        <RadioGroup v-model="selectedPath" class="path-grid">
          <div class="path-container" :class="{ active: selectedPath === 'UPLOAD' }">
            <RadioGroupItem value="UPLOAD" id="path-upload" class="sr-only" aria-label="Upload certificate" />
            <Label for="path-upload" class="path-label">
              <Upload class="icon-sm" />
              <span class="path-label-title">Upload Cert</span>
              <span class="path-label-desc">Already have evidence</span>
            </Label>
          </div>

          <div class="path-container" :class="{ active: selectedPath === 'RENEWAL' }">
            <RadioGroupItem value="RENEWAL" id="path-renewal" class="sr-only" aria-label="Book training" />
            <Label for="path-renewal" class="path-label">
              <Calendar class="icon-sm" />
              <span class="path-label-title">Book Training</span>
              <span class="path-label-desc">Attend external course</span>
            </Label>
          </div>

          <div class="path-container" :class="{ active: selectedPath === 'OJT' }">
            <RadioGroupItem value="OJT" id="path-ojt" class="sr-only" aria-label="OJT coaching" />
            <Label for="path-ojt" class="path-label">
              <GraduationCap class="icon-sm" />
              <span class="path-label-title">OJT / Coaching</span>
              <span class="path-label-desc">Internal knowledge transfer</span>
            </Label>
          </div>

          <div class="path-container" :class="{ active: selectedPath === 'ASSESSMENT' }">
            <RadioGroupItem value="ASSESSMENT" id="path-assessment" class="sr-only" aria-label="Assessment only" />
            <Label for="path-assessment" class="path-label">
              <UserCheck class="icon-sm" />
              <span class="path-label-title">Assessment Only</span>
              <span class="path-label-desc">Verify without training</span>
            </Label>
          </div>
        </RadioGroup>

        <!-- Dynamic Form Fields -->
        <div class="resolution-form">

          <div v-if="selectedPath === 'UPLOAD'">
            <div class="file-dropzone">
              <FileText class="icon-lg" />
              <p class="dropzone-title">Click to upload or drag &amp; drop</p>
              <p class="dropzone-hint">PDF, PNG, JPG (max 10MB)</p>
            </div>
            <div class="form-grid">
              <div class="form-field">
                <Label for="issue-date">Issue Date</Label>
                <DatePicker id="issue-date" v-model="issueDate" placeholder="Select issue date" />
              </div>
              <div class="form-field">
                <Label for="expiry-date">Expiry Date</Label>
                <DatePicker id="expiry-date" v-model="expiryDate" placeholder="Select expiry date" />
              </div>
            </div>
          </div>

          <div v-if="selectedPath === 'RENEWAL'" class="form-grid">
            <div class="form-field form-field-full">
              <Label for="provider-name">External Provider Name</Label>
              <Input id="provider-name" placeholder="e.g. Red Cross, OPITO" v-model="formData.providerName" />
            </div>
            <div class="form-field form-field-full">
              <Label for="planned-date">Planned Date</Label>
              <DatePicker id="planned-date" v-model="plannedDate" placeholder="Select planned date" />
            </div>
          </div>

          <div v-if="selectedPath === 'OJT'" class="form-grid">
            <div class="form-field form-field-full">
              <Label for="trainer-name">Designated Trainer / Coach</Label>
              <Input id="trainer-name" placeholder="Search employee..." v-model="formData.trainerName" />
            </div>
          </div>

          <div v-if="selectedPath === 'ASSESSMENT'" class="form-grid">
            <div class="form-field form-field-full">
              <Label for="assessor-name">Preferred Assessor</Label>
              <Input id="assessor-name" placeholder="Search assessor..." v-model="formData.assessorName" />
            </div>
          </div>

          <div class="form-field resolution-notes">
            <Label for="resolution-notes">Notes / Comments</Label>
            <Textarea
              id="resolution-notes"
              placeholder="Provide additional context for this resolution..."
              :rows="3"
              v-model="formData.notes"
            />
          </div>

        </div>
      </div>

      <SheetFooter class="sheet-footer">
        <Button variant="outline" @click="emit('update:isOpen', false)">Cancel</Button>
        <Button :disabled="isSubmitting" @click="handleSubmit">
          {{ isSubmitting ? 'Submitting…' : submitLabel }}
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
/* ── Context card ─────────────────────────────────────────── */
.context-info {
  background-color: var(--bg-subtle);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  margin-bottom: var(--space-lg);
}

.context-info-inner {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
}

.comp-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background-color: oklch(0.38 0.14 266 / 0.1);
  color: var(--brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.context-text {
  flex: 1;
  min-width: 0;
}

.context-comp-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0 0 var(--space-xs) 0;
}

.context-comp-desc {
  font-size: 0.8125rem;
  color: var(--text-body);
  margin: 0 0 var(--space-sm) 0;
  line-height: 1.5;
}

.context-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xs);
}

.context-meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.context-meta-label {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-caption);
}

.context-meta-value {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-body);
}

/* ── Sheet meta row ───────────────────────────────────────── */
.sheet-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.sheet-meta-id {
  font-size: 0.75rem;
  color: var(--text-caption);
}

/* ── Resolution path grid ─────────────────────────────────── */
.path-section-label {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-caption);
  margin-bottom: var(--space-sm);
}

.path-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.path-container {
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  transition: border-color 0.15s ease, background-color 0.15s ease;
  cursor: pointer;
  background-color: var(--bg-surface);
}

.path-container:hover {
  border-color: var(--brand-primary);
  background-color: oklch(0.38 0.14 266 / 0.05);
}

.path-container.active {
  border-color: var(--brand-primary);
  background-color: oklch(0.38 0.14 266 / 0.08);
  box-shadow: 0 0 0 1px var(--brand-primary);
}

.path-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  cursor: pointer;
  width: 100%;
  color: var(--text-body);
}

.path-label-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-heading);
}

.path-label-desc {
  font-size: 0.6875rem;
  color: var(--text-caption);
  text-align: center;
}

/* ── Resolution form ──────────────────────────────────────── */
.resolution-form {
  border-top: var(--border-subtle);
  padding-top: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.resolution-notes {
  padding-top: var(--space-xs);
}

/* ── File dropzone ────────────────────────────────────────── */
.file-dropzone {
  border: 2px dashed oklch(0.82 0.015 255);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  background-color: var(--bg-subtle);
  transition: border-color 0.15s ease, background-color 0.15s ease;
  cursor: pointer;
  color: var(--text-caption);
  margin-bottom: var(--space-md);
}

.file-dropzone:hover {
  border-color: var(--brand-primary);
  background-color: var(--bg-surface);
}

.dropzone-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-body);
  margin: 0;
}

.dropzone-hint {
  font-size: 0.75rem;
  color: var(--text-caption);
  margin: 0;
}
</style>
