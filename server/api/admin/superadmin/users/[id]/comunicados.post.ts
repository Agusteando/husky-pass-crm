import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { publicError } from '~/server/utils/httpError'
import { isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'
import { setCommunicationScopesForUser } from '~/server/data/communications'

const scopeSchema = z.object({
  isGlobal: z.boolean().optional().default(false),
  plantel: z.string().nullable().optional().default(null),
  nivel: z.string().nullable().optional().default(null),
  grado: z.string().nullable().optional().default(null),
  grupo: z.string().nullable().optional().default(null),
  canCreate: z.boolean().optional().default(true),
  canPublish: z.boolean().optional().default(false)
})

const schema = z.object({
  enabled: z.boolean().default(false),
  scopes: z.array(scopeSchema).max(40).default([])
})

export default defineEventHandler(async (event) => {
  const actor = requireSession(event, 'admin')
  if (!isSuperAdmin(actor)) {
    throw publicError(403, 'Solo superadmin puede asignar permisos de Comunicados.')
  }

  const id = Number(event.context.params?.id)
  if (!Number.isFinite(id) || id <= 0) throw publicError(400, 'Usuario inválido.')

  const body = schema.parse(await readBody(event))
  return setCommunicationScopesForUser(actor, id, body.enabled, body.scopes)
})
