export const MKT_STAGES = ['Leads Entrantes', 'Primer contacto', 'Discusión', 'Negociación', 'Inscrito'] as const
export type MktStage = typeof MKT_STAGES[number]

export const MKT_CHANNELS = ['whatsapp', 'redes sociales', 'presencial', 'vía telefónica', 'sitio web', 'recomendación', 'otro'] as const
export type MktChannel = typeof MKT_CHANNELS[number]

export interface MktLeadSummary {
  id: number
  folio: string
  createdAt: string | null
  channel: string
  plantel: string
  campus: string
  contactName: string
  phone: string
  email: string
  studentName: string
  level: string
  grade: string
  enrolled: boolean
  stage: MktStage
  lastFollowUpAt: string | null
  lastFollowUp: string
  followUpCount: number
}

export interface MktFollowUp {
  id: number
  folio: string
  note: string
  stage: MktStage
  createdAt: string | null
  pending?: boolean
}

export interface MktStudentInterest {
  id: number
  fullName: string
  firstName: string
  paternalSurname: string
  maternalSurname: string
  level: string
  grade: string
  birthDate: string | null
  enrolled: boolean
}

export interface MktContactRecord {
  name: string
  email: string
  phone: string
  address: string
  source: string
}

export interface MktLeadDetail extends MktLeadSummary {
  father: MktContactRecord
  mother: MktContactRecord
  students: MktStudentInterest[]
  followUps: MktFollowUp[]
}

export interface MktLeadFilters {
  search?: string
  stage?: string
  channel?: string
  plantel?: string
  from?: string
  to?: string
  attention?: string
  limit?: number
}

export interface MktLeadsResponse {
  leads: MktLeadSummary[]
  total: number
  filters: Required<Omit<MktLeadFilters, 'limit'>> & { limit: number }
  summary: {
    total: number
    uncontacted: number
    negotiating: number
    enrolled: number
    stageCounts: Record<MktStage, number>
  }
  options: {
    channels: string[]
    planteles: string[]
    stages: MktStage[]
  }
}

export interface MktOverviewResponse {
  generatedAt: string
  metrics: {
    totalLeads: number
    newThisWeek: number
    pendingContact: number
    followUpsToday: number
    enrolled: number
    staleLeads: number
    conversionRate: number
    averageFirstResponseHours: number | null
  }
  stageBreakdown: Array<{ stage: MktStage; count: number }>
  channelBreakdown: Array<{ channel: string; count: number }>
  weeklyChannels: Array<{ channel: string; days: number[]; total: number }>
  recentLeads: MktLeadSummary[]
  attentionLeads: MktLeadSummary[]
  journal: {
    completedToday: boolean
    achievements: string
    activities: string
  }
}

export interface MktJournalEntry {
  id: number | null
  uid: string
  date: string
  achievements: string
  activities: string
  content: string
  comments: string
  feedback: string
  completed: boolean
}

export interface MktJournalResponse {
  entry: MktJournalEntry
  recent: MktJournalEntry[]
}

export interface CreateMktLeadInput {
  plantel: string
  campus?: string
  channel: string
  relationship: 'madre' | 'padre' | 'otro'
  contactName: string
  email?: string
  phone?: string
  address?: string
  source?: string
  studentName: string
  level: string
  grade?: string
  birthDate?: string
  enrolled?: boolean
  initialNote?: string
}

export interface UpdateMktStudentInput {
  id?: number
  fullName: string
  level: string
  grade?: string
  birthDate?: string
  enrolled?: boolean
}

export interface UpdateMktLeadInput {
  plantel: string
  campus?: string
  channel: string
  father: MktContactRecord
  mother: MktContactRecord
  students: UpdateMktStudentInput[]
}

export interface MktAnalyticsFilters {
  from: string
  to: string
}

export interface MktAnalyticsResponse {
  generatedAt: string
  period: MktAnalyticsFilters
  metrics: {
    total: number
    contacted: number
    converted: number
    conversionRate: number
    averageFirstResponseHours: number | null
    averageFollowUps: number
  }
  stageBreakdown: Array<{ stage: MktStage; count: number; percentage: number }>
  weeklyTrend: Array<{ weekStart: string; label: string; leads: number; followUps: number; converted: number }>
  channels: Array<{ channel: string; leads: number; contacted: number; converted: number; conversionRate: number }>
  planteles: Array<{ plantel: string; leads: number; contacted: number; converted: number; conversionRate: number }>
}
