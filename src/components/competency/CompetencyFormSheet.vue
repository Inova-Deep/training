<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus, Save, X } from 'lucide-vue-next'
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
    <SheetContent class="sm:max-w-[540px] flex flex-col p-0 h-full">
      <SheetHeader class="sheet-header">
        <SheetTitle class="sheet-title">
          {{ competency ? 'Edit Competency' : 'Add New Competency' }}
        </SheetTitle>
        <SheetDescription class="sheet-description">
          Define the global default settings for this competency item.
        </SheetDescription>
      </SheetHeader>

      <div class="sheet-content flex-1 overflow-y-auto">
        <div class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group mb-0">
              <Label for="code" class="form-label">Code</Label>
              <Input id="code" v-model="formData.code" placeholder="e.g. PTW-01" class="h-9" />
            </div>
            <div class="form-group mb-0">
              <Label for="category" class="form-label">Category</Label>
              <Select v-model="formData.category">
                <SelectTrigger id="category" class="h-9">
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

          <div class="form-group">
            <Label for="title" class="form-label">Competency Title</Label>
            <Input id="title" v-model="formData.title" placeholder="Full descriptive title" class="h-9" />
          </div>

          <div class="form-group">
            <Label for="description" class="form-label">Description</Label>
            <Input 
              id="description" 
              v-model="formData.description" 
              placeholder="Brief summary of requirements..."
              class="h-9"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-group mb-0">
              <Label for="risk" class="form-label">Risk Level</Label>
              <Select v-model="formData.riskLevelCode">
                <SelectTrigger id="risk" class="h-9">
                  <SelectValue placeholder="Select Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="risk in refStore.riskLevels" :key="risk.code" :value="risk.code">
                    {{ risk.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="form-group mb-0">
              <Label for="domain" class="form-label">Criticality Domain</Label>
              <Input id="domain" v-model="formData.criticalityDomain" placeholder="e.g. Safety Critical" class="h-9" />
            </div>
          </div>

          <div class="section-title mt-8">Training & Assessment Defaults</div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group mb-0">
              <Label for="training" class="form-label">Training Type</Label>
              <Select v-model="formData.defaultTrainingTypeCode">
                <SelectTrigger id="training" class="h-9">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="t in refStore.trainingTypes" :key="t.code" :value="t.code">
                    {{ t.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="form-group mb-0">
              <Label for="method" class="form-label">Assessment Method</Label>
              <Select v-model="formData.defaultAssessmentMethodCode">
                <SelectTrigger id="method" class="h-9">
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

          <div class="p-4 bg-bg-app rounded-lg border border-border">
            <div class="flex items-center justify-between mb-4">
              <div class="space-y-0.5">
                <Label class="text-sm font-medium">Requires Expiry / Renewal</Label>
                <p class="text-[0.7rem] text-text-caption">Toggle if this competency is time-limited.</p>
              </div>
              <Switch v-model:checked="formData.defaultRequiresExpiry" />
            </div>
            
            <div v-if="formData.defaultRequiresExpiry" class="form-group mb-0 mt-4 transition-all">
              <Label for="validity" class="form-label">Default Validity (Days)</Label>
              <div class="flex items-center gap-2">
                <Input id="validity" v-model.number="formData.defaultValidityDays" type="number" class="h-9 w-24" />
                <span class="text-xs text-text-caption">days from completion</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SheetFooter class="sheet-footer border-t border-border">
        <Button variant="outline" size="sm" @click="emit('update:open', false)">
          Cancel
        </Button>
        <Button size="sm" :disabled="libStore.isSaving" @click="handleSave">
          <Save v-if="!libStore.isSaving" class="icon-xs mr-2" />
          <span v-else class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {{ competency ? 'Update Competency' : 'Save Competency' }}
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
.form-description {
  margin-bottom: var(--space-md);
}
</style>
