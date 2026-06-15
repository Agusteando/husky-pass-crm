<template>
  <main class="dev-modal-page" :style="themeVars" data-product-area="dev-personas-modals">
    <header class="modal-lab-head">
      <div>
        <p class="eyebrow">Dev harness</p>
        <h1>Personas Autorizadas Modals</h1>
      </div>
      <NuxtLink to="/__dev/husky-pass">PDF Lab</NuxtLink>
    </header>

    <section class="modal-controls">
      <label>
        Tema
        <select v-model="themeKey" data-diagnostic-field="dev-modal-theme">
          <option v-for="item in themes" :key="item.key" :value="item.key">{{ item.label }}</option>
        </select>
      </label>
      <label>
        Modal
        <select v-model="mode" data-diagnostic-field="dev-modal-mode">
          <option value="edit">Editar persona</option>
          <option value="delete">Eliminar</option>
          <option value="busy">Guardando</option>
        </select>
      </label>
    </section>

    <section class="theme-stage">
      <img :src="institutionLogo" :alt="institutionName" />
      <div>
        <p class="eyebrow">{{ selectedTheme.label }}</p>
        <h2>{{ institutionName }} / {{ selectedTheme.shortLabel }}</h2>
      </div>
    </section>

    <FamilyPersonasModal
      v-if="!closed"
      :title="mode === 'delete' ? 'Eliminar registro' : 'Persona 1'"
      :eyebrow="selectedTheme.label"
      :theme="selectedTheme"
      :close-disabled="mode === 'busy'"
      @close="closed = true"
    >
      <FamilyAuthorizedPersonEditor
        v-if="mode !== 'delete'"
        :person="samplePerson"
        label="Persona 1"
        :saving="mode === 'busy'"
        :server-error="mode === 'busy' ? '' : ''"
        @busy="noop"
        @save="noop"
        @cancel="closed = true"
      />
      <section v-else class="delete-confirm">
        <p>{{ sampleName }}</p>
        <small>Tambien dejara de estar disponible para el Husky Pass.</small>
        <div class="actions">
          <button class="btn btn-danger" type="button">Eliminar</button>
          <button class="btn btn-secondary" type="button" @click="closed = true">Cancelar</button>
        </div>
      </section>
    </FamilyPersonasModal>

    <button v-if="closed" class="reopen" type="button" @click="closed = false">Abrir modal</button>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'nuxt/app'
import type { AuthorizedPerson, PersonasThemeKey } from '~/types/daycare'
import { allPersonasThemes, personasInstitutionLogo, personasInstitutionName, personasThemeStyle } from '~/utils/personasTheme'

if (process.env.NODE_ENV === 'production') {
  throw createError({ statusCode: 404, statusMessage: 'Ruta no disponible.' })
}

definePageMeta({ layout: false, middleware: 'dev-only' })

const route = useRoute()
const router = useRouter()
const themes = allPersonasThemes()
const themeKey = ref((typeof route.query.theme === 'string' ? route.query.theme : 'escolar') as PersonasThemeKey)
const mode = ref(typeof route.query.mode === 'string' ? route.query.mode : 'edit')
const closed = ref(false)

const selectedTheme = computed(() => themes.find((theme) => theme.key === themeKey.value) || themes[0])
const themeVars = computed(() => personasThemeStyle(selectedTheme.value))
const institutionLogo = computed(() => personasInstitutionLogo(selectedTheme.value))
const institutionName = computed(() => personasInstitutionName(selectedTheme.value))
const samplePerson = computed<Partial<AuthorizedPerson>>(() => ({
  id: 101,
  indice: 1,
  nombreP: selectedTheme.value.key === 'secundaria' ? 'Lucia Fernanda' : 'Sofia',
  paternoP: 'Lopez',
  maternoP: 'Garcia',
  parenP: selectedTheme.value.key === 'daycare' ? 'Nana' : 'Tia',
  fechaP: '2026-08-19',
  foto: `/api/dev/husky-pass/photo?seed=modal-${selectedTheme.value.key}&theme=${selectedTheme.value.key}&label=PA&mode=portrait`
}))
const sampleName = computed(() => [samplePerson.value.nombreP, samplePerson.value.paternoP, samplePerson.value.maternoP].filter(Boolean).join(' '))

watch([themeKey, mode], () => {
  closed.value = false
  if (!import.meta.client) return
  router.replace({ path: route.path, query: { theme: themeKey.value, mode: mode.value } })
})

function noop() {}
</script>

<style scoped>
.dev-modal-page {
  background:
    linear-gradient(180deg, #ffffff, rgba(var(--pa-primary-rgb), .08));
  color: #1f2933;
  display: grid;
  gap: 14px;
  min-height: 100vh;
  padding: 16px;
}

.modal-lab-head,
.modal-controls,
.theme-stage {
  background: #fff;
  border: 1px solid var(--pa-border);
  border-radius: 8px;
  display: grid;
  gap: 12px;
  padding: 14px;
}

.modal-lab-head {
  align-items: end;
  grid-template-columns: minmax(0, 1fr) auto;
}

.modal-lab-head h1,
.modal-lab-head p,
.theme-stage h2,
.theme-stage p {
  margin: 0;
}

.modal-lab-head a,
.reopen {
  background: var(--pa-primary);
  border: 0;
  border-radius: 7px;
  color: var(--pa-contrast);
  cursor: pointer;
  font-weight: 700;
  padding: 9px 12px;
}

.modal-controls {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.modal-controls label {
  color: var(--pa-gray);
  display: grid;
  font-size: .78rem;
  font-weight: 700;
  gap: 6px;
  text-transform: uppercase;
}

.modal-controls select {
  border: 1px solid var(--pa-border);
  border-radius: 7px;
  min-height: 38px;
  padding: 8px 10px;
  text-transform: none;
}

.theme-stage {
  align-items: center;
  grid-template-columns: 54px minmax(0, 1fr);
}

.theme-stage img {
  height: 48px;
  object-fit: contain;
  width: 48px;
}

.eyebrow {
  color: var(--pa-primary);
  font-size: .75rem;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.delete-confirm {
  display: grid;
  gap: 12px;
}

.delete-confirm p,
.delete-confirm small {
  margin: 0;
}

.delete-confirm small {
  color: var(--pa-muted);
  font-weight: 700;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.reopen {
  justify-self: start;
}

@media (max-width: 720px) {
  .modal-lab-head,
  .modal-controls {
    grid-template-columns: 1fr;
  }
}
</style>
