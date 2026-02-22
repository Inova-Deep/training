<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ChevronLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  FileText,
  History as HistoryIcon,
  ShieldCheck,
  Plus,
  Trash2,
  ExternalLink,
  Info
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { useRolesStore } from '@/stores/roles'
import { useCompetencyLibraryStore } from '@/stores/competencyLibrary'
import { erpApi } from '@/api'
import { organizationApi } from '@/api/client'
import type { JobTitle } from '@/api/client'
import type { RoleRequirement } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useRolesStore()
const libraryStore = useCompetencyLibraryStore()

const jobId = route.params.id as string
const jobTitle = ref<JobTitle | null>(null)
const activeTab = ref('applicability')

// Applicability Form State - use reactive for deep reactivity
const applicabilityForm = reactive({
  q1RoleSpecificTechnical: false,
  q2MgmtSystemResponsibilities: false,
  q3MandatoryRequirements: false,
  q4EvidenceBeyondAwareness: false,
  q5SafetyQualityCritical: false,
  notes: ''
})

// Watch to sync store data back to form if needed
watch(() => store.currentRole, (newRole) => {
  if (newRole) {
    applicabilityForm.q1RoleSpecificTechnical = !!newRole.q1RoleSpecificTechnical
    applicabilityForm.q2MgmtSystemResponsibilities = !!newRole.q2MgmtSystemResponsibilities
    applicabilityForm.q3MandatoryRequirements = !!newRole.q3MandatoryRequirements
    applicabilityForm.q4EvidenceBeyondAwareness = !!newRole.q4EvidenceBeyondAwareness
    applicabilityForm.q5SafetyQualityCritical = !!newRole.q5SafetyQualityCritical
    applicabilityForm.notes = newRole.notes || ''
  }
}, { immediate: true })

function getStatusLabel(status: string) {
  switch (status) {
    case 'INCLUDED': return 'Included'
    case 'AWARENESS_ONLY': return 'Awareness Only'
    case 'OUT_OF_SCOPE': return 'Out of Scope'
    case 'PENDING': return 'Decision Pending'
    default: return 'No Decision'
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case 'INCLUDED': return 'badge-success'
    case 'AWARENESS_ONLY': return 'badge-warning'
    case 'OUT_OF_SCOPE': return 'badge-neutral'
    case 'PENDING': return 'badge-primary'
    default: return 'badge-outline'
  }
}

function formatDate(date: string | null | undefined) {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString()
}

// Role Requirements State
const isAddRequirementOpen = ref(false)

function openAddRequirement() {
  isAddRequirementOpen.value = true
}

async function handleAddRequirement(competencyId: string) {
  const currentSet = store.requirementSets.find(s => s.erpJobTitleId === jobId || s.erpJobTitleId === jobTitle.value?.id)
  if (!currentSet) return
  
  try {
    const competency = libraryStore.competencies.find(c => c.id === competencyId)
    if (competency) {
      await store.addRequirement(currentSet.id, {
        competencyLibraryItemId: competencyId,
        mandatory: true,
        isGating: competency.riskLevelCode === 'HIGH_CRITICAL',
        riskLevelCode: competency.riskLevelCode,
        trainingTypeCode: competency.defaultTrainingTypeCode,
        assessmentMethodCode: competency.defaultAssessmentMethodCode,
        requiresExpiry: competency.defaultRequiresExpiry,
        validityDays: competency.defaultValidityDays || undefined,
        sortOrder: store.roleRequirements.length + 1
      })
    }
  } catch (error) {
    console.error('Failed to add requirement', error)
  }
}

onMounted(async () => {
  try {
    const response = await organizationApi.getJobTitles({ size: 1000 })
    jobTitle.value = response.data.find((t) => t.id === jobId) || null
    
    if (jobTitle.value) {
      await store.fetchRole(jobTitle.value.id)
      await libraryStore.fetchCompetencies()
      
      // If we have requirement sets, fetch requirements for the first one
      await store.fetchRequirementSets()
      const jobSet = store.requirementSets.find(s => s.erpJobTitleId === jobId || s.erpJobTitleId === jobTitle.value?.id)
      if (jobSet) {
        await store.fetchRoleRequirements(jobSet.id)
      }
    }
  } catch (error) {
    console.error('Failed to load role details', error)
  }
})

const computedResult = computed(() => {
  if (applicabilityForm.q5SafetyQualityCritical) return 'INCLUDED'
  if (applicabilityForm.q4EvidenceBeyondAwareness) return 'INCLUDED'
  if (
    applicabilityForm.q1RoleSpecificTechnical || 
    applicabilityForm.q2MgmtSystemResponsibilities || 
    applicabilityForm.q3MandatoryRequirements
  ) return 'AWARENESS_ONLY'
  return 'OUT_OF_SCOPE'
})

const resultLabel = computed(() => {
  switch (computedResult.value) {
    case 'INCLUDED': return 'Included in Skills Matrix'
    case 'AWARENESS_ONLY': return 'Managed via Awareness/Induction Only'
    case 'OUT_OF_SCOPE': return 'Out of Scope'
    default: return 'Decision Pending'
  }
})

async function handleSaveApplicability() {
  if (!jobTitle.value) return
  try {
    await store.updateRole(jobTitle.value.id, {
      ...applicabilityForm,
      result: computedResult.value as any
    })
  } catch (error) {
    console.error('Save failed', error)
  }
}

function getCompetencyName(id: string) {
  const comp = libraryStore.competencies.find(c => c.id === id)
  return comp ? comp.title : id // title is the correct prop in CompetencyLibraryItem
}

function getRiskClass(risk: string) {
  switch (risk) {
    case 'HIGH_CRITICAL': return 'text-destructive font-bold'
    case 'MEDIUM': return 'text-amber-600 font-medium'
    default: return 'text-text-caption'
  }
}

function goBack() {
  router.push('/roles')
}
</script>

<template>
  <div v-if="jobTitle" class="role-workspace">
    <div class="page-header flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="goBack">
        <ChevronLeft class="size-5" />
      </Button>
      <div>
        <h1 class="page-title">{{ jobTitle.name }}</h1>
        <p class="page-subtitle">{{ jobTitle.code }} • Job Title Workspace</p>
      </div>
      
      <div class="ml-auto flex items-center gap-2">
        <div v-if="store.currentRole" class="badge" :class="getStatusClass(store.currentRole.result)">
          <CheckCircle2 v-if="store.currentRole.result === 'INCLUDED'" class="icon-xxs mr-1" />
          <AlertCircle v-else-if="store.currentRole.result === 'AWARENESS_ONLY'" class="icon-xxs mr-1" />
          <HelpCircle v-else class="icon-xxs mr-1" />
          {{ getStatusLabel(store.currentRole.result) }}
        </div>
      </div>
    </div>

    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="mb-6">
        <TabsTrigger value="applicability" class="gap-2">
          <ShieldCheck class="size-4" />
          Applicability Decision
        </TabsTrigger>
        <TabsTrigger value="requirements" class="gap-2">
          <FileText class="size-4" />
          Role Requirements
        </TabsTrigger>
        <TabsTrigger value="history" class="gap-2">
          <HistoryIcon class="size-4" />
          History
        </TabsTrigger>
      </TabsList>

      <TabsContent value="applicability">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Decision Questions</CardTitle>
                <CardDescription>Answer the following questions to determine if this role requires verified competence tracking.</CardDescription>
              </CardHeader>
              <CardContent class="space-y-6">
                <!-- Q1 -->
                <div class="question-item flex items-start justify-between p-4 bg-bg-app rounded-lg border border-border">
                  <div class="space-y-1 pr-4">
                    <Label class="text-sm font-semibold">Q1) Technical Verification</Label>
                    <p class="text-xs text-text-caption">Does this Job Title have role-specific technical competence requirements that must be verified before independent work?</p>
                  </div>
                  <Switch v-model:checked="applicabilityForm.q1RoleSpecificTechnical" />
                </div>

                <!-- Q2 -->
                <div class="question-item flex items-start justify-between p-4 bg-bg-app rounded-lg border border-border">
                  <div class="space-y-1 pr-4">
                    <Label class="text-sm font-semibold">Q2) Governance Responsibilities</Label>
                    <p class="text-xs text-text-caption">Does this Job Title include management system / governance responsibilities that require competence evidence (e.g., procedure compliance)?</p>
                  </div>
                  <Switch v-model:checked="applicabilityForm.q2MgmtSystemResponsibilities" />
                </div>

                <!-- Q3 -->
                <div class="question-item flex items-start justify-between p-4 bg-bg-app rounded-lg border border-border">
                  <div class="space-y-1 pr-4">
                    <Label class="text-sm font-semibold">Q3) Mandatory Requirements</Label>
                    <p class="text-xs text-text-caption">Does this Job Title have mandatory requirements (legal, regulatory, customer, certification) that require tracked evidence?</p>
                  </div>
                  <Switch v-model:checked="applicabilityForm.q3MandatoryRequirements" />
                </div>

                <!-- Q4 -->
                <div class="question-item flex items-start justify-between p-4 bg-bg-app rounded-lg border border-border">
                  <div class="space-y-1 pr-4">
                    <Label class="text-sm font-semibold">Q4) Evidence Beyond Awareness</Label>
                    <p class="text-xs text-text-caption">Do any requirements for this Job Title require evidence beyond induction/awareness acknowledgement (e.g., certificates, OJT sign-off)?</p>
                  </div>
                  <Switch v-model:checked="applicabilityForm.q4EvidenceBeyondAwareness" />
                </div>

                <!-- Q5 -->
                <div class="question-item flex items-start justify-between p-4 bg-bg-app rounded-lg border border-border">
                  <div class="space-y-1 pr-4">
                    <Label class="text-sm font-semibold">Q5) Safety/Quality Criticality</Label>
                    <p class="text-xs text-text-caption">Can lack of competence in this Job Title create a safety-critical or quality-critical impact (risk of serious incident)?</p>
                  </div>
                  <Switch v-model:checked="applicabilityForm.q5SafetyQualityCritical" />
                </div>

                <div class="pt-4 border-t border-border">
                  <Label class="form-label">Notes & Justification</Label>
                  <Input 
                    v-model="applicabilityForm.notes" 
                    placeholder="Provide reasoning for the decision above..."
                    class="h-9"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div class="space-y-6">
            <Card class="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle class="text-sm font-bold flex items-center gap-2">
                  <AlertCircle class="size-4 text-primary" />
                  Computed Result
                </CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-full" :class="computedResult === 'OUT_OF_SCOPE' ? 'bg-neutral-100' : 'bg-primary/20'">
                    <CheckCircle2 v-if="computedResult !== 'OUT_OF_SCOPE'" class="size-6 text-primary" />
                    <HelpCircle v-else class="size-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div class="text-sm font-bold">{{ resultLabel }}</div>
                    <p class="text-[0.7rem] text-text-caption">Based on the answers provided in the form.</p>
                  </div>
                </div>

                <Button class="w-full" :disabled="store.isSaving" @click="handleSaveApplicability">
                  <Save v-if="!store.isSaving" class="size-4 mr-2" />
                  <span v-else class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Save Decision
                </Button>
              </CardContent>
            </Card>
            
            <Card v-if="store.currentRole">
              <CardHeader>
                <CardTitle class="text-xs font-semibold uppercase tracking-wider text-text-caption text-center">Audit Trail</CardTitle>
              </CardHeader>
              <CardContent class="text-xs space-y-2">
                <div class="flex justify-between">
                  <span class="text-text-caption">Last Reviewed By</span>
                  <span class="font-medium">{{ store.currentRole.createdByUserId }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-text-caption">Last Review Date</span>
                  <span class="font-medium">{{ formatDate(store.currentRole.createdAt) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-text-caption">Status</span>
                  <span class="badge" :class="getStatusClass(store.currentRole.result)">{{ store.currentRole.result }}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="requirements">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold">Requirement Pack</h2>
              <p class="text-sm text-text-caption">Competencies required for this job title to be considered authorised.</p>
            </div>
            <div class="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Info class="size-4 mr-2" />
                Rules Info
              </Button>
              <Button size="sm">
                <Plus class="size-4 mr-2" />
                Add Competency
              </Button>
            </div>
          </div>

          <Card>
            <CardContent class="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="w-[300px]">Competency</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Mandatory</TableHead>
                    <TableHead>Gating</TableHead>
                    <TableHead>Training Type</TableHead>
                    <TableHead>Assessment</TableHead>
                    <TableHead class="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="req in store.roleRequirements" :key="req.id">
                    <TableCell class="font-medium">
                      {{ getCompetencyName(req.competencyLibraryItemId) }}
                    </TableCell>
                    <TableCell>
                      <span :class="getRiskClass(req.riskLevelCode)">
                        {{ req.riskLevelCode.replace('_', '/') }}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge v-if="req.mandatory" variant="secondary" class="bg-primary/10 text-primary border-none">Yes</Badge>
                      <span v-else class="text-text-caption">-</span>
                    </TableCell>
                    <TableCell>
                      <Badge v-if="req.isGating" variant="default" class="bg-destructive/10 text-destructive hover:bg-destructive/20 border-none">Gating</Badge>
                      <span v-else class="text-text-caption">-</span>
                    </TableCell>
                    <TableCell class="text-xs uppercase opacity-80">
                      {{ req.trainingTypeCode.replace('_', ' ') }}
                    </TableCell>
                    <TableCell class="text-xs uppercase opacity-80">
                      {{ req.assessmentMethodCode.replace('_', ' ') }}
                    </TableCell>
                    <TableCell class="text-right">
                      <Button variant="ghost" size="icon" class="size-8">
                        <Trash2 class="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow v-if="store.roleRequirements.length === 0">
                    <TableCell colspan="7" class="py-12 text-center text-muted-foreground">
                      No requirements configured for this role yet.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="history">
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <div>
                <CardTitle>Version History</CardTitle>
                <CardDescription>Published versions of this role's requirements.</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink class="size-4 mr-2" />
                Comparison Tool
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div v-for="set in store.requirementSets" :key="set.id" class="flex items-center justify-between p-4 border rounded-lg hover:bg-bg-app transition-colors">
                <div class="flex items-center gap-4">
                  <div class="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    v{{ set.version }}
                  </div>
                  <div>
                    <div class="font-semibold flex items-center gap-2">
                       {{ set.status }}
                       <Badge v-if="set.status === 'PUBLISHED'" variant="secondary" class="bg-success/10 text-success border-none text-[0.6rem] h-4">Active</Badge>
                    </div>
                    <div class="text-xs text-text-caption">
                      Published on {{ formatDate(set.publishedAt) }} by {{ set.publishedByUserId }}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">View Details</Button>
              </div>
              <div v-if="store.requirementSets.length === 0" class="py-8 text-center text-muted-foreground italic">
                No version history found.
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
  <div v-else class="p-12 text-center flex flex-col items-center justify-center gap-4">
    <span class="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full"></span>
    <span class="text-muted-foreground">Loading role workspace...</span>
  </div>
</template>

<style scoped>
.question-item {
  transition: all 0.2s ease;
}

.question-item:hover {
  border-color: var(--primary);
  background: white;
}

.icon-xxs {
  width: 12px;
  height: 12px;
}

.role-workspace {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
