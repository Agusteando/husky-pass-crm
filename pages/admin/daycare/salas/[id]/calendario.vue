<template>
  <AdminResourceModule
    type="cal"
    title="Calendario"
    description="Eventos próximos que las familias consultan desde el calendario."
    action-label="Nuevo evento"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
</script>
