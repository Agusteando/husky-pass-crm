<script setup lang="ts">
import { navigateTo } from 'nuxt/app'

definePageMeta({ layout: 'admin', middleware: 'admin' })
await navigateTo('/admin/daycare/salas')
</script>

<template>
  <div />
</template>
