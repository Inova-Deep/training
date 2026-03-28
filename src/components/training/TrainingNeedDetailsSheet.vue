<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperSeparator,
} from '@/components/ui/stepper'
import {
  GraduationCap,
  Users,
  ExternalLink,
  BookOpen,
  FileText,
  Eye,
  Award,
  Check,
} from 'lucide-vue-next'
import {
  useTrainingNeedsStore,
  type ResolutionType,
  type ResolutionData,
} from '@/stores/trainingNeeds'
import { useEmployeesStore } from '@/stores/employees'
import { useCompetencyLibraryStore } from '@/stores/competencyLibrary'
import type { DateValue } from '@internationalized/date'
import type { TrainingNeedWorkflowStatus } from '@/types'

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
  return trainingStore.trainingNeeds.find((n) => n.id === props.needId) || null
})

const employee = computed(() => {
  if (!currentNeed.value) return null
  return empStore.employees.find((e) => e.id === currentNeed.value?.erpEmployeeId) || null
})

const competency = computed(() => {
  if (!currentNeed.value) return null
  return (
    compStore.competencies.find((c) => c.id === currentNeed.value?.employeeCompetenceItemId) || null
  )
})

// ── Workflow stepper ──────────────────────────────────────────────────────────
const workflowSteps: { key: TrainingNeedWorkflowStatus; label: string }[] = [
  { key: 'IDENTIFIED', label: 'Identified' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'SCHEDULED', label: 'Scheduled' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'EVIDENCE_SUBMITTED', label: 'Evidence' },
  { key: 'EFFECTIVENESS_REVIEW', label: 'Effectiveness' },
  { key: 'CLOSED', label: 'Closed' },
]

const currentStepIndex = computed(() => {
  const ws = currentNeed.value?.workflowStatus
  if (!ws) return 0
  const idx = workflowSteps.findIndex((s) => s.key === ws)
  return idx >= 0 ? idx : 0
})

// reka-ui Stepper expects 1-based modelValue
const stepperValue = computed(() => currentStepIndex.value + 1)

// ── Intervention types ────────────────────────────────────────────────────────
const selectedPath = ref<ResolutionType>('COACHING_OJT')
const plannedDate = ref<DateValue>()
const effectivenessCheckDue = ref<DateValue>()
const formData = ref<Partial<ResolutionData>>({
  type: 'COACHING_OJT',
  notes: '',
})

const isSubmitting = ref(false)

const interventionTypes: { key: ResolutionType; label: string; desc: string }[] = [
  { key: 'COACHING_OJT', label: 'Coaching / OJT', desc: 'Internal knowledge transfer' },
  { key: 'TOOLBOX_TALK', label: 'Toolbox Talk', desc: 'Team briefing on topic' },
  { key: 'EXTERNAL_COURSE', label: 'External Course', desc: 'Attend accredited training' },
  { key: 'INTERNAL_BRIEFING', label: 'Internal Briefing', desc: 'Classroom or one-to-one' },
  { key: 'PROCEDURE_READ_ACK', label: 'Read & Acknowledge', desc: 'Document review and sign-off' },
  {
    key: 'SUPERVISOR_OBSERVATION',
    label: 'Supervisor Obs.',
    desc: 'Observed practical demonstration',
  },
  { key: 'CERTIFICATION_RENEWAL', label: 'Cert. Renewal', desc: 'External recertification' },
]

const submitLabel = computed(() => {
  const labels: Record<ResolutionType, string> = {
    COACHING_OJT: 'Schedule Coaching / OJT',
    TOOLBOX_TALK: 'Schedule Toolbox Talk',
    EXTERNAL_COURSE: 'Book External Course',
    INTERNAL_BRIEFING: 'Schedule Internal Briefing',
    PROCEDURE_READ_ACK: 'Issue Read & Acknowledge',
    SUPERVISOR_OBSERVATION: 'Schedule Supervisor Observation',
    CERTIFICATION_RENEWAL: 'Book Certification Renewal',
  }
  return labels[selectedPath.value]
})

// Show effectiveness check for all except PROCEDURE_READ_ACK
const showEffectivenessCheck = computed(() => selectedPath.value !== 'PROCEDURE_READ_ACK')

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      const existing = currentNeed.value?.interventionType as ResolutionType | undefined
      selectedPath.value = existing ?? 'COACHING_OJT'
      plannedDate.value = undefined
      effectivenessCheckDue.value = undefined
      formData.value = { type: selectedPath.value, notes: '' }
    }
  },
)

watch(selectedPath, (val) => {
  formData.value = { ...formData.value, type: val }
})

const handleSubmit = async () => {
  if (!props.needId) return
  isSubmitting.value = true
  try {
    await trainingStore.resolveNeed(props.needId, {
      ...formData.value,
      type: selectedPath.value,
      plannedDate: plannedDate.value?.toString(),
      effectivenessCheckDue: effectivenessCheckDue.value?.toString(),
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
          <span class="badge badge-primary">Training Need</span>
          <span class="sheet-meta-id">ID: {{ needId }}</span>
        </div>
        <SheetTitle>Resolve Competence Gap</SheetTitle>
        <SheetDescription>
          Choose an intervention type to address this requirement for {{ employee?.firstName }}
          {{ employee?.lastName }}.
        </SheetDescription>
      </SheetHeader>

      <div class="sheet-body">
        <!-- Workflow Stepper -->
        <div class="stepper-wrapper">
          <Stepper :model-value="stepperValue" class="workflow-stepper">
            <StepperItem
              v-for="(step, index) in workflowSteps"
              :key="step.key"
              :step="index + 1"
              class="stepper-item-compact"
            >
              <StepperTrigger class="stepper-trigger-compact" as="div">
                <StepperIndicator class="stepper-indicator-compact">
                  <Check v-if="index < currentStepIndex" class="icon-xxs" />
                  <span v-else class="stepper-step-num">{{ index + 1 }}</span>
                </StepperIndicator>
                <StepperTitle class="stepper-title-compact">{{ step.label }}</StepperTitle>
              </StepperTrigger>
              <StepperSeparator
                v-if="index < workflowSteps.length - 1"
                class="stepper-sep-compact"
              />
            </StepperItem>
          </Stepper>
        </div>

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
                  <span class="context-meta-label">Source</span>
                  <span class="context-meta-value">{{ currentNeed?.sourceType }}</span>
                </div>
                <div class="context-meta-item">
                  <span class="context-meta-label">Reference</span>
                  <span class="context-meta-value">{{ currentNeed?.sourceReference || '—' }}</span>
                </div>
                <div class="context-meta-item">
                  <span class="context-meta-label">Risk Level</span>
                  <span class="context-meta-value">{{ competency?.riskLevelCode }}</span>
                </div>
                <div class="context-meta-item">
                  <span class="context-meta-label">Priority</span>
                  <span class="context-meta-value">{{ currentNeed?.priority }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="path-section-label">Intervention Type</div>

        <!-- 7 intervention types in a 4-column grid -->
        <RadioGroup v-model="selectedPath" class="path-grid">
          <div
            v-for="itype in interventionTypes"
            :key="itype.key"
            class="path-container"
            :class="{ active: selectedPath === itype.key }"
          >
            <RadioGroupItem
              :value="itype.key"
              :id="`path-${itype.key}`"
              class="sr-only"
              :aria-label="itype.label"
            />
            <Label :for="`path-${itype.key}`" class="path-label">
              <GraduationCap v-if="itype.key === 'COACHING_OJT'" class="icon-sm" />
              <Users v-else-if="itype.key === 'TOOLBOX_TALK'" class="icon-sm" />
              <ExternalLink v-else-if="itype.key === 'EXTERNAL_COURSE'" class="icon-sm" />
              <BookOpen v-else-if="itype.key === 'INTERNAL_BRIEFING'" class="icon-sm" />
              <FileText v-else-if="itype.key === 'PROCEDURE_READ_ACK'" class="icon-sm" />
              <Eye v-else-if="itype.key === 'SUPERVISOR_OBSERVATION'" class="icon-sm" />
              <Award v-else-if="itype.key === 'CERTIFICATION_RENEWAL'" class="icon-sm" />
              <span class="path-label-title">{{ itype.label }}</span>
              <span class="path-label-desc">{{ itype.desc }}</span>
            </Label>
          </div>
        </RadioGroup>

        <!-- Dynamic Form Fields -->
        <div class="resolution-form">
          <!-- COACHING_OJT: trainer name, planned date -->
          <div v-if="selectedPath === 'COACHING_OJT'" class="form-grid">
            <div class="form-field form-field-full">
              <Label for="trainer-name">Trainer Name</Label>
              <Input
                id="trainer-name"
                placeholder="Search employee..."
                v-model="formData.trainerName"
              />
            </div>
            <div class="form-field form-field-full">
              <Label for="planned-date-ojt">Planned Date</Label>
              <DatePicker
                id="planned-date-ojt"
                v-model="plannedDate"
                placeholder="Select planned date"
              />
            </div>
          </div>

          <!-- TOOLBOX_TALK: briefing lead, planned date, topic reference -->
          <div v-if="selectedPath === 'TOOLBOX_TALK'" class="form-grid">
            <div class="form-field form-field-full">
              <Label for="briefing-lead">Briefing Lead</Label>
              <Input
                id="briefing-lead"
                placeholder="Search employee..."
                v-model="formData.briefingLead"
              />
            </div>
            <div class="form-field form-field-full">
              <Label for="planned-date-tt">Planned Date</Label>
              <DatePicker
                id="planned-date-tt"
                v-model="plannedDate"
                placeholder="Select planned date"
              />
            </div>
            <div class="form-field form-field-full">
              <Label for="topic-ref">Topic Reference</Label>
              <Input
                id="topic-ref"
                placeholder="e.g. TBT-2026-004"
                v-model="formData.topicReference"
              />
            </div>
          </div>

          <!-- EXTERNAL_COURSE: provider name, planned date -->
          <div v-if="selectedPath === 'EXTERNAL_COURSE'" class="form-grid">
            <div class="form-field form-field-full">
              <Label for="provider-name">Provider Name</Label>
              <Input
                id="provider-name"
                placeholder="e.g. Red Cross, OPITO"
                v-model="formData.providerName"
              />
            </div>
            <div class="form-field form-field-full">
              <Label for="planned-date-ec">Planned Date</Label>
              <DatePicker
                id="planned-date-ec"
                v-model="plannedDate"
                placeholder="Select planned date"
              />
            </div>
          </div>

          <!-- INTERNAL_BRIEFING: facilitator, planned date, location -->
          <div v-if="selectedPath === 'INTERNAL_BRIEFING'" class="form-grid">
            <div class="form-field form-field-full">
              <Label for="facilitator">Facilitator</Label>
              <Input
                id="facilitator"
                placeholder="Search employee..."
                v-model="formData.facilitator"
              />
            </div>
            <div class="form-field form-field-full">
              <Label for="planned-date-ib">Planned Date</Label>
              <DatePicker
                id="planned-date-ib"
                v-model="plannedDate"
                placeholder="Select planned date"
              />
            </div>
            <div class="form-field form-field-full">
              <Label for="location">Location</Label>
              <Input id="location" placeholder="e.g. Training Room 1" v-model="formData.location" />
            </div>
          </div>

          <!-- PROCEDURE_READ_ACK: document reference -->
          <div v-if="selectedPath === 'PROCEDURE_READ_ACK'" class="form-grid">
            <div class="form-field form-field-full">
              <Label for="doc-ref">Document Reference</Label>
              <Input
                id="doc-ref"
                placeholder="e.g. CTA-PRO-004 v2.0"
                v-model="formData.documentReference"
              />
            </div>
          </div>

          <!-- SUPERVISOR_OBSERVATION: designated supervisor, planned date -->
          <div v-if="selectedPath === 'SUPERVISOR_OBSERVATION'" class="form-grid">
            <div class="form-field form-field-full">
              <Label for="supervisor">Designated Supervisor</Label>
              <Input
                id="supervisor"
                placeholder="Search employee..."
                v-model="formData.designatedSupervisor"
              />
            </div>
            <div class="form-field form-field-full">
              <Label for="planned-date-so">Planned Date</Label>
              <DatePicker
                id="planned-date-so"
                v-model="plannedDate"
                placeholder="Select planned date"
              />
            </div>
          </div>

          <!-- CERTIFICATION_RENEWAL: provider, planned date, certification body -->
          <div v-if="selectedPath === 'CERTIFICATION_RENEWAL'" class="form-grid">
            <div class="form-field form-field-full">
              <Label for="cert-provider">Provider</Label>
              <Input
                id="cert-provider"
                placeholder="e.g. OPITO, City and Guilds"
                v-model="formData.providerName"
              />
            </div>
            <div class="form-field form-field-full">
              <Label for="planned-date-cr">Planned Date</Label>
              <DatePicker
                id="planned-date-cr"
                v-model="plannedDate"
                placeholder="Select planned date"
              />
            </div>
            <div class="form-field form-field-full">
              <Label for="cert-body">Certification Body</Label>
              <Input
                id="cert-body"
                placeholder="e.g. SQA, NEBOSH"
                v-model="formData.certificationBody"
              />
            </div>
          </div>

          <!-- Effectiveness Check (all except PROCEDURE_READ_ACK) -->
          <div v-if="showEffectivenessCheck" class="effectiveness-section">
            <div class="effectiveness-section-label">Effectiveness Check</div>
            <div class="form-grid">
              <div class="form-field form-field-full">
                <Label for="eff-method">Effectiveness Check Method</Label>
                <Select v-model="formData.effectivenessCheckMethod">
                  <SelectTrigger id="eff-method">
                    <SelectValue placeholder="Select method..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPERVISOR_OBSERVATION">Supervisor Observation</SelectItem>
                    <SelectItem value="TEST_QUIZ">Test / Quiz</SelectItem>
                    <SelectItem value="PORTFOLIO_REVIEW">Portfolio Review</SelectItem>
                    <SelectItem value="MANAGER_SIGN_OFF">Manager Sign-off</SelectItem>
                    <SelectItem value="90_DAY_REVIEW">90-Day Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="form-field form-field-full">
                <Label for="eff-due">Effectiveness Check Due</Label>
                <DatePicker
                  id="eff-due"
                  v-model="effectivenessCheckDue"
                  placeholder="Default: 90 days from planned date"
                />
              </div>
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
          {{ isSubmitting ? 'Submitting...' : submitLabel }}
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
/* Workflow Stepper */
.stepper-wrapper {
  margin-bottom: var(--space-lg);
  overflow-x: auto;
  padding-bottom: var(--space-xs);
}

.workflow-stepper {
  width: 100%;
  justify-content: space-between;
}

.stepper-item-compact {
  flex: 1;
  min-width: 0;
}

.stepper-trigger-compact {
  padding: var(--space-xs);
  gap: var(--space-xs);
}

.stepper-indicator-compact {
  width: 24px;
  height: 24px;
  font-size: 0.6875rem;
  font-weight: 700;
  flex-shrink: 0;
}

.stepper-step-num {
  font-size: 0.6875rem;
  font-weight: 700;
}

.stepper-title-compact {
  font-size: 0.6875rem;
  white-space: nowrap;
}

.stepper-sep-compact {
  flex: 1;
  height: 2px;
  margin-top: -12px;
}

/* Context card */
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

/* Sheet meta row */
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

/* Path grid */
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
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.path-container {
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-sm);
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
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
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-heading);
  text-align: center;
  line-height: 1.2;
}

.path-label-desc {
  font-size: 0.625rem;
  color: var(--text-caption);
  text-align: center;
  line-height: 1.3;
}

/* Resolution form */
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

/* Effectiveness check */
.effectiveness-section {
  border-top: var(--border-subtle);
  padding-top: var(--space-md);
}

.effectiveness-section-label {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-caption);
  margin-bottom: var(--space-sm);
}
</style>
