<template>
  <FamilyPersonasAutorizadasShell title="Datos del alumno">
    <div v-if="loadError" class="alert retry-alert" data-state="error">
      <span>No fue posible cargar los datos del alumno.</span>
      <button class="btn btn-secondary" type="button" data-diagnostic-action="reintentar-datos-alumno" @click="retryLoad">Reintentar</button>
    </div>
    <div v-else-if="pending" class="card loading-row" data-product-loading>Cargando…</div>

    <template v-else-if="profile">
      <section class="student-data-screen" data-product-panel="student-data-home">
        <FamilyPersonasPageHeader
          eyebrow="Alumno"
          title="Datos del alumno"
          :description="`Consulta y actualiza la información de ${studentDisplayName}.`"
          :meta="`Última actualización: ${lastUpdateLabel}`"
          :theme="theme"
          ambassador-variant="header"
          ambassador-title="Datos claros"
          ambassador-message="Mantener esta información al día ayuda a la escuela a validar y contactar con seguridad."
          ambassador-tone="calm"
        />

        <section class="student-profile-card" data-product-panel="academic-readonly">
          <div class="student-portrait" :data-has-photo="Boolean(studentPhoto)">
            <FamilyPersonasProcessedPhoto
              v-if="studentPhoto"
              :src="studentPhoto"
              namespace="pa-student-data-photo"
              :alt="studentDisplayName"
            />
            <strong v-else>{{ studentInitials }}</strong>
            <span class="student-verified" aria-hidden="true">✓</span>
          </div>

          <div class="student-profile-main">
            <div class="student-profile-title">
              <h2>{{ studentDisplayName }}</h2>
              <p>{{ academicSummary }}</p>
            </div>

            <dl class="academic-facts" aria-label="Datos escolares del alumno">
              <div class="academic-fact feature-fact">
                <span class="fact-icon" aria-hidden="true"><FamilyPersonasIcon name="daycare" /></span>
                <dt>Nivel</dt>
                <dd>{{ academicNivel }}</dd>
              </div>
              <div class="academic-fact feature-fact">
                <span class="grade-number" aria-hidden="true">{{ decorativeGrade }}</span>
                <dt>Grado</dt>
                <dd>{{ academicGrado }}</dd>
              </div>
              <div class="academic-fact group-fact" :class="{ 'has-group-mask': grupoIcon.maskImage }" :style="grupoMaskStyle">
                <span class="group-token" :class="{ 'has-mask': grupoIcon.maskImage }" aria-hidden="true">
                  <span v-if="grupoIcon.maskImage" class="group-mask"></span>
                  <span v-else class="group-mask-fallback"></span>
                </span>
                <dt>Grupo</dt>
                <dd>{{ academicGrupo }}</dd>
              </div>
              <div class="academic-fact compact-fact">
                <dt>Matrícula</dt>
                <dd>{{ academicMatricula }}</dd>
              </div>
              <div class="academic-fact compact-fact">
                <dt>Plantel</dt>
                <dd>{{ academicPlantel }}</dd>
              </div>
            </dl>

            <div class="student-readonly-strip" aria-label="Resumen de identidad y servicios">
              <div class="readonly-pill" :data-state="curpBirthState">
                <span>Nacimiento CURP</span>
                <strong>{{ derivedBirthDateLabel }}</strong>
              </div>
              <div class="readonly-pill">
                <span>Edad actual</span>
                <strong>{{ derivedAgeLabel }}</strong>
              </div>
              <div v-if="birthDateDiscrepancy" class="readonly-pill warning">
                <span>Fecha registrada</span>
                <strong>{{ storedBirthDateLabel }}</strong>
              </div>
              <div class="services-chip-row" aria-label="Talleres y servicios">
                <span class="services-label">Talleres y servicios</span>
                <template v-if="serviceLabels.length">
                  <span v-for="service in serviceLabels" :key="service" class="service-chip">{{ service }}</span>
                </template>
                <span v-else class="empty-service-chip">Sin servicios activos</span>
              </div>
            </div>
          </div>
        </section>

        <section class="student-section-stack" data-product-panel="student-data-sections">
          <article v-if="identityGroup" class="student-info-card compact-info-card">
            <span class="section-avatar health" aria-hidden="true">
              <FamilyPersonasIcon name="authorized" />
            </span>
            <div class="section-copy">
              <h2>Identidad y salud</h2>
              <p>Información personal y datos de salud.</p>
            </div>
            <button class="section-action" type="button" data-diagnostic-action="editar-seccion-identidad" @click="openGroup(identityGroup)">
              <FamilyPersonasIcon name="edit" />
              Actualizar
            </button>
          </article>

          <article v-if="familyGroups.length" class="student-info-card family-info-card">
            <header class="card-section-head">
              <span class="section-avatar family" aria-hidden="true">
                <FamilyPersonasIcon name="people" />
              </span>
              <div class="section-copy">
                <h2>Familia</h2>
                <p>Información de padre, madre o tutores.</p>
              </div>
            </header>

            <div class="family-row-list">
              <button
                v-for="group in familyGroups"
                :key="group.title"
                class="family-edit-row"
                type="button"
                :data-diagnostic-action="`editar-seccion-${group.title.toLowerCase()}`"
                @click="openGroup(group)"
              >
                <span class="family-row-icon" aria-hidden="true"><FamilyPersonasIcon name="person" /></span>
                <span class="family-row-copy">
                  <strong>{{ familyRowTitle(group) }}</strong>
                  <small>{{ familyRowSubtitle(group) }}</small>
                </span>
                <span class="row-action-mark" aria-hidden="true">
                  <FamilyPersonasIcon name="edit" />
                  <b>Actualizar</b>
                </span>
              </button>
            </div>
          </article>

          <article v-if="addressGroup" class="student-info-card compact-info-card">
            <span class="section-avatar address" aria-hidden="true">
              <FamilyPersonasIcon name="home" />
            </span>
            <div class="section-copy">
              <h2>Dirección</h2>
              <p>Información de domicilio.</p>
            </div>
            <button class="section-action" type="button" data-diagnostic-action="editar-seccion-direccion" @click="openGroup(addressGroup)">
              <FamilyPersonasIcon name="edit" />
              Actualizar
            </button>
          </article>
        </section>
      </section>

      <FamilyPersonasModal
        v-if="activeGroup"
        :title="activeGroup.title"
        :eyebrow="activeGroup.eyebrow"
        :theme="theme"
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
import { usePersonasFamilyPeople } from '~/composables/usePersonasTheme'
import type { PersonasStudentEditable, PersonasStudentProfile } from '~/types/daycare'
import { displayMatricula } from '~/utils/matricula'
import { resolvePersonasTheme } from '~/utils/personasTheme'
import type { GrupoIconManifest } from '~/utils/grupoIcons'
import { resolveGrupoIcon } from '~/utils/grupoIcons'
import { normalizeAttendanceText } from '~/utils/attendance'
import { calculateAgeFromIsoDate, parseCurpBirthDate } from '~/utils/curp'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

type FieldKey = keyof PersonasStudentEditable
type FieldConfig = { key: FieldKey; label: string; type?: string; autocomplete?: string; inputmode?: 'text' | 'email' | 'tel' | 'numeric' | 'decimal'; options?: string[]; maxlength?: number }
type FieldGroup = { eyebrow: string; title: string; fields: FieldConfig[] }
const { data: profile, refresh, pending, error: loadError } = useFetch<PersonasStudentProfile>('/api/personas-autorizadas/student', { key: 'pa-student-profile', timeout: 15000, dedupe: 'defer' })
const familyPeople = usePersonasFamilyPeople({ immediate: false })
const { data: grupoManifest } = useFetch<GrupoIconManifest>('/grupo-icons/manifest.json', { key: 'pa-student-data-grupo-icons', timeout: 15000 })
const form = reactive<Record<string, string>>({})
const original = ref<Record<string, string>>({})
const fieldErrors = reactive<Record<string, string>>({})
const saving = ref(false)
const error = ref('')
const notice = ref('')
const activeGroup = ref<FieldGroup | null>(null)

function retryLoad() {
  return refresh()
}

const theme = computed(() => resolvePersonasTheme({
  matricula: profile.value?.readonly.matricula,
  plantel: profile.value?.readonly.plantel,
  nivelEdu: profile.value?.readonly.nivel
}))
const studentPhoto = computed(() => String(profile.value?.readonly.foto || '').trim())
const studentDisplayName = computed(() => compactText([
  profile.value?.editable.nombres,
  profile.value?.editable.apellido_paterno,
  profile.value?.editable.apellido_materno
]) || 'Alumno')
const studentInitials = computed(() => studentDisplayName.value.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'A')
const academicNivel = computed(() => String(profile.value?.readonly.nivel || theme.value.shortLabel || 'Nivel').trim())
const academicGrado = computed(() => String(profile.value?.readonly.grado || 'Grado').trim())
const academicGrupo = computed(() => String(profile.value?.readonly.grupo || 'Grupo').trim())
const academicMatricula = computed(() => profile.value?.readonly.matricula ? displayMatricula(profile.value.readonly.matricula) : '—')
const academicPlantel = computed(() => String(profile.value?.readonly.plantel || '—').trim())
const academicSummary = computed(() => [academicNivel.value, academicGrado.value, academicGrupo.value].filter(Boolean).join(' / ') || 'Datos escolares')
const lastUpdateLabel = computed(() => profile.value?.meta?.updatedAt ? formatDate(profile.value.meta.updatedAt) : 'Sin fecha reciente')
const grupoIcon = computed(() => resolveGrupoIcon(grupoManifest.value, academicGrupo.value))
const grupoMaskStyle = computed(() => grupoIcon.value.maskImage ? { '--grupo-mask-url': `url("${grupoIcon.value.maskImage}")` } : {})
const decorativeGrade = computed(() => gradeNumberLabel(academicGrado.value))
const curpBirth = computed(() => parseCurpBirthDate(profile.value?.editable.curp))
const storedBirthDate = computed(() => formatEditableValue(profile.value?.editable.fecha_nacimiento))
const derivedBirthDateLabel = computed(() => curpBirth.value.birthDate ? formatDate(curpBirth.value.birthDate) : curpBirth.value.reason === 'empty' ? 'Sin CURP' : 'CURP no valida')
const storedBirthDateLabel = computed(() => storedBirthDate.value ? formatDate(storedBirthDate.value) : 'Sin fecha')
const derivedAge = computed(() => calculateAgeFromIsoDate(curpBirth.value.birthDate))
const derivedAgeLabel = computed(() => derivedAge.value === null ? 'No disponible' : `${derivedAge.value} años`)
const birthDateDiscrepancy = computed(() => Boolean(curpBirth.value.birthDate && storedBirthDate.value && curpBirth.value.birthDate !== storedBirthDate.value))
const curpBirthState = computed(() => curpBirth.value.valid ? birthDateDiscrepancy.value ? 'warning' : 'ok' : curpBirth.value.reason === 'empty' ? 'empty' : 'invalid')
const serviceLabels = computed(() => normalizeServices(profile.value?.readonly.servicio))

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
const identityGroup = computed(() => visibleGroups.value.find((group) => group.eyebrow === 'Alumno') || null)
const fatherGroup = computed(() => visibleGroups.value.find((group) => group.title === 'Padre') || null)
const motherGroup = computed(() => visibleGroups.value.find((group) => group.title === 'Madre') || null)
const familyGroups = computed(() => [fatherGroup.value, motherGroup.value].filter(Boolean) as FieldGroup[])
const addressGroup = computed(() => visibleGroups.value.find((group) => group.title === 'Dirección') || null)
const changedFields = computed(() => activeGroup.value?.fields.filter((field) => String(form[field.key] || '') !== String(original.value[field.key] || '')) || [])
const hasActiveGroupChanges = computed(() => changedFields.value.length > 0)

watch(profile, (value) => {
  if (!value) return
  for (const field of value.allowedFields) form[field] = formatEditableValue(value.editable[field as FieldKey])
  original.value = Object.fromEntries(value.allowedFields.map((field) => [field, form[field] || '']))
}, { immediate: true })

function compactText(parts: Array<unknown>) {
  return parts.map((part) => String(part || '').trim()).filter(Boolean).join(' ').replace(/\s+/g, ' ')
}

function normalizeServices(value: unknown) {
  const seen = new Set<string>()
  return String(value || '')
    .split(',')
    .map((part) => part.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .filter((part) => {
      const key = normalizeAttendanceText(part)
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function familyRowTitle(group: FieldGroup) {
  if (group.title === 'Padre') return 'Padre / Tutor'
  if (group.title === 'Madre') return 'Madre / Tutora'
  return group.title
}

function familyRowSubtitle(group: FieldGroup) {
  const keys = group.title === 'Padre'
    ? ['nombre_padre', 'apellido_paterno_padre', 'apellido_materno_padre']
    : ['nombre_madre', 'apellido_paterno_madre', 'apellido_materno_madre']
  return compactText(keys.map((key) => displayEditableField(key as FieldKey))) || (group.title === 'Padre' ? 'Padre' : 'Madre')
}

function displayEditableField(key: FieldKey) {
  return form[key] || formatEditableValue(profile.value?.editable[key])
}

function formatEditableValue(value: unknown) {
  const source = String(value ?? '')
  const date = /^(\d{4}-\d{2}-\d{2})/.exec(source)
  return date?.[1] || source
}

function formatDate(value: string) {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const parsed = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'recientemente'
  return parsed.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function gradeNumberLabel(value: string) {
  const normalized = normalizeAttendanceText(value)
  const digit = normalized.match(/\d+/)?.[0]
  if (digit) return digit
  const names: Record<string, string> = {
    PRIMERO: '1',
    SEGUNDO: '2',
    TERCERO: '3',
    CUARTO: '4',
    QUINTO: '5',
    SEXTO: '6'
  }
  return names[normalized] || '°'
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
    if (key.toString().includes('curp') && !parseCurpBirthDate(value).valid) fieldErrors[key] = 'CURP no valida.'
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
    await familyPeople.refresh().catch(() => undefined)
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
.student-data-screen {
  display: grid;
  gap: clamp(14px, 1.8vw, 20px);
  max-width: 1120px;
}

.section-avatar,
.fact-icon,
.family-row-icon {
  align-items: center;
  display: inline-flex;
  justify-content: center;
}


.student-profile-card,
.student-info-card {
  background:
    radial-gradient(circle at 96% 8%, rgba(var(--pa-primary-rgb), .08), transparent 30%),
    linear-gradient(135deg, rgba(255, 255, 255, .96), rgba(250, 253, 255, .9));
  border: 1px solid rgba(213, 228, 239, .96);
  border-radius: 20px;
  box-shadow: 0 14px 34px rgba(27, 62, 96, .08);
}

.student-profile-card {
  align-items: center;
  display: grid;
  gap: clamp(16px, 2vw, 24px);
  grid-template-columns: 132px minmax(0, 1fr);
  padding: clamp(16px, 2.2vw, 24px);
}

.student-portrait {
  align-self: start;
  background: linear-gradient(145deg, rgba(255, 255, 255, .9), rgba(var(--pa-primary-rgb), .12));
  border: 1px solid rgba(199, 220, 236, .92);
  border-radius: 999px;
  box-shadow: inset 0 0 0 8px rgba(255, 255, 255, .72), 0 12px 26px rgba(46, 86, 130, .14);
  color: var(--pa-primary);
  display: grid;
  height: 112px;
  place-items: center;
  position: relative;
  width: 112px;
}

.student-portrait :deep(img),
.student-portrait :deep(.processed-photo),
.student-portrait :deep(.personas-processed-photo),
.student-portrait :deep(picture) {
  border-radius: 999px;
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.student-portrait strong {
  font-family: var(--font-title);
  font-size: 2rem;
  font-weight: 800;
}

.student-verified {
  align-items: center;
  background: #62a637;
  border: 3px solid #fff;
  border-radius: 999px;
  box-shadow: 0 8px 16px rgba(44, 118, 46, .2);
  color: #fff;
  display: inline-flex;
  font-size: .85rem;
  font-weight: 900;
  height: 28px;
  justify-content: center;
  position: absolute;
  right: 8px;
  top: 6px;
  width: 28px;
}

.student-profile-main {
  display: grid;
  gap: 14px;
  min-width: 0;
}

.student-profile-title h2 {
  color: #14284d;
  font-size: clamp(1.35rem, 2.1vw, 1.85rem);
  letter-spacing: -0.025em;
  margin: 0 0 4px;
}

.student-profile-title p {
  color: var(--pa-primary);
  font-size: clamp(.98rem, 1.45vw, 1.2rem);
  font-weight: 800;
}

.academic-facts {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  margin: 0;
}

.academic-fact {
  align-items: center;
  background:
    radial-gradient(circle at 100% 0, rgba(var(--pa-primary-rgb), .08), transparent 64%),
    rgba(255, 255, 255, .82);
  border: 1px solid rgba(211, 226, 239, .95);
  border-radius: 17px;
  box-shadow: 0 10px 24px rgba(31, 69, 108, .055);
  display: grid;
  gap: 4px 13px;
  grid-column: span 2;
  grid-template-columns: 54px minmax(0, 1fr);
  min-height: 88px;
  overflow: hidden;
  padding: 13px 15px;
  position: relative;
}

.academic-fact dt,
.academic-fact dd {
  margin: 0;
  min-width: 0;
}

.academic-fact dt {
  align-self: end;
  color: #647089;
  font-size: .7rem;
  font-weight: 800;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.academic-fact dd {
  align-self: start;
  color: #1c3158;
  font-size: 1.02rem;
  font-weight: 900;
  line-height: 1.1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fact-icon {
  background: rgba(var(--pa-primary-rgb), .1);
  border: 1px solid rgba(var(--pa-primary-rgb), .18);
  border-radius: 15px;
  color: var(--pa-primary);
  grid-row: span 2;
  height: 52px;
  width: 52px;
}

.fact-icon :deep(.pa-icon) {
  height: 1.45rem;
  width: 1.45rem;
}

.group-fact {
  background:
    radial-gradient(circle at 92% 22%, rgba(var(--pa-primary-rgb), .14), transparent 38%),
    linear-gradient(135deg, rgba(var(--pa-primary-rgb), .11), rgba(255, 255, 255, .84));
}

.group-fact.has-group-mask::after {
  background: var(--pa-primary);
  content: '';
  height: 112px;
  mask-image: var(--grupo-mask-url);
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
  opacity: .065;
  pointer-events: none;
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 112px;
  -webkit-mask-image: var(--grupo-mask-url);
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
}

.group-fact dt,
.group-fact dd,
.group-token {
  position: relative;
  z-index: 1;
}

.group-token {
  align-items: center;
  background: rgba(var(--pa-primary-rgb), .1);
  border: 2px solid rgba(var(--pa-primary-rgb), .34);
  border-radius: 16px;
  color: var(--pa-primary);
  display: inline-flex;
  grid-row: span 2;
  height: 54px;
  justify-content: center;
  line-height: 1;
  min-width: 54px;
  overflow: hidden;
  padding: 0;
  position: relative;
}

.group-token.has-mask {
  background: rgba(var(--pa-primary-rgb), .08);
}

.group-mask {
  background: var(--pa-primary);
  inset: 6px;
  mask-image: var(--grupo-mask-url);
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
  opacity: .95;
  position: absolute;
  -webkit-mask-image: var(--grupo-mask-url);
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
}

.group-mask-fallback {
  background: rgba(var(--pa-primary-rgb), .28);
  border-radius: 999px;
  height: 12px;
  width: 12px;
}

.grade-number {
  align-items: center;
  background: linear-gradient(145deg, rgba(var(--pa-primary-rgb), .16), rgba(var(--pa-primary-rgb), .07));
  border: 2px solid rgba(var(--pa-primary-rgb), .28);
  border-radius: 16px;
  color: var(--pa-primary);
  display: inline-flex;
  font-family: var(--font-title);
  font-size: 1.85rem;
  font-weight: 950;
  grid-row: span 2;
  height: 54px;
  justify-content: center;
  line-height: 1;
  min-width: 54px;
  padding: 0 10px;
}

.compact-fact {
  background: rgba(255, 255, 255, .76);
  grid-column: span 3;
  grid-template-columns: 1fr;
  min-height: 70px;
}

.compact-fact dt {
  align-self: end;
}

.compact-fact dd {
  color: var(--pa-primary);
}

.student-readonly-strip {
  align-items: stretch;
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.readonly-pill,
.services-chip-row {
  background: rgba(255, 255, 255, .72);
  border: 1px solid rgba(211, 226, 239, .92);
  border-radius: 13px;
  min-width: 0;
  padding: 9px 11px;
}

.readonly-pill {
  display: grid;
  gap: 2px;
}

.readonly-pill span,
.services-label {
  color: #647089;
  font-size: .68rem;
  font-weight: 850;
  letter-spacing: .03em;
  text-transform: uppercase;
}

.readonly-pill strong {
  color: #1c3158;
  font-size: .9rem;
  font-weight: 900;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.readonly-pill[data-state='ok'] strong {
  color: var(--pa-primary);
}

.readonly-pill[data-state='invalid'] strong,
.readonly-pill.warning strong {
  color: #a84b17;
}

.services-chip-row {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  grid-column: 1 / -1;
}

.service-chip,
.empty-service-chip {
  border-radius: 999px;
  display: inline-flex;
  font-size: .76rem;
  font-weight: 850;
  min-height: 26px;
  padding: 5px 9px;
}

.service-chip {
  background: var(--pa-soft);
  color: var(--pa-primary);
}

.empty-service-chip {
  background: #f5f6f7;
  color: #7a8392;
}

.student-section-stack {
  display: grid;
  gap: 16px;
}

.student-info-card {
  align-items: center;
  display: grid;
  gap: 14px;
  min-height: 94px;
  padding: clamp(14px, 1.7vw, 20px);
}

.compact-info-card {
  grid-template-columns: 58px minmax(0, 1fr) auto;
}

.family-info-card {
  align-items: stretch;
  grid-template-columns: 1fr;
}

.card-section-head {
  align-items: center;
  display: grid;
  gap: 14px;
  grid-template-columns: 58px minmax(0, 1fr);
}

.section-avatar {
  border-radius: 999px;
  height: 52px;
  width: 52px;
}

.section-avatar :deep(.pa-icon) {
  height: 1.45rem;
  width: 1.45rem;
}

.section-avatar.health {
  background: var(--pa-soft);
  color: var(--pa-primary);
}

.section-avatar.family {
  background: rgba(var(--pa-primary-rgb), .12);
  color: var(--pa-primary);
}

.section-avatar.address {
  background: var(--pa-soft);
  color: var(--pa-primary);
}

.section-copy {
  min-width: 0;
}

.section-copy h2 {
  color: #14284d;
  font-size: clamp(1.22rem, 1.8vw, 1.55rem);
  letter-spacing: -0.02em;
  margin: 0 0 4px;
}

.section-copy p {
  color: #617089;
  font-size: .92rem;
  font-weight: 600;
}

.section-action,
.row-action-mark {
  align-items: center;
  background: #ffffff;
  border: 1px solid var(--pa-border);
  border-radius: 11px;
  color: var(--pa-primary);
  display: inline-flex;
  font-weight: 850;
  gap: 8px;
  justify-content: center;
  min-height: 40px;
  padding: 0 16px;
  white-space: nowrap;
}

.section-action {
  cursor: pointer;
}

.section-action:hover,
.family-edit-row:hover .row-action-mark {
  border-color: var(--pa-primary);
  box-shadow: 0 10px 20px rgba(var(--pa-primary-rgb), .12);
  transform: translateY(-1px);
}

.family-row-list {
  background: rgba(255, 255, 255, .72);
  border: 1px solid rgba(211, 226, 239, .9);
  border-radius: 16px;
  overflow: hidden;
}

.family-edit-row {
  align-items: center;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  display: grid;
  gap: 12px;
  grid-template-columns: 36px minmax(0, 1fr) auto;
  min-height: 64px;
  padding: 10px 12px 10px 14px;
  text-align: left;
  width: 100%;
}

.family-edit-row + .family-edit-row {
  border-top: 1px solid rgba(211, 226, 239, .9);
}

.family-row-icon {
  color: var(--pa-primary);
  height: 34px;
  width: 34px;
}

.family-row-icon :deep(.pa-icon) {
  height: 1.35rem;
  width: 1.35rem;
}

.family-row-copy {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.family-row-copy strong {
  color: #1c3158;
  font-size: .98rem;
  font-weight: 900;
}

.family-row-copy small {
  color: #65728b;
  font-size: .84rem;
  font-weight: 650;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-action-mark b {
  font-size: .92rem;
}

.pa-primary {
  background: var(--pa-primary);
  color: var(--pa-contrast);
}

.loading-row,
.notice {
  border: 1px solid var(--pa-border);
  color: var(--pa-gray);
  font-weight: 600;
}

.notice {
  background: var(--pa-soft);
  border-radius: 12px;
  margin: 0;
  padding: 10px 12px;
}

.student-form {
  display: grid;
  gap: 10px;
}

.form-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.field-error {
  color: #8d2d25;
  font-weight: 600;
}

.input[aria-invalid='true'],
.select[aria-invalid='true'] {
  border-color: #d35a4e;
  box-shadow: 0 0 0 3px rgba(211, 90, 78, .12);
}

.change-summary {
  align-items: center;
  background: #fff;
  border: 1px solid var(--pa-border);
  border-radius: 10px;
  color: var(--pa-primary);
  display: inline-flex;
  font-weight: 600;
  gap: 6px;
  justify-self: start;
  padding: 8px 12px;
}

.save-row {
  align-items: center;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
  padding: 10px;
}

@media (max-width: 1020px) {
  .student-data-screen {
    max-width: none;
  }

  .student-profile-card {
    grid-template-columns: 118px minmax(0, 1fr);
  }

  .student-portrait {
    height: 104px;
    width: 104px;
  }
}

@media (max-width: 760px) {
  .student-data-screen {
    gap: 12px;
  }


  .student-profile-card {
    align-items: start;
    border-radius: 15px;
    gap: 12px;
    grid-template-columns: 70px minmax(0, 1fr);
    padding: 14px;
  }

  .student-portrait {
    box-shadow: inset 0 0 0 5px rgba(255, 255, 255, .72), 0 10px 20px rgba(46, 86, 130, .12);
    height: 66px;
    width: 66px;
  }

  .student-portrait strong {
    font-size: 1.15rem;
  }

  .student-verified {
    border-width: 2px;
    font-size: .64rem;
    height: 19px;
    right: -1px;
    top: 0;
    width: 19px;
  }

  .student-profile-main {
    gap: 10px;
  }

  .student-profile-title h2 {
    font-size: 1rem;
    line-height: 1.1;
  }

  .student-profile-title p {
    font-size: .78rem;
  }

  .academic-facts {
    border-radius: 12px;
    grid-column: 1 / -1;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .student-readonly-strip {
    grid-column: 1 / -1;
    grid-template-columns: 1fr;
  }

  .academic-fact {
    gap: 4px 10px;
    grid-column: span 1;
    grid-template-columns: 40px minmax(0, 1fr);
    justify-items: start;
    min-height: 78px;
    padding: 10px;
  }

  .feature-fact {
    grid-column: 1 / -1;
  }

  .compact-fact {
    align-content: center;
    gap: 4px;
    grid-template-columns: 1fr;
  }

  .academic-fact dt {
    font-size: .61rem;
  }

  .academic-fact dd {
    font-size: .78rem;
  }

  .fact-icon {
    border-radius: 12px;
    height: 38px;
    width: 38px;
  }

  .fact-icon :deep(.pa-icon) {
    height: 1.1rem;
    width: 1.1rem;
  }

  .group-token,
  .grade-number {
    border-width: 2px;
    border-radius: 13px;
    font-size: .96rem;
    height: 38px;
    min-width: 38px;
    padding: 0 7px;
  }

  .compact-info-card,
  .card-section-head {
    grid-template-columns: 46px minmax(0, 1fr) auto;
  }

  .student-info-card {
    border-radius: 15px;
    gap: 10px;
    min-height: 76px;
    padding: 12px;
  }

  .card-section-head {
    grid-template-columns: 46px minmax(0, 1fr);
  }

  .section-avatar {
    height: 42px;
    width: 42px;
  }

  .section-avatar :deep(.pa-icon) {
    height: 1.2rem;
    width: 1.2rem;
  }

  .section-copy h2 {
    font-size: 1rem;
    margin-bottom: 2px;
  }

  .section-copy p {
    font-size: .72rem;
    line-height: 1.25;
  }

  .section-action {
    border-radius: 10px;
    min-height: 38px;
    padding: 0 10px;
  }

  .section-action :deep(.pa-icon) {
    height: 1rem;
    width: 1rem;
  }

  .section-action {
    font-size: 0;
  }

  .family-edit-row {
    gap: 10px;
    grid-template-columns: 34px minmax(0, 1fr) 38px;
    min-height: 62px;
    padding: 10px;
  }

  .family-row-icon {
    height: 32px;
    width: 32px;
  }

  .family-row-copy strong {
    font-size: .86rem;
  }

  .family-row-copy small {
    font-size: .7rem;
  }

  .row-action-mark {
    border-radius: 10px;
    min-height: 36px;
    padding: 0;
    width: 36px;
  }

  .row-action-mark b {
    display: none;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 430px) {
  .academic-facts {
    grid-template-columns: 1fr;
  }

  .academic-fact,
  .compact-fact {
    grid-column: 1 / -1;
    grid-template-columns: 1fr;
    min-height: 68px;
  }

  .academic-fact {
    padding: 8px;
  }
}
</style>
