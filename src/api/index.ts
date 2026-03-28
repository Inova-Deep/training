// Re-export real DML API clients so stores that import from '@/api' still work
export { organizationApi, employeesApi } from '@/api/client'

// erpApi alias: exposes org structure under expected names used by RolesView + stores
import { organizationApi as _orgApi } from '@/api/client'

export const erpApi = {
  getJobTitles: () => _orgApi.getJobTitles({ size: 1000 }),
  getDepartments: () => _orgApi.getDepartments({ size: 1000 }),
  getBusinessUnits: () => _orgApi.getBusinessUnits({ size: 1000 }),
}

// ──────────────────────────────────────────────
// Competency Library — thin wrapper over local state
// (actual data lives in src/data/competencies.json, loaded by the store)
// These stubs keep the API shape expected by competencyLibraryStore
// ──────────────────────────────────────────────
import type { CompetencyLibraryItem } from '@/types'

export const competencyLibraryApi = {
  getAll: async (): Promise<CompetencyLibraryItem[]> => {
    const mod = await import('@/data/competencies.json')
    return mod.default as CompetencyLibraryItem[]
  },
  getById: async (id: string): Promise<CompetencyLibraryItem | undefined> => {
    const mod = await import('@/data/competencies.json')
    return (mod.default as CompetencyLibraryItem[]).find((c) => c.id === id)
  },
  create: async (data: Partial<CompetencyLibraryItem>): Promise<CompetencyLibraryItem> => {
    return data as CompetencyLibraryItem
  },
  update: async (
    _id: string,
    data: Partial<CompetencyLibraryItem>,
  ): Promise<CompetencyLibraryItem> => {
    return data as CompetencyLibraryItem
  },
  archive: async (_id: string): Promise<void> => {
    return
  },
}

// ──────────────────────────────────────────────
// Roles — thin wrapper over local JSON
// ──────────────────────────────────────────────
import type { RoleApplicabilityDecision, RoleRequirementSet, RoleRequirement } from '@/types'

export const rolesApi = {
  getApplicabilityDecisions: async (): Promise<RoleApplicabilityDecision[]> => {
    const mod = await import('@/data/roleApplicability.json')
    return mod.default as RoleApplicabilityDecision[]
  },
  getApplicabilityByJobTitle: async (
    jobTitleId: string,
  ): Promise<RoleApplicabilityDecision | undefined> => {
    const mod = await import('@/data/roleApplicability.json')
    return (mod.default as RoleApplicabilityDecision[]).find((r) => r.erpJobTitleId === jobTitleId)
  },
  saveApplicability: async (
    data: Partial<RoleApplicabilityDecision>,
  ): Promise<RoleApplicabilityDecision> => {
    return data as RoleApplicabilityDecision
  },
  getRequirementSets: async (): Promise<RoleRequirementSet[]> => {
    const mod = await import('@/data/roleRequirements.json')
    const raw = mod.default as unknown as Record<
      string,
      { setId: string; status: string; publishedAt: string; requirements: RoleRequirement[] }
    >
    return Object.entries(raw).map(([jobTitleId, val]) => ({
      id: val.setId,
      erpJobTitleId: jobTitleId,
      version: 1,
      status: val.status as 'DRAFT' | 'PUBLISHED' | 'RETIRED',
      publishedAt: val.publishedAt,
      createdAt: val.publishedAt,
      updatedAt: val.publishedAt,
    }))
  },
  getRequirementSetByJobTitle: async (
    jobTitleId: string,
  ): Promise<RoleRequirementSet | undefined> => {
    const mod = await import('@/data/roleRequirements.json')
    const raw = mod.default as Record<
      string,
      { setId: string; status: string; publishedAt: string }
    >
    const entry = raw[jobTitleId]
    if (!entry) return undefined
    return {
      id: entry.setId,
      erpJobTitleId: jobTitleId,
      version: 1,
      status: entry.status as 'DRAFT' | 'PUBLISHED' | 'RETIRED',
      publishedAt: entry.publishedAt,
      createdAt: entry.publishedAt,
      updatedAt: entry.publishedAt,
    }
  },
  createRequirementSet: async (data: Partial<RoleRequirementSet>): Promise<RoleRequirementSet> => {
    return data as RoleRequirementSet
  },
  publishRequirementSet: async (id: string): Promise<RoleRequirementSet> => {
    return { id } as RoleRequirementSet
  },
  getRequirements: async (setId: string): Promise<RoleRequirement[]> => {
    const mod = await import('@/data/roleRequirements.json')
    const raw = mod.default as unknown as Record<
      string,
      { setId: string; requirements: RoleRequirement[] }
    >
    const entry = Object.values(raw).find((v) => v.setId === setId)
    return entry?.requirements ?? []
  },
  addRequirement: async (
    _setId: string,
    data: Partial<RoleRequirement>,
  ): Promise<RoleRequirement> => {
    return data as RoleRequirement
  },
  updateRequirement: async (
    _setId: string,
    _reqId: string,
    data: Partial<RoleRequirement>,
  ): Promise<RoleRequirement> => {
    return data as RoleRequirement
  },
  removeRequirement: async (_setId: string, _reqId: string): Promise<void> => {
    return
  },
}

// ──────────────────────────────────────────────
// Training Needs — data is generated at runtime by the store
// These stubs satisfy any legacy import references
// ──────────────────────────────────────────────
import type { TrainingNeed, TrainingCompletion } from '@/types'

export const trainingNeedsApi = {
  getAll: async (_params?: { status?: string; employeeId?: string }): Promise<TrainingNeed[]> => [],
  getById: async (_id: string): Promise<TrainingNeed | undefined> => undefined,
  create: async (data: Partial<TrainingNeed>): Promise<TrainingNeed> => data as TrainingNeed,
  update: async (_id: string, data: Partial<TrainingNeed>): Promise<TrainingNeed> =>
    data as TrainingNeed,
  complete: async (_id: string, data: Partial<TrainingCompletion>): Promise<TrainingCompletion> =>
    data as TrainingCompletion,
}
