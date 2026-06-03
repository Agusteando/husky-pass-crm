<template>
  <form class="card editor-form" @submit.prevent="submit">
    <div class="editor-head">
      <div>
        <p class="eyebrow">{{ model.id ? 'Editar publicación' : 'Nueva publicación' }}</p>
        <h2>{{ label }}</h2>
      </div>
      <div class="actions top-actions">
        <button class="btn btn-primary" type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
        <button class="btn btn-secondary" type="button" @click="$emit('cancel')">Cancelar</button>
      </div>
    </div>
    <div class="grid grid-2">
      <label class="label">
        Título
        <input v-model="model.title" class="input" required />
      </label>
      <label class="label">
        Fecha
        <input v-model="model.date" class="input" type="date" :required="type === 'cal'" />
      </label>
    </div>
    <label class="label">
      Descripción
      <textarea v-model="model.description" class="textarea" />
    </label>
    <div class="grid grid-2">
      <label class="label">
        Recurso publicado
        <input v-model="model.resource" class="input" inputmode="url" placeholder="URL o ruta del archivo" />
      </label>
      <label class="label check-row">
        <input v-model="model.starred" type="checkbox" />
        Marcar como prioritario
      </label>
      <label class="label check-row">
        <input v-model="published" type="checkbox" />
        Publicar para familias
      </label>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { DaycareResource } from '~/types/daycare'

const props = defineProps<{
  resource: Partial<DaycareResource>
  label: string
  type: 'hw' | 'news' | 'cal'
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [payload: Partial<DaycareResource>]
  cancel: []
}>()

const model = reactive<Partial<DaycareResource>>({ ...props.resource })

const published = computed({
  get: () => !isHidden(model.hidden),
  set: (value: boolean) => {
    model.hidden = value ? 0 : 1
  }
})

watch(() => props.resource, (resource) => Object.assign(model, resource), { deep: true })

function submit() {
  emit('save', { ...model, starred: model.starred ? 1 : 0, hidden: published.value ? 0 : 1 })
}

function isHidden(value: unknown) {
  return value === true || value === 1 || String(value) === '1'
}
</script>

<style scoped>
.editor-form {
  display: grid;
  gap: 16px;
}

.editor-head {
  align-items: end;
  display: flex;
  gap: 14px;
  justify-content: space-between;
}

.editor-head h2 {
  margin-bottom: 0;
}

.actions,
.check-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.check-row {
  align-self: end;
  flex-direction: row;
  padding: 12px 0;
}

@media (max-width: 720px) {
  .editor-head {
    align-items: start;
    flex-direction: column;
  }

  .top-actions {
    width: 100%;
  }

  .top-actions .btn {
    flex: 1 1 140px;
  }
}
</style>
