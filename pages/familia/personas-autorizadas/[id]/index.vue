<template>
  <FamilyPersonasAutorizadasShell title="Persona autorizada">
    <section class="pa-detail" :style="themeVars" data-product-area="personas-autorizadas" data-product-screen="detail">
      <FamilyPersonasPageHeader
        eyebrow="Persona autorizada"
        :title="fullName || 'Registro'"
        :description="subtitle"
        :theme="theme"
        ambassador-variant="header"
      >
        <template #actions>
          <NuxtLink class="btn btn-secondary" to="/familia/personas-autorizadas">Volver</NuxtLink>
        </template>
      </FamilyPersonasPageHeader>

      <p v-if="loadError" class="alert" data-state="error">No fue posible cargar este registro.</p>
      <div v-else-if="pending" class="card loading-card" data-product-loading data-state="loading">Cargando registro...</div>

      <section v-else-if="person" class="detail-grid" data-product-panel="authorized-person-detail" data-state="content">
        <article class="identity-card">
          <div class="photo">
            <FamilyPersonasProcessedPhoto v-if="photoUrl" :src="person.foto" :processed-src="person.compressed_foto" :auto-process="false" alt="Fotografia" :namespace="`pa-detail-${person.id}`" />
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
            <a v-if="marbeteReady" class="btn btn-primary pa-primary" :href="`/api/personas-autorizadas/marbete?id=${person.id}&download=1`" data-diagnostic-link="descargar-husky-pass">
              Descargar Husky Pass
            </a>
            <button v-else class="btn btn-secondary" type="button" disabled>{{ marbeteMessage }}</button>
            <NuxtLink class="btn btn-secondary" :to="`/familia/personas-autorizadas/${person.id}/marbete`" data-diagnostic-link="previsualizar-husky-pass">
              Vista previa
            </NuxtLink>
          </div>
        </article>
      </section>

      <EmptyState v-else title="Registro no disponible" description="No encontramos esta persona autorizada en tu cuenta." />
    </section>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch, useRoute } from 'nuxt/app'
import type { AuthorizedChild, AuthorizedPerson, MarbeteReadinessResponse } from '~/types/daycare'
import { authorizedPersonLabel, normalizeVirtualAssetUrl } from '~/utils/daycare'
import { usePersonasFamilyTheme, useResolvedPersonasTheme } from '~/composables/usePersonasTheme'
import { isValidatedVisionPhotoUrl } from '~/utils/visionFace'
import { displayMatricula } from '~/utils/matricula'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

const route = useRoute()
const familyTheme = usePersonasFamilyTheme({ key: `pa-detail-${route.params.id}` })
const { data, pending, error: loadError } = useFetch<AuthorizedPerson[]>('/api/personas-autorizadas/family', { key: 'pa-family-people', timeout: 15000, dedupe: 'defer' })
const { data: readiness, pending: readinessPending, error: readinessError } = useFetch<MarbeteReadinessResponse>('/api/personas-autorizadas/marbete', {
  key: `pa-detail-marbete-readiness-${route.params.id}`,
  query: { id: route.params.id, format: 'readiness' },
  timeout: 20000
})
const person = computed(() => (data.value || []).find((item) => String(item.id) === String(route.params.id)))
const primaryChild = computed<AuthorizedChild | null>(() => person.value?.children?.[0] || null)
const { theme, themeVars } = useResolvedPersonasTheme(() => ({
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
const subtitle = computed(() => person.value?.parenP || (primaryChild.value ? studentLine.value : 'Consulta y descarga su Husky Pass.'))
const studentLine = computed(() => {
  const child = primaryChild.value
  if (!child) return ''
  return [displayMatricula(child.matricula), child.plantel, child.nivelEdu, child.grado, child.grupo].filter(Boolean).join(' / ')
})
const marbeteReady = computed(() => Boolean(readiness.value?.ok))
const marbeteMessage = computed(() => {
  if (readinessPending.value) return 'Validando Husky Pass'
  if (readinessError.value) return 'No fue posible validar el Husky Pass'
  return readiness.value?.ok ? 'Husky Pass listo' : readiness.value?.issues?.[0] || 'Husky Pass no disponible'
})
</script>

<style scoped>
.pa-detail {
  --pa-primary: #618b2f;
  --pa-contrast: #fff;
  --pa-soft: rgba(97, 139, 47, 0.12);
  --pa-border: rgba(97, 139, 47, 0.28);
  --pa-gray: #50535a;
  --pa-muted: #86888c;
  display: grid;
  gap: 12px;
}

.identity-card,
.actions-card {
  background: #fff;
  border: 1px solid var(--pa-border);
  border-radius: 14px;
  box-shadow: var(--shadow-soft);
}

.identity-card h2,
.identity-card p {
  margin-bottom: 0;
}

.detail-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(220px, 300px) minmax(0, 1fr);
}

.identity-card,
.actions-card {
  display: grid;
  gap: 12px;
  padding: 12px;
}

.photo {
  aspect-ratio: 1;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 12px;
  color: var(--pa-primary);
  display: grid;
  font-size: 2rem;
  font-weight: 700;
  overflow: hidden;
  place-items: center;
  width: min(100%, 220px);
}

.photo img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.readiness,
.action-grid {
  display: grid;
  gap: 8px;
}

.readiness {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.readiness span {
  background: #f5f5f4;
  border: 1px solid #e8e8e4;
  border-radius: 10px;
  color: var(--pa-muted);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 8px 9px;
}

.readiness span.ok {
  background: var(--pa-soft);
  border-color: var(--pa-border);
  color: var(--pa-primary);
}

.action-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.pa-primary {
  background: var(--pa-primary);
  color: var(--pa-contrast);
}

.loading-card {
  color: var(--color-muted);
}

@media (max-width: 760px) {
  .detail-grid,
  .readiness,
  .action-grid {
    grid-template-columns: 1fr;
  }
}
</style>
