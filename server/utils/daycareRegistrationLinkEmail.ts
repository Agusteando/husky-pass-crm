import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { JWT } from 'google-auth-library'
import { useRuntimeConfig } from 'nitropack/runtime'
import { logSecurityDiagnostic, logSecurityWarning, securityHash } from '~/server/utils/securityDiagnostics'

const DAYCARE_REGISTRATION_ORIGIN = 'https://admin.casitaiedis.edu.mx'

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
}

function decodePrivateKey(raw?: string | null) {
  return String(raw || '').trim().replace(/\\n/g, '\n')
}

function getEmailConfig(): EmailConfig {
  const config = useRuntimeConfig()
  const recovery = config.passwordRecovery || {}
  const modeValue = process.env.DAYCARE_REGISTRATION_EMAIL_MODE || process.env.DAYCARE_ACCESS_EMAIL_MODE || process.env.PASSWORD_RECOVERY_EMAIL_MODE || recovery.emailMode || 'gmail'
  return {
    mode: String(modeValue).trim().toLowerCase() === 'preview' ? 'preview' : 'gmail',
    serviceAccountEmail: String(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || recovery.googleServiceAccountEmail || '').trim(),
    privateKey: decodePrivateKey(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || recovery.googleServiceAccountPrivateKey)
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
  const missing = [
    ['GOOGLE_SERVICE_ACCOUNT_EMAIL', config.serviceAccountEmail],
    ['GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY', config.privateKey]
  ].filter(([, value]) => !value).map(([key]) => key)
  if (missing.length) throw new Error(`Missing daycare registration email configuration: ${missing.join(', ')}`)
  if (!/-----BEGIN PRIVATE KEY-----/.test(config.privateKey) || !/-----END PRIVATE KEY-----/.test(config.privateKey)) {
    throw new Error('Google service-account private key is malformed.')
  }
}

export function buildDaycareRegistrationLinkEmail(input: RegistrationLinkEmailInput) {
  const senderEmail = normalizeEmail(input.senderEmail)
  const senderName = headerText(input.senderName) || 'Equipo de Guardería'
  const location = `${input.unidad} · ${input.sala}`
  const subject = `Completa tu registro en Husky Pass Guardería`
  const text = [
    'Hola,',
    '',
    `Ya puedes crear el acceso familiar de ${location}.`,
    '',
    input.url,
    '',
    'Abre el enlace para registrar el correo familiar y crear la contraseña de acceso.',
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
    `From: ${encodeMimeWord(senderName)} <${senderEmail}>`,
    `Reply-To: ${senderEmail}`,
    `To: ${input.to}`,
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
  return { subject, text, html, raw, senderEmail }
}

async function sendWithGmail(raw: string, config: EmailConfig, delegatedUser: string) {
  assertGmailConfig(config)
  assertInstitutionalSender(delegatedUser)
  const client = new JWT({
    email: config.serviceAccountEmail,
    key: config.privateKey,
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
    subject: delegatedUser
  })
  const accessToken = await client.getAccessToken()
  if (!accessToken.token) throw new Error('Google service-account token was not issued.')
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: base64url(raw) })
  })
  if (!response.ok) throw new Error(`Gmail send failed with ${response.status}: ${(await response.text()).slice(0, 500)}`)
}

async function writePreviewEmail(input: RegistrationLinkEmailInput, email: ReturnType<typeof buildDaycareRegistrationLinkEmail>) {
  if (process.env.NODE_ENV === 'production') throw new Error('Email preview mode is not available in production.')
  const dir = join(process.cwd(), 'artifacts', 'daycare-registration-emails')
  await mkdir(dir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const emailHash = securityHash(input.to)?.slice(0, 12) || 'unknown'
  const base = `${stamp}-${emailHash}`
  await writeFile(join(dir, `${base}.json`), JSON.stringify({
    toHash: securityHash(input.to),
    senderHash: securityHash(email.senderEmail),
    subject: email.subject,
    html: email.html,
    text: email.text
  }, null, 2), 'utf8')
  await writeFile(join(dir, `${base}.eml`), email.raw, 'utf8')
}

export async function sendDaycareRegistrationLinkEmail(input: RegistrationLinkEmailInput) {
  const config = getEmailConfig()
  const senderEmail = normalizeEmail(input.senderEmail)
  assertInstitutionalSender(senderEmail)
  assertCanonicalRegistrationUrl(input.url)
  const email = buildDaycareRegistrationLinkEmail({ ...input, senderEmail })
  try {
    if (config.mode === 'preview') await writePreviewEmail(input, email)
    else await sendWithGmail(email.raw, config, senderEmail)
    logSecurityWarning('daycare-registration-link-email-delivered', {
      mode: config.mode,
      toHash: securityHash(input.to),
      senderHash: securityHash(senderEmail)
    })
  } catch (error) {
    logSecurityDiagnostic('daycare-registration-link-email-failed', error, {
      mode: config.mode,
      toHash: securityHash(input.to),
      senderHash: securityHash(senderEmail)
    })
    throw error
  }
}
