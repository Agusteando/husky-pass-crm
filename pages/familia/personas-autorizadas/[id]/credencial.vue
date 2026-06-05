<template>
  <main class="credential-shell" :style="themeVars" data-product-area="personas-autorizadas" data-product-screen="credential">
    <section v-if="pending" class="credential-card status-card" data-product-loading>
      <img class="brand-logo" :src="institutionLogo" :alt="institutionAlt" />
      <h1>Cargando credencial...</h1>
    </section>

    <section v-else-if="loadError || !data" class="credential-card status-card" data-state="error">
      <img class="brand-logo" :src="institutionLogo" :alt="institutionAlt" />
      <h1>Credencial no disponible</h1>
      <p>No encontramos esta persona autorizada dentro de tu cuenta.</p>
      <NuxtLink class="btn btn-secondary no-print" to="/familia/personas-autorizadas">Volver</NuxtLink>
    </section>

    <section v-else class="credential-card" data-product-panel="credential" data-state="content">
      <header>
        <img class="brand-logo" :src="institutionLogo" :alt="institutionAlt" />
        <div>
          <p>Persona Autorizada</p>
          <h1>{{ fullName || 'Registro' }}</h1>
          <span>{{ data.parenP || 'Parentesco no especificado' }}</span>
        </div>
      </header>

      <div class="credential-body">
        <FamilyPersonasProcessedPhoto v-if="photoUrl" class="person-photo" :src="data.foto" :processed-src="data.compressed_foto" alt="Fotografía" :namespace="`pa-credential-${route.params.id}`" />
        <div v-else class="person-photo empty-photo">PA</div>
        <div class="qr-box">
          <img :src="qrImage" alt="Código QR" />
          <small>{{ validationUrl }}</small>
        </div>
      </div>

      <footer>
        <strong>{{ credentialContext }}</strong>
        <div class="footer-actions no-print">
          <NuxtLink class="btn btn-secondary" :to="`/familia/personas-autorizadas/${route.params.id}/marbete`">Marbete</NuxtLink>
          <NuxtLink class="btn btn-secondary" :to="`/familia/personas-autorizadas/${route.params.id}/imprimir`">Imprimir</NuxtLink>
        </div>
      </footer>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch, useRoute } from 'nuxt/app'
import type { PrintableAuthorizedPerson } from '~/types/daycare'
import { appAbsoluteUrl, authorizedPersonValidationPath, normalizeVirtualAssetUrl } from '~/utils/daycare'
import { personasInstitutionLogo, personasInstitutionName, personasThemeStyle, resolvePersonasTheme } from '~/utils/personasTheme'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

const route = useRoute()
const { data, pending, error: loadError } = useFetch<PrintableAuthorizedPerson>('/api/personas-autorizadas/credential', {
  key: `pa-credential-${route.params.id}`,
  query: { id: route.params.id },
  server: false,
  timeout: 15000
})
const theme = computed(() => resolvePersonasTheme({
  matricula: data.value?.matricula || data.value?.child?.matricula,
  plantel: data.value?.plantel,
  nivelEdu: data.value?.nivelEdu,
  campus: data.value?.child?.campus
}))
const themeVars = computed(() => personasThemeStyle(theme.value))
const institutionLogo = computed(() => personasInstitutionLogo(theme.value))
const institutionAlt = computed(() => personasInstitutionName(theme.value))
const fullName = computed(() => [data.value?.nombreP, data.value?.paternoP, data.value?.maternoP].filter(Boolean).join(' '))
const photoUrl = computed(() => normalizeVirtualAssetUrl(data.value?.compressed_foto || data.value?.foto || ''))
const credentialContext = computed(() => [data.value?.plantel, data.value?.nivelEdu, data.value?.gradoA, data.value?.grupoA].filter(Boolean).join(' / ') || institutionAlt.value)
const validationUrl = computed(() => appAbsoluteUrl(authorizedPersonValidationPath(route.params.id as string)))
const qrImage = computed(() => `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(validationUrl.value)}`)
</script>

<style scoped>
.credential-shell {
  --pa-primary: #618b2f;
  --pa-contrast: #fff;
  --pa-soft: rgba(97, 139, 47, 0.12);
  --pa-border: rgba(97, 139, 47, 0.28);
  --pa-gray: #50535a;
  background:
    radial-gradient(circle at top right, var(--pa-soft), transparent 32rem),
    #f2f4ef;
  display: grid;
  min-height: 100vh;
  padding: 18px;
  place-items: center;
}

.credential-card {
  background: #fff;
  border: 1px solid var(--pa-border);
  border-radius: 28px;
  box-shadow: var(--shadow-card);
  color: var(--color-ink);
  display: grid;
  gap: 18px;
  padding: clamp(18px, 4vw, 28px);
  width: min(100%, 680px);
}

.status-card {
  justify-items: center;
  text-align: center;
}

.status-card .brand-logo {
  max-width: 180px;
}

.status-card h1,
.status-card p {
  margin-bottom: 0;
}

header {
  align-items: center;
  border-bottom: 1px solid var(--pa-border);
  display: grid;
  gap: 18px;
  grid-template-columns: 170px 1fr;
  padding-bottom: 18px;
}

.brand-logo {
  width: 100%;
}

header p {
  color: var(--pa-primary);
  font-weight: 600;
  letter-spacing: 0.12em;
  margin-bottom: 6px;
  text-transform: uppercase;
}

header h1 {
  color: var(--pa-gray);
  margin-bottom: 6px;
}

.credential-body {
  align-items: center;
  display: grid;
  gap: 22px;
  grid-template-columns: minmax(0, 1fr) 210px;
}

.person-photo {
  aspect-ratio: 4 / 5;
  border: 1px solid var(--pa-border);
  border-radius: 24px;
  object-fit: cover;
  width: 100%;
}

.empty-photo {
  background: var(--pa-soft);
  color: var(--pa-primary);
  display: grid;
  font-size: 3.4rem;
  font-weight: 600;
  place-items: center;
}

.qr-box {
  display: grid;
  gap: 10px;
  justify-items: center;
  text-align: center;
  word-break: break-word;
}

.qr-box img {
  height: 180px;
  width: 180px;
}

footer {
  align-items: center;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
  padding: 14px;
}

footer strong {
  color: var(--pa-gray);
}

.footer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media print {
  .credential-shell {
    background: #fff;
    padding: 0;
  }

  .credential-card {
    border-radius: 0;
    box-shadow: none;
    width: 100%;
  }

  .no-print {
    display: none;
  }
}

@media (max-width: 680px) {
  header,
  .credential-body {
    grid-template-columns: 1fr;
  }

  header .brand-logo {
    max-width: 170px;
  }
}
</style>
