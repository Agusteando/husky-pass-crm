export interface MktEnrollmentSchoolYear {
  value: string
  label: string
}

export interface MktEnrollmentPlantel {
  code: string
  label: string
  level: 'daycare' | 'preescolar' | 'primaria' | 'secundaria'
  hasData: boolean
}

export interface MktEnrollmentOptionsResponse {
  planteles: MktEnrollmentPlantel[]
  schoolYears: MktEnrollmentSchoolYear[]
  defaultPlantel: string
  defaultCiclo: string
  connected: boolean
  connection?: {
    status: 'online' | 'degraded'
    message: string
  }
  generatedAt: string
}

export interface MktEnrollmentCompletenessTier {
  progress?: number
  total?: number
  complete?: number
  missingFields?: string[]
  missingLabels?: string[]
}

export interface MktEnrollmentStudent {
  matricula: string
  studentId?: string
  fullName: string
  nombreCompleto?: string
  nombres?: string
  apellidoPaterno?: string
  apellidoMaterno?: string
  curp?: string
  plantel: string
  nivel?: string
  grado?: string
  group?: string
  grupo?: string
  status?: string
  enrollmentState?: string
  tipoIngreso?: string
  tipoIngresoValue?: string
  photoUrl?: string
  foto?: string
  updatedAt?: string | null
  overlayExists?: boolean
  missingFields?: string[]
  missingLabels?: string[]
  completenessTiers?: {
    basic?: MktEnrollmentCompletenessTier
    complete?: MktEnrollmentCompletenessTier
  }
  fatherName?: string
  nombrePadre?: string
  apellidoPaternoPadre?: string
  apellidoMaternoPadre?: string
  telefonoPadre?: string
  emailPadre?: string
  motherName?: string
  nombreMadre?: string
  apellidoPaternoMadre?: string
  apellidoMaternoMadre?: string
  telefonoMadre?: string
  emailMadre?: string
  guardianName?: string
  phone?: string
  email?: string
  address?: string
  direccion?: string
  domicilioCalle?: string
  domicilioNumero?: string
  domicilioNum?: string
  domicilioColonia?: string
  domicilioCp?: string
  domicilioMunicipio?: string
  lugarNacimiento?: string
  fechaNacimiento?: string
  sexo?: string
  talla?: string
  peso?: string
  tipoSangre?: string
  alergias?: string
  lugarTrabajoPadre?: string
  puestoPadre?: string
  estadoCivilPadre?: string
  fechaNacimientoPadre?: string
  inePadre?: string
  curpPadre?: string
  lugarTrabajoMadre?: string
  puestoMadre?: string
  estadoCivilMadre?: string
  fechaNacimientoMadre?: string
  ineMadre?: string
  curpMadre?: string
  servicio?: string
  servicioNotas?: string
  tipoIngresoSource?: string
  tipoIngresoReason?: string
  display?: {
    nombre?: string
    gradoGrupo?: string
    plantelNivel?: string
    estado?: string
    ciclo?: string
  }
  padre?: {
    nombreCompleto?: string
    nombres?: string
    apellidoPaterno?: string
    apellidoMaterno?: string
    telefono?: string
    correo?: string
  }
  madre?: {
    nombreCompleto?: string
    nombres?: string
    apellidoPaterno?: string
    apellidoMaterno?: string
    telefono?: string
    correo?: string
  }
  contactoPrincipal?: {
    nombre?: string
    telefono?: string
    correo?: string
  }
  [key: string]: unknown
}

export interface MktEnrollmentCatalogs {
  niveles: string[]
  grados: string[]
  grupos: string[]
  gruposPorGrado: Record<string, string[]>
}

export interface MktEnrollmentGroupSummary {
  grupo: string
  interno: number
  externo: number
  total: number
}

export interface MktEnrollmentGradeSummary {
  grado: string
  interno: number
  externo: number
  total: number
  grupos: MktEnrollmentGroupSummary[]
}

export interface MktEnrollmentKpis {
  totalVisible: number
  totalInscritos: number
  inscritos: number
  activos: number
  bajas: number
  noInscritos: number
  internos: number
  externos: number
  expedientesCompletos: number
  expedientesIncompletos: number
  sinContacto: number
  sinFichaMatricula: number
  porNivel: Array<{ label: string; total: number }>
  porGrupo: Array<{ label: string; total: number }>
  porGrado: MktEnrollmentGradeSummary[]
  [key: string]: unknown
}

export interface MktEnrollmentStudentsResponse {
  data: MktEnrollmentStudent[]
  pagination: {
    limit: number
    nextCursor: string | null
    total: number
  }
  catalogs: MktEnrollmentCatalogs
  kpis: MktEnrollmentKpis | null
  meta: {
    source?: string
    freshness?: string
    plantel?: string
    ciclo?: string
    generatedAt?: string | null
    staleAfter?: string | null
    expiresAt?: string | null
    [key: string]: unknown
  }
}

export interface MktEnrollmentStudentResponse {
  data: MktEnrollmentStudent
  meta?: Record<string, unknown>
}

export interface MktEnrollmentStudentPatch {
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  curp: string
  lugarNacimiento: string
  sexo: string
  talla: string
  peso: string
  tipoSangre: string
  alergias: string
  nombrePadre: string
  apellidoPaternoPadre: string
  apellidoMaternoPadre: string
  telefonoPadre: string
  emailPadre: string
  lugarTrabajoPadre: string
  puestoPadre: string
  estadoCivilPadre: string
  fechaNacimientoPadre: string
  inePadre: string
  curpPadre: string
  nombreMadre: string
  apellidoPaternoMadre: string
  apellidoMaternoMadre: string
  telefonoMadre: string
  emailMadre: string
  lugarTrabajoMadre: string
  puestoMadre: string
  estadoCivilMadre: string
  fechaNacimientoMadre: string
  ineMadre: string
  curpMadre: string
  direccion: string
  domicilioCalle: string
  domicilioNumero: string
  domicilioColonia: string
  domicilioCp: string
  domicilioMunicipio: string
  servicio: string
  servicioNotas: string
}

export type MktEnrollmentParentPatch = MktEnrollmentStudentPatch

