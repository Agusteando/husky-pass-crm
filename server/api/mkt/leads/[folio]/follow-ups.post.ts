import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { z } from 'zod'
import { addMktFollowUp } from '~/server/data/marketing'
import { assertMarketingAdmin } from '~/server/utils/authz'
import { publicError } from '~/server/utils/httpError'
import { withRequestBoundary } from '~/server/utils/logger'
import { requireSession } from '~/server/utils/session'
import { parseOrBadRequest } from '~/server/utils/validation'

const schema = z.object({
  note: z.string().trim().min(2).max(6000),
  stage: z.enum(['Leads Entrantes', 'Primer contacto', 'Discusión', 'Negociación', 'Inscrito'])
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertMarketingAdmin(user)
  const folio = String(getRouterParam(event, 'folio') || '').trim().toUpperCase()
  if (!/^[A-Z0-9-]{3,50}$/.test(folio)) throw publicError(400, 'El folio no es válido.')
  const body = parseOrBadRequest(schema, await readBody(event), 'Escribe el seguimiento y selecciona la etapa.')
  return withRequestBoundary(event, 'mkt.follow-ups.create', () => addMktFollowUp(folio, body.note, body.stage), { userId: user.id, matricula: folio, stage: body.stage })
})
