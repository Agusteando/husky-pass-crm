<template>
  <Teleport to="body">
    <Transition name="media-viewer">
      <div v-if="open && asset" class="media-viewer-backdrop" role="presentation" @click.self="closeViewer">
        <section ref="dialogRef" class="media-viewer" role="dialog" aria-modal="true" :aria-labelledby="titleId" tabindex="-1">
          <header class="media-viewer-head">
            <div class="viewer-title">
              <span class="viewer-kind"><FamilyPersonasIcon :name="iconName" /></span>
              <div>
                <p>{{ kindLabel }}</p>
                <h2 :id="titleId">{{ title || asset.name || 'Recurso' }}</h2>
              </div>
            </div>
            <div class="viewer-actions">
              <a class="viewer-action" :href="asset.url" download target="_blank" rel="noopener" aria-label="Descargar archivo">
                <FamilyPersonasIcon name="download" />
                <span>Descargar</span>
              </a>
              <button class="viewer-close" type="button" aria-label="Cerrar" @click="closeViewer">×</button>
            </div>
          </header>

          <div class="media-viewer-stage" :class="`kind-${asset.kind}`">
            <template v-if="asset.kind === 'image'">
              <button class="image-canvas" type="button" :aria-label="zoomed ? 'Reducir imagen' : 'Ampliar imagen'" @click="zoomed = !zoomed">
                <img
                  :class="{ zoomed }"
                  :src="asset.url"
                  :alt="asset.alt || title || asset.name || 'Imagen de la publicación'"
                  :style="imagePosition"
                  decoding="async"
                />
              </button>
              <span class="zoom-hint"><FamilyPersonasIcon name="zoom" />{{ zoomed ? 'Reducir' : 'Ampliar' }}</span>
            </template>

            <iframe
              v-else-if="asset.kind === 'pdf'"
              class="pdf-frame"
              :src="pdfUrl"
              :title="`Vista previa de ${asset.name || title || 'PDF'}`"
            />

            <div v-else class="document-view">
              <span class="document-mark"><FamilyPersonasIcon :name="iconName" /></span>
              <p>{{ extensionLabel }}</p>
              <h3>{{ asset.name }}</h3>
              <span v-if="asset.size">{{ formattedSize }}</span>
              <a :href="asset.url" target="_blank" rel="noopener">Abrir archivo</a>
            </div>
          </div>

          <footer v-if="asset.caption || asset.name || formattedSize" class="media-viewer-foot">
            <p v-if="asset.caption">{{ asset.caption }}</p>
            <div>
              <span v-if="asset.name">{{ asset.name }}</span>
              <span v-if="formattedSize">{{ formattedSize }}</span>
            </div>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import { daycareDocumentIcon, daycareMediaAsset, formatDaycareMediaSize } from '~/utils/daycareMedia'
import { publishedPdfViewerUrl } from '~/utils/daycare'

const props = defineProps<{
  open: boolean
  resource?: string | null
  title?: string | null
}>()

const emit = defineEmits<{ close: [] }>()
const dialogRef = ref<HTMLElement | null>(null)
const zoomed = ref(false)
const titleId = `daycare-media-viewer-${useId()}`
const asset = computed(() => daycareMediaAsset(props.resource))
const iconName = computed(() => daycareDocumentIcon(asset.value?.kind))
const pdfUrl = computed(() => publishedPdfViewerUrl(props.resource))
const formattedSize = computed(() => formatDaycareMediaSize(asset.value?.size))
const kindLabel = computed(() => {
  if (asset.value?.kind === 'image') return 'Imagen'
  if (asset.value?.kind === 'pdf') return 'Documento PDF'
  if (asset.value?.kind === 'spreadsheet') return 'Hoja de cálculo'
  if (asset.value?.kind === 'text') return 'Archivo de texto'
  return 'Documento'
})
const extensionLabel = computed(() => asset.value?.extension ? asset.value.extension.toUpperCase() : kindLabel.value)
const imagePosition = computed(() => ({ objectPosition: `${asset.value?.focalX ?? 50}% ${asset.value?.focalY ?? 50}%` }))

function closeViewer() {
  zoomed.value = false
  emit('close')
}

function onKeydown(event: KeyboardEvent) {
  if (!props.open) return
  if (event.key === 'Escape') closeViewer()
}

watch(() => props.open, async (open) => {
  document.body.classList.toggle('daycare-media-open', open)
  if (open) {
    await nextTick()
    dialogRef.value?.focus()
  } else {
    zoomed.value = false
  }
})

if (import.meta.client) document.addEventListener('keydown', onKeydown)
onBeforeUnmount(() => {
  if (import.meta.client) {
    document.removeEventListener('keydown', onKeydown)
    document.body.classList.remove('daycare-media-open')
  }
})
</script>

<style scoped>
.media-viewer-backdrop {
  align-items: center;
  background: rgba(11, 25, 20, 0.82);
  backdrop-filter: blur(18px);
  display: grid;
  inset: 0;
  justify-items: center;
  padding: clamp(10px, 2vw, 24px);
  position: fixed;
  z-index: 1800;
}

.media-viewer {
  background: #f7faf5;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 28px;
  box-shadow: 0 36px 120px rgba(0, 0, 0, 0.46);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  max-height: calc(100dvh - 28px);
  max-width: min(1180px, calc(100vw - 24px));
  min-height: min(760px, calc(100dvh - 28px));
  overflow: hidden;
  width: 100%;
}

.media-viewer:focus { outline: none; }

.media-viewer-head {
  align-items: center;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid rgba(53, 95, 36, 0.1);
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 14px 16px;
}

.viewer-title,
.viewer-actions,
.viewer-action {
  align-items: center;
  display: flex;
}

.viewer-title { gap: 11px; min-width: 0; }
.viewer-title > div { min-width: 0; }
.viewer-title p,
.viewer-title h2 { margin: 0; }
.viewer-title p {
  color: #6f971a;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.viewer-title h2 {
  color: #253421;
  font-family: var(--font-title);
  font-size: clamp(1rem, 2vw, 1.35rem);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.viewer-kind {
  align-items: center;
  background: #eff7e8;
  border-radius: 14px;
  color: #5d8f3c;
  display: inline-flex;
  height: 42px;
  justify-content: center;
  width: 42px;
}
.viewer-actions { gap: 8px; }
.viewer-action,
.viewer-close {
  background: #fff;
  border: 1px solid rgba(53, 95, 36, 0.14);
  border-radius: 13px;
  color: #355f24;
  min-height: 42px;
}
.viewer-action {
  font-size: 0.76rem;
  font-weight: 800;
  gap: 7px;
  padding: 0 12px;
}
.viewer-close {
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  width: 42px;
}

.media-viewer-stage {
  background:
    radial-gradient(circle at 15% 5%, rgba(255, 190, 71, 0.15), transparent 28%),
    radial-gradient(circle at 85% 100%, rgba(102, 158, 61, 0.14), transparent 30%),
    #18231a;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.image-canvas {
  background: transparent;
  border: 0;
  cursor: zoom-in;
  display: block;
  height: 100%;
  overflow: auto;
  padding: clamp(16px, 3vw, 34px);
  width: 100%;
}
.image-canvas img {
  display: block;
  height: 100%;
  margin: auto;
  max-height: calc(100dvh - 190px);
  max-width: 100%;
  object-fit: contain;
  transition: transform 180ms ease;
  width: 100%;
}
.image-canvas img.zoomed {
  cursor: zoom-out;
  height: auto;
  max-height: none;
  max-width: none;
  object-fit: initial;
  transform: scale(1.35);
  transform-origin: center;
  width: auto;
}
.zoom-hint {
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  bottom: 14px;
  color: #31472b;
  display: inline-flex;
  font-size: 0.7rem;
  font-weight: 800;
  gap: 6px;
  left: 50%;
  padding: 8px 11px;
  pointer-events: none;
  position: absolute;
  transform: translateX(-50%);
}
.pdf-frame {
  background: #fff;
  border: 0;
  height: 100%;
  min-height: min(680px, calc(100dvh - 170px));
  width: 100%;
}
.document-view {
  align-content: center;
  color: #fff;
  display: grid;
  gap: 10px;
  height: 100%;
  justify-items: center;
  min-height: 500px;
  padding: 36px;
  text-align: center;
}
.document-view p,
.document-view h3 { margin: 0; }
.document-view p {
  color: #f6c967;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}
.document-view h3 { font-size: clamp(1.35rem, 3vw, 2.2rem); }
.document-view > span:not(.document-mark) { color: rgba(255, 255, 255, 0.72); }
.document-mark {
  align-items: center;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 26px;
  display: inline-flex;
  height: 96px;
  justify-content: center;
  width: 96px;
}
.document-mark :deep(.pa-icon) { height: 2.3rem; width: 2.3rem; }
.document-view a {
  background: #fff;
  border-radius: 14px;
  color: #355f24;
  font-weight: 900;
  margin-top: 8px;
  padding: 12px 16px;
}
.media-viewer-foot {
  align-items: center;
  background: #fff;
  border-top: 1px solid rgba(53, 95, 36, 0.1);
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 12px 16px;
}
.media-viewer-foot p { color: #52604d; margin: 0; }
.media-viewer-foot div { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
.media-viewer-foot span {
  background: #f2f6ef;
  border-radius: 999px;
  color: #6d7868;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 6px 9px;
}
.media-viewer-enter-active,
.media-viewer-leave-active { transition: opacity 160ms ease; }
.media-viewer-enter-from,
.media-viewer-leave-to { opacity: 0; }
:global(body.daycare-media-open) { overflow: hidden; }

@media (max-width: 680px) {
  .media-viewer-backdrop { align-items: end; padding: 0; }
  .media-viewer {
    border-radius: 24px 24px 0 0;
    max-height: 96dvh;
    max-width: 100vw;
    min-height: 82dvh;
  }
  .viewer-action span { display: none; }
  .media-viewer-head { padding: 11px 12px; }
  .viewer-kind { height: 38px; width: 38px; }
  .media-viewer-foot { align-items: flex-start; flex-direction: column; }
  .media-viewer-foot div { justify-content: flex-start; }
  .image-canvas { padding: 10px; }
  .image-canvas img { max-height: calc(96dvh - 170px); }
  .pdf-frame { min-height: calc(96dvh - 126px); }
}
</style>
