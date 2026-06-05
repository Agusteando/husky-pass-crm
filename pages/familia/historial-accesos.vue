<template>
  <FamilyPersonasAutorizadasShell title="Historial de accesos">
    <section class="access-page" :data-state="pageState" data-product-panel="family-access-history">
      <section class="card access-hero">
        <div>
          <p class="eyebrow">Historial de accesos</p>
          <h1>{{ heroTitle }}</h1>
          <p>{{ heroSubtitle }}</p>
        </div>

        <div v-if="data" class="access-filters">
          <label v-if="children.length > 1" class="control-label">
            <span>Alumno</span>
            <select v-model="selectedMatricula" class="select" data-testid="access-child-select" @change="syncRoute">
              <option v-for="child in children" :key="child.matricula" :value="child.matricula">{{ child.name }}</option>
            </select>
          </label>
          <label class="control-label">
            <span>Desde</span>
            <input v-model="startDate" class="input" type="date" data-testid="access-start-date" @change="syncRoute" />
          </label>
          <label class="control-label">
            <span>Hasta</span>
            <input v-model="endDate" class="input" type="date" data-testid="access-end-date" @change="syncRoute" />
          </label>
        </div>
      </section>

      <p v-if="loadError" class="alert" data-state="error">No fue posible cargar el historial de accesos.</p>

      <section v-else-if="pending && !data" class="loading-grid" data-state="loading">
        <span v-for="item in 3" :key="item" class="loading-card"></span>
      </section>

      <template v-else-if="data">
        <section class="summary-grid">
          <article class="summary-card primary">
            <span>Días con acceso</span>
            <strong>{{ data.summary.days }}</strong>
            <small>{{ rangeLabel }}</small>
          </article>
          <article class="summary-card">
            <span>Entradas</span>
            <strong>{{ data.summary.entries }}</strong>
            <small>Registradas por escuela</small>
          </article>
          <article class="summary-card">
            <span>Salidas</span>
            <strong>{{ data.summary.exits }}</strong>
            <small>Con persona autorizada</small>
          </article>
          <article class="summary-card">
            <span>Personas</span>
            <strong>{{ data.summary.uniquePeople }}</strong>
            <small>Vistas en el periodo</small>
          </article>
        </section>

        <section v-if="data.people.length" class="card people-strip" data-product-panel="authorized-person-gallery">
          <header class="section-head compact">
            <div>
              <p class="eyebrow">Personas autorizadas</p>
              <h2>Quién ha registrado acceso</h2>
            </div>
          </header>
          <div class="people-list">
            <article v-for="person in data.people" :key="person.id" class="person-chip">
              <span class="person-photo">
                <FamilyPersonasProcessedPhoto v-if="person.photoUrl" :src="person.photoUrl" :namespace="`access-person-${person.id}`" :alt="person.name" />
                <b v-else>{{ initials(person.name) }}</b>
              </span>
              <span>
                <strong>{{ person.name }}</strong>
                <small>{{ person.parentesco || 'Persona autorizada' }}</small>
              </span>
            </article>
          </div>
        </section>

        <section v-if="data.days.length" class="access-days" data-product-panel="access-days">
          <article v-for="day in data.days" :key="day.key" class="day-card" :data-status="day.status">
            <div class="date-tile">
              <strong>{{ dayNumber(day.date) }}</strong>
              <span>{{ monthShort(day.date) }}</span>
            </div>
            <div class="day-copy">
              <p class="eyebrow">{{ dateLabel(day.date) }}</p>
              <h2>{{ day.student.name }}</h2>
              <p>{{ displayMatricula(day.student.matricula) }} · {{ [day.student.plantel, day.student.grado, day.student.grupo].filter(Boolean).join(' / ') }}</p>
            </div>
            <div class="access-pair">
              <AccessPoint label="Entrada" :action="day.entrada" />
              <AccessPoint label="Salida" :action="day.salida" />
            </div>
          </article>
        </section>

        <section v-else class="card empty-state" data-state="empty">
          <FamilyPersonasIcon name="calendar" />
          <div>
            <p class="eyebrow">{{ rangeLabel }}</p>
            <h2>Sin accesos en este periodo</h2>
            <p>No hay entradas o salidas registradas para este alumno en las fechas seleccionadas.</p>
          </div>
        </section>
      </template>
    </section>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFetch, useRoute, useRouter } from 'nuxt/app'
import type { FamilyAccessHistoryResponse } from '~/types/accessHistory'
import { formatAttendanceDate } from '~/utils/attendance'
import { displayMatricula } from '~/utils/personasTheme'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

const route = useRoute()
const router = useRouter()
const selectedMatricula = ref(queryValue(route.query.matricula))
const startDate = ref(queryValue(route.query.startDate))
const endDate = ref(queryValue(route.query.endDate))

const requestQuery = computed(() => ({
  matricula: selectedMatricula.value || undefined,
  startDate: startDate.value || undefined,
  endDate: endDate.value || undefined
}))

const { data, pending, error: loadError } = useFetch<FamilyAccessHistoryResponse>('/api/family/access-history', {
  query: requestQuery,
  timeout: 30000,
  watch: [requestQuery],
  key: 'family-access-history'
})

const children = computed(() => data.value?.children || [])
const heroTitle = computed(() => data.value?.selectedChild.name || 'Historial de accesos')
const heroSubtitle = computed(() => {
  if (!data.value) return 'Entradas y salidas registradas por personas autorizadas.'
  return `${displayMatricula(data.value.selectedChild.matricula)} · ${rangeLabel.value}`
})
const rangeLabel = computed(() => {
  if (!data.value) return ''
  return `${shortDate(data.value.range.startDate)} - ${shortDate(data.value.range.endDate)}`
})
const pageState = computed(() => {
  if (loadError.value) return 'error'
  if (pending.value && !data.value) return 'loading'
  if (!data.value || !data.value.days.length) return 'empty'
  return 'content'
})

watch(data, (value) => {
  if (!value) return
  if (!selectedMatricula.value) selectedMatricula.value = value.selectedChild.matricula
  if (!startDate.value) startDate.value = value.range.startDate
  if (!endDate.value) endDate.value = value.range.endDate
}, { immediate: true })

function queryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || '').trim()
  return String(value || '').trim()
}

function syncRoute() {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      matricula: selectedMatricula.value || undefined,
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined
    }
  })
}

function dateLabel(date: string) {
  return formatAttendanceDate(date)
}

function shortDate(date: string) {
  return formatAttendanceDate(date, 'short')
}

function dayNumber(date: string) {
  return String(Number(date.slice(8, 10)) || '')
}

function monthShort(date: string) {
  return new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(new Date(`${date}T12:00:00`))
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'PA'
}
</script>

<script lang="ts">
import { defineComponent, h, type PropType } from 'vue'
import type { AccessHistoryAction } from '~/types/accessHistory'

export default defineComponent({
  components: {
    AccessPoint: defineComponent({
      props: {
        label: { type: String, required: true },
        action: { type: Object as PropType<AccessHistoryAction | null | undefined>, default: null }
      },
      setup(props) {
        return () => h('article', { class: ['access-point', props.action ? 'ready' : 'missing'] }, [
          h('span', props.label),
          props.action
            ? [
                h('strong', props.action.time),
                h('small', `${props.action.person.name}${props.action.person.parentesco ? ` · ${props.action.person.parentesco}` : ''}`)
              ]
            : [
                h('strong', 'Sin registro'),
                h('small', 'No hay evento capturado')
              ]
        ])
      }
    })
  }
})
</script>

<style scoped>
.access-page {
  display: grid;
  gap: 16px;
}

.access-hero {
  align-items: end;
  background:
    radial-gradient(circle at 92% 12%, rgba(var(--pa-primary-rgb), .18), transparent 28%),
    linear-gradient(135deg, #fff, rgba(var(--pa-primary-rgb), .08));
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(320px, .85fr);
}

.access-hero h1,
.section-head h2,
.day-copy h2,
.empty-state h2 {
  margin-bottom: 0;
}

.access-filters {
  align-items: end;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(160px, 1fr) repeat(2, minmax(132px, .65fr));
}

.control-label {
  color: var(--pa-muted);
  display: grid;
  font-size: .76rem;
  font-weight: 700;
  gap: 6px;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.summary-grid,
.loading-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.summary-card,
.loading-card {
  border-radius: 20px;
  min-height: 116px;
}

.summary-card {
  background: #fff;
  border: 1px solid #ecece7;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 8px;
  padding: 16px;
}

.summary-card.primary {
  background: linear-gradient(135deg, rgba(var(--pa-primary-rgb), .12), #fff);
  border-color: var(--pa-border);
}

.summary-card span,
.summary-card small {
  color: var(--pa-muted);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.summary-card strong {
  color: var(--pa-gray);
  font-family: var(--font-title);
  font-size: clamp(2rem, 4vw, 3.15rem);
  line-height: .95;
}

.loading-card {
  animation: pulse 1.1s ease-in-out infinite alternate;
  background: linear-gradient(90deg, rgba(255,255,255,.68), rgba(var(--pa-primary-rgb), .12), rgba(255,255,255,.68));
  border: 1px solid var(--pa-border);
}

@keyframes pulse {
  from { opacity: .55; }
  to { opacity: 1; }
}

.people-strip {
  display: grid;
  gap: 12px;
}

.section-head.compact {
  display: flex;
  justify-content: space-between;
}

.people-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.person-chip {
  align-items: center;
  background: #f8f8f6;
  border: 1px solid #ecece7;
  border-radius: 999px;
  display: grid;
  flex: 0 0 min(280px, 82vw);
  gap: 10px;
  grid-template-columns: 48px minmax(0, 1fr);
  padding: 6px 12px 6px 6px;
}

.person-photo {
  aspect-ratio: 1;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 999px;
  color: var(--pa-primary);
  display: grid;
  font-weight: 700;
  overflow: hidden;
  place-items: center;
}

.person-chip strong,
.person-chip small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.person-chip small {
  color: var(--pa-muted);
  font-size: .78rem;
  font-weight: 700;
}

.access-days {
  display: grid;
  gap: 12px;
}

.day-card {
  align-items: center;
  background: #fff;
  border: 1px solid #ecece7;
  border-radius: 22px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 14px;
  grid-template-columns: 72px minmax(0, 1fr) minmax(320px, .9fr);
  padding: 14px;
}

.day-card[data-status='entrada-salida'] {
  border-color: var(--pa-border);
}

.date-tile {
  aspect-ratio: 1;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 18px;
  color: var(--pa-primary);
  display: grid;
  place-items: center;
  text-align: center;
}

.date-tile strong {
  font-family: var(--font-title);
  font-size: 1.7rem;
  line-height: 1;
}

.date-tile span {
  font-size: .68rem;
  font-weight: 700;
  text-transform: uppercase;
}

.day-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.day-copy p:not(.eyebrow) {
  color: var(--pa-muted);
  font-weight: 700;
  margin: 0;
}

.access-pair {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

:deep(.access-point) {
  background: #f8f8f6;
  border: 1px solid #ecece7;
  border-radius: 16px;
  display: grid;
  gap: 3px;
  min-height: 78px;
  padding: 12px;
}

:deep(.access-point.ready) {
  background: rgba(var(--pa-primary-rgb), .08);
  border-color: var(--pa-border);
}

:deep(.access-point > span),
:deep(.access-point small) {
  color: var(--pa-muted);
  font-size: .76rem;
  font-weight: 700;
}

:deep(.access-point > span) {
  letter-spacing: .08em;
  text-transform: uppercase;
}

:deep(.access-point strong) {
  color: var(--pa-gray);
  font-size: 1.15rem;
}

.empty-state {
  align-items: center;
  display: grid;
  gap: 16px;
  grid-template-columns: 56px minmax(0, 1fr);
}

.empty-state :deep(svg) {
  color: var(--pa-primary);
  height: 44px;
  width: 44px;
}

@media (max-width: 1040px) {
  .access-hero,
  .day-card {
    grid-template-columns: 1fr;
  }

  .summary-grid,
  .loading-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .access-filters,
  .summary-grid,
  .loading-grid,
  .access-pair,
  .empty-state {
    grid-template-columns: 1fr;
  }

  .date-tile {
    width: 72px;
  }
}
</style>
