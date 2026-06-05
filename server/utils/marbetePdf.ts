import PDFDocument from 'pdfkit'
import SVGtoPDF from 'svg-to-pdfkit'
import { createError } from 'h3'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const PDF_IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg'])
const REQUIRED_TEXT_MESSAGE = 'El Husky Pass no tiene todos los datos requeridos para generar el PDF.'
const REQUIRED_IMAGE_MESSAGE = 'No fue posible cargar una imagen requerida para generar el Husky Pass.'
const LOCAL_MONTSERRAT_CANDIDATES = [
  resolve(process.cwd(), 'public/fonts/Montserrat-SemiBold.ttf'),
  resolve(process.cwd(), 'public/fonts/Montserrat.ttf')
]

export interface MarbetePdfInput {
  templateSvg: string
  renderedSvg: string
  values: Record<string, string>
  origin: string
}

interface SvgImageOverlay {
  key: string
  src: string
  x: number
  y: number
  width: number
  height: number
}

interface LoadedImage {
  bytes: Buffer
  mime: string
}

function decodeEntityUrl(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function mimeFromContentType(contentType: string | null, url: string) {
  const type = String(contentType || '').split(';')[0].trim().toLowerCase()
  if (type.startsWith('image/')) return type
  if (/\.jpe?g($|[?#])/i.test(url)) return 'image/jpeg'
  if (/\.webp($|[?#])/i.test(url)) return 'image/webp'
  if (/\.svg($|[?#])/i.test(url)) return 'image/svg+xml'
  return 'image/png'
}

function assertPdfImageMime(mime: string) {
  const normalized = mime === 'image/jpg' ? 'image/jpeg' : mime
  if (PDF_IMAGE_MIME_TYPES.has(normalized)) return normalized
  if (normalized === 'image/webp') {
    throw createError({ statusCode: 422, statusMessage: 'La foto debe estar en PNG o JPG para generar el PDF. Vuelve a cargar la imagen en formato compatible.' })
  }
  throw createError({ statusCode: 422, statusMessage: 'Una imagen requerida del marbete no tiene un formato compatible para PDF.' })
}

function isDataImage(value: string) {
  return /^data:image\//i.test(value)
}

function stripDataUriHeader(value: string) {
  const match = /^data:(image\/[a-z0-9.+-]+);base64,(.+)$/is.exec(value.trim())
  if (!match) return null
  return { mime: assertPdfImageMime(match[1].toLowerCase()), base64: match[2].replace(/\s/g, '') }
}

function localPublicPathFromUrl(value: string, origin: string) {
  const raw = decodeEntityUrl(value).trim()
  if (!raw || raw.startsWith('data:')) return ''

  let pathname = ''
  try {
    if (/^https?:\/\//i.test(raw)) {
      const url = new URL(raw)
      const requestOrigin = origin ? new URL(origin).origin : ''
      if (requestOrigin && url.origin !== requestOrigin) return ''
      pathname = url.pathname
    } else if (raw.startsWith('/')) {
      pathname = raw.split('?')[0].split('#')[0]
    }
  } catch {
    return ''
  }

  if (!pathname || pathname.includes('\0')) return ''
  const root = resolve(process.cwd(), 'public')
  const target = resolve(root, pathname.replace(/^\/+/, ''))
  if (!target.startsWith(`${root}/`) && target !== root) return ''
  return target
}

async function loadLocalPublicImage(value: string, origin: string): Promise<LoadedImage | null> {
  const localPath = localPublicPathFromUrl(value, origin)
  if (!localPath || !existsSync(localPath)) return null
  const bytes = await readFile(localPath)
  if (!bytes.length) {
    throw createError({ statusCode: 422, statusMessage: 'Una imagen requerida del marbete está vacía.' })
  }
  return { bytes, mime: assertPdfImageMime(mimeFromContentType(null, localPath)) }
}

async function loadImage(value: string, origin: string): Promise<LoadedImage> {
  const target = decodeEntityUrl(value).trim()
  if (!target) throw createError({ statusCode: 422, statusMessage: REQUIRED_IMAGE_MESSAGE })

  if (isDataImage(target)) {
    const parsed = stripDataUriHeader(target)
    if (!parsed) throw createError({ statusCode: 422, statusMessage: 'Una imagen requerida del marbete no está codificada correctamente.' })
    const bytes = Buffer.from(parsed.base64, 'base64')
    if (!bytes.length) throw createError({ statusCode: 422, statusMessage: 'Una imagen requerida del marbete está vacía.' })
    return { bytes, mime: parsed.mime }
  }

  const local = await loadLocalPublicImage(target, origin)
  if (local) return local

  if (!/^https?:\/\//i.test(target)) {
    throw createError({ statusCode: 422, statusMessage: REQUIRED_IMAGE_MESSAGE })
  }

  let response: Response
  try {
    response = await fetch(target, { signal: AbortSignal.timeout(12000) })
  } catch {
    throw createError({ statusCode: 422, statusMessage: REQUIRED_IMAGE_MESSAGE })
  }

  if (!response.ok) throw createError({ statusCode: 422, statusMessage: REQUIRED_IMAGE_MESSAGE })

  const bytes = Buffer.from(await response.arrayBuffer())
  if (!bytes.length) throw createError({ statusCode: 422, statusMessage: 'Una imagen requerida del marbete está vacía.' })

  const mime = assertPdfImageMime(mimeFromContentType(response.headers.get('content-type'), target))
  return { bytes, mime }
}

async function inlineImage(url: string, origin = '') {
  const image = await loadImage(url, origin)
  return `data:${image.mime};base64,${image.bytes.toString('base64')}`
}

function imageHrefMatches(svg: string) {
  return Array.from(svg.matchAll(/((?:xlink:)?href)=["']([^"']*)["']/gi))
    .filter((match) => {
      const value = decodeEntityUrl(match[2] || '').trim()
      if (!value || value.startsWith('#') || isDataImage(value)) return false
      return /^https?:\/\//i.test(value) || value.startsWith('/')
    })
}

async function inlineSvgImages(svg: string, origin = '') {
  const matches = imageHrefMatches(svg)
  const replacements = await Promise.all(matches.map(async (match) => {
    const inlined = await inlineImage(match[2], origin)
    return { from: match[0], to: `${match[1]}="${inlined}"` }
  }))

  return replacements.reduce((next, replacement) => next.replace(replacement.from, replacement.to), svg)
}

function getAttr(tag: string, name: string) {
  const match = new RegExp(`${name}=["']([^"']*)["']`, 'i').exec(tag)
  return match?.[1] || ''
}

function getHref(tag: string) {
  const match = /(?:xlink:)?href=["']([^"']*)["']/i.exec(tag)
  return match?.[1] || ''
}

function numberAttr(tag: string, name: string, fallback = 0) {
  const parsed = Number.parseFloat(getAttr(tag, name))
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseTransform(transform: string) {
  let x = 0
  let y = 0
  let scaleX = 1
  let scaleY = 1

  const translate = /translate\(([-0-9.]+)(?:[ ,]+([-0-9.]+))?\)/i.exec(transform)
  if (translate) {
    x = Number.parseFloat(translate[1]) || 0
    y = Number.parseFloat(translate[2] || '0') || 0
  }

  const scale = /scale\(([-0-9.]+)(?:[ ,]+([-0-9.]+))?\)/i.exec(transform)
  if (scale) {
    scaleX = Number.parseFloat(scale[1]) || 1
    scaleY = Number.parseFloat(scale[2] || scale[1]) || scaleX
  }

  return { x, y, scaleX, scaleY }
}

function parseImageOverlays(templateSvg: string, values: Record<string, string>): SvgImageOverlay[] {
  const overlays: SvgImageOverlay[] = []
  for (const match of templateSvg.matchAll(/<image\b[^>]*(?:\/>|>[\s\S]*?<\/image>)/gi)) {
    const tag = match[0]
    const href = getHref(tag)
    const token = /{{\s*getTrustedUrl\(data\.([A-Za-z0-9_]+)\)\s*}}/i.exec(href)
    if (!token) continue
    const key = token[1]
    const src = decodeEntityUrl(values[key] || '')
    if (!src) continue
    const transform = parseTransform(getAttr(tag, 'transform'))
    overlays.push({
      key,
      src,
      x: transform.x || numberAttr(tag, 'x'),
      y: transform.y || numberAttr(tag, 'y'),
      width: numberAttr(tag, 'width') * transform.scaleX,
      height: numberAttr(tag, 'height') * transform.scaleY
    })
  }
  return overlays
}

function dynamicTextTokens(svg: string) {
  return Array.from(svg.matchAll(/{{\s*data\.([A-Za-z0-9_]+)\s*}}/g)).map((match) => match[1])
}

function dynamicImageTokens(svg: string) {
  return Array.from(svg.matchAll(/{{\s*getTrustedUrl\(data\.([A-Za-z0-9_]+)\)\s*}}/g)).map((match) => match[1])
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function removeDynamicSvgImages(svg: string) {
  return svg.replace(/<image\b[^>]*(?:\/>|>[\s\S]*?<\/image>)/gi, (tag) => {
    const marker = `${getAttr(tag, 'id')} ${getAttr(tag, 'data-name')}`.toUpperCase()
    return /\b(?:FOTO_IMAGEN|FOTO IMAGEN|QR_IMAGEN|QR IMAGEN)\b/.test(marker) ? '' : tag
  })
}

function preferredMontserratFont() {
  return LOCAL_MONTSERRAT_CANDIDATES.find((candidate) => existsSync(candidate)) || ''
}

function registerPreferredFont(doc: PDFKit.PDFDocument) {
  const localFont = preferredMontserratFont()
  if (!localFont) return ''
  doc.registerFont('MontserratSemiBold', localFont)
  return 'MontserratSemiBold'
}

export async function prepareMarbeteSvgForPdf(svg: string, origin = '') {
  return inlineSvgImages(svg, origin)
}

export async function assertMarbetePdfAssets(input: string | MarbetePdfInput) {
  if (typeof input === 'string') {
    await inlineSvgImages(input)
    return { ok: true }
  }

  const missingText = unique(dynamicTextTokens(input.templateSvg))
    .filter((key) => !String(input.values[key] || '').trim())
  if (missingText.length) {
    throw createError({ statusCode: 422, statusMessage: REQUIRED_TEXT_MESSAGE })
  }

  const imageKeys = unique(dynamicImageTokens(input.templateSvg))
  const missingImages = imageKeys.filter((key) => !String(input.values[key] || '').trim())
  if (missingImages.length) {
    throw createError({ statusCode: 422, statusMessage: REQUIRED_IMAGE_MESSAGE })
  }

  const imageOverlays = parseImageOverlays(input.templateSvg, input.values)
  if (imageKeys.length && imageOverlays.length < imageKeys.length) {
    throw createError({ statusCode: 422, statusMessage: REQUIRED_IMAGE_MESSAGE })
  }

  await Promise.all(imageOverlays.map((image) => loadImage(image.src, input.origin)))
  return { ok: true }
}

async function drawDynamicImages(doc: PDFKit.PDFDocument, input: MarbetePdfInput) {
  const imageOverlays = parseImageOverlays(input.templateSvg, input.values)
  for (const image of imageOverlays) {
    const loaded = await loadImage(image.src, input.origin)
    doc.image(loaded.bytes, image.x, image.y, {
      fit: [image.width, image.height],
      align: 'center',
      valign: 'center'
    })
  }
}

export async function renderMarbetePdf(input: string | MarbetePdfInput) {
  const pdfInput = typeof input === 'string'
    ? { templateSvg: input, renderedSvg: input, values: {}, origin: '' }
    : input

  await assertMarbetePdfAssets(pdfInput)
  const svgWithText = removeDynamicSvgImages(pdfInput.renderedSvg)
  const preparedSvg = await prepareMarbeteSvgForPdf(svgWithText, pdfInput.origin)
  const doc = new PDFDocument({
    size: [PAGE_WIDTH, PAGE_HEIGHT],
    margin: 0,
    compress: true,
    autoFirstPage: true,
    info: {
      Title: 'Marbete Husky Pass',
      Creator: 'Husky Pass'
    }
  })

  const preferredFont = registerPreferredFont(doc)
  if (preferredFont) doc.font(preferredFont)

  const chunks: Buffer[] = []
  doc.on('data', (chunk: Buffer) => chunks.push(chunk))
  const done = new Promise<Buffer>((resolveDone, reject) => {
    doc.once('end', () => resolveDone(Buffer.concat(chunks)))
    doc.once('error', reject)
  })

  SVGtoPDF(doc, preparedSvg, 0, 0, {
    assumePt: true,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    preserveAspectRatio: 'xMidYMid meet',
    fontCallback: preferredFont ? () => preferredFont : undefined
  })

  await drawDynamicImages(doc, pdfInput)
  doc.end()

  return done
}
