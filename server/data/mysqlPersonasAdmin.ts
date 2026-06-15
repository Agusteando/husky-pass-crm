import type { RowDataPacket } from 'mysql2/promise'
import type { PersonasReadinessIssue, PersonasReadinessResponse, PersonasReadinessRow, PrintableAuthorizedPerson } from '~/types/daycare'
import type { SuperAdminPassSearchResponse } from '~/types/superadmin'
import { legacyOne, legacyQuery } from '~/server/utils/mysql'
import { listMarbeteTemplates, readMarbeteTemplateSvg, selectMarbeteTemplate, validateMarbeteRequirements } from '~/server/utils/marbeteTemplates'
import { readLastAccessActions } from '~/server/utils/personasConfig'
import { normalizePlantel, resolvePersonasTheme } from '~/utils/personasTheme'
import { normalizeMatricula } from '~/utils/matricula'

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

interface AdminPassDbRow extends RowDataPacket {
  personId: number
  indice: number | null
  qr: string | null
  paternoP: string | null
  maternoP: string | null
  nombreP: string | null
  parenP: string | null
  foto: string | null
  compressed_foto: string | null
  fechaP: string | null
  userId: number
  email: string | null
  username: string | null
  displayName: string | null
  nombre_nino: string | null
  campus: string | null
  empresa: string | null
  unidad: string | null
  plantel: string | null
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
  matriculaFoto: string | null
  credentialFoto: string | null
}

function clean(value?: string | number | null) {
  return String(value || '').trim()
}

function compactName(...parts: Array<string | null | undefined>) {
  return parts.map(clean).filter(Boolean).join(' ')
}

function derivedPlantel(row: Pick<ReadinessDbRow, 'plantel' | 'username' | 'campus' | 'empresa' | 'unidad'>) {
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

function unavailableTemplateMessage(error: unknown) {
  return error instanceof Error && error.message ? error.message : 'Marbete no disponible'
}

function selectTemplateOrIssue(
  templates: Awaited<ReturnType<typeof listMarbeteTemplates>>,
  input: Parameters<typeof selectMarbeteTemplate>[1]
) {
  try {
    return { template: selectMarbeteTemplate(templates, input), templateIssue: '' }
  } catch (error) {
    return { template: null, templateIssue: unavailableTemplateMessage(error) }
  }
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
         SUM(CASE WHEN COALESCE(foto, '') <> '' OR COALESCE(compressed_foto, '') LIKE '%vision=marks-ok%' THEN 1 ELSE 0 END) AS authorizedPhotoCount
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
    const { template, templateIssue } = selectTemplateOrIssue(templates, { matricula, plantel, nivelEdu: nivel, themeKey: theme.key })
    const hasStudentData = Boolean(studentName && nivel && grado && grupo && matricula)
    const hasParentAccess = Boolean(clean(row.email) || clean(row.username))
    const authorizedCount = Number(row.authorizedCount || 0)
    const authorizedPhotoCount = Number(row.authorizedPhotoCount || 0)
    const missingRegisteredPhotos = authorizedCount > 0 && authorizedPhotoCount < authorizedCount
    const hasPrintableReadiness = Boolean(template && hasStudentData && authorizedCount > 0 && !missingRegisteredPhotos)
    const issues: PersonasReadinessIssue[] = []
    if (authorizedCount <= 0) issues.push(issue('missingAuthorizedPeople', 'Sin personas autorizadas'))
    if (!hasStudentData) issues.push(issue('missingRequiredStudentData', 'Datos de alumno incompletos'))
    if (!hasPrintableReadiness) {
      issues.push(issue('missingPrintableReadiness', missingRegisteredPhotos ? 'Foto pendiente en persona registrada' : templateIssue || 'Marbete no disponible'))
    }
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
      authorizedCount,
      hasStudentData,
      hasPrintableReadiness,
      hasParentAccess,
      status: issues.length ? 'incomplete' : 'complete',
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

function passSearchSelect(where: string) {
  return `SELECT
      p.id AS personId,
      p.indice,
      CAST(p.id AS CHAR) AS qr,
      p.paternoP,
      p.maternoP,
      p.nombreP,
      p.parenP,
      p.foto,
      p.compressed_foto,
      p.fechaP,
      u.id AS userId,
      u.email,
      u.username,
      u.displayName,
      u.nombre_nino,
      u.campus,
      u.empresa,
      u.unidad,
      NULL AS plantel,
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
      m.foto AS matriculaFoto,
      c.foto AS credentialFoto
    FROM personas_autorizadas p
    INNER JOIN users u ON u.id = p.user_id
    LEFT JOIN (
      SELECT MIN(id) AS childId, user_id
      FROM alumno_pa
      WHERE user_id IS NOT NULL
      GROUP BY user_id
    ) first_ap ON first_ap.user_id = u.id
    LEFT JOIN alumno_pa ap ON ap.id = first_ap.childId
    LEFT JOIN matricula m ON UPPER(m.matricula) = UPPER(u.username)
    LEFT JOIN credenciales c ON UPPER(c.matricula) = UPPER(u.username)
    ${where}`
}

function adminPassPrintable(row: AdminPassDbRow): PrintableAuthorizedPerson {
  const matricula = normalizeMatricula(row.username)
  const plantel = derivedPlantel(row)
  const studentName = compactName(row.matriculaNombre || row.nombreA, row.matriculaPaterno || row.paternoA, row.matriculaMaterno || row.maternoA)
  const nivel = clean(row.matriculaNivel || row.nivelEdu)
  const grado = clean(row.matriculaGrado || row.grado)
  const grupo = clean(row.matriculaGrupo || row.grupo)
  const studentPhoto = clean(row.credentialFoto || row.matriculaFoto)

  return {
    id: Number(row.personId),
    indice: Number(row.indice || 1),
    qr: clean(row.qr || row.personId),
    paternoP: clean(row.paternoP),
    maternoP: clean(row.maternoP),
    nombreP: clean(row.nombreP),
    parenP: clean(row.parenP),
    foto: clean(row.foto),
    compressed_foto: clean(row.compressed_foto),
    fechaP: clean(row.fechaP),
    user_id: Number(row.userId),
    nivelEdu: nivel,
    plantel,
    matricula,
    fullnameA: studentName,
    fotoA: studentPhoto,
    gradoA: grado,
    grupoA: grupo,
    child: {
      id: row.childId ? Number(row.childId) : Number(row.userId),
      paternoA: clean(row.matriculaPaterno || row.paternoA),
      maternoA: clean(row.matriculaMaterno || row.maternoA),
      nombreA: clean(row.matriculaNombre || row.nombreA),
      grupo,
      grado,
      nivelEdu: nivel,
      campus: clean(row.childCampus || row.campus),
      plantel,
      matricula,
      foto: studentPhoto,
      user_id: Number(row.userId),
      isCurrent: true
    }
  }
}

export async function getSuperAdminPrintableAuthorizedPersona(personId: number) {
  const rows = await legacyQuery<AdminPassDbRow[]>(
    `${passSearchSelect('WHERE p.id = ?')}
     LIMIT 1`,
    [personId]
  )
  if (!rows.length) return null
  return adminPassPrintable(rows[0])
}

export async function searchSuperAdminPassCandidates(filters: { search?: string; plantel?: string; nivel?: string; limit?: number }, origin: string): Promise<SuperAdminPassSearchResponse> {
  const queryLimit = Math.min(Math.max(Number(filters.limit || 80), 10), 200)
  const search = clean(filters.search).toLowerCase()
  const params: Array<string | number | boolean | Date | null> = []
  let searchWhere = ''

  if (search) {
    const like = `%${search}%`
    searchWhere = `AND (
      LOWER(CONCAT_WS(' ', p.nombreP, p.paternoP, p.maternoP, p.parenP)) LIKE ?
      OR LOWER(CONCAT_WS(' ', m.nombres, m.apellido_paterno, m.apellido_materno, ap.nombreA, ap.paternoA, ap.maternoA, u.nombre_nino, u.displayName)) LIKE ?
      OR LOWER(COALESCE(u.email, '')) LIKE ?
      OR LOWER(COALESCE(u.username, '')) LIKE ?
      OR LOWER(CAST(p.id AS CHAR)) LIKE ?
    )`
    params.push(like, like, like, like, like)
  }

  const rows = await legacyQuery<AdminPassDbRow[]>(
    `${passSearchSelect(`WHERE p.user_id IS NOT NULL ${searchWhere}`)}
     ORDER BY p.id DESC
     LIMIT ${queryLimit}`,
    params
  )
  const templates = await listMarbeteTemplates()
  const mapped = await Promise.all(rows.map(async (row) => {
    const printable = adminPassPrintable(row)
    const theme = resolvePersonasTheme({
      matricula: printable.matricula,
      plantel: printable.plantel,
      nivelEdu: printable.nivelEdu,
      campus: row.childCampus || row.campus
    })
    const { template, templateIssue } = selectTemplateOrIssue(templates, {
      matricula: printable.matricula,
      plantel: printable.plantel,
      nivelEdu: printable.nivelEdu,
      themeKey: theme.key
    })
    let readiness = { ok: false, issues: [templateIssue || 'Plantilla de Husky Pass no disponible.'] }
    if (template) {
      const svg = await readMarbeteTemplateSvg(template)
      readiness = validateMarbeteRequirements(svg, printable, origin)
    }
    return {
      personId: printable.id ? Number(printable.id) : null,
      userId: Number(row.userId),
      indice: printable.indice ? Number(printable.indice) : null,
      authorizedName: compactName(printable.nombreP, printable.paternoP, printable.maternoP) || 'Persona autorizada pendiente',
      parentesco: clean(printable.parenP) || null,
      authorizedPhoto: clean(printable.compressed_foto || printable.foto) || null,
      studentName: clean(printable.fullnameA) || clean(row.nombre_nino) || 'Alumno pendiente',
      matricula: clean(printable.matricula) || null,
      plantel: clean(printable.plantel),
      nivel: clean(printable.nivelEdu) || 'Sin nivel',
      grado: clean(printable.gradoA) || null,
      grupo: clean(printable.grupoA) || null,
      contact: clean(row.email) || clean(row.username) || null,
      theme,
      template: template || null,
      readiness
    }
  }))

  const plantelFilter = clean(filters.plantel).toUpperCase()
  const nivelFilter = clean(filters.nivel).toLowerCase()
  const filtered = mapped.filter((row) => {
    if (plantelFilter && row.plantel !== plantelFilter) return false
    if (nivelFilter && !row.nivel.toLowerCase().includes(nivelFilter)) return false
    return true
  })
  const planteles = Array.from(new Set(mapped.map((row) => row.plantel).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'))
  const niveles = Array.from(new Set(mapped.map((row) => row.nivel).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'))

  return {
    rows: filtered,
    planteles,
    niveles,
    filters: {
      search: filters.search || '',
      plantel: plantelFilter,
      nivel: filters.nivel || '',
      limit: queryLimit
    }
  }
}
