<template>
  <section class="resource-module stack">
    <AdminModuleTabs :sala-id="salaId" />

    <header class="module-hero">
      <div>
        <p class="eyebrow">{{ data?.sala?.unidad || 'Guardería' }} · {{ data?.sala?.sala || 'Sala' }}</p>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
      <div class="module-actions">
        <label class="search-field">
          <span>Buscar</span>
          <input v-model="search" class="input" type="search" placeholder="Título, descripción o autor" />
        </label>
        <label class="search-field">
          <span>Estado</span>
          <select v-model="visibilityFilter" class="select">
            <option value="published">Publicadas</option>
            <option value="hidden">Ocultas</option>
            <option value="all">Todas</option>
          </select>
        </label>
        <label class="search-field">
          <span>Recurso</span>
          <select v-model="resourceFilter" class="select">
            <option value="all">Todos</option>
            <option value="with">Con archivo o liga</option>
            <option value="without">Sin recurso</option>
          </select>
        </label>
        <button class="btn btn-primary" type="button" @click="startCreate()">{{ actionLabel }}</button>
      </div>
    </header>

    <ResourceEditor
      v-if="editing"
      :resource="editing"
      :label="title"
      :type="type"
      :saving="saving"
      @save="save"
      @cancel="closeEditor"
    />

    <p v-if="error" class="alert">No fue posible cargar esta sección.</p>
    <p v-if="actionError" class="alert">{{ actionError }}</p>
    <p v-if="actionNotice" class="notice">{{ actionNotice }}</p>
    <div v-if="pending" class="card loading-card">Cargando publicaciones…</div>

    <section v-else class="resource-desk">
      <div class="card resource-list-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Listado</p>
            <h2>{{ filteredRows.length }} registros</h2>
          </div>
          <span class="scope-pill">{{ data?.sala?.unidad }} · {{ data?.sala?.sala }}</span>
        </div>

        <div v-if="filteredRows.length" class="resource-list">
          <button
            v-for="item in filteredRows"
            :key="item.id"
            class="resource-row"
            :class="{ active: selected?.id === item.id, hidden: isHiddenResource(item.hidden) }"
            type="button"
            @click="selectRow(item)"
          >
            <span class="row-date">{{ compactDate(item.date || item.timestamp) }}</span>
            <span class="row-main">
              <strong>{{ item.title || 'Sin título' }}</strong>
              <small>{{ stripHtml(item.description) || 'Sin descripción' }}</small>
            </span>
            <span class="row-status">
              <strong :class="isHiddenResource(item.hidden) ? 'status-hidden' : 'status-published'">{{ isHiddenResource(item.hidden) ? 'Oculta' : 'Publicada' }}</strong>
              <small>{{ item.resource ? 'Con recurso' : 'Sin recurso' }}</small>
            </span>
          </button>
        </div>
        <EmptyState v-else title="Sin publicaciones" description="No hay registros para esta búsqueda, estado o filtro de recurso." />
      </div>

      <aside class="card preview-card">
        <template v-if="selected">
          <div class="section-head">
            <div>
              <p class="eyebrow">Vista previa</p>
              <h2>{{ selected.title || 'Sin título' }}</h2>
            </div>
            <span class="scope-pill" :class="{ muted: isHiddenResource(selected.hidden) }">{{ isHiddenResource(selected.hidden) ? 'Oculta' : 'Publicada' }}</span>
          </div>
          <p>{{ stripHtml(selected.description) || 'Sin descripción.' }}</p>
          <dl>
            <div><dt>Fecha</dt><dd>{{ formatDate(selected.date || selected.timestamp, '—') }}</dd></div>
            <div><dt>Autor</dt><dd>{{ selected.autor || '—' }}</dd></div>
            <div><dt>Estado familiar</dt><dd>{{ isHiddenResource(selected.hidden) ? 'No visible para familias' : 'Visible para familias' }}</dd></div>
            <div><dt>Recurso</dt><dd>{{ selected.resource || 'Sin archivo o liga' }}</dd></div>
            <div><dt>Visible en</dt><dd>{{ data?.sala?.unidad }} · {{ data?.sala?.sala }}</dd></div>
          </dl>
          <div class="preview-actions">
            <a v-if="selected.resource" class="btn btn-secondary" :href="resourceHref(selected.resource)" target="_blank" rel="noopener">Abrir recurso</a>
            <button class="btn btn-secondary" type="button" @click="editing = { ...selected }">Editar</button>
            <button class="btn btn-secondary" type="button" @click="togglePublished(selected)">{{ isHiddenResource(selected.hidden) ? 'Publicar' : 'Ocultar' }}</button>
            <button class="btn btn-danger" type="button" @click="remove(selected.id)">Eliminar</button>
          </div>
        </template>
        <EmptyState v-else title="Selecciona un registro" description="El detalle aparecerá aquí. Los filtros actualizan el listado y la URL." />
      </aside>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useFetch, useRoute, useRouter } from 'nuxt/app'
import type { DaycareResource, Sala } from '~/types/daycare'
import { formatDate, isHiddenResource, isPdfResource, parseLegacyDate, publishedPdfViewerUrl, stripHtml } from '~/utils/daycare'

const props = defineProps<{
  type: 'hw' | 'news' | 'cal'
  title: string
  description: string
  actionLabel: string
}>()

const route = useRoute()
const router = useRouter()
const salaId = Number(route.params.id)
const editing = ref<Partial<DaycareResource> | null>(null)
const selected = ref<DaycareResource | null>(null)
const saving = ref(false)
const search = ref(typeof route.query.buscar === 'string' ? route.query.buscar : '')
const visibilityFilter = ref<'published' | 'hidden' | 'all'>(normalizeVisibilityFilter(route.query.estado))
const resourceFilter = ref<'all' | 'with' | 'without'>(normalizeResourceFilter(route.query.recurso))
const actionError = ref('')
const actionNotice = ref('')
const selectedIdFromRoute = computed(() => Number(route.query.registro || 0))

const { data, refresh, pending, error } = useFetch<{ sala: Sala; rows: DaycareResource[] }>('/api/daycare/admin/resources', {
  query: { sala: salaId, type: props.type }
})

const filteredRows = computed(() => {
  const needle = search.value.trim().toLowerCase()
  const rows = data.value?.rows || []
  return rows.filter((item) => {
    if (visibilityFilter.value === 'published' && isHiddenResource(item.hidden)) return false
    if (visibilityFilter.value === 'hidden' && !isHiddenResource(item.hidden)) return false
    if (resourceFilter.value === 'with' && !item.resource) return false
    if (resourceFilter.value === 'without' && item.resource) return false
    if (!needle) return true
    return `${item.title || ''} ${stripHtml(item.description)} ${item.autor || ''}`.toLowerCase().includes(needle)
  })
})

watch([search, visibilityFilter, resourceFilter], () => {
  syncQuery()
})

watch(() => route.query.buscar, (value) => {
  const next = typeof value === 'string' ? value : ''
  if (next !== search.value) search.value = next
})

watch(() => route.query.estado, (value) => {
  const next = normalizeVisibilityFilter(value)
  if (next !== visibilityFilter.value) visibilityFilter.value = next
})

watch(() => route.query.recurso, (value) => {
  const next = normalizeResourceFilter(value)
  if (next !== resourceFilter.value) resourceFilter.value = next
})

watch(filteredRows, (rows) => {
  if (!rows.length) {
    selected.value = null
    return
  }

  const routeSelected = rows.find((row) => row.id === selectedIdFromRoute.value)
  if (routeSelected) {
    selected.value = routeSelected
    return
  }

  if (!selected.value || !rows.some((row) => row.id === selected.value?.id)) {
    selected.value = rows[0] || null
    syncSelectedQuery(selected.value?.id)
  }
}, { immediate: true })

watch(selectedIdFromRoute, (id) => {
  if (!id) return
  const row = filteredRows.value.find((item) => item.id === id)
  if (row) selected.value = row
})

watch(() => route.query.create, async (value) => {
  if (value === '1') {
    startCreate(false)
    const nextQuery = { ...route.query }
    delete nextQuery.create
    await router.replace({ path: route.path, query: nextQuery })
  }
}, { immediate: true })

function startCreate(updateRoute = true) {
  actionError.value = ''
  actionNotice.value = ''
  editing.value = {
    sala: String(salaId),
    unidad: data.value?.sala.unidad,
    type: props.type,
    title: '',
    description: '',
    date: props.type === 'cal' ? new Date().toISOString().slice(0, 10) : null,
    starred: 0,
    hidden: 0
  }
  if (updateRoute) syncSelectedQuery(undefined, { create: '1' })
}

function closeEditor() {
  editing.value = null
  actionError.value = ''
}

function selectRow(item: DaycareResource) {
  selected.value = item
  actionError.value = ''
  syncSelectedQuery(item.id)
}

async function save(payload: Partial<DaycareResource>) {
  saving.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    const saved = await $fetch<DaycareResource>('/api/daycare/admin/resources', {
      method: 'POST',
      body: { ...payload, sala: String(salaId), type: props.type }
    })
    editing.value = null
    await refresh()
    await nextTick()
    const row = (data.value?.rows || []).find((item) => item.id === saved.id)
    selected.value = row || selected.value
    syncSelectedQuery(saved.id)
    actionNotice.value = saved.id === payload.id ? 'Publicación actualizada.' : 'Publicación creada.'
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible guardar la publicación.'
  } finally {
    saving.value = false
  }
}

async function togglePublished(item: DaycareResource) {
  if (!item.id) return
  actionError.value = ''
  actionNotice.value = ''
  const willHide = !isHiddenResource(item.hidden)
  try {
    await $fetch(`/api/daycare/admin/resources/${item.id}`, {
      method: 'PATCH',
      body: { hidden: willHide }
    })
    await refresh()
    actionNotice.value = willHide ? 'Publicación oculta para familias.' : 'Publicación visible para familias.'
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible cambiar la visibilidad.'
  }
}

async function remove(id?: number) {
  if (!id || !confirm('¿Eliminar definitivamente esta publicación?')) return
  actionError.value = ''
  actionNotice.value = ''
  try {
    await $fetch(`/api/daycare/admin/resources/${id}`, { method: 'DELETE' })
    if (selected.value?.id === id) selected.value = null
    syncSelectedQuery(undefined)
    await refresh()
    actionNotice.value = 'Publicación eliminada.'
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible eliminar la publicación.'
  }
}

function resourceHref(resource?: string | null) {
  return isPdfResource(resource) ? publishedPdfViewerUrl(resource) : resource || ''
}

function compactDate(value?: string | null) {
  const date = parseLegacyDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short' }).format(date)
}

function syncQuery() {
  const nextQuery = { ...route.query }
  setQueryValue(nextQuery, 'buscar', search.value.trim())
  setQueryValue(nextQuery, 'estado', visibilityFilter.value === 'published' ? '' : visibilityFilter.value)
  setQueryValue(nextQuery, 'recurso', resourceFilter.value === 'all' ? '' : resourceFilter.value)
  delete nextQuery.create
  router.replace({ path: route.path, query: nextQuery })
}

function syncSelectedQuery(id?: number, extra: Record<string, string> = {}) {
  const nextQuery = { ...route.query, ...extra }
  setQueryValue(nextQuery, 'registro', id ? String(id) : '')
  router.replace({ path: route.path, query: nextQuery })
}

function setQueryValue(query: Record<string, any>, key: string, value: string) {
  if (value) query[key] = value
  else delete query[key]
}

function normalizeVisibilityFilter(value: unknown): 'published' | 'hidden' | 'all' {
  return value === 'hidden' || value === 'all' ? value : 'published'
}

function normalizeResourceFilter(value: unknown): 'all' | 'with' | 'without' {
  return value === 'with' || value === 'without' ? value : 'all'
}
</script>

<style scoped>
.resource-module {
  gap: 12px;
}

.module-hero {
  align-items: end;
  background:
    radial-gradient(circle at top right, rgba(255, 181, 69, 0.13), transparent 44%),
    linear-gradient(135deg, #fff, #f6faef);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1fr) minmax(560px, 1fr);
  padding: clamp(15px, 2vw, 22px);
}

.module-hero h1 {
  font-size: clamp(1.65rem, 2.8vw, 2.45rem);
  margin-bottom: 6px;
}

.module-actions {
  align-items: end;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) minmax(140px, 0.42fr) minmax(150px, 0.46fr) auto;
}

.search-field {
  display: grid;
  gap: 5px;
}

.search-field span {
  color: var(--color-muted);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.resource-desk {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
}

.resource-list-card {
  min-width: 0;
}

.section-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-head h2 {
  font-size: 1.2rem;
  margin-bottom: 0;
}

.scope-pill {
  background: var(--color-brand-100);
  border-radius: 999px;
  color: var(--color-brand-900);
  font-size: 0.78rem;
  font-weight: 850;
  padding: 6px 10px;
  white-space: nowrap;
}

.scope-pill.muted {
  background: #e9e9e6;
  color: var(--color-muted);
}

.resource-list {
  display: grid;
  gap: 8px;
}

.resource-row {
  align-items: center;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: 72px minmax(0, 1fr) minmax(118px, auto);
  padding: 10px;
  text-align: left;
  width: 100%;
}

.resource-row:hover,
.resource-row.active {
  background: var(--color-brand-100);
  border-color: var(--color-brand-300);
}

.resource-row.hidden {
  opacity: 0.72;
}

.row-date {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  color: var(--color-muted);
  font-size: 0.78rem;
  font-weight: 850;
  padding: 7px 8px;
  text-align: center;
  text-transform: capitalize;
}

.row-main,
.row-status {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.row-main strong,
.row-main small,
.row-status small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-main small,
.row-status small {
  color: var(--color-muted);
  font-size: 0.78rem;
}

.row-status {
  text-align: right;
}

.status-hidden,
.status-published {
  font-size: 0.78rem;
  font-weight: 900;
}

.status-hidden {
  color: #8d5a00;
}

.status-published {
  color: var(--color-brand-700);
}

.preview-card {
  align-self: start;
  display: grid;
  gap: 12px;
  position: sticky;
  top: calc(var(--topbar-height) + 12px);
}

.preview-card dl {
  display: grid;
  gap: 10px;
  margin: 0;
}

.preview-card dl div {
  border-bottom: 1px solid var(--color-border);
  display: grid;
  gap: 2px;
  padding-bottom: 8px;
}

.preview-card dt {
  color: var(--color-muted);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.preview-card dd {
  margin: 0;
  word-break: break-word;
}

.preview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.notice {
  background: #f0f8e7;
  border: 1px solid var(--color-brand-200);
  border-radius: 14px;
  color: var(--color-brand-900);
  font-weight: 850;
  margin: 0;
  padding: 10px 12px;
}

.loading-card {
  color: var(--color-muted);
}

@media (max-width: 1180px) {
  .module-hero,
  .resource-desk {
    grid-template-columns: 1fr;
  }

  .module-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .module-actions .btn {
    grid-column: 1 / -1;
  }

  .preview-card {
    position: static;
  }
}

@media (max-width: 760px) {
  .module-actions,
  .resource-row {
    grid-template-columns: 1fr;
  }

  .row-status {
    text-align: left;
  }

  .section-head {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
