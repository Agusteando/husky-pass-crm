<template>
  <form class="editor-form" data-product-panel="resource-editor" @submit.prevent="submit">
    <div class="editor-head">
      <div>
        <p class="eyebrow">{{ model.id ? 'Editar publicación' : 'Nueva publicación' }}</p>
        <h2>{{ label }}</h2>
        <p>{{ unidad || 'Guardería' }} · {{ salaName || 'Sala' }}</p>
      </div>
      <div class="actions top-actions">
        <button class="btn btn-primary" type="submit" :disabled="saving || uploading">{{ saving ? 'Guardando…' : uploading ? `Subiendo ${uploadProgress}%` : 'Guardar publicación' }}</button>
        <button class="btn btn-secondary" type="button" @click="$emit('cancel')">Cancelar</button>
      </div>
    </div>

    <div class="editor-workspace">
      <div class="editor-fields">
        <section class="editor-grid">
          <label class="label title-field">
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
        </section>

        <label class="label">
          Descripción para familias
          <textarea v-model="model.description" class="textarea description-field" data-diagnostic-field="resource-description" />
        </label>

        <section class="media-composer" :data-state="uploadState">
          <header class="composer-head">
            <div>
              <p class="eyebrow">Medio principal</p>
              <h3>{{ mediaAsset ? mediaAsset.name : 'Agregar imagen o documento' }}</h3>
            </div>
            <div v-if="mediaAsset || selectedFile" class="media-actions">
              <button class="icon-action" type="button" :disabled="uploading" @click="openFilePicker"><FamilyPersonasIcon name="replace" />Reemplazar</button>
              <button class="icon-action danger" type="button" :disabled="uploading" @click="removeMedia"><FamilyPersonasIcon name="trash" />Quitar</button>
            </div>
          </header>

          <input ref="fileInput" class="sr-only" type="file" accept="image/png,image/jpeg,image/webp,application/pdf,.doc,.docx,.xls,.xlsx,.txt" data-diagnostic-field="resource-file" @change="selectFile" />

          <button
            v-if="!mediaAsset && !selectedFile"
            class="drop-zone"
            :class="{ active: dragActive }"
            type="button"
            @click="openFilePicker"
            @dragenter.prevent="dragActive = true"
            @dragover.prevent="dragActive = true"
            @dragleave.prevent="dragActive = false"
            @drop.prevent="handleDrop"
          >
            <span><FamilyPersonasIcon name="upload" /></span>
            <strong>Seleccionar archivo</strong>
            <small>Imagen, PDF, Word, Excel o texto · 8 MB</small>
          </button>

          <div v-else class="media-summary">
            <span class="media-mark"><FamilyPersonasIcon :name="mediaIcon" /></span>
            <div>
              <strong>{{ selectedFile?.name || mediaAsset?.name }}</strong>
              <span>{{ mediaSummary }}</span>
            </div>
            <span v-if="selectedFile" class="local-chip">Vista local</span>
          </div>

          <div v-if="uploading" class="upload-progress" role="progressbar" :aria-valuenow="uploadProgress" aria-valuemin="0" aria-valuemax="100">
            <span :style="{ width: `${uploadProgress}%` }" />
          </div>
          <p v-if="uploadError" class="alert compact-alert">{{ uploadError }}</p>

          <div v-if="mediaAsset?.kind === 'image' || selectedFile?.type.startsWith('image/')" class="media-details image-details">
            <label class="label">
              Descripción accesible
              <input v-model="mediaMeta.alt" class="input" maxlength="220" />
            </label>
            <label class="label">
              Pie de imagen
              <input v-model="mediaMeta.caption" class="input" maxlength="260" />
            </label>
            <div class="focal-control">
              <div>
                <span>Punto focal</span>
                <strong>{{ Math.round(mediaMeta.focalX || 50) }} · {{ Math.round(mediaMeta.focalY || 50) }}</strong>
              </div>
              <label>
                <span>Horizontal</span>
                <input v-model.number="mediaMeta.focalX" type="range" min="0" max="100" />
              </label>
              <label>
                <span>Vertical</span>
                <input v-model.number="mediaMeta.focalY" type="range" min="0" max="100" />
              </label>
            </div>
          </div>
        </section>

        <section class="editor-footer">
          <div class="publish-panel" :class="{ hidden: !published }">
            <span>{{ published ? 'Publicada' : 'Borrador oculto' }}</span>
            <label class="switch-row">
              <input v-model="published" type="checkbox" data-diagnostic-field="resource-published" />
              <strong>{{ published ? 'Visible para familias' : 'No visible para familias' }}</strong>
            </label>
          </div>
          <label class="check-row">
            <input v-model="model.starred" type="checkbox" data-diagnostic-field="resource-starred" />
            <span><strong>Prioritaria</strong><small>Se presenta con mayor jerarquía.</small></span>
          </label>
          <div class="context-chip">
            <span>Destino</span>
            <strong>{{ unidad || 'Guardería' }} · {{ salaName || 'Sala' }}</strong>
          </div>
        </section>
      </div>

      <aside class="family-preview">
        <header>
          <div>
            <p class="eyebrow">Vista familias</p>
            <h3>Publicación</h3>
          </div>
          <span>{{ previewModeLabel }}</span>
        </header>
        <ResourceCard :resource="previewResource" :variant="cardVariant" density="comfortable" featured />
      </aside>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useDraftState } from '~/composables/useDraftState'
import type { DaycareMediaMetadata, DaycareResource } from '~/types/daycare'
import { daycareDocumentIcon, daycareMediaAsset, daycareMediaUrl, encodeDaycareMediaResource, formatDaycareMediaSize } from '~/utils/daycareMedia'

interface UploadResponse {
  url: string
  filename: string
  mime: string
  size: number
}

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
const mediaMeta = reactive<DaycareMediaMetadata>(defaultMediaMetadata())
const selectedFile = ref<File | null>(null)
const localObjectUrl = ref('')
const uploadError = ref('')
const uploading = ref(false)
const uploadProgress = ref(0)
const dragActive = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const categoryOptions: Array<{ value: ResourceType; label: string }> = [
  { value: 'hw', label: 'Tarea' },
  { value: 'news', label: 'Aviso / noticia' },
  { value: 'cal', label: 'Calendario' }
]

const published = computed({
  get: () => !isHidden(model.hidden),
  set: (value: boolean) => { model.hidden = value ? 0 : 1 }
})
const previewResourceValue = computed(() => {
  const url = localObjectUrl.value || daycareMediaUrl(model.resource)
  return url ? encodeDaycareMediaResource(url, mediaMeta) : ''
})
const mediaAsset = computed(() => daycareMediaAsset(previewResourceValue.value))
const mediaIcon = computed(() => daycareDocumentIcon(mediaAsset.value?.kind))
const mediaSummary = computed(() => {
  const asset = mediaAsset.value
  return [asset?.mime || selectedFile.value?.type, formatDaycareMediaSize(asset?.size || selectedFile.value?.size), asset?.width && asset?.height ? `${asset.width} × ${asset.height}` : ''].filter(Boolean).join(' · ')
})
const uploadState = computed(() => uploadError.value ? 'error' : uploading.value ? 'loading' : mediaAsset.value ? 'ready' : 'empty')
const cardVariant = computed(() => model.type === 'hw' ? 'homework' : model.type === 'cal' ? 'calendar' : 'notice')
const previewModeLabel = computed(() => mediaAsset.value?.kind === 'image' ? 'Imagen editorial' : mediaAsset.value ? 'Documento' : 'Solo texto')
const previewResource = computed<DaycareResource>(() => ({
  id: Number(model.id || 0) || undefined,
  title: String(model.title || (model.type === 'hw' ? 'Nueva tarea' : model.type === 'cal' ? 'Nuevo evento' : 'Nuevo aviso')),
  description: String(model.description || ''),
  date: model.date || null,
  timestamp: model.timestamp || new Date().toISOString(),
  resource: previewResourceValue.value || null,
  autor: model.autor || null,
  unidad: String(props.unidad || model.unidad || 'Guardería'),
  sala: String(props.salaId),
  type: (model.type || props.type) as ResourceType,
  starred: model.starred ? 1 : 0,
  hidden: published.value ? 0 : 1
}))
const draftSnapshot = computed(() => resourceDraftSnapshot(model, mediaMeta, selectedFile.value))
const { isDirty, resetDraft } = useDraftState(draftSnapshot)

resetDraft(resourceDraftSnapshot(props.baselineResource || props.resource, metadataFromResource(props.baselineResource?.resource || props.resource.resource)))
watch(isDirty, (dirty) => emit('dirty-change', dirty), { immediate: true })

watch([() => props.resource, () => props.baselineResource], async ([resource, baseline]) => {
  clearLocalFile()
  for (const key of Object.keys(model)) delete (model as Record<string, unknown>)[key]
  Object.assign(model, resource, { type: resource.type || props.type })
  Object.assign(mediaMeta, defaultMediaMetadata(), metadataFromResource(resource.resource))
  uploadError.value = ''
  uploadProgress.value = 0
  await nextTick()
  resetDraft(resourceDraftSnapshot(baseline || resource, metadataFromResource((baseline || resource).resource)))
}, { deep: true })

function defaultMediaMetadata(): DaycareMediaMetadata {
  return { version: 1, name: '', mime: '', size: null, width: null, height: null, alt: '', caption: '', focalX: 50, focalY: 50 }
}

function metadataFromResource(resource?: string | null): DaycareMediaMetadata {
  const asset = daycareMediaAsset(resource)
  if (!asset) return defaultMediaMetadata()
  return {
    version: 1,
    name: asset.name || '',
    mime: asset.mime || '',
    size: asset.size || null,
    width: asset.width || null,
    height: asset.height || null,
    alt: asset.alt || '',
    caption: asset.caption || '',
    focalX: asset.focalX ?? 50,
    focalY: asset.focalY ?? 50
  }
}

function resourceDraftSnapshot(resource: Partial<DaycareResource>, metadata: DaycareMediaMetadata, file?: File | null) {
  return {
    id: resource.id || null,
    title: resource.title || '',
    description: resource.description || '',
    type: resource.type || props.type,
    date: resource.date || '',
    resource: resource.resource || '',
    starred: Boolean(resource.starred),
    hidden: isHidden(resource.hidden),
    media: { ...metadata },
    selectedFile: file ? { name: file.name, size: file.size, type: file.type, lastModified: file.lastModified } : null
  }
}

function openFilePicker() {
  fileInput.value?.click()
}

function selectFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  if (file) void prepareFile(file)
  input.value = ''
}

function handleDrop(event: DragEvent) {
  dragActive.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) void prepareFile(file)
}

async function prepareFile(file: File) {
  uploadError.value = ''
  if (file.size > 8 * 1024 * 1024) {
    uploadError.value = 'El archivo excede 8 MB.'
    return
  }
  const allowed = /^(image\/(png|jpeg|webp)|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|text\/plain)$/i
  if (!allowed.test(file.type)) {
    uploadError.value = 'Tipo de archivo no permitido.'
    return
  }

  clearLocalFile()
  selectedFile.value = file
  localObjectUrl.value = URL.createObjectURL(file)
  Object.assign(mediaMeta, defaultMediaMetadata(), {
    name: file.name,
    mime: file.type,
    size: file.size,
    alt: model.title || '',
    focalX: 50,
    focalY: 50
  })
  if (file.type.startsWith('image/')) {
    const dimensions = await imageDimensions(localObjectUrl.value)
    mediaMeta.width = dimensions.width
    mediaMeta.height = dimensions.height
  }
}

function imageDimensions(src: string) {
  return new Promise<{ width: number | null; height: number | null }>((resolve) => {
    const image = new Image()
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => resolve({ width: null, height: null })
    image.src = src
  })
}

function clearLocalFile() {
  if (localObjectUrl.value) URL.revokeObjectURL(localObjectUrl.value)
  localObjectUrl.value = ''
  selectedFile.value = null
}

function removeMedia() {
  clearLocalFile()
  model.resource = null
  Object.assign(mediaMeta, defaultMediaMetadata())
  uploadError.value = ''
  uploadProgress.value = 0
}

async function uploadSelected() {
  const file = selectedFile.value
  if (!file) return true
  uploadError.value = ''
  uploading.value = true
  uploadProgress.value = 1
  try {
    const response = await uploadFileWithProgress(file)
    const metadata = {
      ...mediaMeta,
      name: response.filename || file.name,
      mime: response.mime || file.type,
      size: response.size || file.size
    }
    model.resource = encodeDaycareMediaResource(response.url, metadata)
    Object.assign(mediaMeta, metadata)
    clearLocalFile()
    uploadProgress.value = 100
    return true
  } catch (error: unknown) {
    const err = error as { message?: string }
    uploadError.value = err.message || 'No fue posible subir el archivo.'
    return false
  } finally {
    uploading.value = false
  }
}

function uploadFileWithProgress(file: File) {
  return new Promise<UploadResponse>((resolve, reject) => {
    const request = new XMLHttpRequest()
    const body = new FormData()
    body.append('sala', String(props.salaId))
    body.append('file', file)
    request.open('POST', '/api/daycare/admin/uploads')
    request.withCredentials = true
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) uploadProgress.value = Math.max(1, Math.min(99, Math.round((event.loaded / event.total) * 100)))
    }
    request.onerror = () => reject(new Error('No fue posible conectar con el servicio de carga.'))
    request.onload = () => {
      let response: any = null
      try { response = JSON.parse(request.responseText || '{}') } catch { /* noop */ }
      if (request.status >= 200 && request.status < 300 && response?.url) {
        resolve(response as UploadResponse)
        return
      }
      reject(new Error(response?.statusMessage || response?.message || 'No fue posible subir el archivo.'))
    }
    request.send(body)
  })
}

async function submit() {
  if (selectedFile.value) {
    const uploaded = await uploadSelected()
    if (!uploaded) return
  } else if (model.resource) {
    model.resource = encodeDaycareMediaResource(daycareMediaUrl(model.resource), mediaMeta)
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

onBeforeUnmount(clearLocalFile)
</script>

<style scoped>
.editor-form { display: grid; gap: 18px; }
.editor-head { align-items: end; display: flex; gap: 16px; justify-content: space-between; }
.editor-head h2,
.editor-head p,
.composer-head h3,
.family-preview h3 { margin: 0; }
.editor-head > div:first-child { display: grid; gap: 3px; }
.editor-head > div:first-child > p:not(.eyebrow) { color: #6a7864; font-weight: 700; }
.actions,
.top-actions,
.media-actions { align-items: center; display: flex; flex-wrap: wrap; gap: 8px; }
.editor-workspace { align-items: start; display: grid; gap: 18px; grid-template-columns: minmax(0, 1.12fr) minmax(340px, 0.88fr); }
.editor-fields { display: grid; gap: 14px; min-width: 0; }
.editor-grid { display: grid; gap: 12px; grid-template-columns: minmax(0, 1.35fr) minmax(150px, 0.55fr) minmax(150px, 0.55fr); }
.description-field { min-height: 112px; resize: vertical; }
.media-composer {
  background: linear-gradient(145deg, #f8fcf4, #fff);
  border: 1px solid rgba(82, 133, 52, 0.18);
  border-radius: 22px;
  display: grid;
  gap: 13px;
  padding: 15px;
}
.media-composer[data-state='error'] { border-color: #f5b7aa; }
.composer-head { align-items: center; display: flex; gap: 12px; justify-content: space-between; }
.composer-head > div:first-child { min-width: 0; }
.composer-head h3 { color: #243622; font-size: 1.08rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.icon-action {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(82, 133, 52, 0.16);
  border-radius: 11px;
  color: #496a39;
  cursor: pointer;
  display: inline-flex;
  font-size: 0.71rem;
  font-weight: 900;
  gap: 6px;
  min-height: 36px;
  padding: 0 9px;
}
.icon-action.danger { color: #a44133; }
.drop-zone {
  align-content: center;
  background: rgba(255, 255, 255, 0.78);
  border: 1.5px dashed rgba(82, 133, 52, 0.34);
  border-radius: 18px;
  color: #547544;
  cursor: pointer;
  display: grid;
  gap: 7px;
  justify-items: center;
  min-height: 190px;
  padding: 24px;
  transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
  width: 100%;
}
.drop-zone:hover,
.drop-zone.active { background: #edf7e6; border-color: #5d8f3c; transform: translateY(-1px); }
.drop-zone > span { align-items: center; background: #e7f3dd; border-radius: 18px; display: inline-flex; height: 58px; justify-content: center; width: 58px; }
.drop-zone > span :deep(.pa-icon) { height: 1.5rem; width: 1.5rem; }
.drop-zone small { color: #7a8775; }
.media-summary {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(82, 133, 52, 0.14);
  border-radius: 17px;
  display: grid;
  gap: 11px;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  padding: 11px;
}
.media-summary > div { display: grid; gap: 3px; min-width: 0; }
.media-summary strong,
.media-summary span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.media-summary > div span { color: #758170; font-size: 0.73rem; }
.media-mark { align-items: center; background: #edf7e6; border-radius: 14px; color: #5d8f3c; display: inline-flex; height: 46px; justify-content: center; width: 46px; }
.local-chip { background: #fff4d8; border-radius: 999px; color: #8a650c; font-size: 0.66rem; font-weight: 900; padding: 6px 8px; }
.upload-progress { background: #e5ece0; border-radius: 999px; height: 6px; overflow: hidden; }
.upload-progress span { background: linear-gradient(90deg, #5d8f3c, #f1af37); border-radius: inherit; display: block; height: 100%; transition: width 120ms linear; }
.media-details { display: grid; gap: 12px; }
.image-details { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.focal-control { background: #fff; border: 1px solid rgba(82, 133, 52, 0.14); border-radius: 17px; display: grid; gap: 9px; grid-column: 1 / -1; padding: 12px; }
.focal-control > div { display: flex; gap: 10px; justify-content: space-between; }
.focal-control > div span { color: #66745f; font-size: 0.74rem; font-weight: 800; }
.focal-control > div strong { color: #446d32; font-size: 0.74rem; }
.focal-control label { align-items: center; display: grid; gap: 9px; grid-template-columns: 74px minmax(0, 1fr); }
.focal-control label span { color: #7a8775; font-size: 0.7rem; }
.focal-control input { accent-color: #5d8f3c; width: 100%; }
.editor-footer { display: grid; gap: 10px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.publish-panel,
.context-chip,
.check-row { border: 1px solid rgba(82, 133, 52, 0.16); border-radius: 16px; min-height: 74px; padding: 11px; }
.publish-panel,
.context-chip { align-content: center; background: #edf7e6; display: grid; gap: 4px; }
.publish-panel.hidden { background: #f6f3ed; border-color: #e4d7c3; }
.publish-panel > span,
.context-chip > span { color: #778171; font-size: 0.65rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; }
.switch-row,
.check-row { align-items: center; display: flex; gap: 9px; }
.check-row { background: #fff; }
.check-row span { display: grid; gap: 2px; }
.check-row small { color: #7b8576; }
.family-preview {
  background: #eef4e9;
  border: 1px solid rgba(82, 133, 52, 0.15);
  border-radius: 24px;
  display: grid;
  gap: 12px;
  padding: 14px;
  position: sticky;
  top: 0;
}
.family-preview > header { align-items: center; display: flex; gap: 10px; justify-content: space-between; }
.family-preview > header > span { background: #fff; border-radius: 999px; color: #5f7555; font-size: 0.66rem; font-weight: 900; padding: 6px 9px; }
.compact-alert { margin: 0; }
.sr-only { height: 1px; margin: -1px; overflow: hidden; padding: 0; position: absolute; width: 1px; clip: rect(0, 0, 0, 0); white-space: nowrap; }

@media (max-width: 960px) {
  .editor-workspace { grid-template-columns: 1fr; }
  .family-preview { position: static; }
}
@media (max-width: 720px) {
  .editor-head,
  .composer-head { align-items: stretch; flex-direction: column; }
  .top-actions .btn { flex: 1 1 140px; }
  .editor-grid,
  .editor-footer,
  .image-details { grid-template-columns: 1fr; }
  .media-actions { width: 100%; }
  .icon-action { flex: 1; justify-content: center; }
}
</style>
