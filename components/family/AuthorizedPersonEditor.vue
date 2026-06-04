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
        <input v-model="model.foto" class="input" inputmode="url" placeholder="https://..." />
      </label>
    </div>

    <section class="photo-pipeline">
      <div class="photo-preview">
        <img v-if="photoPreview" :src="photoPreview" alt="Vista previa de foto procesada" />
        <span v-else>Foto</span>
      </div>
      <div class="photo-copy">
        <p class="eyebrow">Procesamiento de foto</p>
        <h3>Recorte institucional</h3>
        <p>La foto se procesa con Vision API para centrar rostro, recortar y aplicar mascara cuando esta disponible.</p>
        <div class="actions">
          <button class="btn btn-secondary" type="button" :disabled="!model.foto || visionLoading" data-diagnostic-action="procesar-foto-vision" @click="processPhoto">
            {{ visionLoading ? 'Procesando...' : 'Procesar foto' }}
          </button>
          <a v-if="model.compressed_foto" class="btn btn-secondary" :href="normalizeVirtualAssetUrl(model.compressed_foto)" target="_blank" rel="noopener noreferrer">Ver PNG</a>
        </div>
        <p v-if="visionError" class="alert compact-alert">{{ visionError }}</p>
        <p v-if="visionNotice" class="notice">{{ visionNotice }}</p>
      </div>
    </section>

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
import { computed, ref, reactive, watch } from 'vue'
import type { AuthorizedChild, AuthorizedPerson } from '~/types/daycare'
import { normalizeVirtualAssetUrl } from '~/utils/daycare'
import { processFaceImage } from '~/utils/visionFace'

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
const visionLoading = ref(false)
const visionError = ref('')
const visionNotice = ref('')
const photoPreview = computed(() => normalizeVirtualAssetUrl(model.compressed_foto || model.foto || ''))

watch(() => props.person, (person) => {
  Object.assign(model, person)
  children.value = [...(person.children || [])]
}, { deep: true })

function addChild() {
  children.value.push({})
}

async function processPhoto() {
  visionError.value = ''
  visionNotice.value = ''
  if (!model.foto) {
    visionError.value = 'Agrega una URL publica antes de procesar la foto.'
    return
  }
  visionLoading.value = true
  try {
    const processed = await processFaceImage(normalizeVirtualAssetUrl(model.foto))
    const saved = await $fetch<{ url: string }>('/api/personas-autorizadas/faces', {
      method: 'POST',
      body: { src: processed.src, personaId: model.id || null }
    })
    model.compressed_foto = saved.url
    visionNotice.value = 'Foto procesada y lista para marbete.'
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    visionError.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible procesar la foto.'
  } finally {
    visionLoading.value = false
  }
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

.photo-pipeline {
  background: rgba(var(--pa-primary-rgb, 97, 139, 47), 0.07);
  border: 1px solid var(--pa-border, var(--color-border));
  border-radius: 18px;
  display: grid;
  gap: 14px;
  grid-template-columns: 104px minmax(0, 1fr);
  padding: 14px;
}

.photo-preview {
  aspect-ratio: 1;
  background: #fff;
  border: 1px solid var(--pa-border, var(--color-border));
  border-radius: 18px;
  color: var(--pa-primary, var(--color-brand-700));
  display: grid;
  font-weight: 900;
  overflow: hidden;
  place-items: center;
}

.photo-preview img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.photo-copy {
  display: grid;
  gap: 8px;
}

.photo-copy h3,
.photo-copy p {
  margin-bottom: 0;
}

.compact-alert {
  margin: 0;
}

.notice {
  background: #fff;
  border: 1px solid var(--pa-border, var(--color-brand-200));
  border-radius: 14px;
  color: var(--pa-gray, var(--color-brand-900));
  font-weight: 850;
  margin: 0;
  padding: 10px 12px;
}

.child-section {
  border-top: 1px solid var(--color-border);
  display: grid;
  gap: 14px;
  padding-top: 16px;
}

.child-card {
  background: var(--pa-soft, var(--color-brand-100));
  border: 1px solid var(--pa-border, var(--color-brand-200));
  border-radius: 18px;
  padding: 14px;
}

.editor-form {
  border-color: var(--pa-border, var(--color-border));
}

.editor-form .eyebrow {
  color: var(--pa-primary, var(--color-brand-700));
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

  .photo-pipeline {
    grid-template-columns: 1fr;
  }

  .photo-preview {
    max-width: 148px;
  }
}
</style>
