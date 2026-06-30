<template>
  <section class="ge-module" data-product-area="gestion-escolar" data-product-screen="comunicados">
    <header class="module-hero">
      <div>
        <p class="eyebrow">Comunicados</p>
        <h1>Publicaciones para familias</h1>
        <p>Redacta, segmenta, adjunta y publica solo dentro de tu alcance autorizado.</p>
      </div>
      <NuxtLink class="btn btn-secondary" to="/admin/gestion-escolar">Vista general</NuxtLink>
    </header>

    <section v-if="pending" class="state-card" data-state="loading">Cargando comunicados...</section>
    <section v-else-if="loadError" class="state-card" data-state="error">No pudimos cargar comunicados. Revisa tu alcance o intenta de nuevo.</section>
    <section v-else class="module-layout">
      <form class="composer" @submit.prevent="save">
        <div class="section-head">
          <span><FamilyPersonasIcon name="send" /></span>
          <div>
            <h2>{{ form.status === 'sent' ? 'Enviar comunicado' : form.status === 'scheduled' ? 'Programar comunicado' : 'Guardar borrador' }}</h2>
            <p>{{ permissionsText }}</p>
          </div>
        </div>

        <input v-model="form.title" placeholder="Titulo del comunicado" required />
        <input v-model="form.summary" placeholder="Resumen breve para la lista familiar" required />
        <textarea v-model="form.body" placeholder="Mensaje para madres, padres o tutores" rows="7" required />

        <div class="scope-grid">
          <select v-model="form.audience.kind">
            <option value="plantel">Plantel</option>
            <option value="grado">Grado</option>
            <option value="grupo">Grupo</option>
          </select>
          <select v-model="selectedPlantel" required>
            <option value="">Plantel</option>
            <option v-for="plantel in data?.options.planteles" :key="plantel" :value="plantel">{{ plantel }}</option>
          </select>
          <select v-model="selectedNivel" :disabled="form.audience.kind === 'plantel'">
            <option value="">Nivel</option>
            <option v-for="nivel in data?.options.niveles" :key="nivel" :value="nivel">{{ nivel }}</option>
          </select>
          <select v-model="selectedGrado" :disabled="form.audience.kind === 'plantel'">
            <option value="">Grado</option>
            <option v-for="grado in data?.options.grados" :key="grado" :value="grado">{{ grado }}</option>
          </select>
          <select v-model="selectedGrupo" :disabled="form.audience.kind !== 'grupo'">
            <option value="">Grupo</option>
            <option v-for="grupo in data?.options.grupos" :key="grupo" :value="grupo">{{ grupo }}</option>
          </select>
        </div>

        <div class="status-row">
          <label><input v-model="form.priority" type="radio" value="normal" /> Normal</label>
          <label><input v-model="form.priority" type="radio" value="important" /> Importante</label>
          <label><input v-model="form.priority" type="radio" value="urgent" /> Urgente</label>
        </div>
        <div class="status-row">
          <label><input v-model="form.status" type="radio" value="draft" /> Borrador</label>
          <label><input v-model="form.status" type="radio" value="scheduled" :disabled="!data?.permissions.canPublish" /> Programar</label>
          <label><input v-model="form.status" type="radio" value="sent" :disabled="!data?.permissions.canPublish" /> Publicar</label>
        </div>
        <input v-if="form.status === 'scheduled'" v-model="form.scheduledFor" type="datetime-local" />

        <p v-if="actionError" class="action-message error">{{ actionError }}</p>
        <p v-else-if="actionNotice" class="action-message">{{ actionNotice }}</p>
        <button class="btn btn-primary" type="submit" :disabled="saving || !data?.permissions.canCreate">
          {{ saving ? 'Guardando...' : form.status === 'sent' ? 'Enviar con confirmacion' : 'Guardar comunicado' }}
        </button>
      </form>

      <section class="content-list">
        <div class="metrics">
          <article><span>Borradores</span><strong>{{ data?.metrics.drafts || 0 }}</strong></article>
          <article><span>Programados</span><strong>{{ data?.metrics.scheduled || 0 }}</strong></article>
          <article><span>Enviados</span><strong>{{ data?.metrics.sent || 0 }}</strong></article>
        </div>
        <article v-for="item in data?.rows" :key="item.id" class="content-row">
          <span class="row-icon"><FamilyPersonasIcon name="announcement" /></span>
          <div>
            <b>{{ item.title }}</b>
            <p>{{ item.summary }}</p>
            <small>{{ item.status }} · {{ audienceLabel(item) }}</small>
          </div>
          <button class="mini-button" type="button" @click="edit(item)">Editar</button>
        </article>
        <div v-if="!data?.rows.length" class="state-card compact" data-state="empty">Aun no hay comunicados dentro de tu alcance.</div>
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useFetch } from 'nuxt/app'
import type { AdminCommunicationsResponse, CommunicationAudience, CommunicationPriority, CommunicationStatus, SchoolCommunication } from '~/types/communications'

definePageMeta({ layout: 'admin', middleware: ['admin', 'gestion-escolar-admin'] })

const { data, pending, error: loadError, refresh } = useFetch<AdminCommunicationsResponse>('/api/admin/comunicados', { timeout: 15000 })
const saving = ref(false)
const actionNotice = ref('')
const actionError = ref('')
const selectedPlantel = ref('')
const selectedNivel = ref('')
const selectedGrado = ref('')
const selectedGrupo = ref('')
const form = reactive({
  id: '',
  title: '',
  summary: '',
  body: '',
  status: 'draft' as CommunicationStatus,
  priority: 'normal' as CommunicationPriority,
  scheduledFor: '',
  audience: { kind: 'plantel', planteles: [], niveles: [], grados: [], grupos: [], label: '' } as CommunicationAudience,
  attachments: []
})

const permissionsText = computed(() => {
  if (!data.value?.permissions.canCreate) return 'Tu acceso permite consultar, pero no crear.'
  if (data.value.permissions.canPublish) return 'Puedes crear, programar y publicar dentro de tu alcance.'
  return 'Puedes crear borradores dentro de tu alcance.'
})

watch(data, (value) => {
  if (!selectedPlantel.value) selectedPlantel.value = value?.options.planteles[0] || ''
})

function buildAudience(): CommunicationAudience {
  const kind = form.audience.kind
  return {
    kind,
    planteles: selectedPlantel.value ? [selectedPlantel.value] : [],
    niveles: kind === 'plantel' ? [] : (selectedNivel.value ? [selectedNivel.value] : []),
    grados: kind === 'plantel' ? [] : (selectedGrado.value ? [selectedGrado.value] : []),
    grupos: kind === 'grupo' && selectedGrupo.value ? [selectedGrupo.value] : [],
    label: audienceLabel({ audience: { kind, planteles: selectedPlantel.value ? [selectedPlantel.value] : [], niveles: selectedNivel.value ? [selectedNivel.value] : [], grados: selectedGrado.value ? [selectedGrado.value] : [], grupos: selectedGrupo.value ? [selectedGrupo.value] : [] } } as SchoolCommunication)
  }
}

function audienceLabel(item: Pick<SchoolCommunication, 'audience'>) {
  const audience = item.audience
  return [audience.planteles?.join(', '), audience.niveles?.join(', '), audience.grados?.join(', '), audience.grupos?.map((grupo) => `Grupo ${grupo}`).join(', ')].filter(Boolean).join(' · ') || 'Comunidad escolar'
}

function edit(item: SchoolCommunication) {
  form.id = item.id
  form.title = item.title
  form.summary = item.summary
  form.body = item.body
  form.status = item.status
  form.priority = item.priority
  form.scheduledFor = item.scheduledFor || ''
  form.audience.kind = item.audience.kind
  selectedPlantel.value = item.audience.planteles[0] || ''
  selectedNivel.value = item.audience.niveles?.[0] || ''
  selectedGrado.value = item.audience.grados?.[0] || ''
  selectedGrupo.value = item.audience.grupos?.[0] || ''
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
    actionNotice.value = form.status === 'sent' ? 'Comunicado publicado.' : 'Comunicado guardado.'
    Object.assign(form, { id: '', title: '', summary: '', body: '', status: 'draft', priority: 'normal', scheduledFor: '', attachments: [] })
    await refresh()
  } catch (error) {
    const failure = error as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    actionError.value = failure.data?.statusMessage || failure.statusMessage || failure.message || 'No pudimos guardar el comunicado.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.ge-module {
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

h1 {
  color: #17233b;
  font-size: clamp(2rem, 3vw, 3.2rem);
}

.module-hero p,
.section-head p,
.content-row p,
.content-row small {
  color: #64748b;
  font-weight: 650;
  line-height: 1.5;
}

.module-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(360px, 480px) minmax(0, 1fr);
}

.composer,
.content-list {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.section-head {
  align-items: center;
  display: flex;
  gap: 12px;
}

.section-head > span,
.row-icon {
  background: #fff7df;
  border: 1px solid #f3d589;
  border-radius: 14px;
  color: #b98000;
  display: grid;
  height: 44px;
  place-items: center;
  width: 44px;
}

input,
select,
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

.scope-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-row label {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  font-weight: 800;
  padding: 8px 11px;
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
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  display: grid;
  gap: 12px;
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
  min-height: 220px;
  place-items: center;
  padding: 24px;
}

.state-card.compact {
  min-height: 120px;
}

@media (max-width: 1100px) {
  .module-layout,
  .scope-grid {
    grid-template-columns: 1fr;
  }

  .module-hero {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
