
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

interface _GlobalComponents {
  AppTopbar: typeof import("../../components/AppTopbar.vue")['default']
  BrandMark: typeof import("../../components/BrandMark.vue")['default']
  EmptyState: typeof import("../../components/EmptyState.vue")['default']
  ExperienceLoginForm: typeof import("../../components/ExperienceLoginForm.vue")['default']
  LoginPanel: typeof import("../../components/LoginPanel.vue")['default']
  ResourceCard: typeof import("../../components/ResourceCard.vue")['default']
  AdminDaycareSidebar: typeof import("../../components/admin/AdminDaycareSidebar.vue")['default']
  AdminModuleTabs: typeof import("../../components/admin/AdminModuleTabs.vue")['default']
  AdminResourceModule: typeof import("../../components/admin/AdminResourceModule.vue")['default']
  AdminSalasCommandCenter: typeof import("../../components/admin/AdminSalasCommandCenter.vue")['default']
  AdminFamilyAccountEditor: typeof import("../../components/admin/FamilyAccountEditor.vue")['default']
  AdminResourceEditor: typeof import("../../components/admin/ResourceEditor.vue")['default']
  FamilyAuthorizedPersonEditor: typeof import("../../components/family/AuthorizedPersonEditor.vue")['default']
  FamilyResourceList: typeof import("../../components/family/FamilyResourceList.vue")['default']
  FamilySidebar: typeof import("../../components/family/FamilySidebar.vue")['default']
  FamilyPersonasAmbassador: typeof import("../../components/family/PersonasAmbassador.vue")['default']
  FamilyPersonasAutorizadasShell: typeof import("../../components/family/PersonasAutorizadasShell.vue")['default']
  FamilyPersonasIcon: typeof import("../../components/family/PersonasIcon.vue")['default']
  FamilyPersonasImageUpload: typeof import("../../components/family/PersonasImageUpload.vue")['default']
  FamilyPersonasModal: typeof import("../../components/family/PersonasModal.vue")['default']
  FamilyPersonasProcessedPhoto: typeof import("../../components/family/PersonasProcessedPhoto.vue")['default']
  FamilyPersonasTutorialVideo: typeof import("../../components/family/PersonasTutorialVideo.vue")['default']
  TopbarAccountMenu: typeof import("../../components/topbar/AccountMenu.vue")['default']
  TopbarAdminExperienceTopbar: typeof import("../../components/topbar/AdminExperienceTopbar.vue")['default']
  TopbarFamilyExperienceTopbar: typeof import("../../components/topbar/FamilyExperienceTopbar.vue")['default']
  NuxtWelcome: typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']
  NuxtLayout: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  NuxtErrorBoundary: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  ClientOnly: typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']
  DevOnly: typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']
  ServerPlaceholder: typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']
  NuxtLink: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']
  NuxtLoadingIndicator: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  NuxtTime: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  NuxtRouteAnnouncer: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  NuxtImg: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
  NuxtPicture: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
  NuxtPage: typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']
  NoScript: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']
  Link: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']
  Base: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']
  Title: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']
  Meta: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']
  Style: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']
  Head: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']
  Html: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']
  Body: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']
  NuxtIsland: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']
  LazyAppTopbar: LazyComponent<typeof import("../../components/AppTopbar.vue")['default']>
  LazyBrandMark: LazyComponent<typeof import("../../components/BrandMark.vue")['default']>
  LazyEmptyState: LazyComponent<typeof import("../../components/EmptyState.vue")['default']>
  LazyExperienceLoginForm: LazyComponent<typeof import("../../components/ExperienceLoginForm.vue")['default']>
  LazyLoginPanel: LazyComponent<typeof import("../../components/LoginPanel.vue")['default']>
  LazyResourceCard: LazyComponent<typeof import("../../components/ResourceCard.vue")['default']>
  LazyAdminDaycareSidebar: LazyComponent<typeof import("../../components/admin/AdminDaycareSidebar.vue")['default']>
  LazyAdminModuleTabs: LazyComponent<typeof import("../../components/admin/AdminModuleTabs.vue")['default']>
  LazyAdminResourceModule: LazyComponent<typeof import("../../components/admin/AdminResourceModule.vue")['default']>
  LazyAdminSalasCommandCenter: LazyComponent<typeof import("../../components/admin/AdminSalasCommandCenter.vue")['default']>
  LazyAdminFamilyAccountEditor: LazyComponent<typeof import("../../components/admin/FamilyAccountEditor.vue")['default']>
  LazyAdminResourceEditor: LazyComponent<typeof import("../../components/admin/ResourceEditor.vue")['default']>
  LazyFamilyAuthorizedPersonEditor: LazyComponent<typeof import("../../components/family/AuthorizedPersonEditor.vue")['default']>
  LazyFamilyResourceList: LazyComponent<typeof import("../../components/family/FamilyResourceList.vue")['default']>
  LazyFamilySidebar: LazyComponent<typeof import("../../components/family/FamilySidebar.vue")['default']>
  LazyFamilyPersonasAmbassador: LazyComponent<typeof import("../../components/family/PersonasAmbassador.vue")['default']>
  LazyFamilyPersonasAutorizadasShell: LazyComponent<typeof import("../../components/family/PersonasAutorizadasShell.vue")['default']>
  LazyFamilyPersonasIcon: LazyComponent<typeof import("../../components/family/PersonasIcon.vue")['default']>
  LazyFamilyPersonasImageUpload: LazyComponent<typeof import("../../components/family/PersonasImageUpload.vue")['default']>
  LazyFamilyPersonasModal: LazyComponent<typeof import("../../components/family/PersonasModal.vue")['default']>
  LazyFamilyPersonasProcessedPhoto: LazyComponent<typeof import("../../components/family/PersonasProcessedPhoto.vue")['default']>
  LazyFamilyPersonasTutorialVideo: LazyComponent<typeof import("../../components/family/PersonasTutorialVideo.vue")['default']>
  LazyTopbarAccountMenu: LazyComponent<typeof import("../../components/topbar/AccountMenu.vue")['default']>
  LazyTopbarAdminExperienceTopbar: LazyComponent<typeof import("../../components/topbar/AdminExperienceTopbar.vue")['default']>
  LazyTopbarFamilyExperienceTopbar: LazyComponent<typeof import("../../components/topbar/FamilyExperienceTopbar.vue")['default']>
  LazyNuxtWelcome: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  LazyNuxtLayout: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  LazyNuxtErrorBoundary: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  LazyClientOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']>
  LazyDevOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']>
  LazyServerPlaceholder: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  LazyNuxtLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  LazyNuxtTime: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  LazyNuxtImg: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
  LazyNuxtPicture: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
  LazyNuxtPage: LazyComponent<typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']>
  LazyNoScript: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  LazyLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']>
  LazyBase: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']>
  LazyTitle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']>
  LazyMeta: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']>
  LazyStyle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']>
  LazyHead: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']>
  LazyHtml: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']>
  LazyBody: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']>
  LazyNuxtIsland: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
