<template>
  <FamilyPersonasAutorizadasShell title="Comunicados">
    <section class="communications-page" :data-state="pageState" data-product-panel="family-communications">
      <header class="communications-header" aria-label="Comunicados escolares">
        <div class="communications-title-block">
          <span class="communications-icon" aria-hidden="true"><FamilyPersonasIcon name="announcement" /></span>
          <div>
            <p>{{ contextLabel }}</p>
            <h1>Comunicados</h1>
          </div>
        </div>
        <button class="icon-action" type="button" :disabled="pending" aria-label="Actualizar comunicados" title="Actualizar" @click="reload">
          <FamilyPersonasIcon name="replace" />
        </button>
      </header>

      <section v-if="data" class="communications-metrics" aria-label="Resumen de comunicados">
        <article :data-active="data.metrics.unread > 0 ? 'true' : 'false'">
          <span>Sin leer</span>
          <strong>{{ data.metrics.unread }}</strong>
        </article>
        <article :data-active="data.metrics.important > 0 ? 'true' : 'false'">
          <span>Prioridad</span>
          <strong>{{ data.metrics.important }}</strong>
        </article>
        <article :data-active="data.metrics.withAttachments > 0 ? 'true' : 'false'">
          <span>Adjuntos</span>
          <strong>{{ data.metrics.withAttachments }}</strong>
        </article>
      </section>

      <div v-if="loadError" class="friendly-alert" data-state="error">
        <FamilyPersonasIcon name="announcement" />
        <div>
          <strong>Comunicados no disponibles</strong>
          <span>Intenta de nuevo.</span>
        </div>
        <button class="btn btn-secondary" type="button" @click="reload">Reintentar</button>
      </div>

      <section v-else-if="pending && !data" class="communications-loading" data-state="loading">
        <span v-for="item in 5" :key="item"></span>
      </section>

      <template v-else-if="data">
        <section v-if="!data.items.length" class="empty-announcements" data-state="empty" aria-label="Sin comunicados">
          <span class="empty-announcements-icon"><FamilyPersonasIcon name="announcement" /></span>
          <div>
            <h2>Sin comunicados</h2>
            <p>No hay publicaciones vigentes.</p>
          </div>
        </section>

        <template v-else>
          <nav class="communication-filters" aria-label="Filtrar comunicados">
            <button
              v-for="filter in filters"
              :key="filter.value"
              type="button"
              :class="{ active: activeFilter === filter.value }"
              @click="activeFilter = filter.value"
            >
              <span>{{ filter.label }}</span>
              <strong>{{ filter.count }}</strong>
            </button>
          </nav>

          <section class="communications-workspace">
            <div class="communication-list" aria-label="Lista de comunicados">
              <button
                v-for="item in visibleItems"
                :key="item.id"
                class="communication-row"
                :class="{ active: selectedItem?.id === item.id }"
                :data-priority="item.priority"
                :data-read="item.readState"
                type="button"
                @click="selectedId = item.id"
              >
                <span class="row-icon"><FamilyPersonasIcon :name="item.attachments.length ? 'attachment' : 'announcement'" /></span>
                <span class="row-copy">
                  <strong>{{ item.title }}</strong>
                  <small>{{ item.summary }}</small>
                  <em>{{ dateLabel(item.sentAt || item.updatedAt) }} · {{ item.senderName }}</em>
                </span>
                <span v-if="item.priority !== 'normal'" class="priority-chip">{{ priorityLabel(item.priority) }}</span>
              </button>
            </div>

            <article v-if="selectedItem" class="communication-detail" :data-priority="selectedItem.priority">
              <header>
                <span class="detail-kicker">{{ selectedItem.audienceLabel }}</span>
                <h2>{{ selectedItem.title }}</h2>
                <p>{{ selectedItem.summary }}</p>
                <div class="detail-meta">
                  <span>{{ dateLabel(selectedItem.sentAt || selectedItem.updatedAt) }}</span>
                  <span>{{ selectedItem.senderName }}</span>
                  <span>{{ selectedItem.senderRole }}</span>
                </div>
              </header>

              <p class="communication-body">{{ selectedItem.body }}</p>

              <section v-if="selectedItem.attachments.length" class="attachments-panel" aria-label="Adjuntos del comunicado">
                <h3>Adjuntos</h3>
                <a
                  v-for="attachment in selectedItem.attachments"
                  :key="attachment.id"
                  class="attachment-card"
                  :href="attachment.url"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span v-if="attachment.kind === 'image' && attachment.thumbnailUrl" class="attachment-preview image">
                    <img :src="attachment.thumbnailUrl" :alt="attachment.name" loading="lazy" />
                  </span>
                  <span v-else class="attachment-preview">
                    <FamilyPersonasIcon :name="attachment.kind === 'pdf' ? 'pdf' : 'document'" />
                  </span>
                  <span>
                    <strong>{{ attachment.name }}</strong>
                    <small>{{ attachmentLabel(attachment.kind) }} · {{ fileSize(attachment.size) }}</small>
                  </span>
                  <FamilyPersonasIcon name="arrow" />
                </a>
              </section>
            </article>
          </section>
        </template>
      </template>
    </section>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFetch } from 'nuxt/app'
import type { CommunicationAttachmentKind, FamilyCommunicationItem, FamilyCommunicationsResponse } from '~/types/communications'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

type FilterValue = 'all' | 'unread' | 'important' | 'attachments'

const { data, pending, error: loadError, refresh } = useFetch<FamilyCommunicationsResponse>('/api/family/comunicados', { timeout: 15000 })
const activeFilter = ref<FilterValue>('all')
const selectedId = ref('')

const items = computed(() => data.value?.items || [])
const pageState = computed(() => loadError.value ? 'error' : pending.value && !data.value ? 'loading' : items.value.length ? 'ready' : 'empty')
const contextLabel = computed(() => data.value?.context.audienceLabel || 'Familias')
const visibleItems = computed(() => items.value.filter((item) => {
  if (activeFilter.value === 'unread') return item.readState === 'unread'
  if (activeFilter.value === 'important') return item.priority !== 'normal'
  if (activeFilter.value === 'attachments') return item.attachments.length > 0
  return true
}))
const selectedItem = computed<FamilyCommunicationItem | null>(() => {
  return visibleItems.value.find((item) => item.id === selectedId.value) || visibleItems.value[0] || null
})
const filters = computed(() => [
  { value: 'all' as const, label: 'Todos', count: items.value.length },
  { value: 'unread' as const, label: 'Sin leer', count: items.value.filter((item) => item.readState === 'unread').length },
  { value: 'important' as const, label: 'Prioridad', count: items.value.filter((item) => item.priority !== 'normal').length },
  { value: 'attachments' as const, label: 'Adjuntos', count: items.value.filter((item) => item.attachments.length > 0).length }
])

watch(visibleItems, (next) => {
  if (!next.some((item) => item.id === selectedId.value)) selectedId.value = next[0]?.id || ''
}, { immediate: true })

function dateLabel(value?: string | null) {
  if (!value) return 'Fecha por confirmar'
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))
}

function reload() {
  void refresh()
}

function priorityLabel(priority: string) {
  if (priority === 'urgent') return 'Urgente'
  if (priority === 'important') return 'Importante'
  return 'Normal'
}

function attachmentLabel(kind: CommunicationAttachmentKind) {
  if (kind === 'pdf') return 'PDF'
  if (kind === 'image') return 'Imagen'
  if (kind === 'spreadsheet') return 'Hoja de cálculo'
  if (kind === 'document') return 'Documento'
  return 'Archivo'
}

function fileSize(bytes: number) {
  if (!bytes) return 'archivo'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
</script>

<style scoped>
.communications-page {
  display: grid;
  gap: 14px;
}

.communications-header,
.communications-metrics article,
.friendly-alert,
.empty-announcements,
.communication-row,
.communication-detail,
.communication-filters button {
  background: rgba(255, 255, 255, .96);
  border: 1px solid #e2e8ec;
  box-shadow: 0 12px 30px rgba(30, 53, 78, .05);
}

.communications-header {
  align-items: center;
  border-radius: 22px;
  display: flex;
  justify-content: space-between;
  min-height: 86px;
  padding: 16px 18px;
}

.communications-title-block {
  align-items: center;
  display: flex;
  gap: 13px;
  min-width: 0;
}

.communications-icon,
.icon-action,
.empty-announcements-icon,
.row-icon,
.attachment-preview {
  align-items: center;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  color: var(--pa-primary);
  display: grid;
  place-items: center;
}

.communications-icon {
  border-radius: 17px;
  height: 52px;
  width: 52px;
}

.communications-title-block div {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.communications-title-block p,
.communications-title-block h1,
.empty-announcements h2,
.empty-announcements p,
.communication-body,
.communication-detail header p {
  margin: 0;
}

.communications-title-block p {
  color: #728095;
  font-size: .72rem;
  font-weight: 850;
  letter-spacing: .11em;
  text-transform: uppercase;
}

.communications-title-block h1 {
  color: #1f2d46;
  font-size: clamp(1.55rem, 2.1vw, 2.05rem);
  line-height: 1.05;
}

.icon-action {
  border-radius: 999px;
  cursor: pointer;
  height: 44px;
  transition: opacity .18s ease, transform .18s ease;
  width: 44px;
}

.icon-action:disabled {
  cursor: wait;
  opacity: .58;
}

.icon-action:not(:disabled):hover {
  transform: translateY(-1px);
}

.communications-metrics {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.communications-metrics article {
  align-items: center;
  border-radius: 18px;
  display: flex;
  justify-content: space-between;
  min-height: 72px;
  padding: 14px 16px;
}

.communications-metrics article[data-active='true'] {
  border-color: rgba(var(--pa-primary-rgb), .24);
}

.communications-metrics span {
  color: #6f798a;
  font-size: .72rem;
  font-weight: 850;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.communications-metrics strong {
  color: #1f2d46;
  font-family: var(--font-title);
  font-size: 1.65rem;
  line-height: 1;
}

.friendly-alert {
  align-items: center;
  border-color: #f0d6a9;
  border-radius: 18px;
  color: #805b19;
  display: grid;
  gap: 12px;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  padding: 14px;
}

.friendly-alert > .pa-icon {
  background: #fff6e7;
  border-radius: 999px;
  height: 42px;
  padding: 10px;
  width: 42px;
}

.friendly-alert div {
  display: grid;
  gap: 3px;
}

.friendly-alert span,
.empty-announcements p,
.communication-body,
.communication-detail header p {
  color: #6f798a;
  font-weight: 700;
  line-height: 1.5;
}

.communications-loading {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.communications-loading span {
  animation: pulse 1.1s ease-in-out infinite alternate;
  background: linear-gradient(90deg, #fff, rgba(var(--pa-primary-rgb), .12), #fff);
  border: 1px solid #e2e8ec;
  border-radius: 18px;
  min-height: 118px;
}

@keyframes pulse {
  from { opacity: .52; }
  to { opacity: 1; }
}

.empty-announcements {
  align-items: center;
  border-radius: 22px;
  display: flex;
  gap: 16px;
  min-height: 124px;
  padding: 20px;
}

.empty-announcements-icon {
  border-radius: 18px;
  height: 58px;
  width: 58px;
}

.empty-announcements h2 {
  color: #1f2d46;
  font-size: clamp(1.22rem, 2vw, 1.55rem);
}

.communication-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.communication-filters button {
  align-items: center;
  border-radius: 999px;
  color: #627086;
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-size: .78rem;
  font-weight: 850;
  gap: 8px;
  min-height: 38px;
  padding: 0 12px;
}

.communication-filters button.active {
  background: var(--pa-soft);
  border-color: var(--pa-border);
  color: var(--pa-primary);
}

.communications-workspace {
  align-items: start;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(320px, .78fr) minmax(0, 1.22fr);
}

.communication-list {
  display: grid;
  gap: 9px;
}

.communication-row {
  align-items: start;
  border-radius: 18px;
  color: #1f2d46;
  cursor: pointer;
  display: grid;
  gap: 12px;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  min-height: 92px;
  padding: 12px;
  text-align: left;
  transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
  width: 100%;
}

.communication-row:hover,
.communication-row.active {
  border-color: rgba(var(--pa-primary-rgb), .28);
  box-shadow: 0 16px 34px rgba(30, 53, 78, .085);
  transform: translateY(-1px);
}

.communication-row[data-read='unread'] {
  border-left: 4px solid var(--pa-primary);
}

.row-icon {
  border-radius: 14px;
  height: 42px;
  width: 42px;
}

.row-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.row-copy strong,
.row-copy small,
.row-copy em {
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-copy strong {
  font-size: .9rem;
}

.row-copy small {
  color: #6f798a;
  font-size: .76rem;
  font-weight: 700;
  line-height: 1.35;
}

.row-copy em {
  color: #8993a3;
  font-size: .68rem;
  font-style: normal;
  font-weight: 800;
  white-space: nowrap;
}

.priority-chip {
  background: #fff3db;
  border-radius: 999px;
  color: #94610f;
  font-size: .66rem;
  font-weight: 900;
  padding: 5px 8px;
  white-space: nowrap;
}

.communication-row[data-priority='urgent'] .priority-chip,
.communication-detail[data-priority='urgent'] .detail-kicker {
  background: #fff0ef;
  color: #b34135;
}

.communication-detail {
  border-radius: 24px;
  display: grid;
  gap: 16px;
  min-height: 430px;
  padding: 20px;
}

.communication-detail header {
  border-bottom: 1px solid #e5ebef;
  display: grid;
  gap: 8px;
  padding-bottom: 16px;
}

.detail-kicker {
  background: var(--pa-soft);
  border-radius: 999px;
  color: var(--pa-primary);
  font-size: .7rem;
  font-weight: 900;
  justify-self: start;
  padding: 6px 10px;
}

.communication-detail h2 {
  font-size: clamp(1.35rem, 2vw, 1.8rem);
  margin: 0;
}

.detail-meta {
  color: #738094;
  display: flex;
  flex-wrap: wrap;
  font-size: .76rem;
  font-weight: 850;
  gap: 8px;
}

.detail-meta span:not(:last-child)::after {
  content: '·';
  margin-left: 8px;
}

.attachments-panel {
  display: grid;
  gap: 10px;
}

.attachments-panel h3 {
  margin: 0;
}

.attachment-card {
  align-items: center;
  background: #f8fbfc;
  border: 1px solid #e1e9ee;
  border-radius: 16px;
  display: grid;
  gap: 12px;
  grid-template-columns: 54px minmax(0, 1fr) 18px;
  min-height: 66px;
  padding: 8px 10px 8px 8px;
}

.attachment-preview {
  background: #fff;
  border-color: #dfe8ee;
  border-radius: 12px;
  height: 50px;
  overflow: hidden;
  width: 50px;
}

.attachment-preview.image img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.attachment-card span:nth-child(2) {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.attachment-card strong,
.attachment-card small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-card small {
  color: #6f798a;
  font-size: .74rem;
}

@media (max-width: 1080px) {
  .communications-workspace {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .communications-header,
  .communications-metrics,
  .communications-loading,
  .friendly-alert,
  .empty-announcements {
    grid-template-columns: 1fr;
  }

  .communications-header,
  .empty-announcements {
    align-items: flex-start;
  }

  .communications-metrics {
    gap: 8px;
  }

  .communications-metrics article {
    min-height: 64px;
  }

  .friendly-alert {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .friendly-alert button {
    grid-column: 1 / -1;
  }

  .communication-row {
    grid-template-columns: 38px minmax(0, 1fr);
  }

  .priority-chip {
    grid-column: 2;
    justify-self: start;
  }

  .communication-detail {
    padding: 16px;
  }
}

@media (max-width: 520px) {
  .communications-header,
  .communications-metrics article,
  .empty-announcements,
  .communication-detail {
    border-radius: 18px;
  }

  .communications-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
