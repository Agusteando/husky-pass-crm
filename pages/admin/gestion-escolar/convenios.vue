<template>
  <AdminGestionScopedContentManager
    kind="convenio"
    eyebrow="Convenios"
    title="Convenios visibles"
    description="Publica documentos para una audiencia clara y deja inactivo lo que ya no aplica."
    icon="handshake"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin', 'gestion-escolar-admin'] })
</script>
