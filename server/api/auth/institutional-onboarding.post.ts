import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { completeInstitutionalOnboarding } from '~/server/data/mysqlAuth'
import { requireSession, setAppSession } from '~/server/utils/session'
import type { CompleteInstitutionalOnboardingResponse } from '~/types/institutionalOnboarding'

const schema = z.object({
  role: z.enum(['schoolAdmin', 'marketingAdmin', 'daycareAdmin']),
  planteles: z.array(z.string().trim().min(1)).max(7).default([]),
  unidades: z.array(z.string().trim().min(1)).max(30).default([])
})

export default defineEventHandler(async (event): Promise<CompleteInstitutionalOnboardingResponse> => {
  const user = requireSession(event, 'admin')
  const body = schema.parse(await readBody(event))
  const result = await completeInstitutionalOnboarding(user, body)
  setAppSession(event, result.user)
  return {
    user: result.user,
    loggedin: true,
    defaultPath: result.defaultPath
  }
})
