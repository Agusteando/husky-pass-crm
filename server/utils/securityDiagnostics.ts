import { createHash } from 'node:crypto'

type DiagnosticContext = Record<string, unknown>

const REDACTED_KEYS = /password|token|private|secret|credential|payload|authorization/i

export function securityHash(value?: string | number | null) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!normalized) return null
  return createHash('sha256').update(normalized).digest('hex')
}

function safeContext(context: DiagnosticContext) {
  return Object.fromEntries(Object.entries(context).map(([key, value]) => {
    if (REDACTED_KEYS.test(key)) return [key, '[redacted]']
    if (value instanceof Error) return [key, value.message]
    return [key, value]
  }))
}

function errorSummary(error: unknown) {
  if (!error || typeof error !== 'object') return { message: String(error || 'unknown') }
  const candidate = error as {
    code?: string
    errno?: number
    sqlState?: string
    sqlMessage?: string
    message?: string
    statusCode?: number
    statusMessage?: string
    stack?: string
  }
  return {
    message: candidate.sqlMessage || candidate.statusMessage || candidate.message || 'unknown',
    code: candidate.code,
    errno: candidate.errno,
    sqlState: candidate.sqlState,
    statusCode: candidate.statusCode,
    statusMessage: candidate.statusMessage,
    stack: candidate.stack?.split('\n').slice(0, 3).join('\n')
  }
}

export function logSecurityDiagnostic(scope: string, error: unknown, context: DiagnosticContext = {}) {
  const payload = {
    scope,
    at: new Date().toISOString(),
    error: errorSummary(error),
    context: safeContext(context)
  }
  console.error(`[account-security:${scope}] ${JSON.stringify(payload)}`)
}

export function logSecurityWarning(scope: string, context: DiagnosticContext = {}) {
  const payload = {
    scope,
    at: new Date().toISOString(),
    context: safeContext(context)
  }
  console.warn(`[account-security:${scope}] ${JSON.stringify(payload)}`)
}
