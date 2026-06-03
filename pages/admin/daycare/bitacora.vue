<template>
  <section class="stack">
    <div class="hero-panel section-header">
      <div>
        <p class="eyebrow">Bitácora interna</p>
        <h1>Registro diario</h1>
        <p>Bitácora operativa para usuarios internos autorizados. Se conserva la tabla legacy `bitácoras`.</p>
      </div>
      <label class="label date-field">
        Fecha
        <input v-model="fecha" class="input" type="date" />
      </label>
    </div>

    <form class="grid grid-3" @submit.prevent="save">
      <label class="label card">
        Logros
        <textarea v-model="form.logros" class="textarea" />
      </label>
      <label class="label card">
        Contenido
        <textarea v-model="form.contenido" class="textarea" />
      </label>
      <label class="label card">
        Actividades
        <textarea v-model="form.actividades" class="textarea" />
      </label>
      <div class="actions">
        <button class="btn btn-primary" type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar bitácora' }}</button>
        <span v-if="saved" class="badge">Guardado</span>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const fecha = ref(new Date().toISOString().slice(0, 10))
const form = reactive({ uid: '', logros: '', contenido: '', actividades: '' })
const saving = ref(false)
const saved = ref(false)

async function load() {
  const data = await $fetch<Record<string, string>>('/api/daycare/admin/bitacora', { query: { fecha: fecha.value } })
  form.uid = data.uid || ''
  form.logros = data.logros || ''
  form.contenido = data.contenido || ''
  form.actividades = data.actividades || ''
}

watch(fecha, load)
await load()

async function save() {
  saving.value = true
  saved.value = false
  try {
    const result = await $fetch<{ uid: string }>('/api/daycare/admin/bitacora', {
      method: 'POST',
      body: { ...form, fecha: fecha.value }
    })
    form.uid = result.uid
    saved.value = true
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.section-header {
  display: grid;
  grid-template-columns: 1fr minmax(220px, 300px);
  gap: 24px;
  align-items: end;
}

.date-field {
  background: white;
  border-radius: 20px;
  padding: 18px;
}

.actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 14px;
  align-items: center;
}

@media (max-width: 820px) {
  .section-header {
    grid-template-columns: 1fr;
  }
}
</style>
