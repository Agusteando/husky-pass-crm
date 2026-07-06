import { setCookie, deleteCookie, getCookie } from 'h3'
import { useRuntimeConfig } from 'nitropack/runtime'
import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import type { AppSessionUser, PublicSession } from '~/types/session'
import { effectiveAdminUser } from '~/utils/sessionScopes'
import { publicError } from '~/server/utils/httpError'

const cookieName = 'hpc_session'

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString('base64url')
}

function sign(payload: string) {
  const secret = useRuntimeConfig().sessionSecret
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function verify(payload: string, signature: string) {
  const expected = sign(payload)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function setAppSession(event: H3Event, user: AppSessionUser) {
  const payload = base64url(JSON.stringify({ user, createdAt: Date.now() }))
  const signature = sign(payload)
  setCookie(event, cookieName, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  })
}

export function clearAppSession(event: H3Event) {
  deleteCookie(event, cookieName, { path: '/' })
}

export function getAppSession(event: H3Event): PublicSession {
  const raw = getCookie(event, cookieName)
  if (!raw) return { user: null, loggedin: false }
  const [payload, signature] = raw.split('.')
  if (!payload || !signature || !verify(payload, signature)) return { user: null, loggedin: false }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { user?: AppSessionUser }
    if (!decoded.user?.id || !decoded.user.kind) return { user: null, loggedin: false }
    return { user: decoded.user, loggedin: true }
  } catch {
    return { user: null, loggedin: false }
  }
}


export function requireSession(event: H3Event, kind?: 'family' | 'admin') {
  const session = getAppSession(event)
  if (!session.user) {
    throw publicError(401, 'Sesión no válida')
  }

  if (kind === 'admin') {
    const admin = effectiveAdminUser(session.user)
    if (!admin) throw publicError(401, 'Sesión no válida')
    return admin
  }

  if (kind === 'family' && session.user.kind !== 'family') {
    throw publicError(401, 'Sesión no válida')
  }

  return session.user
}
