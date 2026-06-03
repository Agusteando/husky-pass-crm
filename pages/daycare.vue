<template>
  <section class="stack">
    <div class="hero-panel family-hero">
      <div>
        <p class="eyebrow">Husky Pass Daycare</p>
        <h1>Hola, {{ session?.user?.displayName || session?.user?.email }}</h1>
        <p>Este espacio reúne las publicaciones de la sala asignada: tareas, circulares, calendario y recursos de apoyo.</p>
      </div>
      <div class="value-card">
        <span class="eyebrow">Valor del mes</span>
        <strong>{{ dashboard?.valor?.[0]?.valor || 'Por confirmar' }}</strong>
      </div>
    </div>

    <section class="grid grid-3">
      <NuxtLink class="action-card amber" to="/daycare/recursos/tareas">
        <span>Tareas</span>
        <strong>{{ dashboard?.tareas?.length || 0 }}</strong>
      </NuxtLink>
      <NuxtLink class="action-card green" to="/daycare/recursos/circulares">
        <span>Circulares</span>
        <strong>{{ dashboard?.circulares?.length || 0 }}</strong>
      </NuxtLink>
      <NuxtLink class="action-card pale" to="/daycare/recursos/calendario">
        <span>Calendario</span>
        <strong>{{ dashboard?.calendario?.length || 0 }}</strong>
      </NuxtLink>
    </section>

    <section class="grid grid-2">
      <div class="card stack">
        <div>
          <p class="eyebrow">Próximos eventos</p>
          <h2>Calendario</h2>
        </div>
        <ResourceCard v-for="item in dashboard?.calendario?.slice(0, 3)" :key="`cal-${item.id || item.title}`" :resource="item" />
        <EmptyState v-if="!dashboard?.calendario?.length" title="No hay eventos próximos" description="Cuando la sala publique calendario, aparecerá aquí." />
      </div>
      <div class="card stack">
        <div>
          <p class="eyebrow">Comunicados</p>
          <h2>Circulares recientes</h2>
        </div>
        <ResourceCard v-for="item in dashboard?.circulares?.slice(0, 3)" :key="`news-${item.id || item.title}`" :resource="item" />
        <EmptyState v-if="!dashboard?.circulares?.length" title="No hay circulares" description="La sala aún no ha publicado comunicados." />
      </div>
    </section>

    <section class="card stack">
      <div>
        <p class="eyebrow">Tarea más reciente</p>
        <h2>Seguimiento en casa</h2>
      </div>
      <ResourceCard v-if="dashboard?.tareas?.[0]" :resource="dashboard.tareas[0]" />
      <EmptyState v-else title="Sin tareas publicadas" description="Las tareas aparecerán en cuanto el equipo de guardería las publique." />
    </section>
  </section>
</template>

<script setup lang="ts">
import type { PublicSession } from '~/types/session'
import type { DaycareResource } from '~/types/daycare'

definePageMeta({ layout: 'family', middleware: 'family' })

const { data: session } = await useFetch<PublicSession>('/api/auth/me')
const { data: dashboard } = await useFetch<{
  tareas: DaycareResource[]
  circulares: DaycareResource[]
  calendario: DaycareResource[]
  valor: Array<{ valor: string }>
}>('/api/daycare/family/dashboard')
</script>

<style scoped>
.family-hero {
  display: grid;
  grid-template-columns: 1fr minmax(220px, 320px);
  gap: 24px;
  align-items: end;
}

.value-card {
  background: #fff;
  border: 2px dashed var(--color-amber);
  border-radius: 28px;
  padding: 24px;
}

.value-card strong {
  display: block;
  font-family: Fredoka, Inter, sans-serif;
  font-size: 2rem;
  line-height: 1.1;
  margin-top: 8px;
}

.action-card {
  border-radius: 28px;
  min-height: 160px;
  padding: 24px;
  color: #fff;
  display: flex;
  align-items: end;
  justify-content: space-between;
  box-shadow: var(--shadow-card);
}

.action-card span {
  font-weight: 900;
  font-size: 1.35rem;
}

.action-card strong {
  font-size: 3rem;
}

.amber { background: linear-gradient(135deg, #ffca7a, #ffad2e); }
.green { background: linear-gradient(135deg, #8ec152, #578b26); }
.pale { background: linear-gradient(135deg, #789667, #466035); }

@media (max-width: 820px) {
  .family-hero {
    grid-template-columns: 1fr;
  }
}
</style>
