import { defineEventHandler, readBody, setCookie } from 'h3'
import { publicError } from '~/server/utils/httpError'
import { useRuntimeConfig } from 'nitropack/runtime'
import { OAuth2Client } from 'google-auth-library'
import { z } from 'zod'
import {
  createLegacyInstitutionalUser,
  createSuperAdminSession,
  findLegacyUserByEmail,
  syncLegacyInstitutionalProfile
} from '~/server/data/mysqlAuth'
import { setAppSession } from '~/server/utils/session'
import { assertDaycareAdmin, assertMarketingAdmin, assertSchoolAdmin } from '~/server/utils/authz'
import {
  defaultAdminRoute,
  hasDaycareAdminScope,
  hasMarketingAdminScope,
  hasSchoolAdminScope,
  requiresInstitutionalOnboarding
} from '~/utils/sessionScopes'
import { isConfiguredSuperAdminEmail, normalizeEmail } from '~/utils/superAdmin'

const schema = z.object({ credential: z.string().min(1) })

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!config.googleClientId) {
    throw publicError(500, 'GOOGLE_CLIENT_ID no está configurado.')
  }

  const body = schema.parse(await readBody(event))
  const client = new OAuth2Client(config.googleClientId)
  const ticket = await client.verifyIdToken({ idToken: body.credential, audience: config.googleClientId })
  const payload = ticket.getPayload()
  const email = normalizeEmail(payload?.email)

  if (!email.endsWith('@casitaiedis.edu.mx')) {
    throw publicError(403, 'El correo no pertenece a la institución.')
  }

  let legacyUser = await findLegacyUserByEmail(email)
  if (!legacyUser) {
    legacyUser = await createLegacyInstitutionalUser({
      email,
      displayName: payload?.name,
      picture: payload?.picture
    })
  } else if (payload?.name || payload?.picture) {
    await syncLegacyInstitutionalProfile(Number(legacyUser.raw.id), {
      displayName: payload?.name,
      picture: payload?.picture
    })
    legacyUser = await findLegacyUserByEmail(email) || legacyUser
  }

  let sessionUser
  if (isConfiguredSuperAdminEmail(email)) {
    sessionUser = await createSuperAdminSession({ email, displayName: payload?.name, picture: payload?.picture }, legacyUser)
  } else {
    sessionUser = legacyUser.toSession('admin')
    if (payload?.picture && !sessionUser.picture) sessionUser.picture = payload.picture
  }

  if (!requiresInstitutionalOnboarding(sessionUser)) {
    if (hasMarketingAdminScope(sessionUser)) {
      assertMarketingAdmin(sessionUser)
    } else if (hasSchoolAdminScope(sessionUser)) {
      assertSchoolAdmin(sessionUser)
    } else if (hasDaycareAdminScope(sessionUser)) {
      assertDaycareAdmin(sessionUser)
    } else {
      throw publicError(403, 'La cuenta institucional no tiene un espacio administrativo disponible.')
    }
  }

  setAppSession(event, sessionUser)
  setCookie(event, 'user_segment', 'internal', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
  setCookie(event, 'ads_suppressed', 'true', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
  setCookie(event, 'last_login_type', 'google', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })

  return { user: sessionUser, loggedin: true, defaultPath: defaultAdminRoute(sessionUser) }
})
