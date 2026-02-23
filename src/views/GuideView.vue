<script setup lang="ts">
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
  SwitchCamera
} from 'lucide-vue-next'

const router = useRouter()

const challenges = [
  { icon: AlertTriangle, title: 'Scattered Data', desc: 'Competence records spread across spreadsheets, folders, and emails' },
  { icon: Clock, title: 'Manual Tracking', desc: 'Hours spent updating records and chasing expirations' },
  { icon: Shield, title: 'Compliance Gaps', desc: 'Discovering too late that critical certifications have lapsed' },
  { icon: Users, title: 'Unclear Status', desc: 'No clear view of who can work independently and who cannot' }
]

const journey = [
  { step: 1, title: 'Define Requirements', desc: 'Configure what each role needs once. The system applies it automatically to everyone in that role.', icon: Target },
  { step: 2, title: 'Track Status', desc: 'Color-coded dashboards show valid, expiring, and expired items at a glance.', icon: Zap },
  { step: 3, title: 'Stay Ahead', desc: 'Alerts notify you before certifications expire, giving you time to act.', icon: Clock },
  { step: 4, title: 'Close Gaps', desc: 'Training needs are created automatically and tracked until completion.', icon: Check },
  { step: 5, title: 'Prove Compliance', desc: 'One-click exports and complete audit trails for any inspection.', icon: FileCheck }
]

const personas = [
  {
    title: 'For Employees',
    quote: 'I finally have clarity on what I need and when it expires.',
    features: ['Personal competency dashboard', 'Awareness topic acknowledgement', 'Expiry reminders & status overview']
  },
  {
    title: 'For Managers',
    quote: 'I can see exactly who needs attention and take action immediately.',
    features: ['Evidence review — accept or reject', 'N/A exceptions with justification', 'Responsible party per training action']
  },
  {
    title: 'For Compliance / HR',
    quote: 'When auditors ask, we have everything ready in seconds.',
    features: ['Role requirement editing (risk, gating, type)', 'Full skills matrix with CSV export', 'Training need resolution workflows']
  }
]

const interactiveCapabilities = [
  {
    role: 'Employee',
    icon: UserCircle2,
    color: 'cap-employee',
    items: [
      { icon: Award, text: 'My Competencies — personal status, expiry alerts, gating badge' },
      { icon: Bell, text: 'Awareness Topics — acknowledge assigned topics, track pending count' },
    ]
  },
  {
    role: 'Manager',
    icon: ShieldCheck,
    color: 'cap-manager',
    items: [
      { icon: Table2, text: 'Skills Matrix — review evidence, accept/reject with reason' },
      { icon: Check, text: 'Mark N/A with justification, see Responsible Party per item' },
      { icon: GraduationCap, text: 'Training Needs — resolve via Upload, Book Training, OJT, or Assessment' },
    ]
  },
  {
    role: 'HR Admin',
    icon: SwitchCamera,
    color: 'cap-admin',
    items: [
      { icon: Briefcase, text: 'Role Detail — edit requirement risk level, gating, training & assessment type' },
      { icon: FileCheck, text: 'Skills Matrix summary — Responsible column auto-computed per row' },
      { icon: Users, text: 'Switch personas with the role switcher to explore all views' },
    ]
  }
]

const outcomes = [
  { metric: '90%', label: 'Reduction in manual tracking time' },
  { metric: '0', label: 'Surprise audit findings' },
  { metric: '100%', label: 'Visibility into authorisation status' },
  { metric: '24/7', label: 'Compliance confidence' }
]

const demoFeatures = [
  { name: 'Dashboard', desc: 'Real-time compliance health overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Skills Matrix', desc: 'Evidence review, N/A exceptions, responsible party', path: '/skills-matrix', icon: Table2 },
  { name: 'My Competencies', desc: 'Personal status, expiry alerts and gating badge', path: '/my-competencies', icon: Award },
  { name: 'Training Needs', desc: 'Resolve via Upload, Training, OJT or Assessment', path: '/training-needs', icon: GraduationCap },
  { name: 'Roles', desc: 'Edit requirements — risk, gating, training type', path: '/roles', icon: Briefcase },
  { name: 'Awareness Topics', desc: 'Acknowledge topics as Employee, manage as Admin', path: '/awareness-topics', icon: Bell },
  { name: 'People', desc: 'Individual records and evidence', path: '/people', icon: UserCircle2 },
  { name: 'Competency Library', desc: 'Manage requirements and evidence', path: '/competency-library', icon: BookOpen }
]

const handleExplore = (path: string) => {
  router.push(path)
}

const handleStartDemo = () => {
  toast.success('Welcome to the Demo', {
    description: 'Explore the dashboard to see compliance health at a glance.'
  })
  router.push('/dashboard')
}
</script>

<template>
  <div class="guide-root">

    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Platform Guide</h1>
      <p class="page-subtitle">Transform how you manage competence — from scattered spreadsheets to complete visibility</p>
    </div>

    <!-- Section: The Challenge -->
    <section class="guide-section">
      <div class="guide-section-label">The Problem</div>
      <h2 class="guide-section-title">Does This Sound Familiar?</h2>
      <p class="guide-section-intro">Most organisations struggle with the same fundamental problems when it comes to competence management.</p>

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
        <p>These aren't just inconveniences. They're <strong>risks</strong> — to safety, compliance, and operational efficiency.</p>
      </div>
    </section>

    <!-- Section: The Vision -->
    <section class="guide-section">
      <div class="guide-panel">
        <div class="guide-section-label">The Solution</div>
        <h2 class="guide-section-title">What If It Could Be Different?</h2>

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
            <h3 class="guide-vision-heading">Complete Visibility, Zero Guesswork</h3>
            <p class="guide-vision-desc">Imagine opening a single screen and seeing exactly where every employee stands. No digging through files. No wondering if something expired last month.</p>
            <ul class="guide-vision-list" role="list">
              <li><Check class="icon-xs" aria-hidden="true" /> Real-time status for everyone</li>
              <li><Check class="icon-xs" aria-hidden="true" /> Automatic expiry notifications</li>
              <li><Check class="icon-xs" aria-hidden="true" /> Clear authorisation indicators</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Section: How It Works -->
    <section class="guide-section">
      <div class="guide-section-label">The Workflow</div>
      <h2 class="guide-section-title">How It Works</h2>
      <p class="guide-section-intro">A simple, proven workflow that transforms chaos into clarity.</p>

      <div class="guide-journey">
        <div v-for="(step, index) in journey" :key="step.step" class="guide-journey-step">
          <div class="guide-journey-connector" v-if="index < journey.length - 1" aria-hidden="true" />
          <div class="guide-journey-num" aria-hidden="true">{{ step.step }}</div>
          <component :is="step.icon" class="guide-journey-icon" aria-hidden="true" />
          <h3 class="guide-journey-title">{{ step.title }}</h3>
          <p class="guide-journey-desc">{{ step.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Section: Personas -->
    <section class="guide-section">
      <div class="guide-panel">
        <div class="guide-section-label">Who It's For</div>
        <h2 class="guide-section-title">Built for Your Whole Team</h2>

        <div class="guide-personas-grid">
          <Card v-for="persona in personas" :key="persona.title" class="guide-persona-card">
            <CardHeader>
              <CardTitle>{{ persona.title }}</CardTitle>
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
      <div class="guide-section-label">Try It Yourself</div>
      <h2 class="guide-section-title">What's Interactive in This Demo</h2>
      <p class="guide-section-intro">Switch personas using the role switcher in the top bar to unlock each experience.</p>

      <div class="guide-caps-grid">
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
        <p>This isn't just about software. It's about <strong>protecting your people</strong>, <strong>simplifying your work</strong>, and knowing everything is under control.</p>
      </div>
    </section>

    <!-- Section: Demo Features -->
    <section class="guide-section">
      <div class="guide-section-label">Explore</div>
      <h2 class="guide-section-title guide-section-title-center">Ready to Dive In?</h2>
      <p class="guide-section-intro guide-section-intro-center">Explore the interactive demo and see how each piece works together.</p>

      <div class="guide-demo-grid">
        <Card
          v-for="feature in demoFeatures"
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
        <Button size="lg" @click="handleStartDemo" aria-label="Start with Dashboard">
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
  background: oklch(0.62 0.2 25 / 0.05);
  border-left-color: var(--brand-critical);
  color: var(--brand-critical);
}

.guide-callout-warning p {
  color: var(--text-body);
}

.guide-callout-success {
  background: oklch(0.62 0.14 162 / 0.07);
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
  background: oklch(0.62 0.2 25 / 0.08);
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

/* ─── Personas ─────────────────────────────────────────── */
.guide-personas-grid {
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
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.8125rem;
  color: var(--text-body);
}

.guide-feature-list li svg {
  color: var(--brand-primary);
  flex-shrink: 0;
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
.guide-caps-grid {
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
  background: oklch(0.62 0.14 162 / 0.06);
  border-color: oklch(0.62 0.14 162 / 0.2);
}

.cap-manager {
  background: oklch(0.38 0.14 266 / 0.06);
  border-color: oklch(0.38 0.14 266 / 0.2);
}

.cap-admin {
  background: oklch(0.72 0.15 58 / 0.06);
  border-color: oklch(0.72 0.15 58 / 0.2);
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

.cap-employee .guide-cap-role-icon { color: var(--brand-success); }
.cap-manager .guide-cap-role-icon  { color: var(--brand-primary); }
.cap-admin .guide-cap-role-icon    { color: var(--brand-warning); }

.guide-cap-role {
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.cap-employee .guide-cap-role { color: var(--brand-success); }
.cap-manager .guide-cap-role  { color: var(--brand-primary); }
.cap-admin .guide-cap-role    { color: var(--brand-warning); }

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

/* ─── Demo Features ────────────────────────────────────── */
.guide-demo-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}

.guide-demo-card {
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
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
  background: oklch(0.38 0.14 266 / 0.08);
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
  transition: transform 0.15s ease, color 0.15s ease;
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
}

@media (max-width: 1024px) {
  .guide-vision-grid {
    grid-template-columns: 1fr;
  }

  .guide-demo-grid,
  .guide-personas-grid,
  .guide-caps-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .guide-outcomes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .guide-challenges-grid,
  .guide-personas-grid,
  .guide-demo-grid,
  .guide-outcomes-grid,
  .guide-caps-grid {
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
