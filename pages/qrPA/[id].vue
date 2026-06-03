<template>
  <main class="public-pass-shell">
    <section class="public-card card" v-if="data">
      <img class="public-logo" src="/brand/husky-pass-logo.png" alt="Husky Pass" />
      <div class="status">Escaneo de persona autorizada</div>
      <div class="person-row">
        <img v-if="data.fotoP" :src="normalizeVirtualAssetUrl(data.fotoP)" alt="Persona autorizada" />
        <div v-else class="fallback-photo">PA</div>
        <div>
          <p class="eyebrow">Persona autorizada</p>
          <h1>{{ data.fullnameP }}</h1>
          <p>{{ data.parentesco || 'Parentesco no especificado' }}</p>
        </div>
      </div>
      <div class="student-box">
        <p class="eyebrow">Alumno</p>
        <h2>{{ data.fullnameA || 'Alumno no disponible' }}</h2>
        <p>{{ data.gradoA || '—' }} · {{ data.grupoA || '—' }} · {{ data.plantel || '—' }}</p>
        <small>Matrícula: {{ data.matricula || '—' }}</small>
      </div>
    </section>
    <section v-else class="card public-card">
      <img class="public-logo" src="/brand/husky-pass-logo.png" alt="Husky Pass" />
      <h1>Registro no encontrado</h1>
      <p>No fue posible encontrar esta persona autorizada.</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { ScanAuthorizedPerson } from '~/types/daycare'
import { normalizeVirtualAssetUrl } from '~/utils/daycare'

const route = useRoute()
const { data } = await useFetch<ScanAuthorizedPerson>('/api/personas-autorizadas/scan', {
  query: { id: route.params.id }
})
</script>

<style scoped>
.public-pass-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 28px;
}

.public-card {
  width: min(100%, 760px);
}

.public-logo {
  width: min(220px, 70vw);
  display: block;
  margin: 0 auto 24px;
}

.status {
  background: var(--color-brand-700);
  border-radius: 999px;
  color: #fff;
  display: inline-flex;
  font-weight: 900;
  margin-bottom: 24px;
  padding: 8px 14px;
}

.person-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 22px;
  align-items: center;
}

.person-row img,
.fallback-photo {
  aspect-ratio: 1 / 1;
  width: 100%;
  object-fit: cover;
  border-radius: 28px;
  background: var(--color-brand-100);
}

.fallback-photo {
  display: grid;
  place-items: center;
  color: var(--color-brand-800);
  font-size: 3rem;
  font-weight: 900;
}

.student-box {
  background: var(--color-brand-100);
  border-radius: 24px;
  margin-top: 24px;
  padding: 22px;
}

@media (max-width: 680px) {
  .person-row {
    grid-template-columns: 1fr;
  }
}
</style>
