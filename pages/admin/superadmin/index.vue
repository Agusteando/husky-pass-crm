<template>
  <section class="access-console" data-product-area="superadmin" data-product-screen="access-management">
    <header class="page-intro">
      <div>
        <p class="kicker">Super Admin</p>
        <h1>Administración de cuentas y permisos</h1>
        <p>Busca una cuenta, verifica sus vínculos reales y guarda cambios de acceso con alcance, impacto y motivo claros.</p>
      </div>
      <div class="head-actions">
        <NuxtLink class="btn btn-secondary" to="/admin/superadmin/gestion-escolar">Editar alcance escolar</NuxtLink>
        <NuxtLink class="btn btn-secondary" to="/admin/historial-accesos">Ver historial</NuxtLink>
        <button class="btn btn-primary" type="button" data-diagnostic-action="actualizar-directorio" :disabled="isLoadingVisible" @click="refreshDirectory">
          {{ isLoadingVisible ? 'Actualizando...' : 'Actualizar directorio' }}
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
        <div class="directory-title">
          <div>
            <p class="kicker">Directorio</p>
            <h2>Buscar cuenta</h2>
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
            <span>Tipo de cuenta</span>
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

        <dl class="directory-summary" aria-label="Resumen del directorio filtrado">
          <div>
            <dt>Cuentas</dt>
            <dd>{{ directory?.users.length || 0 }}</dd>
          </div>
          <div>
            <dt>Familias</dt>
            <dd>{{ directory?.metrics.familyUsers || 0 }}</dd>
          </div>
          <div>
            <dt>Internas</dt>
            <dd>{{ directory?.metrics.internalUsers || 0 }}</dd>
          </div>
          <div>
            <dt>Admins</dt>
            <dd>{{ directoryAdminCount }}</dd>
          </div>
        </dl>

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
            <span class="row-tags">
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

      <section class="case-pane">
        <template v-if="clientReady && selectedUser">
          <header class="case-header">
            <span class="avatar large">{{ initials(selectedUser) }}</span>
            <div>
              <p class="kicker">Cuenta seleccionada</p>
              <h2>{{ displayName(selectedUser) }}</h2>
              <p>{{ accountLabel(selectedUser) }} · ID {{ selectedUser.id }}</p>
            </div>
            <div class="case-status">
              <span :data-state="primaryAccessState(selectedUser).state">{{ primaryAccessState(selectedUser).label }}</span>
              <small>{{ primaryScopeLabel(selectedUser) }}</small>
            </div>
          </header>

          <ol class="case-steps" aria-label="Flujo de revisión de acceso">
            <li v-for="step in caseSteps" :key="step.key" :data-state="step.state">
              <strong>{{ step.title }}</strong>
              <span>{{ step.detail }}</span>
            </li>
          </ol>

          <section v-if="caseWarnings.length" class="risk-panel" aria-label="Pendientes antes de asignar acceso">
            <div>
              <h3>Antes de cambiar permisos</h3>
              <p>Estos puntos deben estar claros para no mezclar identidad, vínculos familiares y responsabilidades internas.</p>
            </div>
            <ul>
              <li v-for="warning in caseWarnings" :key="warning">{{ warning }}</li>
            </ul>
          </section>

          <section class="identity-section">
            <div class="section-heading">
              <div>
                <h3>Identidad y vínculos detectados</h3>
                <p>La decisión de acceso debe salir de estos datos, no de una etiqueta suelta de rol.</p>
              </div>
            </div>

            <div class="identity-layout">
              <dl class="fact-list">
                <div v-for="fact in identityFacts" :key="fact.label">
                  <dt>{{ fact.label }}</dt>
                  <dd>{{ fact.value }}</dd>
                  <small>{{ fact.detail }}</small>
                </div>
              </dl>

              <div class="relationship-list" aria-label="Vínculos escolares y administrativos">
                <article v-for="item in relationshipRows" :key="item.key" :data-state="item.state">
                  <div>
                    <strong>{{ item.title }}</strong>
                    <p>{{ item.detail }}</p>
                  </div>
                  <span>{{ item.label }}</span>
                </article>
              </div>
            </div>
          </section>

          <section class="access-section">
            <div class="section-heading split">
              <div>
                <h3>Acceso efectivo actual</h3>
                <p>Separado por tipo de vínculo para no confundir familia, puesto interno, módulo y alcance.</p>
              </div>
              <span>{{ currentAccessSummary }}</span>
            </div>

            <div class="access-groups">
              <article v-for="group in accessGroups" :key="group.key" class="access-group">
                <header>
                  <h4>{{ group.title }}</h4>
                  <p>{{ group.description }}</p>
                </header>
                <div class="access-lines">
                  <div v-for="item in group.items" :key="item.key" class="access-line" :data-state="item.state">
                    <div>
                      <strong>{{ item.title }}</strong>
                      <span>{{ item.detail }}</span>
                    </div>
                    <b>{{ item.label }}</b>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section class="assignment-section">
            <div class="section-heading split">
              <div>
                <h3>Editar responsabilidades administrativas</h3>
                <p>Este panel edita guardería, comunicados e historial. El alcance escolar usa su propio flujo por plantel, nivel, grado o grupo.</p>
              </div>
              <span :data-state="roleHasChanges ? 'incomplete' : 'none'">{{ roleHasChanges ? 'Cambio pendiente' : 'Sin cambios' }}</span>
            </div>

            <template v-if="selectedUser.canManageAdminRoles">
              <div class="role-grid">
                <article class="role-card school-role" :data-state="selectedUser.adminScopes.includes('gestionEscolar') ? 'active' : 'none'">
                  <div>
                    <strong>Administración escolar</strong>
                    <p>Planteles, niveles, grados y grupos se asignan en el flujo escolar para mantener el alcance explícito.</p>
                  </div>
                  <NuxtLink
                    class="inline-link"
                    :to="{ path: '/admin/superadmin/gestion-escolar', query: { usuario: selectedUser.id, buscar: selectedUser.email || selectedUser.username || String(selectedUser.id) } }"
                  >
                    Editar alcance escolar
                  </NuxtLink>
                </article>

                <label class="role-card selectable" :data-state="roleDraft.daycareAdmin ? (roleUnidadDraft.length ? 'active' : 'incomplete') : 'none'">
                  <input v-model="roleDraft.daycareAdmin" type="checkbox" />
                  <span>
                    <strong>Administración de guardería</strong>
                    <p>Gestiona salas, familias, tareas, avisos y calendario solo en las unidades seleccionadas.</p>
                  </span>
                </label>
              </div>

              <fieldset v-if="roleDraft.daycareAdmin" class="scope-picker" aria-label="Unidades de guardería autorizadas">
                <legend>Unidades autorizadas para guardería</legend>
                <div v-if="roleUnidadOptions.length" class="unit-grid">
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
                <p v-else>No hay unidades disponibles para esta cuenta. Agrega el alcance operativo antes de guardar.</p>
              </fieldset>

              <div class="sensitive-grid" aria-label="Permisos sensibles">
                <label class="role-card selectable" :data-state="roleDraft.communicationsAdmin ? 'active' : 'none'">
                  <input v-model="roleDraft.communicationsAdmin" type="checkbox" />
                  <span>
                    <strong>Comunicados administrativos</strong>
                    <p>Puede preparar comunicados generales. La publicación debe respetar los alcances configurados.</p>
                  </span>
                </label>
                <label class="role-card selectable" :data-state="roleDraft.accessHistoryAdmin ? 'active' : 'none'">
                  <input v-model="roleDraft.accessHistoryAdmin" type="checkbox" />
                  <span>
                    <strong>Historial y diagnósticos de acceso</strong>
                    <p>Consulta validaciones, registros de entrada/salida y diagnósticos operativos de soporte.</p>
                  </span>
                </label>
              </div>

              <section class="review-panel" aria-live="polite">
                <div class="section-heading split compact-heading">
                  <div>
                    <h4>Revisión antes de guardar</h4>
                    <p>{{ changePreviewTitle }}</p>
                  </div>
                  <span :data-state="saveBlockedReason ? 'incomplete' : roleHasChanges ? 'active' : 'none'">{{ saveBlockedReason || 'Listo para guardar' }}</span>
                </div>
                <ul>
                  <li v-for="line in changePreviewLines" :key="line">{{ line }}</li>
                </ul>
                <label v-if="roleHasChanges" class="reason-field">
                  <span>Motivo del cambio</span>
                  <textarea v-model="roleChangeReason" rows="3" maxlength="500" placeholder="Ejemplo: se asigna por solicitud de Dirección para administrar la unidad ISSSTE MET durante el ciclo actual." />
                  <small>Obligatorio. Mínimo 12 caracteres. Evita datos personales innecesarios.</small>
                </label>
                <div class="role-actions">
                  <button class="btn btn-secondary" type="button" :disabled="savingRoles || !roleHasChanges" @click="resetRoleDraft">Descartar cambios</button>
                  <button class="btn btn-primary" type="button" :disabled="savingRoles || Boolean(saveBlockedReason)" @click="saveAdminRoles">
                    {{ savingRoles ? 'Guardando...' : 'Guardar cambio de acceso' }}
                  </button>
                </div>
              </section>
            </template>

            <p v-else class="locked-note">Esta cuenta no es institucional ni administrativa. Primero corrige el vínculo de identidad antes de conceder responsabilidades internas.</p>
          </section>

          <section v-if="selectedUser.canImpersonate" class="support-section">
            <div>
              <h3>Soporte familiar controlado</h3>
              <p>Abre la vista familiar solo para un caso activo. Esta acción no modifica roles ni alcances administrativos.</p>
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
          <p>Verás identidad, vínculos, acceso efectivo, responsabilidades editables e impacto antes de guardar.</p>
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

type AccessState = 'active' | 'family' | 'incomplete' | 'none' | 'unknown'
interface AccessLine {
  key: string
  title: string
  detail: string
  state: AccessState
  label: string
}

const scopeOptions: Array<{ value: SuperAdminDirectoryScope; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'internal', label: 'Internas y staff' },
  { value: 'schoolFamilies', label: 'Familias escolares' },
  { value: 'daycare', label: 'Familias de guardería' },
  { value: 'impersonable', label: 'Soporte familiar' }
]

const assignableRoles: Array<{ key: SuperAdminAssignableRole; label: string; impact: string }> = [
  { key: 'daycareAdmin', label: 'Administración de guardería', impact: 'gestión de salas, familias, tareas, avisos y calendario' },
  { key: 'communicationsAdmin', label: 'Comunicados administrativos', impact: 'preparación de comunicados generales' },
  { key: 'accessHistoryAdmin', label: 'Historial y diagnósticos de acceso', impact: 'consulta de registros y diagnósticos de soporte' }
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

const roleUnidadOptions = computed(() => {
  const values = [
    ...(directory.value?.unidades || []),
    ...(selectedUser.value?.unidad || [])
  ]
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'))
})

const directoryAdminCount = computed(() => directory.value?.users.filter((user) => user.adminScopes.length > 0).length || 0)

const roleHasChanges = computed(() => {
  const current = selectedUser.value?.roleAssignments || emptyRoleAssignments()
  const roleChanged = assignableRoles.some((role) => Boolean(roleDraft.value[role.key]) !== Boolean(current[role.key]))
  const currentUnits = normalizedRoleUnits(selectedUser.value?.unidad || [])
  const draftUnits = normalizedRoleUnits(roleUnidadDraft.value)
  const unitsChanged = roleDraft.value.daycareAdmin && currentUnits.join('|') !== draftUnits.join('|')
  return roleChanged || unitsChanged
})

const saveBlockedReason = computed(() => {
  if (!roleHasChanges.value) return 'Sin cambios pendientes'
  if (roleDraft.value.daycareAdmin && !roleUnidadDraft.value.length) return 'Falta unidad de guardería'
  if (roleChangeReason.value.trim().length < 12) return 'Falta motivo'
  return ''
})

const currentAccessSummary = computed(() => {
  if (!selectedUser.value) return 'Sin cuenta'
  const count = currentAccessLines(selectedUser.value).filter((item) => item.state === 'active' || item.state === 'family').length
  return count ? `${count} acceso(s) activo(s)` : 'Sin acceso activo'
})

const caseSteps = computed(() => {
  const user = selectedUser.value
  if (!user) return []
  const hasAnyLink = Boolean(user.productScopes.length || user.audience === 'internal' || user.adminScopes.length)
  const hasAnyAccess = currentAccessLines(user).some((item) => item.state === 'active' || item.state === 'family')
  return [
    {
      key: 'identity',
      title: 'Identidad',
      detail: accountLabel(user),
      state: accountLabel(user) ? 'active' : 'incomplete'
    },
    {
      key: 'relationships',
      title: 'Vínculos',
      detail: hasAnyLink ? relationshipSummary(user) : 'Sin vínculo detectado',
      state: hasAnyLink ? 'active' : 'incomplete'
    },
    {
      key: 'current-access',
      title: 'Acceso actual',
      detail: currentAccessSummary.value,
      state: hasAnyAccess ? 'active' : 'none'
    },
    {
      key: 'pending-change',
      title: 'Cambio',
      detail: roleHasChanges.value ? 'Requiere revisión y motivo' : 'Sin edición pendiente',
      state: roleHasChanges.value ? 'incomplete' : 'none'
    }
  ] as Array<{ key: string; title: string; detail: string; state: AccessState }>
})

const caseWarnings = computed(() => {
  const user = selectedUser.value
  if (!user) return []
  const warnings: string[] = []
  if (user.audience === 'internal' && !user.adminScopes.length && !user.productScopes.length) {
    warnings.push('La cuenta parece interna, pero no tiene puesto, alcance o responsabilidad administrativa visible.')
  }
  if (user.productScopes.length && user.adminScopes.length) {
    warnings.push('La cuenta mezcla acceso familiar y responsabilidades administrativas. Verifica que sea intencional y que no exponga datos fuera de su función.')
  }
  if (hasInheritedAdminAccess(user)) {
    warnings.push('Hay acceso administrativo heredado por rutas o configuración anterior. Retirar un rol explícito puede no quitar todo el acceso efectivo.')
  }
  if (roleDraft.value.daycareAdmin && !roleUnidadDraft.value.length) {
    warnings.push('Administración de guardería no puede guardarse sin unidades autorizadas.')
  }
  return warnings
})

const identityFacts = computed(() => {
  const user = selectedUser.value
  if (!user) return []
  return [
    {
      label: 'Tipo de cuenta',
      value: accountTypeLabel(user),
      detail: personKindDetail(user)
    },
    {
      label: 'Identificador de inicio',
      value: accountLabel(user),
      detail: user.email ? 'Correo de la cuenta' : user.username ? 'Usuario o matrícula registrada' : 'Solo ID interno'
    },
    {
      label: 'Alcance detectado',
      value: primaryScopeLabel(user),
      detail: contextDetail(user)
    },
    {
      label: 'Responsabilidad administrativa',
      value: adminAccessLabel(user),
      detail: adminAccessDetail(user)
    }
  ]
})

const relationshipRows = computed<AccessLine[]>(() => {
  const user = selectedUser.value
  if (!user) return []
  const rows: AccessLine[] = []
  rows.push({
    key: 'internal-account',
    title: 'Cuenta interna o staff',
    detail: user.audience === 'internal' || user.adminScopes.length ? internalAccountDetail(user) : 'No se detecta como cuenta de staff o soporte.',
    state: user.audience === 'internal' || user.adminScopes.length ? 'active' : 'none',
    label: user.audience === 'internal' || user.adminScopes.length ? 'Detectada' : 'No'
  })
  rows.push({
    key: 'school-family-link',
    title: 'Vínculo familiar escolar',
    detail: user.productScopes.includes('personasAutorizadas') ? schoolFamilyDetail(user) : 'No hay alumno o persona autorizada vinculada a esta cuenta.',
    state: user.productScopes.includes('personasAutorizadas') ? 'family' : 'none',
    label: user.productScopes.includes('personasAutorizadas') ? 'Activo' : 'No'
  })
  rows.push({
    key: 'daycare-family-link',
    title: 'Vínculo familiar de guardería',
    detail: user.productScopes.includes('daycare') ? daycareFamilyDetail(user) : 'No hay sala o unidad familiar vinculada a esta cuenta.',
    state: user.productScopes.includes('daycare') ? 'family' : 'none',
    label: user.productScopes.includes('daycare') ? 'Activo' : 'No'
  })
  return rows
})

const accessGroups = computed(() => selectedUser.value ? accessGroupsForUser(selectedUser.value) : [])

const changePreviewLines = computed(() => {
  const user = selectedUser.value
  if (!user || !roleHasChanges.value) return ['No hay cambios pendientes.']
  const current = user.roleAssignments || emptyRoleAssignments()
  const lines: string[] = []
  for (const role of assignableRoles) {
    const before = Boolean(current[role.key])
    const after = Boolean(roleDraft.value[role.key])
    if (before !== after) {
      lines.push(`${role.label}: ${after ? `se activará (${role.impact})` : 'se retirará el rol explícito'}.`)
    }
  }
  const currentUnits = normalizedRoleUnits(user.unidad || [])
  const draftUnits = normalizedRoleUnits(roleUnidadDraft.value)
  if (roleDraft.value.daycareAdmin && currentUnits.join('|') !== draftUnits.join('|')) {
    lines.push(`Alcance de guardería: ${draftUnits.length ? draftUnits.join(' · ') : 'sin unidades seleccionadas'}.`)
  }
  if (hasInheritedAdminAccess(user)) {
    lines.push('Revisa acceso heredado: algunas rutas antiguas pueden seguir otorgando permisos aunque se retire un rol explícito.')
  }
  return lines.length ? lines : ['No hay cambios pendientes.']
})

const changePreviewTitle = computed(() => {
  if (!roleHasChanges.value) return 'No se guardará nada hasta modificar una responsabilidad.'
  if (roleDraft.value.daycareAdmin && !roleUnidadDraft.value.length) return 'El cambio está incompleto: falta seleccionar unidad de guardería.'
  if (roleChangeReason.value.trim().length < 12) return 'Escribe el motivo antes de guardar el cambio.'
  return 'Se enviará este cambio con motivo de soporte interno.'
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
      ? 'Escribe un motivo claro antes de guardar el cambio de acceso.'
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
    actionNotice.value = 'Cambio de acceso guardado.'
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible guardar el cambio de acceso.'
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
  if (scope === 'daycare') return 'familia de guardería'
  if (scope === 'personasAutorizadas') return 'familia escolar'
  return scope
}

function accountTypeLabel(user: SuperAdminUserSummary) {
  if (user.audience === 'multiProductFamily') return 'Familia con acceso escolar y guardería'
  if (user.audience === 'daycareFamily') return 'Familia de guardería'
  if (user.audience === 'schoolFamily') return 'Familia escolar'
  if (user.audience === 'internal') return 'Cuenta interna o staff'
  return 'Cuenta sin vínculo clasificado'
}

function relationshipSummary(user: SuperAdminUserSummary) {
  const values: string[] = []
  if (user.audience === 'internal' || user.adminScopes.length) values.push('interna')
  if (user.productScopes.includes('personasAutorizadas')) values.push('familia escolar')
  if (user.productScopes.includes('daycare')) values.push('familia guardería')
  return values.length ? values.join(' · ') : 'sin vínculo detectado'
}

function personKindDetail(user: SuperAdminUserSummary) {
  if (user.productScopes.length) return `Vínculo familiar: ${user.productScopes.map(productScopeLabel).join(' · ')}`
  if (user.adminScopes.length) return adminAccessLabel(user)
  if (user.audience === 'internal') return 'Cuenta interna sin responsabilidad administrativa visible'
  return 'No se encontró vínculo familiar, puesto interno o rol administrativo'
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
  if (user.unidad.length) return 'Unidad tomada de la cuenta'
  return 'No hay sala, plantel, grupo o unidad asociada'
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
  return labels.length ? labels.join(' · ') : 'Sin responsabilidad administrativa'
}

function adminAccessDetail(user: SuperAdminUserSummary) {
  if (adminAccessLabel(user) === 'Sin responsabilidad administrativa') {
    return user.audience === 'internal' ? 'Puede recibir una responsabilidad si su puesto lo requiere.' : 'No es cuenta administrativa.'
  }
  if (hasInheritedAdminAccess(user)) return 'Incluye permisos heredados por rutas o configuración anterior.'
  return 'Responsabilidades administrativas activas.'
}

function internalAccountDetail(user: SuperAdminUserSummary) {
  if (user.email?.toLowerCase().endsWith('@casitaiedis.edu.mx')) return 'Correo institucional registrado.'
  if (user.adminScopes.length) return 'Tiene responsabilidades administrativas activas.'
  if (user.role) return 'Tiene rol legacy registrado.'
  return 'Cuenta marcada como interna por datos de sesión.'
}

function daycareFamilyDetail(user: SuperAdminUserSummary) {
  const parts = [primaryScopeLabel(user)]
  if (user.sala) parts.push(`Sala ${user.sala}`)
  if (user.nombre_nino) parts.push(user.nombre_nino)
  return parts.filter(Boolean).join(' · ')
}

function schoolFamilyDetail(user: SuperAdminUserSummary) {
  return user.nombre_nino ? `Alumno vinculado: ${user.nombre_nino}` : primaryScopeLabel(user)
}

function daycareAdminCurrentDetail(user: SuperAdminUserSummary) {
  if (!user.unidad.length) return 'El rol existe, pero no hay unidad autorizada.'
  return `Unidades autorizadas: ${user.unidad.join(' · ')}.`
}

function communicationsDetail(user: SuperAdminUserSummary) {
  if (user.communicationsScopes.length) return `${user.communicationsScopes.length} alcance(s) específico(s) de comunicados configurado(s).`
  if (user.roleAssignments.communicationsAdmin) return 'Rol explícito activo; revisar alcances de publicación si necesita enviar.'
  return 'Acceso detectado por alcance o ruta existente.'
}

function historyAccessDetail(user: SuperAdminUserSummary) {
  return user.roleAssignments.accessHistoryAdmin ? 'Rol explícito activo para historial y diagnósticos.' : 'Acceso heredado por ruta o configuración anterior.'
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

function currentAccessLines(user: SuperAdminUserSummary) {
  return accessGroupsForUser(user).flatMap((group) => group.items)
}

function accessGroupsForUser(user: SuperAdminUserSummary) {
  const familyItems: AccessLine[] = [
    {
      key: 'school-family',
      title: 'Portal familiar escolar',
      detail: user.productScopes.includes('personasAutorizadas') ? schoolFamilyDetail(user) : 'No puede abrir herramientas familiares escolares.',
      state: user.productScopes.includes('personasAutorizadas') ? 'family' : 'none',
      label: user.productScopes.includes('personasAutorizadas') ? 'Activo' : 'Sin vínculo'
    },
    {
      key: 'daycare-family',
      title: 'Portal familiar de guardería',
      detail: user.productScopes.includes('daycare') ? daycareFamilyDetail(user) : 'No puede abrir avisos, tareas o calendario familiar de guardería.',
      state: user.productScopes.includes('daycare') ? 'family' : 'none',
      label: user.productScopes.includes('daycare') ? 'Activo' : 'Sin vínculo'
    }
  ]

  const adminItems: AccessLine[] = [
    {
      key: 'school-admin',
      title: 'Administración escolar',
      detail: user.adminScopes.includes('gestionEscolar') ? 'Gestiona familias y publicaciones según alcance escolar configurado.' : 'No tiene alcance escolar administrativo.',
      state: user.adminScopes.includes('gestionEscolar') ? 'active' : 'none',
      label: user.adminScopes.includes('gestionEscolar') ? 'Activo' : 'Sin rol'
    },
    {
      key: 'daycare-admin',
      title: 'Administración de guardería',
      detail: user.adminScopes.includes('daycare') ? daycareAdminCurrentDetail(user) : 'No administra salas o unidades de guardería.',
      state: user.adminScopes.includes('daycare') ? (user.unidad.length ? 'active' : 'incomplete') : 'none',
      label: user.adminScopes.includes('daycare') ? (user.unidad.length ? 'Activo' : 'Falta alcance') : 'Sin rol'
    },
    {
      key: 'communications',
      title: 'Comunicados administrativos',
      detail: user.adminScopes.includes('communications') ? communicationsDetail(user) : 'No puede preparar comunicados administrativos.',
      state: user.adminScopes.includes('communications') ? 'active' : 'none',
      label: user.adminScopes.includes('communications') ? 'Activo' : 'Sin rol'
    },
    {
      key: 'security',
      title: 'Historial y diagnósticos',
      detail: user.adminScopes.includes('accessHistory') ? historyAccessDetail(user) : 'No puede consultar registros de acceso o diagnósticos.',
      state: user.adminScopes.includes('accessHistory') ? 'active' : 'none',
      label: user.adminScopes.includes('accessHistory') ? 'Activo' : 'Sin rol'
    }
  ]

  return [
    { key: 'family', title: 'Acceso familiar', description: 'Relaciones con alumnos, familias, salas y portales de padres.', items: familyItems },
    { key: 'administrative', title: 'Responsabilidades internas', description: 'Permisos concedidos a staff, soporte o administradores.', items: adminItems }
  ]
}

function primaryAccessState(user: SuperAdminUserSummary) {
  if (user.adminScopes.length) {
    const incomplete = user.adminScopes.includes('daycare') && !user.unidad.length
    return incomplete ? { state: 'incomplete' as const, label: 'Admin sin alcance' } : { state: 'active' as const, label: 'Admin' }
  }
  if (user.productScopes.length) return { state: 'family' as const, label: 'Familia' }
  if (user.audience === 'internal') return { state: 'none' as const, label: 'Interna sin responsabilidad' }
  return { state: 'unknown' as const, label: 'Revisar vínculo' }
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
.access-console {
  display: grid;
  gap: 16px;
}

.page-intro,
.directory-pane,
.case-pane,
.state-panel {
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid #dce5eb;
  border-radius: 16px;
  box-shadow: 0 12px 34px rgba(15, 23, 42, 0.055);
}

.page-intro {
  align-items: end;
  display: flex;
  gap: 18px;
  justify-content: space-between;
  padding: clamp(18px, 2.2vw, 26px);
}

.kicker {
  color: #526173;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.11em;
  margin: 0 0 4px;
  text-transform: uppercase;
}

.page-intro h1,
.directory-title h2,
.case-header h2,
.section-heading h3,
.risk-panel h3,
.support-section h3,
.state-panel h2,
.access-group h4,
.review-panel h4 {
  color: #152032;
  margin: 0;
}

.page-intro h1 {
  font-family: var(--font-body);
  font-size: clamp(2rem, 3vw, 2.75rem);
  letter-spacing: -0.035em;
}

.page-intro p:not(.kicker),
.case-header p,
.section-heading p,
.risk-panel p,
.support-section p,
.access-group p,
.locked-note,
.review-panel p,
.review-panel li,
.reason-field small {
  color: #627386;
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

.access-workspace {
  align-items: start;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(340px, 430px) minmax(0, 1fr);
}

.directory-pane,
.case-pane {
  align-content: start;
  display: grid;
  gap: 14px;
  padding: 14px;
}

.directory-pane {
  position: sticky;
  top: calc(var(--topbar-height) + 18px);
}

.directory-title,
.section-heading,
.case-status {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.directory-title > span,
.section-heading > span,
.case-status small {
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
.filter-row select,
.reason-field textarea {
  color: #152032;
  font: inherit;
  min-width: 0;
  outline: 0;
}

.directory-search input,
.filter-row select {
  background: transparent;
  border: 0;
}

.search-submit,
.inline-link {
  background: #ffffff;
  border: 1px solid #cfe0e7;
  border-radius: 10px;
  color: #0d766d;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 850;
  min-height: 34px;
  padding: 0 11px;
}

.inline-link {
  align-items: center;
  display: inline-flex;
  justify-content: center;
  min-height: 36px;
  text-align: center;
}

.filter-row,
.directory-summary,
.identity-layout,
.access-groups,
.role-grid,
.sensitive-grid {
  display: grid;
  gap: 8px;
}

.filter-row,
.role-grid,
.sensitive-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.filter-row label,
.directory-summary div,
.fact-list div,
.relationship-list article,
.access-group,
.role-card,
.scope-picker,
.review-panel {
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
.directory-summary dt,
.fact-list dt,
.relationship-list span,
.row-tags small,
.reason-field span {
  color: #6b7a8b;
  font-size: 0.72rem;
  font-weight: 850;
}

.directory-summary {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.directory-summary div {
  display: grid;
  gap: 1px;
  min-height: 48px;
  padding: 8px 10px;
}

.directory-summary dt,
.directory-summary dd {
  margin: 0;
}

.directory-summary dd {
  color: #152032;
  font-size: 1rem;
  font-weight: 900;
}

.people-list {
  display: grid;
  gap: 6px;
  max-height: calc(100vh - 352px);
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
  grid-template-columns: 42px minmax(0, 1fr) minmax(126px, auto);
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
.row-tags,
.case-header > div,
.case-status {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.person-copy strong,
.person-copy small,
.row-tags small,
.fact-list dd,
.fact-list small,
.case-header h2,
.case-header p,
.case-status small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.person-copy strong {
  color: #152032;
  font-size: 0.9rem;
}

.person-copy small,
.fact-list small,
.relationship-list p,
.access-line span,
.role-card p,
.scope-picker p {
  color: #667789;
  font-size: 0.78rem;
  line-height: 1.45;
  margin: 0;
}

.row-tags,
.case-status {
  justify-items: end;
}

.row-tags b,
.case-status span,
.access-line b,
.assignment-section .section-heading > span,
.review-panel .section-heading > span {
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

.case-header {
  align-items: center;
  border-bottom: 1px solid #e4ebf0;
  display: grid;
  gap: 14px;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  padding-bottom: 14px;
}

.case-header h2 {
  font-family: var(--font-body);
  font-size: clamp(1.45rem, 2.1vw, 2rem);
}

.case-status {
  align-items: end;
}

.case-steps {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  list-style: none;
  margin: 0;
  padding: 0;
}

.case-steps li {
  background: #fbfcfd;
  border: 1px solid #dce5eb;
  border-radius: 13px;
  display: grid;
  gap: 4px;
  padding: 11px;
}

.case-steps strong,
.relationship-list strong,
.access-line strong,
.role-card strong {
  color: #152032;
}

.case-steps span {
  color: #627386;
  font-size: 0.76rem;
  line-height: 1.35;
}

.risk-panel,
.identity-section,
.access-section,
.assignment-section,
.support-section {
  border: 1px solid #e1e8ed;
  border-radius: 15px;
  display: grid;
  gap: 12px;
  padding: 14px;
}

.risk-panel {
  background: #fffaf0;
  border-color: #f3d589;
  grid-template-columns: minmax(220px, 0.8fr) minmax(0, 1.2fr);
}

.risk-panel ul,
.review-panel ul {
  margin: 0;
  padding-left: 18px;
}

.risk-panel li {
  color: #6b5608;
  line-height: 1.45;
}

.section-heading.split,
.compact-heading {
  align-items: start;
}

.identity-layout {
  grid-template-columns: minmax(240px, 0.92fr) minmax(0, 1.08fr);
}

.fact-list,
.relationship-list,
.access-lines {
  display: grid;
  gap: 8px;
  margin: 0;
}

.fact-list div {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 12px;
}

.fact-list dd {
  color: #152032;
  font-weight: 900;
  margin: 0;
}

.relationship-list article,
.access-line {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 12px;
}

.relationship-list article[data-state],
.access-line[data-state],
.role-card[data-state] {
  color: inherit;
}

.access-groups {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.access-group {
  display: grid;
  gap: 10px;
  padding: 12px;
}

.access-group h4,
.review-panel h4 {
  font-family: var(--font-body);
  font-size: 1.02rem;
}

.access-line {
  background: #ffffff;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
}

.role-card {
  align-items: start;
  display: grid;
  gap: 10px;
  min-height: 112px;
  padding: 12px;
}

.role-card.selectable {
  cursor: pointer;
  grid-template-columns: auto minmax(0, 1fr);
}

.role-card input {
  accent-color: #0d766d;
  margin-top: 3px;
}

.school-role {
  grid-template-columns: minmax(0, 1fr) auto;
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

.review-panel {
  display: grid;
  gap: 12px;
  padding: 12px;
}

.reason-field {
  display: grid;
  gap: 6px;
}

.reason-field textarea {
  background: #ffffff;
  border: 1px solid #dce5eb;
  border-radius: 12px;
  min-height: 84px;
  padding: 10px 12px;
  resize: vertical;
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
  .identity-layout,
  .access-groups,
  .case-steps {
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
  .page-intro,
  .head-actions,
  .directory-title,
  .section-heading,
  .risk-panel,
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
  .directory-summary,
  .case-header,
  .person-row,
  .relationship-list article,
  .access-line,
  .role-grid,
  .sensitive-grid,
  .school-role,
  .support-section {
    grid-template-columns: 1fr;
  }

  .row-tags,
  .case-status {
    align-items: start;
    justify-items: start;
  }
}
</style>
