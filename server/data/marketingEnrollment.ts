import type { AppSessionUser } from '~/types/session'
import type {
  MktEnrollmentOptionsResponse,
  MktEnrollmentParentPatch,
  MktEnrollmentStudent,
  MktEnrollmentStudentResponse,
  MktEnrollmentStudentsResponse
} from '~/types/mktEnrollment'
import { isEffectiveSuperAdmin } from '~/utils/sessionScopes'

interface AuroraHealthResponse {
  status?: string
  canonicalPlanteles?: Array<{ plantel?: string }>
  schoolYears?: Array<{ value?: string; label?: string }>
  scopes?: Array<{ plantel?: string; ciclo?: string; rows?: number; freshness?: string; generatedAt?: string | null }>
}

let healthCache: { value: AuroraHealthResponse; expiresAt: number } | null = null
const HEALTH_CACHE_TTL_MS = 60_000

const PLANTEL_LABELS: Record<string, string> = {
  PREEM: 'Preescolar Matutino',
  PREET: 'Preescolar Vespertino',
  GM: 'Guardería Matutina',
  PM: 'Primaria Matutina',
  PT: 'Primaria Vespertina',
  SM: 'Secundaria Matutina',
  ST: 'Secundaria Vespertina'
}

const clean = (value: unknown, max = 500) => String(value ?? '').trim().slice(0, max)
const normalizePlantel = (value: unknown) => {
  const code = clean(value, 40).toUpperCase()
  if (code === 'CT') return 'PREET'
  if (code === 'CM') return 'PREEM'
  if (code === 'PMA' || code === 'PMB') return 'PM'
  return code
}
const normalizeCiclo = (value: unknown) => clean(value, 20).match(/\d{4}/)?.[0] || ''
const levelForPlantel = (plantel: string): 'preescolar' | 'primaria' | 'secundaria' => {
  if (plantel === 'PM' || plantel === 'PT') return 'primaria'
  if (plantel === 'SM' || plantel === 'ST') return 'secundaria'
  return 'preescolar'
}

const config = () => {
  const runtime = useRuntimeConfig() as any
  return {
    baseURL: clean(runtime.aurora?.apiBaseUrl || process.env.AURORA_API_BASE_URL || process.env.HUSKY_PASS_AURORA_API_BASE_URL || 'https://aurora.casitaiedis.edu.mx', 500).replace(/\/+$/, ''),
    token: clean(runtime.aurora?.apiToken || process.env.AURORA_API_TOKEN || process.env.HUSKY_PASS_AURORA_API_TOKEN || '', 1000),
    timeout: Math.max(3000, Number(runtime.aurora?.timeoutMs || process.env.AURORA_API_TIMEOUT_MS || process.env.HUSKY_PASS_AURORA_TIMEOUT_MS || 15000)),
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

const safeAuroraError = (error: any, fallback: string) => {
  const statusCode = Number(error?.response?.status || error?.statusCode || error?.status || 502)
  const message = clean(error?.data?.message || error?.data?.statusMessage || error?.message || fallback, 500)
  return createError({
    statusCode: statusCode >= 400 && statusCode < 600 ? statusCode : 502,
    statusMessage: clean(error?.data?.code || error?.statusMessage || 'AURORA_REQUEST_FAILED', 120),
    message
  })
}

const auroraFetch = async <T>(path: string, options: Record<string, any> = {}): Promise<T> => {
  const aurora = assertConfigured()
  try {
    return await $fetch(path, {
      baseURL: aurora.baseURL,
      timeout: aurora.timeout,
      ...options,
      headers: {
        Authorization: `Bearer ${aurora.token}`,
        'x-husky-pass-client': 'marketing-enrollment',
        ...(options.headers || {})
      }
    }) as T
  } catch (error: any) {
    throw safeAuroraError(error, 'Aurora no respondió a la consulta de matrícula actual.')
  }
}

const getAuroraHealth = async () => {
  const now = Date.now()
  if (healthCache && healthCache.expiresAt > now) return healthCache.value
  const value = await auroraFetch<AuroraHealthResponse>('/api/external/v1/control-escolar/health')
  healthCache = { value, expiresAt: now + HEALTH_CACHE_TTL_MS }
  return value
}

const allowedPlanteles = (user: AppSessionUser, supported: string[]) => {
  const supportedSet = new Set(supported.map(normalizePlantel).filter(Boolean))
  if (isEffectiveSuperAdmin(user)) return [...supportedSet]
  return Array.from(new Set((user.plantel || []).map(normalizePlantel).filter((plantel) => supportedSet.has(plantel))))
}

const assertPlantelAccess = (user: AppSessionUser, plantelValue: unknown, supported?: string[]) => {
  const plantel = normalizePlantel(plantelValue)
  if (!plantel) throw createError({ statusCode: 400, message: 'Selecciona un plantel.' })
  if (supported?.length && !supported.map(normalizePlantel).includes(plantel)) {
    throw createError({ statusCode: 400, message: 'Aurora no reconoce el plantel seleccionado.' })
  }
  if (!isEffectiveSuperAdmin(user)) {
    const assigned = new Set((user.plantel || []).map(normalizePlantel))
    if (!assigned.has(plantel)) throw createError({ statusCode: 403, message: 'El plantel solicitado no está dentro de tu alcance.' })
  }
  return plantel
}

const sanitizeStudent = (value: any): MktEnrollmentStudent => {
  const student = { ...(value || {}) }
  for (const key of ['huskyPassPlaintext', 'huskyPassUsername', 'huskyPassEmail', 'huskyPassAvailable', 'rawPhoto', 'centralMatriculaRaw', 'Control_Escolar_RAW_JSON', 'raw']) delete student[key]
  student.matricula = clean(student.matricula, 64).toUpperCase()
  student.fullName = clean(student.fullName || student.nombreCompleto || student.display?.nombre, 255)
  student.plantel = normalizePlantel(student.plantel || student.basePlantel)
  return student as MktEnrollmentStudent
}

export async function getMktEnrollmentOptions(user: AppSessionUser): Promise<MktEnrollmentOptionsResponse> {
  const health = await getAuroraHealth()
  const supported = (health.canonicalPlanteles || []).map((item) => normalizePlantel(item.plantel)).filter(Boolean)
  const permitted = allowedPlanteles(user, supported)
  const schoolYears = (health.schoolYears || [])
    .map((item) => ({ value: normalizeCiclo(item.value), label: clean(item.label, 40) }))
    .filter((item) => item.value)
    .sort((left, right) => right.value.localeCompare(left.value))
  const configuredCycle = config().ciclo
  const defaultCiclo = schoolYears.find((item) => item.value === configuredCycle)?.value || schoolYears[0]?.value || configuredCycle
  const scopes = Array.isArray(health.scopes) ? health.scopes : []
  const planteles = permitted.map((code) => ({
    code,
    label: PLANTEL_LABELS[code] || code,
    level: levelForPlantel(code),
    hasData: scopes.some((scope) => normalizePlantel(scope.plantel) === code && Number(scope.rows || 0) > 0)
  }))

  return {
    planteles,
    schoolYears,
    defaultPlantel: planteles[0]?.code || '',
    defaultCiclo,
    connected: String(health.status || '').toLowerCase() === 'ok',
    generatedAt: new Date().toISOString()
  }
}

export async function listMktEnrollmentStudents(user: AppSessionUser, query: Record<string, any>): Promise<MktEnrollmentStudentsResponse> {
  const options = await getMktEnrollmentOptions(user)
  const plantel = assertPlantelAccess(user, query.plantel, options.planteles.map((item) => item.code))
  const ciclo = normalizeCiclo(query.ciclo || options.defaultCiclo)
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
    meta: students?.meta || { plantel, ciclo }
  }
}

export async function getMktEnrollmentStudent(user: AppSessionUser, matriculaValue: unknown, query: Record<string, any>): Promise<MktEnrollmentStudentResponse> {
  const options = await getMktEnrollmentOptions(user)
  const plantel = assertPlantelAccess(user, query.plantel, options.planteles.map((item) => item.code))
  const ciclo = normalizeCiclo(query.ciclo || options.defaultCiclo)
  const matricula = clean(matriculaValue, 64).toUpperCase()
  if (!ciclo || !matricula) throw createError({ statusCode: 400, message: 'La matrícula y el ciclo escolar son obligatorios.' })
  const response = await auroraFetch<any>(`/api/external/v1/control-escolar/students/${encodeURIComponent(matricula)}`, { query: { plantel, ciclo } })
  return { data: sanitizeStudent(response?.data), meta: response?.meta || {} }
}

export async function updateMktEnrollmentParents(
  user: AppSessionUser,
  matriculaValue: unknown,
  query: Record<string, any>,
  patch: MktEnrollmentParentPatch
): Promise<MktEnrollmentStudentResponse> {
  const options = await getMktEnrollmentOptions(user)
  const plantel = assertPlantelAccess(user, query.plantel, options.planteles.map((item) => item.code))
  const ciclo = normalizeCiclo(query.ciclo || options.defaultCiclo)
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
  return { data: sanitizeStudent(response?.data), meta: { plantel, ciclo } }
}

export async function downloadMktEnrollmentExport(user: AppSessionUser, query: Record<string, any>) {
  const options = await getMktEnrollmentOptions(user)
  const plantel = assertPlantelAccess(user, query.plantel, options.planteles.map((item) => item.code))
  const ciclo = normalizeCiclo(query.ciclo || options.defaultCiclo)
  if (!ciclo) throw createError({ statusCode: 400, message: 'Selecciona un ciclo escolar.' })
  const aurora = assertConfigured()
  const url = new URL('/api/external/v1/control-escolar/export', aurora.baseURL)
  const params = { ...query, plantel, ciclo }
  Object.entries(params).forEach(([key, value]) => {
    const text = clean(value, 300)
    if (text) url.searchParams.set(key, text)
  })
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), Math.max(aurora.timeout, 30000))
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${aurora.token}`,
        'x-husky-pass-client': 'marketing-enrollment-export'
      },
      signal: controller.signal,
      cache: 'no-store'
    })
    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      throw createError({ statusCode: response.status, message: clean(payload?.message || payload?.statusMessage || 'Aurora no pudo generar el Excel.', 500) })
    }
    const disposition = response.headers.get('content-disposition') || ''
    const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] || `matricula-actual-${plantel}-${ciclo}.xlsx`
    return { buffer: Buffer.from(await response.arrayBuffer()), filename }
  } catch (error: any) {
    if (error?.name === 'AbortError') throw createError({ statusCode: 504, message: 'Aurora tardó demasiado en generar el Excel.' })
    if (error?.statusCode) throw error
    throw safeAuroraError(error, 'Aurora no pudo generar el Excel.')
  } finally {
    clearTimeout(timeout)
  }
}
