import { defineEventHandler } from 'h3'
import { assertDaycareAdmin, isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'
import { getAdminResources, getSalaOperationalOverview, getSalasOverviewForUnidad } from '~/server/data/mysqlDaycare'
import { listSuperAdminDirectory } from '~/server/data/mysqlAuth'

interface DiagnosticCheck {
  id: string
  title: string
  status: 'pass' | 'fail' | 'warn'
  reason: string
  detail?: string
}

type ProbeResult = Pick<DiagnosticCheck, 'status' | 'reason' | 'detail'>

function errorMessage(error: unknown) {
  if (error && typeof error === 'object') {
    const candidate = error as { statusMessage?: string; message?: string; data?: { statusMessage?: string } }
    return candidate.data?.statusMessage || candidate.statusMessage || candidate.message || 'Error desconocido'
  }
  return 'Error desconocido'
}

async function probe(id: string, title: string, run: () => Promise<ProbeResult>): Promise<DiagnosticCheck> {
  try {
    return { id, title, ...(await run()) }
  } catch (error) {
    return {
      id,
      title,
      status: 'fail',
      reason: errorMessage(error)
    }
  }
}

function pass(reason: string, detail?: string): ProbeResult {
  return { status: 'pass', reason, detail }
}

function fail(reason: string, detail?: string): ProbeResult {
  return { status: 'fail', reason, detail }
}

function warn(reason: string, detail?: string): ProbeResult {
  return { status: 'warn', reason, detail }
}

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)

  const checks: DiagnosticCheck[] = []
  const firstUnidad = user.unidades[0] || ''
  let firstSalaId: number | null = null
  let firstSalaLabel = ''

  checks.push(await probe('session:admin', 'Sesión interna protegida', async () => {
    if (user.kind !== 'admin') return fail('La sesión no es administrativa.', `kind=${user.kind}`)
    if (!user.email) return fail('La sesión administrativa no expone correo.', `id=${user.id}`)
    return pass(
      user.isSuperAdmin ? 'Sesión superadmin cargada desde cookie firmada.' : 'Sesión admin daycare cargada desde cookie firmada.',
      `id=${user.id}; email=${user.email}; unidades=${user.unidades.join(', ') || 'sin unidades'}; roles=${user.roles.join(', ') || 'sin roles'}`
    )
  }))

  checks.push(await probe('api:salas-overview', 'API de salas por unidad', async () => {
    if (!firstUnidad) return fail('La sesión admin no tiene unidades para consultar salas.', 'hasDaycareAdminScope requiere al menos una unidad salvo superadmin con unidades resueltas.')
    const rows = await getSalasOverviewForUnidad(user, firstUnidad)
    if (!Array.isArray(rows)) return fail('La respuesta no es un arreglo.', `unidad=${firstUnidad}`)
    const invalid = rows.find((row) => typeof row.id !== 'number' || !row.sala || !row.unidad || !row.metrics)
    if (invalid) return fail('La respuesta de salas no trae la forma esperada.', JSON.stringify(invalid))
    firstSalaId = rows[0]?.id || null
    firstSalaLabel = rows[0] ? `${rows[0].unidad} · ${rows[0].sala}` : ''
    return pass(rows.length ? 'Salas resueltas con métricas reales.' : 'La consulta resolvió; la unidad no tiene salas y debe mostrar estado vacío.', `unidad=${firstUnidad}; salas=${rows.length}`)
  }))

  checks.push(await probe('api:sala-overview', 'API de contexto operativo de sala', async () => {
    if (!firstSalaId) return warn('No hay sala disponible para validar contexto específico.', `unidad=${firstUnidad || 'sin unidad'}`)
    const overview = await getSalaOperationalOverview(user, firstSalaId)
    if (!overview?.sala?.id || !overview.metrics || !Array.isArray(overview.latestResources) || !Array.isArray(overview.latestFamilies)) {
      return fail('La respuesta de overview de sala no trae sala, métricas, publicaciones y familias.', `sala=${firstSalaId}`)
    }
    return pass('El contexto de sala devuelve datos operativos y listas reales.', `sala=${firstSalaLabel}; familias=${overview.metrics.familias}; contenido=${overview.metrics.totalRecursos}`)
  }))

  checks.push(await probe('api:resources', 'APIs de contenido daycare administrativo', async () => {
    if (!firstSalaId) return warn('No hay sala para validar tareas, avisos y calendario.', `unidad=${firstUnidad || 'sin unidad'}`)
    const [tareas, avisos, calendario] = await Promise.all([
      getAdminResources(user, firstSalaId, 'hw'),
      getAdminResources(user, firstSalaId, 'news'),
      getAdminResources(user, firstSalaId, 'cal')
    ])
    const responses = [tareas, avisos, calendario]
    const malformed = responses.find((response) => !response?.sala?.id || !Array.isArray(response.rows))
    if (malformed) return fail('Alguna respuesta de recursos no trae sala y rows[].', `sala=${firstSalaId}`)
    return pass('Tareas, avisos y calendario resuelven desde recursos reales.', `hw=${tareas.rows.length}; news=${avisos.rows.length}; cal=${calendario.rows.length}`)
  }))

  checks.push(await probe('data:family-daycare-content', 'Contenido familiar daycare respaldado por base de datos', async () => {
    if (!firstSalaId) return warn('No hay sala para validar contenido visible para familias.', `unidad=${firstUnidad || 'sin unidad'}`)
    const [tareas, avisos, calendario] = await Promise.all([
      getAdminResources(user, firstSalaId, 'hw'),
      getAdminResources(user, firstSalaId, 'news'),
      getAdminResources(user, firstSalaId, 'cal')
    ])
    const visibleCount = [...tareas.rows, ...avisos.rows, ...calendario.rows].filter((row) => Number(row.hidden || 0) === 0).length
    return pass(
      visibleCount ? 'Hay contenido publicado que la experiencia familiar puede consumir.' : 'La consulta real resolvió sin contenido publicado; la familia debe ver estados vacíos, no datos simulados.',
      `sala=${firstSalaId}; recursos visibles=${visibleCount}`
    )
  }))

  checks.push(await probe('scope:personas-autorizadas', 'Personas Autorizadas separado de daycare', async () => {
    const hasDaycareScope = user.productScopes.includes('daycare')
    const hasPaScope = user.productScopes.includes('personasAutorizadas')
    if (user.kind !== 'admin') return fail('La sesión interna no debe evaluar como familia de Personas Autorizadas.', `kind=${user.kind}`)
    return pass('La sesión admin no mezcla scopes familiares; Personas Autorizadas se autoriza por su propio scope familiar.', `adminProductScopes=${[hasDaycareScope && 'daycare', hasPaScope && 'personasAutorizadas'].filter(Boolean).join(',') || 'ninguno'}`)
  }))

  checks.push(await probe('api:superadmin-directory', 'Superadmin protegido y descubrible', async () => {
    if (!isSuperAdmin(user)) return warn('La sesión no es superadmin; el directorio debe permanecer oculto y protegido.', `email=${user.email}`)
    const [directory, daycareDirectory] = await Promise.all([
      listSuperAdminDirectory({ scope: 'all', limit: 50 }),
      listSuperAdminDirectory({ scope: 'daycare', limit: 50 })
    ])
    if (!Array.isArray(directory.users) || !directory.metrics || !Array.isArray(directory.planteles)) {
      return fail('El directorio superadmin no trae users[], metrics y planteles[].')
    }
    if (!Array.isArray(daycareDirectory.users) || daycareDirectory.filters.scope !== 'daycare') {
      return fail('El filtro daycare del directorio no devuelve la forma esperada.', `scope=${daycareDirectory.filters.scope}`)
    }
    return pass(
      'Directorio superadmin protegido devuelve usuarios, planteles, métricas y el filtro daycare resuelve una consulta propia.',
      `usuarios=${directory.users.length}; daycare=${daycareDirectory.users.length}; planteles=${directory.planteles.length}; impersonables=${directory.metrics.impersonable}`
    )
  }))

  return {
    generatedAt: new Date().toISOString(),
    session: {
      id: user.id,
      email: user.email,
      kind: user.kind,
      isSuperAdmin: Boolean(user.isSuperAdmin),
      unidades: user.unidades,
      roles: user.roles,
      impersonation: user.impersonation ? { mode: user.impersonation.mode, startedAt: user.impersonation.startedAt } : null
    },
    facts: {
      firstUnidad,
      firstSalaId,
      firstSalaLabel
    },
    checks
  }
})
