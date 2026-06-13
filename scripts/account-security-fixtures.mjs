import bcrypt from 'bcryptjs'
import mysql from 'mysql2/promise'
import { readFile } from 'node:fs/promises'

const FIXTURE_PASSWORD = process.env.CODEX_ACCOUNT_SECURITY_PASSWORD || 'CodexPass2026'
const DAYCARE_EMAIL = 'codex.daycare.parent@example.test'
const PA_EMAIL = 'codex.pa.parent@example.test'
const DAYCARE_USERNAME = 'CODEX-DAYCARE-001'
const PA_USERNAME = 'PMCODEX001'

function command() {
  return process.argv.find((arg) => ['up', 'down', 'list'].includes(arg)) || 'up'
}

function parseDotEnv(text) {
  return Object.fromEntries(text.split(/\r?\n/).map((line) => {
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line.trim())
    if (!match) return null
    return [match[1], match[2].replace(/^['"]|['"]$/g, '')]
  }).filter(Boolean))
}

async function connect() {
  const env = parseDotEnv(await readFile('.env', 'utf8'))
  return mysql.createConnection({
    host: env.MYSQL_HOST || '127.0.0.1',
    port: Number(env.MYSQL_PORT || 3306),
    user: env.MYSQL_USER || 'root',
    password: env.MYSQL_PASSWORD || '',
    database: env.MYSQL_DATABASE || 'casitaiedis',
    timezone: 'Z',
    dateStrings: true
  })
}

async function firstSala(conn) {
  const [rows] = await conn.execute('SELECT id, sala, unidad FROM salas ORDER BY id ASC LIMIT 1')
  const row = rows[0]
  if (!row) throw new Error('No salas rows are available for daycare fixture.')
  return row
}

async function upsertUser(conn, input) {
  const [existing] = await conn.execute('SELECT id FROM users WHERE email = ? OR username = ? ORDER BY id ASC LIMIT 1', [input.email, input.username])
  const hash = await bcrypt.hash(FIXTURE_PASSWORD, 12)
  if (existing[0]?.id) {
    await conn.execute(
      `UPDATE users
       SET displayName = ?, username = ?, email = ?, password = ?, plaintext = NULL, role = ?, unidad = ?, sala = ?, nombre_nino = ?
       WHERE id = ?`,
      [input.displayName, input.username, input.email, hash, input.role, input.unidad, input.sala, input.nombreNino, existing[0].id]
    )
    return Number(existing[0].id)
  }
  const [result] = await conn.execute(
    `INSERT INTO users (displayName, username, email, password, plaintext, role, unidad, sala, nombre_nino)
     VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?)`,
    [input.displayName, input.username, input.email, hash, input.role, input.unidad, input.sala, input.nombreNino]
  )
  return Number(result.insertId)
}

async function seedDaycare(conn) {
  const sala = await firstSala(conn)
  return upsertUser(conn, {
    displayName: 'Familia Codex Guarderia',
    username: DAYCARE_USERNAME,
    email: DAYCARE_EMAIL,
    role: 'ROLE_HUSKY_USER',
    unidad: sala.unidad,
    sala: String(sala.id),
    nombreNino: 'Alumno Codex Guarderia'
  })
}

async function seedPersonas(conn) {
  const userId = await upsertUser(conn, {
    displayName: 'Familia Codex Personas',
    username: PA_USERNAME,
    email: PA_EMAIL,
    role: 'ROLE_HUSKY_USER',
    unidad: '',
    sala: '',
    nombreNino: 'Alumno Codex Personas'
  })

  await conn.execute('DELETE FROM alumno_pa WHERE user_id = ? AND nombreA = ?', [userId, 'Codex'])
  await conn.execute(
    `INSERT INTO alumno_pa (paternoA, maternoA, nombreA, grado, grupo, nivelEdu, campus, foto, fechaA, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
    ['Prueba', 'Visual', 'Codex', '3', 'Unicornios', 'Primaria', 'PM', null, userId]
  )

  const [existingMatricula] = await conn.execute('SELECT id FROM matricula WHERE matricula = ? LIMIT 1', [PA_USERNAME])
  const values = [
    'CAXX160229HDFBCDA1',
    'Prueba',
    'Visual',
    'Codex Alumno Con Nombre Largo',
    '3',
    'Unicornios',
    null,
    '2016-02-29',
    'Primaria',
    '2025-2026',
    'Taller de arte, Comedor, Taller de arte,  Transporte '
  ]
  if (existingMatricula[0]?.id) {
    await conn.execute(
      `UPDATE matricula
       SET curp = ?, apellido_paterno = ?, apellido_materno = ?, nombres = ?, grado = ?, grupo = ?, foto = ?, fecha_nacimiento = ?, nivel = ?, ciclo = ?, servicio = ?
       WHERE matricula = ?`,
      [...values, PA_USERNAME]
    )
  } else {
    await conn.execute(
      `INSERT INTO matricula (matricula, curp, apellido_paterno, apellido_materno, nombres, grado, grupo, foto, fecha_nacimiento, nivel, ciclo, servicio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [PA_USERNAME, ...values]
    )
  }
  return userId
}

async function down(conn) {
  const emails = [DAYCARE_EMAIL, PA_EMAIL]
  await conn.execute('DELETE FROM password_recovery_tokens WHERE email IN (?, ?)', emails).catch(() => {})
  const [users] = await conn.execute('SELECT id FROM users WHERE email IN (?, ?) OR username IN (?, ?)', [DAYCARE_EMAIL, PA_EMAIL, DAYCARE_USERNAME, PA_USERNAME])
  const ids = users.map((row) => Number(row.id)).filter(Number.isFinite)
  for (const id of ids) {
    await conn.execute('DELETE FROM alumno_pa WHERE user_id = ?', [id]).catch(() => {})
    await conn.execute('DELETE FROM personas_autorizadas WHERE user_id = ?', [id]).catch(() => {})
  }
  await conn.execute('DELETE FROM matricula WHERE matricula = ?', [PA_USERNAME]).catch(() => {})
  await conn.execute('DELETE FROM users WHERE email IN (?, ?) OR username IN (?, ?)', [DAYCARE_EMAIL, PA_EMAIL, DAYCARE_USERNAME, PA_USERNAME])
}

async function list(conn) {
  const [rows] = await conn.execute(
    `SELECT id, displayName, username, email, role, unidad, sala
     FROM users
     WHERE email IN (?, ?) OR username IN (?, ?)
     ORDER BY email ASC`,
    [DAYCARE_EMAIL, PA_EMAIL, DAYCARE_USERNAME, PA_USERNAME]
  )
  console.log(JSON.stringify({ rows, password: FIXTURE_PASSWORD }, null, 2))
}

async function main() {
  const conn = await connect()
  try {
    const cmd = command()
    if (cmd === 'down') {
      await down(conn)
      console.log('Account-security fixtures removed.')
      return
    }
    if (cmd === 'list') {
      await list(conn)
      return
    }
    const daycareId = await seedDaycare(conn)
    const personasId = await seedPersonas(conn)
    console.log(JSON.stringify({
      password: FIXTURE_PASSWORD,
      accounts: [
        { context: 'daycare', id: daycareId, email: DAYCARE_EMAIL, username: DAYCARE_USERNAME },
        { context: 'personasAutorizadas', id: personasId, email: PA_EMAIL, username: PA_USERNAME }
      ]
    }, null, 2))
  } finally {
    await conn.end()
  }
}

main().catch((error) => {
  console.error(error.message || error)
  process.exitCode = 1
})
