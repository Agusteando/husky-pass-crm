
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T


export const AppTopbar: typeof import("../components/AppTopbar.vue")['default']
export const BrandMark: typeof import("../components/BrandMark.vue")['default']
export const EmptyState: typeof import("../components/EmptyState.vue")['default']
export const ExperienceLoginForm: typeof import("../components/ExperienceLoginForm.vue")['default']
export const LoginPanel: typeof import("../components/LoginPanel.vue")['default']
export const ResourceCard: typeof import("../components/ResourceCard.vue")['default']
export const AdminDaycareSidebar: typeof import("../components/admin/AdminDaycareSidebar.vue")['default']
export const AdminModuleTabs: typeof import("../components/admin/AdminModuleTabs.vue")['default']
export const AdminResourceModule: typeof import("../components/admin/AdminResourceModule.vue")['default']
export const AdminSalasCommandCenter: typeof import("../components/admin/AdminSalasCommandCenter.vue")['default']
export const AdminFamilyAccountEditor: typeof import("../components/admin/FamilyAccountEditor.vue")['default']
export const AdminResourceEditor: typeof import("../components/admin/ResourceEditor.vue")['default']
export const FamilyAuthorizedPersonEditor: typeof import("../components/family/AuthorizedPersonEditor.vue")['default']
export const FamilyResourceList: typeof import("../components/family/FamilyResourceList.vue")['default']
export const FamilySidebar: typeof import("../components/family/FamilySidebar.vue")['default']
export const FamilyPersonasAmbassador: typeof import("../components/family/PersonasAmbassador.vue")['default']
export const FamilyPersonasAutorizadasShell: typeof import("../components/family/PersonasAutorizadasShell.vue")['default']
export const FamilyPersonasIcon: typeof import("../components/family/PersonasIcon.vue")['default']
export const FamilyPersonasImageUpload: typeof import("../components/family/PersonasImageUpload.vue")['default']
export const FamilyPersonasModal: typeof import("../components/family/PersonasModal.vue")['default']
export const FamilyPersonasProcessedPhoto: typeof import("../components/family/PersonasProcessedPhoto.vue")['default']
export const FamilyPersonasTutorialVideo: typeof import("../components/family/PersonasTutorialVideo.vue")['default']
export const TopbarAccountMenu: typeof import("../components/topbar/AccountMenu.vue")['default']
export const TopbarAdminExperienceTopbar: typeof import("../components/topbar/AdminExperienceTopbar.vue")['default']
export const TopbarFamilyExperienceTopbar: typeof import("../components/topbar/FamilyExperienceTopbar.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const NuxtPage: typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const LazyAppTopbar: LazyComponent<typeof import("../components/AppTopbar.vue")['default']>
export const LazyBrandMark: LazyComponent<typeof import("../components/BrandMark.vue")['default']>
export const LazyEmptyState: LazyComponent<typeof import("../components/EmptyState.vue")['default']>
export const LazyExperienceLoginForm: LazyComponent<typeof import("../components/ExperienceLoginForm.vue")['default']>
export const LazyLoginPanel: LazyComponent<typeof import("../components/LoginPanel.vue")['default']>
export const LazyResourceCard: LazyComponent<typeof import("../components/ResourceCard.vue")['default']>
export const LazyAdminDaycareSidebar: LazyComponent<typeof import("../components/admin/AdminDaycareSidebar.vue")['default']>
export const LazyAdminModuleTabs: LazyComponent<typeof import("../components/admin/AdminModuleTabs.vue")['default']>
export const LazyAdminResourceModule: LazyComponent<typeof import("../components/admin/AdminResourceModule.vue")['default']>
export const LazyAdminSalasCommandCenter: LazyComponent<typeof import("../components/admin/AdminSalasCommandCenter.vue")['default']>
export const LazyAdminFamilyAccountEditor: LazyComponent<typeof import("../components/admin/FamilyAccountEditor.vue")['default']>
export const LazyAdminResourceEditor: LazyComponent<typeof import("../components/admin/ResourceEditor.vue")['default']>
export const LazyFamilyAuthorizedPersonEditor: LazyComponent<typeof import("../components/family/AuthorizedPersonEditor.vue")['default']>
export const LazyFamilyResourceList: LazyComponent<typeof import("../components/family/FamilyResourceList.vue")['default']>
export const LazyFamilySidebar: LazyComponent<typeof import("../components/family/FamilySidebar.vue")['default']>
export const LazyFamilyPersonasAmbassador: LazyComponent<typeof import("../components/family/PersonasAmbassador.vue")['default']>
export const LazyFamilyPersonasAutorizadasShell: LazyComponent<typeof import("../components/family/PersonasAutorizadasShell.vue")['default']>
export const LazyFamilyPersonasIcon: LazyComponent<typeof import("../components/family/PersonasIcon.vue")['default']>
export const LazyFamilyPersonasImageUpload: LazyComponent<typeof import("../components/family/PersonasImageUpload.vue")['default']>
export const LazyFamilyPersonasModal: LazyComponent<typeof import("../components/family/PersonasModal.vue")['default']>
export const LazyFamilyPersonasProcessedPhoto: LazyComponent<typeof import("../components/family/PersonasProcessedPhoto.vue")['default']>
export const LazyFamilyPersonasTutorialVideo: LazyComponent<typeof import("../components/family/PersonasTutorialVideo.vue")['default']>
export const LazyTopbarAccountMenu: LazyComponent<typeof import("../components/topbar/AccountMenu.vue")['default']>
export const LazyTopbarAdminExperienceTopbar: LazyComponent<typeof import("../components/topbar/AdminExperienceTopbar.vue")['default']>
export const LazyTopbarFamilyExperienceTopbar: LazyComponent<typeof import("../components/topbar/FamilyExperienceTopbar.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>

export const componentNames: string[]
