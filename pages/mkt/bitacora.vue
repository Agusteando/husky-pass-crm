<template>
  <section class="mkt-page journal-page" data-product-area="mkt" data-product-screen="bitacora">
    <header class="journal-hero mkt-panel">
      <div>
        <p class="mkt-eyebrow">Bitácora de Mercadotecnia</p>
        <h1>Deja claro lo que avanzó hoy</h1>
        <p>Un registro breve y útil para dar continuidad al trabajo del equipo.</p>
      </div>
      <label class="date-control"><span>Fecha de trabajo</span><input v-model="selectedDate" type="date" :max="today" /></label>
    </header>

    <section v-if="pending" class="mkt-panel mkt-empty"><HuskyPassLoader label="Bitácora" contained /></section>
    <section v-else-if="loadError" class="mkt-panel mkt-empty"><FamilyPersonasIcon name="alert" /><h2>No pudimos abrir la bitácora</h2><button class="mkt-btn" type="button" @click="() => refresh()">Reintentar</button></section>

    <template v-else>
      <section class="journal-status-bar" :data-complete="journal?.entry.completed">
        <span><FamilyPersonasIcon :name="journal?.entry.completed ? 'check' : 'edit'" /></span>
        <div><strong>{{ journal?.entry.completed ? 'Registro encontrado' : 'Lista para comenzar' }}</strong><small>{{ selectedDateLabel }}</small></div>
        <em v-if="dirty">Cambios sin guardar</em><em v-else-if="savedMessage">{{ savedMessage }}</em>
      </section>

      <section class="journal-layout">
        <form class="journal-editor" @submit.prevent="save">
          <article class="journal-card mkt-panel achievements">
            <header><span><FamilyPersonasIcon name="check" /></span><div><p class="mkt-eyebrow">Resultados</p><h2>Logros del día</h2></div></header>
            <textarea v-model="form.achievements" class="mkt-textarea" maxlength="20000" placeholder="¿Qué se logró o quedó resuelto?" @input="markDirty" />
            <small>Enfócate en resultados concretos, no en una lista exhaustiva.</small>
          </article>

          <article class="journal-card mkt-panel activities">
            <header><span><FamilyPersonasIcon name="clipboard" /></span><div><p class="mkt-eyebrow">Operación</p><h2>Actividades clave</h2></div></header>
            <textarea v-model="form.activities" class="mkt-textarea" maxlength="20000" placeholder="Atención a familias, llamadas, recorridos, coordinación…" @input="markDirty" />
            <small>Una actividad por línea hace el registro más fácil de leer.</small>
          </article>

          <article class="journal-card mkt-panel content-card">
            <header><span><FamilyPersonasIcon name="announcement" /></span><div><p class="mkt-eyebrow">Difusión</p><h2>Contenido y campañas</h2></div></header>
            <textarea v-model="form.content" class="mkt-textarea" maxlength="20000" placeholder="Piezas publicadas, campañas editadas, eventos difundidos…" @input="markDirty" />
            <small>Incluye canal o campaña cuando ayude a dar seguimiento.</small>
          </article>

          <article class="journal-card mkt-panel comments-card">
            <header><span><FamilyPersonasIcon name="bell" /></span><div><p class="mkt-eyebrow">Continuidad</p><h2>Pendientes y comentarios</h2></div></header>
            <textarea v-model="form.comments" class="mkt-textarea" maxlength="20000" placeholder="Qué debe retomarse mañana, bloqueos o acuerdos…" @input="markDirty" />
            <small>Deja visible el siguiente paso para que nada se pierda.</small>
          </article>

          <div class="journal-save-bar mkt-panel">
            <div><strong>{{ completionLabel }}</strong><small>{{ contentLength }} caracteres en total</small></div>
            <button class="mkt-btn primary" type="submit" :disabled="saving || !dirty"><FamilyPersonasIcon name="send" />{{ saving ? 'Guardando…' : dirty ? 'Guardar bitácora' : 'Bitácora guardada' }}</button>
          </div>
          <p v-if="saveError" class="mkt-alert">{{ saveError }}</p>
        </form>

        <aside class="journal-sidebar">
          <article v-if="journal?.entry.feedback" class="feedback-card mkt-panel">
            <span><FamilyPersonasIcon name="announcement" /></span>
            <div><p class="mkt-eyebrow">Retroalimentación</p><h2>Comentario recibido</h2></div>
            <p>{{ journal.entry.feedback }}</p>
          </article>

          <article class="recent-journals mkt-panel">
            <div class="sidebar-head"><p class="mkt-eyebrow">Historial</p><h2>Registros recientes</h2></div>
            <div v-if="journal?.recent.length" class="journal-date-list">
              <button v-for="entry in journal.recent" :key="entry.uid" type="button" :class="{ active: entry.date === selectedDate }" @click="selectEntry(entry.date)">
                <span><strong>{{ shortDay(entry.date) }}</strong><small>{{ monthYear(entry.date) }}</small></span>
                <span class="entry-preview"><b>{{ entry.achievements || entry.activities || 'Registro sin resumen' }}</b><small>{{ entry.completed ? 'Completada' : 'Borrador' }}</small></span>
                <FamilyPersonasIcon name="arrow" />
              </button>
            </div>
            <div v-else class="empty-history"><FamilyPersonasIcon name="history" /><p>Al guardar tu primera bitácora aparecerá aquí.</p></div>
          </article>

          <article class="journal-tip">
            <span>Una buena bitácora responde tres preguntas:</span>
            <strong>¿Qué se logró? ¿Qué sigue? ¿Quién necesita contexto?</strong>
          </article>
        </aside>
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useFetch } from 'nuxt/app'
import type { MktJournalResponse } from '~/types/mkt'

definePageMeta({ layout: 'mkt', middleware: ['admin', 'mkt'] })

const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const selectedDate = ref(today)
const query = computed(() => ({ date: selectedDate.value }))
const { data: journal, pending, error: loadError, refresh } = useFetch<MktJournalResponse>('/api/mkt/journal', { query })
const form = reactive({ achievements: '', activities: '', content: '', comments: '' })
const dirty = ref(false)
const saving = ref(false)
const saveError = ref('')
const savedMessage = ref('')

watch(() => journal.value?.entry, (entry) => {
  if (!entry) return
  Object.assign(form, { achievements: entry.achievements, activities: entry.activities, content: entry.content, comments: entry.comments })
  dirty.value = false
}, { immediate: true })

watch(selectedDate, () => { savedMessage.value = ''; saveError.value = ''; dirty.value = false })

const contentLength = computed(() => Object.values(form).reduce((total, value) => total + value.length, 0))
const completedSections = computed(() => Object.values(form).filter((value) => value.trim()).length)
const completionLabel = computed(() => completedSections.value === 4 ? 'Registro completo' : completedSections.value ? `${completedSections.value} de 4 secciones con contenido` : 'Agrega lo más importante del día')
const selectedDateLabel = computed(() => formatLongDate(selectedDate.value))

function markDirty() { dirty.value = true; savedMessage.value = '' }

async function save() {
  saving.value = true
  saveError.value = ''
  try {
    journal.value = await $fetch<MktJournalResponse>('/api/mkt/journal', { method: 'PUT', body: { date: selectedDate.value, ...form } })
    dirty.value = false
    savedMessage.value = 'Guardada hace un momento'
  } catch (caught: any) {
    saveError.value = caught?.data?.statusMessage || caught?.statusMessage || 'No fue posible guardar la bitácora.'
  } finally {
    saving.value = false
  }
}

function selectEntry(date: string) {
  if (dirty.value && !window.confirm('Hay cambios sin guardar. ¿Quieres abrir otra fecha?')) return
  selectedDate.value = date
}

function parseDate(value: string) { return new Date(`${value}T12:00:00`) }
function formatLongDate(value: string) { return new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(parseDate(value)) }
function shortDay(value: string) { return new Intl.DateTimeFormat('es-MX', { day: '2-digit' }).format(parseDate(value)) }
function monthYear(value: string) { return new Intl.DateTimeFormat('es-MX', { month: 'short', year: 'numeric' }).format(parseDate(value)) }
</script>

<style scoped>
.journal-hero{align-items:center;background:radial-gradient(circle at 87% 13%,rgba(143,200,73,.18),transparent 19rem),linear-gradient(135deg,#fff,#f3faf6);display:grid;gap:20px;grid-template-columns:minmax(0,1fr) auto;padding:clamp(22px,3vw,34px)}.journal-hero h1{font-size:clamp(2rem,3.4vw,3.2rem);letter-spacing:-.035em;line-height:1}.journal-hero p:last-child{font-size:.82rem;margin:10px 0 0}.date-control{background:#fff;border:1px solid #d9e7e1;border-radius:16px;display:grid;gap:4px;padding:9px 12px}.date-control span{color:#7d8b8d;font-size:.61rem}.date-control input{background:transparent;border:0;color:#234147;font:inherit;font-size:.76rem;outline:0}
.journal-status-bar{align-items:center;background:#fff8e5;border:1px solid #f0dfab;border-radius:17px;display:grid;gap:10px;grid-template-columns:38px minmax(0,1fr) auto;padding:10px 14px}.journal-status-bar[data-complete='true']{background:#edf8f2;border-color:#d4eade}.journal-status-bar>span{align-items:center;background:#f8eecf;border-radius:12px;color:#8c6715;display:flex;height:38px;justify-content:center;width:38px}.journal-status-bar[data-complete='true']>span{background:#dff1e7;color:#0b6b61}.journal-status-bar strong,.journal-status-bar small{display:block}.journal-status-bar strong{font-size:.73rem}.journal-status-bar small{color:#7d8b8d;font-size:.64rem;margin-top:2px;text-transform:capitalize}.journal-status-bar em{color:#98731f;font-size:.65rem;font-style:normal}.journal-status-bar[data-complete='true'] em{color:#0b6b61}
.journal-layout{align-items:start;display:grid;gap:18px;grid-template-columns:minmax(0,1fr) minmax(280px,360px)}.journal-editor{display:grid;gap:14px;grid-template-columns:repeat(2,minmax(0,1fr))}.journal-card{display:grid;gap:12px;padding:18px}.journal-card header{align-items:center;border-bottom:1px solid #e5ede9;display:grid;gap:10px;grid-template-columns:42px minmax(0,1fr);padding-bottom:12px}.journal-card header>span{align-items:center;background:#edf8f3;border-radius:13px;color:#0b6b61;display:flex;height:42px;justify-content:center;width:42px}.journal-card.activities header>span{background:#edf5fc;color:#4f8bc9}.journal-card.content-card header>span{background:#fff7df;color:#946b11}.journal-card.comments-card header>span{background:#fff0ed;color:#c15347}.journal-card h2{font-size:1.15rem}.journal-card .mkt-eyebrow{margin-bottom:3px}.journal-card .mkt-textarea{border:0;box-shadow:none;min-height:190px;padding:4px;resize:vertical}.journal-card>small{color:#929d9e;font-size:.62rem}.journal-save-bar{align-items:center;display:flex;gap:16px;grid-column:1/-1;justify-content:space-between;padding:14px}.journal-save-bar strong,.journal-save-bar small{display:block}.journal-save-bar strong{font-size:.77rem}.journal-save-bar small{color:#849193;font-size:.64rem;margin-top:2px}.journal-editor>.mkt-alert{grid-column:1/-1;margin:0}
.journal-sidebar{display:grid;gap:14px;position:sticky;top:98px}.feedback-card{background:linear-gradient(145deg,#fff9e5,#fff);display:grid;gap:9px;grid-template-columns:38px minmax(0,1fr);padding:17px}.feedback-card>span{align-items:center;background:#f8edc7;border-radius:12px;color:#8c6611;display:flex;height:38px;justify-content:center;width:38px}.feedback-card h2{font-size:1.08rem}.feedback-card>p:last-child{color:#5d6d6f;font-size:.72rem;grid-column:1/-1;line-height:1.55;margin:3px 0 0}.recent-journals{overflow:hidden}.sidebar-head{border-bottom:1px solid #e2ebe7;padding:18px}.sidebar-head h2{font-size:1.2rem}.journal-date-list{display:grid}.journal-date-list button{align-items:center;background:#fff;border:0;border-bottom:1px solid #e9efec;color:#314b50;cursor:pointer;display:grid;font:inherit;gap:10px;grid-template-columns:42px minmax(0,1fr) 18px;padding:11px 14px;text-align:left}.journal-date-list button:last-child{border-bottom:0}.journal-date-list button:hover,.journal-date-list button.active{background:#f1f8f4}.journal-date-list button>span:first-child{align-items:center;background:#edf4f1;border-radius:11px;display:flex;flex-direction:column;height:42px;justify-content:center}.journal-date-list strong,.journal-date-list small,.entry-preview b{display:block}.journal-date-list strong{font-family:var(--font-title);font-size:1rem}.journal-date-list small{color:#8a9697;font-size:.55rem}.entry-preview{min-width:0}.entry-preview b{font-size:.66rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.entry-preview small{color:#0b6b61;margin-top:3px}.journal-date-list svg{color:#92a09f}.empty-history{align-items:center;color:#899796;display:grid;font-size:.68rem;gap:7px;justify-items:center;padding:28px;text-align:center}.empty-history p{margin:0}.journal-tip{background:#0b5c55;border-radius:19px;box-shadow:0 18px 38px rgba(11,92,85,.16);color:#fff;display:grid;gap:6px;padding:17px}.journal-tip span{font-size:.64rem;opacity:.78}.journal-tip strong{font-family:var(--font-title);font-size:.92rem;line-height:1.35}
@media(max-width:1040px){.journal-layout{grid-template-columns:1fr}.journal-sidebar{grid-template-columns:repeat(2,1fr);position:static}.journal-tip{grid-column:1/-1}}
@media(max-width:720px){.journal-hero{align-items:start;grid-template-columns:1fr}.date-control{width:100%}.journal-editor{grid-template-columns:1fr}.journal-save-bar,.journal-editor>.mkt-alert{grid-column:auto}.journal-sidebar{grid-template-columns:1fr}.journal-tip{grid-column:auto}.journal-status-bar{grid-template-columns:38px minmax(0,1fr)}.journal-status-bar em{grid-column:2}.journal-save-bar{align-items:stretch;flex-direction:column}.journal-save-bar .mkt-btn{width:100%}}
</style>
