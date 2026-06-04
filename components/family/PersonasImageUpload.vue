<template>
  <section class="pa-image-upload" :data-state="uploadState">
    <div class="image-frame">
      <img v-if="displayPreview" :src="displayPreview" alt="Vista previa" />
      <FamilyPersonasIcon v-else name="camera" />
    </div>

    <div class="image-controls">
      <div>
        <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
        <h3>{{ title || 'Foto' }}</h3>
        <p v-if="helperText">{{ helperText }}</p>
      </div>

      <label class="upload-drop" :class="{ busy: processing }">
        <input ref="inputRef" type="file" accept="image/png,image/jpeg,image/webp" :disabled="processing" data-diagnostic-action="subir-imagen-personas" @change="onFileChange" />
        <span>{{ processing ? 'Preparando…' : selectedName || 'Seleccionar foto' }}</span>
        <small>PNG, JPG o WEBP · 5 MB máx.</small>
      </label>

      <div class="upload-actions">
        <button v-if="processedUrl" class="btn btn-primary pa-primary" type="button" :disabled="processing" data-diagnostic-action="confirmar-foto-procesada" @click="confirmProcessed">Usar esta foto</button>
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
import { processFaceImage } from '~/utils/visionFace'

const props = withDefaults(defineProps<{
  initialSrc?: string | null
  personaId?: number | null
  title?: string
  eyebrow?: string
  description?: string
  allowRemove?: boolean
}>(), {
  initialSrc: '',
  personaId: null,
  title: 'Foto',
  eyebrow: 'Fotografía',
  description: '',
  allowRemove: false
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
const error = ref('')
const notice = ref('')

const displayPreview = computed(() => localPreview.value || normalizeVirtualAssetUrl(processedUrl.value || props.initialSrc || ''))
const helperText = computed(() => props.description || '')
const uploadState = computed(() => {
  if (error.value) return 'error'
  if (processing.value) return 'loading'
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
  error.value = ''
  notice.value = ''
  selectedName.value = ''
  localPreview.value = ''
  processedUrl.value = ''

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
    const processed = await processFaceImage(normalizeVirtualAssetUrl(uploaded.absoluteUrl))
    const stored = await $fetch<{ url: string }>('/api/personas-autorizadas/faces', {
      method: 'POST',
      body: { src: processed.src, personaId: props.personaId || null }
    })
    processedUrl.value = stored.url
    localPreview.value = normalizeVirtualAssetUrl(stored.url)
    notice.value = 'Lista para usar.'
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    fail(failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible cargar la foto.')
  } finally {
    setProcessing(false)
    input.value = ''
  }
}

function confirmProcessed() {
  if (!processedUrl.value || processing.value) return
  notice.value = 'Foto seleccionada.'
  emit('processed', { url: processedUrl.value, preview: normalizeVirtualAssetUrl(processedUrl.value) })
}

function fail(message: string) {
  error.value = message
  emit('error', message)
}

function clearSelection() {
  selectedName.value = ''
  localPreview.value = ''
  processedUrl.value = ''
  error.value = ''
  notice.value = ''
  inputRef.value?.click()
}

function removePhoto() {
  selectedName.value = ''
  localPreview.value = ''
  processedUrl.value = ''
  error.value = ''
  notice.value = ''
  emit('clear')
}
</script>

<style scoped>
.pa-image-upload {
  align-items: stretch;
  background: rgba(var(--pa-primary-rgb, 97, 139, 47), 0.07);
  border: 1px solid var(--pa-border, #dce7d0);
  border-radius: 20px;
  display: grid;
  gap: 16px;
  grid-template-columns: 150px minmax(0, 1fr);
  padding: 14px;
}

.image-frame {
  aspect-ratio: 1;
  background: #fff;
  border: 1px solid var(--pa-border, #dce7d0);
  border-radius: 20px;
  color: var(--pa-primary, #618b2f);
  display: grid;
  overflow: hidden;
  place-items: center;
}

.image-frame img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.image-frame :deep(.pa-icon) {
  height: 42px;
  width: 42px;
}

.image-controls {
  display: grid;
  gap: 10px;
}

.image-controls h3,
.image-controls p {
  margin-bottom: 0;
}

.image-controls p:not(.eyebrow) {
  color: var(--pa-muted, #86888c);
  font-weight: 760;
}

.upload-drop {
  background: #fff;
  border: 1px dashed var(--pa-border, #dce7d0);
  border-radius: 16px;
  cursor: pointer;
  display: grid;
  gap: 2px;
  padding: 14px;
}

.upload-drop.busy {
  cursor: progress;
  opacity: 0.82;
}

.upload-drop input {
  height: 1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  width: 1px;
}

.upload-drop span {
  color: var(--pa-primary, #618b2f);
  font-weight: 950;
}

.upload-drop small {
  color: var(--pa-muted, #86888c);
  font-weight: 760;
}

.upload-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pa-primary { background: var(--pa-primary); color: var(--pa-contrast); }

.compact-alert,
.compact-notice {
  margin: 0;
}

.compact-notice {
  background: #fff;
  border: 1px solid var(--pa-border, #dce7d0);
  border-radius: 14px;
  color: var(--pa-gray, #50535a);
  font-weight: 850;
  padding: 10px 12px;
}

@media (max-width: 680px) {
  .pa-image-upload {
    grid-template-columns: 1fr;
  }

  .image-frame {
    max-width: 180px;
  }
}
</style>
