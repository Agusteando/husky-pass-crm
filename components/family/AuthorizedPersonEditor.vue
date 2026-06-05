<template>
  <form class="editor-form" novalidate @submit.prevent="submit">
    <div v-if="serverError" class="alert compact-alert" role="alert">{{ serverError }}</div>
    <div v-if="formNotice" class="notice compact-notice" role="status">{{ formNotice }}</div>

    <div class="grid grid-2 editor-fields">
      <label class="label">
        Nombre(s)
        <input
          ref="firstInputRef"
          v-model.trim="form.nombreP"
          class="input"
          required
          autocomplete="given-name"
          :aria-invalid="Boolean(errors.nombreP)"
          :aria-describedby="errors.nombreP ? 'pa-edit-nombre-error' : undefined"
          @input="clearFieldError('nombreP')"
        />
        <small v-if="errors.nombreP" id="pa-edit-nombre-error" class="field-error">{{ errors.nombreP }}</small>
      </label>
      <label class="label">
        Apellido paterno
        <input v-model.trim="form.paternoP" class="input" autocomplete="family-name" />
      </label>
      <label class="label">
        Apellido materno
        <input v-model.trim="form.maternoP" class="input" autocomplete="additional-name" />
      </label>
      <label class="label">
        Parentesco
        <input
          v-model.trim="form.parenP"
          class="input"
          required
          placeholder="Abuela, tío, nana..."
          :aria-invalid="Boolean(errors.parenP)"
          :aria-describedby="errors.parenP ? 'pa-edit-parentesco-error' : undefined"
          @input="clearFieldError('parenP')"
        />
        <small v-if="errors.parenP" id="pa-edit-parentesco-error" class="field-error">{{ errors.parenP }}</small>
      </label>
      <label class="label">
        Fecha de alta
        <input v-model="form.fechaP" class="input" type="date" />
      </label>
    </div>

    <FamilyPersonasImageUpload
      :key="photoInputKey"
      :initial-src="form.compressed_foto || form.foto"
      :persona-id="form.id"
      eyebrow="Foto de identificación"
      title="Foto"
      description="Foto frontal, clara."
      confirm-label="Confirmar foto"
      @processed="setProcessedPhoto"
      @processing="setPhotoBusy"
      @error="setVisionError"
    />

    <p v-if="visionError" class="alert compact-alert" role="alert">{{ visionError }}</p>

    <div class="actions form-actions">
      <button class="btn btn-primary" type="submit" :disabled="submitDisabled" data-diagnostic-action="guardar-persona-autorizada">
        {{ saving ? 'Guardando…' : photoBusy ? 'Preparando foto…' : 'Guardar' }}
      </button>
      <button class="btn btn-secondary" type="button" :disabled="saving || photoBusy" @click="cancel">Cancelar</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { AuthorizedPerson } from '~/types/daycare'
import type { AuthorizedPersonValidationState } from '~/utils/authorizedPersonForm'
import { authorizedPersonFormIsValid, createAuthorizedPersonForm, toAuthorizedPersonSavePayload, validateAuthorizedPersonForm } from '~/utils/authorizedPersonForm'

const props = defineProps<{
  person: Partial<AuthorizedPerson>
  label: string
  saving?: boolean
  serverError?: string
}>()

const emit = defineEmits<{
  save: [payload: Partial<AuthorizedPerson>]
  cancel: []
  busy: [value: boolean]
}>()

const form = ref(createAuthorizedPersonForm(props.person))
const errors = ref<AuthorizedPersonValidationState>({})
const photoBusy = ref(false)
const visionError = ref('')
const formNotice = ref('')
const firstInputRef = ref<HTMLInputElement | null>(null)
const photoInputKey = computed(() => `photo-${form.value.id || 'slot'}-${form.value.indice}-${form.value.foto || ''}-${form.value.compressed_foto || ''}`)
const submitDisabled = computed(() => Boolean(props.saving || photoBusy.value))

watch(() => props.person, async (person) => {
  form.value = createAuthorizedPersonForm(person)
  errors.value = {}
  visionError.value = ''
  formNotice.value = ''
  await nextTick()
  firstInputRef.value?.focus()
}, { immediate: true })

function setProcessedPhoto(payload: { url: string }) {
  form.value = {
    ...form.value,
    compressed_foto: payload.url
  }
  visionError.value = ''
  formNotice.value = 'Foto confirmada para este registro.'
}

function setPhotoBusy(value: boolean) {
  photoBusy.value = value
  emit('busy', value)
}

function setVisionError(message: string) {
  visionError.value = message
}

function clearFieldError(field: keyof AuthorizedPersonValidationState) {
  if (!errors.value[field]) return
  errors.value = { ...errors.value, [field]: undefined }
}

function submit() {
  if (submitDisabled.value) return
  const nextErrors = validateAuthorizedPersonForm(form.value)
  errors.value = nextErrors
  if (!authorizedPersonFormIsValid(nextErrors)) return
  formNotice.value = ''
  emit('save', toAuthorizedPersonSavePayload(form.value))
}

function cancel() {
  if (props.saving || photoBusy.value) return
  emit('cancel')
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

.compact-alert,
.compact-notice {
  margin: 0;
}

.compact-notice {
  background: #fff;
  border: 1px solid var(--pa-border, #dce7d0);
  border-radius: 14px;
  color: var(--pa-gray, #50535a);
  font-weight: 600;
  padding: 10px 12px;
}

.field-error {
  color: #b42318;
  font-weight: 600;
  margin-top: 6px;
}

@media (max-width: 760px) {
  .editor-fields {
    grid-template-columns: 1fr;
  }

  .form-actions {
    display: grid;
    grid-template-columns: 1fr;
  }
}
</style>
