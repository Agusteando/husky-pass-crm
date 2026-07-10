import { $fetch } from 'ofetch'
import { extname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { useRuntimeConfig } from 'nitropack/runtime'
import { publicError } from '~/server/utils/httpError'

export interface UploadInputFile {
  data: Buffer | Uint8Array
  filename?: string | null
  type?: string | null
}

export interface ExternalUploadResult {
  ok: true
  filename: string
  storedFilename: string
  size: number
  mime: string
  url: string
  absoluteUrl: string
  path?: string
}

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])
const DOCUMENT_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain'
])
const SVG_TYPE = 'image/svg+xml'
const DEFAULT_UPLOAD_ENDPOINT = 'https://expediente.casitaapps.com/upload.ashx'
const EXTERNAL_UPLOAD_FOLDER = 'virtual'

function cleanSegment(value?: string | number | null) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

function extensionFrom(filename?: string | null) {
  const extension = extname(String(filename || '')).toLowerCase().replace(/[^a-z0-9.]/g, '')
  return extension && extension.length <= 12 ? extension : ''
}

type AcceptedUpload = 'images' | 'documents' | 'imagesAndDocuments' | 'svg'

function assertMime(mime: string, accept: AcceptedUpload) {
  const normalized = mime.toLowerCase()
  const isImage = IMAGE_TYPES.has(normalized)
  const isDocument = DOCUMENT_TYPES.has(normalized)
  if (accept === 'images' && isImage) return
  if (accept === 'documents' && isDocument) return
  if (accept === 'imagesAndDocuments' && (isImage || isDocument)) return
  if (accept === 'svg' && normalized === SVG_TYPE) return
  throw publicError(415, 'Tipo de archivo no permitido.')
}

function assertFile(input: UploadInputFile, options: { maxBytes: number; accept: AcceptedUpload }) {
  const size = input.data?.byteLength || 0
  if (!size) throw publicError(400, 'Selecciona un archivo para subir.')
  if (size > options.maxBytes) {
    const mb = Math.round(options.maxBytes / 1024 / 1024)
    throw publicError(413, `El archivo excede ${mb} MB.`)
  }
  const mime = String(input.type || 'application/octet-stream').toLowerCase()
  assertMime(mime, options.accept)
  return { size, mime }
}

function uploadEndpoint() {
  const configured = String(useRuntimeConfig().externalUpload?.url || '').trim()
  try {
    const endpoint = new URL(configured || DEFAULT_UPLOAD_ENDPOINT)
    if (!endpoint.pathname || endpoint.pathname === '/') endpoint.pathname = '/upload.ashx'
    return endpoint.toString()
  } catch {
    throw publicError(500, 'El servicio de carga no está configurado correctamente.')
  }
}

export async function uploadToExternalService(input: UploadInputFile, options: {
  maxBytes: number
  accept: AcceptedUpload
  filenamePrefix?: string
}): Promise<ExternalUploadResult> {
  const { size, mime } = assertFile(input, options)
  const originalName = String(input.filename || '').trim()
  const extension = extensionFrom(originalName)
  const safePrefix = cleanSegment(options.filenamePrefix) || 'archivo'
  const fileName = `${safePrefix}-${Date.now()}-${randomUUID().slice(0, 8)}${extension}`

  const bytes = input.data instanceof Uint8Array ? input.data : new Uint8Array(input.data)
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  const body = new FormData()
  body.append('file', new Blob([arrayBuffer], { type: mime }), fileName)
  body.append('folder', EXTERNAL_UPLOAD_FOLDER)
  body.append('includeUrl', '1')

  let response: { success?: boolean; url?: string; path?: string; fileName?: string }
  try {
    response = await $fetch<{ success?: boolean; url?: string; path?: string; fileName?: string }>(uploadEndpoint(), {
      method: 'POST',
      body,
      query: { includeUrl: '1' },
      timeout: 30000
    })

  } catch {
    throw publicError(502, 'No fue posible subir el archivo al expediente externo.')
  }

  const responsePath = String(response?.path || '')
  if (!response?.success || !response.url || !/^https?:\/\//i.test(response.url) || !responsePath.startsWith(`/${EXTERNAL_UPLOAD_FOLDER}/`)) {
    throw publicError(502, 'El servicio de carga no devolvió una URL válida.')
  }

  return {
    ok: true,
    filename: originalName || fileName,
    storedFilename: response.fileName || fileName,
    size,
    mime,
    url: response.url,
    absoluteUrl: response.url,
    path: responsePath
  }
}

export function dataUrlToUploadFile(src: string, filenamePrefix: string): UploadInputFile {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(src || ''))
  if (!match) throw publicError(415, 'La imagen debe ser PNG, JPG o WEBP.')
  const ext = match[1] === 'image/jpeg' ? 'jpg' : match[1].split('/')[1]
  return {
    data: Buffer.from(match[2], 'base64'),
    filename: `${cleanSegment(filenamePrefix) || 'imagen'}.${ext}`,
    type: match[1]
  }
}
