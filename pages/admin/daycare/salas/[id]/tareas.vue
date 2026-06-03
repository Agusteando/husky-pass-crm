<template>
  <AdminResourceModule
    type="hw"
    title="Tareas"
    description="Publicaciones de tarea que aparecerán en la experiencia familiar de guardería."
    action-label="Nueva tarea"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
</script>
