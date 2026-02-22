import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import { rolesApi } from '@/api'
import type { RoleApplicabilityDecision, RoleRequirementSet, RoleRequirement } from '@/types'
import roleApplicabilityData from '@/data/roleApplicability.json'
import roleRequirementsData from '@/data/roleRequirements.json'

type RoleRequirementsJson = Record<string, {
  setId: string
  status: string
  publishedAt: string
  gatingCompetencyIds: string[]
  requirements: RoleRequirement[]
}>

const requirementsJson = roleRequirementsData as unknown as RoleRequirementsJson

function buildRequirementSets(): RoleRequirementSet[] {
  return Object.entries(requirementsJson).map(([jobTitleId, val]) => ({
    id: val.setId,
    erpJobTitleId: jobTitleId,
    version: 1,
    status: val.status as 'DRAFT' | 'PUBLISHED' | 'RETIRED',
    publishedAt: val.publishedAt,
    createdAt: val.publishedAt,
    updatedAt: val.publishedAt,
  }))
}

function buildRequirements(): RoleRequirement[] {
  return Object.entries(requirementsJson).flatMap(([jobTitleId, v]) =>
    v.requirements.map(r => ({ ...r, roleRequirementSetId: v.setId }))
  )
}

export const useRolesStore = defineStore('roles', () => {
  const roles = ref<RoleApplicabilityDecision[]>(roleApplicabilityData as RoleApplicabilityDecision[])
  const currentRole = ref<RoleApplicabilityDecision | null>(null)
  const roleRequirements = ref<RoleRequirement[]>(buildRequirements())
  const requirementSets = ref<RoleRequirementSet[]>(buildRequirementSets())
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: roleApplicabilityData.length,
    totalPages: Math.ceil(roleApplicabilityData.length / 20),
  })
  const searchQuery = ref('')

  const roleByJobTitle = computed(() => {
    return (jobTitleId: string) => roles.value.find(r => r.erpJobTitleId === jobTitleId)
  })

  const activeRoles = computed(() =>
    roles.value.filter(r => r.result === 'INCLUDED')
  )

  const rolesByApplicability = computed(() => {
    return (result: 'INCLUDED' | 'AWARENESS_ONLY' | 'OUT_OF_SCOPE') =>
      roles.value.filter(r => r.result === result)
  })

  const requirementsForSet = computed(() => {
    return (setId: string) => roleRequirements.value.filter(r => r.roleRequirementSetId === setId)
  })

  const hasRoles = computed(() => roles.value.length > 0)

  const filteredRoles = computed(() => {
    if (!searchQuery.value) return [...roles.value]
    const query = searchQuery.value.toLowerCase()
    return roles.value.filter(r =>
      r.erpJobTitleId.toLowerCase().includes(query) ||
      r.notes?.toLowerCase().includes(query)
    )
  })

  /** Returns the gating competency IDs for a given job title name (substring match) */
  function getGatingIds(jobTitleName: string): string[] {
    const key = Object.keys(requirementsJson).find(k =>
      jobTitleName.toLowerCase().includes(k.toLowerCase())
    )
    return key ? (requirementsJson[key]?.gatingCompetencyIds ?? []) : []
  }

  /** Returns requirements for a given job title name (substring match) */
  function getRequirementsForJobTitle(jobTitleName: string): RoleRequirement[] {
    const key = Object.keys(requirementsJson).find(k =>
      jobTitleName.toLowerCase().includes(k.toLowerCase())
    )
    if (!key) return []
    const entry = requirementsJson[key]
    return entry ? entry.requirements.map(r => ({ ...r, roleRequirementSetId: entry.setId })) : []
  }

  async function fetchRoles() {
    isLoading.value = true
    error.value = null
    try {
      roles.value = roleApplicabilityData as RoleApplicabilityDecision[]
      pagination.value.total = roles.value.length
      pagination.value.totalPages = Math.ceil(roles.value.length / pagination.value.pageSize)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch roles'
      toast.error(error.value)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchRole(jobTitleId: string) {
    currentRole.value = roles.value.find(r => r.erpJobTitleId === jobTitleId) ?? null
  }

  async function fetchRoleRequirements(setId: string) {
    isLoading.value = true
    try {
      const reqs = await rolesApi.getRequirements(setId)
      roleRequirements.value = reqs
      return reqs
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch role requirements'
      toast.error(error.value)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function fetchRequirementSets() {
    requirementSets.value = buildRequirementSets()
  }

  async function createRole(data: Partial<RoleApplicabilityDecision>) {
    isSaving.value = true
    error.value = null
    try {
      const newRole = { ...data, id: `dec-${Date.now()}`, createdAt: new Date().toISOString() } as RoleApplicabilityDecision
      roles.value.push(newRole)
      toast.success('Role created successfully')
      return newRole
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create role'
      toast.error(error.value)
      throw e
    } finally {
      isSaving.value = false
    }
  }

  async function updateRole(jobTitleId: string, data: Partial<RoleApplicabilityDecision>) {
    isSaving.value = true
    error.value = null
    try {
      const index = roles.value.findIndex(r => r.erpJobTitleId === jobTitleId)
      if (index !== -1) {
        roles.value[index] = { ...roles.value[index]!, ...data }
        if (currentRole.value?.erpJobTitleId === jobTitleId) {
          currentRole.value = roles.value[index]!
        }
      }
      toast.success('Role updated successfully')
      return roles.value[index]!
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update role'
      toast.error(error.value)
      throw e
    } finally {
      isSaving.value = false
    }
  }

  async function addRequirement(setId: string, data: Omit<RoleRequirement, 'id' | 'roleRequirementSetId'>) {
    isSaving.value = true
    try {
      const req = { ...data, id: `req-${Date.now()}`, roleRequirementSetId: setId } as RoleRequirement
      roleRequirements.value.push(req)
      toast.success('Requirement added successfully')
      return req
    } catch (e) {
      toast.error('Failed to add requirement')
      throw e
    } finally {
      isSaving.value = false
    }
  }

  async function updateRequirement(_setId: string, requirementId: string, data: Partial<RoleRequirement>) {
    isSaving.value = true
    try {
      const index = roleRequirements.value.findIndex(r => r.id === requirementId)
      if (index !== -1) {
        roleRequirements.value[index] = { ...roleRequirements.value[index]!, ...data }
      }
      toast.success('Requirement updated successfully')
      return roleRequirements.value[index]!
    } catch (e) {
      toast.error('Failed to update requirement')
      throw e
    } finally {
      isSaving.value = false
    }
  }

  async function removeRequirement(_setId: string, requirementId: string) {
    isLoading.value = true
    try {
      roleRequirements.value = roleRequirements.value.filter(r => r.id !== requirementId)
      toast.success('Requirement removed successfully')
    } catch (e) {
      toast.error('Failed to remove requirement')
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function searchRoles(query: string) {
    searchQuery.value = query
  }

  function setFilters(_filters: Record<string, unknown>) { /* no-op for demo */ }
  function clearFilters() { searchQuery.value = '' }
  function setPage(page: number) { pagination.value.page = page }
  function clearCurrentRole() { currentRole.value = null }

  function $reset() {
    roles.value = roleApplicabilityData as RoleApplicabilityDecision[]
    currentRole.value = null
    roleRequirements.value = buildRequirements()
    requirementSets.value = buildRequirementSets()
    isLoading.value = false
    isSaving.value = false
    error.value = null
    searchQuery.value = ''
  }

  return {
    roles,
    currentRole,
    roleRequirements,
    requirementSets,
    isLoading,
    isSaving,
    error,
    pagination,
    searchQuery,
    roleByJobTitle,
    activeRoles,
    rolesByApplicability,
    requirementsForSet,
    hasRoles,
    filteredRoles,
    getGatingIds,
    getRequirementsForJobTitle,
    fetchRoles,
    fetchRole,
    fetchRoleRequirements,
    fetchRequirementSets,
    createRole,
    updateRole,
    addRequirement,
    updateRequirement,
    removeRequirement,
    searchRoles,
    setFilters,
    clearFilters,
    setPage,
    clearCurrentRole,
    $reset,
  }
})
