<template>
  <section class="marbete-admin stack" data-product-area="superadmin" data-product-screen="marbete-templates">
    <header class="workspace-head compact-head marbete-head">
      <div>
        <p class="eyebrow">Superadmin</p>
        <h1>Plantillas de marbete</h1>
        <p>Gestiona los SVG institucionales usados por Personas Autorizadas segun plantel y nivel.</p>
      </div>
      <div class="head-actions">
        <NuxtLink class="btn btn-secondary" to="/admin/superadmin">Directorio</NuxtLink>
        <button class="btn btn-primary" type="button" data-diagnostic-action="nueva-plantilla" @click="startCreate">Nueva plantilla</button>
      </div>
    </header>

    <p v-if="loadError" class="alert" data-state="error">No fue posible cargar plantillas.</p>
    <div v-else-if="pending" class="card loading-card" data-product-loading data-state="loading">Cargando plantillas...</div>

    <section v-else class="template-workspace">
      <div class="template-list" data-product-panel="marbete-template-list" :data-state="templates.length ? 'content' : 'empty'">
        <article
          v-for="template in templates"
          :key="template.id"
          class="template-row"
          :class="{ active: selected?.id === template.id }"
          :style="{ '--template-color': template.color }"
        >
          <button type="button" data-diagnostic-action="seleccionar-plantilla" @click="selectTemplate(template)">
            <span class="color-dot"></span>
            <span class="template-copy">
              <strong>{{ template.name }}</strong>
              <small>{{ template.nivel }} / {{ template.planteles.length ? template.planteles.join(', ') : 'Fallback' }}</small>
            </span>
            <span class="badge">{{ template.themeKey }}</span>
          </button>
        </article>
        <EmptyState v-if="!templates.length" title="Sin plantillas" description="Agrega una plantilla SVG para habilitar descargas de marbete." />
      </div>

      <aside class="editor-column">
        <section class="card template-detail" data-product-panel="marbete-template-detail" :data-state="selected ? 'content' : 'empty'">
          <template v-if="selected">
            <div class="section-head">
              <div>
                <p class="eyebrow">Plantilla seleccionada</p>
                <h2>{{ selected.name }}</h2>
              </div>
              <span class="theme-pill" :style="{ background: selected.color }">{{ selected.themeKey }}</span>
            </div>
            <dl>
              <div><dt>Nivel</dt><dd>{{ selected.nivel }}</dd></div>
              <div><dt>Planteles</dt><dd>{{ selected.planteles.length ? selected.planteles.join(', ') : 'Fallback general' }}</dd></div>
              <div><dt>Archivo</dt><dd>{{ selected.filename }}</dd></div>
              <div><dt>Actualizada</dt><dd>{{ formatDate(selected.updatedAt) }}</dd></div>
            </dl>
            <iframe :src="`/api/admin/marbete-templates/${selected.id}`" title="Vista previa de plantilla"></iframe>
          </template>
          <EmptyState v-else title="Selecciona una plantilla" description="Verás aplicación, archivo y vista previa protegida." />
        </section>

        <form class="card template-form" data-product-panel="marbete-template-form" @submit.prevent="saveTemplate">
          <div class="section-head">
            <div>
              <p class="eyebrow">{{ form.id ? 'Actualizar plantilla' : 'Nueva plantilla' }}</p>
              <h2>{{ form.id ? form.name || 'Plantilla' : 'Agregar SVG' }}</h2>
            </div>
            <button class="btn btn-secondary compact" type="button" @click="startCreate">Limpiar</button>
          </div>

          <label class="label">
            Nombre
            <input v-model="form.name" class="input" required data-diagnostic-field="template-name" />
          </label>
          <div class="grid grid-2">
            <label class="label">
              Tema
              <select v-model="form.themeKey" class="select" required data-diagnostic-field="template-theme">
                <option v-for="theme in themes" :key="theme.key" :value="theme.key">{{ theme.label }}</option>
              </select>
            </label>
            <label class="label">
              Nivel
              <input v-model="form.nivel" class="input" required placeholder="preescolar, primaria, secundaria" data-diagnostic-field="template-nivel" />
            </label>
          </div>
          <label class="label">
            Planteles
            <input v-model="form.planteles" class="input" placeholder="PT, PM" data-diagnostic-field="template-planteles" />
          </label>
          <label class="label">
            Archivo SVG
            <input ref="fileInput" class="input file-field" type="file" accept=".svg,image/svg+xml" data-diagnostic-field="template-file" @change="selectFile" />
          </label>
          <p class="muted helper">{{ fileName || (form.id ? 'Puedes guardar metadatos sin reemplazar el SVG.' : 'La nueva plantilla requiere archivo SVG.') }}</p>

          <button class="btn btn-primary" type="submit" :disabled="saving" data-diagnostic-action="guardar-plantilla">{{ saving ? 'Guardando...' : form.id ? 'Actualizar plantilla' : 'Crear plantilla' }}</button>
          <p v-if="actionError" class="alert compact-alert">{{ actionError }}</p>
          <p v-if="actionNotice" class="notice">{{ actionNotice }}</p>
        </form>
      </aside>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useFetch } from 'nuxt/app'
import type { MarbeteTemplateListResponse, MarbeteTemplateMeta, PersonasTheme, PersonasThemeKey } from '~/types/daycare'
import { formatDate } from '~/utils/daycare'

definePageMeta({ layout: 'admin', middleware: ['admin', 'superadmin'] })

const { data, pending, error: loadError, refresh } = useFetch<MarbeteTemplateListResponse>('/api/admin/marbete-templates', { timeout: 15000 })
const selectedId = ref('')
const saving = ref(false)
const actionError = ref('')
const actionNotice = ref('')
const selectedFile = ref<File | null>(null)
const fileName = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const form = reactive({
  id: '',
  name: '',
  nivel: '',
  planteles: '',
  themeKey: 'daycare' as PersonasThemeKey
})

const templates = computed(() => data.value?.templates || [])
const themes = computed<PersonasTheme[]>(() => data.value?.themes || [])
const selected = computed(() => templates.value.find((template) => template.id === selectedId.value) || templates.value[0] || null)

watch(selected, (template) => {
  if (template && !form.id && !actionNotice.value) selectTemplate(template)
}, { immediate: true })

function selectTemplate(template: MarbeteTemplateMeta) {
  selectedId.value = template.id
  Object.assign(form, {
    id: template.id,
    name: template.name,
    nivel: template.nivel,
    planteles: template.planteles.join(', '),
    themeKey: template.themeKey
  })
  selectedFile.value = null
  fileName.value = ''
  actionError.value = ''
  actionNotice.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

function startCreate() {
  selectedId.value = ''
  Object.assign(form, {
    id: '',
    name: '',
    nivel: '',
    planteles: '',
    themeKey: 'daycare'
  })
  selectedFile.value = null
  fileName.value = ''
  actionError.value = ''
  actionNotice.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

function selectFile(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] || null
  fileName.value = selectedFile.value?.name || ''
}

async function saveTemplate() {
  actionError.value = ''
  actionNotice.value = ''
  saving.value = true
  const wasUpdate = Boolean(form.id)
  try {
    const body = new FormData()
    if (form.id) body.append('id', form.id)
    body.append('name', form.name)
    body.append('nivel', form.nivel)
    body.append('planteles', form.planteles)
    body.append('themeKey', form.themeKey)
    if (selectedFile.value) body.append('file', selectedFile.value)
    const saved = await $fetch<MarbeteTemplateMeta>('/api/admin/marbete-templates', { method: 'POST', body })
    await refresh()
    selectedId.value = saved.id
    selectTemplate(saved)
    actionNotice.value = wasUpdate ? 'Plantilla actualizada.' : 'Plantilla creada.'
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    actionError.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible guardar la plantilla.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.marbete-admin {
  gap: 12px;
}

.marbete-head {
  grid-template-columns: minmax(0, 1fr) auto;
}

.head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.template-workspace {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 0.82fr) minmax(360px, 0.62fr);
}

.template-list {
  display: grid;
  gap: 8px;
}

.template-row {
  --template-color: var(--color-brand-700);
}

.template-row button {
  align-items: center;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: var(--shadow-line);
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  padding: 12px;
  text-align: left;
  width: 100%;
}

.template-row button:hover,
.template-row.active button {
  background: rgba(97, 139, 47, 0.06);
  border-color: var(--template-color);
}

.color-dot {
  background: var(--template-color);
  border-radius: 999px;
  height: 14px;
  width: 14px;
}

.template-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.template-copy strong,
.template-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.template-copy small {
  color: var(--color-muted);
}

.editor-column {
  display: grid;
  gap: 12px;
}

.template-detail,
.template-form {
  display: grid;
  gap: 12px;
}

.section-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.section-head h2 {
  font-size: 1.25rem;
  margin-bottom: 0;
}

.theme-pill {
  border-radius: 999px;
  color: #fff;
  font-size: 0.74rem;
  font-weight: 600;
  padding: 6px 10px;
  text-transform: uppercase;
}

.template-detail dl {
  display: grid;
  gap: 8px;
  margin: 0;
}

.template-detail dl div {
  border-bottom: 1px solid var(--color-border);
  display: grid;
  gap: 2px;
  padding-bottom: 7px;
}

.template-detail dt {
  color: var(--color-muted);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.template-detail dd {
  margin: 0;
  word-break: break-word;
}

iframe {
  aspect-ratio: 612 / 792;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  width: 100%;
}

.file-field {
  padding: 9px 10px;
}

.helper {
  font-size: 0.84rem;
}

.compact {
  min-height: 34px;
  padding-inline: 12px;
}

.compact-alert {
  margin: 0;
}

.notice {
  background: #f0f8e7;
  border: 1px solid var(--color-brand-200);
  border-radius: 14px;
  color: var(--color-brand-900);
  font-weight: 600;
  margin: 0;
  padding: 10px 12px;
}

.loading-card {
  color: var(--color-muted);
}

@media (max-width: 1100px) {
  .template-workspace,
  .marbete-head {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .head-actions,
  .section-head {
    align-items: stretch;
    flex-direction: column;
  }

  .template-row button {
    grid-template-columns: 18px minmax(0, 1fr);
  }

  .template-row .badge {
    grid-column: 2;
    justify-self: start;
  }
}
</style>
