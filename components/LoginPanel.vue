<template>
  <main class="login-page" :style="identityVars" :data-experience="identity.context.experience">
    <section class="login-shell" aria-labelledby="login-title">
      <section class="brand-stage" :class="{ 'brand-stage--home': isBrandHome }" aria-label="Husky Pass">
        <div class="brand-stage__texture" aria-hidden="true" />
        <div class="brand-stage__wash brand-stage__wash--iecs" aria-hidden="true" />
        <div class="brand-stage__wash brand-stage__wash--iedis" aria-hidden="true" />

        <BrandMark class="brand-stage__logo" :to="brandTo" logo="/brand/husky-pass-logo.png" alt="Husky Pass" />

        <div v-if="isBrandHome" class="brand-stage__art" aria-hidden="true">
          <span class="brand-gateway brand-gateway--outer" />
          <span class="brand-gateway brand-gateway--middle" />
          <span class="brand-gateway brand-gateway--inner" />
          <span class="brand-gateway__bridge" />
        </div>

        <div v-else class="brand-stage__copy">
          <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
          <h1 id="login-title">
            <template v-for="segment in heroTitleSegments" :key="segment.text">
              <span :class="{ accent: segment.accent }">{{ segment.text }}</span>
            </template>
          </h1>
          <p v-if="description" class="brand-stage__description">{{ description }}</p>
        </div>
        <h1 v-if="isBrandHome" id="login-title" class="sr-only">Husky Pass</h1>

        <div class="partner-lockup" aria-label="IECS e IEDIS">
          <div class="partner-lockup__brand">
            <img src="/brand/iecs-wordmark-gradient.png" alt="IECS" />
          </div>
          <span class="partner-lockup__join" aria-hidden="true"><span /><span /></span>
          <div class="partner-lockup__brand">
            <img src="/brand/iedis-wordmark-gradient.png" alt="IEDIS" />
          </div>
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
  --login-iecs: #2f7d54;
  --login-iedis: #007f92;
  background:
    radial-gradient(circle at 8% 0%, rgba(255, 255, 255, 0.98), transparent 28%),
    radial-gradient(circle at 95% 5%, rgba(47, 125, 84, 0.12), transparent 31%),
    radial-gradient(circle at 80% 92%, rgba(0, 127, 146, 0.08), transparent 32%),
    linear-gradient(150deg, #fbfcf9 0%, #f0f5ec 100%);
  display: grid;
  min-height: 100vh;
  padding: clamp(18px, 3vw, 34px);
  place-items: center;
}

.login-shell {
  background: #fff;
  border: 1px solid rgba(205, 221, 210, 0.94);
  border-radius: clamp(26px, 2.4vw, 36px);
  box-shadow:
    0 36px 100px rgba(39, 80, 54, 0.13),
    0 2px 0 rgba(255, 255, 255, 0.94) inset;
  display: grid;
  grid-template-columns: minmax(0, 1.13fr) minmax(410px, 0.87fr);
  max-width: 1420px;
  min-height: min(88vh, 880px);
  overflow: hidden;
  position: relative;
  width: min(100%, 1420px);
}

.brand-stage {
  background:
    linear-gradient(108deg, rgba(255, 255, 255, 0.76), rgba(255, 255, 255, 0.08)),
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
  background: linear-gradient(90deg, transparent 80%, rgba(255, 255, 255, 0.7));
  content: '';
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: -1;
}

.brand-stage__texture {
  background-image: radial-gradient(circle, rgba(47, 125, 84, 0.13) 1.15px, transparent 1.25px);
  background-size: 18px 18px;
  height: 170px;
  left: 8%;
  mask-image: linear-gradient(90deg, #000, transparent);
  opacity: 0.4;
  pointer-events: none;
  position: absolute;
  top: 43%;
  width: 280px;
  z-index: -1;
}

.brand-stage__wash {
  border-radius: 999px;
  filter: blur(1px);
  opacity: 0.13;
  pointer-events: none;
  position: absolute;
  z-index: -1;
}

.brand-stage__wash--iecs {
  background: var(--login-iecs);
  height: 430px;
  left: -310px;
  top: 18%;
  width: 430px;
}

.brand-stage__wash--iedis {
  background: var(--login-iedis);
  bottom: -280px;
  height: 520px;
  left: 18%;
  width: 520px;
}

.brand-stage__logo,
.brand-stage__art,
.brand-stage__copy,
.partner-lockup {
  position: relative;
  z-index: 1;
}

.brand-stage__logo :deep(.brand-logo) {
  filter: drop-shadow(0 12px 20px rgba(26, 50, 24, 0.09));
  width: clamp(130px, 12vw, 178px);
}

.brand-stage__art {
  align-self: center;
  height: clamp(300px, 34vw, 470px);
  justify-self: center;
  margin-right: 5%;
  position: relative;
  width: clamp(300px, 34vw, 470px);
}

.brand-gateway {
  border: clamp(3px, 0.32vw, 5px) solid;
  border-bottom: 0;
  border-radius: 50% 50% 0 0 / 38% 38% 0 0;
  bottom: 10%;
  position: absolute;
}

.brand-gateway--outer {
  border-color: rgba(47, 125, 84, 0.26);
  height: 82%;
  left: 3%;
  width: 94%;
}

.brand-gateway--middle {
  border-color: rgba(0, 127, 146, 0.35);
  height: 67%;
  left: 17%;
  width: 66%;
}

.brand-gateway--inner {
  border-color: rgba(47, 125, 84, 0.48);
  height: 50%;
  left: 30%;
  width: 40%;
}

.brand-gateway__bridge {
  background: linear-gradient(90deg, var(--login-iecs), #4d9560 42%, #168b88 62%, var(--login-iedis));
  border-radius: 999px;
  bottom: calc(10% - 3px);
  box-shadow: 0 10px 28px rgba(29, 112, 94, 0.16);
  height: 6px;
  left: 3%;
  opacity: 0.82;
  position: absolute;
  width: 94%;
}

.brand-stage__copy {
  align-self: center;
  max-width: 620px;
  padding-bottom: 2vh;
}

.brand-stage__copy .eyebrow {
  color: var(--login-iedis);
  font-size: 0.72rem;
  letter-spacing: 0.3em;
  margin-bottom: 18px;
}

.brand-stage__copy h1 {
  color: #294238;
  font-family: var(--font-body);
  font-size: clamp(2.8rem, 5.2vw, 5.4rem);
  letter-spacing: -0.055em;
  line-height: 0.94;
  margin: 0;
  text-wrap: balance;
}

.brand-stage__copy h1 span {
  display: block;
}

.brand-stage__copy h1 .accent {
  color: var(--login-iedis);
}

.brand-stage__description {
  color: #5c6f64;
  font-size: clamp(1rem, 1.25vw, 1.22rem);
  line-height: 1.52;
  margin-top: 24px;
  max-width: 520px;
}

.partner-lockup {
  align-items: center;
  align-self: end;
  display: flex;
  gap: clamp(12px, 1.5vw, 18px);
  justify-self: start;
}

.partner-lockup__brand {
  align-items: center;
  backdrop-filter: blur(15px);
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(255, 255, 255, 0.88);
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(37, 80, 53, 0.07);
  display: flex;
  min-height: 56px;
  padding: 10px 15px;
}

.partner-lockup__brand img {
  height: clamp(27px, 2.5vw, 37px);
  object-fit: contain;
  width: auto;
}

.partner-lockup__join {
  display: grid;
  height: 42px;
  place-items: center;
  position: relative;
  width: 28px;
}

.partner-lockup__join span {
  border-radius: 999px;
  height: 36px;
  position: absolute;
  width: 8px;
}

.partner-lockup__join span:first-child {
  background: var(--login-iecs);
  transform: rotate(43deg);
}

.partner-lockup__join span:last-child {
  background: var(--login-iedis);
  transform: rotate(-43deg);
}

.login-card {
  align-items: center;
  background:
    radial-gradient(circle at 15% 0%, rgba(47, 125, 84, 0.07), transparent 29%),
    radial-gradient(circle at 100% 95%, rgba(0, 127, 146, 0.055), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #fbfdfb 100%);
  border-left: 1px solid rgba(207, 222, 211, 0.92);
  display: grid;
  padding: clamp(34px, 4.6vw, 76px);
  position: relative;
}

.login-card::before {
  background: linear-gradient(180deg, var(--login-iecs), #54a06a 44%, #168b88 62%, var(--login-iedis), transparent);
  content: '';
  height: 190px;
  left: -1px;
  opacity: 0.58;
  position: absolute;
  top: 0;
  width: 2px;
}

.sr-only {
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
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
    min-height: 300px;
    padding: 28px 32px;
  }

  .brand-stage__art {
    height: 230px;
    margin-right: 0;
    position: absolute;
    right: 4%;
    top: 23px;
    width: 230px;
  }

  .brand-stage__copy {
    padding: 20px 0 10px;
  }

  .brand-stage__description {
    font-size: 1rem;
    margin-top: 14px;
  }

  .partner-lockup {
    bottom: 28px;
    position: absolute;
    right: 30px;
  }

  .partner-lockup__brand {
    min-height: 48px;
    padding: 8px 12px;
  }

  .partner-lockup__brand img {
    height: 26px;
  }

  .login-card {
    border-left: 0;
    border-top: 1px solid rgba(207, 222, 211, 0.92);
    padding: 42px clamp(24px, 7vw, 64px) 48px;
  }

  .login-card::before {
    height: 2px;
    left: 0;
    top: -1px;
    width: 190px;
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

  .brand-stage__art {
    height: 170px;
    right: -10px;
    top: 20px;
    width: 170px;
  }

  .brand-stage__copy {
    padding: 16px 0 0;
  }

  .brand-stage__copy .eyebrow {
    display: none;
  }

  .brand-stage__copy h1 {
    font-size: clamp(2.65rem, 15vw, 4.2rem);
  }

  .brand-stage__description,
  .partner-lockup {
    display: none;
  }

  .login-card {
    padding: 34px 20px 42px;
  }
}
</style>
