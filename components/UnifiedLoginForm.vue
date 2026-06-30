<template>
  <section class="auth-panel" :data-context="context">
    <div class="auth-orb" aria-hidden="true">
      <svg viewBox="0 0 24 24" role="img">
        <path d="M7 10.2V8.1C7 5.25 9.2 3 12 3s5 2.25 5 5.1v2.1" />
        <rect x="5.25" y="10" width="13.5" height="10" rx="2.25" />
      </svg>
    </div>

    <div class="auth-copy">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h2>{{ heading }}</h2>
      <p>{{ description }}</p>
    </div>

    <div class="auth-stack">
      <div v-if="clientId" :id="googleTargetId" class="google-box" />
      <p v-else-if="context === 'admin'" class="alert">GOOGLE_CLIENT_ID no está configurado.</p>

      <div v-if="clientId" class="auth-divider" aria-hidden="true"><span>o</span></div>

      <form class="credential-form" @submit.prevent="submitPassword">
        <label class="field-shell">
          <span>Correo, matrícula o usuario</span>
          <span class="field-control">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.8h16v10.4H4z" /><path d="m5 7.5 7 5.4 7-5.4" /></svg>
            <input v-model="form.login" autocomplete="username" required placeholder="usuario@casitaiedis.edu.mx" />
          </span>
        </label>

        <label class="field-shell">
          <span>Contraseña</span>
          <span class="field-control">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V8a5 5 0 0 1 10 0v2" /><rect x="5" y="10" width="14" height="10" rx="2" /></svg>
            <input v-model="form.password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" required placeholder="Ingresa tu contraseña" />
            <button class="ghost-icon" type="button" :aria-pressed="showPassword" aria-label="Mostrar u ocultar contraseña" @click="showPassword = !showPassword">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.7 12s3.1-5.3 9.3-5.3S21.3 12 21.3 12 18.2 17.3 12 17.3 2.7 12 2.7 12Z" /><circle cx="12" cy="12" r="2.4" /></svg>
            </button>
          </span>
        </label>

        <div class="form-link-row">
          <NuxtLink :to="recoveryTo">Olvidaste tu contraseña</NuxtLink>
        </div>

        <p v-if="error" class="alert">{{ error }}</p>

        <button class="submit-btn" type="submit" :disabled="loading">
          <span>{{ loading ? 'Validando' : 'Iniciar sesión' }}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></svg>
        </button>
      </form>

      <NuxtLink v-if="showRegistration" class="registration-link" to="/registro-guarderia">
        Crear acceso familiar de guardería
      </NuxtLink>
    </div>

    <p class="support-note">¿Necesitas ayuda? Contacta al equipo de soporte.</p>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { navigateTo, useRuntimeConfig } from 'nuxt/app'
import type { ExperienceName } from '~/types/identity'
import type { PublicSession } from '~/types/session'
import { recoveryRouteForExperience } from '~/utils/experienceIdentity'
import { setCachedRouteSession } from '~/utils/routeSession'

const props = withDefaults(defineProps<{
  context?: Extract<ExperienceName, 'escolar' | 'guarderia' | 'admin'> | 'neutral'
  heading?: string
  description?: string
  showRegistration?: boolean
}>(), {
  context: 'neutral',
  heading: 'Acceso seguro',
  description: 'Tu cuenta abre automáticamente el espacio disponible por permisos.',
  showRegistration: false
})

const config = useRuntimeConfig()
const clientId = config.public.googleClientId
const form = reactive({ login: '', password: '' })
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const googleTargetId = 'google-signin'
const eyebrow = computed(() => props.context === 'admin' ? 'Acceso interno' : props.context === 'guarderia' ? 'Acceso familiar' : 'Husky Pass')
const recoveryTo = computed(() => recoveryRouteForExperience(props.context === 'guarderia' ? 'guarderia' : 'escolar'))

const requestedExperience = computed(() => {
  if (props.context === 'escolar' || props.context === 'guarderia') return props.context
  return undefined
})

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

async function renderGoogleButton() {
  await nextTick()
  if (!window.google || !clientId) return
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: handleCredential,
    auto_select: false,
    cancel_on_tap_outside: false
  })
  const target = document.getElementById(googleTargetId)
  const buttonWidth = Math.max(240, Math.min(420, target?.clientWidth || 360))
  window.google.accounts.id.renderButton(target, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'rectangular',
    locale: 'es-419',
    logo_alignment: 'center',
    width: buttonWidth
  })
}

async function handleCredential(response: { credential: string }) {
  error.value = ''
  loading.value = true
  try {
    const result = await $fetch<PublicSession & { defaultPath?: string }>('/api/auth/admin/google', { method: 'POST', body: { credential: response.credential } })
    setCachedRouteSession({ user: result.user, loggedin: Boolean(result.user) })
    await navigateTo(result.defaultPath || '/')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible iniciar sesión con Google.'
  } finally {
    loading.value = false
  }
}

async function submitPassword() {
  loading.value = true
  error.value = ''
  try {
    const response = await $fetch<PublicSession & { defaultPath?: string }>('/api/auth/login', {
      method: 'POST',
      body: {
        login: form.login,
        password: form.password,
        experience: requestedExperience.value
      }
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
.auth-panel {
  margin: 0 auto;
  max-width: 460px;
  width: 100%;
}

.auth-orb {
  align-items: center;
  background: radial-gradient(circle, rgba(242, 248, 234, 0.96), rgba(221, 235, 202, 0.72));
  border: 1px solid rgba(223, 232, 215, 0.88);
  border-radius: 999px;
  color: var(--color-brand-800);
  display: flex;
  height: 104px;
  justify-content: center;
  margin: 0 auto 28px;
  width: 104px;
}

.auth-orb svg {
  height: 42px;
  width: 42px;
}

.auth-orb path,
.auth-orb rect,
.field-control path,
.field-control rect,
.field-control circle,
.submit-btn path {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.9;
}

.auth-copy {
  margin-bottom: 28px;
  text-align: center;
}

.auth-copy .eyebrow {
  color: var(--color-brand-700);
  letter-spacing: 0.18em;
  margin-bottom: 8px;
}

.auth-copy h2 {
  color: var(--color-brand-900);
  font-size: clamp(1.72rem, 3.2vw, 2.35rem);
  margin-bottom: 8px;
}

.auth-copy p {
  color: #59635b;
  margin-inline: auto;
  max-width: 360px;
}

.auth-stack {
  display: grid;
  gap: 18px;
}

.google-box {
  align-items: center;
  border: 1px solid rgba(198, 211, 190, 0.94);
  border-radius: 18px;
  display: grid;
  min-height: 58px;
  overflow: hidden;
  place-items: center;
  width: 100%;
}

.google-box :deep(iframe) {
  max-width: 100%;
}

.auth-divider {
  align-items: center;
  color: var(--color-muted);
  display: grid;
  font-size: 0.9rem;
  gap: 14px;
  grid-template-columns: 1fr auto 1fr;
}

.auth-divider::before,
.auth-divider::after {
  background: rgba(223, 232, 215, 0.96);
  content: '';
  height: 1px;
}

.credential-form {
  display: grid;
  gap: 14px;
}

.field-shell {
  color: var(--color-muted);
  display: grid;
  gap: 7px;
  font-size: 0.86rem;
}

.field-control {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(198, 211, 190, 0.94);
  border-radius: 18px;
  display: flex;
  gap: 12px;
  min-height: 58px;
  padding: 0 16px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.field-control:focus-within {
  border-color: rgba(87, 139, 38, 0.78);
  box-shadow: 0 0 0 5px rgba(111, 151, 26, 0.12);
  transform: translateY(-1px);
}

.field-control svg {
  color: #6d766b;
  flex: 0 0 auto;
  height: 24px;
  width: 24px;
}

.field-control input {
  border: 0;
  color: var(--color-ink);
  flex: 1 1 auto;
  min-width: 0;
  outline: 0;
}

.field-control input::placeholder {
  color: #a0a9a1;
}

.ghost-icon {
  align-items: center;
  background: transparent;
  border: 0;
  color: #6d766b;
  cursor: pointer;
  display: flex;
  flex: 0 0 auto;
  height: 34px;
  justify-content: center;
  padding: 0;
  width: 34px;
}

.ghost-icon svg {
  height: 22px;
  width: 22px;
}

.form-link-row {
  display: flex;
  justify-content: flex-end;
  margin-top: -2px;
}

.form-link-row a {
  color: var(--color-brand-800);
  font-size: .86rem;
  font-weight: 700;
}

.submit-btn {
  align-items: center;
  background: linear-gradient(135deg, var(--color-brand-700), var(--color-brand-900));
  border: 0;
  border-radius: 18px;
  box-shadow: 0 16px 30px rgba(55, 100, 31, 0.18);
  color: #fff;
  cursor: pointer;
  display: flex;
  font-weight: 800;
  justify-content: center;
  min-height: 60px;
  padding: 0 20px;
  position: relative;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  width: 100%;
}

.submit-btn:hover {
  box-shadow: 0 20px 34px rgba(55, 100, 31, 0.2);
  transform: translateY(-1px);
}

.submit-btn:disabled {
  cursor: not-allowed;
  opacity: 0.72;
  transform: none;
}

.submit-btn svg {
  height: 26px;
  position: absolute;
  right: 20px;
  width: 26px;
}

.registration-link {
  align-items: center;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(111, 151, 26, 0.32);
  border-radius: 18px;
  color: var(--color-brand-800);
  display: flex;
  font-weight: 800;
  justify-content: center;
  min-height: 54px;
  padding: 0 16px;
}

.support-note {
  color: #65705f;
  font-size: 0.86rem;
  margin-top: 30px;
  text-align: center;
}

.alert {
  margin: 0;
}

@media (max-width: 560px) {
  .auth-orb {
    height: 82px;
    margin-bottom: 20px;
    width: 82px;
  }

  .auth-orb svg {
    height: 34px;
    width: 34px;
  }

  .field-control,
  .google-box,
  .submit-btn {
    border-radius: 15px;
    min-height: 54px;
  }
}
</style>
