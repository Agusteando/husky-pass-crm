<template>
  <component
    :is="iconComponent"
    class="pa-icon"
    aria-hidden="true"
    focusable="false"
    :stroke-width="2.2"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FunctionalComponent } from 'vue'
import {
  Baby,
  BadgeCheck,
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  EllipsisVertical,
  Camera,
  CircleHelp,
  CirclePlay,
  ClipboardCheck,
  Download,
  FileCheck,
  Handshake,
  History,
  House,
  Clock3,
  ImageUp,
  LogIn,
  LogOut,
  PencilLine,
  School,
  Plus,
  Sparkles,
  UserRound,
  UserRoundCheck,
  UsersRound
} from '@lucide/vue'

const props = defineProps<{ name: string }>()

const iconMap: Record<string, FunctionalComponent> = {
  daycare: School,
  home: House,
  people: UsersRound,
  person: UserRound,
  authorized: UserRoundCheck,
  edit: PencilLine,
  camera: Camera,
  upload: ImageUp,
  siblings: Baby,
  calendar: CalendarDays,
  history: History,
  alert: AlertCircle,
  arrow: ArrowRight,
  clock: Clock3,
  entry: LogIn,
  exit: LogOut,
  survey: ClipboardCheck,
  help: CircleHelp,
  play: CirclePlay,
  handshake: Handshake,
  download: Download,
  marbete: BadgeCheck,
  check: Check,
  chevron: ChevronDown,
  more: EllipsisVertical,
  plus: Plus,
  document: FileCheck
}

const iconComponent = computed(() => iconMap[props.name] || Sparkles)
</script>

<style scoped>
.pa-icon {
  display: block;
  fill: none;
  height: 1.15rem;
  stroke: currentColor;
  width: 1.15rem;
}
</style>
