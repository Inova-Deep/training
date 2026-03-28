# DML Training Demo — Implementation Plan

**Source of truth:** `docs/Dml-training-demo-screen-by-screen-punch-list.md`
**Current state:** `docs/frontend-extraction-report.md`
**Scope:** Frontend-only changes. All domain data stays as local JSON fixtures and in-memory stores. No backend work.

---

## Domain context

Deep Manufacturing focuses on **Additive Manufacturing (AM)**. The demo must lean visibly toward:

- Welding and fabrication-related competence
- Robot operation and robot programming awareness
- Additive manufacturing process capability
- Materials handling and materials traceability
- Materials testing and inspection
- Quality/compliance controls around technical production environments

This shapes every phase — categories, competencies, roles, demo data, and terminology.

---

## Phase index

| Phase | Name | Punch list sections | Priority | Depends on |
|-------|------|-------------------|----------|-----------|
| [0](phase-00-foundation.md) | Foundation | 1 (global additions, AM categories) | Prerequisite | — |
| [1](phase-01-terminology-and-data.md) | Terminology & demo data | 1 (terminology), 14 (demo data rewrite) | Very high | Phase 0 |
| [2](phase-02-supervised-work.md) | Supervised work & status model | 1 (high-priority #1, #2, #3) | Very high | Phase 1 |
| [3](phase-03-dashboard.md) | Dashboard rework | 2 (Dashboard) | Very high | Phase 2 |
| [4](phase-04-my-competencies.md) | My Competencies → readiness profile | 3 (My Competencies) | Very high | Phase 2 |
| [5](phase-05-training-needs.md) | Training Needs overhaul | 9 (Training Needs) | Very high | Phase 2 |
| [6](phase-06-skills-matrix.md) | Skills Matrix enhancements | 4 (Skills Matrix) | Very high | Phase 2 |
| [7](phase-07-awareness-topics.md) | Awareness Topics upgrade | 10 (Awareness Topics) | Very high | Phase 2 |
| [8](phase-08-roles-and-role-detail.md) | Roles & Role Detail enrichment | 6, 7 (Roles, Role Detail) | High | Phase 2 |
| [9](phase-09-people-and-library.md) | People & Competency Library | 5, 8 (People, Competency Library) | High | Phase 2 |
| [10](phase-10-rbac-and-polish.md) | RBAC, personas & polish | 11, 12, 13 (Ref Lists, ERP, RBAC) | High | All above |

---

## Dependency graph

```
Phase 0 (Foundation)
  └─► Phase 1 (Terminology & Data)
        └─► Phase 2 (Supervised Work)
              │
              ├─► Phase 3  (Dashboard)          ─┐
              ├─► Phase 4  (My Competencies)      │
              ├─► Phase 5  (Training Needs)       │  can run
              ├─► Phase 6  (Skills Matrix)        ├─ in parallel
              ├─► Phase 7  (Awareness Topics)     │
              ├─► Phase 8  (Roles & Role Detail)  │
              └─► Phase 9  (People & Library)    ─┘
                                                   │
                                                   └─► Phase 10 (RBAC & Polish)
```

Phases 0 → 1 → 2 are **sequential** (each depends on the previous).
Phases 3–9 can be **worked in any order or in parallel** after Phase 2.
Phase 10 comes last as it cross-cuts everything.

---

## Decisions to lock before starting

| # | Decision | Recommendation | Impact |
|---|----------|---------------|--------|
| D1 | Charting library for dashboard | Chart.js via `vue-chartjs` — small bundle, sufficient for bar/donut/line | Phase 3 blocked until decided |
| D2 | Persona count for demo | 5 total: Employee, Supervisor, Manager, QHSE, HR Admin | Phase 10 scope |
| D3 | Competency catalogue target size | ~25 items (keep 15 existing + add ~10 AM-specific) | Phase 0 scope |
| D4 | Category count | 8 AM-oriented categories per punch list section 1 | Phase 0 scope |
| D5 | File upload | Keep visual mock — demo story is workflow, not storage | Affects evidence UI |

---

## Phase file structure

Each phase file follows this template:

```
# Phase N — Name

## Goal
## Punch list alignment
## Prerequisites
## Tasks
  ### N.1 Task name
    Files:
    What to do:
    Details:
## Acceptance criteria
## Files modified
## Files created
## Demo story
```

---

## What to demo after each phase

| After | You can show |
|-------|-------------|
| Phase 0+1 | "The language is competence management, not LMS. The competencies are AM-specific — welding qualification, robot cell operation, materials testing, powder handling." |
| Phase 2 | "Supervised work status — not everyone is trained or untrained. There's a controlled supervised period before independent work authorisation." |
| Phase 3 | "Dashboard is a management control room — gaps, supervised personnel, NCR-linked actions, welding qualification expiries, robot cell authorisations pending." |
| Phase 4 | "Employee readiness profile — requirements, gaps, evidence, authorisations, awareness actions. Shows whether this welder can work independently." |
| Phase 5 | "Every training need traces to a source — this one from an NCR on a weld defect, this one from a new robot cell installation, this one from a materials testing method update." |
| Phase 6 | "Matrix has three views — what's required, what people hold, where the gaps are. Categories match AM operations." |
| Phase 7 | "Awareness isn't a news feed — it's controlled communication. Welding procedure revision, robot cell safety briefing, materials testing method update — all with workflow and verification." |
| Phase 8 | "For any role — Additive Manufacturing Technician, Welding Technician, Robotics Operator — I can see who's assigned, who's ready, who's supervised, and the biggest risks." |
| Phase 9 | "Click any person to see their full readiness profile. The competency library is a controlled catalogue with AM-specific types and categories." |
| Phase 10 | "Different personas see different things — the welder sees their profile, the supervisor sees their team's gaps, QHSE sees compliance and NCR-linked actions." |
