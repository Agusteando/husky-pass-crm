<template>
  <div class="marbetes-page" data-product-screen="marbetes">
    <header class="page-head card-surface">
      <div>
        <p class="eyebrow">Super Admin</p>
        <h1>Marbetes</h1>
        <p class="page-subtitle">SVG por plantel y ciclo escolar</p>
      </div>
      <button class="action-btn" type="button" @click="startUploadDraft">Subir SVG</button>
    </header>

    <p v-if="actionError" class="page-message page-message-error" role="alert">{{ actionError }}</p>
    <p v-else-if="actionNotice" class="page-message" role="status">{{ actionNotice }}</p>

    <section v-if="pending && !data" class="card-surface loading-state" role="status">
      Cargando marbetes…
    </section>

    <div v-else class="workspace-grid">
      <aside class="sidebar card-surface">
        <div class="sidebar-head">
          <div>
            <span class="eyebrow">SVG guardados</span>
            <h2>{{ filteredTemplates.length }}</h2>
          </div>
          <small>{{ templates.length }} totales</small>
        </div>

        <div class="filter-grid">
          <label>
            Plantel
            <select v-model="plantelFilter">
              <option value="">Todos</option>
              <option v-for="plantel in plantelOptions" :key="plantel" :value="plantel">{{ plantel }}</option>
            </select>
          </label>
          <label>
            Nivel
            <select v-model="nivelFilter">
              <option value="">Todos</option>
              <option v-for="theme in levelOptions" :key="theme.key" :value="theme.key">{{ theme.label }}</option>
            </select>
          </label>
          <label>
            Estado
            <select v-model="statusFilter">
              <option value="">Todos</option>
              <option value="default">En uso</option>
              <option value="draft">Borradores</option>
              <option value="published">Publicados</option>
            </select>
          </label>
        </div>

        <div class="template-list">
          <button
            v-for="template in filteredTemplates"
            :key="template.id"
            class="template-card"
            :class="{ active: selectedTemplate?.id === template.id }"
            type="button"
            @click="selectTemplate(template.id)"
          >
            <div class="template-card-head">
              <strong>{{ template.name }}</strong>
              <span class="status-pill" :class="statusClass(template)">{{ statusLabel(template) }}</span>
            </div>
            <span class="scope-line">{{ plantelLabel(template) }}</span>
            <span class="meta-line">{{ template.cicloEscolar || 'Sin ciclo' }} · {{ themeLabel(template.themeKey) }}</span>
          </button>
          <p v-if="!filteredTemplates.length" class="empty-list">No hay marbetes con estos filtros.</p>
        </div>
      </aside>

      <section class="content-column">
        <template v-if="draft">
          <section class="card-surface edit-card">
            <div class="section-head">
              <div>
                <p class="eyebrow">{{ draft.id ? 'Borrador' : 'Nuevo SVG' }}</p>
                <h2>{{ draftTitle }}</h2>
              </div>
              <div class="inline-actions">
                <button class="action-btn action-btn-secondary" type="button" @click="cancelDraft">Cancelar</button>
                <button class="action-btn" type="button" :disabled="saving || !canSaveDraft" @click="saveDraft">
                  {{ saving ? 'Guardando…' : 'Guardar borrador' }}
                </button>
              </div>
            </div>

            <div class="form-grid">
              <label>
                Nivel
                <select v-model="draft.themeKey" @change="syncDraftLevel">
                  <option v-for="theme in levelOptions" :key="theme.key" :value="theme.key">{{ theme.label }}</option>
                </select>
              </label>
              <label>
                Plantel
                <select v-model="draft.plantel" required>
                  <option value="" disabled>Selecciona un plantel</option>
                  <option v-for="plantel in plantelOptions" :key="plantel" :value="plantel">{{ plantel }}</option>
                </select>
              </label>
              <label>
                Ciclo escolar
                <input v-model.trim="draft.cicloEscolar" type="text" inputmode="numeric" placeholder="2027-2028" />
              </label>
              <div class="svg-file-control">
                <span>SVG base</span>
                <strong>{{ draft.fileName || 'SVG heredado' }}</strong>
                <button class="file-button" type="button" @click="svgFileInput?.click()">
                  {{ draft.baseSvg ? 'Reemplazar SVG' : 'Elegir SVG' }}
                </button>
                <input ref="svgFileInput" class="visually-hidden" type="file" accept=".svg,image/svg+xml" @change="onSvgFileChange" />
              </div>
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
          <section v-else class="card-surface upload-empty">
            <button class="upload-empty-button" type="button" @click="svgFileInput?.click()">
              <span aria-hidden="true">SVG</span>
              <strong>Seleccionar archivo SVG</strong>
            </button>
          </section>
        </template>

        <template v-else-if="selectedTemplate">
          <section class="card-surface summary-card">
            <div class="section-head">
              <div class="selected-title">
                <div class="selected-badges">
                  <span class="status-pill" :class="statusClass(selectedTemplate)">{{ statusLabel(selectedTemplate) }}</span>
                  <span class="plain-pill">{{ plantelLabel(selectedTemplate) }}</span>
                  <span class="plain-pill">{{ selectedTemplate.cicloEscolar || 'Sin ciclo' }}</span>
                </div>
                <h2>{{ selectedTemplate.name }}</h2>
              </div>
              <div class="inline-actions">
                <button class="action-btn action-btn-secondary" type="button" @click="openVersionDialog('replace')">Reemplazar SVG</button>
                <button class="action-btn action-btn-secondary" type="button" @click="openVersionDialog('cycle')">Crear versión para otro ciclo</button>
                <button v-if="isEditableDraft" class="action-btn" type="button" @click="openDraftFromTemplate(selectedTemplate)">Editar borrador</button>
                <button v-if="isEditableDraft" class="action-btn" type="button" @click="publishSelected">Publicar</button>
                <button v-if="canActivateSelected" class="action-btn" type="button" @click="activateSelected">Usar ahora</button>
                <button v-if="isEditableDraft" class="icon-danger-button" type="button" aria-label="Eliminar borrador" title="Eliminar borrador" @click="deleteSelectedDraft">Eliminar</button>
              </div>
            </div>
          </section>

          <section class="card-surface preview-card">
            <div class="section-head compact">
              <h2>Vista previa</h2>
              <small v-if="previewLoading">Cargando…</small>
            </div>
            <div class="preview-stage" :data-state="previewError ? 'error' : previewLoading ? 'loading' : 'ready'">
              <img
                v-if="selectedPreviewUrl && !previewError"
                :key="selectedPreviewUrl"
                class="svg-preview-image"
                :src="selectedPreviewUrl"
                alt="Vista previa del marbete seleccionado"
                @load="onPreviewLoad"
                @error="onPreviewError"
              />
              <div v-if="previewLoading" class="preview-loader" aria-hidden="true"></div>
              <div v-if="previewError" class="preview-error" role="alert">
                <strong>No se pudo mostrar el SVG.</strong>
                <button class="action-btn action-btn-secondary" type="button" @click="retryPreview">Reintentar</button>
              </div>
            </div>
          </section>
        </template>

        <section v-else class="card-surface empty-editor">
          <p>Selecciona un marbete.</p>
        </section>
      </section>
    </div>

    <Teleport to="body">
      <section v-if="versionDialog.open" class="modal-backdrop" @click.self="closeVersionDialog">
        <article class="version-modal" role="dialog" aria-modal="true" aria-labelledby="version-modal-title">
          <div>
            <p class="eyebrow">{{ versionDialog.mode === 'replace' ? 'Reemplazo' : 'Nueva versión' }}</p>
            <h2 id="version-modal-title">{{ versionDialog.mode === 'replace' ? 'Reemplazar el SVG' : 'Crear versión para otro ciclo' }}</h2>
          </div>
          <div class="modal-fields">
            <label>
              Plantel
              <select v-model="versionDialog.plantel">
                <option value="" disabled>Selecciona un plantel</option>
                <option v-for="plantel in plantelOptions" :key="plantel" :value="plantel">{{ plantel }}</option>
              </select>
            </label>
            <label>
              Ciclo escolar
              <input v-model.trim="versionDialog.cicloEscolar" type="text" inputmode="numeric" placeholder="2027-2028" />
            </label>
          </div>
          <footer>
            <button class="action-btn action-btn-secondary" type="button" @click="closeVersionDialog">Cancelar</button>
            <button class="action-btn" type="button" :disabled="versionDialog.saving || !versionDialog.plantel || !validCycle(versionDialog.cicloEscolar)" @click="createVersionDraft">
              {{ versionDialog.saving ? 'Creando…' : 'Crear borrador' }}
            </button>
          </footer>
        </article>
      </section>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useFetch } from 'nuxt/app'
import type { MarbeteSvgDesign, MarbeteTemplateMeta, PersonasThemeKey } from '~/types/daycare'
import { SCHOOL_PLANTELES } from '~/utils/schoolCatalog'
import { createDefaultMarbeteSvgDesign, parseSvgCanvas, resizeMarbeteSvgDesign } from '~/utils/marbeteSvgEditor'

definePageMeta({ layout: 'admin', middleware: ['admin', 'superadmin'] })

interface ThemeOption {
  key: PersonasThemeKey
  label: string
}

interface TemplateListResponse {
  templates: MarbeteTemplateMeta[]
  themes: ThemeOption[]
}

interface DraftState {
  id: string | null
  name: string
  nivel: string
  themeKey: PersonasThemeKey
  plantel: string
  cicloEscolar: string
  svgDesign: MarbeteSvgDesign
  baseSvg: string
  file: File | null
  fileName: string
}


const levelLabelByTheme: Record<PersonasThemeKey, string> = {
  admin: 'Administración',
  escolar: 'Escolar',
  iecs: 'IECS',
  daycare: 'Guardería',
  preescolar: 'Preescolar',
  primaria: 'Primaria',
  secundaria: 'Secundaria',
  iedis: 'IEDIS'
}

const nivelByTheme: Record<PersonasThemeKey, string> = {
  admin: 'admin',
  escolar: 'escolar',
  iecs: 'guarderia',
  daycare: 'guarderia',
  preescolar: 'preescolar',
  primaria: 'primaria',
  secundaria: 'secundaria',
  iedis: 'iedis'
}

const { data, error: loadError, pending, refresh } = useFetch<TemplateListResponse>('/api/admin/marbete-templates', {
  key: 'superadmin-marbetes'
})

const svgFileInput = ref<HTMLInputElement | null>(null)
const saving = ref(false)
const previewLoading = ref(true)
const previewError = ref(false)
const previewRevision = ref(0)
const actionError = ref('')
const actionNotice = ref('')
const selectedId = ref('')
const draft = ref<DraftState | null>(null)
const plantelFilter = ref('')
const nivelFilter = ref('')
const statusFilter = ref('')
const versionDialog = reactive({
  open: false,
  mode: 'cycle' as 'cycle' | 'replace',
  plantel: '',
  cicloEscolar: '',
  saving: false
})

const templates = computed(() => data.value?.templates || [])
const themes = computed(() => data.value?.themes || [])
const levelOptions = computed(() => Array.from(new Set([
  ...themes.value.map((theme) => theme.key),
  ...templates.value.map((template) => template.themeKey)
])).filter((key) => ['daycare', 'preescolar', 'primaria', 'secundaria', 'iedis'].includes(key)).map((key) => ({
  key,
  label: levelLabelByTheme[key]
})))
const plantelOptions = computed(() => Array.from(new Set([
  ...SCHOOL_PLANTELES,
  ...templates.value.flatMap((template) => template.planteles || [])
])).sort((left, right) => left.localeCompare(right, 'es')))
const filteredTemplates = computed(() => templates.value
  .filter((template) => !plantelFilter.value || template.planteles.includes(plantelFilter.value))
  .filter((template) => !nivelFilter.value || template.themeKey === nivelFilter.value)
  .filter((template) => {
    if (!statusFilter.value) return true
    if (statusFilter.value === 'default') return Boolean(template.isDefault)
    return (template.status || 'published') === statusFilter.value
  })
  .sort((left, right) => {
    const active = Number(Boolean(right.isDefault)) - Number(Boolean(left.isDefault))
    if (active) return active
    const cycle = String(right.cicloEscolar || '').localeCompare(String(left.cicloEscolar || ''))
    if (cycle) return cycle
    return String(right.updatedAt || '').localeCompare(String(left.updatedAt || ''))
  }))
const selectedTemplate = computed(() => templates.value.find((template) => template.id === selectedId.value) || templates.value[0] || null)
const isEditableDraft = computed(() => selectedTemplate.value?.source === 'custom' && selectedTemplate.value.status === 'draft')
const canActivateSelected = computed(() => selectedTemplate.value?.source === 'custom' && selectedTemplate.value.status === 'published' && !selectedTemplate.value.isDefault)
const selectedPreviewUrl = computed(() => {
  if (!selectedTemplate.value) return ''
  return `/api/admin/marbete-templates/${encodeURIComponent(selectedTemplate.value.id)}/preview?format=svg-preview&surface=print&scenario=long-name&v=${previewRevision.value}`
})
const canSaveDraft = computed(() => Boolean(
  draft.value?.plantel && draft.value?.themeKey && validCycle(draft.value?.cicloEscolar) && draft.value?.baseSvg
))
const draftTitle = computed(() => draft.value ? buildTemplateName(draft.value.themeKey, draft.value.plantel, draft.value.cicloEscolar) : '')

watch(loadError, (error) => {
  if (error) actionError.value = errorMessage(error, 'No fue posible cargar los marbetes.')
}, { immediate: true })

watch(selectedId, () => {
  previewLoading.value = true
  previewError.value = false
})

function selectTemplate(id: string) {
  selectedId.value = id
  draft.value = null
  actionError.value = ''
  actionNotice.value = ''
}

function emptyDraft(themeKey: PersonasThemeKey = 'preescolar') {
  return {
    id: null,
    name: '',
    nivel: nivelByTheme[themeKey],
    themeKey,
    plantel: '',
    cicloEscolar: currentSchoolCycle(),
    svgDesign: createDefaultMarbeteSvgDesign(themeKey),
    baseSvg: '',
    file: null,
    fileName: ''
  } satisfies DraftState
}

function startUploadDraft() {
  draft.value = emptyDraft()
  actionError.value = ''
  actionNotice.value = ''
}

function syncDraftLevel() {
  if (!draft.value) return
  draft.value.nivel = nivelByTheme[draft.value.themeKey]
}

async function openDraftFromTemplate(template: MarbeteTemplateMeta) {
  actionError.value = ''
  try {
    const baseSvg = await $fetch<string>(`/api/admin/marbete-templates/${encodeURIComponent(template.id)}?base=1`)
    draft.value = {
      id: template.id,
      name: template.name,
      nivel: template.nivel || nivelByTheme[template.themeKey],
      themeKey: template.themeKey,
      plantel: template.planteles?.[0] || '',
      cicloEscolar: template.cicloEscolar || currentSchoolCycle(),
      svgDesign: template.svgDesign || createDefaultMarbeteSvgDesign(template.themeKey, parseSvgCanvas(baseSvg)),
      baseSvg,
      file: null,
      fileName: template.filename || 'SVG heredado'
    }
  } catch (error) {
    actionError.value = errorMessage(error, 'No fue posible abrir el borrador.')
  }
}

function cancelDraft() {
  draft.value = null
}

async function onSvgFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  if (!draft.value) draft.value = emptyDraft()
  if (!file || !draft.value) return
  actionError.value = ''
  try {
    const svg = await file.text()
    if (!/<svg\b/i.test(svg) || !/<\/svg>\s*$/i.test(svg.trim())) throw new Error('El archivo no contiene un SVG completo.')
    const canvas = parseSvgCanvas(svg)
    draft.value.svgDesign = draft.value.baseSvg
      ? resizeMarbeteSvgDesign(draft.value.svgDesign, canvas, draft.value.themeKey)
      : createDefaultMarbeteSvgDesign(draft.value.themeKey, canvas)
    draft.value.file = file
    draft.value.fileName = file.name
    draft.value.baseSvg = svg
  } catch (error) {
    input.value = ''
    actionError.value = errorMessage(error, 'No fue posible leer el SVG.')
  }
}

async function saveDraft() {
  if (!draft.value || !canSaveDraft.value) return
  saving.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    draft.value.name = buildTemplateName(draft.value.themeKey, draft.value.plantel, draft.value.cicloEscolar)
    draft.value.nivel = nivelByTheme[draft.value.themeKey]
    const form = new FormData()
    form.append('id', draft.value.id || '')
    form.append('name', draft.value.name)
    form.append('nivel', draft.value.nivel)
    form.append('themeKey', draft.value.themeKey)
    form.append('planteles', draft.value.plantel)
    form.append('cicloEscolar', draft.value.cicloEscolar)
    form.append('svgDesign', JSON.stringify(draft.value.svgDesign))
    if (draft.value.file) form.append('file', draft.value.file)
    const saved = await $fetch<MarbeteTemplateMeta>('/api/admin/marbete-templates', { method: 'POST', body: form })
    await refresh()
    selectedId.value = saved.id
    draft.value = null
    previewRevision.value += 1
    actionNotice.value = 'Borrador guardado.'
  } catch (error) {
    actionError.value = errorMessage(error, 'No fue posible guardar el borrador.')
  } finally {
    saving.value = false
  }
}

function openVersionDialog(mode: 'cycle' | 'replace') {
  if (!selectedTemplate.value) return
  versionDialog.mode = mode
  versionDialog.plantel = selectedTemplate.value.planteles?.length === 1 ? selectedTemplate.value.planteles[0] || '' : ''
  versionDialog.cicloEscolar = mode === 'replace'
    ? selectedTemplate.value.cicloEscolar || currentSchoolCycle()
    : nextSchoolCycle(selectedTemplate.value.cicloEscolar)
  versionDialog.open = true
}

function closeVersionDialog() {
  if (versionDialog.saving) return
  versionDialog.open = false
}

async function createVersionDraft() {
  if (!selectedTemplate.value || !versionDialog.plantel || !validCycle(versionDialog.cicloEscolar)) return
  versionDialog.saving = true
  actionError.value = ''
  actionNotice.value = ''
  const current = selectedTemplate.value
  try {
    const duplicated = await $fetch<MarbeteTemplateMeta>(`/api/admin/marbete-templates/${encodeURIComponent(current.id)}`, {
      method: 'POST',
      body: {
        action: 'duplicate',
        cicloEscolar: versionDialog.cicloEscolar,
        plantel: versionDialog.plantel,
        name: buildTemplateName(current.themeKey, versionDialog.plantel, versionDialog.cicloEscolar)
      }
    })
    await refresh()
    selectedId.value = duplicated.id
    versionDialog.open = false
    await openDraftFromTemplate(duplicated)
    actionNotice.value = versionDialog.mode === 'replace' ? 'Borrador listo para reemplazar el SVG.' : 'Borrador creado.'
  } catch (error) {
    actionError.value = errorMessage(error, 'No fue posible crear el borrador.')
  } finally {
    versionDialog.saving = false
  }
}

async function publishSelected() {
  if (!selectedTemplate.value) return
  const current = selectedTemplate.value
  actionError.value = ''
  actionNotice.value = ''
  try {
    const updated = await $fetch<MarbeteTemplateMeta>(`/api/admin/marbete-templates/${encodeURIComponent(current.id)}`, {
      method: 'POST',
      body: { action: 'publish' }
    })
    await refresh()
    selectedId.value = updated.id
    previewRevision.value += 1
    actionNotice.value = 'Marbete publicado.'
  } catch (error) {
    actionError.value = errorMessage(error, 'No fue posible publicar el marbete.')
  }
}

async function activateSelected() {
  if (!selectedTemplate.value) return
  const current = selectedTemplate.value
  actionError.value = ''
  actionNotice.value = ''
  try {
    const updated = await $fetch<MarbeteTemplateMeta>(`/api/admin/marbete-templates/${encodeURIComponent(current.id)}`, {
      method: 'POST',
      body: { action: 'activate' }
    })
    await refresh()
    selectedId.value = updated.id
    previewRevision.value += 1
    actionNotice.value = 'Marbete en uso.'
  } catch (error) {
    actionError.value = errorMessage(error, 'No fue posible poner este marbete en uso.')
  }
}

async function deleteSelectedDraft() {
  if (!selectedTemplate.value) return
  const current = selectedTemplate.value
  if (!window.confirm('¿Eliminar este borrador?')) return
  actionError.value = ''
  actionNotice.value = ''
  try {
    await $fetch(`/api/admin/marbete-templates/${encodeURIComponent(current.id)}`, { method: 'DELETE' as any })
    await refresh()
    selectedId.value = templates.value[0]?.id || ''
    actionNotice.value = 'Borrador eliminado.'
  } catch (error) {
    actionError.value = errorMessage(error, 'No fue posible eliminar el borrador.')
  }
}

function onPreviewLoad() {
  previewLoading.value = false
  previewError.value = false
}

function onPreviewError() {
  previewLoading.value = false
  previewError.value = true
}

function retryPreview() {
  previewLoading.value = true
  previewError.value = false
  previewRevision.value += 1
}

function errorMessage(error: unknown, fallback: string) {
  const candidate = error as { data?: { message?: string }; statusMessage?: string; message?: string }
  return candidate?.data?.message || candidate?.statusMessage || candidate?.message || fallback
}

function statusLabel(template: MarbeteTemplateMeta) {
  if (template.isDefault) return 'En uso'
  return template.status === 'draft' ? 'Borrador' : 'Publicado'
}

function statusClass(template: MarbeteTemplateMeta) {
  if (template.isDefault) return 'is-default'
  return template.status === 'draft' ? 'is-draft' : 'is-published'
}

function plantelLabel(template: MarbeteTemplateMeta) {
  if (!template.planteles?.length) return 'Todos los planteles'
  return template.planteles.join(' / ')
}

function themeLabel(key: PersonasThemeKey) {
  return levelLabelByTheme[key] || key
}

function buildTemplateName(themeKey: PersonasThemeKey, plantel: string, cycle: string) {
  return [themeLabel(themeKey), plantel, cycle].filter(Boolean).join(' · ')
}

function validCycle(value?: string | null) {
  const match = String(value || '').match(/^(20\d{2})-(20\d{2})$/)
  return Boolean(match && Number(match[2]) === Number(match[1]) + 1)
}

function currentSchoolCycle() {
  const now = new Date()
  const start = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
  return `${start}-${start + 1}`
}

function nextSchoolCycle(from?: string | null) {
  const normalized = String(from || '').match(/(20\d{2})-(20\d{2})/)
  if (normalized) return `${Number(normalized[1]) + 1}-${Number(normalized[2]) + 1}`
  const current = currentSchoolCycle().match(/(20\d{2})-(20\d{2})/)
  return current ? `${Number(current[1]) + 1}-${Number(current[2]) + 1}` : ''
}
</script>

<style scoped>
.marbetes-page { display: grid; gap: 18px; }
.card-surface {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(205, 218, 228, 0.92);
  border-radius: 22px;
  box-shadow: 0 16px 44px rgba(23, 45, 77, 0.08);
}
.page-head {
  align-items: center;
  display: flex;
  gap: 18px;
  justify-content: space-between;
  padding: 22px 24px;
}
.page-head h1,
.page-head p { margin: 0; }
.page-head h1 { color: #172437; font-size: clamp(1.65rem, 2.2vw, 2.2rem); }
.page-subtitle { color: #647589; margin-top: 4px !important; }
.eyebrow {
  color: #67809a;
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.action-btn {
  background: linear-gradient(135deg, #0f766e, #1f8c82);
  border: 0;
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  font-weight: 800;
  min-height: 42px;
  padding: 0 15px;
}
.action-btn:disabled { cursor: not-allowed; opacity: .48; }
.action-btn-secondary { background: #edf3f8; color: #1f4464; }
.inline-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
.icon-danger-button {
  background: #fff2f0;
  border: 1px solid #efc2bd;
  border-radius: 12px;
  color: #a13e38;
  cursor: pointer;
  font-weight: 800;
  min-height: 42px;
  padding: 0 12px;
}
.workspace-grid { display: grid; gap: 18px; grid-template-columns: 310px minmax(0, 1fr); }
.sidebar { display: grid; gap: 16px; height: fit-content; padding: 18px; position: sticky; top: calc(var(--topbar-height) + 20px); }
.sidebar-head { align-items: flex-end; display: flex; justify-content: space-between; }
.sidebar-head h2 { font-size: 1.8rem; margin: 2px 0 0; }
.filter-grid { display: grid; gap: 10px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.filter-grid label,
.form-grid label,
.modal-fields label { color: #37495c; display: grid; gap: 6px; font-size: .8rem; font-weight: 700; }
.filter-grid select,
.form-grid input,
.form-grid select,
.modal-fields input,
.modal-fields select {
  background: #fff;
  border: 1px solid #d8e1ea;
  border-radius: 11px;
  min-height: 42px;
  padding: 0 11px;
}
.sidebar .filter-grid { grid-template-columns: 1fr; }
.template-list { display: grid; gap: 9px; max-height: calc(100vh - 300px); overflow: auto; padding-right: 3px; }
.template-card {
  background: #fff;
  border: 1px solid #dde6ee;
  border-radius: 16px;
  cursor: pointer;
  display: grid;
  gap: 5px;
  padding: 13px;
  text-align: left;
}
.template-card.active { border-color: #4a8197; box-shadow: 0 0 0 3px rgba(74, 129, 151, .12); }
.template-card-head { align-items: center; display: flex; gap: 8px; justify-content: space-between; }
.template-card strong { color: #1b2d41; }
.scope-line { color: #43586e; font-size: .8rem; font-weight: 700; }
.meta-line { color: #6d7c8b; font-size: .74rem; }
.status-pill,
.plain-pill {
  border-radius: 999px;
  font-size: .68rem;
  font-weight: 800;
  padding: 5px 9px;
  white-space: nowrap;
}
.status-pill.is-default { background: rgba(15, 118, 110, .14); color: #0f766e; }
.status-pill.is-draft { background: rgba(220, 164, 53, .16); color: #8b6207; }
.status-pill.is-published { background: rgba(52, 101, 164, .12); color: #335f97; }
.plain-pill { background: #eef3f7; color: #526679; }
.empty-list { color: #68798b; font-size: .82rem; text-align: center; }
.content-column { display: grid; gap: 18px; min-width: 0; }
.edit-card,
.summary-card,
.preview-card,
.empty-editor,
.upload-empty { padding: 20px 22px; }
.section-head { align-items: center; display: flex; gap: 16px; justify-content: space-between; margin-bottom: 18px; }
.section-head.compact { margin-bottom: 14px; }
.section-head h2,
.section-head p { margin: 0; }
.selected-title { display: grid; gap: 9px; }
.selected-badges { display: flex; flex-wrap: wrap; gap: 6px; }
.form-grid { display: grid; gap: 13px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.svg-file-control {
  align-items: center;
  background: #f6f9fc;
  border: 1px solid #dce5ed;
  border-radius: 14px;
  display: grid;
  gap: 4px;
  grid-column: 1 / -1;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 12px 14px;
}
.svg-file-control > span { color: #6d7d8d; font-size: .72rem; font-weight: 800; grid-column: 1; text-transform: uppercase; }
.svg-file-control > strong { color: #24384c; grid-column: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-button {
  background: #fff;
  border: 1px solid #cfdbe5;
  border-radius: 10px;
  color: #244a68;
  cursor: pointer;
  font-weight: 800;
  grid-column: 2;
  grid-row: 1 / span 2;
  min-height: 40px;
  padding: 0 13px;
}
.visually-hidden { height: 1px; overflow: hidden; position: absolute; width: 1px; clip: rect(0 0 0 0); }
.editor-shell { overflow: hidden; padding: 0; }
.upload-empty { display: grid; min-height: 260px; place-items: center; }
.upload-empty-button {
  background: #f5f9fc;
  border: 1px dashed #9eb5c7;
  border-radius: 18px;
  color: #27516f;
  cursor: pointer;
  display: grid;
  gap: 8px;
  min-width: min(100%, 360px);
  padding: 42px 24px;
}
.upload-empty-button span { font-size: 1.5rem; font-weight: 900; }
.preview-stage {
  align-items: center;
  background: linear-gradient(180deg, #f6f9fc 0%, #edf3f8 100%);
  border: 1px solid #dbe5ef;
  border-radius: 18px;
  display: flex;
  justify-content: center;
  min-height: 690px;
  overflow: hidden;
  padding: 18px;
  position: relative;
}
.svg-preview-image { display: block; height: auto; max-height: 650px; max-width: 560px; object-fit: contain; width: 100%; }
.preview-loader {
  animation: spin .8s linear infinite;
  border: 3px solid #d8e3eb;
  border-radius: 999px;
  border-top-color: #1f7c74;
  height: 34px;
  position: absolute;
  width: 34px;
}
.preview-error { align-items: center; color: #8e4c45; display: grid; gap: 14px; justify-items: center; }
.page-message {
  background: #edf8f5;
  border: 1px solid #b8ded5;
  border-radius: 14px;
  color: #175c53;
  margin: 0;
  padding: 12px 15px;
}
.page-message-error { background: #fff2f0; border-color: #efc2bd; color: #963f39; }
.loading-state,
.empty-editor { color: #5d7084; display: grid; font-weight: 700; min-height: 180px; place-items: center; }
.modal-backdrop {
  align-items: center;
  background: rgba(18, 30, 43, .48);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 20px;
  position: fixed;
  z-index: 100;
}
.version-modal {
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 28px 80px rgba(17, 33, 50, .28);
  display: grid;
  gap: 20px;
  max-width: 520px;
  padding: 24px;
  width: 100%;
}
.version-modal h2,
.version-modal p { margin: 0; }
.modal-fields { display: grid; gap: 13px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.version-modal footer { display: flex; gap: 9px; justify-content: flex-end; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 1180px) {
  .workspace-grid { grid-template-columns: 1fr; }
  .sidebar { position: static; }
  .template-list { max-height: 360px; }
}
@media (max-width: 820px) {
  .page-head,
  .section-head { align-items: flex-start; flex-direction: column; }
  .inline-actions { justify-content: flex-start; }
  .form-grid,
  .modal-fields { grid-template-columns: 1fr; }
  .preview-stage { min-height: 500px; }
}
</style>
