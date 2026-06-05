import { createError, defineEventHandler, getQuery, getRequestURL, setHeader } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { getCredentialAuthorizedPersona } from '~/server/data/mysqlDaycare'
import { listMarbeteTemplates, marbeteDownloadName, readMarbeteTemplateSvg, renderMarbeteSvg, selectMarbeteTemplate } from '~/server/utils/marbeteTemplates'
import { renderMarbetePdf } from '~/server/utils/marbetePdf'

const schema = z.object({
  id: z.coerce.number().int().positive(),
  download: z.string().optional().default(''),
  format: z.string().optional().default('')
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  const query = schema.parse(getQuery(event))
  const data = await getCredentialAuthorizedPersona(user, query.id)
  const templates = await listMarbeteTemplates()
  if (!templates.length) throw createError({ statusCode: 503, statusMessage: 'No hay plantillas de marbete configuradas.' })

  const template = selectMarbeteTemplate(templates, { matricula: data.matricula, plantel: data.plantel, nivelEdu: data.nivelEdu })
  if (!template) throw createError({ statusCode: 503, statusMessage: 'No hay plantilla compatible para este alumno.' })

  const origin = getRequestURL(event).origin
  const svg = renderMarbeteSvg(await readMarbeteTemplateSvg(template), data, origin)
  const downloadName = marbeteDownloadName(data, template)
  if (query.format === 'svg-preview' && query.download !== '1') {
    setHeader(event, 'Content-Type', 'image/svg+xml; charset=utf-8')
    setHeader(event, 'Cache-Control', 'private, no-store')
    setHeader(event, 'X-Husky-Marbete-Template', template.id)
    setHeader(event, 'X-Husky-Marbete-Theme', template.themeKey)
    return svg
  }

  const pdf = await renderMarbetePdf(svg)

  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(event, 'Cache-Control', 'private, no-store')
  setHeader(event, 'X-Husky-Marbete-Template', template.id)
  setHeader(event, 'X-Husky-Marbete-Theme', template.themeKey)
  if (query.download === '1') {
    setHeader(event, 'Content-Disposition', `attachment; filename="${downloadName}"`)
  } else {
    setHeader(event, 'Content-Disposition', `inline; filename="${downloadName}"`)
  }

  return pdf
})
