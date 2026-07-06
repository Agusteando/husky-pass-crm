import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { isSuperAdmin } from '~/server/utils/authz'
import { publicError } from '~/server/utils/httpError'
import { setSuperAdminRoleAssignmentsForUser } from '~/server/data/mysqlAuth'
import { parseOrBadRequest } from '~/server/utils/validation'
import { logEvent, shortHash } from '~/server/utils/logger'

const idSchema = z.coerce.number().int().positive()
const schema = z.object({
  roles: z.object({
    daycareAdmin: z.boolean().optional().default(false),
    gestionEscolarAdmin: z.boolean().optional().default(false),
    communicationsAdmin: z.boolean().optional().default(false),
    accessHistoryAdmin: z.boolean().optional().default(false)
  }),
  unidades: z.array(z.string().trim().min(1)).max(30).optional().default([]),
  reason: z.string().trim().min(12).max(500)
})

export default defineEventHandler(async (event) => {
  const actor = requireSession(event, 'admin')
  if (!isSuperAdmin(actor)) throw publicError(403, 'Solo superadmin puede asignar roles administrativos.')

  const userId = parseOrBadRequest(idSchema, getRouterParam(event, 'id'), 'Selecciona un usuario valido.')
  const body = parseOrBadRequest(schema, await readBody(event), 'Revisa los roles, el alcance y el motivo antes de guardar.')
  const updated = await setSuperAdminRoleAssignmentsForUser(actor, userId, body)
  logEvent('info', 'superadmin.roles.updated', {
    actorId: actor.id,
    targetUserId: userId,
    enabledRoles: Object.entries(body.roles).filter(([, enabled]) => enabled).map(([role]) => role),
    unitCount: body.unidades.length,
    reasonHash: shortHash(body.reason),
    reasonLength: body.reason.length
  }, event)
  return updated
})
