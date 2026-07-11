<template>
  <Teleport to="body">
    <div class="drawer-backdrop" role="presentation" @click.self="emit('close')">
      <aside class="lead-drawer" role="dialog" aria-modal="true" :aria-label="lead ? `Informe ${lead.folio}` : 'Detalle de informe'">
        <header class="drawer-head">
          <div>
            <p class="mkt-eyebrow">Expediente {{ folio }}</p>
            <h2>{{ lead?.studentName || 'Cargando informe…' }}</h2>
            <span v-if="lead" class="mkt-stage-chip" :data-stage="lead.stage">{{ lead.stage }}</span>
          </div>
          <button class="drawer-close" type="button" aria-label="Cerrar" @click="emit('close')">×</button>
        </header>

        <div v-if="loading" class="drawer-state"><HuskyPassLoader label="Informe" contained /></div>
        <div v-else-if="loadError" class="drawer-state"><p class="mkt-alert">{{ loadError }}</p><button class="mkt-btn" type="button" @click="load">Reintentar</button></div>

        <template v-else-if="lead">
          <p v-if="lead.id === 0" class="legacy-notice">
            Este folio conserva seguimientos, pero no tiene ficha de contacto en <code>informes_mkt</code>. Puedes continuar su historial sin perder la referencia legacy.
          </p>
          <section class="contact-strip">
            <a v-if="lead.phone" :href="`tel:${lead.phone}`"><FamilyPersonasIcon name="entry" /><span><small>Teléfono</small><strong>{{ lead.phone }}</strong></span></a>
            <a v-if="lead.email" :href="`mailto:${lead.email}`"><FamilyPersonasIcon name="send" /><span><small>Correo</small><strong>{{ lead.email }}</strong></span></a>
            <div><FamilyPersonasIcon name="school" /><span><small>Plantel</small><strong>{{ lead.plantel || 'Pendiente' }}</strong></span></div>
          </section>

          <section class="drawer-section">
            <div class="drawer-section__head"><div><p class="mkt-eyebrow">Siguiente paso</p><h3>Registrar seguimiento</h3></div></div>
            <form class="follow-form" @submit.prevent="saveFollowUp">
              <label class="mkt-field">
                <span>Resultado de la conversación</span>
                <textarea v-model="followForm.note" class="mkt-textarea" required maxlength="6000" placeholder="Qué se conversó, acuerdo y siguiente acción…" />
              </label>
              <div class="follow-actions">
                <label class="mkt-field"><span>Mover a etapa</span><select v-model="followForm.stage" class="mkt-select"><option v-for="stage in stages" :key="stage" :value="stage">{{ stage }}</option></select></label>
                <button class="mkt-btn primary" type="submit" :disabled="saving"><FamilyPersonasIcon name="send" />{{ saving ? 'Guardando…' : 'Guardar seguimiento' }}</button>
              </div>
              <p v-if="saveError" class="mkt-alert">{{ saveError }}</p>
            </form>
          </section>

          <section class="drawer-section">
            <div class="drawer-section__head"><div><p class="mkt-eyebrow">Datos clave</p><h3>Familia e interés</h3></div></div>
            <dl class="detail-grid">
              <div><dt>Contacto</dt><dd>{{ lead.contactName }}</dd></div>
              <div><dt>Vía de informe</dt><dd>{{ channelLabel(lead.channel) }}</dd></div>
              <div><dt>Campus</dt><dd>{{ lead.campus || 'No registrado' }}</dd></div>
              <div><dt>Fecha de entrada</dt><dd>{{ formatDate(lead.createdAt, true) }}</dd></div>
              <div><dt>Nivel</dt><dd>{{ lead.level || 'Pendiente' }}</dd></div>
              <div><dt>Grado</dt><dd>{{ lead.grade || 'Pendiente' }}</dd></div>
            </dl>
            <div v-if="lead.students.length > 1" class="student-list">
              <strong>Estudiantes relacionados</strong>
              <span v-for="student in lead.students" :key="student.id">{{ student.fullName }} · {{ student.level }} {{ student.grade }}</span>
            </div>
          </section>

          <section class="drawer-section timeline-section">
            <div class="drawer-section__head"><div><p class="mkt-eyebrow">Historial</p><h3>{{ lead.followUps.length }} seguimientos</h3></div></div>
            <div v-if="lead.followUps.length" class="timeline">
              <article v-for="item in lead.followUps" :key="item.id">
                <i />
                <div class="timeline-meta"><span class="mkt-stage-chip" :data-stage="item.stage">{{ item.stage }}</span><time>{{ formatDate(item.createdAt, false) }}</time></div>
                <p>{{ item.note }}</p>
              </article>
            </div>
            <div v-else class="empty-timeline"><FamilyPersonasIcon name="history" /><p>Aún no hay seguimiento. Registra el primer contacto arriba.</p></div>
          </section>
        </template>
      </aside>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { MKT_STAGES, type MktLeadDetail, type MktStage } from '~/types/mkt'

const props = defineProps<{ folio: string }>()
const emit = defineEmits<{ close: []; updated: [lead: MktLeadDetail] }>()
const lead = ref<MktLeadDetail | null>(null)
const loading = ref(false)
const loadError = ref('')
const saving = ref(false)
const saveError = ref('')
const stages = [...MKT_STAGES]
const followForm = reactive<{ note: string; stage: MktStage }>({ note: '', stage: 'Leads Entrantes' })

watch(() => props.folio, load, { immediate: true })

async function load() {
  if (!props.folio) return
  loading.value = true
  loadError.value = ''
  try {
    lead.value = await $fetch<MktLeadDetail>(`/api/mkt/leads/${encodeURIComponent(props.folio)}`)
    followForm.stage = lead.value.stage
  } catch (caught: any) {
    loadError.value = caught?.data?.statusMessage || caught?.statusMessage || 'No fue posible abrir el informe.'
  } finally {
    loading.value = false
  }
}

async function saveFollowUp() {
  if (!followForm.note.trim()) return
  saving.value = true
  saveError.value = ''
  try {
    const updated = await $fetch<MktLeadDetail>(`/api/mkt/leads/${encodeURIComponent(props.folio)}/follow-ups`, { method: 'POST', body: followForm })
    lead.value = updated
    followForm.note = ''
    followForm.stage = updated.stage
    emit('updated', updated)
  } catch (caught: any) {
    saveError.value = caught?.data?.statusMessage || caught?.statusMessage || 'No fue posible guardar el seguimiento.'
  } finally {
    saving.value = false
  }
}

function formatDate(value: string | null, short: boolean) {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 10)
  return new Intl.DateTimeFormat('es-MX', short
    ? { day: 'numeric', month: 'short', year: 'numeric' }
    : { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }
  ).format(date)
}

function channelLabel(value: string) {
  if (value.toLocaleLowerCase('es-MX') === 'whatsapp') return 'WhatsApp'
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Sin especificar'
}
</script>

<style scoped>
.drawer-backdrop{background:rgba(7,29,35,.45);inset:0;position:fixed;z-index:75}.lead-drawer{background:#f8fbf9;border-left:1px solid rgba(255,255,255,.75);box-shadow:-25px 0 70px rgba(6,38,42,.2);height:100%;margin-left:auto;max-width:620px;overflow-y:auto;width:min(100%,620px)}
.drawer-head{align-items:start;background:linear-gradient(135deg,#fff,#edf8f3);border-bottom:1px solid #dce9e3;display:grid;gap:18px;grid-template-columns:minmax(0,1fr) 40px;padding:25px 26px;position:sticky;top:0;z-index:2}.drawer-head h2{color:#123038;font-family:var(--font-title);font-size:clamp(1.55rem,3vw,2.15rem);margin:0 0 9px}.drawer-close{background:#fff;border:1px solid #dce8e3;border-radius:12px;color:#637477;cursor:pointer;font-size:1.6rem;height:40px;width:40px}.drawer-state{display:grid;gap:12px;min-height:300px;padding:30px;place-items:center}
.legacy-notice{background:#fff8e5;border:1px solid #f0dfab;border-radius:14px;color:#715d29;font-size:.69rem;line-height:1.5;margin:16px 20px 0;padding:11px 13px}.legacy-notice code{background:rgba(255,255,255,.72);border-radius:5px;padding:1px 4px}
.contact-strip{display:grid;gap:8px;grid-template-columns:repeat(3,minmax(0,1fr));padding:18px 20px 0}.contact-strip>a,.contact-strip>div{align-items:center;background:#fff;border:1px solid #dfe9e5;border-radius:15px;color:#0b6b61;display:flex;gap:9px;min-width:0;padding:10px}.contact-strip span{min-width:0}.contact-strip small,.contact-strip strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.contact-strip small{color:#839092;font-size:.6rem}.contact-strip strong{color:#284349;font-size:.67rem;margin-top:2px}
.drawer-section{background:#fff;border:1px solid #dfe9e5;border-radius:20px;margin:14px 20px;padding:18px}.drawer-section__head{align-items:center;border-bottom:1px solid #e7eeeb;display:flex;justify-content:space-between;margin-bottom:14px;padding-bottom:12px}.drawer-section h3{color:#123038;font-family:var(--font-title);font-size:1.16rem;margin:0}.follow-form{display:grid;gap:12px}.follow-actions{align-items:end;display:grid;gap:10px;grid-template-columns:minmax(170px,1fr) auto}.follow-actions .mkt-btn{min-height:44px}.follow-form .mkt-textarea{min-height:96px}
.detail-grid{display:grid;gap:13px;grid-template-columns:repeat(2,minmax(0,1fr));margin:0}.detail-grid div{background:#f7faf8;border-radius:13px;padding:10px}.detail-grid dt{color:#879294;font-size:.62rem;margin-bottom:4px}.detail-grid dd{color:#2c474d;font-size:.74rem;margin:0}.student-list{border-top:1px solid #e7eeeb;display:grid;gap:5px;margin-top:13px;padding-top:12px}.student-list strong{font-size:.72rem}.student-list span{color:#748285;font-size:.68rem}
.timeline{display:grid}.timeline article{border-left:2px solid #dce9e3;margin-left:8px;padding:0 0 18px 20px;position:relative}.timeline article:last-child{padding-bottom:0}.timeline i{background:#0b6b61;border:4px solid #e9f6f0;border-radius:99px;height:13px;left:-7px;position:absolute;top:3px;width:13px}.timeline-meta{align-items:center;display:flex;gap:8px;justify-content:space-between}.timeline time{color:#8a9697;font-size:.62rem}.timeline p{color:#53676b;font-size:.74rem;line-height:1.55;margin:8px 0 0;white-space:pre-line}.empty-timeline{align-items:center;color:#789092;display:grid;gap:8px;justify-items:center;padding:22px;text-align:center}.empty-timeline p{font-size:.74rem;margin:0}
@media(max-width:580px){.drawer-head{padding:18px}.contact-strip{grid-template-columns:1fr;padding:13px 14px 0}.drawer-section{margin:12px 14px;padding:15px}.follow-actions{grid-template-columns:1fr}.detail-grid{grid-template-columns:1fr}}
</style>
