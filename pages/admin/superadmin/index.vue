<template>
  <section class="access-console" data-product-area="superadmin" data-product-screen="account-resolution">
    <header class="ops-bar">
      <div>
        <p class="eyebrow">Super Admin</p>
        <h1>Revisión de cuentas</h1>
      </div>
      <div class="ops-actions">
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
      <h2>No fue posible cargar cuentas</h2>
      <p>{{ loadProblemMessage }}</p>
      <button class="btn btn-secondary" type="button" data-diagnostic-action="reintentar-directorio" @click="refreshDirectory">Reintentar</button>
    </section>

    <section v-else class="access-workbench" data-product-panel="superadmin-directory" :data-state="visibleUsers.length ? 'content' : 'empty'">
      <aside class="queue-panel" aria-label="Cola de cuentas">
        <div class="queue-head">
          <div>
            <span>Cola</span>
            <strong>{{ directory?.users.length || 0 }} cuentas</strong>
          </div>
          <b>{{ directoryAdminCount }} admin</b>
        </div>

        <form class="searchbar" role="search" @submit.prevent="refreshDirectory">
          <FamilyPersonasIcon name="search" />
          <input v-model="search" type="search" placeholder="Nombre, correo, matrícula o sala" data-diagnostic-filter="buscar-usuario" />
          <button type="submit" :disabled="isLoadingVisible">Buscar</button>
        </form>

        <div class="queue-tabs" aria-label="Vistas de revisión">
          <button
            v-for="tab in queueTabs"
            :key="tab.key"
            type="button"
            :class="{ active: queueMode === tab.key }"
            @click="queueMode = tab.key"
          >
            <strong>{{ tab.count }}</strong>
            <span>{{ tab.label }}</span>
          </button>
        </div>

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

        <div v-if="isLoadingVisible" class="state-panel compact" data-product-loading>
          <HuskyPassLoader label="Cuentas" compact />
        </div>

        <div v-else-if="visibleUsers.length" class="people-list" role="list">
          <button
            v-for="user in visibleUsers"
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
          <p>Cambia búsqueda o filtros.</p>
        </div>
      </aside>

      <main class="case-panel">
        <template v-if="clientReady && selectedUser">
          <section class="case-strip" :data-state="primaryAccessState(selectedUser).state">
            <span class="avatar hero">{{ initials(selectedUser) }}</span>
            <div class="case-title">
              <p>{{ accountTypeLabel(selectedUser) }}</p>
              <h2>{{ displayName(selectedUser) }}</h2>
              <small>{{ accountLabel(selectedUser) }} · ID {{ selectedUser.id }}</small>
            </div>
            <div class="case-state">
              <strong>{{ caseHeadline }}</strong>
              <span>{{ primaryScopeLabel(selectedUser) }}</span>
            </div>
          </section>

          <section class="resolution-banner" :data-state="primaryAccessState(selectedUser).state">
            <strong>{{ nextMove.title }}</strong>
            <span>{{ nextMove.meta }}</span>
            <NuxtLink v-if="nextMove.to" class="inline-action" :to="nextMove.to">{{ nextMove.action }}</NuxtLink>
            <button v-else class="inline-action" type="button" @click="selectResolution(nextMove.key)">{{ nextMove.action }}</button>
          </section>

          <section class="relationship-ledger">
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

          <section class="access-matrix">
            <header class="section-head">
              <h2>Acceso</h2>
              <span>{{ currentAccessSummary }}</span>
            </header>
            <div class="matrix" role="table" aria-label="Acceso efectivo actual">
              <div class="matrix-row matrix-head" role="row">
                <span role="columnheader">Área</span>
                <span role="columnheader">Alcance</span>
                <span role="columnheader">Origen</span>
                <span role="columnheader">Estado</span>
              </div>
              <div v-for="row in accessRows" :key="row.key" class="matrix-row" role="row" :data-state="row.state">
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
              <small>Soporte sin cambiar roles.</small>
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
          <p>El panel de resolución aparecerá a la derecha.</p>
        </div>
      </main>

      <aside class="resolve-panel" aria-label="Resolver acceso">
        <template v-if="clientReady && selectedUser">
          <header class="resolve-head">
            <div>
              <span>Resolver</span>
              <strong>{{ resolverTitle }}</strong>
            </div>
            <b :data-state="roleHasChanges ? 'incomplete' : 'none'">{{ roleHasChanges ? 'Pendiente' : 'Actual' }}</b>
          </header>

          <section class="resolution-options">
            <button
              v-for="option in resolutionOptions"
              :key="option.key"
              type="button"
              :class="{ active: resolverMode === option.key }"
              :data-state="option.state"
              @click="selectResolution(option.key)"
            >
              <span>{{ option.title }}</span>
              <small>{{ option.meta }}</small>
            </button>
          </section>

          <section v-if="selectedUser.canManageAdminRoles" class="role-editor">
            <NuxtLink
              class="school-scope"
              :data-state="selectedUser.adminScopes.includes('gestionEscolar') ? 'active' : 'none'"
              :to="{ path: '/admin/superadmin/gestion-escolar', query: { usuario: selectedUser.id, buscar: selectedUser.email || selectedUser.username || String(selectedUser.id) } }"
            >
              <span>
                <strong>Escolar</strong>
                <small>{{ selectedUser.adminScopes.includes('gestionEscolar') ? primaryScopeLabel(selectedUser) : 'Sin alcance' }}</small>
              </span>
              <b>Editar</b>
            </NuxtLink>

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
                <small>Preparar publicaciones</small>
              </span>
            </label>

            <label class="switch-row" :data-state="roleDraft.accessHistoryAdmin ? 'active' : 'none'">
              <input v-model="roleDraft.accessHistoryAdmin" type="checkbox" />
              <span class="switch" aria-hidden="true" />
              <span>
                <strong>Historial</strong>
                <small>Auditoría y diagnósticos</small>
              </span>
            </label>
          </section>

          <p v-else class="locked-note">Cuenta familiar. Usa vínculos, no roles internos.</p>

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
              <textarea v-model="roleChangeReason" rows="3" maxlength="500" placeholder="Ticket o solicitud interna" />
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
          <h2>Resolver</h2>
          <p>Selecciona una cuenta.</p>
        </div>
      </aside>
    </section>
  </section>
</template>


<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { navigateTo, useFetch, useRoute, useRouter } from 'nuxt/app'
import type { AppSessionUser, FamilyProductScope, PublicSession } from '~/types/session'
import type { SuperAdminAssignableRole, SuperAdminDirectoryResponse, SuperAdminDirectoryScope, SuperAdminRoleAssignments, SuperAdminUserSummary } from '~/types/superadmin'
import { defaultFamilyRoute } from '~/utils/sessionScopes'
import { setCachedRouteSession } from '~/utils/routeSession'
import { displayMatricula } from '~/utils/matricula'

definePageMeta({ layout: 'admin', middleware: ['admin', 'superadmin'] })

type AccessState = 'active' | 'family' | 'incomplete' | 'none' | 'unknown'
type QueueMode = 'review' | 'internal' | 'families' | 'admins' | 'sensitive'
type ResolverMode = 'school' | 'daycare' | 'communications' | 'history' | 'none'

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
const queueMode = ref<QueueMode>('review')
const resolverMode = ref<ResolverMode>('school')
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

const queueCounts = computed(() => {
  const users = directory.value?.users || []
  return {
    review: users.filter(needsReview).length,
    internal: users.filter((user) => user.audience === 'internal' || user.adminScopes.length).length,
    families: users.filter((user) => user.productScopes.length > 0).length,
    admins: users.filter((user) => user.adminScopes.length > 0).length,
    sensitive: users.filter((user) => user.adminScopes.includes('communications') || user.adminScopes.includes('accessHistory') || user.canImpersonate).length
  }
})

const queueTabs = computed<Array<{ key: QueueMode; label: string; count: number }>>(() => [
  { key: 'review', label: 'Revisión', count: queueCounts.value.review },
  { key: 'internal', label: 'Internas', count: queueCounts.value.internal },
  { key: 'families', label: 'Familias', count: queueCounts.value.families },
  { key: 'admins', label: 'Admins', count: queueCounts.value.admins },
  { key: 'sensitive', label: 'Sensibles', count: queueCounts.value.sensitive }
])

const visibleUsers = computed(() => {
  const users = directory.value?.users || []
  const rows = users.filter((user) => {
    if (queueMode.value === 'review') return needsReview(user)
    if (queueMode.value === 'internal') return user.audience === 'internal' || user.adminScopes.length
    if (queueMode.value === 'families') return user.productScopes.length > 0
    if (queueMode.value === 'admins') return user.adminScopes.length > 0
    if (queueMode.value === 'sensitive') return user.adminScopes.includes('communications') || user.adminScopes.includes('accessHistory') || user.canImpersonate
    return true
  })
  return rows.length ? rows : users
})

const caseHeadline = computed(() => selectedUser.value ? primaryAccessState(selectedUser.value).label : 'Sin cuenta')
const resolverTitle = computed(() => selectedUser.value ? nextMoveForUser(selectedUser.value).title : 'Selecciona cuenta')

const nextMove = computed(() => selectedUser.value ? nextMoveForUser(selectedUser.value) : { key: 'none' as ResolverMode, title: 'Selecciona una cuenta', meta: '', action: 'Ver', to: '' })

const resolutionOptions = computed<Array<{ key: ResolverMode; title: string; meta: string; state: AccessState }>>(() => {
  const user = selectedUser.value
  if (!user) return []
  return [
    { key: 'school', title: 'Dar acceso escolar', meta: user.adminScopes.includes('gestionEscolar') ? primaryScopeLabel(user) : 'Plantel, grado o grupo', state: user.adminScopes.includes('gestionEscolar') ? 'active' : 'none' },
    { key: 'daycare', title: 'Dar acceso guardería', meta: roleUnidadDraft.value.length ? roleUnidadDraft.value.join(' · ') : 'Unidad requerida', state: roleDraft.value.daycareAdmin ? (roleUnidadDraft.value.length ? 'active' : 'incomplete') : 'none' },
    { key: 'communications', title: 'Comunicados', meta: 'Preparar publicaciones', state: roleDraft.value.communicationsAdmin ? 'active' : 'none' },
    { key: 'history', title: 'Historial', meta: 'Auditoría y diagnósticos', state: roleDraft.value.accessHistoryAdmin ? 'active' : 'none' },
    { key: 'none', title: 'Sin acceso operativo', meta: user.productScopes.length ? 'Conservar vínculo familiar' : 'Cuenta sin roles', state: !user.adminScopes.length ? 'none' : 'incomplete' }
  ]
})

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
  const rows = visibleUsers.value
  if (!selectedUser.value || !rows.some((user) => user.id === selectedUser.value?.id)) {
    selectedUser.value = rows[0] || value.users[0] || null
    syncQuery(selectedUser.value?.id)
  }
}, { immediate: true })

watch(visibleUsers, (rows) => {
  if (!rows.length) return
  if (!selectedUser.value || !rows.some((user) => user.id === selectedUser.value?.id)) {
    selectedUser.value = rows[0]
    syncQuery(rows[0].id)
  }
})

watch(selectedUser, (user) => {
  syncRoleDraft(user)
  resolverMode.value = user ? nextMoveForUser(user).key : 'school'
})


function needsReview(user: SuperAdminUserSummary) {
  if (user.audience === 'internal' && !user.adminScopes.length && !user.productScopes.length) return true
  if (user.adminScopes.includes('daycare') && !user.unidad.length) return true
  if (hasInheritedAdminAccess(user)) return true
  if (!user.productScopes.length && !user.adminScopes.length && user.audience === 'unknown') return true
  return false
}

function nextMoveForUser(user: SuperAdminUserSummary): { key: ResolverMode; title: string; meta: string; action: string; to?: string } {
  if (user.adminScopes.includes('daycare') && !user.unidad.length) return { key: 'daycare', title: 'Falta unidad de guardería', meta: 'Selecciona al menos una unidad', action: 'Elegir unidad' }
  if (user.adminScopes.includes('gestionEscolar')) return { key: 'school', title: 'Admin escolar activo', meta: primaryScopeLabel(user), action: 'Ajustar', to: `/admin/superadmin/gestion-escolar?usuario=${user.id}&buscar=${encodeURIComponent(user.email || user.username || String(user.id))}` }
  if (user.audience === 'internal' && !user.adminScopes.length) return { key: 'school', title: 'Definir responsabilidad', meta: primaryScopeLabel(user), action: 'Resolver' }
  if (user.productScopes.length) return { key: 'none', title: 'Acceso familiar', meta: relationshipSummary(user), action: user.canImpersonate ? 'Abrir vista' : 'Ver' }
  return { key: 'school', title: 'Cuenta sin acceso', meta: 'Revisar vínculo o rol', action: 'Resolver' }
}

function selectResolution(mode: ResolverMode) {
  resolverMode.value = mode
  if (mode === 'daycare') roleDraft.value.daycareAdmin = true
  if (mode === 'communications') roleDraft.value.communicationsAdmin = !roleDraft.value.communicationsAdmin
  if (mode === 'history') roleDraft.value.accessHistoryAdmin = !roleDraft.value.accessHistoryAdmin
  if (mode === 'none') {
    roleDraft.value.daycareAdmin = false
    roleDraft.value.communicationsAdmin = false
    roleDraft.value.accessHistoryAdmin = false
    roleUnidadDraft.value = []
  }
}

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
    const response = await $fetch<{ user: AppSessionUser } & PublicSession>('/api/auth/admin/impersonate', {
      method: 'POST',
      body: { userId: user.id }
    })
    actionNotice.value = 'Abriendo vista familiar.'
    setCachedRouteSession(response)
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
  const candidate = error as { data?: { message?: string; statusMessage?: string }; message?: string; statusMessage?: string }
  return candidate.data?.message || candidate.data?.statusMessage || candidate.message || candidate.statusMessage || fallback
}
</script>


<style scoped>
.access-console {
  --surface: #ffffff;
  --surface-muted: #f7f9fb;
  --line: #dce5eb;
  --line-soft: #e7edf2;
  --ink: #142033;
  --muted: #64748b;
  --accent: #0d766d;
  --good: #13814f;
  --warn: #b7791f;
  display: grid;
  gap: 12px;
}

.ops-bar,
.queue-panel,
.case-panel,
.resolve-panel,
.state-panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.055);
}

.ops-bar {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  min-height: 72px;
  padding: 16px 18px;
}

.eyebrow,
.queue-head span,
.resolve-head span,
.case-title p,
.section-head span {
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  margin: 0;
  text-transform: uppercase;
}

.ops-bar h1,
.case-title h2,
.section-head h2,
.change-panel h2,
.resolve-head strong,
.queue-head strong {
  color: var(--ink);
  font-family: var(--font-body);
  margin: 0;
}

.ops-bar h1 {
  font-size: clamp(1.7rem, 2.4vw, 2.35rem);
  letter-spacing: -0.04em;
  line-height: 1;
}

.ops-actions,
.role-actions,
.support-row > div:last-child {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.access-workbench {
  align-items: start;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(310px, 348px) minmax(460px, 1fr) minmax(320px, 376px);
}

.queue-panel,
.case-panel,
.resolve-panel {
  align-content: start;
  display: grid;
  gap: 12px;
  padding: 12px;
}

.queue-panel,
.resolve-panel {
  position: sticky;
  top: calc(var(--topbar-height) + 14px);
}

.queue-head,
.resolve-head,
.section-head,
.change-panel header {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.queue-head strong,
.resolve-head strong {
  display: block;
  font-size: 1rem;
  margin-top: 2px;
}

.queue-head b,
.resolve-head b,
.matrix-row b,
.change-panel header span,
.person-meta b {
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 850;
  padding: 5px 8px;
  white-space: nowrap;
}

.searchbar {
  align-items: center;
  background: var(--surface-muted);
  border: 1px solid var(--line);
  border-radius: 14px;
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

.queue-tabs {
  display: grid;
  gap: 6px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.queue-tabs button {
  background: var(--surface-muted);
  border: 1px solid var(--line-soft);
  border-radius: 12px;
  color: var(--muted);
  cursor: pointer;
  display: grid;
  gap: 1px;
  min-width: 0;
  padding: 8px 5px;
  text-align: left;
}

.queue-tabs button.active {
  background: #eef8f5;
  border-color: #bfe1d9;
  color: var(--accent);
}

.queue-tabs strong {
  color: var(--ink);
  font-size: 0.94rem;
}

.queue-tabs span,
.filters span,
.person-meta small,
.person-copy small,
.case-title small,
.case-state span,
.ledger-row small,
.matrix-row small,
.school-scope small,
.switch-row small,
.change-panel p,
.change-panel li,
.reason-field span,
.reason-field textarea::placeholder,
.locked-note,
.support-row small,
.resolution-options small {
  color: var(--muted);
  font-size: 0.75rem;
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

.people-list {
  display: grid;
  gap: 5px;
  max-height: calc(100vh - 354px);
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
.case-title,
.resolve-head > div {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.person-copy strong,
.person-copy small,
.person-meta small,
.case-title h2,
.case-title small,
.resolve-head strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.person-copy strong {
  color: var(--ink);
  font-size: 0.86rem;
}

.person-meta {
  justify-items: end;
}

.person-meta b[data-state='active'],
.resolve-head b[data-state='active'],
.matrix-row[data-state='active'] b,
.change-panel header span[data-state='active'] {
  background: #e7f8ef;
  border: 1px solid #bfead0;
  color: #15803d;
}

.person-meta b[data-state='family'],
.matrix-row[data-state='family'] b {
  background: #eef7fb;
  border: 1px solid #cfe7fb;
  color: #236188;
}

.person-meta b[data-state='incomplete'],
.person-meta b[data-state='unknown'],
.resolve-head b[data-state='incomplete'],
.resolve-head b[data-state='unknown'],
.matrix-row[data-state='incomplete'] b,
.matrix-row[data-state='unknown'] b,
.change-panel header span[data-state='incomplete'],
.change-panel header span[data-state='unknown'] {
  background: #fff6df;
  border: 1px solid #f3d589;
  color: #8a650c;
}

.person-meta b[data-state='none'],
.resolve-head b[data-state='none'],
.matrix-row[data-state='none'] b,
.change-panel header span[data-state='none'] {
  background: #f4f6f8;
  border: 1px solid var(--line);
  color: var(--muted);
}

.case-strip {
  align-items: center;
  background: #fbfcfd;
  border: 1px solid var(--line);
  border-left: 6px solid #94a3b8;
  border-radius: 18px;
  display: grid;
  gap: 14px;
  grid-template-columns: 64px minmax(0, 1fr) minmax(130px, auto);
  padding: 14px;
}

.case-strip[data-state='active'] { border-left-color: #16a34a; }
.case-strip[data-state='family'] { border-left-color: #0284c7; }
.case-strip[data-state='incomplete'],
.case-strip[data-state='unknown'] { border-left-color: #d97706; }
.case-strip[data-state='none'] { border-left-color: #94a3b8; }

.case-title h2 {
  font-size: clamp(1.55rem, 2.2vw, 2.2rem);
  letter-spacing: -0.04em;
}

.case-state {
  display: grid;
  gap: 3px;
  justify-items: end;
  text-align: right;
}

.case-state strong {
  color: var(--ink);
}

.resolution-banner {
  align-items: center;
  background: #fff8ea;
  border: 1px solid #f3d589;
  border-radius: 16px;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) minmax(120px, auto) auto;
  padding: 12px 14px;
}

.resolution-banner[data-state='active'],
.resolution-banner[data-state='family'] {
  background: #f3faf8;
  border-color: #cae2dc;
}

.resolution-banner strong {
  color: var(--ink);
}

.resolution-banner span {
  color: var(--muted);
  font-size: 0.82rem;
  text-align: right;
}

.relationship-ledger,
.access-matrix,
.change-panel,
.support-row {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  display: grid;
  gap: 10px;
  padding: 12px;
}

.section-head h2,
.change-panel h2 {
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
  border-bottom: 1px solid var(--line-soft);
  display: grid;
  gap: 10px;
  grid-template-columns: 10px minmax(0, 1fr) auto;
  min-height: 56px;
  padding: 9px 4px;
}

.ledger-row:last-child { border-bottom: 0; }
.ledger-row i { border-radius: 999px; height: 10px; width: 10px; }
.ledger-row[data-state='active'] i { background: #16a34a; }
.ledger-row[data-state='family'] i { background: #0284c7; }
.ledger-row[data-state='incomplete'] i,
.ledger-row[data-state='unknown'] i { background: #d97706; }
.ledger-row[data-state='none'] i { background: #cbd5e1; }
.ledger-row strong,
.school-scope strong,
.switch-row strong,
.support-row strong,
.resolution-options span {
  color: var(--ink);
}
.ledger-row small,
.matrix-row small,
.school-scope small,
.switch-row small,
.support-row small {
  display: block;
  line-height: 1.35;
  margin-top: 2px;
}
.ledger-row b { color: var(--muted); font-size: 0.78rem; }

.matrix {
  border: 1px solid var(--line-soft);
  border-radius: 14px;
  overflow: hidden;
}
.matrix-row {
  align-items: center;
  background: #ffffff;
  border-bottom: 1px solid var(--line-soft);
  color: var(--ink);
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(142px, 1.2fr) minmax(120px, 1fr) minmax(105px, 0.8fr) auto;
  min-height: 52px;
  padding: 9px 12px;
}
.matrix-row:last-child { border-bottom: 0; }
.matrix-head {
  background: var(--surface-muted);
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.06em;
  min-height: 38px;
  text-transform: uppercase;
}
.matrix-row span { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.matrix-row strong { display: block; }

.support-row {
  align-items: center;
  background: var(--surface-muted);
  display: flex;
  justify-content: space-between;
}

.resolution-options {
  display: grid;
  gap: 7px;
}

.resolution-options button,
.school-scope,
.switch-row {
  align-items: center;
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 14px;
  color: inherit;
  cursor: pointer;
  display: grid;
  min-height: 58px;
  padding: 11px 12px;
  text-align: left;
}

.resolution-options button {
  gap: 3px;
}

.resolution-options button.active,
.resolution-options button:hover {
  background: #f3faf8;
  border-color: #cae2dc;
}

.resolution-options button[data-state='active'] { box-shadow: inset 4px 0 0 #16a34a; }
.resolution-options button[data-state='incomplete'] { box-shadow: inset 4px 0 0 #d97706; }

.role-editor {
  display: grid;
  gap: 8px;
}

.school-scope {
  grid-template-columns: minmax(0, 1fr) auto;
}

.school-scope b {
  color: var(--accent);
  font-size: 0.78rem;
}

.switch-row {
  grid-template-columns: 42px minmax(0, 1fr);
}

.school-scope[data-state='active'],
.switch-row[data-state='active'] { box-shadow: inset 4px 0 0 #16a34a; }
.school-scope[data-state='incomplete'],
.switch-row[data-state='incomplete'] { box-shadow: inset 4px 0 0 #d97706; }

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
.switch-row input:checked + .switch { background: var(--accent); }
.switch-row input:checked + .switch::after { transform: translateX(18px); }

.scope-chips {
  background: var(--surface-muted);
  border: 1px solid var(--line-soft);
  border-radius: 14px;
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

.change-panel ul {
  display: grid;
  gap: 6px;
  margin: 0;
  padding-left: 18px;
}
.change-panel p { margin: 0; }
.reason-field { display: grid; gap: 6px; }
.reason-field span { font-weight: 850; }
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
.state-panel h2 { color: var(--ink); margin: 0; }
.state-panel p { margin: 0; }
.state-panel.compact { min-height: 180px; }
.detail-empty { min-height: 520px; }

@media (max-width: 1280px) {
  .access-workbench { grid-template-columns: minmax(310px, 348px) minmax(0, 1fr); }
  .resolve-panel { grid-column: 2; position: static; }
}
@media (max-width: 980px) {
  .access-workbench { grid-template-columns: 1fr; }
  .queue-panel, .resolve-panel { grid-column: auto; position: static; }
  .people-list { max-height: none; }
}
@media (max-width: 720px) {
  .ops-bar, .support-row { align-items: stretch; flex-direction: column; }
  .ops-actions, .role-actions, .support-row > div:last-child { display: grid; justify-content: stretch; }
  .filters, .queue-tabs, .case-strip, .matrix-row, .person-row, .school-scope, .resolution-banner { grid-template-columns: 1fr; }
  .case-state, .person-meta { align-items: start; justify-content: start; justify-items: start; text-align: left; }
}
</style>
