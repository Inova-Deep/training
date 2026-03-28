import type { BusinessUnit, Department, Employee, JobTitle } from '@/api/client'

export type RoleCriticality = 'Critical' | 'High' | 'Standard'

export interface DemoRoleMeta {
  name: string
  department: string
  businessUnit: string
  purpose: string
  criticality: RoleCriticality
}

export const DEMO_ROLES: DemoRoleMeta[] = [
  {
    name: 'Additive Manufacturing Technician',
    department: 'Additive Manufacturing',
    businessUnit: 'AM Operations',
    purpose:
      'Runs additive manufacturing builds, machine setup, powder changeovers, and in-process quality controls.',
    criticality: 'High',
  },
  {
    name: 'Welding / Fabrication Technician',
    department: 'Welding & Fabrication',
    businessUnit: 'AM Operations',
    purpose:
      'Performs welding, fabrication, and post-build finishing work to controlled procedures and quality standards.',
    criticality: 'Critical',
  },
  {
    name: 'Robotics Operator',
    department: 'Robotics',
    businessUnit: 'Robotics & Automation',
    purpose:
      'Operates robotic cells safely and maintains authorised execution of automated production activities.',
    criticality: 'High',
  },
  {
    name: 'Robot Programmer / Cell Technician',
    department: 'Robotics',
    businessUnit: 'Robotics & Automation',
    purpose:
      'Programs, proves, and maintains robot cells, tooling logic, and equipment-specific operating envelopes.',
    criticality: 'Critical',
  },
  {
    name: 'Materials Testing Technician',
    department: 'Materials Testing',
    businessUnit: 'Quality & Readiness',
    purpose:
      'Performs tensile, hardness, dimensional, and traceability verification activities for AM output.',
    criticality: 'High',
  },
  {
    name: 'QA Inspector',
    department: 'Quality Assurance',
    businessUnit: 'Quality & Readiness',
    purpose:
      'Controls inspection, release, NCR escalation, and evidence-backed conformity decisions for production work.',
    criticality: 'High',
  },
  {
    name: 'QHSE Coordinator',
    department: 'HSE',
    businessUnit: 'Quality & Readiness',
    purpose:
      'Coordinates quality, health, safety, environment, CAPA, and audit readiness for the AM operation.',
    criticality: 'High',
  },
  {
    name: 'Production Supervisor',
    department: 'Operations',
    businessUnit: 'AM Operations',
    purpose:
      'Leads daily production readiness, authorisation decisions, shift handover, and supervised-work control.',
    criticality: 'High',
  },
  {
    name: 'Technical Director',
    department: 'Operations',
    businessUnit: 'Plant Leadership',
    purpose:
      'Owns technical readiness, process capability, and risk visibility across additive manufacturing operations.',
    criticality: 'Standard',
  },
  {
    name: 'HR / Training Coordinator',
    department: 'People & Capability',
    businessUnit: 'People & Capability',
    purpose:
      'Coordinates onboarding, training records, expiry tracking, and competence administration for the plant.',
    criticality: 'Standard',
  },
]

export const DEMO_ROLE_NAMES = DEMO_ROLES.map((role) => role.name)
export const DEMO_DEPARTMENTS = ['All', ...new Set(DEMO_ROLES.map((role) => role.department))]
export const DEMO_BUSINESS_UNITS = [
  'All',
  ...new Set(DEMO_ROLES.map((role) => role.businessUnit)),
]

const ROLE_ALIASES: Record<string, string> = {
  'AM Technician': 'Additive Manufacturing Technician',
  'Welding Technician': 'Welding / Fabrication Technician',
  'Coded Welder': 'Welding / Fabrication Technician',
  'Robotics Programmer': 'Robot Programmer / Cell Technician',
  'Shift Lead': 'Production Supervisor',
  'Operations Manager': 'Technical Director',
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

export function isTrackedDemoRole(value: string | null | undefined): boolean {
  return getRoleMeta(value) !== null
}

export function matchRoleName(candidate: string | null | undefined, target: string): boolean {
  return normalizeRoleName(candidate) === normalizeRoleName(target)
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
