<template>
  <AdminResourceModule
    type="hw"
    title="Tareas"
    description="Publicaciones de tarea que aparecerán en la experiencia familiar de guardería."
    action-label="Nueva tarea"
  />
</template>

<script setup lang="ts">
import { definePageMeta } from '#app'
definePageMeta({ layout: 'admin', middleware: 'admin' })
</script>
