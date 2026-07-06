<script setup lang="ts">
import { navigateTo } from 'nuxt/app'

definePageMeta({ layout: 'admin', middleware: ['admin', 'gestion-escolar-admin'] })
await navigateTo('/admin/gestion-escolar/comunicados', { replace: true })
</script>

<template>
  <span />
</template>
