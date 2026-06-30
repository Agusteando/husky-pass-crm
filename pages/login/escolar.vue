<template>
  <LoginPanel
    brand-to="/login"
    eyebrow="Experiencia Escolar"
    title="Acceso Husky Pass"
    description="El acceso familiar escolar se abre automáticamente cuando la cuenta tiene permisos IECS o IEDIS."
    experience="escolar"
  >
    <UnifiedLoginForm context="escolar" />
  </LoginPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
</script>
