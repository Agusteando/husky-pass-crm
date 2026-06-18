import { defineEventHandler, setHeader } from 'h3'
import { publicError } from '~/server/utils/httpError'
import { isSuperAdmin } from '~/server/utils/authz'
import { buildEnvChecklist } from '~/server/utils/envChecklist'
import { requireSession } from '~/server/utils/session'

export default defineEventHandler((event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) {
    throw publicError(403, 'Solo superadmin puede revisar el entorno.')
  }

  setHeader(event, 'Cache-Control', 'private, no-store')
  return buildEnvChecklist()
})
