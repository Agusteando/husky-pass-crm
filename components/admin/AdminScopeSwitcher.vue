<template>
  <section v-if="session?.user?.kind === 'admin'" class="admin-scope page-shell" aria-label="Selector de alcance administrativo">
    <label class="scope-field">
      <span>Unidad</span>
      <select v-model="selectedUnidad" class="select compact" @change="syncUnidadRoute">
        <option v-for="unidad in session.user.unidades" :key="unidad" :value="unidad">{{ unidad }}</option>
      </select>
    </label>

    <label class="scope-field grow">
      <span>Sala</span>
      <select v-model="selectedSala" class="select compact">
        <option v-for="sala in salas || []" :key="sala.id" :value="String(sala.id)">{{ sala.sala }}</option>
      </select>
    </label>

    <button class="btn btn-primary compact-btn" type="button" :disabled="!selectedSala" @click="openSelectedSala">
      Abrir sala
    </button>
  </section>
</template>

<script setup lang="ts">
import type { PublicSession } from '~/types/session'
import type { Sala } from '~/types/daycare'

const props = defineProps<{ session?: PublicSession | null }>()
const route = useRoute()

const selectedUnidad = ref(props.session?.user?.unidades?.[0] || '')
const selectedSala = ref('')
const routeSalaId = computed(() => {
  const raw = route.params.id
  return typeof raw === 'string' && /^\d+$/.test(raw) ? raw : ''
})

if (routeSalaId.value) {
  try {
    const sala = await $fetch<Sala>(`/api/daycare/admin/salas/${routeSalaId.value}`)
    selectedUnidad.value = sala.unidad
    selectedSala.value = String(sala.id)
  } catch {
    selectedSala.value = routeSalaId.value
  }
}

const { data: salas } = await useFetch<Sala[]>('/api/daycare/admin/salas', {
  query: computed(() => ({ unidad: selectedUnidad.value })),
  watch: [selectedUnidad]
})

watch(salas, (value) => {
  if (!value?.length) {
    selectedSala.value = ''
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
  if (route.path === '/admin/daycare') {
    navigateTo({ path: '/admin/daycare', query: { unidad: selectedUnidad.value } })
  }
}

function selectedModulePath() {
  const path = route.path
  if (path.endsWith('/usuarios')) return 'usuarios'
  const match = path.match(/\/(tareas|circulares|calendario)$/)
  return match?.[1] || ''
}

function openSelectedSala() {
  if (!selectedSala.value) return
  const modulePath = selectedModulePath()
  const target = modulePath
    ? `/admin/daycare/salas/${selectedSala.value}/${modulePath}`
    : `/admin/daycare/salas/${selectedSala.value}`
  navigateTo(target)
}
</script>

<style scoped>
.admin-scope {
  align-items: end;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(223, 232, 215, 0.92);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(180px, 260px) minmax(220px, 1fr) auto;
  margin-top: 18px;
  padding: 16px;
}

.scope-field {
  display: grid;
  gap: 7px;
}

.scope-field span {
  color: var(--color-muted);
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.grow {
  min-width: 0;
}

.compact {
  min-height: 42px;
  padding: 9px 12px;
}

.compact-btn {
  min-height: 42px;
}

@media (max-width: 820px) {
  .admin-scope {
    grid-template-columns: 1fr;
  }
}
</style>
