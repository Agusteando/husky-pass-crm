<template>
  <LoginPanel
    brand-to="/login/guarderia"
    eyebrow="Experiencia Guardería"
    title="Acceso familiar Guardería"
    description="Ingresa con la cuenta familiar asignada a tu sala."
    experience="guarderia"
  >
    <ExperienceLoginForm experience="guarderia" heading="Entrar a Experiencia Guardería" />
    <NuxtLink class="btn btn-secondary create-link" to="/registro-guarderia">Crear acceso de Guardería</NuxtLink>
  </LoginPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
</script>

<style scoped>
.create-link {
  margin-top: 8px;
  width: 100%;
}
</style>
