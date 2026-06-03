<template>
  <aside v-if="session?.user?.kind === 'family'" class="side-panel" aria-label="Navegación familiar">
    <BrandMark :to="homeTo" />

    <div class="family-context">
      <span>{{ contextLabel }}</span>
      <strong>{{ session.user.displayName || session.user.email }}</strong>
      <small v-if="daycareSala">Sala {{ daycareSala }}</small>
    </div>

    <nav class="family-nav">
      <NuxtLink v-for="item in items" :key="item.to" :to="item.to">
        {{ item.label }}
      </NuxtLink>
    </nav>

    <button v-if="session.user.impersonation" class="btn btn-primary" type="button" @click="exitImpersonation">
      Volver a admin
    </button>
  </aside>
</template>

<script setup lang="ts">
import type { PublicSession } from '~/types/session'
import { defaultFamilyRoute, familyNavItems, hasFamilyScope } from '~/utils/sessionScopes'

const props = defineProps<{ session?: PublicSession | null }>()
const items = computed(() => familyNavItems(props.session?.user))
const homeTo = computed(() => defaultFamilyRoute(props.session?.user))
const daycareSala = computed(() => props.session?.user?.scopes.daycare?.sala || '')
const contextLabel = computed(() => hasFamilyScope(props.session?.user, 'daycare') ? 'Guardería' : 'Familia')

async function exitImpersonation() {
  await $fetch('/api/auth/impersonation/exit', { method: 'POST' })
  await navigateTo('/admin/daycare')
}
</script>

<style scoped>
.side-panel {
  align-self: start;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid var(--color-border);
  border-radius: 30px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 22px;
  padding: 20px;
  position: sticky;
  top: 104px;
}

.family-context {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 22px;
  display: grid;
  gap: 4px;
  padding: 16px;
}

.family-context span {
  color: var(--color-brand-700);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.family-context strong {
  color: var(--color-ink);
  line-height: 1.2;
}

.family-context small {
  color: var(--color-muted);
  font-weight: 800;
}

.family-nav {
  display: grid;
  gap: 8px;
}

.family-nav a {
  border: 1px solid transparent;
  border-radius: 18px;
  color: var(--color-muted);
  font-weight: 900;
  padding: 12px 14px;
}

.family-nav a:hover,
.family-nav a.router-link-active {
  background: var(--color-brand-100);
  border-color: var(--color-brand-200);
  color: var(--color-brand-800);
}

@media (max-width: 980px) {
  .side-panel {
    position: static;
  }
}
</style>
