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
              <p class="eyebrow">Abrir</p>
              <h2>{{ selectedSala.sala }}</h2>
            </div>
          </header>
          <div class="action-list">
            <button type="button" data-diagnostic-action="abrir-familias" @click="goToSalaSection('familias')">
              <strong>Familias</strong><small>Cuentas y soporte.</small>
            </button>
            <button type="button" data-diagnostic-action="abrir-tareas" @click="goToSalaSection('tareas', true)">
              <strong>Tareas</strong><small>Trabajo en casa.</small>
            </button>
            <button type="button" data-diagnostic-action="abrir-avisos" @click="goToSalaSection('avisos')">
              <strong>Avisos</strong><small>Mensajes de sala.</small>
            </button>
            <button type="button" data-diagnostic-action="abrir-calendario" @click="goToSalaSection('calendario')">
              <strong>Calendario</strong><small>Fechas visibles.</small>
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

function goToSalaSection(section: 'familias' | 'tareas' | 'avisos' | 'calendario', create = false) {
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
  --surface: #ffffff;
  --line: #dce5eb;
  --line-soft: #e8eef3;
  --ink: #152032;
  --muted: #64748b;
  --accent: #0d766d;
  display: grid;
  gap: 12px;
}

.ops-bar,
.rooms-pane,
.room-detail,
.action-panel,
.state-panel {
  background: rgba(255, 255, 255, .96);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 14px 34px rgba(15, 23, 42, .055);
}

.ops-bar {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  min-height: 72px;
  padding: 16px 18px;
}

h1,
h2,
p { margin: 0; }

h1,
h2 {
  color: var(--ink);
  font-family: var(--font-body);
  line-height: 1.04;
}

.ops-bar h1 {
  font-size: clamp(1.7rem, 2.4vw, 2.35rem);
  letter-spacing: -.04em;
}

.eyebrow,
.head-controls span,
.room-facts span,
.pane-title .eyebrow {
  color: var(--muted);
  font-size: .72rem;
  font-weight: 850;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.head-controls {
  align-items: center;
  display: grid;
  gap: 8px;
  grid-template-columns: minmax(160px, 220px) minmax(180px, 260px);
}

.head-controls label {
  background: #f8fafc;
  border: 1px solid var(--line);
  border-radius: 14px;
  display: grid;
  gap: 3px;
  padding: 8px 10px;
}

.head-controls select,
.head-controls input {
  background: transparent;
  border: 0;
  color: var(--ink);
  outline: 0;
}

.rooms-workbench {
  align-items: start;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(300px, 360px) minmax(0, 1fr) minmax(300px, 340px);
}

.rooms-pane,
.room-detail,
.action-panel {
  display: grid;
  gap: 12px;
  padding: 12px;
}

.rooms-pane,
.action-panel {
  position: sticky;
  top: calc(var(--topbar-height) + 14px);
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
  font-size: 1.08rem;
}

.room-list,
.action-list {
  display: grid;
  gap: 7px;
}

.room-row,
.action-list button {
  background: #ffffff;
  border: 1px solid transparent;
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
}

.room-row {
  align-items: center;
  display: grid;
  gap: 9px;
  grid-template-columns: 42px minmax(0, 1fr);
  padding: 8px;
}

.room-row:hover,
.room-row.active,
.action-list button:hover {
  background: #f3faf8;
  border-color: #cae2dc;
}

.room-avatar {
  align-items: center;
  background: #eef7f5;
  border: 1px solid #cae2dc;
  border-radius: 13px;
  color: var(--accent);
  display: inline-flex;
  font-weight: 900;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.room-avatar.large {
  border-radius: 18px;
  font-size: 1.1rem;
  height: 64px;
  width: 64px;
}

.room-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.room-copy strong,
.room-copy small {
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
  font-size: .75rem;
}

.room-facts {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.room-facts article {
  background: #f8fafc;
  border: 1px solid var(--line-soft);
  border-radius: 14px;
  display: grid;
  gap: 2px;
  padding: 11px 12px;
}

.room-facts strong {
  color: var(--ink);
  font-size: 1.3rem;
}

.action-list button {
  display: grid;
  gap: 3px;
  padding: 13px 14px;
}

.surface-message {
  background: #edfdf7;
  border: 1px solid #b7ead6;
  border-radius: 12px;
  color: #047857;
  margin: 0;
  padding: 10px 12px;
}
.surface-message.error { background: #fff1f2; border-color: #fecdd3; color: #be123c; }
.state-panel {
  color: var(--muted);
  display: grid;
  gap: 9px;
  min-height: 280px;
  place-items: center;
  padding: 24px;
  text-align: center;
}
.state-panel h2 { color: var(--ink); margin: 0; }
.state-panel p { margin: 0; }
.state-panel.compact { min-height: 180px; }

@media (max-width: 1160px) {
  .rooms-workbench { grid-template-columns: minmax(300px, 360px) minmax(0, 1fr); }
  .action-panel { grid-column: 2; position: static; }
}
@media (max-width: 880px) {
  .ops-bar,
  .rooms-workbench,
  .head-controls,
  .room-facts {
    display: grid;
    grid-template-columns: 1fr;
  }
  .rooms-pane { position: static; }
}
</style>
