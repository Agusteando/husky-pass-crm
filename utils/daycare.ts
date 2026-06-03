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
  if (Number.isNaN(date.getTime())) return fallback
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

export function isImageResource(resource?: string | null) {
  return Boolean(resource && /\.(png|jpe?g|webp)$/i.test(resource))
}

export function isPdfResource(resource?: string | null) {
  return Boolean(resource && /\.pdf(\?|#|$)/i.test(resource))
}

export function stripHtml(value?: string | null) {
  return (value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
