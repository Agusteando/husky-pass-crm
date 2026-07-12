import { defineEventHandler, getQuery, getRouterParam, readBody } from 'h3'
import { z } from 'zod'
import { updateMktEnrollmentParents } from '~/server/data/marketingEnrollment'
import { assertMarketingAdmin } from '~/server/utils/authz'
import { withRequestBoundary } from '~/server/utils/logger'
import { requireSession } from '~/server/utils/session'
import { parseOrBadRequest } from '~/server/utils/validation'

const querySchema = z.object({
  plantel: z.string().trim().min(1).max(40),
  ciclo: z.string().trim().regex(/^\d{4}$/)
})

const optionalEmail = z.string().trim().max(255).refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Correo inválido')
const optionalPhone = z.string().trim().max(30).refine((value) => !value || value.replace(/\D/g, '').length >= 10, 'Teléfono incompleto')
const bodySchema = z.object({
  nombrePadre: z.string().trim().max(255).default(''),
  apellidoPaternoPadre: z.string().trim().max(255).default(''),
  apellidoMaternoPadre: z.string().trim().max(255).default(''),
  telefonoPadre: optionalPhone.default(''),
  emailPadre: optionalEmail.default(''),
  nombreMadre: z.string().trim().max(255).default(''),
  apellidoPaternoMadre: z.string().trim().max(255).default(''),
  apellidoMaternoMadre: z.string().trim().max(255).default(''),
  telefonoMadre: optionalPhone.default(''),
  emailMadre: optionalEmail.default(''),
  direccion: z.string().trim().max(500).default(''),
  domicilioCalle: z.string().trim().max(255).default(''),
  domicilioNumero: z.string().trim().max(80).default(''),
  domicilioColonia: z.string().trim().max(255).default(''),
  domicilioCp: z.string().trim().max(10).default(''),
  domicilioMunicipio: z.string().trim().max(255).default('')
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertMarketingAdmin(user)
  const matricula = String(getRouterParam(event, 'matricula') || '').trim().toUpperCase()
  const query = parseOrBadRequest(querySchema, getQuery(event), 'El plantel o ciclo no son válidos.')
  const body = parseOrBadRequest(bodySchema, await readBody(event), 'Revisa la información familiar antes de guardar.')
  return withRequestBoundary(event, 'mkt.enrollment.student.update', () => updateMktEnrollmentParents(user, matricula, query, body), {
    userId: user.id,
    plantel: query.plantel,
    matricula
  })
})
