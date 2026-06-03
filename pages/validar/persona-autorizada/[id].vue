<template>
  <main class="validate-shell">
    <section v-if="pending" class="card validate-card empty-public">
      <img class="logo" src="/brand/husky-pass-logo.png" alt="Husky Pass" />
      <h1>Validando registro…</h1>
    </section>

    <section v-else-if="data" class="card validate-card">
      <img class="logo" src="/brand/husky-pass-logo.png" alt="Husky Pass" />
      <span class="status">Autorizado</span>
      <div class="person-row">
        <img v-if="data.fotoP" :src="normalizeVirtualAssetUrl(data.fotoP)" alt="Persona autorizada" />
        <div v-else class="fallback-photo">PA</div>
        <div>
          <p class="eyebrow">Persona autorizada</p>
          <h1>{{ data.fullnameP || 'Persona autorizada' }}</h1>
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

    <section v-else class="card validate-card empty-public">
      <img class="logo" src="/brand/husky-pass-logo.png" alt="Husky Pass" />
      <h1>Registro no encontrado</h1>
      <p>{{ loadError ? 'No fue posible validar esta persona autorizada.' : 'No fue posible encontrar esta persona autorizada.' }}</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from '#imports'
import type { ScanAuthorizedPerson } from '~/types/daycare'
import { normalizeVirtualAssetUrl } from '~/utils/daycare'

const route = useRoute()
const { data, pending, error: loadError } = await useFetch<ScanAuthorizedPerson>('/api/personas-autorizadas/scan', {
  query: { id: route.params.id }
})
</script>

<style scoped>
.validate-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 18px;
}

.validate-card {
  width: min(100%, 720px);
}

.logo {
  display: block;
  margin: 0 auto 16px;
  width: min(176px, 62vw);
}

.status {
  background: var(--color-brand-700);
  border-radius: 999px;
  color: #fff;
  display: inline-flex;
  font-weight: 900;
  margin-bottom: 18px;
  padding: 7px 12px;
}

.person-row {
  align-items: center;
  display: grid;
  gap: 18px;
  grid-template-columns: 150px 1fr;
}

.person-row img,
.fallback-photo {
  aspect-ratio: 1 / 1;
  background: var(--color-brand-100);
  border-radius: 24px;
  object-fit: cover;
  width: 100%;
}

.fallback-photo {
  color: var(--color-brand-800);
  display: grid;
  font-size: 2.8rem;
  font-weight: 900;
  place-items: center;
}

.student-box {
  background: var(--color-brand-100);
  border-radius: 20px;
  margin-top: 18px;
  padding: 18px;
}

.student-box h2 {
  margin-bottom: 6px;
}

.empty-public {
  text-align: center;
}

.empty-public h1,
.empty-public p {
  margin-bottom: 0;
}

@media (max-width: 620px) {
  .person-row {
    grid-template-columns: 1fr;
  }

  .person-row img,
  .fallback-photo {
    max-width: 220px;
  }
}
</style>
