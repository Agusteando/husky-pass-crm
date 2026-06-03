<script setup lang="ts">
import type { PublicSession } from '~/types/session'

const session = await $fetch<PublicSession>('/api/auth/me')
if (session.user?.kind === 'admin') {
  await navigateTo('/admin/daycare')
} else if (session.user?.kind === 'family') {
  await navigateTo('/daycare')
} else {
  await navigateTo('/login')
}
</script>

<template>
  <div />
</template>
