import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

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

const FIXTURES = {
  login: 'codex.pa.parent@example.test',
  password: process.env.CODEX_ACCOUNT_SECURITY_PASSWORD || 'CodexPass2026'
}

const ROUTES = [
  { name: 'personas', path: '/familia/personas-autorizadas', limits: { '/api/auth/me': 1, '/api/personas-autorizadas/family': 1 } },
  { name: 'actualizar-datos', path: '/familia/personas-autorizadas/actualizar-datos', limits: { '/api/auth/me': 1, '/api/personas-autorizadas/family': 1, '/api/personas-autorizadas/student': 1 } },
  { name: 'credencializacion', path: '/familia/personas-autorizadas/credencializacion', limits: { '/api/auth/me': 1, '/api/personas-autorizadas/family': 1, '/api/personas-autorizadas/student': 1 } },
  { name: 'hermanos', path: '/familia/personas-autorizadas/hermanos', limits: { '/api/auth/me': 1, '/api/personas-autorizadas/family': 1 } }
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

function target(baseUrl, path) {
  return new URL(path, `${baseUrl}/`).toString()
}

function normalizeRequest(url) {
  const parsed = new URL(url)
  if (!parsed.pathname.startsWith('/api/')) return ''
  const params = [...parsed.searchParams.entries()]
    .filter(([key]) => !/^(_|t|cache|timestamp)$/i.test(key))
    .sort(([left], [right]) => left.localeCompare(right))
  parsed.search = new URLSearchParams(params).toString()
  return `${parsed.pathname}${parsed.search ? `?${parsed.search}` : ''}`
}

async function waitForUsable(page) {
  await page.waitForLoadState('domcontentloaded')
  await page.waitForFunction(() => {
    const bodyText = document.body?.innerText || ''
    return document.body?.children.length && !/Welcome to Nuxt|NuxtWelcome|Get started by editing/i.test(bodyText)
  }, null, { timeout: 20000 })
}

async function login(page, baseUrl) {
  const response = await page.request.post(target(baseUrl, '/api/auth/login'), {
    data: { login: FIXTURES.login, password: FIXTURES.password, experience: 'escolar' },
    timeout: 30000
  })
  if (!response.ok()) {
    throw new Error(`fixture login failed with HTTP ${response.status()}`)
  }
}

async function captureRoute(page, baseUrl, route) {
  const requests = []
  const onRequest = (request) => {
    const normalized = normalizeRequest(request.url())
    if (normalized) requests.push({ method: request.method(), url: normalized })
  }
  page.on('request', onRequest)
  try {
    await page.goto(target(baseUrl, route.path), { waitUntil: 'domcontentloaded', timeout: 30000 })
    await waitForUsable(page)
    await page.waitForTimeout(900)
  } finally {
    page.off('request', onRequest)
  }

  const counts = {}
  for (const request of requests) {
    if (request.method !== 'GET') continue
    counts[request.url] = (counts[request.url] || 0) + 1
  }
  const issues = Object.entries(route.limits)
    .filter(([url, limit]) => (counts[url] || 0) > limit)
    .map(([url, limit]) => ({ url, limit, actual: counts[url] || 0 }))
  return { route: route.name, path: route.path, counts, issues }
}

async function main() {
  const baseUrl = argValue('base-url', 'http://127.0.0.1:3000')
  const out = argValue('out', join('.agent-artifacts', 'request-verification', stamp()))
  await mkdir(out, { recursive: true })
  const executablePath = chromePath()
  const browser = await chromium.launch(executablePath ? { executablePath, headless: true } : { headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 920 } })
  const evidence = []
  try {
    await login(page, baseUrl)
    for (const route of ROUTES) evidence.push(await captureRoute(page, baseUrl, route))
  } finally {
    await browser.close()
  }
  const issues = evidence.flatMap((item) => item.issues.map((issue) => ({ route: item.route, ...issue })))
  const report = { ok: issues.length === 0, baseUrl, evidence, issues }
  await writeFile(join(out, 'request-verification.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify(report, null, 2))
  if (issues.length) process.exitCode = 1
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
