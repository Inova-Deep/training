# Phase 5 — Training Needs Overhaul

## Goal

Make every training need traceable to a source, with a realistic workflow, AM-specific intervention types, and an effectiveness check concept.

## Punch list alignment

- Section 9: Training Needs — source types, fields, workflow stages, intervention types, DML story

## Prerequisites

- Phase 2 complete (supervised work available in stores)
- Phase 0 complete (TrainingNeedSource, TrainingNeedWorkflowStatus types, expanded templates)
- Phase 1 complete (rewritten training need templates with source tags)

## Tasks

### 5.1 Add source column and badge

**Files:** `src/views/TrainingNeedsView.vue`

**What to do:** Replace the current "Reason" column with a "Source" column showing source type badge and source reference.

**Details:**

Replace the current reason rendering with:
- Source type badge (colour-coded)
- Source reference as a secondary text link

Badge colours per source type:

| Source | Badge class | Colour |
|--------|-----------|--------|
| NCR_CAPA | badge-critical | Red |
| INCIDENT_NEAR_MISS | badge-critical | Red |
| AUDIT_FINDING | badge-warning | Orange |
| EXPIRY_RENEWAL | badge-warning | Yellow |
| PROCEDURE_CHANGE | badge-primary | Blue |
| NEW_EQUIPMENT | badge-primary | Blue |
| NEW_STARTER | badge-success | Green |
| MANAGER_REQUEST | badge-neutral | Grey |
| COMPETENCE_GAP | badge-neutral | Grey |

Source reference examples: "NCR-2026-047", "AF-2026-003", "IR-2026-012", "CTA-PRO-004 v2.0"

---

### 5.2 Fix filter wiring and add source filter

**Files:** `src/views/TrainingNeedsView.vue`, `src/stores/trainingNeeds.ts`

**What to do:** The existing Department, Priority, and Status filter UI is not wired to the store. Fix this bug first, then add a Source filter.

**Details — bug fix:**

Current state: The view has `<Select>` components for Department, Priority, and Status, but the store's `filteredNeeds` getter ignores them — it returns all needs regardless of selected values. The filter state refs in the view are not passed to or read by the store.

Fix: ensure the store exposes a `filters` reactive object with `department`, `priority`, `status`, and `sourceType` fields, and that `filteredNeeds` computed applies them all:

```
const filteredNeeds = computed(() => {
  return allNeeds.filter(n =>
    (!filters.department || n.department === filters.department) &&
    (!filters.priority || n.priority === filters.priority) &&
    (!filters.status || n.workflowStatus === filters.status) &&
    (!filters.sourceType || n.sourceType === filters.sourceType)
  )
})
```

Wire the view's filter `<Select>` values to mutate the store's `filters` object directly.

**Details — source filter options:**
- All Sources
- NCR / CAPA
- Audit Finding
- Expiry / Renewal
- Procedure Change
- New Equipment
- New Starter
- Incident / Near Miss
- Manager Request

---

### 5.3 Expand workflow stages

**Files:** `src/stores/trainingNeeds.ts`

**What to do:** Replace the current 4-stage status model with the 7-stage workflow.

**Details:**

Current: `OPEN → IN_PROGRESS → COMPLETED → CANCELLED`

New: `IDENTIFIED → APPROVED → SCHEDULED → IN_PROGRESS → EVIDENCE_SUBMITTED → EFFECTIVENESS_REVIEW → CLOSED`

Update the `status` field name to `workflowStatus` in generated training needs.

For demo data, distribute statuses across the stages:
- Most items: IDENTIFIED or APPROVED (to show a queue)
- A few: IN_PROGRESS or EVIDENCE_SUBMITTED (to show progress)
- One or two: EFFECTIVENESS_REVIEW (to show the full cycle)

Update the status column in the view to render the new stage names with appropriate badge colours:
| Stage | Badge |
|-------|-------|
| IDENTIFIED | badge-neutral |
| APPROVED | badge-primary |
| SCHEDULED | badge-primary |
| IN_PROGRESS | badge-primary |
| EVIDENCE_SUBMITTED | badge-warning |
| EFFECTIVENESS_REVIEW | badge-warning |
| CLOSED | badge-success |

---

### 5.4 Expand resolution paths / intervention types

**Files:** `src/components/training/TrainingNeedDetailsSheet.vue`

**What to do:** Replace the current 4 resolution paths with 7 intervention types.

**Details:**

| Path key | Label | Description | Icon |
|----------|-------|------------|------|
| COACHING_OJT | Coaching / OJT | Internal knowledge transfer with designated trainer | GraduationCap |
| TOOLBOX_TALK | Toolbox Talk | Team briefing on specific topic | Users |
| EXTERNAL_COURSE | External Course | Attend accredited training | ExternalLink |
| INTERNAL_BRIEFING | Internal Briefing | Classroom or one-to-one session | BookOpen |
| PROCEDURE_READ_ACK | Read & Acknowledge | Procedure document review and sign-off | FileText |
| SUPERVISOR_OBSERVATION | Supervisor Observation | Observed practical demonstration | Eye |
| CERTIFICATION_RENEWAL | Certification Renewal | External recertification | Award |

Update the RadioGroup grid to show 7 options (3+4 or 4+3 layout).

Update the dynamic form fields per path:
- COACHING_OJT: Trainer name, planned date
- TOOLBOX_TALK: Briefing lead, planned date, topic reference
- EXTERNAL_COURSE: Provider name, planned date
- INTERNAL_BRIEFING: Facilitator, planned date, location
- PROCEDURE_READ_ACK: Document reference (pre-filled from source if PROCEDURE_CHANGE)
- SUPERVISOR_OBSERVATION: Designated supervisor, planned date
- CERTIFICATION_RENEWAL: Provider, planned date, certification body

---

### 5.5 Add effectiveness check section

**Files:** `src/components/training/TrainingNeedDetailsSheet.vue`

**What to do:** Add an effectiveness check section after the resolution path fields, before the notes.

**Details:**

New fields:
- "Effectiveness Check Method" — select: Supervisor Observation, Test/Quiz, Portfolio Review, Manager Sign-off, 90-Day Review
- "Effectiveness Check Due" — date picker (default: 90 days from planned date)

These fields appear for all resolution paths except PROCEDURE_READ_ACK.

---

### 5.6 Show workflow stepper in detail sheet

**Files:** `src/components/training/TrainingNeedDetailsSheet.vue`

**What to do:** Add a horizontal workflow stepper at the top of the sheet showing the current stage.

**Details:**

Use the existing `Stepper` UI component.

Steps: Identified → Approved → Scheduled → In Progress → Evidence → Effectiveness → Closed

Highlight the current step. Steps before the current are marked complete.

---

### 5.7 Verify all 9 source types appear in demo data

**Files:** `src/data/trainingNeedTemplates.json` (cross-check with Phase 1 task 1.5)

**What to do:** Ensure the generated training needs include at least one item per source type so every source badge colour appears in the table during the demo.

**Details:**

Required coverage (9 source types):

| Source type | Expected in demo data |
|------------|----------------------|
| COMPETENCE_GAP | At least 1 item |
| NCR_CAPA | At least 2 items (to show risk management) |
| AUDIT_FINDING | At least 1 item |
| PROCEDURE_CHANGE | At least 1 item |
| NEW_EQUIPMENT | At least 1 item |
| NEW_STARTER | At least 1 item |
| EXPIRY_RENEWAL | At least 2 items (common in AM ops) |
| MANAGER_REQUEST | At least 1 item |
| INCIDENT_NEAR_MISS | At least 1 item |

Cross-reference against Phase 1 task 1.5 templates. If any source type has no template, add one.

---

### 5.8 Wire NCR/CAPA demo story

**Files:** `src/stores/trainingNeeds.ts`, `src/data/trainingNeedTemplates.json`

**What to do:** Ensure at least 2 training needs in the generated data demonstrate the NCR-to-closure flow.

**Details:**

Template for NCR flow:
1. Forklift near-miss (NCR-2026-047) → status: APPROVED → intervention: SUPERVISOR_OBSERVATION
2. Abrasive wheel breakage (IR-2026-012) → status: IN_PROGRESS → intervention: CERTIFICATION_RENEWAL

These should be among the first items generated so they appear prominently in the table.

---

## Acceptance criteria

- [ ] Source column shows colour-coded badges with source type and reference text
- [ ] All filter dropdowns (Department, Priority, Status, Source) actually filter the table — no display-only filters
- [ ] Source filter dropdown works and filters the table correctly
- [ ] All 9 source types are represented in the demo data (all badge colours visible)
- [ ] Workflow stages render with 7-stage badges instead of old 4-stage model
- [ ] Detail sheet shows 7 intervention types in the RadioGroup
- [ ] Each intervention type shows its own form fields
- [ ] Effectiveness check section appears with method select and due date
- [ ] Workflow stepper renders at the top of the detail sheet
- [ ] At least 2 NCR-linked training needs appear in the demo data
- [ ] The app builds and runs without errors

## Files modified

- `src/views/TrainingNeedsView.vue`
- `src/stores/trainingNeeds.ts`
- `src/components/training/TrainingNeedDetailsSheet.vue`

## Files created

None.

## Demo story

"Every training need traces back to a source. This one — welding retraining — was triggered by NCR-2026-047, a weld defect found in QA inspection. Root cause analysis identified a competence gap, so a supervisor observation was scheduled. Here's the flow: Identified → Approved → now In Progress. Once the observation is done, evidence gets submitted, then we do a 90-day effectiveness check before closing. This one here came from a new robot cell installation — the operator needs qualification before they can run it independently."
