<template>
  <form class="card editor-form" @submit.prevent="submit">
    <div class="editor-head">
      <div>
        <p class="eyebrow">{{ model.id ? 'Actualizar registro' : 'Nuevo registro' }}</p>
        <h2>{{ label }}</h2>
      </div>
      <div class="actions top-actions">
        <button class="btn btn-primary" type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
        <button class="btn btn-secondary" type="button" @click="$emit('cancel')">Cancelar</button>
      </div>
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
        <input v-model="model.parenP" class="input" required />
      </label>
      <label class="label">
        Fecha
        <input v-model="model.fechaP" class="input" type="date" />
      </label>
      <label class="label">
        Foto / URL de archivo
        <input v-model="model.foto" class="input" inputmode="url" />
      </label>
    </div>

    <section class="child-section">
      <div class="child-head">
        <div>
          <p class="eyebrow">Alumnos vinculados</p>
          <h3>Datos de alumno</h3>
        </div>
        <button class="btn btn-secondary" type="button" @click="addChild">Agregar alumno</button>
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
            <input v-model="child.nivelEdu" class="input" />
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
    </section>
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
.editor-form {
  display: grid;
  gap: 16px;
}

.editor-head,
.child-head {
  align-items: end;
  display: flex;
  gap: 14px;
  justify-content: space-between;
}

.editor-head h2,
.child-head h3 {
  margin-bottom: 0;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.child-section {
  border-top: 1px solid var(--color-border);
  display: grid;
  gap: 14px;
  padding-top: 16px;
}

.child-card {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 18px;
  padding: 14px;
}

@media (max-width: 720px) {
  .editor-head,
  .child-head {
    align-items: start;
    flex-direction: column;
  }

  .top-actions {
    width: 100%;
  }

  .top-actions .btn,
  .child-head .btn {
    flex: 1 1 140px;
  }
}
</style>
