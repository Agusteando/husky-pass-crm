<template>
  <FamilyPersonasAutorizadasShell title="Credencialización">
    <section class="card photo-hero" data-product-panel="credential-photo-flow">
      <div>
        <p class="eyebrow">Foto del alumno</p>
        <h1>Credencialización</h1>
        <p>{{ currentPhoto ? 'Foto actual disponible.' : 'Foto pendiente.' }}</p>
      </div>
      <img :src="mascot" alt="" />
    </section>

    <p v-if="loadError" class="alert" data-state="error">No fue posible cargar los datos de credencialización.</p>
    <div v-else-if="pending" class="card loading-row" data-product-loading>Cargando…</div>

    <section v-else-if="profile" class="card photo-flow" data-product-panel="student-photo-update">
      <button class="photo-preview" type="button" :disabled="!currentPhoto" data-diagnostic-action="ver-foto-alumno" @click="currentPhotoModalOpen = Boolean(currentPhoto)">
        <img v-if="currentPhoto" :src="currentPhoto" alt="Foto actual del alumno" />
        <span v-else>Sin foto</span>
      </button>

      <div class="photo-copy">
        <p class="eyebrow">{{ profile.readonly.matricula || 'Matrícula vinculada' }}</p>
        <h2>{{ studentName || 'Alumno' }}</h2>
        <p>{{ academicLine || 'Datos escolares' }}</p>

        <div class="actions">
          <button class="btn btn-primary pa-primary" type="button" data-diagnostic-action="abrir-modal-foto-alumno" @click="photoModalOpen = true">
            {{ currentPhoto ? 'Actualizar foto' : 'Subir foto' }}
          </button>
          <button v-if="currentPhoto" class="btn btn-secondary" type="button" @click="currentPhotoModalOpen = true">Ver actual</button>
        </div>

        <div class="status-card" :data-state="processing || saving ? 'loading' : saved ? 'saved' : 'idle'">
          <FamilyPersonasIcon name="camera" />
          <span>{{ statusText }}</span>
        </div>
      </div>
    </section>

    <FamilyPersonasModal
      v-if="photoModalOpen"
      title="Foto del alumno"
      eyebrow="Credencialización"
      @close="closePhotoModal"
    >
      <FamilyPersonasImageUpload
        :initial-src="currentPhoto"
        eyebrow="Foto"
        title="Subir foto"
        description="Foto frontal, clara."
        @processed="saveProcessedPhoto"
        @processing="processing = $event"
        @error="setUploadError"
      />
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
const academicLine = computed(() => [profile.value?.readonly.plantel, profile.value?.readonly.nivel, profile.value?.readonly.grado, profile.value?.readonly.grupo].filter(Boolean).join(' / '))
const statusText = computed(() => {
  if (processing.value) return 'Preparando…'
  if (saving.value) return 'Guardando…'
  if (saved.value) return 'Foto actualizada.'
  return currentPhoto.value ? 'Lista.' : 'Pendiente.'
})

function closePhotoModal() {
  if (processing.value || saving.value) return
  photoModalOpen.value = false
}

function setUploadError(message: string) {
  error.value = message
  notice.value = ''
}

async function saveProcessedPhoto(payload: { url: string }) {
  saving.value = true
  error.value = ''
  notice.value = ''
  saved.value = false
  try {
    await $fetch('/api/personas-autorizadas/student-photo', {
      method: 'POST',
      body: { foto: payload.url }
    })
    await refresh()
    saved.value = true
    photoModalOpen.value = false
    notice.value = 'Foto actualizada.'
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible guardar la foto.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.photo-hero,
.photo-flow {
  align-items: center;
  display: grid;
  gap: 18px;
}

.photo-hero {
  background: linear-gradient(135deg, rgba(var(--pa-primary-rgb), 0.1), #fff);
  grid-template-columns: minmax(0, 1fr) 140px;
}

.photo-hero img {
  max-height: 140px;
  object-fit: contain;
}

.photo-flow {
  grid-template-columns: minmax(220px, 320px) minmax(0, 1fr);
}

.photo-preview {
  aspect-ratio: 4 / 5;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 24px;
  color: var(--pa-primary);
  display: grid;
  font-size: 1.25rem;
  font-weight: 950;
  overflow: hidden;
  padding: 0;
  place-items: center;
}

.photo-preview:not(:disabled) {
  cursor: pointer;
}

.photo-preview img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.photo-copy {
  display: grid;
  gap: 12px;
}

.photo-copy h2 {
  margin-bottom: 0;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pa-primary { background: var(--pa-primary); color: var(--pa-contrast); }

.loading-row,
.notice {
  border: 1px solid var(--pa-border);
  color: var(--pa-gray);
  font-weight: 850;
}

.notice {
  background: var(--pa-soft);
  border-radius: 14px;
  margin: 0;
  padding: 10px 12px;
}

.status-card {
  align-items: center;
  background: #f7f7f5;
  border: 1px solid #e9e9e3;
  border-radius: 16px;
  color: var(--pa-muted);
  display: flex;
  gap: 10px;
  font-weight: 850;
  padding: 12px;
}

.status-card[data-state='loading'],
.status-card[data-state='saved'] {
  background: var(--pa-soft);
  border-color: var(--pa-border);
  color: var(--pa-primary);
}

.current-photo-large {
  border-radius: 22px;
  display: block;
  margin: 0 auto;
  max-height: 70vh;
  object-fit: contain;
}

@media (max-width: 860px) {
  .photo-hero,
  .photo-flow {
    grid-template-columns: 1fr;
  }

  .photo-hero img {
    justify-self: start;
  }
}
</style>
