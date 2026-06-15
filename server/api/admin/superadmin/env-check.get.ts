import { createError, defineEventHandler, setHeader } from 'h3'
import { isSuperAdmin } from '~/server/utils/authz'
import { buildEnvChecklist } from '~/server/utils/envChecklist'
import { requireSession } from '~/server/utils/session'

export default defineEventHandler((event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) {
    throw createError({ statusCode: 403, statusMessage: 'Solo superadmin puede revisar el entorno.' })
  }

  setHeader(event, 'Cache-Control', 'private, no-store')
  return buildEnvChecklist()
})
