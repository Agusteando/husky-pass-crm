import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { spawn } from 'node:child_process'
import PDFDocument from 'pdfkit'
import SVGtoPDF from 'svg-to-pdfkit'
import { useStorage } from 'nitropack/runtime'
import { logPersonasDebug, logPersonasWarning } from '~/server/utils/personasDiagnostics'
import { publicError } from '~/server/utils/httpError'

const FRIENDLY_TEXT_MESSAGE = 'Necesitamos completar algunos datos antes de descargar el Husky Pass.'
const FRIENDLY_IMAGE_MESSAGE = 'Para descargar el Husky Pass, actualiza la foto de la persona autorizada o solicita apoyo a la escuela.'
const FRIENDLY_RENDER_MESSAGE = 'No pudimos preparar el Husky Pass en este momento. Intenta nuevamente o solicita apoyo a la escuela.'
const LOCAL_MONTSERRAT_CANDIDATES = [
  resolve(process.cwd(), 'public/fonts/Montserrat-SemiBold.ttf'),
  resolve(process.cwd(), 'public/fonts/Montserrat-SemiBold.woff2'),
  resolve(process.cwd(), 'public/fonts/Montserrat.ttf'),
  resolve(process.cwd(), 'node_modules/@fontsource/montserrat/files/montserrat-latin-600-normal.woff'),
  resolve(process.cwd(), 'node_modules/@fontsource/montserrat/files/montserrat-latin-600-normal.woff2'),
  resolve(process.cwd(), 'node_modules/@fontsource/montserrat/files/montserrat-latin-ext-600-normal.woff'),
  resolve(process.cwd(), 'node_modules/@fontsource/montserrat/files/montserrat-latin-ext-600-normal.woff2')
]
const PUBLIC_MONTSERRAT_FILES = [
  'Montserrat-SemiBold.ttf',
  'Montserrat-SemiBold.woff2'
]
const CHROMIUM_CANDIDATES = [
  process.env.HUSKY_PASS_CHROMIUM_PATH || '',
  process.env.CHROMIUM_PATH || '',
  process.env.PUPPETEER_EXECUTABLE_PATH || '',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
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

type MarbetePdfDiagnosticCode =
  | 'missing-required-field'
  | 'missing-required-image'
  | 'invalid-image-url'
  | 'image-fetch-failed'
  | 'image-empty'
  | 'unsupported-image-mime'
  | 'unresolved-svg-token'
  | 'font-not-found'
  | 'chromium-not-found'
  | 'chromium-render-failed'
  | 'pdf-invalid'

function diagnosticError(statusCode: number, statusMessage: string, code: MarbetePdfDiagnosticCode, details: Record<string, unknown> = {}) {
  logPersonasWarning(`marbete-pdf-${code}`, details)
  return publicError(statusCode, statusMessage, undefined, {
    diagnostic: {
      code,
      ...details
    }
  })
}

function publicDiagnosticUrl(value: string) {
  const target = decodeEntityUrl(value).trim()
  if (!target) return ''
  if (target.startsWith('data:')) return `${target.slice(0, 32)}...`
  try {
    const url = new URL(target)
    return `${url.origin}${url.pathname}`
  } catch {
    return target.slice(0, 180)
  }
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
  throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, 'unsupported-image-mime', { mime })
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
  const pathFromRoot = relative(root, target)
  if (pathFromRoot.startsWith('..') || resolve(pathFromRoot) === pathFromRoot) return ''
  return target
}

async function loadLocalPublicImage(value: string, origin: string): Promise<LoadedImage | null> {
  const localPath = localPublicPathFromUrl(value, origin)
  if (!localPath || !existsSync(localPath)) return null
  const bytes = await readFile(localPath)
  if (!bytes.length) throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, 'image-empty', { source: value, resolvedPath: localPath })
  return { bytes, mime: assertRenderableImageMime(mimeFromContentType(null, localPath)) }
}

function absoluteSameOriginUrl(value: string, origin: string) {
  if (!value.startsWith('/') || !origin) return value
  return `${origin.replace(/\/$/, '')}${value}`
}

async function loadImage(value: string, origin: string, key = 'image'): Promise<LoadedImage> {
  const target = decodeEntityUrl(value).trim()
  if (!target) throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, 'invalid-image-url', { key, reason: 'empty' })

  if (isDataImage(target)) {
    const parsed = parseDataImage(target)
    if (!parsed) throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, 'invalid-image-url', { key, reason: 'invalid-data-image' })
    return parsed
  }

  const local = await loadLocalPublicImage(target, origin)
  if (local) return local

  const fetchTarget = absoluteSameOriginUrl(target, origin)
  if (!/^https?:\/\//i.test(fetchTarget)) {
    throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, 'invalid-image-url', { key, url: publicDiagnosticUrl(target), reason: 'not-http-or-public' })
  }

  let response: Response
  try {
    response = await fetch(fetchTarget, { signal: AbortSignal.timeout(15000) })
  } catch (error) {
    throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, 'image-fetch-failed', {
      key,
      url: publicDiagnosticUrl(fetchTarget),
      message: error instanceof Error ? error.message : String(error)
    })
  }

  if (!response.ok) {
    throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, 'image-fetch-failed', {
      key,
      url: publicDiagnosticUrl(fetchTarget),
      status: response.status,
      statusText: response.statusText
    })
  }
  const bytes = Buffer.from(await response.arrayBuffer())
  if (!bytes.length) throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, 'image-empty', { key, url: publicDiagnosticUrl(fetchTarget) })

  return {
    bytes,
    mime: assertRenderableImageMime(mimeFromContentType(response.headers.get('content-type'), fetchTarget))
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
  const optionalTemplateKeys = new Set([
    'maternoP',
    'fechaP',
    'id',
    'qr',
    'validationUrl'
  ])
  return unique([
    ...dynamicTextTokens(input.templateSvg).filter((key) => !optionalTemplateKeys.has(key)),
    'nombreP',
    'parenP',
    'fullnameP'
  ])
}

function requiredImageKeys(input: MarbetePdfInput) {
  return unique(dynamicImageTokens(input.templateSvg))
}

function chromiumPath() {
  return CHROMIUM_CANDIDATES.find((candidate) => candidate && existsSync(candidate)) || ''
}

async function chromiumLaunchConfig() {
  const localPath = chromiumPath()
  if (localPath) return { executable: localPath, args: [] as string[] }

  try {
    const chromiumModule = await import('@sparticuz/chromium')
    const chromium = (chromiumModule.default || chromiumModule) as {
      args?: string[]
      executablePath?: () => Promise<string>
    }
    const executable = await chromium.executablePath?.()
    if (executable) return { executable, args: Array.isArray(chromium.args) ? chromium.args : [] }
  } catch (error) {
    logPersonasWarning('marbete-pdf-chromium-package-unavailable', {
      message: error instanceof Error ? error.message : String(error)
    })
  }

  return null
}

async function readFontBytesFromOrigin(origin: string): Promise<{ bytes: Buffer; path: string } | null> {
  if (!origin) return null
  for (const file of PUBLIC_MONTSERRAT_FILES) {
    const url = `${origin.replace(/\/$/, '')}/fonts/${file}`
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) })
      if (!response.ok) continue
      const bytes = Buffer.from(await response.arrayBuffer())
      if (bytes.length) return { bytes, path: url }
    } catch {
      continue
    }
  }
  return null
}

async function fontFaceCss(origin = '') {
  const fontPath = LOCAL_MONTSERRAT_CANDIDATES.find((candidate) => candidate && existsSync(candidate)) || ''
  let bytes: Buffer | null
  let sourcePath = fontPath

  if (fontPath) {
    bytes = await readFile(fontPath)
  } else {
    const remoteFont = await readFontBytesFromOrigin(origin)
    bytes = remoteFont?.bytes || null
    sourcePath = remoteFont?.path || ''
  }

  if (!bytes) {
    throw diagnosticError(503, FRIENDLY_RENDER_MESSAGE, 'font-not-found', {
      candidates: [
        ...LOCAL_MONTSERRAT_CANDIDATES,
        ...PUBLIC_MONTSERRAT_FILES.map((file) => origin ? `${origin.replace(/\/$/, '')}/fonts/${file}` : '')
      ].filter(Boolean)
    })
  }
  const format = sourcePath.endsWith('.woff2') ? 'woff2' : 'truetype'
  const mime = sourcePath.endsWith('.woff2') ? 'font/woff2' : 'font/ttf'
  const source = `url(data:${mime};base64,${bytes.toString('base64')}) format('${format}')`
  return `@font-face{font-family:'Montserrat';src:${source};font-weight:600;font-style:normal;font-display:block;}@font-face{font-family:'Montserrat SemiBold';src:${source};font-weight:600;font-style:normal;font-display:block;}@font-face{font-family:'Montserrat-SemiBold';src:${source};font-weight:600;font-style:normal;font-display:block;}`
}

function supplementalDataLayer(values: Record<string, string>) {
  const studentLine = [values.fullnameA, values.matricula].filter(Boolean).join(' · ')
  const groupLine = [values.plantel, values.nivelEdu || values.nivel, values.gradoA || values.grado, values.grupoA || values.grupo].filter(Boolean).join(' / ')
  const validityLine = [values.validityLabel, values.validationUrl].filter(Boolean).join(' / ')
  if (!studentLine && !groupLine && !validityLine) return ''
  return `<section class="hp-pdf-context" aria-label="Datos escolares del Husky Pass">
    <strong>${encodeHtml(studentLine)}</strong>
    <span>${encodeHtml(groupLine)}</span>
    <span>${encodeHtml(validityLine)}</span>
  </section>`
}

function supplementalDataLines(values: Record<string, string>) {
  return [
    [values.fullnameA, values.matricula].filter(Boolean).join(' · '),
    [values.plantel, values.nivelEdu || values.nivel, values.gradoA || values.grado, values.grupoA || values.grupo].filter(Boolean).join(' / '),
    [values.validityLabel, values.validationUrl].filter(Boolean).join(' / ')
  ].filter(Boolean)
}

async function composeMarbeteHtml(input: MarbetePdfInput) {
  const completeSvg = await inlineSvgImages(input.renderedSvg, input.origin)
  if (/{{\s*[^}]+\s*}}/.test(completeSvg)) {
    throw diagnosticError(422, FRIENDLY_TEXT_MESSAGE, 'unresolved-svg-token', {
      tokens: Array.from(completeSvg.matchAll(/{{\s*([^}]+)\s*}}/g)).map((match) => match[1]).slice(0, 20)
    })
  }
  const fontCss = await fontFaceCss(input.origin)
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
.hp-pdf-context { position: absolute; left: 0.72in; right: 0.72in; bottom: 0.06in; display: grid; gap: 0.01in; color: #55585f; font-size: 6pt; line-height: 1.05; letter-spacing: 0; }
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

function runChromium(executable: string, htmlFile: string, pdfFile: string, extraArgs: string[] = []) {
  const filteredExtraArgs = extraArgs.filter((arg) => {
    return !arg.startsWith('--headless')
      && !arg.startsWith('--print-to-pdf')
      && !arg.startsWith('--user-data-dir')
  })
  const args = [
    ...filteredExtraArgs,
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
    `--user-data-dir=${join(dirname(htmlFile), 'chrome-profile')}`,
    `--print-to-pdf=${pdfFile}`,
    `file://${htmlFile}`
  ]

  return new Promise<void>((resolveRun, rejectRun) => {
    const child = spawn(executable, args, { stdio: ['ignore', 'ignore', 'pipe'] })
    const stderr: Buffer[] = []
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      rejectRun(diagnosticError(503, FRIENDLY_RENDER_MESSAGE, 'chromium-render-failed', {
        executable,
        reason: 'timeout'
      }))
    }, 30000)

    child.stderr.on('data', (chunk: Buffer) => {
      stderr.push(chunk)
    })

    child.once('error', () => {
      clearTimeout(timer)
      rejectRun(diagnosticError(503, FRIENDLY_RENDER_MESSAGE, 'chromium-render-failed', {
        executable,
        reason: 'spawn-error'
      }))
    })
    child.once('exit', (code) => {
      clearTimeout(timer)
      if (code === 0) resolveRun()
      else rejectRun(diagnosticError(503, FRIENDLY_RENDER_MESSAGE, 'chromium-render-failed', {
        executable,
        exitCode: code,
        stderr: Buffer.concat(stderr).toString('utf8').slice(-2000)
      }))
    })
  })
}

async function renderHtmlToPdf(html: string) {
  const chromium = await chromiumLaunchConfig()
  if (!chromium?.executable) {
    throw diagnosticError(503, FRIENDLY_RENDER_MESSAGE, 'chromium-not-found', {
      candidates: [...CHROMIUM_CANDIDATES.filter(Boolean), '@sparticuz/chromium']
    })
  }

  const workDir = join(tmpdir(), `husky-pass-${randomUUID()}`)
  await mkdir(workDir, { recursive: true })
  const htmlFile = join(workDir, 'husky-pass.html')
  const pdfFile = join(workDir, 'husky-pass.pdf')

  try {
    await writeFile(htmlFile, html, 'utf8')
    await runChromium(chromium.executable, htmlFile, pdfFile, chromium.args)
    const pdf = await readFile(pdfFile)
    if (pdf.length < 1024 || pdf.subarray(0, 5).toString('ascii') !== '%PDF-') {
      throw diagnosticError(503, FRIENDLY_RENDER_MESSAGE, 'pdf-invalid', {
        bytes: pdf.length,
        signature: pdf.subarray(0, 8).toString('ascii')
      })
    }
    return pdf
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined)
  }
}

function collectPdfBuffer(doc: {
  on: (event: 'data', listener: (chunk: Buffer) => void) => unknown
  once: (event: 'error' | 'end', listener: (value?: unknown) => void) => unknown
  end: () => void
}) {
  return new Promise<Buffer>((resolvePdf, rejectPdf) => {
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.once('error', rejectPdf)
    doc.once('end', () => resolvePdf(Buffer.concat(chunks)))
    doc.end()
  })
}

function rawBytesToBuffer(raw: unknown) {
  if (!raw) return null
  if (Buffer.isBuffer(raw)) return raw
  if (raw instanceof Uint8Array) return Buffer.from(raw)
  if (raw instanceof ArrayBuffer) return Buffer.from(raw)
  if (typeof raw === 'string') return Buffer.from(raw, 'binary')
  return null
}

async function readBundledFontBytes() {
  for (const file of PUBLIC_MONTSERRAT_FILES) {
    const raw = await useStorage('assets:hp-fonts').getItem(file)
    const bytes = rawBytesToBuffer(raw)
    if (bytes?.length) return { bytes, path: `assets:hp-fonts/${file}` }
  }
  return null
}

function tryRegisterPdfFont(
  doc: { registerFont: (name: string, source: string | Buffer) => unknown; font: (name: string) => unknown },
  fontName: string,
  source: string | Buffer,
  label: string
) {
  try {
    doc.registerFont(fontName, source)
    doc.font(fontName)
    return true
  } catch (error) {
    logPersonasWarning('marbete-pdf-font-register-failed', {
      source: label,
      message: error instanceof Error ? error.message : String(error)
    })
    return false
  }
}

async function registerPdfFont(
  doc: { registerFont: (name: string, source: string | Buffer) => unknown; font: (name: string) => unknown },
  origin: string
) {
  const fontName = 'Montserrat-SemiBold-Embedded'
  const candidates = LOCAL_MONTSERRAT_CANDIDATES.filter((candidate) => candidate && existsSync(candidate))
  for (const candidate of candidates) {
    if (tryRegisterPdfFont(doc, fontName, candidate, candidate)) return fontName
  }

  const bundled = await readBundledFontBytes()
  if (bundled?.bytes.length && tryRegisterPdfFont(doc, fontName, bundled.bytes, bundled.path)) {
    return fontName
  }

  const remoteFont = await readFontBytesFromOrigin(origin)
  if (remoteFont?.bytes.length && tryRegisterPdfFont(doc, fontName, remoteFont.bytes, remoteFont.path)) {
    return fontName
  }

  throw diagnosticError(503, FRIENDLY_RENDER_MESSAGE, 'font-not-found', {
    candidates: [
      ...LOCAL_MONTSERRAT_CANDIDATES,
      ...PUBLIC_MONTSERRAT_FILES.map((file) => `assets:hp-fonts/${file}`),
      ...PUBLIC_MONTSERRAT_FILES.map((file) => origin ? `${origin.replace(/\/$/, '')}/fonts/${file}` : '')
    ].filter(Boolean)
  })
}

async function renderSvgToPdfKit(input: MarbetePdfInput) {
  const completeSvg = await inlineSvgImages(input.renderedSvg, input.origin)
  if (/{{\s*[^}]+\s*}}/.test(completeSvg)) {
    throw diagnosticError(422, FRIENDLY_TEXT_MESSAGE, 'unresolved-svg-token', {
      tokens: Array.from(completeSvg.matchAll(/{{\s*([^}]+)\s*}}/g)).map((match) => match[1]).slice(0, 20)
    })
  }

  const doc = new PDFDocument({
    autoFirstPage: false,
    compress: true,
    info: {
      Title: 'Husky Pass',
      Creator: 'Husky Pass CRM'
    }
  })
  doc.addPage({ size: [612, 792], margin: 0 })
  const fontName = await registerPdfFont(doc, input.origin)
  const warnings: string[] = []

  try {
    SVGtoPDF(doc, completeSvg, 0, 0, {
      width: 612,
      height: 792,
      assumePt: true,
      preserveAspectRatio: 'xMidYMid meet',
      fontCallback: (family: string) => /montserrat/i.test(String(family || '')) ? fontName : 'Helvetica-Bold',
      warningCallback: (message: string) => warnings.push(String(message || '').slice(0, 300))
    })

    const lines = supplementalDataLines(input.values)
    if (lines.length) {
      doc.font(fontName)
      doc.fontSize(6)
      doc.fillColor('#55585f')
      const lineHeight = 7
      const startY = 792 - 4.32 - (lines.length * lineHeight)
      lines.forEach((line, index) => {
        doc.text(line, 51.84, startY + index * lineHeight, {
          width: 508.32,
          height: lineHeight,
          lineBreak: false
        })
      })
    }
  } catch (error) {
    throw diagnosticError(503, FRIENDLY_RENDER_MESSAGE, 'chromium-render-failed', {
      reason: 'pdfkit-render-error',
      message: error instanceof Error ? error.message : String(error),
      warnings: warnings.slice(0, 10)
    })
  }

  const pdf = await collectPdfBuffer(doc)
  if (pdf.length < 1024 || pdf.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw diagnosticError(503, FRIENDLY_RENDER_MESSAGE, 'pdf-invalid', {
      bytes: pdf.length,
      signature: pdf.subarray(0, 8).toString('ascii'),
      warnings: warnings.slice(0, 10)
    })
  }
  if (warnings.some((warning) => /image|font|parse|invalid|not look like/i.test(warning))) {
    logPersonasDebug('marbete-pdf-pdfkit-warnings', { warnings: warnings.slice(0, 10) })
  }
  return pdf
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
  if (missingText.length) throw diagnosticError(422, FRIENDLY_TEXT_MESSAGE, 'missing-required-field', { fields: missingText })

  const missingImages = requiredImageKeys(input).filter((key) => !String(input.values[key] || '').trim())
  if (missingImages.length) throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, 'missing-required-image', { fields: missingImages })

  await Promise.all(requiredImageKeys(input).map((key) => loadImage(input.values[key], input.origin, key)))
  await inlineSvgImages(input.renderedSvg, input.origin)
  return { ok: true }
}

export async function renderMarbetePdf(input: string | MarbetePdfInput) {
  const pdfInput = typeof input === 'string'
    ? { templateSvg: input, renderedSvg: input, values: {}, origin: '' }
    : input

  await assertMarbetePdfAssets(pdfInput)
  if (process.env.HUSKY_PASS_PDF_RENDERER === 'chromium') {
    const html = await composeMarbeteHtml(pdfInput)
    return renderHtmlToPdf(html)
  }
  return renderSvgToPdfKit(pdfInput)
}
