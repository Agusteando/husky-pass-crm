<template>
  <form class="family-editor" @submit.prevent="submit">
    <section class="editor-grid">
      <label class="label">
        Nombre del niño o niña
        <input v-model="model.nombre_nino" class="input" placeholder="Nombre visible de la familia" />
      </label>
      <label class="label">
        Usuario
        <input v-model="model.username" class="input" required placeholder="usuario o matrícula" @blur="normalizeUsername" />
      </label>
      <label class="label wide">
        Correo familiar
        <input v-model="model.email" class="input" type="email" required placeholder="familia@correo.com" />
      </label>
    </section>

    <section class="password-card">
      <div>
        <p class="eyebrow">Contraseña visible</p>
        <h3>Acceso familiar</h3>
      </div>
      <div class="password-row">
        <input v-model="model.plaintext" class="input mono" autocomplete="new-password" placeholder="Contraseña asignada por guardería" />
        <button class="btn btn-secondary" type="button" @click="generatePassword">Generar</button>
      </div>
      <label class="toggle-line">
        <input v-model="model.passwordCanChange" type="checkbox" />
        <span>La familia puede cambiar esta contraseña</span>
      </label>
    </section>

    <footer class="modal-actions">
      <button class="btn btn-secondary" type="button" @click="$emit('cancel')">Cancelar</button>
      <button class="btn btn-primary" type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar familia' }}</button>
    </footer>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { displayMatriculaCandidate } from '~/utils/matricula'
import type { FamilyAccount } from '~/types/daycare'

const props = defineProps<{
  account: Partial<FamilyAccount>
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [payload: Partial<FamilyAccount>]
  cancel: []
}>()

const model = reactive<Partial<FamilyAccount>>(normalizeAccount(props.account))

watch(() => props.account, (account) => Object.assign(model, normalizeAccount(account)), { deep: true })

function normalizeUsername() {
  model.username = displayMatriculaCandidate(model.username)
}

function generatePassword() {
  const words = ['Husky', 'Familia', 'Sala', 'IEDIS', 'Casa']
  const word = words[Math.floor(Math.random() * words.length)]
  const code = Math.floor(1000 + Math.random() * 9000)
  model.plaintext = `${word}${code}`
}

function submit() {
  normalizeUsername()
  emit('save', { ...model })
}

function normalizeAccount(account: Partial<FamilyAccount>) {
  return {
    ...account,
    nombre_nino: account.nombre_nino || '',
    username: account.username || '',
    email: account.email || '',
    plaintext: account.plaintext || '',
    passwordCanChange: account.passwordCanChange !== false
  }
}
</script>

<style scoped>
.family-editor,
.editor-grid,
.password-card {
  display: grid;
  gap: 14px;
}

.editor-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.wide {
  grid-column: 1 / -1;
}

.password-card {
  background: linear-gradient(135deg, #f0fbf7, #fffaf0);
  border: 1px solid rgba(8, 135, 125, 0.16);
  border-radius: 20px;
  padding: 14px;
}

.password-card h3,
.password-card p {
  margin: 0;
}

.password-card h3 {
  color: #102235;
  font-size: 1.15rem;
}

.password-row {
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) auto;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.toggle-line {
  align-items: center;
  color: #385069;
  display: flex;
  font-weight: 800;
  gap: 10px;
}

.toggle-line input {
  accent-color: #07877d;
  height: 18px;
  width: 18px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

@media (max-width: 720px) {
  .editor-grid,
  .password-row {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    display: grid;
  }
}
</style>
