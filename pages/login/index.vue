<template>
  <LoginPanel
    brand-to="/login"
    eyebrow="Acceso único"
    title="Husky Pass"
    experience="admin"
  >
    <UnifiedLoginForm />
  </LoginPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
</script>
