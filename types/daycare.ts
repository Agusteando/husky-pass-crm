export interface Sala {
  id: number
  sala: string
  unidad: string
}


export type DaycareMediaKind = 'image' | 'pdf' | 'document' | 'spreadsheet' | 'text' | 'unknown'

export interface DaycareMediaMetadata {
  version?: 1
  name?: string | null
  mime?: string | null
  size?: number | null
  width?: number | null
  height?: number | null
  alt?: string | null
  caption?: string | null
  focalX?: number | null
  focalY?: number | null
}

export interface DaycareMediaAsset extends DaycareMediaMetadata {
  url: string
  kind: DaycareMediaKind
  extension: string
  aspectRatio?: number | null
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


export type DaycareRosterMovement = 'same' | 'forward' | 'backward' | 'different'

export interface DaycareRosterSuggestion {
  state: 'matched' | 'not-found' | 'room-changed'
  childName?: string | null
  tutorName?: string | null
  tutorEmail?: string | null
  salaName?: string | null
  targetSalaId?: number | null
  targetSalaName?: string | null
  movement?: DaycareRosterMovement
  childDifferent?: boolean
  lastUpdatedAt?: string | null
  sourceSheet?: string | null
}

export interface DaycareRosterEntry {
  sourceSheet: string
  tutorBusinessName?: string | null
  tutorName?: string | null
  tutorEmail: string
  tutorPhone?: string | null
  tutorAddress?: string | null
  childName?: string | null
  salaName?: string | null
  normalizedEmail: string
  normalizedChildName?: string | null
  normalizedSala?: string | null
  authorizedPeople?: string | null
  lastUpdatedAt?: string | null
  targetSalaId?: number | null
  targetSalaName?: string | null
}

export interface DaycareRosterDiagnostics extends Record<string, unknown> {
  sourceUrl?: string | null
  configuredByEnv?: boolean
  fetchedAt?: string | null
  durationMs?: number | null
  sheetCount?: number
  totalRows?: number
  mappedEntries?: number
  requiredColumns?: string[]
  missingColumnsBySheet?: Array<{ sheet: string; missing: string[] }>
  unidad?: {
    value: string
    key: string
    matchedSheets: string[]
    unmatchedSheets: string[]
  }
  sala?: {
    current: string
    platformSalas: string[]
    sourceSalas: string[]
    matchedSourceSalas: string[]
    unmatchedSourceSalas: string[]
  }
  accounts?: {
    localRows: number
    matchedByEmail: number
    sourceOnly: number
    roomChanges: number
  }
  assumptions?: string[]
  lastError?: string | null
}

export interface DaycareRosterOverlay {
  available: boolean
  sourceState?: 'connected' | 'unavailable'
  sourceMessage?: string | null
  summary: {
    inSala: number
    confirmed: number
    linked: number
    pending: number
    moved: number
  }
  sourceOnly: DaycareRosterEntry[]
  sourceUpdatedAt?: string | null
  diagnostics?: DaycareRosterDiagnostics | null
}

export interface FamilyAccount {
  id?: number
  nombre_nino?: string | null
  username: string
  email: string
  plaintext?: string | null
  roster?: DaycareRosterSuggestion | null
  role?: string | null
  unidad: string
  sala: string | number
}


export interface DaycareRoomMember extends FamilyAccount {
  id: number
  salaId: number
  salaName: string
  relatedRecords: number
  authorizedPeople: number
  linkedStudents: number
}

export interface DaycareRoomManagementStats {
  total: number
  assigned: number
}

export interface DaycareRoomConfirmationStatus {
  salaId: number
  salaName: string
  local: number
  confirmed: number
  total: number
}

export interface DaycareRoomManagementRosterStatus {
  available: boolean
  confirmed: number
  total: number
  rooms: DaycareRoomConfirmationStatus[]
  sourceUpdatedAt?: string | null
}

export interface DaycareRoomManagementOverview {
  unidad: string
  unidades: string[]
  salas: Sala[]
  members: DaycareRoomMember[]
  stats: DaycareRoomManagementStats
  roster: DaycareRoomManagementRosterStatus
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
  isCurrent?: boolean
  canSwitch?: boolean
  siblingMatch?: 'parents' | 'current' | 'unavailable' | 'review'
  siblingDiagnostics?: Record<string, unknown>
  parentName?: string | null
  parentRole?: 'Madre' | 'Padre' | 'Tutor' | null
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
  cicloEscolar?: string | null
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
  confirmation?: {
    available: boolean
    confirmed: number
    total: number
  }
}

export interface SalaOverview {
  sala: Sala
  metrics: SalaMetrics
  latestResources: DaycareResource[]
  latestFamilies: FamilyAccount[]
}

export type PersonasThemeKey = 'escolar' | 'daycare' | 'iecs' | 'preescolar' | 'primaria' | 'secundaria' | 'iedis' | 'admin'

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
  mascotVariants?: Partial<Record<'header' | 'hero' | 'empty' | 'help' | 'preview' | 'transition', string>>
  logo?: string
  wordmark?: string
}

export type MarbeteTemplateSource = 'bundled-svg' | 'custom'

export interface MarbeteTemplateMeta {
  id: string
  name: string
  filename: string
  url?: string
  themeKey: PersonasThemeKey
  nivel: string
  planteles: string[]
  color: string
  isDefault?: boolean
  mode?: MarbeteTemplateMode
  status?: MarbeteTemplateStatus
  cicloEscolar?: string
  visualDesign?: MarbeteVisualDesign
  svgDesign?: MarbeteSvgDesign
  basedOnId?: string
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
  source?: MarbeteTemplateSource
}

export type MarbeteTemplateMode = 'legacy-svg' | 'visual'

export type MarbeteTemplateStatus = 'draft' | 'published'

export type MarbeteVisualElementKind =
  | 'person-photo'
  | 'student-photo'
  | 'qr'
  | 'authorized-name'
  | 'relationship'
  | 'student-name'
  | 'school-detail'
  | 'validity'
  | 'ciclo-tag'

export type MarbeteSvgLayerKind =
  | MarbeteVisualElementKind
  | 'authorized-surnames'
  | 'authorized-given-name'
  | 'hologram'
  | 'cover'
  | 'static-image'

export interface MarbeteVisualTextStyle {
  fontSize: number
  fontWeight: 500 | 600 | 700 | 800
  color: string
  align: 'left' | 'center' | 'right'
  lineHeight: number
  uppercase?: boolean
}

export interface MarbeteVisualImageStyle {
  fit: 'cover' | 'contain'
  focalX: number
  focalY: number
  borderRadius: number
  borderWidth: number
  borderColor: string
}

export interface MarbeteVisualElement {
  id: string
  kind: MarbeteVisualElementKind
  label: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  visible: boolean
  zIndex: number
  textStyle?: MarbeteVisualTextStyle
  imageStyle?: MarbeteVisualImageStyle
}

export interface MarbeteVisualDesign {
  version: 1
  canvas: {
    width: 420
    height: 640
  }
  background: {
    url: string
    color: string
    fit: 'cover' | 'contain'
  }
  elements: MarbeteVisualElement[]
  showInstructions: boolean
}

export interface MarbeteSvgLayer {
  id: string
  kind: MarbeteSvgLayerKind
  label: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  visible: boolean
  zIndex: number
  textStyle?: MarbeteVisualTextStyle
  imageStyle?: MarbeteVisualImageStyle
  fill?: string
  opacity?: number
  assetUrl?: string
  origin?: 'base' | 'overlay'
  removed?: boolean
  aspectRatioLocked?: boolean
}

export interface MarbeteSvgDesign {
  version: 1
  canvas: {
    width: number
    height: number
  }
  layers: MarbeteSvgLayer[]
}

export interface MarbeteTemplateSettings {
  customTemplatesEnabled: boolean
  updatedAt?: string
  updatedBy?: string | null
}

export interface MarbeteTemplateListResponse {
  templates: MarbeteTemplateMeta[]
  themes: PersonasTheme[]
  settings: MarbeteTemplateSettings
}

export interface RenderedMarbeteResponse {
  template: MarbeteTemplateMeta
  theme: PersonasTheme
  svg: string
  downloadName: string
}

export interface MarbeteReadinessResponse {
  ok: boolean
  issues: string[]
  template?: MarbeteTemplateMeta | null
  themeKey?: PersonasThemeKey | null
  downloadName?: string
}


export interface PersonasStudentReadonly {
  matricula?: string | null
  plantel?: string | null
  nivel?: string | null
  grado?: string | null
  grupo?: string | null
  ciclo?: string | null
  servicio?: string | null
  baja?: string | number | null
  status?: string | null
  foto?: string | null
  updated_at?: string | null
}

export interface PersonasStudentEditable {
  curp?: string | null
  nombres?: string | null
  apellido_paterno?: string | null
  apellido_materno?: string | null
  fecha_nacimiento?: string | null
  lugar_nacimiento?: string | null
  sexo?: string | null
  talla?: string | null
  peso?: string | null
  tipo_sangre?: string | null
  alergias?: string | null
  nombre_padre?: string | null
  apellido_paterno_padre?: string | null
  apellido_materno_padre?: string | null
  lugar_trabajo_padre?: string | null
  puesto_padre?: string | null
  email_padre?: string | null
  telefono_padre?: string | null
  estado_civil_padre?: string | null
  fecha_nacimiento_padre?: string | null
  curp_padre?: string | null
  ine_padre?: string | null
  nombre_madre?: string | null
  apellido_paterno_madre?: string | null
  apellido_materno_madre?: string | null
  lugar_trabajo_madre?: string | null
  puesto_madre?: string | null
  email_madre?: string | null
  telefono_madre?: string | null
  estado_civil_madre?: string | null
  fecha_nacimiento_madre?: string | null
  curp_madre?: string | null
  ine_madre?: string | null
  domicilio_calle?: string | null
  domicio_num?: string | null
  domicilio_colonia?: string | null
  domicilio_cp?: string | null
  domicilio_municipio?: string | null
}

export interface PersonasStudentProfile {
  readonly: PersonasStudentReadonly
  editable: PersonasStudentEditable
  allowedFields: string[]
  meta?: {
    updatedAt?: string | null
  }
}

export interface PersonasSurveyConfig {
  enabled: boolean
  title: string
  embedUrl: string
  updatedAt?: string
  updatedBy?: string | null
}

export type PersonasSurveyNivelKey = 'escolar' | 'preescolar' | 'primaria' | 'secundaria' | 'daycare'

export interface PersonasAutorizadasConfig {
  survey: PersonasSurveyConfig
  surveysByNivel?: Record<PersonasSurveyNivelKey, PersonasSurveyConfig>
  activeSurvey?: PersonasSurveyConfig
  activeSurveyNivel?: PersonasSurveyNivelKey | null
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
