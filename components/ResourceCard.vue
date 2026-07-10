<template>
  <article class="resource-card" :class="variantClass">
    <div v-if="resource.type === 'cal'" class="calendar-date" aria-hidden="true">
      <strong>{{ calendarDay.day }}</strong>
      <span>{{ calendarDay.month }}</span>
    </div>

    <div class="resource-body">
      <header class="resource-meta">
        <span class="resource-kind">
          <FamilyPersonasIcon :name="iconName" />
          {{ typeLabel }}
        </span>
        <time>{{ formatDate(resource.date || resource.timestamp) }}</time>
      </header>

      <div class="resource-copy">
        <h3>{{ resource.title || titleFallback }}</h3>
        <p v-if="bodyCopy">{{ bodyCopy }}</p>
      </div>

      <img
        v-if="canPreviewImage"
        v-show="imageReady"
        class="resource-image"
        :src="resource.resource || ''"
        alt=""
        decoding="async"
        loading="lazy"
        @load="imageReady = true"
        @error="imageFailed = true"
      />

      <footer v-if="resource.resource || (resource.autor && density === 'comfortable')" class="resource-footer">
        <small v-if="resource.autor && density === 'comfortable'">{{ resource.autor }}</small>
        <a v-if="resource.resource" class="resource-link" :href="resourceHref" target="_blank" rel="noopener">
          {{ actionLabel }}
          <FamilyPersonasIcon name="arrow" />
        </a>
      </footer>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { DaycareResource } from '~/types/daycare'
import { formatCalendarDay, formatDate, isImageResource, isPdfResource, publishedPdfViewerUrl, stripHtml } from '~/utils/daycare'

const props = defineProps<{
  resource: DaycareResource
  variant?: 'notice' | 'homework' | 'calendar' | 'default'
  density?: 'compact' | 'comfortable'
  featured?: boolean
}>()

const imageReady = ref(false)
const imageFailed = ref(false)
const density = computed(() => props.density || 'compact')
const resourceHref = computed(() => {
  return isPdfResource(props.resource.resource) ? publishedPdfViewerUrl(props.resource.resource) : props.resource.resource || ''
})
const canPreviewImage = computed(() => Boolean(props.resource.resource && isImageResource(props.resource.resource) && !imageFailed.value))
const variantClass = computed(() => [
  props.variant ? `variant-${props.variant}` : 'variant-default',
  `density-${density.value}`,
  `type-${props.resource.type}`,
  {
    'is-priority': Boolean(props.resource.starred),
    'is-featured': Boolean(props.featured)
  }
])
const titleFallback = computed(() => props.resource.type === 'hw' ? 'Tarea' : props.resource.type === 'cal' ? 'Evento' : 'Aviso')
const bodyCopy = computed(() => stripHtml(props.resource.description || props.resource.html))
const calendarDay = computed(() => formatCalendarDay(props.resource.date || props.resource.timestamp))
const iconName = computed(() => props.resource.type === 'hw' ? 'edit' : props.resource.type === 'cal' ? 'calendar' : 'announcement')
const typeLabel = computed(() => props.resource.type === 'hw' ? 'Tarea' : props.resource.type === 'cal' ? 'Agenda' : props.resource.starred ? 'Importante' : 'Aviso')
const actionLabel = computed(() => isPdfResource(props.resource.resource) ? 'Ver PDF' : 'Abrir')

watch(() => props.resource.resource, () => {
  imageReady.value = false
  imageFailed.value = false
}, { immediate: true })
</script>

<style scoped>
.resource-card {
  --resource-accent: #6f971a;
  --resource-soft: #f1f7e9;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(53, 95, 36, 0.12);
  border-radius: 22px;
  box-shadow: 0 10px 30px rgba(43, 72, 32, 0.07);
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  overflow: hidden;
  padding: 17px;
  position: relative;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.resource-card::before {
  background: var(--resource-accent);
  border-radius: 999px;
  content: '';
  height: 5px;
  left: 17px;
  opacity: 0.9;
  position: absolute;
  top: 0;
  width: 42px;
}

.resource-card.is-featured {
  border-radius: 28px;
  min-height: 250px;
  padding: clamp(20px, 3vw, 30px);
}

.resource-card.is-featured::before {
  left: clamp(20px, 3vw, 30px);
  width: 58px;
}

.resource-card.is-featured .resource-copy h3 {
  font-size: clamp(1.55rem, 3vw, 2.35rem);
  max-width: 760px;
}

.resource-card.is-featured .resource-copy p {
  font-size: 0.95rem;
  max-width: 720px;
  -webkit-line-clamp: 4;
}

.resource-card:hover {
  border-color: color-mix(in srgb, var(--resource-accent) 32%, transparent);
  box-shadow: 0 16px 38px rgba(43, 72, 32, 0.11);
  transform: translateY(-2px);
}

.type-hw {
  --resource-accent: #ff9f43;
  --resource-soft: #fff4e5;
}

.type-news {
  --resource-accent: #5d8f3c;
  --resource-soft: #eef7e7;
}

.type-cal {
  --resource-accent: #4f9ed8;
  --resource-soft: #edf7fd;
}

.is-priority {
  --resource-accent: #f2ae32;
}

.variant-homework,
.variant-notice,
.variant-calendar,
.variant-default {
  padding: 17px;
}

.resource-body {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.resource-meta {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: space-between;
}

.resource-kind {
  align-items: center;
  background: var(--resource-soft);
  border-radius: 999px;
  color: var(--resource-accent);
  display: inline-flex;
  font-size: 0.69rem;
  font-weight: 800;
  gap: 6px;
  letter-spacing: 0.04em;
  padding: 6px 9px;
  text-transform: uppercase;
}

.resource-kind :deep(.pa-icon) {
  height: 0.88rem;
  width: 0.88rem;
}

.resource-meta time {
  color: #808a7a;
  font-size: 0.71rem;
  font-weight: 650;
}

.resource-copy {
  display: grid;
  gap: 7px;
}

.resource-copy h3 {
  color: #263522;
  font-size: clamp(1.05rem, 1.5vw, 1.28rem);
  line-height: 1.08;
  margin: 0;
  overflow-wrap: anywhere;
}

.resource-copy p {
  color: #687363;
  display: -webkit-box;
  font-size: 0.86rem;
  line-height: 1.5;
  margin: 0;
  overflow: hidden;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.resource-image {
  background: var(--resource-soft);
  border: 1px solid color-mix(in srgb, var(--resource-accent) 16%, transparent);
  border-radius: 16px;
  display: block;
  max-height: 260px;
  object-fit: contain;
  width: 100%;
}

.density-comfortable .resource-image {
  max-height: min(380px, 44vh);
}

.resource-footer {
  align-items: center;
  border-top: 1px solid rgba(53, 95, 36, 0.08);
  display: flex;
  gap: 10px;
  justify-content: space-between;
  padding-top: 11px;
}

.resource-footer small {
  color: #8a9385;
  font-size: 0.68rem;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-link {
  align-items: center;
  color: var(--resource-accent);
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 800;
  gap: 5px;
  margin-left: auto;
}

.resource-link :deep(.pa-icon) {
  height: 0.9rem;
  transition: transform 0.18s ease;
  width: 0.9rem;
}

.resource-link:hover :deep(.pa-icon) {
  transform: translateX(3px);
}

.calendar-date {
  align-items: center;
  background: var(--resource-soft);
  border: 1px solid color-mix(in srgb, var(--resource-accent) 18%, transparent);
  border-radius: 18px;
  display: grid;
  justify-items: center;
  min-height: 86px;
  padding: 10px;
  text-transform: capitalize;
}

.calendar-date strong {
  color: var(--resource-accent);
  font-family: var(--font-title);
  font-size: 2rem;
  line-height: 1;
}

.calendar-date span {
  color: #687363;
  font-size: 0.7rem;
  font-weight: 800;
}

.type-cal {
  grid-template-columns: 82px minmax(0, 1fr);
}

@media (max-width: 520px) {
  .resource-card {
    border-radius: 19px;
    padding: 15px;
  }

  .type-cal {
    gap: 12px;
    grid-template-columns: 68px minmax(0, 1fr);
  }

  .calendar-date {
    border-radius: 15px;
    min-height: 76px;
    padding: 8px;
  }

  .calendar-date strong {
    font-size: 1.65rem;
  }

  .resource-footer {
    align-items: flex-end;
  }
}
</style>
