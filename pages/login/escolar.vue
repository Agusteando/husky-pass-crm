<template>
  <LoginPanel
    brand-to="/login"
    title="Husky Pass"
    experience="escolar"
  >
    <UnifiedLoginForm context="escolar" />
  </LoginPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
</script>
