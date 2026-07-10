import type { FamilyAccessHistoryResponse } from './accessHistory'

export type AttendanceSourceState = 'ready' | 'unavailable' | 'timeout' | 'error'

export interface SchoolYearRange {
  label: string
  startDate: string
  endDate: string
  isCurrent?: boolean
}

export interface GrupoSigil {
  grupoValue: string
  image: string
  fallback: boolean
}

export interface AttendanceChild {
  matricula: string
  name: string
  givenName?: string | null
  paternalName?: string | null
  maternalName?: string | null
  grado?: string | null
  grupo?: string | null
  nivelEdu?: string | null
  campus?: string | null
  plantel?: string | null
  plantelCode: string
  foto?: string | null
  ciclo?: string | null
  isCurrent?: boolean
}

export interface AttendanceAbsenceRecord {
  id: number
  date: string
  studentName: string
  grado?: string | null
  grupo?: string | null
  plantel?: string | null
  motivo?: string | null
  motivoState: 'missing' | 'provided'
  canUpdate: boolean
}

export interface AttendanceTardyRecord {
  id: number
  date: string
  time: string
  minutesLate: number
  thresholdTime: string
  studentName: string
  matricula?: string | null
}

export interface AttendanceCalendarDay {
  date: string
  status: 'clear' | 'absence' | 'tardy' | 'absence-tardy'
  motivoState?: 'missing' | 'provided'
}

export interface AttendanceEvent {
  key: string
  type: 'absence' | 'tardy'
  date: string
  time?: string | null
  title: string
  detail: string
  absence?: AttendanceAbsenceRecord
  tardy?: AttendanceTardyRecord
}

export interface ParentAttendanceSummary {
  schoolDaysWithAttendance: number
  clearDays: number
  absences: number
  tardies: number
  unresolvedAbsences: number
  resolvedAbsences: number
}

export interface ParentAttendanceResponse {
  status: 'ready' | 'partial' | 'unavailable'
  selectedChild: AttendanceChild
  children: AttendanceChild[]
  selectedSchoolYear: SchoolYearRange
  schoolYears: SchoolYearRange[]
  grupoSigil: GrupoSigil
  summary: ParentAttendanceSummary
  absences: AttendanceAbsenceRecord[]
  tardies: AttendanceTardyRecord[]
  accessHistory: FamilyAccessHistoryResponse
  calendarDays: AttendanceCalendarDay[]
  events: AttendanceEvent[]
  source: {
    label: 'SIPAE'
    attendance: AttendanceSourceState
    tardiness: AttendanceSourceState
    access: AttendanceSourceState
    attendanceMessage?: string
    tardinessMessage?: string
    accessMessage?: string
  }
}

export interface MotivoUpdateResponse {
  absence: AttendanceAbsenceRecord
  summary?: ParentAttendanceSummary
}
