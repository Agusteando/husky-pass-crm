import { createError, defineEventHandler, setCookie } from 'h3'
import { getAppSession, setAppSession } from '~/server/utils/session'

export default defineEventHandler((event) => {
  const user = getAppSession(event).user
  const admin = user?.impersonation?.admin
  if (!user || !admin) {
    throw createError({ statusCode: 400, statusMessage: 'No hay una vista familiar activa' })
  }

  const redirectTo = safeAdminReturnTo(user.impersonation?.returnTo, admin.isSuperAdmin ? '/admin/superadmin' : '/admin/daycare/salas')

  setAppSession(event, admin)
  setCookie(event, 'user_segment', 'internal', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
  return { user: admin, loggedin: true, redirectTo }
})


function safeAdminReturnTo(value: string | null | undefined, fallback: string) {
  if (!value) return fallback
  if (!value.startsWith('/admin/')) return fallback
  if (value.startsWith('/admin/login')) return fallback
  if (/^\/admin\/daycare(\/|$)/.test(value) || /^\/admin\/superadmin(\?|$|\/)/.test(value)) return value
  return fallback
}
