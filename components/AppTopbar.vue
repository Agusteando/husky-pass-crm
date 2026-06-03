<template>
  <header class="topbar">
    <div class="page-shell topbar-inner">
      <BrandMark :to="homeTo" />
      <nav class="topbar-nav" aria-label="Navegación principal">
        <NuxtLink v-for="item in items" :key="item.to" :to="item.to" active-class="active">
          {{ item.label }}
        </NuxtLink>
      </nav>
      <div class="profile" v-if="session?.user">
        <img v-if="session.user.picture" :src="session.user.picture" alt="" />
        <span v-else class="avatar">{{ initials }}</span>
        <div>
          <strong>{{ session.user.displayName || session.user.email }}</strong>
          <small>{{ session.user.email }}</small>
        </div>
        <button class="btn btn-secondary" type="button" @click="logout">Salir</button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { PublicSession } from '~/types/session'

const props = defineProps<{
  session?: PublicSession | null
  homeTo: string
  items: Array<{ label: string; to: string }>
}>()

const initials = computed(() => {
  const source = props.session?.user?.displayName || props.session?.user?.email || 'HP'
  return source.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
})

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo(props.session?.user?.kind === 'admin' ? '/admin/login' : '/login')
}
</script>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(18px);
  background: rgba(247, 249, 243, 0.84);
  border-bottom: 1px solid rgba(223, 232, 215, 0.74);
}

.topbar-inner {
  min-height: 82px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.topbar-nav {
  display: flex;
  gap: 8px;
  align-items: center;
}

.topbar-nav a {
  border-radius: 999px;
  color: var(--color-muted);
  font-weight: 800;
  padding: 10px 14px;
}

.topbar-nav a.active,
.topbar-nav a:hover {
  background: var(--color-brand-100);
  color: var(--color-brand-800);
}

.profile {
  display: flex;
  gap: 12px;
  align-items: center;
}

.profile img,
.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
}

.avatar {
  display: grid;
  place-items: center;
  background: var(--color-brand-200);
  color: var(--color-brand-900);
  font-weight: 900;
}

.profile strong,
.profile small {
  display: block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile small {
  color: var(--color-muted);
}

@media (max-width: 980px) {
  .topbar-inner {
    align-items: flex-start;
    flex-direction: column;
    padding: 14px 0;
  }

  .topbar-nav {
    overflow-x: auto;
    width: 100%;
    padding-bottom: 4px;
  }

  .profile {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
