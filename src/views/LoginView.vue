<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

async function handleLogin() {
  error.value = ''
  try {
    await authStore.login(email.value, password.value)
  } catch (e) {
    error.value = 'Invalid email or password'
  }
}
</script>

<template>
  <div class="login-page">
    <Card class="login-card">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access the system</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin">
          <div class="form-field">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div class="form-field">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <p v-if="error" class="login-error">{{ error }}</p>
          <Button type="submit" class="login-button" :disabled="authStore.isLoading">
            {{ authStore.isLoading ? 'Signing in...' : 'Sign In' }}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p class="login-footer-text">Demo credentials: admin@inova.krd / any password</p>
      </CardFooter>
    </Card>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--bg-app);
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.login-error {
  color: var(--brand-critical);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.login-button {
  width: 100%;
  margin-top: 1rem;
}

.login-footer-text {
  font-size: 0.75rem;
  color: var(--text-caption);
  text-align: center;
  width: 100%;
}
</style>
