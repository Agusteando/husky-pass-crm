<script setup lang="ts">
import type { PublicSession } from '~/types/session'
import { defaultFamilyRoute, hasDaycareAdminScope } from '~/utils/sessionScopes'

const session = await $fetch<PublicSession>('/api/auth/me')
if (session.user?.kind === 'admin' && hasDaycareAdminScope(session.user)) {
  await navigateTo('/admin/daycare', { redirectCode: 301 })
} else if (session.user?.kind === 'family') {
  await navigateTo(defaultFamilyRoute(session.user), { redirectCode: 301 })
} else {
  await navigateTo('/login', { redirectCode: 301 })
}
</script>
