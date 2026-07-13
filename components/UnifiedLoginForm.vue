<template>
  <section class="auth-panel" :data-context="context">
    <section class="staff-access" aria-labelledby="staff-access-title">
      <header class="staff-access__header">
        <div class="staff-access__identity">
          <span class="staff-access__mark" aria-hidden="true"><span /><span /></span>
          <h2 id="staff-access-title">Colaboradores</h2>
        </div>
        <div class="staff-access__brands" aria-label="IECS e IEDIS">
          <img src="/brand/iecs-wordmark-gradient.png" alt="IECS" />
          <span aria-hidden="true" />
          <img src="/brand/iedis-wordmark-gradient.png" alt="IEDIS" />
        </div>
      </header>

      <div v-if="clientId" :id="googleTargetId" class="google-box" />
      <p v-else class="alert">GOOGLE_CLIENT_ID no está configurado.</p>
    </section>

    <div class="access-transition" aria-hidden="true">
      <span />
      <span />
    </div>

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
const passwordSectionLabel = computed(() => props.context === 'admin' ? 'Credenciales' : 'Familias')

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
  --login-iecs: #2f7d54;
  --login-iecs-deep: #245f42;
  --login-iecs-soft: #eef7f1;
  --login-iedis: #007f92;
  --login-iedis-deep: #006a79;
  --login-iedis-soft: #edf8fa;
  --login-ink: #263f35;
  --login-muted: #697970;
  display: grid;
  gap: 0;
  margin: 0 auto;
  max-width: 448px;
  width: 100%;
}

.staff-access {
  background:
    radial-gradient(circle at 8% 0%, rgba(47, 125, 84, 0.09), transparent 42%),
    radial-gradient(circle at 96% 100%, rgba(0, 127, 146, 0.09), transparent 43%),
    rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(75, 139, 109, 0.24);
  border-radius: 24px;
  box-shadow: 0 18px 42px rgba(47, 92, 67, 0.1);
  display: grid;
  gap: 18px;
  overflow: hidden;
  padding: 19px;
  position: relative;
}

.staff-access::before {
  background: linear-gradient(90deg, var(--login-iecs), #4d9560 44%, #168b88 58%, var(--login-iedis));
  content: '';
  height: 3px;
  inset: 0 0 auto;
  position: absolute;
}

.staff-access__header {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  min-width: 0;
}

.staff-access__identity {
  align-items: center;
  display: flex;
  gap: 11px;
  min-width: 0;
}

.staff-access__mark {
  display: grid;
  flex: 0 0 auto;
  height: 34px;
  place-items: center;
  position: relative;
  width: 38px;
}

.staff-access__mark span {
  border: 2px solid;
  border-radius: 10px;
  height: 27px;
  position: absolute;
  transform: rotate(-8deg);
  width: 22px;
}

.staff-access__mark span:first-child {
  border-color: var(--login-iecs);
  left: 3px;
}

.staff-access__mark span:last-child {
  border-color: var(--login-iedis);
  right: 3px;
  transform: rotate(8deg);
}

.staff-access__header h2,
.family-access__header h2 {
  font-family: var(--font-body);
  font-size: 0.96rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  margin: 0;
}

.staff-access__header h2 {
  color: var(--login-ink);
}

.staff-access__brands {
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  gap: 8px;
}

.staff-access__brands img {
  height: 18px;
  object-fit: contain;
  width: auto;
}

.staff-access__brands img:last-child {
  height: 17px;
}

.staff-access__brands > span {
  background: rgba(66, 109, 87, 0.2);
  height: 18px;
  width: 1px;
}

.google-box {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(159, 188, 170, 0.5);
  border-radius: 999px;
  box-shadow: 0 8px 20px rgba(47, 92, 67, 0.08);
  display: grid;
  min-height: 54px;
  overflow: hidden;
  padding: 2px;
  place-items: center;
  width: 100%;
}

.google-box :deep(iframe) {
  max-width: 100%;
}

.access-transition {
  height: 34px;
  margin-inline: 29px;
  position: relative;
}

.access-transition::before {
  background: linear-gradient(90deg, rgba(47, 125, 84, 0), rgba(47, 125, 84, 0.25) 32%, rgba(0, 127, 146, 0.25) 68%, rgba(0, 127, 146, 0));
  content: '';
  height: 1px;
  inset: 50% 0 auto;
  position: absolute;
}

.access-transition span {
  background: #fff;
  border: 2px solid;
  border-radius: 6px;
  height: 12px;
  left: calc(50% - 8px);
  position: absolute;
  top: 11px;
  transform: rotate(45deg);
  width: 12px;
}

.access-transition span:first-child {
  border-color: var(--login-iecs);
  margin-left: -5px;
}

.access-transition span:last-child {
  border-color: var(--login-iedis);
  margin-left: 5px;
}

.family-access {
  display: grid;
  gap: 21px;
  padding: 0 2px;
}

.family-access__header {
  align-items: center;
  display: flex;
  gap: 12px;
}

.family-access__icon {
  align-items: center;
  background: linear-gradient(145deg, var(--login-iecs-soft), var(--login-iedis-soft));
  border: 1px solid rgba(71, 139, 112, 0.25);
  border-radius: 14px;
  color: var(--login-iecs-deep);
  display: flex;
  flex: 0 0 auto;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.family-access__icon svg,
.field-shell__icon svg,
.password-toggle svg,
.submit-btn svg {
  height: 22px;
  width: 22px;
}

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

.family-access__header h2 {
  color: var(--login-ink);
  white-space: nowrap;
}

.family-access__rule {
  background: linear-gradient(90deg, rgba(47, 125, 84, 0.27), rgba(0, 127, 146, 0.08), transparent);
  height: 1px;
  margin-left: 3px;
  width: 100%;
}

.credential-form {
  display: grid;
  gap: 13px;
}

.field-shell {
  align-items: center;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(186, 207, 193, 0.82);
  border-radius: 17px;
  box-shadow: 0 5px 16px rgba(42, 86, 61, 0.035);
  display: flex;
  gap: 13px;
  min-height: 66px;
  padding: 10px 14px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.field-shell:focus-within {
  border-color: rgba(0, 127, 146, 0.58);
  box-shadow: 0 0 0 4px rgba(0, 127, 146, 0.09), 0 8px 22px rgba(42, 86, 61, 0.055);
  transform: translateY(-1px);
}

.field-shell__icon {
  align-items: center;
  color: #6f8277;
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
  color: var(--login-muted);
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.025em;
}

.field-shell input {
  background: transparent;
  border: 0;
  color: var(--login-ink);
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
  color: #718178;
  cursor: pointer;
  display: flex;
  flex: 0 0 auto;
  height: 38px;
  justify-content: center;
  padding: 0;
  width: 38px;
}

.password-toggle:hover {
  background: var(--login-iedis-soft);
  color: var(--login-iedis-deep);
}

.form-link-row {
  display: flex;
  justify-content: flex-end;
  margin-top: -3px;
}

.form-link-row a {
  color: var(--login-iecs-deep);
  font-size: 0.78rem;
  font-weight: 750;
}

.form-link-row a:hover {
  color: var(--login-iedis-deep);
}

.submit-btn {
  align-items: center;
  background: linear-gradient(105deg, var(--login-iecs-deep) 0%, var(--login-iecs) 42%, #158982 64%, var(--login-iedis-deep) 100%);
  border: 0;
  border-radius: 17px;
  box-shadow: 0 17px 30px rgba(27, 104, 91, 0.2);
  color: #fff;
  cursor: pointer;
  display: flex;
  font-size: 0.94rem;
  font-weight: 800;
  justify-content: space-between;
  min-height: 60px;
  padding: 0 10px 0 23px;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  width: 100%;
}

.submit-btn:hover {
  box-shadow: 0 21px 36px rgba(27, 104, 91, 0.25);
  transform: translateY(-2px);
}

.submit-btn:disabled {
  cursor: not-allowed;
  opacity: 0.68;
  transform: none;
}

.submit-btn__icon {
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  display: flex;
  height: 40px;
  justify-content: center;
  width: 40px;
}

.registration-link {
  align-items: center;
  border: 1px solid rgba(47, 125, 84, 0.26);
  border-radius: 15px;
  color: var(--login-iecs-deep);
  display: flex;
  font-size: 0.82rem;
  font-weight: 750;
  justify-content: center;
  min-height: 50px;
  padding: 0 16px;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.registration-link:hover {
  background: linear-gradient(90deg, var(--login-iecs-soft), var(--login-iedis-soft));
  border-color: rgba(0, 127, 146, 0.34);
  color: var(--login-iedis-deep);
}

.alert {
  margin: 0;
}

@media (max-width: 560px) {
  .staff-access {
    border-radius: 21px;
    padding: 17px;
  }

  .staff-access__brands img {
    height: 15px;
  }

  .staff-access__brands img:last-child {
    height: 14px;
  }

  .field-shell,
  .submit-btn {
    border-radius: 15px;
  }
}
</style>
