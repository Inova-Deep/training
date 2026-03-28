# Phase 0 — Foundation

## Goal

Expand the data model, reference lists, and competency catalogue so every subsequent phase can consume AM-specific types, statuses, and categories without being blocked.

## Punch list alignment

- Section 1: Overall direction — global additions, AM-specific categories
- Section 11: Reference Lists — controlled vocabularies
- Section 14: Demo data rewrite — competency and role catalogue

## Prerequisites

None — this is the first phase.

## Tasks

### 0.1 Expand TypeScript types

**Files:** `src/types/index.ts`

**What to do:** Add new enums, status codes, and extend existing interfaces to support the domain concepts the punch list requires across all screens.

**Details:**

New status codes to add to `BaseStatusCode`:
- `UNDER_SUPERVISION` — training done or assessment started, supervisor has not signed off for independent work
- `PARTIALLY_MET` — some but not all evidence criteria satisfied
- `REASSESSMENT_DUE` — previously valid, now due for scheduled reassessment

`DerivedStatusCode` inherits these plus the existing `EXPIRING` and `EXPIRED`.

New type: `TrainingNeedSource`
```
'COMPETENCE_GAP' | 'NCR_CAPA' | 'AUDIT_FINDING' | 'PROCEDURE_CHANGE' |
'NEW_EQUIPMENT' | 'NEW_STARTER' | 'EXPIRY_RENEWAL' | 'MANAGER_REQUEST' |
'INCIDENT_NEAR_MISS'
```

New type: `TrainingNeedWorkflowStatus`
```
'IDENTIFIED' | 'APPROVED' | 'SCHEDULED' | 'IN_PROGRESS' |
'EVIDENCE_SUBMITTED' | 'EFFECTIVENESS_REVIEW' | 'CLOSED'
```

New type: `AwarenessTopicType`
```
'PROCEDURE_REVISION' | 'SAFETY_BRIEFING' | 'QUALITY_ALERT' |
'CUSTOMER_REQUIREMENT' | 'MANAGEMENT_SYSTEM_UPDATE' | 'TOOLBOX_TALK' |
'NEW_EQUIPMENT_INTRO' | 'INCIDENT_LEARNING'
```

New type: `AwarenessDeliveryMethod`
```
'READ_AND_ACKNOWLEDGE' | 'TEAM_BRIEFING' | 'TOOLBOX_TALK' |
'SUPERVISOR_CASCADE' | 'FORMAL_RETRAINING'
```

New type: `AwarenessWorkflowStatus`
```
'DRAFTED' | 'ISSUED' | 'IN_COMMUNICATION' |
'AWAITING_ACKNOWLEDGEMENT' | 'VERIFICATION_PENDING' | 'CLOSED'
```

New type: `CompetencyType`
```
'SKILL' | 'TRAINING' | 'CERTIFICATION' | 'AWARENESS_TOPIC' |
'OJT_COACHING' | 'PROCEDURE_BRIEFING' | 'EXTERNAL_QUALIFICATION' |
'EQUIPMENT_QUALIFICATION'
```

Extend `CompetencyLibraryItem` — add:
```
competencyType: CompetencyType
applicableDepartments?: string[]
applicableRoles?: string[]
safetyCritical?: boolean
qualityCritical?: boolean
provider?: string
linkedDocumentRef?: string
internalExternal?: 'INTERNAL' | 'EXTERNAL'
```

Extend `TrainingNeed` — add:
```
sourceType: TrainingNeedSource
sourceReference?: string
interventionType?: string
effectivenessCheckMethod?: string
workflowStatus: TrainingNeedWorkflowStatus
priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
```

Default priority computation for generated training needs:
- `CRITICAL` — gating competency + EXPIRED or REQUIRED
- `HIGH` — sourceType is NCR_CAPA or INCIDENT_NEAR_MISS
- `MEDIUM` — sourceType is EXPIRY_RENEWAL or AUDIT_FINDING
- `LOW` — all other sources

Extend `AwarenessTopic` — add:
```
topicType: AwarenessTopicType
deliveryMethod: AwarenessDeliveryMethod
trigger?: string
relatedDocumentRef?: string
effectiveDate?: string
acknowledgementRequired: boolean
briefingRequired: boolean
verificationRequired: boolean
workflowStatus: AwarenessWorkflowStatus
```

---

### 0.2 Expand reference lists

**Files:** `src/data/referenceLists.json`

**What to do:** Add new controlled vocabulary lists. Keep existing lists intact and expand where noted.

**Details:**

Add these new top-level arrays:

| List key | Items |
|----------|-------|
| `supervisionStatuses` | SUPERVISED, INDEPENDENT, RESTRICTED_SCOPE |
| `gapSeverityLevels` | CRITICAL, HIGH, MODERATE, LOW |
| `trainingNeedSources` | 9 items matching `TrainingNeedSource` enum |
| `awarenessTopicTypes` | 8 items matching `AwarenessTopicType` enum |
| `awarenessDeliveryMethods` | 5 items matching `AwarenessDeliveryMethod` enum |
| `competencyTypes` | 8 items matching `CompetencyType` enum |
| `interventionTypes` | COACHING_OJT, TOOLBOX_TALK, EXTERNAL_COURSE, INTERNAL_BRIEFING, PROCEDURE_READ_AND_ACK, SUPERVISOR_OBSERVATION, CERTIFICATION_RENEWAL |
| `reassessmentTriggers` | EXPIRY, NCR, AUDIT, INCIDENT, PROCEDURE_CHANGE, MANAGER_REQUEST, ROLE_CHANGE |

Expand existing `assessmentMethods` — add:
- `PRACTICAL_DEMONSTRATION`
- `SUPERVISOR_OBSERVATION`
- `PORTFOLIO_REVIEW`

Expand existing `evidenceTypes` — add:
- `WELDING_QUALIFICATION_RECORD`
- `MATERIALS_TEST_REPORT`
- `ROBOT_OPERATION_SIGNOFF`
- `TOOLBOX_TALK_ATTENDANCE`

---

### 0.3 Expand competency catalogue

**Files:** `src/data/competencies.json`

**What to do:** Keep all 15 existing competencies. Add ~10 new AM-specific competencies. Update all items to include the new `competencyType` field. Recategorise where needed to use the 8 AM-oriented categories.

**Details — new competencies to add:**

| Code | Title | Category | Risk | Type | Expiry |
|------|-------|----------|------|------|--------|
| WELD | Welding Qualification (Coded Welder) | Welding & Fabrication | HIGH_CRITICAL | CERTIFICATION | 730d |
| WELD-INS | Weld Inspection Awareness | Welding & Fabrication | MEDIUM | AWARENESS_TOPIC | No |
| ROBOT-OP | Robot Cell Operation | Robotics & Automation | HIGH_CRITICAL | EQUIPMENT_QUALIFICATION | 365d |
| ROBOT-PROG | Robot Programming / Teach Pendant | Robotics & Automation | MEDIUM | OJT_COACHING | No |
| AM-SETUP | Additive Manufacturing Process Setup | Additive Manufacturing Operations | HIGH_CRITICAL | EQUIPMENT_QUALIFICATION | 365d |
| POWDER | Powder / Material Handling Controls | Materials & Powder Handling | MEDIUM | TRAINING | No |
| MAT-TRACE | Materials Traceability | Materials & Powder Handling | MEDIUM | AWARENESS_TOPIC | No |
| MAT-TEST | Materials Testing Method Awareness | Materials Testing & Inspection | MEDIUM | TRAINING | No |
| FLT | Forklift Operation | Equipment-Specific Qualification | HIGH_CRITICAL | CERTIFICATION | 365d |
| ABR | Abrasive Wheels / Tools | HSE / Workshop Safety | HIGH_CRITICAL | CERTIFICATION | 365d |
| RCA | Root Cause Analysis | Quality & Compliance | MEDIUM | TRAINING | No |
| MACH-QUAL | Machine-Specific Qualification | Equipment-Specific Qualification | HIGH_CRITICAL | EQUIPMENT_QUALIFICATION | 365d |

**Recategorisation of existing competencies:**

| Code | Current category | New category |
|------|-----------------|--------------|
| PTW | Technical | HSE / Workshop Safety |
| LOTO | Technical | HSE / Workshop Safety |
| WAH | Technical | HSE / Workshop Safety |
| CSE | Technical | HSE / Workshop Safety |
| LIFT | Technical | Equipment-Specific Qualification |
| MECH | Technical | (keep as Technical or move to Equipment-Specific) |
| TOOLS | Technical | Materials Testing & Inspection |
| DOC | Quality | Quality & Compliance |
| NCR | Quality | Quality & Compliance |
| CAPA | Quality | Quality & Compliance |
| HSE-IND | Mandatory | Mandatory |
| FIRE | Mandatory | HSE / Workshop Safety |
| MH | Mandatory | Mandatory |
| PPE | Mandatory | HSE / Workshop Safety |
| FA | Mandatory | Mandatory |

All items gain a `competencyType` field (defaulting to their most natural type).

---

### 0.4 Expand role requirements

**Files:** `src/data/roleRequirements.json`

**What to do:** Add 3–4 new AM-specific role requirement sets. Update existing roles to include new competency assignments where relevant.

**Details — new roles to add:**

| Role | Key competencies | Gating items |
|------|-----------------|-------------|
| Additive Manufacturing Technician | AM-SETUP, POWDER, MAT-TRACE, LOTO, HSE-IND, PPE, FIRE | AM-SETUP, LOTO, HSE-IND |
| Welding / Fabrication Technician | WELD, WELD-INS, ABR, LOTO, PTW, HSE-IND, PPE, FIRE | WELD, ABR, LOTO, HSE-IND |
| Robotics Operator | ROBOT-OP, ROBOT-PROG, LOTO, HSE-IND, PPE | ROBOT-OP, LOTO, HSE-IND |
| Materials Testing Technician | MAT-TEST, MAT-TRACE, TOOLS, DOC, HSE-IND, PPE | MAT-TEST, TOOLS, HSE-IND |

Update existing roles where relevant:
- Maintenance Technician: add FLT (gating: false)
- QHSE Coordinator: add RCA (gating: false), add WELD-INS (gating: false)
- Shift Lead: add ROBOT-OP (gating: false)

---

### 0.5 Update stores for new types

**Files:**
- `src/stores/referenceLists.ts`
- `src/stores/skillsMatrix.ts`
- `src/stores/competencyLibrary.ts`
- `src/stores/trainingNeeds.ts`

**What to do:**

`referenceLists.ts`:
- Add getters for all new lists (supervisionStatuses, trainingNeedSources, etc.)

`skillsMatrix.ts`:
- Add `UNDER_SUPERVISION` to the `CompetenceStatus` and `DerivedStatus` type unions
- Update the `COMPETENCIES` mapping to handle new categories and the `competencyType` field
- Expand `CompetencyCategory` type to include all 8 AM categories
- Update `CATEGORY_ORDER` / `expandedCategories` default to list all 8

`competencyLibrary.ts`:
- Support new fields in create/update stubs (competencyType, applicableDepartments, etc.)

`trainingNeeds.ts`:
- Add `sourceType` and `workflowStatus` to the template and generated need structure
- Add `ResolutionType` expansion for new intervention types

---

### 0.6 Update StatusChip component

**Files:** `src/components/ui/status-chip/StatusChip.vue`

**What to do:** Add visual treatment for the 3 new statuses.

**Details:**

| Status | Label | Colour | Icon suggestion |
|--------|-------|--------|----------------|
| UNDER_SUPERVISION | Under Supervision | Amber/orange | Eye |
| PARTIALLY_MET | Partially Met | Amber | CircleHalf (or similar) |
| REASSESSMENT_DUE | Reassessment Due | Blue | RefreshCw |

---

## Acceptance criteria

- [ ] `types/index.ts` compiles with no errors after all additions
- [ ] `referenceLists.json` is valid JSON and all new lists are present
- [ ] `competencies.json` has ~25 items, all with `competencyType` field, using 8 AM categories
- [ ] `roleRequirements.json` has 9–10 role sets (6 existing + 3–4 new AM roles)
- [ ] All stores import and reference the new types without errors
- [ ] StatusChip renders all new statuses with correct colour and label
- [ ] The app builds and runs without errors (`npm run dev`)

## Files modified

- `src/types/index.ts`
- `src/data/referenceLists.json`
- `src/data/competencies.json`
- `src/data/roleRequirements.json`
- `src/stores/referenceLists.ts`
- `src/stores/skillsMatrix.ts`
- `src/stores/competencyLibrary.ts`
- `src/stores/trainingNeeds.ts`
- `src/components/ui/status-chip/StatusChip.vue`

## Files created

None.

## Demo story

Phase 0 alone is not demo-visible — it is foundational. The expanded data becomes visible starting in Phase 1.
