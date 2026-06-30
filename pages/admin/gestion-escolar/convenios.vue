<template>
  <AdminGestionScopedContentManager
    kind="convenio"
    eyebrow="Convenios"
    title="Convenios y flipbooks"
    description="Configura publicaciones institucionales por plantel, nivel, grado o grupo."
    icon="handshake"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin', 'gestion-escolar-admin'] })
</script>
