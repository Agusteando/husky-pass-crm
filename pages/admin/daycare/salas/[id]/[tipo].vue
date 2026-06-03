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

    <section class="publication-grid" v-if="data?.rows?.length">
      <article v-for="item in data.rows" :key="item.id" class="publication-card">
        <div class="publication-header">
          <span>{{ item.date || 'Sin fecha' }}</span>
        </div>
        <div class="publication-body">
          <h2>{{ item.title }}</h2>
          <p>{{ stripHtml(item.description) || 'Sin descripción.' }}</p>
        </div>
        <div class="publication-actions">
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
.publication-actions {
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

.publication-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.publication-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  display: grid;
  overflow: hidden;
}

.publication-header {
  background: #eaf2e0;
  color: var(--color-brand-700);
  font-weight: 900;
  padding: 12px 18px;
}

.publication-body {
  padding: 22px;
}

.publication-actions {
  border: 0;
  border-radius: 0;
  box-shadow: none;
  justify-content: flex-start;
  padding: 18px 22px;
}

@media (max-width: 760px) {
  .section-header,
  .publication-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .publication-grid {
    display: grid;
  }
}
</style>
