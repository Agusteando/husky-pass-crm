<template>
  <LoginPanel
    brand-to="/login"
    title="Husky Pass"
    experience="admin"
  >
    <UnifiedLoginForm context="admin" />
  </LoginPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
</script>
