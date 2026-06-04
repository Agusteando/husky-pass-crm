import { createError, defineEventHandler, readBody } from 'h3'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { getRequestURL } from 'h3'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'

const schema = z.object({
  src: z.string().min(64)
})

const allowed = new Set(['jpeg', 'jpg', 'png', 'webp'])

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  const body = schema.parse(await readBody(event))
  const match = /^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/.exec(body.src)
  if (!match || !allowed.has(match[1])) throw createError({ statusCode: 415, statusMessage: 'La imagen debe ser PNG, JPG o WEBP.' })

  const buffer = Buffer.from(match[2], 'base64')
  if (!buffer.length || buffer.length > 1024 * 1024 * 5) {
    throw createError({ statusCode: 413, statusMessage: 'La imagen excede el tamaño permitido.' })
  }

  const ext = match[1] === 'jpeg' ? 'jpg' : match[1]
  const dir = join(process.cwd(), 'public', 'uploads', 'personas-autorizadas', 'sources', String(user.id))
  await mkdir(dir, { recursive: true })
  const fileName = `student-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`
  await writeFile(join(dir, fileName), buffer)
  const relativeUrl = `/uploads/personas-autorizadas/sources/${user.id}/${fileName}`
  const origin = getRequestURL(event).origin

  return {
    ok: true,
    url: relativeUrl,
    absoluteUrl: `${origin}${relativeUrl}`
  }
})
