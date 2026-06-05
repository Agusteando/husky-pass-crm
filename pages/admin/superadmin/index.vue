<template>
  <section class="superadmin-page stack" data-product-area="superadmin" data-product-screen="directory">
    <header class="workspace-head compact-head superadmin-head">
      <div>
        <p class="eyebrow">Superadmin</p>
        <h1>Gestión de usuarios y productos</h1>
        <p>Monitorea cuentas internas, familias de guardería y familias de Personas Autorizadas desde un solo directorio real.</p>
      </div>
      <div class="head-actions">
        <NuxtLink class="btn btn-secondary" to="/admin/superadmin/personas-autorizadas">Readiness PA</NuxtLink>
        <NuxtLink class="btn btn-secondary" to="/admin/historial-accesos">Historial de accesos</NuxtLink>
        <button class="btn btn-secondary" type="button" data-diagnostic-action="actualizar-directorio" :disabled="isLoadingVisible" :data-unavailable-reason="isLoadingVisible ? 'Actualizando directorio' : undefined" @click="refreshDirectory">{{ isLoadingVisible ? 'Actualizando...' : 'Actualizar' }}</button>
      </div>
    </header>

    <section class="scope-tabs" aria-label="Alcance de usuarios">
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
    </section>

    <section class="filters-card card">
      <label class="label">
        Plantel
        <select v-model="selectedPlantel" class="select" data-diagnostic-filter="plantel">
          <option value="">Todos</option>
          <option v-for="plantel in directory?.planteles || []" :key="plantel" :value="plantel">{{ plantel }}</option>
        </select>
      </label>
      <label class="label">
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
    </section>

    <section v-if="directory && !loadProblem" class="super-metrics">
      <article>
        <span>Total visible</span>
        <strong>{{ directory.metrics.total }}</strong>
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
        <span>Personas Autorizadas</span>
        <strong>{{ directory.metrics.schoolFamilies }}</strong>
      </article>
      <article>
        <span>Internos</span>
        <strong>{{ directory.metrics.internalUsers }}</strong>
      </article>
      <article>
        <span>Impersonables</span>
        <strong>{{ directory.metrics.impersonable }}</strong>
      </article>
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
              <tr v-for="user in directory.users" :key="user.id" :class="{ selected: selectedUser?.id === user.id }">
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
        <template v-if="selectedUser">
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
        </template>
        <EmptyState v-else title="Selecciona un usuario" description="Verás su rol, producto, plantel y rutas heredadas sin salir del directorio." />
      </aside>
    </section>

    <div v-else data-product-panel="superadmin-directory" data-state="empty"><EmptyState title="Sin usuarios" description="Ajusta el producto, plantel o búsqueda para encontrar usuarios con datos reales." /></div>
  </section>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { navigateTo, useFetch, useRoute, useRouter } from 'nuxt/app'
import type { AppSessionUser, FamilyProductScope } from '~/types/session'
import type { SuperAdminDirectoryResponse, SuperAdminDirectoryScope, SuperAdminUserSummary } from '~/types/superadmin'
import { defaultFamilyRoute } from '~/utils/sessionScopes'
import { displayMatricula } from '~/utils/personasTheme'

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

.superadmin-head {
  grid-template-columns: minmax(0, 1fr) auto;
}

.head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.scope-tabs {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.scope-tab {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  cursor: pointer;
  display: grid;
  gap: 4px;
  padding: 12px;
  text-align: left;
}

.scope-tab:hover,
.scope-tab.active {
  background: var(--color-brand-100);
  border-color: var(--color-brand-300);
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
  gap: 12px;
  grid-template-columns: minmax(180px, 0.7fr) minmax(260px, 1fr) minmax(120px, 0.32fr);
}

.super-metrics {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.super-metrics article {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: var(--shadow-line);
  display: grid;
  gap: 4px;
  padding: 12px 14px;
}

.super-metrics span {
  color: var(--color-muted);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.super-metrics strong {
  color: var(--color-ink);
  font-size: 1.5rem;
  line-height: 1;
}

.directory-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
}

.section-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-head h2,
.detail-card h2 {
  font-size: 1.25rem;
  margin-bottom: 0;
}

.users-table {
  min-width: 1040px;
}

.users-table tr.selected td {
  background: #fbfdf8;
}

.user-cell {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: 42px minmax(0, 1fr);
}

.user-avatar {
  align-items: center;
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 14px;
  color: var(--color-brand-900);
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 600;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.user-cell strong,
.user-cell small,
.user-cell em,
.scope-stack span,
.scope-stack small {
  display: block;
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
  padding-inline: 12px;
}

.notice {
  background: #f0f8e7;
  border: 1px solid var(--color-brand-200);
  border-radius: 14px;
  color: var(--color-brand-900);
  font-weight: 600;
  margin: 0;
  padding: 10px 12px;
}

.loading-card {
  color: var(--color-muted);
}

.detail-card {
  align-self: start;
  display: grid;
  gap: 12px;
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

@media (max-width: 1180px) {
  .scope-tabs,
  .super-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .directory-grid {
    grid-template-columns: 1fr;
  }

  .detail-card {
    position: static;
  }
}

@media (max-width: 980px) {
  .filters-card,
  .superadmin-head,
  .scope-tabs,
  .super-metrics {
    grid-template-columns: 1fr;
  }

  .users-table {
    min-width: 0;
  }
}
</style>
