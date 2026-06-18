import { publicError } from '~/server/utils/httpError'

export function assertDevOnly() {
  if (process.env.NODE_ENV === 'production') {
    throw publicError(404, 'Ruta no disponible.')
  }
}
