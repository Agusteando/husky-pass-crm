<template>
  <header class="admin-topbar" data-experience="admin">
    <div class="page-shell admin-topbar-inner">
      <NuxtLink class="admin-brand" :to="homeTo" aria-label="Husky Pass Administracion">
        <img src="/brand/husky-pass-logo.png" alt="Husky Pass" />
        <span>
          <strong>{{ title }}</strong>
          <small>{{ subtitle }}</small>
        </span>
      </NuxtLink>

      <form v-if="session?.user?.isSuperAdmin" class="admin-search" role="search" @submit.prevent="submitSearch">
        <FamilyPersonasIcon name="person" />
        <input v-model="search" type="search" placeholder="Buscar usuario, matricula o persona" aria-label="Buscar en administracion" />
      </form>

      <nav class="admin-nav" aria-label="Navegacion administrativa">
        <NuxtLink v-for="item in items" :key="item.to" :to="item.to" :class="{ active: isActive(item.to) }" :data-product-nav="item.key">
          <FamilyPersonasIcon :name="item.icon" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <TopbarAccountMenu :session="session" experience="admin" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { navigateTo, useRoute } from 'nuxt/app'
import type { PublicSession } from '~/types/session'

const props = defineProps<{
  session?: PublicSession | null
  homeTo: string
  items: Array<{ key: string; label: string; to: string; icon: string }>
}>()

const route = useRoute()
const search = ref('')
const title = computed(() => props.session?.user?.isSuperAdmin ? 'Super Admin' : 'Admin Guarderia')
const subtitle = computed(() => props.session?.user?.isSuperAdmin ? 'Operacion institucional' : (props.session?.user?.unidades?.[0] || 'Guarderia'))

function isActive(to: string) {
  const targetPath = to.split('?')[0] || to
  if (targetPath === '/admin/superadmin') return route.path === '/admin/superadmin'
  if (targetPath === '/admin/daycare/salas') return route.path.startsWith('/admin/daycare')
  return route.path === targetPath || route.path.startsWith(`${targetPath}/`)
}

async function submitSearch() {
  const value = search.value.trim()
  if (!value) return
  const target = route.path.startsWith('/admin/superadmin/personas-autorizadas')
    ? '/admin/superadmin/personas-autorizadas'
    : '/admin/superadmin'
  await navigateTo({ path: target, query: { buscar: value } })
}
</script>

<style scoped>
.admin-topbar {
  background: rgba(248, 250, 252, 0.94);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(203, 213, 225, 0.9);
  position: sticky;
  top: 0;
  z-index: 24;
}

.admin-topbar-inner {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(180px, auto) minmax(220px, 380px) minmax(0, 1fr) auto;
  min-height: var(--topbar-height);
}

.admin-brand {
  align-items: center;
  display: inline-grid;
  gap: 10px;
  grid-template-columns: 42px minmax(0, 1fr);
  min-width: 0;
}

.admin-brand img {
  display: block;
  max-height: 36px;
  object-fit: contain;
}

.admin-brand span {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.admin-brand strong,
.admin-brand small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-brand strong {
  color: var(--color-ink);
  font-size: 0.9rem;
}

.admin-brand small {
  color: var(--color-muted);
  font-size: 0.72rem;
}

.admin-search {
  align-items: center;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 13px;
  display: grid;
  gap: 8px;
  grid-template-columns: 18px minmax(0, 1fr);
  min-height: 38px;
  padding: 0 10px;
}

.admin-search input {
  background: transparent;
  border: 0;
  color: var(--color-ink);
  min-width: 0;
  outline: 0;
}

.admin-nav {
  align-items: center;
  display: flex;
  gap: 5px;
  min-width: 0;
  overflow-x: auto;
  padding: 4px 0;
  scrollbar-width: none;
}

.admin-nav::-webkit-scrollbar {
  display: none;
}

.admin-nav a {
  align-items: center;
  border: 1px solid transparent;
  border-radius: 12px;
  color: var(--color-muted);
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 0.8rem;
  gap: 7px;
  min-height: 36px;
  padding: 0 10px;
}

.admin-nav a:hover,
.admin-nav a.active {
  background: #fff;
  border-color: var(--color-border);
  color: var(--color-brand-800);
}

@media (max-width: 1120px) {
  .admin-topbar-inner {
    grid-template-columns: minmax(160px, auto) minmax(0, 1fr) auto;
  }

  .admin-search {
    order: 4;
    grid-column: 1 / -1;
    margin-bottom: 7px;
  }
}

@media (max-width: 720px) {
  .admin-topbar-inner {
    grid-template-columns: minmax(0, 1fr) auto;
    padding-block: 6px;
  }

  .admin-brand {
    grid-template-columns: 36px minmax(0, 1fr);
  }

  .admin-nav {
    grid-column: 1 / -1;
    order: 3;
  }

  .admin-search {
    grid-column: 1 / -1;
  }
}
</style>
