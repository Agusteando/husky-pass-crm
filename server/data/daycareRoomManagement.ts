import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import type { AppSessionUser } from '~/types/session'
import type {
  DaycareDuplicateGroup,
  DaycareRoomManagementOverview,
  DaycareRoomMember,
  Sala
} from '~/types/daycare'
import { getSalasForUnidad, listAdminDaycareUnits } from '~/server/data/mysqlDaycare'
import { assertUnidadAccess } from '~/server/utils/authz'
import { publicError } from '~/server/utils/httpError'
import { legacyOne, legacyQuery, legacyTransaction, legacyWrite } from '~/server/utils/mysql'
import { DAYCARE_FAMILY_ROLE, hasRoleToken } from '~/utils/sessionScopes'

interface ManagedUserRow extends RowDataPacket {
  id: number | string
  nombre_nino: string | null
  username: string | null
  email: string | null
  plaintext: string | null
  password?: string | null
  role: string | null
  unidad: string | null
  sala: string | number | null
}

interface CountRow extends RowDataPacket {
  user_id: number | string
  total: number | string
}

interface TableCountRow extends RowDataPacket {
  total: number | string
}

interface IndexRow extends RowDataPacket {
  Key_name: string
  Non_unique: number | string
  Seq_in_index: number | string
  Column_name: string
}

type TransactionClient = {
  query: <T extends RowDataPacket[] = RowDataPacket[]>(sql: string, params?: Array<string | number | boolean | Date | null>) => Promise<T>
  one: <T extends RowDataPacket = RowDataPacket>(sql: string, params?: Array<string | number | boolean | Date | null>) => Promise<T | undefined>
  write: (sql: string, params?: Array<string | number | boolean | Date | null>) => Promise<ResultSetHeader>
}

const GENERIC_IDENTITY_VALUES = new Set([
  'familia',
  'usuario',
  'user',
  'guarderia',
  'daycare',
  'pendiente',
  'sin correo',
  'sin usuario'
])

let usersColumnCache: Set<string> | null = null
const tableAvailability = new Map<string, boolean>()

function normalizeEmail(value: unknown) {
  const email = String(value || '').trim().toLowerCase()
  return email.includes('@') && email.length >= 6 ? email : ''
}

function normalizeUsername(value: unknown) {
  const username = String(value || '').trim().toLowerCase().replace(/\s+/g, '')
  if (username.length < 4 || GENERIC_IDENTITY_VALUES.has(username)) return ''
  return username
}

function normalizeName(value: unknown) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
}

function csvTokens(value: unknown) {
  return String(value || '').split(',').map((item) => item.trim()).filter(Boolean)
}

function assertPureDaycareFamily(row: ManagedUserRow) {
  const roles = csvTokens(row.role)
  if (roles.length !== 1 || !hasRoleToken(roles, DAYCARE_FAMILY_ROLE)) {
    throw publicError(409, 'La cuenta combina accesos y requiere revisión administrativa.')
  }
}

async function getUsersColumns() {
  if (usersColumnCache) return usersColumnCache
  const rows = await legacyQuery<RowDataPacket[]>('SHOW COLUMNS FROM users')
  usersColumnCache = new Set(rows.map((row) => String(row.Field || '').trim()).filter(Boolean))
  return usersColumnCache
}

async function hasTable(table: string) {
  if (tableAvailability.has(table)) return Boolean(tableAvailability.get(table))
  try {
    const row = await legacyOne<TableCountRow>(
      `SELECT COUNT(*) AS total
       FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name = ?`,
      [table]
    )
    const available = Number(row?.total || 0) > 0
    tableAvailability.set(table, available)
    return available
  } catch {
    tableAvailability.set(table, false)
    return false
  }
}

async function relatedCountMap(table: string, ids: number[]) {
  const map = new Map<number, number>()
  if (!ids.length || !(await hasTable(table))) return map
  const placeholders = ids.map(() => '?').join(',')
  const rows = await legacyQuery<CountRow[]>(
    `SELECT user_id, COUNT(*) AS total FROM \`${table}\` WHERE user_id IN (${placeholders}) GROUP BY user_id`,
    ids
  )
  for (const row of rows) map.set(Number(row.user_id), Number(row.total || 0))
  return map
}

function buildDuplicateGroups(members: DaycareRoomMember[]) {
  const parent = new Map<number, number>()
  const tokenOwner = new Map<string, number>()
  const tokenKinds = new Map<string, 'email' | 'username'>()

  function find(id: number): number {
    const current = parent.get(id) ?? id
    if (current === id) return id
    const root = find(current)
    parent.set(id, root)
    return root
  }

  function union(left: number, right: number) {
    const leftRoot = find(left)
    const rightRoot = find(right)
    if (leftRoot !== rightRoot) parent.set(rightRoot, leftRoot)
  }

  for (const member of members) {
    parent.set(member.id, member.id)
    const tokens: Array<[string, 'email' | 'username']> = []
    const email = normalizeEmail(member.email)
    const username = normalizeUsername(member.username)
    if (email) tokens.push([`email:${email}`, 'email'])
    if (username) tokens.push([`username:${username}`, 'username'])

    for (const [token, kind] of tokens) {
      tokenKinds.set(token, kind)
      const owner = tokenOwner.get(token)
      if (owner) union(owner, member.id)
      else tokenOwner.set(token, member.id)
    }
  }

  const grouped = new Map<number, DaycareRoomMember[]>()
  for (const member of members) {
    const root = find(member.id)
    const bucket = grouped.get(root) || []
    bucket.push(member)
    grouped.set(root, bucket)
  }

  const duplicates: DaycareDuplicateGroup[] = []
  for (const rows of grouped.values()) {
    if (rows.length < 2) continue
    const ids = new Set(rows.map((row) => row.id))
    const matchBy = new Set<'email' | 'username'>()
    for (const [token, owner] of tokenOwner.entries()) {
      if (!ids.has(owner)) continue
      const tokenValue = token.slice(token.indexOf(':') + 1)
      const matches = rows.filter((row) => token.startsWith('email:')
        ? normalizeEmail(row.email) === tokenValue
        : normalizeUsername(row.username) === tokenValue)
      if (matches.length > 1) matchBy.add(tokenKinds.get(token) || 'username')
    }

    const sorted = [...rows].sort((a, b) => {
      const score = (member: DaycareRoomMember) => (
        member.relatedRecords * 100
        + (member.plaintext ? 20 : 0)
        + (member.nombre_nino ? 12 : 0)
        + (member.salaId ? 8 : 0)
        + (member.email ? 4 : 0)
      )
      return score(b) - score(a) || a.id - b.id
    })
    const key = `dup-${sorted.map((row) => row.id).sort((a, b) => a - b).join('-')}`
    const group: DaycareDuplicateGroup = {
      key,
      canonicalId: sorted[0].id,
      matchBy: Array.from(matchBy),
      members: sorted
    }
    duplicates.push(group)
    for (const member of rows) {
      member.duplicateGroupKey = key
      member.duplicateCount = rows.length
    }
  }

  return duplicates.sort((a, b) => b.members.length - a.members.length || a.members[0].id - b.members[0].id)
}

export async function getDaycareRoomManagementOverview(user: AppSessionUser, requestedUnidad?: string | null): Promise<DaycareRoomManagementOverview> {
  const unidades = await listAdminDaycareUnits(user)
  const unidad = String(requestedUnidad || '').trim() || unidades[0] || ''
  if (!unidad) {
    return {
      unidad: '',
      unidades,
      salas: [],
      members: [],
      duplicates: [],
      stats: { total: 0, assigned: 0, unassigned: 0, duplicateAccounts: 0, duplicateGroups: 0 }
    }
  }

  assertUnidadAccess(user, unidad)
  const salas = await getSalasForUnidad(user, unidad)
  const salaIds = salas.map((sala) => sala.id)
  const salaById = new Map(salas.map((sala) => [sala.id, sala]))
  const salaClause = salaIds.length ? ` OR CAST(sala AS UNSIGNED) IN (${salaIds.map(() => '?').join(',')})` : ''
  const rows = await legacyQuery<ManagedUserRow[]>(
    `SELECT id, nombre_nino, username, email, plaintext, role, unidad, sala
     FROM users
     WHERE FIND_IN_SET(?, REPLACE(COALESCE(role, ''), ' ', '')) > 0
       AND (FIND_IN_SET(?, REPLACE(COALESCE(unidad, ''), ' ', '')) > 0${salaClause})
     ORDER BY nombre_nino ASC, email ASC, id ASC`,
    [DAYCARE_FAMILY_ROLE, unidad, ...salaIds]
  )

  const ids = rows.map((row) => Number(row.id)).filter((id) => Number.isInteger(id) && id > 0)
  const [authorizedCounts, studentCounts] = await Promise.all([
    relatedCountMap('personas_autorizadas', ids),
    relatedCountMap('alumno_pa', ids)
  ])

  const members: DaycareRoomMember[] = rows.map((row) => {
    const id = Number(row.id)
    const salaId = Number(row.sala || 0)
    const sala = salaById.get(salaId) || null
    const authorizedPeople = authorizedCounts.get(id) || 0
    const linkedStudents = studentCounts.get(id) || 0
    return {
      id,
      nombre_nino: row.nombre_nino || null,
      username: String(row.username || ''),
      email: String(row.email || ''),
      plaintext: row.plaintext || null,
      passwordCanChange: true,
      role: row.role || DAYCARE_FAMILY_ROLE,
      unidad,
      sala: salaId || '',
      salaId: sala?.id || null,
      salaName: sala?.sala || null,
      relatedRecords: authorizedPeople + linkedStudents,
      authorizedPeople,
      linkedStudents,
      duplicateGroupKey: null,
      duplicateCount: 0
    }
  })

  const duplicates = buildDuplicateGroups(members)
  const duplicateAccounts = duplicates.reduce((total, group) => total + group.members.length, 0)
  const assigned = members.filter((member) => Boolean(member.salaId)).length

  return {
    unidad,
    unidades,
    salas,
    members,
    duplicates,
    stats: {
      total: members.length,
      assigned,
      unassigned: members.length - assigned,
      duplicateAccounts,
      duplicateGroups: duplicates.length
    }
  }
}

async function fetchManagedUsers(ids: number[]) {
  if (!ids.length) return []
  const columns = await getUsersColumns()
  const passwordSelect = columns.has('password') ? ', password' : ''
  const placeholders = ids.map(() => '?').join(',')
  return legacyQuery<ManagedUserRow[]>(
    `SELECT id, nombre_nino, username, email, plaintext, role, unidad, sala${passwordSelect}
     FROM users WHERE id IN (${placeholders}) ORDER BY id ASC`,
    ids
  )
}

async function assertRowsInScope(user: AppSessionUser, rows: ManagedUserRow[]) {
  for (const row of rows) {
    assertPureDaycareFamily(row)
    const unidades = csvTokens(row.unidad)
    if (unidades.length) {
      for (const unidad of unidades) assertUnidadAccess(user, unidad)
      continue
    }

    const salaId = Number(row.sala || 0)
    if (!salaId) throw publicError(409, 'La cuenta no tiene unidad ni sala asignada.')
    const sala = await legacyOne<RowDataPacket>('SELECT unidad FROM salas WHERE id = ? LIMIT 1', [salaId])
    if (!sala?.unidad) throw publicError(409, 'La sala actual ya no está disponible.')
    assertUnidadAccess(user, String(sala.unidad))
  }
}

export async function moveDaycareRoomMembers(user: AppSessionUser, input: { userIds: number[]; targetSalaId: number }) {
  const ids = Array.from(new Set(input.userIds.map(Number).filter((id) => Number.isInteger(id) && id > 0)))
  if (!ids.length) throw publicError(400, 'Selecciona al menos una cuenta.')
  const target = await legacyOne<(Sala & RowDataPacket)>('SELECT id, sala, unidad FROM salas WHERE id = ? LIMIT 1', [input.targetSalaId])
  if (!target) throw publicError(404, 'Sala no encontrada.')
  assertUnidadAccess(user, String(target.unidad))

  const rows = await fetchManagedUsers(ids)
  if (rows.length !== ids.length) throw publicError(404, 'Una o más cuentas ya no están disponibles.')
  await assertRowsInScope(user, rows)

  await legacyWrite(
    `UPDATE users SET unidad = ?, sala = ? WHERE id IN (${ids.map(() => '?').join(',')})`,
    [String(target.unidad), String(target.id), ...ids]
  )

  return {
    moved: ids.length,
    target: { id: Number(target.id), sala: String(target.sala), unidad: String(target.unidad) }
  }
}

function selectBestValue(rows: ManagedUserRow[], field: 'nombre_nino' | 'email' | 'username' | 'plaintext') {
  const values = rows.map((row) => String(row[field] || '').trim()).filter(Boolean)
  if (!values.length) return null
  if (field === 'email') return normalizeEmail(values[0]) || values[0].toLowerCase()
  return [...values].sort((a, b) => b.length - a.length)[0]
}

function duplicateIdentityMatches(rows: ManagedUserRow[]) {
  if (rows.length < 2) return false
  const parent = new Map<number, number>(rows.map((row) => [Number(row.id), Number(row.id)]))
  const tokenOwner = new Map<string, number>()

  function find(id: number): number {
    const current = parent.get(id) ?? id
    if (current === id) return id
    const root = find(current)
    parent.set(id, root)
    return root
  }

  function union(left: number, right: number) {
    const leftRoot = find(left)
    const rightRoot = find(right)
    if (leftRoot !== rightRoot) parent.set(rightRoot, leftRoot)
  }

  for (const row of rows) {
    const id = Number(row.id)
    const email = normalizeEmail(row.email)
    const username = normalizeUsername(row.username)
    for (const token of [email ? `email:${email}` : '', username ? `username:${username}` : ''].filter(Boolean)) {
      const owner = tokenOwner.get(token)
      if (owner) union(owner, id)
      else tokenOwner.set(token, id)
    }
  }

  const roots = new Set(rows.map((row) => find(Number(row.id))))
  return roots.size === 1
}

async function mergeAuthorizedPeople(tx: TransactionClient, canonicalId: number, duplicateIds: number[]) {
  if (!(await hasTable('personas_autorizadas'))) return
  const ids = [canonicalId, ...duplicateIds]
  const rows = await tx.query<RowDataPacket[]>(
    `SELECT id, user_id, indice, paternoP, maternoP, nombreP, parenP
     FROM personas_autorizadas
     WHERE user_id IN (${ids.map(() => '?').join(',')})
     ORDER BY CASE WHEN user_id = ? THEN 0 ELSE 1 END, indice ASC, id ASC`,
    [...ids, canonicalId]
  )

  const canonicalRows = rows.filter((row) => Number(row.user_id) === canonicalId)
  const occupied = new Set(canonicalRows.map((row) => Number(row.indice)).filter((value) => value >= 1 && value <= 4))
  const identities = new Set(canonicalRows.map((row) => normalizeName(`${row.paternoP || ''}${row.maternoP || ''}${row.nombreP || ''}${row.parenP || ''}`)).filter(Boolean))

  for (const row of rows.filter((item) => Number(item.user_id) !== canonicalId)) {
    const identity = normalizeName(`${row.paternoP || ''}${row.maternoP || ''}${row.nombreP || ''}${row.parenP || ''}`)
    if (identity && identities.has(identity)) {
      await tx.write('DELETE FROM personas_autorizadas WHERE id = ?', [Number(row.id)])
      continue
    }

    const preferred = Number(row.indice)
    const slot = !occupied.has(preferred) && preferred >= 1 && preferred <= 4
      ? preferred
      : [1, 2, 3, 4].find((candidate) => !occupied.has(candidate))
    if (!slot) throw publicError(409, 'La consolidación supera cuatro personas autorizadas.')
    await tx.write('UPDATE personas_autorizadas SET user_id = ?, indice = ? WHERE id = ?', [canonicalId, slot, Number(row.id)])
    occupied.add(slot)
    if (identity) identities.add(identity)
  }
}

function normalizedRecordFingerprint(row: RowDataPacket, ignored: Set<string>) {
  return Object.keys(row)
    .filter((key) => !ignored.has(key.toLowerCase()))
    .sort()
    .map((key) => {
      const value = row[key]
      if (value === undefined || value === null) return `${key}:`
      if (value instanceof Date) return `${key}:${value.toISOString()}`
      return `${key}:${String(value).trim().toLowerCase()}`
    })
    .join('|')
}

function recordCompleteness(row: RowDataPacket, ignored: Set<string>) {
  return Object.keys(row).reduce((total, key) => {
    if (ignored.has(key.toLowerCase())) return total
    const value = row[key]
    return total + (value === undefined || value === null || String(value).trim() === '' ? 0 : 1)
  }, 0)
}

async function mergeAlumnoPa(tx: TransactionClient, canonicalId: number, duplicateIds: number[]) {
  if (!(await hasTable('alumno_pa'))) return
  const ids = [canonicalId, ...duplicateIds]
  const rows = await tx.query<RowDataPacket[]>(
    `SELECT * FROM alumno_pa
     WHERE user_id IN (${ids.map(() => '?').join(',')})
     ORDER BY CASE WHEN user_id = ? THEN 0 ELSE 1 END, id ASC`,
    [...ids, canonicalId]
  )
  if (!rows.length) return

  const indexRows = await tx.query<IndexRow[]>('SHOW INDEX FROM alumno_pa')
  const uniqueIndexColumns = new Map<string, string[]>()
  for (const index of indexRows) {
    if (Number(index.Non_unique) !== 0) continue
    const columns = uniqueIndexColumns.get(String(index.Key_name)) || []
    columns[Number(index.Seq_in_index) - 1] = String(index.Column_name).toLowerCase()
    uniqueIndexColumns.set(String(index.Key_name), columns)
  }
  const hasUniqueUserId = Array.from(uniqueIndexColumns.values()).some((columns) => columns.length === 1 && columns[0] === 'user_id')
  const ignored = new Set(['id', 'user_id', 'created_at', 'updated_at', 'timestamp'])

  if (hasUniqueUserId) {
    const keeper = [...rows].sort((left, right) => {
      const scoreDiff = recordCompleteness(right, ignored) - recordCompleteness(left, ignored)
      if (scoreDiff) return scoreDiff
      const leftCanonical = Number(left.user_id) === canonicalId ? 1 : 0
      const rightCanonical = Number(right.user_id) === canonicalId ? 1 : 0
      return rightCanonical - leftCanonical || Number(left.id) - Number(right.id)
    })[0]
    const discardIds = rows.map((row) => Number(row.id)).filter((id) => id !== Number(keeper.id))
    if (discardIds.length) {
      await tx.write(`DELETE FROM alumno_pa WHERE id IN (${discardIds.map(() => '?').join(',')})`, discardIds)
    }
    if (Number(keeper.user_id) !== canonicalId) {
      await tx.write('UPDATE alumno_pa SET user_id = ? WHERE id = ?', [canonicalId, Number(keeper.id)])
    }
    return
  }

  const fingerprints = new Set<string>()
  for (const row of rows) {
    const fingerprint = normalizedRecordFingerprint(row, ignored)
    if (Number(row.user_id) === canonicalId) fingerprints.add(fingerprint)
  }

  for (const row of rows.filter((item) => Number(item.user_id) !== canonicalId)) {
    const fingerprint = normalizedRecordFingerprint(row, ignored)
    if (fingerprints.has(fingerprint)) {
      await tx.write('DELETE FROM alumno_pa WHERE id = ?', [Number(row.id)])
      continue
    }
    await tx.write('UPDATE alumno_pa SET user_id = ? WHERE id = ?', [canonicalId, Number(row.id)])
    fingerprints.add(fingerprint)
  }
}

async function mergeSimpleReferences(tx: TransactionClient, canonicalId: number, duplicateIds: number[]) {
  await mergeAlumnoPa(tx, canonicalId, duplicateIds)

  if (await hasTable('password_recovery_tokens')) {
    await tx.write(
      `UPDATE password_recovery_tokens
       SET superseded_at = COALESCE(superseded_at, UTC_TIMESTAMP())
       WHERE user_id IN (${duplicateIds.map(() => '?').join(',')}) AND used_at IS NULL`,
      duplicateIds
    )
  }

  if (await hasTable('hp_daycare_password_policy')) {
    const policyRows = await tx.query<RowDataPacket[]>(
      `SELECT user_id, can_change_password
       FROM hp_daycare_password_policy
       WHERE user_id IN (${[canonicalId, ...duplicateIds].map(() => '?').join(',')})`,
      [canonicalId, ...duplicateIds]
    )
    const canChange = policyRows.every((row) => Number(row.can_change_password) !== 0) ? 1 : 0
    await tx.write(
      `INSERT INTO hp_daycare_password_policy (user_id, can_change_password, updated_by)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE can_change_password = VALUES(can_change_password), updated_by = VALUES(updated_by)`,
      [canonicalId, canChange, 'room-management-merge']
    )
    await tx.write(
      `DELETE FROM hp_daycare_password_policy WHERE user_id IN (${duplicateIds.map(() => '?').join(',')})`,
      duplicateIds
    )
  }
}

async function archiveDuplicateUsers(tx: TransactionClient, duplicateIds: number[], columns: Set<string>) {
  for (const id of duplicateIds) {
    const assignments: string[] = ['role = NULL', 'unidad = NULL', 'sala = NULL']
    const params: Array<string | number | null> = []
    if (columns.has('username')) {
      assignments.push('username = ?')
      params.push(`merged_${id}`)
    }
    if (columns.has('email')) {
      assignments.push('email = ?')
      params.push(`merged_${id}@invalid.local`)
    }
    if (columns.has('plaintext')) assignments.push('plaintext = NULL')
    if (columns.has('password')) assignments.push('password = NULL')
    if (columns.has('nombre_nino')) assignments.push('nombre_nino = NULL')
    await tx.write(`UPDATE users SET ${assignments.join(', ')} WHERE id = ?`, [...params, id])
  }
}

export async function mergeDaycareRoomMembers(user: AppSessionUser, input: { canonicalId: number; duplicateIds: number[]; targetSalaId: number }) {
  const canonicalId = Number(input.canonicalId)
  const duplicateIds = Array.from(new Set(input.duplicateIds.map(Number).filter((id) => Number.isInteger(id) && id > 0 && id !== canonicalId)))
  if (!Number.isInteger(canonicalId) || canonicalId <= 0 || !duplicateIds.length) {
    throw publicError(400, 'Selecciona las cuentas a consolidar.')
  }

  const target = await legacyOne<(Sala & RowDataPacket)>('SELECT id, sala, unidad FROM salas WHERE id = ? LIMIT 1', [input.targetSalaId])
  if (!target) throw publicError(404, 'Sala no encontrada.')
  assertUnidadAccess(user, String(target.unidad))

  const ids = [canonicalId, ...duplicateIds]
  const rows = await fetchManagedUsers(ids)
  if (rows.length !== ids.length) throw publicError(404, 'Una o más cuentas ya no están disponibles.')
  await assertRowsInScope(user, rows)
  if (!duplicateIdentityMatches(rows)) throw publicError(409, 'Las cuentas ya no coinciden como duplicadas.')

  if (!rows.some((row) => Number(row.id) === canonicalId)) throw publicError(404, 'Cuenta principal no encontrada.')
  const columns = await getUsersColumns()

  await legacyTransaction(async (tx) => {
    const lockedRows = await tx.query<ManagedUserRow[]>(
      `SELECT id, nombre_nino, username, email, plaintext, role, unidad, sala${columns.has('password') ? ', password' : ''}
       FROM users
       WHERE id IN (${ids.map(() => '?').join(',')})
       FOR UPDATE`,
      ids
    )
    if (lockedRows.length !== ids.length || !duplicateIdentityMatches(lockedRows)) {
      throw publicError(409, 'Las cuentas cambiaron durante la consolidación. Actualiza e inténtalo de nuevo.')
    }
    const lockedCanonical = lockedRows.find((row) => Number(row.id) === canonicalId)
    if (!lockedCanonical) throw publicError(404, 'Cuenta principal no encontrada.')
    const bestPasswordRow = String(lockedCanonical.plaintext || '').trim() || String(lockedCanonical.password || '').trim()
      ? lockedCanonical
      : lockedRows.find((row) => String(row.plaintext || '').trim() || String(row.password || '').trim()) || lockedCanonical
    const canonicalEmail = normalizeEmail(lockedCanonical.email)
    const finalEmail = canonicalEmail || selectBestValue(lockedRows, 'email') || ''
    const finalUsername = String(lockedCanonical.username || '').trim() || finalEmail || `familia_${canonicalId}`

    const assignments = ['nombre_nino = ?', 'username = ?', 'email = ?', 'role = ?', 'unidad = ?', 'sala = ?']
    const params: Array<string | number | null> = [
      String(lockedCanonical.nombre_nino || '').trim() || selectBestValue(lockedRows, 'nombre_nino'),
      finalUsername,
      finalEmail,
      DAYCARE_FAMILY_ROLE,
      String(target.unidad),
      String(target.id)
    ]
    if (columns.has('plaintext')) {
      assignments.push('plaintext = ?')
      params.push(bestPasswordRow.plaintext || null)
    }
    if (columns.has('password')) {
      assignments.push('password = ?')
      params.push(bestPasswordRow.password || lockedCanonical.password || null)
    }
    await tx.write(`UPDATE users SET ${assignments.join(', ')} WHERE id = ?`, [...params, canonicalId])
    await mergeAuthorizedPeople(tx, canonicalId, duplicateIds)
    await mergeSimpleReferences(tx, canonicalId, duplicateIds)
    await archiveDuplicateUsers(tx, duplicateIds, columns)
  })

  return {
    canonicalId,
    merged: duplicateIds.length,
    target: { id: Number(target.id), sala: String(target.sala), unidad: String(target.unidad) }
  }
}
