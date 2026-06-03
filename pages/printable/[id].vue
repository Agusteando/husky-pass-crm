<template>
  <main class="print-shell" v-if="data">
    <section class="print-card">
      <header>
        <img src="/brand/husky-pass-logo.png" alt="Husky Pass" />
        <div>
          <p>Persona Autorizada</p>
          <h1>{{ fullName }}</h1>
          <span>{{ data.parenP || 'Parentesco no especificado' }}</span>
        </div>
      </header>

      <div class="print-body">
        <img v-if="data.foto" class="person-photo" :src="normalizeVirtualAssetUrl(data.foto)" alt="Fotografía" />
        <div v-else class="person-photo placeholder">PA</div>
        <div class="qr-box">
          <img :src="qrImage" alt="Código QR" />
          <small>{{ qrUrl }}</small>
        </div>
      </div>

      <footer>
        <strong>{{ levelLabel }}</strong>
        <span>{{ qrUrl }}</span>
      </footer>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { PrintableAuthorizedPerson } from '~/types/daycare'
import { normalizeVirtualAssetUrl, qrPaUrl } from '~/utils/daycare'

const route = useRoute()
const { data } = await useFetch<PrintableAuthorizedPerson>('/api/personas-autorizadas/printable', {
  query: { id: route.params.id }
})

const fullName = computed(() => [data.value?.nombreP, data.value?.paternoP, data.value?.maternoP].filter(Boolean).join(' '))
const qrUrl = computed(() => qrPaUrl(data.value?.id))
const qrImage = computed(() => `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrUrl.value)}`)
const levelLabel = computed(() => data.value?.nivelEdu || 'preescolar')
</script>

<style scoped>
.print-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 28px;
  background: #f2f4ef;
}

.print-card {
  background: #fff;
  border: 1px solid #dfe8d7;
  border-radius: 32px;
  box-shadow: var(--shadow-card);
  color: var(--color-ink);
  display: grid;
  gap: 24px;
  padding: 30px;
  width: min(100%, 720px);
}

header {
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  display: grid;
  gap: 20px;
  grid-template-columns: 210px 1fr;
  padding-bottom: 22px;
}

header img {
  width: 100%;
}

header p {
  color: var(--color-brand-700);
  font-weight: 900;
  letter-spacing: 0.12em;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.print-body {
  align-items: center;
  display: grid;
  gap: 28px;
  grid-template-columns: 1fr 220px;
}

.person-photo {
  aspect-ratio: 4 / 5;
  border-radius: 28px;
  object-fit: cover;
  width: 100%;
}

.placeholder {
  background: var(--color-brand-100);
  display: grid;
  place-items: center;
  color: var(--color-brand-800);
  font-size: 4rem;
  font-weight: 900;
}

.qr-box {
  display: grid;
  gap: 12px;
  justify-items: center;
  text-align: center;
  word-break: break-word;
}

.qr-box img {
  width: 180px;
  height: 180px;
}

footer {
  align-items: center;
  background: var(--color-brand-100);
  border-radius: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  padding: 16px;
}

@media print {
  .print-shell {
    background: #fff;
    padding: 0;
  }

  .print-card {
    box-shadow: none;
    border-radius: 0;
    width: 100%;
  }
}

@media (max-width: 720px) {
  header,
  .print-body {
    grid-template-columns: 1fr;
  }
}
</style>
