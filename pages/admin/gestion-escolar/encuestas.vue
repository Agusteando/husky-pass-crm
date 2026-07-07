<template>
  <AdminGestionScopedContentManager
    kind="encuesta"
    eyebrow="Encuestas"
    title="Encuestas por audiencia"
    description="Formularios activos."
    icon="survey"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin', 'gestion-escolar-admin'] })
</script>
