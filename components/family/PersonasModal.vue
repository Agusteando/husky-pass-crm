<template>
  <Teleport to="body">
    <div ref="backdropRef" class="pa-modal-backdrop" role="presentation" @click.self="close">
      <section ref="modalRef" class="pa-modal" role="dialog" aria-modal="true" :aria-labelledby="titleId" tabindex="-1">
        <header class="pa-modal-head">
          <div>
            <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
            <h2 :id="titleId">{{ title }}</h2>
            <p v-if="description">{{ description }}</p>
          </div>
          <button class="pa-modal-close" type="button" aria-label="Cerrar" @click="close">×</button>
        </header>
        <div class="pa-modal-body">
          <slot />
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

defineProps<{
  title: string
  eyebrow?: string
  description?: string
}>()

const emit = defineEmits<{ close: [] }>()
const modalRef = ref<HTMLElement | null>(null)
const backdropRef = ref<HTMLElement | null>(null)
const previousActive = ref<HTMLElement | null>(null)
const titleId = `pa-modal-title-${Math.random().toString(36).slice(2, 9)}`

function close() {
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
  ].join(',')) || []).filter((element) => !element.hasAttribute('aria-hidden'))
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
    return
  }
  if (event.key !== 'Tab') return
  const items = focusableElements()
  if (!items.length) {
    event.preventDefault()
    modalRef.value?.focus()
    return
  }
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
  document.body.classList.add('pa-modal-open')
  await nextTick()
  const firstFocusable = focusableElements()[0]
  if (firstFocusable) {
    firstFocusable.focus()
  } else {
    modalRef.value?.focus()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.classList.remove('pa-modal-open')
  previousActive.value?.focus?.()
})

</script>

<style scoped>
.pa-modal-backdrop {
  align-items: center;
  background: rgba(25, 28, 32, 0.58);
  display: grid;
  inset: 0;
  justify-items: center;
  padding: 18px;
  position: fixed;
  z-index: 1000;
}

.pa-modal {
  background: #fff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 28px;
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.28);
  display: grid;
  gap: 0;
  max-height: min(88vh, 860px);
  max-width: min(920px, calc(100vw - 28px));
  overflow: hidden;
  width: 100%;
}

.pa-modal:focus {
  outline: none;
}

.pa-modal-head {
  align-items: start;
  border-bottom: 1px solid #ecece7;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 20px 22px 16px;
}

.pa-modal-head h2,
.pa-modal-head p {
  margin-bottom: 0;
}

.pa-modal-head p:not(.eyebrow) {
  color: var(--pa-muted, #86888c);
  font-weight: 600;
  margin-top: 4px;
}

.pa-modal-close {
  align-items: center;
  background: var(--pa-soft, #f3f5f0);
  border: 1px solid var(--pa-border, #dce7d0);
  border-radius: 999px;
  color: var(--pa-primary, #618b2f);
  cursor: pointer;
  display: inline-grid;
  font-size: 1.55rem;
  font-weight: 600;
  height: 40px;
  line-height: 1;
  place-items: center;
  width: 40px;
}

.pa-modal-body {
  overflow: auto;
  padding: 18px 22px 22px;
}

@media (max-width: 720px) {
  .pa-modal-backdrop {
    align-items: end;
    padding: 0;
  }

  .pa-modal {
    border-radius: 24px 24px 0 0;
    max-height: 92vh;
    max-width: 100vw;
  }

  .pa-modal-head,
  .pa-modal-body {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
