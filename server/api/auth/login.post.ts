import { createError, defineEventHandler, readBody, setCookie } from 'h3'
import { z } from 'zod'
import { findLegacyFamilyByLogin, validateLegacyPassword } from '~/server/data/mysqlAuth'
import { setAppSession } from '~/server/utils/session'
import { hasFamilyScope } from '~/utils/sessionScopes'
import { defaultRouteForExperience, normalizeExperienceName } from '~/utils/experienceIdentity'
import { logSecurityWarning, securityHash } from '~/server/utils/securityDiagnostics'

const schema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
  experience: z.enum(['escolar', 'guarderia'])
})

export default defineEventHandler(async (event) => {
  const body = schema.parse(await readBody(event))
  const legacyUser = await findLegacyFamilyByLogin(body.login.trim())
  if (!legacyUser) {
    throw createError({ statusCode: 401, statusMessage: 'Usuario o contraseña incorrectos.' })
  }

  const valid = await validateLegacyPassword(body.password, legacyUser.raw)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Usuario o contraseña incorrectos.' })
  }

  const sessionUser = legacyUser.toSession('family')
  if (!sessionUser.productScopes.length) {
    throw createError({ statusCode: 403, statusMessage: 'La cuenta no tiene un acceso familiar habilitado.' })
  }

  const requestedExperience = normalizeExperienceName(body.experience)
  const canUseRequestedExperience = requestedExperience === 'guarderia'
    ? hasFamilyScope(sessionUser, 'daycare')
    : requestedExperience === 'escolar' && hasFamilyScope(sessionUser, 'personasAutorizadas')

  if (!requestedExperience || !canUseRequestedExperience) {
    logSecurityWarning('identity-login-experience-mismatch', {
      requestedExperience: body.experience,
      resolvedScopes: sessionUser.productScopes,
      userId: sessionUser.id,
      loginHash: securityHash(body.login.trim().toLowerCase())
    })
    throw createError({
      statusCode: 403,
      statusMessage: 'Este acceso no corresponde a la cuenta indicada. Revisa que estes entrando desde la experiencia correcta.'
    })
  }

  setAppSession(event, sessionUser)
  setCookie(event, 'user_segment', requestedExperience === 'guarderia' ? 'guarderia' : 'escolar', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
  setCookie(event, 'last_login_type', 'php', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
  return { user: sessionUser, loggedin: true, defaultPath: defaultRouteForExperience(sessionUser, requestedExperience) }
})
