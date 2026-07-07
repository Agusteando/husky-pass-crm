<template>
  <Teleport to="body">
    <div ref="backdropRef" class="admin-modal-backdrop" role="presentation" @click.self="close">
      <section ref="modalRef" class="admin-modal" role="dialog" aria-modal="true" :aria-labelledby="titleId" tabindex="-1">
        <header class="admin-modal-head">
          <span class="modal-mark"><slot name="icon"><FamilyPersonasIcon name="daycare" /></slot></span>
          <div>
            <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
            <h2 :id="titleId">{{ title }}</h2>
            <p v-if="description">{{ description }}</p>
          </div>
          <button class="modal-close" type="button" aria-label="Cerrar" :disabled="closeDisabled" @click="close">×</button>
        </header>
        <div class="admin-modal-body">
          <slot />
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  eyebrow?: string
  description?: string
  closeDisabled?: boolean
}>(), {
  closeDisabled: false
})

const emit = defineEmits<{ close: [] }>()
const modalRef = ref<HTMLElement | null>(null)
const backdropRef = ref<HTMLElement | null>(null)
const previousActive = ref<HTMLElement | null>(null)
const titleId = `admin-modal-title-${useId()}`

function close() {
  if (props.closeDisabled) return
  emit('close')
}

function focusableElements() {
  return Array.from(modalRef.value?.querySelectorAll<HTMLElement>([
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
    close()
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

onMounted(async () => {
  previousActive.value = document.activeElement instanceof HTMLElement ? document.activeElement : null
  document.addEventListener('keydown', onKeydown)
  document.body.classList.add('admin-modal-open')
  await nextTick()
  const firstFocusable = focusableElements()[0]
  if (firstFocusable) firstFocusable.focus()
  else modalRef.value?.focus?.()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.classList.remove('admin-modal-open')
  previousActive.value?.focus?.()
})
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
  width: 100%;
}

.admin-modal:focus {
  outline: none;
}

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
.admin-modal-head p {
  margin: 0;
}

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

.admin-modal-body {
  background: linear-gradient(180deg, #ffffff, rgba(240, 251, 247, 0.56));
  max-height: calc(90dvh - 102px);
  overflow: auto;
  padding: 18px;
}

:global(body.admin-modal-open) {
  overflow: hidden;
}

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

  .admin-modal-head {
    grid-template-columns: 46px minmax(0, 1fr) auto;
  }

  .modal-mark {
    height: 46px;
    width: 46px;
  }
}
</style>
