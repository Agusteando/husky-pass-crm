<template>
  <div>
    <AppTopbar :session="session" home-to="/admin/daycare" :items="[]" />
    <div class="page-shell legacy-shell">
      <AdminDaycareSidebar :session="session" />
      <main class="layout-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PublicSession } from '~/types/session'

const { data: session } = await useFetch<PublicSession>('/api/auth/me', { key: 'layout-admin-session' })
</script>

<style scoped>
.legacy-shell {
  display: grid;
  gap: 18px;
  grid-template-columns: 286px minmax(0, 1fr);
  padding: 18px 0 44px;
}

.layout-main {
  min-width: 0;
}

@media (max-width: 980px) {
  .legacy-shell {
    grid-template-columns: 1fr;
    padding-top: 12px;
  }
}
</style>
