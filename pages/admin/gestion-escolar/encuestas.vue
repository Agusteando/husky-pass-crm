<template>
  <AdminGestionScopedContentManager
    kind="encuesta"
    eyebrow="Encuestas"
    title="Encuestas por audiencia"
    description="Publica Google Forms con resolucion automatica para cada familia."
    icon="survey"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin', 'gestion-escolar-admin'] })
</script>
