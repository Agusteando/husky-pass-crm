<template>
  <FamilyPersonasAutorizadasShell title="Código QR">
    <section class="stack" :style="themeVars" data-product-area="personas-autorizadas" data-product-screen="qr">
    <div class="workspace-head compact-head">
      <div>
        <p class="eyebrow">Código QR</p>
        <h1>{{ fullName || 'Persona autorizada' }}</h1>
        <p>Este código permite validar la autorización de salida.</p>
      </div>
      <NuxtLink class="btn btn-secondary" :to="`/familia/personas-autorizadas/${route.params.id}`">Volver</NuxtLink>
    </div>

    <section v-if="person" class="card qr-card">
      <img class="brand" :src="institutionLogo" :alt="institutionAlt" />
      <img class="qr" :src="qrImage" alt="Código QR" />
      <div>
        <h2>{{ fullName }}</h2>
        <p>{{ person.parenP || 'Persona autorizada' }}</p>
        <small>{{ validationUrl }}</small>
      </div>
    </section>
    <EmptyState v-else title="Registro no disponible" description="No encontramos esta persona autorizada en tu cuenta." />
  </section>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch, useRoute } from 'nuxt/app'
import type { AuthorizedChild, AuthorizedPerson } from '~/types/daycare'
import { appAbsoluteUrl, authorizedPersonValidationPath } from '~/utils/daycare'
import { personasInstitutionLogo, personasInstitutionName } from '~/utils/personasTheme'
import { usePersonasFamilyTheme, useResolvedPersonasTheme } from '~/composables/usePersonasTheme'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })
const route = useRoute()
const familyTheme = usePersonasFamilyTheme({ key: `pa-qr-${route.params.id}` })
const { data } = useFetch<AuthorizedPerson[]>('/api/personas-autorizadas/family')
const person = computed(() => (data.value || []).find((item) => String(item.id) === String(route.params.id)))
const fullName = computed(() => [person.value?.nombreP, person.value?.paternoP, person.value?.maternoP].filter(Boolean).join(' '))
const primaryChild = computed<AuthorizedChild | null>(() => person.value?.children?.[0] || null)
const { theme, themeVars } = useResolvedPersonasTheme(() => ({
  matricula: primaryChild.value?.matricula || familyTheme.primaryChild.value?.matricula || familyTheme.session.value?.user?.username,
  plantel: primaryChild.value?.plantel || familyTheme.primaryChild.value?.plantel || familyTheme.session.value?.user?.plantel?.[0],
  nivelEdu: primaryChild.value?.nivelEdu || familyTheme.primaryChild.value?.nivelEdu,
  campus: primaryChild.value?.campus || familyTheme.primaryChild.value?.campus || familyTheme.session.value?.user?.campus
}))
const institutionLogo = computed(() => personasInstitutionLogo(theme.value))
const institutionAlt = computed(() => personasInstitutionName(theme.value))
const validationUrl = computed(() => appAbsoluteUrl(authorizedPersonValidationPath(route.params.id as string)))
const qrImage = computed(() => `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(validationUrl.value)}`)
</script>

<style scoped>
.qr-card {
  --pa-primary: #618b2f;
  --pa-contrast: #fff;
  --pa-soft: rgba(97, 139, 47, 0.12);
  --pa-border: rgba(97, 139, 47, 0.28);
  align-items: center;
  display: grid;
  gap: 10px;
  justify-items: center;
  margin-inline: auto;
  border-color: var(--pa-border);
  max-width: 520px;
  text-align: center;
}

.brand {
  max-width: 140px;
}

.qr {
  height: min(210px, 54vw);
  width: min(210px, 54vw);
}

.qr-card h2 {
  color: var(--pa-primary);
  margin-bottom: 6px;
}

.qr-card small {
  color: var(--color-muted);
  word-break: break-all;
}
</style>
