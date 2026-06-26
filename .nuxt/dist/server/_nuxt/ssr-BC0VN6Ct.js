import { setResponseStatus as setResponseStatus$1 } from "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue";
import { u as useNuxtApp } from "../server.mjs";
function useRequestEvent(nuxtApp) {
  nuxtApp ||= useNuxtApp();
  return nuxtApp.ssrContext?.event;
}
function useRequestFetch() {
  return useRequestEvent()?.$fetch || globalThis.$fetch;
}
function setResponseStatus(arg1, arg2, arg3) {
  const event = useRequestEvent();
  if (event) {
    return setResponseStatus$1(event, arg1, arg2);
  }
}
export {
  useRequestEvent as a,
  setResponseStatus as s,
  useRequestFetch as u
};
//# sourceMappingURL=ssr-BC0VN6Ct.js.map
