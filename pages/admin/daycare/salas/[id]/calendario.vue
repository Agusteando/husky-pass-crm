<template>
  <AdminResourceModule
    type="cal"
    title="Calendario"
    description="Fechas de sala."
    action-label="Nuevo evento"
  />
</template>

<script setup lang="ts">
import AdminResourceModule from '~/components/admin/AdminResourceModule.vue'
definePageMeta({ layout: 'admin', middleware: ['admin', 'daycare-admin'] })
</script>
