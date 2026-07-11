import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertSchoolAdmin } from '~/server/utils/authz'
import { saveGestionScopedContent } from '~/server/data/gestionEscolar'
import { withRequestBoundary } from '~/server/utils/logger'
import { parseOrBadRequest } from '~/server/utils/validation'

const schema = z.object({
  id: z.string().trim().optional(),
  kind: z.enum(['encuesta', 'convenio']),
  title: z.string().trim().min(1),
  summary: z.string().trim().optional().default(''),
  url: z.string().trim().min(1),
  embedUrl: z.string().trim().nullable().optional(),
  status: z.enum(['draft', 'active', 'inactive', 'scheduled']).optional().default('draft'),
  isGlobal: z.boolean().optional().default(false),
  plantel: z.string().trim().nullable().optional(),
  nivel: z.string().trim().nullable().optional(),
  grado: z.string().trim().nullable().optional(),
  grupo: z.string().trim().nullable().optional(),
  activeFrom: z.string().trim().nullable().optional(),
  activeUntil: z.string().trim().nullable().optional()
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertSchoolAdmin(user)
  const body = parseOrBadRequest(schema, await readBody(event), 'Revisa el enlace, el estado y el plantel.')
  return withRequestBoundary(event, 'gestion-escolar.scoped-content.save', () => saveGestionScopedContent(user, body), { userId: user.id, kind: body.kind })
})
