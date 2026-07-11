<template>
  <FamilyPersonasAutorizadasShell title="Foto del alumno">
    <FamilyPersonasPageHeader
      eyebrow="Alumno"
      title="Foto del alumno"
      description="Mantén una fotografía clara y actual para generar los Husky Pass."
      :meta="currentPhoto ? 'Foto disponible' : 'Sin foto'"
      :theme="theme"
      ambassador-variant="preview"
      :ambassador-title="currentPhoto ? 'Foto disponible' : 'Te ayudo con la foto'"
      :ambassador-message="currentPhoto ? 'La identificación visual ya puede respaldar los Husky Pass.' : 'Una foto frontal y clara reduce rechazos al generar pases.'"
      :ambassador-tone="currentPhoto ? 'success' : 'notice'"
    />

    <div v-if="loadError" class="alert retry-alert" data-state="error">
      <span>No fue posible cargar los datos del alumno.</span>
      <button class="btn btn-secondary" type="button" data-diagnostic-action="reintentar-foto-alumno" @click="retryLoad">Reintentar</button>
    </div>
    <div v-else-if="pending" class="card loading-row" data-product-loading>Cargando…</div>

    <section v-else-if="profile" class="photo-studio" data-product-panel="student-photo-update">
      <article class="photo-preview-stage">
        <button class="photo-preview" type="button" :disabled="!currentPhoto" data-diagnostic-action="ver-foto-alumno" @click="currentPhotoModalOpen = Boolean(currentPhoto)">
          <FamilyPersonasProcessedPhoto v-if="currentPhoto" :src="currentPhoto" alt="Foto actual del alumno" namespace="pa-student-photo" />
          <span v-else>Sin foto</span>
        </button>

        <div class="status-card" :data-state="processing || saving ? 'loading' : saved ? 'saved' : currentPhoto ? 'ready' : 'idle'">
          <FamilyPersonasIcon name="camera" />
          <span>{{ statusText }}</span>
        </div>
      </article>

      <article class="photo-action-panel">
        <p class="eyebrow">{{ academicLine || 'Alumno' }}</p>
        <h2>{{ studentName || 'Alumno' }}</h2>
        <p class="photo-intro">La foto del alumno habilita la generación de Husky Pass y evita rechazos al imprimir.</p>

        <div class="actions">
          <button class="btn btn-primary pa-primary" type="button" data-diagnostic-action="abrir-modal-foto-alumno" @click="openPhotoModal">
            {{ currentPhoto ? 'Actualizar foto' : 'Subir foto' }}
          </button>
          <button v-if="currentPhoto" class="btn btn-secondary" type="button" @click="currentPhotoModalOpen = true">Ver actual</button>
        </div>

        <div class="photo-checklist" aria-label="Criterios de foto">
          <span>Frontal</span>
          <span>Clara</span>
          <span>Actual</span>
        </div>

        <div class="photo-next-step" :data-state="currentPhoto ? 'ready' : 'pending'">
          <strong>{{ currentPhoto ? 'Foto disponible para Husky Pass' : 'Siguiente paso' }}</strong>
          <span>{{ currentPhoto ? 'Puedes actualizarla cuando cambie o si el colegio solicita una nueva toma.' : 'Sube una foto frontal y clara para habilitar la generación de Husky Pass.' }}</span>
        </div>
      </article>
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
import { usePersonasFamilyPeople } from '~/composables/usePersonasTheme'
import type { PersonasStudentProfile } from '~/types/daycare'
import { normalizeVirtualAssetUrl } from '~/utils/daycare'
import { resolvePersonasTheme } from '~/utils/personasTheme'
import { displayMatricula } from '~/utils/matricula'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

const { data: profile, refresh, pending, error: loadError } = useFetch<PersonasStudentProfile>('/api/personas-autorizadas/student', { key: 'pa-student-profile', timeout: 15000, dedupe: 'defer' })
const familyPeople = usePersonasFamilyPeople({ immediate: false })

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
  if (processing.value) return 'Subiendo…'
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
    await familyPeople.refresh().catch(() => undefined)
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
.photo-studio { align-items: stretch; background: linear-gradient(135deg, rgba(255, 255, 255, .98), rgba(var(--pa-primary-rgb), .05)); border: 1px solid var(--pa-border); border-radius: 24px; box-shadow: 0 22px 54px rgba(var(--pa-primary-rgb), .1); display: grid; gap: 18px; grid-template-columns: minmax(260px, .55fr) minmax(0, 1fr); padding: clamp(18px, 2.6vw, 28px); }
.photo-preview-stage { background: #fff; border: 1px solid var(--pa-border); border-radius: 22px; display: grid; gap: 14px; padding: 14px; }
.photo-preview { aspect-ratio: 4 / 5; background: linear-gradient(135deg, #f7f7f2, #fff); border: 1px solid var(--pa-border); border-radius: 18px; color: var(--pa-muted); display: grid; font-weight: 700; min-height: 300px; overflow: hidden; padding: 0; place-items: center; width: 100%; }
.photo-preview:not(:disabled) { cursor: pointer; }
.photo-preview img { height: 100%; object-fit: cover; width: 100%; }
.photo-action-panel { align-content: center; display: grid; gap: 14px; min-width: 0; padding: clamp(4px, 1vw, 10px); }
.photo-action-panel h2 { font-size: clamp(1.8rem, 3vw, 2.65rem); line-height: 1; margin-bottom: 0; max-width: 760px; }
.photo-intro { font-size: .98rem; max-width: 640px; }
.actions, .modal-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.modal-actions { background: var(--pa-soft); border: 1px solid var(--pa-border); border-radius: 14px; justify-content: flex-end; margin-top: 10px; padding: 10px; }
.pa-primary { background: var(--pa-primary); color: var(--pa-contrast); }
.loading-row, .notice { border: 1px solid var(--pa-border); color: var(--pa-gray); font-weight: 600; }
.notice { background: var(--pa-soft); border-radius: 12px; margin: 0; padding: 10px 12px; }
.status-card { align-items: center; background: #f7f7f5; border: 1px solid #e9e9e3; border-radius: 12px; color: var(--pa-muted); display: flex; gap: 8px; font-weight: 600; padding: 10px; }
.status-card[data-state='loading'], .status-card[data-state='saved'], .status-card[data-state='ready'] { background: var(--pa-soft); border-color: var(--pa-border); color: var(--pa-primary); }
.photo-checklist { display: grid; gap: 8px; grid-template-columns: repeat(3, minmax(0, 1fr)); max-width: 520px; }
.photo-checklist span { background: var(--pa-soft); border: 1px solid var(--pa-border); border-radius: 999px; color: var(--pa-primary); font-size: .82rem; padding: 9px 12px; text-align: center; }
.photo-next-step { background: #fff; border: 1px solid #e4ebef; border-radius: 14px; display: grid; gap: 4px; padding: 12px; }
.photo-next-step strong { color: var(--pa-gray); }
.photo-next-step span { color: var(--pa-muted); font-size: .82rem; line-height: 1.45; }
.photo-next-step[data-state='pending'] { border-color: var(--pa-border); box-shadow: 0 10px 24px rgba(var(--pa-primary-rgb), .08); }
.current-photo-large { border-radius: 14px; display: block; height: min(64vh, 420px); margin: 0 auto; width: min(100%, 420px); }
.current-photo-large :deep(img) { object-fit: contain; }
@media (max-width: 860px) { .photo-studio { grid-template-columns: 1fr; } .photo-action-panel { order: 1; } .photo-preview-stage { justify-items: center; order: 2; } .photo-preview { min-height: 240px; width: min(100%, 240px); } .status-card { width: min(100%, 240px); } }
@media (max-width: 520px) { .photo-checklist { grid-template-columns: 1fr; } }
</style>
