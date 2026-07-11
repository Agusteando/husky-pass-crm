<template>
  <Teleport to="body">
    <div class="mkt-modal-backdrop" role="presentation" @click.self="emit('close')">
      <section class="mkt-modal" role="dialog" aria-modal="true" aria-labelledby="new-lead-title">
        <header class="mkt-modal__head">
          <div>
            <p class="mkt-eyebrow">Nuevo informe · Paso {{ step }} de 2</p>
            <h2 id="new-lead-title">{{ step === 1 ? '¿Quién solicita información?' : '¿Para quién es el informe?' }}</h2>
            <p>{{ step === 1 ? 'Captura solo lo necesario para poder dar seguimiento.' : 'Completa el interés escolar; el folio se genera al guardar.' }}</p>
          </div>
          <button class="modal-close" type="button" aria-label="Cerrar" @click="emit('close')">×</button>
        </header>

        <div class="step-progress"><i :style="{ width: step === 1 ? '50%' : '100%' }" /></div>

        <form @submit.prevent="submit">
          <div v-if="step === 1" class="mkt-form-grid">
            <label class="mkt-field">
              <span>Plantel *</span>
              <input v-model="form.plantel" class="mkt-input" list="mkt-planteles" required maxlength="20" placeholder="Ej. PM, PT, SM" />
              <datalist id="mkt-planteles"><option v-for="plantel in planteles" :key="plantel" :value="plantel" /></datalist>
            </label>
            <label class="mkt-field">
              <span>Campus o zona</span>
              <input v-model="form.campus" class="mkt-input" maxlength="100" placeholder="Ej. Metepec" />
            </label>
            <label class="mkt-field">
              <span>Vía de informe *</span>
              <select v-model="form.channel" class="mkt-select" required>
                <option value="" disabled>Selecciona una vía</option>
                <option v-for="channel in channels" :key="channel" :value="channel">{{ channelLabel(channel) }}</option>
              </select>
            </label>
            <label class="mkt-field">
              <span>Relación con el estudiante *</span>
              <select v-model="form.relationship" class="mkt-select" required>
                <option value="madre">Madre o tutora</option>
                <option value="padre">Padre o tutor</option>
                <option value="otro">Otro tutor</option>
              </select>
            </label>
            <label class="mkt-field span-2">
              <span>Nombre del contacto *</span>
              <input v-model="form.contactName" class="mkt-input" required maxlength="255" autocomplete="name" placeholder="Nombre completo" />
            </label>
            <label class="mkt-field">
              <span>Teléfono</span>
              <input v-model="form.phone" class="mkt-input" maxlength="40" inputmode="tel" autocomplete="tel" placeholder="722 000 0000" />
            </label>
            <label class="mkt-field">
              <span>Correo</span>
              <input v-model="form.email" class="mkt-input" maxlength="255" type="email" autocomplete="email" placeholder="correo@ejemplo.com" />
            </label>
            <label class="mkt-field span-2">
              <span>¿Cómo se enteró?</span>
              <input v-model="form.source" class="mkt-input" maxlength="255" placeholder="Redes sociales, recomendación, evento…" />
            </label>
          </div>

          <div v-else class="mkt-form-grid">
            <label class="mkt-field span-2">
              <span>Nombre del estudiante *</span>
              <input v-model="form.studentName" class="mkt-input" required maxlength="255" placeholder="Nombre completo" />
            </label>
            <label class="mkt-field">
              <span>Nivel de interés *</span>
              <select v-model="form.level" class="mkt-select" required>
                <option value="" disabled>Selecciona un nivel</option>
                <option v-for="level in levels" :key="level" :value="level">{{ level }}</option>
              </select>
            </label>
            <label class="mkt-field">
              <span>Grado de interés</span>
              <input v-model="form.grade" class="mkt-input" maxlength="100" placeholder="Ej. Primero" />
            </label>
            <label class="mkt-field">
              <span>Fecha de nacimiento</span>
              <input v-model="form.birthDate" class="mkt-input" type="date" />
            </label>
            <label class="enrolled-check">
              <input v-model="form.enrolled" type="checkbox" />
              <span><strong>Ya está inscrito</strong><small>Marca solo si la inscripción está confirmada.</small></span>
            </label>
            <label class="mkt-field span-2">
              <span>Primer contexto para seguimiento</span>
              <textarea v-model="form.initialNote" class="mkt-textarea" maxlength="4000" placeholder="Qué necesita la familia, dudas principales o acuerdo inicial…" />
            </label>
            <article class="lead-summary span-2">
              <span>{{ form.plantel.toUpperCase() || 'Plantel' }}</span>
              <div><strong>{{ form.studentName || 'Estudiante' }}</strong><small>{{ form.contactName }} · {{ channelLabel(form.channel) }}</small></div>
              <em>Folio automático</em>
            </article>
          </div>

          <p v-if="error" class="mkt-alert">{{ error }}</p>

          <footer class="mkt-modal__footer">
            <button v-if="step === 2" class="mkt-btn" type="button" @click="step = 1">Volver</button>
            <span v-else />
            <button class="mkt-btn primary" type="submit" :disabled="saving">
              <FamilyPersonasIcon :name="step === 1 ? 'arrow' : 'check'" />
              {{ saving ? 'Guardando…' : step === 1 ? 'Continuar' : 'Crear informe' }}
            </button>
          </footer>
        </form>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { CreateMktLeadInput, MktLeadDetail } from '~/types/mkt'

defineProps<{ planteles: string[]; channels: string[] }>()
const emit = defineEmits<{ close: []; created: [lead: MktLeadDetail] }>()
const step = ref(1)
const saving = ref(false)
const error = ref('')
const levels = ['Guardería', 'Preescolar', 'Primaria', 'Secundaria', 'Bachillerato']
const form = reactive<CreateMktLeadInput>({
  plantel: '', campus: '', channel: '', relationship: 'madre', contactName: '', email: '', phone: '', address: '', source: '',
  studentName: '', level: '', grade: '', birthDate: '', enrolled: false, initialNote: ''
})

async function submit() {
  error.value = ''
  if (step.value === 1) {
    if (!form.plantel.trim() || !form.channel || !form.contactName.trim()) {
      error.value = 'Completa plantel, vía de informe y nombre del contacto.'
      return
    }
    step.value = 2
    return
  }
  if (!form.studentName.trim() || !form.level) {
    error.value = 'Completa el estudiante y su nivel de interés.'
    return
  }
  saving.value = true
  try {
    const lead = await $fetch<MktLeadDetail>('/api/mkt/leads', { method: 'POST', body: form })
    emit('created', lead)
  } catch (caught: any) {
    error.value = caught?.data?.statusMessage || caught?.statusMessage || 'No fue posible crear el informe.'
  } finally {
    saving.value = false
  }
}

function channelLabel(value: string) {
  if (!value) return 'Vía pendiente'
  const normalized = value.toLocaleLowerCase('es-MX')
  if (normalized === 'whatsapp') return 'WhatsApp'
  return value.charAt(0).toUpperCase() + value.slice(1)
}
</script>

<style scoped>
.mkt-modal-backdrop { align-items:center; background:rgba(8,32,38,.55); display:flex; inset:0; justify-content:center; padding:18px; position:fixed; z-index:80; }
.mkt-modal { background:#fbfdfc; border:1px solid rgba(255,255,255,.8); border-radius:26px; box-shadow:0 30px 90px rgba(5,35,40,.28); max-height:min(90vh,850px); max-width:820px; overflow:auto; width:100%; }
.mkt-modal__head { align-items:start; display:grid; gap:20px; grid-template-columns:minmax(0,1fr) 40px; padding:24px 26px 18px; }.mkt-modal__head h2{color:#123038;font-family:var(--font-title);font-size:clamp(1.55rem,3vw,2.2rem);margin:0}.mkt-modal__head p:last-child{color:#718083;font-size:.78rem;margin:7px 0 0}.modal-close{background:#eef4f1;border:0;border-radius:12px;color:#607174;cursor:pointer;font-size:1.6rem;height:40px;width:40px}.step-progress{background:#e8efec;height:4px}.step-progress i{background:linear-gradient(90deg,#8fc849,#0b6b61);display:block;height:100%;transition:width .25s ease}
.mkt-form-grid { display:grid; gap:15px; grid-template-columns:repeat(2,minmax(0,1fr)); padding:24px 26px; }.span-2{grid-column:1/-1}.enrolled-check{align-items:center;background:#f1f7f4;border:1px solid #dce9e3;border-radius:15px;cursor:pointer;display:flex;gap:10px;padding:10px 13px}.enrolled-check input{accent-color:#0b6b61;height:18px;width:18px}.enrolled-check strong,.enrolled-check small{display:block}.enrolled-check strong{font-size:.76rem}.enrolled-check small{color:#7e8c8d;font-size:.63rem;margin-top:2px}.lead-summary{align-items:center;background:linear-gradient(135deg,#eff8f4,#fff9e8);border:1px solid #dae9e2;border-radius:17px;display:grid;gap:12px;grid-template-columns:46px minmax(0,1fr) auto;padding:13px}.lead-summary>span{align-items:center;background:#0b6b61;border-radius:12px;color:#fff;display:flex;font-size:.69rem;height:42px;justify-content:center}.lead-summary strong,.lead-summary small{display:block}.lead-summary strong{font-size:.8rem}.lead-summary small{color:#738183;font-size:.67rem;margin-top:3px}.lead-summary em{color:#0b6b61;font-size:.65rem;font-style:normal}.mkt-alert{margin:0 26px}.mkt-modal__footer{align-items:center;border-top:1px solid #e1eae6;display:flex;justify-content:space-between;padding:17px 26px 22px}
@media(max-width:620px){.mkt-modal-backdrop{align-items:flex-end;padding:0}.mkt-modal{border-radius:24px 24px 0 0;max-height:94vh}.mkt-modal__head,.mkt-form-grid{padding-inline:18px}.mkt-form-grid{grid-template-columns:1fr}.span-2{grid-column:auto}.mkt-alert{margin-inline:18px}.mkt-modal__footer{padding-inline:18px}.lead-summary{grid-template-columns:42px minmax(0,1fr)}.lead-summary em{display:none}}
</style>
