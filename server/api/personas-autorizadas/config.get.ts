import { defineEventHandler } from 'h3'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { readPersonasConfig } from '~/server/utils/personasConfig'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  return readPersonasConfig()
})
