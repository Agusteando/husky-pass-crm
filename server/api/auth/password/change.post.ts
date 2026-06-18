import { defineEventHandler, readBody } from 'h3'
import { publicError } from '~/server/utils/httpError'
import { z } from 'zod'
import { findLegacyFamilyById, updateLegacyFamilyPassword, validateLegacyPassword } from '~/server/data/mysqlAuth'
import { assertRateLimit } from '~/server/utils/antibot'
import { assertPasswordConfirmation } from '~/server/utils/passwordPolicy'
import { requireSession } from '~/server/utils/session'
import { logSecurityDiagnostic, logSecurityWarning } from '~/server/utils/securityDiagnostics'

const schema = z.object({
  currentPassword: z.string().min(1),
  password: z.string().min(1),
  confirmation: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertRateLimit(`password-change:user:${user.id}`, {
    limit: 8,
    windowMs: 15 * 60 * 1000,
    message: 'Demasiados intentos. Intenta de nuevo más tarde.'
  })

  const body = schema.parse(await readBody(event))
  const issues = assertPasswordConfirmation(body.password, body.confirmation)
  if (issues.length) {
    throw publicError(400, issues[0])
  }
  if (body.currentPassword === body.password) {
    throw publicError(400, 'La nueva contraseña debe ser diferente.')
  }

  try {
    const legacyUser = await findLegacyFamilyById(Number(user.id))
    if (!legacyUser) {
      logSecurityWarning('password-change-family-account-missing', { userId: user.id })
      throw publicError(403, 'La cuenta familiar no está disponible.')
    }

    const valid = await validateLegacyPassword(body.currentPassword, legacyUser.raw)
    if (!valid) {
      logSecurityWarning('password-change-current-password-invalid', { userId: user.id })
      throw publicError(400, 'La contraseña actual no coincide.')
    }

    await updateLegacyFamilyPassword(Number(user.id), body.password)
    return { ok: true, message: 'Contraseña actualizada.' }
  } catch (error) {
    logSecurityDiagnostic('password-change-failed', error, { userId: user.id })
    throw error
  }
})
