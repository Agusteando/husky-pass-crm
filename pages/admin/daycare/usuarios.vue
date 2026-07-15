<template>
  <div class="legacy-users-redirect" aria-hidden="true" />
</template>

<script setup lang="ts">
import { navigateTo, useRoute } from 'nuxt/app'

const route = useRoute()
const salaId = Number(route.query.sala || 0)

await navigateTo(
  Number.isInteger(salaId) && salaId > 0
    ? `/admin/daycare/salas/${salaId}/familias`
    : '/admin/daycare/salas',
  { replace: true }
)

definePageMeta({ layout: 'admin', middleware: ['admin', 'daycare-admin'] })
</script>
