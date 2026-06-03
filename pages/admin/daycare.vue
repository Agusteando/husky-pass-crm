<template>
  <section class="stack">
    <div class="screen-head">
      <div>
        <p class="eyebrow">Administración interna</p>
        <h1>Guardería</h1>
        <p>Selecciona una sala para gestionar familias, tareas, avisos y calendario.</p>
      </div>
      <span class="unit-pill">{{ selectedUnidad || 'Unidad' }}</span>
    </div>

    <section class="sala-grid" v-if="salas?.length">
      <NuxtLink v-for="sala in salas" :key="sala.id" class="sala-card" :to="`/admin/daycare/salas/${sala.id}`">
        <div class="card-header">{{ sala.unidad }}</div>
        <div class="card-body">
          <span class="room-mark">{{ roomInitials(sala.sala) }}</span>
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

const route = useRoute()
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { data: session } = await useFetch<PublicSession>('/api/auth/me')
const selectedUnidad = computed(() => {
  const requested = typeof route.query.unidad === 'string' ? route.query.unidad : ''
  return requested || session.value?.user?.unidades?.[0] || ''
})
const { data: salas } = await useFetch<Sala[]>('/api/daycare/admin/salas', {
  query: computed(() => ({ unidad: selectedUnidad.value })),
  watch: [selectedUnidad]
})

function roomInitials(value?: string | null) {
  return String(value || 'S').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
}
</script>

<style scoped>
.unit-pill {
  align-self: end;
  background: #fff;
  border: 1px solid var(--color-brand-200);
  border-radius: 999px;
  color: var(--color-brand-800);
  font-weight: 850;
  padding: 9px 14px;
}

.sala-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.sala-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 22px;
  box-shadow: var(--shadow-soft);
  display: grid;
  min-height: 230px;
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.sala-card:hover {
  box-shadow: var(--shadow-card);
  transform: translateY(-3px);
}

.card-header,
.card-footer {
  align-items: center;
  background: var(--color-brand-700);
  color: #fff;
  display: flex;
  font-weight: 850;
  justify-content: center;
  min-height: 42px;
  padding: 8px 10px;
}

.card-body {
  display: grid;
  gap: 8px;
  padding: 18px;
  place-items: center;
  text-align: center;
}

.room-mark {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 20px;
  color: var(--color-brand-800);
  display: grid;
  font-weight: 900;
  height: 54px;
  place-items: center;
  width: 54px;
}

.card-body h2 {
  color: #585858;
  font-family: Fredoka, Inter, sans-serif;
  font-size: clamp(1.25rem, 2vw, 1.7rem);
  margin-bottom: 0;
}

@media (max-width: 1100px) {
  .sala-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .sala-grid {
    grid-template-columns: 1fr;
  }

  .sala-card {
    min-height: 0;
  }
}
</style>
