#!/usr/bin/env node
import { chromium } from '@playwright/test'
import { createHmac } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
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
  '/usr/bin/google-chrome-stable',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
]

const STARTER_PATTERNS = [
  /Welcome to Nuxt/i,
  /NuxtWelcome/i,
  /Get started by editing/i,
  /nuxt\.com\/docs\/get-started/i,
  /Open source framework/i
]

const FIXTURES = {
  school: {
    login: 'codex.pa.parent@example.test',
    password: process.env.CODEX_ACCOUNT_SECURITY_PASSWORD || 'CodexPass2026'
  },
  daycare: {
    login: 'codex.daycare.parent@example.test',
    password: process.env.CODEX_ACCOUNT_SECURITY_PASSWORD || 'CodexPass2026'
  }
}

function argValue(name, fallback = '') {
  const flag = `--${name}`
  const index = process.argv.indexOf(flag)
  if (index >= 0) return process.argv[index + 1] || fallback
  const inline = process.argv.find((arg) => arg.startsWith(`${flag}=`))
  return inline ? inline.slice(flag.length + 1) : fallback
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`)
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function chromePath() {
  return CHROME_CANDIDATES.find((candidate) => candidate && existsSync(candidate))
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

function target(baseUrl, path) {
  return new URL(path, `${baseUrl}/`).toString()
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'page'
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function ensureDirs(root) {
  const keys = ['launch', 'escolar', 'guarderia', 'admin', 'mobile', 'modals', 'errors', 'routes', 'playwright']
  const dirs = Object.fromEntries(keys.map((key) => [key, join(root, key)]))
  await Promise.all(Object.values(dirs).map((dir) => mkdir(dir, { recursive: true })))
  return dirs
}

function isCriticalConsoleMessage(message) {
  const text = `${message.text()} ${message.location()?.url || ''}`
  if (/Hydration|hydration|mismatch/i.test(text)) return true
  if (message.type() !== 'error') return false
  return !/favicon|ResizeObserver loop|net::ERR_ABORTED|Page not found|status of 404|GSI_LOGGER|given origin is not allowed for the given client ID|accounts\.google\.com|youtube\.com|googleapis\.com|gstatic\.com/i.test(text)
}

function isCriticalRequestFailure(request) {
  const url = request.url()
  const failure = request.failure()?.errorText || ''
  if (/net::ERR_ABORTED/i.test(failure)) return false
  return /localhost|127\.0\.0\.1|\.vercel\.app/i.test(url) && !/_nuxt\/@vite\/client/i.test(url)
}

async function withPage(browser, viewport, run) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  return withExistingPage(page, async () => {
    try {
      return await run(page, context)
    } finally {
      await context.close()
    }
  })
}

async function withExistingPage(page, run) {
  const consoleMessages = []
  const pageErrors = []
  const requestFailures = []
  const serverResponses = []

  page.on('console', (message) => {
    if (isCriticalConsoleMessage(message)) consoleMessages.push({ type: message.type(), text: message.text(), location: message.location() })
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('requestfailed', (request) => {
    if (isCriticalRequestFailure(request)) requestFailures.push({
      url: request.url(),
      method: request.method(),
      failure: request.failure()?.errorText || ''
    })
  })
  page.on('response', (response) => {
    if (response.status() >= 500 && /localhost|127\.0\.0\.1|\.vercel\.app/i.test(response.url())) {
      serverResponses.push({ url: response.url(), status: response.status() })
    }
  })

  const result = await run()
  return {
    ...result,
    consoleMessages,
    pageErrors,
    requestFailures,
    serverResponses
  }
}

async function assertUsableProductPage(page, label, selectors = []) {
  await page.waitForFunction(() => document.body && document.body.innerText.trim().length > 40, null, { timeout: 15000 })
  const snapshot = await page.evaluate(() => ({
    title: document.title,
    text: document.body.innerText,
    html: document.documentElement.innerHTML,
    path: window.location.pathname,
    experience: document.querySelector('[data-experience]')?.getAttribute('data-experience') || '',
    bodyLength: document.body.innerText.trim().length,
    productMarkers: document.querySelectorAll('[data-product-screen], [data-product-panel], [data-experience], .login-page, form, main').length,
    loadingMarkers: document.querySelectorAll('[data-product-loading], [data-state="loading"]').length
  }))

  for (const pattern of STARTER_PATTERNS) {
    if (pattern.test(snapshot.text) || pattern.test(snapshot.html)) {
      throw new Error(`${label} rendered Nuxt starter content matching ${pattern}`)
    }
  }

  if (!snapshot.bodyLength || snapshot.productMarkers === 0) {
    throw new Error(`${label} rendered a blank shell or no product markers`)
  }

  for (const selector of selectors) {
    if (!(await page.locator(selector).first().waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false))) {
      throw new Error(`${label} did not render required selector ${selector}`)
    }
  }

  if (snapshot.loadingMarkers > 0 && selectors.length === 0) {
    await page.waitForTimeout(2500)
    const stillLoading = await page.locator('[data-product-loading], [data-state="loading"]').count()
    const hasContent = await page.locator('[data-state="content"], [data-product-panel], form, .login-page').count()
    if (stillLoading > 0 && hasContent === 0) throw new Error(`${label} remained in a loading state`)
  }

  return snapshot
}

async function capturePage(page, baseUrl, dirs, category, name, path, options = {}) {
  const url = path.startsWith('http') ? path : target(baseUrl, path)
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: options.timeout || 45000 })
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => undefined)
  await page.waitForTimeout(options.settleMs || 600)
  const snapshot = await assertUsableProductPage(page, name, options.selectors || [])
  const file = join(dirs[category], `${slug(name)}.png`)
  await page.screenshot({ path: file, fullPage: true, animations: 'disabled' })
  return {
    name,
    category,
    requestedPath: path,
    finalUrl: page.url(),
    status: response?.status() || 0,
    screenshot: file,
    snapshot
  }
}

async function captureCurrentPage(page, dirs, category, name, options = {}) {
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => undefined)
  await page.waitForTimeout(options.settleMs || 400)
  const snapshot = await assertUsableProductPage(page, name, options.selectors || [])
  const file = join(dirs[category], `${slug(name)}.png`)
  await page.screenshot({ path: file, fullPage: true, animations: 'disabled' })
  return {
    name,
    category,
    requestedPath: page.url(),
    finalUrl: page.url(),
    status: 0,
    screenshot: file,
    snapshot
  }
}

async function waitForApplicationReady(browser, baseUrl) {
  const timeoutMs = Number(argValue('readiness-timeout-ms', '120000'))
  const deadline = Date.now() + timeoutMs
  let lastError = null

  while (Date.now() < deadline) {
    const context = await browser.newContext({ viewport: { width: 1024, height: 768 } })
    const page = await context.newPage()
    try {
      await page.goto(target(baseUrl, '/login'), { waitUntil: 'domcontentloaded', timeout: 15000 })
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => undefined)
      await assertUsableProductPage(page, 'launch-readiness', ['form', 'input[autocomplete="username"]'])
      await context.close()
      return
    } catch (error) {
      lastError = error
      await context.close().catch(() => undefined)
      await sleep(1500)
    }
  }

  throw new Error(`Application did not become ready at ${target(baseUrl, '/login')} within ${timeoutMs}ms: ${lastError?.message || lastError}`)
}

async function writeEvidence(dirs, name, data) {
  const file = join(dirs.playwright, `${slug(name)}.json`)
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
  return file
}

async function loginFamily(page, baseUrl, experience, credentials, expectedPath) {
  await page.goto(target(baseUrl, `/login/${experience}`), { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => undefined)
  await page.waitForFunction(() => Boolean(window.__NUXT__), null, { timeout: 15000 })
  await page.waitForTimeout(500)
  await page.locator('input[autocomplete="username"]').fill(credentials.login)
  await page.locator('input[autocomplete="current-password"]').fill(credentials.password)
  await page.waitForFunction(() => {
    const inputs = Array.from(document.querySelectorAll('input'))
    return inputs.every((input) => input.value.trim().length > 0)
  }, null, { timeout: 5000 })
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((url) => url.pathname.startsWith(expectedPath), { timeout: 90000 })
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => undefined)
}

async function logoutThroughAccountMenu(page, baseUrl) {
  const visibleLogout = page.locator('[data-diagnostic-action="logout"]:visible').last()
  if (await visibleLogout.isVisible({ timeout: 1000 }).catch(() => false)) {
    await visibleLogout.click()
    return
  }
  const accountMenu = page.locator('[data-diagnostic-action="abrir-menu-cuenta"]').last()
  if (await accountMenu.isVisible({ timeout: 1000 }).catch(() => false)) {
    await accountMenu.click()
    await page.locator('[data-diagnostic-action="logout"]:visible').last().click()
    return
  }
  await page.request.post(target(baseUrl, '/api/auth/logout'))
  await page.goto(target(baseUrl, '/login'), { waitUntil: 'domcontentloaded', timeout: 30000 })
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
    unidades: ['CM'],
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

async function auditControls(page) {
  return page.evaluate(() => {
    const visible = (element) => {
      const style = window.getComputedStyle(element)
      const box = element.getBoundingClientRect()
      return style.visibility !== 'hidden' && style.display !== 'none' && box.width > 0 && box.height > 0
    }
    return Array.from(document.querySelectorAll('a, button, input, select, textarea, [role="button"]'))
      .filter(visible)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        text: (element.innerText || element.getAttribute('aria-label') || element.getAttribute('placeholder') || element.getAttribute('name') || '').trim(),
        href: element.getAttribute('href') || '',
        disabled: Boolean(element.disabled || element.getAttribute('aria-disabled') === 'true'),
        unavailable: element.getAttribute('data-unavailable-reason') || ''
      }))
  })
}

async function assertNoCriticalEvents(result, label) {
  const failures = []
  if (result.pageErrors?.length) failures.push(`page errors: ${result.pageErrors.join(' | ')}`)
  if (result.consoleMessages?.length) failures.push(`console: ${result.consoleMessages.map((item) => item.text).join(' | ')}`)
  if (result.requestFailures?.length) failures.push(`network: ${result.requestFailures.map((item) => `${item.method} ${item.url} ${item.failure}`).join(' | ')}`)
  if (result.serverResponses?.length) failures.push(`server 500: ${result.serverResponses.map((item) => `${item.status} ${item.url}`).join(' | ')}`)
  if (failures.length) throw new Error(`${label} had critical browser events: ${failures.join(' ; ')}`)
}

async function publicLaunchSuite(browser, baseUrl, dirs, evidence) {
  const publicRoutes = [
    { category: 'launch', name: 'login-unificado', path: '/login', selectors: ['form', 'input[autocomplete="username"]'] },
    { category: 'launch', name: 'login-escolar', path: '/login/escolar', selectors: ['form', 'input[autocomplete="username"]'] },
    { category: 'launch', name: 'login-guarderia', path: '/login/guarderia', selectors: ['form', 'input[autocomplete="username"]'] },
    { category: 'launch', name: 'login-admin', path: '/admin/login', selectors: ['form', 'input[autocomplete="username"]'] },
    { category: 'launch', name: 'password-recovery', path: '/recuperar-contrasena?experiencia=escolar', selectors: ['form, main'] },
    { category: 'errors', name: 'unknown-route', path: '/ruta-inexistente-producto', selectors: ['[data-product-screen="not-found"]'] }
  ]

  for (const route of publicRoutes) {
    const result = await withPage(browser, { width: 1366, height: 900 }, async (page) => {
      const capture = await capturePage(page, baseUrl, dirs, route.category, route.name, route.path, { selectors: route.selectors })
      capture.controls = await auditControls(page)
      return capture
    })
    await assertNoCriticalEvents(result, route.name)
    result.eventLog = await writeEvidence(dirs, route.name, result)
    evidence.push(result)
  }

  for (const route of [
    { name: 'mobile-login-selector', path: '/login' },
    { name: 'mobile-escolar-login', path: '/login/escolar' },
    { name: 'mobile-guarderia-login', path: '/login/guarderia' }
  ]) {
    const result = await withPage(browser, { width: 390, height: 844 }, async (page) => {
      return capturePage(page, baseUrl, dirs, 'mobile', route.name, route.path, { selectors: ['.login-page'] })
    })
    await assertNoCriticalEvents(result, route.name)
    result.eventLog = await writeEvidence(dirs, route.name, result)
    evidence.push(result)
  }

  const redirectChecks = [
    { name: 'protected-school-redirect', path: '/familia/personas-autorizadas', expected: '/login' },
    { name: 'protected-daycare-redirect', path: '/familia/daycare', expected: '/login' },
    { name: 'protected-admin-redirect', path: '/admin/superadmin', expected: '/login' }
  ]

  for (const route of redirectChecks) {
    const result = await withPage(browser, { width: 1280, height: 860 }, async (page) => {
      const capture = await capturePage(page, baseUrl, dirs, 'launch', route.name, route.path, { selectors: ['.login-page'] })
      if (!new URL(capture.finalUrl).pathname.startsWith(route.expected)) {
        throw new Error(`${route.name} ended at ${capture.finalUrl}, expected ${route.expected}`)
      }
      return capture
    })
    await assertNoCriticalEvents(result, route.name)
    result.eventLog = await writeEvidence(dirs, route.name, result)
    evidence.push(result)
  }
}

async function escolarSuite(browser, baseUrl, dirs, evidence) {
  const result = await withPage(browser, { width: 1366, height: 900 }, async (page) => {
    await loginFamily(page, baseUrl, 'escolar', FIXTURES.school, '/familia/personas-autorizadas')
    const shots = []
    for (const route of [
      ['escolar-personas-autorizadas', '/familia/personas-autorizadas', ['[data-product-panel="personas-home"]']],
      ['escolar-actualizar-datos', '/familia/personas-autorizadas/actualizar-datos', ['main']],
      ['escolar-credencializacion', '/familia/personas-autorizadas/credencializacion', ['main']],
      ['escolar-hermanos', '/familia/personas-autorizadas/hermanos', ['main']],
      ['escolar-marbetes', '/familia/personas-autorizadas/marbetes', ['main']],
      ['escolar-talleres-servicios', '/familia/personas-autorizadas/convenios', ['main']],
      ['escolar-cambiar-password', '/familia/cuenta/seguridad', ['form, main']]
    ]) {
      shots.push(await capturePage(page, baseUrl, dirs, 'escolar', route[0], route[1], { selectors: route[2] }))
    }

    await page.goto(target(baseUrl, '/familia/personas-autorizadas'), { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => undefined)
    const captureButton = page.locator('[data-diagnostic-action="capturar-persona-autorizada"]').first()
    if (await captureButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await captureButton.click()
      await page.locator('.modal, [role="dialog"], form').first().waitFor({ state: 'visible', timeout: 10000 })
      shots.push(await captureCurrentPage(page, dirs, 'modals', 'escolar-capturar-persona-modal', { selectors: ['form'] }))
      const closeButton = page.locator('button[aria-label="Cerrar"], button:has-text("Cancelar")').first()
      if (await closeButton.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false)) await closeButton.click()
      await page.locator('[role="dialog"]').waitFor({ state: 'detached', timeout: 10000 }).catch(() => undefined)
    }

    await logoutThroughAccountMenu(page, baseUrl)
    await page.waitForURL((url) => url.pathname === '/login', { timeout: 15000 })
    shots.push(await capturePage(page, baseUrl, dirs, 'escolar', 'escolar-logout-return', page.url(), { selectors: ['.login-page'] }))

    return { name: 'escolar-journey', shots, controls: await auditControls(page) }
  })
  await assertNoCriticalEvents(result, 'escolar-journey')
  result.eventLog = await writeEvidence(dirs, 'escolar-journey', result)
  evidence.push(result)
}

async function guarderiaSuite(browser, baseUrl, dirs, evidence) {
  const result = await withPage(browser, { width: 1366, height: 900 }, async (page) => {
    await loginFamily(page, baseUrl, 'guarderia', FIXTURES.daycare, '/familia/daycare')
    const shots = []
    for (const route of [
      ['guarderia-home', '/familia/daycare', ['main']],
      ['guarderia-avisos', '/familia/daycare/avisos', ['main']],
      ['guarderia-tareas', '/familia/daycare/tareas', ['main']],
      ['guarderia-calendario', '/familia/daycare/calendario', ['main']],
      ['guarderia-cambiar-password', '/familia/cuenta/seguridad', ['form, main']]
    ]) {
      shots.push(await capturePage(page, baseUrl, dirs, 'guarderia', route[0], route[1], { selectors: route[2] }))
    }

    await logoutThroughAccountMenu(page, baseUrl)
    await page.waitForURL((url) => url.pathname === '/login', { timeout: 15000 })
    shots.push(await capturePage(page, baseUrl, dirs, 'guarderia', 'guarderia-logout-return', page.url(), { selectors: ['.login-page'] }))

    return { name: 'guarderia-journey', shots, controls: await auditControls(page) }
  })
  await assertNoCriticalEvents(result, 'guarderia-journey')
  result.eventLog = await writeEvidence(dirs, 'guarderia-journey', result)
  evidence.push(result)
}

async function adminSuite(browser, baseUrl, dirs, evidence, options = {}) {
  const includeDevFixtures = options.includeDevFixtures !== false
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } })
  await context.addCookies([await superAdminCookie(baseUrl)])
  const page = await context.newPage()
  const result = await withExistingPage(page, async () => {
    const shots = []
    shots.push(await capturePage(page, baseUrl, dirs, 'admin', 'admin-superadmin-dashboard', '/admin/superadmin', { selectors: ['[data-product-screen="directory"]'], timeout: 60000 }))
    shots.push(await capturePage(page, baseUrl, dirs, 'admin', 'admin-escolar-assignment', '/admin/superadmin/gestion-escolar', { selectors: ['[data-product-screen="gestion-escolar-permissions"]'], timeout: 60000 }))
    const activeGestionUserId = await page.evaluate(async () => {
      const response = await fetch('/api/admin/superadmin/gestion-escolar/users?limit=160')
      if (!response.ok) return null
      const data = await response.json()
      const user = Array.isArray(data?.users) ? data.users.find((item) => item?.gestionEscolar?.state === 'active') : null
      return user?.id || null
    }).catch(() => null)
    if (activeGestionUserId) {
      shots.push(await capturePage(page, baseUrl, dirs, 'admin', 'admin-escolar-assignment-active', `/admin/superadmin/gestion-escolar?usuario=${encodeURIComponent(activeGestionUserId)}`, { selectors: ['[data-product-screen="gestion-escolar-permissions"]'], timeout: 60000, settleMs: 900 }))
    }
    shots.push(await capturePage(page, baseUrl, dirs, 'admin', 'admin-escolar-workbench', '/admin/gestion-escolar', { selectors: ['[data-product-screen="overview"]'], timeout: 60000 }))
    shots.push(await capturePage(page, baseUrl, dirs, 'admin', 'admin-escolar-families', '/admin/gestion-escolar/familias', { selectors: ['[data-product-screen="familias"]'], timeout: 60000 }))
    shots.push(await capturePage(page, baseUrl, dirs, 'admin', 'admin-escolar-comunicados', '/admin/gestion-escolar/comunicados', { selectors: ['[data-product-screen="comunicados"]'], timeout: 60000 }))
    shots.push(await capturePage(page, baseUrl, dirs, 'admin', 'admin-escolar-encuestas', '/admin/gestion-escolar/encuestas', { selectors: ['[data-kind="encuesta"]'], timeout: 60000 }))
    shots.push(await capturePage(page, baseUrl, dirs, 'admin', 'admin-escolar-convenios', '/admin/gestion-escolar/convenios', { selectors: ['[data-kind="convenio"]'], timeout: 60000 }))
    shots.push(await capturePage(page, baseUrl, dirs, 'admin', 'admin-daycare-salas', '/admin/daycare/salas', { selectors: ['[data-product-screen="salas"]'], timeout: 60000 }))

    await page.setViewportSize({ width: 390, height: 844 })
    shots.push(await capturePage(page, baseUrl, dirs, 'mobile', 'admin-mobile-superadmin', '/admin/superadmin', { selectors: ['[data-product-screen="directory"]'], timeout: 60000 }))
    shots.push(await capturePage(page, baseUrl, dirs, 'mobile', 'admin-mobile-escolar-workbench', '/admin/gestion-escolar', { selectors: ['[data-product-screen="overview"]'], timeout: 60000 }))
    await page.setViewportSize({ width: 1366, height: 900 })

    const searchInput = page.locator('[data-diagnostic-filter="buscar-usuario"]')
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.fill('codex')
      await page.waitForTimeout(1000)
      shots.push(await captureCurrentPage(page, dirs, 'admin', 'admin-search-codex', { selectors: ['[data-product-screen="directory"]'] }))
    }

    const detailButton = page.locator('[data-diagnostic-action="detalle-usuario"]').first()
    if (await detailButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await detailButton.click()
      await page.waitForTimeout(500)
      shots.push(await captureCurrentPage(page, dirs, 'admin', 'admin-user-detail', { selectors: ['[data-product-screen="directory"]'] }))
    }

    const impersonateButton = page.locator('[data-diagnostic-action="impersonar-usuario"]:not([disabled])').first()
    if (await impersonateButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await impersonateButton.click()
      await page.waitForTimeout(500)
      shots.push(await captureCurrentPage(page, dirs, 'admin', 'admin-impersonation-confirmation', { selectors: ['[data-product-screen="directory"]'] }))
      const cancelButton = page.locator('[data-diagnostic-action="cancelar-impersonacion"]').first()
      if (await cancelButton.isVisible({ timeout: 3000 }).catch(() => false)) await cancelButton.click()
    }

    if (includeDevFixtures) {
      shots.push(await capturePage(page, baseUrl, dirs, 'admin', 'admin-husky-pass-fixture', '/admin/superadmin/personas-autorizadas?fixture=1', { selectors: ['[data-product-panel="pass-results"][data-state="content"]', '.preview-pair[data-state="ready"]'], timeout: 60000 }))

      const blockedPassCandidate = page.locator('[data-diagnostic-action="select-pass-candidate"]').filter({ hasText: 'Faltan datos' }).first()
      if (await blockedPassCandidate.isVisible({ timeout: 5000 }).catch(() => false)) {
        await blockedPassCandidate.click()
        shots.push(await captureCurrentPage(page, dirs, 'errors', 'admin-husky-pass-blocked-candidate', { selectors: ['.preview-pair[data-state="blocked"]'] }))
      }
    } else {
      shots.push(await capturePage(page, baseUrl, dirs, 'admin', 'admin-husky-pass-desk', '/admin/superadmin/personas-autorizadas', { selectors: ['[data-product-screen="husky-pass-desk"]'], timeout: 60000 }))
    }

    await logoutThroughAccountMenu(page, baseUrl)
    await page.waitForURL((url) => url.pathname === '/login', { timeout: 15000 })
    shots.push(await capturePage(page, baseUrl, dirs, 'admin', 'admin-logout-return', page.url(), { selectors: ['.login-page'] }))

    return { name: 'admin-journey', shots, controls: await auditControls(page) }
  })
  await context.close()
  await assertNoCriticalEvents(result, 'admin-journey')
  result.eventLog = await writeEvidence(dirs, 'admin-journey', result)
  evidence.push(result)
}

async function modalSuite(browser, baseUrl, dirs, evidence) {
  for (const item of [
    ['modal-escolar-edit', '/__dev/personas-modals?theme=escolar&mode=edit'],
    ['modal-guarderia-delete', '/__dev/personas-modals?theme=daycare&mode=delete'],
    ['modal-admin-busy', '/__dev/personas-modals?theme=admin&mode=busy']
  ]) {
    const result = await withPage(browser, { width: 1280, height: 860 }, async (page) => {
      return capturePage(page, baseUrl, dirs, 'modals', item[0], item[1], { selectors: ['main'] })
    })
    await assertNoCriticalEvents(result, item[0])
    result.eventLog = await writeEvidence(dirs, item[0], result)
    evidence.push(result)
  }
}

function sampleSegment(segment) {
  if (/^\[\.\.\./.test(segment)) return 'ruta-inexistente-producto'
  if (/^\[id\]$/.test(segment)) return '1'
  return segment
}

async function generatedRoutes() {
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true })
    const files = []
    for (const entry of entries) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) files.push(...await walk(path))
      else if (entry.isFile() && entry.name.endsWith('.vue')) files.push(path)
    }
    return files
  }
  const root = resolve('pages')
  const files = (await walk(root)).map((file) => `pages/${file.slice(root.length + 1).replace(/\\/g, '/')}`)
  return files.map((file) => {
    const noExt = file.replace(/\.vue$/, '')
    const parts = noExt.split(/[\\/]/).slice(1)
    const routeParts = parts.map(sampleSegment).filter((part, index, arr) => !(part === 'index' && index === arr.length - 1))
    const path = `/${routeParts.join('/')}`.replace(/\/+/g, '/')
    return { file, path: path === '/' ? '/' : path.replace(/\/$/, '') }
  }).sort((a, b) => a.path.localeCompare(b.path))
}

async function routeAuditSuite(browser, baseUrl, dirs, evidence, options = {}) {
  const routes = (await generatedRoutes()).filter((route) => !(options.skipDevRoutes && route.path.startsWith('/__dev/')))
  const rows = []
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } })
  try {
    for (const route of routes) {
      const url = target(baseUrl, route.path)
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch((error) => ({ error }))
      await page.waitForTimeout(200)
      const finalUrl = page.url()
      const text = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '')
      const starter = STARTER_PATTERNS.some((pattern) => pattern.test(text))
      const status = response && 'status' in response ? response.status() : 0
      rows.push({
        file: route.file,
        path: route.path,
        status,
        finalUrl,
        starter,
        ok: !starter && status < 500 && text.trim().length > 20,
        textSnippet: text.trim().slice(0, 180)
      })
    }
  } finally {
    await page.close()
  }

  const reportPath = join(dirs.routes, 'route-audit.json')
  await writeFile(reportPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl, routes: rows }, null, 2)}\n`, 'utf8')
  const markdown = [
    '# Route Audit',
    '',
    `Base URL: ${baseUrl}`,
    `Generated routes: ${rows.length}`,
    options.skipDevRoutes ? 'Dev-only routes skipped: yes' : 'Dev-only routes skipped: no',
    '',
    ...rows.map((row) => `- ${row.ok ? 'OK' : 'FAIL'} ${row.path} -> ${row.status} ${row.finalUrl} (${row.file})`)
  ].join('\n')
  const markdownPath = join(dirs.routes, 'route-audit.md')
  await writeFile(markdownPath, `${markdown}\n`, 'utf8')

  const failed = rows.filter((row) => !row.ok)
  const result = { name: 'route-audit', routeAudit: reportPath, markdown: markdownPath, failedRoutes: failed }
  if (failed.length) throw new Error(`Route audit found ${failed.length} failing routes. See ${reportPath}`)
  evidence.push(result)
}

async function main() {
  const baseUrl = argValue('base-url', process.env.HUSKY_PASS_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
  const outputRoot = resolve(argValue('out', join('artifacts', 'product-verification', stamp())))
  const suite = argValue('suite', 'all')
  const productionMode = suite === 'prod' || hasFlag('production')
  const executablePath = chromePath()
  const dirs = await ensureDirs(outputRoot)
  const browser = await chromium.launch(executablePath ? { executablePath, headless: true } : { headless: true })
  const evidence = []

  try {
    await waitForApplicationReady(browser, baseUrl)
    if (suite === 'launch' || suite === 'all' || suite === 'prod') await publicLaunchSuite(browser, baseUrl, dirs, evidence)
    if (suite === 'journeys' || suite === 'all' || suite === 'prod') {
      await escolarSuite(browser, baseUrl, dirs, evidence)
      await guarderiaSuite(browser, baseUrl, dirs, evidence)
      await adminSuite(browser, baseUrl, dirs, evidence, { includeDevFixtures: !productionMode })
      if (!productionMode) await modalSuite(browser, baseUrl, dirs, evidence)
    }
    if (suite === 'routes' || suite === 'all' || suite === 'prod') await routeAuditSuite(browser, baseUrl, dirs, evidence, { skipDevRoutes: productionMode })
  } finally {
    await browser.close()
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    suite,
    productionMode,
    outputRoot,
    executablePath: executablePath || 'playwright-bundled',
    evidence
  }
  await writeFile(join(outputRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  const report = [
    '# Product Visual Verification',
    '',
    `Generated: ${manifest.generatedAt}`,
    `Base URL: ${baseUrl}`,
    `Suite: ${suite}`,
    '',
    '## Evidence',
    ...evidence.flatMap((item) => {
      if (item.shots) return item.shots.map((shot) => `- ${shot.name}: ${shot.screenshot}`)
      if (item.screenshot) return [`- ${item.name}: ${item.screenshot}`]
      if (item.routeAudit) return [`- Route audit: ${item.routeAudit}`]
      return [`- ${item.name}`]
    })
  ].join('\n')
  await writeFile(join(outputRoot, 'verification-report.md'), `${report}\n`, 'utf8')
  console.log(outputRoot)

  if (hasFlag('strict-events')) {
    const eventIssues = evidence.filter((item) => item.consoleMessages?.length || item.pageErrors?.length || item.requestFailures?.length || item.serverResponses?.length)
    if (eventIssues.length) throw new Error(`Strict event mode found ${eventIssues.length} pages with events.`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
