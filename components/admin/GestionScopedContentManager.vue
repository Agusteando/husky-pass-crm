<template>
  <section class="scoped-manager" :data-kind="kind">
    <header class="module-hero">
      <div>
        <p class="eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
      <NuxtLink class="btn btn-secondary" to="/admin/gestion-escolar">Vista general</NuxtLink>
    </header>

    <section v-if="pending" class="state-card" data-state="loading">Cargando configuracion...</section>
    <section v-else-if="loadError" class="state-card" data-state="error">No pudimos cargar este modulo. Intenta nuevamente.</section>
    <section v-else class="manager-grid">
      <form class="editor-card" @submit.prevent="save">
        <div class="section-head">
          <span><FamilyPersonasIcon :name="icon" /></span>
          <div>
            <h2>{{ form.id ? 'Editar configuracion' : 'Nueva configuracion' }}</h2>
            <p>{{ permissionCopy }}</p>
          </div>
        </div>

        <input v-model="form.title" :placeholder="kind === 'encuesta' ? 'Encuesta de clima escolar' : 'Convenios para familias'" required />
        <input v-model="form.summary" placeholder="Descripcion breve para operacion interna" />
        <input v-model="form.url" :placeholder="urlPlaceholder" required />

        <div class="scope-grid">
          <label class="global-toggle"><input v-model="form.isGlobal" type="checkbox" /> Global</label>
          <input v-model="form.plantel" :disabled="form.isGlobal" placeholder="Plantel" />
          <input v-model="form.nivel" :disabled="form.isGlobal" placeholder="Nivel" />
          <input v-model="form.grado" :disabled="form.isGlobal" placeholder="Grado" />
          <input v-model="form.grupo" :disabled="form.isGlobal" placeholder="Grupo" />
        </div>

        <div class="status-row">
          <label><input v-model="form.status" type="radio" value="draft" /> Borrador</label>
          <label><input v-model="form.status" type="radio" value="active" :disabled="!canActivate" /> Activo</label>
          <label><input v-model="form.status" type="radio" value="inactive" /> Pausado</label>
        </div>

        <p v-if="actionError" class="action-message error">{{ actionError }}</p>
        <p v-else-if="actionNotice" class="action-message">{{ actionNotice }}</p>
        <button class="btn btn-primary" type="submit" :disabled="saving || !response?.permissions.canManage">
          {{ saving ? 'Guardando...' : 'Guardar configuracion' }}
        </button>
      </form>

      <section class="content-list">
        <div class="list-head">
          <div>
            <p class="eyebrow">Activos y borradores</p>
            <h2>{{ response?.items.length || 0 }} configuraciones</h2>
          </div>
          <button class="mini-button" type="button" @click="resetForm">Nueva</button>
        </div>
        <article v-for="item in response?.items" :key="item.id" class="content-row">
          <span class="row-icon"><FamilyPersonasIcon :name="icon" /></span>
          <div>
            <b>{{ item.title }}</b>
            <p>{{ item.summary || item.scopeLabel }}</p>
            <small>{{ item.status }} · {{ item.scopeLabel }}</small>
          </div>
          <button class="mini-button" type="button" @click="edit(item)">Editar</button>
        </article>
        <div v-if="!response?.items.length" class="state-card compact" data-state="empty">
          <FamilyPersonasIcon :name="icon" />
          <h3>Sin configuraciones dentro de tu alcance</h3>
          <p>Crea una version global o segmentada para que las familias correctas la vean.</p>
        </div>
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useFetch } from 'nuxt/app'
import type { GestionEscolarContentKind, GestionEscolarScopedContentItem, GestionEscolarScopedContentResponse } from '~/types/gestionEscolar'

const props = defineProps<{
  kind: GestionEscolarContentKind
  eyebrow: string
  title: string
  description: string
  icon: string
}>()

const { data: response, pending, error: loadError, refresh } = useFetch<GestionEscolarScopedContentResponse>('/api/admin/gestion-escolar/scoped-content', {
  query: computed(() => ({ kind: props.kind })),
  timeout: 15000
})

const saving = ref(false)
const actionNotice = ref('')
const actionError = ref('')
const form = reactive({
  id: '',
  title: '',
  summary: '',
  url: '',
  status: 'draft',
  isGlobal: false,
  plantel: '',
  nivel: '',
  grado: '',
  grupo: ''
})

const urlPlaceholder = computed(() => props.kind === 'encuesta' ? 'https://docs.google.com/forms/...' : 'https://publicacion-o-flipbook...')
const canActivate = computed(() => response.value?.permissions.canPublish || props.kind === 'encuesta')
const permissionCopy = computed(() => {
  if (!response.value?.permissions.canManage) return 'Tu acceso permite consultar, pero no editar.'
  if (props.kind === 'convenio' && !response.value.permissions.canPublish) return 'Puedes preparar convenios; publicar requiere capacidad adicional.'
  return 'Puedes configurar contenido dentro de tu alcance.'
})

function resetForm() {
  Object.assign(form, { id: '', title: '', summary: '', url: '', status: 'draft', isGlobal: false, plantel: '', nivel: '', grado: '', grupo: '' })
  actionNotice.value = ''
  actionError.value = ''
}

function edit(item: GestionEscolarScopedContentItem) {
  Object.assign(form, {
    id: item.id,
    title: item.title,
    summary: item.summary,
    url: item.url,
    status: item.status,
    isGlobal: Boolean(item.isGlobal),
    plantel: item.plantel || '',
    nivel: item.nivel || '',
    grado: item.grado || '',
    grupo: item.grupo || ''
  })
}

async function save() {
  saving.value = true
  actionNotice.value = ''
  actionError.value = ''
  try {
    await $fetch('/api/admin/gestion-escolar/scoped-content', {
      method: 'POST',
      body: { ...form, kind: props.kind }
    })
    actionNotice.value = 'Configuracion guardada.'
    resetForm()
    await refresh()
  } catch (error) {
    const failure = error as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    actionError.value = failure.data?.statusMessage || failure.statusMessage || failure.message || 'No pudimos guardar la configuracion.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.scoped-manager {
  display: grid;
  gap: 18px;
}

.module-hero,
.editor-card,
.content-list,
.state-card {
  background: rgba(255, 255, 255, .96);
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, .07);
}

.module-hero {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: clamp(20px, 2.6vw, 34px);
}

.eyebrow {
  color: #0f8c9a;
  font-size: .72rem;
  font-weight: 850;
  letter-spacing: .12em;
  margin: 0 0 6px;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  color: #17233b;
  font-size: clamp(2rem, 3vw, 3.2rem);
}

.module-hero p,
.section-head p,
.content-row p,
.content-row small,
.state-card p {
  color: #64748b;
  font-weight: 650;
  line-height: 1.5;
}

.manager-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(360px, 460px) minmax(0, 1fr);
}

.editor-card,
.content-list {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.section-head,
.list-head,
.content-row {
  align-items: center;
  display: flex;
  gap: 12px;
}

.list-head {
  justify-content: space-between;
}

.section-head > span,
.row-icon {
  background: #fff7df;
  border: 1px solid #f3d589;
  border-radius: 14px;
  color: #b98000;
  display: grid;
  flex: 0 0 auto;
  height: 44px;
  place-items: center;
  width: 44px;
}

input {
  background: #fff;
  border: 1px solid #d9e2ea;
  border-radius: 14px;
  color: #17233b;
  min-height: 42px;
  min-width: 0;
  padding: 0 12px;
}

.scope-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: auto repeat(4, minmax(0, 1fr));
}

.global-toggle,
.status-row label {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  display: inline-flex;
  font-weight: 850;
  gap: 7px;
  min-height: 42px;
  padding: 0 12px;
}

.status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.content-row {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  padding: 12px;
}

.content-row b,
.content-row small {
  display: block;
}

.mini-button {
  background: #fff;
  border: 1px solid #cfe0e7;
  border-radius: 12px;
  color: #0f8c9a;
  font-weight: 850;
  min-height: 38px;
  padding: 0 12px;
}

.action-message {
  background: #edfdf7;
  border: 1px solid #b7ead6;
  border-radius: 14px;
  color: #047857;
  padding: 10px 12px;
}

.action-message.error {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #be123c;
}

.state-card {
  display: grid;
  gap: 8px;
  min-height: 220px;
  place-items: center;
  padding: 24px;
  text-align: center;
}

.state-card.compact {
  min-height: 160px;
}

@media (max-width: 1100px) {
  .manager-grid,
  .scope-grid {
    grid-template-columns: 1fr;
  }

  .module-hero {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
