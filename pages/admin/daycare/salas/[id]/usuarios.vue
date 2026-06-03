<template>
  <section class="stack">
    <div class="hero-panel section-header">
      <div>
        <p class="eyebrow">{{ data?.sala?.unidad }}</p>
        <h1>Familias · {{ data?.sala?.sala }}</h1>
        <p>Solo cuentas de guardería. No se muestran ni se administran pantallas de Personas Autorizadas.</p>
      </div>
      <button class="btn btn-primary" type="button" @click="startCreate">Nueva cuenta</button>
    </div>

    <FamilyAccountEditor
      v-if="editing"
      :account="editing"
      :saving="saving"
      @save="save"
      @cancel="editing = null"
    />

    <div class="card table-wrap">
      <table class="table">
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
          <tr v-for="account in data?.rows" :key="account.id">
            <td>{{ account.nombre_nino || '—' }}</td>
            <td>{{ account.username }}</td>
            <td>{{ account.email }}</td>
            <td><span class="badge">{{ account.role }}</span></td>
            <td><button class="btn btn-secondary" type="button" @click="editing = { ...account }">Editar</button></td>
          </tr>
        </tbody>
      </table>
      <EmptyState v-if="!data?.rows?.length" title="Sin cuentas" description="Esta sala aún no tiene cuentas familiares registradas." />
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
const { data, refresh } = await useFetch<{ sala: Sala; rows: FamilyAccount[] }>('/api/daycare/admin/family-accounts', {
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
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: end;
}
</style>
