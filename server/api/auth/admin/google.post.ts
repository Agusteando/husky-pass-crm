import { defineEventHandler, readBody, setCookie } from 'h3'
import { publicError } from '~/server/utils/httpError'
import { useRuntimeConfig } from 'nitropack/runtime'
import { OAuth2Client } from 'google-auth-library'
import { z } from 'zod'
import { createSuperAdminSession, findLegacyUserByEmail, updateLegacyDisplayName } from '~/server/data/mysqlAuth'
import { setAppSession } from '~/server/utils/session'
import { assertCommunicationsAdmin, assertDaycareAdmin } from '~/server/utils/authz'
import { hasCommunicationsAdminScope, hasDaycareAdminScope } from '~/utils/sessionScopes'
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

  const legacyUser = await findLegacyUserByEmail(email)
  let sessionUser

  if (!legacyUser) {
    throw publicError(401, 'No hay ninguna cuenta interna creada con ese correo.')
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

  if (hasDaycareAdminScope(sessionUser)) {
    assertDaycareAdmin(sessionUser)
  } else if (hasCommunicationsAdminScope(sessionUser)) {
    assertCommunicationsAdmin(sessionUser)
  } else {
    throw publicError(403, 'Tu cuenta institucional no tiene un módulo administrativo asignado.')
  }

  setAppSession(event, sessionUser)
  setCookie(event, 'user_segment', 'internal', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
  setCookie(event, 'ads_suppressed', 'true', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
  setCookie(event, 'last_login_type', 'google', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })

  const defaultPath = sessionUser.isSuperAdmin
    ? '/admin/superadmin'
    : hasDaycareAdminScope(sessionUser) ? '/admin/daycare/salas' : '/admin/comunicados'
  return { user: sessionUser, loggedin: true, defaultPath }
})
