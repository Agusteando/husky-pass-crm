import type {
  MarbeteSvgDesign,
  MarbeteSvgLayer,
  MarbeteSvgLayerKind,
  MarbeteVisualImageStyle,
  MarbeteVisualTextStyle,
  PersonasThemeKey
} from '~/types/daycare'
import {
  MARBETE_ELEMENT_DEFINITIONS,
  MARBETE_PAGE_HEIGHT,
  MARBETE_PAGE_WIDTH,
  MARBETE_REPRESENTATIVE_VALUES,
  renderMarbeteVisualValues
} from '~/utils/marbeteDesigner'
import { resolvePersonasTheme } from '~/utils/personasTheme'

export interface MarbeteSvgLayerDefinition {
  kind: MarbeteSvgLayerKind
  label: string
  help: string
  category: 'dynamic-image' | 'dynamic-text' | 'ciclo' | 'cover' | 'static-image'
}

export const MARBETE_SVG_LAYER_DEFINITIONS: MarbeteSvgLayerDefinition[] = [
  ...MARBETE_ELEMENT_DEFINITIONS.map((item) => ({
    kind: item.kind,
    label: item.label,
    help: item.help,
    category: item.category === 'image' ? 'dynamic-image' as const : item.category === 'text' ? 'dynamic-text' as const : 'ciclo' as const
  })),
  { kind: 'cover', label: 'Zona cubierta', help: 'Tapa una parte del SVG antes de colocar un elemento nuevo.', category: 'cover' },
  { kind: 'static-image', label: 'Imagen', help: 'Coloca un logotipo, holograma o imagen fija.', category: 'static-image' }
]

const tokenValueKey: Partial<Record<MarbeteSvgLayerKind, string>> = {
  'authorized-name': 'fullnameP',
  relationship: 'parentesco',
  'student-name': 'studentName',
  'school-detail': 'schoolDetail',
  validity: 'validityLabel'
}

function defaultTextStyle(fontSize: number, color = '#102A43'): MarbeteVisualTextStyle {
  return {
    fontSize,
    fontWeight: 700,
    color,
    align: 'center',
    lineHeight: 1.08
  }
}

function defaultImageStyle(borderRadius = 16): MarbeteVisualImageStyle {
  return {
    fit: 'cover',
    focalX: 50,
    focalY: 50,
    borderRadius,
    borderWidth: 0,
    borderColor: '#FFFFFF'
  }
}

function escapeXml(value?: string | number | null) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function focalAlign(value: number, min: string, mid: string, max: string) {
  if (value <= 33) return min
  if (value >= 67) return max
  return mid
}

function layerCenter(layer: MarbeteSvgLayer) {
  return {
    x: layer.x + layer.width / 2,
    y: layer.y + layer.height / 2
  }
}

function withTransform(layer: MarbeteSvgLayer, content: string) {
  const center = layerCenter(layer)
  const rotation = Number.isFinite(layer.rotation) ? layer.rotation : 0
  return `<g id="marbete-layer-${escapeXml(layer.id)}" data-marbete-layer-kind="${escapeXml(layer.kind)}" transform="translate(${center.x} ${center.y}) rotate(${rotation})">${content}</g>`
}

function imageLayer(layer: MarbeteSvgLayer, href: string) {
  const style = layer.imageStyle || defaultImageStyle()
  const x = -layer.width / 2
  const y = -layer.height / 2
  const clipId = `clip-${layer.id}`
  const align = `${focalAlign(style.focalX, 'xMin', 'xMid', 'xMax')}${focalAlign(style.focalY, 'YMin', 'YMid', 'YMax')}`
  const preserve = `${align} ${style.fit === 'contain' ? 'meet' : 'slice'}`
  return `<defs><clipPath id="${escapeXml(clipId)}"><rect x="${x}" y="${y}" width="${layer.width}" height="${layer.height}" rx="${style.borderRadius}"/></clipPath></defs>
    <image x="${x}" y="${y}" width="${layer.width}" height="${layer.height}" href="${escapeXml(href)}" xlink:href="${escapeXml(href)}" preserveAspectRatio="${preserve}" clip-path="url(#${escapeXml(clipId)})" overflow="hidden"/>
    ${style.borderWidth > 0 ? `<rect x="${x}" y="${y}" width="${layer.width}" height="${layer.height}" rx="${style.borderRadius}" fill="none" stroke="${escapeXml(style.borderColor)}" stroke-width="${style.borderWidth}"/>` : ''}`
}

function fitTextTemplate(layer: MarbeteSvgLayer, valueKey: string, box?: {
  x: number
  y: number
  width: number
  height: number
  fontSize?: number
  color?: string
  fontWeight?: number
  align?: 'left' | 'center' | 'right'
  lineHeight?: number
  uppercase?: boolean
  shadowColor?: string
}) {
  const style = layer.textStyle || defaultTextStyle(16)
  const target = box || { x: -layer.width / 2, y: -layer.height / 2, width: layer.width, height: layer.height }
  return `<text data-husky-fit-text="${valueKey}" data-husky-x="${target.x}" data-husky-y="${target.y}" data-husky-width="${target.width}" data-husky-height="${target.height}" data-husky-font-size="${target.fontSize || style.fontSize}" data-husky-font-weight="${target.fontWeight || style.fontWeight}" data-husky-color="${target.color || style.color}" data-husky-align="${target.align || style.align}" data-husky-line-height="${target.lineHeight || style.lineHeight}" data-husky-uppercase="${target.uppercase ?? style.uppercase ? '1' : '0'}" data-husky-shadow-color="${target.shadowColor || ''}" font-family="Montserrat, Arial, sans-serif">{{ data.${valueKey} }}</text>`
}

function cicloLayer(layer: MarbeteSvgLayer) {
  const x = -layer.width / 2
  const y = -layer.height / 2
  const style = layer.textStyle || defaultTextStyle(14)
  const radius = Math.max(8, Math.min(layer.height / 2, 18))
  return `<rect x="${x}" y="${y}" width="${layer.width}" height="${layer.height}" rx="${radius}" fill="#142B4A" opacity=".96"/>
    <rect x="${x + 3}" y="${y + 3}" width="${Math.max(0, layer.width - 6)}" height="${Math.max(0, layer.height - 6)}" rx="${Math.max(5, radius - 3)}" fill="none" stroke="#FFFFFF" stroke-opacity=".72" stroke-width="1.5"/>
    <text x="0" y="${y + layer.height * 0.3}" text-anchor="middle" fill="#FFFFFF" font-family="Montserrat, Arial, sans-serif" font-size="${Math.max(7, style.fontSize * 0.45)}" font-weight="700" letter-spacing=".6">CICLO ESCOLAR</text>
    ${fitTextTemplate(layer, 'ciclo', {
      x: x + layer.width * 0.08,
      y: y + layer.height * 0.28,
      width: layer.width * 0.84,
      height: layer.height * 0.56,
      fontSize: style.fontSize,
      color: '#FFFFFF',
      fontWeight: 800,
      align: 'center',
      lineHeight: 1
    })}`
}

function coverLayer(layer: MarbeteSvgLayer) {
  const fill = layer.fill || '#FFFFFF'
  const opacity = typeof layer.opacity === 'number' ? layer.opacity : 1
  const x = -layer.width / 2
  const y = -layer.height / 2
  return `<rect x="${x}" y="${y}" width="${layer.width}" height="${layer.height}" fill="${escapeXml(fill)}" opacity="${opacity}"/>`
}

function markupForLayer(layer: MarbeteSvgLayer) {
  if (!layer.visible) return ''
  if (layer.kind === 'cover') return withTransform(layer, coverLayer(layer))
  if (layer.kind === 'static-image') return withTransform(layer, imageLayer(layer, layer.assetUrl || ''))
  if (layer.kind === 'person-photo') return withTransform(layer, imageLayer(layer, '{{ getTrustedUrl(data.foto) }}'))
  if (layer.kind === 'student-photo') return withTransform(layer, imageLayer(layer, '{{ getTrustedUrl(data.studentPhoto) }}'))
  if (layer.kind === 'qr') return withTransform(layer, imageLayer(layer, '{{ getTrustedUrl(data.qrImage) }}'))
  if (layer.kind === 'ciclo-tag') return withTransform(layer, cicloLayer(layer))
  return withTransform(layer, fitTextTemplate(layer, tokenValueKey[layer.kind] || 'fullnameP'))
}

function parseNumeric(value?: string | null) {
  const number = Number(String(value || '').replace(/[^0-9.-]/g, ''))
  return Number.isFinite(number) && number > 0 ? number : 0
}

export function parseSvgCanvas(svg: string) {
  const match = /viewBox\s*=\s*"\s*[-0-9.]+\s+[-0-9.]+\s+([0-9.]+)\s+([0-9.]+)\s*"/i.exec(svg)
  if (match) {
    return {
      width: parseNumeric(match[1]) || MARBETE_PAGE_WIDTH,
      height: parseNumeric(match[2]) || MARBETE_PAGE_HEIGHT
    }
  }
  const widthMatch = /\bwidth\s*=\s*"([^"]+)"/i.exec(svg)
  const heightMatch = /\bheight\s*=\s*"([^"]+)"/i.exec(svg)
  return {
    width: parseNumeric(widthMatch?.[1]) || MARBETE_PAGE_WIDTH,
    height: parseNumeric(heightMatch?.[1]) || MARBETE_PAGE_HEIGHT
  }
}

function themeBorder(themeKey: PersonasThemeKey) {
  return resolvePersonasTheme({ themeKey }).contrast || '#FFFFFF'
}

function baseDynamicLayers(themeKey: PersonasThemeKey): MarbeteSvgLayer[] {
  const borderColor = themeBorder(themeKey)
  return [
    { id: 'person-photo', kind: 'person-photo', label: 'Foto de persona autorizada', x: 110, y: 112, width: 170, height: 210, rotation: 0, visible: false, zIndex: 10, imageStyle: { ...defaultImageStyle(16), borderColor, borderWidth: 3 } },
    { id: 'student-photo', kind: 'student-photo', label: 'Foto del alumno', x: 325, y: 146, width: 96, height: 116, rotation: 0, visible: false, zIndex: 11, imageStyle: { ...defaultImageStyle(12), borderColor: '#FFFFFF', borderWidth: 2 } },
    { id: 'qr', kind: 'qr', label: 'Código QR', x: 318, y: 493, width: 116, height: 116, rotation: 0, visible: false, zIndex: 12, imageStyle: defaultImageStyle(10) },
    { id: 'authorized-name', kind: 'authorized-name', label: 'Nombre de persona autorizada', x: 82, y: 348, width: 360, height: 52, rotation: 0, visible: false, zIndex: 20, textStyle: defaultTextStyle(19) },
    { id: 'relationship', kind: 'relationship', label: 'Parentesco', x: 120, y: 404, width: 286, height: 30, rotation: 0, visible: false, zIndex: 21, textStyle: defaultTextStyle(15, '#44546A') },
    { id: 'student-name', kind: 'student-name', label: 'Nombre del alumno', x: 82, y: 446, width: 342, height: 42, rotation: 0, visible: false, zIndex: 22, textStyle: defaultTextStyle(16) },
    { id: 'school-detail', kind: 'school-detail', label: 'Detalle escolar', x: 82, y: 490, width: 212, height: 42, rotation: 0, visible: false, zIndex: 23, textStyle: defaultTextStyle(13, '#44546A') },
    { id: 'validity', kind: 'validity', label: 'Vigencia', x: 82, y: 536, width: 210, height: 30, rotation: 0, visible: false, zIndex: 24, textStyle: defaultTextStyle(12, '#44546A') },
    { id: 'ciclo-tag', kind: 'ciclo-tag', label: 'Ciclo escolar', x: 278, y: 76, width: 132, height: 66, rotation: 0, visible: true, zIndex: 30, textStyle: defaultTextStyle(14) }
  ]
}

function normalizeLayer(input: Partial<MarbeteSvgLayer>, fallback: MarbeteSvgLayer): MarbeteSvgLayer {
  return {
    id: String(input.id || fallback.id),
    kind: (input.kind as MarbeteSvgLayerKind) || fallback.kind,
    label: String(input.label || fallback.label),
    x: Number.isFinite(Number(input.x)) ? Number(input.x) : fallback.x,
    y: Number.isFinite(Number(input.y)) ? Number(input.y) : fallback.y,
    width: Math.max(12, Number.isFinite(Number(input.width)) ? Number(input.width) : fallback.width),
    height: Math.max(12, Number.isFinite(Number(input.height)) ? Number(input.height) : fallback.height),
    rotation: Number.isFinite(Number(input.rotation)) ? Number(input.rotation) : fallback.rotation,
    visible: input.visible == null ? fallback.visible : Boolean(input.visible),
    zIndex: Number.isFinite(Number(input.zIndex)) ? Number(input.zIndex) : fallback.zIndex,
    textStyle: input.textStyle ? {
      fontSize: Number(input.textStyle.fontSize || fallback.textStyle?.fontSize || 16),
      fontWeight: (input.textStyle.fontWeight || fallback.textStyle?.fontWeight || 700) as 500 | 600 | 700 | 800,
      color: String(input.textStyle.color || fallback.textStyle?.color || '#102A43'),
      align: input.textStyle.align || fallback.textStyle?.align || 'center',
      lineHeight: Number(input.textStyle.lineHeight || fallback.textStyle?.lineHeight || 1.08),
      uppercase: Boolean(input.textStyle.uppercase)
    } : fallback.textStyle,
    imageStyle: input.imageStyle ? {
      fit: input.imageStyle.fit === 'contain' ? 'contain' : 'cover',
      focalX: Number(input.imageStyle.focalX ?? fallback.imageStyle?.focalX ?? 50),
      focalY: Number(input.imageStyle.focalY ?? fallback.imageStyle?.focalY ?? 50),
      borderRadius: Number(input.imageStyle.borderRadius ?? fallback.imageStyle?.borderRadius ?? 16),
      borderWidth: Number(input.imageStyle.borderWidth ?? fallback.imageStyle?.borderWidth ?? 0),
      borderColor: String(input.imageStyle.borderColor || fallback.imageStyle?.borderColor || '#FFFFFF')
    } : fallback.imageStyle,
    fill: String(input.fill || fallback.fill || '#FFFFFF'),
    opacity: typeof input.opacity === 'number' ? input.opacity : typeof fallback.opacity === 'number' ? fallback.opacity : 1,
    assetUrl: String(input.assetUrl || fallback.assetUrl || '')
  }
}

export function createDefaultMarbeteSvgDesign(themeKey: PersonasThemeKey = 'preescolar', canvas?: { width: number; height: number }): MarbeteSvgDesign {
  return {
    version: 1,
    canvas: {
      width: canvas?.width || MARBETE_PAGE_WIDTH,
      height: canvas?.height || MARBETE_PAGE_HEIGHT
    },
    layers: baseDynamicLayers(themeKey)
  }
}

export function normalizeMarbeteSvgDesign(value: unknown, themeKey: PersonasThemeKey = 'preescolar', canvas?: { width: number; height: number }): MarbeteSvgDesign {
  const fallback = createDefaultMarbeteSvgDesign(themeKey, canvas)
  if (!value || typeof value !== 'object') return fallback
  const input = value as Partial<MarbeteSvgDesign>
  const defaults = baseDynamicLayers(themeKey)
  const dynamicById = new Map(defaults.map((layer) => [layer.id, layer]))
  const seen = new Set<string>()
  const layers: MarbeteSvgLayer[] = []
  for (const raw of Array.isArray(input.layers) ? input.layers : []) {
    if (!raw || typeof raw !== 'object') continue
    const id = String((raw as Partial<MarbeteSvgLayer>).id || '')
    const fallbackLayer = dynamicById.get(id) || {
      id: id || `layer-${layers.length + 1}`,
      kind: (raw as Partial<MarbeteSvgLayer>).kind || 'cover',
      label: String((raw as Partial<MarbeteSvgLayer>).label || 'Capa'),
      x: 40,
      y: 40,
      width: 120,
      height: 80,
      rotation: 0,
      visible: true,
      zIndex: 50 + layers.length,
      fill: '#FFFFFF',
      opacity: 1,
      imageStyle: defaultImageStyle(0)
    } as MarbeteSvgLayer
    layers.push(normalizeLayer(raw as Partial<MarbeteSvgLayer>, fallbackLayer))
    if (id) seen.add(id)
  }
  for (const fallbackLayer of defaults) {
    if (!seen.has(fallbackLayer.id)) layers.push(fallbackLayer)
  }
  return {
    version: 1,
    canvas: {
      width: Number(input.canvas?.width || canvas?.width || fallback.canvas.width),
      height: Number(input.canvas?.height || canvas?.height || fallback.canvas.height)
    },
    layers: layers.sort((left, right) => left.zIndex - right.zIndex)
  }
}

export function resizeMarbeteSvgDesign(input: MarbeteSvgDesign, canvas: { width: number; height: number }, themeKey: PersonasThemeKey = 'preescolar') {
  const current = normalizeMarbeteSvgDesign(input, themeKey)
  const nextWidth = Math.max(1, Number(canvas.width) || current.canvas.width)
  const nextHeight = Math.max(1, Number(canvas.height) || current.canvas.height)
  const scaleX = nextWidth / Math.max(1, current.canvas.width)
  const scaleY = nextHeight / Math.max(1, current.canvas.height)
  return normalizeMarbeteSvgDesign({
    ...current,
    canvas: { width: nextWidth, height: nextHeight },
    layers: current.layers.map((layer) => ({
      ...layer,
      x: layer.x * scaleX,
      y: layer.y * scaleY,
      width: layer.width * scaleX,
      height: layer.height * scaleY
    }))
  }, themeKey, { width: nextWidth, height: nextHeight })
}

export function appendMarbeteSvgDesign(baseSvg: string, input: MarbeteSvgDesign, themeKey: PersonasThemeKey = 'preescolar') {
  if (!String(baseSvg || '').includes('<svg')) return baseSvg
  const canvas = parseSvgCanvas(baseSvg)
  const design = normalizeMarbeteSvgDesign(input, themeKey, canvas)
  const markup = design.layers.map(markupForLayer).filter(Boolean).join('\n')
  if (!markup) return baseSvg
  const group = `<g id="husky-marbetes-overlays">${markup}</g>`
  return baseSvg.replace(/<\/svg>\s*$/i, `${group}</svg>`)
}

export function previewMarbeteSvg(baseSvg: string, input: MarbeteSvgDesign, themeKey: PersonasThemeKey = 'preescolar', values: Record<string, string> = {}) {
  const composed = appendMarbeteSvgDesign(baseSvg, input, themeKey)
  return renderMarbeteVisualValues(composed, {
    ...MARBETE_REPRESENTATIVE_VALUES,
    ...values
  })
}

export function marbeteSvgLayerDefinition(kind: MarbeteSvgLayerKind) {
  return MARBETE_SVG_LAYER_DEFINITIONS.find((item) => item.kind === kind) || MARBETE_SVG_LAYER_DEFINITIONS[0]
}
