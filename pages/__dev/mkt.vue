<template>
  <main class="dev-mkt-session">
    <HuskyPassLoader label="Abriendo Mercadotecnia" contained />
    <p v-if="error" class="alert">{{ error }}</p>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { navigateTo } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import { setCachedRouteSession } from '~/utils/routeSession'

definePageMeta({ middleware: 'dev-only' })

const error = ref('')
onMounted(async () => {
  try {
    const session = await $fetch<PublicSession>('/api/dev/mkt/session', { method: 'POST' })
    setCachedRouteSession(session)
    await navigateTo('/mkt')
  } catch (caught: any) {
    error.value = caught?.data?.statusMessage || caught?.statusMessage || 'No fue posible abrir la sesión de desarrollo.'
  }
})
</script>

<style scoped>
.dev-mkt-session { align-items:center; display:grid; gap:14px; min-height:100vh; padding:24px; place-content:center; }
</style>
