<template>
  <section class="stack">
    <div class="hero-panel admin-hero">
      <div>
        <p class="eyebrow">Administración interna</p>
        <h1>Guardería</h1>
        <p>Gestiona salas, familias y publicaciones con el alcance de rol, unidad y sala definido en la base actual.</p>
      </div>
      <SalaPicker v-if="session?.user?.unidades?.length" v-model="selectedUnidad" :unidades="session.user.unidades" />
    </div>

    <section class="grid grid-3" v-if="salas?.length">
      <NuxtLink v-for="sala in salas" :key="sala.id" class="sala-card card" :to="`/admin/daycare/salas/${sala.id}`">
        <span class="badge">{{ sala.unidad }}</span>
        <h2>{{ sala.sala }}</h2>
        <p>Usuarios, tareas, circulares y calendario.</p>
      </NuxtLink>
    </section>
    <EmptyState v-else title="Sin salas disponibles" description="No encontramos salas para la unidad seleccionada o tu usuario no tiene alcance." />
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
.admin-hero {
  display: grid;
  grid-template-columns: 1fr minmax(240px, 320px);
  gap: 24px;
  align-items: end;
}

.sala-card {
  min-height: 190px;
  transition: transform 0.2s ease;
}

.sala-card:hover {
  transform: translateY(-3px);
}

@media (max-width: 820px) {
  .admin-hero {
    grid-template-columns: 1fr;
  }
}
</style>
