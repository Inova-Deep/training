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
import type { CompetencyLibraryItem } from '@/types'

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

const categories = ['Technical', 'Quality', 'Mandatory']

const formData = ref({
  code: '',
  title: '',
  description: '',
  category: '',
  riskLevelCode: '',
  criticalityDomain: '',
  defaultTrainingTypeCode: '',
  defaultAssessmentMethodCode: '',
  defaultRequiresExpiry: false,
  defaultValidityDays: 365,
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (props.competency) {
      formData.value = {
        code: props.competency.code || '',
        title: props.competency.title,
        description: props.competency.description || '',
        category: props.competency.category,
        riskLevelCode: props.competency.riskLevelCode,
        criticalityDomain: props.competency.criticalityDomain || '',
        defaultTrainingTypeCode: props.competency.defaultTrainingTypeCode,
        defaultAssessmentMethodCode: props.competency.defaultAssessmentMethodCode,
        defaultRequiresExpiry: props.competency.defaultRequiresExpiry,
        defaultValidityDays: props.competency.defaultValidityDays || 365,
      }
    } else {
      formData.value = {
        code: '',
        title: '',
        description: '',
        category: 'Technical',
        riskLevelCode: 'MEDIUM',
        criticalityDomain: '',
        defaultTrainingTypeCode: 'AWARENESS',
        defaultAssessmentMethodCode: 'MANAGER_SIGNOFF',
        defaultRequiresExpiry: false,
        defaultValidityDays: 365,
      }
    }
  }
})

async function handleSave() {
  try {
    if (props.competency) {
      await libStore.updateCompetency(props.competency.id, formData.value)
    } else {
      await libStore.createCompetency(formData.value)
    }
    emit('saved')
    emit('update:open', false)
  } catch (error) {
    // Error handled by store toast
  }
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
        <div class="form-section">
          <div class="form-grid">
            <div class="form-field">
              <Label for="code" class="form-label">Code</Label>
              <Input id="code" v-model="formData.code" placeholder="e.g. PTW-01" />
            </div>
            <div class="form-field">
              <Label for="category" class="form-label">Category</Label>
              <Select v-model="formData.category">
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="cat in categories" :key="cat" :value="cat">
                    {{ cat }}
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
            <Input 
              id="description" 
              v-model="formData.description" 
              placeholder="Brief summary of requirements..."
            />
          </div>

          <div class="form-grid">
            <div class="form-field">
              <Label for="risk" class="form-label">Risk Level</Label>
              <Select v-model="formData.riskLevelCode">
                <SelectTrigger id="risk">
                  <SelectValue placeholder="Select Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="risk in refStore.riskLevels" :key="risk.code" :value="risk.code">
                    {{ risk.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="form-field">
              <Label for="domain" class="form-label">Criticality Domain</Label>
              <Input id="domain" v-model="formData.criticalityDomain" placeholder="e.g. Safety Critical" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">Training & Assessment Defaults</div>
          
          <div class="form-grid">
            <div class="form-field">
              <Label for="training" class="form-label">Training Type</Label>
              <Select v-model="formData.defaultTrainingTypeCode">
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
              <Label for="method" class="form-label">Assessment Method</Label>
              <Select v-model="formData.defaultAssessmentMethodCode">
                <SelectTrigger id="method">
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

        <div class="expiry-section">
          <div class="expiry-header">
            <div class="expiry-header-text">
              <Label class="expiry-label">Requires Expiry / Renewal</Label>
              <p class="expiry-hint">Toggle if this competency is time-limited.</p>
            </div>
            <Switch v-model:checked="formData.defaultRequiresExpiry" />
          </div>
          
          <div v-if="formData.defaultRequiresExpiry" class="expiry-validity">
            <Label for="validity" class="form-label">Default Validity (Days)</Label>
            <div class="validity-input-group">
              <Input id="validity" v-model.number="formData.defaultValidityDays" type="number" class="validity-input" />
              <span class="validity-suffix">days from completion</span>
            </div>
          </div>
        </div>
      </div>

      <SheetFooter class="sheet-footer">
        <Button variant="outline" @click="emit('update:open', false)">
          Cancel
        </Button>
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

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
