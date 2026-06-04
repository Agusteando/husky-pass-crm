import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import { mkdir, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_MIME_PREFIXES = ['image/', 'application/pdf']
const ALLOWED_MIME_TYPES = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
])

function safeExtension(filename?: string | null) {
  const extension = extname(String(filename || '')).toLowerCase().replace(/[^a-z0-9.]/g, '')
  return extension && extension.length <= 12 ? extension : ''
}

function assertAllowedMime(type?: string | null) {
  const mime = String(type || '').toLowerCase()
  if (ALLOWED_MIME_TYPES.has(mime) || ALLOWED_MIME_PREFIXES.some((prefix) => mime.startsWith(prefix))) return
  throw createError({ statusCode: 415, statusMessage: 'Tipo de archivo no permitido para Personas Autorizadas.' })
}

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) throw createError({ statusCode: 403, statusMessage: 'Solo superadmin puede subir archivos.' })

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find((part) => part.name === 'file' && part.data?.length)
  if (!filePart?.data?.length) throw createError({ statusCode: 400, statusMessage: 'Selecciona un archivo para subir.' })
  if (filePart.data.length > MAX_FILE_SIZE) throw createError({ statusCode: 413, statusMessage: 'El archivo excede 10 MB.' })
  assertAllowedMime(filePart.type)

  const extension = safeExtension(filePart.filename)
  const directory = join(process.cwd(), 'public', 'uploads', 'personas-autorizadas', 'resources')
  const filename = `${Date.now()}-${randomUUID()}${extension}`
  await mkdir(directory, { recursive: true })
  await writeFile(join(directory, filename), filePart.data)

  return {
    ok: true,
    filename: filePart.filename || filename,
    storedFilename: filename,
    size: filePart.data.length,
    mime: filePart.type || 'application/octet-stream',
    url: `/uploads/personas-autorizadas/resources/${filename}`
  }
})
