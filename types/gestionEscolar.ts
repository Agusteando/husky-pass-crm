import type { AuthorizedChild } from './daycare'
import type { CommunicationAdminScopeInput } from './communications'

export type GestionEscolarCapability =
  | 'comunicados.create'
  | 'comunicados.publish'
  | 'encuestas.manage'
  | 'convenios.manage'
  | 'convenios.publish'
  | 'familias.view'
  | 'familias.impersonate'

export type GestionEscolarModuleKey = 'familias' | 'comunicados' | 'encuestas' | 'convenios'
export type GestionEscolarContentKind = 'encuesta' | 'convenio'
export type GestionEscolarContentStatus = 'draft' | 'active' | 'inactive' | 'scheduled'
export type GestionEscolarAssignmentState = 'none' | 'incomplete' | 'active'
export type GestionEscolarAccessProfileKey = 'support' | 'operator' | 'publisher' | 'content' | 'full' | 'custom'

export interface GestionEscolarScope {
  isGlobal?: boolean
  plantel?: string | null
  nivel?: string | null
  grado?: string | null
  grupo?: string | null
}

export interface GestionEscolarPermissionInput extends GestionEscolarScope {
  capability: GestionEscolarCapability
  enabled?: boolean
}

export interface GestionEscolarPermission extends Required<Omit<GestionEscolarPermissionInput, 'plantel' | 'nivel' | 'grado' | 'grupo'>> {
  id?: number
  userId: number
  plantel: string | null
  nivel: string | null
  grado: string | null
  grupo: string | null
  assignedBy?: number | null
  updatedBy?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface GestionEscolarReachPreview {
  families: number
  students: number
  planteles: string[]
  niveles: string[]
  grados: string[]
  grupos: string[]
}

export interface GestionEscolarScopeTreeNode {
  value: string
  label: string
  families: number
  students: number
  children?: GestionEscolarScopeTreeNode[]
}

export interface GestionEscolarScopeTree {
  planteles: GestionEscolarScopeTreeNode[]
}

export interface GestionEscolarPermissionSummary {
  enabled: boolean
  state: GestionEscolarAssignmentState
  profile: GestionEscolarAccessProfileKey
  capabilities: GestionEscolarCapability[]
  permissions: GestionEscolarPermission[]
  reach: GestionEscolarReachPreview
  legacyCommunications: CommunicationAdminScopeInput[]
  updatedAt?: string | null
}

export interface GestionEscolarModuleSummary {
  key: GestionEscolarModuleKey
  title: string
  description: string
  capabilities: GestionEscolarCapability[]
  enabled: boolean
  reach: GestionEscolarReachPreview
  metrics: Array<{ label: string; value: string | number }>
}

export interface GestionEscolarOverviewResponse {
  modules: GestionEscolarModuleSummary[]
  capabilities: GestionEscolarCapability[]
  permissions: GestionEscolarPermission[]
  reach: GestionEscolarReachPreview
  options: {
    planteles: string[]
    niveles: string[]
    grados: string[]
    grupos: string[]
    scopeTree: GestionEscolarScopeTree
  }
}

export interface GestionEscolarScopedContentItem extends GestionEscolarScope {
  id: string
  kind: GestionEscolarContentKind
  title: string
  summary: string
  url: string
  embedUrl?: string | null
  status: GestionEscolarContentStatus
  createdBy?: number | null
  updatedBy?: number | null
  publishedBy?: number | null
  createdAt: string
  updatedAt: string
  publishedAt?: string | null
  activeFrom?: string | null
  activeUntil?: string | null
  scopeLabel: string
  reach?: GestionEscolarReachPreview
}

export interface GestionEscolarScopedContentResponse {
  items: GestionEscolarScopedContentItem[]
  options: GestionEscolarOverviewResponse['options']
  permissions: {
    canManage: boolean
    canPublish: boolean
  }
}

export interface SaveGestionEscolarScopedContentInput extends GestionEscolarScope {
  id?: string
  kind: GestionEscolarContentKind
  title: string
  summary?: string
  url: string
  embedUrl?: string | null
  status?: GestionEscolarContentStatus
  activeFrom?: string | null
  activeUntil?: string | null
}

export interface FamilyScopedContentResponse {
  item: GestionEscolarScopedContentItem | null
  context: {
    student: AuthorizedChild | null
    scopeLabel: string
    resolution: 'exact' | 'grado' | 'nivel' | 'plantel' | 'global' | 'none'
  }
  state: 'ready' | 'empty' | 'unavailable'
  message?: string
}

export interface GestionEscolarFamilyRow {
  userId: number
  displayName: string
  email: string | null
  username: string | null
  studentName: string
  matricula: string | null
  plantel: string
  nivel: string | null
  grado: string | null
  grupo: string | null
  authorizedPeople: number
  parentStatus: 'active' | 'incomplete' | 'limited'
  contactSignals: string[]
  features: string[]
  canImpersonate: boolean
  recentActivity: string[]
}

export interface GestionEscolarFamiliesResponse {
  rows: GestionEscolarFamilyRow[]
  metrics: {
    families: number
    students: number
    withAuthorizedPeople: number
    canImpersonate: number
  }
  options: GestionEscolarOverviewResponse['options']
}

export interface GestionEscolarFamilyDetailResponse {
  family: GestionEscolarFamilyRow
  students: Array<{
    name: string
    matricula: string | null
    plantel: string
    nivel: string | null
    grado: string | null
    grupo: string | null
  }>
  authorizedPeople: Array<{
    id: number
    name: string
    relationship: string | null
    hasPhoto: boolean
  }>
  visibleContent: {
    encuesta: FamilyScopedContentResponse['item']
    convenio: FamilyScopedContentResponse['item']
  }
  supportPreview: Array<{ label: string; value: string }>
}

export interface GestionEscolarAuditRecord {
  id?: number
  eventId: string
  actorUserId: number
  targetUserId?: number | null
  action: string
  module?: string | null
  capability?: GestionEscolarCapability | null
  scope?: GestionEscolarScope | null
  metadata?: Record<string, unknown> | null
  createdAt?: string | null
}
