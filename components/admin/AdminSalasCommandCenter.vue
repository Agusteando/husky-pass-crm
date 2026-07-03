<template>
  <section class="daycare-console" data-product-area="daycare" data-product-screen="salas">
    <template v-if="clientReady">
    <header class="daycare-head">
      <div>
        <p class="eyebrow">Guardería</p>
        <h1>{{ selectedUnidad || 'Unidad pendiente' }}</h1>
        <p>Elige una sala para ver familias, tareas, avisos y calendario dentro de un contexto claro.</p>
      </div>
      <div class="head-controls">
        <label>
          <span>Unidad</span>
          <select v-model="selectedUnidad" data-diagnostic-filter="unidad" @change="syncUnidad">
            <option v-for="unidad in unidades" :key="unidad" :value="unidad">{{ unidad }}</option>
          </select>
        </label>
        <label>
          <span>Buscar sala</span>
          <input v-model="search" type="search" placeholder="Nombre de sala" data-diagnostic-filter="buscar-sala" />
        </label>
      </div>
    </header>

    <section v-if="noUnidadAvailable" class="state-panel" data-product-panel="daycare-unidades" data-state="unavailable">
      <FamilyPersonasIcon name="daycare" />
      <h2>Guardería no disponible</h2>
      <p>Esta cuenta no tiene una unidad asignada.</p>
    </section>

    <p v-if="error" class="surface-message error">No fue posible cargar las salas de esta unidad.</p>
    <p v-if="actionError" class="surface-message error">{{ actionError }}</p>
    <p v-if="actionNotice" class="surface-message">{{ actionNotice }}</p>
    <div v-if="pending || unitsPending" class="state-panel" data-product-loading>
      <HuskyPassLoader label="Salas" contained />
    </div>

    <section v-else-if="!noUnidadAvailable" class="daycare-layout">
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
              <small>{{ sala.metrics.familias }} familias / {{ sala.metrics.totalRecursos }} publicaciones</small>
            </span>
          </button>
        </div>
        <div v-else class="state-panel compact" data-diagnostic="sala-unavailable" data-state="empty">
          <FamilyPersonasIcon name="daycare" />
          <h2>Sin salas</h2>
          <p>No hay salas que coincidan con esta búsqueda o unidad.</p>
        </div>
      </aside>

      <article v-if="selectedSala" class="room-detail" data-diagnostic="sala-context" data-product-panel="sala-context" data-state="content">
        <div class="room-head">
          <span class="room-avatar large">{{ roomInitials(selectedSala.sala) }}</span>
          <div>
            <p class="eyebrow">{{ selectedSala.unidad }}</p>
            <h2>{{ selectedSala.sala }}</h2>
            <p>Todo lo que publiques desde aquí será visible solo para estas familias.</p>
          </div>
          <button v-if="canPreviewAsFamily" class="btn btn-secondary" type="button" data-diagnostic-action="preview-sala" @click="previewSala(selectedSala.id)">Vista familiar</button>
        </div>

        <section class="room-facts" aria-label="Resumen de sala">
          <article>
            <span>Familias</span>
            <strong>{{ selectedSala.metrics.familias }}</strong>
          </article>
          <article>
            <span>Tareas</span>
            <strong>{{ selectedSala.metrics.tareas }}</strong>
          </article>
          <article>
            <span>Avisos</span>
            <strong>{{ selectedSala.metrics.avisos }}</strong>
          </article>
          <article>
            <span>Fechas</span>
            <strong>{{ selectedSala.metrics.calendario }}</strong>
          </article>
        </section>

        <section class="attention-panel">
          <div>
            <p class="eyebrow">Qué necesita atención</p>
            <h3>Trabaja siempre dentro de {{ selectedSala.sala }}</h3>
          </div>
          <div class="action-grid">
            <button type="button" data-diagnostic-action="abrir-familias" @click="goToSalaSection('familias')">
              <strong>Ver familias</strong>
              <small>Cuentas, acceso y soporte.</small>
            </button>
            <button type="button" data-diagnostic-action="abrir-tareas" @click="goToSalaSection('tareas', true)">
              <strong>Nueva tarea</strong>
              <small>Publicación para casa.</small>
            </button>
            <button type="button" data-diagnostic-action="abrir-avisos" @click="goToSalaSection('avisos')">
              <strong>Crear aviso</strong>
              <small>Mensaje de sala.</small>
            </button>
            <button type="button" data-diagnostic-action="abrir-calendario" @click="goToSalaSection('calendario')">
              <strong>Agregar fecha</strong>
              <small>Evento visible.</small>
            </button>
          </div>
        </section>
      </article>
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

const route = useRoute()
const router = useRouter()
const { data: session, pending: sessionPending } = useAppSession()

const selectedUnidad = ref(typeof route.query.unidad === 'string' ? route.query.unidad : '')
const search = ref(typeof route.query.buscar === 'string' ? route.query.buscar : '')
const selectedSalaId = ref<number | null>(normalizeSalaQuery(route.query.sala))
const actionError = ref('')
const actionNotice = ref('')
const clientReady = ref(false)
const canPreviewAsFamily = computed(() => Boolean(session.value?.user?.kind === 'admin'))

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
    await $fetch('/api/auth/admin/preview-daycare', { method: 'POST', body: { sala: id } })
    actionNotice.value = 'Abriendo vista familiar de sala.'
    await navigateTo('/familia/daycare')
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible abrir la vista familiar.'
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
  display: grid;
  gap: 16px;
}

.daycare-head,
.rooms-pane,
.room-detail,
.state-panel {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #dce5eb;
  border-radius: 16px;
  box-shadow: 0 12px 34px rgba(15, 23, 42, 0.06);
}

.daycare-head {
  align-items: end;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 520px);
  padding: clamp(18px, 2.2vw, 28px);
}

.daycare-head h1,
.pane-title h2,
.room-head h2,
.attention-panel h3,
.state-panel h2 {
  color: #152032;
  font-family: var(--font-body);
  margin: 0;
}

.daycare-head h1 {
  font-size: clamp(2rem, 3vw, 3.1rem);
}

.daycare-head p:not(.eyebrow),
.room-head p,
.room-row small,
.action-grid small {
  color: #667789;
  margin: 0;
}

.head-controls {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.head-controls label {
  background: #f8fafc;
  border: 1px solid #dce5eb;
  border-radius: 13px;
  display: grid;
  gap: 5px;
  padding: 9px 11px;
}

.head-controls span,
.room-facts span {
  color: #6b7a8b;
  font-size: 0.72rem;
  font-weight: 850;
  text-transform: uppercase;
}

.head-controls select,
.head-controls input {
  background: transparent;
  border: 0;
  color: #152032;
  min-width: 0;
  outline: 0;
}

.daycare-layout {
  align-items: start;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(300px, 410px) minmax(0, 1fr);
}

.rooms-pane,
.room-detail {
  display: grid;
  gap: 12px;
  padding: 14px;
}

.rooms-pane {
  position: sticky;
  top: calc(var(--topbar-height) + 18px);
}

.room-list {
  display: grid;
  gap: 6px;
  max-height: calc(100vh - 255px);
  overflow: auto;
  padding-right: 2px;
}

.room-row {
  align-items: center;
  background: #ffffff;
  border: 1px solid transparent;
  border-radius: 13px;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: 42px minmax(0, 1fr);
  padding: 9px;
  text-align: left;
}

.room-row.active,
.room-row:hover {
  background: #f4faf8;
  border-color: #cae2dc;
}

.room-avatar {
  align-items: center;
  background: #eef7f5;
  border: 1px solid #cae2dc;
  border-radius: 12px;
  color: #0d766d;
  display: inline-flex;
  font-weight: 900;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.room-avatar.large {
  border-radius: 16px;
  font-size: 1.08rem;
  height: 58px;
  width: 58px;
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

.room-head {
  align-items: center;
  border-bottom: 1px solid #e1e8ed;
  display: grid;
  gap: 14px;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  padding-bottom: 14px;
}

.room-facts {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.room-facts article {
  background: #f8fafc;
  border: 1px solid #e1e8ed;
  border-radius: 13px;
  display: grid;
  gap: 4px;
  padding: 12px;
}

.room-facts strong {
  color: #152032;
  font-size: 1.35rem;
}

.attention-panel {
  border: 1px solid #e1e8ed;
  border-radius: 15px;
  display: grid;
  gap: 12px;
  padding: 14px;
}

.action-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.action-grid button {
  background: #ffffff;
  border: 1px solid #dce5eb;
  border-radius: 13px;
  color: inherit;
  cursor: pointer;
  display: grid;
  gap: 5px;
  min-height: 86px;
  padding: 12px;
  text-align: left;
}

.action-grid button:hover {
  background: #f4faf8;
  border-color: #cae2dc;
}

.action-grid strong,
.action-grid small {
  display: block;
}

.surface-message {
  background: #edfdf7;
  border: 1px solid #b7ead6;
  border-radius: 12px;
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
  color: #667789;
  display: grid;
  gap: 9px;
  min-height: 240px;
  place-items: center;
  padding: 24px;
  text-align: center;
}

.state-panel.compact {
  min-height: 180px;
}

@media (max-width: 1120px) {
  .daycare-head,
  .daycare-layout,
  .room-facts,
  .action-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .rooms-pane {
    position: static;
  }

  .room-list {
    max-height: none;
  }
}

@media (max-width: 760px) {
  .daycare-head,
  .head-controls,
  .daycare-layout,
  .room-head,
  .room-facts,
  .action-grid {
    grid-template-columns: 1fr;
  }
}
</style>
