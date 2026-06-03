<template>
  <section class="stack">
    <div class="section-header">
      <div>
        <p class="eyebrow">{{ data?.sala?.unidad }}</p>
        <h1>{{ resource.label }} · {{ data?.sala?.sala }}</h1>
      </div>
      <button class="btn btn-primary" type="button" @click="startCreate">Nueva publicación</button>
    </div>

    <ResourceEditor
      v-if="editing"
      :resource="editing"
      :label="resource.label"
      :saving="saving"
      @save="save"
      @cancel="editing = null"
    />

    <div class="card table-wrap">
      <table class="table admin-table">
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
          <tr v-for="item in data?.rows" :key="item.id">
            <td>{{ item.title }}</td>
            <td>{{ stripHtml(item.description) || '—' }}</td>
            <td>{{ item.date || '—' }}</td>
            <td>
              <a v-if="item.resource" :href="item.resource" target="_blank" rel="noopener">Abrir</a>
              <span v-else>—</span>
            </td>
            <td>{{ item.autor || '—' }}</td>
            <td class="row-actions">
              <button class="btn btn-secondary" type="button" @click="editing = { ...item }">Editar</button>
              <button class="btn btn-danger" type="button" @click="remove(item.id)">Ocultar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <EmptyState v-if="!data?.rows?.length" title="Sin publicaciones" description="No hay registros vigentes para esta sección." />
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

const { data, refresh } = await useFetch<{ sala: Sala; rows: DaycareResource[] }>('/api/daycare/admin/resources', {
  query: { sala: salaId, type: resource.type }
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
.section-header {
  align-items: end;
  background: #fff;
  border: 3px solid rgba(142, 193, 82, 0.15);
  border-radius: 30px;
  box-shadow: var(--shadow-soft);
  display: flex;
  gap: 20px;
  justify-content: space-between;
  padding: clamp(22px, 4vw, 34px);
}

.admin-table td:nth-child(2) {
  max-width: 360px;
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 760px) {
  .section-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
