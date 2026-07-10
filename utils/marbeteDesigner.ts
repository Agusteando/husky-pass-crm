import type {
  MarbeteVisualDesign,
  MarbeteVisualElement,
  MarbeteVisualElementKind,
  MarbeteVisualImageStyle,
  MarbeteVisualTextStyle,
  PersonasThemeKey
} from '~/types/daycare'
import { resolvePersonasTheme } from '~/utils/personasTheme'

export const MARBETE_CARD_WIDTH = 420 as const
export const MARBETE_CARD_HEIGHT = 640 as const
export const MARBETE_PAGE_WIDTH = 612
export const MARBETE_PAGE_HEIGHT = 792
export const MARBETE_CICLO_TAG_URL = '/marbete/ciclo-tag.png'

export interface MarbeteElementDefinition {
  kind: MarbeteVisualElementKind
  label: string
  help: string
  category: 'image' | 'text' | 'ciclo'
}

export const MARBETE_ELEMENT_DEFINITIONS: MarbeteElementDefinition[] = [
  { kind: 'person-photo', label: 'Foto de persona autorizada', help: 'Retrato principal del gafete.', category: 'image' },
  { kind: 'student-photo', label: 'Foto del alumno', help: 'Opcional para diseños que requieren ambas fotos.', category: 'image' },
  { kind: 'qr', label: 'Código QR', help: 'Enlace de validación del Husky Pass.', category: 'image' },
  { kind: 'authorized-name', label: 'Nombre de persona autorizada', help: 'Nombre completo con ajuste automático.', category: 'text' },
  { kind: 'relationship', label: 'Parentesco', help: 'Relación registrada con el alumno.', category: 'text' },
  { kind: 'student-name', label: 'Nombre del alumno', help: 'Nombre completo del alumno.', category: 'text' },
  { kind: 'school-detail', label: 'Grado, grupo y plantel', help: 'Resumen escolar existente.', category: 'text' },
  { kind: 'validity', label: 'Vigencia', help: 'Leyenda de vigencia del registro.', category: 'text' },
  { kind: 'ciclo-tag', label: 'Etiqueta de ciclo escolar', help: 'Badge reutilizable con texto generado por la plataforma.', category: 'ciclo' }
]

export const MARBETE_REPRESENTATIVE_VALUES: Record<string, string> = {
  fullnameP: 'María José de los Ángeles De la Luz Santillán',
  authorizedPersonName: 'María José de los Ángeles De la Luz Santillán',
  parentesco: 'Tutora autorizada',
  studentName: 'Emiliano Sebastián Álvarez de la Torre',
  schoolDetail: '4° C · Plantel PM',
  validityLabel: 'Vigente desde 2026-08-19',
  ciclo: '2026-2027',
  foto: '/marbete/sample-person.svg',
  studentPhoto: '/marbete/sample-student.svg',
  qrImage: '/marbete/sample-qr.svg'
}

const defaultTextStyle = (fontSize: number, color = '#102A43'): MarbeteVisualTextStyle => ({
  fontSize,
  fontWeight: 700,
  color,
  align: 'center',
  lineHeight: 1.08
})

const defaultImageStyle = (borderRadius = 18): MarbeteVisualImageStyle => ({
  fit: 'cover',
  focalX: 50,
  focalY: 50,
  borderRadius,
  borderWidth: 3,
  borderColor: '#FFFFFF'
})

function defaultElements(themeKey: PersonasThemeKey): MarbeteVisualElement[] {
  const theme = resolvePersonasTheme({ themeKey })
  return [
    {
      id: 'person-photo', kind: 'person-photo', label: 'Foto de persona autorizada',
      x: 108, y: 78, width: 204, height: 248, rotation: 0, visible: true, zIndex: 10,
      imageStyle: { ...defaultImageStyle(24), borderColor: theme.contrast || '#FFFFFF', borderWidth: 4 }
    },
    {
      id: 'student-photo', kind: 'student-photo', label: 'Foto del alumno',
      x: 288, y: 90, width: 96, height: 112, rotation: 0, visible: false, zIndex: 11,
      imageStyle: defaultImageStyle(16)
    },
    {
      id: 'authorized-name', kind: 'authorized-name', label: 'Nombre de persona autorizada',
      x: 30, y: 345, width: 360, height: 66, rotation: 0, visible: true, zIndex: 20,
      textStyle: defaultTextStyle(25)
    },
    {
      id: 'relationship', kind: 'relationship', label: 'Parentesco',
      x: 82, y: 412, width: 256, height: 34, rotation: 0, visible: true, zIndex: 21,
      textStyle: { ...defaultTextStyle(16, theme.primary), fontWeight: 600 }
    },
    {
      id: 'student-name', kind: 'student-name', label: 'Nombre del alumno',
      x: 42, y: 453, width: 336, height: 44, rotation: 0, visible: false, zIndex: 22,
      textStyle: defaultTextStyle(16)
    },
    {
      id: 'school-detail', kind: 'school-detail', label: 'Grado, grupo y plantel',
      x: 70, y: 500, width: 280, height: 32, rotation: 0, visible: false, zIndex: 23,
      textStyle: { ...defaultTextStyle(13, '#52606D'), fontWeight: 600 }
    },
    {
      id: 'qr', kind: 'qr', label: 'Código QR',
      x: 142, y: 454, width: 136, height: 136, rotation: 0, visible: true, zIndex: 30,
      imageStyle: { ...defaultImageStyle(8), fit: 'contain', borderWidth: 0, borderColor: '#FFFFFF' }
    },
    {
      id: 'validity', kind: 'validity', label: 'Vigencia',
      x: 62, y: 590, width: 296, height: 28, rotation: 0, visible: false, zIndex: 31,
      textStyle: { ...defaultTextStyle(11, '#52606D'), fontWeight: 600 }
    },
    {
      id: 'ciclo-tag', kind: 'ciclo-tag', label: 'Etiqueta de ciclo escolar',
      x: 270, y: 505, width: 140, height: 101, rotation: 0, visible: true, zIndex: 40,
      textStyle: { ...defaultTextStyle(21, '#FFFFFF'), fontWeight: 800 }
    }
  ]
}

export function createDefaultMarbeteVisualDesign(themeKey: PersonasThemeKey = 'preescolar'): MarbeteVisualDesign {
  const theme = resolvePersonasTheme({ themeKey })
  return {
    version: 1,
    canvas: { width: MARBETE_CARD_WIDTH, height: MARBETE_CARD_HEIGHT },
    background: { url: '', color: theme.soft || '#F6F8FB', fit: 'cover' },
    elements: defaultElements(themeKey),
    showInstructions: true
  }
}

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback
}

function safeColor(value: unknown, fallback: string) {
  const normalized = String(value || '').trim()
  return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized.toUpperCase() : fallback
}

function safeKind(value: unknown): MarbeteVisualElementKind | null {
  const normalized = String(value || '') as MarbeteVisualElementKind
  return MARBETE_ELEMENT_DEFINITIONS.some((item) => item.kind === normalized) ? normalized : null
}

export function normalizeMarbeteVisualDesign(value: unknown, themeKey: PersonasThemeKey = 'preescolar'): MarbeteVisualDesign {
  const fallback = createDefaultMarbeteVisualDesign(themeKey)
  if (!value || typeof value !== 'object') return fallback
  const input = value as Partial<MarbeteVisualDesign>
  const byKind = new Map((Array.isArray(input.elements) ? input.elements : []).map((element) => [element.kind, element]))
  const elements = fallback.elements.map((base) => {
    const raw = byKind.get(base.kind)
    if (!raw || !safeKind(raw.kind)) return base
    const textStyle = base.textStyle ? {
      fontSize: clamp(raw.textStyle?.fontSize, 8, 64, base.textStyle.fontSize),
      fontWeight: ([500, 600, 700, 800].includes(Number(raw.textStyle?.fontWeight)) ? Number(raw.textStyle?.fontWeight) : base.textStyle.fontWeight) as 500 | 600 | 700 | 800,
      color: safeColor(raw.textStyle?.color, base.textStyle.color),
      align: (['left', 'center', 'right'].includes(String(raw.textStyle?.align)) ? raw.textStyle?.align : base.textStyle.align) as 'left' | 'center' | 'right',
      lineHeight: clamp(raw.textStyle?.lineHeight, 0.9, 1.6, base.textStyle.lineHeight),
      uppercase: Boolean(raw.textStyle?.uppercase)
    } : undefined
    const imageStyle = base.imageStyle ? {
      fit: (raw.imageStyle?.fit === 'contain' ? 'contain' : 'cover') as 'cover' | 'contain',
      focalX: clamp(raw.imageStyle?.focalX, 0, 100, base.imageStyle.focalX),
      focalY: clamp(raw.imageStyle?.focalY, 0, 100, base.imageStyle.focalY),
      borderRadius: clamp(raw.imageStyle?.borderRadius, 0, 80, base.imageStyle.borderRadius),
      borderWidth: clamp(raw.imageStyle?.borderWidth, 0, 16, base.imageStyle.borderWidth),
      borderColor: safeColor(raw.imageStyle?.borderColor, base.imageStyle.borderColor)
    } : undefined
    return {
      ...base,
      id: base.kind,
      label: base.label,
      x: clamp(raw.x, -MARBETE_CARD_WIDTH, MARBETE_CARD_WIDTH * 2, base.x),
      y: clamp(raw.y, -MARBETE_CARD_HEIGHT, MARBETE_CARD_HEIGHT * 2, base.y),
      width: clamp(raw.width, 24, MARBETE_CARD_WIDTH * 1.5, base.width),
      height: clamp(raw.height, 20, MARBETE_CARD_HEIGHT * 1.5, base.height),
      rotation: clamp(raw.rotation, -180, 180, base.rotation),
      visible: raw.visible !== false,
      zIndex: clamp(raw.zIndex, 0, 100, base.zIndex),
      textStyle,
      imageStyle
    }
  })
  return {
    version: 1,
    canvas: { width: MARBETE_CARD_WIDTH, height: MARBETE_CARD_HEIGHT },
    background: {
      url: String(input.background?.url || '').trim(),
      color: safeColor(input.background?.color, fallback.background.color),
      fit: input.background?.fit === 'contain' ? 'contain' : 'cover'
    },
    elements,
    showInstructions: input.showInstructions !== false
  }
}

function escapeXml(value: unknown) {
  return String(value ?? '')
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

function imageElement(element: MarbeteVisualElement, href: string) {
  const style = element.imageStyle || defaultImageStyle()
  const x = -element.width / 2
  const y = -element.height / 2
  const clipId = `clip-${element.id}`
  const align = `${focalAlign(style.focalX, 'xMin', 'xMid', 'xMax')}${focalAlign(style.focalY, 'YMin', 'YMid', 'YMax')}`
  const preserve = `${align} ${style.fit === 'contain' ? 'meet' : 'slice'}`
  return `<defs><clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${element.width}" height="${element.height}" rx="${style.borderRadius}"/></clipPath></defs>
    <image x="${x}" y="${y}" width="${element.width}" height="${element.height}" href="${escapeXml(href)}" xlink:href="${escapeXml(href)}" preserveAspectRatio="${preserve}" clip-path="url(#${clipId})" overflow="hidden"/>
    ${style.borderWidth > 0 ? `<rect x="${x}" y="${y}" width="${element.width}" height="${element.height}" rx="${style.borderRadius}" fill="none" stroke="${style.borderColor}" stroke-width="${style.borderWidth}"/>` : ''}`
}

const elementValueKey: Partial<Record<MarbeteVisualElementKind, string>> = {
  'authorized-name': 'fullnameP',
  relationship: 'parentesco',
  'student-name': 'studentName',
  'school-detail': 'schoolDetail',
  validity: 'validityLabel'
}

function fitTextTemplate(element: MarbeteVisualElement, valueKey: string, box?: {
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
  const style = element.textStyle || defaultTextStyle(16)
  const target = box || { x: -element.width / 2, y: -element.height / 2, width: element.width, height: element.height }
  return `<text data-husky-fit-text="${valueKey}" data-husky-x="${target.x}" data-husky-y="${target.y}" data-husky-width="${target.width}" data-husky-height="${target.height}" data-husky-font-size="${target.fontSize || style.fontSize}" data-husky-font-weight="${target.fontWeight || style.fontWeight}" data-husky-color="${target.color || style.color}" data-husky-align="${target.align || style.align}" data-husky-line-height="${target.lineHeight || style.lineHeight}" data-husky-uppercase="${target.uppercase ?? style.uppercase ? '1' : '0'}" data-husky-shadow-color="${target.shadowColor || ''}" font-family="Montserrat, Arial, sans-serif">{{ data.${valueKey} }}</text>`
}

function cicloElement(element: MarbeteVisualElement) {
  const x = -element.width / 2
  const y = -element.height / 2
  const labelY = y + element.height * 0.28
  const style = element.textStyle || defaultTextStyle(14)
  return `<image x="${x}" y="${y}" width="${element.width}" height="${element.height}" href="${MARBETE_CICLO_TAG_URL}" xlink:href="${MARBETE_CICLO_TAG_URL}" preserveAspectRatio="none"/>
    <text x="0" y="${labelY}" text-anchor="middle" fill="#111111" font-family="Montserrat, Arial, sans-serif" font-size="${Math.max(7, style.fontSize * 0.47)}" font-weight="700" letter-spacing="0.15">CICLO ESCOLAR</text>
    ${fitTextTemplate(element, 'ciclo', {
      x: x + element.width * 0.10,
      y: y + element.height * 0.27,
      width: element.width * 0.80,
      height: element.height * 0.34,
      fontSize: style.fontSize,
      color: '#FFFFFF',
      fontWeight: 800,
      align: 'center',
      lineHeight: 1,
      shadowColor: '#5B6670'
    })}`
}

function visualElementMarkup(element: MarbeteVisualElement) {
  if (!element.visible) return ''
  let content: string
  if (element.kind === 'person-photo') content = imageElement(element, '{{ getTrustedUrl(data.foto) }}')
  else if (element.kind === 'student-photo') content = imageElement(element, '{{ getTrustedUrl(data.studentPhoto) }}')
  else if (element.kind === 'qr') content = imageElement(element, '{{ getTrustedUrl(data.qrImage) }}')
  else if (element.kind === 'ciclo-tag') content = cicloElement(element)
  else content = fitTextTemplate(element, elementValueKey[element.kind] || 'fullnameP')
  const centerX = element.x + element.width / 2
  const centerY = element.y + element.height / 2
  return `<g id="marbete-${element.id}" data-marbete-kind="${element.kind}" transform="translate(${centerX} ${centerY}) rotate(${element.rotation})">${content}</g>`
}

function cardMarkup(design: MarbeteVisualDesign) {
  const background = design.background.url
    ? `<image x="0" y="0" width="${MARBETE_CARD_WIDTH}" height="${MARBETE_CARD_HEIGHT}" href="${escapeXml(design.background.url)}" xlink:href="${escapeXml(design.background.url)}" preserveAspectRatio="xMidYMid ${design.background.fit === 'contain' ? 'meet' : 'slice'}"/>`
    : `<rect width="${MARBETE_CARD_WIDTH}" height="${MARBETE_CARD_HEIGHT}" fill="${design.background.color}"/><path d="M0 510 C110 455 240 590 420 500 V640 H0 Z" fill="#ffffff" opacity=".72"/><circle cx="376" cy="54" r="96" fill="#ffffff" opacity=".38"/>`
  const elements = [...design.elements].sort((a, b) => a.zIndex - b.zIndex).map(visualElementMarkup).join('\n')
  return `<rect width="${MARBETE_CARD_WIDTH}" height="${MARBETE_CARD_HEIGHT}" rx="5" fill="${design.background.color}"/>
  ${background}
  ${elements}`
}

export function compileMarbeteVisualSvg(input: MarbeteVisualDesign, options: { mode?: 'card' | 'print'; values?: Record<string, string> } = {}) {
  const design = normalizeMarbeteVisualDesign(input)
  const card = cardMarkup(design)
  let svg: string
  if (options.mode === 'card') {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${MARBETE_CARD_WIDTH} ${MARBETE_CARD_HEIGHT}" width="${MARBETE_CARD_WIDTH}" height="${MARBETE_CARD_HEIGHT}">${card}</svg>`
  } else {
    const cardWidth = 297.64
    const cardHeight = 453.54
    const cardX = (MARBETE_PAGE_WIDTH - cardWidth) / 2
    const cardY = 44
    const instructions = design.showInstructions ? `<g font-family="Montserrat, Arial, sans-serif" fill="#23303F">
      <text x="${cardX}" y="532" font-size="10" font-weight="800">LISTO PARA IMPRIMIR</text>
      <text x="${cardX}" y="552" font-size="9">1. Imprime en hoja carta, escala 100%.</text>
      <text x="${cardX}" y="570" font-size="9">2. Recorta por la línea punteada (10.5 × 16 cm).</text>
      <text x="${cardX}" y="588" font-size="9">3. Enmica y coloca en un porta gafete.</text>
    </g>` : ''
    svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${MARBETE_PAGE_WIDTH} ${MARBETE_PAGE_HEIGHT}" width="${MARBETE_PAGE_WIDTH}" height="${MARBETE_PAGE_HEIGHT}">
      <rect width="612" height="792" fill="#FFFFFF"/>
      <svg x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${MARBETE_CARD_WIDTH} ${MARBETE_CARD_HEIGHT}" overflow="hidden">${card}</svg>
      <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" fill="none" stroke="#718096" stroke-width="0.8" stroke-dasharray="5 4"/>
      ${instructions}
      <text x="306" y="755" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="7" fill="#7B8794">Husky Pass · archivo generado por la plataforma</text>
    </svg>`
  }
  return options.values ? renderMarbeteVisualValues(svg, options.values) : svg
}

function attribute(attributes: string, name: string, fallback = '') {
  const match = new RegExp(`${name}="([^"]*)"`).exec(attributes)
  return match?.[1] ?? fallback
}

function fitLines(value: string, width: number, height: number, preferredSize: number, lineHeightRatio: number) {
  const words = value.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return { lines: [''], fontSize: preferredSize, lineHeight: preferredSize * lineHeightRatio }
  let fontSize = preferredSize
  let best = [value]
  while (fontSize >= 8) {
    const capacity = Math.max(4, Math.floor(width / (fontSize * 0.56)))
    const lines: string[] = []
    for (const word of words) {
      const current = lines[lines.length - 1]
      if (!current || `${current} ${word}`.length > capacity) lines.push(word)
      else lines[lines.length - 1] = `${current} ${word}`
    }
    const lineHeight = fontSize * lineHeightRatio
    const maxLines = Math.max(1, Math.floor(height / lineHeight))
    best = lines
    if (lines.length <= maxLines) return { lines, fontSize, lineHeight }
    fontSize -= 1
  }
  const lineHeight = 8 * lineHeightRatio
  const maxLines = Math.max(1, Math.floor(height / lineHeight))
  const lines = best.slice(0, maxLines)
  if (best.length > maxLines && lines.length) lines[lines.length - 1] = `${lines[lines.length - 1].slice(0, -1)}…`
  return { lines, fontSize: 8, lineHeight }
}

export function renderMarbeteVisualValues(svg: string, values: Record<string, string>) {
  return svg.replace(/<text\b([^>]*\bdata-husky-fit-text="([^"]+)"[^>]*)>[\s\S]*?<\/text>/g, (_match, attrs: string, key: string) => {
    const width = Number(attribute(attrs, 'data-husky-width', '100'))
    const height = Number(attribute(attrs, 'data-husky-height', '24'))
    const x = Number(attribute(attrs, 'data-husky-x', '0'))
    const y = Number(attribute(attrs, 'data-husky-y', '0'))
    const preferredSize = Number(attribute(attrs, 'data-husky-font-size', '16'))
    const lineHeightRatio = Number(attribute(attrs, 'data-husky-line-height', '1.1'))
    const align = attribute(attrs, 'data-husky-align', 'center')
    const weight = attribute(attrs, 'data-husky-font-weight', '700')
    const color = attribute(attrs, 'data-husky-color', '#102A43')
    const shadowColor = attribute(attrs, 'data-husky-shadow-color', '')
    const uppercase = attribute(attrs, 'data-husky-uppercase', '0') === '1'
    const rawValue = String(values[key] || '')
    const value = uppercase ? rawValue.toLocaleUpperCase('es-MX') : rawValue
    const fitted = fitLines(value, width, height, preferredSize, lineHeightRatio)
    const anchor = align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle'
    const anchorX = align === 'left' ? x : align === 'right' ? x + width : x + width / 2
    const blockHeight = fitted.lines.length * fitted.lineHeight
    const firstY = y + (height - blockHeight) / 2 + fitted.fontSize
    const tspans = fitted.lines.map((line, index) => `<tspan x="${anchorX}" y="${firstY + index * fitted.lineHeight}">${escapeXml(line)}</tspan>`).join('')
    const shadowTspans = fitted.lines.map((line, index) => `<tspan x="${anchorX + 1.4}" y="${firstY + index * fitted.lineHeight + 1.8}">${escapeXml(line)}</tspan>`).join('')
    const shadow = shadowColor ? `<text x="${anchorX + 1.4}" y="${firstY + 1.8}" text-anchor="${anchor}" fill="${shadowColor}" opacity="0.68" font-family="Montserrat, Arial, sans-serif" font-size="${fitted.fontSize}" font-weight="${weight}">${shadowTspans}</text>` : ''
    return `${shadow}<text x="${anchorX}" y="${firstY}" text-anchor="${anchor}" fill="${color}" font-family="Montserrat, Arial, sans-serif" font-size="${fitted.fontSize}" font-weight="${weight}">${tspans}</text>`
  })
}

export function marbeteSvgDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function marbeteElementDefinition(kind: MarbeteVisualElementKind) {
  return MARBETE_ELEMENT_DEFINITIONS.find((item) => item.kind === kind) || MARBETE_ELEMENT_DEFINITIONS[0]
}
