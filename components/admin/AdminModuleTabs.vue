<template>
  <nav class="admin-module-tabs" aria-label="Módulos de sala">
    <NuxtLink :to="`/admin/daycare/salas/${salaId}`" exact-active-class="active">Resumen</NuxtLink>
    <NuxtLink :to="`/admin/daycare/salas/${salaId}/familias`" active-class="active">Familias</NuxtLink>
    <NuxtLink :to="`/admin/daycare/salas/${salaId}/tareas`" active-class="active">Tareas</NuxtLink>
    <NuxtLink :to="`/admin/daycare/salas/${salaId}/avisos`" active-class="active">Avisos</NuxtLink>
    <NuxtLink :to="`/admin/daycare/salas/${salaId}/calendario`" active-class="active">Calendario</NuxtLink>
  </nav>
</template>

<script setup lang="ts">
defineProps<{ salaId: number | string }>()
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

.admin-module-tabs a {
  border-radius: 13px;
  color: var(--color-muted);
  flex: 0 0 auto;
  font-size: 0.88rem;
  font-weight: 860;
  padding: 9px 12px;
  white-space: nowrap;
}

.admin-module-tabs a:hover,
.admin-module-tabs a.active,
.admin-module-tabs a.router-link-active {
  background: var(--color-brand-100);
  color: var(--color-brand-900);
}

@media (max-width: 640px) {
  .admin-module-tabs {
    margin-inline: -4px;
  }

  .admin-module-tabs a {
    padding: 8px 10px;
  }
}
</style>
