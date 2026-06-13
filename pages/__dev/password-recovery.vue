<template>
  <main class="dev-recovery-page">
    <header class="dev-head">
      <div>
        <p>Dev harness</p>
        <h1>Password Recovery Lab</h1>
      </div>
      <nav>
        <NuxtLink to="/__dev/husky-pass">Husky Pass PDF</NuxtLink>
        <NuxtLink to="/__dev/personas-modals">Modales PA</NuxtLink>
      </nav>
    </header>

    <section class="dev-grid">
      <form class="dev-panel" @submit.prevent="requestLink">
        <h2>Solicitar enlace</h2>
        <label>
          Correo familiar
          <input v-model="email" type="email" required autocomplete="email" />
        </label>
        <button type="submit" :disabled="loading">{{ loading ? 'Enviando...' : 'Enviar' }}</button>
        <p v-if="message" class="state">{{ message }}</p>
        <p v-if="error" class="state error">{{ error }}</p>
      </form>

      <section class="dev-panel">
        <h2>Ultimo preview local</h2>
        <button type="button" @click="loadLatest">Actualizar preview</button>
        <p v-if="!latest" class="state">Sin preview local.</p>
        <div v-else class="latest-preview">
          <span>{{ latest.path }}</span>
          <a v-if="resetUrl" :href="resetUrl" target="_blank" rel="noopener">Abrir reset link</a>
          <pre>{{ formattedLatest }}</pre>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

definePageMeta({ middleware: 'dev-only' })

const email = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')
const latest = ref<{ path: string; preview: Record<string, unknown> } | null>(null)
const resetUrl = computed(() => String(latest.value?.preview?.resetUrl || ''))
const formattedLatest = computed(() => latest.value ? JSON.stringify(latest.value.preview, null, 2) : '')

async function requestLink() {
  loading.value = true
  message.value = ''
  error.value = ''
  try {
    const response = await $fetch<{ message?: string }>('/api/auth/password/forgot', {
      method: 'POST',
      body: { email: email.value }
    })
    message.value = response.message || 'Solicitud enviada.'
    await loadLatest()
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible solicitar el enlace.'
  } finally {
    loading.value = false
  }
}

async function loadLatest() {
  const response = await $fetch<{ latest: typeof latest.value }>('/api/__dev/password-recovery/latest-preview')
  latest.value = response.latest || null
}
</script>

<style scoped>
.dev-recovery-page {
  background: #f6f8fb;
  color: #172033;
  min-height: 100vh;
  padding: 24px;
}

.dev-head {
  align-items: end;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin: 0 auto 16px;
  max-width: 1100px;
}

.dev-head p {
  color: #667085;
  font-size: .78rem;
  font-weight: 800;
  letter-spacing: .08em;
  margin: 0 0 4px;
  text-transform: uppercase;
}

.dev-head h1 {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  letter-spacing: -0.04em;
  margin: 0;
}

.dev-head nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dev-head a,
.dev-panel button {
  background: #fff;
  border: 1px solid #d8e0ea;
  border-radius: 10px;
  color: #155e75;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
  padding: 9px 12px;
}

.dev-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(280px, 380px) minmax(0, 1fr);
  margin: 0 auto;
  max-width: 1100px;
}

.dev-panel {
  background: #fff;
  border: 1px solid #d8e0ea;
  border-radius: 14px;
  box-shadow: 0 14px 30px rgba(15, 23, 42, .08);
  display: grid;
  gap: 12px;
  padding: 16px;
}

.dev-panel h2 {
  font-size: 1.05rem;
  margin: 0;
}

.dev-panel label {
  color: #475467;
  display: grid;
  font-size: .84rem;
  font-weight: 800;
  gap: 6px;
}

.dev-panel input {
  border: 1px solid #cad5e1;
  border-radius: 10px;
  font: inherit;
  min-height: 42px;
  padding: 0 10px;
}

.state {
  color: #475467;
  font-weight: 700;
  margin: 0;
}

.state.error {
  color: #9f1239;
}

.latest-preview {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.latest-preview span,
.latest-preview pre {
  overflow: auto;
}

.latest-preview span {
  color: #667085;
  font-size: .78rem;
  font-weight: 700;
}

.latest-preview pre {
  background: #0f172a;
  border-radius: 10px;
  color: #dbeafe;
  font-size: .78rem;
  margin: 0;
  max-height: 520px;
  padding: 12px;
}

@media (max-width: 760px) {
  .dev-recovery-page {
    padding: 14px;
  }

  .dev-head {
    align-items: start;
    display: grid;
  }

  .dev-grid {
    grid-template-columns: 1fr;
  }
}
</style>
