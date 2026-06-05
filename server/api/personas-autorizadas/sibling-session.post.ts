import { createError, defineEventHandler, readBody, setCookie } from 'h3'
import { z } from 'zod'
import { findLegacyFamilyByLogin } from '~/server/data/mysqlAuth'
import { getFamilyChildren } from '~/server/data/mysqlDaycare'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { requireSession, setAppSession } from '~/server/utils/session'
import { hasFamilyScope } from '~/utils/sessionScopes'
import { logPersonasDiagnostic } from '~/server/utils/personasDiagnostics'
import { normalizeMatricula } from '~/utils/matricula'

const schema = z.object({
  matricula: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  try {
    const body = schema.parse(await readBody(event))
    const targetMatricula = normalizeMatricula(body.matricula)

    const siblings = await getFamilyChildren(user)
    const target = siblings.find((child) => child.canSwitch && normalizeMatricula(child.matricula) === targetMatricula)
    if (!target) {
      throw createError({ statusCode: 403, statusMessage: 'El alumno no está disponible para cambio directo.' })
    }

    const legacyUser = await findLegacyFamilyByLogin(targetMatricula)
    if (!legacyUser) {
      throw createError({ statusCode: 404, statusMessage: 'No encontramos una cuenta familiar activa para este alumno.' })
    }

    const sessionUser = legacyUser.toSession('family')
    if (!hasFamilyScope(sessionUser, 'personasAutorizadas')) {
      throw createError({ statusCode: 403, statusMessage: 'La cuenta vinculada no tiene Personas Autorizadas habilitado.' })
    }

    setAppSession(event, sessionUser)
    setCookie(event, 'user_segment', hasFamilyScope(sessionUser, 'daycare') ? 'daycare' : 'premium', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
    return { user: sessionUser, loggedin: true }
  } catch (error) {
    logPersonasDiagnostic('sibling-session-api-switch', error, { userId: user.id, username: user.username })
    throw error
  }
})
