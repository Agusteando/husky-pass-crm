import type { AppSessionUser } from '~/types/session'
import type {
  MktEnrollmentCatalogs,
  MktEnrollmentDistributionGrade,
  MktEnrollmentKpis,
  MktEnrollmentOptionsResponse,
  MktEnrollmentOverviewResponse,
  MktEnrollmentParentPatch,
  MktEnrollmentStudent,
  MktEnrollmentStudentResponse,
  MktEnrollmentStudentsResponse
} from '~/types/mktEnrollment'
import {
  normalizeAuroraEnrollmentPlantel,
  resolveMarketingEnrollmentPlanteles
} from '~/server/data/marketingEnrollmentScope'

interface AuroraHealthScope {
  plantel?: string
  ciclo?: string
  rows?: number
  freshness?: string
  generatedAt?: string | null
  staleAfter?: string | null
  expiresAt?: string | null
  conceptIds?: unknown
}

interface AuroraHealthResponse {
  status?: string
  mode?: string
  viewVersion?: string
  canonicalPlanteles?: Array<{ plantel?: string }>
  schoolYears?: Array<{ value?: string; label?: string }>
  scopes?: AuroraHealthScope[]
}

interface AuroraPlantelStatus {
  plantel?: string
  online?: boolean
  status?: string
  code?: string | null
  httpStatus?: number | null
  checkedAt?: string
}

interface AuroraPlantelesStatusResponse {
  statuses?: AuroraPlantelStatus[]
  checkedAt?: string
}

interface AuroraRequestOptions extends Record<string, any> {
  timeout?: number
  retries?: number
}

interface AuroraStudentPage {
  ok?: boolean
  error?: boolean | string | Record<string, unknown>
  statusCode?: number
  statusMessage?: string
  message?: string
  code?: string | null
  data?: unknown[]
  pagination?: {
    limit?: number
    nextCursor?: string | null
    total?: number
  }
  catalogs?: Partial<MktEnrollmentCatalogs>
  meta?: Record<string, any>
}

interface AuroraStudentCollection {
  data: MktEnrollmentStudent[]
  total: number
  meta: Record<string, any>
  catalogs: Partial<MktEnrollmentCatalogs>
  context: AuroraStudentScopeContext
}

interface CachedAuroraStudentCollection {
  value: AuroraStudentCollection
  expiresAt: number
}

let healthCache: { value: AuroraHealthResponse; expiresAt: number } | null = null
const bridgeStatusCache = new Map<string, { value: AuroraPlantelStatus; expiresAt: number }>()
const HEALTH_CACHE_TTL_MS = 60_000
const HEALTH_TIMEOUT_MS = 8_000
const BRIDGE_STATUS_CACHE_TTL_MS = 30_000
const BRIDGE_STATUS_TIMEOUT_MS = 5_000
const MAX_COLLECTION_PAGES = 300
const LIVE_COLLECTION_LIMIT = 100
const WARM_COLLECTION_LIMIT = 500
const LIVE_STUDENT_TIMEOUT_MS = 60_000
const WARM_STUDENT_TIMEOUT_MS = 90_000
const STUDENT_COLLECTION_CACHE_TTL_MS = 30_000
const studentCollectionCache = new Map<string, CachedAuroraStudentCollection>()
const studentCollectionInflight = new Map<string, Promise<AuroraStudentCollection>>()

const clean = (value: unknown, max = 500) => String(value ?? '').trim().slice(0, max)
const lower = (value: unknown, max = 500) => clean(value, max).toLocaleLowerCase('es-MX')
const normalizeCiclo = (value: unknown) => clean(value, 20).match(/\d{4}/)?.[0] || ''
const titleCase = (value: unknown) => clean(value).replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase('es-MX'))
const naturalCompare = (left: string, right: string) => left.localeCompare(right, 'es-MX', { numeric: true, sensitivity: 'base' })

const levelForPlantel = (plantel: string): 'daycare' | 'preescolar' | 'primaria' | 'secundaria' => {
  if (plantel === 'GM') return 'daycare'
  if (plantel === 'PM' || plantel === 'PT') return 'primaria'
  if (plantel === 'SM' || plantel === 'ST') return 'secundaria'
  return 'preescolar'
}

const defaultSchoolYears = () => {
  const now = new Date()
  const startYear = now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1
  return [startYear, startYear - 1].map((year) => ({ value: String(year), label: `${year}-${year + 1}` }))
}

const config = () => {
  const runtime = useRuntimeConfig() as any
  return {
    baseURL: clean(
      runtime.aurora?.apiBaseUrl ||
      process.env.AURORA_API_BASE_URL ||
      process.env.HUSKY_PASS_AURORA_API_BASE_URL ||
      process.env.AURORA_URL ||
      'https://aurora.casitaiedis.edu.mx',
      500
    ).replace(/\/+$/, ''),
    token: clean(
      runtime.aurora?.apiToken ||
      process.env.AURORA_API_TOKEN ||
      process.env.HUSKY_PASS_AURORA_API_TOKEN ||
      process.env.AURORA_STUDENTS_API_TOKEN ||
      process.env.EXTERNAL_CONTROL_ESCOLAR_API_TOKEN ||
      '',
      1000
    ),
    timeout: Math.max(
      5_000,
      Number(
        runtime.aurora?.timeoutMs ||
        process.env.AURORA_API_TIMEOUT_MS ||
        process.env.HUSKY_PASS_AURORA_TIMEOUT_MS ||
        45_000
      ) || 45_000
    ),
    ciclo: normalizeCiclo(runtime.aurora?.ciclo || process.env.AURORA_CICLO || process.env.HUSKY_PASS_AURORA_CICLO || '')
  }
}

const assertConfigured = () => {
  const aurora = config()
  if (!aurora.baseURL || !aurora.token) {
    throw createError({
      statusCode: 503,
      statusMessage: 'AURORA_NOT_CONFIGURED',
      message: 'La conexión institucional con Aurora no está configurada.'
    })
  }
  return aurora
}

const errorStatusCode = (error: any) => Number(
  error?.response?.status || error?.statusCode || error?.status || error?.data?.statusCode || 0
) || 0

const errorCode = (error: any) => clean(
  error?.data?.data?.code || error?.data?.code || error?.code || error?.statusMessage || '',
  120
)

const safeAuroraError = (error: any, fallback: string) => {
  const upstreamStatus = errorStatusCode(error)
  const code = errorCode(error)
  const rawMessage = clean(
    error?.data?.message || error?.data?.statusMessage || error?.message || fallback,
    500
  )

  let statusCode = upstreamStatus >= 400 && upstreamStatus < 600 ? upstreamStatus : 503
  let message = rawMessage || fallback
  let statusMessage = code || 'AURORA_REQUEST_FAILED'

  if (!upstreamStatus || error?.name === 'AbortError' || /timeout|timed out|fetch failed|network/i.test(rawMessage)) {
    statusCode = 503
    statusMessage = 'AURORA_UNREACHABLE'
    message = 'Aurora no está disponible en este momento. La consulta puede reintentarse sin perder filtros.'
  } else if (upstreamStatus === 401 || code === 'AURORA_API_UNAUTHORIZED') {
    statusCode = 503
    statusMessage = 'AURORA_CREDENTIAL_MISMATCH'
    message = 'La conexión institucional entre Husky Pass y Aurora necesita sincronizar su credencial.'
  } else if (upstreamStatus === 404) {
    statusCode = 503
    statusMessage = 'AURORA_API_NOT_DEPLOYED'
    message = 'Aurora no tiene disponible el módulo institucional de Matrícula Actual en este despliegue.'
  }

  return createError({ statusCode, statusMessage, message })
}

const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))

const auroraFetch = async <T>(path: string, options: AuroraRequestOptions = {}): Promise<T> => {
  const aurora = assertConfigured()
  const method = String(options.method || 'GET').toUpperCase()
  const retries = Number.isFinite(options.retries)
    ? Math.max(0, Number(options.retries))
    : method === 'GET' ? 1 : 0
  const timeout = Math.max(3_000, Number(options.timeout || aurora.timeout) || aurora.timeout)
  const { retries: _retries, ...fetchOptions } = options
  let lastError: any = null

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await $fetch(path, {
        baseURL: aurora.baseURL,
        timeout,
        ...fetchOptions,
        headers: {
          Authorization: `Bearer ${aurora.token}`,
          'x-aurora-token': aurora.token,
          'x-api-key': aurora.token,
          'x-husky-pass-client': 'marketing-enrollment',
          ...(fetchOptions.headers || {})
        }
      }) as T
    } catch (error: any) {
      lastError = error
      const status = errorStatusCode(error)
      const retryable = !status || [408, 425, 429, 502, 503, 504].includes(status)
      if (attempt >= retries || !retryable) break
      await sleep(250 * (attempt + 1))
    }
  }

  throw safeAuroraError(lastError, 'Aurora no respondió a la consulta de matrícula actual.')
}

const getAuroraHealth = async () => {
  const now = Date.now()
  if (healthCache && healthCache.expiresAt > now) return healthCache.value
  const value = await auroraFetch<AuroraHealthResponse>('/api/external/v1/control-escolar/health', {
    timeout: HEALTH_TIMEOUT_MS,
    retries: 0
  })
  healthCache = { value, expiresAt: now + HEALTH_CACHE_TTL_MS }
  return value
}

type AuroraStudentSourceMode = 'live' | 'warm' | 'unknown'

interface AuroraStudentScopeContext {
  mode: AuroraStudentSourceMode
  concepts: string[]
}

const auroraSourceMode = (health: AuroraHealthResponse | null | undefined): AuroraStudentSourceMode => {
  if (clean(health?.mode, 40).toLowerCase() === 'live-bridge') return 'live'
  if (clean(health?.viewVersion, 80) || Array.isArray(health?.scopes)) return 'warm'
  return 'unknown'
}

const conceptsFromHealthScope = (health: AuroraHealthResponse | null | undefined, plantel: string, ciclo: string) => {
  const scope = (health?.scopes || [])
    .filter((item) => normalizeAuroraEnrollmentPlantel(item.plantel) === plantel && normalizeCiclo(item.ciclo) === ciclo)
    .sort((left, right) => String(right.generatedAt || '').localeCompare(String(left.generatedAt || '')))[0]
  const concepts = Array.isArray(scope?.conceptIds)
    ? scope.conceptIds.map((item) => clean(item, 40)).filter(Boolean)
    : clean(scope?.conceptIds, 1000).split(/[|,;]/).map((item) => item.trim()).filter(Boolean)
  return [...new Set(concepts)]
}

const buildAuroraStudentScopeContext = async (plantel: string, ciclo: string): Promise<AuroraStudentScopeContext> => {
  const health = await getAuroraHealth()
  const concepts = conceptsFromHealthScope(health, plantel, ciclo)
  return { mode: auroraSourceMode(health), concepts }
}

const studentScopeQuery = (context: AuroraStudentScopeContext) => ({
  concepts: context.concepts.join(',') || undefined
})

const assertAuroraStudentPage = (response: AuroraStudentPage | null | undefined) => {
  if (response && response.ok !== false && !response.error) return response
  throw createError({
    statusCode: Number(response?.statusCode || 502),
    statusMessage: clean(response?.code || response?.statusMessage, 120) || 'AURORA_STUDENT_QUERY_FAILED',
    message: clean(response?.message || response?.statusMessage || (typeof response?.error === 'string' ? response.error : ''), 500) || 'Aurora no pudo consultar la matrícula actual.'
  })
}

const getAuroraBridgeStatus = async (plantelValue: unknown): Promise<AuroraPlantelStatus> => {
  const plantel = normalizeAuroraEnrollmentPlantel(plantelValue)
  if (!plantel) return { plantel: '', online: false, status: 'unknown' }

  const now = Date.now()
  const cached = bridgeStatusCache.get(plantel)
  if (cached && cached.expiresAt > now) return cached.value

  const response = await auroraFetch<AuroraPlantelesStatusResponse>('/api/auth/planteles-status', {
    query: { plantel },
    timeout: BRIDGE_STATUS_TIMEOUT_MS,
    retries: 0
  })
  const status = (response.statuses || []).find((item) => normalizeAuroraEnrollmentPlantel(item.plantel) === plantel)
  const value: AuroraPlantelStatus = {
    plantel,
    online: Boolean(status?.online),
    status: clean(status?.status, 40) || (status?.online ? 'online' : 'unknown'),
    code: clean(status?.code, 120) || null,
    httpStatus: Number(status?.httpStatus || 0) || null,
    checkedAt: clean(status?.checkedAt || response.checkedAt, 80) || new Date().toISOString()
  }
  bridgeStatusCache.set(plantel, { value, expiresAt: now + BRIDGE_STATUS_CACHE_TTL_MS })
  return value
}

const getAuroraBridgeStatuses = async (planteles: string[]) => {
  const results = await Promise.all(planteles.map(async (plantel) => {
    try {
      return await getAuroraBridgeStatus(plantel)
    } catch (error: any) {
      return {
        plantel,
        online: false,
        status: 'unknown',
        code: errorCode(error) || null,
        httpStatus: errorStatusCode(error) || null,
        checkedAt: new Date().toISOString()
      } satisfies AuroraPlantelStatus
    }
  }))
  return new Map(results.map((status) => [normalizeAuroraEnrollmentPlantel(status.plantel), status]))
}

const assertPlantelAccess = (plantelValue: unknown, supported: string[]) => {
  const plantel = normalizeAuroraEnrollmentPlantel(plantelValue)
  if (!plantel) throw createError({ statusCode: 400, message: 'Selecciona un plantel.' })
  if (!supported.includes(plantel)) {
    throw createError({ statusCode: 403, message: 'El plantel solicitado no está asignado a esta cuenta.' })
  }
  return plantel
}

const resolvePlantelAccess = async (user: AppSessionUser, plantelValue: unknown) => {
  const permitted = await resolveMarketingEnrollmentPlanteles(user)
  return assertPlantelAccess(plantelValue, permitted)
}

const sanitizeStudent = (value: any): MktEnrollmentStudent => {
  const student = { ...(value || {}) }
  for (const key of ['huskyPassPlaintext', 'huskyPassUsername', 'huskyPassEmail', 'huskyPassAvailable', 'rawPhoto', 'centralMatriculaRaw', 'Control_Escolar_RAW_JSON', 'raw']) delete student[key]
  student.matricula = clean(student.matricula, 64).toUpperCase()
  student.fullName = clean(student.fullName || student.nombreCompleto || student.display?.nombre, 255)
  student.plantel = normalizeAuroraEnrollmentPlantel(student.plantel || student.basePlantel)
  student.grado = clean(student.grado, 80)
  student.group = clean(student.group || student.grupo, 80)
  student.grupo = student.group
  const ingresoValue = lower(student.tipoIngresoValue || student.tipoIngreso, 40)
  student.tipoIngresoValue = ingresoValue === 'interno' ? 'interno' : 'externo'
  student.tipoIngreso = student.tipoIngresoValue === 'interno' ? 'Interno' : 'Externo'
  return student as MktEnrollmentStudent
}

const normalizeStudentQuery = (
  query: Record<string, any>,
  plantel: string,
  ciclo: string,
  context: AuroraStudentScopeContext,
  cursor = ''
) => {
  const defaultLimit = context.mode === 'warm' ? WARM_COLLECTION_LIMIT : LIVE_COLLECTION_LIMIT
  return {
    plantel,
    ciclo,
    search: clean(query.search, 120),
    grado: clean(query.grado, 80),
    grupo: clean(query.grupo || query.group, 80),
    nivel: clean(query.nivel, 80),
    status: clean(query.status, 80),
    cursor: clean(cursor || query.cursor, 300),
    limit: Math.min(500, Math.max(25, Number(query.limit || defaultLimit) || defaultLimit)),
    all: clean(query.all, 20) || undefined,
    phase: clean(query.phase, 40) || undefined,
    ...studentScopeQuery(context)
  }
}

const requestAuroraStudentPage = async (
  plantel: string,
  ciclo: string,
  query: Record<string, any>,
  context: AuroraStudentScopeContext,
  cursor = ''
) => {
  const response = await auroraFetch<AuroraStudentPage>('/api/external/v1/control-escolar/students', {
    query: normalizeStudentQuery(query, plantel, ciclo, context, cursor),
    // Aurora's external endpoint resolves the latest warm scope itself and prepares it
    // on demand when needed. The first request can therefore take longer than a page read.
    timeout: context.mode === 'warm' ? WARM_STUDENT_TIMEOUT_MS : LIVE_STUDENT_TIMEOUT_MS,
    retries: 0
  })
  return assertAuroraStudentPage(response)
}

const studentCollectionKey = (
  plantel: string,
  ciclo: string,
  context: AuroraStudentScopeContext
) => `${plantel}:${ciclo}:${context.mode}:${context.concepts.join(',')}`

const collectAuroraControlEscolarIndex = async (
  plantel: string,
  ciclo: string,
  context: AuroraStudentScopeContext,
  fullIndexMode: boolean
): Promise<Omit<AuroraStudentCollection, 'context'>> => {
  const data: MktEnrollmentStudent[] = []
  const seenStudents = new Set<string>()
  const seenCursors = new Set<string>()
  let cursor = ''
  let meta: Record<string, any> = { plantel, ciclo, source: 'aurora-control-escolar' }
  let catalogs: Partial<MktEnrollmentCatalogs> = {}
  let reportedTotal = 0
  const collectionLimit = context.mode === 'warm' ? WARM_COLLECTION_LIMIT : LIVE_COLLECTION_LIMIT

  for (let page = 0; page < MAX_COLLECTION_PAGES; page += 1) {
    const response = await requestAuroraStudentPage(
      plantel,
      ciclo,
      {
        limit: collectionLimit,
        all: fullIndexMode ? '1' : undefined,
        phase: 'enriched'
      },
      context,
      cursor
    )
    const rows = Array.isArray(response.data) ? response.data.map(sanitizeStudent) : []
    for (const student of rows) {
      const key = student.matricula || `${student.fullName}:${student.grado}:${student.group}`
      if (seenStudents.has(key)) continue
      seenStudents.add(key)
      data.push(student)
    }
    reportedTotal = Math.max(reportedTotal, Number(response.pagination?.total || 0))
    meta = response.meta || meta
    catalogs = response.catalogs || catalogs
    const nextCursor = clean(response.pagination?.nextCursor, 300)
    if (!nextCursor || seenCursors.has(nextCursor)) break
    seenCursors.add(nextCursor)
    cursor = nextCursor
  }

  return { data, total: reportedTotal || data.length, meta, catalogs }
}

const fetchAllAuroraStudents = async (
  plantel: string,
  ciclo: string,
  options: { force?: boolean } = {}
): Promise<AuroraStudentCollection> => {
  const context = await buildAuroraStudentScopeContext(plantel, ciclo)
  const key = studentCollectionKey(plantel, ciclo, context)
  const now = Date.now()
  const cached = studentCollectionCache.get(key)
  if (!options.force && cached && cached.expiresAt > now) return cached.value

  const activeRequest = studentCollectionInflight.get(key)
  if (!options.force && activeRequest) return await activeRequest

  const request = (async () => {
    // Aurora Control Escolar loads one enriched index and applies grade, group,
    // status and search filters locally. The external live endpoint accepts the
    // same `all=1` index request. Warm-view deployments remain cursor based.
    const useFullIndexMode = context.mode === 'live'
    let collection = await collectAuroraControlEscolarIndex(
      plantel,
      ciclo,
      context,
      useFullIndexMode
    )

    // Some older external deployments accept `all=1` but still cap the first
    // response. Fall back to normal cursor traversal when the reported total
    // proves that the index response was incomplete.
    if (useFullIndexMode && collection.total > collection.data.length) {
      collection = await collectAuroraControlEscolarIndex(plantel, ciclo, context, false)
    }

    const value: AuroraStudentCollection = { ...collection, context }
    studentCollectionCache.set(key, {
      value,
      expiresAt: Date.now() + STUDENT_COLLECTION_CACHE_TTL_MS
    })
    return value
  })()

  studentCollectionInflight.set(key, request)
  try {
    return await request
  } finally {
    if (studentCollectionInflight.get(key) === request) studentCollectionInflight.delete(key)
  }
}

const invalidateAuroraStudentCollections = (plantel: string, ciclo: string) => {
  const prefix = `${plantel}:${ciclo}:`
  for (const key of studentCollectionCache.keys()) {
    if (key.startsWith(prefix)) studentCollectionCache.delete(key)
  }
}

const gradeWords = new Map<string, number>([
  ['primero', 1], ['primer', 1], ['uno', 1],
  ['segundo', 2], ['dos', 2],
  ['tercero', 3], ['tercer', 3], ['tres', 3],
  ['cuarto', 4], ['cuatro', 4],
  ['quinto', 5], ['cinco', 5],
  ['sexto', 6], ['seis', 6]
])

const gradeNumber = (value: unknown) => {
  const raw = lower(value, 80).replace(/[º°]/g, '').trim()
  const digit = raw.match(/\d{1,2}/)?.[0]
  if (digit) return Number(digit)
  for (const [word, number] of gradeWords) {
    if (raw.includes(word)) return number
  }
  return Number.POSITIVE_INFINITY
}

const gradeDescriptor = (value: unknown) => {
  const rawLabel = clean(value, 80) || 'Sin grado'
  const order = gradeNumber(rawLabel)
  return {
    key: Number.isFinite(order) ? `grade-${order}` : `grade-${lower(rawLabel).replace(/[^a-z0-9áéíóúñ]+/giu, '-')}`,
    label: Number.isFinite(order) ? `${order}°` : titleCase(rawLabel),
    rawLabel,
    order
  }
}

const isInscrito = (student: MktEnrollmentStudent) => lower(student.enrollmentState, 40) === 'inscrito'
const isBaja = (student: MktEnrollmentStudent) => lower(student.status, 40) === 'baja' || ['baja', 'baja_inscrita'].includes(lower(student.enrollmentState, 40))
const isInterno = (student: MktEnrollmentStudent) => lower(student.tipoIngresoValue || student.tipoIngreso, 40) === 'interno'
const studentGroup = (student: MktEnrollmentStudent) => clean(student.group || student.grupo, 80) || 'Sin grupo'

const hasFamilyContact = (student: MktEnrollmentStudent) => {
  const phone = [student.telefonoPadre, student.telefonoMadre, student.phone]
    .some((value) => clean(value, 80).replace(/\D/g, '').length >= 10)
  const email = [student.emailPadre, student.emailMadre, student.email]
    .some((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value, 255)))
  return phone || email
}

const completion = (student: MktEnrollmentStudent) => Math.max(
  0,
  Math.min(100, Number(student.completenessTiers?.basic?.progress ?? (student.missingFields?.length ? 50 : 100)) || 0)
)

const buildCatalogs = (students: MktEnrollmentStudent[]): MktEnrollmentCatalogs => {
  const niveles = new Set<string>()
  const grades = new Map<string, ReturnType<typeof gradeDescriptor>>()
  const groups = new Set<string>()
  const groupByGrade = new Map<string, Set<string>>()

  for (const student of students) {
    const nivel = clean(student.nivel, 80)
    if (nivel) niveles.add(nivel)
    const grade = gradeDescriptor(student.grado)
    grades.set(grade.key, grade)
    const group = studentGroup(student)
    groups.add(group)
    if (!groupByGrade.has(grade.rawLabel)) groupByGrade.set(grade.rawLabel, new Set())
    groupByGrade.get(grade.rawLabel)?.add(group)
  }

  const orderedGrades = [...grades.values()].sort((left, right) => left.order - right.order || naturalCompare(left.label, right.label))
  return {
    niveles: [...niveles].sort(naturalCompare),
    grados: orderedGrades.map((grade) => grade.rawLabel),
    grupos: [...groups].sort(naturalCompare),
    gruposPorGrado: Object.fromEntries(
      [...groupByGrade.entries()].map(([grade, values]) => [grade, [...values].sort(naturalCompare)])
    )
  }
}

const expectedGradeNumbers = (plantel: string) => {
  if (plantel === 'PM' || plantel === 'PT') return [1, 2, 3, 4, 5, 6]
  if (plantel === 'SM' || plantel === 'ST') return [1, 2, 3]
  if (levelForPlantel(plantel) === 'preescolar') return [1, 2, 3]
  return []
}

const buildDistribution = (students: MktEnrollmentStudent[], plantel = ''): MktEnrollmentDistributionGrade[] => {
  const grades = new Map<string, {
    descriptor: ReturnType<typeof gradeDescriptor>
    internos: number
    externos: number
    groups: Map<string, { label: string; internos: number; externos: number }>
  }>()

  for (const gradeNumberValue of expectedGradeNumbers(plantel)) {
    const descriptor = gradeDescriptor(String(gradeNumberValue))
    grades.set(descriptor.key, { descriptor, internos: 0, externos: 0, groups: new Map() })
  }

  for (const student of students) {
    if (!isInscrito(student)) continue
    const descriptor = gradeDescriptor(student.grado)
    const grade = grades.get(descriptor.key) || {
      descriptor,
      internos: 0,
      externos: 0,
      groups: new Map<string, { label: string; internos: number; externos: number }>()
    }
    const groupLabel = studentGroup(student)
    const groupKey = lower(groupLabel, 80)
    const group = grade.groups.get(groupKey) || { label: groupLabel, internos: 0, externos: 0 }
    if (isInterno(student)) {
      grade.internos += 1
      group.internos += 1
    } else {
      grade.externos += 1
      group.externos += 1
    }
    grade.groups.set(groupKey, group)
    grades.set(descriptor.key, grade)
  }

  return [...grades.entries()]
    .map(([key, grade]) => ({
      key,
      label: grade.descriptor.label,
      rawLabel: grade.descriptor.rawLabel,
      internos: grade.internos,
      externos: grade.externos,
      total: grade.internos + grade.externos,
      groups: [...grade.groups.entries()]
        .map(([groupKey, group]) => ({
          key: `${key}:${groupKey}`,
          label: group.label,
          internos: group.internos,
          externos: group.externos,
          total: group.internos + group.externos
        }))
        .sort((left, right) => naturalCompare(left.label, right.label))
    }))
    .sort((left, right) => gradeNumber(left.rawLabel) - gradeNumber(right.rawLabel) || naturalCompare(left.label, right.label))
}

const buildKpis = (students: MktEnrollmentStudent[], plantel = ''): MktEnrollmentKpis => {
  const distribution = buildDistribution(students, plantel)
  const inscritos = distribution.reduce((sum, grade) => sum + grade.total, 0)
  const internos = distribution.reduce((sum, grade) => sum + grade.internos, 0)
  const externos = distribution.reduce((sum, grade) => sum + grade.externos, 0)
  const inscritosStudents = students.filter(isInscrito)
  return {
    totalVisible: students.length,
    totalInscritos: inscritos,
    inscritos,
    activos: students.filter((student) => !isBaja(student)).length,
    bajas: students.filter(isBaja).length,
    noInscritos: students.filter((student) => lower(student.enrollmentState, 40) === 'no_inscrito').length,
    internos,
    externos,
    expedientesCompletos: inscritosStudents.filter((student) => completion(student) === 100).length,
    expedientesIncompletos: inscritosStudents.filter((student) => completion(student) < 100).length,
    sinContacto: inscritosStudents.filter((student) => !hasFamilyContact(student)).length,
    sinFichaMatricula: students.filter((student) => !student.overlayExists).length,
    porNivel: [...new Map(students.map((student) => [clean(student.nivel, 80), 0])).keys()]
      .filter(Boolean)
      .map((label) => ({ label, total: students.filter((student) => clean(student.nivel, 80) === label).length })),
    porGrupo: distribution.flatMap((grade) => grade.groups.map((group) => ({ label: `${grade.label} ${group.label}`, total: group.total })))
  }
}

const normalizedFilterText = (value: unknown, max = 500) => clean(value, max)
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .toLocaleLowerCase('es-MX')
  .replace(/\s+/g, ' ')
  .trim()

const normalizedGroup = (value: unknown) => normalizedFilterText(value, 80)
  .replace(/["']/g, '')
  .trim()

const gradeFilterKey = (value: unknown) => {
  const number = gradeNumber(value)
  if (Number.isFinite(number)) return `number:${number}`
  return `text:${normalizedFilterText(value, 80)}`
}

const studentSearchText = (student: MktEnrollmentStudent) => [
  student.matricula,
  student.fullName,
  student.nombreCompleto,
  student.nombres,
  student.apellidoPaterno,
  student.apellidoMaterno,
  student.curp,
  student.fatherName,
  student.motherName,
  student.nombrePadre,
  student.nombreMadre,
  student.telefonoPadre,
  student.telefonoMadre,
  student.emailPadre,
  student.emailMadre,
  student.phone,
  student.email
].map((value) => normalizedFilterText(value, 500)).filter(Boolean).join(' ')

const matchesEnrollmentStatus = (student: MktEnrollmentStudent, value: unknown) => {
  const status = normalizedFilterText(value, 80)
  if (!status || status === 'all' || status === 'todos') return true
  if (['activo', 'activos', 'active'].includes(status)) return !isBaja(student) && lower(student.status, 40) === 'activo'
  if (['inscrito', 'inscritos'].includes(status)) return isInscrito(student)
  if (['interno', 'internos'].includes(status)) return isInscrito(student) && isInterno(student)
  if (['externo', 'externos'].includes(status)) return isInscrito(student) && !isInterno(student)
  if (['no_inscrito', 'no_inscritos', 'no inscrito', 'no inscritos'].includes(status)) {
    return lower(student.enrollmentState, 40) === 'no_inscrito'
  }
  if (['baja', 'bajas'].includes(status)) return isBaja(student)
  return normalizedFilterText(student.enrollmentState, 80) === status || normalizedFilterText(student.status, 80) === status
}

const filterEnrollmentStudents = (
  students: MktEnrollmentStudent[],
  query: Record<string, any>
) => {
  const search = normalizedFilterText(query.search || query.q, 120)
  const grade = clean(query.grado, 80)
  const group = normalizedGroup(query.grupo || query.group)
  const nivel = normalizedFilterText(query.nivel, 80)

  return students.filter((student) => {
    if (search && !studentSearchText(student).includes(search)) return false
    if (!matchesEnrollmentStatus(student, query.status)) return false
    if (grade && gradeFilterKey(student.grado) !== gradeFilterKey(grade)) return false
    if (group && group !== 'all' && group !== 'todos' && normalizedGroup(student.group || student.grupo) !== group) return false
    if (nivel && nivel !== 'all' && nivel !== 'todos' && normalizedFilterText(student.nivel, 80) !== nivel) return false
    return true
  })
}

const compareEnrollmentStudents = (left: MktEnrollmentStudent, right: MktEnrollmentStudent) => {
  const leftActive = !isBaja(left) && lower(left.status, 40) === 'activo' ? 0 : 1
  const rightActive = !isBaja(right) && lower(right.status, 40) === 'activo' ? 0 : 1
  if (leftActive !== rightActive) return leftActive - rightActive
  const gradeDifference = gradeNumber(left.grado) - gradeNumber(right.grado)
  if (Number.isFinite(gradeDifference) && gradeDifference) return gradeDifference
  const groupDifference = naturalCompare(studentGroup(left), studentGroup(right))
  if (groupDifference) return groupDifference
  const nameDifference = naturalCompare(clean(left.fullName, 255), clean(right.fullName, 255))
  if (nameDifference) return nameDifference
  return naturalCompare(clean(left.matricula, 64), clean(right.matricula, 64))
}

const encodeEnrollmentCursor = (offset: number) => Buffer.from(JSON.stringify({ offset })).toString('base64url')
const decodeEnrollmentCursor = (value: unknown) => {
  const cursor = clean(value, 300)
  if (!cursor) return 0
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'))
    const offset = Number(parsed?.offset || 0)
    return Number.isFinite(offset) && offset > 0 ? Math.floor(offset) : 0
  } catch {
    return 0
  }
}

export async function getMktEnrollmentOptions(user: AppSessionUser): Promise<MktEnrollmentOptionsResponse> {
  const permitted = await resolveMarketingEnrollmentPlanteles(user)
  const [healthResult, bridgeStatuses] = await Promise.all([
    getAuroraHealth().then((value) => ({ value, error: null as any })).catch((error) => ({ value: null, error })),
    getAuroraBridgeStatuses(permitted)
  ])
  const health = healthResult.value

  const healthSchoolYears = (health?.schoolYears || [])
    .map((item) => ({ value: normalizeCiclo(item.value), label: clean(item.label, 40) }))
    .filter((item) => item.value)
  const schoolYears = (healthSchoolYears.length ? healthSchoolYears : defaultSchoolYears())
    .filter((item, index, values) => values.findIndex((candidate) => candidate.value === item.value) === index)

  const configuredCycle = config().ciclo
  if (configuredCycle && !schoolYears.some((item) => item.value === configuredCycle)) {
    schoolYears.unshift({ value: configuredCycle, label: `${configuredCycle}-${Number(configuredCycle) + 1}` })
  }
  const defaultCiclo = schoolYears.find((item) => item.value === configuredCycle)?.value || schoolYears[0]?.value || configuredCycle
  const planteles = permitted.map((code) => {
    const bridge = bridgeStatuses.get(code)
    const available = Boolean(bridge?.online)
    return {
      code,
      label: code,
      level: levelForPlantel(code),
      available,
      availability: available ? 'online' as const : clean(bridge?.status, 40) === 'offline' ? 'offline' as const : 'unknown' as const
    }
  })
  const availablePlanteles = planteles.filter((plantel) => plantel.available)
  // Aurora's health endpoint confirms that the external Control Escolar API is deployed.
  // Live plantel availability comes exclusively from /api/auth/planteles-status.
  const connected = Boolean(health) && availablePlanteles.length > 0
  const connectionMessage = connected
    ? ''
    : clean(healthResult.error?.message || healthResult.error?.statusMessage || '', 300)

  return {
    planteles,
    schoolYears,
    defaultPlantel: availablePlanteles[0]?.code || '',
    defaultCiclo,
    connected,
    connection: {
      status: connected ? 'online' : 'degraded',
      message: connectionMessage
    },
    generatedAt: new Date().toISOString()
  }
}

export async function getMktEnrollmentOverview(user: AppSessionUser, query: Record<string, any>): Promise<MktEnrollmentOverviewResponse> {
  const plantel = await resolvePlantelAccess(user, query.plantel)
  const ciclo = normalizeCiclo(query.ciclo)
  if (!ciclo) throw createError({ statusCode: 400, message: 'Selecciona un ciclo escolar.' })
  const collection = await fetchAllAuroraStudents(plantel, ciclo)
  const distribution = buildDistribution(collection.data, plantel)
  const kpis = buildKpis(collection.data, plantel)
  return {
    distribution,
    totals: {
      internos: kpis.internos,
      externos: kpis.externos,
      inscritos: kpis.inscritos,
      totalVisible: kpis.totalVisible,
      noInscritos: kpis.noInscritos,
      bajas: kpis.bajas
    },
    catalogs: buildCatalogs(collection.data),
    meta: collection.meta || { plantel, ciclo, source: 'aurora' }
  }
}

export async function listMktEnrollmentStudents(user: AppSessionUser, query: Record<string, any>): Promise<MktEnrollmentStudentsResponse> {
  const plantel = await resolvePlantelAccess(user, query.plantel)
  const ciclo = normalizeCiclo(query.ciclo)
  if (!ciclo) throw createError({ statusCode: 400, message: 'Selecciona un ciclo escolar.' })

  // Aurora's own Control Escolar workspace fetches one complete enriched index
  // and performs interactive filtering against that index. Mirroring that
  // behavior avoids discrepancies between KPI totals and filtered rosters.
  const collection = await fetchAllAuroraStudents(plantel, ciclo)
  const filtered = filterEnrollmentStudents(collection.data, query)
    .sort(compareEnrollmentStudents)
  const limit = Math.min(500, Math.max(25, Number(query.limit || 100) || 100))
  const offset = Math.min(decodeEnrollmentCursor(query.cursor), filtered.length)
  const data = filtered.slice(offset, offset + limit)
  const nextOffset = offset + data.length

  return {
    data,
    pagination: {
      limit,
      nextCursor: nextOffset < filtered.length ? encodeEnrollmentCursor(nextOffset) : null,
      total: filtered.length
    },
    catalogs: buildCatalogs(collection.data),
    kpis: buildKpis(collection.data, plantel),
    meta: {
      ...(collection.meta || {}),
      plantel,
      ciclo,
      source: clean(collection.meta?.source, 80) || 'aurora-control-escolar',
      indexRows: collection.data.length,
      filteredRows: filtered.length
    }
  }
}

export async function getMktEnrollmentStudent(user: AppSessionUser, matriculaValue: unknown, query: Record<string, any>): Promise<MktEnrollmentStudentResponse> {
  const plantel = await resolvePlantelAccess(user, query.plantel)
  const ciclo = normalizeCiclo(query.ciclo)
  const matricula = clean(matriculaValue, 64).toUpperCase()
  if (!ciclo || !matricula) throw createError({ statusCode: 400, message: 'La matrícula y el ciclo escolar son obligatorios.' })

  const collection = await fetchAllAuroraStudents(plantel, ciclo)
  const indexed = collection.data.find((student) => clean(student.matricula, 64).toUpperCase() === matricula)
  if (indexed) return { data: indexed, meta: collection.meta || { plantel, ciclo } }

  // Keep Aurora's detail endpoint as a compatibility fallback for deployments
  // where the full index intentionally omits a late-arriving record.
  const context = collection.context
  const response = await auroraFetch<any>(`/api/external/v1/control-escolar/students/${encodeURIComponent(matricula)}`, {
    query: { plantel, ciclo, ...studentScopeQuery(context) },
    timeout: context.mode === 'warm' ? WARM_STUDENT_TIMEOUT_MS : LIVE_STUDENT_TIMEOUT_MS,
    retries: 0
  })
  return { data: sanitizeStudent(response?.data), meta: response?.meta || {} }
}

export async function updateMktEnrollmentParents(
  user: AppSessionUser,
  matriculaValue: unknown,
  query: Record<string, any>,
  patch: MktEnrollmentParentPatch
): Promise<MktEnrollmentStudentResponse> {
  const plantel = await resolvePlantelAccess(user, query.plantel)
  const ciclo = normalizeCiclo(query.ciclo)
  const matricula = clean(matriculaValue, 64).toUpperCase()
  if (!ciclo || !matricula) throw createError({ statusCode: 400, message: 'La matrícula y el ciclo escolar son obligatorios.' })
  const context = await buildAuroraStudentScopeContext(plantel, ciclo)
  const response = await auroraFetch<any>(`/api/external/v1/control-escolar/students/${encodeURIComponent(matricula)}`, {
    method: 'PATCH',
    query: { plantel, ciclo, ...studentScopeQuery(context) },
    body: patch,
    headers: {
      'x-aurora-actor-email': user.email,
      'x-aurora-actor-name': user.displayName || user.email
    },
    timeout: LIVE_STUDENT_TIMEOUT_MS,
    retries: 0
  })
  invalidateAuroraStudentCollections(plantel, ciclo)
  return { data: sanitizeStudent(response?.data), meta: response?.meta || { plantel, ciclo } }
}

const xmlEscape = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

const worksheetName = (value: unknown, used: Set<string>) => {
  const base = clean(value, 80).replace(/[\\/?*:]/g, ' ').replaceAll('[', ' ').replaceAll(']', ' ').replace(/\s+/g, ' ').trim().slice(0, 31) || 'Hoja'
  let name = base
  let suffix = 2
  while (used.has(name)) {
    const tail = ` ${suffix}`
    name = `${base.slice(0, 31 - tail.length)}${tail}`
    suffix += 1
  }
  used.add(name)
  return name
}

const spreadsheetCell = (value: unknown, style = '') => {
  const isNumber = typeof value === 'number' && Number.isFinite(value)
  return `<Cell${style ? ` ss:StyleID="${style}"` : ''}><Data ss:Type="${isNumber ? 'Number' : 'String'}">${xmlEscape(value)}</Data></Cell>`
}

const spreadsheetRow = (values: unknown[], style = '') => `<Row>${values.map((value) => spreadsheetCell(value, style)).join('')}</Row>`

const spreadsheetWorksheet = (name: string, rows: Array<{ values: unknown[]; style?: string }>) => `
<Worksheet ss:Name="${xmlEscape(name)}">
  <Table>
    ${rows.map((row) => spreadsheetRow(row.values, row.style || '')).join('\n    ')}
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><FreezePanes/><FrozenNoSplit/><SplitHorizontal>1</SplitHorizontal><TopRowBottomPane>1</TopRowBottomPane></WorksheetOptions>
</Worksheet>`

const studentExportRow = (student: MktEnrollmentStudent) => [
  student.plantel,
  student.grado || '',
  student.group || student.grupo || '',
  student.tipoIngreso || (isInterno(student) ? 'Interno' : 'Externo'),
  student.matricula,
  student.fullName,
  student.curp || '',
  student.enrollmentState || student.status || '',
  student.fatherName || '',
  student.telefonoPadre || '',
  student.emailPadre || '',
  student.motherName || '',
  student.telefonoMadre || '',
  student.emailMadre || '',
  student.address || student.direccion || ''
]

const buildEnrollmentSpreadsheet = (plantel: string, ciclo: string, students: MktEnrollmentStudent[]) => {
  const distribution = buildDistribution(students, plantel)
  const usedSheetNames = new Set<string>()
  const sheets: string[] = []
  const summaryRows: Array<{ values: unknown[]; style?: string }> = [
    { values: ['Matrícula actual', plantel, `${ciclo}-${Number(ciclo) + 1}`], style: 'Title' },
    { values: [] },
    { values: ['Grado', 'Internos', 'Externos', 'Total'], style: 'Header' },
    ...distribution.map((grade) => ({ values: [grade.label, grade.internos, grade.externos, grade.total] })),
    {
      values: [
        'Total',
        distribution.reduce((sum, grade) => sum + grade.internos, 0),
        distribution.reduce((sum, grade) => sum + grade.externos, 0),
        distribution.reduce((sum, grade) => sum + grade.total, 0)
      ],
      style: 'Total'
    }
  ]
  sheets.push(spreadsheetWorksheet(worksheetName('Resumen', usedSheetNames), summaryRows))

  const headers = ['Plantel', 'Grado', 'Grupo', 'Ingreso', 'Matrícula', 'Alumno', 'CURP', 'Estado', 'Padre / tutor', 'Teléfono padre', 'Correo padre', 'Madre / tutora', 'Teléfono madre', 'Correo madre', 'Domicilio']
  const orderedStudents = [...students].sort((left, right) => {
    const gradeDifference = gradeNumber(left.grado) - gradeNumber(right.grado)
    if (gradeDifference) return gradeDifference
    const groupDifference = naturalCompare(studentGroup(left), studentGroup(right))
    if (groupDifference) return groupDifference
    return naturalCompare(left.fullName, right.fullName)
  })
  sheets.push(spreadsheetWorksheet(worksheetName('Alumnos', usedSheetNames), [
    { values: headers, style: 'Header' },
    ...orderedStudents.map((student) => ({ values: studentExportRow(student) }))
  ]))

  for (const grade of distribution) {
    for (const group of grade.groups) {
      const groupStudents = orderedStudents.filter((student) => {
        const descriptor = gradeDescriptor(student.grado)
        return descriptor.key === grade.key && studentGroup(student) === group.label
      })
      sheets.push(spreadsheetWorksheet(worksheetName(`${grade.label} ${group.label}`, usedSheetNames), [
        { values: headers, style: 'Header' },
        ...groupStudents.map((student) => ({ values: studentExportRow(student) }))
      ]))
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Title>Matrícula actual ${xmlEscape(plantel)}</Title><Author>Husky Pass</Author></DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Center"/><Font ss:FontName="Montserrat" ss:Size="10"/></Style>
  <Style ss:ID="Title"><Font ss:Bold="1" ss:Size="15" ss:Color="#0B6B61"/><Interior ss:Color="#E9F7F0" ss:Pattern="Solid"/></Style>
  <Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#0B6B61" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center"/></Style>
  <Style ss:ID="Total"><Font ss:Bold="1"/><Interior ss:Color="#F6E9A9" ss:Pattern="Solid"/></Style>
 </Styles>
 ${sheets.join('\n')}
</Workbook>`
}

export async function downloadMktEnrollmentExport(user: AppSessionUser, query: Record<string, any>) {
  const plantel = await resolvePlantelAccess(user, query.plantel)
  const ciclo = normalizeCiclo(query.ciclo)
  if (!ciclo) throw createError({ statusCode: 400, message: 'Selecciona un ciclo escolar.' })
  const collection = await fetchAllAuroraStudents(plantel, ciclo)
  const students = filterEnrollmentStudents(collection.data, query).sort(compareEnrollmentStudents)
  const workbook = buildEnrollmentSpreadsheet(plantel, ciclo, students)
  return {
    buffer: Buffer.from(workbook, 'utf8'),
    filename: `matricula-actual-${plantel}-${ciclo}.xls`,
    contentType: 'application/vnd.ms-excel; charset=utf-8'
  }
}
