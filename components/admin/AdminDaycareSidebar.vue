<template>
  <aside v-if="session?.user?.kind === 'admin'" class="workspace-rail" aria-label="Workspace de guardería">
    <div class="rail-header">
      <div>
        <p class="eyebrow">Workspace</p>
        <strong>Daycare</strong>
      </div>
      <span v-if="session.user.isSuperAdmin" class="status-pill">Super admin</span>
    </div>

    <section class="rail-context">
      <label class="label compact-label">
        Unidad
        <select v-model="selectedUnidad" class="select" @change="goToUnidad">
          <option v-for="unidad in unidades" :key="unidad" :value="unidad">{{ unidad }}</option>
        </select>
      </label>
      <label class="label compact-label">
        Sala
        <select v-model="selectedSala" class="select" :disabled="!salas?.length" @change="goToSala">
          <option value="">Selecciona sala</option>
          <option v-for="sala in salas || []" :key="sala.id" :value="String(sala.id)">{{ sala.sala }}</option>
        </select>
      </label>
      <button class="btn btn-primary preview-btn" type="button" :disabled="!selectedSala" @click="previewSala">Vista familiar</button>
    </section>

    <nav class="primary-nav" aria-label="Navegación daycare admin">
      <NuxtLink :to="{ path: '/admin/daycare/salas', query: selectedUnidad ? { unidad: selectedUnidad } : {} }" active-class="active">Salas</NuxtLink>
      <NuxtLink v-if="selectedSala" :to="`/admin/daycare/salas/${selectedSala}/familias`" active-class="active">Familias</NuxtLink>
      <NuxtLink v-if="selectedSala" :to="`/admin/daycare/salas/${selectedSala}/tareas`" active-class="active">Tareas</NuxtLink>
      <NuxtLink v-if="selectedSala" :to="`/admin/daycare/salas/${selectedSala}/avisos`" active-class="active">Avisos</NuxtLink>
      <NuxtLink v-if="selectedSala" :to="`/admin/daycare/salas/${selectedSala}/calendario`" active-class="active">Calendario</NuxtLink>
    </nav>

    <section class="rail-section">
      <div class="rail-title">
        <span>Salas activas</span>
        <small>{{ salas?.length || 0 }}</small>
      </div>
      <input v-model="search" class="input compact-search" type="search" placeholder="Buscar sala" />
      <div v-if="filteredSalas.length" class="rail-salas" role="list">
        <NuxtLink
          v-for="sala in filteredSalas"
          :key="sala.id"
          :to="`/admin/daycare/salas/${sala.id}`"
          :class="{ active: String(sala.id) === selectedSala }"
        >
          <span class="room-dot">{{ roomInitials(sala.sala) }}</span>
          <span class="sala-copy">
            <strong>{{ sala.sala }}</strong>
            <small>{{ sala.metrics.familias }} familias · {{ sala.metrics.totalRecursos }} publicaciones</small>
          </span>
        </NuxtLink>
      </div>
      <EmptyState v-else title="Sin salas" description="Cambia de unidad o ajusta la búsqueda." />
    </section>
  </aside>
</template>

<script setup lang="ts">
import type { PublicSession } from '~/types/session'
import type { SalaSummary } from '~/types/daycare'

const props = defineProps<{ session?: PublicSession | null }>()
const route = useRoute()

const unidades = computed(() => props.session?.user?.unidades || [])
const routeSalaId = computed(() => {
  const raw = route.params.id
  return typeof raw === 'string' && /^\d+$/.test(raw) ? raw : ''
})

const selectedUnidad = ref(typeof route.query.unidad === 'string' ? route.query.unidad : unidades.value[0] || '')
const selectedSala = ref(routeSalaId.value)
const search = ref('')

watch(unidades, (value) => {
  if (!selectedUnidad.value && value.length) selectedUnidad.value = value[0]
}, { immediate: true })

watch(() => route.query.unidad, (unidad) => {
  if (typeof unidad === 'string' && unidad && unidad !== selectedUnidad.value) selectedUnidad.value = unidad
})

watch(() => route.params.id, () => {
  selectedSala.value = routeSalaId.value
})

const { data: salas } = await useFetch<SalaSummary[]>('/api/daycare/admin/salas/overview', {
  query: computed(() => ({ unidad: selectedUnidad.value })),
  watch: [selectedUnidad]
})

const filteredSalas = computed(() => {
  const rows = salas.value || []
  const needle = search.value.trim().toLowerCase()
  if (!needle) return rows
  return rows.filter((sala) => `${sala.sala} ${sala.unidad}`.toLowerCase().includes(needle))
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
  if (selectedSala.value && !value.some((sala) => String(sala.id) === selectedSala.value)) {
    selectedSala.value = ''
  }
}, { immediate: true })

function goToUnidad() {
  selectedSala.value = ''
  navigateTo({ path: '/admin/daycare/salas', query: selectedUnidad.value ? { unidad: selectedUnidad.value } : {} })
}

function goToSala() {
  if (!selectedSala.value) return
  navigateTo(`/admin/daycare/salas/${selectedSala.value}`)
}

async function previewSala() {
  if (!selectedSala.value) return
  await $fetch('/api/auth/admin/preview-daycare', { method: 'POST', body: { sala: selectedSala.value } })
  await navigateTo('/familia/daycare')
}

function roomInitials(value?: string | null) {
  return String(value || 'S').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
}
</script>

<style scoped>
.workspace-rail {
  align-self: start;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 12px;
  padding: 12px;
  position: sticky;
  top: calc(var(--topbar-height) + 12px);
}

.rail-header,
.rail-title {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.rail-header strong {
  color: var(--color-ink);
  font-size: 1.15rem;
}

.status-pill {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 999px;
  color: var(--color-brand-800);
  font-size: 0.72rem;
  font-weight: 900;
  padding: 5px 9px;
}

.rail-context {
  background: linear-gradient(180deg, #fbfdf8, #f1f7e8);
  border: 1px solid var(--color-brand-200);
  border-radius: 18px;
  display: grid;
  gap: 9px;
  padding: 10px;
}

.compact-label {
  gap: 5px;
}

.preview-btn {
  width: 100%;
}

.primary-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.primary-nav a {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-muted);
  font-size: 0.82rem;
  font-weight: 860;
  padding: 7px 10px;
}

.primary-nav a:hover,
.primary-nav a.active,
.primary-nav a.router-link-active {
  background: var(--color-brand-100);
  border-color: var(--color-brand-200);
  color: var(--color-brand-900);
}

.rail-section {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.rail-title span,
.rail-title small {
  color: var(--color-muted);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.compact-search {
  min-height: 36px;
  padding-block: 8px;
}

.rail-salas {
  display: grid;
  gap: 7px;
  max-height: calc(100vh - 470px);
  overflow: auto;
  padding-right: 2px;
}

.rail-salas a {
  align-items: center;
  border: 1px solid transparent;
  border-radius: 15px;
  display: grid;
  gap: 9px;
  grid-template-columns: 38px minmax(0, 1fr);
  padding: 8px;
}

.rail-salas a:hover,
.rail-salas a.active,
.rail-salas a.router-link-active {
  background: var(--color-brand-100);
  border-color: var(--color-brand-200);
}

.room-dot {
  align-items: center;
  background: #fff;
  border: 1px solid var(--color-brand-200);
  border-radius: 13px;
  color: var(--color-brand-900);
  display: inline-flex;
  font-size: 0.76rem;
  font-weight: 950;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.sala-copy {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.sala-copy strong,
.sala-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sala-copy strong {
  color: var(--color-ink);
  font-size: 0.9rem;
}

.sala-copy small {
  color: var(--color-muted);
  font-size: 0.76rem;
}

@media (max-width: 980px) {
  .workspace-rail {
    gap: 10px;
    position: static;
  }

  .rail-header {
    display: none;
  }

  .rail-context {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .preview-btn {
    grid-column: 1 / -1;
  }

  .rail-section {
    display: none;
  }

  .primary-nav {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .primary-nav a {
    flex: 0 0 auto;
  }
}

@media (max-width: 560px) {
  .rail-context {
    grid-template-columns: 1fr;
  }
}
</style>
