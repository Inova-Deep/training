# Phase 2 — Supervised Work & Status Model

## Goal

Introduce the "supervised work" concept — the missing middle state between "required" and "authorised" — and surface it consistently across the matrix, dashboard, My Competencies, and People views.

## Punch list alignment

- Section 1: High-priority #1 (Supervised Work status), #2 (Independent Work Authorisation), #3 (Evidence-backed assessment)
- Section 3: My Competencies — supervised work status, status model
- Section 4: Skills Matrix — supervised-only status distinct from fully competent

## Prerequisites

- Phase 0 complete (new status types in `types/index.ts`)
- Phase 1 complete (terminology and demo data in place)

## Tasks

### 2.1 Add supervised work to the matrix builder

**Files:** `src/stores/skillsMatrix.ts`

**What to do:** Change the deterministic seed logic to include `UNDER_SUPERVISION` as a possible status. Update authorisation logic.

**Details:**

Current seed distribution:
```
VALID: 55%, EXPIRED: 15%, IN_PROGRESS: 15%, REQUIRED: 15%
```

New distribution:
```
VALID:              45%
UNDER_SUPERVISION:  10%
EXPIRED:            12%
IN_PROGRESS:        13%
REQUIRED:           12%
(EXPIRING derived from VALID with expiry dates within 30 days)
```

`UNDER_SUPERVISION` semantics: training completed or assessment started, but the supervisor has not yet signed off for independent work. The employee can work, but only under direct supervision.

Update `isAuthorised` check:
- Current: `gatingFailed.length === 0`
- New: also fails if any gating item has `UNDER_SUPERVISION` status — supervised work does NOT equal authorised for independent work

Update `getResponsibleParty()`:
```
UNDER_SUPERVISION → 'Line Manager'
```

---

### 2.2 Add supervision status to EmployeeMatrixRow

**Files:** `src/stores/skillsMatrix.ts`

**What to do:** Add new fields to the `EmployeeMatrixRow` interface and compute them in `buildMatrixRow()`.

**Details:**

Add to interface:
```typescript
supervisedCount: number
supervisionStatus: 'FIT_FOR_INDEPENDENT_WORK' | 'SUPERVISED_ONLY' | 'RESTRICTED_SCOPE' | 'REASSESSMENT_REQUIRED' | 'NON_COMPLIANT_MANDATORY'
```

Computation logic (evaluated in priority order):
1. If any **mandatory** gating item is `EXPIRED` or `REQUIRED` → `NON_COMPLIANT_MANDATORY`
2. Else if any gating item is `EXPIRED` or `REQUIRED` (non-mandatory gating) → `REASSESSMENT_REQUIRED`
3. Else if any gating item is `UNDER_SUPERVISION` → `SUPERVISED_ONLY`
4. Else if any non-gating item is `UNDER_SUPERVISION` → `RESTRICTED_SCOPE`
5. Otherwise → `FIT_FOR_INDEPENDENT_WORK`

Display labels:
| Status | Label | Badge |
|--------|-------|-------|
| FIT_FOR_INDEPENDENT_WORK | Fit for Independent Work | badge-success |
| SUPERVISED_ONLY | Supervised Only | badge-supervised (amber) |
| RESTRICTED_SCOPE | Restricted Scope | badge-warning |
| REASSESSMENT_REQUIRED | Reassessment Required | badge-warning |
| NON_COMPLIANT_MANDATORY | Non-Compliant — Mandatory Item | badge-critical |

Add `supervisedCount` to the counting loop (same pattern as `validCount`, `expiredCount`, etc.).

Update `recomputeRowStats()` to include the new fields.

Update `summaryStats` computed to include:
```typescript
totalSupervised: number        // employees with supervisionStatus === 'SUPERVISED_ONLY'
totalRestricted: number        // employees with supervisionStatus === 'RESTRICTED_SCOPE'
totalReassessmentRequired: number  // employees with supervisionStatus === 'REASSESSMENT_REQUIRED'
totalNonCompliant: number      // employees with supervisionStatus === 'NON_COMPLIANT_MANDATORY'
```

---

### 2.3 Surface supervised work in My Competencies

**Files:** `src/views/MyCompetenciesView.vue`

**What to do:** Add "Supervised" count to the stats row. Expand the IWA badge to three states. Render UNDER_SUPERVISION rows with the amber StatusChip.

**Details:**

Stats row — add pill:
- Current: Valid | Expiring | Expired | Required
- New: Valid | **Supervised** | Expiring | Expired | Required

IWA badge now shows three states:
| Status | Label | Colour | Icon |
|--------|-------|--------|------|
| All gating valid | "Authorised for Independent Work" | Green | ShieldCheck |
| Any gating UNDER_SUPERVISION | "Under Supervision" | Amber | Eye |
| Any gating EXPIRED or REQUIRED | "Not Authorised" | Red | ShieldAlert |

In the requirements table, `UNDER_SUPERVISION` rows render with the amber StatusChip (from Phase 0.6).

---

### 2.4 Surface supervised work in Dashboard

**Files:** `src/views/DashboardView.vue`

**What to do:** Add a KPI card and a list section for supervised work.

**Details:**

Add KPI card:
- Title: "Personnel Under Supervision"
- Value: `matrixStore.summaryStats.totalSupervised`
- Icon: Eye
- Subtitle: "Awaiting independent work sign-off"

Add list section: "People Currently Under Supervised Work"
- Top 4 employees where `supervisionStatus === 'SUPERVISED'`
- Show: name, job title, number of supervised items, days in supervised status (mock)

---

### 2.5 Surface supervised work in Skills Matrix

**Files:** `src/views/SkillsMatrixView.vue`

**What to do:** Add supervised count to summary bar, add filter toggle, add column to summary table, render cells correctly.

**Details:**

Summary bar — add:
- "Under Supervision: N" (amber badge)

Filter bar — add:
- "Under Supervision Only" switch toggle

Employee Summary table — add column:
- "Supervised" between "Authorisation" and "Required"
- Shows supervisedCount for each employee

Grid view:
- `UNDER_SUPERVISION` cells render with the amber StatusChip (already handled by Phase 0.6)

---

### 2.6 Surface supervised work in People view

**Files:** `src/views/PeopleView.vue`

**What to do:** Add a "Work Status" column that shows the supervision status badge.

**Details:**

Add column after "Status" (Active/Inactive):
- Column header: "Work Status"
- Cell content: badge showing supervisionStatus
  - `INDEPENDENT` → badge-success "Independent"
  - `SUPERVISED` → badge-supervised "Supervised" (amber)
  - `RESTRICTED` → badge-critical "Restricted"

This requires cross-referencing each employee row against the skills matrix store to find their `EmployeeMatrixRow`. If no matrix row exists, show "—".

---

## Acceptance criteria

- [ ] Skills matrix store generates ~10% of competence items as UNDER_SUPERVISION
- [ ] `isAuthorised` correctly fails when any gating item is UNDER_SUPERVISION
- [ ] `supervisionStatus` computed correctly on every EmployeeMatrixRow
- [ ] My Competencies shows "Supervised" count and three-state IWA badge
- [ ] Dashboard shows "Personnel Under Supervision" KPI card and list section
- [ ] Skills Matrix summary bar shows supervised count
- [ ] Skills Matrix has "Under Supervision Only" filter toggle
- [ ] People view shows "Work Status" column
- [ ] The app builds and runs without errors

## Files modified

- `src/stores/skillsMatrix.ts`
- `src/views/MyCompetenciesView.vue`
- `src/views/DashboardView.vue`
- `src/views/SkillsMatrixView.vue`
- `src/views/PeopleView.vue`

## Files created

None.

## Demo story

"See the supervised work status? Not everyone is either fully trained or untrained. Karwan here has completed his welding qualification training but hasn't been signed off for independent work yet — he can work, but only under direct supervision. The dashboard shows exactly how many people are in this state. The matrix highlights it clearly in amber."
