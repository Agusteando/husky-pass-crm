import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

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
  '/usr/bin/google-chrome-stable'
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

async function ensureDirs(root) {
  const dirs = {
    screenshots: join(root, 'screenshots'),
    reports: join(root, 'reports')
  }
  await Promise.all(Object.values(dirs).map((dir) => mkdir(dir, { recursive: true })))
  return dirs
}

const contexts = [
  {
    id: 'escolar-iecs-preescolar',
    query: 'experience=escolar&institution=iecs&nivel=preescolar&plantel=PREEM&grupo=Koalas',
    expected: { experience: 'escolar', institution: 'iecs' },
    forbidden: ['iedis-logo', 'daycare-sunny', 'sunny-guarderia']
  },
  {
    id: 'escolar-iedis-primaria',
    query: 'experience=escolar&institution=iedis&nivel=primaria&plantel=PT&grupo=Leones',
    expected: { experience: 'escolar', institution: 'iedis' },
    forbidden: ['iecs-logo', 'daycare-sunny', 'sunny-guarderia']
  },
  {
    id: 'escolar-iedis-secundaria',
    query: 'experience=escolar&institution=iedis&nivel=secundaria&plantel=ST&grupo=Asia',
    expected: { experience: 'escolar', institution: 'iedis' },
    forbidden: ['iecs-logo', 'daycare-sunny', 'sunny-guarderia']
  },
  {
    id: 'guarderia',
    query: 'experience=guarderia&nivel=guarderia&plantel=CM&grupo=Maternal%20A',
    expected: { experience: 'guarderia', institution: 'neutral' },
    forbidden: ['iecs-logo', 'iedis-logo', 'joy-preescolar', 'brave-primaria', 'hope-secundaria']
  },
  {
    id: 'administrativa',
    query: 'experience=admin',
    expected: { experience: 'admin', institution: 'neutral' },
    forbidden: ['iecs-logo', 'iedis-logo', 'daycare-sunny', 'sunny-guarderia', 'joy-preescolar', 'brave-primaria', 'hope-secundaria']
  }
]

const loginRoutes = [
  { id: 'login-selector', path: '/login', expected: { experience: 'admin' }, forbidden: ['daycare-sunny', 'sunny-guarderia', 'joy-preescolar', 'brave-primaria', 'hope-secundaria'] },
  { id: 'login-escolar', path: '/login/escolar', expected: { experience: 'escolar' }, forbidden: ['daycare-sunny', 'sunny-guarderia', 'iedis-logo', 'iecs-logo'] },
  { id: 'login-guarderia', path: '/login/guarderia', expected: { experience: 'guarderia' }, forbidden: ['iecs-logo', 'iedis-logo', 'joy-preescolar', 'brave-primaria', 'hope-secundaria'] },
  { id: 'login-admin', path: '/admin/login', expected: { experience: 'admin' }, forbidden: ['iecs-logo', 'iedis-logo', 'daycare-sunny', 'sunny-guarderia', 'joy-preescolar', 'brave-primaria', 'hope-secundaria'] },
  { id: 'recovery-escolar', path: '/recuperar-contrasena?experiencia=escolar', expected: { experience: 'escolar' }, forbidden: ['daycare-sunny', 'sunny-guarderia', 'iedis-logo', 'iecs-logo'] },
  { id: 'recovery-guarderia', path: '/recuperar-contrasena?experiencia=guarderia', expected: { experience: 'guarderia' }, forbidden: ['iecs-logo', 'iedis-logo', 'joy-preescolar', 'brave-primaria', 'hope-secundaria'] }
]

async function pageSnapshot(page) {
  return page.evaluate(() => ({
    experience: document.querySelector('[data-experience]')?.getAttribute('data-experience') || '',
    institution: document.querySelector('[data-institution]')?.getAttribute('data-institution') || '',
    html: document.documentElement.innerHTML,
    imageSources: Array.from(document.images).map((img) => img.getAttribute('src') || '')
  }))
}

function assertNoLeak(snapshot, forbidden, label) {
  const haystack = `${snapshot.html}\n${snapshot.imageSources.join('\n')}`.toLowerCase()
  const leaks = forbidden.filter((needle) => haystack.includes(needle.toLowerCase()))
  if (leaks.length) {
    throw new Error(`${label} leaked forbidden asset markers: ${leaks.join(', ')}`)
  }
}

async function screenshot(page, url, path, viewport) {
  await page.setViewportSize(viewport)
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(500)
  await page.screenshot({ path, fullPage: true, animations: 'disabled' })
}

async function createContactSheet(browser, evidence, outputPath) {
  const screenshots = evidence.filter((item) => item.path?.endsWith('.png'))
  const page = await browser.newPage({ viewport: { width: 1800, height: 1200 } })
  const cards = await Promise.all(screenshots.map(async (item) => {
    const image = await readFile(item.path)
    const src = `data:image/png;base64,${image.toString('base64')}`
    const label = `${item.id}${item.viewport ? ` / ${item.viewport}` : ''}`
    const context = item.snapshot ? `${item.snapshot.experience || 'sin-experiencia'} · ${item.snapshot.institution || 'neutral'}` : ''
    return `
      <article class="card">
        <div class="meta">
          <strong>${label}</strong>
          <span>${context}</span>
        </div>
        <img src="${src}" alt="${label}">
      </article>
    `
  }))
  await page.setContent(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 28px;
            background: #f5f7fb;
            color: #17202a;
            font-family: Montserrat, Arial, sans-serif;
          }
          h1 {
            margin: 0 0 20px;
            font-family: Fredoka, Montserrat, Arial, sans-serif;
            font-size: 30px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px;
          }
          .card {
            overflow: hidden;
            border: 1px solid #dbe3ef;
            border-radius: 10px;
            background: white;
          }
          .meta {
            display: flex;
            min-height: 58px;
            flex-direction: column;
            gap: 4px;
            padding: 12px 14px;
            border-bottom: 1px solid #e8eef6;
            font-size: 13px;
          }
          .meta span { color: #65758a; }
          img {
            display: block;
            width: 100%;
            height: 320px;
            object-fit: contain;
            background: #f9fbff;
          }
        </style>
      </head>
      <body>
        <h1>Matriz visual de identidad</h1>
        <section class="grid">${cards.join('')}</section>
      </body>
    </html>
  `, { waitUntil: 'load' })
  await page.screenshot({ path: outputPath, fullPage: true, animations: 'disabled' })
  await page.close()
}

async function main() {
  const baseUrl = argValue('base-url', process.env.IDENTITY_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')
  const outputRoot = resolve(argValue('out', join('artifacts', 'identity-verification', stamp())))
  const publicOnly = process.argv.includes('--public-only')
  const executablePath = chromePath()
  if (!executablePath) throw new Error('Chrome/Chromium executable not found. Set HUSKY_PASS_CHROMIUM_PATH.')

  const dirs = await ensureDirs(outputRoot)
  const browser = await chromium.launch({ executablePath, headless: true })
  const page = await browser.newPage()
  const evidence = []

  if (!publicOnly) for (const item of contexts) {
    for (const viewport of [
      { name: 'desktop', size: { width: 1366, height: 900 } },
      { name: 'mobile', size: { width: 390, height: 844 } }
    ]) {
      const path = join(dirs.screenshots, `${item.id}-${viewport.name}.png`)
      const url = `${baseUrl}/__dev/identity-matrix?${item.query}`
      await screenshot(page, url, path, viewport.size)
      const snapshot = await pageSnapshot(page)
      if (snapshot.experience !== item.expected.experience) throw new Error(`${item.id} expected ${item.expected.experience}, got ${snapshot.experience}`)
      if (snapshot.institution !== item.expected.institution) throw new Error(`${item.id} expected institution ${item.expected.institution}, got ${snapshot.institution}`)
      assertNoLeak(snapshot, item.forbidden, `${item.id}-${viewport.name}`)
      evidence.push({ id: item.id, viewport: viewport.name, path, snapshot: { experience: snapshot.experience, institution: snapshot.institution, imageSources: snapshot.imageSources } })
    }

    const modalPath = join(dirs.screenshots, `${item.id}-modal.png`)
    await screenshot(page, `${baseUrl}/__dev/identity-matrix?${item.query}&modal=1`, modalPath, { width: 1280, height: 860 })
    const modalSnapshot = await pageSnapshot(page)
    assertNoLeak(modalSnapshot, item.forbidden, `${item.id}-modal`)
    evidence.push({ id: item.id, viewport: 'modal', path: modalPath, snapshot: { experience: modalSnapshot.experience, institution: modalSnapshot.institution, imageSources: modalSnapshot.imageSources } })
  }

  for (const item of loginRoutes) {
    const path = join(dirs.screenshots, `${item.id}.png`)
    await screenshot(page, `${baseUrl}${item.path}`, path, { width: 1280, height: 860 })
    const snapshot = await pageSnapshot(page)
    if (item.expected?.experience && snapshot.experience !== item.expected.experience) throw new Error(`${item.id} expected ${item.expected.experience}, got ${snapshot.experience}`)
    assertNoLeak(snapshot, item.forbidden, item.id)
    evidence.push({ id: item.id, viewport: 'desktop', path, snapshot: { experience: snapshot.experience, institution: snapshot.institution, imageSources: snapshot.imageSources } })
  }

  await page.goto(`${baseUrl}/familia/daycare`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForURL(/\/login\/guarderia/, { timeout: 15000 })
  evidence.push({ id: 'protected-guarderia-redirect', finalUrl: page.url() })

  await page.goto(`${baseUrl}/familia/personas-autorizadas`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForFunction(() => window.location.pathname === '/login', null, { timeout: 15000 })
  evidence.push({ id: 'protected-shared-family-redirect', finalUrl: page.url() })

  if (!publicOnly) {
    await page.goto(`${baseUrl}/__dev/identity-matrix?experience=escolar&institution=iedis&nivel=primaria`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.evaluate(() => window.localStorage.setItem('hpc-stale-theme', 'guarderia'))
    await page.goto(`${baseUrl}/__dev/identity-matrix?experience=admin`, { waitUntil: 'networkidle', timeout: 60000 })
    const staleSnapshot = await pageSnapshot(page)
    assertNoLeak(staleSnapshot, contexts.find((item) => item.id === 'administrativa')?.forbidden || [], 'stale-localstorage-admin')
    evidence.push({ id: 'stale-localstorage-admin', snapshot: { experience: staleSnapshot.experience, institution: staleSnapshot.institution, imageSources: staleSnapshot.imageSources } })
  }

  const contactSheetPath = join(dirs.screenshots, 'identity-contact-sheet.png')
  await createContactSheet(browser, evidence, contactSheetPath)
  evidence.push({ id: 'identity-contact-sheet', viewport: 'contact-sheet', path: contactSheetPath })

  await browser.close()

  const manifest = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    publicOnly,
    executablePath,
    outputRoot,
    evidence
  }
  await writeFile(join(outputRoot, 'manifest.json'), JSON.stringify(manifest, null, 2))
  const report = [
    '# Identity Visual Verification',
    '',
    `Generated: ${manifest.generatedAt}`,
    `Base URL: ${baseUrl}`,
    `Chrome: ${executablePath}`,
    '',
    '## Evidence',
    ...evidence.map((item) => `- ${item.id}${item.viewport ? ` (${item.viewport})` : ''}: ${item.path || item.finalUrl}`)
  ].join('\n')
  await writeFile(join(outputRoot, 'verification-report.md'), `${report}\n`)
  console.log(outputRoot)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
