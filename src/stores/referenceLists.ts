import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RiskLevel, TrainingType, AssessmentMethod, Status, EvidenceType, ResponsibleParty } from '@/types'
import refData from '@/data/referenceLists.json'

export const useReferenceListsStore = defineStore('referenceLists', () => {
  const riskLevels = ref<RiskLevel[]>(refData.riskLevels as RiskLevel[])
  const trainingTypes = ref<TrainingType[]>(refData.trainingTypes as TrainingType[])
  const assessmentMethods = ref<AssessmentMethod[]>(refData.assessmentMethods as AssessmentMethod[])
  const statuses = ref<Status[]>(refData.statuses as Status[])
  const evidenceTypes = ref<EvidenceType[]>(refData.evidenceTypes as EvidenceType[])
  const responsibleParties = ref<ResponsibleParty[]>(refData.responsibleParties as ResponsibleParty[])
  const isLoading = ref(false)
  const expiringThreshold = ref<number>(refData.expiringThresholdDays)

  const riskLevelByCode = computed(() => {
    return (code: string) => riskLevels.value.find(r => r.code === code)
  })

  const trainingTypeByCode = computed(() => {
    return (code: string) => trainingTypes.value.find(t => t.code === code)
  })

  const assessmentMethodByCode = computed(() => {
    return (code: string) => assessmentMethods.value.find(a => a.code === code)
  })

  const statusByCode = computed(() => {
    return (code: string) => statuses.value.find(s => s.code === code)
  })

  async function fetchAll() {
    // Data is pre-loaded from JSON at import time — nothing to fetch
  }

  function setExpiringThreshold(days: number) {
    expiringThreshold.value = days
  }

  return {
    riskLevels,
    trainingTypes,
    assessmentMethods,
    statuses,
    evidenceTypes,
    responsibleParties,
    isLoading,
    expiringThreshold,
    riskLevelByCode,
    trainingTypeByCode,
    assessmentMethodByCode,
    statusByCode,
    fetchAll,
    setExpiringThreshold,
  }
})
