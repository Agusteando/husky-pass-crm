import { defineEventHandler, getQuery } from 'h3'
import { requireSession } from '~/server/utils/session'
import { z } from 'zod'
import { getFamilyAccounts } from '~/server/data/mysqlDaycare'
import { assertDaycareAdmin } from '~/server/utils/authz'

const schema = z.object({ sala: z.coerce.number().int().positive() })

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const query = schema.parse(getQuery(event))
  return getFamilyAccounts(user, query.sala)
})
