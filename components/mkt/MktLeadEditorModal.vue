<template>
  <MktModal
    wide
    eyebrow="Expediente familiar"
    :title="lead.id === 0 ? 'Completar ficha del informe' : 'Editar información del informe'"
    :description="`${lead.folio} · ${lead.studentName}`"
    :dirty="isDirty"
    :close-disabled="saving"
    @close="emit('close')"
  >
    <template #icon><FamilyPersonasIcon name="edit" /></template>
    <template #default="{ requestClose }">
      <form class="lead-editor-form" @submit.prevent="save">
      <section class="editor-section identity-section">
        <header><div><p class="mkt-eyebrow">Origen</p><h3>Contexto del informe</h3></div><span>{{ lead.folio }}</span></header>
        <div class="mkt-form-grid">
          <label class="mkt-field"><span>Plantel *</span><input v-model="form.plantel" class="mkt-input" list="edit-mkt-planteles" required maxlength="20" /></label>
          <datalist id="edit-mkt-planteles"><option v-for="plantel in planteles" :key="plantel" :value="plantel" /></datalist>
          <label class="mkt-field"><span>Campus o zona</span><input v-model="form.campus" class="mkt-input" maxlength="100" /></label>
          <label class="mkt-field span-2"><span>Vía de informe *</span><select v-model="form.channel" class="mkt-select" required><option v-for="channel in channelOptions" :key="channel" :value="channel">{{ mktChannelLabel(channel) }}</option></select></label>
        </div>
      </section>

      <section class="editor-section contacts-section">
        <header><div><p class="mkt-eyebrow">Red familiar</p><h3>Contactos</h3></div></header>
        <div class="contact-edit-grid">
          <article v-for="contact in contactCards" :key="contact.key" class="contact-edit-card" :data-tone="contact.key">
            <div class="contact-edit-head"><span><FamilyPersonasIcon name="person" /></span><div><strong>{{ contact.title }}</strong><small>{{ contact.subtitle }}</small></div></div>
            <label class="mkt-field"><span>Nombre</span><input v-model="form[contact.key].name" class="mkt-input" maxlength="255" /></label>
            <div class="contact-fields">
              <label class="mkt-field"><span>Teléfono</span><input v-model="form[contact.key].phone" class="mkt-input" maxlength="40" inputmode="tel" /></label>
              <label class="mkt-field"><span>Correo</span><input v-model="form[contact.key].email" class="mkt-input" maxlength="255" type="email" /></label>
            </div>
            <label class="mkt-field"><span>Cómo se enteró</span><input v-model="form[contact.key].source" class="mkt-input" maxlength="255" /></label>
            <label class="mkt-field"><span>Domicilio</span><input v-model="form[contact.key].address" class="mkt-input" maxlength="255" /></label>
          </article>
        </div>
      </section>

      <section class="editor-section students-section">
        <header>
          <div><p class="mkt-eyebrow">Interés escolar</p><h3>Estudiantes</h3></div>
          <button v-if="form.students.length < 5" class="mkt-btn soft" type="button" @click="addStudent"><FamilyPersonasIcon name="user-plus" />Agregar estudiante</button>
        </header>
        <div class="student-edit-list">
          <article v-for="(student, index) in form.students" :key="student.id || `new-${index}`" class="student-edit-card">
            <div class="student-avatar" :data-theme="mktPlantelLevel(form.plantel, student.level)"><img :src="MKT_AMBASSADORS[mktPlantelLevel(form.plantel, student.level)].src" alt="" /></div>
            <div class="student-fields">
              <label class="mkt-field span-2"><span>Nombre del estudiante *</span><input v-model="student.fullName" class="mkt-input" required maxlength="255" /></label>
              <label class="mkt-field"><span>Nivel *</span><select v-model="student.level" class="mkt-select" required><option v-for="level in levels" :key="level" :value="level">{{ level }}</option></select></label>
              <label class="mkt-field"><span>Grado</span><input v-model="student.grade" class="mkt-input" maxlength="100" /></label>
              <label class="mkt-field"><span>Fecha de nacimiento</span><input v-model="student.birthDate" class="mkt-input" type="date" /></label>
              <label class="enrolled-check"><input v-model="student.enrolled" type="checkbox" /><span><strong>Inscripción confirmada</strong><small>La ficha contará como conversión.</small></span></label>
            </div>
            <button v-if="form.students.length > 1" class="remove-new-student" type="button" :aria-label="`Quitar a ${student.fullName || 'este estudiante'}`" @click="removeStudent(index)"><FamilyPersonasIcon name="trash" /></button>
          </article>
        </div>
      </section>

      <p v-if="error" class="mkt-alert">{{ error }}</p>
      <footer class="editor-footer">
        <span>{{ isDirty ? 'Cambios pendientes' : 'Ficha actualizada' }}</span>
        <div><button class="mkt-btn" type="button" :disabled="saving" @click="requestClose">Cancelar</button><button class="mkt-btn primary" type="submit" :disabled="saving || !isDirty"><FamilyPersonasIcon name="save" />{{ saving ? 'Guardando…' : 'Guardar ficha' }}</button></div>
      </footer>
      </form>
    </template>
  </MktModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { MktLeadDetail, MktContactRecord, UpdateMktLeadInput } from '~/types/mkt'
import { useDraftState } from '~/composables/useDraftState'
import { MKT_AMBASSADORS, mktChannelLabel, mktPlantelLevel } from '~/utils/mkt'

const props = defineProps<{ lead: MktLeadDetail; planteles?: string[]; channels?: string[] }>()
const emit = defineEmits<{ close: []; saved: [lead: MktLeadDetail] }>()
const emptyContact = (): MktContactRecord => ({ name: '', email: '', phone: '', address: '', source: '' })
const form = reactive<UpdateMktLeadInput>({
  plantel: props.lead.plantel,
  campus: props.lead.campus,
  channel: props.lead.channel,
  father: { ...emptyContact(), ...props.lead.father },
  mother: { ...emptyContact(), ...props.lead.mother },
  students: props.lead.students.length
    ? props.lead.students.map((student) => ({ id: student.id, fullName: student.fullName, level: student.level, grade: student.grade, birthDate: student.birthDate?.slice(0, 10) || '', enrolled: student.enrolled }))
    : [{ fullName: props.lead.studentName === 'Estudiante pendiente' ? '' : props.lead.studentName, level: props.lead.level, grade: props.lead.grade, birthDate: '', enrolled: props.lead.enrolled }]
})
const { isDirty, resetDraft } = useDraftState(() => form)
const saving = ref(false)
const error = ref('')
const levels = ['Guardería', 'Preescolar', 'Primaria', 'Secundaria', 'Bachillerato']
const contactCards: Array<{ key: 'mother' | 'father'; title: string; subtitle: string }> = [
  { key: 'mother', title: 'Madre o tutora', subtitle: 'Contacto principal o alterno' },
  { key: 'father', title: 'Padre o tutor', subtitle: 'Contacto principal o alterno' }
]
const planteles = computed(() => Array.from(new Set([props.lead.plantel, ...(props.planteles || [])].filter(Boolean))))
const channelOptions = computed(() => Array.from(new Set([props.lead.channel, ...(props.channels || []), 'whatsapp', 'redes sociales', 'presencial', 'vía telefónica', 'sitio web', 'recomendación', 'otro'].filter(Boolean))))

function addStudent() { form.students.push({ fullName: '', level: form.students[0]?.level || '', grade: '', birthDate: '', enrolled: false }) }
function removeStudent(index: number) { form.students.splice(index, 1) }

async function save() {
  if (!form.father.name.trim() && !form.mother.name.trim()) { error.value = 'Registra al menos un contacto familiar.'; return }
  saving.value = true
  error.value = ''
  try {
    const updated = await $fetch<MktLeadDetail>(`/api/mkt/leads/${encodeURIComponent(props.lead.folio)}`, { method: 'PUT', body: form })
    resetDraft(form)
    emit('saved', updated)
  } catch (caught: any) {
    error.value = caught?.data?.statusMessage || caught?.statusMessage || 'No fue posible guardar la ficha.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.lead-editor-form { display: grid; gap: 14px; padding: 18px; }
.editor-section { background: #fff; border: 1px solid var(--mkt-line); border-radius: 22px; overflow: hidden; }
.editor-section>header { align-items:center; border-bottom:1px solid #e5ece9; display:flex; gap:14px; justify-content:space-between; padding:16px 18px; }
.editor-section h3 { font-family:var(--font-title); font-size:1.25rem; margin:0; }.editor-section>header>span{background:#eef7f3;border-radius:99px;color:var(--mkt-teal);font-size:.68rem;font-weight:900;padding:7px 10px}
.mkt-form-grid { display:grid; gap:14px; grid-template-columns:repeat(2,minmax(0,1fr)); padding:18px; }.span-2{grid-column:1/-1}
.contact-edit-grid { display:grid; gap:12px; grid-template-columns:repeat(2,minmax(0,1fr)); padding:18px; }.contact-edit-card{background:#f8fbf9;border:1px solid #e0eae5;border-radius:18px;display:grid;gap:12px;padding:15px}.contact-edit-card[data-tone='father']{background:#f6f9fd}.contact-edit-head{align-items:center;display:flex;gap:10px}.contact-edit-head>span{align-items:center;background:#e8f5ef;border-radius:12px;color:var(--mkt-teal);display:flex;height:38px;justify-content:center;width:38px}.contact-edit-card[data-tone='father'] .contact-edit-head>span{background:#e9f2fb;color:var(--mkt-blue)}.contact-edit-head strong,.contact-edit-head small{display:block}.contact-edit-head strong{font-size:.78rem}.contact-edit-head small{color:#829092;font-size:.61rem;margin-top:2px}.contact-fields{display:grid;gap:10px;grid-template-columns:1fr 1fr}
.student-edit-list{display:grid;gap:12px;padding:18px}.student-edit-card{align-items:start;background:#f8fbf9;border:1px solid #e0eae5;border-radius:19px;display:grid;gap:14px;grid-template-columns:76px minmax(0,1fr) auto;padding:14px;position:relative}.student-avatar{align-items:end;background:#e7f5ed;border-radius:18px;display:flex;height:92px;justify-content:center;overflow:hidden}.student-avatar[data-theme='preescolar']{background:#fff3cc}.student-avatar[data-theme='primaria']{background:#e7f2fc}.student-avatar[data-theme='secundaria']{background:#ffe8e3}.student-avatar img{height:88px;object-fit:contain;object-position:center bottom;width:100%}.student-fields{display:grid;gap:11px;grid-template-columns:repeat(2,minmax(0,1fr))}.enrolled-check{align-items:center;background:#edf8e9;border:1px solid #d7e9cc;border-radius:14px;cursor:pointer;display:flex;gap:9px;padding:9px 11px}.enrolled-check input{accent-color:#5b9f35;height:18px;width:18px}.enrolled-check strong,.enrolled-check small{display:block}.enrolled-check strong{font-size:.68rem}.enrolled-check small{color:#72816f;font-size:.58rem;margin-top:2px}.remove-new-student{align-items:center;background:#fff0ed;border:1px solid #f1d1cb;border-radius:12px;color:#bd4f45;cursor:pointer;display:flex;height:36px;justify-content:center;width:36px}.editor-footer{align-items:center;background:#fff;border:1px solid var(--mkt-line);border-radius:18px;display:flex;gap:15px;justify-content:space-between;padding:13px 15px;position:sticky;bottom:0;z-index:2}.editor-footer>span{color:#7a898b;font-size:.67rem}.editor-footer>div{display:flex;gap:9px}
@media(max-width:760px){.mkt-form-grid,.contact-edit-grid,.student-fields{grid-template-columns:1fr}.span-2{grid-column:auto}.student-edit-card{grid-template-columns:64px minmax(0,1fr)}.student-avatar{height:76px}.student-avatar img{height:74px}.remove-new-student{position:absolute;right:10px;top:10px}.editor-section>header{align-items:flex-start;flex-direction:column}.editor-section>header .mkt-btn{width:100%}.editor-footer{align-items:stretch;flex-direction:column}.editor-footer>div{display:grid;grid-template-columns:1fr 1fr}.editor-footer .mkt-btn{width:100%}}
</style>
