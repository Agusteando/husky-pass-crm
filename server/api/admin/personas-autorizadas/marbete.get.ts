import { defineEventHandler, getQuery, getRequestURL, setHeader } from 'h3'
import { publicError } from '~/server/utils/httpError'
import { z } from 'zod'
import { isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'
import { getSuperAdminPrintableAuthorizedPersona } from '~/server/data/mysqlPersonasAdmin'
import { DEV_HUSKY_PASS_VARIANTS, buildDevPrintableAuthorizedPerson } from '~/server/utils/devHuskyPassFixtures'
import {
  buildMarbeteRenderValues,
  marbeteDownloadName,
  renderMarbeteSvg,
  resolveAuthorizedPersonMarbeteTemplateSvg,
  validateMarbeteRequirements
} from '~/server/utils/marbeteTemplates'
import { assertMarbetePdfAssets, renderMarbetePdf } from '~/server/utils/marbetePdf'

const schema = z.object({
  id: z.coerce.number().int().positive(),
  download: z.string().optional().default(''),
  scenario: z.string().optional().default('default'),
  format: z.enum(['pdf', 'svg-preview', 'readiness', 'diagnostics']).optional().default('pdf')
})


export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) throw publicError(403, 'Solo superadmin puede generar Husky Pass.')

  const query = schema.parse(getQuery(event))
  const origin = getRequestURL(event).origin
  const fixtureIndex = query.id - 9000
  const data = process.env.NODE_ENV !== 'production' && fixtureIndex >= 0 && fixtureIndex < DEV_HUSKY_PASS_VARIANTS.length
    ? buildDevPrintableAuthorizedPerson({ origin, variantId: DEV_HUSKY_PASS_VARIANTS[fixtureIndex].id, scenarioId: query.scenario }).data
    : await getSuperAdminPrintableAuthorizedPersona(query.id)
  if (!data) throw publicError(404, 'Persona autorizada no encontrada.')

  const { template, templateSvg } = await resolveAuthorizedPersonMarbeteTemplateSvg({
    matricula: data.matricula,
    plantel: data.plantel,
    nivelEdu: data.nivelEdu,
    cicloEscolar: data.cicloEscolar
  })
  const renderedSvg = renderMarbeteSvg(templateSvg, data, origin, template.cicloEscolar)
  const renderValues = buildMarbeteRenderValues(data, origin, template.cicloEscolar)
  const pdfInput = { templateSvg, renderedSvg, values: renderValues.values, origin, tolerateAssetFailures: true }
  const readiness = validateMarbeteRequirements(templateSvg, data, origin, template.cicloEscolar)
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


  if (query.format === 'svg-preview') {
    setHeader(event, 'Content-Type', 'image/svg+xml; charset=utf-8')
    setHeader(event, 'Cache-Control', 'private, no-store')
    setHeader(event, 'X-Husky-Marbete-Template', template.id)
    setHeader(event, 'X-Husky-Marbete-Theme', template.themeKey)
    setHeader(event, 'X-Husky-Marbete-Source', template.source || 'bundled-svg')
    return renderedSvg
  }

  const pdf = await renderMarbetePdf(pdfInput)
  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(event, 'Cache-Control', 'private, no-store')
  setHeader(event, 'X-Husky-Marbete-Template', template.id)
  setHeader(event, 'X-Husky-Marbete-Theme', template.themeKey)
  setHeader(event, 'X-Husky-Marbete-Source', template.source || 'bundled-svg')
  setHeader(event, 'Content-Disposition', `${query.download === '1' ? 'attachment' : 'inline'}; filename="${downloadName}"`)
  return pdf
})
