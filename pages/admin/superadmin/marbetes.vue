<template>
  <div class="marbetes-page" data-product-screen="marbetes">
    <header class="page-head card-surface">
      <h1>Marbetes</h1>
    </header>

    <p v-if="actionError" class="page-message page-message-error" role="alert">{{ actionError }}</p>
    <p v-else-if="actionNotice" class="page-message" role="status">{{ actionNotice }}</p>

    <section v-if="pending && !data" class="card-surface loading-state" role="status">
      Cargando…
    </section>

    <div v-else class="workspace-grid">
      <aside class="level-rail card-surface" aria-label="Niveles">
        <button
          v-for="level in levels"
          :key="level.themeKey"
          class="level-card"
          :class="{ active: selectedThemeKey === level.themeKey }"
          type="button"
          @click="selectLevel(level.themeKey)"
        >
          <span class="level-mark" :style="{ '--level-color': level.original.color }" aria-hidden="true"></span>
          <span class="level-copy">
            <strong>{{ level.label }}</strong>
            <small>{{ level.customActive ? 'Personalizado' : 'Original' }}</small>
          </span>
          <span class="state-dot" :class="{ custom: level.customActive }" aria-hidden="true"></span>
        </button>
      </aside>

      <main class="content-column">
        <template v-if="draft && selectedLevel">
          <section class="card-surface edit-card">
            <div class="section-head">
              <div>
                <p class="eyebrow">{{ selectedLevel.label }}</p>
                <h2>Personalizar</h2>
              </div>
              <div class="inline-actions">
                <button class="action-btn action-btn-secondary" type="button" :disabled="saving" @click="cancelEditor">Cancelar</button>
                <button class="action-btn" type="button" :disabled="saving || !draft.baseSvg" @click="publishDraft">
                  {{ saving ? 'Publicando…' : 'Publicar' }}
                </button>
              </div>
            </div>

            <div class="svg-file-control">
              <span>SVG base</span>
              <strong>{{ draft.fileName }}</strong>
              <button class="file-button" type="button" @click="svgFileInput?.click()">Cambiar SVG</button>
              <input ref="svgFileInput" class="visually-hidden" type="file" accept=".svg,image/svg+xml" @change="onSvgFileChange" />
            </div>
          </section>

          <section class="card-surface editor-shell">
            <AdminMarbeteSvgTemplateEditor
              v-model="draft.svgDesign"
              :base-svg="draft.baseSvg"
              :theme-key="draft.themeKey"
              :preview-cycle="previewCycle"
            />
          </section>
        </template>

        <template v-else-if="selectedLevel && activeTemplate">
          <section class="card-surface summary-card">
            <div class="section-head summary-head">
              <div class="selected-title">
                <p class="eyebrow">Nivel</p>
                <div class="title-row">
                  <h2>{{ selectedLevel.label }}</h2>
                  <span class="mode-pill" :class="{ custom: selectedLevel.customActive }">
                    {{ selectedLevel.customActive ? 'Personalizado' : 'Original' }}
                  </span>
                </div>
              </div>
              <div class="inline-actions">
                <button class="action-btn action-btn-secondary" type="button" @click="openEditor">Personalizar</button>
                <button
                  v-if="selectedLevel.custom && !selectedLevel.customActive"
                  class="action-btn"
                  type="button"
                  :disabled="saving"
                  @click="publishExisting"
                >
                  Publicar
                </button>
                <button
                  v-if="selectedLevel.customActive"
                  class="action-btn action-btn-secondary"
                  type="button"
                  :disabled="saving"
                  @click="useOriginal"
                >
                  Usar original
                </button>
              </div>
            </div>
          </section>

          <section class="card-surface preview-card">
            <div class="preview-stage" :data-state="previewError ? 'error' : previewLoading ? 'loading' : 'ready'">
              <img
                v-if="previewUrl && !previewError"
                :key="previewUrl"
                class="svg-preview-image"
                :src="previewUrl"
                :alt="`Marbete de ${selectedLevel.label}`"
                @load="onPreviewLoad"
                @error="onPreviewError"
              />
              <div v-if="previewLoading" class="preview-loader" aria-hidden="true"></div>
              <button v-if="previewError" class="preview-retry" type="button" @click="retryPreview">Reintentar</button>
            </div>
          </section>
        </template>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFetch } from 'nuxt/app'
import type { MarbeteSvgDesign, MarbeteTemplateMeta, PersonasThemeKey } from '~/types/daycare'
import { createMarbeteSvgDesignFromBase, normalizeMarbeteSvgDesign, parseSvgCanvas, rebaseMarbeteSvgDesign } from '~/utils/marbeteSvgEditor'

definePageMeta({ layout: 'admin', middleware: ['admin', 'superadmin'] })

interface ThemeOption {
  key: PersonasThemeKey
  label: string
}

interface TemplateListResponse {
  templates: MarbeteTemplateMeta[]
  themes: ThemeOption[]
}

interface LevelState {
  themeKey: PersonasThemeKey
  label: string
  original: MarbeteTemplateMeta
  custom: MarbeteTemplateMeta | null
  customActive: boolean
}

interface DraftState {
  id: string | null
  basedOnId: string
  nivel: string
  themeKey: PersonasThemeKey
  svgDesign: MarbeteSvgDesign
  baseSvg: string
  file: File | null
  fileName: string
}

const levelLabelByTheme: Partial<Record<PersonasThemeKey, string>> = {
  daycare: 'Guardería / IECS',
  preescolar: 'Preescolar',
  primaria: 'Primaria',
  secundaria: 'Secundaria',
  iedis: 'IEDIS'
}

const nivelByTheme: Partial<Record<PersonasThemeKey, string>> = {
  daycare: 'guarderia',
  preescolar: 'preescolar',
  primaria: 'primaria',
  secundaria: 'secundaria',
  iedis: 'iedis'
}

const previewVariantByTheme: Partial<Record<PersonasThemeKey, string>> = {
  daycare: 'guarderia-cm',
  preescolar: 'preescolar-preem',
  primaria: 'primaria-pt',
  secundaria: 'secundaria-st',
  iedis: 'primaria-pt'
}

const { data, error: loadError, pending, refresh } = useFetch<TemplateListResponse>('/api/admin/marbete-templates', {
  key: 'superadmin-marbetes'
})

const svgFileInput = ref<HTMLInputElement | null>(null)
const selectedThemeKey = ref<PersonasThemeKey>('preescolar')
const draft = ref<DraftState | null>(null)
const saving = ref(false)
const previewLoading = ref(true)
const previewError = ref(false)
const previewRevision = ref(0)
const actionError = ref('')
const actionNotice = ref('')

const templates = computed(() => data.value?.templates || [])
const levels = computed<LevelState[]>(() => templates.value
  .filter((template) => template.source === 'bundled-svg')
  .map((original) => {
    const candidates = templates.value
      .filter((template) => template.source === 'custom' && template.themeKey === original.themeKey)
      .sort((left, right) => {
        const active = Number(Boolean(right.isDefault)) - Number(Boolean(left.isDefault))
        if (active) return active
        return String(right.updatedAt || '').localeCompare(String(left.updatedAt || ''))
      })
    const custom = candidates[0] || null
    return {
      themeKey: original.themeKey,
      label: levelLabelByTheme[original.themeKey] || original.name,
      original,
      custom,
      customActive: Boolean(custom?.isDefault && custom.status === 'published')
    }
  }))
const selectedLevel = computed(() => levels.value.find((level) => level.themeKey === selectedThemeKey.value) || levels.value[0] || null)
const activeTemplate = computed(() => selectedLevel.value?.customActive ? selectedLevel.value.custom : selectedLevel.value?.original || null)
const previewCycle = computed(() => {
  const now = new Date()
  const start = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
  return `${start}-${start + 1}`
})
const previewUrl = computed(() => {
  if (!activeTemplate.value || !selectedLevel.value) return ''
  const variant = previewVariantByTheme[selectedLevel.value.themeKey] || 'primaria-pt'
  return `/api/admin/marbete-templates/${encodeURIComponent(activeTemplate.value.id)}/preview?format=svg-preview&surface=print&scenario=long-name&variant=${encodeURIComponent(variant)}&v=${previewRevision.value}`
})

watch(loadError, (error) => {
  if (error) actionError.value = errorMessage(error, 'No fue posible cargar los marbetes.')
}, { immediate: true })

watch(levels, (items) => {
  if (!items.length) return
  if (!items.some((item) => item.themeKey === selectedThemeKey.value)) selectedThemeKey.value = items[0]!.themeKey
}, { immediate: true })

watch(previewUrl, () => {
  previewLoading.value = true
  previewError.value = false
})

function selectLevel(themeKey: PersonasThemeKey) {
  selectedThemeKey.value = themeKey
  draft.value = null
  actionError.value = ''
  actionNotice.value = ''
}

async function openEditor() {
  if (!selectedLevel.value) return
  actionError.value = ''
  actionNotice.value = ''
  const source = selectedLevel.value.custom || selectedLevel.value.original
  try {
    const payload = await $fetch<unknown>(`/api/admin/marbete-templates/${encodeURIComponent(source.id)}?base=1`, { responseType: 'text' })
    const baseSvg = normalizeSvgPayload(payload)
    if (!/<svg\b/i.test(baseSvg)) throw new Error('El archivo guardado no contiene un SVG válido.')
    draft.value = {
      id: selectedLevel.value.custom?.id || null,
      basedOnId: selectedLevel.value.custom?.basedOnId || selectedLevel.value.original.id,
      nivel: nivelByTheme[selectedLevel.value.themeKey] || selectedLevel.value.original.nivel,
      themeKey: selectedLevel.value.themeKey,
      svgDesign: selectedLevel.value.custom?.svgDesign
        ? normalizeMarbeteSvgDesign(selectedLevel.value.custom.svgDesign, selectedLevel.value.themeKey, parseSvgCanvas(baseSvg), baseSvg)
        : createMarbeteSvgDesignFromBase(baseSvg, selectedLevel.value.themeKey),
      baseSvg,
      file: null,
      fileName: source.filename || 'SVG institucional'
    }
  } catch (error) {
    actionError.value = errorMessage(error, 'No fue posible abrir el editor.')
  }
}

function cancelEditor() {
  draft.value = null
}

async function onSvgFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  if (!file || !draft.value) return
  actionError.value = ''
  try {
    const svg = await file.text()
    if (!/<svg\b/i.test(svg) || !/<\/svg>\s*$/i.test(svg.trim())) throw new Error('El archivo SVG no es válido.')
    draft.value.svgDesign = rebaseMarbeteSvgDesign(draft.value.svgDesign, draft.value.baseSvg, svg, draft.value.themeKey)
    draft.value.file = file
    draft.value.fileName = file.name
    draft.value.baseSvg = svg
  } catch (error) {
    input.value = ''
    actionError.value = errorMessage(error, 'No fue posible leer el SVG.')
  }
}

async function publishDraft() {
  if (!draft.value || !selectedLevel.value) return
  saving.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    const form = new FormData()
    form.append('id', draft.value.id || '')
    form.append('name', `${selectedLevel.value.label} personalizado`)
    form.append('nivel', draft.value.nivel)
    form.append('themeKey', draft.value.themeKey)
    form.append('basedOnId', draft.value.basedOnId)
    form.append('publish', '1')
    form.append('svgDesign', JSON.stringify(draft.value.svgDesign))
    if (draft.value.file) form.append('file', draft.value.file)
    await $fetch('/api/admin/marbete-templates', { method: 'POST', body: form })
    await refresh()
    draft.value = null
    previewRevision.value += 1
    actionNotice.value = 'Publicado.'
  } catch (error) {
    actionError.value = errorMessage(error, 'No fue posible publicar el marbete.')
  } finally {
    saving.value = false
  }
}

async function publishExisting() {
  const custom = selectedLevel.value?.custom
  if (!custom) return
  saving.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    await $fetch(`/api/admin/marbete-templates/${encodeURIComponent(custom.id)}`, {
      method: 'POST',
      body: { action: 'publish' }
    })
    await refresh()
    previewRevision.value += 1
    actionNotice.value = 'Publicado.'
  } catch (error) {
    actionError.value = errorMessage(error, 'No fue posible publicar el marbete.')
  } finally {
    saving.value = false
  }
}

async function useOriginal() {
  const custom = selectedLevel.value?.custom
  if (!custom) return
  saving.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    await $fetch(`/api/admin/marbete-templates/${encodeURIComponent(custom.id)}`, {
      method: 'POST',
      body: { action: 'unpublish' }
    })
    await refresh()
    previewRevision.value += 1
    actionNotice.value = 'SVG original activo.'
  } catch (error) {
    actionError.value = errorMessage(error, 'No fue posible activar el SVG original.')
  } finally {
    saving.value = false
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

function normalizeSvgPayload(payload: unknown) {
  if (typeof payload === 'string') return payload
  if (payload && typeof payload === 'object') {
    const candidate = payload as { svg?: unknown; data?: unknown; body?: unknown }
    for (const value of [candidate.svg, candidate.data, candidate.body]) {
      if (typeof value === 'string') return value
    }
  }
  return payload == null ? '' : String(payload)
}

function errorMessage(error: unknown, fallback: string) {
  const candidate = error as { data?: { message?: unknown }; statusMessage?: unknown; message?: unknown }
  const message = candidate?.data?.message || candidate?.statusMessage || candidate?.message
  return typeof message === 'string' && message.trim() ? message : fallback
}
</script>

<style scoped>
.marbetes-page { display: grid; gap: 18px; }
.card-surface {
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid rgba(205, 218, 228, 0.92);
  border-radius: 22px;
  box-shadow: 0 16px 44px rgba(23, 45, 77, 0.08);
}
.page-head { align-items: center; display: flex; min-height: 86px; padding: 20px 24px; }
.page-head h1 { color: #172437; font-size: clamp(1.65rem, 2.2vw, 2.2rem); margin: 0; }
.workspace-grid { display: grid; gap: 18px; grid-template-columns: 280px minmax(0, 1fr); }
.level-rail { display: grid; gap: 9px; height: fit-content; padding: 12px; position: sticky; top: calc(var(--topbar-height) + 20px); }
.level-card {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 15px;
  cursor: pointer;
  display: grid;
  gap: 11px;
  grid-template-columns: 8px minmax(0, 1fr) auto;
  padding: 13px 12px;
  text-align: left;
}
.level-card:hover { background: #f6f9fb; }
.level-card.active { background: #f1f6f8; border-color: #c7d9e1; }
.level-mark { align-self: stretch; background: var(--level-color); border-radius: 999px; min-height: 42px; }
.level-copy { display: grid; gap: 2px; }
.level-copy strong { color: #1c2f43; }
.level-copy small { color: #6b7c8e; font-size: .75rem; }
.state-dot { background: #bcc8d2; border: 3px solid #fff; border-radius: 999px; box-shadow: 0 0 0 1px #ccd6df; height: 12px; width: 12px; }
.state-dot.custom { background: #0f766e; box-shadow: 0 0 0 1px #7eb7b0; }
.content-column { display: grid; gap: 18px; min-width: 0; }
.edit-card, .summary-card, .preview-card { padding: 20px 22px; }
.section-head { align-items: center; display: flex; gap: 16px; justify-content: space-between; }
.section-head h2, .section-head p { margin: 0; }
.eyebrow { color: #67809a; font-size: .72rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.selected-title { display: grid; gap: 5px; }
.title-row { align-items: center; display: flex; flex-wrap: wrap; gap: 10px; }
.title-row h2 { color: #1b2d41; }
.mode-pill { background: #eef2f5; border-radius: 999px; color: #637383; font-size: .7rem; font-weight: 800; padding: 6px 10px; }
.mode-pill.custom { background: rgba(15, 118, 110, .13); color: #0f766e; }
.inline-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
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
.action-btn:disabled { cursor: not-allowed; opacity: .5; }
.action-btn-secondary { background: #edf3f8; color: #1f4464; }
.svg-file-control {
  align-items: center;
  background: #f6f9fc;
  border: 1px solid #dce5ed;
  border-radius: 14px;
  display: grid;
  gap: 4px;
  grid-template-columns: minmax(0, 1fr) auto;
  margin-top: 18px;
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
.visually-hidden { clip: rect(0 0 0 0); height: 1px; overflow: hidden; position: absolute; width: 1px; }
.editor-shell { overflow: hidden; padding: 0; }
.preview-card { padding: 18px; }
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
.preview-loader { animation: spin .8s linear infinite; border: 3px solid #d8e3eb; border-radius: 999px; border-top-color: #1f7c74; height: 34px; position: absolute; width: 34px; }
.preview-retry { background: #fff; border: 1px solid #cbd8e2; border-radius: 11px; color: #31536e; cursor: pointer; font-weight: 800; min-height: 42px; padding: 0 14px; }
.page-message { background: #edf8f5; border: 1px solid #b8ded5; border-radius: 14px; color: #175c53; margin: 0; padding: 12px 15px; }
.page-message-error { background: #fff2f0; border-color: #efc2bd; color: #963f39; }
.loading-state { color: #5d7084; display: grid; font-weight: 700; min-height: 180px; place-items: center; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 1080px) {
  .workspace-grid { grid-template-columns: 1fr; }
  .level-rail { grid-template-columns: repeat(2, minmax(0, 1fr)); position: static; }
}
@media (max-width: 720px) {
  .level-rail { grid-template-columns: 1fr; }
  .section-head { align-items: flex-start; flex-direction: column; }
  .inline-actions { justify-content: flex-start; }
  .preview-stage { min-height: 500px; }
}
</style>
