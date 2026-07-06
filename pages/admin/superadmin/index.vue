<template>
  <section class="superadmin-console" data-product-area="superadmin" data-product-screen="access-management">
    <header class="access-header">
      <div>
        <p class="eyebrow">Super Admin · Seguridad operativa</p>
        <h1>Gestión de accesos</h1>
        <p>Ubica una cuenta, confirma sus vínculos escolares y ajusta roles administrativos con alcance explícito.</p>
      </div>
      <div class="head-actions">
        <NuxtLink class="btn btn-secondary" to="/admin/superadmin/gestion-escolar">Alcances escolares</NuxtLink>
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

    <section v-else class="access-workspace" data-product-panel="superadmin-directory" :data-state="directory?.users?.length ? 'content' : 'empty'">
      <aside class="directory-pane" aria-label="Directorio de cuentas">
        <div class="pane-heading">
          <div>
            <p class="eyebrow">Directorio</p>
            <h2>Cuentas</h2>
          </div>
          <span>{{ directory?.users.length || 0 }} visibles</span>
        </div>

        <form class="directory-search" role="search" @submit.prevent="refreshDirectory">
          <FamilyPersonasIcon name="search" />
          <input v-model="search" type="search" placeholder="Nombre, correo, matrícula, estudiante o sala" data-diagnostic-filter="buscar-usuario" />
          <button class="search-submit" type="submit" :disabled="isLoadingVisible">Buscar</button>
        </form>

        <div class="filter-row" aria-label="Filtros de cuentas">
          <label>
            <span>Perfil</span>
            <select v-model="selectedScope" data-diagnostic-filter="tipo-persona">
              <option v-for="option in scopeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </label>
          <label>
            <span>Alcance</span>
            <select v-model="selectedPlantel" data-diagnostic-filter="plantel">
              <option value="">Todos</option>
              <option v-for="plantel in directory?.planteles || []" :key="plantel" :value="plantel">{{ plantel }}</option>
            </select>
          </label>
        </div>

        <div class="metric-strip" aria-label="Resumen del directorio">
          <span><b>{{ directory?.metrics.familyUsers || 0 }}</b> familias</span>
          <span><b>{{ directory?.metrics.internalUsers || 0 }}</b> internas</span>
          <span><b>{{ directory?.metrics.impersonable || 0 }}</b> soporte</span>
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
            <span class="row-meta">
              <b :data-state="primaryAccessState(user).state">{{ primaryAccessState(user).label }}</b>
              <small>{{ rowScopeLabel(user) }}</small>
            </span>
          </button>
        </div>

        <div v-else class="state-panel compact" data-state="empty">
          <FamilyPersonasIcon name="people" />
          <h2>Sin resultados</h2>
          <p>Ajusta la búsqueda o cambia un filtro.</p>
        </div>
      </aside>

      <section class="person-pane">
        <template v-if="clientReady && selectedUser">
          <header class="identity-panel">
            <span class="avatar large">{{ initials(selectedUser) }}</span>
            <div class="identity-copy">
              <p class="eyebrow">{{ accountTypeLabel(selectedUser) }}</p>
              <h2>{{ displayName(selectedUser) }}</h2>
              <p>{{ accountLabel(selectedUser) }} · ID {{ selectedUser.id }}</p>
            </div>
            <div class="identity-status">
              <span class="status-badge" :data-state="primaryAccessState(selectedUser).state">{{ primaryAccessState(selectedUser).label }}</span>
              <small>{{ adminAccessLabel(selectedUser) }}</small>
            </div>
          </header>

          <section class="resolution-panel" :data-state="primaryAccessState(selectedUser).state">
            <div>
              <p class="eyebrow">Revisión</p>
              <h3>{{ reviewTitle }}</h3>
              <p>{{ reviewDetail }}</p>
            </div>
            <div class="resolution-actions">
              <NuxtLink
                v-if="showEscolarAction"
                class="btn btn-primary"
                :to="{ path: '/admin/superadmin/gestion-escolar', query: { usuario: selectedUser.id, buscar: selectedUser.email || selectedUser.username || String(selectedUser.id) } }"
              >
                Editar alcance escolar
              </NuxtLink>
              <button
                v-if="selectedUser.canImpersonate"
                class="btn btn-secondary"
                type="button"
                data-diagnostic-action="impersonar-usuario"
                :disabled="impersonatingId === selectedUser.id"
                @click="requestImpersonation(selectedUser)"
              >
                {{ impersonationButtonLabel(selectedUser) }}
              </button>
            </div>
          </section>

          <section class="context-panel">
            <div class="section-title">
              <div>
                <p class="eyebrow">Identificación segura</p>
                <h3>Cuenta y vínculos</h3>
              </div>
              <span>{{ selectedUser.canManageAdminRoles ? 'Editable' : 'Solo consulta' }}</span>
            </div>

            <div class="facts-grid" aria-label="Resumen de la cuenta">
              <article>
                <span>Cuenta</span>
                <strong>{{ selectedUser.email ? 'Correo institucional' : selectedUser.username ? 'Matrícula / usuario' : 'ID interno' }}</strong>
                <small>{{ accountLabel(selectedUser) }}</small>
              </article>
              <article>
                <span>Perfil</span>
                <strong>{{ accountTypeLabel(selectedUser) }}</strong>
                <small>{{ personKindDetail(selectedUser) }}</small>
              </article>
              <article>
                <span>Alcance encontrado</span>
                <strong>{{ primaryScopeLabel(selectedUser) }}</strong>
                <small>{{ contextDetail(selectedUser) }}</small>
              </article>
              <article>
                <span>Rol administrativo</span>
                <strong>{{ adminAccessLabel(selectedUser) }}</strong>
                <small>{{ adminAccessDetail(selectedUser) }}</small>
              </article>
            </div>
          </section>

          <section class="access-section">
            <div class="section-title">
              <div>
                <p class="eyebrow">Permisos efectivos</p>
                <h3>Qué puede abrir ahora</h3>
              </div>
              <span>{{ accessSummary }}</span>
            </div>

            <div class="access-matrix">
              <article v-for="item in effectiveAccessRows" :key="item.key" :data-state="item.state">
                <div>
                  <strong>{{ item.title }}</strong>
                  <small>{{ item.detail }}</small>
                </div>
                <b>{{ item.label }}</b>
              </article>
            </div>
          </section>

          <section class="assignment-section">
            <div class="section-title">
              <div>
                <p class="eyebrow">Editar roles</p>
                <h3>Administración de guardería y permisos sensibles</h3>
              </div>
              <span :data-state="roleDraft.daycareAdmin ? (roleUnidadDraft.length ? 'active' : 'incomplete') : 'none'">
                {{ roleDraft.daycareAdmin ? (roleUnidadDraft.length ? 'Alcance definido' : 'Falta alcance') : 'Sin guardería admin' }}
              </span>
            </div>

            <template v-if="selectedUser.canManageAdminRoles">
              <label class="role-switch">
                <input v-model="roleDraft.daycareAdmin" type="checkbox" />
                <span>
                  <strong>Habilitar administración de guardería</strong>
                  <small>Permite gestionar salas, familias, tareas, avisos y calendario únicamente en las unidades autorizadas.</small>
                </span>
              </label>

              <fieldset v-if="roleDraft.daycareAdmin" class="scope-picker" aria-label="Unidades de guardería autorizadas">
                <legend>Unidades autorizadas</legend>
                <div class="unit-grid">
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
                </div>
                <p v-if="!roleUnidadOptions.length">No hay unidades disponibles para esta cuenta.</p>
              </fieldset>

              <section class="sensitive-panel" aria-label="Permisos administrativos sensibles">
                <div>
                  <p class="eyebrow">Permisos adicionales</p>
                  <h4>Acceso sensible</h4>
                  <p>Activa estos permisos solo cuando el puesto lo requiera. Los cambios deben poder justificarse en soporte interno.</p>
                </div>
                <label>
                  <input v-model="roleDraft.accessHistoryAdmin" type="checkbox" />
                  <span>
                    <strong>Seguridad e historial</strong>
                    <small>Consulta validaciones, historial de accesos y diagnósticos operativos.</small>
                  </span>
                </label>
                <label>
                  <input v-model="roleDraft.communicationsAdmin" type="checkbox" />
                  <span>
                    <strong>Comunicados generales</strong>
                    <small>Puede preparar comunicados administrativos según el alcance configurado.</small>
                  </span>
                </label>
              </section>

              <section v-if="roleHasChanges" class="change-preview" aria-live="polite">
                <p class="eyebrow">Antes de guardar</p>
                <h4>{{ changePreviewTitle }}</h4>
                <ul>
                  <li v-for="line in changePreviewLines" :key="line">{{ line }}</li>
                </ul>
              </section>

              <div class="role-actions">
                <button class="btn btn-secondary" type="button" :disabled="savingRoles || !roleHasChanges" @click="resetRoleDraft">Descartar cambios</button>
                <button class="btn btn-primary" type="button" :disabled="savingRoles || !roleHasChanges" @click="saveAdminRoles">{{ savingRoles ? 'Guardando...' : 'Guardar roles' }}</button>
              </div>
            </template>

            <p v-else class="locked-note">Esta cuenta no es institucional ni interna. No puede recibir roles administrativos desde este panel.</p>
          </section>

          <section v-if="selectedUser.canImpersonate" class="support-section">
            <div>
              <p class="eyebrow">Soporte familiar</p>
              <h3>Vista controlada</h3>
              <p>Úsala solo para resolver un caso activo. La sesión de soporte queda separada de la edición de roles.</p>
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
          <h2>Selecciona una cuenta</h2>
          <p>Verás vínculos, permisos efectivos, alcance administrativo y acciones de soporte.</p>
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
  { value: 'internal', label: 'Cuentas internas' },
  { value: 'schoolFamilies', label: 'Familias escolares' },
  { value: 'daycare', label: 'Familias guardería' },
  { value: 'impersonable', label: 'Soporte familiar' }
]

const assignableRoles: Array<{ key: SuperAdminAssignableRole; label: string }> = [
  { key: 'daycareAdmin', label: 'Admin Guardería' },
  { key: 'communicationsAdmin', label: 'Comunicados generales' },
  { key: 'accessHistoryAdmin', label: 'Seguridad e historial' }
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
  if (!selectedUser.value) return 'Sin cuenta'
  const count = [
    selectedUser.value.productScopes.includes('personasAutorizadas'),
    selectedUser.value.productScopes.includes('daycare'),
    selectedGestionEscolarActive.value,
    roleDraft.value.daycareAdmin,
    roleDraft.value.communicationsAdmin || selectedUser.value.adminScopes.includes('communications'),
    roleDraft.value.accessHistoryAdmin || selectedUser.value.adminScopes.includes('accessHistory')
  ].filter(Boolean).length
  return count ? `${count} permisos` : 'Sin permisos'
})
const guarderiaAdminDetail = computed(() => roleUnidadDraft.value.length ? roleUnidadDraft.value.join(' · ') : 'Selecciona al menos una unidad.')
const reviewTitle = computed(() => {
  if (!selectedUser.value) return 'Selecciona una cuenta'
  if (selectedUser.value.audience === 'internal' && !selectedGestionEscolarActive.value && !roleDraft.value.daycareAdmin) return 'Cuenta interna sin responsabilidad asignada'
  if (primaryAccessState(selectedUser.value).state === 'incomplete') return 'Rol administrativo sin alcance operativo'
  if (selectedUser.value.canImpersonate && !selectedUser.value.canManageAdminRoles) return 'Cuenta familiar: soporte sin editar roles'
  if (selectedUser.value.canImpersonate) return 'Cuenta con vista familiar disponible'
  return 'Permisos listos para revisión'
})
const reviewDetail = computed(() => {
  if (!selectedUser.value) return ''
  if (showEscolarAction.value && !selectedGestionEscolarActive.value) return 'Asigna el alcance escolar desde el flujo dedicado para evitar mezclar roles, grados y grupos en este panel.'
  if (selectedGestionEscolarActive.value) return 'El alcance escolar se administra por plantel, nivel, grado o grupo desde su flujo dedicado.'
  if (roleDraft.value.daycareAdmin && !roleUnidadDraft.value.length) return 'El rol de guardería no debe quedar activo sin unidades autorizadas.'
  if (selectedUser.value.canImpersonate) return 'Puedes abrir una vista familiar controlada para soporte. No uses esa acción para validar permisos administrativos.'
  return 'Revisa la cuenta antes de guardar cambios; este panel solo edita roles administrativos permitidos.'
})
const effectiveAccessRows = computed(() => {
  if (!selectedUser.value) return []
  const user = selectedUser.value
  return [
    {
      key: 'school-family',
      title: 'Familia escolar',
      detail: user.productScopes.includes('personasAutorizadas') ? schoolFamilyDetail(user) : 'Sin vínculo escolar familiar encontrado.',
      state: user.productScopes.includes('personasAutorizadas') ? 'active' : 'none',
      label: user.productScopes.includes('personasAutorizadas') ? 'Activo' : 'No asignado'
    },
    {
      key: 'daycare-family',
      title: 'Familia guardería',
      detail: user.productScopes.includes('daycare') ? daycareFamilyDetail(user) : 'Sin vínculo familiar de guardería encontrado.',
      state: user.productScopes.includes('daycare') ? 'active' : 'none',
      label: user.productScopes.includes('daycare') ? 'Activo' : 'No asignado'
    },
    {
      key: 'school-admin',
      title: 'Admin Escolar',
      detail: selectedGestionEscolarActive.value ? 'Alcance administrado por plantel, nivel, grado o grupo.' : 'Se configura desde el flujo de alcances escolares.',
      state: selectedGestionEscolarActive.value ? 'active' : 'none',
      label: selectedGestionEscolarActive.value ? 'Activo' : 'Sin rol'
    },
    {
      key: 'daycare-admin',
      title: 'Admin Guardería',
      detail: roleDraft.value.daycareAdmin ? guarderiaAdminDetail.value : 'Sin gestión administrativa de salas.',
      state: roleDraft.value.daycareAdmin ? (roleUnidadDraft.value.length ? 'active' : 'incomplete') : 'none',
      label: roleDraft.value.daycareAdmin ? (roleUnidadDraft.value.length ? 'Activo' : 'Falta alcance') : 'Sin rol'
    },
    {
      key: 'communications',
      title: 'Comunicados generales',
      detail: roleDraft.value.communicationsAdmin || user.adminScopes.includes('communications') ? communicationsDetail(user) : 'No puede administrar comunicados generales.',
      state: roleDraft.value.communicationsAdmin || user.adminScopes.includes('communications') ? 'active' : 'none',
      label: roleDraft.value.communicationsAdmin || user.adminScopes.includes('communications') ? 'Activo' : 'Sin rol'
    },
    {
      key: 'security',
      title: 'Seguridad e historial',
      detail: roleDraft.value.accessHistoryAdmin || user.adminScopes.includes('accessHistory') ? 'Puede consultar validaciones, historial y herramientas de diagnóstico.' : 'No puede consultar historial de accesos.',
      state: roleDraft.value.accessHistoryAdmin || user.adminScopes.includes('accessHistory') ? 'active' : 'none',
      label: roleDraft.value.accessHistoryAdmin || user.adminScopes.includes('accessHistory') ? 'Activo' : 'Sin rol'
    }
  ]
})
const changePreviewLines = computed(() => {
  const user = selectedUser.value
  if (!user || !roleHasChanges.value) return []
  const current = user.roleAssignments || emptyRoleAssignments()
  const lines: string[] = []
  for (const role of assignableRoles) {
    const before = Boolean(current[role.key])
    const after = Boolean(roleDraft.value[role.key])
    if (before !== after) lines.push(`${role.label}: ${after ? 'se activará' : 'se retirará'}.`)
  }
  const currentUnits = normalizedRoleUnits(user.unidad || [])
  const draftUnits = normalizedRoleUnits(roleUnidadDraft.value)
  if (roleDraft.value.daycareAdmin && currentUnits.join('|') !== draftUnits.join('|')) {
    lines.push(`Unidades de guardería: ${draftUnits.length ? draftUnits.join(' · ') : 'sin unidades seleccionadas'}.`)
  }
  return lines
})
const changePreviewTitle = computed(() => {
  if (roleDraft.value.daycareAdmin && !roleUnidadDraft.value.length) return 'No se puede guardar hasta seleccionar al menos una unidad.'
  if (roleDraft.value.daycareAdmin) return 'Se guardará acceso administrativo con alcance de guardería.'
  if (!roleDraft.value.communicationsAdmin && !roleDraft.value.accessHistoryAdmin) return 'Se retirarán los roles administrativos editables en este panel.'
  return 'Se actualizarán permisos administrativos sensibles.'
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
    actionNotice.value = 'Roles administrativos actualizados.'
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible guardar los roles.'
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
  if (scope === 'daycare') return 'familia guardería'
  if (scope === 'personasAutorizadas') return 'familia escolar'
  return scope
}

function accountTypeLabel(user: SuperAdminUserSummary) {
  if (user.audience === 'multiProductFamily') return 'Familia escolar y guardería'
  if (user.audience === 'daycareFamily') return 'Familia guardería'
  if (user.audience === 'schoolFamily') return 'Familia escolar'
  if (user.audience === 'internal') return 'Cuenta interna'
  return 'Sin vínculo clasificado'
}

function personKindDetail(user: SuperAdminUserSummary) {
  if (user.productScopes.length) return `Acceso familiar: ${user.productScopes.map(productScopeLabel).join(' · ')}`
  if (user.adminScopes.length) return adminAccessLabel(user)
  if (user.audience === 'internal') return 'Cuenta institucional sin rol administrativo activo'
  return 'No se encontró vínculo familiar o administrativo'
}

function contextFallback(user: SuperAdminUserSummary) {
  if (user.campus) return user.campus
  if (user.empresa) return user.empresa
  return 'Sin alcance registrado'
}

function contextDetail(user: SuperAdminUserSummary) {
  if (user.sala) return `Sala ${user.sala}`
  if (user.campus || user.empresa) return contextFallback(user)
  if (user.productScopes.length) return user.productScopes.map(productScopeLabel).join(' · ')
  return 'No hay sala, plantel o unidad asociada'
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
  if (selectedGestionEscolarActive.value) labels.push('Escolar')
  if (roleDraft.value.daycareAdmin || user.adminScopes.includes('daycare')) labels.push('Guardería')
  if (roleDraft.value.accessHistoryAdmin || user.adminScopes.includes('accessHistory')) labels.push('Seguridad')
  if (roleDraft.value.communicationsAdmin || user.adminScopes.includes('communications')) labels.push('Comunicados')
  return labels.length ? labels.join(' · ') : 'Sin rol administrativo'
}

function adminAccessDetail(user: SuperAdminUserSummary) {
  if (adminAccessLabel(user) === 'Sin rol administrativo') return user.audience === 'internal' ? 'Puede recibir una responsabilidad si su puesto lo requiere.' : 'No es cuenta administrativa.'
  return 'Responsabilidades administrativas activas.'
}

function daycareFamilyDetail(user: SuperAdminUserSummary) {
  return user.sala ? `${primaryScopeLabel(user)} · Sala ${user.sala}` : primaryScopeLabel(user)
}

function schoolFamilyDetail(user: SuperAdminUserSummary) {
  return user.nombre_nino ? `Vínculo con ${user.nombre_nino}` : primaryScopeLabel(user)
}

function communicationsDetail(user: SuperAdminUserSummary) {
  if (user.communicationsScopes.length) return `${user.communicationsScopes.length} alcance(s) de comunicados configurado(s).`
  if (roleDraft.value.communicationsAdmin || user.adminScopes.includes('communications')) return 'Puede administrar comunicados generales.'
  return 'Sin alcance de comunicados.'
}

function primaryAccessState(user: SuperAdminUserSummary) {
  if (user.adminScopes.includes('gestionEscolar') || user.adminScopes.includes('daycare') || user.adminScopes.includes('communications') || user.adminScopes.includes('accessHistory')) {
    const hasConcreteScope = user.adminScopes.includes('gestionEscolar') || user.unidad.length || user.communicationsScopes.length || user.adminScopes.includes('accessHistory')
    return hasConcreteScope ? { state: 'active', label: 'Admin con alcance' } : { state: 'incomplete', label: 'Admin sin alcance' }
  }
  if (user.productScopes.length) return { state: 'family', label: 'Familia' }
  if (user.audience === 'internal') return { state: 'none', label: 'Interna sin rol' }
  return { state: 'unknown', label: 'Revisar' }
}

function impersonationButtonLabel(user: SuperAdminUserSummary) {
  if (!user.canImpersonate) return 'Vista no disponible'
  if (impersonatingId.value === user.id) return 'Abriendo...'
  if (confirmingImpersonationId.value === user.id) return 'Confirmar vista familiar'
  return 'Abrir vista familiar'
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
    actionNotice.value = `Confirma para abrir la vista familiar de ${displayName(user)}.`
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

.access-header,
.directory-pane,
.person-pane,
.state-panel {
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid #dce5eb;
  border-radius: 16px;
  box-shadow: 0 12px 34px rgba(15, 23, 42, 0.055);
}

.access-header {
  align-items: end;
  display: flex;
  gap: 18px;
  justify-content: space-between;
  padding: clamp(18px, 2.2vw, 26px);
}

.access-header h1,
.pane-heading h2,
.identity-panel h2,
.section-title h3,
.resolution-panel h3,
.support-section h3,
.state-panel h2,
.sensitive-panel h4,
.change-preview h4 {
  color: #152032;
  margin: 0;
}

.access-header h1 {
  font-family: var(--font-body);
  font-size: clamp(2rem, 3vw, 2.75rem);
  letter-spacing: -0.03em;
}

.access-header p:not(.eyebrow),
.identity-panel p,
.resolution-panel p,
.locked-note,
.support-section p,
.sensitive-panel p,
.change-preview li {
  color: #627386;
  margin: 0;
}

.head-actions,
.role-actions,
.support-actions,
.resolution-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.access-workspace {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(340px, 430px) minmax(0, 1fr);
}

.directory-pane,
.person-pane {
  align-content: start;
  display: grid;
  gap: 14px;
  padding: 14px;
}

.directory-pane {
  align-self: start;
  position: sticky;
  top: calc(var(--topbar-height) + 18px);
}

.pane-heading,
.section-title,
.identity-status {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.pane-heading > span,
.section-title > span,
.identity-status small {
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 800;
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

.filter-row,
.metric-strip,
.facts-grid,
.access-matrix {
  display: grid;
  gap: 8px;
}

.filter-row {
  grid-template-columns: 1fr 1fr;
}

.filter-row label,
.metric-strip span,
.facts-grid article,
.access-matrix article,
.role-switch,
.scope-picker,
.sensitive-panel,
.change-preview {
  background: #fbfcfd;
  border: 1px solid #dce5eb;
  border-radius: 13px;
}

.filter-row label {
  display: grid;
  gap: 4px;
  padding: 8px 10px;
}

.filter-row span,
.facts-grid span,
.section-title span,
.row-meta small,
.metric-strip span,
.change-preview .eyebrow {
  color: #6b7a8b;
  font-size: 0.72rem;
  font-weight: 800;
}

.metric-strip {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.metric-strip span {
  align-content: center;
  display: grid;
  min-height: 46px;
  padding: 8px 10px;
}

.metric-strip b {
  color: #152032;
  font-size: 1rem;
}

.people-list {
  display: grid;
  gap: 6px;
  max-height: calc(100vh - 338px);
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
  grid-template-columns: 42px minmax(0, 1fr) minmax(108px, auto);
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
.row-meta,
.identity-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.person-copy strong,
.person-copy small,
.row-meta b,
.row-meta small,
.facts-grid strong,
.facts-grid small,
.identity-copy h2,
.identity-copy p {
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
.access-matrix small,
.role-switch small,
.sensitive-panel small,
.scope-picker p {
  color: #667789;
  font-size: 0.78rem;
  line-height: 1.45;
}

.row-meta {
  justify-items: end;
}

.row-meta b,
.status-badge,
.access-matrix b,
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

.identity-status {
  align-items: flex-end;
  flex-direction: column;
}

.resolution-panel {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #dce5eb;
  border-radius: 15px;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 14px;
}

.context-panel,
.access-section,
.assignment-section,
.support-section {
  border: 1px solid #e1e8ed;
  border-radius: 15px;
  display: grid;
  gap: 12px;
  padding: 14px;
}

.facts-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.facts-grid article {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 12px;
}

.facts-grid strong {
  color: #152032;
  font-size: 0.96rem;
}

.section-title h3,
.resolution-panel h3,
.support-section h3 {
  font-family: var(--font-body);
  font-size: 1.08rem;
}

.access-matrix {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.access-matrix article {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 12px;
}

.access-matrix strong,
.role-switch strong,
.sensitive-panel strong {
  color: #152032;
  display: block;
}

.access-matrix article[data-state='active'],
.access-matrix article[data-state='family'],
.access-matrix article[data-state='none'],
.access-matrix article[data-state='incomplete'] {
  color: inherit;
}

.role-switch {
  align-items: center;
  cursor: pointer;
  display: grid;
  gap: 12px;
  grid-template-columns: auto minmax(0, 1fr);
  padding: 12px;
}

.role-switch input,
.sensitive-panel input {
  accent-color: #0d766d;
}

.scope-picker {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 12px;
}

.scope-picker legend {
  color: #152032;
  font-size: 0.86rem;
  font-weight: 850;
  padding: 0 4px;
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

.sensitive-panel {
  display: grid;
  gap: 12px;
  padding: 12px;
}

.sensitive-panel label {
  align-items: start;
  background: #ffffff;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  display: grid;
  gap: 10px;
  grid-template-columns: auto minmax(0, 1fr);
  padding: 10px;
}

.change-preview {
  display: grid;
  gap: 8px;
  padding: 12px;
}

.change-preview ul {
  color: #526173;
  margin: 0;
  padding-left: 18px;
}

.support-section {
  align-items: center;
  grid-template-columns: minmax(0, 1fr) auto;
}

.locked-note {
  background: #f8fafc;
  border: 1px solid #dce5eb;
  border-radius: 13px;
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
  .access-workspace,
  .facts-grid,
  .access-matrix {
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
  .access-header,
  .head-actions,
  .section-title,
  .support-section,
  .pane-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .head-actions,
  .role-actions,
  .support-actions,
  .resolution-actions {
    display: grid;
    justify-content: stretch;
  }

  .filter-row,
  .metric-strip,
  .identity-panel,
  .resolution-panel,
  .person-row,
  .access-matrix article,
  .support-section {
    grid-template-columns: 1fr;
  }

  .row-meta,
  .identity-status {
    align-items: start;
    justify-items: start;
  }
}
</style>
