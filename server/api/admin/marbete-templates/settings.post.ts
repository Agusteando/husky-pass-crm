import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { publicError } from '~/server/utils/httpError'
import { isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'
import { saveMarbeteTemplateSettings } from '~/server/utils/marbeteSettings'

const schema = z.object({
  customTemplatesEnabled: z.boolean()
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) throw publicError(403, 'Solo superadmin puede configurar los marbetes.')
  const body = schema.parse(await readBody(event))
  return saveMarbeteTemplateSettings({
    customTemplatesEnabled: body.customTemplatesEnabled,
    updatedBy: user.email || user.username || String(user.id)
  })
})
