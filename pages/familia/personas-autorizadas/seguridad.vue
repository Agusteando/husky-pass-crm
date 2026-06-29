<template>
  <FamilyPersonasAutorizadasShell :title="'Cambiar contrase\u00f1a'">
    <section class="pa-security-screen" data-product-panel="pa-account-security">
      <FamilyPersonasPageHeader
        eyebrow="Seguridad"
        :title="'Cambiar contrase\u00f1a'"
        description="Actualiza el acceso de esta cuenta familiar sin salir de Personas Autorizadas."
        :meta="accountDetail"
        ambassador-variant="header"
        ambassador-title="Protegemos tu acceso"
        ambassador-message="Usa una contraseña única y cámbiala si alguien más conoce tus datos."
        ambassador-tone="notice"
      />

      <section class="pa-security-grid">
        <article class="pa-security-account-card">
          <span class="security-mark" aria-hidden="true">
            <FamilyPersonasIcon name="security" />
          </span>
          <div class="security-account-copy">
            <p class="eyebrow">Cuenta escolar</p>
            <h2>{{ accountName }}</h2>
            <span>{{ accountDetail }}</span>
          </div>
          <div class="security-status-row" aria-label="Estado de seguridad">
            <span>
              <FamilyPersonasIcon name="check" />
              Sesi&oacute;n activa
            </span>
            <span>
              <FamilyPersonasIcon name="people" />
              Personas Autorizadas
            </span>
          </div>
        </article>

        <form class="pa-security-form-card" @submit.prevent="submit">
          <label class="label" for="pa-current-password">
            Contrase&ntilde;a actual
            <input
              id="pa-current-password"
              v-model="form.currentPassword"
              class="input"
              type="password"
              autocomplete="current-password"
              required
              :aria-invalid="Boolean(error)"
            />
          </label>

          <label class="label" for="pa-new-password">
            Nueva contrase&ntilde;a
            <input
              id="pa-new-password"
              v-model="form.password"
              class="input"
              type="password"
              autocomplete="new-password"
              required
              minlength="8"
              :aria-invalid="Boolean(error)"
            />
          </label>

          <label class="label" for="pa-new-password-confirmation">
            Confirmar contrase&ntilde;a
            <input
              id="pa-new-password-confirmation"
              v-model="form.confirmation"
              class="input"
              type="password"
              autocomplete="new-password"
              required
              minlength="8"
              :aria-invalid="Boolean(error)"
              aria-describedby="pa-security-message"
            />
          </label>

          <p v-if="error" id="pa-security-message" class="alert">{{ error }}</p>
          <p v-else-if="notice" id="pa-security-message" class="notice" aria-live="polite">{{ notice }}</p>

          <div class="security-actions">
            <button class="btn btn-primary pa-primary" type="submit" :disabled="loading">
              {{ loading ? 'Guardando...' : 'Guardar contrase\u00f1a' }}
            </button>
          </div>
        </form>
      </section>
    </section>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useAppSession } from '~/composables/useAppSession'
import { displayMatriculaCandidate } from '~/utils/matricula'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

const { data: session } = useAppSession()
const form = reactive({ currentPassword: '', password: '', confirmation: '' })
const loading = ref(false)
const error = ref('')
const notice = ref('')

const accountName = computed(() => session.value?.user?.displayName || displayMatriculaCandidate(session.value?.user?.username) || 'Cuenta familiar')
const accountDetail = computed(() => session.value?.user?.email || displayMatriculaCandidate(session.value?.user?.username) || 'Personas Autorizadas')

async function submit() {
  error.value = ''
  notice.value = ''

  if (form.password !== form.confirmation) {
    error.value = 'La confirmaci\u00f3n no coincide con la nueva contrase\u00f1a.'
    return
  }

  loading.value = true
  try {
    const response = await $fetch<{ message?: string }>('/api/auth/password/change', {
      method: 'POST',
      body: form
    })
    form.currentPassword = ''
    form.password = ''
    form.confirmation = ''
    notice.value = response.message || 'Contrase\u00f1a actualizada.'
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible cambiar la contrase\u00f1a.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.pa-security-screen {
  display: grid;
  gap: clamp(14px, 1.8vw, 20px);
  max-width: 1120px;
}

.pa-security-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(280px, .72fr) minmax(0, 1fr);
}

.pa-security-account-card,
.pa-security-form-card {
  background:
    radial-gradient(circle at 94% 8%, rgba(var(--pa-primary-rgb), .09), transparent 30%),
    linear-gradient(135deg, rgba(255, 255, 255, .98), rgba(250, 253, 255, .93));
  border: 1px solid rgba(211, 226, 239, .96);
  border-radius: 22px;
  box-shadow: 0 16px 36px rgba(27, 62, 96, .08);
}

.pa-security-account-card {
  align-content: start;
  display: grid;
  gap: 16px;
  padding: clamp(18px, 2.2vw, 26px);
}

.security-mark {
  align-items: center;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 20px;
  color: var(--pa-primary);
  display: inline-flex;
  height: 58px;
  justify-content: center;
  width: 58px;
}

.security-mark :deep(.pa-icon) {
  height: 1.55rem;
  width: 1.55rem;
}

.security-account-copy {
  min-width: 0;
}

.eyebrow {
  color: var(--pa-primary);
  font-size: .72rem;
  font-weight: 900;
  letter-spacing: .14em;
  margin: 0 0 7px;
  text-transform: uppercase;
}

.security-account-copy h2 {
  color: #14284d;
  font-size: clamp(1.35rem, 2vw, 1.85rem);
  letter-spacing: -0.025em;
  line-height: 1.08;
  margin: 0;
}

.security-account-copy span {
  color: #647089;
  display: block;
  font-weight: 750;
  margin-top: 7px;
  overflow-wrap: anywhere;
}

.security-status-row {
  display: grid;
  gap: 9px;
}

.security-status-row span {
  align-items: center;
  background: rgba(255, 255, 255, .82);
  border: 1px solid rgba(211, 226, 239, .92);
  border-radius: 14px;
  color: #4f5f78;
  display: inline-flex;
  font-size: .86rem;
  font-weight: 850;
  gap: 8px;
  min-height: 42px;
  padding: 0 12px;
}

.security-status-row :deep(.pa-icon) {
  color: var(--pa-primary);
}

.pa-security-form-card {
  display: grid;
  gap: 13px;
  padding: clamp(16px, 2.2vw, 24px);
}

.pa-security-form-card .input {
  min-height: 46px;
}

.input[aria-invalid='true'] {
  border-color: #d35a4e;
  box-shadow: 0 0 0 3px rgba(211, 90, 78, .12);
}

.security-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 2px;
}

.pa-primary {
  background: var(--pa-primary);
  color: var(--pa-contrast);
}

.notice {
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 12px;
  color: var(--pa-primary);
  font-weight: 800;
  margin: 0;
  padding: 10px 12px;
}

@media (max-width: 900px) {
  .pa-security-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .pa-security-account-card,
  .pa-security-form-card {
    border-radius: 18px;
  }

  .pa-security-account-card {
    gap: 12px;
    padding: 14px;
  }

  .security-mark {
    border-radius: 16px;
    height: 48px;
    width: 48px;
  }

  .security-actions .btn {
    width: 100%;
  }
}
</style>
