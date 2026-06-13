import { defineEventHandler, getHeader, getRequestURL, readBody, type H3Event } from 'h3'
import { useRuntimeConfig } from 'nitropack/runtime'
import { z } from 'zod'
import { assertRateLimit } from '~/server/utils/antibot'
import { findLegacyFamilyByEmail } from '~/server/data/mysqlAuth'
import { createPasswordRecoveryToken } from '~/server/data/passwordRecovery'
import { sendPasswordRecoveryEmail } from '~/server/utils/recoveryEmail'
import { logSecurityDiagnostic, logSecurityWarning, securityHash } from '~/server/utils/securityDiagnostics'
import { resolvePersonasTheme } from '~/utils/personasTheme'

const schema = z.object({
  email: z.string().trim().email()
})

const neutralMessage = 'Si existe una cuenta familiar con ese correo, enviaremos un enlace para restablecer la contraseña.'

function resetBaseUrl(event: H3Event) {
  const configured = String(useRuntimeConfig().passwordRecovery?.baseUrl || '').trim().replace(/\/+$/, '')
  return configured || getRequestURL(event).origin
}

export default defineEventHandler(async (event) => {
  const body = schema.parse(await readBody(event))
  const email = body.email.toLowerCase()
  const emailHash = securityHash(email)
  const ipKey = securityHash(getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() || event.node.req.socket.remoteAddress || 'unknown') || 'unknown'

  assertRateLimit(`password-recovery:ip:${ipKey}`, {
    limit: 8,
    windowMs: 60 * 60 * 1000,
    message: 'Demasiados intentos. Intenta de nuevo más tarde.'
  })
  assertRateLimit(`password-recovery:email:${emailHash || 'empty'}`, {
    limit: 4,
    windowMs: 60 * 60 * 1000,
    message: 'Demasiados intentos. Intenta de nuevo más tarde.'
  })

  try {
    const legacyUser = await findLegacyFamilyByEmail(email)
    if (!legacyUser) {
      logSecurityWarning('password-recovery-request-no-family-account', { emailHash })
      return { ok: true, message: neutralMessage }
    }

    const sessionUser = legacyUser.toSession('family')
    const recovery = await createPasswordRecoveryToken({
      event,
      userId: Number(sessionUser.id),
      email: sessionUser.email || email
    })
    const resetUrl = `${resetBaseUrl(event)}/restablecer-contrasena?token=${encodeURIComponent(recovery.token)}`
    const theme = resolvePersonasTheme({
      matricula: sessionUser.username,
      plantel: sessionUser.plantel?.[0],
      campus: sessionUser.campus
    })

    try {
      await sendPasswordRecoveryEmail({
        to: sessionUser.email || email,
        displayName: sessionUser.displayName || sessionUser.username || null,
        resetUrl,
        expiresAt: recovery.expiresAt,
        theme
      })
    } catch (error) {
      logSecurityDiagnostic('password-recovery-delivery-failed-neutral-response', error, {
        userId: sessionUser.id,
        emailHash
      })
    }
  } catch (error) {
    logSecurityDiagnostic('password-recovery-request-failed-neutral-response', error, { emailHash })
  }

  return { ok: true, message: neutralMessage }
})
