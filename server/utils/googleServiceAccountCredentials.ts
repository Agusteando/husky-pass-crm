import { existsSync, readFileSync } from 'node:fs'
import { useRuntimeConfig } from 'nitropack/runtime'

type CredentialDocument = {
  client_email?: unknown
  private_key?: unknown
  type?: unknown
}

type CredentialCandidate = {
  source: string
  value: unknown
}

export type GoogleServiceAccountCredentials = {
  email: string
  privateKey: string
  source: string
}

export class GoogleServiceAccountConfigurationError extends Error {
  missing: string[]

  constructor(message: string, missing: string[] = []) {
    super(message)
    this.name = 'GoogleServiceAccountConfigurationError'
    this.missing = missing
  }
}

function normalizeEmail(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

function normalizePrivateKey(value: unknown) {
  return String(value || '').trim().replace(/\\n/g, '\n')
}

function decodeBase64(value: string) {
  try {
    return Buffer.from(value, 'base64').toString('utf8').trim()
  } catch {
    return ''
  }
}

function parseCredentialDocument(raw: unknown): CredentialDocument | null {
  const initial = String(raw || '').trim()
  if (!initial) return null

  const queue = [initial]
  const seen = new Set<string>()

  while (queue.length) {
    const candidate = String(queue.shift() || '').trim()
    if (!candidate || seen.has(candidate)) continue
    seen.add(candidate)

    try {
      const parsed = JSON.parse(candidate) as CredentialDocument | string
      if (typeof parsed === 'string') {
        queue.push(parsed)
      } else if (parsed && typeof parsed === 'object') {
        return parsed
      }
    } catch {
      // Try an encoded representation below.
    }

    const decoded = decodeBase64(candidate)
    if (decoded && decoded !== candidate && (decoded.startsWith('{') || decoded.startsWith('"{'))) {
      queue.push(decoded)
    }
  }

  return null
}

function readCredentialFile(pathValue: unknown): CredentialDocument | null {
  const path = String(pathValue || '').trim()
  if (!path || !existsSync(path)) return null
  try {
    return parseCredentialDocument(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

function credentialDocumentCandidates(): CredentialCandidate[] {
  return [
    { source: 'GOOGLE_SERVICE_ACCOUNT_JSON', value: process.env.GOOGLE_SERVICE_ACCOUNT_JSON },
    { source: 'GOOGLE_SERVICE_ACCOUNT_JSON_BASE64', value: process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 },
    { source: 'GOOGLE_SERVICE_ACCOUNT_CREDENTIALS', value: process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS },
    { source: 'GOOGLE_SERVICE_ACCOUNT', value: process.env.GOOGLE_SERVICE_ACCOUNT },
    { source: 'GOOGLE_CREDENTIALS', value: process.env.GOOGLE_CREDENTIALS },
    { source: 'GOOGLE_CREDENTIALS_JSON', value: process.env.GOOGLE_CREDENTIALS_JSON },
    { source: 'GOOGLE_CREDENTIALS_BASE64', value: process.env.GOOGLE_CREDENTIALS_BASE64 },
    { source: 'GOOGLE_APPLICATION_CREDENTIALS_JSON', value: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON },
    { source: 'GOOGLE_APPLICATION_CREDENTIALS_BASE64', value: process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64 },
    { source: 'GCP_SERVICE_ACCOUNT_JSON', value: process.env.GCP_SERVICE_ACCOUNT_JSON },
    { source: 'GCP_SERVICE_ACCOUNT_CREDENTIALS', value: process.env.GCP_SERVICE_ACCOUNT_CREDENTIALS },
    { source: 'GOOGLE_SERVICE_ACCOUNT_KEY', value: process.env.GOOGLE_SERVICE_ACCOUNT_KEY }
  ]
}

function firstCredentialDocument() {
  for (const candidate of credentialDocumentCandidates()) {
    const document = parseCredentialDocument(candidate.value)
    if (document) return { document, source: candidate.source }
  }

  // GOOGLE_APPLICATION_CREDENTIALS is normally a path, but some deployments
  // store the JSON (or its base64 representation) directly in the variable.
  const applicationCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS
  const inlineDocument = parseCredentialDocument(applicationCredentials)
  if (inlineDocument) return { document: inlineDocument, source: 'GOOGLE_APPLICATION_CREDENTIALS:inline' }

  const fileDocument = readCredentialFile(applicationCredentials)
  if (fileDocument) return { document: fileDocument, source: 'GOOGLE_APPLICATION_CREDENTIALS:file' }

  return null
}

function decodePrivateKeyBase64(...values: unknown[]) {
  for (const value of values) {
    const decoded = decodeBase64(String(value || '').trim())
    if (/-----BEGIN PRIVATE KEY-----/.test(decoded)) return decoded
  }
  return ''
}

function firstValue(candidates: CredentialCandidate[]) {
  for (const candidate of candidates) {
    const value = String(candidate.value || '').trim()
    if (value) return { value, source: candidate.source }
  }
  return { value: '', source: '' }
}

export function resolveGoogleServiceAccountCredentials(): GoogleServiceAccountCredentials {
  const config = useRuntimeConfig()
  const recovery = config.passwordRecovery || {}
  const credentialDocument = firstCredentialDocument()

  // Accept a complete service-account JSON accidentally pasted into the
  // private-key variable. This is common in Vercel migrations.
  const privateKeyVariable = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || recovery.googleServiceAccountPrivateKey
  const privateKeyDocument = parseCredentialDocument(privateKeyVariable)
  const document = credentialDocument?.document || privateKeyDocument
  const documentSource = credentialDocument?.source || (privateKeyDocument ? 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY:json' : '')

  const directEmail = firstValue([
    { source: 'GOOGLE_SERVICE_ACCOUNT_EMAIL', value: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL },
    { source: 'GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL', value: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL },
    { source: 'GOOGLE_CLIENT_EMAIL', value: process.env.GOOGLE_CLIENT_EMAIL },
    { source: 'GOOGLE_CLOUD_SERVICE_ACCOUNT_EMAIL', value: process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_EMAIL },
    { source: 'GCP_SERVICE_ACCOUNT_EMAIL', value: process.env.GCP_SERVICE_ACCOUNT_EMAIL },
    { source: 'GCLOUD_SERVICE_ACCOUNT_EMAIL', value: process.env.GCLOUD_SERVICE_ACCOUNT_EMAIL },
    { source: 'runtimeConfig.passwordRecovery.googleServiceAccountEmail', value: recovery.googleServiceAccountEmail }
  ])

  const directPrivateKey = firstValue([
    { source: 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY', value: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY },
    { source: 'GOOGLE_PRIVATE_KEY', value: process.env.GOOGLE_PRIVATE_KEY },
    { source: 'GOOGLE_CLOUD_PRIVATE_KEY', value: process.env.GOOGLE_CLOUD_PRIVATE_KEY },
    { source: 'GCP_SERVICE_ACCOUNT_PRIVATE_KEY', value: process.env.GCP_SERVICE_ACCOUNT_PRIVATE_KEY },
    { source: 'runtimeConfig.passwordRecovery.googleServiceAccountPrivateKey', value: recovery.googleServiceAccountPrivateKey }
  ])

  const encodedPrivateKey = decodePrivateKeyBase64(
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64,
    process.env.GOOGLE_PRIVATE_KEY_BASE64,
    process.env.GCP_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64
  )

  const email = normalizeEmail(document?.client_email || directEmail.value)
  const privateKey = normalizePrivateKey(document?.private_key || directPrivateKey.value || encodedPrivateKey)
  const source = documentSource || [directEmail.source, directPrivateKey.source].filter(Boolean).join('+') || (encodedPrivateKey ? 'private-key-base64' : 'unconfigured')

  return { email, privateKey, source }
}

export function assertGoogleServiceAccountCredentials(credentials: GoogleServiceAccountCredentials) {
  const missing: string[] = []
  if (!credentials.email) missing.push('service-account client_email')
  if (!credentials.privateKey) missing.push('service-account private_key')

  if (missing.length) {
    throw new GoogleServiceAccountConfigurationError(
      `Missing Google service-account configuration: ${missing.join(', ')}`,
      missing
    )
  }

  if (!/^[^@\s]+@[^@\s]+\.gserviceaccount\.com$/i.test(credentials.email)) {
    throw new GoogleServiceAccountConfigurationError('Google service-account client_email is invalid.')
  }

  if (!/-----BEGIN PRIVATE KEY-----/.test(credentials.privateKey) || !/-----END PRIVATE KEY-----/.test(credentials.privateKey)) {
    throw new GoogleServiceAccountConfigurationError('Google service-account private_key is malformed.')
  }
}
