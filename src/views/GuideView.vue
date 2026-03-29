<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ArrowRight,
  Check,
  Shield,
  Clock,
  Users,
  AlertTriangle,
  FileCheck,
  Zap,
  Target,
  ChevronRight,
  LayoutDashboard,
  Table2,
  UserCircle2,
  Briefcase,
  GraduationCap,
  BookOpen,
  Bell,
  Award,
  ShieldCheck,
  SwitchCamera,
  Eye,
  Megaphone,
  Library,
  Database,
  ListChecks,
  Lock,
  BarChart3,
  UserCog,
  Wrench,
  ClipboardCheck,
  FileText,
  Info,
  Layers,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { canRoleAccessPath } from '@/lib/navigation'

const router = useRouter()
const authStore = useAuthStore()

const challenges = [
  {
    icon: AlertTriangle,
    title: 'Expired Welder Certs',
    desc: 'Welding qualifications lapse unnoticed — an auditor finds expired certificates before you do, halting production.',
  },
  {
    icon: Shield,
    title: 'Robot Cell Safety Gaps',
    desc: 'New robotic welding cells require updated safety training, but no one can confirm who has completed it.',
  },
  {
    icon: FileText,
    title: 'Material Traceability',
    desc: 'ISO 3834 and client-specific procedures require documented competence proof that is scattered across folders.',
  },
  {
    icon: Users,
    title: 'Unclear Supervision Status',
    desc: 'No clear view of which technicians can work independently vs. under supervision on critical activities.',
  },
]

const journey = [
  {
    step: 1,
    title: 'Configure Requirements',
    desc: 'Define what each role needs — competency items, risk levels, gating rules, and assessment methods.',
    icon: Target,
  },
  {
    step: 2,
    title: 'Track Assessments',
    desc: 'Record assessments, upload evidence, and capture pass/fail outcomes with assessor details.',
    icon: ClipboardCheck,
  },
  {
    step: 3,
    title: 'Close Gaps',
    desc: 'Auto-generated training needs link back to NCRs, audits, expirations, or procedure changes.',
    icon: GraduationCap,
  },
  {
    step: 4,
    title: 'Supervised Work',
    desc: '3-state IWA badge shows Authorised, Under Supervision, or Not Authorised for every person.',
    icon: ShieldCheck,
  },
  {
    step: 5,
    title: 'Prove Compliance',
    desc: 'One-click evidence access, complete audit trails, and readiness scores for any inspection.',
    icon: FileCheck,
  },
]

const personas = [
  {
    title: 'Employee',
    subtitle: 'James Fletcher — Welding / Fabrication Technician',
    quote:
      'I know exactly what competencies I need, what is expiring, and whether I am authorised for independent work.',
    features: [
      'Personal Readiness Profile with 5 tabs',
      'My Role Requirements, Open Gaps, Evidence, Authorisations, Awareness Actions',
      'IWA badge: Authorised / Under Supervision / Not Authorised',
      'Acknowledge awareness topics and track pending count',
      'View and upload evidence records',
    ],
    defaultRoute: '/my-competencies',
  },
  {
    title: 'Supervisor',
    subtitle: 'Tom Bradley — Production Supervisor',
    quote:
      "I can see my entire team's competence status and take immediate action on gaps and expirations.",
    features: [
      'Dashboard with team filters and KPI charts',
      'Skills Matrix with 3 modes (Requirements / Current / Gap Analysis)',
      'Training Needs — approve, schedule, resolve, verify effectiveness',
      'Awareness Topics — issue and track team acknowledgements',
      'Person detail drawer with full competence history',
    ],
    defaultRoute: '/dashboard',
  },
  {
    title: 'Manager',
    subtitle: 'David Clarke — Production Manager',
    quote:
      'I have full operational visibility — who is compliant, who needs attention, and where the risks are.',
    features: [
      'Dashboard with Gap by Department, Gap by Category, Expiry Trend charts',
      'Skills Matrix with vacancy rows and critical activity filter',
      'People — browse/search employees, view competence records',
      'Roles — configure requirements, risk levels, gating rules',
      'Training Needs — track source-traced gap closure workflows',
    ],
    defaultRoute: '/dashboard',
  },
  {
    title: 'QHSE',
    subtitle: 'Helen Marsh — QHSE Coordinator',
    quote:
      'When auditors ask for competence records, I produce everything in seconds with full traceability.',
    features: [
      'Competency Library — manage items, categories, risk levels, evidence rules',
      'Roles — review and maintain role requirement sets',
      'Training Needs — link NCRs, audits, incidents to gap closure',
      'Awareness Topics — manage controlled communications with acknowledgement tracking',
      'Dashboard — compliance health, source breakdown, readiness metrics',
    ],
    defaultRoute: '/dashboard',
  },
  {
    title: 'HR Admin',
    subtitle: 'Sarah Bennett — HR / Training Coordinator',
    quote:
      'Everything is in one place — onboarding, training records, expiry tracking, and audit-ready documentation.',
    features: [
      'Broad access to operational platform features',
      'People — manage employee records and ERP integration',
      'Competency Library — configure competency catalogue',
      'No admin-only pages under current routing policy',
      'Person switcher to demo any role perspective',
    ],
    defaultRoute: '/dashboard',
  },
  {
    title: 'Leadership Viewer',
    subtitle: 'Robert Ashford — Plant Director',
    quote:
      'I see organisation-wide readiness at a glance without needing to ask anyone for reports.',
    features: [
      'Dashboard — high-level KPIs and trend charts',
      'Skills Matrix — review-only organisational competence view',
      'Roles — view role requirements and readiness metrics',
      'No edit capabilities — pure visibility and oversight',
      'Filter by department, role, or business unit',
    ],
    defaultRoute: '/dashboard',
  },
  {
    title: 'System Admin',
    subtitle: 'Layla Hassan — Platform Administrator',
    quote:
      'I can reach every route, manage admin-only configuration, and validate the full demo without role-based blind spots.',
    features: [
      'Full platform access across all sidebar groups',
      'Reference Lists — manage controlled values and configuration lists',
      'ERP Connection — validate connectivity and demo integration status',
      'Can open the same operational views as managers, QHSE, and HR Admin',
      'Best persona for showing the complete navigation model end-to-end',
    ],
    defaultRoute: '/admin/reference-lists',
  },
]

const interactiveCapabilities = [
  {
    role: 'Employee',
    icon: UserCircle2,
    color: 'cap-employee',
    items: [
      {
        icon: Award,
        text: 'Readiness Profile — 5 tabs covering role requirements, gaps, evidence, authorisations, and awareness actions',
      },
      {
        icon: ShieldCheck,
        text: 'IWA Badge — see your Independent Work Authorisation status at a glance',
      },
      {
        icon: Bell,
        text: 'Awareness Topics — acknowledge assigned safety briefings, procedure revisions, and quality alerts',
      },
      {
        icon: FileText,
        text: 'Evidence Tab — view uploaded certificates, qualifications, and assessment records',
      },
    ],
  },
  {
    role: 'Supervisor',
    icon: Eye,
    color: 'cap-supervisor',
    items: [
      {
        icon: LayoutDashboard,
        text: 'Dashboard — filter by My Team, view KPI cards and gap analysis charts',
      },
      {
        icon: Table2,
        text: 'Skills Matrix — review team competence, drill into cell detail, see supervision counts',
      },
      {
        icon: GraduationCap,
        text: 'Training Needs — approve identified needs, schedule interventions, track effectiveness',
      },
      {
        icon: Megaphone,
        text: 'Awareness Topics — issue topics to target audiences, track acknowledgement progress',
      },
    ],
  },
  {
    role: 'Manager',
    icon: Briefcase,
    color: 'cap-manager',
    items: [
      {
        icon: BarChart3,
        text: 'Dashboard — department-level charts: Gap by Dept, Gap by Category, Expiry Trend, Source Breakdown',
      },
      {
        icon: Users,
        text: 'People — browse employees, open detail drawer with 8 sections of competence data',
      },
      {
        icon: Target,
        text: 'Roles — configure role requirements, risk levels, gating rules, linked awareness topics',
      },
      {
        icon: ClipboardCheck,
        text: 'Skills Matrix — vacancy rows, critical activity filter, team readiness summaries',
      },
    ],
  },
  {
    role: 'QHSE',
    icon: ShieldCheck,
    color: 'cap-qhse',
    items: [
      {
        icon: Library,
        text: 'Competency Library — manage items with AM fields: safety/quality critical, departments, evidence types',
      },
      {
        icon: Zap,
        text: 'Training Needs — 9 source types from NCR to incident, 7-stage workflow with effectiveness checks',
      },
      {
        icon: Megaphone,
        text: 'Awareness Topics — 8 topic types, 6-stage workflow, delivery methods, audience targeting',
      },
      {
        icon: FileCheck,
        text: 'Roles — audit role requirement sets, view readiness metrics and risk summaries',
      },
    ],
  },
  {
    role: 'HR Admin',
    icon: UserCog,
    color: 'cap-admin',
    items: [
      { icon: Users, text: 'People — full employee management, ERP sync, person detail drawer' },
      {
        icon: Library,
        text: 'Competency Library — configure full catalogue with filters and AM-specific fields',
      },
      {
        icon: Megaphone,
        text: 'Awareness Topics — manage controlled communications, audience targeting, and acknowledgements',
      },
      {
        icon: SwitchCamera,
        text: 'Persona Switcher — demo the platform from any of the 7 role perspectives',
      },
    ],
  },
  {
    role: 'Leadership',
    icon: Eye,
    color: 'cap-leadership',
    items: [
      {
        icon: LayoutDashboard,
        text: 'Dashboard — high-level KPIs, trend charts, department and role readiness',
      },
      {
        icon: Table2,
        text: 'Skills Matrix — read-only view of organisational competence and gap analysis',
      },
      { icon: Briefcase, text: 'Roles — view role requirements and team readiness scores' },
      { icon: BarChart3, text: 'No edit access — pure visibility for governance and oversight' },
    ],
  },
  {
    role: 'System Admin',
    icon: Lock,
    color: 'cap-admin',
    items: [
      {
        icon: ListChecks,
        text: 'Reference Lists — manage controlled values, assessment methods, evidence types, and status options',
      },
      {
        icon: Database,
        text: 'ERP Connection — test integration health, validate credentials, and review sync status',
      },
      {
        icon: SwitchCamera,
        text: 'Full demo access — every sidebar link is available from this persona',
      },
      {
        icon: LayoutDashboard,
        text: 'Operational oversight — retains access to dashboard, matrix, people, roles, library, training, and awareness views',
      },
    ],
  },
]

const outcomes = [
  { metric: '90%', label: 'Reduction in manual tracking time' },
  { metric: '0', label: 'Surprise audit findings' },
  { metric: '100%', label: 'Visibility into authorisation status' },
  { metric: '24/7', label: 'Compliance confidence' },
]

const statusReference = [
  { status: 'Valid', chip: 'chip-valid', desc: 'Competency is current and within validity period' },
  {
    status: 'Expiring',
    chip: 'chip-expiring',
    desc: 'Approaching expiry (within configured threshold, typically 30 days)',
  },
  {
    status: 'Expired',
    chip: 'chip-expired',
    desc: 'Past the validity date — requires immediate action',
  },
  {
    status: 'Required',
    chip: 'chip-required',
    desc: 'Assigned but not yet started — no evidence or assessment recorded',
  },
  {
    status: 'In Progress',
    chip: 'chip-in-progress',
    desc: 'Training or assessment actively underway',
  },
  {
    status: 'Under Supervision',
    chip: 'chip-under-supervision',
    desc: 'Competent only under supervised conditions — not independently authorised',
  },
  {
    status: 'Partially Met',
    chip: 'chip-partially-met',
    desc: 'Some requirements met but full competence not yet demonstrated',
  },
  {
    status: 'Reassessment Due',
    chip: 'chip-reassessment-due',
    desc: 'Scheduled reassessment window has opened',
  },
  {
    status: 'N/A',
    chip: 'chip-na',
    desc: 'Not applicable to this person/role — exempted with justification',
  },
]

const keyConcepts = [
  {
    title: 'Competency Types',
    icon: Layers,
    items: [
      'Skill',
      'Training',
      'Certification',
      'Awareness Topic',
      'OJT / Coaching',
      'Procedure Briefing',
      'External Qualification',
      'Equipment Qualification',
    ],
  },
  {
    title: 'Training Need Sources',
    icon: Zap,
    items: [
      'Competence Gap',
      'NCR / CAPA',
      'Audit Finding',
      'Procedure Change',
      'New Equipment',
      'New Starter',
      'Expiry Renewal',
      'Manager Request',
      'Incident / Near Miss',
    ],
  },
  {
    title: 'Awareness Topic Types',
    icon: Megaphone,
    items: [
      'Procedure Revision',
      'Safety Briefing',
      'Quality Alert',
      'Customer Requirement',
      'Management System Update',
      'Toolbox Talk',
      'New Equipment Intro',
      'Incident Learning',
    ],
  },
  {
    title: 'Risk Levels',
    icon: AlertTriangle,
    items: [
      'Critical — gating, assessor required, immediate action on expiry',
      'High — gating, assessor recommended, urgent action',
      'Medium — may gate, standard assessment, planned renewal',
      'Low — awareness-level, self-assessment OK, flexible timing',
    ],
  },
]

const platformPages = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['All Roles'],
    desc: 'Real-time compliance health with 8 KPI cards, 5 chart types (Gap by Department, Gap by Category, Source Breakdown, Role Readiness, Expiry Trend), and 4 AM-specific list sections. Filter by department, role, or My Team.',
    features: [
      'Gap analysis charts with drill-down',
      'Expiry countdown and trend tracking',
      'Supervised work status summary',
      'Click-through widgets to detail pages',
    ],
  },
  {
    name: 'My Competence Profile',
    path: '/my-competencies',
    icon: Award,
    roles: ['Employee', 'Supervisor', 'Manager'],
    desc: 'Personal readiness profile with 5 tabs: My Role Requirements, My Open Gaps, My Evidence, My Authorisations, and My Awareness Actions. Shows IWA badge status.',
    features: [
      'Role requirements with status indicators',
      'Gap list with linked training needs',
      'Evidence records with review status',
      'Authorisation status per competency',
      'Pending awareness actions',
    ],
  },
  {
    name: 'Skills Matrix',
    path: '/skills-matrix',
    icon: Table2,
    roles: ['Supervisor', 'Manager', 'QHSE', 'HR Admin', 'Leadership'],
    desc: 'Organisational competence matrix with 3 viewing modes: Requirements, Current Status, and Gap Analysis. Includes vacancy rows, team readiness summaries, and critical activity filter.',
    features: [
      '3-mode toggle (Requirements / Current / Gap)',
      'Status legend with colour coding',
      'Cell drill-down detail sheet',
      'Supervised count per person',
      'Vacancy rows for unfilled positions',
      'CSV export for offline analysis',
    ],
  },
  {
    name: 'People',
    path: '/people',
    icon: UserCircle2,
    roles: ['Manager', 'HR Admin'],
    desc: 'Browse and search employees with person detail drawer containing 8 sections: Profile, Role Requirements, Competence Records, Evidence, Training History, Awareness, Notes, and Activity.',
    features: [
      'Readiness columns (compliant %, gap count)',
      'Person detail drawer with 8 sections',
      'Evidence record viewer',
      'Training history timeline',
      'ERP employee data integration',
    ],
  },
  {
    name: 'Roles',
    path: '/roles',
    icon: Briefcase,
    roles: ['Manager', 'QHSE', 'HR Admin', 'Leadership'],
    desc: 'Enriched role list with readiness metrics and risk badges. Role detail view includes assigned people, risk summary, requirement configuration, and linked awareness topics.',
    features: [
      'Role readiness score and trend',
      'Risk level badges per requirement',
      'Assigned people tab',
      'Requirement editing (risk, gating, type)',
      'Linked awareness section',
    ],
  },
  {
    name: 'Competency Library',
    path: '/competency-library',
    icon: Library,
    roles: ['QHSE', 'HR Admin'],
    desc: 'Manage the reusable competency catalogue with AM-specific fields: safety/quality critical flags, applicable departments and roles, evidence types, validity intervals, and internal/external classification.',
    features: [
      'AM-specific filters and fields',
      'Category-based organisation',
      'Risk level and evidence type defaults',
      'Internal/External classification',
      'Safety-critical and quality-critical flags',
      'Provider and linked document references',
    ],
  },
  {
    name: 'Training & Gap Actions',
    path: '/training-needs',
    icon: GraduationCap,
    roles: ['Supervisor', 'Manager', 'QHSE', 'HR Admin'],
    desc: 'Source-tracked training needs with 9 source types and a 7-stage workflow (Identified, Approved, Scheduled, In Progress, Evidence Submitted, Effectiveness Review, Closed). Supports NCR/CAPA demo stories.',
    features: [
      '9 source types with reference linking',
      '7-stage workflow stepper',
      '7 intervention types',
      'Effectiveness check section',
      'Priority levels (Critical, High, Medium, Low)',
      'Source-to-close traceability',
    ],
  },
  {
    name: 'Awareness & Communications',
    path: '/awareness-topics',
    icon: Megaphone,
    roles: ['All Roles'],
    desc: 'Controlled awareness communications with 8 topic types and 6-stage workflow. Employees acknowledge assigned topics; admins manage audience targeting and delivery methods.',
    features: [
      '8 topic types (safety, quality, procedure, etc.)',
      '6-stage workflow (Drafted → Closed)',
      '5 delivery methods',
      'Required audience targeting by role/department',
      'Acknowledgement tracking and verification',
      'Topic creation form sheet',
    ],
  },
  {
    name: 'Reference Lists',
    path: '/admin/reference-lists',
    icon: ListChecks,
    roles: ['Admin'],
    desc: 'Manage controlled value lists: risk levels, status codes, training types, assessment methods, evidence types, and responsible parties. Key system configuration point.',
    features: [
      'Risk level management',
      'Status code configuration',
      'Training type and assessment method lists',
      'Evidence type catalogue',
      'Responsible party definitions',
    ],
  },
  {
    name: 'ERP Connection',
    path: '/admin/erp-connection',
    icon: Database,
    roles: ['Admin'],
    desc: 'Test ERP connectivity, validate credentials, and view integration status. Manages the connection to the external HR/ERP system for employee data synchronisation.',
    features: [
      'Connection health check',
      'Credential validation',
      'Sync status dashboard',
      'Demo environment configuration',
    ],
  },
]

const demoFeatures = [
  {
    name: 'Dashboard',
    desc: 'Real-time compliance health with charts and KPIs',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'My Competence Profile',
    desc: 'Personal readiness profile with 5 tabs and IWA badge',
    path: '/my-competencies',
    icon: Award,
  },
  {
    name: 'Skills Matrix',
    desc: '3-mode matrix with vacancy rows and gap analysis',
    path: '/skills-matrix',
    icon: Table2,
  },
  {
    name: 'People',
    desc: 'Employee records with 8-section detail drawer',
    path: '/people',
    icon: UserCircle2,
  },
  {
    name: 'Roles',
    desc: 'Role requirements, readiness metrics, risk badges',
    path: '/roles',
    icon: Briefcase,
  },
  {
    name: 'Competency Library',
    desc: 'AM-specific competency catalogue management',
    path: '/competency-library',
    icon: Library,
  },
  {
    name: 'Training & Gap Actions',
    desc: 'Source-tracked needs with 7-stage workflow',
    path: '/training-needs',
    icon: GraduationCap,
  },
  {
    name: 'Awareness & Communications',
    desc: 'Controlled comms with acknowledgement tracking',
    path: '/awareness-topics',
    icon: Megaphone,
  },
  {
    name: 'Reference Lists',
    desc: 'System configuration for risk levels, statuses, and types',
    path: '/admin/reference-lists',
    icon: ListChecks,
  },
  {
    name: 'ERP Connection',
    desc: 'Integration status and connectivity check',
    path: '/admin/erp-connection',
    icon: Database,
  },
]

const visiblePlatformPages = computed(() =>
  platformPages.filter((page) => canRoleAccessPath(authStore.userRole, page.path)),
)

const visibleDemoFeatures = computed(() =>
  demoFeatures.filter((feature) => canRoleAccessPath(authStore.userRole, feature.path)),
)

const handleExplore = (path: string) => {
  router.push(path)
}

const handleStartDemo = () => {
  toast.success('Welcome to the Demo', {
    description: 'Explore the dashboard to see compliance health at a glance.',
  })
  router.push('/dashboard')
}
</script>

<template>
  <div class="guide-root">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Platform User Manual</h1>
      <p class="page-subtitle">
        Complete guide to the Competence Management System — every page, feature, status, and
        concept explained
      </p>
    </div>

    <!-- Section: The Challenge -->
    <section class="guide-section">
      <div class="guide-section-label">The Problem</div>
      <h2 class="guide-section-title">Real-World Challenges in Manufacturing</h2>
      <p class="guide-section-intro">
        In advanced manufacturing environments, competence management failures have direct safety,
        quality, and compliance consequences.
      </p>

      <div class="guide-challenges-grid">
        <Card v-for="challenge in challenges" :key="challenge.title" class="guide-challenge-card">
          <CardContent class="guide-challenge-content">
            <div class="guide-challenge-icon" aria-hidden="true">
              <component :is="challenge.icon" class="icon-sm" />
            </div>
            <div>
              <h3 class="guide-challenge-title">{{ challenge.title }}</h3>
              <p class="guide-challenge-desc">{{ challenge.desc }}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="guide-callout guide-callout-warning" role="note">
        <AlertTriangle class="icon-sm" aria-hidden="true" />
        <p>
          These aren't just inconveniences. They're <strong>risks</strong> — to safety, quality,
          compliance, and operational efficiency. This platform solves them.
        </p>
      </div>
    </section>

    <!-- Section: The Vision -->
    <section class="guide-section">
      <div class="guide-panel">
        <div class="guide-section-label">The Solution</div>
        <h2 class="guide-section-title">Complete Visibility, Zero Guesswork</h2>

        <div class="guide-vision-grid">
          <!-- KPI Preview Card -->
          <Card class="guide-vision-preview">
            <CardHeader>
              <div class="guide-vision-preview-header">
                <CardTitle>Organisation Health</CardTitle>
                <span class="badge badge-success">98% Compliant</span>
              </div>
            </CardHeader>
            <CardContent>
              <div class="kpi-grid">
                <div class="kpi-card">
                  <div class="kpi-card-header">
                    <span class="kpi-card-title">Valid</span>
                    <Check class="kpi-card-icon" aria-hidden="true" />
                  </div>
                  <div class="kpi-card-value">1,247</div>
                  <div class="kpi-card-change kpi-card-change-positive">Competencies</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-card-header">
                    <span class="kpi-card-title">Under Supervision</span>
                    <ShieldCheck class="kpi-card-icon" aria-hidden="true" />
                  </div>
                  <div class="kpi-card-value">14</div>
                  <div class="kpi-card-change">Supervised only</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-card-header">
                    <span class="kpi-card-title">Expiring</span>
                    <Clock class="kpi-card-icon" aria-hidden="true" />
                  </div>
                  <div class="kpi-card-value">12</div>
                  <div class="kpi-card-change kpi-card-change-negative">Within 30 days</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-card-header">
                    <span class="kpi-card-title">Expired</span>
                    <AlertTriangle class="kpi-card-icon" aria-hidden="true" />
                  </div>
                  <div class="kpi-card-value">0</div>
                  <div class="kpi-card-change">None outstanding</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Vision Text -->
          <div class="guide-vision-text">
            <h3 class="guide-vision-heading">How This Platform Helps</h3>
            <p class="guide-vision-desc">
              A single screen shows exactly where every employee stands — no digging through files,
              no wondering if certifications expired last month. The system tracks competence from
              requirement to evidence to authorisation.
            </p>
            <ul class="guide-vision-list" role="list">
              <li>
                <Check class="icon-xs" aria-hidden="true" /> Real-time status for every person and
                competency
              </li>
              <li>
                <Check class="icon-xs" aria-hidden="true" /> Automatic expiry notifications and
                countdowns
              </li>
              <li>
                <Check class="icon-xs" aria-hidden="true" /> 3-state IWA badge (Authorised /
                Supervised / Not Authorised)
              </li>
              <li>
                <Check class="icon-xs" aria-hidden="true" /> Source-tracked training needs from gap
                to closure
              </li>
              <li>
                <Check class="icon-xs" aria-hidden="true" /> Controlled awareness communications
                with acknowledgement tracking
              </li>
              <li>
                <Check class="icon-xs" aria-hidden="true" /> Role-based access for 7 distinct user
                personas
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Section: How It Works -->
    <section class="guide-section">
      <div class="guide-section-label">The Workflow</div>
      <h2 class="guide-section-title">How It Works</h2>
      <p class="guide-section-intro">
        A proven 5-step workflow that transforms scattered records into a compliant, auditable
        competence management system.
      </p>

      <div class="guide-journey">
        <div v-for="(step, index) in journey" :key="step.step" class="guide-journey-step">
          <div
            class="guide-journey-connector"
            v-if="index < journey.length - 1"
            aria-hidden="true"
          />
          <div class="guide-journey-num" aria-hidden="true">{{ step.step }}</div>
          <component :is="step.icon" class="guide-journey-icon" aria-hidden="true" />
          <h3 class="guide-journey-title">{{ step.title }}</h3>
          <p class="guide-journey-desc">{{ step.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Section: Status Reference -->
    <section class="guide-section">
      <div class="guide-panel">
        <div class="guide-section-label">Status Model</div>
        <h2 class="guide-section-title">Competence Status Reference</h2>
        <p class="guide-section-intro">
          Every competency record has a status. This table explains each status, its visual
          indicator, and what it means for the person and the organisation.
        </p>

        <div class="guide-status-grid">
          <div v-for="ref in statusReference" :key="ref.status" class="guide-status-row">
            <span :class="['chip', ref.chip]">{{ ref.status }}</span>
            <span class="guide-status-desc">{{ ref.desc }}</span>
          </div>
        </div>

        <div class="guide-callout guide-callout-success" role="note">
          <Info class="icon-sm" aria-hidden="true" />
          <p>
            Statuses are <strong>colour-coded</strong> throughout the platform — in the Skills
            Matrix, dashboard widgets, person detail views, and readiness profiles. Derived statuses
            (<strong>Expiring</strong>, <strong>Expired</strong>) are computed automatically from
            validity dates.
          </p>
        </div>
      </div>
    </section>

    <!-- Section: Key Concepts -->
    <section class="guide-section">
      <div class="guide-section-label">Key Concepts</div>
      <h2 class="guide-section-title">Platform Glossary</h2>
      <p class="guide-section-intro">
        The platform organises competence data around several core concepts. Understanding these
        will help you use every feature effectively.
      </p>

      <div class="guide-concepts-grid">
        <Card v-for="concept in keyConcepts" :key="concept.title" class="guide-concept-card">
          <CardHeader>
            <div class="guide-concept-header">
              <component :is="concept.icon" class="guide-concept-icon" aria-hidden="true" />
              <CardTitle class="guide-concept-title">{{ concept.title }}</CardTitle>
            </div>
          </CardHeader>
          <CardContent class="guide-concept-content">
            <ul class="guide-concept-list" role="list">
              <li v-for="item in concept.items" :key="item">
                <ChevronRight class="icon-xs" aria-hidden="true" />
                {{ item }}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- Section: Personas -->
    <section class="guide-section">
      <div class="guide-panel">
        <div class="guide-section-label">Who It's For</div>
        <h2 class="guide-section-title">7 Role-Based Perspectives</h2>
        <p class="guide-section-intro">
          The platform adapts to 7 distinct user roles. Use the persona switcher in the top bar to
          explore each perspective.
        </p>

        <div class="guide-personas-grid-6">
          <Card v-for="persona in personas" :key="persona.title" class="guide-persona-card">
            <CardHeader>
              <CardTitle>{{ persona.title }}</CardTitle>
              <CardDescription class="guide-persona-subtitle">{{
                persona.subtitle
              }}</CardDescription>
              <CardDescription class="guide-persona-quote">"{{ persona.quote }}"</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent class="guide-persona-content">
              <ul class="guide-feature-list" role="list">
                <li v-for="feature in persona.features" :key="feature">
                  <ChevronRight class="icon-xs" aria-hidden="true" />
                  {{ feature }}
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <!-- Section: Interactive Capabilities -->
    <section class="guide-section">
      <div class="guide-section-label">Capabilities by Role</div>
      <h2 class="guide-section-title">What Each Role Can Do</h2>
      <p class="guide-section-intro">
        Each persona has tailored capabilities. Switch personas using the role switcher to unlock
        each experience.
      </p>

      <div class="guide-caps-grid-6">
        <div
          v-for="cap in interactiveCapabilities"
          :key="cap.role"
          class="guide-cap-card"
          :class="cap.color"
        >
          <div class="guide-cap-header">
            <component :is="cap.icon" class="guide-cap-role-icon" aria-hidden="true" />
            <span class="guide-cap-role">{{ cap.role }}</span>
          </div>
          <ul class="guide-cap-list" role="list">
            <li v-for="item in cap.items" :key="item.text">
              <component :is="item.icon" class="guide-cap-item-icon" aria-hidden="true" />
              <span>{{ item.text }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Section: Page-by-Page Guide -->
    <section class="guide-section">
      <div class="guide-section-label">Page Guide</div>
      <h2 class="guide-section-title">Every Page Explained</h2>
      <p class="guide-section-intro">
        Detailed descriptions of each platform page — what it shows, who can access it, and key
        features to look for.
      </p>

      <div class="guide-pages-grid">
        <Card
          v-for="page in visiblePlatformPages"
          :key="page.path"
          class="guide-page-card"
          role="button"
          tabindex="0"
          :aria-label="`Explore ${page.name}`"
          @click="handleExplore(page.path)"
          @keydown.enter="handleExplore(page.path)"
          @keydown.space.prevent="handleExplore(page.path)"
        >
          <CardHeader>
            <div class="guide-page-header-row">
              <div class="guide-page-icon-wrap" aria-hidden="true">
                <component :is="page.icon" class="icon-sm" />
              </div>
              <div class="guide-page-title-wrap">
                <CardTitle class="guide-page-title">{{ page.name }}</CardTitle>
                <div class="guide-page-roles">
                  <span
                    v-for="role in page.roles"
                    :key="role"
                    class="badge badge-neutral guide-page-role-badge"
                    >{{ role }}</span
                  >
                </div>
              </div>
              <ArrowRight class="guide-page-arrow" aria-hidden="true" />
            </div>
            <CardDescription class="guide-page-desc">{{ page.desc }}</CardDescription>
          </CardHeader>
          <CardContent class="guide-page-features">
            <ul class="guide-feature-list" role="list">
              <li v-for="feat in page.features" :key="feat">
                <Check class="icon-xs" aria-hidden="true" />
                {{ feat }}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- Section: Outcomes -->
    <section class="guide-section">
      <div class="guide-section-label">The Impact</div>
      <h2 class="guide-section-title">What Success Looks Like</h2>

      <div class="guide-outcomes-grid">
        <div v-for="outcome in outcomes" :key="outcome.label" class="guide-outcome-card">
          <span class="guide-outcome-metric">{{ outcome.metric }}</span>
          <span class="guide-outcome-label">{{ outcome.label }}</span>
        </div>
      </div>

      <div class="guide-callout guide-callout-success" role="note">
        <Check class="icon-sm" aria-hidden="true" />
        <p>
          This isn't just about software. It's about <strong>protecting your people</strong>,
          <strong>simplifying your work</strong>, and knowing everything is under control.
        </p>
      </div>
    </section>

    <!-- Section: Demo Features -->
    <section class="guide-section">
      <div class="guide-section-label">Explore</div>
      <h2 class="guide-section-title guide-section-title-center">Ready to Dive In?</h2>
      <p class="guide-section-intro guide-section-intro-center">
        Click any page to explore it live. Use the persona switcher to see the platform from
        different perspectives.
      </p>

      <div class="guide-demo-grid">
        <Card
          v-for="feature in visibleDemoFeatures"
          :key="feature.path"
          class="guide-demo-card"
          role="button"
          tabindex="0"
          :aria-label="`Explore ${feature.name}`"
          @click="handleExplore(feature.path)"
          @keydown.enter="handleExplore(feature.path)"
          @keydown.space.prevent="handleExplore(feature.path)"
        >
          <CardContent class="guide-demo-content">
            <div class="guide-demo-icon-wrap" aria-hidden="true">
              <component :is="feature.icon" class="icon-sm" />
            </div>
            <div class="guide-demo-text">
              <h4 class="guide-demo-title">{{ feature.name }}</h4>
              <p class="guide-demo-desc">{{ feature.desc }}</p>
            </div>
            <ArrowRight class="guide-demo-arrow" aria-hidden="true" />
          </CardContent>
        </Card>
      </div>

      <div class="guide-cta">
        <Button @click="handleStartDemo" aria-label="Start with Dashboard">
          Start with Dashboard
          <ArrowRight class="icon-sm" aria-hidden="true" />
        </Button>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ─── Root ─────────────────────────────────────────────── */
.guide-root {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

/* ─── Section ──────────────────────────────────────────── */
.guide-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.guide-section-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brand-primary);
}

.guide-section-title {
  font-size: 1.375rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0;
}

.guide-section-title-center {
  text-align: center;
}

.guide-section-intro {
  font-size: 0.9375rem;
  color: var(--text-body);
  margin: 0;
  line-height: 1.6;
}

.guide-section-intro-center {
  text-align: center;
}

/* ─── Panel (subtle background block) ─────────────────── */
.guide-panel {
  background: var(--bg-subtle);
  border: var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* ─── Callout ──────────────────────────────────────────── */
.guide-callout {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-md);
  border-left: 3px solid transparent;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.guide-callout p {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--text-body);
  line-height: 1.5;
}

.guide-callout svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.guide-callout-warning {
  background: oklch(from var(--brand-critical) l c h / 0.05);
  border-left-color: var(--brand-critical);
  color: var(--brand-critical);
}

.guide-callout-warning p {
  color: var(--text-body);
}

.guide-callout-success {
  background: oklch(from var(--brand-success) l c h / 0.07);
  border-left-color: var(--brand-success);
  color: var(--brand-success);
}

.guide-callout-success p {
  color: var(--text-body);
}

/* ─── Challenges Grid ──────────────────────────────────── */
.guide-challenges-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.guide-challenge-card :deep(.card-content) {
  padding: var(--space-md);
}

.guide-challenge-content {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
}

.guide-challenge-icon {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  background: oklch(from var(--brand-critical) l c h / 0.08);
  color: var(--brand-critical);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.guide-challenge-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0 0 var(--space-xs) 0;
}

.guide-challenge-desc {
  font-size: 0.8125rem;
  color: var(--text-caption);
  margin: 0;
  line-height: 1.5;
}

/* ─── Vision ───────────────────────────────────────────── */
.guide-vision-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xl);
  align-items: center;
}

.guide-vision-preview :deep(.card-content),
.guide-vision-preview :deep(.card-header) {
  padding: var(--space-md);
}

.guide-vision-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.guide-vision-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.guide-vision-heading {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0;
}

.guide-vision-desc {
  font-size: 0.9375rem;
  color: var(--text-body);
  margin: 0;
  line-height: 1.6;
}

.guide-vision-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.guide-vision-list li {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.875rem;
  color: var(--text-body);
}

.guide-vision-list li svg {
  color: var(--brand-success);
  flex-shrink: 0;
}

/* ─── Journey ──────────────────────────────────────────── */
.guide-journey {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0;
  position: relative;
}

.guide-journey-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-md);
  position: relative;
}

.guide-journey-connector {
  position: absolute;
  top: calc(var(--space-md) + 12px);
  right: calc(-50% + var(--space-md));
  width: calc(100% - var(--space-xl));
  height: 1px;
  background: var(--brand-primary);
  opacity: 0.25;
  z-index: 0;
}

.guide-journey-num {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--brand-primary);
  color: oklch(1 0 0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  margin-bottom: var(--space-sm);
}

.guide-journey-icon {
  width: 18px;
  height: 18px;
  color: var(--brand-primary);
  margin-bottom: var(--space-xs);
}

.guide-journey-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0 0 var(--space-xs) 0;
}

.guide-journey-desc {
  font-size: 0.75rem;
  color: var(--text-caption);
  margin: 0;
  line-height: 1.5;
}

/* ─── Status Reference ─────────────────────────────────── */
.guide-status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm) var(--space-lg);
}

.guide-status-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) 0;
}

.guide-status-desc {
  font-size: 0.8125rem;
  color: var(--text-body);
  line-height: 1.4;
}

/* ─── Key Concepts ─────────────────────────────────────── */
.guide-concepts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.guide-concept-card :deep(.card-header),
.guide-concept-card :deep(.card-content) {
  padding: var(--space-md);
}

.guide-concept-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.guide-concept-icon {
  width: 18px;
  height: 18px;
  color: var(--brand-primary);
  flex-shrink: 0;
}

.guide-concept-title {
  font-size: 0.9375rem !important;
}

.guide-concept-content {
  padding-top: 0 !important;
}

.guide-concept-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.guide-concept-list li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-xs);
  font-size: 0.8125rem;
  color: var(--text-body);
  line-height: 1.5;
}

.guide-concept-list li svg {
  color: var(--brand-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

/* ─── Personas ─────────────────────────────────────────── */
.guide-personas-grid-6 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
}

.guide-persona-card :deep(.card-content),
.guide-persona-card :deep(.card-header) {
  padding: var(--space-md);
}

.guide-persona-content {
  padding-top: var(--space-md) !important;
}

.guide-persona-subtitle {
  font-size: 0.75rem;
  color: var(--brand-primary);
  font-weight: 500;
  margin-top: var(--space-xs);
}

.guide-persona-quote {
  font-style: italic;
  margin-top: var(--space-xs);
  line-height: 1.5;
}

.guide-feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.guide-feature-list li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-xs);
  font-size: 0.8125rem;
  color: var(--text-body);
  line-height: 1.4;
}

.guide-feature-list li svg {
  color: var(--brand-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

/* ─── Outcomes ─────────────────────────────────────────── */
.guide-outcomes-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}

.guide-outcome-card {
  background: var(--bg-surface);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-lg) var(--space-md);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  border-top: 3px solid var(--brand-primary);
}

.guide-outcome-metric {
  font-size: 2rem;
  font-weight: 700;
  color: var(--brand-primary);
  letter-spacing: -0.03em;
  line-height: 1;
}

.guide-outcome-label {
  font-size: 0.8125rem;
  color: var(--text-body);
  line-height: 1.4;
}

/* ─── Capabilities section ─────────────────────────────── */
.guide-caps-grid-6 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
}

.guide-cap-card {
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  border: 1px solid transparent;
}

.cap-employee {
  background: var(--bg-subtle);
  border-color: var(--border);
}

.cap-supervisor {
  background: var(--bg-subtle);
  border-color: var(--border);
}

.cap-manager {
  background: oklch(0 0 0 / 0.04);
  border-color: oklch(0 0 0 / 0.15);
}

.cap-qhse {
  background: var(--bg-subtle);
  border-color: var(--border);
}

.cap-admin {
  background: var(--bg-subtle);
  border-color: var(--border);
}

.cap-leadership {
  background: var(--bg-subtle);
  border-color: var(--border);
}

.guide-cap-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.guide-cap-role-icon {
  width: 18px;
  height: 18px;
}

.cap-employee .guide-cap-role-icon {
  color: var(--brand-success);
}
.cap-supervisor .guide-cap-role-icon {
  color: oklch(0.55 0.15 200);
}
.cap-manager .guide-cap-role-icon {
  color: var(--brand-primary);
}
.cap-qhse .guide-cap-role-icon {
  color: oklch(0.62 0.18 30);
}
.cap-admin .guide-cap-role-icon {
  color: var(--brand-warning);
}
.cap-leadership .guide-cap-role-icon {
  color: oklch(0.55 0.12 290);
}

.guide-cap-role {
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.cap-employee .guide-cap-role {
  color: var(--brand-success);
}
.cap-supervisor .guide-cap-role {
  color: oklch(0.55 0.15 200);
}
.cap-manager .guide-cap-role {
  color: var(--brand-primary);
}
.cap-qhse .guide-cap-role {
  color: oklch(0.62 0.18 30);
}
.cap-admin .guide-cap-role {
  color: var(--brand-warning);
}
.cap-leadership .guide-cap-role {
  color: oklch(0.55 0.12 290);
}

.guide-cap-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.guide-cap-list li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-xs);
  font-size: 0.8125rem;
  color: var(--text-body);
  line-height: 1.4;
}

.guide-cap-item-icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--text-caption);
}

/* ─── Page-by-Page Guide ──────────────────────────────── */
.guide-pages-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.guide-page-card {
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.guide-page-card:hover,
.guide-page-card:focus-visible {
  border-color: var(--brand-primary);
  box-shadow: var(--shadow-elevated);
  outline: none;
}

.guide-page-card :deep(.card-header),
.guide-page-card :deep(.card-content) {
  padding: var(--space-md);
}

.guide-page-header-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  width: 100%;
}

.guide-page-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: oklch(0 0 0 / 0.06);
  color: var(--brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.guide-page-title-wrap {
  flex: 1;
  min-width: 0;
}

.guide-page-title {
  font-size: 0.9375rem !important;
  margin: 0 !important;
}

.guide-page-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.guide-page-role-badge {
  font-size: 0.625rem;
  padding: 1px 6px;
  border-radius: var(--radius-full);
}

.guide-page-arrow {
  width: 16px;
  height: 16px;
  color: var(--text-caption);
  flex-shrink: 0;
  transition:
    transform 0.15s ease,
    color 0.15s ease;
}

.guide-page-card:hover .guide-page-arrow,
.guide-page-card:focus-visible .guide-page-arrow {
  transform: translateX(4px);
  color: var(--brand-primary);
}

.guide-page-desc {
  font-size: 0.8125rem;
  line-height: 1.5;
  margin-top: var(--space-sm) !important;
}

.guide-page-features {
  padding-top: 0 !important;
}

.guide-page-features .guide-feature-list li svg {
  color: var(--brand-success);
}

/* ─── Demo Features ────────────────────────────────────── */
.guide-demo-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-md);
}

.guide-demo-card {
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.guide-demo-card:hover,
.guide-demo-card:focus-visible {
  border-color: var(--brand-primary);
  box-shadow: var(--shadow-elevated);
  outline: none;
}

.guide-demo-card :deep(.card-content) {
  padding: var(--space-md);
}

.guide-demo-content {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.guide-demo-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: oklch(0 0 0 / 0.06);
  color: var(--brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.guide-demo-text {
  flex: 1;
  min-width: 0;
}

.guide-demo-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0 0 2px 0;
}

.guide-demo-desc {
  font-size: 0.75rem;
  color: var(--text-caption);
  margin: 0;
}

.guide-demo-arrow {
  width: 16px;
  height: 16px;
  color: var(--text-caption);
  flex-shrink: 0;
  transition:
    transform 0.15s ease,
    color 0.15s ease;
}

.guide-demo-card:hover .guide-demo-arrow,
.guide-demo-card:focus-visible .guide-demo-arrow {
  transform: translateX(4px);
  color: var(--brand-primary);
}

/* ─── CTA ──────────────────────────────────────────────── */
.guide-cta {
  display: flex;
  justify-content: center;
  margin-top: var(--space-sm);
}

/* ─── Responsive ───────────────────────────────────────── */
@media (max-width: 1280px) {
  .guide-journey {
    grid-template-columns: repeat(3, 1fr);
  }

  .guide-demo-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .guide-status-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .guide-vision-grid {
    grid-template-columns: 1fr;
  }

  .guide-pages-grid,
  .guide-personas-grid-6,
  .guide-caps-grid-6,
  .guide-concepts-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .guide-outcomes-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .guide-demo-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .guide-challenges-grid,
  .guide-personas-grid-6,
  .guide-demo-grid,
  .guide-outcomes-grid,
  .guide-caps-grid-6,
  .guide-concepts-grid,
  .guide-pages-grid,
  .guide-status-grid {
    grid-template-columns: 1fr;
  }

  .guide-journey {
    grid-template-columns: 1fr;
  }

  .guide-journey-connector {
    display: none;
  }
}
</style>
