import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import type { CompetencyLibraryItem } from '@/types'
import competenciesData from '@/data/competencies.json'

type CompetencyFormData = Partial<CompetencyLibraryItem>

export const useCompetencyLibraryStore = defineStore('competencyLibrary', () => {
  const competencies = ref<CompetencyLibraryItem[]>(competenciesData as CompetencyLibraryItem[])
  const currentCompetency = ref<CompetencyLibraryItem | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: competenciesData.length,
    totalPages: Math.ceil(competenciesData.length / 20),
  })
  const searchQuery = ref('')

  const competencyById = computed(() => {
    return (id: string) => competencies.value.find((c) => c.id === id)
  })

  const competencyByCode = computed(() => {
    return (code: string) => competencies.value.find((c) => c.code === code)
  })

  const activeCompetencies = computed(() => competencies.value.filter((c) => !c.archivedAt))

  const competenciesByCategory = computed(() => {
    return (category: string) => competencies.value.filter((c) => c.category === category)
  })

  const competenciesByRiskLevel = computed(() => {
    return (riskLevelCode: string) =>
      competencies.value.filter((c) => c.riskLevelCode === riskLevelCode)
  })

  const competenciesRequiringRenewal = computed(() =>
    competencies.value.filter((c) => c.defaultRequiresExpiry && !c.archivedAt),
  )

  const hasCompetencies = computed(() => competencies.value.length > 0)

  const filteredCompetencies = computed(() => {
    let result = [...competencies.value]

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.code?.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query),
      )
    }

    return result
  })

  async function fetchCompetencies(params?: { page?: number; pageSize?: number }) {
    // Data is pre-loaded from JSON — just update pagination metadata
    const size = params?.pageSize ?? pagination.value.pageSize
    pagination.value = {
      page: params?.page ?? pagination.value.page,
      pageSize: size,
      total: competencies.value.length,
      totalPages: Math.ceil(competencies.value.length / size),
    }
  }

  async function fetchCompetency(id: string) {
    currentCompetency.value = competencies.value.find((c) => c.id === id) ?? null
  }

  async function createCompetency(data: CompetencyFormData) {
    isSaving.value = true
    error.value = null
    try {
      const newCompetency: CompetencyLibraryItem = {
        ...data,
        id: `comp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as CompetencyLibraryItem
      competencies.value.push(newCompetency)
      toast.success('Competency created successfully')
      return newCompetency
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create competency'
      toast.error(error.value)
      throw e
    } finally {
      isSaving.value = false
    }
  }

  async function updateCompetency(id: string, data: Partial<CompetencyFormData>) {
    isSaving.value = true
    error.value = null
    try {
      const index = competencies.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        competencies.value[index] = {
          ...competencies.value[index]!,
          ...data,
          updatedAt: new Date().toISOString(),
        }
        if (currentCompetency.value?.id === id) {
          currentCompetency.value = competencies.value[index]!
        }
      }
      toast.success('Competency updated successfully')
      return competencies.value[index]!
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update competency'
      toast.error(error.value)
      throw e
    } finally {
      isSaving.value = false
    }
  }

  async function deleteCompetency(id: string) {
    isLoading.value = true
    error.value = null
    try {
      competencies.value = competencies.value.filter((c) => c.id !== id)
      if (currentCompetency.value?.id === id) {
        currentCompetency.value = null
      }
      toast.success('Competency deleted successfully')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete competency'
      toast.error(error.value)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function searchCompetencies(query: string) {
    searchQuery.value = query
  }

  function clearFilters() {
    searchQuery.value = ''
  }

  function setPage(page: number) {
    pagination.value.page = page
  }

  function clearCurrentCompetency() {
    currentCompetency.value = null
  }

  function $reset() {
    competencies.value = competenciesData as CompetencyLibraryItem[]
    currentCompetency.value = null
    isLoading.value = false
    isSaving.value = false
    error.value = null
    pagination.value = {
      page: 1,
      pageSize: 20,
      total: competenciesData.length,
      totalPages: Math.ceil(competenciesData.length / 20),
    }
    searchQuery.value = ''
  }

  return {
    competencies,
    currentCompetency,
    isLoading,
    isSaving,
    error,
    pagination,
    searchQuery,
    competencyById,
    competencyByCode,
    activeCompetencies,
    competenciesByCategory,
    competenciesByRiskLevel,
    competenciesRequiringRenewal,
    hasCompetencies,
    filteredCompetencies,
    fetchCompetencies,
    fetchCompetency,
    createCompetency,
    updateCompetency,
    deleteCompetency,
    searchCompetencies,
    clearFilters,
    setPage,
    clearCurrentCompetency,
    $reset,
  }
})
