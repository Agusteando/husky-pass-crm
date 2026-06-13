import { createError, defineEventHandler, getQuery, getRequestURL } from 'h3'
import { z } from 'zod'
import { isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'
import { searchSuperAdminPassCandidates } from '~/server/data/mysqlPersonasAdmin'
import { DEV_HUSKY_PASS_VARIANTS, buildDevPrintableAuthorizedPerson, selectDevHuskyPassTemplate } from '~/server/utils/devHuskyPassFixtures'
import { listMarbeteTemplates, readMarbeteTemplateSvg, validateMarbeteRequirements } from '~/server/utils/marbeteTemplates'
import { resolvePersonasTheme } from '~/utils/personasTheme'

const schema = z.object({
  search: z.string().optional().default(''),
  plantel: z.string().optional().default(''),
  nivel: z.string().optional().default(''),
  fixture: z.string().optional().default(''),
  limit: z.coerce.number().int().min(10).max(200).optional().default(80)
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) throw createError({ statusCode: 403, statusMessage: 'Solo superadmin puede generar Husky Pass.' })
  const query = schema.parse(getQuery(event))
  const origin = getRequestURL(event).origin

  if (query.fixture === '1' && process.env.NODE_ENV !== 'production') {
    const templates = await listMarbeteTemplates()
    const rows = await Promise.all(DEV_HUSKY_PASS_VARIANTS.map(async (variant) => {
      const fixture = buildDevPrintableAuthorizedPerson({ origin, variantId: variant.id, scenarioId: 'default' })
      const template = selectDevHuskyPassTemplate(templates, fixture.variant)
      const theme = resolvePersonasTheme({
        matricula: fixture.data.matricula,
        plantel: fixture.data.plantel,
        nivelEdu: fixture.data.nivelEdu,
        themeKey: fixture.variant.themeKey
      })
      let readiness = { ok: false, issues: ['Plantilla de Husky Pass no disponible.'] }
      if (template) {
        const svg = await readMarbeteTemplateSvg(template)
        readiness = validateMarbeteRequirements(svg, fixture.data, origin)
      }
      return {
        personId: Number(fixture.data.id),
        userId: Number(fixture.data.user_id),
        indice: Number(fixture.data.indice),
        authorizedName: [fixture.data.nombreP, fixture.data.paternoP, fixture.data.maternoP].filter(Boolean).join(' '),
        parentesco: fixture.data.parenP || null,
        authorizedPhoto: fixture.data.foto || null,
        studentName: fixture.data.fullnameA || 'Alumno fixture',
        matricula: fixture.data.matricula || null,
        plantel: fixture.data.plantel || '',
        nivel: fixture.data.nivelEdu || '',
        grado: fixture.data.gradoA || null,
        grupo: fixture.data.grupoA || null,
        contact: 'fixture-superadmin@localhost',
        theme,
        template: template || null,
        readiness
      }
    }))
    return {
      rows,
      planteles: Array.from(new Set(rows.map((row) => row.plantel))).sort(),
      niveles: Array.from(new Set(rows.map((row) => row.nivel))).sort(),
      filters: {
        search: query.search,
        plantel: query.plantel,
        nivel: query.nivel,
        limit: query.limit
      }
    }
  }

  return searchSuperAdminPassCandidates(query, origin)
})
