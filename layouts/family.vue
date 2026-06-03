<template>
  <div>
    <AppTopbar :session="session" :home-to="homeTo" :items="items" />
    <main class="page-shell layout-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import type { PublicSession } from '~/types/session'
import { defaultFamilyRoute, familyNavItems } from '~/utils/sessionScopes'

const { data: session } = await useFetch<PublicSession>('/api/auth/me', { key: 'layout-family-session' })
const homeTo = computed(() => defaultFamilyRoute(session.value?.user))
const items = computed(() => familyNavItems(session.value?.user))
</script>

<style scoped>
.layout-main {
  padding: 32px 0 64px;
}
</style>
