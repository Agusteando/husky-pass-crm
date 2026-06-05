import { createError } from 'h3'
import { $fetch } from 'ofetch'
import { extname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { useRuntimeConfig } from 'nitropack/runtime'

type UploadArea = 'daycare-registration' | 'daycare-resource' | 'personas-source' | 'personas-face' | 'personas-resource'

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

const AREA_ROOTS: Record<UploadArea, string> = {
  'daycare-registration': 'husky-pass/daycare/registro',
  'daycare-resource': 'husky-pass/daycare/recursos',
  'personas-source': 'husky-pass/personas-autorizadas/fuentes',
  'personas-face': 'husky-pass/personas-autorizadas/rostros',
  'personas-resource': 'husky-pass/personas-autorizadas/recursos'
}

function cleanSegment(value?: string | number | null) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

export function externalUploadFolder(area: UploadArea, ...segments: Array<string | number | null | undefined>) {
  const root = AREA_ROOTS[area]
  const safeSegments = segments.map(cleanSegment).filter(Boolean)
  const folder = [root, ...safeSegments].join('/')
  if (!/^[a-z0-9][a-z0-9/_-]{0,160}$/i.test(folder) || folder.includes('..')) {
    throw createError({ statusCode: 400, statusMessage: 'Destino de carga no válido.' })
  }
  return folder
}

function extensionFrom(filename?: string | null) {
  const extension = extname(String(filename || '')).toLowerCase().replace(/[^a-z0-9.]/g, '')
  return extension && extension.length <= 12 ? extension : ''
}

function assertMime(mime: string, accept: 'images' | 'documents' | 'imagesAndDocuments') {
  const normalized = mime.toLowerCase()
  const isImage = IMAGE_TYPES.has(normalized)
  const isDocument = DOCUMENT_TYPES.has(normalized)
  if (accept === 'images' && isImage) return
  if (accept === 'documents' && isDocument) return
  if (accept === 'imagesAndDocuments' && (isImage || isDocument)) return
  throw createError({ statusCode: 415, statusMessage: 'Tipo de archivo no permitido.' })
}

function assertFile(input: UploadInputFile, options: { maxBytes: number; accept: 'images' | 'documents' | 'imagesAndDocuments' }) {
  const size = input.data?.byteLength || 0
  if (!size) throw createError({ statusCode: 400, statusMessage: 'Selecciona un archivo para subir.' })
  if (size > options.maxBytes) {
    const mb = Math.round(options.maxBytes / 1024 / 1024)
    throw createError({ statusCode: 413, statusMessage: `El archivo excede ${mb} MB.` })
  }
  const mime = String(input.type || 'application/octet-stream').toLowerCase()
  assertMime(mime, options.accept)
  return { size, mime }
}

function uploadEndpoint() {
  const configured = String(useRuntimeConfig().externalUpload?.url || '').trim()
  return configured || 'https://expediente.casitaapps.com'
}

export async function uploadToExternalService(input: UploadInputFile, options: {
  folder: string
  maxBytes: number
  accept: 'images' | 'documents' | 'imagesAndDocuments'
  filenamePrefix?: string
}): Promise<ExternalUploadResult> {
  const { size, mime } = assertFile(input, options)
  const originalName = String(input.filename || '').trim()
  const extension = extensionFrom(originalName)
  const safePrefix = cleanSegment(options.filenamePrefix) || 'archivo'
  const fileName = `${safePrefix}-${Date.now()}-${randomUUID().slice(0, 8)}${extension}`
  const folder = options.folder
  if (!/^[a-z0-9][a-z0-9/_-]{0,160}$/i.test(folder) || folder.includes('..')) {
    throw createError({ statusCode: 400, statusMessage: 'Destino de carga no válido.' })
  }

  const bytes = input.data instanceof Uint8Array ? input.data : new Uint8Array(input.data)
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  const body = new FormData()
  body.append('file', new Blob([arrayBuffer], { type: mime }), fileName)
  body.append('folder', folder)
  body.append('includeUrl', '1')

  try {
    const response = await $fetch<{ success?: boolean; url?: string; path?: string; fileName?: string }>(uploadEndpoint(), {
      method: 'POST',
      body,
      query: { includeUrl: '1' },
      timeout: 30000
    })

    if (!response?.success || !response.url || !/^https?:\/\//i.test(response.url)) {
      throw createError({ statusCode: 502, statusMessage: 'El servicio de carga no devolvió una URL válida.' })
    }

    return {
      ok: true,
      filename: originalName || fileName,
      storedFilename: response.fileName || fileName,
      size,
      mime,
      url: response.url,
      absoluteUrl: response.url,
      path: response.path
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    throw createError({ statusCode: 502, statusMessage: 'No fue posible subir el archivo al expediente externo.' })
  }
}

export function dataUrlToUploadFile(src: string, filenamePrefix: string): UploadInputFile {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(src || ''))
  if (!match) throw createError({ statusCode: 415, statusMessage: 'La imagen debe ser PNG, JPG o WEBP.' })
  const ext = match[1] === 'image/jpeg' ? 'jpg' : match[1].split('/')[1]
  return {
    data: Buffer.from(match[2], 'base64'),
    filename: `${cleanSegment(filenamePrefix) || 'imagen'}.${ext}`,
    type: match[1]
  }
}
