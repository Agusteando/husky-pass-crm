import { defineEventHandler, getQuery, getRequestURL, setHeader } from 'h3'
import { z } from 'zod'
import { assertDevOnly } from '~/server/utils/devOnly'
import { buildDevPrintableAuthorizedPerson } from '~/server/utils/devHuskyPassFixtures'
import { buildMarbeteRenderValues, renderMarbeteSvg, validateMarbeteRequirements } from '~/server/utils/marbeteTemplates'
import { assertMarbetePdfAssets, renderMarbetePdf } from '~/server/utils/marbetePdf'
import { compileMarbeteVisualSvg, createDefaultMarbeteVisualDesign } from '~/utils/marbeteDesigner'

const schema = z.object({
  theme: z.enum(['daycare', 'preescolar', 'primaria', 'secundaria', 'iedis']).optional().default('primaria'),
  variant: z.string().optional().default('primaria-pt'),
  scenario: z.string().optional().default('long-name'),
  ciclo: z.string().optional().default('2026-2027'),
  preset: z.enum(['default', 'rotated', 'wide-crop', 'minimal']).optional().default('default'),
  format: z.enum(['svg-preview', 'pdf', 'diagnostics']).optional().default('svg-preview')
})

export default defineEventHandler(async (event) => {
  assertDevOnly()
  const query = schema.parse(getQuery(event))
  const origin = getRequestURL(event).origin
  const fixture = buildDevPrintableAuthorizedPerson({ origin, variantId: query.variant, scenarioId: query.scenario })
  const design = createDefaultMarbeteVisualDesign(query.theme)

  if (query.preset === 'rotated') {
    const photo = design.elements.find((item) => item.kind === 'person-photo')
    const ciclo = design.elements.find((item) => item.kind === 'ciclo-tag')
    if (photo) photo.rotation = 7
    if (ciclo) ciclo.rotation = -4
  }
  if (query.preset === 'wide-crop') {
    const photo = design.elements.find((item) => item.kind === 'person-photo')
    if (photo?.imageStyle) {
      photo.imageStyle.fit = 'cover'
      photo.imageStyle.focalX = 80
      photo.imageStyle.focalY = 35
      photo.width = 240
      photo.height = 190
    }
  }
  if (query.preset === 'minimal') {
    for (const element of design.elements) {
      element.visible = ['person-photo', 'authorized-name', 'relationship', 'qr', 'ciclo-tag'].includes(element.kind)
    }
  }

  const templateSvg = compileMarbeteVisualSvg(design, { mode: 'print' })
  const renderedSvg = renderMarbeteSvg(templateSvg, fixture.data, origin, query.ciclo)
  const values = buildMarbeteRenderValues(fixture.data, origin, query.ciclo).values
  const readiness = validateMarbeteRequirements(templateSvg, fixture.data, origin, query.ciclo)
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
    setHeader(event, 'Cache-Control', 'no-store')
    return { ok: readiness.ok && assetsOk, readiness, assetsOk, assetError, values, preset: query.preset }
  }

  if (query.format === 'svg-preview') {
    setHeader(event, 'Content-Type', 'image/svg+xml; charset=utf-8')
    setHeader(event, 'Cache-Control', 'no-store')
    return renderedSvg
  }

  await assertMarbetePdfAssets(pdfInput)
  const pdf = await renderMarbetePdf(pdfInput)
  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(event, 'Cache-Control', 'no-store')
  setHeader(event, 'Content-Disposition', 'inline; filename="marbete-editor-dev.pdf"')
  return pdf
})
