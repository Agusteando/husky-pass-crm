<template>
  <section class="svg-editor" data-product-panel="marbete-svg-editor">
    <header class="editor-topbar">
      <div>
        <p class="eyebrow">Editor sobre SVG</p>
        <h2>Base existente + capas dinámicas</h2>
      </div>
      <div class="editor-actions">
        <button class="mini-btn" type="button" @click="addLayer('cover')">Añadir cubierta</button>
        <button class="mini-btn" type="button" @click="addLayer('static-image')">Añadir imagen</button>
      </div>
    </header>

    <div class="editor-grid">
      <aside class="layer-rail" aria-label="Capas del marbete">
        <div class="rail-heading">
          <div>
            <span>Capas</span>
            <strong>{{ design.layers.length }}</strong>
          </div>
          <small>{{ visibleCount }} visibles</small>
        </div>

        <div class="layer-list">
          <article v-for="layer in orderedLayers" :key="layer.id" :class="{ selected: layer.id === selectedId, hidden: !layer.visible }">
            <button class="layer-select" type="button" @click="selectedId = layer.id">
              <span class="layer-icon">{{ layerIcon(layer.kind) }}</span>
              <span>
                <strong>{{ layer.label }}</strong>
                <small>{{ layerSubtitle(layer) }}</small>
              </span>
            </button>
            <div class="layer-actions">
              <button type="button" class="rail-toggle" @click="toggleVisible(layer.id)">{{ layer.visible ? 'Visible' : 'Oculto' }}</button>
              <button v-if="canDeleteLayer(layer.id)" type="button" class="rail-delete" @click="removeLayer(layer.id)">Eliminar</button>
            </div>
          </article>
        </div>
      </aside>

      <main class="preview-column">
        <div class="preview-meta">
          <p>
            <span class="live-dot"></span>
            SVG base listo
          </p>
          <strong>{{ activeCycle }}</strong>
        </div>

        <div class="stage-shell">
          <div ref="canvasRef" class="stage-canvas" :style="surfaceStyle">
            <div class="svg-stage" role="img" aria-label="Vista previa editable" v-html="previewSvg"></div>
            <div
              v-for="layer in visibleLayers"
              :key="layer.id"
              class="layer-frame"
              :class="{ selected: layer.id === selectedId }"
              :style="frameStyle(layer)"
              role="button"
              tabindex="0"
              :aria-label="`Mover ${layer.label}`"
              @pointerdown="startPointer($event, layer, 'move')"
              @keydown="nudgeLayer($event, layer.id)"
              @click.stop="selectedId = layer.id"
            >
              <span v-if="layer.id === selectedId" class="frame-label">{{ layer.label }}</span>
              <span v-if="layer.id === selectedId" class="resize-handle" aria-hidden="true" @pointerdown.stop="startPointer($event, layer, 'resize')"></span>
            </div>
          </div>
        </div>
      </main>

      <aside class="property-panel" aria-label="Propiedades">
        <template v-if="selectedLayer">
          <div class="property-heading">
            <div>
              <span>Propiedades</span>
              <strong>{{ selectedLayer.label }}</strong>
            </div>
            <button type="button" @click="resetSelected">Restablecer</button>
          </div>

          <label class="visibility-check">
            <input type="checkbox" :checked="selectedLayer.visible" @change="toggleVisible(selectedLayer.id)" />
            Mostrar esta capa
          </label>

          <fieldset>
            <legend>Posición y tamaño</legend>
            <div class="number-grid">
              <label>X <input type="number" :value="round(selectedLayer.x)" @input="numberField('x', $event)" /></label>
              <label>Y <input type="number" :value="round(selectedLayer.y)" @input="numberField('y', $event)" /></label>
              <label>Ancho <input type="number" min="12" :value="round(selectedLayer.width)" @input="numberField('width', $event)" /></label>
              <label>Alto <input type="number" min="12" :value="round(selectedLayer.height)" @input="numberField('height', $event)" /></label>
              <label>Orden <input type="number" :value="round(selectedLayer.zIndex)" @input="numberField('zIndex', $event)" /></label>
              <label>Rotación <input type="number" :value="round(selectedLayer.rotation)" @input="numberField('rotation', $event)" /></label>
            </div>
            <div class="align-grid">
              <button type="button" title="Izquierda" @click="alignSelected('left')">↤</button>
              <button type="button" title="Centro" @click="alignSelected('center')">↔</button>
              <button type="button" title="Derecha" @click="alignSelected('right')">↦</button>
              <button type="button" title="Arriba" @click="alignSelected('top')">↥</button>
              <button type="button" title="Medio" @click="alignSelected('middle')">↕</button>
              <button type="button" title="Abajo" @click="alignSelected('bottom')">↧</button>
            </div>
          </fieldset>

          <fieldset v-if="selectedLayer.kind === 'cover'">
            <legend>Cubierta</legend>
            <label class="color-field">Color <input type="color" :value="selectedLayer.fill || '#ffffff'" @input="stringField('fill', $event)" /></label>
            <label class="range-field"><span>Opacidad <strong>{{ round((selectedLayer.opacity ?? 1) * 100) }}%</strong></span><input type="range" min="0" max="1" step="0.01" :value="selectedLayer.opacity ?? 1" @input="numberField('opacity', $event)" /></label>
          </fieldset>

          <fieldset v-if="selectedLayer.kind === 'static-image'">
            <legend>Imagen fija</legend>
            <label class="background-upload">
              <strong>{{ selectedLayer.assetUrl ? 'Reemplazar imagen' : 'Subir imagen' }}</strong>
              <small>PNG, JPG o WebP.</small>
              <input type="file" accept="image/png,image/jpeg,image/webp" @change="selectStaticImage" />
              <em>{{ selectedLayer.assetUrl ? 'Imagen cargada' : 'Seleccionar archivo' }}</em>
            </label>
          </fieldset>

          <fieldset v-if="selectedLayer.textStyle">
            <legend>Tipografía</legend>
            <div class="number-grid">
              <label>Tamaño <input type="number" min="8" max="64" :value="selectedLayer.textStyle.fontSize" @input="textNumberField('fontSize', $event)" /></label>
              <label>Peso
                <select :value="selectedLayer.textStyle.fontWeight" @change="textNumberField('fontWeight', $event)">
                  <option :value="500">Medio</option>
                  <option :value="600">Semibold</option>
                  <option :value="700">Negrita</option>
                  <option :value="800">Extra</option>
                </select>
              </label>
            </div>
            <label class="color-field">Color <input type="color" :value="selectedLayer.textStyle.color" @input="textStringField('color', $event)" /></label>
            <div class="segmented">
              <button v-for="align in textAlignments" :key="align.value" type="button" :class="{ active: selectedLayer.textStyle.align === align.value }" @click="setTextAlign(align.value)">{{ align.label }}</button>
            </div>
            <label class="visibility-check"><input type="checkbox" :checked="selectedLayer.textStyle.uppercase" @change="setUppercase" /> Mayúsculas</label>
          </fieldset>

          <fieldset v-if="selectedLayer.imageStyle">
            <legend>Encuadre</legend>
            <label class="compact-field">Ajuste
              <select :value="selectedLayer.imageStyle.fit" @change="imageStringField('fit', $event)">
                <option value="cover">Llenar y recortar</option>
                <option value="contain">Mostrar completa</option>
              </select>
            </label>
            <label class="range-field"><span>Foco horizontal <strong>{{ round(selectedLayer.imageStyle.focalX) }}%</strong></span><input type="range" min="0" max="100" :value="selectedLayer.imageStyle.focalX" @input="imageNumberField('focalX', $event)" /></label>
            <label class="range-field"><span>Foco vertical <strong>{{ round(selectedLayer.imageStyle.focalY) }}%</strong></span><input type="range" min="0" max="100" :value="selectedLayer.imageStyle.focalY" @input="imageNumberField('focalY', $event)" /></label>
            <div class="number-grid">
              <label>Esquinas <input type="number" min="0" max="80" :value="selectedLayer.imageStyle.borderRadius" @input="imageNumberField('borderRadius', $event)" /></label>
              <label>Borde <input type="number" min="0" max="16" :value="selectedLayer.imageStyle.borderWidth" @input="imageNumberField('borderWidth', $event)" /></label>
            </div>
            <label class="color-field">Color de borde <input type="color" :value="selectedLayer.imageStyle.borderColor" @input="imageStringField('borderColor', $event)" /></label>
          </fieldset>
        </template>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRequestURL } from 'nuxt/app'
import type { MarbeteSvgDesign, MarbeteSvgLayer, MarbeteSvgLayerKind, PersonasThemeKey } from '~/types/daycare'
import { MARBETE_REPRESENTATIVE_VALUES } from '~/utils/marbeteDesigner'
import { createDefaultMarbeteSvgDesign, marbeteSvgLayerDefinition, normalizeMarbeteSvgDesign, previewMarbeteSvg } from '~/utils/marbeteSvgEditor'

const props = defineProps<{
  modelValue: MarbeteSvgDesign
  baseSvg: string
  cicloEscolar: string
  themeKey: PersonasThemeKey
}>()

const emit = defineEmits<{
  'update:modelValue': [value: MarbeteSvgDesign]
}>()

const previewOrigin = useRequestURL().origin
const canvasRef = ref<HTMLElement | null>(null)
const selectedId = ref('ciclo-tag')
const textAlignments = [
  { value: 'left' as const, label: 'Izq.' },
  { value: 'center' as const, label: 'Centro' },
  { value: 'right' as const, label: 'Der.' }
]

const design = computed(() => normalizeMarbeteSvgDesign(props.modelValue, props.themeKey))
const orderedLayers = computed(() => [...design.value.layers].sort((left, right) => left.zIndex - right.zIndex))
const visibleLayers = computed(() => orderedLayers.value.filter((layer) => layer.visible))
const visibleCount = computed(() => visibleLayers.value.length)
const selectedLayer = computed(() => orderedLayers.value.find((layer) => layer.id === selectedId.value) || orderedLayers.value[0] || null)
const activeCycle = computed(() => /^20\d{2}-20\d{2}$/.test(props.cicloEscolar) ? props.cicloEscolar : '2026-2027')
const surfaceStyle = computed(() => ({ aspectRatio: `${design.value.canvas.width} / ${design.value.canvas.height}` }))
const previewSvg = computed(() => previewMarbeteSvg(props.baseSvg, design.value, props.themeKey, { ...MARBETE_REPRESENTATIVE_VALUES, ciclo: activeCycle.value })
  .replace(/(href|xlink:href)="\/(?!\/)/g, `$1="${previewOrigin}/`))

function cloneDesign() {
  return JSON.parse(JSON.stringify(design.value)) as MarbeteSvgDesign
}

function emitNext(next: MarbeteSvgDesign) {
  emit('update:modelValue', normalizeMarbeteSvgDesign(next, props.themeKey))
}

function mutateLayer(id: string, mutation: (layer: MarbeteSvgLayer) => void) {
  const next = cloneDesign()
  const layer = next.layers.find((item) => item.id === id)
  if (!layer) return
  mutation(layer)
  emitNext(next)
}

function canDeleteLayer(id: string) {
  return !createDefaultMarbeteSvgDesign(props.themeKey).layers.some((layer) => layer.id === id)
}

function addLayer(kind: MarbeteSvgLayerKind) {
  const next = cloneDesign()
  const existingIds = new Set(next.layers.map((layer) => layer.id))
  if (kind !== 'cover' && kind !== 'static-image') {
    const preset = next.layers.find((layer) => layer.kind === kind)
    if (preset) {
      preset.visible = true
      selectedId.value = preset.id
      emitNext(next)
      return
    }
  }
  const suffix = Date.now().toString(36)
  const definition = marbeteSvgLayerDefinition(kind)
  const id = existingIds.has(kind) ? `${kind}-${suffix}` : kind
  next.layers.push({
    id,
    kind,
    label: definition.label,
    x: 60,
    y: 60,
    width: kind === 'cover' ? 120 : 140,
    height: kind === 'cover' ? 80 : 120,
    rotation: 0,
    visible: true,
    zIndex: Math.max(0, ...next.layers.map((layer) => layer.zIndex)) + 1,
    fill: '#FFFFFF',
    opacity: 1,
    imageStyle: kind === 'cover' || kind === 'authorized-name' || kind === 'relationship' || kind === 'student-name' || kind === 'school-detail' || kind === 'validity' || kind === 'ciclo-tag' ? undefined : {
      fit: 'cover', focalX: 50, focalY: 50, borderRadius: 0, borderWidth: 0, borderColor: '#FFFFFF'
    },
    textStyle: ['authorized-name', 'relationship', 'student-name', 'school-detail', 'validity', 'ciclo-tag'].includes(kind)
      ? { fontSize: 16, fontWeight: 700, color: '#102A43', align: 'center', lineHeight: 1.08 }
      : undefined,
    assetUrl: ''
  })
  selectedId.value = id
  emitNext(next)
}

function removeLayer(id: string) {
  if (!canDeleteLayer(id)) return
  const next = cloneDesign()
  next.layers = next.layers.filter((layer) => layer.id !== id)
  emitNext(next)
}

function toggleVisible(id: string) {
  mutateLayer(id, (layer) => { layer.visible = !layer.visible })
}

function frameStyle(layer: MarbeteSvgLayer) {
  return {
    left: `${layer.x / design.value.canvas.width * 100}%`,
    top: `${layer.y / design.value.canvas.height * 100}%`,
    width: `${layer.width / design.value.canvas.width * 100}%`,
    height: `${layer.height / design.value.canvas.height * 100}%`,
    transform: `rotate(${layer.rotation}deg)`
  }
}

function layerIcon(kind: MarbeteSvgLayerKind) {
  if (kind === 'cover') return '▥'
  if (kind === 'static-image') return '▣'
  if (String(kind).includes('photo')) return '◉'
  if (kind === 'qr') return '▦'
  if (kind === 'ciclo-tag') return '◇'
  return 'T'
}

function layerSubtitle(layer: MarbeteSvgLayer) {
  return marbeteSvgLayerDefinition(layer.kind).help
}

type PointerState = {
  id: string
  type: 'move' | 'resize'
  startX: number
  startY: number
  initial: MarbeteSvgLayer
}
let pointerState: PointerState | null = null

function startPointer(event: PointerEvent, layer: MarbeteSvgLayer, type: 'move' | 'resize') {
  event.preventDefault()
  selectedId.value = layer.id
  pointerState = { id: layer.id, type, startX: event.clientX, startY: event.clientY, initial: JSON.parse(JSON.stringify(layer)) }
}

function pointerMove(event: PointerEvent) {
  if (!pointerState || !canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const deltaX = (event.clientX - pointerState.startX) / rect.width * design.value.canvas.width
  const deltaY = (event.clientY - pointerState.startY) / rect.height * design.value.canvas.height
  mutateLayer(pointerState.id, (layer) => {
    if (pointerState?.type === 'move') {
      layer.x = Math.max(-layer.width * 0.8, Math.min(design.value.canvas.width - layer.width * 0.2, pointerState!.initial.x + deltaX))
      layer.y = Math.max(-layer.height * 0.8, Math.min(design.value.canvas.height - layer.height * 0.2, pointerState!.initial.y + deltaY))
    } else {
      layer.width = Math.max(12, pointerState!.initial.width + deltaX)
      layer.height = Math.max(12, pointerState!.initial.height + deltaY)
    }
  })
}

function pointerUp() {
  pointerState = null
}

onMounted(() => {
  window.addEventListener('pointermove', pointerMove)
  window.addEventListener('pointerup', pointerUp)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', pointerMove)
  window.removeEventListener('pointerup', pointerUp)
})

function nudgeLayer(event: KeyboardEvent, id: string) {
  const directions: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
  const direction = directions[event.key]
  if (!direction) return
  event.preventDefault()
  const step = event.shiftKey ? 10 : 1
  mutateLayer(id, (layer) => {
    layer.x += direction[0] * step
    layer.y += direction[1] * step
  })
}

function numberField(field: 'x' | 'y' | 'width' | 'height' | 'rotation' | 'zIndex' | 'opacity', event: Event) {
  if (!selectedLayer.value) return
  const value = Number((event.target as HTMLInputElement).value)
  mutateLayer(selectedLayer.value.id, (layer) => {
    if (field === 'opacity') layer.opacity = value
    else layer[field] = value as never
  })
}

function stringField(field: 'fill', event: Event) {
  if (!selectedLayer.value) return
  const value = (event.target as HTMLInputElement).value
  mutateLayer(selectedLayer.value.id, (layer) => { layer[field] = value })
}

function textNumberField(field: 'fontSize' | 'fontWeight', event: Event) {
  if (!selectedLayer.value?.textStyle) return
  const value = Number((event.target as HTMLInputElement | HTMLSelectElement).value)
  mutateLayer(selectedLayer.value.id, (layer) => {
    if (!layer.textStyle) return
    if (field === 'fontWeight') layer.textStyle.fontWeight = value as 500 | 600 | 700 | 800
    else layer.textStyle.fontSize = value
  })
}

function textStringField(field: 'color', event: Event) {
  if (!selectedLayer.value?.textStyle) return
  const value = (event.target as HTMLInputElement).value
  mutateLayer(selectedLayer.value.id, (layer) => { if (layer.textStyle) layer.textStyle[field] = value })
}

function setTextAlign(value: 'left' | 'center' | 'right') {
  if (!selectedLayer.value?.textStyle) return
  mutateLayer(selectedLayer.value.id, (layer) => { if (layer.textStyle) layer.textStyle.align = value })
}

function setUppercase(event: Event) {
  if (!selectedLayer.value?.textStyle) return
  const value = (event.target as HTMLInputElement).checked
  mutateLayer(selectedLayer.value.id, (layer) => { if (layer.textStyle) layer.textStyle.uppercase = value })
}

function imageStringField(field: 'fit' | 'borderColor', event: Event) {
  if (!selectedLayer.value?.imageStyle) return
  const value = (event.target as HTMLInputElement | HTMLSelectElement).value
  mutateLayer(selectedLayer.value.id, (layer) => {
    if (!layer.imageStyle) return
    if (field === 'fit') layer.imageStyle.fit = value === 'contain' ? 'contain' : 'cover'
    else layer.imageStyle.borderColor = value
  })
}

function imageNumberField(field: 'focalX' | 'focalY' | 'borderRadius' | 'borderWidth', event: Event) {
  if (!selectedLayer.value?.imageStyle) return
  const value = Number((event.target as HTMLInputElement).value)
  mutateLayer(selectedLayer.value.id, (layer) => { if (layer.imageStyle) layer.imageStyle[field] = value })
}

function alignSelected(direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
  if (!selectedLayer.value) return
  mutateLayer(selectedLayer.value.id, (layer) => {
    if (direction === 'left') layer.x = 0
    if (direction === 'center') layer.x = (design.value.canvas.width - layer.width) / 2
    if (direction === 'right') layer.x = design.value.canvas.width - layer.width
    if (direction === 'top') layer.y = 0
    if (direction === 'middle') layer.y = (design.value.canvas.height - layer.height) / 2
    if (direction === 'bottom') layer.y = design.value.canvas.height - layer.height
  })
}

function resetSelected() {
  if (!selectedLayer.value) return
  const defaultLayer = createDefaultMarbeteSvgDesign(props.themeKey).layers.find((layer) => layer.id === selectedLayer.value?.id)
  if (!defaultLayer) return
  const next = cloneDesign()
  const index = next.layers.findIndex((layer) => layer.id === selectedLayer.value?.id)
  next.layers.splice(index, 1, defaultLayer)
  emitNext(next)
}

function selectStaticImage(event: Event) {
  if (!selectedLayer.value || selectedLayer.value.kind !== 'static-image') return
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.addEventListener('load', () => {
    mutateLayer(selectedLayer.value!.id, (layer) => {
      layer.assetUrl = String(reader.result || '')
    })
  }, { once: true })
  reader.readAsDataURL(file)
}

function round(value: number) {
  return Math.round(Number(value) * 10) / 10
}
</script>

<style scoped>
.svg-editor {
  background: #f7f9fc;
  border: 1px solid #dce4ee;
  border-radius: 22px;
  box-shadow: 0 18px 48px rgba(32, 52, 76, .08);
  overflow: hidden;
}
.editor-topbar {
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e4eaf1;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 20px;
}
.editor-topbar h2,
.editor-topbar p { margin: 0; }
.editor-topbar h2 { font-size: 1.15rem; }
.editor-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.mini-btn {
  background: #eef4f8;
  border: 1px solid #d7e2eb;
  border-radius: 10px;
  color: #294863;
  cursor: pointer;
  font-weight: 700;
  min-height: 38px;
  padding: 0 12px;
}
.editor-grid {
  display: grid;
  grid-template-columns: minmax(250px, .75fr) minmax(480px, 1.5fr) minmax(250px, .85fr);
  min-height: 760px;
}
.layer-rail,
.property-panel { background: #fff; padding: 16px; }
.layer-rail { border-right: 1px solid #e4eaf1; }
.property-panel { border-left: 1px solid #e4eaf1; }
.rail-heading,
.property-heading,
.preview-meta {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.rail-heading > div,
.property-heading > div { display: grid; gap: 2px; }
.rail-heading span,
.property-heading span { color: #708095; font-size: .68rem; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }
.layer-list { display: grid; gap: 6px; margin-top: 12px; }
.layer-list article { border: 1px solid #e1e7ee; border-radius: 13px; display: grid; overflow: hidden; }
.layer-list article.selected { border-color: #4d7b9f; box-shadow: 0 0 0 2px rgba(77, 123, 159, .12); }
.layer-list article.hidden { opacity: .62; }
.layer-select {
  align-items: center;
  background: #fff;
  border: 0;
  cursor: pointer;
  display: grid;
  gap: 9px;
  grid-template-columns: 28px minmax(0, 1fr);
  padding: 10px;
  text-align: left;
}
.layer-select strong { color: #23303f; font-size: .8rem; display: block; }
.layer-select small { color: #7b8794; font-size: .67rem; line-height: 1.3; }
.layer-icon { align-items: center; background: #eef4f8; border-radius: 8px; color: #315f7f; display: flex; font-weight: 800; height: 28px; justify-content: center; width: 28px; }
.layer-actions { display: flex; gap: 1px; background: #edf1f5; }
.rail-toggle,
.rail-delete {
  background: #f8fafc;
  border: 0;
  color: #607084;
  cursor: pointer;
  flex: 1;
  font-size: .66rem;
  font-weight: 800;
  padding: 6px 8px;
}
.rail-delete { color: #a14343; }
.preview-column { display: grid; gap: 12px; padding: 18px; }
.preview-meta p,
.preview-meta strong { margin: 0; }
.preview-meta p { align-items: center; color: #607084; display: inline-flex; gap: 8px; font-size: .82rem; font-weight: 700; }
.live-dot { background: #1fa87a; border-radius: 999px; height: 8px; width: 8px; }
.stage-shell {
  align-items: center;
  background: linear-gradient(180deg, #f6f9fc 0%, #edf3f8 100%);
  border: 1px solid #dbe5ef;
  border-radius: 18px;
  display: flex;
  justify-content: center;
  padding: 18px;
}
.stage-canvas {
  background: #fff;
  border: 1px solid #d5dfe8;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(23, 46, 78, .14);
  position: relative;
  width: min(100%, 560px);
}
.svg-stage { height: 100%; left: 0; position: absolute; top: 0; width: 100%; }
.svg-stage :deep(svg) { display: block; height: 100%; width: 100%; }
.layer-frame {
  border: 2px dashed rgba(27, 104, 155, .75);
  box-sizing: border-box;
  cursor: move;
  position: absolute;
}
.layer-frame.selected {
  background: rgba(27, 104, 155, .07);
  border-style: solid;
  box-shadow: 0 0 0 2px rgba(27, 104, 155, .12);
}
.frame-label {
  background: #1c5e8d;
  border-radius: 8px;
  color: #fff;
  font-size: .68rem;
  font-weight: 800;
  left: 6px;
  padding: 3px 7px;
  position: absolute;
  top: 6px;
}
.resize-handle {
  background: #1c5e8d;
  border-radius: 999px;
  bottom: -6px;
  cursor: nwse-resize;
  height: 12px;
  position: absolute;
  right: -6px;
  width: 12px;
}
.visibility-check { align-items: center; display: flex; gap: 8px; font-weight: 700; margin-bottom: 12px; }
fieldset { border: 1px solid #e4eaf1; border-radius: 14px; display: grid; gap: 12px; margin: 0 0 12px; padding: 12px; }
legend { color: #5b6b7f; font-size: .74rem; font-weight: 800; padding: 0 6px; text-transform: uppercase; }
.number-grid { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.number-grid label,
.compact-field,
.range-field,
.color-field { display: grid; gap: 6px; font-size: .8rem; font-weight: 700; }
.number-grid input,
.number-grid select,
.compact-field select,
.range-field input,
.color-field input {
  background: #fff;
  border: 1px solid #d6e0ea;
  border-radius: 10px;
  min-height: 38px;
  padding: 0 10px;
}
.color-field input { padding: 4px; }
.align-grid,
.segmented { background: #edf2f7; border-radius: 12px; display: flex; gap: 3px; padding: 3px; }
.align-grid button,
.segmented button,
.property-heading button {
  background: transparent;
  border: 0;
  border-radius: 9px;
  color: #52606d;
  cursor: pointer;
  font-weight: 700;
  min-height: 34px;
  padding: 7px 11px;
}
.segmented button.active,
.property-heading button:hover,
.align-grid button:hover { background: #fff; box-shadow: 0 2px 8px rgba(31, 46, 61, .12); color: #17324d; }
.background-upload {
  background: #f4f8fb;
  border: 1px dashed #aabccc;
  border-radius: 14px;
  cursor: pointer;
  display: grid;
  gap: 4px;
  padding: 12px;
}
.background-upload input { display: none; }
.background-upload small { color: #6d7b8b; line-height: 1.35; }
.background-upload em { color: #235f85; font-size: .76rem; font-style: normal; font-weight: 800; margin-top: 3px; }
@media (max-width: 1180px) {
  .editor-grid { grid-template-columns: 1fr; }
  .property-panel { border-left: 0; border-top: 1px solid #e4eaf1; }
  .layer-rail { border-right: 0; border-bottom: 1px solid #e4eaf1; }
}
</style>
