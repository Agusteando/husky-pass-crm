<template>
  <FamilyPersonasAutorizadasShell title="Hermanos">
    <FamilyPersonasPageHeader
      eyebrow="Familia"
      title="Alumnos vinculados"
      :description="siblingTitle"
      :theme="theme"
      ambassador-variant="hero"
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

    <section v-else class="card sibling-list" data-product-panel="siblings" :data-state="siblingsState">
      <article v-for="child in children" :key="child.matricula || child.id || childName(child)" class="sibling-card" :class="{ current: child.isCurrent }">
        <div class="sibling-photo">
          <FamilyPersonasProcessedPhoto v-if="child.foto" :src="child.foto" :auto-process="false" :namespace="`pa-sibling-${child.matricula || child.id || childName(child)}`" />
          <strong v-else>{{ initials(child) }}</strong>
        </div>
        <div>
          <p class="eyebrow">{{ child.isCurrent ? 'Alumno actual' : siblingLabel(child) }}</p>
          <strong>{{ childName(child) || 'Alumno' }}</strong>
          <span>{{ [child.nivelEdu, child.grado, child.grupo].filter(Boolean).join(' / ') || 'Datos pendientes' }}</span>
          <small v-if="child.matricula" class="matricula-line">Matricula {{ displayMatricula(child.matricula) }}</small>
          <small v-if="!child.isCurrent && !child.canSwitch">{{ unavailableReason(child) }}</small>
        </div>
        <button
          v-if="!child.isCurrent"
          class="btn btn-primary pa-primary"
          type="button"
          :disabled="switching || !child.canSwitch"
          data-diagnostic-action="cambiar-alumno-vinculado"
          @click="switchToChild(child)"
        >
          {{ child.canSwitch ? 'Entrar' : 'No disponible' }}
        </button>
      </article>

      <div v-if="showUnavailable" class="empty-state">
        <FamilyPersonasAmbassador :theme="theme" variant="empty" compact decorative />
        <p>{{ unavailableSummary }}</p>
        <button class="btn btn-secondary retry-button" type="button" data-diagnostic-action="reintentar-hermanos" @click="retryLoad">Reintentar</button>
      </div>
    </section>

    <p v-if="error" class="alert">{{ error }}</p>
    <p v-if="notice" class="notice">{{ notice }}</p>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFetch } from 'nuxt/app'
import type { AuthorizedChild, AuthorizedPerson } from '~/types/daycare'
import { displayMatricula } from '~/utils/matricula'
import { resolvePersonasTheme } from '~/utils/personasTheme'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })
const { data: people, pending, error: loadError, refresh } = useFetch<AuthorizedPerson[]>('/api/personas-autorizadas/family', { key: 'pa-family-people', timeout: 15000, dedupe: 'defer' })
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
const hasParentMatch = computed(() => matchedSiblings.value.length > 0)
const currentUnavailableCode = computed(() => String(currentChild.value?.siblingDiagnostics?.code || ''))
const hasOnlyCurrent = computed(() => children.value.length <= 1 && currentChild.value?.siblingMatch === 'current')
const showUnavailable = computed(() => hasOnlyCurrent.value || Boolean(currentUnavailableCode.value) || switchableSiblings.value.length !== matchedSiblings.value.length)
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
.loading-row, .notice { border: 1px solid var(--pa-border); font-weight: 600; }
.notice { background: var(--pa-soft); border-radius: var(--radius-lg); margin: 0; padding: 10px 12px; }
.sibling-summary { display: grid; gap: 8px; grid-template-columns: repeat(2, minmax(96px, auto)); }
.sibling-summary span { background: #fff; border: 1px solid var(--pa-border); border-radius: var(--radius-md); color: var(--pa-muted); display: grid; font-size: .76rem; font-weight: 700; gap: 2px; padding: 10px 12px; text-transform: uppercase; }
.sibling-summary strong { color: var(--pa-gray); font-size: 1.15rem; }
.sibling-list { display: grid; gap: 12px; }
.pa-primary { background: var(--pa-primary); color: var(--pa-contrast); }
.sibling-card { align-items: center; background: #fff; border: 1px solid #ecece7; border-radius: var(--radius-lg); display: grid; gap: 12px; grid-template-columns: 56px minmax(0, 1fr) auto; padding: 10px; }
.sibling-card.current { background: var(--pa-soft); border-color: var(--pa-border); }
.sibling-photo { aspect-ratio: 1; background: #fff; border: 1px solid var(--pa-border); border-radius: var(--radius-md); color: var(--pa-primary); display: grid; font-weight: 600; overflow: hidden; place-items: center; }
.sibling-photo img { height: 100%; object-fit: cover; width: 100%; }
.sibling-card strong { color: var(--pa-gray); display: block; }
.sibling-card span, .sibling-card small { color: var(--pa-muted); display: block; font-weight: 600; }
.matricula-line { letter-spacing: 0; text-transform: uppercase; }
.empty-state { align-items: center; background: var(--pa-soft); border: 1px solid var(--pa-border); border-radius: var(--radius-lg); color: var(--pa-muted); display: grid; font-weight: 700; gap: 10px; grid-template-columns: 72px minmax(0, 1fr) auto; padding: 10px 12px; }
.retry-button { justify-self: end; }
@media (max-width: 680px) { .sibling-card { grid-template-columns: 1fr; } .sibling-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); } .sibling-photo { width: 64px; } .empty-state { grid-template-columns: 58px minmax(0, 1fr); } .retry-button { grid-column: 1 / -1; justify-self: start; } }
</style>
