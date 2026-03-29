# UI Design System Documentation

**MANDATORY READING - This document is the SINGLE SOURCE OF TRUTH for all UI development.**

Any AI agent implementing UI components MUST consult this document before writing any code.

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [The 5 Non-Negotiable Rules](#the-5-non-negotiable-rules)
3. [Design Tokens](#design-tokens)
4. [Semantic CSS Classes](#semantic-css-classes)
5. [Component Reference](#component-reference)
6. [Layout Patterns](#layout-patterns)
7. [Form Patterns](#form-patterns)
8. [Table Patterns](#table-patterns)
9. [Custom Components](#custom-components)
10. [Banned Patterns](#banned-patterns)

---

## Design Principles

- **Light Theme ONLY** - No dark mode variables, toggles, or media queries
- **Enterprise-Grade** - Subtle colors, professional aesthetic, no bright colors, no emojis
- **Consistent Radius** - 8px (0.5rem) throughout for modern but refined look
- **Semantic Classes** - NO Tailwind utility classes in Vue SFC templates
- **Accessibility First** - ARIA labels, keyboard navigation, focus states

---

## The 5 Non-Negotiable Rules

### RULE 1: shadcn-vue Components ONLY

- ZERO raw HTML elements for UI components
- Every interactive element MUST use shadcn-vue registry components

**BANNED TAGS in templates:**
```vue
<!-- NEVER USE THESE -->
<button>, <input>, <select>, <textarea>, <dialog>, <table>, <label>
```

**Required components:**
- Button, Input, Label, Card, Dialog, Sheet, DropdownMenu
- Avatar, Badge, Table, Calendar, Popover, Sonner
- Separator, ScrollArea, Skeleton, Switch, Tabs, Tooltip
- Checkbox, RadioGroup, Select, Accordion, AlertDialog
- Breadcrumb, ButtonGroup, Field, NavigationMenu, Stepper, Pagination

### RULE 2: ZERO Hard-Coded Tailwind Classes

- NO Tailwind utility classes in Vue SFC templates
- ALL styling lives in main.css via semantic CSS classes
- Components use class names like: `app-layout`, `page-header`, `kpi-card`

### RULE 3: Light Theme Only

- No dark mode variables, toggles, or media queries
- All tokens optimized exclusively for light backgrounds

### RULE 4: Design Token Architecture

- All visual values tokenized in main.css
- No magic numbers in component logic

### RULE 5: Accessibility Requirements

- All interactive elements must have ARIA labels
- Keyboard navigation must work
- Focus states must be visible

---

## Design Tokens

All tokens are defined in `:root` in `src/main.css`.

### Background Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-app` | oklch(0.985 0.002 247.84) | Main application background |
| `--bg-surface` | oklch(1 0 0) | Card and surface backgrounds |
| `--bg-subtle` | oklch(0.97 0.006 247.88) | Subtle backgrounds, hover states |
| `--bg-hover` | oklch(0.94 0.012 247.92) | Hover state backgrounds |

### Typography Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--text-heading` | oklch(0.13 0.028 264.7) | Headings, important text |
| `--text-body` | oklch(0.45 0.04 257) | Body text, labels |
| `--text-caption` | oklch(0.58 0.035 257) | Captions, helper text, placeholders |

### Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--brand-primary` | oklch(0.38 0.14 266) | Primary actions, active states |
| `--brand-success` | oklch(0.62 0.14 162) | Success states, positive indicators |
| `--brand-warning` | oklch(0.72 0.15 58) | Warning states, caution |
| `--brand-critical` | oklch(0.62 0.2 25) | Error states, destructive actions |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 0.375rem (6px) | Small elements, badges |
| `--radius-md` | 0.5rem (8px) | Buttons, inputs |
| `--radius-lg` | 0.75rem (12px) | Cards, dropdowns |
| `--radius-xl` | 1rem (16px) | Large containers |
| `--radius-full` | 9999px | Pills, avatars, circular |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-card` | Subtle multi-layer | Cards, containers |
| `--shadow-elevated` | Medium elevation | Popovers, dropdowns |
| `--shadow-glass` | Glass effect | Headers, overlays |
| `--shadow-dropdown` | Dropdown specific | Dropdown menus |

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 0.375rem (6px) | Tight spacing |
| `--space-sm` | 0.625rem (10px) | Small gaps |
| `--space-md` | 1rem (16px) | Standard spacing |
| `--space-lg` | 1.5rem (24px) | Section spacing |
| `--space-xl` | 2rem (32px) | Large sections |
| `--space-2xl` | 3rem (48px) | Page sections |

### Borders

| Token | Value | Usage |
|-------|-------|-------|
| `--border-subtle` | 1px solid oklch(0.91 0.01 255) | Default borders |
| `--border-strong` | 1px solid oklch(0.82 0.015 255) | Emphasized borders |
| `--border-focus` | 1px solid oklch(0.78 0.015 255) | Focus rings (subtle) |

### Focus Ring

| Token | Value | Usage |
|-------|-------|-------|
| `--focus-ring` | 0 0 0 1px oklch(0.78 0.015 255) | Subtle focus indicator |

---

## Semantic CSS Classes

### Layout Classes

```css
.app-layout { /* Root layout flex container */ }
.app-sidebar { /* 280px sidebar */ }
.app-header { /* Sticky 64px header with glassmorphism */ }
.app-main { /* Main content flex column */ }
.app-content { /* Centered content, max-width: 1800px */ }
```

### Page Header Classes

```css
.page-header { /* Section header container */ }
.page-title { /* 1.75rem bold heading */ }
.page-subtitle { /* 0.9375rem body text */ }
```

### Navigation Classes

```css
.nav-section { /* Navigation group container */ }
.nav-section-title { /* Uppercase section label */ }
.nav-item { /* Navigation link */ }
.nav-item-active { /* Active state with left border */ }
```

### KPI Card Classes

```css
.kpi-grid { /* 4-column grid, responsive */ }
.kpi-card { /* Dense KPI container, padding: var(--space-md) */ }
.kpi-card-header { /* Icon and title row */ }
.kpi-card-title { /* Small label (0.75rem) */ }
.kpi-card-value { /* Value (1.5rem) */ }
.kpi-card-change { /* Trend indicator (0.6875rem) */ }
.kpi-card-change-positive { /* Green color */ }
.kpi-card-change-negative { /* Red color */ }
```

### Data Card Classes

```css
.data-card { /* Card container */ }
.data-card-header { /* Header with title and actions */ }
.data-card-title { /* Card title */ }
.data-card-content { /* Card body */ }
```

### Table Classes

```css
.dense-table { /* Dense table with compact rows */ }
.table-user { /* User cell with avatar and name */ }
.table-avatar { /* 28px circular avatar with initials */ }
.table-actions-header { /* Right-aligned actions column */ }
.table-actions-cell { /* Right-aligned actions cell */ }
.table-action-btn { /* 28px icon button for actions */ }
```

### Badge Classes

```css
.badge { /* Base badge */ }
.badge-primary { /* Primary variant */ }
.badge-success { /* Success variant */ }
.badge-warning { /* Warning variant */ }
.badge-critical { /* Critical variant */ }
.badge-neutral { /* Neutral variant */ }
```

### Sheet Classes

```css
.sheet-header { /* Sticky sheet header */ }
.sheet-title { /* Sheet title */ }
.sheet-description { /* Sheet subtitle */ }
.sheet-content { /* Scrollable content */ }
.sheet-footer { /* Sticky footer with actions */ }
.sheet-side-right { /* Right-side panel: inset-block 0, right 0, 75% width, max-width 1040px */ }
.sheet-side-left { /* Left-side panel: inset-block 0, left 0, 75% width, max-width 1040px */ }
.sheet-side-top { /* Top panel: inset-inline 0, top 0, height auto */ }
.sheet-side-bottom { /* Bottom panel: inset-inline 0, bottom 0, height auto */ }
```

### Form Classes

```css
.form-grid { /* 2-column grid layout */ }
.form-field { /* Form field container */ }
.form-field-full { /* Full-width field (spans 2 columns) */ }
.form-group { /* Form field container */ }
.form-label { /* Field label */ }
.form-description { /* Helper text */ }
.form-error { /* Error message */ }
```

### Icon Classes

```css
.icon-xs { /* 14px icon */ }
.icon-sm { /* 16px icon */ }
```

---

## Component Reference

### Button

**Import Path:** `@/components/ui/button`

**Variants:**
- `default` - Primary brand color background
- `secondary` - Subtle gray background
- `destructive` - Critical red for destructive actions
- `outline` - Bordered, transparent background
- `ghost` - No background or border
- `link` - Text only, underlined on hover

**Sizes:** `sm`, `default`, `lg`, `icon`

**Usage:**
```vue
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="sm">Small Outline</Button>
<Button variant="ghost" size="icon" aria-label="Add item">
  <Plus class="icon-sm" />
</Button>
```

---

### Sonner (Toast Notifications)

**Setup in main.ts:**
```typescript
import "vue-sonner/style.css"
```

**Setup in App.vue:**
```vue
<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
  <Toaster />
</template>
```

**Usage in components:**
```vue
<script setup lang="ts">
import { toast } from 'vue-sonner'

const handleSave = () => {
  toast.success('Record saved successfully')
}

const handleError = () => {
  toast.error('Failed to save record')
}

const handleWarning = () => {
  toast.warning('This action cannot be undone')
}

const handleInfo = () => {
  toast.info('New updates available')
}
</script>
```

**Toast Position:** Top-right by default

---

### Calendar with Month/Year Dropdowns

**Import Path:** `@/components/ui/calendar`

**Usage with dropdown selectors:**
```vue
<script setup lang="ts">
import { Calendar } from '@/components/ui/calendar'
import type { DateValue } from '@internationalized/date'

const selectedDate = ref<DateValue>()
</script>

<template>
  <Calendar v-model="selectedDate" layout="month-and-year" />
</template>
```

**Layout Options:**
- `layout="month-and-year"` - Both Month and Year as dropdowns
- `layout="month-only"` - Month dropdown, Year text
- `layout="year-only"` - Month text, Year dropdown

---

### Date Picker Pattern

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-vue-next'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import type { DateValue } from '@internationalized/date'

const selectedDate = ref<DateValue>()
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline" class="form-date-trigger">
        <CalendarIcon class="icon-sm" />
        {{ selectedDate ? format(selectedDate.toDate('UTC'), 'PPP') : 'Pick a date' }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="popover-calendar" align="start">
      <Calendar v-model="selectedDate" layout="month-and-year" />
    </PopoverContent>
  </Popover>
</template>
```

---

### Sheet (1040px Width)

**Import Path:** `@/components/ui/sheet`

**SheetContent has been modified:** Side-specific positioning, sizing, and borders are now handled via semantic CSS classes (`.sheet-side-right`, `.sheet-side-left`, `.sheet-side-top`, `.sheet-side-bottom`) defined in `main.css`. The default max-width for left/right sides is `1040px`.

**Usage:**
```vue
<Sheet v-model:open="sheetOpen">
  <SheetTrigger as-child>
    <Button variant="outline">Open Sheet</Button>
  </SheetTrigger>
  <SheetContent class="sheet-panel">
    <SheetHeader>
      <SheetTitle>Edit Record</SheetTitle>
      <SheetDescription>Make changes below.</SheetDescription>
    </SheetHeader>
    <div class="sheet-body">
      <!-- Form content -->
    </div>
    <SheetFooter class="sheet-footer">
      <Button variant="outline" @click="sheetOpen = false">Cancel</Button>
      <Button @click="sheetOpen = false">Save Changes</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

---

## Layout Patterns

### App Shell Pattern

```vue
<script setup lang="ts">
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<template>
  <SidebarProvider :defaultOpen="true">
    <AppSidebar />
    <SidebarInset>
      <AppHeader />
      <main class="app-main">
        <div class="app-content">
          <RouterView />
        </div>
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
```

---

## Form Patterns

### 2-Column Form Layout

```vue
<template>
  <div class="form-example-card">
    <div class="form-grid">
      <!-- Full-width field -->
      <div class="form-field form-field-full">
        <Label for="title">Title</Label>
        <Input id="title" placeholder="Enter title..." />
      </div>
      
      <!-- Two-column fields -->
      <div class="form-field">
        <Label for="firstname">First Name</Label>
        <Input id="firstname" placeholder="First name" />
      </div>
      <div class="form-field">
        <Label for="lastname">Last Name</Label>
        <Input id="lastname" placeholder="Last name" />
      </div>
      
      <!-- Select field -->
      <div class="form-field">
        <Label>Department</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <!-- Date picker field -->
      <div class="form-field">
        <Label>Start Date</Label>
        <DateTimePicker v-model="selectedDate" placeholder="Select date and time" />
      </div>
    </div>
    
    <div class="form-divider" />
    <div class="form-actions">
      <Button variant="outline">Cancel</Button>
      <Button>Save Changes</Button>
    </div>
  </div>
</template>
```

---

## Table Patterns

> **Standard:** All tables MUST use `@ioi-dev/vue-table` (IoiTable). All views have been migrated. The legacy `dense-table` pattern remains in `main.css` for reference but MUST NOT be used for new tables. `SkillsMatrixView` is the only intentional exception due to its custom multi-mode complexity.

---

### IoiTable — Standard (Preferred)

**Import:**
```typescript
import { Table as IoiTable } from '@ioi-dev/vue-table/unstyled'
import type { ColumnDef, CellSlotProps, SortState, IoiPaginationChangePayload, HeaderFilterSlotProps } from '@ioi-dev/vue-table/unstyled'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronUp, ChevronDown, ChevronsUpDown, MoreHorizontal } from 'lucide-vue-next'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
```

**Column Definition:**
```typescript
type MyRow = { id: string; name: string; status: string; count: number }

const columns: ColumnDef<MyRow>[] = [
  // Text column with inline text filter
  { id: 'name',    field: 'name',    header: 'Name',    type: 'text',   headerFilter: 'text',   width: 200 },
  // Text column with select filter (options auto-populated from data)
  { id: 'status',  field: 'status',  header: 'Status',  type: 'text',   headerFilter: 'select', width: 120 },
  // Number column — centred automatically via sort-header--center + cell-center
  { id: 'count',   field: 'count',   header: 'Count',   type: 'number',                         width: 90  },
  // Actions column — always last, header: 'Actions', fixed width
  { id: '_actions', field: '_actions', header: 'Actions',                                        width: 72  },
]
```

**Column Definition Rules:**
| Column type | `type` | `headerFilter` | Alignment |
|---|---|---|---|
| Text / string | `'text'` | `'text'` or `'select'` | Left (default) |
| Numeric count | `'number'` | — | Centred (auto via `sort-header--center` + `cell-center`) |
| Badge / status | `'text'` | `'select'` | Left |
| Actions | — | — | Right (`sort-header--right` applied automatically) |

**Template:**
```vue
<template>
  <IoiTable
    ref="tableRef"
    :rows="rows"
    :columns="columns"
    row-key="id"
    v-model:pageIndex="pageIndex"
    v-model:pageSize="pageSize"
    aria-label="Table label"
    @pagination-change="handlePaginationChange"
  >
    <!-- ── Sort header ── -->
    <template #header="{ column }">
      <div
        class="sort-header"
        :class="{
          'sort-header--no-sort': column.id === '_actions',
          'sort-header--center': column.type === 'number',
          'sort-header--right': column.id === '_actions',
        }"
        @click.stop="headerSort(String(column.field))"
      >
        <span>{{ column.header ?? column.field }}</span>
        <ChevronUp      v-if="getSortDir(String(column.field)) === 'asc'"  class="sort-icon" />
        <ChevronDown    v-else-if="getSortDir(String(column.field)) === 'desc'" class="sort-icon" />
        <ChevronsUpDown v-else-if="column.id !== '_actions'" class="sort-icon sort-icon-inactive" />
      </div>
    </template>

    <!-- ── shadcn filter controls ── -->
    <template #header-filter="{ column, mode, value, options, setValue }: HeaderFilterSlotProps<MyRow>">
      <Select
        v-if="mode === 'select'"
        :model-value="value || '__all__'"
        @update:model-value="(v: string) => setValue(v === '__all__' ? '' : v)"
      >
        <SelectTrigger size="sm" class="table-filter-select" :aria-label="`Filter by ${column.header}`">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All</SelectItem>
          <SelectItem v-for="opt in options" :key="opt" :value="opt">{{ opt }}</SelectItem>
        </SelectContent>
      </Select>
      <Input
        v-else-if="mode === 'text'"
        :model-value="value"
        class="table-filter-input"
        :placeholder="`Filter ${column.header}…`"
        :aria-label="`Filter by ${column.header}`"
        @input="(e: Event) => setValue((e.target as HTMLInputElement).value)"
      />
    </template>

    <!-- ── Custom cells ── -->
    <template #cell="{ column, row, value }: CellSlotProps<MyRow>">
      <!-- Status badge -->
      <template v-if="column.field === 'status'">
        <span class="badge" :class="row.status === 'active' ? 'badge-success' : 'badge-neutral'">
          {{ row.status }}
        </span>
      </template>

      <!-- Centred number -->
      <template v-else-if="column.field === 'count'">
        <div class="cell-center">
          <span class="gap-count" :class="row.count > 0 ? 'gap-count-high' : 'gap-count-zero'">
            {{ row.count }}
          </span>
        </div>
      </template>

      <!-- Actions — always a DropdownMenu with MoreHorizontal icon -->
      <template v-else-if="column.field === '_actions'">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="table-action-btn" :aria-label="`Actions for ${row.name}`">
              <MoreHorizontal class="icon-xs" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </template>

      <template v-else>{{ value }}</template>
    </template>

    <!-- ── Empty state ── -->
    <template #empty>
      <div class="empty-cell">No records found</div>
    </template>
  </IoiTable>
</template>
```

**Script (sort + pagination helpers):**
```typescript
interface IoiTableRef { setSortState: (s: SortState[]) => void }
const tableRef = ref<IoiTableRef | null>(null)
const sortStates = ref<SortState[]>([])
const pageIndex = ref(0)
const pageSize = ref(20)
const tableTotal = ref(0)
const tablePageCount = ref(0)

function getSortDir(field: string): 'asc' | 'desc' | '' {
  return sortStates.value.find(s => s.field === field)?.direction ?? ''
}

function headerSort(field: string): void {
  if (field === '_actions') return
  const cur = getSortDir(field)
  const next: SortState[] = !cur
    ? [{ field, direction: 'asc' }]
    : cur === 'asc' ? [{ field, direction: 'desc' }] : []
  sortStates.value = next
  tableRef.value?.setSortState(next)
  pageIndex.value = 0
}

function handlePaginationChange(payload: IoiPaginationChangePayload) {
  tableTotal.value = payload.rowCount
  tablePageCount.value = payload.pageCount
}

const pageCount = computed(() =>
  tablePageCount.value > 0 ? tablePageCount.value : Math.ceil(rows.value.length / pageSize.value)
)
const totalCount = computed(() => tableTotal.value || rows.value.length)
```

**CSS classes needed (all defined globally in `main.css`):**
```css
/* Already global — no local <style scoped> needed for these */
.sort-header        /* flex row, sortable header content */
.sort-header--no-sort  /* disables pointer cursor */
.sort-header--center   /* centres numeric column headers */
.sort-header--right    /* right-aligns Actions header */
.sort-icon             /* 12px sort chevron */
.sort-icon-inactive    /* dimmed when unsorted */
.cell-center           /* centres numeric cell content */
.table-filter-select   /* compact shadcn SelectTrigger in filter row */
.table-filter-input    /* compact shadcn Input in filter row */
.empty-cell            /* centred empty-state text */
```

**Non-negotiable table rules:**
1. Import from `@ioi-dev/vue-table/unstyled` — never from the default export (avoids bundled CSS conflicts)
2. Actions column: `header: 'Actions'`, `id: '_actions'`, `field: '_actions'`, `width: 72` — always last
3. Action button: `size="icon"` ghost Button with `MoreHorizontal` → DropdownMenu only. No text buttons in table cells
4. Number columns: wrap cell content in `<div class="cell-center">` and add `sort-header--center` to header
5. Filter controls: always use shadcn `Select` (select mode) / `Input` (text mode) via `#header-filter` slot — never rely on native `<select>` / `<input>`
6. Pagination: always include pagination controls below the table using the pattern from PeopleView

---

### Dense Data Table (Legacy — do not use for new tables)

Existing tables that have not been migrated to IoiTable still use this pattern:

```vue
<Table class="dense-table">
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead class="table-actions-header">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>
        <div class="table-user">
          <div class="table-avatar">JD</div>
          <span>John Doe</span>
        </div>
      </TableCell>
      <TableCell><span class="badge badge-success">Active</span></TableCell>
      <TableCell class="table-actions-cell">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="table-action-btn" aria-label="Actions">
              <MoreHorizontal class="icon-xs" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="destructive-action">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## Custom Components

### DateTimePicker

**Import Path:** `@/components/ui/date-time-picker`

A custom component combining Calendar with time selection.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modelValue | DateValue \| undefined | - | v-model value |
| placeholder | string | 'Pick date and time' | Placeholder text |
| disabled | boolean | false | Disabled state |

**Usage:**
```vue
<script setup lang="ts">
import { DateTimePicker } from '@/components/ui/date-time-picker'
import type { DateValue } from '@internationalized/date'

const selectedDateTime = ref<DateValue>()
</script>

<template>
  <DateTimePicker v-model="selectedDateTime" placeholder="Select date and time" />
</template>
```

**Features:**
- Calendar with Month/Year dropdowns
- Hour and Minute input fields
- Cancel and Confirm buttons
- Consistent styling with form inputs

---

## Banned Patterns

### NEVER Use Raw HTML Elements

```vue
<!-- WRONG -->
<button @click="handleClick">Click me</button>
<input v-model="email" type="email" />

<!-- CORRECT -->
<Button @click="handleClick">Click me</Button>
<Input v-model="email" type="email" />
```

### NEVER Use Tailwind Classes in Templates

```vue
<!-- WRONG -->
<div class="flex items-center gap-4 p-6 bg-white rounded-lg">

<!-- CORRECT -->
<div class="data-card">
```

### NEVER Use Dark Mode

```vue
<!-- WRONG -->
<div class="dark:bg-gray-900 dark:text-white">

<!-- CORRECT -->
<div class="data-card">
```

### NEVER Skip Accessibility

```vue
<!-- WRONG -->
<Button variant="ghost" size="icon" @click="delete">
  <TrashIcon />
</Button>

<!-- CORRECT -->
<Button variant="ghost" size="icon" @click="delete" aria-label="Delete record">
  <TrashIcon class="icon-sm" />
</Button>
```

---

## Quick Reference

### Import Paths

```typescript
@/components/ui/button         → Button
@/components/ui/input          → Input
@/components/ui/label          → Label
@/components/ui/card           → Card, CardHeader, CardTitle, etc.
@/components/ui/dialog         → Dialog, DialogTrigger, etc.
@/components/ui/sheet          → Sheet, SheetTrigger, etc.
@/components/ui/dropdown-menu  → DropdownMenu, etc.
@/components/ui/select         → Select, SelectTrigger, etc.
@/components/ui/table          → Table, TableRow, etc.
@/components/ui/calendar       → Calendar
@/components/ui/popover        → Popover, PopoverTrigger, etc.
@/components/ui/sonner         → Toaster
@/components/ui/date-time-picker → DateTimePicker
```

### Toast Notifications

```typescript
import { toast } from 'vue-sonner'

toast.success('Success message')
toast.error('Error message')
toast.warning('Warning message')
toast.info('Info message')
```

### Badge Classes (use instead of Badge component for status)

```vue
<span class="badge badge-success">Active</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-critical">Inactive</span>
<span class="badge badge-primary">Primary</span>
<span class="badge badge-neutral">Neutral</span>
```

---

## Mobile Responsive Notes

- Sidebar: Hidden on mobile, accessible via hamburger menu
- Header search: Hidden on mobile (`desktop-only` class)
- KPI grid: 4 columns → 2 columns (1280px) → 1 column (768px)
- Form grid: 2 columns → 1 column on mobile
- Content padding: Reduced on mobile

---

## Known Non-Blocking TypeScript Errors

The following TypeScript errors are known issues with Vue 3.5 and do not affect runtime:

1. **DateTimePicker DateValue type errors** - Runtime works correctly
2. **NativeSelect data-slot attribute errors** - Known Vue 3.5 issue with native elements

These can be safely ignored during development.
