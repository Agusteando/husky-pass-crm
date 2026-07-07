<template>
  <AdminResourceModule
    type="hw"
    title="Tareas"
    description="Tareas para casa."
    action-label="Nueva tarea"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin', 'daycare-admin'] })
</script>
