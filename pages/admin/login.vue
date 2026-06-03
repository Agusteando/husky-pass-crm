<template>
  <LoginPanel
    brand-to="/admin/login"
    eyebrow="Acceso interno"
    title="Administración de guardería con Google."
    description="El equipo interno entra por esta ruta separada. El alcance se toma de la base MySQL existente: rol, unidad, sala y rutas permitidas."
  >
    <div class="stack">
      <div>
        <p class="eyebrow">/admin/login</p>
        <h2>Entrar como administrador</h2>
        <p>Usa tu cuenta institucional @casitaiedis.edu.mx.</p>
      </div>
      <div id="google-signin" class="google-box" />
      <p v-if="!clientId" class="alert">GOOGLE_CLIENT_ID no está configurado.</p>
      <p v-if="error" class="alert">{{ error }}</p>
      <NuxtLink class="btn btn-secondary" to="/login">Ir al acceso familiar</NuxtLink>
    </div>
  </LoginPanel>
</template>

<script setup lang="ts">
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
  window.google.accounts.id.renderButton(document.getElementById('google-signin'), {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'pill',
    locale: 'es-419',
    logo_alignment: 'center',
    width: 360
  })
}

async function handleCredential(response: { credential: string }) {
  error.value = ''
  try {
    await $fetch('/api/auth/admin/google', { method: 'POST', body: { credential: response.credential } })
    await navigateTo('/admin/daycare')
  } catch (err: any) {
    error.value = err?.statusMessage || err?.data?.statusMessage || 'No fue posible iniciar sesión con Google.'
  }
}
</script>

<style scoped>
.google-box {
  min-height: 48px;
}
</style>
