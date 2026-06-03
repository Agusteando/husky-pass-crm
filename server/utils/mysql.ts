import mysql, { type Pool, type RowDataPacket, type ResultSetHeader } from 'mysql2/promise'

type LegacySqlValue = string | number | boolean | Date | null

let pool: Pool | null = null

function getPool() {
  if (pool) return pool
  const config = useRuntimeConfig()
  pool = mysql.createPool({
    host: config.mysql.host,
    port: Number(config.mysql.port),
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    waitForConnections: true,
    connectionLimit: Number(config.mysql.connectionLimit || 10),
    charset: 'utf8mb4',
    timezone: 'Z',
    dateStrings: true
  })
  return pool
}

export async function legacyQuery<T extends RowDataPacket[] = RowDataPacket[]>(sql: string, params: LegacySqlValue[] = []) {
  const [rows] = await getPool().execute<T>(sql, params)
  return rows
}

export async function legacyOne<T extends RowDataPacket = RowDataPacket>(sql: string, params: LegacySqlValue[] = []) {
  const rows = await legacyQuery<T[]>(sql, params)
  return rows[0] as T | undefined
}

export async function legacyWrite(sql: string, params: LegacySqlValue[] = []) {
  const [result] = await getPool().execute<ResultSetHeader>(sql, params)
  return result
}

export function csvToList(value?: string | null) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}
