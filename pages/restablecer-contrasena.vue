<template>
  <LoginPanel
    brand-to="/login"
    eyebrow="Cuenta familiar"
    title="Nueva contrase&ntilde;a"
    description="Crea una contrase&ntilde;a para volver a entrar a Husky Pass."
  >
    <div v-if="pending" class="stack">
      <div class="loading-row">Validando enlace...</div>
    </div>

    <section v-else-if="success" class="stack" aria-live="polite">
      <div>
        <h2>Contrase&ntilde;a actualizada</h2>
        <p class="quiet">Ya puedes iniciar sesi&oacute;n con tu nueva contrase&ntilde;a.</p>
      </div>
      <NuxtLink class="btn btn-primary" to="/login">Iniciar sesi&oacute;n</NuxtLink>
    </section>

    <section v-else-if="!tokenState?.valid" class="stack" aria-live="polite">
      <div>
        <h2>Enlace no disponible</h2>
        <p class="quiet">{{ tokenState?.message || 'Solicita un enlace nuevo.' }}</p>
      </div>
      <NuxtLink class="btn btn-primary" to="/recuperar-contrasena">Solicitar enlace</NuxtLink>
      <NuxtLink class="btn btn-secondary" to="/login">Volver a iniciar sesi&oacute;n</NuxtLink>
    </section>

    <form v-else class="stack" @submit.prevent="submit">
      <div>
        <h2>Elige una nueva contrase&ntilde;a</h2>
      </div>
      <label class="label" for="new-password">
        Nueva contrase&ntilde;a
        <input
          id="new-password"
          v-model="form.password"
          class="input"
          type="password"
          autocomplete="new-password"
          required
          minlength="8"
          :aria-invalid="Boolean(error)"
        />
      </label>
      <label class="label" for="new-password-confirmation">
        Confirmar contrase&ntilde;a
        <input
          id="new-password-confirmation"
          v-model="form.confirmation"
          class="input"
          type="password"
          autocomplete="new-password"
          required
          minlength="8"
          :aria-invalid="Boolean(error)"
          aria-describedby="reset-message"
        />
      </label>
      <p v-if="error" id="reset-message" class="alert">{{ error }}</p>
      <button class="btn btn-primary" type="submit" :disabled="loading">{{ loading ? 'Guardando...' : 'Actualizar contraseña' }}</button>
      <NuxtLink class="btn btn-secondary" to="/login">Cancelar</NuxtLink>
    </form>
  </LoginPanel>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useFetch, useRoute } from 'nuxt/app'

definePageMeta({ middleware: 'guest' })

const route = useRoute()
const token = String(route.query.token || '')
const form = reactive({ password: '', confirmation: '' })
const loading = ref(false)
const success = ref(false)
const error = ref('')

const { data: tokenState, pending } = await useFetch<{ status: string; valid: boolean; message: string }>('/api/auth/password/reset', {
  key: `password-reset-token-${token.slice(0, 8)}`,
  query: { token }
})

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/password/reset', {
      method: 'POST',
      body: { token, password: form.password, confirmation: form.confirmation }
    })
    success.value = true
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible actualizar la contrasena.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.quiet,
.loading-row {
  color: var(--color-muted);
  font-weight: 650;
  line-height: 1.45;
}

.loading-row {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 12px;
}
</style>
