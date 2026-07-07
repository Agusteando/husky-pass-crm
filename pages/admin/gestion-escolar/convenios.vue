<template>
  <AdminGestionScopedContentManager
    kind="convenio"
    eyebrow="Convenios"
    title="Convenios visibles"
    description="Documentos activos."
    icon="handshake"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin', 'gestion-escolar-admin'] })
</script>
