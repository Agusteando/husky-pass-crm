import { createError, defineEventHandler, getRouterParam, setHeader } from 'h3'
import { isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'
import { listMarbeteTemplates, readMarbeteTemplateSvg } from '~/server/utils/marbeteTemplates'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) throw createError({ statusCode: 403, statusMessage: 'Solo superadmin puede ver plantillas.' })

  const id = String(getRouterParam(event, 'id') || '')
  const template = (await listMarbeteTemplates()).find((item) => item.id === id)
  if (!template) throw createError({ statusCode: 404, statusMessage: 'Plantilla no encontrada.' })

  setHeader(event, 'Content-Type', 'image/svg+xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'private, no-store')
  return readMarbeteTemplateSvg(template)
})
