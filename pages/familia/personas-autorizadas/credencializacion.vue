<template>
  <FamilyPersonasAutorizadasShell title="Foto del alumno">
    <section class="card photo-hero" data-product-panel="credential-photo-flow">
      <div>
        <p class="eyebrow">Alumno</p>
        <h1>Foto del alumno</h1>
        <p>{{ currentPhoto ? 'Lista.' : 'Pendiente.' }}</p>
      </div>
      <img :src="mascot" alt="" />
    </section>

    <p v-if="loadError" class="alert" data-state="error">No fue posible cargar los datos del alumno.</p>
    <div v-else-if="pending" class="card loading-row" data-product-loading>Cargando…</div>

    <section v-else-if="profile" class="card photo-flow" data-product-panel="student-photo-update">
      <button class="photo-preview" type="button" :disabled="!currentPhoto" data-diagnostic-action="ver-foto-alumno" @click="currentPhotoModalOpen = Boolean(currentPhoto)">
        <img v-if="currentPhoto" :src="currentPhoto" alt="Foto actual del alumno" />
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
      @close="currentPhotoModalOpen = false"
    >
      <img class="current-photo-large" :src="currentPhoto" alt="Foto actual del alumno" />
    </FamilyPersonasModal>

    <p v-if="error" class="alert">{{ error }}</p>
    <p v-if="notice" class="notice">{{ notice }}</p>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFetch } from 'nuxt/app'
import type { AuthorizedChild, AuthorizedPerson, PersonasStudentProfile } from '~/types/daycare'
import type { PublicSession } from '~/types/session'
import { normalizeVirtualAssetUrl } from '~/utils/daycare'
import { personasMascot, resolvePersonasTheme } from '~/utils/personasTheme'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

const { data: session } = useFetch<PublicSession>('/api/auth/me', { key: 'pa-photo-session' })
const { data: people } = useFetch<AuthorizedPerson[]>('/api/personas-autorizadas/family', { key: 'pa-photo-family-people', timeout: 15000 })
const { data: profile, refresh, pending, error: loadError } = useFetch<PersonasStudentProfile>('/api/personas-autorizadas/student', { key: 'pa-photo-student-profile', timeout: 15000 })

const photoModalOpen = ref(false)
const currentPhotoModalOpen = ref(false)
const processing = ref(false)
const saving = ref(false)
const error = ref('')
const notice = ref('')
const saved = ref(false)
const pendingPhotoUrl = ref('')

const children = computed<AuthorizedChild[]>(() => people.value?.find((person) => person.children?.length)?.children || [])
const primaryChild = computed(() => children.value.find((child) => child.isCurrent) || children.value[0] || null)
const theme = computed(() => resolvePersonasTheme({
  plantel: primaryChild.value?.plantel || session.value?.user?.plantel?.[0] || profile.value?.readonly.plantel,
  nivelEdu: primaryChild.value?.nivelEdu || profile.value?.readonly.nivel,
  campus: primaryChild.value?.campus || session.value?.user?.campus
}))
const mascot = computed(() => personasMascot(theme.value, 'preview'))
const currentPhoto = computed(() => normalizeVirtualAssetUrl(profile.value?.readonly.foto || ''))
const studentName = computed(() => [profile.value?.editable.nombres, profile.value?.editable.apellido_paterno, profile.value?.editable.apellido_materno].filter(Boolean).join(' '))
const academicLine = computed(() => [profile.value?.readonly.nivel, profile.value?.readonly.grado, profile.value?.readonly.grupo].filter(Boolean).join(' / '))
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
.photo-hero, .photo-flow { align-items: center; display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr) 150px; }
.photo-hero { background: linear-gradient(135deg, rgba(var(--pa-primary-rgb), .1), #fff); }
.photo-hero img { align-self: end; max-height: 140px; object-fit: contain; }
.photo-flow { grid-template-columns: 220px minmax(0, 1fr); }
.photo-preview { aspect-ratio: 1; background: #f2f2ef; border: 1px solid var(--pa-border); border-radius: 26px; color: var(--pa-muted); display: grid; font-weight: 900; overflow: hidden; padding: 0; place-items: center; }
.photo-preview:not(:disabled) { cursor: pointer; }
.photo-preview img { height: 100%; object-fit: cover; width: 100%; }
.photo-copy { display: grid; gap: 12px; }
.photo-copy h2 { margin-bottom: 0; }
.actions, .modal-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.modal-actions { background: var(--pa-soft); border: 1px solid var(--pa-border); border-radius: 18px; justify-content: flex-end; margin-top: 14px; padding: 12px; }
.pa-primary { background: var(--pa-primary); color: var(--pa-contrast); }
.loading-row, .notice { border: 1px solid var(--pa-border); color: var(--pa-gray); font-weight: 850; }
.notice { background: var(--pa-soft); border-radius: 14px; margin: 0; padding: 10px 12px; }
.status-card { align-items: center; background: #f7f7f5; border: 1px solid #e9e9e3; border-radius: 16px; color: var(--pa-muted); display: flex; gap: 10px; font-weight: 850; padding: 12px; }
.status-card[data-state='loading'], .status-card[data-state='saved'], .status-card[data-state='ready'] { background: var(--pa-soft); border-color: var(--pa-border); color: var(--pa-primary); }
.current-photo-large { border-radius: 22px; display: block; margin: 0 auto; max-height: 70vh; object-fit: contain; }
@media (max-width: 860px) { .photo-hero, .photo-flow { grid-template-columns: 1fr; } .photo-hero img { justify-self: start; } .photo-preview { width: min(100%, 220px); } }
</style>
