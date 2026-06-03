export interface Sala {
  id: number
  sala: string
  unidad: string
}

export interface DaycareResource {
  id?: number
  starred?: number | boolean | null
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
