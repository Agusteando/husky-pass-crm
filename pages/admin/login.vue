<template>
  <LoginPanel
    brand-to="/login"
    eyebrow="Colaboradores"
    title="Husky Pass"
    experience="admin"
  >
    <UnifiedLoginForm context="admin" />
  </LoginPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
</script>
