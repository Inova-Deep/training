import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import { toast } from 'vue-sonner'
import type { TrainingNeed, TrainingNeedSource, TrainingNeedWorkflowStatus } from '@/types'
import templatesData from '@/data/trainingNeedTemplates.json'
import { useEmployeesStore } from '@/stores/employees'

interface TrainingNeedTemplate {
  id: string
  competencyLibraryItemId: string
  trainingTypeCode: string
  createdReason: string
  dueDaysFromNow: number
  description: string
  sourceType?: string
  sourceReference?: string
}

const templates = templatesData as TrainingNeedTemplate[]

function computeDueDate(dueDaysFromNow: number): string {
  const d = new Date()
  d.setDate(d.getDate() + dueDaysFromNow)
  return d.toISOString().split('T')[0]!
}

export type ResolutionType =
  | 'COACHING_OJT'
  | 'TOOLBOX_TALK'
  | 'EXTERNAL_COURSE'
  | 'INTERNAL_BRIEFING'
  | 'PROCEDURE_READ_ACK'
  | 'SUPERVISOR_OBSERVATION'
  | 'CERTIFICATION_RENEWAL'

export interface ResolutionData {
  type: ResolutionType
  notes?: string
  // Shared fields
  plannedDate?: string
  // COACHING_OJT
  trainerName?: string
  // TOOLBOX_TALK
  briefingLead?: string
  topicReference?: string
  // EXTERNAL_COURSE / CERTIFICATION_RENEWAL
  providerName?: string
  certificationBody?: string
  // INTERNAL_BRIEFING
  facilitator?: string
  location?: string
  // PROCEDURE_READ_ACK
  documentReference?: string
  // SUPERVISOR_OBSERVATION
  designatedSupervisor?: string
  // Effectiveness check
  effectivenessCheckMethod?: string
  effectivenessCheckDue?: string
}

export const useTrainingNeedsStore = defineStore('trainingNeeds', () => {
  const trainingNeeds = ref<TrainingNeed[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Filters are a reactive object — mutated directly by the view
  const filters = reactive({
    status: '',
    department: '',
    departmentId: '',
    jobTitleId: '',
    priority: '',
    sourceType: '',
    search: '',
  })

  // Computed filtered list applying all 4 active filters
  const filteredNeeds = computed(() => {
    return trainingNeeds.value.filter((n) => {
      const deptMatch =
        !filters.department ||
        (n as TrainingNeed & { department?: string }).department === filters.department
      const priorityMatch =
        !filters.priority || filters.priority === 'all' || n.priority === filters.priority
      const statusMatch =
        !filters.status ||
        filters.status === 'all' ||
        (n.workflowStatus ?? n.status) === filters.status
      const sourceMatch =
        !filters.sourceType || filters.sourceType === 'all' || n.sourceType === filters.sourceType
      const searchMatch =
        !filters.search ||
        (() => {
          const q = filters.search.toLowerCase()
          return (
            (n.sourceReference ?? '').toLowerCase().includes(q) ||
            (n.sourceType ?? '').toLowerCase().includes(q)
          )
        })()
      return deptMatch && priorityMatch && statusMatch && sourceMatch && searchMatch
    })
  })

  const fetchTrainingNeeds = async () => {
    isLoading.value = true
    try {
      const empStore = useEmployeesStore()
      if (empStore.allEmployees.length === 0) {
        await empStore.fetchEmployees()
      }
      const employees = empStore.allEmployees
      const now = new Date().toISOString()

      // Workflow status distribution across demo items
      const workflowStatuses: TrainingNeedWorkflowStatus[] = [
        'IDENTIFIED',
        'IDENTIFIED',
        'APPROVED', // tmpl-003: forklift near-miss NCR-2026-047
        'IN_PROGRESS', // tmpl-004: abrasive wheel IR-2026-012
        'IDENTIFIED',
        'APPROVED',
        'IDENTIFIED',
        'IN_PROGRESS',
        'EVIDENCE_SUBMITTED',
        'EFFECTIVENESS_REVIEW',
        'APPROVED',
      ]

      // Intervention types aligned with demo story items
      const interventionTypes: (ResolutionType | undefined)[] = [
        undefined,
        undefined,
        'SUPERVISOR_OBSERVATION', // NCR-2026-047 forklift near-miss
        'CERTIFICATION_RENEWAL', // IR-2026-012 abrasive wheel
        undefined,
        undefined,
        undefined,
        'COACHING_OJT',
        'EXTERNAL_COURSE',
        'TOOLBOX_TALK',
        undefined,
      ]

      const priorities: Array<TrainingNeed['priority']> = [
        'HIGH',
        'MEDIUM',
        'CRITICAL', // NCR forklift
        'CRITICAL', // incident abrasive wheel
        'MEDIUM',
        'HIGH',
        'MEDIUM',
        'MEDIUM',
        'HIGH',
        'MEDIUM',
        'LOW',
      ]

      trainingNeeds.value = employees.map((emp, i) => {
        // Ensure the first items use tmpl-003 (NCR) and tmpl-004 (incident) prominently
        // Templates are indexed: 0=tmpl-001 ... 10=tmpl-011
        // We want index 2 → tmpl-003, index 3 → tmpl-004
        const tmplIndex = i % templates.length
        const tmpl = templates[tmplIndex]!

        const sourceType = (tmpl.sourceType as TrainingNeedSource | undefined) ?? 'COMPETENCE_GAP'
        const workflowStatus: TrainingNeedWorkflowStatus =
          workflowStatuses[i % workflowStatuses.length] ?? 'IDENTIFIED'
        const interventionType = interventionTypes[i % interventionTypes.length]
        const priority = priorities[i % priorities.length] ?? 'MEDIUM'

        return {
          id: `tn-${emp.id}-${tmpl.id}`,
          erpEmployeeId: emp.id,
          employeeCompetenceItemId: tmpl.competencyLibraryItemId,
          trainingTypeCode: tmpl.trainingTypeCode,
          status: 'OPEN' as const,
          dueDate: computeDueDate(tmpl.dueDaysFromNow),
          createdReason: tmpl.createdReason,
          createdByUserId: 'system',
          createdAt: now,
          updatedAt: now,
          sourceType,
          sourceReference: tmpl.sourceReference ?? '',
          workflowStatus,
          interventionType,
          priority,
        }
      })
    } catch (e) {
      error.value = 'Failed to generate training needs'
      toast.error(error.value)
    } finally {
      isLoading.value = false
    }
  }

  const resolveNeed = async (id: string, data: ResolutionData) => {
    isLoading.value = true
    try {
      const index = trainingNeeds.value.findIndex((tn) => tn.id === id)
      if (index !== -1 && trainingNeeds.value[index]) {
        trainingNeeds.value[index].workflowStatus = 'IN_PROGRESS'
        trainingNeeds.value[index].status = 'IN_PROGRESS'
        trainingNeeds.value[index].interventionType = data.type
        trainingNeeds.value[index].effectivenessCheckMethod = data.effectivenessCheckMethod
        trainingNeeds.value[index].updatedAt = new Date().toISOString()
      }
      const messages: Record<ResolutionType, string> = {
        COACHING_OJT: 'Coaching / OJT session scheduled',
        TOOLBOX_TALK: 'Toolbox talk scheduled',
        EXTERNAL_COURSE: 'External course booked',
        INTERNAL_BRIEFING: 'Internal briefing scheduled',
        PROCEDURE_READ_ACK: 'Read & acknowledge task issued',
        SUPERVISOR_OBSERVATION: 'Supervisor observation scheduled',
        CERTIFICATION_RENEWAL: 'Certification renewal booked',
      }
      toast.success(messages[data.type])
    } catch (e) {
      toast.error('Failed to resolve training need')
    } finally {
      isLoading.value = false
    }
  }

  const updateStatus = async (id: string, status: TrainingNeed['status']) => {
    try {
      const index = trainingNeeds.value.findIndex((tn) => tn.id === id)
      if (index !== -1 && trainingNeeds.value[index]) {
        trainingNeeds.value[index].status = status
        trainingNeeds.value[index].updatedAt = new Date().toISOString()
      }
    } catch (e) {
      toast.error('Failed to update status')
    }
  }

  return {
    trainingNeeds,
    filteredNeeds,
    isLoading,
    error,
    filters,
    fetchTrainingNeeds,
    resolveNeed,
    updateStatus,
  }
})
