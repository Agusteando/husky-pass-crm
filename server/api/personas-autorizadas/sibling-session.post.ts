import { defineEventHandler, readBody, setCookie } from 'h3'
import { z } from 'zod'
import { findLegacyFamilyByLogin } from '~/server/data/mysqlAuth'
import { getFamilyChildren } from '~/server/data/mysqlDaycare'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { requireSession, setAppSession } from '~/server/utils/session'
import { publicError } from '~/server/utils/httpError'
import { withRequestBoundary } from '~/server/utils/logger'
import { hasFamilyScope } from '~/utils/sessionScopes'
import { normalizeMatricula } from '~/utils/matricula'
import { resolveExperienceContext } from '~/utils/experienceIdentity'

const schema = z.object({
  matricula: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  return withRequestBoundary(event, 'personas-autorizadas.sibling.switch', async () => {
    const body = schema.parse(await readBody(event))
    const targetMatricula = normalizeMatricula(body.matricula)

    const siblings = await getFamilyChildren(user)
    const target = siblings.find((child) => child.canSwitch && normalizeMatricula(child.matricula) === targetMatricula)
    if (!target) {
      throw publicError(403, 'El alumno no esta disponible para cambio directo.')
    }

    const legacyUser = await findLegacyFamilyByLogin(targetMatricula)
    if (!legacyUser) {
      throw publicError(404, 'No encontramos una cuenta familiar activa para este alumno.')
    }

    const sessionUser = legacyUser.toSession('family')
    if (!hasFamilyScope(sessionUser, 'personasAutorizadas')) {
      throw publicError(403, 'La cuenta vinculada no tiene Personas Autorizadas habilitado.')
    }

    setAppSession(event, sessionUser)
    const resolved = resolveExperienceContext({
      routePath: '/familia/personas-autorizadas',
      user: sessionUser,
      matricula: target.matricula,
      plantel: target.plantel,
      nivelEdu: target.nivelEdu,
      campus: target.campus,
      grupo: target.grupo
    })
    setCookie(event, 'user_segment', resolved.context.experience === 'guarderia' ? 'guarderia' : 'escolar', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
    return { user: sessionUser, loggedin: true }
  }, { userId: user.id })
})
