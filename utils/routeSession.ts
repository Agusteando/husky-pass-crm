import { clearNuxtData, useRequestEvent, useRuntimeConfig, useState } from 'nuxt/app'
import type { AppSessionUser, PublicSession } from '~/types/session'

export const anonymousSession: PublicSession = { user: null, loggedin: false }
const sessionCookieName = 'hpc_session'
const sessionStateKey = 'app-session-cache'
const accountStateEpochKey = 'account-state-epoch'

const accountScopedStateDefaults = {
  'pa-family-people:data': () => [],
  'pa-family-people:loaded': () => false,
  'pa-family-people:pending': () => false,
  'pa-family-people:error': () => '',
  'pa-family-people:owner': () => null
} as const

export function useRouteSessionCache() {
  return useState<PublicSession | null>(sessionStateKey, () => null)
}

export function useAccountStateEpoch() {
  return useState<number>(accountStateEpochKey, () => 0)
}

export function sessionAccountIdentity(session: PublicSession | null | undefined) {
  const user = session?.user
  if (!user) return 'anonymous'

  const daycare = user.scopes.daycare
  const personas = user.scopes.personasAutorizadas
  const routes = user.routes
    .map((permission) => `${permission.route}:${permission.icono || ''}`)
    .sort()
    .join(',')

  return [
    user.kind,
    user.id,
    user.username || '',
    user.isSuperAdmin ? 'superadmin' : '',
    user.roles.slice().sort().join(','),
    user.productScopes.slice().sort().join(','),
    user.unidades.slice().sort().join(','),
    user.plantel.slice().sort().join(','),
    routes,
    daycare?.unidad || '',
    daycare?.sala || '',
    personas?.legacyRoute || '',
    user.impersonation?.mode || '',
    user.impersonation?.admin.id || ''
  ].join('|')
}

function clearAccountScopedClientState() {
  if (!import.meta.client) return

  useAccountStateEpoch().value += 1
  useState<unknown[]>('pa-family-people:data', accountScopedStateDefaults['pa-family-people:data']).value = []
  useState<boolean>('pa-family-people:loaded', accountScopedStateDefaults['pa-family-people:loaded']).value = false
  useState<boolean>('pa-family-people:pending', accountScopedStateDefaults['pa-family-people:pending']).value = false
  useState<string>('pa-family-people:error', accountScopedStateDefaults['pa-family-people:error']).value = ''
  useState<string | null>('pa-family-people:owner', accountScopedStateDefaults['pa-family-people:owner']).value = null
  clearNuxtData()
}

export function setCachedRouteSession(session: PublicSession | null) {
  const cache = useRouteSessionCache()
  if (sessionAccountIdentity(cache.value) !== sessionAccountIdentity(session)) {
    clearAccountScopedClientState()
  }
  cache.value = session
}

function readCookieValue(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) return null
  const cookies = cookieHeader.split(';')
  for (const cookie of cookies) {
    const separator = cookie.indexOf('=')
    if (separator < 0) continue
    const key = cookie.slice(0, separator).trim()
    if (key === name) return decodeURIComponent(cookie.slice(separator + 1).trim())
  }
  return null
}

async function signSessionPayload(payload: string, secret: string) {
  const encoder = new TextEncoder()
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await globalThis.crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return Buffer.from(signature).toString('base64url')
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false
  let mismatch = 0
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return mismatch === 0
}

async function getServerRouteSession(): Promise<PublicSession> {
  const event = useRequestEvent()
  const raw = readCookieValue(event?.node.req.headers.cookie, sessionCookieName)
  if (!raw) return anonymousSession

  const [payload, signature] = raw.split('.')
  if (!payload || !signature) return anonymousSession

  const secret = useRuntimeConfig().sessionSecret
  const expected = await signSessionPayload(payload, secret)
  if (!constantTimeEqual(signature, expected)) {
    return anonymousSession
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { user?: AppSessionUser }
    if (!decoded.user?.id || !decoded.user.kind) return anonymousSession
    return { user: decoded.user, loggedin: true }
  } catch {
    return anonymousSession
  }
}

export async function getRouteSession(): Promise<PublicSession> {
  if (import.meta.server) {
    return getServerRouteSession()
  }

  const cached = useRouteSessionCache()
  if (cached.value) return cached.value

  try {
    const session = await $fetch<PublicSession>('/api/auth/me')
    cached.value = session
    return session
  } catch {
    cached.value = anonymousSession
    return anonymousSession
  }
}
