import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { assertPasswordConfirmation } from '~/server/utils/passwordPolicy'
import { resetPasswordWithRecoveryToken } from '~/server/data/passwordRecovery'
import { logSecurityDiagnostic, securityHash } from '~/server/utils/securityDiagnostics'

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(1),
  confirmation: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const body = schema.parse(await readBody(event))
  const issues = assertPasswordConfirmation(body.password, body.confirmation)
  if (issues.length) {
    throw createError({ statusCode: 400, statusMessage: issues[0] })
  }

  try {
    await resetPasswordWithRecoveryToken(body.token, body.password)
    return { ok: true, message: 'Contraseña actualizada. Ya puedes iniciar sesión.' }
  } catch (error) {
    logSecurityDiagnostic('password-recovery-reset-failed', error, { tokenHash: securityHash(body.token) })
    throw error
  }
})
