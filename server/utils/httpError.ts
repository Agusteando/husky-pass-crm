import { createError } from 'h3'

const STATUS_LABELS: Record<number, string> = {
  400: 'Solicitud invalida',
  401: 'Sesion requerida',
  403: 'Acceso no autorizado',
  404: 'No encontrado',
  409: 'Conflicto',
  413: 'Archivo muy grande',
  415: 'Tipo no permitido',
  422: 'Datos incompletos',
  429: 'Demasiados intentos',
  500: 'Error interno',
  502: 'Servicio externo',
  503: 'Servicio no disponible',
  504: 'Tiempo de espera'
}

export function publicError(statusCode: number, message: string, statusMessage = message || STATUS_LABELS[statusCode] || 'Error', data?: Record<string, unknown>) {
  return createError({
    statusCode,
    statusMessage,
    message,
    data
  })
}

export function timeoutError(message = 'La operacion excedio el tiempo de espera. Intenta de nuevo.') {
  return publicError(504, message)
}

export function unavailableError(message = 'El servicio no esta disponible. Intenta de nuevo.') {
  return publicError(503, message)
}
