<template>
  <section class="assignment-page" data-product-area="superadmin" data-product-screen="school-scope-resolution">
    <header class="ops-bar">
      <div>
        <p class="eyebrow">Super Admin</p>
        <h1>Alcance escolar</h1>
      </div>
      <div class="scope-metrics" aria-label="Resumen de alcance escolar">
        <article><span>Cuentas</span><strong>{{ data?.metrics.total || 0 }}</strong></article>
        <article><span>Activos</span><strong>{{ data?.metrics.enabled || 0 }}</strong></article>
        <article><span>Planteles</span><strong>{{ options.planteles.length }}</strong></article>
      </div>
    </header>

    <section class="assignment-shell">
      <aside class="operator-browser">
        <form class="search-card" role="search" @submit.prevent="refreshUsers">
          <FamilyPersonasIcon name="search" />
          <input v-model="search" type="search" placeholder="Nombre, correo o matrícula" aria-label="Buscar usuario" />
          <button class="mini-button" type="submit" :disabled="directoryLoading">Buscar</button>
        </form>

        <div class="browser-summary">
          <span>{{ users.length }} cuentas</span>
          <b>{{ data?.metrics.enabled || 0 }} activas</b>
        </div>

        <div v-if="directoryLoading" class="state-card compact" data-state="loading"><HuskyPassLoader label="Usuarios" compact /></div>
        <div v-else-if="loadError" class="state-card compact" data-state="error">No disponible</div>
        <div v-else class="operator-list">
          <button
            v-for="user in users"
            :key="user.id"
            class="operator-row"
            type="button"
            :class="{ active: selectedUser?.id === user.id }"
            @click="selectUser(user)"
          >
            <span class="avatar">{{ initials(user) }}</span>
            <span class="operator-copy">
              <strong>{{ displayName(user) }}</strong>
              <small>{{ user.email || user.username || `ID ${user.id}` }}</small>
            </span>
            <b :data-state="user.gestionEscolar.state">{{ rowStateLabel(user) }}</b>
          </button>
          <div v-if="!users.length" class="state-card compact" data-state="empty">Sin cuentas internas</div>
        </div>
      </aside>

      <section v-if="selectedUser" class="editor-card">
        <div class="identity-strip">
          <span class="avatar large">{{ initials(selectedUser) }}</span>
          <div>
            <p class="eyebrow">Cuenta</p>
            <h2>{{ displayName(selectedUser) }}</h2>
            <p>{{ selectedUser.email || selectedUser.username || `ID ${selectedUser.id}` }}</p>
          </div>
          <span class="state-pill" :data-state="draftState">{{ draftStateLabel }}</span>
        </div>

        <section class="flow-rail" aria-label="Estado de asignación escolar">
          <article :data-active="selectedCapabilities.length > 0">
            <span>01</span><strong>{{ profileHeadline }}</strong>
          </article>
          <article :data-active="draftPlanteles.length > 0">
            <span>02</span><strong>{{ draftPlanteles.length ? draftPlanteles.join(' · ') : 'Sin plantel' }}</strong>
          </article>
          <article :data-active="canSave">
            <span>03</span><strong>{{ resultTitle }}</strong>
          </article>
        </section>

        <section class="scope-workspace">
          <div class="profile-column">
            <header class="section-head">
              <h2>Responsabilidad</h2>
              <span>{{ selectedProfile === 'custom' ? 'Personalizado' : 'Perfil' }}</span>
            </header>
            <div class="profile-grid">
              <button
                v-for="profile in profiles"
                :key="profile.key"
                type="button"
                class="profile-card"
                :class="{ active: selectedProfile === profile.key }"
                :disabled="saving"
                @click="applyProfile(profile.key)"
              >
                <strong>{{ profile.shortLabel }}</strong>
                <span>{{ profile.label }}</span>
              </button>
            </div>

            <header class="section-head compact-head">
              <h2>Plantel</h2>
              <button class="mini-button" type="button" :disabled="saving" @click="addScope()">Agregar</button>
            </header>
            <div class="plantel-grid">
              <button
                v-for="plantel in options.planteles"
                :key="plantel"
                type="button"
                class="plantel-chip"
                :class="{ active: draftPlanteles.includes(plantel) }"
                :disabled="saving"
                @click="togglePlantel(plantel)"
              >
                {{ plantel }}
              </button>
            </div>

            <div class="scope-stack" aria-label="Alcances asignados">
              <article v-for="(assignment, index) in assignments" :key="assignment.uid" class="scope-card" :data-complete="assignment.scope.plantel ? 'true' : 'false'">
                <header>
                  <span class="scope-number">{{ index + 1 }}</span>
                  <div>
                    <strong>{{ formatGestionScope(assignment.scope) }}</strong>
                    <small>{{ profileLabelFor(assignment.capabilities) }} · {{ assignment.capabilities.length }}</small>
                  </div>
                  <button class="icon-button" type="button" :disabled="saving || assignments.length <= 1" aria-label="Quitar alcance" @click="removeScope(index)">
                    <FamilyPersonasIcon name="trash" />
                  </button>
                </header>

                <AdminGestionScopePicker
                  v-model="assignment.scope"
                  :scope-tree="options.scopeTree"
                  :options="options"
                  :disabled="saving"
                  compact
                />

                <details class="capability-editor" :open="selectedProfile === 'custom'">
                  <summary>Permisos</summary>
                  <div class="capability-grid">
                    <button
                      v-for="capability in capabilityOptions"
                      :key="capability.value"
                      type="button"
                      class="capability-chip"
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
          </div>

          <aside class="outcome-panel">
            <header class="section-head">
              <h2>Resultado</h2>
              <span>{{ outcomeHeadline }}</span>
            </header>
            <div class="outcome-grid">
              <article v-for="item in outcomeItems" :key="item.label" :data-active="item.active">
                <strong>{{ item.label }}</strong>
                <small>{{ item.detail }}</small>
              </article>
            </div>

            <p v-if="actionError" class="action-message error">{{ actionError }}</p>
            <p v-else-if="actionNotice" class="action-message">{{ actionNotice }}</p>

            <div class="actions">
              <button v-if="selectedUser.gestionEscolar.enabled" class="btn btn-secondary danger" type="button" :disabled="saving" @click="disablePermissions">Desactivar</button>
              <button class="btn btn-secondary" type="button" :disabled="saving" @click="selectUser(selectedUser)">Restaurar</button>
              <button class="btn btn-primary" type="button" :disabled="saving || !canSave" @click="savePermissions">{{ saving ? 'Guardando...' : 'Guardar alcance' }}</button>
            </div>
          </aside>
        </section>
      </section>

      <section v-else class="empty-selection">
        <FamilyPersonasIcon name="school" />
        <h2>Selecciona una cuenta</h2>
        <p>Define responsabilidad, alcance y permisos.</p>
      </section>
    </section>
  </section>
</template>


<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useFetch, useRoute, useRouter } from 'nuxt/app'
import type { GestionEscolarAccessProfileKey, GestionEscolarAssignmentState, GestionEscolarCapability, GestionEscolarPermissionInput, GestionEscolarPermissionSummary, GestionEscolarScope, GestionEscolarScopeTree } from '~/types/gestionEscolar'
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

const route = useRoute()
const router = useRouter()
const search = ref(typeof route.query.buscar === 'string' ? route.query.buscar : '')
const query = computed(() => ({ search: search.value, limit: 160 }))
const { data, pending, error: loadError, refresh } = useFetch<CockpitResponse>('/api/admin/superadmin/gestion-escolar/users', { query, timeout: 15000 })
const selectedUser = ref<CockpitUser | null>(null)
const assignments = ref<ScopeAssignment[]>([])
const selectedProfile = ref<GestionEscolarAccessProfileKey>('operator')
const saving = ref(false)
const actionNotice = ref('')
const actionError = ref('')

const profiles = GESTION_ACCESS_PROFILES
const capabilityOptions = GESTION_CAPABILITY_ORDER.map((value) => ({ value, label: GESTION_CAPABILITY_LABELS[value] }))
const users = computed(() => data.value?.users || [])
const directoryLoading = computed(() => pending.value || (!data.value && !loadError.value))
const options = computed<Options>(() => ({
  planteles: data.value?.options?.planteles || data.value?.planteles || [],
  niveles: data.value?.options?.niveles || [],
  grados: data.value?.options?.grados || [],
  grupos: data.value?.options?.grupos || [],
  scopeTree: data.value?.options?.scopeTree || { planteles: [] }
}))
const activeAssignments = computed(() => assignments.value.filter((assignment) => assignment.scope.plantel && assignment.capabilities.length))
const draftPlanteles = computed(() => Array.from(new Set(activeAssignments.value.map((assignment) => String(assignment.scope.plantel || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es')))
const draftCapabilities = computed(() => Array.from(new Set(activeAssignments.value.flatMap((assignment) => assignment.capabilities))))
const selectedCapabilities = computed(() => Array.from(new Set(assignments.value.flatMap((assignment) => assignment.capabilities))))
const canSave = computed(() => activeAssignments.value.length > 0 && activeAssignments.value.every((assignment) => assignment.scope.plantel && assignment.capabilities.length))
const draftState = computed<GestionEscolarAssignmentState>(() => canSave.value ? 'active' : selectedUser.value?.gestionEscolar.state === 'incomplete' ? 'incomplete' : 'none')
const draftStateLabel = computed(() => draftState.value === 'active' ? 'Listo para activar' : draftState.value === 'incomplete' ? 'Acceso incompleto' : 'Sin acceso')
const profileHeadline = computed(() => selectedProfile.value === 'custom' ? 'Responsabilidad personalizada' : profiles.find((profile) => profile.key === selectedProfile.value)?.label || 'Responsabilidad')
const resultTitle = computed(() => canSave.value ? `${draftPlanteles.value.length} plantel${draftPlanteles.value.length === 1 ? '' : 'es'} con ${draftCapabilities.value.length} acciones` : 'Falta completar el alcance')
const outcomeHeadline = computed(() => selectedProfile.value === 'custom' ? 'Acceso ajustado manualmente' : profileHeadline.value)
const outcomeItems = computed(() => [
  { label: 'Familias', detail: capabilityDetail(hasSelectedCapability('familias.view'), hasSelectedCapability('familias.impersonate') ? 'Consulta y vista familiar controlada.' : 'Solo lectura familiar.', 'Sin acceso.'), active: canSave.value && hasSelectedCapability('familias.view') },
  { label: 'Comunicados', detail: capabilityDetail(hasSelectedCapability('comunicados.create'), hasSelectedCapability('comunicados.publish') ? 'Crear, programar y publicar.' : 'Crear borradores.', 'Sin acceso.'), active: canSave.value && hasSelectedCapability('comunicados.create') },
  { label: 'Encuestas', detail: capabilityDetail(hasSelectedCapability('encuestas.manage'), 'Administrar formularios por audiencia.', 'Sin acceso.'), active: canSave.value && hasSelectedCapability('encuestas.manage') },
  { label: 'Convenios', detail: capabilityDetail(hasSelectedCapability('convenios.manage'), hasSelectedCapability('convenios.publish') ? 'Gestionar y publicar convenios.' : 'Gestionar borradores.', 'Sin acceso.'), active: canSave.value && hasSelectedCapability('convenios.manage') }
])

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
  selectUser(requested || users.value[0])
})

watch(() => route.query.usuario, (value) => {
  const id = Number(value || 0)
  if (!id) return
  const user = users.value.find((item) => item.id === id)
  if (user) selectUser(user, false)
})

function displayName(user: CockpitUser) {
  return user.displayName || user.email || user.username || `Usuario ${user.id}`
}

function initials(user: CockpitUser) {
  return displayName(user).split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'HP'
}

function rowStateLabel(user: CockpitUser) {
  if (user.gestionEscolar.state === 'active') return user.gestionEscolar.reach.planteles.join(' · ') || 'Activo'
  if (user.gestionEscolar.state === 'incomplete') return 'Incompleto'
  return 'Sin acceso'
}

function hasSelectedCapability(capability: GestionEscolarCapability) {
  return selectedCapabilities.value.includes(capability)
}

function capabilityDetail(enabled: boolean, activeDetail: string, disabledDetail: string) {
  if (!enabled) return disabledDetail
  return canSave.value ? activeDetail : 'Falta plantel para activar.'
}

function profileLabelFor(capabilities: GestionEscolarCapability[]) {
  return gestionProfileLabel(resolveGestionProfile(capabilities))
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

function togglePlantel(plantel: string) {
  const existingIndex = assignments.value.findIndex((assignment) => assignment.scope.plantel === plantel && !assignment.scope.nivel && !assignment.scope.grado && !assignment.scope.grupo)
  if (existingIndex >= 0) {
    removeScope(existingIndex)
    if (!assignments.value.length) assignments.value = [blankAssignment()]
    return
  }
  const blank = assignments.value.find((assignment) => !assignment.scope.plantel)
  if (blank) {
    blank.scope = { isGlobal: false, plantel, nivel: null, grado: null, grupo: null }
    blank.capabilities = blank.capabilities.length ? blank.capabilities : defaultCapabilities()
    return
  }
  addScope({ plantel })
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

async function savePermissions() {
  if (!selectedUser.value) return
  const permissions = buildPermissions()
  if (!permissions.length) {
    actionError.value = 'Completa plantel y responsabilidad.'
    return
  }
  await persistPermissions(true, permissions)
}

async function disablePermissions() {
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
      body: { enabled, permissions }
    })
    selectedUser.value.gestionEscolar = saved
    const nextAssignments = assignmentsFromPermissions(saved.permissions)
    assignments.value = nextAssignments.length ? nextAssignments : [blankAssignment()]
    selectedProfile.value = saved.profile === 'custom' ? resolveGestionProfile(saved.capabilities) : saved.profile
    actionNotice.value = saved.enabled ? 'Admin Escolar activado.' : 'Acceso desactivado.'
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
.assignment-page {
  --surface: #ffffff;
  --line: #dce5eb;
  --line-soft: #e8eef3;
  --ink: #152032;
  --muted: #64748b;
  --accent: #0d766d;
  display: grid;
  gap: 12px;
}

.ops-bar,
.operator-browser,
.editor-card,
.empty-selection,
.state-card {
  background: rgba(255, 255, 255, .96);
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

h1,
h2,
h3,
p {
  margin: 0;
}

h1,
h2,
h3,
.ops-bar h1 {
  color: var(--ink);
  font-family: var(--font-body);
  line-height: 1.04;
}

.ops-bar h1 {
  font-size: clamp(1.7rem, 2.4vw, 2.35rem);
  letter-spacing: -0.04em;
}

.eyebrow,
.section-head span,
.browser-summary span,
.browser-summary b,
.scope-metrics span {
  color: var(--muted);
  font-size: .72rem;
  font-weight: 850;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.scope-metrics {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(96px, 1fr));
}

.scope-metrics article {
  background: #f8fafc;
  border: 1px solid var(--line-soft);
  border-radius: 14px;
  display: grid;
  gap: 2px;
  padding: 9px 11px;
}

.scope-metrics strong {
  color: var(--ink);
  font-size: 1.05rem;
}

.assignment-shell {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(300px, 370px) minmax(0, 1fr);
}

.operator-browser {
  align-self: start;
  display: grid;
  gap: 12px;
  padding: 12px;
  position: sticky;
  top: calc(var(--topbar-height) + 14px);
}

.search-card {
  align-items: center;
  background: #f8fafc;
  border: 1px solid var(--line);
  border-radius: 14px;
  display: grid;
  gap: 8px;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  min-height: 46px;
  padding: 5px 6px 5px 11px;
}

.search-card input {
  background: transparent;
  border: 0;
  color: var(--ink);
  min-width: 0;
  outline: 0;
}

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

.browser-summary,
.section-head,
.identity-strip,
.scope-card header,
.actions {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.operator-list {
  display: grid;
  gap: 6px;
  max-height: calc(100vh - 240px);
  overflow: auto;
}

.operator-row {
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

.operator-row:hover,
.operator-row.active {
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

.operator-copy,
.identity-strip > div {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.operator-copy strong,
.operator-copy small,
.identity-strip h2,
.identity-strip p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.operator-copy strong,
.identity-strip h2 {
  color: var(--ink);
}

.operator-copy small,
.identity-strip p:not(.eyebrow),
.scope-card small,
.profile-card span,
.outcome-grid small {
  color: var(--muted);
  font-size: .76rem;
}

.operator-row b,
.state-pill {
  border-radius: 999px;
  font-size: .68rem;
  font-weight: 850;
  padding: 5px 8px;
  white-space: nowrap;
}

.operator-row b[data-state='active'],
.state-pill[data-state='active'] {
  background: #e7f8ef;
  border: 1px solid #bfead0;
  color: #15803d;
}

.operator-row b[data-state='incomplete'],
.state-pill[data-state='incomplete'] {
  background: #fff6df;
  border: 1px solid #f3d589;
  color: #8a650c;
}

.operator-row b[data-state='none'],
.state-pill[data-state='none'] {
  background: #f4f6f8;
  border: 1px solid var(--line);
  color: var(--muted);
}

.editor-card {
  display: grid;
  gap: 12px;
  padding: 12px;
}

.identity-strip {
  background: #fbfcfd;
  border: 1px solid var(--line);
  border-radius: 18px;
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  padding: 14px;
}

.flow-rail {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.flow-rail article {
  background: #f8fafc;
  border: 1px solid var(--line-soft);
  border-radius: 14px;
  display: grid;
  gap: 3px;
  padding: 11px 12px;
}

.flow-rail article[data-active='true'] {
  background: #f3faf8;
  border-color: #cae2dc;
}

.flow-rail span {
  color: var(--muted);
  font-size: .7rem;
  font-weight: 850;
}

.flow-rail strong,
.profile-card strong,
.scope-card strong,
.outcome-grid strong {
  color: var(--ink);
}

.scope-workspace {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
}

.profile-column,
.outcome-panel {
  border: 1px solid var(--line);
  border-radius: 18px;
  display: grid;
  gap: 12px;
  padding: 12px;
}

.compact-head {
  margin-top: 4px;
}

.profile-grid,
.plantel-grid,
.capability-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.profile-card,
.plantel-chip,
.capability-chip {
  background: #f8fafc;
  border: 1px solid var(--line-soft);
  border-radius: 14px;
  color: var(--muted);
  cursor: pointer;
  font-weight: 800;
}

.profile-card {
  display: grid;
  gap: 3px;
  min-width: 142px;
  padding: 11px 12px;
  text-align: left;
}

.profile-card.active,
.plantel-chip.active,
.capability-chip.active {
  background: #e7f8ef;
  border-color: #bfead0;
  color: #15803d;
}

.plantel-chip,
.capability-chip {
  min-height: 34px;
  padding: 0 11px;
}

.scope-stack {
  display: grid;
  gap: 10px;
}

.scope-card {
  border: 1px solid var(--line-soft);
  border-radius: 16px;
  display: grid;
  gap: 10px;
  padding: 11px;
}

.scope-card[data-complete='false'] {
  background: #fff8ea;
  border-color: #f3d589;
}

.scope-number {
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

.icon-button {
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 10px;
  cursor: pointer;
  height: 34px;
  width: 34px;
}

.capability-editor summary {
  color: var(--accent);
  cursor: pointer;
  font-size: .78rem;
  font-weight: 850;
}

.outcome-panel {
  align-content: start;
  position: sticky;
  top: calc(var(--topbar-height) + 14px);
}

.outcome-grid {
  display: grid;
  gap: 8px;
}

.outcome-grid article {
  background: #f8fafc;
  border: 1px solid var(--line-soft);
  border-radius: 14px;
  display: grid;
  gap: 3px;
  padding: 11px 12px;
}

.outcome-grid article[data-active='true'] {
  background: #f3faf8;
  border-color: #cae2dc;
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

.actions {
  align-items: stretch;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.actions .danger {
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

@media (max-width: 1120px) {
  .assignment-shell,
  .scope-workspace {
    grid-template-columns: 1fr;
  }
  .operator-browser,
  .outcome-panel {
    position: static;
  }
}

@media (max-width: 720px) {
  .ops-bar,
  .identity-strip,
  .flow-rail {
    align-items: stretch;
    grid-template-columns: 1fr;
  }
  .ops-bar {
    display: grid;
  }
  .scope-metrics,
  .operator-row {
    grid-template-columns: 1fr;
  }
}
</style>
