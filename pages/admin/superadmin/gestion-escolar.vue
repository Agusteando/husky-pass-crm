<template>
  <section class="school-access-page" data-product-area="superadmin" data-product-screen="school-access-assignment">
    <header class="access-header">
      <div>
        <p class="eyebrow">Super Admin</p>
        <h1>Acceso escolar</h1>
      </div>
      <div class="header-actions">
        <NuxtLink class="btn btn-secondary" to="/admin/superadmin">Cuentas</NuxtLink>
        <NuxtLink class="btn btn-secondary" to="/admin/historial-accesos">Auditoría</NuxtLink>
        <button class="btn btn-primary" type="button" :disabled="directoryLoading" @click="refreshUsers">
          {{ directoryLoading ? 'Actualizando...' : 'Actualizar' }}
        </button>
      </div>
    </header>

    <section class="access-console">
      <aside class="review-queue" aria-label="Cuentas para acceso escolar">
        <div class="queue-title">
          <div>
            <span>Revisión escolar</span>
            <strong>{{ users.length }} cuentas</strong>
          </div>
          <b>{{ queueStats.pending }} por resolver</b>
        </div>

        <form class="searchbar" role="search" @submit.prevent="refreshUsers">
          <FamilyPersonasIcon name="search" />
          <input v-model="search" type="search" placeholder="Nombre, correo o matrícula" aria-label="Buscar cuenta" />
          <button type="submit" :disabled="directoryLoading">Buscar</button>
        </form>

        <div class="queue-tabs" aria-label="Filtro de revisión">
          <button type="button" :class="{ active: queueMode === 'review' }" @click="queueMode = 'review'">
            <strong>{{ queueStats.pending }}</strong>
            <span>Revisar</span>
          </button>
          <button type="button" :class="{ active: queueMode === 'active' }" @click="queueMode = 'active'">
            <strong>{{ queueStats.active }}</strong>
            <span>Activos</span>
          </button>
          <button type="button" :class="{ active: queueMode === 'all' }" @click="queueMode = 'all'">
            <strong>{{ users.length }}</strong>
            <span>Todas</span>
          </button>
        </div>

        <div v-if="directoryLoading" class="state-card compact" data-state="loading">
          <HuskyPassLoader label="Cuentas" compact />
        </div>
        <div v-else-if="loadError" class="state-card compact" data-state="error">No disponible</div>
        <div v-else class="queue-list">
          <button
            v-for="user in visibleUsers"
            :key="user.id"
            class="queue-row"
            type="button"
            :class="{ active: selectedUser?.id === user.id }"
            :data-state="queueState(user).state"
            @click="selectUser(user)"
          >
            <span class="avatar">{{ initials(user) }}</span>
            <span class="queue-copy">
              <strong>{{ displayName(user) }}</strong>
              <small>{{ user.email || user.username || `ID ${user.id}` }}</small>
            </span>
            <b>{{ queueState(user).label }}</b>
          </button>
          <div v-if="!visibleUsers.length" class="state-card compact" data-state="empty">Sin cuentas en esta vista</div>
        </div>
      </aside>

      <main v-if="selectedUser" class="assignment-workbench">
        <section class="account-strip" :data-state="draftStage">
          <span class="avatar large">{{ initials(selectedUser) }}</span>
          <div class="account-copy">
            <p class="eyebrow">Cuenta interna</p>
            <h2>{{ displayName(selectedUser) }}</h2>
            <small>{{ selectedUser.email || selectedUser.username || `ID ${selectedUser.id}` }}</small>
          </div>
          <div class="account-status">
            <strong>{{ queueState(selectedUser).label }}</strong>
            <span>{{ currentScopeLabel }}</span>
          </div>
        </section>

        <section class="step-strip" aria-label="Flujo de acceso escolar">
          <article :data-state="draftCapabilities.length ? 'done' : 'current'">
            <span>1</span>
            <strong>Rol</strong>
          </article>
          <article :data-state="draftPlanteles.length ? 'done' : draftCapabilities.length ? 'current' : 'locked'">
            <span>2</span>
            <strong>Plantel y grupo</strong>
          </article>
          <article :data-state="canSave ? 'done' : draftPlanteles.length ? 'current' : 'locked'">
            <span>3</span>
            <strong>Activación</strong>
          </article>
        </section>

        <section class="editor-section">
          <header class="section-title">
            <h2>Rol escolar</h2>
            <span>{{ selectedProfileLabel }}</span>
          </header>

          <div class="role-grid" role="radiogroup" aria-label="Rol escolar">
            <button
              v-for="profile in profileCards"
              :key="profile.key"
              type="button"
              role="radio"
              class="role-card"
              :aria-checked="selectedProfile === profile.key"
              :class="{ active: selectedProfile === profile.key }"
              :disabled="saving"
              @click="applyProfile(profile.key)"
            >
              <strong>{{ profile.title }}</strong>
              <small>{{ profile.detail }}</small>
            </button>
          </div>
        </section>

        <section class="editor-section">
          <header class="section-title">
            <h2>Dónde aplica</h2>
            <button class="mini-button" type="button" :disabled="saving" @click="addScope()">Agregar plantel</button>
          </header>

          <div class="scope-list" aria-label="Planteles y grupos asignados">
            <article v-for="(assignment, index) in assignments" :key="assignment.uid" class="scope-row" :data-state="assignment.scope.plantel ? 'ready' : 'missing'">
              <header>
                <span>{{ index + 1 }}</span>
                <div>
                  <strong>{{ assignment.scope.plantel ? formatGestionScope(assignment.scope) : 'Selecciona plantel' }}</strong>
                  <small>{{ profileLabelFor(assignment.capabilities) }}</small>
                </div>
                <button class="icon-button" type="button" :disabled="saving || assignments.length <= 1" aria-label="Quitar plantel" @click="removeScope(index)">
                  <FamilyPersonasIcon name="trash" />
                </button>
              </header>

              <AdminGestionScopePicker
                v-model="assignment.scope"
                :scope-tree="normalizedOptions.scopeTree"
                :options="normalizedOptions"
                :disabled="saving"
                compact
              />

              <details class="manual-permissions" :open="selectedProfile === 'custom'">
                <summary>Permisos incluidos</summary>
                <div class="permission-chips">
                  <button
                    v-for="capability in capabilityOptions"
                    :key="capability.value"
                    type="button"
                    class="permission-chip"
                    :class="{ active: assignment.capabilities.includes(capability.value) }"
                    :disabled="saving"
                    @click="toggleCapability(assignment, capability.value)"
                  >
                    {{ capability.label }}
                  </button>
                </div>
              </details>
            </article>
          </div>
        </section>
      </main>

      <aside v-if="selectedUser" class="impact-panel" aria-label="Impacto del acceso escolar">
        <header class="impact-head" :data-state="impactState">
          <span>Impacto</span>
          <strong>{{ impactHeadline }}</strong>
        </header>

        <section class="impact-block">
          <h2>Se activará</h2>
          <div class="impact-list">
            <article v-for="item in outcomeItems" :key="item.label" :data-active="item.active">
              <span>{{ item.label }}</span>
              <b>{{ item.detail }}</b>
            </article>
          </div>
        </section>

        <section class="impact-block compact">
          <h2>Planteles</h2>
          <div v-if="draftPlanteles.length" class="selected-scopes">
            <span v-for="plantel in draftPlanteles" :key="plantel">{{ plantel }}</span>
          </div>
          <p v-else class="empty-note">Pendiente</p>
        </section>

        <section v-if="blockers.length" class="blocker-list" aria-label="Pendientes antes de guardar">
          <article v-for="blocker in blockers" :key="blocker">{{ blocker }}</article>
        </section>

        <label class="reason-box">
          <span>Motivo</span>
          <textarea v-model="changeReason" rows="3" maxlength="500" placeholder="Ej. Solicitud autorizada por Dirección para gestión familiar en IEIDS." />
        </label>

        <p v-if="actionError" class="action-message error">{{ actionError }}</p>
        <p v-else-if="actionNotice" class="action-message">{{ actionNotice }}</p>

        <div class="impact-actions">
          <button v-if="selectedUser.gestionEscolar.enabled" class="btn btn-secondary danger" type="button" :disabled="saving || !reasonValid" @click="disablePermissions">Desactivar</button>
          <button class="btn btn-secondary" type="button" :disabled="saving" @click="selectUser(selectedUser)">Restaurar</button>
          <button class="btn btn-primary" type="button" :disabled="saving || !canSave" @click="savePermissions">
            {{ saving ? 'Guardando...' : saveLabel }}
          </button>
        </div>
      </aside>

      <section v-else class="empty-selection">
        <FamilyPersonasIcon name="school" />
        <h2>Selecciona una cuenta</h2>
        <p>El rol, plantel e impacto aparecerán aquí.</p>
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useFetch, useRoute, useRouter } from 'nuxt/app'
import type { GestionEscolarAccessProfileKey, GestionEscolarAssignmentState, GestionEscolarCapability, GestionEscolarPermissionInput, GestionEscolarPermissionSummary, GestionEscolarScope, GestionEscolarScopeTree, GestionEscolarScopeTreeNode } from '~/types/gestionEscolar'
import { GESTION_ACCESS_PROFILES, GESTION_CAPABILITY_LABELS, GESTION_CAPABILITY_ORDER, formatGestionScope, gestionProfileLabel, normalizeGestionCapabilities, resolveGestionProfile } from '~/utils/gestionEscolar'

definePageMeta({ layout: 'admin', middleware: ['admin', 'superadmin'] })

type Options = { planteles: string[]; niveles: string[]; grados: string[]; grupos: string[]; scopeTree: GestionEscolarScopeTree }
type CockpitUser = {
  id: number
  email: string | null
  username: string | null
  displayName: string | null
  gestionEscolar: GestionEscolarPermissionSummary
}
type CockpitResponse = {
  users: CockpitUser[]
  planteles: string[]
  options?: Options
  metrics: { total: number; enabled: number; scoped: number; global: number; legacyCommunications: number }
}
type ScopeAssignment = {
  uid: string
  scope: GestionEscolarScope
  capabilities: GestionEscolarCapability[]
}
type QueueMode = 'review' | 'active' | 'all'

type ProfileCard = {
  key: Exclude<GestionEscolarAccessProfileKey, 'custom'>
  title: string
  detail: string
}

const route = useRoute()
const router = useRouter()
const search = ref(typeof route.query.buscar === 'string' ? route.query.buscar : '')
const queueMode = ref<QueueMode>('review')
const query = computed(() => ({ search: search.value, limit: 160 }))
const { data, pending, error: loadError, refresh } = useFetch<CockpitResponse>('/api/admin/superadmin/gestion-escolar/users', { query, timeout: 15000 })
const selectedUser = ref<CockpitUser | null>(null)
const assignments = ref<ScopeAssignment[]>([])
const selectedProfile = ref<GestionEscolarAccessProfileKey>('operator')
const saving = ref(false)
const actionNotice = ref('')
const actionError = ref('')
const changeReason = ref('')

const capabilityOptions = GESTION_CAPABILITY_ORDER.map((value) => ({ value, label: GESTION_CAPABILITY_LABELS[value] }))
const profileCards: ProfileCard[] = [
  { key: 'support', title: 'Soporte familias', detail: 'Consulta y vista familiar' },
  { key: 'operator', title: 'Atención familias', detail: 'Familias + borradores' },
  { key: 'publisher', title: 'Publicación', detail: 'Publica avisos y convenios' },
  { key: 'content', title: 'Encuestas y convenios', detail: 'Formularios y documentos' },
  { key: 'full', title: 'Administrador escolar', detail: 'Todos los módulos' }
]

const profiles = GESTION_ACCESS_PROFILES
const users = computed(() => data.value?.users || [])
const directoryLoading = computed(() => pending.value || (!data.value && !loadError.value))
const rawOptions = computed<Options>(() => ({
  planteles: data.value?.options?.planteles || data.value?.planteles || [],
  niveles: data.value?.options?.niveles || [],
  grados: data.value?.options?.grados || [],
  grupos: data.value?.options?.grupos || [],
  scopeTree: data.value?.options?.scopeTree || { planteles: [] }
}))
const normalizedOptions = computed<Options>(() => normalizeOptions(rawOptions.value))
const activeAssignments = computed(() => assignments.value.filter((assignment) => assignment.scope.plantel && assignment.capabilities.length))
const draftPlanteles = computed(() => Array.from(new Set(activeAssignments.value.map((assignment) => labelForPlantel(String(assignment.scope.plantel || '').trim())).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es')))
const draftCapabilities = computed(() => Array.from(new Set(activeAssignments.value.flatMap((assignment) => assignment.capabilities))))
const draftValid = computed(() => activeAssignments.value.length > 0 && activeAssignments.value.every((assignment) => assignment.scope.plantel && assignment.capabilities.length))
const hasChanges = computed(() => selectedUser.value ? permissionSignature(selectedUser.value.gestionEscolar.permissions) !== permissionSignature(buildPermissions()) : false)
const reasonValid = computed(() => changeReason.value.trim().length >= 12)
const canSave = computed(() => draftValid.value && hasChanges.value && reasonValid.value)
const draftStage = computed<GestionEscolarAssignmentState>(() => draftValid.value ? 'active' : selectedUser.value?.gestionEscolar.state === 'incomplete' ? 'incomplete' : 'none')
const selectedProfileLabel = computed(() => selectedProfile.value === 'custom' ? 'Personalizado' : profileCards.find((profile) => profile.key === selectedProfile.value)?.title || 'Rol escolar')
const currentScopeLabel = computed(() => selectedUser.value?.gestionEscolar.reach.planteles.length ? selectedUser.value.gestionEscolar.reach.planteles.map(labelForPlantel).join(' · ') : 'Sin plantel')
const saveLabel = computed(() => selectedUser.value?.gestionEscolar.enabled ? 'Guardar cambios' : 'Activar acceso escolar')
const visibleUsers = computed(() => {
  if (queueMode.value === 'active') return users.value.filter((user) => user.gestionEscolar.state === 'active')
  if (queueMode.value === 'review') return users.value.filter((user) => user.gestionEscolar.state !== 'active')
  return users.value
})
const queueStats = computed(() => ({
  pending: users.value.filter((user) => user.gestionEscolar.state !== 'active').length,
  active: users.value.filter((user) => user.gestionEscolar.state === 'active').length
}))
const impactState = computed(() => {
  if (canSave.value) return 'ready'
  if (!hasChanges.value) return 'idle'
  return 'blocked'
})
const impactHeadline = computed(() => {
  if (!draftCapabilities.value.length) return 'Elige rol'
  if (!draftPlanteles.value.length) return 'Elige plantel'
  if (!hasChanges.value) return 'Sin cambios'
  if (!reasonValid.value) return 'Motivo requerido'
  return selectedUser.value?.gestionEscolar.enabled ? 'Cambios listos' : 'Listo para activar'
})
const blockers = computed(() => {
  const items: string[] = []
  if (!draftCapabilities.value.length) items.push('Elige un rol escolar.')
  if (!draftPlanteles.value.length) items.push('Agrega al menos un plantel.')
  if (activeAssignments.value.length !== assignments.value.length) items.push('Completa o elimina planteles pendientes.')
  if (!hasChanges.value) items.push('No hay cambios pendientes.')
  if (hasChanges.value && !reasonValid.value) items.push('Agrega un motivo de cambio.')
  return items
})
const outcomeItems = computed(() => {
  const capabilities = new Set(draftCapabilities.value)
  const scope = draftPlanteles.value.length ? `${draftPlanteles.value.length} plantel${draftPlanteles.value.length === 1 ? '' : 'es'}` : '—'
  return [
    { label: 'Familias', detail: capabilities.has('familias.view') ? scope : 'No incluido', active: capabilities.has('familias.view') && draftValid.value },
    { label: 'Vista familiar', detail: capabilities.has('familias.impersonate') ? scope : 'No incluido', active: capabilities.has('familias.impersonate') && draftValid.value },
    { label: 'Comunicados', detail: capabilities.has('comunicados.publish') ? 'Publicar' : capabilities.has('comunicados.create') ? 'Borradores' : 'No incluido', active: capabilities.has('comunicados.create') && draftValid.value },
    { label: 'Encuestas', detail: capabilities.has('encuestas.manage') ? scope : 'No incluido', active: capabilities.has('encuestas.manage') && draftValid.value },
    { label: 'Convenios', detail: capabilities.has('convenios.publish') ? 'Publicar' : capabilities.has('convenios.manage') ? 'Borradores' : 'No incluido', active: capabilities.has('convenios.manage') && draftValid.value }
  ]
})

watch(users, (items) => {
  const requestedId = Number(route.query.usuario || 0)
  const requested = requestedId ? items.find((user) => user.id === requestedId) : null
  if (requested) {
    selectUser(requested, false)
    return
  }
  if (!selectedUser.value && items.length) selectUser(items[0])
})

onMounted(() => {
  if (selectedUser.value || !users.value.length) return
  const requestedId = Number(route.query.usuario || 0)
  const requested = requestedId ? users.value.find((user) => user.id === requestedId) : null
  selectUser(requested || visibleUsers.value[0] || users.value[0])
})

watch(() => route.query.usuario, (value) => {
  const id = Number(value || 0)
  if (!id) return
  const user = users.value.find((item) => item.id === id)
  if (user) selectUser(user, false)
})

watch(visibleUsers, (items) => {
  if (!items.length || selectedUser.value && items.some((item) => item.id === selectedUser.value?.id)) return
  selectUser(items[0])
})

function displayName(user: CockpitUser) {
  return user.displayName || user.email || user.username || `Usuario ${user.id}`
}

function initials(user: CockpitUser) {
  return displayName(user).split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'HP'
}

function queueState(user: CockpitUser) {
  if (user.gestionEscolar.state === 'active') return { state: 'active', label: user.gestionEscolar.reach.planteles.length ? `${user.gestionEscolar.reach.planteles.length} plantel${user.gestionEscolar.reach.planteles.length === 1 ? '' : 'es'}` : 'Activo' }
  if (user.gestionEscolar.state === 'incomplete') return { state: 'incomplete', label: 'Falta plantel' }
  return { state: 'none', label: 'Sin rol escolar' }
}

function assignmentUid() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
}

function defaultCapabilities() {
  const profile = profiles.find((item) => item.key === selectedProfile.value) || profiles.find((item) => item.key === 'operator')
  return normalizeGestionCapabilities(profile?.capabilities || ['familias.view'])
}

function blankAssignment(scope: GestionEscolarScope = {}): ScopeAssignment {
  return {
    uid: assignmentUid(),
    scope: { isGlobal: false, plantel: scope.plantel || null, nivel: scope.nivel || null, grado: scope.grado || null, grupo: scope.grupo || null },
    capabilities: defaultCapabilities()
  }
}

function permissionScopeKey(permission: GestionEscolarPermissionInput) {
  return [permission.plantel || '', permission.nivel || '', permission.grado || '', permission.grupo || ''].join('|')
}

function assignmentsFromPermissions(permissions: GestionEscolarPermissionInput[]) {
  const map = new Map<string, ScopeAssignment>()
  for (const permission of permissions) {
    if (permission.isGlobal || !permission.plantel) continue
    const key = permissionScopeKey(permission)
    const current = map.get(key) || {
      uid: assignmentUid(),
      scope: { isGlobal: false, plantel: permission.plantel || null, nivel: permission.nivel || null, grado: permission.grado || null, grupo: permission.grupo || null },
      capabilities: []
    }
    current.capabilities = normalizeGestionCapabilities([...current.capabilities, permission.capability])
    map.set(key, current)
  }
  return Array.from(map.values())
}

function selectUser(user: CockpitUser | null, updateRoute = true) {
  if (!user) return
  selectedUser.value = user
  const nextAssignments = assignmentsFromPermissions(user.gestionEscolar.permissions)
  assignments.value = nextAssignments.length ? nextAssignments : [blankAssignment()]
  selectedProfile.value = resolveGestionProfile(Array.from(new Set(assignments.value.flatMap((assignment) => assignment.capabilities))))
  if (selectedProfile.value === 'custom' && !nextAssignments.length) selectedProfile.value = 'operator'
  actionNotice.value = ''
  actionError.value = ''
  changeReason.value = ''
  if (updateRoute) syncGestionQuery(user.id)
}

function syncGestionQuery(selectedId = selectedUser.value?.id || null) {
  if (!import.meta.client) return
  const nextQuery: Record<string, string> = {}
  if (search.value.trim()) nextQuery.buscar = search.value.trim()
  if (selectedId) nextQuery.usuario = String(selectedId)
  const keys = new Set([...Object.keys(route.query), ...Object.keys(nextQuery)])
  const changed = Array.from(keys).some((key) => String(Array.isArray(route.query[key]) ? route.query[key]?.[0] || '' : route.query[key] || '') !== String(nextQuery[key] || ''))
  if (changed) router.replace({ path: route.path, query: nextQuery })
}

async function refreshUsers() {
  syncGestionQuery()
  await refresh()
}

function applyProfile(profileKey: Exclude<GestionEscolarAccessProfileKey, 'custom'>) {
  const profile = profiles.find((item) => item.key === profileKey)
  if (!profile) return
  selectedProfile.value = profileKey
  const capabilities = normalizeGestionCapabilities(profile.capabilities)
  assignments.value.forEach((assignment) => { assignment.capabilities = [...capabilities] })
}

function addScope(scope: GestionEscolarScope = {}) {
  assignments.value.push(blankAssignment(scope))
}

function removeScope(index: number) {
  if (assignments.value.length <= 1) return
  assignments.value.splice(index, 1)
}

function toggleCapability(assignment: ScopeAssignment, capability: GestionEscolarCapability) {
  selectedProfile.value = 'custom'
  const set = new Set(assignment.capabilities)
  if (set.has(capability)) set.delete(capability)
  else set.add(capability)
  assignment.capabilities = normalizeGestionCapabilities(Array.from(set))
}

function buildPermissions(): GestionEscolarPermissionInput[] {
  const seen = new Set<string>()
  const permissions: GestionEscolarPermissionInput[] = []
  for (const assignment of activeAssignments.value) {
    const capabilities = normalizeGestionCapabilities(assignment.capabilities)
    for (const capability of capabilities) {
      const key = [capability, assignment.scope.plantel, assignment.scope.nivel, assignment.scope.grado, assignment.scope.grupo].join('|')
      if (seen.has(key)) continue
      seen.add(key)
      permissions.push({
        capability,
        enabled: true,
        isGlobal: false,
        plantel: assignment.scope.plantel || null,
        nivel: assignment.scope.nivel || null,
        grado: assignment.scope.grado || null,
        grupo: assignment.scope.grupo || null
      })
    }
  }
  return permissions
}

function permissionSignature(permissions: GestionEscolarPermissionInput[]) {
  return permissions
    .filter((permission) => permission.enabled !== false && permission.capability && permission.plantel)
    .map((permission) => [permission.capability, clean(permission.plantel), clean(permission.nivel), clean(permission.grado), clean(permission.grupo)].join('|'))
    .sort((a, b) => a.localeCompare(b))
    .join('\n')
}

function profileLabelFor(capabilities: GestionEscolarCapability[]) {
  return gestionProfileLabel(resolveGestionProfile(capabilities))
}

function clean(value?: string | null) {
  return String(value || '').trim()
}

function titleCase(value: string) {
  return value.toLocaleLowerCase('es-MX').replace(/(^|[\s-])\p{L}/gu, (match) => match.toLocaleUpperCase('es-MX'))
}

function prettyName(value: string) {
  const cleanValue = clean(value).replace(/\s+/g, ' ')
  if (!cleanValue) return ''
  if (/^(CM|PM|PT|SM|ST|PREEM|IECS|IEDIS|IEIDS|ISSSTE|U-\d+)$/i.test(cleanValue)) return cleanValue.toUpperCase()
  if (/^(ISSSTE|IECS|IEDIS|IEIDS)\b/i.test(cleanValue)) return cleanValue.toUpperCase()
  if (cleanValue === cleanValue.toUpperCase() || cleanValue === cleanValue.toLowerCase()) return titleCase(cleanValue)
  return cleanValue
}

function plantelKey(value: string) {
  return clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-MX')
}

function labelForPlantel(value: string) {
  const key = plantelKey(value)
  const node = normalizedOptions.value.scopeTree.planteles.find((item) => plantelKey(item.value) === key)
  return node?.label || prettyName(value)
}

function mergeNodes(nodes: GestionEscolarScopeTreeNode[]): GestionEscolarScopeTreeNode[] {
  const map = new Map<string, GestionEscolarScopeTreeNode>()
  for (const node of nodes) {
    const key = plantelKey(node.value || node.label)
    const normalized: GestionEscolarScopeTreeNode = {
      ...node,
      label: prettyName(node.label || node.value),
      children: node.children?.length ? mergeNodes(node.children) : undefined
    }
    const current = map.get(key)
    if (!current || (normalized.families + normalized.students) > (current.families + current.students)) {
      map.set(key, normalized)
    }
  }
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, 'es', { numeric: true }))
}

function normalizeOptions(input: Options): Options {
  const plantelNodes = input.scopeTree.planteles.length
    ? mergeNodes(input.scopeTree.planteles)
    : mergeNodes(input.planteles.map((plantel) => ({ value: plantel, label: plantel, families: 0, students: 0 })))
  return {
    ...input,
    planteles: plantelNodes.map((node) => node.value),
    scopeTree: { planteles: plantelNodes }
  }
}

async function savePermissions() {
  if (!selectedUser.value) return
  if (!canSave.value) {
    actionError.value = blockers.value[0] || 'Revisa rol, plantel y motivo.'
    return
  }
  await persistPermissions(true, buildPermissions())
}

async function disablePermissions() {
  if (!reasonValid.value) {
    actionError.value = 'Agrega un motivo de cambio.'
    return
  }
  await persistPermissions(false, [])
}

async function persistPermissions(enabled: boolean, permissions: GestionEscolarPermissionInput[]) {
  if (!selectedUser.value) return
  saving.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    const saved = await $fetch<GestionEscolarPermissionSummary>(`/api/admin/superadmin/gestion-escolar/users/${selectedUser.value.id}`, {
      method: 'POST',
      body: { enabled, permissions, reason: changeReason.value.trim() }
    })
    selectedUser.value.gestionEscolar = saved
    const nextAssignments = assignmentsFromPermissions(saved.permissions)
    assignments.value = nextAssignments.length ? nextAssignments : [blankAssignment()]
    selectedProfile.value = saved.profile === 'custom' ? resolveGestionProfile(saved.capabilities) : saved.profile
    actionNotice.value = saved.enabled ? 'Acceso escolar actualizado.' : 'Acceso escolar desactivado.'
    changeReason.value = ''
    await refresh()
  } catch (error) {
    const failure = error as { data?: { statusMessage?: string; message?: string }; statusMessage?: string; message?: string }
    actionError.value = failure.data?.message || failure.data?.statusMessage || failure.statusMessage || failure.message || 'No pudimos guardar este acceso.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.school-access-page {
  --surface: #ffffff;
  --surface-soft: #f8fafc;
  --line: #dce5eb;
  --line-soft: #e8eef3;
  --ink: #152032;
  --muted: #64748b;
  --accent: #0d766d;
  --accent-soft: #e8f7f3;
  --warn: #9a6b06;
  --warn-soft: #fff7df;
  display: grid;
  gap: 12px;
}

.access-header,
.review-queue,
.assignment-workbench,
.impact-panel,
.empty-selection,
.state-card {
  background: rgba(255, 255, 255, .96);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.055);
}

.access-header {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  min-height: 72px;
  padding: 16px 18px;
}

h1,
h2,
p {
  margin: 0;
}

h1,
h2 {
  color: var(--ink);
  font-family: var(--font-body);
  line-height: 1.04;
}

.access-header h1 {
  font-size: clamp(1.75rem, 2.5vw, 2.4rem);
  letter-spacing: -0.04em;
}

.eyebrow,
.queue-title span,
.section-title span,
.impact-head span,
.reason-box span {
  color: var(--muted);
  font-size: .72rem;
  font-weight: 850;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.header-actions,
.impact-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.access-console {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(280px, 350px) minmax(480px, 1fr) minmax(300px, 370px);
}

.review-queue,
.assignment-workbench,
.impact-panel {
  align-self: start;
  display: grid;
  gap: 12px;
  padding: 12px;
}

.review-queue,
.impact-panel {
  position: sticky;
  top: calc(var(--topbar-height) + 14px);
}

.queue-title,
.section-title,
.scope-row header,
.account-strip,
.impact-head,
.impact-list article {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.queue-title strong,
.account-strip h2,
.section-title h2,
.impact-block h2,
.role-card strong,
.scope-row strong,
.impact-list span {
  color: var(--ink);
}

.queue-title b,
.queue-row b {
  border-radius: 999px;
  font-size: .68rem;
  font-weight: 850;
  padding: 5px 8px;
  white-space: nowrap;
}

.queue-title b {
  background: var(--warn-soft);
  border: 1px solid #f3d589;
  color: var(--warn);
}

.searchbar {
  align-items: center;
  background: var(--surface-soft);
  border: 1px solid var(--line);
  border-radius: 14px;
  display: grid;
  gap: 8px;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  min-height: 46px;
  padding: 5px 6px 5px 11px;
}

.searchbar input {
  background: transparent;
  border: 0;
  color: var(--ink);
  min-width: 0;
  outline: 0;
}

.searchbar button,
.mini-button {
  background: #ffffff;
  border: 1px solid #cfe0e7;
  border-radius: 10px;
  color: var(--accent);
  cursor: pointer;
  font-size: .78rem;
  font-weight: 850;
  min-height: 34px;
  padding: 0 11px;
}

.queue-tabs {
  display: grid;
  gap: 6px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.queue-tabs button {
  background: var(--surface-soft);
  border: 1px solid var(--line-soft);
  border-radius: 12px;
  color: var(--muted);
  cursor: pointer;
  display: grid;
  gap: 1px;
  min-height: 50px;
  padding: 7px;
  text-align: left;
}

.queue-tabs button.active {
  background: var(--accent-soft);
  border-color: #bfe2d8;
  color: var(--accent);
}

.queue-tabs strong {
  color: var(--ink);
  font-size: .95rem;
}

.queue-tabs span {
  font-size: .72rem;
  font-weight: 800;
}

.queue-list {
  display: grid;
  gap: 6px;
  max-height: calc(100vh - 276px);
  overflow: auto;
  padding-right: 2px;
}

.queue-row {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 14px;
  cursor: pointer;
  display: grid;
  gap: 9px;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  padding: 8px;
  text-align: left;
}

.queue-row:hover,
.queue-row.active {
  background: #f3faf8;
  border-color: #cae2dc;
}

.queue-row[data-state='incomplete'] b {
  background: var(--warn-soft);
  border: 1px solid #f3d589;
  color: var(--warn);
}

.queue-row[data-state='active'] b {
  background: #e7f8ef;
  border: 1px solid #bfead0;
  color: #15803d;
}

.queue-row[data-state='none'] b {
  background: #f4f6f8;
  border: 1px solid var(--line);
  color: var(--muted);
}

.avatar {
  align-items: center;
  background: #eef7f5;
  border: 1px solid #cae2dc;
  border-radius: 12px;
  color: var(--accent);
  display: inline-flex;
  font-size: .78rem;
  font-weight: 900;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.avatar.large {
  border-radius: 16px;
  font-size: 1.05rem;
  height: 58px;
  width: 58px;
}

.queue-copy,
.account-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.queue-copy strong,
.queue-copy small,
.account-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.queue-copy strong {
  color: var(--ink);
}

.queue-copy small,
.account-copy small,
.role-card small,
.scope-row small,
.impact-list b,
.empty-note {
  color: var(--muted);
  font-size: .76rem;
}

.account-strip {
  background: #fbfcfd;
  border: 1px solid var(--line);
  border-radius: 18px;
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  padding: 14px;
}

.account-status {
  align-items: flex-end;
  display: grid;
  gap: 2px;
  justify-items: end;
  text-align: right;
}

.account-status strong {
  color: var(--ink);
}

.account-status span {
  color: var(--muted);
  font-size: .78rem;
}

.step-strip {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.step-strip article {
  align-items: center;
  background: var(--surface-soft);
  border: 1px solid var(--line-soft);
  border-radius: 14px;
  display: flex;
  gap: 9px;
  min-height: 46px;
  padding: 9px 11px;
}

.step-strip article[data-state='done'] {
  background: var(--accent-soft);
  border-color: #bfe2d8;
}

.step-strip article[data-state='locked'] {
  opacity: .56;
}

.step-strip span {
  align-items: center;
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--muted);
  display: inline-flex;
  font-size: .72rem;
  font-weight: 900;
  height: 24px;
  justify-content: center;
  width: 24px;
}

.step-strip article[data-state='done'] span,
.step-strip article[data-state='current'] span {
  color: var(--accent);
}

.step-strip strong {
  color: var(--ink);
  font-size: .82rem;
}

.editor-section {
  border: 1px solid var(--line);
  border-radius: 18px;
  display: grid;
  gap: 12px;
  padding: 12px;
}

.role-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.role-card {
  background: var(--surface-soft);
  border: 1px solid var(--line-soft);
  border-radius: 14px;
  cursor: pointer;
  display: grid;
  gap: 5px;
  min-height: 82px;
  padding: 12px;
  text-align: left;
}

.role-card.active {
  background: var(--accent-soft);
  border-color: #bfe2d8;
  box-shadow: inset 0 0 0 1px #bfe2d8;
}

.scope-list {
  display: grid;
  gap: 10px;
}

.scope-row {
  border: 1px solid var(--line-soft);
  border-radius: 16px;
  display: grid;
  gap: 11px;
  padding: 12px;
}

.scope-row[data-state='missing'] {
  background: var(--warn-soft);
  border-color: #f3d589;
}

.scope-row header > span {
  align-items: center;
  background: #eef7f5;
  border-radius: 999px;
  color: var(--accent);
  display: inline-flex;
  font-size: .76rem;
  font-weight: 900;
  height: 28px;
  justify-content: center;
  width: 28px;
}

.scope-row header > div {
  flex: 1;
  min-width: 0;
}

.icon-button {
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 10px;
  cursor: pointer;
  height: 34px;
  width: 34px;
}

.manual-permissions summary {
  color: var(--accent);
  cursor: pointer;
  font-size: .78rem;
  font-weight: 850;
}

.permission-chips,
.selected-scopes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 8px;
}

.permission-chip,
.selected-scopes span {
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--muted);
  font-size: .75rem;
  font-weight: 850;
  min-height: 30px;
  padding: 6px 10px;
}

.permission-chip.active,
.selected-scopes span {
  background: var(--accent-soft);
  border-color: #bfe2d8;
  color: var(--accent);
}

.impact-panel {
  align-content: start;
}

.impact-head {
  border-radius: 16px;
  padding: 14px;
}

.impact-head[data-state='ready'] {
  background: var(--accent-soft);
  border: 1px solid #bfe2d8;
}

.impact-head[data-state='blocked'] {
  background: var(--warn-soft);
  border: 1px solid #f3d589;
}

.impact-head[data-state='idle'] {
  background: var(--surface-soft);
  border: 1px solid var(--line-soft);
}

.impact-head strong {
  color: var(--ink);
}

.impact-block {
  border: 1px solid var(--line-soft);
  border-radius: 16px;
  display: grid;
  gap: 10px;
  padding: 12px;
}

.impact-block.compact {
  gap: 6px;
}

.impact-block h2 {
  font-size: .96rem;
}

.impact-list {
  display: grid;
  gap: 7px;
}

.impact-list article {
  background: var(--surface-soft);
  border: 1px solid var(--line-soft);
  border-radius: 12px;
  min-height: 38px;
  padding: 8px 10px;
}

.impact-list article[data-active='true'] {
  background: #f3faf8;
  border-color: #cae2dc;
}

.blocker-list {
  display: grid;
  gap: 7px;
}

.blocker-list article {
  background: var(--warn-soft);
  border: 1px solid #f3d589;
  border-radius: 12px;
  color: var(--warn);
  font-size: .8rem;
  font-weight: 800;
  padding: 9px 10px;
}

.reason-box {
  display: grid;
  gap: 7px;
}

.reason-box textarea {
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 14px;
  color: var(--ink);
  font: inherit;
  min-height: 92px;
  outline: 0;
  padding: 10px 12px;
  resize: vertical;
}

.reason-box textarea:focus {
  border-color: #9ed4c8;
  box-shadow: 0 0 0 3px rgba(13, 118, 109, .12);
}

.action-message {
  background: #edfdf7;
  border: 1px solid #b7ead6;
  border-radius: 12px;
  color: #047857;
  margin: 0;
  padding: 10px 12px;
}

.action-message.error {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #be123c;
}

.impact-actions {
  align-items: stretch;
}

.impact-actions .danger {
  color: #b4473f;
}

.empty-selection,
.state-card {
  color: var(--muted);
  display: grid;
  gap: 9px;
  min-height: 360px;
  place-items: center;
  padding: 24px;
  text-align: center;
}

.state-card.compact {
  min-height: 160px;
}

button:disabled {
  cursor: not-allowed;
  opacity: .58;
}

@media (max-width: 1280px) {
  .access-console {
    grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
  }

  .impact-panel {
    grid-column: 2;
    position: static;
  }
}

@media (max-width: 980px) {
  .access-console,
  .impact-panel {
    grid-template-columns: 1fr;
  }

  .review-queue,
  .impact-panel {
    position: static;
  }

  .role-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .access-header,
  .account-strip,
  .step-strip,
  .queue-row {
    align-items: stretch;
    grid-template-columns: 1fr;
  }

  .access-header,
  .account-strip {
    display: grid;
  }

  .account-status {
    align-items: start;
    justify-items: start;
    text-align: left;
  }

  .role-grid {
    grid-template-columns: 1fr;
  }
}
</style>
