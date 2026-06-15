import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'
import { savePersonasConfig, SURVEY_NIVEL_OPTIONS } from '~/server/utils/personasConfig'

const surveySchema = z.object({
  enabled: z.boolean().optional().default(false),
  title: z.string().trim().optional().default(''),
  embedUrl: z.string().trim().optional().default('')
})

const schema = z.object({
  surveyEnabled: z.boolean().optional().default(false),
  surveyTitle: z.string().trim().optional().default('Encuesta Personas Autorizadas'),
  surveyEmbedUrl: z.string().trim().optional().default(''),
  surveysByNivel: z.record(z.enum(['escolar', 'preescolar', 'primaria', 'secundaria', 'daycare']), surveySchema).optional(),
  conveniosUrl: z.string().trim().optional().default(''),
  helpUrl: z.string().trim().optional().default('')
})

function assertOptionalUrl(value: string, label: string) {
  if (!value || value.startsWith('/uploads/')) return
  try {
    const parsed = new URL(value)
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('bad-protocol')
  } catch {
    throw createError({ statusCode: 400, statusMessage: `${label} debe ser una URL valida.` })
  }
}

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) throw createError({ statusCode: 403, statusMessage: 'Solo superadmin puede configurar Personas Autorizadas.' })
  const body = schema.parse(await readBody(event))
  if (body.surveyEnabled && !/^https:\/\/docs\.google\.com\/forms\//i.test(body.surveyEmbedUrl)) {
    throw createError({ statusCode: 400, statusMessage: 'La encuesta activa debe ser un Google Form.' })
  }
  for (const option of SURVEY_NIVEL_OPTIONS) {
    const survey = body.surveysByNivel?.[option.key]
    if (!survey) continue
    if (survey.enabled && !/^https:\/\/docs\.google\.com\/forms\//i.test(survey.embedUrl)) {
      throw createError({ statusCode: 400, statusMessage: `La encuesta de ${option.label} debe ser un Google Form.` })
    }
    assertOptionalUrl(survey.embedUrl, `La encuesta de ${option.label}`)
  }
  assertOptionalUrl(body.surveyEmbedUrl, 'La encuesta')
  assertOptionalUrl(body.conveniosUrl, 'Convenios')
  assertOptionalUrl(body.helpUrl, 'Ayuda')

  return savePersonasConfig({
    ...body,
    updatedBy: user.email || user.username || String(user.id)
  })
})
