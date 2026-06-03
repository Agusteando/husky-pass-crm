import { createError, defineEventHandler, readBody, setCookie } from 'h3'
import { z } from 'zod'
import type { AppSessionUser } from '~/types/session'
import { getSalaById } from '~/server/data/mysqlDaycare'
import { assertDaycareAdmin } from '~/server/utils/authz'
import { getAppSession, setAppSession } from '~/server/utils/session'
import { adminOrigin } from '~/server/utils/impersonation'

const schema = z.object({ sala: z.coerce.number().int().positive(), returnTo: z.string().optional() })

export default defineEventHandler(async (event) => {
  const admin = getAppSession(event).user
  if (!admin) throw createError({ statusCode: 401, statusMessage: 'Sesión no válida' })
  assertDaycareAdmin(admin)
  const body = schema.parse(await readBody(event))
  const sala = await getSalaById(admin, body.sala)
  const returnTo = safeAdminReturnTo(body.returnTo, `/admin/daycare/salas/${sala.id}`)
  const familyPreview: AppSessionUser = {
    id: admin.id,
    kind: 'family',
    email: admin.email,
    username: admin.username,
    displayName: `Vista familiar · ${sala.sala}`,
    picture: admin.picture,
    campus: admin.campus,
    empresa: admin.empresa,
    sala: String(sala.id),
    roles: ['ROLE_HUSKY_USER'],
    unidades: [sala.unidad],
    plantel: admin.plantel,
    routes: [],
    productScopes: ['daycare'],
    scopes: {
      daycare: {
        product: 'daycare',
        unidad: sala.unidad,
        sala: String(sala.id)
      }
    },
    impersonation: {
      startedAt: Date.now(),
      mode: 'daycarePreview',
      admin: adminOrigin(admin),
      returnTo
    },
    anonymous: false,
    loggedin: true
  }

  setAppSession(event, familyPreview)
  setCookie(event, 'user_segment', 'daycare', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })

  return { user: familyPreview, loggedin: true }
})


function safeAdminReturnTo(value: string | undefined, fallback: string) {
  if (!value) return fallback
  if (!value.startsWith('/admin/')) return fallback
  if (value.startsWith('/admin/login')) return fallback
  if (/^\/admin\/daycare(\/|$)/.test(value) || /^\/admin\/superadmin(\?|$|\/)/.test(value)) return value
  return fallback
}
