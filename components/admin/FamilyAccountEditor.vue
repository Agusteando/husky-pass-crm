<template>
  <form class="card editor-form" @submit.prevent="submit">
    <div class="editor-head">
      <div>
        <p class="eyebrow">{{ model.id ? 'Editar cuenta familiar' : 'Nueva cuenta familiar' }}</p>
        <h2>Acceso de familia</h2>
      </div>
      <div class="actions top-actions">
        <button class="btn btn-primary" type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
        <button class="btn btn-secondary" type="button" @click="$emit('cancel')">Cancelar</button>
      </div>
    </div>
    <div class="grid grid-2">
      <label class="label">
        Nombre del niño o niña
        <input v-model="model.nombre_nino" class="input" />
      </label>
      <label class="label">
        Usuario / correo
        <input v-model="model.username" class="input" required />
      </label>
      <label class="label">
        Correo
        <input v-model="model.email" class="input" type="email" required />
      </label>
      <label class="label">
        Contraseña temporal
        <input v-model="model.plaintext" class="input" autocomplete="new-password" />
      </label>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { FamilyAccount } from '~/types/daycare'

const props = defineProps<{
  account: Partial<FamilyAccount>
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [payload: Partial<FamilyAccount>]
  cancel: []
}>()

const model = reactive<Partial<FamilyAccount>>({ ...props.account })

watch(() => props.account, (account) => Object.assign(model, account), { deep: true })

function submit() {
  emit('save', { ...model })
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

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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
