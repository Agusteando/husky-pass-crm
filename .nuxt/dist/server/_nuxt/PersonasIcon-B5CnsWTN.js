import { defineComponent, computed, createVNode, resolveDynamicComponent, mergeProps, useSSRContext } from "vue";
import { ssrRenderVNode } from "vue/server-renderer";
import { ShieldCheck, FileCheck, Trash2, RefreshCw, Plus, EllipsisVertical, ChevronDown, Check, BadgeCheck, Download, Handshake, CirclePlay, CircleHelp, ClipboardCheck, LogOut, LogIn, Clock3, ArrowRight, AlertCircle, History, CalendarDays, Baby, ImageUp, Camera, PencilLine, UserRoundCheck, UserRound, UsersRound, House, School, Sparkles } from "@lucide/vue";
import { b as _export_sfc } from "../server.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PersonasIcon",
  __ssrInlineRender: true,
  props: {
    name: {}
  },
  setup(__props) {
    const props = __props;
    const iconMap = {
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
      replace: RefreshCw,
      trash: Trash2,
      document: FileCheck,
      security: ShieldCheck
    };
    const iconComponent = computed(() => iconMap[props.name] || Sparkles);
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(iconComponent.value), mergeProps({
        class: "pa-icon",
        "aria-hidden": "true",
        focusable: "false",
        "stroke-width": 2.2
      }, _attrs), null), _parent);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/family/PersonasIcon.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c277d698"]]);
export {
  __nuxt_component_1 as _
};
//# sourceMappingURL=PersonasIcon-B5CnsWTN.js.map
