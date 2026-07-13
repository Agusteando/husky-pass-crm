<template>
  <main class="login-page" :style="identityVars" :data-experience="identity.context.experience">
    <section class="login-shell" aria-labelledby="login-title">
      <section class="brand-stage" :class="{ 'brand-stage--home': isBrandHome }" aria-label="Husky Pass">
        <div class="brand-stage__texture" aria-hidden="true" />
        <div class="brand-stage__halo brand-stage__halo--one" aria-hidden="true" />
        <div class="brand-stage__halo brand-stage__halo--two" aria-hidden="true" />

        <BrandMark class="brand-stage__logo" :to="brandTo" logo="/brand/husky-pass-logo.png" alt="Husky Pass" />

        <div class="brand-stage__copy">
          <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
          <h1 id="login-title">
            <template v-for="segment in heroTitleSegments" :key="segment.text">
              <span :class="{ accent: segment.accent }">{{ segment.text }}</span>
            </template>
          </h1>
          <p v-if="description" class="brand-stage__description">{{ description }}</p>
        </div>

        <div class="partner-pill" aria-label="IECS e IEDIS">
          <img src="/brand/iecs-wordmark-gradient.png" alt="IECS" />
          <span aria-hidden="true" />
          <img src="/brand/iedis-wordmark-gradient.png" alt="IEDIS" />
        </div>
      </section>

      <section class="login-card" aria-label="Inicio de sesión">
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
  eyebrow?: string
  title: string
  description?: string
  experience?: ExperienceName
  institution?: InstitutionName
}>(), {
  eyebrow: '',
  description: '',
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
const isBrandHome = computed(() => props.title.trim().toLowerCase() === 'husky pass' && !props.description)
const heroTitleSegments = computed(() => {
  if (props.title.trim().toLowerCase() === 'husky pass') {
    return [
      { text: 'Husky', accent: false },
      { text: 'Pass', accent: true }
    ]
  }

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
  background:
    radial-gradient(circle at 8% 0%, rgba(255, 255, 255, 0.96), transparent 28%),
    radial-gradient(circle at 96% 5%, rgba(213, 232, 192, 0.55), transparent 30%),
    linear-gradient(150deg, #f8faf5 0%, #edf3e8 100%);
  display: grid;
  min-height: 100vh;
  padding: clamp(18px, 3vw, 34px);
  place-items: center;
}

.login-shell {
  background: #fff;
  border: 1px solid rgba(215, 225, 208, 0.92);
  border-radius: clamp(26px, 2.4vw, 36px);
  box-shadow:
    0 36px 100px rgba(32, 58, 30, 0.14),
    0 2px 0 rgba(255, 255, 255, 0.9) inset;
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(410px, 0.88fr);
  max-width: 1420px;
  min-height: min(88vh, 880px);
  overflow: hidden;
  position: relative;
  width: min(100%, 1420px);
}

.brand-stage {
  background:
    linear-gradient(105deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.16)),
    url('/brand/husky-pass-login-ambient.png') center / cover no-repeat;
  display: grid;
  grid-template-rows: auto 1fr auto;
  isolation: isolate;
  min-height: 680px;
  overflow: hidden;
  padding: clamp(38px, 5vw, 72px);
  position: relative;
}

.brand-stage::after {
  background: linear-gradient(90deg, transparent 82%, rgba(255, 255, 255, 0.52));
  content: '';
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: -1;
}

.brand-stage__texture {
  background-image: radial-gradient(circle, rgba(35, 97, 136, 0.12) 1.2px, transparent 1.3px);
  background-size: 18px 18px;
  height: 150px;
  left: 9%;
  mask-image: linear-gradient(90deg, #000, transparent);
  opacity: 0.42;
  pointer-events: none;
  position: absolute;
  top: 48%;
  width: 260px;
  z-index: -1;
}

.brand-stage__halo {
  border: 1px solid rgba(35, 97, 136, 0.09);
  border-radius: 999px;
  pointer-events: none;
  position: absolute;
  z-index: -1;
}

.brand-stage__halo--one {
  height: 380px;
  left: -220px;
  top: 26%;
  width: 380px;
}

.brand-stage__halo--two {
  height: 280px;
  left: -170px;
  top: calc(26% + 50px);
  width: 280px;
}

.brand-stage__logo,
.brand-stage__copy,
.partner-pill {
  position: relative;
  z-index: 1;
}

.brand-stage__logo :deep(.brand-logo) {
  filter: drop-shadow(0 12px 20px rgba(26, 50, 24, 0.09));
  width: clamp(130px, 12vw, 178px);
}

.brand-stage__copy {
  align-self: center;
  max-width: 620px;
  padding-bottom: 2vh;
}

.brand-stage__copy .eyebrow {
  color: var(--color-blue);
  font-size: 0.72rem;
  letter-spacing: 0.3em;
  margin-bottom: 18px;
}

.brand-stage__copy h1 {
  color: #203349;
  font-family: var(--font-body);
  font-size: clamp(4rem, 7.2vw, 7.2rem);
  letter-spacing: -0.06em;
  line-height: 0.82;
  margin: 0;
  text-wrap: balance;
}

.brand-stage__copy h1 span {
  display: block;
}

.brand-stage__copy h1 .accent {
  color: var(--color-blue);
  margin-top: 0.1em;
}

.brand-stage:not(.brand-stage--home) .brand-stage__copy h1 {
  font-size: clamp(2.8rem, 5.2vw, 5.4rem);
  line-height: 0.94;
}

.brand-stage__description {
  color: #53665b;
  font-size: clamp(1rem, 1.25vw, 1.24rem);
  line-height: 1.52;
  margin-top: 24px;
  max-width: 520px;
}

.partner-pill {
  align-items: center;
  align-self: end;
  backdrop-filter: blur(18px);
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 999px;
  box-shadow: 0 14px 32px rgba(40, 73, 40, 0.08);
  display: inline-flex;
  gap: 15px;
  justify-self: start;
  padding: 12px 18px;
}

.partner-pill img {
  height: clamp(25px, 2.3vw, 34px);
  object-fit: contain;
  width: auto;
}

.partner-pill > span {
  background: rgba(64, 91, 63, 0.18);
  height: 24px;
  width: 1px;
}

.login-card {
  align-items: center;
  background:
    radial-gradient(circle at 50% 0%, rgba(243, 248, 237, 0.88), transparent 31%),
    linear-gradient(180deg, #ffffff 0%, #fbfcf9 100%);
  border-left: 1px solid rgba(219, 228, 213, 0.9);
  display: grid;
  padding: clamp(34px, 4.6vw, 76px);
  position: relative;
}

.login-card::before {
  background: linear-gradient(180deg, var(--color-brand-300), rgba(35, 97, 136, 0.42), transparent);
  content: '';
  height: 140px;
  left: -1px;
  opacity: 0.45;
  position: absolute;
  top: 0;
  width: 1px;
}

@media (max-width: 980px) {
  .login-page {
    padding: 12px;
  }

  .login-shell {
    grid-template-columns: 1fr;
    max-width: 760px;
  }

  .brand-stage {
    min-height: 280px;
    padding: 28px 32px;
  }

  .brand-stage__copy {
    padding: 20px 0 10px;
  }

  .brand-stage__copy h1 {
    font-size: clamp(3.2rem, 11vw, 5.6rem);
  }

  .brand-stage__description {
    font-size: 1rem;
    margin-top: 14px;
  }

  .partner-pill {
    position: absolute;
    bottom: 28px;
    right: 30px;
  }

  .login-card {
    border-left: 0;
    border-top: 1px solid rgba(219, 228, 213, 0.9);
    padding: 38px clamp(24px, 7vw, 64px) 46px;
  }

  .login-card::before {
    height: 1px;
    left: 0;
    top: -1px;
    width: 140px;
  }
}

@media (max-width: 560px) {
  .login-page {
    padding: 0;
  }

  .login-shell {
    border: 0;
    border-radius: 0;
    min-height: 100vh;
  }

  .brand-stage {
    min-height: 214px;
    padding: 24px;
  }

  .brand-stage__logo :deep(.brand-logo) {
    width: 108px;
  }

  .brand-stage__copy {
    padding: 16px 0 0;
  }

  .brand-stage__copy .eyebrow {
    display: none;
  }

  .brand-stage__copy h1,
  .brand-stage:not(.brand-stage--home) .brand-stage__copy h1 {
    font-size: clamp(2.65rem, 15vw, 4.2rem);
  }

  .brand-stage__description,
  .partner-pill {
    display: none;
  }

  .login-card {
    padding: 32px 20px 40px;
  }
}
</style>
