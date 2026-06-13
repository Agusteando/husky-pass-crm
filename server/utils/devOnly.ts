import { createError } from 'h3'

export function assertDevOnly() {
  if (process.env.NODE_ENV === 'production') {
    throw createError({ statusCode: 404, statusMessage: 'Ruta no disponible.' })
  }
}
