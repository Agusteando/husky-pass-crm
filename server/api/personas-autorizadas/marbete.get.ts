import { defineEventHandler, getQuery, getRequestURL, setHeader } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { getCredentialAuthorizedPersona } from '~/server/data/mysqlDaycare'
import {
  buildMarbeteRenderValues,
  marbeteDownloadName,
  resolveAuthorizedPersonMarbeteTemplateSvg
} from '~/server/utils/marbeteTemplates'
import { renderMarbeteSvgValues } from '~/utils/marbeteSvgRuntime'
import { renderMarbetePdf } from '~/server/utils/marbetePdf'
import { withRequestBoundary } from '~/server/utils/logger'
import type { MarbeteReadinessResponse } from '~/types/daycare'
import { renderMarbeteQrVector } from '~/server/utils/marbeteQr'
import { publicError } from '~/server/utils/httpError'

const schema = z.object({
  id: z.coerce.number().int().positive(),
  download: z.string().optional().default(''),
  format: z.enum(['', 'svg-preview', 'readiness']).optional().default('')
})

async function resolveTemplate(data: Awaited<ReturnType<typeof getCredentialAuthorizedPersona>>) {
  return resolveAuthorizedPersonMarbeteTemplateSvg({
    matricula: data.matricula,
    plantel: data.plantel,
    nivelEdu: data.nivelEdu,
    cicloEscolar: data.cicloEscolar
  })
}

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)

  return withRequestBoundary(event, 'personas-autorizadas.marbete.load', async () => {
    const query = schema.parse(getQuery(event))
    const data = await getCredentialAuthorizedPersona(user, query.id)
    const { template, templateSvg } = await resolveTemplate(data)
    const origin = getRequestURL(event).origin
    const renderValues = buildMarbeteRenderValues(data, origin, template.cicloEscolar)
    const qrTemplateSvg = renderMarbeteQrVector(templateSvg, renderValues.validationUrl)
    if (!/data-husky-qr-vector=["']1["']/i.test(qrTemplateSvg)) {
      throw publicError(503, 'No pudimos preparar el Husky Pass en este momento.')
    }
    const svg = renderMarbeteSvgValues(qrTemplateSvg, renderValues.values)
    const pdfInput = {
      templateSvg: qrTemplateSvg,
      renderedSvg: svg,
      values: renderValues.values,
      origin,
      tolerateAssetFailures: true
    }
    const downloadName = marbeteDownloadName(data, template)

    if (query.format === 'readiness') {
      const response: MarbeteReadinessResponse = {
        ok: true,
        issues: [],
        template,
        themeKey: template.themeKey,
        downloadName
      }
      setHeader(event, 'Cache-Control', 'private, no-store')
      return response
    }

    if (query.format === 'svg-preview' && query.download !== '1') {
      setHeader(event, 'Content-Type', 'image/svg+xml; charset=utf-8')
      setHeader(event, 'Cache-Control', 'private, no-store')
      setHeader(event, 'X-Husky-Marbete-Template', template.id)
      setHeader(event, 'X-Husky-Marbete-Theme', template.themeKey)
      setHeader(event, 'X-Husky-Marbete-Source', template.source || 'bundled-svg')
      return svg
    }

    const pdf = await renderMarbetePdf(pdfInput)

    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Cache-Control', 'private, no-store')
    setHeader(event, 'X-Husky-Marbete-Template', template.id)
    setHeader(event, 'X-Husky-Marbete-Theme', template.themeKey)
    setHeader(event, 'X-Husky-Marbete-Source', template.source || 'bundled-svg')
    if (query.download === '1') {
      setHeader(event, 'Content-Disposition', `attachment; filename="${downloadName}"`)
    } else {
      setHeader(event, 'Content-Disposition', `inline; filename="${downloadName}"`)
    }

    return pdf
  }, { userId: user.id })
})
