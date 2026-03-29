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

### Dense Data Table (Default Style)

All tables should use the dense-table class and follow this pattern:

```vue
<script setup lang="ts">
import { MoreHorizontal } from 'lucide-vue-next'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
</script>

<template>
  <Table class="dense-table">
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Department</TableHead>
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
        <TableCell>Engineering</TableCell>
        <TableCell>
          <span class="badge badge-success">Active</span>
        </TableCell>
        <TableCell class="table-actions-cell">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon" class="table-action-btn" aria-label="Actions">
                <MoreHorizontal class="icon-xs" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit Record</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="destructive-action">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
```

**Key Table Rules:**
1. Always use `class="dense-table"` on Table component
2. Last column (Actions) always has `class="table-actions-header"` on TableHead
3. Actions cell uses `class="table-actions-cell"` on TableCell
4. Action button is always a "..." icon with dropdown menu
5. User/name cells use `.table-user` wrapper with `.table-avatar`
6. Status badges use `.badge` classes (not Badge component)

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
