<template>
  <FamilyPersonasAutorizadasShell title="Datos del alumno">
    <section class="card section-hero" data-product-panel="student-data-intro">
      <div>
        <p class="eyebrow">Datos familiares</p>
        <h1>Datos del alumno</h1>
        <p>{{ lastUpdateLabel }}</p>
      </div>
      <img :src="mascot" alt="" />
    </section>

    <p v-if="loadError" class="alert" data-state="error">No fue posible cargar los datos del alumno.</p>
    <div v-else-if="pending" class="card loading-row" data-product-loading>Cargando…</div>

    <template v-else-if="profile">
      <section class="card readonly-card" data-product-panel="academic-readonly">
        <header>
          <p class="eyebrow">Escuela</p>
          <h2>{{ academicSummary }}</h2>
        </header>
      </section>

      <section class="data-section-grid" data-product-panel="student-data-sections">
        <article v-for="group in visibleGroups" :key="group.title" class="card data-section-card">
          <div>
            <p class="eyebrow">{{ group.eyebrow }}</p>
            <h2>{{ group.title }}</h2>
            <p>{{ completedFields(group) }}/{{ group.fields.length }}</p>
          </div>
          <button class="btn btn-primary pa-primary" type="button" data-diagnostic-action="editar-seccion-datos" @click="openGroup(group)">Editar</button>
        </article>
      </section>

      <FamilyPersonasModal
        v-if="activeGroup"
        :title="activeGroup.title"
        :eyebrow="activeGroup.eyebrow"
        @close="closeGroup"
      >
        <form class="student-form" data-product-panel="student-data-modal" @submit.prevent="saveActiveGroup">
          <div class="form-grid">
            <label v-for="field in activeGroup.fields" :key="field.key" class="label">
              {{ field.label }}
              <select v-if="field.options" v-model="form[field.key]" class="select" :aria-invalid="Boolean(fieldErrors[field.key])">
                <option value="">Seleccionar</option>
                <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
              </select>
              <input
                v-else
                v-model="form[field.key]"
                class="input"
                :type="field.type || 'text'"
                :autocomplete="field.autocomplete || 'off'"
                :inputmode="field.inputmode"
                :maxlength="field.maxlength"
                :aria-invalid="Boolean(fieldErrors[field.key])"
                @blur="normalizeField(field)"
              />
              <small v-if="fieldErrors[field.key]" class="field-error">{{ fieldErrors[field.key] }}</small>
            </label>
          </div>

          <div v-if="changedFields.length" class="change-summary" aria-live="polite">
            <b>{{ changedFields.length }}</b>
            <span>{{ changedFields.length === 1 ? 'cambio' : 'cambios' }}</span>
          </div>

          <div class="save-row">
            <button class="btn btn-primary pa-primary" type="submit" :disabled="saving || !hasActiveGroupChanges" data-diagnostic-action="guardar-seccion-datos">
              {{ saving ? 'Guardando…' : hasActiveGroupChanges ? 'Guardar' : 'Sin cambios' }}
            </button>
            <button class="btn btn-secondary" type="button" :disabled="saving" @click="closeGroup">Cancelar</button>
          </div>
        </form>
      </FamilyPersonasModal>
    </template>

    <p v-if="error" class="alert">{{ error }}</p>
    <p v-if="notice" class="notice">{{ notice }}</p>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useFetch } from 'nuxt/app'
import type { AuthorizedChild, AuthorizedPerson, PersonasStudentEditable, PersonasStudentProfile } from '~/types/daycare'
import type { PublicSession } from '~/types/session'
import { personasMascot, resolvePersonasTheme } from '~/utils/personasTheme'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

type FieldKey = keyof PersonasStudentEditable
type FieldConfig = { key: FieldKey; label: string; type?: string; autocomplete?: string; inputmode?: 'text' | 'email' | 'tel' | 'numeric' | 'decimal'; options?: string[]; maxlength?: number }
type FieldGroup = { eyebrow: string; title: string; fields: FieldConfig[] }

const { data: session } = useFetch<PublicSession>('/api/auth/me', { key: 'pa-update-session' })
const { data: people } = useFetch<AuthorizedPerson[]>('/api/personas-autorizadas/family', { key: 'pa-update-family-people', timeout: 15000 })
const { data: profile, refresh, pending, error: loadError } = useFetch<PersonasStudentProfile>('/api/personas-autorizadas/student', { key: 'pa-student-profile', timeout: 15000 })

const form = reactive<Record<string, string>>({})
const original = ref<Record<string, string>>({})
const fieldErrors = reactive<Record<string, string>>({})
const saving = ref(false)
const error = ref('')
const notice = ref('')
const activeGroup = ref<FieldGroup | null>(null)

const children = computed<AuthorizedChild[]>(() => people.value?.find((person) => person.children?.length)?.children || [])
const primaryChild = computed(() => children.value.find((child) => child.isCurrent) || children.value[0] || null)
const theme = computed(() => resolvePersonasTheme({
  plantel: primaryChild.value?.plantel || session.value?.user?.plantel?.[0] || profile.value?.readonly.plantel,
  nivelEdu: primaryChild.value?.nivelEdu || profile.value?.readonly.nivel,
  campus: primaryChild.value?.campus || session.value?.user?.campus
}))
const mascot = computed(() => personasMascot(theme.value, 'help'))
const academicSummary = computed(() => [profile.value?.readonly.nivel, profile.value?.readonly.grado, profile.value?.readonly.grupo].filter(Boolean).join(' / ') || 'Datos escolares')
const lastUpdateLabel = computed(() => profile.value?.meta?.updatedAt ? `Actualizado ${formatDate(profile.value.meta.updatedAt)}` : 'Actualización familiar')

const groups: FieldGroup[] = [
  {
    eyebrow: 'Alumno',
    title: 'Identidad y salud',
    fields: [
      { key: 'curp', label: 'CURP', maxlength: 18 },
      { key: 'nombres', label: 'Nombre(s)', autocomplete: 'given-name' },
      { key: 'apellido_paterno', label: 'Apellido paterno', autocomplete: 'family-name' },
      { key: 'apellido_materno', label: 'Apellido materno' },
      { key: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date' },
      { key: 'lugar_nacimiento', label: 'Lugar de nacimiento' },
      { key: 'sexo', label: 'Sexo', options: ['Femenino', 'Masculino'] },
      { key: 'talla', label: 'Talla', inputmode: 'decimal' },
      { key: 'peso', label: 'Peso', inputmode: 'decimal' },
      { key: 'tipo_sangre', label: 'Tipo de sangre', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
      { key: 'alergias', label: 'Alergias' }
    ]
  },
  {
    eyebrow: 'Padre / tutor',
    title: 'Padre',
    fields: [
      { key: 'nombre_padre', label: 'Nombre' },
      { key: 'apellido_paterno_padre', label: 'Apellido paterno' },
      { key: 'apellido_materno_padre', label: 'Apellido materno' },
      { key: 'lugar_trabajo_padre', label: 'Lugar de trabajo' },
      { key: 'puesto_padre', label: 'Puesto' },
      { key: 'email_padre', label: 'Email', type: 'email', autocomplete: 'email' },
      { key: 'telefono_padre', label: 'Teléfono', type: 'tel', inputmode: 'tel', maxlength: 15 },
      { key: 'estado_civil_padre', label: 'Estado civil', options: ['Soltero/a', 'Casado/a', 'Unión libre', 'Divorciado/a', 'Viudo/a'] },
      { key: 'fecha_nacimiento_padre', label: 'Fecha de nacimiento', type: 'date' },
      { key: 'curp_padre', label: 'CURP', maxlength: 18 },
      { key: 'ine_padre', label: 'INE', maxlength: 18 }
    ]
  },
  {
    eyebrow: 'Madre / tutora',
    title: 'Madre',
    fields: [
      { key: 'nombre_madre', label: 'Nombre' },
      { key: 'apellido_paterno_madre', label: 'Apellido paterno' },
      { key: 'apellido_materno_madre', label: 'Apellido materno' },
      { key: 'lugar_trabajo_madre', label: 'Lugar de trabajo' },
      { key: 'puesto_madre', label: 'Puesto' },
      { key: 'email_madre', label: 'Email', type: 'email', autocomplete: 'email' },
      { key: 'telefono_madre', label: 'Teléfono', type: 'tel', inputmode: 'tel', maxlength: 15 },
      { key: 'estado_civil_madre', label: 'Estado civil', options: ['Soltero/a', 'Casado/a', 'Unión libre', 'Divorciado/a', 'Viudo/a'] },
      { key: 'fecha_nacimiento_madre', label: 'Fecha de nacimiento', type: 'date' },
      { key: 'curp_madre', label: 'CURP', maxlength: 18 },
      { key: 'ine_madre', label: 'INE', maxlength: 18 }
    ]
  },
  {
    eyebrow: 'Domicilio',
    title: 'Dirección',
    fields: [
      { key: 'domicilio_calle', label: 'Calle' },
      { key: 'domicio_num', label: 'Número' },
      { key: 'domicilio_colonia', label: 'Colonia' },
      { key: 'domicilio_cp', label: 'Código postal', inputmode: 'numeric', maxlength: 5 },
      { key: 'domicilio_municipio', label: 'Municipio' }
    ]
  }
]

const allowedFieldSet = computed(() => new Set(profile.value?.allowedFields || []))
const visibleGroups = computed<FieldGroup[]>(() => groups
  .map((group) => ({ ...group, fields: group.fields.filter((field) => allowedFieldSet.value.has(field.key)) }))
  .filter((group) => group.fields.length))
const changedFields = computed(() => activeGroup.value?.fields.filter((field) => String(form[field.key] || '') !== String(original.value[field.key] || '')) || [])
const hasActiveGroupChanges = computed(() => changedFields.value.length > 0)

watch(profile, (value) => {
  if (!value) return
  for (const field of value.allowedFields) form[field] = formatEditableValue(value.editable[field as FieldKey])
  original.value = Object.fromEntries(value.allowedFields.map((field) => [field, form[field] || '']))
}, { immediate: true })

function formatEditableValue(value: unknown) {
  const source = String(value ?? '')
  const date = /^(\d{4}-\d{2}-\d{2})/.exec(source)
  return date?.[1] || source
}

function formatDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'recientemente'
  return parsed.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function completedFields(group: FieldGroup) {
  return group.fields.filter((field) => String(form[field.key] || '').trim()).length
}

function openGroup(group: FieldGroup) {
  activeGroup.value = group
  error.value = ''
  notice.value = ''
  clearFieldErrors()
}

function closeGroup() {
  if (saving.value) return
  activeGroup.value = null
  clearFieldErrors()
}

function clearFieldErrors() {
  for (const key of Object.keys(fieldErrors)) delete fieldErrors[key]
}

function normalizeField(field: FieldConfig) {
  const key = field.key
  const value = String(form[key] || '').trim()
  if (!value) {
    form[key] = ''
    return
  }
  if (key.toString().includes('curp') || key.toString().includes('ine')) form[key] = value.toUpperCase().replace(/\s+/g, '')
  else if (key.toString().includes('telefono')) form[key] = value.replace(/[^0-9+]/g, '').slice(0, 15)
  else if (key === 'domicilio_cp') form[key] = value.replace(/\D/g, '').slice(0, 5)
  else form[key] = value.replace(/\s+/g, ' ')
}

function validateActiveGroup() {
  clearFieldErrors()
  if (!activeGroup.value) return false
  for (const field of activeGroup.value.fields) {
    normalizeField(field)
    const key = field.key
    const value = String(form[key] || '').trim()
    if (!value) continue
    if (key.toString().includes('email') && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) fieldErrors[key] = 'Email inválido.'
    if (key.toString().includes('curp') && !/^[A-Z0-9]{18}$/.test(value)) fieldErrors[key] = '18 caracteres.'
    if (key === 'domicilio_cp' && !/^\d{5}$/.test(value)) fieldErrors[key] = '5 dígitos.'
    if (key.toString().includes('telefono') && !/^\+?\d{7,15}$/.test(value)) fieldErrors[key] = 'Teléfono inválido.'
  }
  return Object.keys(fieldErrors).length === 0
}

async function saveActiveGroup() {
  if (!activeGroup.value || !hasActiveGroupChanges.value) return
  error.value = ''
  notice.value = ''
  if (!validateActiveGroup()) return
  saving.value = true
  const patch = Object.fromEntries(activeGroup.value.fields
    .filter((field) => String(form[field.key] || '') !== String(original.value[field.key] || ''))
    .map((field) => [field.key, form[field.key] || null]))
  try {
    await $fetch('/api/personas-autorizadas/student', { method: 'POST', body: patch })
    await refresh()
    activeGroup.value = null
    notice.value = 'Datos guardados.'
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible guardar los datos.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.section-hero { align-items: center; background: linear-gradient(135deg, rgba(var(--pa-primary-rgb), .1), #fff); display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr) 120px; }
.section-hero img { max-height: 128px; object-fit: contain; }
.pa-primary { background: var(--pa-primary); color: var(--pa-contrast); }
.loading-row, .notice { border: 1px solid var(--pa-border); color: var(--pa-gray); font-weight: 600; }
.notice { background: var(--pa-soft); border-radius: 14px; margin: 0; padding: 10px 12px; }
.readonly-card { display: grid; gap: 8px; }
.readonly-card header h2 { margin-bottom: 0; }
.data-section-grid { display: grid; gap: 14px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.data-section-card { align-items: end; display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr) auto; }
.data-section-card h2, .data-section-card p { margin-bottom: 0; }
.data-section-card p:not(.eyebrow) { color: var(--pa-muted); font-weight: 600; }
.student-form { display: grid; gap: 14px; }
.form-grid { display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.field-error { color: #8d2d25; font-weight: 600; }
.input[aria-invalid='true'], .select[aria-invalid='true'] { border-color: #d35a4e; box-shadow: 0 0 0 3px rgba(211, 90, 78, .12); }
.change-summary { align-items: center; background: #fff; border: 1px solid var(--pa-border); border-radius: 999px; color: var(--pa-primary); display: inline-flex; font-weight: 600; gap: 6px; justify-self: start; padding: 8px 12px; }
.save-row { align-items: center; background: var(--pa-soft); border: 1px solid var(--pa-border); border-radius: 18px; display: flex; flex-wrap: wrap; gap: 12px; justify-content: flex-end; padding: 12px; }
@media (max-width: 900px) { .section-hero, .data-section-grid, .data-section-card, .form-grid { grid-template-columns: 1fr; } .section-hero img { justify-self: start; } }
</style>
