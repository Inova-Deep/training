import type { BusinessUnit, Department, Employee, JobTitle } from '@/api/client'

export type RoleCriticality = 'Critical' | 'High' | 'Standard'

export interface DemoRoleMeta {
  name: string
  department: string
  businessUnit: string
  purpose: string
  criticality: RoleCriticality
  requirementKey: string
  applicabilityKey: string
  visibleInCatalog: boolean
}

export const DEMO_ROLES: DemoRoleMeta[] = [
  {
    name: 'Additive Manufacturing Technician',
    department: 'Additive Manufacturing',
    businessUnit: 'AM Operations',
    purpose:
      'Runs additive manufacturing builds, machine setup, powder changeovers, and in-process quality controls.',
    criticality: 'High',
    requirementKey: 'Additive Manufacturing Technician',
    applicabilityKey: 'Additive Manufacturing Technician',
    visibleInCatalog: true,
  },
  {
    name: 'Welding / Fabrication Technician',
    department: 'Welding & Fabrication',
    businessUnit: 'AM Operations',
    purpose:
      'Performs welding, fabrication, and post-build finishing work to controlled procedures and quality standards.',
    criticality: 'Critical',
    requirementKey: 'Welding / Fabrication Technician',
    applicabilityKey: 'Welding / Fabrication Technician',
    visibleInCatalog: true,
  },
  {
    name: 'Robotics Operator',
    department: 'Robotics',
    businessUnit: 'Robotics & Automation',
    purpose:
      'Operates robotic cells safely and maintains authorised execution of automated production activities.',
    criticality: 'High',
    requirementKey: 'Robotics Operator',
    applicabilityKey: 'Robotics Operator',
    visibleInCatalog: true,
  },
  {
    name: 'Materials Testing Technician',
    department: 'Materials Testing',
    businessUnit: 'Quality & Readiness',
    purpose:
      'Performs tensile, hardness, dimensional, and traceability verification activities for AM output.',
    criticality: 'High',
    requirementKey: 'Materials Testing Technician',
    applicabilityKey: 'Materials Testing Technician',
    visibleInCatalog: true,
  },
  {
    name: 'QA Inspector',
    department: 'Quality Assurance',
    businessUnit: 'Quality & Readiness',
    purpose:
      'Controls inspection, release, NCR escalation, and evidence-backed conformity decisions for production work.',
    criticality: 'High',
    requirementKey: 'QA Inspector',
    applicabilityKey: 'QA Inspector',
    visibleInCatalog: true,
  },
  {
    name: 'QHSE Coordinator',
    department: 'HSE',
    businessUnit: 'Quality & Readiness',
    purpose:
      'Coordinates quality, health, safety, environment, CAPA, and audit readiness for the AM operation.',
    criticality: 'High',
    requirementKey: 'QHSE Coordinator',
    applicabilityKey: 'QHSE Coordinator',
    visibleInCatalog: true,
  },
  {
    name: 'Production Supervisor',
    department: 'Operations',
    businessUnit: 'AM Operations',
    purpose:
      'Leads daily production readiness, authorisation decisions, shift handover, and supervised-work control.',
    criticality: 'High',
    requirementKey: 'Production Supervisor',
    applicabilityKey: 'Production Supervisor',
    visibleInCatalog: true,
  },
  {
    name: 'Production Manager',
    department: 'Operations',
    businessUnit: 'AM Operations',
    purpose:
      'Leads production readiness across additive manufacturing, welding, and robotics teams and owns escalation for operational competence risk.',
    criticality: 'High',
    requirementKey: 'Production Manager',
    applicabilityKey: 'Production Manager',
    visibleInCatalog: false,
  },
  {
    name: 'Technical Director',
    department: 'Operations',
    businessUnit: 'Plant Leadership',
    purpose:
      'Owns technical readiness, process capability, and risk visibility across additive manufacturing operations.',
    criticality: 'Standard',
    requirementKey: 'Technical Director',
    applicabilityKey: 'Technical Director',
    visibleInCatalog: false,
  },
  {
    name: 'HR / Training Coordinator',
    department: 'People & Capability',
    businessUnit: 'People & Capability',
    purpose:
      'Coordinates onboarding, training records, expiry tracking, and competence administration for the plant.',
    criticality: 'Standard',
    requirementKey: 'HR / Training Coordinator',
    applicabilityKey: 'HR / Training Coordinator',
    visibleInCatalog: false,
  },
]

export const VISIBLE_DEMO_ROLES = DEMO_ROLES.filter((role) => role.visibleInCatalog)
export const DEMO_ROLE_NAMES = VISIBLE_DEMO_ROLES.map((role) => role.name)
export const DEMO_DEPARTMENTS = ['All', ...new Set(VISIBLE_DEMO_ROLES.map((role) => role.department))]
export const DEMO_BUSINESS_UNITS = [
  'All',
  ...new Set(VISIBLE_DEMO_ROLES.map((role) => role.businessUnit)),
]

const ROLE_ALIASES: Record<string, string> = {
  'AM Technician': 'Additive Manufacturing Technician',
  'Welding Technician': 'Welding / Fabrication Technician',
  'Coded Welder': 'Welding / Fabrication Technician',
  'Robotics Programmer': 'Robotics Operator',
  'Robot Programmer / Cell Technician': 'Robotics Operator',
  'Shift Lead': 'Production Supervisor',
  'Operations Manager': 'Production Manager',
  'HSE Coordinator': 'QHSE Coordinator',
  'HR & Training Coordinator': 'HR / Training Coordinator',
  'HR Administrator': 'HR / Training Coordinator',
}

const BUSINESS_UNIT_ALIASES: Record<string, string> = {
  Upstream: 'AM Operations',
  Midstream: 'Robotics & Automation',
  Downstream: 'Quality & Readiness',
  Corporate: 'People & Capability',
}

export function normalizeRoleName(value: string | null | undefined): string {
  const raw = value?.trim()
  if (!raw) return ''
  return ROLE_ALIASES[raw] ?? raw
}

export function normalizeBusinessUnitName(value: string | null | undefined): string {
  const raw = value?.trim()
  if (!raw) return ''
  return BUSINESS_UNIT_ALIASES[raw] ?? raw
}

export function getRoleMeta(value: string | null | undefined): DemoRoleMeta | null {
  const normalized = normalizeRoleName(value)
  return DEMO_ROLES.find((role) => role.name === normalized) ?? null
}

export function getVisibleDemoRoles(): DemoRoleMeta[] {
  return VISIBLE_DEMO_ROLES
}

export function isTrackedDemoRole(value: string | null | undefined): boolean {
  return getRoleMeta(value) !== null
}

export function isVisibleDemoRole(value: string | null | undefined): boolean {
  return getRoleMeta(value)?.visibleInCatalog ?? false
}

export function matchRoleName(candidate: string | null | undefined, target: string): boolean {
  return normalizeRoleName(candidate) === normalizeRoleName(target)
}

export function getRequirementRoleKey(value: string | null | undefined): string {
  const normalized = normalizeRoleName(value)
  return getRoleMeta(normalized)?.requirementKey ?? normalized
}

export function getApplicabilityRoleKey(value: string | null | undefined): string {
  const normalized = normalizeRoleName(value)
  return getRoleMeta(normalized)?.applicabilityKey ?? normalized
}

export function roleAudienceIncludes(
  audience: string[] | string | null | undefined,
  roleName: string | null | undefined,
): boolean {
  if (!roleName || !audience) return false
  const values = Array.isArray(audience)
    ? audience
    : audience
        .split(/[,/]/)
        .map((value) => value.trim())
        .filter(Boolean)
  return values.some((value) => value === 'All Employees' || matchRoleName(value, roleName))
}

export function resolveDemoJobTitleFromRoute(jobId: string): JobTitle | null {
  const decoded = decodeURIComponent(jobId)
  const role = getRoleMeta(decoded)
  return role ? createDemoJobTitle(role.name) : null
}

export function createDemoJobTitle(name: string): JobTitle {
  return {
    id: encodeURIComponent(name),
    code: name
      .replace(/\//g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .map((part: string) => part.slice(0, 3).toUpperCase())
      .join('-'),
    name,
    grade: null,
    isActive: true,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  }
}

export function createDemoDepartment(name: string): Department {
  return {
    id: `dept-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    code: name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join(''),
    name,
    parentDepartmentId: null,
    isActive: true,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  }
}

export function createDemoBusinessUnit(name: string): BusinessUnit {
  return {
    id: `bu-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    code: name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join(''),
    name,
    isActive: true,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  }
}

export function normalizeEmployeeForDemo(employee: Employee): Employee {
  const normalizedRole = normalizeRoleName(employee.jobTitle?.name)
  const roleMeta = getRoleMeta(normalizedRole)
  const normalizedBusinessUnit =
    roleMeta?.businessUnit ?? normalizeBusinessUnitName(employee.businessUnit?.name)

  return {
    ...employee,
    businessUnit: employee.businessUnit
      ? { ...employee.businessUnit, name: normalizedBusinessUnit || employee.businessUnit.name }
      : normalizedBusinessUnit
        ? createDemoBusinessUnit(normalizedBusinessUnit)
        : null,
    department: roleMeta
      ? employee.department
        ? { ...employee.department, name: roleMeta.department }
        : createDemoDepartment(roleMeta.department)
      : employee.department,
    jobTitle: normalizedRole
      ? employee.jobTitle
        ? { ...employee.jobTitle, name: normalizedRole }
        : createDemoJobTitle(normalizedRole)
      : employee.jobTitle,
  }
}
