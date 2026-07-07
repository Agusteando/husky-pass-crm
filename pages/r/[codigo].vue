<template>
  <main class="registration-redirect">Abriendo registro…</main>
</template>

<script setup lang="ts">
import { useRoute, navigateTo } from 'nuxt/app'

definePageMeta({ middleware: 'guest' })

const route = useRoute()
const codigo = Array.isArray(route.params.codigo) ? route.params.codigo[0] : route.params.codigo
await navigateTo({ path: '/registro-guarderia', query: { codigo: String(codigo || '') } }, { replace: true })
</script>

<style scoped>
.registration-redirect {
  min-height: 100vh;
  display: grid;
  place-items: center;
  font: 800 1.1rem/1.2 Montserrat, system-ui, sans-serif;
  color: #21324a;
  background: linear-gradient(135deg, #fbf6ea, #e9f6f1);
}
</style>
