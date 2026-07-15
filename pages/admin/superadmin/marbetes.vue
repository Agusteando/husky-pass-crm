<template>
  <section class="marbete-studio" data-product-area="superadmin" data-product-screen="marbete-templates">
    <header class="studio-head">
      <div>
        <p class="eyebrow">Accesos</p>
        <h1>Plantillas</h1>
        <p>Diseños usados al generar pases.</p>
      </div>
      <button class="btn btn-primary" type="button" data-diagnostic-action="nuevo-marbete" @click="startChooseMode">Nueva plantilla</button>
    </header>

    <section class="template-policy card" :data-custom-enabled="customTemplatesEnabled">
      <span class="policy-badge" aria-hidden="true">SVG</span>
      <div class="policy-copy">
        <p class="eyebrow">Generación de pases</p>
        <h2>Fuente de plantillas</h2>
        <div class="policy-status">
          <span class="base">Base activa · SVG institucional</span>
          <span :class="customTemplatesEnabled ? 'enabled' : 'disabled'">Personalizados · {{ customTemplatesEnabled ? 'habilitados' : 'deshabilitados' }}</span>
        </div>
      </div>
      <div class="policy-control">
        <label class="policy-switch">
          <input v-model="customTemplatesEnabled" type="checkbox" :disabled="settingsSaving" />
          <span aria-hidden="true"></span>
          <strong>Usar plantillas personalizadas</strong>
        </label>
        <button class="btn btn-primary" type="button" :disabled="!settingsDirty || settingsSaving" data-diagnostic-action="guardar-config-marbete" @click="saveSettings">
          {{ settingsSaving ? 'Guardando...' : settingsDirty ? 'Guardar configuración' : 'Configuración guardada' }}
        </button>
      </div>
    </section>

    <section v-if="loadError" class="load-error card" data-state="error">
      <span>No fue posible cargar las plantillas.</span>
      <button class="btn btn-secondary" type="button" @click="refresh()">Reintentar</button>
    </section>
    <div v-else-if="pending" class="card loading-card" data-state="loading">Cargando plantillas...</div>

    <section v-else class="studio-workspace">
      <aside class="version-sidebar" data-product-panel="marbete-version-list">
        <div class="sidebar-head">
          <div><span>Por nivel y ciclo</span><strong>Versiones</strong></div>
          <span class="count-pill">{{ templates.length }}</span>
        </div>

        <label class="filter-field">
          Nivel
          <select v-model="levelFilter">
            <option value="">Todos</option>
            <option v-for="level in availableLevels" :key="level" :value="level">{{ level }}</option>
          </select>
        </label>

        <div class="version-list">
          <button
            v-for="template in filteredTemplates"
            :key="template.id"
            type="button"
            :class="{ active: selected?.id === template.id }"
            :style="{ '--level-color': template.color }"
            @click="selectTemplate(template)"
          >
            <span class="level-mark"></span>
            <span class="version-copy">
              <strong>{{ template.name }}</strong>
              <small>{{ template.nivel }} · {{ template.cicloEscolar || 'Ciclo heredado' }}</small>
              <span class="version-meta">
                <em :class="`status-${template.status || 'published'}`">{{ statusLabel(template) }}</em>
                <em>{{ template.source === 'bundled-svg' ? 'SVG institucional' : template.mode === 'visual' ? 'Visual personalizado' : 'SVG personalizado' }}</em>
              </span>
            </span>
            <span v-if="template.source === 'bundled-svg'" class="active-chip base">Base</span>
            <span v-else-if="template.isDefault" class="active-chip" :class="{ paused: !customTemplatesEnabled }">{{ customTemplatesEnabled ? 'En uso' : 'Pausado' }}</span>
          </button>
          <EmptyState v-if="!filteredTemplates.length" title="Sin versiones" description="No hay plantillas para este nivel." />
        </div>
      </aside>

      <main class="studio-main">
        <section v-if="choosingMode" class="mode-picker card" data-product-panel="marbete-mode-picker">
          <div class="section-title">
            <div><p class="eyebrow">Nueva plantilla</p><h2>Tipo de plantilla</h2></div>
            <button class="link-button" type="button" @click="cancelCreate">Cancelar</button>
          </div>
          <div class="mode-options">
            <button type="button" data-diagnostic-action="crear-marbete-visual" @click="startCreate('visual')">
              <span class="mode-icon">✦</span>
              <strong>Editor visual</strong>
              <small>Fondo, campos y posiciones</small>
            </button>
            <button type="button" data-diagnostic-action="crear-marbete-svg" @click="startCreate('legacy-svg')">
              <span class="mode-icon">SVG</span>
              <strong>Archivo SVG</strong>
              <small>Plantilla completa con tokens</small>
            </button>
          </div>
        </section>

        <template v-else-if="editing">
          <section class="version-banner" :class="`tone-${form.status}`">
            <div>
              <span>{{ bannerStatus }}</span>
              <strong>{{ form.name || 'Nueva plantilla' }}</strong>
              <small>{{ versionContext }}</small>
            </div>
            <div class="banner-actions">
              <a v-if="form.id" class="btn btn-secondary" :href="previewSvgUrl" target="_blank" rel="noopener">Vista SVG</a>
              <a v-if="form.id" class="btn btn-secondary" :href="previewPdfUrl" target="_blank" rel="noopener">Probar PDF</a>
              <button v-if="!isBundledTemplate && form.status === 'draft'" class="btn btn-secondary danger" type="button" :disabled="acting || saving" @click="confirmingDelete = true">Eliminar</button>
              <button v-if="!isBundledTemplate && form.status === 'draft'" class="btn btn-primary" type="button" :disabled="saving" @click="saveTemplate">{{ saving ? 'Guardando...' : 'Guardar borrador' }}</button>
              <button v-if="!isBundledTemplate && form.id && form.status === 'draft'" class="btn btn-primary publish" type="button" :disabled="acting" @click="publishTemplate">Publicar</button>
              <button v-if="!isBundledTemplate && form.id && form.status === 'published' && !form.isDefault" class="btn btn-primary publish" type="button" :disabled="acting" @click="activateTemplate">Activar</button>
            </div>
          </section>

          <section v-if="form.status === 'published'" class="published-view card">
            <div class="section-title">
              <div><p class="eyebrow">Vista exacta</p><h2>{{ form.nivel }} · {{ form.cicloEscolar || 'Ciclo heredado' }}</h2></div>
              <span class="mode-badge">{{ isBundledTemplate ? 'Base SVG institucional' : form.mode === 'visual' ? 'Editor visual' : 'SVG personalizado' }}</span>
            </div>
            <iframe :src="previewSvgUrl" title="Vista de la plantilla publicada"></iframe>
            <div class="duplicate-panel">
              <strong>Siguiente ciclo</strong>
              <label>Ciclo <input v-model="duplicateCycle" class="input" placeholder="2027-2028" /></label>
              <button class="btn btn-primary" type="button" :disabled="acting" @click="duplicateTemplate">Duplicar</button>
            </div>
          </section>

          <template v-else>
            <form class="setup-card card" data-product-panel="marbete-setup" @submit.prevent="saveTemplate">
              <div class="section-title">
                <div><p class="eyebrow">Configuración</p><h2>Datos de plantilla</h2></div>
                <span class="mode-badge">{{ form.mode === 'visual' ? 'Editor visual' : 'SVG completo' }}</span>
              </div>
              <div class="setup-grid">
                <label class="label wide">Nombre de la versión<input v-model="form.name" class="input" required placeholder="Primaria · Ciclo 2026-2027" /></label>
                <label class="label">Tema
                  <select v-model="form.themeKey" class="select" required @change="themeChanged">
                    <option v-for="theme in themes" :key="theme.key" :value="theme.key">{{ theme.label }}</option>
                  </select>
                </label>
                <label class="label">Nivel<input v-model="form.nivel" class="input" required placeholder="primaria" /></label>
                <label class="label">Ciclo escolar<input v-model="form.cicloEscolar" class="input" required placeholder="2026-2027" /></label>
                <label class="label">Planteles<input v-model="form.planteles" class="input" placeholder="Todos" /></label>
              </div>
            </form>

            <MarbeteVisualEditor
              v-if="form.mode === 'visual'"
              v-model="form.visualDesign"
              :ciclo-escolar="form.cicloEscolar"
              :theme-key="form.themeKey"
              @artwork-selected="selectedArtwork = $event"
            />

            <section v-else class="legacy-card card" data-product-panel="marbete-legacy-upload">
              <div class="section-title">
                <div><p class="eyebrow">Archivo</p><h2>Plantilla SVG</h2></div>
                <span class="mode-badge legacy">Tokens existentes</span>
              </div>
              <label class="legacy-drop">
                <input ref="fileInput" type="file" accept=".svg,image/svg+xml" @change="selectLegacyFile" />
                <span>SVG</span>
                <strong>{{ legacyFileName || (form.filename ? form.filename : 'Seleccionar plantilla SVG') }}</strong>
                <small>{{ form.id ? 'Archivo actual disponible' : 'Archivo requerido' }}</small>
              </label>
            </section>

            <footer class="draft-footer">
              <button class="btn btn-secondary" type="button" @click="cancelCreate">Cancelar</button>
              <button class="btn btn-primary" type="button" :disabled="saving" data-diagnostic-action="guardar-borrador-marbete" @click="saveTemplate">{{ saving ? 'Guardando...' : 'Guardar borrador' }}</button>
            </footer>
          </template>
        </template>

        <EmptyState v-else title="Elige una plantilla" description="No hay una plantilla seleccionada." />

        <p v-if="actionError" class="alert action-message" data-state="error">{{ actionError }}</p>
        <p v-if="actionNotice" class="notice action-message">{{ actionNotice }}</p>
      </main>
    </section>

    <Teleport to="body">
      <section v-if="confirmingDelete" class="template-modal" @click.self="confirmingDelete = false">
        <article role="dialog" aria-modal="true" aria-labelledby="delete-template-title">
          <p class="eyebrow">Eliminar borrador</p>
          <h2 id="delete-template-title">{{ form.name || 'Plantilla sin nombre' }}</h2>
          <p>{{ form.nivel }} · {{ form.cicloEscolar }}</p>
          <footer>
            <button class="btn btn-secondary" type="button" :disabled="acting" @click="confirmingDelete = false">Cancelar</button>
            <button class="btn btn-primary danger" type="button" :disabled="acting" @click="deleteTemplate">{{ acting ? 'Eliminando...' : 'Eliminar' }}</button>
          </footer>
        </article>
      </section>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useFetch, useRoute, useRouter } from 'nuxt/app'
import MarbeteVisualEditor from '~/components/admin/MarbeteVisualEditor.vue'
import type {
  MarbeteTemplateListResponse,
  MarbeteTemplateMeta,
  MarbeteTemplateMode,
  MarbeteTemplateStatus,
  MarbeteVisualDesign,
  PersonasTheme,
  PersonasThemeKey
} from '~/types/daycare'
import { createDefaultMarbeteVisualDesign, normalizeMarbeteVisualDesign } from '~/utils/marbeteDesigner'

definePageMeta({ layout: 'admin', middleware: ['admin', 'superadmin'] })

const route = useRoute()
const router = useRouter()
const { data, pending, error: loadError, refresh } = useFetch<MarbeteTemplateListResponse>('/api/admin/marbete-templates', { timeout: 15000 })
const selectedId = ref(queryValue(route.query.plantilla))
const choosingMode = ref(false)
const editing = ref(false)
const levelFilter = ref(queryValue(route.query.nivel))
const saving = ref(false)
const acting = ref(false)
const confirmingDelete = ref(false)
const actionError = ref('')
const actionNotice = ref('')
const selectedArtwork = ref<File | null>(null)
const selectedLegacyFile = ref<File | null>(null)
const legacyFileName = ref('')
const duplicateCycle = ref('2027-2028')
const customTemplatesEnabled = ref(false)
const savedCustomTemplatesEnabled = ref(false)
const settingsSaving = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  id: '',
  name: '',
  nivel: '',
  planteles: '',
  themeKey: 'preescolar' as PersonasThemeKey,
  cicloEscolar: '2026-2027',
  mode: 'visual' as MarbeteTemplateMode,
  status: 'draft' as MarbeteTemplateStatus,
  isDefault: false,
  filename: '',
  source: 'custom' as 'bundled-svg' | 'custom',
  visualDesign: createDefaultMarbeteVisualDesign('preescolar') as MarbeteVisualDesign
})

const templates = computed(() => data.value?.templates || [])
const themes = computed<PersonasTheme[]>(() => data.value?.themes || [])
const settingsDirty = computed(() => customTemplatesEnabled.value !== savedCustomTemplatesEnabled.value)
const isBundledTemplate = computed(() => form.source === 'bundled-svg')
const bannerStatus = computed(() => {
  if (isBundledTemplate.value) return 'Base SVG institucional'
  if (form.status === 'draft') return 'Borrador personalizado'
  if (form.isDefault && customTemplatesEnabled.value) return 'Personalizado activo'
  if (form.isDefault) return 'Personalizado seleccionado · pausado'
  return 'Personalizado publicado'
})
const selected = computed(() => templates.value.find((template) => template.id === selectedId.value) || null)
const availableLevels = computed(() => Array.from(new Set(templates.value.map((item) => item.nivel).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es')))
const filteredTemplates = computed(() => templates.value
  .filter((template) => !levelFilter.value || template.nivel === levelFilter.value)
  .sort((left, right) => {
    const level = left.nivel.localeCompare(right.nivel, 'es')
    if (level) return level
    const active = Number(Boolean(right.isDefault)) - Number(Boolean(left.isDefault))
    if (active) return active
    return String(right.cicloEscolar || '').localeCompare(String(left.cicloEscolar || ''))
  }))
const versionContext = computed(() => [form.nivel || 'Nivel pendiente', form.cicloEscolar || 'Ciclo pendiente', form.source === 'bundled-svg' ? 'Institucional' : form.mode === 'visual' ? 'Editor visual' : 'SVG'].join(' · '))
const previewSvgUrl = computed(() => form.id ? `/api/admin/marbete-templates/${encodeURIComponent(form.id)}/preview?format=svg-preview&surface=print&scenario=long-name` : '')
const previewPdfUrl = computed(() => form.id ? `/api/admin/marbete-templates/${encodeURIComponent(form.id)}/preview?format=pdf&surface=print&scenario=long-name` : '')

watch(() => data.value?.settings, (settings) => {
  if (!settings || settingsDirty.value) return
  customTemplatesEnabled.value = Boolean(settings.customTemplatesEnabled)
  savedCustomTemplatesEnabled.value = Boolean(settings.customTemplatesEnabled)
}, { immediate: true })

watch(templates, (items) => {
  if (!items.length || choosingMode.value) return
  const requested = items.find((item) => item.id === selectedId.value)
  if (requested && (!editing.value || form.id !== requested.id)) {
    selectTemplate(requested, false)
    return
  }
  if (editing.value) return
  const first = items.find((item) => item.isDefault) || items[0]
  if (first) selectTemplate(first)
}, { immediate: true })

watch(levelFilter, () => syncRoute())

function loadForm(template: MarbeteTemplateMeta) {
  Object.assign(form, {
    id: template.id,
    name: template.name,
    nivel: template.nivel,
    planteles: template.planteles.join(', '),
    themeKey: template.themeKey,
    cicloEscolar: template.cicloEscolar || suggestedCycle(),
    mode: template.mode || 'legacy-svg',
    status: template.status || 'published',
    isDefault: Boolean(template.isDefault),
    filename: template.filename,
    source: template.source || 'custom',
    visualDesign: normalizeMarbeteVisualDesign(template.visualDesign, template.themeKey)
  })
  duplicateCycle.value = nextCycle(form.cicloEscolar)
}

function selectTemplate(template: MarbeteTemplateMeta, updateRoute = true) {
  selectedId.value = template.id
  choosingMode.value = false
  editing.value = true
  actionError.value = ''
  actionNotice.value = ''
  confirmingDelete.value = false
  selectedArtwork.value = null
  selectedLegacyFile.value = null
  legacyFileName.value = ''
  loadForm(template)
  if (updateRoute) syncRoute(template.id)
}

function startChooseMode() {
  selectedId.value = ''
  editing.value = false
  choosingMode.value = true
  actionError.value = ''
  actionNotice.value = ''
  confirmingDelete.value = false
  syncRoute('')
}

function startCreate(mode: MarbeteTemplateMode) {
  const themeKey: PersonasThemeKey = 'preescolar'
  Object.assign(form, {
    id: '',
    name: '',
    nivel: 'preescolar',
    planteles: '',
    themeKey,
    cicloEscolar: suggestedCycle(),
    mode,
    status: 'draft',
    isDefault: false,
    filename: '',
    source: 'custom',
    visualDesign: createDefaultMarbeteVisualDesign(themeKey)
  })
  choosingMode.value = false
  editing.value = true
  selectedArtwork.value = null
  selectedLegacyFile.value = null
  legacyFileName.value = ''
}

function cancelCreate() {
  choosingMode.value = false
  editing.value = false
  selectedId.value = ''
  const first = templates.value.find((item) => item.isDefault) || templates.value[0]
  if (first) selectTemplate(first)
}

function themeChanged() {
  if (!form.id && form.mode === 'visual') form.visualDesign = createDefaultMarbeteVisualDesign(form.themeKey)
  const theme = themes.value.find((item) => item.key === form.themeKey)
  if (!form.name && theme) form.name = `${theme.label} · ${form.cicloEscolar}`
  if (!form.nivel) form.nivel = form.themeKey === 'daycare' ? 'guarderia' : form.themeKey
}

function selectLegacyFile(event: Event) {
  selectedLegacyFile.value = (event.target as HTMLInputElement).files?.[0] || null
  legacyFileName.value = selectedLegacyFile.value?.name || ''
}

async function saveTemplate() {
  actionError.value = ''
  actionNotice.value = ''
  saving.value = true
  try {
    const body = new FormData()
    if (form.id) body.append('id', form.id)
    body.append('name', form.name)
    body.append('nivel', form.nivel)
    body.append('planteles', form.planteles)
    body.append('themeKey', form.themeKey)
    body.append('cicloEscolar', form.cicloEscolar)
    body.append('mode', form.mode)
    if (form.mode === 'visual') {
      body.append('visualDesign', JSON.stringify(form.visualDesign))
      if (selectedArtwork.value) body.append('artwork', selectedArtwork.value)
    } else if (selectedLegacyFile.value) {
      body.append('file', selectedLegacyFile.value)
    }
    const saved = await $fetch<MarbeteTemplateMeta>('/api/admin/marbete-templates', { method: 'POST', body })
    await refresh()
    selectedArtwork.value = null
    selectedLegacyFile.value = null
    legacyFileName.value = ''
    selectedId.value = saved.id
    loadForm(saved)
    syncRoute(saved.id)
    actionNotice.value = 'Borrador guardado.'
  } catch (error) {
    actionError.value = errorMessage(error, 'No fue posible guardar el borrador.')
  } finally {
    saving.value = false
  }
}

async function runAction(action: 'duplicate' | 'publish' | 'activate', cicloEscolar?: string) {
  if (!form.id) return null
  acting.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    const saved = await $fetch<MarbeteTemplateMeta>(`/api/admin/marbete-templates/${encodeURIComponent(form.id)}`, {
      method: 'POST', body: { action, cicloEscolar }
    })
    await refresh()
    selectedId.value = saved.id
    loadForm(saved)
    syncRoute(saved.id)
    return saved
  } catch (error) {
    actionError.value = errorMessage(error, 'No fue posible completar la acción.')
    return null
  } finally {
    acting.value = false
  }
}

async function publishTemplate() {
  const saved = await runAction('publish')
  if (saved) actionNotice.value = 'Plantilla publicada.'
}

async function activateTemplate() {
  const saved = await runAction('activate')
  if (saved) actionNotice.value = customTemplatesEnabled.value
    ? 'Plantilla activa para nuevos pases.'
    : 'Plantilla seleccionada; el uso personalizado está deshabilitado.'
}

async function duplicateTemplate() {
  const saved = await runAction('duplicate', duplicateCycle.value)
  if (saved) actionNotice.value = 'Borrador creado para el nuevo ciclo.'
}

async function deleteTemplate() {
  if (!form.id || form.status !== 'draft' || isBundledTemplate.value) return
  acting.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    const endpoint: string = `/api/admin/marbete-templates/${encodeURIComponent(form.id)}`
    await $fetch(endpoint, { method: 'DELETE' })
    confirmingDelete.value = false
    selectedId.value = ''
    editing.value = false
    await refresh()
    const first = templates.value.find((item) => item.isDefault) || templates.value[0]
    if (first) selectTemplate(first)
    else startChooseMode()
    actionNotice.value = 'Borrador eliminado.'
  } catch (error) {
    actionError.value = errorMessage(error, 'No fue posible eliminar el borrador.')
  } finally {
    acting.value = false
  }
}

function statusLabel(template: MarbeteTemplateMeta) {
  if (template.source === 'bundled-svg') return 'Base SVG'
  if (template.status === 'draft') return 'Borrador'
  if (template.isDefault) return customTemplatesEnabled.value ? 'Publicado · en uso' : 'Publicado · pausado'
  return 'Publicado'
}

async function saveSettings() {
  if (!settingsDirty.value) return
  settingsSaving.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    const settings = await $fetch<{ customTemplatesEnabled: boolean }>('/api/admin/marbete-templates/settings', {
      method: 'POST',
      body: { customTemplatesEnabled: customTemplatesEnabled.value }
    })
    customTemplatesEnabled.value = Boolean(settings.customTemplatesEnabled)
    savedCustomTemplatesEnabled.value = Boolean(settings.customTemplatesEnabled)
    await refresh()
    actionNotice.value = settings.customTemplatesEnabled
      ? 'Plantillas personalizadas habilitadas.'
      : 'Plantillas personalizadas deshabilitadas.'
  } catch (error) {
    customTemplatesEnabled.value = savedCustomTemplatesEnabled.value
    actionError.value = errorMessage(error, 'No fue posible guardar la configuración de plantillas.')
  } finally {
    settingsSaving.value = false
  }
}

function queryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || '').trim()
  return String(value || '').trim()
}

function syncRoute(templateId = selectedId.value) {
  if (!import.meta.client) return
  const query: Record<string, string> = {}
  if (templateId) query.plantilla = templateId
  if (levelFilter.value) query.nivel = levelFilter.value
  router.replace({ path: route.path, query })
}

function suggestedCycle() {
  const now = new Date()
  const start = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
  return `${start}-${start + 1}`
}

function nextCycle(value: string) {
  const match = value.match(/(20\d{2})-(20\d{2})/)
  if (!match) return suggestedCycle()
  return `${Number(match[1]) + 1}-${Number(match[2]) + 1}`
}

function errorMessage(error: unknown, fallback: string) {
  const failure = error as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
  return failure?.data?.statusMessage || failure?.statusMessage || failure?.message || fallback
}
</script>

<style scoped>
.marbete-studio {
  display: grid;
  gap: 14px;
}

.studio-head {
  align-items: end;
  background: linear-gradient(135deg, #f9fbfd 0%, #eef6fa 100%);
  border: 1px solid #dce5ed;
  border-radius: 24px;
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 22px 24px;
}

.studio-head h1,
.studio-head p {
  margin: 0;
}

.studio-head h1 {
  font-size: clamp(1.7rem, 3vw, 2.5rem);
  letter-spacing: -.035em;
}

.studio-head > div > p:last-child {
  color: #607184;
  line-height: 1.5;
  margin-top: 7px;
  max-width: 760px;
}

.head-actions,
.banner-actions,
.draft-footer {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}


.studio-workspace {
  display: grid;
  gap: 12px;
  grid-template-columns: 280px minmax(0, 1fr);
}

.version-sidebar {
  align-self: start;
  background: #fff;
  border: 1px solid #dfe6ed;
  border-radius: 20px;
  display: grid;
  gap: 12px;
  padding: 14px;
  position: sticky;
  top: calc(var(--topbar-height) + 12px);
}

.sidebar-head,
.section-title,
.version-banner,
.duplicate-panel {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.sidebar-head > div {
  display: grid;
}

.sidebar-head span,
.filter-field {
  color: #718096;
  font-size: .72rem;
  font-weight: 700;
}

.count-pill,
.mode-badge {
  background: #edf3f7;
  border-radius: 999px;
  color: #3c6179;
  font-size: .7rem;
  font-weight: 800;
  padding: 6px 9px;
}

.filter-field {
  display: grid;
  gap: 5px;
}

.filter-field select {
  background: #fff;
  border: 1px solid #ccd7e1;
  border-radius: 10px;
  min-height: 38px;
  padding: 7px 9px;
}

.version-list {
  display: grid;
  gap: 7px;
}

.version-list > button {
  align-items: start;
  background: #fff;
  border: 1px solid #e2e8ee;
  border-radius: 14px;
  cursor: pointer;
  display: grid;
  gap: 9px;
  grid-template-columns: 7px minmax(0, 1fr) auto;
  padding: 10px;
  text-align: left;
}

.version-list > button.active {
  background: #f4f8fb;
  border-color: var(--level-color);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--level-color) 16%, transparent);
}

.level-mark {
  background: var(--level-color);
  border-radius: 99px;
  height: 100%;
  min-height: 54px;
}

.version-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.version-copy strong,
.version-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.version-copy small {
  color: #748295;
  font-size: .72rem;
}

.version-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.version-meta em,
.active-chip {
  background: #eef2f6;
  border-radius: 999px;
  color: #5f6e80;
  font-size: .62rem;
  font-style: normal;
  font-weight: 800;
  padding: 3px 6px;
}

.version-meta .status-draft {
  background: #fff3d8;
  color: #8b5a06;
}

.version-meta .status-published,
.active-chip {
  background: #e7f5ed;
  color: #27734b;
}

.active-chip {
  white-space: nowrap;
}

.studio-main {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.mode-picker {
  display: grid;
  gap: 16px;
  padding: 20px;
}

.section-title h2,
.section-title p {
  margin: 0;
}

.link-button {
  background: transparent;
  border: 0;
  color: #2c6f96;
  cursor: pointer;
  font-weight: 800;
}

.mode-options {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.mode-options button {
  background: linear-gradient(145deg, #fff, #f5f8fb);
  border: 1px solid #dbe3eb;
  border-radius: 20px;
  cursor: pointer;
  display: grid;
  gap: 8px;
  padding: 20px;
  text-align: left;
}

.mode-options button:hover {
  border-color: #4d83a4;
  box-shadow: 0 14px 36px rgba(33, 75, 102, .1);
  transform: translateY(-1px);
}


.mode-options small {
  color: #68778a;
  font-size: .74rem;
  line-height: 1.4;
}

.mode-icon {
  align-items: center;
  background: #e6f1f6;
  border-radius: 13px;
  color: #286f93;
  display: flex;
  font-size: .8rem;
  font-weight: 900;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.version-banner {
  background: #fff7e5;
  border: 1px solid #f0d397;
  border-radius: 18px;
  padding: 14px 16px;
}

.version-banner.tone-published {
  background: #edf8f2;
  border-color: #bddfca;
}

.version-banner > div:first-child {
  display: grid;
  gap: 2px;
}

.version-banner span {
  color: #806020;
  font-size: .68rem;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.version-banner.tone-published span {
  color: #2a6d4a;
}

.version-banner small {
  color: #6b7683;
}

.publish {
  background: #286f50;
  border-color: #286f50;
}

.setup-card,
.legacy-card,
.published-view {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.setup-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.setup-grid .wide {
  grid-column: span 2;
}

.published-view iframe {
  aspect-ratio: 612 / 792;
  background: #f4f6f8;
  border: 1px solid #dbe2e9;
  border-radius: 16px;
  max-height: 760px;
  width: 100%;
}

.duplicate-panel {
  background: #f3f7fa;
  border-radius: 14px;
  padding: 12px;
}


.duplicate-panel label {
  color: #627184;
  display: grid;
  font-size: .7rem;
  font-weight: 700;
  gap: 4px;
}

.mode-badge.legacy {
  background: #f0eef9;
  color: #62558b;
}


.legacy-drop {
  align-items: center;
  background: #f8fafc;
  border: 1px dashed #aebdca;
  border-radius: 18px;
  cursor: pointer;
  display: grid;
  gap: 4px;
  grid-template-columns: 52px minmax(0, 1fr);
  padding: 18px;
}

.legacy-drop input {
  display: none;
}

.legacy-drop > span {
  align-items: center;
  background: #edeaf7;
  border-radius: 12px;
  color: #65558d;
  display: flex;
  font-size: .72rem;
  font-weight: 900;
  grid-row: span 2;
  height: 48px;
  justify-content: center;
}

.legacy-drop small {
  color: #738194;
}

.draft-footer {
  background: #fff;
  border: 1px solid #dfe5ec;
  border-radius: 18px;
  justify-content: flex-end;
  padding: 13px 15px;
  position: sticky;
  bottom: 8px;
  z-index: 5;
}



.action-message {
  margin: 0;
}

.notice {
  background: #eaf7ef;
  border: 1px solid #b9dfc8;
  border-radius: 14px;
  color: #235f42;
  font-weight: 700;
  padding: 10px 12px;
}

.template-policy {
  align-items: center;
  background:
    radial-gradient(circle at 90% 10%, rgba(91, 139, 66, .14), transparent 18rem),
    linear-gradient(135deg, #ffffff 0%, #f4f8f1 100%);
  border: 1px solid #d7e4d1;
  border-radius: 22px;
  display: grid;
  gap: 18px;
  grid-template-columns: 58px minmax(0, 1fr) minmax(250px, auto);
  padding: 18px 20px;
}

.policy-badge {
  align-items: center;
  background: #315f2d;
  border-radius: 17px;
  box-shadow: 0 12px 28px rgba(49, 95, 45, .18);
  color: #fff;
  display: flex;
  font-size: .78rem;
  font-weight: 900;
  height: 58px;
  justify-content: center;
  letter-spacing: .08em;
  width: 58px;
}

.policy-copy {
  display: grid;
  gap: 5px;
}

.policy-copy h2,
.policy-copy p {
  margin: 0;
}


.policy-status {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 5px;
}

.policy-status span {
  border-radius: 999px;
  font-size: .68rem;
  font-weight: 800;
  padding: 5px 9px;
}

.policy-status .base,
.active-chip.base {
  background: #e5f1df;
  color: #315f2d;
}

.policy-status .enabled {
  background: #e1f0f6;
  color: #236481;
}

.policy-status .disabled,
.active-chip.paused {
  background: #f0f2f4;
  color: #697482;
}

.policy-control {
  align-items: stretch;
  display: grid;
  gap: 9px;
  justify-items: stretch;
}

.policy-switch {
  align-items: center;
  background: rgba(255, 255, 255, .82);
  border: 1px solid #d7e2d3;
  border-radius: 14px;
  cursor: pointer;
  display: grid;
  gap: 9px;
  grid-template-columns: 42px minmax(0, 1fr);
  min-height: 46px;
  padding: 8px 11px;
}

.policy-switch input {
  height: 1px;
  opacity: 0;
  position: absolute;
  width: 1px;
}

.policy-switch > span {
  background: #cbd2ce;
  border-radius: 999px;
  height: 24px;
  position: relative;
  transition: background .2s ease;
  width: 42px;
}

.policy-switch > span::after {
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 7px rgba(31, 43, 36, .24);
  content: '';
  height: 18px;
  left: 3px;
  position: absolute;
  top: 3px;
  transition: transform .2s ease;
  width: 18px;
}

.policy-switch input:checked + span {
  background: #3f7a36;
}

.policy-switch input:checked + span::after {
  transform: translateX(18px);
}

.policy-switch input:focus-visible + span {
  outline: 3px solid rgba(44, 111, 150, .22);
  outline-offset: 2px;
}

.policy-switch strong {
  color: #344238;
  font-size: .78rem;
}

.loading-card {
  color: #6c7a8c;
}

.load-error {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 14px 16px;
}

.btn.danger {
  border-color: #e2b8b2;
  color: #9b4239;
}

.btn-primary.danger {
  background: #a9483f;
  border-color: #a9483f;
  color: #fff;
}

.template-modal {
  background: rgba(15, 23, 42, .4);
  display: grid;
  inset: 0;
  padding: 18px;
  place-items: center;
  position: fixed;
  z-index: 90;
}

.template-modal article {
  background: #fff;
  border: 1px solid #e3d7d5;
  border-radius: 22px;
  box-shadow: 0 28px 80px rgba(15, 23, 42, .26);
  display: grid;
  gap: 10px;
  max-width: 440px;
  padding: 22px;
  width: min(100%, 440px);
}

.template-modal h2,
.template-modal p {
  margin: 0;
}

.template-modal > article > p:not(.eyebrow) {
  color: #6b7888;
}

.template-modal footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}

@media (max-width: 1180px) {
  .studio-workspace {
    grid-template-columns: 240px minmax(0, 1fr);
  }

  .setup-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .template-policy {
    grid-template-columns: 54px minmax(0, 1fr);
  }

  .policy-control {
    grid-column: 1 / -1;
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .studio-head,
  .studio-workspace {
    grid-template-columns: 1fr;
  }

  .version-sidebar {
    position: static;
  }

  .mode-options {
    grid-template-columns: 1fr;
  }

  .version-banner,
  .duplicate-panel {
    align-items: stretch;
    flex-direction: column;
  }
}

@media (max-width: 620px) {
  .template-policy {
    align-items: start;
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .policy-badge {
    height: 46px;
    width: 46px;
  }

  .policy-control {
    grid-column: auto;
    grid-template-columns: 1fr;
  }

  .head-actions,
  .banner-actions,
  .draft-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .setup-grid {
    grid-template-columns: 1fr;
  }

  .setup-grid .wide {
    grid-column: span 1;
  }
}
</style>
