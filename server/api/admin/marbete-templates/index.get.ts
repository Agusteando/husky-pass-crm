import { defineEventHandler } from 'h3'
import { publicError } from '~/server/utils/httpError'
import { isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'
import { listMarbeteTemplates, marbeteTemplateThemes } from '~/server/utils/marbeteTemplates'
import { readMarbeteTemplateSettings } from '~/server/utils/marbeteSettings'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) throw publicError(403, 'Solo superadmin puede gestionar plantillas.')

  const [templates, settings] = await Promise.all([
    listMarbeteTemplates(),
    readMarbeteTemplateSettings()
  ])

  return {
    templates,
    themes: marbeteTemplateThemes(),
    settings
  }
})
