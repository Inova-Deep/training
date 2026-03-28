<script setup lang="ts">
import { ref, computed } from 'vue'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAuthStore } from '@/stores/auth'
import { useSkillsMatrixStore } from '@/stores/skillsMatrix'
import { toast } from 'vue-sonner'

const props = defineProps<{
  open: boolean
  employeeName: string
  employeeId: string
  competencyTitle: string
  competencyId: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'saved'): void
}>()

const authStore = useAuthStore()
const matrixStore = useSkillsMatrixStore()

const today = new Date().toISOString().split('T')[0]

const assessmentDate = ref(today)
const assessmentMethod = ref('')
const outcome = ref('')
const notes = ref('')
const evidenceRef = ref('')

const assessorName = computed(() => authStore.activePersona.displayName)

const ASSESSMENT_METHODS = [
  'Practical Observation',
  'Written Assessment',
  'Supervisor Sign-off',
  'Portfolio Review',
  'External Exam',
]

const OUTCOMES = [
  { value: 'Competent', label: 'Competent' },
  { value: 'Not Yet Competent', label: 'Not Yet Competent' },
  { value: 'Partially Competent', label: 'Partially Competent' },
]

function resetForm() {
  assessmentDate.value = today
  assessmentMethod.value = ''
  outcome.value = ''
  notes.value = ''
  evidenceRef.value = ''
}

function handleSave() {
  if (!outcome.value || !assessmentMethod.value) {
    toast.error('Please select an assessment method and outcome before saving.')
    return
  }

  // Update the competency item status in the matrix store (in-memory)
  const row = matrixStore.mockEmployeeRows.find((r) => r.employeeId === props.employeeId)
  if (row) {
    const item = row.competenceItems.get(props.competencyId)
    if (item) {
      if (outcome.value === 'Competent') {
        item.status = 'VALID'
        item.derivedStatus = 'VALID'
        item.lastCompletedAt = assessmentDate.value
        if (evidenceRef.value) item.evidenceRef = evidenceRef.value
      } else if (outcome.value === 'Not Yet Competent') {
        item.status = 'REQUIRED'
        item.derivedStatus = 'REQUIRED'
      }
      // Partially Competent → remain UNDER_SUPERVISION (no change)
    }
  }

  toast.success(
    `Assessment recorded — ${props.competencyTitle} marked ${outcome.value} for ${props.employeeName}`,
  )

  emit('saved')
  emit('update:open', false)
  resetForm()
}

function handleClose() {
  emit('update:open', false)
  resetForm()
}
</script>

<template>
  <Sheet :open="open" @update:open="handleClose">
    <SheetContent class="sheet-panel">
      <SheetHeader class="sheet-header">
        <SheetTitle class="sheet-title">Record Assessment Outcome</SheetTitle>
        <SheetDescription class="sheet-description">
          Record the result of a competency assessment for this employee.
        </SheetDescription>
      </SheetHeader>

      <div class="sheet-body">
        <!-- Pre-filled read-only fields -->
        <div class="form-section">
          <div class="section-label">Assessment Context</div>
          <div class="form-grid">
            <div class="form-field">
              <Label class="form-label">Employee</Label>
              <Input :model-value="employeeName" readonly class="readonly-input" />
            </div>
            <div class="form-field">
              <Label class="form-label">Assessor</Label>
              <Input :model-value="assessorName" readonly class="readonly-input" />
            </div>
          </div>
          <div class="form-field form-field-full">
            <Label class="form-label">Competency</Label>
            <Input :model-value="competencyTitle" readonly class="readonly-input" />
          </div>
        </div>

        <!-- Assessment details -->
        <div class="form-section">
          <div class="section-label">Assessment Details</div>
          <div class="form-grid">
            <div class="form-field">
              <Label for="assessment-date" class="form-label">Assessment Date</Label>
              <Input id="assessment-date" v-model="assessmentDate" type="date" />
            </div>
            <div class="form-field">
              <Label for="assessment-method" class="form-label">Assessment Method</Label>
              <Select v-model="assessmentMethod">
                <SelectTrigger id="assessment-method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="method in ASSESSMENT_METHODS" :key="method" :value="method">
                    {{ method }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <!-- Outcome -->
        <div class="form-section">
          <div class="section-label">Outcome</div>
          <RadioGroup v-model="outcome" class="outcome-group">
            <div
              v-for="opt in OUTCOMES"
              :key="opt.value"
              class="outcome-option"
              :class="{
                'outcome-competent': outcome === opt.value && opt.value === 'Competent',
                'outcome-not-yet': outcome === opt.value && opt.value === 'Not Yet Competent',
                'outcome-partial': outcome === opt.value && opt.value === 'Partially Competent',
              }"
            >
              <RadioGroupItem :id="`outcome-${opt.value}`" :value="opt.value" />
              <Label :for="`outcome-${opt.value}`" class="outcome-label">{{ opt.label }}</Label>
            </div>
          </RadioGroup>
        </div>

        <!-- Notes & Evidence -->
        <div class="form-section">
          <div class="section-label">Notes & Evidence</div>
          <div class="form-field form-field-full">
            <Label for="assessment-notes" class="form-label">Notes / Comments</Label>
            <Textarea
              id="assessment-notes"
              v-model="notes"
              placeholder="Add any relevant observations, conditions, or follow-up actions..."
              class="notes-textarea"
            />
          </div>
          <div class="form-field form-field-full">
            <Label for="evidence-ref" class="form-label"
              >Evidence Reference <span class="optional-hint">(optional)</span></Label
            >
            <Input id="evidence-ref" v-model="evidenceRef" placeholder="e.g. EV-2026-008" />
          </div>
        </div>
      </div>

      <SheetFooter class="sheet-footer">
        <Button variant="outline" @click="handleClose">Cancel</Button>
        <Button :disabled="!outcome || !assessmentMethod" @click="handleSave">
          <Save class="icon-xs" />
          Record Assessment
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
.sheet-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-md) 0;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-caption);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-bottom: var(--space-xs);
  border-bottom: var(--border-subtle);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field-full {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-heading);
}

.readonly-input {
  background-color: var(--bg-subtle);
  color: var(--text-caption);
  cursor: default;
}

.optional-hint {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--text-caption);
}

/* Outcome radio group */
.outcome-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.outcome-option {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.15s;
}

.outcome-option:hover {
  background-color: var(--bg-subtle);
}

.outcome-competent {
  border-color: var(--brand-success);
  background-color: oklch(0.62 0.14 162 / 0.08);
}

.outcome-not-yet {
  border-color: var(--brand-critical);
  background-color: oklch(0.55 0.18 30 / 0.08);
}

.outcome-partial {
  border-color: oklch(0.65 0.18 60);
  background-color: oklch(0.65 0.18 60 / 0.08);
}

.outcome-label {
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.notes-textarea {
  min-height: 80px;
  resize: vertical;
}
</style>
