export type DaycareResourceRoute = 'tareas' | 'circulares' | 'calendario'
export type DaycareResourceType = 'hw' | 'news' | 'cal'

export const daycareResourceMap: Record<DaycareResourceRoute, DaycareResourceType> = {
  tareas: 'hw',
  circulares: 'news',
  calendario: 'cal'
}

export const daycareResourceLabels: Record<DaycareResourceRoute, string> = {
  tareas: 'Tareas',
  circulares: 'Circulares',
  calendario: 'Calendario'
}

export function isDaycareResourceRoute(value: string): value is DaycareResourceRoute {
  return value === 'tareas' || value === 'circulares' || value === 'calendario'
}

export function formatDate(value?: string | Date | null, fallback = 'Sin fecha') {
  if (!value) return fallback
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime()) || date.getFullYear() < 2000) return fallback
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

export function formatCalendarDay(value?: string | Date | null) {
  if (!value) return { day: '—', weekday: '', month: '' }
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return { day: '—', weekday: '', month: '' }
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

export function legacyPdfViewerUrl(resource?: string | null) {
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

export function qrPaUrl(id?: number | string | null) {
  return id ? `https://admin.casitaiedis.edu.mx/qrPA/${id}` : ''
}

export function printablePaUrl(id?: number | string | null) {
  return id ? `https://admin.casitaiedis.edu.mx/printable/${id}` : ''
}
