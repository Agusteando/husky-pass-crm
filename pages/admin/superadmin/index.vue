<template>
  <section class="access-console" data-product-area="superadmin" data-product-screen="access-management">
    <header class="access-header">
      <div>
        <p class="eyebrow">Super Admin</p>
        <h1>Cuentas y acceso</h1>
      </div>
      <div class="header-actions">
        <NuxtLink class="btn btn-secondary" to="/admin/superadmin/gestion-escolar">Alcance escolar</NuxtLink>
        <NuxtLink class="btn btn-secondary" to="/admin/historial-accesos">Historial</NuxtLink>
        <button class="btn btn-primary" type="button" data-diagnostic-action="actualizar-directorio" :disabled="isLoadingVisible" @click="refreshDirectory">
          {{ isLoadingVisible ? 'Actualizando...' : 'Actualizar' }}
        </button>
      </div>
    </header>

    <p v-if="actionError" class="surface-message error">{{ actionError }}</p>
    <p v-if="actionNotice" class="surface-message">{{ actionNotice }}</p>

    <section v-if="loadProblem" class="state-panel" data-product-panel="superadmin-directory" data-state="error">
      <FamilyPersonasIcon name="security" />
      <h2>No fue posible cargar el directorio</h2>
      <p>{{ loadProblemMessage }}</p>
      <button class="btn btn-secondary" type="button" data-diagnostic-action="reintentar-directorio" @click="refreshDirectory">Reintentar</button>
    </section>

    <section v-else class="access-board" data-product-panel="superadmin-directory" :data-state="directory?.users?.length ? 'content' : 'empty'">
      <aside class="directory-panel" aria-label="Directorio de cuentas">
        <div class="directory-head">
          <div>
            <span>Directorio</span>
            <strong>{{ directory?.users.length || 0 }} cuentas</strong>
          </div>
          <small>{{ directoryAdminCount }} admin</small>
        </div>

        <form class="searchbar" role="search" @submit.prevent="refreshDirectory">
          <FamilyPersonasIcon name="search" />
          <input v-model="search" type="search" placeholder="Nombre, correo, matrícula, estudiante o sala" data-diagnostic-filter="buscar-usuario" />
          <button type="submit" :disabled="isLoadingVisible">Buscar</button>
        </form>

        <div class="filters" aria-label="Filtros de cuentas">
          <label>
            <span>Tipo</span>
            <select v-model="selectedScope" data-diagnostic-filter="tipo-persona">
              <option v-for="option in scopeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </label>
          <label>
            <span>Unidad</span>
            <select v-model="selectedPlantel" data-diagnostic-filter="plantel">
              <option value="">Todas</option>
              <option v-for="plantel in directory?.planteles || []" :key="plantel" :value="plantel">{{ plantel }}</option>
            </select>
          </label>
        </div>

        <div class="metric-strip" aria-label="Resumen del directorio filtrado">
          <span v-for="metric in directoryMetrics" :key="metric.label">
            <strong>{{ metric.value }}</strong>
            <small>{{ metric.label }}</small>
          </span>
        </div>

        <div v-if="isLoadingVisible" class="state-panel compact" data-product-loading>
          <HuskyPassLoader label="Cuentas" compact />
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
            <span class="person-meta">
              <b :data-state="primaryAccessState(user).state">{{ primaryAccessState(user).label }}</b>
              <small>{{ rowScopeLabel(user) }}</small>
            </span>
          </button>
        </div>

        <div v-else class="state-panel compact" data-state="empty">
          <FamilyPersonasIcon name="people" />
          <h2>Sin resultados</h2>
          <p>Cambia la búsqueda o reduce los filtros.</p>
        </div>
      </aside>

      <main class="account-panel">
        <template v-if="clientReady && selectedUser">
          <section class="profile-card" :data-state="primaryAccessState(selectedUser).state">
            <span class="avatar hero">{{ initials(selectedUser) }}</span>
            <div class="profile-copy">
              <p>{{ accountTypeLabel(selectedUser) }}</p>
              <h2>{{ displayName(selectedUser) }}</h2>
              <small>{{ accountLabel(selectedUser) }} · ID {{ selectedUser.id }}</small>
            </div>
            <div class="profile-badges">
              <span v-for="signal in selectedSignals" :key="signal.key" :data-state="signal.state">{{ signal.label }}</span>
            </div>
          </section>

          <section v-if="reviewFlags.length" class="review-strip" aria-label="Puntos de revisión">
            <article v-for="flag in reviewFlags" :key="flag.key" :data-state="flag.state">
              <span>{{ flag.label }}</span>
              <strong>{{ flag.value }}</strong>
            </article>
          </section>

          <section class="ledger-section">
            <header class="section-head">
              <h2>Vínculos</h2>
              <span>{{ relationshipSummary(selectedUser) }}</span>
            </header>
            <div class="ledger">
              <article v-for="item in relationshipRows" :key="item.key" class="ledger-row" :data-state="item.state">
                <i aria-hidden="true" />
                <div>
                  <strong>{{ item.title }}</strong>
                  <small>{{ item.detail }}</small>
                </div>
                <b>{{ item.label }}</b>
              </article>
            </div>
          </section>

          <section class="matrix-section">
            <header class="section-head">
              <h2>Acceso actual</h2>
              <span>{{ currentAccessSummary }}</span>
            </header>
            <div class="access-table" role="table" aria-label="Acceso efectivo actual">
              <div class="table-row table-head" role="row">
                <span role="columnheader">Área</span>
                <span role="columnheader">Alcance</span>
                <span role="columnheader">Origen</span>
                <span role="columnheader">Estado</span>
              </div>
              <div v-for="row in accessRows" :key="row.key" class="table-row" role="row" :data-state="row.state">
                <span role="cell">
                  <strong>{{ row.area }}</strong>
                  <small>{{ row.caption }}</small>
                </span>
                <span role="cell">{{ row.scope }}</span>
                <span role="cell">{{ row.source }}</span>
                <span role="cell"><b>{{ row.status }}</b></span>
              </div>
            </div>
          </section>

          <section v-if="selectedUser.canImpersonate" class="support-row">
            <div>
              <strong>Vista familiar</strong>
              <small>Solo soporte; no cambia roles.</small>
            </div>
            <div>
              <button class="btn btn-secondary" type="button" :disabled="impersonatingId === selectedUser.id" @click="requestImpersonation(selectedUser)">
                {{ impersonationButtonLabel(selectedUser) }}
              </button>
              <button v-if="confirmingImpersonationId === selectedUser.id" class="btn btn-secondary" type="button" @click="cancelImpersonation">Cancelar</button>
            </div>
          </section>
        </template>

        <div v-else class="state-panel detail-empty" data-state="empty">
          <FamilyPersonasIcon name="people" />
          <h2>Selecciona una cuenta</h2>
          <p>Verás vínculos, acceso actual y cambios pendientes.</p>
        </div>
      </main>

      <aside class="roles-panel" aria-label="Roles administrativos">
        <template v-if="clientReady && selectedUser">
          <header class="roles-head">
            <div>
              <span>Roles</span>
              <strong>{{ adminAccessLabel(selectedUser) }}</strong>
            </div>
            <b :data-state="roleHasChanges ? 'incomplete' : 'none'">{{ roleHasChanges ? 'Pendiente' : 'Sin cambios' }}</b>
          </header>

          <section v-if="selectedUser.canManageAdminRoles" class="role-controls">
            <article class="school-scope" :data-state="selectedUser.adminScopes.includes('gestionEscolar') ? 'active' : 'none'">
              <div>
                <strong>Escolar</strong>
                <small>{{ selectedUser.adminScopes.includes('gestionEscolar') ? primaryScopeLabel(selectedUser) : 'Sin alcance' }}</small>
              </div>
              <NuxtLink
                class="inline-action"
                :to="{ path: '/admin/superadmin/gestion-escolar', query: { usuario: selectedUser.id, buscar: selectedUser.email || selectedUser.username || String(selectedUser.id) } }"
              >
                Editar
              </NuxtLink>
            </article>

            <label class="switch-row" :data-state="roleDraft.daycareAdmin ? (roleUnidadDraft.length ? 'active' : 'incomplete') : 'none'">
              <input v-model="roleDraft.daycareAdmin" type="checkbox" />
              <span class="switch" aria-hidden="true" />
              <span>
                <strong>Guardería</strong>
                <small>{{ roleUnidadDraft.length ? roleUnidadDraft.join(' · ') : 'Sin unidad' }}</small>
              </span>
            </label>

            <div v-if="roleDraft.daycareAdmin" class="scope-chips" aria-label="Unidades de guardería autorizadas">
              <button
                v-for="unidad in roleUnidadOptions"
                :key="unidad"
                class="scope-chip"
                :class="{ active: roleUnidadDraft.includes(unidad) }"
                type="button"
                @click="toggleRoleUnidad(unidad)"
              >
                {{ unidad }}
              </button>
              <p v-if="!roleUnidadOptions.length">Sin unidades disponibles.</p>
            </div>

            <label class="switch-row" :data-state="roleDraft.communicationsAdmin ? 'active' : 'none'">
              <input v-model="roleDraft.communicationsAdmin" type="checkbox" />
              <span class="switch" aria-hidden="true" />
              <span>
                <strong>Comunicados</strong>
                <small>Preparación administrativa</small>
              </span>
            </label>

            <label class="switch-row" :data-state="roleDraft.accessHistoryAdmin ? 'active' : 'none'">
              <input v-model="roleDraft.accessHistoryAdmin" type="checkbox" />
              <span class="switch" aria-hidden="true" />
              <span>
                <strong>Historial</strong>
                <small>Acceso y diagnósticos</small>
              </span>
            </label>
          </section>

          <p v-else class="locked-note">Cuenta no administrativa.</p>

          <section class="change-panel" :data-state="roleHasChanges ? (saveBlockedReason ? 'incomplete' : 'active') : 'none'">
            <header>
              <h2>Cambios</h2>
              <span>{{ saveBlockedReason || (roleHasChanges ? 'Listo' : 'Ninguno') }}</span>
            </header>
            <ul v-if="roleHasChanges">
              <li v-for="line in changePreviewLines" :key="line">{{ line }}</li>
            </ul>
            <p v-else>Sin cambios pendientes.</p>
            <label v-if="roleHasChanges" class="reason-field">
              <span>Motivo</span>
              <textarea v-model="roleChangeReason" rows="3" maxlength="500" placeholder="Solicitud o ticket interno" />
            </label>
            <div class="role-actions">
              <button class="btn btn-secondary" type="button" :disabled="savingRoles || !roleHasChanges" @click="resetRoleDraft">Descartar</button>
              <button class="btn btn-primary" type="button" :disabled="savingRoles || Boolean(saveBlockedReason)" @click="saveAdminRoles">
                {{ savingRoles ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </section>
        </template>

        <div v-else class="state-panel compact" data-state="empty">
          <h2>Roles</h2>
          <p>Selecciona una cuenta.</p>
        </div>
      </aside>
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

type AccessState = 'active' | 'family' | 'incomplete' | 'none' | 'unknown'

interface AccessLine {
  key: string
  title: string
  detail: string
  state: AccessState
  label: string
}

interface AccessMatrixRow {
  key: string
  area: string
  caption: string
  scope: string
  source: string
  status: string
  state: AccessState
}

const route = useRoute()
const router = useRouter()

const scopeOptions: Array<{ value: SuperAdminDirectoryScope; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'internal', label: 'Internas' },
  { value: 'schoolFamilies', label: 'Escolar' },
  { value: 'daycare', label: 'Guardería' },
  { value: 'impersonable', label: 'Soporte' }
]

const assignableRoles: Array<{ key: SuperAdminAssignableRole; label: string; impact: string }> = [
  { key: 'daycareAdmin', label: 'Guardería', impact: 'administra unidades seleccionadas' },
  { key: 'communicationsAdmin', label: 'Comunicados', impact: 'prepara comunicados administrativos' },
  { key: 'accessHistoryAdmin', label: 'Historial', impact: 'consulta registros y diagnósticos' }
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
const roleChangeReason = ref('')
const savingRoles = ref(false)

const query = computed(() => ({
  plantel: selectedPlantel.value,
  search: search.value,
  scope: selectedScope.value,
  limit: limit.value
}))

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
  return getErrorMessage(loadError.value, 'La consulta falló antes de entregar contenido.')
})

const roleUnidadOptions = computed(() => {
  const values = [
    ...(directory.value?.unidades || []),
    ...(selectedUser.value?.unidad || [])
  ]
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'))
})

const directoryAdminCount = computed(() => directory.value?.users.filter((user) => user.adminScopes.length > 0).length || 0)

const directoryMetrics = computed(() => [
  { label: 'familias', value: directory.value?.metrics.familyUsers || 0 },
  { label: 'internas', value: directory.value?.metrics.internalUsers || 0 },
  { label: 'guardería', value: directory.value?.metrics.daycareFamilies || 0 },
  { label: 'soporte', value: directory.value?.metrics.impersonable || 0 }
])

const roleHasChanges = computed(() => {
  const current = selectedUser.value?.roleAssignments || emptyRoleAssignments()
  const roleChanged = assignableRoles.some((role) => Boolean(roleDraft.value[role.key]) !== Boolean(current[role.key]))
  const currentUnits = normalizedRoleUnits(selectedUser.value?.unidad || [])
  const draftUnits = normalizedRoleUnits(roleUnidadDraft.value)
  const unitsChanged = roleDraft.value.daycareAdmin && currentUnits.join('|') !== draftUnits.join('|')
  return roleChanged || unitsChanged
})

const saveBlockedReason = computed(() => {
  if (!roleHasChanges.value) return 'Sin cambios'
  if (roleDraft.value.daycareAdmin && !roleUnidadDraft.value.length) return 'Falta unidad'
  if (roleChangeReason.value.trim().length < 12) return 'Falta motivo'
  return ''
})

const currentAccessSummary = computed(() => {
  if (!selectedUser.value) return 'Sin cuenta'
  const count = accessRowsForUser(selectedUser.value).filter((item) => item.state === 'active' || item.state === 'family').length
  return count ? `${count} activo(s)` : 'Sin acceso activo'
})

const selectedSignals = computed(() => {
  const user = selectedUser.value
  if (!user) return []
  return [
    { key: 'state', label: primaryAccessState(user).label, state: primaryAccessState(user).state },
    { key: 'scope', label: primaryScopeLabel(user), state: primaryScopeLabel(user) === 'Sin alcance' ? 'incomplete' as const : 'active' as const },
    { key: 'admin', label: adminAccessLabel(user), state: user.adminScopes.length ? 'active' as const : 'none' as const }
  ]
})

const reviewFlags = computed(() => {
  const user = selectedUser.value
  if (!user) return []
  const flags: Array<{ key: string; label: string; value: string; state: AccessState }> = []
  if (user.audience === 'internal' && !user.adminScopes.length && !user.productScopes.length) {
    flags.push({ key: 'internal-role', label: 'Puesto', value: 'Sin responsabilidad', state: 'incomplete' })
  }
  if (!user.productScopes.length) {
    flags.push({ key: 'family-link', label: 'Familia', value: 'Sin vínculo', state: 'none' })
  }
  if (hasInheritedAdminAccess(user)) {
    flags.push({ key: 'inherited', label: 'Heredado', value: 'Revisar', state: 'incomplete' })
  }
  if (roleDraft.value.daycareAdmin && !roleUnidadDraft.value.length) {
    flags.push({ key: 'unit', label: 'Guardería', value: 'Falta unidad', state: 'incomplete' })
  }
  return flags
})

const relationshipRows = computed<AccessLine[]>(() => {
  const user = selectedUser.value
  if (!user) return []
  return [
    {
      key: 'internal-account',
      title: 'Staff / interna',
      detail: user.audience === 'internal' || user.adminScopes.length ? internalAccountDetail(user) : 'No detectada',
      state: user.audience === 'internal' || user.adminScopes.length ? 'active' : 'none',
      label: user.audience === 'internal' || user.adminScopes.length ? 'Sí' : 'No'
    },
    {
      key: 'school-family-link',
      title: 'Familia escolar',
      detail: user.productScopes.includes('personasAutorizadas') ? schoolFamilyDetail(user) : 'Sin alumno vinculado',
      state: user.productScopes.includes('personasAutorizadas') ? 'family' : 'none',
      label: user.productScopes.includes('personasAutorizadas') ? 'Activo' : 'No'
    },
    {
      key: 'daycare-family-link',
      title: 'Vínculo guardería',
      detail: user.productScopes.includes('daycare') ? daycareFamilyDetail(user) : 'Sin sala vinculada',
      state: user.productScopes.includes('daycare') ? 'family' : 'none',
      label: user.productScopes.includes('daycare') ? 'Activo' : 'No'
    },
    {
      key: 'administrative-scope',
      title: 'Responsabilidad admin',
      detail: adminAccessDetail(user),
      state: user.adminScopes.length ? 'active' : 'none',
      label: user.adminScopes.length ? 'Activa' : 'No'
    }
  ]
})

const accessRows = computed<AccessMatrixRow[]>(() => selectedUser.value ? accessRowsForUser(selectedUser.value) : [])

const changePreviewLines = computed(() => {
  const user = selectedUser.value
  if (!user || !roleHasChanges.value) return ['Sin cambios pendientes.']
  const current = user.roleAssignments || emptyRoleAssignments()
  const lines: string[] = []
  for (const role of assignableRoles) {
    const before = Boolean(current[role.key])
    const after = Boolean(roleDraft.value[role.key])
    if (before !== after) lines.push(`${role.label}: ${after ? role.impact : 'se retira'}.`)
  }
  const currentUnits = normalizedRoleUnits(user.unidad || [])
  const draftUnits = normalizedRoleUnits(roleUnidadDraft.value)
  if (roleDraft.value.daycareAdmin && currentUnits.join('|') !== draftUnits.join('|')) {
    lines.push(`Unidades: ${draftUnits.length ? draftUnits.join(' · ') : 'sin unidad'}.`)
  }
  if (hasInheritedAdminAccess(user)) lines.push('Tiene acceso heredado por configuración anterior.')
  return lines.length ? lines : ['Sin cambios pendientes.']
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
  roleChangeReason.value = ''
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
  if (saveBlockedReason.value) {
    actionError.value = saveBlockedReason.value === 'Falta motivo'
      ? 'Escribe un motivo antes de guardar.'
      : saveBlockedReason.value
    return
  }

  savingRoles.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    const updated = await $fetch<SuperAdminUserSummary>(`/api/admin/superadmin/users/${selectedUser.value.id}/roles`, {
      method: 'POST',
      body: { roles: roleDraft.value, unidades: roleUnidadDraft.value, reason: roleChangeReason.value.trim() }
    })

    selectedUser.value = updated
    if (directory.value?.users?.length) {
      directory.value.users = directory.value.users.map((user) => user.id === updated.id ? updated : user)
      directory.value.metrics.internalUsers = directory.value.users.filter((user) => user.audience === 'internal' || user.adminScopes.length).length
      directory.value.metrics.daycareAdmins = directory.value.users.filter((user) => user.adminScopes.includes('daycare')).length
    }
    roleChangeReason.value = ''
    actionNotice.value = 'Cambio guardado.'
  } catch (error: unknown) {
    actionError.value = getErrorMessage(error, 'No fue posible guardar el cambio.')
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
  if (scope === 'daycare') return 'guardería'
  if (scope === 'personasAutorizadas') return 'escolar'
  return scope
}

function accountTypeLabel(user: SuperAdminUserSummary) {
  if (user.audience === 'multiProductFamily') return 'Familia escolar + guardería'
  if (user.audience === 'daycareFamily') return 'Familia de guardería'
  if (user.audience === 'schoolFamily') return 'Familia escolar'
  if (user.audience === 'internal') return 'Cuenta interna'
  return 'Cuenta sin clasificar'
}

function relationshipSummary(user: SuperAdminUserSummary) {
  const values: string[] = []
  if (user.audience === 'internal' || user.adminScopes.length) values.push('interna')
  if (user.productScopes.includes('personasAutorizadas')) values.push('escolar')
  if (user.productScopes.includes('daycare')) values.push('guardería')
  return values.length ? values.join(' · ') : 'sin vínculo'
}


function primaryScopeLabel(user: SuperAdminUserSummary) {
  const values = [...user.plantel, ...user.unidad].filter(Boolean)
  if (values.length) return labelList(values, 'Sin alcance')
  if (user.campus || user.empresa) return user.campus || user.empresa || 'Sin alcance'
  if (user.productScopes.length) return user.productScopes.map(productScopeLabel).join(' · ')
  return 'Sin alcance'
}

function rowScopeLabel(user: SuperAdminUserSummary) {
  const scope = primaryScopeLabel(user)
  if (user.sala) return `${scope} · Sala ${user.sala}`
  return scope
}

function adminAccessLabel(user: SuperAdminUserSummary) {
  const labels: string[] = []
  if (user.adminScopes.includes('gestionEscolar')) labels.push('Escolar')
  if (user.adminScopes.includes('daycare')) labels.push('Guardería')
  if (user.adminScopes.includes('communications')) labels.push('Comunicados')
  if (user.adminScopes.includes('accessHistory')) labels.push('Historial')
  return labels.length ? labels.join(' · ') : 'Sin rol admin'
}

function adminAccessDetail(user: SuperAdminUserSummary) {
  if (adminAccessLabel(user) === 'Sin rol admin') return user.audience === 'internal' ? 'Disponible para asignación' : 'No administrativa'
  if (hasInheritedAdminAccess(user)) return 'Incluye acceso heredado'
  return 'Rol explícito'
}

function internalAccountDetail(user: SuperAdminUserSummary) {
  if (user.email?.toLowerCase().endsWith('@casitaiedis.edu.mx')) return 'Correo institucional'
  if (user.adminScopes.length) return 'Responsabilidad activa'
  if (user.role) return 'Rol legacy'
  return 'Sesión interna'
}

function daycareFamilyDetail(user: SuperAdminUserSummary) {
  const parts = [primaryScopeLabel(user)]
  if (user.sala) parts.push(`Sala ${user.sala}`)
  if (user.nombre_nino) parts.push(user.nombre_nino)
  return parts.filter(Boolean).join(' · ')
}

function schoolFamilyDetail(user: SuperAdminUserSummary) {
  return user.nombre_nino ? `Alumno: ${user.nombre_nino}` : primaryScopeLabel(user)
}

function daycareAdminCurrentDetail(user: SuperAdminUserSummary) {
  if (!user.unidad.length) return 'Sin unidad'
  return user.unidad.join(' · ')
}

function communicationsDetail(user: SuperAdminUserSummary) {
  if (user.communicationsScopes.length) return `${user.communicationsScopes.length} alcance(s)`
  if (user.roleAssignments.communicationsAdmin) return 'Rol explícito'
  return 'Heredado'
}

function historyAccessDetail(user: SuperAdminUserSummary) {
  return user.roleAssignments.accessHistoryAdmin ? 'Rol explícito' : 'Heredado'
}

function hasInheritedAdminAccess(user: SuperAdminUserSummary) {
  return user.adminScopes.some((scope) => {
    if (scope === 'gestionEscolar') return !user.roleAssignments.gestionEscolarAdmin
    if (scope === 'daycare') return !user.roleAssignments.daycareAdmin
    if (scope === 'communications') return !user.roleAssignments.communicationsAdmin
    if (scope === 'accessHistory') return !user.roleAssignments.accessHistoryAdmin
    return false
  })
}

function accessRowsForUser(user: SuperAdminUserSummary): AccessMatrixRow[] {
  return [
    {
      key: 'school-family',
      area: 'Portal escolar',
      caption: 'familia',
      scope: user.productScopes.includes('personasAutorizadas') ? primaryScopeLabel(user) : '—',
      source: user.productScopes.includes('personasAutorizadas') ? 'vínculo familiar' : '—',
      status: user.productScopes.includes('personasAutorizadas') ? 'Activo' : 'Sin vínculo',
      state: user.productScopes.includes('personasAutorizadas') ? 'family' : 'none'
    },
    {
      key: 'daycare-family',
      area: 'Portal guardería',
      caption: 'familia',
      scope: user.productScopes.includes('daycare') ? daycareFamilyDetail(user) : '—',
      source: user.productScopes.includes('daycare') ? 'vínculo familiar' : '—',
      status: user.productScopes.includes('daycare') ? 'Activo' : 'Sin vínculo',
      state: user.productScopes.includes('daycare') ? 'family' : 'none'
    },
    {
      key: 'school-admin',
      area: 'Admin escolar',
      caption: 'operación',
      scope: user.adminScopes.includes('gestionEscolar') ? primaryScopeLabel(user) : '—',
      source: user.adminScopes.includes('gestionEscolar') ? (user.roleAssignments.gestionEscolarAdmin ? 'rol explícito' : 'heredado') : '—',
      status: user.adminScopes.includes('gestionEscolar') ? 'Activo' : 'Sin rol',
      state: user.adminScopes.includes('gestionEscolar') ? 'active' : 'none'
    },
    {
      key: 'daycare-admin',
      area: 'Admin guardería',
      caption: 'operación',
      scope: user.adminScopes.includes('daycare') ? daycareAdminCurrentDetail(user) : '—',
      source: user.adminScopes.includes('daycare') ? (user.roleAssignments.daycareAdmin ? 'rol explícito' : 'heredado') : '—',
      status: user.adminScopes.includes('daycare') ? (user.unidad.length ? 'Activo' : 'Falta unidad') : 'Sin rol',
      state: user.adminScopes.includes('daycare') ? (user.unidad.length ? 'active' : 'incomplete') : 'none'
    },
    {
      key: 'communications',
      area: 'Comunicados',
      caption: 'módulo',
      scope: user.adminScopes.includes('communications') ? primaryScopeLabel(user) : '—',
      source: user.adminScopes.includes('communications') ? communicationsDetail(user) : '—',
      status: user.adminScopes.includes('communications') ? 'Activo' : 'Sin rol',
      state: user.adminScopes.includes('communications') ? 'active' : 'none'
    },
    {
      key: 'security',
      area: 'Historial',
      caption: 'seguridad',
      scope: user.adminScopes.includes('accessHistory') ? 'global soporte' : '—',
      source: user.adminScopes.includes('accessHistory') ? historyAccessDetail(user) : '—',
      status: user.adminScopes.includes('accessHistory') ? 'Activo' : 'Sin rol',
      state: user.adminScopes.includes('accessHistory') ? 'active' : 'none'
    }
  ]
}

function primaryAccessState(user: SuperAdminUserSummary) {
  if (user.adminScopes.length) {
    const incomplete = user.adminScopes.includes('daycare') && !user.unidad.length
    return incomplete ? { state: 'incomplete' as const, label: 'Admin sin alcance' } : { state: 'active' as const, label: 'Admin' }
  }
  if (user.productScopes.length) return { state: 'family' as const, label: 'Familia' }
  if (user.audience === 'internal') return { state: 'none' as const, label: 'Interna sin rol' }
  return { state: 'unknown' as const, label: 'Revisar' }
}

function impersonationButtonLabel(user: SuperAdminUserSummary) {
  if (!user.canImpersonate) return 'No disponible'
  if (impersonatingId.value === user.id) return 'Abriendo...'
  if (confirmingImpersonationId.value === user.id) return 'Confirmar'
  return 'Abrir'
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
    actionNotice.value = `Confirma la vista familiar de ${displayName(user)}.`
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
  } catch (error: unknown) {
    actionError.value = getErrorMessage(error, 'No fue posible abrir esta vista familiar.')
  } finally {
    impersonatingId.value = null
    confirmingImpersonationId.value = null
  }
}

function normalizeScope(value: unknown): SuperAdminDirectoryScope {
  return value === 'daycare' || value === 'schoolFamilies' || value === 'internal' || value === 'impersonable' ? value : 'all'
}

function getErrorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== 'object') return fallback
  const candidate = error as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
  return candidate.data?.statusMessage || candidate.statusMessage || candidate.message || fallback
}
</script>

<style scoped>
.access-console {
  --surface: #ffffff;
  --surface-muted: #f7f9fb;
  --line: #dce5eb;
  --line-soft: #e7edf2;
  --ink: #152032;
  --muted: #64748b;
  --accent: #0d766d;
  display: grid;
  gap: 12px;
}

.access-header,
.directory-panel,
.account-panel,
.roles-panel,
.state-panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.055);
}

.access-header {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  min-height: 76px;
  padding: 16px 18px;
}

.eyebrow,
.directory-head span,
.roles-head span,
.profile-copy p,
.section-head span {
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  margin: 0;
  text-transform: uppercase;
}

.access-header h1 {
  color: var(--ink);
  font-family: var(--font-body);
  font-size: clamp(1.55rem, 2vw, 2rem);
  letter-spacing: -0.03em;
  line-height: 1;
  margin: 3px 0 0;
}

.header-actions,
.role-actions,
.support-row > div:last-child {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.access-board {
  align-items: start;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(300px, 330px) minmax(440px, 1fr) minmax(320px, 360px);
}

.directory-panel,
.account-panel,
.roles-panel {
  align-content: start;
  display: grid;
  gap: 12px;
  padding: 12px;
}

.directory-panel,
.roles-panel {
  position: sticky;
  top: calc(var(--topbar-height) + 14px);
}

.directory-head,
.roles-head,
.section-head,
.change-panel header {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.directory-head strong,
.roles-head strong,
.section-head h2,
.change-panel h2,
.profile-card h2 {
  color: var(--ink);
  margin: 0;
}

.directory-head strong,
.roles-head strong {
  display: block;
  font-size: 1rem;
  margin-top: 2px;
}

.directory-head small {
  color: var(--muted);
  font-weight: 800;
}

.searchbar {
  align-items: center;
  background: var(--surface-muted);
  border: 1px solid var(--line);
  border-radius: 13px;
  display: grid;
  gap: 8px;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  min-height: 46px;
  padding: 5px 6px 5px 11px;
}

.searchbar input,
.filters select,
.reason-field textarea {
  color: var(--ink);
  font: inherit;
  min-width: 0;
  outline: 0;
}

.searchbar input,
.filters select {
  background: transparent;
  border: 0;
}

.searchbar button,
.inline-action {
  align-items: center;
  background: #ffffff;
  border: 1px solid #cfe0e7;
  border-radius: 10px;
  color: var(--accent);
  cursor: pointer;
  display: inline-flex;
  font-size: 0.8rem;
  font-weight: 850;
  justify-content: center;
  min-height: 34px;
  padding: 0 11px;
}

.filters {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.filters label {
  background: var(--surface-muted);
  border: 1px solid var(--line);
  border-radius: 12px;
  display: grid;
  gap: 3px;
  padding: 8px 10px;
}

.filters span,
.metric-strip small,
.person-meta small,
.profile-copy small,
.ledger-row small,
.table-row small,
.school-scope small,
.switch-row small,
.change-panel p,
.change-panel li,
.reason-field span,
.reason-field textarea::placeholder,
.locked-note,
.support-row small {
  color: var(--muted);
  font-size: 0.75rem;
}

.metric-strip {
  display: grid;
  gap: 6px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.metric-strip span {
  background: var(--surface-muted);
  border: 1px solid var(--line-soft);
  border-radius: 12px;
  display: grid;
  gap: 1px;
  min-width: 0;
  padding: 8px;
}

.metric-strip strong {
  color: var(--ink);
  font-size: 0.96rem;
}

.people-list {
  display: grid;
  gap: 5px;
  max-height: calc(100vh - 342px);
  overflow: auto;
  padding-right: 2px;
}

.person-row {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 14px;
  cursor: pointer;
  display: grid;
  gap: 9px;
  grid-template-columns: 38px minmax(0, 1fr) minmax(92px, auto);
  padding: 8px;
  text-align: left;
}

.person-row:hover,
.person-row.selected {
  background: #f3faf8;
  border-color: #cae2dc;
}

.avatar {
  align-items: center;
  background: #eef7f5;
  border: 1px solid #cae2dc;
  border-radius: 12px;
  color: var(--accent);
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 900;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.avatar.hero {
  border-radius: 18px;
  font-size: 1.12rem;
  height: 64px;
  width: 64px;
}

.person-copy,
.person-meta,
.profile-copy,
.roles-head > div {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.person-copy strong,
.person-copy small,
.person-meta small,
.profile-copy h2,
.profile-copy small,
.roles-head strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.person-copy strong {
  color: var(--ink);
  font-size: 0.86rem;
}

.person-copy small {
  color: #627386;
  font-size: 0.74rem;
}

.person-meta {
  justify-items: end;
}

.person-meta b,
.profile-badges span,
.roles-head b,
.table-row b,
.change-panel header span {
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 850;
  padding: 5px 8px;
  white-space: nowrap;
}

.person-meta b[data-state='active'],
.profile-badges span[data-state='active'],
.roles-head b[data-state='active'],
.table-row[data-state='active'] b,
.change-panel header span[data-state='active'],
.review-strip article[data-state='active'] {
  background: #e7f8ef;
  border: 1px solid #bfead0;
  color: #15803d;
}

.person-meta b[data-state='family'],
.profile-badges span[data-state='family'],
.roles-head b[data-state='family'],
.table-row[data-state='family'] b,
.change-panel header span[data-state='family'],
.review-strip article[data-state='family'] {
  background: #eef7fb;
  border: 1px solid #cfe7fb;
  color: #236188;
}

.person-meta b[data-state='incomplete'],
.person-meta b[data-state='unknown'],
.profile-badges span[data-state='incomplete'],
.profile-badges span[data-state='unknown'],
.roles-head b[data-state='incomplete'],
.roles-head b[data-state='unknown'],
.table-row[data-state='incomplete'] b,
.table-row[data-state='unknown'] b,
.change-panel header span[data-state='incomplete'],
.change-panel header span[data-state='unknown'],
.review-strip article[data-state='incomplete'],
.review-strip article[data-state='unknown'] {
  background: #fff6df;
  border: 1px solid #f3d589;
  color: #8a650c;
}

.person-meta b[data-state='none'],
.profile-badges span[data-state='none'],
.roles-head b[data-state='none'],
.table-row[data-state='none'] b,
.change-panel header span[data-state='none'],
.review-strip article[data-state='none'] {
  background: #f4f6f8;
  border: 1px solid var(--line);
  color: var(--muted);
}

.school-scope[data-state='active'],
.switch-row[data-state='active'] {
  box-shadow: inset 4px 0 0 #16a34a;
}

.school-scope[data-state='incomplete'],
.switch-row[data-state='incomplete'] {
  box-shadow: inset 4px 0 0 #d97706;
}

.profile-card {
  align-items: center;
  background: #fbfcfd;
  border: 1px solid var(--line);
  border-left: 6px solid #94a3b8;
  border-radius: 18px;
  display: grid;
  gap: 14px;
  grid-template-columns: 64px minmax(0, 1fr) minmax(0, auto);
  padding: 14px;
}

.profile-card[data-state='active'] { border-left-color: #16a34a; }
.profile-card[data-state='family'] { border-left-color: #0284c7; }
.profile-card[data-state='incomplete'],
.profile-card[data-state='unknown'] { border-left-color: #d97706; }
.profile-card[data-state='none'] { border-left-color: #94a3b8; }

.profile-copy h2 {
  font-family: var(--font-body);
  font-size: clamp(1.45rem, 2.2vw, 2rem);
  letter-spacing: -0.03em;
}

.profile-badges {
  align-items: end;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
}

.review-strip {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.review-strip article {
  border-radius: 14px;
  display: grid;
  gap: 2px;
  padding: 10px 12px;
}

.review-strip span {
  font-size: 0.7rem;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.review-strip strong {
  font-size: 0.94rem;
}

.ledger-section,
.matrix-section {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  display: grid;
  gap: 10px;
  padding: 12px;
}

.section-head h2,
.change-panel h2 {
  font-family: var(--font-body);
  font-size: 1.05rem;
}

.ledger {
  display: grid;
  gap: 1px;
  overflow: hidden;
}

.ledger-row {
  align-items: center;
  background: #ffffff;
  border: 0;
  border-bottom: 1px solid var(--line-soft);
  display: grid;
  gap: 10px;
  grid-template-columns: 10px minmax(0, 1fr) auto;
  min-height: 58px;
  padding: 9px 4px;
}

.ledger-row:last-child {
  border-bottom: 0;
}

.ledger-row i {
  border-radius: 999px;
  height: 10px;
  width: 10px;
}

.ledger-row[data-state='active'] i { background: #16a34a; }
.ledger-row[data-state='family'] i { background: #0284c7; }
.ledger-row[data-state='incomplete'],
.ledger-row[data-state='unknown'] { background: #ffffff; }
.ledger-row[data-state='incomplete'] i,
.ledger-row[data-state='unknown'] i { background: #d97706; }
.ledger-row[data-state='none'] { background: #ffffff; }
.ledger-row[data-state='none'] i { background: #cbd5e1; }

.ledger-row strong,
.school-scope strong,
.switch-row strong,
.support-row strong {
  color: var(--ink);
}

.ledger-row small,
.table-row small,
.school-scope small,
.switch-row small,
.support-row small {
  display: block;
  line-height: 1.35;
  margin-top: 2px;
}

.ledger-row b {
  color: var(--muted);
  font-size: 0.78rem;
}

.access-table {
  border: 1px solid var(--line-soft);
  border-radius: 14px;
  overflow: hidden;
}

.table-row {
  align-items: center;
  background: #ffffff;
  border: 0;
  border-bottom: 1px solid var(--line-soft);
  color: var(--ink);
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(150px, 1.2fr) minmax(120px, 1fr) minmax(110px, 0.8fr) auto;
  min-height: 54px;
  padding: 9px 12px;
}

.table-row:last-child {
  border-bottom: 0;
}

.table-row.table-head {
  background: var(--surface-muted);
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.06em;
  min-height: 40px;
  text-transform: uppercase;
}

.table-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-row strong {
  display: block;
}

.support-row {
  align-items: center;
  background: var(--surface-muted);
  border: 1px solid var(--line);
  border-radius: 16px;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 12px;
}

.roles-head b {
  align-self: start;
}

.role-controls {
  border: 1px solid var(--line);
  border-radius: 18px;
  display: grid;
  gap: 1px;
  overflow: hidden;
}

.school-scope,
.switch-row {
  align-items: center;
  background: #ffffff;
  border: 0;
  border-bottom: 1px solid var(--line-soft);
  color: inherit;
  display: grid;
  gap: 12px;
  min-height: 66px;
  padding: 12px;
}

.school-scope {
  grid-template-columns: minmax(0, 1fr) auto;
}

.switch-row {
  cursor: pointer;
  grid-template-columns: auto 42px minmax(0, 1fr);
}

.school-scope:last-child,
.switch-row:last-child {
  border-bottom: 0;
}

.switch-row input {
  height: 1px;
  opacity: 0;
  position: absolute;
  width: 1px;
}

.switch {
  background: #cbd5e1;
  border-radius: 999px;
  height: 24px;
  position: relative;
  width: 42px;
}

.switch::after {
  background: #ffffff;
  border-radius: 999px;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.22);
  content: '';
  height: 18px;
  left: 3px;
  position: absolute;
  top: 3px;
  transition: transform 0.16s ease;
  width: 18px;
}

.switch-row input:checked + .switch {
  background: var(--accent);
}

.switch-row input:checked + .switch::after {
  transform: translateX(18px);
}

.scope-chips {
  background: var(--surface-muted);
  border-bottom: 1px solid var(--line-soft);
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  padding: 10px 12px;
}

.scope-chip {
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--muted);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 850;
  min-height: 32px;
  padding: 0 11px;
}

.scope-chip.active {
  background: #e7f8ef;
  border-color: #bfead0;
  color: #15803d;
}

.change-panel {
  border: 1px solid var(--line);
  border-radius: 18px;
  display: grid;
  gap: 10px;
  padding: 12px;
}

.change-panel ul {
  display: grid;
  gap: 6px;
  margin: 0;
  padding-left: 18px;
}

.change-panel p {
  margin: 0;
}

.reason-field {
  display: grid;
  gap: 6px;
}

.reason-field span {
  font-weight: 850;
}

.reason-field textarea {
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 12px;
  min-height: 82px;
  padding: 10px 12px;
  resize: vertical;
}

.locked-note {
  background: var(--surface-muted);
  border: 1px solid var(--line);
  border-radius: 14px;
  margin: 0;
  padding: 12px;
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
  color: var(--muted);
  display: grid;
  gap: 9px;
  min-height: 280px;
  place-items: center;
  padding: 24px;
  text-align: center;
}

.state-panel h2 {
  color: var(--ink);
  margin: 0;
}

.state-panel p {
  margin: 0;
}

.state-panel.compact {
  min-height: 180px;
}

.detail-empty {
  min-height: 520px;
}

@media (max-width: 1260px) {
  .access-board {
    grid-template-columns: minmax(300px, 340px) minmax(0, 1fr);
  }

  .roles-panel {
    grid-column: 2;
    position: static;
  }
}

@media (max-width: 980px) {
  .access-board {
    grid-template-columns: 1fr;
  }

  .directory-panel,
  .roles-panel {
    grid-column: auto;
    position: static;
  }

  .people-list {
    max-height: none;
  }
}

@media (max-width: 720px) {
  .access-header,
  .support-row {
    align-items: stretch;
    flex-direction: column;
  }

  .header-actions,
  .role-actions,
  .support-row > div:last-child {
    display: grid;
    justify-content: stretch;
  }

  .filters,
  .metric-strip,
  .review-strip,
  .profile-card,
  .table-row,
  .person-row,
  .school-scope {
    grid-template-columns: 1fr;
  }

  .profile-badges,
  .person-meta {
    align-items: start;
    justify-content: start;
    justify-items: start;
  }
}
</style>
