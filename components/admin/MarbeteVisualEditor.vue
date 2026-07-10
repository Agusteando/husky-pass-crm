<template>
  <section class="visual-editor" data-product-panel="marbete-visual-editor">
    <header class="editor-topbar">
      <div>
        <p class="eyebrow">Editor visual</p>
        <h2>Diseña el gafete, no el SVG</h2>
        <p>Trabaja solo con los elementos que usa Husky Pass. La hoja de impresión se genera automáticamente.</p>
      </div>
      <div class="preview-switch" aria-label="Tipo de vista">
        <button type="button" :class="{ active: previewMode === 'card' }" @click="previewMode = 'card'">Gafete</button>
        <button type="button" :class="{ active: previewMode === 'print' }" @click="previewMode = 'print'">Hoja carta</button>
      </div>
    </header>

    <div class="editor-grid">
      <aside class="element-rail" aria-label="Elementos del marbete">
        <div class="rail-heading">
          <div>
            <span>Paso 1</span>
            <strong>Contenido</strong>
          </div>
          <small>{{ visibleCount }} visibles</small>
        </div>

        <div class="element-list">
          <article v-for="element in design.elements" :key="element.id" :class="{ selected: element.id === selectedId, hidden: !element.visible }">
            <button class="element-select" type="button" @click="selectedId = element.id">
              <span class="element-icon">{{ elementIcon(element.kind) }}</span>
              <span><strong>{{ element.label }}</strong><small>{{ elementHelp(element.kind) }}</small></span>
            </button>
            <button class="visibility-toggle" type="button" :aria-label="element.visible ? `Ocultar ${element.label}` : `Mostrar ${element.label}`" @click="toggleVisible(element.id)">
              {{ element.visible ? 'Visible' : 'Oculto' }}
            </button>
          </article>
        </div>

        <label class="background-upload">
          <span>Paso 2</span>
          <strong>Arte de fondo</strong>
          <small>PNG, JPG o WebP. Se recorta al área imprimible.</small>
          <input type="file" accept="image/png,image/jpeg,image/webp" data-diagnostic-field="marbete-artwork" @change="selectArtwork" />
          <em>{{ artworkName || (design.background.url ? 'Fondo cargado' : 'Seleccionar archivo') }}</em>
        </label>
        <label class="compact-field">
          Ajuste del fondo
          <select :value="design.background.fit" @change="updateBackgroundFit">
            <option value="cover">Llenar el gafete</option>
            <option value="contain">Mostrar completo</option>
          </select>
        </label>
      </aside>

      <main class="canvas-column">
        <div class="canvas-toolbar">
          <label>
            Datos de ejemplo
            <select v-model="sampleMode">
              <option value="long">Nombres largos</option>
              <option value="regular">Datos habituales</option>
            </select>
          </label>
          <p><span class="live-dot"></span> El texto del ciclo se genera en vivo: <strong>{{ activeCycle }}</strong></p>
        </div>

        <div class="canvas-stage" :class="`mode-${previewMode}`">
          <div v-if="previewMode === 'card'" ref="canvasRef" class="card-canvas" data-diagnostic-preview="marbete-card">
            <div class="svg-surface" role="img" aria-label="Vista previa editable del marbete" v-html="previewSvg"></div>
            <div
              v-for="element in visibleElements"
              :key="element.id"
              class="element-frame"
              :class="{ selected: element.id === selectedId }"
              :style="frameStyle(element)"
              role="button"
              tabindex="0"
              :aria-label="`Mover ${element.label}`"
              @pointerdown="startPointer($event, element, 'move')"
              @keydown="nudgeElement($event, element.id)"
              @click.stop="selectedId = element.id"
            >
              <span v-if="element.id === selectedId" class="frame-label">{{ element.label }}</span>
              <span v-if="element.id === selectedId" class="resize-handle" aria-hidden="true" @pointerdown.stop="startPointer($event, element, 'resize')"></span>
            </div>
          </div>
          <div v-else class="print-preview svg-surface" role="img" aria-label="Vista previa exacta en hoja carta" data-diagnostic-preview="marbete-print" v-html="previewSvg"></div>
        </div>
        <p class="canvas-hint">{{ previewMode === 'card' ? 'Arrastra un elemento para moverlo. Usa el punto inferior para cambiar su tamaño.' : 'Esta es la composición exacta que se exportará a SVG y PDF.' }}</p>
      </main>

      <aside class="property-panel" aria-label="Propiedades del elemento">
        <template v-if="selectedElement">
          <div class="property-heading">
            <div>
              <span>Paso 3</span>
              <strong>{{ selectedElement.label }}</strong>
            </div>
            <button type="button" @click="resetSelected">Restablecer</button>
          </div>

          <label class="visibility-check">
            <input type="checkbox" :checked="selectedElement.visible" @change="toggleVisible(selectedElement.id)" />
            Mostrar este elemento
          </label>

          <fieldset>
            <legend>Posición y tamaño</legend>
            <div class="number-grid">
              <label>X <input type="number" :value="round(selectedElement.x)" @input="numberField('x', $event)" /></label>
              <label>Y <input type="number" :value="round(selectedElement.y)" @input="numberField('y', $event)" /></label>
              <label>Ancho <input type="number" min="24" :value="round(selectedElement.width)" @input="numberField('width', $event)" /></label>
              <label>Alto <input type="number" min="20" :value="round(selectedElement.height)" @input="numberField('height', $event)" /></label>
            </div>
            <div class="align-grid" aria-label="Alinear en el gafete">
              <button type="button" title="Izquierda" @click="alignSelected('left')">↤</button>
              <button type="button" title="Centrar horizontal" @click="alignSelected('center')">↔</button>
              <button type="button" title="Derecha" @click="alignSelected('right')">↦</button>
              <button type="button" title="Arriba" @click="alignSelected('top')">↥</button>
              <button type="button" title="Centrar vertical" @click="alignSelected('middle')">↕</button>
              <button type="button" title="Abajo" @click="alignSelected('bottom')">↧</button>
            </div>
            <label class="range-field">
              <span>Rotación <strong>{{ round(selectedElement.rotation) }}°</strong></span>
              <input type="range" min="-180" max="180" step="1" :value="selectedElement.rotation" @input="numberField('rotation', $event)" />
            </label>
          </fieldset>

          <fieldset v-if="selectedElement.textStyle">
            <legend>Tipografía</legend>
            <div class="number-grid">
              <label>Tamaño <input type="number" min="8" max="64" :value="selectedElement.textStyle.fontSize" @input="textNumberField('fontSize', $event)" /></label>
              <label>Peso
                <select :value="selectedElement.textStyle.fontWeight" @change="textNumberField('fontWeight', $event)">
                  <option :value="500">Medio</option><option :value="600">Semibold</option><option :value="700">Negrita</option><option :value="800">Extra</option>
                </select>
              </label>
            </div>
            <label class="color-field">Color <input type="color" :value="selectedElement.textStyle.color" @input="textStringField('color', $event)" /></label>
            <div class="segmented" aria-label="Alineación de texto">
              <button v-for="align in textAlignments" :key="align.value" type="button" :class="{ active: selectedElement.textStyle.align === align.value }" @click="setTextAlign(align.value)">{{ align.label }}</button>
            </div>
            <label class="visibility-check"><input type="checkbox" :checked="selectedElement.textStyle.uppercase" @change="setUppercase" /> Mayúsculas</label>
            <p v-if="selectedElement.kind === 'ciclo-tag'" class="locked-note">La etiqueta conserva el estilo aprobado: título negro y ciclo blanco con sombra.</p>
          </fieldset>

          <fieldset v-if="selectedElement.imageStyle">
            <legend>Imagen y recorte</legend>
            <label class="compact-field">Encuadre
              <select :value="selectedElement.imageStyle.fit" @change="imageStringField('fit', $event)">
                <option value="cover">Llenar y recortar</option>
                <option value="contain">Mostrar completa</option>
              </select>
            </label>
            <label class="range-field"><span>Foco horizontal <strong>{{ round(selectedElement.imageStyle.focalX) }}%</strong></span><input type="range" min="0" max="100" :value="selectedElement.imageStyle.focalX" @input="imageNumberField('focalX', $event)" /></label>
            <label class="range-field"><span>Foco vertical <strong>{{ round(selectedElement.imageStyle.focalY) }}%</strong></span><input type="range" min="0" max="100" :value="selectedElement.imageStyle.focalY" @input="imageNumberField('focalY', $event)" /></label>
            <div class="number-grid">
              <label>Esquinas <input type="number" min="0" max="80" :value="selectedElement.imageStyle.borderRadius" @input="imageNumberField('borderRadius', $event)" /></label>
              <label>Borde <input type="number" min="0" max="16" :value="selectedElement.imageStyle.borderWidth" @input="imageNumberField('borderWidth', $event)" /></label>
            </div>
            <label class="color-field">Color de borde <input type="color" :value="selectedElement.imageStyle.borderColor" @input="imageStringField('borderColor', $event)" /></label>
          </fieldset>
        </template>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRequestURL } from 'nuxt/app'
import type { MarbeteVisualDesign, MarbeteVisualElement, MarbeteVisualElementKind, PersonasThemeKey } from '~/types/daycare'
import {
  MARBETE_CARD_HEIGHT,
  MARBETE_CARD_WIDTH,
  MARBETE_ELEMENT_DEFINITIONS,
  MARBETE_REPRESENTATIVE_VALUES,
  compileMarbeteVisualSvg,
  createDefaultMarbeteVisualDesign,
  normalizeMarbeteVisualDesign
} from '~/utils/marbeteDesigner'

const props = defineProps<{
  modelValue: MarbeteVisualDesign
  cicloEscolar: string
  themeKey: PersonasThemeKey
}>()

const emit = defineEmits<{
  'update:modelValue': [value: MarbeteVisualDesign]
  'artwork-selected': [file: File | null]
}>()

const selectedId = ref('person-photo')
const previewMode = ref<'card' | 'print'>('card')
const sampleMode = ref<'long' | 'regular'>('long')
const canvasRef = ref<HTMLElement | null>(null)
const artworkName = ref('')
const textAlignments = [
  { value: 'left' as const, label: 'Izq.' },
  { value: 'center' as const, label: 'Centro' },
  { value: 'right' as const, label: 'Der.' }
]
const previewOrigin = useRequestURL().origin

const design = computed(() => normalizeMarbeteVisualDesign(props.modelValue, props.themeKey))
const visibleElements = computed(() => design.value.elements.filter((element) => element.visible))
const visibleCount = computed(() => visibleElements.value.length)
const selectedElement = computed(() => design.value.elements.find((element) => element.id === selectedId.value) || design.value.elements[0])
const activeCycle = computed(() => /^20\d{2}-20\d{2}$/.test(props.cicloEscolar) ? props.cicloEscolar : '2026-2027')
const sampleValues = computed(() => ({
  ...MARBETE_REPRESENTATIVE_VALUES,
  ...(sampleMode.value === 'regular' ? {
    fullnameP: 'Sofía López García',
    authorizedPersonName: 'Sofía López García',
    parentesco: 'Tía',
    studentName: 'Valentina Pérez Ramos',
    schoolDetail: '4° C · Plantel PM'
  } : {}),
  ciclo: activeCycle.value
}))
const previewSvg = computed(() => compileMarbeteVisualSvg(design.value, { mode: previewMode.value, values: sampleValues.value })
  .replace(/(href|xlink:href)="\/(?!\/)/g, `$1="${previewOrigin}/`))

watch(() => props.themeKey, () => {
  if (!props.modelValue?.elements?.length) emit('update:modelValue', createDefaultMarbeteVisualDesign(props.themeKey))
})

function cloneDesign() {
  return JSON.parse(JSON.stringify(design.value)) as MarbeteVisualDesign
}

function mutateElement(id: string, mutation: (element: MarbeteVisualElement) => void) {
  const next = cloneDesign()
  const element = next.elements.find((item) => item.id === id)
  if (!element) return
  mutation(element)
  emit('update:modelValue', normalizeMarbeteVisualDesign(next, props.themeKey))
}

function elementHelp(kind: MarbeteVisualElementKind) {
  return MARBETE_ELEMENT_DEFINITIONS.find((item) => item.kind === kind)?.help || ''
}

function elementIcon(kind: MarbeteVisualElementKind) {
  if (kind.includes('photo')) return '◉'
  if (kind === 'qr') return '▦'
  if (kind === 'ciclo-tag') return '◇'
  return 'T'
}

function toggleVisible(id: string) {
  mutateElement(id, (element) => { element.visible = !element.visible })
}

function updateBackgroundFit(event: Event) {
  const next = cloneDesign()
  next.background.fit = (event.target as HTMLSelectElement).value === 'contain' ? 'contain' : 'cover'
  emit('update:modelValue', next)
}

function selectArtwork(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0] || null
  artworkName.value = file?.name || ''
  emit('artwork-selected', file)
  if (!file) return
  const reader = new FileReader()
  reader.addEventListener('load', () => {
    const next = cloneDesign()
    next.background.url = String(reader.result || '')
    emit('update:modelValue', next)
  }, { once: true })
  reader.readAsDataURL(file)
}

function frameStyle(element: MarbeteVisualElement) {
  return {
    left: `${element.x / MARBETE_CARD_WIDTH * 100}%`,
    top: `${element.y / MARBETE_CARD_HEIGHT * 100}%`,
    width: `${element.width / MARBETE_CARD_WIDTH * 100}%`,
    height: `${element.height / MARBETE_CARD_HEIGHT * 100}%`,
    transform: `rotate(${element.rotation}deg)`
  }
}

type PointerState = {
  id: string
  type: 'move' | 'resize'
  startX: number
  startY: number
  initial: MarbeteVisualElement
}
let pointerState: PointerState | null = null

function startPointer(event: PointerEvent, element: MarbeteVisualElement, type: 'move' | 'resize') {
  if (previewMode.value !== 'card') return
  event.preventDefault()
  selectedId.value = element.id
  pointerState = { id: element.id, type, startX: event.clientX, startY: event.clientY, initial: JSON.parse(JSON.stringify(element)) }
}

function pointerMove(event: PointerEvent) {
  if (!pointerState || !canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const deltaX = (event.clientX - pointerState.startX) / rect.width * MARBETE_CARD_WIDTH
  const deltaY = (event.clientY - pointerState.startY) / rect.height * MARBETE_CARD_HEIGHT
  const state = pointerState
  mutateElement(state.id, (element) => {
    if (state.type === 'move') {
      element.x = Math.max(-element.width * 0.8, Math.min(MARBETE_CARD_WIDTH - element.width * 0.2, state.initial.x + deltaX))
      element.y = Math.max(-element.height * 0.8, Math.min(MARBETE_CARD_HEIGHT - element.height * 0.2, state.initial.y + deltaY))
    } else {
      element.width = Math.max(24, Math.min(MARBETE_CARD_WIDTH * 1.5, state.initial.width + deltaX))
      element.height = Math.max(20, Math.min(MARBETE_CARD_HEIGHT * 1.5, state.initial.height + deltaY))
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

function nudgeElement(event: KeyboardEvent, id: string) {
  const directions: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
  const direction = directions[event.key]
  if (!direction) return
  event.preventDefault()
  const step = event.shiftKey ? 10 : 1
  mutateElement(id, (element) => {
    element.x += direction[0] * step
    element.y += direction[1] * step
  })
}

function numberField(field: 'x' | 'y' | 'width' | 'height' | 'rotation', event: Event) {
  if (!selectedElement.value) return
  const value = Number((event.target as HTMLInputElement).value)
  mutateElement(selectedElement.value.id, (element) => { element[field] = value })
}

function textNumberField(field: 'fontSize' | 'fontWeight', event: Event) {
  if (!selectedElement.value?.textStyle) return
  const value = Number((event.target as HTMLInputElement | HTMLSelectElement).value)
  mutateElement(selectedElement.value.id, (element) => {
    if (!element.textStyle) return
    if (field === 'fontWeight') element.textStyle.fontWeight = value as 500 | 600 | 700 | 800
    else element.textStyle.fontSize = value
  })
}

function textStringField(field: 'color', event: Event) {
  if (!selectedElement.value?.textStyle) return
  const value = (event.target as HTMLInputElement).value
  mutateElement(selectedElement.value.id, (element) => { if (element.textStyle) element.textStyle[field] = value })
}

function setTextAlign(value: 'left' | 'center' | 'right') {
  if (!selectedElement.value?.textStyle) return
  mutateElement(selectedElement.value.id, (element) => { if (element.textStyle) element.textStyle.align = value })
}

function setUppercase(event: Event) {
  if (!selectedElement.value?.textStyle) return
  const value = (event.target as HTMLInputElement).checked
  mutateElement(selectedElement.value.id, (element) => { if (element.textStyle) element.textStyle.uppercase = value })
}

function imageStringField(field: 'fit' | 'borderColor', event: Event) {
  if (!selectedElement.value?.imageStyle) return
  const value = (event.target as HTMLInputElement | HTMLSelectElement).value
  mutateElement(selectedElement.value.id, (element) => {
    if (!element.imageStyle) return
    if (field === 'fit') element.imageStyle.fit = value === 'contain' ? 'contain' : 'cover'
    else element.imageStyle.borderColor = value
  })
}

function imageNumberField(field: 'focalX' | 'focalY' | 'borderRadius' | 'borderWidth', event: Event) {
  if (!selectedElement.value?.imageStyle) return
  const value = Number((event.target as HTMLInputElement).value)
  mutateElement(selectedElement.value.id, (element) => { if (element.imageStyle) element.imageStyle[field] = value })
}

function alignSelected(direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
  if (!selectedElement.value) return
  mutateElement(selectedElement.value.id, (element) => {
    if (direction === 'left') element.x = 0
    if (direction === 'center') element.x = (MARBETE_CARD_WIDTH - element.width) / 2
    if (direction === 'right') element.x = MARBETE_CARD_WIDTH - element.width
    if (direction === 'top') element.y = 0
    if (direction === 'middle') element.y = (MARBETE_CARD_HEIGHT - element.height) / 2
    if (direction === 'bottom') element.y = MARBETE_CARD_HEIGHT - element.height
  })
}

function resetSelected() {
  if (!selectedElement.value) return
  const defaultElement = createDefaultMarbeteVisualDesign(props.themeKey).elements.find((element) => element.kind === selectedElement.value?.kind)
  if (!defaultElement) return
  const next = cloneDesign()
  const index = next.elements.findIndex((element) => element.id === selectedElement.value?.id)
  next.elements.splice(index, 1, defaultElement)
  emit('update:modelValue', next)
}

function round(value: number) {
  return Math.round(Number(value) * 10) / 10
}
</script>

<style scoped>
.visual-editor {
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
.editor-topbar p {
  margin: 0;
}

.editor-topbar h2 {
  font-size: 1.2rem;
}

.editor-topbar > div > p:last-child {
  color: #697789;
  font-size: .85rem;
  margin-top: 4px;
}

.preview-switch,
.segmented {
  background: #edf2f7;
  border-radius: 12px;
  display: flex;
  gap: 3px;
  padding: 3px;
}

.preview-switch button,
.segmented button {
  background: transparent;
  border: 0;
  border-radius: 9px;
  color: #52606d;
  cursor: pointer;
  font-weight: 700;
  min-height: 34px;
  padding: 7px 11px;
}

.preview-switch button.active,
.segmented button.active {
  background: #fff;
  box-shadow: 0 2px 8px rgba(31, 46, 61, .12);
  color: #17324d;
}

.editor-grid {
  display: grid;
  grid-template-columns: minmax(210px, .72fr) minmax(430px, 1.55fr) minmax(230px, .82fr);
  min-height: 720px;
}

.element-rail,
.property-panel {
  background: #fff;
  padding: 16px;
}

.element-rail {
  border-right: 1px solid #e4eaf1;
}

.property-panel {
  border-left: 1px solid #e4eaf1;
}

.rail-heading,
.property-heading {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.rail-heading > div,
.property-heading > div {
  display: grid;
  gap: 2px;
}

.rail-heading span,
.property-heading span,
.background-upload > span {
  color: #708095;
  font-size: .68rem;
  font-weight: 800;
  letter-spacing: .09em;
  text-transform: uppercase;
}

.rail-heading small {
  color: #708095;
}

.element-list {
  display: grid;
  gap: 6px;
}

.element-list article {
  border: 1px solid #e1e7ee;
  border-radius: 13px;
  display: grid;
  overflow: hidden;
}

.element-list article.selected {
  border-color: #4d7b9f;
  box-shadow: 0 0 0 2px rgba(77, 123, 159, .12);
}

.element-list article.hidden {
  opacity: .62;
}

.element-select {
  align-items: center;
  background: #fff;
  border: 0;
  cursor: pointer;
  display: grid;
  gap: 9px;
  grid-template-columns: 28px minmax(0, 1fr);
  padding: 9px;
  text-align: left;
}

.element-select > span:last-child {
  display: grid;
  min-width: 0;
}

.element-select strong {
  color: #23303f;
  font-size: .78rem;
}

.element-select small {
  color: #7b8794;
  font-size: .67rem;
  line-height: 1.25;
}

.element-icon {
  align-items: center;
  background: #eef4f8;
  border-radius: 8px;
  color: #315f7f;
  display: flex;
  font-weight: 800;
  height: 28px;
  justify-content: center;
  width: 28px;
}

.visibility-toggle {
  background: #f8fafc;
  border: 0;
  border-top: 1px solid #edf1f5;
  color: #607084;
  cursor: pointer;
  font-size: .66rem;
  font-weight: 800;
  padding: 5px 9px;
  text-align: right;
}

.background-upload {
  background: #f4f8fb;
  border: 1px dashed #aabccc;
  border-radius: 14px;
  cursor: pointer;
  display: grid;
  gap: 4px;
  margin-top: 14px;
  padding: 12px;
}

.background-upload small {
  color: #6d7b8b;
  line-height: 1.35;
}

.background-upload input {
  display: none;
}

.background-upload em {
  color: #235f85;
  font-size: .76rem;
  font-style: normal;
  font-weight: 800;
  margin-top: 3px;
}

.canvas-column {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-width: 0;
  padding: 16px;
}

.canvas-toolbar {
  align-items: end;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 12px;
}

.canvas-toolbar label,
.compact-field {
  color: #526174;
  display: grid;
  font-size: .73rem;
  font-weight: 700;
  gap: 5px;
}

.canvas-toolbar select,
.compact-field select,
.number-grid input,
.number-grid select {
  background: #fff;
  border: 1px solid #ccd7e3;
  border-radius: 9px;
  min-height: 34px;
  padding: 6px 8px;
}

.canvas-toolbar p {
  color: #637286;
  font-size: .75rem;
  margin: 0;
}

.live-dot {
  background: #3d9b65;
  border-radius: 50%;
  display: inline-block;
  height: 7px;
  margin-right: 4px;
  width: 7px;
}

.canvas-stage {
  align-items: center;
  background: #e9eef5;
  background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
  background-size: 16px 16px;
  border: 1px solid #d6dee8;
  border-radius: 18px;
  display: flex;
  justify-content: center;
  min-height: 620px;
  overflow: auto;
  padding: 20px;
}

.card-canvas {
  aspect-ratio: 420 / 640;
  background: #fff;
  box-shadow: 0 18px 44px rgba(24, 42, 64, .2);
  max-height: 640px;
  position: relative;
  width: min(100%, 420px);
}

.svg-surface,
.print-preview {
  display: block;
  height: 100%;
  width: 100%;
}

.svg-surface :deep(svg) {
  display: block;
  height: 100%;
  width: 100%;
}

.print-preview {
  background: #fff;
  box-shadow: 0 18px 44px rgba(24, 42, 64, .18);
  height: auto;
  max-width: 560px;
}

.element-frame {
  border: 1px dashed transparent;
  box-sizing: border-box;
  cursor: move;
  position: absolute;
  transform-origin: center;
}

.element-frame:hover,
.element-frame.selected {
  background: rgba(32, 111, 162, .05);
  border-color: #2073a6;
  outline: 1px solid rgba(255, 255, 255, .7);
}

.frame-label {
  background: #17658f;
  border-radius: 6px 6px 6px 0;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  left: -1px;
  max-width: 160px;
  overflow: hidden;
  padding: 3px 5px;
  position: absolute;
  text-overflow: ellipsis;
  top: -22px;
  white-space: nowrap;
}

.resize-handle {
  background: #fff;
  border: 3px solid #17658f;
  border-radius: 50%;
  bottom: -7px;
  cursor: nwse-resize;
  height: 13px;
  position: absolute;
  right: -7px;
  width: 13px;
}

.canvas-hint {
  color: #718096;
  font-size: .75rem;
  margin: 9px 0 0;
  text-align: center;
}

.property-heading button {
  background: transparent;
  border: 0;
  color: #286d95;
  cursor: pointer;
  font-size: .72rem;
  font-weight: 800;
}

.visibility-check {
  align-items: center;
  color: #425466;
  display: flex;
  font-size: .78rem;
  font-weight: 700;
  gap: 8px;
  margin-bottom: 12px;
}

fieldset {
  border: 0;
  border-top: 1px solid #e4eaf1;
  display: grid;
  gap: 11px;
  margin: 0;
  padding: 14px 0;
}

legend {
  color: #263849;
  font-size: .78rem;
  font-weight: 800;
  padding: 0 7px 0 0;
}

.number-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 1fr;
}

.number-grid label,
.color-field {
  color: #667588;
  display: grid;
  font-size: .68rem;
  font-weight: 700;
  gap: 4px;
}

.align-grid {
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(6, 1fr);
}

.align-grid button {
  background: #f1f5f9;
  border: 1px solid #d7e0e9;
  border-radius: 8px;
  color: #38546b;
  cursor: pointer;
  min-height: 32px;
}

.range-field {
  display: grid;
  gap: 5px;
}

.range-field span {
  color: #647386;
  display: flex;
  font-size: .7rem;
  justify-content: space-between;
}

.range-field input {
  accent-color: #286d95;
  width: 100%;
}

.color-field {
  align-items: center;
  grid-template-columns: minmax(0, 1fr) 48px;
}

.color-field input {
  border: 1px solid #cbd6e1;
  border-radius: 8px;
  height: 32px;
  padding: 2px;
  width: 48px;
}

.compact-field {
  margin-top: 10px;
}

.locked-note {
  background: #eef6fb;
  border-radius: 9px;
  color: #3e6078;
  font-size: .68rem;
  line-height: 1.4;
  margin: 0;
  padding: 8px;
}

@media (max-width: 1280px) {
  .editor-grid {
    grid-template-columns: 220px minmax(390px, 1fr);
  }

  .property-panel {
    border-left: 0;
    border-top: 1px solid #e4eaf1;
    grid-column: 1 / -1;
  }
}

@media (max-width: 820px) {
  .editor-topbar,
  .canvas-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .editor-grid {
    grid-template-columns: 1fr;
  }

  .element-rail,
  .property-panel {
    border: 0;
    border-bottom: 1px solid #e4eaf1;
  }

  .canvas-stage {
    min-height: 520px;
    padding: 12px;
  }
}
</style>
