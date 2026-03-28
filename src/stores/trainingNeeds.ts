import { defineStore } from 'pinia'
import { ref } from 'vue'
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
}

const templates = templatesData as TrainingNeedTemplate[]

function computeDueDate(dueDaysFromNow: number): string {
  const d = new Date()
  d.setDate(d.getDate() + dueDaysFromNow)
  return d.toISOString().split('T')[0]!
}

export type ResolutionType = 'UPLOAD' | 'RENEWAL' | 'OJT' | 'ASSESSMENT' | 'COACHING_OJT' | 'TOOLBOX_TALK' | 'EXTERNAL_COURSE' | 'INTERNAL_BRIEFING' | 'PROCEDURE_READ_AND_ACK' | 'CERTIFICATION_RENEWAL'

export interface ResolutionData {
  type: ResolutionType
  notes?: string
  // Upload fields
  issuer?: string
  referenceNumber?: string
  issueDate?: string
  expiryDate?: string
  file?: File
  // Renewal/OJT/Assessment fields
  providerName?: string
  plannedDate?: string
  trainerName?: string
  assessorName?: string
}

export const useTrainingNeedsStore = defineStore('trainingNeeds', () => {
  const trainingNeeds = ref<TrainingNeed[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const filters = ref({
    status: '' as string,
    departmentId: '' as string,
    jobTitleId: '' as string,
    priority: '' as string,
    search: ''
  })

  const fetchTrainingNeeds = async () => {
    isLoading.value = true
    try {
      const empStore = useEmployeesStore()
      // Ensure employees are loaded before generating needs
      if (empStore.filteredEmployees.length === 0) {
        await empStore.fetchEmployees()
      }
      const employees = empStore.filteredEmployees.slice(0, 7)
      const now = new Date().toISOString()

      const defaultSources: TrainingNeedSource[] = [
        'COMPETENCE_GAP',
        'EXPIRY_RENEWAL',
        'NCR_CAPA',
        'AUDIT_FINDING',
        'MANAGER_REQUEST',
        'NEW_STARTER',
        'PROCEDURE_CHANGE',
      ]

      // Assign one template per employee (deterministic by index, rotating through templates)
      trainingNeeds.value = employees.map((emp, i) => {
        const tmpl = templates[i % templates.length]!
        const sourceType: TrainingNeedSource = defaultSources[i % defaultSources.length]!
        const workflowStatus: TrainingNeedWorkflowStatus = 'IDENTIFIED'
        return {
          id: `tn-${emp.id}-${tmpl.id}`,
          erpEmployeeId: emp.id,
          // The view uses employeeCompetenceItemId to look up the competency library item
          employeeCompetenceItemId: tmpl.competencyLibraryItemId,
          trainingTypeCode: tmpl.trainingTypeCode,
          status: 'OPEN' as const,
          dueDate: computeDueDate(tmpl.dueDaysFromNow),
          createdReason: tmpl.createdReason,
          createdByUserId: 'system',
          createdAt: now,
          updatedAt: now,
          sourceType,
          workflowStatus,
          priority: 'MEDIUM' as const,
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
      const index = trainingNeeds.value.findIndex(tn => tn.id === id)
      if (index !== -1 && trainingNeeds.value[index]) {
        trainingNeeds.value[index].status = 'IN_PROGRESS'
        trainingNeeds.value[index].updatedAt = new Date().toISOString()
      }
      const messages: Record<ResolutionType, string> = {
        UPLOAD:                 'Evidence submitted for review',
        RENEWAL:                'Training scheduled successfully',
        OJT:                    'OJT session scheduled',
        ASSESSMENT:             'Assessment booked',
        COACHING_OJT:           'Coaching/OJT session scheduled',
        TOOLBOX_TALK:           'Toolbox talk scheduled',
        EXTERNAL_COURSE:        'External course booked',
        INTERNAL_BRIEFING:      'Internal briefing scheduled',
        PROCEDURE_READ_AND_ACK: 'Read & acknowledge task issued',
        CERTIFICATION_RENEWAL:  'Certification renewal booked',
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
      const index = trainingNeeds.value.findIndex(tn => tn.id === id)
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
    isLoading,
    error,
    filters,
    fetchTrainingNeeds,
    resolveNeed,
    updateStatus
  }
})
