<template>
  <div v-if="session?.user" class="account-menu" :class="{ 'is-compact': props.presentation === 'compact' }" :data-account-kind="session.user.kind">
    <button class="account-trigger" type="button" data-diagnostic-action="abrir-menu-cuenta" :aria-expanded="open" :aria-label="`Abrir menu de cuenta de ${profileName}`" @click="open = !open">
      <img v-if="showPicture" :src="session.user.picture || ''" alt="" @error="pictureFailed = true" />
      <span v-else class="avatar">{{ initials }}</span>
      <span class="account-copy">
        <strong>{{ profileName }}</strong>
        <small>{{ profileDetail }}</small>
      </span>
      <FamilyPersonasIcon name="chevron" />
    </button>

    <div v-if="open" class="account-popover" role="menu">
      <div class="account-summary">
        <strong>{{ profileName }}</strong>
        <span>{{ profileDetail }}</span>
      </div>

      <NuxtLink v-if="securityTo" class="menu-item" :to="securityTo" role="menuitem" @click="open = false">
        <FamilyPersonasIcon name="security" />
        <span>Seguridad</span>
      </NuxtLink>

      <button v-if="session.user.impersonation" class="menu-item" type="button" role="menuitem" data-diagnostic-action="terminar-impersonacion" @click="exitImpersonation">
        <FamilyPersonasIcon name="arrow" />
        <span>Volver a admin</span>
      </button>

      <button class="menu-item danger" type="button" role="menuitem" data-diagnostic-action="logout" @click="logout">
        <FamilyPersonasIcon name="exit" />
        <span>Salir</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { navigateTo, useRoute } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import type { ExperienceName } from '~/types/identity'
import { defaultLoginRouteForExperience } from '~/utils/experienceIdentity'
import { displayMatriculaCandidate } from '~/utils/matricula'
import { anonymousSession, setCachedRouteSession } from '~/utils/routeSession'
import { defaultAdminRoute, effectiveAdminUser } from '~/utils/sessionScopes'
import { daycareScopeLabel } from '~/utils/daycare'

const props = withDefaults(defineProps<{
  session?: PublicSession | null
  experience: ExperienceName
  securityTo?: string
  presentation?: 'standard' | 'compact'
  profileName?: string | null
  profileDetail?: string | null
}>(), { presentation: 'standard', profileName: null, profileDetail: null })

const route = useRoute()
const open = ref(false)
const pictureFailed = ref(false)

const showPicture = computed(() => Boolean(props.session?.user?.picture && !pictureFailed.value))

const profileName = computed(() => props.profileName || props.session?.user?.displayName || displayMatriculaCandidate(props.session?.user?.username) || props.session?.user?.email || 'Usuario')
const profileDetail = computed(() => {
  if (props.profileDetail) return props.profileDetail
  const user = props.session?.user
  if (!user) return ''
  const admin = effectiveAdminUser(user)
  if (admin) return admin.isSuperAdmin ? 'Super Admin' : (admin.unidades[0] || 'Administración')
  if (props.experience === 'guarderia') return daycareScopeLabel(user.scopes.daycare, ' / ')
  return displayMatriculaCandidate(user.username) || user.email || 'Familia escolar'
})
watch(() => props.session?.user?.picture, () => {
  pictureFailed.value = false
})

const initials = computed(() => {
  const source = profileName.value || 'HP'
  return source.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
})

async function exitImpersonation() {
  open.value = false
  const impersonation = props.session?.user?.impersonation
  const target = impersonation?.admin ? defaultAdminRoute(impersonation.admin) : '/admin/daycare/salas'
  await $fetch('/api/auth/impersonation/exit', { method: 'POST' })
  setCachedRouteSession(null)
  await navigateTo(target)
}

async function logout() {
  open.value = false
  await $fetch('/api/auth/logout', { method: 'POST' })
  const user = props.session?.user
  const target = effectiveAdminUser(user)
    ? defaultLoginRouteForExperience('admin')
    : props.experience === 'guarderia' || route.path.startsWith('/familia/daycare')
      ? defaultLoginRouteForExperience('guarderia')
      : props.experience === 'escolar'
        ? defaultLoginRouteForExperience('escolar')
        : '/login'
  setCachedRouteSession(anonymousSession)
  await navigateTo(target)
}
</script>

<style scoped>
.account-menu {
  position: relative;
}

.account-trigger,
.menu-item {
  align-items: center;
  background: #fff;
  border: 1px solid #e3e8ec;
  color: var(--color-ink);
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  gap: 10px;
}

.account-trigger {
  box-shadow: 0 10px 28px rgba(26, 48, 72, 0.06);
  border-radius: 18px;
  min-height: 50px;
  min-width: clamp(178px, 22vw, 248px);
  padding: 5px 12px 5px 5px;
  transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
}

.account-trigger:hover,
.account-trigger[aria-expanded='true'] {
  border-color: rgba(var(--pa-primary-rgb, 22, 123, 131), .28);
  box-shadow: 0 12px 28px rgba(26, 48, 72, 0.1);
  transform: translateY(-1px);
}

.account-trigger img,
.avatar {
  border-radius: 14px;
  height: 40px;
  width: 40px;
}

.avatar {
  align-items: center;
  background: rgba(var(--pa-primary-rgb, 22, 123, 131), .09);
  border: 1px solid rgba(var(--pa-primary-rgb, 22, 123, 131), .18);
  color: var(--pa-primary, var(--color-brand-800));
  display: inline-flex;
  font-size: 0.76rem;
  font-weight: 800;
  justify-content: center;
}

.account-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
  text-align: left;
}

.account-copy strong,
.account-copy small {
  max-width: 168px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-copy strong {
  color: #26334b;
  font-size: 0.84rem;
}

.account-copy small {
  color: #717b8c;
  font-size: 0.7rem;
}

.account-trigger :deep(.pa-icon) {
  color: #7b8493;
  height: .92rem;
  width: .92rem;
}


.account-menu.is-compact .account-trigger {
  border-radius: 15px;
  min-height: 46px;
  min-width: 0;
  padding: 4px;
  width: 46px;
}

.account-menu.is-compact .account-copy,
.account-menu.is-compact .account-trigger > :deep(.pa-icon) {
  display: none;
}

.account-menu.is-compact .account-trigger img,
.account-menu.is-compact .avatar {
  border-radius: 12px;
  height: 36px;
  width: 36px;
}

.account-popover {
  background: #fff;
  border: 1px solid #e1e7eb;
  border-radius: 16px;
  box-shadow: 0 22px 48px rgba(15, 35, 58, 0.16);
  display: grid;
  gap: 5px;
  min-width: 250px;
  padding: 9px;
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  z-index: 40;
}

.account-summary {
  border-bottom: 1px solid #edf0f2;
  display: grid;
  gap: 3px;
  margin-bottom: 3px;
  padding: 8px 9px 11px;
}

.account-summary strong {
  color: #26334b;
}

.account-summary span {
  color: #717b8c;
  font-size: 0.76rem;
}

.menu-item {
  border-color: transparent;
  border-radius: 11px;
  justify-content: flex-start;
  min-height: 40px;
  padding: 0 10px;
  width: 100%;
}

.menu-item:hover {
  background: rgba(var(--pa-primary-rgb, 22, 123, 131), .08);
  color: var(--pa-primary, var(--color-brand-800));
}

.menu-item.danger:hover {
  background: #fff3f0;
  color: #9a3c35;
}

@media (max-width: 1040px) {
  .account-trigger {
    min-width: 0;
  }

  .account-copy small {
    display: none;
  }
}

@media (max-width: 860px) {
  .account-trigger {
    border-radius: 14px;
    min-height: 44px;
    min-width: 0;
    padding: 4px;
  }

  .account-trigger img,
  .avatar {
    border-radius: 11px;
    height: 34px;
    width: 34px;
  }

  .account-copy,
  .account-trigger > :deep(.pa-icon) {
    display: none;
  }
}
</style>
