<template>
  <label class="label">
    Unidad
    <select class="select" :value="modelValue" @change="handleChange">
      <option v-for="unidad in unidades" :key="unidad" :value="unidad">{{ unidad }}</option>
    </select>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  unidades: string[]
  modelValue?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function handleChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>
