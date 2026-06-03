<template>
  <article class="resource-card" :class="variantClass">
    <div class="resource-meta">
      <span class="badge-date">{{ formatDate(resource.date || resource.timestamp) }}</span>
      <span v-if="resource.starred" class="starred">Prioritario</span>
    </div>
    <h3>{{ resource.title || titleFallback }}</h3>
    <p>{{ stripHtml(resource.description || resource.html) || 'Sin descripción disponible.' }}</p>
    <img v-if="isImageResource(resource.resource)" :src="resource.resource || ''" alt="Recurso publicado" />
    <a v-if="resource.resource" class="btn btn-secondary resource-button" :href="resourceHref" target="_blank" rel="noopener">
      {{ isPdfResource(resource.resource) ? 'Abrir Documento PDF' : 'Abrir recurso' }}
    </a>
    <small v-if="resource.autor" class="muted">Publicado por: {{ resource.autor }}</small>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DaycareResource } from '~/types/daycare'
import { formatDate, isImageResource, isPdfResource, publishedPdfViewerUrl, stripHtml } from '~/utils/daycare'

const props = defineProps<{
  resource: DaycareResource
  variant?: 'notice' | 'homework' | 'default'
}>()

const resourceHref = computed(() => {
  return isPdfResource(props.resource.resource) ? publishedPdfViewerUrl(props.resource.resource) : props.resource.resource || ''
})

const variantClass = computed(() => props.variant ? `variant-${props.variant}` : 'variant-default')
const titleFallback = computed(() => props.variant === 'homework' ? 'Tarea' : 'Sin título')
</script>

<style scoped>
.resource-card {
  display: grid;
  gap: 10px;
}

.variant-default {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  box-shadow: var(--shadow-soft);
  padding: 16px;
}

.variant-notice {
  border-left: 3px solid #dce4d4;
  padding-left: 16px;
  transition: border-color 0.18s ease;
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
  font-weight: 850;
  padding: 5px 12px;
}

.starred {
  color: #d88b00;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

h3 {
  color: #585858;
  font-size: 1.05rem;
  margin-bottom: 0;
}

p {
  color: #606060;
  font-size: 0.95rem;
  margin-bottom: 0;
}

img {
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: block;
  margin-top: 2px;
  max-height: 280px;
  object-fit: cover;
  width: 100%;
}

.resource-button {
  justify-self: start;
}

@media (max-width: 560px) {
  .resource-button {
    justify-self: stretch;
  }
}
</style>
