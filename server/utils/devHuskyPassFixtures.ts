import type { MarbeteTemplateMeta, PersonasThemeKey, PrintableAuthorizedPerson } from '~/types/daycare'
import { selectMarbeteTemplate } from '~/server/utils/marbeteTemplates'

export interface DevHuskyPassVariant {
  id: string
  label: string
  themeKey: PersonasThemeKey
  nivelEdu: string
  plantel: string
  matricula: string
  grado: string
  grupo: string
  expectedTemplateId: string
}

export interface DevHuskyPassScenario {
  id: string
  label: string
  description: string
  imageMode: 'portrait' | 'wide' | 'tall' | 'transparent' | 'large' | 'slow'
  longName?: boolean
  missingOptional?: boolean
}

export const DEV_HUSKY_PASS_VARIANTS: DevHuskyPassVariant[] = [
  {
    id: 'guarderia-cm',
    label: 'Guarderia / CM',
    themeKey: 'daycare',
    nivelEdu: 'guarderia',
    plantel: 'CM',
    matricula: 'DM240001',
    grado: 'Maternal',
    grupo: 'A',
    expectedTemplateId: 'guarderia-default'
  },
  {
    id: 'preescolar-preem',
    label: 'Preescolar / PREEM',
    themeKey: 'preescolar',
    nivelEdu: 'preescolar',
    plantel: 'PREEM',
    matricula: 'PREEM240001',
    grado: 'Kinder 2',
    grupo: 'B',
    expectedTemplateId: 'preescolar-2024'
  },
  {
    id: 'primaria-pt',
    label: 'Primaria / PT',
    themeKey: 'primaria',
    nivelEdu: 'primaria',
    plantel: 'PT',
    matricula: 'PT240001',
    grado: '4',
    grupo: 'C',
    expectedTemplateId: 'primaria-2024'
  },
  {
    id: 'primaria-pm',
    label: 'Primaria / PM',
    themeKey: 'primaria',
    nivelEdu: 'primaria',
    plantel: 'PM',
    matricula: 'PM240001',
    grado: '5',
    grupo: 'A',
    expectedTemplateId: 'primaria-2024'
  },
  {
    id: 'secundaria-st',
    label: 'Secundaria / ST',
    themeKey: 'secundaria',
    nivelEdu: 'secundaria',
    plantel: 'ST',
    matricula: 'ST240001',
    grado: '2',
    grupo: 'D',
    expectedTemplateId: 'secundaria-2024'
  },
  {
    id: 'secundaria-sm',
    label: 'Secundaria / SM',
    themeKey: 'secundaria',
    nivelEdu: 'secundaria',
    plantel: 'SM',
    matricula: 'SM240001',
    grado: '3',
    grupo: 'B',
    expectedTemplateId: 'secundaria-2024'
  }
]

export const DEV_HUSKY_PASS_SCENARIOS: DevHuskyPassScenario[] = [
  {
    id: 'default',
    label: 'Completo',
    description: 'Datos completos, imagen vertical y URL absoluta.',
    imageMode: 'portrait'
  },
  {
    id: 'long-name',
    label: 'Nombre largo',
    description: 'Acentos, apellidos compuestos y nombre largo.',
    imageMode: 'portrait',
    longName: true
  },
  {
    id: 'missing-optional',
    label: 'Opcional faltante',
    description: 'Sin apellido materno ni fecha de alta.',
    imageMode: 'portrait',
    missingOptional: true
  },
  {
    id: 'wide-photo',
    label: 'Foto horizontal',
    description: 'Imagen con aspecto inusual para validar recorte.',
    imageMode: 'wide'
  },
  {
    id: 'transparent-photo',
    label: 'Transparente',
    description: 'Imagen SVG transparente sobre el marco del pase.',
    imageMode: 'transparent'
  },
  {
    id: 'large-photo',
    label: 'Archivo grande',
    description: 'SVG grande para validar inlining y repeticion.',
    imageMode: 'large'
  },
  {
    id: 'slow-photo',
    label: 'Imagen lenta',
    description: 'Respuesta diferida para validar timeout tolerante.',
    imageMode: 'slow'
  }
]

export function devHuskyPassVariant(id?: string | null) {
  return DEV_HUSKY_PASS_VARIANTS.find((variant) => variant.id === id) || DEV_HUSKY_PASS_VARIANTS[0]
}

export function devHuskyPassScenario(id?: string | null) {
  return DEV_HUSKY_PASS_SCENARIOS.find((scenario) => scenario.id === id) || DEV_HUSKY_PASS_SCENARIOS[0]
}

export function devHuskyPassPhotoUrl(origin: string, variant: DevHuskyPassVariant, scenario: DevHuskyPassScenario, person = false) {
  const url = new URL('/api/dev/husky-pass/photo', origin)
  url.searchParams.set('seed', `${variant.id}-${scenario.id}-${person ? 'person' : 'student'}`)
  url.searchParams.set('label', person ? 'PA' : 'AL')
  url.searchParams.set('theme', variant.themeKey)
  url.searchParams.set('mode', scenario.imageMode)
  if (scenario.imageMode === 'slow') url.searchParams.set('delay', '1400')
  if (scenario.imageMode === 'large') url.searchParams.set('large', '1')
  if (scenario.imageMode === 'transparent') url.searchParams.set('transparent', '1')
  return url.toString()
}

export function buildDevPrintableAuthorizedPerson(input: {
  origin: string
  variantId?: string | null
  scenarioId?: string | null
}) {
  const variant = devHuskyPassVariant(input.variantId)
  const scenario = devHuskyPassScenario(input.scenarioId)
  const longName = scenario.longName
  const missingOptional = scenario.missingOptional
  const personPhoto = devHuskyPassPhotoUrl(input.origin, variant, scenario, true)
  const studentPhoto = devHuskyPassPhotoUrl(input.origin, variant, scenario, false)
  const data: PrintableAuthorizedPerson = {
    id: 9000 + DEV_HUSKY_PASS_VARIANTS.findIndex((item) => item.id === variant.id),
    indice: 1,
    qr: `DEV-${variant.id}-${scenario.id}`,
    paternoP: longName ? 'De la Luz Santillan' : 'Lopez',
    maternoP: missingOptional ? '' : longName ? 'Fernandez del Campo' : 'Garcia',
    nombreP: longName ? 'Maria Jose de los Angeles' : 'Sofia',
    parenP: longName ? 'Tutora autorizada' : 'Tia',
    foto: personPhoto,
    compressed_foto: personPhoto,
    fechaP: missingOptional ? '' : '2026-08-19',
    user_id: 7001,
    nivelEdu: variant.nivelEdu,
    plantel: variant.plantel,
    matricula: variant.matricula,
    fullnameA: longName ? 'Emiliano Sebastian Alvarez de la Torre' : 'Valentina Perez Ramos',
    fotoA: studentPhoto,
    gradoA: variant.grado,
    grupoA: variant.grupo,
    child: {
      id: 7001,
      nombreA: longName ? 'Emiliano Sebastian' : 'Valentina',
      paternoA: longName ? 'Alvarez de la Torre' : 'Perez',
      maternoA: 'Ramos',
      nivelEdu: variant.nivelEdu,
      plantel: variant.plantel,
      matricula: variant.matricula,
      grado: variant.grado,
      grupo: variant.grupo,
      foto: studentPhoto,
      isCurrent: true
    }
  }

  return { data, variant, scenario }
}

export function selectDevHuskyPassTemplate(templates: MarbeteTemplateMeta[], variant: DevHuskyPassVariant) {
  return selectMarbeteTemplate(templates, {
    matricula: variant.matricula,
    plantel: variant.plantel,
    nivelEdu: variant.nivelEdu,
    themeKey: variant.themeKey
  })
}
