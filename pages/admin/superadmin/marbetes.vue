<template>
  <section class="marbete-studio" data-product-area="superadmin" data-product-screen="marbete-templates">
    <header class="studio-head">
      <div>
        <p class="eyebrow">Superadmin · Husky Pass</p>
        <h1>Diseños de marbete</h1>
        <p>Crea el diseño del ciclo, comprueba la impresión y actívalo cuando esté listo. Las familias conservan la versión publicada mientras trabajas.</p>
      </div>
      <div class="head-actions">
        <NuxtLink class="btn btn-secondary" to="/admin/superadmin/personas-autorizadas">Ver Husky Pass</NuxtLink>
        <button class="btn btn-primary" type="button" data-diagnostic-action="nuevo-marbete" @click="startChooseMode">Nuevo diseño</button>
      </div>
    </header>

    <section class="journey-strip" aria-label="Flujo de publicación">
      <article><span>1</span><div><strong>Prepara</strong><small>Elige nivel, ciclo y fondo.</small></div></article>
      <article><span>2</span><div><strong>Ajusta y revisa</strong><small>Mueve solo el contenido real del marbete.</small></div></article>
      <article><span>3</span><div><strong>Publica y activa</strong><small>La versión anterior sigue disponible hasta el cambio.</small></div></article>
    </section>

    <p v-if="loadError" class="alert" data-state="error">No fue posible cargar los diseños. Recarga la página para volver a intentar.</p>
    <div v-else-if="pending" class="card loading-card" data-state="loading">Cargando versiones de marbete...</div>

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
                <em>{{ template.mode === 'visual' ? 'Visual' : 'SVG completo' }}</em>
              </span>
            </span>
            <span v-if="template.isDefault" class="active-chip">Activo</span>
          </button>
          <EmptyState v-if="!filteredTemplates.length" title="Sin versiones" description="Crea el primer diseño para este nivel." />
        </div>
      </aside>

      <main class="studio-main">
        <section v-if="choosingMode" class="mode-picker card" data-product-panel="marbete-mode-picker">
          <div class="section-title">
            <div><p class="eyebrow">Nuevo diseño</p><h2>¿Cómo quieres prepararlo?</h2></div>
            <button class="link-button" type="button" @click="cancelCreate">Cancelar</button>
          </div>
          <div class="mode-options">
            <button type="button" data-diagnostic-action="crear-marbete-visual" @click="startCreate('visual')">
              <span class="mode-icon">✦</span>
              <strong>Editor visual</strong>
              <p>Sube el fondo y acomoda fotos, nombres, QR, parentesco y ciclo sin tocar código.</p>
              <em>Recomendado para cada ciclo</em>
            </button>
            <button type="button" data-diagnostic-action="crear-marbete-svg" @click="startCreate('legacy-svg')">
              <span class="mode-icon">SVG</span>
              <strong>SVG completo</strong>
              <p>Mantén el flujo anterior para archivos que ya contienen todo el diseño y sus tokens.</p>
              <em>Compatibilidad heredada</em>
            </button>
          </div>
        </section>

        <template v-else-if="editing">
          <section class="version-banner" :class="`tone-${form.status}`">
            <div>
              <span>{{ form.status === 'draft' ? 'Borrador protegido' : form.isDefault ? 'Publicado y activo' : 'Publicado' }}</span>
              <strong>{{ form.name || 'Nuevo diseño' }}</strong>
              <small v-if="form.status === 'draft' && activeReplacement">Las familias siguen usando “{{ activeReplacement.name }}” hasta que publiques y actives este reemplazo.</small>
              <small v-else-if="form.status === 'draft'">Este borrador todavía no es visible para las familias.</small>
              <small v-else>{{ form.isDefault ? 'Esta versión resuelve actualmente los Husky Pass del nivel.' : 'Está publicada, pero no seleccionada como versión activa.' }}</small>
            </div>
            <div class="banner-actions">
              <a v-if="form.id" class="btn btn-secondary" :href="previewSvgUrl" target="_blank" rel="noopener">Vista SVG</a>
              <a v-if="form.id" class="btn btn-secondary" :href="previewPdfUrl" target="_blank" rel="noopener">Probar PDF</a>
              <button v-if="form.status === 'draft'" class="btn btn-primary" type="button" :disabled="saving" @click="saveTemplate">{{ saving ? 'Guardando...' : 'Guardar borrador' }}</button>
              <button v-if="form.id && form.status === 'draft'" class="btn btn-primary publish" type="button" :disabled="acting" @click="publishTemplate">Publicar</button>
              <button v-if="form.id && form.status === 'published' && !form.isDefault" class="btn btn-primary publish" type="button" :disabled="acting" @click="activateTemplate">Activar para familias</button>
            </div>
          </section>

          <section v-if="form.status === 'published'" class="published-view card">
            <div class="section-title">
              <div><p class="eyebrow">Vista exacta</p><h2>{{ form.nivel }} · {{ form.cicloEscolar || 'Ciclo heredado' }}</h2></div>
              <span class="mode-badge">{{ form.mode === 'visual' ? 'Editor visual' : 'SVG completo' }}</span>
            </div>
            <iframe :src="previewSvgUrl" title="Vista del diseño publicado"></iframe>
            <div class="duplicate-panel">
              <div><strong>¿Preparar el siguiente ciclo?</strong><small>Se crea un borrador independiente. Esta versión seguirá publicada.</small></div>
              <label>Nuevo ciclo <input v-model="duplicateCycle" class="input" placeholder="2027-2028" /></label>
              <button class="btn btn-primary" type="button" :disabled="acting" @click="duplicateTemplate">Duplicar para nuevo ciclo</button>
            </div>
          </section>

          <template v-else>
            <form class="setup-card card" data-product-panel="marbete-setup" @submit.prevent="saveTemplate">
              <div class="section-title">
                <div><p class="eyebrow">Paso 1 · Identificación</p><h2>Nivel y ciclo escolar</h2></div>
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
                <label class="label">Planteles opcionales<input v-model="form.planteles" class="input" placeholder="PT, PM" /></label>
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
                <div><p class="eyebrow">Flujo compatible</p><h2>SVG completo</h2></div>
                <span class="mode-badge legacy">Sin cambios al renderer</span>
              </div>
              <p>La plataforma seguirá reemplazando los tokens existentes y usando el mismo SVG para vista previa, descarga y PDF.</p>
              <label class="legacy-drop">
                <input ref="fileInput" type="file" accept=".svg,image/svg+xml" @change="selectLegacyFile" />
                <span>SVG</span>
                <strong>{{ legacyFileName || (form.filename ? form.filename : 'Seleccionar plantilla SVG') }}</strong>
                <small>{{ form.id ? 'Puedes conservar el archivo del borrador o elegir otro.' : 'El archivo es obligatorio para crear la versión.' }}</small>
              </label>
            </section>

            <footer class="draft-footer">
              <div><strong>Guarda para habilitar las pruebas de SVG y PDF.</strong><small>Publicar no activa automáticamente: podrás revisar y hacer el cambio final por separado.</small></div>
              <button class="btn btn-secondary" type="button" @click="cancelCreate">Cancelar</button>
              <button class="btn btn-primary" type="button" :disabled="saving" data-diagnostic-action="guardar-borrador-marbete" @click="saveTemplate">{{ saving ? 'Guardando...' : 'Guardar borrador' }}</button>
            </footer>
          </template>
        </template>

        <EmptyState v-else title="Elige una versión" description="Selecciona un ciclo para revisar su estado, probar el PDF o preparar el reemplazo." />

        <p v-if="actionError" class="alert action-message" data-state="error">{{ actionError }}</p>
        <p v-if="actionNotice" class="notice action-message">{{ actionNotice }}</p>
      </main>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useFetch } from 'nuxt/app'
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

const { data, pending, error: loadError, refresh } = useFetch<MarbeteTemplateListResponse>('/api/admin/marbete-templates', { timeout: 15000 })
const selectedId = ref('')
const choosingMode = ref(false)
const editing = ref(false)
const levelFilter = ref('')
const saving = ref(false)
const acting = ref(false)
const actionError = ref('')
const actionNotice = ref('')
const selectedArtwork = ref<File | null>(null)
const selectedLegacyFile = ref<File | null>(null)
const legacyFileName = ref('')
const duplicateCycle = ref('2027-2028')
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
  visualDesign: createDefaultMarbeteVisualDesign('preescolar') as MarbeteVisualDesign
})

const templates = computed(() => data.value?.templates || [])
const themes = computed<PersonasTheme[]>(() => data.value?.themes || [])
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
const activeReplacement = computed(() => templates.value.find((template) => template.isDefault && template.status !== 'draft' && template.themeKey === form.themeKey && template.nivel.toLowerCase() === form.nivel.toLowerCase()) || null)
const previewSvgUrl = computed(() => form.id ? `/api/admin/marbete-templates/${encodeURIComponent(form.id)}/preview?format=svg-preview&surface=print&scenario=long-name` : '')
const previewPdfUrl = computed(() => form.id ? `/api/admin/marbete-templates/${encodeURIComponent(form.id)}/preview?format=pdf&surface=print&scenario=long-name` : '')

watch(templates, (items) => {
  if (!items.length || selectedId.value || choosingMode.value || editing.value) return
  const first = items.find((item) => item.isDefault) || items[0]
  if (first) selectTemplate(first)
}, { immediate: true })

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
    visualDesign: normalizeMarbeteVisualDesign(template.visualDesign, template.themeKey)
  })
  duplicateCycle.value = nextCycle(form.cicloEscolar)
}

function selectTemplate(template: MarbeteTemplateMeta) {
  selectedId.value = template.id
  choosingMode.value = false
  editing.value = true
  actionError.value = ''
  actionNotice.value = ''
  selectedArtwork.value = null
  selectedLegacyFile.value = null
  legacyFileName.value = ''
  loadForm(template)
}

function startChooseMode() {
  selectedId.value = ''
  editing.value = false
  choosingMode.value = true
  actionError.value = ''
  actionNotice.value = ''
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
    actionNotice.value = 'Borrador guardado. Ya puedes revisar el SVG y el PDF exactos.'
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
  if (saved) actionNotice.value = 'Versión publicada. La versión activa anterior sigue atendiendo a las familias hasta que decidas activarla.'
}

async function activateTemplate() {
  const saved = await runAction('activate')
  if (saved) actionNotice.value = 'Diseño activado. Los nuevos Husky Pass de este nivel ya usan esta versión.'
}

async function duplicateTemplate() {
  const saved = await runAction('duplicate', duplicateCycle.value)
  if (saved) actionNotice.value = 'Borrador creado para el nuevo ciclo. La versión publicada quedó intacta.'
}

function statusLabel(template: MarbeteTemplateMeta) {
  if (template.status === 'draft') return 'Borrador'
  return template.isDefault ? 'Publicado · activo' : 'Publicado'
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

.journey-strip {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.journey-strip article {
  align-items: center;
  background: #fff;
  border: 1px solid #e0e6ed;
  border-radius: 16px;
  display: flex;
  gap: 10px;
  padding: 11px 13px;
}

.journey-strip article > span {
  align-items: center;
  background: #eaf3f7;
  border-radius: 10px;
  color: #216384;
  display: flex;
  font-weight: 800;
  height: 30px;
  justify-content: center;
  width: 30px;
}

.journey-strip article div {
  display: grid;
}

.journey-strip small {
  color: #758295;
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
  top: 12px;
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

.mode-options p {
  color: #68778a;
  line-height: 1.5;
  margin: 0;
}

.mode-options em {
  color: #2b7197;
  font-size: .74rem;
  font-style: normal;
  font-weight: 800;
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

.duplicate-panel > div {
  display: grid;
}

.duplicate-panel small {
  color: #6b798b;
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

.legacy-card > p {
  color: #657488;
  line-height: 1.5;
  margin: 0;
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

.draft-footer > div {
  display: grid;
  margin-right: auto;
}

.draft-footer small {
  color: #728094;
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

.loading-card {
  color: #6c7a8c;
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
  .studio-head,
  .studio-workspace {
    grid-template-columns: 1fr;
  }

  .version-sidebar {
    position: static;
  }

  .journey-strip,
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
