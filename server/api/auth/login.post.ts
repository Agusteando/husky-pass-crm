import { defineEventHandler, readBody, setCookie, setHeader } from 'h3'
import { z } from 'zod'
import { authenticateLegacyFamily } from '~/server/data/mysqlAuth'
import { setAppSession } from '~/server/utils/session'
import { hasFamilyScope, hasAnyAdminScope, defaultAdminRoute, defaultFamilyRoute, requiresInstitutionalOnboarding } from '~/utils/sessionScopes'
import { defaultRouteForExperience, normalizeExperienceName } from '~/utils/experienceIdentity'
import { normalizeEmail } from '~/utils/superAdmin'
import { publicError } from '~/server/utils/httpError'
import type { AppSessionUser } from '~/types/session'

const schema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
  experience: z.enum(['escolar', 'guarderia']).optional()
})

function isInstitutionalIdentity(input: string, sessionUser: AppSessionUser) {
  const login = input.trim().toLowerCase()
  const email = normalizeEmail(sessionUser.email)
  return login.endsWith('@casitaiedis.edu.mx') || email.endsWith('@casitaiedis.edu.mx')
}

function preferredFamilyRoute(user: AppSessionUser, requestedExperience?: 'escolar' | 'guarderia') {
  const requested = normalizeExperienceName(requestedExperience || '')
  const canUseRequestedExperience = requested === 'guarderia'
    ? hasFamilyScope(user, 'daycare')
    : requested === 'escolar' && hasFamilyScope(user, 'personasAutorizadas')

  return requested && canUseRequestedExperience
    ? defaultRouteForExperience(user, requested)
    : defaultFamilyRoute(user)
}

export default defineEventHandler(async (event) => {
  const body = schema.parse(await readBody(event))
  setHeader(event, 'cache-control', 'private, no-store, max-age=0')
  const login = body.login.trim()
  const legacyUser = await authenticateLegacyFamily(login, body.password)
  if (!legacyUser) {
    throw publicError(401, 'Usuario o contraseña incorrectos.')
  }

  const familySession = legacyUser.toSession('family')
  const adminSession = legacyUser.toSession('admin')
  const canUseFamily = familySession.productScopes.length > 0
  const canUseAdmin = hasAnyAdminScope(adminSession)
  const institutionalIdentity = isInstitutionalIdentity(login, adminSession)
  const canCompleteOnboarding = institutionalIdentity && requiresInstitutionalOnboarding(adminSession)

  if (!canUseFamily && !canUseAdmin && !canCompleteOnboarding) {
    throw publicError(403, 'La cuenta no tiene un acceso habilitado en Husky Pass.')
  }

  const sessionUser = institutionalIdentity && (canUseAdmin || canCompleteOnboarding)
    ? adminSession
    : familySession

  setAppSession(event, sessionUser)

  if (sessionUser.kind === 'admin') {
    setCookie(event, 'user_segment', 'internal', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
    setCookie(event, 'ads_suppressed', 'true', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
    setCookie(event, 'last_login_type', 'password', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
    return { user: sessionUser, loggedin: true, defaultPath: defaultAdminRoute(sessionUser) }
  }

  const defaultPath = preferredFamilyRoute(sessionUser, body.experience)
  setCookie(event, 'user_segment', defaultPath.startsWith('/familia/daycare') ? 'guarderia' : 'escolar', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
  setCookie(event, 'last_login_type', 'password', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
  return { user: sessionUser, loggedin: true, defaultPath }
})
