type DiagnosticContext = Record<string, unknown>

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

export function logPersonasDiagnostic(scope: string, error: unknown, context: DiagnosticContext = {}) {
  const payload = {
    scope,
    at: new Date().toISOString(),
    error: errorSummary(error),
    context
  }
  console.error(`[personas-autorizadas:${scope}] ${JSON.stringify(payload)}`)
}

export function logPersonasWarning(scope: string, context: DiagnosticContext = {}) {
  const payload = {
    scope,
    at: new Date().toISOString(),
    context
  }
  console.warn(`[personas-autorizadas:${scope}] ${JSON.stringify(payload)}`)
}
