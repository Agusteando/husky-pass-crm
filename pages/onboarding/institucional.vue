<template>
  <main class="onboarding-page">
    <header class="onboarding-topbar">
      <NuxtLink class="brand-lockup" to="/">
        <img src="/brand/husky-pass-logo.png" alt="Husky Pass" />
      </NuxtLink>

      <div v-if="onboarding?.account" class="account-chip">
        <span class="account-avatar" :data-has-image="Boolean(onboarding.account.picture)">
          <img v-if="onboarding.account.picture" :src="onboarding.account.picture" alt="" referrerpolicy="no-referrer" />
          <span v-else>{{ accountInitials }}</span>
        </span>
        <span class="account-copy">
          <strong>{{ onboarding.account.displayName }}</strong>
          <small>{{ onboarding.account.email }}</small>
        </span>
        <button type="button" class="account-exit" @click="changeAccount">Cambiar cuenta</button>
      </div>
    </header>

    <section class="onboarding-shell">
      <aside class="onboarding-identity">
        <div class="identity-glow identity-glow--one" aria-hidden="true" />
        <div class="identity-glow identity-glow--two" aria-hidden="true" />

        <div class="identity-brands" aria-label="IECS e IEDIS">
          <img src="/brand/iecs-wordmark-gradient.png" alt="IECS" />
          <span class="identity-knot" aria-hidden="true"><i /><i /></span>
          <img src="/brand/iedis-wordmark-gradient.png" alt="IEDIS" />
        </div>

        <div class="identity-copy">
          <p class="identity-eyebrow">Primer acceso</p>
          <h1>Tu espacio empieza aquí.</h1>
          <p>Dos decisiones definen la experiencia completa.</p>
        </div>

        <div class="live-pass" :data-ready="canSubmit">
          <div class="live-pass__topline">
            <span>Husky Pass</span>
            <span>{{ stepLabel }}</span>
          </div>

          <div class="live-pass__role">
            <span class="live-pass__icon" :data-role="selectedRole || 'none'">
              <svg v-if="selectedRole === 'schoolAdmin'" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3.5 20.5h17M5 20V9l7-5 7 5v11M9 20v-5h6v5M8 10h.01M12 10h.01M16 10h.01" />
              </svg>
              <svg v-else-if="selectedRole === 'marketingAdmin'" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 18V9m5 9V5m5 13v-7m5 7V7M3 20h18" />
              </svg>
              <svg v-else-if="selectedRole === 'daycareAdmin'" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8.5 1.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5ZM3.5 20c0-2.8 2-5 4.5-5s4.5 2.2 4.5 5m1-1c.35-1.9 1.8-3.25 3.75-3.25 2.05 0 3.7 1.5 3.75 3.5" />
              </svg>
              <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3.5 19 7v5c0 4.4-2.8 7.5-7 9-4.2-1.5-7-4.6-7-9V7l7-3.5Z" />
              </svg>
            </span>
            <span>
              <small>Espacio</small>
              <strong>{{ selectedRoleOption?.title || 'Por definir' }}</strong>
            </span>
          </div>

          <div class="live-pass__scope">
            <small>Alcance</small>
            <div v-if="selectedScopeLabels.length" class="scope-token-list">
              <span v-for="label in selectedScopeLabels" :key="label">{{ label }}</span>
            </div>
            <strong v-else>Selecciona tu cobertura</strong>
          </div>

          <div class="live-pass__footer">
            <span class="status-dot" />
            <span>{{ canSubmit ? 'Configuración lista' : 'Configuración en curso' }}</span>
          </div>
        </div>

        <ol class="progress-list" aria-label="Progreso">
          <li :data-state="step === 1 ? 'active' : step > 1 ? 'complete' : 'pending'">
            <span>01</span><strong>Función</strong>
          </li>
          <li :data-state="step === 2 ? 'active' : step > 2 ? 'complete' : 'pending'">
            <span>02</span><strong>Alcance</strong>
          </li>
          <li :data-state="canSubmit ? 'ready' : 'pending'">
            <span>03</span><strong>Entrar</strong>
          </li>
        </ol>
      </aside>

      <section class="onboarding-workspace" aria-live="polite">
        <div v-if="pending" class="workspace-state">
          <span class="loader-ring" aria-hidden="true" />
          <h2>Preparando tu perfil</h2>
        </div>

        <div v-else-if="loadError" class="workspace-state workspace-state--error">
          <span class="state-symbol" aria-hidden="true">!</span>
          <h2>No pudimos abrir la configuración</h2>
          <button type="button" class="secondary-action" @click="refresh()">Reintentar</button>
        </div>

        <template v-else>
          <header class="workspace-header">
            <div>
              <p class="workspace-kicker">{{ step === 1 ? '01 · Función' : '02 · Alcance' }}</p>
              <h2>{{ step === 1 ? '¿Dónde trabajas dentro de la institución?' : scopeHeading }}</h2>
            </div>
            <button v-if="step === 2" type="button" class="text-action" @click="step = 1">Cambiar función</button>
          </header>

          <Transition name="step" mode="out-in">
            <section v-if="step === 1" key="roles" class="role-grid">
              <button
                v-for="role in onboarding?.roles || []"
                :key="role.key"
                type="button"
                class="role-card"
                :class="`role-card--${role.key}`"
                :data-selected="selectedRole === role.key"
                @click="selectRole(role.key)"
              >
                <span class="role-card__icon" aria-hidden="true">
                  <svg v-if="role.icon === 'school'" viewBox="0 0 24 24">
                    <path d="M3.5 20.5h17M5 20V9l7-5 7 5v11M9 20v-5h6v5M8 10h.01M12 10h.01M16 10h.01" />
                  </svg>
                  <svg v-else-if="role.icon === 'marketing'" viewBox="0 0 24 24">
                    <path d="M4 18V9m5 9V5m5 13v-7m5 7V7M3 20h18" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24">
                    <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8.5 1.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5ZM3.5 20c0-2.8 2-5 4.5-5s4.5 2.2 4.5 5m1-1c.35-1.9 1.8-3.25 3.75-3.25 2.05 0 3.7 1.5 3.75 3.5" />
                  </svg>
                </span>
                <span class="role-card__copy">
                  <small>{{ role.shortTitle }}</small>
                  <strong>{{ role.title }}</strong>
                  <span>{{ role.description }}</span>
                </span>
                <span class="role-card__check" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="m6 12 4 4 8-9" /></svg>
                </span>
              </button>
            </section>

            <section v-else key="scope" class="scope-selector">
              <template v-if="selectedRole !== 'daycareAdmin'">
                <section v-for="city in cities" :key="city" class="city-group">
                  <header>
                    <span>{{ city }}</span>
                    <small>{{ selectedInCity(city) }} seleccionados</small>
                  </header>
                  <div class="plantel-grid">
                    <button
                      v-for="plantel in plantelesByCity(city)"
                      :key="plantel.value"
                      type="button"
                      class="plantel-card"
                      :data-selected="selectedPlanteles.includes(plantel.value)"
                      :data-institution="plantel.institution"
                      @click="togglePlantel(plantel.value)"
                    >
                      <span class="plantel-card__brand">
                        <img
                          :src="plantel.institution === 'IECS' ? '/brand/iecs-logo.png' : '/brand/iedis-logo.png'"
                          :alt="plantel.institution"
                        />
                      </span>
                      <span class="plantel-card__copy">
                        <small>{{ plantel.value }} · {{ plantel.institution }}</small>
                        <strong>{{ plantel.shortLabel }}</strong>
                        <span>{{ plantel.level }}</span>
                      </span>
                      <span class="selection-check" aria-hidden="true">
                        <svg viewBox="0 0 24 24"><path d="m6 12 4 4 8-9" /></svg>
                      </span>
                    </button>
                  </div>
                </section>
              </template>

              <template v-else>
                <div v-if="onboarding?.unidades.length" class="unit-grid">
                  <button
                    v-for="unidad in onboarding.unidades"
                    :key="unidad"
                    type="button"
                    class="unit-card"
                    :data-selected="selectedUnidades.includes(unidad)"
                    @click="toggleUnidad(unidad)"
                  >
                    <span class="unit-card__mark" aria-hidden="true">
                      <svg viewBox="0 0 24 24"><path d="M4 20V8.5L12 4l8 4.5V20M8 20v-5h8v5M8 10h.01M12 10h.01M16 10h.01" /></svg>
                    </span>
                    <span><small>Unidad</small><strong>{{ unidad }}</strong></span>
                    <span class="selection-check" aria-hidden="true">
                      <svg viewBox="0 0 24 24"><path d="m6 12 4 4 8-9" /></svg>
                    </span>
                  </button>
                </div>

                <section v-else class="catalog-state" aria-labelledby="unit-catalog-title">
                  <span class="catalog-state__mark" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M4 20V8.5L12 4l8 4.5V20M8 20v-5h8v5" />
                      <path d="M12 8.5v4" />
                      <path d="M12 16.2h.01" />
                    </svg>
                  </span>
                  <div>
                    <p class="workspace-kicker">Catálogo temporalmente no disponible</p>
                    <h3 id="unit-catalog-title">Tus unidades no cargaron todavía</h3>
                    <p>Tu avance se conserva. Actualiza el catálogo o elige otra función para continuar.</p>
                  </div>
                  <button type="button" class="secondary-action" :disabled="pending" @click="refreshUnits">
                    {{ pending ? 'Actualizando' : 'Actualizar unidades' }}
                  </button>
                </section>
              </template>
            </section>
          </Transition>

          <p v-if="submitError" class="submit-error">{{ submitError }}</p>

          <footer class="workspace-footer">
            <span class="selection-count">{{ selectionCountLabel }}</span>
            <button
              v-if="step === 1"
              type="button"
              class="primary-action"
              :disabled="!selectedRole"
              @click="step = 2"
            >
              Continuar
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13m-5-6 6 6-6 6" /></svg>
            </button>
            <button
              v-else
              type="button"
              class="primary-action"
              :disabled="!canSubmit || saving"
              @click="completeOnboarding"
            >
              <span>{{ saving ? 'Preparando tu espacio' : `Abrir ${selectedRoleOption?.shortTitle || 'mi espacio'}` }}</span>
              <span v-if="saving" class="button-spinner" aria-hidden="true" />
              <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13m-5-6 6 6-6 6" /></svg>
            </button>
          </footer>
        </template>
      </section>
    </section>

    <Transition name="finish">
      <div v-if="finishing" class="finish-overlay" role="status">
        <div class="finish-mark" aria-hidden="true">
          <span /><span />
        </div>
        <strong>{{ selectedRoleOption?.title }}</strong>
        <span>Tu espacio está listo</span>
      </div>
    </Transition>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { navigateTo, useFetch } from 'nuxt/app'
import type {
  CompleteInstitutionalOnboardingResponse,
  InstitutionalAccessRole,
  InstitutionalOnboardingResponse
} from '~/types/institutionalOnboarding'
import { plantelOptionsForRole } from '~/utils/institutionalOnboarding'
import { anonymousSession, setCachedRouteSession } from '~/utils/routeSession'

definePageMeta({ middleware: 'institutional-onboarding' })

const { data: onboarding, pending, error: loadError, refresh } = useFetch<InstitutionalOnboardingResponse>('/api/auth/institutional-onboarding', {
  key: 'institutional-onboarding',
  server: false
})

const step = ref<1 | 2>(1)
const selectedRole = ref<InstitutionalAccessRole | null>(null)
const selectedPlanteles = ref<string[]>([])
const selectedUnidades = ref<string[]>([])
const initialized = ref(false)
const saving = ref(false)
const finishing = ref(false)
const submitError = ref('')
const cities = ['Metepec', 'Toluca'] as const

watch(onboarding, (value) => {
  if (!value || initialized.value) return
  selectedRole.value = value.current.role
  selectedPlanteles.value = [...value.current.planteles]
  selectedUnidades.value = [...value.current.unidades]
  step.value = value.current.role ? 2 : 1
  initialized.value = true
}, { immediate: true })

const selectedRoleOption = computed(() => onboarding.value?.roles.find((role) => role.key === selectedRole.value) || null)
const availablePlanteles = computed(() => plantelOptionsForRole(selectedRole.value))
const accountInitials = computed(() => {
  const name = onboarding.value?.account.displayName || onboarding.value?.account.email || 'HP'
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'HP'
})
const canSubmit = computed(() => {
  if (!selectedRole.value) return false
  if (selectedRole.value === 'daycareAdmin') return selectedUnidades.value.length > 0
  return selectedPlanteles.value.length > 0
})
const selectedScopeLabels = computed(() => {
  if (selectedRole.value === 'daycareAdmin') return selectedUnidades.value
  return selectedPlanteles.value
    .map((value) => availablePlanteles.value.find((plantel) => plantel.value === value)?.label || value)
})
const stepLabel = computed(() => step.value === 1 ? 'Función' : 'Alcance')
const scopeHeading = computed(() => selectedRole.value === 'daycareAdmin' ? '¿Qué unidades forman parte de tu operación?' : '¿Qué planteles forman parte de tu trabajo?')
const selectionCountLabel = computed(() => {
  if (step.value === 1) return selectedRoleOption.value ? selectedRoleOption.value.description : 'Elige una función'
  const count = selectedRole.value === 'daycareAdmin' ? selectedUnidades.value.length : selectedPlanteles.value.length
  if (!count) return selectedRole.value === 'daycareAdmin' ? 'Selecciona al menos una unidad' : 'Selecciona al menos un plantel'
  return `${count} ${selectedRole.value === 'daycareAdmin' ? (count === 1 ? 'unidad' : 'unidades') : (count === 1 ? 'plantel' : 'planteles')}`
})

function selectRole(role: InstitutionalAccessRole) {
  if (selectedRole.value !== role) {
    selectedPlanteles.value = []
    selectedUnidades.value = []
  }
  selectedRole.value = role
  submitError.value = ''
}

function plantelesByCity(city: typeof cities[number]) {
  return availablePlanteles.value.filter((plantel) => plantel.city === city)
}

function selectedInCity(city: typeof cities[number]) {
  const values = new Set(plantelesByCity(city).map((plantel) => plantel.value))
  return selectedPlanteles.value.filter((plantel) => values.has(plantel)).length
}

function togglePlantel(value: string) {
  selectedPlanteles.value = selectedPlanteles.value.includes(value)
    ? selectedPlanteles.value.filter((plantel) => plantel !== value)
    : [...selectedPlanteles.value, value]
  submitError.value = ''
}

function toggleUnidad(value: string) {
  selectedUnidades.value = selectedUnidades.value.includes(value)
    ? selectedUnidades.value.filter((unidad) => unidad !== value)
    : [...selectedUnidades.value, value]
  submitError.value = ''
}

async function refreshUnits() {
  submitError.value = ''
  await refresh()
}

async function completeOnboarding() {
  if (!selectedRole.value || !canSubmit.value || saving.value) return
  saving.value = true
  submitError.value = ''
  try {
    const result = await $fetch<CompleteInstitutionalOnboardingResponse>('/api/auth/institutional-onboarding', {
      method: 'POST',
      body: {
        role: selectedRole.value,
        planteles: selectedPlanteles.value,
        unidades: selectedUnidades.value
      }
    })
    setCachedRouteSession({ user: result.user, loggedin: true })
    finishing.value = true
    await new Promise((resolve) => setTimeout(resolve, 720))
    await navigateTo(result.defaultPath, { replace: true })
  } catch (error: any) {
    submitError.value = error?.data?.statusMessage || error?.data?.message || error?.statusMessage || 'No fue posible guardar la configuración.'
  } finally {
    saving.value = false
  }
}

async function changeAccount() {
  await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => null)
  setCachedRouteSession(anonymousSession)
  await navigateTo('/login', { replace: true })
}
</script>

<style scoped>
.onboarding-page {
  --iecs: #2f7d54;
  --iecs-deep: #245f42;
  --iecs-soft: #edf7f1;
  --iedis: #007f92;
  --iedis-deep: #006979;
  --iedis-soft: #ecf8fa;
  --sun: #eeb64d;
  --ink: #18342b;
  --muted: #6b7a72;
  --line: rgba(48, 105, 78, 0.15);
  background:
    radial-gradient(circle at 4% 0%, rgba(47, 125, 84, 0.12), transparent 25rem),
    radial-gradient(circle at 96% 4%, rgba(0, 127, 146, 0.1), transparent 28rem),
    linear-gradient(180deg, #fbfdf9 0%, #f2f7f2 100%);
  color: var(--ink);
  min-height: 100vh;
  padding: 18px;
}

.onboarding-topbar {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin: 0 auto 18px;
  max-width: 1460px;
}

.brand-lockup img {
  display: block;
  height: 54px;
  object-fit: contain;
  width: auto;
}

.account-chip {
  align-items: center;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(48, 105, 78, 0.14);
  border-radius: 999px;
  box-shadow: 0 12px 34px rgba(34, 76, 53, 0.07);
  display: flex;
  gap: 10px;
  padding: 6px 7px 6px 6px;
}

.account-avatar {
  align-items: center;
  background: linear-gradient(135deg, var(--iecs-soft), var(--iedis-soft));
  border: 1px solid rgba(47, 125, 84, 0.18);
  border-radius: 999px;
  color: var(--iecs-deep);
  display: flex;
  font-size: 0.72rem;
  font-weight: 850;
  height: 38px;
  justify-content: center;
  overflow: hidden;
  width: 38px;
}

.account-avatar img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.account-copy {
  display: grid;
  gap: 1px;
  max-width: 250px;
}

.account-copy strong,
.account-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-copy strong {
  color: var(--ink);
  font-size: 0.73rem;
}

.account-copy small {
  color: var(--muted);
  font-size: 0.58rem;
}

.account-exit {
  background: transparent;
  border: 0;
  border-left: 1px solid var(--line);
  color: var(--iedis-deep);
  cursor: pointer;
  font-size: 0.62rem;
  font-weight: 800;
  min-height: 34px;
  padding: 0 12px;
}

.onboarding-shell {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(47, 125, 84, 0.16);
  border-radius: 34px;
  box-shadow: 0 34px 90px rgba(38, 78, 56, 0.14);
  display: grid;
  grid-template-columns: minmax(340px, 0.78fr) minmax(620px, 1.22fr);
  margin: 0 auto;
  max-width: 1460px;
  min-height: min(800px, calc(100vh - 110px));
  overflow: hidden;
}

.onboarding-identity {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.92), rgba(239, 248, 241, 0.88)),
    url('/brand/husky-pass-login-ambient.png') center / cover no-repeat;
  border-right: 1px solid rgba(47, 125, 84, 0.13);
  display: flex;
  flex-direction: column;
  gap: 30px;
  overflow: hidden;
  padding: clamp(34px, 4vw, 64px);
  position: relative;
}

.identity-glow {
  border-radius: 999px;
  filter: blur(2px);
  opacity: 0.34;
  pointer-events: none;
  position: absolute;
}

.identity-glow--one {
  background: rgba(47, 125, 84, 0.25);
  height: 280px;
  right: -140px;
  top: 110px;
  width: 280px;
}

.identity-glow--two {
  background: rgba(0, 127, 146, 0.22);
  bottom: -90px;
  height: 240px;
  left: -90px;
  width: 240px;
}

.identity-brands,
.identity-copy,
.live-pass,
.progress-list {
  position: relative;
  z-index: 1;
}

.identity-brands {
  align-items: center;
  display: flex;
  gap: 10px;
}

.identity-brands img {
  height: 34px;
  object-fit: contain;
  width: auto;
}

.identity-knot {
  display: grid;
  height: 34px;
  place-items: center;
  position: relative;
  width: 25px;
}

.identity-knot i {
  border-radius: 999px;
  height: 29px;
  position: absolute;
  width: 8px;
}

.identity-knot i:first-child {
  background: linear-gradient(180deg, var(--iecs), var(--iedis));
  transform: rotate(42deg);
}

.identity-knot i:last-child {
  background: linear-gradient(180deg, var(--iedis), #72a84f);
  transform: rotate(-42deg);
}

.identity-copy {
  max-width: 430px;
}

.identity-eyebrow,
.workspace-kicker {
  color: var(--iedis-deep);
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  margin: 0 0 12px;
  text-transform: uppercase;
}

.identity-copy h1 {
  color: var(--ink);
  font-size: clamp(2.9rem, 5.2vw, 5.2rem);
  letter-spacing: -0.045em;
  line-height: 0.92;
  margin: 0 0 18px;
  max-width: 460px;
}

.identity-copy > p:last-child {
  color: #61746a;
  font-size: 1rem;
  line-height: 1.5;
  max-width: 330px;
}

.live-pass {
  background:
    radial-gradient(circle at 100% 0%, rgba(0, 127, 146, 0.13), transparent 42%),
    rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(47, 125, 84, 0.16);
  border-radius: 26px;
  box-shadow: 0 24px 50px rgba(42, 83, 60, 0.12);
  display: grid;
  gap: 20px;
  overflow: hidden;
  padding: 22px;
  position: relative;
}

.live-pass::before {
  background: linear-gradient(90deg, var(--iecs), #67a34e 45%, var(--iedis));
  content: '';
  height: 4px;
  inset: 0 0 auto;
  position: absolute;
}

.live-pass__topline,
.live-pass__footer {
  align-items: center;
  color: var(--muted);
  display: flex;
  font-size: 0.62rem;
  font-weight: 850;
  justify-content: space-between;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.live-pass__role {
  align-items: center;
  display: flex;
  gap: 14px;
}

.live-pass__icon {
  align-items: center;
  background: linear-gradient(135deg, var(--iecs-soft), var(--iedis-soft));
  border: 1px solid rgba(47, 125, 84, 0.16);
  border-radius: 18px;
  color: var(--iedis-deep);
  display: flex;
  height: 56px;
  justify-content: center;
  width: 56px;
}

.live-pass__icon[data-role='schoolAdmin'] { color: var(--iecs-deep); }
.live-pass__icon[data-role='marketingAdmin'] { color: var(--iedis-deep); }
.live-pass__icon[data-role='daycareAdmin'] { color: #5c813d; }

.live-pass__icon svg,
.role-card__icon svg,
.selection-check svg,
.role-card__check svg,
.primary-action svg,
.unit-card__mark svg {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.live-pass__icon svg {
  height: 28px;
  width: 28px;
}

.live-pass__role > span:last-child,
.live-pass__scope {
  display: grid;
  gap: 4px;
}

.live-pass small {
  color: var(--muted);
  font-size: 0.58rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.live-pass__role strong {
  color: var(--ink);
  font-family: var(--font-title);
  font-size: 1.35rem;
}

.live-pass__scope {
  border-top: 1px solid var(--line);
  padding-top: 17px;
}

.live-pass__scope > strong {
  color: #849188;
  font-size: 0.75rem;
}

.scope-token-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.scope-token-list span {
  background: linear-gradient(135deg, var(--iecs-soft), var(--iedis-soft));
  border: 1px solid rgba(47, 125, 84, 0.12);
  border-radius: 999px;
  color: var(--ink);
  font-size: 0.62rem;
  font-weight: 800;
  padding: 6px 8px;
}

.live-pass__footer {
  justify-content: flex-start;
  gap: 7px;
}

.status-dot {
  background: #a9b3ac;
  border-radius: 999px;
  height: 7px;
  width: 7px;
}

.live-pass[data-ready='true'] .status-dot {
  background: var(--iecs);
  box-shadow: 0 0 0 5px rgba(47, 125, 84, 0.1);
}

.progress-list {
  display: grid;
  gap: 8px;
  list-style: none;
  margin: auto 0 0;
  padding: 0;
}

.progress-list li {
  align-items: center;
  border-top: 1px solid rgba(47, 125, 84, 0.12);
  color: #8b9890;
  display: grid;
  font-size: 0.7rem;
  gap: 10px;
  grid-template-columns: 30px 1fr;
  padding-top: 11px;
}

.progress-list li span {
  font-size: 0.56rem;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.progress-list li[data-state='active'],
.progress-list li[data-state='complete'],
.progress-list li[data-state='ready'] {
  color: var(--ink);
}

.progress-list li[data-state='active'] span,
.progress-list li[data-state='ready'] span {
  color: var(--iedis-deep);
}

.onboarding-workspace {
  background:
    radial-gradient(circle at 92% 8%, rgba(0, 127, 146, 0.06), transparent 30%),
    rgba(255, 255, 255, 0.96);
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: clamp(34px, 4.4vw, 72px);
}

.workspace-header {
  align-items: end;
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 28px;
}

.workspace-header h2,
.workspace-state h2 {
  color: var(--ink);
  font-size: clamp(2rem, 3.5vw, 3.3rem);
  letter-spacing: -0.035em;
  line-height: 1;
  margin: 0;
  max-width: 720px;
}

.text-action,
.secondary-action {
  background: transparent;
  border: 0;
  color: var(--iedis-deep);
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 850;
  padding: 8px 0;
}

.role-grid {
  display: grid;
  gap: 13px;
}

.role-card {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(47, 125, 84, 0.14);
  border-radius: 22px;
  cursor: pointer;
  display: grid;
  gap: 16px;
  grid-template-columns: 66px minmax(0, 1fr) 30px;
  min-height: 118px;
  padding: 18px;
  position: relative;
  text-align: left;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease, background 0.18s ease;
  width: 100%;
}

.role-card::before {
  border-radius: 999px;
  content: '';
  inset: 18px auto 18px 0;
  opacity: 0;
  position: absolute;
  transition: opacity 0.18s ease;
  width: 4px;
}

.role-card--schoolAdmin::before { background: var(--iecs); }
.role-card--marketingAdmin::before { background: var(--iedis); }
.role-card--daycareAdmin::before { background: linear-gradient(180deg, #77a547, var(--sun)); }

.role-card:hover {
  border-color: rgba(47, 125, 84, 0.28);
  box-shadow: 0 18px 40px rgba(39, 81, 57, 0.09);
  transform: translateY(-2px);
}

.role-card[data-selected='true'] {
  background: linear-gradient(135deg, rgba(239, 248, 242, 0.92), rgba(239, 249, 250, 0.82));
  border-color: rgba(0, 127, 146, 0.34);
  box-shadow: 0 18px 44px rgba(39, 81, 57, 0.11);
}

.role-card[data-selected='true']::before { opacity: 1; }

.role-card__icon {
  align-items: center;
  background: linear-gradient(135deg, var(--iecs-soft), var(--iedis-soft));
  border-radius: 19px;
  color: var(--iecs-deep);
  display: flex;
  height: 62px;
  justify-content: center;
  width: 62px;
}

.role-card--marketingAdmin .role-card__icon { color: var(--iedis-deep); }
.role-card--daycareAdmin .role-card__icon { color: #638343; }

.role-card__icon svg {
  height: 30px;
  width: 30px;
}

.role-card__copy {
  display: grid;
  gap: 4px;
}

.role-card__copy small {
  color: var(--iedis-deep);
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.role-card__copy strong {
  color: var(--ink);
  font-family: var(--font-title);
  font-size: 1.35rem;
}

.role-card__copy span {
  color: var(--muted);
  font-size: 0.73rem;
}

.role-card__check,
.selection-check {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(47, 125, 84, 0.18);
  border-radius: 999px;
  color: transparent;
  display: flex;
  height: 28px;
  justify-content: center;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
  width: 28px;
}

.role-card__check svg,
.selection-check svg {
  height: 16px;
  width: 16px;
}

.role-card[data-selected='true'] .role-card__check,
.plantel-card[data-selected='true'] .selection-check,
.unit-card[data-selected='true'] .selection-check {
  background: linear-gradient(135deg, var(--iecs), var(--iedis));
  border-color: transparent;
  color: #fff;
}

.scope-selector {
  display: grid;
  gap: 26px;
}

.city-group {
  display: grid;
  gap: 12px;
}

.city-group > header {
  align-items: center;
  border-bottom: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  padding-bottom: 9px;
}

.city-group > header span {
  color: var(--ink);
  font-family: var(--font-title);
  font-size: 1rem;
}

.city-group > header small {
  color: var(--muted);
  font-size: 0.58rem;
  font-weight: 800;
}

.plantel-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.plantel-card,
.unit-card {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(47, 125, 84, 0.14);
  border-radius: 19px;
  cursor: pointer;
  display: grid;
  gap: 12px;
  grid-template-columns: 48px minmax(0, 1fr) 28px;
  min-height: 84px;
  padding: 13px;
  text-align: left;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease, background 0.18s ease;
}

.plantel-card:hover,
.unit-card:hover {
  border-color: rgba(0, 127, 146, 0.3);
  box-shadow: 0 14px 30px rgba(39, 81, 57, 0.07);
  transform: translateY(-1px);
}

.plantel-card[data-selected='true'],
.unit-card[data-selected='true'] {
  background: linear-gradient(135deg, rgba(239, 248, 242, 0.88), rgba(239, 249, 250, 0.78));
  border-color: rgba(0, 127, 146, 0.34);
}

.plantel-card__brand,
.unit-card__mark {
  align-items: center;
  background: #f8fbf8;
  border: 1px solid rgba(47, 125, 84, 0.1);
  border-radius: 15px;
  display: flex;
  height: 48px;
  justify-content: center;
  overflow: hidden;
  width: 48px;
}

.plantel-card__brand img {
  height: 34px;
  object-fit: contain;
  width: 38px;
}

.plantel-card__copy,
.unit-card > span:nth-child(2) {
  display: grid;
  gap: 2px;
}

.plantel-card__copy small,
.unit-card small {
  color: var(--iedis-deep);
  font-size: 0.52rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.plantel-card__copy strong,
.unit-card strong {
  color: var(--ink);
  font-size: 0.8rem;
}

.plantel-card__copy span {
  color: var(--muted);
  font-size: 0.6rem;
}

.unit-grid {
  display: grid;
  gap: 11px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.unit-card__mark {
  color: var(--iecs-deep);
}

.unit-card__mark svg {
  height: 24px;
  width: 24px;
}

.catalog-state {
  align-items: center;
  background:
    radial-gradient(circle at 12% 18%, rgba(47, 125, 84, 0.09), transparent 36%),
    linear-gradient(135deg, rgba(247, 252, 248, 0.98), rgba(241, 250, 251, 0.98));
  border: 1px solid rgba(0, 127, 146, 0.16);
  border-radius: 24px;
  display: grid;
  gap: 18px;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  min-height: 150px;
  padding: 24px;
}

.catalog-state__mark {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(47, 125, 84, 0.14);
  border-radius: 18px;
  box-shadow: 0 12px 28px rgba(39, 81, 57, 0.08);
  color: var(--iecs-deep);
  display: flex;
  height: 58px;
  justify-content: center;
  width: 58px;
}

.catalog-state__mark svg {
  height: 29px;
  width: 29px;
}

.catalog-state h3 {
  color: var(--ink);
  font-family: var(--font-title);
  font-size: 1.25rem;
  letter-spacing: -0.02em;
  margin: 3px 0 6px;
}

.catalog-state p:last-child {
  color: var(--muted);
  font-size: 0.7rem;
  line-height: 1.55;
  margin: 0;
  max-width: 460px;
}

.catalog-state .secondary-action {
  background: #fff;
  white-space: nowrap;
}

.catalog-state .secondary-action:disabled {
  cursor: wait;
  opacity: 0.62;
}

.workspace-footer {
  align-items: center;
  border-top: 1px solid var(--line);
  display: flex;
  gap: 18px;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 24px;
}

.selection-count {
  color: var(--muted);
  font-size: 0.66rem;
  font-weight: 750;
}

.primary-action {
  align-items: center;
  background: linear-gradient(118deg, var(--iecs) 0%, #438b57 43%, var(--iedis) 100%);
  border: 0;
  border-radius: 17px;
  box-shadow: 0 16px 34px rgba(24, 112, 92, 0.2);
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 850;
  gap: 12px;
  justify-content: center;
  min-height: 54px;
  min-width: 190px;
  padding: 0 20px;
  transition: box-shadow 0.18s ease, transform 0.18s ease, opacity 0.18s ease;
}

.primary-action:hover:not(:disabled) {
  box-shadow: 0 20px 38px rgba(24, 112, 92, 0.24);
  transform: translateY(-1px);
}

.primary-action:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.primary-action svg {
  height: 21px;
  width: 21px;
}

.button-spinner,
.loader-ring {
  animation: spin 0.8s linear infinite;
  border: 2px solid rgba(255, 255, 255, 0.38);
  border-radius: 999px;
  border-top-color: currentColor;
  height: 18px;
  width: 18px;
}

.loader-ring {
  border-color: rgba(0, 127, 146, 0.16);
  border-top-color: var(--iedis);
  height: 42px;
  width: 42px;
}

.workspace-state {
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 18px;
  justify-content: center;
  text-align: center;
}

.workspace-state h2 {
  font-size: 2rem;
}

.state-symbol {
  align-items: center;
  background: #fff1ee;
  border: 1px solid #f0c8c1;
  border-radius: 999px;
  color: #a84b41;
  display: flex;
  font-size: 1.1rem;
  font-weight: 900;
  height: 48px;
  justify-content: center;
  width: 48px;
}

.secondary-action {
  border: 1px solid rgba(0, 127, 146, 0.22);
  border-radius: 999px;
  padding: 10px 18px;
}

.submit-error {
  background: #fff4f1;
  border: 1px solid #efcfc8;
  border-radius: 14px;
  color: #94443d;
  font-size: 0.67rem;
  margin: 18px 0 0;
  padding: 11px 13px;
}

.finish-overlay {
  align-items: center;
  backdrop-filter: blur(18px);
  background: rgba(247, 252, 248, 0.92);
  display: flex;
  flex-direction: column;
  gap: 10px;
  inset: 0;
  justify-content: center;
  position: fixed;
  z-index: 50;
}

.finish-mark {
  display: grid;
  height: 86px;
  place-items: center;
  position: relative;
  width: 86px;
}

.finish-mark span {
  border-radius: 999px;
  height: 72px;
  position: absolute;
  width: 20px;
}

.finish-mark span:first-child {
  background: linear-gradient(180deg, var(--iecs), var(--iedis));
  transform: rotate(42deg);
}

.finish-mark span:last-child {
  background: linear-gradient(180deg, var(--iedis), #79a94f);
  transform: rotate(-42deg);
}

.finish-overlay strong {
  color: var(--ink);
  font-family: var(--font-title);
  font-size: 2rem;
}

.finish-overlay > span:last-child {
  color: var(--muted);
  font-size: 0.76rem;
}

.step-enter-active,
.step-leave-active,
.finish-enter-active,
.finish-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.step-enter-from { opacity: 0; transform: translateX(12px); }
.step-leave-to { opacity: 0; transform: translateX(-8px); }
.finish-enter-from,
.finish-leave-to { opacity: 0; }

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1080px) {
  .onboarding-shell {
    grid-template-columns: minmax(300px, 0.68fr) minmax(500px, 1.32fr);
  }

  .identity-copy h1 {
    font-size: clamp(2.6rem, 5vw, 4rem);
  }

  .onboarding-identity,
  .onboarding-workspace {
    padding: 34px;
  }
}

@media (max-width: 860px) {
  .onboarding-page { padding: 10px; }
  .onboarding-topbar { margin-bottom: 10px; }
  .account-copy { display: none; }
  .account-exit { border-left: 0; }

  .onboarding-shell {
    border-radius: 26px;
    grid-template-columns: 1fr;
  }

  .onboarding-identity {
    border-bottom: 1px solid var(--line);
    border-right: 0;
    display: grid;
    gap: 20px;
    grid-template-columns: minmax(0, 1fr) minmax(260px, 0.85fr);
    min-height: 330px;
  }

  .identity-brands { grid-column: 1; }
  .identity-copy { grid-column: 1; }
  .live-pass { grid-column: 2; grid-row: 1 / span 2; }
  .progress-list { grid-column: 1 / -1; grid-template-columns: repeat(3, 1fr); margin: 0; }

  .onboarding-workspace { min-height: 620px; }
}

@media (max-width: 640px) {
  .brand-lockup img { height: 44px; }
  .account-exit { font-size: 0.58rem; padding-inline: 7px; }

  .onboarding-identity {
    display: flex;
    min-height: auto;
    padding: 24px;
  }

  .identity-brands img { height: 27px; }
  .identity-copy h1 { font-size: 2.7rem; }
  .identity-copy > p:last-child { font-size: 0.84rem; }
  .live-pass { order: 3; }
  .progress-list { order: 4; }

  .onboarding-workspace {
    min-height: 650px;
    padding: 25px 20px 22px;
  }

  .workspace-header { align-items: start; margin-bottom: 22px; }
  .workspace-header h2 { font-size: 2rem; }
  .role-card { grid-template-columns: 54px minmax(0, 1fr) 28px; min-height: 104px; padding: 14px; }
  .role-card__icon { border-radius: 16px; height: 52px; width: 52px; }
  .role-card__copy strong { font-size: 1.1rem; }
  .role-card__copy span { font-size: 0.64rem; }

  .plantel-grid,
  .catalog-state {
    align-items: start;
    grid-template-columns: 48px minmax(0, 1fr);
    padding: 18px;
  }

  .catalog-state__mark {
    border-radius: 15px;
    height: 48px;
    width: 48px;
  }

  .catalog-state .secondary-action {
    grid-column: 1 / -1;
    justify-self: stretch;
    text-align: center;
  }

  .unit-grid { grid-template-columns: 1fr; }

  .workspace-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .primary-action { width: 100%; }
  .selection-count { text-align: center; }
}
</style>
