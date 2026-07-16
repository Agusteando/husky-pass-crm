import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { JWT } from 'google-auth-library'
import { useRuntimeConfig } from 'nitropack/runtime'
import { logSecurityDiagnostic, logSecurityWarning, securityHash } from '~/server/utils/securityDiagnostics'
import {
  assertGoogleServiceAccountCredentials,
  GoogleServiceAccountConfigurationError,
  resolveGoogleServiceAccountCredentials
} from '~/server/utils/googleServiceAccountCredentials'

const DAYCARE_REGISTRATION_ORIGIN = 'https://admin.casitaiedis.edu.mx'
const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send'
const GMAIL_SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send'
const GMAIL_TIMEOUT_MS = 20_000

type RegistrationLinkEmailInput = {
  to: string
  unidad: string
  sala: string
  url: string
  senderEmail: string
  senderName?: string | null
}

type EmailConfig = {
  mode: 'gmail' | 'preview'
  serviceAccountEmail: string
  privateKey: string
  credentialSource: string
  delegatedUser: string
}

type DeliveryIdentity = {
  delegatedUser: string
  fromEmail: string
  replyToEmail: string
  strategy: 'current-user' | 'configured-delegated-user'
}

type BuiltRegistrationEmail = {
  subject: string
  text: string
  html: string
  raw: string
  senderEmail: string
  fromEmail: string
  replyToEmail: string
}

class GmailDeliveryError extends Error {
  stage: 'authorize' | 'send'
  status: number | null

  constructor(message: string, stage: 'authorize' | 'send', status: number | null = null, cause?: unknown) {
    super(message, { cause })
    this.name = 'GmailDeliveryError'
    this.stage = stage
    this.status = status
  }
}

function getEmailConfig(): EmailConfig {
  const config = useRuntimeConfig()
  const recovery = config.passwordRecovery || {}
  const requestedMode = String(
    process.env.DAYCARE_REGISTRATION_EMAIL_MODE
      || (process.env.NODE_ENV === 'production' ? 'gmail' : process.env.PASSWORD_RECOVERY_EMAIL_MODE)
      || recovery.emailMode
      || 'gmail'
  ).trim().toLowerCase()

  // A production registration request must always use Gmail. Inheriting a
  // password-recovery preview setting previously caused every request to fail
  // with a 502 because preview files cannot be written in production.
  const mode: EmailConfig['mode'] = process.env.NODE_ENV === 'production'
    ? 'gmail'
    : requestedMode === 'preview' ? 'preview' : 'gmail'

  const credentials = resolveGoogleServiceAccountCredentials()
  return {
    mode,
    serviceAccountEmail: credentials.email,
    privateKey: credentials.privateKey,
    credentialSource: credentials.source,
    delegatedUser: normalizeEmail(
      process.env.GOOGLE_WORKSPACE_DELEGATED_USER
        || process.env.GOOGLE_GMAIL_DELEGATED_USER
        || recovery.googleDelegatedUser
        || process.env.PASSWORD_RECOVERY_FROM_EMAIL
        || recovery.fromEmail
    )
  }
}

function normalizeEmail(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

function headerText(value: unknown) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim()
}

function assertInstitutionalSender(senderEmail: string) {
  if (!/^[^@\s]+@casitaiedis\.edu\.mx$/i.test(senderEmail)) {
    throw new Error('The current user does not have a valid institutional email for Google Workspace impersonation.')
  }
}

function assertCanonicalRegistrationUrl(value: string) {
  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    throw new Error('The daycare registration URL is invalid.')
  }
  if (parsed.origin !== DAYCARE_REGISTRATION_ORIGIN || !parsed.pathname.startsWith('/r/')) {
    throw new Error('The daycare registration URL does not use the canonical Husky Pass domain.')
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function encodeMimeWord(value: string) {
  return `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`
}

function base64url(input: string) {
  return Buffer.from(input, 'utf8').toString('base64url')
}

function assertGmailConfig(config: EmailConfig) {
  assertGoogleServiceAccountCredentials({
    email: config.serviceAccountEmail,
    privateKey: config.privateKey,
    source: config.credentialSource
  })
}

function buildRegistrationEmail(input: RegistrationLinkEmailInput, identity: DeliveryIdentity): BuiltRegistrationEmail {
  const senderEmail = normalizeEmail(input.senderEmail)
  const senderName = headerText(input.senderName) || 'Equipo de Guardería'
  const recipient = normalizeEmail(input.to)
  const location = `${input.unidad} · ${input.sala}`
  const subject = 'Completa tu registro en Husky Pass Guardería'
  const text = [
    'Hola,',
    '',
    `Ya puedes crear el acceso familiar de ${location}.`,
    '',
    input.url,
    '',
    'La madre, padre o tutor debe abrir el enlace o pegarlo completo en la barra de direcciones del navegador.',
    'No debe escribirlo en el buscador de Google.',
    '',
    `Enviado por ${senderName}`
  ].join('\n')

  const html = `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Registro familiar</title>
      </head>
      <body style="margin:0;padding:0;background:#f5fbf8;color:#173042;font-family:Montserrat,Arial,sans-serif">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0">Crea el acceso familiar de guardería en Husky Pass.</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f5fbf8">
          <tr>
            <td align="center" style="padding:30px 14px">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;border-collapse:separate;background:#ffffff;border:1px solid #d6ebe4;border-radius:26px;overflow:hidden;box-shadow:0 18px 48px rgba(23,48,66,.10)">
                <tr>
                  <td style="padding:28px 30px;background:linear-gradient(135deg,#dff5ee 0%,#fff4cc 100%);border-bottom:1px solid #d6ebe4">
                    <div style="font-size:12px;line-height:1.2;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#087268">Husky Pass · Guardería</div>
                    <h1 style="margin:10px 0 8px;font-size:30px;line-height:1.08;color:#173042">Registro familiar</h1>
                    <div style="font-size:16px;font-weight:700;color:#557184">${escapeHtml(location)}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px">
                    <p style="margin:0 0 22px;font-size:16px;line-height:1.65;color:#354f60">Ya puedes crear tu cuenta familiar para acceder a la información de guardería.</p>
                    <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:separate">
                      <tr>
                        <td style="border-radius:14px;background:#087268">
                          <a href="${escapeHtml(input.url)}" style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:800">Crear cuenta familiar</a>
                        </td>
                      </tr>
                    </table>
                    <div style="height:24px"></div>
                    <div style="padding:16px 18px;border:1px solid #dcece7;border-radius:16px;background:#f9fcfb">
                      <div style="margin-bottom:7px;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#688191">Enlace de registro</div>
                      <a href="${escapeHtml(input.url)}" style="word-break:break-all;color:#087268;text-decoration:underline;font-size:14px;line-height:1.55">${escapeHtml(input.url)}</a>
                      <p style="margin:12px 0 0;font-size:13px;line-height:1.55;color:#688191">La madre, padre o tutor debe abrir este enlace o pegarlo completo en la barra de direcciones del navegador. No debe escribirlo en el buscador de Google.</p>
                    </div>
                    <p style="margin:24px 0 0;font-size:14px;line-height:1.55;color:#688191">Este correo fue enviado por <strong style="color:#354f60">${escapeHtml(senderName)}</strong> desde Husky Pass Guardería.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `.trim()

  const boundary = `hpc-daycare-registration-${Date.now().toString(36)}`
  const raw = [
    `From: ${encodeMimeWord(senderName)} <${identity.fromEmail}>`,
    `Reply-To: ${identity.replyToEmail}`,
    `To: ${recipient}`,
    `Subject: ${encodeMimeWord(subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    text,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    html,
    '',
    `--${boundary}--`
  ].join('\r\n')

  return {
    subject,
    text,
    html,
    raw,
    senderEmail,
    fromEmail: identity.fromEmail,
    replyToEmail: identity.replyToEmail
  }
}

export function buildDaycareRegistrationLinkEmail(input: RegistrationLinkEmailInput) {
  const senderEmail = normalizeEmail(input.senderEmail)
  assertInstitutionalSender(senderEmail)
  return buildRegistrationEmail(input, {
    delegatedUser: senderEmail,
    fromEmail: senderEmail,
    replyToEmail: senderEmail,
    strategy: 'current-user'
  })
}

async function sendWithGmail(raw: string, config: EmailConfig, identity: DeliveryIdentity) {
  assertGmailConfig(config)
  assertInstitutionalSender(identity.delegatedUser)
  assertInstitutionalSender(identity.fromEmail)
  assertInstitutionalSender(identity.replyToEmail)

  const client = new JWT({
    email: config.serviceAccountEmail,
    key: config.privateKey,
    scopes: [GMAIL_SEND_SCOPE],
    subject: identity.delegatedUser
  })

  let token: string
  try {
    const accessToken = await client.getAccessToken()
    token = String(accessToken.token || '')
    if (!token) throw new Error('Google service-account token was not issued.')
  } catch (error) {
    throw new GmailDeliveryError('Google Workspace delegation could not authorize the sender.', 'authorize', null, error)
  }

  let response: Response
  try {
    response = await fetch(GMAIL_SEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify({ raw: base64url(raw) }),
      signal: AbortSignal.timeout(GMAIL_TIMEOUT_MS)
    })
  } catch (error) {
    throw new GmailDeliveryError('The Gmail API request could not be completed.', 'send', null, error)
  }

  if (!response.ok) {
    const responseBody = await response.text().catch(() => '')
    throw new GmailDeliveryError(
      `Gmail send failed with ${response.status}: ${responseBody.slice(0, 500)}`,
      'send',
      response.status
    )
  }
}

async function writePreviewEmail(input: RegistrationLinkEmailInput, email: BuiltRegistrationEmail) {
  if (process.env.NODE_ENV === 'production') throw new Error('Email preview mode is not available in production.')
  const dir = join(process.cwd(), 'artifacts', 'daycare-registration-emails')
  await mkdir(dir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const emailHash = securityHash(input.to)?.slice(0, 12) || 'unknown'
  const base = `${stamp}-${emailHash}`
  await writeFile(join(dir, `${base}.json`), JSON.stringify({
    toHash: securityHash(input.to),
    senderHash: securityHash(email.senderEmail),
    fromHash: securityHash(email.fromEmail),
    subject: email.subject,
    html: email.html,
    text: email.text
  }, null, 2), 'utf8')
  await writeFile(join(dir, `${base}.eml`), email.raw, 'utf8')
}

function currentUserIdentity(senderEmail: string): DeliveryIdentity {
  return {
    delegatedUser: senderEmail,
    fromEmail: senderEmail,
    replyToEmail: senderEmail,
    strategy: 'current-user'
  }
}

function configuredFallbackIdentity(config: EmailConfig, senderEmail: string): DeliveryIdentity | null {
  const delegatedUser = normalizeEmail(config.delegatedUser)
  if (!delegatedUser || delegatedUser === senderEmail) return null
  if (!/@casitaiedis\.edu\.mx$/i.test(delegatedUser)) return null
  return {
    delegatedUser,
    fromEmail: delegatedUser,
    replyToEmail: senderEmail,
    strategy: 'configured-delegated-user'
  }
}

function canRetryWithConfiguredMailbox(error: GmailDeliveryError) {
  if (error.stage === 'authorize') return true
  return error.status === 400 || error.status === 401 || error.status === 403
}

export async function sendDaycareRegistrationLinkEmail(input: RegistrationLinkEmailInput) {
  const config = getEmailConfig()
  const senderEmail = normalizeEmail(input.senderEmail)
  assertInstitutionalSender(senderEmail)
  assertCanonicalRegistrationUrl(input.url)

  const primaryIdentity = currentUserIdentity(senderEmail)
  const primaryEmail = buildRegistrationEmail({ ...input, senderEmail }, primaryIdentity)

  if (config.mode === 'preview') {
    await writePreviewEmail(input, primaryEmail)
    logSecurityWarning('daycare-registration-link-email-delivered', {
      mode: config.mode,
      strategy: primaryIdentity.strategy,
      credentialSource: config.credentialSource,
      toHash: securityHash(input.to),
      senderHash: securityHash(senderEmail)
    })
    return
  }

  try {
    assertGmailConfig(config)
  } catch (configurationError) {
    logSecurityDiagnostic('daycare-registration-link-email-config-failed', configurationError, {
      mode: config.mode,
      credentialSource: config.credentialSource,
      missing: configurationError instanceof GoogleServiceAccountConfigurationError ? configurationError.missing : [],
      toHash: securityHash(input.to),
      senderHash: securityHash(senderEmail)
    })
    throw configurationError
  }

  try {
    await sendWithGmail(primaryEmail.raw, config, primaryIdentity)
    logSecurityWarning('daycare-registration-link-email-delivered', {
      mode: config.mode,
      strategy: primaryIdentity.strategy,
      credentialSource: config.credentialSource,
      toHash: securityHash(input.to),
      senderHash: securityHash(senderEmail)
    })
    return
  } catch (primaryError) {
    if (!(primaryError instanceof GmailDeliveryError)) throw primaryError
    const fallbackIdentity = canRetryWithConfiguredMailbox(primaryError)
      ? configuredFallbackIdentity(config, senderEmail)
      : null
    if (!fallbackIdentity) {
      logSecurityDiagnostic('daycare-registration-link-email-failed', primaryError, {
        mode: config.mode,
        strategy: primaryIdentity.strategy,
        credentialSource: config.credentialSource,
        primaryStage: primaryError.stage,
        primaryStatus: primaryError.status,
        toHash: securityHash(input.to),
        senderHash: securityHash(senderEmail)
      })
      throw primaryError
    }

    logSecurityWarning('daycare-registration-link-email-using-fallback', {
      mode: config.mode,
      primaryStage: primaryError instanceof GmailDeliveryError ? primaryError.stage : 'unknown',
      primaryStatus: primaryError.status,
      credentialSource: config.credentialSource,
      toHash: securityHash(input.to),
      senderHash: securityHash(senderEmail),
      delegatedHash: securityHash(fallbackIdentity.delegatedUser)
    })

    const fallbackEmail = buildRegistrationEmail({ ...input, senderEmail }, fallbackIdentity)
    try {
      await sendWithGmail(fallbackEmail.raw, config, fallbackIdentity)
      logSecurityWarning('daycare-registration-link-email-delivered', {
        mode: config.mode,
        strategy: fallbackIdentity.strategy,
        credentialSource: config.credentialSource,
        toHash: securityHash(input.to),
        senderHash: securityHash(senderEmail),
        delegatedHash: securityHash(fallbackIdentity.delegatedUser)
      })
      return
    } catch (fallbackError) {
      logSecurityDiagnostic('daycare-registration-link-email-failed', fallbackError, {
        mode: config.mode,
        strategy: fallbackIdentity.strategy,
        primaryStage: primaryError instanceof GmailDeliveryError ? primaryError.stage : 'unknown',
        primaryStatus: primaryError.status,
        credentialSource: config.credentialSource,
        toHash: securityHash(input.to),
        senderHash: securityHash(senderEmail),
        delegatedHash: securityHash(fallbackIdentity.delegatedUser)
      })
      throw fallbackError
    }
  }
}
