<template>
  <section class="communications-module" data-product-area="gestion-escolar" data-product-screen="comunicados">
    <header class="module-hero">
      <div>
        <p class="eyebrow">Comunicados</p>
        <h1>Publicaciones para familias</h1>
        <p>{{ data?.permissions.canPublish ? 'Crear, programar y publicar por alcance.' : 'Crear borradores por alcance.' }}</p>
      </div>
      <NuxtLink class="btn btn-secondary" to="/admin/gestion-escolar">Gestión Escolar</NuxtLink>
    </header>

    <section v-if="pending" class="state-card" data-state="loading"><HuskyPassLoader label="Comunicados" contained /></section>
    <section v-else-if="loadError" class="state-card" data-state="error">No disponible</section>
    <section v-else class="module-layout">
      <form class="composer" @submit.prevent="save">
        <div class="section-head">
          <span><FamilyPersonasIcon name="send" /></span>
          <div>
            <p class="eyebrow">{{ form.id ? 'Editar' : 'Nuevo' }}</p>
            <h2>{{ form.title || 'Comunicado' }}</h2>
          </div>
        </div>

        <label class="field">
          <span>Título</span>
          <input v-model="form.title" placeholder="Título del comunicado" required />
        </label>
        <label class="field">
          <span>Resumen</span>
          <input v-model="form.summary" placeholder="Resumen para la lista familiar" required />
        </label>
        <label class="field">
          <span>Mensaje</span>
          <textarea v-model="form.body" placeholder="Mensaje para madres, padres o tutores" rows="7" required />
        </label>

        <section class="audience-panel">
          <div class="panel-head">
            <p class="eyebrow">Audiencia</p>
            <strong>{{ formatGestionScope(scope) }}</strong>
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
          <label :class="{ active: form.status === 'scheduled' }"><input v-model="form.status" type="radio" value="scheduled" :disabled="!data?.permissions.canPublish" /> Programar</label>
          <label :class="{ active: form.status === 'sent' }"><input v-model="form.status" type="radio" value="sent" :disabled="!data?.permissions.canPublish" /> Publicar</label>
        </div>
        <label v-if="form.status === 'scheduled'" class="field">
          <span>Programado</span>
          <input v-model="form.scheduledFor" type="datetime-local" />
        </label>

        <p v-if="actionError" class="action-message error">{{ actionError }}</p>
        <p v-else-if="actionNotice" class="action-message">{{ actionNotice }}</p>
        <div class="actions">
          <button class="btn btn-secondary" type="button" :disabled="saving" @click="resetForm">Limpiar</button>
          <button class="btn btn-primary" type="submit" :disabled="saving || !data?.permissions.canCreate || !scope.plantel">
            {{ saving ? 'Guardando…' : form.status === 'sent' ? 'Publicar' : 'Guardar' }}
          </button>
        </div>
      </form>

      <section class="content-list">
        <div class="metrics">
          <article><span>Borradores</span><strong>{{ data?.metrics.drafts || 0 }}</strong></article>
          <article><span>Programados</span><strong>{{ data?.metrics.scheduled || 0 }}</strong></article>
          <article><span>Publicados</span><strong>{{ data?.metrics.sent || 0 }}</strong></article>
        </div>
        <article v-for="item in data?.rows" :key="item.id" class="content-row" :data-status="item.status">
          <span class="row-icon"><FamilyPersonasIcon name="announcement" /></span>
          <div>
            <b>{{ item.title }}</b>
            <p>{{ item.summary }}</p>
            <small>{{ statusLabel(item.status) }} · {{ audienceLabel(item) }}</small>
          </div>
          <button class="mini-button" type="button" @click="edit(item)">Editar</button>
        </article>
        <div v-if="!data?.rows.length" class="state-card compact" data-state="empty">Sin comunicados</div>
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useFetch } from 'nuxt/app'
import type { AdminCommunicationsResponse, CommunicationAudience, CommunicationPriority, CommunicationStatus, SchoolCommunication } from '~/types/communications'
import type { GestionEscolarScope } from '~/types/gestionEscolar'
import { formatGestionScope } from '~/utils/gestionEscolar'

definePageMeta({ layout: 'admin', middleware: ['admin', 'gestion-escolar-admin'] })

const { data, pending, error: loadError, refresh } = useFetch<AdminCommunicationsResponse>('/api/admin/comunicados', { timeout: 15000 })
const saving = ref(false)
const actionNotice = ref('')
const actionError = ref('')
const scope = ref<GestionEscolarScope>({ isGlobal: false, plantel: null, nivel: null, grado: null, grupo: null })
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

watch(data, (value) => {
  if (!scope.value.plantel) scope.value = { isGlobal: false, plantel: value?.options.planteles[0] || null, nivel: null, grado: null, grupo: null }
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
  scope.value = { isGlobal: false, plantel: data.value?.options.planteles[0] || null, nivel: null, grado: null, grupo: null }
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
.communications-module {
  display: grid;
  gap: 18px;
}

.module-hero,
.composer,
.content-list,
.state-card {
  background: rgba(255, 255, 255, .96);
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, .07);
}

.module-hero {
  align-items: center;
  background:
    radial-gradient(circle at 90% 12%, rgba(15, 140, 154, .14), transparent 30%),
    linear-gradient(135deg, #fff, #f8fbf2);
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
p {
  margin: 0;
}

h1,
h2 {
  color: #17233b;
  line-height: 1.08;
}

h1 {
  font-size: clamp(2rem, 3vw, 3.2rem);
}

.module-hero p,
.content-row p,
.content-row small {
  color: #64748b;
  font-weight: 650;
  line-height: 1.5;
}

.module-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(400px, 540px) minmax(0, 1fr);
}

.composer,
.content-list {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.section-head,
.content-row,
.actions,
.panel-head {
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
  color: #b98000;
  display: grid;
  flex: 0 0 auto;
  height: 44px;
  place-items: center;
  width: 44px;
}

.field {
  display: grid;
  gap: 6px;
}

.field span {
  color: #64748b;
  font-size: .72rem;
  font-weight: 850;
  letter-spacing: .06em;
  text-transform: uppercase;
}

input,
textarea {
  background: #fff;
  border: 1px solid #d9e2ea;
  border-radius: 14px;
  color: #17233b;
  min-height: 42px;
  padding: 0 12px;
  width: 100%;
}

textarea {
  padding-block: 12px;
  resize: vertical;
}

.audience-panel {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  display: grid;
  gap: 12px;
  padding: 14px;
}

.panel-head strong {
  color: #17233b;
  font-size: .9rem;
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

.metrics {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, 1fr);
}

.metrics article {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px;
}

.metrics span {
  color: #64748b;
  font-size: .7rem;
  font-weight: 850;
  text-transform: uppercase;
}

.metrics strong {
  color: #17233b;
  display: block;
  font-size: 1.4rem;
}

.content-row {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  padding: 12px;
}

.content-row[data-status='sent'] {
  border-color: #bfead0;
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
  min-height: 120px;
}

@media (max-width: 1100px) {
  .module-layout,
  .metrics {
    grid-template-columns: 1fr;
  }

  .module-hero,
  .actions,
  .panel-head {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
