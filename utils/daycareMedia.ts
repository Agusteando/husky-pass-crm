import type { DaycareMediaAsset, DaycareMediaKind, DaycareMediaMetadata } from '~/types/daycare'

const META_MARKER = 'hpmedia='
const IMAGE_MIMES = new Set(['image/png', 'image/jpeg', 'image/webp'])
const PDF_MIME = 'application/pdf'
const WORD_MIMES = new Set(['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
const SHEET_MIMES = new Set(['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])

function encodeBase64Url(value: string) {
  if (typeof window !== 'undefined') {
    const bytes = new TextEncoder().encode(value)
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  }
  return Buffer.from(value, 'utf8').toString('base64url')
}

function decodeBase64Url(value: string) {
  try {
    if (typeof window !== 'undefined') {
      const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
      const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
      return new TextDecoder().decode(bytes)
    }
    return Buffer.from(value, 'base64url').toString('utf8')
  } catch {
    return ''
  }
}

function cleanMetadata(metadata?: DaycareMediaMetadata | null): DaycareMediaMetadata {
  const cleanText = (value?: string | null, max = 160) => String(value || '').trim().slice(0, max) || null
  const cleanNumber = (value?: number | null, min = 0, max = Number.MAX_SAFE_INTEGER) => {
    const numeric = Number(value)
    return Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : null
  }
  return {
    version: 1,
    name: cleanText(metadata?.name, 140),
    mime: cleanText(metadata?.mime, 90),
    size: cleanNumber(metadata?.size),
    width: cleanNumber(metadata?.width),
    height: cleanNumber(metadata?.height),
    alt: cleanText(metadata?.alt, 160),
    caption: cleanText(metadata?.caption, 180),
    focalX: cleanNumber(metadata?.focalX, 0, 100),
    focalY: cleanNumber(metadata?.focalY, 0, 100)
  }
}

type CompactMetadata = {
  v?: 1
  n?: string | null
  m?: string | null
  s?: number | null
  w?: number | null
  h?: number | null
  a?: string | null
  c?: string | null
  x?: number | null
  y?: number | null
}

function metadataFromPayload(payload: unknown): DaycareMediaMetadata {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return cleanMetadata()
  const value = payload as Record<string, unknown>
  return cleanMetadata({
    version: 1,
    name: String(value.n ?? value.name ?? '') || null,
    mime: String(value.m ?? value.mime ?? '') || null,
    size: Number(value.s ?? value.size) || null,
    width: Number(value.w ?? value.width) || null,
    height: Number(value.h ?? value.height) || null,
    alt: String(value.a ?? value.alt ?? '') || null,
    caption: String(value.c ?? value.caption ?? '') || null,
    focalX: Number.isFinite(Number(value.x ?? value.focalX)) ? Number(value.x ?? value.focalX) : null,
    focalY: Number.isFinite(Number(value.y ?? value.focalY)) ? Number(value.y ?? value.focalY) : null
  })
}

function compactMetadata(metadata: DaycareMediaMetadata): CompactMetadata {
  const compact: CompactMetadata = { v: 1 }
  if (metadata.name) compact.n = metadata.name
  if (metadata.mime) compact.m = metadata.mime
  if (metadata.size) compact.s = metadata.size
  if (metadata.width) compact.w = metadata.width
  if (metadata.height) compact.h = metadata.height
  if (metadata.alt) compact.a = metadata.alt
  if (metadata.caption) compact.c = metadata.caption
  if (metadata.focalX != null && metadata.focalX !== 50) compact.x = metadata.focalX
  if (metadata.focalY != null && metadata.focalY !== 50) compact.y = metadata.focalY
  return compact
}

export function splitDaycareMediaResource(resource?: string | null) {
  const source = String(resource || '').trim()
  if (!source) return { url: '', metadata: {} as DaycareMediaMetadata }
  const markerIndex = source.lastIndexOf(`#${META_MARKER}`)
  if (markerIndex < 0) return { url: source, metadata: {} as DaycareMediaMetadata }
  const url = source.slice(0, markerIndex)
  const encoded = source.slice(markerIndex + META_MARKER.length + 1)
  const decoded = decodeBase64Url(encoded)
  if (!decoded) return { url, metadata: {} as DaycareMediaMetadata }
  try {
    return { url, metadata: metadataFromPayload(JSON.parse(decoded)) }
  } catch {
    return { url, metadata: {} as DaycareMediaMetadata }
  }
}

export function encodeDaycareMediaResource(url?: string | null, metadata?: DaycareMediaMetadata | null) {
  const cleanUrl = splitDaycareMediaResource(url).url
  if (!cleanUrl) return ''
  const clean = cleanMetadata(metadata)
  const hasMetadata = Object.entries(clean).some(([key, value]) => key !== 'version' && value !== null && value !== '')
  if (!hasMetadata) return cleanUrl

  const encode = (value: DaycareMediaMetadata) => `${cleanUrl}#${META_MARKER}${encodeBase64Url(JSON.stringify(compactMetadata(value)))}`
  const full = encode(clean)
  if (full.length <= 255) return full

  const compactFallbacks: DaycareMediaMetadata[] = [
    { ...clean, caption: null },
    { ...clean, caption: null, alt: null },
    { ...clean, caption: null, alt: null, size: null },
    { ...clean, caption: null, alt: null, size: null, width: null, height: null },
    { version: 1, mime: clean.mime, focalX: clean.focalX, focalY: clean.focalY },
    { version: 1, mime: clean.mime }
  ]

  for (const fallback of compactFallbacks) {
    const encoded = encode(fallback)
    if (encoded.length <= 255) return encoded
  }
  return cleanUrl
}

export function daycareMediaUrl(resource?: string | null) {
  return splitDaycareMediaResource(resource).url
}

function extensionFrom(url: string, name?: string | null) {
  const source = String(name || url).split('?')[0].split('#')[0]
  const match = /\.([a-z0-9]{1,8})$/i.exec(source)
  return match?.[1]?.toLowerCase() || ''
}

function nameFromUrl(url: string) {
  try {
    const pathname = new URL(url, 'https://husky-pass.local').pathname
    return decodeURIComponent(pathname.split('/').filter(Boolean).pop() || '')
  } catch {
    return url.split('/').pop()?.split('?')[0] || ''
  }
}

function mimeFromExtension(extension: string) {
  const map: Record<string, string> = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp',
    pdf: PDF_MIME, doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', txt: 'text/plain'
  }
  return map[extension] || ''
}

function kindFrom(mime: string, extension: string): DaycareMediaKind {
  if (IMAGE_MIMES.has(mime) || ['png', 'jpg', 'jpeg', 'webp'].includes(extension)) return 'image'
  if (mime === PDF_MIME || extension === 'pdf') return 'pdf'
  if (SHEET_MIMES.has(mime) || ['xls', 'xlsx'].includes(extension)) return 'spreadsheet'
  if (mime === 'text/plain' || extension === 'txt') return 'text'
  if (WORD_MIMES.has(mime) || ['doc', 'docx'].includes(extension)) return 'document'
  return 'unknown'
}

export function daycareMediaAsset(resource?: string | null): DaycareMediaAsset | null {
  const { url, metadata } = splitDaycareMediaResource(resource)
  if (!url) return null
  const inferredName = nameFromUrl(url)
  const extension = extensionFrom(url, metadata.name)
  const mime = String(metadata.mime || mimeFromExtension(extension)).toLowerCase()
  const width = Number(metadata.width) > 0 ? Number(metadata.width) : null
  const height = Number(metadata.height) > 0 ? Number(metadata.height) : null
  return {
    ...metadata,
    url,
    name: metadata.name || inferredName || 'Archivo',
    mime,
    extension,
    kind: kindFrom(mime, extension),
    width,
    height,
    aspectRatio: width && height ? width / height : null,
    focalX: Number.isFinite(Number(metadata.focalX)) ? Number(metadata.focalX) : 50,
    focalY: Number.isFinite(Number(metadata.focalY)) ? Number(metadata.focalY) : 50
  }
}

export function daycareMediaLabel(resource?: string | null) {
  const asset = daycareMediaAsset(resource)
  if (!asset) return 'Sin archivo'
  if (asset.kind === 'image') return 'Imagen'
  if (asset.kind === 'pdf') return 'PDF'
  if (asset.kind === 'spreadsheet') return 'Hoja de cálculo'
  if (asset.kind === 'text') return 'Texto'
  if (asset.kind === 'document') return 'Documento'
  return 'Archivo'
}

export function formatDaycareMediaSize(value?: number | null) {
  const size = Number(value || 0)
  if (!size) return ''
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / 1024 / 1024).toFixed(size >= 10 * 1024 * 1024 ? 0 : 1)} MB`
}

export function daycareDocumentIcon(kind?: DaycareMediaKind | null) {
  if (kind === 'pdf') return 'pdf'
  if (kind === 'spreadsheet') return 'clipboard'
  if (kind === 'image') return 'camera'
  return 'document'
}
