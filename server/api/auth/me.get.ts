import { defineEventHandler, setHeader } from 'h3'
import { getSalaById } from '~/server/data/mysqlDaycare'
import { findLegacyFamilyById } from '~/server/data/mysqlAuth'
import { clearAppSession, getAppSession, setAppSession } from '~/server/utils/session'
import { daycareSalaName } from '~/utils/daycare'

export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'private, no-store, max-age=0')
  const session = getAppSession(event)

  if (session.user?.kind === 'family') {
    const legacyUser = await findLegacyFamilyById(Number(session.user.id))
    if (!legacyUser) {
      clearAppSession(event)
      return { user: null, loggedin: false }
    }
    session.user = legacyUser.toSession('family')
    setAppSession(event, session.user)
  }

  const scope = session.user?.kind === 'family' ? session.user.scopes.daycare : null

  if (session.user && scope && !daycareSalaName(scope)) {
    const salaId = Number(scope.sala)
    if (Number.isInteger(salaId) && salaId > 0) {
      try {
        const sala = await getSalaById(session.user, salaId)
        scope.salaName = sala.sala
        setAppSession(event, session.user)
      } catch {
        // Keep authentication available if the legacy sala relation cannot be resolved.
      }
    }
  }

  return session
})
