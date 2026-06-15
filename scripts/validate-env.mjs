#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

function parseArgs() {
  const args = process.argv.slice(2)
  const parsed = { file: '', mode: process.env.NODE_ENV || 'development', strictEmail: false, json: false, allowSensitivePlaceholders: false }
  const positional = []
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--file') parsed.file = args[index += 1] || ''
    else if (arg.startsWith('--file=')) parsed.file = arg.slice('--file='.length)
    else if (arg === '--mode') parsed.mode = args[index += 1] || parsed.mode
    else if (arg.startsWith('--mode=')) parsed.mode = arg.slice('--mode='.length)
    else if (arg === '--strict-email') parsed.strictEmail = true
    else if (arg === '--json') parsed.json = true
    else if (arg === '--allow-sensitive-placeholders') parsed.allowSensitivePlaceholders = true
    else positional.push(arg)
  }
  if (!parsed.file && positional[0]) parsed.file = positional[0]
  if (positional[1]) parsed.mode = positional[1]
  if (positional.includes('json')) parsed.json = true
  if (positional.includes('strict-email')) parsed.strictEmail = true
  if (positional.includes('allow-sensitive-placeholders')) parsed.allowSensitivePlaceholders = true
  return parsed
}

function parseDotEnv(content) {
  const result = {}
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line)
    if (!match) continue
    let value = match[2].trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    result[match[1]] = value
  }
  return result
}

async function loadEnv(file) {
  const fromProcess = { ...process.env }
  if (!file) return fromProcess
  if (!existsSync(file)) return fromProcess
  return { ...fromProcess, ...parseDotEnv(await readFile(file, 'utf8')) }
}

function hasValue(env, key) {
  return String(env[key] || '').trim().length > 0
}

function hasRequiredValue(env, key, options) {
  return hasValue(env, key) || (options.allowSensitivePlaceholders && Object.prototype.hasOwnProperty.call(env, key))
}

function numberIsValid(env, key, fallback) {
  if (String(env[key] ?? '') === '') return true
  const raw = hasValue(env, key) ? env[key] : fallback
  const value = Number(raw)
  return Number.isFinite(value) && value > 0
}

function privateKeyConfigured(env, options) {
  return hasRequiredValue(env, 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY', options)
}

function validate(env, options) {
  const errors = []
  const warnings = []
  const requiredRuntime = [
    'MYSQL_HOST',
    'MYSQL_PORT',
    'MYSQL_USER',
    'MYSQL_PASSWORD',
    'MYSQL_DATABASE',
    'SESSION_SECRET',
    'GOOGLE_CLIENT_ID'
  ]

  for (const key of requiredRuntime) {
    if (!hasRequiredValue(env, key, options)) errors.push(`${key} falta o esta vacia.`)
  }

  if (!numberIsValid(env, 'MYSQL_PORT', '3306')) errors.push('MYSQL_PORT debe ser numerico.')
  if (!numberIsValid(env, 'MYSQL_CONNECTION_LIMIT', '10')) errors.push('MYSQL_CONNECTION_LIMIT debe ser numerico cuando se configura.')
  if (hasValue(env, 'ATTENDANCE_MYSQL_PORT') && !numberIsValid(env, 'ATTENDANCE_MYSQL_PORT', '3306')) errors.push('ATTENDANCE_MYSQL_PORT debe ser numerico.')
  if (hasValue(env, 'ATTENDANCE_MYSQL_CONNECTION_LIMIT') && !numberIsValid(env, 'ATTENDANCE_MYSQL_CONNECTION_LIMIT', '5')) errors.push('ATTENDANCE_MYSQL_CONNECTION_LIMIT debe ser numerico.')

  if (hasValue(env, 'SESSION_SECRET') && String(env.SESSION_SECRET || '').trim().length < 32) {
    warnings.push('SESSION_SECRET debe ser largo y aleatorio; 32+ caracteres recomendados.')
  }

  if (!hasValue(env, 'ATTENDANCE_MYSQL_HOST')) {
    warnings.push('ATTENDANCE_MYSQL_* no esta configurado; asistencia usara la configuracion MySQL principal o valores por defecto.')
  }

  if (!hasRequiredValue(env, 'PASSWORD_RECOVERY_BASE_URL', options)) {
    warnings.push('PASSWORD_RECOVERY_BASE_URL falta; recuperacion de contrasena no podra generar enlaces publicos correctos.')
  }

  const emailMode = String(env.PASSWORD_RECOVERY_EMAIL_MODE || '').trim().toLowerCase()
  if (options.strictEmail || emailMode === 'gmail') {
    for (const key of ['PASSWORD_RECOVERY_BASE_URL', 'PASSWORD_RECOVERY_FROM_EMAIL', 'GOOGLE_SERVICE_ACCOUNT_EMAIL']) {
      if (!hasRequiredValue(env, key, options)) errors.push(`${key} falta para envio real de recuperacion de contrasena.`)
    }
    if (!privateKeyConfigured(env, options)) errors.push('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY falta para envio real.')
    if (!hasRequiredValue(env, 'GOOGLE_WORKSPACE_DELEGATED_USER', options) && !hasRequiredValue(env, 'GOOGLE_GMAIL_DELEGATED_USER', options)) {
      errors.push('GOOGLE_WORKSPACE_DELEGATED_USER falta para envio Gmail delegado.')
    }
  }

  if (hasValue(env, 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY') && !String(env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY).includes('\\n') && !String(env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY).includes('\n')) {
    warnings.push('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY no contiene saltos de linea escapados; usa \\n en el valor directo.')
  }

  if (hasValue(env, 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64')) {
    warnings.push('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64 ya no se usa; configura GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY como texto directo.')
  }

  return {
    ok: errors.length === 0,
    mode: options.mode,
    checked: {
      runtime: requiredRuntime,
      strictEmail: Boolean(options.strictEmail || emailMode === 'gmail'),
      allowSensitivePlaceholders: Boolean(options.allowSensitivePlaceholders)
    },
    errors,
    warnings
  }
}

const options = parseArgs()
const env = await loadEnv(options.file)
const report = validate(env, options)

if (options.json) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log(`Environment check: ${report.ok ? 'ok' : 'failed'} (${report.mode})`)
  for (const warning of report.warnings) console.warn(`warning: ${warning}`)
  for (const error of report.errors) console.error(`error: ${error}`)
}

process.exit(report.ok ? 0 : 1)
