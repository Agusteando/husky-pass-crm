<template>
  <Teleport to="body">
    <div class="mkt-modal-backdrop" role="presentation" @click.self="requestClose">
      <section ref="modalRef" class="mkt-modal-shell" :class="{ wide }" role="dialog" aria-modal="true" :aria-labelledby="titleId" tabindex="-1">
        <header class="mkt-modal-head">
          <span class="mkt-modal-mark"><slot name="icon"><FamilyPersonasIcon name="announcement" /></slot></span>
          <div>
            <p v-if="eyebrow" class="mkt-eyebrow">{{ eyebrow }}</p>
            <h2 :id="titleId">{{ title }}</h2>
            <p v-if="description">{{ description }}</p>
            <span v-if="dirty" class="mkt-draft-chip"><i />Borrador modificado</span>
          </div>
          <button class="mkt-modal-close" type="button" aria-label="Cerrar" :disabled="closeDisabled" @click="requestClose"><FamilyPersonasIcon name="close" /></button>
        </header>
        <div class="mkt-modal-body"><slot :request-close="requestClose" /></div>

        <Transition name="mkt-guard">
          <div v-if="guardOpen" class="mkt-guard-layer" role="presentation" @click.self="continueEditing">
            <section ref="guardRef" class="mkt-guard-card" role="alertdialog" aria-modal="true" tabindex="-1">
              <span><FamilyPersonasIcon name="alert" /></span>
              <div><p class="mkt-eyebrow">Cambios sin guardar</p><h3>{{ dirtyTitle }}</h3><p>{{ dirtyMessage }}</p></div>
              <footer>
                <button ref="continueRef" class="mkt-btn primary" type="button" @click="continueEditing">Seguir editando</button>
                <button class="mkt-btn" type="button" @click="discardChanges">Descartar cambios</button>
              </footer>
            </section>
          </div>
        </Transition>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

const props = withDefaults(defineProps<{
  title: string
  eyebrow?: string
  description?: string
  dirty?: boolean
  dirtyTitle?: string
  dirtyMessage?: string
  closeDisabled?: boolean
  wide?: boolean
}>(), {
  eyebrow: '',
  description: '',
  dirty: false,
  dirtyTitle: 'Tus cambios todavía no se han guardado',
  dirtyMessage: 'Continúa editando o descarta el borrador para cerrar esta ventana.',
  closeDisabled: false,
  wide: false
})
const emit = defineEmits<{ close: [] }>()
const modalRef = ref<HTMLElement | null>(null)
const guardRef = ref<HTMLElement | null>(null)
const continueRef = ref<HTMLButtonElement | null>(null)
const previousActive = ref<HTMLElement | null>(null)
const guardOpen = ref(false)
const titleId = `mkt-modal-${useId()}`
let navigationResolver: ((allow: boolean) => void) | null = null

function finishNavigation(allow: boolean) {
  const resolve = navigationResolver
  navigationResolver = null
  if (resolve) resolve(allow)
}
function emitClose() {
  guardOpen.value = false
  if (navigationResolver) { finishNavigation(true); return }
  emit('close')
}
async function requestClose() {
  if (props.closeDisabled) return
  if (!props.dirty) return emitClose()
  guardOpen.value = true
  await nextTick()
  continueRef.value?.focus()
}
function discardChanges() { emitClose() }
async function continueEditing() {
  guardOpen.value = false
  if (navigationResolver) finishNavigation(false)
  await nextTick()
  modalRef.value?.focus()
}
function focusables() {
  const scope = guardOpen.value ? guardRef.value : modalRef.value
  return Array.from(scope?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])') || [])
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    if (guardOpen.value) continueEditing()
    else requestClose()
    return
  }
  if (event.key !== 'Tab') return
  const items = focusables(); if (!items.length) return
  const first = items[0]; const last = items[items.length - 1]
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}
function onBeforeUnload(event: BeforeUnloadEvent) { if (!props.dirty) return; event.preventDefault(); event.returnValue = '' }
watch(() => props.dirty, (dirty) => { if (!dirty) guardOpen.value = false })
onBeforeRouteLeave(() => {
  if (props.closeDisabled) return false
  if (!props.dirty) return true
  guardOpen.value = true
  return new Promise<boolean>((resolve) => { navigationResolver = resolve })
})
onMounted(async () => {
  previousActive.value = document.activeElement instanceof HTMLElement ? document.activeElement : null
  document.body.classList.add('mkt-modal-open')
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('beforeunload', onBeforeUnload)
  await nextTick(); focusables()[0]?.focus()
})
onBeforeUnmount(() => {
  document.body.classList.remove('mkt-modal-open')
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('beforeunload', onBeforeUnload)
  if (navigationResolver) finishNavigation(false)
  previousActive.value?.focus()
})
defineExpose({ requestClose })
</script>

<style scoped>
.mkt-modal-backdrop { align-items: center; backdrop-filter: blur(12px); background: rgba(8, 31, 39, 0.62); display: grid; inset: 0; justify-items: center; padding: 18px; position: fixed; z-index: 1200; }
.mkt-modal-shell { background: #f8fbf9; border: 1px solid rgba(255,255,255,.75); border-radius: 28px; box-shadow: 0 38px 120px rgba(5, 28, 36, 0.34); max-height: min(92dvh, 900px); max-width: min(820px, calc(100vw - 28px)); overflow: hidden; position: relative; width: 100%; }
.mkt-modal-shell.wide { max-width: min(1120px, calc(100vw - 28px)); }
.mkt-modal-shell:focus { outline: none; }
.mkt-modal-head { align-items: start; background: radial-gradient(circle at 84% 0%, rgba(246,199,69,.22), transparent 17rem), radial-gradient(circle at 0% 100%, rgba(143,200,73,.16), transparent 17rem), #fff; border-bottom: 1px solid var(--mkt-line); display: grid; gap: 14px; grid-template-columns: 52px minmax(0,1fr) auto; padding: 20px 22px; }
.mkt-modal-mark { align-items:center; background:linear-gradient(135deg,#e7f7ef,#fff5d4); border:1px solid #d8e9e0; border-radius:18px; color:var(--mkt-teal); display:flex; height:52px; justify-content:center; width:52px; }
.mkt-modal-head h2 { font-family: var(--font-title); font-size: clamp(1.45rem, 3vw, 2.25rem); letter-spacing: -.03em; line-height: 1.04; margin: 0; }
.mkt-modal-head p:not(.mkt-eyebrow) { color: var(--mkt-muted); font-size: .78rem; margin: 6px 0 0; }
.mkt-modal-close { align-items:center; background:#f0f5f2; border:1px solid #dce7e2; border-radius:14px; color:#52696c; cursor:pointer; display:flex; height:42px; justify-content:center; width:42px; }
.mkt-modal-body { max-height: calc(92dvh - 116px); overflow: auto; }
.mkt-draft-chip { align-items:center; background:#fff7dc; border:1px solid #eedb9a; border-radius:99px; color:#816014; display:inline-flex; font-size:.64rem; font-weight:900; gap:7px; margin-top:9px; padding:5px 9px; }
.mkt-draft-chip i { background:#e4a92c; border-radius:50%; height:7px; width:7px; }
.mkt-guard-layer { align-items:center; background:rgba(8,31,39,.64); display:grid; inset:0; justify-items:center; padding:18px; position:absolute; z-index:5; }
.mkt-guard-card { background:#fff; border-radius:22px; box-shadow:0 24px 70px rgba(5,28,36,.28); display:grid; gap:14px; grid-template-columns:46px minmax(0,1fr); max-width:560px; padding:20px; width:100%; }
.mkt-guard-card>span { align-items:center; background:#fff0ec; border-radius:15px; color:#bd4b42; display:flex; height:46px; justify-content:center; width:46px; }
.mkt-guard-card h3 { font-family:var(--font-title); font-size:1.35rem; margin:0; }.mkt-guard-card p:not(.mkt-eyebrow){color:var(--mkt-muted);font-size:.76rem;margin:6px 0 0}.mkt-guard-card footer{display:flex;gap:9px;grid-column:1/-1;justify-content:flex-end}
.mkt-guard-enter-active,.mkt-guard-leave-active{transition:.16s ease}.mkt-guard-enter-from,.mkt-guard-leave-to{opacity:0}
@media(max-width:640px){.mkt-modal-backdrop{align-items:end;padding:0}.mkt-modal-shell,.mkt-modal-shell.wide{border-radius:26px 26px 0 0;max-width:none}.mkt-modal-head{grid-template-columns:44px minmax(0,1fr) 40px;padding:17px}.mkt-modal-mark{border-radius:15px;height:44px;width:44px}.mkt-modal-body{max-height:calc(94dvh - 100px)}.mkt-guard-card{grid-template-columns:42px minmax(0,1fr)}.mkt-guard-card footer{flex-direction:column}.mkt-guard-card .mkt-btn{width:100%}}
</style>
