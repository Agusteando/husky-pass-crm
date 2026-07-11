import type { AppSessionUser } from '~/types/session'
import type {
  MktEnrollmentOptionsResponse,
  MktEnrollmentStudentPatch,
  MktEnrollmentStudent,
  MktEnrollmentStudentResponse,
  MktEnrollmentStudentsResponse
} from '~/types/mktEnrollment'
import {
  normalizeAuroraEnrollmentPlantel,
  resolveMarketingEnrollmentPlanteles
} from '~/server/data/marketingEnrollmentScope'

interface AuroraHealthResponse {
  status?: string
  mode?: string
  canonicalPlanteles?: Array<{ plantel?: string }>
  schoolYears?: Array<{ value?: string; label?: string }>
  scopes?: Array<{ plantel?: string; ciclo?: string; rows?: number; freshness?: string; generatedAt?: string | null }>
}

interface AuroraRequestOptions extends Record<string, any> {
  timeout?: number
  retries?: number
}

let healthCache: { value: AuroraHealthResponse; expiresAt: number } | null = null
const HEALTH_CACHE_TTL_MS = 60_000
const HEALTH_TIMEOUT_MS = 6_000



const clean = (value: unknown, max = 500) => String(value ?? '').trim().slice(0, max)
const normalizeCiclo = (value: unknown) => clean(value, 20).match(/\d{4}/)?.[0] || ''
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
  } else if (code === 'AURORA_VIEW_SCHEMA_MISSING') {
    statusCode = 503
    statusMessage = 'AURORA_LEGACY_VIEW_UNAVAILABLE'
    message = 'Aurora respondió con una integración anterior. Actualiza Aurora para usar la consulta directa de Control Escolar.'
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

const assertPlantelAccess = (plantelValue: unknown, supported: string[]) => {
  const plantel = normalizeAuroraEnrollmentPlantel(plantelValue)
  if (!plantel) throw createError({ statusCode: 400, message: 'Selecciona un plantel.' })
  if (!supported.includes(plantel)) {
    throw createError({ statusCode: 403, message: 'El plantel solicitado no está dentro de tu alcance de Marketing.' })
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
  return student as MktEnrollmentStudent
}

export async function getMktEnrollmentOptions(user: AppSessionUser): Promise<MktEnrollmentOptionsResponse> {
  const permitted = await resolveMarketingEnrollmentPlanteles(user)
  let health: AuroraHealthResponse | null = null
  let connectionMessage = ''

  try {
    health = await getAuroraHealth()
  } catch (error: any) {
    connectionMessage = clean(error?.message || error?.statusMessage || '', 300)
  }

  // Aurora health is informative only. A slow, old, or partially deployed health
  // response must never remove a plantel that Husky has already authorized.
  const availablePlanteles = permitted

  const healthSchoolYears = (health?.schoolYears || [])
    .map((item) => ({ value: normalizeCiclo(item.value), label: clean(item.label, 40) }))
    .filter((item) => item.value)
  const schoolYears = (healthSchoolYears.length ? healthSchoolYears : defaultSchoolYears())
    .filter((item, index, values) => values.findIndex((candidate) => candidate.value === item.value) === index)
    .sort((left, right) => right.value.localeCompare(left.value))

  const configuredCycle = config().ciclo
  if (configuredCycle && !schoolYears.some((item) => item.value === configuredCycle)) {
    schoolYears.unshift({ value: configuredCycle, label: `${configuredCycle}-${Number(configuredCycle) + 1}` })
  }
  const defaultCiclo = schoolYears.find((item) => item.value === configuredCycle)?.value || schoolYears[0]?.value || configuredCycle
  const scopes = Array.isArray(health?.scopes) ? health.scopes : []
  const planteles = availablePlanteles.map((code) => ({
    code,
    label: code,
    level: levelForPlantel(code),
    hasData: scopes.some((scope) => normalizeAuroraEnrollmentPlantel(scope.plantel) === code && Number(scope.rows || 0) > 0)
  }))
  const connected = String(health?.status || '').toLowerCase() === 'ok'

  return {
    planteles,
    schoolYears,
    defaultPlantel: planteles[0]?.code || '',
    defaultCiclo,
    connected,
    connection: {
      status: connected ? 'online' : 'degraded',
      message: connected ? '' : connectionMessage
    },
    generatedAt: new Date().toISOString()
  }
}

export async function listMktEnrollmentStudents(user: AppSessionUser, query: Record<string, any>): Promise<MktEnrollmentStudentsResponse> {
  const plantel = await resolvePlantelAccess(user, query.plantel)
  const ciclo = normalizeCiclo(query.ciclo)
  if (!ciclo) throw createError({ statusCode: 400, message: 'Selecciona un ciclo escolar.' })
  const normalizedQuery = {
    plantel,
    ciclo,
    search: clean(query.search, 120),
    grado: clean(query.grado, 80),
    grupo: clean(query.grupo, 80),
    nivel: clean(query.nivel, 80),
    status: clean(query.status, 80),
    cursor: clean(query.cursor, 300),
    limit: Math.min(500, Math.max(25, Number(query.limit || 100) || 100))
  }

  const [students, kpisResult] = await Promise.all([
    auroraFetch<any>('/api/external/v1/control-escolar/students', { query: normalizedQuery }),
    auroraFetch<any>('/api/external/v1/control-escolar/kpis', { query: { plantel, ciclo } }).catch(() => null)
  ])

  return {
    data: Array.isArray(students?.data) ? students.data.map(sanitizeStudent) : [],
    pagination: {
      limit: Number(students?.pagination?.limit || normalizedQuery.limit),
      nextCursor: clean(students?.pagination?.nextCursor, 300) || null,
      total: Number(students?.pagination?.total || 0)
    },
    catalogs: {
      niveles: Array.isArray(students?.catalogs?.niveles) ? students.catalogs.niveles.map(String) : [],
      grados: Array.isArray(students?.catalogs?.grados) ? students.catalogs.grados.map(String) : [],
      grupos: Array.isArray(students?.catalogs?.grupos) ? students.catalogs.grupos.map(String) : [],
      gruposPorGrado: students?.catalogs?.gruposPorGrado && typeof students.catalogs.gruposPorGrado === 'object' ? students.catalogs.gruposPorGrado : {}
    },
    kpis: kpisResult?.data || null,
    meta: students?.meta || { plantel, ciclo, source: 'aurora' }
  }
}

export async function getMktEnrollmentStudent(user: AppSessionUser, matriculaValue: unknown, query: Record<string, any>): Promise<MktEnrollmentStudentResponse> {
  const plantel = await resolvePlantelAccess(user, query.plantel)
  const ciclo = normalizeCiclo(query.ciclo)
  const matricula = clean(matriculaValue, 64).toUpperCase()
  if (!ciclo || !matricula) throw createError({ statusCode: 400, message: 'La matrícula y el ciclo escolar son obligatorios.' })
  const response = await auroraFetch<any>(`/api/external/v1/control-escolar/students/${encodeURIComponent(matricula)}`, { query: { plantel, ciclo } })
  return { data: sanitizeStudent(response?.data), meta: response?.meta || {} }
}

export async function updateMktEnrollmentStudent(
  user: AppSessionUser,
  matriculaValue: unknown,
  query: Record<string, any>,
  patch: MktEnrollmentStudentPatch
): Promise<MktEnrollmentStudentResponse> {
  const plantel = await resolvePlantelAccess(user, query.plantel)
  const ciclo = normalizeCiclo(query.ciclo)
  const matricula = clean(matriculaValue, 64).toUpperCase()
  if (!ciclo || !matricula) throw createError({ statusCode: 400, message: 'La matrícula y el ciclo escolar son obligatorios.' })
  const response = await auroraFetch<any>(`/api/external/v1/control-escolar/students/${encodeURIComponent(matricula)}`, {
    method: 'PATCH',
    query: { plantel, ciclo },
    body: patch,
    headers: {
      'x-aurora-actor-email': user.email,
      'x-aurora-actor-name': user.displayName || user.email
    }
  })
  return { data: sanitizeStudent(response?.data), meta: response?.meta || { plantel, ciclo } }
}

export async function downloadMktEnrollmentExport(user: AppSessionUser, query: Record<string, any>) {
  const plantel = await resolvePlantelAccess(user, query.plantel)
  const ciclo = normalizeCiclo(query.ciclo)
  if (!ciclo) throw createError({ statusCode: 400, message: 'Selecciona un ciclo escolar.' })
  const aurora = assertConfigured()
  const url = new URL('/api/external/v1/control-escolar/export', aurora.baseURL)
  const params = { ...query, plantel, ciclo }
  Object.entries(params).forEach(([key, value]) => {
    const text = clean(value, 300)
    if (text) url.searchParams.set(key, text)
  })
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), Math.max(aurora.timeout, 60_000))
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${aurora.token}`,
        'x-aurora-token': aurora.token,
        'x-api-key': aurora.token,
        'x-husky-pass-client': 'marketing-enrollment-export'
      },
      signal: controller.signal,
      cache: 'no-store'
    })
    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      throw createError({
        statusCode: response.status,
        statusMessage: clean(payload?.data?.code || payload?.code || 'AURORA_EXPORT_FAILED', 120),
        message: clean(payload?.message || payload?.statusMessage || 'Aurora no pudo generar el Excel.', 500)
      })
    }
    const disposition = response.headers.get('content-disposition') || ''
    const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] || `matricula-actual-${plantel}-${ciclo}.xlsx`
    return { buffer: Buffer.from(await response.arrayBuffer()), filename }
  } catch (error: any) {
    if (error?.name === 'AbortError') throw createError({ statusCode: 504, message: 'Aurora tardó demasiado en generar el Excel.' })
    if (error?.statusCode) throw safeAuroraError(error, 'Aurora no pudo generar el Excel.')
    throw safeAuroraError(error, 'Aurora no pudo generar el Excel.')
  } finally {
    clearTimeout(timeout)
  }
}
