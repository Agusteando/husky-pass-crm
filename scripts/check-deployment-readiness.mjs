#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join, relative, sep } from 'node:path'

const outputArgIndex = process.argv.findIndex((arg) => arg === '--out')
const positionalOutputPath = process.argv.slice(2).find((arg) => !arg.startsWith('--')) || ''
const outputPath = outputArgIndex >= 0 ? process.argv[outputArgIndex + 1] : positionalOutputPath
const root = process.cwd()
const errors = []
const warnings = []
const details = {}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

async function collectFiles(dir) {
  const rows = []
  if (!existsSync(dir)) return rows
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) rows.push(...await collectFiles(full))
    else rows.push(full)
  }
  return rows
}

function toPosix(path) {
  return path.split(sep).join('/')
}

async function checkPackage() {
  const pkg = await readJson(join(root, 'package.json'))
  details.packageManager = pkg.packageManager || ''
  details.nodeEngine = pkg.engines?.node || ''
  if (!existsSync(join(root, 'package-lock.json'))) errors.push('package-lock.json no existe; Vercel debe usar npm ci con lockfile.')
  if (pkg.packageManager && !pkg.packageManager.startsWith('npm@')) errors.push('packageManager debe permanecer en npm para coincidir con package-lock.json.')
  if (pkg.engines?.node !== '24.x') errors.push('package.json debe fijar engines.node en 24.x.')
}

async function checkVercelConfig() {
  const configPath = join(root, 'vercel.json')
  if (!existsSync(configPath)) {
    errors.push('vercel.json no existe.')
    return
  }
  const config = await readJson(configPath)
  if (config.framework !== 'nuxtjs') errors.push('vercel.json debe declarar framework nuxtjs.')
  if (config.installCommand && config.installCommand !== 'npm ci') errors.push('Si vercel.json declara installCommand, debe usar npm ci.')
  if (config.buildCommand && config.buildCommand !== 'npm run build') errors.push('Si vercel.json declara buildCommand, debe usar npm run build.')

  const ignorePath = join(root, '.vercelignore')
  if (!existsSync(ignorePath)) {
    errors.push('.vercelignore no existe; Vercel podria subir builds locales, artefactos o secretos.')
    return
  }
  const ignore = await readFile(ignorePath, 'utf8')
  const requiredIgnores = ['.env', '.vercel', '.nuxt', '.output', 'node_modules', 'artifacts']
  const missing = requiredIgnores.filter((entry) => !new RegExp(`(^|\\n)${entry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\n|$)`).test(ignore))
  if (missing.length) errors.push(`.vercelignore no excluye: ${missing.join(', ')}`)
}

async function checkNuxtConfig() {
  const config = await readFile(join(root, 'nuxt.config.ts'), 'utf8')
  if (/trace\s*:\s*false/.test(config)) errors.push('nuxt.config.ts no debe desactivar el trace de Nitro para Vercel.')
  if (!/preset:\s*process\.env\.NITRO_PRESET/.test(config)) warnings.push('No se encontro preset Nitro configurable por NITRO_PRESET.')
}

async function checkClientImports() {
  const clientDirs = ['pages', 'components', 'composables']
  const badImports = []
  for (const dir of clientDirs) {
    for (const file of await collectFiles(join(root, dir))) {
      if (!/\.(vue|ts|js|mjs)$/.test(file)) continue
      const content = await readFile(file, 'utf8')
      if (/(?:from\s+['"]node:|import\s+['"]node:|require\(['"]node:)/.test(content)) badImports.push(toPosix(relative(root, file)))
    }
  }
  if (badImports.length) errors.push(`Imports Node en archivos cliente: ${badImports.join(', ')}`)
  details.clientNodeImportViolations = badImports
}

async function checkStaticAssets() {
  const required = [
    'brand/husky-pass-logo.png',
    'brand/iecs-logo.png',
    'brand/iedis-logo.png',
    'grupo-icons/manifest.json',
    'grupo-icons/icons/mask/05-a.png',
    'personas-autorizadas/ambassadors/primaria-brave.png',
    'fonts/Montserrat-SemiBold.ttf'
  ]
  for (const asset of required) {
    if (!existsSync(join(root, 'public', ...asset.split('/')))) errors.push(`Asset publico requerido no existe: /${asset}`)
  }

  const publicFiles = await collectFiles(join(root, 'public'))
  const byLower = new Map(publicFiles.map((file) => [toPosix(relative(join(root, 'public'), file)).toLowerCase(), toPosix(relative(join(root, 'public'), file))]))
  const sourceFiles = [
    ...await collectFiles(join(root, 'pages')),
    ...await collectFiles(join(root, 'components')),
    ...await collectFiles(join(root, 'utils')),
    ...await collectFiles(join(root, 'server'))
  ].filter((file) => /\.(vue|ts|js|mjs|css)$/.test(file))
  const caseProblems = []
  const assetPattern = /["'`](\/(?:brand|grupo-icons|personas-autorizadas|fonts|uploads)\/[^"'`?#)\s]+)/g
  for (const file of sourceFiles) {
    const content = await readFile(file, 'utf8')
    for (const match of content.matchAll(assetPattern)) {
      const requested = match[1].replace(/^\/+/, '')
      if (requested.includes('${') || requested.includes('%')) continue
      const actual = byLower.get(requested.toLowerCase())
      if (actual && actual !== requested) caseProblems.push(`${toPosix(relative(root, file))}: /${requested} -> /${actual}`)
      if (!actual && !requested.includes('${')) caseProblems.push(`${toPosix(relative(root, file))}: /${requested} no existe`)
    }
  }
  if (caseProblems.length) errors.push(`Rutas de assets con mayusculas/minusculas o inexistentes: ${caseProblems.join('; ')}`)
  details.caseSensitiveAssetProblems = caseProblems
}

async function checkPreviousVercelOutput() {
  const functionDir = join(root, '.vercel', 'output', 'functions')
  if (!existsSync(functionDir)) {
    warnings.push('No hay .vercel/output local; ejecuta npm run build:vercel para inspeccionar el output.')
    return
  }
  const outputFiles = (await collectFiles(functionDir)).filter((file) => /\.(mjs|js|json)$/.test(file))
  const absoluteImports = []
  for (const file of outputFiles) {
    const content = await readFile(file, 'utf8')
    if (/file:\/\/[A-Za-z]:\//.test(content)) absoluteImports.push(toPosix(relative(root, file)))
  }
  if (absoluteImports.length) errors.push(`El output Vercel contiene imports absolutos locales: ${absoluteImports.slice(0, 10).join(', ')}`)
  details.absoluteFileImportsInVercelOutput = absoluteImports

  const fallbackConfig = join(functionDir, '__fallback.func', '.vc-config.json')
  if (existsSync(fallbackConfig)) {
    const config = await readJson(fallbackConfig)
    details.vercelFunctionRuntime = config.runtime || ''
  }

  const manifestPath = join(root, '.vercel', 'output', 'diagnostics', 'project-manifest.json')
  if (existsSync(manifestPath)) {
    const manifest = await readJson(manifestPath)
    const entry = manifest['@vercel/static-build:.']
    details.vercelBuildRuntime = entry?.runtimeVersion || null
  }
}

await checkPackage()
await checkVercelConfig()
await checkNuxtConfig()
await checkClientImports()
await checkStaticAssets()
await checkPreviousVercelOutput()

const report = {
  ok: errors.length === 0,
  checkedAt: new Date().toISOString(),
  errors,
  warnings,
  details
}

if (outputPath) {
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
}

console.log(JSON.stringify(report, null, 2))
process.exit(report.ok ? 0 : 1)
