<template>
  <div class="marbetes-page">
    <header class="page-head card-surface">
      <div>
        <p class="eyebrow">Super Admin</p>
        <h1>Marbetes</h1>
        <p class="lead">Gestiona únicamente plantillas SVG por plantel, prepara ciclos futuros y ajusta capas dinámicas sobre bases existentes.</p>
      </div>
      <div class="head-actions">
        <button class="action-btn action-btn-secondary" type="button" @click="startUploadDraft">Subir SVG nuevo</button>
        <button class="action-btn" type="button" :disabled="!selectedTemplate" @click="duplicateSelected">Preparar desde la versión seleccionada</button>
      </div>
    </header>

    <div class="workspace-grid">
      <aside class="sidebar card-surface">
        <div class="sidebar-head">
          <div>
            <span class="eyebrow">Versiones</span>
            <h2>{{ filteredTemplates.length }}</h2>
          </div>
          <small>{{ templates.length }} totales</small>
        </div>

        <div class="filter-grid">
          <label>
            Plantel
            <select v-model="plantelFilter">
              <option value="">Todos</option>
              <option v-for="plantel in availablePlanteles" :key="plantel" :value="plantel">{{ plantel }}</option>
            </select>
          </label>
          <label>
            Nivel
            <select v-model="nivelFilter">
              <option value="">Todos</option>
              <option v-for="theme in themes" :key="theme.key" :value="theme.key">{{ theme.label }}</option>
            </select>
          </label>
          <label>
            Estado
            <select v-model="statusFilter">
              <option value="">Todos</option>
              <option value="draft">Borradores</option>
              <option value="published">Publicadas</option>
              <option value="default">Activas</option>
            </select>
          </label>
        </div>

        <div class="template-list">
          <button
            v-for="template in filteredTemplates"
            :key="template.id"
            class="template-card"
            :class="{ active: selectedId === template.id }"
            type="button"
            @click="selectedId = template.id"
          >
            <div class="template-card-head">
              <strong>{{ template.name }}</strong>
              <span class="status-pill" :class="statusClass(template)">{{ statusLabel(template) }}</span>
            </div>
            <span class="scope-line">{{ scopeLabel(template) }}</span>
            <span class="meta-line">{{ template.cicloEscolar || 'Sin ciclo específico' }} · {{ sourceLabel(template) }}</span>
          </button>
        </div>
      </aside>

      <section class="content-column">
        <template v-if="draft">
          <section class="card-surface edit-card">
            <div class="section-head">
              <div>
                <p class="eyebrow">Edición</p>
                <h2>{{ draft.id ? 'Borrador de marbete' : 'Nueva plantilla SVG' }}</h2>
              </div>
              <div class="inline-actions">
                <button class="action-btn action-btn-secondary" type="button" @click="cancelDraft">Cancelar</button>
                <button class="action-btn" type="button" :disabled="saving || !canSaveDraft" @click="saveDraft">{{ saving ? 'Guardando...' : 'Guardar borrador' }}</button>
              </div>
            </div>

            <div class="form-grid">
              <label>
                Nombre
                <input v-model.trim="draft.name" type="text" placeholder="Primaria PT · 2027-2028" />
              </label>
              <label>
                Tema / nivel
                <select v-model="draft.themeKey">
                  <option v-for="theme in themes" :key="theme.key" :value="theme.key">{{ theme.label }}</option>
                </select>
              </label>
              <label>
                Nivel (texto)
                <input v-model.trim="draft.nivel" type="text" placeholder="primaria" />
              </label>
              <label>
                Ciclo escolar
                <input v-model.trim="draft.cicloEscolar" type="text" placeholder="2027-2028" />
              </label>
              <label class="full-span">
                Planteles
                <select v-model="draft.planteles" multiple size="5">
                  <option v-for="plantel in availablePlanteles" :key="plantel" :value="plantel">{{ plantel }}</option>
                </select>
                <small>Si lo dejas vacío, la versión aplica como genérica para el tema.</small>
              </label>
              <label class="full-span upload-field">
                SVG base
                <input type="file" accept=".svg,image/svg+xml" @change="onSvgFileChange" />
                <small>{{ draft.fileName || (draft.baseSvg ? 'Usando SVG cargado o heredado' : 'Selecciona un SVG para empezar') }}</small>
              </label>
            </div>
          </section>

          <section v-if="draft.baseSvg" class="card-surface editor-shell">
            <AdminMarbeteSvgTemplateEditor
              v-model="draft.svgDesign"
              :base-svg="draft.baseSvg"
              :theme-key="draft.themeKey"
              :ciclo-escolar="draft.cicloEscolar"
            />
          </section>
          <section v-else class="card-surface empty-editor">
            <p>Carga un SVG o duplica una versión para comenzar a ajustar holograma, áreas dinámicas y reemplazos.</p>
          </section>
        </template>

        <template v-else-if="selectedTemplate">
          <section class="card-surface summary-card">
            <div class="section-head">
              <div>
                <p class="eyebrow">Versión seleccionada</p>
                <h2>{{ selectedTemplate.name }}</h2>
              </div>
              <div class="inline-actions">
                <button class="action-btn action-btn-secondary" type="button" @click="duplicateSelected">Duplicar</button>
                <button v-if="selectedTemplate.source === 'custom' && selectedTemplate.status === 'draft'" class="action-btn" type="button" @click="openDraftFromTemplate(selectedTemplate)">Editar</button>
                <button v-if="selectedTemplate.source === 'custom' && selectedTemplate.status === 'draft'" class="action-btn" type="button" @click="publishSelected">Publicar</button>
                <button v-if="selectedTemplate.source === 'custom' && selectedTemplate.status === 'published' && !selectedTemplate.isDefault" class="action-btn" type="button" @click="activateSelected">Activar</button>
                <button v-if="selectedTemplate.source === 'custom' && selectedTemplate.status === 'draft'" class="action-btn action-btn-danger" type="button" @click="deleteSelectedDraft">Eliminar</button>
              </div>
            </div>
            <div class="summary-grid">
              <article>
                <span>Alcance</span>
                <strong>{{ scopeLabel(selectedTemplate) }}</strong>
              </article>
              <article>
                <span>Estado</span>
                <strong>{{ statusLabel(selectedTemplate) }}</strong>
              </article>
              <article>
                <span>Ciclo</span>
                <strong>{{ selectedTemplate.cicloEscolar || 'Sin ciclo específico' }}</strong>
              </article>
              <article>
                <span>Origen</span>
                <strong>{{ sourceLabel(selectedTemplate) }}</strong>
              </article>
            </div>
          </section>

          <section class="card-surface preview-card">
            <div class="section-head compact">
              <div>
                <p class="eyebrow">Vista previa</p>
                <h2>Resultado compuesto</h2>
              </div>
              <small v-if="previewLoading">Cargando…</small>
            </div>
            <div class="preview-stage">
              <div v-if="selectedPreviewSvg" class="svg-preview" v-html="selectedPreviewSvg"></div>
              <p v-else class="empty-copy">No fue posible cargar la vista previa.</p>
            </div>
          </section>
        </template>

        <section v-else class="card-surface empty-editor">
          <p>Selecciona una versión o sube un SVG para comenzar.</p>
        </section>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useFetch, useRequestURL } from 'nuxt/app'
import type { MarbeteSvgDesign, MarbeteTemplateMeta, PersonasThemeKey } from '~/types/daycare'
import { createDefaultMarbeteSvgDesign, parseSvgCanvas } from '~/utils/marbeteSvgEditor'
import { MARBETE_REPRESENTATIVE_VALUES } from '~/utils/marbeteDesigner'
import { renderMarbeteSvgValues } from '~/utils/marbeteSvgRuntime'

interface ThemeOption {
  key: PersonasThemeKey
  label: string
}

interface TemplateListResponse {
  templates: MarbeteTemplateMeta[]
  themes: ThemeOption[]
  settings: { customTemplatesEnabled: boolean }
}

interface DraftState {
  id: string | null
  name: string
  nivel: string
  themeKey: PersonasThemeKey
  planteles: string[]
  cicloEscolar: string
  svgDesign: MarbeteSvgDesign
  baseSvg: string
  file: File | null
  fileName: string
}

const requestOrigin = useRequestURL().origin
const { data, refresh } = await useFetch<TemplateListResponse>('/api/admin/marbete-templates', {
  key: 'superadmin-marbetes'
})

const saving = ref(false)
const previewLoading = ref(false)
const selectedSvg = ref('')
const selectedId = ref('')
const draft = ref<DraftState | null>(null)
const plantelFilter = ref('')
const nivelFilter = ref('')
const statusFilter = ref('')

const templates = computed(() => data.value?.templates || [])
const themes = computed(() => data.value?.themes || [])
const availablePlanteles = computed(() => Array.from(new Set(templates.value.flatMap((template) => template.planteles || []).filter(Boolean))).sort())
const filteredTemplates = computed(() => templates.value
  .filter((template) => !plantelFilter.value || template.planteles.includes(plantelFilter.value))
  .filter((template) => !nivelFilter.value || template.themeKey === nivelFilter.value)
  .filter((template) => {
    if (!statusFilter.value) return true
    if (statusFilter.value === 'default') return Boolean(template.isDefault)
    return (template.status || 'published') === statusFilter.value
  })
  .sort((left, right) => {
    const statusScore = Number(Boolean(right.isDefault)) - Number(Boolean(left.isDefault))
    if (statusScore) return statusScore
    return String(right.updatedAt || '').localeCompare(String(left.updatedAt || ''))
  }))
const selectedTemplate = computed(() => templates.value.find((template) => template.id === selectedId.value) || null)
const selectedPreviewSvg = computed(() => {
  if (!selectedSvg.value) return ''
  return renderMarbeteSvgValues(selectedSvg.value, {
    ...MARBETE_REPRESENTATIVE_VALUES,
    ciclo: selectedTemplate.value?.cicloEscolar || MARBETE_REPRESENTATIVE_VALUES.ciclo
  }).replace(/(href|xlink:href)="\/(?!\/)/g, `$1="${requestOrigin}/`)
})
const canSaveDraft = computed(() => Boolean(
  draft.value?.name && draft.value?.nivel && draft.value?.themeKey && draft.value?.baseSvg
))

watch(templates, (items) => {
  if (!items.length) return
  if (!selectedId.value || !items.some((item) => item.id === selectedId.value)) {
    selectedId.value = items[0]?.id || ''
  }
}, { immediate: true })

watch(selectedId, async (id) => {
  if (!id) return
  if (draft.value?.id === id) return
  draft.value = null
  await loadPreview(id)
})

async function loadPreview(id: string) {
  previewLoading.value = true
  try {
    selectedSvg.value = await $fetch<string>(`/api/admin/marbete-templates/${id}`)
  } finally {
    previewLoading.value = false
  }
}

function emptyDraft(themeKey: PersonasThemeKey = 'preescolar') {
  return reactive<DraftState>({
    id: null,
    name: '',
    nivel: String(themeKey),
    themeKey,
    planteles: [],
    cicloEscolar: nextSchoolCycle(),
    svgDesign: createDefaultMarbeteSvgDesign(themeKey),
    baseSvg: '',
    file: null,
    fileName: ''
  })
}

function startUploadDraft() {
  draft.value = emptyDraft()
}

async function openDraftFromTemplate(template: MarbeteTemplateMeta) {
  const baseSvg = await $fetch<string>(`/api/admin/marbete-templates/${template.id}?base=1`)
  draft.value = reactive<DraftState>({
    id: template.id,
    name: template.name,
    nivel: template.nivel,
    themeKey: template.themeKey,
    planteles: [...(template.planteles || [])],
    cicloEscolar: template.cicloEscolar || nextSchoolCycle(),
    svgDesign: template.svgDesign || createDefaultMarbeteSvgDesign(template.themeKey, parseSvgCanvas(baseSvg)),
    baseSvg,
    file: null,
    fileName: template.filename || ''
  })
}

function cancelDraft() {
  draft.value = null
}

async function onSvgFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0] || null
  if (!draft.value) draft.value = emptyDraft()
  if (!file || !draft.value) return
  draft.value.file = file
  draft.value.fileName = file.name
  draft.value.baseSvg = await file.text()
  draft.value.svgDesign = createDefaultMarbeteSvgDesign(draft.value.themeKey, parseSvgCanvas(draft.value.baseSvg))
}

async function saveDraft() {
  if (!draft.value || !canSaveDraft.value) return
  saving.value = true
  try {
    const form = new FormData()
    form.append('id', draft.value.id || '')
    form.append('name', draft.value.name)
    form.append('nivel', draft.value.nivel)
    form.append('themeKey', draft.value.themeKey)
    form.append('planteles', draft.value.planteles.join(','))
    form.append('cicloEscolar', draft.value.cicloEscolar)
    form.append('svgDesign', JSON.stringify(draft.value.svgDesign))
    if (draft.value.file) form.append('file', draft.value.file)
    const saved = await $fetch<MarbeteTemplateMeta>('/api/admin/marbete-templates', { method: 'POST', body: form })
    await refresh()
    selectedId.value = saved.id
    draft.value = null
  } finally {
    saving.value = false
  }
}

async function duplicateSelected() {
  if (!selectedTemplate.value) return
  const suggested = nextSchoolCycle(selectedTemplate.value.cicloEscolar)
  const cicloEscolar = window.prompt('Nuevo ciclo escolar', suggested)
  if (!cicloEscolar) return
  const duplicated = await $fetch<MarbeteTemplateMeta>(`/api/admin/marbete-templates/${selectedTemplate.value.id}`, {
    method: 'POST',
    body: { action: 'duplicate', cicloEscolar }
  })
  await refresh()
  selectedId.value = duplicated.id
  await openDraftFromTemplate(duplicated)
}

async function publishSelected() {
  if (!selectedTemplate.value) return
  const updated = await $fetch<MarbeteTemplateMeta>(`/api/admin/marbete-templates/${selectedTemplate.value.id}`, {
    method: 'POST',
    body: { action: 'publish' }
  })
  await refresh()
  selectedId.value = updated.id
}

async function activateSelected() {
  if (!selectedTemplate.value) return
  const updated = await $fetch<MarbeteTemplateMeta>(`/api/admin/marbete-templates/${selectedTemplate.value.id}`, {
    method: 'POST',
    body: { action: 'activate' }
  })
  await refresh()
  selectedId.value = updated.id
}

async function deleteSelectedDraft() {
  if (!selectedTemplate.value) return
  if (!window.confirm('¿Eliminar este borrador de marbete?')) return
  await $fetch(`/api/admin/marbete-templates/${selectedTemplate.value.id}`, { method: 'DELETE' as any })
  await refresh()
  selectedId.value = templates.value[0]?.id || ''
}

function statusLabel(template: MarbeteTemplateMeta) {
  if (template.isDefault) return 'Activa'
  return template.status === 'draft' ? 'Borrador' : 'Publicada'
}

function statusClass(template: MarbeteTemplateMeta) {
  if (template.isDefault) return 'is-default'
  return template.status === 'draft' ? 'is-draft' : 'is-published'
}

function scopeLabel(template: MarbeteTemplateMeta) {
  return template.planteles?.length ? `${template.nivel} · ${template.planteles.join(' / ')}` : `${template.nivel} · genérica`
}

function sourceLabel(template: MarbeteTemplateMeta) {
  return template.source === 'bundled-svg' ? 'SVG institucional' : 'Versión personalizada'
}

function nextSchoolCycle(from?: string | null) {
  const normalized = String(from || '').match(/(20\d{2})-(20\d{2})/)
  if (normalized) return `${Number(normalized[1]) + 1}-${Number(normalized[2]) + 1}`
  const now = new Date()
  const start = now.getMonth() >= 7 ? now.getFullYear() + 1 : now.getFullYear()
  return `${start}-${start + 1}`
}
</script>

<style scoped>
.marbetes-page { display: grid; gap: 18px; }
.card-surface {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(205, 218, 228, 0.9);
  border-radius: 24px;
  box-shadow: 0 16px 44px rgba(23, 45, 77, 0.08);
}
.page-head {
  align-items: center;
  display: flex;
  gap: 18px;
  justify-content: space-between;
  padding: 24px 26px;
}
.page-head h1,
.page-head p { margin: 0; }
.eyebrow {
  color: #67809a;
  font-size: .73rem;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.page-head h1 { color: #172437; font-size: clamp(1.65rem, 2.2vw, 2.2rem); }
.lead { color: #556576; margin-top: 6px; max-width: 760px; }
.head-actions,
.inline-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.action-btn {
  background: linear-gradient(135deg, #0f766e, #1f8c82);
  border: 0;
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  font-weight: 800;
  min-height: 44px;
  padding: 0 16px;
}
.action-btn:disabled { cursor: not-allowed; opacity: .5; }
.action-btn-secondary { background: #edf3f8; color: #1f4464; }
.action-btn-danger { background: linear-gradient(135deg, #b65252, #d46a5d); }
.workspace-grid { display: grid; gap: 18px; grid-template-columns: 320px minmax(0, 1fr); }
.sidebar { display: grid; gap: 16px; height: fit-content; padding: 18px; position: sticky; top: calc(var(--topbar-height) + 20px); }
.sidebar-head { align-items: flex-end; display: flex; justify-content: space-between; }
.sidebar-head h2 { font-size: 1.8rem; margin: 2px 0 0; }
.filter-grid { display: grid; gap: 12px; }
.filter-grid label,
.form-grid label { color: #37495c; display: grid; gap: 6px; font-size: .84rem; font-weight: 700; }
.filter-grid select,
.form-grid input,
.form-grid select {
  background: #fff;
  border: 1px solid #d8e1ea;
  border-radius: 12px;
  min-height: 42px;
  padding: 0 12px;
}
.form-grid select[multiple] { min-height: 120px; padding: 10px 12px; }
.template-list { display: grid; gap: 10px; max-height: calc(100vh - 280px); overflow: auto; padding-right: 4px; }
.template-card {
  background: #fff;
  border: 1px solid #dde6ee;
  border-radius: 18px;
  cursor: pointer;
  display: grid;
  gap: 6px;
  padding: 14px;
  text-align: left;
}
.template-card.active { border-color: #4a8197; box-shadow: 0 0 0 3px rgba(74, 129, 151, .12); }
.template-card-head { align-items: center; display: flex; gap: 10px; justify-content: space-between; }
.template-card strong { color: #1b2d41; }
.scope-line { color: #43586e; font-size: .82rem; font-weight: 700; }
.meta-line { color: #6d7c8b; font-size: .76rem; }
.status-pill {
  border-radius: 999px;
  font-size: .68rem;
  font-weight: 800;
  padding: 4px 8px;
}
.status-pill.is-default { background: rgba(15, 118, 110, .14); color: #0f766e; }
.status-pill.is-draft { background: rgba(220, 164, 53, .14); color: #9a6b00; }
.status-pill.is-published { background: rgba(52, 101, 164, .12); color: #335f97; }
.content-column { display: grid; gap: 18px; }
.edit-card,
.summary-card,
.preview-card,
.empty-editor { padding: 20px 22px; }
.section-head { align-items: center; display: flex; gap: 16px; justify-content: space-between; margin-bottom: 18px; }
.section-head.compact { margin-bottom: 14px; }
.section-head h2,
.section-head p { margin: 0; }
.form-grid { display: grid; gap: 14px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.full-span { grid-column: 1 / -1; }
.form-grid small,
.upload-field small { color: #708095; font-weight: 600; }
.editor-shell { padding: 0; overflow: hidden; }
.empty-editor { color: #5d7084; min-height: 160px; place-items: center; display: grid; }
.summary-grid { display: grid; gap: 12px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.summary-grid article { background: #f6f9fc; border: 1px solid #e2eaf1; border-radius: 18px; display: grid; gap: 6px; padding: 14px; }
.summary-grid span { color: #728297; font-size: .73rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.summary-grid strong { color: #183048; font-size: .96rem; }
.preview-stage {
  background: linear-gradient(180deg, #f6f9fc 0%, #edf3f8 100%);
  border: 1px solid #dbe5ef;
  border-radius: 18px;
  display: flex;
  justify-content: center;
  min-height: 720px;
  padding: 18px;
}
.svg-preview { width: min(100%, 560px); }
.svg-preview :deep(svg) { display: block; height: auto; width: 100%; }
.empty-copy { align-self: center; color: #6d7d8d; }
@media (max-width: 1180px) {
  .workspace-grid { grid-template-columns: 1fr; }
  .sidebar { position: static; }
  .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 760px) {
  .page-head,
  .section-head { align-items: flex-start; flex-direction: column; }
  .form-grid,
  .summary-grid { grid-template-columns: 1fr; }
}
</style>
