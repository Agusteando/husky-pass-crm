import { defineEventHandler, getQuery } from 'h3'
import { requireSession } from '~/server/utils/session'
import { z } from 'zod'
import { getCredentialAuthorizedPersona } from '~/server/data/mysqlDaycare'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'

const schema = z.object({ id: z.coerce.number().int().positive() })

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  const query = schema.parse(getQuery(event))
  return getCredentialAuthorizedPersona(user, query.id)
})
