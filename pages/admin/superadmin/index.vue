<template>
  <section class="users-console" data-product-area="superadmin" data-product-screen="directory">
    <header class="page-head">
      <div class="title-lockup">
        <span class="brand-orb" aria-hidden="true"><FamilyPersonasIcon name="people" /></span>
        <div>
          <p class="eyebrow">Super Admin</p>
          <h1>Usuarios y roles</h1>
        </div>
      </div>
      <button class="utility-action" type="button" :disabled="pending" @click="refreshDirectory">
        <FamilyPersonasIcon name="replace" />
        <span>{{ pending ? 'Actualizando' : 'Actualizar' }}</span>
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
              <button v-if="selectedUser.canManageAdminRoles" type="button" data-diagnostic-action="editar-admin-escolar" @click="openRoleEditor('school')">{{ selectedUser.roleAssignments.schoolAdmin ? 'Editar acceso escolar' : 'Asignar acceso escolar' }}</button>
            </article>

            <article class="role-row" :data-state="selectedUser.roleAssignments.daycareAdmin ? 'active' : 'none'">
              <span><FamilyPersonasIcon name="daycare" /></span>
              <div>
                <strong>Admin guardería</strong>
                <small>{{ selectedUser.unidad.length ? selectedUser.unidad.join(' / ') : 'Sin unidad' }}</small>
              </div>
              <button v-if="selectedUser.canManageAdminRoles" type="button" data-diagnostic-action="editar-admin-guarderia" @click="openRoleEditor('daycare')">{{ selectedUser.roleAssignments.daycareAdmin ? 'Editar acceso guardería' : 'Asignar acceso guardería' }}</button>
            </article>

            <article v-if="selectedUser.productScopes.length" class="role-row family" data-state="family">
              <span><FamilyPersonasIcon name="people" /></span>
              <div>
                <strong>Cuenta familiar</strong>
                <small>{{ familyScopeLabel(selectedUser) }}</small>
              </div>
              <div class="row-actions">
                <button type="button" :disabled="impersonatingId === selectedUser.id" data-diagnostic-action="impersonar-usuario" @click="requestImpersonation(selectedUser)">
                  {{ impersonationButtonLabel(selectedUser) }}
                </button>
                <button v-if="confirmingImpersonationId === selectedUser.id" class="ghost-action" type="button" data-diagnostic-action="cancelar-impersonacion" @click="cancelImpersonation">
                  Cancelar
                </button>
              </div>
            </article>
          </section>
        </template>

        <div v-else class="state-panel empty-detail" data-state="empty">
          <FamilyPersonasIcon name="people" />
          <h2>Selecciona un usuario</h2>
        </div>
      </main>

    </section>

    <Teleport to="body">
      <section v-if="roleEditorOpen && selectedUser" class="modal-backdrop" data-product-panel="access-editor" @click.self="cancelRoleEditor">
        <article class="access-drawer" role="dialog" aria-modal="true" aria-labelledby="access-editor-title">
          <header class="drawer-head">
            <div>
              <p class="eyebrow">Acceso</p>
              <h2 id="access-editor-title">{{ editorTitle }}</h2>
              <small>{{ displayName(selectedUser) }}</small>
            </div>
          </header>

          <template v-if="selectedUser.canManageAdminRoles">
            <section v-if="editorMode === 'school'" class="editor-card active">
              <label class="toggle-row">
                <input v-model="roleDraft.schoolAdmin" type="checkbox" @change="ensureSchoolScope" />
                <span class="switch" aria-hidden="true" />
                <span>
                  <strong>Admin escolar</strong>
                  <small>Plantel con grado cuando aplique</small>
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

            <section v-else class="editor-card active">
              <label class="toggle-row">
                <input v-model="roleDraft.daycareAdmin" type="checkbox" />
                <span class="switch" aria-hidden="true" />
                <span>
                  <strong>Admin guardería</strong>
                  <small>Unidades donde puede operar</small>
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

            <section v-if="hasChanges || saveBlocker" class="pending-panel">
              <strong>Cambios pendientes</strong>
              <ul v-if="changeLines.length">
                <li v-for="line in changeLines" :key="line">{{ line }}</li>
              </ul>
              <span v-if="saveBlocker">{{ saveBlocker }}</span>
            </section>
          </template>

          <section v-else class="editor-card">
            <strong>Cuenta familiar</strong>
            <small>El acceso viene de alumnos, familia o sala.</small>
          </section>

          <footer class="drawer-actions">
            <button class="btn btn-secondary" type="button" @click="cancelRoleEditor">Cancelar</button>
            <button class="btn btn-primary" type="button" :disabled="!hasChanges || saving || Boolean(saveBlocker)" @click="saveRoles">
              {{ saving ? 'Guardando...' : 'Guardar acceso' }}
            </button>
          </footer>
        </article>
      </section>
    </Teleport>
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
const roleEditorOpen = ref(false)
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
  roleEditorOpen.value = false
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
  if (user.roleAssignments.schoolAdmin) roles.push(user.schoolScopes.length ? 'Escolar' : 'Falta plantel')
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
  if (!scopes.length) return 'Sin plantel asignado'
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
  hydrateDraft(user)
  editorMode.value = user.roleAssignments.daycareAdmin && !user.roleAssignments.schoolAdmin ? 'daycare' : 'school'
  roleEditorOpen.value = false
  actionError.value = ''
  actionNotice.value = ''
  confirmingImpersonationId.value = null
  if (updateRoute) syncQuery(user.id)
}

function hydrateDraft(user: SuperAdminUserSummary) {
  roleDraft.value = { ...user.roleAssignments }
  schoolScopesDraft.value = user.schoolScopes.length ? user.schoolScopes.map((scope) => ({ ...scope })) : []
  daycareUnitsDraft.value = [...user.unidad]
}

function openRoleEditor(mode: EditorMode) {
  focusEditor(mode)
  roleEditorOpen.value = true
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
  if (selectedUser.value) hydrateDraft(selectedUser.value)
}

function cancelRoleEditor() {
  resetDraft()
  roleEditorOpen.value = false
  actionError.value = ''
}

function cancelImpersonation() {
  confirmingImpersonationId.value = null
  actionNotice.value = ''
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
    roleEditorOpen.value = false
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
  --surface: rgba(255, 255, 255, 0.94);
  --surface-warm: rgba(255, 252, 244, 0.94);
  --muted-surface: #f6fbf8;
  --line: rgba(20, 88, 78, 0.16);
  --line-soft: rgba(20, 88, 78, 0.10);
  --ink: #102235;
  --muted: #607086;
  --accent: #07877d;
  --accent-strong: #075f58;
  --sun: #f6b94f;
  display: grid;
  gap: 14px;
}

.page-head {
  align-items: center;
  background:
    radial-gradient(circle at 8% 15%, rgba(8, 135, 125, 0.12), transparent 34%),
    radial-gradient(circle at 84% 8%, rgba(246, 185, 79, 0.18), transparent 28%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 253, 249, 0.94));
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: 0 22px 55px rgba(14, 40, 55, 0.08);
  display: flex;
  justify-content: space-between;
  min-height: 86px;
  overflow: hidden;
  padding: 18px 22px;
  position: relative;
}

.page-head::after {
  background: linear-gradient(180deg, var(--accent), #70b84d);
  border-radius: 999px;
  content: '';
  height: 72px;
  opacity: 0.14;
  position: absolute;
  right: 38px;
  top: -34px;
  transform: rotate(32deg);
  width: 12px;
}

.title-lockup {
  align-items: center;
  display: flex;
  gap: 14px;
  min-width: 0;
}

.brand-orb {
  align-items: center;
  background: linear-gradient(135deg, #f0fbf7, #fff4d9);
  border: 1px solid rgba(8, 135, 125, 0.18);
  border-radius: 18px;
  color: var(--accent);
  display: inline-flex;
  height: 48px;
  justify-content: center;
  width: 48px;
}

.page-head h1,
.identity-strip h2,
.access-drawer h2,
.state-panel h2 {
  color: var(--ink);
  font-family: var(--font-title, var(--font-body));
  margin: 0;
}

.page-head h1 {
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  line-height: 0.98;
}

.eyebrow,
.identity-strip p,
.scope-row span {
  color: var(--accent-strong);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  margin: 0;
  text-transform: uppercase;
}

.utility-action,
.search-box button,
.role-row button,
.add-row,
.ghost-action,
.text-button {
  align-items: center;
  background: #ffffff;
  border: 1px solid rgba(8, 135, 125, 0.22);
  border-radius: 13px;
  color: var(--accent-strong);
  cursor: pointer;
  display: inline-flex;
  font-size: 0.82rem;
  font-weight: 900;
  gap: 7px;
  min-height: 38px;
  padding: 0 13px;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.utility-action:hover,
.search-box button:hover,
.role-row button:hover,
.add-row:hover {
  border-color: rgba(8, 135, 125, 0.36);
  box-shadow: 0 10px 22px rgba(8, 135, 125, 0.12);
  transform: translateY(-1px);
}

.utility-action:disabled,
.search-box button:disabled,
.role-row button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

.users-layout {
  align-items: start;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(320px, 390px) minmax(0, 1fr);
}

.list-panel,
.detail-panel,
.state-panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: 0 18px 48px rgba(14, 40, 55, 0.07);
}

.list-panel,
.detail-panel {
  display: grid;
  gap: 12px;
  padding: 12px;
}

.detail-panel {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.96), rgba(250,253,250,0.92));
}

.list-panel {
  position: sticky;
  top: calc(var(--topbar-height) + 14px);
}

.search-box {
  align-items: center;
  background: #f6fbfa;
  border: 1px solid rgba(8, 135, 125, 0.16);
  border-radius: 16px;
  display: grid;
  gap: 10px;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  min-height: 52px;
  padding: 6px 7px 6px 13px;
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

.filters {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.filters select {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 15px;
  min-height: 44px;
  padding: 0 12px;
}

.user-list {
  display: grid;
  gap: 6px;
  max-height: calc(100vh - 250px);
  overflow: auto;
  padding-right: 2px;
}

.user-row {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 17px;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  padding: 9px;
  text-align: left;
  transition: background 0.16s ease, border-color 0.16s ease, transform 0.16s ease;
}

.user-row:hover,
.user-row.selected {
  background: linear-gradient(135deg, rgba(239, 251, 247, 0.96), rgba(255, 250, 235, 0.64));
  border-color: rgba(8, 135, 125, 0.22);
}

.user-row.selected {
  box-shadow: inset 3px 0 0 var(--accent);
}

.avatar {
  align-items: center;
  background: linear-gradient(135deg, #eefaf7, #fff5da);
  border: 1px solid rgba(8, 135, 125, 0.20);
  border-radius: 14px;
  color: var(--accent-strong);
  display: inline-flex;
  font-size: 0.8rem;
  font-weight: 950;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.avatar.large {
  border-radius: 18px;
  font-size: 1.12rem;
  height: 64px;
  width: 64px;
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
  font-size: 0.9rem;
}

.row-copy small,
.identity-strip small,
.role-row small,
.pending-panel li,
.pending-panel span,
.toggle-row small {
  color: var(--muted);
  font-size: 0.76rem;
}

.user-row b,
.identity-strip b {
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 900;
  padding: 5px 8px;
  white-space: nowrap;
}

[data-state='admin'] b,
.identity-strip[data-state='admin'] b {
  background: #e4f8ee;
  color: #147440;
}

[data-state='family'] b,
.identity-strip[data-state='family'] b {
  background: #edf7ff;
  color: #285f88;
}

[data-state='none'] b,
.identity-strip[data-state='none'] b {
  background: #f2f5f7;
  color: var(--muted);
}

.identity-strip {
  align-items: center;
  background:
    radial-gradient(circle at 100% 0%, rgba(8, 135, 125, 0.10), transparent 30%),
    linear-gradient(135deg, #ffffff, #f7fcfa);
  border: 1px solid var(--line);
  border-radius: 20px;
  display: grid;
  gap: 15px;
  grid-template-columns: 64px minmax(0, 1fr) auto;
  padding: 16px;
}

.identity-strip h2 {
  font-size: clamp(1.45rem, 2.3vw, 2rem);
  letter-spacing: -0.02em;
}

.role-list {
  display: grid;
  gap: 10px;
}

.role-row {
  align-items: center;
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 18px;
  display: grid;
  gap: 13px;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  min-height: 76px;
  padding: 12px 13px;
  position: relative;
}

.role-row::before {
  background: var(--accent);
  border-radius: 999px;
  content: '';
  inset: 14px auto 14px 0;
  opacity: 0;
  position: absolute;
  width: 4px;
}

.role-row[data-state='active'] {
  background: linear-gradient(135deg, #f4fdf8, #ffffff);
  border-color: rgba(8, 135, 125, 0.24);
}

.role-row[data-state='incomplete'] {
  background: linear-gradient(135deg, #fff8e7, #ffffff);
  border-color: rgba(205, 144, 24, 0.35);
}

.role-row[data-state='active']::before,
.role-row[data-state='incomplete']::before {
  opacity: 1;
}

.role-row[data-state='incomplete']::before {
  background: var(--sun);
}

.role-row[data-state='family'] {
  background: #f8fbff;
  border-color: rgba(35, 97, 136, 0.16);
}

.role-row[data-state='none'] {
  background: #f8fafb;
}

.role-row > span:first-child {
  align-items: center;
  background: #edf9f6;
  border-radius: 15px;
  color: var(--accent);
  display: inline-flex;
  height: 46px;
  justify-content: center;
  width: 46px;
}

.role-row[data-state='incomplete'] > span:first-child {
  background: #fff2cf;
  color: #9b6500;
}

.role-row > div,
.toggle-row > span:last-child {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
}

.ghost-action {
  border-color: transparent;
  color: var(--muted);
}

.pending-panel,
.editor-card {
  background: var(--muted-surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  display: grid;
  gap: 10px;
  padding: 14px;
}

.pending-panel ul {
  display: grid;
  gap: 4px;
  margin: 0;
  padding-left: 18px;
}

.drawer-head,
.toggle-row {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.modal-backdrop {
  --surface: #ffffff;
  --muted-surface: #f7fafb;
  --line: rgba(20, 88, 78, 0.16);
  --line-soft: rgba(20, 88, 78, 0.10);
  --ink: #102235;
  --muted: #64748b;
  --accent: #07877d;
  align-items: stretch;
  background: rgba(15, 23, 42, 0.34);
  display: flex;
  inset: 0;
  justify-content: flex-end;
  padding: 14px;
  position: fixed;
  z-index: 80;
}

.access-drawer {
  align-content: start;
  background: var(--surface);
  border: 1px solid rgba(220, 229, 235, 0.95);
  border-radius: 22px;
  box-shadow: 0 30px 90px rgba(15, 23, 42, 0.28);
  display: grid;
  gap: 14px;
  grid-auto-rows: max-content;
  max-height: calc(100vh - 28px);
  max-width: 540px;
  overflow: auto;
  padding: 18px;
  width: min(100%, 540px);
}

.drawer-head {
  border-bottom: 1px solid var(--line-soft);
  padding-bottom: 14px;
}

.drawer-head small {
  color: var(--muted);
  display: block;
  font-size: 0.82rem;
  margin-top: 5px;
}

.drawer-actions {
  border-top: 1px solid var(--line-soft);
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 14px;
}

.text-button {
  border: 0;
  min-height: 32px;
}

.editor-card.active {
  border-color: rgba(8, 135, 125, 0.34);
}

.access-drawer .editor-card {
  align-content: start;
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
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.2);
  content: '';
  height: 18px;
  left: 3px;
  position: absolute;
  top: 3px;
  transition: transform 0.15s ease;
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
  gap: 9px;
}

.scope-row {
  align-items: end;
  display: grid;
  gap: 9px;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 38px;
}

.scope-row label {
  background: #ffffff;
  border: 1px solid var(--line-soft);
  border-radius: 14px;
  display: grid;
  gap: 3px;
  padding: 8px 10px;
}

.icon-button {
  align-items: center;
  background: #fff1f2;
  border: 0;
  border-radius: 13px;
  color: #be123c;
  cursor: pointer;
  display: inline-flex;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.unit-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.unit-grid button {
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 14px;
  color: var(--muted);
  cursor: pointer;
  font-weight: 900;
  min-height: 42px;
}

.unit-grid button.active {
  background: #e7f8ef;
  border-color: #bfead0;
  color: #15803d;
}

.surface-message {
  background: #edfdf7;
  border: 1px solid #b7ead6;
  border-radius: 14px;
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
}

@media (max-width: 860px) {
  .page-head,
  .identity-strip,
  .role-row,
  .scope-row,
  .users-layout {
    grid-template-columns: 1fr;
  }

  .page-head {
    align-items: stretch;
    flex-direction: column;
  }

  .list-panel {
    order: 2;
    position: static;
  }

  .detail-panel {
    order: 1;
  }

  .user-list {
    max-height: none;
  }

  .drawer-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .modal-backdrop {
    padding: 8px;
  }
}
</style>
