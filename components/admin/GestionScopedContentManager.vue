<template>
  <section class="publishing-manager" :data-kind="kind">
    <AdminGestionEscolarBanner
      :eyebrow="eyebrow"
      :title="title"
      :subtitle="description"
      :tone="kind === 'encuesta' ? 'amber' : 'teal'"
      :ambassador="kind === 'encuesta' ? 'preescolar' : 'primaria'"
    >
      <template #stats>
        <span>{{ response?.items.filter((item) => item.status === 'active').length || 0 }} publicados</span>
        <span>{{ response?.items.filter((item) => item.status === 'scheduled').length || 0 }} programados</span>
        <span>{{ response?.items.filter((item) => item.status === 'draft').length || 0 }} borradores</span>
      </template>
    </AdminGestionEscolarBanner>

    <section v-if="pending" class="state-panel" data-state="loading">
      <HuskyPassLoader :label="title" contained />
    </section>
    <section v-else-if="loadError" class="state-panel" data-state="error">
      <FamilyPersonasIcon name="security" />
      <h2>No pudimos cargar publicaciones</h2>
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
          <article :data-active="form.status === 'draft'"><strong>Borrador</strong></article>
          <article :data-active="form.status === 'scheduled'"><strong>Programado</strong></article>
          <article :data-active="form.status === 'active'"><strong>Publicado</strong></article>
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
            <span>{{ publishReadinessLabel }}</span>
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
          <label :class="{ active: form.status === 'draft' }"><input v-model="form.status" type="radio" value="draft" :disabled="!response?.actions.canManage" /> Borrador</label>
          <label :class="{ active: form.status === 'scheduled' }"><input v-model="form.status" type="radio" value="scheduled" :disabled="!canActivate" /> Programado</label>
          <label :class="{ active: form.status === 'active' }"><input v-model="form.status" type="radio" value="active" :disabled="!canActivate" /> Publicado</label>
          <label :class="{ active: form.status === 'inactive' }"><input v-model="form.status" type="radio" value="inactive" :disabled="!response?.actions.canManage" /> Inactivo</label>
        </div>

        <label v-if="form.status === 'scheduled'" class="field">
          <span>Publicar desde</span>
          <input v-model="form.activeFrom" type="datetime-local" />
        </label>

        <p v-if="actionError" class="surface-message error">{{ actionError }}</p>
        <p v-else-if="actionNotice" class="surface-message">{{ actionNotice }}</p>
        <div class="actions">
          <button class="btn btn-secondary" type="button" :disabled="saving" @click="resetForm()">Limpiar</button>
          <button class="btn btn-primary" type="submit" :disabled="saving || !canSave || !form.scope.plantel">
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
            <button v-if="response?.actions.canManage" class="inline-action" type="button" @click="resetForm()">Nueva</button>
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
          </div>
        </section>
      </aside>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useFetch } from 'nuxt/app'
import type { GestionEscolarContentKind, GestionEscolarContentStatus, GestionEscolarScope, GestionEscolarScopedContentItem, GestionEscolarScopedContentResponse } from '~/types/gestionEscolar'
import { useDraftState } from '~/composables/useDraftState'
import { usePageDraftGuard } from '~/composables/usePageDraftGuard'
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
const hydrated = ref(false)
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

const { isDirty, resetDraft } = useDraftState(form)
const { canDiscard } = usePageDraftGuard(isDirty)

const defaultTitle = computed(() => props.kind === 'encuesta' ? 'Encuesta escolar' : 'Convenio para familias')
const urlPlaceholder = computed(() => props.kind === 'encuesta' ? 'https://docs.google.com/forms/...' : 'https://documento-publico...')
const linkLabel = computed(() => props.kind === 'encuesta' ? 'Formulario' : 'Documento')
const previewFallback = computed(() => props.kind === 'encuesta' ? 'Encuesta escolar' : 'Documento institucional')
const audienceReady = computed(() => Boolean(form.scope.plantel))
const canActivate = computed(() => audienceReady.value && Boolean(response.value?.actions.canPublish))
const canSave = computed(() => form.status === 'active' || form.status === 'scheduled' ? Boolean(response.value?.actions.canPublish) : Boolean(response.value?.actions.canManage))
const publishReadinessLabel = computed(() => !audienceReady.value ? 'Plantel' : canActivate.value ? 'Listo' : 'Borrador')
const primaryActionLabel = computed(() => {
  if (form.status === 'active') return 'Publicar'
  if (form.status === 'scheduled') return 'Programar'
  return 'Guardar borrador'
})

function defaultSchoolScope(value = response.value): GestionEscolarScope {
  return { isGlobal: false, plantel: value?.options.planteles[0] || null, nivel: null, grado: null, grupo: null }
}

function ensureDefaultScope(value = response.value) {
  if (!form.scope.plantel && value?.options.planteles[0]) {
    form.scope = defaultSchoolScope(value)
  }
}

onMounted(() => {
  hydrated.value = true
  ensureDefaultScope()
  resetDraft()
})

watch(response, (value) => {
  if (!hydrated.value || isDirty.value) return
  ensureDefaultScope(value)
  resetDraft()
})

function resetForm(force = false) {
  if (!force && !canDiscard()) return
  Object.assign(form, {
    id: '',
    title: '',
    summary: '',
    url: '',
    status: 'draft' as GestionEscolarContentStatus,
    activeFrom: '',
    activeUntil: '',
    scope: defaultSchoolScope()
  })
  actionNotice.value = ''
  actionError.value = ''
  resetDraft()
}

function edit(item: GestionEscolarScopedContentItem) {
  if (!canDiscard()) return
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
  resetDraft()
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
    resetForm(true)
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
  --ink: #102235;
  --muted: #607086;
  --line: rgba(18, 95, 89, 0.16);
  --line-soft: rgba(18, 95, 89, 0.10);
  --accent: #07877d;
  --accent-dark: #075f58;
  --sun: #f6b94f;
  display: grid;
  gap: 16px;
}

.publishing-head,
.composer-panel,
.preview-panel,
.publication-list,
.state-panel {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: 0 22px 58px rgba(14, 40, 55, 0.08);
}

.publishing-head {
  align-items: center;
  background:
    radial-gradient(circle at 10% 20%, rgba(8, 135, 125, 0.13), transparent 34%),
    radial-gradient(circle at 88% 0%, rgba(246, 185, 79, 0.20), transparent 28%),
    linear-gradient(135deg, #ffffff, #fbfdf6);
  display: flex;
  gap: 16px;
  justify-content: space-between;
  overflow: hidden;
  padding: clamp(18px, 2.4vw, 28px);
  position: relative;
}

.publishing-head::after {
  background: linear-gradient(180deg, var(--accent), #8bbf48);
  border-radius: 999px;
  content: '';
  height: 82px;
  opacity: 0.14;
  position: absolute;
  right: 28px;
  top: -40px;
  transform: rotate(34deg);
  width: 14px;
}

.publishing-head h1,
.composer-panel h2,
.preview-panel h2,
.publication-list h2,
.state-panel h2,
.state-panel h3 {
  color: var(--ink);
  font-family: var(--font-title, var(--font-body));
  margin: 0;
}

.publishing-head h1 {
  font-size: clamp(2rem, 3.2vw, 3rem);
  letter-spacing: -0.035em;
  line-height: 0.98;
}

.eyebrow,
.field span,
.preview-panel dt {
  color: var(--accent-dark);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.13em;
  margin: 0 0 6px;
  text-transform: uppercase;
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
  border-bottom: 1px solid var(--line-soft);
  justify-content: start;
  padding-bottom: 12px;
}

.title-icon,
.row-icon {
  align-items: center;
  background: linear-gradient(135deg, #eefaf7, #fff6df);
  border: 1px solid rgba(8, 135, 125, 0.18);
  border-radius: 15px;
  color: var(--accent-dark);
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
  background: #f8fbfb;
  border: 1px solid var(--line-soft);
  border-radius: 16px;
  display: grid;
  gap: 3px;
  padding: 10px;
}

.status-steps article[data-active='true'] {
  background: #e5f8ee;
  border-color: rgba(8, 135, 125, 0.22);
}

.status-steps strong {
  color: var(--ink);
}

.status-steps small,
.publication-row p,
.publication-row small,
.preview-panel p,
.preview-panel dd {
  color: var(--muted);
}

.field {
  display: grid;
  gap: 6px;
}

input {
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 14px;
  color: var(--ink);
  min-height: 44px;
  min-width: 0;
  padding: 0 12px;
}

.audience-panel {
  background: #f8fbfb;
  border: 1px solid var(--line-soft);
  border-radius: 18px;
  display: grid;
  gap: 12px;
  padding: 12px;
}

.panel-head strong {
  color: var(--ink);
  font-size: 0.92rem;
}

.panel-head span {
  background: #fff6df;
  border: 1px solid rgba(246, 185, 79, 0.36);
  border-radius: 999px;
  color: #8a650c;
  font-size: 0.74rem;
  font-weight: 900;
  padding: 7px 10px;
}

.status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-row label {
  align-items: center;
  background: #ffffff;
  border: 1px solid var(--line-soft);
  border-radius: 999px;
  color: #526173;
  display: inline-flex;
  font-weight: 850;
  gap: 7px;
  min-height: 38px;
  padding: 0 12px;
}

.status-row label.active {
  background: #e5f8ee;
  border-color: rgba(8, 135, 125, 0.22);
  color: #148044;
}

.publishing-side {
  display: grid;
  gap: 16px;
  position: sticky;
  top: calc(var(--topbar-height) + 18px);
}

.preview-panel {
  background:
    radial-gradient(circle at 100% 0%, rgba(8, 135, 125, 0.08), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(249, 253, 250, 0.93));
}

.preview-panel dl {
  display: grid;
  gap: 8px;
  margin: 0;
}

.preview-panel dl div {
  background: #ffffff;
  border: 1px solid var(--line-soft);
  border-radius: 16px;
  display: grid;
  gap: 2px;
  padding: 10px;
}

.preview-panel dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.publication-row {
  background: #ffffff;
  border: 1px solid transparent;
  border-radius: 18px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  padding: 12px;
  transition: background 0.16s ease, border-color 0.16s ease, transform 0.16s ease;
}

.publication-row:hover {
  background: linear-gradient(135deg, #f0fbf7, #fffaf0);
  border-color: rgba(8, 135, 125, 0.22);
  transform: translateY(-1px);
}

.publication-row[data-status='active'] {
  border-color: rgba(8, 135, 125, 0.22);
}

.publication-row[data-status='scheduled'] {
  border-color: rgba(246, 185, 79, 0.38);
}

.publication-row b,
.publication-row small {
  display: block;
}

.inline-action {
  background: #ffffff;
  border: 1px solid rgba(8, 135, 125, 0.22);
  border-radius: 13px;
  color: var(--accent-dark);
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 900;
  min-height: 36px;
  padding: 0 12px;
}

.surface-message {
  background: #edfdf7;
  border: 1px solid #b7ead6;
  border-radius: 14px;
  color: #047857;
  padding: 10px 12px;
}

.surface-message.error {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #be123c;
}

.state-panel {
  color: var(--muted);
  display: grid;
  gap: 9px;
  min-height: 240px;
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
