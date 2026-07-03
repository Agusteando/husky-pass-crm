<template>
  <AdminGestionScopedContentManager
    kind="encuesta"
    eyebrow="Encuestas"
    title="Encuestas por audiencia"
    description="Mantén formularios visibles para el plantel, grado o grupo correcto."
    icon="survey"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin', 'gestion-escolar-admin'] })
</script>
