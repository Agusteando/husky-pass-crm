import { defineEventHandler, getQuery, getRequestURL, setHeader } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { getCredentialAuthorizedPersona } from '~/server/data/mysqlDaycare'
import {
  buildMarbeteRenderValues,
  listMarbeteTemplates,
  marbeteDownloadName,
  readMarbeteTemplateSvg,
  renderMarbeteSvgValues,
  selectMarbeteTemplate
} from '~/server/utils/marbeteTemplates'
import { renderMarbetePdf } from '~/server/utils/marbetePdf'
import { withRequestBoundary } from '~/server/utils/logger'
import { compileMarbeteVisualSvg, createDefaultMarbeteVisualDesign } from '~/utils/marbeteDesigner'
import { resolvePersonasTheme } from '~/utils/personasTheme'
import type { MarbeteReadinessResponse, MarbeteTemplateMeta, PrintableAuthorizedPerson } from '~/types/daycare'

const schema = z.object({
  id: z.coerce.number().int().positive(),
  download: z.string().optional().default(''),
  format: z.enum(['', 'svg-preview', 'readiness']).optional().default('')
})

function fallbackTemplate(data: PrintableAuthorizedPerson): { template: MarbeteTemplateMeta; templateSvg: string } {
  const theme = resolvePersonasTheme({
    matricula: data.matricula || data.child?.matricula,
    plantel: data.plantel || data.child?.plantel,
    nivelEdu: data.nivelEdu || data.child?.nivelEdu,
    campus: data.child?.campus
  })
  const now = new Date().toISOString()
  const template: MarbeteTemplateMeta = {
    id: `${theme.key}-automatic`,
    name: 'Husky Pass automático',
    filename: '',
    themeKey: theme.key,
    nivel: String(data.nivelEdu || data.child?.nivelEdu || ''),
    planteles: [],
    color: theme.primary,
    isDefault: true,
    mode: 'visual',
    status: 'published',
    cicloEscolar: String(data.cicloEscolar || ''),
    visualDesign: createDefaultMarbeteVisualDesign(theme.key),
    createdAt: now,
    updatedAt: now
  }
  return {
    template,
    templateSvg: compileMarbeteVisualSvg(template.visualDesign!, { mode: 'print' })
  }
}

async function resolveTemplate(data: PrintableAuthorizedPerson) {
  try {
    const templates = await listMarbeteTemplates()
    const template = selectMarbeteTemplate(templates, {
      matricula: data.matricula,
      plantel: data.plantel,
      nivelEdu: data.nivelEdu,
      cicloEscolar: data.cicloEscolar
    })
    const templateSvg = await readMarbeteTemplateSvg(template)
    return { template, templateSvg }
  } catch {
    return fallbackTemplate(data)
  }
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
    const svg = renderMarbeteSvgValues(templateSvg, renderValues.values)
    const pdfInput = {
      templateSvg,
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
      return svg
    }

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
