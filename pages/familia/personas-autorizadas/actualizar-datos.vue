<template>
  <FamilyPersonasAutorizadasShell title="Actualizar datos">
    <section class="card section-hero" data-product-panel="student-data-intro">
      <div>
        <p class="eyebrow">Datos editables por familia</p>
        <h1>Actualizar datos</h1>
        <p>Solo se guardan campos personales y familiares de la matrícula. Grado, grupo, nivel, ciclo, plantel, matrícula, servicio, baja y estados internos son datos escolares de solo lectura.</p>
      </div>
      <img :src="mascot" alt="" />
    </section>

    <p v-if="loadError" class="alert" data-state="error">No fue posible cargar los datos del alumno.</p>
    <div v-else-if="pending" class="card loading-row" data-product-loading>Cargando datos...</div>

    <template v-else-if="profile">
      <section class="card readonly-card" data-product-panel="academic-readonly">
        <header>
          <p class="eyebrow">Solo lectura</p>
          <h2>Datos escolares</h2>
        </header>
        <div class="readonly-grid">
          <span v-for="item in readonlyItems" :key="item.label">
            <b>{{ item.label }}</b>
            <small>{{ item.value || 'Pendiente' }}</small>
          </span>
        </div>
      </section>

      <form class="card student-form" data-product-panel="student-data" @submit.prevent="save">
        <section v-for="group in groups" :key="group.title" class="field-group">
          <header>
            <p class="eyebrow">{{ group.eyebrow }}</p>
            <h2>{{ group.title }}</h2>
          </header>
          <div class="form-grid">
            <label v-for="field in group.fields" :key="field.key" class="label">
              {{ field.label }}
              <input
                v-model="form[field.key]"
                class="input"
                :type="field.type || 'text'"
                :autocomplete="field.autocomplete || 'off'"
                :inputmode="field.inputmode"
              />
            </label>
          </div>
        </section>

        <div class="save-row">
          <button class="btn btn-primary pa-primary" type="submit" :disabled="saving || !hasChanges" data-diagnostic-action="guardar-datos-alumno">
            {{ saving ? 'Guardando...' : hasChanges ? 'Guardar cambios' : 'Sin cambios' }}
          </button>
          <span>El API rechaza campos académicos o no autorizados.</span>
        </div>
      </form>
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

const { data: session } = useFetch<PublicSession>('/api/auth/me', { key: 'pa-update-session' })
const { data: people } = useFetch<AuthorizedPerson[]>('/api/personas-autorizadas/family', { key: 'pa-update-family-people', timeout: 15000 })
const { data: profile, refresh, pending, error: loadError } = useFetch<PersonasStudentProfile>('/api/personas-autorizadas/student', { key: 'pa-student-profile', timeout: 15000 })

const form = reactive<Record<string, string>>({})
const original = ref<Record<string, string>>({})
const saving = ref(false)
const error = ref('')
const notice = ref('')

const children = computed<AuthorizedChild[]>(() => people.value?.find((person) => person.children?.length)?.children || [])
const primaryChild = computed(() => children.value[0] || null)
const theme = computed(() => resolvePersonasTheme({
  plantel: primaryChild.value?.plantel || session.value?.user?.plantel?.[0] || profile.value?.readonly.plantel,
  nivelEdu: primaryChild.value?.nivelEdu || profile.value?.readonly.nivel,
  campus: primaryChild.value?.campus || session.value?.user?.campus
}))
const mascot = computed(() => personasMascot(theme.value, 'help'))

const groups: { eyebrow: string; title: string; fields: { key: FieldKey; label: string; type?: string; autocomplete?: string; inputmode?: 'text' | 'email' | 'tel' | 'numeric' }[] }[] = [
  {
    eyebrow: 'Alumno',
    title: 'Identidad, contacto y salud',
    fields: [
      { key: 'curp', label: 'CURP' },
      { key: 'nombres', label: 'Nombre(s)', autocomplete: 'given-name' },
      { key: 'apellido_paterno', label: 'Apellido paterno', autocomplete: 'family-name' },
      { key: 'apellido_materno', label: 'Apellido materno' },
      { key: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date' },
      { key: 'lugar_nacimiento', label: 'Lugar de nacimiento' },
      { key: 'sexo', label: 'Sexo' },
      { key: 'talla', label: 'Talla' },
      { key: 'peso', label: 'Peso' },
      { key: 'tipo_sangre', label: 'Tipo de sangre' },
      { key: 'alergias', label: 'Alergias' }
    ]
  },
  {
    eyebrow: 'Padre / tutor',
    title: 'Datos del padre',
    fields: [
      { key: 'nombre_padre', label: 'Nombre' },
      { key: 'apellido_paterno_padre', label: 'Apellido paterno' },
      { key: 'apellido_materno_padre', label: 'Apellido materno' },
      { key: 'lugar_trabajo_padre', label: 'Lugar de trabajo' },
      { key: 'puesto_padre', label: 'Puesto' },
      { key: 'email_padre', label: 'Email', type: 'email', autocomplete: 'email' },
      { key: 'telefono_padre', label: 'Teléfono', type: 'tel', inputmode: 'tel' },
      { key: 'estado_civil_padre', label: 'Estado civil' },
      { key: 'fecha_nacimiento_padre', label: 'Fecha de nacimiento', type: 'date' },
      { key: 'curp_padre', label: 'CURP' },
      { key: 'ine_padre', label: 'INE' }
    ]
  },
  {
    eyebrow: 'Madre / tutora',
    title: 'Datos de la madre',
    fields: [
      { key: 'nombre_madre', label: 'Nombre' },
      { key: 'apellido_paterno_madre', label: 'Apellido paterno' },
      { key: 'apellido_materno_madre', label: 'Apellido materno' },
      { key: 'lugar_trabajo_madre', label: 'Lugar de trabajo' },
      { key: 'puesto_madre', label: 'Puesto' },
      { key: 'email_madre', label: 'Email', type: 'email', autocomplete: 'email' },
      { key: 'telefono_madre', label: 'Teléfono', type: 'tel', inputmode: 'tel' },
      { key: 'estado_civil_madre', label: 'Estado civil' },
      { key: 'fecha_nacimiento_madre', label: 'Fecha de nacimiento', type: 'date' },
      { key: 'curp_madre', label: 'CURP' },
      { key: 'ine_madre', label: 'INE' }
    ]
  },
  {
    eyebrow: 'Domicilio',
    title: 'Dirección familiar',
    fields: [
      { key: 'domicilio_calle', label: 'Calle' },
      { key: 'domicio_num', label: 'Número' },
      { key: 'domicilio_colonia', label: 'Colonia' },
      { key: 'domicilio_cp', label: 'Código postal', inputmode: 'numeric' },
      { key: 'domicilio_municipio', label: 'Municipio' }
    ]
  }
]

const readonlyItems = computed(() => [
  { label: 'Matrícula', value: profile.value?.readonly.matricula },
  { label: 'Plantel', value: profile.value?.readonly.plantel },
  { label: 'Nivel', value: profile.value?.readonly.nivel },
  { label: 'Grado', value: profile.value?.readonly.grado },
  { label: 'Grupo', value: profile.value?.readonly.grupo },
  { label: 'Ciclo', value: profile.value?.readonly.ciclo },
  { label: 'Servicio', value: profile.value?.readonly.servicio }
])

const hasChanges = computed(() => Object.keys(form).some((key) => String(form[key] || '') !== String(original.value[key] || '')))

watch(profile, (value) => {
  if (!value) return
  for (const field of value.allowedFields) {
    form[field] = formatEditableValue(value.editable[field as FieldKey])
  }
  original.value = Object.fromEntries(value.allowedFields.map((field) => [field, form[field] || '']))
}, { immediate: true })

function formatEditableValue(value: unknown) {
  const source = String(value ?? '')
  const date = /^(\d{4}-\d{2}-\d{2})/.exec(source)
  return date?.[1] || source
}

async function save() {
  if (!hasChanges.value) return
  saving.value = true
  error.value = ''
  notice.value = ''
  const patch = Object.fromEntries(Object.keys(form)
    .filter((key) => String(form[key] || '') !== String(original.value[key] || ''))
    .map((key) => [key, form[key] || null]))
  try {
    await $fetch('/api/personas-autorizadas/student', { method: 'POST', body: patch })
    await refresh()
    notice.value = 'Datos familiares actualizados.'
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible guardar los datos.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.section-hero {
  align-items: center;
  background: linear-gradient(135deg, rgba(var(--pa-primary-rgb), 0.1), #fff);
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) 130px;
}

.section-hero img {
  max-height: 135px;
  object-fit: contain;
}

.pa-primary { background: var(--pa-primary); color: var(--pa-contrast); }

.loading-row,
.notice {
  border: 1px solid var(--pa-border);
  color: var(--pa-gray);
  font-weight: 850;
}

.notice {
  background: var(--pa-soft);
  border-radius: 14px;
  margin: 0;
  padding: 10px 12px;
}

.readonly-card,
.student-form,
.field-group {
  display: grid;
  gap: 16px;
}

.readonly-card header h2,
.field-group header h2 {
  margin-bottom: 0;
}

.readonly-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.readonly-grid span {
  background: #f8f8f6;
  border: 1px solid #ecece7;
  border-radius: 14px;
  display: grid;
  gap: 2px;
  padding: 10px;
}

.readonly-grid b {
  color: var(--pa-primary);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.readonly-grid small {
  color: var(--pa-gray);
  font-weight: 850;
}

.field-group {
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
}

.field-group:first-child {
  border-top: 0;
  padding-top: 0;
}

.form-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.save-row {
  align-items: center;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  padding: 12px;
}

.save-row span {
  color: var(--pa-muted);
  font-weight: 800;
}

@media (max-width: 900px) {
  .section-hero,
  .readonly-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .section-hero img {
    justify-self: start;
  }
}
</style>
