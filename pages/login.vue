<template>
  <LoginPanel
    brand-to="/login"
    eyebrow="Acceso familiar"
    title="Husky Pass"
    description="Ingresa para acceder a los productos familiares habilitados en tu cuenta."
  >
    <form class="stack" @submit.prevent="submit">
      <div>
        <h2>Acceso familiar</h2>
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
        <NuxtLink to="/recuperar-contrasena">Olvidaste tu contraseña</NuxtLink>
      </div>
      <p v-if="error" class="alert">{{ error }}</p>
      <button class="btn btn-primary" type="submit" :disabled="loading">{{ loading ? 'Validando…' : 'Ingresar' }}</button>
      <NuxtLink class="btn btn-secondary" to="/registro-guarderia">Crear acceso de guardería</NuxtLink>
      <NuxtLink class="btn btn-secondary" to="/admin/login">Acceso interno</NuxtLink>
    </form>
  </LoginPanel>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { navigateTo } from 'nuxt/app'
definePageMeta({ middleware: 'guest' })

const form = reactive({ login: '', password: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const response = await $fetch<{ defaultPath?: string }>('/api/auth/login', { method: 'POST', body: form })
    await navigateTo(response.defaultPath || '/')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible iniciar sesión.'
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
  outline: 3px solid rgba(97, 139, 47, .24);
  outline-offset: 3px;
}
</style>
