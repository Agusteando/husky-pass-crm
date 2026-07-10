import { computed, onMounted, toValue, watch, type ComputedRef, type InjectionKey, type MaybeRefOrGetter } from 'vue'
import { useNuxtApp, useState } from 'nuxt/app'
import type { AuthorizedChild, AuthorizedPerson, PersonasTheme } from '~/types/daycare'
import { normalizeVirtualAssetUrl } from '~/utils/daycare'
import { personasThemeStyle, resolvePersonasTheme } from '~/utils/personasTheme'
import { normalizeMatricula } from '~/utils/matricula'
import { sessionAccountIdentity, useAccountStateEpoch, useRouteSessionCache } from '~/utils/routeSession'

type PersonasThemeSource = Parameters<typeof resolvePersonasTheme>[0]
type FamilyThemeOptions = {
  key?: string
  selectedMatricula?: MaybeRefOrGetter<string | number | null | undefined>
  fallback?: MaybeRefOrGetter<PersonasThemeSource | null | undefined>
  immediate?: MaybeRefOrGetter<boolean | null | undefined>
}

type PersonasFamilyPeopleRequest = {
  owner: string
  epoch: number
  promise: Promise<AuthorizedPerson[]>
}

type PersonasFamilyPeoplePromiseHolder = {
  _personasFamilyPeopleRequest?: PersonasFamilyPeopleRequest
}

export type PersonasFamilyThemeContext = {
  theme: ComputedRef<PersonasTheme>
}

export const personasFamilyThemeContextKey = Symbol('personas-family-theme-context') as InjectionKey<PersonasFamilyThemeContext>

function childrenFromPeople(people?: AuthorizedPerson[] | null) {
  return people?.find((person) => person.children?.length)?.children || []
}

function fetchErrorMessage(error: unknown) {
  const failure = error as { data?: { statusMessage?: string; message?: string }; statusMessage?: string; message?: string }
  return failure?.data?.statusMessage || failure?.data?.message || failure?.statusMessage || failure?.message || 'No fue posible cargar Personas Autorizadas.'
}

export function usePersonasFamilyPeople(options: { immediate?: MaybeRefOrGetter<boolean | null | undefined> } = {}) {
  const data = useState<AuthorizedPerson[]>('pa-family-people:data', () => [])
  const loaded = useState<boolean>('pa-family-people:loaded', () => false)
  const pendingState = useState<boolean>('pa-family-people:pending', () => false)
  const errorMessage = useState<string>('pa-family-people:error', () => '')
  const owner = useState<string | null>('pa-family-people:owner', () => null)
  const sessionCache = useRouteSessionCache()
  const accountEpoch = useAccountStateEpoch()
  const activeOwner = computed(() => sessionAccountIdentity(sessionCache.value))
  const shouldLoad = computed(() => toValue(options.immediate) !== false)
  const pending = computed(() => pendingState.value || (shouldLoad.value && !loaded.value && !errorMessage.value))
  const error = computed(() => errorMessage.value || null)

  function resetForOwner(nextOwner: string) {
    if (owner.value === nextOwner) return
    data.value = []
    loaded.value = false
    pendingState.value = false
    errorMessage.value = ''
    owner.value = nextOwner
  }

  watch(activeOwner, resetForOwner, { immediate: true, flush: 'sync' })

  async function load(force = false) {
    const requestOwner = activeOwner.value
    resetForOwner(requestOwner)
    if (!force && loaded.value) return data.value

    const holder = useNuxtApp() as unknown as PersonasFamilyPeoplePromiseHolder
    const existing = holder._personasFamilyPeopleRequest
    if (existing && existing.owner === requestOwner && existing.epoch === accountEpoch.value) {
      return existing.promise
    }

    const requestEpoch = accountEpoch.value
    pendingState.value = true
    errorMessage.value = ''

    const promise = $fetch<AuthorizedPerson[]>('/api/personas-autorizadas/family', {
      timeout: 15000,
      cache: 'no-store'
    }).then((rows) => {
      if (accountEpoch.value !== requestEpoch || activeOwner.value !== requestOwner) return data.value
      data.value = Array.isArray(rows) ? rows : []
      loaded.value = true
      owner.value = requestOwner
      return data.value
    }).catch((error: unknown) => {
      if (accountEpoch.value !== requestEpoch || activeOwner.value !== requestOwner) return data.value
      errorMessage.value = fetchErrorMessage(error)
      throw error
    }).finally(() => {
      if (holder._personasFamilyPeopleRequest?.promise !== promise) return
      pendingState.value = false
      holder._personasFamilyPeopleRequest = undefined
    })

    holder._personasFamilyPeopleRequest = { owner: requestOwner, epoch: requestEpoch, promise }
    return promise
  }

  function ensure() {
    resetForOwner(activeOwner.value)
    if (!shouldLoad.value || loaded.value || pendingState.value) return Promise.resolve(data.value)
    return load(false)
  }

  function refresh() {
    return load(true)
  }

  onMounted(() => {
    void ensure().catch(() => undefined)
  })

  return {
    data,
    pending,
    error,
    loaded,
    ensure,
    refresh
  }
}

export function useResolvedPersonasTheme(source: MaybeRefOrGetter<PersonasThemeSource | null | undefined>) {
  const theme = computed<PersonasTheme>(() => resolvePersonasTheme(toValue(source) || {}))
  const themeVars = computed(() => personasThemeStyle(theme.value))
  return { theme, themeVars }
}

export function usePersonasFamilyTheme(options: FamilyThemeOptions = {}) {
  const sessionState = useAppSession()
  const peopleState = usePersonasFamilyPeople({ immediate: options.immediate })

  const selectedMatricula = computed(() => normalizeMatricula(toValue(options.selectedMatricula)))
  const fallback = computed(() => toValue(options.fallback) || {})
  const people = peopleState.data
  const session = sessionState.data
  const children = computed<AuthorizedChild[]>(() => childrenFromPeople(people.value))
  const primaryChild = computed(() => {
    const selected = selectedMatricula.value
    if (selected) {
      const byMatricula = children.value.find((child) => normalizeMatricula(child.matricula) === selected)
      if (byMatricula) return byMatricula
    }
    return children.value.find((child) => child.isCurrent) || children.value[0] || null
  })

  const themeSource = computed<PersonasThemeSource>(() => ({
    matricula: primaryChild.value?.matricula || selectedMatricula.value || fallback.value.matricula || session.value?.user?.username,
    plantel: primaryChild.value?.plantel || fallback.value.plantel || session.value?.user?.plantel?.[0],
    nivelEdu: primaryChild.value?.nivelEdu || fallback.value.nivelEdu,
    campus: primaryChild.value?.campus || fallback.value.campus || session.value?.user?.campus,
    themeKey: fallback.value.themeKey
  }))

  const { theme, themeVars } = useResolvedPersonasTheme(themeSource)
  const studentName = computed(() => [primaryChild.value?.nombreA, primaryChild.value?.paternoA, primaryChild.value?.maternoA].filter(Boolean).join(' '))
  const studentPhoto = computed(() => normalizeVirtualAssetUrl(primaryChild.value?.foto || ''))

  return {
    session,
    sessionPending: sessionState.pending,
    people,
    peoplePending: peopleState.pending,
    peopleError: peopleState.error,
    refreshPeople: peopleState.refresh,
    ensurePeople: peopleState.ensure,
    children,
    primaryChild,
    studentName,
    studentPhoto,
    theme,
    themeVars
  }
}
