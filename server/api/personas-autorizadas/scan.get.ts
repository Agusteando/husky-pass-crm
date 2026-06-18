import { defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import { getScanAuthorizedPersona } from '~/server/data/mysqlDaycare'
import { withRequestBoundary } from '~/server/utils/logger'

const schema = z.object({ id: z.coerce.number().int().positive() })

export default defineEventHandler(async (event) => {
  return withRequestBoundary(event, 'personas-autorizadas.scan.load', async () => {
    const query = schema.parse(getQuery(event))
    return getScanAuthorizedPersona(query.id)
  }, {}, { expectedStatusCodes: [404] })
})
