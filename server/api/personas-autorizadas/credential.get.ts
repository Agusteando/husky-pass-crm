import { z } from 'zod'
import { getCredentialAuthorizedPersona } from '~/server/data/mysqlDaycare'

const schema = z.object({ id: z.coerce.number().int().positive() })

export default defineEventHandler(async (event) => {
  const query = schema.parse(getQuery(event))
  return getCredentialAuthorizedPersona(query.id)
})
