<template>
  <section class="svg-editor" data-product-panel="marbete-svg-editor">
    <header class="editor-topbar">
      <div>
        <p class="eyebrow">Editor</p>
        <h2>Elementos del marbete</h2>
      </div>
      <div class="add-control">
        <select v-model="addKind" aria-label="Elemento para agregar">
          <option v-for="option in availableAddOptions" :key="option.kind" :value="option.kind">{{ option.label }}</option>
        </select>
        <button class="mini-btn" type="button" :disabled="!addKind" @click="addLayer(addKind)">Agregar</button>
      </div>
    </header>

    <div class="editor-grid">
      <aside class="layer-rail" aria-label="Elementos del marbete">
        <div class="rail-heading">
          <strong>Elementos</strong>
          <small>{{ activeLayers.length }}</small>
        </div>

        <div class="layer-list">
          <article
            v-for="layer in orderedLayers"
            :key="layer.id"
            :class="{ selected: layer.id === selectedId, hidden: !layer.visible }"
          >
            <button class="layer-select" type="button" @click="selectedId = layer.id">
              <span class="layer-icon" aria-hidden="true">{{ layerIcon(layer.kind) }}</span>
              <span class="layer-name">
                <strong>{{ layer.label }}</strong>
              </span>
            </button>
            <div v-if="layer.kind !== 'qr'" class="layer-actions">
              <button type="button" @click="toggleVisible(layer.id)">{{ layer.visible ? 'Ocultar' : 'Mostrar' }}</button>
              <button type="button" class="danger" @click="removeLayer(layer.id)">Quitar</button>
            </div>
          </article>
        </div>
      </aside>

      <main class="preview-column">
        <div class="stage-shell">
          <div ref="canvasRef" class="stage-canvas" :style="surfaceStyle">
            <img v-if="basePreviewUrl" class="svg-stage-image" :src="basePreviewUrl" alt="SVG base del marbete" />
            <div v-else-if="previewError" class="svg-stage-error" role="alert">{{ previewError }}</div>
            <div v-else class="svg-stage-loading" role="status" aria-label="Cargando SVG"><span></span></div>

            <div
              v-for="layer in visibleLayers"
              :key="layer.id"
              class="layer-frame"
              :class="[`kind-${layer.kind}`, { selected: layer.id === selectedId }]"
              :style="frameStyle(layer)"
              role="button"
              tabindex="0"
              :aria-label="`Mover ${layer.label}`"
              @pointerdown="startPointer($event, layer, 'move')"
              @keydown="nudgeLayer($event, layer.id)"
              @click.stop="selectedId = layer.id"
            >
              <div class="layer-content" :style="layerContentStyle(layer)">
                <img
                  v-if="layerImageSource(layer)"
                  :src="layerImageSource(layer)"
                  alt=""
                  :style="imageContentStyle(layer)"
                  draggable="false"
                />
                <div v-else-if="layer.kind === 'cover'" class="cover-content"></div>
                <div v-else-if="layer.kind === 'hologram' || layer.kind === 'ciclo-tag'" class="hologram-content">
                  <img :src="MARBETE_HOLOGRAM_URL" alt="" draggable="false" />
                  <span :style="textContentStyle(layer)">
                    <small>CICLO ESCOLAR</small>
                    <strong>{{ activeCycle }}</strong>
                  </span>
                </div>
                <div v-else class="text-content" :style="textContentStyle(layer)">{{ layerText(layer) }}</div>
              </div>

              <span v-if="layer.id === selectedId" class="frame-label">{{ layer.label }}</span>
              <span
                v-if="layer.id === selectedId"
                class="rotate-handle"
                role="button"
                aria-label="Rotar elemento"
                @pointerdown.stop="startPointer($event, layer, 'rotate')"
              ></span>
              <span
                v-if="layer.id === selectedId"
                class="resize-handle"
                role="button"
                aria-label="Cambiar tamaño"
                @pointerdown.stop="startPointer($event, layer, 'resize')"
              ></span>
            </div>
          </div>
        </div>
      </main>

      <aside class="property-panel" aria-label="Propiedades del elemento">
        <template v-if="selectedLayer">
          <div class="property-heading">
            <div>
              <span>Elemento</span>
              <strong>{{ selectedLayer.label }}</strong>
            </div>
            <button type="button" @click="resetSelected">Restablecer</button>
          </div>

          <label v-if="selectedLayer.kind !== 'qr'" class="visibility-check">
            <input type="checkbox" :checked="selectedLayer.visible" @change="toggleVisible(selectedLayer.id)" />
            Visible
          </label>

          <fieldset>
            <legend>Transformación</legend>
            <div class="number-grid">
              <label>X <input type="number" :value="round(selectedLayer.x)" @input="numberField('x', $event)" /></label>
              <label>Y <input type="number" :value="round(selectedLayer.y)" @input="numberField('y', $event)" /></label>
              <label>Ancho <input type="number" min="12" :value="round(selectedLayer.width)" @input="numberField('width', $event)" /></label>
              <label>Alto <input type="number" min="12" :value="round(selectedLayer.height)" @input="numberField('height', $event)" /></label>
            </div>
            <label class="range-field">
              <span>Rotación <strong>{{ round(selectedLayer.rotation) }}°</strong></span>
              <input type="range" min="-180" max="180" step="1" :value="selectedLayer.rotation" @input="numberField('rotation', $event)" />
            </label>
            <label v-if="supportsAspectLock(selectedLayer)" class="visibility-check compact-check">
              <input type="checkbox" :checked="selectedLayer.aspectRatioLocked" @change="toggleAspectLock" />
              Conservar proporción
            </label>
            <div class="align-grid">
              <button type="button" title="Alinear a la izquierda" @click="alignSelected('left')">↤</button>
              <button type="button" title="Centrar horizontalmente" @click="alignSelected('center')">↔</button>
              <button type="button" title="Alinear a la derecha" @click="alignSelected('right')">↦</button>
              <button type="button" title="Alinear arriba" @click="alignSelected('top')">↥</button>
              <button type="button" title="Centrar verticalmente" @click="alignSelected('middle')">↕</button>
              <button type="button" title="Alinear abajo" @click="alignSelected('bottom')">↧</button>
            </div>
            <div class="order-actions">
              <button type="button" @click="moveLayerOrder(-1)">Enviar atrás</button>
              <button type="button" @click="moveLayerOrder(1)">Traer al frente</button>
            </div>
          </fieldset>

          <fieldset v-if="selectedLayer.kind === 'cover'">
            <legend>Cubierta</legend>
            <label class="color-field">Color <input type="color" :value="selectedLayer.fill || '#ffffff'" @input="stringField('fill', $event)" /></label>
            <label class="range-field">
              <span>Opacidad <strong>{{ round((selectedLayer.opacity ?? 1) * 100) }}%</strong></span>
              <input type="range" min="0" max="1" step="0.01" :value="selectedLayer.opacity ?? 1" @input="numberField('opacity', $event)" />
            </label>
          </fieldset>

          <fieldset v-if="selectedLayer.kind === 'static-image'">
            <legend>Imagen</legend>
            <label class="background-upload">
              <strong>{{ selectedLayer.assetUrl ? 'Reemplazar imagen' : 'Seleccionar imagen' }}</strong>
              <input type="file" accept="image/png,image/jpeg,image/webp" @change="selectStaticImage" />
              <em>{{ selectedLayer.assetUrl ? 'Imagen cargada' : 'PNG, JPG o WebP' }}</em>
            </label>
          </fieldset>

          <fieldset v-if="selectedLayer.textStyle">
            <legend>Texto</legend>
            <div class="number-grid">
              <label>Tamaño <input type="number" min="6" max="120" :value="selectedLayer.textStyle.fontSize" @input="textNumberField('fontSize', $event)" /></label>
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
            <label class="visibility-check compact-check"><input type="checkbox" :checked="selectedLayer.textStyle.uppercase" @change="setUppercase" /> Mayúsculas</label>
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
              <label>Esquinas <input type="number" min="0" max="200" :value="selectedLayer.imageStyle.borderRadius" @input="imageNumberField('borderRadius', $event)" /></label>
              <label>Borde <input type="number" min="0" max="40" :value="selectedLayer.imageStyle.borderWidth" @input="imageNumberField('borderWidth', $event)" /></label>
            </div>
            <label class="color-field">Color de borde <input type="color" :value="selectedLayer.imageStyle.borderColor" @input="imageStringField('borderColor', $event)" /></label>
          </fieldset>

          <button v-if="selectedLayer.kind !== 'qr'" class="remove-button" type="button" @click="removeLayer(selectedLayer.id)">Quitar elemento</button>
        </template>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { MarbeteSvgDesign, MarbeteSvgLayer, MarbeteSvgLayerKind, PersonasThemeKey } from '~/types/daycare'
import { MARBETE_HOLOGRAM_URL } from '~/utils/marbeteHologramAsset'
import { MARBETE_REPRESENTATIVE_VALUES } from '~/utils/marbeteDesigner'
import {
  createDefaultMarbeteSvgDesign,
  createMarbeteSvgDesignFromBase,
  marbeteSvgLayerDefinition,
  normalizeMarbeteSvgDesign,
  previewMarbeteBaseSvg
} from '~/utils/marbeteSvgEditor'

const props = defineProps<{
  modelValue: MarbeteSvgDesign
  baseSvg: string
  previewCycle: string
  themeKey: PersonasThemeKey
}>()

const emit = defineEmits<{
  'update:modelValue': [value: MarbeteSvgDesign]
}>()

const canvasRef = ref<HTMLElement | null>(null)
const selectedId = ref('')
const addKind = ref<MarbeteSvgLayerKind>('hologram')
const basePreviewUrl = ref('')
const previewError = ref('')
const canvasScale = ref(1)
let previewObjectUrl = ''
let previewTimer: ReturnType<typeof setTimeout> | null = null
let resizeObserver: ResizeObserver | null = null

const textAlignments = [
  { value: 'left' as const, label: 'Izq.' },
  { value: 'center' as const, label: 'Centro' },
  { value: 'right' as const, label: 'Der.' }
]

const addableKinds: MarbeteSvgLayerKind[] = [
  'hologram',
  'person-photo',
  'student-photo',
  'qr',
  'authorized-surnames',
  'authorized-given-name',
  'authorized-name',
  'relationship',
  'student-name',
  'school-detail',
  'validity',
  'cover',
  'static-image'
]

const design = computed(() => normalizeMarbeteSvgDesign(props.modelValue, props.themeKey, undefined, props.baseSvg))
const activeLayers = computed(() => design.value.layers.filter((layer) => !layer.removed))
const orderedLayers = computed(() => [...activeLayers.value].sort((left, right) => right.zIndex - left.zIndex))
const visibleLayers = computed(() => [...activeLayers.value].filter((layer) => layer.visible).sort((left, right) => left.zIndex - right.zIndex))
const selectedLayer = computed(() => activeLayers.value.find((layer) => layer.id === selectedId.value) || activeLayers.value[0] || null)
const activeCycle = computed(() => /^20\d{2}-20\d{2}$/.test(String(props.previewCycle)) ? props.previewCycle : '2026-2027')
const surfaceStyle = computed(() => ({ aspectRatio: `${design.value.canvas.width} / ${design.value.canvas.height}` }))
const baseLayerSignature = computed(() => design.value.layers.filter((layer) => layer.origin === 'base').map((layer) => `${layer.id}:${layer.kind}`).sort().join('|'))
const availableAddOptions = computed(() => addableKinds
  .filter((kind) => kind === 'cover' || kind === 'static-image' || !activeLayers.value.some((layer) => layer.kind === kind))
  .map((kind) => marbeteSvgLayerDefinition(kind)))

watch(availableAddOptions, (options) => {
  if (!options.some((option) => option.kind === addKind.value)) addKind.value = options[0]?.kind || 'cover'
}, { immediate: true })

watch(activeLayers, (layers) => {
  if (!layers.some((layer) => layer.id === selectedId.value)) selectedId.value = layers[0]?.id || ''
}, { immediate: true })

function safeSvg(value: unknown) {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

function revokePreviewUrl() {
  if (!previewObjectUrl) return
  URL.revokeObjectURL(previewObjectUrl)
  previewObjectUrl = ''
}

function renderBasePreview() {
  if (previewTimer) clearTimeout(previewTimer)
  previewTimer = setTimeout(() => {
    try {
      const svg = previewMarbeteBaseSvg(safeSvg(props.baseSvg), design.value, props.themeKey, {
        ...MARBETE_REPRESENTATIVE_VALUES,
        ciclo: activeCycle.value
      })
      if (!svg.includes('<svg')) throw new Error('El archivo base no contiene un SVG válido.')
      const nextUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
      revokePreviewUrl()
      previewObjectUrl = nextUrl
      basePreviewUrl.value = nextUrl
      previewError.value = ''
    } catch (error) {
      revokePreviewUrl()
      basePreviewUrl.value = ''
      previewError.value = error instanceof Error ? error.message : 'No se pudo mostrar el SVG.'
    }
  }, 40)
}

watch([() => props.baseSvg, () => props.themeKey, baseLayerSignature], renderBasePreview, { immediate: true })

function updateCanvasScale() {
  const width = canvasRef.value?.getBoundingClientRect().width || 0
  canvasScale.value = width > 0 ? width / Math.max(1, design.value.canvas.width) : 1
}

onMounted(() => {
  nextTick(updateCanvasScale)
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(updateCanvasScale)
    if (canvasRef.value) resizeObserver.observe(canvasRef.value)
  }
  window.addEventListener('pointermove', pointerMove)
  window.addEventListener('pointerup', pointerUp)
  window.addEventListener('pointercancel', pointerUp)
})

onBeforeUnmount(() => {
  if (previewTimer) clearTimeout(previewTimer)
  revokePreviewUrl()
  resizeObserver?.disconnect()
  window.removeEventListener('pointermove', pointerMove)
  window.removeEventListener('pointerup', pointerUp)
  window.removeEventListener('pointercancel', pointerUp)
})

function cloneDesign() {
  return JSON.parse(JSON.stringify(design.value)) as MarbeteSvgDesign
}

function emitNext(next: MarbeteSvgDesign) {
  emit('update:modelValue', normalizeMarbeteSvgDesign(next, props.themeKey, design.value.canvas, props.baseSvg))
}

function mutateLayer(id: string, mutation: (layer: MarbeteSvgLayer) => void) {
  const next = cloneDesign()
  const layer = next.layers.find((item) => item.id === id)
  if (!layer) return
  mutation(layer)
  emitNext(next)
}

function addLayer(kind: MarbeteSvgLayerKind) {
  const next = cloneDesign()
  const reusable = next.layers.find((layer) => layer.kind === kind && layer.removed)
  if (reusable && kind !== 'cover' && kind !== 'static-image') {
    reusable.removed = false
    reusable.visible = true
    selectedId.value = reusable.id
    emitNext(next)
    return
  }

  const definition = marbeteSvgLayerDefinition(kind)
  const suffix = Date.now().toString(36)
  const id = next.layers.some((layer) => layer.id === kind) ? `${kind}-${suffix}` : kind
  const isText = ['authorized-surnames', 'authorized-given-name', 'authorized-name', 'relationship', 'student-name', 'school-detail', 'validity'].includes(kind)
  const isImage = ['person-photo', 'student-photo', 'qr', 'static-image'].includes(kind)
  const width = kind === 'hologram' ? 150 : kind === 'cover' ? 130 : isText ? 260 : 130
  const height = kind === 'hologram' ? 108 : kind === 'cover' ? 90 : isText ? 42 : 130
  next.layers.push({
    id,
    kind,
    label: definition.label,
    x: (next.canvas.width - width) / 2,
    y: (next.canvas.height - height) / 2,
    width,
    height,
    rotation: 0,
    visible: true,
    zIndex: Math.max(0, ...next.layers.map((layer) => layer.zIndex)) + 1,
    fill: '#FFFFFF',
    opacity: 1,
    imageStyle: isImage ? {
      fit: kind === 'qr' ? 'contain' : 'cover',
      focalX: 50,
      focalY: 50,
      borderRadius: 0,
      borderWidth: 0,
      borderColor: '#FFFFFF'
    } : undefined,
    textStyle: isText || kind === 'hologram'
      ? { fontSize: kind === 'hologram' ? 14 : 16, fontWeight: 700, color: kind === 'hologram' ? '#263442' : '#424242', align: 'center', lineHeight: 1.08 }
      : undefined,
    assetUrl: '',
    origin: 'overlay',
    removed: false,
    aspectRatioLocked: isImage || kind === 'hologram'
  })
  selectedId.value = id
  emitNext(next)
}

function removeLayer(id: string) {
  mutateLayer(id, (layer) => {
    if (layer.kind === 'qr') return
    layer.visible = false
    layer.removed = true
  })
}

function toggleVisible(id: string) {
  mutateLayer(id, (layer) => {
    if (layer.kind === 'qr') return
    layer.visible = !layer.visible
  })
}

function supportsAspectLock(layer: MarbeteSvgLayer) {
  return Boolean(layer.imageStyle || layer.kind === 'hologram' || layer.kind === 'ciclo-tag' || layer.kind === 'static-image')
}

function toggleAspectLock(event: Event) {
  if (!selectedLayer.value) return
  const checked = (event.target as HTMLInputElement).checked
  mutateLayer(selectedLayer.value.id, (layer) => { layer.aspectRatioLocked = checked })
}

function frameStyle(layer: MarbeteSvgLayer) {
  return {
    left: `${layer.x / design.value.canvas.width * 100}%`,
    top: `${layer.y / design.value.canvas.height * 100}%`,
    width: `${layer.width / design.value.canvas.width * 100}%`,
    height: `${layer.height / design.value.canvas.height * 100}%`,
    transform: `rotate(${layer.rotation}deg)`,
    zIndex: layer.zIndex + 2
  }
}

function layerContentStyle(layer: MarbeteSvgLayer) {
  if (layer.kind !== 'cover') return undefined
  return { background: layer.fill || '#FFFFFF', opacity: layer.opacity ?? 1 }
}

function imageContentStyle(layer: MarbeteSvgLayer) {
  const style = layer.imageStyle
  return {
    objectFit: style?.fit || 'cover',
    objectPosition: `${style?.focalX ?? 50}% ${style?.focalY ?? 50}%`,
    borderRadius: `${(style?.borderRadius || 0) * canvasScale.value}px`,
    border: style?.borderWidth ? `${Math.max(1, style.borderWidth * canvasScale.value)}px solid ${style.borderColor}` : '0'
  }
}

function textContentStyle(layer: MarbeteSvgLayer) {
  const style = layer.textStyle
  return {
    color: style?.color || '#424242',
    fontSize: `${Math.max(6, (style?.fontSize || 16) * canvasScale.value)}px`,
    fontWeight: style?.fontWeight || 600,
    lineHeight: style?.lineHeight || 1.08,
    textAlign: style?.align || 'center',
    justifyContent: style?.align === 'left' ? 'flex-start' : style?.align === 'right' ? 'flex-end' : 'center',
    textTransform: style?.uppercase ? 'uppercase' : 'none'
  }
}

function layerImageSource(layer: MarbeteSvgLayer) {
  if (layer.kind === 'person-photo') return MARBETE_REPRESENTATIVE_VALUES.foto
  if (layer.kind === 'student-photo') return MARBETE_REPRESENTATIVE_VALUES.studentPhoto
  if (layer.kind === 'qr') return MARBETE_REPRESENTATIVE_VALUES.qrImage
  if (layer.kind === 'static-image') return layer.assetUrl || ''
  return ''
}

function layerText(layer: MarbeteSvgLayer) {
  const values: Partial<Record<MarbeteSvgLayerKind, string>> = {
    'authorized-surnames': MARBETE_REPRESENTATIVE_VALUES.authorizedSurnames,
    'authorized-given-name': MARBETE_REPRESENTATIVE_VALUES.nombreP,
    'authorized-name': MARBETE_REPRESENTATIVE_VALUES.fullnameP,
    relationship: MARBETE_REPRESENTATIVE_VALUES.parentesco,
    'student-name': MARBETE_REPRESENTATIVE_VALUES.studentName,
    'school-detail': MARBETE_REPRESENTATIVE_VALUES.schoolDetail,
    validity: MARBETE_REPRESENTATIVE_VALUES.validityLabel
  }
  return values[layer.kind] || layer.label
}

function layerIcon(kind: MarbeteSvgLayerKind) {
  if (kind === 'cover') return '▥'
  if (kind === 'static-image') return '▣'
  if (kind === 'hologram' || kind === 'ciclo-tag') return '◇'
  if (String(kind).includes('photo')) return '◉'
  if (kind === 'qr') return '▦'
  return 'T'
}


type PointerState = {
  id: string
  type: 'move' | 'resize' | 'rotate'
  startX: number
  startY: number
  initial: MarbeteSvgLayer
  centerX: number
  centerY: number
  startAngle: number
}
let pointerState: PointerState | null = null

function startPointer(event: PointerEvent, layer: MarbeteSvgLayer, type: PointerState['type']) {
  event.preventDefault()
  selectedId.value = layer.id
  const rect = canvasRef.value?.getBoundingClientRect()
  const centerX = rect ? rect.left + (layer.x + layer.width / 2) / design.value.canvas.width * rect.width : event.clientX
  const centerY = rect ? rect.top + (layer.y + layer.height / 2) / design.value.canvas.height * rect.height : event.clientY
  pointerState = {
    id: layer.id,
    type,
    startX: event.clientX,
    startY: event.clientY,
    initial: JSON.parse(JSON.stringify(layer)),
    centerX,
    centerY,
    startAngle: Math.atan2(event.clientY - centerY, event.clientX - centerX)
  }
}

function pointerMove(event: PointerEvent) {
  if (!pointerState || !canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  if (!rect.width || !rect.height) return
  const deltaX = (event.clientX - pointerState.startX) / rect.width * design.value.canvas.width
  const deltaY = (event.clientY - pointerState.startY) / rect.height * design.value.canvas.height
  const state = pointerState
  mutateLayer(state.id, (layer) => {
    if (state.type === 'move') {
      layer.x = Math.max(-layer.width * 0.8, Math.min(design.value.canvas.width - layer.width * 0.2, state.initial.x + deltaX))
      layer.y = Math.max(-layer.height * 0.8, Math.min(design.value.canvas.height - layer.height * 0.2, state.initial.y + deltaY))
      return
    }
    if (state.type === 'rotate') {
      const angle = Math.atan2(event.clientY - state.centerY, event.clientX - state.centerX)
      let rotation = state.initial.rotation + (angle - state.startAngle) * 180 / Math.PI
      while (rotation > 180) rotation -= 360
      while (rotation < -180) rotation += 360
      layer.rotation = Math.round(rotation)
      return
    }
    const width = Math.max(12, state.initial.width + deltaX)
    const height = Math.max(12, state.initial.height + deltaY)
    if (state.initial.aspectRatioLocked) {
      const ratio = state.initial.width / Math.max(1, state.initial.height)
      if (Math.abs(deltaX) >= Math.abs(deltaY)) {
        layer.width = width
        layer.height = Math.max(12, width / ratio)
      } else {
        layer.height = height
        layer.width = Math.max(12, height * ratio)
      }
    } else {
      layer.width = width
      layer.height = height
    }
  })
}

function pointerUp() {
  pointerState = null
}

function nudgeLayer(event: KeyboardEvent, id: string) {
  const amount = event.shiftKey ? 10 : 1
  const deltas: Record<string, [number, number]> = {
    ArrowLeft: [-amount, 0],
    ArrowRight: [amount, 0],
    ArrowUp: [0, -amount],
    ArrowDown: [0, amount]
  }
  const delta = deltas[event.key]
  if (!delta) return
  event.preventDefault()
  mutateLayer(id, (layer) => {
    layer.x += delta[0]
    layer.y += delta[1]
  })
}

function numberField(field: 'x' | 'y' | 'width' | 'height' | 'zIndex' | 'rotation' | 'opacity', event: Event) {
  if (!selectedLayer.value) return
  const value = Number((event.target as HTMLInputElement).value)
  if (!Number.isFinite(value)) return
  mutateLayer(selectedLayer.value.id, (layer) => {
    if (field === 'width' || field === 'height') {
      const previousWidth = layer.width
      const previousHeight = layer.height
      layer[field] = Math.max(12, value)
      if (layer.aspectRatioLocked) {
        if (field === 'width') layer.height = Math.max(12, value * previousHeight / Math.max(1, previousWidth))
        else layer.width = Math.max(12, value * previousWidth / Math.max(1, previousHeight))
      }
    } else {
      layer[field] = value
    }
  })
}

function stringField(field: 'fill', event: Event) {
  if (!selectedLayer.value) return
  const value = (event.target as HTMLInputElement).value
  mutateLayer(selectedLayer.value.id, (layer) => { layer[field] = value })
}

function textNumberField(field: 'fontSize' | 'fontWeight', event: Event) {
  if (!selectedLayer.value?.textStyle) return
  const value = Number((event.target as HTMLInputElement).value)
  if (!Number.isFinite(value)) return
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
  const value = (event.target as HTMLSelectElement).value
  mutateLayer(selectedLayer.value.id, (layer) => {
    if (!layer.imageStyle) return
    if (field === 'fit') layer.imageStyle.fit = value === 'contain' ? 'contain' : 'cover'
    else layer.imageStyle.borderColor = value
  })
}

function imageNumberField(field: 'focalX' | 'focalY' | 'borderRadius' | 'borderWidth', event: Event) {
  if (!selectedLayer.value?.imageStyle) return
  const value = Number((event.target as HTMLInputElement).value)
  if (!Number.isFinite(value)) return
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

function moveLayerOrder(direction: -1 | 1) {
  if (!selectedLayer.value) return
  const sorted = [...activeLayers.value].sort((left, right) => left.zIndex - right.zIndex)
  const index = sorted.findIndex((layer) => layer.id === selectedLayer.value?.id)
  const neighbor = sorted[index + direction]
  if (!neighbor) return
  const selectedOrder = selectedLayer.value.zIndex
  const next = cloneDesign()
  const selected = next.layers.find((layer) => layer.id === selectedLayer.value?.id)
  const other = next.layers.find((layer) => layer.id === neighbor.id)
  if (!selected || !other) return
  selected.zIndex = other.zIndex
  other.zIndex = selectedOrder
  emitNext(next)
}

function resetSelected() {
  if (!selectedLayer.value) return
  const defaults = createMarbeteSvgDesignFromBase(props.baseSvg, props.themeKey)
  const defaultLayer = defaults.layers.find((layer) => layer.id === selectedLayer.value?.id)
    || createDefaultMarbeteSvgDesign(props.themeKey, design.value.canvas).layers.find((layer) => layer.kind === selectedLayer.value?.kind)
  if (!defaultLayer) return
  const next = cloneDesign()
  const index = next.layers.findIndex((layer) => layer.id === selectedLayer.value?.id)
  next.layers.splice(index, 1, { ...defaultLayer, id: selectedLayer.value.id, removed: false, visible: true })
  emitNext(next)
}

function selectStaticImage(event: Event) {
  if (!selectedLayer.value || selectedLayer.value.kind !== 'static-image') return
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const selectedLayerId = selectedLayer.value.id
  const reader = new FileReader()
  reader.addEventListener('load', () => {
    mutateLayer(selectedLayerId, (layer) => { layer.assetUrl = typeof reader.result === 'string' ? reader.result : '' })
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
  gap: 18px;
  justify-content: space-between;
  padding: 18px 20px;
}
.editor-topbar h2,
.editor-topbar p { margin: 0; }
.editor-topbar h2 { font-size: 1.15rem; }
.add-control { align-items: center; display: flex; gap: 8px; }
.add-control select {
  background: #fff;
  border: 1px solid #d3dee8;
  border-radius: 10px;
  min-height: 40px;
  padding: 0 10px;
}
.mini-btn {
  background: #1f6f78;
  border: 0;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  font-weight: 800;
  min-height: 40px;
  padding: 0 14px;
}
.mini-btn:disabled { cursor: not-allowed; opacity: .5; }
.editor-grid {
  display: grid;
  grid-template-columns: minmax(230px, .7fr) minmax(500px, 1.55fr) minmax(250px, .85fr);
  min-height: 780px;
}
.layer-rail,
.property-panel { background: #fff; padding: 16px; }
.layer-rail { border-right: 1px solid #e4eaf1; }
.property-panel { border-left: 1px solid #e4eaf1; }
.rail-heading,
.property-heading {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}
.rail-heading small { align-items: center; background: #edf3f7; border-radius: 999px; display: inline-flex; font-size: .7rem; font-weight: 800; height: 24px; justify-content: center; min-width: 24px; }
.property-heading > div { display: grid; gap: 2px; }
.property-heading span { color: #708095; font-size: .68rem; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }
.layer-list { display: grid; gap: 7px; margin-top: 12px; }
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
.layer-name { min-width: 0; }
.layer-name strong { color: #23303f; display: block; font-size: .78rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.layer-icon { align-items: center; background: #eef4f8; border-radius: 8px; color: #315f7f; display: flex; font-weight: 800; height: 28px; justify-content: center; width: 28px; }
.layer-actions { background: #edf1f5; display: flex; gap: 1px; }
.layer-actions button { background: #f8fafc; border: 0; color: #607084; cursor: pointer; flex: 1; font-size: .64rem; font-weight: 800; padding: 6px 8px; }
.layer-actions button.danger { color: #a14343; }
.preview-column { display: grid; padding: 18px; }
.stage-shell {
  align-items: center;
  background: linear-gradient(180deg, #f6f9fc 0%, #edf3f8 100%);
  border: 1px solid #dbe5ef;
  border-radius: 18px;
  display: flex;
  justify-content: center;
  min-height: 680px;
  padding: 18px;
}
.stage-canvas {
  background: #fff;
  border: 1px solid #d5dfe8;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(23, 46, 78, .14);
  position: relative;
  touch-action: none;
  user-select: none;
  width: min(100%, 560px);
}
.svg-stage-image { display: block; height: 100%; left: 0; object-fit: contain; pointer-events: none; position: absolute; top: 0; width: 100%; }
.svg-stage-loading { align-items: center; display: flex; height: 100%; justify-content: center; left: 0; position: absolute; top: 0; width: 100%; }
.svg-stage-loading span { animation: svg-stage-spin .8s linear infinite; border: 3px solid #d7e1e9; border-radius: 999px; border-top-color: #1f6f78; height: 28px; width: 28px; }
@keyframes svg-stage-spin { to { transform: rotate(360deg); } }
.svg-stage-error { align-items: center; color: #8e4c45; display: flex; font-size: .82rem; font-weight: 700; height: 100%; justify-content: center; left: 0; padding: 20px; position: absolute; text-align: center; top: 0; width: 100%; }
.layer-frame {
  border: 1.5px dashed rgba(27, 104, 155, .52);
  box-sizing: border-box;
  cursor: move;
  position: absolute;
  transform-origin: center;
}
.layer-frame.selected { border-style: solid; border-color: #0f6f82; box-shadow: 0 0 0 2px rgba(15, 111, 130, .16); }
.layer-content { height: 100%; overflow: hidden; pointer-events: none; width: 100%; }
.layer-content > img { display: block; height: 100%; width: 100%; }
.text-content { align-items: center; display: flex; height: 100%; overflow: hidden; padding: 2px; width: 100%; }
.cover-content { height: 100%; width: 100%; }
.hologram-content { height: 100%; position: relative; width: 100%; }
.hologram-content > img { display: block; height: 100%; object-fit: contain; width: 100%; }
.hologram-content > span { align-items: center; display: flex; flex-direction: column; height: 100%; justify-content: flex-start !important; left: 0; padding-top: 36%; position: absolute; top: 0; width: 100%; }
.hologram-content small { font-size: .44em; letter-spacing: .04em; line-height: 1; }
.hologram-content strong { font-size: 1em; line-height: 1.05; }
.frame-label { background: #0f6f82; border-radius: 7px; color: #fff; font-size: .64rem; font-weight: 800; left: 5px; max-width: calc(100% - 10px); overflow: hidden; padding: 3px 7px; position: absolute; text-overflow: ellipsis; top: 5px; white-space: nowrap; }
.resize-handle,
.rotate-handle { background: #0f6f82; border: 2px solid #fff; border-radius: 999px; box-shadow: 0 1px 5px rgba(23, 46, 78, .28); height: 14px; position: absolute; width: 14px; }
.resize-handle { bottom: -8px; cursor: nwse-resize; right: -8px; }
.rotate-handle { cursor: grab; left: calc(50% - 7px); top: -24px; }
.rotate-handle::after { background: #0f6f82; content: ''; height: 12px; left: 5px; position: absolute; top: 12px; width: 2px; }
.visibility-check { align-items: center; display: flex; gap: 8px; font-weight: 700; margin-bottom: 12px; }
.compact-check { font-size: .78rem; margin: 0; }
fieldset { border: 1px solid #e4eaf1; border-radius: 14px; display: grid; gap: 12px; margin: 0 0 12px; padding: 12px; }
legend { color: #5b6b7f; font-size: .72rem; font-weight: 800; padding: 0 6px; text-transform: uppercase; }
.number-grid { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.number-grid label,
.compact-field,
.range-field,
.color-field { display: grid; gap: 6px; font-size: .78rem; font-weight: 700; }
.range-field span { display: flex; justify-content: space-between; }
.number-grid input,
.number-grid select,
.compact-field select,
.color-field input { background: #fff; border: 1px solid #d6e0ea; border-radius: 10px; min-height: 38px; padding: 0 10px; width: 100%; }
.range-field input { min-height: auto; padding: 0; width: 100%; }
.color-field input { padding: 4px; }
.align-grid,
.segmented { background: #edf2f7; border-radius: 12px; display: flex; gap: 3px; padding: 3px; }
.align-grid button,
.segmented button,
.property-heading button,
.order-actions button { background: transparent; border: 0; border-radius: 9px; color: #52606d; cursor: pointer; font-weight: 700; min-height: 34px; padding: 7px 9px; }
.align-grid button { flex: 1; }
.segmented button.active,
.property-heading button:hover,
.align-grid button:hover,
.order-actions button:hover { background: #fff; box-shadow: 0 2px 8px rgba(31, 46, 61, .12); color: #17324d; }
.order-actions { display: grid; gap: 6px; grid-template-columns: 1fr 1fr; }
.background-upload { background: #f4f8fb; border: 1px dashed #aabccc; border-radius: 14px; cursor: pointer; display: grid; gap: 4px; padding: 12px; }
.background-upload input { display: none; }
.background-upload em { color: #235f85; font-size: .74rem; font-style: normal; font-weight: 800; }
.remove-button { background: #fff; border: 1px solid #e0bcbc; border-radius: 10px; color: #9a3f3f; cursor: pointer; font-weight: 800; min-height: 40px; width: 100%; }
@media (max-width: 1180px) {
  .editor-grid { grid-template-columns: 1fr; }
  .property-panel { border-left: 0; border-top: 1px solid #e4eaf1; }
  .layer-rail { border-bottom: 1px solid #e4eaf1; border-right: 0; }
  .stage-shell { min-height: 620px; }
}
@media (max-width: 640px) {
  .editor-topbar { align-items: stretch; flex-direction: column; }
  .add-control { display: grid; grid-template-columns: 1fr auto; }
  .preview-column { padding: 10px; }
  .stage-shell { min-height: 500px; padding: 8px; }
}
</style>
