<template>
  <div>
    <AppTopbar :session="session" home-to="/daycare" :items="items" />
    <main class="page-shell layout-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import type { PublicSession } from '~/types/session'

const { data: session } = await useFetch<PublicSession>('/api/auth/me', { key: 'layout-family-session' })
const items = [
  { label: 'Inicio', to: '/daycare' },
  { label: 'Tareas', to: '/daycare/recursos/tareas' },
  { label: 'Circulares', to: '/daycare/recursos/circulares' },
  { label: 'Calendario', to: '/daycare/recursos/calendario' },
  { label: 'Personas Autorizadas', to: '/daycare/personas-autorizadas' }
]
</script>

<style scoped>
.layout-main {
  padding: 32px 0 64px;
}
</style>
