<template>
  <article class="resource-card" :class="variantClass">
    <div class="resource-meta">
      <span class="badge-date">{{ formatDate(resource.date || resource.timestamp) }}</span>
      <span v-if="resource.starred" class="starred">Prioritario</span>
    </div>
    <h3>{{ resource.title || titleFallback }}</h3>
    <p>{{ stripHtml(resource.description || resource.html) || 'Sin descripción disponible.' }}</p>
    <img
      v-if="canPreviewImage"
      v-show="imageReady"
      class="resource-image"
      :src="resource.resource || ''"
      alt="Recurso publicado"
      decoding="async"
      loading="lazy"
      @load="imageReady = true"
      @error="imageFailed = true"
    />
    <a v-if="resource.resource" class="btn btn-secondary resource-button" :href="resourceHref" target="_blank" rel="noopener">
      {{ isPdfResource(resource.resource) ? 'Abrir Documento PDF' : 'Abrir recurso' }}
    </a>
    <small v-if="resource.autor" class="muted">Publicado por: {{ resource.autor }}</small>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { DaycareResource } from '~/types/daycare'
import { formatDate, isImageResource, isPdfResource, publishedPdfViewerUrl, stripHtml } from '~/utils/daycare'

const props = defineProps<{
  resource: DaycareResource
  variant?: 'notice' | 'homework' | 'default'
  density?: 'compact' | 'comfortable'
}>()

const imageReady = ref(false)
const imageFailed = ref(false)
const resourceHref = computed(() => {
  return isPdfResource(props.resource.resource) ? publishedPdfViewerUrl(props.resource.resource) : props.resource.resource || ''
})

const canPreviewImage = computed(() => Boolean(props.resource.resource && isImageResource(props.resource.resource) && !imageFailed.value))
const variantClass = computed(() => [
  props.variant ? `variant-${props.variant}` : 'variant-default',
  `density-${props.density || 'compact'}`
])
const titleFallback = computed(() => props.variant === 'homework' ? 'Tarea' : 'Sin título')

watch(() => props.resource.resource, () => {
  imageReady.value = false
  imageFailed.value = false
}, { immediate: true })
</script>

<style scoped>
.resource-card {
  display: grid;
  gap: 10px;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
}

.variant-default {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  box-shadow: var(--shadow-soft);
  padding: 12px;
}

.variant-notice {
  border-left: 3px solid #dce4d4;
  padding-left: 16px;
  transition: border-color 0.18s ease;
}

.variant-notice.density-comfortable {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--color-border);
  border-left: 4px solid #dce4d4;
  border-radius: 18px;
  box-shadow: var(--shadow-soft);
  padding: 14px 16px;
}

.variant-notice:hover {
  border-left-color: var(--color-brand-700);
}

.variant-homework {
  background: transparent;
}

.resource-meta {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: space-between;
}

.badge-date {
  background: #eaf2e0;
  border-radius: 20px;
  color: var(--color-brand-700);
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 5px 12px;
}

.starred {
  color: #d88b00;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

h3 {
  color: var(--color-ink);
  font-size: 1.05rem;
  margin-bottom: 0;
  overflow-wrap: anywhere;
}

p {
  color: var(--color-muted);
  font-size: 0.95rem;
  margin-bottom: 0;
  overflow-wrap: anywhere;
}

.resource-image {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.82), rgba(246, 250, 241, 0.86));
  border: 1px solid rgba(223, 232, 215, 0.82);
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: block;
  margin-top: 2px;
  max-height: 220px;
  object-fit: contain;
  width: 100%;
}

.density-comfortable .resource-image {
  max-height: min(360px, 42vh);
}

.resource-button {
  justify-self: start;
  max-width: 100%;
  min-width: 0;
  overflow-wrap: anywhere;
  white-space: normal;
}

.muted {
  min-width: 0;
  overflow-wrap: anywhere;
}

@media (max-width: 560px) {
  .resource-button {
    justify-self: stretch;
  }
}
</style>
