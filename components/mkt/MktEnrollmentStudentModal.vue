<template>
  <AdminModal
    ref="modalRef"
    :title="student.fullName || student.matricula"
    eyebrow="Matrícula actual"
    :description="`${student.matricula} · ${gradeGroup}`"
    :dirty="isDirty"
    :close-disabled="saving"
    wide
    dirty-title="La ficha familiar tiene cambios sin guardar"
    dirty-message="Puedes seguir editando o descartar el borrador para cerrar la consulta."
    @close="emit('close')"
  >
    <template #icon><FamilyPersonasIcon name="school" /></template>

    <div class="student-modal-shell">
      <aside class="student-profile">
        <div class="student-photo" :data-level="levelKey">
          <img v-if="photoVisible" :src="student.photoUrl || ''" :alt="`Foto de ${student.fullName}`" @error="photoVisible = false" />
          <span v-else>{{ initials }}</span>
          <i :data-state="student.status === 'Baja' ? 'inactive' : 'active'" />
        </div>
        <p class="profile-plantel">{{ plantelLabel }}</p>
        <h3>{{ student.fullName }}</h3>
        <p>{{ student.nivel || 'Nivel escolar' }} · {{ gradeGroup }}</p>

        <div class="profile-facts">
          <span><small>Matrícula</small><strong>{{ student.matricula }}</strong></span>
          <span><small>Estado</small><strong>{{ statusLabel }}</strong></span>
          <span><small>Ingreso</small><strong>{{ student.tipoIngreso || '—' }}</strong></span>
          <span><small>Expediente</small><strong>{{ completion }}%</strong></span>
        </div>

        <div class="completion-ring" :style="{ '--completion': `${completion * 3.6}deg` }">
          <span><strong>{{ completion }}%</strong><small>ficha básica</small></span>
        </div>
      </aside>

      <section class="student-workspace">
        <nav class="student-tabs" aria-label="Secciones de la ficha">
          <button type="button" :class="{ active: activeTab === 'consulta' }" @click="activeTab = 'consulta'">
            <FamilyPersonasIcon name="search" /> Consulta
          </button>
          <button type="button" :class="{ active: activeTab === 'familia' }" @click="activeTab = 'familia'">
            <FamilyPersonasIcon name="people" /> Información familiar
          </button>
        </nav>

        <div v-if="activeTab === 'consulta'" class="consultation-view">
          <section class="consultation-hero" :data-level="levelKey">
            <div>
              <p class="mkt-eyebrow">Vista institucional</p>
              <h3>{{ student.fullName }}</h3>
              <p>{{ student.nivel || 'Nivel escolar' }} · {{ gradeGroup }} · Ciclo {{ cicloLabel }}</p>
            </div>
            <img :src="ambassador" alt="" aria-hidden="true" />
          </section>

          <div class="consultation-grid">
            <article class="consultation-card identity-card">
              <header><span><FamilyPersonasIcon name="badge" /></span><div><small>Identidad</small><h4>Datos escolares</h4></div></header>
              <dl>
                <div><dt>CURP</dt><dd>{{ student.curp || 'Sin registro' }}</dd></div>
                <div><dt>Plantel</dt><dd>{{ plantelLabel }}</dd></div>
                <div><dt>Grado y grupo</dt><dd>{{ gradeGroup }}</dd></div>
                <div><dt>Última actualización</dt><dd>{{ formatDate(student.updatedAt) }}</dd></div>
              </dl>
            </article>

            <article class="consultation-card family-card">
              <header><span><FamilyPersonasIcon name="people" /></span><div><small>Familia</small><h4>Contacto principal</h4></div></header>
              <div class="parent-summary">
                <span><strong>{{ fatherDisplay || 'Padre sin registrar' }}</strong><small>{{ student.telefonoPadre || 'Sin teléfono' }} · {{ student.emailPadre || 'Sin correo' }}</small></span>
                <span><strong>{{ motherDisplay || 'Madre sin registrar' }}</strong><small>{{ student.telefonoMadre || 'Sin teléfono' }} · {{ student.emailMadre || 'Sin correo' }}</small></span>
              </div>
            </article>

            <article class="consultation-card address-card">
              <header><span><FamilyPersonasIcon name="home" /></span><div><small>Domicilio</small><h4>Dirección familiar</h4></div></header>
              <p>{{ addressDisplay || 'Sin domicilio registrado' }}</p>
            </article>

            <article class="consultation-card progress-card">
              <header><span><FamilyPersonasIcon name="check" /></span><div><small>Expediente</small><h4>{{ completion === 100 ? 'Ficha básica completa' : 'Datos por completar' }}</h4></div></header>
              <div class="progress-track"><i :style="{ width: `${completion}%` }" /></div>
              <div class="missing-chips">
                <span v-for="label in missingLabels" :key="label">{{ label }}</span>
                <span v-if="!missingLabels.length" class="complete">Información esencial registrada</span>
              </div>
            </article>
          </div>
        </div>

        <form v-else class="family-form" @submit.prevent="save">
          <section class="family-section father-section">
            <header><span>P</span><div><p class="mkt-eyebrow">Padre o tutor</p><h3>Contacto paterno</h3></div></header>
            <div class="form-grid three">
              <label class="mkt-field"><span>Nombre</span><input v-model="form.nombrePadre" class="mkt-input" autocomplete="off" /></label>
              <label class="mkt-field"><span>Apellido paterno</span><input v-model="form.apellidoPaternoPadre" class="mkt-input" autocomplete="off" /></label>
              <label class="mkt-field"><span>Apellido materno</span><input v-model="form.apellidoMaternoPadre" class="mkt-input" autocomplete="off" /></label>
              <label class="mkt-field"><span>Teléfono</span><input v-model="form.telefonoPadre" class="mkt-input" inputmode="tel" autocomplete="tel" /></label>
              <label class="mkt-field span-2"><span>Correo</span><input v-model="form.emailPadre" class="mkt-input" type="email" autocomplete="email" /></label>
            </div>
          </section>

          <section class="family-section mother-section">
            <header><span>M</span><div><p class="mkt-eyebrow">Madre o tutora</p><h3>Contacto materno</h3></div></header>
            <div class="form-grid three">
              <label class="mkt-field"><span>Nombre</span><input v-model="form.nombreMadre" class="mkt-input" autocomplete="off" /></label>
              <label class="mkt-field"><span>Apellido paterno</span><input v-model="form.apellidoPaternoMadre" class="mkt-input" autocomplete="off" /></label>
              <label class="mkt-field"><span>Apellido materno</span><input v-model="form.apellidoMaternoMadre" class="mkt-input" autocomplete="off" /></label>
              <label class="mkt-field"><span>Teléfono</span><input v-model="form.telefonoMadre" class="mkt-input" inputmode="tel" autocomplete="tel" /></label>
              <label class="mkt-field span-2"><span>Correo</span><input v-model="form.emailMadre" class="mkt-input" type="email" autocomplete="email" /></label>
            </div>
          </section>

          <section class="family-section address-section">
            <header><span><FamilyPersonasIcon name="home" /></span><div><p class="mkt-eyebrow">Domicilio</p><h3>Dirección familiar</h3></div></header>
            <div class="form-grid three">
              <label class="mkt-field span-2"><span>Calle</span><input v-model="form.domicilioCalle" class="mkt-input" autocomplete="street-address" /></label>
              <label class="mkt-field"><span>Número</span><input v-model="form.domicilioNumero" class="mkt-input" /></label>
              <label class="mkt-field"><span>Colonia</span><input v-model="form.domicilioColonia" class="mkt-input" /></label>
              <label class="mkt-field"><span>Código postal</span><input v-model="form.domicilioCp" class="mkt-input" inputmode="numeric" maxlength="10" /></label>
              <label class="mkt-field"><span>Municipio</span><input v-model="form.domicilioMunicipio" class="mkt-input" /></label>
              <label class="mkt-field span-3"><span>Dirección consolidada</span><textarea v-model="form.direccion" class="mkt-textarea" rows="2" /></label>
            </div>
          </section>

          <p v-if="error" class="mkt-alert">{{ error }}</p>
          <div v-if="saveState !== 'idle'" class="save-state" :data-state="saveState">
            <span />{{ saveState === 'saving' ? 'Guardando en Aurora…' : saveState === 'saved' ? 'Información actualizada' : 'No se pudo guardar' }}
          </div>

          <footer class="form-actions">
            <button class="mkt-btn" type="button" :disabled="saving" @click="resetForm">Restaurar</button>
            <button class="mkt-btn primary" type="submit" :disabled="saving || !isDirty">
              <FamilyPersonasIcon :name="saving ? 'replace' : 'check'" />
              {{ saving ? 'Guardando…' : 'Guardar en Aurora' }}
            </button>
          </footer>
        </form>
      </section>
    </div>
  </AdminModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { MktEnrollmentParentPatch, MktEnrollmentStudent } from '~/types/mktEnrollment'
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

const modalRef = ref<{ requestClose: () => void } | null>(null)
const activeTab = ref<'consulta' | 'familia'>('consulta')
const saving = ref(false)
const saveState = ref<'idle' | 'saving' | 'saved' | 'failed'>('idle')
const error = ref('')
const photoVisible = ref(Boolean(props.student.photoUrl))
const form = reactive<MktEnrollmentParentPatch>(emptyForm())
const { isDirty, resetDraft } = useDraftState(form)

const levelKey = computed(() => {
  if (['PM', 'PT'].includes(props.plantel)) return 'primaria'
  if (['SM', 'ST'].includes(props.plantel)) return 'secundaria'
  return 'preescolar'
})
const ambassador = computed(() => ({
  preescolar: '/personas-autorizadas/ambassadors/preescolar-joy.png',
  primaria: '/personas-autorizadas/ambassadors/primaria-brave.png',
  secundaria: '/personas-autorizadas/ambassadors/secundaria-hope.png'
}[levelKey.value]))
const initials = computed(() => String(props.student.fullName || '').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'HP')
const gradeGroup = computed(() => [props.student.grado, props.student.group || props.student.grupo].filter(Boolean).join(' · ') || 'Sin grupo')
const cicloLabel = computed(() => props.ciclo ? `${props.ciclo}-${Number(props.ciclo) + 1}` : '—')
const statusLabel = computed(() => props.student.enrollmentState === 'inscrito' ? 'Inscrito' : props.student.status || 'Activo')
const completion = computed(() => Math.max(0, Math.min(100, Number(props.student.completenessTiers?.basic?.progress ?? (props.student.missingFields?.length ? 50 : 100)) || 0)))
const missingLabels = computed(() => (props.student.completenessTiers?.basic?.missingLabels || props.student.missingLabels || []).slice(0, 8))
const fatherDisplay = computed(() => fullName(form.nombrePadre, form.apellidoPaternoPadre, form.apellidoMaternoPadre) || props.student.fatherName || '')
const motherDisplay = computed(() => fullName(form.nombreMadre, form.apellidoPaternoMadre, form.apellidoMaternoMadre) || props.student.motherName || '')
const addressDisplay = computed(() => form.direccion || [form.domicilioCalle, form.domicilioNumero, form.domicilioColonia, form.domicilioCp, form.domicilioMunicipio].filter(Boolean).join(', ') || props.student.address || props.student.direccion || '')

function emptyForm(): MktEnrollmentParentPatch {
  return {
    nombrePadre: '', apellidoPaternoPadre: '', apellidoMaternoPadre: '', telefonoPadre: '', emailPadre: '',
    nombreMadre: '', apellidoPaternoMadre: '', apellidoMaternoMadre: '', telefonoMadre: '', emailMadre: '',
    direccion: '', domicilioCalle: '', domicilioNumero: '', domicilioColonia: '', domicilioCp: '', domicilioMunicipio: ''
  }
}

function formFromStudent(student: MktEnrollmentStudent): MktEnrollmentParentPatch {
  return {
    nombrePadre: String(student.nombrePadre || student.padre?.nombres || ''),
    apellidoPaternoPadre: String(student.apellidoPaternoPadre || student.padre?.apellidoPaterno || ''),
    apellidoMaternoPadre: String(student.apellidoMaternoPadre || student.padre?.apellidoMaterno || ''),
    telefonoPadre: String(student.telefonoPadre || student.padre?.telefono || ''),
    emailPadre: String(student.emailPadre || student.padre?.correo || ''),
    nombreMadre: String(student.nombreMadre || student.madre?.nombres || ''),
    apellidoPaternoMadre: String(student.apellidoPaternoMadre || student.madre?.apellidoPaterno || ''),
    apellidoMaternoMadre: String(student.apellidoMaternoMadre || student.madre?.apellidoMaterno || ''),
    telefonoMadre: String(student.telefonoMadre || student.madre?.telefono || ''),
    emailMadre: String(student.emailMadre || student.madre?.correo || ''),
    direccion: String(student.direccion || student.address || ''),
    domicilioCalle: String(student.domicilioCalle || ''),
    domicilioNumero: String(student.domicilioNumero || student.domicilioNum || ''),
    domicilioColonia: String(student.domicilioColonia || ''),
    domicilioCp: String(student.domicilioCp || ''),
    domicilioMunicipio: String(student.domicilioMunicipio || '')
  }
}

function fullName(...parts: string[]) {
  return parts.map((part) => part.trim()).filter(Boolean).join(' ')
}

function applyStudent(student: MktEnrollmentStudent) {
  Object.assign(form, formFromStudent(student))
  photoVisible.value = Boolean(student.photoUrl)
  error.value = ''
  saveState.value = 'idle'
  resetDraft(form)
}

function resetForm() {
  applyStudent(props.student)
}

function validate() {
  const phoneFields = [form.telefonoPadre, form.telefonoMadre].filter(Boolean)
  if (phoneFields.some((value) => value.replace(/\D/g, '').length < 10)) return 'Revisa los teléfonos; deben tener al menos 10 dígitos.'
  const emails = [form.emailPadre, form.emailMadre].filter(Boolean)
  if (emails.some((value) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) return 'Revisa los correos electrónicos.'
  return ''
}

async function save() {
  const validation = validate()
  if (validation) {
    error.value = validation
    return
  }
  const previous = { ...props.student }
  const optimistic: MktEnrollmentStudent = {
    ...props.student,
    ...form,
    fatherName: fullName(form.nombrePadre, form.apellidoPaternoPadre, form.apellidoMaternoPadre),
    motherName: fullName(form.nombreMadre, form.apellidoPaternoMadre, form.apellidoMaternoMadre),
    address: addressDisplay.value,
    updatedAt: new Date().toISOString()
  }
  saving.value = true
  saveState.value = 'saving'
  error.value = ''
  emit('optimistic', optimistic)
  try {
    const response = await $fetch<{ data: MktEnrollmentStudent }>(`/api/mkt/enrollment/students/${encodeURIComponent(props.student.matricula)}`, {
      method: 'PATCH',
      query: { plantel: props.plantel, ciclo: props.ciclo },
      body: form
    })
    emit('saved', response.data)
    Object.assign(form, formFromStudent(response.data))
    resetDraft(form)
    saveState.value = 'saved'
    window.setTimeout(() => { if (saveState.value === 'saved') saveState.value = 'idle' }, 2200)
  } catch (caught: any) {
    const message = caught?.data?.message || caught?.data?.statusMessage || caught?.statusMessage || 'No se pudo guardar la información familiar.'
    error.value = message
    saveState.value = 'failed'
    emit('rollback', previous, message)
  } finally {
    saving.value = false
  }
}

function formatDate(value: unknown) {
  if (!value) return 'Sin registro'
  const date = new Date(String(value))
  if (!Number.isFinite(date.getTime())) return 'Sin registro'
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

watch(() => props.student, (student) => {
  if (!saving.value) applyStudent(student)
}, { immediate: true, deep: false })
</script>

<style scoped>
.student-modal-shell { display:grid; gap:18px; grid-template-columns:280px minmax(0,1fr); }
.student-profile { align-items:center; background:linear-gradient(165deg,#0b6b61,#0a514c 58%,#123d46); border-radius:24px; color:#fff; display:flex; flex-direction:column; min-height:100%; overflow:hidden; padding:24px 18px; position:relative; text-align:center; }
.student-profile::before { background:radial-gradient(circle,rgba(246,199,69,.25),transparent 68%); content:''; height:220px; position:absolute; right:-90px; top:-90px; width:220px; }
.student-photo { align-items:center; background:#e9f7f0; border:5px solid rgba(255,255,255,.9); border-radius:30px; box-shadow:0 18px 34px rgba(4,35,39,.28); display:flex; height:132px; justify-content:center; overflow:hidden; position:relative; width:112px; }
.student-photo[data-level='primaria'] { background:#eaf3ff; }.student-photo[data-level='secundaria']{background:#fff0ed}
.student-photo img { height:100%; object-fit:cover; width:100%; }.student-photo>span{color:#0b6b61;font-family:var(--font-title);font-size:2rem}.student-photo i{border:3px solid white;border-radius:999px;bottom:5px;height:15px;position:absolute;right:5px;width:15px}.student-photo i[data-state='active']{background:#8fc849}.student-photo i[data-state='inactive']{background:#ec6b5d}
.profile-plantel { color:#bfe6d8!important; font-size:.7rem; font-weight:900; letter-spacing:.08em; margin:16px 0 7px!important; text-transform:uppercase; }.student-profile h3{color:#fff;font-size:1.25rem;line-height:1.08;margin:0}.student-profile>p:not(.profile-plantel){color:#d8ebe6!important;font-size:.75rem;margin:6px 0 0!important}
.profile-facts { display:grid; gap:8px; grid-template-columns:1fr 1fr; margin-top:22px; width:100%; }.profile-facts span{background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:10px;text-align:left}.profile-facts small,.profile-facts strong{display:block}.profile-facts small{color:#b9d8d3;font-size:.59rem;text-transform:uppercase}.profile-facts strong{font-size:.73rem;margin-top:3px}
.completion-ring { align-items:center; background:conic-gradient(#f6c745 var(--completion),rgba(255,255,255,.13) 0); border-radius:999px; display:flex; height:104px; justify-content:center; margin-top:22px; position:relative; width:104px; }.completion-ring::after{background:#0a554f;border-radius:999px;content:'';inset:8px;position:absolute}.completion-ring span{position:relative;z-index:1}.completion-ring strong,.completion-ring small{display:block}.completion-ring strong{font-size:1.35rem}.completion-ring small{color:#c7dfda;font-size:.58rem}
.student-workspace { min-width:0; }.student-tabs { background:#eef6f2;border:1px solid #dbe9e3;border-radius:15px;display:flex;gap:5px;padding:5px; }.student-tabs button{align-items:center;background:transparent;border:0;border-radius:11px;color:#6a7a7c;cursor:pointer;display:flex;font:inherit;font-size:.75rem;font-weight:850;gap:7px;justify-content:center;min-height:40px;padding:0 14px}.student-tabs button.active{background:#fff;box-shadow:0 7px 18px rgba(17,68,69,.08);color:#0b6b61}
.consultation-view,.family-form{display:grid;gap:14px;margin-top:14px}.consultation-hero{align-items:center;background:linear-gradient(135deg,#eef8f3,#fff9e8);border:1px solid #dbe9e3;border-radius:21px;display:grid;grid-template-columns:minmax(0,1fr) 110px;min-height:130px;overflow:hidden;padding:18px 22px}.consultation-hero[data-level='primaria']{background:linear-gradient(135deg,#eef6ff,#fff9e8)}.consultation-hero[data-level='secundaria']{background:linear-gradient(135deg,#fff2ef,#f0f6ff)}.consultation-hero h3{font-size:1.35rem}.consultation-hero p:last-child{font-size:.74rem;margin:5px 0 0}.consultation-hero img{align-self:end;height:118px;justify-self:end;object-fit:contain;width:105px}
.consultation-grid{display:grid;gap:12px;grid-template-columns:1fr 1fr}.consultation-card{background:#fff;border:1px solid #e1ebe7;border-radius:18px;padding:15px}.consultation-card header{align-items:center;display:flex;gap:10px}.consultation-card header>span{align-items:center;background:#edf8f3;border-radius:12px;color:#0b6b61;display:flex;height:38px;justify-content:center;width:38px}.consultation-card header small,.consultation-card header h4{display:block}.consultation-card header small{color:#7a898a;font-size:.58rem;text-transform:uppercase}.consultation-card header h4{font-size:.82rem;margin:2px 0 0}.consultation-card dl{display:grid;gap:7px;margin:14px 0 0}.consultation-card dl div{display:flex;gap:12px;justify-content:space-between}.consultation-card dt{color:#7c898b;font-size:.64rem}.consultation-card dd{font-size:.7rem;font-weight:800;margin:0;text-align:right}.parent-summary{display:grid;gap:10px;margin-top:14px}.parent-summary span{border-left:3px solid #8fc849;padding-left:10px}.parent-summary strong,.parent-summary small{display:block}.parent-summary strong{font-size:.72rem}.parent-summary small{color:#7c898b;font-size:.63rem;margin-top:3px}.address-card p{font-size:.7rem;line-height:1.55;margin:14px 0 0}.progress-track{background:#edf2ef;border-radius:999px;height:8px;margin:15px 0 10px;overflow:hidden}.progress-track i{background:linear-gradient(90deg,#8fc849,#0b6b61);display:block;height:100%}.missing-chips{display:flex;flex-wrap:wrap;gap:5px}.missing-chips span{background:#fff2ef;border-radius:999px;color:#a34e43;font-size:.58rem;font-weight:800;padding:5px 7px}.missing-chips span.complete{background:#edf8e6;color:#4e7f23}
.family-section{background:#fff;border:1px solid #e1ebe7;border-radius:19px;padding:16px}.family-section>header{align-items:center;display:flex;gap:11px;margin-bottom:14px}.family-section>header>span{align-items:center;background:#edf8f3;border-radius:13px;color:#0b6b61;display:flex;font-weight:900;height:42px;justify-content:center;width:42px}.mother-section>header>span{background:#fff2ef;color:#b14f43}.address-section>header>span{background:#eef6ff;color:#3c78b0}.family-section h3{font-size:.94rem}.family-section .mkt-eyebrow{font-size:.58rem;margin-bottom:2px}.form-grid{display:grid;gap:11px}.form-grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}.span-2{grid-column:span 2}.span-3{grid-column:1/-1}.family-form :deep(.mkt-field>span){font-size:.65rem}.family-form :deep(.mkt-input),.family-form :deep(.mkt-textarea){font-size:.73rem;min-height:42px}.family-form :deep(.mkt-textarea){min-height:70px}
.save-state{align-items:center;background:#eef8f3;border:1px solid #d8e9e1;border-radius:13px;color:#17675d;display:flex;font-size:.7rem;font-weight:800;gap:8px;padding:10px 12px}.save-state span{background:#f6c745;border-radius:999px;height:8px;width:8px}.save-state[data-state='saving'] span{animation:pulse 1s infinite}.save-state[data-state='saved'] span{background:#8fc849}.save-state[data-state='failed']{background:#fff2ef;color:#a34e43}.save-state[data-state='failed'] span{background:#ec6b5d}.form-actions{align-items:center;display:flex;gap:9px;justify-content:flex-end;padding-top:2px}@keyframes pulse{50%{opacity:.35}}
@media(max-width:900px){.student-modal-shell{grid-template-columns:1fr}.student-profile{display:grid;grid-template-columns:auto minmax(0,1fr);min-height:auto;text-align:left}.student-photo{grid-row:1/4}.profile-plantel,.student-profile h3,.student-profile>p:not(.profile-plantel){margin-left:14px!important}.profile-facts{grid-column:1/-1}.completion-ring{display:none}}
@media(max-width:650px){.consultation-grid{grid-template-columns:1fr}.consultation-hero{grid-template-columns:minmax(0,1fr) 82px;padding:16px}.consultation-hero img{height:92px;width:82px}.form-grid.three{grid-template-columns:1fr 1fr}.span-2{grid-column:1/-1}.student-tabs button{flex:1;padding-inline:8px}.student-profile{grid-template-columns:88px minmax(0,1fr);padding:17px}.student-photo{border-radius:24px;height:104px;width:84px}.profile-facts{grid-template-columns:1fr 1fr}.form-actions{position:sticky;bottom:-18px;background:rgba(255,255,255,.96);border-top:1px solid #e4ece8;margin:0 -18px -18px;padding:12px 18px}.form-actions .mkt-btn{flex:1}}
</style>
