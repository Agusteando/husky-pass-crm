<template>
  <article class="resource-card">
    <div class="resource-meta">
      <span class="badge">{{ formatDate(resource.date || resource.timestamp) }}</span>
      <span v-if="resource.starred" class="starred">Prioritario</span>
    </div>
    <h3>{{ resource.title || 'Sin título' }}</h3>
    <p>{{ stripHtml(resource.description || resource.html) || 'Sin descripción disponible.' }}</p>
    <img v-if="isImageResource(resource.resource)" :src="resource.resource || ''" alt="Recurso publicado" />
    <a v-if="resource.resource" class="btn btn-secondary" :href="resourceHref" target="_blank" rel="noopener">
      {{ isPdfResource(resource.resource) ? 'Abrir documento PDF' : 'Abrir recurso' }}
    </a>
    <small v-if="resource.autor" class="muted">Publicado por {{ resource.autor }}</small>
  </article>
</template>

<script setup lang="ts">
import type { DaycareResource } from '~/types/daycare'
import { formatDate, isImageResource, isPdfResource, legacyPdfViewerUrl, stripHtml } from '~/utils/daycare'

const props = defineProps<{ resource: DaycareResource }>()

const resourceHref = computed(() => {
  return isPdfResource(props.resource.resource) ? legacyPdfViewerUrl(props.resource.resource) : props.resource.resource || ''
})
</script>

<style scoped>
.resource-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 14px;
  padding: 22px;
}

.resource-card h3 {
  margin: 0;
}

.resource-meta {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.starred {
  color: #b4473f;
  font-weight: 900;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

img {
  width: 100%;
  max-height: 280px;
  object-fit: cover;
  border-radius: 18px;
  border: 1px solid var(--color-border);
}

small {
  font-weight: 700;
}
</style>
