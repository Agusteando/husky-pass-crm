import { createError, defineEventHandler, readBody } from 'h3'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { logPersonasDiagnostic } from '~/server/utils/personasDiagnostics'

const schema = z.object({
  src: z.string().min(32),
  personaId: z.number().int().positive().optional().nullable()
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  try {
    const body = schema.parse(await readBody(event))
    const match = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(body.src)
    if (!match) throw createError({ statusCode: 415, statusMessage: 'La imagen debe ser PNG.' })

    const buffer = Buffer.from(match[1], 'base64')
    if (!buffer.length || buffer.length > 1024 * 1024 * 2) {
      throw createError({ statusCode: 413, statusMessage: 'La imagen excede el tamaño permitido.' })
    }

    const dir = join(process.cwd(), 'public', 'uploads', 'personas-autorizadas', 'faces', String(user.id))
    await mkdir(dir, { recursive: true })
    const fileName = `${body.personaId || 'new'}-${Date.now()}-${randomUUID().slice(0, 8)}.png`
    await writeFile(join(dir, fileName), buffer)

    return {
      ok: true,
      url: `/uploads/personas-autorizadas/faces/${user.id}/${fileName}`
    }
  } catch (error) {
    logPersonasDiagnostic('face-image-api-store', error, { userId: user.id, username: user.username })
    throw error
  }
})
