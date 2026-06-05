import { defineEventHandler } from 'h3'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { getFamilyChildren } from '~/server/data/mysqlDaycare'
import { readPersonasConfig, resolveSurveyForStudent } from '~/server/utils/personasConfig'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  const [config, children] = await Promise.all([readPersonasConfig(), getFamilyChildren(user)])
  const child = children.find((item) => item.isCurrent) || children[0] || null
  const resolved = resolveSurveyForStudent(config, {
    matricula: child?.matricula || user.username,
    plantel: child?.plantel || user.plantel?.[0],
    nivelEdu: child?.nivelEdu,
    campus: child?.campus || user.campus
  })

  return {
    ...config,
    ...resolved
  }
})
