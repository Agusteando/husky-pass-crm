<template>
  <section class="auth-panel" :data-context="context">
    <section class="staff-access" aria-labelledby="staff-access-title">
      <div class="staff-access__glow" aria-hidden="true" />
      <header class="staff-access__header">
        <span class="staff-access__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M5 20V8.6L12 4l7 4.6V20" />
            <path d="M9.5 20v-4.8h5V20" />
            <path d="M8 10.5h.01M12 10.5h.01M16 10.5h.01" />
          </svg>
        </span>
        <div>
          <h2 id="staff-access-title">Colaboradores</h2>
          <p>IECS · IEDIS</p>
        </div>
      </header>

      <div v-if="clientId" :id="googleTargetId" class="google-box" />
      <p v-else class="alert">GOOGLE_CLIENT_ID no está configurado.</p>
    </section>

    <section class="family-access" aria-labelledby="family-access-title">
      <header class="family-access__header">
        <span class="family-access__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M8 11.2a2.9 2.9 0 1 0 0-5.8 2.9 2.9 0 0 0 0 5.8Z" />
            <path d="M16.4 12.4a2.15 2.15 0 1 0 0-4.3 2.15 2.15 0 0 0 0 4.3Z" />
            <path d="M3.4 19.5c0-2.6 2.1-4.7 4.8-4.7s4.8 2.1 4.8 4.7" />
            <path d="M13.1 19.5c.2-2 1.9-3.5 4-3.5s3.8 1.5 4 3.5" />
          </svg>
        </span>
        <h2 id="family-access-title">{{ passwordSectionLabel }}</h2>
        <span class="family-access__rule" aria-hidden="true" />
      </header>

      <form class="credential-form" @submit.prevent="submitPassword">
        <label class="field-shell">
          <span class="field-shell__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M4 6.8h16v10.4H4z" /><path d="m5 7.5 7 5.4 7-5.4" /></svg>
          </span>
          <span class="field-shell__body">
            <span class="field-shell__label">Correo, matrícula o usuario</span>
            <input v-model="form.login" autocomplete="username" required />
          </span>
        </label>

        <label class="field-shell">
          <span class="field-shell__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M7 10V8a5 5 0 0 1 10 0v2" /><rect x="5" y="10" width="14" height="10" rx="2" /></svg>
          </span>
          <span class="field-shell__body">
            <span class="field-shell__label">Contraseña</span>
            <input v-model="form.password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" required />
          </span>
          <button class="password-toggle" type="button" :aria-pressed="showPassword" aria-label="Mostrar u ocultar contraseña" @click="showPassword = !showPassword">
            <svg v-if="!showPassword" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.7 12s3.1-5.3 9.3-5.3S21.3 12 21.3 12 18.2 17.3 12 17.3 2.7 12 2.7 12Z" /><circle cx="12" cy="12" r="2.4" /></svg>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18" /><path d="M10.6 6.9A9.8 9.8 0 0 1 12 6.7c6.2 0 9.3 5.3 9.3 5.3a14.8 14.8 0 0 1-2.4 3.1" /><path d="M6.2 7.1A14.8 14.8 0 0 0 2.7 12s3.1 5.3 9.3 5.3a9.7 9.7 0 0 0 3-.5" /></svg>
          </button>
        </label>

        <div class="form-link-row">
          <NuxtLink :to="recoveryTo">Olvidaste tu contraseña</NuxtLink>
        </div>

        <p v-if="error" class="alert">{{ error }}</p>

        <button class="submit-btn" type="submit" :disabled="loading">
          <span>{{ loading ? 'Validando' : 'Entrar' }}</span>
          <span class="submit-btn__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></svg>
          </span>
        </button>
      </form>

      <NuxtLink v-if="showRegistration" class="registration-link" to="/registro-guarderia">
        Crear acceso familiar de guardería
      </NuxtLink>
    </section>
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
  showRegistration?: boolean
}>(), {
  context: 'neutral',
  showRegistration: false
})

const config = useRuntimeConfig()
const clientId = config.public.googleClientId
const form = reactive({ login: '', password: '' })
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const googleTargetId = 'google-signin'
const recoveryTo = computed(() => recoveryRouteForExperience(props.context === 'guarderia' ? 'guarderia' : 'escolar'))
const passwordSectionLabel = computed(() => props.context === 'admin' ? 'Acceso con usuario' : 'Familias')

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
    shape: 'pill',
    locale: 'es-419',
    logo_alignment: 'left',
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
  display: grid;
  gap: clamp(30px, 4vh, 44px);
  margin: 0 auto;
  max-width: 438px;
  width: 100%;
}

.staff-access {
  background:
    linear-gradient(135deg, rgba(34, 54, 80, 0.99), rgba(22, 38, 59, 0.99));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 26px;
  box-shadow: 0 24px 50px rgba(18, 36, 58, 0.2);
  color: #fff;
  display: grid;
  gap: 18px;
  isolation: isolate;
  overflow: hidden;
  padding: 20px;
  position: relative;
}

.staff-access::after {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  content: '';
  height: 180px;
  position: absolute;
  right: -82px;
  top: -104px;
  width: 180px;
  z-index: -1;
}

.staff-access__glow {
  background: radial-gradient(circle, rgba(91, 156, 190, 0.28), transparent 68%);
  height: 190px;
  pointer-events: none;
  position: absolute;
  right: -60px;
  top: -90px;
  width: 190px;
  z-index: -1;
}

.staff-access__header {
  align-items: center;
  display: flex;
  gap: 13px;
}

.staff-access__icon {
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 15px;
  display: flex;
  flex: 0 0 auto;
  height: 46px;
  justify-content: center;
  width: 46px;
}

.staff-access__icon svg,
.family-access__icon svg,
.field-shell__icon svg,
.password-toggle svg,
.submit-btn svg {
  height: 22px;
  width: 22px;
}

.staff-access__icon path,
.family-access__icon path,
.field-shell__icon path,
.field-shell__icon rect,
.password-toggle path,
.password-toggle circle,
.submit-btn path {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.staff-access__header h2,
.family-access__header h2 {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 0;
}

.staff-access__header p {
  color: rgba(255, 255, 255, 0.54);
  font-size: 0.69rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  margin-top: 3px;
}

.google-box {
  align-items: center;
  background: #fff;
  border-radius: 999px;
  box-shadow: 0 12px 24px rgba(8, 18, 30, 0.22);
  display: grid;
  min-height: 52px;
  overflow: hidden;
  padding: 2px;
  place-items: center;
  width: 100%;
}

.google-box :deep(iframe) {
  max-width: 100%;
}

.family-access {
  display: grid;
  gap: 22px;
}

.family-access__header {
  align-items: center;
  display: flex;
  gap: 12px;
}

.family-access__icon {
  align-items: center;
  background: var(--color-brand-100);
  border: 1px solid rgba(191, 217, 159, 0.58);
  border-radius: 14px;
  color: var(--color-brand-800);
  display: flex;
  flex: 0 0 auto;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.family-access__header h2 {
  color: #25372b;
  white-space: nowrap;
}

.family-access__rule {
  background: linear-gradient(90deg, rgba(202, 214, 196, 0.96), rgba(202, 214, 196, 0));
  height: 1px;
  margin-left: 4px;
  width: 100%;
}

.credential-form {
  display: grid;
  gap: 13px;
}

.field-shell {
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(204, 216, 199, 0.98);
  border-radius: 18px;
  display: flex;
  gap: 13px;
  min-height: 68px;
  padding: 10px 14px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.field-shell:focus-within {
  border-color: rgba(87, 139, 38, 0.78);
  box-shadow: 0 0 0 5px rgba(111, 151, 26, 0.1);
  transform: translateY(-1px);
}

.field-shell__icon {
  align-items: center;
  color: #788577;
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
}

.field-shell__body {
  display: grid;
  flex: 1 1 auto;
  gap: 2px;
  min-width: 0;
}

.field-shell__label {
  color: #778276;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.035em;
}

.field-shell input {
  background: transparent;
  border: 0;
  color: #17251d;
  font-size: 0.94rem;
  font-weight: 700;
  min-width: 0;
  outline: 0;
  padding: 0;
  width: 100%;
}

.password-toggle {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 10px;
  color: #778276;
  cursor: pointer;
  display: flex;
  flex: 0 0 auto;
  height: 38px;
  justify-content: center;
  padding: 0;
  width: 38px;
}

.password-toggle:hover {
  background: var(--color-brand-100);
  color: var(--color-brand-800);
}

.form-link-row {
  display: flex;
  justify-content: flex-end;
  margin-top: -3px;
}

.form-link-row a {
  color: #48653d;
  font-size: 0.78rem;
  font-weight: 700;
}

.form-link-row a:hover {
  color: var(--color-brand-800);
}

.submit-btn {
  align-items: center;
  background: linear-gradient(135deg, #355f24, #213f28);
  border: 0;
  border-radius: 18px;
  box-shadow: 0 18px 30px rgba(43, 78, 34, 0.19);
  color: #fff;
  cursor: pointer;
  display: flex;
  font-size: 0.94rem;
  font-weight: 800;
  justify-content: space-between;
  min-height: 60px;
  padding: 0 11px 0 23px;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  width: 100%;
}

.submit-btn:hover {
  box-shadow: 0 22px 38px rgba(43, 78, 34, 0.24);
  transform: translateY(-2px);
}

.submit-btn:disabled {
  cursor: not-allowed;
  opacity: 0.68;
  transform: none;
}

.submit-btn__icon {
  align-items: center;
  background: rgba(255, 255, 255, 0.13);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 13px;
  display: flex;
  height: 40px;
  justify-content: center;
  width: 40px;
}

.registration-link {
  align-items: center;
  border: 1px solid rgba(111, 151, 26, 0.26);
  border-radius: 16px;
  color: var(--color-brand-800);
  display: flex;
  font-size: 0.82rem;
  font-weight: 750;
  justify-content: center;
  min-height: 50px;
  padding: 0 16px;
  transition: background 0.18s ease, border-color 0.18s ease;
}

.registration-link:hover {
  background: var(--color-brand-100);
  border-color: rgba(111, 151, 26, 0.4);
}

.alert {
  margin: 0;
}

@media (max-width: 560px) {
  .auth-panel {
    gap: 28px;
  }

  .staff-access {
    border-radius: 22px;
    padding: 17px;
  }

  .field-shell,
  .submit-btn {
    border-radius: 16px;
  }
}
</style>
