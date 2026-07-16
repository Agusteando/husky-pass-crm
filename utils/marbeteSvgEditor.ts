import type {
  MarbeteSvgDesign,
  MarbeteSvgLayer,
  MarbeteSvgLayerKind,
  MarbeteVisualImageStyle,
  MarbeteVisualTextStyle,
  PersonasThemeKey
} from '~/types/daycare'
import {
  MARBETE_PAGE_HEIGHT,
  MARBETE_PAGE_WIDTH,
  MARBETE_REPRESENTATIVE_VALUES,
  renderMarbeteVisualValues
} from '~/utils/marbeteDesigner'
import { MARBETE_HOLOGRAM_URL } from '~/utils/marbeteHologramAsset'
import { resolvePersonasTheme } from '~/utils/personasTheme'

export interface MarbeteSvgLayerDefinition {
  kind: MarbeteSvgLayerKind
  label: string
  help: string
  category: 'dynamic-image' | 'dynamic-text' | 'hologram' | 'cover' | 'static-image'
}

export const MARBETE_SVG_LAYER_DEFINITIONS: MarbeteSvgLayerDefinition[] = [
  { kind: 'person-photo', label: 'Foto de persona autorizada', help: 'Foto dinámica', category: 'dynamic-image' },
  { kind: 'student-photo', label: 'Foto del alumno', help: 'Foto dinámica', category: 'dynamic-image' },
  { kind: 'qr', label: 'Código QR', help: 'Imagen dinámica', category: 'dynamic-image' },
  { kind: 'authorized-surnames', label: 'Apellidos', help: 'Texto dinámico', category: 'dynamic-text' },
  { kind: 'authorized-given-name', label: 'Nombre', help: 'Texto dinámico', category: 'dynamic-text' },
  { kind: 'authorized-name', label: 'Nombre completo', help: 'Texto dinámico', category: 'dynamic-text' },
  { kind: 'relationship', label: 'Parentesco', help: 'Texto dinámico', category: 'dynamic-text' },
  { kind: 'student-name', label: 'Nombre del alumno', help: 'Texto dinámico', category: 'dynamic-text' },
  { kind: 'school-detail', label: 'Grado, grupo y plantel', help: 'Texto dinámico', category: 'dynamic-text' },
  { kind: 'validity', label: 'Vigencia', help: 'Texto dinámico', category: 'dynamic-text' },
  { kind: 'hologram', label: 'Holograma', help: 'Imagen del ciclo escolar', category: 'hologram' },
  { kind: 'ciclo-tag', label: 'Holograma', help: 'Imagen del ciclo escolar', category: 'hologram' },
  { kind: 'cover', label: 'Cubrir zona', help: 'Forma fija', category: 'cover' },
  { kind: 'static-image', label: 'Imagen fija', help: 'Imagen fija', category: 'static-image' }
]

const tokenValueKey: Partial<Record<MarbeteSvgLayerKind, string>> = {
  'authorized-surnames': 'authorizedSurnames',
  'authorized-given-name': 'nombreP',
  'authorized-name': 'fullnameP',
  relationship: 'parentesco',
  'student-name': 'studentName',
  'school-detail': 'schoolDetail',
  validity: 'validityLabel'
}

const textKinds = new Set<MarbeteSvgLayerKind>([
  'authorized-surnames',
  'authorized-given-name',
  'authorized-name',
  'relationship',
  'student-name',
  'school-detail',
  'validity'
])

const imageKinds = new Set<MarbeteSvgLayerKind>(['person-photo', 'student-photo', 'qr', 'static-image'])

function defaultTextStyle(fontSize: number, color = '#424242'): MarbeteVisualTextStyle {
  return { fontSize, fontWeight: 600, color, align: 'center', lineHeight: 1.08 }
}

function defaultImageStyle(borderRadius = 0): MarbeteVisualImageStyle {
  return { fit: 'cover', focalX: 50, focalY: 50, borderRadius, borderWidth: 0, borderColor: '#FFFFFF' }
}

function safeString(value: unknown) {
  if (typeof value === 'string') return value
  if (value == null) return ''
  try {
    return String(value)
  } catch {
    return ''
  }
}

function escapeXml(value?: unknown) {
  return safeString(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback
}

function parseNumeric(value?: string | null) {
  const number = Number(safeString(value).replace(/[^0-9.-]/g, ''))
  return Number.isFinite(number) ? number : 0
}

function attribute(markup: string, name: string) {
  const match = new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i').exec(markup)
  return match?.[2] || ''
}

function focalAlign(value: number, min: string, mid: string, max: string) {
  if (value <= 33) return min
  if (value >= 67) return max
  return mid
}

function layerCenter(layer: MarbeteSvgLayer) {
  return { x: layer.x + layer.width / 2, y: layer.y + layer.height / 2 }
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
  const clipId = `clip-${safeString(layer.id).replace(/[^a-z0-9_-]/gi, '-')}`
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
  return `<text data-husky-fit-text="${escapeXml(valueKey)}" data-husky-x="${target.x}" data-husky-y="${target.y}" data-husky-width="${target.width}" data-husky-height="${target.height}" data-husky-font-size="${target.fontSize || style.fontSize}" data-husky-font-weight="${target.fontWeight || style.fontWeight}" data-husky-color="${target.color || style.color}" data-husky-align="${target.align || style.align}" data-husky-line-height="${target.lineHeight || style.lineHeight}" data-husky-uppercase="${target.uppercase ?? style.uppercase ? '1' : '0'}" data-husky-shadow-color="${target.shadowColor || ''}" font-family="Montserrat, Arial, sans-serif">{{ data.${escapeXml(valueKey)} }}</text>`
}

function hologramLayer(layer: MarbeteSvgLayer) {
  const x = -layer.width / 2
  const y = -layer.height / 2
  const style = layer.textStyle || defaultTextStyle(Math.max(9, layer.height * 0.12), '#263442')
  return `<image x="${x}" y="${y}" width="${layer.width}" height="${layer.height}" href="${MARBETE_HOLOGRAM_URL}" xlink:href="${MARBETE_HOLOGRAM_URL}" preserveAspectRatio="xMidYMid meet"/>
    <text x="0" y="${y + layer.height * 0.39}" text-anchor="middle" fill="${escapeXml(style.color)}" font-family="Montserrat, Arial, sans-serif" font-size="${Math.max(6, style.fontSize * 0.44)}" font-weight="${style.fontWeight}" letter-spacing=".45">CICLO ESCOLAR</text>
    ${fitTextTemplate(layer, 'ciclo', {
      x: x + layer.width * 0.12,
      y: y + layer.height * 0.4,
      width: layer.width * 0.76,
      height: layer.height * 0.2,
      fontSize: style.fontSize,
      color: style.color,
      fontWeight: style.fontWeight,
      align: 'center',
      lineHeight: 1,
      shadowColor: '#FFFFFF'
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
  if (layer.removed || !layer.visible) return ''
  if (layer.kind === 'cover') return withTransform(layer, coverLayer(layer))
  if (layer.kind === 'static-image') return layer.assetUrl ? withTransform(layer, imageLayer(layer, layer.assetUrl)) : ''
  if (layer.kind === 'person-photo') return withTransform(layer, imageLayer(layer, '{{ getTrustedUrl(data.foto) }}'))
  if (layer.kind === 'student-photo') return withTransform(layer, imageLayer(layer, '{{ getTrustedUrl(data.studentPhoto) }}'))
  if (layer.kind === 'qr') return withTransform(layer, imageLayer(layer, '{{ getTrustedUrl(data.qrImage) }}'))
  if (layer.kind === 'hologram' || layer.kind === 'ciclo-tag') return withTransform(layer, hologramLayer(layer))
  return withTransform(layer, fitTextTemplate(layer, tokenValueKey[layer.kind] || 'fullnameP'))
}

function parseTransform(markup: string) {
  const transform = attribute(markup, 'transform')
  const matrix = /matrix\(\s*([-0-9.e]+)[ ,]+([-0-9.e]+)[ ,]+([-0-9.e]+)[ ,]+([-0-9.e]+)[ ,]+([-0-9.e]+)[ ,]+([-0-9.e]+)\s*\)/i.exec(transform)
  if (matrix) {
    const a = parseNumeric(matrix[1])
    const b = parseNumeric(matrix[2])
    const c = parseNumeric(matrix[3])
    const d = parseNumeric(matrix[4])
    return {
      translateX: parseNumeric(matrix[5]),
      translateY: parseNumeric(matrix[6]),
      scaleX: Math.hypot(a, b) || 1,
      scaleY: Math.hypot(c, d) || 1,
      rotation: Math.atan2(b, a) * 180 / Math.PI
    }
  }
  const translate = /translate\(\s*([-0-9.]+)(?:[ ,]+([-0-9.]+))?\s*\)/i.exec(transform)
  const scale = /scale\(\s*([-0-9.]+)(?:[ ,]+([-0-9.]+))?\s*\)/i.exec(transform)
  const rotate = /rotate\(\s*([-0-9.]+)/i.exec(transform)
  return {
    translateX: parseNumeric(translate?.[1]),
    translateY: parseNumeric(translate?.[2]),
    scaleX: scale ? parseNumeric(scale[1]) || 1 : 1,
    scaleY: scale ? parseNumeric(scale[2] || scale[1]) || 1 : 1,
    rotation: parseNumeric(rotate?.[1])
  }
}

function cssRulesForClass(svg: string, className: string) {
  const styleBlocks = Array.from(svg.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)).map((match) => match[1] || '')
  const rules: Record<string, string> = {}
  for (const styleBlock of styleBlocks) {
    for (const match of styleBlock.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
      const selectors = match[1].split(',').map((selector) => selector.trim())
      if (!selectors.includes(`.${className}`)) continue
      for (const declaration of match[2].split(';')) {
        const [rawKey, ...rawValue] = declaration.split(':')
        const key = rawKey?.trim()
        const value = rawValue.join(':').trim()
        if (key && value) rules[key] = value
      }
    }
  }
  return rules
}

function textStyleFromMarkup(svg: string, markup: string, fallbackSize: number) {
  const classNames = attribute(markup, 'class').split(/\s+/).filter(Boolean)
  const css = classNames.reduce<Record<string, string>>((merged, className) => ({ ...merged, ...cssRulesForClass(svg, className) }), {})
  const fontSize = parseNumeric(attribute(markup, 'font-size') || css['font-size']) || fallbackSize
  const weight = parseNumeric(attribute(markup, 'font-weight') || css['font-weight']) || 600
  const fill = attribute(markup, 'fill') || css.fill || '#424242'
  const anchor = attribute(markup, 'text-anchor')
  return {
    fontSize,
    fontWeight: ([500, 600, 700, 800].includes(weight) ? weight : 600) as 500 | 600 | 700 | 800,
    color: /^#[0-9a-f]{3,8}$/i.test(fill) ? fill : '#424242',
    align: anchor === 'start' ? 'left' : anchor === 'end' ? 'right' : 'center',
    lineHeight: 1.08
  } satisfies MarbeteVisualTextStyle
}

function textBoxForKind(kind: MarbeteSvgLayerKind, fontSize: number) {
  if (kind === 'relationship') return { width: 150, height: Math.max(22, fontSize * 1.8) }
  if (kind === 'school-detail') return { width: 230, height: Math.max(26, fontSize * 2) }
  if (kind === 'validity') return { width: 210, height: Math.max(24, fontSize * 1.8) }
  return { width: 190, height: Math.max(22, fontSize * 1.8) }
}

function textLayerFromMarkup(svg: string, markup: string, kind: MarbeteSvgLayerKind, id: string, label: string) {
  const transform = parseTransform(markup)
  const fallbackSize = kind === 'relationship' ? 14 : 11
  const textStyle = textStyleFromMarkup(svg, markup, fallbackSize)
  const box = textBoxForKind(kind, textStyle.fontSize)
  const anchorX = transform.translateX || parseNumeric(attribute(markup, 'x')) || 306
  const anchorY = transform.translateY || parseNumeric(attribute(markup, 'y')) || 396
  return {
    id,
    kind,
    label,
    x: anchorX - box.width / 2,
    y: anchorY - box.height / 2,
    width: box.width,
    height: box.height,
    rotation: transform.rotation,
    visible: true,
    zIndex: 20,
    textStyle,
    origin: 'base' as const,
    removed: false,
    aspectRatioLocked: false
  } satisfies MarbeteSvgLayer
}

function imageLayerFromMarkup(markup: string, kind: 'person-photo' | 'student-photo' | 'qr', id: string, label: string) {
  const transform = parseTransform(markup)
  const sourceWidth = Math.max(12, parseNumeric(attribute(markup, 'width')) || 100)
  const sourceHeight = Math.max(12, parseNumeric(attribute(markup, 'height')) || 100)
  const sourceX = parseNumeric(attribute(markup, 'x'))
  const sourceY = parseNumeric(attribute(markup, 'y'))
  const x = transform.translateX + sourceX * transform.scaleX
  const y = transform.translateY + sourceY * transform.scaleY
  return {
    id,
    kind,
    label,
    x,
    y,
    width: sourceWidth * transform.scaleX,
    height: sourceHeight * transform.scaleY,
    rotation: transform.rotation,
    visible: true,
    zIndex: kind === 'qr' ? 30 : 10,
    imageStyle: defaultImageStyle(kind === 'qr' ? 0 : 2),
    origin: 'base' as const,
    removed: false,
    aspectRatioLocked: true
  } satisfies MarbeteSvgLayer
}

export function parseSvgCanvas(svgInput: unknown) {
  const svg = safeString(svgInput)
  const match = /viewBox\s*=\s*(["'])\s*[-0-9.]+\s+[-0-9.]+\s+([0-9.]+)\s+([0-9.]+)\s*\1/i.exec(svg)
  if (match) return { width: parseNumeric(match[2]) || MARBETE_PAGE_WIDTH, height: parseNumeric(match[3]) || MARBETE_PAGE_HEIGHT }
  return {
    width: parseNumeric(attribute(svg, 'width')) || MARBETE_PAGE_WIDTH,
    height: parseNumeric(attribute(svg, 'height')) || MARBETE_PAGE_HEIGHT
  }
}

function themeBorder(themeKey: PersonasThemeKey) {
  return resolvePersonasTheme({ themeKey }).contrast || '#FFFFFF'
}

function optionalLayerPresets(themeKey: PersonasThemeKey, canvas: { width: number; height: number }): MarbeteSvgLayer[] {
  const borderColor = themeBorder(themeKey)
  const widthScale = canvas.width / MARBETE_PAGE_WIDTH
  const heightScale = canvas.height / MARBETE_PAGE_HEIGHT
  const scaleBox = (x: number, y: number, width: number, height: number) => ({ x: x * widthScale, y: y * heightScale, width: width * widthScale, height: height * heightScale })
  return [
    { id: 'person-photo', kind: 'person-photo', label: 'Foto de persona autorizada', ...scaleBox(110, 112, 170, 210), rotation: 0, visible: false, zIndex: 10, imageStyle: { ...defaultImageStyle(16), borderColor, borderWidth: 3 }, origin: 'overlay', removed: true, aspectRatioLocked: true },
    { id: 'student-photo', kind: 'student-photo', label: 'Foto del alumno', ...scaleBox(325, 146, 96, 116), rotation: 0, visible: false, zIndex: 11, imageStyle: { ...defaultImageStyle(12), borderColor: '#FFFFFF', borderWidth: 2 }, origin: 'overlay', removed: true, aspectRatioLocked: true },
    { id: 'qr', kind: 'qr', label: 'Código QR', ...scaleBox(318, 493, 116, 116), rotation: 0, visible: true, zIndex: 30, imageStyle: { ...defaultImageStyle(0), fit: 'contain' }, origin: 'overlay', removed: false, aspectRatioLocked: true },
    { id: 'authorized-surnames', kind: 'authorized-surnames', label: 'Apellidos', ...scaleBox(82, 330, 250, 30), rotation: 0, visible: false, zIndex: 20, textStyle: defaultTextStyle(15), origin: 'overlay', removed: true, aspectRatioLocked: false },
    { id: 'authorized-given-name', kind: 'authorized-given-name', label: 'Nombre', ...scaleBox(82, 362, 250, 30), rotation: 0, visible: false, zIndex: 21, textStyle: defaultTextStyle(15), origin: 'overlay', removed: true, aspectRatioLocked: false },
    { id: 'authorized-name', kind: 'authorized-name', label: 'Nombre completo', ...scaleBox(82, 348, 360, 52), rotation: 0, visible: false, zIndex: 20, textStyle: defaultTextStyle(19), origin: 'overlay', removed: true, aspectRatioLocked: false },
    { id: 'relationship', kind: 'relationship', label: 'Parentesco', ...scaleBox(120, 404, 286, 30), rotation: 0, visible: false, zIndex: 22, textStyle: defaultTextStyle(15, '#44546A'), origin: 'overlay', removed: true, aspectRatioLocked: false },
    { id: 'student-name', kind: 'student-name', label: 'Nombre del alumno', ...scaleBox(82, 446, 342, 42), rotation: 0, visible: false, zIndex: 23, textStyle: defaultTextStyle(16), origin: 'overlay', removed: true, aspectRatioLocked: false },
    { id: 'school-detail', kind: 'school-detail', label: 'Grado, grupo y plantel', ...scaleBox(82, 490, 212, 42), rotation: 0, visible: false, zIndex: 24, textStyle: defaultTextStyle(13, '#44546A'), origin: 'overlay', removed: true, aspectRatioLocked: false },
    { id: 'validity', kind: 'validity', label: 'Vigencia', ...scaleBox(82, 536, 210, 30), rotation: 0, visible: false, zIndex: 25, textStyle: defaultTextStyle(12, '#44546A'), origin: 'overlay', removed: true, aspectRatioLocked: false },
    { id: 'hologram', kind: 'hologram', label: 'Holograma', ...scaleBox(278, 76, 132, 95), rotation: 0, visible: false, zIndex: 40, textStyle: defaultTextStyle(14, '#263442'), origin: 'overlay', removed: true, aspectRatioLocked: true }
  ]
}

const textTokenDescriptors: Array<{ pattern: RegExp; kind: MarbeteSvgLayerKind; id: string; label: string }> = [
  { pattern: /data\.(?:paternoP|maternoP)\b/, kind: 'authorized-surnames', id: 'base-authorized-surnames', label: 'Apellidos' },
  { pattern: /data\.nombreP\b/, kind: 'authorized-given-name', id: 'base-authorized-given-name', label: 'Nombre' },
  { pattern: /data\.(?:fullnameP|nombreCompletoP|authorizedPersonName)\b/, kind: 'authorized-name', id: 'base-authorized-name', label: 'Nombre completo' },
  { pattern: /data\.(?:parenP|parentesco)\b/, kind: 'relationship', id: 'base-relationship', label: 'Parentesco' },
  { pattern: /data\.(?:studentName|fullnameA|nombreAlumno|alumno)\b/, kind: 'student-name', id: 'base-student-name', label: 'Nombre del alumno' },
  { pattern: /data\.schoolDetail\b/, kind: 'school-detail', id: 'base-school-detail', label: 'Grado, grupo y plantel' },
  { pattern: /data\.(?:validityLabel|vigencia)\b/, kind: 'validity', id: 'base-validity', label: 'Vigencia' }
]

export function extractBaseMarbeteLayers(svgInput: unknown, themeKey: PersonasThemeKey = 'preescolar') {
  const svg = safeString(svgInput)
  const layers: MarbeteSvgLayer[] = []
  const textMatches = Array.from(svg.matchAll(/<text\b[^>]*>[\s\S]*?<\/text>/gi)).map((match) => match[0])
  const imageMatches = Array.from(svg.matchAll(/<image\b[\s\S]*?(?:\/>|<\/image>)/gi)).map((match) => match[0])

  for (const descriptor of textTokenDescriptors) {
    const markup = textMatches.find((candidate) => descriptor.pattern.test(candidate))
    if (markup) layers.push(textLayerFromMarkup(svg, markup, descriptor.kind, descriptor.id, descriptor.label))
  }
  const personPhoto = imageMatches.find((markup) => /data\.(?:foto|fotoP|compressed_foto)\b/.test(markup))
  if (personPhoto) layers.push(imageLayerFromMarkup(personPhoto, 'person-photo', 'base-person-photo', 'Foto de persona autorizada'))
  const studentPhoto = imageMatches.find((markup) => /data\.(?:studentPhoto|fotoA)\b/.test(markup))
  if (studentPhoto) layers.push(imageLayerFromMarkup(studentPhoto, 'student-photo', 'base-student-photo', 'Foto del alumno'))
  const qr = imageMatches.find((markup) => /data\.qrImage\b/.test(markup))
  if (qr) layers.push(imageLayerFromMarkup(qr, 'qr', 'base-qr', 'Código QR'))

  if (!layers.length) return []
  const borderColor = themeBorder(themeKey)
  return layers.map((layer) => layer.kind === 'person-photo' && layer.imageStyle
    ? { ...layer, imageStyle: { ...layer.imageStyle, borderColor } }
    : layer)
}

function baseKindForMarkup(markup: string): MarbeteSvgLayerKind | null {
  if (/data\.(?:foto|fotoP|compressed_foto)\b/.test(markup)) return 'person-photo'
  if (/data\.(?:studentPhoto|fotoA)\b/.test(markup)) return 'student-photo'
  if (/data\.qrImage\b/.test(markup)) return 'qr'
  for (const descriptor of textTokenDescriptors) {
    if (descriptor.pattern.test(markup)) return descriptor.kind
  }
  return null
}

export function stripBaseDynamicFields(svgInput: unknown, design?: MarbeteSvgDesign) {
  let svg = safeString(svgInput)
  if (!svg) return ''
  const baseKinds = new Set((design?.layers || []).filter((layer) => layer.origin === 'base').map((layer) => layer.kind))
  if (!baseKinds.size) return svg
  svg = svg.replace(/<image\b[\s\S]*?(?:\/>|<\/image>)/gi, (markup) => {
    const kind = baseKindForMarkup(markup)
    return kind && baseKinds.has(kind) ? '' : markup
  })
  svg = svg.replace(/<text\b[^>]*>[\s\S]*?<\/text>/gi, (markup) => {
    const kind = baseKindForMarkup(markup)
    return kind && baseKinds.has(kind) ? '' : markup
  })
  return svg
}

function normalizeLayer(input: Partial<MarbeteSvgLayer>, fallback: MarbeteSvgLayer, canvas: { width: number; height: number }): MarbeteSvgLayer {
  const rawKind = input.kind === 'ciclo-tag' ? 'hologram' : input.kind
  const kind = (rawKind || fallback.kind) as MarbeteSvgLayerKind
  const migratedLegacyHologram = input.kind === 'ciclo-tag'
  const textFallback = fallback.textStyle || (textKinds.has(kind) || kind === 'hologram' ? defaultTextStyle(16) : undefined)
  const imageFallback = fallback.imageStyle || (imageKinds.has(kind) ? defaultImageStyle() : undefined)
  return {
    id: safeString(input.id || fallback.id),
    kind,
    label: safeString(input.label || fallback.label || marbeteSvgLayerDefinition(kind).label),
    x: clamp(input.x, -canvas.width, canvas.width * 2, fallback.x),
    y: clamp(input.y, -canvas.height, canvas.height * 2, fallback.y),
    width: clamp(input.width, 12, canvas.width * 2, fallback.width),
    height: clamp(input.height, 12, canvas.height * 2, fallback.height),
    rotation: clamp(input.rotation, -360, 360, fallback.rotation),
    visible: kind === 'qr' ? true : migratedLegacyHologram ? false : input.visible == null ? fallback.visible : Boolean(input.visible),
    zIndex: clamp(input.zIndex, 0, 999, fallback.zIndex),
    textStyle: textFallback ? {
      fontSize: clamp(input.textStyle?.fontSize, 6, 120, textFallback.fontSize),
      fontWeight: ([500, 600, 700, 800].includes(Number(input.textStyle?.fontWeight)) ? Number(input.textStyle?.fontWeight) : textFallback.fontWeight) as 500 | 600 | 700 | 800,
      color: safeString(input.textStyle?.color || textFallback.color),
      align: ['left', 'center', 'right'].includes(safeString(input.textStyle?.align)) ? input.textStyle!.align : textFallback.align,
      lineHeight: clamp(input.textStyle?.lineHeight, 0.7, 2, textFallback.lineHeight),
      uppercase: Boolean(input.textStyle?.uppercase)
    } : undefined,
    imageStyle: imageFallback ? {
      fit: input.imageStyle?.fit === 'contain' ? 'contain' : imageFallback.fit,
      focalX: clamp(input.imageStyle?.focalX, 0, 100, imageFallback.focalX),
      focalY: clamp(input.imageStyle?.focalY, 0, 100, imageFallback.focalY),
      borderRadius: clamp(input.imageStyle?.borderRadius, 0, 200, imageFallback.borderRadius),
      borderWidth: clamp(input.imageStyle?.borderWidth, 0, 40, imageFallback.borderWidth),
      borderColor: safeString(input.imageStyle?.borderColor || imageFallback.borderColor)
    } : undefined,
    fill: safeString(input.fill || fallback.fill || '#FFFFFF'),
    opacity: clamp(input.opacity, 0, 1, typeof fallback.opacity === 'number' ? fallback.opacity : 1),
    assetUrl: safeString(input.assetUrl || fallback.assetUrl || ''),
    origin: input.origin === 'base' || fallback.origin === 'base' ? 'base' : 'overlay',
    removed: kind === 'qr' ? false : migratedLegacyHologram ? true : input.removed == null ? Boolean(fallback.removed) : Boolean(input.removed),
    aspectRatioLocked: input.aspectRatioLocked == null ? Boolean(fallback.aspectRatioLocked) : Boolean(input.aspectRatioLocked)
  }
}

export function createDefaultMarbeteSvgDesign(themeKey: PersonasThemeKey = 'preescolar', canvas?: { width: number; height: number }, baseSvg?: unknown): MarbeteSvgDesign {
  const resolvedCanvas = canvas || parseSvgCanvas(baseSvg)
  const detected = baseSvg ? extractBaseMarbeteLayers(baseSvg, themeKey) : []
  const presets = optionalLayerPresets(themeKey, resolvedCanvas)
  const detectedKinds = new Set(detected.map((layer) => layer.kind))
  return {
    version: 1,
    canvas: resolvedCanvas,
    layers: [...detected, ...presets.filter((layer) => !detectedKinds.has(layer.kind))].sort((left, right) => left.zIndex - right.zIndex)
  }
}

export function createMarbeteSvgDesignFromBase(baseSvg: unknown, themeKey: PersonasThemeKey = 'preescolar') {
  return createDefaultMarbeteSvgDesign(themeKey, parseSvgCanvas(baseSvg), baseSvg)
}

export function normalizeMarbeteSvgDesign(value: unknown, themeKey: PersonasThemeKey = 'preescolar', canvas?: { width: number; height: number }, baseSvg?: unknown): MarbeteSvgDesign {
  const fallback = createDefaultMarbeteSvgDesign(themeKey, canvas || parseSvgCanvas(baseSvg), baseSvg)
  if (!value || typeof value !== 'object') return fallback
  const input = value as Partial<MarbeteSvgDesign>
  const resolvedCanvas = {
    width: clamp(input.canvas?.width, 1, 10000, fallback.canvas.width),
    height: clamp(input.canvas?.height, 1, 10000, fallback.canvas.height)
  }
  const fallbackById = new Map(fallback.layers.map((layer) => [layer.id, layer]))
  const detectedBaseByKind = new Map(fallback.layers.filter((layer) => layer.origin === 'base').map((layer) => [layer.kind, layer]))
  const normalized: MarbeteSvgLayer[] = []

  for (const raw of Array.isArray(input.layers) ? input.layers : []) {
    if (!raw || typeof raw !== 'object') continue
    const partial = raw as Partial<MarbeteSvgLayer>
    const rawKind = partial.kind === 'ciclo-tag' ? 'hologram' : partial.kind
    const matchingBase = rawKind ? detectedBaseByKind.get(rawKind) : undefined
    if (matchingBase && partial.origin !== 'base' && partial.id === rawKind) continue
    const id = safeString(partial.id || `layer-${normalized.length + 1}`)
    const definition = marbeteSvgLayerDefinition((rawKind || 'cover') as MarbeteSvgLayerKind)
    const genericFallback: MarbeteSvgLayer = {
      id,
      kind: (rawKind || 'cover') as MarbeteSvgLayerKind,
      label: safeString(partial.label || definition.label),
      x: 40,
      y: 40,
      width: rawKind === 'hologram' ? 132 : 120,
      height: rawKind === 'hologram' ? 95 : 80,
      rotation: 0,
      visible: true,
      zIndex: 50 + normalized.length,
      fill: '#FFFFFF',
      opacity: 1,
      textStyle: textKinds.has((rawKind || 'cover') as MarbeteSvgLayerKind) || rawKind === 'hologram' ? defaultTextStyle(16) : undefined,
      imageStyle: imageKinds.has((rawKind || 'cover') as MarbeteSvgLayerKind) ? defaultImageStyle() : undefined,
      origin: 'overlay',
      removed: false,
      aspectRatioLocked: rawKind === 'hologram' || imageKinds.has((rawKind || 'cover') as MarbeteSvgLayerKind)
    }
    normalized.push(normalizeLayer(partial, fallbackById.get(id) || matchingBase || genericFallback, resolvedCanvas))
  }

  const existingIds = new Set(normalized.map((layer) => layer.id))
  const existingKinds = new Set(normalized.map((layer) => layer.kind))
  for (const layer of fallback.layers) {
    if (existingIds.has(layer.id)) continue
    if (layer.origin === 'base' || !existingKinds.has(layer.kind)) normalized.push(layer)
  }

  return { version: 1, canvas: resolvedCanvas, layers: normalized.sort((left, right) => left.zIndex - right.zIndex) }
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
    layers: current.layers.map((layer) => ({ ...layer, x: layer.x * scaleX, y: layer.y * scaleY, width: layer.width * scaleX, height: layer.height * scaleY }))
  }, themeKey, { width: nextWidth, height: nextHeight })
}

export function rebaseMarbeteSvgDesign(input: MarbeteSvgDesign, previousBaseSvg: unknown, nextBaseSvg: unknown, themeKey: PersonasThemeKey = 'preescolar') {
  const previous = normalizeMarbeteSvgDesign(input, themeKey, parseSvgCanvas(previousBaseSvg), previousBaseSvg)
  const next = createMarbeteSvgDesignFromBase(nextBaseSvg, themeKey)
  const scaleX = next.canvas.width / Math.max(1, previous.canvas.width)
  const scaleY = next.canvas.height / Math.max(1, previous.canvas.height)
  const overlays = previous.layers
    .filter((layer) => layer.origin !== 'base')
    .map((layer) => ({
      ...layer,
      x: layer.x * scaleX,
      y: layer.y * scaleY,
      width: layer.width * scaleX,
      height: layer.height * scaleY
    }))
  const overlayIds = new Set(overlays.map((layer) => layer.id))
  const overlayKinds = new Set(overlays.map((layer) => layer.kind))
  return normalizeMarbeteSvgDesign({
    ...next,
    layers: [
      ...next.layers.filter((layer) => layer.origin === 'base' || (!overlayIds.has(layer.id) && !overlayKinds.has(layer.kind))),
      ...overlays
    ]
  }, themeKey, next.canvas, nextBaseSvg)
}

export function appendMarbeteSvgDesign(baseSvgInput: unknown, input: MarbeteSvgDesign, themeKey: PersonasThemeKey = 'preescolar') {
  const baseSvg = safeString(baseSvgInput)
  if (!baseSvg.includes('<svg')) return baseSvg
  const canvas = parseSvgCanvas(baseSvg)
  const design = normalizeMarbeteSvgDesign(input, themeKey, canvas, baseSvg)
  const stripped = stripBaseDynamicFields(baseSvg, design)
  const markup = design.layers.map(markupForLayer).filter(Boolean).join('\n')
  if (!markup) return stripped
  const group = `<g id="husky-marbetes-overlays">${markup}</g>`
  return stripped.replace(/<\/svg>\s*$/i, `${group}</svg>`)
}

export function previewMarbeteBaseSvg(baseSvgInput: unknown, input: MarbeteSvgDesign, themeKey: PersonasThemeKey = 'preescolar', values: Record<string, string> = {}) {
  const baseSvg = safeString(baseSvgInput)
  const design = normalizeMarbeteSvgDesign(input, themeKey, parseSvgCanvas(baseSvg), baseSvg)
  return renderMarbeteVisualValues(stripBaseDynamicFields(baseSvg, design), { ...MARBETE_REPRESENTATIVE_VALUES, ...values })
}

export function previewMarbeteSvg(baseSvgInput: unknown, input: MarbeteSvgDesign, themeKey: PersonasThemeKey = 'preescolar', values: Record<string, string> = {}) {
  const composed = appendMarbeteSvgDesign(baseSvgInput, input, themeKey)
  return renderMarbeteVisualValues(safeString(composed), { ...MARBETE_REPRESENTATIVE_VALUES, ...values })
}

export function marbeteSvgLayerDefinition(kind: MarbeteSvgLayerKind) {
  return MARBETE_SVG_LAYER_DEFINITIONS.find((item) => item.kind === kind) || MARBETE_SVG_LAYER_DEFINITIONS[0]!
}
