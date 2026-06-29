<template>
  <FamilyPersonasAutorizadasShell title="Hermanos">
    <FamilyPersonasPageHeader
      eyebrow="Familia"
      title="Alumnos vinculados"
      :description="siblingTitle"
      :theme="theme"
      ambassador-variant="hero"
      ambassador-title="Contexto familiar"
      ambassador-message="Cambia de alumno sin perder de vista a quién estás consultando."
      ambassador-tone="calm"
    >
      <template #actions>
        <div class="sibling-summary" aria-label="Resumen de alumnos">
          <span>
            <strong>{{ children.length || 0 }}</strong>
            alumnos
          </span>
          <span>
            <strong>{{ switchableSiblings.length }}</strong>
            disponibles
          </span>
        </div>
      </template>
    </FamilyPersonasPageHeader>

    <p v-if="loadError" class="alert" data-state="error">No fue posible cargar la vinculación familiar.</p>
    <div v-else-if="pending" class="card loading-row" data-product-loading>Cargando…</div>

    <section v-else class="sibling-workspace" data-product-panel="siblings" :data-state="siblingsState">
      <article v-if="currentChild" class="sibling-current-card">
        <div class="sibling-photo featured">
          <FamilyPersonasProcessedPhoto v-if="currentChild.foto" :src="currentChild.foto" :auto-process="false" namespace="pa-current-sibling-student" />
          <strong v-else>{{ initials(currentChild) }}</strong>
        </div>
        <div class="sibling-current-copy">
          <p class="eyebrow">Alumno en consulta</p>
          <h2>{{ childName(currentChild) || 'Alumno' }}</h2>
          <p>{{ [currentChild.nivelEdu, currentChild.grado, currentChild.grupo].filter(Boolean).join(' / ') || 'Datos pendientes' }}</p>
          <span v-if="currentChild.matricula" class="sibling-chip">Matricula {{ displayMatricula(currentChild.matricula) }}</span>
        </div>
      </article>

      <article v-else class="sibling-current-card empty-current">
        <span class="sibling-status-icon" aria-hidden="true"><FamilyPersonasIcon name="alert" /></span>
        <div class="sibling-current-copy">
          <p class="eyebrow">Alumno</p>
          <h2>Sin alumno activo</h2>
          <p>No encontramos una matricula vinculada a esta cuenta.</p>
        </div>
      </article>

      <aside class="sibling-status-card">
        <span class="sibling-status-icon" aria-hidden="true">
          <FamilyPersonasIcon :name="switchableSiblings.length ? 'check' : 'siblings'" />
        </span>
        <div class="sibling-status-copy">
          <p class="eyebrow">Estado familiar</p>
          <h2>{{ siblingTitle }}</h2>
          <p>{{ statusSummary }}</p>
        </div>
        <button class="btn btn-secondary retry-button" type="button" data-diagnostic-action="reintentar-hermanos" @click="retryLoad">
          <FamilyPersonasIcon name="replace" />
          Actualizar estado
        </button>
      </aside>

      <section v-if="linkedChildren.length" class="linked-students" aria-label="Alumnos relacionados">
        <header>
          <p class="eyebrow">Disponibles para cambio</p>
          <h2>Alumnos relacionados</h2>
        </header>
        <article v-for="child in linkedChildren" :key="child.matricula || child.id || childName(child)" class="sibling-card">
          <div class="sibling-photo">
            <FamilyPersonasProcessedPhoto v-if="child.foto" :src="child.foto" :auto-process="false" :namespace="`pa-sibling-${child.matricula || child.id || childName(child)}`" />
            <strong v-else>{{ initials(child) }}</strong>
          </div>
          <div>
            <p class="eyebrow">{{ siblingLabel(child) }}</p>
            <strong>{{ childName(child) || 'Alumno' }}</strong>
            <span>{{ [child.nivelEdu, child.grado, child.grupo].filter(Boolean).join(' / ') || 'Datos pendientes' }}</span>
            <small v-if="child.matricula" class="matricula-line">Matricula {{ displayMatricula(child.matricula) }}</small>
            <small v-if="!child.canSwitch">{{ unavailableReason(child) }}</small>
          </div>
          <button
            class="btn btn-primary pa-primary"
            type="button"
            :disabled="switching || !child.canSwitch"
            data-diagnostic-action="cambiar-alumno-vinculado"
            @click="switchToChild(child)"
          >
            {{ child.canSwitch ? 'Entrar' : 'No disponible' }}
          </button>
        </article>
      </section>
    </section>

    <p v-if="error" class="alert">{{ error }}</p>
    <p v-if="notice" class="notice">{{ notice }}</p>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePersonasFamilyPeople } from '~/composables/usePersonasTheme'
import type { AuthorizedChild } from '~/types/daycare'
import { displayMatricula } from '~/utils/matricula'
import { resolvePersonasTheme } from '~/utils/personasTheme'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })
const { data: people, pending, error: loadError, refresh } = usePersonasFamilyPeople()
const switching = ref(false)
const error = ref('')
const notice = ref('')
const children = computed<AuthorizedChild[]>(() => people.value?.find((person) => person.children?.length)?.children || [])
const currentChild = computed(() => children.value.find((child) => child.isCurrent) || children.value[0] || null)
const theme = computed(() => resolvePersonasTheme({
  matricula: currentChild.value?.matricula,
  plantel: currentChild.value?.plantel,
  nivelEdu: currentChild.value?.nivelEdu,
  campus: currentChild.value?.campus
}))
const matchedSiblings = computed(() => children.value.filter((child) => !child.isCurrent && child.siblingMatch === 'parents'))
const switchableSiblings = computed(() => matchedSiblings.value.filter((child) => child.canSwitch))
const linkedChildren = computed(() => children.value.filter((child) => !child.isCurrent))
const hasParentMatch = computed(() => matchedSiblings.value.length > 0)
const currentUnavailableCode = computed(() => String(currentChild.value?.siblingDiagnostics?.code || ''))
const hasOnlyCurrent = computed(() => children.value.length <= 1 && currentChild.value?.siblingMatch === 'current')
const siblingsState = computed(() => hasParentMatch.value ? 'content' : 'unavailable')
const siblingTitle = computed(() => {
  if (switchableSiblings.value.length) return `${switchableSiblings.value.length} ${switchableSiblings.value.length === 1 ? 'alumno vinculado' : 'alumnos vinculados'}`
  if (hasParentMatch.value) return 'Vinculación en preparación'
  if (hasOnlyCurrent.value) return 'Sin hermanos adicionales'
  return 'Sin hermanos disponibles'
})
const unavailableSummary = computed(() => {
  if (currentUnavailableCode.value === 'signature-index-missing') return 'Estamos preparando la vinculación familiar. Intenta de nuevo más tarde o solicita apoyo a la escuela.'
  if (currentUnavailableCode.value === 'incomplete-parent-signature') return 'Para buscar hermanos necesitamos los nombres completos de madre, padre o tutores.'
  if (hasOnlyCurrent.value) return 'No encontramos hermanos adicionales con datos completos de padre y madre.'
  if (!hasParentMatch.value) return 'Necesitamos los nombres completos de madre, padre o tutores para buscar hermanos.'
  return 'Algunos alumnos requieren cuenta familiar activa.'
})
const statusSummary = computed(() => {
  if (switchableSiblings.value.length) return 'Puedes cambiar de alumno sin salir de Personas Autorizadas.'
  return unavailableSummary.value
})

function childName(child: AuthorizedChild) {
  return [child.nombreA, child.paternoA, child.maternoA].filter(Boolean).join(' ')
}
function initials(child: AuthorizedChild) {
  const name = childName(child) || 'A'
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
}
function siblingLabel(child: AuthorizedChild) {
  if (child.siblingMatch === 'review') return 'Requiere revisión'
  return 'Vinculado'
}
function unavailableReason(child: AuthorizedChild) {
  if (child.siblingMatch === 'review') return 'Requiere revisión.'
  return 'Sin cuenta activa.'
}
function retryLoad() {
  return refresh()
}
async function switchToChild(child: AuthorizedChild) {
  if (!child.matricula || !child.canSwitch) return
  switching.value = true
  error.value = ''
  notice.value = ''
  try {
    await $fetch('/api/personas-autorizadas/sibling-session', { method: 'POST', body: { matricula: child.matricula } })
    notice.value = 'Alumno seleccionado.'
    if (import.meta.client) window.location.href = '/familia/personas-autorizadas'
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible cambiar de alumno.'
  } finally { switching.value = false }
}
</script>

<style scoped>
.loading-row,
.notice {
  border: 1px solid var(--pa-border);
  font-weight: 600;
}

.notice {
  background: var(--pa-soft);
  border-radius: var(--radius-lg);
  margin: 0;
  padding: 10px 12px;
}

.sibling-summary {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(112px, auto));
}

.sibling-summary span {
  background: linear-gradient(145deg, #fff, rgba(var(--pa-primary-rgb), .04));
  border: 1px solid var(--pa-border);
  border-radius: 16px;
  color: var(--pa-muted);
  display: grid;
  font-size: .72rem;
  font-weight: 850;
  gap: 3px;
  min-height: 64px;
  padding: 11px 14px;
  text-transform: uppercase;
}

.sibling-summary strong {
  color: var(--pa-gray);
  font-size: 1.3rem;
  line-height: 1;
}

.pa-primary {
  background: var(--pa-primary);
  color: var(--pa-contrast);
}

.sibling-workspace {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1.35fr) minmax(310px, .75fr);
}

.sibling-current-card,
.sibling-status-card,
.linked-students {
  background:
    radial-gradient(circle at 96% 10%, rgba(var(--pa-primary-rgb), .09), transparent 28%),
    linear-gradient(135deg, rgba(255, 255, 255, .98), rgba(250, 253, 255, .92));
  border: 1px solid rgba(211, 226, 239, .96);
  border-radius: 22px;
  box-shadow: 0 16px 36px rgba(27, 62, 96, .08);
}

.sibling-current-card {
  align-items: center;
  display: grid;
  gap: 18px;
  grid-template-columns: 112px minmax(0, 1fr);
  min-height: 190px;
  padding: clamp(18px, 2.2vw, 28px);
}

.empty-current {
  grid-template-columns: 58px minmax(0, 1fr);
}

.sibling-current-copy,
.sibling-status-copy {
  min-width: 0;
}

.eyebrow {
  color: var(--pa-primary);
  font-size: .7rem;
  font-weight: 900;
  letter-spacing: .14em;
  margin: 0 0 7px;
  text-transform: uppercase;
}

.sibling-current-copy h2,
.sibling-status-copy h2,
.linked-students h2 {
  color: #14284d;
  font-size: clamp(1.4rem, 2vw, 1.95rem);
  letter-spacing: -0.025em;
  line-height: 1.05;
  margin: 0;
}

.sibling-current-copy p:not(.eyebrow),
.sibling-status-copy p {
  color: #65728b;
  font-size: .94rem;
  font-weight: 700;
  line-height: 1.45;
  margin: 8px 0 0;
}

.sibling-chip,
.matricula-line {
  letter-spacing: .03em;
  text-transform: uppercase;
}

.sibling-chip {
  background: rgba(var(--pa-primary-rgb), .1);
  border: 1px solid rgba(var(--pa-primary-rgb), .18);
  border-radius: 999px;
  color: var(--pa-primary);
  display: inline-flex;
  font-size: .78rem;
  font-weight: 900;
  margin-top: 14px;
  min-height: 30px;
  padding: 7px 11px;
}

.sibling-photo {
  aspect-ratio: 1;
  background: #fff;
  border: 1px solid var(--pa-border);
  border-radius: 18px;
  color: var(--pa-primary);
  display: grid;
  font-family: var(--font-title);
  font-weight: 850;
  overflow: hidden;
  place-items: center;
}

.sibling-photo.featured {
  border-radius: 28px;
  box-shadow: 0 14px 28px rgba(31, 62, 96, .12);
  height: 112px;
  width: 112px;
}

.sibling-photo img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.sibling-status-card {
  align-content: start;
  display: grid;
  gap: 14px;
  grid-template-columns: 56px minmax(0, 1fr);
  padding: clamp(18px, 2vw, 24px);
}

.sibling-status-icon {
  align-items: center;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 18px;
  color: var(--pa-primary);
  display: inline-flex;
  height: 52px;
  justify-content: center;
  width: 52px;
}

.sibling-status-icon :deep(.pa-icon) {
  height: 1.45rem;
  width: 1.45rem;
}

.retry-button {
  gap: 8px;
  grid-column: 1 / -1;
  justify-self: start;
}

.linked-students {
  display: grid;
  gap: 10px;
  grid-column: 1 / -1;
  padding: clamp(14px, 1.7vw, 20px);
}

.linked-students header {
  display: grid;
  gap: 2px;
}

.linked-students h2 {
  font-size: clamp(1.1rem, 1.5vw, 1.35rem);
}

.sibling-card {
  align-items: center;
  background: rgba(255, 255, 255, .82);
  border: 1px solid rgba(211, 226, 239, .92);
  border-radius: 16px;
  display: grid;
  gap: 12px;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  padding: 12px;
}

.sibling-card .sibling-photo {
  height: 58px;
  width: 58px;
}

.sibling-card strong {
  color: var(--pa-gray);
  display: block;
  font-size: 1rem;
}

.sibling-card span,
.sibling-card small {
  color: var(--pa-muted);
  display: block;
  font-weight: 700;
}

@media (max-width: 900px) {
  .sibling-workspace {
    grid-template-columns: 1fr;
  }

  .sibling-current-card {
    min-height: 0;
  }
}

@media (max-width: 680px) {
  .sibling-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sibling-summary span {
    min-height: 60px;
    padding: 10px 12px;
  }

  .sibling-current-card {
    border-radius: 18px;
    gap: 13px;
    grid-template-columns: 74px minmax(0, 1fr);
    padding: 14px;
  }

  .sibling-photo.featured {
    border-radius: 20px;
    height: 74px;
    width: 74px;
  }

  .sibling-current-copy h2,
  .sibling-status-copy h2 {
    font-size: 1.08rem;
  }

  .sibling-current-copy p:not(.eyebrow),
  .sibling-status-copy p {
    font-size: .82rem;
  }

  .sibling-status-card {
    border-radius: 18px;
    grid-template-columns: 44px minmax(0, 1fr);
    padding: 14px;
  }

  .sibling-status-icon {
    border-radius: 14px;
    height: 42px;
    width: 42px;
  }

  .retry-button {
    justify-self: stretch;
  }

  .sibling-card {
    grid-template-columns: 50px minmax(0, 1fr);
  }

  .sibling-card .sibling-photo {
    height: 50px;
    width: 50px;
  }

  .sibling-card .btn {
    grid-column: 1 / -1;
  }
}
</style>
