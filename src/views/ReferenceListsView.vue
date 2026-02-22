<script setup lang="ts">
import { Building, Users, Briefcase, FileText, Settings, Shield } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const listTypes = [
  { id: 1, title: 'Business Units', icon: Building, count: 8, description: 'Manage organisational business units' },
  { id: 2, title: 'Departments', icon: Users, count: 24, description: 'Configure department structures' },
  { id: 3, title: 'Job Titles', icon: Briefcase, count: 56, description: 'Define job titles and roles' },
  { id: 4, title: 'Competency Categories', icon: FileText, count: 12, description: 'Organise competency types' },
  { id: 5, title: 'Validity Thresholds', icon: Settings, count: 6, description: 'Set expiration warning periods' },
  { id: 6, title: 'Compliance Levels', icon: Shield, count: 4, description: 'Define compliance severity levels' },
]
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">Reference Lists</h1>
    <p class="page-subtitle">Manage controlled values and thresholds</p>
  </div>

  <div class="reference-grid">
    <Card v-for="list in listTypes" :key="list.id" class="reference-card">
      <CardHeader class="reference-card-header">
        <div class="reference-icon-wrapper">
          <component :is="list.icon" class="reference-icon" />
        </div>
        <CardTitle class="reference-title">{{ list.title }}</CardTitle>
      </CardHeader>
      <CardContent class="reference-card-content">
        <p class="reference-description">{{ list.description }}</p>
        <div class="reference-meta">
          <span class="reference-count">{{ list.count }} items</span>
        </div>
        <Button variant="outline" size="sm" class="reference-action">
          Manage
        </Button>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.reference-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-lg);
}

.reference-card {
  background-color: var(--bg-surface);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.reference-card-header {
  padding: var(--space-lg);
  border-bottom: var(--border-subtle);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-sm);
}

.reference-icon-wrapper {
  width: 40px;
  height: 40px;
  background-color: var(--bg-subtle);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.reference-icon {
  width: 20px;
  height: 20px;
  color: var(--brand-primary);
}

.reference-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-heading);
}

.reference-card-content {
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.reference-description {
  font-size: 0.8125rem;
  color: var(--text-body);
  margin: 0;
}

.reference-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.reference-count {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.reference-action {
  margin-top: var(--space-sm);
  width: 100%;
}
</style>
