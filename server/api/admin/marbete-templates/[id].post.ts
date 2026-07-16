import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { z } from 'zod'
import { publicError } from '~/server/utils/httpError'
import { isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'
import { applyMarbeteTemplateAction } from '~/server/utils/marbeteTemplates'

const schema = z.object({
  action: z.enum(['publish', 'unpublish'])
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) throw publicError(403, 'Solo superadmin puede administrar marbetes.')
  const id = String(getRouterParam(event, 'id') || '').trim()
  if (!id) throw publicError(400, 'Diseño de marbete inválido.')
  const body = schema.parse(await readBody(event))
  return applyMarbeteTemplateAction({ id, action: body.action })
})
