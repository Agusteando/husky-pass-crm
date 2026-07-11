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
  BarChart3,
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarDays,
  CalendarClock,
  Check,
  ChevronDown,
  EllipsisVertical,
  Camera,
  CircleHelp,
  CirclePlay,
  Columns3,
  ClipboardCheck,
  ClipboardList,
  Download,
  FileCheck,
  FileText,
  GraduationCap,
  Handshake,
  History,
  House,
  Clock3,
  ImageUp,
  List,
  Mail,
  MapPin,
  MessageCircle,
  LogIn,
  LogOut,
  Megaphone,
  PencilLine,
  Paperclip,
  ShieldCheck,
  School,
  Plus,
  ReceiptText,
  Phone,
  RefreshCw,
  Search,
  Save,
  SlidersHorizontal,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Trash2,
  ZoomIn,
  X,
  UserRound,
  UserRoundPlus,
  UserRoundCheck,
  UsersRound
} from '@lucide/vue'

const props = defineProps<{ name: string }>()

const iconMap: Record<string, FunctionalComponent> = {
  daycare: School,
  school: School,
  home: House,
  people: UsersRound,
  person: UserRound,
  authorized: UserRoundCheck,
  edit: PencilLine,
  camera: Camera,
  upload: ImageUp,
  siblings: Baby,
  calendar: CalendarDays,
  announcement: Megaphone,
  bell: Bell,
  payments: ReceiptText,
  receipt: ReceiptText,
  send: Send,
  attachment: Paperclip,
  pdf: FileText,
  history: History,
  alert: AlertCircle,
  arrow: ArrowRight,
  clock: Clock3,
  entry: LogIn,
  exit: LogOut,
  survey: ClipboardCheck,
  clipboard: ClipboardList,
  help: CircleHelp,
  play: CirclePlay,
  handshake: Handshake,
  download: Download,
  marbete: BadgeCheck,
  badge: BadgeCheck,
  check: Check,
  chevron: ChevronDown,
  more: EllipsisVertical,
  plus: Plus,
  replace: RefreshCw,
  trash: Trash2,
  document: FileCheck,
  security: ShieldCheck,
  search: Search,
  sparkles: Sparkles,
  chart: BarChart3,
  deadline: CalendarClock,
  board: Columns3,
  list: List,
  mail: Mail,
  map: MapPin,
  message: MessageCircle,
  phone: Phone,
  save: Save,
  filter: SlidersHorizontal,
  target: Target,
  trend: TrendingUp,
  graduation: GraduationCap,
  'user-plus': UserRoundPlus,
  zoom: ZoomIn,
  close: X
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
