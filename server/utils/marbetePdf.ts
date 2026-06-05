import PDFDocument from 'pdfkit'
import SVGtoPDF from 'svg-to-pdfkit'
import { createError } from 'h3'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const MONTSERRAT_SEMIBOLD = require.resolve('@fontsource/montserrat/files/montserrat-latin-ext-600-normal.woff')
const PDF_IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg'])

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

function validateDataImage(value: string) {
  const match = /^data:(image\/[a-z0-9.+-]+);base64,/i.exec(value)
  if (!match) return value
  assertPdfImageMime(match[1].toLowerCase())
  return value
}

async function inlineImage(url: string) {
  const target = decodeEntityUrl(url)
  if (isDataImage(target)) return validateDataImage(target)
  if (!/^https?:\/\//i.test(target)) return null

  let response: Response
  try {
    response = await fetch(target, { signal: AbortSignal.timeout(12000) })
  } catch {
    throw createError({ statusCode: 422, statusMessage: 'No fue posible cargar una imagen requerida para generar el marbete.' })
  }

  if (!response.ok) {
    throw createError({ statusCode: 422, statusMessage: 'No fue posible cargar una imagen requerida para generar el marbete.' })
  }

  const bytes = Buffer.from(await response.arrayBuffer())
  if (!bytes.length) {
    throw createError({ statusCode: 422, statusMessage: 'Una imagen requerida del marbete está vacía.' })
  }

  const mime = assertPdfImageMime(mimeFromContentType(response.headers.get('content-type'), target))
  return `data:${mime};base64,${bytes.toString('base64')}`
}

function imageHrefMatches(svg: string) {
  return Array.from(svg.matchAll(/((?:xlink:)?href)=["']([^"']*)["']/gi))
    .filter((match) => {
      const value = decodeEntityUrl(match[2] || '').trim()
      if (!value || value.startsWith('#')) return false
      return isDataImage(value) || /^https?:\/\//i.test(value)
    })
}

async function inlineSvgImages(svg: string) {
  const matches = imageHrefMatches(svg)
  const replacements = await Promise.all(matches.map(async (match) => {
    const inlined = await inlineImage(match[2])
    if (!inlined) return null
    return { from: match[0], to: `${match[1]}="${inlined}"` }
  }))

  return replacements.reduce((next, replacement) => {
    if (!replacement) return next
    return next.replace(replacement.from, replacement.to)
  }, svg)
}

function forceMontserrat(svg: string) {
  const style = `
    <style>
      text, tspan { font-family: MontserratSemiBold, Montserrat, Arial, sans-serif; font-weight: 600; }
    </style>
  `
  if (/<\/defs>/i.test(svg)) return svg.replace(/<\/defs>/i, `${style}</defs>`)
  return svg.replace(/<svg([^>]*)>/i, `<svg$1><defs>${style}</defs>`)
}

export async function prepareMarbeteSvgForPdf(svg: string) {
  return forceMontserrat(await inlineSvgImages(svg))
}

export async function assertMarbetePdfAssets(svg: string) {
  await inlineSvgImages(svg)
  return { ok: true }
}

export async function renderMarbetePdf(svg: string) {
  const preparedSvg = await prepareMarbeteSvgForPdf(svg)
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

  doc.registerFont('MontserratSemiBold', MONTSERRAT_SEMIBOLD)
  doc.font('MontserratSemiBold')

  const chunks: Buffer[] = []
  doc.on('data', (chunk: Buffer) => chunks.push(chunk))
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.once('end', () => resolve(Buffer.concat(chunks)))
    doc.once('error', reject)
  })

  SVGtoPDF(doc, preparedSvg, 0, 0, {
    assumePt: true,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    preserveAspectRatio: 'xMidYMid meet',
    fontCallback: () => 'MontserratSemiBold'
  })
  doc.end()

  return done
}
