import type { RowDataPacket } from 'mysql2/promise'
import type { PersonasReadinessIssue, PersonasReadinessResponse, PersonasReadinessRow } from '~/types/daycare'
import { legacyOne, legacyQuery } from '~/server/utils/mysql'
import { listMarbeteTemplates, selectMarbeteTemplate } from '~/server/utils/marbeteTemplates'
import { readLastAccessActions } from '~/server/utils/personasConfig'
import { normalizeMatricula, normalizePlantel, resolvePersonasTheme } from '~/utils/personasTheme'

interface ReadinessDbRow extends RowDataPacket {
  userId: number
  email: string | null
  username: string | null
  plaintext: string | null
  displayName: string | null
  plantel: string | null
  campus: string | null
  empresa: string | null
  unidad: string | null
  sala: string | null
  nombre_nino: string | null
  role: string | null
  childId: number | null
  paternoA: string | null
  maternoA: string | null
  nombreA: string | null
  grupo: string | null
  grado: string | null
  nivelEdu: string | null
  childCampus: string | null
  matriculaNombre: string | null
  matriculaPaterno: string | null
  matriculaMaterno: string | null
  matriculaNivel: string | null
  matriculaGrado: string | null
  matriculaGrupo: string | null
  authorizedCount: number
  authorizedPhotoCount: number
  credentialId: number | null
  credentialFoto: string | null
}

interface AccessUserRow extends RowDataPacket {
  id: number
  email: string | null
  username: string | null
  plaintext: string | null
  displayName: string | null
  nombre_nino: string | null
}

function clean(value?: string | number | null) {
  return String(value || '').trim()
}

function compactName(...parts: Array<string | null | undefined>) {
  return parts.map(clean).filter(Boolean).join(' ')
}

function derivedPlantel(row: ReadinessDbRow) {
  const explicit = clean(row.plantel)
  if (explicit) return normalizePlantel(explicit)
  const username = normalizeMatricula(row.username)
  if (username.startsWith('PREEM')) return 'PREEM'
  if (username.startsWith('PREET')) return 'PREET'
  if (username.startsWith('PM')) return 'PM'
  if (username.startsWith('PT')) return 'PT'
  if (username.startsWith('SM')) return 'SM'
  if (username.startsWith('ST')) return 'ST'
  if (username.startsWith('DM')) return 'CM'
  return normalizePlantel(username.slice(0, 2) || row.campus || row.empresa || row.unidad)
}

function issue(key: PersonasReadinessIssue['key'], label: string): PersonasReadinessIssue {
  return { key, label }
}

export async function getPersonasReadiness(filters: { plantel?: string; nivel?: string; status?: string; search?: string; limit?: number } = {}): Promise<PersonasReadinessResponse> {
  const queryLimit = Math.min(Math.max(Number(filters.limit || 120), 25), 400)
  const rows = await legacyQuery<ReadinessDbRow[]>(
    `SELECT
      u.id AS userId,
      u.email,
      u.username,
      u.plaintext,
      u.displayName,
      NULL AS plantel,
      u.campus,
      u.empresa,
      u.unidad,
      u.sala,
      u.nombre_nino,
      u.role,
      ap.id AS childId,
      ap.paternoA,
      ap.maternoA,
      ap.nombreA,
      ap.grupo,
      ap.grado,
      ap.nivelEdu,
      ap.campus AS childCampus,
      m.nombres AS matriculaNombre,
      m.apellido_paterno AS matriculaPaterno,
      m.apellido_materno AS matriculaMaterno,
      m.nivel AS matriculaNivel,
      m.grado AS matriculaGrado,
      m.grupo AS matriculaGrupo,
      COALESCE(pa.authorizedCount, 0) AS authorizedCount,
      COALESCE(pa.authorizedPhotoCount, 0) AS authorizedPhotoCount,
      c.id AS credentialId,
      c.foto AS credentialFoto
     FROM users u
     LEFT JOIN (
       SELECT MIN(id) AS childId, user_id
       FROM alumno_pa
       WHERE user_id IS NOT NULL
       GROUP BY user_id
     ) first_ap ON first_ap.user_id = u.id
     LEFT JOIN alumno_pa ap ON ap.id = first_ap.childId
     LEFT JOIN matricula m ON m.matricula = u.username
     LEFT JOIN (
       SELECT
         user_id,
         COUNT(*) AS authorizedCount,
         SUM(CASE WHEN COALESCE(compressed_foto, foto, '') <> '' THEN 1 ELSE 0 END) AS authorizedPhotoCount
       FROM personas_autorizadas
       WHERE user_id IS NOT NULL
       GROUP BY user_id
     ) pa ON pa.user_id = u.id
     LEFT JOIN credenciales c ON c.matricula = u.username
     WHERE
       u.id IN (SELECT DISTINCT user_id FROM alumno_pa WHERE user_id IS NOT NULL)
       OR u.id IN (SELECT DISTINCT user_id FROM personas_autorizadas WHERE user_id IS NOT NULL)
       OR EXISTS (
         SELECT 1
         FROM rutas_rol rr
         WHERE FIND_IN_SET(rr.role, REPLACE(COALESCE(u.role, ''), ' ', '')) > 0
           AND rr.route REGEXP 'personas[_/-]?autorizadas|persona[-_]?autorizada|credencial|validar'
       )
     ORDER BY COALESCE(NULLIF(u.campus, ''), u.empresa, '') ASC, u.id DESC
     LIMIT ${queryLimit}`
  )

  const templates = await listMarbeteTemplates()
  const lastAccessActions = await readLastAccessActions()
  const mapped = rows.map((row) => {
    const studentName = compactName(row.matriculaNombre || row.nombreA, row.matriculaPaterno || row.paternoA, row.matriculaMaterno || row.maternoA)
    const nivel = clean(row.matriculaNivel || row.nivelEdu)
    const grado = clean(row.matriculaGrado || row.grado)
    const grupo = clean(row.matriculaGrupo || row.grupo)
    const plantel = derivedPlantel(row)
    const matricula = normalizeMatricula(row.username)
    const theme = resolvePersonasTheme({ matricula, plantel, nivelEdu: nivel, campus: row.childCampus || row.campus })
    const template = selectMarbeteTemplate(templates, { matricula, plantel, nivelEdu: nivel, themeKey: theme.key })
    const hasStudentData = Boolean(studentName && nivel && grado && grupo && matricula)
    const hasParentAccess = Boolean(clean(row.email) || clean(row.username))
    const hasPrintableReadiness = Boolean(template && hasStudentData && Number(row.authorizedCount) > 0 && Number(row.authorizedPhotoCount) > 0)
    const issues: PersonasReadinessIssue[] = []
    if (Number(row.authorizedCount) <= 0) issues.push(issue('missingAuthorizedPeople', 'Sin personas autorizadas'))
    if (!hasStudentData) issues.push(issue('missingRequiredStudentData', 'Datos de alumno incompletos'))
    if (!hasPrintableReadiness) issues.push(issue('missingPrintableReadiness', 'Marbete/credencial no listo'))
    if (!hasParentAccess) issues.push(issue('missingParentAccess', 'Sin acceso o contacto familiar'))

    const blocked = !hasParentAccess
    if (blocked) issues.push(issue('blocked', 'Bloqueado por falta de contacto'))

    const rowOut: PersonasReadinessRow = {
      userId: Number(row.userId),
      displayName: clean(row.displayName) || studentName || clean(row.nombre_nino) || matricula || `Familia ${row.userId}`,
      email: clean(row.email) || null,
      username: matricula || clean(row.username) || null,
      contact: clean(row.email) || matricula || null,
      plantel,
      nivel: nivel || 'Sin nivel',
      grado: grado || null,
      grupo: grupo || null,
      studentName: studentName || clean(row.nombre_nino) || 'Alumno pendiente',
      familyLabel: clean(row.nombre_nino) || studentName || clean(row.displayName) || matricula || `Familia ${row.userId}`,
      authorizedCount: Number(row.authorizedCount || 0),
      hasStudentData,
      hasPrintableReadiness,
      hasParentAccess,
      status: blocked ? 'blocked' : issues.length ? 'incomplete' : 'complete',
      issues,
      templateId: template?.id || null,
      templateName: template?.name || null,
      theme,
      lastAccessActionAt: lastAccessActions.get(Number(row.userId)) || null
    }
    return rowOut
  })

  const plantelFilter = clean(filters.plantel).toUpperCase()
  const nivelFilter = clean(filters.nivel).toLowerCase()
  const statusFilter = clean(filters.status)
  const search = clean(filters.search).toLowerCase()
  const filtered = mapped.filter((row) => {
    if (plantelFilter && row.plantel !== plantelFilter) return false
    if (nivelFilter && !row.nivel.toLowerCase().includes(nivelFilter)) return false
    if (statusFilter && statusFilter !== 'all' && row.status !== statusFilter && !row.issues.some((item) => item.key === statusFilter)) return false
    if (search) {
      const haystack = [row.displayName, row.email, row.username, row.studentName, row.familyLabel, row.plantel, row.nivel, row.grupo].join(' ').toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })

  const planteles = Array.from(new Set(mapped.map((row) => row.plantel).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'))
  const niveles = Array.from(new Set(mapped.map((row) => row.nivel).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'))

  return {
    rows: filtered,
    planteles,
    niveles,
    metrics: {
      total: filtered.length,
      complete: filtered.filter((row) => row.status === 'complete').length,
      incomplete: filtered.filter((row) => row.status === 'incomplete').length,
      blocked: filtered.filter((row) => row.status === 'blocked').length,
      missingAuthorizedPeople: filtered.filter((row) => row.issues.some((item) => item.key === 'missingAuthorizedPeople')).length,
      missingRequiredStudentData: filtered.filter((row) => row.issues.some((item) => item.key === 'missingRequiredStudentData')).length,
      missingPrintableReadiness: filtered.filter((row) => row.issues.some((item) => item.key === 'missingPrintableReadiness')).length,
      missingParentAccess: filtered.filter((row) => row.issues.some((item) => item.key === 'missingParentAccess')).length
    },
    filters: {
      plantel: plantelFilter,
      nivel: filters.nivel || '',
      status: statusFilter || 'all',
      search: filters.search || '',
      limit: queryLimit
    }
  }
}

export async function getPersonasAccessUser(userId: number) {
  return legacyOne<AccessUserRow>(
    `SELECT id, email, username, plaintext, displayName, nombre_nino
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId]
  )
}
