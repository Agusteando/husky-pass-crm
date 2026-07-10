<template>
  <form class="editor-form" data-product-panel="resource-editor" @submit.prevent="submit">
    <div class="editor-head">
      <div>
        <p class="eyebrow">{{ model.id ? 'Editar publicación' : 'Nueva publicación' }}</p>
        <h2>{{ label }}</h2>
        <p>{{ unidad || 'Guardería' }} / {{ salaName || `Sala ${salaId}` }}</p>
      </div>
      <div class="actions top-actions">
        <button class="btn btn-primary" type="submit" :disabled="saving || uploading">{{ saving ? 'Guardando...' : uploading ? 'Subiendo...' : 'Guardar' }}</button>
        <button class="btn btn-secondary" type="button" @click="$emit('cancel')">Cancelar</button>
      </div>
    </div>

    <section class="editor-grid">
      <label class="label">
        Título
        <input v-model="model.title" class="input" required data-diagnostic-field="resource-title" />
      </label>

      <label class="label">
        Categoría
        <select v-model="model.type" class="select" :disabled="Boolean(model.id)" data-diagnostic-field="resource-type">
          <option v-for="option in categoryOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </label>

      <label class="label">
        Fecha visible
        <input v-model="model.date" class="input" type="date" :required="model.type === 'cal'" data-diagnostic-field="resource-date" />
      </label>

      <div class="publish-panel" :class="{ hidden: !published }">
        <span>{{ published ? 'Publicado' : 'Borrador oculto' }}</span>
        <strong>{{ published ? 'Visible para familias' : 'No aparece en la app familiar' }}</strong>
        <label class="switch-row">
          <input v-model="published" type="checkbox" data-diagnostic-field="resource-published" />
          <span>{{ published ? 'Publicar activo' : 'Publicar después' }}</span>
        </label>
      </div>
    </section>

    <label class="label">
      Descripción para familias
      <textarea v-model="model.description" class="textarea" placeholder="Mensaje breve, instrucciones o detalle del recurso." data-diagnostic-field="resource-description" />
    </label>

    <section class="resource-attachment">
      <div class="attachment-head">
        <div>
          <p class="eyebrow">Recurso para familias</p>
          <h3>Archivo adjunto</h3>
        </div>
        <span class="mode-pill">Carga directa</span>
      </div>

      <div class="upload-panel" data-product-panel="resource-upload" :data-state="uploadState">
        <input ref="fileInput" class="file-input" type="file" accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt" data-diagnostic-field="resource-file" @change="selectFile" />
        <div class="upload-copy">
          <strong>{{ selectedFileName || uploadedFileName || 'Selecciona un archivo' }}</strong>
          <span>{{ selectedFile ? formatBytes(selectedFile.size) : model.resource ? 'Archivo listo para familias' : 'PDF, imagen o documento hasta 8 MB' }}</span>
        </div>
        <button class="btn btn-secondary" type="button" :disabled="!selectedFile || uploading" data-diagnostic-action="subir-recurso" @click="uploadSelected">
          {{ uploading ? 'Subiendo...' : model.resource && !selectedFile ? 'Archivo listo' : 'Subir archivo' }}
        </button>
      </div>

      <p v-if="externalResource" class="resource-ready muted-resource">
        <span>Recurso existente</span>
        <a :href="resourceHref" target="_blank" rel="noopener">Abrir</a>
      </p>
      <p v-if="uploadError" class="alert compact-alert">{{ uploadError }}</p>
      <p v-else-if="model.resource && !externalResource" class="resource-ready">
        <span>Listo</span>
        <a :href="resourceHref" target="_blank" rel="noopener">Abrir archivo</a>
      </p>
    </section>

    <section class="editor-footer">
      <label class="check-row">
        <input v-model="model.starred" type="checkbox" data-diagnostic-field="resource-starred" />
        <span>
          <strong>Prioritario</strong>
          <small>Se destaca en la vista familiar.</small>
        </span>
      </label>
      <div class="context-chip">
        <span>Destino</span>
        <strong>{{ unidad || 'Guardería' }} / {{ salaName || `Sala ${salaId}` }}</strong>
      </div>
    </section>
  </form>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useDraftState } from '~/composables/useDraftState'
import type { DaycareResource } from '~/types/daycare'
import { isPdfResource, publishedPdfViewerUrl } from '~/utils/daycare'

type ResourceType = 'hw' | 'news' | 'cal'

const props = defineProps<{
  resource: Partial<DaycareResource>
  baselineResource?: Partial<DaycareResource>
  label: string
  type: ResourceType
  salaId: number
  salaName?: string | null
  unidad?: string | null
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [payload: Partial<DaycareResource>]
  cancel: []
  'dirty-change': [dirty: boolean]
}>()

const model = reactive<Partial<DaycareResource>>({ ...props.resource, type: props.resource.type || props.type })
const selectedFile = ref<File | null>(null)
const selectedFileName = ref('')
const uploadedFileName = ref('')
const uploadError = ref('')
const uploading = ref(false)

const categoryOptions: Array<{ value: ResourceType; label: string }> = [
  { value: 'hw', label: 'Tarea' },
  { value: 'news', label: 'Aviso / noticia' },
  { value: 'cal', label: 'Calendario' }
]

const published = computed({
  get: () => !isHidden(model.hidden),
  set: (value: boolean) => {
    model.hidden = value ? 0 : 1
  }
})

const resourceHref = computed(() => isPdfResource(model.resource) ? publishedPdfViewerUrl(model.resource) : model.resource || '')
const externalResource = computed(() => Boolean(model.resource && /^https?:\/\//i.test(String(model.resource))))
const uploadState = computed(() => {
  if (uploadError.value) return 'error'
  if (uploading.value) return 'loading'
  if (model.resource) return 'ready'
  return selectedFile.value ? 'selected' : 'empty'
})
const draftSnapshot = computed(() => resourceDraftSnapshot(model, selectedFile.value))
const { isDirty, resetDraft } = useDraftState(draftSnapshot)

resetDraft(resourceDraftSnapshot(props.baselineResource || props.resource))
watch(isDirty, (dirty) => emit('dirty-change', dirty), { immediate: true })

watch([() => props.resource, () => props.baselineResource], async ([resource, baseline]) => {
  for (const key of Object.keys(model)) delete (model as Record<string, unknown>)[key]
  Object.assign(model, resource, { type: resource.type || props.type })
  selectedFile.value = null
  selectedFileName.value = ''
  uploadedFileName.value = resource.resource ? String(resource.resource).split('/').pop() || '' : ''
  uploadError.value = ''
  await nextTick()
  resetDraft(resourceDraftSnapshot(baseline || resource))
}, { deep: true })


function resourceDraftSnapshot(resource: Partial<DaycareResource>, file?: File | null) {
  return {
    id: resource.id || null,
    title: resource.title || '',
    description: resource.description || '',
    type: resource.type || props.type,
    date: resource.date || '',
    resource: resource.resource || '',
    starred: Boolean(resource.starred),
    hidden: isHidden(resource.hidden),
    selectedFile: file ? {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    } : null
  }
}

function selectFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  selectedFile.value = file
  selectedFileName.value = file?.name || ''
  uploadError.value = ''
}

async function uploadSelected() {
  if (!selectedFile.value) return false
  uploadError.value = ''
  uploading.value = true
  try {
    const body = new FormData()
    body.append('sala', String(props.salaId))
    body.append('file', selectedFile.value)
    const response = await $fetch<{ url: string; filename: string }>('/api/daycare/admin/uploads', { method: 'POST', body })
    model.resource = response.url
    uploadedFileName.value = response.filename || selectedFile.value.name
    selectedFile.value = null
    selectedFileName.value = ''
    return true
  } catch (err: unknown) {
    const error = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    uploadError.value = error?.data?.statusMessage || error?.statusMessage || error?.message || 'No fue posible subir el archivo.'
    return false
  } finally {
    uploading.value = false
  }
}

async function submit() {
  if (selectedFile.value) {
    const ok = await uploadSelected()
    if (!ok) return
  }

  emit('save', {
    ...model,
    sala: String(props.salaId),
    type: model.type || props.type,
    starred: model.starred ? 1 : 0,
    hidden: published.value ? 0 : 1
  })
}

function isHidden(value: unknown) {
  return value === true || value === 1 || String(value) === '1'
}

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}
</script>

<style scoped>
.editor-form {
  display: grid;
  gap: 12px;
}

.editor-head {
  align-items: end;
  display: flex;
  gap: 14px;
  justify-content: space-between;
}

.editor-head h2,
.editor-head p,
.attachment-head h3 {
  margin-bottom: 0;
}

.actions,
.top-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.editor-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(170px, 0.4fr) minmax(170px, 0.4fr) minmax(220px, 0.54fr);
}

.publish-panel,
.context-chip,
.check-row,
.upload-panel,
.resource-ready {
  border: 1px solid var(--color-brand-200);
  border-radius: 16px;
}

.publish-panel {
  align-self: end;
  background: var(--color-brand-100);
  display: grid;
  gap: 5px;
  min-height: 68px;
  padding: 10px 12px;
}

.publish-panel.hidden {
  background: #f7f4ee;
  border-color: #e8d9bd;
}

.publish-panel span,
.context-chip span,
.resource-ready span {
  color: var(--color-muted);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.switch-row,
.check-row {
  align-items: center;
  display: flex;
  gap: 9px;
}

.switch-row {
  color: var(--color-muted);
  font-size: 0.82rem;
  font-weight: 600;
}

.resource-attachment {
  background: linear-gradient(180deg, #fbfdf8, #fff);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  display: grid;
  gap: 12px;
  padding: 14px;
}

.attachment-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.segmented,
.mode-pill {
  background: #eef4e7;
  border: 1px solid var(--color-brand-200);
  border-radius: 999px;
  display: inline-flex;
  gap: 3px;
  padding: 3px;
}

.segmented button {
  background: transparent;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  min-height: 32px;
  padding: 0 12px;
}

.segmented button.active {
  background: #fff;
  color: var(--color-brand-800);
  box-shadow: var(--shadow-line);
}

.upload-panel {
  align-items: center;
  background: #fff;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  padding: 12px;
}

.upload-panel[data-state='ready'] {
  background: var(--color-brand-100);
}

.upload-panel[data-state='error'] {
  background: #fff3f0;
  border-color: #ffd2ca;
}

.file-input {
  min-width: 0;
}

.upload-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.upload-copy strong,
.upload-copy span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-copy span {
  color: var(--color-muted);
  font-size: 0.82rem;
}

.resource-ready {
  align-items: center;
  background: var(--color-brand-100);
  display: flex;
  gap: 10px;
  justify-content: space-between;
  padding: 9px 11px;
}

.resource-ready a {
  color: var(--color-brand-800);
  font-weight: 600;
}

.compact-alert {
  margin: 0;
}

.editor-footer {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(220px, auto);
}

.check-row {
  background: #fff;
  padding: 12px;
}

.check-row span {
  display: grid;
  gap: 2px;
}

.check-row small {
  color: var(--color-muted);
}

.context-chip {
  align-content: center;
  background: var(--color-brand-100);
  display: grid;
  gap: 2px;
  padding: 10px 12px;
}

@media (max-width: 1060px) {
  .editor-grid,
  .upload-panel,
  .editor-footer {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .editor-head,
  .attachment-head {
    align-items: start;
    flex-direction: column;
  }

  .top-actions,
  .segmented,
.mode-pill {
    width: 100%;
  }

  .top-actions .btn,
  .segmented button {
    flex: 1 1 140px;
  }
}
</style>
