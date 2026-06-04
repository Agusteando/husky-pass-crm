export function parseLegacyDate(value?: string | Date | null) {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

  const source = String(value).trim()
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(source)
  if (dateOnly) {
    const [, year, month, day] = dateOnly
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  const normalized = source.includes(' ') ? source.replace(' ', 'T') : source
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value?: string | Date | null, fallback = 'Sin fecha') {
  const date = parseLegacyDate(value)
  if (!date || date.getFullYear() < 2000) return fallback
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

export function formatCalendarDay(value?: string | Date | null) {
  const date = parseLegacyDate(value)
  if (!date) return { day: '—', weekday: '', month: '' }
  return {
    day: new Intl.DateTimeFormat('es-MX', { day: '2-digit' }).format(date),
    weekday: new Intl.DateTimeFormat('es-MX', { weekday: 'long' }).format(date),
    month: new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(date)
  }
}

export function isImageResource(resource?: string | null) {
  return Boolean(resource && /\.(png|jpe?g|webp)(\?|#|$)/i.test(resource))
}

export function isPdfResource(resource?: string | null) {
  return Boolean(resource && /\.pdf(\?|#|$)/i.test(resource))
}

export function stripHtml(value?: string | null) {
  return (value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function publishedPdfViewerUrl(resource?: string | null) {
  if (!resource) return ''
  const fileName = resource.split('/').pop()?.split('#')[0]?.split('?')[0]
  if (!fileName) return resource
  return `https://admin.casitaiedis.edu.mx/pdfjs/web/viewer.html?file=${encodeURIComponent(`/virtual/${fileName}`)}`
}

export function normalizeVirtualAssetUrl(url?: string | null) {
  if (!url) return ''
  return String(url).replace(/^https:\/\/casitaiedis\.edu\.mx\/virtual\//, 'https://admin.casitaiedis.edu.mx/virtual/')
}

export function authorizedPersonLabel(indice: number) {
  return indice === 4 ? 'Pase Express' : `Persona ${indice}`
}

export function appAbsoluteUrl(path: string) {
  if (typeof window === 'undefined') return path
  return `${window.location.origin}${path}`
}

export function authorizedPersonValidationPath(id?: number | string | null) {
  return id ? `/validar/persona-autorizada/${id}` : ''
}

export function authorizedPersonQrPath(id?: number | string | null) {
  return id ? `/familia/personas-autorizadas/${id}/qr` : ''
}

export function authorizedPersonCredentialPath(id?: number | string | null) {
  return id ? `/familia/personas-autorizadas/${id}/credencial` : ''
}

export function authorizedPersonPrintPath(id?: number | string | null) {
  return id ? `/familia/personas-autorizadas/${id}/imprimir` : ''
}

export function isHiddenResource(value: unknown) {
  return value === true || value === 1 || String(value) === '1' || String(value).toLowerCase() === 'hidden'
}

export function daycareResourceTypeLabel(type?: string | null) {
  if (type === 'hw') return 'Tarea'
  if (type === 'news') return 'Aviso'
  if (type === 'cal') return 'Evento'
  return 'Contenido'
}

export function daycareResourceSection(type?: string | null) {
  if (type === 'hw') return 'tareas'
  if (type === 'news') return 'avisos'
  if (type === 'cal') return 'calendario'
  return ''
}
