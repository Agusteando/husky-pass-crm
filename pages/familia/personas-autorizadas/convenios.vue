<template>
  <FamilyPersonasAutorizadasShell title="Convenios">
    <section class="convenios-screen">
      <FamilyPersonasPageHeader
        eyebrow="Familias"
        title="Convenios"
        :description="config?.conveniosUrl ? 'Consulta los beneficios institucionales disponibles para tu familia.' : 'Los beneficios institucionales aparecerán aquí cuando estén disponibles.'"
        ambassador-variant="help"
        :ambassador-title="config?.conveniosUrl ? 'Beneficios disponibles' : 'Sin acción necesaria'"
        :ambassador-message="config?.conveniosUrl ? 'Abriré el catálogo institucional en una pestaña segura.' : 'Cuando el colegio publique convenios, este acceso se activará.'"
        :ambassador-tone="config?.conveniosUrl ? 'success' : 'empty'"
      >
        <template v-if="config?.conveniosUrl" #actions>
          <a class="btn btn-primary pa-primary" :href="config.conveniosUrl" target="_blank" rel="noopener noreferrer">Abrir convenios</a>
        </template>
      </FamilyPersonasPageHeader>

      <section class="card convenios-card" :class="{ unavailable: !config?.conveniosUrl }" data-product-panel="convenios" :data-state="config?.conveniosUrl ? 'content' : 'unavailable'">
        <FamilyPersonasSectionHeading
          title="Beneficios institucionales"
          :description="config?.conveniosUrl ? 'El catálogo se abre en el sitio institucional correspondiente.' : 'No hay un catálogo publicado por el momento.'"
          :meta="config?.conveniosUrl ? 'Disponible' : 'Próximamente'"
        />
        <p>
          {{ config?.conveniosUrl
            ? 'Revisa promociones, servicios y acuerdos vigentes para las familias de la comunidad escolar.'
            : 'No necesitas realizar ninguna acción. El acceso se habilitará automáticamente cuando el colegio publique nuevos convenios.' }}
        </p>
      </section>
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
.convenios-screen {
  display: grid;
  gap: 20px;
  max-width: 980px;
}

.convenios-card {
  background: rgba(255, 255, 255, 0.94);
  border-color: #e2e8ec;
  border-radius: 20px;
  display: grid;
  gap: 14px;
  padding: clamp(18px, 2.2vw, 26px);
}

.convenios-card.unavailable {
  background: linear-gradient(135deg, rgba(var(--pa-primary-rgb), 0.05), rgba(255, 255, 255, 0.96));
}

.convenios-card > p {
  color: #6f798a;
  font-size: 0.84rem;
  line-height: 1.65;
  margin: 0;
  max-width: 72ch;
}

.pa-primary {
  background: var(--pa-primary);
  color: var(--pa-contrast);
}
</style>
