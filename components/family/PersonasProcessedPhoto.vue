<template>
  <span class="processed-photo" :class="{ empty: !displaySrc }" :data-state="state" :aria-busy="processing ? 'true' : 'false'">
    <img v-if="displaySrc" :src="displaySrc" :alt="alt" :loading="loading" :decoding="decoding" />
    <slot v-else>{{ fallback }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { normalizeVirtualAssetUrl } from '~/utils/daycare'
import { canProcessWithVision, getCachedProcessedFaceImage, processFaceImageCached, toVisionImageUrl } from '~/utils/visionFace'

const props = withDefaults(defineProps<{
  src?: string | null
  processedSrc?: string | null
  alt?: string
  fallback?: string
  namespace?: string
  autoProcess?: boolean
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'sync' | 'auto'
}>(), {
  src: '',
  processedSrc: '',
  alt: '',
  fallback: '',
  namespace: 'personas-photo',
  autoProcess: true,
  loading: 'lazy',
  decoding: 'async'
})

const displaySrc = ref(normalizeVirtualAssetUrl(props.processedSrc || props.src || ''))
const processing = ref(false)
const failed = ref(false)
const state = computed(() => {
  if (!displaySrc.value) return 'empty'
  if (processing.value) return 'processing'
  if (failed.value) return 'fallback'
  return 'ready'
})

const originalUrl = computed(() => normalizeVirtualAssetUrl(props.src || ''))
const processedUrl = computed(() => normalizeVirtualAssetUrl(props.processedSrc || ''))
let requestIndex = 0

async function resolveDisplay() {
  const currentRequest = requestIndex + 1
  requestIndex = currentRequest
  const preferred = processedUrl.value
  const original = originalUrl.value
  failed.value = false
  processing.value = false

  if (preferred) {
    displaySrc.value = preferred
    return
  }

  if (!original) {
    displaySrc.value = ''
    return
  }

  displaySrc.value = original
  const visionUrl = toVisionImageUrl(original)
  if (!props.autoProcess || !canProcessWithVision(visionUrl)) return

  const cached = getCachedProcessedFaceImage(visionUrl, props.namespace)
  if (cached) {
    displaySrc.value = cached
    return
  }

  processing.value = true
  try {
    const result = await processFaceImageCached(visionUrl, { namespace: props.namespace })
    if (requestIndex === currentRequest) displaySrc.value = result.src
  } catch {
    if (requestIndex === currentRequest) {
      failed.value = true
      displaySrc.value = original
    }
  } finally {
    if (requestIndex === currentRequest) processing.value = false
  }
}

watch(() => [props.src, props.processedSrc, props.namespace, props.autoProcess], () => {
  void resolveDisplay()
})

onMounted(() => {
  void resolveDisplay()
})
</script>

<style scoped>
.processed-photo { background: #f2f2ef; display: block; height: 100%; overflow: hidden; position: relative; width: 100%; }
.processed-photo img { display: block; height: 100%; object-fit: cover; transition: filter .24s ease, opacity .24s ease, transform .24s ease; width: 100%; }
.processed-photo.empty { align-items: center; display: grid; place-items: center; }
.processed-photo[data-state='processing'] img { filter: saturate(.94) brightness(.98); transform: scale(1.01); }
.processed-photo[data-state='processing']::after { animation: pa-photo-scan 1.45s ease-in-out infinite; background: linear-gradient(105deg, transparent 0%, rgba(255,255,255,.18) 42%, rgba(255,255,255,.48) 50%, rgba(255,255,255,.18) 58%, transparent 100%); content: ''; inset: 0; pointer-events: none; position: absolute; transform: translateX(-100%); }
@media (prefers-reduced-motion: reduce) { .processed-photo[data-state='processing']::after { animation: none; background: rgba(255,255,255,.18); } .processed-photo img { transition: none; } }
@keyframes pa-photo-scan { 0% { transform: translateX(-100%); } 55%, 100% { transform: translateX(100%); } }
</style>
