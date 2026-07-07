<template>
  <section class="communications-publisher" data-product-area="gestion-escolar" data-product-screen="comunicados">
    <header class="publishing-head">
      <div>
        <p class="eyebrow">Comunicados</p>
        <h1>Publicar a familias</h1>
      </div>
      <NuxtLink class="btn btn-secondary" to="/admin/gestion-escolar">Escolar</NuxtLink>
    </header>

    <section v-if="pending" class="state-panel" data-state="loading">
      <HuskyPassLoader label="Comunicados" contained />
    </section>
    <section v-else-if="loadError" class="state-panel" data-state="error">
      <FamilyPersonasIcon name="security" />
      <h2>No disponible</h2>
    </section>

    <section v-else class="publisher-layout">
      <form class="composer-panel" @submit.prevent="save">
        <div class="section-title">
          <span class="title-icon"><FamilyPersonasIcon name="send" /></span>
          <div>
            <p class="eyebrow">{{ form.id ? 'Editando' : 'Nuevo comunicado' }}</p>
            <h2>{{ form.title || 'Comunicado' }}</h2>
          </div>
        </div>

        <div class="status-steps" aria-label="Estado de publicación">
          <article :data-active="form.status === 'draft'"><strong>Borrador</strong><small>No visible</small></article>
          <article :data-active="form.status === 'scheduled'"><strong>Programado</strong><small>Sale por fecha</small></article>
          <article :data-active="form.status === 'sent'"><strong>Publicado</strong><small>Visible</small></article>
        </div>

        <label class="field">
          <span>Título</span>
          <input v-model="form.title" placeholder="Título del comunicado" required />
        </label>
        <label class="field">
          <span>Resumen</span>
          <input v-model="form.summary" placeholder="Frase corta para la lista familiar" required />
        </label>
        <label class="field">
          <span>Mensaje</span>
          <textarea v-model="form.body" placeholder="Mensaje para madres, padres o tutores" rows="8" required />
        </label>

        <section class="audience-panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Audiencia</p>
              <strong>{{ formatGestionScope(scope) }}</strong>
            </div>
            <span>{{ publishReadinessLabel }}</span>
          </div>
          <AdminGestionScopePicker
            v-model="scope"
            :scope-tree="data?.options.scopeTree"
            :options="data?.options"
            :disabled="saving"
            compact
          />
        </section>

        <div class="status-row" aria-label="Prioridad">
          <label :class="{ active: form.priority === 'normal' }"><input v-model="form.priority" type="radio" value="normal" /> Normal</label>
          <label :class="{ active: form.priority === 'important' }"><input v-model="form.priority" type="radio" value="important" /> Importante</label>
          <label :class="{ active: form.priority === 'urgent' }"><input v-model="form.priority" type="radio" value="urgent" /> Urgente</label>
        </div>
        <div class="status-row" aria-label="Estado">
          <label :class="{ active: form.status === 'draft' }"><input v-model="form.status" type="radio" value="draft" /> Borrador</label>
          <label :class="{ active: form.status === 'scheduled' }"><input v-model="form.status" type="radio" value="scheduled" /> Programado</label>
          <label :class="{ active: form.status === 'sent' }"><input v-model="form.status" type="radio" value="sent" /> Publicado</label>
        </div>
        <label v-if="form.status === 'scheduled'" class="field">
          <span>Publicar desde</span>
          <input v-model="form.scheduledFor" type="datetime-local" />
        </label>

        <p v-if="actionError" class="surface-message error">{{ actionError }}</p>
        <p v-else-if="actionNotice" class="surface-message">{{ actionNotice }}</p>
        <div class="actions">
          <button class="btn btn-secondary" type="button" :disabled="saving" @click="resetForm">Limpiar</button>
          <button class="btn btn-primary" type="submit" :disabled="saving || !data?.actions.canCreate || !scope.plantel">
            {{ saving ? 'Guardando...' : form.status === 'sent' ? 'Publicar' : form.status === 'scheduled' ? 'Programar' : 'Guardar borrador' }}
          </button>
        </div>
      </form>

      <aside class="publishing-side">
        <section class="state-counts" aria-label="Estado de comunicados">
          <article><span>Borrador</span><strong>{{ data?.metrics.drafts || 0 }}</strong></article>
          <article><span>Programado</span><strong>{{ data?.metrics.scheduled || 0 }}</strong></article>
          <article><span>Publicado</span><strong>{{ data?.metrics.sent || 0 }}</strong></article>
        </section>

        <section class="publication-list">
          <div class="list-head">
            <div>
              <p class="eyebrow">Comunicados</p>
              <h2>{{ data?.rows.length || 0 }}</h2>
            </div>
            <button class="inline-action" type="button" @click="resetForm">Nuevo</button>
          </div>

          <article v-for="item in data?.rows" :key="item.id" class="publication-row" :data-status="item.status">
            <span class="row-icon"><FamilyPersonasIcon name="announcement" /></span>
            <div>
              <b>{{ item.title }}</b>
              <p>{{ item.summary }}</p>
              <small>{{ statusLabel(item.status) }} · {{ audienceLabel(item) }}</small>
            </div>
            <button class="inline-action" type="button" @click="edit(item)">Editar</button>
          </article>
          <div v-if="!data?.rows.length" class="state-panel compact" data-state="empty">
            <FamilyPersonasIcon name="announcement" />
            <h3>Sin comunicados</h3>
          </div>
        </section>
      </aside>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useFetch } from 'nuxt/app'
import type { AdminCommunicationsResponse, CommunicationAudience, CommunicationPriority, CommunicationStatus, SchoolCommunication } from '~/types/communications'
import type { GestionEscolarScope } from '~/types/gestionEscolar'
import { formatGestionScope } from '~/utils/gestionEscolar'

definePageMeta({ layout: 'admin', middleware: ['admin', 'gestion-escolar-admin'] })

const { data, pending, error: loadError, refresh } = useFetch<AdminCommunicationsResponse>('/api/admin/comunicados', { timeout: 15000 })
const saving = ref(false)
const actionNotice = ref('')
const actionError = ref('')
const hydrated = ref(false)
const scope = ref<GestionEscolarScope>({ isGlobal: false, plantel: null, nivel: null, grado: null, grupo: null })
const audienceReady = computed(() => Boolean(scope.value.plantel))
const publishReadinessLabel = computed(() => {
  if (!audienceReady.value) return 'Falta audiencia'
  return 'Listo'
})
const form = reactive({
  id: '',
  title: '',
  summary: '',
  body: '',
  status: 'draft' as CommunicationStatus,
  priority: 'normal' as CommunicationPriority,
  scheduledFor: '',
  attachments: []
})

function defaultSchoolScope(value = data.value): GestionEscolarScope {
  return { isGlobal: false, plantel: value?.options.planteles[0] || null, nivel: null, grado: null, grupo: null }
}

function ensureDefaultScope(value = data.value) {
  if (!scope.value.plantel && value?.options.planteles[0]) scope.value = defaultSchoolScope(value)
}

onMounted(() => {
  hydrated.value = true
  ensureDefaultScope()
})

watch(data, (value) => {
  if (hydrated.value) ensureDefaultScope(value)
})

function buildAudience(): CommunicationAudience {
  const current = scope.value
  const kind: CommunicationAudience['kind'] = current.grupo ? 'grupo' : current.grado || current.nivel ? 'grado' : 'plantel'
  return {
    kind,
    planteles: current.plantel ? [current.plantel] : [],
    niveles: current.nivel ? [current.nivel] : [],
    grados: current.grado ? [current.grado] : [],
    grupos: current.grupo ? [current.grupo] : [],
    label: formatGestionScope(current)
  }
}

function audienceLabel(item: Pick<SchoolCommunication, 'audience'>) {
  return item.audience.label || [item.audience.planteles?.join(', '), item.audience.niveles?.join(', '), item.audience.grados?.join(', '), item.audience.grupos?.map((grupo) => `Grupo ${grupo}`).join(', ')].filter(Boolean).join(' · ') || 'Comunidad escolar'
}

function statusLabel(status: CommunicationStatus) {
  if (status === 'sent') return 'Publicado'
  if (status === 'scheduled') return 'Programado'
  return 'Borrador'
}

function edit(item: SchoolCommunication) {
  form.id = item.id
  form.title = item.title
  form.summary = item.summary
  form.body = item.body
  form.status = item.status
  form.priority = item.priority
  form.scheduledFor = item.scheduledFor || ''
  scope.value = {
    isGlobal: false,
    plantel: item.audience.planteles?.[0] || null,
    nivel: item.audience.niveles?.[0] || null,
    grado: item.audience.grados?.[0] || null,
    grupo: item.audience.grupos?.[0] || null
  }
  actionError.value = ''
  actionNotice.value = ''
}

function resetForm() {
  Object.assign(form, { id: '', title: '', summary: '', body: '', status: 'draft' as CommunicationStatus, priority: 'normal' as CommunicationPriority, scheduledFor: '', attachments: [] })
  scope.value = defaultSchoolScope()
  actionError.value = ''
  actionNotice.value = ''
}

async function save() {
  saving.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    await $fetch('/api/admin/comunicados', {
      method: 'POST',
      body: {
        ...form,
        scheduledFor: form.status === 'scheduled' ? form.scheduledFor : null,
        audience: buildAudience()
      }
    })
    actionNotice.value = form.status === 'sent' ? 'Publicado.' : 'Guardado.'
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
.communications-publisher {
  display: grid;
  gap: 16px;
}

.publishing-head,
.composer-panel,
.publication-list,
.state-panel,
.state-counts article {
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
.publication-list h2,
.state-panel h2,
.state-panel h3 {
  color: #152032;
  font-family: var(--font-body);
  margin: 0;
}

.publishing-head h1 {
  font-size: clamp(1.7rem, 2.4vw, 2.35rem);
}

.publishing-head p:not(.eyebrow),
.publication-row p,
.publication-row small,
.status-steps small {
  color: #667789;
}

.publisher-layout {
  align-items: start;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(390px, 540px) minmax(0, 1fr);
}

.composer-panel,
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

.status-steps,
.state-counts {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.status-steps article,
.state-counts article {
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

.state-counts span,
.field span {
  color: #6b7a8b;
  font-size: 0.72rem;
  font-weight: 850;
  text-transform: uppercase;
}

.state-counts strong {
  color: #152032;
  font-size: 1.35rem;
}

.field {
  display: grid;
  gap: 6px;
}

input,
textarea {
  background: #ffffff;
  border: 1px solid #dce5eb;
  border-radius: 12px;
  color: #152032;
  min-height: 42px;
  min-width: 0;
  padding: 0 12px;
  width: 100%;
}

textarea {
  padding-block: 12px;
  resize: vertical;
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

.publication-row {
  border: 1px solid #e1e8ed;
  border-radius: 13px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  padding: 12px;
}

.publication-row[data-status='sent'] {
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
  .publisher-layout,
  .state-counts {
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
