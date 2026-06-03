<template>
  <main class="credential-shell">
    <section v-if="pending" class="credential-card status-card">
      <img src="/brand/husky-pass-logo.png" alt="Husky Pass" />
      <h1>Cargando credencial…</h1>
    </section>

    <section v-else-if="loadError || !data" class="credential-card status-card">
      <img src="/brand/husky-pass-logo.png" alt="Husky Pass" />
      <h1>Credencial no disponible</h1>
      <p>No encontramos esta persona autorizada dentro de tu cuenta.</p>
    </section>

    <section v-else class="credential-card">
      <header>
        <img src="/brand/husky-pass-logo.png" alt="Husky Pass" />
        <div>
          <p>Persona Autorizada</p>
          <h1>{{ fullName }}</h1>
          <span>{{ data.parenP || 'Parentesco no especificado' }}</span>
        </div>
      </header>
      <div class="credential-body">
        <img v-if="data.foto" class="person-photo" :src="normalizeVirtualAssetUrl(data.foto)" alt="Fotografía" />
        <div v-else class="person-photo empty-photo">PA</div>
        <div class="qr-box">
          <img :src="qrImage" alt="Código QR" />
          <small>{{ validationUrl }}</small>
        </div>
      </div>
      <footer><strong>{{ data.nivelEdu || 'Husky Pass' }}</strong></footer>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { PrintableAuthorizedPerson } from '~/types/daycare'
import { appAbsoluteUrl, authorizedPersonValidationPath, normalizeVirtualAssetUrl } from '~/utils/daycare'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })
const route = useRoute()
const { data, pending, error: loadError } = await useFetch<PrintableAuthorizedPerson>('/api/personas-autorizadas/credential', { query: { id: route.params.id } })
const fullName = computed(() => [data.value?.nombreP, data.value?.paternoP, data.value?.maternoP].filter(Boolean).join(' '))
const validationUrl = computed(() => appAbsoluteUrl(authorizedPersonValidationPath(route.params.id as string)))
const qrImage = computed(() => `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(validationUrl.value)}`)

onMounted(() => {
  if (data.value) window.print()
})
</script>

<style scoped>
.credential-shell {
  background: #fff;
  display: grid;
  min-height: 100vh;
  padding: 18px;
  place-items: center;
}

.credential-card {
  background: #fff;
  border: 1px solid #dfe8d7;
  border-radius: 28px;
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

.status-card img {
  max-width: 180px;
}

.status-card h1,
.status-card p {
  margin-bottom: 0;
}

header {
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  display: grid;
  gap: 18px;
  grid-template-columns: 170px 1fr;
  padding-bottom: 18px;
}

header img {
  width: 100%;
}

header p {
  color: var(--color-brand-700);
  font-weight: 900;
  letter-spacing: 0.12em;
  margin-bottom: 6px;
  text-transform: uppercase;
}

header h1 {
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
  border-radius: 24px;
  object-fit: cover;
  width: 100%;
}

.empty-photo {
  background: var(--color-brand-100);
  color: var(--color-brand-800);
  display: grid;
  font-size: 3.4rem;
  font-weight: 900;
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
  background: var(--color-brand-100);
  border-radius: 18px;
  padding: 14px;
}

@media print {
  .credential-shell {
    padding: 0;
  }

  .credential-card {
    border-radius: 0;
    width: 100%;
  }
}

@media (max-width: 680px) {
  header,
  .credential-body {
    grid-template-columns: 1fr;
  }

  header img {
    max-width: 170px;
  }
}
</style>
