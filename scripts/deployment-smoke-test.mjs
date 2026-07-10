#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { chromium } from '@playwright/test'

function parseArgs() {
  const args = process.argv.slice(2)
  const parsed = {
    baseUrl: '',
    out: join('artifacts', 'vercel-deployment-smoke', new Date().toISOString().replace(/[:.]/g, '-')),
    parentEmail: '',
    parentPassword: '',
    superAdminEmail: '',
    superAdminPassword: ''
  }
  const positional = []
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--base-url') parsed.baseUrl = args[index += 1] || ''
    else if (arg.startsWith('--base-url=')) parsed.baseUrl = arg.slice('--base-url='.length)
    else if (arg === '--out') parsed.out = args[index += 1] || parsed.out
    else if (arg.startsWith('--out=')) parsed.out = arg.slice('--out='.length)
    else if (arg === '--parent-email') parsed.parentEmail = args[index += 1] || ''
    else if (arg === '--parent-password') parsed.parentPassword = args[index += 1] || ''
    else if (arg === '--superadmin-email') parsed.superAdminEmail = args[index += 1] || ''
    else if (arg === '--superadmin-password') parsed.superAdminPassword = args[index += 1] || ''
    else positional.push(arg)
  }
  if (!parsed.baseUrl && positional[0]) parsed.baseUrl = positional[0]
  if (positional[1]) parsed.out = positional[1]
  return parsed
}

function normalizeBaseUrl(value) {
  if (!value) throw new Error('Usa --base-url https://deployment-url')
  const url = new URL(value)
  return url.origin
}

function target(baseUrl, path) {
  return new URL(path, `${baseUrl}/`).toString()
}

function record(results, name, ok, detail = {}) {
  const row = { name, ok, ...detail }
  results.push(row)
  const line = ok ? 'ok' : 'fail'
  console.log(`${line}: ${name}`)
  return row
}

async function fetchWithTimeout(url, options = {}) {
  return fetch(url, {
    ...options,
    signal: AbortSignal.timeout(options.timeoutMs || 30000)
  })
}

async function checkFetch(results, baseUrl, name, path, options = {}) {
  try {
    const response = await fetchWithTimeout(target(baseUrl, path), {
      redirect: options.redirect || 'follow',
      method: options.method || 'GET',
      timeoutMs: options.timeoutMs || 30000
    })
    const contentType = response.headers.get('content-type') || ''
    const ok = options.accept
      ? options.accept(response, contentType)
      : response.status >= 200 && response.status < 500
    let bodySnippet = ''
    if (!ok || options.captureText) {
      bodySnippet = (await response.text()).slice(0, 300)
    }
    return record(results, name, ok, {
      path,
      status: response.status,
      contentType,
      url: response.url,
      bodySnippet
    })
  } catch (error) {
    return record(results, name, false, {
      path,
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

function isCriticalConsoleError(message) {
  return !/favicon|ResizeObserver loop|net::ERR_ABORTED/i.test(message)
}

async function browserRender(results, browser, baseUrl, outDir, label, viewport, path) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  const consoleErrors = []
  const pageErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  try {
    const response = await page.goto(target(baseUrl, path), { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => undefined)
    const screenshot = join(outDir, `${label}.png`)
    await page.screenshot({ path: screenshot, fullPage: true })
    const criticalConsoleErrors = consoleErrors.filter(isCriticalConsoleError)
    const ok = Boolean(response) && (response?.status() || 0) < 500 && pageErrors.length === 0 && criticalConsoleErrors.length === 0
    return record(results, `browser ${label}`, ok, {
      path,
      status: response?.status() || 0,
      finalUrl: page.url(),
      title: await page.title(),
      screenshot,
      consoleErrors: criticalConsoleErrors,
      pageErrors
    })
  } catch (error) {
    return record(results, `browser ${label}`, false, {
      path,
      error: error instanceof Error ? error.message : String(error),
      consoleErrors: consoleErrors.filter(isCriticalConsoleError),
      pageErrors
    })
  } finally {
    await context.close()
  }
}

async function loginAndRender(results, browser, baseUrl, outDir, label, email, password, destination) {
  if (!email || !password) {
    return record(results, `${label} authenticated route`, true, { skipped: true, reason: 'No fixture credentials provided.' })
  }

  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } })
  const page = await context.newPage()
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  try {
    await page.goto(target(baseUrl, '/login'), { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.locator('input[autocomplete="username"]').fill(email)
    await page.locator('input[autocomplete="current-password"]').fill(password)
    await page.locator('button[type="submit"]').click()
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => undefined)
    await page.goto(target(baseUrl, destination), { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => undefined)
    const screenshot = join(outDir, `${label}.png`)
    await page.screenshot({ path: screenshot, fullPage: true })
    const ok = pageErrors.length === 0 && !/\/login(?:$|\?)/.test(page.url())
    return record(results, `${label} authenticated route`, ok, {
      destination,
      finalUrl: page.url(),
      screenshot,
      pageErrors
    })
  } catch (error) {
    return record(results, `${label} authenticated route`, false, {
      destination,
      error: error instanceof Error ? error.message : String(error),
      pageErrors
    })
  } finally {
    await context.close()
  }
}

function markdownReport(report) {
  const lines = [
    '# Deployment Smoke Test',
    '',
    `- Base URL: ${report.baseUrl}`,
    `- Checked at: ${report.checkedAt}`,
    `- Result: ${report.ok ? 'OK' : 'FAILED'}`,
    '',
    '## Checks',
    ''
  ]
  for (const item of report.results) {
    lines.push(`- ${item.ok ? 'OK' : 'FAIL'} ${item.name} (${item.status || item.finalUrl || item.path || item.reason || ''})`)
  }
  return `${lines.join('\n')}\n`
}

const options = parseArgs()
const baseUrl = normalizeBaseUrl(options.baseUrl)
await mkdir(options.out, { recursive: true })

const results = []

await checkFetch(results, baseUrl, 'public app', '/', {
  captureText: true,
  accept: (response, contentType) => response.status < 500 && /text\/html/i.test(contentType)
})
await checkFetch(results, baseUrl, 'family login page', '/login', {
  captureText: true,
  accept: (response, contentType) => response.status === 200 && /text\/html/i.test(contentType)
})
await checkFetch(results, baseUrl, 'admin login page', '/admin/login', {
  captureText: true,
  accept: (response, contentType) => response.status === 200 && /text\/html/i.test(contentType)
})
await checkFetch(results, baseUrl, 'password recovery page', '/recuperar-contrasena', {
  captureText: true,
  accept: (response, contentType) => response.status === 200 && /text\/html/i.test(contentType)
})
await checkFetch(results, baseUrl, 'session api unauthenticated', '/api/auth/me', {
  accept: (response, contentType) => response.status === 200 && /application\/json/i.test(contentType)
})
await checkFetch(results, baseUrl, 'protected family route rejects unauthenticated', '/familia/personas-autorizadas', {
  redirect: 'manual',
  accept: (response) => [301, 302, 303, 307, 308, 401, 403].includes(response.status)
})

for (const path of [
  '/brand/husky-pass-logo.png',
  '/brand/iedis-logo.png',
  '/grupo-icons/manifest.json',
  '/grupo-icons/icons/mask/05-a.png',
  '/personas-autorizadas/ambassadors/primaria-brave.png',
  '/fonts/Montserrat-SemiBold.ttf'
]) {
  await checkFetch(results, baseUrl, `static ${path}`, path, {
    accept: (response) => response.status === 200
  })
}

const browser = await chromium.launch()
try {
  await browserRender(results, browser, baseUrl, options.out, 'desktop-login', { width: 1440, height: 960 }, '/login')
  await browserRender(results, browser, baseUrl, options.out, 'mobile-login', { width: 390, height: 844 }, '/login')
  await browserRender(results, browser, baseUrl, options.out, 'desktop-recovery', { width: 1366, height: 900 }, '/recuperar-contrasena')
  await loginAndRender(results, browser, baseUrl, options.out, 'parent-fixture', options.parentEmail, options.parentPassword, '/familia/personas-autorizadas')
  await loginAndRender(results, browser, baseUrl, options.out, 'superadmin-fixture', options.superAdminEmail, options.superAdminPassword, '/admin/superadmin')
} finally {
  await browser.close()
}

const report = {
  ok: results.every((item) => item.ok),
  checkedAt: new Date().toISOString(),
  baseUrl,
  outputDir: options.out,
  results
}

await writeFile(join(options.out, 'smoke-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
await writeFile(join(options.out, 'verification-report.md'), markdownReport(report), 'utf8')
await mkdir(dirname(join(options.out, 'smoke-report.json')), { recursive: true })

process.exit(report.ok ? 0 : 1)
