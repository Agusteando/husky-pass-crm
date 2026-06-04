<template>
  <FamilyPersonasAutorizadasShell title="Hermanos / vinculación familiar">
    <section class="card section-hero" data-product-panel="siblings-hero">
      <div>
        <p class="eyebrow">Vinculación familiar</p>
        <h1>Hermanos</h1>
        <p>Consulta los alumnos vinculados a la cuenta familiar. Cuando la vinculación no esté disponible, el control queda explícitamente inactivo.</p>
      </div>
      <img :src="mascot" alt="" />
    </section>

    <p v-if="loadError" class="alert" data-state="error">No fue posible cargar la vinculación familiar.</p>
    <div v-else-if="pending" class="card loading-row" data-product-loading>Cargando alumnos...</div>

    <section v-else class="card sibling-list" data-product-panel="siblings" :data-state="children.length > 1 ? 'content' : 'unavailable'">
      <header class="section-head">
        <div>
          <p class="eyebrow">Alumnos vinculados</p>
          <h2>{{ children.length > 1 ? `${children.length} alumnos vinculados` : 'Sin hermanos adicionales' }}</h2>
        </div>
        <button class="btn btn-secondary" type="button" disabled data-unavailable-reason="La vinculación se administra por el colegio">Vinculación administrada</button>
      </header>
      <article v-for="child in children" :key="child.id || childName(child)" class="sibling-card">
        <strong>{{ childName(child) || 'Alumno' }}</strong>
        <span>{{ [child.plantel, child.nivelEdu, child.grado, child.grupo].filter(Boolean).join(' / ') || 'Datos pendientes' }}</span>
      </article>
      <div v-if="!children.length" class="empty-state">
        <img :src="mascot" alt="" />
        <p>No hay alumnos vinculados disponibles para esta cuenta.</p>
      </div>
    </section>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch } from 'nuxt/app'
import type { AuthorizedChild, AuthorizedPerson } from '~/types/daycare'
import type { PublicSession } from '~/types/session'
import { personasMascot, resolvePersonasTheme } from '~/utils/personasTheme'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })
const { data: session } = useFetch<PublicSession>('/api/auth/me', { key: 'pa-siblings-session' })
const { data: people, pending, error: loadError } = useFetch<AuthorizedPerson[]>('/api/personas-autorizadas/family', { key: 'pa-siblings-family-people', timeout: 15000 })
const children = computed<AuthorizedChild[]>(() => people.value?.find((person) => person.children?.length)?.children || [])
const primaryChild = computed(() => children.value[0] || null)
const theme = computed(() => resolvePersonasTheme({ plantel: primaryChild.value?.plantel || session.value?.user?.plantel?.[0], nivelEdu: primaryChild.value?.nivelEdu, campus: primaryChild.value?.campus || session.value?.user?.campus }))
const mascot = computed(() => personasMascot(theme.value))
function childName(child: AuthorizedChild) {
  return [child.nombreA, child.paternoA, child.maternoA].filter(Boolean).join(' ')
}
</script>

<style scoped>
.section-hero,
.section-head {
  align-items: center;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1fr) auto;
}
.section-hero { background: linear-gradient(135deg, rgba(var(--pa-primary-rgb), .1), #fff); }
.section-hero img { max-height: 130px; object-fit: contain; }
.loading-row { border: 1px solid var(--pa-border); font-weight: 850; }
.sibling-list { display: grid; gap: 12px; }
.section-head h2 { margin-bottom: 0; }
.sibling-card { background: #f8f8f6; border: 1px solid #ecece7; border-radius: 16px; display: grid; gap: 4px; padding: 14px; }
.sibling-card strong { color: var(--pa-gray); }
.sibling-card span { color: var(--pa-muted); font-weight: 800; }
.empty-state { align-items: center; background: var(--pa-soft); border: 1px solid var(--pa-border); border-radius: 18px; display: flex; gap: 12px; padding: 14px; }
.empty-state img { height: 84px; object-fit: contain; }
@media (max-width: 760px) { .section-hero, .section-head { grid-template-columns: 1fr; } .section-hero img { justify-self: start; } }
</style>
