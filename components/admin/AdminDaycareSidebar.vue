<template>
  <aside v-if="session?.user?.kind === 'admin'" class="side-panel" aria-label="Administración de guardería">
    <div class="side-brand">
      <BrandMark to="/admin/daycare" />
      <span v-if="session.user.isSuperAdmin" class="badge">Super admin</span>
    </div>

    <label class="label compact-label">
      Unidad
      <select v-model="selectedUnidad" class="select" @change="syncUnidadRoute">
        <option v-for="unidad in session.user.unidades" :key="unidad" :value="unidad">{{ unidad }}</option>
      </select>
    </label>

    <section class="side-section salas-section">
      <div class="side-section-title">
        <span>Salas</span>
        <NuxtLink :to="{ path: '/admin/daycare', query: selectedUnidad ? { unidad: selectedUnidad } : {} }">Ver todas</NuxtLink>
      </div>

      <nav class="sala-list" aria-label="Salas por unidad">
        <NuxtLink
          v-for="sala in salas || []"
          :key="sala.id"
          :to="`/admin/daycare/salas/${sala.id}`"
          :class="{ active: String(sala.id) === selectedSala }"
          @click="selectedSala = String(sala.id)"
        >
          <span>{{ sala.sala }}</span>
          <small>{{ sala.unidad }}</small>
        </NuxtLink>
      </nav>

      <EmptyState v-if="salas && !salas.length" title="Sin salas" description="Selecciona otra unidad." />
    </section>

    <section v-if="selectedSala" class="side-section module-links">
      <NuxtLink :to="`/admin/daycare/salas/${selectedSala}/usuarios`">Usuarios</NuxtLink>
      <NuxtLink :to="`/admin/daycare/salas/${selectedSala}/tareas`">Tareas</NuxtLink>
      <NuxtLink :to="`/admin/daycare/salas/${selectedSala}/circulares`">Avisos</NuxtLink>
      <NuxtLink :to="`/admin/daycare/salas/${selectedSala}/calendario`">Calendario</NuxtLink>
      <button class="btn btn-primary preview-btn" type="button" @click="previewSala">Vista familiar</button>
    </section>
  </aside>
</template>

<script setup lang="ts">
import type { PublicSession } from '~/types/session'
import type { Sala } from '~/types/daycare'

const props = defineProps<{ session?: PublicSession | null }>()
const route = useRoute()

const routeSalaId = computed(() => {
  const raw = route.params.id
  return typeof raw === 'string' && /^\d+$/.test(raw) ? raw : ''
})

const selectedUnidad = ref(
  typeof route.query.unidad === 'string'
    ? route.query.unidad
    : props.session?.user?.unidades?.[0] || ''
)
const selectedSala = ref(routeSalaId.value)

watch(() => props.session?.user?.unidades, (unidades) => {
  if (!selectedUnidad.value && unidades?.length) selectedUnidad.value = unidades[0]
}, { immediate: true })

const { data: salas } = await useFetch<Sala[]>('/api/daycare/admin/salas', {
  query: computed(() => ({ unidad: selectedUnidad.value })),
  watch: [selectedUnidad]
})

watch(salas, (value) => {
  if (!value?.length) {
    selectedSala.value = ''
    return
  }

  if (routeSalaId.value && value.some((sala) => String(sala.id) === routeSalaId.value)) {
    selectedSala.value = routeSalaId.value
    return
  }

  if (!value.some((sala) => String(sala.id) === selectedSala.value)) {
    selectedSala.value = String(value[0].id)
  }
}, { immediate: true })

watch(() => route.params.id, (id) => {
  if (typeof id === 'string' && /^\d+$/.test(id)) selectedSala.value = id
})

function syncUnidadRoute() {
  selectedSala.value = ''
  navigateTo({ path: '/admin/daycare', query: { unidad: selectedUnidad.value } })
}

async function previewSala() {
  if (!selectedSala.value) return
  await $fetch('/api/auth/admin/preview-daycare', {
    method: 'POST',
    body: { sala: selectedSala.value }
  })
  await navigateTo('/daycare')
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

.side-brand {
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

.compact-label {
  gap: 7px;
}

.side-section {
  display: grid;
  gap: 10px;
}

.side-section-title {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.side-section-title span,
.side-section-title a {
  color: var(--color-muted);
  font-size: 0.73rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.side-section-title a {
  color: var(--color-brand-700);
}

.sala-list,
.module-links {
  display: grid;
  gap: 7px;
}

.sala-list {
  max-height: calc(100vh - 390px);
  overflow: auto;
  padding-right: 2px;
}

.sala-list a,
.module-links a {
  border: 1px solid transparent;
  border-radius: 15px;
  color: var(--color-muted);
  display: grid;
  gap: 2px;
  padding: 10px 12px;
}

.sala-list a:hover,
.sala-list a.active,
.module-links a:hover,
.module-links a.router-link-active {
  background: var(--color-brand-100);
  border-color: var(--color-brand-200);
  color: var(--color-brand-800);
}

.sala-list span,
.module-links a {
  font-weight: 850;
}

.sala-list small {
  font-size: 0.76rem;
}

.preview-btn {
  width: 100%;
}

@media (max-width: 980px) {
  .side-panel {
    gap: 12px;
    position: static;
  }

  .side-brand {
    display: none;
  }

  .salas-section {
    min-width: 0;
  }

  .sala-list,
  .module-links {
    display: flex;
    gap: 8px;
    max-height: none;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .sala-list a,
  .module-links a {
    min-width: 138px;
    white-space: nowrap;
  }

  .module-links .preview-btn {
    min-width: 148px;
    width: auto;
  }
}
</style>
