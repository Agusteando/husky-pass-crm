import { $fetch } from 'ofetch'
import { useRuntimeConfig } from 'nitropack/runtime'
import type { SchoolYearRange } from '~/types/attendance'

export interface SipaeAbsentStudent {
  id: number | string
  name: string
  grado?: string | null
  grupo?: string | null
  motivo?: string | null
}

export interface SipaeAttendanceGroup {
  grado?: string | null
  grupo?: string | null
  total_students_per_group?: number
  asistencia?: number
  ausencia?: number
}

export interface SipaeAttendanceDay {
  groups?: SipaeAttendanceGroup[]
  absent_students?: SipaeAbsentStudent[]
}

export interface SipaeAttendanceDetailResponse {
  plantel_requested: string
  resolved_name: string
  scope: string
  mode: 'daily' | 'range'
  date_range: { start: string; end: string }
  groups?: SipaeAttendanceGroup[]
  absent_students?: SipaeAbsentStudent[]
  daily_points?: Record<string, SipaeAttendanceDay>
  meta?: Record<string, unknown>
}

export interface SipaeTardyRecord {
  id: number | string
  student_fullname: string
  matricula?: string | null
  date: string
  time: string
}

export interface SipaeTardiesResponse {
  plantel_requested: string
  resolved_name: string
  scope: string
  date_range: { start: string; end: string }
  total_retardos: number
  retardos: SipaeTardyRecord[]
  meta?: Record<string, unknown>
}

function sipaeConfig() {
  const config = useRuntimeConfig()
  return {
    baseURL: String(config.sipae.apiBaseUrl || '').replace(/\/$/, ''),
    timeout: Number(config.sipae.timeoutMs || 20000)
  }
}

export function sipaeErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') return 'SIPAE no respondió.'
  const candidate = error as { name?: string; message?: string; statusCode?: number; data?: { detail?: string } }
  const text = `${candidate.name || ''} ${candidate.message || ''}`
  if (/timeout|parent read deadline|exceeded parent read deadline/i.test(text)) return 'SIPAE excedió el tiempo de espera.'
  if (candidate.statusCode) return `SIPAE respondió con error ${candidate.statusCode}.`
  return candidate.data?.detail || candidate.message || 'SIPAE no respondió.'
}

export function sipaeErrorState(error: unknown) {
  const message = sipaeErrorMessage(error)
  return /tiempo de espera|timeout/i.test(message) ? 'timeout' as const : 'unavailable' as const
}

export function fetchSipaeAttendanceDetail(plantel: string, range: SchoolYearRange) {
  const config = sipaeConfig()
  return $fetch<SipaeAttendanceDetailResponse>('/api/v1/attendance/detail', {
    baseURL: config.baseURL,
    timeout: config.timeout,
    query: {
      plantel,
      scope: 'range',
      start_date: range.startDate,
      end_date: range.endDate
    }
  })
}

export function fetchSipaeTardies(plantel: string, range: SchoolYearRange) {
  const config = sipaeConfig()
  return $fetch<SipaeTardiesResponse>('/api/v1/husky/retardos', {
    baseURL: config.baseURL,
    timeout: config.timeout,
    query: {
      plantel,
      scope: 'range',
      start_date: range.startDate,
      end_date: range.endDate
    }
  })
}
