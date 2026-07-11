import { defineEventHandler, getQuery, getRouterParam, readBody } from 'h3'
import { z } from 'zod'
import { updateMktEnrollmentStudent } from '~/server/data/marketingEnrollment'
import { assertMarketingAdmin } from '~/server/utils/authz'
import { withRequestBoundary } from '~/server/utils/logger'
import { requireSession } from '~/server/utils/session'
import { parseOrBadRequest } from '~/server/utils/validation'

const querySchema = z.object({
  plantel: z.string().trim().min(1).max(40),
  ciclo: z.string().trim().regex(/^\d{4}$/)
})

const text = (max = 255) => z.string().trim().max(max).default('')
const optionalEmail = text(255).refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Correo inválido')
const optionalPhone = text(30).refine((value) => !value || value.replace(/\D/g, '').length >= 10, 'Teléfono incompleto')
const optionalCurp = text(18).transform((value) => value.toUpperCase()).refine(
  (value) => !value || /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/.test(value),
  'CURP inválida'
)

const bodySchema = z.object({
  nombres: text(),
  apellidoPaterno: text(),
  apellidoMaterno: text(),
  curp: optionalCurp,
  lugarNacimiento: text(),
  sexo: text(20),
  talla: text(40),
  peso: text(40),
  tipoSangre: text(40),
  alergias: text(1000),
  nombrePadre: text(),
  apellidoPaternoPadre: text(),
  apellidoMaternoPadre: text(),
  telefonoPadre: optionalPhone,
  emailPadre: optionalEmail,
  lugarTrabajoPadre: text(),
  puestoPadre: text(),
  estadoCivilPadre: text(80),
  fechaNacimientoPadre: text(40),
  inePadre: text(80),
  curpPadre: optionalCurp,
  nombreMadre: text(),
  apellidoPaternoMadre: text(),
  apellidoMaternoMadre: text(),
  telefonoMadre: optionalPhone,
  emailMadre: optionalEmail,
  lugarTrabajoMadre: text(),
  puestoMadre: text(),
  estadoCivilMadre: text(80),
  fechaNacimientoMadre: text(40),
  ineMadre: text(80),
  curpMadre: optionalCurp,
  direccion: text(1000),
  domicilioCalle: text(),
  domicilioNumero: text(80),
  domicilioColonia: text(),
  domicilioCp: text(10).refine((value) => !value || /^\d{5}$/.test(value.replace(/\D/g, '')), 'Código postal inválido'),
  domicilioMunicipio: text(),
  servicio: text(),
  servicioNotas: text(1000)
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertMarketingAdmin(user)
  const matricula = String(getRouterParam(event, 'matricula') || '').trim().toUpperCase()
  const query = parseOrBadRequest(querySchema, getQuery(event), 'El plantel o ciclo no son válidos.')
  const body = parseOrBadRequest(bodySchema, await readBody(event), 'Revisa la ficha antes de guardar.')
  return withRequestBoundary(event, 'mkt.enrollment.student.update', () => updateMktEnrollmentStudent(user, matricula, query, body), {
    userId: user.id,
    plantel: query.plantel,
    matricula
  })
})
