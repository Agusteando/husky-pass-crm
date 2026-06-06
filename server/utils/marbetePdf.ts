import { createError } from 'h3'
import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawn } from 'node:child_process'

const FRIENDLY_TEXT_MESSAGE = 'Necesitamos completar algunos datos antes de descargar el Husky Pass.'
const FRIENDLY_IMAGE_MESSAGE = 'Para descargar el Husky Pass, actualiza la foto de la persona autorizada o solicita apoyo a la escuela.'
const FRIENDLY_RENDER_MESSAGE = 'No pudimos preparar el Husky Pass en este momento. Intenta nuevamente o solicita apoyo a la escuela.'
const LOCAL_MONTSERRAT_CANDIDATES = [
  resolve(process.cwd(), 'public/fonts/Montserrat-SemiBold.ttf'),
  resolve(process.cwd(), 'public/fonts/Montserrat-SemiBold.woff2'),
  resolve(process.cwd(), 'public/fonts/Montserrat.ttf'),
  resolve(process.cwd(), 'node_modules/@fontsource/montserrat/files/montserrat-latin-600-normal.woff2'),
  resolve(process.cwd(), 'node_modules/@fontsource/montserrat/files/montserrat-latin-ext-600-normal.woff2')
]
const CHROMIUM_CANDIDATES = [
  process.env.HUSKY_PASS_CHROMIUM_PATH || '',
  process.env.CHROMIUM_PATH || '',
  process.env.PUPPETEER_EXECUTABLE_PATH || '',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
]

export interface MarbetePdfInput {
  templateSvg: string
  renderedSvg: string
  values: Record<string, string>
  origin: string
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
    .replace(/&apos;/g, "'")
}

function encodeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function mimeFromContentType(contentType: string | null, url: string) {
  const type = String(contentType || '').split(';')[0].trim().toLowerCase()
  if (type.startsWith('image/')) return type
  if (/\.jpe?g($|[?#])/i.test(url)) return 'image/jpeg'
  if (/\.png($|[?#])/i.test(url)) return 'image/png'
  if (/\.webp($|[?#])/i.test(url)) return 'image/webp'
  if (/\.svg($|[?#])/i.test(url)) return 'image/svg+xml'
  return 'image/png'
}

function assertRenderableImageMime(mime: string) {
  const normalized = mime === 'image/jpg' ? 'image/jpeg' : mime
  if (normalized.startsWith('image/')) return normalized
  throw createError({ statusCode: 422, statusMessage: FRIENDLY_IMAGE_MESSAGE })
}

function isDataImage(value: string) {
  return /^data:image\//i.test(value)
}

function parseDataImage(value: string): LoadedImage | null {
  const match = /^data:(image\/[a-z0-9.+-]+)(;base64)?,(.+)$/is.exec(value.trim())
  if (!match) return null
  const mime = assertRenderableImageMime(match[1].toLowerCase())
  const payload = match[3].trim()
  const bytes = match[2]
    ? Buffer.from(payload.replace(/\s/g, ''), 'base64')
    : Buffer.from(decodeURIComponent(payload), 'utf8')
  return bytes.length ? { bytes, mime } : null
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
  if (!bytes.length) throw createError({ statusCode: 422, statusMessage: FRIENDLY_IMAGE_MESSAGE })
  return { bytes, mime: assertRenderableImageMime(mimeFromContentType(null, localPath)) }
}

async function loadImage(value: string, origin: string): Promise<LoadedImage> {
  const target = decodeEntityUrl(value).trim()
  if (!target) throw createError({ statusCode: 422, statusMessage: FRIENDLY_IMAGE_MESSAGE })

  if (isDataImage(target)) {
    const parsed = parseDataImage(target)
    if (!parsed) throw createError({ statusCode: 422, statusMessage: FRIENDLY_IMAGE_MESSAGE })
    return parsed
  }

  const local = await loadLocalPublicImage(target, origin)
  if (local) return local

  if (!/^https?:\/\//i.test(target)) {
    throw createError({ statusCode: 422, statusMessage: FRIENDLY_IMAGE_MESSAGE })
  }

  let response: Response
  try {
    response = await fetch(target, { signal: AbortSignal.timeout(15000) })
  } catch {
    throw createError({ statusCode: 422, statusMessage: FRIENDLY_IMAGE_MESSAGE })
  }

  if (!response.ok) throw createError({ statusCode: 422, statusMessage: FRIENDLY_IMAGE_MESSAGE })
  const bytes = Buffer.from(await response.arrayBuffer())
  if (!bytes.length) throw createError({ statusCode: 422, statusMessage: FRIENDLY_IMAGE_MESSAGE })

  return {
    bytes,
    mime: assertRenderableImageMime(mimeFromContentType(response.headers.get('content-type'), target))
  }
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

function dynamicTextTokens(svg: string) {
  return Array.from(svg.matchAll(/{{\s*data\.([A-Za-z0-9_]+)\s*}}/g)).map((match) => match[1])
}

function dynamicImageTokens(svg: string) {
  return Array.from(svg.matchAll(/{{\s*getTrustedUrl\(data\.([A-Za-z0-9_]+)\)\s*}}/g)).map((match) => match[1])
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function requiredTextKeys(input: MarbetePdfInput) {
  return unique([
    ...dynamicTextTokens(input.templateSvg),
    'nombreP',
    'paternoP',
    'parenP',
    'fullnameP',
    'fullnameA',
    'matricula'
  ])
}

function requiredImageKeys(input: MarbetePdfInput) {
  return unique(dynamicImageTokens(input.templateSvg))
}

function chromiumPath() {
  return CHROMIUM_CANDIDATES.find((candidate) => candidate && existsSync(candidate)) || ''
}

async function fontFaceCss() {
  const fontPath = LOCAL_MONTSERRAT_CANDIDATES.find((candidate) => candidate && existsSync(candidate)) || ''
  if (!fontPath) return ''
  const bytes = await readFile(fontPath)
  const format = fontPath.endsWith('.woff2') ? 'woff2' : 'truetype'
  const mime = fontPath.endsWith('.woff2') ? 'font/woff2' : 'font/ttf'
  const source = `url(data:${mime};base64,${bytes.toString('base64')}) format('${format}')`
  return `@font-face{font-family:'Montserrat';src:${source};font-weight:600;font-style:normal;font-display:block;}@font-face{font-family:'Montserrat SemiBold';src:${source};font-weight:600;font-style:normal;font-display:block;}@font-face{font-family:'Montserrat-SemiBold';src:${source};font-weight:600;font-style:normal;font-display:block;}`
}

function supplementalDataLayer(values: Record<string, string>) {
  const studentLine = [values.fullnameA, values.matricula].filter(Boolean).join(' · ')
  const groupLine = [values.plantel, values.nivelEdu || values.nivel, values.gradoA || values.grado, values.grupoA || values.grupo].filter(Boolean).join(' / ')
  if (!studentLine && !groupLine) return ''
  return `<section class="hp-pdf-context" aria-label="Datos escolares del Husky Pass">
    <strong>${encodeHtml(studentLine)}</strong>
    <span>${encodeHtml(groupLine)}</span>
  </section>`
}

async function composeMarbeteHtml(input: MarbetePdfInput) {
  const completeSvg = await inlineSvgImages(input.renderedSvg, input.origin)
  if (/{{\s*[^}]+\s*}}/.test(completeSvg)) {
    throw createError({ statusCode: 422, statusMessage: FRIENDLY_TEXT_MESSAGE })
  }
  const fontCss = await fontFaceCss()
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
${fontCss}
@page { size: 8.5in 11in; margin: 0; }
html, body { margin: 0; padding: 0; width: 8.5in; height: 11in; background: #fff; }
body { font-family: 'Montserrat', Arial, sans-serif; font-weight: 600; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
.hp-page { position: relative; width: 8.5in; height: 11in; overflow: hidden; background: #fff; }
.hp-page svg { display: block; width: 8.5in; height: 11in; }
.hp-pdf-context { position: absolute; left: 0.72in; right: 0.72in; bottom: 0.34in; display: grid; gap: 0.03in; color: #55585f; font-size: 8.5pt; line-height: 1.15; letter-spacing: 0.01em; }
.hp-pdf-context strong, .hp-pdf-context span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
</head>
<body>
  <main class="hp-page">
    ${completeSvg}
    ${supplementalDataLayer(input.values)}
  </main>
</body>
</html>`
}

function runChromium(executable: string, htmlFile: string, pdfFile: string) {
  const args = [
    '--headless=new',
    '--disable-background-networking',
    '--disable-breakpad',
    '--disable-crash-reporter',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--disable-gpu',
    '--disable-sync',
    '--hide-scrollbars',
    '--no-default-browser-check',
    '--no-first-run',
    '--no-pdf-header-footer',
    '--no-sandbox',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=10000',
    `--user-data-dir=${join(htmlFile, '..', 'chrome-profile')}`,
    `--print-to-pdf=${pdfFile}`,
    `file://${htmlFile}`
  ]

  return new Promise<void>((resolveRun, rejectRun) => {
    const child = spawn(executable, args, { stdio: ['ignore', 'ignore', 'pipe'] })
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      rejectRun(createError({ statusCode: 503, statusMessage: FRIENDLY_RENDER_MESSAGE }))
    }, 30000)

    child.once('error', () => {
      clearTimeout(timer)
      rejectRun(createError({ statusCode: 503, statusMessage: FRIENDLY_RENDER_MESSAGE }))
    })
    child.once('exit', (code) => {
      clearTimeout(timer)
      if (code === 0) resolveRun()
      else rejectRun(createError({ statusCode: 503, statusMessage: FRIENDLY_RENDER_MESSAGE }))
    })
  })
}

async function renderHtmlToPdf(html: string) {
  const executable = chromiumPath()
  if (!executable) throw createError({ statusCode: 503, statusMessage: FRIENDLY_RENDER_MESSAGE })

  const workDir = join(tmpdir(), `husky-pass-${randomUUID()}`)
  await mkdir(workDir, { recursive: true })
  const htmlFile = join(workDir, 'husky-pass.html')
  const pdfFile = join(workDir, 'husky-pass.pdf')

  try {
    await writeFile(htmlFile, html, 'utf8')
    await runChromium(executable, htmlFile, pdfFile)
    const pdf = await readFile(pdfFile)
    if (pdf.length < 1024) throw createError({ statusCode: 503, statusMessage: FRIENDLY_RENDER_MESSAGE })
    return pdf
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined)
  }
}

export async function prepareMarbeteSvgForPdf(svg: string, origin = '') {
  return inlineSvgImages(svg, origin)
}

export async function assertMarbetePdfAssets(input: string | MarbetePdfInput) {
  if (typeof input === 'string') {
    await inlineSvgImages(input)
    return { ok: true }
  }

  const missingText = requiredTextKeys(input).filter((key) => !String(input.values[key] || '').trim())
  if (missingText.length) throw createError({ statusCode: 422, statusMessage: FRIENDLY_TEXT_MESSAGE })

  const missingImages = requiredImageKeys(input).filter((key) => !String(input.values[key] || '').trim())
  if (missingImages.length) throw createError({ statusCode: 422, statusMessage: FRIENDLY_IMAGE_MESSAGE })

  await Promise.all(requiredImageKeys(input).map((key) => loadImage(input.values[key], input.origin)))
  await inlineSvgImages(input.renderedSvg, input.origin)
  return { ok: true }
}

export async function renderMarbetePdf(input: string | MarbetePdfInput) {
  const pdfInput = typeof input === 'string'
    ? { templateSvg: input, renderedSvg: input, values: {}, origin: '' }
    : input

  await assertMarbetePdfAssets(pdfInput)
  const html = await composeMarbeteHtml(pdfInput)
  return renderHtmlToPdf(html)
}
