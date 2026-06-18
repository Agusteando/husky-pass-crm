import { createHash } from 'node:crypto'
import { errorSummary, logEvent } from '~/server/utils/logger'

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

export function logSecurityDiagnostic(scope: string, error: unknown, context: DiagnosticContext = {}) {
  logEvent('error', `account-security:${scope}`, {
    scope,
    error: errorSummary(error),
    context: safeContext(context)
  })
}

export function logSecurityWarning(scope: string, context: DiagnosticContext = {}) {
  logEvent('warn', `account-security:${scope}`, {
    scope,
    context: safeContext(context)
  })
}
