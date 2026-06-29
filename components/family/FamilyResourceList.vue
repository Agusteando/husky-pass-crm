<template>
  <section class="resource-page">
    <header class="resource-hero">
      <div class="resource-hero-copy">
        <p class="eyebrow">Guardería</p>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
      <div class="resource-hero-ambassador" aria-hidden="true">
        <FamilyPersonasAmbassador :theme="resourceTheme" :variant="resourceVariant" contained decorative />
      </div>
      <NuxtLink class="btn btn-secondary" to="/familia/daycare">Inicio</NuxtLink>
    </header>

    <p v-if="error" class="alert">No fue posible cargar esta sección.</p>
    <div v-else-if="pending" class="card loading-card" data-product-loading>
      <span class="loading-dot" aria-hidden="true"></span>
      <span>Cargando publicaciones...</span>
    </div>

    <section v-else-if="items?.length" class="publication-workspace" :class="{ 'calendar-workspace': type === 'cal' }">
      <aside class="publication-summary">
        <FamilyAmbassadorGuide
          :theme="resourceTheme"
          :tone="resourceGuide.tone"
          :variant="resourceGuide.variant"
          :eyebrow="resourceGuide.eyebrow"
          :title="resourceGuide.title"
          :message="resourceGuide.message"
          compact
        />
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

    <FamilyAmbassadorGuide
      v-else
      class="resource-empty-guide"
      :theme="resourceTheme"
      variant="empty"
      tone="empty"
      :title="emptyTitle"
      :message="emptyMessage"
    />
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

const resourceTheme = computed(() => resolvePersonasTheme({ themeKey: 'daycare' }))
const featuredItem = computed(() => items.value?.[0] || null)
const remainingItems = computed(() => items.value?.slice(1) || [])
const resourceVariant = computed(() => props.type === 'hw' ? 'help' : props.type === 'cal' ? 'preview' : 'hero')
const resourceGuide = computed(() => {
  if (props.type === 'hw') return {
    tone: 'notice' as const,
    variant: 'help' as const,
    eyebrow: 'Guía de tareas',
    title: 'Revisa primero lo más reciente',
    message: 'Si hay archivo adjunto, ábrelo desde el recurso destacado para evitar perder instrucciones de la sala.'
  }
  if (props.type === 'cal') return {
    tone: 'calm' as const,
    variant: 'preview' as const,
    eyebrow: 'Agenda familiar',
    title: 'El próximo evento queda arriba',
    message: 'Tu embajador ordena la agenda para que confirmes fechas importantes sin recorrer toda la lista.'
  }
  return {
    tone: 'calm' as const,
    variant: 'hero' as const,
    eyebrow: 'Comunicados',
    title: 'Empieza por el aviso destacado',
    message: 'Los avisos se conservan como historial para que puedas volver a consultarlos cuando lo necesites.'
  }
})
const emptyTitle = computed(() => props.type === 'hw' ? 'Sin tareas por ahora' : props.type === 'cal' ? 'Sin eventos próximos' : 'Sin avisos nuevos')
const emptyMessage = computed(() => props.type === 'hw'
  ? 'Cuando la sala publique una tarea, tu embajador la colocará aquí con el recurso principal.'
  : props.type === 'cal'
    ? 'Cuando haya eventos publicados, aparecerán ordenados por fecha para que puedas planear con calma.'
    : 'Cuando la escuela publique un comunicado, aparecerá aquí como prioridad de lectura.')
const summaryEyebrow = computed(() => props.type === 'hw' ? 'Tareas activas' : props.type === 'cal' ? 'Agenda' : 'Comunicados')
const featuredLabel = computed(() => props.type === 'hw' ? 'Tarea principal' : props.type === 'cal' ? 'Próximo evento' : 'Aviso más reciente')
const titleFallback = computed(() => props.type === 'hw' ? 'Tarea publicada' : props.type === 'cal' ? 'Evento publicado' : 'Aviso publicado')
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
  grid-template-columns: minmax(0, 1fr) 104px auto;
  padding: clamp(18px, 2.4vw, 26px);
}

.resource-hero-copy {
  min-width: 0;
}

.resource-hero-ambassador {
  height: 96px;
  overflow: hidden;
  width: 104px;
}

.resource-hero-ambassador :deep(.pa-ambassador-card),
.resource-hero-ambassador :deep(.pa-ambassador-visual) {
  height: 100%;
  width: 100%;
}

.resource-hero h1,
.resource-hero p {
  margin-bottom: 0;
}

.resource-hero h1 {
  font-size: clamp(2rem, 3.2vw, 3rem);
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

  .resource-hero {
    grid-template-columns: minmax(0, 1fr) 78px;
  }

  .resource-hero .btn {
    grid-column: 1 / -1;
    justify-self: start;
  }

  .resource-hero-ambassador {
    height: 78px;
    width: 78px;
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
