import { defineEventHandler, getQuery, getRequestURL, setHeader } from 'h3'
import { publicError } from '~/server/utils/httpError'
import { z } from 'zod'
import { assertDevOnly } from '~/server/utils/devOnly'
import { assertMarbetePdfAssets, renderMarbetePdf } from '~/server/utils/marbetePdf'
import {
  buildDevPrintableAuthorizedPerson,
  selectDevHuskyPassTemplate
} from '~/server/utils/devHuskyPassFixtures'
import {
  buildMarbeteRenderValues,
  marbeteDownloadName,
  readMarbeteTemplateSvg,
  renderMarbeteSvg,
  validateMarbeteRequirements,
  listMarbeteTemplates
} from '~/server/utils/marbeteTemplates'

const schema = z.object({
  variant: z.string().optional().default('guarderia-cm'),
  scenario: z.string().optional().default('default'),
  format: z.enum(['pdf', 'svg-preview', 'readiness', 'diagnostics']).optional().default('pdf'),
  download: z.string().optional().default('')
})

export default defineEventHandler(async (event) => {
  assertDevOnly()
  const query = schema.parse(getQuery(event))
  const origin = getRequestURL(event).origin
  const fixture = buildDevPrintableAuthorizedPerson({
    origin,
    variantId: query.variant,
    scenarioId: query.scenario
  })
  const templates = await listMarbeteTemplates()
  const template = selectDevHuskyPassTemplate(templates, fixture.variant)
  if (!template) throw publicError(503, 'Plantilla de Husky Pass no disponible.')

  const templateSvg = await readMarbeteTemplateSvg(template)
  const renderValues = buildMarbeteRenderValues(fixture.data, origin, template.cicloEscolar)
  const renderedSvg = renderMarbeteSvg(templateSvg, fixture.data, origin, template.cicloEscolar)
  const pdfInput = { templateSvg, renderedSvg, values: renderValues.values, origin }
  const readiness = validateMarbeteRequirements(templateSvg, fixture.data, origin, template.cicloEscolar)
  const downloadName = marbeteDownloadName(fixture.data, template)
  const selectedExpectedTemplate = template.id === fixture.variant.expectedTemplateId

  if (query.format === 'readiness') {
    if (readiness.ok) await assertMarbetePdfAssets(pdfInput)
    setHeader(event, 'Cache-Control', 'no-store')
    return {
      ...readiness,
      template,
      themeKey: template.themeKey,
      downloadName,
      variant: fixture.variant,
      scenario: fixture.scenario,
      selectedExpectedTemplate
    }
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
    setHeader(event, 'Cache-Control', 'no-store')
    return {
      ok: readiness.ok && assetsOk && selectedExpectedTemplate,
      readiness,
      assetsOk,
      assetError,
      template,
      expectedTemplateId: fixture.variant.expectedTemplateId,
      selectedExpectedTemplate,
      variant: fixture.variant,
      scenario: fixture.scenario,
      values: renderValues.values,
      downloadName
    }
  }

  if (query.format === 'svg-preview') {
    setHeader(event, 'Content-Type', 'image/svg+xml; charset=utf-8')
    setHeader(event, 'Cache-Control', 'no-store')
    setHeader(event, 'X-Husky-Marbete-Template', template.id)
    setHeader(event, 'X-Husky-Marbete-Theme', template.themeKey)
    setHeader(event, 'X-Husky-Marbete-Expected-Template', String(selectedExpectedTemplate))
    return renderedSvg
  }

  await assertMarbetePdfAssets(pdfInput)
  const pdf = await renderMarbetePdf(pdfInput)
  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(event, 'Cache-Control', 'no-store')
  setHeader(event, 'X-Husky-Marbete-Template', template.id)
  setHeader(event, 'X-Husky-Marbete-Theme', template.themeKey)
  setHeader(event, 'X-Husky-Marbete-Expected-Template', String(selectedExpectedTemplate))
  setHeader(event, 'Content-Disposition', `${query.download === '1' ? 'attachment' : 'inline'}; filename="${downloadName}"`)
  return pdf
})
