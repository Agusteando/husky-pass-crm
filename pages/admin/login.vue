<template>
  <LoginPanel
    brand-to="/admin/login"
    eyebrow="Acceso interno"
    title="Administración Husky Pass"
    description="Ingresa con tu cuenta institucional."
    experience="admin"
  >
    <div class="stack">
      <div>
        <h2>Acceso administrativo</h2>
        <p class="muted-copy">Usa tu cuenta @casitaiedis.edu.mx.</p>
      </div>
      <div id="google-signin" class="google-box" />
      <p v-if="!clientId" class="alert">GOOGLE_CLIENT_ID no está configurado.</p>
      <p v-if="error" class="alert">{{ error }}</p>
      <NuxtLink class="btn btn-secondary" to="/login">Acceso familiar</NuxtLink>
    </div>
  </LoginPanel>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { navigateTo, useRuntimeConfig } from 'nuxt/app'
definePageMeta({ middleware: 'guest' })

const config = useRuntimeConfig()
const clientId = config.public.googleClientId
const error = ref('')

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: Record<string, unknown>) => void
          renderButton: (element: HTMLElement | null, options: Record<string, unknown>) => void
        }
      }
    }
  }
}

onMounted(() => {
  if (!clientId) return
  const existing = document.querySelector<HTMLScriptElement>('script[data-google-gsi]')
  if (existing) {
    renderGoogleButton()
    return
  }
  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.dataset.googleGsi = 'true'
  script.onload = renderGoogleButton
  script.onerror = () => {
    error.value = 'No se pudo cargar Google Sign-In.'
  }
  document.head.appendChild(script)
})

function renderGoogleButton() {
  if (!window.google || !clientId) return
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: handleCredential,
    auto_select: false,
    cancel_on_tap_outside: false
  })
  const target = document.getElementById('google-signin')
  const buttonWidth = Math.max(220, Math.min(360, target?.clientWidth || 320))
  window.google.accounts.id.renderButton(target, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'pill',
    locale: 'es-419',
    logo_alignment: 'center',
    width: buttonWidth
  })
}

async function handleCredential(response: { credential: string }) {
  error.value = ''
  try {
    const result = await $fetch<{ defaultPath?: string }>('/api/auth/admin/google', { method: 'POST', body: { credential: response.credential } })
    await navigateTo(result.defaultPath || '/admin/daycare/salas')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible iniciar sesión con Google.'
  }
}
</script>

<style scoped>
.google-box {
  min-height: 48px;
  width: 100%;
}

.google-box :deep(iframe) {
  max-width: 100%;
}

.muted-copy {
  margin-bottom: 0;
}
</style>
