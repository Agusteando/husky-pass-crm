<template>
  <LoginPanel
    brand-to="/login/escolar"
    eyebrow="Experiencia Escolar"
    title="Acceso familiar escolar"
    description="Ingresa con la cuenta familiar vinculada a IECS o IEDIS."
    experience="escolar"
  >
    <ExperienceLoginForm experience="escolar" heading="Entrar a Experiencia Escolar" />
  </LoginPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
</script>
