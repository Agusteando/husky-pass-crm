<template>
  <section class="ge-cockpit" data-product-area="superadmin" data-product-screen="gestion-escolar-permissions">
    <header class="ge-hero">
      <div class="hero-copy">
        <p class="eyebrow">Mapa escolar</p>
        <h1>Gestión Escolar</h1>
        <div class="scope-rail" aria-label="Alcance escolar disponible">
          <span v-for="plantel in visiblePlanteles" :key="plantel">{{ plantel }}</span>
          <span v-if="!visiblePlanteles.length">Sin planteles escolares</span>
        </div>
      </div>
      <div class="hero-metrics" aria-label="Resumen Gestión Escolar">
        <article><span>Activos</span><strong>{{ data?.metrics.enabled || 0 }}</strong></article>
        <article><span>Con alcance</span><strong>{{ data?.metrics.scoped || 0 }}</strong></article>
        <article><span>Planteles</span><strong>{{ options.planteles.length }}</strong></article>
      </div>
    </header>

    <section class="cockpit-grid">
      <aside class="user-browser">
        <form class="search-card" role="search" @submit.prevent="refreshUsers">
          <FamilyPersonasIcon name="search" />
          <input v-model="search" type="search" placeholder="Usuario interno" aria-label="Buscar usuario interno" />
          <button class="mini-button" type="submit">Buscar</button>
        </form>

        <div v-if="pending" class="state-card compact" data-state="loading"><HuskyPassLoader label="Usuarios" compact /></div>
        <div v-else-if="loadError" class="state-card compact" data-state="error">No disponible</div>
        <div v-else class="user-list">
          <button
            v-for="user in users"
            :key="user.id"
            class="user-row"
            type="button"
            :class="{ active: selectedUser?.id === user.id, scoped: user.gestionEscolar.permissions.length }"
            @click="selectUser(user)"
          >
            <span class="avatar">{{ initials(user) }}</span>
            <span>
              <strong>{{ displayName(user) }}</strong>
              <small>{{ user.email || user.username || 'Cuenta interna' }}</small>
            </span>
            <b :data-active="user.gestionEscolar.permissions.length > 0">{{ user.gestionEscolar.permissions.length ? user.gestionEscolar.reach.planteles.join(' · ') || 'Activo' : '—' }}</b>
          </button>
          <div v-if="!users.length" class="state-card compact" data-state="empty">Sin usuarios</div>
        </div>
      </aside>

      <section v-if="selectedUser" class="permission-workspace">
        <div class="workspace-head">
          <div>
            <p class="eyebrow">Usuario</p>
            <h2>{{ displayName(selectedUser) }}</h2>
            <p>{{ selectedUser.email || selectedUser.username }}</p>
          </div>
          <span class="access-status" :data-active="isSavedActive">{{ isSavedActive ? 'Activo' : 'Sin acceso' }}</span>
        </div>

        <section class="impact-strip" aria-label="Resumen del borrador">
          <article><span>Alcances</span><strong>{{ activeSlices.length }}</strong></article>
          <article><span>Planteles</span><strong>{{ draftPlanteles.length }}</strong></article>
          <article><span>Permisos</span><strong>{{ draftCapabilities.length }}</strong></article>
        </section>

        <section class="quick-assign" aria-label="Asignación rápida">
          <article class="quick-card">
            <div class="quick-card-head">
              <p class="eyebrow">Planteles</p>
              <strong>{{ draftPlanteles.length || '—' }}</strong>
            </div>
            <div class="quick-chip-grid">
              <button
                v-for="plantel in options.planteles"
                :key="plantel"
                class="quick-chip"
                type="button"
                :class="{ active: draftPlanteles.includes(plantel) }"
                :disabled="saving"
                @click="togglePlantel(plantel)"
              >
                {{ plantel }}
              </button>
            </div>
          </article>

          <article class="quick-card">
            <div class="quick-card-head">
              <p class="eyebrow">Permisos</p>
              <strong>{{ currentPresetLabel }}</strong>
            </div>
            <div class="preset-grid">
              <button
                v-for="preset in permissionPresets"
                :key="preset.key"
                class="preset-button"
                type="button"
                :class="{ active: presetIsApplied(preset) }"
                :disabled="saving"
                @click="applyPresetToAll(preset.capabilities)"
              >
                <strong>{{ preset.label }}</strong>
                <span>{{ preset.caption }}</span>
              </button>
            </div>
          </article>
        </section>

        <section class="access-canvas" :class="{ empty: !activeSlices.length }">
          <div class="canvas-head">
            <div>
              <p class="eyebrow">Alcances</p>
              <h3>Mapa de acceso</h3>
            </div>
            <button class="mini-button" type="button" :disabled="saving" @click="addSlice">Agregar alcance</button>
          </div>

          <article v-for="(slice, index) in slices" :key="slice.uid" class="scope-card" :class="{ pending: !slice.plantel.trim() }">
            <div class="scope-card-head">
              <span class="scope-index">{{ index + 1 }}</span>
              <strong>{{ scopeLabel(slice) }}</strong>
              <button class="icon-button" type="button" :disabled="saving || slices.length <= 1" aria-label="Quitar alcance" @click="removeSlice(index)">
                <FamilyPersonasIcon name="trash" />
              </button>
            </div>

            <div class="scope-selectors">
              <label>
                <span>Plantel</span>
                <select v-model="slice.plantel" :disabled="saving">
                  <option value="">—</option>
                  <option v-for="plantel in options.planteles" :key="plantel" :value="plantel">{{ plantel }}</option>
                </select>
              </label>
              <label>
                <span>Nivel</span>
                <select v-model="slice.nivel" :disabled="saving">
                  <option value="">Todos</option>
                  <option v-for="nivel in options.niveles" :key="nivel" :value="nivel">{{ nivel }}</option>
                </select>
              </label>
              <label>
                <span>Grado</span>
                <select v-model="slice.grado" :disabled="saving">
                  <option value="">Todos</option>
                  <option v-for="grado in options.grados" :key="grado" :value="grado">{{ grado }}</option>
                </select>
              </label>
              <label>
                <span>Grupo</span>
                <select v-model="slice.grupo" :disabled="saving">
                  <option value="">Todos</option>
                  <option v-for="grupo in options.grupos" :key="grupo" :value="grupo">{{ grupo }}</option>
                </select>
              </label>
            </div>

            <div class="module-grid">
              <article v-for="module in modules" :key="module.key" class="module-tile" :class="{ on: module.capabilities.some((capability) => slice.capabilities.includes(capability.value)) }">
                <span class="module-icon"><FamilyPersonasIcon :name="module.icon" /></span>
                <strong>{{ module.title }}</strong>
                <div class="capability-pills">
                  <button
                    v-for="capability in module.capabilities"
                    :key="capability.value"
                    type="button"
                    class="capability-pill"
                    :class="{ active: slice.capabilities.includes(capability.value) }"
                    :disabled="saving"
                    @click="toggleSliceCapability(slice, capability.value)"
                  >
                    {{ capability.label }}
                  </button>
                </div>
              </article>
            </div>
          </article>
        </section>

        <section class="effective-panel">
          <div>
            <p class="eyebrow">Resultado</p>
            <h3>{{ effectiveTitle }}</h3>
          </div>
          <div class="permission-pills">
            <span v-for="slice in activeSlices" :key="slice.uid">{{ slice.capabilities.length }} permisos · {{ scopeLabel(slice) }}</span>
            <span v-if="!activeSlices.length">Sin plantel</span>
          </div>
        </section>

        <p v-if="actionError" class="action-message error">{{ actionError }}</p>
        <p v-else-if="actionNotice" class="action-message">{{ actionNotice }}</p>
        <div class="actions">
          <button v-if="isSavedActive" class="btn btn-secondary danger" type="button" :disabled="saving" @click="disablePermissions">Desactivar acceso</button>
          <button class="btn btn-secondary" type="button" :disabled="saving" @click="selectUser(selectedUser)">Restaurar</button>
          <button class="btn btn-primary" type="button" :disabled="saving" @click="savePermissions">{{ saving ? 'Guardando...' : 'Guardar acceso' }}</button>
        </div>
      </section>

      <section v-else class="empty-selection">
        <FamilyPersonasIcon name="school" />
        <h2>Selecciona un usuario</h2>
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFetch, useRoute, useRouter } from 'nuxt/app'
import type { GestionEscolarCapability, GestionEscolarPermissionInput, GestionEscolarReachPreview } from '~/types/gestionEscolar'

definePageMeta({ layout: 'admin', middleware: ['admin', 'superadmin'] })

type Options = { planteles: string[]; niveles: string[]; grados: string[]; grupos: string[] }
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
  options?: Options
  metrics: { total: number; enabled: number; scoped: number; global: number; legacyCommunications: number }
}

type CapabilityOption = { value: GestionEscolarCapability; label: string }
type ScopeSlice = {
  uid: string
  plantel: string
  nivel: string
  grado: string
  grupo: string
  capabilities: GestionEscolarCapability[]
}

type PermissionPreset = {
  key: string
  label: string
  caption: string
  capabilities: GestionEscolarCapability[]
}

const route = useRoute()
const router = useRouter()
const search = ref(typeof route.query.buscar === 'string' ? route.query.buscar : '')
const query = computed(() => ({ search: search.value, limit: 120 }))
const { data, pending, error: loadError, refresh } = useFetch<CockpitResponse>('/api/admin/superadmin/gestion-escolar/users', { query, timeout: 15000 })
const selectedUser = ref<CockpitUser | null>(null)
const saving = ref(false)
const actionNotice = ref('')
const actionError = ref('')
const slices = ref<ScopeSlice[]>([])

const modules: Array<{ key: string; title: string; icon: string; capabilities: CapabilityOption[] }> = [
  { key: 'familias', title: 'Familias', icon: 'people', capabilities: [{ value: 'familias.view', label: 'Ver' }, { value: 'familias.impersonate', label: 'Entrar' }] },
  { key: 'comunicados', title: 'Comunicados', icon: 'announcement', capabilities: [{ value: 'comunicados.create', label: 'Crear' }, { value: 'comunicados.publish', label: 'Publicar' }] },
  { key: 'encuestas', title: 'Encuestas', icon: 'survey', capabilities: [{ value: 'encuestas.manage', label: 'Gestionar' }] },
  { key: 'convenios', title: 'Convenios', icon: 'handshake', capabilities: [{ value: 'convenios.manage', label: 'Gestionar' }, { value: 'convenios.publish', label: 'Publicar' }] }
]

const capabilityOrder = modules.flatMap((module) => module.capabilities.map((capability) => capability.value))
const starterCapabilities: GestionEscolarCapability[] = ['familias.view', 'comunicados.create', 'encuestas.manage', 'convenios.manage']
const permissionPresets: PermissionPreset[] = [
  { key: 'operacion', label: 'Operación', caption: 'Familias, avisos y gestión', capabilities: starterCapabilities },
  { key: 'publicacion', label: 'Publicación', caption: 'Crear y publicar', capabilities: ['familias.view', 'comunicados.create', 'comunicados.publish', 'encuestas.manage', 'convenios.manage', 'convenios.publish'] },
  { key: 'soporte', label: 'Soporte', caption: 'Familias e ingreso', capabilities: ['familias.view', 'familias.impersonate'] },
  { key: 'total', label: 'Todo', caption: 'Todas las capacidades', capabilities: capabilityOrder }
]

const users = computed(() => data.value?.users || [])
const options = computed<Options>(() => ({
  planteles: data.value?.options?.planteles || data.value?.planteles || [],
  niveles: data.value?.options?.niveles || [],
  grados: data.value?.options?.grados || [],
  grupos: data.value?.options?.grupos || []
}))
const visiblePlanteles = computed(() => options.value.planteles.slice(0, 8))
const activeSlices = computed(() => slices.value.filter((slice) => slice.plantel.trim() && slice.capabilities.length))
const draftPlanteles = computed(() => Array.from(new Set(activeSlices.value.map((slice) => slice.plantel.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es')))
const draftCapabilities = computed(() => Array.from(new Set(activeSlices.value.flatMap((slice) => slice.capabilities))))
const isSavedActive = computed(() => Boolean(selectedUser.value?.gestionEscolar.enabled && selectedUser.value.gestionEscolar.permissions.length))
const effectiveTitle = computed(() => {
  if (!activeSlices.value.length) return 'Sin plantel'
  return `${draftPlanteles.value.length} planteles · ${draftCapabilities.value.length} permisos`
})
const currentPresetLabel = computed(() => permissionPresets.find((preset) => presetIsApplied(preset))?.label || `${draftCapabilities.value.length || '—'}`)

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
  const nextQuery: Record<string, string> = {}
  if (search.value.trim()) nextQuery.buscar = search.value.trim()
  if (selectedId) nextQuery.usuario = String(selectedId)
  const keys = new Set([...Object.keys(route.query), ...Object.keys(nextQuery)])
  const changed = Array.from(keys).some((key) => String(Array.isArray(route.query[key]) ? route.query[key]?.[0] || '' : route.query[key] || '') !== String(nextQuery[key] || ''))
  if (changed) router.replace({ path: route.path, query: nextQuery })
}

function displayName(user: CockpitUser) {
  return user.displayName || user.email || user.username || `Usuario ${user.id}`
}

async function refreshUsers() {
  syncGestionQuery()
  await refresh()
}

function initials(user: CockpitUser) {
  return displayName(user).split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'HP'
}

function normalizeCapabilities(input: GestionEscolarCapability[]) {
  const set = new Set(input)
  if (set.has('familias.impersonate')) set.add('familias.view')
  if (set.has('comunicados.publish')) set.add('comunicados.create')
  if (set.has('convenios.publish')) set.add('convenios.manage')
  return capabilityOrder.filter((capability) => set.has(capability))
}

function blankSlice(overrides: Partial<ScopeSlice> = {}): ScopeSlice {
  return {
    uid: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    plantel: '',
    nivel: '',
    grado: '',
    grupo: '',
    capabilities: [...starterCapabilities],
    ...overrides
  }
}

function sliceKey(permission: GestionEscolarPermissionInput) {
  return [permission.plantel || '', permission.nivel || '', permission.grado || '', permission.grupo || ''].join('|')
}

function slicesFromPermissions(permissions: Array<GestionEscolarPermissionInput & { id?: number }>): ScopeSlice[] {
  const map = new Map<string, ScopeSlice>()
  for (const permission of permissions) {
    if (permission.isGlobal || !permission.plantel) continue
    const key = sliceKey(permission)
    const current = map.get(key) || {
      uid: key || `${Date.now()}-${map.size}`,
      plantel: String(permission.plantel || ''),
      nivel: String(permission.nivel || ''),
      grado: String(permission.grado || ''),
      grupo: String(permission.grupo || ''),
      capabilities: []
    }
    if (!current.capabilities.includes(permission.capability)) current.capabilities.push(permission.capability)
    current.capabilities = normalizeCapabilities(current.capabilities)
    map.set(key, current)
  }
  return Array.from(map.values())
}

function selectUser(user: CockpitUser | null, updateRoute = true) {
  if (!user) return
  selectedUser.value = user
  slices.value = slicesFromPermissions(user.gestionEscolar.permissions)
  if (!slices.value.length) slices.value = [blankSlice()]
  actionNotice.value = ''
  actionError.value = ''
  if (updateRoute) syncGestionQuery(user.id)
}

function addSlice() {
  slices.value.push(blankSlice())
}

function removeSlice(index: number) {
  if (slices.value.length <= 1) return
  slices.value.splice(index, 1)
}

function togglePlantel(plantel: string) {
  const normalized = plantel.trim()
  if (!normalized || saving.value) return

  const existing = slices.value.filter((slice) => slice.plantel.trim() === normalized)
  if (existing.length) {
    slices.value = slices.value.filter((slice) => slice.plantel.trim() !== normalized)
    if (!slices.value.length) slices.value = [blankSlice()]
    return
  }

  const blank = slices.value.find((slice) => !slice.plantel.trim())
  if (blank) {
    blank.plantel = normalized
    if (!blank.capabilities.length) blank.capabilities = [...starterCapabilities]
    return
  }

  slices.value.push(blankSlice({ plantel: normalized }))
}

function toggleSliceCapability(slice: ScopeSlice, capability: GestionEscolarCapability) {
  if (saving.value) return
  const set = new Set(slice.capabilities)
  if (set.has(capability)) set.delete(capability)
  else set.add(capability)
  slice.capabilities = normalizeCapabilities(Array.from(set))
}

function sameCapabilities(a: GestionEscolarCapability[], b: GestionEscolarCapability[]) {
  const left = normalizeCapabilities(a)
  const right = normalizeCapabilities(b)
  return left.length === right.length && left.every((capability, index) => capability === right[index])
}

function presetIsApplied(preset: PermissionPreset) {
  const targetSlices = activeSlices.value.length ? activeSlices.value : slices.value
  if (!targetSlices.length) return false
  return targetSlices.every((slice) => sameCapabilities(slice.capabilities, preset.capabilities))
}

function applyPresetToAll(capabilities: GestionEscolarCapability[]) {
  const normalized = normalizeCapabilities(capabilities)
  const targetSlices = activeSlices.value.length ? activeSlices.value : slices.value
  if (!targetSlices.length) slices.value = [blankSlice({ capabilities: normalized })]
  else targetSlices.forEach((slice) => { slice.capabilities = [...normalized] })
}

function scopeLabel(slice: ScopeSlice) {
  return [slice.plantel && `Plantel ${slice.plantel}`, slice.nivel, slice.grado && `Grado ${slice.grado}`, slice.grupo && `Grupo ${slice.grupo}`].filter(Boolean).join(' · ') || 'Plantel pendiente'
}

function buildPermissions(): GestionEscolarPermissionInput[] {
  const seen = new Set<string>()
  const permissions: GestionEscolarPermissionInput[] = []
  for (const slice of activeSlices.value) {
    for (const capability of normalizeCapabilities(slice.capabilities)) {
      const key = [capability, slice.plantel, slice.nivel, slice.grado, slice.grupo].join('|')
      if (seen.has(key)) continue
      seen.add(key)
      permissions.push({
        capability,
        enabled: true,
        isGlobal: false,
        plantel: slice.plantel,
        nivel: slice.nivel || null,
        grado: slice.grado || null,
        grupo: slice.grupo || null
      })
    }
  }
  return permissions
}

async function savePermissions() {
  if (!selectedUser.value) return
  const permissions = buildPermissions()
  if (!permissions.length) {
    actionError.value = 'Selecciona plantel y permisos.'
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
    const saved = await $fetch<CockpitUser['gestionEscolar']>(`/api/admin/superadmin/gestion-escolar/users/${selectedUser.value.id}`, {
      method: 'POST',
      body: { enabled, permissions }
    })
    selectedUser.value.gestionEscolar = saved
    slices.value = slicesFromPermissions(saved.permissions)
    if (!slices.value.length) slices.value = [blankSlice()]
    actionNotice.value = saved.enabled ? 'Acceso actualizado.' : 'Acceso desactivado.'
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
  border-radius: 26px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, .07);
}

.ge-hero {
  align-items: end;
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 460px);
  overflow: hidden;
  padding: clamp(22px, 3vw, 38px);
  position: relative;
}

.ge-hero::after {
  background: radial-gradient(circle, rgba(15, 140, 154, .16), transparent 62%);
  content: '';
  height: 280px;
  position: absolute;
  right: -80px;
  top: -130px;
  width: 280px;
}

.hero-copy,
.hero-metrics {
  position: relative;
  z-index: 1;
}

.eyebrow {
  color: #0f8c9a;
  font-size: .72rem;
  font-weight: 850;
  letter-spacing: .12em;
  margin: 0 0 7px;
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
  line-height: 1.06;
}

h1 {
  font-size: clamp(2.35rem, 4.1vw, 4.35rem);
}

h2 {
  font-size: clamp(1.45rem, 2.1vw, 2rem);
}

.scope-rail,
.permission-pills,
.capability-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.scope-rail {
  margin-top: 18px;
}

.scope-rail span,
.permission-pills span {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  color: #475569;
  font-size: .78rem;
  font-weight: 850;
  padding: 8px 11px;
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
  font-size: .72rem;
  font-weight: 850;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.hero-metrics strong,
.impact-strip strong {
  color: #10213b;
  display: block;
  font-size: 1.55rem;
  margin-top: 6px;
}

.cockpit-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(280px, 370px) minmax(0, 1fr);
}

.user-browser {
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
  border-radius: 18px;
  display: grid;
  gap: 8px;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  padding: 8px 10px;
}

input,
select {
  background: #fff;
  border: 1px solid #d9e2ea;
  border-radius: 14px;
  color: #17233b;
  min-height: 40px;
  min-width: 0;
  padding: 0 11px;
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
  border-radius: 13px;
  color: #0f8c9a;
  display: inline-flex;
  font-weight: 850;
  justify-content: center;
  min-height: 40px;
  padding: 0 13px;
}

.mini-button:disabled,
.icon-button:disabled,
.capability-pill:disabled,
.quick-chip:disabled,
.preset-button:disabled {
  cursor: not-allowed;
  opacity: .55;
}

.user-list {
  display: grid;
  gap: 8px;
  max-height: calc(100vh - 270px);
  overflow: auto;
}

.user-row {
  align-items: center;
  background: #fff;
  border: 1px solid transparent;
  border-radius: 18px;
  color: #17233b;
  display: grid;
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

.user-row.scoped .avatar,
.scope-index,
.module-icon {
  background: #eefdf9;
  border-color: #bee8df;
  color: #0f8c9a;
}

.avatar,
.scope-index,
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

.user-row small,
.workspace-head p,
.preset-button span {
  color: #64748b;
  font-weight: 650;
}

.user-row b {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  color: #64748b;
  font-size: .68rem;
  max-width: 90px;
  overflow: hidden;
  padding: 5px 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-row b[data-active='true'] {
  background: #e7f8ef;
  border-color: #bfead0;
  color: #15803d;
}

.permission-workspace {
  display: grid;
  gap: 16px;
  padding: clamp(16px, 2vw, 24px);
}

.workspace-head,
.canvas-head,
.effective-panel,
.actions,
.scope-card-head,
.quick-card-head {
  align-items: center;
  display: flex;
  gap: 14px;
  justify-content: space-between;
}

.access-status {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  color: #64748b;
  display: inline-flex;
  font-weight: 850;
  min-height: 44px;
  padding: 0 16px;
  place-items: center;
}

.access-status[data-active='true'] {
  background: #e7f8ef;
  border-color: #bfead0;
  color: #15803d;
}

.quick-assign {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, .9fr);
}

.quick-card {
  background: linear-gradient(135deg, #fbfdff, #fff);
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  display: grid;
  gap: 12px;
  padding: 14px;
}

.quick-card-head strong {
  color: #17233b;
}

.quick-chip-grid,
.preset-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-chip,
.preset-button {
  background: #fff;
  border: 1px solid #d9e2ea;
  border-radius: 999px;
  color: #17233b;
  font-weight: 850;
  min-height: 38px;
  padding: 0 13px;
}

.quick-chip.active,
.preset-button.active {
  background: #e7f8ef;
  border-color: #9fd9b8;
  color: #156235;
}

.preset-button {
  align-items: flex-start;
  border-radius: 16px;
  display: grid;
  gap: 2px;
  min-height: 58px;
  padding: 9px 12px;
  text-align: left;
}

.preset-button strong,
.preset-button span {
  display: block;
}

.preset-button span {
  font-size: .72rem;
}

.access-canvas,
.effective-panel {
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  display: grid;
  gap: 14px;
  padding: 16px;
}

.access-canvas.empty {
  background: #f8fafc;
}

.scope-card {
  background: linear-gradient(180deg, #fff 0%, #fbfdff 100%);
  border: 1px solid #dfe8ef;
  border-radius: 22px;
  display: grid;
  gap: 14px;
  padding: 14px;
}

.scope-card.pending {
  border-color: #f3d589;
}

.scope-card-head {
  justify-content: start;
}

.scope-card-head strong {
  color: #17233b;
  flex: 1;
  font-size: 1rem;
}

.icon-button {
  padding: 0;
  width: 40px;
}

.scope-selectors {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.scope-selectors label {
  display: grid;
  gap: 6px;
}

.scope-selectors span {
  color: #64748b;
  font-size: .72rem;
  font-weight: 850;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.module-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.module-tile {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  display: grid;
  gap: 10px;
  padding: 12px;
}

.module-tile.on {
  border-color: #bfe4d4;
  box-shadow: 0 12px 28px rgba(15, 23, 42, .05);
}

.module-icon {
  height: 38px;
  width: 38px;
}

.module-tile strong {
  color: #17233b;
}

.capability-pill {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  color: #475569;
  font-size: .75rem;
  font-weight: 850;
  min-height: 32px;
  padding: 0 10px;
}

.capability-pill.active {
  background: #287c36;
  border-color: #287c36;
  color: #fff;
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

@media (max-width: 1180px) {
  .cockpit-grid,
  .ge-hero,
  .quick-assign {
    grid-template-columns: 1fr;
  }

  .user-browser {
    position: static;
  }

  .module-grid,
  .scope-selectors {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .hero-metrics,
  .impact-strip,
  .module-grid,
  .scope-selectors {
    grid-template-columns: 1fr;
  }

  .workspace-head,
  .canvas-head,
  .effective-panel,
  .actions,
  .scope-card-head,
  .quick-card-head {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
