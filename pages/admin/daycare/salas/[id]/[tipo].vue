<template>
  <section class="stack">
    <div class="hero-panel section-header">
      <div>
        <p class="eyebrow">{{ data?.sala?.unidad }}</p>
        <h1>{{ resource.label }} · {{ data?.sala?.sala }}</h1>
        <p>Publicaciones guardadas en `recursos`, filtradas por tipo, sala y unidad legacy.</p>
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

    <section class="grid grid-2" v-if="data?.rows?.length">
      <article v-for="item in data.rows" :key="item.id" class="card stack">
        <div>
          <span class="badge">{{ item.date || 'Sin fecha' }}</span>
          <h2>{{ item.title }}</h2>
          <p>{{ stripHtml(item.description) || 'Sin descripción.' }}</p>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" type="button" @click="editing = { ...item }">Editar</button>
          <button class="btn btn-danger" type="button" @click="remove(item.id)">Ocultar</button>
        </div>
      </article>
    </section>
    <EmptyState v-else title="Sin publicaciones" description="No hay recursos vigentes para esta sección." />
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
    date: new Date().toISOString().slice(0, 10),
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
.section-header,
.actions {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: end;
}

.actions {
  justify-content: flex-start;
}
</style>
