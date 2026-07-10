<template>
  <nav class="daycare-bottom-nav" aria-label="Navegación de guardería">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      :class="{ active: isActive(item.to) }"
    >
      <span class="nav-icon"><FamilyPersonasIcon :name="item.icon" /></span>
      <span>{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app'

const route = useRoute()
const items = [
  { label: 'Inicio', to: '/familia/daycare', icon: 'home' },
  { label: 'Tareas', to: '/familia/daycare/tareas', icon: 'edit' },
  { label: 'Avisos', to: '/familia/daycare/avisos', icon: 'announcement' },
  { label: 'Agenda', to: '/familia/daycare/calendario', icon: 'calendar' }
]

function isActive(to: string) {
  return route.path === to
}
</script>

<style scoped>
.daycare-bottom-nav {
  align-items: center;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(45, 95, 36, 0.14);
  border-radius: 22px;
  bottom: max(10px, env(safe-area-inset-bottom));
  box-shadow: 0 18px 48px rgba(38, 63, 28, 0.2);
  display: none;
  gap: 4px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  left: 50%;
  max-width: 520px;
  padding: 6px;
  position: fixed;
  transform: translateX(-50%);
  width: calc(100% - 20px);
  z-index: 32;
  backdrop-filter: blur(18px);
}

.daycare-bottom-nav a {
  align-items: center;
  border-radius: 16px;
  color: #76816f;
  display: grid;
  font-size: 0.67rem;
  font-weight: 750;
  gap: 3px;
  justify-items: center;
  min-height: 54px;
  padding: 5px 2px;
  transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.daycare-bottom-nav a.active {
  background: #eef7e5;
  color: #355f24;
}

.nav-icon {
  align-items: center;
  display: inline-flex;
  height: 26px;
  justify-content: center;
  width: 32px;
}

.daycare-bottom-nav a.active .nav-icon {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 5px 12px rgba(53, 95, 36, 0.1);
}

.daycare-bottom-nav :deep(.pa-icon) {
  height: 1.05rem;
  width: 1.05rem;
}

@media (max-width: 760px) {
  .daycare-bottom-nav {
    display: grid;
  }
}
</style>
