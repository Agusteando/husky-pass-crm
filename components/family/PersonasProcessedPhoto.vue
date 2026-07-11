<template>
  <span
    class="processed-photo"
    :class="{ empty: !displaySrc }"
    :data-state="displaySrc ? 'ready' : 'empty'"
  >
    <img v-if="displaySrc" :src="displaySrc" :alt="alt" :loading="loading" :decoding="decoding" />
    <slot v-else>{{ fallback }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { normalizeVirtualAssetUrl } from '~/utils/daycare'
import { isValidatedVisionPhotoUrl } from '~/utils/visionFace'

const props = withDefaults(defineProps<{
  src?: string | null
  processedSrc?: string | null
  alt?: string
  fallback?: string
  namespace?: string
  autoProcess?: boolean
  trustStoredProcessed?: boolean
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'sync' | 'auto'
}>(), {
  src: '',
  processedSrc: '',
  alt: '',
  fallback: '',
  namespace: 'personas-photo',
  autoProcess: false,
  trustStoredProcessed: false,
  loading: 'lazy',
  decoding: 'async'
})

const displaySrc = computed(() => {
  const original = normalizeVirtualAssetUrl(props.src || '')
  if (original) return original

  const processed = normalizeVirtualAssetUrl(props.processedSrc || '')
  return props.trustStoredProcessed || isValidatedVisionPhotoUrl(processed) ? processed : ''
})
</script>

<style scoped>
.processed-photo {
  background:
    radial-gradient(circle at 34% 18%, rgba(255,255,255,.92), transparent 34%),
    linear-gradient(145deg, rgba(var(--pa-primary-rgb, 97, 139, 47), .18), #fff 68%);
  box-shadow: inset 0 -18px 36px rgba(0,0,0,.05);
  display: block;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
}
.processed-photo::before {
  background: linear-gradient(180deg, rgba(255,255,255,.24), transparent 56%);
  content: '';
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: 1;
}
.processed-photo img { display: block; height: 100%; object-fit: cover; position: relative; transition: filter .24s ease, opacity .24s ease, transform .24s ease; width: 100%; z-index: 0; }
.processed-photo.empty { align-items: center; display: grid; place-items: center; }
@media (prefers-reduced-motion: reduce) { .processed-photo img { transition: none; } }
</style>
