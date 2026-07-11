<template>
  <article class="resource-card" :class="variantClass">
    <button
      v-if="asset"
      class="media-stage"
      :class="`media-${asset.kind}`"
      type="button"
      :aria-label="mediaActionLabel"
      @click="viewerOpen = true"
    >
      <template v-if="asset.kind === 'image'">
        <span v-if="!imageReady && !imageFailed" class="media-skeleton" aria-hidden="true" />
        <img
          v-if="!imageFailed"
          ref="imageElement"
          :class="{ 'is-ready': imageReady }"
          :src="asset.url"
          :alt="asset.alt || resource.title || 'Imagen de la publicación'"
          :style="imagePosition"
          decoding="async"
          loading="lazy"
          @load="markImageReady"
          @error="markImageFailed"
        />
        <span v-else class="media-error">
          <FamilyPersonasIcon name="camera" />
          <strong>Imagen no disponible</strong>
          <small>Volver a intentar</small>
        </span>
        <span v-if="imageReady" class="media-overlay" aria-hidden="true">
          <FamilyPersonasIcon name="zoom" />
        </span>
      </template>

      <template v-else>
        <span class="document-art" aria-hidden="true">
          <span class="document-fold" />
          <FamilyPersonasIcon :name="documentIcon" />
          <strong>{{ extensionLabel }}</strong>
        </span>
        <span class="document-copy">
          <small>{{ mediaKindLabel }}</small>
          <strong>{{ asset.name || resource.title || 'Archivo' }}</strong>
          <span>{{ documentMeta }}</span>
        </span>
        <span class="document-action"><FamilyPersonasIcon name="arrow" /></span>
      </template>
    </button>

    <div class="resource-layout">
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

        <footer v-if="asset || (resource.autor && density === 'comfortable')" class="resource-footer">
          <small v-if="resource.autor && density === 'comfortable'">{{ resource.autor }}</small>
          <button v-if="asset" class="resource-link" type="button" @click="viewerOpen = true">
            {{ actionLabel }}
            <FamilyPersonasIcon name="arrow" />
          </button>
        </footer>
      </div>
    </div>

    <DaycareMediaViewer :open="viewerOpen" :resource="resource.resource" :title="resource.title" @close="viewerOpen = false" />
  </article>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { DaycareResource } from '~/types/daycare'
import { formatCalendarDay, formatDate, stripHtml } from '~/utils/daycare'
import { daycareDocumentIcon, daycareMediaAsset, formatDaycareMediaSize } from '~/utils/daycareMedia'

const props = defineProps<{
  resource: DaycareResource
  variant?: 'notice' | 'homework' | 'calendar' | 'default'
  density?: 'compact' | 'comfortable'
  featured?: boolean
}>()

const imageElement = ref<HTMLImageElement | null>(null)
const imageReady = ref(false)
const imageFailed = ref(false)
const viewerOpen = ref(false)
const density = computed(() => props.density || 'compact')
const asset = computed(() => daycareMediaAsset(props.resource.resource))
const documentIcon = computed(() => daycareDocumentIcon(asset.value?.kind))
const mediaOrientation = computed(() => {
  const ratio = Number(asset.value?.aspectRatio || 0)
  if (!ratio) return 'unknown'
  if (ratio < 0.82) return 'portrait'
  if (ratio > 1.18) return 'landscape'
  return 'square'
})
const imagePosition = computed(() => ({ objectPosition: `${asset.value?.focalX ?? 50}% ${asset.value?.focalY ?? 50}%` }))
const variantClass = computed(() => [
  props.variant ? `variant-${props.variant}` : 'variant-default',
  `density-${density.value}`,
  `type-${props.resource.type}`,
  `asset-${asset.value?.kind || 'none'}`,
  `orientation-${mediaOrientation.value}`, 
  {
    'has-media': Boolean(asset.value),
    'is-priority': Boolean(props.resource.starred),
    'is-featured': Boolean(props.featured)
  }
])
const titleFallback = computed(() => props.resource.type === 'hw' ? 'Tarea' : props.resource.type === 'cal' ? 'Evento' : 'Aviso')
const bodyCopy = computed(() => stripHtml(props.resource.description || props.resource.html))
const calendarDay = computed(() => formatCalendarDay(props.resource.date || props.resource.timestamp))
const iconName = computed(() => props.resource.type === 'hw' ? 'edit' : props.resource.type === 'cal' ? 'calendar' : 'announcement')
const typeLabel = computed(() => props.resource.type === 'hw' ? 'Tarea' : props.resource.type === 'cal' ? 'Agenda' : props.resource.starred ? 'Importante' : 'Aviso')
const actionLabel = computed(() => asset.value?.kind === 'image' ? 'Ver imagen' : asset.value?.kind === 'pdf' ? 'Ver documento' : 'Abrir archivo')
const mediaActionLabel = computed(() => `${actionLabel.value}: ${props.resource.title || asset.value?.name || titleFallback.value}`)
const mediaKindLabel = computed(() => {
  if (asset.value?.kind === 'pdf') return 'Documento PDF'
  if (asset.value?.kind === 'spreadsheet') return 'Hoja de cálculo'
  if (asset.value?.kind === 'text') return 'Archivo de texto'
  return 'Documento'
})
const extensionLabel = computed(() => asset.value?.extension ? asset.value.extension.toUpperCase() : 'FILE')
const documentMeta = computed(() => [extensionLabel.value, formatDaycareMediaSize(asset.value?.size)].filter(Boolean).join(' · '))

function markImageReady() {
  imageReady.value = true
  imageFailed.value = false
}

function markImageFailed() {
  imageReady.value = false
  imageFailed.value = true
}

function recoverCompletedImage() {
  const image = imageElement.value
  if (!image?.complete) return
  if (image.naturalWidth > 0) markImageReady()
}

watch(() => asset.value?.url, async () => {
  imageReady.value = false
  imageFailed.value = false
  viewerOpen.value = false
  await nextTick()
  recoverCompletedImage()
}, { immediate: true })

onMounted(recoverCompletedImage)
</script>

<style scoped>
.resource-card {
  --resource-accent: #6f971a;
  --resource-soft: #f1f7e9;
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid rgba(53, 95, 36, 0.12);
  border-radius: 24px;
  box-shadow: 0 13px 36px rgba(43, 72, 32, 0.08);
  container-type: inline-size;
  display: grid;
  min-width: 0;
  overflow: hidden;
  position: relative;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.resource-card:hover {
  border-color: color-mix(in srgb, var(--resource-accent) 30%, transparent);
  box-shadow: 0 20px 48px rgba(43, 72, 32, 0.13);
  transform: translateY(-2px);
}

.type-hw { --resource-accent: #e98f2f; --resource-soft: #fff1df; }
.type-news { --resource-accent: #5d8f3c; --resource-soft: #edf7e6; }
.type-cal { --resource-accent: #438fc7; --resource-soft: #eaf5fc; }
.is-priority { --resource-accent: #d99a19; --resource-soft: #fff6dc; }

.media-stage {
  background: var(--resource-soft);
  border: 0;
  color: inherit;
  cursor: pointer;
  display: grid;
  min-height: 210px;
  overflow: hidden;
  padding: 0;
  position: relative;
  text-align: left;
  width: 100%;
}

.media-image img {
  display: block;
  height: 100%;
  inset: 0;
  object-fit: cover;
  opacity: 0;
  position: absolute;
  transition: opacity 180ms ease, transform 220ms ease;
  width: 100%;
}
.media-image img.is-ready { opacity: 1; }
.resource-card:hover .media-image img { transform: scale(1.025); }
.orientation-portrait .media-image {
  background:
    radial-gradient(circle at 78% 10%, color-mix(in srgb, var(--resource-accent) 18%, transparent), transparent 34%),
    linear-gradient(145deg, var(--resource-soft), #fff);
}
.orientation-portrait .media-image img {
  border-radius: 14px;
  box-shadow: 0 18px 36px rgba(37, 52, 33, 0.16);
  height: calc(100% - 28px);
  inset: 14px;
  object-fit: contain;
  width: calc(100% - 28px);
}
.resource-card.orientation-portrait:hover .media-image img { transform: translateY(-2px); }
.media-skeleton {
  animation: media-shimmer 1.2s ease-in-out infinite alternate;
  background: linear-gradient(110deg, var(--resource-soft) 24%, #fff 44%, var(--resource-soft) 64%);
  background-size: 220% 100%;
  inset: 0;
  position: absolute;
}
.media-overlay {
  align-items: center;
  background: rgba(20, 39, 18, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  bottom: 13px;
  color: #fff;
  display: inline-flex;
  height: 38px;
  justify-content: center;
  opacity: 0;
  position: absolute;
  right: 13px;
  transform: translateY(5px);
  transition: opacity 180ms ease, transform 180ms ease;
  width: 38px;
}
.media-stage:hover .media-overlay,
.media-stage:focus-visible .media-overlay { opacity: 1; transform: translateY(0); }
.media-error {
  align-content: center;
  color: var(--resource-accent);
  display: grid;
  gap: 5px;
  height: 100%;
  justify-items: center;
  min-height: 210px;
  padding: 22px;
}
.media-error :deep(.pa-icon) { height: 1.8rem; width: 1.8rem; }
.media-error small { color: #7d8878; }

.media-pdf,
.media-document,
.media-spreadsheet,
.media-text,
.media-unknown {
  align-items: center;
  background:
    radial-gradient(circle at 86% 8%, rgba(255, 255, 255, 0.8), transparent 30%),
    linear-gradient(135deg, var(--resource-soft), #fff);
  gap: 16px;
  grid-template-columns: 92px minmax(0, 1fr) auto;
  min-height: 150px;
  padding: 18px;
}
.document-art {
  align-items: center;
  background: #fff;
  border: 1px solid color-mix(in srgb, var(--resource-accent) 20%, transparent);
  border-radius: 20px;
  box-shadow: 0 12px 24px color-mix(in srgb, var(--resource-accent) 12%, transparent);
  color: var(--resource-accent);
  display: grid;
  height: 110px;
  justify-items: center;
  overflow: hidden;
  position: relative;
  width: 82px;
}
.document-art :deep(.pa-icon) { height: 1.75rem; width: 1.75rem; }
.document-art strong {
  background: var(--resource-accent);
  bottom: 0;
  color: #fff;
  font-size: 0.63rem;
  left: 0;
  letter-spacing: 0.08em;
  padding: 6px 4px;
  position: absolute;
  text-align: center;
  width: 100%;
}
.document-fold {
  border-color: transparent var(--resource-soft) transparent transparent;
  border-style: solid;
  border-width: 0 22px 22px 0;
  height: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: 0;
}
.document-copy { display: grid; gap: 5px; min-width: 0; }
.document-copy small {
  color: var(--resource-accent);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}
.document-copy strong {
  color: #263522;
  font-size: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.document-copy span { color: #778172; font-size: 0.74rem; }
.document-action {
  align-items: center;
  background: #fff;
  border: 1px solid color-mix(in srgb, var(--resource-accent) 18%, transparent);
  border-radius: 999px;
  color: var(--resource-accent);
  display: inline-flex;
  height: 40px;
  justify-content: center;
  width: 40px;
}

.resource-layout {
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1fr);
  padding: 18px;
}
.resource-body { display: grid; gap: 13px; min-width: 0; }
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
  font-size: 0.68rem;
  font-weight: 900;
  gap: 6px;
  letter-spacing: 0.05em;
  padding: 6px 9px;
  text-transform: uppercase;
}
.resource-kind :deep(.pa-icon) { height: 0.88rem; width: 0.88rem; }
.resource-meta time { color: #808a7a; font-size: 0.71rem; font-weight: 700; }
.resource-copy { display: grid; gap: 8px; }
.resource-copy h3 {
  color: #263522;
  font-family: var(--font-title);
  font-size: clamp(1.08rem, 1.7vw, 1.35rem);
  letter-spacing: -0.02em;
  line-height: 1.06;
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
.resource-footer {
  align-items: center;
  border-top: 1px solid rgba(53, 95, 36, 0.08);
  display: flex;
  gap: 10px;
  justify-content: space-between;
  padding-top: 12px;
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
  background: transparent;
  border: 0;
  color: var(--resource-accent);
  cursor: pointer;
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 900;
  gap: 5px;
  margin-left: auto;
  padding: 0;
}
.resource-link :deep(.pa-icon) { height: 0.9rem; transition: transform 0.18s ease; width: 0.9rem; }
.resource-link:hover :deep(.pa-icon) { transform: translateX(3px); }

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
.calendar-date strong { color: var(--resource-accent); font-family: var(--font-title); font-size: 2rem; line-height: 1; }
.calendar-date span { color: #687363; font-size: 0.7rem; font-weight: 800; }
.type-cal .resource-layout { grid-template-columns: 82px minmax(0, 1fr); }

.is-featured { border-radius: 30px; }
.is-featured .media-stage { min-height: clamp(260px, 40vw, 430px); }
.is-featured .resource-layout { padding: clamp(21px, 3vw, 32px); }
.is-featured .resource-copy h3 { font-size: clamp(1.65rem, 3.4vw, 2.75rem); max-width: 780px; }
.is-featured .resource-copy p { font-size: 0.95rem; max-width: 760px; -webkit-line-clamp: 4; }
.is-featured.asset-image {
  grid-template-columns: minmax(0, 1.02fr) minmax(320px, 0.98fr);
  min-height: 360px;
}
.is-featured.asset-image .media-stage { min-height: 100%; order: 2; }
.is-featured.asset-image .resource-layout { align-content: center; order: 1; }
.is-featured.asset-image.type-cal .resource-layout { grid-template-columns: 82px minmax(0, 1fr); }

@keyframes media-shimmer { from { background-position: 90% 0; } to { background-position: -90% 0; } }


@container (max-width: 680px) {
  .is-featured.asset-image {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .is-featured.asset-image .media-stage {
    min-height: 250px;
    order: 1;
  }

  .is-featured.asset-image .resource-layout {
    order: 2;
  }
}

@media (max-width: 760px) {
  .resource-card,
  .is-featured { border-radius: 21px; }
  .is-featured.asset-image { grid-template-columns: 1fr; min-height: 0; }
  .is-featured.asset-image .media-stage { min-height: 250px; order: 1; }
  .is-featured.asset-image .resource-layout { order: 2; }
  .media-stage { min-height: 190px; }
  .media-pdf,
  .media-document,
  .media-spreadsheet,
  .media-text,
  .media-unknown { grid-template-columns: 72px minmax(0, 1fr) auto; min-height: 132px; padding: 14px; }
  .document-art { border-radius: 16px; height: 92px; width: 68px; }
  .document-copy strong { font-size: 0.9rem; }
  .resource-layout { padding: 16px; }
}

@media (max-width: 520px) {
  .type-cal .resource-layout { gap: 12px; grid-template-columns: 66px minmax(0, 1fr); }
  .calendar-date { border-radius: 15px; min-height: 76px; padding: 8px; }
  .calendar-date strong { font-size: 1.65rem; }
  .resource-footer { align-items: flex-end; }
  .media-pdf,
  .media-document,
  .media-spreadsheet,
  .media-text,
  .media-unknown { grid-template-columns: 62px minmax(0, 1fr); }
  .document-art { height: 82px; width: 60px; }
  .document-action { display: none; }
}
</style>
