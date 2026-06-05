import PDFDocument from 'pdfkit'
import SVGtoPDF from 'svg-to-pdfkit'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const MONTSERRAT_SEMIBOLD = require.resolve('@fontsource/montserrat/files/montserrat-latin-ext-600-normal.woff')

function decodeEntityUrl(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function mimeFromContentType(contentType: string | null, url: string) {
  const type = String(contentType || '').split(';')[0].trim()
  if (type.startsWith('image/')) return type
  if (/\.jpe?g($|\?)/i.test(url)) return 'image/jpeg'
  if (/\.webp($|\?)/i.test(url)) return 'image/webp'
  if (/\.svg($|\?)/i.test(url)) return 'image/svg+xml'
  return 'image/png'
}

async function inlineImage(url: string) {
  const target = decodeEntityUrl(url)
  if (!/^https?:\/\//i.test(target)) return null
  try {
    const response = await fetch(target)
    if (!response.ok) return null
    const bytes = Buffer.from(await response.arrayBuffer())
    const mime = mimeFromContentType(response.headers.get('content-type'), target)
    return `data:${mime};base64,${bytes.toString('base64')}`
  } catch {
    return null
  }
}

async function inlineRemoteSvgImages(svg: string) {
  const matches = Array.from(svg.matchAll(/((?:xlink:)?href)=["'](https?:\/\/[^"']+)["']/gi))
  const replacements = await Promise.all(matches.map(async (match) => {
    const inlined = await inlineImage(match[2])
    return inlined ? { from: match[0], to: `${match[1]}="${inlined}"` } : null
  }))

  return replacements.reduce((next, replacement) => {
    if (!replacement) return next
    return next.replace(replacement.from, replacement.to)
  }, svg)
}

function forceMontserrat(svg: string) {
  const style = `
    <style>
      text, tspan { font-family: MontserratSemiBold, Montserrat, Arial, sans-serif !important; font-weight: 600 !important; }
    </style>
  `
  if (/<defs[\s>]/i.test(svg)) return svg.replace(/<defs([^>]*)>/i, `<defs$1>${style}`)
  return svg.replace(/<svg([^>]*)>/i, `<svg$1><defs>${style}</defs>`)
}

export async function renderMarbetePdf(svg: string) {
  const preparedSvg = forceMontserrat(await inlineRemoteSvgImages(svg))
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
