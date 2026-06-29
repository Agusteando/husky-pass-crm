import type { AuthorizedChild } from '~/types/daycare'

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'info'
export type PaymentCategory = 'taller' | 'colegiatura' | 'material' | 'evento' | 'informativo'

export interface PaymentItem {
  id: string
  title: string
  description: string
  category: PaymentCategory
  status: PaymentStatus
  amount?: number | null
  currency: 'MXN'
  dueDate?: string | null
  paidAt?: string | null
  period?: string | null
  actionLabel?: string | null
}

export interface PaymentAccountSummary {
  balanceDue: number
  paidThisCycle: number
  overdueCount: number
  pendingCount: number
  currency: 'MXN'
  lastUpdated: string
}

export interface FamilyPaymentsResponse {
  items: PaymentItem[]
  summary: PaymentAccountSummary
  student: AuthorizedChild | null
  integration: {
    status: 'ready' | 'pending'
    label: string
  }
  state: 'ready' | 'empty' | 'unavailable'
  message?: string
}
