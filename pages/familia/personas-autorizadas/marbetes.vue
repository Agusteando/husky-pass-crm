<template>
  <FamilyPersonasAutorizadasShell title="Marbetes / descarga">
    <section class="card section-hero" data-product-panel="marbete-downloads">
      <div>
        <p class="eyebrow">Marbetes / descarga</p>
        <h1>Descarga de marbetes</h1>
        <p>Previsualiza o descarga los marbetes disponibles para personas autorizadas registradas.</p>
      </div>
      <img :src="mascot" alt="" />
    </section>

    <p v-if="loadError" class="alert" data-state="error">No fue posible cargar marbetes.</p>
    <div v-else-if="pending" class="card loading-row" data-product-loading>Cargando registros...</div>

    <section v-else class="marbete-grid" data-product-panel="marbete-list">
      <article v-for="person in people" :key="person.indice" class="card marbete-card" :data-state="person.id ? 'content' : 'unavailable'">
        <div class="person-thumb">
          <img v-if="photoUrl(person)" :src="photoUrl(person)" alt="" />
          <span v-else>{{ person.id ? initials(person) : '—' }}</span>
        </div>
        <div>
          <p class="eyebrow">{{ authorizedPersonLabel(person.indice) }}</p>
          <h2>{{ person.id ? fullName(person) || 'Registro guardado' : 'Registro pendiente' }}</h2>
          <p>{{ person.id ? 'Marbete disponible para previsualizar y descargar.' : 'Captura esta persona para habilitar marbete.' }}</p>
        </div>
        <div class="actions">
          <NuxtLink v-if="person.id" class="btn btn-secondary" :to="`/familia/personas-autorizadas/${person.id}/marbete`">Previsualizar</NuxtLink>
          <a v-if="person.id" class="btn btn-primary pa-primary" :href="`/api/personas-autorizadas/marbete?id=${person.id}&download=1`">Descargar</a>
          <button v-else class="btn btn-secondary" type="button" disabled data-unavailable-reason="Registro pendiente">No disponible</button>
        </div>
      </article>
    </section>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch } from 'nuxt/app'
import type { AuthorizedChild, AuthorizedPerson } from '~/types/daycare'
import type { PublicSession } from '~/types/session'
import { authorizedPersonLabel, normalizeVirtualAssetUrl } from '~/utils/daycare'
import { personasMascot, resolvePersonasTheme } from '~/utils/personasTheme'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })
const { data: session } = useFetch<PublicSession>('/api/auth/me', { key: 'pa-marbetes-session' })
const { data, pending, error: loadError } = useFetch<AuthorizedPerson[]>('/api/personas-autorizadas/family', { key: 'pa-marbetes-family-people', timeout: 15000 })
const people = computed(() => data.value || [])
const children = computed<AuthorizedChild[]>(() => people.value.find((person) => person.children?.length)?.children || [])
const primaryChild = computed(() => children.value.find((child) => child.isCurrent) || children.value[0] || null)
const theme = computed(() => resolvePersonasTheme({ plantel: primaryChild.value?.plantel || session.value?.user?.plantel?.[0], nivelEdu: primaryChild.value?.nivelEdu, campus: primaryChild.value?.campus || session.value?.user?.campus }))
const mascot = computed(() => personasMascot(theme.value, 'preview'))
function fullName(person: AuthorizedPerson | Partial<AuthorizedPerson>) { return [person.nombreP, person.paternoP, person.maternoP].filter(Boolean).join(' ') }
function initials(person: AuthorizedPerson | Partial<AuthorizedPerson>) { return (fullName(person) || 'PA').split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') }
function photoUrl(person: AuthorizedPerson | Partial<AuthorizedPerson>) { return normalizeVirtualAssetUrl(person.compressed_foto || person.foto || '') }
</script>

<style scoped>
.section-hero { align-items: center; background: linear-gradient(135deg, rgba(var(--pa-primary-rgb), .1), #fff); display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr) 130px; }
.section-hero img { max-height: 130px; object-fit: contain; }
.loading-row { border: 1px solid var(--pa-border); font-weight: 850; }
.marbete-grid { display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.marbete-card { display: grid; gap: 14px; grid-template-columns: 96px minmax(0, 1fr); }
.person-thumb { aspect-ratio: 1; background: var(--pa-soft); border: 1px solid var(--pa-border); border-radius: 18px; color: var(--pa-primary); display: grid; font-size: 1.5rem; font-weight: 950; overflow: hidden; place-items: center; }
.person-thumb img { height: 100%; object-fit: cover; width: 100%; }
.actions { display: flex; flex-wrap: wrap; gap: 8px; grid-column: 1 / -1; }
.pa-primary { background: var(--pa-primary); color: var(--pa-contrast); }
@media (max-width: 900px) { .section-hero, .marbete-grid, .marbete-card { grid-template-columns: 1fr; } .section-hero img { justify-self: start; } }
</style>
