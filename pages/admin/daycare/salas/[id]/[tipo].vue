<template>
  <section class="stack">
    <div class="screen-head">
      <div>
        <p class="eyebrow">{{ data?.sala?.unidad || 'Guardería' }}</p>
        <h1>{{ resource.label }} · {{ data?.sala?.sala || 'Sala' }}</h1>
        <p>{{ resourceDescription }}</p>
      </div>
      <div class="head-actions">
        <button class="btn btn-primary" type="button" @click="startCreate">Nueva publicación</button>
      </div>
    </div>

    <ResourceEditor
      v-if="editing"
      :resource="editing"
      :label="resource.label"
      :saving="saving"
      @save="save"
      @cancel="editing = null"
    />

    <p v-if="error" class="alert">No fue posible cargar las publicaciones.</p>
    <div v-else-if="pending" class="card loading-card">Cargando publicaciones…</div>
    <div v-else class="card table-wrap responsive-card-wrap">
      <table v-if="data?.rows?.length" class="table responsive-table admin-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Descripción</th>
            <th>Fecha</th>
            <th>Recurso</th>
            <th>Autor</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data.rows" :key="item.id">
            <td data-label="Título">{{ item.title }}</td>
            <td data-label="Descripción">{{ stripHtml(item.description) || '—' }}</td>
            <td data-label="Fecha">{{ item.date || '—' }}</td>
            <td data-label="Recurso">
              <a v-if="item.resource" :href="item.resource" target="_blank" rel="noopener">Abrir</a>
              <span v-else>—</span>
            </td>
            <td data-label="Autor">{{ item.autor || '—' }}</td>
            <td data-label="Acción" class="row-actions">
              <button class="btn btn-secondary" type="button" @click="editing = { ...item }">Editar</button>
              <button class="btn btn-danger" type="button" @click="remove(item.id)">Ocultar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <EmptyState v-else title="Sin publicaciones" description="No hay registros vigentes para esta sección." />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { DaycareResource, Sala } from '~/types/daycare'
import { stripHtml } from '~/utils/daycare'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const salaId = Number(route.params.id)
const resource = useDaycareResource(String(route.params.tipo))
const editing = ref<Partial<DaycareResource> | null>(null)
const saving = ref(false)

const { data, refresh, pending, error } = await useFetch<{ sala: Sala; rows: DaycareResource[] }>('/api/daycare/admin/resources', {
  query: { sala: salaId, type: resource.type }
})

const resourceDescription = computed(() => {
  if (resource.type === 'hw') return 'Publicaciones de tarea que aparecerán a las familias de la sala.'
  if (resource.type === 'news') return 'Avisos y comunicados visibles para las familias de la sala.'
  return 'Eventos del calendario mensual visibles desde la experiencia familiar.'
})

function startCreate() {
  editing.value = {
    sala: String(salaId),
    unidad: data.value?.sala.unidad,
    type: resource.type,
    title: '',
    description: '',
    date: resource.type === 'cal' ? new Date().toISOString().slice(0, 10) : null,
    starred: 0
  }
}

async function save(payload: Partial<DaycareResource>) {
  saving.value = true
  try {
    await $fetch('/api/daycare/admin/resources', {
      method: 'POST',
      body: { ...payload, sala: String(salaId), type: resource.type }
    })
    editing.value = null
    await refresh()
  } finally {
    saving.value = false
  }
}

async function remove(id?: number) {
  if (!id) return
  await $fetch(`/api/daycare/admin/resources/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<style scoped>
.admin-table td:nth-child(2) {
  max-width: 360px;
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.loading-card {
  color: var(--color-muted);
}

@media (max-width: 560px) {
  .row-actions .btn {
    width: 100%;
  }
}
</style>
