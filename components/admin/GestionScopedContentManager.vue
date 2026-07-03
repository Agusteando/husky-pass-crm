<template>
  <section class="publishing-manager" :data-kind="kind">
    <header class="publishing-head">
      <div>
        <p class="eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
      <NuxtLink class="btn btn-secondary" to="/admin/gestion-escolar">Escolar</NuxtLink>
    </header>

    <section v-if="pending" class="state-panel" data-state="loading">
      <HuskyPassLoader :label="title" contained />
    </section>
    <section v-else-if="loadError" class="state-panel" data-state="error">
      <FamilyPersonasIcon name="security" />
      <h2>No disponible</h2>
      <p>No pudimos cargar este flujo de publicación.</p>
    </section>

    <section v-else class="publisher-layout">
      <form class="composer-panel" @submit.prevent="save">
        <div class="section-title">
          <span class="title-icon"><FamilyPersonasIcon :name="icon" /></span>
          <div>
            <p class="eyebrow">{{ form.id ? 'Editando' : 'Nueva publicación' }}</p>
            <h2>{{ form.title || defaultTitle }}</h2>
          </div>
        </div>

        <div class="status-steps" aria-label="Estado de publicación">
          <article :data-active="form.status === 'draft'"><strong>Borrador</strong><small>No visible</small></article>
          <article :data-active="form.status === 'scheduled'"><strong>Programado</strong><small>Listo por fecha</small></article>
          <article :data-active="form.status === 'active'"><strong>Publicado</strong><small>Visible</small></article>
        </div>

        <label class="field">
          <span>Título</span>
          <input v-model="form.title" :placeholder="defaultTitle" required />
        </label>
        <label class="field">
          <span>Resumen</span>
          <input v-model="form.summary" placeholder="Frase corta para familias" />
        </label>
        <label class="field">
          <span>{{ linkLabel }}</span>
          <input v-model="form.url" :placeholder="urlPlaceholder" required />
        </label>

        <section class="audience-panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Audiencia</p>
              <strong>{{ formatGestionScope(form.scope) }}</strong>
            </div>
            <span>{{ response?.permissions.canPublish ? 'Puede publicar' : 'Solo borrador' }}</span>
          </div>
          <AdminGestionScopePicker
            v-model="form.scope"
            :scope-tree="response?.options.scopeTree"
            :options="response?.options"
            :disabled="saving"
            compact
          />
        </section>

        <div class="status-row">
          <label :class="{ active: form.status === 'draft' }"><input v-model="form.status" type="radio" value="draft" /> Borrador</label>
          <label :class="{ active: form.status === 'scheduled' }"><input v-model="form.status" type="radio" value="scheduled" :disabled="!canActivate" /> Programado</label>
          <label :class="{ active: form.status === 'active' }"><input v-model="form.status" type="radio" value="active" :disabled="!canActivate" /> Publicado</label>
          <label :class="{ active: form.status === 'inactive' }"><input v-model="form.status" type="radio" value="inactive" /> Inactivo</label>
        </div>

        <label v-if="form.status === 'scheduled'" class="field">
          <span>Publicar desde</span>
          <input v-model="form.activeFrom" type="datetime-local" />
        </label>

        <p v-if="actionError" class="surface-message error">{{ actionError }}</p>
        <p v-else-if="actionNotice" class="surface-message">{{ actionNotice }}</p>
        <div class="actions">
          <button class="btn btn-secondary" type="button" :disabled="saving" @click="resetForm">Limpiar</button>
          <button class="btn btn-primary" type="submit" :disabled="saving || !response?.permissions.canManage || !form.scope.plantel">
            {{ saving ? 'Guardando...' : primaryActionLabel }}
          </button>
        </div>
      </form>

      <aside class="publishing-side">
        <article class="preview-panel" :data-status="form.status">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Vista previa</p>
              <h2>{{ form.title || defaultTitle }}</h2>
            </div>
            <span>{{ statusLabel(form.status) }}</span>
          </div>
          <p>{{ form.summary || previewFallback }}</p>
          <dl>
            <div><dt>Audiencia</dt><dd>{{ formatGestionScope(form.scope) }}</dd></div>
            <div><dt>{{ linkLabel }}</dt><dd>{{ form.url || urlPlaceholder }}</dd></div>
            <div><dt>Estado</dt><dd>{{ statusLabel(form.status) }}</dd></div>
          </dl>
        </article>

        <section class="publication-list">
          <div class="list-head">
            <div>
              <p class="eyebrow">Publicaciones</p>
              <h2>{{ response?.items.length || 0 }}</h2>
            </div>
            <button class="inline-action" type="button" @click="resetForm">Nueva</button>
          </div>

          <article v-for="item in response?.items" :key="item.id" class="publication-row" :data-status="item.status">
            <span class="row-icon"><FamilyPersonasIcon :name="icon" /></span>
            <div>
              <b>{{ item.title }}</b>
              <p>{{ item.summary || item.scopeLabel }}</p>
              <small>{{ statusLabel(item.status) }} · {{ item.scopeLabel }}</small>
            </div>
            <button class="inline-action" type="button" @click="edit(item)">Editar</button>
          </article>

          <div v-if="!response?.items.length" class="state-panel compact" data-state="empty">
            <FamilyPersonasIcon :name="icon" />
            <h3>Sin publicaciones</h3>
            <p>Cuando guardes un borrador aparecerá aquí.</p>
          </div>
        </section>
      </aside>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useFetch } from 'nuxt/app'
import type { GestionEscolarContentKind, GestionEscolarContentStatus, GestionEscolarScope, GestionEscolarScopedContentItem, GestionEscolarScopedContentResponse } from '~/types/gestionEscolar'
import { formatGestionScope } from '~/utils/gestionEscolar'

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
  status: 'draft' as GestionEscolarContentStatus,
  activeFrom: '',
  activeUntil: '',
  scope: { isGlobal: false, plantel: null, nivel: null, grado: null, grupo: null } as GestionEscolarScope
})

const defaultTitle = computed(() => props.kind === 'encuesta' ? 'Encuesta escolar' : 'Convenio para familias')
const urlPlaceholder = computed(() => props.kind === 'encuesta' ? 'https://docs.google.com/forms/...' : 'https://documento-publico...')
const linkLabel = computed(() => props.kind === 'encuesta' ? 'Formulario' : 'Documento')
const previewFallback = computed(() => props.kind === 'encuesta' ? 'Las familias verán esta encuesta cuando esté publicada.' : 'Las familias verán este documento cuando esté publicado.')
const canActivate = computed(() => response.value?.permissions.canPublish || props.kind === 'encuesta')
const primaryActionLabel = computed(() => {
  if (form.status === 'active') return 'Publicar'
  if (form.status === 'scheduled') return 'Programar'
  return 'Guardar borrador'
})

function resetForm() {
  Object.assign(form, {
    id: '',
    title: '',
    summary: '',
    url: '',
    status: 'draft' as GestionEscolarContentStatus,
    activeFrom: '',
    activeUntil: '',
    scope: { isGlobal: false, plantel: response.value?.options.planteles[0] || null, nivel: null, grado: null, grupo: null }
  })
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
    activeFrom: item.activeFrom ? item.activeFrom.slice(0, 16) : '',
    activeUntil: item.activeUntil ? item.activeUntil.slice(0, 16) : '',
    scope: { isGlobal: false, plantel: item.plantel || null, nivel: item.nivel || null, grado: item.grado || null, grupo: item.grupo || null }
  })
  actionNotice.value = ''
  actionError.value = ''
}

function statusLabel(status: GestionEscolarContentStatus) {
  if (status === 'active') return 'Publicado'
  if (status === 'inactive') return 'Inactivo'
  if (status === 'scheduled') return 'Programado'
  return 'Borrador'
}

async function save() {
  saving.value = true
  actionNotice.value = ''
  actionError.value = ''
  try {
    await $fetch('/api/admin/gestion-escolar/scoped-content', {
      method: 'POST',
      body: {
        ...form,
        activeFrom: form.activeFrom ? new Date(form.activeFrom).toISOString() : null,
        activeUntil: form.activeUntil ? new Date(form.activeUntil).toISOString() : null,
        ...form.scope,
        kind: props.kind,
        isGlobal: false
      }
    })
    actionNotice.value = form.status === 'active' ? 'Publicado.' : form.status === 'scheduled' ? 'Programado.' : 'Guardado.'
    resetForm()
    await refresh()
  } catch (error) {
    const failure = error as { data?: { statusMessage?: string; message?: string }; statusMessage?: string; message?: string }
    actionError.value = failure.data?.message || failure.data?.statusMessage || failure.statusMessage || failure.message || 'No pudimos guardar.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.publishing-manager {
  display: grid;
  gap: 16px;
}

.publishing-head,
.composer-panel,
.preview-panel,
.publication-list,
.state-panel {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #dce5eb;
  border-radius: 16px;
  box-shadow: 0 12px 34px rgba(15, 23, 42, 0.06);
}

.publishing-head {
  align-items: end;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: clamp(18px, 2.2vw, 28px);
}

.publishing-head h1,
.composer-panel h2,
.preview-panel h2,
.publication-list h2,
.state-panel h2,
.state-panel h3 {
  color: #152032;
  font-family: var(--font-body);
  margin: 0;
}

.publishing-head h1 {
  font-size: clamp(2rem, 3vw, 3.1rem);
}

.publishing-head p:not(.eyebrow),
.publication-row p,
.publication-row small,
.preview-panel p,
.preview-panel dd,
.status-steps small {
  color: #667789;
}

.publisher-layout {
  align-items: start;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(390px, 520px) minmax(0, 1fr);
}

.composer-panel,
.preview-panel,
.publication-list {
  display: grid;
  gap: 14px;
  padding: 16px;
}

.section-title,
.list-head,
.publication-row,
.actions,
.panel-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.section-title {
  justify-content: start;
}

.title-icon,
.row-icon {
  align-items: center;
  background: #eef7f5;
  border: 1px solid #cae2dc;
  border-radius: 12px;
  color: #0d766d;
  display: inline-flex;
  flex: 0 0 auto;
  height: 44px;
  justify-content: center;
  width: 44px;
}

.status-steps {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.status-steps article {
  background: #f8fafc;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  display: grid;
  gap: 3px;
  padding: 10px;
}

.status-steps article[data-active='true'] {
  background: #e7f8ef;
  border-color: #bfead0;
}

.field {
  display: grid;
  gap: 6px;
}

.field span,
.preview-panel dt {
  color: #6b7a8b;
  font-size: 0.72rem;
  font-weight: 850;
  text-transform: uppercase;
}

input {
  background: #ffffff;
  border: 1px solid #dce5eb;
  border-radius: 12px;
  color: #152032;
  min-height: 42px;
  min-width: 0;
  padding: 0 12px;
}

.audience-panel {
  background: #f8fafc;
  border: 1px solid #e1e8ed;
  border-radius: 14px;
  display: grid;
  gap: 12px;
  padding: 12px;
}

.panel-head strong {
  color: #152032;
  font-size: 0.92rem;
}

.panel-head span {
  background: #f4faf8;
  border: 1px solid #cae2dc;
  border-radius: 999px;
  color: #0d766d;
  font-size: 0.74rem;
  font-weight: 850;
  padding: 7px 10px;
}

.status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-row label {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e1e8ed;
  border-radius: 999px;
  color: #526173;
  display: inline-flex;
  font-weight: 850;
  gap: 7px;
  min-height: 38px;
  padding: 0 12px;
}

.status-row label.active {
  background: #e7f8ef;
  border-color: #bfead0;
  color: #15803d;
}

.publishing-side {
  display: grid;
  gap: 16px;
  position: sticky;
  top: calc(var(--topbar-height) + 18px);
}

.preview-panel dl {
  display: grid;
  gap: 10px;
  margin: 0;
}

.preview-panel dl div {
  border-top: 1px solid #e1e8ed;
  display: grid;
  gap: 2px;
  padding-top: 8px;
}

.preview-panel dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.publication-row {
  border: 1px solid #e1e8ed;
  border-radius: 13px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  padding: 12px;
}

.publication-row[data-status='active'] {
  border-color: #bfead0;
}

.publication-row[data-status='scheduled'] {
  border-color: #f3d589;
}

.publication-row b,
.publication-row small {
  display: block;
}

.inline-action {
  background: #ffffff;
  border: 1px solid #cfe0e7;
  border-radius: 10px;
  color: #0d766d;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 850;
  min-height: 34px;
  padding: 0 11px;
}

.surface-message {
  background: #edfdf7;
  border: 1px solid #b7ead6;
  border-radius: 12px;
  color: #047857;
  padding: 10px 12px;
}

.surface-message.error {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #be123c;
}

.state-panel {
  color: #667789;
  display: grid;
  gap: 9px;
  min-height: 220px;
  place-items: center;
  padding: 24px;
  text-align: center;
}

.state-panel.compact {
  min-height: 160px;
}

@media (max-width: 1120px) {
  .publisher-layout {
    grid-template-columns: 1fr;
  }

  .publishing-side {
    position: static;
  }

  .publishing-head,
  .actions,
  .panel-head {
    align-items: stretch;
    flex-direction: column;
  }
}

@media (max-width: 740px) {
  .status-steps,
  .publication-row {
    grid-template-columns: 1fr;
  }
}
</style>
