import { defineEventHandler, getRouterParam } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertSchoolAdmin } from '~/server/utils/authz'
import { getGestionFamilyDetail } from '~/server/data/gestionEscolar'
import { withRequestBoundary } from '~/server/utils/logger'
import { parseOrBadRequest } from '~/server/utils/validation'

const idSchema = z.coerce.number().int().positive()

export default defineEventHandler((event) => {
  const user = requireSession(event, 'admin')
  assertSchoolAdmin(user)
  const id = parseOrBadRequest(idSchema, getRouterParam(event, 'id'), 'Selecciona una familia valida.')
  return withRequestBoundary(event, 'gestion-escolar.families.detail', () => getGestionFamilyDetail(user, id), { userId: user.id, targetUserId: id })
})
