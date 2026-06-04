import { createError, defineEventHandler } from 'h3'
import { isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'
import { readPersonasConfig } from '~/server/utils/personasConfig'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) throw createError({ statusCode: 403, statusMessage: 'Solo superadmin puede ver la configuracion de Personas Autorizadas.' })
  return readPersonasConfig()
})
