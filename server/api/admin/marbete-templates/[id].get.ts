import { defineEventHandler, getQuery, getRouterParam, setHeader } from 'h3'
import { publicError } from '~/server/utils/httpError'
import { isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'
import { listMarbeteTemplates, readMarbeteBaseSvg, readMarbeteTemplateSvg } from '~/server/utils/marbeteTemplates'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) throw publicError(403, 'Solo superadmin puede ver plantillas.')

  const id = String(getRouterParam(event, 'id') || '')
  const template = (await listMarbeteTemplates()).find((item) => item.id === id)
  if (!template) throw publicError(404, 'Plantilla no encontrada.')

  const query = getQuery(event)
  setHeader(event, 'Content-Type', 'image/svg+xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'private, no-store')
  return query.base === '1' ? readMarbeteBaseSvg(template) : readMarbeteTemplateSvg(template)
})
