<template>
  <FamilyPersonasAutorizadasShell title="FAQ / ayuda">
    <section class="card help-hero" data-product-panel="help">
      <div>
        <p class="eyebrow">Ayuda</p>
        <h1>FAQ / ayuda</h1>
        <p>Respuestas rápidas sobre personas autorizadas, Pase Express, fotos y marbetes.</p>
      </div>
      <img :src="mascot" alt="" />
    </section>

    <section class="faq-list" data-product-panel="faq" data-state="content">
      <button v-for="(item, index) in faqItems" :key="item.question" class="card faq-item" type="button" :aria-expanded="openFaq === index" @click="openFaq = openFaq === index ? null : index">
        <span>
          <strong>{{ item.question }}</strong>
          <em v-if="openFaq === index">{{ item.answer }}</em>
        </span>
        <b>{{ openFaq === index ? '−' : '+' }}</b>
      </button>
    </section>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFetch } from 'nuxt/app'
import type { AuthorizedChild, AuthorizedPerson } from '~/types/daycare'
import type { PublicSession } from '~/types/session'
import { personasMascot, resolvePersonasTheme } from '~/utils/personasTheme'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })
const openFaq = ref<number | null>(0)
const { data: session } = useFetch<PublicSession>('/api/auth/me', { key: 'pa-help-session' })
const { data: people } = useFetch<AuthorizedPerson[]>('/api/personas-autorizadas/family', { key: 'pa-help-family-people', timeout: 15000 })
const children = computed<AuthorizedChild[]>(() => people.value?.find((person) => person.children?.length)?.children || [])
const primaryChild = computed(() => children.value[0] || null)
const theme = computed(() => resolvePersonasTheme({ plantel: primaryChild.value?.plantel || session.value?.user?.plantel?.[0], nivelEdu: primaryChild.value?.nivelEdu, campus: primaryChild.value?.campus || session.value?.user?.campus }))
const mascot = computed(() => personasMascot(theme.value, 'help'))
const faqItems = [
  { question: '¿Qué es Personas Autorizadas?', answer: 'Es el módulo para registrar quiénes pueden entregar o recoger al alumno con validación QR.' },
  { question: '¿Cuántas personas puedo registrar?', answer: 'Puedes mantener tres personas autorizadas y un Pase Express para situaciones temporales.' },
  { question: '¿Qué foto debo usar?', answer: 'Usa una fotografía clara de frente. El procesamiento Vision ayuda a recortar rostro y preparar la imagen.' },
  { question: '¿Para qué sirve el Pase Express?', answer: 'Permite generar un registro temporal cuando las personas autorizadas habituales no están disponibles.' },
  { question: '¿Cómo descargo el marbete?', answer: 'Abre Marbetes / descarga, elige una persona registrada y descarga el formato disponible.' },
  { question: '¿Puedo cambiar grado, grupo o nivel?', answer: 'No. Esos campos son escolares y se mantienen como solo lectura para familias.' }
]
</script>

<style scoped>
.help-hero { align-items: center; background: linear-gradient(135deg, rgba(var(--pa-primary-rgb), .1), #fff); display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr) 130px; }
.help-hero img { max-height: 130px; object-fit: contain; }
.faq-list { display: grid; gap: 10px; }
.faq-item { align-items: start; cursor: pointer; display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr) auto; text-align: left; width: 100%; }
.faq-item strong, .faq-item em { display: block; }
.faq-item em { color: var(--pa-muted); font-style: normal; margin-top: 8px; }
.faq-item b { color: var(--pa-primary); font-size: 1.4rem; }
@media (max-width: 760px) { .help-hero { grid-template-columns: 1fr; } .help-hero img { justify-self: start; } }
</style>
