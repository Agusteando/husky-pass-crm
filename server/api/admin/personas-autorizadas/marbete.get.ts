import { createError, defineEventHandler, getQuery, getRequestURL, setHeader } from 'h3'
import { z } from 'zod'
import { isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'
import { getSuperAdminPrintableAuthorizedPersona } from '~/server/data/mysqlPersonasAdmin'
import { DEV_HUSKY_PASS_VARIANTS, buildDevPrintableAuthorizedPerson } from '~/server/utils/devHuskyPassFixtures'
import {
  buildMarbeteRenderValues,
  listMarbeteTemplates,
  marbeteDownloadName,
  readMarbeteTemplateSvg,
  renderMarbeteSvg,
  selectMarbeteTemplate,
  validateMarbeteRequirements
} from '~/server/utils/marbeteTemplates'
import { assertMarbetePdfAssets, renderMarbetePdf } from '~/server/utils/marbetePdf'

const schema = z.object({
  id: z.coerce.number().int().positive(),
  download: z.string().optional().default(''),
  scenario: z.string().optional().default('default'),
  format: z.enum(['pdf', 'svg-preview', 'readiness', 'diagnostics']).optional().default('pdf')
})

function firstIssue(issues: string[]) {
  return issues[0] || 'Completa los datos solicitados para generar el Husky Pass.'
}

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) throw createError({ statusCode: 403, statusMessage: 'Solo superadmin puede generar Husky Pass.' })

  const query = schema.parse(getQuery(event))
  const origin = getRequestURL(event).origin
  const fixtureIndex = query.id - 9000
  const data = process.env.NODE_ENV !== 'production' && fixtureIndex >= 0 && fixtureIndex < DEV_HUSKY_PASS_VARIANTS.length
    ? buildDevPrintableAuthorizedPerson({ origin, variantId: DEV_HUSKY_PASS_VARIANTS[fixtureIndex].id, scenarioId: query.scenario }).data
    : await getSuperAdminPrintableAuthorizedPersona(query.id)
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Persona autorizada no encontrada.' })

  const templates = await listMarbeteTemplates()
  const template = selectMarbeteTemplate(templates, {
    matricula: data.matricula,
    plantel: data.plantel,
    nivelEdu: data.nivelEdu
  })
  if (!template) throw createError({ statusCode: 503, statusMessage: 'El Husky Pass no esta disponible para este alumno.' })

  const templateSvg = await readMarbeteTemplateSvg(template)
  const renderedSvg = renderMarbeteSvg(templateSvg, data, origin)
  const renderValues = buildMarbeteRenderValues(data, origin)
  const pdfInput = { templateSvg, renderedSvg, values: renderValues.values, origin }
  const readiness = validateMarbeteRequirements(templateSvg, data, origin)
  const downloadName = marbeteDownloadName(data, template)

  if (query.format === 'readiness') {
    const response = {
      ok: readiness.ok,
      issues: readiness.issues,
      template,
      themeKey: template.themeKey,
      downloadName
    }
    if (readiness.ok) await assertMarbetePdfAssets(pdfInput)
    setHeader(event, 'Cache-Control', 'private, no-store')
    return response
  }

  if (query.format === 'diagnostics') {
    let assetsOk = false
    let assetError: unknown = null
    try {
      await assertMarbetePdfAssets(pdfInput)
      assetsOk = true
    } catch (error) {
      assetError = error
    }
    setHeader(event, 'Cache-Control', 'private, no-store')
    return {
      ok: readiness.ok && assetsOk,
      readiness,
      assetsOk,
      assetError,
      template,
      values: renderValues.values,
      downloadName
    }
  }

  if (!readiness.ok) {
    throw createError({ statusCode: 422, statusMessage: firstIssue(readiness.issues) })
  }

  if (query.format === 'svg-preview') {
    setHeader(event, 'Content-Type', 'image/svg+xml; charset=utf-8')
    setHeader(event, 'Cache-Control', 'private, no-store')
    setHeader(event, 'X-Husky-Marbete-Template', template.id)
    setHeader(event, 'X-Husky-Marbete-Theme', template.themeKey)
    return renderedSvg
  }

  await assertMarbetePdfAssets(pdfInput)
  const pdf = await renderMarbetePdf(pdfInput)
  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(event, 'Cache-Control', 'private, no-store')
  setHeader(event, 'X-Husky-Marbete-Template', template.id)
  setHeader(event, 'X-Husky-Marbete-Theme', template.themeKey)
  setHeader(event, 'Content-Disposition', `${query.download === '1' ? 'attachment' : 'inline'}; filename="${downloadName}"`)
  return pdf
})
