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
  ExternalLink,
  AlertTriangle,
  MoreHorizontal
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRolesStore } from '@/stores/roles'
import { useCompetencyLibraryStore } from '@/stores/competencyLibrary'
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

// ── Applicability form ──────────────────────────────────────────
const applicabilityForm = reactive({
  q1HandsOnOperational: false,
  q2ConformitySignOff: false,
  q3ErrorCausesImpact: false,
  q4SpecificCompetenceRequired: false,
  q5ObjectiveEvidenceRequired: false,
  notes: ''
})

watch(() => store.currentRole, (newRole) => {
  if (newRole) {
    applicabilityForm.q1HandsOnOperational = !!newRole.q1HandsOnOperational
    applicabilityForm.q2ConformitySignOff = !!newRole.q2ConformitySignOff
    applicabilityForm.q3ErrorCausesImpact = !!newRole.q3ErrorCausesImpact
    applicabilityForm.q4SpecificCompetenceRequired = !!newRole.q4SpecificCompetenceRequired
    applicabilityForm.q5ObjectiveEvidenceRequired = !!newRole.q5ObjectiveEvidenceRequired
    applicabilityForm.notes = newRole.notes || ''
  }
}, { immediate: true })

// ── Correct sequential decision tree matching the original matrix ──
// Gate 1: Q1 OR Q2 must be YES (hands-on OR conformity sign-off)
// Gate 2: Q3 must be YES (error can cause impact)
// Gate 3: Q4 must be YES → else AWARENESS_ONLY
// Gate 4: Q5 must be YES → else OUT_OF_SCOPE
const computedResult = computed((): 'INCLUDED' | 'AWARENESS_ONLY' | 'OUT_OF_SCOPE' => {
  if (!applicabilityForm.q1HandsOnOperational && !applicabilityForm.q2ConformitySignOff) return 'OUT_OF_SCOPE'
  if (!applicabilityForm.q3ErrorCausesImpact) return 'OUT_OF_SCOPE'
  if (!applicabilityForm.q4SpecificCompetenceRequired) return 'AWARENESS_ONLY'
  if (!applicabilityForm.q5ObjectiveEvidenceRequired) return 'OUT_OF_SCOPE'
  return 'INCLUDED'
})

function getStatusLabel(status: string) {
  switch (status) {
    case 'INCLUDED': return 'Applicable – Include in Skills Matrix'
    case 'AWARENESS_ONLY': return 'Manage via Awareness / Induction'
    case 'OUT_OF_SCOPE': return 'Not in Skills Matrix'
    default: return 'Decision Pending'
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case 'INCLUDED': return 'badge-success'
    case 'AWARENESS_ONLY': return 'badge-warning'
    case 'OUT_OF_SCOPE': return 'badge-neutral'
    default: return 'badge-primary'
  }
}

function formatDate(date: string | null | undefined) {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(async () => {
  try {
    const response = await organizationApi.getJobTitles({ size: 1000 })
    jobTitle.value = response.data.find((t) => t.id === jobId) || null

    if (jobTitle.value) {
      // Local JSON uses job title NAME as the key, not the UUID
      await store.fetchRole(jobTitle.value.name)
      await libraryStore.fetchCompetencies()
      await store.fetchRequirementSets()
      const jobSet = store.requirementSets.find(s =>
        jobTitle.value?.name.toLowerCase().includes(s.erpJobTitleId.toLowerCase())
      )
      if (jobSet) {
        await store.fetchRoleRequirements(jobSet.id)
      }
    }
  } catch (error) {
    console.error('Failed to load role details', error)
  }
})

async function handleSaveApplicability() {
  if (!jobTitle.value) return
  try {
    // Local JSON uses job title NAME as the key, not the UUID
    await store.updateRole(jobTitle.value.name, {
      ...applicabilityForm,
      result: computedResult.value
    })
  } catch (error) {
    console.error('Save failed', error)
  }
}

function getCompetencyName(id: string) {
  const comp = libraryStore.competencies.find(c => c.id === id)
  return comp?.title ?? id
}

// ── Requirement edit sheet ───────────────────────────────────
const editingReqId = ref<string | null>(null)
const isEditSheetOpen = ref(false)
const editForm = reactive({
  riskLevelCode: 'HIGH_CRITICAL',
  mandatory: false,
  isGating: false,
  trainingTypeCode: 'CERT_LICENCE',
  assessmentMethodCode: 'OBSERVATION'
})

function openEditSheet(req: RoleRequirement) {
  editingReqId.value = req.id
  editForm.riskLevelCode = req.riskLevelCode
  editForm.mandatory = req.mandatory
  editForm.isGating = req.isGating
  editForm.trainingTypeCode = req.trainingTypeCode
  editForm.assessmentMethodCode = req.assessmentMethodCode
  isEditSheetOpen.value = true
}

async function handleSaveRequirement() {
  if (!editingReqId.value) return
  await store.updateRequirement('', editingReqId.value, { ...editForm })
  isEditSheetOpen.value = false
}

function goBack() {
  router.push('/roles')
}
</script>

<template>
  <div v-if="jobTitle">

    <!-- Page Header -->
    <div class="role-header">
      <Button variant="ghost" size="icon" @click="goBack" aria-label="Back to Roles">
        <ChevronLeft class="icon-sm" aria-hidden="true" />
      </Button>
      <div class="role-header-text">
        <h1 class="page-title">{{ jobTitle.name }}</h1>
        <p class="page-subtitle">{{ jobTitle.code || 'No code' }} · Job Title Workspace</p>
      </div>
      <div v-if="store.currentRole" class="role-header-badge">
        <span class="badge" :class="getStatusClass(store.currentRole.result)">
          <CheckCircle2 v-if="store.currentRole.result === 'INCLUDED'" class="icon-xxs" aria-hidden="true" />
          <AlertCircle v-else-if="store.currentRole.result === 'AWARENESS_ONLY'" class="icon-xxs" aria-hidden="true" />
          <HelpCircle v-else class="icon-xxs" aria-hidden="true" />
          {{ getStatusLabel(store.currentRole.result) }}
        </span>
      </div>
    </div>

    <Tabs v-model="activeTab">
      <TabsList>
        <TabsTrigger value="applicability">
          <ShieldCheck class="icon-xs" aria-hidden="true" />
          Applicability Decision
        </TabsTrigger>
        <TabsTrigger value="requirements">
          <FileText class="icon-xs" aria-hidden="true" />
          Role Requirements
        </TabsTrigger>
        <TabsTrigger value="history">
          <HistoryIcon class="icon-xs" aria-hidden="true" />
          History
        </TabsTrigger>
      </TabsList>

      <!-- ── Applicability Tab ─────────────────────────────── -->
      <TabsContent value="applicability">
        <div class="applicability-layout">

          <!-- Questions Column -->
          <div class="questions-column">
            <Card>
              <CardHeader>
                <CardTitle>Applicability Decision Questions</CardTitle>
                <CardDescription>Answer YES/NO for each question in order. The decision output is calculated automatically.</CardDescription>
              </CardHeader>
              <CardContent class="questions-content">

                <!-- Q1 -->
                <div class="question-item">
                  <div class="question-meta">
                    <span class="question-badge" aria-hidden="true">Q1</span>
                    <div class="question-text">
                      <p class="question-label">Hands-On Operational Work</p>
                      <p class="question-desc">Does this role perform hands-on operational work — production, fabrication, maintenance, or inspection?</p>
                      <p class="question-examples">e.g. Operator, Welder, Inspector, Maintenance Technician</p>
                      <div class="question-flow" aria-hidden="true">
                        <span class="flow-yes">YES → continue</span>
                        <span class="flow-sep">·</span>
                        <span class="flow-no">NO → likely not in matrix (unless Q2 is YES)</span>
                      </div>
                    </div>
                  </div>
                  <Switch
                    v-model:checked="applicabilityForm.q1HandsOnOperational"
                    aria-label="Q1: Does this role perform hands-on operational work?"
                  />
                </div>

                <Separator />

                <!-- Q2 -->
                <div class="question-item">
                  <div class="question-meta">
                    <span class="question-badge" aria-hidden="true">Q2</span>
                    <div class="question-text">
                      <p class="question-label">Conformity / Compliance Sign-Off</p>
                      <p class="question-desc">Does this role approve, release, inspect, certify, or sign off work that affects conformity or compliance?</p>
                      <p class="question-examples">e.g. Product release, final inspection sign-off, supplier approval, MOC approval</p>
                      <div class="question-flow" aria-hidden="true">
                        <span class="flow-yes">YES → continue</span>
                        <span class="flow-sep">·</span>
                        <span class="flow-no">NO → go to Q3</span>
                      </div>
                    </div>
                  </div>
                  <Switch
                    v-model:checked="applicabilityForm.q2ConformitySignOff"
                    aria-label="Q2: Does this role approve or sign off work affecting conformity?"
                  />
                </div>

                <Separator />

                <!-- Q3 -->
                <div class="question-item">
                  <div class="question-meta">
                    <span class="question-badge" aria-hidden="true">Q3</span>
                    <div class="question-text">
                      <p class="question-label">Error Causes Safety / Quality Impact</p>
                      <p class="question-desc">Can an error in this role cause a safety, quality, environmental, or compliance impact?</p>
                      <p class="question-examples">e.g. Injury risk, major NCR, regulatory breach, customer rejection</p>
                      <div class="question-flow" aria-hidden="true">
                        <span class="flow-yes">YES → continue</span>
                        <span class="flow-sep">·</span>
                        <span class="flow-no">NO → not in matrix</span>
                      </div>
                    </div>
                  </div>
                  <Switch
                    v-model:checked="applicabilityForm.q3ErrorCausesImpact"
                    aria-label="Q3: Can an error in this role cause safety or quality impact?"
                  />
                </div>

                <Separator />

                <!-- Q4 -->
                <div class="question-item">
                  <div class="question-meta">
                    <span class="question-badge" aria-hidden="true">Q4</span>
                    <div class="question-text">
                      <p class="question-label">Specific Competence Required</p>
                      <p class="question-desc">Is specific competence required to perform or approve the task — not just general awareness?</p>
                      <p class="question-examples">e.g. Anti-bribery awareness is not a competence; electrical isolation authority is</p>
                      <div class="question-flow" aria-hidden="true">
                        <span class="flow-yes">YES → continue</span>
                        <span class="flow-sep">·</span>
                        <span class="flow-no">NO → manage via awareness / induction only</span>
                      </div>
                    </div>
                  </div>
                  <Switch
                    v-model:checked="applicabilityForm.q4SpecificCompetenceRequired"
                    aria-label="Q4: Is specific competence required, not just general awareness?"
                  />
                </div>

                <Separator />

                <!-- Q5 -->
                <div class="question-item">
                  <div class="question-meta">
                    <span class="question-badge" aria-hidden="true">Q5</span>
                    <div class="question-text">
                      <p class="question-label">Objective Evidence Required</p>
                      <p class="question-desc">Is objective evidence required to prove competence — certificate, licence, OJT record, observation, or documented output?</p>
                      <p class="question-examples">e.g. For managers/engineers: evidence can be approvals, MOCs, CAPAs</p>
                      <div class="question-flow" aria-hidden="true">
                        <span class="flow-yes">YES → INCLUDE in Skills Matrix</span>
                        <span class="flow-sep">·</span>
                        <span class="flow-no">NO → not in matrix</span>
                      </div>
                    </div>
                  </div>
                  <Switch
                    v-model:checked="applicabilityForm.q5ObjectiveEvidenceRequired"
                    aria-label="Q5: Is objective evidence required to prove competence?"
                  />
                </div>

                <Separator />

                <!-- Notes -->
                <div class="question-notes">
                  <Label for="decision-notes">Notes & Justification</Label>
                  <Input
                    id="decision-notes"
                    v-model="applicabilityForm.notes"
                    placeholder="Provide reasoning for the decision above..."
                  />
                </div>

                <!-- Escalation tip -->
                <div class="escalation-tip" role="note">
                  <AlertTriangle class="icon-xs" aria-hidden="true" />
                  <p>
                    If you answer NO on Q3, Q4, or Q5, this role should not be tracked in the Skills Matrix.
                    Escalate borderline cases to QHSE/HR. Only roles where role-specific competence must be
                    evidenced are included; company-wide policies (e.g. ethics, anti-bribery) are managed via
                    induction/awareness records.
                  </p>
                </div>

              </CardContent>
            </Card>
          </div>

          <!-- Result Column -->
          <div class="result-column">

            <!-- Determination Card -->
            <Card class="result-card">
              <CardHeader>
                <CardTitle class="result-card-title">Matrix Applicability Determination</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="result-label">Decision Output</p>
                <div
                  class="result-outcome"
                  :class="`result-outcome-${computedResult.toLowerCase().replace('_', '-')}`"
                  role="status"
                  :aria-label="`Computed result: ${getStatusLabel(computedResult)}`"
                >
                  <span style="display:inline-flex;align-items:center;margin-right:0.5rem;flex-shrink:0;" aria-hidden="true">
                    <CheckCircle2 v-if="computedResult === 'INCLUDED'" :size="16" />
                    <AlertCircle v-else-if="computedResult === 'AWARENESS_ONLY'" :size="16" />
                    <HelpCircle v-else :size="16" />
                  </span>
                  <span>{{ getStatusLabel(computedResult) }}</span>
                </div>
                <p class="result-hint">Based on the answers provided above.</p>
                <Button
                  class="result-save-btn"
                  :disabled="store.isSaving"
                  @click="handleSaveApplicability"
                  aria-label="Save applicability decision"
                >
                  <Save v-if="!store.isSaving" class="icon-xs" aria-hidden="true" />
                  <span v-else class="result-spinner" aria-hidden="true" />
                  {{ store.isSaving ? 'Saving…' : 'Save Decision' }}
                </Button>
              </CardContent>
            </Card>

            <!-- Audit Trail -->
            <Card v-if="store.currentRole">
              <CardHeader>
                <CardTitle class="audit-title">Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="audit-row">
                  <span class="audit-label">Last Reviewed By</span>
                  <span class="audit-value">{{ store.currentRole.createdByUserId }}</span>
                </div>
                <div class="audit-row">
                  <span class="audit-label">Last Review Date</span>
                  <span class="audit-value">{{ formatDate(store.currentRole.createdAt) }}</span>
                </div>
                <div class="audit-row">
                  <span class="audit-label">Saved Result</span>
                  <span class="badge" :class="getStatusClass(store.currentRole.result)">
                    {{ getStatusLabel(store.currentRole.result) }}
                  </span>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </TabsContent>

      <!-- ── Requirements Tab ─────────────────────────────── -->
      <TabsContent value="requirements">
        <div class="requirements-section">
          <div class="requirements-header">
            <div>
              <h2 class="requirements-title">Requirement Pack</h2>
              <p class="requirements-subtitle">Competencies required for this job title to be considered authorised.</p>
            </div>
            <Button size="sm" aria-label="Add competency requirement">
              <Plus class="icon-xs" aria-hidden="true" />
              Add Competency
            </Button>
          </div>

          <Card>
            <CardContent class="requirements-table-wrap">
              <Table class="dense-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Competency</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Mandatory</TableHead>
                    <TableHead>Gating</TableHead>
                    <TableHead>Training Type</TableHead>
                    <TableHead>Assessment</TableHead>
                    <TableHead class="table-actions-header">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="req in store.roleRequirements" :key="req.id">
                    <TableCell class="req-name">{{ getCompetencyName(req.competencyLibraryItemId) }}</TableCell>
                    <TableCell>
                      <span
                        class="badge"
                        :class="req.riskLevelCode === 'HIGH_CRITICAL' ? 'badge-critical' : req.riskLevelCode === 'MEDIUM' ? 'badge-warning' : 'badge-neutral'"
                      >
                        {{ req.riskLevelCode.replace('_', '/') }}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span v-if="req.mandatory" class="badge badge-primary">Yes</span>
                      <span v-else class="req-empty">—</span>
                    </TableCell>
                    <TableCell>
                      <span v-if="req.isGating" class="badge badge-critical">Gating</span>
                      <span v-else class="req-empty">—</span>
                    </TableCell>
                    <TableCell class="req-code">{{ req.trainingTypeCode.replace(/_/g, ' ') }}</TableCell>
                    <TableCell class="req-code">{{ req.assessmentMethodCode.replace(/_/g, ' ') }}</TableCell>
                    <TableCell class="table-actions-cell">
                      <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                          <Button variant="ghost" size="icon" class="table-action-btn" aria-label="Requirement actions">
                            <MoreHorizontal class="icon-xs" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem @click="openEditSheet(req)">Edit</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  <TableRow v-if="store.roleRequirements.length === 0">
                    <TableCell colspan="7" class="req-empty-state">
                      No requirements configured for this role yet.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <!-- ── History Tab ──────────────────────────────────── -->
      <TabsContent value="history">
        <Card>
          <CardHeader>
            <div class="history-header">
              <div>
                <CardTitle>Version History</CardTitle>
                <CardDescription>Published versions of this role's requirements.</CardDescription>
              </div>
              <Button variant="outline" size="sm" aria-label="Open comparison tool">
                <ExternalLink class="icon-xs" aria-hidden="true" />
                Comparison Tool
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="store.requirementSets.length === 0" class="history-empty">
              No version history found.
            </div>
            <div v-else class="history-list">
              <div v-for="set in store.requirementSets" :key="set.id" class="history-item">
                <div class="history-version" aria-hidden="true">v{{ set.version }}</div>
                <div class="history-info">
                  <div class="history-status">
                    {{ set.status }}
                    <span v-if="set.status === 'PUBLISHED'" class="badge badge-success">Active</span>
                  </div>
                  <div class="history-date">Published {{ formatDate(set.publishedAt) }}</div>
                </div>
                <Button variant="ghost" size="sm" aria-label="View version details">View Details</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <!-- ── Edit Requirement Sheet ──────────────────────────── -->
    <Sheet :open="isEditSheetOpen" @update:open="isEditSheetOpen = $event">
      <SheetContent class="sheet-panel">
        <SheetHeader class="sheet-header">
          <SheetTitle>Edit Requirement</SheetTitle>
          <SheetDescription>
            Update the risk classification and assessment parameters for this competency.
          </SheetDescription>
        </SheetHeader>

        <div class="sheet-body">
          <div class="form-grid">
            <!-- Risk Level -->
            <div class="form-field form-field-full">
              <Label for="edit-risk-level">Risk Level</Label>
              <Select v-model="editForm.riskLevelCode">
                <SelectTrigger id="edit-risk-level" aria-label="Select risk level">
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH_CRITICAL">High / Critical</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Training Type -->
            <div class="form-field form-field-full">
              <Label for="edit-training-type">Training Type</Label>
              <Select v-model="editForm.trainingTypeCode">
                <SelectTrigger id="edit-training-type" aria-label="Select training type">
                  <SelectValue placeholder="Select training type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CERT_LICENCE">Certificate / Licence</SelectItem>
                  <SelectItem value="OJT_COACHING">OJT / Coaching</SelectItem>
                  <SelectItem value="AWARENESS">Awareness</SelectItem>
                  <SelectItem value="INDUCTION">Induction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Assessment Method -->
            <div class="form-field form-field-full">
              <Label for="edit-assessment-method">Assessment Method</Label>
              <Select v-model="editForm.assessmentMethodCode">
                <SelectTrigger id="edit-assessment-method" aria-label="Select assessment method">
                  <SelectValue placeholder="Select assessment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OBSERVATION">Observation</SelectItem>
                  <SelectItem value="MANAGER_SIGNOFF">Manager Sign-Off</SelectItem>
                  <SelectItem value="RECORD_REVIEW">Record Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Divider -->
            <div class="form-divider" />

            <!-- Mandatory toggle -->
            <div class="form-field form-field-full">
              <div class="form-toggle-row">
                <div>
                  <p class="form-toggle-label">Mandatory</p>
                  <p class="form-toggle-desc">All employees in this role must hold this competency.</p>
                </div>
                <Switch v-model:checked="editForm.mandatory" aria-label="Toggle mandatory" />
              </div>
            </div>

            <!-- Gating toggle -->
            <div class="form-field form-field-full">
              <div class="form-toggle-row">
                <div>
                  <p class="form-toggle-label">Gating</p>
                  <p class="form-toggle-desc">Employee is not authorised until this competency is VALID.</p>
                </div>
                <Switch v-model:checked="editForm.isGating" aria-label="Toggle gating" />
              </div>
            </div>
          </div>
        </div>

        <SheetFooter class="sheet-footer">
          <Button variant="ghost" @click="isEditSheetOpen = false">Cancel</Button>
          <Button :disabled="store.isSaving" @click="handleSaveRequirement">
            <span v-if="store.isSaving">Saving…</span>
            <span v-else>Save Changes</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>

  </div>

  <!-- Loading state -->
  <div v-else class="role-loading" aria-label="Loading role workspace" role="status">
    <span class="role-loading-spinner" aria-hidden="true" />
    <span>Loading role workspace…</span>
  </div>
</template>

<style scoped>
/* ─── Header ───────────────────────────────────────────────── */
.role-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.role-header-text {
  flex: 1;
}

.role-header-badge {
  display: flex;
  align-items: center;
}

/* ─── Applicability layout ─────────────────────────────────── */
.applicability-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--space-lg);
  margin-top: var(--space-lg);
  align-items: start;
}

.questions-column {
  min-width: 0;
}

.result-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  position: sticky;
  top: var(--space-lg);
}

/* ─── Questions card content ───────────────────────────────── */
.questions-content {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: var(--space-md);
}

/* ─── Question row ─────────────────────────────────────────── */
.question-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-lg);
  padding: var(--space-md) 0;
  transition: opacity 0.2s ease;
}


.question-meta {
  display: flex;
  gap: var(--space-md);
  align-items: flex-start;
  flex: 1;
  min-width: 0;
}

.question-badge {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-full);
  background: var(--brand-primary);
  color: oklch(1 0 0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 700;
  margin-top: 2px;
}


.question-text {
  flex: 1;
  min-width: 0;
}

.question-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0 0 var(--space-xs) 0;
}

.question-desc {
  font-size: 0.8125rem;
  color: var(--text-body);
  margin: 0 0 var(--space-xs) 0;
  line-height: 1.5;
}

.question-examples {
  font-size: 0.75rem;
  color: var(--text-caption);
  font-style: italic;
  margin: 0 0 var(--space-xs) 0;
}

.question-flow {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.flow-yes {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--brand-success);
}

.flow-sep {
  font-size: 0.6875rem;
  color: var(--text-caption);
}

.flow-no {
  font-size: 0.6875rem;
  color: var(--text-caption);
}

/* ─── Notes field ──────────────────────────────────────────── */
.question-notes {
  padding: var(--space-md) 0 var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

/* ─── Escalation tip ───────────────────────────────────────── */
.escalation-tip {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: oklch(0.72 0.15 58 / 0.08);
  border-left: 3px solid var(--brand-warning);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin-top: var(--space-xs);
}

.escalation-tip svg {
  color: var(--brand-warning);
  flex-shrink: 0;
  margin-top: 2px;
}

.escalation-tip p {
  font-size: 0.75rem;
  color: var(--text-body);
  margin: 0;
  line-height: 1.5;
}

/* ─── Result card ──────────────────────────────────────────── */
.result-card-title {
  font-size: 0.8125rem;
}

.result-label {
  font-size: 0.75rem;
  color: var(--text-caption);
  margin: 0 0 var(--space-sm) 0;
}

.result-outcome {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.result-outcome-included {
  background: oklch(0.62 0.14 162 / 0.1);
  color: var(--brand-success);
}

.result-outcome-awareness-only {
  background: oklch(0.72 0.15 58 / 0.1);
  color: var(--brand-warning);
}

.result-outcome-out-of-scope {
  background: var(--bg-subtle);
  color: var(--text-caption);
}


.result-hint {
  font-size: 0.75rem;
  color: var(--text-caption);
  margin: 0 0 var(--space-md) 0;
}

.result-save-btn {
  width: 100%;
}

.result-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: var(--radius-full);
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ─── Audit card ───────────────────────────────────────────── */
.audit-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-caption);
}

.audit-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs) 0;
  font-size: 0.8125rem;
  border-bottom: var(--border-subtle);
}

.audit-row:last-child {
  border-bottom: none;
}

.audit-label {
  color: var(--text-caption);
}

.audit-value {
  font-weight: 500;
  color: var(--text-body);
}

/* ─── Requirements tab ─────────────────────────────────────── */
.requirements-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

.requirements-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.requirements-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0 0 var(--space-xs) 0;
}

.requirements-subtitle {
  font-size: 0.8125rem;
  color: var(--text-caption);
  margin: 0;
}

.requirements-table-wrap {
  padding: 0;
}

.req-name {
  font-weight: 500;
  color: var(--text-heading);
}

.req-code {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-caption);
  letter-spacing: 0.02em;
}

.req-empty {
  color: var(--text-caption);
}

.req-empty-state {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--text-caption);
  font-style: italic;
}

/* ─── History tab ──────────────────────────────────────────── */
.history-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.history-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border: var(--border-subtle);
  border-radius: var(--radius-md);
  transition: background 0.15s ease;
}

.history-item:hover {
  background: var(--bg-subtle);
}

.history-version {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: oklch(0.38 0.14 266 / 0.1);
  color: var(--brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.history-info {
  flex: 1;
}

.history-status {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-heading);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: 2px;
}

.history-date {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.history-empty {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--text-caption);
  font-style: italic;
}

/* ─── Icon helper ──────────────────────────────────────────── */
.icon-xxs {
  width: 12px;
  height: 12px;
}

/* ─── Loading ──────────────────────────────────────────────── */
.role-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-2xl);
  color: var(--text-caption);
}

.role-loading-spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 2px solid var(--brand-primary);
  border-top-color: transparent;
  border-radius: var(--radius-full);
  animation: spin 0.6s linear infinite;
}

/* ─── Responsive ───────────────────────────────────────────── */
@media (max-width: 1024px) {
  .applicability-layout {
    grid-template-columns: 1fr;
  }

  .result-column {
    position: static;
  }
}
</style>
