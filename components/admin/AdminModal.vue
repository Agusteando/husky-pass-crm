<template>
  <Teleport to="body">
    <div ref="backdropRef" class="admin-modal-backdrop" role="presentation" @click.self="requestClose">
      <section ref="modalRef" class="admin-modal" :class="{ wide, 'daycare-modal': isDaycareModal }" role="dialog" aria-modal="true" :aria-labelledby="titleId" tabindex="-1">
        <header class="admin-modal-head">
          <span class="modal-mark"><slot name="icon"><FamilyPersonasIcon name="daycare" /></slot></span>
          <div>
            <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
            <h2 :id="titleId">{{ title }}</h2>
            <p v-if="description">{{ description }}</p>
            <span v-if="dirty" class="draft-chip"><span aria-hidden="true" />Borrador modificado</span>
          </div>
          <button class="modal-close" type="button" aria-label="Cerrar" :disabled="closeDisabled" @click="requestClose">×</button>
        </header>
        <div class="admin-modal-body">
          <slot :request-close="requestClose" />
        </div>

        <Transition name="draft-guard">
          <div v-if="discardPromptOpen" class="draft-guard" role="presentation" @click.self="continueEditing">
            <section ref="discardPromptRef" class="draft-guard-card" role="alertdialog" aria-modal="true" :aria-labelledby="discardTitleId" :aria-describedby="discardDescriptionId" tabindex="-1">
              <span class="draft-guard-icon" aria-hidden="true">!</span>
              <div>
                <p class="eyebrow">Cambios sin guardar</p>
                <h3 :id="discardTitleId">{{ dirtyTitle }}</h3>
                <p :id="discardDescriptionId">{{ dirtyMessage }}</p>
              </div>
              <footer>
                <button ref="continueButtonRef" class="btn btn-primary" type="button" @click="continueEditing">Seguir editando</button>
                <button class="btn btn-secondary" type="button" @click="discardChanges">Descartar cambios</button>
              </footer>
            </section>
          </div>
        </Transition>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useRoute } from 'nuxt/app'

const props = withDefaults(defineProps<{
  title: string
  eyebrow?: string
  description?: string
  closeDisabled?: boolean
  dirty?: boolean
  dirtyTitle?: string
  dirtyMessage?: string
  wide?: boolean
}>(), {
  closeDisabled: false,
  dirty: false,
  dirtyTitle: 'Tus cambios todavía no se han guardado',
  dirtyMessage: 'Puedes seguir editando o descartar el borrador para cerrar esta ventana.',
  wide: false
})

const emit = defineEmits<{ close: [] }>()
const route = useRoute()
const isDaycareModal = computed(() => route.path.startsWith('/admin/daycare'))
const modalRef = ref<HTMLElement | null>(null)
const backdropRef = ref<HTMLElement | null>(null)
const discardPromptRef = ref<HTMLElement | null>(null)
const continueButtonRef = ref<HTMLButtonElement | null>(null)
const previousActive = ref<HTMLElement | null>(null)
const discardPromptOpen = ref(false)
const titleId = `admin-modal-title-${useId()}`
const discardTitleId = `admin-modal-discard-title-${useId()}`
const discardDescriptionId = `admin-modal-discard-description-${useId()}`

function emitClose() {
  discardPromptOpen.value = false
  emit('close')
}

async function requestClose() {
  if (props.closeDisabled) return
  if (!props.dirty) {
    emitClose()
    return
  }
  discardPromptOpen.value = true
  await nextTick()
  continueButtonRef.value?.focus()
}

function discardChanges() {
  emitClose()
}

async function continueEditing() {
  discardPromptOpen.value = false
  await nextTick()
  modalRef.value?.focus()
}

function focusableElements() {
  const scope = discardPromptOpen.value ? discardPromptRef.value : modalRef.value
  return Array.from(scope?.querySelectorAll<HTMLElement>([
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',')) || [])
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    if (discardPromptOpen.value) continueEditing()
    else requestClose()
    return
  }
  if (event.key !== 'Tab') return
  const items = focusableElements()
  if (!items.length) return
  const first = items[0]
  const last = items[items.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function onBeforeUnload(event: BeforeUnloadEvent) {
  if (!props.dirty) return
  event.preventDefault()
  event.returnValue = ''
}

watch(() => props.dirty, (dirty) => {
  if (!dirty) discardPromptOpen.value = false
})

onMounted(async () => {
  previousActive.value = document.activeElement instanceof HTMLElement ? document.activeElement : null
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('beforeunload', onBeforeUnload)
  document.body.classList.add('admin-modal-open')
  await nextTick()
  const firstFocusable = focusableElements()[0]
  if (firstFocusable) firstFocusable.focus()
  else modalRef.value?.focus?.()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('beforeunload', onBeforeUnload)
  document.body.classList.remove('admin-modal-open')
  previousActive.value?.focus?.()
})

defineExpose({ requestClose })
</script>

<style scoped>
.admin-modal-backdrop {
  align-items: center;
  background: rgba(11, 24, 39, 0.58);
  backdrop-filter: blur(10px);
  display: grid;
  inset: 0;
  justify-items: center;
  padding: 18px;
  position: fixed;
  z-index: 1200;
}

.admin-modal {
  background: #ffffff;
  border: 1px solid rgba(8, 135, 125, 0.18);
  border-radius: 26px;
  box-shadow: 0 34px 110px rgba(13, 30, 45, 0.35);
  display: grid;
  max-height: min(90dvh, 860px);
  max-width: min(780px, calc(100vw - 28px));
  overflow: hidden;
  position: relative;
  width: 100%;
}

.admin-modal.wide {
  max-width: min(1120px, calc(100vw - 28px));
}

.admin-modal:focus { outline: none; }

.admin-modal-head {
  align-items: start;
  background:
    radial-gradient(circle at 0% 10%, rgba(8, 135, 125, 0.12), transparent 34%),
    radial-gradient(circle at 90% 0%, rgba(246, 185, 79, 0.18), transparent 30%),
    linear-gradient(135deg, #ffffff, #fbfdf6);
  border-bottom: 1px solid rgba(8, 135, 125, 0.14);
  display: grid;
  gap: 14px;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  padding: 18px;
}

.modal-mark {
  align-items: center;
  background: linear-gradient(135deg, #eefaf7, #fff6df);
  border: 1px solid rgba(8, 135, 125, 0.18);
  border-radius: 18px;
  color: #075f58;
  display: inline-flex;
  height: 52px;
  justify-content: center;
  width: 52px;
}

.admin-modal-head h2,
.admin-modal-head p { margin: 0; }

.admin-modal-head h2 {
  color: #102235;
  font-family: var(--font-title, var(--font-body));
  font-size: clamp(1.35rem, 2vw, 2rem);
  letter-spacing: -0.025em;
  line-height: 1.05;
}

.admin-modal-head p:not(.eyebrow) {
  color: #607086;
  font-weight: 700;
  margin-top: 4px;
}

.eyebrow {
  color: #075f58;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.draft-chip {
  align-items: center;
  background: #fff7df;
  border: 1px solid rgba(246, 185, 79, 0.38);
  border-radius: 999px;
  color: #805d08;
  display: inline-flex;
  font-size: 0.7rem;
  font-weight: 900;
  gap: 7px;
  margin-top: 9px;
  padding: 6px 9px;
}

.draft-chip > span {
  background: #e5a72f;
  border-radius: 999px;
  height: 7px;
  width: 7px;
}

.modal-close {
  align-items: center;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(8, 135, 125, 0.16);
  border-radius: 14px;
  color: #075f58;
  cursor: pointer;
  display: inline-grid;
  font-size: 1.6rem;
  font-weight: 700;
  height: 44px;
  line-height: 1;
  place-items: center;
  width: 44px;
}

.modal-close:disabled { cursor: not-allowed; opacity: 0.55; }

.admin-modal-body {
  background: linear-gradient(180deg, #ffffff, rgba(240, 251, 247, 0.56));
  max-height: calc(90dvh - 102px);
  overflow: auto;
  padding: 18px;
}

.draft-guard {
  align-items: center;
  background: rgba(11, 24, 39, 0.48);
  backdrop-filter: blur(7px);
  display: grid;
  inset: 0;
  justify-items: center;
  padding: 18px;
  position: absolute;
  z-index: 4;
}

.draft-guard-card {
  background: #fff;
  border: 1px solid rgba(229, 167, 47, 0.42);
  border-radius: 22px;
  box-shadow: 0 24px 70px rgba(13, 30, 45, 0.3);
  display: grid;
  gap: 14px;
  grid-template-columns: auto minmax(0, 1fr);
  max-width: 520px;
  padding: 20px;
  width: 100%;
}

.draft-guard-card:focus { outline: none; }

.draft-guard-icon {
  align-items: center;
  background: #fff7df;
  border: 1px solid rgba(229, 167, 47, 0.35);
  border-radius: 999px;
  color: #8a650c;
  display: inline-flex;
  font-weight: 950;
  height: 44px;
  justify-content: center;
  width: 44px;
}

.draft-guard-card h3 {
  color: #102235;
  font-size: 1.22rem;
  margin: 4px 0 5px;
}

.draft-guard-card p:not(.eyebrow) {
  color: #607086;
  font-weight: 700;
  line-height: 1.45;
  margin: 0;
}

.draft-guard-card footer {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  grid-column: 1 / -1;
  justify-content: flex-end;
}

.draft-guard-enter-active,
.draft-guard-leave-active { transition: opacity 150ms ease; }
.draft-guard-enter-from,
.draft-guard-leave-to { opacity: 0; }


.admin-modal.daycare-modal {
  border-color: rgba(87, 139, 38, 0.18);
  border-radius: 30px;
  box-shadow: 0 38px 120px rgba(31, 55, 22, 0.34);
}

.admin-modal.daycare-modal .admin-modal-head {
  background:
    radial-gradient(circle at 0% 10%, rgba(159, 190, 75, 0.16), transparent 34%),
    radial-gradient(circle at 90% 0%, rgba(255, 186, 71, 0.20), transparent 30%),
    linear-gradient(135deg, #ffffff, #f8fbf3);
  border-bottom-color: rgba(87, 139, 38, 0.14);
}

.admin-modal.daycare-modal .modal-mark {
  background: linear-gradient(135deg, #ddebca, #fff0c9);
  border-color: rgba(87, 139, 38, 0.16);
  color: #355f24;
}

.admin-modal.daycare-modal .admin-modal-head h2,
.admin-modal.daycare-modal .draft-guard-card h3 {
  color: #263f1c;
}

.admin-modal.daycare-modal .admin-modal-head p:not(.eyebrow),
.admin-modal.daycare-modal .draft-guard-card p:not(.eyebrow) {
  color: #707a69;
}

.admin-modal.daycare-modal .eyebrow {
  color: #578b26;
}

.admin-modal.daycare-modal .modal-close {
  border-color: rgba(87, 139, 38, 0.15);
  color: #355f24;
}

.admin-modal.daycare-modal .admin-modal-body {
  background: linear-gradient(180deg, #ffffff, rgba(242, 248, 234, 0.62));
}

:global(body.admin-modal-open) { overflow: hidden; }

@media (max-width: 720px) {
  .admin-modal-backdrop {
    align-items: end;
    padding: 0;
  }

  .admin-modal {
    border-radius: 24px 24px 0 0;
    max-height: 92dvh;
    max-width: 100vw;
  }

  .admin-modal.daycare-modal { border-radius: 24px 24px 0 0; }

  .admin-modal-head { grid-template-columns: 46px minmax(0, 1fr) auto; }
  .modal-mark { height: 46px; width: 46px; }
  .draft-guard-card { grid-template-columns: 1fr; }
  .draft-guard-card footer { display: grid; grid-column: 1; }
  .draft-guard-icon { display: none; }
}
</style>
