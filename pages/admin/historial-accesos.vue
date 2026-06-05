<template>
  <section class="access-admin stack" data-product-area="admin-access-history">
    <header class="workspace-head compact-head access-head">
      <div>
        <p class="eyebrow">Personas Autorizadas</p>
        <h1>Historial de accesos</h1>
        <p>Consulta entradas y salidas agrupadas por alumno y fecha.</p>
      </div>
      <div class="head-actions">
        <a class="btn btn-secondary" :href="exportHref" data-diagnostic-action="exportar-accesos">Exportar CSV</a>
        <button class="btn btn-secondary" type="button" data-diagnostic-action="imprimir-accesos" @click="printReport">Imprimir / PDF</button>
        <button class="btn btn-primary" type="button" :disabled="pending" data-diagnostic-action="actualizar-accesos" @click="refreshReport">
          {{ pending ? 'Actualizando...' : 'Actualizar' }}
        </button>
      </div>
    </header>

    <section class="filters-card card">
      <label class="label">
        Desde
        <input v-model="startDate" class="input" type="date" data-diagnostic-filter="fecha-inicio" @change="syncRoute" />
      </label>
      <label class="label">
        Hasta
        <input v-model="endDate" class="input" type="date" data-diagnostic-filter="fecha-fin" @change="syncRoute" />
      </label>
      <label class="label">
        Plantel
        <select v-model="plantel" class="select" data-diagnostic-filter="plantel-accesos" @change="syncRoute">
          <option value="">Todos</option>
          <option v-for="option in data?.planteles || []" :key="option" :value="option">{{ option }}</option>
        </select>
      </label>
      <label class="label search-label">
        Buscar
        <input
          v-model="search"
          class="input"
          type="search"
          placeholder="Matrícula, alumno o persona autorizada"
          data-diagnostic-filter="buscar-accesos"
          @input="syncRouteDebounced"
        />
      </label>
    </section>

    <section v-if="data" class="metric-grid">
      <article><span>Días</span><strong>{{ data.summary.days }}</strong></article>
      <article><span>Entradas</span><strong>{{ data.summary.entries }}</strong></article>
      <article><span>Salidas</span><strong>{{ data.summary.exits }}</strong></article>
      <article><span>Alumnos</span><strong>{{ data.summary.students }}</strong></article>
      <article><span>Personas</span><strong>{{ data.summary.uniquePeople }}</strong></article>
    </section>

    <p v-if="loadError" class="alert" data-state="error">No fue posible cargar el historial de accesos.</p>
    <div v-else-if="pending && !data" class="card loading-card" data-product-loading data-state="loading">Cargando historial...</div>

    <section v-else-if="data?.days.length" class="report-layout" data-product-panel="admin-access-history" data-state="content">
      <article class="card report-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">{{ rangeLabel }}</p>
            <h2>{{ data.days.length }} registros consolidados</h2>
          </div>
          <span class="muted">{{ data.filters.limit }} eventos máximo</span>
        </div>

        <div class="table-wrap responsive-card-wrap">
          <table class="table responsive-table access-table">
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Fecha</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Personas</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="day in data.days" :key="day.key">
                <td data-label="Alumno">
                  <strong>{{ day.student.name }}</strong>
                  <small>{{ displayMatricula(day.student.matricula) }} · {{ [day.student.plantel, day.student.grado, day.student.grupo].filter(Boolean).join(' / ') }}</small>
                </td>
                <td data-label="Fecha">{{ dateLabel(day.date) }}</td>
                <td data-label="Entrada">
                  <strong>{{ day.entrada?.time || 'Sin registro' }}</strong>
                  <small>{{ day.entrada?.person.name || '' }}</small>
                </td>
                <td data-label="Salida">
                  <strong>{{ day.salida?.time || 'Sin registro' }}</strong>
                  <small>{{ day.salida?.person.name || '' }}</small>
                </td>
                <td data-label="Personas">
                  <span class="person-count">{{ day.people.length }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <aside class="card gallery-card" data-product-panel="admin-access-gallery">
        <p class="eyebrow">Galería</p>
        <h2>Personas autorizadas</h2>
        <div class="gallery-list">
          <article v-for="person in data.people" :key="person.id" class="gallery-person">
            <span class="gallery-photo">
              <FamilyPersonasProcessedPhoto v-if="person.photoUrl" :src="person.photoUrl" :namespace="`admin-access-person-${person.id}`" :alt="person.name" />
              <b v-else>{{ initials(person.name) }}</b>
            </span>
            <span>
              <strong>{{ person.name }}</strong>
              <small>{{ person.parentesco || 'Persona autorizada' }}</small>
            </span>
          </article>
        </div>
      </aside>
    </section>

    <div v-else-if="data" data-product-panel="admin-access-history" data-state="empty">
      <EmptyState title="Sin accesos" description="Ajusta fechas, plantel o búsqueda para encontrar registros." />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFetch, useRoute, useRouter } from 'nuxt/app'
import type { AdminAccessHistoryResponse } from '~/types/accessHistory'
import { formatAttendanceDate } from '~/utils/attendance'
import { displayMatricula } from '~/utils/personasTheme'

definePageMeta({ layout: 'admin', middleware: ['access-history-admin'] })

const route = useRoute()
const router = useRouter()
const startDate = ref(queryValue(route.query.startDate))
const endDate = ref(queryValue(route.query.endDate))
const plantel = ref(queryValue(route.query.plantel))
const search = ref(queryValue(route.query.search))
let syncTimer: ReturnType<typeof setTimeout> | null = null

const query = computed(() => ({
  startDate: startDate.value || undefined,
  endDate: endDate.value || undefined,
  plantel: plantel.value || undefined,
  search: search.value || undefined,
  limit: 700
}))

const { data, pending, error: loadError, refresh } = useFetch<AdminAccessHistoryResponse>('/api/admin/access-history', {
  query,
  watch: [query],
  timeout: 30000,
  key: 'admin-access-history'
})

const rangeLabel = computed(() => {
  if (!data.value) return ''
  return `${shortDate(data.value.range.startDate)} - ${shortDate(data.value.range.endDate)}`
})

const exportHref = computed(() => {
  const params = new URLSearchParams()
  if (startDate.value) params.set('startDate', startDate.value)
  if (endDate.value) params.set('endDate', endDate.value)
  if (plantel.value) params.set('plantel', plantel.value)
  if (search.value) params.set('search', search.value)
  params.set('limit', '1000')
  return `/api/admin/access-history/export?${params.toString()}`
})

function queryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || '').trim()
  return String(value || '').trim()
}

function syncRoute() {
  const next: Record<string, string> = {}
  if (startDate.value) next.startDate = startDate.value
  if (endDate.value) next.endDate = endDate.value
  if (plantel.value) next.plantel = plantel.value
  if (search.value.trim()) next.search = search.value.trim()
  router.replace({ path: route.path, query: next })
}

function syncRouteDebounced() {
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(syncRoute, 240)
}

function dateLabel(date: string) {
  return formatAttendanceDate(date)
}

function shortDate(date: string) {
  return formatAttendanceDate(date, 'short')
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'PA'
}

function printReport() {
  if (import.meta.client) window.print()
}

async function refreshReport() {
  await refresh()
}
</script>

<style scoped>
.access-admin {
  gap: 12px;
}

.access-head {
  grid-template-columns: minmax(0, 1fr) auto;
}

.head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filters-card {
  align-items: end;
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(140px, .44fr)) minmax(260px, 1fr);
}

.metric-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.metric-grid article {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: var(--shadow-line);
  display: grid;
  gap: 4px;
  padding: 12px 14px;
}

.metric-grid span,
.muted {
  color: var(--color-muted);
  font-size: .78rem;
  font-weight: 700;
}

.metric-grid span {
  letter-spacing: .08em;
  text-transform: uppercase;
}

.metric-grid strong {
  color: var(--color-ink);
  font-size: 1.55rem;
  line-height: 1;
}

.report-layout {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 360px);
}

.section-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-head h2,
.gallery-card h2 {
  font-size: 1.25rem;
  margin-bottom: 0;
}

.access-table {
  min-width: 980px;
}

.access-table strong,
.access-table small {
  display: block;
}

.access-table small {
  color: var(--color-muted);
  font-size: .78rem;
}

.person-count {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 999px;
  color: var(--color-brand-800);
  display: inline-flex;
  font-weight: 700;
  min-width: 30px;
  padding: 4px 9px;
}

.gallery-card {
  align-self: start;
  display: grid;
  gap: 12px;
  position: sticky;
  top: calc(var(--topbar-height) + 12px);
}

.gallery-list {
  display: grid;
  gap: 9px;
  max-height: 620px;
  overflow: auto;
  padding-right: 2px;
}

.gallery-person {
  align-items: center;
  background: #f8f8f6;
  border: 1px solid #ecece7;
  border-radius: 18px;
  display: grid;
  gap: 10px;
  grid-template-columns: 52px minmax(0, 1fr);
  padding: 8px;
}

.gallery-photo {
  aspect-ratio: 1;
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 16px;
  color: var(--color-brand-800);
  display: grid;
  font-weight: 700;
  overflow: hidden;
  place-items: center;
}

.gallery-person strong,
.gallery-person small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gallery-person small {
  color: var(--color-muted);
  font-size: .78rem;
  font-weight: 700;
}

.loading-card {
  color: var(--color-muted);
}

@media (max-width: 1180px) {
  .access-head,
  .filters-card,
  .report-layout {
    grid-template-columns: 1fr;
  }

  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .gallery-card {
    position: static;
  }

  .access-table {
    min-width: 0;
  }
}

@media print {
  .topbar,
  .filters-card,
  .head-actions,
  .gallery-card {
    display: none !important;
  }

  .report-layout,
  .access-head,
  .metric-grid {
    grid-template-columns: 1fr !important;
  }

  .report-card {
    border: 0;
    box-shadow: none;
  }
}
</style>
