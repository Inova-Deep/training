# Phase 7 — Awareness Topics Upgrade

## Goal

Transform Awareness Topics from a passive news feed into a controlled operational communication workflow with topic types, delivery methods, workflow stages, and AM-specific demo content.

## Punch list alignment

- Section 10: Awareness Topics — topic types, delivery methods, workflow, fields, demo data

## Prerequisites

- Phase 0 complete (AwarenessTopicType, AwarenessDeliveryMethod, AwarenessWorkflowStatus types)
- Phase 1 complete (rewritten awarenessTopics.json with AM-specific items)
- Phase 2 complete (supervised work status available)

## Tasks

### 7.1 Add topic type and delivery method fields

**Files:** `src/data/awarenessTopics.json`, `src/stores/awarenessTopics.ts` (or inline in view)

**What to do:** Expand each awareness topic record with new fields and update the data file.

**Details:**

New fields per topic:

| Field | Type | Example |
|-------|------|---------|
| topicType | string | PROCEDURE_REVISION, SAFETY_BRIEFING, QUALITY_ALERT, etc. |
| trigger | string | "CTA-PRO-004 revised to v2.0" |
| relatedDocument | string | "CTA-PRO-004" |
| effectiveDate | string (date) | "2026-03-15" |
| deliveryMethod | string | READ_AND_ACKNOWLEDGE, TEAM_BRIEFING, TOOLBOX_TALK, etc. |
| acknowledgementRequired | boolean | true |
| briefingRequired | boolean | false |
| verificationRequired | boolean | false |
| workflowStatus | string | DRAFTED, ISSUED, IN_COMMUNICATION, etc. |
| requiredAudience | string[] | ["Welding / Fabrication Technician", "All Employees"] |

Topic types (from punch list):
- PROCEDURE_REVISION
- SAFETY_BRIEFING
- QUALITY_ALERT
- CUSTOMER_REQUIREMENT
- MANAGEMENT_SYSTEM_UPDATE
- TOOLBOX_TALK
- NEW_EQUIPMENT_INTRODUCTION
- INCIDENT_LEARNING

Delivery methods:
- READ_AND_ACKNOWLEDGE
- TEAM_BRIEFING
- TOOLBOX_TALK
- SUPERVISOR_CASCADE
- FORMAL_RETRAINING

---

### 7.2 Add workflow stages

**Files:** `src/views/AwarenessTopicsView.vue`

**What to do:** Replace the current simple Active/Scheduled/Completed status with a 6-stage workflow.

**Details:**

Current: `Active | Scheduled | Completed`

New: `DRAFTED → ISSUED → IN_COMMUNICATION → AWAITING_ACKNOWLEDGEMENT → VERIFICATION_PENDING → CLOSED`

Badge colours per stage:

| Stage | Badge |
|-------|-------|
| DRAFTED | badge-neutral |
| ISSUED | badge-primary |
| IN_COMMUNICATION | badge-primary |
| AWAITING_ACKNOWLEDGEMENT | badge-warning |
| VERIFICATION_PENDING | badge-warning |
| CLOSED | badge-success |

Update admin table status column to render the new stages.

---

### 7.3 Enhance admin table columns

**Files:** `src/views/AwarenessTopicsView.vue`

**What to do:** Expand the admin table to show the new fields.

**Details:**

Current columns: Title, Type, Status, Audience, Scheduled Date, Actions

New columns:

| Column | Content |
|--------|---------|
| Title | Topic title |
| Topic Type | Type badge (colour-coded by type) |
| Trigger | Short trigger description |
| Delivery Method | Method badge |
| Effective Date | Date |
| Audience | Target audience tags |
| Workflow Status | Stage badge |
| Completion | Progress bar or "X/Y acknowledged" |
| Actions | View, Edit, Issue, Close |

Type badge colours:

| Type | Colour |
|------|--------|
| PROCEDURE_REVISION | Blue |
| SAFETY_BRIEFING | Red |
| QUALITY_ALERT | Orange |
| CUSTOMER_REQUIREMENT | Purple |
| MANAGEMENT_SYSTEM_UPDATE | Grey |
| TOOLBOX_TALK | Green |
| NEW_EQUIPMENT_INTRODUCTION | Blue |
| INCIDENT_LEARNING | Red |

---

### 7.4 Add filters for admin view

**Files:** `src/views/AwarenessTopicsView.vue`

**What to do:** Add filter dropdowns above the admin table.

**Details:**

Filters:
- Topic Type (All / Procedure Revision / Safety Briefing / Quality Alert / etc.)
- Workflow Status (All / Drafted / Issued / In Communication / Awaiting Acknowledgement / Verification Pending / Closed)
- Delivery Method (All / Read & Acknowledge / Team Briefing / Toolbox Talk / etc.)

---

### 7.5 Enhance employee view

**Files:** `src/views/AwarenessTopicsView.vue`

**What to do:** Improve the employee-facing view with topic type badges, delivery method info, and related document references.

**Details:**

For each assigned topic (cards or table rows), show:
- Topic title
- Topic type badge
- Related document reference (e.g. "CTA-PRO-004 v2.0")
- Delivery method label
- Effective date
- Acknowledgement status (Pending / Acknowledged)
- Action: Acknowledge button (existing) + "View Document" link (mock)

Add a summary banner at the top:
- "You have N topics pending acknowledgement, M requiring briefing attendance"

---

### 7.6 Add topic creation/edit form

**Files:** New `src/components/awareness/AwarenessTopicFormSheet.vue`

**What to do:** Create a sheet form for creating/editing awareness topics (admin view).

**Details:**

Form fields:
- Title (text input)
- Topic type (select from 8 types)
- Trigger description (text input)
- Related document / revision (text input)
- Effective date (date picker)
- Delivery method (select from 5 methods)
- Required audience (multi-select: job titles + "All Employees")
- Acknowledgement required (switch, default true)
- Briefing required (switch)
- Verification required (switch)

On save: add to local topics array and show toast "Awareness topic created".

Wire the "Create Awareness Topic" button in admin view to open this sheet.

---

### 7.7 Update demo data

**Files:** `src/data/awarenessTopics.json`

**What to do:** Replace generic awareness topics with AM-specific items using the new field structure.

**Details:**

Target ~7 topics:

| Title | Type | Delivery | Status | Audience |
|-------|------|----------|--------|----------|
| Revised Competence, Training & Awareness Procedure | PROCEDURE_REVISION | READ_AND_ACKNOWLEDGE | AWAITING_ACKNOWLEDGEMENT | All Employees |
| Welding Procedure Revision Briefing | PROCEDURE_REVISION | TEAM_BRIEFING | IN_COMMUNICATION | Welding / Fabrication Technician |
| Robot Cell Safety and Operation Briefing | SAFETY_BRIEFING | TOOLBOX_TALK | ISSUED | Robotics Operator, AM Technician |
| Materials Testing Method Update | MANAGEMENT_SYSTEM_UPDATE | READ_AND_ACKNOWLEDGE | AWAITING_ACKNOWLEDGEMENT | Materials Testing Technician, QA Inspector |
| Updated NCR Escalation Process | QUALITY_ALERT | SUPERVISOR_CASCADE | VERIFICATION_PENDING | All Employees |
| New Machine / Cell Start-up Safety Communication | NEW_EQUIPMENT_INTRODUCTION | FORMAL_RETRAINING | IN_COMMUNICATION | AM Technician, Robotics Operator |
| Customer Quality Requirement Alert — Weld Spec | CUSTOMER_REQUIREMENT | TEAM_BRIEFING | DRAFTED | Welding / Fabrication Technician, QA Inspector |

---

## Acceptance criteria

- [ ] Each topic has topicType, deliveryMethod, workflowStatus, and other new fields
- [ ] Admin table shows expanded columns with type and delivery method badges
- [ ] 6-stage workflow renders with coloured badges
- [ ] Filters for type, status, and delivery method work correctly
- [ ] Employee view shows type badge, document reference, and delivery method
- [ ] Topic creation form opens and saves with all new fields
- [ ] Demo data contains 7 AM-specific awareness topics
- [ ] The app builds and runs without errors

## Files modified

- `src/views/AwarenessTopicsView.vue`
- `src/data/awarenessTopics.json`

## Files created

- `src/components/awareness/AwarenessTopicFormSheet.vue`

## Demo story

"Awareness isn't a news feed — it's controlled communication. This one is a welding procedure revision: issued to all welding technicians, delivered via team briefing, with mandatory acknowledgement. The workflow tracks it from draft to closure. This robot cell safety briefing is being delivered as a toolbox talk — the supervisor leads it, and each attendee signs off. The materials testing method update requires read-and-acknowledge — every materials testing technician must confirm they've reviewed the new method before using it."
