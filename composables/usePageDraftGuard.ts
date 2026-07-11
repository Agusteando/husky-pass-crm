import { onBeforeUnmount, onMounted, toValue, type MaybeRefOrGetter } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

const DEFAULT_MESSAGE = 'Hay cambios sin guardar. ¿Quieres salir?'

export function usePageDraftGuard(dirty: MaybeRefOrGetter<boolean>, message = DEFAULT_MESSAGE) {
  function canDiscard() {
    if (!toValue(dirty)) return true
    if (typeof window === 'undefined') return false
    return window.confirm(message)
  }

  function onBeforeUnload(event: BeforeUnloadEvent) {
    if (!toValue(dirty)) return
    event.preventDefault()
    event.returnValue = ''
  }

  onBeforeRouteLeave(() => canDiscard())
  onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))

  return { canDiscard }
}
