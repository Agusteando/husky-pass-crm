import { z } from 'zod'
import { findLegacyFamilyByLogin, validateLegacyPassword } from '~/server/data/mysqlAuth'
import { setAppSession } from '~/server/utils/session'

const schema = z.object({
  login: z.string().min(1),
  password: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const body = schema.parse(await readBody(event))
  const legacyUser = await findLegacyFamilyByLogin(body.login.trim())
  if (!legacyUser) {
    throw createError({ statusCode: 401, statusMessage: 'No encontramos una cuenta familiar de guardería con esos datos.' })
  }

  const valid = await validateLegacyPassword(body.password, legacyUser.raw)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Usuario o contraseña incorrectos.' })
  }

  const sessionUser = legacyUser.toSession('family')
  if (!sessionUser.sala || sessionUser.unidades.length === 0) {
    throw createError({ statusCode: 403, statusMessage: 'La cuenta no tiene sala o unidad de guardería asignada.' })
  }

  setAppSession(event, sessionUser)
  setCookie(event, 'user_segment', 'daycare', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
  setCookie(event, 'last_login_type', 'php', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
  return { user: sessionUser, loggedin: true }
})
