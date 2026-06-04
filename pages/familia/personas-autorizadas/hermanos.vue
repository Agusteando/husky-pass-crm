<template>
  <FamilyPersonasAutorizadasShell title="Hermanos / vinculación familiar">
    <section class="card section-hero" data-product-panel="siblings-hero">
      <div>
        <p class="eyebrow">Vinculación familiar</p>
        <h1>Hermanos</h1>
        <p>Los alumnos se vinculan por coincidencia completa del nombre del padre y de la madre en matrícula. Si los datos parentales están incompletos, no se habilita la vinculación automática.</p>
      </div>
      <img :src="mascot" alt="" />
    </section>

    <p v-if="loadError" class="alert" data-state="error">No fue posible cargar la vinculación familiar.</p>
    <div v-else-if="pending" class="card loading-row" data-product-loading>Cargando alumnos...</div>

    <section v-else class="card sibling-list" data-product-panel="siblings" :data-state="siblingsState">
      <header class="section-head">
        <div>
          <p class="eyebrow">Alumnos vinculados</p>
          <h2>{{ siblingTitle }}</h2>
        </div>
      </header>

      <article v-for="child in children" :key="child.matricula || child.id || childName(child)" class="sibling-card" :class="{ current: child.isCurrent }">
        <div class="sibling-photo">
          <img v-if="child.foto" :src="normalizeVirtualAssetUrl(child.foto)" alt="" />
          <strong v-else>{{ initials(child) }}</strong>
        </div>
        <div>
          <p class="eyebrow">{{ child.isCurrent ? 'Alumno actual' : 'Vinculado por padres' }}</p>
          <strong>{{ childName(child) || 'Alumno' }}</strong>
          <span>{{ [child.plantel, child.nivelEdu, child.grado, child.grupo].filter(Boolean).join(' / ') || 'Datos pendientes' }}</span>
          <small v-if="child.matricula">Matrícula {{ child.matricula }}</small>
        </div>
        <button
          v-if="!child.isCurrent"
          class="btn btn-primary pa-primary"
          type="button"
          :disabled="switching || !child.canSwitch"
          :data-unavailable-reason="child.canSwitch ? undefined : 'Sin cuenta familiar activa para cambio directo'"
          data-diagnostic-action="cambiar-alumno-vinculado"
          @click="switchToChild(child)"
        >
          {{ child.canSwitch ? 'Entrar' : 'No disponible' }}
        </button>
      </article>

      <div v-if="showUnavailable" class="empty-state">
        <img :src="emptyMascot" alt="" />
        <p>La vinculación automática requiere nombre y apellidos completos de ambos padres en matrícula.</p>
      </div>
    </section>

    <p v-if="error" class="alert">{{ error }}</p>
    <p v-if="notice" class="notice">{{ notice }}</p>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFetch } from 'nuxt/app'
import type { AuthorizedChild, AuthorizedPerson } from '~/types/daycare'
import type { PublicSession } from '~/types/session'
import { normalizeVirtualAssetUrl } from '~/utils/daycare'
import { personasMascot, resolvePersonasTheme } from '~/utils/personasTheme'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })
const { data: session } = useFetch<PublicSession>('/api/auth/me', { key: 'pa-siblings-session' })
const { data: people, pending, error: loadError } = useFetch<AuthorizedPerson[]>('/api/personas-autorizadas/family', { key: 'pa-siblings-family-people', timeout: 15000 })
const switching = ref(false)
const error = ref('')
const notice = ref('')
const children = computed<AuthorizedChild[]>(() => people.value?.find((person) => person.children?.length)?.children || [])
const primaryChild = computed(() => children.value.find((child) => child.isCurrent) || children.value[0] || null)
const theme = computed(() => resolvePersonasTheme({ plantel: primaryChild.value?.plantel || session.value?.user?.plantel?.[0], nivelEdu: primaryChild.value?.nivelEdu, campus: primaryChild.value?.campus || session.value?.user?.campus }))
const mascot = computed(() => personasMascot(theme.value, 'hero'))
const emptyMascot = computed(() => personasMascot(theme.value, 'empty'))
const hasParentMatch = computed(() => children.value.some((child) => child.siblingMatch === 'parents'))
const showUnavailable = computed(() => !hasParentMatch.value || children.value.length <= 1)
const siblingsState = computed(() => hasParentMatch.value && children.value.length > 1 ? 'content' : 'unavailable')
const siblingTitle = computed(() => {
  if (hasParentMatch.value && children.value.length > 1) return `${children.value.length} alumnos vinculados`
  return 'Sin hermanos adicionales disponibles'
})

function childName(child: AuthorizedChild) {
  return [child.nombreA, child.paternoA, child.maternoA].filter(Boolean).join(' ')
}

function initials(child: AuthorizedChild) {
  const name = childName(child) || 'A'
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
}

async function switchToChild(child: AuthorizedChild) {
  if (!child.matricula || !child.canSwitch) return
  switching.value = true
  error.value = ''
  notice.value = ''
  try {
    await $fetch('/api/personas-autorizadas/sibling-session', {
      method: 'POST',
      body: { matricula: child.matricula }
    })
    notice.value = 'Alumno seleccionado.'
    if (import.meta.client) window.location.href = '/familia/personas-autorizadas'
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible cambiar de alumno.'
  } finally {
    switching.value = false
  }
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
.loading-row,
.notice { border: 1px solid var(--pa-border); font-weight: 850; }
.notice { background: var(--pa-soft); border-radius: 14px; margin: 0; padding: 10px 12px; }
.sibling-list { display: grid; gap: 12px; }
.section-head h2 { margin-bottom: 0; }
.pa-primary { background: var(--pa-primary); color: var(--pa-contrast); }
.sibling-card {
  align-items: center;
  background: #f8f8f6;
  border: 1px solid #ecece7;
  border-radius: 18px;
  display: grid;
  gap: 14px;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  padding: 14px;
}
.sibling-card.current { background: var(--pa-soft); border-color: var(--pa-border); }
.sibling-photo { aspect-ratio: 1; background: #fff; border: 1px solid var(--pa-border); border-radius: 16px; color: var(--pa-primary); display: grid; font-weight: 950; overflow: hidden; place-items: center; }
.sibling-photo img { height: 100%; object-fit: cover; width: 100%; }
.sibling-card strong { color: var(--pa-gray); display: block; }
.sibling-card span,
.sibling-card small { color: var(--pa-muted); display: block; font-weight: 800; }
.empty-state { align-items: center; background: var(--pa-soft); border: 1px solid var(--pa-border); border-radius: 18px; display: flex; gap: 12px; padding: 14px; }
.empty-state img { height: 84px; object-fit: contain; }
@media (max-width: 760px) { .section-hero, .section-head, .sibling-card { grid-template-columns: 1fr; } .section-hero img { justify-self: start; } .sibling-photo { width: 82px; } }
</style>
