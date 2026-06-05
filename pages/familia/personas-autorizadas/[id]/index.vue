<template>
  <FamilyPersonasAutorizadasShell title="Persona autorizada">
    <section class="pa-detail stack" :style="themeVars" data-product-area="personas-autorizadas" data-product-screen="detail">
    <header class="detail-head">
      <div>
        <p class="eyebrow">Persona autorizada</p>
        <h1>{{ fullName || 'Registro' }}</h1>
        <p>{{ subtitle }}</p>
      </div>
      <NuxtLink class="btn btn-secondary" to="/familia/personas-autorizadas">Volver</NuxtLink>
    </header>

    <p v-if="loadError" class="alert" data-state="error">No fue posible cargar este registro.</p>
    <div v-else-if="pending" class="card loading-card" data-product-loading data-state="loading">Cargando registro...</div>

    <section v-else-if="person" class="detail-grid" data-product-panel="authorized-person-detail" data-state="content">
      <article class="identity-card">
        <div class="photo">
          <FamilyPersonasProcessedPhoto v-if="photoUrl" :src="person.foto" :processed-src="person.compressed_foto" alt="Fotografía" :namespace="`pa-detail-${person.id}`" />
          <span v-else>{{ initials }}</span>
        </div>
        <div>
          <p class="eyebrow">{{ authorizedPersonLabel(person.indice) }}</p>
          <h2>{{ fullName }}</h2>
          <p>{{ person.parenP || 'Parentesco no especificado' }}</p>
        </div>
      </article>

      <article class="actions-card">
        <div class="readiness">
          <span class="ok">Registro guardado</span>
          <span :class="{ ok: Boolean(primaryChild) }">{{ primaryChild ? studentLine : 'Alumno pendiente' }}</span>
          <span :class="{ ok: marbeteReady }">{{ marbeteMessage }}</span>
        </div>

        <div class="action-grid">
          <NuxtLink class="btn btn-primary" :to="`/familia/personas-autorizadas/${person.id}/marbete`" data-diagnostic-link="previsualizar-marbete">Previsualizar marbete</NuxtLink>
          <a v-if="marbeteReady" class="btn btn-secondary" :href="`/api/personas-autorizadas/marbete?id=${person.id}&download=1`" data-diagnostic-link="descargar-marbete">Descargar PDF</a>
          <button v-else class="btn btn-secondary" type="button" disabled>{{ marbeteMessage }}</button>
          <NuxtLink class="btn btn-secondary" :to="`/familia/personas-autorizadas/${person.id}/qr`" data-diagnostic-link="ver-qr">Ver QR</NuxtLink>
          <button class="btn btn-secondary" type="button" data-diagnostic-action="compartir-validacion" @click="shareValidation">Compartir validación</button>
        </div>

        <p v-if="shareMessage" class="notice">{{ shareMessage }}</p>
      </article>
    </section>

    <EmptyState v-else title="Registro no disponible" description="No encontramos esta persona autorizada en tu cuenta." />
  </section>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFetch, useRoute } from 'nuxt/app'
import type { AuthorizedChild, AuthorizedPerson, MarbeteReadinessResponse } from '~/types/daycare'
import { appAbsoluteUrl, authorizedPersonLabel, authorizedPersonValidationPath, normalizeVirtualAssetUrl } from '~/utils/daycare'
import { usePersonasFamilyTheme, useResolvedPersonasTheme } from '~/composables/usePersonasTheme'
import { isValidatedVisionPhotoUrl } from '~/utils/visionFace'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

const route = useRoute()
const familyTheme = usePersonasFamilyTheme({ key: `pa-detail-${route.params.id}` })
const { data, pending, error: loadError } = useFetch<AuthorizedPerson[]>('/api/personas-autorizadas/family', { timeout: 15000 })
const { data: readiness, pending: readinessPending, error: readinessError } = useFetch<MarbeteReadinessResponse>('/api/personas-autorizadas/marbete', {
  key: `pa-detail-marbete-readiness-${route.params.id}`,
  query: { id: route.params.id, format: 'readiness' },
  timeout: 20000
})
const person = computed(() => (data.value || []).find((item) => String(item.id) === String(route.params.id)))
const primaryChild = computed<AuthorizedChild | null>(() => person.value?.children?.[0] || null)
const { themeVars } = useResolvedPersonasTheme(() => ({
  matricula: primaryChild.value?.matricula || familyTheme.primaryChild.value?.matricula || familyTheme.session.value?.user?.username,
  plantel: primaryChild.value?.plantel || familyTheme.primaryChild.value?.plantel || familyTheme.session.value?.user?.plantel?.[0],
  nivelEdu: primaryChild.value?.nivelEdu || familyTheme.primaryChild.value?.nivelEdu,
  campus: primaryChild.value?.campus || familyTheme.primaryChild.value?.campus || familyTheme.session.value?.user?.campus
}))
const fullName = computed(() => [person.value?.nombreP, person.value?.paternoP, person.value?.maternoP].filter(Boolean).join(' '))
const initials = computed(() => (fullName.value || 'PA').split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join(''))
const photoUrl = computed(() => {
  const original = normalizeVirtualAssetUrl(person.value?.foto || '')
  const processed = normalizeVirtualAssetUrl(person.value?.compressed_foto || '')
  return original || (isValidatedVisionPhotoUrl(processed) ? processed : '')
})
const subtitle = computed(() => person.value?.parenP || (primaryChild.value ? studentLine.value : 'Consulta QR, marbete y validación.'))
const studentLine = computed(() => {
  const child = primaryChild.value
  if (!child) return ''
  return [child.plantel, child.nivelEdu, child.grado, child.grupo].filter(Boolean).join(' / ')
})
const marbeteReady = computed(() => Boolean(readiness.value?.ok))
const marbeteMessage = computed(() => {
  if (readinessPending.value) return 'Validando marbete'
  if (readinessError.value) return 'No fue posible validar el marbete'
  return readiness.value?.ok ? 'Marbete listo para descargar' : readiness.value?.issues?.[0] || 'Marbete no disponible'
})
const shareMessage = ref('')

async function shareValidation() {
  if (!person.value?.id) return

  const url = appAbsoluteUrl(authorizedPersonValidationPath(person.value.id))
  const title = fullName.value ? `Validacion de ${fullName.value}` : 'Validacion de Persona Autorizada'
  shareMessage.value = ''

  try {
    if (navigator.share) {
      await navigator.share({ title, text: 'Código de validación de Persona Autorizada.', url })
      shareMessage.value = 'Validacion compartida.'
      return
    }

    await navigator.clipboard.writeText(url)
    shareMessage.value = 'Liga de validación copiada.'
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}
</script>

<style scoped>
.pa-detail {
  --pa-primary: #618b2f;
  --pa-contrast: #fff;
  --pa-soft: rgba(97, 139, 47, 0.12);
  --pa-border: rgba(97, 139, 47, 0.28);
  --pa-gray: #50535a;
  --pa-muted: #86888c;
}

.detail-head,
.identity-card,
.actions-card {
  background: #fff;
  border: 1px solid var(--pa-border);
  border-radius: 20px;
  box-shadow: var(--shadow-soft);
}

.detail-head {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: clamp(14px, 2.4vw, 20px);
}

.detail-head h1 {
  color: var(--pa-gray);
  font-size: clamp(1.55rem, 3vw, 2.25rem);
  margin-bottom: 6px;
}

.detail-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(260px, 360px) minmax(0, 1fr);
}

.identity-card,
.actions-card {
  display: grid;
  gap: 12px;
  padding: 14px;
}

.photo {
  aspect-ratio: 4 / 5;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 18px;
  color: var(--pa-primary);
  display: grid;
  font-size: 2.8rem;
  font-weight: 600;
  overflow: hidden;
  place-items: center;
}

.photo img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.identity-card h2 {
  color: var(--pa-gray);
  font-size: 1.3rem;
  margin-bottom: 4px;
}

.readiness,
.action-grid {
  display: grid;
  gap: 8px;
}

.readiness span {
  background: #f5f5f4;
  border: 1px solid #e8e8e4;
  border-radius: 999px;
  color: var(--pa-muted);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 8px 10px;
}

.readiness span.ok {
  background: var(--pa-soft);
  border-color: var(--pa-border);
  color: var(--pa-gray);
}

.action-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.notice {
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 14px;
  color: var(--pa-gray);
  font-weight: 600;
  margin: 0;
  padding: 10px 12px;
}

.loading-card {
  color: var(--color-muted);
}

@media (max-width: 760px) {
  .detail-head,
  .detail-grid,
  .action-grid {
    grid-template-columns: 1fr;
  }
}
</style>
