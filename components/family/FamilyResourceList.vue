<template>
  <section class="resource-page" :data-resource-type="type">
    <header class="resource-masthead">
      <div class="masthead-copy">
        <span class="section-mark"><FamilyPersonasIcon :name="sectionIcon" /></span>
        <div>
          <p>{{ salaLine }}</p>
          <h1>{{ title }}</h1>
        </div>
      </div>

      <div class="masthead-meta">
        <span><strong>{{ items?.length || 0 }}</strong>{{ countLabel }}</span>
        <span v-if="featuredItem"><small>Reciente</small>{{ compactDate(featuredItem.date || featuredItem.timestamp) }}</span>
      </div>

      <div class="masthead-mascot" aria-hidden="true">
        <span class="mascot-orbit"></span>
        <img :src="mascotSrc" alt="" />
      </div>
    </header>

    <div v-if="pending" class="resource-skeleton" aria-label="Cargando">
      <span v-for="index in 4" :key="index"></span>
    </div>

    <p v-else-if="error" class="alert">No fue posible cargar esta sección.</p>

    <section v-else-if="items?.length" class="resource-collection">
      <div class="collection-head">
        <h2>{{ collectionTitle }}</h2>
        <NuxtLink to="/familia/daycare">Inicio</NuxtLink>
      </div>

      <div class="resource-grid">
        <ResourceCard
          v-for="(item, index) in items"
          :key="item.id || `${item.title}-${item.date}`"
          :resource="item"
          :variant="cardVariant"
          :density="index === 0 ? 'comfortable' : 'compact'"
          :featured="index === 0"
        />
      </div>
    </section>

    <section v-else class="resource-empty">
      <img :src="emptyMascotSrc" alt="" />
      <div>
        <p>{{ salaLine }}</p>
        <h2>{{ emptyTitle }}</h2>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch } from 'nuxt/app'
import { useAppSession } from '~/composables/useAppSession'
import type { DaycareResource } from '~/types/daycare'
import { parseLegacyDate } from '~/utils/daycare'
import { personasMascot, resolvePersonasTheme } from '~/utils/personasTheme'

const props = defineProps<{
  type: 'hw' | 'news' | 'cal'
  title: string
}>()

const { data: session } = useAppSession()
const { data: items, pending, error } = useFetch<DaycareResource[]>('/api/daycare/family/resources', {
  query: { type: props.type },
  timeout: 15000
})

const daycareTheme = resolvePersonasTheme({ themeKey: 'daycare' })
const featuredItem = computed(() => items.value?.[0] || null)
const sectionIcon = computed(() => props.type === 'hw' ? 'edit' : props.type === 'cal' ? 'calendar' : 'announcement')
const cardVariant = computed(() => props.type === 'hw' ? 'homework' : props.type === 'cal' ? 'calendar' : 'notice')
const collectionTitle = computed(() => props.type === 'hw' ? 'Tareas de la sala' : props.type === 'cal' ? 'Próximas fechas' : 'Comunicados')
const countLabel = computed(() => props.type === 'hw' ? ' tareas' : props.type === 'cal' ? ' fechas' : ' avisos')
const emptyTitle = computed(() => props.type === 'hw' ? 'Sin tareas por ahora' : props.type === 'cal' ? 'Agenda libre' : 'Sin avisos nuevos')
const mascotVariant = computed(() => props.type === 'hw' ? 'help' : props.type === 'cal' ? 'hero' : 'preview')
const mascotSrc = computed(() => personasMascot(daycareTheme, mascotVariant.value))
const emptyMascotSrc = personasMascot(daycareTheme, 'empty')
const salaLine = computed(() => {
  const daycare = session.value?.user?.scopes.daycare
  return [daycare?.unidad, daycare?.sala ? `Sala ${daycare.sala}` : null].filter(Boolean).join(' · ') || 'Guardería'
})

function compactDate(value?: string | null) {
  const date = parseLegacyDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(date).replace('.', '')
}
</script>

<style scoped>
.resource-page {
  --section-accent: #5d8f3c;
  --section-soft: #eef7e7;
  display: grid;
  gap: clamp(18px, 2.5vw, 28px);
}

.resource-page[data-resource-type='hw'] {
  --section-accent: #ed912f;
  --section-soft: #fff1df;
}

.resource-page[data-resource-type='cal'] {
  --section-accent: #438fc7;
  --section-soft: #eaf5fc;
}

.resource-masthead {
  align-items: center;
  background:
    radial-gradient(circle at 85% 0%, color-mix(in srgb, var(--section-accent) 20%, transparent), transparent 34%),
    linear-gradient(135deg, #fff 0%, var(--section-soft) 100%);
  border: 1px solid color-mix(in srgb, var(--section-accent) 16%, transparent);
  border-radius: 32px;
  box-shadow: 0 18px 50px rgba(43, 72, 32, 0.09);
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) auto minmax(150px, 230px);
  min-height: 230px;
  overflow: hidden;
  padding: clamp(22px, 4vw, 42px);
  position: relative;
}

.masthead-copy {
  align-items: center;
  display: flex;
  gap: 16px;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.section-mark {
  align-items: center;
  background: #fff;
  border: 1px solid color-mix(in srgb, var(--section-accent) 20%, transparent);
  border-radius: 20px;
  box-shadow: 0 10px 24px color-mix(in srgb, var(--section-accent) 15%, transparent);
  color: var(--section-accent);
  display: inline-flex;
  flex: 0 0 auto;
  height: 60px;
  justify-content: center;
  width: 60px;
}

.section-mark :deep(.pa-icon) {
  height: 1.55rem;
  width: 1.55rem;
}

.masthead-copy p,
.resource-empty p {
  color: var(--section-accent);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  margin: 0 0 5px;
  text-transform: uppercase;
}

.masthead-copy h1 {
  color: #243320;
  font-size: clamp(2.1rem, 5vw, 4.2rem);
  line-height: 0.92;
  margin: 0;
}

.masthead-meta {
  display: grid;
  gap: 9px;
  min-width: 130px;
  position: relative;
  z-index: 1;
}

.masthead-meta span {
  align-items: baseline;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  color: #64705f;
  display: flex;
  font-size: 0.72rem;
  gap: 5px;
  padding: 10px 12px;
  backdrop-filter: blur(10px);
}

.masthead-meta strong {
  color: var(--section-accent);
  font-family: var(--font-title);
  font-size: 1.4rem;
  line-height: 1;
}

.masthead-meta small {
  color: #879080;
  font-size: 0.62rem;
  letter-spacing: 0.05em;
  margin-right: auto;
  text-transform: uppercase;
}

.masthead-mascot {
  align-self: stretch;
  min-height: 170px;
  position: relative;
}

.masthead-mascot img {
  bottom: -45px;
  filter: drop-shadow(0 18px 20px rgba(45, 73, 31, 0.15));
  height: 250px;
  object-fit: contain;
  object-position: center bottom;
  position: absolute;
  right: 0;
  width: 100%;
  z-index: 1;
}

.mascot-orbit {
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 50%;
  height: 190px;
  position: absolute;
  right: 0;
  top: 8px;
  width: 190px;
}

.resource-collection {
  display: grid;
  gap: 14px;
}

.collection-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.collection-head h2 {
  color: #2d4328;
  font-size: clamp(1.25rem, 2.3vw, 1.7rem);
  margin: 0;
}

.collection-head a {
  color: var(--section-accent);
  font-size: 0.76rem;
  font-weight: 800;
}

.resource-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.resource-grid :deep(.resource-card:first-child) {
  grid-column: 1 / -1;
}

.resource-skeleton {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.resource-skeleton span {
  animation: shimmer 1.3s ease-in-out infinite alternate;
  background: linear-gradient(110deg, #edf1e9 25%, #f8faf5 45%, #edf1e9 65%);
  background-size: 220% 100%;
  border-radius: 24px;
  min-height: 190px;
}

.resource-skeleton span:first-child {
  grid-column: 1 / -1;
  min-height: 250px;
}

.resource-empty {
  align-items: center;
  background: linear-gradient(135deg, #fff, var(--section-soft));
  border: 1px solid color-mix(in srgb, var(--section-accent) 16%, transparent);
  border-radius: 28px;
  display: grid;
  gap: 18px;
  grid-template-columns: 140px minmax(0, 1fr);
  min-height: 210px;
  overflow: hidden;
  padding: 22px 28px 0;
}

.resource-empty img {
  align-self: end;
  filter: drop-shadow(0 14px 18px rgba(45, 73, 31, 0.12));
  max-height: 180px;
  object-fit: contain;
}

.resource-empty h2 {
  color: #2d4328;
  font-size: clamp(1.5rem, 3vw, 2.4rem);
  margin: 0;
}

@keyframes shimmer {
  from { background-position: 90% 0; }
  to { background-position: -90% 0; }
}

@media (max-width: 820px) {
  .resource-masthead {
    grid-template-columns: minmax(0, 1fr) minmax(115px, 170px);
    min-height: 210px;
  }

  .masthead-meta {
    display: none;
  }

  .masthead-mascot img {
    bottom: -36px;
    height: 220px;
  }
}

@media (max-width: 620px) {
  .resource-page {
    gap: 16px;
  }

  .resource-masthead {
    border-radius: 25px;
    gap: 8px;
    grid-template-columns: minmax(0, 1fr) 110px;
    min-height: 170px;
    padding: 20px;
  }

  .masthead-copy {
    align-items: flex-start;
    flex-direction: column;
    gap: 11px;
  }

  .section-mark {
    border-radius: 15px;
    height: 44px;
    width: 44px;
  }

  .section-mark :deep(.pa-icon) {
    height: 1.15rem;
    width: 1.15rem;
  }

  .masthead-copy h1 {
    font-size: clamp(2rem, 12vw, 3.1rem);
  }

  .masthead-mascot {
    min-height: 130px;
  }

  .masthead-mascot img {
    bottom: -28px;
    height: 170px;
    right: -12px;
    width: 140px;
  }

  .mascot-orbit {
    height: 120px;
    right: -8px;
    top: 12px;
    width: 120px;
  }

  .resource-grid,
  .resource-skeleton {
    grid-template-columns: 1fr;
  }

  .resource-grid :deep(.resource-card:first-child),
  .resource-skeleton span:first-child {
    grid-column: auto;
  }

  .resource-empty {
    grid-template-columns: 90px minmax(0, 1fr);
    min-height: 160px;
    padding: 18px 20px 0;
  }

  .resource-empty img {
    max-height: 130px;
  }
}
</style>
