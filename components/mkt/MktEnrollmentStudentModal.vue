<template>
  <AdminModal
    :title="student.fullName || student.matricula"
    :eyebrow="`${plantelLabel} · ${gradeGroup}`"
    :description="student.matricula"
    :dirty="isDirty"
    :close-disabled="saving"
    dirty-title="Hay cambios sin guardar"
    dirty-message="Continúa editando o descarta los cambios."
    wide
    @close="emit('close')"
  >
    <template #icon><FamilyPersonasIcon name="school" /></template>

    <div class="student-modal-shell">
      <aside class="student-profile" :data-level="levelKey">
        <button class="profile-photo" type="button" :disabled="!photoUrl" :aria-label="photoUrl ? 'Ver fotografía' : 'Sin fotografía'" @click="photoUrl && (photoOpen = true)">
          <img v-if="photoVisible && photoUrl" :src="photoUrl" :alt="`Foto de ${student.fullName}`" @error="photoVisible = false" />
          <span v-else>{{ initials }}</span>
          <i :data-state="rowState" />
        </button>

        <p class="profile-plantel">{{ plantelLabel }}</p>
        <h3>{{ student.fullName || 'Alumno sin nombre' }}</h3>
        <p>{{ student.nivel || 'Nivel escolar' }} · {{ gradeGroup }}</p>

        <div class="profile-badges">
          <span :data-kind="tipoIngresoKind">{{ tipoIngresoLabel }}</span>
          <span :data-state="rowState">{{ statusLabel }}</span>
        </div>

        <dl class="profile-facts">
          <div><dt>Matrícula</dt><dd>{{ student.matricula }}</dd></div>
          <div><dt>Ciclo</dt><dd>{{ cicloLabel }}</dd></div>
          <div><dt>Grupo</dt><dd>{{ gradeGroup }}</dd></div>
          <div><dt>Ficha</dt><dd>{{ student.overlayExists ? 'Actualizada' : 'Pendiente' }}</dd></div>
        </dl>

        <div class="completion-ring" :style="{ '--completion': `${completion * 3.6}deg` }">
          <span><strong>{{ completion }}%</strong><small>expediente</small></span>
        </div>

        <img class="profile-ambassador" :src="ambassador" alt="" aria-hidden="true" />
      </aside>

      <section class="student-workspace">
        <nav class="student-tabs" aria-label="Secciones de la ficha">
          <button v-for="tab in tabs" :key="tab.value" type="button" :class="{ active: activeTab === tab.value }" @click="activeTab = tab.value">
            <FamilyPersonasIcon :name="tab.icon" />
            {{ tab.label }}
          </button>
        </nav>

        <div v-if="activeTab === 'resumen'" class="summary-view">
          <section class="summary-hero" :data-level="levelKey">
            <div>
              <p class="mkt-eyebrow">Aurora</p>
              <h3>{{ student.fullName || 'Alumno sin nombre' }}</h3>
              <p>{{ plantelLabel }} · {{ gradeGroup }} · {{ cicloLabel }}</p>
            </div>
            <img :src="ambassador" alt="" aria-hidden="true" />
          </section>

          <div class="summary-grid">
            <article class="summary-card identity-card">
              <header><span><FamilyPersonasIcon name="badge" /></span><div><small>Alumno</small><h4>Identidad</h4></div></header>
              <dl>
                <div><dt>CURP</dt><dd>{{ student.curp || 'Sin registro' }}</dd></div>
                <div><dt>Nacimiento</dt><dd>{{ formatSimpleDate(student.fechaNacimiento) }}</dd></div>
                <div><dt>Lugar</dt><dd>{{ student.lugarNacimiento || 'Sin registro' }}</dd></div>
                <div><dt>Sexo</dt><dd>{{ sexLabel(student.sexo) }}</dd></div>
              </dl>
            </article>

            <article class="summary-card family-card">
              <header><span><FamilyPersonasIcon name="people" /></span><div><small>Familia</small><h4>Contacto</h4></div></header>
              <div class="contact-summary">
                <span><strong>{{ fatherDisplay || 'Padre sin registrar' }}</strong><small>{{ form.telefonoPadre || form.emailPadre || 'Sin contacto' }}</small></span>
                <span><strong>{{ motherDisplay || 'Madre sin registrar' }}</strong><small>{{ form.telefonoMadre || form.emailMadre || 'Sin contacto' }}</small></span>
              </div>
            </article>

            <article class="summary-card address-card">
              <header><span><FamilyPersonasIcon name="home" /></span><div><small>Domicilio</small><h4>Dirección</h4></div></header>
              <p>{{ addressDisplay || 'Sin domicilio registrado' }}</p>
            </article>

            <article class="summary-card health-card">
              <header><span><FamilyPersonasIcon name="check" /></span><div><small>Salud</small><h4>Datos básicos</h4></div></header>
              <dl>
                <div><dt>Tipo de sangre</dt><dd>{{ form.tipoSangre || '—' }}</dd></div>
                <div><dt>Talla</dt><dd>{{ form.talla || '—' }}</dd></div>
                <div><dt>Peso</dt><dd>{{ form.peso || '—' }}</dd></div>
                <div><dt>Alergias</dt><dd>{{ form.alergias || 'Sin registro' }}</dd></div>
              </dl>
            </article>

            <article class="summary-card progress-card">
              <header><span><FamilyPersonasIcon name="clipboard" /></span><div><small>Expediente</small><h4>{{ completion === 100 ? 'Completo' : 'Datos pendientes' }}</h4></div></header>
              <div class="progress-track"><i :style="{ width: `${completion}%` }" /></div>
              <div class="missing-chips">
                <span v-for="label in missingLabels" :key="label">{{ label }}</span>
                <span v-if="!missingLabels.length" class="complete">Información esencial registrada</span>
              </div>
            </article>

            <article class="summary-card source-card">
              <header><span><FamilyPersonasIcon name="school" /></span><div><small>Clasificación</small><h4>{{ tipoIngresoLabel }}</h4></div></header>
              <p>{{ tipoIngresoReason }}</p>
              <small>{{ formatDateTime(student.updatedAt) }}</small>
            </article>
          </div>
        </div>

        <form v-else class="student-form" @submit.prevent="save">
          <section v-if="activeTab === 'alumno'" class="form-section student-section">
            <SectionHeader icon="badge" eyebrow="Alumno" title="Datos personales" />
            <div class="form-grid three">
              <label class="mkt-field"><span>Nombre</span><input v-model="form.nombres" class="mkt-input" autocomplete="off" /></label>
              <label class="mkt-field"><span>Apellido paterno</span><input v-model="form.apellidoPaterno" class="mkt-input" autocomplete="off" /></label>
              <label class="mkt-field"><span>Apellido materno</span><input v-model="form.apellidoMaterno" class="mkt-input" autocomplete="off" /></label>
              <label class="mkt-field span-2"><span>CURP</span><input v-model="form.curp" class="mkt-input uppercase" maxlength="18" autocomplete="off" /></label>
              <label class="mkt-field"><span>Sexo</span><select v-model="form.sexo" class="mkt-input"><option value="">Sin registro</option><option value="H">Hombre</option><option value="M">Mujer</option></select></label>
              <label class="mkt-field span-2"><span>Lugar de nacimiento</span><input v-model="form.lugarNacimiento" class="mkt-input" autocomplete="off" /></label>
              <label class="mkt-field"><span>Servicio</span><input v-model="form.servicio" class="mkt-input" autocomplete="off" /></label>
              <label class="mkt-field span-3"><span>Notas de servicio</span><textarea v-model="form.servicioNotas" class="mkt-textarea" rows="3" /></label>
            </div>
            <div class="read-only-strip">
              <span><small>Plantel</small><strong>{{ plantelLabel }}</strong></span>
              <span><small>Grado y grupo</small><strong>{{ gradeGroup }}</strong></span>
              <span><small>Ingreso</small><strong>{{ tipoIngresoLabel }}</strong></span>
              <span><small>Estado</small><strong>{{ statusLabel }}</strong></span>
            </div>
          </section>

          <template v-else-if="activeTab === 'familia'">
            <section class="form-section father-section">
              <SectionHeader icon="people" eyebrow="Padre o tutor" title="Información paterna" />
              <div class="form-grid three">
                <label class="mkt-field"><span>Nombre</span><input v-model="form.nombrePadre" class="mkt-input" autocomplete="off" /></label>
                <label class="mkt-field"><span>Apellido paterno</span><input v-model="form.apellidoPaternoPadre" class="mkt-input" autocomplete="off" /></label>
                <label class="mkt-field"><span>Apellido materno</span><input v-model="form.apellidoMaternoPadre" class="mkt-input" autocomplete="off" /></label>
                <label class="mkt-field"><span>Teléfono</span><input v-model="form.telefonoPadre" class="mkt-input" inputmode="tel" autocomplete="tel" /></label>
                <label class="mkt-field span-2"><span>Correo</span><input v-model="form.emailPadre" class="mkt-input" type="email" autocomplete="email" /></label>
                <label class="mkt-field"><span>Lugar de trabajo</span><input v-model="form.lugarTrabajoPadre" class="mkt-input" /></label>
                <label class="mkt-field"><span>Puesto</span><input v-model="form.puestoPadre" class="mkt-input" /></label>
                <label class="mkt-field"><span>Estado civil</span><input v-model="form.estadoCivilPadre" class="mkt-input" /></label>
                <label class="mkt-field"><span>Fecha de nacimiento</span><input v-model="form.fechaNacimientoPadre" class="mkt-input" type="date" /></label>
                <label class="mkt-field"><span>CURP</span><input v-model="form.curpPadre" class="mkt-input uppercase" maxlength="18" /></label>
                <label class="mkt-field"><span>INE</span><input v-model="form.inePadre" class="mkt-input" /></label>
              </div>
            </section>

            <section class="form-section mother-section">
              <SectionHeader icon="people" eyebrow="Madre o tutora" title="Información materna" />
              <div class="form-grid three">
                <label class="mkt-field"><span>Nombre</span><input v-model="form.nombreMadre" class="mkt-input" autocomplete="off" /></label>
                <label class="mkt-field"><span>Apellido paterno</span><input v-model="form.apellidoPaternoMadre" class="mkt-input" autocomplete="off" /></label>
                <label class="mkt-field"><span>Apellido materno</span><input v-model="form.apellidoMaternoMadre" class="mkt-input" autocomplete="off" /></label>
                <label class="mkt-field"><span>Teléfono</span><input v-model="form.telefonoMadre" class="mkt-input" inputmode="tel" autocomplete="tel" /></label>
                <label class="mkt-field span-2"><span>Correo</span><input v-model="form.emailMadre" class="mkt-input" type="email" autocomplete="email" /></label>
                <label class="mkt-field"><span>Lugar de trabajo</span><input v-model="form.lugarTrabajoMadre" class="mkt-input" /></label>
                <label class="mkt-field"><span>Puesto</span><input v-model="form.puestoMadre" class="mkt-input" /></label>
                <label class="mkt-field"><span>Estado civil</span><input v-model="form.estadoCivilMadre" class="mkt-input" /></label>
                <label class="mkt-field"><span>Fecha de nacimiento</span><input v-model="form.fechaNacimientoMadre" class="mkt-input" type="date" /></label>
                <label class="mkt-field"><span>CURP</span><input v-model="form.curpMadre" class="mkt-input uppercase" maxlength="18" /></label>
                <label class="mkt-field"><span>INE</span><input v-model="form.ineMadre" class="mkt-input" /></label>
              </div>
            </section>
          </template>

          <section v-else-if="activeTab === 'domicilio'" class="form-section address-section">
            <SectionHeader icon="home" eyebrow="Domicilio" title="Dirección familiar" />
            <div class="form-grid three">
              <label class="mkt-field span-2"><span>Calle</span><input v-model="form.domicilioCalle" class="mkt-input" autocomplete="street-address" /></label>
              <label class="mkt-field"><span>Número</span><input v-model="form.domicilioNumero" class="mkt-input" /></label>
              <label class="mkt-field"><span>Colonia</span><input v-model="form.domicilioColonia" class="mkt-input" /></label>
              <label class="mkt-field"><span>Código postal</span><input v-model="form.domicilioCp" class="mkt-input" inputmode="numeric" maxlength="5" /></label>
              <label class="mkt-field"><span>Municipio</span><input v-model="form.domicilioMunicipio" class="mkt-input" /></label>
              <label class="mkt-field span-3"><span>Dirección consolidada</span><textarea v-model="form.direccion" class="mkt-textarea" rows="4" /></label>
            </div>
          </section>

          <section v-else class="form-section health-section">
            <SectionHeader icon="check" eyebrow="Salud" title="Datos básicos" />
            <div class="form-grid three">
              <label class="mkt-field"><span>Tipo de sangre</span><input v-model="form.tipoSangre" class="mkt-input uppercase" /></label>
              <label class="mkt-field"><span>Talla</span><input v-model="form.talla" class="mkt-input" placeholder="Ej. 1.25 m" /></label>
              <label class="mkt-field"><span>Peso</span><input v-model="form.peso" class="mkt-input" placeholder="Ej. 28 kg" /></label>
              <label class="mkt-field span-3"><span>Alergias</span><textarea v-model="form.alergias" class="mkt-textarea" rows="5" /></label>
            </div>
          </section>

          <p v-if="error" class="mkt-alert">{{ error }}</p>
          <div v-if="saveState !== 'idle'" class="save-state" :data-state="saveState">
            <span />{{ saveState === 'saving' ? 'Guardando en Aurora…' : saveState === 'saved' ? 'Ficha actualizada' : 'No se pudo guardar' }}
          </div>

          <footer class="form-actions">
            <button class="mkt-btn" type="button" :disabled="saving || !isDirty" @click="resetForm">Restaurar</button>
            <button class="mkt-btn primary" type="submit" :disabled="saving || !isDirty">
              <FamilyPersonasIcon :name="saving ? 'replace' : 'check'" />
              {{ saving ? 'Guardando…' : 'Guardar' }}
            </button>
          </footer>
        </form>
      </section>
    </div>

    <Transition name="photo-viewer">
      <div v-if="photoOpen && photoUrl" class="photo-viewer" role="dialog" aria-modal="true" aria-label="Fotografía del alumno" @click.self="photoOpen = false">
        <button type="button" aria-label="Cerrar fotografía" @click="photoOpen = false">×</button>
        <figure><img :src="photoUrl" :alt="`Foto de ${student.fullName}`" /><figcaption>{{ student.fullName }} · {{ student.matricula }}</figcaption></figure>
      </div>
    </Transition>
  </AdminModal>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, reactive, ref, resolveComponent, watch } from 'vue'
import type { MktEnrollmentStudent, MktEnrollmentStudentPatch } from '~/types/mktEnrollment'
import { useDraftState } from '~/composables/useDraftState'

const props = defineProps<{
  student: MktEnrollmentStudent
  plantel: string
  plantelLabel: string
  ciclo: string
}>()
const emit = defineEmits<{
  close: []
  optimistic: [student: MktEnrollmentStudent]
  saved: [student: MktEnrollmentStudent]
  rollback: [student: MktEnrollmentStudent, message: string]
}>()

type TabValue = 'resumen' | 'alumno' | 'familia' | 'domicilio' | 'salud'

const SectionHeader = defineComponent({
  props: { icon: { type: String, required: true }, eyebrow: { type: String, required: true }, title: { type: String, required: true } },
  setup(sectionProps) {
    return () => h('header', { class: 'section-header' }, [
      h('span', [h(resolveComponent('FamilyPersonasIcon') as any, { name: sectionProps.icon })]),
      h('div', [h('p', { class: 'mkt-eyebrow' }, sectionProps.eyebrow), h('h3', sectionProps.title)])
    ])
  }
})

const tabs: Array<{ value: TabValue; label: string; icon: string }> = [
  { value: 'resumen', label: 'Resumen', icon: 'clipboard' },
  { value: 'alumno', label: 'Alumno', icon: 'badge' },
  { value: 'familia', label: 'Familia', icon: 'people' },
  { value: 'domicilio', label: 'Domicilio', icon: 'home' },
  { value: 'salud', label: 'Salud', icon: 'check' }
]

const activeTab = ref<TabValue>('resumen')
const saving = ref(false)
const saveState = ref<'idle' | 'saving' | 'saved' | 'failed'>('idle')
const error = ref('')
const photoOpen = ref(false)
const photoVisible = ref(Boolean(props.student.photoUrl || props.student.foto))
const form = reactive<MktEnrollmentStudentPatch>(emptyForm())
const { isDirty, resetDraft } = useDraftState(form)

const levelKey = computed(() => {
  if (['PM', 'PT'].includes(props.plantel)) return 'primaria'
  if (['SM', 'ST'].includes(props.plantel)) return 'secundaria'
  if (props.plantel === 'GM') return 'daycare'
  return 'preescolar'
})
const ambassador = computed(() => ({
  daycare: '/personas-autorizadas/ambassadors/daycare-sunny.png',
  preescolar: '/personas-autorizadas/ambassadors/preescolar-joy.png',
  primaria: '/personas-autorizadas/ambassadors/primaria-brave.png',
  secundaria: '/personas-autorizadas/ambassadors/secundaria-hope.png'
}[levelKey.value]))
const photoUrl = computed(() => String(props.student.photoUrl || props.student.foto || '').trim())
const initials = computed(() => fullName(props.student.nombres || '', props.student.apellidoPaterno || '', props.student.apellidoMaterno || '')
  .split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'HP')
const gradeGroup = computed(() => [displayGrade(props.student.grado), props.student.group || props.student.grupo].filter(Boolean).join(' · ') || 'Sin grupo')
const cicloLabel = computed(() => props.ciclo ? `${props.ciclo}-${Number(props.ciclo) + 1}` : '—')
const statusLabel = computed(() => {
  const state = String(props.student.enrollmentState || props.student.status || '').toLowerCase()
  if (state.includes('baja')) return 'Baja'
  if (state === 'inscrito') return 'Inscrito'
  if (state.includes('no_inscrito')) return 'No inscrito'
  return props.student.status || 'Activo'
})
const rowState = computed(() => {
  const state = String(props.student.enrollmentState || props.student.status || '').toLowerCase()
  if (state.includes('baja') || state.includes('inactiv')) return 'inactive'
  if (state.includes('no_inscrito') || state.includes('pend')) return 'pending'
  return 'active'
})
const tipoIngresoKind = computed(() => String(props.student.tipoIngresoValue || props.student.tipoIngreso || '').toLowerCase() === 'interno' ? 'internal' : 'external')
const tipoIngresoLabel = computed(() => tipoIngresoKind.value === 'internal' ? 'Interno' : 'Externo')
const tipoIngresoReason = computed(() => String(props.student.tipoIngresoReason || '').trim() || 'Clasificación calculada por Aurora para el ciclo seleccionado.')
const completion = computed(() => Math.max(0, Math.min(100, Number(props.student.completenessTiers?.basic?.progress ?? (props.student.missingFields?.length ? 50 : 100)) || 0)))
const missingLabels = computed(() => (props.student.completenessTiers?.basic?.missingLabels || props.student.missingLabels || []).slice(0, 8))
const fatherDisplay = computed(() => fullName(form.nombrePadre, form.apellidoPaternoPadre, form.apellidoMaternoPadre) || props.student.fatherName || '')
const motherDisplay = computed(() => fullName(form.nombreMadre, form.apellidoPaternoMadre, form.apellidoMaternoMadre) || props.student.motherName || '')
const addressDisplay = computed(() => form.direccion || [form.domicilioCalle, form.domicilioNumero, form.domicilioColonia, form.domicilioCp, form.domicilioMunicipio].filter(Boolean).join(', ') || props.student.address || props.student.direccion || '')

function emptyForm(): MktEnrollmentStudentPatch {
  return {
    nombres: '', apellidoPaterno: '', apellidoMaterno: '', curp: '', lugarNacimiento: '', sexo: '',
    talla: '', peso: '', tipoSangre: '', alergias: '',
    nombrePadre: '', apellidoPaternoPadre: '', apellidoMaternoPadre: '', telefonoPadre: '', emailPadre: '',
    lugarTrabajoPadre: '', puestoPadre: '', estadoCivilPadre: '', fechaNacimientoPadre: '', inePadre: '', curpPadre: '',
    nombreMadre: '', apellidoPaternoMadre: '', apellidoMaternoMadre: '', telefonoMadre: '', emailMadre: '',
    lugarTrabajoMadre: '', puestoMadre: '', estadoCivilMadre: '', fechaNacimientoMadre: '', ineMadre: '', curpMadre: '',
    direccion: '', domicilioCalle: '', domicilioNumero: '', domicilioColonia: '', domicilioCp: '', domicilioMunicipio: '',
    servicio: '', servicioNotas: ''
  }
}

function formFromStudent(student: MktEnrollmentStudent): MktEnrollmentStudentPatch {
  return {
    nombres: text(student.nombres),
    apellidoPaterno: text(student.apellidoPaterno),
    apellidoMaterno: text(student.apellidoMaterno),
    curp: text(student.curp).toUpperCase(),
    lugarNacimiento: text(student.lugarNacimiento),
    sexo: normalizeSex(student.sexo),
    talla: text(student.talla),
    peso: text(student.peso),
    tipoSangre: text(student.tipoSangre),
    alergias: text(student.alergias),
    nombrePadre: text(student.nombrePadre || student.padre?.nombres),
    apellidoPaternoPadre: text(student.apellidoPaternoPadre || student.padre?.apellidoPaterno),
    apellidoMaternoPadre: text(student.apellidoMaternoPadre || student.padre?.apellidoMaterno),
    telefonoPadre: text(student.telefonoPadre || student.padre?.telefono),
    emailPadre: text(student.emailPadre || student.padre?.correo),
    lugarTrabajoPadre: text(student.lugarTrabajoPadre),
    puestoPadre: text(student.puestoPadre),
    estadoCivilPadre: text(student.estadoCivilPadre),
    fechaNacimientoPadre: dateInput(student.fechaNacimientoPadre),
    inePadre: text(student.inePadre),
    curpPadre: text(student.curpPadre).toUpperCase(),
    nombreMadre: text(student.nombreMadre || student.madre?.nombres),
    apellidoPaternoMadre: text(student.apellidoPaternoMadre || student.madre?.apellidoPaterno),
    apellidoMaternoMadre: text(student.apellidoMaternoMadre || student.madre?.apellidoMaterno),
    telefonoMadre: text(student.telefonoMadre || student.madre?.telefono),
    emailMadre: text(student.emailMadre || student.madre?.correo),
    lugarTrabajoMadre: text(student.lugarTrabajoMadre),
    puestoMadre: text(student.puestoMadre),
    estadoCivilMadre: text(student.estadoCivilMadre),
    fechaNacimientoMadre: dateInput(student.fechaNacimientoMadre),
    ineMadre: text(student.ineMadre),
    curpMadre: text(student.curpMadre).toUpperCase(),
    direccion: text(student.direccion || student.address),
    domicilioCalle: text(student.domicilioCalle),
    domicilioNumero: text(student.domicilioNumero || student.domicilioNum),
    domicilioColonia: text(student.domicilioColonia),
    domicilioCp: text(student.domicilioCp),
    domicilioMunicipio: text(student.domicilioMunicipio),
    servicio: text(student.servicio),
    servicioNotas: text(student.servicioNotas)
  }
}

function text(value: unknown) { return String(value ?? '').trim() }
function fullName(...parts: string[]) { return parts.map((part) => part.trim()).filter(Boolean).join(' ') }
function displayGrade(value: unknown) { const resolved = text(value); return resolved ? resolved.charAt(0).toUpperCase() + resolved.slice(1).toLowerCase() : '' }
function normalizeSex(value: unknown) { const resolved = text(value).toUpperCase(); return ['M', 'MUJER', 'FEMENINO', 'F'].includes(resolved) ? 'M' : ['H', 'HOMBRE', 'MASCULINO'].includes(resolved) ? 'H' : resolved }
function sexLabel(value: unknown) { const normalized = normalizeSex(value); return normalized === 'M' ? 'Mujer' : normalized === 'H' ? 'Hombre' : text(value) || 'Sin registro' }
function dateInput(value: unknown) { const match = text(value).match(/^\d{4}-\d{2}-\d{2}/); return match?.[0] || '' }

function applyStudent(student: MktEnrollmentStudent) {
  Object.assign(form, formFromStudent(student))
  photoVisible.value = Boolean(student.photoUrl || student.foto)
  error.value = ''
  saveState.value = 'idle'
  resetDraft(form)
}
function resetForm() { applyStudent(props.student) }

function validate() {
  const curps = [form.curp, form.curpPadre, form.curpMadre].filter(Boolean)
  if (curps.some((value) => !/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i.test(value))) return 'Revisa las CURP.'
  const phones = [form.telefonoPadre, form.telefonoMadre].filter(Boolean)
  if (phones.some((value) => value.replace(/\D/g, '').length < 10)) return 'Revisa los teléfonos.'
  const emails = [form.emailPadre, form.emailMadre].filter(Boolean)
  if (emails.some((value) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) return 'Revisa los correos.'
  if (form.domicilioCp && !/^\d{5}$/.test(form.domicilioCp.replace(/\D/g, ''))) return 'Revisa el código postal.'
  return ''
}

async function save() {
  const validation = validate()
  if (validation) { error.value = validation; return }

  const previous = { ...props.student }
  const optimistic: MktEnrollmentStudent = {
    ...props.student,
    ...form,
    fullName: fullName(form.nombres, form.apellidoPaterno, form.apellidoMaterno),
    nombreCompleto: fullName(form.nombres, form.apellidoPaterno, form.apellidoMaterno),
    fatherName: fatherDisplay.value,
    motherName: motherDisplay.value,
    address: addressDisplay.value,
    updatedAt: new Date().toISOString(),
    overlayExists: true
  }

  saving.value = true
  saveState.value = 'saving'
  error.value = ''
  emit('optimistic', optimistic)
  try {
    const response = await $fetch<{ data: MktEnrollmentStudent }>(`/api/mkt/enrollment/students/${encodeURIComponent(props.student.matricula)}`, {
      method: 'PATCH',
      query: { plantel: props.plantel, ciclo: props.ciclo },
      body: { ...form }
    })
    emit('saved', response.data)
    Object.assign(form, formFromStudent(response.data))
    resetDraft(form)
    saveState.value = 'saved'
    window.setTimeout(() => { if (saveState.value === 'saved') saveState.value = 'idle' }, 2200)
  } catch (caught: any) {
    const message = caught?.data?.message || caught?.data?.statusMessage || caught?.statusMessage || 'No se pudo guardar la ficha.'
    error.value = message
    saveState.value = 'failed'
    emit('rollback', previous, message)
  } finally {
    saving.value = false
  }
}

function formatSimpleDate(value: unknown) {
  const normalized = dateInput(value)
  if (!normalized) return 'Sin registro'
  const date = new Date(`${normalized}T12:00:00`)
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}
function formatDateTime(value: unknown) {
  if (!value) return 'Sin actualización registrada'
  const date = new Date(String(value))
  if (!Number.isFinite(date.getTime())) return 'Sin actualización registrada'
  return `Actualizado ${new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)}`
}

watch(() => props.student, (student) => {
  if (!saving.value) applyStudent(student)
}, { immediate: true, deep: false })
</script>

<style scoped>
.student-modal-shell{display:grid;gap:18px;grid-template-columns:270px minmax(0,1fr)}
.student-profile{align-items:center;background:radial-gradient(circle at 80% 8%,rgba(246,199,69,.25),transparent 27%),linear-gradient(165deg,#0b6b61,#09534d 58%,#123d46);border-radius:25px;color:#fff;display:flex;flex-direction:column;min-height:100%;overflow:hidden;padding:24px 18px 0;position:relative;text-align:center}
.student-profile[data-level='primaria']{background:radial-gradient(circle at 80% 8%,rgba(246,199,69,.28),transparent 28%),linear-gradient(165deg,#205d8d,#16466f 60%,#173a55)}
.student-profile[data-level='secundaria']{background:radial-gradient(circle at 80% 8%,rgba(246,199,69,.24),transparent 28%),linear-gradient(165deg,#8e493e,#70372f 58%,#3f3545)}
.student-profile[data-level='daycare']{background:radial-gradient(circle at 80% 8%,rgba(255,255,255,.34),transparent 28%),linear-gradient(165deg,#d59c18,#b2740e 58%,#6b551c)}
.profile-photo{align-items:center;background:#e9f7f0;border:5px solid rgba(255,255,255,.92);border-radius:30px;box-shadow:0 18px 34px rgba(4,35,39,.3);cursor:pointer;display:flex;height:138px;justify-content:center;overflow:hidden;padding:0;position:relative;width:116px;z-index:2}.profile-photo:disabled{cursor:default}.profile-photo img{height:100%;object-fit:cover;width:100%}.profile-photo>span{color:#0b6b61;font-family:var(--font-title);font-size:2rem}.profile-photo i{border:3px solid #fff;border-radius:999px;bottom:5px;height:16px;position:absolute;right:5px;width:16px}.profile-photo i[data-state='active']{background:#8fc849}.profile-photo i[data-state='pending']{background:#f6c745}.profile-photo i[data-state='inactive']{background:#ec6b5d}
.profile-plantel{color:#c5e9dd!important;font-size:.67rem;font-weight:950;letter-spacing:.1em;margin:16px 0 7px!important;text-transform:uppercase}.student-profile h3{color:#fff;font-size:1.22rem;line-height:1.08;margin:0;max-width:220px}.student-profile>p:not(.profile-plantel){color:#d8ebe6!important;font-size:.71rem;margin:7px 0 0!important}
.profile-badges{display:flex;gap:6px;margin-top:13px}.profile-badges span{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.13);border-radius:999px;font-size:.56rem;font-weight:950;padding:6px 8px}.profile-badges [data-kind='internal']{background:rgba(143,200,73,.2);color:#dff7bd}.profile-badges [data-kind='external']{background:rgba(120,181,232,.2);color:#d4eaff}
.profile-facts{display:grid;gap:7px;grid-template-columns:1fr 1fr;margin:20px 0 0;width:100%}.profile-facts div{background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.1);border-radius:13px;padding:9px;text-align:left}.profile-facts dt{color:#b9d8d3;font-size:.54rem;text-transform:uppercase}.profile-facts dd{font-size:.69rem;font-weight:850;margin:3px 0 0}
.completion-ring{align-items:center;background:conic-gradient(#f6c745 var(--completion),rgba(255,255,255,.13) 0);border-radius:999px;display:flex;height:98px;justify-content:center;margin-top:18px;position:relative;width:98px;z-index:2}.completion-ring::after{background:#0a554f;border-radius:999px;content:'';inset:8px;position:absolute}.completion-ring span{position:relative;z-index:1}.completion-ring strong,.completion-ring small{display:block}.completion-ring strong{font-size:1.28rem}.completion-ring small{color:#c7dfda;font-size:.55rem}
.profile-ambassador{align-self:flex-end;filter:drop-shadow(0 12px 16px rgba(0,0,0,.18));height:126px;margin:10px -2px 0;object-fit:contain;position:relative;width:126px;z-index:1}
.student-workspace{min-width:0}.student-tabs{background:#eef6f2;border:1px solid #dbe9e3;border-radius:15px;display:flex;gap:4px;overflow-x:auto;padding:5px}.student-tabs button{align-items:center;background:transparent;border:0;border-radius:11px;color:#6a7a7c;cursor:pointer;display:flex;flex:1;font:inherit;font-size:.68rem;font-weight:850;gap:6px;justify-content:center;min-height:41px;min-width:90px;padding:0 10px;white-space:nowrap}.student-tabs button.active{background:#fff;box-shadow:0 7px 18px rgba(17,68,69,.08);color:#0b6b61}
.summary-view,.student-form{display:grid;gap:14px;margin-top:14px}.summary-hero{align-items:center;background:linear-gradient(135deg,#eef8f3,#fff9e8);border:1px solid #dbe9e3;border-radius:21px;display:grid;grid-template-columns:minmax(0,1fr) 105px;min-height:126px;overflow:hidden;padding:17px 21px}.summary-hero[data-level='primaria']{background:linear-gradient(135deg,#eef6ff,#fff9e8)}.summary-hero[data-level='secundaria']{background:linear-gradient(135deg,#fff2ef,#f0f6ff)}.summary-hero[data-level='daycare']{background:linear-gradient(135deg,#fff8dc,#eef9f0)}.summary-hero h3{font-size:1.3rem}.summary-hero p:last-child{font-size:.7rem;margin:5px 0 0}.summary-hero img{align-self:end;height:112px;justify-self:end;object-fit:contain;width:100px}
.summary-grid{display:grid;gap:11px;grid-template-columns:1fr 1fr}.summary-card{background:#fff;border:1px solid #e1ebe7;border-radius:18px;padding:15px}.summary-card header{align-items:center;display:flex;gap:10px}.summary-card header>span,.section-header>span{align-items:center;background:#edf8f3;border-radius:12px;color:#0b6b61;display:flex;height:38px;justify-content:center;width:38px}.summary-card header small,.summary-card header h4{display:block}.summary-card header small{color:#7a898a;font-size:.55rem;text-transform:uppercase}.summary-card header h4{font-size:.8rem;margin:2px 0 0}.summary-card dl{display:grid;gap:7px;margin:13px 0 0}.summary-card dl div{display:flex;gap:12px;justify-content:space-between}.summary-card dt{color:#7c898b;font-size:.61rem}.summary-card dd{font-size:.67rem;font-weight:800;margin:0;max-width:65%;text-align:right}.contact-summary{display:grid;gap:10px;margin-top:13px}.contact-summary span{border-left:3px solid #8fc849;padding-left:10px}.contact-summary strong,.contact-summary small{display:block}.contact-summary strong{font-size:.7rem}.contact-summary small{color:#7c898b;font-size:.61rem;margin-top:3px}.address-card p,.source-card p{font-size:.67rem;line-height:1.55;margin:13px 0 0}.source-card>small{color:#809092;display:block;font-size:.57rem;margin-top:9px}.progress-card{grid-column:span 1}.progress-track{background:#edf2ef;border-radius:999px;height:8px;margin:14px 0 10px;overflow:hidden}.progress-track i{background:linear-gradient(90deg,#8fc849,#0b6b61);display:block;height:100%}.missing-chips{display:flex;flex-wrap:wrap;gap:5px}.missing-chips span{background:#fff2ef;border-radius:999px;color:#a34e43;font-size:.55rem;font-weight:800;padding:5px 7px}.missing-chips span.complete{background:#edf8e6;color:#4e7f23}
.form-section{background:#fff;border:1px solid #e1ebe7;border-radius:19px;padding:17px}.section-header{align-items:center;display:flex;gap:11px;margin-bottom:15px}.section-header h3{font-size:.94rem}.section-header .mkt-eyebrow{font-size:.56rem;margin-bottom:2px}.mother-section .section-header>span{background:#fff2ef;color:#b14f43}.address-section .section-header>span{background:#eef6ff;color:#3c78b0}.health-section .section-header>span{background:#fff7df;color:#98700d}
.form-grid{display:grid;gap:11px}.form-grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}.span-2{grid-column:span 2}.span-3{grid-column:1/-1}.student-form :deep(.mkt-field>span){font-size:.63rem}.student-form :deep(.mkt-input),.student-form :deep(.mkt-textarea){font-size:.72rem;min-height:42px}.student-form :deep(.mkt-textarea){min-height:76px}.uppercase{text-transform:uppercase}.read-only-strip{background:#f5f9f7;border-radius:15px;display:grid;gap:8px;grid-template-columns:repeat(4,1fr);margin-top:14px;padding:10px}.read-only-strip span{padding:3px 7px}.read-only-strip small,.read-only-strip strong{display:block}.read-only-strip small{color:#829092;font-size:.54rem;text-transform:uppercase}.read-only-strip strong{font-size:.66rem;margin-top:3px}
.save-state{align-items:center;background:#eef8f3;border:1px solid #d8e9e1;border-radius:13px;color:#17675d;display:flex;font-size:.68rem;font-weight:800;gap:8px;padding:10px 12px}.save-state span{background:#f6c745;border-radius:999px;height:8px;width:8px}.save-state[data-state='saving'] span{animation:pulse 1s infinite}.save-state[data-state='saved'] span{background:#8fc849}.save-state[data-state='failed']{background:#fff2ef;color:#a34e43}.save-state[data-state='failed'] span{background:#ec6b5d}.form-actions{align-items:center;display:flex;gap:9px;justify-content:flex-end;padding-top:2px}
.photo-viewer{align-items:center;background:rgba(4,24,27,.9);display:flex;inset:0;justify-content:center;padding:24px;position:fixed;z-index:2000}.photo-viewer>button{align-items:center;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);border-radius:999px;color:#fff;cursor:pointer;display:flex;font-size:1.5rem;height:42px;justify-content:center;position:absolute;right:22px;top:22px;width:42px}.photo-viewer figure{margin:0;max-width:min(560px,90vw);text-align:center}.photo-viewer img{background:#fff;border-radius:24px;box-shadow:0 25px 80px rgba(0,0,0,.45);max-height:78vh;max-width:100%;object-fit:contain}.photo-viewer figcaption{color:#fff;font-size:.73rem;font-weight:800;margin-top:12px}.photo-viewer-enter-active,.photo-viewer-leave-active{transition:.18s ease}.photo-viewer-enter-from,.photo-viewer-leave-to{opacity:0}
@keyframes pulse{50%{opacity:.35}}
@media(max-width:940px){.student-modal-shell{grid-template-columns:1fr}.student-profile{display:grid;grid-template-columns:106px minmax(0,1fr) auto;padding:17px;text-align:left}.profile-photo{grid-row:1/5;height:118px;width:98px}.profile-plantel,.student-profile h3,.student-profile>p:not(.profile-plantel),.profile-badges{grid-column:2;margin-left:12px!important}.profile-facts{grid-column:1/-1;grid-template-columns:repeat(4,1fr)}.completion-ring{grid-column:3;grid-row:1/5;margin:0}.profile-ambassador{display:none}}
@media(max-width:680px){.summary-grid{grid-template-columns:1fr}.summary-hero{grid-template-columns:minmax(0,1fr) 80px;padding:15px}.summary-hero img{height:90px;width:78px}.form-grid.three{grid-template-columns:1fr 1fr}.span-2{grid-column:1/-1}.read-only-strip{grid-template-columns:1fr 1fr}.student-tabs button{flex:0 0 auto}.student-profile{grid-template-columns:88px minmax(0,1fr);padding:15px}.profile-photo{border-radius:23px;height:104px;width:84px}.completion-ring{display:none}.profile-facts{grid-template-columns:1fr 1fr}.form-actions{background:rgba(255,255,255,.97);border-top:1px solid #e4ece8;bottom:-18px;margin:0 -18px -18px;padding:12px 18px;position:sticky}.form-actions .mkt-btn{flex:1}}
@media(max-width:460px){.form-grid.three{grid-template-columns:1fr}.span-2,.span-3{grid-column:1}.student-profile{grid-template-columns:78px minmax(0,1fr)}.profile-photo{height:94px;width:76px}.profile-facts{grid-template-columns:1fr 1fr}.summary-card dd{max-width:60%}}
</style>
