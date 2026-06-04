export interface Sala {
  id: number
  sala: string
  unidad: string
}

export interface DaycareResource {
  id?: number
  starred?: number | boolean | null
  hidden?: number | boolean | string | null
  title: string
  description?: string | null
  date?: string | null
  timestamp?: string | null
  resource?: string | null
  autor?: string | null
  html?: string | null
  unidad: string
  sala: string | number
  type: 'hw' | 'news' | 'cal'
}

export interface FamilyAccount {
  id?: number
  nombre_nino?: string | null
  username: string
  email: string
  plaintext?: string | null
  role?: string | null
  unidad: string
  sala: string | number
}

export interface AuthorizedChild {
  id?: number | null
  paternoA?: string | null
  maternoA?: string | null
  nombreA?: string | null
  grupo?: string | null
  grado?: string | null
  nivelEdu?: string | null
  campus?: string | null
  plantel?: string | null
  matricula?: string | null
  foto?: string | null
  fechaA?: string | null
  user_id?: number | null
}

export interface AuthorizedPerson {
  indice: number
  id?: number | null
  qr?: string | null
  paternoP?: string | null
  maternoP?: string | null
  nombreP?: string | null
  parenP?: string | null
  foto?: string | null
  compressed_foto?: string | null
  fechaP?: string | null
  user_id?: number | null
  children?: AuthorizedChild[]
}

export interface PrintableAuthorizedPerson extends AuthorizedPerson {
  nivelEdu?: string | null
  plantel?: string | null
  matricula?: string | null
  fullnameA?: string | null
  fotoA?: string | null
  gradoA?: string | null
  grupoA?: string | null
  child?: AuthorizedChild | null
}

export interface ScanAuthorizedPerson {
  fullnameP: string | null
  fotoP: string | null
  fullnameA: string | null
  fotoA: string | null
  gradoA: string | null
  grupoA: string | null
  parentesco: string | null
  matricula: string | null
  plantel: string | null
  nivelEduA: string | null
}

export interface SalaMetrics {
  familias: number
  tareas: number
  avisos: number
  calendario: number
  totalRecursos: number
  lastResourceAt?: string | null
}

export interface SalaSummary extends Sala {
  metrics: SalaMetrics
}

export interface SalaOverview {
  sala: Sala
  metrics: SalaMetrics
  latestResources: DaycareResource[]
  latestFamilies: FamilyAccount[]
}

export type PersonasThemeKey = 'daycare' | 'preescolar' | 'primaria' | 'secundaria' | 'iedis'

export interface PersonasTheme {
  key: PersonasThemeKey
  label: string
  shortLabel?: string
  englishLabel?: string
  primary: string
  contrast: string
  soft: string
  border: string
  muted: string
  gray: string
  institutional: string
  mascot?: string
}

export interface MarbeteTemplateMeta {
  id: string
  name: string
  filename: string
  themeKey: PersonasThemeKey
  nivel: string
  planteles: string[]
  color: string
  isDefault?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface MarbeteTemplateListResponse {
  templates: MarbeteTemplateMeta[]
  themes: PersonasTheme[]
}

export interface RenderedMarbeteResponse {
  template: MarbeteTemplateMeta
  theme: PersonasTheme
  svg: string
  downloadName: string
}

export interface PersonasSurveyConfig {
  enabled: boolean
  title: string
  embedUrl: string
  updatedAt?: string
  updatedBy?: string | null
}

export interface PersonasAutorizadasConfig {
  survey: PersonasSurveyConfig
  conveniosUrl: string
  helpUrl?: string
  updatedAt?: string
  updatedBy?: string | null
}

export interface PersonasReadinessIssue {
  key: 'missingAuthorizedPeople' | 'missingRequiredStudentData' | 'missingPrintableReadiness' | 'missingParentAccess' | 'blocked'
  label: string
}

export interface PersonasReadinessRow {
  userId: number
  displayName: string
  email: string | null
  username: string | null
  contact: string | null
  plantel: string
  nivel: string
  grado: string | null
  grupo: string | null
  studentName: string
  familyLabel: string
  authorizedCount: number
  hasStudentData: boolean
  hasPrintableReadiness: boolean
  hasParentAccess: boolean
  status: 'complete' | 'incomplete' | 'blocked'
  issues: PersonasReadinessIssue[]
  templateId: string | null
  templateName: string | null
  theme: PersonasTheme
  lastAccessActionAt?: string | null
}

export interface PersonasReadinessResponse {
  rows: PersonasReadinessRow[]
  planteles: string[]
  niveles: string[]
  metrics: {
    total: number
    complete: number
    incomplete: number
    blocked: number
    missingAuthorizedPeople: number
    missingRequiredStudentData: number
    missingPrintableReadiness: number
    missingParentAccess: number
  }
  filters: {
    plantel: string
    nivel: string
    status: string
    search: string
    limit: number
  }
}
