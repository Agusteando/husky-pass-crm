<template>
  <FamilyPersonasAutorizadasShell title="Convenios">
    <section class="card convenios-card" :class="{ unavailable: !config?.conveniosUrl }" data-product-panel="convenios" :data-state="config?.conveniosUrl ? 'content' : 'unavailable'">
      <div>
        <p class="eyebrow">Convenios</p>
        <h1>Beneficios</h1>
        <p>{{ config?.conveniosUrl ? 'Disponibles.' : 'No disponibles.' }}</p>
      </div>
      <a v-if="config?.conveniosUrl" class="btn btn-primary pa-primary" :href="config.conveniosUrl" target="_blank" rel="noopener noreferrer">Abrir</a>
      <button v-else class="btn btn-secondary" type="button" disabled>No disponible</button>
    </section>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { useFetch } from 'nuxt/app'
import type { PersonasAutorizadasConfig } from '~/types/daycare'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })
const { data: config } = useFetch<PersonasAutorizadasConfig>('/api/personas-autorizadas/config', { key: 'pa-convenios-config', timeout: 15000 })
</script>

<style scoped>
.convenios-card { align-items: center; display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr) auto; }
.pa-primary { background: var(--pa-primary); color: var(--pa-contrast); }
@media (max-width: 760px) { .convenios-card { grid-template-columns: 1fr; } }
</style>
