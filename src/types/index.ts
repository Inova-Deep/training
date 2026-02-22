export interface RiskLevel {
  code: string
  name: string
  requiresAssessor: boolean
  defaultIsGating: boolean
  sortOrder: number
}

export interface TrainingType {
  code: string
  name: string
  requiresExpiry: boolean
}

export interface AssessmentMethod {
  code: string
  name: string
}

export interface Status {
  code: string
  name: string
  isDerived: boolean
}

export interface EvidenceType {
  code: string
  name: string
}

export interface ResponsibleParty {
  code: string
  name: string
}

export interface RoleApplicabilityDecision {
  id: string
  erpJobTitleId: string
  /** Q1: Does this role perform hands-on operational work? */
  q1HandsOnOperational: boolean
  /** Q2: Does this role approve/certify/sign off work affecting conformity? */
  q2ConformitySignOff: boolean
  /** Q3: Can an error in this role cause safety/quality/environmental/compliance impact? */
  q3ErrorCausesImpact: boolean
  /** Q4: Is specific competence required (not just general awareness)? */
  q4SpecificCompetenceRequired: boolean
  /** Q5: Is objective evidence required (certificate, OJT record, observation)? */
  q5ObjectiveEvidenceRequired: boolean
  result: 'INCLUDED' | 'AWARENESS_ONLY' | 'OUT_OF_SCOPE'
  notes?: string
  version: number
  createdByUserId: string
  createdAt: string
  updatedByUserId?: string
  updatedAt?: string
}

export interface CompetencyLibraryItem {
  id: string
  code?: string
  title: string
  description?: string
  category: string
  riskLevelCode: string
  criticalityDomain?: string
  defaultTrainingTypeCode: string
  defaultAssessmentMethodCode: string
  defaultValidityDays?: number
  defaultRequiresExpiry: boolean
  archivedAt?: string
  createdAt: string
  updatedAt: string
}

export interface RoleRequirementSet {
  id: string
  erpJobTitleId: string
  version: number
  status: 'DRAFT' | 'PUBLISHED' | 'RETIRED'
  publishedAt?: string
  publishedByUserId?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface RoleRequirement {
  id: string
  roleRequirementSetId: string
  competencyLibraryItemId: string
  mandatory: boolean
  trainingTypeCode: string
  assessmentMethodCode: string
  riskLevelCode: string
  isGating: boolean
  validityDays?: number
  requiresExpiry: boolean
  sortOrder: number
}

export type BaseStatusCode = 'N_A' | 'REQUIRED' | 'IN_PROGRESS' | 'VALID'
export type DerivedStatusCode = BaseStatusCode | 'EXPIRING' | 'EXPIRED'

export interface EmployeeCompetenceItem {
  id: string
  erpEmployeeId: string
  erpJobTitleIdSnapshot: string
  roleRequirementSetIdSnapshot: string
  roleRequirementIdSnapshot: string
  competencyLibraryItemId: string
  baseStatusCode: BaseStatusCode
  lastCompletedAt?: string
  validFrom?: string
  expiryDate?: string
  assignedAssessorUserId?: string
  notes?: string
  createdAt: string
  updatedAt: string
  derivedStatusCode?: DerivedStatusCode
}

export interface EvidenceRecord {
  id: string
  evidenceTypeCode: string
  storageProvider?: string
  storageBucket?: string
  storageKey?: string
  originalFilename?: string
  contentType?: string
  fileSizeBytes?: number
  externalUrl?: string
  referenceNumber?: string
  issuer?: string
  issueDate?: string
  expiryDate?: string
  reviewStatus: 'SUBMITTED' | 'ACCEPTED' | 'REJECTED'
  reviewedByUserId?: string
  reviewedAt?: string
  reviewComment?: string
  uploadedByUserId: string
  uploadedForErpEmployeeId?: string
  createdAt: string
  updatedAt: string
}

export interface EvidenceLink {
  id: string
  evidenceRecordId: string
  employeeCompetenceItemId: string
  createdAt: string
}

export interface AssessmentEvent {
  id: string
  employeeCompetenceItemId: string
  assessmentMethodCode: string
  outcome: 'PASS' | 'FAIL' | 'LIMITED'
  assessedByUserId: string
  assessedAt: string
  comments?: string
  expiryDateSet?: string
  validityDaysApplied?: number
}

export interface TrainingNeed {
  id: string
  erpEmployeeId: string
  employeeCompetenceItemId?: string
  trainingTypeCode: string
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  dueDate?: string
  assignedToUserId?: string
  createdReason?: string
  createdByUserId: string
  createdAt: string
  updatedAt: string
}

export interface TrainingCompletion {
  id: string
  trainingNeedId: string
  completedAt: string
  completedByUserId: string
  notes?: string
  evidenceRecordId?: string
}

export interface AwarenessTopicTargetRule {
  hasManager: boolean
  includeContractorsInterns: boolean
  jobTitleIds?: string[]
  departmentIds?: string[]
  businessUnitIds?: string[]
}

export interface AwarenessTopic {
  id: string
  title: string
  description?: string
  targetRule: AwarenessTopicTargetRule
  startAt?: string
  endAt?: string
  createdByUserId: string
  createdAt: string
  updatedAt: string
}

export interface AwarenessAck {
  id: string
  awarenessTopicId: string
  erpEmployeeId: string
  acknowledgedAt: string
  acknowledgedByUserId: string
}

export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN'

export interface AppUser {
  id: string
  email: string
  displayName: string
  role: UserRole
  erpEmployeeId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ErpEmployee {
  id: string
  employeeNumber: string
  firstName: string
  lastName: string
  email: string
  jobTitleId: string
  jobTitleName: string
  departmentId: string
  departmentName: string
  businessUnitId: string
  businessUnitName: string
  managerId?: string
  managerName?: string
  employmentStatus: string
  startDate: string
}

export interface ErpJobTitle {
  id: string
  code: string
  name: string
  description?: string
}

export interface ErpDepartment {
  id: string
  code: string
  name: string
  businessUnitId: string
}

export interface ErpBusinessUnit {
  id: string
  code: string
  name: string
}

export interface AuditEvent {
  id: string
  actorUserId: string
  entityType: string
  entityId: string
  action: string
  payload?: Record<string, unknown>
  createdAt: string
}

export interface PaginationMetadata {
  currentPage: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface AuthLoginResponse {
  token: string
}

export interface BusinessUnitSummary {
  id: string
  code: string | null
  name: string | null
}

export interface DepartmentSummary {
  id: string
  code: string | null
  name: string | null
}

export interface JobTitleSummary {
  id: string
  code: string | null
  name: string | null
  grade: string | null
}

export interface ManagerSummary {
  id: string
  employeeNo: string | null
  firstName: string | null
  lastName: string | null
  displayName: string | null
}

export interface Employee {
  id: string
  tenantId: string
  employeeNo: string
  firstName: string
  lastName: string
  displayName: string | null
  workEmail: string | null
  status: 'active' | 'inactive'
  isActive: boolean
  createdAt: string
  updatedAt: string
  businessUnit: BusinessUnitSummary | null
  department: DepartmentSummary | null
  jobTitle: JobTitleSummary | null
  manager: ManagerSummary | null
}

export interface EmployeeHierarchyItem {
  id: string
  employeeNo: string
  firstName: string
  lastName: string
  managerId: string | null
}

export interface BusinessUnit {
  id: string
  code: string | null
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Department {
  id: string
  code: string | null
  name: string
  parentDepartmentId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface JobTitle {
  id: string
  code: string | null
  name: string
  grade: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  tenantId: string
  employeeId: string | null
  email: string
  displayName: string | null
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  code: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: string
  tenantId: string
  actorId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  entityType: string
  entityId: string
  changes: Record<string, unknown>
  createdAt: string
}

export interface OnboardRequest {
  employeeNo: string
  firstName: string
  lastName: string
  displayName?: string
  workEmail: string
  password: string
  initialRoleId: string
  businessUnitId?: string
  departmentId?: string
  jobTitleId?: string
  managerId?: string
}

export interface OnboardResponse {
  employeeId: string
  userId: string
  email: string
}

export interface CreateEmployeeRequest {
  employeeNo: string
  firstName: string
  lastName: string
  displayName?: string
  workEmail?: string
  businessUnitId?: string
  departmentId?: string
  jobTitleId?: string
  managerId?: string
}

export interface CreateUserRequest {
  employeeId: string
  email: string
  displayName?: string
  password: string
}

export interface AssignRoleRequest {
  roleId: string
}

export interface CreateBusinessUnitRequest {
  code: string
  name: string
}

export interface CreateDepartmentRequest {
  code: string
  name: string
  parentDepartmentId?: string
}

export interface CreateJobTitleRequest {
  code: string
  name: string
  grade?: string
}

export interface CreateRoleRequest {
  code: string
  name: string
  description?: string
}

export interface LoginRequest {
  email: string
  password: string
}
