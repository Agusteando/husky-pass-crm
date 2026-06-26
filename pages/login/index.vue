<template>
  <LoginPanel
    brand-to="/login"
    eyebrow="Husky Pass"
    title="Elige tu experiencia"
    description="Selecciona el acceso que corresponde a tu cuenta."
    experience="admin"
  >
    <section class="login-choice stack">
      <NuxtLink class="choice-row" to="/login/escolar" data-login-entry="escolar">
        <span>
          <strong>Experiencia Escolar</strong>
          <small>Familias IECS o IEDIS</small>
        </span>
        <FamilyPersonasIcon name="arrow" aria-hidden="true" />
      </NuxtLink>
      <NuxtLink class="choice-row" to="/login/guarderia" data-login-entry="guarderia">
        <span>
          <strong>Experiencia Guardería</strong>
          <small>Familias de Guardería</small>
        </span>
        <FamilyPersonasIcon name="arrow" aria-hidden="true" />
      </NuxtLink>
      <NuxtLink class="admin-link" to="/admin/login">Experiencia Administrativa</NuxtLink>
    </section>
  </LoginPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
</script>

<style scoped>
.login-choice {
  gap: 8px;
}

.choice-row {
  align-items: center;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.choice-row:hover,
.choice-row:focus-visible {
  border-color: var(--color-brand-700);
  box-shadow: var(--shadow-soft);
  outline: none;
  transform: translateY(-1px);
}

.choice-row :deep(.pa-icon) {
  color: var(--color-brand-700);
  flex: 0 0 auto;
  height: 1rem;
  width: 1rem;
}

.choice-row strong,
.choice-row small {
  display: block;
}

.choice-row small,
.admin-link {
  color: var(--color-muted);
  font-size: .86rem;
}

.admin-link {
  justify-self: center;
  margin-top: 4px;
}
</style>
