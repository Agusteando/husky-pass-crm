<template>
  <header class="admin-topbar" data-experience="admin">
    <div class="page-shell admin-topbar-inner" :class="{ 'is-superadmin': isSuperAdmin }">
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

      <div class="admin-account-slot">
        <TopbarAccountMenu :session="session" experience="admin" />
      </div>
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
const isSuperAdmin = computed(() => Boolean(props.session?.user?.isSuperAdmin))
const hasGestionOnly = computed(() => props.items.some((item) => item.key === 'gestion-escolar') && !props.items.some((item) => item.key === 'guarderia-admin'))
const hasComunicadosOnly = computed(() => props.items.some((item) => item.key === 'comunicados') && !props.items.some((item) => item.key === 'guarderia-admin') && !props.items.some((item) => item.key === 'gestion-escolar'))
const title = computed(() => props.session?.user?.isSuperAdmin ? 'Super Admin' : hasGestionOnly.value ? 'Gestión Escolar' : hasComunicadosOnly.value ? 'Comunicados' : 'Admin Guardería')
const subtitle = computed(() => props.session?.user?.isSuperAdmin ? 'Operación institucional' : hasGestionOnly.value ? 'Operación escuela-familia' : hasComunicadosOnly.value ? 'Comunicación institucional' : (props.session?.user?.unidades?.[0] || 'Guardería'))

function isActive(to: string) {
  const targetPath = to.split('?')[0] || to
  if (targetPath === '/admin/superadmin') return route.path === '/admin/superadmin'
  if (targetPath === '/admin/gestion-escolar') return route.path.startsWith('/admin/gestion-escolar')
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
  gap: 8px;
  grid-template-areas: "brand search nav account";
  grid-template-columns: minmax(150px, max-content) minmax(190px, 320px) minmax(0, 1fr) minmax(0, auto);
  min-height: var(--topbar-height);
  padding-block: 6px;
}

.admin-topbar-inner.is-superadmin {
  grid-template-areas:
    "brand search . account"
    "nav nav nav nav";
  grid-template-columns: minmax(160px, max-content) minmax(240px, 420px) minmax(0, 1fr) minmax(0, auto);
  min-height: auto;
  row-gap: 6px;
  padding-block: 7px 8px;
}

.admin-brand {
  align-items: center;
  display: inline-grid;
  gap: 10px;
  grid-area: brand;
  grid-template-columns: 38px minmax(0, 1fr);
  min-width: 0;
}

.admin-brand img {
  display: block;
  max-height: 34px;
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
  grid-area: search;
  grid-template-columns: 18px minmax(0, 1fr);
  min-height: 34px;
  min-width: 0;
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
  grid-area: nav;
  inline-size: 100%;
  justify-self: stretch;
  max-inline-size: 100%;
  min-width: 0;
  overflow-x: auto;
  padding: 4px 0;
  scrollbar-width: none;
}

.admin-topbar-inner.is-superadmin .admin-nav {
  flex-wrap: wrap;
  overflow: visible;
  padding: 0;
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
  min-height: 34px;
  padding: 0 10px;
}

.admin-topbar-inner.is-superadmin .admin-nav a {
  min-height: 32px;
  padding-inline: 11px;
}

.admin-nav a:hover,
.admin-nav a.active {
  background: #fff;
  border-color: var(--color-border);
  color: var(--color-brand-800);
}

.admin-account-slot {
  display: flex;
  grid-area: account;
  justify-content: flex-end;
  min-width: 0;
}

@media (max-width: 1180px) {
  .admin-topbar-inner {
    grid-template-areas: "brand nav account";
    grid-template-columns: minmax(140px, max-content) minmax(0, 1fr) auto;
    min-height: auto;
  }

  .admin-topbar-inner.is-superadmin {
    grid-template-areas:
      "brand account"
      "search search"
      "nav nav";
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .admin-search {
    margin-bottom: 2px;
  }
}

@media (max-width: 980px) {
  .admin-topbar-inner {
    grid-template-areas:
      "brand account"
      "nav nav";
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .admin-nav a {
    flex: 1 0 max-content;
    justify-content: center;
  }

  .admin-topbar-inner.is-superadmin .admin-nav a {
    flex: 0 0 auto;
  }
}

@media (max-width: 720px) {
  .admin-topbar-inner {
    padding-block: 5px;
  }

  .admin-brand {
    gap: 8px;
    grid-template-columns: 34px minmax(0, 1fr);
  }

  .admin-brand small {
    display: none;
  }

  .admin-nav {
    width: 100%;
  }

  .admin-nav a {
    border-radius: 13px;
    min-height: 40px;
    padding-inline: 11px;
  }
}

@media (max-width: 520px) {
  .admin-brand strong {
    font-size: .82rem;
  }

  .admin-nav a span {
    display: none;
  }

  .admin-nav a {
    flex-basis: 44px;
    min-width: 44px;
    padding-inline: 0;
  }
}

</style>
