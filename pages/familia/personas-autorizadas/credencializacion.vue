<template>
  <FamilyPersonasAutorizadasShell title="Credencialización">
    <section class="card photo-hero" data-product-panel="credential-photo-flow">
      <div>
        <p class="eyebrow">Foto del alumno</p>
        <h1>Credencialización</h1>
        <p>Este flujo actualiza la foto del alumno. No es una credencial de padre o tutor. Las imágenes nuevas se procesan con Vision API antes de guardarse.</p>
      </div>
      <img :src="mascot" alt="" />
    </section>

    <p v-if="loadError" class="alert" data-state="error">No fue posible cargar los datos de credencialización.</p>
    <div v-else-if="pending" class="card loading-row" data-product-loading>Cargando foto...</div>

    <section v-else-if="profile" class="card photo-flow" data-product-panel="student-photo-update">
      <div class="photo-preview">
        <img v-if="currentPhoto" :src="currentPhoto" alt="Foto actual del alumno" />
        <span v-else>Sin foto</span>
      </div>

      <div class="photo-copy">
        <p class="eyebrow">{{ profile.readonly.matricula || 'Matrícula vinculada' }}</p>
        <h2>{{ studentName || 'Alumno' }}</h2>
        <p>{{ academicLine || 'Los datos académicos se muestran solo como contexto.' }}</p>

        <div class="input-stack">
          <label class="label">
            Subir foto
            <input class="input" type="file" accept="image/png,image/jpeg,image/webp" data-diagnostic-action="subir-foto-alumno" @change="onFileChange" />
          </label>
          <label class="label">
            O usar URL pública existente
            <input v-model="sourceUrl" class="input" inputmode="url" placeholder="https://..." />
          </label>
        </div>

        <div class="actions">
          <button class="btn btn-primary pa-primary" type="button" :disabled="processing || !canProcess" data-diagnostic-action="procesar-foto-alumno-vision" @click="processStudentPhoto">
            {{ processing ? 'Procesando con Vision API...' : 'Procesar y guardar foto del alumno' }}
          </button>
          <a v-if="currentPhoto" class="btn btn-secondary" :href="currentPhoto" target="_blank" rel="noopener noreferrer">Abrir foto actual</a>
        </div>

        <ol class="flow-steps">
          <li :class="{ done: Boolean(sourceUrl || fileDataUrl) }">Fuente de imagen seleccionada</li>
          <li :class="{ done: visionAnalyzed }">Vision API analiza rostro y geometría</li>
          <li :class="{ done: processedUrl }">PNG recortado y enmascarado guardado</li>
          <li :class="{ done: saved }">Foto persistida en matrícula</li>
        </ol>
      </div>
    </section>

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
import { processFaceImage } from '~/utils/visionFace'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

const { data: session } = useFetch<PublicSession>('/api/auth/me', { key: 'pa-photo-session' })
const { data: people } = useFetch<AuthorizedPerson[]>('/api/personas-autorizadas/family', { key: 'pa-photo-family-people', timeout: 15000 })
const { data: profile, refresh, pending, error: loadError } = useFetch<PersonasStudentProfile>('/api/personas-autorizadas/student', { key: 'pa-photo-student-profile', timeout: 15000 })

const sourceUrl = ref('')
const fileDataUrl = ref('')
const processing = ref(false)
const error = ref('')
const notice = ref('')
const processedUrl = ref('')
const visionAnalyzed = ref(false)
const saved = ref(false)

const children = computed<AuthorizedChild[]>(() => people.value?.find((person) => person.children?.length)?.children || [])
const primaryChild = computed(() => children.value[0] || null)
const theme = computed(() => resolvePersonasTheme({
  plantel: primaryChild.value?.plantel || session.value?.user?.plantel?.[0] || profile.value?.readonly.plantel,
  nivelEdu: primaryChild.value?.nivelEdu || profile.value?.readonly.nivel,
  campus: primaryChild.value?.campus || session.value?.user?.campus
}))
const mascot = computed(() => personasMascot(theme.value, 'preview'))
const currentPhoto = computed(() => normalizeVirtualAssetUrl(profile.value?.readonly.foto || ''))
const studentName = computed(() => [profile.value?.editable.nombres, profile.value?.editable.apellido_paterno, profile.value?.editable.apellido_materno].filter(Boolean).join(' '))
const academicLine = computed(() => [profile.value?.readonly.plantel, profile.value?.readonly.nivel, profile.value?.readonly.grado, profile.value?.readonly.grupo].filter(Boolean).join(' / '))
const canProcess = computed(() => Boolean(sourceUrl.value || fileDataUrl.value))

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('No fue posible leer el archivo.'))
    reader.readAsDataURL(file)
  })
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  error.value = ''
  notice.value = ''
  fileDataUrl.value = ''
  sourceUrl.value = ''
  processedUrl.value = ''
  visionAnalyzed.value = false
  saved.value = false
  if (!file) return
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
    error.value = 'Usa una imagen PNG, JPG o WEBP.'
    input.value = ''
    return
  }
  if (file.size > 1024 * 1024 * 5) {
    error.value = 'La imagen excede 5 MB.'
    input.value = ''
    return
  }
  fileDataUrl.value = await readFileAsDataUrl(file)
}

async function resolveVisionSource() {
  if (sourceUrl.value) return sourceUrl.value
  if (!fileDataUrl.value) throw new Error('Selecciona una foto o URL pública.')
  const uploaded = await $fetch<{ absoluteUrl: string }>('/api/personas-autorizadas/photo-source', {
    method: 'POST',
    body: { src: fileDataUrl.value }
  })
  return uploaded.absoluteUrl
}

async function processStudentPhoto() {
  processing.value = true
  error.value = ''
  notice.value = ''
  processedUrl.value = ''
  visionAnalyzed.value = false
  saved.value = false
  try {
    const visionSource = await resolveVisionSource()
    const processed = await processFaceImage(normalizeVirtualAssetUrl(visionSource))
    visionAnalyzed.value = true
    const stored = await $fetch<{ url: string }>('/api/personas-autorizadas/faces', {
      method: 'POST',
      body: { src: processed.src, personaId: null }
    })
    processedUrl.value = stored.url
    await $fetch('/api/personas-autorizadas/student-photo', {
      method: 'POST',
      body: { foto: stored.url }
    })
    await refresh()
    saved.value = true
    notice.value = 'Foto del alumno procesada y actualizada.'
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible procesar y guardar la foto.'
  } finally {
    processing.value = false
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
  place-items: center;
}

.photo-preview img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.photo-copy,
.input-stack {
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

.flow-steps {
  display: grid;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.flow-steps li {
  background: #f7f7f5;
  border: 1px solid #e9e9e3;
  border-radius: 999px;
  color: var(--pa-muted);
  font-weight: 850;
  padding: 8px 12px;
}

.flow-steps li.done {
  background: var(--pa-soft);
  border-color: var(--pa-border);
  color: var(--pa-primary);
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
