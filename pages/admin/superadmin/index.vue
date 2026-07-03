<template>
  <section class="superadmin-os" data-product-area="superadmin" data-product-screen="directory">
    <header class="command-hero">
      <div class="hero-copy">
        <p class="eyebrow">Super Admin</p>
        <h1>Centro de operación</h1>
        <p>Usuarios, admins, planteles y accesos en una sola vista de control.</p>
        <div class="hero-actions">
          <NuxtLink class="btn btn-primary" to="/admin/superadmin/gestion-escolar">Asignar Admin Escolar</NuxtLink>
          <NuxtLink class="btn btn-secondary" to="/admin/daycare/salas">Ver Daycare</NuxtLink>
          <NuxtLink class="btn btn-secondary" to="/admin/superadmin/personas-autorizadas?fixture=1">Husky Pass</NuxtLink>
          <button class="btn btn-secondary" type="button" data-diagnostic-action="actualizar-directorio" :disabled="isLoadingVisible" @click="refreshDirectory">
            {{ isLoadingVisible ? 'Actualizando...' : 'Actualizar' }}
          </button>
        </div>
      </div>

      <section v-if="directory && !loadProblem" class="hero-metrics" aria-label="Resumen operativo">
        <article class="metric-primary">
          <span>Usuarios visibles</span>
          <strong>{{ directory.metrics.total }}</strong>
          <small>{{ activeScopeLabel }}</small>
        </article>
        <article><span>Familias escolares</span><strong>{{ directory.metrics.schoolFamilies }}</strong></article>
        <article><span>Familias daycare</span><strong>{{ directory.metrics.daycareFamilies }}</strong></article>
        <article><span>Admins internos</span><strong>{{ directory.metrics.internalUsers }}</strong></article>
        <article><span>Soporte seguro</span><strong>{{ directory.metrics.impersonable }}</strong></article>
      </section>
    </header>

    <section class="lane-grid" aria-label="Acciones principales">
      <NuxtLink class="lane-card primary" to="/admin/superadmin/gestion-escolar">
        <span><FamilyPersonasIcon name="school" /></span>
        <div>
          <strong>Admins Escolar</strong>
          <small>Responsabilidad, planteles y grupos sin exponer permisos técnicos.</small>
        </div>
      </NuxtLink>
      <NuxtLink class="lane-card" to="/admin/superadmin">
        <span><FamilyPersonasIcon name="people" /></span>
        <div>
          <strong>Directorio</strong>
          <small>Ver personas, familias, estado de acceso y siguiente acción.</small>
        </div>
      </NuxtLink>
      <NuxtLink class="lane-card" to="/admin/daycare/salas">
        <span><FamilyPersonasIcon name="daycare" /></span>
        <div>
          <strong>Daycare Admin</strong>
          <small>Unidad, sala, familias y contenido familiar de guardería.</small>
        </div>
      </NuxtLink>
      <NuxtLink class="lane-card" to="/admin/historial-accesos">
        <span><FamilyPersonasIcon name="history" /></span>
        <div>
          <strong>Seguridad</strong>
          <small>Historial de acceso, validaciones y señales de auditoría.</small>
        </div>
      </NuxtLink>
    </section>

    <section class="directory-control">
      <div class="scope-tabs" aria-label="Vista del directorio">
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
          Plantel o unidad
          <select v-model="selectedPlantel" class="select" data-diagnostic-filter="plantel">
            <option value="">Todos</option>
            <option v-for="plantel in directory?.planteles || []" :key="plantel" :value="plantel">{{ plantel }}</option>
          </select>
        </label>
        <label class="label search-label">
          Buscar
          <input v-model="search" class="input" type="search" placeholder="Nombre, correo, matrícula, sala o campus" data-diagnostic-filter="buscar-usuario" />
        </label>
        <label class="label">
          Vista
          <select v-model.number="limit" class="select" data-diagnostic-filter="limite">
            <option :value="50">Compacta</option>
            <option :value="120">Operativa</option>
            <option :value="250">Amplia</option>
          </select>
        </label>
      </div>
    </section>

    <p v-if="actionError" class="alert">{{ actionError }}</p>
    <p v-if="actionNotice" class="notice">{{ actionNotice }}</p>

    <section v-if="loadProblem" class="state-card" data-product-panel="superadmin-directory" data-state="error">
      <p class="eyebrow">Directorio no disponible</p>
      <h2>No fue posible cargar usuarios.</h2>
      <p>{{ loadProblemMessage }}</p>
      <button class="btn btn-secondary compact" type="button" data-diagnostic-action="reintentar-directorio" @click="refreshDirectory">Reintentar</button>
    </section>
    <div v-else-if="isLoadingVisible" class="state-card loading-card" data-product-loading>Cargando usuarios...</div>

    <section v-else-if="directory?.users?.length" class="people-layout" data-product-panel="superadmin-directory" data-state="content">
      <article class="people-panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">Directorio</p>
            <h2>{{ directory.users.length }} personas</h2>
          </div>
          <span class="soft-pill">{{ activeScopeLabel }}</span>
        </div>

        <div class="people-list" role="list">
          <button
            v-for="user in directory.users"
            :key="user.id"
            class="person-row"
            :class="{ selected: clientReady && selectedUser?.id === user.id }"
            type="button"
            data-diagnostic-action="detalle-usuario"
            :aria-pressed="clientReady && selectedUser?.id === user.id"
            @click="selectUser(user)"
          >
            <span class="user-avatar">{{ initials(user) }}</span>
            <span class="person-main">
              <strong>{{ displayName(user) }}</strong>
              <small>{{ user.email || loginLabel(user.username) || `ID ${user.id}` }}</small>
            </span>
            <span class="person-context">
              <b :data-state="primaryAccessState(user).state">{{ primaryAccessState(user).label }}</b>
              <small>{{ primaryScopeLabel(user) }}</small>
            </span>
          </button>
        </div>
      </article>

      <aside class="detail-panel">
        <template v-if="clientReady && selectedUser">
          <header class="detail-identity">
            <span class="user-avatar large">{{ initials(selectedUser) }}</span>
            <div>
              <p class="eyebrow">{{ audienceLabel(selectedUser) }}</p>
              <h2>{{ displayName(selectedUser) }}</h2>
              <p>{{ selectedUser.email || loginLabel(selectedUser.username) || `ID ${selectedUser.id}` }}</p>
            </div>
            <span class="state-pill" :data-state="primaryAccessState(selectedUser).state">{{ primaryAccessState(selectedUser).label }}</span>
          </header>

          <section class="next-action-panel">
            <div>
              <p class="eyebrow">Siguiente acción</p>
              <h3>{{ nextActionTitle }}</h3>
            </div>
            <div class="quick-actions">
              <NuxtLink class="btn btn-primary compact" :to="{ path: '/admin/superadmin/gestion-escolar', query: { usuario: selectedUser.id, buscar: selectedUser.email || selectedUser.username || String(selectedUser.id) } }">
                Admin Escolar
              </NuxtLink>
              <button
                class="btn btn-secondary compact"
                type="button"
                data-diagnostic-action="impersonar-usuario"
                :disabled="!selectedUser.canImpersonate || impersonatingId === selectedUser.id"
                :data-unavailable-reason="!selectedUser.canImpersonate ? 'Sin experiencia familiar disponible' : impersonatingId === selectedUser.id ? 'Abriendo vista familiar' : undefined"
                @click="requestImpersonation(selectedUser)"
              >
                {{ impersonationButtonLabel(selectedUser) }}
              </button>
              <button
                v-if="confirmingImpersonationId === selectedUser.id"
                class="btn btn-secondary compact"
                type="button"
                data-diagnostic-action="cancelar-impersonacion"
                @click="cancelImpersonation"
              >
                Cancelar
              </button>
            </div>
          </section>

          <section class="access-grid" aria-label="Que puede hacer">
            <article :data-active="selectedUser.productScopes.includes('personasAutorizadas')">
              <span>Escolar familia</span>
              <strong>{{ selectedUser.productScopes.includes('personasAutorizadas') ? 'Visible' : 'No visible' }}</strong>
              <small>{{ selectedUser.productScopes.includes('personasAutorizadas') ? 'Tiene experiencia Persona Autorizada.' : 'No hay datos escolares familiares detectados.' }}</small>
            </article>
            <article :data-active="selectedUser.productScopes.includes('daycare')">
              <span>Daycare familia</span>
              <strong>{{ selectedUser.productScopes.includes('daycare') ? 'Visible' : 'No visible' }}</strong>
              <small>{{ selectedUser.sala ? `Sala ${selectedUser.sala}` : 'Sala pendiente o no aplica.' }}</small>
            </article>
            <article :data-active="selectedGestionEscolarActive">
              <span>Admin Escolar</span>
              <strong>{{ selectedGestionEscolarActive ? 'Asignado' : 'Sin asignar' }}</strong>
              <small>Se configura por responsabilidad y alcance escolar.</small>
            </article>
            <article :data-active="roleDraft.daycareAdmin">
              <span>Daycare Admin</span>
              <strong>{{ roleDraft.daycareAdmin ? 'Asignado' : 'Sin asignar' }}</strong>
              <small>{{ roleUnidadDraft.length ? roleUnidadDraft.join(' · ') : 'Unidad pendiente.' }}</small>
            </article>
          </section>

          <section class="scope-panel">
            <div class="section-head compact-headline">
              <div>
                <p class="eyebrow">Alcance visible</p>
                <h3>{{ primaryScopeLabel(selectedUser) }}</h3>
              </div>
              <span class="soft-pill">{{ selectedRoleCount ? `${selectedRoleCount} accesos` : 'Sin admin' }}</span>
            </div>
            <dl>
              <div><dt>Planteles / unidades</dt><dd>{{ labelList([...selectedUser.plantel, ...selectedUser.unidad], 'Pendiente') }}</dd></div>
              <div><dt>Campus</dt><dd>{{ selectedUser.campus || selectedUser.empresa || 'Pendiente' }}</dd></div>
              <div><dt>Rutas heredadas</dt><dd>{{ selectedUser.routes.length ? selectedUser.routes.join(' · ') : 'Sin rutas heredadas' }}</dd></div>
            </dl>
          </section>

          <section class="role-console" aria-label="Roles administrativos">
            <div class="section-head compact-headline">
              <div>
                <p class="eyebrow">Admin Daycare y seguridad</p>
                <h3>Responsabilidades directas</h3>
              </div>
              <span class="role-state" :data-active="selectedRoleCount > 0">{{ selectedRoleCount ? 'Activo' : 'Pendiente' }}</span>
            </div>

            <template v-if="selectedUser.canManageAdminRoles">
              <div class="role-grid">
                <label v-for="role in assignableRoles" :key="role.key" class="role-card" :class="{ active: roleDraft[role.key] }">
                  <input v-model="roleDraft[role.key]" type="checkbox" />
                  <span class="role-dot" aria-hidden="true"></span>
                  <span>
                    <strong>{{ role.label }}</strong>
                    <small>{{ role.caption }}</small>
                  </span>
                </label>
              </div>

              <div v-if="roleDraft.daycareAdmin" class="unit-picker" aria-label="Unidades de daycare">
                <span>Unidades</span>
                <button
                  v-for="unidad in roleUnidadOptions"
                  :key="unidad"
                  class="unit-chip"
                  :class="{ active: roleUnidadDraft.includes(unidad) }"
                  type="button"
                  @click="toggleRoleUnidad(unidad)"
                >
                  {{ unidad }}
                </button>
              </div>

              <div class="role-actions">
                <button class="btn btn-secondary compact" type="button" :disabled="savingRoles || !roleHasChanges" @click="resetRoleDraft">Restaurar</button>
                <button class="btn btn-primary compact" type="button" :disabled="savingRoles || !roleHasChanges" @click="saveAdminRoles">{{ savingRoles ? 'Guardando...' : 'Guardar responsabilidades' }}</button>
              </div>
            </template>

            <p v-else class="muted">Solo cuentas institucionales o internas pueden recibir responsabilidades administrativas.</p>
          </section>
        </template>
        <EmptyState v-else title="Selecciona una persona" description="Verás su experiencia, alcance y acciones seguras sin salir del centro de operación." />
      </aside>
    </section>

    <div v-else data-product-panel="superadmin-directory" data-state="empty">
      <EmptyState title="Sin usuarios" description="Ajusta la vista, plantel o búsqueda para encontrar usuarios con datos reales." />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { navigateTo, useFetch, useRoute, useRouter } from 'nuxt/app'
import type { AppSessionUser, FamilyProductScope } from '~/types/session'
import type { SuperAdminAssignableRole, SuperAdminDirectoryResponse, SuperAdminDirectoryScope, SuperAdminRoleAssignments, SuperAdminUserSummary } from '~/types/superadmin'
import { defaultFamilyRoute } from '~/utils/sessionScopes'
import { displayMatricula } from '~/utils/matricula'

definePageMeta({ layout: 'admin', middleware: ['admin', 'superadmin'] })

const route = useRoute()
const router = useRouter()

const scopeOptions: Array<{ value: SuperAdminDirectoryScope; label: string; description: string }> = [
  { value: 'all', label: 'Todos', description: 'Personas, familias y admins' },
  { value: 'internal', label: 'Admins', description: 'Cuentas institucionales' },
  { value: 'schoolFamilies', label: 'Escolar', description: 'Familias Persona Autorizada' },
  { value: 'daycare', label: 'Daycare', description: 'Familias de guardería' },
  { value: 'impersonable', label: 'Soporte', description: 'Vista familiar controlada' }
]

const assignableRoles: Array<{ key: SuperAdminAssignableRole; label: string; caption: string }> = [
  { key: 'daycareAdmin', label: 'Daycare Admin', caption: 'Gestiona unidades, salas, familias y publicaciones.' },
  { key: 'communicationsAdmin', label: 'Comunicados legacy', caption: 'Prepara comunicación institucional fuera de Gestión Escolar.' },
  { key: 'accessHistoryAdmin', label: 'Seguridad e historial', caption: 'Consulta accesos, validaciones y reportes sensibles.' }
]

const emptyRoleAssignments = (): SuperAdminRoleAssignments => ({
  daycareAdmin: false,
  gestionEscolarAdmin: false,
  communicationsAdmin: false,
  accessHistoryAdmin: false
})

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
const roleDraft = ref<SuperAdminRoleAssignments>(emptyRoleAssignments())
const roleUnidadDraft = ref<string[]>([])
const savingRoles = ref(false)

const query = computed(() => ({
  plantel: selectedPlantel.value,
  search: search.value,
  scope: selectedScope.value,
  limit: limit.value
}))

const activeScopeLabel = computed(() => scopeOptions.find((option) => option.value === selectedScope.value)?.label || 'Todos')
const selectedGestionEscolarActive = computed(() => Boolean(selectedUser.value?.adminScopes.includes('gestionEscolar') || roleDraft.value.gestionEscolarAdmin))
const selectedRoleCount = computed(() => assignableRoles.filter((role) => roleDraft.value[role.key]).length + (selectedGestionEscolarActive.value ? 1 : 0))
const nextActionTitle = computed(() => {
  if (!selectedUser.value) return 'Selecciona una persona'
  if (selectedUser.value.audience === 'internal' && !selectedGestionEscolarActive.value) return 'Define si será Admin Escolar o Daycare'
  if (primaryAccessState(selectedUser.value).state === 'incomplete') return 'Completa el alcance antes de entregar acceso'
  if (selectedUser.value.canImpersonate) return 'Soporte disponible con confirmación'
  return 'Revisa responsabilidades y alcance'
})
const roleUnidadOptions = computed(() => {
  const values = [
    ...(directory.value?.unidades || []),
    ...(directory.value?.planteles || []),
    ...(selectedUser.value?.unidad || [])
  ]
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'))
})
const roleHasChanges = computed(() => {
  const current = selectedUser.value?.roleAssignments || emptyRoleAssignments()
  const roleChanged = assignableRoles.some((role) => Boolean(roleDraft.value[role.key]) !== Boolean(current[role.key]))
  const currentUnits = normalizedRoleUnits(selectedUser.value?.unidad || [])
  const draftUnits = normalizedRoleUnits(roleUnidadDraft.value)
  const unitsChanged = roleDraft.value.daycareAdmin && currentUnits.join('|') !== draftUnits.join('|')
  return roleChanged || unitsChanged
})

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
  if (directoryTimedOut.value) return 'La consulta excedió el tiempo de espera. Reintenta para abrir una conexión nueva.'
  const error = loadError.value as { data?: { statusMessage?: string }; statusMessage?: string; message?: string } | null
  return error?.data?.statusMessage || error?.statusMessage || error?.message || 'La consulta falló antes de entregar contenido.'
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

watch(selectedUser, (user) => {
  syncRoleDraft(user)
})

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

function normalizedRoleUnits(values: string[]) {
  return Array.from(new Set(values.map((value) => String(value || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'))
}

function syncRoleDraft(user: SuperAdminUserSummary | null) {
  roleDraft.value = user?.roleAssignments ? { ...user.roleAssignments } : emptyRoleAssignments()
  roleUnidadDraft.value = normalizedRoleUnits(user?.unidad || [])
}

function resetRoleDraft() {
  syncRoleDraft(selectedUser.value)
  actionError.value = ''
  actionNotice.value = ''
}

function toggleRoleUnidad(unidad: string) {
  const normalized = String(unidad || '').trim()
  if (!normalized) return
  const set = new Set(roleUnidadDraft.value)
  if (set.has(normalized)) set.delete(normalized)
  else set.add(normalized)
  roleUnidadDraft.value = normalizedRoleUnits(Array.from(set))
}

async function saveAdminRoles() {
  if (!selectedUser.value) return
  if (roleDraft.value.daycareAdmin && !roleUnidadDraft.value.length) {
    actionError.value = 'Selecciona al menos una unidad para Daycare Admin.'
    return
  }

  savingRoles.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    const updated = await $fetch<SuperAdminUserSummary>(`/api/admin/superadmin/users/${selectedUser.value.id}/roles`, {
      method: 'POST',
      body: { roles: roleDraft.value, unidades: roleUnidadDraft.value }
    })

    selectedUser.value = updated
    if (directory.value?.users?.length) {
      directory.value.users = directory.value.users.map((user) => user.id === updated.id ? updated : user)
      directory.value.metrics.internalUsers = directory.value.users.filter((user) => user.audience === 'internal' || user.adminScopes.length).length
      directory.value.metrics.daycareAdmins = directory.value.users.filter((user) => user.adminScopes.includes('daycare')).length
    }
    actionNotice.value = 'Responsabilidades actualizadas.'
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible guardar las responsabilidades.'
  } finally {
    savingRoles.value = false
  }
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
  if (scope === 'daycare') return 'Familia daycare'
  if (scope === 'personasAutorizadas') return 'Familia escolar'
  return scope
}

function audienceLabel(user: SuperAdminUserSummary) {
  if (user.audience === 'multiProductFamily') return 'Familia multiproducto'
  if (user.audience === 'daycareFamily') return 'Familia daycare'
  if (user.audience === 'schoolFamily') return 'Familia escolar'
  if (user.audience === 'internal') return 'Cuenta institucional'
  return 'Sin clasificar'
}

function primaryScopeLabel(user: SuperAdminUserSummary) {
  const values = [...user.plantel, ...user.unidad].filter(Boolean)
  if (values.length) return labelList(values, 'Pendiente')
  if (user.campus || user.empresa) return user.campus || user.empresa || 'Pendiente'
  if (user.productScopes.length) return user.productScopes.map(productScopeLabel).join(' · ')
  return 'Alcance pendiente'
}

function primaryAccessState(user: SuperAdminUserSummary) {
  if (user.adminScopes.includes('gestionEscolar') || user.adminScopes.includes('daycare') || user.adminScopes.includes('communications')) {
    const hasConcreteScope = user.adminScopes.includes('gestionEscolar') || user.unidad.length || user.communicationsScopes.length
    return hasConcreteScope ? { state: 'active', label: 'Admin activo' } : { state: 'incomplete', label: 'Admin incompleto' }
  }
  if (user.productScopes.length) return { state: 'family', label: 'Familia' }
  if (user.audience === 'internal') return { state: 'none', label: 'Sin admin' }
  return { state: 'unknown', label: 'Revisar' }
}

function impersonationButtonLabel(user: SuperAdminUserSummary) {
  if (!user.canImpersonate) return 'Vista no disponible'
  if (impersonatingId.value === user.id) return 'Abriendo...'
  if (confirmingImpersonationId.value === user.id) return 'Confirmar vista'
  return 'Vista familiar'
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
    actionNotice.value = `Confirma para entrar como ${displayName(user)}. La sesión quedará marcada como vista de soporte.`
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
    actionNotice.value = 'Abriendo vista familiar.'
    await navigateTo(defaultFamilyRoute(response.user))
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible abrir esta vista familiar.'
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
.superadmin-os {
  display: grid;
  gap: 14px;
}

.command-hero,
.lane-card,
.directory-control,
.people-panel,
.detail-panel,
.state-card {
  background: rgba(255, 255, 255, .96);
  border: 1px solid #dfe8d7;
  border-radius: 20px;
  box-shadow: var(--shadow-soft);
}

.command-hero {
  align-items: stretch;
  background: linear-gradient(135deg, #ffffff 0%, #f5f9f0 100%);
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) minmax(390px, .76fr);
  padding: clamp(16px, 2.2vw, 26px);
}

.hero-copy {
  align-content: center;
  display: grid;
  gap: 10px;
}

.hero-copy h1 {
  font-size: clamp(2rem, 3.8vw, 3.6rem);
  line-height: .98;
  margin-bottom: 0;
}

.hero-copy p {
  max-width: 640px;
}

.hero-actions,
.quick-actions,
.role-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-metrics {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.hero-metrics article {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  display: grid;
  gap: 4px;
  min-height: 82px;
  padding: 13px;
}

.hero-metrics .metric-primary {
  background: linear-gradient(135deg, var(--color-brand-900), #236188);
  border-color: transparent;
  color: #fff;
  grid-row: span 2;
}

.hero-metrics span,
.access-grid span,
.scope-panel dt {
  color: var(--color-muted);
  font-size: .7rem;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.metric-primary span,
.metric-primary strong,
.metric-primary small {
  color: #fff;
}

.hero-metrics strong {
  color: var(--color-ink);
  font-family: var(--font-title);
  font-size: 1.7rem;
  line-height: 1;
}

.metric-primary strong {
  font-size: clamp(3rem, 5vw, 4.5rem);
}

.lane-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.lane-card {
  align-items: start;
  color: inherit;
  display: grid;
  gap: 12px;
  grid-template-columns: 42px minmax(0, 1fr);
  min-height: 118px;
  padding: 14px;
}

.lane-card.primary {
  border-color: var(--color-brand-300);
}

.lane-card > span {
  align-items: center;
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 14px;
  color: var(--color-brand-900);
  display: inline-flex;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.lane-card strong,
.lane-card small {
  display: block;
}

.lane-card strong {
  color: var(--color-ink);
}

.lane-card small {
  color: var(--color-muted);
  line-height: 1.35;
  margin-top: 4px;
}

.directory-control {
  display: grid;
  gap: 12px;
  padding: 12px;
}

.scope-tabs {
  background: #f4f7f1;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 6px;
  scrollbar-width: none;
}

.scope-tab {
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  display: grid;
  flex: 1 0 142px;
  gap: 2px;
  min-height: 58px;
  padding: 8px 10px;
  text-align: left;
}

.scope-tab:hover,
.scope-tab.active {
  background: #fff;
  border-color: var(--color-brand-300);
}

.scope-tab span {
  color: var(--color-muted);
  font-size: .76rem;
  line-height: 1.25;
}

.filters-card {
  align-items: end;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(170px, .48fr) minmax(280px, 1fr) minmax(130px, .26fr);
}

.people-layout {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 440px);
}

.people-panel,
.detail-panel {
  display: grid;
  gap: 12px;
  padding: 14px;
}

.detail-panel {
  align-self: start;
  position: sticky;
  top: calc(var(--topbar-height) + 12px);
}

.section-head,
.detail-identity,
.next-action-panel {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.section-head h2,
.detail-identity h2,
.compact-headline h3 {
  margin-bottom: 0;
}

.people-list {
  display: grid;
  gap: 8px;
}

.person-row {
  align-items: center;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  color: inherit;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: 42px minmax(0, 1fr) minmax(150px, .34fr);
  padding: 10px;
  text-align: left;
  width: 100%;
}

.person-row:hover,
.person-row.selected {
  background: #fbfdf8;
  border-color: var(--color-brand-300);
}

.user-avatar {
  align-items: center;
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 14px;
  color: var(--color-brand-900);
  display: inline-flex;
  font-size: .78rem;
  font-weight: 800;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.user-avatar.large {
  border-radius: 18px;
  height: 58px;
  width: 58px;
}

.person-main,
.person-context,
.detail-identity div {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.person-main strong,
.person-main small,
.person-context small,
.detail-identity h2,
.detail-identity p {
  overflow-wrap: anywhere;
}

.person-main small,
.person-context small,
.muted,
.scope-panel dd,
.access-grid small {
  color: var(--color-muted);
  font-size: .8rem;
}

.person-context {
  justify-items: end;
  text-align: right;
}

.person-context b,
.state-pill,
.soft-pill,
.role-state {
  background: #f4f7f1;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-muted);
  font-size: .72rem;
  font-weight: 850;
  padding: 6px 9px;
  white-space: nowrap;
}

.person-context b[data-state='active'],
.state-pill[data-state='active'],
.role-state[data-active='true'] {
  background: #e7f8ef;
  border-color: #bfead0;
  color: #15803d;
}

.person-context b[data-state='incomplete'],
.state-pill[data-state='incomplete'] {
  background: #fff7df;
  border-color: #f1d58a;
  color: #9a6700;
}

.person-context b[data-state='family'] {
  background: #eef7fb;
  border-color: #cfe7fb;
  color: var(--color-blue);
}

.next-action-panel,
.scope-panel,
.role-console {
  background: #f8fbfc;
  border: 1px solid #e2e8ec;
  border-radius: 18px;
  display: grid;
  gap: 12px;
  padding: 12px;
}

.access-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.access-grid article {
  background: #fff;
  border: 1px solid #e2e8ec;
  border-radius: 16px;
  display: grid;
  gap: 4px;
  min-height: 104px;
  padding: 12px;
}

.access-grid article[data-active='true'] {
  border-color: var(--color-brand-300);
}

.access-grid strong {
  color: var(--color-ink);
}

.scope-panel dl {
  display: grid;
  gap: 10px;
  margin: 0;
}

.scope-panel dl div {
  border-top: 1px solid #e2e8ec;
  display: grid;
  gap: 2px;
  padding-top: 8px;
}

.scope-panel dd {
  margin: 0;
}

.role-grid {
  display: grid;
  gap: 8px;
}

.role-card {
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8ec;
  border-radius: 16px;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: 18px 12px minmax(0, 1fr);
  min-height: 58px;
  padding: 10px;
}

.role-card:hover,
.role-card.active {
  border-color: var(--color-brand-300);
  box-shadow: var(--shadow-line);
}

.role-card input {
  accent-color: var(--color-brand-700);
}

.role-dot {
  background: #dce9d5;
  border-radius: 999px;
  height: 10px;
  width: 10px;
}

.role-card.active .role-dot {
  background: linear-gradient(135deg, var(--color-brand-700), var(--color-blue));
  box-shadow: 0 0 0 4px rgba(75, 144, 53, .12);
}

.role-card strong,
.role-card small {
  display: block;
}

.role-card small {
  color: var(--color-muted);
  font-size: .74rem;
  line-height: 1.25;
}

.unit-picker {
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8ec;
  border-radius: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  padding: 10px;
}

.unit-picker > span {
  color: var(--color-muted);
  font-size: .72rem;
  font-weight: 850;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.unit-chip {
  background: #f8fafc;
  border: 1px solid #dbe5eb;
  border-radius: 999px;
  color: var(--color-ink);
  cursor: pointer;
  font-size: .76rem;
  font-weight: 800;
  min-height: 30px;
  padding: 0 10px;
}

.unit-chip.active {
  background: var(--color-brand-700);
  border-color: var(--color-brand-700);
  color: #fff;
}

.compact {
  min-height: 34px;
  padding-inline: 10px;
}

.notice {
  background: #f0f8e7;
  border: 1px solid var(--color-brand-200);
  border-radius: 14px;
  color: var(--color-brand-900);
  font-weight: 700;
  margin: 0;
  padding: 9px 11px;
}

.state-card {
  color: var(--color-muted);
  display: grid;
  gap: 10px;
  min-height: 260px;
  padding: 28px;
  place-items: center;
  text-align: center;
}

@media (max-width: 1180px) {
  .command-hero,
  .people-layout {
    grid-template-columns: 1fr;
  }

  .detail-panel {
    position: static;
  }

  .lane-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .filters-card,
  .person-row {
    grid-template-columns: 1fr;
  }

  .person-context {
    justify-items: start;
    text-align: left;
  }
}

@media (max-width: 680px) {
  .hero-metrics,
  .lane-grid,
  .access-grid {
    grid-template-columns: 1fr;
  }

  .section-head,
  .detail-identity,
  .next-action-panel {
    align-items: stretch;
    flex-direction: column;
  }

  .quick-actions,
  .role-actions {
    display: grid;
  }
}
</style>
