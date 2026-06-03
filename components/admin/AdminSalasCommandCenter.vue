<template>
  <section class="salas-command stack">
    <header class="command-hero">
      <div>
        <p class="eyebrow">Daycare admin</p>
        <h1>Salas</h1>
        <p>Selecciona unidad y sala. Desde aquí se decide qué contenido familiar queda visible.</p>
      </div>
      <div class="hero-controls">
        <label class="label">
          Unidad
          <select v-model="selectedUnidad" class="select" @change="syncUnidad">
            <option v-for="unidad in unidades" :key="unidad" :value="unidad">{{ unidad }}</option>
          </select>
        </label>
        <label class="label">
          Buscar sala
          <input v-model="search" class="input" type="search" placeholder="Nombre de sala" />
        </label>
      </div>
    </header>

    <section class="summary-strip" aria-label="Resumen de unidad">
      <article>
        <span>Unidad</span>
        <strong>{{ selectedUnidad || 'Sin unidad' }}</strong>
      </article>
      <article>
        <span>Salas</span>
        <strong>{{ filteredSalas.length }}</strong>
      </article>
      <article>
        <span>Familias</span>
        <strong>{{ totals.familias }}</strong>
      </article>
      <article>
        <span>Contenido</span>
        <strong>{{ totals.totalRecursos }}</strong>
      </article>
    </section>

    <p v-if="error" class="alert">No fue posible cargar las salas de esta unidad.</p>
    <p v-if="actionError" class="alert">{{ actionError }}</p>
    <div v-else-if="pending" class="card loading-card">Cargando salas…</div>

    <section v-else class="command-layout">
      <aside class="card sala-picker-card">
        <div class="list-head">
          <div>
            <p class="eyebrow">Directorio</p>
            <h2>{{ filteredSalas.length }} salas</h2>
          </div>
        </div>

        <div v-if="filteredSalas.length" class="sala-picker-list" role="list">
          <button
            v-for="sala in filteredSalas"
            :key="sala.id"
            class="sala-pick"
            :class="{ active: sala.id === selectedSalaId }"
            type="button"
            @click="selectedSalaId = sala.id"
          >
            <span class="room-avatar">{{ roomInitials(sala.sala) }}</span>
            <span class="pick-copy">
              <strong>{{ sala.sala }}</strong>
              <small>{{ sala.metrics.familias }} familias · {{ sala.metrics.totalRecursos }} publicaciones</small>
            </span>
          </button>
        </div>
        <EmptyState v-else title="Sin salas" description="No hay salas que coincidan con esta búsqueda o unidad." />
      </aside>

      <article v-if="selectedSala" class="card sala-focus-card">
        <div class="focus-header">
          <div class="focus-title">
            <span class="room-avatar large">{{ roomInitials(selectedSala.sala) }}</span>
            <div>
              <p class="eyebrow">{{ selectedSala.unidad }}</p>
              <h2>{{ selectedSala.sala }}</h2>
              <p>Workspace operativo para gestionar familias, tareas, avisos y calendario.</p>
            </div>
          </div>
          <div class="focus-actions">
            <button class="btn btn-primary" type="button" @click="goToSalaSection('tareas', true)">+ Nueva tarea</button>
            <button class="btn btn-secondary" type="button" @click="goToSalaSection('tareas')">Gestionar tareas</button>
            <button v-if="canPreviewAsFamily" class="btn btn-secondary" type="button" @click="previewSala(selectedSala.id)">Vista familiar</button>
          </div>
        </div>

        <div class="metric-grid">
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
            <span>Eventos</span>
            <strong>{{ selectedSala.metrics.calendario }}</strong>
          </article>
        </div>

        <div class="module-launcher">
          <button type="button" @click="goToSalaSection('familias')">
            <strong>Familias</strong>
            <span>Ver cuentas y soporte.</span>
          </button>
          <button type="button" @click="goToSalaSection('tareas')">
            <strong>Tareas</strong>
            <span>Publicar o editar tareas.</span>
          </button>
          <button type="button" @click="goToSalaSection('avisos')">
            <strong>Avisos</strong>
            <span>Comunicados familiares.</span>
          </button>
          <button type="button" @click="goToSalaSection('calendario')">
            <strong>Calendario</strong>
            <span>Eventos próximos.</span>
          </button>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { navigateTo, useFetch, useRoute, useRouter } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import type { SalaSummary } from '~/types/daycare'

const route = useRoute()
const router = useRouter()
const { data: session } = await useFetch<PublicSession>('/api/auth/me', { key: 'admin-salas-command-session' })

const unidades = computed(() => session.value?.user?.unidades || [])
const selectedUnidad = ref(typeof route.query.unidad === 'string' ? route.query.unidad : unidades.value[0] || '')
const search = ref('')
const selectedSalaId = ref<number | null>(null)
const actionError = ref('')
const canPreviewAsFamily = computed(() => Boolean(session.value?.user?.isSuperAdmin))

watch(unidades, (value) => {
  if (!selectedUnidad.value && value.length) selectedUnidad.value = value[0]
}, { immediate: true })

watch(() => route.query.unidad, (value) => {
  if (typeof value === 'string' && value && value !== selectedUnidad.value) selectedUnidad.value = value
})

const { data: salas, pending, error } = await useFetch<SalaSummary[]>('/api/daycare/admin/salas/overview', {
  query: computed(() => ({ unidad: selectedUnidad.value })),
  watch: [selectedUnidad]
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
    return
  }
  if (!selectedSalaId.value || !rows.some((sala) => sala.id === selectedSalaId.value)) {
    selectedSalaId.value = rows[0].id
  }
}, { immediate: true })

const totals = computed(() => filteredSalas.value.reduce((acc, sala) => {
  acc.familias += sala.metrics.familias
  acc.totalRecursos += sala.metrics.totalRecursos
  return acc
}, { familias: 0, totalRecursos: 0 }))

function syncUnidad() {
  selectedSalaId.value = null
  router.replace({ path: route.path, query: selectedUnidad.value ? { unidad: selectedUnidad.value } : {} })
}


function goToSalaSection(section: 'familias' | 'tareas' | 'avisos' | 'calendario', create = false) {
  actionError.value = ''
  if (!selectedSala.value?.id) return
  const query = create ? { create: '1' } : undefined
  navigateTo({ path: `/admin/daycare/salas/${selectedSala.value.id}/${section}`, query })
}

async function previewSala(id: number) {
  actionError.value = ''
  try {
    await $fetch('/api/auth/admin/preview-daycare', { method: 'POST', body: { sala: id } })
    await navigateTo('/familia/daycare')
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible abrir la vista familiar.'
  }
}

function roomInitials(value?: string | null) {
  return String(value || 'S').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
}
</script>

<style scoped>
.salas-command {
  gap: 12px;
}

.command-hero {
  align-items: end;
  background:
    radial-gradient(circle at top right, rgba(255, 181, 69, 0.16), transparent 44%),
    linear-gradient(135deg, #ffffff, #f4f9ec);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.78fr);
  padding: clamp(15px, 2vw, 22px);
}

.command-hero h1 {
  font-size: clamp(1.75rem, 3vw, 2.65rem);
  margin-bottom: 6px;
}

.command-hero p:last-child {
  max-width: 600px;
}

.hero-controls {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summary-strip {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.summary-strip article,
.metric-grid article {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: var(--shadow-line);
  display: grid;
  gap: 3px;
  padding: 12px 14px;
}

.summary-strip span,
.metric-grid span {
  color: var(--color-muted);
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.summary-strip strong,
.metric-grid strong {
  color: var(--color-ink);
  font-size: clamp(1.15rem, 2vw, 1.6rem);
  line-height: 1;
}

.command-layout {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(250px, 0.68fr) minmax(0, 1.32fr);
}

.sala-picker-card,
.sala-focus-card {
  min-width: 0;
}

.list-head,
.focus-header,
.focus-title,
.focus-actions {
  align-items: center;
  display: flex;
  gap: 12px;
}

.list-head,
.focus-header {
  justify-content: space-between;
}

.list-head h2,
.focus-header h2 {
  font-size: 1.35rem;
  margin-bottom: 0;
}

.sala-picker-list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
  max-height: min(58vh, 560px);
  overflow: auto;
  padding-right: 2px;
}

.sala-pick {
  align-items: center;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: 42px minmax(0, 1fr);
  padding: 10px;
  text-align: left;
}

.sala-pick:hover,
.sala-pick.active {
  background: var(--color-brand-100);
  border-color: var(--color-brand-300);
}

.room-avatar {
  align-items: center;
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 14px;
  color: var(--color-brand-900);
  display: inline-flex;
  font-size: 0.8rem;
  font-weight: 950;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.room-avatar.large {
  border-radius: 20px;
  font-size: 1rem;
  height: 64px;
  width: 64px;
}

.pick-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.pick-copy strong,
.pick-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pick-copy small {
  color: var(--color-muted);
  font-size: 0.8rem;
}

.focus-title {
  min-width: 0;
}

.focus-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.metric-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 16px;
}

.module-launcher {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 16px;
}

.module-launcher button {
  background: linear-gradient(180deg, #ffffff, #fbfdf8);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  cursor: pointer;
  display: grid;
  font: inherit;
  gap: 5px;
  min-height: 106px;
  padding: 14px;
  text-align: left;
}

.module-launcher button:hover {
  border-color: var(--color-brand-300);
  box-shadow: var(--shadow-soft);
}

.module-launcher strong {
  color: var(--color-ink);
  font-size: 1rem;
}

.module-launcher span {
  color: var(--color-muted);
  font-size: 0.86rem;
  line-height: 1.35;
}

.loading-card {
  color: var(--color-muted);
}

@media (max-width: 1160px) {
  .command-layout,
  .command-hero {
    grid-template-columns: 1fr;
  }

  .sala-picker-list {
    display: flex;
    max-height: none;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .sala-pick {
    flex: 0 0 250px;
  }
}

@media (max-width: 760px) {
  .hero-controls,
  .summary-strip,
  .metric-grid,
  .module-launcher {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .focus-header,
  .focus-title {
    align-items: start;
    flex-direction: column;
  }

  .focus-actions {
    display: grid;
    width: 100%;
  }
}

@media (max-width: 520px) {
  .hero-controls,
  .summary-strip,
  .metric-grid,
  .module-launcher {
    grid-template-columns: 1fr;
  }

  .sala-pick {
    flex-basis: 220px;
  }
}
</style>
