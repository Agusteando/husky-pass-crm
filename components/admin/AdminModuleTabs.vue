<template>
  <nav class="admin-module-tabs" aria-label="Secciones de sala">
    <div class="scope-group">
      <NuxtLink :to="unitRoute" class="scope-back" data-diagnostic-link="cambiar-unidad" aria-label="Volver a salas">
        <FamilyPersonasIcon name="arrow" />
      </NuxtLink>
      <div v-if="unidad || salaName" class="scope-chip">
        <span class="scope-mark"><FamilyPersonasIcon name="daycare" /></span>
        <span><small>{{ unidad || 'Guardería' }}</small><strong>{{ salaName || 'Sala' }}</strong></span>
      </div>
    </div>

    <div class="tab-track">
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        :exact-active-class="item.exact ? 'active' : undefined"
        :active-class="item.exact ? undefined : 'active'"
        :data-diagnostic-link="item.diagnostic"
      >
        <FamilyPersonasIcon :name="item.icon" />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ salaId: number | string; unidad?: string | null; salaName?: string | null }>()
const unitRoute = computed(() => ({ path: '/admin/daycare/salas', query: props.unidad ? { unidad: props.unidad } : {} }))
const items = computed(() => [
  { label: 'Resumen', icon: 'home', to: `/admin/daycare/salas/${props.salaId}`, diagnostic: 'tab-resumen', exact: true },
  { label: 'Familias', icon: 'people', to: `/admin/daycare/salas/${props.salaId}/familias`, diagnostic: 'tab-familias' },
  { label: 'Tareas', icon: 'edit', to: `/admin/daycare/salas/${props.salaId}/tareas`, diagnostic: 'tab-tareas' },
  { label: 'Avisos', icon: 'announcement', to: `/admin/daycare/salas/${props.salaId}/avisos`, diagnostic: 'tab-avisos' },
  { label: 'Agenda', icon: 'calendar', to: `/admin/daycare/salas/${props.salaId}/calendario`, diagnostic: 'tab-calendario' }
])
</script>

<style scoped>
.admin-module-tabs {
  align-items: center;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(66, 104, 49, 0.13);
  border-radius: 24px;
  box-shadow: 0 16px 44px rgba(51, 82, 37, 0.08);
  backdrop-filter: blur(16px);
  display: flex;
  gap: 14px;
  justify-content: space-between;
  overflow: hidden;
  padding: 7px;
  position: relative;
  z-index: 12;
}

.scope-group,
.scope-chip,
.tab-track,
.admin-module-tabs a {
  align-items: center;
  display: flex;
}

.scope-group {
  gap: 7px;
  min-width: 0;
}

.scope-back {
  background: #f3f7ee;
  border: 1px solid rgba(66, 104, 49, 0.12);
  border-radius: 16px;
  color: #426831;
  flex: 0 0 auto;
  height: 46px;
  justify-content: center;
  transform: rotate(180deg);
  width: 46px;
}

.scope-chip {
  gap: 10px;
  min-width: 0;
  padding-right: 10px;
}

.scope-mark {
  align-items: center;
  background: linear-gradient(135deg, #355f24, #8cad3e);
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(49, 95, 36, 0.18);
  color: #fff;
  display: inline-flex;
  flex: 0 0 auto;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.scope-chip > span:last-child {
  display: grid;
  min-width: 0;
}

.scope-chip small,
.scope-chip strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scope-chip small {
  color: #788173;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.scope-chip strong {
  color: #263f1c;
  font-family: var(--font-title);
  font-size: 1rem;
}

.tab-track {
  gap: 4px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.tab-track::-webkit-scrollbar {
  display: none;
}

.tab-track a {
  border: 1px solid transparent;
  border-radius: 16px;
  color: #697463;
  flex: 0 0 auto;
  font-size: 0.82rem;
  font-weight: 800;
  gap: 7px;
  min-height: 46px;
  padding: 0 13px;
  white-space: nowrap;
}

.tab-track a:hover {
  background: #f7f9f3;
  color: #355f24;
}

.tab-track a.active {
  background: linear-gradient(135deg, #eaf3dd, #fff3db);
  border-color: rgba(82, 127, 54, 0.15);
  box-shadow: inset 0 -2px 0 rgba(87, 139, 38, 0.28);
  color: #355f24;
}

@media (max-width: 900px) {
  .admin-module-tabs {
    align-items: stretch;
    flex-direction: column;
  }

  .scope-group {
    padding-inline: 2px;
  }

  .tab-track {
    width: 100%;
  }

  .tab-track a {
    flex: 1 0 auto;
    justify-content: center;
  }
}

@media (max-width: 720px) {
  .admin-module-tabs {
    background: rgba(255, 255, 255, 0.94);
    border-radius: 22px;
    bottom: max(10px, env(safe-area-inset-bottom));
    box-shadow: 0 24px 64px rgba(31, 44, 25, 0.24);
    left: 10px;
    padding: 7px;
    position: fixed;
    right: 10px;
  }

  .scope-group {
    display: none;
  }

  .tab-track {
    display: grid;
    gap: 3px;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    overflow: visible;
  }

  .tab-track a {
    display: grid;
    gap: 3px;
    justify-items: center;
    min-height: 58px;
    padding: 6px 2px;
  }

  .tab-track a span {
    font-size: 0.61rem;
  }

  .tab-track a :deep(.pa-icon) {
    height: 1.22rem;
    width: 1.22rem;
  }
}
</style>
