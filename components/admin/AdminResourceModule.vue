<template>
  <section class="resource-module stack" data-product-area="daycare" :data-product-screen="type">
    <AdminModuleTabs :sala-id="salaId" :unidad="data?.sala?.unidad" :sala-name="data?.sala?.sala" />
    <AdminProcessingTray :items="syncEntries" />

    <header class="module-hero">
      <div>
        <p class="eyebrow">{{ data?.sala?.unidad || 'Guardería' }} · {{ data?.sala?.sala || 'Sala' }}</p>
        <h1>{{ title }}</h1>
      </div>
      <div class="module-actions">
        <label class="search-field search-field-wide">
          <FamilyPersonasIcon name="search" />
          <input v-model="search" class="input" type="search" placeholder="Título, descripción o autor" aria-label="Buscar publicación" data-diagnostic-filter="buscar-recurso" />
        </label>
        <select v-model="visibilityFilter" class="select filter-select" aria-label="Estado" data-diagnostic-filter="estado-recurso">
          <option value="published">Publicadas</option>
          <option value="hidden">Ocultas</option>
          <option value="all">Todas</option>
        </select>
        <select v-model="resourceFilter" class="select filter-select" aria-label="Archivo" data-diagnostic-filter="archivo-recurso">
          <option value="all">Archivos</option>
          <option value="with">Con archivo</option>
          <option value="without">Sin archivo</option>
        </select>
        <button class="btn btn-primary" type="button" data-diagnostic-action="crear-recurso" :disabled="saving" @click="startCreate()">{{ actionLabel }}</button>
      </div>
    </header>

    <AdminModal
      v-if="editing"
      :title="editing.id ? `Editar ${title.toLowerCase()}` : actionLabel"
      eyebrow="Guardería"
      :description="data?.sala ? `${data.sala.unidad} · ${data.sala.sala}` : undefined"
      :close-disabled="saving"
      :dirty="resourceDraftDirty"
      @close="closeEditor"
    >
      <template #default="{ requestClose }">
        <p v-if="actionError" class="alert compact-alert">{{ actionError }}</p>
        <ResourceEditor
          :resource="editing"
          :baseline-resource="editingBaseline || undefined"
          :label="title"
          :type="type"
          :sala-id="salaId"
          :sala-name="data?.sala?.sala"
          :unidad="data?.sala?.unidad"
          :saving="saving"
          @save="save"
          @cancel="requestClose"
          @dirty-change="resourceDraftDirty = $event"
        />
      </template>
    </AdminModal>



    <AdminModal
      v-if="deleteDialog"
      title="Eliminar publicación"
      eyebrow="Guardería"
      :description="deleteDialog.title || title"
      :close-disabled="deleting"
      @close="closeDeleteDialog"
    >
      <section class="delete-confirm-modal">
        <span class="delete-confirm-icon">!</span>
        <div>
          <strong>Esta publicación dejará de aparecer para la sala.</strong>
          <small>La acción elimina el registro seleccionado.</small>
        </div>
        <footer class="modal-actions">
          <button class="btn btn-secondary" type="button" :disabled="deleting" @click="closeDeleteDialog">Cancelar</button>
          <button class="btn btn-danger" type="button" :disabled="deleting" @click="confirmDelete">{{ deleting ? 'Eliminando…' : 'Eliminar' }}</button>
        </footer>
      </section>
    </AdminModal>

    <p v-if="error" class="alert">No fue posible cargar esta sección.</p>
    <p v-if="actionError" class="alert">{{ actionError }}</p>
    <p v-if="actionNotice" class="notice">{{ actionNotice }}</p>
    <div v-if="pending" class="card loading-card" data-product-loading>Cargando publicaciones…</div>

    <section v-else class="resource-desk">
      <div class="card resource-list-card" data-product-panel="resource-list" :data-state="filteredRows.length ? 'content' : 'empty'">
        <div class="section-head">
          <div>
            <p class="eyebrow">Publicaciones</p>
            <h2>{{ filteredRows.length }} visibles</h2>
          </div>
          <span class="scope-pill">{{ data?.sala?.unidad }} · {{ data?.sala?.sala }}</span>
        </div>

        <div v-if="filteredRows.length" class="resource-list">
          <button
            v-for="item in filteredRows"
            :key="item.id"
            class="resource-row"
            :class="{ active: selected?.id === item.id, hidden: isHiddenResource(item.hidden), syncing: resourceStatus(item.id)?.state === 'pending', failed: resourceStatus(item.id)?.state === 'error' }"
            type="button"
            data-diagnostic-action="seleccionar-recurso"
            :aria-pressed="selected?.id === item.id"
            @click="selectRow(item)"
          >
            <span class="row-date">{{ compactDate(item.date || item.timestamp) }}</span>
            <span class="row-main">
              <strong>{{ item.title || 'Sin título' }}</strong>
              <small>{{ stripHtml(item.description) || 'Sin descripción' }}</small>
            </span>
            <span class="row-status">
              <AdminSyncCue v-if="resourceStatus(item.id)" :status="resourceStatus(item.id)" compact />
              <strong :class="isHiddenResource(item.hidden) ? 'status-hidden' : 'status-published'">{{ isHiddenResource(item.hidden) ? 'Oculta' : 'Publicada' }}</strong>
              <small>{{ item.resource ? 'Adjunto' : 'Sin adjunto' }}</small>
            </span>
          </button>
        </div>
        <EmptyState v-else title="Sin publicaciones" />
      </div>

      <aside class="card preview-card" data-product-panel="resource-preview" :data-state="selected ? 'content' : 'empty'">
        <template v-if="selected">
          <div class="notice-preview">
            <span class="notice-date">{{ compactDate(selected.date || selected.timestamp) }}</span>
            <span class="scope-pill" :class="{ muted: isHiddenResource(selected.hidden) }">{{ isHiddenResource(selected.hidden) ? 'Oculta' : 'Publicada' }}</span>
            <AdminSyncCue v-if="resourceStatus(selected.id)" :status="resourceStatus(selected.id)" />
            <h2>{{ selected.title || 'Sin título' }}</h2>
            <p>{{ stripHtml(selected.description) || 'Sin descripción.' }}</p>
          </div>

          <div class="preview-meta">
            <span><FamilyPersonasIcon name="calendar" />{{ formatDate(selected.date || selected.timestamp, '—') }}</span>
            <span><FamilyPersonasIcon name="person" />{{ selected.autor || '—' }}</span>
            <span><FamilyPersonasIcon name="people" />{{ data?.sala?.unidad }} · {{ data?.sala?.sala }}</span>
            <span v-if="selected.resource"><FamilyPersonasIcon name="attachment" />Adjunto</span>
          </div>

          <div class="preview-actions">
            <a v-if="selected.resource" class="btn btn-secondary" :href="resourceHref(selected.resource)" target="_blank" rel="noopener" data-diagnostic-link="abrir-recurso">Abrir recurso</a>
            <button class="btn btn-secondary" type="button" data-diagnostic-action="editar-recurso" :disabled="isResourcePending(selected.id)" @click="openEditor(selected)">Editar</button>
            <button class="btn btn-secondary" type="button" data-diagnostic-action="toggle-publicacion" :disabled="isResourcePending(selected.id)" @click="togglePublished(selected)">{{ isHiddenResource(selected.hidden) ? 'Publicar' : 'Ocultar' }}</button>
            <button class="btn btn-danger" type="button" data-diagnostic-action="eliminar-recurso" :disabled="isResourcePending(selected.id)" @click="openDeleteDialog(selected)">Eliminar</button>
          </div>
        </template>
        <EmptyState v-else title="Selecciona una publicación" />
      </aside>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFetch, useRoute, useRouter } from 'nuxt/app'
import ResourceEditor from '~/components/admin/ResourceEditor.vue'
import AdminModuleTabs from '~/components/admin/AdminModuleTabs.vue'
import AdminModal from '~/components/admin/AdminModal.vue'
import AdminProcessingTray from '~/components/admin/AdminProcessingTray.vue'
import AdminSyncCue from '~/components/admin/AdminSyncCue.vue'
import EmptyState from '~/components/EmptyState.vue'
import FamilyPersonasIcon from '~/components/family/PersonasIcon.vue'
import { useOptimisticStatus } from '~/composables/useOptimisticStatus'
import type { DaycareResource, Sala } from '~/types/daycare'
import { daycareResourceSection, formatDate, isHiddenResource, isPdfResource, parseLegacyDate, publishedPdfViewerUrl, stripHtml } from '~/utils/daycare'

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
const editingBaseline = ref<Partial<DaycareResource> | null>(null)
const resourceDraftDirty = ref(false)
const selected = ref<DaycareResource | null>(null)
const saving = ref(false)
const deleting = ref(false)
const deleteDialog = ref<DaycareResource | null>(null)
const search = ref(typeof route.query.buscar === 'string' ? route.query.buscar : '')
const visibilityFilter = ref<'published' | 'hidden' | 'all'>(normalizeVisibilityFilter(route.query.estado))
const resourceFilter = ref<'all' | 'with' | 'without'>(normalizeResourceFilter(route.query.recurso))
const actionError = ref('')
const actionNotice = ref('')
const selectedIdFromRoute = computed(() => Number(route.query.registro || 0))
const createRequested = ref(isCreateQuery(route.query.create) || (import.meta.client && new URLSearchParams(window.location.search).get('create') === '1'))
let optimisticId = -1

const {
  entries: syncEntries,
  getStatus,
  isPending,
  markPending,
  markDone,
  markError,
  moveStatus
} = useOptimisticStatus()

const { data, pending, error } = useFetch<{ sala: Sala; rows: DaycareResource[] }>('/api/daycare/admin/resources', {
  query: { sala: salaId, type: props.type },
  timeout: 15000
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
  if (createRequested.value) return

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

watch(() => route.query.create, (value) => {
  if (isCreateQuery(value) && !editing.value) {
    createRequested.value = true
    startCreate(false)
  }
}, { immediate: true })

function startCreate(updateRoute = true) {
  if (saving.value) return
  createRequested.value = true
  actionError.value = ''
  actionNotice.value = ''
  const draft: Partial<DaycareResource> = {
    sala: String(salaId),
    unidad: data.value?.sala.unidad,
    type: props.type,
    title: '',
    description: '',
    date: props.type === 'cal' ? new Date().toISOString().slice(0, 10) : null,
    starred: 0,
    hidden: 0
  }
  editing.value = { ...draft }
  editingBaseline.value = { ...draft }
  resourceDraftDirty.value = false
  if (updateRoute) syncSelectedQuery(undefined, { create: '1' })
}

function openEditor(item: DaycareResource) {
  if (saving.value || isResourcePending(item.id)) return
  actionError.value = ''
  actionNotice.value = ''
  editing.value = { ...item }
  editingBaseline.value = { ...item }
  resourceDraftDirty.value = false
}

function closeEditor() {
  createRequested.value = false
  editing.value = null
  editingBaseline.value = null
  resourceDraftDirty.value = false
  actionError.value = ''
  if (isCreateQuery(route.query.create)) syncSelectedQuery(selected.value?.id)
}

function dismissEditorForSave() {
  createRequested.value = false
  editing.value = null
  resourceDraftDirty.value = false
  if (isCreateQuery(route.query.create)) syncSelectedQuery(selected.value?.id)
}

function selectRow(item: DaycareResource) {
  createRequested.value = false
  selected.value = item
  actionError.value = ''
  syncSelectedQuery(item.id)
}

async function save(payload: Partial<DaycareResource>) {
  if (saving.value) return
  saving.value = true
  actionError.value = ''
  actionNotice.value = ''

  const previousRows = cloneRows()
  const previousSelectedId = selected.value?.id
  const baselineBeforeSave = editingBaseline.value ? { ...editingBaseline.value } : null
  const requestPayload: Partial<DaycareResource> = {
    ...payload,
    sala: String(salaId),
    type: payload.type || props.type
  }
  const isUpdate = Boolean(payload.id && Number(payload.id) > 0)
  const localId = isUpdate ? Number(payload.id) : optimisticId--
  const optimistic = buildOptimisticResource(requestPayload, localId)
  const key = resourceKey(localId)

  upsertLocalResource(optimistic, !isUpdate)
  selected.value = optimistic
  dismissEditorForSave()
  markPending(key, optimistic.title || props.title, {
    detail: isUpdate ? 'Guardando cambios en segundo plano.' : 'Creando la publicación en segundo plano.'
  })

  try {
    const saved = await $fetch<DaycareResource>('/api/daycare/admin/resources', {
      method: 'POST',
      body: requestPayload
    })

    const savedId = Number(saved.id)
    if (!Number.isInteger(savedId) || savedId <= 0) throw new Error('El servidor no devolvió el identificador de la publicación.')
    const savedKey = resourceKey(savedId)
    const savedItemStillSelected = selected.value?.id === localId
    moveStatus(key, savedKey)

    if (saved.type && saved.type !== props.type) {
      removeLocalResource(localId)
      markDone(savedKey, saved.title || optimistic.title, { detail: 'La publicación quedó guardada en su categoría.' })
      const section = daycareResourceSection(saved.type)
      if (section && savedItemStillSelected) {
        const query = route.query.unidad ? { unidad: String(route.query.unidad), registro: String(savedId) } : { registro: String(savedId) }
        void router.replace({ path: `/admin/daycare/salas/${salaId}/${section}`, query }).catch(() => {
          actionError.value = 'La publicación se guardó, pero no fue posible abrir su categoría automáticamente.'
        })
      }
      editingBaseline.value = null
      return
    }

    const confirmed = { ...optimistic, ...saved, id: savedId } as DaycareResource
    replaceLocalResource(localId, confirmed)
    if (savedItemStillSelected) {
      selected.value = confirmed
      syncSelectedQuery(savedId)
    }
    editingBaseline.value = null
    markDone(savedKey, confirmed.title || props.title, { detail: 'El servidor confirmó el cambio.' })
    actionNotice.value = isUpdate ? 'Publicación actualizada.' : 'Publicación creada.'
  } catch (err: any) {
    const previousItem = previousRows.find((row) => row.id === localId)
    if (previousItem) replaceLocalResource(localId, previousItem)
    else removeLocalResource(localId)
    if (selected.value?.id === localId) {
      selected.value = previousSelectedId
        ? (data.value?.rows || []).find((row) => row.id === previousSelectedId) || previousItem || null
        : previousItem || null
      syncSelectedQuery(selected.value?.id)
    }
    editing.value = { ...payload }
    editingBaseline.value = baselineBeforeSave
    resourceDraftDirty.value = true
    markError(key, optimistic.title || props.title, { detail: 'No se guardó; restauramos el estado anterior.' })
    actionError.value = err?.data?.statusMessage || err?.statusMessage || err?.message || 'No fue posible guardar la publicación.'
  } finally {
    saving.value = false
  }
}

async function togglePublished(item: DaycareResource) {
  if (!item.id || isResourcePending(item.id)) return
  actionError.value = ''
  actionNotice.value = ''
  const previous = { ...item }
  const wasSelected = selected.value?.id === item.id
  const willHide = !isHiddenResource(item.hidden)
  const optimistic = { ...item, hidden: willHide ? 1 : 0 }
  const key = resourceKey(item.id)

  replaceLocalResource(item.id, optimistic)
  if (wasSelected) selected.value = optimistic
  markPending(key, item.title || props.title, {
    detail: willHide ? 'Ocultando la publicación para familias.' : 'Publicando para las familias.'
  })

  try {
    await $fetch(`/api/daycare/admin/resources/${item.id}`, {
      method: 'PATCH',
      body: { hidden: willHide }
    })
    markDone(key, item.title || props.title, { detail: willHide ? 'La publicación quedó oculta.' : 'La publicación ya está visible.' })
    actionNotice.value = willHide ? 'Publicación oculta para familias.' : 'Publicación visible para familias.'
  } catch (err: any) {
    replaceLocalResource(item.id, previous)
    if (selected.value?.id === item.id) selected.value = previous
    markError(key, item.title || props.title, { detail: 'No se cambió la visibilidad.' })
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible cambiar la visibilidad.'
  }
}

function openDeleteDialog(item: DaycareResource | null) {
  if (!item?.id || isResourcePending(item.id)) return
  actionError.value = ''
  actionNotice.value = ''
  deleteDialog.value = item
}

function closeDeleteDialog() {
  if (deleting.value) return
  deleteDialog.value = null
}

async function confirmDelete() {
  const item = deleteDialog.value
  const id = item?.id
  if (!item || !id || deleting.value) return
  deleting.value = true
  actionError.value = ''
  actionNotice.value = ''
  const previousRows = cloneRows()
  const originalIndex = previousRows.findIndex((row) => row.id === id)
  const wasSelected = selected.value?.id === id
  const key = resourceKey(id)

  deleteDialog.value = null
  removeLocalResource(id)
  if (wasSelected) selected.value = filteredRows.value[0] || null
  syncSelectedQuery(selected.value?.id)
  markPending(key, item.title || props.title, { detail: 'Eliminando la publicación en segundo plano.' })

  try {
    await $fetch(`/api/daycare/admin/resources/${id}`, { method: 'DELETE' })
    markDone(key, item.title || props.title, { detail: 'La publicación quedó eliminada.' })
    actionNotice.value = 'Publicación eliminada.'
  } catch (err: any) {
    restoreLocalResource(item, originalIndex)
    if (!selected.value) selected.value = item
    syncSelectedQuery(selected.value?.id)
    markError(key, item.title || props.title, { detail: 'No se eliminó; restauramos la publicación.' })
    actionError.value = err?.data?.statusMessage || err?.statusMessage || err?.message || 'No fue posible eliminar la publicación.'
  } finally {
    deleting.value = false
  }
}

function cloneRows() {
  return (data.value?.rows || []).map((row) => ({ ...row }))
}

function setResourceRows(rows: DaycareResource[]) {
  if (data.value) data.value.rows = rows
}

function buildOptimisticResource(payload: Partial<DaycareResource>, id: number): DaycareResource {
  const existing = (data.value?.rows || []).find((row) => row.id === id)
  return {
    ...existing,
    ...payload,
    id,
    title: String(payload.title || existing?.title || 'Sin título'),
    description: payload.description ?? existing?.description ?? '',
    date: payload.date ?? existing?.date ?? null,
    timestamp: payload.timestamp || existing?.timestamp || new Date().toISOString(),
    resource: payload.resource ?? existing?.resource ?? null,
    autor: payload.autor ?? existing?.autor ?? null,
    unidad: String(payload.unidad || existing?.unidad || data.value?.sala?.unidad || 'Guardería'),
    sala: String(salaId),
    type: payload.type || existing?.type || props.type,
    starred: payload.starred ? 1 : 0,
    hidden: isHiddenResource(payload.hidden) ? 1 : 0
  }
}

function upsertLocalResource(item: DaycareResource, prepend = false) {
  const rows = data.value?.rows || []
  const index = rows.findIndex((row) => row.id === item.id)
  if (index >= 0) {
    setResourceRows(rows.map((row) => row.id === item.id ? item : row))
    return
  }
  setResourceRows(prepend ? [item, ...rows] : [...rows, item])
}

function replaceLocalResource(id: number, item: DaycareResource) {
  setResourceRows((data.value?.rows || []).map((row) => row.id === id ? item : row))
}

function removeLocalResource(id: number) {
  setResourceRows((data.value?.rows || []).filter((row) => row.id !== id))
}

function restoreLocalResource(item: DaycareResource, index: number) {
  const rows = (data.value?.rows || []).filter((row) => row.id !== item.id)
  const targetIndex = Math.max(0, Math.min(index, rows.length))
  setResourceRows([...rows.slice(0, targetIndex), item, ...rows.slice(targetIndex)])
}

function resourceKey(id?: number) {
  return `resource:${id || 'unknown'}`
}

function resourceStatus(id?: number) {
  return id ? getStatus(resourceKey(id)) : undefined
}

function isResourcePending(id?: number) {
  return Boolean(id && isPending(resourceKey(id)))
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
  replaceQueryIfChanged(nextQuery)
}

function syncSelectedQuery(id?: number, extra: Record<string, string> = {}) {
  const nextQuery = { ...route.query, ...extra }
  if (!Object.prototype.hasOwnProperty.call(extra, 'create')) delete nextQuery.create
  setQueryValue(nextQuery, 'registro', id && id > 0 ? String(id) : '')
  replaceQueryIfChanged(nextQuery)
}

function setQueryValue(query: Record<string, any>, key: string, value: string) {
  if (value) query[key] = value
  else delete query[key]
}

function replaceQueryIfChanged(query: Record<string, any>) {
  if (!import.meta.client) return Promise.resolve()
  const keys = new Set([...Object.keys(route.query), ...Object.keys(query)])
  const changed = Array.from(keys).some((key) => {
    const current = Array.isArray(route.query[key]) ? route.query[key]?.[0] : route.query[key]
    return String(current || '') !== String(query[key] || '')
  })
  return changed ? router.replace({ path: route.path, query }) : Promise.resolve()
}

function normalizeVisibilityFilter(value: unknown): 'published' | 'hidden' | 'all' {
  return value === 'hidden' || value === 'all' ? value : 'published'
}

function normalizeResourceFilter(value: unknown): 'all' | 'with' | 'without' {
  return value === 'with' || value === 'without' ? value : 'all'
}

function isCreateQuery(value: unknown) {
  const source = Array.isArray(value) ? value[0] : value
  return String(source || '') === '1'
}
</script>

<style scoped>
.resource-module {
  --ink: #102235;
  --muted: #617187;
  --line: rgba(18, 95, 89, 0.16);
  --accent: #07877d;
  --accent-dark: #075f58;
  --sun: #f6b94f;
  gap: 14px;
}

.module-hero {
  align-items: end;
  background:
    radial-gradient(circle at 9% 14%, rgba(8, 135, 125, 0.12), transparent 34%),
    radial-gradient(circle at 82% 0%, rgba(246, 185, 79, 0.20), transparent 28%),
    linear-gradient(135deg, #ffffff, #fbfdf6);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: 0 22px 58px rgba(14, 40, 55, 0.08);
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(520px, 0.95fr);
  overflow: hidden;
  padding: clamp(18px, 2.4vw, 28px);
  position: relative;
}

.module-hero::after {
  background: linear-gradient(180deg, var(--accent), #8bbf48);
  border-radius: 999px;
  content: '';
  height: 82px;
  opacity: 0.14;
  position: absolute;
  right: 34px;
  top: -40px;
  transform: rotate(34deg);
  width: 14px;
}

.module-hero h1 {
  color: var(--ink);
  font-family: var(--font-title, var(--font-body));
  font-size: clamp(1.8rem, 3.2vw, 3rem);
  letter-spacing: -0.03em;
  line-height: 0.96;
  margin: 0;
}

.eyebrow {
  color: var(--accent-dark);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  margin: 0 0 6px;
  text-transform: uppercase;
}

.module-actions {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(190px, 1fr) minmax(132px, 0.36fr) minmax(132px, 0.36fr) auto;
  position: relative;
  z-index: 1;
}

.search-field {
  align-items: center;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(8, 135, 125, 0.18);
  border-radius: 17px;
  box-shadow: 0 14px 30px rgba(14, 40, 55, 0.06);
  color: var(--accent-dark);
  display: grid;
  gap: 9px;
  grid-template-columns: 20px minmax(0, 1fr);
  min-height: 48px;
  padding: 6px 12px;
}

.search-field .input {
  background: transparent;
  border: 0;
  box-shadow: none;
  padding: 0;
}

.filter-select {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(8, 135, 125, 0.18);
  border-radius: 15px;
  min-height: 48px;
}

.module-actions .btn-primary {
  background: #21324a;
  border-radius: 15px;
  box-shadow: 0 16px 30px rgba(33, 50, 74, 0.18);
  min-height: 48px;
  white-space: nowrap;
}

.resource-desk {
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1fr) minmax(330px, 380px);
}

.resource-list-card,
.preview-card,
.loading-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: 0 18px 48px rgba(14, 40, 55, 0.07);
}

.resource-list-card {
  min-width: 0;
  padding: 14px;
}

.section-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 10px;
}

.section-head h2 {
  color: var(--ink);
  font-family: var(--font-title, var(--font-body));
  font-size: clamp(1.25rem, 2vw, 1.65rem);
  margin: 0;
}

.scope-pill {
  background: #effaf7;
  border: 1px solid rgba(8, 135, 125, 0.16);
  border-radius: 999px;
  color: var(--accent-dark);
  font-size: 0.78rem;
  font-weight: 900;
  padding: 7px 10px;
  white-space: nowrap;
}

.scope-pill.muted {
  background: #f2f4f5;
  color: var(--muted);
}

.resource-list {
  display: grid;
  gap: 7px;
}

.resource-row {
  align-items: center;
  background: #ffffff;
  border: 1px solid transparent;
  border-radius: 18px;
  cursor: pointer;
  display: grid;
  gap: 12px;
  grid-template-columns: 66px minmax(0, 1fr) minmax(100px, auto);
  padding: 10px;
  text-align: left;
  width: 100%;
}

.resource-row:hover,
.resource-row.active {
  background: linear-gradient(135deg, #f0fbf7, #fffaf0);
  border-color: rgba(8, 135, 125, 0.22);
}

.resource-row.active {
  box-shadow: inset 3px 0 0 var(--accent);
}

.resource-row.hidden {
  opacity: 0.72;
}

.row-date {
  background: #fff7df;
  border: 1px solid rgba(246, 185, 79, 0.32);
  border-radius: 14px;
  color: #8a650c;
  font-size: 0.78rem;
  font-weight: 900;
  padding: 8px;
  text-align: center;
  text-transform: capitalize;
}

.row-main,
.row-status {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.row-main strong,
.row-main small,
.row-status small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-main strong {
  color: var(--ink);
}

.row-main small,
.row-status small {
  color: var(--muted);
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
  color: var(--accent-dark);
}

.preview-card {
  align-self: start;
  display: grid;
  gap: 13px;
  padding: 14px;
  position: sticky;
  top: calc(var(--topbar-height) + 14px);
}

.notice-preview {
  background:
    radial-gradient(circle at 100% 0%, rgba(8, 135, 125, 0.10), transparent 34%),
    linear-gradient(135deg, #ffffff, #fffaf0);
  border: 1px solid rgba(8, 135, 125, 0.14);
  border-radius: 22px;
  display: grid;
  gap: 10px;
  padding: 16px;
}

.notice-date {
  background: #fff7df;
  border: 1px solid rgba(246, 185, 79, 0.36);
  border-radius: 999px;
  color: #8a650c;
  font-size: 0.76rem;
  font-weight: 900;
  justify-self: start;
  padding: 7px 10px;
  text-transform: capitalize;
}

.notice-preview .scope-pill {
  justify-self: start;
}

.notice-preview h2 {
  color: var(--ink);
  font-family: var(--font-title, var(--font-body));
  font-size: clamp(1.45rem, 2vw, 2rem);
  line-height: 1;
  margin: 0;
}

.notice-preview p {
  color: var(--muted);
  line-height: 1.45;
  margin: 0;
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-meta span {
  align-items: center;
  background: #f8fbfb;
  border: 1px solid rgba(18, 95, 89, 0.10);
  border-radius: 999px;
  color: #46586e;
  display: inline-flex;
  font-size: 0.76rem;
  font-weight: 900;
  gap: 6px;
  padding: 7px 10px;
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
  font-weight: 600;
  margin: 0;
  padding: 8px 10px;
}

.loading-card {
  color: var(--muted);
  padding: 20px;
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
.delete-confirm-modal {
  align-items: center;
  display: grid;
  gap: 14px;
  grid-template-columns: auto minmax(0, 1fr);
}

.delete-confirm-icon {
  align-items: center;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  border-radius: 999px;
  color: #be123c;
  display: inline-flex;
  font-weight: 950;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.delete-confirm-modal strong,
.delete-confirm-modal small { display: block; }
.delete-confirm-modal strong { color: var(--ink); }
.delete-confirm-modal small { color: var(--muted); margin-top: 3px; }
.delete-confirm-modal .modal-actions {
  display: flex;
  gap: 10px;
  grid-column: 1 / -1;
  justify-content: flex-end;
}



.compact-alert { margin: 0 0 12px; }

.resource-row.syncing {
  background: #f5faff;
  border-color: rgba(23, 93, 135, 0.2);
}

.resource-row.failed {
  background: #fff7f8;
  border-color: rgba(167, 25, 53, 0.2);
}

.row-status :deep(.sync-cue) {
  justify-self: end;
  margin-bottom: 2px;
}
</style>
