<script setup lang="ts">
import { ref } from 'vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Presentation, ArrowLeft, Check, X, AlertTriangle, Users, Briefcase, Shield, Clock, FileCheck, TrendingUp } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const problems = [
  { text: 'Spreadsheets everywhere', desc: 'Competence tracking scattered across multiple files' },
  { text: 'Audit anxiety', desc: 'No clear proof of who was trained, when, and by whom' },
  { text: 'Expired certifications', desc: 'Discovering too late that critical qualifications have lapsed' },
  { text: 'Unclear responsibilities', desc: 'Who needs what training? Who is responsible?' },
  { text: 'Safety risks', desc: 'Employees working independently without proper authorization' },
  { text: 'Manual follow-ups', desc: 'Endless emails chasing training completions' }
]

const solutions = [
  { text: 'Defines', desc: 'what competence each job role requires' },
  { text: 'Tracks', desc: 'each employee\'s status against those requirements' },
  { text: 'Alerts', desc: 'you before certifications expire' },
  { text: 'Manages', desc: 'training actions until gaps are closed' },
  { text: 'Proves', desc: 'compliance with complete audit trails' }
]

const steps = [
  { num: 1, title: 'Define What Each Role Needs', desc: 'Configure required competencies once per role. The system applies them automatically to everyone in that role.' },
  { num: 2, title: 'See Status at a Glance', desc: 'Color-coded dashboard shows Valid, Expiring, and Expired items instantly.' },
  { num: 3, title: 'Automatic Alerts', desc: 'The system proactively notifies you of expiring certifications and required actions.' },
  { num: 4, title: 'Manage Training', desc: 'Training needs are created automatically and tracked until completion.' },
  { num: 5, title: 'Upload Evidence', desc: 'Employees upload certificates; managers review and approve.' },
  { num: 6, title: 'Audit-Ready Reports', desc: 'One-click exports and complete audit trails for compliance.' }
]

const personas = [
  { icon: Users, title: 'For Employees', quote: 'I can see exactly what training I need, upload my certificates, and know when my qualifications expire.', features: ['My competence requirements', 'My training tasks', 'My authorization status'] },
  { icon: Briefcase, title: 'For Managers', quote: 'I immediately see who on my team needs attention. I can filter by expiring or missing items and take action.', features: ['Team dashboard', 'Skills matrix', 'Training needs queue'] },
  { icon: Shield, title: 'For HR & Compliance', quote: 'We finally have one source of truth. When auditors ask for proof, we can generate reports instantly.', features: ['Org-wide overview', 'Competency library', 'Complete audit trail'] }
]

const benefits = [
  { icon: Clock, title: 'Save Time', items: ['No more manual spreadsheet updates', 'Automatic expiry notifications', 'One-click reporting'] },
  { icon: AlertTriangle, title: 'Reduce Risk', items: ['Never miss an expired certification', 'Clear authorization status', 'Safety-critical requirements flagged'] },
  { icon: FileCheck, title: 'Pass Audits', items: ['Complete audit trail', 'Timestamped evidence', 'Exportable reports'] },
  { icon: TrendingUp, title: 'Scale Easily', items: ['Works for 10 or 10,000 employees', 'Role-based requirements apply automatically', 'Consistent process organization-wide'] }
]

const demoFeatures = [
  'Dashboard - Real-time view of compliance health',
  'Skills Matrix - Every employee, every requirement',
  'Training Needs - Action queue with due dates',
  'Evidence Management - Upload, review, approve',
  'Role Configuration - Define once, apply to many',
  'Audit Reports - Export-ready documentation'
]

const activeSection = ref(0)

const scrollToSection = (index: number) => {
  activeSection.value = index
  const element = document.getElementById(`section-${index}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <div class="sales-pitch-container">
    <!-- Sidebar Navigation -->
    <nav class="sales-pitch-nav">
      <div class="sales-pitch-nav-header">
        <Presentation class="sales-pitch-nav-icon" />
        <span>Sales Demo</span>
      </div>
      <Separator />
      <div class="sales-pitch-nav-items">
        <Button
          v-for="(section, index) in ['Problem', 'Solution', 'Workflow', 'Users', 'Safety', 'Benefits', 'Demo']"
          :key="index"
          variant="ghost"
          :class="['sales-pitch-nav-btn', { 'sales-pitch-nav-btn-active': activeSection === index }]"
          @click="scrollToSection(index)"
        >
          {{ section }}
        </Button>
      </div>
      <Separator />
      <Button variant="outline" class="sales-pitch-back-btn" @click="router.push('/dashboard')">
        <ArrowLeft class="icon-sm" />
        Back to Dashboard
      </Button>
    </nav>

    <!-- Main Content -->
    <ScrollArea class="sales-pitch-content">
      <div class="sales-pitch-inner">
        <!-- Header -->
        <header class="sales-pitch-header">
          <h1 class="sales-pitch-title">Competence & Training Management System</h1>
          <p class="sales-pitch-subtitle">Your Solution for Workforce Compliance & Safety</p>
        </header>

        <!-- Problem Section -->
        <section id="section-0" class="sales-pitch-section">
          <h2 class="sales-pitch-section-title">The Problem We Solve</h2>
          <p class="sales-pitch-section-intro">Is your organization struggling with these challenges?</p>
          
          <div class="sales-pitch-problems">
            <Card v-for="problem in problems" :key="problem.text" class="sales-pitch-problem-card">
              <CardContent>
                <div class="sales-pitch-problem-content">
                  <X class="sales-pitch-problem-icon" />
                  <div>
                    <h4>{{ problem.text }}</h4>
                    <p>{{ problem.desc }}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div class="sales-pitch-highlight">
            <p>If any of this sounds familiar, we have the solution.</p>
          </div>
        </section>

        <!-- Solution Section -->
        <section id="section-1" class="sales-pitch-section">
          <h2 class="sales-pitch-section-title">What Our System Does</h2>
          <p class="sales-pitch-section-intro">We replace spreadsheet chaos with a single, organized platform that:</p>
          
          <div class="sales-pitch-solutions">
            <div v-for="(solution, index) in solutions" :key="solution.text" class="sales-pitch-solution-item">
              <div class="sales-pitch-solution-num">{{ index + 1 }}</div>
              <div class="sales-pitch-solution-text">
                <strong>{{ solution.text }}</strong> {{ solution.desc }}
              </div>
            </div>
          </div>
        </section>

        <!-- Workflow Section -->
        <section id="section-2" class="sales-pitch-section">
          <h2 class="sales-pitch-section-title">How It Works: A Simple Workflow</h2>
          
          <div class="sales-pitch-steps">
            <Card v-for="step in steps" :key="step.num" class="sales-pitch-step-card">
              <CardHeader>
                <div class="sales-pitch-step-header">
                  <span class="sales-pitch-step-num">Step {{ step.num }}</span>
                  <CardTitle>{{ step.title }}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p>{{ step.desc }}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <!-- Users Section -->
        <section id="section-3" class="sales-pitch-section">
          <h2 class="sales-pitch-section-title">Who Uses It & How</h2>
          
          <div class="sales-pitch-personas">
            <Card v-for="persona in personas" :key="persona.title" class="sales-pitch-persona-card">
              <CardHeader>
                <div class="sales-pitch-persona-header">
                  <component :is="persona.icon" class="sales-pitch-persona-icon" />
                  <CardTitle>{{ persona.title }}</CardTitle>
                </div>
                <CardDescription class="sales-pitch-persona-quote">
                  "{{ persona.quote }}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul class="sales-pitch-persona-features">
                  <li v-for="feature in persona.features" :key="feature">
                    <Check class="sales-pitch-check-icon" />
                    {{ feature }}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <!-- Safety Section -->
        <section id="section-4" class="sales-pitch-section">
          <h2 class="sales-pitch-section-title">Safety-Critical Features</h2>
          <h3 class="sales-pitch-section-subtitle">Independent Work Authorization</h3>
          
          <Card class="sales-pitch-auth-card">
            <CardHeader>
              <CardTitle>Authorization Status</CardTitle>
              <CardDescription>The system automatically determines who can work independently</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="sales-pitch-auth-example">
                <div class="sales-pitch-auth-header">
                  <span>Employee: John Smith</span>
                  <span class="badge badge-success">AUTHORIZED</span>
                </div>
                <div class="sales-pitch-auth-requirements">
                  <div class="sales-pitch-auth-item">
                    <Check class="sales-pitch-check-icon-valid" />
                    <span>LOTO Certification</span>
                    <span class="sales-pitch-status-valid">Valid</span>
                  </div>
                  <div class="sales-pitch-auth-item">
                    <Check class="sales-pitch-check-icon-valid" />
                    <span>Permit to Work</span>
                    <span class="sales-pitch-status-valid">Valid</span>
                  </div>
                  <div class="sales-pitch-auth-item">
                    <Check class="sales-pitch-check-icon-valid" />
                    <span>Working at Height</span>
                    <span class="sales-pitch-status-valid">Valid</span>
                  </div>
                  <div class="sales-pitch-auth-item">
                    <Check class="sales-pitch-check-icon-valid" />
                    <span>Confined Space Entry</span>
                    <span class="sales-pitch-status-valid">Valid</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div class="sales-pitch-auth-expired">
                <div class="sales-pitch-auth-header">
                  <span>If ANY gating requirement expires:</span>
                  <span class="badge badge-critical">NOT AUTHORIZED</span>
                </div>
                <p class="sales-pitch-auth-action">Action Required: Complete recertification before independent work</p>
              </div>
            </CardContent>
          </Card>
          
          <div class="sales-pitch-highlight">
            <p>This protects your people and your organization.</p>
          </div>
        </section>

        <!-- Benefits Section -->
        <section id="section-5" class="sales-pitch-section">
          <h2 class="sales-pitch-section-title">Key Benefits</h2>
          
          <div class="sales-pitch-benefits">
            <Card v-for="benefit in benefits" :key="benefit.title" class="sales-pitch-benefit-card">
              <CardHeader>
                <div class="sales-pitch-benefit-header">
                  <component :is="benefit.icon" class="sales-pitch-benefit-icon" />
                  <CardTitle>{{ benefit.title }}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul class="sales-pitch-benefit-items">
                  <li v-for="item in benefit.items" :key="item">
                    <Check class="sales-pitch-check-icon" />
                    {{ item }}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <!-- Demo Section -->
        <section id="section-6" class="sales-pitch-section">
          <h2 class="sales-pitch-section-title">What You'll See in the Demo</h2>
          
          <Card class="sales-pitch-demo-card">
            <CardContent>
              <ul class="sales-pitch-demo-list">
                <li v-for="(feature, index) in demoFeatures" :key="index">
                  <span class="sales-pitch-demo-num">{{ index + 1 }}</span>
                  {{ feature }}
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <div class="sales-pitch-cta">
            <h3>Ready to See It in Action?</h3>
            <p>Request a personalized demo where we'll walk through the complete workflow, answer your questions, and discuss integration with your existing systems.</p>
            <div class="sales-pitch-cta-actions">
              <Button size="lg" @click="router.push('/dashboard')">
                Explore the Demo
              </Button>
              <Button variant="outline" size="lg" @click="router.push('/skills-matrix')">
                View Skills Matrix
              </Button>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="sales-pitch-footer">
          <Separator />
          <p>This system transforms compliance from a burden into a competitive advantage.</p>
        </footer>
      </div>
    </ScrollArea>
  </div>
</template>

<style scoped>
.sales-pitch-container {
  display: flex;
  height: calc(100vh - 64px);
  background-color: var(--bg-app);
}

.sales-pitch-nav {
  width: 200px;
  border-right: var(--border-subtle);
  background-color: var(--bg-surface);
  display: flex;
  flex-direction: column;
  padding: var(--space-md);
  flex-shrink: 0;
}

.sales-pitch-nav-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) 0;
  font-weight: 600;
  color: var(--text-heading);
}

.sales-pitch-nav-icon {
  width: 20px;
  height: 20px;
  color: var(--brand-primary);
}

.sales-pitch-nav-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-sm) 0;
}

.sales-pitch-nav-btn {
  justify-content: flex-start;
  font-size: 0.8125rem;
  color: var(--text-body);
}

.sales-pitch-nav-btn-active {
  background-color: var(--bg-subtle);
  color: var(--brand-primary);
}

.sales-pitch-back-btn {
  margin-top: auto;
  width: 100%;
}

.sales-pitch-content {
  flex: 1;
  height: 100%;
}

.sales-pitch-inner {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-2xl);
}

.sales-pitch-header {
  text-align: center;
  margin-bottom: var(--space-2xl);
  padding-bottom: var(--space-xl);
  border-bottom: var(--border-subtle);
}

.sales-pitch-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-heading);
  margin: 0 0 var(--space-sm) 0;
}

.sales-pitch-subtitle {
  font-size: 1.125rem;
  color: var(--text-body);
  margin: 0;
}

.sales-pitch-section {
  margin-bottom: var(--space-2xl);
  scroll-margin-top: var(--space-lg);
}

.sales-pitch-section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0 0 var(--space-md) 0;
}

.sales-pitch-section-subtitle {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--text-body);
  margin: 0 0 var(--space-md) 0;
}

.sales-pitch-section-intro {
  font-size: 1rem;
  color: var(--text-body);
  margin: 0 0 var(--space-lg) 0;
}

/* Problems */
.sales-pitch-problems {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.sales-pitch-problem-card {
  padding: 0;
}

.sales-pitch-problem-card :deep(.card-content) {
  padding: var(--space-md);
}

.sales-pitch-problem-content {
  display: flex;
  gap: var(--space-sm);
  align-items: flex-start;
}

.sales-pitch-problem-icon {
  width: 18px;
  height: 18px;
  color: var(--brand-critical);
  flex-shrink: 0;
  margin-top: 2px;
}

.sales-pitch-problem-content h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0 0 var(--space-xs) 0;
}

.sales-pitch-problem-content p {
  font-size: 0.8125rem;
  color: var(--text-caption);
  margin: 0;
}

/* Highlight */
.sales-pitch-highlight {
  background-color: var(--bg-subtle);
  border-left: 3px solid var(--brand-primary);
  padding: var(--space-md);
  border-radius: var(--radius-sm);
}

.sales-pitch-highlight p {
  margin: 0;
  font-weight: 500;
  color: var(--text-heading);
}

/* Solutions */
.sales-pitch-solutions {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.sales-pitch-solution-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
}

.sales-pitch-solution-num {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background-color: var(--brand-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 600;
  flex-shrink: 0;
}

.sales-pitch-solution-text {
  font-size: 0.9375rem;
  color: var(--text-body);
  padding-top: 4px;
}

/* Steps */
.sales-pitch-steps {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.sales-pitch-step-card {
  padding: 0;
}

.sales-pitch-step-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.sales-pitch-step-num {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--brand-primary);
}

/* Personas */
.sales-pitch-personas {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
}

.sales-pitch-persona-card {
  padding: 0;
}

.sales-pitch-persona-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.sales-pitch-persona-icon {
  width: 20px;
  height: 20px;
  color: var(--brand-primary);
}

.sales-pitch-persona-quote {
  font-style: italic;
  margin-top: var(--space-sm);
}

.sales-pitch-persona-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.sales-pitch-persona-features li {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.8125rem;
  color: var(--text-body);
}

.sales-pitch-check-icon {
  width: 14px;
  height: 14px;
  color: var(--brand-success);
  flex-shrink: 0;
}

/* Authorization */
.sales-pitch-auth-card {
  padding: 0;
  margin-bottom: var(--space-lg);
}

.sales-pitch-auth-example {
  margin-bottom: var(--space-md);
}

.sales-pitch-auth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  font-weight: 500;
}

.sales-pitch-auth-requirements {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  background-color: var(--bg-subtle);
  padding: var(--space-md);
  border-radius: var(--radius-md);
}

.sales-pitch-auth-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.875rem;
}

.sales-pitch-auth-item span:first-of-type {
  flex: 1;
}

.sales-pitch-check-icon-valid {
  width: 16px;
  height: 16px;
  color: var(--brand-success);
}

.sales-pitch-status-valid {
  color: var(--brand-success);
  font-weight: 500;
  font-size: 0.75rem;
}

.sales-pitch-auth-expired {
  padding-top: var(--space-md);
}

.sales-pitch-auth-action {
  margin-top: var(--space-sm);
  font-size: 0.875rem;
  color: var(--brand-critical);
  font-weight: 500;
}

/* Benefits */
.sales-pitch-benefits {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.sales-pitch-benefit-card {
  padding: 0;
}

.sales-pitch-benefit-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.sales-pitch-benefit-icon {
  width: 20px;
  height: 20px;
  color: var(--brand-primary);
}

.sales-pitch-benefit-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.sales-pitch-benefit-items li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-xs);
  font-size: 0.8125rem;
  color: var(--text-body);
}

/* Demo */
.sales-pitch-demo-card {
  padding: 0;
  margin-bottom: var(--space-xl);
}

.sales-pitch-demo-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.sales-pitch-demo-list li {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  font-size: 0.9375rem;
  color: var(--text-body);
}

.sales-pitch-demo-num {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  background-color: var(--brand-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

/* CTA */
.sales-pitch-cta {
  text-align: center;
  padding: var(--space-xl);
  background-color: var(--bg-subtle);
  border-radius: var(--radius-lg);
}

.sales-pitch-cta h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0 0 var(--space-sm) 0;
}

.sales-pitch-cta p {
  font-size: 0.9375rem;
  color: var(--text-body);
  margin: 0 0 var(--space-lg) 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.sales-pitch-cta-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
}

/* Footer */
.sales-pitch-footer {
  margin-top: var(--space-2xl);
  text-align: center;
}

.sales-pitch-footer p {
  font-size: 0.875rem;
  color: var(--text-caption);
  font-style: italic;
  margin: var(--space-md) 0 0 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .sales-pitch-personas {
    grid-template-columns: 1fr;
  }
  
  .sales-pitch-benefits {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sales-pitch-nav {
    display: none;
  }
  
  .sales-pitch-inner {
    padding: var(--space-lg);
  }
  
  .sales-pitch-problems {
    grid-template-columns: 1fr;
  }
  
  .sales-pitch-steps {
    grid-template-columns: 1fr;
  }
  
  .sales-pitch-title {
    font-size: 1.5rem;
  }
  
  .sales-pitch-cta-actions {
    flex-direction: column;
  }
}
</style>
