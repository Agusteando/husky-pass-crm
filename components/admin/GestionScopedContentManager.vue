<template>
  <section class="publishing-manager" :data-kind="kind">
    <header class="module-hero">
      <div>
        <p class="eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
      <NuxtLink class="btn btn-secondary" to="/admin/gestion-escolar">Workbench</NuxtLink>
    </header>

    <section v-if="pending" class="state-card" data-state="loading"><HuskyPassLoader :label="title" contained /></section>
    <section v-else-if="loadError" class="state-card" data-state="error">
      <FamilyPersonasIcon name="security" />
      <h2>No disponible</h2>
      <p>No pudimos cargar este flujo de publicación.</p>
    </section>

    <section v-else class="manager-layout">
      <form class="composer-card" @submit.prevent="save">
        <div class="section-head">
          <span><FamilyPersonasIcon :name="icon" /></span>
          <div>
            <p class="eyebrow">{{ form.id ? 'Editando' : 'Nueva publicación' }}</p>
            <h2>{{ form.title || defaultTitle }}</h2>
          </div>
        </div>

        <div class="status-guide">
          <article :data-active="form.status === 'draft'"><strong>Borrador</strong><small>Preparar sin mostrar a familias.</small></article>
          <article :data-active="form.status === 'scheduled'"><strong>Programado</strong><small>Listo para activarse por fecha.</small></article>
          <article :data-active="form.status === 'active'"><strong>Activo</strong><small>Visible para la audiencia.</small></article>
        </div>

        <label class="field">
          <span>Título</span>
          <input v-model="form.title" :placeholder="defaultTitle" required />
        </label>
        <label class="field">
          <span>Resumen</span>
          <input v-model="form.summary" placeholder="Frase corta visible para admins y familias" />
        </label>
        <label class="field">
          <span>Enlace</span>
          <input v-model="form.url" :placeholder="urlPlaceholder" required />
        </label>

        <section class="audience-panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Audiencia</p>
              <strong>{{ formatGestionScope(form.scope) }}</strong>
            </div>
            <span>{{ response?.permissions.canPublish ? 'Puede publicar' : 'Puede preparar' }}</span>
          </div>
          <AdminGestionScopePicker
            v-model="form.scope"
            :scope-tree="response?.options.scopeTree"
            :options="response?.options"
            :disabled="saving"
            compact
          />
        </section>

        <div class="status-row" aria-label="Estado de publicación">
          <label :class="{ active: form.status === 'draft' }"><input v-model="form.status" type="radio" value="draft" /> Borrador</label>
          <label :class="{ active: form.status === 'scheduled' }"><input v-model="form.status" type="radio" value="scheduled" :disabled="!canActivate" /> Programado</label>
          <label :class="{ active: form.status === 'active' }"><input v-model="form.status" type="radio" value="active" :disabled="!canActivate" /> Activo</label>
          <label :class="{ active: form.status === 'inactive' }"><input v-model="form.status" type="radio" value="inactive" /> Pausado</label>
        </div>

        <label v-if="form.status === 'scheduled'" class="field">
          <span>Activar desde</span>
          <input v-model="form.activeFrom" type="datetime-local" />
        </label>

        <p v-if="actionError" class="action-message error">{{ actionError }}</p>
        <p v-else-if="actionNotice" class="action-message">{{ actionNotice }}</p>
        <div class="actions">
          <button class="btn btn-secondary" type="button" :disabled="saving" @click="resetForm">Limpiar</button>
          <button class="btn btn-primary" type="submit" :disabled="saving || !response?.permissions.canManage || !form.scope.plantel">
            {{ saving ? 'Guardando...' : primaryActionLabel }}
          </button>
        </div>
      </form>

      <aside class="preview-stack">
        <article class="preview-card" :data-status="form.status">
          <div class="preview-head">
            <div>
              <p class="eyebrow">Vista previa</p>
              <h2>{{ form.title || defaultTitle }}</h2>
            </div>
            <span>{{ statusLabel(form.status) }}</span>
          </div>
          <p>{{ form.summary || 'El resumen ayuda a entender por qué esta publicación importa.' }}</p>
          <dl>
            <div><dt>Audiencia</dt><dd>{{ formatGestionScope(form.scope) }}</dd></div>
            <div><dt>Enlace</dt><dd>{{ form.url || urlPlaceholder }}</dd></div>
            <div><dt>Estado</dt><dd>{{ statusLabel(form.status) }}</dd></div>
          </dl>
        </article>

        <section class="content-list">
          <div class="list-head">
            <div>
              <p class="eyebrow">Publicaciones</p>
              <h2>{{ response?.items.length || 0 }}</h2>
            </div>
            <button class="mini-button" type="button" @click="resetForm">Nuevo</button>
          </div>

          <article v-for="item in response?.items" :key="item.id" class="content-row" :data-status="item.status">
            <span class="row-icon"><FamilyPersonasIcon :name="icon" /></span>
            <div>
              <b>{{ item.title }}</b>
              <p>{{ item.summary || item.scopeLabel }}</p>
              <small>{{ statusLabel(item.status) }} · {{ item.scopeLabel }}</small>
            </div>
            <button class="mini-button" type="button" @click="edit(item)">Editar</button>
          </article>

          <div v-if="!response?.items.length" class="state-card compact" data-state="empty">
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
const urlPlaceholder = computed(() => props.kind === 'encuesta' ? 'https://docs.google.com/forms/...' : 'https://publicacion-o-flipbook...')
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
  if (status === 'active') return 'Activo'
  if (status === 'inactive') return 'Pausado'
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

.module-hero,
.composer-card,
.preview-card,
.content-list,
.state-card {
  background: rgba(255, 255, 255, .96);
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  box-shadow: var(--shadow-soft);
}

.module-hero {
  align-items: center;
  background: linear-gradient(135deg, #fff, #f8fbf2);
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: clamp(18px, 2.6vw, 32px);
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1,
h2,
h3 {
  color: #17233b;
  line-height: 1.08;
}

h1 {
  font-size: clamp(2rem, 3vw, 3.2rem);
}

.module-hero p,
.content-row p,
.content-row small,
.preview-card p,
.preview-card dd,
.status-guide small {
  color: #64748b;
  line-height: 1.45;
}

.manager-layout {
  align-items: start;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(390px, 520px) minmax(0, 1fr);
}

.composer-card,
.content-list,
.preview-card {
  display: grid;
  gap: 14px;
  padding: 16px;
}

.section-head,
.list-head,
.content-row,
.actions,
.panel-head,
.preview-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.section-head {
  justify-content: start;
}

.section-head > span,
.row-icon {
  background: #fff7df;
  border: 1px solid #f3d589;
  border-radius: 14px;
  color: #9a6700;
  display: grid;
  flex: 0 0 auto;
  height: 44px;
  place-items: center;
  width: 44px;
}

.status-guide {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.status-guide article {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  display: grid;
  gap: 3px;
  padding: 10px;
}

.status-guide article[data-active='true'] {
  background: #e7f8ef;
  border-color: #9fd9b8;
}

.field {
  display: grid;
  gap: 6px;
}

.field span,
.preview-card dt {
  color: #64748b;
  font-size: .72rem;
  font-weight: 850;
  letter-spacing: .06em;
  text-transform: uppercase;
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

.audience-panel {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  display: grid;
  gap: 12px;
  padding: 14px;
}

.panel-head span,
.preview-head span {
  background: #eef7fb;
  border: 1px solid #cfe7fb;
  border-radius: 999px;
  color: #236188;
  font-size: .72rem;
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
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  color: #475569;
  display: inline-flex;
  font-weight: 850;
  gap: 7px;
  min-height: 40px;
  padding: 0 12px;
}

.status-row label.active {
  background: #e7f8ef;
  border-color: #9fd9b8;
  color: #156235;
}

.preview-stack {
  display: grid;
  gap: 16px;
  position: sticky;
  top: calc(var(--topbar-height) + 14px);
}

.preview-card dl {
  display: grid;
  gap: 10px;
  margin: 0;
}

.preview-card dl div {
  border-top: 1px solid #e2e8f0;
  display: grid;
  gap: 2px;
  padding-top: 8px;
}

.preview-card dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.content-row {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  padding: 12px;
}

.content-row[data-status='active'] {
  border-color: #bfead0;
}

.content-row[data-status='scheduled'] {
  border-color: #f3d589;
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
  color: #64748b;
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

@media (max-width: 1120px) {
  .manager-layout {
    grid-template-columns: 1fr;
  }

  .preview-stack {
    position: static;
  }

  .module-hero,
  .actions,
  .panel-head,
  .preview-head {
    align-items: stretch;
    flex-direction: column;
  }
}

@media (max-width: 740px) {
  .status-guide,
  .content-row {
    grid-template-columns: 1fr;
  }
}
</style>
