<template>
  <Teleport to="body">
    <div class="drawer-backdrop" role="presentation" @click.self="requestClose">
      <aside ref="drawerRef" class="lead-drawer" role="dialog" aria-modal="true" :aria-label="lead ? `Informe ${lead.folio}` : 'Detalle de informe'" tabindex="-1">
        <header class="drawer-head">
          <div class="drawer-identity">
            <span v-if="lead" class="drawer-mascot" :data-theme="leadTheme"><img :src="leadAmbassador.src" alt="" /></span>
            <div><p class="mkt-eyebrow">{{ lead?.id === 0 ? 'Registro histórico' : `Expediente ${folio}` }}</p><h2>{{ lead?.studentName || 'Cargando informe…' }}</h2><span v-if="lead" class="mkt-stage-chip" :data-stage="lead.stage">{{ lead.stage }}</span></div>
          </div>
          <button class="drawer-close" type="button" aria-label="Cerrar" @click="requestClose"><FamilyPersonasIcon name="close" /></button>
        </header>

        <div v-if="loading" class="drawer-state"><HuskyPassLoader label="Informe" contained /></div>
        <div v-else-if="loadError" class="drawer-state"><p class="mkt-alert">{{ loadError }}</p><button class="mkt-btn" type="button" @click="load">Reintentar</button></div>

        <template v-else-if="lead">
          <section v-if="lead.id === 0" class="historical-record">
            <span><FamilyPersonasIcon name="history" /></span><div><strong>Seguimiento histórico recuperado</strong><p>Completa la ficha para añadir contactos, plantel y estudiantes sin perder el historial.</p></div><button class="mkt-btn soft" type="button" @click="editOpen = true">Completar ficha</button>
          </section>

          <section class="contact-actions" aria-label="Acciones de contacto">
            <a v-if="lead.phone" :href="mktWhatsAppHref(lead.phone)" target="_blank" rel="noopener"><span class="action-icon whatsapp"><FamilyPersonasIcon name="message" /></span><strong>WhatsApp</strong><small>{{ lead.phone }}</small></a>
            <a v-if="lead.phone" :href="`tel:${lead.phone}`"><span class="action-icon phone"><FamilyPersonasIcon name="phone" /></span><strong>Llamar</strong><small>{{ lead.phone }}</small></a>
            <a v-if="lead.email" :href="`mailto:${lead.email}`"><span class="action-icon mail"><FamilyPersonasIcon name="mail" /></span><strong>Correo</strong><small>{{ lead.email }}</small></a>
            <button class="edit-record-action" type="button" @click="editOpen = true"><span class="action-icon edit"><FamilyPersonasIcon name="edit" /></span><strong>{{ lead.id === 0 ? 'Completar' : 'Editar ficha' }}</strong><small>Datos familiares</small></button>
          </section>

          <section class="drawer-section next-action-section">
            <div class="drawer-section__head"><div><p class="mkt-eyebrow">Siguiente movimiento</p><h3>Registrar seguimiento</h3></div><span class="attention-pill" :data-tone="attention.tone">{{ attention.label }}</span></div>
            <form class="follow-form" @submit.prevent="saveFollowUp">
              <label class="mkt-field"><span>Resultado y siguiente acuerdo</span><textarea v-model="followForm.note" class="mkt-textarea" required maxlength="6000" placeholder="Conversación, acuerdo y próxima acción…" /></label>
              <div class="stage-picker" role="radiogroup" aria-label="Etapa del informe">
                <button v-for="stage in availableStages" :key="stage" type="button" :class="{ active: followForm.stage === stage }" :data-stage="stage" @click="followForm.stage = stage"><i />{{ stage }}</button>
              </div>
              <div class="follow-actions"><span v-if="followDirty">Borrador sin guardar</span><span v-else>La etapa actual es {{ lead.stage }}</span><button class="mkt-btn primary" type="submit" :disabled="saving || !followForm.note.trim()"><FamilyPersonasIcon name="send" />{{ saving ? 'Guardando…' : 'Guardar seguimiento' }}</button></div>
              <p v-if="saveError" class="mkt-alert">{{ saveError }}</p>
            </form>
          </section>

          <section class="drawer-section family-section">
            <div class="drawer-section__head"><div><p class="mkt-eyebrow">Familia</p><h3>Contactos e interés</h3></div><button class="section-edit" type="button" @click="editOpen = true"><FamilyPersonasIcon name="edit" />Editar</button></div>
            <div class="family-meta"><span><FamilyPersonasIcon name="school" /><b>{{ mktPlantelDisplay(lead.plantel, lead.level) }}</b></span><span><FamilyPersonasIcon name="announcement" /><b>{{ mktChannelLabel(lead.channel) }}</b></span><span><FamilyPersonasIcon name="calendar" /><b>{{ mktRelativeDate(lead.createdAt) }}</b></span></div>
            <div class="contacts-grid">
              <article v-for="contact in visibleContacts" :key="contact.label">
                <span><FamilyPersonasIcon name="person" /></span><div><small>{{ contact.label }}</small><strong>{{ contact.name }}</strong><a v-if="contact.phone" :href="`tel:${contact.phone}`">{{ contact.phone }}</a><a v-if="contact.email" :href="`mailto:${contact.email}`">{{ contact.email }}</a></div>
              </article>
            </div>
            <div class="student-list">
              <article v-for="student in studentsForDisplay" :key="student.id || student.fullName">
                <span class="student-mascot" :data-theme="mktPlantelLevel(lead.plantel, student.level)"><img :src="MKT_AMBASSADORS[mktPlantelLevel(lead.plantel, student.level)].src" alt="" /></span>
                <div><strong>{{ student.fullName }}</strong><small>{{ student.level || 'Nivel pendiente' }}<template v-if="student.grade"> · {{ student.grade }}</template></small></div>
                <span v-if="student.enrolled" class="student-enrolled"><FamilyPersonasIcon name="check" />Inscrito</span>
              </article>
            </div>
          </section>

          <section class="drawer-section timeline-section">
            <div class="drawer-section__head"><div><p class="mkt-eyebrow">Historial</p><h3>{{ lead.followUps.length }} seguimientos</h3></div></div>
            <div v-if="lead.followUps.length" class="timeline">
              <article v-for="item in lead.followUps" :key="item.id" :data-pending="item.pending">
                <i /><div class="timeline-meta"><span class="mkt-stage-chip" :data-stage="item.stage">{{ item.pending ? 'Procesando' : item.stage }}</span><time>{{ mktRelativeDate(item.createdAt, true) }}</time></div><p>{{ item.note }}</p>
              </article>
            </div>
            <MktEmptyState v-else title="Aún no hay seguimiento" description="Registra la primera conversación para iniciar el historial." icon="history" ambassador="primaria" tone="blue" />
          </section>
        </template>

        <Transition name="guard-fade">
          <div v-if="closePrompt" class="drawer-close-guard" role="presentation" @click.self="cancelClosePrompt"><section role="alertdialog" aria-modal="true"><span><FamilyPersonasIcon name="alert" /></span><div><p class="mkt-eyebrow">Seguimiento sin guardar</p><h3>¿Cerrar este expediente?</h3><p>El texto y la etapa seleccionada se perderán.</p></div><footer><button class="mkt-btn primary" type="button" @click="cancelClosePrompt">Seguir editando</button><button class="mkt-btn" type="button" @click="discardAndClose">Descartar</button></footer></section></div>
        </Transition>
      </aside>
    </div>
  </Teleport>

  <MktLeadEditorModal v-if="lead && editOpen" :lead="lead" :planteles="planteles" :channels="channels" @close="editOpen = false" @saved="handleSaved" />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { MKT_STAGES, type MktLeadDetail, type MktStage, type MktStudentInterest } from '~/types/mkt'
import { onBeforeRouteLeave } from 'vue-router'
import { useDraftState } from '~/composables/useDraftState'
import { MKT_AMBASSADORS, mktAmbassadorForLead, mktChannelLabel, mktLeadAttention, mktPlantelDisplay, mktPlantelLevel, mktRelativeDate, mktWhatsAppHref } from '~/utils/mkt'
import MktLeadEditorModal from '~/components/mkt/MktLeadEditorModal.vue'

const props = withDefaults(defineProps<{ folio: string; planteles?: string[]; channels?: string[] }>(), { planteles: () => [], channels: () => [] })
const emit = defineEmits<{ close: []; updated: [lead: MktLeadDetail] }>()
const drawerRef = ref<HTMLElement | null>(null)
const lead = ref<MktLeadDetail | null>(null)
const loading = ref(false)
const loadError = ref('')
const saving = ref(false)
const saveError = ref('')
const editOpen = ref(false)
const closePrompt = ref(false)
const stages = [...MKT_STAGES]
const availableStages = computed<MktStage[]>(() => lead.value?.stage === 'Inscrito' ? ['Inscrito'] : stages)
const followForm = reactive<{ note: string; stage: MktStage }>({ note: '', stage: 'Leads Entrantes' })
const { isDirty: followDirty, resetDraft } = useDraftState(() => followForm)
let navigationResolver: ((allow: boolean) => void) | null = null
const leadAmbassador = computed(() => lead.value ? mktAmbassadorForLead(lead.value) : MKT_AMBASSADORS.preescolar)
const leadTheme = computed(() => lead.value ? mktPlantelLevel(lead.value.plantel, lead.value.level) : 'preescolar')
const attention = computed(() => lead.value ? mktLeadAttention(lead.value) : { label: '', tone: 'neutral' })
const visibleContacts = computed(() => {
  if (!lead.value) return []
  return [
    { label: 'Madre o tutora', ...lead.value.mother },
    { label: 'Padre o tutor', ...lead.value.father }
  ].filter((contact) => contact.name || contact.phone || contact.email)
})
const studentsForDisplay = computed<MktStudentInterest[]>(() => {
  if (!lead.value) return []
  if (lead.value.students.length) return lead.value.students
  return [{ id: 0, fullName: lead.value.studentName, firstName: '', paternalSurname: '', maternalSurname: '', level: lead.value.level, grade: lead.value.grade, birthDate: null, enrolled: lead.value.enrolled }]
})

watch(() => props.folio, load, { immediate: true })

async function load() {
  if (!props.folio) return
  loading.value = true; loadError.value = ''
  try {
    lead.value = await $fetch<MktLeadDetail>(`/api/mkt/leads/${encodeURIComponent(props.folio)}`)
    followForm.note = ''; followForm.stage = lead.value.stage; resetDraft(followForm)
  } catch (caught: any) { loadError.value = caught?.data?.statusMessage || caught?.statusMessage || 'No fue posible abrir el informe.' }
  finally { loading.value = false }
}

async function saveFollowUp() {
  if (!lead.value || !followForm.note.trim()) return
  saving.value = true; saveError.value = ''
  const snapshot = JSON.parse(JSON.stringify(lead.value)) as MktLeadDetail
  const tempId = -Date.now()
  const note = followForm.note.trim()
  const stage = followForm.stage
  lead.value.followUps.unshift({ id: tempId, folio: lead.value.folio, note, stage, createdAt: new Date().toISOString(), pending: true })
  lead.value.stage = stage; lead.value.lastFollowUp = note; lead.value.lastFollowUpAt = new Date().toISOString(); lead.value.followUpCount += 1
  followForm.note = ''; resetDraft(followForm)
  try {
    const updated = await $fetch<MktLeadDetail>(`/api/mkt/leads/${encodeURIComponent(props.folio)}/follow-ups`, { method: 'POST', body: { note, stage } })
    lead.value = updated; followForm.stage = updated.stage; resetDraft(followForm); emit('updated', updated)
  } catch (caught: any) {
    lead.value = snapshot; followForm.note = note; followForm.stage = stage
    saveError.value = caught?.data?.statusMessage || caught?.statusMessage || 'No fue posible guardar el seguimiento.'
  } finally { saving.value = false }
}

function finishNavigation(allow: boolean) {
  const resolve = navigationResolver
  navigationResolver = null
  if (resolve) resolve(allow)
}
function requestClose() { if (followDirty.value) closePrompt.value = true; else emit('close') }
function cancelClosePrompt() { closePrompt.value = false; if (navigationResolver) finishNavigation(false) }
function discardAndClose() {
  closePrompt.value = false
  if (navigationResolver) { finishNavigation(true); return }
  emit('close')
}
function handleSaved(updated: MktLeadDetail) { lead.value = updated; editOpen.value = false; followForm.stage = updated.stage; resetDraft(followForm); emit('updated', updated) }
function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || editOpen.value) return
  event.preventDefault()
  if (closePrompt.value) cancelClosePrompt()
  else requestClose()
}
function onBeforeUnload(event: BeforeUnloadEvent) { if (!followDirty.value) return; event.preventDefault(); event.returnValue = '' }
onBeforeRouteLeave(() => {
  if (!followDirty.value) return true
  closePrompt.value = true
  return new Promise<boolean>((resolve) => { navigationResolver = resolve })
})
onMounted(() => { document.addEventListener('keydown', onKeydown); window.addEventListener('beforeunload', onBeforeUnload); document.body.classList.add('mkt-drawer-open'); drawerRef.value?.focus() })
onBeforeUnmount(() => { document.removeEventListener('keydown', onKeydown); window.removeEventListener('beforeunload', onBeforeUnload); if (navigationResolver) finishNavigation(false); document.body.classList.remove('mkt-drawer-open') })
</script>

<style scoped>
.drawer-backdrop{backdrop-filter:blur(8px);background:rgba(7,29,35,.5);inset:0;position:fixed;z-index:850}.lead-drawer{background:#f3f8f5;box-shadow:-28px 0 80px rgba(6,38,42,.24);height:100%;margin-left:auto;max-width:680px;overflow-y:auto;position:relative;width:min(100%,680px)}.lead-drawer:focus{outline:none}.drawer-head{align-items:start;background:radial-gradient(circle at 10% 100%,rgba(143,200,73,.18),transparent 15rem),radial-gradient(circle at 92% 0%,rgba(79,139,201,.16),transparent 14rem),#fff;border-bottom:1px solid #dce9e3;display:grid;gap:18px;grid-template-columns:minmax(0,1fr) 42px;padding:20px 22px;position:sticky;top:0;z-index:3}.drawer-identity{align-items:center;display:flex;gap:14px}.drawer-mascot{align-items:end;background:#e7f5ed;border-radius:18px;display:flex;height:76px;justify-content:center;overflow:hidden;width:66px}.drawer-mascot[data-theme='preescolar']{background:#fff2c8}.drawer-mascot[data-theme='primaria']{background:#e6f1fb}.drawer-mascot[data-theme='secundaria']{background:#ffe5e0}.drawer-mascot img{height:73px;object-fit:contain;object-position:center bottom;width:100%}.drawer-head h2{font-family:var(--font-title);font-size:clamp(1.5rem,3vw,2.2rem);letter-spacing:-.03em;margin:0 0 8px}.drawer-close{align-items:center;background:#f0f5f2;border:1px solid #dce8e3;border-radius:13px;color:#52696c;cursor:pointer;display:flex;height:42px;justify-content:center;width:42px}.drawer-state{display:grid;gap:12px;min-height:340px;padding:30px;place-items:center}
.historical-record{align-items:center;background:#fff8df;border:1px solid #eddc9d;border-radius:18px;display:grid;gap:12px;grid-template-columns:42px minmax(0,1fr) auto;margin:16px 18px 0;padding:13px}.historical-record>span{align-items:center;background:#f8eec8;border-radius:12px;color:#886514;display:flex;height:42px;justify-content:center;width:42px}.historical-record strong{font-size:.76rem}.historical-record p{font-size:.66rem;margin:3px 0 0}
.contact-actions{display:grid;gap:9px;grid-template-columns:repeat(4,minmax(0,1fr));padding:16px 18px 0}.contact-actions>a,.contact-actions>button{align-items:center;background:#fff;border:1px solid #dfe9e5;border-radius:17px;color:#29474c;cursor:pointer;display:grid;font:inherit;gap:3px;justify-items:start;min-width:0;padding:11px;text-align:left}.contact-actions strong,.contact-actions small{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.contact-actions strong{font-size:.69rem}.contact-actions small{color:#829092;font-size:.58rem}.action-icon{align-items:center;background:#edf7f2;border-radius:11px;color:var(--mkt-teal);display:flex;height:34px;justify-content:center;margin-bottom:4px;width:34px}.action-icon.whatsapp{background:#e7f8e5;color:#3f963d}.action-icon.phone{background:#e8f2fb;color:#377cb7}.action-icon.mail{background:#fff3d7;color:#926b12}.action-icon.edit{background:#fff0ec;color:#bd4f45}
.drawer-section{background:#fff;border:1px solid #dfe9e5;border-radius:22px;margin:14px 18px;padding:17px}.drawer-section__head{align-items:center;border-bottom:1px solid #e7eeeb;display:flex;gap:12px;justify-content:space-between;margin-bottom:14px;padding-bottom:12px}.drawer-section h3{font-family:var(--font-title);font-size:1.2rem;margin:0}.attention-pill{border-radius:99px;font-size:.62rem;font-weight:900;padding:6px 9px}.attention-pill[data-tone='urgent']{background:#fff0ed;color:#ad443a}.attention-pill[data-tone='warning']{background:#fff7dc;color:#80600f}.attention-pill[data-tone='active']{background:#e8f2fb;color:#3375ad}.attention-pill[data-tone='success']{background:#e9f7e3;color:#4d8428}.attention-pill[data-tone='fresh']{background:#e7f6ef;color:#0b6b61}.attention-pill[data-tone='neutral']{background:#eef3f1;color:#607174}.follow-form{display:grid;gap:12px}.follow-form .mkt-textarea{min-height:108px}.stage-picker{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px}.stage-picker button{align-items:center;background:#f4f7f5;border:1px solid #e0e8e4;border-radius:99px;color:#68787a;cursor:pointer;display:inline-flex;flex:0 0 auto;font:inherit;font-size:.61rem;font-weight:800;gap:6px;min-height:34px;padding:0 10px}.stage-picker button i{background:#8fc849;border-radius:50%;height:7px;width:7px}.stage-picker button[data-stage='Primer contacto'] i{background:#4f8bc9}.stage-picker button[data-stage='Discusión'] i{background:#f6c745}.stage-picker button[data-stage='Negociación'] i{background:#ec6b5d}.stage-picker button[data-stage='Inscrito'] i{background:#0b6b61}.stage-picker button.active{background:#fff;border-color:#a8cfc1;box-shadow:0 5px 14px rgba(14,55,61,.08);color:#21484a}.follow-actions{align-items:center;display:flex;gap:12px;justify-content:space-between}.follow-actions>span{color:#7d8b8d;font-size:.62rem}
.section-edit{align-items:center;background:transparent;border:0;color:var(--mkt-teal);cursor:pointer;display:flex;font:inherit;font-size:.66rem;font-weight:900;gap:5px}.family-meta{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:13px}.family-meta span{align-items:center;background:#f3f7f5;border-radius:10px;color:#718184;display:inline-flex;font-size:.61rem;gap:6px;padding:7px 8px}.family-meta b{font-weight:800}.contacts-grid{display:grid;gap:9px;grid-template-columns:repeat(2,minmax(0,1fr))}.contacts-grid article{align-items:start;background:#f8fbf9;border:1px solid #e5ece9;border-radius:15px;display:grid;gap:9px;grid-template-columns:34px minmax(0,1fr);padding:10px}.contacts-grid article>span{align-items:center;background:#e8f5ef;border-radius:10px;color:var(--mkt-teal);display:flex;height:34px;justify-content:center;width:34px}.contacts-grid small,.contacts-grid strong,.contacts-grid a{display:block}.contacts-grid small{color:#879496;font-size:.57rem}.contacts-grid strong{font-size:.68rem;margin:2px 0 4px}.contacts-grid a{color:#4e7477;font-size:.6rem;margin-top:2px;overflow:hidden;text-overflow:ellipsis}.student-list{border-top:1px solid #e7eeeb;display:grid;gap:8px;margin-top:13px;padding-top:13px}.student-list article{align-items:center;background:#f8fbf9;border-radius:14px;display:grid;gap:10px;grid-template-columns:48px minmax(0,1fr) auto;padding:8px 10px}.student-mascot{align-items:end;background:#e8f5ed;border-radius:12px;display:flex;height:48px;justify-content:center;overflow:hidden}.student-mascot[data-theme='preescolar']{background:#fff3ca}.student-mascot[data-theme='primaria']{background:#e7f2fc}.student-mascot[data-theme='secundaria']{background:#ffe8e3}.student-mascot img{height:46px;object-fit:contain}.student-list strong,.student-list small{display:block}.student-list strong{font-size:.7rem}.student-list small{color:#819092;font-size:.6rem;margin-top:2px}.student-enrolled{align-items:center;background:#eaf7e4;border-radius:99px;color:#4b8426;display:flex;font-size:.58rem;font-weight:900;gap:4px;padding:5px 8px}
.timeline{display:grid}.timeline article{border-left:2px solid #dce9e3;margin-left:8px;padding:0 0 18px 20px;position:relative}.timeline article:last-child{padding-bottom:0}.timeline article[data-pending='true']{opacity:.7}.timeline article>i{background:#0b6b61;border:4px solid #e9f6f0;border-radius:99px;height:14px;left:-8px;position:absolute;top:4px;width:14px}.timeline-meta{align-items:center;display:flex;gap:9px;justify-content:space-between}.timeline time{color:#8b9798;font-size:.59rem}.timeline p{color:#4f6468;font-size:.7rem;line-height:1.55;margin:8px 0 0;white-space:pre-wrap}.timeline-section :deep(.mkt-empty-state){border:0;min-height:180px;padding:12px}.timeline-section :deep(.mkt-ambassadors){display:none}
.drawer-close-guard{align-items:center;background:rgba(8,31,39,.64);display:grid;inset:0;justify-items:center;padding:18px;position:absolute;z-index:10}.drawer-close-guard>section{background:#fff;border-radius:22px;box-shadow:0 24px 70px rgba(5,28,36,.28);display:grid;gap:14px;grid-template-columns:46px minmax(0,1fr);max-width:500px;padding:20px;width:100%}.drawer-close-guard>section>span{align-items:center;background:#fff0ec;border-radius:15px;color:#bd4b42;display:flex;height:46px;justify-content:center;width:46px}.drawer-close-guard h3{font-family:var(--font-title);font-size:1.35rem;margin:0}.drawer-close-guard p:not(.mkt-eyebrow){font-size:.72rem;margin:5px 0 0}.drawer-close-guard footer{display:flex;gap:8px;grid-column:1/-1;justify-content:flex-end}.guard-fade-enter-active,.guard-fade-leave-active{transition:.16s}.guard-fade-enter-from,.guard-fade-leave-to{opacity:0}
@media(max-width:640px){.lead-drawer{max-width:none}.drawer-head{padding:16px}.drawer-mascot{height:62px;width:54px}.drawer-mascot img{height:60px}.contact-actions{grid-template-columns:repeat(2,1fr);padding-inline:12px}.drawer-section{margin-inline:12px}.historical-record{grid-template-columns:38px minmax(0,1fr);margin-inline:12px}.historical-record .mkt-btn{grid-column:1/-1;width:100%}.contacts-grid{grid-template-columns:1fr}.follow-actions{align-items:stretch;flex-direction:column}.follow-actions .mkt-btn{width:100%}.drawer-close-guard footer{flex-direction:column}.drawer-close-guard .mkt-btn{width:100%}}
</style>
