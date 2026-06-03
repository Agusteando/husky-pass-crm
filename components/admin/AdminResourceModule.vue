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
        <button class="btn btn-primary" type="button" @click="startCreate">{{ actionLabel }}</button>
      </div>
    </header>

    <ResourceEditor
      v-if="editing"
      :resource="editing"
      :label="title"
      :saving="saving"
      @save="save"
      @cancel="editing = null"
    />

    <p v-if="error" class="alert">No fue posible cargar esta sección.</p>
    <p v-if="actionError" class="alert">{{ actionError }}</p>
    <div v-else-if="pending" class="card loading-card">Cargando publicaciones…</div>

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
            :class="{ active: selected?.id === item.id }"
            type="button"
            @click="selected = item"
          >
            <span class="row-date">{{ compactDate(item.date || item.timestamp) }}</span>
            <span class="row-main">
              <strong>{{ item.title || 'Sin título' }}</strong>
              <small>{{ stripHtml(item.description) || 'Sin descripción' }}</small>
            </span>
            <span class="row-meta">{{ item.resource ? 'Archivo' : 'Sin archivo' }}</span>
          </button>
        </div>
        <EmptyState v-else title="Sin publicaciones" description="No hay registros vigentes para esta búsqueda." />
      </div>

      <aside class="card preview-card">
        <template v-if="selected">
          <div class="section-head">
            <div>
              <p class="eyebrow">Vista previa</p>
              <h2>{{ selected.title || 'Sin título' }}</h2>
            </div>
          </div>
          <p>{{ stripHtml(selected.description) || 'Sin descripción.' }}</p>
          <dl>
            <div><dt>Fecha</dt><dd>{{ formatDate(selected.date || selected.timestamp, '—') }}</dd></div>
            <div><dt>Autor</dt><dd>{{ selected.autor || '—' }}</dd></div>
            <div><dt>Visible en</dt><dd>{{ data?.sala?.unidad }} · {{ data?.sala?.sala }}</dd></div>
          </dl>
          <div class="preview-actions">
            <a v-if="selected.resource" class="btn btn-secondary" :href="resourceHref(selected.resource)" target="_blank" rel="noopener">Abrir recurso</a>
            <button class="btn btn-secondary" type="button" @click="editing = { ...selected }">Editar</button>
            <button class="btn btn-danger" type="button" @click="remove(selected.id)">Ocultar</button>
          </div>
        </template>
        <EmptyState v-else title="Selecciona un registro" description="El detalle aparecerá aquí." />
      </aside>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFetch, useRoute } from '#imports'
import type { DaycareResource, Sala } from '~/types/daycare'
import { formatDate, isPdfResource, parseLegacyDate, publishedPdfViewerUrl, stripHtml } from '~/utils/daycare'

const props = defineProps<{
  type: 'hw' | 'news' | 'cal'
  title: string
  description: string
  actionLabel: string
}>()

const route = useRoute()
const salaId = Number(route.params.id)
const editing = ref<Partial<DaycareResource> | null>(null)
const selected = ref<DaycareResource | null>(null)
const saving = ref(false)
const search = ref('')
const actionError = ref('')

const { data, refresh, pending, error } = await useFetch<{ sala: Sala; rows: DaycareResource[] }>('/api/daycare/admin/resources', {
  query: { sala: salaId, type: props.type }
})

const filteredRows = computed(() => {
  const needle = search.value.trim().toLowerCase()
  const rows = data.value?.rows || []
  if (!needle) return rows
  return rows.filter((item) => `${item.title || ''} ${stripHtml(item.description)} ${item.autor || ''}`.toLowerCase().includes(needle))
})

watch(filteredRows, (rows) => {
  if (!rows.length) {
    selected.value = null
    return
  }
  if (!selected.value || !rows.some((row) => row.id === selected.value?.id)) selected.value = rows[0] || null
}, { immediate: true })

function startCreate() {
  actionError.value = ''
  editing.value = {
    sala: String(salaId),
    unidad: data.value?.sala.unidad,
    type: props.type,
    title: '',
    description: '',
    date: props.type === 'cal' ? new Date().toISOString().slice(0, 10) : null,
    starred: 0
  }
}

async function save(payload: Partial<DaycareResource>) {
  saving.value = true
  actionError.value = ''
  try {
    await $fetch('/api/daycare/admin/resources', {
      method: 'POST',
      body: { ...payload, sala: String(salaId), type: props.type }
    })
    editing.value = null
    await refresh()
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible guardar la publicación.'
  } finally {
    saving.value = false
  }
}

async function remove(id?: number) {
  if (!id || !confirm('¿Ocultar esta publicación?')) return
  actionError.value = ''
  try {
    await $fetch(`/api/daycare/admin/resources/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible ocultar la publicación.'
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
  grid-template-columns: minmax(0, 1fr) minmax(340px, 0.7fr);
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
  grid-template-columns: minmax(0, 1fr) auto;
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
  grid-template-columns: 74px minmax(0, 1fr) auto;
  padding: 10px 12px;
  text-align: left;
}

.resource-row:hover,
.resource-row.active {
  background: var(--color-brand-100);
  border-color: var(--color-brand-300);
}

.row-date {
  color: var(--color-brand-800);
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
}

.row-main {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.row-main strong,
.row-main small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-main small,
.row-meta {
  color: var(--color-muted);
  font-size: 0.82rem;
}

.preview-card {
  align-self: start;
  display: grid;
  gap: 12px;
  position: sticky;
  top: calc(var(--topbar-height) + 14px);
}

.preview-card h2 {
  font-size: 1.25rem;
  margin-bottom: 0;
}

dl {
  display: grid;
  gap: 8px;
  margin: 0;
}

dl div {
  border-top: 1px solid var(--color-border);
  display: grid;
  gap: 2px;
  padding-top: 8px;
}

dt {
  color: var(--color-muted);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

dd {
  margin: 0;
}

.preview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.loading-card {
  color: var(--color-muted);
}

@media (max-width: 1080px) {
  .module-hero,
  .resource-desk {
    grid-template-columns: 1fr;
  }

  .preview-card {
    position: static;
  }
}

@media (max-width: 640px) {
  .module-actions {
    grid-template-columns: 1fr;
  }

  .resource-row {
    align-items: start;
    grid-template-columns: 1fr;
  }

  .row-main strong,
  .row-main small {
    white-space: normal;
  }

  .section-head {
    align-items: start;
    flex-direction: column;
  }

  .preview-actions {
    display: grid;
  }
}
</style>
