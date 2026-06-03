<template>
  <form class="card stack" @submit.prevent="submit">
    <div>
      <p class="eyebrow">{{ model.id ? 'Editar cuenta familiar' : 'Nueva cuenta familiar' }}</p>
      <h2>Acceso de familia</h2>
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
    <div class="actions">
      <button class="btn btn-primary" type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
      <button class="btn btn-secondary" type="button" @click="$emit('cancel')">Cancelar</button>
    </div>
  </form>
</template>

<script setup lang="ts">
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
.actions {
  display: flex;
  gap: 12px;
}
</style>
