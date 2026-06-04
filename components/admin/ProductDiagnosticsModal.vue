<template>
  <teleport to="body">
    <button
      v-if="ready && !open"
      class="diagnostic-launcher"
      type="button"
      aria-label="Abrir diagnóstico de producto"
      @click="openAndRun"
    >
      Diagnóstico
      <span :class="summaryClass">{{ summaryLabel }}</span>
    </button>

    <div v-if="open" class="diagnostic-overlay" role="dialog" aria-modal="true" aria-labelledby="product-diagnostic-title">
      <section class="diagnostic-modal">
        <header class="diagnostic-header">
          <div>
            <p class="eyebrow">Diagnóstico runtime</p>
            <h2 id="product-diagnostic-title">Estado real del producto</h2>
            <p>Verifica sesión, DOM, rutas, APIs, estados de carga y reactividad visible sobre la app en ejecución.</p>
          </div>
          <button class="diagnostic-close" type="button" aria-label="Cerrar diagnóstico" @click="open = false">×</button>
        </header>

        <section class="diagnostic-summary">
          <article>
            <span>Sesión</span>
            <strong>{{ sessionLabel }}</strong>
          </article>
          <article>
            <span>Ruta</span>
            <strong>{{ route.path }}</strong>
          </article>
          <article>
            <span>Resultado</span>
            <strong>{{ summaryLabel }}</strong>
          </article>
        </section>

        <div class="diagnostic-actions">
          <button class="btn btn-primary" type="button" :disabled="running" @click="runDiagnostics">
            {{ running ? 'Ejecutando…' : 'Reejecutar checks' }}
          </button>
          <button class="btn btn-secondary" type="button" @click="open = false">Cerrar</button>
        </div>

        <p v-if="fatalError" class="alert">{{ fatalError }}</p>

        <ol class="diagnostic-list" aria-live="polite">
          <li v-for="check in checks" :key="check.id" :class="`status-${check.status}`">
            <div class="check-status">{{ statusLabel(check.status) }}</div>
            <div>
              <strong>{{ check.title }}</strong>
              <p>{{ check.reason }}</p>
              <code v-if="check.detail">{{ check.detail }}</code>
            </div>
          </li>
        </ol>
      </section>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'nuxt/app'
import type { PublicSession } from '~/types/session'

type DiagnosticStatus = 'pending' | 'pass' | 'fail' | 'warn'

interface DiagnosticCheck {
  id: string
  title: string
  status: DiagnosticStatus
  reason: string
  detail?: string
}

interface ServerDiagnosticResponse {
  generatedAt: string
  facts: {
    firstUnidad: string
    firstSalaId: number | null
    firstSalaLabel: string
  }
  checks: DiagnosticCheck[]
}

const props = defineProps<{ session?: PublicSession | null }>()
const route = useRoute()
const ready = ref(false)
const open = ref(false)
const running = ref(false)
const fatalError = ref('')
const checks = ref<DiagnosticCheck[]>([])
const serverFacts = ref<ServerDiagnosticResponse['facts'] | null>(null)

const sessionUser = computed(() => props.session?.user || null)
const shouldAutoOpen = computed(() => Boolean(sessionUser.value?.kind === 'admin'))
const sessionLabel = computed(() => {
  const user = sessionUser.value
  if (!user) return 'Sin sesión'
  if (user.isSuperAdmin) return 'Superadmin'
  return `Admin daycare · ${user.unidades.join(', ') || 'sin unidad visible'}`
})

const failedCount = computed(() => checks.value.filter((check) => check.status === 'fail').length)
const warningCount = computed(() => checks.value.filter((check) => check.status === 'warn').length)
const pendingCount = computed(() => checks.value.filter((check) => check.status === 'pending').length)
const summaryLabel = computed(() => {
  if (running.value || pendingCount.value) return 'corriendo'
  if (failedCount.value) return `${failedCount.value} falla${failedCount.value === 1 ? '' : 's'}`
  if (warningCount.value) return `${warningCount.value} aviso${warningCount.value === 1 ? '' : 's'}`
  return checks.value.length ? 'todo pasa' : 'sin ejecutar'
})
const summaryClass = computed(() => failedCount.value ? 'summary-fail' : warningCount.value ? 'summary-warn' : checks.value.length ? 'summary-pass' : 'summary-idle')

watch(shouldAutoOpen, async (value) => {
  if (value && !ready.value) {
    ready.value = true
    await openAndRun()
  }
}, { immediate: true })

onMounted(() => {
  if (shouldAutoOpen.value && !ready.value) {
    ready.value = true
    openAndRun()
  }
})

async function openAndRun() {
  open.value = true
  await runDiagnostics()
}

async function runDiagnostics() {
  if (!sessionUser.value || running.value) return
  running.value = true
  fatalError.value = ''
  checks.value = seedChecks()

  try {
    await nextTick()
    const [serverResponse, domChecks] = await Promise.all([
      runServerChecks(),
      runDomChecks()
    ])
    serverFacts.value = serverResponse?.facts || null
    checks.value = [
      ...(serverResponse?.checks || []),
      ...domChecks,
      await runSafeReactivityCheck()
    ]
  } catch (error: any) {
    fatalError.value = error?.data?.statusMessage || error?.statusMessage || error?.message || 'No fue posible ejecutar el diagnóstico runtime.'
    checks.value = checks.value.map((check) => check.status === 'pending' ? { ...check, status: 'fail', reason: fatalError.value } : check)
  } finally {
    running.value = false
  }
}

function seedChecks(): DiagnosticCheck[] {
  return [
    { id: 'pending:session', title: 'Sesión y autorización', status: 'pending', reason: 'Esperando respuesta de diagnóstico protegido.' },
    { id: 'pending:dom', title: 'DOM visible', status: 'pending', reason: 'Inspeccionando la pantalla renderizada.' },
    { id: 'pending:reactivity', title: 'Reactividad visible', status: 'pending', reason: 'Probando controles seguros de la pantalla actual.' }
  ]
}

async function runServerChecks() {
  return await $fetch<ServerDiagnosticResponse>('/api/admin/product-diagnostics')
}

async function runDomChecks(): Promise<DiagnosticCheck[]> {
  await waitForPaint()
  return [
    checkVisibleSession(),
    checkProductArea(),
    checkNavigationState(),
    checkPersistentLoadingState(),
    checkObservableControls(),
    checkSalaContext(),
    checkDataPanels(),
    checkSuperadminManagement()
  ]
}

function checkVisibleSession(): DiagnosticCheck {
  const user = sessionUser.value
  const roleNode = document.querySelector('[data-diagnostic="session-role"]')
  const roleText = roleNode?.textContent?.replace(/\s+/g, ' ').trim() || ''
  if (!user) return fail('dom:session-visible', 'Sesión visible', 'No hay sesión disponible en el cliente.')
  if (!roleNode) return fail('dom:session-visible', 'Sesión visible', 'El topbar no expone estado de sesión para el usuario.', 'selector=[data-diagnostic="session-role"]')
  const expected = user.isSuperAdmin ? 'Superadmin' : 'Admin daycare'
  if (!roleText.includes(expected)) {
    return fail('dom:session-visible', 'Sesión visible', 'El rol/producto visible no coincide con la sesión.', `visible="${roleText}"; esperado contiene="${expected}"`)
  }
  return pass('dom:session-visible', 'Sesión visible', 'El rol/producto visible coincide con la sesión autenticada.', roleText)
}

function checkProductArea(): DiagnosticCheck {
  const expectedArea = route.path.startsWith('/admin/superadmin') ? 'superadmin' : route.path.startsWith('/admin/daycare') ? 'daycare' : 'admin'
  const areaNode = document.querySelector(`[data-product-area="${expectedArea}"]`)
  if (!areaNode) {
    return fail('dom:product-area', 'Área de producto visible', 'La ruta actual no tiene un contenedor visible de área de producto.', `route=${route.path}; expected=[data-product-area="${expectedArea}"]`)
  }
  return pass('dom:product-area', 'Área de producto visible', 'La ruta renderiza un área de producto explícita.', `area=${expectedArea}; route=${route.path}`)
}

function checkNavigationState(): DiagnosticCheck {
  const links = Array.from(document.querySelectorAll<HTMLElement>('[data-product-nav]'))
  if (!links.length) return fail('dom:navigation', 'Navegación de producto', 'No se encontraron enlaces de navegación de producto visibles.', 'selector=[data-product-nav]')

  const current = links.filter((link) => link.getAttribute('aria-current') === 'page' || link.classList.contains('active'))
  const hasDaycare = links.some((link) => link.getAttribute('data-product-nav') === 'daycare')
  const hasSuperadmin = links.some((link) => link.getAttribute('data-product-nav') === 'superadmin')

  if (!hasDaycare) return fail('dom:navigation', 'Navegación de producto', 'La navegación no permite volver al área daycare.', links.map((link) => link.textContent?.trim()).join(' | '))
  if (sessionUser.value?.isSuperAdmin && !hasSuperadmin) return fail('dom:navigation', 'Navegación de producto', 'Una sesión superadmin no ve acceso al área superadmin.', links.map((link) => link.textContent?.trim()).join(' | '))
  if (!current.length) return fail('dom:navigation', 'Navegación de producto', 'Ningún enlace de producto está marcado como activo para la ruta actual.', `route=${route.path}`)

  return pass('dom:navigation', 'Navegación de producto', 'La navegación expone áreas reales y marca el contexto activo.', current.map((link) => link.textContent?.trim()).join(' | '))
}

function checkPersistentLoadingState(): DiagnosticCheck {
  const loadingNodes = Array.from(document.querySelectorAll<HTMLElement>('[data-product-loading], .loading-card'))
    .filter((node) => isVisible(node))
  if (loadingNodes.length) {
    return fail('dom:loading', 'Estados de carga resueltos', 'Hay estados de carga visibles después de esperar el render inicial.', loadingNodes.map((node) => node.textContent?.trim()).join(' | '))
  }
  const bodyText = document.body.textContent || ''
  if (/Actualizando|Cargando|Ejecutando/.test(bodyText) && !running.value) {
    return warn('dom:loading', 'Estados de carga resueltos', 'Hay texto de carga visible en pantalla; validar que corresponda a una acción en curso.', bodyText.match(/.{0,20}(Actualizando|Cargando|Ejecutando).{0,40}/)?.[0])
  }
  return pass('dom:loading', 'Estados de carga resueltos', 'No hay loaders persistentes visibles en la pantalla actual.')
}

function checkObservableControls(): DiagnosticCheck {
  const controls = Array.from(document.querySelectorAll<HTMLElement>('[data-diagnostic-action], [data-diagnostic-filter], [data-diagnostic-link], button, a, select, input[type="search"]'))
    .filter((element) => isVisible(element) && !isDiagnosticElement(element))
  const broken: string[] = []

  for (const element of controls) {
    const tag = element.tagName.toLowerCase()
    const label = element.textContent?.replace(/\s+/g, ' ').trim() || element.getAttribute('aria-label') || element.getAttribute('placeholder') || tag
    const disabled = element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true'
    const hasHref = tag === 'a' && Boolean((element as HTMLAnchorElement).href)
    const hasDiagnosticContract = Boolean(element.getAttribute('data-diagnostic-action') || element.getAttribute('data-diagnostic-filter') || element.getAttribute('data-diagnostic-link') || element.hasAttribute('data-diagnostic-sala-option'))
    const isFormControl = tag === 'select' || tag === 'input'
    const hasUnavailableReason = disabled && Boolean(element.getAttribute('title') || element.getAttribute('data-unavailable-reason') || /No disponible|Sin /.test(label))

    if (disabled && !hasUnavailableReason) broken.push(`${tag}:${label}:disabled sin razón visible`)
    if (!disabled && tag === 'a' && !hasHref) broken.push(`${tag}:${label}:sin href`)
    if (!disabled && tag === 'button' && !hasDiagnosticContract && !element.closest('form') && !element.closest('[data-diagnostic-ignore]')) broken.push(`${tag}:${label}:sin contrato diagnóstico`)
    if (!disabled && isFormControl && !hasDiagnosticContract) broken.push(`${tag}:${label}:sin contrato diagnóstico`)
  }

  if (broken.length) {
    return fail('dom:controls', 'Controles observables', 'Hay controles visibles sin contrato observable o sin razón de indisponibilidad.', broken.slice(0, 12).join(' | '))
  }
  return pass('dom:controls', 'Controles observables', 'Los controles visibles declaran navegación, filtro, acción o estado indisponible observable.', `controles=${controls.length}`)
}

function checkSalaContext(): DiagnosticCheck {
  if (!route.path.startsWith('/admin/daycare')) return warn('dom:sala-context', 'Contexto de sala', 'La ruta actual no es daycare; el contexto de sala se valida al entrar al workspace daycare.', `route=${route.path}`)

  const salaButtons = Array.from(document.querySelectorAll<HTMLElement>('[data-diagnostic-sala-option]')).filter(isVisible)
  const salaSelect = document.querySelector<HTMLSelectElement>('[data-diagnostic="sala-select"]')
  const context = document.querySelector<HTMLElement>('[data-diagnostic="sala-context"]')
  const unavailable = document.querySelector<HTMLElement>('[data-diagnostic="sala-unavailable"]')

  if (!salaButtons.length && !salaSelect && unavailable) {
    return pass('dom:sala-context', 'Contexto de sala', 'No hay salas seleccionables y la interfaz muestra un estado vacío explícito.', unavailable.textContent?.trim())
  }
  if (!salaButtons.length && !salaSelect) return fail('dom:sala-context', 'Contexto de sala', 'No se detectó selector o lista de salas en un workspace daycare.')
  if (!context) return fail('dom:sala-context', 'Contexto de sala', 'Hay sala seleccionable pero no existe panel/contexto visible de sala.', 'selector=[data-diagnostic="sala-context"]')

  const selectedLabel = context.textContent?.replace(/\s+/g, ' ').trim() || ''
  return pass('dom:sala-context', 'Contexto de sala', 'La selección de sala expone contexto y acciones específicas.', selectedLabel.slice(0, 220))
}

function checkDataPanels(): DiagnosticCheck {
  const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-product-panel]')).filter(isVisible)
  if (!panels.length) return warn('dom:data-panels', 'Paneles data-backed', 'La pantalla actual no expone paneles diagnosticables.', `route=${route.path}`)

  const unresolved = panels.filter((panel) => {
    const state = panel.getAttribute('data-state')
    return state !== 'content' && state !== 'empty' && state !== 'error' && state !== 'unavailable'
  })
  if (unresolved.length) {
    return fail('dom:data-panels', 'Paneles data-backed', 'Hay paneles sin estado content/empty/error/unavailable.', unresolved.map((panel) => panel.getAttribute('data-product-panel') || panel.className).join(' | '))
  }
  return pass('dom:data-panels', 'Paneles data-backed', 'Los paneles visibles declaran un estado final observable.', panels.map((panel) => `${panel.getAttribute('data-product-panel')}=${panel.getAttribute('data-state')}`).join(' | '))
}

function checkSuperadminManagement(): DiagnosticCheck {
  const user = sessionUser.value
  if (!user?.isSuperAdmin) return warn('dom:superadmin', 'Superadmin protegido', 'La sesión actual no es superadmin; la UI de superadmin debe permanecer oculta.', `route=${route.path}`)
  const superadminLink = document.querySelector<HTMLElement>('[data-product-nav="superadmin"]')
  const currentScreen = document.querySelector<HTMLElement>('[data-product-area="superadmin"]')
  if (!superadminLink) return fail('dom:superadmin', 'Superadmin protegido', 'No hay acceso visible al área superadmin para una sesión superadmin.')
  if (route.path.startsWith('/admin/superadmin') && !currentScreen) return fail('dom:superadmin', 'Superadmin protegido', 'La ruta superadmin no renderiza área diagnosticable.')
  return pass('dom:superadmin', 'Superadmin protegido', 'Superadmin es descubrible desde la navegación y la ruta protegida expone su área.', `route=${route.path}`)
}

async function runSafeReactivityCheck(): Promise<DiagnosticCheck> {
  await waitForPaint()
  if (!route.path.startsWith('/admin/daycare/salas') || route.path.includes('/familias') || route.path.includes('/tareas') || route.path.includes('/avisos') || route.path.includes('/calendario')) {
    return warn('dom:reactivity', 'Reactividad de selección segura', 'La ruta actual no es el selector principal de salas; no se ejecutó click automático para evitar acciones de datos.', `route=${route.path}`)
  }

  const salaButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-diagnostic-sala-option]')).filter(isVisible)
  if (salaButtons.length < 2) {
    const context = document.querySelector<HTMLElement>('[data-diagnostic="sala-context"]')
    if (context) return pass('dom:reactivity', 'Reactividad de selección segura', 'Solo hay una sala seleccionable; el contexto visible está resuelto.', context.textContent?.trim().slice(0, 160))
    return warn('dom:reactivity', 'Reactividad de selección segura', 'No hay suficientes salas para probar cambio de selección.', serverFacts.value?.firstSalaLabel || '')
  }

  const beforeQuery = String(route.query.sala || '')
  const currentIndex = Math.max(0, salaButtons.findIndex((button) => button.classList.contains('active') || button.getAttribute('aria-pressed') === 'true'))
  const target = salaButtons[(currentIndex + 1) % salaButtons.length]
  const targetId = target.getAttribute('data-sala-id') || ''
  target.click()
  await waitFor(() => String(route.query.sala || '') === targetId || document.querySelector(`[data-diagnostic-sala-option][data-sala-id="${targetId}"].active`), 1200)
  const afterQuery = String(route.query.sala || '')
  const context = document.querySelector<HTMLElement>('[data-diagnostic="sala-context"]')
  const active = document.querySelector<HTMLElement>(`[data-diagnostic-sala-option][data-sala-id="${targetId}"].active`)

  if (!active || !context) {
    return fail('dom:reactivity', 'Reactividad de selección segura', 'Click de sala no dejó una selección/contexto visible.', `before=${beforeQuery}; target=${targetId}; after=${afterQuery}`)
  }
  return pass('dom:reactivity', 'Reactividad de selección segura', 'Click de sala cambió selección visible y sincronizó estado de ruta/contexto.', `before=${beforeQuery || 'sin query'}; after=${afterQuery || 'sin query'}; sala=${targetId}`)
}

function statusLabel(status: DiagnosticStatus) {
  if (status === 'pass') return 'Pasa'
  if (status === 'fail') return 'Falla'
  if (status === 'warn') return 'Aviso'
  return 'Pendiente'
}

function pass(id: string, title: string, reason: string, detail?: string): DiagnosticCheck {
  return { id, title, status: 'pass', reason, detail }
}

function fail(id: string, title: string, reason: string, detail?: string): DiagnosticCheck {
  return { id, title, status: 'fail', reason, detail }
}

function warn(id: string, title: string, reason: string, detail?: string): DiagnosticCheck {
  return { id, title, status: 'warn', reason, detail }
}

function isVisible(element: Element) {
  const node = element as HTMLElement
  return Boolean(node.offsetWidth || node.offsetHeight || node.getClientRects().length)
}

function isDiagnosticElement(element: HTMLElement) {
  return Boolean(element.closest('.diagnostic-modal') || element.closest('.diagnostic-launcher'))
}

async function waitForPaint() {
  await nextTick()
  await new Promise((resolve) => window.requestAnimationFrame(() => resolve(undefined)))
  await new Promise((resolve) => window.setTimeout(resolve, 450))
}

async function waitFor(predicate: () => unknown, timeoutMs: number) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    if (predicate()) return true
    await new Promise((resolve) => window.setTimeout(resolve, 60))
  }
  return Boolean(predicate())
}
</script>

<style scoped>
.diagnostic-launcher {
  align-items: center;
  background: var(--color-ink);
  border: 0;
  border-radius: 999px;
  bottom: 18px;
  box-shadow: 0 16px 30px rgba(30, 42, 26, 0.22);
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  font-weight: 900;
  gap: 8px;
  min-height: 42px;
  padding: 0 14px;
  position: fixed;
  right: 18px;
  z-index: 80;
}

.diagnostic-launcher span,
.check-status {
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 950;
  padding: 4px 8px;
}

.summary-pass,
.status-pass .check-status {
  background: #e7f5db;
  color: var(--color-brand-900);
}

.summary-warn,
.status-warn .check-status {
  background: #fff3db;
  color: #84580d;
}

.summary-fail,
.status-fail .check-status {
  background: #fff3f0;
  color: #8d2d25;
}

.summary-idle,
.status-pending .check-status {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

.diagnostic-overlay {
  align-items: center;
  background: rgba(22, 35, 15, 0.55);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 18px;
  position: fixed;
  z-index: 90;
}

.diagnostic-modal {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 26px;
  box-shadow: 0 28px 80px rgba(22, 35, 15, 0.34);
  display: grid;
  gap: 14px;
  max-height: min(86vh, 900px);
  max-width: 980px;
  overflow: auto;
  padding: clamp(16px, 2vw, 22px);
  width: min(100%, 980px);
}

.diagnostic-header {
  align-items: start;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) auto;
}

.diagnostic-header h2 {
  font-size: clamp(1.45rem, 2vw, 2rem);
  margin-bottom: 6px;
}

.diagnostic-close {
  align-items: center;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  cursor: pointer;
  display: inline-flex;
  font-size: 1.5rem;
  font-weight: 800;
  height: 38px;
  justify-content: center;
  line-height: 1;
  width: 38px;
}

.diagnostic-summary {
  display: grid;
  gap: 10px;
  grid-template-columns: 0.7fr 1fr 0.42fr;
}

.diagnostic-summary article {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 16px;
  display: grid;
  gap: 4px;
  padding: 10px 12px;
}

.diagnostic-summary span {
  color: var(--color-muted);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.diagnostic-summary strong {
  overflow-wrap: anywhere;
}

.diagnostic-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.diagnostic-list {
  display: grid;
  gap: 9px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.diagnostic-list li {
  align-items: start;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  display: grid;
  gap: 10px;
  grid-template-columns: 74px minmax(0, 1fr);
  padding: 12px;
}

.diagnostic-list strong,
.diagnostic-list p {
  display: block;
  margin: 0;
}

.diagnostic-list code {
  background: #f6f8f1;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  display: block;
  font-size: 0.78rem;
  margin-top: 7px;
  overflow: auto;
  padding: 8px;
  white-space: pre-wrap;
}

@media (max-width: 720px) {
  .diagnostic-summary,
  .diagnostic-list li {
    grid-template-columns: 1fr;
  }

  .diagnostic-actions .btn {
    width: 100%;
  }
}
</style>
