<template>
  <FamilyPersonasAutorizadasShell title="Foto del alumno">
    <FamilyPersonasPageHeader
      eyebrow="Alumno"
      title="Foto del alumno"
      description="Mantén una fotografía clara y actual para generar los Husky Pass."
      :meta="currentPhoto ? 'Foto lista' : 'Foto pendiente'"
      :theme="theme"
      ambassador-variant="preview"
    />

    <div v-if="loadError" class="alert retry-alert" data-state="error">
      <span>No fue posible cargar los datos del alumno.</span>
      <button class="btn btn-secondary" type="button" data-diagnostic-action="reintentar-foto-alumno" @click="retryLoad">Reintentar</button>
    </div>
    <div v-else-if="pending" class="card loading-row" data-product-loading>Cargando…</div>

    <section v-else-if="profile" class="card photo-flow" data-product-panel="student-photo-update">
      <button class="photo-preview" type="button" :disabled="!currentPhoto" data-diagnostic-action="ver-foto-alumno" @click="currentPhotoModalOpen = Boolean(currentPhoto)">
        <FamilyPersonasProcessedPhoto v-if="currentPhoto" :src="currentPhoto" alt="Foto actual del alumno" namespace="pa-student-photo" />
        <span v-else>Sin foto</span>
      </button>

      <div class="photo-copy">
        <p class="eyebrow">{{ academicLine || 'Alumno' }}</p>
        <h2>{{ studentName || 'Alumno' }}</h2>

        <div class="actions">
          <button class="btn btn-primary pa-primary" type="button" data-diagnostic-action="abrir-modal-foto-alumno" @click="openPhotoModal">
            {{ currentPhoto ? 'Actualizar foto' : 'Subir foto' }}
          </button>
          <button v-if="currentPhoto" class="btn btn-secondary" type="button" @click="currentPhotoModalOpen = true">Ver actual</button>
        </div>

        <div class="status-card" :data-state="processing || saving ? 'loading' : saved ? 'saved' : currentPhoto ? 'ready' : 'idle'">
          <FamilyPersonasIcon name="camera" />
          <span>{{ statusText }}</span>
        </div>
      </div>
    </section>

    <FamilyPersonasModal
      v-if="photoModalOpen"
      title="Foto del alumno"
      eyebrow="Alumno"
      :description="pendingPhotoUrl ? 'Confirma para guardar.' : ''"
      :theme="theme"
      @close="closePhotoModal"
    >
      <FamilyPersonasImageUpload
        :initial-src="currentPhoto"
        eyebrow="Foto"
        title="Subir foto"
        description="Foto frontal, clara."
        confirm-label="Confirmar foto"
        @processed="setPendingPhoto"
        @processing="processing = $event"
        @error="setUploadError"
      />

      <div class="modal-actions">
        <button class="btn btn-primary pa-primary" type="button" :disabled="saving || processing || !pendingPhotoUrl" data-diagnostic-action="guardar-foto-alumno" @click="savePendingPhoto">
          {{ saving ? 'Guardando…' : 'Guardar foto' }}
        </button>
        <button class="btn btn-secondary" type="button" :disabled="saving || processing" @click="closePhotoModal">Cancelar</button>
      </div>
    </FamilyPersonasModal>

    <FamilyPersonasModal
      v-if="currentPhotoModalOpen && currentPhoto"
      title="Foto actual"
      eyebrow="Alumno"
      :theme="theme"
      @close="currentPhotoModalOpen = false"
    >
      <FamilyPersonasProcessedPhoto class="current-photo-large" :src="currentPhoto" alt="Foto actual del alumno" namespace="pa-student-photo" />
    </FamilyPersonasModal>

    <p v-if="error" class="alert">{{ error }}</p>
    <p v-if="notice" class="notice">{{ notice }}</p>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFetch } from 'nuxt/app'
import type { PersonasStudentProfile } from '~/types/daycare'
import { normalizeVirtualAssetUrl } from '~/utils/daycare'
import { resolvePersonasTheme } from '~/utils/personasTheme'
import { displayMatricula } from '~/utils/matricula'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

const { data: profile, refresh, pending, error: loadError } = useFetch<PersonasStudentProfile>('/api/personas-autorizadas/student', { key: 'pa-student-profile', timeout: 15000, dedupe: 'defer' })

const photoModalOpen = ref(false)
const currentPhotoModalOpen = ref(false)
const processing = ref(false)
const saving = ref(false)
const error = ref('')
const notice = ref('')
const saved = ref(false)
const pendingPhotoUrl = ref('')

function retryLoad() {
  return refresh()
}

const theme = computed(() => resolvePersonasTheme({
  matricula: profile.value?.readonly.matricula,
  plantel: profile.value?.readonly.plantel,
  nivelEdu: profile.value?.readonly.nivel
}))
const currentPhoto = computed(() => normalizeVirtualAssetUrl(profile.value?.readonly.foto || ''))
const studentName = computed(() => [profile.value?.editable.nombres, profile.value?.editable.apellido_paterno, profile.value?.editable.apellido_materno].filter(Boolean).join(' '))
const academicLine = computed(() => [displayMatricula(profile.value?.readonly.matricula), profile.value?.readonly.nivel, profile.value?.readonly.grado, profile.value?.readonly.grupo].filter(Boolean).join(' / '))
const statusText = computed(() => {
  if (processing.value) return 'Preparando…'
  if (saving.value) return 'Guardando…'
  if (saved.value) return 'Guardada.'
  return currentPhoto.value ? 'Lista.' : 'Pendiente.'
})

function openPhotoModal() {
  pendingPhotoUrl.value = ''
  error.value = ''
  notice.value = ''
  photoModalOpen.value = true
}

function closePhotoModal() {
  if (processing.value || saving.value) return
  photoModalOpen.value = false
  pendingPhotoUrl.value = ''
}

function setUploadError(message: string) {
  error.value = message
  notice.value = ''
}

function setPendingPhoto(payload: { url: string }) {
  pendingPhotoUrl.value = payload.url
  error.value = ''
  notice.value = ''
}

async function savePendingPhoto() {
  if (!pendingPhotoUrl.value) return
  saving.value = true
  error.value = ''
  notice.value = ''
  saved.value = false
  try {
    await $fetch('/api/personas-autorizadas/student-photo', {
      method: 'POST',
      body: { foto: pendingPhotoUrl.value }
    })
    await refresh()
    saved.value = true
    photoModalOpen.value = false
    pendingPhotoUrl.value = ''
    notice.value = 'Foto guardada.'
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible guardar la foto.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.photo-flow { align-items: center; display: grid; gap: 12px; }
.photo-flow { grid-template-columns: 150px minmax(0, 1fr); }
.photo-preview { aspect-ratio: 1; background: #f2f2ef; border: 1px solid var(--pa-border); border-radius: 14px; color: var(--pa-muted); display: grid; font-weight: 600; overflow: hidden; padding: 0; place-items: center; width: 150px; }
.photo-preview:not(:disabled) { cursor: pointer; }
.photo-preview img { height: 100%; object-fit: cover; width: 100%; }
.photo-copy { display: grid; gap: 10px; }
.photo-copy h2 { margin-bottom: 0; }
.actions, .modal-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.modal-actions { background: var(--pa-soft); border: 1px solid var(--pa-border); border-radius: 14px; justify-content: flex-end; margin-top: 10px; padding: 10px; }
.pa-primary { background: var(--pa-primary); color: var(--pa-contrast); }
.loading-row, .notice { border: 1px solid var(--pa-border); color: var(--pa-gray); font-weight: 600; }
.notice { background: var(--pa-soft); border-radius: 12px; margin: 0; padding: 10px 12px; }
.status-card { align-items: center; background: #f7f7f5; border: 1px solid #e9e9e3; border-radius: 12px; color: var(--pa-muted); display: flex; gap: 8px; font-weight: 600; padding: 10px; }
.status-card[data-state='loading'], .status-card[data-state='saved'], .status-card[data-state='ready'] { background: var(--pa-soft); border-color: var(--pa-border); color: var(--pa-primary); }
.current-photo-large { border-radius: 14px; display: block; height: min(64vh, 420px); margin: 0 auto; width: min(100%, 420px); }
.current-photo-large :deep(img) { object-fit: contain; }
@media (max-width: 860px) { .photo-flow { grid-template-columns: 1fr; } .photo-preview { width: min(100%, 180px); } }
</style>
