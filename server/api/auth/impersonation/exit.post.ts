import { defineEventHandler, setCookie } from 'h3'
import { publicError } from '~/server/utils/httpError'
import { getAppSession, setAppSession } from '~/server/utils/session'
import { auditGestionImpersonation } from '~/server/data/gestionEscolar'

export default defineEventHandler(async (event) => {
  const user = getAppSession(event).user
  const admin = user?.impersonation?.admin
  if (!user || !admin) {
    throw publicError(400, 'No hay una vista familiar activa')
  }

  await auditGestionImpersonation({ actorUserId: admin.id, targetUserId: user.id, action: 'exit', reason: 'Salida de impersonacion' })
  setAppSession(event, admin)
  setCookie(event, 'user_segment', 'internal', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
  return { user: admin, loggedin: true }
})
