# AM Role Catalog Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Recenter the demo on additive manufacturing operations by making the Roles experience, supporting fixtures, and matching logic use a canonical AM-first role catalog without breaking existing page links, matrix matching, or legacy JSON references.

**Architecture:** Introduce a single local role-catalog module that defines the visible demo roles, their departments, criticality, descriptions, and compatibility aliases. Refactor views and stores to resolve roles through that module instead of using raw ERP job titles or substring matching, then align fixture data around the canonical names while keeping alias fallbacks for legacy names such as `Shift Lead` and `HSE Coordinator`.

**Tech Stack:** Vue 3, TypeScript, Pinia, Vite, JSON fixtures, `vue-tsc`, Vitest for pure TypeScript regression tests.

---

## Context And Guardrails

Use `@project-context` before implementation. Use `@verification-before-completion` before claiming the change is done.

This change must stay within these rules:

1. Do not change the route path shape for Roles. Keep `/roles/:id`.
2. Do not delete legacy requirement-set keys on the first pass. Resolve them through aliases first.
3. Do not rely on raw ERP job titles as the visible demo catalog source after the refactor.
4. Do not use substring matching for role identity once the catalog resolver exists.
5. Do not remove support-function data until compatibility tests prove no page still depends on it.

## Canonical Visible Demo Roles

The visible AM-first demo catalog should be:

1. `Additive Manufacturing Technician`
2. `Welding / Fabrication Technician`
3. `Robotics Operator`
4. `Materials Testing Technician`
5. `QA Inspector`
6. `Production Supervisor`
7. `QHSE Coordinator`

Support-function policy:

1. `QHSE Coordinator` is the only clearly visible secondary support role.
2. `Maintenance Technician` may remain in legacy fixtures for compatibility, but should not appear in the primary Roles demo list unless explicitly re-approved.
3. `Maintenance Supervisor`, `Electrical Technician`, and `Instrumentation Technician` must not appear in the visible demo role catalog.

## Compatibility Aliases

The first safe rollout keeps these aliases:

1. `Production Supervisor` -> `Shift Lead`
2. `QHSE Coordinator` -> `HSE Coordinator`

Use aliases for:

1. requirement-set lookup
2. applicability lookup
3. awareness-audience lookup
4. legacy route fallback
5. employee/matrix role matching

## Files To Review Before Starting

1. `docs/Dml-training-demo-screen-by-screen-punch-list.md`
2. `docs/plans/phase-01-terminology-and-data.md`
3. `docs/plans/phase-08-roles-and-role-detail.md`
4. `src/views/RolesView.vue`
5. `src/views/RoleDetailView.vue`
6. `src/stores/roles.ts`
7. `src/stores/skillsMatrix.ts`
8. `src/stores/employees.ts`
9. `src/stores/auth.ts`
10. `src/data/roleRequirements.json`
11. `src/data/roleApplicability.json`
12. `src/data/awarenessTopics.json`

### Task 1: Bootstrap Regression Tests For Role-Catalog Work

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/roles/catalog.test.ts`
- Modify: `package.json`

**Step 1: Write the failing test**

Create `src/lib/roles/catalog.test.ts` with a first failing suite that describes the intended AM-first catalog surface:

```ts
import { describe, expect, it } from 'vitest'
import {
  getVisibleDemoRoles,
  resolveCanonicalRoleName,
  isVisibleDemoRole,
} from './catalog'

describe('role catalog', () => {
  it('returns the AM-first visible role list in demo order', () => {
    expect(getVisibleDemoRoles().map((role) => role.name)).toEqual([
      'Additive Manufacturing Technician',
      'Welding / Fabrication Technician',
      'Robotics Operator',
      'Materials Testing Technician',
      'QA Inspector',
      'Production Supervisor',
      'QHSE Coordinator',
    ])
  })

  it('resolves legacy aliases to canonical names', () => {
    expect(resolveCanonicalRoleName('Shift Lead')).toBe('Production Supervisor')
    expect(resolveCanonicalRoleName('HSE Coordinator')).toBe('QHSE Coordinator')
  })

  it('excludes legacy support-heavy roles from the visible demo set', () => {
    expect(isVisibleDemoRole('Electrical Technician')).toBe(false)
    expect(isVisibleDemoRole('Instrumentation Technician')).toBe(false)
    expect(isVisibleDemoRole('Maintenance Supervisor')).toBe(false)
  })
})
```

**Step 2: Run test to verify it fails**

Run:

```bash
npx vitest run src/lib/roles/catalog.test.ts
```

Expected: FAIL because `vitest` and `src/lib/roles/catalog.ts` do not exist yet.

**Step 3: Add the minimal test runner setup**

Modify `package.json` to add:

```json
{
  "scripts": {
    "test:unit": "vitest run"
  },
  "devDependencies": {
    "vitest": "^3.2.0"
  }
}
```

Create `vitest.config.ts`:

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
```

**Step 4: Install the dependency**

Run:

```bash
npm install
```

Expected: PASS with `vitest` added to `node_modules` and lockfile updated.

**Step 5: Run the test again to verify it still fails for the right reason**

Run:

```bash
npm run test:unit -- src/lib/roles/catalog.test.ts
```

Expected: FAIL with a module-not-found error for `./catalog`.

**Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/roles/catalog.test.ts
git commit -m "test: bootstrap role catalog regression tests"
```

### Task 2: Create The Canonical AM Role Catalog Module

**Files:**
- Create: `src/lib/roles/catalog.ts`
- Modify: `src/lib/roles/catalog.test.ts`

**Step 1: Extend the failing test**

Add assertions for catalog metadata:

```ts
import { getRoleByAnyName, getDepartmentForRole, getRequirementKeyForRole } from './catalog'

it('stores department and requirement-key metadata per role', () => {
  expect(getDepartmentForRole('Robotics Operator')).toBe('Robotics')
  expect(getRequirementKeyForRole('Production Supervisor')).toBe('Shift Lead')
  expect(getRequirementKeyForRole('Shift Lead')).toBe('Shift Lead')
})

it('can resolve a role by canonical name or alias', () => {
  expect(getRoleByAnyName('Production Supervisor')?.id).toBe('production-supervisor')
  expect(getRoleByAnyName('Shift Lead')?.id).toBe('production-supervisor')
  expect(getRoleByAnyName('QHSE Coordinator')?.id).toBe('qhse-coordinator')
})
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm run test:unit -- src/lib/roles/catalog.test.ts
```

Expected: FAIL because the new exports do not exist.

**Step 3: Write minimal implementation**

Create `src/lib/roles/catalog.ts`:

```ts
export interface DemoRoleCatalogEntry {
  id: string
  name: string
  department: string
  purpose: string
  criticality: 'Critical' | 'High' | 'Standard'
  requirementKey: string
  applicabilityKey: string
  matchNames: string[]
  visibleInDemo: boolean
}

export const DEMO_ROLE_CATALOG: DemoRoleCatalogEntry[] = [
  {
    id: 'am-technician',
    name: 'Additive Manufacturing Technician',
    department: 'Additive Manufacturing',
    purpose: 'Operates additive manufacturing equipment, controls setup, and handles powder safely.',
    criticality: 'High',
    requirementKey: 'Additive Manufacturing Technician',
    applicabilityKey: 'Additive Manufacturing Technician',
    matchNames: ['Additive Manufacturing Technician'],
    visibleInDemo: true,
  },
  {
    id: 'welding-fabrication-technician',
    name: 'Welding / Fabrication Technician',
    department: 'Welding & Fabrication',
    purpose: 'Performs coded welding and fabrication work to approved procedures.',
    criticality: 'Critical',
    requirementKey: 'Welding / Fabrication Technician',
    applicabilityKey: 'Welding / Fabrication Technician',
    matchNames: ['Welding / Fabrication Technician'],
    visibleInDemo: true,
  },
  {
    id: 'robotics-operator',
    name: 'Robotics Operator',
    department: 'Robotics',
    purpose: 'Operates robotic cells and maintains safe automated-workcell practice.',
    criticality: 'High',
    requirementKey: 'Robotics Operator',
    applicabilityKey: 'Robotics Operator',
    matchNames: ['Robotics Operator'],
    visibleInDemo: true,
  },
  {
    id: 'materials-testing-technician',
    name: 'Materials Testing Technician',
    department: 'Materials Testing',
    purpose: 'Performs tensile, hardness, and dimensional inspection activities.',
    criticality: 'High',
    requirementKey: 'Materials Testing Technician',
    applicabilityKey: 'Materials Testing Technician',
    matchNames: ['Materials Testing Technician'],
    visibleInDemo: true,
  },
  {
    id: 'qa-inspector',
    name: 'QA Inspector',
    department: 'Quality Assurance',
    purpose: 'Controls inspection, NCR initiation, and conformity evidence.',
    criticality: 'High',
    requirementKey: 'QA Inspector',
    applicabilityKey: 'QA Inspector',
    matchNames: ['QA Inspector'],
    visibleInDemo: true,
  },
  {
    id: 'production-supervisor',
    name: 'Production Supervisor',
    department: 'Operations',
    purpose: 'Leads production execution, safe shift start, and escalation of quality issues.',
    criticality: 'High',
    requirementKey: 'Shift Lead',
    applicabilityKey: 'Production Supervisor',
    matchNames: ['Production Supervisor', 'Shift Lead'],
    visibleInDemo: true,
  },
  {
    id: 'qhse-coordinator',
    name: 'QHSE Coordinator',
    department: 'HSE',
    purpose: 'Owns site quality, health, safety, and environmental control activities.',
    criticality: 'High',
    requirementKey: 'QHSE Coordinator',
    applicabilityKey: 'QHSE Coordinator',
    matchNames: ['QHSE Coordinator', 'HSE Coordinator'],
    visibleInDemo: true,
  },
  {
    id: 'maintenance-technician',
    name: 'Maintenance Technician',
    department: 'Maintenance',
    purpose: 'Legacy support role retained only for compatibility.',
    criticality: 'Critical',
    requirementKey: 'Maintenance Technician',
    applicabilityKey: 'Maintenance Technician',
    matchNames: ['Maintenance Technician'],
    visibleInDemo: false,
  },
]

export function getVisibleDemoRoles() {
  return DEMO_ROLE_CATALOG.filter((role) => role.visibleInDemo)
}

export function getRoleByAnyName(name: string) {
  const needle = name.trim().toLowerCase()
  return DEMO_ROLE_CATALOG.find((role) =>
    role.matchNames.some((candidate) => candidate.toLowerCase() === needle),
  )
}

export function resolveCanonicalRoleName(name: string) {
  return getRoleByAnyName(name)?.name ?? name
}

export function getDepartmentForRole(name: string) {
  return getRoleByAnyName(name)?.department ?? 'Operations'
}

export function getRequirementKeyForRole(name: string) {
  return getRoleByAnyName(name)?.requirementKey ?? name
}

export function isVisibleDemoRole(name: string) {
  return getVisibleDemoRoles().some((role) =>
    role.matchNames.some((candidate) => candidate.toLowerCase() === name.toLowerCase()),
  )
}
```

**Step 4: Run test to verify it passes**

Run:

```bash
npm run test:unit -- src/lib/roles/catalog.test.ts
```

Expected: PASS with the catalog suite green.

**Step 5: Commit**

```bash
git add src/lib/roles/catalog.ts src/lib/roles/catalog.test.ts
git commit -m "feat: add canonical AM role catalog"
```

### Task 3: Replace Fragile Store Matching With Catalog Resolvers

**Files:**
- Modify: `src/lib/roles/catalog.ts`
- Modify: `src/lib/roles/catalog.test.ts`
- Modify: `src/stores/roles.ts`
- Modify: `src/stores/skillsMatrix.ts`

**Step 1: Write the failing test**

Extend `src/lib/roles/catalog.test.ts`:

```ts
import {
  getApplicabilityKeyForRole,
  matchesCatalogRole,
  resolveRequirementKeyFromJobTitle,
} from './catalog'

it('maps legacy names to the right data keys', () => {
  expect(getApplicabilityKeyForRole('Production Supervisor')).toBe('Production Supervisor')
  expect(resolveRequirementKeyFromJobTitle('Shift Lead')).toBe('Shift Lead')
  expect(resolveRequirementKeyFromJobTitle('Production Supervisor')).toBe('Shift Lead')
})

it('matches only exact configured aliases and not broad substrings', () => {
  expect(matchesCatalogRole('Production Supervisor', 'Shift Lead')).toBe(true)
  expect(matchesCatalogRole('Production Supervisor', 'Operations Technician')).toBe(false)
  expect(matchesCatalogRole('Welding / Fabrication Technician', 'Technician')).toBe(false)
})
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm run test:unit -- src/lib/roles/catalog.test.ts
```

Expected: FAIL because the new resolver helpers do not exist.

**Step 3: Write minimal implementation**

Add to `src/lib/roles/catalog.ts`:

```ts
export function getApplicabilityKeyForRole(name: string) {
  return getRoleByAnyName(name)?.applicabilityKey ?? name
}

export function matchesCatalogRole(canonicalName: string, candidateName: string) {
  const role = getRoleByAnyName(canonicalName)
  if (!role) return false
  const needle = candidateName.trim().toLowerCase()
  return role.matchNames.some((candidate) => candidate.toLowerCase() === needle)
}

export function resolveRequirementKeyFromJobTitle(jobTitleName: string) {
  return getRequirementKeyForRole(jobTitleName)
}
```

**Step 4: Refactor store lookups to use the resolver**

In `src/stores/roles.ts`, replace:

```ts
const key = Object.keys(requirementsJson).find((k) =>
  jobTitleName.toLowerCase().includes(k.toLowerCase()),
)
```

with:

```ts
import {
  getApplicabilityKeyForRole,
  getRequirementKeyForRole,
} from '@/lib/roles/catalog'

const key = getRequirementKeyForRole(jobTitleName)
```

and replace exact applicability fetches:

```ts
currentRole.value = roles.value.find((r) => r.erpJobTitleId === jobTitleId) ?? null
```

with:

```ts
const applicabilityKey = getApplicabilityKeyForRole(jobTitleId)
currentRole.value = roles.value.find((r) => r.erpJobTitleId === applicabilityKey) ?? null
```

In `src/stores/skillsMatrix.ts`, replace substring lookup in `getGatingIdsForJobTitle` with:

```ts
import { getRequirementKeyForRole } from '@/lib/roles/catalog'

function getGatingIdsForJobTitle(jobTitleName: string): string[] {
  const key = getRequirementKeyForRole(jobTitleName)
  return requirementsJson[key]?.gatingCompetencyIds ?? []
}
```

**Step 5: Run tests and type-check**

Run:

```bash
npm run test:unit -- src/lib/roles/catalog.test.ts
npm run type-check
```

Expected: PASS for the test suite and PASS for `vue-tsc`.

**Step 6: Commit**

```bash
git add src/lib/roles/catalog.ts src/lib/roles/catalog.test.ts src/stores/roles.ts src/stores/skillsMatrix.ts
git commit -m "refactor: use canonical role resolvers in stores"
```

### Task 4: Move Roles Views To The Canonical Demo Catalog

**Files:**
- Modify: `src/lib/roles/catalog.ts`
- Modify: `src/lib/roles/catalog.test.ts`
- Modify: `src/views/RolesView.vue`
- Modify: `src/views/RoleDetailView.vue`

**Step 1: Write the failing test**

Add route-resolution coverage:

```ts
import { getRoleByIdOrName } from './catalog'

it('resolves a role by canonical id, canonical name, or legacy alias', () => {
  expect(getRoleByIdOrName('production-supervisor')?.name).toBe('Production Supervisor')
  expect(getRoleByIdOrName('Production Supervisor')?.name).toBe('Production Supervisor')
  expect(getRoleByIdOrName('Shift Lead')?.name).toBe('Production Supervisor')
})
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm run test:unit -- src/lib/roles/catalog.test.ts
```

Expected: FAIL because `getRoleByIdOrName` does not exist.

**Step 3: Write minimal implementation**

Add to `src/lib/roles/catalog.ts`:

```ts
export function getRoleByIdOrName(value: string) {
  const needle = value.trim().toLowerCase()
  return DEMO_ROLE_CATALOG.find((role) => {
    if (role.id.toLowerCase() === needle) return true
    if (role.name.toLowerCase() === needle) return true
    return role.matchNames.some((candidate) => candidate.toLowerCase() === needle)
  })
}
```

**Step 4: Update the Roles list view**

In `src/views/RolesView.vue`:

1. Remove `erpJobTitles` as the primary list source.
2. Import `getVisibleDemoRoles`, `getDepartmentForRole`, and `getRoleByIdOrName`.
3. Build `roleStats` from `getVisibleDemoRoles()` instead of `organizationApi.getJobTitles()`.
4. Use `role.id` for navigation instead of ERP job-title IDs.
5. Remove the local `DEPT_MAP` constant and pull department values from the catalog.

Minimal target shape:

```ts
import { getVisibleDemoRoles, matchesCatalogRole } from '@/lib/roles/catalog'

const roleStats = computed(() =>
  getVisibleDemoRoles().map((role) => {
    const employees = matrixStore.mockEmployeeRows.filter((employee) =>
      matchesCatalogRole(role.name, employee.jobTitle),
    )

    return {
      id: role.id,
      name: role.name,
      department: role.department,
      assigned: employees.length,
      // keep the existing counters
    }
  }),
)
```

**Step 5: Update the Role Detail view**

In `src/views/RoleDetailView.vue`:

1. Remove local `DEPT_MAP`, `ROLE_PURPOSE_MAP`, and `CRITICALITY_MAP`.
2. Resolve `route.params.id` with `getRoleByIdOrName`.
3. If the catalog resolves, use catalog metadata for department, purpose, criticality, requirement key, and applicability key.
4. Keep fallback support for legacy ERP job-title IDs so bookmarked old URLs still load.

Target resolution flow:

```ts
const catalogRole = computed(() => getRoleByIdOrName(jobId))
const canonicalRoleName = computed(() => catalogRole.value?.name ?? jobTitle.value?.name ?? '')
const requirementKey = computed(() =>
  catalogRole.value?.requirementKey ?? jobTitle.value?.name ?? ''
)
```

**Step 6: Run tests and type-check**

Run:

```bash
npm run test:unit -- src/lib/roles/catalog.test.ts
npm run type-check
```

Expected: PASS for the unit tests and PASS for type-check.

**Step 7: Commit**

```bash
git add src/lib/roles/catalog.ts src/lib/roles/catalog.test.ts src/views/RolesView.vue src/views/RoleDetailView.vue
git commit -m "refactor: drive roles views from canonical AM catalog"
```

### Task 5: Align Applicability Data To The Canonical AM Roles

**Files:**
- Create: `src/lib/roles/data-integrity.test.ts`
- Modify: `src/data/roleApplicability.json`
- Modify: `src/lib/roles/catalog.ts`

**Step 1: Write the failing test**

Create `src/lib/roles/data-integrity.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import roleApplicabilityData from '@/data/roleApplicability.json'
import { getVisibleDemoRoles } from './catalog'

describe('role data integrity', () => {
  it('has applicability coverage for every visible demo role', () => {
    const keys = new Set(roleApplicabilityData.map((item) => item.erpJobTitleId))

    expect(keys.has('Additive Manufacturing Technician')).toBe(true)
    expect(keys.has('Welding / Fabrication Technician')).toBe(true)
    expect(keys.has('Robotics Operator')).toBe(true)
    expect(keys.has('Materials Testing Technician')).toBe(true)
    expect(keys.has('QA Inspector')).toBe(true)
    expect(keys.has('Production Supervisor')).toBe(true)
    expect(keys.has('QHSE Coordinator')).toBe(true)

    expect(getVisibleDemoRoles()).toHaveLength(7)
  })
})
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm run test:unit -- src/lib/roles/data-integrity.test.ts
```

Expected: FAIL because the applicability JSON does not yet cover the AM-first visible catalog.

**Step 3: Write minimal implementation**

Modify `src/data/roleApplicability.json` to add or replace visible-role entries so it includes:

1. `Additive Manufacturing Technician`
2. `Welding / Fabrication Technician`
3. `Robotics Operator`
4. `Materials Testing Technician`
5. `QA Inspector`
6. `Production Supervisor`
7. `QHSE Coordinator`

Use this pattern for each new record:

```json
{
  "id": "dec-ps-001",
  "erpJobTitleId": "Production Supervisor",
  "q1HandsOnOperational": true,
  "q2ConformitySignOff": true,
  "q3ErrorCausesImpact": true,
  "q4SpecificCompetenceRequired": true,
  "q5ObjectiveEvidenceRequired": true,
  "result": "INCLUDED",
  "notes": "Operational leadership role for additive manufacturing production readiness and escalation.",
  "version": 1,
  "createdByUserId": "admin-1",
  "createdAt": "2026-03-28T09:00:00Z"
}
```

Compatibility rule:

1. Keep legacy `Shift Lead` in the file only if something still resolves it directly.
2. Keep old maintenance/electrical/instrumentation entries only until the catalog-driven visibility filter is live.
3. Do not make them visible in the new demo catalog.

**Step 4: Run tests to verify the data passes**

Run:

```bash
npm run test:unit -- src/lib/roles/data-integrity.test.ts
npm run type-check
```

Expected: PASS and PASS.

**Step 5: Commit**

```bash
git add src/data/roleApplicability.json src/lib/roles/data-integrity.test.ts src/lib/roles/catalog.ts
git commit -m "data: align role applicability with AM-first demo roles"
```

### Task 6: Align Awareness, Persona Links, And Employee Demo Scope

**Files:**
- Modify: `src/data/awarenessTopics.json`
- Modify: `src/stores/auth.ts`
- Modify: `src/stores/employees.ts`
- Modify: `src/lib/roles/data-integrity.test.ts`

**Step 1: Write the failing test**

Extend `src/lib/roles/data-integrity.test.ts`:

```ts
import awarenessTopicsData from '@/data/awarenessTopics.json'
import { DEMO_PERSONAS } from '@/stores/auth'
import { resolveCanonicalRoleName } from './catalog'

it('uses canonical audience and persona role names', () => {
  const audienceNames = new Set(
    awarenessTopicsData.flatMap((topic) => topic.requiredAudience.map(resolveCanonicalRoleName)),
  )

  expect(audienceNames.has('Production Supervisor')).toBe(true)
  expect(audienceNames.has('QHSE Coordinator')).toBe(true)

  expect(resolveCanonicalRoleName(DEMO_PERSONAS.supervisor.linkedJobTitle!)).toBe(
    'Production Supervisor',
  )
  expect(resolveCanonicalRoleName(DEMO_PERSONAS.qhse.linkedJobTitle!)).toBe('QHSE Coordinator')
})
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm run test:unit -- src/lib/roles/data-integrity.test.ts
```

Expected: FAIL because awareness topics and persona links still use mixed names.

**Step 3: Normalize awareness and persona naming**

In `src/data/awarenessTopics.json`:

1. Replace `HSE Coordinator` with `QHSE Coordinator`.
2. Keep `Production Supervisor` as the canonical operational leadership audience.
3. Ensure no new awareness item points at removed visible roles.

In `src/stores/auth.ts`:

1. Keep `linkedJobTitle: 'Production Supervisor'` for `supervisor` and `manager`.
2. Keep `linkedJobTitle: 'QHSE Coordinator'` for `qhse`.
3. Leave `hr_admin` as an app persona only, not part of the visible AM role catalog.

**Step 4: Replace the employee demo-scope keyword filter**

In `src/stores/employees.ts`:

1. Remove the broad `TARGET_KEYWORDS` approach.
2. Import `isVisibleDemoRole` and `resolveCanonicalRoleName` from the catalog.
3. Filter real employees by whether their job title resolves into the visible demo catalog.
4. Expand `DEMO_PROFILES` so there is at least one injected demo row for each visible manufacturing role that may be missing from the API.

Target shape:

```ts
import { isVisibleDemoRole, resolveCanonicalRoleName } from '@/lib/roles/catalog'

const targetJobTitleEmployees = computed(() => {
  const filtered = allEmployees.value.filter((employee) => {
    const roleName = employee.jobTitle?.name
    if (!roleName) return false
    return isVisibleDemoRole(resolveCanonicalRoleName(roleName))
  })
  return filtered.slice(0, EMPLOYEE_CAP)
})
```

**Step 5: Run tests and type-check**

Run:

```bash
npm run test:unit -- src/lib/roles/data-integrity.test.ts src/lib/roles/catalog.test.ts
npm run type-check
```

Expected: PASS and PASS.

**Step 6: Commit**

```bash
git add src/data/awarenessTopics.json src/stores/auth.ts src/stores/employees.ts src/lib/roles/data-integrity.test.ts
git commit -m "data: align awareness and employee scope with AM role catalog"
```

### Task 7: Final Verification And Manual Regression Sweep

**Files:**
- Modify: `src/views/RolesView.vue`
- Modify: `src/views/RoleDetailView.vue`
- Modify: `src/stores/roles.ts`
- Modify: `src/stores/skillsMatrix.ts`
- Modify: `src/stores/employees.ts`
- Modify: `src/data/roleApplicability.json`
- Modify: `src/data/awarenessTopics.json`
- Modify: `src/stores/auth.ts`
- Modify: `src/lib/roles/catalog.ts`
- Modify: `src/lib/roles/catalog.test.ts`
- Modify: `src/lib/roles/data-integrity.test.ts`
- Modify: `package.json`
- Modify: `vitest.config.ts`

**Step 1: Run the focused regression tests**

Run:

```bash
npm run test:unit -- src/lib/roles/catalog.test.ts src/lib/roles/data-integrity.test.ts
```

Expected: PASS with all role-catalog and data-integrity tests green.

**Step 2: Run type-check**

Run:

```bash
npm run type-check
```

Expected: PASS with no TypeScript errors.

**Step 3: Run the build**

Run:

```bash
npm run build
```

Expected: PASS with a production build completing successfully.

**Step 4: Run formatting**

Run:

```bash
npm run format
```

Expected: PASS with no formatter errors.

**Step 5: Perform manual page verification**

Check these screens in the running app:

1. Roles page shows only the seven AM-first visible roles.
2. Roles filters return departments consistent with the visible role catalog.
3. Production Supervisor role detail loads from `/roles/:id` using the canonical id.
4. Any bookmarked legacy `Shift Lead` route still resolves to the same detail screen.
5. Dashboard role charts no longer foreground electrical/instrumentation-heavy roles.
6. People page rows are dominated by AM manufacturing roles, not support-heavy technical roles.
7. Awareness topics targeting `Production Supervisor` and `QHSE Coordinator` still appear on the right role detail pages.
8. My Competencies for supervisor and QHSE personas still resolves to matching matrix data.

**Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/roles/catalog.ts src/lib/roles/catalog.test.ts src/lib/roles/data-integrity.test.ts src/views/RolesView.vue src/views/RoleDetailView.vue src/stores/roles.ts src/stores/skillsMatrix.ts src/stores/employees.ts src/stores/auth.ts src/data/roleApplicability.json src/data/awarenessTopics.json
git commit -m "feat: align demo roles with additive manufacturing operations"
```

## Expected Outcome

After this plan is implemented:

1. The Roles page is visibly centered on AM operations: welding, robotics, additive manufacturing, materials testing, QA, and production supervision.
2. `Production Supervisor` becomes the operational leadership role without breaking legacy `Shift Lead` data or links.
3. `QHSE Coordinator` remains available as the single supporting-function role.
4. Raw ERP job titles no longer control the visible demo story.
5. Cross-page references remain stable because all lookups pass through a canonical role resolver.

## Explicit Non-Goals

1. Do not rewrite `src/data/roleRequirements.json` beyond what is needed for alias-safe lookup.
2. Do not redesign the Roles UI layout.
3. Do not change the route structure or permission model.
4. Do not add office, software, or HR roles to the visible AM demo catalog.
