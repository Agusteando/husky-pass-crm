import { errorSummary, logEvent, type LogLevel } from '~/server/utils/logger'

type DiagnosticContext = Record<string, unknown>

export function logPersonasDiagnostic(scope: string, error: unknown, context: DiagnosticContext = {}, level: LogLevel = 'debug') {
  logEvent(level, `personas-autorizadas:${scope}`, {
    scope,
    error: errorSummary(error),
    context
  })
}

export function logPersonasWarning(scope: string, context: DiagnosticContext = {}, level: LogLevel = 'warn') {
  logEvent(level, `personas-autorizadas:${scope}`, {
    scope,
    context
  })
}

export function logPersonasDebug(scope: string, context: DiagnosticContext = {}) {
  logPersonasWarning(scope, context, 'debug')
}
