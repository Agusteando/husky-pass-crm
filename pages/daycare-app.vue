<script setup lang="ts">
import type { PublicSession } from '~/types/session'

const session = await $fetch<PublicSession>('/api/auth/me')
if (session.user?.kind === 'admin') {
  await navigateTo('/admin/daycare', { redirectCode: 301 })
} else {
  await navigateTo('/daycare', { redirectCode: 301 })
}
</script>
