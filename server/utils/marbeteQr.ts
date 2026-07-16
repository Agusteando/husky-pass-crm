import QRCode from 'qrcode'
import { PNG } from 'pngjs'

const QR_ERROR_CORRECTION = 'M' as const
const QR_MARGIN_MODULES = 4
const QR_PIXELS_PER_MODULE = 8
const SCANNER_VALIDATION_ORIGIN = 'https://admin.casitaiedis.edu.mx'
const QR_IMAGE_TOKEN = '{{ getTrustedUrl(data.qrImage) }}'

function safeString(value: unknown) {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

function escapeXml(value: unknown) {
  return safeString(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function svgAttribute(markup: string, name: string) {
  const match = new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i').exec(markup)
  return match?.[2] || ''
}

function numericAttribute(markup: string, name: string, fallback = 0) {
  const value = Number(svgAttribute(markup, name).replace(/[^0-9.+-]/g, ''))
  return Number.isFinite(value) ? value : fallback
}

function svgCanvas(svg: string) {
  const viewBox = /\bviewBox\s*=\s*(["'])\s*([-0-9.]+)\s+([-0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s*\1/i.exec(svg)
  if (viewBox) {
    return {
      minX: Number(viewBox[2]) || 0,
      minY: Number(viewBox[3]) || 0,
      width: Number(viewBox[4]) || 612,
      height: Number(viewBox[5]) || 792
    }
  }
  return {
    minX: 0,
    minY: 0,
    width: numericAttribute(svg, 'width', 612) || 612,
    height: numericAttribute(svg, 'height', 792) || 792
  }
}

function replaceImageHref(markup: string) {
  const openingTag = /^<image\b[^>]*>/i.exec(markup)?.[0] || markup
  const withoutHref = openingTag
    .replace(/\s+(?:xlink:)?href\s*=\s*(["']).*?\1/gi, '')
    .replace(/\s*\/?\s*>$/, '')
  return `${withoutHref} href="${QR_IMAGE_TOKEN}" xlink:href="${QR_IMAGE_TOKEN}"/>`
}

/**
 * Guarantees that every marbete SVG has one dynamic QR slot. Existing editor
 * slots keep their saved position. Older SVGs with a QR-labelled image are
 * migrated in place. SVGs without any QR area receive a safe default slot.
 */
export function ensureMarbeteQrSlot(svgInput: unknown) {
  const svg = safeString(svgInput)
  if (!/<svg\b/i.test(svg)) return svg
  if (/data-husky-qr-vector\s*=|data\.qrImage\b/i.test(svg)) return svg

  let migrated = false
  const withMigratedSlot = svg.replace(/<image\b[^>]*(?:id|class)\s*=\s*(["'])[^"']*qr[^"']*\1[^>]*(?:\/>|>\s*<\/image>)/gi, (markup) => {
    if (migrated) return markup
    migrated = true
    return replaceImageHref(markup)
  })
  if (migrated) return withMigratedSlot

  const canvas = svgCanvas(svg)
  const size = Math.max(72, Math.min(canvas.width * 0.19, canvas.height * 0.147))
  const x = canvas.minX + canvas.width * 0.52
  const y = canvas.minY + canvas.height * 0.622
  const slot = `<g id="husky-required-qr" data-marbete-layer-kind="qr"><image x="${x.toFixed(3)}" y="${y.toFixed(3)}" width="${size.toFixed(3)}" height="${size.toFixed(3)}" href="${QR_IMAGE_TOKEN}" xlink:href="${QR_IMAGE_TOKEN}" preserveAspectRatio="xMidYMid meet"/></g>`
  return svg.replace(/<\/svg>\s*$/i, `${slot}</svg>`)
}

function qrVectorMarkup(imageMarkup: string, payload: string) {
  const x = numericAttribute(imageMarkup, 'x')
  const y = numericAttribute(imageMarkup, 'y')
  const width = numericAttribute(imageMarkup, 'width', 116) || 116
  const height = numericAttribute(imageMarkup, 'height', 116) || 116

  const qr = QRCode.create(payload, { errorCorrectionLevel: QR_ERROR_CORRECTION })
  const moduleCount = qr.modules.size
  const matrix = qr.modules.data as unknown as ArrayLike<number | boolean>
  const totalModules = moduleCount + QR_MARGIN_MODULES * 2
  const scale = Math.min(width, height) / totalModules
  const renderedSize = totalModules * scale
  const originX = x + (width - renderedSize) / 2 + QR_MARGIN_MODULES * scale
  const originY = y + (height - renderedSize) / 2 + QR_MARGIN_MODULES * scale
  const fixed = (value: number) => Number(value.toFixed(4))
  const path: string[] = []

  for (let row = 0; row < moduleCount; row += 1) {
    let column = 0
    while (column < moduleCount) {
      if (!matrix[row * moduleCount + column]) {
        column += 1
        continue
      }
      const start = column
      while (column < moduleCount && matrix[row * moduleCount + column]) column += 1
      const runWidth = (column - start) * scale
      path.push(`M${fixed(originX + start * scale)} ${fixed(originY + row * scale)}h${fixed(runWidth)}v${fixed(scale)}h-${fixed(runWidth)}z`)
    }
  }

  const id = svgAttribute(imageMarkup, 'id')
  const className = svgAttribute(imageMarkup, 'class')
  const transform = svgAttribute(imageMarkup, 'transform')
  const opacity = svgAttribute(imageMarkup, 'opacity')
  const clipPath = svgAttribute(imageMarkup, 'clip-path')
  const preserved = [
    id ? `id="${escapeXml(id)}"` : '',
    className ? `class="${escapeXml(className)}"` : '',
    transform ? `transform="${escapeXml(transform)}"` : '',
    opacity ? `opacity="${escapeXml(opacity)}"` : '',
    clipPath ? `clip-path="${escapeXml(clipPath)}"` : ''
  ].filter(Boolean).join(' ')

  return `<g ${preserved} data-husky-qr-vector="1" aria-label="Código QR"><rect x="${fixed(x)}" y="${fixed(y)}" width="${fixed(width)}" height="${fixed(height)}" fill="#FFFFFF"/><path d="${path.join('')}" fill="#111111" shape-rendering="crispEdges"/></g>`
}

/**
 * Replaces the dynamic QR image node with native SVG geometry. This keeps the
 * editor's saved position/rotation and avoids image-decoder differences in
 * SVG-to-PDF renderers.
 */
export function renderMarbeteQrVector(svgInput: unknown, value: unknown) {
  const payload = safeString(value).trim()
  const svg = ensureMarbeteQrSlot(svgInput)
  if (!payload) return svg

  return svg.replace(/<image\b[^>]*\{\{\s*getTrustedUrl\(data\.qrImage\)\s*\}\}[^>]*(?:\/>|>\s*<\/image>)/gi, (markup) => qrVectorMarkup(markup, payload))
}

export function marbeteValidationUrl(_origin: string, authorizedPersonId: unknown) {
  const id = safeString(authorizedPersonId).trim()
  return id ? `${SCANNER_VALIDATION_ORIGIN}/validar/persona-autorizada/${encodeURIComponent(id)}` : ''
}

export function marbeteQrDataUrl(value: string) {
  const payload = safeString(value).trim()
  if (!payload) return ''

  const qr = QRCode.create(payload, { errorCorrectionLevel: QR_ERROR_CORRECTION })
  const moduleCount = qr.modules.size
  const matrix = qr.modules.data as unknown as ArrayLike<number | boolean>
  const imageSize = (moduleCount + QR_MARGIN_MODULES * 2) * QR_PIXELS_PER_MODULE
  const png = new PNG({ width: imageSize, height: imageSize, colorType: 6 })

  for (let y = 0; y < imageSize; y += 1) {
    for (let x = 0; x < imageSize; x += 1) {
      const moduleX = Math.floor(x / QR_PIXELS_PER_MODULE) - QR_MARGIN_MODULES
      const moduleY = Math.floor(y / QR_PIXELS_PER_MODULE) - QR_MARGIN_MODULES
      const isDark = moduleX >= 0
        && moduleY >= 0
        && moduleX < moduleCount
        && moduleY < moduleCount
        && Boolean(matrix[moduleY * moduleCount + moduleX])
      const offset = (imageSize * y + x) * 4
      const channel = isDark ? 17 : 255
      png.data[offset] = channel
      png.data[offset + 1] = channel
      png.data[offset + 2] = channel
      png.data[offset + 3] = 255
    }
  }

  return `data:image/png;base64,${PNG.sync.write(png).toString('base64')}`
}
