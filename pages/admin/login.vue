<template>
  <LoginPanel
    brand-to="/login"
    eyebrow="Acceso interno"
    title="Acceso Husky Pass"
    description="El acceso administrativo se determina por la cuenta institucional y los módulos asignados."
    experience="admin"
  >
    <UnifiedLoginForm context="admin" heading="Acceso administrativo" description="Usa tu cuenta institucional; Husky Pass abrirá el módulo disponible." />
  </LoginPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
</script>
