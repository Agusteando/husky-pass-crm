<template>
  <form class="card stack" @submit.prevent="submit">
    <div>
      <p class="eyebrow">{{ model.id ? 'Actualizar registro' : 'Nuevo registro' }}</p>
      <h2>{{ label }}</h2>
    </div>

    <div class="grid grid-2">
      <label class="label">
        Nombre(s)
        <input v-model="model.nombreP" class="input" required />
      </label>
      <label class="label">
        Apellido paterno
        <input v-model="model.paternoP" class="input" />
      </label>
      <label class="label">
        Apellido materno
        <input v-model="model.maternoP" class="input" />
      </label>
      <label class="label">
        Parentesco
        <input v-model="model.parenP" class="input" placeholder="Abuela, tío, tutor…" required />
      </label>
      <label class="label">
        Fecha
        <input v-model="model.fechaP" class="input" type="date" />
      </label>
      <label class="label">
        Foto / URL de archivo
        <input v-model="model.foto" class="input" placeholder="https://admin.casitaiedis.edu.mx/virtual/..." />
      </label>
    </div>

    <section class="child-section">
      <div>
        <p class="eyebrow">Alumnos vinculados</p>
        <h3>Datos de alumno</h3>
      </div>
      <div v-for="(child, index) in children" :key="child.id || index" class="child-card">
        <div class="grid grid-2">
          <label class="label">
            Nombre(s)
            <input v-model="child.nombreA" class="input" />
          </label>
          <label class="label">
            Apellido paterno
            <input v-model="child.paternoA" class="input" />
          </label>
          <label class="label">
            Apellido materno
            <input v-model="child.maternoA" class="input" />
          </label>
          <label class="label">
            Nivel educativo
            <input v-model="child.nivelEdu" class="input" placeholder="guardería, preescolar, primaria…" />
          </label>
          <label class="label">
            Grado
            <input v-model="child.grado" class="input" />
          </label>
          <label class="label">
            Grupo
            <input v-model="child.grupo" class="input" />
          </label>
          <label class="label">
            Campus
            <input v-model="child.campus" class="input" />
          </label>
          <label class="label">
            Fecha
            <input v-model="child.fechaA" class="input" type="date" />
          </label>
        </div>
      </div>
      <button class="btn btn-secondary" type="button" @click="addChild">Agregar alumno</button>
    </section>

    <div class="actions">
      <button class="btn btn-primary" type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
      <button class="btn btn-secondary" type="button" @click="$emit('cancel')">Cancelar</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { AuthorizedChild, AuthorizedPerson } from '~/types/daycare'

const props = defineProps<{
  person: Partial<AuthorizedPerson>
  label: string
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [payload: Partial<AuthorizedPerson>]
  cancel: []
}>()

const model = reactive<Partial<AuthorizedPerson>>({ ...props.person })
const children = ref<AuthorizedChild[]>([...(props.person.children || [])])

watch(() => props.person, (person) => {
  Object.assign(model, person)
  children.value = [...(person.children || [])]
}, { deep: true })

function addChild() {
  children.value.push({})
}

function submit() {
  emit('save', {
    ...model,
    children: children.value
  })
}
</script>

<style scoped>
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.child-section {
  border-top: 1px solid var(--color-border);
  display: grid;
  gap: 16px;
  padding-top: 20px;
}

.child-card {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 22px;
  padding: 18px;
}
</style>
