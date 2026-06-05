<template>
  <FamilyPersonasAutorizadasShell title="Convenios">
    <section class="card convenios-card" :class="{ unavailable: !config?.conveniosUrl }" data-product-panel="convenios" :data-state="config?.conveniosUrl ? 'content' : 'unavailable'">
      <div>
        <p class="eyebrow">Convenios</p>
        <h1>Beneficios institucionales</h1>
        <p>{{ config?.conveniosUrl ? 'Consulta los convenios disponibles para tu familia.' : 'No hay convenios disponibles por el momento.' }}</p>
      </div>
      <div class="convenios-action">
        <span class="badge">{{ config?.conveniosUrl ? 'Disponible' : 'Sin enlace' }}</span>
        <a v-if="config?.conveniosUrl" class="btn btn-primary pa-primary" :href="config.conveniosUrl" target="_blank" rel="noopener noreferrer">Abrir convenios</a>
        <button v-else class="btn btn-secondary" type="button" disabled>Sin convenios</button>
      </div>
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
.convenios-card { align-items: center; display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr) auto; }
.convenios-action { align-items: end; display: grid; gap: 10px; justify-items: end; }
.pa-primary { background: var(--pa-primary); color: var(--pa-contrast); }
@media (max-width: 760px) { .convenios-card { grid-template-columns: 1fr; } .convenios-action { justify-items: stretch; } }
</style>
