<template>
  <main class="editor-lab" data-product-area="dev-marbete-svg-editor">
    <header>
      <div>
        <p class="eyebrow">Prueba local</p>
        <h1>Editor SVG de marbetes</h1>
      </div>
      <label>
        Ciclo escolar
        <input v-model="cycle" inputmode="numeric" />
      </label>
      <button type="button" @click="resetDesign">Restablecer</button>
    </header>

    <AdminMarbeteSvgTemplateEditor
      v-model="design"
      :base-svg="baseSvg"
      theme-key="primaria"
      :preview-cycle="cycle"
    />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import baseSvg from '~/data/marbete-templates/primaria.svg?raw'
import { createMarbeteSvgDesignFromBase } from '~/utils/marbeteSvgEditor'

if (process.env.NODE_ENV === 'production') throw createError({ statusCode: 404, statusMessage: 'Ruta no disponible.' })
definePageMeta({ layout: false, middleware: 'dev-only' })

const cycle = ref('2026-2027')
const design = ref(createMarbeteSvgDesignFromBase(baseSvg, 'primaria'))

function resetDesign() {
  design.value = createMarbeteSvgDesignFromBase(baseSvg, 'primaria')
}
</script>

<style scoped>
.editor-lab {
  background: #eef3f7;
  color: #1f2d3d;
  display: grid;
  gap: 14px;
  min-height: 100vh;
  padding: 16px;
}
.editor-lab > header {
  align-items: end;
  background: #fff;
  border: 1px solid #dce4ec;
  border-radius: 18px;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) 180px auto;
  padding: 16px;
}
h1,
p { margin: 0; }
header label { display: grid; font-size: .75rem; font-weight: 800; gap: 5px; }
header input { border: 1px solid #cbd6e1; border-radius: 9px; min-height: 40px; padding: 0 10px; }
header button { background: #246b91; border: 0; border-radius: 10px; color: #fff; font-weight: 800; min-height: 40px; padding: 0 14px; }
@media (max-width: 760px) { .editor-lab > header { grid-template-columns: 1fr; } }
</style>
