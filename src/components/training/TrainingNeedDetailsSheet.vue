<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  Upload, Calendar, UserCheck, GraduationCap, 
  FileText, CheckCircle2, AlertTriangle, Clock, Info
} from 'lucide-vue-next'
import { useTrainingNeedsStore, type ResolutionType, type ResolutionData } from '@/stores/trainingNeeds'
import { useEmployeesStore } from '@/stores/employees'
import { useCompetencyLibraryStore } from '@/stores/competencyLibrary'
import { toast } from 'vue-sonner'

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
const formData = ref<Partial<ResolutionData>>({
  type: 'UPLOAD',
  notes: ''
})

const isSubmitting = ref(false)

watch(() => props.isOpen, (val) => {
  if (val) {
    selectedPath.value = 'UPLOAD'
    formData.value = {
      type: 'UPLOAD',
      notes: ''
    }
  }
})

const handleSubmit = async () => {
  if (!props.needId) return
  
  isSubmitting.value = true
  try {
    await trainingStore.resolveNeed(props.needId, {
      ...formData.value,
      type: selectedPath.value
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
    <SheetContent class="sm:max-w-[540px] flex flex-col h-full p-0">
      <SheetHeader class="p-6 border-b">
        <div class="flex items-center gap-2 mb-2">
          <span class="badge badge-primary text-[10px] uppercase">Gating Requirement</span>
          <span class="text-xs text-muted-foreground">ID: {{ needId }}</span>
        </div>
        <SheetTitle class="text-xl">Resolve Competence Gap</SheetTitle>
        <SheetDescription>
          Choose a resolution path to address this requirement for {{ employee?.firstName }} {{ employee?.lastName }}.
        </SheetDescription>
      </SheetHeader>

      <div class="flex-1 overflow-y-auto p-6 scrollbar-hide">
        <!-- Context Card -->
        <div class="context-info mb-8">
          <div class="flex items-start gap-4">
            <div class="comp-icon bg-primary/10 text-primary">
              <GraduationCap class="icon-md" />
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-foreground">{{ competency?.title }}</h4>
              <p class="text-sm text-muted-foreground mb-3">{{ competency?.description }}</p>
              
              <div class="grid grid-cols-2 gap-y-2">
                <div class="flex flex-col">
                  <span class="text-[10px] uppercase text-muted-foreground font-bold">Reason</span>
                  <span class="text-sm font-medium">{{ currentNeed?.createdReason }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[10px] uppercase text-muted-foreground font-bold">Risk Level</span>
                  <span class="text-sm font-medium">{{ competency?.riskLevelCode }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="section-title mb-4">Resolution Path</div>
        
        <RadioGroup v-model="selectedPath" class="grid grid-cols-2 gap-4 mb-8">
          <div class="path-container" :class="{ 'active': selectedPath === 'UPLOAD' }">
            <RadioGroupItem value="UPLOAD" id="path-upload" class="sr-only" />
            <Label for="path-upload" class="path-label">
              <Upload class="icon-sm mb-2" />
              <span class="font-medium">Upload Cert</span>
              <span class="text-[10px] text-muted-foreground text-center">Already have evidence</span>
            </Label>
          </div>
          
          <div class="path-container" :class="{ 'active': selectedPath === 'RENEWAL' }">
            <RadioGroupItem value="RENEWAL" id="path-renewal" class="sr-only" />
            <Label for="path-renewal" class="path-label">
              <Calendar class="icon-sm mb-2" />
              <span class="font-medium">Book Training</span>
              <span class="text-[10px] text-muted-foreground text-center">Attend external course</span>
            </Label>
          </div>

          <div class="path-container" :class="{ 'active': selectedPath === 'OJT' }">
            <RadioGroupItem value="OJT" id="path-ojt" class="sr-only" />
            <Label for="path-ojt" class="path-label">
              <GraduationCap class="icon-sm mb-2" />
              <span class="font-medium">OJT / Coaching</span>
              <span class="text-[10px] text-muted-foreground text-center">Internal knowledge transfer</span>
            </Label>
          </div>

          <div class="path-container" :class="{ 'active': selectedPath === 'ASSESSMENT' }">
            <RadioGroupItem value="ASSESSMENT" id="path-assessment" class="sr-only" />
            <Label for="path-assessment" class="path-label">
              <UserCheck class="icon-sm mb-2" />
              <span class="font-medium">Assessment Only</span>
              <span class="text-[10px] text-muted-foreground text-center">Verify without training</span>
            </Label>
          </div>
        </RadioGroup>

        <!-- Dynamic Form Fields -->
        <div class="resolution-form space-y-4 pt-4 border-t">
          <div v-if="selectedPath === 'UPLOAD'" class="space-y-4">
            <div class="file-dropzone mb-4">
              <FileText class="icon-lg text-muted-foreground mb-2" />
              <p class="text-sm font-medium">Click to upload or drag & drop</p>
              <p class="text-[10px] text-muted-foreground">PDF, PNG, JPG (max 10MB)</p>
              <input type="file" class="hidden" />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>Issue Date</Label>
                <Input type="date" v-model="formData.issueDate" />
              </div>
              <div class="space-y-2">
                <Label>Expiry Date</Label>
                <Input type="date" v-model="formData.expiryDate" />
              </div>
            </div>
          </div>

          <div v-if="selectedPath === 'RENEWAL'" class="space-y-4">
            <div class="space-y-2">
              <Label>External Provider Name</Label>
              <Input placeholder="e.g. Red Cross, OPITO" v-model="formData.providerName" />
            </div>
            <div class="space-y-2">
              <Label>Planned Date</Label>
              <Input type="date" v-model="formData.plannedDate" />
            </div>
          </div>

          <div v-if="selectedPath === 'OJT'" class="space-y-4">
            <div class="space-y-2">
              <Label>Designated Trainer / Coach</Label>
              <Input placeholder="Search employee..." v-model="formData.trainerName" />
            </div>
          </div>

          <div v-if="selectedPath === 'ASSESSMENT'" class="space-y-4">
            <div class="space-y-2">
              <Label>Preferred Assessor</Label>
              <Input placeholder="Search assessor..." v-model="formData.assessorName" />
            </div>
          </div>

          <div class="space-y-2 pt-2">
            <Label>Notes / Comments</Label>
            <textarea 
              placeholder="Provide additional context for this resolution..." 
              class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              v-model="formData.notes"
            ></textarea>
          </div>
        </div>
      </div>

      <SheetFooter class="p-6 border-t bg-muted/30">
        <Button variant="ghost" @click="emit('update:isOpen', false)">Cancel</Button>
        <Button :disabled="isSubmitting" @click="handleSubmit">
          <span v-if="isSubmitting">Submitting...</span>
          <span v-else>Confirm Resolution</span>
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.context-info {
  background-color: var(--muted-light);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
}

.comp-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-title {
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.1em;
}

.path-container {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  transition: all 0.2s ease;
  cursor: pointer;
  background-color: white;
}

.path-container:hover {
  border-color: var(--primary-light);
  background-color: var(--primary-light);
}

.path-container.active {
  border-color: var(--primary);
  background-color: var(--primary-light);
  box-shadow: 0 0 0 1px var(--primary);
}

.path-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 100%;
}

.file-dropzone {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--muted-light);
  transition: all 0.2s ease;
  cursor: pointer;
}

.file-dropzone:hover {
  border-color: var(--primary);
  background-color: white;
}
</style>
