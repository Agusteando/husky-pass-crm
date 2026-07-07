<template>
  <AdminResourceModule
    type="hw"
    title="Tareas"
    description="Tareas para casa."
    action-label="Nueva tarea"
  />
</template>

<script setup lang="ts">
import AdminResourceModule from '~/components/admin/AdminResourceModule.vue'
definePageMeta({ layout: 'admin', middleware: ['admin', 'daycare-admin'] })
</script>
