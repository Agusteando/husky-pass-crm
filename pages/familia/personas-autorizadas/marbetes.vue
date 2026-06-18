<template>
  <div class="card loading-row" data-product-loading data-state="loading">Redirigiendo...</div>
</template>

<script setup lang="ts">
import { navigateTo } from 'nuxt/app'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })
await navigateTo('/familia/personas-autorizadas#marbetes', { replace: true })
</script>
