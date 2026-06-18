import { defineEventHandler, getQuery } from 'h3'
import { requireSession } from '~/server/utils/session'
import { z } from 'zod'
import { getCredentialAuthorizedPersona } from '~/server/data/mysqlDaycare'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { withRequestBoundary } from '~/server/utils/logger'

const schema = z.object({ id: z.coerce.number().int().positive() })

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  return withRequestBoundary(event, 'personas-autorizadas.credential.load', async () => {
    const query = schema.parse(getQuery(event))
    return getCredentialAuthorizedPersona(user, query.id)
  }, { userId: user.id })
})
