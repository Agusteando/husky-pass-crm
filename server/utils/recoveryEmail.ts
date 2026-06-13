import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { JWT } from 'google-auth-library'
import { useRuntimeConfig } from 'nitropack/runtime'
import type { PersonasTheme } from '~/types/daycare'
import { personasInstitutionName } from '~/utils/personasTheme'
import { logSecurityDiagnostic, logSecurityWarning, securityHash } from '~/server/utils/securityDiagnostics'

interface RecoveryEmailInput {
  to: string
  displayName?: string | null
  resetUrl: string
  expiresAt: Date
  theme: PersonasTheme
}

interface RecoveryEmailConfig {
  mode: 'gmail' | 'preview'
  fromEmail: string
  fromName: string
  serviceAccountEmail: string
  privateKey: string
  delegatedUser: string
}

function decodePrivateKey(raw?: string | null, rawBase64?: string | null) {
  const fromText = String(raw || '').trim()
  if (fromText) return fromText.replace(/\\n/g, '\n')
  const fromBase64 = String(rawBase64 || '').trim()
  if (!fromBase64) return ''
  try {
    return Buffer.from(fromBase64, 'base64').toString('utf8').replace(/\\n/g, '\n')
  } catch {
    return ''
  }
}

function getRecoveryEmailConfig(): RecoveryEmailConfig {
  const config = useRuntimeConfig()
  const recovery = config.passwordRecovery || {}
  const mode = String(recovery.emailMode || 'gmail').trim().toLowerCase() === 'preview' ? 'preview' : 'gmail'
  const privateKey = decodePrivateKey(recovery.googleServiceAccountPrivateKey, recovery.googleServiceAccountPrivateKeyBase64)
  return {
    mode,
    fromEmail: String(recovery.fromEmail || '').trim(),
    fromName: String(recovery.fromName || 'Husky Pass').trim(),
    serviceAccountEmail: String(recovery.googleServiceAccountEmail || '').trim(),
    privateKey,
    delegatedUser: String(recovery.googleDelegatedUser || '').trim()
  }
}

function assertGmailConfig(config: RecoveryEmailConfig) {
  const missing = [
    ['PASSWORD_RECOVERY_FROM_EMAIL', config.fromEmail],
    ['GOOGLE_SERVICE_ACCOUNT_EMAIL', config.serviceAccountEmail],
    ['GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64', config.privateKey],
    ['GOOGLE_WORKSPACE_DELEGATED_USER or GOOGLE_GMAIL_DELEGATED_USER', config.delegatedUser]
  ].filter(([, value]) => !value).map(([key]) => key)

  if (missing.length) {
    const error = new Error(`Missing password recovery email configuration: ${missing.join(', ')}`)
    logSecurityDiagnostic('password-recovery-email-config-missing', error, { missing })
    throw error
  }

  if (!/-----BEGIN PRIVATE KEY-----/.test(config.privateKey) || !/-----END PRIVATE KEY-----/.test(config.privateKey)) {
    const error = new Error('Google service-account private key is malformed.')
    logSecurityDiagnostic('password-recovery-email-config-malformed', error, { keyShape: 'invalid-private-key' })
    throw error
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

function formatExpiry(date: Date) {
  return date.toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Mexico_City'
  })
}

function encodeMimeWord(value: string) {
  return `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`
}

function base64url(input: string) {
  return Buffer.from(input, 'utf8').toString('base64url')
}

function buildEmail(input: RecoveryEmailInput, config: RecoveryEmailConfig) {
  const institution = personasInstitutionName(input.theme)
  const subject = `Restablece tu contraseña de ${institution} Husky Pass`
  const name = input.displayName?.trim() || 'familia'
  const expires = formatExpiry(input.expiresAt)
  const text = [
    `Hola ${name},`,
    '',
    `Usa este enlace para crear una nueva contraseña de ${institution} Husky Pass:`,
    input.resetUrl,
    '',
    `El enlace estará disponible hasta ${expires}.`,
    'Si no solicitaste este cambio, puedes ignorar este correo.'
  ].join('\n')
  const html = `
    <div style="font-family:Montserrat,Arial,sans-serif;line-height:1.5;color:#1f2a44;max-width:560px;margin:0 auto;padding:24px">
      <p style="margin:0 0 8px;color:${input.theme.primary};font-weight:700;letter-spacing:.08em;text-transform:uppercase">${escapeHtml(institution)} Husky Pass</p>
      <h1 style="font-size:24px;line-height:1.15;margin:0 0 16px">Restablece tu contraseña</h1>
      <p>Hola ${escapeHtml(name)},</p>
      <p>Usa este enlace para crear una nueva contraseña.</p>
      <p style="margin:24px 0">
        <a href="${escapeHtml(input.resetUrl)}" style="background:${input.theme.primary};border-radius:10px;color:${escapeHtml(input.theme.contrast)};display:inline-block;font-weight:700;padding:12px 18px;text-decoration:none">Crear nueva contraseña</a>
      </p>
      <p style="color:#687085;font-size:14px">Disponible hasta ${escapeHtml(expires)}.</p>
      <p style="color:#687085;font-size:14px">Si no solicitaste este cambio, puedes ignorar este correo.</p>
    </div>
  `.trim()
  const boundary = `hpc-${Date.now().toString(36)}`
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

async function sendWithGmail(raw: string, config: RecoveryEmailConfig) {
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

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Gmail send failed with ${response.status}: ${body.slice(0, 500)}`)
  }
}

async function writePreviewEmail(input: RecoveryEmailInput, email: ReturnType<typeof buildEmail>) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Email preview mode is not available in production.')
  }
  const dir = join(process.cwd(), 'artifacts', 'password-recovery-emails')
  await mkdir(dir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const emailHash = securityHash(input.to)?.slice(0, 12) || 'unknown'
  const base = `${stamp}-${emailHash}`
  const jsonPath = join(dir, `${base}.json`)
  const emlPath = join(dir, `${base}.eml`)
  await writeFile(jsonPath, JSON.stringify({
    toHash: securityHash(input.to),
    subject: email.subject,
    resetUrl: input.resetUrl,
    expiresAt: input.expiresAt.toISOString(),
    html: email.html,
    text: email.text,
    emlPath
  }, null, 2), 'utf8')
  await writeFile(emlPath, email.raw, 'utf8')
  logSecurityWarning('password-recovery-email-preview-written', { jsonPath, emlPath, toHash: securityHash(input.to) })
}

export async function sendPasswordRecoveryEmail(input: RecoveryEmailInput) {
  const config = getRecoveryEmailConfig()
  const email = buildEmail(input, config)
  try {
    if (config.mode === 'preview') {
      await writePreviewEmail(input, email)
    } else {
      await sendWithGmail(email.raw, config)
    }
    logSecurityWarning('password-recovery-email-delivered', { mode: config.mode, toHash: securityHash(input.to) })
  } catch (error) {
    logSecurityDiagnostic('password-recovery-email-send-failed', error, {
      mode: config.mode,
      toHash: securityHash(input.to)
    })
    throw error
  }
}

export async function readLatestRecoveryEmailPreview() {
  if (process.env.NODE_ENV === 'production') return null
  const dir = join(process.cwd(), 'artifacts', 'password-recovery-emails')
  const files = (await readdir(dir).catch(() => [])).filter((file) => file.endsWith('.json') && file !== 'dev-token-store.json').sort()
  const latest = files.at(-1)
  if (!latest) return null
  const fullPath = join(dir, latest)
  const content = await readFile(fullPath, 'utf8')
  return { path: fullPath, preview: JSON.parse(content) as Record<string, unknown> }
}
