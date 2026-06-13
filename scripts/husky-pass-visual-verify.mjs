import { chromium } from '@playwright/test'
import { createHmac } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'

const CHROME_CANDIDATES = [
  process.env.HUSKY_PASS_CHROMIUM_PATH || '',
  process.env.CHROMIUM_PATH || '',
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

function argValue(name, fallback = '') {
  const flag = `--${name}`
  const index = process.argv.indexOf(flag)
  if (index >= 0) return process.argv[index + 1] || fallback
  const inline = process.argv.find((arg) => arg.startsWith(`${flag}=`))
  return inline ? inline.slice(flag.length + 1) : fallback
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function chromePath() {
  return CHROME_CANDIDATES.find((candidate) => candidate && existsSync(candidate))
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function parseDotEnv(text) {
  return Object.fromEntries(text.split(/\r?\n/).map((line) => {
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line.trim())
    if (!match) return null
    return [match[1], match[2].replace(/^['"]|['"]$/g, '')]
  }).filter(Boolean))
}

async function sessionSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET
  try {
    const env = parseDotEnv(await readFile(resolve('.env'), 'utf8'))
    return env.SESSION_SECRET || 'change-me-before-production'
  } catch {
    return 'change-me-before-production'
  }
}

async function superAdminCookie(baseUrl) {
  const user = {
    isSuperAdmin: true,
    id: 1,
    kind: 'admin',
    email: 'dev-superadmin@localhost',
    username: 'dev-superadmin',
    displayName: 'Dev Superadmin',
    picture: null,
    campus: null,
    empresa: null,
    sala: null,
    roles: ['ROLE_SUPERADMIN'],
    unidades: [],
    plantel: [],
    routes: [],
    productScopes: [],
    scopes: {},
    anonymous: false,
    loggedin: true
  }
  const payload = Buffer.from(JSON.stringify({ user, createdAt: Date.now() })).toString('base64url')
  const signature = createHmac('sha256', await sessionSecret()).update(payload).digest('base64url')
  return {
    name: 'hpc_session',
    value: `${payload}.${signature}`,
    url: baseUrl,
    httpOnly: true,
    sameSite: 'Lax'
  }
}

async function ensureDirs(root) {
  const dirs = {
    pdf: join(root, 'pdf'),
    screenshots: join(root, 'screenshots'),
    diagnostics: join(root, 'diagnostics')
  }
  await Promise.all(Object.values(dirs).map((dir) => mkdir(dir, { recursive: true })))
  return dirs
}

async function fetchJson(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`)
  return response.json()
}

async function fetchPdf(url, target) {
  const response = await fetch(url)
  const bytes = Buffer.from(await response.arrayBuffer())
  const contentType = response.headers.get('content-type') || ''
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${bytes.toString('utf8').slice(0, 300)}`)
  if (!contentType.toLowerCase().includes('application/pdf')) throw new Error(`Expected PDF, received ${contentType}`)
  if (bytes.subarray(0, 5).toString('ascii') !== '%PDF-') throw new Error('Generated file is not a PDF')
  await writeFile(target, bytes)
  return { bytes: bytes.length, contentType }
}

async function screenshotPage(page, url, target, viewport = { width: 1366, height: 920 }) {
  page.setDefaultTimeout(90000)
  await page.setViewportSize(viewport)
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(1800)
  await page.screenshot({ path: target, fullPage: false, animations: 'disabled', timeout: 90000 })
}

async function screenshotPdfFullPage(page, url, target, viewport = { width: 1200, height: 1000 }) {
  page.setDefaultTimeout(90000)
  await page.setViewportSize(viewport)
  await page.goto(`${url}#zoom=50`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: target, fullPage: false, animations: 'disabled', timeout: 90000 })
}

async function screenshotComparison(page, input, target) {
  const svgImage = `data:image/png;base64,${(await readFile(input.svgPath)).toString('base64')}`
  const pdfImage = `data:image/png;base64,${(await readFile(input.pdfPath)).toString('base64')}`
  await page.setViewportSize({ width: 1440, height: 980 })
  await page.setContent(`<!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; background: #f4f6f8; color: #17202a; font: 700 14px Arial, sans-serif; }
          main { display: grid; gap: 12px; padding: 16px; }
          header { background: #fff; border: 1px solid #dce3ec; border-radius: 8px; padding: 12px 14px; }
          h1 { font-size: 22px; margin: 0 0 4px; }
          p { color: #607083; margin: 0; }
          section { display: grid; gap: 12px; grid-template-columns: 1fr 1fr; }
          article { background: #fff; border: 1px solid #dce3ec; border-radius: 8px; overflow: hidden; }
          h2 { border-bottom: 1px solid #e6ecf2; font-size: 14px; margin: 0; padding: 10px 12px; }
          img { display: block; width: 100%; }
        </style>
      </head>
      <body>
        <main>
          <header>
            <h1>${input.title}</h1>
            <p>${input.subtitle}</p>
          </header>
          <section>
            <article>
              <h2>Browser SVG preview</h2>
              <img src="${svgImage}" alt="SVG preview">
            </article>
            <article>
              <h2>Final PDF preview</h2>
              <img src="${pdfImage}" alt="PDF preview">
            </article>
          </section>
        </main>
  </body>
    </html>`, { waitUntil: 'load' })
  await page.waitForTimeout(500)
  await page.screenshot({ path: target, fullPage: false, animations: 'disabled', timeout: 90000 })
}

function caseMatrix(options) {
  const defaultCases = options.variants.map((variant) => ({
    id: `${variant.id}-default`,
    variant: variant.id,
    scenario: 'default',
    purpose: 'supported variant'
  }))
  const stress = [
    ['preescolar-preem', 'long-name', 'long names and accents'],
    ['primaria-pt', 'missing-optional', 'missing optional maternal surname/date'],
    ['secundaria-st', 'wide-photo', 'unusual wide image'],
    ['guarderia-cm', 'transparent-photo', 'transparent image'],
    ['primaria-pm', 'large-photo', 'large image'],
    ['secundaria-sm', 'slow-photo', 'slow image']
  ].map(([variant, scenario, purpose]) => ({
    id: `${variant}-${scenario}`,
    variant,
    scenario,
    purpose
  }))
  return [...defaultCases, ...stress]
}

async function main() {
  const baseUrl = argValue('base-url', process.env.HUSKY_PASS_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')
  const outputRoot = resolve(argValue('out', join('artifacts', 'husky-pass-verification', stamp())))
  const executablePath = chromePath()
  if (!executablePath) throw new Error('Chrome/Chromium executable not found. Set HUSKY_PASS_CHROMIUM_PATH.')

  const dirs = await ensureDirs(outputRoot)
  const options = await fetchJson(`${baseUrl}/api/dev/husky-pass/options`)
  const cases = caseMatrix(options)
  const evidence = []
  const browser = await chromium.launch({ executablePath, headless: true })
  const page = await browser.newPage()

  for (const item of cases) {
    const name = slug(item.id)
    const query = `variant=${encodeURIComponent(item.variant)}&scenario=${encodeURIComponent(item.scenario)}`
    const pdfUrl = `${baseUrl}/api/dev/husky-pass/pass?${query}&format=pdf&download=1`
    const diagnosticsUrl = `${baseUrl}/api/dev/husky-pass/pass?${query}&format=diagnostics`
    const svgUrl = `${baseUrl}/api/dev/husky-pass/pass?${query}&format=svg-preview`
    const pdfPath = join(dirs.pdf, `${name}.pdf`)
    const diagnosticsPath = join(dirs.diagnostics, `${name}.json`)
    const comparePath = join(dirs.screenshots, `${name}-compare.png`)
    const svgPreviewPath = join(dirs.screenshots, `${name}-svg-preview.png`)
    const pdfViewerPath = join(dirs.screenshots, `${name}-pdf-viewer.png`)
    const pdfFullPagePath = join(dirs.screenshots, `${name}-pdf-full-page.png`)

    const diagnostics = await fetchJson(diagnosticsUrl)
    await writeFile(diagnosticsPath, JSON.stringify(diagnostics, null, 2))
    const pdf = await fetchPdf(pdfUrl, pdfPath)
    await screenshotPage(page, svgUrl, svgPreviewPath, { width: 1024, height: 900 })

    let pdfViewerError = ''
    try {
      const pdfPreviewUrl = `${baseUrl}/api/dev/husky-pass/pass?${query}&format=pdf`
      await screenshotPage(page, pdfPreviewUrl, pdfViewerPath, { width: 1024, height: 900 })
      await screenshotPdfFullPage(page, pdfPreviewUrl, pdfFullPagePath)
    } catch (error) {
      pdfViewerError = error instanceof Error ? error.message : String(error)
    }
    if (!pdfViewerError) {
      await screenshotComparison(page, {
        title: item.id,
        subtitle: `${item.purpose} / template ${diagnostics.template?.id || 'unknown'}`,
        svgPath: svgPreviewPath,
        pdfPath: pdfViewerPath
      }, comparePath)
    }

    evidence.push({
      ...item,
      template: diagnostics.template?.id,
      expectedTemplateId: diagnostics.expectedTemplateId,
      selectedExpectedTemplate: diagnostics.selectedExpectedTemplate,
      pdfPath,
      pdfBytes: pdf.bytes,
      svgPreviewPath,
      comparePath,
      pdfViewerPath: pdfViewerError ? null : pdfViewerPath,
      pdfFullPagePath: pdfViewerError ? null : pdfFullPagePath,
      pdfViewerError,
      diagnosticsPath
    })
  }

  const repeatName = 'repeat-generation-guarderia-cm'
  const repeatUrl = `${baseUrl}/api/dev/husky-pass/pass?variant=guarderia-cm&scenario=default&format=pdf&download=1`
  const repeatA = join(dirs.pdf, `${repeatName}-a.pdf`)
  const repeatB = join(dirs.pdf, `${repeatName}-b.pdf`)
  const repeatResultA = await fetchPdf(repeatUrl, repeatA)
  const repeatResultB = await fetchPdf(repeatUrl, repeatB)

  const modalEvidence = []
  for (const theme of options.themes) {
    for (const mode of ['edit', 'delete']) {
      const target = join(dirs.screenshots, `modal-${theme.key}-${mode}.png`)
      await screenshotPage(page, `${baseUrl}/__dev/personas-modals?theme=${theme.key}&mode=${mode}`, target, { width: 1280, height: 880 })
      modalEvidence.push({ theme: theme.key, mode, path: target })
    }
  }

  const adminContext = await browser.newContext({ viewport: { width: 1366, height: 900 } })
  await adminContext.addCookies([await superAdminCookie(baseUrl)])
  const adminPage = await adminContext.newPage()
  const adminDesktop = join(dirs.screenshots, 'superadmin-desktop-fixture.png')
  await screenshotPage(adminPage, `${baseUrl}/admin/superadmin/personas-autorizadas?fixture=1`, adminDesktop, { width: 1366, height: 900 })
  const adminMobile = join(dirs.screenshots, 'superadmin-mobile-fixture.png')
  await screenshotPage(adminPage, `${baseUrl}/admin/superadmin/personas-autorizadas?fixture=1`, adminMobile, { width: 390, height: 844 })
  await adminContext.close()
  await browser.close()

  const manifest = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    executablePath,
    outputRoot,
    cases: evidence,
    repeatedGeneration: {
      first: repeatA,
      second: repeatB,
      firstBytes: repeatResultA.bytes,
      secondBytes: repeatResultB.bytes
    },
    modals: modalEvidence,
    superAdmin: {
      desktop: adminDesktop,
      mobile: adminMobile
    }
  }
  await writeFile(join(outputRoot, 'manifest.json'), JSON.stringify(manifest, null, 2))

  const report = [
    '# Husky Pass Visual Verification',
    '',
    `Generated: ${manifest.generatedAt}`,
    `Base URL: ${baseUrl}`,
    `Chrome: ${executablePath}`,
    '',
    '## Commands',
    `- Visual verifier: npm run verify:husky-pass -- --base-url ${baseUrl}`,
    '- Recommended follow-up checks: npm run typecheck; npm run lint; npm run build',
    '',
    '## Scenarios',
    ...evidence.map((item) => `- ${item.id}: ${item.purpose}`),
    '',
    '## PDFs',
    ...evidence.map((item) => `- ${item.id}: ${item.pdfPath} (${item.pdfBytes} bytes), template ${item.template}, expected ${item.expectedTemplateId}, top ${item.pdfViewerPath}, full-page ${item.pdfFullPagePath}, compare ${item.comparePath}`),
    '',
    '## Repeated Generation',
    `- ${repeatA} (${repeatResultA.bytes} bytes)`,
    `- ${repeatB} (${repeatResultB.bytes} bytes)`,
    '',
    '## Modal Screenshots',
    ...modalEvidence.map((item) => `- ${item.theme} ${item.mode}: ${item.path}`),
    '',
    '## Super Admin',
    `- Desktop: ${adminDesktop}`,
    `- Mobile: ${adminMobile}`
  ].join('\n')
  await writeFile(join(outputRoot, 'verification-report.md'), `${report}\n`)
  console.log(outputRoot)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
