<template>
  <LoginPanel
    brand-to="/login"
    eyebrow="Acceso familiar"
    title="Información de guardería para familias."
    description="Ingresa con el usuario y contraseña tradicionales de Husky Pass Daycare. Este acceso conserva el comportamiento tradicional de Husky Pass: tareas, circulares, calendario y Personas Autorizadas cuando la cuenta familiar tiene acceso."
  >
    <form class="stack" @submit.prevent="submit">
      <div>
        <p class="eyebrow">/login</p>
        <h2>Entrar como familia</h2>
      </div>
      <label class="label">
        Usuario o correo
        <input v-model="form.login" class="input" autocomplete="username" required />
      </label>
      <label class="label">
        Contraseña
        <input v-model="form.password" class="input" type="password" autocomplete="current-password" required />
      </label>
      <p v-if="error" class="alert">{{ error }}</p>
      <button class="btn btn-primary" type="submit" :disabled="loading">{{ loading ? 'Validando…' : 'Ingresar' }}</button>
      <NuxtLink class="btn btn-secondary" to="/admin/login">Soy parte del equipo interno</NuxtLink>
    </form>
  </LoginPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })

const form = reactive({ login: '', password: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: form })
    await navigateTo('/daycare')
  } catch (err: any) {
    error.value = err?.statusMessage || err?.data?.statusMessage || 'No fue posible iniciar sesión.'
  } finally {
    loading.value = false
  }
}
</script>
