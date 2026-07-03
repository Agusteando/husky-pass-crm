<template>
  <section class="admin-comms" data-product-panel="admin-communications">
    <header class="workspace-head compact-head comms-head">
      <div>
        <p class="eyebrow">Comunicados</p>
        <h1>Comunicados</h1>
        <p>Redacta, elige audiencia y publica avisos para familias por plantel, grado o grupo.</p>
      </div>
      <div class="head-action-stack">
        <span v-if="data" class="permission-chip" :data-global="data.permissions.isGlobal">{{ data.permissions.isGlobal ? 'Global' : 'Alcance asignado' }}</span>
        <button class="btn btn-primary" type="button" @click="resetDraft">
          <FamilyPersonasIcon name="plus" />
          Nuevo comunicado
        </button>
      </div>
    </header>

    <div v-if="loadError" class="alert-row" data-state="error">
      <FamilyPersonasIcon name="announcement" />
      <div>
        <strong>No pudimos cargar Comunicados</strong>
        <span>Reintenta en un momento. No se enviará nada hasta que confirmes manualmente.</span>
      </div>
      <button class="btn btn-secondary" type="button" @click="reload">Reintentar</button>
    </div>

    <section v-else class="admin-comms-layout">
      <article class="composer-card">
        <header>
          <p class="eyebrow">{{ draft.id ? 'Editando borrador' : 'Nuevo comunicado' }}</p>
          <h2>Mensaje</h2>
        </header>

        <form class="composer-form" @submit.prevent="saveAsDraft">
          <label class="label">
            <span>Título</span>
            <input v-model="draft.title" class="input" maxlength="140" required placeholder="Ej. Ajuste de salida para Secundaria" />
          </label>

          <label class="label">
            <span>Resumen para familias</span>
            <input v-model="draft.summary" class="input" maxlength="240" required placeholder="Una frase clara que diga qué deben saber." />
          </label>

          <label class="label">
            <span>Mensaje</span>
            <textarea v-model="draft.body" class="textarea" maxlength="4000" required placeholder="Escribe el comunicado con lenguaje directo y amable."></textarea>
          </label>

          <section class="target-panel" aria-label="Audiencia">
            <div class="section-title-row">
              <div>
                <p class="eyebrow">Audiencia</p>
                <h3>¿Quién debe recibirlo?</h3>
              </div>
              <span class="audience-summary">{{ audienceLabel }}</span>
            </div>

            <div class="segmented-control" role="tablist" aria-label="Tipo de audiencia">
              <button v-for="option in audienceKinds" :key="option.value" type="button" :class="{ active: draft.audienceKind === option.value }" @click="draft.audienceKind = option.value">
                {{ option.label }}
              </button>
            </div>

            <div class="target-grid">
              <label class="label">
                <span>Plantel</span>
                <select v-model="draft.plantel" class="select">
                  <option v-for="plantel in plantelOptions" :key="plantel" :value="plantel">{{ plantel }}</option>
                </select>
              </label>
              <label v-if="draft.audienceKind !== 'plantel'" class="label">
                <span>Nivel</span>
                <select v-model="draft.nivel" class="select">
                  <option v-for="nivel in nivelOptions" :key="nivel" :value="nivel">{{ nivel }}</option>
                </select>
              </label>
              <label v-if="draft.audienceKind !== 'plantel'" class="label">
                <span>Grado</span>
                <select v-model="draft.grado" class="select">
                  <option v-for="grado in gradoOptions" :key="grado" :value="grado">{{ grado }}</option>
                </select>
              </label>
              <label v-if="draft.audienceKind === 'grupo'" class="label">
                <span>Grupo</span>
                <select v-model="draft.grupo" class="select">
                  <option v-for="grupo in grupoOptions" :key="grupo" :value="grupo">{{ grupo }}</option>
                </select>
              </label>
            </div>
          </section>

          <section class="attachments-editor">
            <div class="section-title-row">
              <div>
                <p class="eyebrow">Adjuntos</p>
                <h3>PDFs, imágenes o documentos</h3>
              </div>
              <label class="upload-button">
                <FamilyPersonasIcon name="attachment" />
                Agregar
                <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.txt" @change="handleFiles" />
              </label>
            </div>

            <p v-if="attachmentError" class="inline-warning">{{ attachmentError }}</p>
            <p v-if="uploading" class="inline-info">Subiendo adjunto...</p>

            <div v-if="draft.attachments.length" class="attachment-list">
              <article v-for="attachment in draft.attachments" :key="attachment.id" class="attachment-pill">
                <FamilyPersonasIcon :name="attachment.kind === 'pdf' ? 'pdf' : attachment.kind === 'image' ? 'camera' : 'document'" />
                <span>
                  <strong>{{ attachment.name }}</strong>
                  <small>{{ attachment.kind.toUpperCase() }} · {{ fileSize(attachment.size) }}</small>
                </span>
                <button type="button" aria-label="Quitar adjunto" @click="removeAttachment(attachment.id)">
                  <FamilyPersonasIcon name="trash" />
                </button>
              </article>
            </div>

            <p v-else class="empty-copy">Puedes enviar el comunicado sin adjuntos o agregar documentos de apoyo.</p>
          </section>

          <label class="label schedule-field">
            <span>Programar envío</span>
            <input v-model="draft.scheduledFor" class="input" type="datetime-local" />
          </label>

          <p v-if="saveError" class="alert">{{ saveError }}</p>
          <p v-if="notice" class="notice">{{ notice }}</p>

          <div class="composer-actions">
            <button class="btn btn-secondary" type="submit" :disabled="Boolean(saving)">Guardar borrador</button>
            <button class="btn btn-secondary" type="button" :disabled="Boolean(saving) || !draft.scheduledFor || !canPublish" @click="scheduleCommunication">
              <FamilyPersonasIcon name="clock" />
              Programar
            </button>
            <button class="btn btn-primary" type="button" :disabled="Boolean(saving) || !canPublish" @click="sendCommunication">
              <FamilyPersonasIcon name="send" />
              Enviar
            </button>
          </div>
        </form>
      </article>

      <aside class="preview-stack">
        <article class="preview-card" :data-priority="draft.priority">
          <header>
            <div>
              <p class="eyebrow">Vista previa</p>
              <h2>{{ draft.title || 'Título del comunicado' }}</h2>
            </div>
            <select v-model="draft.priority" class="select priority-select" aria-label="Prioridad">
              <option value="normal">Normal</option>
              <option value="important">Importante</option>
              <option value="urgent">Urgente</option>
            </select>
          </header>
          <p class="preview-summary">{{ draft.summary || 'El resumen ayudará a las familias a entender rápidamente qué importa.' }}</p>
          <p class="preview-body">{{ draft.body || 'Escribe el mensaje completo para revisar tono, claridad y longitud antes de enviarlo.' }}</p>
          <div class="preview-footer">
            <span>{{ audienceLabel }}</span>
            <span>{{ draft.attachments.length }} adjunto{{ draft.attachments.length === 1 ? '' : 's' }}</span>
          </div>
        </article>

        <article class="sent-list-card">
          <header>
            <p class="eyebrow">Historial</p>
            <h2>Comunicados recientes</h2>
          </header>

          <section v-if="pending && !data" class="admin-loading" data-state="loading">
            <span v-for="item in 4" :key="item"></span>
          </section>

          <div v-else-if="data?.rows.length" class="admin-comms-list">
            <button v-for="row in data.rows" :key="row.id" type="button" :data-status="row.status" @click="loadRow(row)">
              <span>
                <strong>{{ row.title }}</strong>
                <small>{{ row.status === 'sent' ? 'Enviado' : row.status === 'scheduled' ? 'Programado' : 'Borrador' }} · {{ dateLabel(row.sentAt || row.scheduledFor || row.updatedAt) }}</small>
              </span>
              <FamilyPersonasIcon name="chevron" />
            </button>
          </div>

          <p v-else class="empty-copy">Aún no hay comunicados creados.</p>
        </article>
      </aside>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useFetch } from 'nuxt/app'
import type {
  AdminCommunicationsResponse,
  CommunicationAttachment,
  CommunicationAudienceKind,
  CommunicationPriority,
  CommunicationStatus,
  SchoolCommunication
} from '~/types/communications'

definePageMeta({ layout: 'admin', middleware: ['admin', 'comunicados-admin'] })

interface DraftState {
  id: string
  title: string
  summary: string
  body: string
  priority: CommunicationPriority
  audienceKind: CommunicationAudienceKind
  plantel: string
  nivel: string
  grado: string
  grupo: string
  scheduledFor: string
  attachments: CommunicationAttachment[]
}

const { data, pending, error: loadError, refresh } = useFetch<AdminCommunicationsResponse>('/api/admin/comunicados', { timeout: 15000 })
const saving = ref<CommunicationStatus | ''>('')
const uploading = ref(false)
const saveError = ref('')
const attachmentError = ref('')
const notice = ref('')
const draft = reactive<DraftState>(emptyDraft())
const audienceKinds = [
  { value: 'plantel' as const, label: 'Plantel' },
  { value: 'grado' as const, label: 'Grado' },
  { value: 'grupo' as const, label: 'Grupo' }
]

const plantelOptions = computed(() => data.value?.options.planteles.length ? data.value.options.planteles : ['PREEM', 'PM', 'PT', 'SM', 'ST'])
const nivelOptions = computed(() => data.value?.options.niveles.length ? data.value.options.niveles : ['Preescolar', 'Primaria', 'Secundaria'])
const gradoOptions = computed(() => data.value?.options.grados.length ? data.value.options.grados : ['1°', '2°', '3°'])
const grupoOptions = computed(() => data.value?.options.grupos.length ? data.value.options.grupos : ['A', 'B', 'C', 'G'])
const canPublish = computed(() => Boolean(data.value?.permissions.canPublish))
const audienceLabel = computed(() => {
  if (draft.audienceKind === 'plantel') return `Plantel ${draft.plantel}`
  if (draft.audienceKind === 'grado') return `${draft.plantel} · ${draft.nivel} · ${draft.grado}`
  return `${draft.plantel} · ${draft.nivel} · ${draft.grado} · Grupo ${draft.grupo}`
})

watch(data, (value) => {
  if (!value || draft.id) return
  if (value.options.planteles[0] && !value.options.planteles.includes(draft.plantel)) draft.plantel = value.options.planteles[0]
  if (value.options.niveles[0] && !value.options.niveles.includes(draft.nivel)) draft.nivel = value.options.niveles[0]
  if (value.options.grados[0] && !value.options.grados.includes(draft.grado)) draft.grado = value.options.grados[0]
  if (value.options.grupos[0] && !value.options.grupos.includes(draft.grupo)) draft.grupo = value.options.grupos[0]
}, { immediate: true })

function emptyDraft(): DraftState {
  return {
    id: '',
    title: '',
    summary: '',
    body: '',
    priority: 'normal',
    audienceKind: 'plantel',
    plantel: 'SM',
    nivel: 'Secundaria',
    grado: '1°',
    grupo: 'G',
    scheduledFor: '',
    attachments: []
  }
}

function buildPayload(status: CommunicationStatus) {
  return {
    id: draft.id || undefined,
    title: draft.title,
    summary: draft.summary,
    body: draft.body,
    status,
    priority: draft.priority,
    audience: {
      kind: draft.audienceKind,
      planteles: [draft.plantel],
      niveles: draft.audienceKind === 'plantel' ? [] : [draft.nivel],
      grados: draft.audienceKind === 'plantel' ? [] : [draft.grado],
      grupos: draft.audienceKind === 'grupo' ? [draft.grupo] : [],
      label: audienceLabel.value
    },
    scheduledFor: draft.scheduledFor ? new Date(draft.scheduledFor).toISOString() : null,
    attachments: draft.attachments
  }
}

function resetDraft() {
  Object.assign(draft, emptyDraft())
  saveError.value = ''
  notice.value = ''
}

function reload() {
  void refresh()
}

function loadRow(row: SchoolCommunication) {
  draft.id = row.id
  draft.title = row.title
  draft.summary = row.summary
  draft.body = row.body
  draft.priority = row.priority
  draft.audienceKind = row.audience.kind === 'custom' ? 'plantel' : row.audience.kind
  draft.plantel = row.audience.planteles[0] || plantelOptions.value[0] || 'SM'
  draft.nivel = row.audience.niveles?.[0] || nivelOptions.value[0] || 'Secundaria'
  draft.grado = row.audience.grados?.[0] || gradoOptions.value[0] || '1°'
  draft.grupo = row.audience.grupos?.[0] || grupoOptions.value[0] || 'G'
  draft.scheduledFor = row.scheduledFor ? row.scheduledFor.slice(0, 16) : ''
  draft.attachments = [...row.attachments]
  notice.value = 'Comunicado cargado para revisión.'
  saveError.value = ''
}

async function persist(status: CommunicationStatus) {
  saving.value = status
  saveError.value = ''
  notice.value = ''
  try {
    const saved = await $fetch<SchoolCommunication>('/api/admin/comunicados', {
      method: 'POST',
      body: buildPayload(status)
    })
    draft.id = saved.id
    notice.value = status === 'sent' ? 'Comunicado enviado.' : status === 'scheduled' ? 'Comunicado programado.' : 'Borrador guardado.'
    await refresh()
  } catch (error: unknown) {
    const failure = error as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    saveError.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible guardar el comunicado.'
  } finally {
    saving.value = ''
  }
}

function saveAsDraft() {
  return persist('draft')
}

function scheduleCommunication() {
  if (!canPublish.value) {
    saveError.value = 'Tu alcance permite preparar borradores, pero no programarlos. Solicita permiso de envío a superadmin.'
    return undefined
  }
  return persist('scheduled')
}

function sendCommunication() {
  if (!canPublish.value) {
    saveError.value = 'Tu alcance permite preparar borradores, pero no enviarlos. Solicita permiso de envío a superadmin.'
    return undefined
  }
  const ok = window.confirm(`Enviar este comunicado a ${audienceLabel.value}? Las familias podrán verlo de inmediato.`)
  if (!ok) return undefined
  return persist('sent')
}

async function handleFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (!files.length) return
  uploading.value = true
  attachmentError.value = ''
  try {
    for (const file of files) {
      const body = new FormData()
      body.append('file', file)
      const uploaded = await $fetch<CommunicationAttachment>('/api/admin/comunicados/uploads', { method: 'POST', body })
      draft.attachments.push(uploaded)
    }
  } catch (error: unknown) {
    const failure = error as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    attachmentError.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible subir el adjunto.'
  } finally {
    uploading.value = false
    input.value = ''
  }
}

function removeAttachment(id: string) {
  draft.attachments = draft.attachments.filter((attachment) => attachment.id !== id)
}

function fileSize(bytes: number) {
  if (!bytes) return 'archivo'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function dateLabel(value?: string | null) {
  if (!value) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}
</script>

<style scoped>
.admin-comms {
  display: grid;
  gap: 14px;
}

.comms-head {
  border-radius: 16px;
}

.alert-row,
.composer-card,
.preview-card,
.sent-list-card {
  background: rgba(255, 255, 255, .96);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: var(--shadow-soft);
}

.alert-row {
  align-items: center;
  color: #805b19;
  display: grid;
  gap: 12px;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  padding: 14px;
}

.alert-row > .pa-icon {
  background: #fff6e7;
  border-radius: 999px;
  height: 42px;
  padding: 10px;
  width: 42px;
}

.alert-row div {
  display: grid;
  gap: 3px;
}

.alert-row span,
.empty-copy,
.preview-body,
.preview-summary {
  color: var(--color-muted);
  font-weight: 700;
  line-height: 1.5;
  margin: 0;
}


.head-action-stack {
  align-items: flex-end;
  display: grid;
  gap: 8px;
  justify-items: end;
}

.permission-chip {
  background: #eef7ff;
  border: 1px solid #cfe7fb;
  border-radius: 999px;
  color: #236188;
  font-size: .72rem;
  font-weight: 900;
  padding: 6px 10px;
}

.permission-chip[data-global='true'] {
  background: var(--color-brand-100);
  border-color: var(--color-brand-200);
  color: var(--color-brand-800);
}

.admin-comms-layout {
  align-items: start;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1.1fr) minmax(360px, .9fr);
}

.composer-card,
.preview-card,
.sent-list-card {
  display: grid;
  gap: 14px;
  padding: 16px;
}

.composer-card header h2,
.preview-card h2,
.sent-list-card h2 {
  margin: 0;
}

.composer-form {
  display: grid;
  gap: 13px;
}

.composer-form .textarea {
  min-height: 150px;
}

.target-panel,
.attachments-editor {
  background: #f8fbfc;
  border: 1px solid #e2e8ec;
  border-radius: 16px;
  display: grid;
  gap: 12px;
  padding: 13px;
}

.audience-summary {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 999px;
  color: var(--color-brand-800);
  font-size: .72rem;
  font-weight: 900;
  padding: 6px 10px;
}

.segmented-control {
  background: #fff;
  border: 1px solid #e2e8ec;
  border-radius: 13px;
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 5px;
}

.segmented-control button {
  background: transparent;
  border: 0;
  border-radius: 9px;
  color: var(--color-muted);
  cursor: pointer;
  font: inherit;
  font-size: .78rem;
  font-weight: 850;
  min-height: 34px;
}

.segmented-control button.active {
  background: var(--color-brand-100);
  color: var(--color-brand-800);
}

.target-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.upload-button {
  align-items: center;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 11px;
  color: var(--color-brand-800);
  cursor: pointer;
  display: inline-flex;
  font-size: .78rem;
  font-weight: 900;
  gap: 7px;
  min-height: 36px;
  overflow: hidden;
  padding: 0 11px;
  position: relative;
}

.upload-button input {
  inset: 0;
  opacity: 0;
  position: absolute;
}

.inline-warning,
.inline-info,
.notice {
  border-radius: 12px;
  font-size: .82rem;
  font-weight: 800;
  margin: 0;
  padding: 9px 10px;
}

.inline-warning {
  background: #fff3f0;
  color: #9b3d34;
}

.inline-info,
.notice {
  background: var(--color-brand-100);
  color: var(--color-brand-800);
}

.attachment-list {
  display: grid;
  gap: 8px;
}

.attachment-pill {
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8ec;
  border-radius: 14px;
  display: grid;
  gap: 9px;
  grid-template-columns: 28px minmax(0, 1fr) 32px;
  min-height: 52px;
  padding: 8px 8px 8px 10px;
}

.attachment-pill span {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.attachment-pill strong,
.attachment-pill small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-pill small {
  color: var(--color-muted);
  font-size: .72rem;
}

.attachment-pill button {
  align-items: center;
  background: #fff3f0;
  border: 0;
  border-radius: 9px;
  color: #b4473f;
  cursor: pointer;
  display: inline-flex;
  height: 32px;
  justify-content: center;
  width: 32px;
}

.schedule-field {
  max-width: 320px;
}

.composer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.preview-stack {
  display: grid;
  gap: 14px;
  position: sticky;
  top: calc(var(--topbar-height) + 14px);
}

.preview-card {
  background:
    radial-gradient(circle at 100% 0, rgba(var(--pa-primary-rgb, 51, 65, 85), .12), transparent 10rem),
    #fff;
}

.preview-card[data-priority='urgent'] {
  border-color: #efc8be;
}

.preview-card header {
  align-items: start;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) 136px;
}

.priority-select {
  min-height: 36px;
}

.preview-card h2 {
  font-size: clamp(1.25rem, 2vw, 1.65rem);
}

.preview-body {
  background: rgba(255, 255, 255, .72);
  border: 1px solid #e4eaed;
  border-radius: 14px;
  min-height: 116px;
  padding: 12px;
  white-space: pre-wrap;
}

.preview-footer {
  color: var(--color-muted);
  display: flex;
  flex-wrap: wrap;
  font-size: .78rem;
  font-weight: 850;
  gap: 8px;
}

.preview-footer span {
  background: #f8fafc;
  border: 1px solid #e2e8ec;
  border-radius: 999px;
  padding: 6px 9px;
}

.admin-loading {
  display: grid;
  gap: 8px;
}

.admin-loading span {
  animation: pulse 1.1s ease-in-out infinite alternate;
  background: linear-gradient(90deg, #fff, var(--color-brand-100), #fff);
  border-radius: 12px;
  min-height: 56px;
}

@keyframes pulse {
  from { opacity: .55; }
  to { opacity: 1; }
}

.admin-comms-list {
  display: grid;
  gap: 8px;
}

.admin-comms-list button {
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8ec;
  border-radius: 13px;
  color: var(--color-ink);
  cursor: pointer;
  display: grid;
  font: inherit;
  gap: 8px;
  grid-template-columns: minmax(0, 1fr) 18px;
  min-height: 58px;
  padding: 9px 10px;
  text-align: left;
}

.admin-comms-list button[data-status='sent'] {
  border-left: 4px solid #55a249;
}

.admin-comms-list button[data-status='scheduled'] {
  border-left: 4px solid #e2a029;
}

.admin-comms-list span {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.admin-comms-list strong,
.admin-comms-list small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-comms-list small {
  color: var(--color-muted);
  font-size: .73rem;
}

@media (max-width: 1120px) {
  .admin-comms-layout {
    grid-template-columns: 1fr;
  }

  .preview-stack {
    position: static;
  }
}

@media (max-width: 760px) {
  .target-grid,
  .alert-row,
  .preview-card header {
    grid-template-columns: 1fr;
  }

  .composer-actions {
    display: grid;
  }
}
</style>
