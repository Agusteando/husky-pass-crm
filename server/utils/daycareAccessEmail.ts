import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { JWT } from 'google-auth-library'
import { useRuntimeConfig } from 'nitropack/runtime'
import { logSecurityDiagnostic, logSecurityWarning, securityHash } from '~/server/utils/securityDiagnostics'
import { assertGoogleServiceAccountCredentials, resolveGoogleServiceAccountCredentials } from '~/server/utils/googleServiceAccountCredentials'

type DaycareAccessEmailInput = {
  to: string
  childName?: string | null
  login: string
  password: string
  unidad?: string | null
  sala?: string | number | null
}

type EmailConfig = {
  mode: 'gmail' | 'preview'
  fromEmail: string
  fromName: string
  serviceAccountEmail: string
  privateKey: string
  delegatedUser: string
}

function getEmailConfig(): EmailConfig {
  const config = useRuntimeConfig()
  const recovery = config.passwordRecovery || {}
  const modeValue = process.env.DAYCARE_ACCESS_EMAIL_MODE || process.env.PASSWORD_RECOVERY_EMAIL_MODE || recovery.emailMode || 'gmail'
  const credentials = resolveGoogleServiceAccountCredentials()
  return {
    mode: String(modeValue).trim().toLowerCase() === 'preview' ? 'preview' : 'gmail',
    fromEmail: String(process.env.DAYCARE_ACCESS_FROM_EMAIL || process.env.PASSWORD_RECOVERY_FROM_EMAIL || recovery.fromEmail || '').trim(),
    fromName: String(process.env.DAYCARE_ACCESS_FROM_NAME || process.env.PASSWORD_RECOVERY_FROM_NAME || recovery.fromName || 'Husky Pass').trim(),
    serviceAccountEmail: credentials.email,
    privateKey: credentials.privateKey,
    delegatedUser: String(process.env.GOOGLE_WORKSPACE_DELEGATED_USER || process.env.GOOGLE_GMAIL_DELEGATED_USER || recovery.googleDelegatedUser || '').trim()
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
    ['DAYCARE_ACCESS_FROM_EMAIL or PASSWORD_RECOVERY_FROM_EMAIL', config.fromEmail],
    ['GOOGLE_WORKSPACE_DELEGATED_USER or GOOGLE_GMAIL_DELEGATED_USER', config.delegatedUser]
  ].filter(([, value]) => !value).map(([key]) => key)
  if (missing.length) throw new Error(`Missing daycare access email configuration: ${missing.join(', ')}`)
  assertGoogleServiceAccountCredentials({ email: config.serviceAccountEmail, privateKey: config.privateKey, source: 'resolved' })
}

function buildEmail(input: DaycareAccessEmailInput, config: EmailConfig) {
  const childName = input.childName?.trim() || 'tu familia'
  const unitLine = [input.unidad, input.sala ? `Sala ${input.sala}` : null].filter(Boolean).join(' · ')
  const subject = `Acceso de guardería Husky Pass`
  const text = [
    `Hola,`,
    '',
    `Estas son las credenciales de acceso de guardería para ${childName}:`,
    unitLine ? `Unidad: ${unitLine}` : '',
    `Usuario: ${input.login}`,
    `Contraseña: ${input.password}`,
    '',
    'Ingresa desde el portal de Husky Pass Guardería.'
  ].filter(Boolean).join('\n')

  const html = `
    <div style="font-family:Montserrat,Arial,sans-serif;color:#102235;line-height:1.5;max-width:620px;margin:0 auto;padding:26px;background:#fbfdf6">
      <div style="background:#ffffff;border:1px solid #d8ebe6;border-radius:22px;overflow:hidden;box-shadow:0 18px 52px rgba(14,40,55,.10)">
        <div style="background:linear-gradient(135deg,#eefaf7,#fff6df);padding:24px 26px;border-bottom:1px solid #d8ebe6">
          <p style="margin:0 0 8px;color:#075f58;font-weight:800;letter-spacing:.12em;text-transform:uppercase;font-size:12px">Husky Pass Guardería</p>
          <h1 style="margin:0;font-size:28px;line-height:1.05">Acceso familiar</h1>
          ${unitLine ? `<p style="margin:8px 0 0;color:#607086;font-weight:700">${escapeHtml(unitLine)}</p>` : ''}
        </div>
        <div style="padding:24px 26px">
          <p style="margin:0 0 16px">Hola, compartimos las credenciales de acceso para <strong>${escapeHtml(childName)}</strong>.</p>
          <div style="display:grid;gap:12px;margin:18px 0">
            <div style="border:1px solid #dcebe7;border-radius:16px;padding:14px;background:#ffffff"><span style="display:block;color:#607086;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em">Usuario</span><strong style="font-size:20px">${escapeHtml(input.login)}</strong></div>
            <div style="border:1px solid #dcebe7;border-radius:16px;padding:14px;background:#ffffff"><span style="display:block;color:#607086;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em">Contraseña</span><strong style="font-size:20px">${escapeHtml(input.password)}</strong></div>
          </div>
        </div>
      </div>
    </div>
  `.trim()
  const boundary = `hpc-daycare-${Date.now().toString(36)}`
  const raw = [
    `From: ${encodeMimeWord(config.fromName)} <${config.fromEmail}>`,
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
  return { subject, text, html, raw }
}

async function sendWithGmail(raw: string, config: EmailConfig) {
  assertGmailConfig(config)
  const client = new JWT({
    email: config.serviceAccountEmail,
    key: config.privateKey,
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
    subject: config.delegatedUser
  })
  const accessToken = await client.getAccessToken()
  if (!accessToken.token) throw new Error('Google service-account token was not issued.')
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: base64url(raw) })
  })
  if (!response.ok) throw new Error(`Gmail send failed with ${response.status}: ${(await response.text()).slice(0, 500)}`)
}

async function writePreviewEmail(input: DaycareAccessEmailInput, email: ReturnType<typeof buildEmail>) {
  if (process.env.NODE_ENV === 'production') throw new Error('Email preview mode is not available in production.')
  const dir = join(process.cwd(), 'artifacts', 'daycare-access-emails')
  await mkdir(dir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const emailHash = securityHash(input.to)?.slice(0, 12) || 'unknown'
  const base = `${stamp}-${emailHash}`
  await writeFile(join(dir, `${base}.json`), JSON.stringify({
    toHash: securityHash(input.to),
    subject: email.subject,
    html: email.html,
    text: email.text
  }, null, 2), 'utf8')
  await writeFile(join(dir, `${base}.eml`), email.raw, 'utf8')
}

export async function sendDaycareAccessEmail(input: DaycareAccessEmailInput) {
  const config = getEmailConfig()
  const email = buildEmail(input, config)
  try {
    if (config.mode === 'preview') await writePreviewEmail(input, email)
    else await sendWithGmail(email.raw, config)
    logSecurityWarning('daycare-access-email-delivered', { mode: config.mode, toHash: securityHash(input.to) })
  } catch (error) {
    logSecurityDiagnostic('daycare-access-email-failed', error, { mode: config.mode, toHash: securityHash(input.to) })
    throw error
  }
}
