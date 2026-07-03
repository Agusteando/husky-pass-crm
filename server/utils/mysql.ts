import { useRuntimeConfig } from 'nitropack/runtime'
import { createPool, type Pool, type PoolConnection, type RowDataPacket, type ResultSetHeader } from 'mysql2/promise'
import { publicError } from '~/server/utils/httpError'
import { logEvent } from '~/server/utils/logger'

type LegacySqlValue = string | number | boolean | Date | null

type LegacyTransactionClient = {
  query: <T extends RowDataPacket[] = RowDataPacket[]>(sql: string, params?: LegacySqlValue[]) => Promise<T>
  one: <T extends RowDataPacket = RowDataPacket>(sql: string, params?: LegacySqlValue[]) => Promise<T | undefined>
  write: (sql: string, params?: LegacySqlValue[]) => Promise<ResultSetHeader>
}

let pool: Pool | null = null

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

function getPool() {
  if (pool) return pool
  const config = useRuntimeConfig()
  pool = createPool({
    host: config.mysql.host,
    port: Number(config.mysql.port),
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    waitForConnections: true,
    connectionLimit: Number(config.mysql.connectionLimit || 10),
    maxIdle: Number(config.mysql.connectionLimit || 10),
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 10000,
    charset: 'utf8mb4',
    timezone: 'Z',
    dateStrings: true
  })
  return pool
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
    const candidate = error as { code?: string; message?: string; statusCode?: number; statusMessage?: string }
    if (candidate.statusCode && (candidate.statusMessage || candidate.message)) return error
    if (candidate.code === 'PROTOCOL_SEQUENCE_TIMEOUT') {
      return publicError(504, 'La consulta a base de datos excedio el tiempo de espera. Intenta de nuevo.')
    }
    if (isTransientMysqlError(error)) {
      return publicError(503, 'La conexion a base de datos se perdio. Intenta de nuevo.')
    }
  }
  return error
}

async function resetPool() {
  const current = pool
  pool = null
  if (!current) return
  try {
    await current.end()
  } catch {
    // The connection is already broken; the next query will create a fresh pool.
  }
}

async function executeWithRetry<T>(sql: string, params: LegacySqlValue[]): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const startedAt = performance.now()
    try {
      const [result] = await getPool().execute({ sql, values: params, timeout: DEFAULT_QUERY_TIMEOUT_MS })
      const rowCount = Array.isArray(result) ? result.length : (result as ResultSetHeader).affectedRows
      logEvent('debug', 'mysql.query', {
        durationMs: Math.round(performance.now() - startedAt),
        rowCount,
        attempt: attempt + 1
      })
      return result as T
    } catch (error) {
      lastError = error
      logEvent('debug', 'mysql.query.failed', {
        durationMs: Math.round(performance.now() - startedAt),
        attempt: attempt + 1,
        dependency: 'mysql',
        code: error && typeof error === 'object' ? (error as { code?: string }).code : undefined
      })
      if (!isTransientMysqlError(error) || attempt === 1) break
      await resetPool()
    }
  }

  throw toPublicMysqlError(lastError)
}


async function executeOnConnection<T>(connection: PoolConnection, sql: string, params: LegacySqlValue[]): Promise<T> {
  const startedAt = performance.now()
  try {
    const [result] = await connection.execute({ sql, values: params, timeout: DEFAULT_QUERY_TIMEOUT_MS })
    const rowCount = Array.isArray(result) ? result.length : (result as ResultSetHeader).affectedRows
    logEvent('debug', 'mysql.transaction.query', {
      durationMs: Math.round(performance.now() - startedAt),
      rowCount
    })
    return result as T
  } catch (error) {
    logEvent('debug', 'mysql.transaction.query.failed', {
      durationMs: Math.round(performance.now() - startedAt),
      dependency: 'mysql',
      code: error && typeof error === 'object' ? (error as { code?: string }).code : undefined
    })
    throw toPublicMysqlError(error)
  }
}

export async function legacyTransaction<T>(callback: (client: LegacyTransactionClient) => Promise<T>) {
  const connection = await getPool().getConnection()
  try {
    await connection.beginTransaction()
    const client: LegacyTransactionClient = {
      query: <R extends RowDataPacket[] = RowDataPacket[]>(sql: string, params: LegacySqlValue[] = []) => executeOnConnection<R>(connection, sql, params),
      one: async <R extends RowDataPacket = RowDataPacket>(sql: string, params: LegacySqlValue[] = []) => {
        const rows = await executeOnConnection<R[]>(connection, sql, params)
        return rows[0] as R | undefined
      },
      write: (sql: string, params: LegacySqlValue[] = []) => executeOnConnection<ResultSetHeader>(connection, sql, params)
    }
    const result = await callback(client)
    await connection.commit()
    return result
  } catch (error) {
    try {
      await connection.rollback()
    } catch {
      // Rollback can fail if the connection was already closed by MySQL.
    }
    throw error
  } finally {
    connection.release()
  }
}

export async function legacyQuery<T extends RowDataPacket[] = RowDataPacket[]>(sql: string, params: LegacySqlValue[] = []) {
  return executeWithRetry<T>(sql, params)
}

export async function legacyOne<T extends RowDataPacket = RowDataPacket>(sql: string, params: LegacySqlValue[] = []) {
  const rows = await legacyQuery<T[]>(sql, params)
  return rows[0] as T | undefined
}

export async function legacyWrite(sql: string, params: LegacySqlValue[] = []) {
  return executeWithRetry<ResultSetHeader>(sql, params)
}

export function csvToList(value?: string | null) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}
