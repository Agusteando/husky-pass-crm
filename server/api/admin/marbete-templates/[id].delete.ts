import { defineEventHandler, getRouterParam } from 'h3'
import { publicError } from '~/server/utils/httpError'
import { isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'
import { deleteMarbeteTemplate } from '~/server/utils/marbeteTemplates'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) throw publicError(403, 'Solo superadmin puede eliminar plantillas.')

  const id = String(getRouterParam(event, 'id') || '').trim()
  if (!id) throw publicError(400, 'Plantilla inválida.')
  return deleteMarbeteTemplate(id)
})
