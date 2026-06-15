<template>
  <main class="not-found-page" data-product-screen="not-found">
    <section class="not-found-shell">
      <BrandMark to="/login" />
      <div class="not-found-copy">
        <p class="eyebrow">Ruta no encontrada</p>
        <h1>Esta pagina no esta disponible</h1>
        <p>Vuelve a elegir tu experiencia para continuar con una ruta valida.</p>
      </div>
      <nav class="not-found-actions" aria-label="Rutas de regreso">
        <NuxtLink class="btn btn-primary" to="/login">Elegir experiencia</NuxtLink>
        <NuxtLink class="btn btn-secondary" to="/login/escolar">Acceso escolar</NuxtLink>
        <NuxtLink class="btn btn-secondary" to="/login/guarderia">Acceso guarderia</NuxtLink>
        <NuxtLink class="btn btn-secondary" to="/admin/login">Administracion</NuxtLink>
      </nav>
    </section>
  </main>
</template>

<script setup lang="ts">
import { setResponseStatus } from 'nuxt/app'

if (import.meta.server) setResponseStatus(404)
</script>

<style scoped>
.not-found-page {
  align-items: center;
  background:
    radial-gradient(circle at 78% 18%, rgba(93, 162, 220, .16), transparent 30%),
    linear-gradient(135deg, #f7f9fb, #eef4f8);
  color: var(--color-ink);
  display: grid;
  min-height: 100vh;
  padding: 24px;
}

.not-found-shell {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  display: grid;
  gap: 18px;
  margin: 0 auto;
  max-width: 620px;
  padding: clamp(22px, 4vw, 34px);
  width: min(100%, 620px);
}

.not-found-copy {
  display: grid;
  gap: 8px;
}

.not-found-copy h1,
.not-found-copy p {
  margin-bottom: 0;
}

.not-found-copy h1 {
  font-size: clamp(2rem, 6vw, 3.2rem);
}

.not-found-copy p:not(.eyebrow) {
  color: var(--color-muted);
  line-height: 1.5;
}

.not-found-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 560px) {
  .not-found-actions .btn {
    width: 100%;
  }
}
</style>
