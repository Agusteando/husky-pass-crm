<template>
  <figure class="tutorial-video" :data-theme="theme.key" :data-state="playing ? 'playing' : 'poster'" :style="frameStyle">
    <button
      v-if="!playing"
      class="tutorial-poster"
      type="button"
      data-diagnostic-action="reproducir-tutorial-personas-autorizadas"
      :aria-label="`Reproducir ${title}`"
      @click="playing = true"
    >
      <img class="tutorial-thumbnail" :src="thumbnailUrl" :alt="title" loading="lazy" decoding="async" referrerpolicy="no-referrer" />
      <span class="tutorial-shade" aria-hidden="true"></span>
      <span class="tutorial-frame-ring" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </span>
      <span class="tutorial-theme-pill">{{ themeLabel }}</span>
      <span class="tutorial-play-button" aria-hidden="true">
        <FamilyPersonasIcon name="play" />
      </span>
      <span class="tutorial-copy">
        <strong>{{ title }}</strong>
        <small>Reproducir en este sitio</small>
      </span>
    </button>

    <div v-else class="tutorial-embed" data-state="playing">
      <iframe
        :src="embedUrl"
        :title="title"
        loading="eager"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PersonasTheme } from '~/types/daycare'
import { personasInstitutionName, personasLevelName, personasThemeStyle } from '~/utils/personasTheme'

const props = defineProps<{
  theme: PersonasTheme
  videoId: string
  title: string
}>()

const playing = ref(false)
const safeVideoId = computed(() => encodeURIComponent(props.videoId.trim()))
const thumbnailUrl = computed(() => `https://img.youtube.com/vi/${safeVideoId.value}/maxresdefault.jpg`)
const embedUrl = computed(() => `https://www.youtube-nocookie.com/embed/${safeVideoId.value}?autoplay=1&rel=0&modestbranding=1&playsinline=1`)
const frameStyle = computed(() => personasThemeStyle(props.theme))
const themeLabel = computed(() => {
  const level = personasLevelName(props.theme).spanish
  const institution = personasInstitutionName(props.theme)
  return institution === level ? level : `${institution} / ${level}`
})
</script>

<style scoped>
.tutorial-video {
  --tutorial-glow: rgba(var(--pa-primary-rgb), .18);
  aspect-ratio: 16 / 9;
  background:
    linear-gradient(135deg, rgba(var(--pa-primary-rgb), .14), rgba(255,255,255,.96)),
    #fff;
  border: 1px solid var(--pa-border);
  border-radius: 18px;
  box-shadow: 0 18px 42px rgba(21, 42, 75, .11);
  margin: 0;
  overflow: hidden;
  padding: 10px;
  position: relative;
}

.tutorial-video::after {
  background: linear-gradient(to right, #65b640 0 18%, #ef4b4b 18% 36%, #f0ca45 36% 55%, #55a4d6 55% 74%, #4d4597 74% 100%);
  border-radius: 0 0 18px 18px;
  bottom: 0;
  content: '';
  height: 5px;
  left: 0;
  position: absolute;
  width: 100%;
}

.tutorial-poster,
.tutorial-embed {
  aspect-ratio: 16 / 9;
  border-radius: 13px;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.tutorial-poster {
  align-content: center;
  background: #111827;
  border: 0;
  color: #fff;
  cursor: pointer;
  display: grid;
  justify-items: center;
  padding: 0;
  text-align: center;
}

.tutorial-poster:focus-visible {
  box-shadow: 0 0 0 4px var(--tutorial-glow);
  outline: 0;
}

.tutorial-thumbnail,
.tutorial-shade {
  inset: 0;
  position: absolute;
}

.tutorial-thumbnail {
  height: 100%;
  object-fit: cover;
  transform: scale(1.01);
  width: 100%;
}

.tutorial-shade {
  background:
    radial-gradient(circle at 50% 44%, rgba(255,255,255,.18), transparent 24%),
    linear-gradient(180deg, rgba(15, 23, 42, .04), rgba(15, 23, 42, .58)),
    linear-gradient(135deg, rgba(var(--pa-primary-rgb), .14), rgba(15, 23, 42, .2));
}

.tutorial-frame-ring {
  border: 2px solid rgba(255,255,255,.6);
  border-radius: 12px;
  box-shadow: inset 0 0 0 1px rgba(var(--pa-primary-rgb), .35), 0 0 0 1px rgba(var(--pa-primary-rgb), .22);
  inset: 12px;
  pointer-events: none;
  position: absolute;
}

.tutorial-frame-ring span {
  border-color: var(--pa-primary);
  border-style: solid;
  height: 24px;
  position: absolute;
  width: 24px;
}

.tutorial-frame-ring span:nth-child(1) {
  border-width: 2px 0 0 2px;
  left: -2px;
  top: -2px;
}

.tutorial-frame-ring span:nth-child(2) {
  border-width: 2px 2px 0 0;
  right: -2px;
  top: -2px;
}

.tutorial-frame-ring span:nth-child(3) {
  border-width: 0 0 2px 2px;
  bottom: -2px;
  left: -2px;
}

.tutorial-frame-ring span:nth-child(4) {
  border-width: 0 2px 2px 0;
  bottom: -2px;
  right: -2px;
}

.tutorial-theme-pill {
  background: rgba(255,255,255,.9);
  border: 1px solid rgba(255,255,255,.76);
  border-radius: 999px;
  color: var(--pa-primary);
  font-size: .72rem;
  font-weight: 900;
  left: 18px;
  padding: 6px 11px;
  position: absolute;
  top: 18px;
  z-index: 2;
}

.tutorial-play-button {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(255,255,255,.8);
  border-radius: 999px;
  box-shadow: 0 16px 34px rgba(0,0,0,.2), 0 0 0 9px rgba(255,255,255,.13);
  color: var(--pa-primary);
  display: inline-grid;
  height: 68px;
  place-items: center;
  position: relative;
  transition: transform .18s ease, box-shadow .18s ease;
  width: 68px;
  z-index: 2;
}

.tutorial-play-button :deep(.pa-icon) {
  height: 1.75rem;
  margin: 0;
  stroke-width: 2.6;
  width: 1.75rem;
}

.tutorial-poster:hover .tutorial-play-button {
  box-shadow: 0 18px 38px rgba(0,0,0,.24), 0 0 0 11px var(--tutorial-glow);
  transform: translateY(-1px) scale(1.03);
}

.tutorial-copy {
  bottom: 24px;
  display: grid;
  gap: 4px;
  left: 18px;
  position: absolute;
  right: 18px;
  z-index: 2;
}

.tutorial-copy strong {
  color: #fff;
  font-size: 1rem;
  text-shadow: 0 2px 12px rgba(0,0,0,.32);
}

.tutorial-copy small {
  color: rgba(255,255,255,.86);
  font-weight: 900;
}

.tutorial-embed {
  background: #0f172a;
}

.tutorial-embed iframe {
  border: 0;
  display: block;
  height: 100%;
  width: 100%;
}

.tutorial-video[data-theme='daycare'] .tutorial-frame-ring {
  border-style: dashed;
}

.tutorial-video[data-theme='preescolar'] .tutorial-frame-ring span {
  height: 30px;
  width: 30px;
}

.tutorial-video[data-theme='primaria'] {
  --tutorial-glow: rgba(252, 191, 44, .24);
}

.tutorial-video[data-theme='secundaria'] {
  --tutorial-glow: rgba(102, 168, 216, .24);
}

.tutorial-video[data-theme='admin'] .tutorial-frame-ring {
  border-color: rgba(255,255,255,.42);
}

@media (max-width: 560px) {
  .tutorial-video {
    border-radius: 15px;
    padding: 8px;
  }

  .tutorial-frame-ring {
    inset: 9px;
  }

  .tutorial-theme-pill {
    font-size: .66rem;
    left: 14px;
    max-width: calc(100% - 28px);
    overflow: hidden;
    text-overflow: ellipsis;
    top: 14px;
    white-space: nowrap;
  }

  .tutorial-play-button {
    height: 56px;
    width: 56px;
  }

  .tutorial-copy {
    bottom: 18px;
  }
}
</style>
