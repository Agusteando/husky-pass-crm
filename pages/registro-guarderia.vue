<template>
  <main class="registration-page" :style="identityVars" data-experience="guarderia">
    <section class="registration-hero">
      <BrandMark to="/login/guarderia" :logo="identity.assets.logo" :alt="identity.label" />
      <div>
        <p class="eyebrow">Registro de guardería</p>
        <h1>Activa tu acceso familiar</h1>
        <p>Registra la cuenta que usará tu familia para consultar avisos, tareas y calendario de la sala.</p>
      </div>
      <div class="hero-note">
        <strong>Acceso seguro</strong>
        <span>Validamos sala, CAPTCHA y datos antes de crear la cuenta.</span>
      </div>
    </section>

    <section class="registration-card card" :data-state="pageState">
      <header class="form-head">
        <div>
          <p class="eyebrow">Datos familiares</p>
          <h2>Registro</h2>
        </div>
        <NuxtLink class="btn btn-secondary" to="/login/guarderia">Ya tengo cuenta</NuxtLink>
      </header>

      <p v-if="optionsError" class="alert">No fue posible cargar las salas disponibles.</p>
      <div v-else-if="optionsPending" class="loading-box">Cargando salas...</div>

      <form v-else class="registration-form" @submit.prevent="submit">
        <label class="label">
          Nombre de madre, padre o tutor
          <input v-model="form.parentName" class="input" autocomplete="name" required maxlength="120" />
        </label>

        <label class="label">
          Nombre del niño o niña
          <input v-model="form.childName" class="input" required maxlength="120" />
        </label>

        <label class="label">
          Correo familiar
          <input v-model="form.email" class="input" type="email" autocomplete="email" required maxlength="160" />
        </label>

        <label class="label">
          Contraseña
          <input v-model="form.password" class="input" type="password" autocomplete="new-password" required minlength="8" />
          <small>Al menos 8 caracteres, con letras y números.</small>
        </label>

        <div class="grid grid-2">
          <label class="label">
            Unidad
            <select v-model="form.unidad" class="select" required @change="form.sala = ''">
              <option value="" disabled>Selecciona unidad</option>
              <option v-for="unidad in unidades" :key="unidad" :value="unidad">{{ unidad }}</option>
            </select>
          </label>

          <label class="label">
            Sala
            <select v-model="form.sala" class="select" required :disabled="!form.unidad">
              <option value="" disabled>{{ form.unidad ? 'Selecciona sala' : 'Elige unidad primero' }}</option>
              <option v-for="sala in salasForUnidad" :key="sala.id" :value="String(sala.id)">{{ sala.sala }}</option>
            </select>
          </label>
        </div>

        <label class="label upload-field">
          Foto familiar opcional
          <input ref="fileInput" class="input" type="file" accept="image/png,image/jpeg,image/webp" @change="selectFile" />
          <small>{{ selectedFileName || 'PNG, JPG o WEBP hasta 4 MB.' }}</small>
        </label>

        <label class="screen-reader-only">
          Sitio web
          <input v-model="form.website" autocomplete="off" tabindex="-1" />
        </label>

        <section class="captcha-panel" :data-state="captchaError ? 'error' : captchaPending ? 'loading' : 'ready'">
          <div>
            <span>Verificación</span>
            <strong v-if="captcha?.question">{{ captcha.question }} =</strong>
            <strong v-else>Cargando...</strong>
          </div>
          <input v-model="form.captchaAnswer" class="input" inputmode="numeric" required placeholder="Respuesta" />
          <button class="btn btn-secondary" type="button" :disabled="captchaPending" @click="loadCaptcha">Cambiar</button>
        </section>

        <p v-if="captchaError" class="alert">{{ captchaError }}</p>
        <p v-if="error" class="alert">{{ error }}</p>
        <p v-if="notice" class="notice">{{ notice }}</p>

        <button class="btn btn-primary" type="submit" :disabled="submitting || !captcha">
          {{ submitting ? 'Creando acceso...' : 'Crear acceso de guardería' }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { navigateTo, useFetch } from 'nuxt/app'
import { experienceThemeVars, visualIdentityForContext } from '~/utils/experienceIdentity'

definePageMeta({ middleware: 'guest' })

interface RegistrationSala {
  id: number
  sala: string
  unidad: string
}

interface CaptchaChallenge {
  token: string
  question: string
  expiresAt: number
  minSeconds: number
}

const startedAt = Date.now()
const identity = visualIdentityForContext({ experience: 'guarderia', institution: null, nivel: 'guarderia', plantel: 'CM', grupo: null })
const identityVars = experienceThemeVars(identity)
const form = reactive({
  parentName: '',
  childName: '',
  email: '',
  password: '',
  unidad: '',
  sala: '',
  captchaAnswer: '',
  website: ''
})
const selectedFile = ref<File | null>(null)
const selectedFileName = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const captcha = ref<CaptchaChallenge | null>(null)
const captchaPending = ref(false)
const captchaError = ref('')
const submitting = ref(false)
const error = ref('')
const notice = ref('')

const { data: options, pending: optionsPending, error: optionsError } = useFetch<{ unidades: string[]; salas: RegistrationSala[] }>('/api/daycare/registration/options', {
  timeout: 15000
})

const unidades = computed(() => options.value?.unidades || [])
const salasForUnidad = computed(() => (options.value?.salas || []).filter((sala) => sala.unidad === form.unidad))
const pageState = computed(() => {
  if (optionsError.value || error.value || captchaError.value) return 'error'
  if (optionsPending.value || captchaPending.value || submitting.value) return 'loading'
  if (notice.value) return 'success'
  return 'ready'
})

onMounted(() => {
  void loadCaptcha()
})

async function loadCaptcha() {
  captchaPending.value = true
  captchaError.value = ''
  form.captchaAnswer = ''
  try {
    captcha.value = await $fetch<CaptchaChallenge>('/api/daycare/registration/captcha')
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    captchaError.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible generar la verificación.'
  } finally {
    captchaPending.value = false
  }
}

function selectFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  selectedFile.value = file
  selectedFileName.value = file?.name || ''
  error.value = ''
  if (!file) return
  if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 4 * 1024 * 1024) {
    selectedFile.value = null
    selectedFileName.value = ''
    input.value = ''
    error.value = 'La foto debe ser PNG, JPG o WEBP y pesar máximo 4 MB.'
  }
}

async function submit() {
  if (!captcha.value) return
  submitting.value = true
  error.value = ''
  notice.value = ''
  try {
    const body = new FormData()
    body.append('parentName', form.parentName)
    body.append('childName', form.childName)
    body.append('email', form.email)
    body.append('password', form.password)
    body.append('unidad', form.unidad)
    body.append('sala', form.sala)
    body.append('captchaToken', captcha.value.token)
    body.append('captchaAnswer', form.captchaAnswer)
    body.append('startedAt', String(startedAt))
    body.append('website', form.website)
    if (selectedFile.value) body.append('picture', selectedFile.value)

    const response = await $fetch<{ message: string }>('/api/daycare/registration', { method: 'POST', body })
    notice.value = response.message
    await navigateTo('/login/guarderia?registro=guarderia')
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible completar el registro.'
    await loadCaptcha()
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.registration-page {
  align-items: center;
  display: grid;
  gap: clamp(14px, 3vw, 30px);
  grid-template-columns: minmax(0, 0.8fr) minmax(340px, 500px);
  margin: 0 auto;
  min-height: 100vh;
  padding: clamp(12px, 3vw, 28px) 0;
  width: min(100% - 20px, 1120px);
}

.registration-hero {
  background:
    radial-gradient(circle at 82% 18%, rgba(255, 181, 69, 0.18), transparent 28%),
    linear-gradient(135deg, #315f24, #5d972d);
  border-radius: 18px;
  box-shadow: var(--shadow-card);
  color: #fff;
  display: grid;
  gap: clamp(16px, 4vw, 34px);
  min-height: min(440px, calc(100vh - 56px));
  padding: clamp(16px, 4vw, 32px);
}

.registration-hero :deep(.brand-mark) {
  color: #fff;
}

.registration-hero .eyebrow,
.registration-hero p {
  color: rgba(255, 255, 255, 0.84);
}

.registration-hero h1 {
  color: #fff;
  font-size: clamp(1.65rem, 3.8vw, 3rem);
}

.hero-note {
  align-self: end;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 20px;
  display: grid;
  gap: 4px;
  padding: 12px;
}

.hero-note span {
  color: rgba(255, 255, 255, 0.8);
}

.registration-card {
  display: grid;
  gap: 12px;
}

.form-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.form-head h2 {
  margin-bottom: 0;
}

.registration-form {
  display: grid;
  gap: 14px;
}

.label small {
  color: var(--color-muted);
  font-size: 0.78rem;
}

.upload-field input {
  padding: 10px;
}

.captcha-panel {
  align-items: end;
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 18px;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) 110px auto;
  padding: 12px;
}

.captcha-panel span {
  color: var(--color-muted);
  display: block;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.captcha-panel strong {
  color: var(--color-brand-900);
  font-family: var(--font-title);
  font-size: 1.4rem;
}

.notice {
  background: #f0f8e7;
  border: 1px solid var(--color-brand-200);
  border-radius: 14px;
  color: var(--color-brand-900);
  margin: 0;
  padding: 11px 13px;
}

.loading-box {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 18px;
  color: var(--color-muted);
  padding: 18px;
}

.screen-reader-only {
  height: 1px;
  left: -9999px;
  overflow: hidden;
  position: absolute;
  top: auto;
  width: 1px;
}

@media (max-width: 880px) {
  .registration-page {
    grid-template-columns: 1fr;
  }

  .registration-hero {
    min-height: 0;
  }
}

@media (max-width: 560px) {
  .form-head,
  .captcha-panel {
    align-items: stretch;
    grid-template-columns: 1fr;
  }
}
</style>
