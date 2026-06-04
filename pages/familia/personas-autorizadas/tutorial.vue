<template>
  <FamilyPersonasAutorizadasShell title="Tutorial">
    <section class="card tutorial-card" data-product-panel="tutorial" data-state="content">
      <header>
        <p class="eyebrow">Tutorial</p>
        <h1>Cómo funciona</h1>
        <p>Consulta el recorrido de Personas Autorizadas y vuelve a las secciones operativas desde la navegación lateral.</p>
      </header>
      <div class="video-frame">
        <iframe src="https://www.youtube.com/embed/PMBQolTRysg" title="Tutorial Personas Autorizadas" allowfullscreen loading="lazy"></iframe>
      </div>
    </section>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })
</script>

<style scoped>
.tutorial-card { display: grid; gap: 16px; }
.video-frame { aspect-ratio: 16 / 9; background: #111; border-radius: 22px; overflow: hidden; }
.video-frame iframe { border: 0; height: 100%; width: 100%; }
</style>
