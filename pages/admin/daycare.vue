<template>
  <section class="stack">
    <div class="admin-header">
      <div>
        <p class="eyebrow">Administración interna</p>
        <h1>Guardería</h1>
      </div>
      <SalaPicker v-if="session?.user?.unidades?.length" v-model="selectedUnidad" :unidades="session.user.unidades" />
    </div>

    <section class="grid grid-3" v-if="salas?.length">
      <NuxtLink v-for="sala in salas" :key="sala.id" class="sala-card card" :to="`/admin/daycare/salas/${sala.id}`">
        <div class="card-header">{{ sala.unidad }}</div>
        <div class="card-body">
          <h2>{{ sala.sala }}</h2>
          <p>Usuarios, tareas, avisos y calendario.</p>
        </div>
        <div class="card-footer">Abrir sala</div>
      </NuxtLink>
    </section>
    <EmptyState v-else title="Sin salas disponibles" description="No encontramos salas para la unidad seleccionada." />
  </section>
</template>

<script setup lang="ts">
import type { PublicSession } from '~/types/session'
import type { Sala } from '~/types/daycare'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { data: session } = await useFetch<PublicSession>('/api/auth/me')
const selectedUnidad = ref(session.value?.user?.unidades?.[0] || '')
const { data: salas } = await useFetch<Sala[]>('/api/daycare/admin/salas', {
  query: computed(() => ({ unidad: selectedUnidad.value }))
})
</script>

<style scoped>
.admin-header {
  align-items: end;
  background: #fff;
  border: 3px solid rgba(142, 193, 82, 0.15);
  border-radius: 30px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr minmax(240px, 320px);
  padding: clamp(24px, 4vw, 40px);
}

.sala-card {
  overflow: hidden;
  padding: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.sala-card:hover {
  box-shadow: var(--shadow-card);
  transform: translateY(-4px);
}

.card-header,
.card-footer {
  align-items: center;
  background: var(--color-brand-700);
  color: #fff;
  display: flex;
  font-weight: 900;
  justify-content: center;
  min-height: 48px;
  padding: 10px;
}

.card-body {
  display: grid;
  min-height: 160px;
  padding: 24px;
  place-items: center;
  text-align: center;
}

.card-body h2 {
  color: #585858;
  font-family: Fredoka, Inter, sans-serif;
}

@media (max-width: 820px) {
  .admin-header {
    grid-template-columns: 1fr;
  }
}
</style>
