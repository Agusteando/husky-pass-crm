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
  resource?: string | null
  autor?: string | null
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
