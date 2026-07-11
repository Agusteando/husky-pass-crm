<template>
  <section class="school-banner" :data-tone="tone">
    <div class="banner-copy">
      <p class="banner-eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p v-if="subtitle" class="banner-subtitle">{{ subtitle }}</p>
      <div v-if="$slots.actions" class="banner-actions"><slot name="actions" /></div>
    </div>

    <div class="banner-visual" aria-hidden="true">
      <span class="human-ambassador"><img :src="humanSrc" alt="" /></span>
      <img class="husky-ambassador" :src="mascotSrc" alt="" />
    </div>

    <div v-if="$slots.stats" class="banner-stats"><slot name="stats" /></div>

    <nav class="school-tabs" aria-label="Control Escolar">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="{ active: isActive(item.to) }"
      >
        <FamilyPersonasIcon :name="item.icon" />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'nuxt/app'
import type { GestionEscolarModuleKey } from '~/types/gestionEscolar'
import { useGestionEscolarOverview } from '~/composables/useGestionEscolarOverview'

const props = withDefaults(defineProps<{
  eyebrow?: string
  title: string
  subtitle?: string
  tone?: 'teal' | 'blue' | 'amber' | 'coral'
  ambassador?: 'preescolar' | 'primaria' | 'secundaria'
}>(), {
  eyebrow: 'Control Escolar',
  subtitle: '',
  tone: 'teal',
  ambassador: 'primaria'
})

const route = useRoute()
const { data } = useGestionEscolarOverview()
const moduleMap: Record<GestionEscolarModuleKey, { label: string; to: string; icon: string }> = {
  familias: { label: 'Familias', to: '/admin/gestion-escolar/familias', icon: 'people' },
  comunicados: { label: 'Comunicados', to: '/admin/gestion-escolar/comunicados', icon: 'announcement' },
  encuestas: { label: 'Encuestas', to: '/admin/gestion-escolar/encuestas', icon: 'survey' },
  convenios: { label: 'Convenios', to: '/admin/gestion-escolar/convenios', icon: 'handshake' }
}

const navItems = computed(() => {
  const enabled = new Set((data.value?.modules || []).filter((module) => module.enabled).map((module) => module.key))
  return [
    { label: 'Inicio', to: '/admin/gestion-escolar', icon: 'home' },
    ...(['familias', 'comunicados', 'encuestas', 'convenios'] as GestionEscolarModuleKey[])
      .filter((key) => enabled.has(key))
      .map((key) => moduleMap[key])
  ]
})

const mascotSrc = computed(() => `/personas-autorizadas/ambassadors/${props.ambassador === 'preescolar' ? 'preescolar-joy' : props.ambassador === 'secundaria' ? 'secundaria-hope' : 'primaria-brave'}.png`)
const humanSrc = computed(() => props.ambassador === 'primaria' ? '/marbete/sample-person.svg' : '/marbete/sample-student.svg')

function isActive(to: string) {
  if (to === '/admin/gestion-escolar') return route.path === to
  return route.path.startsWith(to)
}
</script>

<style scoped>
.school-banner {
  --banner-accent: #0a8178;
  --banner-accent-deep: #075d58;
  --banner-warm: #f5b94d;
  background:
    radial-gradient(circle at 14% 20%, color-mix(in srgb, var(--banner-accent) 18%, transparent), transparent 34%),
    radial-gradient(circle at 88% 8%, color-mix(in srgb, var(--banner-warm) 28%, transparent), transparent 30%),
    linear-gradient(135deg, rgba(255,255,255,.98), rgba(248,252,247,.96));
  border: 1px solid color-mix(in srgb, var(--banner-accent) 20%, transparent);
  border-radius: 30px;
  box-shadow: 0 28px 76px rgba(23, 51, 64, .11);
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 360px);
  min-height: 238px;
  overflow: hidden;
  padding: clamp(24px, 3vw, 42px) clamp(22px, 3.5vw, 48px) 0;
  position: relative;
}

.school-banner[data-tone='blue'] { --banner-accent: #2d759e; --banner-accent-deep: #205a7d; --banner-warm: #82c7dc; }
.school-banner[data-tone='amber'] { --banner-accent: #b57418; --banner-accent-deep: #87530b; --banner-warm: #ffd36f; }
.school-banner[data-tone='coral'] { --banner-accent: #b85b52; --banner-accent-deep: #8e403a; --banner-warm: #f4a885; }

.banner-copy { align-self: center; min-width: 0; padding-bottom: 78px; position: relative; z-index: 2; }
.banner-eyebrow { color: var(--banner-accent-deep); font-size: .74rem; font-weight: 900; letter-spacing: .15em; margin: 0 0 8px; text-transform: uppercase; }
.banner-copy h1 { color: #14253a; font-family: var(--font-title, var(--font-body)); font-size: clamp(2.35rem, 5vw, 4.9rem); letter-spacing: -.045em; line-height: .92; margin: 0; max-width: 760px; }
.banner-subtitle { color: #667487; font-size: clamp(.96rem, 1.4vw, 1.08rem); font-weight: 700; margin: 14px 0 0; max-width: 620px; }
.banner-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }

.banner-visual { align-self: end; height: 220px; min-width: 0; position: relative; }
.husky-ambassador { bottom: -18px; filter: drop-shadow(0 18px 20px rgba(30, 52, 46, .16)); height: 224px; object-fit: contain; position: absolute; right: 2%; width: 190px; z-index: 2; }
.human-ambassador { background: #fff; border: 7px solid rgba(255,255,255,.86); border-radius: 999px 999px 26px 26px; bottom: 20px; box-shadow: 0 18px 38px rgba(28, 54, 67, .12); height: 146px; overflow: hidden; position: absolute; right: 42%; transform: rotate(-4deg); width: 118px; }
.human-ambassador img { height: 100%; object-fit: cover; width: 100%; }

.banner-stats { bottom: 78px; display: flex; flex-wrap: wrap; gap: 9px; left: clamp(22px, 3.5vw, 48px); position: absolute; z-index: 3; }
.banner-stats :deep(span) { backdrop-filter: blur(10px); background: rgba(255,255,255,.78); border: 1px solid rgba(255,255,255,.9); border-radius: 999px; color: #34475a; font-size: .78rem; font-weight: 850; padding: 8px 12px; }

.school-tabs { align-self: end; backdrop-filter: blur(18px); background: rgba(255,255,255,.76); border: 1px solid rgba(255,255,255,.94); border-radius: 18px 18px 0 0; bottom: 0; display: flex; gap: 5px; grid-column: 1 / -1; left: clamp(14px, 2vw, 28px); overflow-x: auto; padding: 7px; position: absolute; right: clamp(14px, 2vw, 28px); z-index: 5; }
.school-tabs a { align-items: center; border-radius: 12px; color: #617084; display: inline-flex; flex: 0 0 auto; font-size: .82rem; font-weight: 850; gap: 7px; min-height: 43px; padding: 0 14px; text-decoration: none; }
.school-tabs a.active { background: var(--banner-accent-deep); box-shadow: 0 10px 22px color-mix(in srgb, var(--banner-accent) 24%, transparent); color: #fff; }
.school-tabs :deep(svg) { height: 18px; width: 18px; }

@media (max-width: 820px) {
  .school-banner { grid-template-columns: minmax(0, 1fr) 170px; min-height: 220px; padding-right: 18px; }
  .banner-copy { padding-bottom: 70px; }
  .banner-visual { height: 190px; }
  .husky-ambassador { height: 185px; right: -18px; width: 155px; }
  .human-ambassador { height: 112px; right: 55%; width: 88px; }
  .banner-stats { display: none; }
}

@media (max-width: 600px) {
  .school-banner { border-radius: 24px; grid-template-columns: 1fr; min-height: 250px; padding: 22px 18px 0; }
  .banner-copy { padding-bottom: 78px; padding-right: 92px; }
  .banner-copy h1 { font-size: clamp(2.25rem, 12vw, 3.5rem); }
  .banner-subtitle { display: none; }
  .banner-visual { bottom: 55px; height: 130px; pointer-events: none; position: absolute; right: 0; width: 130px; }
  .husky-ambassador { bottom: -8px; height: 140px; right: -20px; width: 122px; }
  .human-ambassador { bottom: 2px; border-width: 4px; display: block; height: 70px; right: 58%; width: 54px; }
  .school-tabs { left: 8px; right: 8px; }
  .school-tabs a { min-height: 42px; padding: 0 12px; }
  .school-tabs a span { font-size: .76rem; }
}
</style>
