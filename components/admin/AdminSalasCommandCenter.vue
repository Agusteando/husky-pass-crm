<template>
  <section class="daycare-console" data-product-area="daycare" data-product-screen="rooms-console">
    <template v-if="clientReady">
      <header class="ops-bar">
        <div>
          <p class="eyebrow">Guardería</p>
          <h1>{{ selectedUnidad || 'Salas' }}</h1>
        </div>
        <div class="head-controls">
          <label>
            <span>Unidad</span>
            <select v-model="selectedUnidad" data-diagnostic-filter="unidad" @change="syncUnidad">
              <option v-for="unidad in unidades" :key="unidad" :value="unidad">{{ unidad }}</option>
            </select>
          </label>
          <label>
            <span>Buscar</span>
            <input v-model="search" type="search" placeholder="Sala" data-diagnostic-filter="buscar-sala" />
          </label>
        </div>
      </header>

      <section v-if="noUnidadAvailable" class="state-panel" data-product-panel="daycare-unidades" data-state="unavailable">
        <FamilyPersonasIcon name="daycare" />
        <h2>Unidad pendiente</h2>
      </section>

      <p v-if="error" class="surface-message error">No fue posible cargar salas.</p>
      <p v-if="actionError" class="surface-message error">{{ actionError }}</p>
      <p v-if="actionNotice" class="surface-message">{{ actionNotice }}</p>
      <div v-if="pending || unitsPending" class="state-panel" data-product-loading>
        <HuskyPassLoader label="Salas" contained />
      </div>

      <section v-else-if="!noUnidadAvailable" class="rooms-workbench">
        <aside class="rooms-pane" data-product-panel="salas-list" :data-state="filteredSalas.length ? 'content' : 'empty'">
          <div class="pane-title">
            <div>
              <p class="eyebrow">Salas</p>
              <h2>{{ filteredSalas.length }} visibles</h2>
            </div>
          </div>

          <div v-if="filteredSalas.length" class="room-list" role="list">
            <button
              v-for="sala in filteredSalas"
              :key="sala.id"
              class="room-row"
              :class="{ active: sala.id === selectedSalaId }"
              type="button"
              data-diagnostic-sala-option
              :data-sala-id="String(sala.id)"
              :aria-pressed="sala.id === selectedSalaId"
              @click="selectSala(sala.id)"
            >
              <span class="room-avatar">{{ roomInitials(sala.sala) }}</span>
              <span class="room-copy">
                <strong>{{ sala.sala }}</strong>
                <small>{{ sala.metrics.familias }} familias · {{ sala.metrics.totalRecursos }} publicaciones</small>
              </span>
            </button>
          </div>
          <div v-else class="state-panel compact" data-diagnostic="sala-unavailable" data-state="empty">
            <FamilyPersonasIcon name="daycare" />
            <h2>Sin salas</h2>
          </div>
        </aside>

        <article v-if="selectedSala" class="room-detail" data-diagnostic="sala-context" data-product-panel="sala-context" data-state="content">
          <div class="room-head">
            <span class="room-avatar large">{{ roomInitials(selectedSala.sala) }}</span>
            <div>
              <p class="eyebrow">{{ selectedSala.unidad }}</p>
              <h2>{{ selectedSala.sala }}</h2>
            </div>
            <button v-if="canPreviewAsFamily" class="btn btn-secondary" type="button" data-diagnostic-action="preview-sala" @click="previewSala(selectedSala.id)">Vista familiar</button>
          </div>

          <section class="room-facts" aria-label="Resumen de sala">
            <article><span>Familias</span><strong>{{ selectedSala.metrics.familias }}</strong></article>
            <article><span>Tareas</span><strong>{{ selectedSala.metrics.tareas }}</strong></article>
            <article><span>Avisos</span><strong>{{ selectedSala.metrics.avisos }}</strong></article>
            <article><span>Fechas</span><strong>{{ selectedSala.metrics.calendario }}</strong></article>
          </section>
        </article>

        <aside v-if="selectedSala" class="action-panel">
          <header class="pane-title">
            <div>
              <p class="eyebrow">Operar sala</p>
              <h2>{{ selectedSala.sala }}</h2>
              <small>{{ selectedSala.unidad }}</small>
            </div>
          </header>
          <div class="action-list">
            <button
              v-for="item in actionItems"
              :key="item.section"
              type="button"
              :data-diagnostic-action="item.diagnostic"
              @click="goToSalaSection(item.section, item.create)"
            >
              <span class="action-icon"><FamilyPersonasIcon :name="item.icon" /></span>
              <span class="action-copy">
                <strong>{{ item.label }}</strong>
                <small>{{ item.description }}</small>
              </span>
              <b>{{ item.count }}</b>
            </button>
          </div>
        </aside>
      </section>
    </template>
    <div v-else class="state-panel" data-product-loading>
      <HuskyPassLoader label="Salas" contained />
    </div>
  </section>
</template>


<script setup lang="ts">
import { useAppSession } from '~/composables/useAppSession'
import { computed, onMounted, ref, watch } from 'vue'
import { navigateTo, useFetch, useRoute, useRouter } from 'nuxt/app'
import type { SalaSummary } from '~/types/daycare'
import type { PublicSession } from '~/types/session'
import { setCachedRouteSession } from '~/utils/routeSession'
import { hasDaycareAdminScope } from '~/utils/sessionScopes'

type DaycareSalaSection = 'familias' | 'tareas' | 'avisos' | 'calendario'

const route = useRoute()
const router = useRouter()
const { data: session, pending: sessionPending } = useAppSession()

const selectedUnidad = ref(typeof route.query.unidad === 'string' ? route.query.unidad : '')
const search = ref(typeof route.query.buscar === 'string' ? route.query.buscar : '')
const selectedSalaId = ref<number | null>(normalizeSalaQuery(route.query.sala))
const actionError = ref('')
const actionNotice = ref('')
const clientReady = ref(false)
const canPreviewAsFamily = computed(() => hasDaycareAdminScope(session.value?.user))

onMounted(() => {
  clientReady.value = true
})

const { data: unitOptions, pending: unitsPending } = useFetch<{ unidades: string[] }>('/api/daycare/admin/salas/units', {
  timeout: 15000,
  dedupe: 'cancel'
})

const sessionUnidades = computed(() => session.value?.user?.unidades || [])
const unidades = computed(() => {
  const fromApi = (unitOptions.value?.unidades || []).filter(Boolean)
  return fromApi.length ? fromApi : sessionUnidades.value
})
const noUnidadAvailable = computed(() => !sessionPending.value && !unitsPending.value && unidades.value.length === 0)

watch(unidades, (value) => {
  if (!value.length) return
  if (!selectedUnidad.value || !value.includes(selectedUnidad.value)) {
    selectedUnidad.value = value[0]
    selectedSalaId.value = null
    syncQuery()
  }
}, { immediate: true })

watch(() => route.query.unidad, (value) => {
  if (typeof value === 'string' && value && value !== selectedUnidad.value) selectedUnidad.value = value
})

watch(() => route.query.buscar, (value) => {
  const next = typeof value === 'string' ? value : ''
  if (next !== search.value) search.value = next
})

watch(() => route.query.sala, (value) => {
  const next = normalizeSalaQuery(value)
  if (next !== selectedSalaId.value) selectedSalaId.value = next
})

watch(search, () => syncQuery())

const { data: salas, pending, error } = useFetch<SalaSummary[]>('/api/daycare/admin/salas/overview', {
  query: computed(() => ({ unidad: selectedUnidad.value })),
  watch: [selectedUnidad],
  timeout: 15000,
  dedupe: 'cancel'
})

const filteredSalas = computed(() => {
  const needle = search.value.trim().toLowerCase()
  const rows = salas.value || []
  if (!needle) return rows
  return rows.filter((sala) => `${sala.sala} ${sala.unidad}`.toLowerCase().includes(needle))
})

const selectedSala = computed(() => filteredSalas.value.find((sala) => sala.id === selectedSalaId.value) || filteredSalas.value[0] || null)
const actionItems = computed<Array<{ section: DaycareSalaSection; diagnostic: string; icon: string; label: string; description: string; count: number; create?: boolean }>>(() => {
  const sala = selectedSala.value
  if (!sala) return []
  return [
    { section: 'familias', diagnostic: 'abrir-familias', icon: 'people', label: 'Familias', description: 'Cuentas y soporte', count: sala.metrics.familias },
    { section: 'tareas', diagnostic: 'abrir-tareas', icon: 'edit', label: 'Preparar tarea', description: 'Trabajo en casa', count: sala.metrics.tareas, create: true },
    { section: 'avisos', diagnostic: 'abrir-avisos', icon: 'announcement', label: 'Avisos', description: 'Mensajes de sala', count: sala.metrics.avisos },
    { section: 'calendario', diagnostic: 'abrir-calendario', icon: 'calendar', label: 'Calendario', description: 'Fechas visibles', count: sala.metrics.calendario }
  ]
})

watch(filteredSalas, (rows) => {
  if (!rows.length) {
    selectedSalaId.value = null
    syncQuery()
    return
  }

  const routeSala = normalizeSalaQuery(route.query.sala)
  if (routeSala && rows.some((sala) => sala.id === routeSala)) {
    selectedSalaId.value = routeSala
    return
  }

  if (!selectedSalaId.value || !rows.some((sala) => sala.id === selectedSalaId.value)) {
    selectedSalaId.value = rows[0].id
    syncQuery()
  }
}, { immediate: true })

function syncUnidad() {
  actionError.value = ''
  actionNotice.value = ''
  selectedSalaId.value = null
  syncQuery()
}

function selectSala(id: number) {
  actionError.value = ''
  actionNotice.value = ''
  selectedSalaId.value = id
  syncQuery()
}

function syncQuery() {
  const query: Record<string, string> = {}
  if (selectedUnidad.value) query.unidad = selectedUnidad.value
  if (selectedSalaId.value) query.sala = String(selectedSalaId.value)
  if (search.value.trim()) query.buscar = search.value.trim()
  replaceQueryIfChanged(query)
}

function goToSalaSection(section: DaycareSalaSection, create = false) {
  actionError.value = ''
  if (!selectedSala.value?.id) return
  const query: Record<string, string> = {}
  if (selectedUnidad.value) query.unidad = selectedUnidad.value
  if (create) query.create = '1'
  navigateTo({ path: `/admin/daycare/salas/${selectedSala.value.id}/${section}`, query })
}

async function previewSala(id: number) {
  actionError.value = ''
  actionNotice.value = ''
  try {
    const response = await $fetch<PublicSession>('/api/auth/admin/preview-daycare', { method: 'POST', body: { sala: id } })
    actionNotice.value = 'Abriendo vista familiar de sala.'
    setCachedRouteSession(response)
    await navigateTo('/familia/daycare')
  } catch (err: any) {
    actionError.value = err?.data?.message || err?.data?.statusMessage || err?.message || err?.statusMessage || 'No fue posible abrir la vista familiar.'
  }
}

function normalizeSalaQuery(value: unknown) {
  const source = Array.isArray(value) ? value[0] : value
  const id = Number(source || 0)
  return Number.isInteger(id) && id > 0 ? id : null
}

function replaceQueryIfChanged(query: Record<string, string>) {
  if (!import.meta.client || !clientReady.value) return
  const keys = new Set([...Object.keys(route.query), ...Object.keys(query)])
  const changed = Array.from(keys).some((key) => {
    const current = Array.isArray(route.query[key]) ? route.query[key]?.[0] : route.query[key]
    return String(current || '') !== String(query[key] || '')
  })
  if (changed) router.replace({ path: route.path, query })
}

function roomInitials(value?: string | null) {
  return String(value || 'S')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
</script>


<style scoped>
.daycare-console {
  --ink: #102235;
  --muted: #607086;
  --line: rgba(18, 95, 89, 0.16);
  --line-soft: rgba(18, 95, 89, 0.10);
  --accent: #07877d;
  --accent-dark: #075f58;
  --sun: #f6b94f;
  display: grid;
  gap: 16px;
}

.ops-bar,
.rooms-pane,
.room-detail,
.action-panel,
.state-panel {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: 0 22px 58px rgba(14, 40, 55, 0.08);
}

.ops-bar {
  align-items: center;
  background:
    radial-gradient(circle at 10% 20%, rgba(8, 135, 125, 0.13), transparent 34%),
    radial-gradient(circle at 86% 0%, rgba(246, 185, 79, 0.20), transparent 30%),
    linear-gradient(135deg, #ffffff, #fbfdf6);
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(420px, 0.78fr);
  overflow: hidden;
  padding: clamp(18px, 2.4vw, 28px);
  position: relative;
}

.ops-bar::after {
  background: linear-gradient(180deg, var(--accent), #8bbf48);
  border-radius: 999px;
  content: '';
  height: 82px;
  opacity: 0.14;
  position: absolute;
  right: 28px;
  top: -40px;
  transform: rotate(34deg);
  width: 14px;
}

h1,
h2,
p {
  margin: 0;
}

h1,
h2 {
  color: var(--ink);
  font-family: var(--font-title, var(--font-body));
  line-height: 1.02;
}

.ops-bar h1 {
  font-size: clamp(2rem, 3.2vw, 3rem);
  letter-spacing: -0.035em;
}

.eyebrow,
.head-controls span,
.room-facts span,
.pane-title .eyebrow {
  color: var(--accent-dark);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.head-controls {
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(150px, 220px) minmax(170px, 1fr);
  position: relative;
  z-index: 1;
}

.head-controls label {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(8, 135, 125, 0.18);
  border-radius: 17px;
  box-shadow: 0 14px 30px rgba(14, 40, 55, 0.06);
  display: grid;
  gap: 4px;
  padding: 8px 12px;
}

.head-controls select,
.head-controls input {
  background: transparent;
  border: 0;
  color: var(--ink);
  min-height: 24px;
  outline: 0;
}

.rooms-workbench {
  align-items: start;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(300px, 360px) minmax(0, 1fr) minmax(310px, 360px);
}

.rooms-pane,
.room-detail,
.action-panel {
  display: grid;
  gap: 12px;
  padding: 14px;
}

.rooms-pane,
.action-panel {
  position: sticky;
  top: calc(var(--topbar-height) + 16px);
}

.pane-title,
.room-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.pane-title h2,
.room-head h2 {
  font-size: clamp(1.2rem, 2vw, 1.65rem);
  letter-spacing: -0.02em;
}

.pane-title small {
  color: var(--muted);
  display: block;
  font-size: 0.78rem;
  margin-top: 3px;
}

.room-list,
.action-list {
  display: grid;
  gap: 8px;
}

.room-row,
.action-list button {
  background: #ffffff;
  border: 1px solid transparent;
  border-radius: 18px;
  cursor: pointer;
  text-align: left;
  transition: background 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
}

.room-row {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: 44px minmax(0, 1fr);
  padding: 10px;
}

.room-row:hover,
.room-row.active,
.action-list button:hover {
  background: linear-gradient(135deg, #f0fbf7, #fffaf0);
  border-color: rgba(8, 135, 125, 0.22);
  transform: translateY(-1px);
}

.room-row.active {
  box-shadow: inset 3px 0 0 var(--accent);
}

.room-avatar,
.action-icon {
  align-items: center;
  background: linear-gradient(135deg, #eefaf7, #fff6df);
  border: 1px solid rgba(8, 135, 125, 0.18);
  border-radius: 15px;
  color: var(--accent-dark);
  display: inline-flex;
  font-weight: 950;
  height: 44px;
  justify-content: center;
  width: 44px;
}

.room-avatar.large {
  border-radius: 20px;
  font-size: 1.18rem;
  height: 68px;
  width: 68px;
}

.room-copy,
.action-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.room-copy strong,
.room-copy small,
.action-copy strong,
.action-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-copy strong,
.action-list strong {
  color: var(--ink);
}

.room-copy small,
.action-list small {
  color: var(--muted);
  font-size: 0.78rem;
}

.room-detail {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(249, 253, 250, 0.93));
}

.room-head {
  border-bottom: 1px solid var(--line-soft);
  padding-bottom: 12px;
}

.room-facts {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.room-facts article {
  background: #f8fbfb;
  border: 1px solid var(--line-soft);
  border-radius: 18px;
  display: grid;
  gap: 4px;
  min-height: 78px;
  padding: 12px;
}

.room-facts strong {
  color: var(--ink);
  font-family: var(--font-title, var(--font-body));
  font-size: 1.75rem;
  line-height: 1;
}

.action-list button {
  align-items: center;
  display: grid;
  gap: 11px;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  min-height: 72px;
  padding: 10px;
}

.action-list b {
  background: #fff6df;
  border: 1px solid rgba(246, 185, 79, 0.32);
  border-radius: 999px;
  color: #8a650c;
  font-size: 0.78rem;
  min-width: 32px;
  padding: 5px 9px;
  text-align: center;
}

.surface-message {
  background: #edfdf7;
  border: 1px solid #b7ead6;
  border-radius: 14px;
  color: #047857;
  margin: 0;
  padding: 10px 12px;
}

.surface-message.error {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #be123c;
}

.state-panel {
  color: var(--muted);
  display: grid;
  gap: 9px;
  min-height: 260px;
  place-items: center;
  padding: 24px;
  text-align: center;
}

.state-panel h2 { color: var(--ink); margin: 0; }
.state-panel p { margin: 0; }
.state-panel.compact { min-height: 180px; }

@media (max-width: 1180px) {
  .rooms-workbench { grid-template-columns: minmax(300px, 360px) minmax(0, 1fr); }
  .action-panel { grid-column: 2; position: static; }
}

@media (max-width: 880px) {
  .ops-bar,
  .rooms-workbench,
  .head-controls,
  .room-facts {
    grid-template-columns: 1fr;
  }
  .rooms-pane,
  .action-panel { position: static; }
}
</style>
