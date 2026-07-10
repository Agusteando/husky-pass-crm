import { defineEventHandler, getQuery, getRequestURL, getRouterParam, setHeader } from 'h3'
import { z } from 'zod'
import { publicError } from '~/server/utils/httpError'
import { isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'
import { buildDevPrintableAuthorizedPerson } from '~/server/utils/devHuskyPassFixtures'
import {
  buildMarbeteRenderValues,
  listMarbeteTemplates,
  readMarbeteTemplateSvg,
  renderMarbeteSvg,
  validateMarbeteRequirements
} from '~/server/utils/marbeteTemplates'
import { assertMarbetePdfAssets, renderMarbetePdf } from '~/server/utils/marbetePdf'
import { compileMarbeteVisualSvg, normalizeMarbeteVisualDesign } from '~/utils/marbeteDesigner'

const schema = z.object({
  variant: z.string().optional().default('primaria-pt'),
  scenario: z.string().optional().default('long-name'),
  format: z.enum(['svg-preview', 'pdf', 'diagnostics']).optional().default('svg-preview'),
  surface: z.enum(['card', 'print']).optional().default('print')
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) throw publicError(403, 'Solo superadmin puede previsualizar diseños.')
  const id = String(getRouterParam(event, 'id') || '')
  const template = (await listMarbeteTemplates()).find((item) => item.id === id)
  if (!template) throw publicError(404, 'Diseño de marbete no encontrado.')

  const query = schema.parse(getQuery(event))
  const origin = getRequestURL(event).origin
  const fixture = buildDevPrintableAuthorizedPerson({ origin, variantId: query.variant, scenarioId: query.scenario })
  const templateSvg = template.mode === 'visual' && query.surface === 'card'
    ? compileMarbeteVisualSvg(normalizeMarbeteVisualDesign(template.visualDesign, template.themeKey), { mode: 'card' })
    : await readMarbeteTemplateSvg(template)
  const renderedSvg = renderMarbeteSvg(templateSvg, fixture.data, origin, template.cicloEscolar)
  const values = buildMarbeteRenderValues(fixture.data, origin, template.cicloEscolar).values
  const readiness = validateMarbeteRequirements(templateSvg, fixture.data, origin, template.cicloEscolar)
  const pdfInput = { templateSvg, renderedSvg, values, origin }

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
    return { ok: readiness.ok && assetsOk, readiness, assetsOk, assetError, template, values }
  }

  if (query.format === 'svg-preview') {
    setHeader(event, 'Content-Type', 'image/svg+xml; charset=utf-8')
    setHeader(event, 'Cache-Control', 'private, no-store')
    setHeader(event, 'X-Husky-Marbete-Template', template.id)
    return renderedSvg
  }

  await assertMarbetePdfAssets(pdfInput)
  const pdf = await renderMarbetePdf(pdfInput)
  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(event, 'Cache-Control', 'private, no-store')
  setHeader(event, 'Content-Disposition', `inline; filename="vista-${template.id}.pdf"`)
  return pdf
})
