<template>
  <form class="card stack" @submit.prevent="submit">
    <div>
      <p class="eyebrow">{{ model.id ? 'Editar publicación' : 'Nueva publicación' }}</p>
      <h2>{{ label }}</h2>
    </div>
    <div class="grid grid-2">
      <label class="label">
        Título
        <input v-model="model.title" class="input" required />
      </label>
      <label class="label">
        Fecha
        <input v-model="model.date" class="input" type="date" />
      </label>
    </div>
    <label class="label">
      Descripción
      <textarea v-model="model.description" class="textarea" />
    </label>
    <div class="grid grid-2">
      <label class="label">
        Recurso o archivo publicado
        <input v-model="model.resource" class="input" placeholder="https://..." />
      </label>
      <label class="label check-row">
        <input v-model="model.starred" type="checkbox" />
        Marcar como prioritario
      </label>
    </div>
    <div class="actions">
      <button class="btn btn-primary" type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
      <button class="btn btn-secondary" type="button" @click="$emit('cancel')">Cancelar</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { DaycareResource } from '~/types/daycare'

const props = defineProps<{
  resource: Partial<DaycareResource>
  label: string
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [payload: Partial<DaycareResource>]
  cancel: []
}>()

const model = reactive<Partial<DaycareResource>>({ ...props.resource })

watch(() => props.resource, (resource) => Object.assign(model, resource), { deep: true })

function submit() {
  emit('save', { ...model, starred: model.starred ? 1 : 0 })
}
</script>

<style scoped>
.actions,
.check-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.check-row {
  align-self: end;
  flex-direction: row;
  padding: 14px 0;
}
</style>
