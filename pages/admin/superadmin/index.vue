<template>
  <section class="superadmin-page stack" data-product-area="superadmin" data-product-screen="directory">
    <header class="admin-command">
      <div class="admin-command-copy">
        <p class="eyebrow">Superadmin</p>
        <h1>Gestión de usuarios y productos</h1>
        <p>Encuentra cuentas, revisa alcances y abre soporte familiar desde un directorio operativo.</p>

        <div class="head-actions">
          <NuxtLink class="btn btn-primary" to="/admin/superadmin/personas-autorizadas">Husky Pass</NuxtLink>
          <NuxtLink class="btn btn-secondary" to="/admin/historial-accesos">Historial</NuxtLink>
          <NuxtLink class="btn btn-secondary" to="/admin/superadmin/entorno">Entorno</NuxtLink>
          <button class="btn btn-secondary" type="button" data-diagnostic-action="actualizar-directorio" :disabled="isLoadingVisible" :data-unavailable-reason="isLoadingVisible ? 'Actualizando directorio' : undefined" @click="refreshDirectory">{{ isLoadingVisible ? 'Actualizando...' : 'Actualizar' }}</button>
        </div>
      </div>

      <section v-if="directory && !loadProblem" class="command-metrics" aria-label="Resumen del directorio">
        <article class="metric-feature">
          <span>Total visible</span>
          <strong>{{ directory.metrics.total }}</strong>
          <small>{{ activeScopeLabel }}</small>
        </article>
        <article>
          <span>Familias</span>
          <strong>{{ directory.metrics.familyUsers }}</strong>
        </article>
        <article>
          <span>Guardería</span>
          <strong>{{ directory.metrics.daycareFamilies }}</strong>
        </article>
        <article>
          <span>Husky Pass</span>
          <strong>{{ directory.metrics.schoolFamilies }}</strong>
        </article>
        <article>
          <span>Soporte</span>
          <strong>{{ directory.metrics.impersonable }}</strong>
        </article>
      </section>
    </header>

    <section class="directory-control card">
      <div class="scope-tabs" aria-label="Alcance de usuarios">
        <button
          v-for="option in scopeOptions"
          :key="option.value"
          class="scope-tab"
          :class="{ active: selectedScope === option.value }"
          type="button"
          data-diagnostic-action="filtrar-scope"
          :aria-pressed="selectedScope === option.value"
          @click="selectScope(option.value)"
        >
          <strong>{{ option.label }}</strong>
          <span>{{ option.description }}</span>
        </button>
      </div>

      <div class="filters-card">
        <label class="label">
          Plantel
          <select v-model="selectedPlantel" class="select" data-diagnostic-filter="plantel">
            <option value="">Todos</option>
            <option v-for="plantel in directory?.planteles || []" :key="plantel" :value="plantel">{{ plantel }}</option>
          </select>
        </label>
        <label class="label search-label">
          Buscar usuario
          <input v-model="search" class="input" type="search" placeholder="Nombre, correo, matrícula, rol, sala o campus" data-diagnostic-filter="buscar-usuario" />
        </label>
        <label class="label">
          Límite
          <select v-model.number="limit" class="select" data-diagnostic-filter="limite">
            <option :value="50">50</option>
            <option :value="120">120</option>
            <option :value="250">250</option>
          </select>
        </label>
      </div>
    </section>

    <p v-if="actionError" class="alert">{{ actionError }}</p>
    <p v-if="actionNotice" class="notice">{{ actionNotice }}</p>

    <section v-if="loadProblem" class="card state-card" data-product-panel="superadmin-directory" data-state="error">
      <p class="eyebrow">Directorio no disponible</p>
      <h2>No fue posible cargar usuarios.</h2>
      <p>{{ loadProblemMessage }}</p>
      <button class="btn btn-secondary compact" type="button" data-diagnostic-action="reintentar-directorio" @click="refreshDirectory">Reintentar</button>
    </section>
    <div v-else-if="isLoadingVisible" class="card loading-card" data-product-loading>Cargando usuarios…</div>

    <section v-else-if="directory?.users?.length" class="directory-grid" data-product-panel="superadmin-directory" data-state="content">
      <article class="card users-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Directorio</p>
            <h2>{{ directory.users.length }} usuarios</h2>
          </div>
          <span class="muted">{{ activeScopeLabel }}</span>
        </div>

        <div class="table-wrap responsive-card-wrap">
          <table class="table responsive-table users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Tipo</th>
                <th>Plantel</th>
                <th>Alcances</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in directory.users" :key="user.id" :class="{ selected: clientReady && selectedUser?.id === user.id }">
                <td data-label="Usuario">
                  <div class="user-cell">
                    <span class="user-avatar">{{ initials(user) }}</span>
                    <span>
                      <strong>{{ displayName(user) }}</strong>
                      <small>{{ user.email || loginLabel(user.username) || `ID ${user.id}` }}</small>
                      <em v-if="user.nombre_nino">{{ user.nombre_nino }}</em>
                    </span>
                  </div>
                </td>
                <td data-label="Tipo"><span class="type-pill">{{ audienceLabel(user) }}</span></td>
                <td data-label="Plantel">
                  <div class="scope-stack">
                    <span>{{ labelList([...user.plantel, ...user.unidad], '—') }}</span>
                    <small v-if="user.sala">Sala {{ user.sala }}</small>
                    <small v-if="user.campus">{{ user.campus }}</small>
                  </div>
                </td>
                <td data-label="Alcances">
                  <div class="pills">
                    <span v-for="scope in user.productScopes" :key="scope" class="scope-pill">{{ productScopeLabel(scope) }}</span>
                    <span v-if="user.adminScopes.includes('daycare')" class="scope-pill muted-pill">Guardería interna</span>
                    <span v-if="user.communicationsEnabled" class="scope-pill comms-pill">Comunicados</span>
                    <span v-if="!user.productScopes.length && !user.adminScopes.length" class="muted">Sin alcance detectado</span>
                  </div>
                </td>
                <td data-label="Acciones">
                  <div class="row-actions">
                    <button class="btn btn-secondary compact" type="button" data-diagnostic-action="detalle-usuario" @click="selectUser(user)">Detalle</button>
                    <NuxtLink
                      v-if="user.productScopes.includes('daycare') && user.sala"
                      class="btn btn-secondary compact"
                      :to="`/admin/daycare/salas/${user.sala}/familias`"
                      data-diagnostic-link="ver-sala-usuario"
                    >
                      Ver sala
                    </NuxtLink>
                    <button
                      class="btn btn-primary compact"
                      type="button"
                      data-diagnostic-action="impersonar-usuario"
                      :disabled="!user.canImpersonate || impersonatingId === user.id"
                      :data-unavailable-reason="!user.canImpersonate ? 'Usuario sin producto familiar impersonable' : impersonatingId === user.id ? 'Abriendo impersonación' : undefined"
                      @click="requestImpersonation(user)"
                    >
                      {{ impersonationButtonLabel(user) }}
                    </button>
                    <button
                      v-if="confirmingImpersonationId === user.id"
                      class="btn btn-secondary compact"
                      type="button"
                      data-diagnostic-action="cancelar-impersonacion"
                      @click="cancelImpersonation"
                    >
                      Cancelar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <aside class="card detail-card">
        <template v-if="clientReady && selectedUser">
          <p class="eyebrow">Detalle de usuario</p>
          <h2>{{ displayName(selectedUser) }}</h2>
          <dl>
            <div><dt>ID</dt><dd>{{ selectedUser.id }}</dd></div>
            <div><dt>Correo</dt><dd>{{ selectedUser.email || '—' }}</dd></div>
            <div><dt>Usuario</dt><dd>{{ loginLabel(selectedUser.username) || '—' }}</dd></div>
            <div><dt>Rol legado</dt><dd>{{ selectedUser.role || '—' }}</dd></div>
            <div><dt>Producto</dt><dd>{{ selectedUser.productScopes.map(productScopeLabel).join(' · ') || 'Interno / sin producto familiar' }}</dd></div>
            <div><dt>Plantel</dt><dd>{{ labelList([...selectedUser.plantel, ...selectedUser.unidad], '—') }}</dd></div>
            <div><dt>Rutas heredadas</dt><dd>{{ selectedUser.routes.length ? selectedUser.routes.join(' · ') : '—' }}</dd></div>
          </dl>


          <section class="comms-permissions" aria-label="Gestion Escolar">
            <div class="section-head compact-headline">
              <div>
                <p class="eyebrow">Gestion Escolar</p>
                <h3>Permisos escuela-familia</h3>
              </div>
              <NuxtLink class="btn btn-primary compact" to="/admin/superadmin/gestion-escolar">Abrir cockpit</NuxtLink>
            </div>
            <p class="muted">Comunicados, encuestas, convenios, visibilidad familiar e impersonacion se asignan ahora desde el cockpit dedicado.</p>
            <p v-if="selectedUser.communicationsEnabled" class="muted">Esta cuenta conserva compatibilidad legacy de Comunicados durante la migracion.</p>
          </section>
        </template>
        <EmptyState v-else title="Selecciona un usuario" description="Verás su rol, producto, plantel y rutas heredadas sin salir del directorio." />
      </aside>
    </section>

    <div v-else data-product-panel="superadmin-directory" data-state="empty"><EmptyState title="Sin usuarios" description="Ajusta el producto, plantel o búsqueda para encontrar usuarios con datos reales." /></div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { navigateTo, useFetch, useRoute, useRouter } from 'nuxt/app'
import type { AppSessionUser, FamilyProductScope } from '~/types/session'
import type { SuperAdminDirectoryResponse, SuperAdminDirectoryScope, SuperAdminUserSummary } from '~/types/superadmin'
import { defaultFamilyRoute } from '~/utils/sessionScopes'
import { displayMatricula } from '~/utils/matricula'

definePageMeta({ layout: 'admin', middleware: ['admin', 'superadmin'] })

const route = useRoute()
const router = useRouter()

const scopeOptions: Array<{ value: SuperAdminDirectoryScope; label: string; description: string }> = [
  { value: 'all', label: 'Todos', description: 'Directorio completo' },
  { value: 'daycare', label: 'Guardería', description: 'Familias de guardería' },
  { value: 'schoolFamilies', label: 'Personas Autorizadas', description: 'Familias escolares' },
  { value: 'internal', label: 'Internos', description: 'Roles administrativos' },
  { value: 'impersonable', label: 'Soporte', description: 'Cuentas familiares' }
]

const selectedPlantel = ref(typeof route.query.plantel === 'string' ? route.query.plantel : '')
const selectedScope = ref<SuperAdminDirectoryScope>(normalizeScope(route.query.scope))
const selectedUser = ref<SuperAdminUserSummary | null>(null)
const clientReady = ref(false)
const search = ref(typeof route.query.buscar === 'string' ? route.query.buscar : '')
const limit = ref(normalizeLimit(route.query.limite))
const actionError = ref('')
const actionNotice = ref('')
const impersonatingId = ref<number | null>(null)
const confirmingImpersonationId = ref<number | null>(null)

const query = computed(() => ({
  plantel: selectedPlantel.value,
  search: search.value,
  scope: selectedScope.value,
  limit: limit.value
}))

const activeScopeLabel = computed(() => scopeOptions.find((option) => option.value === selectedScope.value)?.label || 'Todos')

const { data: directory, pending, error: loadError, refresh } = useFetch<SuperAdminDirectoryResponse>('/api/admin/superadmin/users', {
  query,
  watch: [query],
  timeout: 15000,
  dedupe: 'cancel'
})

const directoryTimedOut = ref(false)
let directoryTimer: ReturnType<typeof setTimeout> | null = null

const isLoadingVisible = computed(() => pending.value && !directoryTimedOut.value)
const loadProblem = computed(() => Boolean(directoryTimedOut.value || loadError.value))
const loadProblemMessage = computed(() => {
  if (directoryTimedOut.value) return 'La consulta excedió el tiempo de espera. Reintenta para abrir una conexión nueva a base de datos.'
  const error = loadError.value as { data?: { statusMessage?: string }; statusMessage?: string; message?: string } | null
  return error?.data?.statusMessage || error?.statusMessage || error?.message || 'La consulta falló antes de entregar un estado de contenido o vacío.'
})

watch(pending, (value) => {
  if (directoryTimer) {
    clearTimeout(directoryTimer)
    directoryTimer = null
  }
  if (!value) return
  directoryTimedOut.value = false
  directoryTimer = setTimeout(() => {
    if (pending.value) directoryTimedOut.value = true
  }, 15000)
}, { immediate: true })

watch(loadError, (value) => {
  if (value) directoryTimedOut.value = false
})

onUnmounted(() => {
  if (directoryTimer) clearTimeout(directoryTimer)
})

onMounted(() => {
  clientReady.value = true
})

watch([selectedPlantel, selectedScope, search, limit], () => {
  confirmingImpersonationId.value = null
  syncQuery()
})

watch(() => route.query.plantel, (value) => {
  const next = typeof value === 'string' ? value : ''
  if (next !== selectedPlantel.value) selectedPlantel.value = next
})

watch(() => route.query.buscar, (value) => {
  const next = typeof value === 'string' ? value : ''
  if (next !== search.value) search.value = next
})

watch(() => route.query.scope, (value) => {
  const next = normalizeScope(value)
  if (next !== selectedScope.value) selectedScope.value = next
})

watch(() => route.query.limite, (value) => {
  const next = normalizeLimit(value)
  if (next !== limit.value) limit.value = next
})

watch(() => route.query.usuario, (value) => {
  const id = Number(value || 0)
  if (!id) return
  const user = directory.value?.users.find((item) => item.id === id)
  if (user) selectedUser.value = user
})

watch(directory, (value) => {
  if (!value?.users?.length) {
    selectedUser.value = null
    return
  }
  const routeUser = Number(route.query.usuario || 0)
  const selectedFromRoute = value.users.find((user) => user.id === routeUser)
  if (selectedFromRoute) {
    selectedUser.value = selectedFromRoute
    return
  }
  if (!selectedUser.value || !value.users.some((user) => user.id === selectedUser.value?.id)) {
    selectedUser.value = value.users[0] || null
    syncQuery(selectedUser.value?.id)
  }
}, { immediate: true })

async function refreshDirectory() {
  actionError.value = ''
  actionNotice.value = ''
  directoryTimedOut.value = false
  await refresh()
  if (loadError.value) {
    actionError.value = loadProblemMessage.value
    return
  }
  actionNotice.value = 'Directorio actualizado.'
}

function selectScope(scope: SuperAdminDirectoryScope) {
  selectedScope.value = scope
  selectedUser.value = null
  confirmingImpersonationId.value = null
  actionError.value = ''
  actionNotice.value = ''
  syncQuery(undefined)
}

function selectUser(user: SuperAdminUserSummary) {
  selectedUser.value = user
  actionError.value = ''
  actionNotice.value = ''
  syncQuery(user.id)
}

function syncQuery(selectedId: number | null = selectedUser.value?.id || null) {
  const nextQuery: Record<string, string> = {}
  if (selectedPlantel.value) nextQuery.plantel = selectedPlantel.value
  if (selectedScope.value !== 'all') nextQuery.scope = selectedScope.value
  if (search.value.trim()) nextQuery.buscar = search.value.trim()
  if (limit.value !== 120) nextQuery.limite = String(limit.value)
  if (selectedId) nextQuery.usuario = String(selectedId)
  replaceQueryIfChanged(nextQuery)
}

function replaceQueryIfChanged(query: Record<string, string>) {
  if (!import.meta.client) return
  const keys = new Set([...Object.keys(route.query), ...Object.keys(query)])
  const changed = Array.from(keys).some((key) => {
    const current = Array.isArray(route.query[key]) ? route.query[key]?.[0] : route.query[key]
    return String(current || '') !== String(query[key] || '')
  })
  if (changed) router.replace({ path: route.path, query })
}

function displayName(user: SuperAdminUserSummary) {
  return user.displayName || user.nombre_nino || loginLabel(user.username) || user.email || `Usuario ${user.id}`
}

function loginLabel(value?: string | null) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (raw.includes('@')) return raw
  return /\d/.test(raw) ? displayMatricula(raw) : raw
}

function initials(user: SuperAdminUserSummary) {
  return displayName(user).split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'HP'
}

function labelList(values: string[], fallback: string) {
  const unique = Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
  return unique.length ? unique.join(' · ') : fallback
}

function productScopeLabel(scope: FamilyProductScope) {
  if (scope === 'daycare') return 'Familia guardería'
  if (scope === 'personasAutorizadas') return 'Personas Autorizadas'
  return scope
}

function audienceLabel(user: SuperAdminUserSummary) {
  if (user.audience === 'multiProductFamily') return 'Familia multiproducto'
  if (user.audience === 'daycareFamily') return 'Familia guardería'
  if (user.audience === 'schoolFamily') return 'Personas Autorizadas'
  if (user.audience === 'internal') return 'Interno'
  return 'Sin clasificar'
}


function impersonationButtonLabel(user: SuperAdminUserSummary) {
  if (!user.canImpersonate) return 'No disponible'
  if (impersonatingId.value === user.id) return 'Abriendo…'
  if (confirmingImpersonationId.value === user.id) return 'Confirmar impersonación'
  return 'Impersonar familia'
}

function cancelImpersonation() {
  confirmingImpersonationId.value = null
  actionNotice.value = ''
}

async function requestImpersonation(user: SuperAdminUserSummary) {
  if (!user.canImpersonate) return
  if (confirmingImpersonationId.value !== user.id) {
    confirmingImpersonationId.value = user.id
    selectedUser.value = user
    syncQuery(user.id)
    actionError.value = ''
    actionNotice.value = `Confirma para entrar como ${displayName(user)}. La sesión quedará marcada como impersonación.`
    return
  }

  actionError.value = ''
  actionNotice.value = ''
  impersonatingId.value = user.id
  try {
    const response = await $fetch<{ user: AppSessionUser }>('/api/auth/admin/impersonate', {
      method: 'POST',
      body: { userId: user.id }
    })
    actionNotice.value = 'Abriendo impersonación familiar.'
    await navigateTo(defaultFamilyRoute(response.user))
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible impersonar esta cuenta.'
  } finally {
    impersonatingId.value = null
    confirmingImpersonationId.value = null
  }
}

function normalizeScope(value: unknown): SuperAdminDirectoryScope {
  return value === 'daycare' || value === 'schoolFamilies' || value === 'internal' || value === 'impersonable' ? value : 'all'
}

function normalizeLimit(value: unknown) {
  const parsed = Number(value || 120)
  return parsed === 50 || parsed === 250 ? parsed : 120
}
</script>

<style scoped>
.superadmin-page {
  gap: 12px;
}

.admin-command {
  background:
    radial-gradient(circle at 88% 16%, rgba(35, 97, 136, .16), transparent 32%),
    linear-gradient(135deg, #ffffff 0%, #f5f9f0 100%);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  box-shadow: var(--shadow-card);
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(420px, .82fr);
  padding: clamp(16px, 2vw, 24px);
}

.admin-command-copy {
  align-content: center;
  display: grid;
  gap: 10px;
  min-width: 0;
}

.admin-command-copy h1 {
  font-size: clamp(2rem, 3.3vw, 3.25rem);
  line-height: .96;
  margin-bottom: 0;
  max-width: 720px;
}

.admin-command-copy p {
  font-size: 1rem;
  max-width: 680px;
}

.head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}

.command-metrics {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.command-metrics article {
  background: rgba(255, 255, 255, .86);
  border: 1px solid rgba(203, 213, 225, .9);
  border-radius: 18px;
  box-shadow: var(--shadow-line);
  display: grid;
  gap: 4px;
  min-height: 86px;
  padding: 14px;
}

.command-metrics .metric-feature {
  background: linear-gradient(135deg, var(--color-brand-900), #236188);
  border-color: transparent;
  color: #fff;
  grid-row: span 2;
}

.command-metrics span {
  color: var(--color-muted);
  font-size: .72rem;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.command-metrics strong {
  color: var(--color-ink);
  font-family: var(--font-title);
  font-size: 2rem;
  line-height: 1;
}

.command-metrics small {
  color: rgba(255, 255, 255, .76);
}

.metric-feature span,
.metric-feature strong {
  color: #fff;
}

.metric-feature strong {
  font-size: clamp(3rem, 5vw, 4.4rem);
}

.directory-control {
  border-radius: 22px;
  display: grid;
  gap: 12px;
}

.scope-tabs {
  background: #f4f7f1;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 6px;
  scrollbar-width: none;
}

.scope-tabs::-webkit-scrollbar {
  display: none;
}

.scope-tab {
  background: transparent;
  border: 1px solid transparent;
  border-radius: 14px;
  cursor: pointer;
  display: grid;
  flex: 1 0 150px;
  gap: 2px;
  min-height: 62px;
  padding: 8px 12px;
  text-align: left;
}

.scope-tab:hover,
.scope-tab.active {
  background: #fff;
  border-color: var(--color-brand-300);
  box-shadow: var(--shadow-soft);
}

.scope-tab strong {
  color: var(--color-ink);
  font-size: 0.94rem;
}

.scope-tab span {
  color: var(--color-muted);
  font-size: 0.78rem;
  line-height: 1.25;
}

.filters-card {
  align-items: end;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(170px, .5fr) minmax(280px, 1fr) minmax(110px, .24fr);
}

.search-label {
  min-width: 0;
}

.directory-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 300px);
  min-width: 0;
}

.section-head {
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: space-between;
  margin-bottom: 8px;
}

.section-head h2,
.detail-card h2 {
  font-size: 1.25rem;
  margin-bottom: 0;
}

.users-table {
  min-width: 0;
  table-layout: fixed;
}

.users-card,
.users-table,
.users-table tbody,
.users-table tr,
.users-table td {
  max-width: 100%;
  min-width: 0;
}

.users-table th:nth-child(1) { width: 31%; }
.users-table th:nth-child(2) { width: 16%; }
.users-table th:nth-child(3) { width: 12%; }
.users-table th:nth-child(4) { width: 19%; }
.users-table th:nth-child(5) { width: 22%; }

.users-table tr.selected td {
  background: #fbfdf8;
}

.user-cell {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: 36px minmax(0, 1fr);
  min-width: 0;
}

.user-avatar {
  align-items: center;
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 12px;
  color: var(--color-brand-900);
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 600;
  height: 34px;
  justify-content: center;
  width: 34px;
}

.user-cell strong,
.user-cell small,
.user-cell em,
.scope-stack span,
.scope-stack small {
  display: block;
  min-width: 0;
  overflow-wrap: anywhere;
}

.user-cell small,
.scope-stack small,
.user-cell em,
.muted {
  color: var(--color-muted);
  font-size: 0.82rem;
  font-style: normal;
}

.scope-stack {
  display: grid;
  gap: 3px;
}

.pills,
.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}

.row-actions .btn {
  white-space: normal;
}

.scope-pill,
.type-pill {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 999px;
  color: var(--color-brand-800);
  display: inline-flex;
  font-size: 0.76rem;
  font-weight: 600;
  padding: 5px 9px;
}

.type-pill {
  background: #eaf4fb;
  border-color: #d2e7f5;
  color: var(--color-blue);
}

.muted-pill {
  background: #f4f4f2;
  border-color: var(--color-border);
  color: var(--color-muted);
}

.compact {
  min-height: 34px;
  padding-inline: 9px;
}

.notice {
  background: #f0f8e7;
  border: 1px solid var(--color-brand-200);
  border-radius: 14px;
  color: var(--color-brand-900);
  font-weight: 600;
  margin: 0;
  padding: 8px 10px;
}

.loading-card {
  color: var(--color-muted);
}

.detail-card {
  align-self: start;
  display: grid;
  gap: 10px;
  position: sticky;
  top: calc(var(--topbar-height) + 12px);
}

.detail-card dl {
  display: grid;
  gap: 10px;
  margin: 0;
}

.detail-card div {
  border-bottom: 1px solid var(--color-border);
  display: grid;
  gap: 2px;
  padding-bottom: 8px;
}

.detail-card dt {
  color: var(--color-muted);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.detail-card dd {
  margin: 0;
  word-break: break-word;
}


.comms-pill {
  background: #eef7ff;
  border-color: #cfe7fb;
  color: #236188;
}

.comms-permissions {
  background: linear-gradient(180deg, #f8fbfc 0%, #ffffff 100%);
  border: 1px solid #e2e8ec;
  border-radius: 18px;
  display: grid;
  gap: 10px;
  padding: 12px;
}

.compact-headline {
  margin-bottom: 0;
}

.compact-headline h3 {
  color: var(--color-ink);
  font-size: 1rem;
  margin: 0;
}

.switch-row,
.check-card {
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8ec;
  border-radius: 999px;
  color: var(--color-ink);
  cursor: pointer;
  display: inline-flex;
  font-size: .78rem;
  font-weight: 800;
  gap: 7px;
  min-height: 34px;
  padding: 0 10px;
  white-space: nowrap;
}

.switch-row input,
.check-card input {
  accent-color: var(--color-brand-700);
}

.scope-editor {
  display: grid;
  gap: 8px;
}

.scope-editor-row {
  align-items: end;
  background: #fff;
  border: 1px solid #e2e8ec;
  border-radius: 16px;
  display: grid;
  gap: 8px;
  grid-template-columns: minmax(78px, .45fr) repeat(4, minmax(84px, 1fr)) minmax(80px, .45fr) 38px;
  padding: 10px;
}

.scope-editor-row[data-global='true'] {
  grid-template-columns: minmax(78px, 1fr) minmax(80px, auto) 38px;
}

.scope-editor-row .label {
  gap: 4px;
}

.scope-editor-row .input,
.scope-editor-row .select {
  min-height: 34px;
}

.icon-only {
  align-items: center;
  display: inline-flex;
  justify-content: center;
  padding-inline: 0;
  width: 38px;
}

.comms-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

@media (max-width: 1180px) {
  .scope-editor-row,
  .scope-editor-row[data-global='true'] {
    grid-template-columns: 1fr;
  }

  .admin-command {
    grid-template-columns: 1fr;
  }

  .directory-grid {
    grid-template-columns: 1fr;
  }

  .users-table {
    table-layout: auto;
  }

  .detail-card {
    position: static;
  }
}

@media (max-width: 980px) {
  .filters-card {
    grid-template-columns: 1fr;
  }

  .command-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .command-metrics .metric-feature {
    grid-column: 1 / -1;
    grid-row: auto;
  }

  .users-table {
    min-width: 0;
  }
}

@media (max-width: 560px) {
  .admin-command {
    border-radius: 20px;
    padding: 16px;
  }

  .head-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .head-actions .btn {
    justify-content: center;
  }

  .command-metrics {
    grid-template-columns: 1fr 1fr;
  }

  .metric-feature strong {
    font-size: 3rem;
  }

  .scope-tab {
    flex-basis: 142px;
  }
}
</style>
