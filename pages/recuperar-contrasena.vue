<template>
  <LoginPanel
    brand-to="/login"
    eyebrow="Recuperaci&oacute;n"
    title="Restablecer contrase&ntilde;a"
    description="Recibe un enlace seguro en el correo de tu cuenta familiar."
  >
    <form v-if="!sent" class="stack" @submit.prevent="submit">
      <div>
        <h2>Olvidaste tu contrase&ntilde;a</h2>
      </div>
      <label class="label" for="recovery-email">
        Correo
        <input
          id="recovery-email"
          v-model="email"
          class="input"
          type="email"
          autocomplete="email"
          required
          :aria-invalid="Boolean(error)"
          aria-describedby="recovery-message"
        />
      </label>
      <p v-if="error" id="recovery-message" class="alert">{{ error }}</p>
      <button class="btn btn-primary" type="submit" :disabled="loading">{{ loading ? 'Enviando...' : 'Enviar enlace' }}</button>
      <NuxtLink class="btn btn-secondary" to="/login">Volver a iniciar sesi&oacute;n</NuxtLink>
    </form>

    <section v-else class="stack" aria-live="polite">
      <div>
        <h2>Revisa tu correo</h2>
        <p class="quiet">{{ message }}</p>
      </div>
      <NuxtLink class="btn btn-primary" to="/login">Volver a iniciar sesi&oacute;n</NuxtLink>
    </section>
  </LoginPanel>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ middleware: 'guest' })

const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref('')
const message = ref('Si existe una cuenta familiar con ese correo, enviaremos un enlace para restablecer la contrasena.')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const response = await $fetch<{ message?: string }>('/api/auth/password/forgot', {
      method: 'POST',
      body: { email: email.value }
    })
    message.value = response.message || message.value
    sent.value = true
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'Intenta de nuevo mas tarde.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.quiet {
  color: var(--color-muted);
  font-weight: 650;
  line-height: 1.45;
}
</style>
