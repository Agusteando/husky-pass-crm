<template>
  <section class="mkt-page journal-page" data-product-area="mkt" data-product-screen="bitacora">
    <header class="journal-hero mkt-panel">
      <div class="journal-hero__copy">
        <p class="mkt-eyebrow">Memoria del equipo</p>
        <h1>Bitácora de jornada</h1>
        <p>{{ selectedDateLabel }}</p>
        <div class="journal-state" :data-state="journalState.tone"><span><FamilyPersonasIcon :name="journalState.icon" /></span><strong>{{ journalState.label }}</strong></div>
      </div>
      <div class="journal-hero__visual">
        <MktAmbassadorCluster compact />
        <label class="date-control"><span>Fecha</span><input :value="selectedDate" type="date" :max="today" @change="handleDateInput" /></label>
      </div>
    </header>

    <section v-if="pending" class="mkt-panel mkt-empty"><HuskyPassLoader label="Bitácora" contained /></section>
    <section v-else-if="loadError" class="mkt-panel mkt-empty"><FamilyPersonasIcon name="alert" /><h2>No pudimos abrir la bitácora</h2><p>La información guardada no cambió.</p><button class="mkt-btn" type="button" @click="() => refresh()">Reintentar</button></section>

    <template v-else>
      <section class="journal-progress" :data-complete="completedSections === 4">
        <div><span><i :style="{ width: `${completionPercent}%` }" /></span><small>{{ completionLabel }}</small></div>
        <em v-if="isDirty">Borrador modificado</em><em v-else-if="savedMessage">{{ savedMessage }}</em><em v-else>{{ journal?.entry.completed ? 'Guardada' : 'Sin contenido' }}</em>
      </section>

      <section class="journal-layout">
        <form class="journal-editor" @submit.prevent="save">
          <article class="journal-card mkt-panel achievements">
            <header><span>01</span><div><p class="mkt-eyebrow">Resultados</p><h2>Logros</h2></div><FamilyPersonasIcon name="check" /></header>
            <textarea v-model="form.achievements" class="journal-textarea" maxlength="20000" placeholder="Resultados y avances concretos" />
            <footer><span>{{ form.achievements.length.toLocaleString('es-MX') }}</span><i :class="{ filled: form.achievements.trim() }" /></footer>
          </article>

          <article class="journal-card mkt-panel activities">
            <header><span>02</span><div><p class="mkt-eyebrow">Operación</p><h2>Actividades</h2></div><FamilyPersonasIcon name="clipboard" /></header>
            <textarea v-model="form.activities" class="journal-textarea" maxlength="20000" placeholder="Llamadas, recorridos, coordinación y atención" />
            <footer><span>{{ form.activities.length.toLocaleString('es-MX') }}</span><i :class="{ filled: form.activities.trim() }" /></footer>
          </article>

          <article class="journal-card mkt-panel content-card">
            <header><span>03</span><div><p class="mkt-eyebrow">Difusión</p><h2>Contenido</h2></div><FamilyPersonasIcon name="announcement" /></header>
            <textarea v-model="form.content" class="journal-textarea" maxlength="20000" placeholder="Campañas, publicaciones y eventos" />
            <footer><span>{{ form.content.length.toLocaleString('es-MX') }}</span><i :class="{ filled: form.content.trim() }" /></footer>
          </article>

          <article class="journal-card mkt-panel comments-card">
            <header><span>04</span><div><p class="mkt-eyebrow">Continuidad</p><h2>Pendientes</h2></div><FamilyPersonasIcon name="deadline" /></header>
            <textarea v-model="form.comments" class="journal-textarea" maxlength="20000" placeholder="Acuerdos, bloqueos y siguiente paso" />
            <footer><span>{{ form.comments.length.toLocaleString('es-MX') }}</span><i :class="{ filled: form.comments.trim() }" /></footer>
          </article>

          <p v-if="saveError" class="mkt-alert journal-error">{{ saveError }}</p>
          <div class="journal-save-bar mkt-panel">
            <div><span class="save-mark"><FamilyPersonasIcon :name="isDirty ? 'edit' : 'check'" /></span><span><strong>{{ isDirty ? 'Cambios listos para guardar' : 'Bitácora sincronizada' }}</strong><small>{{ contentLength.toLocaleString('es-MX') }} caracteres · {{ completedSections }} secciones</small></span></div>
            <button class="mkt-btn primary" type="submit" :disabled="saving || !isDirty"><FamilyPersonasIcon name="save" />{{ saving ? 'Guardando…' : isDirty ? 'Guardar bitácora' : 'Guardada' }}</button>
          </div>
        </form>

        <aside class="journal-sidebar">
          <article v-if="journal?.entry.feedback" class="feedback-card mkt-panel">
            <span><FamilyPersonasIcon name="message" /></span>
            <div><p class="mkt-eyebrow">Retroalimentación</p><h2>Comentario recibido</h2></div>
            <p>{{ journal.entry.feedback }}</p>
          </article>

          <article class="recent-journals mkt-panel">
            <div class="sidebar-head"><div><p class="mkt-eyebrow">Archivo</p><h2>Registros recientes</h2></div><FamilyPersonasIcon name="history" /></div>
            <div v-if="journal?.recent.length" class="journal-date-list">
              <button v-for="entry in journal.recent" :key="entry.uid" type="button" :class="{ active: entry.date === selectedDate }" @click="requestDate(entry.date)">
                <span class="date-tile"><strong>{{ shortDay(entry.date) }}</strong><small>{{ monthYear(entry.date) }}</small></span>
                <span class="entry-preview"><b>{{ entry.achievements || entry.activities || entry.content || 'Registro sin resumen' }}</b><small>{{ entry.completed ? 'Registro completo' : 'Borrador' }}</small></span>
                <span class="entry-state" :data-complete="entry.completed"><FamilyPersonasIcon :name="entry.completed ? 'check' : 'edit'" /></span>
              </button>
            </div>
            <MktEmptyState v-else title="Tu archivo comienza hoy" icon="history" ambassador="daycare" tone="yellow" />
          </article>

          <article class="journal-companion">
            <MktAmbassadorCluster compact theme="secundaria" :show-seal="false" />
            <div><p class="mkt-eyebrow">Continuidad institucional</p><strong>El contexto de hoy facilita las decisiones de mañana.</strong></div>
          </article>
        </aside>
      </section>
    </template>

    <MktModal v-if="guardOpen" title="Hay cambios sin guardar" eyebrow="Borrador de bitácora" description="Elige qué hacer antes de continuar." @close="cancelGuard">
      <template #icon><FamilyPersonasIcon name="alert" /></template>
      <div class="journal-guard">
        <div class="guard-summary"><span><FamilyPersonasIcon name="edit" /></span><div><strong>{{ completedSections }} secciones con contenido</strong><small>{{ contentLength.toLocaleString('es-MX') }} caracteres sin guardar</small></div></div>
        <p v-if="pendingDate">Vas a abrir {{ formatLongDate(pendingDate) }}.</p>
        <div class="guard-actions">
          <button class="mkt-btn primary" type="button" :disabled="saving" @click="saveAndContinue"><FamilyPersonasIcon name="save" />{{ saving ? 'Guardando…' : 'Guardar y continuar' }}</button>
          <button class="mkt-btn coral" type="button" :disabled="saving" @click="discardAndContinue">Descartar</button>
          <button class="mkt-btn" type="button" :disabled="saving" @click="cancelGuard">Seguir editando</button>
        </div>
      </div>
    </MktModal>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useFetch } from 'nuxt/app'
import { onBeforeRouteLeave } from 'vue-router'
import type { MktJournalResponse } from '~/types/mkt'
import { useDraftState } from '~/composables/useDraftState'

definePageMeta({ layout: 'mkt', middleware: ['admin', 'mkt'] })

type JournalForm = { achievements: string; activities: string; content: string; comments: string }
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const selectedDate = ref(today)
const query = computed(() => ({ date: selectedDate.value }))
const { data: journal, pending, error: loadError, refresh } = useFetch<MktJournalResponse>('/api/mkt/journal', { query })
const form = reactive<JournalForm>({ achievements: '', activities: '', content: '', comments: '' })
const { isDirty, resetDraft } = useDraftState(() => form)
const saving = ref(false)
const saveError = ref('')
const savedMessage = ref('')
const guardOpen = ref(false)
const pendingDate = ref('')
let navigationResolver: ((allow: boolean) => void) | null = null

watch(() => journal.value?.entry, (entry) => {
  if (!entry) return
  Object.assign(form, { achievements: entry.achievements, activities: entry.activities, content: entry.content, comments: entry.comments })
  resetDraft(form)
  savedMessage.value = ''
  saveError.value = ''
}, { immediate: true })

const values = computed(() => Object.values(form))
const contentLength = computed(() => values.value.reduce((total, value) => total + value.length, 0))
const completedSections = computed(() => values.value.filter((value) => value.trim()).length)
const completionPercent = computed(() => completedSections.value * 25)
const completionLabel = computed(() => completedSections.value === 4 ? 'Las cuatro áreas tienen contenido' : completedSections.value ? `${completedSections.value} de 4 áreas con contenido` : 'Registro vacío')
const selectedDateLabel = computed(() => formatLongDate(selectedDate.value))
const journalState = computed(() => {
  if (isDirty.value) return { label: 'Borrador en edición', icon: 'edit', tone: 'editing' }
  if (journal.value?.entry.completed) return { label: 'Registro guardado', icon: 'check', tone: 'saved' }
  return { label: 'Jornada sin registrar', icon: 'clipboard', tone: 'empty' }
})

watch(isDirty, (dirty) => { if (dirty) savedMessage.value = '' })
function handleDateInput(event: Event) {
  const input = event.target as HTMLInputElement
  const requested = input.value
  requestDate(requested)
  input.value = selectedDate.value
}
function requestDate(date: string) {
  if (!date || date === selectedDate.value) return
  if (!isDirty.value) { changeDate(date); return }
  pendingDate.value = date
  guardOpen.value = true
}
function changeDate(date: string) {
  selectedDate.value = date
  pendingDate.value = ''
  savedMessage.value = ''
  saveError.value = ''
}
async function save() {
  saving.value = true
  saveError.value = ''
  try {
    journal.value = await $fetch<MktJournalResponse>('/api/mkt/journal', { method: 'PUT', body: { date: selectedDate.value, ...form } })
    resetDraft(form)
    savedMessage.value = 'Guardada hace un momento'
    return true
  } catch (caught: any) {
    saveError.value = caught?.data?.statusMessage || caught?.statusMessage || 'No fue posible guardar la bitácora.'
    return false
  } finally {
    saving.value = false
  }
}
async function saveAndContinue() {
  if (!await save()) return
  continuePendingAction(true)
}
function discardAndContinue() { continuePendingAction(true) }
function cancelGuard() { continuePendingAction(false) }
function continuePendingAction(allow: boolean) {
  guardOpen.value = false
  if (navigationResolver) {
    const resolve = navigationResolver
    navigationResolver = null
    resolve(allow)
    return
  }
  const date = pendingDate.value
  pendingDate.value = ''
  if (allow && date) changeDate(date)
}
function onBeforeUnload(event: BeforeUnloadEvent) { if (!isDirty.value) return; event.preventDefault(); event.returnValue = '' }
if (import.meta.client) window.addEventListener('beforeunload', onBeforeUnload)
onBeforeUnmount(() => { if (import.meta.client) window.removeEventListener('beforeunload', onBeforeUnload) })
onBeforeRouteLeave(() => {
  if (!isDirty.value) return true
  guardOpen.value = true
  pendingDate.value = ''
  return new Promise<boolean>((resolve) => { navigationResolver = resolve })
})
function parseDate(value: string) { return new Date(`${value}T12:00:00`) }
function formatLongDate(value: string) { return new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(parseDate(value)) }
function shortDay(value: string) { return new Intl.DateTimeFormat('es-MX', { day: '2-digit' }).format(parseDate(value)) }
function monthYear(value: string) { return new Intl.DateTimeFormat('es-MX', { month: 'short', year: 'numeric' }).format(parseDate(value)) }
</script>

<style scoped>
.journal-hero{align-items:center;background:radial-gradient(circle at 86% 12%,rgba(78,143,208,.18),transparent 20rem),radial-gradient(circle at 65% 110%,rgba(246,199,68,.18),transparent 21rem),linear-gradient(135deg,#fff,#f2f9f6);display:grid;gap:24px;grid-template-columns:minmax(0,1fr) auto;min-height:230px;overflow:hidden;padding:clamp(24px,3.5vw,42px)}.journal-hero h1{font-size:clamp(2.3rem,4vw,3.9rem);letter-spacing:-.045em;line-height:.95}.journal-hero__copy>p:nth-of-type(2){font-size:.83rem;margin:11px 0 0;text-transform:capitalize}.journal-state{align-items:center;display:flex;gap:8px;margin-top:18px}.journal-state>span{align-items:center;background:#edf4f1;border-radius:12px;color:#63787a;display:flex;height:36px;justify-content:center;width:36px}.journal-state strong{font-size:.68rem}.journal-state[data-state='editing']>span{background:#fff5d6;color:#906913}.journal-state[data-state='saved']>span{background:#eaf7e5;color:#4f7f28}.journal-hero__visual{align-items:end;display:flex;gap:12px}.date-control{background:rgba(255,255,255,.94);border:1px solid #d9e7e1;border-radius:16px;box-shadow:0 13px 28px rgba(13,55,62,.08);display:grid;gap:4px;min-width:168px;padding:10px 12px}.date-control span{color:#7d8b8d;font-size:.58rem;font-weight:900}.date-control input{background:transparent;border:0;color:#234147;font:inherit;font-size:.7rem;outline:0}
.journal-progress{align-items:center;background:rgba(255,255,255,.9);border:1px solid var(--mkt-line);border-radius:17px;display:grid;gap:18px;grid-template-columns:minmax(0,1fr) auto;padding:11px 14px}.journal-progress>div{align-items:center;display:grid;gap:10px;grid-template-columns:minmax(120px,230px) auto}.journal-progress>div>span{background:#e7efeb;border-radius:999px;height:7px;overflow:hidden}.journal-progress i{background:linear-gradient(90deg,var(--mkt-yellow),var(--mkt-lime),var(--mkt-teal));border-radius:inherit;display:block;height:100%;transition:width .3s ease}.journal-progress small{color:#738486;font-size:.59rem}.journal-progress em{background:#fff5d6;border-radius:999px;color:#85620f;font-size:.59rem;font-style:normal;font-weight:900;padding:6px 9px}.journal-progress[data-complete='true'] em{background:#eaf7e5;color:#4f7d29}
.journal-layout{align-items:start;display:grid;gap:18px;grid-template-columns:minmax(0,1fr) minmax(285px,360px)}.journal-editor{display:grid;gap:14px;grid-template-columns:repeat(2,minmax(0,1fr))}.journal-card{display:grid;grid-template-rows:auto minmax(170px,1fr) auto;min-height:315px;overflow:hidden;padding:0}.journal-card header{align-items:center;border-bottom:1px solid #e4ece8;display:grid;gap:10px;grid-template-columns:42px minmax(0,1fr) 32px;padding:15px 17px}.journal-card header>span{align-items:center;background:#e9f7f0;border-radius:13px;color:#087167;display:flex;font-family:var(--font-title);font-size:.75rem;height:42px;justify-content:center}.journal-card header>svg{color:#82a99a}.journal-card h2{font-size:1.25rem}.journal-card .mkt-eyebrow{font-size:.55rem;margin-bottom:3px}.journal-card.activities header>span{background:#eaf4fc;color:#397db8}.journal-card.activities header>svg{color:#75a4ce}.journal-card.content-card header>span{background:#fff5d5;color:#906914}.journal-card.content-card header>svg{color:#d0a938}.journal-card.comments-card header>span{background:#fff0ec;color:#b84c42}.journal-card.comments-card header>svg{color:#dc8a80}.journal-textarea{background:transparent;border:0;color:var(--mkt-ink);font:inherit;font-size:.74rem;line-height:1.65;min-height:180px;outline:0;padding:17px;resize:vertical;width:100%}.journal-textarea::placeholder{color:#9aa5a6}.journal-textarea:focus{background:#fbfefc}.journal-card footer{align-items:center;border-top:1px solid #edf2ef;color:#91a09f;display:flex;font-size:.54rem;justify-content:space-between;padding:8px 15px}.journal-card footer i{background:#e2ebe7;border-radius:50%;height:8px;width:8px}.journal-card footer i.filled{background:#75bd43;box-shadow:0 0 0 4px rgba(117,189,67,.12)}.journal-save-bar{align-items:center;display:flex;gap:16px;grid-column:1/-1;justify-content:space-between;padding:13px}.journal-save-bar>div{align-items:center;display:flex;gap:10px}.save-mark{align-items:center;background:#edf6f2;border-radius:12px;color:var(--mkt-teal);display:flex;height:40px;justify-content:center;width:40px}.journal-save-bar strong,.journal-save-bar small{display:block}.journal-save-bar strong{font-size:.69rem}.journal-save-bar small{color:#839193;font-size:.57rem;margin-top:3px}.journal-error{grid-column:1/-1;margin:0}
.journal-sidebar{display:grid;gap:14px;position:sticky;top:98px}.feedback-card{background:linear-gradient(145deg,#fff9e5,#fff);display:grid;gap:9px;grid-template-columns:42px minmax(0,1fr);padding:17px}.feedback-card>span{align-items:center;background:#f8edc7;border-radius:13px;color:#8c6611;display:flex;height:42px;justify-content:center}.feedback-card h2{font-size:1.12rem}.feedback-card>p:last-child{color:#5d6d6f;font-size:.68rem;grid-column:1/-1;line-height:1.6;margin:4px 0 0}.recent-journals{overflow:hidden}.sidebar-head{align-items:center;border-bottom:1px solid #e2ebe7;display:flex;justify-content:space-between;padding:17px}.sidebar-head h2{font-size:1.22rem}.sidebar-head>svg{color:#82a499}.journal-date-list{display:grid}.journal-date-list button{align-items:center;background:#fff;border:0;border-bottom:1px solid #e9efec;color:#314b50;cursor:pointer;display:grid;font:inherit;gap:10px;grid-template-columns:44px minmax(0,1fr) 30px;padding:11px 13px;text-align:left}.journal-date-list button:last-child{border-bottom:0}.journal-date-list button:hover,.journal-date-list button.active{background:#f1f8f4}.date-tile{align-items:center;background:#edf4f1;border-radius:12px;display:flex;flex-direction:column;height:44px;justify-content:center}.date-tile strong,.date-tile small,.entry-preview b,.entry-preview small{display:block}.date-tile strong{font-family:var(--font-title);font-size:1rem}.date-tile small{color:#82908f;font-size:.5rem;text-transform:uppercase}.entry-preview{min-width:0}.entry-preview b{font-size:.62rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.entry-preview small{color:#728486;font-size:.53rem;margin-top:3px}.entry-state{align-items:center;background:#f0f5f3;border-radius:10px;color:#80918f;display:flex;height:30px;justify-content:center}.entry-state[data-complete='true']{background:#eaf7e5;color:#56822e}.journal-companion{align-items:center;background:linear-gradient(140deg,#0a625a,#0b4d49);border-radius:22px;box-shadow:0 20px 42px rgba(7,75,71,.18);color:#fff;display:grid;gap:3px;grid-template-columns:120px minmax(0,1fr);overflow:hidden;padding:10px 16px 0 0}.journal-companion :deep(.mkt-ambassadors){margin-left:-3px}.journal-companion .mkt-eyebrow{color:#b8e4d8}.journal-companion strong{font-family:var(--font-title);font-size:.83rem;line-height:1.35}.recent-journals :deep(.mkt-empty-state){border:0;border-radius:0;grid-template-columns:1fr;min-height:260px;padding:18px;text-align:center}.recent-journals :deep(.mkt-empty-state>div:last-child){display:grid;justify-items:center}.recent-journals :deep(.mkt-empty-state p:not(.mkt-eyebrow)){display:none}
.journal-guard{display:grid;gap:18px;padding:20px}.guard-summary{align-items:center;background:#f4f8f6;border:1px solid #e0eae5;border-radius:17px;display:flex;gap:11px;padding:13px}.guard-summary>span{align-items:center;background:#fff4d5;border-radius:12px;color:#8b6611;display:flex;height:40px;justify-content:center;width:40px}.guard-summary strong,.guard-summary small{display:block}.guard-summary strong{font-size:.68rem}.guard-summary small{color:#7a898b;font-size:.58rem;margin-top:3px}.journal-guard>p{color:#5f7275;font-size:.7rem;margin:0}.guard-actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}
@media(max-width:1100px){.journal-layout{grid-template-columns:1fr}.journal-sidebar{grid-template-columns:repeat(2,1fr);position:static}.journal-companion{grid-column:1/-1}}
@media(max-width:760px){.journal-hero{grid-template-columns:1fr;min-height:0;padding:22px 18px}.journal-hero__visual{align-items:center;justify-content:space-between}.journal-hero__visual :deep(.mkt-ambassadors){margin-left:-25px}.date-control{min-width:150px}.journal-progress{grid-template-columns:1fr}.journal-progress>div{grid-template-columns:minmax(100px,1fr) auto}.journal-progress em{justify-self:start}.journal-editor{grid-template-columns:1fr}.journal-save-bar,.journal-error{grid-column:auto}.journal-sidebar{grid-template-columns:1fr}.journal-companion{grid-column:auto}.journal-save-bar{align-items:stretch;flex-direction:column}.journal-save-bar .mkt-btn{width:100%}.guard-actions{flex-direction:column}.guard-actions .mkt-btn{width:100%}}
@media(max-width:470px){.journal-hero__visual{align-items:end}.journal-hero__visual :deep(.mkt-ambassadors){display:none}.date-control{width:100%}.journal-progress>div{grid-template-columns:1fr}.journal-card{min-height:290px}.journal-companion{grid-template-columns:105px 1fr}}
</style>
