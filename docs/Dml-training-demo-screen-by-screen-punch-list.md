# Deep Manufacturing Training Demo

## Screen-by-Screen Implementation Punch List

This punch list is designed to make the current frontend demo feel clearly aligned to Deep Manufacturing’s actual operating model: competence management first, training as one intervention, awareness as controlled communication, and evidence-based readiness for work.

It is intentionally practical and implementation-oriented. The focus is demo credibility, domain fit, and UX clarity rather than backend redesign.

---

## 1. Overall direction

### Core positioning to reinforce everywhere

The product should present itself as a **Competence, Training & Awareness** system, not just a training app.

Because Deep Manufacturing is focused on **Additive Manufacturing**, the demo should lean visibly toward:

* welding and fabrication-related competence
* robot operation and robot programming awareness
* additive manufacturing process capability
* materials handling and materials traceability
* materials testing and inspection
* quality/compliance controls around technical production environments

The system story should be:

* Define required competence by role
* Assess current competence by person
* Detect gaps
* Assign the right intervention
* Control supervised work until competence is proven
* Communicate significant process/procedure changes
* Track evidence and verify effectiveness

### Global terminology changes

Prefer these terms across the UI:

* Competence / Competency Profile
* Required Level
* Current Assessed Level
* Gap Status
* Supervised Work
* Independent Work Authorisation
* Evidence
* Reassessment
* Awareness Communication
* Effectiveness Check
* Additive Manufacturing Process
* Welding Qualification
* Robot Operation / Robot Programming
* Materials Testing

Reduce or avoid overusing:

* Learning
* Course completion
* Student-style training language
* Generic LMS labels
* overly broad generic manufacturing terms when a more AM-specific label is possible

### High-priority global additions

Implement these concepts consistently across multiple screens:

1. **Supervised Work** status
2. **Independent Work Authorisation**
3. **Evidence-backed assessment**
4. **Training need source/trigger**
5. **Awareness acknowledgement / briefing completion**
6. **NCR/CAPA-linked actions**
7. **Expiry / reassessment triggers**
8. **AM-specific technical capability categories**

### AM-specific categories to reflect in labels, data, and examples

* Additive Manufacturing Operations
* Welding & Fabrication
* Robotics & Automation
* Materials & Powder Handling
* Materials Testing & Inspection
* Quality & Compliance
* HSE / Workshop Safety
* Equipment-Specific Qualification

---

## 2. Dashboard

### Goal

Make the dashboard a management control room for operational readiness and compliance risk.

### What to change

Replace generic training-centric widgets with readiness and risk widgets.

### Recommended top widgets

* Open Competence Gaps
* Personnel Under Supervision
* Not Yet Authorised for Independent Work
* Mandatory Certifications Expiring in 30/60 Days
* NCR/CAPA-linked Training Actions Open
* Procedure Changes Awaiting Awareness Sign-off
* Critical Roles at Risk
* Overdue Reassessments

### Recommended charts

* Gap count by department/function
* Gap count by category (Safety, Quality, Technical, Mandatory, Equipment)
* Expiring certifications trend
* Training need source breakdown (Gap / NCR / Audit / Change / Expiry)
* Team readiness by role

### Recommended table/card sections

* Highest-risk open gaps
* People currently restricted to supervised work
* New procedure revisions not yet acknowledged
* Overdue competence reviews

### UI/UX changes

* Use manufacturing/QHSE language in card titles
* Add department filters and role filters
* Allow click-through from widgets to exact operational pages
* Add risk badges such as Critical / High / Moderate

### Demo data changes

Use realistic DML examples such as:

* Welding qualification reassessment due
* Robot cell operation authorisation pending
* Materials testing competence gap open
* Powder/material handling awareness overdue
* Abrasive Tools training overdue
* NCR Root Cause Analysis competence gap
* Additive manufacturing process control briefing pending acknowledgement
* Equipment-specific qualification expiring for a production asset

### Priority

Very high

---

## 3. My Competencies

### Goal

Turn this into an employee readiness profile, not a learning transcript.

### What to show prominently

* Person’s role and department
* Independent Work Authorisation status
* Supervised Work status
* Required competencies for current role
* Current assessed level
* Gap status
* Certificates / licences with expiry
* Awareness topics pending acknowledgement
* Last assessment date
* Next reassessment due date

### Add sections

1. **My Role Requirements**
2. **My Current Assessments**
3. **My Open Gaps**
4. **My Evidence**
5. **My Authorisations**
6. **My Awareness Actions**

### Recommended actions

* View evidence
* Upload supporting evidence
* View assessment history
* Request reassessment
* Acknowledge awareness topic

### Status model to add

For each competency line item:

* Required
* Under Supervision
* Partially Met
* Authorised
* Reassessment Due
* Expired / Lapsed

### Demo-specific improvements

* Show realistic evidence types: observation, OJT sign-off, welding qualification record, materials test report review, robot operation sign-off, toolbox talk attendance, manager verification
* Add line-manager/supervisor sign-off visuals
* Show whether the worker can perform the task independently
* Surface AM-relevant authorisations such as welding, robot cell use, materials handling, and inspection/test activities

### Priority

Very high

---

## 4. Skills Matrix

### Goal

Make this page the digital expression of the DML spreadsheet model.

### Core model to make explicit

The page should clearly support three modes:

1. Role Requirement View
2. Current Assessment View
3. Gap Analysis View

### What to change

* Add a mode toggle for Required / Current / Gap
* Preserve category grouping similar to the workbook
* Distinguish between skill items and training/certification items
* Show a clear legend for score/status semantics

### Recommended categories

* Mandatory
* Additive Manufacturing Operations
* Welding & Fabrication
* Robotics & Automation
* Materials & Powder Handling
* Materials Testing & Inspection
* Quality
* Health & Safety
* Regulatory Compliance
* Workshop
* Plant & Machinery
* Business / Systems

### Recommended filters

* Department
* Role
* Person
* Competency Category
* Gap only
* Expiring only
* Under Supervision only
* Critical activities only

### Visual rules

* Use clear gap highlighting
* Show not applicable separately from missing
* Indicate expired/lapsed items distinctly
* Surface supervised-only status as different from fully competent

### Add capability

* Drill into a cell to see evidence, last assessment, assessor, next review, and source of requirement
* Show team readiness summary above the matrix
* Show vacancy rows where role requirements exist but no person is assigned

### Demo data changes

Use DML-style items like:

* Welding qualification
* Weld inspection awareness
* Robot cell operation
* Robot programming / teach pendant basics
* Additive manufacturing process setup
* Powder / material handling controls
* Materials traceability
* Tensile / hardness / dimensional inspection awareness
* Root Cause Analysis
* CAPA
* LOTO
* PTW
* WAH
* CSE
* Abrasive Tools
* Procedure awareness for QMS/QHSE controls

### Priority

Very high

---

## 5. People

### Goal

Make the People area operationally useful for managers, HR, and QHSE.

### Add/strengthen columns

* Department
* Role
* Line Manager
* Independent Work Status
* Supervised Work Status
* Open Gap Count
* Mandatory Compliance Status
* Expiring Certificates Count
* Overdue Reassessments

### Person detail / drawer should show

* Role requirements vs current assessments
* Open gaps with severity
* Evidence and attachments
* Assessment history
* Awareness acknowledgements
* Training actions in progress
* NCR/CAPA-linked actions
* Restrictions / limitations

### New status ideas

* Fit for Independent Work
* Supervised Only
* Restricted Scope
* Reassessment Required
* Non-Compliant Mandatory Item

### Recommended actions

* Start reassessment
* Assign intervention
* Record evidence
* Change supervision status
* View linked training needs
* View linked awareness topics

### Demo polish

* Use realistic names, departments, and job titles
* Include additive manufacturing, welding/fabrication, robotics, QA, HSE, operations, and maintenance-style profiles
* Add one or two “high-risk” personnel examples for storytelling
* Include at least one specialist profile in materials testing / inspection

### Priority

High

---

## 6. Roles

### Goal

Make Roles feel like controlled competence profiles, not HR-only job definitions.

### What list view should show

* Role name
* Department/function
* Number of assigned people
* Number fully compliant
* Number with gaps
* Number under supervision
* Number with expiring mandatory items
* Risk indicator

### Recommended filters

* Department
* Critical roles only
* Roles with open gaps
* Roles with expiring mandatory items

### Recommended actions

* View role readiness
* Edit role requirements
* Assign awareness topics
* Assign mandatory items

### Priority

High

---

## 7. Role Detail

### Goal

This should become one of the hero screens in the demo.

### What the screen should communicate

For any given role, this page should answer:

* What competencies are required?
* What level is required?
* Which items are mandatory?
* Which assigned personnel meet the requirement?
* Who is under supervision?
* Where are the biggest risks?

### Sections to include

1. **Role Summary**

   * Department
   * Role purpose
   * Criticality
   * Number assigned
   * Number fully ready
   * Number under supervision

2. **Required Competencies**

   * Item
   * Type
   * Category
   * Required level/status
   * Mandatory flag
   * Reassessment interval

3. **Assigned People Against This Role**

   * Person
   * Current status
   * Gap count
   * Supervised status
   * Expiry issues

4. **Role Risk Summary**

   * Highest-risk missing requirements
   * Common gaps across assigned team

5. **Linked Awareness & Mandatory Communications**

### Strong demo enhancement

Add a role readiness score or readiness summary, but ensure the detail behind it is visible and believable.

Example AM-oriented roles to showcase strongly:

* Additive Manufacturing Technician
* Welding / Fabrication Technician
* Robotics Operator
* Materials Testing Technician
* QA Inspector

### Priority

Very high

---

## 8. Competency Library

### Goal

Treat this as a controlled library of competence items, not a simple training catalogue.

### Add/strengthen fields

* Title
* Type
* Category
* Description
* Applicable departments
* Applicable roles
* Mandatory / optional
* Safety-critical / quality-critical
* Assessment method
* Evidence type
* Validity / refresh interval
* Internal / external
* Provider / owner
* Linked document / procedure

### Competency types to support

* Skill
* Training
* Certification
* Awareness Topic
* OJT / Coaching
* Procedure Briefing
* External Qualification
* Equipment / Vendor Qualification

### Recommended filters

* Type
* Category
* Mandatory only
* Critical only
* Expiring items
* Department applicability

### Demo data recommendations

Populate with clearly AM-oriented examples, not generic corporate learning items.
Prefer welding, robots, materials handling, testing, inspection, and equipment-specific qualification examples wherever possible.

### Priority

High

---

## 9. Training Needs

### Goal

Turn this from a template-driven list into a realistic trigger-driven action workflow.

### Most important change

Every training need should show its **source**.

### Add source types

* Competence Gap
* NCR / CAPA
* Audit Finding
* Procedure Change
* New Equipment / Process Change
* New Starter / Role Change
* Expiry / Renewal
* Manager Request
* Incident / Near Miss

### Add fields

* Need title
* Linked person / role / department
* Source type
* Source reference
* Required intervention
* Owner
* Due date
* Priority
* Evidence required
* Effectiveness check method
* Closure status

### Workflow stages

* Identified
* Approved
* Scheduled
* In Progress
* Evidence Submitted
* Effectiveness Review
* Closed

### Recommended intervention types

* Coaching / OJT
* Toolbox Talk
* External Course
* Internal Briefing
* Procedure Read-and-Acknowledge
* Supervisor Observation
* Certification / Renewal

### Strong DML story to add

Support an example flow like:
NCR raised -> root cause indicates skill/awareness gap -> training/coaching assigned -> evidence recorded -> effectiveness check passed -> action closed.

### Priority

Very high

---

## 10. Awareness Topics

### Goal

Make Awareness Topics feel like controlled operational communication, especially for procedure and safety changes.

### Shift the concept

This page should not feel like a passive news feed.
It should feel like a structured awareness / communication control workflow.

### Add fields

* Topic title
* Topic type
* Trigger
* Related document / revision
* Effective date
* Required audience
* Delivery method
* Acknowledgement required?
* Briefing required?
* Verification required?
* Completion status

### Topic types to support

* Procedure Revision
* Safety Briefing
* Quality Alert
* Customer Requirement Communication
* Management System Update
* Toolbox Talk
* New Equipment Introduction
* Incident Learning

### Delivery methods

* Read and Acknowledge
* Team Briefing
* Toolbox Talk
* Supervisor Cascade
* Formal Retraining

### Recommended workflow

* Drafted
* Issued
* In Communication
* Awaiting Acknowledgement
* Verification Pending
* Closed

### Demo data examples

* Revised Competence, Training & Awareness Procedure
* Welding Procedure Revision Briefing
* Robot Cell Safety and Operation Briefing
* Materials Testing Method Update Communication
* Updated NCR Escalation Process
* New Machine / Cell Start-up Safety Communication
* Customer Quality Requirement Alert

### Priority

Very high

---

## 11. Reference Lists

### Goal

Make the reference data feel industrial, controlled, and internally consistent.

### Ensure reference lists include

* Departments / Functions
* Competency Categories
* Competency Types
* Evidence Types
* Assessment Statuses
* Supervision Statuses
* Gap Severity Levels
* Awareness Delivery Methods
* Training Delivery Methods
* Reassessment Triggers
* Certificate / Licence Types
* Training Need Sources
* Risk Levels

### Why this matters

These lists shape the tone and realism of the entire demo.

### Priority

Medium

---

## 12. ERP Connection

### Goal

Keep this page practical and supportive, not overplayed.

### Best demo story

The integration should support realistic admin/business needs such as:

* Employee master sync
* Department / role sync
* Reporting line sync
* Cost centre / function mapping
* Reference data alignment

### Avoid

* Making ERP integration the hero story of the demo
* Overpromising deep process integration if it is not implemented

### Priority

Low to medium

---

## 13. RBAC and persona refinement

### Goal

Make role-based behavior feel intentional and believable.

### Recommended personas

* Employee / Worker
* Supervisor / Line Manager
* Department Manager
* HR / Training Coordinator
* QHSE / Quality Manager
* Admin
* Leadership Viewer

### What to improve

* Tighten direct route access, not just menu visibility
* Tailor dashboards and default landing states by persona
* Limit edit actions based on role
* Show role-relevant CTAs only

### Example persona emphasis

**Employee**

* My Competencies
* My Awareness Actions
* My Certificates

**Supervisor / Manager**

* Team gaps
* Supervised work status
* Team reassessment queue
* Outstanding awareness actions

**QHSE**

* Mandatory compliance
* Procedure change awareness
* NCR-linked actions
* High-risk gaps

**HR / Training Coordinator**

* Records
* Scheduling
* Expiry tracking
* Evidence completeness

### Priority

High

---

## 14. Demo data rewrite recommendations

### Goal

Make the demo unmistakably Deep Manufacturing.

### Replace generic content with

* Additive manufacturing roles
* Welding / fabrication / robotics / QA / materials testing / HSE departments
* Equipment-specific competencies
* Safety-critical certifications
* Quality-system and CAPA-related topics
* Procedure revision awareness items
* Manufacturing-style providers and evidence types
* AM process, robot, and test-method-specific examples

### Sample role ideas

* Additive Manufacturing Technician
* Welding / Fabrication Technician
* Robotics Operator
* Robot Programmer / Cell Technician
* Materials Testing Technician
* QA Inspector
* QHSE Coordinator
* Production Supervisor
* Maintenance Technician
* Operations Manager
* Technical Director

### Sample competency ideas

* LOTO
* PTW
* WAH
* CSE
* Abrasive Tools
* Root Cause Analysis
* CAPA
* Internal Audit
* Welding qualification
* Weld procedure awareness
* Robot cell operation
* Robot programming basics
* Additive manufacturing machine setup
* Materials / powder handling controls
* Materials traceability
* Materials testing method awareness
* Machine-specific operation
* Procedure awareness topics

### Priority

Very high

---

## 15. High-impact implementation sequence

### Phase 1: Demo credibility fixes

1. Rewrite terminology across screens
2. Replace generic sample data
3. Add supervised work and independent-work status
4. Rework dashboard widgets
5. Add source tags in Training Needs

### Phase 2: Domain-strengthening changes

6. Improve Role Detail into a readiness screen
7. Add evidence sections and assessment detail surfaces
8. Upgrade Awareness Topics into controlled communication workflow
9. Improve matrix drill-down and status legend

### Phase 3: Trust and polish

10. Tighten RBAC enforcement
11. Add NCR/CAPA-linked workflow cues
12. Improve empty states, badges, and action labels
13. Standardize status colors and icons

---

## 16. What matters most for the live demo

If time is limited, make sure the live demo can clearly show these five stories:

1. **Role-based competence requirements**
   A role has defined requirements, not just assigned courses.

2. **Person-level assessment and gap visibility**
   A person can be assessed against role expectations, with visible gaps.

3. **Supervised work until competence is proven**
   Not everyone is either fully trained or untrained; supervised-only status exists.

4. **Awareness for procedure and operational change**
   Procedure revision and briefing communication are controlled and traceable.

5. **Training/action closure with evidence**
   Actions are assigned for a reason, evidence is collected, and effectiveness is checked.

If those five stories land clearly, the demo will feel much more like Deep Manufacturing and much less like a generic training product.
