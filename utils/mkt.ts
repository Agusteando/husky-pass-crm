import type { MktLeadSummary, MktStage } from '~/types/mkt'

export const MKT_STAGE_META: Record<MktStage, { label: string; short: string; description: string; tone: string }> = {
  'Leads Entrantes': { label: 'Leads entrantes', short: 'Entrantes', description: 'Aún sin contacto registrado', tone: 'lime' },
  'Primer contacto': { label: 'Primer contacto', short: 'Contacto', description: 'Conversación iniciada', tone: 'blue' },
  'Discusión': { label: 'Discusión', short: 'Discusión', description: 'La familia está evaluando opciones', tone: 'yellow' },
  'Negociación': { label: 'Negociación', short: 'Negociación', description: 'Propuesta, decisión y cierre', tone: 'coral' },
  'Inscrito': { label: 'Inscrito', short: 'Inscrito', description: 'Conversión confirmada', tone: 'teal' }
}

export type MktAmbassadorTheme = 'daycare' | 'preescolar' | 'primaria' | 'secundaria'

export const MKT_AMBASSADORS: Record<MktAmbassadorTheme, { name: string; src: string }> = {
  daycare: { name: 'Sunny', src: '/personas-autorizadas/ambassadors/daycare-sunny.png' },
  preescolar: { name: 'Joy', src: '/personas-autorizadas/ambassadors/preescolar-joy.png' },
  primaria: { name: 'Brave', src: '/personas-autorizadas/ambassadors/primaria-brave.png' },
  secundaria: { name: 'Hope', src: '/personas-autorizadas/ambassadors/secundaria-hope.png' }
}

export function mktChannelLabel(value: string | null | undefined) {
  const raw = String(value ?? '').trim()
  const normalized = raw.toLocaleLowerCase('es-MX')
  if (!normalized || normalized === 'no reporta vía de informe' || normalized === 'no reporta via de informe') return 'Sin vía registrada'
  if (normalized === 'whatsapp') return 'WhatsApp'
  if (normalized === 'redes sociales') return 'Redes sociales'
  if (normalized === 'vía telefónica' || normalized === 'via telefonica') return 'Vía telefónica'
  if (normalized === 'sitio web') return 'Sitio web'
  return raw.charAt(0).toLocaleUpperCase('es-MX') + raw.slice(1)
}

export function mktPlantelLevel(plantel: string | null | undefined, level?: string | null): MktAmbassadorTheme {
  const code = String(plantel ?? '').trim().toUpperCase()
  const normalizedLevel = String(level ?? '').trim().toLocaleLowerCase('es-MX')
  if (code === 'PM' || code === 'PT' || normalizedLevel.includes('primaria')) return 'primaria'
  if (code === 'SM' || code === 'ST' || normalizedLevel.includes('secundaria') || normalizedLevel.includes('bachiller')) return 'secundaria'
  if (code === 'GM' || normalizedLevel.includes('guardería') || normalizedLevel.includes('guarderia')) return 'daycare'
  return 'preescolar'
}

export function mktPlantelDisplay(plantel: string | null | undefined, level?: string | null) {
  const code = String(plantel ?? '').trim().toUpperCase()
  const theme = mktPlantelLevel(code, level)
  const levelLabel = theme === 'daycare' ? 'Guardería' : theme.charAt(0).toLocaleUpperCase('es-MX') + theme.slice(1)
  return code ? `${levelLabel} · ${code}` : levelLabel
}

export function mktAmbassadorForLead(lead: Pick<MktLeadSummary, 'plantel' | 'level'>) {
  return MKT_AMBASSADORS[mktPlantelLevel(lead.plantel, lead.level)]
}

export function mktLeadActivityDate(lead: Pick<MktLeadSummary, 'createdAt' | 'lastFollowUpAt'>) {
  return lead.lastFollowUpAt || lead.createdAt
}

export function mktDaysSince(value: string | null | undefined, now = new Date()) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / 86400000))
}

export function mktLeadAttention(lead: MktLeadSummary) {
  if (lead.stage === 'Inscrito') return { key: 'converted', label: 'Inscrito', tone: 'success', priority: 0 }
  if (lead.stage === 'Leads Entrantes') return { key: 'uncontacted', label: 'Sin contacto', tone: 'urgent', priority: 3 }
  const days = mktDaysSince(mktLeadActivityDate(lead))
  if (days !== null && days >= 14) return { key: 'cold', label: `${days} días sin actividad`, tone: 'urgent', priority: 3 }
  if (days !== null && days >= 7) return { key: 'stale', label: `${days} días sin actividad`, tone: 'warning', priority: 2 }
  if (lead.stage === 'Negociación') return { key: 'negotiating', label: 'Cierre activo', tone: 'active', priority: 2 }
  if (days === 0) return { key: 'today', label: 'Actividad hoy', tone: 'fresh', priority: 1 }
  return { key: 'active', label: days === 1 ? 'Actividad ayer' : days !== null ? `Actividad hace ${days} días` : 'En seguimiento', tone: 'neutral', priority: 1 }
}

export function mktRelativeDate(value: string | null | undefined, long = false) {
  if (!value) return 'Sin actividad'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)
  const days = mktDaysSince(value)
  if (!long) {
    if (days === 0) return 'Hoy'
    if (days === 1) return 'Ayer'
    if (days !== null && days < 7) return `Hace ${days} días`
  }
  return new Intl.DateTimeFormat('es-MX', long
    ? { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }
    : { day: 'numeric', month: 'short' }
  ).format(date)
}

export function mktPhoneDigits(value: string | null | undefined) {
  return String(value ?? '').replace(/\D/g, '')
}

export function mktWhatsAppHref(value: string | null | undefined) {
  const digits = mktPhoneDigits(value)
  if (!digits) return ''
  const international = digits.length === 10 ? `52${digits}` : digits
  return `https://wa.me/${international}`
}
