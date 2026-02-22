# IOI Shell - Enterprise UI Design System

A comprehensive Vue 3.5 enterprise UI design system built with shadcn-vue components for the IOI Shell training management platform.

## Features

- **Vue 3.5** with Composition API and `<script setup>`
- **shadcn-vue** components (no raw HTML elements)
- **Semantic CSS** classes (zero Tailwind in templates)
- **Light theme only** - enterprise-grade aesthetic
- **Accessible** - ARIA labels, keyboard navigation
- **Responsive** - mobile-friendly layouts

## Quick Start

### Clone with Custom Directory Name

```sh
git clone https://github.com/Inova-Deep/shell-app.git my-project-name
cd my-project-name
npm install
npm run dev
```

### Development

```sh
npm run dev
```

Open http://localhost:5173

### Production Build

```sh
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── layout/          # AppLayout, AppHeader, AppSidebar
│   └── ui/              # shadcn-vue components
│       ├── button/
│       ├── input/
│       ├── card/
│       ├── dialog/
│       ├── sheet/
│       ├── table/
│       ├── calendar/
│       ├── date-time-picker/  # Custom component
│       ├── sonner/            # Toast notifications
│       └── ...
├── views/
│   ├── DashboardView.vue      # Dashboard with KPIs and data table
│   └── ComponentsView.vue     # UI component showcase
├── main.css             # Design tokens and semantic classes
├── main.ts              # App entry point
└── router/index.ts      # Vue Router config
```

## Design System

See [ui_design.md](./ui_design.md) for complete documentation.

### Primary Color

```css
--primary: oklch(0.38 0.14 266);  /* Rich violet-blue */
```

### Key CSS Classes

| Class | Usage |
|-------|-------|
| `.app-layout` | Root layout container |
| `.app-sidebar` | 280px sidebar |
| `.app-header` | Sticky 64px header |
| `.app-content` | Main content (max-width: 1800px) |
| `.kpi-card` | Dense KPI metric card |
| `.dense-table` | Compact data table |
| `.badge-success` | Success status badge |
| `.badge-warning` | Warning status badge |
| `.badge-critical` | Error status badge |

## Components

### Installed shadcn-vue Components

- Button, Input, Label, Card
- Dialog, Sheet, DropdownMenu
- Table, Badge, Avatar
- Calendar, Popover, DateTimePicker
- Tabs, Accordion, Tooltip
- Checkbox, Switch, RadioGroup, Select
- Sonner (Toast), Skeleton, Separator
- Sidebar, Breadcrumb, AlertDialog
- And more...

### Custom Components

- **DateTimePicker** - Calendar with time selection (`@/components/ui/date-time-picker`)

## Requirements

- Node.js 18+
- npm 9+

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)

## License

MIT
