<template>
  <LoginPanel
    brand-to="/login"
    eyebrow="Familias"
    title="Husky Pass"
    experience="guarderia"
  >
    <UnifiedLoginForm context="guarderia" :show-registration="true" />
  </LoginPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
</script>
