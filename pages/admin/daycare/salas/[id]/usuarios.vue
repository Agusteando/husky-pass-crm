<template>
  <section class="stack">
    <div class="screen-head">
      <div>
        <p class="eyebrow">{{ data?.sala?.unidad || 'Guardería' }}</p>
        <h1>Familias · {{ data?.sala?.sala || 'Sala' }}</h1>
        <p>Cuentas familiares con acceso de guardería para esta sala.</p>
      </div>
      <div class="head-actions">
        <button class="btn btn-primary" type="button" @click="startCreate">Nueva cuenta</button>
      </div>
    </div>

    <FamilyAccountEditor
      v-if="editing"
      :account="editing"
      :saving="saving"
      @save="save"
      @cancel="editing = null"
    />

    <p v-if="error" class="alert">No fue posible cargar las cuentas familiares.</p>
    <div v-else-if="pending" class="card loading-card">Cargando cuentas…</div>
    <div v-else class="card table-wrap responsive-card-wrap">
      <table v-if="data?.rows?.length" class="table responsive-table">
        <thead>
          <tr>
            <th>Niño/a</th>
            <th>Usuario</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="account in data.rows" :key="account.id">
            <td data-label="Niño/a">{{ account.nombre_nino || '—' }}</td>
            <td data-label="Usuario">{{ account.username }}</td>
            <td data-label="Correo">{{ account.email }}</td>
            <td data-label="Rol"><span class="badge">{{ account.role }}</span></td>
            <td data-label="Acción" class="row-actions">
              <button class="btn btn-secondary" type="button" @click="editing = { ...account }">Editar</button>
              <button class="btn btn-primary" type="button" @click="impersonate(account.id)">Ver como familia</button>
            </td>
          </tr>
        </tbody>
      </table>
      <EmptyState v-else title="Sin cuentas" description="Esta sala aún no tiene cuentas familiares registradas." />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FamilyAccount, Sala } from '~/types/daycare'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const salaId = Number(route.params.id)
const editing = ref<Partial<FamilyAccount> | null>(null)
const saving = ref(false)
const { data, refresh, pending, error } = await useFetch<{ sala: Sala; rows: FamilyAccount[] }>('/api/daycare/admin/family-accounts', {
  query: { sala: salaId }
})

function startCreate() {
  editing.value = { sala: String(salaId), unidad: data.value?.sala.unidad, role: 'ROLE_HUSKY_USER', username: '', email: '' }
}

async function save(payload: Partial<FamilyAccount>) {
  saving.value = true
  try {
    await $fetch('/api/daycare/admin/family-accounts', { method: 'POST', body: { ...payload, sala: String(salaId) } })
    editing.value = null
    await refresh()
  } finally {
    saving.value = false
  }
}

async function impersonate(userId?: number) {
  if (!userId) return
  const response = await $fetch<{ user: { productScopes?: string[] } }>('/api/auth/admin/impersonate', {
    method: 'POST',
    body: { userId }
  })
  const target = response.user.productScopes?.includes('daycare') ? '/daycare' : '/personas_autorizadas'
  await navigateTo(target)
}
</script>

<style scoped>
.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.loading-card {
  color: var(--color-muted);
}

@media (max-width: 560px) {
  .row-actions .btn {
    width: 100%;
  }
}
</style>
