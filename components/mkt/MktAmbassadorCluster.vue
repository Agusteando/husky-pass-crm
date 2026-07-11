<template>
  <div class="mkt-ambassadors" :class="{ compact, solo: themes.length === 1 }" aria-hidden="true">
    <span v-for="(theme, index) in themes" :key="theme" class="ambassador" :data-theme="theme" :style="{ '--ambassador-index': index }">
      <img :src="MKT_AMBASSADORS[theme].src" alt="" />
    </span>
    <span v-if="showSeal" class="institution-seal">
      <img src="/brand/husky-pass-logo.png" alt="" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MKT_AMBASSADORS, type MktAmbassadorTheme } from '~/utils/mkt'

const props = withDefaults(defineProps<{
  compact?: boolean
  theme?: MktAmbassadorTheme
  showSeal?: boolean
}>(), {
  compact: false,
  theme: undefined,
  showSeal: true
})

const themes = computed<MktAmbassadorTheme[]>(() => props.theme
  ? [props.theme]
  : ['daycare', 'preescolar', 'primaria', 'secundaria'])
</script>

<style scoped>
.mkt-ambassadors {
  align-items: end;
  display: flex;
  height: 194px;
  justify-content: center;
  min-width: 330px;
  padding: 0 34px 0 16px;
  position: relative;
}

.ambassador {
  align-items: end;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 999px 999px 32px 32px;
  box-shadow: 0 18px 42px rgba(18, 48, 56, 0.13);
  display: flex;
  height: 164px;
  justify-content: center;
  margin-left: -18px;
  overflow: hidden;
  position: relative;
  transform: translateY(calc((var(--ambassador-index) - 1.5) * 4px));
  width: 92px;
}

.ambassador:first-child { margin-left: 0; }
.ambassador[data-theme='daycare'] { background: linear-gradient(180deg, #e7f7df, #fff); }
.ambassador[data-theme='preescolar'] { background: linear-gradient(180deg, #fff4c9, #fff); }
.ambassador[data-theme='primaria'] { background: linear-gradient(180deg, #e3f1fc, #fff); }
.ambassador[data-theme='secundaria'] { background: linear-gradient(180deg, #ffe3df, #fff); }
.ambassador img { display: block; height: 152px; object-fit: contain; object-position: center bottom; width: 100%; }

.institution-seal {
  align-items: center;
  background: #fff;
  border: 4px solid rgba(255, 255, 255, 0.92);
  border-radius: 50%;
  bottom: 5px;
  box-shadow: 0 12px 28px rgba(18, 48, 56, 0.16);
  display: flex;
  height: 64px;
  justify-content: center;
  position: absolute;
  right: 8px;
  width: 64px;
}
.institution-seal img { max-height: 42px; max-width: 44px; }

.mkt-ambassadors.compact { height: 118px; min-width: 210px; padding-right: 26px; }
.mkt-ambassadors.compact .ambassador { height: 104px; margin-left: -13px; width: 62px; }
.mkt-ambassadors.compact .ambassador img { height: 98px; }
.mkt-ambassadors.compact .institution-seal { height: 44px; right: 1px; width: 44px; }
.mkt-ambassadors.compact .institution-seal img { max-height: 29px; max-width: 30px; }
.mkt-ambassadors.solo { min-width: 120px; padding: 0; }
.mkt-ambassadors.solo .ambassador { margin: 0; width: 100px; }
.mkt-ambassadors.solo .institution-seal { right: -8px; }

@media (max-width: 760px) {
  .mkt-ambassadors { height: 142px; min-width: 260px; padding-right: 28px; }
  .ambassador { height: 122px; margin-left: -15px; width: 72px; }
  .ambassador img { height: 116px; }
  .institution-seal { height: 50px; width: 50px; }
  .institution-seal img { max-height: 33px; max-width: 34px; }
}
</style>
