<template>
  <section class="superadmin-page stack">
    <header class="workspace-head compact-head superadmin-head">
      <div>
        <p class="eyebrow">Superadmin</p>
        <h1>Usuarios y accesos</h1>
        <p>Consulta usuarios por plantel, revisa sus alcances de producto y abre una vista familiar para soporte.</p>
      </div>
      <button class="btn btn-secondary" type="button" @click="refresh">Actualizar</button>
    </header>

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
        <input v-model="search" class="input" type="search" placeholder="Nombre, correo, matrícula, rol o sala" />
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
        <span>Daycare familia</span>
        <strong>{{ directory.metrics.daycareFamilies }}</strong>
      </article>
      <article>
        <span>Personas autorizadas</span>
        <strong>{{ directory.metrics.personasAutorizadasFamilies }}</strong>
      </article>
      <article>
        <span>Impersonables</span>
        <strong>{{ directory.metrics.impersonable }}</strong>
      </article>
    </section>

    <p v-if="loadError" class="alert">No fue posible cargar el directorio de superadmin.</p>
    <p v-if="actionError" class="alert">{{ actionError }}</p>
    <div v-else-if="pending" class="card loading-card">Cargando usuarios…</div>

    <section v-else-if="directory?.users?.length" class="card users-card">
      <div class="section-head">
        <div>
          <p class="eyebrow">Directorio</p>
          <h2>{{ directory.users.length }} usuarios</h2>
        </div>
      </div>

      <div class="table-wrap responsive-card-wrap">
        <table class="table responsive-table users-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Plantel</th>
              <th>Alcances familiares</th>
              <th>Alcance interno</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in directory.users" :key="user.id">
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
              <td data-label="Plantel">
                <div class="scope-stack">
                  <span>{{ labelList([...user.plantel, ...user.unidad], '—') }}</span>
                  <small v-if="user.sala">Sala {{ user.sala }}</small>
                  <small v-if="user.campus">{{ user.campus }}</small>
                </div>
              </td>
              <td data-label="Alcances familiares">
                <div class="pills">
                  <span v-if="user.productScopes.includes('daycare')" class="scope-pill">Daycare</span>
                  <span v-if="user.productScopes.includes('personasAutorizadas')" class="scope-pill blue">Personas Autorizadas</span>
                  <span v-if="!user.productScopes.length" class="muted">Sin alcance familiar</span>
                </div>
              </td>
              <td data-label="Alcance interno">
                <div class="scope-stack">
                  <span>{{ user.adminScopes.includes('daycare') ? 'Daycare interno' : '—' }}</span>
                  <small>{{ user.role || 'Sin rol' }}</small>
                </div>
              </td>
              <td data-label="Acciones">
                <button class="btn btn-primary compact" type="button" :disabled="!user.canImpersonate || impersonatingId === user.id" @click="impersonate(user)">
                  {{ impersonatingId === user.id ? 'Abriendo…' : 'Impersonar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <EmptyState v-else title="Sin usuarios" description="Ajusta el plantel o la búsqueda para encontrar usuarios con datos reales." />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { definePageMeta, navigateTo, useFetch } from '#imports'
import type { AppSessionUser } from '~/types/session'
import type { SuperAdminDirectoryResponse, SuperAdminUserSummary } from '~/types/superadmin'
import { defaultFamilyRoute } from '~/utils/sessionScopes'

definePageMeta({ layout: 'admin', middleware: ['admin', 'superadmin'] })

const selectedPlantel = ref('')
const search = ref('')
const limit = ref(120)
const actionError = ref('')
const impersonatingId = ref<number | null>(null)

const query = computed(() => ({
  plantel: selectedPlantel.value,
  search: search.value,
  limit: limit.value
}))

const { data: directory, pending, error: loadError, refresh } = await useFetch<SuperAdminDirectoryResponse>('/api/admin/superadmin/users', {
  query,
  watch: [query]
})

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

.filters-card {
  align-items: end;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(180px, 0.7fr) minmax(260px, 1fr) minmax(120px, 0.32fr);
}

.super-metrics {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
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

.section-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-head h2 {
  font-size: 1.25rem;
  margin-bottom: 0;
}

.users-table {
  min-width: 920px;
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
.user-cell em {
  color: var(--color-muted);
  font-size: 0.82rem;
  font-style: normal;
}

.scope-stack {
  display: grid;
  gap: 3px;
}

.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.scope-pill {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 999px;
  color: var(--color-brand-800);
  display: inline-flex;
  font-size: 0.76rem;
  font-weight: 900;
  padding: 5px 9px;
}

.scope-pill.blue {
  background: #eaf4fb;
  border-color: #d2e7f5;
  color: var(--color-blue);
}

.compact {
  min-height: 34px;
  padding-inline: 12px;
}

.loading-card {
  color: var(--color-muted);
}

@media (max-width: 980px) {
  .filters-card,
  .superadmin-head,
  .super-metrics {
    grid-template-columns: 1fr;
  }

  .users-table {
    min-width: 0;
  }
}
</style>
