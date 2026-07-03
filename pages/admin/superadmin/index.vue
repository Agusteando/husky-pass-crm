<template>
  <section class="superadmin-console" data-product-area="superadmin" data-product-screen="directory">
    <header class="admin-page-head">
      <div>
        <p class="eyebrow">Super Admin</p>
        <h1>Personas</h1>
        <p>Busca una cuenta, entiende qué es y corrige su acceso sin revisar datos técnicos.</p>
      </div>
      <div class="head-actions">
        <NuxtLink class="btn btn-secondary" to="/admin/superadmin/gestion-escolar">Asignar Escolar Admin</NuxtLink>
        <button class="btn btn-primary" type="button" data-diagnostic-action="actualizar-directorio" :disabled="isLoadingVisible" @click="refreshDirectory">
          {{ isLoadingVisible ? 'Actualizando...' : 'Actualizar' }}
        </button>
      </div>
    </header>

    <p v-if="actionError" class="surface-message error">{{ actionError }}</p>
    <p v-if="actionNotice" class="surface-message">{{ actionNotice }}</p>

    <section v-if="loadProblem" class="state-panel" data-product-panel="superadmin-directory" data-state="error">
      <FamilyPersonasIcon name="security" />
      <h2>No fue posible cargar personas</h2>
      <p>{{ loadProblemMessage }}</p>
      <button class="btn btn-secondary" type="button" data-diagnostic-action="reintentar-directorio" @click="refreshDirectory">Reintentar</button>
    </section>

    <section v-else class="people-workspace" data-product-panel="superadmin-directory" :data-state="directory?.users?.length ? 'content' : 'empty'">
      <aside class="directory-pane">
        <form class="directory-search" role="search" @submit.prevent="refreshDirectory">
          <FamilyPersonasIcon name="search" />
          <input v-model="search" type="search" placeholder="Nombre, correo, matrícula o sala" data-diagnostic-filter="buscar-usuario" />
          <button class="search-submit" type="submit" :disabled="isLoadingVisible">Buscar</button>
        </form>

        <div class="filter-row" aria-label="Filtros de personas">
          <label>
            <span>Tipo</span>
            <select v-model="selectedScope" data-diagnostic-filter="tipo-persona">
              <option v-for="option in scopeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </label>
          <label>
            <span>Plantel o unidad</span>
            <select v-model="selectedPlantel" data-diagnostic-filter="plantel">
              <option value="">Todos</option>
              <option v-for="plantel in directory?.planteles || []" :key="plantel" :value="plantel">{{ plantel }}</option>
            </select>
          </label>
        </div>

        <div class="directory-summary">
          <span>{{ directory?.users.length || 0 }} personas</span>
          <strong>{{ directory?.metrics.internalUsers || 0 }} administradores</strong>
        </div>

        <div v-if="isLoadingVisible" class="state-panel compact" data-product-loading>
          <HuskyPassLoader label="Personas" compact />
        </div>

        <div v-else-if="directory?.users?.length" class="people-list" role="list">
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
            <span class="avatar">{{ initials(user) }}</span>
            <span class="person-copy">
              <strong>{{ displayName(user) }}</strong>
              <small>{{ accountLabel(user) }}</small>
            </span>
            <span class="row-meta">
              <b :data-state="primaryAccessState(user).state">{{ primaryAccessState(user).label }}</b>
              <small>{{ audienceLabel(user) }}</small>
            </span>
          </button>
        </div>

        <div v-else class="state-panel compact" data-state="empty">
          <FamilyPersonasIcon name="people" />
          <h2>Sin resultados</h2>
          <p>Ajusta la búsqueda o cambia el filtro.</p>
        </div>
      </aside>

      <section class="person-pane">
        <template v-if="clientReady && selectedUser">
          <header class="identity-panel">
            <span class="avatar large">{{ initials(selectedUser) }}</span>
            <div>
              <p class="eyebrow">{{ audienceLabel(selectedUser) }}</p>
              <h2>{{ displayName(selectedUser) }}</h2>
              <p>{{ accountLabel(selectedUser) }}</p>
            </div>
            <span class="status-badge" :data-state="primaryAccessState(selectedUser).state">{{ primaryAccessState(selectedUser).label }}</span>
          </header>

          <section class="next-panel" :data-state="primaryAccessState(selectedUser).state">
            <div>
              <p class="eyebrow">Siguiente acción</p>
              <h3>{{ nextActionTitle }}</h3>
              <p>{{ nextActionDetail }}</p>
            </div>
            <NuxtLink
              v-if="showEscolarAction"
              class="btn btn-primary"
              :to="{ path: '/admin/superadmin/gestion-escolar', query: { usuario: selectedUser.id, buscar: selectedUser.email || selectedUser.username || String(selectedUser.id) } }"
            >
              Editar acceso escolar
            </NuxtLink>
            <button
              v-else-if="selectedUser.canImpersonate"
              class="btn btn-primary"
              type="button"
              data-diagnostic-action="impersonar-usuario"
              :disabled="impersonatingId === selectedUser.id"
              @click="requestImpersonation(selectedUser)"
            >
              {{ impersonationButtonLabel(selectedUser) }}
            </button>
          </section>

          <section class="facts-grid" aria-label="Resumen de persona">
            <article>
              <span>Cuenta</span>
              <strong>{{ selectedUser.email ? 'Correo' : selectedUser.username ? 'Matrícula' : 'ID' }}</strong>
              <small>{{ accountLabel(selectedUser) }}</small>
            </article>
            <article>
              <span>Persona</span>
              <strong>{{ audienceLabel(selectedUser) }}</strong>
              <small>{{ personKindDetail(selectedUser) }}</small>
            </article>
            <article>
              <span>Contexto</span>
              <strong>{{ primaryScopeLabel(selectedUser) }}</strong>
              <small>{{ selectedUser.sala ? `Sala ${selectedUser.sala}` : contextFallback(selectedUser) }}</small>
            </article>
            <article>
              <span>Acceso admin</span>
              <strong>{{ adminAccessLabel(selectedUser) }}</strong>
              <small>{{ adminAccessDetail(selectedUser) }}</small>
            </article>
          </section>

          <section class="access-section">
            <div class="section-title">
              <div>
                <p class="eyebrow">Acceso</p>
                <h3>Qué puede hacer esta persona</h3>
              </div>
              <span>{{ accessSummary }}</span>
            </div>

            <div class="access-list">
              <article>
                <div>
                  <strong>Familia escolar</strong>
                  <small>{{ selectedUser.productScopes.includes('personasAutorizadas') ? 'Puede entrar a Personas Autorizadas.' : 'No tiene experiencia familiar escolar.' }}</small>
                </div>
                <b :data-state="selectedUser.productScopes.includes('personasAutorizadas') ? 'active' : 'none'">{{ selectedUser.productScopes.includes('personasAutorizadas') ? 'Activo' : 'Sin acceso' }}</b>
              </article>
              <article>
                <div>
                  <strong>Familia guardería</strong>
                  <small>{{ selectedUser.productScopes.includes('daycare') ? daycareFamilyDetail(selectedUser) : 'No tiene experiencia familiar de guardería.' }}</small>
                </div>
                <b :data-state="selectedUser.productScopes.includes('daycare') ? 'active' : 'none'">{{ selectedUser.productScopes.includes('daycare') ? 'Activo' : 'Sin acceso' }}</b>
              </article>
              <article>
                <div>
                  <strong>Admin Escolar</strong>
                  <small>{{ selectedGestionEscolarActive ? 'Responsabilidad escolar asignada.' : 'Se asigna por plantel, grado o grupo.' }}</small>
                </div>
                <NuxtLink class="inline-action" :to="{ path: '/admin/superadmin/gestion-escolar', query: { usuario: selectedUser.id, buscar: selectedUser.email || selectedUser.username || String(selectedUser.id) } }">
                  {{ selectedGestionEscolarActive ? 'Editar' : 'Asignar' }}
                </NuxtLink>
              </article>
              <article>
                <div>
                  <strong>Admin Guardería</strong>
                  <small>{{ roleDraft.daycareAdmin ? guarderiaAdminDetail : 'Puede gestionar unidades y salas asignadas.' }}</small>
                </div>
                <b :data-state="roleDraft.daycareAdmin ? (roleUnidadDraft.length ? 'active' : 'incomplete') : 'none'">{{ roleDraft.daycareAdmin ? (roleUnidadDraft.length ? 'Activo' : 'Incompleto') : 'Sin acceso' }}</b>
              </article>
            </div>
          </section>

          <section class="assignment-section">
            <div class="section-title">
              <div>
                <p class="eyebrow">Asignar Guardería Admin</p>
                <h3>Unidad y responsabilidad</h3>
              </div>
              <span :data-state="roleDraft.daycareAdmin ? (roleUnidadDraft.length ? 'active' : 'incomplete') : 'none'">
                {{ roleDraft.daycareAdmin ? (roleUnidadDraft.length ? 'Listo' : 'Falta unidad') : 'Sin acceso' }}
              </span>
            </div>

            <template v-if="selectedUser.canManageAdminRoles">
              <label class="switch-row">
                <input v-model="roleDraft.daycareAdmin" type="checkbox" />
                <span>
                  <strong>Será Admin Guardería</strong>
                  <small>Verá salas, familias, tareas, avisos y calendario de las unidades elegidas.</small>
                </span>
              </label>

              <div v-if="roleDraft.daycareAdmin" class="unit-grid" aria-label="Unidades de guardería">
                <button
                  v-for="unidad in roleUnidadOptions"
                  :key="unidad"
                  class="unit-option"
                  :class="{ active: roleUnidadDraft.includes(unidad) }"
                  type="button"
                  @click="toggleRoleUnidad(unidad)"
                >
                  {{ unidad }}
                </button>
                <p v-if="!roleUnidadOptions.length">No hay unidades disponibles para asignar.</p>
              </div>

              <details class="secondary-access">
                <summary>Accesos sensibles</summary>
                <label>
                  <input v-model="roleDraft.accessHistoryAdmin" type="checkbox" />
                  <span>Historial y validaciones</span>
                </label>
                <label>
                  <input v-model="roleDraft.communicationsAdmin" type="checkbox" />
                  <span>Comunicados generales</span>
                </label>
              </details>

              <div class="role-actions">
                <button class="btn btn-secondary" type="button" :disabled="savingRoles || !roleHasChanges" @click="resetRoleDraft">Restaurar</button>
                <button class="btn btn-primary" type="button" :disabled="savingRoles || !roleHasChanges" @click="saveAdminRoles">{{ savingRoles ? 'Guardando...' : 'Guardar acceso' }}</button>
              </div>
            </template>

            <p v-else class="muted">Solo cuentas institucionales o internas pueden recibir acceso administrativo.</p>
          </section>

          <section v-if="selectedUser.canImpersonate" class="support-section">
            <div>
              <p class="eyebrow">Soporte</p>
              <h3>Vista familiar controlada</h3>
              <p>Úsala solo cuando necesites revisar lo que ve la familia.</p>
            </div>
            <div class="support-actions">
              <button class="btn btn-secondary" type="button" :disabled="impersonatingId === selectedUser.id" @click="requestImpersonation(selectedUser)">
                {{ impersonationButtonLabel(selectedUser) }}
              </button>
              <button v-if="confirmingImpersonationId === selectedUser.id" class="btn btn-secondary" type="button" @click="cancelImpersonation">Cancelar</button>
            </div>
          </section>
        </template>

        <div v-else class="state-panel detail-empty" data-state="empty">
          <FamilyPersonasIcon name="people" />
          <h2>Selecciona una persona</h2>
          <p>Verás cuenta, tipo, contexto, acceso y la siguiente acción válida.</p>
        </div>
      </section>
    </section>
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

const scopeOptions: Array<{ value: SuperAdminDirectoryScope; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'internal', label: 'Administradores' },
  { value: 'schoolFamilies', label: 'Familias escolares' },
  { value: 'daycare', label: 'Familias guardería' },
  { value: 'impersonable', label: 'Soporte' }
]

const assignableRoles: Array<{ key: SuperAdminAssignableRole }> = [
  { key: 'daycareAdmin' },
  { key: 'communicationsAdmin' },
  { key: 'accessHistoryAdmin' }
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
const limit = ref(120)
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

const selectedGestionEscolarActive = computed(() => Boolean(selectedUser.value?.adminScopes.includes('gestionEscolar') || roleDraft.value.gestionEscolarAdmin))
const roleUnidadOptions = computed(() => {
  const values = [
    ...(directory.value?.unidades || []),
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
const showEscolarAction = computed(() => Boolean(selectedUser.value && (selectedUser.value.audience === 'internal' || selectedGestionEscolarActive.value)))
const accessSummary = computed(() => {
  if (!selectedUser.value) return 'Sin persona'
  const count = [
    selectedUser.value.productScopes.includes('personasAutorizadas'),
    selectedUser.value.productScopes.includes('daycare'),
    selectedGestionEscolarActive.value,
    roleDraft.value.daycareAdmin
  ].filter(Boolean).length
  return count ? `${count} accesos` : 'Sin acceso'
})
const guarderiaAdminDetail = computed(() => roleUnidadDraft.value.length ? roleUnidadDraft.value.join(' · ') : 'Selecciona al menos una unidad.')
const nextActionTitle = computed(() => {
  if (!selectedUser.value) return 'Selecciona una persona'
  if (selectedUser.value.audience === 'internal' && !selectedGestionEscolarActive.value && !roleDraft.value.daycareAdmin) return 'Define si será Admin Escolar o Guardería'
  if (primaryAccessState(selectedUser.value).state === 'incomplete') return 'Completa el alcance antes de entregar acceso'
  if (selectedUser.value.canImpersonate) return 'Soporte disponible con confirmación'
  return 'Revisa responsabilidades y contexto'
})
const nextActionDetail = computed(() => {
  if (!selectedUser.value) return ''
  if (showEscolarAction.value) return 'Asigna plantel, grado o grupo desde el flujo guiado de Escolar.'
  if (selectedUser.value.canImpersonate) return 'Puedes abrir su vista familiar con confirmación.'
  return 'No hay una acción sensible disponible para esta cuenta.'
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
  if (directoryTimedOut.value) return 'La consulta tardó demasiado. Reintenta para abrir una conexión nueva.'
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

watch([selectedPlantel, selectedScope, search], () => {
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
    actionError.value = 'Selecciona al menos una unidad para Admin Guardería.'
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
    actionNotice.value = 'Acceso actualizado.'
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible guardar el acceso.'
  } finally {
    savingRoles.value = false
  }
}

function syncQuery(selectedId: number | null = selectedUser.value?.id || null) {
  const nextQuery: Record<string, string> = {}
  if (selectedPlantel.value) nextQuery.plantel = selectedPlantel.value
  if (selectedScope.value !== 'all') nextQuery.scope = selectedScope.value
  if (search.value.trim()) nextQuery.buscar = search.value.trim()
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

function accountLabel(user: SuperAdminUserSummary) {
  return user.email || loginLabel(user.username) || `ID ${user.id}`
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
  if (scope === 'personasAutorizadas') return 'Familia escolar'
  return scope
}

function audienceLabel(user: SuperAdminUserSummary) {
  if (user.audience === 'multiProductFamily') return 'Familia escolar y guardería'
  if (user.audience === 'daycareFamily') return 'Familia guardería'
  if (user.audience === 'schoolFamily') return 'Familia escolar'
  if (user.audience === 'internal') return 'Administrador'
  return 'Sin clasificar'
}

function personKindDetail(user: SuperAdminUserSummary) {
  if (user.productScopes.length) return user.productScopes.map(productScopeLabel).join(' · ')
  if (user.adminScopes.length) return adminAccessLabel(user)
  return 'Cuenta sin experiencia asignada'
}

function contextFallback(user: SuperAdminUserSummary) {
  if (user.campus) return user.campus
  if (user.empresa) return user.empresa
  return 'Sin sala'
}

function primaryScopeLabel(user: SuperAdminUserSummary) {
  const values = [...user.plantel, ...user.unidad].filter(Boolean)
  if (values.length) return labelList(values, 'Pendiente')
  if (user.campus || user.empresa) return user.campus || user.empresa || 'Pendiente'
  if (user.productScopes.length) return user.productScopes.map(productScopeLabel).join(' · ')
  return 'Pendiente'
}

function adminAccessLabel(user: SuperAdminUserSummary) {
  const labels: string[] = []
  if (selectedGestionEscolarActive.value) labels.push('Escolar')
  if (roleDraft.value.daycareAdmin || user.adminScopes.includes('daycare')) labels.push('Guardería')
  if (roleDraft.value.accessHistoryAdmin || user.adminScopes.includes('accessHistory')) labels.push('Seguridad')
  if (roleDraft.value.communicationsAdmin || user.adminScopes.includes('communications')) labels.push('Comunicados')
  return labels.length ? labels.join(' · ') : 'Sin admin'
}

function adminAccessDetail(user: SuperAdminUserSummary) {
  if (adminAccessLabel(user) === 'Sin admin') return user.audience === 'internal' ? 'Puede recibir una responsabilidad.' : 'No es cuenta administrativa.'
  return 'Responsabilidades activas'
}

function daycareFamilyDetail(user: SuperAdminUserSummary) {
  return user.sala ? `${primaryScopeLabel(user)} · Sala ${user.sala}` : primaryScopeLabel(user)
}

function primaryAccessState(user: SuperAdminUserSummary) {
  if (user.adminScopes.includes('gestionEscolar') || user.adminScopes.includes('daycare') || user.adminScopes.includes('communications') || user.adminScopes.includes('accessHistory')) {
    const hasConcreteScope = user.adminScopes.includes('gestionEscolar') || user.unidad.length || user.communicationsScopes.length || user.adminScopes.includes('accessHistory')
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
    actionNotice.value = `Confirma para entrar como ${displayName(user)}.`
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
</script>

<style scoped>
.superadmin-console {
  display: grid;
  gap: 16px;
}

.admin-page-head,
.directory-pane,
.person-pane,
.state-panel {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #dce5eb;
  border-radius: 16px;
  box-shadow: 0 12px 34px rgba(15, 23, 42, 0.06);
}

.admin-page-head {
  align-items: end;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: clamp(18px, 2.2vw, 28px);
}

.admin-page-head h1,
.identity-panel h2,
.section-title h3,
.next-panel h3,
.state-panel h2 {
  color: #152032;
  margin: 0;
}

.admin-page-head h1 {
  font-family: var(--font-body);
  font-size: clamp(2rem, 3vw, 3.1rem);
  letter-spacing: 0;
}

.admin-page-head p:not(.eyebrow),
.identity-panel p,
.next-panel p,
.muted {
  color: #667789;
  margin: 0;
}

.head-actions,
.role-actions,
.support-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.people-workspace {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(330px, 430px) minmax(0, 1fr);
}

.directory-pane,
.person-pane {
  align-content: start;
  display: grid;
  gap: 12px;
  padding: 14px;
}

.directory-pane {
  align-self: start;
  position: sticky;
  top: calc(var(--topbar-height) + 18px);
}

.directory-search {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #dce5eb;
  border-radius: 13px;
  display: grid;
  gap: 9px;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  min-height: 48px;
  padding: 6px 8px 6px 12px;
}

.directory-search input,
.filter-row select {
  background: transparent;
  border: 0;
  color: #152032;
  min-width: 0;
  outline: 0;
}

.search-submit,
.inline-action {
  background: #ffffff;
  border: 1px solid #cfe0e7;
  border-radius: 10px;
  color: #0d766d;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 800;
  min-height: 34px;
  padding: 0 11px;
}

.filter-row {
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 1fr;
}

.filter-row label {
  background: #fbfcfd;
  border: 1px solid #dce5eb;
  border-radius: 12px;
  display: grid;
  gap: 4px;
  padding: 8px 10px;
}

.filter-row span,
.facts-grid span,
.directory-summary span,
.section-title span,
.row-meta small {
  color: #6b7a8b;
  font-size: 0.72rem;
  font-weight: 800;
}

.directory-summary {
  align-items: center;
  color: #152032;
  display: flex;
  justify-content: space-between;
}

.directory-summary strong {
  color: #0d766d;
  font-size: 0.82rem;
}

.people-list {
  display: grid;
  gap: 6px;
  max-height: calc(100vh - 305px);
  overflow: auto;
  padding-right: 2px;
}

.person-row {
  align-items: center;
  background: #ffffff;
  border: 1px solid transparent;
  border-radius: 13px;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: 42px minmax(0, 1fr) minmax(92px, auto);
  padding: 9px;
  text-align: left;
}

.person-row:hover,
.person-row.selected {
  background: #f4faf8;
  border-color: #cae2dc;
}

.avatar {
  align-items: center;
  background: #eef7f5;
  border: 1px solid #cae2dc;
  border-radius: 12px;
  color: #0d766d;
  display: inline-flex;
  font-size: 0.82rem;
  font-weight: 900;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.avatar.large {
  border-radius: 16px;
  font-size: 1.08rem;
  height: 58px;
  width: 58px;
}

.person-copy,
.row-meta {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.person-copy strong,
.person-copy small,
.row-meta b,
.row-meta small,
.facts-grid strong,
.facts-grid small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.person-copy strong {
  color: #152032;
  font-size: 0.9rem;
}

.person-copy small,
.facts-grid small,
.access-list small,
.switch-row small,
.support-section p {
  color: #667789;
  font-size: 0.78rem;
  line-height: 1.45;
}

.row-meta {
  justify-items: end;
}

.row-meta b,
.status-badge,
.access-list b,
.assignment-section .section-title > span {
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 850;
  padding: 6px 9px;
}

[data-state='active'] {
  background: #e7f8ef;
  border: 1px solid #bfead0;
  color: #15803d;
}

[data-state='family'] {
  background: #eef7fb;
  border: 1px solid #cfe7fb;
  color: #236188;
}

[data-state='incomplete'],
[data-state='unknown'] {
  background: #fff6df;
  border: 1px solid #f3d589;
  color: #8a650c;
}

[data-state='none'] {
  background: #f4f6f8;
  border: 1px solid #dce5eb;
  color: #64748b;
}

.identity-panel {
  align-items: center;
  border-bottom: 1px solid #e4ebf0;
  display: grid;
  gap: 14px;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  padding-bottom: 14px;
}

.identity-panel h2 {
  font-family: var(--font-body);
  font-size: clamp(1.45rem, 2.1vw, 2rem);
}

.next-panel {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #dce5eb;
  border-radius: 15px;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 14px;
}

.facts-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.facts-grid article {
  background: #fbfcfd;
  border: 1px solid #e1e8ed;
  border-radius: 13px;
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 12px;
}

.facts-grid strong {
  color: #152032;
  font-size: 0.96rem;
}

.access-section,
.assignment-section,
.support-section {
  border: 1px solid #e1e8ed;
  border-radius: 15px;
  display: grid;
  gap: 12px;
  padding: 14px;
}

.section-title {
  align-items: center;
  display: flex;
  gap: 14px;
  justify-content: space-between;
}

.section-title h3,
.next-panel h3,
.support-section h3 {
  font-family: var(--font-body);
  font-size: 1.08rem;
}

.access-list {
  display: grid;
  gap: 8px;
}

.access-list article {
  align-items: center;
  background: #ffffff;
  border: 1px solid #e1e8ed;
  border-radius: 13px;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 12px;
}

.access-list strong,
.switch-row strong {
  color: #152032;
  display: block;
}

.switch-row {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #dce5eb;
  border-radius: 14px;
  cursor: pointer;
  display: grid;
  gap: 12px;
  grid-template-columns: auto minmax(0, 1fr);
  padding: 12px;
}

.switch-row input,
.secondary-access input {
  accent-color: #0d766d;
}

.unit-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.unit-option {
  background: #ffffff;
  border: 1px solid #dce5eb;
  border-radius: 999px;
  color: #526173;
  cursor: pointer;
  font-weight: 850;
  min-height: 36px;
  padding: 0 12px;
}

.unit-option.active {
  background: #e7f8ef;
  border-color: #bfead0;
  color: #15803d;
}

.secondary-access {
  border-top: 1px solid #e1e8ed;
  padding-top: 10px;
}

.secondary-access summary {
  color: #526173;
  cursor: pointer;
  font-size: 0.84rem;
  font-weight: 850;
}

.secondary-access label {
  align-items: center;
  color: #152032;
  display: inline-flex;
  gap: 8px;
  margin: 10px 14px 0 0;
}

.support-section {
  align-items: center;
  grid-template-columns: minmax(0, 1fr) auto;
}

.surface-message {
  background: #edfdf7;
  border: 1px solid #b7ead6;
  border-radius: 12px;
  color: #047857;
  margin: 0;
  padding: 10px 12px;
}

.surface-message.error {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #be123c;
}

.state-panel {
  color: #667789;
  display: grid;
  gap: 9px;
  min-height: 280px;
  place-items: center;
  padding: 24px;
  text-align: center;
}

.state-panel.compact {
  min-height: 180px;
}

.detail-empty {
  min-height: 520px;
}

@media (max-width: 1180px) {
  .people-workspace,
  .facts-grid {
    grid-template-columns: 1fr;
  }

  .directory-pane {
    position: static;
  }

  .people-list {
    max-height: none;
  }
}

@media (max-width: 760px) {
  .admin-page-head,
  .head-actions,
  .section-title,
  .support-section {
    align-items: stretch;
    flex-direction: column;
  }

  .head-actions,
  .role-actions,
  .support-actions {
    display: grid;
    justify-content: stretch;
  }

  .filter-row,
  .identity-panel,
  .next-panel,
  .person-row,
  .access-list article,
  .support-section {
    grid-template-columns: 1fr;
  }

  .row-meta {
    justify-items: start;
  }
}
</style>
