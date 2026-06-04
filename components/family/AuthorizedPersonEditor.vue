<template>
  <form class="editor-form" @submit.prevent="submit">
    <div class="grid grid-2 editor-fields">
      <label class="label">
        Nombre(s)
        <input v-model="model.nombreP" class="input" required autocomplete="given-name" />
      </label>
      <label class="label">
        Apellido paterno
        <input v-model="model.paternoP" class="input" autocomplete="family-name" />
      </label>
      <label class="label">
        Apellido materno
        <input v-model="model.maternoP" class="input" />
      </label>
      <label class="label">
        Parentesco
        <input v-model="model.parenP" class="input" required placeholder="Abuela, tío, nana..." />
      </label>
      <label class="label">
        Fecha de alta
        <input v-model="model.fechaP" class="input" type="date" />
      </label>
    </div>

    <FamilyPersonasImageUpload
      :initial-src="model.compressed_foto || model.foto"
      :persona-id="model.id || null"
      eyebrow="Foto de identificación"
      title="Foto para credencial y marbete"
      description="Sube una foto clara de frente. La imagen se prepara automáticamente al seleccionarla."
      @processed="setProcessedPhoto"
      @processing="photoBusy = $event"
      @error="visionError = $event"
    />

    <p v-if="visionError" class="alert compact-alert">{{ visionError }}</p>

    <div class="actions form-actions">
      <button class="btn btn-primary" type="submit" :disabled="saving || photoBusy">{{ saving ? 'Guardando…' : photoBusy ? 'Preparando foto…' : 'Guardar' }}</button>
      <button class="btn btn-secondary" type="button" :disabled="photoBusy" @click="$emit('cancel')">Cancelar</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { AuthorizedPerson } from '~/types/daycare'

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
const photoBusy = ref(false)
const visionError = ref('')

watch(() => props.person, (person) => {
  Object.assign(model, person)
  visionError.value = ''
}, { deep: true })

function setProcessedPhoto(payload: { url: string }) {
  model.compressed_foto = payload.url
  visionError.value = ''
}

function submit() {
  if (photoBusy.value) return
  emit('save', { ...model })
}
</script>

<style scoped>
.editor-form {
  display: grid;
  gap: 16px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.form-actions {
  background: var(--pa-soft, #f3f5f0);
  border: 1px solid var(--pa-border, #dce7d0);
  border-radius: 18px;
  justify-content: flex-end;
  padding: 12px;
}

.compact-alert {
  margin: 0;
}

@media (max-width: 760px) {
  .editor-fields {
    grid-template-columns: 1fr;
  }

  .form-actions .btn {
    flex: 1 1 140px;
  }
}
</style>
