<template>
  <div>
    <AppTopbar :session="session" :home-to="homeTo" :items="[]" />
    <div class="page-shell workspace-shell">
      <FamilySidebar :session="session" />
      <main class="layout-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import { defaultFamilyRoute } from '~/utils/sessionScopes'

const { data: session } = useFetch<PublicSession>('/api/auth/me', { key: 'layout-family-session' })
const homeTo = computed(() => defaultFamilyRoute(session.value?.user))
</script>

<style scoped>
.workspace-shell {
  display: grid;
  gap: 12px;
  grid-template-columns: 244px minmax(0, 1fr);
  padding: 12px 0 32px;
}

.layout-main {
  min-width: 0;
}

@media (max-width: 980px) {
  .workspace-shell {
    grid-template-columns: 1fr;
    padding-top: 10px;
  }
}
</style>
