<template>
  <section class="pa-image-upload" :data-state="uploadState">
    <div class="image-frame" :data-state="processing ? 'processing' : displayPreview ? 'ready' : 'empty'">
      <img v-if="displayPreview" :src="displayPreview" alt="Vista previa" />
      <FamilyPersonasIcon v-else name="camera" />
    </div>

    <div class="image-controls">
      <div class="image-head">
        <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
        <h3>{{ title || 'Foto' }}</h3>
        <p v-if="helperText">{{ helperText }}</p>
      </div>

      <ol class="upload-steps" aria-label="Estado de foto">
        <li :class="{ done: hasSelection, active: !hasSelection && !processing }">Seleccionar</li>
        <li :class="{ done: processedUrl, active: processing }">Preparar</li>
        <li :class="{ done: confirmed, active: processedUrl && !confirmed }">Confirmar</li>
      </ol>

      <label class="upload-drop" :class="{ busy: processing }">
        <input ref="inputRef" type="file" accept="image/png,image/jpeg,image/webp" :disabled="processing" data-diagnostic-action="subir-imagen-personas" @change="onFileChange" />
        <span>{{ processing ? 'Preparando…' : selectedName || 'Seleccionar foto' }}</span>
        <small>PNG, JPG o WEBP · 5 MB máx.</small>
      </label>

      <div class="upload-actions">
        <button v-if="processedUrl && !confirmed" class="btn btn-primary pa-primary" type="button" :disabled="processing" data-diagnostic-action="confirmar-foto-preparada" @click="confirmProcessed">{{ confirmLabel }}</button>
        <button v-if="displayPreview" class="btn btn-secondary" type="button" :disabled="processing" @click="clearSelection">Cambiar</button>
        <button v-if="allowRemove && displayPreview" class="btn btn-secondary" type="button" :disabled="processing" @click="removePhoto">Quitar</button>
      </div>

      <p v-if="error" class="alert compact-alert">{{ error }}</p>
      <p v-else-if="notice" class="notice compact-notice">{{ notice }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { normalizeVirtualAssetUrl } from '~/utils/daycare'
import { processFaceImageCached } from '~/utils/visionFace'

const props = withDefaults(defineProps<{
  initialSrc?: string | null
  personaId?: number | null
  title?: string
  eyebrow?: string
  description?: string
  allowRemove?: boolean
  confirmLabel?: string
}>(), {
  initialSrc: '',
  personaId: null,
  title: 'Foto',
  eyebrow: 'Fotografía',
  description: '',
  allowRemove: false,
  confirmLabel: 'Usar esta foto'
})

const emit = defineEmits<{
  processed: [payload: { url: string; preview: string }]
  clear: []
  error: [message: string]
  processing: [value: boolean]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const selectedName = ref('')
const localPreview = ref('')
const processedUrl = ref('')
const processing = ref(false)
const confirmed = ref(false)
const error = ref('')
const notice = ref('')

const displayPreview = computed(() => localPreview.value || normalizeVirtualAssetUrl(processedUrl.value || props.initialSrc || ''))
const helperText = computed(() => props.description || '')
const hasSelection = computed(() => Boolean(selectedName.value || displayPreview.value))
const uploadState = computed(() => {
  if (error.value) return 'error'
  if (processing.value) return 'loading'
  if (confirmed.value) return 'confirmed'
  if (processedUrl.value) return 'ready-to-confirm'
  if (displayPreview.value) return 'ready'
  return 'empty'
})

watch(() => props.initialSrc, () => {
  if (!localPreview.value) processedUrl.value = ''
})

function setProcessing(value: boolean) {
  processing.value = value
  emit('processing', value)
}

function resetPreparedState() {
  processedUrl.value = ''
  confirmed.value = false
  error.value = ''
  notice.value = ''
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('No fue posible leer el archivo.'))
    reader.readAsDataURL(file)
  })
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  selectedName.value = ''
  localPreview.value = ''
  resetPreparedState()

  if (!file) return
  selectedName.value = file.name

  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
    fail('Usa PNG, JPG o WEBP.')
    input.value = ''
    return
  }

  if (file.size > 1024 * 1024 * 5) {
    fail('La imagen excede 5 MB.')
    input.value = ''
    return
  }

  setProcessing(true)
  try {
    const dataUrl = await readFileAsDataUrl(file)
    localPreview.value = dataUrl
    const uploaded = await $fetch<{ absoluteUrl: string }>('/api/personas-autorizadas/photo-source', {
      method: 'POST',
      body: { src: dataUrl }
    })
    const processed = await processFaceImageCached(uploaded.absoluteUrl, { namespace: `upload:${props.personaId || 'student'}`, force: true })
    const stored = await $fetch<{ url: string; absoluteUrl?: string }>('/api/personas-autorizadas/faces', {
      method: 'POST',
      body: { src: processed.src, personaId: props.personaId || null }
    })
    processedUrl.value = stored.absoluteUrl || stored.url
    localPreview.value = normalizeVirtualAssetUrl(processedUrl.value)
    notice.value = 'Lista para confirmar.'
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    fail(failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible preparar la foto.')
  } finally {
    setProcessing(false)
    input.value = ''
  }
}

function confirmProcessed() {
  if (!processedUrl.value || processing.value) return
  confirmed.value = true
  notice.value = 'Foto confirmada.'
  emit('processed', { url: processedUrl.value, preview: normalizeVirtualAssetUrl(processedUrl.value) })
}

function fail(message: string) {
  error.value = message
  emit('error', message)
}

function clearSelection() {
  selectedName.value = ''
  localPreview.value = ''
  resetPreparedState()
  inputRef.value?.click()
}

function removePhoto() {
  selectedName.value = ''
  localPreview.value = ''
  resetPreparedState()
  emit('clear')
}
</script>

<style scoped>
.pa-image-upload { align-items: stretch; background: rgba(var(--pa-primary-rgb, 97, 139, 47), .07); border: 1px solid var(--pa-border, #dce7d0); border-radius: 20px; display: grid; gap: 16px; grid-template-columns: 160px minmax(0, 1fr); padding: 14px; }
.image-frame { aspect-ratio: 1; background: #fff; border: 1px solid var(--pa-border, #dce7d0); border-radius: 20px; color: var(--pa-primary, #618b2f); display: grid; overflow: hidden; place-items: center; position: relative; }
.image-frame img { height: 100%; object-fit: cover; transition: filter .24s ease, transform .24s ease; width: 100%; }
.image-frame[data-state='processing'] img { filter: saturate(.94) brightness(.98); transform: scale(1.01); }
.image-frame[data-state='processing']::after { animation: pa-upload-scan 1.45s ease-in-out infinite; background: linear-gradient(105deg, transparent 0%, rgba(255,255,255,.18) 42%, rgba(255,255,255,.48) 50%, rgba(255,255,255,.18) 58%, transparent 100%); content: ''; inset: 0; pointer-events: none; position: absolute; transform: translateX(-100%); }
@keyframes pa-upload-scan { 0% { transform: translateX(-100%); } 55%, 100% { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) { .image-frame[data-state='processing']::after { animation: none; background: rgba(255,255,255,.18); } .image-frame img { transition: none; } }
.image-frame :deep(.pa-icon) { height: 42px; width: 42px; }
.image-controls { display: grid; gap: 10px; }
.image-head h3, .image-head p { margin-bottom: 0; }
.image-head p:not(.eyebrow) { color: var(--pa-muted, #86888c); font-weight: 760; }
.upload-steps { display: grid; gap: 6px; grid-template-columns: repeat(3, minmax(0, 1fr)); list-style: none; margin: 0; padding: 0; }
.upload-steps li { background: #fff; border: 1px solid #ecece7; border-radius: 999px; color: var(--pa-muted, #86888c); font-size: .76rem; font-weight: 900; padding: 7px 9px; text-align: center; }
.upload-steps li.active, .upload-steps li.done { background: var(--pa-soft, #f3f5f0); border-color: var(--pa-border, #dce7d0); color: var(--pa-primary, #618b2f); }
.upload-drop { background: #fff; border: 1px dashed var(--pa-border, #dce7d0); border-radius: 16px; cursor: pointer; display: grid; gap: 2px; padding: 14px; }
.upload-drop.busy { cursor: progress; opacity: .82; }
.upload-drop input { height: 1px; opacity: 0; overflow: hidden; position: absolute; width: 1px; }
.upload-drop span { color: var(--pa-primary, #618b2f); font-weight: 950; }
.upload-drop small { color: var(--pa-muted, #86888c); font-weight: 760; }
.upload-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.pa-primary { background: var(--pa-primary); color: var(--pa-contrast); }
.compact-alert, .compact-notice { margin: 0; }
.compact-notice { background: #fff; border: 1px solid var(--pa-border, #dce7d0); border-radius: 14px; color: var(--pa-gray, #50535a); font-weight: 850; padding: 10px 12px; }
@media (max-width: 680px) { .pa-image-upload { grid-template-columns: 1fr; } .image-frame { max-width: 180px; } }
</style>
