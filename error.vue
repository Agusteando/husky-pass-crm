<template>
  <main class="error-page" data-product-screen="error-state">
    <section class="error-shell">
      <BrandMark to="/login" />
      <div class="error-copy">
        <p class="eyebrow">{{ statusLabel }}</p>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
      <nav class="error-actions" aria-label="Rutas de regreso">
        <button class="btn btn-primary" type="button" @click="go('/login')">Ir al acceso</button>

      </nav>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { clearError, type NuxtError } from 'nuxt/app'

const props = defineProps<{
  error: NuxtError
}>()

const statusLabel = computed(() => props.error.statusCode === 404 ? 'Ruta no encontrada' : `Error ${props.error.statusCode || 500}`)
const title = computed(() => props.error.statusCode === 404 ? 'Esta pagina no esta disponible' : 'No pudimos abrir esta vista')
const description = computed(() => props.error.statusCode === 404
  ? 'Regresa al acceso de Husky Pass para continuar con una ruta valida.'
  : 'La aplicacion sigue disponible. Regresa al acceso correspondiente e intenta nuevamente.')

async function go(path: string) {
  await clearError({ redirect: path })
}
</script>

<style scoped>
.error-page {
  align-items: center;
  background:
    radial-gradient(circle at 78% 18%, rgba(93, 162, 220, .16), transparent 30%),
    linear-gradient(135deg, #f7f9fb, #eef4f8);
  color: var(--color-ink);
  display: grid;
  min-height: 100vh;
  padding: 24px;
}

.error-shell {
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

.error-copy {
  display: grid;
  gap: 8px;
}

.error-copy h1,
.error-copy p {
  margin-bottom: 0;
}

.error-copy h1 {
  font-size: clamp(2rem, 6vw, 3.2rem);
}

.error-copy p:not(.eyebrow) {
  color: var(--color-muted);
  line-height: 1.5;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 560px) {
  .error-actions .btn {
    width: 100%;
  }
}
</style>
