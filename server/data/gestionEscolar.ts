import { randomUUID } from 'node:crypto'
import type { RowDataPacket } from 'mysql2/promise'
import type { AppSessionUser } from '~/types/session'
import type {
  FamilyScopedContentResponse,
  GestionEscolarAuditRecord,
  GestionEscolarCapability,
  GestionEscolarContentKind,
  GestionEscolarContentStatus,
  GestionEscolarFamiliesResponse,
  GestionEscolarFamilyDetailResponse,
  GestionEscolarFamilyRow,
  GestionEscolarModuleKey,
  GestionEscolarModuleSummary,
  GestionEscolarOverviewResponse,
  GestionEscolarPermission,
  GestionEscolarReachPreview,
  GestionEscolarScope,
  GestionEscolarScopeTree,
  GestionEscolarScopedContentItem,
  GestionEscolarScopedContentResponse,
  SaveGestionEscolarScopedContentInput
} from '~/types/gestionEscolar'
import type { CommunicationAdminScopeInput } from '~/types/communications'
import type { AuthorizedChild } from '~/types/daycare'
import { findLegacyUserById } from '~/server/data/mysqlAuth'
import { resolveAssignedSchoolPlanteles } from '~/server/data/userPlantelScope'
import { getFamilyChildren } from '~/server/data/mysqlDaycare'
import { csvToList, legacyOne, legacyQuery, legacyWrite } from '~/server/utils/mysql'
import { publicError } from '~/server/utils/httpError'
import { readPersonasConfig, resolveSurveyForStudent } from '~/server/utils/personasConfig'
import { DAYCARE_ADMIN_ROLE, DAYCARE_FAMILY_ROLE, SCHOOL_ADMIN_ROLE, hasRoleToken, hasSchoolAdminScope } from '~/utils/sessionScopes'
import { displayMatriculaCandidate, normalizeMatricula } from '~/utils/matricula'
import { SCHOOL_PLANTELES, normalizeSchoolGrade, normalizeSchoolPlantel, schoolGradesForPlantel } from '~/utils/schoolCatalog'
import { normalizeEmail } from '~/utils/superAdmin'
import { GESTION_ESCOLAR_BASE_CAPABILITIES, GESTION_ESCOLAR_CAPABILITIES } from '~/utils/gestionPermissions'

interface GestionPermissionRow extends RowDataPacket {
  id: number
  user_id: number
  capability: GestionEscolarCapability | string | null
  enabled: number | boolean | null
  is_global: number | boolean | null
  plantel: string | null
  nivel: string | null
  grado: string | null
  grupo: string | null
  assigned_by: number | null
  updated_by: number | null
  created_at: string | null
  updated_at: string | null
}

interface GestionContentRow extends RowDataPacket {
  id: number
  uid: string
  kind: GestionEscolarContentKind | string
  title: string | null
  summary: string | null
  url: string | null
  embed_url: string | null
  status: GestionEscolarContentStatus | string | null
  is_global: number | boolean | null
  plantel: string | null
  nivel: string | null
  grado: string | null
  grupo: string | null
  created_by: number | null
  updated_by: number | null
  published_by: number | null
  created_at: string | null
  updated_at: string | null
  published_at: string | null
  active_from: string | null
  active_until: string | null
}

interface GestionFamilyDbRow extends RowDataPacket {
  userId: number
  email: string | null
  username: string | null
  displayName: string | null
  role: string | null
  campus: string | null
  empresa: string | null
  unidad: string | null
  nombre_nino: string | null
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
  authorizedCount: number | string | null
  credentialId: number | null
  credentialFoto: string | null
}

interface AuthorizedPersonRow extends RowDataPacket {
  id: number
  paternoP: string | null
  maternoP: string | null
  nombreP: string | null
  parenP: string | null
  foto: string | null
  compressed_foto: string | null
}

const MODULE_CAPABILITIES: Record<GestionEscolarModuleKey, GestionEscolarCapability[]> = {
  familias: ['familias.view', 'familias.impersonate'],
  comunicados: ['comunicados.create', 'comunicados.publish'],
  encuestas: ['encuestas.manage'],
  convenios: ['convenios.manage', 'convenios.publish']
}

const SCHOOL_GESTION_OVERVIEW_LIMIT = 1200
const SCHOOL_GESTION_OPTIONS_LIMIT = 1200
const SCHOOL_GESTION_LIST_LIMIT = 1600
const DAYCARE_GESTION_TEXT = /guarder[ií]a|lactantes|maternal/i

function clean(value: unknown) {
  return String(value ?? '').trim()
}

function upper(value: unknown) {
  return clean(value).toUpperCase()
}

function toIso(value?: string | null) {
  const raw = clean(value)
  if (!raw) return null
  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw
  return raw.replace(' ', 'T').replace(/(\.\d{3})?$/, (match) => match || '.000') + 'Z'
}

function toMysqlDate(value?: string | null) {
  const raw = clean(value)
  if (!raw) return null
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw.slice(0, 19).replace('T', ' ')
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

function isGestionSchemaMissing(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const candidate = error as { code?: string; message?: string }
  return candidate.code === 'ER_NO_SUCH_TABLE' || /gestion_escolar_/i.test(candidate.message || '')
}

async function gestionQuery<T extends RowDataPacket[]>(sql: string, params: Array<string | number | boolean | null> = []) {
  try {
    return await legacyQuery<T>(sql, params)
  } catch (error) {
    if (isGestionSchemaMissing(error)) return [] as unknown as T
    throw error
  }
}

async function gestionWrite(sql: string, params: Array<string | number | boolean | null> = []) {
  try {
    return await legacyWrite(sql, params)
  } catch (error) {
    if (isGestionSchemaMissing(error)) {
      throw publicError(503, 'Escolar requiere aplicar la migracion SQL antes de guardar cambios.')
    }
    throw error
  }
}

function normalizeCapability(value: unknown): GestionEscolarCapability | null {
  const capability = clean(value) as GestionEscolarCapability
  return GESTION_ESCOLAR_CAPABILITIES.includes(capability) ? capability : null
}

export function normalizeGestionScope(input: GestionEscolarScope = {}): Required<GestionEscolarScope> {
  const isGlobal = Boolean(input.isGlobal)
  const plantel = isGlobal ? null : normalizeSchoolPlantel(input.plantel)
  return {
    isGlobal,
    plantel,
    nivel: null,
    grado: isGlobal ? null : normalizeSchoolGrade(input.grado, plantel) || null,
    grupo: null
  }
}

function scopeKey(scope: GestionEscolarScope) {
  const normalized = normalizeGestionScope(scope)
  return [normalized.isGlobal ? 'global' : 'scope', normalized.plantel || '', normalized.nivel || '', normalized.grado || '', normalized.grupo || ''].join('|')
}

export function formatGestionScopeLabel(scope: GestionEscolarScope) {
  const normalized = normalizeGestionScope(scope)
  if (normalized.isGlobal) return 'Todas las familias'
  return [
    normalized.plantel && `Plantel ${normalized.plantel}`,
    normalized.nivel,
    normalized.grado && `Grado ${normalized.grado}`,
    normalized.grupo && `Grupo ${normalized.grupo}`
  ].filter(Boolean).join(' · ') || 'Plantel por definir'
}

function gradeMatches(scopeGrade?: string | null, value?: string | null, plantel?: string | null) {
  const normalized = normalizeSchoolGrade(scopeGrade, plantel)
  if (!normalized) return true
  return normalized === normalizeSchoolGrade(value, plantel)
}

export function gestionScopeCoversTarget(scope: GestionEscolarScope, target: GestionEscolarScope) {
  const normalized = normalizeGestionScope(scope)
  if (normalized.isGlobal) return true
  const targetScope = normalizeGestionScope(target)
  if (!normalized.plantel || normalized.plantel !== targetScope.plantel) return false
  if (normalized.nivel && upper(normalized.nivel) !== upper(targetScope.nivel)) return false
  if (normalized.grado && !gradeMatches(normalized.grado, targetScope.grado, normalized.plantel)) return false
  if (normalized.grupo && normalized.grupo !== targetScope.grupo) return false
  return true
}

function scopeSpecificity(scope: GestionEscolarScope) {
  const normalized = normalizeGestionScope(scope)
  if (normalized.isGlobal) return 0
  return [normalized.plantel, normalized.nivel, normalized.grado, normalized.grupo].filter(Boolean).length
}

function targetFromChild(child: Partial<AuthorizedChild> | null | undefined): GestionEscolarScope {
  const plantel = deriveSchoolPlantelFromFamilyData({ matricula: child?.matricula, plantel: child?.plantel, campus: child?.campus })
  return normalizeGestionScope({
    plantel,
    grado: child?.grado || null
  })
}

function deriveSchoolPlantelFromFamilyData(input: { matricula?: string | null; plantel?: string | null; campus?: string | null }) {
  return normalizeSchoolPlantel(input.matricula) || normalizeSchoolPlantel(input.plantel) || normalizeSchoolPlantel(input.campus) || null
}

function derivedPlantel(input: { username?: string | null; campus?: string | null; empresa?: string | null; unidad?: string | null; childCampus?: string | null }) {
  return normalizeSchoolPlantel(input.username) || 'SIN PLANTEL'
}

function compactName(...parts: Array<string | null | undefined>) {
  return parts.map(clean).filter(Boolean).join(' ')
}



export async function auditGestionAction(record: Omit<GestionEscolarAuditRecord, 'eventId'> & { eventId?: string }) {
  const eventId = record.eventId || `ge-${randomUUID()}`
  try {
    await legacyWrite(
      `INSERT INTO gestion_escolar_audit (event_uid, actor_user_id, target_user_id, action, module, capability, scope_json, metadata_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
      [
        eventId,
        record.actorUserId,
        record.targetUserId || null,
        record.action,
        record.module || null,
        record.capability || null,
        record.scope ? JSON.stringify(record.scope) : null,
        record.metadata ? JSON.stringify(record.metadata) : null
      ]
    )
  } catch (error) {
    if (!isGestionSchemaMissing(error)) throw error
  }
  return eventId
}

export async function auditGestionImpersonation(input: {
  actorUserId: number
  targetUserId: number
  action: 'start' | 'exit' | 'denied'
  reason?: string | null
  scope?: GestionEscolarScope | null
  metadata?: Record<string, unknown> | null
}) {
  try {
    await legacyWrite(
      `INSERT INTO gestion_escolar_impersonation_audit (event_uid, actor_user_id, target_user_id, action, reason, scope_json, metadata_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
      [
        `ge-imp-${randomUUID()}`,
        input.actorUserId,
        input.targetUserId,
        input.action,
        clean(input.reason) || null,
        input.scope ? JSON.stringify(input.scope) : null,
        input.metadata ? JSON.stringify(input.metadata) : null
      ]
    )
  } catch (error) {
    if (!isGestionSchemaMissing(error)) throw error
  }
}

function permissionsForCapability(permissions: GestionEscolarPermission[], capability: GestionEscolarCapability) {
  return permissions.filter((permission) => permission.enabled && permission.capability === capability)
}

export async function getGestionCapabilities(user: AppSessionUser) {
  if (user.isSuperAdmin) return [...GESTION_ESCOLAR_CAPABILITIES]
  if (!hasSchoolAdminScope(user)) return []
  const permissions = await effectiveGestionPermissionsForUser(user)
  return Array.from(new Set(permissions.map((permission) => permission.capability)))
}

export async function assertGestionCapability(user: AppSessionUser, capability: GestionEscolarCapability, target: GestionEscolarScope) {
  if (user.isSuperAdmin) return
  if (!hasSchoolAdminScope(user)) {
    throw publicError(403, 'Escolar no esta habilitado para esta cuenta.')
  }
  const permissions = permissionsForCapability(await effectiveGestionPermissionsForUser(user), capability)
  const normalizedTarget = normalizeGestionScope(target)
  if (permissions.some((permission) => gestionScopeCoversTarget(permission, normalizedTarget))) return
  throw publicError(403, 'No tienes permiso para esta acción.')
}

function canUseCapability(permissions: GestionEscolarPermission[], capability: GestionEscolarCapability, target?: GestionEscolarScope) {
  if (!target) return permissions.some((permission) => permission.capability === capability)
  return permissions.some((permission) => permission.capability === capability && gestionScopeCoversTarget(permission, target))
}

function superAdminGestionPermissions(userId: number): GestionEscolarPermission[] {
  return GESTION_ESCOLAR_CAPABILITIES.map((capability) => ({
    userId,
    capability,
    enabled: true,
    isGlobal: true,
    plantel: null,
    nivel: null,
    grado: null,
    grupo: null
  }))
}

async function effectiveGestionPermissionsForUser(user: AppSessionUser) {
  if (user.isSuperAdmin) return superAdminGestionPermissions(user.id)
  if (!hasSchoolAdminScope(user)) return []

  const planteles = await resolveAssignedSchoolPlanteles(user)
  if (!planteles.length) return []

  const rows = await gestionQuery<GestionPermissionRow[]>(
    `SELECT id, user_id, capability, enabled, is_global, plantel, nivel, grado, grupo, assigned_by, updated_by, created_at, updated_at
     FROM gestion_escolar_permissions
     WHERE user_id = ? AND enabled = 1
     ORDER BY capability ASC, id ASC`,
    [user.id]
  )
  const rowByCapability = new Map<GestionEscolarCapability, GestionPermissionRow>()
  for (const row of rows) {
    const capability = normalizeCapability(row.capability)
    if (capability && !rowByCapability.has(capability)) rowByCapability.set(capability, row)
  }

  const capabilities = new Set<GestionEscolarCapability>(GESTION_ESCOLAR_BASE_CAPABILITIES)
  for (const capability of rowByCapability.keys()) capabilities.add(capability)

  const permissions: GestionEscolarPermission[] = []
  for (const capability of capabilities) {
    const row = rowByCapability.get(capability)
    for (const plantel of planteles) {
      permissions.push({
        id: row ? Number(row.id) : undefined,
        userId: user.id,
        capability,
        enabled: true,
        isGlobal: false,
        plantel,
        nivel: null,
        grado: null,
        grupo: null,
        assignedBy: row?.assigned_by ? Number(row.assigned_by) : null,
        updatedBy: row?.updated_by ? Number(row.updated_by) : null,
        createdAt: row ? toIso(row.created_at) : null,
        updatedAt: row ? toIso(row.updated_at) : null
      })
    }
  }
  return permissions
}


export async function getGestionCommunicationScopes(user: AppSessionUser): Promise<CommunicationAdminScopeInput[]> {
  if (user.isSuperAdmin) return [{ isGlobal: true, plantel: null, nivel: null, grado: null, grupo: null, canCreate: true, canPublish: true }]
  if (!hasSchoolAdminScope(user)) return []
  const permissions = await effectiveGestionPermissionsForUser(user)
  const map = new Map<string, CommunicationAdminScopeInput>()
  for (const permission of permissions) {
    if (permission.capability !== 'comunicados.create' && permission.capability !== 'comunicados.publish') continue
    const key = scopeKey(permission)
    const existing = map.get(key) || {
      isGlobal: permission.isGlobal,
      plantel: permission.plantel,
      nivel: permission.nivel,
      grado: permission.grado,
      grupo: permission.grupo,
      canCreate: false,
      canPublish: false
    }
    if (permission.capability === 'comunicados.create') existing.canCreate = true
    if (permission.capability === 'comunicados.publish') existing.canPublish = true
    map.set(key, existing)
  }
  return Array.from(map.values())
}

async function loadSchoolFamilies(limit = 1200) {
  const cappedLimit = Math.min(Math.max(limit, 1), 8000)
  const [childCandidates, pickupCandidates] = await Promise.all([
    legacyQuery<(RowDataPacket & { userId: number })[]>(
      `SELECT DISTINCT user_id AS userId
       FROM alumno_pa
       WHERE user_id IS NOT NULL
       LIMIT ${cappedLimit}`
    ),
    legacyQuery<(RowDataPacket & { userId: number })[]>(
      `SELECT DISTINCT user_id AS userId
       FROM personas_autorizadas
       WHERE user_id IS NOT NULL
       LIMIT ${cappedLimit}`
    )
  ])
  const ids = Array.from(new Set([...childCandidates, ...pickupCandidates].map((row) => Number(row.userId)).filter(Boolean))).slice(0, cappedLimit)
  if (!ids.length) return []
  const placeholders = ids.map(() => '?').join(',')
  const rows = await legacyQuery<GestionFamilyDbRow[]>(
    `SELECT
      u.id AS userId,
      u.email,
      u.username,
      u.displayName,
      u.role,
      u.campus,
      u.empresa,
      u.unidad,
      u.nombre_nino,
      NULL AS childId,
      NULL AS paternoA,
      NULL AS maternoA,
      NULL AS nombreA,
      NULL AS grupo,
      NULL AS grado,
      NULL AS nivelEdu,
      NULL AS childCampus,
      m.nombres AS matriculaNombre,
      m.apellido_paterno AS matriculaPaterno,
      m.apellido_materno AS matriculaMaterno,
      m.nivel AS matriculaNivel,
      m.grado AS matriculaGrado,
      m.grupo AS matriculaGrupo,
      0 AS authorizedCount,
      c.id AS credentialId,
      c.foto AS credentialFoto
     FROM users u
     LEFT JOIN matricula m ON m.matricula = u.username
     LEFT JOIN credenciales c ON c.matricula = u.username
     WHERE u.id IN (${placeholders})
     ORDER BY COALESCE(NULLIF(u.campus, ''), u.empresa, u.unidad, '') ASC, u.id DESC`,
    ids
  )
  if (!rows.length) return []

  const [childRows, countRows] = await Promise.all([
    legacyQuery<GestionFamilyDbRow[]>(
      `SELECT
        first_ap.user_id AS userId,
        ap.id AS childId,
        ap.paternoA,
        ap.maternoA,
        ap.nombreA,
        ap.grupo,
        ap.grado,
        ap.nivelEdu,
        ap.campus AS childCampus
       FROM (
         SELECT user_id, MIN(id) AS childId
         FROM alumno_pa
         WHERE user_id IN (${placeholders})
         GROUP BY user_id
       ) first_ap
       INNER JOIN alumno_pa ap ON ap.id = first_ap.childId`,
      ids
    ),
    legacyQuery<(RowDataPacket & { userId: number; authorizedCount: number })[]>(
      `SELECT user_id AS userId, COUNT(*) AS authorizedCount
       FROM personas_autorizadas
       WHERE user_id IN (${placeholders})
       GROUP BY user_id`,
      ids
    )
  ])
  const childByUser = new Map(childRows.map((row) => [Number(row.userId), row]))
  const countByUser = new Map(countRows.map((row) => [Number(row.userId), Number(row.authorizedCount || 0)]))

  return rows
    .map((row) => {
      const merged = {
        ...row,
        ...(childByUser.get(Number(row.userId)) || {}),
        authorizedCount: countByUser.get(Number(row.userId)) || 0
      } as GestionFamilyDbRow
      const family = familyFromDbRow(merged)
      return { family, merged }
    })
    .filter(({ family, merged }) => isSchoolGestionFamily(family, merged))
    .map(({ family }) => family)
}

function familyFromDbRow(row: GestionFamilyDbRow): GestionEscolarFamilyRow {
  const matricula = normalizeMatricula(row.username) || null
  const plantel = derivedPlantel(row)
  const nivel = clean(row.matriculaNivel || row.nivelEdu) || null
  const grado = normalizeSchoolGrade(row.matriculaGrado || row.grado, plantel)
  const grupo = upper(row.matriculaGrupo || row.grupo) || null
  const studentName = compactName(row.matriculaNombre || row.nombreA, row.matriculaPaterno || row.paternoA, row.matriculaMaterno || row.maternoA) || clean(row.nombre_nino) || displayMatriculaCandidate(matricula) || `Familia ${row.userId}`
  const authorizedPeople = Number(row.authorizedCount || 0)
  const hasContact = Boolean(clean(row.email))
  const features = ['Personas autorizadas', 'Comunicados', 'Pagos', 'Asistencia']
  return {
    userId: Number(row.userId),
    displayName: clean(row.displayName) || studentName,
    email: clean(row.email) || null,
    username: displayMatriculaCandidate(matricula || clean(row.username)) || null,
    studentName,
    matricula,
    plantel,
    nivel,
    grado,
    grupo,
    authorizedPeople,
    parentStatus: hasContact && matricula ? 'active' : hasContact || matricula ? 'limited' : 'incomplete',
    contactSignals: [
      hasContact ? 'Correo vinculado' : 'Correo pendiente',
      row.credentialId || row.credentialFoto ? 'Foto disponible' : 'Foto por confirmar',
      authorizedPeople ? `${authorizedPeople} personas autorizadas` : 'Sin personas autorizadas'
    ],
    features,
    canImpersonate: false,
    recentActivity: authorizedPeople ? ['Red de recogida configurada'] : ['Registro familiar incompleto']
  }
}

function familyScope(family: GestionEscolarFamilyRow): GestionEscolarScope {
  return normalizeGestionScope({
    plantel: family.plantel,
    nivel: family.nivel,
    grado: family.grado,
    grupo: family.grupo
  })
}

function isSchoolGestionFamily(family: GestionEscolarFamilyRow, row?: Pick<GestionFamilyDbRow, 'role' | 'empresa' | 'unidad' | 'campus' | 'childCampus'>) {
  const plantel = normalizeSchoolPlantel(family.plantel)
  if (!plantel) return false

  const roleTokens = csvToList(String(row?.role || ''))
  if (hasRoleToken(roleTokens, DAYCARE_FAMILY_ROLE)) return false

  const text = [family.nivel, family.grado, family.grupo, row?.empresa, row?.unidad, row?.campus, row?.childCampus].map(clean).join(' ')
  if (DAYCARE_GESTION_TEXT.test(text) && !family.matricula) return false

  return true
}

function familiesForPermissions(families: GestionEscolarFamilyRow[], permissions: GestionEscolarPermission[], capability?: GestionEscolarCapability) {
  const scoped = capability ? permissionsForCapability(permissions, capability) : permissions
  return families.filter((family) => scoped.some((permission) => gestionScopeCoversTarget(permission, familyScope(family))))
}

function plantelesFromPermissions(permissions: GestionEscolarPermission[], capability?: GestionEscolarCapability) {
  const scoped = capability ? permissionsForCapability(permissions, capability) : permissions
  if (scoped.some((permission) => permission.isGlobal)) return [...SCHOOL_PLANTELES]
  return [...SCHOOL_PLANTELES].filter((plantel) => scoped.some((permission) => permission.plantel === plantel))
}

function reachFromFamilies(families: GestionEscolarFamilyRow[], assignedPlanteles: string[] = []): GestionEscolarReachPreview {
  const observedPlanteles = [...SCHOOL_PLANTELES].filter((plantel) => families.some((family) => family.plantel === plantel))
  return {
    families: new Set(families.map((family) => family.userId)).size,
    students: families.length,
    planteles: assignedPlanteles.length ? assignedPlanteles : observedPlanteles,
    niveles: Array.from(new Set(families.map((family) => family.nivel).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, 'es')),
    grados: Array.from(new Set(families.map((family) => normalizeSchoolGrade(family.grado, family.plantel)).filter(Boolean) as string[])).sort((a, b) => schoolGradesForPlantel('PM').indexOf(a as never) - schoolGradesForPlantel('PM').indexOf(b as never)),
    grupos: Array.from(new Set(families.map((family) => family.grupo).filter(Boolean) as string[])).sort()
  }
}

function treeNode(value: string, families: GestionEscolarFamilyRow[]): GestionEscolarScopeTree['planteles'][number] {
  return {
    value,
    label: value,
    families: new Set(families.map((family) => family.userId)).size,
    students: families.length
  }
}

function uniqueSorted(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map(clean).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
}

function buildScopeTree(families: GestionEscolarFamilyRow[], planteles: string[]): GestionEscolarScopeTree {
  return {
    planteles: planteles.map((plantel) => {
      const plantelFamilies = families.filter((family) => family.plantel === plantel)
      const plantelNode = treeNode(plantel, plantelFamilies)
      plantelNode.children = uniqueSorted(plantelFamilies.map((family) => family.nivel)).map((nivel) => {
        const nivelFamilies = plantelFamilies.filter((family) => family.nivel === nivel)
        const nivelNode = treeNode(nivel, nivelFamilies)
        nivelNode.children = uniqueSorted(nivelFamilies.map((family) => family.grado)).map((grado) => {
          const gradoFamilies = nivelFamilies.filter((family) => family.grado === grado)
          const gradoNode = treeNode(grado, gradoFamilies)
          gradoNode.children = uniqueSorted(gradoFamilies.map((family) => family.grupo)).map((grupo) => treeNode(grupo, gradoFamilies.filter((family) => family.grupo === grupo)))
          return gradoNode
        })
        return nivelNode
      })
      return plantelNode
    })
  }
}

function optionsFromFamilies(families: GestionEscolarFamilyRow[], planteles: string[]): GestionEscolarOverviewResponse['options'] {
  const assigned = planteles.length ? planteles : [...SCHOOL_PLANTELES]
  const reach = reachFromFamilies(families, assigned)
  return {
    planteles: assigned,
    niveles: reach.niveles,
    grados: Array.from(new Set(assigned.flatMap((plantel) => schoolGradesForPlantel(plantel)))),
    grupos: reach.grupos,
    scopeTree: buildScopeTree(families, assigned)
  }
}

async function getOptionsForPermissions(permissions: GestionEscolarPermission[], capability?: GestionEscolarCapability) {
  const families = await loadSchoolFamilies(SCHOOL_GESTION_OPTIONS_LIMIT)
  const visible = permissions.length ? familiesForPermissions(families, permissions, capability) : []
  return optionsFromFamilies(visible, plantelesFromPermissions(permissions, capability))
}

function moduleSummary(key: GestionEscolarModuleKey, permissions: GestionEscolarPermission[], reach: GestionEscolarReachPreview): GestionEscolarModuleSummary {
  const labels: Record<GestionEscolarModuleKey, { title: string; description: string }> = {
    comunicados: { title: 'Comunicados', description: 'Avisos, adjuntos y publicaciones por audiencia.' },
    encuestas: { title: 'Encuestas', description: 'Google Forms activos con resolucion por plantel y grupo.' },
    convenios: { title: 'Convenios', description: 'Flipbooks y publicaciones institucionales.' },
    familias: { title: 'Familias', description: 'Visibilidad, soporte y vista controlada de padres.' }
  }
  const capabilities = MODULE_CAPABILITIES[key]
  const enabled = capabilities.some((capability) => permissions.some((permission) => permission.capability === capability))
  return {
    key,
    title: labels[key].title,
    description: labels[key].description,
    enabled,
    reach,
    metrics: [
      { label: 'Familias', value: reach.families },
      { label: 'Planteles', value: reach.planteles.length || '0' }
    ]
  }
}

export async function getGestionOverview(user: AppSessionUser): Promise<GestionEscolarOverviewResponse> {
  const permissions = await effectiveGestionPermissionsForUser(user)
  const assignedPlanteles = plantelesFromPermissions(permissions)
  const families = permissions.length ? await loadSchoolFamilies(SCHOOL_GESTION_OVERVIEW_LIMIT) : []
  const visibleFamilies = permissions.length ? familiesForPermissions(families, permissions, 'familias.view') : []
  const reach = reachFromFamilies(visibleFamilies, assignedPlanteles)
  const options = optionsFromFamilies(visibleFamilies, assignedPlanteles)
  return {
    modules: (Object.keys(MODULE_CAPABILITIES) as GestionEscolarModuleKey[]).map((key) => moduleSummary(key, permissions, reach)).filter((module) => user.isSuperAdmin || module.enabled),
    reach,
    options
  }
}

function normalizeContentStatus(value: unknown): GestionEscolarContentStatus {
  const status = clean(value) as GestionEscolarContentStatus
  return ['draft', 'active', 'inactive', 'scheduled'].includes(status) ? status : 'draft'
}

function contentFromRow(row: GestionContentRow): GestionEscolarScopedContentItem {
  const scope = normalizeGestionScope({
    isGlobal: Boolean(row.is_global),
    plantel: row.plantel,
    nivel: row.nivel,
    grado: row.grado,
    grupo: row.grupo
  })
  return {
    id: row.uid,
    kind: row.kind === 'convenio' ? 'convenio' : 'encuesta',
    title: clean(row.title) || (row.kind === 'convenio' ? 'Convenio' : 'Encuesta'),
    summary: clean(row.summary) || '',
    url: clean(row.url),
    embedUrl: clean(row.embed_url) || null,
    status: normalizeContentStatus(row.status),
    isGlobal: scope.isGlobal,
    plantel: scope.plantel,
    nivel: scope.nivel,
    grado: scope.grado,
    grupo: scope.grupo,
    createdBy: row.created_by ? Number(row.created_by) : null,
    updatedBy: row.updated_by ? Number(row.updated_by) : null,
    publishedBy: row.published_by ? Number(row.published_by) : null,
    createdAt: toIso(row.created_at) || new Date().toISOString(),
    updatedAt: toIso(row.updated_at) || new Date().toISOString(),
    publishedAt: toIso(row.published_at),
    activeFrom: toIso(row.active_from),
    activeUntil: toIso(row.active_until),
    scopeLabel: formatGestionScopeLabel(scope)
  }
}

function contentCapability(kind: GestionEscolarContentKind, status: GestionEscolarContentStatus): GestionEscolarCapability {
  if (kind === 'encuesta') return 'encuestas.manage'
  if (status === 'active' || status === 'scheduled') return 'convenios.publish'
  return 'convenios.manage'
}

function manageCapability(kind: GestionEscolarContentKind): GestionEscolarCapability {
  return kind === 'encuesta' ? 'encuestas.manage' : 'convenios.manage'
}

function visibleContentCapabilities(kind: GestionEscolarContentKind): GestionEscolarCapability[] {
  return kind === 'encuesta' ? ['encuestas.manage'] : ['convenios.manage', 'convenios.publish']
}

function permissionsForContentKind(permissions: GestionEscolarPermission[], kind: GestionEscolarContentKind) {
  const allowed = new Set(visibleContentCapabilities(kind))
  return permissions.filter((permission) => allowed.has(permission.capability))
}

function validateContentInput(input: SaveGestionEscolarScopedContentInput) {
  const title = clean(input.title)
  const url = clean(input.url)
  if (!title) throw publicError(400, 'Agrega un titulo claro.')
  if (!url) throw publicError(400, 'Agrega el enlace que veran las familias.')
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('bad-protocol')
  } catch {
    throw publicError(400, 'El enlace debe ser una URL valida.')
  }
  if (input.kind === 'encuesta' && !/^https:\/\/docs\.google\.com\/forms\//i.test(url)) {
    throw publicError(400, 'Las encuestas deben usar un enlace de Google Forms.')
  }
}

export async function listGestionScopedContent(user: AppSessionUser, kind: GestionEscolarContentKind): Promise<GestionEscolarScopedContentResponse> {
  const permissions = await effectiveGestionPermissionsForUser(user)
  const canManage = user.isSuperAdmin || canUseCapability(permissions, manageCapability(kind))
  const canPublish = user.isSuperAdmin || canUseCapability(permissions, kind === 'encuesta' ? 'encuestas.manage' : 'convenios.publish')
  if (!canManage && !canPublish) throw publicError(403, 'No tienes acceso a este modulo.')
  const rows = await gestionQuery<GestionContentRow[]>(
    `SELECT id, uid, kind, title, summary, url, embed_url, status, is_global, plantel, nivel, grado, grupo, created_by, updated_by, published_by, created_at, updated_at, published_at, active_from, active_until
     FROM gestion_escolar_scoped_content
     WHERE kind = ?
     ORDER BY FIELD(status, 'active', 'scheduled', 'draft', 'inactive'), is_global DESC, updated_at DESC, id DESC
     LIMIT 300`,
    [kind]
  )
  const contentPermissions = permissionsForContentKind(permissions, kind)
  const items = rows.map(contentFromRow).filter((item) => user.isSuperAdmin || contentPermissions.some((permission) => gestionScopeCoversTarget(permission, item)))
  const options = await getOptionsForPermissions(permissions, manageCapability(kind))
  return {
    items,
    options,
    actions: { canManage, canPublish }
  }
}

export async function saveGestionScopedContent(user: AppSessionUser, input: SaveGestionEscolarScopedContentInput) {
  validateContentInput(input)
  const status = normalizeContentStatus(input.status)
  const scope = normalizeGestionScope(input)
  if (!user.isSuperAdmin && scope.isGlobal) throw publicError(400, 'Selecciona un plantel disponible.')
  if (!scope.isGlobal && !scope.plantel) throw publicError(400, 'Selecciona el plantel que verá este contenido.')
  await assertGestionCapability(user, contentCapability(input.kind, status), scope)
  if (status === 'active' && input.kind === 'convenio') {
    await assertGestionCapability(user, 'convenios.publish', scope)
  }

  const now = new Date().toISOString()
  const uid = clean(input.id) || `ge-${input.kind}-${randomUUID()}`
  const existing = input.id
    ? await legacyOne<RowDataPacket>('SELECT id FROM gestion_escolar_scoped_content WHERE uid = ? LIMIT 1', [input.id]).catch((error) => {
        if (isGestionSchemaMissing(error)) return undefined
        throw error
      })
    : null

  if (existing) {
    await gestionWrite(
      `UPDATE gestion_escolar_scoped_content
       SET title = ?, summary = ?, url = ?, embed_url = ?, status = ?, is_global = ?, plantel = ?, nivel = ?, grado = ?, grupo = ?, updated_by = ?, published_by = ?, updated_at = UTC_TIMESTAMP(), published_at = ?, active_from = ?, active_until = ?
       WHERE uid = ?`,
      [
        clean(input.title),
        clean(input.summary) || null,
        clean(input.url),
        clean(input.embedUrl) || clean(input.url),
        status,
        scope.isGlobal ? 1 : 0,
        scope.plantel,
        scope.nivel,
        scope.grado,
        scope.grupo,
        user.id,
        status === 'active' ? user.id : null,
        status === 'active' ? toMysqlDate(now) : null,
        toMysqlDate(input.activeFrom),
        toMysqlDate(input.activeUntil),
        uid
      ]
    )
  } else {
    await gestionWrite(
      `INSERT INTO gestion_escolar_scoped_content (uid, kind, title, summary, url, embed_url, status, is_global, plantel, nivel, grado, grupo, created_by, updated_by, published_by, created_at, updated_at, published_at, active_from, active_until)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP(), ?, ?, ?)`,
      [
        uid,
        input.kind,
        clean(input.title),
        clean(input.summary) || null,
        clean(input.url),
        clean(input.embedUrl) || clean(input.url),
        status,
        scope.isGlobal ? 1 : 0,
        scope.plantel,
        scope.nivel,
        scope.grado,
        scope.grupo,
        user.id,
        user.id,
        status === 'active' ? user.id : null,
        status === 'active' ? toMysqlDate(now) : null,
        toMysqlDate(input.activeFrom),
        toMysqlDate(input.activeUntil)
      ]
    )
  }
  await auditGestionAction({
    actorUserId: user.id,
    action: `${input.kind}.saved`,
    module: input.kind,
    capability: contentCapability(input.kind, status),
    scope,
    metadata: { uid, status }
  })
  return (await listGestionScopedContent(user, input.kind)).items.find((item) => item.id === uid) || null
}

function isContentActive(item: GestionEscolarScopedContentItem) {
  if (item.status !== 'active') return false
  const now = Date.now()
  const from = item.activeFrom ? Date.parse(item.activeFrom) : 0
  const until = item.activeUntil ? Date.parse(item.activeUntil) : Number.POSITIVE_INFINITY
  return (Number.isNaN(from) || from <= now) && (Number.isNaN(until) || until >= now)
}

function resolutionForScope(item: GestionEscolarScopedContentItem): FamilyScopedContentResponse['context']['resolution'] {
  const specificity = scopeSpecificity(item)
  if (specificity >= 4) return 'exact'
  if (specificity === 3) return 'grado'
  if (specificity === 2) return 'nivel'
  if (specificity === 1) return 'plantel'
  return item.isGlobal ? 'global' : 'none'
}

async function listActiveContent(kind: GestionEscolarContentKind) {
  const rows = await gestionQuery<GestionContentRow[]>(
    `SELECT id, uid, kind, title, summary, url, embed_url, status, is_global, plantel, nivel, grado, grupo, created_by, updated_by, published_by, created_at, updated_at, published_at, active_from, active_until
     FROM gestion_escolar_scoped_content
     WHERE kind = ? AND status = 'active'
     ORDER BY is_global ASC, updated_at DESC, id DESC
     LIMIT 300`,
    [kind]
  )
  return rows.map(contentFromRow).filter(isContentActive)
}

async function legacyScopedContentFallback(user: AppSessionUser, kind: GestionEscolarContentKind, child: AuthorizedChild | null): Promise<FamilyScopedContentResponse> {
  const config = await readPersonasConfig()
  if (kind === 'encuesta') {
    const resolved = resolveSurveyForStudent(config, {
      matricula: child?.matricula || user.username,
      plantel: child?.plantel || user.plantel?.[0],
      nivelEdu: child?.nivelEdu,
      campus: child?.campus || user.campus
    })
    if (resolved.activeSurvey?.enabled && resolved.activeSurvey.embedUrl) {
      const item: GestionEscolarScopedContentItem = {
        id: `legacy-survey-${resolved.activeSurveyNivel || 'escolar'}`,
        kind: 'encuesta',
        title: resolved.activeSurvey.title || 'Encuesta',
        summary: 'Formulario activo del colegio.',
        url: resolved.activeSurvey.embedUrl,
        embedUrl: resolved.activeSurvey.embedUrl,
        status: 'active',
        isGlobal: false,
        plantel: child?.plantel || null,
        nivel: child?.nivelEdu || null,
        grado: null,
        grupo: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scopeLabel: child?.nivelEdu || 'Escolar'
      }
      return { item, context: { student: child, scopeLabel: item.scopeLabel, resolution: 'nivel' }, state: 'ready' }
    }
  }
  if (kind === 'convenio' && config.conveniosUrl) {
    const item: GestionEscolarScopedContentItem = {
      id: 'legacy-convenio-global',
      kind: 'convenio',
      title: 'Convenios institucionales',
      summary: 'Beneficios publicados por el colegio.',
      url: config.conveniosUrl,
      embedUrl: config.conveniosUrl,
      status: 'active',
      isGlobal: true,
      plantel: null,
      nivel: null,
      grado: null,
      grupo: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scopeLabel: 'Todas las familias'
    }
    return { item, context: { student: child, scopeLabel: item.scopeLabel, resolution: 'global' }, state: 'ready' }
  }
  return {
    item: null,
    context: { student: child, scopeLabel: child ? formatGestionScopeLabel(targetFromChild(child)) : 'Cuenta familiar', resolution: 'none' },
    state: 'empty',
    message: kind === 'encuesta' ? 'No hay encuesta activa para tu familia.' : 'No hay convenios publicados por el momento.'
  }
}

export async function resolveFamilyScopedContent(user: AppSessionUser, kind: GestionEscolarContentKind): Promise<FamilyScopedContentResponse> {
  const children = await getFamilyChildren(user).catch(() => [] as AuthorizedChild[])
  const child = children.find((item) => item.isCurrent) || children[0] || null
  const target = targetFromChild(child)
  const activeItems = await listActiveContent(kind)
  const match = activeItems
    .filter((item) => gestionScopeCoversTarget(item, target))
    .sort((a, b) => scopeSpecificity(b) - scopeSpecificity(a) || b.updatedAt.localeCompare(a.updatedAt))[0]
  if (!match) return legacyScopedContentFallback(user, kind, child)
  return {
    item: match,
    context: {
      student: child,
      scopeLabel: match.scopeLabel,
      resolution: resolutionForScope(match)
    },
    state: 'ready'
  }
}

async function resolveScopedContentForFamilyRow(family: GestionEscolarFamilyRow, kind: GestionEscolarContentKind) {
  const target = familyScope(family)
  const activeItems = await listActiveContent(kind).catch((error) => {
    if (isGestionSchemaMissing(error)) return []
    throw error
  })
  return activeItems
    .filter((item) => gestionScopeCoversTarget(item, target))
    .sort((a, b) => scopeSpecificity(b) - scopeSpecificity(a) || b.updatedAt.localeCompare(a.updatedAt))[0] || null
}

export async function listGestionFamilies(user: AppSessionUser, filters: { search?: string; plantel?: string; limit?: number } = {}): Promise<GestionEscolarFamiliesResponse> {
  const permissions = await effectiveGestionPermissionsForUser(user)
  if (!user.isSuperAdmin && !canUseCapability(permissions, 'familias.view')) throw publicError(403, 'No tienes visibilidad de familias.')
  const allFamilies = await loadSchoolFamilies(SCHOOL_GESTION_LIST_LIMIT)
  const visible = user.isSuperAdmin ? allFamilies : familiesForPermissions(allFamilies, permissions, 'familias.view')
  const selectedPlantel = normalizeSchoolPlantel(filters.plantel)
  const byPlantel = selectedPlantel ? visible.filter((family) => family.plantel === selectedPlantel) : visible
  const search = clean(filters.search).toLowerCase()
  const searched = search
    ? byPlantel.filter((family) => [family.displayName, family.studentName, family.email, family.username, family.matricula].some((value) => clean(value).toLowerCase().includes(search)))
    : byPlantel
  const impersonationPermissions = permissionsForCapability(permissions, 'familias.impersonate')
  const rows = searched.slice(0, Math.min(Math.max(Number(filters.limit || 80), 20), 300)).map((family) => ({
    ...family,
    canImpersonate: user.isSuperAdmin || impersonationPermissions.some((permission) => gestionScopeCoversTarget(permission, familyScope(family)))
  }))
  return {
    rows,
    metrics: {
      families: new Set(rows.map((row) => row.userId)).size,
      students: rows.length,
      withAuthorizedPeople: rows.filter((row) => row.authorizedPeople > 0).length,
      canImpersonate: rows.filter((row) => row.canImpersonate).length
    },
    options: optionsFromFamilies(visible, plantelesFromPermissions(permissions, 'familias.view'))
  }
}

async function loadFamilyStudents(userId: number) {
  const rows = await legacyQuery<GestionFamilyDbRow[]>(
    `SELECT
      u.id AS userId,
      u.email,
      u.username,
      u.displayName,
      u.role,
      u.campus,
      u.empresa,
      u.unidad,
      u.nombre_nino,
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
      0 AS authorizedCount,
      c.id AS credentialId,
      c.foto AS credentialFoto
     FROM users u
     LEFT JOIN alumno_pa ap ON ap.user_id = u.id
     LEFT JOIN matricula m ON m.matricula = u.username
     LEFT JOIN credenciales c ON c.matricula = u.username
     WHERE u.id = ?
     ORDER BY ap.id ASC`,
    [userId]
  )
  return rows.map((row) => {
    const family = familyFromDbRow(row)
    return {
      name: family.studentName,
      matricula: family.matricula,
      plantel: family.plantel,
      nivel: family.nivel,
      grado: family.grado,
      grupo: family.grupo
    }
  })
}

export async function getGestionFamilyDetail(user: AppSessionUser, familyUserId: number): Promise<GestionEscolarFamilyDetailResponse> {
  const list = await listGestionFamilies(user, { limit: 400 })
  const family = list.rows.find((row) => row.userId === familyUserId)
  if (!family) throw publicError(404, 'Familia no disponible.')
  const peopleRows = await legacyQuery<AuthorizedPersonRow[]>(
    `SELECT id, paternoP, maternoP, nombreP, parenP, foto, compressed_foto
     FROM personas_autorizadas
     WHERE user_id = ?
     ORDER BY indice ASC, id ASC`,
    [familyUserId]
  )
  const [encuesta, convenio, students] = await Promise.all([
    resolveScopedContentForFamilyRow(family, 'encuesta'),
    resolveScopedContentForFamilyRow(family, 'convenio'),
    loadFamilyStudents(familyUserId)
  ])
  return {
    family,
    students,
    authorizedPeople: peopleRows.map((row) => ({
      id: Number(row.id),
      name: compactName(row.nombreP, row.paternoP, row.maternoP) || 'Persona autorizada',
      relationship: clean(row.parenP) || null,
      hasPhoto: Boolean(clean(row.foto) || clean(row.compressed_foto))
    })),
    visibleContent: {
      encuesta,
      convenio
    },
    supportPreview: [
      { label: 'Cuenta', value: family.parentStatus === 'active' ? 'Activa' : family.parentStatus === 'limited' ? 'Limitada' : 'Incompleta' },
      { label: 'Plantel / grupo', value: formatGestionScopeLabel(familyScope(family)) },
      { label: 'Accesos', value: family.features.join(' · ') }
    ]
  }
}

export async function canGestionImpersonateFamily(actor: AppSessionUser, targetUserId: number) {
  if (actor.isSuperAdmin) return { allowed: true, scope: { isGlobal: true } as GestionEscolarScope }
  if (!hasSchoolAdminScope(actor)) return { allowed: false, reason: 'Rol escolar no habilitado.' }
  const list = await listGestionFamilies(actor, { limit: 500 })
  const family = list.rows.find((row) => row.userId === targetUserId)
  if (!family) return { allowed: false, reason: 'La familia no está disponible.' }
  if (!family.canImpersonate) return { allowed: false, reason: 'Tu permiso permite ver, pero no abrir la vista familiar.' }
  return { allowed: true, scope: familyScope(family) }
}

export async function assertTargetIsFamilyOnly(targetUserId: number) {
  const legacy = await findLegacyUserById(targetUserId)
  if (!legacy) throw publicError(404, 'Cuenta familiar no encontrada')
  const roles = csvToList(legacy.raw.role)
  const internal = hasRoleToken(roles, SCHOOL_ADMIN_ROLE) || hasRoleToken(roles, DAYCARE_ADMIN_ROLE)
  const email = normalizeEmail(legacy.raw.email)
  if (internal || email.endsWith('@casitaiedis.edu.mx')) {
    throw publicError(403, 'No se puede impersonar personal interno.')
  }
  const familyUser = legacy.toSession('family')
  if (!familyUser.productScopes.includes('personasAutorizadas')) {
    throw publicError(403, 'La cuenta no tiene experiencia familiar escolar habilitada.')
  }
  return { legacy, familyUser }
}
