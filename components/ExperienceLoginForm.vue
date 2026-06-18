<template>
  <form class="stack" @submit.prevent="submit">
    <div>
      <h2>{{ heading }}</h2>
    </div>
    <label class="label">
      Usuario o correo
      <input v-model="form.login" class="input" autocomplete="username" required />
    </label>
    <label class="label">
      Contraseña
      <input v-model="form.password" class="input" type="password" autocomplete="current-password" required />
    </label>
    <div class="form-link-row">
      <NuxtLink :to="recoveryTo">Olvidaste tu contraseña</NuxtLink>
    </div>
    <p v-if="error" class="alert">{{ error }}</p>
    <button class="btn btn-primary" type="submit" :disabled="loading">{{ loading ? 'Validando...' : 'Ingresar' }}</button>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { navigateTo } from 'nuxt/app'
import type { ExperienceName } from '~/types/identity'
import type { PublicSession } from '~/types/session'
import { recoveryRouteForExperience } from '~/utils/experienceIdentity'
import { setCachedRouteSession } from '~/utils/routeSession'

const props = defineProps<{
  experience: Extract<ExperienceName, 'escolar' | 'guarderia'>
  heading: string
}>()

const form = reactive({ login: '', password: '' })
const loading = ref(false)
const error = ref('')
const recoveryTo = computed(() => recoveryRouteForExperience(props.experience))

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const response = await $fetch<PublicSession & { defaultPath?: string }>('/api/auth/login', {
      method: 'POST',
      body: { ...form, experience: props.experience }
    })
    setCachedRouteSession({ user: response.user, loggedin: Boolean(response.user) })
    await navigateTo(response.defaultPath || '/')
  } catch (err: any) {
    error.value = err?.data?.message || err?.data?.statusMessage || err?.statusMessage || 'No fue posible iniciar sesión.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-link-row {
  display: flex;
  justify-content: flex-end;
  margin-top: -4px;
}

.form-link-row a {
  color: var(--color-brand-800);
  font-size: .88rem;
  font-weight: 700;
}

.form-link-row a:focus-visible {
  border-radius: 6px;
  outline: 3px solid var(--color-brand-100);
  outline-offset: 3px;
}
</style>
