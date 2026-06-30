<template>
  <FamilyPersonasAutorizadasShell title="Convenios">
    <section class="convenios-screen">
      <FamilyPersonasPageHeader
        eyebrow="Familias"
        title="Convenios"
        :description="convenioAvailable ? 'Consulta los beneficios institucionales disponibles para tu familia.' : 'Los beneficios institucionales aparecerán aquí cuando estén disponibles.'"
        ambassador-variant="help"
        :ambassador-title="convenioAvailable ? 'Beneficios disponibles' : 'Sin acción necesaria'"
        :ambassador-message="convenioAvailable ? 'Abriré el catálogo institucional en una pestaña segura.' : 'Cuando el colegio publique convenios, este acceso se activará.'"
        :ambassador-tone="convenioAvailable ? 'success' : 'empty'"
      >
        <template v-if="convenioAvailable" #actions>
          <a class="btn btn-primary pa-primary" :href="activeConvenio.url" target="_blank" rel="noopener noreferrer">Abrir convenios</a>
        </template>
      </FamilyPersonasPageHeader>

      <section class="card convenios-card" :class="{ unavailable: !convenioAvailable }" data-product-panel="convenios" :data-state="convenioAvailable ? 'content' : 'unavailable'">
        <FamilyPersonasSectionHeading
          :title="activeConvenio.title || 'Beneficios institucionales'"
          :description="convenioAvailable ? `Disponible para ${scopeLabel}.` : 'No hay un catálogo publicado por el momento.'"
          :meta="convenioAvailable ? 'Disponible' : 'Próximamente'"
        />
        <p>
          {{ convenioAvailable
            ? (activeConvenio.summary || 'Revisa promociones, servicios y acuerdos vigentes para las familias de la comunidad escolar.')
            : 'No necesitas realizar ninguna acción. El acceso se habilitará automáticamente cuando el colegio publique nuevos convenios.' }}
        </p>
      </section>
    </section>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { useFetch } from 'nuxt/app'
import { computed } from 'vue'
import type { FamilyScopedContentResponse, GestionEscolarScopedContentItem } from '~/types/gestionEscolar'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })
const { data: response } = useFetch<FamilyScopedContentResponse>('/api/family/gestion-escolar/convenio', { key: 'pa-scoped-convenio', timeout: 15000 })
const emptyConvenio: GestionEscolarScopedContentItem = { id: '', kind: 'convenio', title: 'Beneficios institucionales', summary: '', url: '', embedUrl: '', status: 'inactive', isGlobal: false, plantel: null, nivel: null, grado: null, grupo: null, createdAt: '', updatedAt: '', scopeLabel: '' }
const activeConvenio = computed(() => response.value?.item || emptyConvenio)
const convenioAvailable = computed(() => Boolean(activeConvenio.value.url))
const scopeLabel = computed(() => response.value?.context.scopeLabel || 'tu familia')
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
