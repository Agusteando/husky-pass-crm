import type { AuthorizedChild } from '~/types/daycare'

export type CommunicationStatus = 'draft' | 'scheduled' | 'sent'
export type CommunicationPriority = 'normal' | 'important' | 'urgent'
export type CommunicationAudienceKind = 'plantel' | 'grado' | 'grupo' | 'custom'
export type CommunicationAttachmentKind = 'pdf' | 'image' | 'document' | 'spreadsheet' | 'other'

export interface CommunicationAudience {
  kind: CommunicationAudienceKind
  planteles: string[]
  niveles?: string[]
  grados?: string[]
  grupos?: string[]
  label?: string | null
}

export interface CommunicationAttachment {
  id: string
  name: string
  mime: string
  size: number
  url: string
  kind: CommunicationAttachmentKind
  thumbnailUrl?: string | null
  uploadedAt?: string | null
}

export interface SchoolCommunication {
  id: string
  title: string
  summary: string
  body: string
  status: CommunicationStatus
  priority: CommunicationPriority
  audience: CommunicationAudience
  senderName: string
  senderRole: string
  createdAt: string
  updatedAt: string
  sentAt?: string | null
  scheduledFor?: string | null
  attachments: CommunicationAttachment[]
}

export interface FamilyCommunicationItem extends SchoolCommunication {
  audienceLabel: string
  readState: 'unread' | 'read'
}

export interface FamilyCommunicationsResponse {
  items: FamilyCommunicationItem[]
  context: {
    student: AuthorizedChild | null
    audienceLabel: string
  }
  metrics: {
    total: number
    unread: number
    important: number
    withAttachments: number
  }
  state: 'ready' | 'empty' | 'unavailable'
  message?: string
}

export interface AdminCommunicationsResponse {
  rows: SchoolCommunication[]
  metrics: {
    drafts: number
    scheduled: number
    sent: number
    total: number
  }
  options: {
    planteles: string[]
    niveles: string[]
    grados: string[]
    grupos: string[]
  }
}

export interface SaveCommunicationInput {
  id?: string
  title: string
  summary: string
  body: string
  status: CommunicationStatus
  priority: CommunicationPriority
  audience: CommunicationAudience
  scheduledFor?: string | null
  attachments: CommunicationAttachment[]
}
