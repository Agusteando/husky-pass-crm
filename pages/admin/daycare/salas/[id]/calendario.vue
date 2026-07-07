<template>
  <AdminResourceModule
    type="cal"
    title="Calendario"
    description="Fechas de sala."
    action-label="Nuevo evento"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin', 'daycare-admin'] })
</script>
