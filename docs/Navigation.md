# Sidebar Navigation

This document reflects the live sidebar/navigation model.

## Source Of Truth

- Route access comes from `router.meta.allowedRoles`.
- Sidebar visibility is derived from route access.
- A page link must not appear in the sidebar if the current role cannot open it.
- The router guard remains a fallback for direct URL access.

## Canonical Group Order

1. `My Work`
2. `Operations`
3. `Training & Awareness`
4. `Admin`

Footer:

- `Guide`
- account / persona menu

## Canonical Item Order

### My Work

- `Dashboard`
- `My Competence Profile`

### Operations

- `Skills Matrix`
- `People`
- `Roles`
- `Competency Library`

### Training & Awareness

- `Training & Gap Actions`
- `Awareness & Communications`

### Admin

- `Reference Lists`
- `ERP Connection`

## Role Visibility

### Employee

- `Dashboard`
- `My Competence Profile`
- `Awareness & Communications`

### Supervisor

- `Dashboard`
- `My Competence Profile`
- `Skills Matrix`
- `Training & Gap Actions`
- `Awareness & Communications`

### Manager

- `Dashboard`
- `My Competence Profile`
- `Skills Matrix`
- `People`
- `Roles`
- `Training & Gap Actions`
- `Awareness & Communications`

### QHSE

- `Dashboard`
- `Skills Matrix`
- `Roles`
- `Competency Library`
- `Training & Gap Actions`
- `Awareness & Communications`

### HR Admin

- `Dashboard`
- `Skills Matrix`
- `People`
- `Roles`
- `Competency Library`
- `Training & Gap Actions`
- `Awareness & Communications`

### Leadership Viewer

- `Dashboard`
- `Skills Matrix`
- `Roles`

### Admin

- `Dashboard`
- `Skills Matrix`
- `People`
- `Roles`
- `Competency Library`
- `Training & Gap Actions`
- `Awareness & Communications`
- `Reference Lists`
- `ERP Connection`

## Notes

- `My Competence Profile` is intentionally hidden for `QHSE`, `HR Admin`, and `Leadership Viewer` under the current router policy.
- Admin links are intentionally hidden for every role except `ADMIN`.
- The demo persona for the `ADMIN` role is `System Admin`, shown last in the persona switcher.
- Empty sidebar groups must not render.
- Persona switching should always land on an accessible route, preferring the persona default route when allowed.
