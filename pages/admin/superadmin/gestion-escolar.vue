<template>
  <section class="assignment-page" data-product-area="superadmin" data-product-screen="gestion-escolar-permissions">
    <header class="assignment-hero">
      <div>
        <p class="eyebrow">Asignación Escolar</p>
        <h1>Admins escolares</h1>
        <p>Elige qué hará esta persona, define planteles o grupos y confirma el acceso antes de activarlo.</p>
        <div class="hero-rail" aria-label="Planteles escolares">
          <span v-for="plantel in visiblePlanteles" :key="plantel">{{ plantel }}</span>
          <span v-if="!visiblePlanteles.length">Sin planteles detectados</span>
        </div>
      </div>
      <section class="hero-metrics" aria-label="Resumen de admins escolares">
        <article><span>Cuentas internas</span><strong>{{ data?.metrics.total || 0 }}</strong></article>
        <article><span>Activos</span><strong>{{ data?.metrics.enabled || 0 }}</strong></article>
        <article><span>Planteles</span><strong>{{ options.planteles.length }}</strong></article>
      </section>
    </header>

    <section class="assignment-shell">
      <aside class="operator-browser">
        <form class="search-card" role="search" @submit.prevent="refreshUsers">
          <FamilyPersonasIcon name="search" />
          <input v-model="search" type="search" placeholder="Buscar admin, correo o matrícula" aria-label="Buscar usuario" />
          <button class="mini-button" type="submit" :disabled="directoryLoading">Buscar</button>
        </form>

        <div class="browser-summary">
          <span>{{ users.length }} personas</span>
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
            <p class="eyebrow">Persona</p>
            <h2>{{ displayName(selectedUser) }}</h2>
            <p>{{ selectedUser.email || selectedUser.username || `ID ${selectedUser.id}` }}</p>
          </div>
          <span class="state-pill" :data-state="draftState">{{ draftStateLabel }}</span>
        </div>

        <section class="guidance-card" :data-state="draftState">
          <div>
            <p class="eyebrow">Resultado esperado</p>
            <h3>{{ resultTitle }}</h3>
          </div>
          <p>{{ resultDescription }}</p>
        </section>

        <section class="step-section">
          <div class="step-head">
            <span>1</span>
            <div>
              <p class="eyebrow">Responsabilidad</p>
              <h3>{{ profileHeadline }}</h3>
            </div>
          </div>
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
              <strong>{{ profile.label }}</strong>
              <span>{{ profile.caption }}</span>
            </button>
          </div>
        </section>

        <section class="step-section">
          <div class="step-head inline">
            <span>2</span>
            <div>
              <p class="eyebrow">Plantel y alcance</p>
              <h3>{{ draftPlanteles.length ? draftPlanteles.join(' · ') : 'Pendiente' }}</h3>
            </div>
            <button class="mini-button" type="button" :disabled="saving" @click="addScope()">Agregar alcance</button>
          </div>

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
                  <small>{{ profileLabelFor(assignment.capabilities) }} · {{ assignment.capabilities.length }} acciones</small>
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
                <summary>Ajuste avanzado</summary>
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
        </section>

        <section class="step-section outcome-section">
          <div class="step-head">
            <span>3</span>
            <div>
              <p class="eyebrow">Lo que podrá hacer</p>
              <h3>{{ outcomeHeadline }}</h3>
            </div>
          </div>
          <div class="outcome-grid">
            <article v-for="item in outcomeItems" :key="item.label" :data-active="item.active">
              <strong>{{ item.label }}</strong>
              <small>{{ item.detail }}</small>
            </article>
          </div>
        </section>

        <p v-if="actionError" class="action-message error">{{ actionError }}</p>
        <p v-else-if="actionNotice" class="action-message">{{ actionNotice }}</p>

        <div class="actions">
          <button v-if="selectedUser.gestionEscolar.enabled" class="btn btn-secondary danger" type="button" :disabled="saving" @click="disablePermissions">Desactivar acceso</button>
          <button class="btn btn-secondary" type="button" :disabled="saving" @click="selectUser(selectedUser)">Restaurar</button>
          <button class="btn btn-primary" type="button" :disabled="saving || !canSave" @click="savePermissions">{{ saving ? 'Guardando...' : 'Activar Admin Escolar' }}</button>
        </div>
      </section>

      <section v-else class="empty-selection">
        <FamilyPersonasIcon name="school" />
        <h2>Selecciona una persona</h2>
        <p>Verás perfiles, planteles y estados de acceso.</p>
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
const visiblePlanteles = computed(() => options.value.planteles.slice(0, 9))
const activeAssignments = computed(() => assignments.value.filter((assignment) => assignment.scope.plantel && assignment.capabilities.length))
const draftPlanteles = computed(() => Array.from(new Set(activeAssignments.value.map((assignment) => String(assignment.scope.plantel || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es')))
const draftCapabilities = computed(() => Array.from(new Set(activeAssignments.value.flatMap((assignment) => assignment.capabilities))))
const selectedCapabilities = computed(() => Array.from(new Set(assignments.value.flatMap((assignment) => assignment.capabilities))))
const canSave = computed(() => activeAssignments.value.length > 0 && activeAssignments.value.every((assignment) => assignment.scope.plantel && assignment.capabilities.length))
const draftState = computed<GestionEscolarAssignmentState>(() => canSave.value ? 'active' : selectedUser.value?.gestionEscolar.state === 'incomplete' ? 'incomplete' : 'none')
const draftStateLabel = computed(() => draftState.value === 'active' ? 'Listo para activar' : draftState.value === 'incomplete' ? 'Acceso incompleto' : 'Sin acceso')
const profileHeadline = computed(() => selectedProfile.value === 'custom' ? 'Responsabilidad personalizada' : profiles.find((profile) => profile.key === selectedProfile.value)?.label || 'Responsabilidad')
const resultTitle = computed(() => canSave.value ? `${draftPlanteles.value.length} plantel${draftPlanteles.value.length === 1 ? '' : 'es'} con ${draftCapabilities.value.length} acciones` : 'Falta completar el alcance')
const resultDescription = computed(() => canSave.value ? 'La persona verá únicamente familias y contenido dentro del alcance seleccionado.' : 'Selecciona al menos un plantel y una responsabilidad antes de entregar acceso.')
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
  display: grid;
  gap: 16px;
}

.assignment-hero,
.operator-browser,
.editor-card,
.empty-selection,
.state-card {
  background: rgba(255, 255, 255, .96);
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  box-shadow: var(--shadow-soft);
}

.assignment-hero {
  align-items: end;
  background: linear-gradient(135deg, #fff, #f8fbf2);
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 460px);
  padding: clamp(18px, 2.6vw, 32px);
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1,
h2,
h3 {
  color: #17233b;
  line-height: 1.06;
}

h1 {
  font-size: clamp(2.15rem, 3.8vw, 4rem);
}

.assignment-hero p {
  max-width: 720px;
}

.hero-rail,
.plantel-grid,
.capability-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-rail {
  margin-top: 16px;
}

.hero-rail span,
.plantel-chip,
.capability-chip {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  color: #475569;
  font-size: .78rem;
  font-weight: 850;
  min-height: 36px;
  padding: 8px 11px;
}

.hero-metrics {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, 1fr);
}

.hero-metrics article {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px;
}

.hero-metrics span,
.browser-summary,
.scope-card small,
.profile-card span,
.guidance-card p,
.outcome-grid small,
.identity-strip p {
  color: #64748b;
}

.hero-metrics span,
.browser-summary span,
.browser-summary b {
  display: block;
  font-size: .7rem;
  font-weight: 850;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.hero-metrics strong {
  color: #10213b;
  display: block;
  font-size: 1.55rem;
  margin-top: 6px;
}

.assignment-shell {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(300px, 390px) minmax(0, 1fr);
}

.operator-browser {
  align-self: start;
  display: grid;
  gap: 12px;
  padding: 12px;
  position: sticky;
  top: calc(var(--topbar-height) + 18px);
}

.search-card {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  display: grid;
  gap: 8px;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  padding: 8px 10px;
}

.search-card input {
  background: transparent;
  border: 0;
  color: #17233b;
  min-width: 0;
  outline: 0;
}

.browser-summary {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.mini-button,
.icon-button {
  align-items: center;
  background: #fff;
  border: 1px solid #cfe0e7;
  border-radius: 12px;
  color: #0f8c9a;
  display: inline-flex;
  font-weight: 850;
  justify-content: center;
  min-height: 38px;
  padding: 0 12px;
}

.icon-button {
  padding: 0;
  width: 38px;
}

button:disabled {
  cursor: not-allowed;
  opacity: .55;
}

.operator-list {
  display: grid;
  gap: 8px;
  max-height: calc(100vh - 310px);
  overflow: auto;
}

.operator-row {
  align-items: center;
  background: #fff;
  border: 1px solid transparent;
  border-radius: 16px;
  color: #17233b;
  display: grid;
  gap: 10px;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  padding: 10px;
  text-align: left;
}

.operator-row.active,
.operator-row:hover {
  border-color: var(--color-brand-300);
  box-shadow: var(--shadow-line);
}

.avatar,
.scope-number,
.step-head > span {
  background: #fff7df;
  border: 1px solid #f3d589;
  border-radius: 14px;
  color: #9a6700;
  display: grid;
  font-weight: 900;
  height: 42px;
  place-items: center;
  width: 42px;
}

.avatar.large {
  height: 58px;
  width: 58px;
}

.operator-copy,
.operator-copy strong,
.operator-copy small {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.operator-row b,
.state-pill {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  color: #64748b;
  font-size: .72rem;
  font-weight: 850;
  max-width: 118px;
  overflow: hidden;
  padding: 6px 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.operator-row b[data-state='active'],
.state-pill[data-state='active'] {
  background: #e7f8ef;
  border-color: #bfead0;
  color: #15803d;
}

.operator-row b[data-state='incomplete'],
.state-pill[data-state='incomplete'] {
  background: #fff7df;
  border-color: #f3d589;
  color: #9a6700;
}

.editor-card {
  display: grid;
  gap: 14px;
  padding: clamp(14px, 2vw, 22px);
}

.identity-strip,
.step-head,
.scope-card header,
.actions {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.identity-strip {
  justify-content: start;
}

.identity-strip .state-pill {
  margin-left: auto;
}

.guidance-card,
.step-section {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  display: grid;
  gap: 14px;
  padding: 15px;
}

.guidance-card {
  background: #fbfdff;
}

.guidance-card[data-state='active'] {
  background: #f0f8e7;
  border-color: var(--color-brand-200);
}

.step-head {
  justify-content: start;
}

.step-head.inline {
  justify-content: space-between;
}

.step-head.inline > div {
  flex: 1;
}

.profile-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.profile-card {
  background: #fff;
  border: 1px solid #d9e2ea;
  border-radius: 16px;
  color: #17233b;
  display: grid;
  gap: 5px;
  min-height: 96px;
  padding: 13px;
  text-align: left;
}

.profile-card.active,
.profile-card:hover,
.plantel-chip.active,
.capability-chip.active {
  background: #e7f8ef;
  border-color: #9fd9b8;
  color: #156235;
}

.profile-card span {
  font-size: .76rem;
  line-height: 1.35;
}

.plantel-chip,
.capability-chip {
  cursor: pointer;
}

.scope-stack {
  display: grid;
  gap: 10px;
}

.scope-card {
  background: linear-gradient(180deg, #fff 0%, #fbfdff 100%);
  border: 1px solid #dfe8ef;
  border-radius: 18px;
  display: grid;
  gap: 14px;
  padding: 14px;
}

.scope-card[data-complete='false'] {
  border-color: #f3d589;
}

.scope-card header {
  justify-content: start;
}

.scope-card header div {
  flex: 1;
  min-width: 0;
}

.scope-card header strong,
.scope-card header small {
  display: block;
}

.capability-editor {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 10px 12px;
}

.capability-editor summary {
  color: #17233b;
  cursor: pointer;
  font-weight: 850;
}

.capability-grid {
  margin-top: 10px;
}

.capability-chip {
  font-size: .78rem;
}

.outcome-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.outcome-grid article {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  display: grid;
  gap: 5px;
  min-height: 94px;
  padding: 12px;
}

.outcome-grid article[data-active='true'] {
  background: #fff;
  border-color: #9fd9b8;
}

.action-message {
  background: #edfdf7;
  border: 1px solid #b7ead6;
  border-radius: 14px;
  color: #047857;
  padding: 10px 12px;
}

.action-message.error {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #be123c;
}

.btn.danger {
  color: #9f1239;
}

.state-card,
.empty-selection {
  color: #64748b;
  display: grid;
  gap: 8px;
  min-height: 220px;
  place-items: center;
  padding: 24px;
  text-align: center;
}

.state-card.compact {
  min-height: 150px;
}

@media (max-width: 1240px) {
  .assignment-shell,
  .assignment-hero {
    grid-template-columns: 1fr;
  }

  .operator-browser {
    position: static;
  }

  .profile-grid,
  .outcome-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .hero-metrics,
  .profile-grid,
  .outcome-grid {
    grid-template-columns: 1fr;
  }

  .identity-strip,
  .step-head.inline,
  .scope-card header,
  .actions {
    align-items: stretch;
    flex-direction: column;
  }

  .identity-strip .state-pill {
    margin-left: 0;
  }
}
</style>
