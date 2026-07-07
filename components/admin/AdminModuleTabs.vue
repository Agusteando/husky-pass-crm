<template>
  <nav class="admin-module-tabs" aria-label="Secciones de sala">
    <div v-if="unidad || salaName" class="scope-chip">
      <FamilyPersonasIcon name="daycare" />
      <span>{{ unidad || 'Guardería' }}<b v-if="salaName"> · {{ salaName }}</b></span>
    </div>
    <NuxtLink :to="unitRoute" class="change-unit" data-diagnostic-link="cambiar-unidad">Cambiar unidad</NuxtLink>
    <NuxtLink :to="`/admin/daycare/salas/${salaId}`" exact-active-class="active" data-diagnostic-link="tab-resumen">Resumen</NuxtLink>
    <NuxtLink :to="`/admin/daycare/salas/${salaId}/familias`" active-class="active" data-diagnostic-link="tab-familias">Familias</NuxtLink>
    <NuxtLink :to="`/admin/daycare/salas/${salaId}/tareas`" active-class="active" data-diagnostic-link="tab-tareas">Tareas</NuxtLink>
    <NuxtLink :to="`/admin/daycare/salas/${salaId}/avisos`" active-class="active" data-diagnostic-link="tab-avisos">Avisos</NuxtLink>
    <NuxtLink :to="`/admin/daycare/salas/${salaId}/calendario`" active-class="active" data-diagnostic-link="tab-calendario">Calendario</NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ salaId: number | string; unidad?: string | null; salaName?: string | null }>()
const unitRoute = computed(() => ({ path: '/admin/daycare/salas', query: props.unidad ? { unidad: props.unidad } : {} }))
</script>

<style scoped>
.admin-module-tabs {
  align-items: center;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: var(--shadow-line);
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 6px;
}

.admin-module-tabs a,
.scope-chip {
  border-radius: 13px;
  flex: 0 0 auto;
  font-size: 0.88rem;
  font-weight: 800;
  padding: 9px 12px;
  white-space: nowrap;
}

.admin-module-tabs a {
  color: var(--color-muted);
}

.admin-module-tabs a:hover,
.admin-module-tabs a.active {
  background: var(--color-brand-100);
  color: var(--color-brand-900);
}

.scope-chip {
  align-items: center;
  background: linear-gradient(135deg, #f0fbf7, #fffaf0);
  border: 1px solid rgba(8, 135, 125, 0.16);
  color: #075f58;
  display: inline-flex;
  gap: 7px;
}

.scope-chip b {
  color: #607086;
  font-weight: 900;
}

.change-unit {
  border: 1px solid rgba(8, 135, 125, 0.16);
}

@media (max-width: 640px) {
  .admin-module-tabs {
    margin-inline: -4px;
  }

  .admin-module-tabs a,
  .scope-chip {
    padding: 8px 10px;
  }
}
</style>
