import { createError } from 'h3'
import { useRuntimeConfig } from 'nitropack/runtime'
import { createPool, type Pool, type ResultSetHeader, type RowDataPacket } from 'mysql2/promise'

type SqlValue = string | number | boolean | Date | null

let attendancePool: Pool | null = null

const DEFAULT_QUERY_TIMEOUT_MS = 15000
const TRANSIENT_MYSQL_CODES = new Set([
  'PROTOCOL_CONNECTION_LOST',
  'ECONNRESET',
  'ECONNREFUSED',
  'EPIPE',
  'ETIMEDOUT',
  'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR',
  'PROTOCOL_PACKETS_OUT_OF_ORDER'
])

function getAttendancePool() {
  if (attendancePool) return attendancePool
  const config = useRuntimeConfig()
  const db = config.attendanceMysql

  attendancePool = createPool({
    host: db.host,
    port: Number(db.port),
    user: db.user,
    password: db.password,
    database: db.database,
    waitForConnections: true,
    connectionLimit: Number(db.connectionLimit || 5),
    maxIdle: Number(db.connectionLimit || 5),
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 10000,
    charset: 'utf8mb4',
    timezone: 'Z',
    dateStrings: true
  })

  return attendancePool
}

function isTransientMysqlError(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const candidate = error as { code?: string; message?: string; fatal?: boolean }
  const message = candidate.message || ''
  return Boolean(
    candidate.fatal
    || (candidate.code && TRANSIENT_MYSQL_CODES.has(candidate.code))
    || /connection lost|server closed the connection|read econnreset|connect etimedout|socket hang up/i.test(message)
  )
}

function toPublicMysqlError(error: unknown) {
  if (error && typeof error === 'object') {
    const candidate = error as { code?: string; statusCode?: number; statusMessage?: string }
    if (candidate.statusCode && candidate.statusMessage) return error
    if (candidate.code === 'PROTOCOL_SEQUENCE_TIMEOUT') {
      return createError({ statusCode: 504, statusMessage: 'La consulta de asistencia excedio el tiempo de espera. Intenta de nuevo.' })
    }
    if (isTransientMysqlError(error)) {
      return createError({ statusCode: 503, statusMessage: 'La base de asistencia no esta disponible. Intenta de nuevo.' })
    }
  }
  return error
}

async function resetAttendancePool() {
  const current = attendancePool
  attendancePool = null
  if (!current) return
  try {
    await current.end()
  } catch {
    // Broken pools are replaced on the next query.
  }
}

async function executeAttendance<T>(sql: string, params: SqlValue[]): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const [result] = await getAttendancePool().execute({ sql, values: params, timeout: DEFAULT_QUERY_TIMEOUT_MS })
      return result as T
    } catch (error) {
      lastError = error
      if (!isTransientMysqlError(error) || attempt === 1) break
      await resetAttendancePool()
    }
  }

  throw toPublicMysqlError(lastError)
}

export function attendanceQuery<T extends RowDataPacket[] = RowDataPacket[]>(sql: string, params: SqlValue[] = []) {
  return executeAttendance<T>(sql, params)
}

export async function attendanceOne<T extends RowDataPacket = RowDataPacket>(sql: string, params: SqlValue[] = []) {
  const rows = await attendanceQuery<T[]>(sql, params)
  return rows[0] as T | undefined
}

export function attendanceWrite(sql: string, params: SqlValue[] = []) {
  return executeAttendance<ResultSetHeader>(sql, params)
}
