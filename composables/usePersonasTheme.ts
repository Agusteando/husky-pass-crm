import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useFetch } from 'nuxt/app'
import type { AuthorizedChild, AuthorizedPerson, PersonasTheme } from '~/types/daycare'
import type { PublicSession } from '~/types/session'
import { normalizeVirtualAssetUrl } from '~/utils/daycare'
import { personasThemeStyle, resolvePersonasTheme } from '~/utils/personasTheme'
import { normalizeMatricula } from '~/utils/matricula'

type PersonasThemeSource = Parameters<typeof resolvePersonasTheme>[0]
type FamilyThemeOptions = {
  key?: string
  selectedMatricula?: MaybeRefOrGetter<string | number | null | undefined>
  fallback?: MaybeRefOrGetter<PersonasThemeSource | null | undefined>
}

function childrenFromPeople(people?: AuthorizedPerson[] | null) {
  return people?.find((person) => person.children?.length)?.children || []
}

export function useResolvedPersonasTheme(source: MaybeRefOrGetter<PersonasThemeSource | null | undefined>) {
  const theme = computed<PersonasTheme>(() => resolvePersonasTheme(toValue(source) || {}))
  const themeVars = computed(() => personasThemeStyle(theme.value))
  return { theme, themeVars }
}

export function usePersonasFamilyTheme(options: FamilyThemeOptions = {}) {
  const key = options.key || 'default'
  const sessionState = useFetch<PublicSession>('/api/auth/me', { key: `pa-theme-session-${key}` })
  const peopleState = useFetch<AuthorizedPerson[]>('/api/personas-autorizadas/family', { key: `pa-theme-family-people-${key}`, timeout: 15000 })

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
    children,
    primaryChild,
    studentName,
    studentPhoto,
    theme,
    themeVars
  }
}
