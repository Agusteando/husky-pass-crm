<template>
  <span class="processed-photo" :class="{ empty: !displaySrc }" :data-state="state">
    <img v-if="displaySrc" :src="displaySrc" :alt="alt" :loading="loading" :decoding="decoding" />
    <slot v-else>{{ fallback }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { normalizeVirtualAssetUrl } from '~/utils/daycare'
import { getCachedProcessedFaceImage, processFaceImageCached, toVisionImageUrl } from '~/utils/visionFace'

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

async function resolveDisplay() {
  const preferred = processedUrl.value
  const original = originalUrl.value
  failed.value = false

  if (preferred) {
    displaySrc.value = preferred
    return
  }

  if (!original) {
    displaySrc.value = ''
    return
  }

  const visionUrl = toVisionImageUrl(original)
  const cached = getCachedProcessedFaceImage(visionUrl, props.namespace)
  if (cached) {
    displaySrc.value = cached
    return
  }

  displaySrc.value = original
  if (!props.autoProcess || !/^https?:\/\//i.test(visionUrl)) return

  processing.value = true
  try {
    const result = await processFaceImageCached(visionUrl, { namespace: props.namespace })
    displaySrc.value = result.src
  } catch {
    failed.value = true
    displaySrc.value = original
  } finally {
    processing.value = false
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
.processed-photo { display: block; height: 100%; overflow: hidden; width: 100%; }
.processed-photo img { display: block; height: 100%; object-fit: cover; width: 100%; }
.processed-photo.empty { align-items: center; display: grid; place-items: center; }
</style>
