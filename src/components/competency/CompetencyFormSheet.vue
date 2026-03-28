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
import { useReferenceListsStore } from '@/stores/referenceLists'
import { useCompetencyLibraryStore } from '@/stores/competencyLibrary'
import type { CompetencyLibraryItem, CompetencyType } from '@/types'

const props = defineProps<{
  open: boolean
  competency?: CompetencyLibraryItem | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'saved'): void
}>()

const refStore = useReferenceListsStore()
const libStore = useCompetencyLibraryStore()

const CATEGORIES = [
  'Technical',
  'Quality',
  'Mandatory',
  'HSE / Workshop Safety',
  'Equipment-Specific Qualification',
  'Quality & Compliance',
  'Welding & Fabrication',
  'Robotics & Automation',
  'Additive Manufacturing Operations',
  'Materials & Powder Handling',
  'Materials Testing & Inspection',
]

const COMPETENCY_TYPES = [
  { value: 'SKILL', label: 'Skill' },
  { value: 'TRAINING', label: 'Training' },
  { value: 'CERTIFICATION', label: 'Certification' },
  { value: 'AWARENESS_TOPIC', label: 'Awareness Topic' },
  { value: 'OJT_COACHING', label: 'OJT / Coaching' },
  { value: 'PROCEDURE_BRIEFING', label: 'Procedure Briefing' },
  { value: 'EXTERNAL_QUALIFICATION', label: 'External Qualification' },
  { value: 'EQUIPMENT_QUALIFICATION', label: 'Equipment Qualification' },
]

const ASSESSMENT_METHODS = [
  'Practical Observation',
  'Practical Demonstration',
  'Written Assessment',
  'External Exam',
  'Record Review',
  'Manager Sign-off',
  'Supervisor Sign-off',
]

const EVIDENCE_TYPES = [
  'Certificate',
  'Sign-off',
  'Observation Record',
  'Assessment Record',
  'Toolbox Talk Attendance',
  'Training Record',
]

const VALIDITY_INTERVALS = ['6 months', '12 months', '24 months', '36 months', 'No expiry']

const DEPARTMENTS = [
  'All',
  'Additive Manufacturing',
  'Welding & Fabrication',
  'Robotics & Automation',
  'Quality Assurance',
  'Materials Testing',
  'Maintenance',
  'QHSE',
  'HR',
  'Logistics',
]

const formData = ref({
  code: '',
  title: '',
  description: '',
  category: '',
  competencyType: '' as CompetencyType | '',
  riskLevelCode: '',
  criticalityDomain: '',
  defaultTrainingTypeCode: '',
  defaultAssessmentMethodCode: '',
  defaultRequiresExpiry: false,
  defaultValidityDays: 365,
  // Phase 9 new fields
  mandatory: false,
  safetyCritical: false,
  qualityCritical: false,
  assessmentMethod: '',
  evidenceType: '',
  validityInterval: 'No expiry',
  internalExternal: 'INTERNAL' as 'INTERNAL' | 'EXTERNAL',
  provider: '',
  linkedDocument: '',
  applicableDepartmentsInput: '', // comma-separated string for input
  applicableRolesInput: '', // comma-separated string for input
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      if (props.competency) {
        formData.value = {
          code: props.competency.code || '',
          title: props.competency.title,
          description: props.competency.description || '',
          category: props.competency.category,
          competencyType: props.competency.competencyType || ('' as CompetencyType | ''),
          riskLevelCode: props.competency.riskLevelCode,
          criticalityDomain: props.competency.criticalityDomain || '',
          defaultTrainingTypeCode: props.competency.defaultTrainingTypeCode,
          defaultAssessmentMethodCode: props.competency.defaultAssessmentMethodCode,
          defaultRequiresExpiry: props.competency.defaultRequiresExpiry,
          defaultValidityDays: props.competency.defaultValidityDays || 365,
          mandatory: props.competency.mandatory ?? false,
          safetyCritical: props.competency.safetyCritical ?? false,
          qualityCritical: props.competency.qualityCritical ?? false,
          assessmentMethod: props.competency.assessmentMethod || '',
          evidenceType: props.competency.evidenceType || '',
          validityInterval: props.competency.validityInterval || 'No expiry',
          internalExternal: props.competency.internalExternal || 'INTERNAL',
          provider: props.competency.provider || '',
          linkedDocument:
            props.competency.linkedDocument || props.competency.linkedDocumentRef || '',
          applicableDepartmentsInput: (props.competency.applicableDepartments || []).join(', '),
          applicableRolesInput: (props.competency.applicableRoles || []).join(', '),
        }
      } else {
        formData.value = {
          code: '',
          title: '',
          description: '',
          category: 'Technical',
          competencyType: 'SKILL',
          riskLevelCode: 'MEDIUM',
          criticalityDomain: '',
          defaultTrainingTypeCode: 'AWARENESS',
          defaultAssessmentMethodCode: 'MANAGER_SIGNOFF',
          defaultRequiresExpiry: false,
          defaultValidityDays: 365,
          mandatory: false,
          safetyCritical: false,
          qualityCritical: false,
          assessmentMethod: '',
          evidenceType: '',
          validityInterval: 'No expiry',
          internalExternal: 'INTERNAL',
          provider: '',
          linkedDocument: '',
          applicableDepartmentsInput: '',
          applicableRolesInput: '',
        }
      }
    }
  },
)

async function handleSave() {
  try {
    const { applicableDepartmentsInput, applicableRolesInput, ...rest } = formData.value
    const payload: Partial<CompetencyLibraryItem> = {
      ...rest,
      competencyType: (rest.competencyType || undefined) as CompetencyType | undefined,
      applicableDepartments: applicableDepartmentsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      applicableRoles: applicableRolesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }

    if (props.competency) {
      await libStore.updateCompetency(props.competency.id, payload)
    } else {
      await libStore.createCompetency(payload)
    }
    emit('saved')
    emit('update:open', false)
  } catch {
    // Error handled by store toast
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleSelectChange(field: keyof typeof formData.value, value: any) {
  ;(formData.value as Record<string, unknown>)[field] = value
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent class="sheet-panel">
      <SheetHeader class="sheet-header">
        <SheetTitle class="sheet-title">
          {{ competency ? 'Edit Competency' : 'Add New Competency' }}
        </SheetTitle>
        <SheetDescription class="sheet-description">
          Define the global default settings for this competency item.
        </SheetDescription>
      </SheetHeader>

      <div class="sheet-body">
        <!-- Basic Info -->
        <div class="form-section">
          <div class="form-grid">
            <div class="form-field">
              <Label for="code" class="form-label">Code</Label>
              <Input id="code" v-model="formData.code" placeholder="e.g. PTW-01" />
            </div>
            <div class="form-field">
              <Label for="comp-type" class="form-label">Type</Label>
              <Select
                :model-value="formData.competencyType"
                @update:model-value="handleSelectChange('competencyType', $event)"
              >
                <SelectTrigger id="comp-type">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="t in COMPETENCY_TYPES" :key="t.value" :value="t.value">
                    {{ t.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="form-field form-field-full">
            <Label for="title" class="form-label">Competency Title</Label>
            <Input id="title" v-model="formData.title" placeholder="Full descriptive title" />
          </div>

          <div class="form-field form-field-full">
            <Label for="description" class="form-label">Description</Label>
            <textarea
              id="description"
              v-model="formData.description"
              class="textarea-input"
              rows="3"
              placeholder="Brief summary of what this competency covers..."
            />
          </div>

          <div class="form-grid">
            <div class="form-field">
              <Label for="category" class="form-label">Category</Label>
              <Select
                :model-value="formData.category"
                @update:model-value="handleSelectChange('category', $event)"
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="cat in CATEGORIES" :key="cat" :value="cat">
                    {{ cat }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="form-field">
              <Label for="risk" class="form-label">Risk Level</Label>
              <Select
                :model-value="formData.riskLevelCode"
                @update:model-value="handleSelectChange('riskLevelCode', $event)"
              >
                <SelectTrigger id="risk">
                  <SelectValue placeholder="Select Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="risk in refStore.riskLevels"
                    :key="risk.code"
                    :value="risk.code"
                  >
                    {{ risk.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <!-- Flags -->
        <div class="form-section">
          <div class="section-title">Flags</div>
          <div class="flags-grid">
            <div class="flag-item">
              <Switch id="mandatory-flag" v-model:checked="formData.mandatory" />
              <Label for="mandatory-flag" class="flag-label">Mandatory</Label>
            </div>
            <div class="flag-item">
              <Switch id="safety-flag" v-model:checked="formData.safetyCritical" />
              <Label for="safety-flag" class="flag-label">Safety-Critical</Label>
            </div>
            <div class="flag-item">
              <Switch id="quality-flag" v-model:checked="formData.qualityCritical" />
              <Label for="quality-flag" class="flag-label">Quality-Critical</Label>
            </div>
          </div>
        </div>

        <!-- Assessment & Evidence -->
        <div class="form-section">
          <div class="section-title">Assessment &amp; Evidence</div>
          <div class="form-grid">
            <div class="form-field">
              <Label for="assessment-method" class="form-label">Assessment Method</Label>
              <Select
                :model-value="formData.assessmentMethod"
                @update:model-value="handleSelectChange('assessmentMethod', $event)"
              >
                <SelectTrigger id="assessment-method">
                  <SelectValue placeholder="Select Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="m in ASSESSMENT_METHODS" :key="m" :value="m">
                    {{ m }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="form-field">
              <Label for="evidence-type" class="form-label">Evidence Type</Label>
              <Select
                :model-value="formData.evidenceType"
                @update:model-value="handleSelectChange('evidenceType', $event)"
              >
                <SelectTrigger id="evidence-type">
                  <SelectValue placeholder="Select Evidence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="et in EVIDENCE_TYPES" :key="et" :value="et">
                    {{ et }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-field">
              <Label for="validity" class="form-label">Validity Interval</Label>
              <Select
                :model-value="formData.validityInterval"
                @update:model-value="handleSelectChange('validityInterval', $event)"
              >
                <SelectTrigger id="validity">
                  <SelectValue placeholder="Select Validity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="v in VALIDITY_INTERVALS" :key="v" :value="v">
                    {{ v }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="form-field">
              <Label class="form-label">Internal / External</Label>
              <div class="radio-group">
                <label class="radio-option">
                  <input
                    type="radio"
                    name="internalExternal"
                    value="INTERNAL"
                    :checked="formData.internalExternal === 'INTERNAL'"
                    @change="formData.internalExternal = 'INTERNAL'"
                  />
                  <span>Internal</span>
                </label>
                <label class="radio-option">
                  <input
                    type="radio"
                    name="internalExternal"
                    value="EXTERNAL"
                    :checked="formData.internalExternal === 'EXTERNAL'"
                    @change="formData.internalExternal = 'EXTERNAL'"
                  />
                  <span>External</span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-field">
              <Label for="provider" class="form-label">Provider / Owner</Label>
              <Input
                id="provider"
                v-model="formData.provider"
                placeholder="e.g. TWI Certification, Internal HSE Team"
              />
            </div>
            <div class="form-field">
              <Label for="linked-doc" class="form-label">Linked Document</Label>
              <Input
                id="linked-doc"
                v-model="formData.linkedDocument"
                placeholder="e.g. BS EN ISO 9606-1, CTA-PRO-004"
              />
            </div>
          </div>
        </div>

        <!-- Applicability -->
        <div class="form-section">
          <div class="section-title">Applicability</div>
          <div class="form-field form-field-full">
            <Label for="depts" class="form-label">Applicable Departments</Label>
            <Input
              id="depts"
              v-model="formData.applicableDepartmentsInput"
              placeholder="Comma-separated: Additive Manufacturing, Quality Assurance"
            />
            <p class="field-hint">Separate multiple departments with commas</p>
          </div>
          <div class="form-field form-field-full">
            <Label for="roles" class="form-label">Applicable Roles</Label>
            <Input
              id="roles"
              v-model="formData.applicableRolesInput"
              placeholder="Comma-separated: AM Technician, Robotics Operator"
            />
            <p class="field-hint">Separate multiple roles with commas</p>
          </div>
        </div>

        <!-- Training & Assessment Defaults (legacy) -->
        <div class="form-section">
          <div class="section-title">Training Defaults</div>
          <div class="form-grid">
            <div class="form-field">
              <Label for="training" class="form-label">Training Type</Label>
              <Select
                :model-value="formData.defaultTrainingTypeCode"
                @update:model-value="handleSelectChange('defaultTrainingTypeCode', $event)"
              >
                <SelectTrigger id="training">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="t in refStore.trainingTypes" :key="t.code" :value="t.code">
                    {{ t.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="form-field">
              <Label for="default-method" class="form-label">Default Assessment Method</Label>
              <Select
                :model-value="formData.defaultAssessmentMethodCode"
                @update:model-value="handleSelectChange('defaultAssessmentMethodCode', $event)"
              >
                <SelectTrigger id="default-method">
                  <SelectValue placeholder="Select Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="m in refStore.assessmentMethods" :key="m.code" :value="m.code">
                    {{ m.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <!-- Expiry -->
        <div class="expiry-section">
          <div class="expiry-header">
            <div class="expiry-header-text">
              <Label class="expiry-label">Requires Expiry / Renewal</Label>
              <p class="expiry-hint">Toggle if this competency is time-limited.</p>
            </div>
            <Switch v-model:checked="formData.defaultRequiresExpiry" />
          </div>

          <div v-if="formData.defaultRequiresExpiry" class="expiry-validity">
            <Label for="validity-days" class="form-label">Default Validity (Days)</Label>
            <div class="validity-input-group">
              <Input
                id="validity-days"
                v-model.number="formData.defaultValidityDays"
                type="number"
                class="validity-input"
              />
              <span class="validity-suffix">days from completion</span>
            </div>
          </div>
        </div>
      </div>

      <SheetFooter class="sheet-footer">
        <Button variant="outline" @click="emit('update:open', false)"> Cancel </Button>
        <Button :disabled="libStore.isSaving" @click="handleSave">
          <Save v-if="!libStore.isSaving" class="icon-xs" />
          <span v-else class="spinner spinner-sm" />
          {{ competency ? 'Update Competency' : 'Save Competency' }}
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
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.section-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-heading);
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
  gap: var(--space-xs);
}

.form-field-full {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-heading);
}

.textarea-input {
  width: 100%;
  border: var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-sm);
  font-size: 0.875rem;
  background: var(--bg-input, var(--bg-card));
  color: var(--text-body);
  resize: vertical;
  font-family: inherit;
}

.textarea-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.field-hint {
  font-size: 0.6875rem;
  color: var(--text-caption);
  margin: 0;
}

/* Flags */
.flags-grid {
  display: flex;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.flag-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.flag-label {
  font-size: 0.875rem;
  cursor: pointer;
}

/* Radio group */
.radio-group {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-xs) 0;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.875rem;
  cursor: pointer;
}

/* Expiry section */
.expiry-section {
  background-color: var(--bg-subtle);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
}

.expiry-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.expiry-header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.expiry-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-heading);
}

.expiry-hint {
  font-size: 0.6875rem;
  color: var(--text-caption);
  margin: 0;
}

.expiry-validity {
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: var(--border-subtle);
}

.validity-input-group {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.validity-input {
  width: 100px;
}

.validity-suffix {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.spinner {
  display: inline-block;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: var(--radius-full);
  animation: spin 0.6s linear infinite;
}

.spinner-sm {
  width: 14px;
  height: 14px;
}

.icon-xs {
  width: 14px;
  height: 14px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
