import { createError, getHeader, type H3Event } from 'h3'
import { useRuntimeConfig } from 'nitropack/runtime'
import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto'

interface CaptchaPayload {
  answer: number
  exp: number
  iat: number
  nonce: string
}

const rateBuckets = new Map<string, number[]>()
const CAPTCHA_TTL_MS = 10 * 60 * 1000
const MIN_FORM_SECONDS = 3
const MAX_FORM_MINUTES = 45

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString('base64url')
}

function secret() {
  return String(useRuntimeConfig().sessionSecret || 'change-me-before-production')
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

function verifySignature(payload: string, signature: string) {
  const expected = sign(payload)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

function clientIp(event: H3Event) {
  const forwarded = getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || getHeader(event, 'x-real-ip') || event.node.req.socket.remoteAddress || 'unknown'
}

export function createCaptchaChallenge() {
  const a = randomInt(2, 10)
  const b = randomInt(2, 10)
  const now = Date.now()
  const payload: CaptchaPayload = {
    answer: a + b,
    iat: now,
    exp: now + CAPTCHA_TTL_MS,
    nonce: randomBytes(12).toString('hex')
  }
  const encoded = base64url(JSON.stringify(payload))
  return {
    token: `${encoded}.${sign(encoded)}`,
    question: `${a} + ${b}`,
    expiresAt: payload.exp,
    minSeconds: MIN_FORM_SECONDS
  }
}

export function verifyCaptchaChallenge(token?: string | null, answer?: string | number | null) {
  const raw = String(token || '')
  const [payload, signature] = raw.split('.')
  if (!payload || !signature || !verifySignature(payload, signature)) {
    throw createError({ statusCode: 400, statusMessage: 'La verificación CAPTCHA no es válida.' })
  }

  let decoded: CaptchaPayload
  try {
    decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as CaptchaPayload
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'La verificación CAPTCHA no es válida.' })
  }

  if (Date.now() > decoded.exp) {
    throw createError({ statusCode: 400, statusMessage: 'La verificación CAPTCHA expiró. Intenta de nuevo.' })
  }

  if (Number(answer) !== decoded.answer) {
    throw createError({ statusCode: 400, statusMessage: 'La respuesta CAPTCHA no coincide.' })
  }
}

export function assertRateLimit(key: string, options: { limit: number; windowMs: number; message: string }) {
  const now = Date.now()
  const previous = (rateBuckets.get(key) || []).filter((time) => now - time < options.windowMs)
  if (previous.length >= options.limit) {
    throw createError({ statusCode: 429, statusMessage: options.message })
  }
  previous.push(now)
  rateBuckets.set(key, previous)

  if (rateBuckets.size > 1000) {
    for (const [bucketKey, values] of rateBuckets.entries()) {
      const fresh = values.filter((time) => now - time < options.windowMs)
      if (fresh.length) rateBuckets.set(bucketKey, fresh)
      else rateBuckets.delete(bucketKey)
    }
  }
}

export function assertRegistrationAntibot(event: H3Event, input: {
  captchaToken?: string | null
  captchaAnswer?: string | number | null
  startedAt?: string | number | null
  website?: string | null
  email?: string | null
}) {
  if (String(input.website || '').trim()) {
    throw createError({ statusCode: 400, statusMessage: 'No fue posible validar el registro.' })
  }

  const startedAt = Number(input.startedAt || 0)
  const elapsed = Date.now() - startedAt
  if (!Number.isFinite(startedAt) || elapsed < MIN_FORM_SECONDS * 1000 || elapsed > MAX_FORM_MINUTES * 60 * 1000) {
    throw createError({ statusCode: 400, statusMessage: 'Vuelve a intentar el registro desde el formulario.' })
  }

  verifyCaptchaChallenge(input.captchaToken, input.captchaAnswer)

  const ip = clientIp(event)
  const emailKey = String(input.email || '').trim().toLowerCase() || 'sin-correo'
  assertRateLimit(`daycare-registration:ip:${ip}`, {
    limit: 6,
    windowMs: 15 * 60 * 1000,
    message: 'Demasiados intentos de registro. Intenta de nuevo más tarde.'
  })
  assertRateLimit(`daycare-registration:email:${emailKey}`, {
    limit: 3,
    windowMs: 30 * 60 * 1000,
    message: 'Ya recibimos varios intentos para este correo. Intenta de nuevo más tarde.'
  })
}
