# Standalone Competence / Training / Awareness System — Schema Blueprint (Draft v0.1)

**Goal:** Minimal but upgradeable schema that supports the locked workflows/state machine and demo requirements.

****ERP is read-only**. Store only ERP external IDs (UUIDs) for employees, job titles, departments, business units.

**Demo constraint:** Single tenant. No `tenant_id` columns required.

---

## 1. Conventions

* Primary keys:

  * Use UUID primary keys for app-owned entities.
* External keys:

  * Store ERP IDs as `erp_*_id` (UUID string).
* Time:

  * Store timestamps in UTC (`timestamptz`).
* Soft delete:

  * Prefer `archived_at` for library-like entities.
* Audit:

  * Write audit events for all state transitions and configuration changes.

---

## 2. Reference / Lookup Tables

These mirror your spreadsheet “Lists” tab and keep controlled vocabulary central.

### 2.1 `ref_risk_level`

* `code` (PK) — e.g., `LOW`, `MEDIUM`, `HIGH_CRITICAL`
* `name`
* `requires_assessor` (bool)
* `default_is_gating` (bool)
* `sort_order`

Defaults (demo locked):

* LOW: requires_assessor=false, default_is_gating=false
* MEDIUM: requires_assessor=false, default_is_gating=false
* HIGH_CRITICAL: requires_assessor=true, default_is_gating=true

### 2.2 `ref_training_type`

* `code` (PK) — e.g., `CERT_LICENCE`, `OJT_COACHING`, `EXPERIENCE_VALIDATED`, `AWARENESS`
* `name`
* `requires_expiry` (bool)

### 2.3 `ref_assessment_method`

* `code` (PK) — e.g., `RECORD_REVIEW`, `OBSERVATION`, `TEST`, `INTERVIEW`, `MANAGER_SIGNOFF`
* `name`

### 2.4 `ref_status`

* `code` (PK) — `N_A`, `REQUIRED`, `IN_PROGRESS`, `VALID` (primary), `EXPIRING` (derived), `EXPIRED` (derived)
* `name`
* `is_derived` (bool)

Note: `EXPIRING` and `EXPIRED` are **derived from expiry_date** and not stored as the base state.

### 2.5 `ref_evidence_type`

* `code` (PK) — `CERTIFICATE`, `RECORD`, `OBSERVATION_NOTE`, `SIGNOFF`, `EXTERNAL_REFERENCE`
* `name`

### 2.6 `ref_responsible_party`

* `code` (PK) — `EMPLOYEE`, `LINE_MANAGER`, `HR_ADMIN`, `ASSSESSOR`, `QHSE`
* `name`

---

## 3. Configuration Tables (Role/Competency Setup)

### 3.1 `role_applicability_decision`

Applicability is stored per ERP Job Title.

* `id` (UUID, PK)
* `erp_job_title_id` (UUID, unique)
* `q1_role_specific_technical` (bool)
* `q2_mgmt_system_responsibilities` (bool)
* `q3_mandatory_requirements` (bool)
* `q4_evidence_beyond_awareness` (bool)
* `q5_safety_quality_critical` (bool)
* `result` (enum/text) — `INCLUDED`, `AWARENESS_ONLY`, `OUT_OF_SCOPE`
* `notes` (text)
* `version` (int)
* `created_by_user_id` (UUID)
* `created_at` (timestamptz)
* `updated_by_user_id` (UUID)
* `updated_at` (timestamptz)

Indexes:

* unique(erp_job_title_id)

### 3.2 `competency_library_item`

Reusable competency definitions.

* `id` (UUID, PK)
* `code` (text, unique) — optional, human-friendly
* `title` (text)
* `description` (text)
* `category` (text) — controlled via ref table if desired
* `risk_level_code` (FK -> ref_risk_level.code)
* `criticality_domain` (text) — e.g., Safety/Quality/Compliance/Environment
* `default_training_type_code` (FK -> ref_training_type.code)
* `default_assessment_method_code` (FK -> ref_assessment_method.code)
* `default_validity_days` (int, nullable)
* `default_requires_expiry` (bool)
* `archived_at` (timestamptz, nullable)
* `created_at`, `updated_at`

Indexes:

* unique(code)
* (risk_level_code)

### 3.3 `role_requirement_set`

Represents a published set/version of requirements for an ERP Job Title.

* `id` (UUID, PK)
* `erp_job_title_id` (UUID)
* `version` (int)
* `status` (text) — `DRAFT`, `PUBLISHED`, `RETIRED`
* `published_at` (timestamptz, nullable)
* `published_by_user_id` (UUID, nullable)
* `notes` (text)
* `created_at`, `updated_at`

Indexes:

* (erp_job_title_id, status)
* unique(erp_job_title_id, version)

### 3.4 `role_requirement`

A single requirement within a requirement set.

* `id` (UUID, PK)
* `role_requirement_set_id` (FK -> role_requirement_set.id)
* `competency_library_item_id` (FK -> competency_library_item.id)
* `mandatory` (bool)
* `training_type_code` (FK -> ref_training_type.code)
* `assessment_method_code` (FK -> ref_assessment_method.code)
* `risk_level_code` (FK -> ref_risk_level.code) — override allowed
* `is_gating` (bool) — **Option A**
* `validity_days` (int, nullable) — override allowed
* `requires_expiry` (bool)
* `sort_order` (int)

Indexes:

* (role_requirement_set_id)
* unique(role_requirement_set_id, competency_library_item_id)

---

## 4. Operational Tables (Per Employee)

### 4.1 `employee_competence_item`

One row per employee per role_requirement (instantiated).

* `id` (UUID, PK)
* `erp_employee_id` (UUID)
* `erp_job_title_id_snapshot` (UUID) — for audit/history
* `role_requirement_set_id_snapshot` (UUID) — which published version instantiated this
* `role_requirement_id_snapshot` (UUID)
* `competency_library_item_id` (UUID)

Base state:

* `base_status_code` (FK -> ref_status.code) — stored values: `N_A`, `REQUIRED`, `IN_PROGRESS`, `VALID`

Validity:

* `last_completed_at` (timestamptz, nullable) — last PASS milestone
* `valid_from` (timestamptz, nullable)
* `expiry_date` (date, nullable)

Ownership/assignment:

* `assigned_assessor_user_id` (UUID, nullable)
* `notes` (text)

System fields:

* `created_at`, `updated_at`

Indexes:

* (erp_employee_id)
* (competency_library_item_id)
* (base_status_code)
* (expiry_date)
* unique(erp_employee_id, role_requirement_id_snapshot, role_requirement_set_id_snapshot)

Derived status rules (computed in query or service):

* If base_status != VALID → derived = base_status
* If base_status == VALID and expiry_date exists:

  * today > expiry_date → EXPIRED
  * today within 30 days before expiry → EXPIRING
  * else → VALID

### 4.2 `evidence_record`

Stores file evidence and/or external references.

* `id` (UUID, PK)
* `evidence_type_code` (FK -> ref_evidence_type.code)

File fields (nullable when external-only):

* `storage_provider` (text) — e.g., `S3`
* `storage_bucket` (text)
* `storage_key` (text)
* `original_filename` (text)
* `content_type` (text)
* `file_size_bytes` (bigint)

External reference fields (nullable when file-only):

* `external_url` (text)
* `reference_number` (text)
* `issuer` (text)

Dates:

* `issue_date` (date, nullable)
* `expiry_date` (date, nullable)

Review:

* `review_status` (text) — `SUBMITTED`, `ACCEPTED`, `REJECTED`
* `reviewed_by_user_id` (UUID, nullable)
* `reviewed_at` (timestamptz, nullable)
* `review_comment` (text, nullable)

Ownership:

* `uploaded_by_user_id` (UUID)
* `uploaded_for_erp_employee_id` (UUID, nullable) — if HR uploads on behalf
* `created_at`, `updated_at`

Indexes:

* (uploaded_for_erp_employee_id)
* (review_status)
* (expiry_date)

### 4.3 `evidence_link`

Many-to-many: evidence can satisfy multiple competence items.

* `id` (UUID, PK)
* `evidence_record_id` (FK)
* `employee_competence_item_id` (FK)
* `created_at`

Indexes:

* unique(evidence_record_id, employee_competence_item_id)
* (employee_competence_item_id)

### 4.4 `assessment_event`

Immutable history events. This is where “COMPLETED” lives.

* `id` (UUID, PK)
* `employee_competence_item_id` (FK)
* `assessment_method_code` (FK -> ref_assessment_method.code)
* `outcome` (text) — `PASS`, `FAIL`, `LIMITED`
* `assessed_by_user_id` (UUID)
* `assessed_at` (timestamptz)
* `comments` (text)

Optional snapshot fields:

* `expiry_date_set` (date, nullable)
* `validity_days_applied` (int, nullable)

Indexes:

* (employee_competence_item_id, assessed_at desc)

### 4.5 `training_need`

Action tracking to close gaps.

* `id` (UUID, PK)
* `erp_employee_id` (UUID)
* `employee_competence_item_id` (UUID, nullable) — link to the gap item
* `training_type_code` (FK)
* `status` (text) — `OPEN`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
* `due_date` (date, nullable)
* `assigned_to_user_id` (UUID, nullable)
* `created_reason` (text)
* `created_by_user_id` (UUID)
* `created_at`, `updated_at`

Indexes:

* (erp_employee_id)
* (status)
* (due_date)

### 4.6 `training_completion`

Completion evidence for training.

* `id` (UUID, PK)
* `training_need_id` (FK)
* `completed_at` (timestamptz)
* `completed_by_user_id` (UUID)
* `notes` (text)

Link to evidence:

* `evidence_record_id` (UUID, nullable)

Indexes:

* (training_need_id)

---

## 5. Awareness Tables

### 5.1 `awareness_topic`

* `id` (UUID, PK)
* `title` (text)
* `description` (text)
* `target_rule` (jsonb)

  * demo default: `{ "has_manager": true, "include_contractors_interns": true }`
* `start_at` (timestamptz, nullable)
* `end_at` (timestamptz, nullable)
* `created_by_user_id` (UUID)
* `created_at`, `updated_at`

### 5.2 `awareness_ack`

* `id` (UUID, PK)
* `awareness_topic_id` (FK)
* `erp_employee_id` (UUID)
* `acknowledged_at` (timestamptz)
* `acknowledged_by_user_id` (UUID)

Indexes:

* unique(awareness_topic_id, erp_employee_id)

---

## 6. Users and Authorisation (Demo)

### 6.1 `app_user`

* `id` (UUID, PK)
* `email` (text, unique)
* `display_name` (text)
* `role` (text) — `EMPLOYEE`, `MANAGER`, `HR_ADMIN`
* `erp_employee_id` (UUID, nullable) — link user to ERP employee identity
* `is_active` (bool)
* `created_at`, `updated_at`

---

## 7. Audit

### 7.1 `audit_event`

* `id` (UUID, PK)
* `actor_user_id` (UUID)
* `entity_type` (text) — e.g., `ROLE_APPLICABILITY`, `ROLE_REQUIREMENT_SET`, `EMPLOYEE_COMPETENCE_ITEM`, `EVIDENCE`, `ASSESSMENT`, `TRAINING_NEED`, `AWARENESS`
* `entity_id` (UUID)
* `action` (text) — `CREATE`, `UPDATE`, `PUBLISH`, `STATUS_CHANGE`, `REVIEW_ACCEPT`, `REVIEW_REJECT`, etc.
* `payload` (jsonb) — diff or event details
* `created_at` (timestamptz)

Indexes:

* (entity_type, entity_id)
* (actor_user_id)
* (created_at)

---

## 8. Derived Computations (Query/Service Layer)

### 8.1 Derived status

* Derived status is computed from `base_status_code` + `expiry_date`.
* Only `base_status_code` is stored.

### 8.2 Role-level authorisation

For a given `erp_employee_id`:

* Determine employee job title from ERP.
* Load latest published `role_requirement_set` for that job title.
* Identify requirements where `is_gating = true`.
* Resolve employee competence items for those requirements.
* Authorised if none are REQUIRED or EXPIRED.

### 8.3 Medium gating rule (demo)

If a role requirement is MEDIUM risk and (mandatory==true OR training_type==CERT_LICENCE), default `is_gating=true` unless explicitly overridden.

---

## 9. Minimal Indexing Notes

* Matrix queries rely on:

  * `employee_competence_item(erp_employee_id, base_status_code)`
  * `employee_competence_item(expiry_date)`
* Training queues rely on:

  * `training_need(status, due_date)`
* Evidence reviews rely on:

  * `evidence_record(review_status)`

---

## 10. Validity / Expiry Precedence (Authoritative)

When determining an employee competence item’s validity and expiry date, apply the following precedence chain:

1. **Requirement explicit expiry** (highest precedence)

* If the Role Requirement defines `requires_expiry=true` and a concrete expiry is provided via assessment or requirement-specific rules, that governs.

2. **Evidence expiry**

* If linked accepted evidence includes an `expiry_date`, use the earliest expiry among accepted evidence records linked to the competence item.

3. **Assessment-applied validity**

* If an assessment event sets `expiry_date_set` or `validity_days_applied`, derive expiry from that (assessment date + validity days).

4. **Role Requirement validity override**

* If the Role Requirement defines `validity_days`, derive expiry from last_completed_at + validity_days.

5. **Competency Library default validity**

* If the competency library item defines `default_validity_days`, derive expiry from last_completed_at + default_validity_days.

6. **No expiry**

* If none of the above applies, the item has no expiry_date and remains VALID unless reverted to REQUIRED/IN_PROGRESS.

Notes:

* `requires_expiry=false` allows expiry_date to be null even if evidence includes expiry; however for Certification/Licence types, `requires_expiry` should typically be true.
* If multiple sources provide expiry, the system should choose the **earliest** applicable expiry to remain conservative.

---

## 11. Versioning and Snapshot Strategy (Demo)

* Employees should retain an audit link to the **published role requirement set version** that was used to instantiate their competence items.
* Operationally, the UI may also highlight when a newer role requirement version exists (e.g., “Role requirements updated — review changes”).
* Migration strategy for demo:

  * Do not auto-delete prior items.
  * Add new requirements as new competence items.
  * Removed requirements become N/A (preserve history).

---

## 12. Upgrade Paths (post-demo)

* Add `employee_role_assignment` table to capture historical job-title changes and effective dates.
* Add `assessor_registry` for authorised assessors by BU/Dept/competency.
* Add background job to precompute expiring/expired snapshots for performance.
* Add multi-tenant enforcement (tenant_id on app tables) if needed in future.
