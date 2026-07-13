<template>
  <LoginPanel
    brand-to="/login"
    title="Husky Pass"
    experience="admin"
  >
    <UnifiedLoginForm />
  </LoginPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
</script>
