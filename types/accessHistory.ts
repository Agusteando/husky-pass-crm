import type { AttendanceChild } from '~/types/attendance'

export type AccessHistoryScope = 'family' | 'admin'
export type AccessActionType = 'entrada' | 'salida'

export interface AccessHistoryPerson {
  id: number
  name: string
  parentesco?: string | null
  indice?: number | null
  photoUrl?: string | null
}

export interface AccessHistoryAction {
  id: number
  type: AccessActionType
  timestamp: string
  date: string
  time: string
  person: AccessHistoryPerson
}

export interface AccessHistoryStudent {
  matricula: string
  name: string
  plantel?: string | null
  nivelEdu?: string | null
  grado?: string | null
  grupo?: string | null
  foto?: string | null
}

export interface AccessHistoryDay {
  key: string
  date: string
  student: AccessHistoryStudent
  actions: AccessHistoryAction[]
  entrada?: AccessHistoryAction | null
  salida?: AccessHistoryAction | null
  people: AccessHistoryPerson[]
  status: 'entrada-salida' | 'solo-entrada' | 'solo-salida'
}

export interface AccessHistorySummary {
  days: number
  entries: number
  exits: number
  uniquePeople: number
  students: number
}

export interface AccessHistoryRange {
  startDate: string
  endDate: string
}

export interface FamilyAccessHistoryResponse {
  scope: 'family'
  range: AccessHistoryRange
  selectedChild: AttendanceChild
  children: AttendanceChild[]
  days: AccessHistoryDay[]
  people: AccessHistoryPerson[]
  summary: AccessHistorySummary
}

export interface AdminAccessHistoryResponse {
  scope: 'admin'
  range: AccessHistoryRange
  filters: {
    plantel: string
    search: string
    limit: number
  }
  planteles: string[]
  days: AccessHistoryDay[]
  people: AccessHistoryPerson[]
  summary: AccessHistorySummary
}
