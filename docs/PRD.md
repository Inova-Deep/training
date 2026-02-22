# Standalone Competence / Training / Awareness System — PRD (Draft v0.1)

**Product type:** Dedicated standalone web app

**Primary purpose:** Provide a defensible, auditable way to define role-based competence requirements, assess people against those requirements, manage evidence and expiry, and drive training/awareness actions until gaps are closed.

**Integration assumption (demo scope):** The company already has an ERP that exposes a **read-only REST API** providing Employees (incl. manager), Departments, Business Units/Locations, Business Lines (if available), and **Job Titles**. This app calls ERP live for directory/org data and stores only competence/training/awareness records.

---

## 1. Goals

1. Replace spreadsheet-driven competence tracking with a system that is easier to use, faster to audit, and harder to “drift” from procedure.

2. Make competence status visible by employee, team, and organisational slice (BU, Department, Job Title), including expiry/renewal management.

3. Drive action automatically: when a requirement is missing, expiring, or expired, the system assigns a clear action and owner.

4. Support both:

* **Competence** (ability to perform work, incl. assessment and authorisation)
* **Training** (a mechanism to close gaps)
* **Awareness** (policy/procedure awareness; often outside the skills matrix)

---

## 2. Non-Goals (Demo Scope)

* Payroll, leave, scheduling, timesheets.
* Full Learning Management System (LMS) with course catalogs, SCORM, complex quizzes.
* Automatic bidirectional write-back to ERP (ERP remains read-only).
* Workforce planning / recruitment.
* Deep historical org analytics (for demo we focus on operational status + audit trail).

---

## 3. Users and Roles

### 3.1 Primary user personas

* **Line Manager / Supervisor**: owns competence verification for their team; assigns/validates OJT; controls independent work authorisation.
* **HR / People Ops**: maintains master employment records (in ERP) and stores/validates certificates; supports training administration.
* **QHSE / Compliance**: defines risk categorisation patterns; audits completion; may act as assessor for safety-critical items.
* **Employee**: uploads evidence; requests training; acknowledges awareness topics; views own requirements.
* **System Admin**: configures reference lists; manages templates; controls thresholds and permissions.

### 3.2 Permissions (principles)

* Access is **role-based** and **scope-based**.
* Managers can see:

  * “My Team (Direct)” and “My Team (All Levels)” (if ERP supports hierarchy endpoint)
* Employees can view/edit only their own evidence submissions (unless HR/Assessor overrides).
* HR and QHSE can view across org (scope configurable by BU/Department).

---

## 4. Data Sources and Integration

### 4.1 ERP as system of record (read-only)

The app relies on ERP for:

* Employee identity and employment status
* Manager relationship
* Org structure (BU, Department, Business Line if available)
* Job Titles (dedicated Job Title resource)

### 4.2 App as system of record

The app stores:

* Role applicability decisions
* Competency library
* Role requirements
* Per-employee competence items (status, evidence, assessment, expiry)
* Training needs and records
* Awareness topics and acknowledgements
* Audit trail

### 4.3 Demo simplification

* The app may call ERP per page load.
* Optional short-lived caching (seconds/minutes) is allowed to keep demo performance smooth.

---

## 5. Core Concepts and Definitions

* **Role (for competence):** For the demo, a Role maps 1:1 to ERP **Job Title**.
* **Applicability Decision:** A role-level gate that determines whether a job title is included in the skills matrix.
* **Competency Requirement:** A defined requirement (skill/cert/knowledge/experience) with risk and expected evidence.
* **Evidence:** Document, record, observation, sign-off, or reference proving competence. Evidence may be internal or third‑party.
* **Assessment:** Verification of evidence and/or observed performance by an authorised assessor.
* **Independent Work Authorisation (Role-level):** A role-level authorisation computed from a defined set of **gating requirements** for that role.
* **Training Need:** A tracked action created when a gap exists; completion usually requires reassessment.
* **Awareness:** Communication and acknowledgement of policies/procedures; often managed outside the role skills matrix.

---

## 6. Functional Requirements

### 6.1 Role Applicability (Skills Matrix Inclusion)

**Objective:** Decide whether a Job Title should be tracked in the Skills Matrix.

Capabilities:

* Create and maintain an Applicability Decision per Job Title.
* Capture a simple questionnaire (based on the current spreadsheet Tab1):

  * Role-specific technical requirements?
  * Management system / governance responsibilities?
  * Mandatory requirements for role?
  * Evidence required beyond induction/awareness?
  * Safety/quality critical impact?
* System derives a result:

  * **Included in Skills Matrix**
  * **Not included (managed via Induction/Awareness)**
  * **Not included (out of scope)**
* Store:

  * Owner (who completed it)
  * Date
  * Notes/justification
  * Version history (at minimum: last updated + prior values)

Acceptance criteria:

* A Job Title cannot have Role Requirements published unless it is marked “Included”.

---

### 6.2 Competency Library

**Objective:** Maintain a reusable set of competency requirements.

Capabilities:

* Create/edit competency items with:

  * Category (e.g., Technical, Management System, Mandatory)
  * Risk level (e.g., Low/Medium/High, Safety-Critical)
  * Criticality domain (Safety/Quality/Compliance/Environment)
  * Default evidence expected (rule-driven)
  * Default assessment methods
  * Validity/expiry rule (optional)

Acceptance criteria:

* Library items can be reused across multiple Job Titles.

---

### 6.3 Role Requirements (per Job Title)

**Objective:** Define what is required for each Job Title.

Capabilities:

* Attach competency library items to a Job Title.
* Define per requirement:

  * Mandatory flag
  * Training type (e.g., Certification/Licence, OJT, Experience, Induction)
  * Assessment method default
  * Expiry/renewal rules (if applicable)
* Publish Role Requirements (a “published” state to control change).

Acceptance criteria:

* When Role Requirements are published, employees with that job title will show those requirements in their matrix view.

---

### 6.4 Employee Competence Record (Skills Matrix)

**Objective:** Track each employee’s status against role requirements.

Capabilities:

* Render a Skills Matrix view that mirrors the spreadsheet Tab2:

  * Employees (from ERP)
  * Job Title (from ERP)
  * Department/BU filters (from ERP)
  * Competency items and statuses (from app)
* Status values (confirmed approach):

  * **Completed** = competence was assessed/confirmed at a point in time (historical milestone)
  * **Valid** = competence is currently valid (within validity window; not expired)
  * **Expiring** = within 30 days of expiry
  * **Expired** = past expiry date
  * **Required** = missing/needs initial completion
  * **In Progress** = action underway (e.g., training booked / evidence pending review)
  * **Not Applicable (N/A)** = managed via induction/awareness or out of scope for matrix
* Auto-derived fields:

  * **Evidence Expected (AUTO)**
  * **Action Required (AUTO)**
  * **Responsible (AUTO)**

Role-level Independent Work Authorisation (confirmed):

* Each Role (Job Title) defines a subset of requirements marked **Gating for Independent Work**.
* A person is **Authorised for the Role** only if **all gating requirements are Valid**.
* If any gating requirement becomes Expired, role authorisation is revoked automatically.

Acceptance criteria:

* A manager can filter to their team and immediately see Required/Expired/Expiring items.
* The UI displays **Valid** primarily, with **Completed** retained as history.

---

### 6.5 Evidence Management

**Objective:** Store and validate proof of competence.

Capabilities:

* Upload evidence (file) and/or attach an external reference.
* Capture evidence metadata:

  * Type (certificate, record, observation, sign-off)
  * Issuer (if certificate)
  * Issue date
  * Expiry date
  * Reference number
  * Notes
* Link evidence to one or more competency items.

External evidence (confirmed requirement):

* The system must allow **external/third‑party certifications** by supporting **external references** (URL and/or reference number) in addition to file uploads.

Acceptance criteria:

* Evidence can be reviewed and accepted/rejected by an assessor.

---

### 6.6 Assessment and Verification

**Objective:** Validate competence via defined assessment methods.

Capabilities:

* Assign an assessor (manager, HR, QHSE, or authorised assessor role).
* Record:

  * Assessment method (record review, observation, test, interview)
  * Assessment date
  * Outcome (pass/fail/limited authorisation)
  * Comments and constraints (if limited)
* Set/renew expiry upon successful assessment.

Acceptance criteria:

* Completed status requires assessor confirmation for any requirement marked safety/quality critical.

---

### 6.7 Training Needs and Records

**Objective:** Turn gaps into managed actions and track completion.

Capabilities:

* Automatically create Training Needs when:

  * Status is Required or Expired
  * Expiring within threshold window (optional)
  * Manager manually flags a gap
* Track:

  * Training type
  * Due date
  * Assigned owner
  * Completion evidence (attendance, certificate, OJT sign-off)
* Link completion to reassessment/verification where required.

Acceptance criteria:

* Expired safety-critical items must show an open Training Need (or equivalent corrective action) until resolved.

---

### 6.8 Awareness and Communication

**Objective:** Track policy/procedure awareness separately when appropriate.

Capabilities:

* Create Awareness Topics (e.g., policy updates, toolbox talk topics).
* Target audiences by:

  * Job Title
  * Department
  * Business Unit
* Capture acknowledgement:

  * Acknowledged by (user)
  * Timestamp
  * Optional supervisor confirmation

Acceptance criteria:

* Awareness topics can be reported by completion rate per audience.

---

### 6.9 Dashboards and Reporting

**Objective:** Provide clear operational and audit views.

Minimum dashboards:

* Organisation overview:

  * Required / Expiring / Expired counts
  * Top risk areas (by risk level / criticality)
* Manager dashboard:

  * My Team (Direct / All Levels)
  * Overdue training needs
  * Expired safety-critical items
* HR/QHSE dashboard:

  * Certificates expiring soon
  * Compliance completion by BU/Department/Job Title

Exports:

* Export matrix to Excel (matching the spreadsheet layout as closely as feasible).

---

### 6.10 Audit Trail

**Objective:** Provide traceability for compliance.

Capabilities:

* Record who changed what and when for:

  * Applicability decisions
  * Role requirements (publish/revise)
  * Evidence acceptance/rejection
  * Assessments and authorisation changes

Acceptance criteria:

* Any status change for a competence item must be attributable to a user and timestamp.

---

## 7. Automation Rules (Baseline)

The app must support deterministic, auditable rules for:

1. **Evidence Expected (AUTO)** derived from training type + risk + category.
2. **Action Required (AUTO)** derived from status + risk + expiry window.
3. **Responsible (AUTO)** derived from status and requirement type (employee/manager/HR/assessor).

Baseline examples:

* Required → “Training/authorisation required before independent work”
* Expiring → “Renew/refresher required before expiry”
* Expired (gating) → “Suspend independent work until competence is revalidated”
* Completed/Valid → “No action required”
* N/A → “Managed via induction/awareness”

**Expiry window (confirmed):** A requirement enters **Expiring** when it is within **30 days** of its expiry date.

**Risk to workflow mapping (confirmed for demo):**

* **Low:** manager sign-off is sufficient.
* **Medium:** manager sign-off is sufficient by default; may be flagged as gating when marked Mandatory or where training type is Certification/Licence.
* **High/Critical:** assessor confirmation is required and the requirement is gating by default.

**Gating expiry effect (confirmed):** If any gating requirement becomes **Expired**, role-level Independent Work Authorisation becomes **Not Authorised** immediately.

(Exact wording aligned to spreadsheet lists where applicable.)

---

## 8. UX / Information Architecture

### 8.1 Key pages (demo)

1. Dashboard
2. Skills Matrix
3. Employee Profile
4. Role Applicability (Job Title)
5. Role Requirements (Job Title)
6. Competency Library
7. Training Needs
8. Awareness Topics
9. Admin: Reference Lists + Thresholds

### 8.2 Primary navigation (suggested)

* Dashboard
* Skills Matrix
* People
* Roles
* Training
* Awareness
* Reports
* Admin

---

## 9. System Requirements

### 9.1 Security (demo baseline)

* Authentication: SSO if available; otherwise email/password for demo.
* Authorisation: role-based permissions + manager scope.
* Files: secure upload with access controls.

### 9.2 Performance (demo baseline)

* Matrix page should render within acceptable demo time for typical team sizes.
* ERP calls may be aggregated server-side to reduce round trips.

### 9.3 Availability

* Demo environment only; production SLAs out of scope.

---

## 10. Decisions Locked for v1.0 (Demo)

* Expiring threshold: **30 days**.
* Evidence: supports **file uploads** and **external references** (third-party certifications).
* Independent Work Authorisation: **role-level**, computed from **gating requirements**.
* Risk mapping:

  * Low → manager sign-off
  * Medium → manager sign-off (may be gating if Mandatory or Certification/Licence)
  * High/Critical → assessor required; gating by default
* Gating expiry effect: Expired gating requirement → **Not Authorised** immediately.
* Awareness audience: **All staff who have a manager**, including contractors/interns if present.
* ERP access: dedicated read-only credential; no material rate-limit constraints for demo.
