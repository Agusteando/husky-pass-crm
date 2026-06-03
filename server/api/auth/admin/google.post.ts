import { createError, defineEventHandler, readBody, setCookie } from 'h3'
import { useRuntimeConfig } from '#imports'
import { OAuth2Client } from 'google-auth-library'
import { z } from 'zod'
import { createSuperAdminSession, findLegacyUserByEmail, updateLegacyDisplayName } from '~/server/data/mysqlAuth'
import { setAppSession } from '~/server/utils/session'
import { assertDaycareAdmin } from '~/server/utils/authz'
import { isConfiguredSuperAdminEmail, normalizeEmail } from '~/utils/superAdmin'

const schema = z.object({ credential: z.string().min(1) })

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!config.googleClientId) {
    throw createError({ statusCode: 500, statusMessage: 'GOOGLE_CLIENT_ID no está configurado.' })
  }

  const body = schema.parse(await readBody(event))
  const client = new OAuth2Client(config.googleClientId)
  const ticket = await client.verifyIdToken({ idToken: body.credential, audience: config.googleClientId })
  const payload = ticket.getPayload()
  const email = normalizeEmail(payload?.email)

  if (!email.endsWith('@casitaiedis.edu.mx')) {
    throw createError({ statusCode: 403, statusMessage: 'El correo no pertenece a la institución.' })
  }

  const legacyUser = await findLegacyUserByEmail(email)
  let sessionUser

  if (!legacyUser) {
    throw createError({ statusCode: 401, statusMessage: 'No hay ninguna cuenta interna creada con ese correo.' })
  }

  if (payload?.name && payload.name !== legacyUser.raw.displayName) {
    await updateLegacyDisplayName(Number(legacyUser.raw.id), payload.name)
    legacyUser.raw.displayName = payload.name
  }

  if (isConfiguredSuperAdminEmail(email)) {
    sessionUser = await createSuperAdminSession({ email, displayName: payload?.name, picture: payload?.picture }, legacyUser)
  } else {
    sessionUser = legacyUser.toSession('admin')
    if (payload?.picture && !sessionUser.picture) sessionUser.picture = payload.picture
  }

  assertDaycareAdmin(sessionUser)

  setAppSession(event, sessionUser)
  setCookie(event, 'user_segment', 'internal', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
  setCookie(event, 'ads_suppressed', 'true', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
  setCookie(event, 'last_login_type', 'google', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })

  return { user: sessionUser, loggedin: true }
})
