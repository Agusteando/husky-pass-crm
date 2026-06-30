<template>
  <main class="login-page" :style="identityVars" :data-experience="identity.context.experience">
    <section class="login-shell" aria-labelledby="login-title">
      <section class="login-hero" aria-label="Husky Pass">
        <div class="hero-glass" />
        <BrandMark class="hero-brand" :to="brandTo" logo="/brand/husky-pass-logo.png" alt="Husky Pass" />
        <div class="hero-copy">
          <p class="eyebrow">{{ eyebrow }}</p>
          <h1 id="login-title"><template v-for="segment in heroTitleSegments" :key="segment.text"><span :class="{ accent: segment.accent }">{{ segment.text }}</span></template></h1>
          <p>{{ description }}</p>
        </div>
        <div class="hero-partners" aria-label="IECS e IEDIS">
          <img src="/brand/iecs-wordmark-gradient.png" alt="IECS" />
          <span class="partner-knot" aria-hidden="true"><span /><span /></span>
          <img src="/brand/iedis-wordmark-gradient.png" alt="IEDIS" />
        </div>
      </section>
      <section class="login-card" aria-label="Acceso">
        <slot />
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ExperienceName, InstitutionName } from '~/types/identity'
import { experienceThemeVars, visualIdentityForContext } from '~/utils/experienceIdentity'

const props = withDefaults(defineProps<{
  brandTo: string
  eyebrow: string
  title: string
  description: string
  experience?: ExperienceName
  institution?: InstitutionName
}>(), {
  experience: 'escolar',
  institution: null
})

const identity = computed(() => visualIdentityForContext({
  experience: props.experience,
  institution: props.experience === 'escolar' ? props.institution : null,
  nivel: null,
  plantel: null,
  grupo: null
}))
const identityVars = computed(() => experienceThemeVars(identity.value))
const heroTitleSegments = computed(() => {
  const marker = 'Husky Pass'
  const index = props.title.indexOf(marker)
  if (index < 0) return [{ text: props.title, accent: false }]
  return [
    { text: props.title.slice(0, index), accent: false },
    { text: marker, accent: true },
    { text: props.title.slice(index + marker.length), accent: false }
  ].filter((segment) => segment.text)
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 4%, rgba(255, 255, 255, 0.92), transparent 24%),
    radial-gradient(circle at 92% 8%, rgba(221, 235, 202, 0.55), transparent 28%),
    linear-gradient(180deg, #fbfcf9 0%, #f1f6ec 100%);
  display: grid;
  place-items: center;
  padding: clamp(18px, 3.2vw, 36px);
}

.login-shell {
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(223, 232, 215, 0.96);
  border-radius: clamp(22px, 2.2vw, 30px);
  box-shadow: 0 24px 72px rgba(31, 61, 20, 0.12), 0 1px 0 rgba(255, 255, 255, 0.92) inset;
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(360px, 0.82fr);
  max-width: 1380px;
  min-height: min(82vh, 840px);
  overflow: hidden;
  position: relative;
  width: min(100%, 1380px);
}

.login-hero {
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.58), rgba(255, 255, 255, 0.18)),
    url('/brand/husky-pass-login-ambient.png') center / cover no-repeat;
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 660px;
  overflow: hidden;
  padding: clamp(38px, 5vw, 72px);
  position: relative;
}

.hero-glass {
  background:
    radial-gradient(circle at 78% 66%, rgba(10, 113, 132, 0.2), transparent 26%),
    radial-gradient(circle at 82% 88%, rgba(88, 139, 39, 0.22), transparent 30%);
  inset: 0;
  opacity: 0.7;
  pointer-events: none;
  position: absolute;
}

.hero-brand,
.hero-copy,
.hero-partners {
  position: relative;
  z-index: 1;
}

.hero-brand :deep(.brand-logo) {
  filter: drop-shadow(0 10px 18px rgba(29, 76, 22, 0.08));
  width: clamp(134px, 13vw, 188px);
}

.hero-copy {
  align-self: center;
  max-width: 650px;
  transform: translateY(8%);
}

.hero-copy .eyebrow {
  color: var(--color-blue);
  font-size: clamp(0.78rem, 1vw, 0.9rem);
  letter-spacing: 0.42em;
  margin-bottom: 22px;
}

.hero-copy h1 {
  color: var(--color-brand-900);
  font-size: clamp(3.4rem, 7vw, 6.6rem);
  line-height: 0.94;
  letter-spacing: -0.045em;
  margin-bottom: 22px;
  text-wrap: balance;
}

.hero-copy h1 span {
  display: block;
}

.hero-copy h1 .accent {
  color: var(--color-blue);
}

.hero-copy p:last-child {
  color: #526352;
  font-size: clamp(1.05rem, 1.45vw, 1.42rem);
  line-height: 1.38;
  max-width: 620px;
}

.hero-partners {
  align-items: end;
  display: flex;
  gap: clamp(10px, 1.6vw, 18px);
  margin-top: 28px;
}

.hero-partners img {
  filter: drop-shadow(0 8px 14px rgba(16, 52, 25, 0.06));
  height: clamp(38px, 4vw, 58px);
  object-fit: contain;
  width: auto;
}

.partner-knot {
  display: grid;
  height: 66px;
  margin-inline: -2px;
  place-items: center;
  position: relative;
  width: 42px;
}

.partner-knot span {
  border-radius: 999px;
  display: block;
  height: 56px;
  position: absolute;
  transform-origin: center;
  width: 16px;
}

.partner-knot span:first-child {
  background: linear-gradient(180deg, var(--color-brand-700), var(--color-blue));
  transform: rotate(42deg);
}

.partner-knot span:last-child {
  background: linear-gradient(180deg, var(--color-blue), var(--color-brand-600));
  transform: rotate(-42deg);
}

.login-card {
  align-items: center;
  background:
    radial-gradient(circle at 50% 10%, rgba(242, 248, 234, 0.98), transparent 25%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(252, 254, 249, 0.98));
  border-left: 1px solid rgba(223, 232, 215, 0.88);
  display: grid;
  padding: clamp(30px, 4.4vw, 70px);
}

@media (max-width: 960px) {
  .login-page {
    padding: 12px;
  }

  .login-shell {
    grid-template-columns: 1fr;
  }

  .login-hero {
    min-height: 360px;
    padding: 30px;
  }

  .hero-copy {
    transform: none;
  }

  .hero-copy h1 {
    font-size: clamp(2.8rem, 12vw, 4.5rem);
  }

  .login-card {
    border-left: 0;
    border-top: 1px solid rgba(223, 232, 215, 0.88);
    padding: 28px;
  }
}

@media (max-width: 560px) {
  .login-shell {
    border-radius: 22px;
  }

  .login-hero {
    min-height: 310px;
    padding: 24px;
  }

  .hero-copy .eyebrow {
    letter-spacing: 0.26em;
    margin-bottom: 12px;
  }

  .hero-copy p:last-child {
    font-size: 0.98rem;
  }

  .hero-partners img {
    height: 34px;
  }

  .partner-knot {
    height: 40px;
    width: 26px;
  }

  .partner-knot span {
    height: 36px;
    width: 10px;
  }

  .login-card {
    padding: 22px;
  }
}
</style>
