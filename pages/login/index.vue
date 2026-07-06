<template>
  <LoginPanel
    brand-to="/login"
    eyebrow="Acceso único"
    title="Acceso Husky Pass"
    description="Familias y equipo interno entran desde una sola puerta."
    experience="admin"
  >
    <UnifiedLoginForm />
  </LoginPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
</script>
