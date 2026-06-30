<template>
  <LoginPanel
    brand-to="/login"
    eyebrow="Experiencia Guardería"
    title="Acceso Husky Pass"
    description="La cuenta familiar abre guardería, avisos, tareas o seguridad según sus permisos activos."
    experience="guarderia"
  >
    <UnifiedLoginForm context="guarderia" :show-registration="true" />
  </LoginPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
</script>
