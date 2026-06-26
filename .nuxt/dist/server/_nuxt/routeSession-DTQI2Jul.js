import { u as useNuxtApp, c as useRuntimeConfig } from "../server.mjs";
import { toRef, isRef } from "vue";
import { a as useRequestEvent } from "./ssr-BC0VN6Ct.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
const useStateKeyPrefix = "$s";
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = useStateKeyPrefix + _key;
  const nuxtApp = useNuxtApp();
  const state = toRef(nuxtApp.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxtApp.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
const anonymousSession = { user: null, loggedin: false };
const sessionCookieName = "hpc_session";
const sessionStateKey = "app-session-cache";
function useRouteSessionCache() {
  return useState(sessionStateKey, () => null);
}
function readCookieValue(cookieHeader, name) {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const separator = cookie.indexOf("=");
    if (separator < 0) continue;
    const key = cookie.slice(0, separator).trim();
    if (key === name) return decodeURIComponent(cookie.slice(separator + 1).trim());
  }
  return null;
}
async function signSessionPayload(payload, secret) {
  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await globalThis.crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Buffer.from(signature).toString("base64url");
}
function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}
async function getServerRouteSession() {
  const event = useRequestEvent();
  const raw = readCookieValue(event?.node.req.headers.cookie, sessionCookieName);
  if (!raw) return anonymousSession;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return anonymousSession;
  const secret = useRuntimeConfig().sessionSecret;
  const expected = await signSessionPayload(payload, secret);
  if (!constantTimeEqual(signature, expected)) {
    return anonymousSession;
  }
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!decoded.user?.id || !decoded.user.kind) return anonymousSession;
    return { user: decoded.user, loggedin: true };
  } catch {
    return anonymousSession;
  }
}
async function getRouteSession() {
  {
    return getServerRouteSession();
  }
}
export {
  anonymousSession as a,
  useState as b,
  getRouteSession as g,
  useRouteSessionCache as u
};
//# sourceMappingURL=routeSession-DTQI2Jul.js.map
