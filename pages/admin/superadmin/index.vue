<template>
  <section class="users-console" data-product-area="superadmin" data-product-screen="directory">
    <header class="page-head">
      <div>
        <p class="eyebrow">Super Admin</p>
        <h1>Usuarios</h1>
      </div>
      <button v-if="hasChanges" class="btn btn-primary" type="button" :disabled="saving || Boolean(saveBlocker)" @click="saveRoles">
        {{ saving ? 'Guardando...' : 'Guardar cambios' }}
      </button>
    </header>

    <p v-if="actionError" class="surface-message error">{{ actionError }}</p>
    <p v-else-if="actionNotice" class="surface-message">{{ actionNotice }}</p>

    <section v-if="loadError" class="state-panel" data-state="error">
      <FamilyPersonasIcon name="people" />
      <h2>No se pudo cargar Usuarios</h2>
      <button class="btn btn-secondary" type="button" @click="refreshDirectory">Reintentar</button>
    </section>

    <section v-else class="users-layout">
      <aside class="list-panel" data-product-panel="superadmin-directory" :data-state="visibleUsers.length ? 'content' : 'empty'">
        <form class="search-box" role="search" @submit.prevent="refreshDirectory">
          <FamilyPersonasIcon name="search" />
          <input v-model="search" type="search" placeholder="Buscar usuario" aria-label="Buscar usuario" data-diagnostic-filter="buscar-usuario" />
          <button type="submit" :disabled="pending">Buscar</button>
        </form>

        <div class="filters">
          <select v-model="selectedScope" aria-label="Tipo">
            <option v-for="option in scopeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <select v-model="selectedPlantel" aria-label="Plantel o unidad">
            <option value="">Todos</option>
            <option v-for="plantel in directory?.planteles || []" :key="plantel" :value="plantel">{{ plantel }}</option>
          </select>
        </div>

        <div v-if="pending && !directory" class="state-panel compact" data-state="loading">
          <HuskyPassLoader label="Usuarios" compact />
        </div>

        <div v-else-if="visibleUsers.length" class="user-list" role="list">
          <button
            v-for="user in visibleUsers"
            :key="user.id"
            class="user-row"
            :class="{ selected: selectedUser?.id === user.id }"
            type="button"
            data-diagnostic-action="seleccionar-usuario"
            @click="selectUser(user)"
          >
            <span class="avatar">{{ initials(user) }}</span>
            <span class="row-copy">
              <strong>{{ displayName(user) }}</strong>
              <small>{{ accountLine(user) }}</small>
            </span>
            <b :data-state="rowState(user)">{{ roleSummary(user) }}</b>
          </button>
        </div>

        <div v-else class="state-panel compact" data-state="empty">
          <FamilyPersonasIcon name="people" />
          <h2>Sin resultados</h2>
        </div>
      </aside>

      <main class="detail-panel">
        <template v-if="selectedUser">
          <section class="identity-strip" :data-state="rowState(selectedUser)">
            <span class="avatar large">{{ initials(selectedUser) }}</span>
            <div>
              <p>{{ accountType(selectedUser) }}</p>
              <h2>{{ displayName(selectedUser) }}</h2>
              <small>{{ selectedUser.email || selectedUser.username || `ID ${selectedUser.id}` }}</small>
            </div>
            <b>{{ roleSummary(selectedUser) }}</b>
          </section>

          <section class="role-list">
            <article class="role-row" :data-state="schoolRoleState(selectedUser)">
              <span><FamilyPersonasIcon name="school" /></span>
              <div>
                <strong>Admin escolar</strong>
                <small>{{ schoolScopeLabel(selectedUser.schoolScopes) }}</small>
              </div>
              <button v-if="selectedUser.canManageAdminRoles" type="button" data-diagnostic-action="editar-admin-escolar" @click="focusEditor('school')">{{ selectedUser.roleAssignments.schoolAdmin ? 'Editar' : 'Asignar' }}</button>
            </article>

            <article class="role-row" :data-state="selectedUser.roleAssignments.daycareAdmin ? 'active' : 'none'">
              <span><FamilyPersonasIcon name="daycare" /></span>
              <div>
                <strong>Admin guardería</strong>
                <small>{{ selectedUser.unidad.length ? selectedUser.unidad.join(' / ') : 'Sin unidad' }}</small>
              </div>
              <button v-if="selectedUser.canManageAdminRoles" type="button" data-diagnostic-action="editar-admin-guarderia" @click="focusEditor('daycare')">{{ selectedUser.roleAssignments.daycareAdmin ? 'Editar' : 'Asignar' }}</button>
            </article>

            <article v-if="selectedUser.productScopes.length" class="role-row family" data-state="family">
              <span><FamilyPersonasIcon name="people" /></span>
              <div>
                <strong>Cuenta familiar</strong>
                <small>{{ familyScopeLabel(selectedUser) }}</small>
              </div>
              <button type="button" :disabled="impersonatingId === selectedUser.id" data-diagnostic-action="impersonar-usuario" @click="requestImpersonation(selectedUser)">
                {{ impersonationButtonLabel(selectedUser) }}
              </button>
            </article>
          </section>

          <section v-if="hasChanges" class="pending-panel">
            <strong>Cambios pendientes</strong>
            <ul>
              <li v-for="line in changeLines" :key="line">{{ line }}</li>
            </ul>
            <span v-if="saveBlocker">{{ saveBlocker }}</span>
          </section>
        </template>

        <div v-else class="state-panel empty-detail" data-state="empty">
          <FamilyPersonasIcon name="people" />
          <h2>Selecciona un usuario</h2>
        </div>
      </main>

      <aside class="edit-panel">
        <template v-if="selectedUser">
          <header>
            <div>
              <p class="eyebrow">Roles</p>
              <h2>{{ editorTitle }}</h2>
            </div>
            <button v-if="hasChanges" class="text-button" type="button" @click="resetDraft">Deshacer</button>
          </header>

          <template v-if="selectedUser.canManageAdminRoles">
          <section class="editor-card" :class="{ active: editorMode === 'school' }">
            <label class="toggle-row">
              <input v-model="roleDraft.schoolAdmin" type="checkbox" @change="ensureSchoolScope" />
              <span class="switch" aria-hidden="true" />
              <span>
                <strong>Admin escolar</strong>
                <small>Plantel y grado opcional</small>
              </span>
            </label>

            <div v-if="roleDraft.schoolAdmin" class="scope-editor">
              <div v-for="(scope, index) in schoolScopesDraft" :key="index" class="scope-row">
                <label>
                  <span>Plantel</span>
                  <select v-model="scope.plantel">
                    <option value="">Seleccionar</option>
                    <option v-for="plantel in schoolPlantelOptions" :key="plantel" :value="plantel">{{ plantel }}</option>
                  </select>
                </label>
                <label>
                  <span>Grado</span>
                  <select v-model="scope.grado">
                    <option value="">Todos</option>
                    <option v-for="grado in gradeOptions" :key="grado" :value="grado">{{ grado }}</option>
                  </select>
                </label>
                <button class="icon-button" type="button" aria-label="Quitar plantel" @click="removeSchoolScope(index)">
                  <FamilyPersonasIcon name="trash" />
                </button>
              </div>
              <button class="add-row" type="button" @click="addSchoolScope">Agregar plantel</button>
            </div>
          </section>

          <section class="editor-card" :class="{ active: editorMode === 'daycare' }">
            <label class="toggle-row">
              <input v-model="roleDraft.daycareAdmin" type="checkbox" />
              <span class="switch" aria-hidden="true" />
              <span>
                <strong>Admin guardería</strong>
                <small>Unidad asignada</small>
              </span>
            </label>

            <div v-if="roleDraft.daycareAdmin" class="unit-grid">
              <button
                v-for="unidad in unitOptions"
                :key="unidad"
                type="button"
                :class="{ active: daycareUnitsDraft.includes(unidad) }"
                @click="toggleUnidad(unidad)"
              >
                {{ unidad }}
              </button>
            </div>
          </section>
          </template>

          <section v-else class="editor-card">
            <strong>Cuenta familiar</strong>
            <small>El acceso viene de alumnos, familia o sala.</small>
          </section>
        </template>

        <div v-else class="state-panel compact" data-state="empty">
          <h2>Roles</h2>
        </div>
      </aside>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { navigateTo, useFetch, useRoute, useRouter } from 'nuxt/app'
import type { AppSessionUser, PublicSession } from '~/types/session'
import type { SuperAdminDirectoryResponse, SuperAdminDirectoryScope, SuperAdminRoleAssignments, SuperAdminSchoolScope, SuperAdminUserSummary } from '~/types/superadmin'
import { defaultFamilyRoute } from '~/utils/sessionScopes'
import { setCachedRouteSession } from '~/utils/routeSession'
import { displayMatricula } from '~/utils/matricula'

definePageMeta({ layout: 'admin', middleware: ['admin', 'superadmin'] })

type EditorMode = 'school' | 'daycare'

const route = useRoute()
const router = useRouter()

const scopeOptions: Array<{ value: SuperAdminDirectoryScope; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'internal', label: 'Internos' },
  { value: 'schoolFamilies', label: 'Familias escolar' },
  { value: 'daycare', label: 'Familias guardería' },
  { value: 'impersonable', label: 'Soporte' }
]

const selectedPlantel = ref(queryValue(route.query.plantel))
const selectedScope = ref<SuperAdminDirectoryScope>(normalizeScope(route.query.scope))
const search = ref(queryValue(route.query.buscar))
const selectedUser = ref<SuperAdminUserSummary | null>(null)
const editorMode = ref<EditorMode>('school')
const actionError = ref('')
const actionNotice = ref('')
const saving = ref(false)
const impersonatingId = ref<number | null>(null)
const confirmingImpersonationId = ref<number | null>(null)
const hydrated = ref(false)
const roleDraft = ref<SuperAdminRoleAssignments>({ schoolAdmin: false, daycareAdmin: false })
const schoolScopesDraft = ref<SuperAdminSchoolScope[]>([])
const daycareUnitsDraft = ref<string[]>([])

const query = computed(() => ({
  plantel: selectedPlantel.value,
  search: search.value,
  scope: selectedScope.value,
  limit: 160
}))

const { data: directory, pending, error: loadError, refresh } = useFetch<SuperAdminDirectoryResponse>('/api/admin/superadmin/users', {
  query,
  watch: [query],
  timeout: 15000,
  dedupe: 'cancel'
})

const visibleUsers = computed(() => directory.value?.users || [])
const schoolPlantelOptions = computed(() => directory.value?.planteles.filter((item) => item && !unitOptions.value.includes(item)) || [])
const gradeOptions = computed(() => directory.value?.grados || [])
const unitOptions = computed(() => {
  const values = [
    ...(directory.value?.unidades || []),
    ...(selectedUser.value?.unidad || [])
  ]
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'))
})

const editorTitle = computed(() => editorMode.value === 'school' ? 'Admin escolar' : 'Admin guardería')
const hasChanges = computed(() => Boolean(selectedUser.value && draftSignature() !== userSignature(selectedUser.value)))
const saveBlocker = computed(() => {
  if (!selectedUser.value || !hasChanges.value) return ''
  if (roleDraft.value.schoolAdmin && !validSchoolScopes.value.length) return 'Falta plantel escolar.'
  if (roleDraft.value.daycareAdmin && !daycareUnitsDraft.value.length) return 'Falta unidad de guardería.'
  return ''
})
const validSchoolScopes = computed(() => normalizeSchoolScopes(schoolScopesDraft.value))
const changeLines = computed(() => {
  if (!selectedUser.value) return []
  const lines: string[] = []
  const current = selectedUser.value
  if (roleDraft.value.schoolAdmin !== current.roleAssignments.schoolAdmin || schoolScopeLabel(validSchoolScopes.value) !== schoolScopeLabel(current.schoolScopes)) {
    lines.push(roleDraft.value.schoolAdmin ? `Admin escolar: ${schoolScopeLabel(validSchoolScopes.value)}` : 'Quitar Admin escolar')
  }
  if (roleDraft.value.daycareAdmin !== current.roleAssignments.daycareAdmin || daycareUnitsDraft.value.join('|') !== current.unidad.join('|')) {
    lines.push(roleDraft.value.daycareAdmin ? `Admin guardería: ${daycareUnitsDraft.value.join(' / ')}` : 'Quitar Admin guardería')
  }
  return lines
})

watch(directory, (value) => {
  if (!hydrated.value) return
  selectInitialUser(value)
}, { immediate: true })

watch([selectedScope, selectedPlantel], () => {
  selectedUser.value = null
  syncQuery()
})

onMounted(() => {
  hydrated.value = true
  selectInitialUser(directory.value)
  syncQuery()
})

function selectInitialUser(value: SuperAdminDirectoryResponse | null | undefined) {
  if (!value?.users.length) {
    selectedUser.value = null
    return
  }
  const requestedId = Number(route.query.usuario || 0)
  const next = value.users.find((user) => user.id === requestedId) || selectedUser.value && value.users.find((user) => user.id === selectedUser.value?.id) || value.users[0]
  if (next) selectUser(next, false)
}

function queryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || '').trim()
  return String(value || '').trim()
}

function normalizeScope(value: unknown): SuperAdminDirectoryScope {
  const source = queryValue(value)
  return source === 'daycare' || source === 'schoolFamilies' || source === 'internal' || source === 'impersonable' ? source : 'all'
}

function displayName(user: SuperAdminUserSummary) {
  return user.displayName || user.nombre_nino || user.email || displayMatricula(user.username) || `Usuario ${user.id}`
}

function initials(user: SuperAdminUserSummary) {
  return displayName(user).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'HP'
}

function accountLine(user: SuperAdminUserSummary) {
  return [user.email || displayMatricula(user.username), user.sala ? `Sala ${user.sala}` : '', user.campus || user.empresa || ''].filter(Boolean).join(' / ') || `ID ${user.id}`
}

function accountType(user: SuperAdminUserSummary) {
  if (user.audience === 'internal') return 'Cuenta interna'
  if (user.audience === 'daycareFamily') return 'Familia guardería'
  if (user.audience === 'schoolFamily') return 'Familia escolar'
  if (user.audience === 'multiProductFamily') return 'Familia escolar y guardería'
  return 'Usuario'
}

function rowState(user: SuperAdminUserSummary) {
  if (user.adminScopes.length) return 'admin'
  if (user.productScopes.length) return 'family'
  return 'none'
}

function roleSummary(user: SuperAdminUserSummary) {
  const roles: string[] = []
  if (user.roleAssignments.schoolAdmin) roles.push(user.schoolScopes.length ? 'Escolar' : 'Escolar pendiente')
  if (user.roleAssignments.daycareAdmin) roles.push('Guardería')
  if (roles.length) return roles.join(' + ')
  if (user.productScopes.length) return 'Familia'
  return 'Sin rol'
}

function familyScopeLabel(user: SuperAdminUserSummary) {
  const labels: string[] = []
  if (user.productScopes.includes('personasAutorizadas')) labels.push('Escolar')
  if (user.productScopes.includes('daycare')) labels.push(user.unidad[0] || 'Guardería')
  return labels.join(' / ')
}

function schoolScopeLabel(scopes: SuperAdminSchoolScope[]) {
  if (!scopes.length) return 'Plantel pendiente'
  return scopes.map((scope) => [scope.plantel, scope.grado || 'todos'].filter(Boolean).join(' / ')).join(' + ')
}

function schoolRoleState(user: SuperAdminUserSummary) {
  if (!user.roleAssignments.schoolAdmin) return 'none'
  return user.schoolScopes.length ? 'active' : 'incomplete'
}

function normalizeSchoolScopes(scopes: SuperAdminSchoolScope[]) {
  const byKey = new Map<string, SuperAdminSchoolScope>()
  for (const scope of scopes) {
    const plantel = String(scope.plantel || '').trim().toUpperCase()
    if (!plantel) continue
    const grado = String(scope.grado || '').trim()
    const nivel = String(scope.nivel || '').trim()
    byKey.set([plantel, nivel, grado].join('|'), { plantel, nivel: nivel || null, grado: grado || null })
  }
  return Array.from(byKey.values())
}

function userSignature(user: SuperAdminUserSummary) {
  return JSON.stringify({
    roles: user.roleAssignments,
    schoolScopes: normalizeSchoolScopes(user.schoolScopes),
    unidades: user.roleAssignments.daycareAdmin ? [...user.unidad].sort() : []
  })
}

function draftSignature() {
  return JSON.stringify({
    roles: roleDraft.value,
    schoolScopes: validSchoolScopes.value,
    unidades: roleDraft.value.daycareAdmin ? [...daycareUnitsDraft.value].sort() : []
  })
}

function selectUser(user: SuperAdminUserSummary, updateRoute = true) {
  selectedUser.value = user
  roleDraft.value = { ...user.roleAssignments }
  schoolScopesDraft.value = user.schoolScopes.length ? user.schoolScopes.map((scope) => ({ ...scope })) : []
  daycareUnitsDraft.value = [...user.unidad]
  editorMode.value = user.roleAssignments.daycareAdmin && !user.roleAssignments.schoolAdmin ? 'daycare' : 'school'
  actionError.value = ''
  actionNotice.value = ''
  confirmingImpersonationId.value = null
  if (updateRoute) syncQuery(user.id)
}

function focusEditor(mode: EditorMode) {
  editorMode.value = mode
  if (mode === 'school') {
    roleDraft.value.schoolAdmin = true
    ensureSchoolScope()
  }
  if (mode === 'daycare') {
    roleDraft.value.daycareAdmin = true
    if (!daycareUnitsDraft.value.length && unitOptions.value[0]) daycareUnitsDraft.value = [unitOptions.value[0]]
  }
}

function ensureSchoolScope() {
  if (roleDraft.value.schoolAdmin && !schoolScopesDraft.value.length) addSchoolScope()
}

function addSchoolScope() {
  schoolScopesDraft.value.push({ plantel: schoolPlantelOptions.value[0] || '', nivel: null, grado: null })
}

function removeSchoolScope(index: number) {
  schoolScopesDraft.value.splice(index, 1)
  if (!schoolScopesDraft.value.length) roleDraft.value.schoolAdmin = false
}

function toggleUnidad(unidad: string) {
  const set = new Set(daycareUnitsDraft.value)
  if (set.has(unidad)) set.delete(unidad)
  else set.add(unidad)
  daycareUnitsDraft.value = Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))
}

function resetDraft() {
  if (selectedUser.value) selectUser(selectedUser.value, false)
}

async function refreshDirectory() {
  await refresh()
}

async function saveRoles() {
  if (!selectedUser.value || saveBlocker.value) return
  saving.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    const updated = await $fetch<SuperAdminUserSummary>(`/api/admin/superadmin/users/${selectedUser.value.id}/roles`, {
      method: 'POST',
      body: {
        roles: roleDraft.value,
        schoolScopes: validSchoolScopes.value,
        unidades: roleDraft.value.daycareAdmin ? daycareUnitsDraft.value : []
      }
    })
    if (directory.value) {
      directory.value.users = directory.value.users.map((user) => user.id === updated.id ? updated : user)
    }
    selectUser(updated, false)
    actionNotice.value = 'Roles guardados.'
  } catch (error: unknown) {
    actionError.value = errorMessage(error, 'No se pudieron guardar los roles.')
  } finally {
    saving.value = false
  }
}

function impersonationButtonLabel(user: SuperAdminUserSummary) {
  if (!user.canImpersonate) return 'No disponible'
  if (impersonatingId.value === user.id) return 'Abriendo...'
  if (confirmingImpersonationId.value === user.id) return 'Confirmar'
  return 'Vista familiar'
}

async function requestImpersonation(user: SuperAdminUserSummary) {
  if (!user.canImpersonate) return
  if (confirmingImpersonationId.value !== user.id) {
    confirmingImpersonationId.value = user.id
    actionNotice.value = `Confirma vista familiar de ${displayName(user)}.`
    return
  }

  impersonatingId.value = user.id
  actionError.value = ''
  actionNotice.value = ''
  try {
    const response = await $fetch<{ user: AppSessionUser } & PublicSession>('/api/auth/admin/impersonate', {
      method: 'POST',
      body: { userId: user.id }
    })
    setCachedRouteSession(response)
    await navigateTo(defaultFamilyRoute(response.user))
  } catch (error: unknown) {
    actionError.value = errorMessage(error, 'No se pudo abrir la vista familiar.')
  } finally {
    impersonatingId.value = null
    confirmingImpersonationId.value = null
  }
}

function syncQuery(userId?: number) {
  if (!import.meta.client) return
  const next: Record<string, string> = {}
  if (search.value.trim()) next.buscar = search.value.trim()
  if (selectedScope.value !== 'all') next.scope = selectedScope.value
  if (selectedPlantel.value) next.plantel = selectedPlantel.value
  if (userId) next.usuario = String(userId)
  router.replace({ path: route.path, query: next })
}

function errorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== 'object') return fallback
  const candidate = error as { data?: { message?: string; statusMessage?: string }; message?: string; statusMessage?: string }
  return candidate.data?.message || candidate.data?.statusMessage || candidate.message || candidate.statusMessage || fallback
}
</script>

<style scoped>
.users-console {
  --surface: #ffffff;
  --muted-surface: #f7fafb;
  --line: #dce5eb;
  --line-soft: #e8eef2;
  --ink: #142033;
  --muted: #64748b;
  --accent: #0d766d;
  display: grid;
  gap: 12px;
}

.page-head,
.list-panel,
.detail-panel,
.edit-panel,
.state-panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, .05);
}

.page-head {
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-height: 68px;
  padding: 16px 18px;
}

.page-head h1,
.identity-strip h2,
.edit-panel h2,
.state-panel h2 {
  color: var(--ink);
  font-family: var(--font-body);
  margin: 0;
}

.page-head h1 {
  font-size: 2rem;
  line-height: 1;
}

.eyebrow,
.identity-strip p,
.scope-row span {
  color: var(--muted);
  font-size: .72rem;
  font-weight: 850;
  letter-spacing: .08em;
  margin: 0;
  text-transform: uppercase;
}

.users-layout {
  align-items: start;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(300px, 360px) minmax(0, 1fr) minmax(310px, 380px);
}

.list-panel,
.detail-panel,
.edit-panel {
  display: grid;
  gap: 12px;
  padding: 12px;
}

.list-panel,
.edit-panel {
  position: sticky;
  top: calc(var(--topbar-height) + 14px);
}

.search-box {
  align-items: center;
  background: var(--muted-surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  display: grid;
  gap: 8px;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  min-height: 44px;
  padding: 5px 6px 5px 10px;
}

.search-box input,
.filters select,
.scope-row select {
  background: transparent;
  border: 0;
  color: var(--ink);
  font: inherit;
  min-width: 0;
  outline: 0;
}

.search-box button,
.role-row button,
.add-row,
.text-button {
  background: #ffffff;
  border: 1px solid #cfe0e7;
  border-radius: 8px;
  color: var(--accent);
  cursor: pointer;
  font-size: .8rem;
  font-weight: 850;
  min-height: 34px;
  padding: 0 11px;
}

.filters {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.filters select {
  background: var(--muted-surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  min-height: 40px;
  padding: 0 10px;
}

.user-list {
  display: grid;
  gap: 5px;
  max-height: calc(100vh - 250px);
  overflow: auto;
}

.user-row {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  display: grid;
  gap: 9px;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  padding: 8px;
  text-align: left;
}

.user-row:hover,
.user-row.selected {
  background: #f3faf8;
  border-color: #cae2dc;
}

.avatar {
  align-items: center;
  background: #eef7f5;
  border: 1px solid #cae2dc;
  border-radius: 8px;
  color: var(--accent);
  display: inline-flex;
  font-size: .78rem;
  font-weight: 900;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.avatar.large {
  font-size: 1.1rem;
  height: 60px;
  width: 60px;
}

.row-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.row-copy strong,
.row-copy small,
.identity-strip small,
.role-row small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-copy strong,
.role-row strong {
  color: var(--ink);
  font-size: .88rem;
}

.row-copy small,
.identity-strip small,
.role-row small,
.pending-panel li,
.pending-panel span,
.toggle-row small {
  color: var(--muted);
  font-size: .76rem;
}

.user-row b,
.identity-strip b {
  border-radius: 999px;
  font-size: .68rem;
  font-weight: 850;
  padding: 5px 8px;
  white-space: nowrap;
}

[data-state='admin'] b,
.identity-strip[data-state='admin'] b,
.role-row[data-state='active'] {
  background: #e7f8ef;
  border-color: #bfead0;
  color: #15803d;
}

[data-state='family'] b,
.identity-strip[data-state='family'] b,
.role-row[data-state='family'] {
  background: #eef7fb;
  border-color: #cfe7fb;
  color: #236188;
}

[data-state='none'] b,
.identity-strip[data-state='none'] b,
.role-row[data-state='none'] {
  background: #f4f6f8;
  border-color: var(--line);
  color: var(--muted);
}

.role-row[data-state='incomplete'] {
  background: #fff9e8;
  border-color: #f2d58d;
  color: #7c5d12;
}

.identity-strip {
  align-items: center;
  background: var(--muted-surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  display: grid;
  gap: 14px;
  grid-template-columns: 60px minmax(0, 1fr) auto;
  padding: 14px;
}

.identity-strip h2 {
  font-size: 1.55rem;
}

.role-list {
  display: grid;
  gap: 8px;
}

.role-row {
  align-items: center;
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 8px;
  display: grid;
  gap: 12px;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  min-height: 68px;
  padding: 11px;
}

.role-row > span:first-child {
  align-items: center;
  background: #eef7f5;
  border-radius: 8px;
  color: var(--accent);
  display: inline-flex;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.role-row > div,
.toggle-row > span:last-child {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.pending-panel,
.editor-card {
  background: var(--muted-surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  display: grid;
  gap: 10px;
  padding: 12px;
}

.pending-panel ul {
  display: grid;
  gap: 4px;
  margin: 0;
  padding-left: 18px;
}

.edit-panel header,
.toggle-row {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.text-button {
  border: 0;
  min-height: 30px;
}

.editor-card.active {
  border-color: #9ed8cb;
}

.toggle-row {
  justify-content: start;
}

.toggle-row input {
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
  box-shadow: 0 1px 4px rgba(15, 23, 42, .2);
  content: '';
  height: 18px;
  left: 3px;
  position: absolute;
  top: 3px;
  transition: transform .15s ease;
  width: 18px;
}

.toggle-row input:checked + .switch {
  background: var(--accent);
}

.toggle-row input:checked + .switch::after {
  transform: translateX(18px);
}

.scope-editor,
.unit-grid {
  display: grid;
  gap: 8px;
}

.scope-row {
  align-items: end;
  display: grid;
  gap: 8px;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 36px;
}

.scope-row label {
  background: #ffffff;
  border: 1px solid var(--line-soft);
  border-radius: 8px;
  display: grid;
  gap: 3px;
  padding: 7px 9px;
}

.icon-button {
  align-items: center;
  background: #fff1f2;
  border: 0;
  border-radius: 8px;
  color: #be123c;
  cursor: pointer;
  display: inline-flex;
  height: 36px;
  justify-content: center;
  width: 36px;
}

.unit-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.unit-grid button {
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--muted);
  cursor: pointer;
  font-weight: 850;
  min-height: 38px;
}

.unit-grid button.active {
  background: #e7f8ef;
  border-color: #bfead0;
  color: #15803d;
}

.surface-message {
  background: #edfdf7;
  border: 1px solid #b7ead6;
  border-radius: 8px;
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
  min-height: 240px;
  place-items: center;
  padding: 24px;
  text-align: center;
}

.state-panel.compact {
  min-height: 160px;
}

.empty-detail {
  min-height: 480px;
}

@media (max-width: 1180px) {
  .users-layout {
    grid-template-columns: minmax(300px, 360px) minmax(0, 1fr);
  }
  .edit-panel {
    grid-column: 2;
    position: static;
  }
}

@media (max-width: 860px) {
  .users-layout,
  .identity-strip,
  .role-row,
  .scope-row {
    grid-template-columns: 1fr;
  }
  .list-panel {
    position: static;
  }
  .edit-panel {
    grid-column: auto;
  }
  .user-list {
    max-height: none;
  }
}
</style>
