<script setup lang="ts">
import { navigateTo } from 'nuxt/app'

definePageMeta({ layout: 'admin', middleware: ['admin', 'superadmin'] })
await navigateTo('/admin/superadmin', { replace: true })
</script>

<template>
  <span />
</template>
