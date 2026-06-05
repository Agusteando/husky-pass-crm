import { createError, defineEventHandler, getQuery, getRequestURL, setHeader } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { getCredentialAuthorizedPersona } from '~/server/data/mysqlDaycare'
import { buildMarbeteRenderValues, listMarbeteTemplates, marbeteDownloadName, readMarbeteTemplateSvg, renderMarbeteSvg, selectMarbeteTemplate, validateMarbeteRequirements } from '~/server/utils/marbeteTemplates'
import { assertMarbetePdfAssets, renderMarbetePdf } from '~/server/utils/marbetePdf'
import type { MarbeteReadinessResponse } from '~/types/daycare'

const schema = z.object({
  id: z.coerce.number().int().positive(),
  download: z.string().optional().default(''),
  format: z.enum(['', 'svg-preview', 'readiness']).optional().default('')
})

function firstIssue(issues: string[]) {
  return issues[0] || 'El marbete no tiene todos los datos requeridos.'
}

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
  const templateSvg = await readMarbeteTemplateSvg(template)
  const requirementStatus = validateMarbeteRequirements(templateSvg, data, origin)
  const renderValues = buildMarbeteRenderValues(data, origin)
  const svg = renderMarbeteSvg(templateSvg, data, origin)
  const pdfInput = { templateSvg, renderedSvg: svg, values: renderValues.values, origin }
  const downloadName = marbeteDownloadName(data, template)

  if (query.format === 'readiness') {
    const response: MarbeteReadinessResponse = {
      ok: requirementStatus.ok,
      issues: requirementStatus.issues,
      template,
      themeKey: template.themeKey,
      downloadName
    }

    if (requirementStatus.ok) {
      try {
        await assertMarbetePdfAssets(pdfInput)
      } catch (error) {
        const failure = error as { statusMessage?: string; message?: string; data?: { statusMessage?: string } }
        response.ok = false
        response.issues = [failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible cargar una imagen requerida para generar el marbete.']
      }
    }

    setHeader(event, 'Cache-Control', 'private, no-store')
    return response
  }

  if (!requirementStatus.ok) {
    throw createError({ statusCode: 422, statusMessage: firstIssue(requirementStatus.issues) })
  }

  if (query.format === 'svg-preview' && query.download !== '1') {
    setHeader(event, 'Content-Type', 'image/svg+xml; charset=utf-8')
    setHeader(event, 'Cache-Control', 'private, no-store')
    setHeader(event, 'X-Husky-Marbete-Template', template.id)
    setHeader(event, 'X-Husky-Marbete-Theme', template.themeKey)
    return svg
  }

  await assertMarbetePdfAssets(pdfInput)
  const pdf = await renderMarbetePdf(pdfInput)

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
