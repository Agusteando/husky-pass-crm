<template>
  <section class="resource-page">
    <header class="resource-hero">
      <div>
        <p class="eyebrow">Guardería</p>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
      <aside class="resource-ambassador" aria-label="Guía digital de publicaciones">
        <FamilyPersonasAmbassador :theme="daycareTheme" variant="header" compact contained decorative />
        <span>
          <strong>{{ resourceGuideTitle }}</strong>
          <small>{{ resourceGuideMessage }}</small>
        </span>
      </aside>
      <NuxtLink class="btn btn-secondary" to="/familia/daycare">Inicio</NuxtLink>
    </header>

    <p v-if="error" class="alert">No fue posible cargar esta sección.</p>
    <div v-else-if="pending" class="card loading-card" data-product-loading>
      <span class="loading-dot" aria-hidden="true"></span>
      <span>Cargando publicaciones...</span>
    </div>

    <section v-else-if="items?.length" class="publication-workspace" :class="{ 'calendar-workspace': type === 'cal' }">
      <aside class="publication-summary">
        <div class="summary-card card">
          <p class="eyebrow">{{ summaryEyebrow }}</p>
          <h2>{{ items.length }} {{ items.length === 1 ? 'publicación' : 'publicaciones' }}</h2>
          <p>{{ summaryCopy }}</p>
          <div class="summary-meta">
            <span>Última actualización</span>
            <strong>{{ formatDate(featuredItem?.date || featuredItem?.timestamp) }}</strong>
          </div>
        </div>
        <NuxtLink class="return-card" to="/familia/daycare">
          <span>Volver al inicio</span>
          <strong>Ver resumen de hoy</strong>
        </NuxtLink>
      </aside>

      <main class="publication-reader">
        <article class="featured-publication">
          <div class="featured-copy">
            <span class="featured-kicker">{{ featuredLabel }}</span>
            <small>{{ formatDate(featuredItem?.date || featuredItem?.timestamp) }}</small>
            <h2>{{ featuredItem?.title || titleFallback }}</h2>
            <p>{{ resourceCopy(featuredItem) }}</p>
          </div>
          <a v-if="resourceUrl(featuredItem)" class="btn btn-primary" :href="resourceUrl(featuredItem)" target="_blank" rel="noopener">
            Abrir recurso
          </a>
        </article>

        <section class="feed-section">
          <header class="feed-head">
            <div>
              <p class="eyebrow">{{ remainingItems.length ? 'También publicado' : 'Publicación' }}</p>
              <h2>{{ remainingItems.length ? 'Historial reciente' : 'No hay más registros' }}</h2>
            </div>
          </header>

          <div class="resource-list" :class="{ 'calendar-list': type === 'cal' }">
            <ResourceCard
              v-for="item in remainingItems"
              :key="item.id || `${item.title}-${item.date}`"
              :resource="item"
              :variant="type === 'hw' ? 'homework' : 'notice'"
              density="comfortable"
            />
          </div>
        </section>
      </main>
    </section>

    <EmptyState v-else title="Sin publicaciones" description="No hay registros vigentes para esta sección." />
  </section>
</template>

<script setup lang="ts">
import { useFetch } from 'nuxt/app'
import { computed } from 'vue'
import type { DaycareResource } from '~/types/daycare'
import { formatDate, isPdfResource, publishedPdfViewerUrl, stripHtml } from '~/utils/daycare'
import { resolvePersonasTheme } from '~/utils/personasTheme'

const props = defineProps<{
  type: 'hw' | 'news' | 'cal'
  title: string
  description: string
}>()

const { data: items, pending, error } = useFetch<DaycareResource[]>('/api/daycare/family/resources', {
  query: { type: props.type },
  timeout: 15000
})

const daycareTheme = resolvePersonasTheme({ themeKey: 'daycare' })
const featuredItem = computed(() => items.value?.[0] || null)
const remainingItems = computed(() => items.value?.slice(1) || [])
const summaryEyebrow = computed(() => props.type === 'hw' ? 'Tareas activas' : props.type === 'cal' ? 'Agenda' : 'Comunicados')
const featuredLabel = computed(() => props.type === 'hw' ? 'Tarea principal' : props.type === 'cal' ? 'Próximo evento' : 'Aviso más reciente')
const titleFallback = computed(() => props.type === 'hw' ? 'Tarea publicada' : props.type === 'cal' ? 'Evento publicado' : 'Aviso publicado')
const resourceGuideTitle = computed(() => props.type === 'hw' ? 'Prioriza la tarea principal' : props.type === 'cal' ? 'Mira lo próximo primero' : 'Lee el aviso destacado')
const resourceGuideMessage = computed(() => {
  if (props.type === 'hw') return 'Dejo arriba lo más reciente para que no revises todo el historial.'
  if (props.type === 'cal') return 'La agenda mantiene el siguiente evento como referencia principal.'
  return 'Los comunicados nuevos quedan destacados y el resto se conserva abajo.'
})
const summaryCopy = computed(() => {
  if (!items.value?.length) return 'No hay publicaciones vigentes.'
  if (props.type === 'hw') return 'Empieza por la tarea principal y consulta el historial para no perder recursos adjuntos.'
  if (props.type === 'cal') return 'El evento más próximo queda arriba; el resto permanece ordenado para consulta rápida.'
  return 'El comunicado más reciente queda destacado. Abre cada recurso para revisar el material completo.'
})

function resourceUrl(resource?: DaycareResource | null) {
  if (!resource?.resource) return ''
  return isPdfResource(resource.resource) ? publishedPdfViewerUrl(resource.resource) : resource.resource
}

function resourceCopy(resource?: DaycareResource | null) {
  return stripHtml(resource?.description || resource?.html) || 'Abre el recurso para consultar el contenido completo.'
}
</script>

<style scoped>
.resource-page {
  display: grid;
  gap: 14px;
}

.resource-hero {
  align-items: center;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, .98), rgba(242, 248, 234, .95));
  border: 1px solid var(--color-border);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 270px) auto;
  padding: clamp(18px, 2.4vw, 26px);
}

.resource-hero h1,
.resource-hero p {
  margin-bottom: 0;
}

.resource-hero h1 {
  font-size: clamp(2rem, 3.2vw, 3rem);
}

.resource-ambassador {
  align-items: center;
  background: #fff;
  border: 1px solid var(--color-brand-200);
  border-radius: 18px;
  box-shadow: var(--shadow-line);
  display: grid;
  gap: 9px;
  grid-template-columns: 54px minmax(0, 1fr);
  padding: 8px 12px 8px 8px;
}

.resource-ambassador :deep(.pa-ambassador-card),
.resource-ambassador :deep(.pa-ambassador-visual) {
  height: 54px;
  width: 54px;
}

.resource-ambassador span {
  display: grid;
  gap: 2px;
}

.resource-ambassador strong {
  color: var(--color-ink);
  font-size: .82rem;
}

.resource-ambassador small {
  color: var(--color-muted);
  font-size: .72rem;
  font-weight: 650;
  line-height: 1.35;
}

.publication-workspace {
  align-items: start;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(230px, 300px) minmax(0, 1fr);
  min-width: 0;
}

.publication-summary {
  display: grid;
  gap: 12px;
  position: sticky;
  top: calc(var(--topbar-height) + 12px);
}

.summary-card {
  border-radius: 22px;
  display: grid;
  gap: 12px;
}

.summary-card h2 {
  font-size: clamp(1.7rem, 2.3vw, 2.15rem);
  line-height: 1;
  margin-bottom: 0;
}

.summary-meta {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 16px;
  display: grid;
  gap: 4px;
  padding: 12px;
}

.summary-meta span {
  color: var(--color-muted);
  font-size: .72rem;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.summary-meta strong {
  color: var(--color-brand-800);
  font-size: .92rem;
}

.return-card {
  background: linear-gradient(135deg, #315f24, #6f971a);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  color: #fff;
  display: grid;
  gap: 4px;
  padding: 16px;
}

.return-card span {
  color: rgba(255, 255, 255, .76);
  font-size: .78rem;
}

.publication-reader {
  display: grid;
  gap: 14px;
  min-width: 0;
}

.featured-publication {
  align-items: end;
  background:
    radial-gradient(circle at 92% 10%, rgba(255, 181, 69, .22), transparent 34%),
    linear-gradient(135deg, #ffffff 0%, #fbfff7 100%);
  border: 1px solid var(--color-brand-200);
  border-radius: 26px;
  box-shadow: var(--shadow-card);
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) auto;
  min-height: 230px;
  padding: clamp(18px, 2.8vw, 30px);
}

.featured-copy {
  display: grid;
  gap: 10px;
  max-width: 760px;
}

.featured-kicker {
  color: var(--color-amber);
  font-size: .76rem;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.featured-copy small {
  background: var(--color-brand-100);
  border-radius: 999px;
  color: var(--color-brand-700);
  justify-self: start;
  padding: 5px 10px;
}

.featured-copy h2 {
  font-size: clamp(1.75rem, 3vw, 2.65rem);
  line-height: 1;
  margin-bottom: 0;
}

.featured-copy p {
  font-size: 1rem;
  max-width: 640px;
}

.featured-publication .btn {
  justify-self: end;
}

.feed-section {
  display: grid;
  gap: 12px;
}

.feed-head {
  align-items: end;
  display: flex;
  justify-content: space-between;
}

.feed-head h2 {
  color: var(--color-brand-800);
  font-size: 1.35rem;
  margin-bottom: 0;
}

.resource-list {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.calendar-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.loading-card {
  align-items: center;
  color: var(--color-muted);
  display: inline-flex;
  gap: 9px;
}

.loading-dot {
  animation: pulse 1s ease-in-out infinite;
  background: var(--color-brand-700);
  border-radius: 999px;
  height: 10px;
  width: 10px;
}

@keyframes pulse {
  0%, 100% { opacity: 0.35; transform: scale(0.82); }
  50% { opacity: 1; transform: scale(1); }
}

@media (max-width: 1100px) {
  .publication-workspace {
    grid-template-columns: 1fr;
  }

  .publication-summary {
    position: static;
  }
}

@media (max-width: 760px) {
  .resource-hero,
  .featured-publication {
    grid-template-columns: 1fr;
  }

  .resource-hero {
    align-items: stretch;
  }

  .featured-publication .btn {
    justify-self: stretch;
  }

  .publication-reader {
    order: 1;
  }

  .publication-summary {
    order: 2;
  }

  .calendar-list {
    grid-template-columns: 1fr;
  }
}
</style>
