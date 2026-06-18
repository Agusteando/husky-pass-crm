<template>
  <section class="security-page" :style="identityVars" :data-experience="identity.context.experience" data-product-panel="account-security">
    <header class="security-header">
      <span class="security-mark" aria-hidden="true">
        <FamilyPersonasIcon name="security" />
      </span>
      <div>
        <p>{{ identity.officialName }}</p>
        <h1>Cambiar contrase&ntilde;a</h1>
        <small>{{ accountLabel }}</small>
      </div>
    </header>

    <form class="security-form card" @submit.prevent="submit">
      <label class="label" for="current-password">
        Contrase&ntilde;a actual
        <input
          id="current-password"
          v-model="form.currentPassword"
          class="input"
          type="password"
          autocomplete="current-password"
          required
          :aria-invalid="Boolean(error)"
        />
      </label>
      <label class="label" for="family-new-password">
        Nueva contrase&ntilde;a
        <input
          id="family-new-password"
          v-model="form.password"
          class="input"
          type="password"
          autocomplete="new-password"
          required
          minlength="8"
          :aria-invalid="Boolean(error)"
        />
      </label>
      <label class="label" for="family-new-password-confirmation">
        Confirmar contrase&ntilde;a
        <input
          id="family-new-password-confirmation"
          v-model="form.confirmation"
          class="input"
          type="password"
          autocomplete="new-password"
          required
          minlength="8"
          :aria-invalid="Boolean(error)"
          aria-describedby="security-message"
        />
      </label>

      <p v-if="error" id="security-message" class="alert">{{ error }}</p>
      <p v-if="notice" id="security-message" class="notice" aria-live="polite">{{ notice }}</p>

      <div class="security-actions">
        <button class="btn btn-primary" type="submit" :disabled="loading">{{ loading ? 'Guardando...' : 'Guardar contraseña' }}</button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { useAppSession } from '~/composables/useAppSession'
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'nuxt/app'
import { displayMatriculaCandidate } from '~/utils/matricula'
import { experienceThemeVars, normalizeExperienceName, resolveVisualIdentity } from '~/utils/experienceIdentity'

definePageMeta({ layout: 'family', middleware: 'family' })

const route = useRoute()
const { data: session } = useAppSession()
const form = reactive({ currentPassword: '', password: '', confirmation: '' })
const loading = ref(false)
const error = ref('')
const notice = ref('')
const identity = computed(() => resolveVisualIdentity({
  routePath: route.path,
  requestedExperience: normalizeExperienceName(String(route.query.experiencia || '')) || undefined,
  user: session.value?.user
}).identity)
const identityVars = computed(() => experienceThemeVars(identity.value))

const accountLabel = computed(() => {
  const user = session.value?.user
  if (!user) return 'Cuenta familiar'
  return user.email || displayMatriculaCandidate(user.username) || user.displayName || 'Cuenta familiar'
})

async function submit() {
  loading.value = true
  error.value = ''
  notice.value = ''
  try {
    const response = await $fetch<{ message?: string }>('/api/auth/password/change', {
      method: 'POST',
      body: form
    })
    form.currentPassword = ''
    form.password = ''
    form.confirmation = ''
    notice.value = response.message || 'Contraseña actualizada.'
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible cambiar la contraseña.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.security-page {
  display: grid;
  gap: 14px;
  max-width: 720px;
}

.security-header {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: 54px minmax(0, 1fr);
}

.security-mark {
  align-items: center;
  background: linear-gradient(145deg, rgba(97, 139, 47, .14), rgba(102, 168, 216, .12));
  border: 1px solid var(--color-border);
  border-radius: 14px;
  color: var(--color-brand-700);
  display: inline-flex;
  height: 48px;
  justify-content: center;
  width: 48px;
}

.security-mark :deep(.pa-icon) {
  height: 1.5rem;
  width: 1.5rem;
}

.security-header p {
  color: var(--color-brand-700);
  font-size: .75rem;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.security-header h1 {
  color: var(--color-ink);
  font-size: clamp(1.65rem, 3vw, 2.35rem);
  letter-spacing: -0.03em;
  line-height: 1;
  margin: 0;
}

.security-header small {
  color: var(--color-muted);
  font-weight: 700;
}

.security-form {
  display: grid;
  gap: 12px;
  padding: clamp(14px, 2vw, 18px);
}

.security-actions {
  display: flex;
  justify-content: flex-end;
}

.notice {
  background: #edf7e8;
  border: 1px solid #cfe4c3;
  border-radius: 12px;
  color: #315f22;
  font-weight: 700;
  margin: 0;
  padding: 10px 12px;
}

@media (max-width: 640px) {
  .security-header {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .security-mark {
    border-radius: 12px;
    height: 38px;
    width: 38px;
  }

  .security-actions .btn {
    width: 100%;
  }
}
</style>
