<template>
  <section class="ge-cockpit" data-product-area="superadmin" data-product-screen="gestion-escolar-permissions">
    <header class="ge-hero">
      <div>
        <p class="eyebrow">Permisos institucionales</p>
        <h1>Gestion Escolar</h1>
        <p>Define quien puede operar comunicaciones, encuestas, convenios y soporte familiar.</p>
      </div>
      <div class="hero-metrics" aria-label="Resumen Gestion Escolar">
        <article><span>Activos</span><strong>{{ data?.metrics.enabled || 0 }}</strong></article>
        <article><span>Globales</span><strong>{{ data?.metrics.global || 0 }}</strong></article>
        <article><span>Compatibilidad</span><strong>{{ data?.metrics.legacyCommunications || 0 }}</strong></article>
      </div>
    </header>

    <section class="cockpit-grid">
      <aside class="user-browser">
        <form class="search-card" role="search" @submit.prevent="refreshUsers">
          <FamilyPersonasIcon name="search" />
          <input v-model="search" type="search" placeholder="Buscar usuario interno" aria-label="Buscar usuario interno" />
          <button class="mini-button" type="submit">Buscar</button>
        </form>

        <div v-if="pending" class="state-card" data-state="loading">Cargando usuarios...</div>
        <div v-else-if="loadError" class="state-card" data-state="error">No pudimos cargar usuarios internos. Intenta de nuevo.</div>
        <div v-else class="user-list">
          <button
            v-for="user in users"
            :key="user.id"
            class="user-row"
            type="button"
            :class="{ active: selectedUser?.id === user.id }"
            @click="selectUser(user)"
          >
            <span class="avatar">{{ initials(user) }}</span>
            <span>
              <strong>{{ displayName(user) }}</strong>
              <small>{{ user.email || user.username || 'Cuenta interna' }}</small>
            </span>
            <b v-if="user.gestionEscolar.enabled">Activo</b>
          </button>
          <div v-if="!users.length" class="state-card" data-state="empty">No encontramos usuarios internos.</div>
        </div>
      </aside>

      <section v-if="selectedUser" class="permission-workspace">
        <div class="workspace-head">
          <div>
            <p class="eyebrow">Usuario seleccionado</p>
            <h2>{{ displayName(selectedUser) }}</h2>
            <p>{{ selectedUser.email || selectedUser.username }}</p>
          </div>
          <label class="access-switch">
            <input v-model="enabled" type="checkbox" />
            <span>{{ enabled ? 'Gestion Escolar activo' : 'Sin acceso Gestion Escolar' }}</span>
          </label>
        </div>

        <section class="impact-strip">
          <article><span>Familias alcanzadas</span><strong>{{ selectedUser.gestionEscolar.reach.families }}</strong></article>
          <article><span>Estudiantes</span><strong>{{ selectedUser.gestionEscolar.reach.students }}</strong></article>
          <article><span>Planteles</span><strong>{{ selectedUser.gestionEscolar.reach.planteles.join(', ') || 'Sin alcance' }}</strong></article>
        </section>

        <section class="module-cards">
          <article v-for="module in modules" :key="module.key" class="module-card">
            <div>
              <span class="module-icon"><FamilyPersonasIcon :name="module.icon" /></span>
              <h3>{{ module.title }}</h3>
              <p>{{ module.caption }}</p>
            </div>
            <div class="capability-grid">
              <label v-for="capability in module.capabilities" :key="capability.value" class="capability-chip">
                <input type="checkbox" :checked="hasCapability(capability.value)" :disabled="!enabled" @change="toggleCapability(capability.value)" />
                <span>{{ capability.label }}</span>
              </label>
            </div>
          </article>
        </section>

        <section class="scope-builder">
          <div class="section-title">
            <div>
              <p class="eyebrow">Alcances efectivos</p>
              <h3>Capacidad por plantel, grado y grupo</h3>
            </div>
            <button class="mini-button" type="button" :disabled="!enabled" @click="addPermission">Agregar alcance</button>
          </div>

          <article v-for="(permission, index) in draftPermissions" :key="`${permission.capability}-${index}`" class="scope-row">
            <select v-model="permission.capability" :disabled="!enabled">
              <option v-for="capability in capabilityOptions" :key="capability.value" :value="capability.value">{{ capability.label }}</option>
            </select>
            <label class="global-toggle">
              <input v-model="permission.isGlobal" type="checkbox" :disabled="!enabled" />
              <span>Global</span>
            </label>
            <input v-model="permission.plantel" :disabled="!enabled || permission.isGlobal" placeholder="Plantel" />
            <input v-model="permission.nivel" :disabled="!enabled || permission.isGlobal" placeholder="Nivel" />
            <input v-model="permission.grado" :disabled="!enabled || permission.isGlobal" placeholder="Grado" />
            <input v-model="permission.grupo" :disabled="!enabled || permission.isGlobal" placeholder="Grupo" />
            <button class="icon-button" type="button" :disabled="draftPermissions.length <= 1" aria-label="Quitar alcance" @click="removePermission(index)">
              <FamilyPersonasIcon name="trash" />
            </button>
          </article>
        </section>

        <section class="effective-panel">
          <div>
            <p class="eyebrow">Vista clara</p>
            <h3>{{ enabled ? 'Este usuario podra operar solo lo seleccionado' : 'Acceso desactivado' }}</h3>
            <p>{{ effectiveSummary }}</p>
          </div>
          <div class="permission-pills">
            <span v-for="permission in draftPermissions" :key="`${permission.capability}-${permission.plantel}-${permission.grupo}`">
              {{ capabilityLabel(permission.capability) }} · {{ scopeLabel(permission) }}
            </span>
          </div>
        </section>

        <p v-if="actionError" class="action-message error">{{ actionError }}</p>
        <p v-else-if="actionNotice" class="action-message">{{ actionNotice }}</p>
        <div class="actions">
          <button class="btn btn-secondary" type="button" @click="selectUser(selectedUser)">Restaurar</button>
          <button class="btn btn-primary" type="button" :disabled="saving" @click="savePermissions">{{ saving ? 'Guardando...' : 'Guardar acceso auditado' }}</button>
        </div>
      </section>

      <section v-else class="empty-selection">
        <FamilyPersonasIcon name="school" />
        <h2>Selecciona un usuario interno</h2>
        <p>El panel mostrara modulos, riesgos y alcance antes de guardar.</p>
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFetch, useRoute, useRouter } from 'nuxt/app'
import type { GestionEscolarCapability, GestionEscolarPermissionInput, GestionEscolarReachPreview } from '~/types/gestionEscolar'

definePageMeta({ layout: 'admin', middleware: ['admin', 'superadmin'] })

type CockpitUser = {
  id: number
  email: string | null
  username: string | null
  displayName: string | null
  gestionEscolar: {
    enabled: boolean
    capabilities: GestionEscolarCapability[]
    permissions: Array<GestionEscolarPermissionInput & { id?: number }>
    reach: GestionEscolarReachPreview
    legacyCommunications: unknown[]
  }
}

type CockpitResponse = {
  users: CockpitUser[]
  planteles: string[]
  metrics: { total: number; enabled: number; global: number; legacyCommunications: number }
}

const route = useRoute()
const router = useRouter()
const search = ref(typeof route.query.buscar === 'string' ? route.query.buscar : '')
const query = computed(() => ({ search: search.value, limit: 120 }))
const { data, pending, error: loadError, refresh } = useFetch<CockpitResponse>('/api/admin/superadmin/gestion-escolar/users', { query, timeout: 15000 })
const selectedUser = ref<CockpitUser | null>(null)
const enabled = ref(false)
const saving = ref(false)
const actionNotice = ref('')
const actionError = ref('')
const draftPermissions = ref<GestionEscolarPermissionInput[]>([])

type CapabilityOption = { value: GestionEscolarCapability; label: string }

const modules: Array<{ key: string; title: string; icon: string; caption: string; capabilities: CapabilityOption[] }> = [
  { key: 'comunicados', title: 'Comunicados', icon: 'announcement', caption: 'Avisos y adjuntos por audiencia.', capabilities: [{ value: 'comunicados.create', label: 'Crear' }, { value: 'comunicados.publish', label: 'Publicar' }] },
  { key: 'encuestas', title: 'Encuestas', icon: 'survey', caption: 'Google Forms por alcance escolar.', capabilities: [{ value: 'encuestas.manage', label: 'Gestionar' }] },
  { key: 'convenios', title: 'Convenios', icon: 'handshake', caption: 'Flipbooks y publicaciones.', capabilities: [{ value: 'convenios.manage', label: 'Gestionar' }, { value: 'convenios.publish', label: 'Publicar' }] },
  { key: 'familias', title: 'Familias', icon: 'people', caption: 'Visibilidad y soporte seguro.', capabilities: [{ value: 'familias.view', label: 'Ver' }, { value: 'familias.impersonate', label: 'Impersonar' }] }
] 
const capabilityOptions: CapabilityOption[] = modules.flatMap((module) => module.capabilities)
const users = computed(() => data.value?.users || [])
const effectiveSummary = computed(() => {
  if (!enabled.value) return 'Se retirara el rol y sus capacidades activas.'
  const global = draftPermissions.value.filter((permission) => permission.isGlobal).length
  const scoped = draftPermissions.value.length - global
  return `${draftPermissions.value.length} capacidades activas: ${global} globales y ${scoped} con alcance definido.`
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

watch(() => route.query.usuario, (value) => {
  const id = Number(value || 0)
  if (!id) return
  const user = users.value.find((item) => item.id === id)
  if (user) selectUser(user, false)
})

function syncGestionQuery(selectedId = selectedUser.value?.id || null) {
  if (!import.meta.client) return
  const query: Record<string, string> = {}
  if (search.value.trim()) query.buscar = search.value.trim()
  if (selectedId) query.usuario = String(selectedId)
  const keys = new Set([...Object.keys(route.query), ...Object.keys(query)])
  const changed = Array.from(keys).some((key) => String(Array.isArray(route.query[key]) ? route.query[key]?.[0] || '' : route.query[key] || '') !== String(query[key] || ''))
  if (changed) router.replace({ path: route.path, query })
}

function displayName(user: CockpitUser) {
  return user.displayName || user.email || user.username || `Usuario ${user.id}`
}

async function refreshUsers() {
  syncGestionQuery()
  await refresh()
}

function initials(user: CockpitUser) {
  return displayName(user).split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
}

function blankPermission(): GestionEscolarPermissionInput {
  return { capability: 'comunicados.create', isGlobal: false, plantel: '', nivel: '', grado: '', grupo: '', enabled: true }
}

function selectUser(user: CockpitUser | null, updateRoute = true) {
  if (!user) return
  selectedUser.value = user
  enabled.value = Boolean(user.gestionEscolar.enabled)
  draftPermissions.value = user.gestionEscolar.permissions.length
    ? user.gestionEscolar.permissions.map((permission) => ({ ...permission, enabled: true }))
    : [blankPermission()]
  actionNotice.value = ''
  actionError.value = ''
  if (updateRoute) syncGestionQuery(user.id)
}

function hasCapability(capability: GestionEscolarCapability) {
  return draftPermissions.value.some((permission) => permission.capability === capability)
}

function toggleCapability(capability: GestionEscolarCapability) {
  if (!enabled.value) return
  if (hasCapability(capability)) {
    draftPermissions.value = draftPermissions.value.filter((permission) => permission.capability !== capability)
  } else {
    draftPermissions.value.push({ ...blankPermission(), capability })
  }
}

function addPermission() {
  draftPermissions.value.push(blankPermission())
}

function removePermission(index: number) {
  if (draftPermissions.value.length <= 1) return
  draftPermissions.value.splice(index, 1)
}

function capabilityLabel(value: GestionEscolarCapability) {
  return capabilityOptions.find((option) => option.value === value)?.label || value
}

function scopeLabel(permission: GestionEscolarPermissionInput) {
  if (permission.isGlobal) return 'Todas las familias'
  return [permission.plantel && `Plantel ${permission.plantel}`, permission.nivel, permission.grado && `Grado ${permission.grado}`, permission.grupo && `Grupo ${permission.grupo}`].filter(Boolean).join(' · ') || 'Alcance pendiente'
}

async function savePermissions() {
  if (!selectedUser.value) return
  saving.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    const saved = await $fetch<CockpitUser['gestionEscolar']>(`/api/admin/superadmin/gestion-escolar/users/${selectedUser.value.id}`, {
      method: 'POST',
      body: { enabled: enabled.value, permissions: enabled.value ? draftPermissions.value : [] }
    })
    selectedUser.value.gestionEscolar = saved
    actionNotice.value = 'Acceso actualizado y auditado.'
    await refresh()
  } catch (error) {
    const failure = error as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    actionError.value = failure.data?.statusMessage || failure.statusMessage || failure.message || 'No pudimos guardar este acceso.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.ge-cockpit {
  display: grid;
  gap: 18px;
}

.ge-hero,
.permission-workspace,
.user-browser,
.empty-selection {
  background: rgba(255, 255, 255, .96);
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, .07);
}

.ge-hero {
  align-items: center;
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 480px);
  padding: clamp(20px, 2.6vw, 34px);
}

.eyebrow {
  color: #0f8c9a;
  font-size: .72rem;
  font-weight: 850;
  letter-spacing: .12em;
  margin: 0 0 6px;
  text-transform: uppercase;
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
  line-height: 1.08;
}

h1 {
  font-size: clamp(2rem, 3vw, 3.25rem);
}

.ge-hero p,
.workspace-head p,
.module-card p,
.empty-selection p,
.effective-panel p {
  color: #64748b;
  font-weight: 650;
  line-height: 1.55;
}

.hero-metrics,
.impact-strip {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, 1fr);
}

.hero-metrics article,
.impact-strip article {
  background: linear-gradient(135deg, #f8fafc, #fff);
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 16px;
}

.hero-metrics span,
.impact-strip span {
  color: #64748b;
  display: block;
  font-size: .74rem;
  font-weight: 800;
  text-transform: uppercase;
}

.hero-metrics strong,
.impact-strip strong {
  color: #10213b;
  display: block;
  font-size: 1.45rem;
  margin-top: 6px;
}

.cockpit-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
}

.user-browser {
  align-self: start;
  display: grid;
  gap: 12px;
  padding: 12px;
  position: sticky;
  top: calc(var(--topbar-height) + 18px);
}

.search-card,
.user-row,
.scope-row {
  align-items: center;
  display: grid;
}

.search-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  gap: 8px;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  padding: 8px 10px;
}

input,
select {
  background: #fff;
  border: 1px solid #d9e2ea;
  border-radius: 12px;
  color: #17233b;
  min-height: 38px;
  min-width: 0;
  padding: 0 10px;
}

.search-card input {
  background: transparent;
  border: 0;
  outline: 0;
  padding: 0;
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
  min-height: 38px;
  padding: 0 12px;
}

.user-list {
  display: grid;
  gap: 8px;
  max-height: calc(100vh - 270px);
  overflow: auto;
}

.user-row {
  background: #fff;
  border: 1px solid transparent;
  border-radius: 16px;
  color: #17233b;
  gap: 10px;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  padding: 10px;
  text-align: left;
}

.user-row.active,
.user-row:hover {
  border-color: #f4c24f;
  box-shadow: 0 10px 24px rgba(15, 23, 42, .06);
}

.avatar,
.module-icon {
  background: #fff7df;
  border: 1px solid #f3d589;
  border-radius: 14px;
  color: #b98000;
  display: grid;
  font-weight: 900;
  height: 42px;
  place-items: center;
  width: 42px;
}

.user-row strong,
.user-row small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-row b {
  background: #e7f8ef;
  border-radius: 999px;
  color: #15803d;
  font-size: .68rem;
  padding: 5px 8px;
}

.permission-workspace {
  display: grid;
  gap: 16px;
  padding: clamp(16px, 2vw, 24px);
}

.workspace-head,
.section-title,
.effective-panel,
.actions {
  align-items: center;
  display: flex;
  gap: 14px;
  justify-content: space-between;
}

.access-switch,
.global-toggle {
  align-items: center;
  display: inline-flex;
  gap: 8px;
  font-weight: 850;
}

.module-cards {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.module-card {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  display: grid;
  gap: 14px;
  padding: 16px;
}

.capability-grid,
.permission-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.capability-chip,
.permission-pills span {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  display: inline-flex;
  gap: 7px;
  min-height: 34px;
  padding: 0 10px;
}

.scope-builder,
.effective-panel {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  display: grid;
  gap: 12px;
  padding: 16px;
}

.scope-row {
  gap: 8px;
  grid-template-columns: minmax(170px, 1.2fr) auto repeat(4, minmax(80px, 1fr)) 42px;
}

.icon-button {
  justify-content: center;
  padding: 0;
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

.state-card,
.empty-selection {
  color: #64748b;
  display: grid;
  gap: 8px;
  min-height: 160px;
  place-items: center;
  padding: 24px;
  text-align: center;
}

@media (max-width: 1180px) {
  .cockpit-grid,
  .ge-hero {
    grid-template-columns: 1fr;
  }

  .user-browser {
    position: static;
  }

  .module-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .hero-metrics,
  .impact-strip,
  .module-cards,
  .scope-row {
    grid-template-columns: 1fr;
  }

  .workspace-head,
  .section-title,
  .effective-panel,
  .actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
