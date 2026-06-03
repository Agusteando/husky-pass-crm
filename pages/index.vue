<script setup lang="ts">
import { navigateTo } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import { defaultFamilyRoute, hasDaycareAdminScope } from '~/utils/sessionScopes'

const session = await $fetch<PublicSession>('/api/auth/me')
if (session.user?.kind === 'admin' && hasDaycareAdminScope(session.user)) {
  await navigateTo(session.user.isSuperAdmin ? '/admin/superadmin' : '/admin/daycare/salas')
} else if (session.user?.kind === 'family') {
  await navigateTo(defaultFamilyRoute(session.user))
} else {
  await navigateTo('/login')
}
</script>

<template>
  <div />
</template>
