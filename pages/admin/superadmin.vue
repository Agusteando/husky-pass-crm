<template>
  <section class="superadmin-page stack">
    <header class="workspace-head compact-head superadmin-head">
      <div>
        <p class="eyebrow">Superadmin</p>
        <h1>Gestión de usuarios y productos</h1>
        <p>Monitorea cuentas internas, familias de daycare y familias preescolar-secundaria desde un solo directorio real.</p>
      </div>
      <button class="btn btn-secondary" type="button" @click="refreshDirectory">Actualizar</button>
    </header>

    <section class="scope-tabs" aria-label="Alcance de usuarios">
      <button
        v-for="option in scopeOptions"
        :key="option.value"
        class="scope-tab"
        :class="{ active: selectedScope === option.value }"
        type="button"
        @click="selectedScope = option.value"
      >
        <strong>{{ option.label }}</strong>
        <span>{{ option.description }}</span>
      </button>
    </section>

    <section class="filters-card card">
      <label class="label">
        Plantel
        <select v-model="selectedPlantel" class="select">
          <option value="">Todos</option>
          <option v-for="plantel in directory?.planteles || []" :key="plantel" :value="plantel">{{ plantel }}</option>
        </select>
      </label>
      <label class="label">
        Buscar usuario
        <input v-model="search" class="input" type="search" placeholder="Nombre, correo, matrícula, rol, sala o campus" />
      </label>
      <label class="label">
        Límite
        <select v-model.number="limit" class="select">
          <option :value="50">50</option>
          <option :value="120">120</option>
          <option :value="250">250</option>
        </select>
      </label>
    </section>

    <section v-if="directory" class="super-metrics">
      <article>
        <span>Total visible</span>
        <strong>{{ directory.metrics.total }}</strong>
      </article>
      <article>
        <span>Familias</span>
        <strong>{{ directory.metrics.familyUsers }}</strong>
      </article>
      <article>
        <span>Daycare</span>
        <strong>{{ directory.metrics.daycareFamilies }}</strong>
      </article>
      <article>
        <span>Preescolar-secundaria</span>
        <strong>{{ directory.metrics.schoolFamilies }}</strong>
      </article>
      <article>
        <span>Internos</span>
        <strong>{{ directory.metrics.internalUsers }}</strong>
      </article>
      <article>
        <span>Impersonables</span>
        <strong>{{ directory.metrics.impersonable }}</strong>
      </article>
    </section>

    <p v-if="loadError" class="alert">No fue posible cargar el directorio de superadmin.</p>
    <p v-if="actionError" class="alert">{{ actionError }}</p>
    <div v-else-if="pending" class="card loading-card">Cargando usuarios…</div>

    <section v-else-if="directory?.users?.length" class="directory-grid">
      <article class="card users-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Directorio</p>
            <h2>{{ directory.users.length }} usuarios</h2>
          </div>
          <span class="muted">{{ activeScopeLabel }}</span>
        </div>

        <div class="table-wrap responsive-card-wrap">
          <table class="table responsive-table users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Tipo</th>
                <th>Plantel</th>
                <th>Alcances</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in directory.users" :key="user.id" :class="{ selected: selectedUser?.id === user.id }">
                <td data-label="Usuario">
                  <div class="user-cell">
                    <span class="user-avatar">{{ initials(user) }}</span>
                    <span>
                      <strong>{{ displayName(user) }}</strong>
                      <small>{{ user.email || user.username || `ID ${user.id}` }}</small>
                      <em v-if="user.nombre_nino">{{ user.nombre_nino }}</em>
                    </span>
                  </div>
                </td>
                <td data-label="Tipo"><span class="type-pill">{{ audienceLabel(user) }}</span></td>
                <td data-label="Plantel">
                  <div class="scope-stack">
                    <span>{{ labelList([...user.plantel, ...user.unidad], '—') }}</span>
                    <small v-if="user.sala">Sala {{ user.sala }}</small>
                    <small v-if="user.campus">{{ user.campus }}</small>
                  </div>
                </td>
                <td data-label="Alcances">
                  <div class="pills">
                    <span v-for="scope in user.productScopes" :key="scope" class="scope-pill">{{ productScopeLabel(scope) }}</span>
                    <span v-if="user.adminScopes.includes('daycare')" class="scope-pill muted-pill">Daycare interno</span>
                    <span v-if="!user.productScopes.length && !user.adminScopes.length" class="muted">Sin alcance detectado</span>
                  </div>
                </td>
                <td data-label="Acciones">
                  <div class="row-actions">
                    <button class="btn btn-secondary compact" type="button" @click="selectedUser = user">Detalle</button>
                    <NuxtLink
                      v-if="user.productScopes.includes('daycare') && user.sala"
                      class="btn btn-secondary compact"
                      :to="`/admin/daycare/salas/${user.sala}/familias`"
                    >
                      Ver sala
                    </NuxtLink>
                    <button
                      class="btn btn-primary compact"
                      type="button"
                      :disabled="!user.canImpersonate || impersonatingId === user.id"
                      @click="impersonate(user)"
                    >
                      {{ impersonatingId === user.id ? 'Abriendo…' : 'Impersonar familia' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <aside class="card detail-card">
        <template v-if="selectedUser">
          <p class="eyebrow">Detalle de usuario</p>
          <h2>{{ displayName(selectedUser) }}</h2>
          <dl>
            <div><dt>ID</dt><dd>{{ selectedUser.id }}</dd></div>
            <div><dt>Correo</dt><dd>{{ selectedUser.email || '—' }}</dd></div>
            <div><dt>Usuario</dt><dd>{{ selectedUser.username || '—' }}</dd></div>
            <div><dt>Rol legado</dt><dd>{{ selectedUser.role || '—' }}</dd></div>
            <div><dt>Producto</dt><dd>{{ selectedUser.productScopes.map(productScopeLabel).join(' · ') || 'Interno / sin producto familiar' }}</dd></div>
            <div><dt>Plantel</dt><dd>{{ labelList([...selectedUser.plantel, ...selectedUser.unidad], '—') }}</dd></div>
            <div><dt>Rutas heredadas</dt><dd>{{ selectedUser.routes.length ? selectedUser.routes.join(' · ') : '—' }}</dd></div>
          </dl>
        </template>
        <EmptyState v-else title="Selecciona un usuario" description="Verás su rol, producto, plantel y rutas heredadas sin salir del directorio." />
      </aside>
    </section>

    <EmptyState v-else title="Sin usuarios" description="Ajusta el producto, plantel o búsqueda para encontrar usuarios con datos reales." />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { navigateTo, useFetch } from 'nuxt/app'
import type { AppSessionUser, FamilyProductScope } from '~/types/session'
import type { SuperAdminDirectoryResponse, SuperAdminDirectoryScope, SuperAdminUserSummary } from '~/types/superadmin'
import { defaultFamilyRoute } from '~/utils/sessionScopes'

definePageMeta({ layout: 'admin', middleware: ['admin', 'superadmin'] })

const scopeOptions: Array<{ value: SuperAdminDirectoryScope; label: string; description: string }> = [
  { value: 'all', label: 'Todos', description: 'Directorio completo' },
  { value: 'daycare', label: 'Daycare', description: 'Familias de guardería' },
  { value: 'schoolFamilies', label: 'Preescolar-secundaria', description: 'Familias escolares' },
  { value: 'internal', label: 'Internos', description: 'Roles administrativos' },
  { value: 'impersonable', label: 'Soporte', description: 'Cuentas familiares' }
]

const selectedPlantel = ref('')
const selectedScope = ref<SuperAdminDirectoryScope>('all')
const selectedUser = ref<SuperAdminUserSummary | null>(null)
const search = ref('')
const limit = ref(120)
const actionError = ref('')
const impersonatingId = ref<number | null>(null)

const query = computed(() => ({
  plantel: selectedPlantel.value,
  search: search.value,
  scope: selectedScope.value,
  limit: limit.value
}))

const activeScopeLabel = computed(() => scopeOptions.find((option) => option.value === selectedScope.value)?.label || 'Todos')

const { data: directory, pending, error: loadError, refresh } = useFetch<SuperAdminDirectoryResponse>('/api/admin/superadmin/users', {
  query,
  watch: [query]
})

watch(directory, (value) => {
  if (!value?.users?.length) {
    selectedUser.value = null
    return
  }
  if (!selectedUser.value || !value.users.some((user) => user.id === selectedUser.value?.id)) {
    selectedUser.value = value.users[0] || null
  }
}, { immediate: true })

async function refreshDirectory() {
  actionError.value = ''
  await refresh()
}

function displayName(user: SuperAdminUserSummary) {
  return user.displayName || user.nombre_nino || user.username || user.email || `Usuario ${user.id}`
}

function initials(user: SuperAdminUserSummary) {
  return displayName(user).split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'HP'
}

function labelList(values: string[], fallback: string) {
  const unique = Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
  return unique.length ? unique.join(' · ') : fallback
}

function productScopeLabel(scope: FamilyProductScope) {
  if (scope === 'daycare') return 'Daycare familia'
  if (scope === 'personasAutorizadas') return 'Familia preescolar-secundaria'
  return scope
}

function audienceLabel(user: SuperAdminUserSummary) {
  if (user.audience === 'multiProductFamily') return 'Familia multiproducto'
  if (user.audience === 'daycareFamily') return 'Familia daycare'
  if (user.audience === 'schoolFamily') return 'Familia escolar'
  if (user.audience === 'internal') return 'Interno'
  return 'Sin clasificar'
}

async function impersonate(user: SuperAdminUserSummary) {
  if (!user.canImpersonate) return
  actionError.value = ''
  impersonatingId.value = user.id
  try {
    const response = await $fetch<{ user: AppSessionUser }>('/api/auth/admin/impersonate', {
      method: 'POST',
      body: { userId: user.id }
    })
    await navigateTo(defaultFamilyRoute(response.user))
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible impersonar esta cuenta.'
  } finally {
    impersonatingId.value = null
  }
}
</script>

<style scoped>
.superadmin-page {
  gap: 12px;
}

.superadmin-head {
  grid-template-columns: minmax(0, 1fr) auto;
}

.scope-tabs {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.scope-tab {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  cursor: pointer;
  display: grid;
  gap: 4px;
  padding: 12px;
  text-align: left;
}

.scope-tab:hover,
.scope-tab.active {
  background: var(--color-brand-100);
  border-color: var(--color-brand-300);
}

.scope-tab strong {
  color: var(--color-ink);
  font-size: 0.94rem;
}

.scope-tab span {
  color: var(--color-muted);
  font-size: 0.78rem;
  line-height: 1.25;
}

.filters-card {
  align-items: end;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(180px, 0.7fr) minmax(260px, 1fr) minmax(120px, 0.32fr);
}

.super-metrics {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.super-metrics article {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: var(--shadow-line);
  display: grid;
  gap: 4px;
  padding: 12px 14px;
}

.super-metrics span {
  color: var(--color-muted);
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.super-metrics strong {
  color: var(--color-ink);
  font-size: 1.5rem;
  line-height: 1;
}

.directory-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
}

.section-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-head h2,
.detail-card h2 {
  font-size: 1.25rem;
  margin-bottom: 0;
}

.users-table {
  min-width: 1040px;
}

.users-table tr.selected td {
  background: #fbfdf8;
}

.user-cell {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: 42px minmax(0, 1fr);
}

.user-avatar {
  align-items: center;
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 14px;
  color: var(--color-brand-900);
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 950;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.user-cell strong,
.user-cell small,
.user-cell em,
.scope-stack span,
.scope-stack small {
  display: block;
}

.user-cell small,
.scope-stack small,
.user-cell em,
.muted {
  color: var(--color-muted);
  font-size: 0.82rem;
  font-style: normal;
}

.scope-stack {
  display: grid;
  gap: 3px;
}

.pills,
.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.scope-pill,
.type-pill {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 999px;
  color: var(--color-brand-800);
  display: inline-flex;
  font-size: 0.76rem;
  font-weight: 900;
  padding: 5px 9px;
}

.type-pill {
  background: #eaf4fb;
  border-color: #d2e7f5;
  color: var(--color-blue);
}

.muted-pill {
  background: #f4f4f2;
  border-color: var(--color-border);
  color: var(--color-muted);
}

.compact {
  min-height: 34px;
  padding-inline: 12px;
}

.loading-card {
  color: var(--color-muted);
}

.detail-card {
  align-self: start;
  display: grid;
  gap: 12px;
  position: sticky;
  top: calc(var(--topbar-height) + 12px);
}

.detail-card dl {
  display: grid;
  gap: 10px;
  margin: 0;
}

.detail-card div {
  border-bottom: 1px solid var(--color-border);
  display: grid;
  gap: 2px;
  padding-bottom: 8px;
}

.detail-card dt {
  color: var(--color-muted);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.detail-card dd {
  margin: 0;
  word-break: break-word;
}

@media (max-width: 1180px) {
  .scope-tabs,
  .super-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .directory-grid {
    grid-template-columns: 1fr;
  }

  .detail-card {
    position: static;
  }
}

@media (max-width: 980px) {
  .filters-card,
  .superadmin-head,
  .scope-tabs,
  .super-metrics {
    grid-template-columns: 1fr;
  }

  .users-table {
    min-width: 0;
  }
}
</style>
