import { defineEventHandler, getQuery, getRequestURL, setHeader } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { getCredentialAuthorizedPersona } from '~/server/data/mysqlDaycare'
import { buildMarbeteRenderValues, listMarbeteTemplates, marbeteDownloadName, readMarbeteTemplateSvg, renderMarbeteSvg, selectMarbeteTemplate, validateMarbeteRequirements } from '~/server/utils/marbeteTemplates'
import { assertMarbetePdfAssets, renderMarbetePdf } from '~/server/utils/marbetePdf'
import { publicError } from '~/server/utils/httpError'
import { withRequestBoundary } from '~/server/utils/logger'
import type { MarbeteReadinessResponse } from '~/types/daycare'

const schema = z.object({
  id: z.coerce.number().int().positive(),
  download: z.string().optional().default(''),
  format: z.enum(['', 'svg-preview', 'readiness']).optional().default('')
})

function firstIssue(issues: string[]) {
  return issues[0] || 'Completa los datos solicitados para descargar el Husky Pass.'
}

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  return withRequestBoundary(event, 'personas-autorizadas.marbete.load', async () => {
  const query = schema.parse(getQuery(event))
  const data = await getCredentialAuthorizedPersona(user, query.id)
  const templates = await listMarbeteTemplates()
  if (!templates.length) throw publicError(503, 'El Husky Pass no está disponible en este momento. Solicita apoyo a la escuela.')

  const template = selectMarbeteTemplate(templates, { matricula: data.matricula, plantel: data.plantel, nivelEdu: data.nivelEdu, cicloEscolar: data.cicloEscolar })
  if (!template) throw publicError(503, 'El Husky Pass no está disponible para este alumno. Solicita apoyo a la escuela.')

  const origin = getRequestURL(event).origin
  const templateSvg = await readMarbeteTemplateSvg(template)
  const requirementStatus = validateMarbeteRequirements(templateSvg, data, origin, template.cicloEscolar)
  const renderValues = buildMarbeteRenderValues(data, origin, template.cicloEscolar)
  const svg = renderMarbeteSvg(templateSvg, data, origin, template.cicloEscolar)
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
        response.issues = [failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'Actualiza la foto para descargar el Husky Pass o solicita apoyo a la escuela.']
      }
    }

    setHeader(event, 'Cache-Control', 'private, no-store')
    return response
  }

  if (!requirementStatus.ok) {
    throw publicError(422, firstIssue(requirementStatus.issues))
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
  }, { userId: user.id })
})
