<template>
  <aside v-if="session?.user?.kind === 'family'" class="side-panel" aria-label="Navegación familiar">
    <div class="mobile-hidden">
      <BrandMark :to="homeTo" />
    </div>

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
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--color-border);
  border-radius: 26px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 16px;
  padding: 16px;
  position: sticky;
  top: calc(var(--topbar-height) + 14px);
}

.family-context {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 18px;
  display: grid;
  gap: 3px;
  padding: 13px;
}

.family-context span {
  color: var(--color-brand-700);
  font-size: 0.73rem;
  font-weight: 850;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.family-context strong {
  color: var(--color-ink);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.family-context small {
  color: var(--color-muted);
  font-weight: 800;
}

.family-nav {
  display: grid;
  gap: 7px;
}

.family-nav a {
  border: 1px solid transparent;
  border-radius: 15px;
  color: var(--color-muted);
  font-weight: 850;
  padding: 10px 12px;
}

.family-nav a:hover,
.family-nav a.router-link-active {
  background: var(--color-brand-100);
  border-color: var(--color-brand-200);
  color: var(--color-brand-800);
}

@media (max-width: 980px) {
  .side-panel {
    gap: 12px;
    position: static;
  }

  .mobile-hidden {
    display: none;
  }

  .family-context {
    padding: 11px 12px;
  }

  .family-nav {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .family-nav a {
    flex: 0 0 auto;
    white-space: nowrap;
  }
}
</style>
