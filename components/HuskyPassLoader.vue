<template>
  <div class="hp-loader" :class="{ compact, contained }" role="status" aria-live="polite" data-product-loader="husky-pass">
    <span class="hp-loader-orbit" aria-hidden="true">
      <span class="hp-loader-ring ring-a"></span>
      <span class="hp-loader-ring ring-b"></span>
      <span class="hp-loader-mark">
        <img src="/brand/husky-pass-logo.png" alt="" decoding="async" />
      </span>
    </span>
    <span v-if="label" class="hp-loader-label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  compact?: boolean
  contained?: boolean
}>(), {
  label: 'Cargando Husky Pass',
  compact: false,
  contained: false
})
</script>

<style scoped>
.hp-loader {
  align-items: center;
  color: var(--pa-primary, var(--color-brand-700));
  display: inline-flex;
  gap: 12px;
  justify-content: center;
}

.hp-loader.contained {
  background:
    radial-gradient(circle at 30% 10%, rgba(var(--pa-primary-rgb, 87, 139, 38), .15), transparent 8rem),
    rgba(255, 255, 255, .92);
  border: 1px solid rgba(var(--pa-primary-rgb, 87, 139, 38), .18);
  border-radius: 24px;
  box-shadow: 0 18px 48px rgba(30, 53, 78, .07);
  min-height: 168px;
  padding: 22px;
  width: 100%;
}

.hp-loader.compact {
  gap: 9px;
}

.hp-loader-orbit {
  display: grid;
  height: 64px;
  place-items: center;
  position: relative;
  width: 64px;
}

.hp-loader.compact .hp-loader-orbit {
  height: 34px;
  width: 34px;
}

.hp-loader-ring {
  border-radius: 999px;
  inset: 0;
  position: absolute;
}

.ring-a {
  animation: hp-loader-spin 1.05s linear infinite;
  border: 2px solid rgba(var(--pa-primary-rgb, 87, 139, 38), .12);
  border-top-color: currentColor;
}

.ring-b {
  animation: hp-loader-drift 1.45s ease-in-out infinite;
  border: 1px solid rgba(var(--pa-primary-rgb, 87, 139, 38), .18);
  inset: 7px;
}

.hp-loader-mark {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(var(--pa-primary-rgb, 87, 139, 38), .2);
  border-radius: 999px;
  box-shadow: 0 10px 24px rgba(var(--pa-primary-rgb, 87, 139, 38), .14);
  display: flex;
  height: 42px;
  justify-content: center;
  overflow: hidden;
  padding: 7px;
  position: relative;
  width: 42px;
}

.hp-loader.compact .hp-loader-mark {
  height: 24px;
  padding: 4px;
  width: 24px;
}

.hp-loader-mark img {
  display: block;
  height: 100%;
  object-fit: contain;
  width: 100%;
}

.hp-loader-label {
  color: var(--pa-gray, #1f2d46);
  font-size: .8rem;
  font-weight: 900;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.hp-loader.compact .hp-loader-label {
  font-size: .68rem;
}

@keyframes hp-loader-spin {
  to { transform: rotate(360deg); }
}

@keyframes hp-loader-drift {
  0%, 100% { opacity: .34; transform: scale(.92); }
  50% { opacity: 1; transform: scale(1.04); }
}

@media (prefers-reduced-motion: reduce) {
  .ring-a,
  .ring-b {
    animation: none;
  }
}
</style>
