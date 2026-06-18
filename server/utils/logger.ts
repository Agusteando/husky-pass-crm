import { getHeader, getRequestURL, setHeader, type H3Event } from 'h3'
import { createHash, randomUUID } from 'node:crypto'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'
type LogContext = Record<string, unknown>
type RequestBoundaryOptions = {
  expectedStatusCodes?: number[]
}

const LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  fatal: 50
}

const SENSITIVE_KEY = /(password|contrasena|token|cookie|secret|private|key|curp|email|correo|mail|nombre|paterno|materno|familia|payload|sql|query|foto|photo)/i
const IDENTIFIER_KEY = /(matricula|username|login|userId|id)$/i

function configuredLevel(): LogLevel {
  if (process.env.HUSKY_PASS_DEBUG === '1' || process.env.PERSONAS_DIAGNOSTICS === '1') return 'debug'
  const raw = String(process.env.HUSKY_PASS_LOG_LEVEL || process.env.LOG_LEVEL || '').toLowerCase()
  return raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error' || raw === 'fatal'
    ? raw
    : process.env.NODE_ENV === 'production' ? 'info' : 'warn'
}

function shouldLog(level: LogLevel) {
  return LEVELS[level] >= LEVELS[configuredLevel()]
}

export function shortHash(value: unknown) {
  return createHash('sha256').update(String(value ?? '')).digest('hex').slice(0, 12)
}

function redactValue(key: string, value: unknown): unknown {
  if (value === undefined) return undefined
  if (value === null) return null
  if (value instanceof Error) return errorSummary(value)
  if (Array.isArray(value)) return value.slice(0, 12).map((item) => redactValue(key, item))
  if (typeof value === 'object') return redactContext(value as LogContext)
  if (SENSITIVE_KEY.test(key)) return { redacted: true, hash: shortHash(value) }
  if (IDENTIFIER_KEY.test(key) && String(value).trim()) return { hash: shortHash(value) }
  return value
}

export function redactContext(context: LogContext = {}) {
  const safe: LogContext = {}
  for (const [key, value] of Object.entries(context)) {
    const redacted = redactValue(key, value)
    if (redacted !== undefined) safe[key] = redacted
  }
  return safe
}

export function errorSummary(error: unknown) {
  if (!error || typeof error !== 'object') return { message: String(error || 'unknown') }
  const candidate = error as {
    code?: string
    errno?: number
    sqlState?: string
    message?: string
    statusCode?: number
    statusMessage?: string
    stack?: string
  }
  return {
    message: candidate.message || candidate.statusMessage || 'unknown',
    code: candidate.code,
    errno: candidate.errno,
    sqlState: candidate.sqlState,
    statusCode: candidate.statusCode,
    statusMessage: candidate.statusMessage,
    stack: process.env.NODE_ENV === 'production' ? undefined : candidate.stack?.split('\n').slice(0, 3).join('\n')
  }
}

export function ensureRequestId(event?: H3Event | null) {
  if (!event) return randomUUID()
  const context = event.context as Record<string, unknown>
  if (typeof context.requestId === 'string') return context.requestId
  const incoming = getHeader(event, 'x-request-id') || getHeader(event, 'x-correlation-id')
  const requestId = incoming && incoming.length <= 80 ? incoming : randomUUID()
  context.requestId = requestId
  setHeader(event, 'x-request-id', requestId)
  return requestId
}

function routeContext(event?: H3Event | null) {
  if (!event) return {}
  const url = getRequestURL(event)
  return {
    requestId: ensureRequestId(event),
    method: event.method,
    route: url.pathname
  }
}

export function logEvent(level: LogLevel, message: string, context: LogContext = {}, event?: H3Event | null) {
  if (!shouldLog(level)) return
  const payload = {
    level,
    at: new Date().toISOString(),
    message,
    ...routeContext(event),
    ...redactContext(context)
  }

  if (process.env.NODE_ENV === 'production') {
    console[level === 'fatal' ? 'error' : level](JSON.stringify(payload))
    return
  }

  const requestId = typeof payload.requestId === 'string' ? ` request=${payload.requestId}` : ''
  const route = typeof payload.route === 'string' ? ` route=${payload.route}` : ''
  console[level === 'fatal' ? 'error' : level](`[${level}] ${message}${requestId}${route} ${JSON.stringify(payload)}`)
}

export function logErrorOnce(event: H3Event, operation: string, error: unknown, context: LogContext = {}) {
  const requestId = ensureRequestId(event)
  const summary = errorSummary(error)
  const key = `${operation}:${summary.statusCode || ''}:${summary.code || ''}:${summary.message || ''}`
  const eventContext = event.context as Record<string, unknown>
  const logged = eventContext.loggedErrorKeys instanceof Set ? eventContext.loggedErrorKeys : new Set<string>()
  eventContext.loggedErrorKeys = logged
  if (logged.has(key)) return
  logged.add(key)
  logEvent('error', operation, { ...context, error: summary, requestId }, event)
}

export async function withRequestBoundary<T>(
  event: H3Event,
  operation: string,
  run: () => Promise<T>,
  context: LogContext = {},
  options: RequestBoundaryOptions = {}
) {
  const startedAt = performance.now()
  try {
    const result = await run()
    logEvent('debug', operation, { ...context, durationMs: Math.round(performance.now() - startedAt) }, event)
    return result
  } catch (error) {
    const summary = errorSummary(error)
    const statusCode = Number(summary.statusCode || 0)
    if (options.expectedStatusCodes?.includes(statusCode)) {
      logEvent('debug', operation, { ...context, durationMs: Math.round(performance.now() - startedAt), error: summary }, event)
    } else {
      logErrorOnce(event, operation, error, { ...context, durationMs: Math.round(performance.now() - startedAt) })
    }
    throw error
  }
}
