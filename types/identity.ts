import type { AppSessionUser } from './session'

export type ExperienceName = 'escolar' | 'guarderia' | 'admin'
export type InstitutionName = 'iecs' | 'iedis' | null

export interface ExperienceContext {
  experience: ExperienceName
  institution: InstitutionName
  nivel: string | null
  plantel: string | null
  grupo: string | null
}

export interface ExperienceContextInput {
  requestedExperience?: string | null
  routePath?: string | null
  user?: AppSessionUser | null
  matricula?: string | number | null
  institution?: string | null
  nivel?: string | null
  nivelEdu?: string | null
  plantel?: string | null
  campus?: string | null
  grupo?: string | null
}

export interface ExperienceResolution {
  context: ExperienceContext
  status: 'resolved' | 'neutral' | 'blocked'
  reason: string
  missing: string[]
  conflict: string | null
}

export interface ExperienceAssets {
  logo: string
  wordmark?: string | null
  huskyLogo: string
  ambassador?: string | null
  mascotVariants?: Partial<Record<'header' | 'hero' | 'empty' | 'help' | 'preview' | 'transition', string>>
  emailLogo?: string | null
  documentLogo?: string | null
}

export interface ExperienceVisualIdentity {
  key: string
  officialName: 'Experiencia Escolar' | 'Experiencia Guardería' | 'Experiencia Administrativa'
  context: ExperienceContext
  label: string
  shortLabel: string
  levelLabel: string
  primary: string
  contrast: string
  soft: string
  border: string
  muted: string
  gray: string
  institutional: string
  surface: string
  page: string
  assets: ExperienceAssets
  allowedAssetFamilies: string[]
}
