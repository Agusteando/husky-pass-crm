<template>
  <div>
    <AppTopbar :session="session" home-to="/admin/daycare" :items="items" />
    <main class="page-shell layout-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import type { PublicSession } from '~/types/session'

const { data: session } = await useFetch<PublicSession>('/api/auth/me', { key: 'layout-admin-session' })
const items = [
  { label: 'Guardería', to: '/admin/daycare' },
  { label: 'Bitácora', to: '/admin/daycare/bitacora' }
]
</script>

<style scoped>
.layout-main {
  padding: 32px 0 64px;
}
</style>
