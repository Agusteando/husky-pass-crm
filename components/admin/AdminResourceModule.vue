<template>
  <section class="resource-module stack" :class="moduleTone" data-product-area="daycare" :data-product-screen="type">
    <AdminModuleTabs :sala-id="salaId" :unidad="data?.sala?.unidad" :sala-name="data?.sala?.sala" />
    <AdminProcessingTray :items="syncEntries" />

    <header class="module-hero">
      <div class="hero-copy">
        <p class="hero-kicker">{{ data?.sala?.unidad || 'Guardería' }} · {{ data?.sala?.sala || 'Sala' }}</p>
        <h1>{{ title }}</h1>
        <div class="hero-stats">
          <span><strong>{{ resourceStats.published }}</strong> publicadas</span>
          <span><strong>{{ resourceStats.withMedia }}</strong> con media</span>
          <span><strong>{{ resourceStats.total }}</strong> total</span>
        </div>
        <button class="hero-action" type="button" data-diagnostic-action="crear-recurso" :disabled="saving" @click="startCreate()">
          <FamilyPersonasIcon name="plus" />{{ actionLabel }}
        </button>
      </div>
      <div class="hero-art" aria-hidden="true">
        <span class="hero-disc"><FamilyPersonasIcon :name="moduleIcon" /></span>
        <img :src="sunnyMascot" alt="" />
      </div>
    </header>

    <section class="module-toolbar" aria-label="Filtros de publicaciones">
      <label class="search-field search-field-wide">
        <FamilyPersonasIcon name="search" />
        <input v-model="search" class="input" type="search" placeholder="Título, descripción o autor" aria-label="Buscar publicación" data-diagnostic-filter="buscar-recurso" />
      </label>
      <label class="filter-field">
        <span>Estado</span>
        <select v-model="visibilityFilter" class="select" aria-label="Estado" data-diagnostic-filter="estado-recurso">
          <option value="published">Publicadas</option>
          <option value="hidden">Ocultas</option>
          <option value="all">Todas</option>
        </select>
      </label>
      <label class="filter-field">
        <span>Contenido</span>
        <select v-model="resourceFilter" class="select" aria-label="Archivo" data-diagnostic-filter="archivo-recurso">
          <option value="all">Todos</option>
          <option value="with">Con archivo</option>
          <option value="without">Sin archivo</option>
        </select>
      </label>
    </section>

    <AdminModal
      v-if="editing"
      :title="editing.id ? `Editar ${title.toLowerCase()}` : actionLabel"
      eyebrow="Guardería"
      :description="data?.sala ? `${data.sala.unidad} · ${data.sala.sala}` : undefined"
      :close-disabled="saving"
      :dirty="resourceDraftDirty"
      wide
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
      <div class="resource-list-card" data-product-panel="resource-list" :data-state="filteredRows.length ? 'content' : 'empty'">
        <header class="section-head">
          <div>
            <p class="eyebrow">Publicaciones</p>
            <h2>{{ filteredRows.length }} visibles</h2>
          </div>
          <span class="scope-pill">{{ data?.sala?.sala }}</span>
        </header>

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
            <span class="row-media" :class="{ 'has-image': mediaAssetFor(item.resource)?.kind === 'image' }">
              <img v-if="mediaAssetFor(item.resource)?.kind === 'image'" :src="mediaAssetFor(item.resource)?.url" alt="" loading="lazy" />
              <FamilyPersonasIcon v-else :name="mediaIconFor(item.resource)" />
            </span>
            <span class="row-main">
              <span class="row-meta"><time>{{ compactDate(item.date || item.timestamp) }}</time><em>{{ daycareMediaLabel(item.resource) }}</em></span>
              <strong>{{ item.title || 'Sin título' }}</strong>
              <small>{{ stripHtml(item.description) || 'Sin descripción' }}</small>
            </span>
            <span class="row-status">
              <AdminSyncCue v-if="resourceStatus(item.id)" :status="resourceStatus(item.id)" compact />
              <strong :class="isHiddenResource(item.hidden) ? 'status-hidden' : 'status-published'">{{ isHiddenResource(item.hidden) ? 'Oculta' : 'Publicada' }}</strong>
              <FamilyPersonasIcon name="arrow" />
            </span>
          </button>
        </div>
        <EmptyState v-else title="Sin publicaciones" />
      </div>

      <aside class="preview-card" data-product-panel="resource-preview" :data-state="selected ? 'content' : 'empty'">
        <template v-if="selected">
          <header class="preview-status-row">
            <div>
              <p class="eyebrow">Vista familias</p>
              <span class="scope-pill" :class="{ muted: isHiddenResource(selected.hidden) }">{{ isHiddenResource(selected.hidden) ? 'Oculta' : 'Publicada' }}</span>
            </div>
            <AdminSyncCue v-if="resourceStatus(selected.id)" :status="resourceStatus(selected.id)" />
          </header>

          <ResourceCard
            :resource="selected"
            :variant="selected.type === 'hw' ? 'homework' : selected.type === 'cal' ? 'calendar' : 'notice'"
            density="comfortable"
            featured
          />

          <div class="preview-meta">
            <span><FamilyPersonasIcon name="calendar" />{{ formatDate(selected.date || selected.timestamp, '—') }}</span>
            <span><FamilyPersonasIcon name="person" />{{ selected.autor || '—' }}</span>
            <span v-if="selected.resource"><FamilyPersonasIcon name="attachment" />{{ daycareMediaLabel(selected.resource) }}</span>
          </div>

          <div class="preview-actions">
            <button class="btn btn-primary" type="button" data-diagnostic-action="editar-recurso" :disabled="isResourcePending(selected.id)" @click="openEditor(selected)"><FamilyPersonasIcon name="edit" />Editar</button>
            <button class="btn btn-secondary" type="button" data-diagnostic-action="toggle-publicacion" :disabled="isResourcePending(selected.id)" @click="togglePublished(selected)">{{ isHiddenResource(selected.hidden) ? 'Publicar' : 'Ocultar' }}</button>
            <button class="icon-danger" type="button" data-diagnostic-action="eliminar-recurso" :disabled="isResourcePending(selected.id)" aria-label="Eliminar publicación" @click="openDeleteDialog(selected)"><FamilyPersonasIcon name="trash" /></button>
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
import { daycareResourceSection, formatDate, isHiddenResource, parseLegacyDate, stripHtml } from '~/utils/daycare'
import { daycareDocumentIcon, daycareMediaAsset, daycareMediaLabel } from '~/utils/daycareMedia'
import { personasMascot, resolvePersonasTheme } from '~/utils/personasTheme'

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
const daycareTheme = resolvePersonasTheme({ themeKey: 'daycare' })
const sunnyMascot = personasMascot(daycareTheme, props.type === 'hw' ? 'help' : props.type === 'cal' ? 'preview' : 'header')
const moduleTone = computed(() => props.type === 'hw' ? 'tone-amber' : props.type === 'cal' ? 'tone-blue' : 'tone-coral')
const moduleIcon = computed(() => props.type === 'hw' ? 'edit' : props.type === 'cal' ? 'calendar' : 'announcement')
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

const resourceStats = computed(() => {
  const rows = data.value?.rows || []
  return {
    total: rows.length,
    published: rows.filter((item) => !isHiddenResource(item.hidden)).length,
    withMedia: rows.filter((item) => Boolean(item.resource)).length
  }
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


function mediaAssetFor(resource?: string | null) {
  return daycareMediaAsset(resource)
}

function mediaIconFor(resource?: string | null) {
  return daycareDocumentIcon(daycareMediaAsset(resource)?.kind)
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
  --module-accent: #578b26;
  --module-soft: #edf6e4;
  --module-soft-strong: #dcebc9;
  --module-deep: #355f24;
  --module-gradient-end: #8eae3f;
  gap: clamp(16px, 2.2vw, 24px);
}

.resource-module.tone-amber {
  --module-accent: #d78b16;
  --module-soft: #fff6e4;
  --module-soft-strong: #ffe8bc;
  --module-deep: #7c520d;
  --module-gradient-end: #d9a83d;
}

.resource-module.tone-coral {
  --module-accent: #c15e50;
  --module-soft: #fff0ed;
  --module-soft-strong: #fbdad4;
  --module-deep: #8e4036;
  --module-gradient-end: #dc7565;
}

.resource-module.tone-blue {
  --module-accent: #3f7fa2;
  --module-soft: #edf6fa;
  --module-soft-strong: #d8ebf3;
  --module-deep: #245a77;
  --module-gradient-end: #64a2c2;
}

.module-hero {
  background:
    radial-gradient(circle at 15% 116%, rgba(255, 190, 71, 0.28), transparent 34%),
    radial-gradient(circle at 91% 4%, rgba(255, 255, 255, 0.18), transparent 26%),
    linear-gradient(135deg, #294e20 0%, var(--module-deep) 54%, var(--module-gradient-end) 100%);
  border-radius: 34px;
  box-shadow: 0 26px 64px color-mix(in srgb, var(--module-deep) 22%, transparent);
  color: #fff;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 330px);
  min-height: 300px;
  overflow: hidden;
  padding: clamp(28px, 5vw, 50px);
  position: relative;
}

.module-hero::before {
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 50%;
  content: '';
  height: 340px;
  left: -180px;
  position: absolute;
  top: -210px;
  width: 340px;
}

.hero-copy {
  align-self: center;
  display: grid;
  gap: 13px;
  position: relative;
  z-index: 2;
}

.hero-kicker {
  color: rgba(255, 255, 255, 0.74);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.13em;
  margin: 0;
  text-transform: uppercase;
}

.hero-copy h1 {
  color: #fff;
  font-family: var(--font-title);
  font-size: clamp(3rem, 7vw, 6rem);
  letter-spacing: -0.04em;
  line-height: 0.84;
  margin: 0;
}

.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-stats span {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.7rem;
  padding: 8px 11px;
}

.hero-stats strong {
  color: #fff;
  font-size: 0.84rem;
  margin-right: 3px;
}

.hero-action {
  align-items: center;
  background: #fff;
  border: 0;
  border-radius: 16px;
  box-shadow: 0 16px 32px rgba(31, 55, 22, 0.2);
  color: var(--module-deep);
  cursor: pointer;
  display: inline-flex;
  font-weight: 900;
  gap: 8px;
  justify-self: start;
  margin-top: 4px;
  min-height: 48px;
  padding: 0 17px;
}

.hero-art {
  min-height: 250px;
  position: relative;
}

.hero-art img {
  bottom: -54px;
  filter: drop-shadow(0 24px 24px rgba(29, 56, 21, 0.22));
  max-height: 310px;
  object-fit: contain;
  position: absolute;
  right: -8px;
  width: min(100%, 280px);
  z-index: 2;
}

.hero-disc {
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 50%;
  color: #fff;
  display: inline-flex;
  height: 180px;
  justify-content: center;
  position: absolute;
  right: 22px;
  top: 18px;
  width: 180px;
}

.hero-disc :deep(.pa-icon) {
  height: 3.2rem;
  opacity: 0.42;
  width: 3.2rem;
}

.module-toolbar {
  align-items: end;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(66, 104, 49, 0.13);
  border-radius: 24px;
  box-shadow: 0 16px 44px rgba(51, 82, 37, 0.08);
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(260px, 1fr) minmax(150px, 0.24fr) minmax(150px, 0.24fr);
  padding: 10px;
}

.search-field {
  align-items: center;
  background: #f8faf4;
  border: 1px solid rgba(66, 104, 49, 0.12);
  border-radius: 17px;
  color: var(--module-accent);
  display: grid;
  gap: 9px;
  grid-template-columns: 20px minmax(0, 1fr);
  min-height: 48px;
  padding: 6px 12px;
}

.search-field .input,
.filter-field .select {
  background: transparent;
  border: 0;
  box-shadow: none;
}

.filter-field {
  background: #fff;
  border: 1px solid rgba(66, 104, 49, 0.12);
  border-radius: 17px;
  display: grid;
  gap: 1px;
  padding: 7px 11px;
}

.filter-field > span {
  color: #7a8473;
  font-size: 0.61rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.resource-desk {
  align-items: start;
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 430px);
}

.resource-list-card,
.preview-card,
.loading-card {
  background: rgba(255, 255, 255, 0.91);
  border: 1px solid rgba(66, 104, 49, 0.13);
  border-radius: 28px;
  box-shadow: 0 20px 58px rgba(51, 82, 37, 0.09);
}

.resource-list-card {
  min-width: 0;
  padding: 14px;
}

.section-head,
.preview-status-row {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.section-head {
  padding: 5px 5px 13px;
}

.eyebrow {
  color: var(--module-accent);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.13em;
  margin: 0 0 5px;
  text-transform: uppercase;
}

.section-head h2 {
  color: #263f1c;
  font-family: var(--font-title);
  font-size: clamp(1.35rem, 2.4vw, 2rem);
  margin: 0;
}

.scope-pill {
  background: var(--module-soft);
  border: 1px solid color-mix(in srgb, var(--module-accent) 18%, transparent);
  border-radius: 999px;
  color: var(--module-deep);
  font-size: 0.72rem;
  font-weight: 900;
  padding: 7px 10px;
  white-space: nowrap;
}

.scope-pill.muted {
  background: #f2f4ef;
  color: #6f7868;
}

.resource-list {
  display: grid;
  gap: 8px;
}

.resource-row {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 22px;
  cursor: pointer;
  display: grid;
  gap: 12px;
  grid-template-columns: 68px minmax(0, 1fr) auto;
  min-height: 88px;
  padding: 9px;
  text-align: left;
  transition: 160ms ease;
  width: 100%;
}

.resource-row:hover,
.resource-row.active {
  background: linear-gradient(135deg, var(--module-soft), #fffaf0);
  border-color: color-mix(in srgb, var(--module-accent) 18%, transparent);
  transform: translateY(-1px);
}

.resource-row.active {
  box-shadow: inset 3px 0 0 var(--module-accent), 0 12px 28px rgba(51, 82, 37, 0.08);
}

.resource-row.hidden {
  opacity: 0.72;
}

.row-media {
  align-items: center;
  background: var(--module-soft-strong);
  border-radius: 18px;
  color: var(--module-deep);
  display: inline-flex;
  height: 68px;
  justify-content: center;
  overflow: hidden;
  width: 68px;
}

.row-media.has-image {
  background: #eef0eb;
}

.row-media img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.row-media :deep(.pa-icon) {
  height: 1.5rem;
  width: 1.5rem;
}

.row-main,
.row-status {
  display: grid;
  min-width: 0;
}

.row-main {
  gap: 3px;
}

.row-meta {
  align-items: center;
  display: flex;
  gap: 7px;
}

.row-meta time,
.row-meta em {
  color: #7b8475;
  font-size: 0.65rem;
  font-style: normal;
  font-weight: 800;
}

.row-meta em {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 999px;
  padding: 3px 6px;
}

.row-main strong,
.row-main small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-main strong {
  color: #263f1c;
  font-size: 0.94rem;
}

.row-main small {
  color: #747e6d;
  font-size: 0.76rem;
}

.row-status {
  align-items: end;
  gap: 5px;
  justify-items: end;
}

.row-status > :deep(.pa-icon) {
  color: #99a093;
  height: 1rem;
  width: 1rem;
}

.status-hidden,
.status-published {
  font-size: 0.7rem;
  font-weight: 900;
}

.status-hidden { color: #8d5a00; }
.status-published { color: #426831; }

.preview-card {
  align-self: start;
  display: grid;
  gap: 14px;
  padding: 14px;
  position: sticky;
  top: calc(var(--topbar-height) + 16px);
}

.preview-status-row > div {
  display: grid;
  gap: 2px;
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.preview-meta span {
  align-items: center;
  background: #f8faf4;
  border: 1px solid rgba(66, 104, 49, 0.1);
  border-radius: 999px;
  color: #64705e;
  display: inline-flex;
  font-size: 0.7rem;
  font-weight: 800;
  gap: 6px;
  padding: 7px 9px;
}

.preview-actions {
  display: grid;
  gap: 8px;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.8fr) 44px;
}

.preview-actions .btn-primary {
  background: #263f1c;
  box-shadow: 0 14px 28px rgba(38, 63, 28, 0.17);
}

.icon-danger {
  align-items: center;
  background: #fff0ed;
  border: 1px solid rgba(193, 94, 80, 0.16);
  border-radius: 13px;
  color: #a4473b;
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
}

.notice {
  background: #edf8e7;
  border: 1px solid #cbe4b8;
  border-radius: 16px;
  color: #355f24;
  font-weight: 700;
  margin: 0;
  padding: 10px 13px;
}

.loading-card {
  color: #717a6c;
  padding: 22px;
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
.delete-confirm-modal strong { color: #263f1c; }
.delete-confirm-modal small { color: #747e6d; margin-top: 3px; }
.delete-confirm-modal .modal-actions { display: flex; gap: 10px; grid-column: 1 / -1; justify-content: flex-end; }

.compact-alert { margin: 0 0 12px; }
.resource-row.syncing { background: #f2f8fb; border-color: rgba(78, 145, 182, 0.2); }
.resource-row.failed { background: #fff4f2; border-color: rgba(193, 94, 80, 0.2); }
.row-status :deep(.sync-cue) { justify-self: end; }

@media (max-width: 1120px) {
  .resource-desk {
    grid-template-columns: 1fr;
  }

  .preview-card {
    position: static;
  }
}

@media (max-width: 820px) {
  .module-hero {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .hero-art {
    display: none;
  }

  .module-toolbar {
    grid-template-columns: 1fr 1fr;
  }

  .search-field {
    grid-column: 1 / -1;
  }
}

@media (max-width: 620px) {
  .module-hero {
    border-radius: 28px;
    padding: 26px 20px;
  }

  .hero-copy h1 {
    font-size: clamp(3rem, 16vw, 4.8rem);
  }

  .hero-action {
    justify-self: stretch;
    justify-content: center;
  }

  .module-toolbar,
  .resource-row,
  .preview-actions {
    grid-template-columns: 1fr;
  }

  .search-field {
    grid-column: auto;
  }

  .resource-row {
    align-items: start;
    grid-template-columns: 58px minmax(0, 1fr);
  }

  .row-media {
    height: 58px;
    width: 58px;
  }

  .row-status {
    align-items: center;
    display: flex;
    grid-column: 1 / -1;
    justify-content: space-between;
    padding-inline: 4px;
  }

  .row-main strong,
  .row-main small {
    white-space: normal;
  }

  .icon-danger {
    min-height: 42px;
  }
}
</style>
