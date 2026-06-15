<template>
  <main
    class="identity-lab"
    :style="vars"
    :data-experience="identity.context.experience"
    :data-institution="identity.context.institution || 'neutral'"
    :data-nivel="identity.context.nivel || 'neutral'"
    :data-state="state"
  >
    <header class="lab-topbar">
      <BrandMark to="/__dev/identity-matrix" :logo="identity.assets.logo" :alt="identity.label" />
      <div>
        <p class="eyebrow">{{ identity.officialName }}</p>
        <h1>{{ identity.label }} · {{ identity.levelLabel }}</h1>
        <small>{{ contextLine }}</small>
      </div>
    </header>

    <section class="lab-grid">
      <article class="lab-panel">
        <p class="eyebrow">Navegación</p>
        <nav class="lab-nav" aria-label="Navegación de prueba">
          <a class="active" href="#">Inicio</a>
          <a href="#">Datos</a>
          <a href="#">Seguridad</a>
        </nav>
      </article>

      <article class="lab-panel state-panel">
        <p class="eyebrow">Estado</p>
        <div v-if="state === 'loading'" class="state-box">Cargando contexto...</div>
        <div v-else-if="state === 'error'" class="alert">No fue posible resolver la identidad.</div>
        <div v-else-if="state === 'empty'" class="state-box">Sin información disponible.</div>
        <div v-else class="state-box">Contexto resuelto.</div>
      </article>

      <article class="lab-panel asset-panel">
        <p class="eyebrow">Assets permitidos</p>
        <img class="asset-logo" :src="identity.assets.logo" :alt="identity.label" data-identity-asset="logo" />
        <img v-if="identity.assets.ambassador" class="asset-ambassador" :src="identity.assets.ambassador" alt="" data-identity-asset="ambassador" />
        <ul>
          <li v-for="family in identity.allowedAssetFamilies" :key="family">{{ family }}</li>
        </ul>
      </article>

      <article class="lab-panel">
        <p class="eyebrow">Formulario</p>
        <label class="label">
          Campo de prueba
          <input class="input" value="Dato realista" />
        </label>
        <button class="btn btn-primary" type="button">Acción primaria</button>
      </article>
    </section>

    <FamilyPersonasModal
      v-if="modal"
      title="Modal de identidad"
      eyebrow="Contexto heredado"
      description="Este modal consume el tema activo."
      :theme="theme"
      @close="modal = false"
    >
      <p class="modal-copy">Experiencia: {{ identity.officialName }}. Institución: {{ identity.context.institution || 'neutral' }}.</p>
      <button class="btn btn-primary" type="button" @click="modal = false">Aceptar</button>
    </FamilyPersonasModal>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'nuxt/app'
import { experienceThemeVars, normalizeExperienceName, normalizeInstitutionName, visualIdentityForContext } from '~/utils/experienceIdentity'
import { resolvePersonasTheme } from '~/utils/personasTheme'

definePageMeta({ middleware: 'dev-only' })

const route = useRoute()
const router = useRouter()
const state = computed(() => String(route.query.state || 'content'))
const modal = ref(String(route.query.modal || '') === '1')
const experience = computed(() => normalizeExperienceName(String(route.query.experience || 'escolar')) || 'escolar')
const context = computed(() => ({
  experience: experience.value,
  institution: experience.value === 'escolar' ? normalizeInstitutionName(String(route.query.institution || '')) : null,
  nivel: String(route.query.nivel || (experience.value === 'guarderia' ? 'guarderia' : '')).trim() || null,
  plantel: String(route.query.plantel || '').trim() || null,
  grupo: String(route.query.grupo || '').trim() || null
}))
const identity = computed(() => visualIdentityForContext(context.value))
const vars = computed(() => experienceThemeVars(identity.value))
const theme = computed(() => resolvePersonasTheme({
  experience: context.value.experience,
  institution: context.value.institution,
  nivelEdu: context.value.nivel,
  plantel: context.value.plantel,
  grupo: context.value.grupo
}))
const contextLine = computed(() => [
  identity.value.context.experience,
  identity.value.context.institution,
  identity.value.context.nivel,
  identity.value.context.plantel,
  identity.value.context.grupo
].filter(Boolean).join(' / ') || 'Contexto neutral')

watch(modal, (value) => {
  if (String(route.query.modal || '') === (value ? '1' : '')) return
  router.replace({ path: route.path, query: { ...route.query, modal: value ? '1' : undefined } })
})
</script>

<style scoped>
.identity-lab {
  background: linear-gradient(180deg, #fff, var(--color-page));
  color: var(--color-ink);
  display: grid;
  gap: 14px;
  min-height: 100vh;
  padding: clamp(14px, 2vw, 22px);
}

.lab-topbar {
  align-items: center;
  background: rgba(255, 255, 255, .96);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  display: grid;
  gap: 12px;
  grid-template-columns: max-content minmax(0, 1fr);
  padding: 12px;
}

.lab-topbar h1,
.lab-topbar small {
  margin: 0;
}

.lab-topbar small {
  color: var(--color-muted);
}

.lab-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.lab-panel {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  display: grid;
  gap: 10px;
  padding: 14px;
}

.lab-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.lab-nav a {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-muted);
  padding: 8px 10px;
}

.lab-nav a.active {
  background: var(--color-brand-100);
  color: var(--color-brand-800);
}

.state-box {
  background: var(--color-brand-100);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-brand-800);
  padding: 12px;
}

.asset-panel {
  align-content: start;
}

.asset-logo {
  height: 54px;
  object-fit: contain;
  object-position: left center;
  width: 140px;
}

.asset-ambassador {
  height: 96px;
  justify-self: start;
  object-fit: contain;
}

.asset-panel ul {
  color: var(--color-muted);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.asset-panel li {
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 4px 8px;
}

.modal-copy {
  color: var(--pa-gray);
  margin-bottom: 12px;
}

@media (max-width: 760px) {
  .lab-grid,
  .lab-topbar {
    grid-template-columns: 1fr;
  }
}
</style>
