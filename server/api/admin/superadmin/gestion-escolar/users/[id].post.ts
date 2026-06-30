import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { isSuperAdmin } from '~/server/utils/authz'
import { publicError } from '~/server/utils/httpError'
import { GESTION_ESCOLAR_CAPABILITIES, setGestionPermissionsForUser } from '~/server/data/gestionEscolar'
import { withRequestBoundary } from '~/server/utils/logger'
import { parseOrBadRequest } from '~/server/utils/validation'

const idSchema = z.coerce.number().int().positive()
const permissionSchema = z.object({
  capability: z.enum(GESTION_ESCOLAR_CAPABILITIES as [typeof GESTION_ESCOLAR_CAPABILITIES[number], ...typeof GESTION_ESCOLAR_CAPABILITIES]),
  enabled: z.boolean().optional().default(true),
  isGlobal: z.boolean().optional().default(false),
  plantel: z.string().trim().nullable().optional(),
  nivel: z.string().trim().nullable().optional(),
  grado: z.string().trim().nullable().optional(),
  grupo: z.string().trim().nullable().optional()
})

const schema = z.object({
  enabled: z.boolean().optional().default(true),
  permissions: z.array(permissionSchema).optional().default([])
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) throw publicError(403, 'Solo superadmin puede asignar Gestion Escolar.')
  const id = parseOrBadRequest(idSchema, getRouterParam(event, 'id'), 'Selecciona un usuario interno valido.')
  const body = parseOrBadRequest(schema, await readBody(event), 'Revisa las capacidades y alcances antes de guardar.')
  return withRequestBoundary(event, 'superadmin.gestion-escolar.save', () => setGestionPermissionsForUser(user, id, body.enabled, body.permissions), { userId: user.id, targetUserId: id })
})
