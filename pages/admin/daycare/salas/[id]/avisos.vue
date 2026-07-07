<template>
  <AdminResourceModule
    type="news"
    title="Avisos"
    description="Mensajes de sala."
    action-label="Nuevo aviso"
  />
</template>

<script setup lang="ts">
import AdminResourceModule from '~/components/admin/AdminResourceModule.vue'
definePageMeta({ layout: 'admin', middleware: ['admin', 'daycare-admin'] })
</script>
