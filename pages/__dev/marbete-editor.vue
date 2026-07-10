<template>
  <main class="editor-lab" data-product-area="dev-marbete-editor">
    <header>
      <div><p class="eyebrow">Dev harness</p><h1>Marbete visual editor lab</h1></div>
      <nav><NuxtLink to="/__dev/husky-pass">PDF lab heredado</NuxtLink><a :href="svgUrl" target="_blank">SVG nuevo</a><a :href="pdfUrl" target="_blank">PDF nuevo</a></nav>
    </header>
    <section class="controls">
      <label>Tema<select v-model="themeKey"><option value="daycare">Guardería</option><option value="preescolar">Preescolar</option><option value="primaria">Primaria</option><option value="secundaria">Secundaria</option></select></label>
      <label>Ciclo<input v-model="cycle" /></label>
      <label>Preset<select v-model="preset"><option value="default">Default</option><option value="rotated">Rotado</option><option value="wide-crop">Recorte horizontal</option><option value="minimal">Mínimo</option></select></label>
      <button type="button" @click="resetDesign">Restablecer diseño</button>
    </section>
    <MarbeteVisualEditor v-model="design" :theme-key="themeKey" :ciclo-escolar="cycle" @artwork-selected="selectedFile = $event?.name || ''" />
    <section class="server-proof">
      <div><p class="eyebrow">Renderer compartido</p><h2>Salida del servidor</h2><small>{{ selectedFile || 'Sin archivo local seleccionado' }}</small></div>
      <iframe :key="svgUrl" :src="svgUrl" title="Salida SVG del editor"></iframe>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MarbeteVisualEditor from '~/components/admin/MarbeteVisualEditor.vue'
import type { PersonasThemeKey } from '~/types/daycare'
import { createDefaultMarbeteVisualDesign } from '~/utils/marbeteDesigner'

if (process.env.NODE_ENV === 'production') throw createError({ statusCode: 404, statusMessage: 'Ruta no disponible.' })
definePageMeta({ layout: false, middleware: 'dev-only' })

const themeKey = ref<PersonasThemeKey>('primaria')
const cycle = ref('2026-2027')
const preset = ref('default')
const design = ref(createDefaultMarbeteVisualDesign(themeKey.value))
const selectedFile = ref('')
const query = computed(() => `theme=${themeKey.value}&variant=${themeKey.value === 'daycare' ? 'guarderia-cm' : themeKey.value === 'preescolar' ? 'preescolar-preem' : themeKey.value === 'secundaria' ? 'secundaria-st' : 'primaria-pt'}&scenario=long-name&ciclo=${encodeURIComponent(cycle.value)}&preset=${preset.value}`)
const svgUrl = computed(() => `/api/dev/husky-pass/editor-pass?${query.value}&format=svg-preview`)
const pdfUrl = computed(() => `/api/dev/husky-pass/editor-pass?${query.value}&format=pdf`)

watch(themeKey, () => resetDesign())
function resetDesign() { design.value = createDefaultMarbeteVisualDesign(themeKey.value) }
</script>

<style scoped>
.editor-lab { background:#f4f7fa; color:#1f2d3d; display:grid; gap:14px; min-height:100vh; padding:16px; }
.editor-lab > header { align-items:end; background:#fff; border:1px solid #dce4ec; border-radius:18px; display:flex; justify-content:space-between; padding:16px; }
h1,h2,p { margin:0; }
nav,.controls { display:flex; flex-wrap:wrap; gap:8px; }
nav a,.controls button { background:#246b91; border:0; border-radius:9px; color:#fff; font-weight:800; padding:9px 12px; text-decoration:none; }
.controls { align-items:end; background:#fff; border:1px solid #dce4ec; border-radius:14px; padding:12px; }
.controls label { color:#637286; display:grid; flex:1 1 180px; font-size:.72rem; font-weight:800; gap:5px; text-transform:uppercase; }
.controls select,.controls input { border:1px solid #cbd6e1; border-radius:8px; min-height:36px; padding:7px 9px; }
.server-proof { background:#fff; border:1px solid #dce4ec; border-radius:18px; display:grid; gap:14px; grid-template-columns:220px minmax(0,1fr); padding:14px; }
.server-proof iframe { aspect-ratio:612/792; border:1px solid #dce4ec; border-radius:12px; width:100%; }
@media(max-width:800px){.editor-lab > header,.server-proof{align-items:stretch;flex-direction:column;grid-template-columns:1fr}.editor-lab > header{display:flex}}
</style>
