import { getAppSession, setAppSession } from '~/server/utils/session'

export default defineEventHandler((event) => {
  const user = getAppSession(event).user
  const admin = user?.impersonation?.admin
  if (!user || !admin) {
    throw createError({ statusCode: 400, statusMessage: 'No hay una vista familiar activa' })
  }

  setAppSession(event, admin)
  setCookie(event, 'user_segment', 'internal', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
  return { user: admin, loggedin: true }
})
