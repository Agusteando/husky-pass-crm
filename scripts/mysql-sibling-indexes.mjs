import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import process from 'node:process'
import mysql from 'mysql2/promise'

const SIGNATURE_COLUMN = 'hp_parent_signature'
const SIGNATURE_INDEX = 'idx_matricula_hp_parent_signature'
const PARENT_FIELDS = [
  'nombre_padre',
  'apellido_paterno_padre',
  'apellido_materno_padre',
  'nombre_madre',
  'apellido_paterno_madre',
  'apellido_materno_madre'
]

function loadEnvFile(file) {
  if (!existsSync(file)) return
  const raw = readFileSync(file, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(trimmed)
    if (!match || process.env[match[1]]) continue
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '')
  }
}

function parseArgs() {
  const args = process.argv.slice(2)
  const command = args.find((arg) => !arg.startsWith('--')) || 'verify'
  const flags = new Map()
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (!arg.startsWith('--')) continue
    const [key, inline] = arg.slice(2).split('=')
    flags.set(key, inline ?? args[index + 1] ?? '1')
    if (inline === undefined && args[index + 1] && !args[index + 1].startsWith('--')) index += 1
  }
  return { command, flags }
}

function normalizeName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
}

function parentSignature(row) {
  const values = Object.fromEntries(PARENT_FIELDS.map((field) => [field, normalizeName(row[field])]))
  if (PARENT_FIELDS.some((field) => !values[field])) return null
  const father = [values.nombre_padre, values.apellido_paterno_padre, values.apellido_materno_padre].join(' ')
  const mother = [values.nombre_madre, values.apellido_paterno_madre, values.apellido_materno_madre].join(' ')
  return `${father}|${mother}`
}

function hashId(value) {
  return createHash('sha256').update(String(value || '')).digest('hex').slice(0, 12)
}

function mysqlConfig() {
  return {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 2,
    namedPlaceholders: false
  }
}

function assertConfig(config) {
  const missing = ['host', 'user', 'database'].filter((key) => !config[key])
  if (missing.length) throw new Error(`Faltan variables MySQL: ${missing.join(', ')}`)
}

async function tableColumns(connection) {
  const [rows] = await connection.query('SHOW COLUMNS FROM matricula')
  return new Set(rows.map((row) => String(row.Field || '')))
}

async function tableIndexes(connection) {
  const [rows] = await connection.query('SHOW INDEX FROM matricula')
  return new Set(rows.map((row) => String(row.Key_name || '')))
}

async function verify(connection) {
  const columns = await tableColumns(connection)
  const indexes = await tableIndexes(connection)
  const response = {
    action: 'verify',
    columnExists: columns.has(SIGNATURE_COLUMN),
    indexExists: indexes.has(SIGNATURE_INDEX)
  }
  const [totalRows] = await connection.query('SELECT COUNT(*) AS total FROM matricula')
  response.totalRows = Number(totalRows[0]?.total || 0)
  if (response.columnExists) {
    const [signedRows] = await connection.query(`SELECT COUNT(*) AS signed FROM matricula WHERE ${SIGNATURE_COLUMN} IS NOT NULL`)
    response.signedRows = Number(signedRows[0]?.signed || 0)
  }
  response.ok = response.columnExists && response.indexExists
  return response
}

async function explain(connection, matricula) {
  const columns = await tableColumns(connection)
  if (!columns.has(SIGNATURE_COLUMN)) {
    return { action: 'explain', ok: false, reason: 'missing-signature-column' }
  }
  if (!matricula) {
    return { action: 'explain', ok: false, reason: 'missing-matricula-argument' }
  }
  const [rows] = await connection.query(`SELECT matricula, ${PARENT_FIELDS.join(', ')}, ${SIGNATURE_COLUMN} FROM matricula WHERE matricula = ? LIMIT 1`, [matricula])
  const row = rows[0]
  if (!row) return { action: 'explain', ok: false, reason: 'matricula-not-found', matriculaHash: hashId(matricula) }
  const signature = parentSignature(row)
  if (!signature) return { action: 'explain', ok: false, reason: 'incomplete-parent-signature', matriculaHash: hashId(matricula) }
  const signatureKey = row[SIGNATURE_COLUMN] || signature
  const [plan] = await connection.query(
    `EXPLAIN SELECT m.matricula
     FROM matricula m
     LEFT JOIN users u ON u.username = m.matricula
     WHERE m.${SIGNATURE_COLUMN} = ?
       AND m.matricula <> ?
     ORDER BY m.apellido_paterno ASC, m.apellido_materno ASC, m.nombres ASC
     LIMIT 7`,
    [signatureKey, matricula]
  )
  return {
    action: 'explain',
    ok: true,
    matriculaHash: hashId(matricula),
    plan: plan.map((row) => ({
      table: row.table,
      type: row.type,
      key: row.key,
      rows: row.rows,
      filtered: row.filtered,
      extra: row.Extra
    }))
  }
}

async function main() {
  loadEnvFile('.env')
  loadEnvFile('.env.local')
  const { command, flags } = parseArgs()
  const config = mysqlConfig()
  assertConfig(config)
  const connection = await mysql.createConnection(config)
  try {
    if (!['verify', 'explain'].includes(command)) {
      throw new Error(`Comando no permitido: ${command}. Este script es solo de lectura; usa verify o explain.`)
    }
    const result = command === 'explain'
      ? await explain(connection, flags.get('matricula'))
      : await verify(connection)
    console.log(JSON.stringify(result, null, 2))
    if (command === 'verify' && !result.ok) process.exitCode = 1
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
