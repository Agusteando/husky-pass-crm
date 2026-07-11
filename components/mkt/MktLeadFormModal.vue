<template>
  <MktModal
    :eyebrow="`Nuevo informe · Paso ${step} de 2`"
    :title="step === 1 ? 'Nueva familia interesada' : 'Interés escolar'"
    :description="step === 1 ? 'Contacto y origen del informe.' : 'Estudiante, nivel y contexto inicial.'"
    :dirty="isDirty"
    :close-disabled="saving"
    @close="emit('close')"
  >
    <template #icon><FamilyPersonasIcon :name="step === 1 ? 'people' : 'graduation'" /></template>
    <div class="step-progress" aria-hidden="true"><i :style="{ width: step === 1 ? '50%' : '100%' }" /></div>
    <form class="new-lead-form" @submit.prevent="submit">
      <div v-if="step === 1" class="mkt-form-grid">
        <label class="mkt-field">
          <span>Plantel *</span>
          <input v-model="form.plantel" class="mkt-input" list="mkt-planteles" required maxlength="20" placeholder="PM, PT, SM…" />
          <datalist id="mkt-planteles"><option v-for="plantel in planteles" :key="plantel" :value="plantel" /></datalist>
        </label>
        <label class="mkt-field"><span>Campus o zona</span><input v-model="form.campus" class="mkt-input" maxlength="100" placeholder="Metepec, Toluca…" /></label>
        <label class="mkt-field">
          <span>Vía de informe *</span>
          <select v-model="form.channel" class="mkt-select" required><option value="" disabled>Selecciona una vía</option><option v-for="channel in channelOptions" :key="channel" :value="channel">{{ mktChannelLabel(channel) }}</option></select>
        </label>
        <label class="mkt-field"><span>Relación *</span><select v-model="form.relationship" class="mkt-select" required><option value="madre">Madre o tutora</option><option value="padre">Padre o tutor</option><option value="otro">Otro responsable</option></select></label>
        <label class="mkt-field span-2"><span>Nombre del contacto *</span><input v-model="form.contactName" class="mkt-input" required maxlength="255" autocomplete="name" placeholder="Nombre completo" /></label>
        <label class="mkt-field"><span>Teléfono</span><input v-model="form.phone" class="mkt-input" maxlength="40" inputmode="tel" autocomplete="tel" placeholder="722 000 0000" /></label>
        <label class="mkt-field"><span>Correo</span><input v-model="form.email" class="mkt-input" maxlength="255" type="email" autocomplete="email" placeholder="correo@ejemplo.com" /></label>
        <label class="mkt-field span-2"><span>Origen específico</span><input v-model="form.source" class="mkt-input" maxlength="255" placeholder="Campaña, recomendación, evento…" /></label>
        <label class="mkt-field span-2"><span>Domicilio o zona de referencia</span><input v-model="form.address" class="mkt-input" maxlength="255" autocomplete="street-address" placeholder="Dato opcional para continuidad comercial" /></label>
      </div>

      <div v-else class="student-step">
        <div class="level-selector" role="radiogroup" aria-label="Nivel de interés">
          <button v-for="option in levelOptions" :key="option.level" type="button" :class="{ active: form.level === option.level }" :data-theme="option.theme" @click="form.level = option.level">
            <span><img :src="MKT_AMBASSADORS[option.theme].src" alt="" /></span><strong>{{ option.level }}</strong><FamilyPersonasIcon v-if="form.level === option.level" name="check" />
          </button>
        </div>
        <div class="mkt-form-grid student-fields">
          <label class="mkt-field span-2"><span>Nombre del estudiante *</span><input v-model="form.studentName" class="mkt-input" required maxlength="255" placeholder="Nombre completo" /></label>
          <label class="mkt-field"><span>Grado de interés</span><input v-model="form.grade" class="mkt-input" maxlength="100" placeholder="Primero, segundo…" /></label>
          <label class="mkt-field"><span>Fecha de nacimiento</span><input v-model="form.birthDate" class="mkt-input" type="date" /></label>
          <label class="enrolled-check span-2"><input v-model="form.enrolled" type="checkbox" /><span><strong>Inscripción confirmada</strong><small>El informe se registrará directamente como conversión.</small></span></label>
          <label class="mkt-field span-2"><span>Contexto inicial</span><textarea v-model="form.initialNote" class="mkt-textarea" maxlength="4000" placeholder="Necesidad principal, dudas o siguiente acuerdo…" /></label>
        </div>
        <article class="lead-summary">
          <span :data-theme="selectedTheme"><img :src="MKT_AMBASSADORS[selectedTheme].src" alt="" /></span>
          <div><strong>{{ form.studentName || 'Estudiante' }}</strong><small>{{ form.contactName || 'Contacto' }} · {{ mktChannelLabel(form.channel) }}</small></div>
          <em>{{ form.plantel.toUpperCase() || 'Plantel pendiente' }}</em>
        </article>
      </div>

      <p v-if="error" class="mkt-alert">{{ error }}</p>
      <footer class="mkt-modal-footer">
        <button v-if="step === 2" class="mkt-btn" type="button" :disabled="saving" @click="step = 1">Volver</button><span v-else />
        <button class="mkt-btn primary" type="submit" :disabled="saving"><FamilyPersonasIcon :name="step === 1 ? 'arrow' : 'check'" />{{ saving ? 'Guardando…' : step === 1 ? 'Continuar' : 'Crear informe' }}</button>
      </footer>
    </form>
  </MktModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { CreateMktLeadInput, MktLeadDetail } from '~/types/mkt'
import { useDraftState } from '~/composables/useDraftState'
import { MKT_AMBASSADORS, mktChannelLabel, mktPlantelLevel, type MktAmbassadorTheme } from '~/utils/mkt'

const props = defineProps<{ planteles: string[]; channels: string[] }>()
const emit = defineEmits<{ close: []; created: [lead: MktLeadDetail] }>()
const step = ref(1)
const saving = ref(false)
const error = ref('')
const form = reactive<CreateMktLeadInput>({ plantel: '', campus: '', channel: '', relationship: 'madre', contactName: '', email: '', phone: '', address: '', source: '', studentName: '', level: '', grade: '', birthDate: '', enrolled: false, initialNote: '' })
const { isDirty } = useDraftState(() => form)
const channelOptions = computed(() => Array.from(new Set([...props.channels, 'whatsapp', 'redes sociales', 'presencial', 'vía telefónica', 'sitio web', 'recomendación', 'otro'].filter(Boolean))))
const levelOptions: Array<{ level: string; theme: MktAmbassadorTheme }> = [
  { level: 'Guardería', theme: 'daycare' }, { level: 'Preescolar', theme: 'preescolar' }, { level: 'Primaria', theme: 'primaria' }, { level: 'Secundaria', theme: 'secundaria' }, { level: 'Bachillerato', theme: 'secundaria' }
]
const selectedTheme = computed(() => mktPlantelLevel(form.plantel, form.level))

async function submit() {
  error.value = ''
  if (step.value === 1) {
    if (!form.plantel.trim() || !form.channel || !form.contactName.trim()) { error.value = 'Completa plantel, vía y nombre del contacto.'; return }
    step.value = 2
    return
  }
  if (!form.studentName.trim() || !form.level) { error.value = 'Completa el estudiante y selecciona su nivel de interés.'; return }
  saving.value = true
  try {
    const lead = await $fetch<MktLeadDetail>('/api/mkt/leads', { method: 'POST', body: form })
    emit('created', lead)
  } catch (caught: any) {
    error.value = caught?.data?.statusMessage || caught?.statusMessage || 'No fue posible crear el informe.'
  } finally { saving.value = false }
}
</script>

<style scoped>
.step-progress{background:#e4ece8;height:5px}.step-progress i{background:linear-gradient(90deg,var(--mkt-lime),var(--mkt-yellow),var(--mkt-coral),var(--mkt-blue));display:block;height:100%;transition:width .24s ease}.new-lead-form{display:grid}.mkt-form-grid{display:grid;gap:14px;grid-template-columns:repeat(2,minmax(0,1fr));padding:22px}.span-2{grid-column:1/-1}.student-step{display:grid}.level-selector{display:grid;gap:9px;grid-template-columns:repeat(5,minmax(0,1fr));padding:20px 22px 0}.level-selector button{align-items:center;background:#fff;border:1px solid #dfe9e5;border-radius:17px;color:#315056;cursor:pointer;display:grid;font:inherit;gap:6px;justify-items:center;min-height:116px;padding:9px;position:relative}.level-selector button.active{border-color:#82b9a6;box-shadow:0 0 0 3px rgba(11,107,97,.08)}.level-selector button>span{align-items:end;background:#edf7f2;border-radius:14px;display:flex;height:64px;justify-content:center;overflow:hidden;width:58px}.level-selector button[data-theme='preescolar']>span{background:#fff3ca}.level-selector button[data-theme='primaria']>span{background:#e7f2fc}.level-selector button[data-theme='secundaria']>span{background:#ffe8e3}.level-selector img{height:62px;object-fit:contain;object-position:center bottom;width:100%}.level-selector strong{font-size:.65rem}.level-selector svg{background:var(--mkt-teal);border-radius:50%;color:#fff;height:19px;padding:3px;position:absolute;right:7px;top:7px;width:19px}.student-fields{padding-top:16px}.enrolled-check{align-items:center;background:#edf8e8;border:1px solid #d7e9cc;border-radius:15px;cursor:pointer;display:flex;gap:10px;padding:11px 13px}.enrolled-check input{accent-color:#5b9f35;height:19px;width:19px}.enrolled-check strong,.enrolled-check small{display:block}.enrolled-check strong{font-size:.73rem}.enrolled-check small{color:#718270;font-size:.61rem;margin-top:2px}.lead-summary{align-items:center;background:linear-gradient(135deg,#edf8f2,#fff8dd);border:1px solid #d8e8df;border-radius:18px;display:grid;gap:12px;grid-template-columns:52px minmax(0,1fr) auto;margin:0 22px 20px;padding:10px 13px}.lead-summary>span{align-items:end;background:#e8f5ed;border-radius:13px;display:flex;height:50px;justify-content:center;overflow:hidden}.lead-summary>span[data-theme='preescolar']{background:#fff3ca}.lead-summary>span[data-theme='primaria']{background:#e7f2fc}.lead-summary>span[data-theme='secundaria']{background:#ffe8e3}.lead-summary img{height:48px;object-fit:contain}.lead-summary strong,.lead-summary small{display:block}.lead-summary strong{font-size:.79rem}.lead-summary small{color:#748285;font-size:.64rem;margin-top:2px}.lead-summary em{color:var(--mkt-teal);font-size:.65rem;font-style:normal;font-weight:900}.mkt-alert{margin:0 22px 16px}.mkt-modal-footer{align-items:center;background:#fff;border-top:1px solid #e0e9e5;display:flex;justify-content:space-between;padding:16px 22px 20px}
@media(max-width:720px){.mkt-form-grid{grid-template-columns:1fr;padding-inline:17px}.span-2{grid-column:auto}.level-selector{grid-template-columns:repeat(2,1fr);padding-inline:17px}.level-selector button:last-child{grid-column:1/-1}.lead-summary{grid-template-columns:48px minmax(0,1fr);margin-inline:17px}.lead-summary em{display:none}.mkt-alert{margin-inline:17px}.mkt-modal-footer{padding-inline:17px}.mkt-modal-footer .mkt-btn{min-width:130px}}
</style>
