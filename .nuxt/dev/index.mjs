import process from 'node:process';globalThis._importMeta_={url:import.meta.url,env:process.env};import { tmpdir } from 'node:os';
import { Server } from 'node:http';
import { resolve, dirname, join, relative, extname } from 'node:path';
import nodeCrypto, { randomUUID, createHash, createHmac, timingSafeEqual, randomInt, randomBytes } from 'node:crypto';
import { parentPort, threadId } from 'node:worker_threads';
import { defineEventHandler, handleCacheHeaders, splitCookiesString, createEvent, fetchWithEvent, isEvent, eventHandler, setHeaders, createError, sendRedirect, proxyRequest, getRequestHeader, setResponseHeaders, setResponseStatus, send, getRequestHeaders, setResponseHeader, appendResponseHeader, getRequestURL, getResponseHeader, getHeader, setHeader, removeResponseHeader, getQuery as getQuery$1, readBody, createApp, createRouter as createRouter$1, toNodeListener, lazyEventHandler, getResponseStatus, getRouterParam, setCookie, getCookie, deleteCookie, readMultipartFormData, getResponseStatusText } from 'file://C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs';
import { escapeHtml as escapeHtml$1 } from 'file://C:/Users/hp/husky-pass-crm/node_modules/@vue/shared/dist/shared.cjs.js';
import viteNodeEntry_mjs from 'file://C:/Users/hp/husky-pass-crm/node_modules/@nuxt/vite-builder/dist/vite-node-entry.mjs';
import { viteNodeFetch } from 'file://C:/Users/hp/husky-pass-crm/node_modules/@nuxt/vite-builder/dist/vite-node.mjs';
import { z } from 'file://C:/Users/hp/husky-pass-crm/node_modules/zod/index.js';
import { JWT, OAuth2Client } from 'file://C:/Users/hp/husky-pass-crm/node_modules/google-auth-library/build/src/index.js';
import { readFile, readdir, mkdir, writeFile, rm } from 'node:fs/promises';
import bcrypt from 'file://C:/Users/hp/husky-pass-crm/node_modules/bcryptjs/index.js';
import { createPool } from 'file://C:/Users/hp/husky-pass-crm/node_modules/mysql2/promise.js';
import { createFetch, Headers as Headers$1, $fetch } from 'file://C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs';
import { promises, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import PDFDocument from 'file://C:/Users/hp/husky-pass-crm/node_modules/pdfkit/js/pdfkit.js';
import SVGtoPDF from 'file://C:/Users/hp/husky-pass-crm/node_modules/svg-to-pdfkit/source.js';
import { createRenderer, getRequestDependencies, getPreloadLinks, getPrefetchLinks } from 'file://C:/Users/hp/husky-pass-crm/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import { parseURL, withoutBase, joinURL, getQuery, withQuery, withTrailingSlash, decodePath, withLeadingSlash, withoutTrailingSlash, encodePath, joinRelativeURL } from 'file://C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs';
import { renderToString } from 'file://C:/Users/hp/husky-pass-crm/node_modules/vue/server-renderer/index.mjs';
import { klona } from 'file://C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs';
import defu, { defuFn } from 'file://C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs';
import destr, { destr as destr$1 } from 'file://C:/Users/hp/husky-pass-crm/node_modules/destr/dist/index.mjs';
import { snakeCase } from 'file://C:/Users/hp/husky-pass-crm/node_modules/scule/dist/index.mjs';
import { createHead as createHead$1, propsToString, renderSSRHead } from 'file://C:/Users/hp/husky-pass-crm/node_modules/unhead/dist/server.mjs';
import { stringify, uneval } from 'file://C:/Users/hp/husky-pass-crm/node_modules/devalue/index.js';
import { isVNode, isRef, toValue } from 'file://C:/Users/hp/husky-pass-crm/node_modules/vue/index.mjs';
import { DeprecationsPlugin, PromisesPlugin, TemplateParamsPlugin, AliasSortingPlugin } from 'file://C:/Users/hp/husky-pass-crm/node_modules/unhead/dist/plugins.mjs';
import { createHooks } from 'file://C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs';
import { fetchNodeRequestHandler, callNodeRequestHandler } from 'file://C:/Users/hp/husky-pass-crm/node_modules/node-mock-http/dist/index.mjs';
import { createStorage, prefixStorage } from 'file://C:/Users/hp/husky-pass-crm/node_modules/unstorage/dist/index.mjs';
import unstorage_47drivers_47fs from 'file://C:/Users/hp/husky-pass-crm/node_modules/unstorage/drivers/fs.mjs';
import file_58_47_47_47C_58_47Users_47hp_47husky_45pass_45crm_47node_modules_47_64nuxt_47nitro_45server_47dist_47runtime_47utils_47cache_45driver_46js from 'file://C:/Users/hp/husky-pass-crm/node_modules/@nuxt/nitro-server/dist/runtime/utils/cache-driver.js';
import { digest, hash as hash$1 } from 'file://C:/Users/hp/husky-pass-crm/node_modules/ohash/dist/index.mjs';
import { toRouteMatcher, createRouter } from 'file://C:/Users/hp/husky-pass-crm/node_modules/radix3/dist/index.mjs';
import consola, { consola as consola$1 } from 'file://C:/Users/hp/husky-pass-crm/node_modules/consola/dist/index.mjs';
import { ErrorParser } from 'file://C:/Users/hp/husky-pass-crm/node_modules/youch-core/build/index.js';
import { Youch } from 'file://C:/Users/hp/husky-pass-crm/node_modules/youch/build/index.js';
import { SourceMapConsumer } from 'file://C:/Users/hp/husky-pass-crm/node_modules/source-map/source-map.js';
import { AsyncLocalStorage } from 'node:async_hooks';
import { getContext } from 'file://C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs';
import { captureRawStackTrace, parseRawStackTrace } from 'file://C:/Users/hp/husky-pass-crm/node_modules/errx/dist/index.js';
import _wH6JrtIxmaSoA8lCPWFnE9z4lQeXW6H5z3l5aymEQw from 'file://C:/Users/hp/husky-pass-crm/node_modules/@nuxt/vite-builder/dist/fix-stacktrace.mjs';
import { fileURLToPath } from 'node:url';
import { dirname as dirname$1, resolve as resolve$1 } from 'file://C:/Users/hp/husky-pass-crm/node_modules/pathe/dist/index.mjs';
import { walkResolver } from 'file://C:/Users/hp/husky-pass-crm/node_modules/unhead/dist/utils.mjs';

const serverAssets = [{"baseName":"marbete-templates","dir":"C:/Users/hp/husky-pass-crm/data/marbete-templates"},{"baseName":"personas-config","dir":"C:/Users/hp/husky-pass-crm/data/personas-autorizadas"},{"baseName":"hp-fonts","dir":"C:/Users/hp/husky-pass-crm/public/fonts"},{"baseName":"server","dir":"C:/Users/hp/husky-pass-crm/server/assets"}];

const assets$1 = createStorage();

for (const asset of serverAssets) {
  assets$1.mount(asset.baseName, unstorage_47drivers_47fs({ base: asset.dir, ignore: (asset?.ignore || []) }));
}

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('root', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"C:/Users/hp/husky-pass-crm","watchOptions":{"ignored":[null]}}));
storage.mount('src', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"C:/Users/hp/husky-pass-crm/server","watchOptions":{"ignored":[null]}}));
storage.mount('cache:nuxt:payload', file_58_47_47_47C_58_47Users_47hp_47husky_45pass_45crm_47node_modules_47_64nuxt_47nitro_45server_47dist_47runtime_47utils_47cache_45driver_46js({"driver":"file:///C:/Users/hp/husky-pass-crm/node_modules/@nuxt/nitro-server/dist/runtime/utils/cache-driver.js","base":"C:/Users/hp/husky-pass-crm/.nuxt/cache/nuxt/payload"}));
storage.mount('build', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"C:/Users/hp/husky-pass-crm/.nuxt"}));
storage.mount('cache', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"C:/Users/hp/husky-pass-crm/.nuxt/cache"}));
storage.mount('data', unstorage_47drivers_47fs({"driver":"fs","base":"C:/Users/hp/husky-pass-crm/.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const inlineAppConfig = {
  "nuxt": {}
};



const appConfig = defuFn(inlineAppConfig);

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "dev",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      }
    }
  },
  "public": {
    "appName": "Husky Pass CRM",
    "googleClientId": "182000980506-g7e79r026td38bsiipnttp36osl28hvb.apps.googleusercontent.com",
    "pasePlatformUrl": "",
    "richmondUrl": "https://resources.richmondelt.com/student/droplets/"
  },
  "mysql": {
    "host": "148.230.251.169",
    "port": 3306,
    "user": "root",
    "password": "Nicole10*",
    "database": "casitaiedis",
    "connectionLimit": 10
  },
  "attendanceMysql": {
    "host": "148.230.251.169",
    "port": 3306,
    "user": "root",
    "password": "Nicole10*",
    "database": "control_coordinaciones",
    "connectionLimit": 5
  },
  "sipae": {
    "apiBaseUrl": "https://the-sipae-api.casitaapps.com",
    "timeoutMs": 10000
  },
  "externalUpload": {
    "url": "https://expediente.casitaapps.com"
  },
  "passwordRecovery": {
    "baseUrl": "http://127.0.0.1:3000",
    "tokenTtlMinutes": 30,
    "emailMode": "gmail",
    "fromEmail": "desarrollo.tecnologico@casitaiedis.edu.mx",
    "fromName": "Husky Pass",
    "googleServiceAccountEmail": "husky9000@drive-api-225709.iam.gserviceaccount.com",
    "googleServiceAccountPrivateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDe6T/HYIfY6ARm\nHoBSEOUPs5O8tpryWF6dNIbgnTWxSqRkyo3uUkbCOkpFazILYd0rkYWu2cYqY1LD\nkyEhAcnhN9dF1go7tmEZfFeKENjea0JAHjjtC1SuKOBDduWGJU7/MQKpmyNmo0b0\nWlHhY91KqNqHYEa0QwcL373BTTPycF1ENuun+R1Ol5HSNsvIg4v4eCMEOwtS1Rb2\ncy9YjUdTrroTmyPl5EYWlb6xFS4z2+rycoKeXKTdwpXUqG3nmccP6G+ixTCOhGZD\nUm4JteJjNrY5U5M2nFPZsTVnJjZY902G87cxI7MRH+JaQcxTWcpa4K0xl2Q+92bj\nYMVeEAoZAgMBAAECggEAJErxL6a7j3j9KFw8c8Ac71DDU8UeVqlFJE7GTAFEmexH\ndkKVV7FNJHflmkZQ9FH3ds2/aH+7+DBKLB4DFZLrOdBD7DKkYWL5DbN1ND04dgQc\nGgDhr1R6Mc3lb46G4a+m3D0wTAl+espINeYTsUD3aV2zELn/4P8NwWTpCfUmKUlM\nsLV+cN2giUOhs0gj+YqiyPCajjYCwyEZXuH0y/kEApNDgKbjDxyUSIwmlnhU2ZTk\nEFJgtMO6lhvVHBvZQb79gwfMkcDhArohNnDDXpNOLow1lhJ7XTKEzzIUWEQrvO+N\nZCgVDmpzGMxrHVyg2jJs9P0d+TthWWqVoY6VPhEyFQKBgQD+dwALSwucU3SbRhH8\nieTeAJn+E4c3JMGcHs4E4bt6mlgLrWqn0AnZBLPhbf5XEp/41jMeI/Wz2GGPkMgu\nQUJOZYqCW2FSoHIvwz0fpkklDRumcHgzSxLwYBatUAJdW9hwolxZcXiP7dJsrgMu\naye2YF4E0VTcZkXDrTVfl6uPTQKBgQDgQYRRnUQ5nRQBRJXs5niGSKOodmbmOXzS\njSRx3zHpbZuDI0KyDiYD4tqJmvMb0iIJdh3pO+9F9NUfSkbdidhnYoJzw7GO+E5s\nD4aPCFREhDb/P1VgD0mYBjL2ow+Gveglu8N8/42K+ybVsBbnr7lSqmGrcdHKYxGq\nBZxWo3GX/QKBgQCtYoo+J6lGoDrQ3iK9T3wJpKFI1SeJ9FqTtQ2tl921wVsCwevt\nYjyDicfDb74guEkWNWVpQRlWrLZ1KzKrCb5TSq7g+cDLmxWS49ZPLW+jdlYDx5iv\nYpUKAn8RInYqBL3qqUaBj2aVs3dwo/T4+Px7MRh+8d9/uZQJq4i1lNPJ9QKBgBWV\nuMqyPHLfL6G/nD6lIEysiTQZ0WWvetg5RZzAQumY5zMEHdNNkVMmbqp4A5ZV73jB\nqbddUXaGTk0otRF1xyKMVMoXt+tu8v1rsSPrRVEi+LgwvGL2lbrQPe+HWmM5vDKF\nlBdf8ZvC+MXwoQPD4i6Wv7fkyLCWQIkA6T9dk/1xAoGBANaljAXUP8DgwJZi4WRo\nzBIK8Rj1k3O6YXZl5LrrSWIbVn0n99iK5hu2pHfxD8lMXn97SNiLsy5gc6DKxVzb\nTBAHQeGc/d4j5fP2sgONaWS2WN9YFx/mhIGnAm0gBl63j4/rsdAoVy7ODyFfCstr\nZUzKVIB5yW6f88F0FjopwpDY\n-----END PRIVATE KEY-----\n",
    "googleDelegatedUser": "desarrollo.tecnologico@casitaiedis.edu.mx"
  },
  "sessionSecret": "g7e79r026td38bsiipnttp36osl28hvb",
  "googleClientId": "182000980506-g7e79r026td38bsiipnttp36osl28hvb.apps.googleusercontent.com"
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function isPathInScope(pathname, base) {
  let canonical;
  try {
    const pre = pathname.replace(/%2f/gi, "/").replace(/%5c/gi, "\\");
    canonical = new URL(pre, "http://_").pathname;
  } catch {
    return false;
  }
  return !base || canonical === base || canonical.startsWith(base + "/");
}

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function isJsonRequest(event) {
	
	if (hasReqHeader(event, "accept", "text/html")) {
		return false;
	}
	return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
	const value = getRequestHeader(event, name);
	return !!(value && typeof value === "string" && value.toLowerCase().includes(includes));
}

const iframeStorageBridge = (nonce) => `
(function () {
  const NONCE = ${JSON.stringify(nonce)};
  const memoryStore = Object.create(null);

  const post = (type, payload) => {
    window.parent.postMessage({ type, nonce: NONCE, ...payload }, '*');
  };

  const isValid = (data) => data && data.nonce === NONCE;

  const mockStorage = {
    getItem(key) {
      return Object.hasOwn(memoryStore, key)
        ? memoryStore[key]
        : null;
    },
    setItem(key, value) {
      const v = String(value);
      memoryStore[key] = v;
      post('storage-set', { key, value: v });
    },
    removeItem(key) {
      delete memoryStore[key];
      post('storage-remove', { key });
    },
    clear() {
      for (const key of Object.keys(memoryStore))
        delete memoryStore[key];
      post('storage-clear', {});
    },
    key(index) {
      const keys = Object.keys(memoryStore);
      return keys[index] ?? null;
    },
    get length() {
      return Object.keys(memoryStore).length;
    }
  };

  const defineLocalStorage = () => {
    try {
      Object.defineProperty(window, 'localStorage', {
        value: mockStorage,
        writable: false,
        configurable: true
      });
    } catch {
      window.localStorage = mockStorage;
    }
  };

  defineLocalStorage();

  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!isValid(data) || data.type !== 'storage-sync-data') return;

    const incoming = data.data || {};
    for (const key of Object.keys(incoming))
      memoryStore[key] = incoming[key];

    if (typeof window.initTheme === 'function')
      window.initTheme();
    window.dispatchEvent(new Event('storage-ready'));
  });

  // Clipboard API is unavailable in data: URL iframe, so we use postMessage
  document.addEventListener('DOMContentLoaded', function() {
    window.copyErrorMessage = function(button) {
      post('clipboard-copy', { text: button.dataset.errorText });
      button.classList.add('copied');
      setTimeout(function() { button.classList.remove('copied'); }, 2000);
    };
  });

  post('storage-sync-request', {});
})();
`;
const parentStorageBridge = (nonce) => `
(function () {
  const host = document.querySelector('nuxt-error-overlay');
  if (!host) return;

  const NONCE = ${JSON.stringify(nonce)};
  const isValid = (data) => data && data.nonce === NONCE;

  // Handle clipboard copy from iframe
  window.addEventListener('message', function(e) {
    if (isValid(e.data) && e.data.type === 'clipboard-copy') {
      navigator.clipboard.writeText(e.data.text).catch(function() {});
    }
  });

  const collectLocalStorage = () => {
    const all = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k != null) all[k] = localStorage.getItem(k);
    }
    return all;
  };

  const attachWhenReady = () => {
    const root = host.shadowRoot;
    if (!root)
      return false;
    const iframe = root.getElementById('frame');
    if (!iframe || !iframe.contentWindow)
      return false;

    const handlers = {
      'storage-set': (d) => localStorage.setItem(d.key, d.value),
      'storage-remove': (d) => localStorage.removeItem(d.key),
      'storage-clear': () => localStorage.clear(),
      'storage-sync-request': () => {
        iframe.contentWindow.postMessage({
          type: 'storage-sync-data',
          data: collectLocalStorage(),
          nonce: NONCE
        }, '*');
      }
    };

    window.addEventListener('message', (event) => {
      const data = event.data;
      if (!isValid(data)) return;
      const fn = handlers[data.type];
      if (fn) fn(data);
    });

    return true;
  };

  if (attachWhenReady())
    return;

  const obs = new MutationObserver(() => {
    if (attachWhenReady())
      obs.disconnect();
  });

  obs.observe(host, { childList: true, subtree: true });
})();
`;
const errorCSS = `
:host {
  --preview-width: 240px;
  --preview-height: 180px;
  --base-width: 1200px;
  --base-height: 900px;
  --z-base: 999999998;
  --error-pip-left: auto;
  --error-pip-top: auto;
  --error-pip-right: 5px;
  --error-pip-bottom: 5px;
  --error-pip-origin: bottom right;
  --app-preview-left: auto;
  --app-preview-top: auto;
  --app-preview-right: 5px;
  --app-preview-bottom: 5px;
  all: initial;
  display: contents;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
#frame {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  border: none;
  z-index: var(--z-base);
}
#frame[inert] {
  left: var(--error-pip-left);
  top: var(--error-pip-top);
  right: var(--error-pip-right);
  bottom: var(--error-pip-bottom);
  width: var(--base-width);
  height: var(--base-height);
  transform: scale(calc(240 / 1200));
  transform-origin: var(--error-pip-origin);
  overflow: hidden;
  border-radius: calc(1200 * 8px / 240);
}
#preview {
  position: fixed;
  left: var(--app-preview-left);
  top: var(--app-preview-top);
  right: var(--app-preview-right);
  bottom: var(--app-preview-bottom);
  width: var(--preview-width);
  height: var(--preview-height);
  overflow: hidden;
  border-radius: 6px;
  pointer-events: none;
  z-index: var(--z-base);
  background: white;
  display: none;
}
#preview iframe {
  transform-origin: var(--error-pip-origin);
}
#frame:not([inert]) + #preview {
  display: block;
}
#toggle {
  position: fixed;
  left: var(--app-preview-left);
  top: var(--app-preview-top);
  right: calc(var(--app-preview-right) - 3px);
  bottom: calc(var(--app-preview-bottom) - 3px);
  width: var(--preview-width);
  height: var(--preview-height);
  background: none;
  border: 3px solid #00DC82;
  border-radius: 8px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s, box-shadow 0.2s;
  z-index: calc(var(--z-base) + 1);
  display: flex;
  align-items: center;
  justify-content: center;
}
#toggle:hover,
#toggle:focus {
  opacity: 1;
  box-shadow: 0 0 20px rgba(0, 220, 130, 0.6);
}
#toggle:focus-visible {
  outline: 3px solid #00DC82;
  outline-offset: 0;
  box-shadow: 0 0 24px rgba(0, 220, 130, 0.8);
}
#frame[inert] ~ #toggle {
  left: var(--error-pip-left);
  top: var(--error-pip-top);
  right: calc(var(--error-pip-right) - 3px);
  bottom: calc(var(--error-pip-bottom) - 3px);
  cursor: grab;
}
:host(.dragging) #frame[inert] ~ #toggle {
  cursor: grabbing;
}
#frame:not([inert]) ~ #toggle,
#frame:not([inert]) + #preview {
  cursor: grab;
}
:host(.dragging-preview) #frame:not([inert]) ~ #toggle,
:host(.dragging-preview) #frame:not([inert]) + #preview {
  cursor: grabbing;
}

#pip-close {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 16px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
}
#pip-close:focus-visible {
  outline: 2px solid #00DC82;
  outline-offset: 2px;
}

#pip-restore {
  position: fixed;
  right: 16px;
  bottom: 16px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 2px solid #00DC82;
  background: #111;
  color: #fff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  z-index: calc(var(--z-base) + 2);
  cursor: grab;
}
#pip-restore:focus-visible {
  outline: 2px solid #00DC82;
  outline-offset: 2px;
}
:host(.dragging-restore) #pip-restore {
  cursor: grabbing;
}

#frame[hidden],
#toggle[hidden],
#preview[hidden],
#pip-restore[hidden],
#pip-close[hidden] {
  display: none !important;
}

@media (prefers-reduced-motion: reduce) {
  #toggle {
    transition: none;
  }
}
`;
function webComponentScript(base64HTML, startMinimized) {
	return `
(function () {
  try {
    // =========================
    // Host + Shadow
    // =========================
    const host = document.querySelector('nuxt-error-overlay');
    if (!host)
      return;
    const shadow = host.attachShadow({ mode: 'open' });

    // =========================
    // DOM helpers
    // =========================
    const el = (tag) => document.createElement(tag);
    const on = (node, type, fn, opts) => node.addEventListener(type, fn, opts);
    const hide = (node, v) => node.toggleAttribute('hidden', !!v);
    const setVar = (name, value) => host.style.setProperty(name, value);
    const unsetVar = (name) => host.style.removeProperty(name);

    // =========================
    // Create DOM
    // =========================
    const style = el('style');
    style.textContent = ${JSON.stringify(errorCSS)};

    const iframe = el('iframe');
    iframe.id = 'frame';
    iframe.src = 'data:text/html;base64,${base64HTML}';
    iframe.title = 'Detailed error stack trace';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-top-navigation-by-user-activation');

    const preview = el('div');
    preview.id = 'preview';

    const toggle = el('div');
    toggle.id = 'toggle';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('tabindex', '0');
    toggle.innerHTML = '<span class="sr-only">Toggle detailed error view</span>';

    const liveRegion = el('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.className = 'sr-only';

    const pipCloseButton = el('button');
    pipCloseButton.id = 'pip-close';
    pipCloseButton.setAttribute('type', 'button');
    pipCloseButton.setAttribute('aria-label', 'Hide error preview overlay');
    pipCloseButton.innerHTML = '&times;';
    pipCloseButton.hidden = true;
    toggle.appendChild(pipCloseButton);

    const pipRestoreButton = el('button');
    pipRestoreButton.id = 'pip-restore';
    pipRestoreButton.setAttribute('type', 'button');
    pipRestoreButton.setAttribute('aria-label', 'Show error overlay');
    pipRestoreButton.innerHTML = '<span aria-hidden="true">⟲</span><span>Show error overlay</span>';
    pipRestoreButton.hidden = true;

    // Order matters: #frame + #preview adjacency
    shadow.appendChild(style);
    shadow.appendChild(liveRegion);
    shadow.appendChild(iframe);
    shadow.appendChild(preview);
    shadow.appendChild(toggle);
    shadow.appendChild(pipRestoreButton);

    // =========================
    // Constants / keys
    // =========================
    const POS_KEYS = {
      position: 'nuxt-error-overlay:position',
      hiddenPretty: 'nuxt-error-overlay:error-pip:hidden',
      hiddenPreview: 'nuxt-error-overlay:app-preview:hidden'
    };

    const CSS_VARS = {
      pip: {
        left: '--error-pip-left',
        top: '--error-pip-top',
        right: '--error-pip-right',
        bottom: '--error-pip-bottom'
      },
      preview: {
        left: '--app-preview-left',
        top: '--app-preview-top',
        right: '--app-preview-right',
        bottom: '--app-preview-bottom'
      }
    };

    const MIN_GAP = 5;
    const DRAG_THRESHOLD = 2;

    // =========================
    // Local storage safe access + state
    // =========================
    let storageReady = true;
    let isPrettyHidden = false;
    let isPreviewHidden = false;

    const safeGet = (k) => {
      try {
        return localStorage.getItem(k);
      } catch {
        return null;
      }
    };

    const safeSet = (k, v) => {
      if (!storageReady) 
        return;
      try {
        localStorage.setItem(k, v);
      } catch {}
    };

    // =========================
    // Sizing helpers
    // =========================
    const vvSize = () => {
      const v = window.visualViewport;
      return v ? { w: v.width, h: v.height } : { w: window.innerWidth, h: window.innerHeight };
    };

    const previewSize = () => {
      const styles = getComputedStyle(host);
      const w = parseFloat(styles.getPropertyValue('--preview-width')) || 240;
      const h = parseFloat(styles.getPropertyValue('--preview-height')) || 180;
      return { w, h };
    };

    const sizeForTarget = (target) => {
      if (!target)
        return previewSize();
      const rect = target.getBoundingClientRect();
      if (rect.width && rect.height)
        return { w: rect.width, h: rect.height };
      return previewSize();
    };

    // =========================
    // Dock model + offset/alignment calculations
    // =========================
    const dock = { edge: null, offset: null, align: null, gap: null };

    const maxOffsetFor = (edge, size) => {
      const vv = vvSize();
      if (edge === 'left' || edge === 'right')
        return Math.max(MIN_GAP, vv.h - size.h - MIN_GAP);
      return Math.max(MIN_GAP, vv.w - size.w - MIN_GAP);
    };

    const clampOffset = (edge, value, size) => {
      const max = maxOffsetFor(edge, size);
      return Math.min(Math.max(value, MIN_GAP), max);
    };

    const updateDockAlignment = (size) => {
      if (!dock.edge || dock.offset == null)
        return;
      const max = maxOffsetFor(dock.edge, size);
      if (dock.offset <= max / 2) {
        dock.align = 'start';
        dock.gap = dock.offset;
      } else {
        dock.align = 'end';
        dock.gap = Math.max(0, max - dock.offset);
      }
    };

    const appliedOffsetFor = (size) => {
      if (!dock.edge || dock.offset == null)
        return null;
      const max = maxOffsetFor(dock.edge, size);

      if (dock.align === 'end' && typeof dock.gap === 'number') {
        return clampOffset(dock.edge, max - dock.gap, size);
      }
      if (dock.align === 'start' && typeof dock.gap === 'number') {
        return clampOffset(dock.edge, dock.gap, size);
      }
      return clampOffset(dock.edge, dock.offset, size);
    };

    const nearestEdgeAt = (x, y) => {
      const { w, h } = vvSize();
      const d = { left: x, right: w - x, top: y, bottom: h - y };
      return Object.keys(d).reduce((a, b) => (d[a] < d[b] ? a : b));
    };

    const cornerDefaultDock = () => {
      const vv = vvSize();
      const size = previewSize();
      const offset = Math.max(MIN_GAP, vv.w - size.w - MIN_GAP);
      return { edge: 'bottom', offset };
    };

    const currentTransformOrigin = () => {
      if (!dock.edge) return null;
      if (dock.edge === 'left' || dock.edge === 'top')
        return 'top left';
      if (dock.edge === 'right')
        return 'top right';
      return 'bottom left';
    };

    // =========================
    // Persist / load dock
    // =========================
    const loadDock = () => {
      const raw = safeGet(POS_KEYS.position);
      if (!raw)
        return;
      try {
        const parsed = JSON.parse(raw);
        const { edge, offset, align, gap } = parsed || {};
        if (!['left', 'right', 'top', 'bottom'].includes(edge))
          return;
        if (typeof offset !== 'number')
          return;

        dock.edge = edge;
        dock.offset = clampOffset(edge, offset, previewSize());
        dock.align = align === 'start' || align === 'end' ? align : null;
        dock.gap = typeof gap === 'number' ? gap : null;

        if (!dock.align || dock.gap == null)
          updateDockAlignment(previewSize());
      } catch {}
    };

    const persistDock = () => {
      if (!dock.edge || dock.offset == null)
        return; 
      safeSet(POS_KEYS.position, JSON.stringify({
        edge: dock.edge,
        offset: dock.offset,
        align: dock.align,
        gap: dock.gap
      }));
    };

    // =========================
    // Apply dock
    // =========================
    const dockToVars = (vars) => ({
      set: (side, v) => host.style.setProperty(vars[side], v),
      clear: (side) => host.style.removeProperty(vars[side])
    });

    const dockToEl = (node) => ({
      set: (side, v) => { node.style[side] = v; },
      clear: (side) => { node.style[side] = ''; }
    });

    const applyDock = (target, size, opts) => {
      if (!dock.edge || dock.offset == null) {
        target.clear('left');
        target.clear('top');
        target.clear('right');
        target.clear('bottom');
        return;
      }

      target.set('left', 'auto');
      target.set('top', 'auto');
      target.set('right', 'auto');
      target.set('bottom', 'auto');

      const applied = appliedOffsetFor(size);

      if (dock.edge === 'left') {
        target.set('left', MIN_GAP + 'px');
        target.set('top', applied + 'px');
      } else if (dock.edge === 'right') {
        target.set('right', MIN_GAP + 'px');
        target.set('top', applied + 'px');
      } else if (dock.edge === 'top') {
        target.set('top', MIN_GAP + 'px');
        target.set('left', applied + 'px');
      } else {
        target.set('bottom', MIN_GAP + 'px');
        target.set('left', applied + 'px');
      }

      if (!opts || opts.persist !== false)
        persistDock();
    };

    const applyDockAll = (opts) => {
      applyDock(dockToVars(CSS_VARS.pip), previewSize(), opts);
      applyDock(dockToVars(CSS_VARS.preview), previewSize(), opts);
      applyDock(dockToEl(pipRestoreButton), sizeForTarget(pipRestoreButton), opts);
    };

    const repaintToDock = () => {
      if (!dock.edge || dock.offset == null)
        return;
      const origin = currentTransformOrigin();
      if (origin)
        setVar('--error-pip-origin', origin);
      else 
        unsetVar('--error-pip-origin');
      applyDockAll({ persist: false });
    };

    // =========================
    // Hidden state + UI
    // =========================
    const loadHidden = () => {
      const rawPretty = safeGet(POS_KEYS.hiddenPretty);
      if (rawPretty != null)
        isPrettyHidden = rawPretty === '1' || rawPretty === 'true';
      const rawPreview = safeGet(POS_KEYS.hiddenPreview);
      if (rawPreview != null)
        isPreviewHidden = rawPreview === '1' || rawPreview === 'true';
    };

    const setPrettyHidden = (v) => {
      isPrettyHidden = !!v;
      safeSet(POS_KEYS.hiddenPretty, isPrettyHidden ? '1' : '0');
      updateUI();
    };

    const setPreviewHidden = (v) => {
      isPreviewHidden = !!v;
      safeSet(POS_KEYS.hiddenPreview, isPreviewHidden ? '1' : '0');
      updateUI();
    };

    const isMinimized = () => iframe.hasAttribute('inert');

    const setMinimized = (v) => {
      if (v) {
        iframe.setAttribute('inert', '');
        toggle.setAttribute('aria-expanded', 'false');
      } else {
        iframe.removeAttribute('inert');
        toggle.setAttribute('aria-expanded', 'true');
      }
    };

    const setRestoreLabel = (kind) => {
      if (kind === 'pretty') {
        pipRestoreButton.innerHTML = '<span aria-hidden="true">⟲</span><span>Show error overlay</span>';
        pipRestoreButton.setAttribute('aria-label', 'Show error overlay');
      } else {
        pipRestoreButton.innerHTML = '<span aria-hidden="true">⟲</span><span>Show error page</span>';
        pipRestoreButton.setAttribute('aria-label', 'Show error page');
      }
    };

    const updateUI = () => {
      const minimized = isMinimized();
      const showPiP = minimized && !isPrettyHidden;
      const showPreview = !minimized && !isPreviewHidden;
      const pipHiddenByUser = minimized && isPrettyHidden;
      const previewHiddenByUser = !minimized && isPreviewHidden;
      const showToggle = minimized ? showPiP : showPreview;
      const showRestore = pipHiddenByUser || previewHiddenByUser;

      hide(iframe, pipHiddenByUser);
      hide(preview, !showPreview);
      hide(toggle, !showToggle);
      hide(pipCloseButton, !showToggle);
      hide(pipRestoreButton, !showRestore);

      pipCloseButton.setAttribute('aria-label', minimized ? 'Hide error overlay' : 'Hide error page preview');

      if (pipHiddenByUser)
        setRestoreLabel('pretty');
      else if (previewHiddenByUser)
        setRestoreLabel('preview');

      host.classList.toggle('pip-hidden', isPrettyHidden);
      host.classList.toggle('preview-hidden', isPreviewHidden);
    };

    // =========================
    // Preview snapshot
    // =========================
    const updatePreview = () => {
      try {
        let previewIframe = preview.querySelector('iframe');
        if (!previewIframe) {
          previewIframe = el('iframe');
          previewIframe.style.cssText = 'width: 1200px; height: 900px; transform: scale(0.2); transform-origin: top left; border: none;';
          previewIframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
          preview.appendChild(previewIframe);
        }

        const doctype = document.doctype ? '<!DOCTYPE ' + document.doctype.name + '>' : '';
        const cleanedHTML = document.documentElement.outerHTML
          .replace(/<nuxt-error-overlay[^>]*>.*?<\\/nuxt-error-overlay>/gs, '')
          .replace(/<script[^>]*>.*?<\\/script>/gs, '');

        const iframeDoc = previewIframe.contentDocument || previewIframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(doctype + cleanedHTML);
        iframeDoc.close();
      } catch (err) {
        console.error('Failed to update preview:', err);
      }
    };

    // =========================
    // View toggling
    // =========================
    const toggleView = () => {
      if (isMinimized()) {
        updatePreview();
        setMinimized(false);
        liveRegion.textContent = 'Showing detailed error view';
        setTimeout(() => { 
          try { 
            iframe.contentWindow.focus();
          } catch {}
        }, 100);
      } else {
        setMinimized(true);
        liveRegion.textContent = 'Showing error page';
        repaintToDock();
        void iframe.offsetWidth;
      }
      updateUI();
    };

    // =========================
    // Dragging (unified, rAF throttled)
    // =========================
    let drag = null;
    let rafId = null;
    let suppressToggleClick = false;
    let suppressRestoreClick = false;

    const beginDrag = (e) => {
      if (drag) 
        return;

      if (!dock.edge || dock.offset == null) {
        const def = cornerDefaultDock();
        dock.edge = def.edge;
        dock.offset = def.offset;
        updateDockAlignment(previewSize());
      }

      const isRestoreTarget = e.currentTarget === pipRestoreButton;

      drag = {
        kind: isRestoreTarget ? 'restore' : (isMinimized() ? 'pip' : 'preview'),
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        moved: false,
        target: e.currentTarget
      };

      drag.target.setPointerCapture(e.pointerId);

      if (drag.kind === 'restore')
        host.classList.add('dragging-restore');
      else 
        host.classList.add(drag.kind === 'pip' ? 'dragging' : 'dragging-preview');

      e.preventDefault();
    };

    const moveDrag = (e) => {
      if (!drag || drag.pointerId !== e.pointerId)
        return;

      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      
      const dx = drag.lastX - drag.startX;
      const dy = drag.lastY - drag.startY;

      if (!drag.moved && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
        drag.moved = true;
      }

      if (!drag.moved)
        return;
      if (rafId)
        return;

      rafId = requestAnimationFrame(() => {
        rafId = null;

        const edge = nearestEdgeAt(drag.lastX, drag.lastY);
        const size = sizeForTarget(drag.target);

        let offset;
        if (edge === 'left' || edge === 'right') {
          const top = drag.lastY - (size.h / 2);
          offset = clampOffset(edge, Math.round(top), size);
        } else {
          const left = drag.lastX - (size.w / 2);
          offset = clampOffset(edge, Math.round(left), size);
        }

        dock.edge = edge;
        dock.offset = offset;
        updateDockAlignment(size);

        const origin = currentTransformOrigin();
        setVar('--error-pip-origin', origin || 'bottom right');

        applyDockAll({ persist: false });
      });
    };

    const endDrag = (e) => {
      if (!drag || drag.pointerId !== e.pointerId)
        return;

      const endedKind = drag.kind;
      drag.target.releasePointerCapture(e.pointerId);

      if (endedKind === 'restore')
        host.classList.remove('dragging-restore');
      else 
        host.classList.remove(endedKind === 'pip' ? 'dragging' : 'dragging-preview');

      const didMove = drag.moved;
      drag = null;

      if (didMove) {
        persistDock();
        if (endedKind === 'restore')
          suppressRestoreClick = true;
        else 
          suppressToggleClick = true;
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const bindDragTarget = (node) => {
      on(node, 'pointerdown', beginDrag);
      on(node, 'pointermove', moveDrag);
      on(node, 'pointerup', endDrag);
      on(node, 'pointercancel', endDrag);
    };

    bindDragTarget(toggle);
    bindDragTarget(pipRestoreButton);

    // =========================
    // Events (toggle / close / restore)
    // =========================
    on(toggle, 'click', (e) => {
      if (suppressToggleClick) {
        e.preventDefault();
        suppressToggleClick = false;
        return;
      }
      toggleView();
    });

    on(toggle, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleView();
      }
    });

    on(pipCloseButton, 'click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isMinimized())
        setPrettyHidden(true);
      else
        setPreviewHidden(true);
    });

    on(pipCloseButton, 'pointerdown', (e) => {
      e.stopPropagation();
    });

    on(pipRestoreButton, 'click', (e) => {
      if (suppressRestoreClick) {
        e.preventDefault();
        suppressRestoreClick = false;
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if (isMinimized()) 
        setPrettyHidden(false);
      else 
        setPreviewHidden(false);
    });

    // =========================
    // Lifecycle: load / sync / repaint
    // =========================
    const loadState = () => {
      loadDock();
      loadHidden();

      if (isPrettyHidden && !isMinimized())
        setMinimized(true);

      updateUI();
      repaintToDock();
    };

    loadState();

    on(window, 'storage-ready', () => {
      storageReady = true;
      loadState();
    });

    const onViewportChange = () => repaintToDock();

    on(window, 'resize', onViewportChange);

    if (window.visualViewport) {
      on(window.visualViewport, 'resize', onViewportChange);
      on(window.visualViewport, 'scroll', onViewportChange);
    }

    // initial preview
    setTimeout(updatePreview, 100);

    // initial minimized option
    if (${startMinimized}) {
      setMinimized(true);
      repaintToDock();
      void iframe.offsetWidth;
      updateUI();
    }
  } catch (err) {
    console.error('Failed to initialize Nuxt error overlay:', err);
  }
})();
`;
}
function generateErrorOverlayHTML(html, options) {
	const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
	const errorPage = html.replace("<head>", `<head><script>${iframeStorageBridge(nonce)}<\/script>`);
	const base64HTML = Buffer.from(errorPage, "utf8").toString("base64");
	return `
    <script>${parentStorageBridge(nonce)}<\/script>
    <nuxt-error-overlay></nuxt-error-overlay>
    <script>${webComponentScript(base64HTML, options?.startMinimized ?? false)}<\/script>
  `;
}

const errorHandler$0 = (async function errorhandler(error, event, { defaultHandler }) {
	if (event.handled || isJsonRequest(event)) {
		
		return;
	}
	
	const defaultRes = await defaultHandler(error, event, { json: true });
	
	const status = error.status || error.statusCode || 500;
	if (status === 404 && defaultRes.status === 302) {
		setResponseHeaders(event, defaultRes.headers);
		setResponseStatus(event, defaultRes.status, defaultRes.statusText);
		return send(event, JSON.stringify(defaultRes.body, null, 2));
	}
	if (typeof defaultRes.body !== "string" && Array.isArray(defaultRes.body.stack)) {
		
		defaultRes.body.stack = defaultRes.body.stack.join("\n");
	}
	const errorObject = defaultRes.body;
	
	const url = new URL(errorObject.url);
	errorObject.url = withoutBase(url.pathname, useRuntimeConfig(event).app.baseURL) + url.search + url.hash;
	
	errorObject.message = error.unhandled ? errorObject.message || "Server Error" : error.message || errorObject.message || "Server Error";
	
	errorObject.data ||= error.data;
	errorObject.statusText ||= error.statusText || error.statusMessage;
	delete defaultRes.headers["content-type"];
	delete defaultRes.headers["content-security-policy"];
	setResponseHeaders(event, defaultRes.headers);
	
	const reqHeaders = getRequestHeaders(event);
	
	const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"] || !!event.context.nuxt?.["~rendering-error"];
	if (!isRenderingError) {
		event.context.nuxt ||= {};
		event.context.nuxt["~rendering-error"] = true;
	}
	
	const res = isRenderingError ? null : await useNitroApp().localFetch(withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject), {
		headers: {
			...reqHeaders,
			"x-nuxt-error": "true"
		},
		redirect: "manual"
	}).catch(() => null);
	if (event.handled) {
		return;
	}
	
	if (!res) {
		const { template } = await Promise.resolve().then(function () { return error500; });
		{
			
			errorObject.description = errorObject.message;
		}
		setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
		return send(event, template(errorObject));
	}
	const html = await res.text();
	for (const [header, value] of res.headers.entries()) {
		if (header === "set-cookie") {
			appendResponseHeader(event, header, value);
			continue;
		}
		setResponseHeader(event, header, value);
	}
	setResponseStatus(event, res.status && res.status !== 200 ? res.status : defaultRes.status, res.statusText || defaultRes.statusText);
	if (!globalThis._importMeta_.test && typeof html === "string") {
		const prettyResponse = await defaultHandler(error, event, { json: false });
		if (typeof prettyResponse.body === "string") {
			return send(event, html.replace("</body>", `${generateErrorOverlayHTML(prettyResponse.body, { startMinimized: 300 <= status && status < 500 })}</body>`));
		}
	}
	return send(event, html);
});

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  async function defaultNitroErrorHandler(error, event) {
    const res = await defaultHandler(error, event);
    if (!event.node?.res.headersSent) {
      setResponseHeaders(event, res.headers);
    }
    setResponseStatus(event, res.status, res.statusText);
    return send(
      event,
      typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2)
    );
  }
);
async function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  await loadStackTrace(error).catch(consola.error);
  const youch = new Youch();
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    const ansiError = await (await youch.toANSI(error)).replaceAll(process.cwd(), ".");
    consola.error(
      `[request error] ${tags} [${event.method}] ${url}

`,
      ansiError
    );
  }
  const useJSON = opts?.json ?? !getRequestHeader(event, "accept")?.includes("text/html");
  const headers = {
    "content-type": useJSON ? "application/json" : "text/html",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';"
  };
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = useJSON ? {
    error: true,
    url,
    statusCode,
    statusMessage,
    message: error.message,
    data: error.data,
    stack: error.stack?.split("\n").map((line) => line.trim())
  } : await youch.toHTML(error, {
    request: {
      url: url.href,
      method: event.method,
      headers: getRequestHeaders(event)
    }
  });
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}
async function loadStackTrace(error) {
  if (!(error instanceof Error)) {
    return;
  }
  const parsed = await new ErrorParser().defineSourceLoader(sourceLoader).parse(error);
  const stack = error.message + "\n" + parsed.frames.map((frame) => fmtFrame(frame)).join("\n");
  Object.defineProperty(error, "stack", { value: stack });
  if (error.cause) {
    await loadStackTrace(error.cause).catch(consola.error);
  }
}
async function sourceLoader(frame) {
  if (!frame.fileName || frame.fileType !== "fs" || frame.type === "native") {
    return;
  }
  if (frame.type === "app") {
    const rawSourceMap = await readFile(`${frame.fileName}.map`, "utf8").catch(() => {
    });
    if (rawSourceMap) {
      const consumer = await new SourceMapConsumer(rawSourceMap);
      const originalPosition = consumer.originalPositionFor({ line: frame.lineNumber, column: frame.columnNumber });
      if (originalPosition.source && originalPosition.line) {
        frame.fileName = resolve(dirname(frame.fileName), originalPosition.source);
        frame.lineNumber = originalPosition.line;
        frame.columnNumber = originalPosition.column || 0;
      }
    }
  }
  const contents = await readFile(frame.fileName, "utf8").catch(() => {
  });
  return contents ? { contents } : void 0;
}
function fmtFrame(frame) {
  if (frame.type === "native") {
    return frame.raw;
  }
  const src = `${frame.fileName || ""}:${frame.lineNumber}:${frame.columnNumber})`;
  return frame.functionName ? `at ${frame.functionName} (${src}` : `at ${src}`;
}

const errorHandlers = [errorHandler$0, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const rootDir = "C:/Users/hp/husky-pass-crm";

const appHead = {"meta":[{"charset":"utf-8"},{"name":"viewport","content":"width=device-width, initial-scale=1"},{"name":"description","content":"Husky Pass CRM para guardería y Personas Autorizadas"}],"link":[{"rel":"icon","type":"image/png","href":"/brand/husky-pass-logo.png"},{"rel":"apple-touch-icon","href":"/brand/husky-pass-logo.png"},{"key":"gf-prefetch","rel":"dns-prefetch","href":"https://fonts.gstatic.com/"},{"key":"gf-preconnect","rel":"preconnect","href":"https://fonts.gstatic.com/","crossorigin":"anonymous"},{"key":"gf-origin-preconnect","rel":"preconnect","href":"https://fonts.googleapis.com/"},{"key":"gf-style","rel":"stylesheet","href":"https://fonts.googleapis.com/css2?family=Montserrat:wght@600&family=Fredoka:wght@600&display=swap"}],"style":[],"script":[],"noscript":[],"htmlAttrs":{"lang":"es"},"title":"Husky Pass CRM"};

const appRootTag = "div";

const appRootAttrs = {"id":"__nuxt"};

const appTeleportTag = "div";

const appTeleportAttrs = {"id":"teleports"};

const appId = "nuxt-app";

const devReducers = {
	VNode: (data) => isVNode(data) ? {
		type: data.type,
		props: data.props
	} : undefined,
	URL: (data) => data instanceof URL ? data.toString() : undefined,
	Symbol: (data) => typeof data === "symbol" ? data.description ?? "" : undefined
};
const asyncContext = getContext("nuxt-dev", {
	asyncContext: true,
	AsyncLocalStorage
});
const _qzlXhAfOJ4ngm5R1WSuxBrdS4A1Pzl7VT3b7ampGy8A = (nitroApp) => {
	const handler = nitroApp.h3App.handler;
	nitroApp.h3App.handler = (event) => {
		return asyncContext.callAsync({
			logs: [],
			event
		}, () => handler(event));
	};
	onConsoleLog((_log) => {
		const ctx = asyncContext.tryUse();
		if (!ctx) {
			return;
		}
		const rawStack = captureRawStackTrace();
		if (!rawStack || rawStack.includes("runtime/vite-node.mjs")) {
			return;
		}
		const trace = [];
		let filename = "";
		for (const entry of parseRawStackTrace(rawStack)) {
			if (entry.source === globalThis._importMeta_.url) {
				continue;
			}
			if (EXCLUDE_TRACE_RE.test(entry.source)) {
				continue;
			}
			filename ||= entry.source.replace(withTrailingSlash(rootDir), "");
			trace.push({
				...entry,
				source: entry.source.startsWith("file://") ? entry.source.replace("file://", "") : entry.source
			});
		}
		const log = {
			..._log,
			
			filename,
			
			stack: trace
		};
		
		ctx.logs.push(log);
	});
	nitroApp.hooks.hook("afterResponse", () => {
		const ctx = asyncContext.tryUse();
		if (!ctx) {
			return;
		}
		return nitroApp.hooks.callHook("dev:ssr-logs", {
			logs: ctx.logs,
			path: ctx.event.path
		});
	});
	
	nitroApp.hooks.hook("render:html", (htmlContext) => {
		const ctx = asyncContext.tryUse();
		if (!ctx) {
			return;
		}
		try {
			const reducers = Object.assign(Object.create(null), devReducers, ctx.event.context["~payloadReducers"]);
			htmlContext.bodyAppend.unshift(`<script type="application/json" data-nuxt-logs="${appId}">${stringify(ctx.logs, reducers)}<\/script>`);
		} catch (e) {
			const shortError = e instanceof Error && "toString" in e ? ` Received \`${e.toString()}\`.` : "";
			console.warn(`[nuxt] Failed to stringify dev server logs.${shortError} You can define your own reducer/reviver for rich types following the instructions in https://nuxt.com/docs/api/composables/use-nuxt-app#payload.`);
		}
	});
};
const EXCLUDE_TRACE_RE = /\/node_modules\/(?:.*\/)?(?:nuxt|nuxt-nightly|nuxt-edge|nuxt3|consola|@vue)\/|core\/runtime\/nitro/;
function onConsoleLog(callback) {
	consola$1.addReporter({ log(logObj) {
		callback(logObj);
	} });
	consola$1.wrapConsole();
}

const LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  fatal: 50
};
const SENSITIVE_KEY = /(password|contrasena|token|cookie|secret|private|key|curp|email|correo|mail|nombre|paterno|materno|familia|payload|sql|query|foto|photo)/i;
const IDENTIFIER_KEY = /(matricula|username|login|userId|id)$/i;
function configuredLevel() {
  if (process.env.HUSKY_PASS_DEBUG === "1" || process.env.PERSONAS_DIAGNOSTICS === "1") return "debug";
  const raw = String(process.env.HUSKY_PASS_LOG_LEVEL || process.env.LOG_LEVEL || "").toLowerCase();
  return raw === "debug" || raw === "info" || raw === "warn" || raw === "error" || raw === "fatal" ? raw : "warn";
}
function shouldLog(level) {
  return LEVELS[level] >= LEVELS[configuredLevel()];
}
function shortHash(value) {
  return createHash("sha256").update(String(value != null ? value : "")).digest("hex").slice(0, 12);
}
function redactValue(key, value) {
  if (value === void 0) return void 0;
  if (value === null) return null;
  if (value instanceof Error) return errorSummary(value);
  if (Array.isArray(value)) return value.slice(0, 12).map((item) => redactValue(key, item));
  if (typeof value === "object") return redactContext(value);
  if (SENSITIVE_KEY.test(key)) return { redacted: true, hash: shortHash(value) };
  if (IDENTIFIER_KEY.test(key) && String(value).trim()) return { hash: shortHash(value) };
  return value;
}
function redactContext(context = {}) {
  const safe = {};
  for (const [key, value] of Object.entries(context)) {
    const redacted = redactValue(key, value);
    if (redacted !== void 0) safe[key] = redacted;
  }
  return safe;
}
function errorSummary(error) {
  var _a;
  if (!error || typeof error !== "object") return { message: String(error || "unknown") };
  const candidate = error;
  return {
    message: candidate.message || candidate.statusMessage || "unknown",
    code: candidate.code,
    errno: candidate.errno,
    sqlState: candidate.sqlState,
    statusCode: candidate.statusCode,
    statusMessage: candidate.statusMessage,
    stack: (_a = candidate.stack) == null ? void 0 : _a.split("\n").slice(0, 3).join("\n")
  };
}
function ensureRequestId(event) {
  if (!event) return randomUUID();
  const context = event.context;
  if (typeof context.requestId === "string") return context.requestId;
  const incoming = getHeader(event, "x-request-id") || getHeader(event, "x-correlation-id");
  const requestId = incoming && incoming.length <= 80 ? incoming : randomUUID();
  context.requestId = requestId;
  setHeader(event, "x-request-id", requestId);
  return requestId;
}
function routeContext(event) {
  if (!event) return {};
  const url = getRequestURL(event);
  return {
    requestId: ensureRequestId(event),
    method: event.method,
    route: url.pathname
  };
}
function logEvent(level, message, context = {}, event) {
  if (!shouldLog(level)) return;
  const payload = {
    level,
    at: (/* @__PURE__ */ new Date()).toISOString(),
    message,
    ...routeContext(event),
    ...redactContext(context)
  };
  const requestId = typeof payload.requestId === "string" ? ` request=${payload.requestId}` : "";
  const route = typeof payload.route === "string" ? ` route=${payload.route}` : "";
  console[level === "fatal" ? "error" : level](`[${level}] ${message}${requestId}${route} ${JSON.stringify(payload)}`);
}
function logErrorOnce(event, operation, error, context = {}) {
  const requestId = ensureRequestId(event);
  const summary = errorSummary(error);
  const key = `${operation}:${summary.statusCode || ""}:${summary.code || ""}:${summary.message || ""}`;
  const eventContext = event.context;
  const logged = eventContext.loggedErrorKeys instanceof Set ? eventContext.loggedErrorKeys : /* @__PURE__ */ new Set();
  eventContext.loggedErrorKeys = logged;
  if (logged.has(key)) return;
  logged.add(key);
  logEvent("error", operation, { ...context, error: summary, requestId }, event);
}
async function withRequestBoundary(event, operation, run, context = {}, options = {}) {
  var _a;
  const startedAt = performance.now();
  try {
    const result = await run();
    logEvent("debug", operation, { ...context, durationMs: Math.round(performance.now() - startedAt) }, event);
    return result;
  } catch (error) {
    const summary = errorSummary(error);
    const statusCode = Number(summary.statusCode || 0);
    if ((_a = options.expectedStatusCodes) == null ? void 0 : _a.includes(statusCode)) {
      logEvent("debug", operation, { ...context, durationMs: Math.round(performance.now() - startedAt), error: summary }, event);
    } else {
      logErrorOnce(event, operation, error, { ...context, durationMs: Math.round(performance.now() - startedAt) });
    }
    throw error;
  }
}

const _0AbUws0sxsrcFs8obyuKYIB3YhQSzVmiezcJHvx5Qqs = defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    ensureRequestId(event);
  });
});

const plugins = [
  _qzlXhAfOJ4ngm5R1WSuxBrdS4A1Pzl7VT3b7ampGy8A,
_0AbUws0sxsrcFs8obyuKYIB3YhQSzVmiezcJHvx5Qqs,
_wH6JrtIxmaSoA8lCPWFnE9z4lQeXW6H5z3l5aymEQw
];

const assets = {};

function readAsset (id) {
  const serverDir = dirname$1(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve$1(serverDir, assets[id].path))
}

const publicAssetBases = {};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _cP7GM5 = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError({ statusCode: 404 });
    }
    return;
  }
  if (asset.encoding !== void 0) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const VueResolver = (_, value) => {
  return isRef(value) ? toValue(value) : value;
};

const headSymbol = "usehead";
// @__NO_SIDE_EFFECTS__
function vueInstall(head) {
  const plugin = {
    install(app) {
      app.config.globalProperties.$unhead = head;
      app.config.globalProperties.$head = head;
      app.provide(headSymbol, head);
    }
  };
  return plugin.install;
}

// @__NO_SIDE_EFFECTS__
function resolveUnrefHeadInput(input) {
  return walkResolver(input, VueResolver);
}

function filterIslandProps(props) {
  if (!props) {
    return {};
  }
  const out = {};
  for (const key in props) {
    if (!key.startsWith("data-v-")) {
      out[key] = props[key];
    }
  }
  return out;
}
function computeIslandHash(name, filteredProps, context, source) {
  return hash$1([name, filteredProps, context, source]).replace(/[-_]/g, "");
}

const NUXT_RUNTIME_PAYLOAD_EXTRACTION = false;

// @__NO_SIDE_EFFECTS__
function createHead(options = {}) {
  const head = createHead$1({
    ...options,
    propResolvers: [VueResolver]
  });
  head.install = vueInstall(head);
  return head;
}

const unheadOptions = {
  disableDefaults: true,
  disableCapoSorting: false,
  plugins: [DeprecationsPlugin, PromisesPlugin, TemplateParamsPlugin, AliasSortingPlugin],
};

function encodeEventPath(path) {
	const queryIndex = path.indexOf("?");
	if (queryIndex === -1) {
		return encodePath(path);
	}
	return encodePath(path.slice(0, queryIndex)) + path.slice(queryIndex);
}
function createSSRContext(event) {
	const url = encodeEventPath(event.path);
	const ssrContext = {
		url,
		event,
		runtimeConfig: useRuntimeConfig(event),
		noSSR: event.context.nuxt?.noSSR || (false),
		head: createHead(unheadOptions),
		error: false,
		nuxt: undefined,
		payload: {},
		["~payloadReducers"]: Object.create(null),
		modules: new Set()
	};
	return ssrContext;
}
function setSSRError(ssrContext, error) {
	ssrContext.error = true;
	ssrContext.payload = { error };
	ssrContext.url = error.url;
}

function buildAssetsDir() {
	
	return useRuntimeConfig().app.buildAssetsDir;
}
function buildAssetsURL(...path) {
	return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path);
}
function publicAssetsURL(...path) {
	
	const app = useRuntimeConfig().app;
	const publicBase = app.cdnURL || app.baseURL;
	return path.length ? joinRelativeURL(publicBase, ...path) : publicBase;
}

// @ts-expect-error private property consumed by vite-generated url helpers
globalThis.__buildAssetsURL = buildAssetsURL;
// @ts-expect-error private property consumed by vite-generated url helpers
globalThis.__publicAssetsURL = publicAssetsURL;
const APP_ROOT_OPEN_TAG = `<${appRootTag}${propsToString(appRootAttrs)}>`;
const APP_ROOT_CLOSE_TAG = `</${appRootTag}>`;
// @ts-expect-error file will be produced after app build
const getServerEntry = () => Promise.resolve().then(function () { return server; }).then((r) => r.default || r);
// @ts-expect-error file will be produced after app build
const getClientManifest = () => Promise.resolve().then(function () { return client_manifest$1; }).then((r) => r.default || r).then((r) => typeof r === "function" ? r() : r);

const getSSRRenderer = lazyCachedFunction(async () => {
	
	const createSSRApp = await getServerEntry();
	if (!createSSRApp) {
		throw new Error("Server bundle is not available");
	}
	
	const precomputed = undefined ;
	
	const renderer = createRenderer(createSSRApp, {
		precomputed,
		manifest: await getClientManifest() ,
		renderToString: renderToString$1,
		buildAssetsURL
	});
	async function renderToString$1(input, context) {
		const html = await renderToString(input, context);
		
		
		if (process.env.NUXT_VITE_NODE_OPTIONS) {
			renderer.rendererContext.updateManifest(await getClientManifest());
		}
		return APP_ROOT_OPEN_TAG + html + APP_ROOT_CLOSE_TAG;
	}
	return renderer;
});

const getSPARenderer = lazyCachedFunction(async () => {
	const precomputed = undefined ;
	// @ts-expect-error virtual file
	const spaTemplate = await Promise.resolve().then(function () { return _virtual__spaTemplate; }).then((r) => r.template).catch(() => "").then((r) => {
		{
			return APP_ROOT_OPEN_TAG + r + APP_ROOT_CLOSE_TAG;
		}
	});
	
	const renderer = createRenderer(() => () => {}, {
		precomputed,
		manifest: await getClientManifest() ,
		renderToString: () => spaTemplate,
		buildAssetsURL
	});
	const result = await renderer.renderToString({});
	const renderToString = (ssrContext) => {
		const config = useRuntimeConfig(ssrContext.event);
		ssrContext.modules ||= new Set();
		ssrContext.payload.serverRendered = false;
		ssrContext.config = {
			public: config.public,
			app: config.app
		};
		return Promise.resolve(result);
	};
	return {
		rendererContext: renderer.rendererContext,
		renderToString
	};
});
function lazyCachedFunction(fn) {
	let res = null;
	return () => {
		if (res === null) {
			res = fn().catch((err) => {
				res = null;
				throw err;
			});
		}
		return res;
	};
}
function getRenderer(ssrContext) {
	return ssrContext.noSSR ? getSPARenderer() : getSSRRenderer();
}
// @ts-expect-error file will be produced after app build
const getSSRStyles = lazyCachedFunction(() => Promise.resolve().then(function () { return styles$1; }).then((r) => r.default || r));

async function renderInlineStyles(usedModules) {
	const styleMap = await getSSRStyles();
	const inlinedStyles = new Set();
	for (const mod of usedModules) {
		if (mod in styleMap && styleMap[mod]) {
			for (const style of await styleMap[mod]()) {
				inlinedStyles.add(style);
			}
		}
	}
	return Array.from(inlinedStyles).map((style) => ({ innerHTML: style }));
}

// @ts-expect-error virtual file
const ROOT_NODE_REGEX = new RegExp(`^<${appRootTag}[^>]*>([\\s\\S]*)<\\/${appRootTag}>$`);

function getServerComponentHTML(body) {
	const match = body.match(ROOT_NODE_REGEX);
	return match?.[1] || body;
}
const SSR_SLOT_TELEPORT_MARKER = /^uid=([^;]*);slot=(.*)$/;
const SSR_CLIENT_TELEPORT_MARKER = /^uid=([^;]*);client=(.*)$/;
const SSR_CLIENT_SLOT_MARKER = /^island-slot=([^;]*);(.*)$/;
function getSlotIslandResponse(ssrContext) {
	if (!ssrContext.islandContext || !Object.keys(ssrContext.islandContext.slots).length) {
		return undefined;
	}
	const response = {};
	for (const [name, slot] of Object.entries(ssrContext.islandContext.slots)) {
		response[name] = {
			...slot,
			fallback: ssrContext.teleports?.[`island-fallback=${name}`]
		};
	}
	return response;
}
function getClientIslandResponse(ssrContext) {
	if (!ssrContext.islandContext || !Object.keys(ssrContext.islandContext.components).length) {
		return undefined;
	}
	const response = {};
	for (const [clientUid, component] of Object.entries(ssrContext.islandContext.components)) {
		
		const html = ssrContext.teleports?.[clientUid]?.replaceAll("<!--teleport start anchor-->", "") || "";
		response[clientUid] = {
			...component,
			html,
			slots: getComponentSlotTeleport(clientUid, ssrContext.teleports ?? {})
		};
	}
	return response;
}
function getComponentSlotTeleport(clientUid, teleports) {
	const entries = Object.entries(teleports);
	const slots = {};
	for (const [key, value] of entries) {
		const match = key.match(SSR_CLIENT_SLOT_MARKER);
		if (match) {
			const [, id, slot] = match;
			if (!slot || clientUid !== id) {
				continue;
			}
			slots[slot] = value;
		}
	}
	return slots;
}
function replaceIslandTeleports(ssrContext, html) {
	const { teleports, islandContext } = ssrContext;
	if (islandContext || !teleports) {
		return html;
	}
	for (const key in teleports) {
		const matchClientComp = key.match(SSR_CLIENT_TELEPORT_MARKER);
		if (matchClientComp) {
			const [, uid, clientId] = matchClientComp;
			if (!uid || !clientId) {
				continue;
			}
			html = html.replace(new RegExp(` data-island-uid="${uid}" data-island-component="${clientId}"[^>]*>`), (full) => {
				return full + teleports[key];
			});
			continue;
		}
		const matchSlot = key.match(SSR_SLOT_TELEPORT_MARKER);
		if (matchSlot) {
			const [, uid, slot] = matchSlot;
			if (!uid || !slot) {
				continue;
			}
			html = html.replace(new RegExp(` data-island-uid="${uid}" data-island-slot="${slot}"[^>]*>`), (full) => {
				return full + teleports[key];
			});
		}
	}
	return html;
}

const ISLAND_SUFFIX_RE = /\.json(?:\?.*)?$/;
const handler$1 = defineEventHandler(async (event) => {
	const nitroApp = useNitroApp();
	setResponseHeaders(event, {
		"content-type": "application/json;charset=utf-8",
		"x-powered-by": "Nuxt"
	});
	const islandContext = await getIslandContext(event);
	const ssrContext = {
		...createSSRContext(event),
		islandContext,
		noSSR: false,
		url: islandContext.url
	};
	
	const renderer = await getSSRRenderer();
	const renderResult = await renderer.renderToString(ssrContext).catch(async (err) => {
		if (ssrContext["~renderResponse"] && err?.message === "skipping render") {
			return {};
		}
		await ssrContext.nuxt?.hooks.callHook("app:error", err);
		throw err;
	});
	
	
	await ssrContext.nuxt?.hooks.callHook("app:rendered", {
		ssrContext,
		renderResult
	});
	if (ssrContext["~renderResponse"]) {
		const response = ssrContext["~renderResponse"];
		if (response.statusCode && response.statusCode >= 400) {
			throw createError({
				statusCode: response.statusCode,
				statusMessage: response.statusMessage
			});
		}
		return returnIslandResponse(event, response);
	}
	
	if (ssrContext.payload?.error) {
		throw ssrContext.payload.error;
	}
	const inlinedStyles = await renderInlineStyles(ssrContext.modules ?? []);
	if (inlinedStyles.length) {
		ssrContext.head.push({ style: inlinedStyles });
	}
	{
		const { styles } = getRequestDependencies(ssrContext, renderer.rendererContext);
		const link = [];
		for (const resource of Object.values(styles)) {
			
			if ("inline" in getQuery(resource.file)) {
				continue;
			}
			
			
			if (resource.file.includes("scoped") && !resource.file.includes("pages/")) {
				link.push({
					rel: "stylesheet",
					href: renderer.rendererContext.buildAssetsURL(resource.file),
					crossorigin: ""
				});
			}
		}
		if (link.length) {
			ssrContext.head.push({ link }, { mode: "server" });
		}
	}
	const islandHead = {};
	for (const entry of ssrContext.head.entries.values()) {
		
		for (const [key, value] of Object.entries(resolveUnrefHeadInput(entry.input))) {
			const currentValue = islandHead[key];
			if (Array.isArray(currentValue)) {
				currentValue.push(...value);
			} else {
				islandHead[key] = value;
			}
		}
	}
	
	islandHead.link ||= [];
	islandHead.style ||= [];
	const islandResponse = {
		id: islandContext.id,
		head: islandHead,
		html: getServerComponentHTML(renderResult.html),
		components: getClientIslandResponse(ssrContext),
		slots: getSlotIslandResponse(ssrContext)
	};
	await nitroApp.hooks.callHook("render:island", islandResponse, {
		event,
		islandContext
	});
	return islandResponse;
});
function returnIslandResponse(event, response) {
	for (const header in response.headers || {}) {
		setResponseHeader(event, header, response.headers[header]);
	}
	if (response.statusCode) {
		setResponseStatus(event, response.statusCode, response.statusMessage);
	}
	return response.body;
}
const ISLAND_PATH_PREFIX = "/__nuxt_island/";
const VALID_COMPONENT_NAME_RE = /^[a-z][\w.-]*$/i;
async function getIslandContext(event) {
	let url = event.path || "";
	url.replace(/\?.*$/, "");
	if (!url.startsWith(ISLAND_PATH_PREFIX)) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid island request path"
		});
	}
	const componentParts = url.substring(ISLAND_PATH_PREFIX.length).replace(ISLAND_SUFFIX_RE, "").split("_");
	const hashId = componentParts.length > 1 ? componentParts.pop() : undefined;
	const componentName = componentParts.join("_");
	if (!componentName || !VALID_COMPONENT_NAME_RE.test(componentName)) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid island component name"
		});
	}
	const rawContext = event.method === "GET" ? getQuery$1(event) : await readBody(event);
	const rawProps = destr$1(rawContext?.props) || {};
	const filteredProps = filterIslandProps(rawProps);
	
	
	const clientContext = {};
	if (rawContext && typeof rawContext === "object") {
		for (const key in rawContext) {
			if (key !== "props") {
				clientContext[key] = rawContext[key];
			}
		}
	}
	
	
	const expectedHash = computeIslandHash(componentName, filteredProps, clientContext, undefined);
	if (!hashId || hashId !== expectedHash) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid island request hash"
		});
	}
	return {
		url: typeof rawContext?.url === "string" ? rawContext.url : "/",
		id: hashId,
		name: componentName,
		props: rawProps,
		slots: {},
		components: {}
	};
}

const _lazy_ShYIWR = () => Promise.resolve().then(function () { return latestPreview_get$1; });
const _lazy_tVYiaj = () => Promise.resolve().then(function () { return export_get$1; });
const _lazy_9wdYUT = () => Promise.resolve().then(function () { return index_get$7; });
const _lazy_VhtT8_ = () => Promise.resolve().then(function () { return _id__get$3; });
const _lazy_1pRMq5 = () => Promise.resolve().then(function () { return index_get$5; });
const _lazy_BFaPiJ = () => Promise.resolve().then(function () { return index_post$3; });
const _lazy_yMvVJq = () => Promise.resolve().then(function () { return accessAction_post$1; });
const _lazy_17UDpB = () => Promise.resolve().then(function () { return config_get$3; });
const _lazy_ILLGNL = () => Promise.resolve().then(function () { return config_post$1; });
const _lazy_jNMB3z = () => Promise.resolve().then(function () { return marbete_get$3; });
const _lazy_oZSW4D = () => Promise.resolve().then(function () { return passSearch_get$1; });
const _lazy_OmjHVG = () => Promise.resolve().then(function () { return readiness_get$1; });
const _lazy_IKFBAq = () => Promise.resolve().then(function () { return uploads_post$3; });
const _lazy_Fsmabm = () => Promise.resolve().then(function () { return envCheck_get$1; });
const _lazy_ewha7O = () => Promise.resolve().then(function () { return users_get$1; });
const _lazy_8PUlEh = () => Promise.resolve().then(function () { return google_post$1; });
const _lazy_QhbbkW = () => Promise.resolve().then(function () { return impersonate_post$1; });
const _lazy_LKTpZh = () => Promise.resolve().then(function () { return previewDaycare_post$1; });
const _lazy_M6__jl = () => Promise.resolve().then(function () { return exit_post$1; });
const _lazy_iclYMn = () => Promise.resolve().then(function () { return login_post$1; });
const _lazy_nqxUNF = () => Promise.resolve().then(function () { return logout_post$1; });
const _lazy_FYhNX3 = () => Promise.resolve().then(function () { return me_get$1; });
const _lazy_lxUhLh = () => Promise.resolve().then(function () { return change_post$1; });
const _lazy_8lrhhj = () => Promise.resolve().then(function () { return forgot_post$1; });
const _lazy_vTNf0Y = () => Promise.resolve().then(function () { return reset_get$1; });
const _lazy_vkQvxo = () => Promise.resolve().then(function () { return reset_post$1; });
const _lazy_Jm_EC8 = () => Promise.resolve().then(function () { return familyAccounts_get$1; });
const _lazy_8icRIj = () => Promise.resolve().then(function () { return familyAccounts_post$1; });
const _lazy_IrbAoh = () => Promise.resolve().then(function () { return resources_get$3; });
const _lazy_RwmUo7 = () => Promise.resolve().then(function () { return resources_post$1; });
const _lazy_ly5Z1R = () => Promise.resolve().then(function () { return _id__delete$3; });
const _lazy_MJIZbF = () => Promise.resolve().then(function () { return _id__patch$1; });
const _lazy_toSB1J = () => Promise.resolve().then(function () { return salas_get$1; });
const _lazy_bP74Z3 = () => Promise.resolve().then(function () { return _id__get$1; });
const _lazy_FEsrYT = () => Promise.resolve().then(function () { return overview_get$3; });
const _lazy_osqEg0 = () => Promise.resolve().then(function () { return overview_get$1; });
const _lazy_36SAam = () => Promise.resolve().then(function () { return uploads_post$1; });
const _lazy_ac1Kow = () => Promise.resolve().then(function () { return dashboard_get$1; });
const _lazy_JElniM = () => Promise.resolve().then(function () { return resources_get$1; });
const _lazy_ZSLfu7 = () => Promise.resolve().then(function () { return registration_post$1; });
const _lazy_sxKoeH = () => Promise.resolve().then(function () { return captcha_get$1; });
const _lazy_vLv_gY = () => Promise.resolve().then(function () { return options_get$3; });
const _lazy_YoznmN = () => Promise.resolve().then(function () { return options_get$1; });
const _lazy_SeTHMi = () => Promise.resolve().then(function () { return pass_get$1; });
const _lazy_1RP7SV = () => Promise.resolve().then(function () { return photo_get$1; });
const _lazy_bpJGUv = () => Promise.resolve().then(function () { return index_get$3; });
const _lazy_iIZjCA = () => Promise.resolve().then(function () { return motivo_post$1; });
const _lazy_tMULEp = () => Promise.resolve().then(function () { return config_get$1; });
const _lazy_nCUg1z = () => Promise.resolve().then(function () { return credential_get$1; });
const _lazy_XHZ0M1 = () => Promise.resolve().then(function () { return faces_post$1; });
const _lazy_W3IocC = () => Promise.resolve().then(function () { return _id__delete$1; });
const _lazy_650QUq = () => Promise.resolve().then(function () { return index_get$1; });
const _lazy_GJ5Q6K = () => Promise.resolve().then(function () { return index_post$1; });
const _lazy_rPysCP = () => Promise.resolve().then(function () { return marbete_get$1; });
const _lazy_MEHr80 = () => Promise.resolve().then(function () { return photoSource_post$1; });
const _lazy_Wncm5_ = () => Promise.resolve().then(function () { return scan_get$1; });
const _lazy_Fy8l0S = () => Promise.resolve().then(function () { return siblingSession_post$1; });
const _lazy_QdcB22 = () => Promise.resolve().then(function () { return studentPhoto_post$1; });
const _lazy_keXKVj = () => Promise.resolve().then(function () { return student_get$1; });
const _lazy_HeLzDH = () => Promise.resolve().then(function () { return student_post$1; });
const _lazy_ywsxUB = () => Promise.resolve().then(function () { return renderer; });

const handlers = [
  { route: '', handler: _cP7GM5, lazy: false, middleware: true, method: undefined },
  { route: '/api/__dev/password-recovery/latest-preview', handler: _lazy_ShYIWR, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/access-history/export', handler: _lazy_tVYiaj, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/access-history', handler: _lazy_9wdYUT, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/marbete-templates/:id', handler: _lazy_VhtT8_, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/marbete-templates', handler: _lazy_1pRMq5, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/marbete-templates', handler: _lazy_BFaPiJ, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/personas-autorizadas/access-action', handler: _lazy_yMvVJq, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/personas-autorizadas/config', handler: _lazy_17UDpB, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/personas-autorizadas/config', handler: _lazy_ILLGNL, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/personas-autorizadas/marbete', handler: _lazy_jNMB3z, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/personas-autorizadas/pass-search', handler: _lazy_oZSW4D, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/personas-autorizadas/readiness', handler: _lazy_OmjHVG, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/personas-autorizadas/uploads', handler: _lazy_IKFBAq, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/superadmin/env-check', handler: _lazy_Fsmabm, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/superadmin/users', handler: _lazy_ewha7O, lazy: true, middleware: false, method: "get" },
  { route: '/api/auth/admin/google', handler: _lazy_8PUlEh, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/admin/impersonate', handler: _lazy_QhbbkW, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/admin/preview-daycare', handler: _lazy_LKTpZh, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/impersonation/exit', handler: _lazy_M6__jl, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/login', handler: _lazy_iclYMn, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/logout', handler: _lazy_nqxUNF, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/me', handler: _lazy_FYhNX3, lazy: true, middleware: false, method: "get" },
  { route: '/api/auth/password/change', handler: _lazy_lxUhLh, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/password/forgot', handler: _lazy_8lrhhj, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/password/reset', handler: _lazy_vTNf0Y, lazy: true, middleware: false, method: "get" },
  { route: '/api/auth/password/reset', handler: _lazy_vkQvxo, lazy: true, middleware: false, method: "post" },
  { route: '/api/daycare/admin/family-accounts', handler: _lazy_Jm_EC8, lazy: true, middleware: false, method: "get" },
  { route: '/api/daycare/admin/family-accounts', handler: _lazy_8icRIj, lazy: true, middleware: false, method: "post" },
  { route: '/api/daycare/admin/resources', handler: _lazy_IrbAoh, lazy: true, middleware: false, method: "get" },
  { route: '/api/daycare/admin/resources', handler: _lazy_RwmUo7, lazy: true, middleware: false, method: "post" },
  { route: '/api/daycare/admin/resources/:id', handler: _lazy_ly5Z1R, lazy: true, middleware: false, method: "delete" },
  { route: '/api/daycare/admin/resources/:id', handler: _lazy_MJIZbF, lazy: true, middleware: false, method: "patch" },
  { route: '/api/daycare/admin/salas', handler: _lazy_toSB1J, lazy: true, middleware: false, method: "get" },
  { route: '/api/daycare/admin/salas/:id', handler: _lazy_bP74Z3, lazy: true, middleware: false, method: "get" },
  { route: '/api/daycare/admin/salas/:id/overview', handler: _lazy_FEsrYT, lazy: true, middleware: false, method: "get" },
  { route: '/api/daycare/admin/salas/overview', handler: _lazy_osqEg0, lazy: true, middleware: false, method: "get" },
  { route: '/api/daycare/admin/uploads', handler: _lazy_36SAam, lazy: true, middleware: false, method: "post" },
  { route: '/api/daycare/family/dashboard', handler: _lazy_ac1Kow, lazy: true, middleware: false, method: "get" },
  { route: '/api/daycare/family/resources', handler: _lazy_JElniM, lazy: true, middleware: false, method: "get" },
  { route: '/api/daycare/registration', handler: _lazy_ZSLfu7, lazy: true, middleware: false, method: "post" },
  { route: '/api/daycare/registration/captcha', handler: _lazy_sxKoeH, lazy: true, middleware: false, method: "get" },
  { route: '/api/daycare/registration/options', handler: _lazy_vLv_gY, lazy: true, middleware: false, method: "get" },
  { route: '/api/dev/husky-pass/options', handler: _lazy_YoznmN, lazy: true, middleware: false, method: "get" },
  { route: '/api/dev/husky-pass/pass', handler: _lazy_SeTHMi, lazy: true, middleware: false, method: "get" },
  { route: '/api/dev/husky-pass/photo', handler: _lazy_1RP7SV, lazy: true, middleware: false, method: "get" },
  { route: '/api/family/attendance', handler: _lazy_bpJGUv, lazy: true, middleware: false, method: "get" },
  { route: '/api/family/attendance/motivo', handler: _lazy_iIZjCA, lazy: true, middleware: false, method: "post" },
  { route: '/api/personas-autorizadas/config', handler: _lazy_tMULEp, lazy: true, middleware: false, method: "get" },
  { route: '/api/personas-autorizadas/credential', handler: _lazy_nCUg1z, lazy: true, middleware: false, method: "get" },
  { route: '/api/personas-autorizadas/faces', handler: _lazy_XHZ0M1, lazy: true, middleware: false, method: "post" },
  { route: '/api/personas-autorizadas/family/:id', handler: _lazy_W3IocC, lazy: true, middleware: false, method: "delete" },
  { route: '/api/personas-autorizadas/family', handler: _lazy_650QUq, lazy: true, middleware: false, method: "get" },
  { route: '/api/personas-autorizadas/family', handler: _lazy_GJ5Q6K, lazy: true, middleware: false, method: "post" },
  { route: '/api/personas-autorizadas/marbete', handler: _lazy_rPysCP, lazy: true, middleware: false, method: "get" },
  { route: '/api/personas-autorizadas/photo-source', handler: _lazy_MEHr80, lazy: true, middleware: false, method: "post" },
  { route: '/api/personas-autorizadas/scan', handler: _lazy_Wncm5_, lazy: true, middleware: false, method: "get" },
  { route: '/api/personas-autorizadas/sibling-session', handler: _lazy_Fy8l0S, lazy: true, middleware: false, method: "post" },
  { route: '/api/personas-autorizadas/student-photo', handler: _lazy_QdcB22, lazy: true, middleware: false, method: "post" },
  { route: '/api/personas-autorizadas/student', handler: _lazy_keXKVj, lazy: true, middleware: false, method: "get" },
  { route: '/api/personas-autorizadas/student', handler: _lazy_HeLzDH, lazy: true, middleware: false, method: "post" },
  { route: '/__nuxt_error', handler: _lazy_ywsxUB, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_island/**', handler: handler$1, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_ywsxUB, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(true),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter$1({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => callNodeRequestHandler(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return fetchNodeRequestHandler(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

function defineNitroPlugin(def) {
  return def;
}

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

const scheduledTasks = false;

const tasks = {
  
};

const __runningTasks__ = {};
async function runTask(name, {
  payload = {},
  context = {}
} = {}) {
  if (__runningTasks__[name]) {
    return __runningTasks__[name];
  }
  if (!(name in tasks)) {
    throw createError({
      message: `Task \`${name}\` is not available!`,
      statusCode: 404
    });
  }
  if (!tasks[name].resolve) {
    throw createError({
      message: `Task \`${name}\` is not implemented!`,
      statusCode: 501
    });
  }
  const handler = await tasks[name].resolve();
  const taskEvent = { name, payload, context };
  __runningTasks__[name] = handler.run(taskEvent);
  try {
    const res = await __runningTasks__[name];
    return res;
  } finally {
    delete __runningTasks__[name];
  }
}

if (!globalThis.crypto) {
  globalThis.crypto = nodeCrypto.webcrypto;
}
const { NITRO_NO_UNIX_SOCKET, NITRO_DEV_WORKER_ID } = process.env;
trapUnhandledNodeErrors();
parentPort?.on("message", (msg) => {
  if (msg && msg.event === "shutdown") {
    shutdown();
  }
});
const nitroApp = useNitroApp();
const server$1 = new Server(toNodeListener(nitroApp.h3App));
let listener;
listen().catch(() => listen(
  true
  /* use random port */
)).catch((error) => {
  console.error("Dev worker failed to listen:", error);
  return shutdown();
});
nitroApp.router.get(
  "/_nitro/tasks",
  defineEventHandler(async (event) => {
    const _tasks = await Promise.all(
      Object.entries(tasks).map(async ([name, task]) => {
        const _task = await task.resolve?.();
        return [name, { description: _task?.meta?.description }];
      })
    );
    return {
      tasks: Object.fromEntries(_tasks),
      scheduledTasks
    };
  })
);
nitroApp.router.use(
  "/_nitro/tasks/:name",
  defineEventHandler(async (event) => {
    const name = getRouterParam(event, "name");
    const payload = {
      ...getQuery$1(event),
      ...await readBody(event).then((r) => r?.payload).catch(() => ({}))
    };
    return await runTask(name, { payload });
  })
);
function listen(useRandomPort = Boolean(
  NITRO_NO_UNIX_SOCKET || process.versions.webcontainer || "Bun" in globalThis && process.platform === "win32"
)) {
  return new Promise((resolve, reject) => {
    try {
      listener = server$1.listen(useRandomPort ? 0 : getSocketAddress(), () => {
        const address = server$1.address();
        parentPort?.postMessage({
          event: "listen",
          address: typeof address === "string" ? { socketPath: address } : { host: "localhost", port: address?.port }
        });
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
function getSocketAddress() {
  const socketName = `nitro-worker-${process.pid}-${threadId}-${NITRO_DEV_WORKER_ID}-${Math.round(Math.random() * 1e4)}.sock`;
  if (process.platform === "win32") {
    return join(String.raw`\\.\pipe`, socketName);
  }
  if (process.platform === "linux") {
    const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
    if (nodeMajor >= 20) {
      return `\0${socketName}`;
    }
  }
  return join(tmpdir(), socketName);
}
async function shutdown() {
  server$1.closeAllConnections?.();
  await Promise.all([
    new Promise((resolve) => listener?.close(resolve)),
    nitroApp.hooks.callHook("close").catch(console.error)
  ]);
  parentPort?.postMessage({ event: "exit" });
}

const _messages = {
	"appName": "Nuxt",
	"version": "",
	"status": 500,
	"statusText": "Server error",
	"description": "This page is temporarily unavailable."
};
const template$1 = (messages) => {
	messages = {
		..._messages,
		...messages
	};
	return "<!DOCTYPE html><html lang=\"en\"><head><title>" + escapeHtml$1(messages.status) + " - " + escapeHtml$1(messages.statusText) + " | " + escapeHtml$1(messages.appName) + "</title><meta charset=\"utf-8\"><meta content=\"width=device-width,initial-scale=1.0,minimum-scale=1.0\" name=\"viewport\"><style>.spotlight{background:linear-gradient(45deg,#00dc82,#36e4da 50%,#0047e1);filter:blur(20vh)}*,:after,:before{border-color:var(--un-default-border-color,#e5e7eb);border-style:solid;border-width:0;box-sizing:border-box}:after,:before{--un-content:\"\"}html{line-height:1.5;-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;font-feature-settings:normal;font-variation-settings:normal;-moz-tab-size:4;tab-size:4;-webkit-tap-highlight-color:transparent}body{line-height:inherit;margin:0}h1{font-size:inherit;font-weight:inherit}h1,p{margin:0}*,:after,:before{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 transparent;--un-ring-shadow:0 0 transparent;--un-shadow-inset: ;--un-shadow:0 0 transparent;--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgba(147,197,253,.5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }.fixed{position:fixed}.-bottom-1\\/2{bottom:-50%}.left-0{left:0}.right-0{right:0}.grid{display:grid}.mb-16{margin-bottom:4rem}.mb-8{margin-bottom:2rem}.h-1\\/2{height:50%}.max-w-520px{max-width:520px}.min-h-screen{min-height:100vh}.place-content-center{place-content:center}.overflow-hidden{overflow:hidden}.bg-white{--un-bg-opacity:1;background-color:rgb(255 255 255/var(--un-bg-opacity))}.px-8{padding-left:2rem;padding-right:2rem}.text-center{text-align:center}.text-8xl{font-size:6rem;line-height:1}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-black{--un-text-opacity:1;color:rgb(0 0 0/var(--un-text-opacity))}.font-light{font-weight:300}.font-medium{font-weight:500}.leading-tight{line-height:1.25}.font-sans{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji}.antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}@media(prefers-color-scheme:dark){.dark\\:bg-black{--un-bg-opacity:1;background-color:rgb(0 0 0/var(--un-bg-opacity))}.dark\\:text-white{--un-text-opacity:1;color:rgb(255 255 255/var(--un-text-opacity))}}@media(min-width:640px){.sm\\:px-0{padding-left:0;padding-right:0}.sm\\:text-4xl{font-size:2.25rem;line-height:2.5rem}}</style><script>!function(){const e=document.createElement(\"link\").relList;if(!(e&&e.supports&&e.supports(\"modulepreload\"))){for(const e of document.querySelectorAll('link[rel=\"modulepreload\"]'))r(e);new MutationObserver(e=>{for(const o of e)if(\"childList\"===o.type)for(const e of o.addedNodes)\"LINK\"===e.tagName&&\"modulepreload\"===e.rel&&r(e)}).observe(document,{childList:!0,subtree:!0})}function r(e){if(e.ep)return;e.ep=!0;const r=function(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),\"use-credentials\"===e.crossOrigin?r.credentials=\"include\":\"anonymous\"===e.crossOrigin?r.credentials=\"omit\":r.credentials=\"same-origin\",r}(e);fetch(e.href,r)}}();<\/script></head><body class=\"antialiased bg-white dark:bg-black dark:text-white font-sans grid min-h-screen overflow-hidden place-content-center text-black\"><div class=\"-bottom-1/2 fixed h-1/2 left-0 right-0 spotlight\"></div><div class=\"max-w-520px text-center\"><h1 class=\"font-medium mb-8 sm:text-10xl text-8xl\">" + escapeHtml$1(messages.status) + "</h1><p class=\"font-light leading-tight mb-16 px-8 sm:px-0 sm:text-4xl text-xl\">" + escapeHtml$1(messages.description) + "</p></div></body></html>";
};

const error500 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  template: template$1
}, Symbol.toStringTag, { value: 'Module' }));

const server = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: viteNodeEntry_mjs
}, Symbol.toStringTag, { value: 'Module' }));

const client_manifest = () => viteNodeFetch.getManifest();

const client_manifest$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: client_manifest
}, Symbol.toStringTag, { value: 'Module' }));

const template = "";

const _virtual__spaTemplate = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  template: template
}, Symbol.toStringTag, { value: 'Module' }));

const styles = {};

const styles$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: styles
}, Symbol.toStringTag, { value: 'Module' }));

const STATUS_LABELS = {
  400: "Solicitud invalida",
  401: "Sesion requerida",
  403: "Acceso no autorizado",
  404: "No encontrado",
  409: "Conflicto",
  413: "Archivo muy grande",
  415: "Tipo no permitido",
  422: "Datos incompletos",
  429: "Demasiados intentos",
  500: "Error interno",
  502: "Servicio externo",
  503: "Servicio no disponible",
  504: "Tiempo de espera"
};
function publicError(statusCode, message, statusMessage = STATUS_LABELS[statusCode] || "Error", data) {
  return createError({
    statusCode,
    statusMessage,
    message,
    data
  });
}

function normalizeMatricula(value) {
  return String(value != null ? value : "").trim().toUpperCase();
}
function displayMatricula(value, fallback = "") {
  return normalizeMatricula(value) || fallback;
}
function isMatriculaLike(value) {
  const normalized = normalizeMatricula(value);
  if (!normalized || normalized.includes("@")) return false;
  return /^[A-Z]{1,6}[A-Z0-9-]*\d[A-Z0-9-]*$/.test(normalized);
}
function displayMatriculaCandidate(value, fallback = "") {
  const raw = String(value != null ? value : "").trim();
  if (!raw) return fallback;
  return isMatriculaLike(raw) ? normalizeMatricula(raw) : raw;
}

const DAYCARE_FAMILY_ROLE = "ROLE_HUSKY_USER";
const DAYCARE_ADMIN_ROLE = "ROLE_HUSKY";
function hasRoleToken(roles, role) {
  return Boolean(roles == null ? void 0 : roles.some((candidate) => candidate.trim().toUpperCase() === role.toUpperCase()));
}
function hasFamilyScope(user, scope) {
  var _a, _b;
  if (!user || user.kind !== "family") return false;
  if (scope === "daycare") {
    const daycare = (_a = user.scopes) == null ? void 0 : _a.daycare;
    return Boolean((daycare == null ? void 0 : daycare.unidad) && (daycare == null ? void 0 : daycare.sala));
  }
  if (scope === "personasAutorizadas") {
    return Boolean((_b = user.scopes) == null ? void 0 : _b.personasAutorizadas);
  }
  return false;
}

const HUSKY_LOGO = "/brand/husky-pass-logo.png";
const IECS_LOGO = "/brand/iecs-logo.png";
const IECS_WORDMARK = "/brand/iecs-wordmark-gradient.png";
const IEDIS_LOGO = "/brand/iedis-logo.png";
const IEDIS_WORDMARK = "/brand/iedis-wordmark-gradient.png";
const LEVEL_ASSETS = {
  guarderia: {
    header: "/personas-autorizadas/ambassadors/daycare-sunny.png",
    hero: "/personas-autorizadas/mascots/sunny-guarderia/1-SUNNY-GUARDERIA/SUNNY-1.png",
    empty: "/personas-autorizadas/mascots/sunny-guarderia/1-SUNNY-GUARDERIA/SUNNY-5.png",
    help: "/personas-autorizadas/mascots/sunny-guarderia/1-SUNNY-GUARDERIA/SUNNY-3.png",
    preview: "/personas-autorizadas/mascots/sunny-guarderia/1-SUNNY-GUARDERIA/SUNNY-8.png",
    transition: "/personas-autorizadas/ambassadors/daycare-sunny.png"
  },
  preescolar: {
    header: "/personas-autorizadas/ambassadors/preescolar-joy.png",
    hero: "/personas-autorizadas/mascots/joy-preescolar/2-JOY-PREESCOLAR/JOY-1.png",
    empty: "/personas-autorizadas/mascots/joy-preescolar/2-JOY-PREESCOLAR/JOY-7.png",
    help: "/personas-autorizadas/mascots/joy-preescolar/2-JOY-PREESCOLAR/JOY-3.png",
    preview: "/personas-autorizadas/mascots/joy-preescolar/2-JOY-PREESCOLAR/JOY-14.png",
    transition: "/personas-autorizadas/mascots/joy-preescolar/2-JOY-PREESCOLAR/JOY-4.png"
  },
  primaria: {
    header: "/personas-autorizadas/ambassadors/primaria-brave.png",
    hero: "/personas-autorizadas/mascots/brave-primaria/3-BRAVE-PRIMARIA/BRAVE-1.1.png",
    empty: "/personas-autorizadas/mascots/brave-primaria/3-BRAVE-PRIMARIA/BRAVE-3.png",
    help: "/personas-autorizadas/mascots/brave-primaria/3-BRAVE-PRIMARIA/BRAVE-5.png",
    preview: "/personas-autorizadas/mascots/brave-primaria/3-BRAVE-PRIMARIA/BRAVE-10.png",
    transition: "/personas-autorizadas/mascots/brave-primaria/3-BRAVE-PRIMARIA/BRAVE-6.png"
  },
  secundaria: {
    header: "/personas-autorizadas/ambassadors/secundaria-hope.png",
    hero: "/personas-autorizadas/mascots/hope-secundaria/4-HOPE-SECUNDARIA/HOPE-1.png",
    empty: "/personas-autorizadas/mascots/hope-secundaria/4-HOPE-SECUNDARIA/HOPE-5.png",
    help: "/personas-autorizadas/mascots/hope-secundaria/4-HOPE-SECUNDARIA/HOPE-3.png",
    preview: "/personas-autorizadas/mascots/hope-secundaria/4-HOPE-SECUNDARIA/HOPE-7.png",
    transition: "/personas-autorizadas/mascots/hope-secundaria/4-HOPE-SECUNDARIA/HOPE-4.png"
  }
};
const EXPERIENCE_LABELS = {
  escolar: "Experiencia Escolar",
  guarderia: "Experiencia Guarder\xEDa",
  admin: "Experiencia Administrativa"
};
function clean$3(value) {
  const normalized = String(value != null ? value : "").trim();
  return normalized || null;
}
function cleanLower(value) {
  var _a;
  return ((_a = clean$3(value)) == null ? void 0 : _a.toLowerCase()) || "";
}
function cleanUpper(value) {
  var _a;
  return ((_a = clean$3(value)) == null ? void 0 : _a.toUpperCase()) || "";
}
function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const parsed = Number.parseInt(value.length === 3 ? value.split("").map((part) => `${part}${part}`).join("") : value, 16);
  return {
    r: parsed >> 16 & 255,
    g: parsed >> 8 & 255,
    b: parsed & 255
  };
}
function alpha(hex, opacity) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
function contrastFor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.68 ? "#26313d" : "#ffffff";
}
function normalizeExperienceName(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["escolar", "school", "experiencia-escolar"].includes(normalized)) return "escolar";
  if (["guarderia", "guarder\xEDa", "daycare", "experiencia-guarderia", "experiencia-guarder\xEDa"].includes(normalized)) return "guarderia";
  if (["admin", "administrativa", "administracion", "administraci\xF3n", "superadmin", "experiencia-administrativa"].includes(normalized)) return "admin";
  return null;
}
function normalizeInstitutionName(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "iecs") return "iecs";
  if (normalized === "iedis") return "iedis";
  return null;
}
function normalizeNivelIdentity(value) {
  const nivel = cleanLower(value);
  if (!nivel) return null;
  if (/guarder|lactante|baby|nursery/.test(nivel)) return "guarderia";
  if (/preescolar|preeschool|preschool|kinder|kínder|kindergarten/.test(nivel)) return "preescolar";
  if (/primaria|elementary/.test(nivel)) return "primaria";
  if (/secundaria|secondary|middle/.test(nivel)) return "secundaria";
  return nivel;
}
function normalizePlantelIdentity(value) {
  return cleanUpper(value);
}
function requestedFromRoute(routePath) {
  const path = String(routePath || "").toLowerCase();
  if (!path) return null;
  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/familia/daycare") || path.startsWith("/registro-guarderia") || path.startsWith("/login/guarderia")) return "guarderia";
  if (path.startsWith("/login/escolar")) return "escolar";
  return null;
}
function experienceFromStudent(input) {
  const matricula = normalizeMatricula(input.matricula);
  const plantel = normalizePlantelIdentity(input.plantel || input.campus);
  if (matricula.startsWith("CM") || plantel === "CM") return "guarderia";
  if (matricula.startsWith("PREEM") || matricula.startsWith("PREET") || matricula.startsWith("PM") || matricula.startsWith("PT") || matricula.startsWith("SM") || matricula.startsWith("ST")) return "escolar";
  if (plantel && ["PREEM", "PREET", "PM", "PT", "SM", "ST", "IECS", "IEDIS"].includes(plantel)) return "escolar";
  return null;
}
function institutionFromContextData(input) {
  const explicit = normalizeInstitutionName(input.institution);
  if (explicit) return explicit;
  const matricula = normalizeMatricula(input.matricula);
  const plantel = normalizePlantelIdentity(input.plantel || input.campus);
  const nivel = normalizeNivelIdentity(input.nivel || input.nivelEdu);
  if (plantel === "IECS" || plantel === "PREEM" || plantel === "PREET" || matricula.startsWith("PREEM") || matricula.startsWith("PREET")) return "iecs";
  if (plantel === "IEDIS" || plantel === "PM" || plantel === "PT" || plantel === "SM" || plantel === "ST") return "iedis";
  if (matricula.startsWith("PM") || matricula.startsWith("PT") || matricula.startsWith("SM") || matricula.startsWith("ST")) return "iedis";
  if (nivel === "preescolar") return "iecs";
  if (nivel === "primaria" || nivel === "secundaria") return "iedis";
  return null;
}
function userCanUseExperience(user, experience) {
  if (!user) return false;
  if (experience === "admin") return user.kind === "admin";
  if (user.kind !== "family") return false;
  if (experience === "guarderia") return hasFamilyScope(user, "daycare");
  return hasFamilyScope(user, "personasAutorizadas");
}
function defaultLoginRouteForExperience(experience) {
  if (experience === "admin") return "/admin/login";
  if (experience === "guarderia") return "/login/guarderia";
  return "/login/escolar";
}
function recoveryRouteForExperience(experience) {
  return `/recuperar-contrasena?experiencia=${encodeURIComponent(experience)}`;
}
function defaultRouteForExperience(user, experience) {
  if (experience === "admin") return (user == null ? void 0 : user.isSuperAdmin) ? "/admin/superadmin" : "/admin/daycare/salas";
  if (experience === "guarderia") return "/familia/daycare";
  return "/familia/personas-autorizadas";
}
function resolveExperienceContext(input = {}) {
  const explicitRequested = normalizeExperienceName(input.requestedExperience);
  const routeRequested = requestedFromRoute(input.routePath);
  const fromStudent = experienceFromStudent(input);
  const user = input.user || null;
  const missing = [];
  let conflict = null;
  let status = "resolved";
  let reason;
  let experience;
  if ((user == null ? void 0 : user.kind) === "admin" || explicitRequested === "admin" || routeRequested === "admin") {
    experience = "admin";
    reason = "resolved-administrative-context";
  } else if (explicitRequested) {
    experience = explicitRequested;
    reason = "resolved-from-explicit-intent";
  } else if (fromStudent) {
    experience = fromStudent;
    reason = "resolved-from-student-data";
  } else if (routeRequested) {
    experience = routeRequested;
    reason = "resolved-from-route-intent";
  } else if ((user == null ? void 0 : user.kind) === "family") {
    const hasDaycare = hasFamilyScope(user, "daycare");
    const hasSchool = hasFamilyScope(user, "personasAutorizadas");
    if (hasSchool && !hasDaycare) {
      experience = "escolar";
      reason = "resolved-from-family-school-scope";
    } else if (hasDaycare && !hasSchool) {
      experience = "guarderia";
      reason = "resolved-from-family-daycare-scope";
    } else {
      experience = "escolar";
      status = "neutral";
      reason = "ambiguous-family-experience-neutral-escolar";
      missing.push("requestedExperience", "studentContext");
    }
  } else {
    experience = "escolar";
    status = "neutral";
    reason = "unauthenticated-neutral-escolar";
  }
  if (user && !userCanUseExperience(user, experience)) {
    conflict = `session-kind-or-scope-does-not-match-${experience}`;
    status = "blocked";
  }
  if (fromStudent && explicitRequested && experience !== "admin" && fromStudent !== experience) {
    conflict = `student-context-${fromStudent}-conflicts-with-${experience}`;
    status = "blocked";
  }
  const nivel = normalizeNivelIdentity(input.nivel || input.nivelEdu);
  const plantel = normalizePlantelIdentity(input.plantel || input.campus);
  const context = {
    experience,
    institution: experience === "escolar" ? institutionFromContextData(input) : null,
    nivel,
    plantel,
    grupo: clean$3(input.grupo)
  };
  if (context.experience === "escolar" && !context.institution) {
    status = status === "blocked" ? status : "neutral";
    reason = reason === "resolved-from-domain-data" ? "school-institution-unresolved-neutral-escolar" : reason;
    missing.push("institution");
  }
  return { context, status, reason, missing: Array.from(new Set(missing)), conflict };
}
function assetsForContext(context) {
  if (context.experience === "admin") {
    return {
      logo: HUSKY_LOGO,
      huskyLogo: HUSKY_LOGO,
      emailLogo: HUSKY_LOGO,
      documentLogo: HUSKY_LOGO
    };
  }
  if (context.experience === "guarderia") {
    return {
      logo: HUSKY_LOGO,
      huskyLogo: HUSKY_LOGO,
      ambassador: LEVEL_ASSETS.guarderia.header,
      mascotVariants: LEVEL_ASSETS.guarderia,
      emailLogo: HUSKY_LOGO,
      documentLogo: HUSKY_LOGO
    };
  }
  const logo = context.institution === "iedis" ? IEDIS_LOGO : context.institution === "iecs" ? IECS_LOGO : HUSKY_LOGO;
  const wordmark = context.institution === "iedis" ? IEDIS_WORDMARK : context.institution === "iecs" ? IECS_WORDMARK : null;
  const nivel = context.nivel || "";
  const mascotVariants = nivel === "preescolar" ? LEVEL_ASSETS.preescolar : nivel === "primaria" ? LEVEL_ASSETS.primaria : nivel === "secundaria" ? LEVEL_ASSETS.secundaria : void 0;
  return {
    logo,
    wordmark,
    huskyLogo: HUSKY_LOGO,
    ambassador: (mascotVariants == null ? void 0 : mascotVariants.header) || null,
    mascotVariants,
    emailLogo: logo,
    documentLogo: logo
  };
}
function identityKey(context) {
  if (context.experience === "admin") return "admin";
  if (context.experience === "guarderia") return "guarderia";
  return context.nivel && ["preescolar", "primaria", "secundaria"].includes(context.nivel) ? context.nivel : context.institution || "escolar";
}
function primaryForContext(context) {
  if (context.experience === "admin") return "#334155";
  if (context.experience === "guarderia") return "#618B2F";
  if (context.nivel === "preescolar") return "#E83F4B";
  if (context.nivel === "primaria") return "#FCBF2C";
  if (context.nivel === "secundaria") return "#66A8D8";
  if (context.institution === "iedis") return "#007F92";
  if (context.institution === "iecs") return "#2F7D54";
  return "#236188";
}
function levelLabel(context) {
  if (context.experience === "admin") return "Administraci\xF3n";
  if (context.experience === "guarderia") return "Guarder\xEDa";
  if (context.nivel === "preescolar") return "Preescolar";
  if (context.nivel === "primaria") return "Primaria";
  if (context.nivel === "secundaria") return "Secundaria";
  return "Escolar";
}
function identityLabel(context) {
  if (context.experience === "admin") return "Administraci\xF3n";
  if (context.experience === "guarderia") return "Guarder\xEDa";
  if (context.institution === "iecs") return "IECS";
  if (context.institution === "iedis") return "IEDIS";
  return "Escolar";
}
function visualIdentityForContext(context) {
  const primary = primaryForContext(context);
  const assets = assetsForContext(context);
  return {
    key: identityKey(context),
    officialName: EXPERIENCE_LABELS[context.experience],
    context,
    label: identityLabel(context),
    shortLabel: identityLabel(context),
    levelLabel: levelLabel(context),
    primary,
    contrast: contrastFor(primary),
    soft: alpha(primary, 0.12),
    border: alpha(primary, 0.28),
    muted: context.experience === "admin" ? "#64748B" : "#86888C",
    gray: context.experience === "admin" ? "#1E293B" : "#50535A",
    institutional: context.institution === "iedis" ? "#007F92" : context.institution === "iecs" ? "#2F7D54" : primary,
    surface: context.experience === "admin" ? "#F8FAFC" : "#FFFFFF",
    page: context.experience === "admin" ? "#F3F6F9" : context.experience === "guarderia" ? "#F6F8F1" : "#F7F9FB",
    assets,
    allowedAssetFamilies: context.experience === "admin" ? ["admin", "husky-pass"] : context.experience === "guarderia" ? ["guarderia", "husky-pass", "grupo-icons"] : ["escolar", context.institution || "school-neutral", context.nivel || "school-neutral", "husky-pass", "grupo-icons"]
  };
}

function contextForThemeKey(key) {
  if (key === "admin") return { experience: "admin", institution: null, nivel: null, plantel: null, grupo: null };
  if (key === "daycare") return { experience: "guarderia", institution: null, nivel: "guarderia", plantel: "CM", grupo: null };
  if (key === "preescolar") return { experience: "escolar", institution: "iecs", nivel: "preescolar", plantel: null, grupo: null };
  if (key === "iecs") return { experience: "escolar", institution: "iecs", nivel: null, plantel: null, grupo: null };
  if (key === "primaria") return { experience: "escolar", institution: "iedis", nivel: "primaria", plantel: null, grupo: null };
  if (key === "secundaria") return { experience: "escolar", institution: "iedis", nivel: "secundaria", plantel: null, grupo: null };
  if (key === "iedis") return { experience: "escolar", institution: "iedis", nivel: null, plantel: null, grupo: null };
  return { experience: "escolar", institution: null, nivel: null, plantel: null, grupo: null };
}
function themeFromContext(context) {
  const identity = visualIdentityForContext(context);
  return {
    key: identity.key,
    label: identity.label,
    shortLabel: identity.shortLabel,
    englishLabel: identity.officialName,
    primary: identity.primary,
    contrast: identity.contrast,
    soft: identity.soft,
    border: identity.border,
    muted: identity.muted,
    gray: identity.gray,
    institutional: identity.institutional,
    mascot: identity.assets.ambassador || void 0,
    mascotVariants: identity.assets.mascotVariants,
    logo: identity.assets.logo,
    wordmark: identity.assets.wordmark || void 0
  };
}
const PERSONAS_THEMES = {
  escolar: themeFromContext(contextForThemeKey("escolar")),
  daycare: themeFromContext(contextForThemeKey("daycare")),
  iecs: themeFromContext(contextForThemeKey("iecs")),
  preescolar: themeFromContext(contextForThemeKey("preescolar")),
  primaria: themeFromContext(contextForThemeKey("primaria")),
  secundaria: themeFromContext(contextForThemeKey("secundaria")),
  iedis: themeFromContext(contextForThemeKey("iedis")),
  admin: themeFromContext(contextForThemeKey("admin"))
};
function normalizePlantel(value) {
  return normalizePlantelIdentity(value) || "";
}
function normalizeNivel(value) {
  return normalizeNivelIdentity(value) || "";
}
function themeKeyToExperience(key) {
  const normalized = String(key || "").trim().toLowerCase();
  if (!normalized || !PERSONAS_THEMES[normalized]) return {};
  const context = contextForThemeKey(normalized);
  return {
    experience: context.experience,
    institution: context.institution,
    nivel: context.nivel,
    plantel: context.plantel
  };
}
function resolvePersonasTheme(input = {}) {
  const explicit = themeKeyToExperience(input.themeKey);
  const resolution = resolveExperienceContext({
    requestedExperience: input.experience || explicit.experience,
    institution: input.institution || explicit.institution,
    matricula: input.matricula,
    plantel: input.plantel || explicit.plantel,
    nivelEdu: input.nivelEdu || input.nivel || explicit.nivel,
    campus: input.campus,
    grupo: input.grupo
  });
  return themeFromContext(resolution.context);
}
function allPersonasThemes() {
  return Object.values(PERSONAS_THEMES);
}
function personasInstitutionName(theme) {
  if (theme.key === "daycare") return "Guarder\xEDa";
  if (theme.key === "admin") return "Administraci\xF3n";
  if (theme.key === "preescolar" || theme.key === "iecs") return "IECS";
  if (theme.key === "primaria" || theme.key === "secundaria" || theme.key === "iedis") return "IEDIS";
  return "Escolar";
}

const REDACTED_KEYS = /password|token|private|secret|credential|payload|authorization/i;
function securityHash(value) {
  const normalized = String(value != null ? value : "").trim().toLowerCase();
  if (!normalized) return null;
  return createHash("sha256").update(normalized).digest("hex");
}
function safeContext(context) {
  return Object.fromEntries(Object.entries(context).map(([key, value]) => {
    if (REDACTED_KEYS.test(key)) return [key, "[redacted]"];
    if (value instanceof Error) return [key, value.message];
    return [key, value];
  }));
}
function logSecurityDiagnostic(scope, error, context = {}) {
  logEvent("error", `account-security:${scope}`, {
    scope,
    error: errorSummary(error),
    context: safeContext(context)
  });
}
function logSecurityWarning(scope, context = {}) {
  logEvent("warn", `account-security:${scope}`, {
    scope,
    context: safeContext(context)
  });
}

function decodePrivateKey(raw) {
  const fromText = String(raw || "").trim();
  if (fromText) return fromText.replace(/\\n/g, "\n");
  return "";
}
function getRecoveryEmailConfig() {
  const config = useRuntimeConfig();
  const recovery = config.passwordRecovery || {};
  const modeValue = process.env.PASSWORD_RECOVERY_EMAIL_MODE || recovery.emailMode || "gmail";
  const mode = String(modeValue).trim().toLowerCase() === "preview" ? "preview" : "gmail";
  const privateKey = decodePrivateKey(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || recovery.googleServiceAccountPrivateKey);
  return {
    mode,
    fromEmail: String(process.env.PASSWORD_RECOVERY_FROM_EMAIL || recovery.fromEmail || "").trim(),
    fromName: String(process.env.PASSWORD_RECOVERY_FROM_NAME || recovery.fromName || "Husky Pass").trim(),
    serviceAccountEmail: String(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || recovery.googleServiceAccountEmail || "").trim(),
    privateKey,
    delegatedUser: String(process.env.GOOGLE_WORKSPACE_DELEGATED_USER || process.env.GOOGLE_GMAIL_DELEGATED_USER || recovery.googleDelegatedUser || "").trim()
  };
}
function assertGmailConfig(config) {
  const missing = [
    ["PASSWORD_RECOVERY_FROM_EMAIL", config.fromEmail],
    ["GOOGLE_SERVICE_ACCOUNT_EMAIL", config.serviceAccountEmail],
    ["GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY", config.privateKey],
    ["GOOGLE_WORKSPACE_DELEGATED_USER or GOOGLE_GMAIL_DELEGATED_USER", config.delegatedUser]
  ].filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) {
    const error = new Error(`Missing password recovery email configuration: ${missing.join(", ")}`);
    logSecurityDiagnostic("password-recovery-email-config-missing", error, { missing });
    throw error;
  }
  if (!/-----BEGIN PRIVATE KEY-----/.test(config.privateKey) || !/-----END PRIVATE KEY-----/.test(config.privateKey)) {
    const error = new Error("Google service-account private key is malformed.");
    logSecurityDiagnostic("password-recovery-email-config-malformed", error, { keyShape: "invalid-private-key" });
    throw error;
  }
}
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function formatExpiry(date) {
  return date.toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Mexico_City"
  });
}
function encodeMimeWord(value) {
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}
function base64url$2(input) {
  return Buffer.from(input, "utf8").toString("base64url");
}
function buildEmail(input, config) {
  var _a;
  const institution = personasInstitutionName(input.theme);
  const subject = `Restablece tu contrase\xF1a de ${institution} Husky Pass`;
  const name = ((_a = input.displayName) == null ? void 0 : _a.trim()) || "familia";
  const expires = formatExpiry(input.expiresAt);
  const text = [
    `Hola ${name},`,
    "",
    `Usa este enlace para crear una nueva contrase\xF1a de ${institution} Husky Pass:`,
    input.resetUrl,
    "",
    `El enlace estar\xE1 disponible hasta ${expires}.`,
    "Si no solicitaste este cambio, puedes ignorar este correo."
  ].join("\n");
  const html = `
    <div style="font-family:Montserrat,Arial,sans-serif;line-height:1.5;color:#1f2a44;max-width:560px;margin:0 auto;padding:24px">
      <p style="margin:0 0 8px;color:${input.theme.primary};font-weight:700;letter-spacing:.08em;text-transform:uppercase">${escapeHtml(institution)} Husky Pass</p>
      <h1 style="font-size:24px;line-height:1.15;margin:0 0 16px">Restablece tu contrase\xF1a</h1>
      <p>Hola ${escapeHtml(name)},</p>
      <p>Usa este enlace para crear una nueva contrase\xF1a.</p>
      <p style="margin:24px 0">
        <a href="${escapeHtml(input.resetUrl)}" style="background:${input.theme.primary};border-radius:10px;color:${escapeHtml(input.theme.contrast)};display:inline-block;font-weight:700;padding:12px 18px;text-decoration:none">Crear nueva contrase\xF1a</a>
      </p>
      <p style="color:#687085;font-size:14px">Disponible hasta ${escapeHtml(expires)}.</p>
      ${input.loginUrl ? `<p style="color:#687085;font-size:14px">Al terminar, regresa a <a href="${escapeHtml(input.loginUrl)}" style="color:${input.theme.primary};font-weight:700">tu acceso correcto</a>.</p>` : ""}
      <p style="color:#687085;font-size:14px">Si no solicitaste este cambio, puedes ignorar este correo.</p>
    </div>
  `.trim();
  const boundary = `hpc-${Date.now().toString(36)}`;
  const raw = [
    `From: ${encodeMimeWord(config.fromName)} <${config.fromEmail}>`,
    `To: ${input.to}`,
    `Subject: ${encodeMimeWord(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
    "",
    `--${boundary}--`
  ].join("\r\n");
  return { subject, text, html, raw };
}
async function sendWithGmail(raw, config) {
  assertGmailConfig(config);
  const client = new JWT({
    email: config.serviceAccountEmail,
    key: config.privateKey,
    scopes: ["https://www.googleapis.com/auth/gmail.send"],
    subject: config.delegatedUser
  });
  const accessToken = await client.getAccessToken();
  if (!accessToken.token) throw new Error("Google service-account token was not issued.");
  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ raw: base64url$2(raw) })
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Gmail send failed with ${response.status}: ${body.slice(0, 500)}`);
  }
}
async function writePreviewEmail(input, email) {
  var _a;
  const dir = join(process.cwd(), "artifacts", "password-recovery-emails");
  await mkdir(dir, { recursive: true });
  const stamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
  const emailHash = ((_a = securityHash(input.to)) == null ? void 0 : _a.slice(0, 12)) || "unknown";
  const base = `${stamp}-${emailHash}`;
  const jsonPath = join(dir, `${base}.json`);
  const emlPath = join(dir, `${base}.eml`);
  await writeFile(jsonPath, JSON.stringify({
    toHash: securityHash(input.to),
    subject: email.subject,
    resetUrl: input.resetUrl,
    loginUrl: input.loginUrl || null,
    recoveryUrl: input.recoveryUrl || null,
    expiresAt: input.expiresAt.toISOString(),
    html: email.html,
    text: email.text,
    emlPath
  }, null, 2), "utf8");
  await writeFile(emlPath, email.raw, "utf8");
  logSecurityWarning("password-recovery-email-preview-written", { jsonPath, emlPath, toHash: securityHash(input.to) });
}
async function sendPasswordRecoveryEmail(input) {
  const config = getRecoveryEmailConfig();
  const email = buildEmail(input, config);
  try {
    if (config.mode === "preview") {
      await writePreviewEmail(input, email);
    } else {
      await sendWithGmail(email.raw, config);
    }
    logSecurityWarning("password-recovery-email-delivered", { mode: config.mode, toHash: securityHash(input.to) });
  } catch (error) {
    logSecurityDiagnostic("password-recovery-email-send-failed", error, {
      mode: config.mode,
      toHash: securityHash(input.to)
    });
    throw error;
  }
}
async function readLatestRecoveryEmailPreview() {
  const dir = join(process.cwd(), "artifacts", "password-recovery-emails");
  const files = (await readdir(dir).catch(() => [])).filter((file) => file.endsWith(".json") && file !== "dev-token-store.json").sort();
  const latest = files.at(-1);
  if (!latest) return null;
  const fullPath = join(dir, latest);
  const content = await readFile(fullPath, "utf8");
  return { path: fullPath, preview: JSON.parse(content) };
}

const latestPreview_get = defineEventHandler(async () => {
  const latest = await readLatestRecoveryEmailPreview();
  if (!latest) return { latest: null };
  return { latest };
});

const latestPreview_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: latestPreview_get
}, Symbol.toStringTag, { value: 'Module' }));

function hasFamilyProductScope(user, scope) {
  var _a, _b;
  if (user.kind !== "family") return false;
  if (scope === "daycare") {
    const daycare = (_a = user.scopes) == null ? void 0 : _a.daycare;
    return Boolean((daycare == null ? void 0 : daycare.unidad) && (daycare == null ? void 0 : daycare.sala));
  }
  if (scope === "personasAutorizadas") {
    return Boolean((_b = user.scopes) == null ? void 0 : _b.personasAutorizadas);
  }
  return false;
}
function isSuperAdmin(user) {
  return Boolean((user == null ? void 0 : user.kind) === "admin" && user.isSuperAdmin);
}
function assertDaycareFamily(user) {
  if (!hasFamilyProductScope(user, "daycare")) {
    throw publicError(403, "Acceso de guarder\xEDa no autorizado");
  }
}
function assertPersonasAutorizadasFamily(user) {
  if (!hasFamilyProductScope(user, "personasAutorizadas")) {
    throw publicError(403, "Acceso a Personas Autorizadas no autorizado");
  }
}
function assertDaycareAdmin(user) {
  if (user.kind !== "admin") {
    throw publicError(403, "Acceso administrativo no autorizado");
  }
  if (isSuperAdmin(user)) return;
  const hasDaycarePermission = hasRoleToken(user.roles, DAYCARE_ADMIN_ROLE) || user.routes.some((route) => /guarder[ií]a|husky|daycare/i.test(route.route));
  if (!hasDaycarePermission || user.unidades.length === 0) {
    throw publicError(403, "El usuario no tiene alcance de guarder\xEDa");
  }
}
function assertAccessHistoryAdmin(user) {
  if (user.kind !== "admin") {
    throw publicError(403, "Acceso administrativo no autorizado");
  }
  if (isSuperAdmin(user)) return;
  const routeText = user.routes.map((route) => route.route).join(" ");
  const roleText = user.roles.join(" ");
  const hasReportAccess = /personas[_/-]?autorizadas|persona[-_]?autorizada|credencial|marbete|validar|historial|acceso|husky/i.test(`${routeText} ${roleText}`);
  if (!hasReportAccess) {
    throw publicError(403, "El usuario no tiene alcance para consultar historial de accesos.");
  }
}
function assertUnidadAccess(user, unidad) {
  if (isSuperAdmin(user)) return;
  if (!user.unidades.includes(unidad)) {
    throw publicError(403, "Unidad fuera del alcance del usuario");
  }
}
function assertSalaAccess(user, sala) {
  var _a, _b;
  if (user.kind === "admin") return;
  const scopeSala = ((_b = (_a = user.scopes) == null ? void 0 : _a.daycare) == null ? void 0 : _b.sala) || user.sala;
  if (scopeSala && String(scopeSala) !== String(sala)) {
    throw publicError(403, "Sala fuera del alcance del usuario");
  }
}

let pool = null;
const DEFAULT_QUERY_TIMEOUT_MS$1 = 15e3;
const TRANSIENT_MYSQL_CODES$1 = /* @__PURE__ */ new Set([
  "PROTOCOL_CONNECTION_LOST",
  "ECONNRESET",
  "ECONNREFUSED",
  "EPIPE",
  "ETIMEDOUT",
  "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR",
  "PROTOCOL_PACKETS_OUT_OF_ORDER"
]);
function getPool() {
  if (pool) return pool;
  const config = useRuntimeConfig();
  pool = createPool({
    host: config.mysql.host,
    port: Number(config.mysql.port),
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    waitForConnections: true,
    connectionLimit: Number(config.mysql.connectionLimit || 10),
    maxIdle: Number(config.mysql.connectionLimit || 10),
    idleTimeout: 6e4,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 1e4,
    charset: "utf8mb4",
    timezone: "Z",
    dateStrings: true
  });
  return pool;
}
function isTransientMysqlError$1(error) {
  if (!error || typeof error !== "object") return false;
  const candidate = error;
  const message = candidate.message || "";
  return Boolean(
    candidate.fatal || candidate.code && TRANSIENT_MYSQL_CODES$1.has(candidate.code) || /connection lost|server closed the connection|read econnreset|connect etimedout|socket hang up/i.test(message)
  );
}
function toPublicMysqlError$1(error) {
  if (error && typeof error === "object") {
    const candidate = error;
    if (candidate.statusCode && (candidate.statusMessage || candidate.message)) return error;
    if (candidate.code === "PROTOCOL_SEQUENCE_TIMEOUT") {
      return publicError(504, "La consulta a base de datos excedio el tiempo de espera. Intenta de nuevo.");
    }
    if (isTransientMysqlError$1(error)) {
      return publicError(503, "La conexion a base de datos se perdio. Intenta de nuevo.");
    }
  }
  return error;
}
async function resetPool() {
  const current = pool;
  pool = null;
  if (!current) return;
  try {
    await current.end();
  } catch {
  }
}
async function executeWithRetry(sql, params) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const startedAt = performance.now();
    try {
      const [result] = await getPool().execute({ sql, values: params, timeout: DEFAULT_QUERY_TIMEOUT_MS$1 });
      const rowCount = Array.isArray(result) ? result.length : result.affectedRows;
      logEvent("debug", "mysql.query", {
        durationMs: Math.round(performance.now() - startedAt),
        rowCount,
        attempt: attempt + 1
      });
      return result;
    } catch (error) {
      lastError = error;
      logEvent("debug", "mysql.query.failed", {
        durationMs: Math.round(performance.now() - startedAt),
        attempt: attempt + 1,
        dependency: "mysql",
        code: error && typeof error === "object" ? error.code : void 0
      });
      if (!isTransientMysqlError$1(error) || attempt === 1) break;
      await resetPool();
    }
  }
  throw toPublicMysqlError$1(lastError);
}
async function legacyQuery(sql, params = []) {
  return executeWithRetry(sql, params);
}
async function legacyOne(sql, params = []) {
  const rows = await legacyQuery(sql, params);
  return rows[0];
}
async function legacyWrite(sql, params = []) {
  return executeWithRetry(sql, params);
}
function csvToList(value) {
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

let attendancePool = null;
const DEFAULT_QUERY_TIMEOUT_MS = 15e3;
const TRANSIENT_MYSQL_CODES = /* @__PURE__ */ new Set([
  "PROTOCOL_CONNECTION_LOST",
  "ECONNRESET",
  "ECONNREFUSED",
  "EPIPE",
  "ETIMEDOUT",
  "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR",
  "PROTOCOL_PACKETS_OUT_OF_ORDER"
]);
function getAttendancePool() {
  if (attendancePool) return attendancePool;
  const config = useRuntimeConfig();
  const db = config.attendanceMysql;
  attendancePool = createPool({
    host: db.host,
    port: Number(db.port),
    user: db.user,
    password: db.password,
    database: db.database,
    waitForConnections: true,
    connectionLimit: Number(db.connectionLimit || 5),
    maxIdle: Number(db.connectionLimit || 5),
    idleTimeout: 6e4,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 1e4,
    charset: "utf8mb4",
    timezone: "Z",
    dateStrings: true
  });
  return attendancePool;
}
function isTransientMysqlError(error) {
  if (!error || typeof error !== "object") return false;
  const candidate = error;
  const message = candidate.message || "";
  return Boolean(
    candidate.fatal || candidate.code && TRANSIENT_MYSQL_CODES.has(candidate.code) || /connection lost|server closed the connection|read econnreset|connect etimedout|socket hang up/i.test(message)
  );
}
function toPublicMysqlError(error) {
  if (error && typeof error === "object") {
    const candidate = error;
    if (candidate.statusCode && (candidate.statusMessage || candidate.message)) return error;
    if (candidate.code === "PROTOCOL_SEQUENCE_TIMEOUT") {
      return publicError(504, "La consulta de asistencia excedio el tiempo de espera. Intenta de nuevo.");
    }
    if (isTransientMysqlError(error)) {
      return publicError(503, "La base de asistencia no esta disponible. Intenta de nuevo.");
    }
  }
  return error;
}
async function resetAttendancePool() {
  const current = attendancePool;
  attendancePool = null;
  if (!current) return;
  try {
    await current.end();
  } catch {
  }
}
async function executeAttendance(sql, params) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const startedAt = performance.now();
    try {
      const [result] = await getAttendancePool().execute({ sql, values: params, timeout: DEFAULT_QUERY_TIMEOUT_MS });
      const rowCount = Array.isArray(result) ? result.length : result.affectedRows;
      logEvent("debug", "attendance-mysql.query", {
        durationMs: Math.round(performance.now() - startedAt),
        rowCount,
        attempt: attempt + 1
      });
      return result;
    } catch (error) {
      lastError = error;
      logEvent("debug", "attendance-mysql.query.failed", {
        durationMs: Math.round(performance.now() - startedAt),
        attempt: attempt + 1,
        dependency: "attendance-mysql",
        code: error && typeof error === "object" ? error.code : void 0
      });
      if (!isTransientMysqlError(error) || attempt === 1) break;
      await resetAttendancePool();
    }
  }
  throw toPublicMysqlError(lastError);
}
function attendanceQuery(sql, params = []) {
  return executeAttendance(sql, params);
}
async function attendanceOne(sql, params = []) {
  const rows = await attendanceQuery(sql, params);
  return rows[0];
}
function attendanceWrite(sql, params = []) {
  return executeAttendance(sql, params);
}

const SCHOOL_YEAR_START_MONTH = 7;
function normalizeAttendanceText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9\s]/g, " ").replace(/\s+/g, " ").trim().toUpperCase();
}
function makeSchoolYearRange(startYear) {
  return {
    label: `${startYear}-${startYear + 1}`,
    startDate: `${startYear}-08-01`,
    endDate: `${startYear + 1}-07-31`
  };
}
function parseSchoolYearLabel(value) {
  const raw = String(value || "").trim();
  const full = /^(\d{4})-(\d{4})$/.exec(raw);
  if (full) {
    const start = Number(full[1]);
    const end = Number(full[2]);
    if (end === start + 1) return makeSchoolYearRange(start);
  }
  const single = /^(\d{4})$/.exec(raw);
  if (single) return makeSchoolYearRange(Number(single[1]));
  return null;
}
function currentSchoolYearStart(reference = /* @__PURE__ */ new Date()) {
  const year = reference.getFullYear();
  return reference.getMonth() < SCHOOL_YEAR_START_MONTH ? year - 1 : year;
}
function buildSchoolYearOptions(extraCycle, reference = /* @__PURE__ */ new Date()) {
  const currentStart = currentSchoolYearStart(reference);
  const ranges = [
    makeSchoolYearRange(currentStart),
    makeSchoolYearRange(currentStart - 1),
    makeSchoolYearRange(currentStart - 2),
    makeSchoolYearRange(currentStart - 3)
  ];
  const extra = parseSchoolYearLabel(extraCycle);
  if (extra && !ranges.some((range) => range.label === extra.label)) ranges.push(extra);
  return ranges.sort((a, b) => b.label.localeCompare(a.label)).map((range) => ({ ...range, isCurrent: range.label === `${currentStart}-${currentStart + 1}` }));
}
function resolveSchoolYearOption(label, options, reference = /* @__PURE__ */ new Date()) {
  const fallback = options.find((option) => option.isCurrent) || options[0] || makeSchoolYearRange(currentSchoolYearStart(reference));
  const parsed = parseSchoolYearLabel(label);
  if (!parsed) return fallback;
  const currentStart = currentSchoolYearStart(reference);
  const startYear = Number(parsed.label.slice(0, 4));
  if (!Number.isFinite(startYear) || startYear < currentStart - 8 || startYear > currentStart + 1) return fallback;
  return options.find((option) => option.label === parsed.label) || { ...parsed, isCurrent: parsed.label === `${currentStart}-${currentStart + 1}` };
}
function dateOnly(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(value));
  return (match == null ? void 0 : match[1]) || "";
}
function formatAttendanceTime(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const [hours = "0", minutes = "00"] = raw.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

var description = "Grupo icon assets extracted from asistencia-docente group sprite mask. Use manifest.entries[*].grupoValue for matching current grupo values. Icons are provided as mask PNGs and green preview PNGs.";
var source = "asistencia-docente-roster-freshness-telemetry/public/group-spritesheet-mask.png";
var cell = {
	width: 256,
	height: 256,
	columns: 6,
	rows: 7
};
var fallbackGrupo = "OCEANÍA";
var aliases = {
	AFRICA: "ÁFRICA",
	AMERICA: "AMÉRICA",
	ANTARTIDA: "ANTÁRTIDA",
	OCEANIA: "OCEANÍA",
	BUHO: "BUHOS",
	BUHOS: "BUHOS",
	"BÚHO": "BUHOS",
	"BÚHOS": "BUHOS",
	ABEJA: "ABEJAS",
	BORREGO: "BORREGOS",
	CANGURO: "CANGUROS",
	CEBRA: "CEBRAS",
	COCODRILO: "COCODRILOS",
	CONEJO: "CONEJOS",
	DINO: "DINOS",
	DINOSAURIO: "DINOS",
	ELEFANTE: "ELEFANTES",
	FOCA: "FOCAS",
	JIRAFA: "JIRAFAS",
	KOALA: "KOALAS",
	LEON: "LEONES",
	"LEÓN": "LEONES",
	LEOPARDO: "LEOPARDOS",
	OSO: "OSOS",
	PANDA: "PANDAS",
	PANTERA: "PANTERAS",
	PATO: "PATOS",
	TIGRE: "TIGRES",
	UNICORNIO: "UNICORNIOS"
};
var entries = [
	{
		grupoValue: "MATERNAL A",
		normalizedKey: "MATERNAL A",
		slug: "maternal-a",
		index: 0,
		sprite: {
			column: 0,
			row: 0,
			x: 0,
			y: 0,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/01-maternal-a.png",
		previewGreenPng: "icons/preview-green/01-maternal-a.png"
	},
	{
		grupoValue: "MATERNAL B",
		normalizedKey: "MATERNAL B",
		slug: "maternal-b",
		index: 1,
		sprite: {
			column: 1,
			row: 0,
			x: 256,
			y: 0,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/02-maternal-b.png",
		previewGreenPng: "icons/preview-green/02-maternal-b.png"
	},
	{
		grupoValue: "LACTANTES B",
		normalizedKey: "LACTANTES B",
		slug: "lactantes-b",
		index: 2,
		sprite: {
			column: 2,
			row: 0,
			x: 512,
			y: 0,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/03-lactantes-b.png",
		previewGreenPng: "icons/preview-green/03-lactantes-b.png"
	},
	{
		grupoValue: "LACTANTES C",
		normalizedKey: "LACTANTES C",
		slug: "lactantes-c",
		index: 3,
		sprite: {
			column: 3,
			row: 0,
			x: 768,
			y: 0,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/04-lactantes-c.png",
		previewGreenPng: "icons/preview-green/04-lactantes-c.png"
	},
	{
		grupoValue: "A",
		normalizedKey: "A",
		slug: "a",
		index: 4,
		sprite: {
			column: 4,
			row: 0,
			x: 1024,
			y: 0,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/05-a.png",
		previewGreenPng: "icons/preview-green/05-a.png"
	},
	{
		grupoValue: "B",
		normalizedKey: "B",
		slug: "b",
		index: 5,
		sprite: {
			column: 5,
			row: 0,
			x: 1280,
			y: 0,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/06-b.png",
		previewGreenPng: "icons/preview-green/06-b.png"
	},
	{
		grupoValue: "C",
		normalizedKey: "C",
		slug: "c",
		index: 6,
		sprite: {
			column: 0,
			row: 1,
			x: 0,
			y: 256,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/07-c.png",
		previewGreenPng: "icons/preview-green/07-c.png"
	},
	{
		grupoValue: "D",
		normalizedKey: "D",
		slug: "d",
		index: 7,
		sprite: {
			column: 1,
			row: 1,
			x: 256,
			y: 256,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/08-d.png",
		previewGreenPng: "icons/preview-green/08-d.png"
	},
	{
		grupoValue: "E",
		normalizedKey: "E",
		slug: "e",
		index: 8,
		sprite: {
			column: 2,
			row: 1,
			x: 512,
			y: 256,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/09-e.png",
		previewGreenPng: "icons/preview-green/09-e.png"
	},
	{
		grupoValue: "F",
		normalizedKey: "F",
		slug: "f",
		index: 9,
		sprite: {
			column: 3,
			row: 1,
			x: 768,
			y: 256,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/10-f.png",
		previewGreenPng: "icons/preview-green/10-f.png"
	},
	{
		grupoValue: "G",
		normalizedKey: "G",
		slug: "g",
		index: 10,
		sprite: {
			column: 4,
			row: 1,
			x: 1024,
			y: 256,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/11-g.png",
		previewGreenPng: "icons/preview-green/11-g.png"
	},
	{
		grupoValue: "H",
		normalizedKey: "H",
		slug: "h",
		index: 11,
		sprite: {
			column: 5,
			row: 1,
			x: 1280,
			y: 256,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/12-h.png",
		previewGreenPng: "icons/preview-green/12-h.png"
	},
	{
		grupoValue: "ÁFRICA",
		normalizedKey: "AFRICA",
		slug: "africa",
		index: 12,
		sprite: {
			column: 0,
			row: 2,
			x: 0,
			y: 512,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/13-africa.png",
		previewGreenPng: "icons/preview-green/13-africa.png"
	},
	{
		grupoValue: "AMÉRICA",
		normalizedKey: "AMERICA",
		slug: "america",
		index: 13,
		sprite: {
			column: 1,
			row: 2,
			x: 256,
			y: 512,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/14-america.png",
		previewGreenPng: "icons/preview-green/14-america.png"
	},
	{
		grupoValue: "ANTÁRTIDA",
		normalizedKey: "ANTARTIDA",
		slug: "antartida",
		index: 14,
		sprite: {
			column: 2,
			row: 2,
			x: 512,
			y: 512,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/15-antartida.png",
		previewGreenPng: "icons/preview-green/15-antartida.png"
	},
	{
		grupoValue: "ASIA",
		normalizedKey: "ASIA",
		slug: "asia",
		index: 15,
		sprite: {
			column: 3,
			row: 2,
			x: 768,
			y: 512,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/16-asia.png",
		previewGreenPng: "icons/preview-green/16-asia.png"
	},
	{
		grupoValue: "EUROPA",
		normalizedKey: "EUROPA",
		slug: "europa",
		index: 16,
		sprite: {
			column: 4,
			row: 2,
			x: 1024,
			y: 512,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/17-europa.png",
		previewGreenPng: "icons/preview-green/17-europa.png"
	},
	{
		grupoValue: "OCEANÍA",
		normalizedKey: "OCEANIA",
		slug: "oceania",
		index: 17,
		sprite: {
			column: 5,
			row: 2,
			x: 1280,
			y: 512,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/18-oceania.png",
		previewGreenPng: "icons/preview-green/18-oceania.png"
	},
	{
		grupoValue: "ABEJAS",
		normalizedKey: "ABEJAS",
		slug: "abejas",
		index: 18,
		sprite: {
			column: 0,
			row: 3,
			x: 0,
			y: 768,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/19-abejas.png",
		previewGreenPng: "icons/preview-green/19-abejas.png"
	},
	{
		grupoValue: "BORREGOS",
		normalizedKey: "BORREGOS",
		slug: "borregos",
		index: 19,
		sprite: {
			column: 1,
			row: 3,
			x: 256,
			y: 768,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/20-borregos.png",
		previewGreenPng: "icons/preview-green/20-borregos.png"
	},
	{
		grupoValue: "BUHOS",
		normalizedKey: "BUHOS",
		slug: "buhos",
		index: 20,
		sprite: {
			column: 2,
			row: 3,
			x: 512,
			y: 768,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/21-buhos.png",
		previewGreenPng: "icons/preview-green/21-buhos.png"
	},
	{
		grupoValue: "CANGUROS",
		normalizedKey: "CANGUROS",
		slug: "canguros",
		index: 21,
		sprite: {
			column: 3,
			row: 3,
			x: 768,
			y: 768,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/22-canguros.png",
		previewGreenPng: "icons/preview-green/22-canguros.png"
	},
	{
		grupoValue: "CEBRAS",
		normalizedKey: "CEBRAS",
		slug: "cebras",
		index: 22,
		sprite: {
			column: 4,
			row: 3,
			x: 1024,
			y: 768,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/23-cebras.png",
		previewGreenPng: "icons/preview-green/23-cebras.png"
	},
	{
		grupoValue: "COCODRILOS",
		normalizedKey: "COCODRILOS",
		slug: "cocodrilos",
		index: 23,
		sprite: {
			column: 5,
			row: 3,
			x: 1280,
			y: 768,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/24-cocodrilos.png",
		previewGreenPng: "icons/preview-green/24-cocodrilos.png"
	},
	{
		grupoValue: "CONEJOS",
		normalizedKey: "CONEJOS",
		slug: "conejos",
		index: 24,
		sprite: {
			column: 0,
			row: 4,
			x: 0,
			y: 1024,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/25-conejos.png",
		previewGreenPng: "icons/preview-green/25-conejos.png"
	},
	{
		grupoValue: "DINOS",
		normalizedKey: "DINOS",
		slug: "dinos",
		index: 25,
		sprite: {
			column: 1,
			row: 4,
			x: 256,
			y: 1024,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/26-dinos.png",
		previewGreenPng: "icons/preview-green/26-dinos.png"
	},
	{
		grupoValue: "ELEFANTES",
		normalizedKey: "ELEFANTES",
		slug: "elefantes",
		index: 26,
		sprite: {
			column: 2,
			row: 4,
			x: 512,
			y: 1024,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/27-elefantes.png",
		previewGreenPng: "icons/preview-green/27-elefantes.png"
	},
	{
		grupoValue: "FOCAS",
		normalizedKey: "FOCAS",
		slug: "focas",
		index: 27,
		sprite: {
			column: 3,
			row: 4,
			x: 768,
			y: 1024,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/28-focas.png",
		previewGreenPng: "icons/preview-green/28-focas.png"
	},
	{
		grupoValue: "JIRAFAS",
		normalizedKey: "JIRAFAS",
		slug: "jirafas",
		index: 28,
		sprite: {
			column: 4,
			row: 4,
			x: 1024,
			y: 1024,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/29-jirafas.png",
		previewGreenPng: "icons/preview-green/29-jirafas.png"
	},
	{
		grupoValue: "KOALAS",
		normalizedKey: "KOALAS",
		slug: "koalas",
		index: 29,
		sprite: {
			column: 5,
			row: 4,
			x: 1280,
			y: 1024,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/30-koalas.png",
		previewGreenPng: "icons/preview-green/30-koalas.png"
	},
	{
		grupoValue: "LEONES",
		normalizedKey: "LEONES",
		slug: "leones",
		index: 30,
		sprite: {
			column: 0,
			row: 5,
			x: 0,
			y: 1280,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/31-leones.png",
		previewGreenPng: "icons/preview-green/31-leones.png"
	},
	{
		grupoValue: "LEOPARDOS",
		normalizedKey: "LEOPARDOS",
		slug: "leopardos",
		index: 31,
		sprite: {
			column: 1,
			row: 5,
			x: 256,
			y: 1280,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/32-leopardos.png",
		previewGreenPng: "icons/preview-green/32-leopardos.png"
	},
	{
		grupoValue: "OSOS",
		normalizedKey: "OSOS",
		slug: "osos",
		index: 32,
		sprite: {
			column: 2,
			row: 5,
			x: 512,
			y: 1280,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/33-osos.png",
		previewGreenPng: "icons/preview-green/33-osos.png"
	},
	{
		grupoValue: "PANDAS",
		normalizedKey: "PANDAS",
		slug: "pandas",
		index: 33,
		sprite: {
			column: 3,
			row: 5,
			x: 768,
			y: 1280,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/34-pandas.png",
		previewGreenPng: "icons/preview-green/34-pandas.png"
	},
	{
		grupoValue: "PANTERAS",
		normalizedKey: "PANTERAS",
		slug: "panteras",
		index: 34,
		sprite: {
			column: 4,
			row: 5,
			x: 1024,
			y: 1280,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/35-panteras.png",
		previewGreenPng: "icons/preview-green/35-panteras.png"
	},
	{
		grupoValue: "PATOS",
		normalizedKey: "PATOS",
		slug: "patos",
		index: 35,
		sprite: {
			column: 5,
			row: 5,
			x: 1280,
			y: 1280,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/36-patos.png",
		previewGreenPng: "icons/preview-green/36-patos.png"
	},
	{
		grupoValue: "TIGRES",
		normalizedKey: "TIGRES",
		slug: "tigres",
		index: 36,
		sprite: {
			column: 0,
			row: 6,
			x: 0,
			y: 1536,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/37-tigres.png",
		previewGreenPng: "icons/preview-green/37-tigres.png"
	},
	{
		grupoValue: "UNICORNIOS",
		normalizedKey: "UNICORNIOS",
		slug: "unicornios",
		index: 37,
		sprite: {
			column: 1,
			row: 6,
			x: 256,
			y: 1536,
			width: 256,
			height: 256
		},
		maskPng: "icons/mask/38-unicornios.png",
		previewGreenPng: "icons/preview-green/38-unicornios.png"
	}
];
const bundledManifest = {
	description: description,
	source: source,
	cell: cell,
	fallbackGrupo: fallbackGrupo,
	aliases: aliases,
	entries: entries
};

let manifestCache = null;
function repairMojibake(value) {
  if (!/[\u00c3\u00c2\ufffd\u0080-\u009f]/.test(value)) return value;
  try {
    return Buffer.from(value, "latin1").toString("utf8");
  } catch {
    return value;
  }
}
async function loadGrupoManifest() {
  if (manifestCache) return manifestCache;
  const parsed = bundledManifest;
  manifestCache = {
    ...parsed,
    fallbackGrupo: repairMojibake(parsed.fallbackGrupo),
    aliases: Object.fromEntries(Object.entries(parsed.aliases || {}).map(([key, value]) => [normalizeAttendanceText(repairMojibake(key)), normalizeAttendanceText(repairMojibake(value))])),
    entries: parsed.entries.map((entry) => ({
      ...entry,
      grupoValue: repairMojibake(entry.grupoValue),
      normalizedKey: normalizeAttendanceText(repairMojibake(entry.normalizedKey || entry.grupoValue))
    }))
  };
  return manifestCache;
}
async function resolveGrupoSigil(grupo) {
  var _a;
  try {
    const manifest = await loadGrupoManifest();
    const requested = normalizeAttendanceText(repairMojibake(String(grupo || "")));
    const alias = requested ? ((_a = manifest.aliases) == null ? void 0 : _a[requested]) || requested : "";
    const exact = manifest.entries.find((entry2) => entry2.normalizedKey === alias || normalizeAttendanceText(entry2.grupoValue) === alias);
    const fallbackKey = normalizeAttendanceText(manifest.fallbackGrupo);
    const fallback = manifest.entries.find((entry2) => entry2.normalizedKey === fallbackKey) || manifest.entries[0];
    const entry = exact || fallback;
    return {
      grupoValue: (entry == null ? void 0 : entry.grupoValue) || manifest.fallbackGrupo || "Grupo",
      image: (entry == null ? void 0 : entry.previewGreenPng) ? `/grupo-icons/${entry.previewGreenPng}` : "",
      fallback: !exact
    };
  } catch {
    return {
      grupoValue: String(grupo || "Grupo").trim() || "Grupo",
      image: "",
      fallback: true
    };
  }
}

const PLANTEL_MAP = {
  PM: {
    db_code: "PM",
    db_codes: ["PM", "PMA", "PMB", "4 - PM", "04 - PM", "PRIMARIA METEPEC", "PRIMARIA ALTA METEPEC", "PRIMARIA BAJA METEPEC"],
    name: "Primaria Metepec",
    sapf_data_campuses: ["PM", "PMA", "PMB", "Primaria Metepec", "Primaria Alta Metepec", "Primaria Baja Metepec"]
  },
  PMA: {
    alias_of: "PM",
    db_code: "PM",
    db_codes: ["PM", "PMA", "PMB", "4 - PM", "04 - PM", "PRIMARIA METEPEC", "PRIMARIA ALTA METEPEC", "PRIMARIA BAJA METEPEC"],
    name: "Primaria Metepec",
    sapf_data_campuses: ["PM", "PMA", "PMB", "Primaria Metepec", "Primaria Alta Metepec", "Primaria Baja Metepec"]
  },
  PMB: {
    alias_of: "PM",
    db_code: "PM",
    db_codes: ["PM", "PMA", "PMB", "4 - PM", "04 - PM", "PRIMARIA METEPEC", "PRIMARIA ALTA METEPEC", "PRIMARIA BAJA METEPEC"],
    name: "Primaria Metepec",
    sapf_data_campuses: ["PM", "PMA", "PMB", "Primaria Metepec", "Primaria Alta Metepec", "Primaria Baja Metepec"]
  },
  PT: {
    db_code: "PT",
    db_codes: ["PT", "01", "1", "1 - PT", "14 - PT", "PRIMARIA TOLUCA"],
    name: "Primaria Toluca",
    sapf_data_campuses: ["PT", "Primaria Toluca"]
  },
  SM: {
    db_code: "SM",
    db_codes: ["SM", "5 - SM", "05 - SM", "SECUNDARIA METEPEC"],
    name: "Secundaria Metepec",
    sapf_data_campuses: ["SM", "Secundaria Metepec"]
  },
  ST: {
    db_code: "ST",
    db_codes: ["ST", "2 - ST", "02 - ST", "SECUNDARIA TOLUCA"],
    name: "Secundaria Toluca",
    sapf_data_campuses: ["ST", "Secundaria Toluca"]
  },
  PREET: {
    db_code: "PREET",
    db_codes: ["PREET", "CT", "PREES TOL", "PREES-TOL", "PREESCOLAR TOLUCA", "CASITA TOLUCA"],
    husky_db_codes: ["PREET", "CT", "PREES TOL", "PREESCOLAR TOLUCA", "CASITA TOLUCA"],
    name: "PREET",
    display_name: "Preescolar Toluca (PREET)",
    sapf_data_campuses: ["PREET", "PREES TOL", "PREES-TOL", "PREES_TOL", "Preescolar Toluca", "PREESCOLAR TOLUCA", "CT", "Casita Toluca"]
  },
  CT: {
    alias_of: "PREET",
    db_code: "PREET",
    db_codes: ["PREET", "CT", "PREES TOL", "PREES-TOL", "PREESCOLAR TOLUCA", "CASITA TOLUCA"],
    husky_db_codes: ["PREET", "CT", "PREES TOL", "PREESCOLAR TOLUCA", "CASITA TOLUCA"],
    name: "PREET",
    display_name: "Preescolar Toluca (PREET)",
    sapf_data_campuses: ["PREET", "PREES TOL", "PREES-TOL", "PREES_TOL", "Preescolar Toluca", "PREESCOLAR TOLUCA", "CT", "Casita Toluca"]
  },
  PREEM: {
    db_code: "PREEM",
    db_codes: ["PREEM", "CM", "PREES MET", "PREES-MET", "PREESCOLAR METEPEC", "CASITA METEPEC"],
    husky_db_codes: ["PREEM", "CM", "PREES MET", "PREESCOLAR METEPEC", "CASITA METEPEC"],
    name: "PREEM",
    display_name: "Preescolar Metepec (PREEM)",
    sapf_data_campuses: ["PREEM", "PREES MET", "PREES-MET", "PREES_MET", "Preescolar Metepec", "PREESCOLAR METEPEC", "CM", "Casita Metepec"]
  },
  CM: {
    alias_of: "PREEM",
    db_code: "PREEM",
    db_codes: ["PREEM", "CM", "PREES MET", "PREES-MET", "PREESCOLAR METEPEC", "CASITA METEPEC"],
    husky_db_codes: ["PREEM", "CM", "PREES MET", "PREESCOLAR METEPEC", "CASITA METEPEC"],
    name: "PREEM",
    display_name: "Preescolar Metepec (PREEM)",
    sapf_data_campuses: ["PREEM", "PREES MET", "PREES-MET", "PREES_MET", "Preescolar Metepec", "PREESCOLAR METEPEC", "CM", "Casita Metepec"]
  },
  DM: {
    db_code: "DM",
    db_codes: ["DM"],
    name: "Desarrollo Metepec",
    sapf_data_campuses: ["DM"]
  },
  PR: {
    db_code: "PR",
    db_codes: ["PR"],
    name: "Preescolar / PR",
    sapf_data_campuses: ["PR"]
  },
  "01": {
    db_code: "01",
    db_codes: ["01"],
    name: "Primaria Toluca (01)",
    sapf_data_campuses: ["PT", "Primaria Toluca"]
  }
};
function dedupe(values) {
  const seen = /* @__PURE__ */ new Set();
  return values.filter((value) => {
    const key = normalizeAttendanceText(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function resolveSipaePlantel(plantelCode) {
  const requested = String(plantelCode || "").trim();
  const code = requested.toUpperCase();
  const mapping = PLANTEL_MAP[code] || PLANTEL_MAP[normalizeAttendanceText(code)] || null;
  const canonical = (mapping == null ? void 0 : mapping.alias_of) || code;
  const dbCode = (mapping == null ? void 0 : mapping.db_code) || canonical || requested;
  const dbCodes = dedupe((mapping == null ? void 0 : mapping.db_codes) || [dbCode]);
  const huskyDbCodes = dedupe((mapping == null ? void 0 : mapping.husky_db_codes) || dbCodes);
  const sapfDataCampuses = dedupe((mapping == null ? void 0 : mapping.sapf_data_campuses) || [dbCode]);
  return {
    plantelRequested: requested || dbCode,
    plantelCode: code || dbCode,
    canonicalCode: canonical || dbCode,
    dbCode,
    dbCodes,
    huskyDbCodes,
    sapfDataCampuses,
    resolvedName: (mapping == null ? void 0 : mapping.display_name) || (mapping == null ? void 0 : mapping.name) || dbCode
  };
}
function deriveSipaePlantelFromStudent(input) {
  const matricula = String(input.matricula || "").trim().toUpperCase();
  const nivel = String(input.nivelEdu || "").toLowerCase();
  const campus = String(input.campus || "").toLowerCase();
  const plantel = String(input.plantel || "").trim().toUpperCase();
  if (matricula.startsWith("PREEM")) return "PREEM";
  if (matricula.startsWith("PREET")) return "PREET";
  if (matricula.startsWith("CT")) return "CT";
  if (matricula.startsWith("CM")) return "CM";
  if (matricula.startsWith("DM")) return "CM";
  if (matricula.startsWith("SM")) return "SM";
  if (matricula.startsWith("ST")) return "ST";
  if (matricula.startsWith("PM")) return "PM";
  if (matricula.startsWith("PT")) return "PT";
  if (plantel) return plantel;
  if (campus.includes("metepec") && nivel.includes("prees")) return "PREEM";
  if (campus.includes("toluca") && nivel.includes("prees")) return "PREET";
  return matricula.slice(0, 2) || "PT";
}
function plantelMatches(candidate, expectedPlantelCode) {
  const normalizedCandidate = normalizeAttendanceText(candidate);
  if (!normalizedCandidate) return false;
  const plantel = resolveSipaePlantel(expectedPlantelCode);
  return dedupe([
    plantel.dbCode,
    plantel.plantelCode,
    plantel.canonicalCode,
    plantel.resolvedName,
    ...plantel.dbCodes,
    ...plantel.sapfDataCampuses,
    ...plantel.huskyDbCodes
  ]).some((value) => {
    const normalized = normalizeAttendanceText(value);
    return normalizedCandidate === normalized || normalizedCandidate.startsWith(normalized) || normalizedCandidate.includes(normalized);
  });
}

function sipaeConfig() {
  const config = useRuntimeConfig();
  return {
    baseURL: String(config.sipae.apiBaseUrl || "").replace(/\/$/, ""),
    timeout: Number(config.sipae.timeoutMs || 2e4)
  };
}
function sipaeErrorMessage(error) {
  var _a;
  if (!error || typeof error !== "object") return "SIPAE no respondi\xF3.";
  const candidate = error;
  const text = `${candidate.name || ""} ${candidate.message || ""}`;
  if (/timeout|parent read deadline|exceeded parent read deadline/i.test(text)) return "SIPAE excedi\xF3 el tiempo de espera.";
  if (candidate.statusCode) return `SIPAE respondi\xF3 con error ${candidate.statusCode}.`;
  return ((_a = candidate.data) == null ? void 0 : _a.detail) || candidate.message || "SIPAE no respondi\xF3.";
}
function sipaeErrorState(error) {
  const message = sipaeErrorMessage(error);
  return /tiempo de espera|timeout/i.test(message) ? "timeout" : "unavailable";
}
function fetchSipaeAttendanceDetail(plantel, range) {
  const config = sipaeConfig();
  return $fetch("/api/v1/attendance/detail", {
    baseURL: config.baseURL,
    timeout: config.timeout,
    query: {
      plantel,
      scope: "range",
      start_date: range.startDate,
      end_date: range.endDate
    }
  });
}
function fetchSipaeTardies(plantel, range) {
  const config = sipaeConfig();
  return $fetch("/api/v1/husky/retardos", {
    baseURL: config.baseURL,
    timeout: config.timeout,
    query: {
      plantel,
      scope: "range",
      start_date: range.startDate,
      end_date: range.endDate
    }
  });
}

function cleanText(value) {
  const raw = String(value || "").trim();
  if (!/[\u00c3\u00c2\ufffd\u0080-\u009f]/.test(raw)) return raw;
  try {
    return Buffer.from(raw, "latin1").toString("utf8");
  } catch {
    return raw;
  }
}
function nullable(value) {
  const normalized = cleanText(value).trim();
  return normalized || null;
}
function surnameFirstName(child) {
  return [child.paternalName, child.maternalName, child.givenName].filter(Boolean).join(" ");
}
function givenFirstName(child) {
  return [child.givenName, child.paternalName, child.maternalName].filter(Boolean).join(" ");
}
function tokenKey(value) {
  return normalizeAttendanceText(value).split(" ").filter(Boolean).sort().join("|");
}
function childNameMatches(child, candidate) {
  const normalizedCandidate = normalizeAttendanceText(cleanText(candidate));
  if (!normalizedCandidate) return false;
  const variants = [child.name, givenFirstName(child), surnameFirstName(child)].map((value) => normalizeAttendanceText(value)).filter(Boolean);
  return variants.includes(normalizedCandidate) || variants.some((variant) => tokenKey(variant) === tokenKey(normalizedCandidate));
}
function knownFieldMatches(childValue, recordValue) {
  const childKey = normalizeAttendanceText(cleanText(childValue));
  if (!childKey) return true;
  return childKey === normalizeAttendanceText(cleanText(recordValue));
}
function groupMatches(child, record) {
  return knownFieldMatches(child.grado, record.grado) && knownFieldMatches(child.grupo, record.grupo);
}
function absenceMatchesChild(child, record) {
  return childNameMatches(child, record.name) && groupMatches(child, record);
}
function dbAbsenceMatchesChild(child, record) {
  return Number(record.attendance) === 0 && plantelMatches(record.plantel, child.plantelCode) && absenceMatchesChild(child, { name: record.name, grado: record.grado, grupo: record.grupo });
}
function tardyMatchesChild(child, record) {
  const recordMatricula = normalizeAttendanceText(record.matricula);
  if (recordMatricula && recordMatricula !== "N A") {
    return recordMatricula === normalizeAttendanceText(child.matricula);
  }
  return childNameMatches(child, record.student_fullname);
}
function groupDataMatchesChild(child, group) {
  return groupMatches(child, { grado: group.grado || null, grupo: group.grupo || null });
}
function mapAbsence(absence) {
  const motivo = nullable(absence.motivo);
  return {
    id: Number(absence.id),
    date: absence.date,
    studentName: cleanText(absence.name),
    grado: nullable(absence.grado),
    grupo: nullable(absence.grupo),
    plantel: nullable(absence.plantel),
    motivo,
    motivoState: motivo ? "provided" : "missing",
    canUpdate: true
  };
}
function mapDbAbsence(row) {
  const motivo = nullable(row.motivo);
  return {
    id: Number(row.id),
    date: dateOnly(row.fecha),
    studentName: cleanText(row.name),
    grado: nullable(row.grado),
    grupo: nullable(row.grupo),
    plantel: nullable(row.plantel),
    motivo,
    motivoState: motivo ? "provided" : "missing",
    canUpdate: true
  };
}
function rawSqlValues(values) {
  const seen = /* @__PURE__ */ new Set();
  return values.map((value) => cleanText(value).trim()).filter((value) => {
    const key = value.toUpperCase();
    if (!value || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function rawInClause(column, values) {
  return {
    clause: `${column} IN (${values.map(() => "?").join(",")})`,
    params: values
  };
}
function rawPlantelSqlClause(alias, plantelCode) {
  const plantel = resolveSipaePlantel(plantelCode);
  const values = rawSqlValues([
    plantel.dbCode,
    plantel.plantelCode,
    plantel.canonicalCode,
    plantel.resolvedName,
    ...plantel.dbCodes,
    ...plantel.sapfDataCampuses,
    ...plantel.huskyDbCodes
  ]);
  return rawInClause(`${alias}.plantel`, values);
}
function rawKnownGroupWhere(child, alias) {
  const where = [];
  const params = [];
  const grado = cleanText(child.grado).trim();
  const grupo = cleanText(child.grupo).trim();
  if (grado) {
    where.push(`${alias}.grado = ?`);
    params.push(grado);
  }
  if (grupo) {
    where.push(`${alias}.grupo = ?`);
    params.push(grupo);
  }
  return { where, params };
}
function rawKnownNameWhere(child, alias) {
  const values = rawSqlValues([
    child.name,
    givenFirstName(child),
    surnameFirstName(child)
  ]);
  if (!values.length) return { clause: "", params: [] };
  return rawInClause(`${alias}.name`, values);
}
function rangeStartTime(range) {
  return `${range.startDate} 00:00:00`;
}
function rangeEndTime(range) {
  return `${range.endDate} 23:59:59`;
}
async function fetchAttendanceDbFallback(child, range) {
  const plantel = rawPlantelSqlClause("A", child.plantelCode);
  const group = rawKnownGroupWhere(child, "A");
  const name = rawKnownNameWhere(child, "A");
  const rows = await attendanceQuery(
    `SELECT id, fecha, name, grado, grupo, plantel, attendance, motivo
     FROM asistencia A
     WHERE A.attendance = 0
       AND ${plantel.clause}
       AND A.fecha BETWEEN ? AND ?
       ${group.where.length ? `AND ${group.where.join(" AND ")}` : ""}
       ${name.clause ? `AND ${name.clause}` : ""}
     ORDER BY A.fecha ASC, A.id ASC`,
    [...plantel.params, rangeStartTime(range), rangeEndTime(range), ...group.params, ...name.params]
  );
  const absences = rows.filter((row) => dbAbsenceMatchesChild(child, row)).map(mapDbAbsence);
  const groupDates = /* @__PURE__ */ new Set();
  if (name.clause) {
    const groupRows = await attendanceQuery(
      `SELECT DISTINCT DATE(A.fecha) AS fecha
       FROM asistencia A
       WHERE ${plantel.clause}
         AND A.fecha BETWEEN ? AND ?
         ${group.where.length ? `AND ${group.where.join(" AND ")}` : ""}
         AND ${name.clause}
       ORDER BY fecha ASC`,
      [...plantel.params, rangeStartTime(range), rangeEndTime(range), ...group.params, ...name.params]
    );
    for (const row of groupRows) {
      const date = dateOnly(row.fecha);
      if (date) groupDates.add(date);
    }
  }
  for (const absence of absences) groupDates.add(absence.date);
  return { absences, groupDates };
}
function tardyThresholdForPlantel(plantelCode) {
  const dbCode = resolveSipaePlantel(plantelCode).dbCode;
  if (dbCode === "PM" || dbCode === "PT") return "08:01:00";
  if (dbCode === "SM" || dbCode === "ST") return "07:01:00";
  return "09:01:00";
}
function minutesFromTime(value) {
  const [hours = "0", minutes = "0"] = formatAttendanceTime(value).split(":");
  return Number(hours) * 60 + Number(minutes);
}
function minutesLateFor(time, threshold) {
  const diff = minutesFromTime(time) - minutesFromTime(threshold);
  return Number.isFinite(diff) ? Math.max(0, diff) : 0;
}
async function fetchTardiesDbFallback(child, range) {
  const threshold = tardyThresholdForPlantel(child.plantelCode);
  const user = await legacyOne(
    `SELECT id
     FROM users
     WHERE username = ?
     LIMIT 1`,
    [child.matricula]
  );
  if (!(user == null ? void 0 : user.id)) return [];
  const directScans = await legacyQuery(
    `SELECT id, timestamp
     FROM acceso
     WHERE ss_id = ?
       AND timestamp BETWEEN ? AND ?
       AND timestamp IS NOT NULL
       AND type = 'entrada'
       AND DAYOFWEEK(timestamp) NOT IN (1, 7)
     ORDER BY timestamp ASC`,
    [Number(user.id), rangeStartTime(range), rangeEndTime(range)]
  );
  const authorizedPeople = await legacyQuery(
    `SELECT id
     FROM personas_autorizadas
     WHERE user_id = ?`,
    [Number(user.id)]
  );
  const authorizedIds = authorizedPeople.map((row) => Number(row.id)).filter(Number.isFinite);
  const authorizedScans = authorizedIds.length ? await legacyQuery(
    `SELECT id, timestamp
       FROM acceso
       WHERE ss_id IN (${authorizedIds.map(() => "?").join(",")})
         AND timestamp BETWEEN ? AND ?
         AND timestamp IS NOT NULL
         AND type = 'entrada'
         AND DAYOFWEEK(timestamp) NOT IN (1, 7)
       ORDER BY timestamp ASC`,
    [...authorizedIds, rangeStartTime(range), rangeEndTime(range)]
  ) : [];
  const firstScanByDate = /* @__PURE__ */ new Map();
  for (const scan of [...directScans, ...authorizedScans]) {
    const date = dateOnly(scan.timestamp);
    const timestamp = String(scan.timestamp || "");
    const previous = firstScanByDate.get(date);
    if (date && (!previous || timestamp < String(previous.timestamp || ""))) firstScanByDate.set(date, scan);
  }
  return Array.from(firstScanByDate.entries()).map(([date, scan]) => {
    const rawTimestamp = String(scan.timestamp || "");
    const rawTime = rawTimestamp.slice(11, 19);
    const time = formatAttendanceTime(rawTime);
    return { date, scan, rawTime, time };
  }).filter((record) => record.rawTime > threshold).map(({ date, scan, time }) => mapTardy({
    id: scan.id,
    student_fullname: child.name,
    matricula: child.matricula,
    date,
    time
  }, child.plantelCode)).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}
function mapTardy(record, plantelCode) {
  const thresholdTime = formatAttendanceTime(tardyThresholdForPlantel(plantelCode));
  const time = formatAttendanceTime(record.time);
  return {
    id: Number(record.id),
    date: dateOnly(record.date),
    time,
    thresholdTime,
    minutesLate: minutesLateFor(time, thresholdTime),
    studentName: cleanText(record.student_fullname),
    matricula: normalizeMatricula(record.matricula) || null
  };
}
function extractAbsences(payload, child) {
  var _a;
  const plantel = payload.resolved_name || payload.plantel_requested;
  const records = [];
  if (payload.mode === "daily") {
    const date = dateOnly((_a = payload.date_range) == null ? void 0 : _a.start);
    for (const absent of payload.absent_students || []) records.push({ ...absent, date, plantel });
  } else {
    for (const [date, day] of Object.entries(payload.daily_points || {})) {
      for (const absent of day.absent_students || []) records.push({ ...absent, date: dateOnly(date), plantel });
    }
  }
  const seen = /* @__PURE__ */ new Set();
  return records.filter((record) => absenceMatchesChild(child, record)).map(mapAbsence).filter((record) => {
    if (!Number.isFinite(record.id) || seen.has(record.id)) return false;
    seen.add(record.id);
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date));
}
function extractGroupDates(payload, child) {
  var _a;
  const dates = /* @__PURE__ */ new Set();
  if (payload.mode === "daily") {
    if ((payload.groups || []).some((group) => groupDataMatchesChild(child, group))) dates.add(dateOnly((_a = payload.date_range) == null ? void 0 : _a.start));
  } else {
    for (const [date, day] of Object.entries(payload.daily_points || {})) {
      if ((day.groups || []).some((group) => groupDataMatchesChild(child, group))) dates.add(dateOnly(date));
    }
  }
  return dates;
}
function extractTardies(payload, child) {
  const seen = /* @__PURE__ */ new Set();
  return (payload.retardos || []).filter((record) => tardyMatchesChild(child, record)).map((record) => mapTardy(record, child.plantelCode)).filter((record) => {
    const key = `${record.date}:${record.time}:${record.matricula || record.studentName}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}
function buildCalendarDays(groupDates, absences, tardies) {
  const absenceByDate = new Map(absences.map((absence) => [absence.date, absence]));
  const tardyDates = new Set(tardies.map((tardy) => tardy.date));
  const dates = /* @__PURE__ */ new Set([...groupDates, ...absenceByDate.keys(), ...tardyDates]);
  return Array.from(dates).filter(Boolean).sort((a, b) => a.localeCompare(b)).map((date) => {
    const absence = absenceByDate.get(date);
    const tardy = tardyDates.has(date);
    if (absence && tardy) return { date, status: "absence-tardy", motivoState: absence.motivoState };
    if (absence) return { date, status: "absence", motivoState: absence.motivoState };
    if (tardy) return { date, status: "tardy" };
    return { date, status: "clear" };
  });
}
function summarize(calendarDays, absences, tardies) {
  return {
    schoolDaysWithAttendance: calendarDays.length,
    clearDays: calendarDays.filter((day) => day.status === "clear" || day.status === "tardy").length,
    absences: absences.length,
    tardies: tardies.length,
    unresolvedAbsences: absences.filter((absence) => absence.motivoState === "missing").length,
    resolvedAbsences: absences.filter((absence) => absence.motivoState === "provided").length
  };
}
function buildEvents(absences, tardies) {
  const absenceEvents = absences.map((absence) => ({
    key: `absence-${absence.id}`,
    type: "absence",
    date: absence.date,
    title: "Inasistencia",
    detail: absence.motivo ? "Motivo registrado" : "Motivo de inasistencia pendiente",
    absence
  }));
  const tardyEvents = tardies.map((tardy) => ({
    key: `tardy-${tardy.id}-${tardy.date}-${tardy.time}`,
    type: "tardy",
    date: tardy.date,
    time: tardy.time,
    title: "Retardo",
    detail: tardy.minutesLate > 0 ? `${tardy.minutesLate} min tarde` : "Entrada fuera de horario",
    tardy
  }));
  return [...absenceEvents, ...tardyEvents].sort((a, b) => `${b.date} ${b.time || "23:59"}`.localeCompare(`${a.date} ${a.time || "23:59"}`));
}
const FAMILY_PARENT_FIELDS = [
  "nombre_padre",
  "apellido_paterno_padre",
  "apellido_materno_padre",
  "nombre_madre",
  "apellido_paterno_madre",
  "apellido_materno_madre"
];
const STUDENT_SELECT = `
  m.matricula,
  m.nombres,
  m.apellido_paterno,
  m.apellido_materno,
  m.nivel,
  m.grado,
  m.grupo,
  m.ciclo,
  m.foto,
  m.nombre_padre,
  m.apellido_paterno_padre,
  m.apellido_materno_padre,
  m.nombre_madre,
  m.apellido_paterno_madre,
  m.apellido_materno_madre,
  u.id AS user_id,
  u.campus
`;
function familyMatricula(user) {
  const matricula = normalizeMatricula(user.username);
  if (!matricula) throw publicError(403, "La cuenta familiar no tiene matr\xEDcula vinculada.");
  return matricula;
}
function isUsableMatricula(value) {
  return /^[A-Z0-9-]+$/i.test(value) && /\d/.test(value);
}
function completeAttendanceParentFields(row) {
  return FAMILY_PARENT_FIELDS.every((field) => nullable(row[field]));
}
function attendanceChildFromRow(row, currentMatricula, user) {
  var _a;
  const matricula = normalizeMatricula(row.matricula);
  if (!matricula || !isUsableMatricula(matricula)) return null;
  const nivelEdu = nullable(row.nivel);
  const campus = nullable(row.campus || user.campus || user.empresa);
  const plantelCode = deriveSipaePlantelFromStudent({
    matricula,
    nivelEdu,
    campus,
    plantel: ((_a = user.plantel) == null ? void 0 : _a[0]) || null
  });
  const name = [row.nombres, row.apellido_paterno, row.apellido_materno].map(nullable).filter(Boolean).join(" ") || matricula;
  return {
    matricula,
    name,
    givenName: nullable(row.nombres),
    paternalName: nullable(row.apellido_paterno),
    maternalName: nullable(row.apellido_materno),
    grado: nullable(row.grado),
    grupo: nullable(row.grupo),
    nivelEdu,
    campus,
    plantel: plantelCode,
    plantelCode,
    foto: nullable(row.foto),
    ciclo: nullable(row.ciclo),
    isCurrent: matricula === currentMatricula
  };
}
async function loadAttendanceStudentRows(user) {
  const currentMatricula = familyMatricula(user);
  const current = await legacyOne(
    `SELECT ${STUDENT_SELECT}
     FROM matricula m
     LEFT JOIN users u ON u.username = m.matricula
     WHERE m.matricula = ?
     LIMIT 1`,
    [currentMatricula]
  );
  if (!current) throw publicError(404, "No encontramos la matr\xEDcula vinculada a esta cuenta familiar.");
  if (!completeAttendanceParentFields(current)) return [current];
  const where = FAMILY_PARENT_FIELDS.map((field) => `m.${field} = ?`).join(" AND ");
  const parentValues = FAMILY_PARENT_FIELDS.map((field) => String(current[field] || "").trim());
  const siblings = await legacyQuery(
    `SELECT ${STUDENT_SELECT}
     FROM matricula m
     LEFT JOIN users u ON u.username = m.matricula
     WHERE ${where}
     ORDER BY (m.matricula = ?) DESC, m.apellido_paterno ASC, m.apellido_materno ASC, m.nombres ASC
     LIMIT 8`,
    [...parentValues, currentMatricula]
  );
  if (siblings.length > 6) return [current];
  if (!siblings.some((row) => normalizeMatricula(row.matricula) === currentMatricula)) return [current, ...siblings];
  return siblings;
}
async function getAttendanceChildrenForFamily(user) {
  const currentMatricula = familyMatricula(user);
  const rows = await loadAttendanceStudentRows(user);
  const children = rows.map((row) => attendanceChildFromRow(row, currentMatricula, user)).filter(Boolean);
  if (!children.length) {
    throw publicError(404, "No encontramos alumnos vinculados a esta cuenta familiar.");
  }
  return children;
}
async function resolveAttendanceChild(user, matricula) {
  const children = await getAttendanceChildrenForFamily(user);
  const requested = normalizeMatricula(matricula);
  const selected = requested ? children.find((child) => child.matricula === requested) : children.find((child) => child.isCurrent) || children[0];
  if (!selected) {
    throw publicError(403, "El alumno solicitado no pertenece a esta cuenta familiar.");
  }
  return { selected, children };
}
function sourceStatus(attendanceStatus, tardyStatus) {
  if (attendanceStatus === "ready" && tardyStatus === "ready") return "ready";
  if (attendanceStatus === "ready" || tardyStatus === "ready") return "partial";
  return "unavailable";
}
const PARENT_SIPAE_DEADLINE_MS = 2500;
function timedSource(promise, label) {
  let settled = false;
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve({ status: "rejected", reason: new Error(`${label} exceeded parent read deadline`) });
    }, PARENT_SIPAE_DEADLINE_MS);
    promise.then((value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ status: "fulfilled", value });
    }, (reason) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ status: "rejected", reason });
    });
  });
}
async function resolveAttendanceSource(child, plantelCode, range) {
  const dbResult = await fetchAttendanceDbFallback(child, range).then((value) => ({ status: "fulfilled", value }), (reason2) => ({ status: "rejected", reason: reason2 }));
  if (dbResult.status === "fulfilled") {
    return {
      absences: dbResult.value.absences,
      groupDates: dbResult.value.groupDates,
      status: "ready"
    };
  }
  const apiResult = await timedSource(fetchSipaeAttendanceDetail(plantelCode, range), "SIPAE attendance");
  if (apiResult.status === "fulfilled") {
    const apiAbsences = extractAbsences(apiResult.value, child);
    const apiGroupDates = extractGroupDates(apiResult.value, child);
    return {
      absences: apiAbsences,
      groupDates: apiGroupDates,
      status: "ready"
    };
  }
  const reason = apiResult.reason || dbResult.reason;
  return {
    absences: [],
    groupDates: /* @__PURE__ */ new Set(),
    status: sipaeErrorState(reason),
    message: sipaeErrorMessage(reason)
  };
}
async function resolveTardySource(child, plantelCode, range) {
  const dbResult = await fetchTardiesDbFallback(child, range).then((value) => ({ status: "fulfilled", value }), (reason2) => ({ status: "rejected", reason: reason2 }));
  if (dbResult.status === "fulfilled") {
    return {
      tardies: dbResult.value,
      status: "ready"
    };
  }
  const apiResult = await timedSource(fetchSipaeTardies(plantelCode, range), "SIPAE tardiness");
  if (apiResult.status === "fulfilled") {
    const apiTardies = extractTardies(apiResult.value, child);
    return {
      tardies: apiTardies,
      status: "ready"
    };
  }
  const reason = apiResult.reason || dbResult.reason;
  return {
    tardies: [],
    status: sipaeErrorState(reason),
    message: sipaeErrorMessage(reason)
  };
}
async function getParentAttendance(user, input) {
  const { selected, children } = await resolveAttendanceChild(user, input.matricula);
  const schoolYears = buildSchoolYearOptions(selected.ciclo);
  const selectedSchoolYear = resolveSchoolYearOption(input.schoolYear, schoolYears);
  const plantel = resolveSipaePlantel(selected.plantelCode);
  const grupoSigil = await resolveGrupoSigil(selected.grupo);
  const requestPlantel = plantel.canonicalCode || plantel.dbCode;
  const [attendanceSource, tardySource] = await Promise.all([
    resolveAttendanceSource(selected, requestPlantel, selectedSchoolYear),
    resolveTardySource(selected, requestPlantel, selectedSchoolYear)
  ]);
  const { getFamilyAccessHistory } = await Promise.resolve().then(function () { return accessHistory; });
  const accessHistory$1 = await getFamilyAccessHistory(user, {
    matricula: selected.matricula,
    startDate: selectedSchoolYear.startDate,
    endDate: selectedSchoolYear.endDate
  });
  const absences = attendanceSource.absences;
  const groupDates = attendanceSource.groupDates;
  const tardies = tardySource.tardies;
  const attendanceStatus = attendanceSource.status;
  const tardinessStatus = tardySource.status;
  const attendanceMessage = attendanceSource.status === "ready" ? void 0 : attendanceSource.message;
  const tardinessMessage = tardySource.status === "ready" ? void 0 : tardySource.message;
  const calendarDays = buildCalendarDays(groupDates, absences, tardies);
  const summary = summarize(calendarDays, absences, tardies);
  return {
    status: sourceStatus(attendanceStatus, tardinessStatus),
    selectedChild: selected,
    children,
    selectedSchoolYear,
    schoolYears: schoolYears.some((year) => year.label === selectedSchoolYear.label) ? schoolYears : [selectedSchoolYear, ...schoolYears].sort((a, b) => b.label.localeCompare(a.label)),
    grupoSigil,
    summary,
    absences,
    tardies,
    accessHistory: accessHistory$1,
    calendarDays,
    events: buildEvents(absences, tardies),
    source: {
      label: "SIPAE",
      attendance: attendanceStatus,
      tardiness: tardinessStatus,
      attendanceMessage,
      tardinessMessage
    }
  };
}
function dateInRange(date, range) {
  return date >= range.startDate && date <= range.endDate;
}
async function updateParentAbsenceMotivo(user, input) {
  const { selected } = await resolveAttendanceChild(user, input.matricula);
  const schoolYears = buildSchoolYearOptions(selected.ciclo);
  const selectedSchoolYear = resolveSchoolYearOption(input.schoolYear, schoolYears);
  const row = await attendanceOne(
    `SELECT id, fecha, name, grado, grupo, plantel, attendance, motivo
     FROM asistencia
     WHERE id = ?
     LIMIT 1`,
    [input.absenceId]
  );
  if (!row) throw publicError(404, "No encontramos la inasistencia solicitada.");
  const recordDate = dateOnly(row.fecha);
  if (!recordDate || !dateInRange(recordDate, selectedSchoolYear)) {
    throw publicError(403, "La inasistencia est\xE1 fuera del ciclo seleccionado.");
  }
  if (!dbAbsenceMatchesChild(selected, row)) {
    throw publicError(403, "La inasistencia no pertenece al alumno seleccionado.");
  }
  const motivo = input.motivo.trim();
  await attendanceWrite(
    `UPDATE asistencia
     SET motivo = ?
     WHERE id = ? AND attendance = 0`,
    [motivo, input.absenceId]
  );
  return {
    absence: {
      ...mapDbAbsence({ ...row, motivo }),
      date: recordDate
    }
  };
}

function normalizeVirtualAssetUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("/")) return value;
  return `https://admin.casitaiedis.edu.mx/virtual/${value.replace(/^\/?virtual\//, "")}`;
}

const VALIDATED_MARKER = "vision=marks-ok";
function isValidatedVisionPhotoUrl(value) {
  return String(value || "").includes(VALIDATED_MARKER);
}

const MAX_ADMIN_LIMIT = 1e3;
function clean$2(value) {
  return String(value || "").trim();
}
function compactName$1(...parts) {
  return parts.map(clean$2).filter(Boolean).join(" ");
}
function todayDate() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
function safeDate(value) {
  const raw = clean$2(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : "";
}
function resolveAccessHistoryRange(input = {}) {
  const today = todayDate();
  const defaultEnd = today;
  const defaultStart = addDays(/* @__PURE__ */ new Date(`${today}T12:00:00`), -30).toISOString().slice(0, 10);
  let startDate = safeDate(input.startDate) || defaultStart;
  let endDate = safeDate(input.endDate) || defaultEnd;
  if (startDate > endDate) [startDate, endDate] = [endDate, startDate];
  return { startDate, endDate };
}
function rangeStart(range) {
  return `${range.startDate} 00:00:00`;
}
function rangeEnd(range) {
  return `${range.endDate} 23:59:59`;
}
function timestampParts(value) {
  if (value instanceof Date) {
    const pad = (part) => String(part).padStart(2, "0");
    const date2 = `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
    const time2 = `${pad(value.getHours())}:${pad(value.getMinutes())}`;
    return { date: date2, time: time2, timestamp: `${date2} ${time2}` };
  }
  const raw = clean$2(value).replace("T", " ");
  const date = dateOnly(raw);
  const rawTime = raw.slice(11, 19);
  const time = formatAttendanceTime(rawTime);
  return { date, time, timestamp: raw || `${date} ${time}`.trim() };
}
function normalizeActionType(value) {
  const action = clean$2(value).toLowerCase();
  if (action.includes("entrada")) return "entrada";
  if (action.includes("salida")) return "salida";
  return null;
}
function personFromRow(row) {
  const name = compactName$1(row.nombreP, row.paternoP, row.maternoP) || `Persona ${row.personId || ""}`.trim();
  const originalPhoto = normalizeVirtualAssetUrl(row.fotoP || "");
  const processedPhoto = normalizeVirtualAssetUrl(row.compressedFotoP || "");
  return {
    id: Number(row.personId || 0),
    name,
    parentesco: clean$2(row.parenP) || null,
    indice: Number(row.indice || 0) || null,
    photoUrl: originalPhoto || (isValidatedVisionPhotoUrl(processedPhoto) ? processedPhoto : "")
  };
}
function studentFromRow(row, knownChild) {
  const matricula = normalizeMatricula(row.matricula || (knownChild == null ? void 0 : knownChild.matricula));
  const nivelEdu = clean$2(row.nivelEdu || row.apNivel || (knownChild == null ? void 0 : knownChild.nivelEdu)) || null;
  const plantel = deriveSipaePlantelFromStudent({
    matricula,
    nivelEdu,
    campus: row.campus || (knownChild == null ? void 0 : knownChild.campus) || null,
    plantel: (knownChild == null ? void 0 : knownChild.plantel) || null
  });
  const name = (knownChild == null ? void 0 : knownChild.name) || compactName$1(row.studentNombre || row.apNombre, row.studentPaterno || row.apPaterno, row.studentMaterno || row.apMaterno) || matricula;
  return {
    matricula,
    name,
    plantel,
    nivelEdu,
    grado: clean$2(row.grado || row.apGrado || (knownChild == null ? void 0 : knownChild.grado)) || null,
    grupo: clean$2(row.grupo || row.apGrupo || (knownChild == null ? void 0 : knownChild.grupo)) || null,
    foto: normalizeVirtualAssetUrl(row.studentFoto || row.apFoto || (knownChild == null ? void 0 : knownChild.foto) || "")
  };
}
function rowToAction(row) {
  const type = normalizeActionType(row.type);
  const person = personFromRow(row);
  const parts = timestampParts(row.timestamp);
  const student = studentFromRow(row);
  if (!type || !parts.date || !person.id || !student.matricula) return null;
  return {
    student,
    action: {
      id: Number(row.accessId),
      type,
      timestamp: parts.timestamp,
      date: parts.date,
      time: parts.time,
      person
    }
  };
}
function groupRows(rows, childByMatricula = /* @__PURE__ */ new Map()) {
  const groups = /* @__PURE__ */ new Map();
  const people = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const matricula = normalizeMatricula(row.matricula);
    const knownChild = childByMatricula.get(matricula);
    const mapped = rowToAction(row);
    if (!mapped) continue;
    const student = knownChild ? studentFromRow(row, knownChild) : mapped.student;
    const key = `${student.matricula}:${mapped.action.date}`;
    const day = groups.get(key) || {
      key,
      date: mapped.action.date,
      student,
      actions: [],
      entrada: null,
      salida: null,
      people: [],
      status: "solo-entrada"
    };
    const action = mapped.action;
    day.actions.push(action);
    people.set(action.person.id, action.person);
    groups.set(key, day);
  }
  for (const day of groups.values()) {
    day.actions.sort((a, b) => `${a.date} ${a.time} ${a.id}`.localeCompare(`${b.date} ${b.time} ${b.id}`));
    day.entrada = day.actions.find((action) => action.type === "entrada") || null;
    day.salida = [...day.actions].reverse().find((action) => action.type === "salida") || null;
    day.people = Array.from(new Map(day.actions.map((action) => [action.person.id, action.person])).values());
    day.status = day.entrada && day.salida ? "entrada-salida" : day.salida ? "solo-salida" : "solo-entrada";
  }
  const days = Array.from(groups.values()).sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare) return dateCompare;
    return a.student.name.localeCompare(b.student.name, "es");
  });
  const summary = {
    days: days.length,
    entries: days.reduce((total, day) => total + day.actions.filter((action) => action.type === "entrada").length, 0),
    exits: days.reduce((total, day) => total + day.actions.filter((action) => action.type === "salida").length, 0),
    uniquePeople: people.size,
    students: new Set(days.map((day) => day.student.matricula)).size
  };
  return {
    days,
    people: Array.from(people.values()).sort((a, b) => a.name.localeCompare(b.name, "es")),
    summary
  };
}
async function userIdsForMatriculas(matriculas) {
  if (!matriculas.length) return [];
  return legacyQuery(
    `SELECT id, UPPER(username) AS matricula
     FROM users
     WHERE UPPER(username) IN (${matriculas.map(() => "?").join(",")})`,
    matriculas
  );
}
async function queryAccessRows(input) {
  var _a;
  const where = [
    "A.timestamp BETWEEN ? AND ?",
    "LOWER(COALESCE(A.type, '')) IN ('entrada', 'salida')"
  ];
  const params = [rangeStart(input.range), rangeEnd(input.range)];
  if ((_a = input.userIds) == null ? void 0 : _a.length) {
    where.push(`P.user_id IN (${input.userIds.map(() => "?").join(",")})`);
    params.push(...input.userIds);
  }
  const search = clean$2(input.search);
  if (search) {
    where.push(`(
      UPPER(u.username) LIKE ?
      OR CONCAT_WS(' ', m.nombres, m.apellido_paterno, m.apellido_materno) LIKE ?
      OR CONCAT_WS(' ', AP.nombreA, AP.paternoA, AP.maternoA) LIKE ?
      OR CONCAT_WS(' ', P.nombreP, P.paternoP, P.maternoP) LIKE ?
    )`);
    const term = `%${search.toUpperCase()}%`;
    params.push(term, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  const limit = Math.min(Math.max(Number(input.limit || MAX_ADMIN_LIMIT), 1), MAX_ADMIN_LIMIT);
  return legacyQuery(
    `SELECT
       A.id AS accessId,
       A.timestamp,
       A.type,
       P.id AS personId,
       P.indice,
       P.paternoP,
       P.maternoP,
       P.nombreP,
       P.parenP,
       P.foto AS fotoP,
       P.compressed_foto AS compressedFotoP,
       u.id AS userId,
       UPPER(u.username) AS matricula,
       u.campus,
       m.nombres AS studentNombre,
       m.apellido_paterno AS studentPaterno,
       m.apellido_materno AS studentMaterno,
       m.nivel AS nivelEdu,
       m.grado,
       m.grupo,
       m.foto AS studentFoto,
       AP.nombreA AS apNombre,
       AP.paternoA AS apPaterno,
       AP.maternoA AS apMaterno,
       AP.nivelEdu AS apNivel,
       AP.grado AS apGrado,
       AP.grupo AS apGrupo,
       AP.foto AS apFoto
     FROM acceso A
     INNER JOIN personas_autorizadas P ON P.id = A.ss_id
     INNER JOIN users u ON u.id = P.user_id
     LEFT JOIN alumno_pa AP ON AP.user_id = u.id
     LEFT JOIN matricula m ON UPPER(m.matricula) = UPPER(u.username)
     WHERE ${where.join("\n       AND ")}
     ORDER BY A.timestamp DESC, A.id DESC
     LIMIT ${limit}`,
    params
  );
}
async function getFamilyAccessHistory(user, input = {}) {
  const range = resolveAccessHistoryRange(input);
  const { selected, children } = await resolveAttendanceChild(user, input.matricula);
  const childMatricula = normalizeMatricula(selected.matricula);
  const childByMatricula = new Map(children.map((child) => [normalizeMatricula(child.matricula), child]));
  const users = await userIdsForMatriculas([childMatricula]);
  if (!users.length) {
    return {
      scope: "family",
      range,
      selectedChild: selected,
      children,
      days: [],
      people: [],
      summary: { days: 0, entries: 0, exits: 0, uniquePeople: 0, students: 0 }
    };
  }
  const rows = await queryAccessRows({ range, userIds: users.map((row) => Number(row.id)), limit: MAX_ADMIN_LIMIT });
  const grouped = groupRows(rows, childByMatricula);
  return {
    scope: "family",
    range,
    selectedChild: selected,
    children,
    ...grouped
  };
}
async function getAdminAccessHistory(input = {}) {
  const range = resolveAccessHistoryRange(input);
  const filters = {
    plantel: normalizePlantel(input.plantel),
    search: clean$2(input.search),
    limit: Math.min(Math.max(Number(input.limit || 500), 25), MAX_ADMIN_LIMIT)
  };
  const rows = await queryAccessRows({ range, search: filters.search, limit: filters.limit });
  const grouped = groupRows(rows);
  const planteles = Array.from(new Set(grouped.days.map((day) => normalizePlantel(day.student.plantel)).filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"));
  const days = filters.plantel ? grouped.days.filter((day) => normalizePlantel(day.student.plantel) === filters.plantel) : grouped.days;
  const visiblePeople = /* @__PURE__ */ new Map();
  for (const day of days) for (const action of day.actions) visiblePeople.set(action.person.id, action.person);
  const summary = {
    days: days.length,
    entries: days.reduce((total, day) => total + day.actions.filter((action) => action.type === "entrada").length, 0),
    exits: days.reduce((total, day) => total + day.actions.filter((action) => action.type === "salida").length, 0),
    uniquePeople: visiblePeople.size,
    students: new Set(days.map((day) => day.student.matricula)).size
  };
  return {
    scope: "admin",
    range,
    filters,
    planteles,
    days,
    people: Array.from(visiblePeople.values()).sort((a, b) => a.name.localeCompare(b.name, "es")),
    summary
  };
}
function accessHistoryCsv(response) {
  var _a, _b, _c, _d;
  const rows = [
    ["Fecha", "Alumno", "Matr\xEDcula", "Plantel", "Grado", "Grupo", "Entrada", "Persona entrada", "Salida", "Persona salida", "Eventos"]
  ];
  for (const day of response.days) {
    rows.push([
      day.date,
      day.student.name,
      day.student.matricula,
      day.student.plantel || "",
      day.student.grado || "",
      day.student.grupo || "",
      ((_a = day.entrada) == null ? void 0 : _a.time) || "",
      ((_b = day.entrada) == null ? void 0 : _b.person.name) || "",
      ((_c = day.salida) == null ? void 0 : _c.time) || "",
      ((_d = day.salida) == null ? void 0 : _d.person.name) || "",
      day.actions.map((action) => `${action.type} ${action.time} ${action.person.name}`).join(" | ")
    ]);
  }
  return rows.map((row) => row.map((value) => {
    const text = String(value != null ? value : "");
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }).join(",")).join("\n");
}

const accessHistory = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  accessHistoryCsv: accessHistoryCsv,
  getAdminAccessHistory: getAdminAccessHistory,
  getFamilyAccessHistory: getFamilyAccessHistory,
  resolveAccessHistoryRange: resolveAccessHistoryRange
}, Symbol.toStringTag, { value: 'Module' }));

const cookieName = "hpc_session";
function base64url$1(input) {
  return Buffer.from(input).toString("base64url");
}
function sign$1(payload) {
  const secret = useRuntimeConfig().sessionSecret;
  return createHmac("sha256", secret).update(payload).digest("base64url");
}
function verify(payload, signature) {
  const expected = sign$1(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
function setAppSession(event, user) {
  const payload = base64url$1(JSON.stringify({ user, createdAt: Date.now() }));
  const signature = sign$1(payload);
  setCookie(event, cookieName, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}
function clearAppSession(event) {
  deleteCookie(event, cookieName, { path: "/" });
}
function getAppSession(event) {
  var _a;
  const raw = getCookie(event, cookieName);
  if (!raw) return { user: null, loggedin: false };
  const [payload, signature] = raw.split(".");
  if (!payload || !signature || !verify(payload, signature)) return { user: null, loggedin: false };
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!((_a = decoded.user) == null ? void 0 : _a.id) || !decoded.user.kind) return { user: null, loggedin: false };
    return { user: decoded.user, loggedin: true };
  } catch {
    return { user: null, loggedin: false };
  }
}
function requireSession(event, kind) {
  const session = getAppSession(event);
  if (!session.user || kind && session.user.kind !== kind) {
    throw publicError(401, "Sesi\xF3n no v\xE1lida");
  }
  return session.user;
}

const schema$A = z.object({
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  plantel: z.string().optional().default(""),
  search: z.string().optional().default(""),
  limit: z.coerce.number().int().min(25).max(1e3).optional().default(1e3)
});
const export_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  assertAccessHistoryAdmin(user);
  const response = await getAdminAccessHistory(schema$A.parse(getQuery$1(event)));
  const csv = accessHistoryCsv(response);
  setHeader(event, "Content-Type", "text/csv; charset=utf-8");
  setHeader(event, "Content-Disposition", `attachment; filename="historial-accesos-${response.range.startDate}-${response.range.endDate}.csv"`);
  return `\uFEFF${csv}`;
});

const export_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: export_get
}, Symbol.toStringTag, { value: 'Module' }));

const schema$z = z.object({
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  plantel: z.string().optional().default(""),
  search: z.string().optional().default(""),
  limit: z.coerce.number().int().min(25).max(1e3).optional().default(500)
});
const index_get$6 = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  assertAccessHistoryAdmin(user);
  return getAdminAccessHistory(schema$z.parse(getQuery$1(event)));
});

const index_get$7 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_get$6
}, Symbol.toStringTag, { value: 'Module' }));

function isServerlessRuntime() {
  return Boolean(process.env.VERCEL || process.env.NOW_REGION || process.env.AWS_LAMBDA_FUNCTION_NAME);
}
function runtimeDataDir(segment) {
  const baseDir = process.env.HUSKY_PASS_DATA_DIR || (isServerlessRuntime() ? join(tmpdir(), "husky-pass-crm") : join(process.cwd(), "data"));
  return join(baseDir, segment);
}

function logPersonasWarning(scope, context = {}, level = "warn") {
  logEvent(level, `personas-autorizadas:${scope}`, {
    scope,
    context
  });
}
function logPersonasDebug(scope, context = {}) {
  logPersonasWarning(scope, context, "debug");
}

const TEMPLATE_DIR = runtimeDataDir("marbete-templates");
const TEMPLATE_INDEX = join(TEMPLATE_DIR, "templates.json");
const VALID_THEME_KEYS = /* @__PURE__ */ new Set(["daycare", "preescolar", "primaria", "secundaria", "iedis"]);
function safeId(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}
function escapeXml$1(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function filenameFor(id) {
  return `${id || `template-${Date.now()}`}.svg`;
}
function normalizeTemplate(row) {
  if (!row.id || !row.filename) return null;
  if (!VALID_THEME_KEYS.has(row.themeKey)) return null;
  const themeKey = row.themeKey;
  const theme = resolvePersonasTheme({ themeKey });
  return {
    id: String(row.id),
    name: String(row.name || row.id),
    filename: String(row.filename),
    themeKey,
    nivel: String(row.nivel || ""),
    planteles: Array.isArray(row.planteles) ? row.planteles.map((item) => normalizePlantel(item)).filter(Boolean) : [],
    color: String(row.color || theme.primary),
    isDefault: Boolean(row.isDefault),
    createdAt: row.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: row.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function ensureTemplateDir() {
  await mkdir(TEMPLATE_DIR, { recursive: true });
}
async function writeTemplateIndex(templates) {
  await ensureTemplateDir();
  await writeFile(TEMPLATE_INDEX, `${JSON.stringify(templates, null, 2)}
`, "utf8");
}
async function readBundledTemplateIndex() {
  const raw = await useStorage("assets:marbete-templates").getItem("templates.json");
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") return JSON.parse(raw);
  return JSON.parse(JSON.stringify(raw));
}
async function readBundledTemplateSvg(filename) {
  const raw = await useStorage("assets:marbete-templates").getItem(filename);
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (raw instanceof Uint8Array) return new TextDecoder("utf-8").decode(raw);
  if (raw instanceof ArrayBuffer) return new TextDecoder("utf-8").decode(new Uint8Array(raw));
  return String(raw);
}
async function listMarbeteTemplates() {
  await ensureTemplateDir();
  try {
    const raw = await readFile(TEMPLATE_INDEX, "utf8");
    const parsed = JSON.parse(raw);
    return parsed.map(normalizeTemplate).filter(Boolean);
  } catch (error) {
    const parsed = await readBundledTemplateIndex();
    const templates = parsed.map(normalizeTemplate).filter(Boolean);
    if (!templates.length) {
      logPersonasWarning("marbete-template-index-missing", { message: error instanceof Error ? error.message : String(error) });
    }
    return templates;
  }
}
function marbeteTemplateThemes() {
  return allPersonasThemes().filter((theme) => VALID_THEME_KEYS.has(theme.key));
}
async function readMarbeteTemplateSvg(template) {
  let svg;
  try {
    svg = await readFile(join(TEMPLATE_DIR, template.filename), "utf8");
  } catch {
    svg = await readBundledTemplateSvg(template.filename);
  }
  if (!svg) throw publicError(404, `No se encontro la plantilla SVG ${template.filename}.`);
  if (!svg.includes("<svg")) throw publicError(422, "La plantilla SVG no es valida.");
  return svg;
}
function selectMarbeteTemplate(templates, input) {
  const theme = resolvePersonasTheme(input);
  const plantel = normalizePlantel(input.plantel);
  const nivel = normalizeNivel(input.nivelEdu);
  const byPlantel = templates.find((template) => template.planteles.includes(plantel));
  if (byPlantel) return byPlantel;
  const byThemeAndNivel = templates.find((template) => template.themeKey === theme.key && normalizeNivel(template.nivel) && nivel.includes(normalizeNivel(template.nivel)));
  if (byThemeAndNivel) return byThemeAndNivel;
  const byTheme = templates.find((template) => template.themeKey === theme.key);
  if (byTheme) return byTheme;
  throw publicError(422, `No hay una plantilla SVG compatible con nivel ${input.nivelEdu || "sin nivel"} y plantel ${input.plantel || "sin plantel"}.`);
}
async function saveMarbeteTemplate(input) {
  var _a, _b, _c, _d, _e, _f;
  if (!VALID_THEME_KEYS.has(input.themeKey)) {
    throw publicError(400, "Tema de plantilla invalido.");
  }
  const templates = await listMarbeteTemplates();
  const existingIndex = input.id ? templates.findIndex((template) => template.id === input.id) : -1;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const baseId = input.id || safeId(input.name || `${input.themeKey}-${input.nivel}`) || `template-${Date.now()}`;
  const existing = existingIndex >= 0 ? templates[existingIndex] : null;
  if (!existing && !((_b = (_a = input.file) == null ? void 0 : _a.data) == null ? void 0 : _b.length)) {
    throw publicError(400, "Agrega un archivo SVG para crear la plantilla.");
  }
  const filename = ((_d = (_c = input.file) == null ? void 0 : _c.data) == null ? void 0 : _d.length) ? filenameFor(`${safeId(baseId)}-${Date.now()}`) : (existing == null ? void 0 : existing.filename) || filenameFor(safeId(baseId));
  if ((_f = (_e = input.file) == null ? void 0 : _e.data) == null ? void 0 : _f.length) {
    const sourceName = String(input.file.filename || "");
    if (!sourceName.toLowerCase().endsWith(".svg")) throw publicError(415, "La plantilla debe ser SVG.");
    const text = input.file.data.toString("utf8");
    if (!text.includes("<svg")) throw publicError(422, "El archivo no parece ser una plantilla SVG valida.");
    await ensureTemplateDir();
    await writeFile(join(TEMPLATE_DIR, filename), input.file.data);
  }
  const theme = resolvePersonasTheme({ themeKey: input.themeKey });
  const next = {
    id: (existing == null ? void 0 : existing.id) || safeId(baseId),
    name: input.name.trim(),
    filename,
    themeKey: input.themeKey,
    nivel: input.nivel.trim(),
    planteles: input.planteles.map((item) => normalizePlantel(item)).filter(Boolean),
    color: theme.primary,
    isDefault: (existing == null ? void 0 : existing.isDefault) || false,
    createdAt: (existing == null ? void 0 : existing.createdAt) || now,
    updatedAt: now
  };
  if (existingIndex >= 0) templates.splice(existingIndex, 1, next);
  else templates.push(next);
  await writeTemplateIndex(templates);
  return next;
}
function absoluteAssetUrl(value, origin) {
  const normalized = normalizeVirtualAssetUrl(value);
  if (!normalized) return "";
  if (/^(?:https?:|data:)/i.test(normalized)) return normalized;
  if (normalized.startsWith("/")) return `${origin.replace(/\/$/, "")}${normalized}`;
  return normalized;
}
function fullName(parts) {
  return parts.map((part) => String(part || "").trim()).filter(Boolean).join(" ");
}
function currentSchoolYearLabel(date = /* @__PURE__ */ new Date()) {
  const year = date.getMonth() >= 7 ? date.getFullYear() : date.getFullYear() - 1;
  return `${year}-${year + 1}`;
}
function normalizeDynamicPhotoFrames(svg) {
  return svg.replace(/<image\b([^>]*\{\{\s*getTrustedUrl\(data\.(?:foto|fotoP|compressed_foto|studentPhoto|fotoA)\)\s*\}\}[^>]*?)(\s*\/?)>/g, (_match, attrs, close) => {
    let nextAttrs = attrs.replace(/\s*\/\s*$/, "");
    if (/\spreserveAspectRatio=/i.test(nextAttrs)) {
      nextAttrs = nextAttrs.replace(/\spreserveAspectRatio=(["'])[^"']*\1/i, ' preserveAspectRatio="xMidYMid slice"');
    } else {
      nextAttrs += ' preserveAspectRatio="xMidYMid slice"';
    }
    if (/\soverflow=/i.test(nextAttrs)) {
      nextAttrs = nextAttrs.replace(/\soverflow=(["'])[^"']*\1/i, ' overflow="hidden"');
    } else {
      nextAttrs += ' overflow="hidden"';
    }
    return `<image${nextAttrs}${close.includes("/") ? "/>" : ">"}`;
  });
}
function buildMarbeteRenderValues(data, origin) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const validationUrl = `${origin.replace(/\/$/, "")}/validar/persona-autorizada/${data.id}`;
  const trustedProcessedPhoto = isValidatedVisionPhotoUrl(data.compressed_foto) ? data.compressed_foto : "";
  const personPhoto = absoluteAssetUrl(String(trustedProcessedPhoto || data.foto || ""), origin);
  const studentPhoto = absoluteAssetUrl(String(data.fotoA || ((_a = data.child) == null ? void 0 : _a.foto) || ""), origin);
  const studentName = fullName([
    data.fullnameA || ""
  ]) || fullName([(_b = data.child) == null ? void 0 : _b.nombreA, (_c = data.child) == null ? void 0 : _c.paternoA, (_d = data.child) == null ? void 0 : _d.maternoA]);
  const authorizedName = fullName([data.nombreP, data.paternoP, data.maternoP]);
  const plantel = String(data.plantel || ((_e = data.child) == null ? void 0 : _e.plantel) || "");
  const nivel = String(data.nivelEdu || ((_f = data.child) == null ? void 0 : _f.nivelEdu) || "");
  const grado = String(data.gradoA || ((_g = data.child) == null ? void 0 : _g.grado) || "");
  const grupo = String(data.grupoA || ((_h = data.child) == null ? void 0 : _h.grupo) || "");
  const matricula = displayMatricula(data.matricula || ((_i = data.child) == null ? void 0 : _i.matricula));
  const validityLabel = String(data.fechaP || "").trim() ? `Vigente desde ${String(data.fechaP).slice(0, 10)}` : `Vigente ciclo ${currentSchoolYearLabel()}`;
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(validationUrl)}`;
  return {
    validationUrl,
    values: {
      id: String(data.id || ""),
      qr: String(data.qr || data.id || ""),
      paternoP: String(data.paternoP || ""),
      maternoP: String(data.maternoP || ""),
      nombreP: String(data.nombreP || ""),
      parenP: String(data.parenP || ""),
      parentesco: String(data.parenP || ""),
      fullnameP: authorizedName,
      nombreCompletoP: authorizedName,
      authorizedPersonName: authorizedName,
      foto: personPhoto,
      fotoP: personPhoto,
      compressed_foto: personPhoto,
      qrImage,
      nivelEdu: nivel,
      nivel,
      plantel,
      matricula,
      fullnameA: studentName,
      nombreAlumno: studentName,
      studentName,
      alumno: studentName,
      gradoA: grado,
      grado,
      grupoA: grupo,
      grupo,
      validityLabel,
      vigencia: validityLabel,
      ciclo: currentSchoolYearLabel(),
      fotoA: studentPhoto,
      studentPhoto,
      validationUrl
    }
  };
}
function dataTokens(svg) {
  return Array.from(svg.matchAll(/{{\s*data\.([A-Za-z0-9_]+)\s*}}/g)).map((match) => match[1]);
}
function imageTokens(svg) {
  return Array.from(svg.matchAll(/{{\s*getTrustedUrl\(data\.([A-Za-z0-9_]+)\)\s*}}/g)).map((match) => match[1]);
}
function unique$1(values) {
  return Array.from(new Set(values.filter(Boolean)));
}
function missingLabelFor(key) {
  if (["foto", "fotoP", "compressed_foto"].includes(key)) return "Foto de la persona autorizada pendiente o no disponible.";
  if (["fotoA", "studentPhoto"].includes(key)) return "Foto del alumno pendiente o no disponible.";
  if (key === "qrImage") return "C\xF3digo QR no disponible.";
  if (["matricula"].includes(key)) return "Matr\xEDcula del alumno no disponible.";
  if (["plantel"].includes(key)) return "Plantel del alumno no disponible.";
  if (["nivel", "nivelEdu"].includes(key)) return "Nivel del alumno no disponible.";
  if (["grado", "gradoA"].includes(key)) return "Grado del alumno no disponible.";
  if (["grupo", "grupoA"].includes(key)) return "Grupo del alumno no disponible.";
  if (["validityLabel", "vigencia", "ciclo"].includes(key)) return "Vigencia del Husky Pass no disponible.";
  if (["fullnameA", "nombreAlumno", "studentName", "alumno"].includes(key)) return "Nombre del alumno no disponible.";
  if (["fullnameP", "nombreCompletoP", "authorizedPersonName", "nombreP"].includes(key)) return "Nombre de la persona autorizada no disponible.";
  if (["parenP", "parentesco"].includes(key)) return "Parentesco de la persona autorizada no disponible.";
  return `Dato requerido no disponible: ${key}.`;
}
function validateMarbeteRequirements(svg, data, origin) {
  const { values } = buildMarbeteRenderValues(data, origin);
  const optionalTokens = /* @__PURE__ */ new Set(["maternoP", "fechaP", "id", "qr", "validationUrl"]);
  const requiredTokens = unique$1([...dataTokens(svg).filter((key) => !optionalTokens.has(key)), ...imageTokens(svg)]);
  const issues = requiredTokens.filter((key) => !String(values[key] || "").trim()).map(missingLabelFor);
  if (!String(values.fullnameP || "").trim()) issues.push(missingLabelFor("fullnameP"));
  if (!String(values.parenP || "").trim()) issues.push(missingLabelFor("parenP"));
  if (!String(values.fotoP || values.foto || "").trim()) issues.push(missingLabelFor("fotoP"));
  return { ok: !unique$1(issues).length, issues: unique$1(issues) };
}
function renderMarbeteSvg(svg, data, origin) {
  const { values } = buildMarbeteRenderValues(data, origin);
  return normalizeDynamicPhotoFrames(svg).replace(/{{\s*getTrustedUrl\(data\.([A-Za-z0-9_]+)\)\s*}}/g, (_match, key) => escapeXml$1(values[key])).replace(/{{\s*data\.([A-Za-z0-9_]+)\s*}}/g, (_match, key) => escapeXml$1(values[key])).replace(/{{\s*[^}]+\s*}}/g, "");
}
function marbeteDownloadName(data, template) {
  const name = [data.nombreP, data.paternoP, data.maternoP].filter(Boolean).join(" ") || `persona-${data.id}`;
  return `${safeId(`marbete-${template.themeKey}-${name}`) || `marbete-${data.id}`}.pdf`;
}

const _id__get$2 = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  if (!isSuperAdmin(user)) throw publicError(403, "Solo superadmin puede ver plantillas.");
  const id = String(getRouterParam(event, "id") || "");
  const template = (await listMarbeteTemplates()).find((item) => item.id === id);
  if (!template) throw publicError(404, "Plantilla no encontrada.");
  setHeader(event, "Content-Type", "image/svg+xml; charset=utf-8");
  setHeader(event, "Cache-Control", "private, no-store");
  return readMarbeteTemplateSvg(template);
});

const _id__get$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__get$2
}, Symbol.toStringTag, { value: 'Module' }));

const index_get$4 = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  if (!isSuperAdmin(user)) throw publicError(403, "Solo superadmin puede gestionar plantillas.");
  return {
    templates: await listMarbeteTemplates(),
    themes: marbeteTemplateThemes()
  };
});

const index_get$5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_get$4
}, Symbol.toStringTag, { value: 'Module' }));

const schema$y = z.object({
  id: z.string().optional().nullable(),
  name: z.string().trim().min(1),
  nivel: z.string().trim().min(1),
  planteles: z.string().optional().default(""),
  themeKey: z.enum(["daycare", "preescolar", "primaria", "secundaria", "iedis"])
});
function field$1(parts, name) {
  var _a, _b;
  return ((_b = (_a = parts.find((part) => part.name === name)) == null ? void 0 : _a.data) == null ? void 0 : _b.toString("utf8")) || "";
}
const index_post$2 = defineEventHandler(async (event) => {
  var _a;
  const user = requireSession(event, "admin");
  if (!isSuperAdmin(user)) throw publicError(403, "Solo superadmin puede gestionar plantillas.");
  const parts = await readMultipartFormData(event);
  if (!(parts == null ? void 0 : parts.length)) throw publicError(400, "Formulario de plantilla vacio.");
  const body = schema$y.parse({
    id: field$1(parts, "id") || null,
    name: field$1(parts, "name"),
    nivel: field$1(parts, "nivel"),
    planteles: field$1(parts, "planteles"),
    themeKey: field$1(parts, "themeKey")
  });
  const filePart = parts.find((part) => {
    var _a2;
    return part.name === "file" && ((_a2 = part.data) == null ? void 0 : _a2.length);
  });
  const planteles = body.planteles.split(",").map((item) => item.trim()).filter(Boolean);
  return saveMarbeteTemplate({
    id: body.id,
    name: body.name,
    nivel: body.nivel,
    planteles,
    themeKey: body.themeKey,
    file: ((_a = filePart == null ? void 0 : filePart.data) == null ? void 0 : _a.length) ? { filename: filePart.filename, data: filePart.data } : void 0
  });
});

const index_post$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_post$2
}, Symbol.toStringTag, { value: 'Module' }));

var survey = {
	enabled: false,
	title: "Encuesta Personas Autorizadas",
	embedUrl: "",
	updatedAt: "2026-06-04T17:40:18.705Z",
	updatedBy: "desarrollo.tecnologico@casitaiedis.edu.mx"
};
var conveniosUrl = "";
var helpUrl = "";
var updatedAt = "2026-06-04T17:40:18.705Z";
var updatedBy = "desarrollo.tecnologico@casitaiedis.edu.mx";
const bundledConfig = {
	survey: survey,
	conveniosUrl: conveniosUrl,
	helpUrl: helpUrl,
	updatedAt: updatedAt,
	updatedBy: updatedBy
};

const bundledAccessActions = [
	{
		userId: 3589116,
		login: "CM1138",
		contact: "CM1138",
		passwordAvailable: true,
		preparedBy: "desarrollo.tecnologico@casitaiedis.edu.mx",
		createdAt: "2026-06-04T17:40:12.526Z"
	}
];

const CONFIG_DIR = runtimeDataDir("personas-autorizadas");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");
const ACCESS_ACTION_PATH = join(CONFIG_DIR, "access-actions.json");
const SURVEY_NIVEL_OPTIONS = [
  { key: "escolar", label: "Escolar sin nivel resuelto" },
  { key: "preescolar", label: "Preescolar" },
  { key: "primaria", label: "Primaria" },
  { key: "secundaria", label: "Secundaria" },
  { key: "daycare", label: "Guarder\xEDa" }
];
function defaultSurvey(title = "Encuesta Personas Autorizadas") {
  return {
    enabled: false,
    title,
    embedUrl: "",
    updatedAt: "",
    updatedBy: null
  };
}
const defaultConfig = {
  survey: defaultSurvey(),
  surveysByNivel: {
    escolar: defaultSurvey("Encuesta Escolar"),
    preescolar: defaultSurvey("Encuesta Preescolar"),
    primaria: defaultSurvey("Encuesta Primaria"),
    secundaria: defaultSurvey("Encuesta Secundaria"),
    daycare: defaultSurvey("Encuesta Guarder\xEDa")
  },
  conveniosUrl: "",
  helpUrl: "",
  updatedAt: "",
  updatedBy: null
};
async function ensureDir() {
  await mkdir(CONFIG_DIR, { recursive: true });
}
function normalizeUrl(value) {
  return String(value || "").trim();
}
function normalizeSurvey(value, fallbackTitle = "Encuesta Personas Autorizadas") {
  return {
    enabled: Boolean(value == null ? void 0 : value.enabled),
    title: String((value == null ? void 0 : value.title) || fallbackTitle).trim() || fallbackTitle,
    embedUrl: normalizeGoogleFormEmbedUrl(value == null ? void 0 : value.embedUrl),
    updatedAt: (value == null ? void 0 : value.updatedAt) || "",
    updatedBy: (value == null ? void 0 : value.updatedBy) || null
  };
}
function normalizeSurveysByNivel(value) {
  var _a;
  const next = {};
  for (const option of SURVEY_NIVEL_OPTIONS) {
    const fallback = (_a = defaultConfig.surveysByNivel) == null ? void 0 : _a[option.key];
    next[option.key] = normalizeSurvey((value == null ? void 0 : value[option.key]) || fallback, (fallback == null ? void 0 : fallback.title) || `Encuesta ${option.label}`);
  }
  return next;
}
function normalizeGoogleFormEmbedUrl(value) {
  const url = normalizeUrl(value);
  if (!url) return "";
  if (!/^https:\/\/docs\.google\.com\/forms\//i.test(url)) return url;
  const withoutQuery = url.split("?")[0];
  return `${withoutQuery}?embedded=true`;
}
async function readPersonasConfig() {
  await ensureDir();
  try {
    const raw = await readFile(CONFIG_PATH, "utf8");
    const parsed = JSON.parse(raw);
    const legacySurvey = normalizeSurvey(parsed.survey, defaultConfig.survey.title);
    return {
      ...defaultConfig,
      ...parsed,
      survey: legacySurvey,
      surveysByNivel: normalizeSurveysByNivel(parsed.surveysByNivel),
      conveniosUrl: normalizeUrl(parsed.conveniosUrl),
      helpUrl: normalizeUrl(parsed.helpUrl)
    };
  } catch (error) {
    const parsed = bundledConfig;
    if (!parsed || typeof parsed !== "object") {
      logPersonasWarning("config-bundled-default-missing", { message: error instanceof Error ? error.message : String(error) });
      return defaultConfig;
    }
    const legacySurvey = normalizeSurvey(parsed.survey, defaultConfig.survey.title);
    return {
      ...defaultConfig,
      ...parsed,
      survey: legacySurvey,
      surveysByNivel: normalizeSurveysByNivel(parsed.surveysByNivel),
      conveniosUrl: normalizeUrl(parsed.conveniosUrl),
      helpUrl: normalizeUrl(parsed.helpUrl)
    };
  }
}
async function writePersonasConfig(config) {
  await ensureDir();
  await writeFile(CONFIG_PATH, `${JSON.stringify(config, null, 2)}
`, "utf8");
  return config;
}
async function savePersonasConfig(input) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const existing = await readPersonasConfig();
  const legacySurvey = normalizeSurvey({
    enabled: input.surveyEnabled,
    title: input.surveyTitle,
    embedUrl: input.surveyEmbedUrl,
    updatedAt: now,
    updatedBy: input.updatedBy || null
  });
  const surveysByNivel = input.surveysByNivel ? normalizeSurveysByNivel(Object.fromEntries(Object.entries(input.surveysByNivel).map(([key, survey]) => [key, {
    ...survey,
    updatedAt: now,
    updatedBy: input.updatedBy || null
  }]))) : normalizeSurveysByNivel(existing.surveysByNivel);
  const config = {
    survey: legacySurvey,
    surveysByNivel,
    conveniosUrl: normalizeUrl(input.conveniosUrl),
    helpUrl: normalizeUrl(input.helpUrl),
    updatedAt: now,
    updatedBy: input.updatedBy || null
  };
  return writePersonasConfig(config);
}
function surveyNivelFromStudent(input) {
  const key = resolvePersonasTheme(input).key;
  if (key === "daycare") return "daycare";
  if (key === "preescolar" || key === "primaria" || key === "secundaria") return key;
  return "escolar";
}
function resolveSurveyForStudent(config, input) {
  const nivelKey = surveyNivelFromStudent(input);
  const byNivel = normalizeSurveysByNivel(config.surveysByNivel);
  const survey = byNivel[nivelKey] || defaultSurvey();
  return {
    activeSurveyNivel: nivelKey,
    activeSurvey: survey
  };
}
async function appendAccessActionLog(entry) {
  await ensureDir();
  let rows;
  try {
    rows = JSON.parse(await readFile(ACCESS_ACTION_PATH, "utf8"));
  } catch {
    rows = Array.isArray(bundledAccessActions) ? bundledAccessActions : [];
  }
  rows.unshift({ ...entry, createdAt: (/* @__PURE__ */ new Date()).toISOString() });
  await writeFile(ACCESS_ACTION_PATH, `${JSON.stringify(rows.slice(0, 500), null, 2)}
`, "utf8");
}
async function readLastAccessActions() {
  await ensureDir();
  try {
    const rows = JSON.parse(await readFile(ACCESS_ACTION_PATH, "utf8"));
    const map = /* @__PURE__ */ new Map();
    for (const row of rows) {
      const userId = Number(row.userId);
      if (Number.isFinite(userId) && row.createdAt && !map.has(userId)) map.set(userId, row.createdAt);
    }
    return map;
  } catch {
    return /* @__PURE__ */ new Map();
  }
}

function clean$1(value) {
  return String(value || "").trim();
}
function compactName(...parts) {
  return parts.map(clean$1).filter(Boolean).join(" ");
}
function derivedPlantel(row) {
  const explicit = clean$1(row.plantel);
  if (explicit) return normalizePlantel(explicit);
  const username = normalizeMatricula(row.username);
  if (username.startsWith("PREEM")) return "PREEM";
  if (username.startsWith("PREET")) return "PREET";
  if (username.startsWith("PM")) return "PM";
  if (username.startsWith("PT")) return "PT";
  if (username.startsWith("SM")) return "SM";
  if (username.startsWith("ST")) return "ST";
  if (username.startsWith("DM")) return "CM";
  return normalizePlantel(username.slice(0, 2) || row.campus || row.empresa || row.unidad);
}
function issue(key, label) {
  return { key, label };
}
function unavailableTemplateMessage(error) {
  return error instanceof Error && error.message ? error.message : "Marbete no disponible";
}
function selectTemplateOrIssue(templates, input) {
  try {
    return { template: selectMarbeteTemplate(templates, input), templateIssue: "" };
  } catch (error) {
    return { template: null, templateIssue: unavailableTemplateMessage(error) };
  }
}
async function getPersonasReadiness(filters = {}) {
  const queryLimit = Math.min(Math.max(Number(filters.limit || 120), 25), 400);
  const rows = await legacyQuery(
    `SELECT
      u.id AS userId,
      u.email,
      u.username,
      u.plaintext,
      u.displayName,
      NULL AS plantel,
      u.campus,
      u.empresa,
      u.unidad,
      u.sala,
      u.nombre_nino,
      u.role,
      ap.id AS childId,
      ap.paternoA,
      ap.maternoA,
      ap.nombreA,
      ap.grupo,
      ap.grado,
      ap.nivelEdu,
      ap.campus AS childCampus,
      m.nombres AS matriculaNombre,
      m.apellido_paterno AS matriculaPaterno,
      m.apellido_materno AS matriculaMaterno,
      m.nivel AS matriculaNivel,
      m.grado AS matriculaGrado,
      m.grupo AS matriculaGrupo,
      COALESCE(pa.authorizedCount, 0) AS authorizedCount,
      COALESCE(pa.authorizedPhotoCount, 0) AS authorizedPhotoCount,
      c.id AS credentialId,
      c.foto AS credentialFoto
     FROM users u
     LEFT JOIN (
       SELECT MIN(id) AS childId, user_id
       FROM alumno_pa
       WHERE user_id IS NOT NULL
       GROUP BY user_id
     ) first_ap ON first_ap.user_id = u.id
     LEFT JOIN alumno_pa ap ON ap.id = first_ap.childId
     LEFT JOIN matricula m ON m.matricula = u.username
     LEFT JOIN (
       SELECT
         user_id,
         COUNT(*) AS authorizedCount,
         SUM(CASE WHEN COALESCE(foto, '') <> '' OR COALESCE(compressed_foto, '') LIKE '%vision=marks-ok%' THEN 1 ELSE 0 END) AS authorizedPhotoCount
       FROM personas_autorizadas
       WHERE user_id IS NOT NULL
       GROUP BY user_id
     ) pa ON pa.user_id = u.id
     LEFT JOIN credenciales c ON c.matricula = u.username
     WHERE
       u.id IN (SELECT DISTINCT user_id FROM alumno_pa WHERE user_id IS NOT NULL)
       OR u.id IN (SELECT DISTINCT user_id FROM personas_autorizadas WHERE user_id IS NOT NULL)
       OR EXISTS (
         SELECT 1
         FROM rutas_rol rr
         WHERE FIND_IN_SET(rr.role, REPLACE(COALESCE(u.role, ''), ' ', '')) > 0
           AND rr.route REGEXP 'personas[_/-]?autorizadas|persona[-_]?autorizada|credencial|validar'
       )
     ORDER BY COALESCE(NULLIF(u.campus, ''), u.empresa, '') ASC, u.id DESC
     LIMIT ${queryLimit}`
  );
  const templates = await listMarbeteTemplates();
  const lastAccessActions = await readLastAccessActions();
  const mapped = rows.map((row) => {
    const studentName = compactName(row.matriculaNombre || row.nombreA, row.matriculaPaterno || row.paternoA, row.matriculaMaterno || row.maternoA);
    const nivel = clean$1(row.matriculaNivel || row.nivelEdu);
    const grado = clean$1(row.matriculaGrado || row.grado);
    const grupo = clean$1(row.matriculaGrupo || row.grupo);
    const plantel = derivedPlantel(row);
    const matricula = normalizeMatricula(row.username);
    const theme = resolvePersonasTheme({ matricula, plantel, nivelEdu: nivel, campus: row.childCampus || row.campus });
    const { template, templateIssue } = selectTemplateOrIssue(templates, { matricula, plantel, nivelEdu: nivel, themeKey: theme.key });
    const hasStudentData = Boolean(studentName && nivel && grado && grupo && matricula);
    const hasParentAccess = Boolean(clean$1(row.email) || clean$1(row.username));
    const authorizedCount = Number(row.authorizedCount || 0);
    const authorizedPhotoCount = Number(row.authorizedPhotoCount || 0);
    const missingRegisteredPhotos = authorizedCount > 0 && authorizedPhotoCount < authorizedCount;
    const hasPrintableReadiness = Boolean(template && hasStudentData && authorizedCount > 0 && !missingRegisteredPhotos);
    const issues = [];
    if (authorizedCount <= 0) issues.push(issue("missingAuthorizedPeople", "Sin personas autorizadas"));
    if (!hasStudentData) issues.push(issue("missingRequiredStudentData", "Datos de alumno incompletos"));
    if (!hasPrintableReadiness) {
      issues.push(issue("missingPrintableReadiness", missingRegisteredPhotos ? "Foto pendiente en persona registrada" : templateIssue || "Marbete no disponible"));
    }
    const rowOut = {
      userId: Number(row.userId),
      displayName: clean$1(row.displayName) || studentName || clean$1(row.nombre_nino) || matricula || `Familia ${row.userId}`,
      email: clean$1(row.email) || null,
      username: matricula || clean$1(row.username) || null,
      contact: clean$1(row.email) || matricula || null,
      plantel,
      nivel: nivel || "Sin nivel",
      grado: grado || null,
      grupo: grupo || null,
      studentName: studentName || clean$1(row.nombre_nino) || "Alumno pendiente",
      familyLabel: clean$1(row.nombre_nino) || studentName || clean$1(row.displayName) || matricula || `Familia ${row.userId}`,
      authorizedCount,
      hasStudentData,
      hasPrintableReadiness,
      hasParentAccess,
      status: issues.length ? "incomplete" : "complete",
      issues,
      templateId: (template == null ? void 0 : template.id) || null,
      templateName: (template == null ? void 0 : template.name) || null,
      theme,
      lastAccessActionAt: lastAccessActions.get(Number(row.userId)) || null
    };
    return rowOut;
  });
  const plantelFilter = clean$1(filters.plantel).toUpperCase();
  const nivelFilter = clean$1(filters.nivel).toLowerCase();
  const statusFilter = clean$1(filters.status);
  const search = clean$1(filters.search).toLowerCase();
  const filtered = mapped.filter((row) => {
    if (plantelFilter && row.plantel !== plantelFilter) return false;
    if (nivelFilter && !row.nivel.toLowerCase().includes(nivelFilter)) return false;
    if (statusFilter && statusFilter !== "all" && row.status !== statusFilter && !row.issues.some((item) => item.key === statusFilter)) return false;
    if (search) {
      const haystack = [row.displayName, row.email, row.username, row.studentName, row.familyLabel, row.plantel, row.nivel, row.grupo].join(" ").toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
  const planteles = Array.from(new Set(mapped.map((row) => row.plantel).filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"));
  const niveles = Array.from(new Set(mapped.map((row) => row.nivel).filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"));
  return {
    rows: filtered,
    planteles,
    niveles,
    metrics: {
      total: filtered.length,
      complete: filtered.filter((row) => row.status === "complete").length,
      incomplete: filtered.filter((row) => row.status === "incomplete").length,
      blocked: filtered.filter((row) => row.status === "blocked").length,
      missingAuthorizedPeople: filtered.filter((row) => row.issues.some((item) => item.key === "missingAuthorizedPeople")).length,
      missingRequiredStudentData: filtered.filter((row) => row.issues.some((item) => item.key === "missingRequiredStudentData")).length,
      missingPrintableReadiness: filtered.filter((row) => row.issues.some((item) => item.key === "missingPrintableReadiness")).length,
      missingParentAccess: filtered.filter((row) => row.issues.some((item) => item.key === "missingParentAccess")).length
    },
    filters: {
      plantel: plantelFilter,
      nivel: filters.nivel || "",
      status: statusFilter || "all",
      search: filters.search || "",
      limit: queryLimit
    }
  };
}
async function getPersonasAccessUser(userId) {
  return legacyOne(
    `SELECT id, email, username, plaintext, displayName, nombre_nino
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );
}
function passSearchSelect(where) {
  return `SELECT
      p.id AS personId,
      p.indice,
      CAST(p.id AS CHAR) AS qr,
      p.paternoP,
      p.maternoP,
      p.nombreP,
      p.parenP,
      p.foto,
      p.compressed_foto,
      p.fechaP,
      u.id AS userId,
      u.email,
      u.username,
      u.displayName,
      u.nombre_nino,
      u.campus,
      u.empresa,
      u.unidad,
      NULL AS plantel,
      ap.id AS childId,
      ap.paternoA,
      ap.maternoA,
      ap.nombreA,
      ap.grupo,
      ap.grado,
      ap.nivelEdu,
      ap.campus AS childCampus,
      m.nombres AS matriculaNombre,
      m.apellido_paterno AS matriculaPaterno,
      m.apellido_materno AS matriculaMaterno,
      m.nivel AS matriculaNivel,
      m.grado AS matriculaGrado,
      m.grupo AS matriculaGrupo,
      m.foto AS matriculaFoto,
      c.foto AS credentialFoto
    FROM personas_autorizadas p
    INNER JOIN users u ON u.id = p.user_id
    LEFT JOIN (
      SELECT MIN(id) AS childId, user_id
      FROM alumno_pa
      WHERE user_id IS NOT NULL
      GROUP BY user_id
    ) first_ap ON first_ap.user_id = u.id
    LEFT JOIN alumno_pa ap ON ap.id = first_ap.childId
    LEFT JOIN matricula m ON UPPER(m.matricula) = UPPER(u.username)
    LEFT JOIN credenciales c ON UPPER(c.matricula) = UPPER(u.username)
    ${where}`;
}
function adminPassPrintable(row) {
  const matricula = normalizeMatricula(row.username);
  const plantel = derivedPlantel(row);
  const studentName = compactName(row.matriculaNombre || row.nombreA, row.matriculaPaterno || row.paternoA, row.matriculaMaterno || row.maternoA);
  const nivel = clean$1(row.matriculaNivel || row.nivelEdu);
  const grado = clean$1(row.matriculaGrado || row.grado);
  const grupo = clean$1(row.matriculaGrupo || row.grupo);
  const studentPhoto = clean$1(row.credentialFoto || row.matriculaFoto);
  return {
    id: Number(row.personId),
    indice: Number(row.indice || 1),
    qr: clean$1(row.qr || row.personId),
    paternoP: clean$1(row.paternoP),
    maternoP: clean$1(row.maternoP),
    nombreP: clean$1(row.nombreP),
    parenP: clean$1(row.parenP),
    foto: clean$1(row.foto),
    compressed_foto: clean$1(row.compressed_foto),
    fechaP: clean$1(row.fechaP),
    user_id: Number(row.userId),
    nivelEdu: nivel,
    plantel,
    matricula,
    fullnameA: studentName,
    fotoA: studentPhoto,
    gradoA: grado,
    grupoA: grupo,
    child: {
      id: row.childId ? Number(row.childId) : Number(row.userId),
      paternoA: clean$1(row.matriculaPaterno || row.paternoA),
      maternoA: clean$1(row.matriculaMaterno || row.maternoA),
      nombreA: clean$1(row.matriculaNombre || row.nombreA),
      grupo,
      grado,
      nivelEdu: nivel,
      campus: clean$1(row.childCampus || row.campus),
      plantel,
      matricula,
      foto: studentPhoto,
      user_id: Number(row.userId),
      isCurrent: true
    }
  };
}
async function getSuperAdminPrintableAuthorizedPersona(personId) {
  const rows = await legacyQuery(
    `${passSearchSelect("WHERE p.id = ?")}
     LIMIT 1`,
    [personId]
  );
  if (!rows.length) return null;
  return adminPassPrintable(rows[0]);
}
async function searchSuperAdminPassCandidates(filters, origin) {
  const queryLimit = Math.min(Math.max(Number(filters.limit || 80), 10), 200);
  const search = clean$1(filters.search).toLowerCase();
  const params = [];
  let searchWhere = "";
  if (search) {
    const like = `%${search}%`;
    searchWhere = `AND (
      LOWER(CONCAT_WS(' ', p.nombreP, p.paternoP, p.maternoP, p.parenP)) LIKE ?
      OR LOWER(CONCAT_WS(' ', m.nombres, m.apellido_paterno, m.apellido_materno, ap.nombreA, ap.paternoA, ap.maternoA, u.nombre_nino, u.displayName)) LIKE ?
      OR LOWER(COALESCE(u.email, '')) LIKE ?
      OR LOWER(COALESCE(u.username, '')) LIKE ?
      OR LOWER(CAST(p.id AS CHAR)) LIKE ?
    )`;
    params.push(like, like, like, like, like);
  }
  const rows = await legacyQuery(
    `${passSearchSelect(`WHERE p.user_id IS NOT NULL ${searchWhere}`)}
     ORDER BY p.id DESC
     LIMIT ${queryLimit}`,
    params
  );
  const templates = await listMarbeteTemplates();
  const mapped = await Promise.all(rows.map(async (row) => {
    const printable = adminPassPrintable(row);
    const theme = resolvePersonasTheme({
      matricula: printable.matricula,
      plantel: printable.plantel,
      nivelEdu: printable.nivelEdu,
      campus: row.childCampus || row.campus
    });
    const { template, templateIssue } = selectTemplateOrIssue(templates, {
      matricula: printable.matricula,
      plantel: printable.plantel,
      nivelEdu: printable.nivelEdu,
      themeKey: theme.key
    });
    let readiness = { ok: false, issues: [templateIssue || "Plantilla de Husky Pass no disponible."] };
    if (template) {
      const svg = await readMarbeteTemplateSvg(template);
      readiness = validateMarbeteRequirements(svg, printable, origin);
    }
    return {
      personId: printable.id ? Number(printable.id) : null,
      userId: Number(row.userId),
      indice: printable.indice ? Number(printable.indice) : null,
      authorizedName: compactName(printable.nombreP, printable.paternoP, printable.maternoP) || "Persona autorizada pendiente",
      parentesco: clean$1(printable.parenP) || null,
      authorizedPhoto: clean$1(printable.compressed_foto || printable.foto) || null,
      studentName: clean$1(printable.fullnameA) || clean$1(row.nombre_nino) || "Alumno pendiente",
      matricula: clean$1(printable.matricula) || null,
      plantel: clean$1(printable.plantel),
      nivel: clean$1(printable.nivelEdu) || "Sin nivel",
      grado: clean$1(printable.gradoA) || null,
      grupo: clean$1(printable.grupoA) || null,
      contact: clean$1(row.email) || clean$1(row.username) || null,
      theme,
      template: template || null,
      readiness
    };
  }));
  const plantelFilter = clean$1(filters.plantel).toUpperCase();
  const nivelFilter = clean$1(filters.nivel).toLowerCase();
  const filtered = mapped.filter((row) => {
    if (plantelFilter && row.plantel !== plantelFilter) return false;
    if (nivelFilter && !row.nivel.toLowerCase().includes(nivelFilter)) return false;
    return true;
  });
  const planteles = Array.from(new Set(mapped.map((row) => row.plantel).filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"));
  const niveles = Array.from(new Set(mapped.map((row) => row.nivel).filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"));
  return {
    rows: filtered,
    planteles,
    niveles,
    filters: {
      search: filters.search || "",
      plantel: plantelFilter,
      nivel: filters.nivel || "",
      limit: queryLimit
    }
  };
}

const schema$x = z.object({
  userId: z.coerce.number().int().positive()
});
const accessAction_post = defineEventHandler(async (event) => {
  const admin = requireSession(event, "admin");
  if (!isSuperAdmin(admin)) throw publicError(403, "Solo superadmin puede preparar acceso Husky Pass.");
  const body = schema$x.parse(await readBody(event));
  const user = await getPersonasAccessUser(body.userId);
  if (!user) throw publicError(404, "Familia no encontrada.");
  const userLogin = displayMatriculaCandidate(user.username);
  const login = user.email || userLogin || "";
  if (!login) throw publicError(422, "La familia no tiene correo ni usuario para preparar acceso.");
  const payload = {
    userId: Number(user.id),
    login,
    contact: user.email || userLogin || null,
    displayName: user.displayName || user.nombre_nino || userLogin || `Familia ${user.id}`,
    passwordAvailable: Boolean(user.plaintext),
    password: user.plaintext || null,
    status: "prepared",
    message: user.plaintext ? "Acceso preparado. No se envio automaticamente porque no hay mecanismo real de entrega configurado." : "Acceso preparado sin contrasena visible. Revisa la cuenta antes de compartir instrucciones.",
    preparedBy: admin.email || admin.username || String(admin.id)
  };
  await appendAccessActionLog({
    userId: payload.userId,
    login: payload.login,
    contact: payload.contact,
    passwordAvailable: payload.passwordAvailable,
    preparedBy: payload.preparedBy
  });
  return payload;
});

const accessAction_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: accessAction_post
}, Symbol.toStringTag, { value: 'Module' }));

const config_get$2 = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  if (!isSuperAdmin(user)) throw publicError(403, "Solo superadmin puede ver la configuracion de Personas Autorizadas.");
  return readPersonasConfig();
});

const config_get$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: config_get$2
}, Symbol.toStringTag, { value: 'Module' }));

const surveySchema = z.object({
  enabled: z.boolean().optional().default(false),
  title: z.string().trim().optional().default(""),
  embedUrl: z.string().trim().optional().default("")
});
const schema$w = z.object({
  surveyEnabled: z.boolean().optional().default(false),
  surveyTitle: z.string().trim().optional().default("Encuesta Personas Autorizadas"),
  surveyEmbedUrl: z.string().trim().optional().default(""),
  surveysByNivel: z.record(z.enum(["escolar", "preescolar", "primaria", "secundaria", "daycare"]), surveySchema).optional(),
  conveniosUrl: z.string().trim().optional().default(""),
  helpUrl: z.string().trim().optional().default("")
});
function assertOptionalUrl(value, label) {
  if (!value || value.startsWith("/uploads/")) return;
  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("bad-protocol");
  } catch {
    throw publicError(400, `${label} debe ser una URL valida.`);
  }
}
const config_post = defineEventHandler(async (event) => {
  var _a;
  const user = requireSession(event, "admin");
  if (!isSuperAdmin(user)) throw publicError(403, "Solo superadmin puede configurar Personas Autorizadas.");
  const body = schema$w.parse(await readBody(event));
  if (body.surveyEnabled && !/^https:\/\/docs\.google\.com\/forms\//i.test(body.surveyEmbedUrl)) {
    throw publicError(400, "La encuesta activa debe ser un Google Form.");
  }
  for (const option of SURVEY_NIVEL_OPTIONS) {
    const survey = (_a = body.surveysByNivel) == null ? void 0 : _a[option.key];
    if (!survey) continue;
    if (survey.enabled && !/^https:\/\/docs\.google\.com\/forms\//i.test(survey.embedUrl)) {
      throw publicError(400, `La encuesta de ${option.label} debe ser un Google Form.`);
    }
    assertOptionalUrl(survey.embedUrl, `La encuesta de ${option.label}`);
  }
  assertOptionalUrl(body.surveyEmbedUrl, "La encuesta");
  assertOptionalUrl(body.conveniosUrl, "Convenios");
  assertOptionalUrl(body.helpUrl, "Ayuda");
  return savePersonasConfig({
    ...body,
    updatedBy: user.email || user.username || String(user.id)
  });
});

const config_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: config_post
}, Symbol.toStringTag, { value: 'Module' }));

const DEV_HUSKY_PASS_VARIANTS = [
  {
    id: "guarderia-cm",
    label: "Guarderia / CM",
    themeKey: "daycare",
    nivelEdu: "guarderia",
    plantel: "CM",
    matricula: "DM240001",
    grado: "Maternal",
    grupo: "A",
    expectedTemplateId: "guarderia-default"
  },
  {
    id: "preescolar-preem",
    label: "Preescolar / PREEM",
    themeKey: "preescolar",
    nivelEdu: "preescolar",
    plantel: "PREEM",
    matricula: "PREEM240001",
    grado: "Kinder 2",
    grupo: "B",
    expectedTemplateId: "preescolar-2024"
  },
  {
    id: "primaria-pt",
    label: "Primaria / PT",
    themeKey: "primaria",
    nivelEdu: "primaria",
    plantel: "PT",
    matricula: "PT240001",
    grado: "4",
    grupo: "C",
    expectedTemplateId: "primaria-2024"
  },
  {
    id: "primaria-pm",
    label: "Primaria / PM",
    themeKey: "primaria",
    nivelEdu: "primaria",
    plantel: "PM",
    matricula: "PM240001",
    grado: "5",
    grupo: "A",
    expectedTemplateId: "primaria-2024"
  },
  {
    id: "secundaria-st",
    label: "Secundaria / ST",
    themeKey: "secundaria",
    nivelEdu: "secundaria",
    plantel: "ST",
    matricula: "ST240001",
    grado: "2",
    grupo: "D",
    expectedTemplateId: "secundaria-2024"
  },
  {
    id: "secundaria-sm",
    label: "Secundaria / SM",
    themeKey: "secundaria",
    nivelEdu: "secundaria",
    plantel: "SM",
    matricula: "SM240001",
    grado: "3",
    grupo: "B",
    expectedTemplateId: "secundaria-2024"
  }
];
const DEV_HUSKY_PASS_SCENARIOS = [
  {
    id: "default",
    label: "Completo",
    description: "Datos completos, imagen vertical y URL absoluta.",
    imageMode: "portrait"
  },
  {
    id: "long-name",
    label: "Nombre largo",
    description: "Acentos, apellidos compuestos y nombre largo.",
    imageMode: "portrait",
    longName: true
  },
  {
    id: "missing-optional",
    label: "Opcional faltante",
    description: "Sin apellido materno ni fecha de alta.",
    imageMode: "portrait",
    missingOptional: true
  },
  {
    id: "wide-photo",
    label: "Foto horizontal",
    description: "Imagen con aspecto inusual para validar recorte.",
    imageMode: "wide"
  },
  {
    id: "transparent-photo",
    label: "Transparente",
    description: "Imagen SVG transparente sobre el marco del pase.",
    imageMode: "transparent"
  },
  {
    id: "large-photo",
    label: "Archivo grande",
    description: "SVG grande para validar inlining y repeticion.",
    imageMode: "large"
  },
  {
    id: "slow-photo",
    label: "Imagen lenta",
    description: "Respuesta diferida para validar timeout tolerante.",
    imageMode: "slow"
  }
];
function devHuskyPassVariant(id) {
  return DEV_HUSKY_PASS_VARIANTS.find((variant) => variant.id === id) || DEV_HUSKY_PASS_VARIANTS[0];
}
function devHuskyPassScenario(id) {
  return DEV_HUSKY_PASS_SCENARIOS.find((scenario) => scenario.id === id) || DEV_HUSKY_PASS_SCENARIOS[0];
}
function devHuskyPassPhotoUrl(origin, variant, scenario, person = false) {
  const url = new URL("/api/dev/husky-pass/photo", origin);
  url.searchParams.set("seed", `${variant.id}-${scenario.id}-${person ? "person" : "student"}`);
  url.searchParams.set("label", person ? "PA" : "AL");
  url.searchParams.set("theme", variant.themeKey);
  url.searchParams.set("mode", scenario.imageMode);
  if (scenario.imageMode === "slow") url.searchParams.set("delay", "1400");
  if (scenario.imageMode === "large") url.searchParams.set("large", "1");
  if (scenario.imageMode === "transparent") url.searchParams.set("transparent", "1");
  return url.toString();
}
function buildDevPrintableAuthorizedPerson(input) {
  const variant = devHuskyPassVariant(input.variantId);
  const scenario = devHuskyPassScenario(input.scenarioId);
  const longName = scenario.longName;
  const missingOptional = scenario.missingOptional;
  const personPhoto = devHuskyPassPhotoUrl(input.origin, variant, scenario, true);
  const studentPhoto = devHuskyPassPhotoUrl(input.origin, variant, scenario, false);
  const data = {
    id: 9e3 + DEV_HUSKY_PASS_VARIANTS.findIndex((item) => item.id === variant.id),
    indice: 1,
    qr: `DEV-${variant.id}-${scenario.id}`,
    paternoP: longName ? "De la Luz Santillan" : "Lopez",
    maternoP: missingOptional ? "" : longName ? "Fernandez del Campo" : "Garcia",
    nombreP: longName ? "Maria Jose de los Angeles" : "Sofia",
    parenP: longName ? "Tutora autorizada" : "Tia",
    foto: personPhoto,
    compressed_foto: personPhoto,
    fechaP: missingOptional ? "" : "2026-08-19",
    user_id: 7001,
    nivelEdu: variant.nivelEdu,
    plantel: variant.plantel,
    matricula: variant.matricula,
    fullnameA: longName ? "Emiliano Sebastian Alvarez de la Torre" : "Valentina Perez Ramos",
    fotoA: studentPhoto,
    gradoA: variant.grado,
    grupoA: variant.grupo,
    child: {
      id: 7001,
      nombreA: longName ? "Emiliano Sebastian" : "Valentina",
      paternoA: longName ? "Alvarez de la Torre" : "Perez",
      maternoA: "Ramos",
      nivelEdu: variant.nivelEdu,
      plantel: variant.plantel,
      matricula: variant.matricula,
      grado: variant.grado,
      grupo: variant.grupo,
      foto: studentPhoto,
      isCurrent: true
    }
  };
  return { data, variant, scenario };
}
function selectDevHuskyPassTemplate(templates, variant) {
  return selectMarbeteTemplate(templates, {
    matricula: variant.matricula,
    plantel: variant.plantel,
    nivelEdu: variant.nivelEdu,
    themeKey: variant.themeKey
  });
}

const FRIENDLY_TEXT_MESSAGE = "Necesitamos completar algunos datos antes de descargar el Husky Pass.";
const FRIENDLY_IMAGE_MESSAGE = "Para descargar el Husky Pass, actualiza la foto de la persona autorizada o solicita apoyo a la escuela.";
const FRIENDLY_RENDER_MESSAGE = "No pudimos preparar el Husky Pass en este momento. Intenta nuevamente o solicita apoyo a la escuela.";
const LOCAL_MONTSERRAT_CANDIDATES = [
  resolve(process.cwd(), "public/fonts/Montserrat-SemiBold.ttf"),
  resolve(process.cwd(), "public/fonts/Montserrat-SemiBold.woff2"),
  resolve(process.cwd(), "public/fonts/Montserrat.ttf"),
  resolve(process.cwd(), "node_modules/@fontsource/montserrat/files/montserrat-latin-600-normal.woff"),
  resolve(process.cwd(), "node_modules/@fontsource/montserrat/files/montserrat-latin-600-normal.woff2"),
  resolve(process.cwd(), "node_modules/@fontsource/montserrat/files/montserrat-latin-ext-600-normal.woff"),
  resolve(process.cwd(), "node_modules/@fontsource/montserrat/files/montserrat-latin-ext-600-normal.woff2")
];
const PUBLIC_MONTSERRAT_FILES = [
  "Montserrat-SemiBold.ttf",
  "Montserrat-SemiBold.woff2"
];
const CHROMIUM_CANDIDATES = [
  process.env.HUSKY_PASS_CHROMIUM_PATH || "",
  process.env.CHROMIUM_PATH || "",
  process.env.PUPPETEER_EXECUTABLE_PATH || "",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
];
function diagnosticError(statusCode, statusMessage, code, details = {}) {
  logPersonasWarning(`marbete-pdf-${code}`, details);
  return publicError(statusCode, statusMessage, void 0, {
    diagnostic: {
      code,
      ...details
    }
  });
}
function publicDiagnosticUrl(value) {
  const target = decodeEntityUrl(value).trim();
  if (!target) return "";
  if (target.startsWith("data:")) return `${target.slice(0, 32)}...`;
  try {
    const url = new URL(target);
    return `${url.origin}${url.pathname}`;
  } catch {
    return target.slice(0, 180);
  }
}
function decodeEntityUrl(value) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
}
function encodeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function mimeFromContentType(contentType, url) {
  const type = String(contentType || "").split(";")[0].trim().toLowerCase();
  if (type.startsWith("image/")) return type;
  if (/\.jpe?g($|[?#])/i.test(url)) return "image/jpeg";
  if (/\.png($|[?#])/i.test(url)) return "image/png";
  if (/\.webp($|[?#])/i.test(url)) return "image/webp";
  if (/\.svg($|[?#])/i.test(url)) return "image/svg+xml";
  return "image/png";
}
function assertRenderableImageMime(mime) {
  const normalized = mime === "image/jpg" ? "image/jpeg" : mime;
  if (normalized.startsWith("image/")) return normalized;
  throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, "unsupported-image-mime", { mime });
}
function isDataImage(value) {
  return /^data:image\//i.test(value);
}
function parseDataImage(value) {
  const match = /^data:(image\/[a-z0-9.+-]+)(;base64)?,(.+)$/is.exec(value.trim());
  if (!match) return null;
  const mime = assertRenderableImageMime(match[1].toLowerCase());
  const payload = match[3].trim();
  const bytes = match[2] ? Buffer.from(payload.replace(/\s/g, ""), "base64") : Buffer.from(decodeURIComponent(payload), "utf8");
  return bytes.length ? { bytes, mime } : null;
}
function localPublicPathFromUrl(value, origin) {
  const raw = decodeEntityUrl(value).trim();
  if (!raw || raw.startsWith("data:")) return "";
  let pathname = "";
  try {
    if (/^https?:\/\//i.test(raw)) {
      const url = new URL(raw);
      const requestOrigin = origin ? new URL(origin).origin : "";
      if (requestOrigin && url.origin !== requestOrigin) return "";
      pathname = url.pathname;
    } else if (raw.startsWith("/")) {
      pathname = raw.split("?")[0].split("#")[0];
    }
  } catch {
    return "";
  }
  if (!pathname || pathname.includes("\0")) return "";
  const root = resolve(process.cwd(), "public");
  const target = resolve(root, pathname.replace(/^\/+/, ""));
  const pathFromRoot = relative(root, target);
  if (pathFromRoot.startsWith("..") || resolve(pathFromRoot) === pathFromRoot) return "";
  return target;
}
async function loadLocalPublicImage(value, origin) {
  const localPath = localPublicPathFromUrl(value, origin);
  if (!localPath || !existsSync(localPath)) return null;
  const bytes = await readFile(localPath);
  if (!bytes.length) throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, "image-empty", { source: value, resolvedPath: localPath });
  return { bytes, mime: assertRenderableImageMime(mimeFromContentType(null, localPath)) };
}
function absoluteSameOriginUrl(value, origin) {
  if (!value.startsWith("/") || !origin) return value;
  return `${origin.replace(/\/$/, "")}${value}`;
}
async function loadImage(value, origin, key = "image") {
  const target = decodeEntityUrl(value).trim();
  if (!target) throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, "invalid-image-url", { key, reason: "empty" });
  if (isDataImage(target)) {
    const parsed = parseDataImage(target);
    if (!parsed) throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, "invalid-image-url", { key, reason: "invalid-data-image" });
    return parsed;
  }
  const local = await loadLocalPublicImage(target, origin);
  if (local) return local;
  const fetchTarget = absoluteSameOriginUrl(target, origin);
  if (!/^https?:\/\//i.test(fetchTarget)) {
    throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, "invalid-image-url", { key, url: publicDiagnosticUrl(target), reason: "not-http-or-public" });
  }
  let response;
  try {
    response = await fetch(fetchTarget, { signal: AbortSignal.timeout(15e3) });
  } catch (error) {
    throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, "image-fetch-failed", {
      key,
      url: publicDiagnosticUrl(fetchTarget),
      message: error instanceof Error ? error.message : String(error)
    });
  }
  if (!response.ok) {
    throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, "image-fetch-failed", {
      key,
      url: publicDiagnosticUrl(fetchTarget),
      status: response.status,
      statusText: response.statusText
    });
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length) throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, "image-empty", { key, url: publicDiagnosticUrl(fetchTarget) });
  return {
    bytes,
    mime: assertRenderableImageMime(mimeFromContentType(response.headers.get("content-type"), fetchTarget))
  };
}
async function inlineImage(url, origin = "") {
  const image = await loadImage(url, origin);
  return `data:${image.mime};base64,${image.bytes.toString("base64")}`;
}
function imageHrefMatches(svg) {
  return Array.from(svg.matchAll(/((?:xlink:)?href)=["']([^"']*)["']/gi)).filter((match) => {
    const value = decodeEntityUrl(match[2] || "").trim();
    if (!value || value.startsWith("#") || isDataImage(value)) return false;
    return /^https?:\/\//i.test(value) || value.startsWith("/");
  });
}
async function inlineSvgImages(svg, origin = "") {
  const matches = imageHrefMatches(svg);
  const replacements = await Promise.all(matches.map(async (match) => {
    const inlined = await inlineImage(match[2], origin);
    return { from: match[0], to: `${match[1]}="${inlined}"` };
  }));
  return replacements.reduce((next, replacement) => next.replace(replacement.from, replacement.to), svg);
}
function dynamicTextTokens(svg) {
  return Array.from(svg.matchAll(/{{\s*data\.([A-Za-z0-9_]+)\s*}}/g)).map((match) => match[1]);
}
function dynamicImageTokens(svg) {
  return Array.from(svg.matchAll(/{{\s*getTrustedUrl\(data\.([A-Za-z0-9_]+)\)\s*}}/g)).map((match) => match[1]);
}
function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}
function requiredTextKeys(input) {
  const optionalTemplateKeys = /* @__PURE__ */ new Set([
    "maternoP",
    "fechaP",
    "id",
    "qr",
    "validationUrl"
  ]);
  return unique([
    ...dynamicTextTokens(input.templateSvg).filter((key) => !optionalTemplateKeys.has(key)),
    "nombreP",
    "parenP",
    "fullnameP"
  ]);
}
function requiredImageKeys(input) {
  return unique(dynamicImageTokens(input.templateSvg));
}
function chromiumPath() {
  return CHROMIUM_CANDIDATES.find((candidate) => candidate && existsSync(candidate)) || "";
}
async function chromiumLaunchConfig() {
  var _a;
  const localPath = chromiumPath();
  if (localPath) return { executable: localPath, args: [] };
  try {
    const chromiumModule = await import('file://C:/Users/hp/husky-pass-crm/node_modules/@sparticuz/chromium/build/index.js');
    const chromium = chromiumModule.default || chromiumModule;
    const executable = await ((_a = chromium.executablePath) == null ? void 0 : _a.call(chromium));
    if (executable) return { executable, args: Array.isArray(chromium.args) ? chromium.args : [] };
  } catch (error) {
    logPersonasWarning("marbete-pdf-chromium-package-unavailable", {
      message: error instanceof Error ? error.message : String(error)
    });
  }
  return null;
}
async function readFontBytesFromOrigin(origin) {
  if (!origin) return null;
  for (const file of PUBLIC_MONTSERRAT_FILES) {
    const url = `${origin.replace(/\/$/, "")}/fonts/${file}`;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15e3) });
      if (!response.ok) continue;
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length) return { bytes, path: url };
    } catch {
      continue;
    }
  }
  return null;
}
async function fontFaceCss(origin = "") {
  const fontPath = LOCAL_MONTSERRAT_CANDIDATES.find((candidate) => candidate && existsSync(candidate)) || "";
  let bytes;
  let sourcePath = fontPath;
  if (fontPath) {
    bytes = await readFile(fontPath);
  } else {
    const remoteFont = await readFontBytesFromOrigin(origin);
    bytes = (remoteFont == null ? void 0 : remoteFont.bytes) || null;
    sourcePath = (remoteFont == null ? void 0 : remoteFont.path) || "";
  }
  if (!bytes) {
    throw diagnosticError(503, FRIENDLY_RENDER_MESSAGE, "font-not-found", {
      candidates: [
        ...LOCAL_MONTSERRAT_CANDIDATES,
        ...PUBLIC_MONTSERRAT_FILES.map((file) => origin ? `${origin.replace(/\/$/, "")}/fonts/${file}` : "")
      ].filter(Boolean)
    });
  }
  const format = sourcePath.endsWith(".woff2") ? "woff2" : "truetype";
  const mime = sourcePath.endsWith(".woff2") ? "font/woff2" : "font/ttf";
  const source = `url(data:${mime};base64,${bytes.toString("base64")}) format('${format}')`;
  return `@font-face{font-family:'Montserrat';src:${source};font-weight:600;font-style:normal;font-display:block;}@font-face{font-family:'Montserrat SemiBold';src:${source};font-weight:600;font-style:normal;font-display:block;}@font-face{font-family:'Montserrat-SemiBold';src:${source};font-weight:600;font-style:normal;font-display:block;}`;
}
function supplementalDataLayer(values) {
  const studentLine = [values.fullnameA, values.matricula].filter(Boolean).join(" \xB7 ");
  const groupLine = [values.plantel, values.nivelEdu || values.nivel, values.gradoA || values.grado, values.grupoA || values.grupo].filter(Boolean).join(" / ");
  const validityLine = [values.validityLabel, values.validationUrl].filter(Boolean).join(" / ");
  if (!studentLine && !groupLine && !validityLine) return "";
  return `<section class="hp-pdf-context" aria-label="Datos escolares del Husky Pass">
    <strong>${encodeHtml(studentLine)}</strong>
    <span>${encodeHtml(groupLine)}</span>
    <span>${encodeHtml(validityLine)}</span>
  </section>`;
}
function supplementalDataLines(values) {
  return [
    [values.fullnameA, values.matricula].filter(Boolean).join(" \xB7 "),
    [values.plantel, values.nivelEdu || values.nivel, values.gradoA || values.grado, values.grupoA || values.grupo].filter(Boolean).join(" / "),
    [values.validityLabel, values.validationUrl].filter(Boolean).join(" / ")
  ].filter(Boolean);
}
async function composeMarbeteHtml(input) {
  const completeSvg = await inlineSvgImages(input.renderedSvg, input.origin);
  if (/{{\s*[^}]+\s*}}/.test(completeSvg)) {
    throw diagnosticError(422, FRIENDLY_TEXT_MESSAGE, "unresolved-svg-token", {
      tokens: Array.from(completeSvg.matchAll(/{{\s*([^}]+)\s*}}/g)).map((match) => match[1]).slice(0, 20)
    });
  }
  const fontCss = await fontFaceCss(input.origin);
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
${fontCss}
@page { size: 8.5in 11in; margin: 0; }
html, body { margin: 0; padding: 0; width: 8.5in; height: 11in; background: #fff; }
body { font-family: 'Montserrat', Arial, sans-serif; font-weight: 600; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
.hp-page { position: relative; width: 8.5in; height: 11in; overflow: hidden; background: #fff; }
.hp-page svg { display: block; width: 8.5in; height: 11in; }
.hp-pdf-context { position: absolute; left: 0.72in; right: 0.72in; bottom: 0.06in; display: grid; gap: 0.01in; color: #55585f; font-size: 6pt; line-height: 1.05; letter-spacing: 0; }
.hp-pdf-context strong, .hp-pdf-context span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
</head>
<body>
  <main class="hp-page">
    ${completeSvg}
    ${supplementalDataLayer(input.values)}
  </main>
</body>
</html>`;
}
function runChromium(executable, htmlFile, pdfFile, extraArgs = []) {
  const filteredExtraArgs = extraArgs.filter((arg) => {
    return !arg.startsWith("--headless") && !arg.startsWith("--print-to-pdf") && !arg.startsWith("--user-data-dir");
  });
  const args = [
    ...filteredExtraArgs,
    "--headless=new",
    "--disable-background-networking",
    "--disable-breakpad",
    "--disable-crash-reporter",
    "--disable-dev-shm-usage",
    "--disable-extensions",
    "--disable-gpu",
    "--disable-sync",
    "--hide-scrollbars",
    "--no-default-browser-check",
    "--no-first-run",
    "--no-pdf-header-footer",
    "--no-sandbox",
    "--run-all-compositor-stages-before-draw",
    "--virtual-time-budget=10000",
    `--user-data-dir=${join(dirname(htmlFile), "chrome-profile")}`,
    `--print-to-pdf=${pdfFile}`,
    `file://${htmlFile}`
  ];
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(executable, args, { stdio: ["ignore", "ignore", "pipe"] });
    const stderr = [];
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      rejectRun(diagnosticError(503, FRIENDLY_RENDER_MESSAGE, "chromium-render-failed", {
        executable,
        reason: "timeout"
      }));
    }, 3e4);
    child.stderr.on("data", (chunk) => {
      stderr.push(chunk);
    });
    child.once("error", () => {
      clearTimeout(timer);
      rejectRun(diagnosticError(503, FRIENDLY_RENDER_MESSAGE, "chromium-render-failed", {
        executable,
        reason: "spawn-error"
      }));
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      if (code === 0) resolveRun();
      else rejectRun(diagnosticError(503, FRIENDLY_RENDER_MESSAGE, "chromium-render-failed", {
        executable,
        exitCode: code,
        stderr: Buffer.concat(stderr).toString("utf8").slice(-2e3)
      }));
    });
  });
}
async function renderHtmlToPdf(html) {
  const chromium = await chromiumLaunchConfig();
  if (!(chromium == null ? void 0 : chromium.executable)) {
    throw diagnosticError(503, FRIENDLY_RENDER_MESSAGE, "chromium-not-found", {
      candidates: [...CHROMIUM_CANDIDATES.filter(Boolean), "@sparticuz/chromium"]
    });
  }
  const workDir = join(tmpdir(), `husky-pass-${randomUUID()}`);
  await mkdir(workDir, { recursive: true });
  const htmlFile = join(workDir, "husky-pass.html");
  const pdfFile = join(workDir, "husky-pass.pdf");
  try {
    await writeFile(htmlFile, html, "utf8");
    await runChromium(chromium.executable, htmlFile, pdfFile, chromium.args);
    const pdf = await readFile(pdfFile);
    if (pdf.length < 1024 || pdf.subarray(0, 5).toString("ascii") !== "%PDF-") {
      throw diagnosticError(503, FRIENDLY_RENDER_MESSAGE, "pdf-invalid", {
        bytes: pdf.length,
        signature: pdf.subarray(0, 8).toString("ascii")
      });
    }
    return pdf;
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => void 0);
  }
}
function collectPdfBuffer(doc) {
  return new Promise((resolvePdf, rejectPdf) => {
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.once("error", rejectPdf);
    doc.once("end", () => resolvePdf(Buffer.concat(chunks)));
    doc.end();
  });
}
function rawBytesToBuffer(raw) {
  if (!raw) return null;
  if (Buffer.isBuffer(raw)) return raw;
  if (raw instanceof Uint8Array) return Buffer.from(raw);
  if (raw instanceof ArrayBuffer) return Buffer.from(raw);
  if (typeof raw === "string") return Buffer.from(raw, "binary");
  return null;
}
async function readBundledFontBytes() {
  for (const file of PUBLIC_MONTSERRAT_FILES) {
    const raw = await useStorage("assets:hp-fonts").getItem(file);
    const bytes = rawBytesToBuffer(raw);
    if (bytes == null ? void 0 : bytes.length) return { bytes, path: `assets:hp-fonts/${file}` };
  }
  return null;
}
function tryRegisterPdfFont(doc, fontName, source, label) {
  try {
    doc.registerFont(fontName, source);
    doc.font(fontName);
    return true;
  } catch (error) {
    logPersonasWarning("marbete-pdf-font-register-failed", {
      source: label,
      message: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
}
async function registerPdfFont(doc, origin) {
  const fontName = "Montserrat-SemiBold-Embedded";
  const candidates = LOCAL_MONTSERRAT_CANDIDATES.filter((candidate) => candidate && existsSync(candidate));
  for (const candidate of candidates) {
    if (tryRegisterPdfFont(doc, fontName, candidate, candidate)) return fontName;
  }
  const bundled = await readBundledFontBytes();
  if ((bundled == null ? void 0 : bundled.bytes.length) && tryRegisterPdfFont(doc, fontName, bundled.bytes, bundled.path)) {
    return fontName;
  }
  const remoteFont = await readFontBytesFromOrigin(origin);
  if ((remoteFont == null ? void 0 : remoteFont.bytes.length) && tryRegisterPdfFont(doc, fontName, remoteFont.bytes, remoteFont.path)) {
    return fontName;
  }
  throw diagnosticError(503, FRIENDLY_RENDER_MESSAGE, "font-not-found", {
    candidates: [
      ...LOCAL_MONTSERRAT_CANDIDATES,
      ...PUBLIC_MONTSERRAT_FILES.map((file) => `assets:hp-fonts/${file}`),
      ...PUBLIC_MONTSERRAT_FILES.map((file) => origin ? `${origin.replace(/\/$/, "")}/fonts/${file}` : "")
    ].filter(Boolean)
  });
}
async function renderSvgToPdfKit(input) {
  const completeSvg = await inlineSvgImages(input.renderedSvg, input.origin);
  if (/{{\s*[^}]+\s*}}/.test(completeSvg)) {
    throw diagnosticError(422, FRIENDLY_TEXT_MESSAGE, "unresolved-svg-token", {
      tokens: Array.from(completeSvg.matchAll(/{{\s*([^}]+)\s*}}/g)).map((match) => match[1]).slice(0, 20)
    });
  }
  const doc = new PDFDocument({
    autoFirstPage: false,
    compress: true,
    info: {
      Title: "Husky Pass",
      Creator: "Husky Pass CRM"
    }
  });
  doc.addPage({ size: [612, 792], margin: 0 });
  const fontName = await registerPdfFont(doc, input.origin);
  const warnings = [];
  try {
    SVGtoPDF(doc, completeSvg, 0, 0, {
      width: 612,
      height: 792,
      assumePt: true,
      preserveAspectRatio: "xMidYMid meet",
      fontCallback: (family) => /montserrat/i.test(String(family || "")) ? fontName : "Helvetica-Bold",
      warningCallback: (message) => warnings.push(String(message || "").slice(0, 300))
    });
    const lines = supplementalDataLines(input.values);
    if (lines.length) {
      doc.font(fontName);
      doc.fontSize(6);
      doc.fillColor("#55585f");
      const lineHeight = 7;
      const startY = 792 - 4.32 - lines.length * lineHeight;
      lines.forEach((line, index) => {
        doc.text(line, 51.84, startY + index * lineHeight, {
          width: 508.32,
          height: lineHeight,
          lineBreak: false
        });
      });
    }
  } catch (error) {
    throw diagnosticError(503, FRIENDLY_RENDER_MESSAGE, "chromium-render-failed", {
      reason: "pdfkit-render-error",
      message: error instanceof Error ? error.message : String(error),
      warnings: warnings.slice(0, 10)
    });
  }
  const pdf = await collectPdfBuffer(doc);
  if (pdf.length < 1024 || pdf.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw diagnosticError(503, FRIENDLY_RENDER_MESSAGE, "pdf-invalid", {
      bytes: pdf.length,
      signature: pdf.subarray(0, 8).toString("ascii"),
      warnings: warnings.slice(0, 10)
    });
  }
  if (warnings.some((warning) => /image|font|parse|invalid|not look like/i.test(warning))) {
    logPersonasDebug("marbete-pdf-pdfkit-warnings", { warnings: warnings.slice(0, 10) });
  }
  return pdf;
}
async function assertMarbetePdfAssets(input) {
  if (typeof input === "string") {
    await inlineSvgImages(input);
    return { ok: true };
  }
  const missingText = requiredTextKeys(input).filter((key) => !String(input.values[key] || "").trim());
  if (missingText.length) throw diagnosticError(422, FRIENDLY_TEXT_MESSAGE, "missing-required-field", { fields: missingText });
  const missingImages = requiredImageKeys(input).filter((key) => !String(input.values[key] || "").trim());
  if (missingImages.length) throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, "missing-required-image", { fields: missingImages });
  await Promise.all(requiredImageKeys(input).map((key) => loadImage(input.values[key], input.origin, key)));
  await inlineSvgImages(input.renderedSvg, input.origin);
  return { ok: true };
}
async function renderMarbetePdf(input) {
  const pdfInput = typeof input === "string" ? { templateSvg: input, renderedSvg: input, values: {}, origin: "" } : input;
  await assertMarbetePdfAssets(pdfInput);
  if (process.env.HUSKY_PASS_PDF_RENDERER === "chromium") {
    const html = await composeMarbeteHtml(pdfInput);
    return renderHtmlToPdf(html);
  }
  return renderSvgToPdfKit(pdfInput);
}

const schema$v = z.object({
  id: z.coerce.number().int().positive(),
  download: z.string().optional().default(""),
  scenario: z.string().optional().default("default"),
  format: z.enum(["pdf", "svg-preview", "readiness", "diagnostics"]).optional().default("pdf")
});
function firstIssue$1(issues) {
  return issues[0] || "Completa los datos solicitados para generar el Husky Pass.";
}
const marbete_get$2 = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  if (!isSuperAdmin(user)) throw publicError(403, "Solo superadmin puede generar Husky Pass.");
  const query = schema$v.parse(getQuery$1(event));
  const origin = getRequestURL(event).origin;
  const fixtureIndex = query.id - 9e3;
  const data = fixtureIndex >= 0 && fixtureIndex < DEV_HUSKY_PASS_VARIANTS.length ? buildDevPrintableAuthorizedPerson({ origin, variantId: DEV_HUSKY_PASS_VARIANTS[fixtureIndex].id, scenarioId: query.scenario }).data : await getSuperAdminPrintableAuthorizedPersona(query.id);
  if (!data) throw publicError(404, "Persona autorizada no encontrada.");
  const templates = await listMarbeteTemplates();
  const template = selectMarbeteTemplate(templates, {
    matricula: data.matricula,
    plantel: data.plantel,
    nivelEdu: data.nivelEdu
  });
  if (!template) throw publicError(503, "El Husky Pass no esta disponible para este alumno.");
  const templateSvg = await readMarbeteTemplateSvg(template);
  const renderedSvg = renderMarbeteSvg(templateSvg, data, origin);
  const renderValues = buildMarbeteRenderValues(data, origin);
  const pdfInput = { templateSvg, renderedSvg, values: renderValues.values, origin };
  const readiness = validateMarbeteRequirements(templateSvg, data, origin);
  const downloadName = marbeteDownloadName(data, template);
  if (query.format === "readiness") {
    const response = {
      ok: readiness.ok,
      issues: readiness.issues,
      template,
      themeKey: template.themeKey,
      downloadName
    };
    if (readiness.ok) await assertMarbetePdfAssets(pdfInput);
    setHeader(event, "Cache-Control", "private, no-store");
    return response;
  }
  if (query.format === "diagnostics") {
    let assetsOk = false;
    let assetError = null;
    try {
      await assertMarbetePdfAssets(pdfInput);
      assetsOk = true;
    } catch (error) {
      assetError = error;
    }
    setHeader(event, "Cache-Control", "private, no-store");
    return {
      ok: readiness.ok && assetsOk,
      readiness,
      assetsOk,
      assetError,
      template,
      values: renderValues.values,
      downloadName
    };
  }
  if (!readiness.ok) {
    throw publicError(422, firstIssue$1(readiness.issues));
  }
  if (query.format === "svg-preview") {
    setHeader(event, "Content-Type", "image/svg+xml; charset=utf-8");
    setHeader(event, "Cache-Control", "private, no-store");
    setHeader(event, "X-Husky-Marbete-Template", template.id);
    setHeader(event, "X-Husky-Marbete-Theme", template.themeKey);
    return renderedSvg;
  }
  await assertMarbetePdfAssets(pdfInput);
  const pdf = await renderMarbetePdf(pdfInput);
  setHeader(event, "Content-Type", "application/pdf");
  setHeader(event, "Cache-Control", "private, no-store");
  setHeader(event, "X-Husky-Marbete-Template", template.id);
  setHeader(event, "X-Husky-Marbete-Theme", template.themeKey);
  setHeader(event, "Content-Disposition", `${query.download === "1" ? "attachment" : "inline"}; filename="${downloadName}"`);
  return pdf;
});

const marbete_get$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: marbete_get$2
}, Symbol.toStringTag, { value: 'Module' }));

const schema$u = z.object({
  search: z.string().optional().default(""),
  plantel: z.string().optional().default(""),
  nivel: z.string().optional().default(""),
  fixture: z.string().optional().default(""),
  limit: z.coerce.number().int().min(10).max(200).optional().default(80)
});
const passSearch_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  if (!isSuperAdmin(user)) throw publicError(403, "Solo superadmin puede generar Husky Pass.");
  const query = schema$u.parse(getQuery$1(event));
  const origin = getRequestURL(event).origin;
  if (query.fixture === "1" && true) {
    const templates = await listMarbeteTemplates();
    const rows = await Promise.all(DEV_HUSKY_PASS_VARIANTS.map(async (variant) => {
      const fixture = buildDevPrintableAuthorizedPerson({ origin, variantId: variant.id, scenarioId: "default" });
      let template = null;
      let templateIssue = "Plantilla de Husky Pass no disponible.";
      try {
        template = selectDevHuskyPassTemplate(templates, fixture.variant);
        templateIssue = "";
      } catch (error) {
        templateIssue = error instanceof Error ? error.message : templateIssue;
      }
      const theme = resolvePersonasTheme({
        matricula: fixture.data.matricula,
        plantel: fixture.data.plantel,
        nivelEdu: fixture.data.nivelEdu,
        themeKey: fixture.variant.themeKey
      });
      let readiness = { ok: false, issues: [templateIssue] };
      if (template) {
        const svg = await readMarbeteTemplateSvg(template);
        readiness = validateMarbeteRequirements(svg, fixture.data, origin);
      }
      return {
        personId: Number(fixture.data.id),
        userId: Number(fixture.data.user_id),
        indice: Number(fixture.data.indice),
        authorizedName: [fixture.data.nombreP, fixture.data.paternoP, fixture.data.maternoP].filter(Boolean).join(" "),
        parentesco: fixture.data.parenP || null,
        authorizedPhoto: fixture.data.foto || null,
        studentName: fixture.data.fullnameA || "Alumno fixture",
        matricula: fixture.data.matricula || null,
        plantel: fixture.data.plantel || "",
        nivel: fixture.data.nivelEdu || "",
        grado: fixture.data.gradoA || null,
        grupo: fixture.data.grupoA || null,
        contact: "fixture-superadmin@localhost",
        theme,
        template: template || null,
        readiness
      };
    }));
    return {
      rows,
      planteles: Array.from(new Set(rows.map((row) => row.plantel))).sort(),
      niveles: Array.from(new Set(rows.map((row) => row.nivel))).sort(),
      filters: {
        search: query.search,
        plantel: query.plantel,
        nivel: query.nivel,
        limit: query.limit
      }
    };
  }
  return searchSuperAdminPassCandidates(query, origin);
});

const passSearch_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: passSearch_get
}, Symbol.toStringTag, { value: 'Module' }));

const schema$t = z.object({
  plantel: z.string().optional().default(""),
  nivel: z.string().optional().default(""),
  status: z.string().optional().default("all"),
  search: z.string().optional().default(""),
  limit: z.coerce.number().int().min(25).max(400).optional().default(120)
});
const readiness_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  if (!isSuperAdmin(user)) throw publicError(403, "Solo superadmin puede consultar readiness PA.");
  return getPersonasReadiness(schema$t.parse(getQuery$1(event)));
});

const readiness_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: readiness_get
}, Symbol.toStringTag, { value: 'Module' }));

const IMAGE_TYPES = /* @__PURE__ */ new Set(["image/png", "image/jpeg", "image/webp"]);
const DOCUMENT_TYPES = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain"
]);
const AREA_ROOTS = {
  "daycare-registration": "husky-pass/daycare/registro",
  "daycare-resource": "husky-pass/daycare/recursos",
  "personas-source": "husky-pass/personas-autorizadas/fuentes",
  "personas-face": "husky-pass/personas-autorizadas/rostros",
  "personas-resource": "husky-pass/personas-autorizadas/recursos"
};
function cleanSegment(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}
function externalUploadFolder(area, ...segments) {
  const root = AREA_ROOTS[area];
  const safeSegments = segments.map(cleanSegment).filter(Boolean);
  const folder = [root, ...safeSegments].join("/");
  if (!/^[a-z0-9][a-z0-9/_-]{0,160}$/i.test(folder) || folder.includes("..")) {
    throw publicError(400, "Destino de carga no v\xE1lido.");
  }
  return folder;
}
function extensionFrom(filename) {
  const extension = extname(String(filename || "")).toLowerCase().replace(/[^a-z0-9.]/g, "");
  return extension && extension.length <= 12 ? extension : "";
}
function assertMime(mime, accept) {
  const normalized = mime.toLowerCase();
  const isImage = IMAGE_TYPES.has(normalized);
  const isDocument = DOCUMENT_TYPES.has(normalized);
  if (accept === "images" && isImage) return;
  if (accept === "documents" && isDocument) return;
  if (accept === "imagesAndDocuments" && (isImage || isDocument)) return;
  throw publicError(415, "Tipo de archivo no permitido.");
}
function assertFile(input, options) {
  var _a;
  const size = ((_a = input.data) == null ? void 0 : _a.byteLength) || 0;
  if (!size) throw publicError(400, "Selecciona un archivo para subir.");
  if (size > options.maxBytes) {
    const mb = Math.round(options.maxBytes / 1024 / 1024);
    throw publicError(413, `El archivo excede ${mb} MB.`);
  }
  const mime = String(input.type || "application/octet-stream").toLowerCase();
  assertMime(mime, options.accept);
  return { size, mime };
}
function uploadEndpoint() {
  var _a;
  const configured = String(((_a = useRuntimeConfig().externalUpload) == null ? void 0 : _a.url) || "").trim();
  return configured || "https://expediente.casitaapps.com";
}
async function uploadToExternalService(input, options) {
  const { size, mime } = assertFile(input, options);
  const originalName = String(input.filename || "").trim();
  const extension = extensionFrom(originalName);
  const safePrefix = cleanSegment(options.filenamePrefix) || "archivo";
  const fileName = `${safePrefix}-${Date.now()}-${randomUUID().slice(0, 8)}${extension}`;
  const folder = options.folder;
  if (!/^[a-z0-9][a-z0-9/_-]{0,160}$/i.test(folder) || folder.includes("..")) {
    throw publicError(400, "Destino de carga no v\xE1lido.");
  }
  const bytes = input.data instanceof Uint8Array ? input.data : new Uint8Array(input.data);
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const body = new FormData();
  body.append("file", new Blob([arrayBuffer], { type: mime }), fileName);
  body.append("folder", folder);
  body.append("includeUrl", "1");
  try {
    const response = await $fetch(uploadEndpoint(), {
      method: "POST",
      body,
      query: { includeUrl: "1" },
      timeout: 3e4
    });
    if (!(response == null ? void 0 : response.success) || !response.url || !/^https?:\/\//i.test(response.url)) {
      throw publicError(502, "El servicio de carga no devolvi\xF3 una URL v\xE1lida.");
    }
    return {
      ok: true,
      filename: originalName || fileName,
      storedFilename: response.fileName || fileName,
      size,
      mime,
      url: response.url,
      absoluteUrl: response.url,
      path: response.path
    };
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;
    throw publicError(502, "No fue posible subir el archivo al expediente externo.");
  }
}
function dataUrlToUploadFile(src, filenamePrefix) {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(src || ""));
  if (!match) throw publicError(415, "La imagen debe ser PNG, JPG o WEBP.");
  const ext = match[1] === "image/jpeg" ? "jpg" : match[1].split("/")[1];
  return {
    data: Buffer.from(match[2], "base64"),
    filename: `${cleanSegment(filenamePrefix) || "imagen"}.${ext}`,
    type: match[1]
  };
}

const uploads_post$2 = defineEventHandler(async (event) => {
  var _a;
  const user = requireSession(event, "admin");
  if (!isSuperAdmin(user)) throw publicError(403, "Solo superadmin puede subir archivos.");
  const parts = await readMultipartFormData(event);
  const filePart = parts == null ? void 0 : parts.find((part) => {
    var _a2;
    return part.name === "file" && ((_a2 = part.data) == null ? void 0 : _a2.length);
  });
  if (!((_a = filePart == null ? void 0 : filePart.data) == null ? void 0 : _a.length)) throw publicError(400, "Selecciona un archivo para subir.");
  return uploadToExternalService(
    { data: filePart.data, filename: filePart.filename, type: filePart.type },
    {
      folder: externalUploadFolder("personas-resource"),
      maxBytes: 10 * 1024 * 1024,
      accept: "imagesAndDocuments",
      filenamePrefix: "recurso-personas"
    }
  );
});

const uploads_post$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: uploads_post$2
}, Symbol.toStringTag, { value: 'Module' }));

function value(env, key) {
  return String(env[key] || "").trim();
}
function hasValue(env, key) {
  return value(env, key).length > 0;
}
function validPositiveNumber(env, key) {
  const raw = value(env, key);
  if (!raw) return false;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0;
}
function validOptionalPositiveNumber(env, key) {
  return !hasValue(env, key) || validPositiveNumber(env, key);
}
function validUrl(env, key) {
  const raw = value(env, key);
  if (!raw) return false;
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
function validOptionalUrl(env, key) {
  return !hasValue(env, key) || validUrl(env, key);
}
function validEmailLike(env, key) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value(env, key));
}
function privateKeyShape(env) {
  const normalized = value(env, "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(/\\n/g, "\n");
  return Boolean(
    normalized && normalized.includes("-----BEGIN PRIVATE KEY-----") && normalized.includes("-----END PRIVATE KEY-----") && normalized.includes("\n")
  );
}
function item(env, key, label, ok, messageOk, messageFail, severity = "required") {
  return {
    key,
    label,
    ok,
    severity,
    message: ok ? messageOk : messageFail
  };
}
function group(id, label, items) {
  return { id, label, items };
}
function buildEnvChecklist(env = process.env) {
  const core = group("core", "Base de aplicacion", [
    item(env, "MYSQL_HOST", "MySQL host", hasValue(env, "MYSQL_HOST"), "Configurado.", "Falta MYSQL_HOST."),
    item(env, "MYSQL_PORT", "MySQL puerto", validPositiveNumber(env, "MYSQL_PORT"), "Puerto numerico.", "MYSQL_PORT debe ser numerico."),
    item(env, "MYSQL_USER", "MySQL usuario", hasValue(env, "MYSQL_USER"), "Configurado.", "Falta MYSQL_USER."),
    item(env, "MYSQL_PASSWORD", "MySQL password", hasValue(env, "MYSQL_PASSWORD"), "Configurado.", "Falta MYSQL_PASSWORD."),
    item(env, "MYSQL_DATABASE", "MySQL base", hasValue(env, "MYSQL_DATABASE"), "Configurado.", "Falta MYSQL_DATABASE."),
    item(env, "MYSQL_CONNECTION_LIMIT", "Pool MySQL", validOptionalPositiveNumber(env, "MYSQL_CONNECTION_LIMIT"), "Valor valido o usando default.", "MYSQL_CONNECTION_LIMIT debe ser numerico.", "warning"),
    item(env, "SESSION_SECRET", "Session secret", value(env, "SESSION_SECRET").length >= 32, "Longitud suficiente.", "SESSION_SECRET debe tener al menos 32 caracteres."),
    item(env, "GOOGLE_CLIENT_ID", "Google client ID", hasValue(env, "GOOGLE_CLIENT_ID"), "Configurado.", "Falta GOOGLE_CLIENT_ID.")
  ]);
  const recoveryItems = [
    item(env, "PASSWORD_RECOVERY_BASE_URL", "URL publica", validUrl(env, "PASSWORD_RECOVERY_BASE_URL"), "URL valida.", "PASSWORD_RECOVERY_BASE_URL falta o no es URL."),
    item(env, "PASSWORD_RECOVERY_TOKEN_TTL_MINUTES", "Vigencia token", validOptionalPositiveNumber(env, "PASSWORD_RECOVERY_TOKEN_TTL_MINUTES"), "Valor valido o usando default.", "Debe ser un numero positivo.", "warning"),
    item(env, "PASSWORD_RECOVERY_EMAIL_MODE", "Modo de correo", ["gmail", "preview", ""].includes(value(env, "PASSWORD_RECOVERY_EMAIL_MODE").toLowerCase()), "Modo valido.", "Usa gmail o preview.", "warning"),
    item(env, "PASSWORD_RECOVERY_FROM_EMAIL", "Remitente", validEmailLike(env, "PASSWORD_RECOVERY_FROM_EMAIL"), "Correo valido.", "Falta remitente o no parece correo."),
    item(env, "PASSWORD_RECOVERY_FROM_NAME", "Nombre remitente", hasValue(env, "PASSWORD_RECOVERY_FROM_NAME"), "Configurado.", "Falta PASSWORD_RECOVERY_FROM_NAME.", "warning"),
    item(env, "GOOGLE_SERVICE_ACCOUNT_EMAIL", "Service account", validEmailLike(env, "GOOGLE_SERVICE_ACCOUNT_EMAIL"), "Correo valido.", "Falta service account o no parece correo."),
    item(env, "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY", "Private key directa", privateKeyShape(env), "PEM directo valido.", "Usa GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY con saltos \\n; no uses _BASE64."),
    item(env, "GOOGLE_WORKSPACE_DELEGATED_USER", "Usuario delegado", validEmailLike(env, "GOOGLE_WORKSPACE_DELEGATED_USER") || validEmailLike(env, "GOOGLE_GMAIL_DELEGATED_USER"), "Delegacion configurada.", "Falta GOOGLE_WORKSPACE_DELEGATED_USER o GOOGLE_GMAIL_DELEGATED_USER.")
  ];
  if (hasValue(env, "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64")) {
    recoveryItems.push(
      item(env, "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64", "Base64 obsoleto", false, "", "No se usa: reemplazalo por GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.", "warning")
    );
  }
  const recovery = group("passwordRecovery", "Recuperacion de contrasena", recoveryItems);
  const services = group("services", "Servicios externos", [
    item(env, "SIPAE_API_BASE_URL", "SIPAE API", validOptionalUrl(env, "SIPAE_API_BASE_URL"), "URL valida o usando default.", "SIPAE_API_BASE_URL no es URL.", "warning"),
    item(env, "SIPAE_API_TIMEOUT_MS", "Timeout SIPAE", validOptionalPositiveNumber(env, "SIPAE_API_TIMEOUT_MS"), "Valor valido o usando default.", "SIPAE_API_TIMEOUT_MS debe ser numerico.", "warning"),
    item(env, "EXPEDIENTE_UPLOAD_URL", "Expediente upload", validOptionalUrl(env, "EXPEDIENTE_UPLOAD_URL"), "URL valida o usando default.", "EXPEDIENTE_UPLOAD_URL no es URL.", "warning"),
    item(env, "NUXT_PUBLIC_PASE_PLATFORM_URL", "Pase platform", validOptionalUrl(env, "NUXT_PUBLIC_PASE_PLATFORM_URL"), "URL valida o vacia.", "NUXT_PUBLIC_PASE_PLATFORM_URL no es URL.", "warning")
  ]);
  const groups = [core, recovery, services];
  const ok = groups.every((entry) => entry.items.every((check) => check.ok || check.severity !== "required"));
  return {
    ok,
    checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
    groups
  };
}

const envCheck_get = defineEventHandler((event) => {
  const user = requireSession(event, "admin");
  if (!isSuperAdmin(user)) {
    throw publicError(403, "Solo superadmin puede revisar el entorno.");
  }
  setHeader(event, "Cache-Control", "private, no-store");
  return buildEnvChecklist();
});

const envCheck_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: envCheck_get
}, Symbol.toStringTag, { value: 'Module' }));

const SUPER_ADMIN_EMAIL = "desarrollo.tecnologico@casitaiedis.edu.mx";
function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}
function isConfiguredSuperAdminEmail(email) {
  return normalizeEmail(email) === SUPER_ADMIN_EMAIL;
}

const baseUserSql = `
  SELECT
    A.id,
    A.email,
    A.username,
    A.password,
    A.plaintext AS pwd,
    A.picture,
    A.role,
    B.route,
    B.icono,
    A.displayName,
    NULL AS plantel,
    A.campus,
    A.empresa,
    A.unidad,
    A.sala,
    EXISTS(SELECT 1 FROM alumno_pa AP WHERE AP.user_id = A.id LIMIT 1) AS has_alumno_pa,
    EXISTS(SELECT 1 FROM personas_autorizadas PA WHERE PA.user_id = A.id LIMIT 1) AS has_personas_autorizadas
  FROM users AS A
  LEFT JOIN rutas_rol AS B ON (FIND_IN_SET(B.role, REPLACE(COALESCE(A.role, ''), ' ', '')) > 0)
`;
async function findLegacyUserByEmail(email) {
  const rows = await legacyQuery(`${baseUserSql} WHERE A.email = ?`, [email]);
  return hydrateUserRows(rows);
}
async function findLegacyUserById(id) {
  const rows = await legacyQuery(`${baseUserSql} WHERE A.id = ?`, [id]);
  return hydrateUserRows(rows);
}
async function findLegacyFamilyByLogin(login) {
  const rows = await legacyQuery(`${baseUserSql} WHERE A.email = ? OR A.username = ?`, [login, login]);
  return hydrateUserRows(rows);
}
async function findLegacyFamilyByEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  const rows = await legacyQuery(`${baseUserSql} WHERE LOWER(A.email) = ?`, [normalized]);
  const legacyUser = hydrateUserRows(rows);
  if (!legacyUser) return null;
  const sessionUser = legacyUser.toSession("family");
  return sessionUser.productScopes.length ? legacyUser : null;
}
async function findLegacyFamilyById(id) {
  if (!Number.isFinite(id)) return null;
  const legacyUser = await findLegacyUserById(id);
  if (!legacyUser) return null;
  const sessionUser = legacyUser.toSession("family");
  return sessionUser.productScopes.length ? legacyUser : null;
}
async function validateLegacyPassword(candidate, user) {
  if (!candidate) return false;
  if (user.password && /^\$2[ayb]\$/.test(user.password)) {
    return bcrypt.compare(candidate, user.password);
  }
  if (user.password && user.password === candidate) return true;
  if (user.pwd && candidate === user.pwd) return true;
  return false;
}
async function hashLegacyPassword(password) {
  return bcrypt.hash(password, 12);
}
async function updateLegacyFamilyPassword(userId, password) {
  const passwordHash = await hashLegacyPassword(password);
  await legacyWrite("UPDATE users SET password = ?, plaintext = NULL WHERE id = ?", [passwordHash, userId]);
}
async function updateLegacyDisplayName(userId, displayName) {
  await legacyWrite("UPDATE users SET displayName = ? WHERE id = ?", [displayName, userId]);
}
async function getAllDaycareUnidades() {
  const rows = await legacyQuery(
    `SELECT DISTINCT unidad
     FROM salas
     WHERE unidad IS NOT NULL AND unidad <> ''
     ORDER BY unidad ASC`
  );
  return rows.map((row) => String(row.unidad || "").trim()).filter(Boolean);
}
async function createSuperAdminSession(input, legacyUser) {
  const unidades = await getAllDaycareUnidades();
  const fromLegacy = legacyUser.toSession("admin");
  const routes = fromLegacy.routes;
  const session = {
    id: fromLegacy.id,
    kind: "admin",
    isSuperAdmin: true,
    email: normalizeEmail(input.email),
    username: fromLegacy.username,
    displayName: input.displayName || fromLegacy.displayName,
    picture: input.picture || fromLegacy.picture,
    campus: fromLegacy.campus,
    empresa: fromLegacy.empresa,
    sala: fromLegacy.sala,
    roles: fromLegacy.roles,
    unidades: unidades.length ? unidades : fromLegacy.unidades,
    plantel: fromLegacy.plantel,
    routes,
    productScopes: [],
    scopes: {},
    anonymous: false,
    loggedin: true
  };
  return session;
}
function hydrateUserRows(rows) {
  const first = rows[0];
  if (!first) return null;
  const routes = rows.filter((row) => row.route).map((row) => ({ route: String(row.route), icono: row.icono }));
  return {
    raw: first,
    toSession(kind) {
      const roles = csvToList(first.role);
      const unidades = csvToList(first.unidad);
      const plantel = csvToList(first.plantel);
      const familyScopes = kind === "family" ? resolveFamilyProductScopes(first, routes, roles, unidades) : {};
      const productScopes = Object.keys(familyScopes);
      const email = normalizeEmail(first.email);
      return {
        id: Number(first.id),
        kind,
        isSuperAdmin: kind === "admin" && isConfiguredSuperAdminEmail(email),
        email,
        username: first.username,
        displayName: first.displayName,
        picture: first.picture,
        campus: first.campus,
        empresa: first.empresa,
        sala: first.sala,
        roles,
        unidades,
        plantel,
        routes,
        productScopes,
        scopes: familyScopes,
        anonymous: false,
        loggedin: true
      };
    }
  };
}
function resolveFamilyProductScopes(row, routes, roles, unidades) {
  var _a;
  const scopes = {};
  const sala = normalizeLegacyScope(row.sala);
  const unidad = unidades[0];
  const hasDaycareRole = hasRoleToken(roles, DAYCARE_FAMILY_ROLE);
  if (hasDaycareRole && sala && unidad) {
    scopes.daycare = { product: "daycare", sala, unidad };
  }
  const hasPersonasRoute = routes.some((route) => /personas[_/-]?autorizadas|persona[-_]?autorizada|credencial|validar/i.test(route.route));
  const hasPersonasData = Number(row.has_alumno_pa) === 1 || Number(row.has_personas_autorizadas) === 1;
  if (hasPersonasRoute || hasPersonasData) {
    scopes.personasAutorizadas = {
      product: "personasAutorizadas",
      legacyRoute: ((_a = routes.find((route) => /personas[_/-]?autorizadas|persona[-_]?autorizada|credencial|validar/i.test(route.route))) == null ? void 0 : _a.route) || null
    };
  }
  return scopes;
}
function normalizeLegacyScope(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}
async function listSuperAdminDirectory(filters = {}) {
  const plantel = normalizeLegacyScope(filters.plantel);
  const search = normalizeLegacyScope(filters.search);
  const scope = filters.scope || "all";
  const limit = Math.min(Math.max(Number(filters.limit || 120), 25), 250);
  const queryLimit = limit;
  const where = [];
  const params = [];
  const scopePredicate = directoryScopePredicate(scope);
  if (scopePredicate) where.push(scopePredicate);
  if (plantel) {
    where.push(`(
      FIND_IN_SET(?, A.unidad) OR A.unidad = ? OR A.campus = ? OR A.empresa = ?
    )`);
    params.push(plantel, plantel, plantel, plantel);
  }
  if (search) {
    where.push(`(
      A.email LIKE ? OR A.username LIKE ? OR A.displayName LIKE ? OR A.nombre_nino LIKE ? OR
      A.role LIKE ? OR A.sala LIKE ? OR A.unidad LIKE ? OR A.campus LIKE ? OR A.empresa LIKE ?
    )`);
    const like = `%${search}%`;
    params.push(like, like, like, like, like, like, like, like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = await legacyQuery(
    `SELECT
      A.id,
      A.email,
      A.username,
      A.picture,
      A.role,
      A.displayName,
      NULL AS plantel,
      A.campus,
      A.empresa,
      A.unidad,
      A.sala,
      A.nombre_nino
     FROM users AS A
     ${whereSql}
     ORDER BY COALESCE(NULLIF(A.unidad, ''), A.campus, A.empresa, '') ASC, A.id DESC
     LIMIT ${queryLimit}`,
    params
  );
  const userIds = rows.map((row) => Number(row.id)).filter((id) => Number.isFinite(id));
  const routeMap = await loadDirectoryRoutes(rows);
  const personasUserIds = await loadPersonasAutorizadasUserIds(userIds);
  const alumnoUserIds = await loadAlumnoPaUserIds(userIds);
  const plantelRows = await legacyQuery(
    `SELECT NULL AS plantel, unidad, campus
     FROM users
     WHERE unidad IS NOT NULL OR campus IS NOT NULL
     ORDER BY unidad ASC, campus ASC
     LIMIT 5000`
  );
  const users = rows.map((row) => directoryRowToSummary({
    ...row,
    routes: routesForDirectoryRow(row, routeMap).join("||"),
    has_alumno_pa: alumnoUserIds.has(Number(row.id)) ? 1 : 0,
    has_personas_autorizadas: personasUserIds.has(Number(row.id)) ? 1 : 0
  }));
  const visibleUsers = filterDirectoryUsersByScope(users, scope).slice(0, limit);
  const planteles = Array.from(new Set(plantelRows.flatMap((row) => [
    ...csvToList(row.plantel),
    ...csvToList(row.unidad),
    normalizeLegacyScope(row.campus)
  ]).filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"));
  return {
    planteles,
    users: visibleUsers,
    metrics: {
      total: visibleUsers.length,
      familyUsers: visibleUsers.filter((user) => user.productScopes.length > 0).length,
      daycareFamilies: visibleUsers.filter((user) => user.productScopes.includes("daycare")).length,
      schoolFamilies: visibleUsers.filter((user) => user.productScopes.includes("personasAutorizadas")).length,
      internalUsers: visibleUsers.filter((user) => user.audience === "internal" || user.adminScopes.length).length,
      daycareAdmins: visibleUsers.filter((user) => user.adminScopes.includes("daycare")).length,
      impersonable: visibleUsers.filter((user) => user.canImpersonate).length
    },
    filters: {
      plantel: plantel || "",
      search: search || "",
      scope,
      limit
    }
  };
}
async function loadDirectoryRoutes(rows) {
  const roles = Array.from(new Set(rows.flatMap((row) => csvToList(row.role))));
  if (!roles.length) return /* @__PURE__ */ new Map();
  const placeholders = roles.map(() => "?").join(",");
  const routeRows = await legacyQuery(
    `SELECT role, route FROM rutas_rol WHERE role IN (${placeholders}) ORDER BY route ASC`,
    roles
  );
  const routeMap = /* @__PURE__ */ new Map();
  for (const row of routeRows) {
    const role = normalizeLegacyScope(row.role);
    const route = normalizeLegacyScope(row.route);
    if (!role || !route) continue;
    const existing = routeMap.get(role) || [];
    existing.push(route);
    routeMap.set(role, existing);
  }
  return routeMap;
}
function routesForDirectoryRow(row, routeMap) {
  return Array.from(new Set(csvToList(row.role).flatMap((role) => routeMap.get(role) || [])));
}
async function loadPersonasAutorizadasUserIds(userIds) {
  if (!userIds.length) return /* @__PURE__ */ new Set();
  const placeholders = userIds.map(() => "?").join(",");
  const rows = await legacyQuery(
    `SELECT DISTINCT user_id FROM personas_autorizadas WHERE user_id IN (${placeholders})`,
    userIds
  );
  return new Set(rows.map((row) => Number(row.user_id)).filter((id) => Number.isFinite(id)));
}
async function loadAlumnoPaUserIds(userIds) {
  if (!userIds.length) return /* @__PURE__ */ new Set();
  const placeholders = userIds.map(() => "?").join(",");
  const rows = await legacyQuery(
    `SELECT DISTINCT user_id FROM alumno_pa WHERE user_id IN (${placeholders})`,
    userIds
  );
  return new Set(rows.map((row) => Number(row.user_id)).filter((id) => Number.isFinite(id)));
}
function directoryScopePredicate(scope) {
  if (scope === "daycare") {
    return `(
      FIND_IN_SET('${DAYCARE_FAMILY_ROLE}', REPLACE(COALESCE(A.role, ''), ' ', '')) > 0 AND
      A.sala IS NOT NULL AND TRIM(CAST(A.sala AS CHAR)) <> '' AND
      A.unidad IS NOT NULL AND TRIM(CAST(A.unidad AS CHAR)) <> ''
    )`;
  }
  if (scope === "schoolFamilies") {
    return `(
      A.id IN (SELECT DISTINCT user_id FROM personas_autorizadas WHERE user_id IS NOT NULL) OR
      A.id IN (SELECT DISTINCT user_id FROM alumno_pa WHERE user_id IS NOT NULL)
    )`;
  }
  if (scope === "impersonable") {
    return `(
      (
        FIND_IN_SET('${DAYCARE_FAMILY_ROLE}', REPLACE(COALESCE(A.role, ''), ' ', '')) > 0 AND
        A.sala IS NOT NULL AND TRIM(CAST(A.sala AS CHAR)) <> '' AND
        A.unidad IS NOT NULL AND TRIM(CAST(A.unidad AS CHAR)) <> ''
      ) OR
      A.id IN (SELECT DISTINCT user_id FROM personas_autorizadas WHERE user_id IS NOT NULL) OR
      A.id IN (SELECT DISTINCT user_id FROM alumno_pa WHERE user_id IS NOT NULL)
    )`;
  }
  if (scope === "internal") {
    return `(
      A.role IS NOT NULL AND TRIM(CAST(A.role AS CHAR)) <> '' AND
      A.role <> '${DAYCARE_FAMILY_ROLE}'
    )`;
  }
  return "";
}
function filterDirectoryUsersByScope(users, scope) {
  if (scope === "daycare") return users.filter((user) => user.productScopes.includes("daycare"));
  if (scope === "schoolFamilies") return users.filter((user) => user.productScopes.includes("personasAutorizadas"));
  if (scope === "internal") return users.filter((user) => user.audience === "internal" || user.adminScopes.length);
  if (scope === "impersonable") return users.filter((user) => user.canImpersonate);
  return users;
}
function directoryRowToSummary(row) {
  const roles = csvToList(row.role);
  const unidad = csvToList(row.unidad);
  const plantel = csvToList(row.plantel);
  const routes = String(row.routes || "").split("||").map((route) => route.trim()).filter(Boolean);
  const hasDaycareFamilyRole = hasRoleToken(roles, DAYCARE_FAMILY_ROLE);
  const hasDaycareInternalRole = hasRoleToken(roles, DAYCARE_ADMIN_ROLE);
  const hasDaycareAdminRoute = routes.some((route) => /guarder[ií]a|husky|daycare/i.test(route));
  const hasPersonasRoute = routes.some((route) => /personas[_/-]?autorizadas|persona[-_]?autorizada|credencial|validar/i.test(route));
  const hasPersonasData = Number(row.has_alumno_pa) === 1 || Number(row.has_personas_autorizadas) === 1;
  const productScopes = [];
  if (hasDaycareFamilyRole && unidad.length && normalizeLegacyScope(row.sala)) productScopes.push("daycare");
  if (hasPersonasRoute || hasPersonasData) productScopes.push("personasAutorizadas");
  const adminScopes = [];
  if ((hasDaycareInternalRole || hasDaycareAdminRoute) && unidad.length) adminScopes.push("daycare");
  let audience = "unknown";
  if (productScopes.length > 1) audience = "multiProductFamily";
  else if (productScopes.includes("daycare")) audience = "daycareFamily";
  else if (productScopes.includes("personasAutorizadas")) audience = "schoolFamily";
  else if (adminScopes.length || roles.some((role) => !hasRoleToken([role], DAYCARE_FAMILY_ROLE)) || routes.length) audience = "internal";
  return {
    id: Number(row.id),
    email: normalizeLegacyScope(row.email),
    username: displayMatriculaCandidate(normalizeLegacyScope(row.username)),
    displayName: normalizeLegacyScope(row.displayName),
    picture: normalizeLegacyScope(row.picture),
    role: normalizeLegacyScope(row.role),
    plantel,
    campus: normalizeLegacyScope(row.campus),
    empresa: normalizeLegacyScope(row.empresa),
    unidad,
    sala: normalizeLegacyScope(row.sala),
    nombre_nino: normalizeLegacyScope(row.nombre_nino),
    routes,
    productScopes,
    adminScopes,
    audience,
    canImpersonate: productScopes.length > 0
  };
}

const schema$s = z.object({
  plantel: z.string().optional().default(""),
  search: z.string().optional().default(""),
  scope: z.enum(["all", "daycare", "schoolFamilies", "internal", "impersonable"]).optional().default("all"),
  limit: z.coerce.number().int().min(25).max(250).optional().default(120)
});
const users_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  if (!isSuperAdmin(user)) {
    throw publicError(403, "Solo superadmin puede consultar el directorio de usuarios.");
  }
  const query = schema$s.parse(getQuery$1(event));
  return listSuperAdminDirectory(query);
});

const users_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: users_get
}, Symbol.toStringTag, { value: 'Module' }));

const schema$r = z.object({ credential: z.string().min(1) });
const google_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  if (!config.googleClientId) {
    throw publicError(500, "GOOGLE_CLIENT_ID no est\xE1 configurado.");
  }
  const body = schema$r.parse(await readBody(event));
  const client = new OAuth2Client(config.googleClientId);
  const ticket = await client.verifyIdToken({ idToken: body.credential, audience: config.googleClientId });
  const payload = ticket.getPayload();
  const email = normalizeEmail(payload == null ? void 0 : payload.email);
  if (!email.endsWith("@casitaiedis.edu.mx")) {
    throw publicError(403, "El correo no pertenece a la instituci\xF3n.");
  }
  const legacyUser = await findLegacyUserByEmail(email);
  let sessionUser;
  if (!legacyUser) {
    throw publicError(401, "No hay ninguna cuenta interna creada con ese correo.");
  }
  if ((payload == null ? void 0 : payload.name) && payload.name !== legacyUser.raw.displayName) {
    await updateLegacyDisplayName(Number(legacyUser.raw.id), payload.name);
    legacyUser.raw.displayName = payload.name;
  }
  if (isConfiguredSuperAdminEmail(email)) {
    sessionUser = await createSuperAdminSession({ email, displayName: payload == null ? void 0 : payload.name, picture: payload == null ? void 0 : payload.picture }, legacyUser);
  } else {
    sessionUser = legacyUser.toSession("admin");
    if ((payload == null ? void 0 : payload.picture) && !sessionUser.picture) sessionUser.picture = payload.picture;
  }
  assertDaycareAdmin(sessionUser);
  setAppSession(event, sessionUser);
  setCookie(event, "user_segment", "internal", { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  setCookie(event, "ads_suppressed", "true", { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  setCookie(event, "last_login_type", "google", { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  return { user: sessionUser, loggedin: true, defaultPath: sessionUser.isSuperAdmin ? "/admin/superadmin" : "/admin/daycare/salas" };
});

const google_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: google_post
}, Symbol.toStringTag, { value: 'Module' }));

function adminOrigin(user) {
  return {
    id: user.id,
    kind: "admin",
    isSuperAdmin: user.isSuperAdmin,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    picture: user.picture,
    campus: user.campus,
    empresa: user.empresa,
    sala: user.sala,
    roles: user.roles,
    unidades: user.unidades,
    plantel: user.plantel,
    routes: user.routes,
    productScopes: [],
    scopes: {},
    anonymous: false,
    loggedin: true
  };
}

const schema$q = z.object({ userId: z.coerce.number().int().positive() });
const impersonate_post = defineEventHandler(async (event) => {
  const current = getAppSession(event).user;
  if (!current) throw publicError(401, "Sesi\xF3n no v\xE1lida");
  if (!isSuperAdmin(current)) {
    throw publicError(403, "La impersonaci\xF3n de cuentas est\xE1 reservada para superadmin");
  }
  const body = schema$q.parse(await readBody(event));
  const legacyUser = await findLegacyUserById(body.userId);
  if (!legacyUser) throw publicError(404, "Cuenta familiar no encontrada");
  const familyUser = legacyUser.toSession("family");
  if (!familyUser.productScopes.length) {
    throw publicError(403, "La cuenta no tiene acceso familiar habilitado");
  }
  familyUser.impersonation = {
    startedAt: Date.now(),
    mode: "account",
    admin: adminOrigin(current)
  };
  setAppSession(event, familyUser);
  setCookie(event, "user_segment", familyUser.productScopes.includes("daycare") ? "guarderia" : "escolar", { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  return { user: familyUser, loggedin: true };
});

const impersonate_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: impersonate_post
}, Symbol.toStringTag, { value: 'Module' }));

const AUTHORIZE_RECAPTURE_MESSAGE = "Para corregir una persona autorizada, primero anula el registro y captura uno nuevo.";
function assertFamilyOwner(user, ownerId) {
  if (String(user.id) !== String(ownerId)) {
    throw publicError(403, "Registro fuera del alcance de la cuenta familiar");
  }
}
function normalizeString(value) {
  if (value === void 0 || value === null) return null;
  const normalized = String(value).trim();
  return normalized || null;
}
const LIGHTWEIGHT_PHOTO_MAX_BYTES = 2048;
function lightweightPhotoSelect(column) {
  return `CASE
    WHEN NULLIF(${column}, '') IS NULL THEN NULL
    WHEN ${column} LIKE 'data:%' THEN NULL
    WHEN OCTET_LENGTH(${column}) > ${LIGHTWEIGHT_PHOTO_MAX_BYTES} THEN NULL
    ELSE ${column}
  END`;
}
const PARENT_EDITABLE_STUDENT_FIELDS = [
  "curp",
  "nombres",
  "apellido_paterno",
  "apellido_materno",
  "fecha_nacimiento",
  "lugar_nacimiento",
  "sexo",
  "talla",
  "peso",
  "tipo_sangre",
  "alergias",
  "nombre_padre",
  "apellido_paterno_padre",
  "apellido_materno_padre",
  "lugar_trabajo_padre",
  "puesto_padre",
  "email_padre",
  "telefono_padre",
  "estado_civil_padre",
  "fecha_nacimiento_padre",
  "curp_padre",
  "ine_padre",
  "nombre_madre",
  "apellido_paterno_madre",
  "apellido_materno_madre",
  "lugar_trabajo_madre",
  "puesto_madre",
  "email_madre",
  "telefono_madre",
  "estado_civil_madre",
  "fecha_nacimiento_madre",
  "curp_madre",
  "ine_madre",
  "domicilio_calle",
  "domicio_num",
  "domicilio_colonia",
  "domicilio_cp",
  "domicilio_municipio"
];
const STUDENT_READONLY_FIELDS = [
  "matricula",
  "nivel",
  "grado",
  "grupo",
  "ciclo",
  "servicio",
  "baja",
  "status",
  "foto",
  "updated_at"
];
function assertFamilyMatricula(user) {
  const matricula = normalizeMatricula(user.username);
  if (!matricula) throw publicError(403, "La cuenta familiar no tiene matr\xEDcula vinculada.");
  return matricula;
}
function derivePlantelFromMatricula(matricula, _nivel, fallback) {
  const username = normalizeMatricula(matricula);
  if (username.startsWith("PREEM")) return "PREEM";
  if (username.startsWith("PREET")) return "PREET";
  if (username.startsWith("PM")) return "PM";
  if (username.startsWith("PT")) return "PT";
  if (username.startsWith("SM")) return "SM";
  if (username.startsWith("ST")) return "ST";
  if (username.startsWith("DM")) return "CM";
  const prefix = username.slice(0, 2);
  return prefix || normalizeString(fallback) || null;
}
const REQUIRED_PARENT_NAME_FIELDS = [
  "nombre_padre",
  "apellido_paterno_padre",
  "apellido_materno_padre",
  "nombre_madre",
  "apellido_paterno_madre",
  "apellido_materno_madre"
];
const PARENT_SIGNATURE_COLUMN = "hp_parent_signature";
function normalizeFamilyName(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9\s]/g, " ").replace(/\s+/g, " ").trim().toUpperCase();
}
function completeParentSignature(row) {
  if (!row) return null;
  const values = Object.fromEntries(REQUIRED_PARENT_NAME_FIELDS.map((field) => [field, normalizeFamilyName(row[field])]));
  if (REQUIRED_PARENT_NAME_FIELDS.some((field) => !values[field])) return null;
  const father = [values.nombre_padre, values.apellido_paterno_padre, values.apellido_materno_padre].join(" ");
  const mother = [values.nombre_madre, values.apellido_paterno_madre, values.apellido_materno_madre].join(" ");
  return `${father}|${mother}`;
}
function mapMatriculaChild(row, currentMatricula, fallbackCampus) {
  const matricula = normalizeMatricula(row.matricula) || null;
  const isCurrent = matricula === currentMatricula;
  return {
    id: row.user_id ? Number(row.user_id) : null,
    paternoA: row.apellido_paterno || null,
    maternoA: row.apellido_materno || null,
    nombreA: row.nombres || null,
    grupo: row.grupo || null,
    grado: row.grado || null,
    nivelEdu: row.nivel || null,
    campus: row.campus || fallbackCampus || null,
    plantel: derivePlantelFromMatricula(matricula, row.nivel, row.campus || fallbackCampus),
    matricula,
    foto: row.foto || null,
    fechaA: null,
    user_id: row.user_id ? Number(row.user_id) : null,
    isCurrent,
    canSwitch: Boolean(!isCurrent && row.user_id && matricula),
    siblingMatch: isCurrent ? "current" : "parents"
  };
}
function pickStudentProfile(row, plantel, allowedFields = PARENT_EDITABLE_STUDENT_FIELDS) {
  var _a, _b;
  const readonly = { plantel: plantel || null };
  const editable = {};
  for (const field of STUDENT_READONLY_FIELDS) readonly[field] = (_a = row == null ? void 0 : row[field]) != null ? _a : null;
  for (const field of allowedFields) editable[field] = (_b = row == null ? void 0 : row[field]) != null ? _b : null;
  readonly.matricula = normalizeMatricula(readonly.matricula) || null;
  return {
    readonly,
    editable,
    allowedFields: [...allowedFields],
    meta: { updatedAt: (row == null ? void 0 : row.updated_at) ? String(row.updated_at) : null }
  };
}
function isHiddenValue(value) {
  if (value === void 0 || value === null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  const normalized = String(value).trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "hidden";
}
let matriculaColumnCache = null;
const loggedMissingMatriculaColumns = /* @__PURE__ */ new Set();
let usersColumnCache = null;
const loggedMissingUserColumns = /* @__PURE__ */ new Set();
function quoteIdentifier(identifier) {
  return `\`${identifier.replace(/`/g, "``")}\``;
}
async function getMatriculaColumnSet() {
  if (matriculaColumnCache) return matriculaColumnCache;
  try {
    const rows = await legacyQuery("SHOW COLUMNS FROM matricula");
    matriculaColumnCache = new Set(rows.map((row) => String(row.Field || "").trim()).filter(Boolean));
    if (!matriculaColumnCache.has("matricula")) {
      logPersonasWarning("matricula-schema-missing-primary-column", { table: "matricula", requiredColumn: "matricula" });
      throw publicError(500, "La tabla de matr\xEDcula no tiene la columna requerida.");
    }
    return matriculaColumnCache;
  } catch {
    throw publicError(500, "No fue posible validar la estructura de matr\xEDcula.");
  }
}
async function getUsersColumnSet() {
  if (usersColumnCache) return usersColumnCache;
  try {
    const rows = await legacyQuery("SHOW COLUMNS FROM users");
    usersColumnCache = new Set(rows.map((row) => String(row.Field || "").trim()).filter(Boolean));
    if (!usersColumnCache.has("id") || !usersColumnCache.has("username")) {
      logPersonasWarning("users-schema-missing-primary-columns", { table: "users", requiredColumns: ["id", "username"] });
      throw publicError(500, "La tabla de usuarios no tiene columnas requeridas.");
    }
    return usersColumnCache;
  } catch {
    throw publicError(500, "No fue posible validar la estructura de usuarios.");
  }
}
function usersSelect(columns, field, alias = "u") {
  if (!columns.has(field)) {
    const key = `users:${field}`;
    if (!loggedMissingUserColumns.has(key)) {
      loggedMissingUserColumns.add(key);
      logPersonasWarning("users-schema-missing-column", { table: "users", missingColumn: field });
    }
    return "NULL";
  }
  return `${alias}.${quoteIdentifier(field)}`;
}
function existingColumns(columns, fields, scope) {
  const missing = fields.filter((field) => !columns.has(field));
  if (missing.length) {
    const key = `${scope}:${missing.join(",")}`;
    if (!loggedMissingMatriculaColumns.has(key)) {
      loggedMissingMatriculaColumns.add(key);
      logPersonasDebug("matricula-schema-missing-columns", { scope, missingColumns: missing, table: "matricula" });
    }
  }
  return fields.filter((field) => columns.has(field));
}
function matriculaSelect(columns, field, alias = "m") {
  return columns.has(field) ? `${alias}.${quoteIdentifier(field)}` : `NULL`;
}
function missingRequiredParentFields(row) {
  if (!row) return [...REQUIRED_PARENT_NAME_FIELDS];
  return REQUIRED_PARENT_NAME_FIELDS.filter((field) => !normalizeFamilyName(row[field]));
}
async function getSalasForUnidad(user, unidad) {
  assertUnidadAccess(user, unidad);
  const rows = await legacyQuery("SELECT id, sala, unidad FROM salas WHERE unidad = ? ORDER BY id ASC", [unidad]);
  return rows.map((row) => ({ id: Number(row.id), sala: row.sala, unidad: row.unidad }));
}
async function getSalaById(user, salaId) {
  assertSalaAccess(user, salaId);
  const sala = await legacyOne("SELECT id, sala, unidad FROM salas WHERE id = ? LIMIT 1", [salaId]);
  if (!sala) throw publicError(404, "Sala no encontrada");
  assertUnidadAccess(user, sala.unidad);
  return { id: Number(sala.id), sala: sala.sala, unidad: sala.unidad };
}
async function getFamilyDashboard(user) {
  var _a, _b;
  const unidad = (_a = user.scopes.daycare) == null ? void 0 : _a.unidad;
  const sala = (_b = user.scopes.daycare) == null ? void 0 : _b.sala;
  if (!unidad || !sala) throw publicError(403, "La cuenta no tiene alcance de guarder\xEDa");
  const [tareas, circulares, calendario, valor] = await Promise.all([
    legacyQuery(
      `SELECT *
       FROM recursos
       WHERE type = 'hw' AND sala = ? AND unidad = ? AND hidden = '0'
       ORDER BY id DESC`,
      [sala, unidad]
    ),
    legacyQuery(
      `SELECT *
       FROM recursos
       WHERE type = 'news' AND unidad = ? AND sala = ? AND hidden = '0'
       GROUP BY timestamp
       ORDER BY id DESC`,
      [unidad, sala]
    ),
    legacyQuery(
      `SELECT DISTINCT id, date, title, description,
        CONCAT('<p>', title, '</p>', '</br><p class="truncar">', description, '</p>') AS html,
        resource, starred, autor, unidad, sala, type, timestamp
       FROM recursos
       WHERE type = 'cal' AND unidad = ? AND sala = ? AND DATE(date) >= CURDATE() AND hidden = '0'
       GROUP BY date, title, description, timestamp, sala
       ORDER BY date`,
      [unidad, sala]
    ),
    legacyQuery(`SELECT valor FROM valores_mensuales WHERE mes_en = MONTHNAME(CURDATE())`)
  ]);
  return { tareas, circulares, calendario, valor };
}
async function getEditableStudentProfile(user) {
  const matricula = assertFamilyMatricula(user);
  const columnSet = await getMatriculaColumnSet();
  const readonlyFields = existingColumns(columnSet, STUDENT_READONLY_FIELDS, "student-profile-readonly");
  const editableFields = existingColumns(columnSet, PARENT_EDITABLE_STUDENT_FIELDS, "student-profile-editable");
  const selectFields = Array.from(/* @__PURE__ */ new Set([...readonlyFields, ...editableFields]));
  if (!selectFields.length) {
    logPersonasWarning("student-profile-no-readable-columns", { userId: user.id, matricula });
    throw publicError(500, "No hay campos de matricula configurados para consulta familiar.");
  }
  const columns = selectFields.map(quoteIdentifier).join(", ");
  const row = await legacyOne(`SELECT ${columns} FROM matricula WHERE matricula = ? LIMIT 1`, [matricula]);
  if (!row) {
    logPersonasWarning("student-profile-matricula-not-found", { userId: user.id, matricula });
    throw publicError(404, "No encontramos la matricula vinculada a esta cuenta familiar.");
  }
  const plantel = derivePlantelFromMatricula(matricula, row.nivel, user.campus || user.empresa);
  return pickStudentProfile(row, plantel, editableFields);
}
async function updateEditableStudentProfile(user, patch) {
  const matricula = assertFamilyMatricula(user);
  const columnSet = await getMatriculaColumnSet();
  const entries = Object.entries(patch).filter(([field]) => PARENT_EDITABLE_STUDENT_FIELDS.includes(field));
  if (!entries.length) throw publicError(400, "No hay campos familiares autorizados para guardar.");
  const missingColumns = entries.map(([field]) => field).filter((field) => !columnSet.has(field));
  if (missingColumns.length) {
    logPersonasWarning("student-profile-update-missing-columns", { userId: user.id, matricula, missingColumns });
    throw publicError(400, "Algunos campos familiares no estan disponibles para actualizacion.");
  }
  const assignments = entries.map(([field]) => `${quoteIdentifier(field)} = ?`).join(", ");
  const values = entries.map(([, value]) => normalizeString(value));
  const result = await legacyWrite(`UPDATE matricula SET ${assignments} WHERE matricula = ?`, [...values, matricula]);
  if (!result.affectedRows) {
    logPersonasWarning("student-profile-update-matricula-not-found", { userId: user.id, matricula, updatedFields: entries.map(([field]) => field) });
    throw publicError(404, "No encontramos la matricula vinculada a esta cuenta familiar.");
  }
  return getEditableStudentProfile(user);
}
async function updateStudentCredentialPhoto(user, photoUrl) {
  const matricula = assertFamilyMatricula(user);
  const columnSet = await getMatriculaColumnSet();
  if (!columnSet.has("foto")) {
    logPersonasWarning("student-photo-update-missing-column", { userId: user.id, matricula, missingColumn: "foto", table: "matricula" });
    throw publicError(400, "La foto del alumno no esta disponible para actualizacion.");
  }
  const value = normalizeString(photoUrl);
  if (!value) throw publicError(400, "La foto es obligatoria.");
  const result = await legacyWrite("UPDATE matricula SET foto = ? WHERE matricula = ?", [value, matricula]);
  if (!result.affectedRows) {
    logPersonasWarning("student-photo-update-matricula-not-found", { userId: user.id, matricula });
    throw publicError(404, "No encontramos la matricula vinculada a esta cuenta familiar.");
  }
  return getEditableStudentProfile(user);
}
async function getFamilyResources(user, type) {
  var _a, _b;
  const unidad = (_a = user.scopes.daycare) == null ? void 0 : _a.unidad;
  const sala = (_b = user.scopes.daycare) == null ? void 0 : _b.sala;
  if (!unidad || !sala) throw publicError(403, "La cuenta no tiene alcance de guarder\xEDa");
  if (type === "cal") {
    return legacyQuery(
      `SELECT DISTINCT id, date, title, description,
        CONCAT('<p>', title, '</p>', '</br><p class="truncar">', description, '</p>') AS html,
        resource, starred, autor, unidad, sala, type, timestamp
       FROM recursos
       WHERE type = 'cal' AND unidad = ? AND sala = ? AND DATE(date) >= CURDATE() AND hidden = '0'
       GROUP BY date, title, description, timestamp, sala
       ORDER BY date`,
      [unidad, sala]
    );
  }
  const groupClause = type === "news" ? "GROUP BY timestamp" : "";
  return legacyQuery(
    `SELECT id, starred, title, description, date, timestamp, resource, autor, unidad, sala, type
     FROM recursos
     WHERE type = ? AND sala = ? AND unidad = ? AND hidden = 0
     ${groupClause}
     ORDER BY id DESC`,
    [type, sala, unidad]
  );
}
async function getFamilyChildren(user) {
  const currentMatricula = assertFamilyMatricula(user);
  const columnSet = await getMatriculaColumnSet();
  const userColumnSet = await getUsersColumnSet();
  const currentSelect = [
    `${matriculaSelect(columnSet, "matricula")} AS matricula`,
    `${matriculaSelect(columnSet, "apellido_paterno")} AS apellido_paterno`,
    `${matriculaSelect(columnSet, "apellido_materno")} AS apellido_materno`,
    `${matriculaSelect(columnSet, "nombres")} AS nombres`,
    `${matriculaSelect(columnSet, "grupo")} AS grupo`,
    `${matriculaSelect(columnSet, "grado")} AS grado`,
    `${matriculaSelect(columnSet, "nivel")} AS nivel`,
    `${lightweightPhotoSelect(matriculaSelect(columnSet, "foto"))} AS foto`,
    `${matriculaSelect(columnSet, PARENT_SIGNATURE_COLUMN)} AS parent_signature`,
    ...REQUIRED_PARENT_NAME_FIELDS.map((field) => `${matriculaSelect(columnSet, field)} AS ${field}`),
    `${usersSelect(userColumnSet, "id")} AS user_id`,
    `${usersSelect(userColumnSet, "campus")} AS campus`
  ].join(",\n       ");
  const current = await legacyOne(
    `SELECT
       ${currentSelect}
     FROM matricula m
     LEFT JOIN users u ON u.username = m.matricula
     WHERE m.matricula = ?
     LIMIT 1`,
    [currentMatricula]
  );
  if (!current) {
    logPersonasWarning("siblings-current-matricula-not-found", { userId: user.id, matricula: currentMatricula });
    return [];
  }
  const currentChild = mapMatriculaChild({ ...current, user_id: current.user_id || user.id, campus: current.campus || user.campus }, currentMatricula, user.campus || user.empresa);
  const unavailableCurrent = (context) => [{ ...currentChild, siblingMatch: "unavailable", canSwitch: false, siblingDiagnostics: context }];
  const missingParentColumns = REQUIRED_PARENT_NAME_FIELDS.filter((field) => !columnSet.has(field));
  if (missingParentColumns.length) {
    logPersonasWarning("siblings-required-parent-columns-missing", { userId: user.id, matricula: currentMatricula, missingColumns: missingParentColumns });
    return unavailableCurrent({ code: "missing-parent-columns" });
  }
  const missingParentValues = missingRequiredParentFields(current);
  const signature = completeParentSignature(current);
  if (!signature) {
    logPersonasDebug("siblings-parent-signature-incomplete", { userId: user.id, matricula: currentMatricula, missingFields: missingParentValues });
    return unavailableCurrent({ code: "incomplete-parent-signature", missingFields: missingParentValues });
  }
  if (!columnSet.has(PARENT_SIGNATURE_COLUMN)) {
    logPersonasDebug("siblings-parent-signature-index-missing", { userId: user.id, matricula: currentMatricula, column: PARENT_SIGNATURE_COLUMN });
    return unavailableCurrent({ code: "signature-index-missing" });
  }
  const signatureKey = String(current.parent_signature || "") || signature;
  const candidateSelect = [
    `${matriculaSelect(columnSet, "matricula")} AS matricula`,
    `${matriculaSelect(columnSet, "apellido_paterno")} AS apellido_paterno`,
    `${matriculaSelect(columnSet, "apellido_materno")} AS apellido_materno`,
    `${matriculaSelect(columnSet, "nombres")} AS nombres`,
    `${matriculaSelect(columnSet, "grupo")} AS grupo`,
    `${matriculaSelect(columnSet, "grado")} AS grado`,
    `${matriculaSelect(columnSet, "nivel")} AS nivel`,
    `${lightweightPhotoSelect(matriculaSelect(columnSet, "foto"))} AS foto`,
    `${usersSelect(userColumnSet, "id")} AS user_id`,
    `${usersSelect(userColumnSet, "campus")} AS campus`
  ].join(",\n       ");
  const candidates = await legacyQuery(
    `SELECT
       ${candidateSelect}
     FROM matricula m
     LEFT JOIN users u ON u.username = m.matricula
     WHERE m.${quoteIdentifier(PARENT_SIGNATURE_COLUMN)} = ?
       AND m.matricula <> ?
     ORDER BY m.apellido_paterno ASC, m.apellido_materno ASC, m.nombres ASC
     LIMIT 7`,
    [signatureKey, currentMatricula]
  );
  const seen = /* @__PURE__ */ new Set([currentChild.matricula || String(currentChild.user_id || "")]);
  const children = [
    currentChild,
    ...candidates.map((row) => mapMatriculaChild(row, currentMatricula, user.campus || user.empresa)).filter((child) => {
      const key = child.matricula || String(child.user_id || "");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
  ];
  if (children.length <= 1) {
    logPersonasDebug("siblings-no-additional-matches", { userId: user.id, matricula: currentMatricula, searchedCandidates: candidates.length });
  }
  if (children.length > 6) {
    logPersonasWarning("siblings-parent-signature-review-required", { userId: user.id, matricula: currentMatricula, matchedChildren: children.length });
    return children.map((child) => child.isCurrent ? child : { ...child, canSwitch: false, siblingMatch: "review" });
  }
  return children;
}
async function getAdminResources(user, salaId, type) {
  const sala = await getSalaById(user, salaId);
  const rows = await legacyQuery(
    `SELECT id, starred, hidden, title, description, date, timestamp, resource, autor, unidad, sala, type
     FROM recursos
     WHERE type = ? AND sala = ? AND unidad = ?
     ORDER BY hidden ASC, date DESC, id DESC`,
    [type, salaId, sala.unidad]
  );
  return { sala, rows };
}
async function upsertAdminResource(user, payload) {
  const sala = await getSalaById(user, Number(payload.sala));
  const data = {
    id: payload.id,
    title: payload.title,
    description: payload.description || "",
    date: payload.date || null,
    resource: payload.resource || null,
    autor: payload.autor || user.displayName || user.email,
    unidad: sala.unidad,
    sala: String(sala.id),
    type: payload.type,
    starred: payload.starred ? 1 : 0,
    hidden: isHiddenValue(payload.hidden) ? 1 : 0,
    timestamp: payload.timestamp || (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ")
  };
  if (data.id) {
    const existing = await legacyOne("SELECT id, unidad, sala, type FROM recursos WHERE id = ? LIMIT 1", [data.id]);
    if (!existing) throw publicError(404, "Recurso no encontrado");
    if (String(existing.unidad) !== data.unidad || String(existing.sala) !== data.sala || String(existing.type) !== data.type) {
      throw publicError(403, "Recurso fuera del alcance de esta sala");
    }
    await legacyWrite(
      `UPDATE recursos
       SET title = ?, description = ?, date = ?, resource = ?, autor = ?, starred = ?, hidden = ?, timestamp = ?
       WHERE id = ? AND sala = ? AND unidad = ? AND type = ?`,
      [data.title, data.description, data.date, data.resource, data.autor, data.starred, data.hidden, data.timestamp, data.id, data.sala, data.unidad, data.type]
    );
    return { ...data, id: data.id };
  }
  const result = await legacyWrite(
    `INSERT INTO recursos (title, description, date, resource, autor, unidad, sala, type, starred, hidden, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.title, data.description, data.date, data.resource, data.autor, data.unidad, data.sala, data.type, data.starred, data.hidden, data.timestamp]
  );
  return { ...data, id: result.insertId };
}
async function assertAdminResourceAccess(user, id) {
  const row = await legacyOne("SELECT id, unidad, sala, type FROM recursos WHERE id = ? LIMIT 1", [id]);
  if (!row) throw publicError(404, "Recurso no encontrado");
  assertUnidadAccess(user, String(row.unidad));
  assertSalaAccess(user, String(row.sala));
  return row;
}
async function setAdminResourceHidden(user, id, hidden) {
  await assertAdminResourceAccess(user, id);
  await legacyWrite("UPDATE recursos SET hidden = ? WHERE id = ?", [hidden ? 1 : 0, id]);
  return { ok: true, id, hidden: hidden ? 1 : 0 };
}
async function deleteAdminResource(user, id) {
  await assertAdminResourceAccess(user, id);
  await legacyWrite("DELETE FROM recursos WHERE id = ?", [id]);
  return { ok: true, id };
}
async function getFamilyAccounts(user, salaId) {
  const sala = await getSalaById(user, salaId);
  const rows = await legacyQuery(
    `SELECT id, nombre_nino, username, email, plaintext, role, unidad, sala
     FROM users
     WHERE FIND_IN_SET(?, unidad) AND role LIKE '%HUSKY%' AND sala = ?
     ORDER BY id ASC`,
    [sala.unidad, salaId]
  );
  return { sala, rows };
}
async function upsertFamilyAccount(user, payload) {
  const sala = await getSalaById(user, Number(payload.sala));
  const role = payload.role && payload.role.includes("HUSKY") ? payload.role : "ROLE_HUSKY_USER";
  if (payload.id) {
    const existing = await legacyOne("SELECT id, role, unidad, sala FROM users WHERE id = ? LIMIT 1", [payload.id]);
    if (!existing) throw publicError(404, "Cuenta familiar no encontrada");
    const existingRole = String(existing.role || "").toUpperCase();
    const existingUnidades = String(existing.unidad || "").split(",").map((item) => item.trim()).filter(Boolean);
    const sameSala = String(existing.sala || "") === String(sala.id);
    const sameUnidad = existingUnidades.includes(sala.unidad);
    if (!existingRole.includes("HUSKY") || !sameSala || !sameUnidad) {
      throw publicError(403, "Cuenta familiar fuera del alcance de esta sala");
    }
    await legacyWrite(
      `UPDATE users
       SET nombre_nino = ?, username = ?, email = ?, plaintext = ?, role = ?, unidad = ?, sala = ?
       WHERE id = ?`,
      [payload.nombre_nino || null, payload.username, payload.email, payload.plaintext || null, role, sala.unidad, String(sala.id), payload.id]
    );
    return { ...payload, role, unidad: sala.unidad, sala: String(sala.id) };
  }
  const result = await legacyWrite(
    `INSERT INTO users (nombre_nino, username, email, plaintext, role, unidad, sala)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [payload.nombre_nino || null, payload.username, payload.email, payload.plaintext || null, role, sala.unidad, String(sala.id)]
  );
  return { ...payload, id: result.insertId, role, unidad: sala.unidad, sala: String(sala.id) };
}
async function getAuthorizedPersonas(user) {
  const [peopleRows, children] = await Promise.all([
    legacyQuery(
      `SELECT
         p.id,
         CAST(p.id AS CHAR) qr,
         p.indice,
         p.paternoP,
         p.maternoP,
         p.nombreP,
         p.parenP,
         ${lightweightPhotoSelect("p.foto")} AS foto,
         ${lightweightPhotoSelect("p.compressed_foto")} AS compressed_foto,
         p.fechaP,
         p.user_id
       FROM personas_autorizadas p
       INNER JOIN (
         SELECT MIN(id) AS id
         FROM personas_autorizadas
         WHERE user_id = ? AND indice BETWEEN 1 AND 4
         GROUP BY indice
       ) selected ON selected.id = p.id
       ORDER BY p.indice ASC, p.id ASC`,
      [user.id]
    ),
    getFamilyChildren(user)
  ]);
  const bySlot = /* @__PURE__ */ new Map();
  for (const person of peopleRows) {
    const indice = Number(person.indice);
    if (indice >= 1 && indice <= 4 && !bySlot.has(indice)) bySlot.set(indice, person);
  }
  return [1, 2, 3, 4].map((indice) => {
    const person = bySlot.get(indice);
    return {
      ...person || {},
      indice,
      id: (person == null ? void 0 : person.id) ? Number(person.id) : null,
      children
    };
  });
}
async function upsertAuthorizedPersona(user, payload) {
  const indice = Number(payload.indice || 1);
  if (indice < 1 || indice > 4) {
    throw publicError(400, "\xCDndice de persona autorizada inv\xE1lido");
  }
  const values = {
    paternoP: normalizeString(payload.paternoP),
    maternoP: normalizeString(payload.maternoP),
    nombreP: normalizeString(payload.nombreP),
    parenP: normalizeString(payload.parenP),
    foto: normalizeString(payload.foto),
    compressed_foto: normalizeString(payload.compressed_foto),
    fechaP: normalizeString(payload.fechaP)
  };
  if (payload.id) {
    const existingById = await legacyOne("SELECT id, user_id FROM personas_autorizadas WHERE id = ? LIMIT 1", [payload.id]);
    if (!existingById) throw publicError(404, "Persona autorizada no encontrada");
    assertFamilyOwner(user, existingById.user_id);
    throw publicError(409, AUTHORIZE_RECAPTURE_MESSAGE);
  }
  const existingSlot = await legacyOne("SELECT id, user_id FROM personas_autorizadas WHERE user_id = ? AND indice = ? ORDER BY id ASC LIMIT 1", [user.id, indice]);
  if (existingSlot) {
    assertFamilyOwner(user, existingSlot.user_id);
    throw publicError(409, AUTHORIZE_RECAPTURE_MESSAGE);
  }
  const result = await legacyWrite(
    `INSERT INTO personas_autorizadas (indice, paternoP, maternoP, nombreP, parenP, foto, compressed_foto, fechaP, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [indice, values.paternoP, values.maternoP, values.nombreP, values.parenP, values.foto, values.compressed_foto, values.fechaP, user.id]
  );
  return { ...payload, id: result.insertId, indice, user_id: user.id, qr: String(result.insertId) };
}
async function deleteAuthorizedPersona(user, id) {
  const existing = await legacyOne("SELECT id, user_id FROM personas_autorizadas WHERE id = ? LIMIT 1", [id]);
  if (!existing) throw publicError(404, "Persona autorizada no encontrada");
  assertFamilyOwner(user, existing.user_id);
  await legacyWrite("DELETE FROM personas_autorizadas WHERE id = ? AND user_id = ?", [id, user.id]);
  return { ok: true };
}
async function getCredentialAuthorizedPersona(user, id) {
  var _a;
  const row = await legacyOne(
    `SELECT
       A.id,
       CAST(A.id AS CHAR) AS qr,
       A.indice,
       A.paternoP,
       A.maternoP,
       A.nombreP,
       A.parenP,
       ${lightweightPhotoSelect("A.foto")} AS foto,
       ${lightweightPhotoSelect("A.compressed_foto")} AS compressed_foto,
       A.fechaP,
       A.user_id,
       IFNULL(MAX(IFNULL(m.nivel, B.nivelEdu)), 'preescolar') AS nivelEdu,
       UPPER(MAX(u.username)) AS matricula,
       MAX(CASE
         WHEN LEFT(UPPER(u.username), 5) = 'PREEM' THEN 'PREEM'
         WHEN LEFT(UPPER(u.username), 5) = 'PREET' THEN 'PREET'
         WHEN LEFT(UPPER(u.username), 2) = 'DM' THEN 'CM'
         ELSE LEFT(UPPER(u.username), 2)
       END) AS plantel,
       MAX(CONCAT_WS(' ', IFNULL(m.nombres, B.nombreA), IFNULL(m.apellido_paterno, B.paternoA), IFNULL(m.apellido_materno, B.maternoA))) AS fullnameA,
       MAX(${lightweightPhotoSelect("IFNULL(c.foto, IFNULL(m.foto, B.foto))")}) AS fotoA,
       MAX(IFNULL(m.grado, B.grado)) AS gradoA,
       MAX(IFNULL(m.grupo, B.grupo)) AS grupoA
     FROM personas_autorizadas A
     LEFT JOIN users u ON u.id = A.user_id
     LEFT JOIN alumno_pa B ON A.user_id = B.user_id
     LEFT JOIN matricula m ON UPPER(u.username) = UPPER(m.matricula)
     LEFT JOIN credenciales c ON UPPER(u.username) = UPPER(c.matricula)
     WHERE A.id = ?
     GROUP BY A.id`,
    [id]
  );
  if (!row) throw publicError(404, "Persona autorizada no encontrada");
  assertFamilyOwner(user, row.user_id);
  row.children = await getFamilyChildren(user);
  const currentChild = row.children.find((child) => child.isCurrent) || ((_a = row.children) == null ? void 0 : _a[0]) || null;
  row.child = currentChild;
  row.matricula = normalizeMatricula(row.matricula || (currentChild == null ? void 0 : currentChild.matricula) || user.username) || null;
  row.fullnameA = row.fullnameA || [currentChild == null ? void 0 : currentChild.nombreA, currentChild == null ? void 0 : currentChild.paternoA, currentChild == null ? void 0 : currentChild.maternoA].filter(Boolean).join(" ") || null;
  row.fotoA = row.fotoA || (currentChild == null ? void 0 : currentChild.foto) || null;
  row.gradoA = row.gradoA || (currentChild == null ? void 0 : currentChild.grado) || null;
  row.grupoA = row.grupoA || (currentChild == null ? void 0 : currentChild.grupo) || null;
  row.nivelEdu = row.nivelEdu || (currentChild == null ? void 0 : currentChild.nivelEdu) || null;
  row.plantel = row.plantel || (currentChild == null ? void 0 : currentChild.plantel) || derivePlantelFromMatricula(row.matricula, row.nivelEdu, user.campus || user.empresa);
  return row;
}
async function getScanAuthorizedPersona(id) {
  const fotoP = lightweightPhotoSelect("p.foto");
  const compressedFotoP = lightweightPhotoSelect("p.compressed_foto");
  const rows = await legacyQuery(
    `SELECT
       CONCAT(p.nombreP, ' ', p.paternoP, ' ', p.maternoP) AS fullnameP,
       CASE
         WHEN ${fotoP} IS NOT NULL THEN ${fotoP}
         WHEN ${compressedFotoP} LIKE '%vision=marks-ok%' AND (${compressedFotoP} LIKE 'http%' OR ${compressedFotoP} LIKE '/uploads/%') THEN ${compressedFotoP}
         WHEN ${compressedFotoP} LIKE '%vision=marks-ok%' THEN CONCAT('https://admin.casitaiedis.edu.mx/virtual/', ${compressedFotoP})
         ELSE ''
       END AS fotoP,
       CONCAT(IFNULL(m.nombres, a.nombreA), ' ', IFNULL(m.apellido_paterno, a.paternoA), ' ', IFNULL(m.apellido_materno, a.maternoA)) AS fullnameA,
       MAX(${lightweightPhotoSelect("c.foto")}) AS fotoA,
       IFNULL(m.grado, a.grado) AS gradoA,
       IFNULL(m.grupo, a.grupo) AS grupoA,
       p.parenP AS parentesco,
       UPPER(u.username) AS matricula,
       CASE
         WHEN LEFT(UPPER(u.username), 5) = 'PREEM' THEN 'PREEM'
         WHEN LEFT(UPPER(u.username), 5) = 'PREET' THEN 'PREET'
         WHEN LEFT(UPPER(u.username), 2) = 'DM' THEN 'CM'
         ELSE LEFT(UPPER(u.username), 2)
       END AS plantel,
       SUBSTRING_INDEX(LOWER(a.nivelEdu), ' ', 1) AS nivelEduA
     FROM personas_autorizadas p
     LEFT JOIN users u ON u.id = p.user_id
     LEFT JOIN alumno_pa a ON u.id = a.user_id
     LEFT JOIN matricula m ON u.username = m.matricula
     LEFT JOIN credenciales c ON u.username = c.matricula
     WHERE p.id = ?
     GROUP BY p.id`,
    [id]
  );
  if (!rows.length) throw publicError(404, "No se encontr\xF3 el registro");
  return rows[0];
}
async function getSalaMetrics(sala) {
  const [familyRow, resourceRow] = await Promise.all([
    legacyOne(
      `SELECT COUNT(*) AS familias
       FROM users
       WHERE FIND_IN_SET(?, unidad) AND role LIKE '%HUSKY%' AND sala = ?`,
      [sala.unidad, sala.id]
    ),
    legacyOne(
      `SELECT
        SUM(CASE WHEN type = 'hw' THEN 1 ELSE 0 END) AS tareas,
        SUM(CASE WHEN type = 'news' THEN 1 ELSE 0 END) AS avisos,
        SUM(CASE WHEN type = 'cal' THEN 1 ELSE 0 END) AS calendario,
        COUNT(*) AS totalRecursos,
        MAX(COALESCE(timestamp, date)) AS lastResourceAt
       FROM recursos
       WHERE sala = ? AND unidad = ? AND hidden = 0`,
      [sala.id, sala.unidad]
    )
  ]);
  return {
    familias: Number((familyRow == null ? void 0 : familyRow.familias) || 0),
    tareas: Number((resourceRow == null ? void 0 : resourceRow.tareas) || 0),
    avisos: Number((resourceRow == null ? void 0 : resourceRow.avisos) || 0),
    calendario: Number((resourceRow == null ? void 0 : resourceRow.calendario) || 0),
    totalRecursos: Number((resourceRow == null ? void 0 : resourceRow.totalRecursos) || 0),
    lastResourceAt: (resourceRow == null ? void 0 : resourceRow.lastResourceAt) ? String(resourceRow.lastResourceAt) : null
  };
}
async function getSalasOverviewForUnidad(user, unidad) {
  const salas = await getSalasForUnidad(user, unidad);
  return Promise.all(salas.map(async (sala) => ({
    ...sala,
    metrics: await getSalaMetrics(sala)
  })));
}
async function getSalaOperationalOverview(user, salaId) {
  const sala = await getSalaById(user, salaId);
  const [metrics, latestResources, latestFamilies] = await Promise.all([
    getSalaMetrics(sala),
    legacyQuery(
      `SELECT id, starred, title, description, date, timestamp, resource, autor, unidad, sala, type
       FROM recursos
       WHERE sala = ? AND unidad = ? AND hidden = 0
       ORDER BY id DESC
       LIMIT 6`,
      [sala.id, sala.unidad]
    ),
    legacyQuery(
      `SELECT id, nombre_nino, username, email, plaintext, role, unidad, sala
       FROM users
       WHERE FIND_IN_SET(?, unidad) AND role LIKE '%HUSKY%' AND sala = ?
       ORDER BY id DESC
       LIMIT 5`,
      [sala.unidad, sala.id]
    )
  ]);
  return { sala, metrics, latestResources, latestFamilies };
}

const schema$p = z.object({ sala: z.coerce.number().int().positive() });
const previewDaycare_post = defineEventHandler(async (event) => {
  const admin = getAppSession(event).user;
  if (!admin) throw publicError(401, "Sesi\xF3n no v\xE1lida");
  assertDaycareAdmin(admin);
  const body = schema$p.parse(await readBody(event));
  const sala = await getSalaById(admin, body.sala);
  const familyPreview = {
    id: admin.id,
    kind: "family",
    email: admin.email,
    username: admin.username,
    displayName: `Vista familiar \xB7 ${sala.sala}`,
    picture: admin.picture,
    campus: admin.campus,
    empresa: admin.empresa,
    sala: String(sala.id),
    roles: ["ROLE_HUSKY_USER"],
    unidades: [sala.unidad],
    plantel: admin.plantel,
    routes: [],
    productScopes: ["daycare"],
    scopes: {
      daycare: {
        product: "daycare",
        unidad: sala.unidad,
        sala: String(sala.id)
      }
    },
    impersonation: {
      startedAt: Date.now(),
      mode: "daycarePreview",
      admin: adminOrigin(admin)
    },
    anonymous: false,
    loggedin: true
  };
  setAppSession(event, familyPreview);
  setCookie(event, "user_segment", "guarderia", { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  return { user: familyPreview, loggedin: true };
});

const previewDaycare_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: previewDaycare_post
}, Symbol.toStringTag, { value: 'Module' }));

const exit_post = defineEventHandler((event) => {
  var _a;
  const user = getAppSession(event).user;
  const admin = (_a = user == null ? void 0 : user.impersonation) == null ? void 0 : _a.admin;
  if (!user || !admin) {
    throw publicError(400, "No hay una vista familiar activa");
  }
  setAppSession(event, admin);
  setCookie(event, "user_segment", "internal", { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  return { user: admin, loggedin: true };
});

const exit_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: exit_post
}, Symbol.toStringTag, { value: 'Module' }));

const schema$o = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
  experience: z.enum(["escolar", "guarderia"])
});
const login_post = defineEventHandler(async (event) => {
  const body = schema$o.parse(await readBody(event));
  const legacyUser = await findLegacyFamilyByLogin(body.login.trim());
  if (!legacyUser) {
    throw publicError(401, "Usuario o contrase\xF1a incorrectos.");
  }
  const valid = await validateLegacyPassword(body.password, legacyUser.raw);
  if (!valid) {
    throw publicError(401, "Usuario o contrase\xF1a incorrectos.");
  }
  const sessionUser = legacyUser.toSession("family");
  if (!sessionUser.productScopes.length) {
    throw publicError(403, "La cuenta no tiene un acceso familiar habilitado.");
  }
  const requestedExperience = normalizeExperienceName(body.experience);
  const canUseRequestedExperience = requestedExperience === "guarderia" ? hasFamilyScope(sessionUser, "daycare") : requestedExperience === "escolar" && hasFamilyScope(sessionUser, "personasAutorizadas");
  if (!requestedExperience || !canUseRequestedExperience) {
    logSecurityWarning("identity-login-experience-mismatch", {
      requestedExperience: body.experience,
      resolvedScopes: sessionUser.productScopes,
      userId: sessionUser.id,
      loginHash: securityHash(body.login.trim().toLowerCase())
    });
    throw publicError(403, "Este acceso no corresponde a la cuenta indicada. Revisa que estes entrando desde la experiencia correcta.");
  }
  setAppSession(event, sessionUser);
  setCookie(event, "user_segment", requestedExperience === "guarderia" ? "guarderia" : "escolar", { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  setCookie(event, "last_login_type", "php", { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  return { user: sessionUser, loggedin: true, defaultPath: defaultRouteForExperience(sessionUser, requestedExperience) };
});

const login_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: login_post
}, Symbol.toStringTag, { value: 'Module' }));

const logout_post = defineEventHandler((event) => {
  clearAppSession(event);
  return { ok: true };
});

const logout_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: logout_post
}, Symbol.toStringTag, { value: 'Module' }));

const me_get = defineEventHandler((event) => {
  return getAppSession(event);
});

const me_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: me_get
}, Symbol.toStringTag, { value: 'Module' }));

const rateBuckets = /* @__PURE__ */ new Map();
const CAPTCHA_TTL_MS = 10 * 60 * 1e3;
const MIN_FORM_SECONDS = 3;
const MAX_FORM_MINUTES = 45;
function base64url(input) {
  return Buffer.from(input).toString("base64url");
}
function secret() {
  return String(useRuntimeConfig().sessionSecret || "change-me-before-production");
}
function sign(payload) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}
function verifySignature(payload, signature) {
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
function clientIp$1(event) {
  var _a, _b;
  const forwarded = (_b = (_a = getHeader(event, "x-forwarded-for")) == null ? void 0 : _a.split(",")[0]) == null ? void 0 : _b.trim();
  return forwarded || getHeader(event, "x-real-ip") || event.node.req.socket.remoteAddress || "unknown";
}
function createCaptchaChallenge() {
  const a = randomInt(2, 10);
  const b = randomInt(2, 10);
  const now = Date.now();
  const payload = {
    answer: a + b,
    iat: now,
    exp: now + CAPTCHA_TTL_MS,
    nonce: randomBytes(12).toString("hex")
  };
  const encoded = base64url(JSON.stringify(payload));
  return {
    token: `${encoded}.${sign(encoded)}`,
    question: `${a} + ${b}`,
    expiresAt: payload.exp,
    minSeconds: MIN_FORM_SECONDS
  };
}
function verifyCaptchaChallenge(token, answer) {
  const raw = String(token || "");
  const [payload, signature] = raw.split(".");
  if (!payload || !signature || !verifySignature(payload, signature)) {
    throw publicError(400, "La verificaci\xF3n CAPTCHA no es v\xE1lida.");
  }
  let decoded;
  try {
    decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    throw publicError(400, "La verificaci\xF3n CAPTCHA no es v\xE1lida.");
  }
  if (Date.now() > decoded.exp) {
    throw publicError(400, "La verificaci\xF3n CAPTCHA expir\xF3. Intenta de nuevo.");
  }
  if (Number(answer) !== decoded.answer) {
    throw publicError(400, "La respuesta CAPTCHA no coincide.");
  }
}
function assertRateLimit(key, options) {
  const now = Date.now();
  const previous = (rateBuckets.get(key) || []).filter((time) => now - time < options.windowMs);
  if (previous.length >= options.limit) {
    throw publicError(429, options.message);
  }
  previous.push(now);
  rateBuckets.set(key, previous);
  if (rateBuckets.size > 1e3) {
    for (const [bucketKey, values] of rateBuckets.entries()) {
      const fresh = values.filter((time) => now - time < options.windowMs);
      if (fresh.length) rateBuckets.set(bucketKey, fresh);
      else rateBuckets.delete(bucketKey);
    }
  }
}
function assertRegistrationAntibot(event, input) {
  if (String(input.website || "").trim()) {
    throw publicError(400, "No fue posible validar el registro.");
  }
  const startedAt = Number(input.startedAt || 0);
  const elapsed = Date.now() - startedAt;
  if (!Number.isFinite(startedAt) || elapsed < MIN_FORM_SECONDS * 1e3 || elapsed > MAX_FORM_MINUTES * 60 * 1e3) {
    throw publicError(400, "Vuelve a intentar el registro desde el formulario.");
  }
  verifyCaptchaChallenge(input.captchaToken, input.captchaAnswer);
  const ip = clientIp$1(event);
  const emailKey = String(input.email || "").trim().toLowerCase() || "sin-correo";
  assertRateLimit(`daycare-registration:ip:${ip}`, {
    limit: 6,
    windowMs: 15 * 60 * 1e3,
    message: "Demasiados intentos de registro. Intenta de nuevo m\xE1s tarde."
  });
  assertRateLimit(`daycare-registration:email:${emailKey}`, {
    limit: 3,
    windowMs: 30 * 60 * 1e3,
    message: "Ya recibimos varios intentos para este correo. Intenta de nuevo m\xE1s tarde."
  });
}

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 100;
function validateFamilyPassword(password) {
  const issues = [];
  if (password.length < PASSWORD_MIN_LENGTH) issues.push(`Usa al menos ${PASSWORD_MIN_LENGTH} caracteres.`);
  if (password.length > PASSWORD_MAX_LENGTH) issues.push(`Usa m\xE1ximo ${PASSWORD_MAX_LENGTH} caracteres.`);
  if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(password)) issues.push("Incluye al menos una letra.");
  if (!/\d/.test(password)) issues.push("Incluye al menos un n\xFAmero.");
  if (/^\s|\s$/.test(password)) issues.push("Quita espacios al inicio o al final.");
  return issues;
}
function assertPasswordConfirmation(password, confirmation) {
  if (password !== confirmation) return ["Las contrase\xF1as no coinciden."];
  return validateFamilyPassword(password);
}

const schema$n = z.object({
  currentPassword: z.string().min(1),
  password: z.string().min(1),
  confirmation: z.string().min(1)
});
const change_post = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertRateLimit(`password-change:user:${user.id}`, {
    limit: 8,
    windowMs: 15 * 60 * 1e3,
    message: "Demasiados intentos. Intenta de nuevo m\xE1s tarde."
  });
  const body = schema$n.parse(await readBody(event));
  const issues = assertPasswordConfirmation(body.password, body.confirmation);
  if (issues.length) {
    throw publicError(400, issues[0]);
  }
  if (body.currentPassword === body.password) {
    throw publicError(400, "La nueva contrase\xF1a debe ser diferente.");
  }
  try {
    const legacyUser = await findLegacyFamilyById(Number(user.id));
    if (!legacyUser) {
      logSecurityWarning("password-change-family-account-missing", { userId: user.id });
      throw publicError(403, "La cuenta familiar no est\xE1 disponible.");
    }
    const valid = await validateLegacyPassword(body.currentPassword, legacyUser.raw);
    if (!valid) {
      logSecurityWarning("password-change-current-password-invalid", { userId: user.id });
      throw publicError(400, "La contrase\xF1a actual no coincide.");
    }
    await updateLegacyFamilyPassword(Number(user.id), body.password);
    return { ok: true, message: "Contrase\xF1a actualizada." };
  } catch (error) {
    logSecurityDiagnostic("password-change-failed", error, { userId: user.id });
    throw error;
  }
});

const change_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: change_post
}, Symbol.toStringTag, { value: 'Module' }));

let schemaReady = false;
let devFileStore = false;
const TOKEN_BYTES = 32;
const LEGACY_ACCOUNT_KIND = "family";
const DEV_STORE_PATH = join(process.cwd(), "artifacts", "password-recovery-emails", "dev-token-store.json");
function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
function accountKindForExperience(experience) {
  return `${LEGACY_ACCOUNT_KIND}:${experience}`;
}
function experienceFromAccountKind(value) {
  if (value === "family:escolar") return "escolar";
  if (value === "family:guarderia") return "guarderia";
  return null;
}
function isFamilyRecoveryKind(value) {
  return value === LEGACY_ACCOUNT_KIND || value === "family:escolar" || value === "family:guarderia";
}
function mysqlDateUtc(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}
function parseMysqlUtc(value) {
  if (!value) return null;
  const normalized = String(value).includes("T") ? String(value) : `${String(value).replace(" ", "T")}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}
function clientIp(event) {
  var _a, _b;
  const forwarded = (_b = (_a = getHeader(event, "x-forwarded-for")) == null ? void 0 : _a.split(",")[0]) == null ? void 0 : _b.trim();
  return forwarded || getHeader(event, "x-real-ip") || event.node.req.socket.remoteAddress || "unknown";
}
function tokenTtlMs() {
  var _a;
  const config = useRuntimeConfig();
  const minutes = Number(process.env.PASSWORD_RECOVERY_TOKEN_TTL_MINUTES || ((_a = config.passwordRecovery) == null ? void 0 : _a.tokenTtlMinutes) || 30);
  return Math.max(5, Math.min(minutes, 24 * 60)) * 60 * 1e3;
}
function canUseDevFileStore() {
  var _a;
  const config = useRuntimeConfig();
  return String(process.env.PASSWORD_RECOVERY_EMAIL_MODE || ((_a = config.passwordRecovery) == null ? void 0 : _a.emailMode) || "").toLowerCase() === "preview";
}
function isTokenShape(token) {
  return /^[A-Za-z0-9_-]{32,220}$/.test(token);
}
async function readDevStore() {
  try {
    const content = await readFile(DEV_STORE_PATH, "utf8");
    const parsed = JSON.parse(content);
    return {
      nextId: Number(parsed.nextId || 1),
      rows: Array.isArray(parsed.rows) ? parsed.rows : []
    };
  } catch {
    return { nextId: 1, rows: [] };
  }
}
async function writeDevStore(store) {
  await mkdir(join(process.cwd(), "artifacts", "password-recovery-emails"), { recursive: true });
  await writeFile(DEV_STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}
async function ensurePasswordRecoverySchema() {
  if (schemaReady) return;
  try {
    await legacyWrite(`
      CREATE TABLE IF NOT EXISTS password_recovery_tokens (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT NOT NULL,
        email VARCHAR(190) NOT NULL,
        account_kind VARCHAR(32) NOT NULL DEFAULT 'family',
        token_hash CHAR(64) NOT NULL,
        requested_ip_hash CHAR(64) NULL,
        user_agent_hash CHAR(64) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        used_at DATETIME NULL,
        superseded_at DATETIME NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uq_password_recovery_token_hash (token_hash),
        KEY idx_password_recovery_user_active (user_id, account_kind, used_at, superseded_at, expires_at),
        KEY idx_password_recovery_email_created (email, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    schemaReady = true;
  } catch (error) {
    if (canUseDevFileStore()) {
      devFileStore = true;
      schemaReady = true;
      logSecurityWarning("password-recovery-schema-dev-file-store", { table: "password_recovery_tokens", storePath: DEV_STORE_PATH });
      return;
    }
    logSecurityDiagnostic("password-recovery-schema-init-failed", error, { table: "password_recovery_tokens" });
    throw publicError(500, "No fue posible preparar la recuperaci\xF3n de contrase\xF1a.");
  }
}
async function createPasswordRecoveryToken(input) {
  await ensurePasswordRecoverySchema();
  const expiresAt = new Date(Date.now() + tokenTtlMs());
  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  const tokenHash = hashToken(token);
  const email = input.email.trim().toLowerCase();
  const accountKind = accountKindForExperience(input.experience);
  try {
    if (devFileStore) {
      const store = await readDevStore();
      const now = Date.now();
      store.rows = store.rows.map((row) => {
        var _a;
        const expires = ((_a = parseMysqlUtc(row.expires_at)) == null ? void 0 : _a.getTime()) || 0;
        if (Number(row.user_id) === input.userId && row.account_kind === accountKind && !row.used_at && !row.superseded_at && expires > now) {
          return { ...row, superseded_at: mysqlDateUtc(/* @__PURE__ */ new Date()) };
        }
        return row;
      });
      store.rows.push({
        id: store.nextId,
        user_id: input.userId,
        email,
        account_kind: accountKind,
        token_hash: tokenHash,
        expires_at: mysqlDateUtc(expiresAt),
        used_at: null,
        superseded_at: null,
        created_at: mysqlDateUtc(/* @__PURE__ */ new Date())
      });
      store.nextId += 1;
      await writeDevStore(store);
      return { token, expiresAt };
    }
    await legacyWrite(
      `UPDATE password_recovery_tokens
       SET superseded_at = UTC_TIMESTAMP()
       WHERE user_id = ? AND account_kind = ? AND used_at IS NULL AND superseded_at IS NULL AND expires_at > UTC_TIMESTAMP()`,
      [input.userId, accountKind]
    );
    await legacyWrite(
      `INSERT INTO password_recovery_tokens
       (user_id, email, account_kind, token_hash, requested_ip_hash, user_agent_hash, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        input.userId,
        email,
        accountKind,
        tokenHash,
        securityHash(clientIp(input.event)),
        securityHash(getHeader(input.event, "user-agent") || ""),
        mysqlDateUtc(expiresAt)
      ]
    );
    return { token, expiresAt };
  } catch (error) {
    logSecurityDiagnostic("password-recovery-token-create-failed", error, {
      userId: input.userId,
      emailHash: securityHash(email)
    });
    throw publicError(500, "No fue posible preparar el enlace de recuperaci\xF3n.");
  }
}
async function validatePasswordRecoveryToken(rawToken) {
  const token = String(rawToken || "").trim();
  if (!isTokenShape(token)) return { status: "invalid" };
  await ensurePasswordRecoverySchema();
  try {
    if (devFileStore) {
      const store = await readDevStore();
      const row2 = store.rows.find((candidate) => candidate.token_hash === hashToken(token));
      if (!row2 || !isFamilyRecoveryKind(row2.account_kind)) return { status: "invalid" };
      const experience2 = experienceFromAccountKind(row2.account_kind);
      if (row2.used_at) return { status: "used", row: row2, experience: experience2 };
      if (row2.superseded_at) return { status: "superseded", row: row2, experience: experience2 };
      const expiresAt2 = parseMysqlUtc(row2.expires_at);
      if (!expiresAt2 || expiresAt2.getTime() <= Date.now()) return { status: "expired", row: row2, experience: experience2 };
      return { status: "valid", row: row2, experience: experience2 };
    }
    const row = await legacyOne(
      `SELECT id, user_id, email, account_kind, token_hash, expires_at, used_at, superseded_at, created_at
       FROM password_recovery_tokens
       WHERE token_hash = ?
       LIMIT 1`,
      [hashToken(token)]
    );
    if (!row || !isFamilyRecoveryKind(row.account_kind)) return { status: "invalid" };
    const experience = experienceFromAccountKind(row.account_kind);
    if (row.used_at) return { status: "used", row, experience };
    if (row.superseded_at) return { status: "superseded", row, experience };
    const expiresAt = parseMysqlUtc(row.expires_at);
    if (!expiresAt || expiresAt.getTime() <= Date.now()) return { status: "expired", row, experience };
    return { status: "valid", row, experience };
  } catch (error) {
    logSecurityDiagnostic("password-recovery-token-validate-failed", error, { tokenHash: securityHash(token) });
    throw publicError(500, "No fue posible validar el enlace.");
  }
}
function passwordRecoveryStatusMessage(status) {
  if (status === "expired") return "El enlace expir\xF3. Solicita uno nuevo.";
  if (status === "used") return "Este enlace ya fue utilizado.";
  if (status === "superseded") return "Hay un enlace m\xE1s reciente para esta cuenta.";
  if (status === "valid") return "Enlace v\xE1lido.";
  return "El enlace no es v\xE1lido.";
}
async function resetPasswordWithRecoveryToken(rawToken, password) {
  const validation = await validatePasswordRecoveryToken(rawToken);
  if (validation.status !== "valid" || !validation.row) {
    throw publicError(400, passwordRecoveryStatusMessage(validation.status));
  }
  const row = validation.row;
  const familyUser = await findLegacyFamilyById(Number(row.user_id));
  if (!familyUser) {
    logSecurityWarning("password-recovery-family-account-missing", {
      tokenId: row.id,
      userId: row.user_id,
      emailHash: securityHash(row.email)
    });
    throw publicError(400, "El enlace no es v\xE1lido.");
  }
  const sessionUser = familyUser.toSession("family");
  if (validation.experience === "escolar" && !hasFamilyScope(sessionUser, "personasAutorizadas")) {
    logSecurityWarning("password-recovery-experience-mismatch", {
      tokenId: row.id,
      userId: row.user_id,
      tokenExperience: validation.experience,
      scopes: sessionUser.productScopes
    });
    throw publicError(400, "El enlace no es v\xE1lido.");
  }
  if (validation.experience === "guarderia" && !hasFamilyScope(sessionUser, "daycare")) {
    logSecurityWarning("password-recovery-experience-mismatch", {
      tokenId: row.id,
      userId: row.user_id,
      tokenExperience: validation.experience,
      scopes: sessionUser.productScopes
    });
    throw publicError(400, "El enlace no es v\xE1lido.");
  }
  try {
    if (devFileStore) {
      const store = await readDevStore();
      let consumed = false;
      const nowLabel = mysqlDateUtc(/* @__PURE__ */ new Date());
      store.rows = store.rows.map((candidate) => {
        if (Number(candidate.id) === Number(row.id) && candidate.account_kind === row.account_kind && !candidate.used_at && !candidate.superseded_at) {
          const expiresAt = parseMysqlUtc(candidate.expires_at);
          if (expiresAt && expiresAt.getTime() > Date.now()) {
            consumed = true;
            return { ...candidate, used_at: nowLabel };
          }
        }
        return candidate;
      });
      if (!consumed) throw publicError(400, "El enlace ya no est\xE1 disponible.");
      await writeDevStore(store);
    } else {
      const consumed = await legacyWrite(
        `UPDATE password_recovery_tokens
         SET used_at = UTC_TIMESTAMP()
         WHERE id = ? AND account_kind = ? AND used_at IS NULL AND superseded_at IS NULL AND expires_at > UTC_TIMESTAMP()`,
        [row.id, row.account_kind]
      );
      if (consumed.affectedRows !== 1) {
        throw publicError(400, "El enlace ya no est\xE1 disponible.");
      }
    }
    await updateLegacyFamilyPassword(Number(row.user_id), password);
    if (devFileStore) {
      const store = await readDevStore();
      const nowLabel = mysqlDateUtc(/* @__PURE__ */ new Date());
      store.rows = store.rows.map((candidate) => Number(candidate.user_id) === Number(row.user_id) && candidate.account_kind === row.account_kind && Number(candidate.id) !== Number(row.id) && !candidate.used_at ? { ...candidate, superseded_at: candidate.superseded_at || nowLabel } : candidate);
      await writeDevStore(store);
    } else {
      await legacyWrite(
        `UPDATE password_recovery_tokens
         SET superseded_at = COALESCE(superseded_at, UTC_TIMESTAMP())
         WHERE user_id = ? AND account_kind = ? AND id <> ? AND used_at IS NULL`,
        [row.user_id, row.account_kind, row.id]
      );
    }
    return { userId: Number(row.user_id), email: row.email, experience: validation.experience };
  } catch (error) {
    logSecurityDiagnostic("password-recovery-password-update-failed", error, {
      tokenId: row.id,
      userId: row.user_id,
      emailHash: securityHash(row.email)
    });
    throw error;
  }
}

const schema$m = z.object({
  email: z.string().trim().email(),
  experience: z.enum(["escolar", "guarderia"])
});
const neutralMessage = "Si existe una cuenta familiar con ese correo, enviaremos un enlace para restablecer la contrase\xF1a.";
function resetBaseUrl(event) {
  var _a;
  const runtimeBaseUrl = String(process.env.PASSWORD_RECOVERY_BASE_URL || "").trim();
  const configured = String(runtimeBaseUrl || ((_a = useRuntimeConfig().passwordRecovery) == null ? void 0 : _a.baseUrl) || "").trim().replace(/\/+$/, "");
  return configured || getRequestURL(event).origin;
}
const forgot_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const body = schema$m.parse(await readBody(event));
  const email = body.email.toLowerCase();
  const requestedExperience = body.experience;
  const emailHash = securityHash(email);
  const ipKey = securityHash(((_b = (_a = getHeader(event, "x-forwarded-for")) == null ? void 0 : _a.split(",")[0]) == null ? void 0 : _b.trim()) || event.node.req.socket.remoteAddress || "unknown") || "unknown";
  assertRateLimit(`password-recovery:ip:${ipKey}`, {
    limit: 8,
    windowMs: 60 * 60 * 1e3,
    message: "Demasiados intentos. Intenta de nuevo m\xE1s tarde."
  });
  assertRateLimit(`password-recovery:email:${emailHash || "empty"}`, {
    limit: 4,
    windowMs: 60 * 60 * 1e3,
    message: "Demasiados intentos. Intenta de nuevo m\xE1s tarde."
  });
  try {
    const legacyUser = await findLegacyFamilyByEmail(email);
    if (!legacyUser) {
      logSecurityWarning("password-recovery-request-no-family-account", { emailHash });
      return { ok: true, message: neutralMessage };
    }
    const sessionUser = legacyUser.toSession("family");
    const canUseRequestedExperience = requestedExperience === "guarderia" ? hasFamilyScope(sessionUser, "daycare") : requestedExperience === "escolar" && hasFamilyScope(sessionUser, "personasAutorizadas");
    if (!requestedExperience || !canUseRequestedExperience) {
      logSecurityWarning("password-recovery-request-experience-mismatch-neutral-response", {
        requestedExperience: body.experience,
        scopes: sessionUser.productScopes,
        userId: sessionUser.id,
        emailHash
      });
      return { ok: true, message: neutralMessage };
    }
    const recovery = await createPasswordRecoveryToken({
      event,
      userId: Number(sessionUser.id),
      email: sessionUser.email || email,
      experience: requestedExperience
    });
    const resetUrl = `${resetBaseUrl(event)}/restablecer-contrasena?token=${encodeURIComponent(recovery.token)}&experiencia=${encodeURIComponent(requestedExperience)}`;
    const theme = resolvePersonasTheme({
      experience: requestedExperience,
      matricula: sessionUser.username,
      plantel: (_c = sessionUser.plantel) == null ? void 0 : _c[0],
      campus: sessionUser.campus
    });
    try {
      await sendPasswordRecoveryEmail({
        to: sessionUser.email || email,
        displayName: sessionUser.displayName || sessionUser.username || null,
        resetUrl,
        expiresAt: recovery.expiresAt,
        theme,
        loginUrl: `${resetBaseUrl(event)}${defaultLoginRouteForExperience(requestedExperience)}`,
        recoveryUrl: `${resetBaseUrl(event)}${recoveryRouteForExperience(requestedExperience)}`
      });
    } catch (error) {
      logSecurityDiagnostic("password-recovery-delivery-failed-neutral-response", error, {
        userId: sessionUser.id,
        emailHash
      });
    }
  } catch (error) {
    logSecurityDiagnostic("password-recovery-request-failed-neutral-response", error, { emailHash });
  }
  return { ok: true, message: neutralMessage };
});

const forgot_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: forgot_post
}, Symbol.toStringTag, { value: 'Module' }));

const reset_get = defineEventHandler(async (event) => {
  const token = String(getQuery$1(event).token || "");
  const validation = await validatePasswordRecoveryToken(token);
  return {
    status: validation.status,
    valid: validation.status === "valid",
    message: passwordRecoveryStatusMessage(validation.status),
    experience: validation.experience || null,
    loginPath: validation.experience ? defaultLoginRouteForExperience(validation.experience) : "/login",
    recoveryPath: validation.experience ? recoveryRouteForExperience(validation.experience) : "/recuperar-contrasena"
  };
});

const reset_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: reset_get
}, Symbol.toStringTag, { value: 'Module' }));

const schema$l = z.object({
  token: z.string().min(1),
  password: z.string().min(1),
  confirmation: z.string().min(1)
});
const reset_post = defineEventHandler(async (event) => {
  const body = schema$l.parse(await readBody(event));
  const issues = assertPasswordConfirmation(body.password, body.confirmation);
  if (issues.length) {
    throw publicError(400, issues[0]);
  }
  try {
    const result = await resetPasswordWithRecoveryToken(body.token, body.password);
    return {
      ok: true,
      message: "Contrase\xF1a actualizada. Ya puedes iniciar sesi\xF3n.",
      experience: result.experience || null,
      loginPath: result.experience ? defaultLoginRouteForExperience(result.experience) : "/login"
    };
  } catch (error) {
    logSecurityDiagnostic("password-recovery-reset-failed", error, { tokenHash: securityHash(body.token) });
    throw error;
  }
});

const reset_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: reset_post
}, Symbol.toStringTag, { value: 'Module' }));

const schema$k = z.object({ sala: z.coerce.number().int().positive() });
const familyAccounts_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  assertDaycareAdmin(user);
  const query = schema$k.parse(getQuery$1(event));
  return getFamilyAccounts(user, query.sala);
});

const familyAccounts_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: familyAccounts_get
}, Symbol.toStringTag, { value: 'Module' }));

const schema$j = z.object({
  id: z.number().int().positive().optional(),
  nombre_nino: z.string().optional().nullable(),
  username: z.string().min(1),
  email: z.string().email(),
  plaintext: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  unidad: z.string().optional(),
  sala: z.union([z.string(), z.number()])
});
const familyAccounts_post = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  assertDaycareAdmin(user);
  const body = schema$j.parse(await readBody(event));
  return upsertFamilyAccount(user, body);
});

const familyAccounts_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: familyAccounts_post
}, Symbol.toStringTag, { value: 'Module' }));

const schema$i = z.object({
  sala: z.coerce.number().int().positive(),
  type: z.enum(["hw", "news", "cal"])
});
const resources_get$2 = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  assertDaycareAdmin(user);
  const query = schema$i.parse(getQuery$1(event));
  return getAdminResources(user, query.sala, query.type);
});

const resources_get$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: resources_get$2
}, Symbol.toStringTag, { value: 'Module' }));

const schema$h = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  timestamp: z.string().optional().nullable(),
  resource: z.string().optional().nullable(),
  autor: z.string().optional().nullable(),
  unidad: z.string().optional(),
  sala: z.union([z.string(), z.number()]),
  type: z.enum(["hw", "news", "cal"]),
  starred: z.union([z.boolean(), z.number()]).optional().nullable(),
  hidden: z.union([z.boolean(), z.number(), z.string()]).optional().nullable()
});
const resources_post = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  assertDaycareAdmin(user);
  const body = schema$h.parse(await readBody(event));
  return upsertAdminResource(user, body);
});

const resources_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: resources_post
}, Symbol.toStringTag, { value: 'Module' }));

const _id__delete$2 = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  assertDaycareAdmin(user);
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id <= 0) throw publicError(400, "Recurso inv\xE1lido");
  return deleteAdminResource(user, id);
});

const _id__delete$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__delete$2
}, Symbol.toStringTag, { value: 'Module' }));

const schema$g = z.object({ hidden: z.boolean() });
const _id__patch = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  assertDaycareAdmin(user);
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id <= 0) throw publicError(400, "Recurso inv\xE1lido");
  const body = schema$g.parse(await readBody(event));
  return setAdminResourceHidden(user, id, body.hidden);
});

const _id__patch$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__patch
}, Symbol.toStringTag, { value: 'Module' }));

const schema$f = z.object({ unidad: z.string().optional().default("") });
const salas_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  assertDaycareAdmin(user);
  const query = schema$f.parse(getQuery$1(event));
  if (!query.unidad.trim()) return [];
  return getSalasForUnidad(user, query.unidad);
});

const salas_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: salas_get
}, Symbol.toStringTag, { value: 'Module' }));

const _id__get = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  assertDaycareAdmin(user);
  return getSalaById(user, Number(getRouterParam(event, "id")));
});

const _id__get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__get
}, Symbol.toStringTag, { value: 'Module' }));

const overview_get$2 = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  assertDaycareAdmin(user);
  return getSalaOperationalOverview(user, Number(getRouterParam(event, "id")));
});

const overview_get$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: overview_get$2
}, Symbol.toStringTag, { value: 'Module' }));

const schema$e = z.object({ unidad: z.string().optional().default("") });
const overview_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  assertDaycareAdmin(user);
  const query = schema$e.parse(getQuery$1(event));
  const unidad = query.unidad.trim();
  if (!unidad) return [];
  return getSalasOverviewForUnidad(user, unidad);
});

const overview_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: overview_get
}, Symbol.toStringTag, { value: 'Module' }));

const uploads_post = defineEventHandler(async (event) => {
  var _a, _b;
  const user = requireSession(event, "admin");
  assertDaycareAdmin(user);
  const parts = await readMultipartFormData(event);
  if (!(parts == null ? void 0 : parts.length)) throw publicError(400, "Selecciona un archivo para subir.");
  const salaPart = parts.find((part) => part.name === "sala");
  const filePart = parts.find((part) => {
    var _a2;
    return part.name === "file" && ((_a2 = part.data) == null ? void 0 : _a2.length);
  });
  const salaId = Number(((_a = salaPart == null ? void 0 : salaPart.data) == null ? void 0 : _a.toString("utf8")) || 0);
  if (!Number.isInteger(salaId) || salaId <= 0) throw publicError(400, "Sala inv\xE1lida para la carga.");
  if (!((_b = filePart == null ? void 0 : filePart.data) == null ? void 0 : _b.length)) throw publicError(400, "Archivo no recibido.");
  const sala = await getSalaById(user, salaId);
  return uploadToExternalService(
    { data: filePart.data, filename: filePart.filename, type: filePart.type },
    {
      folder: externalUploadFolder("daycare-resource", sala.unidad, `sala-${sala.id}`),
      maxBytes: 8 * 1024 * 1024,
      accept: "imagesAndDocuments",
      filenamePrefix: `recurso-sala-${sala.id}`
    }
  );
});

const uploads_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: uploads_post
}, Symbol.toStringTag, { value: 'Module' }));

const dashboard_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertDaycareFamily(user);
  return getFamilyDashboard(user);
});

const dashboard_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: dashboard_get
}, Symbol.toStringTag, { value: 'Module' }));

const schema$d = z.object({ type: z.enum(["hw", "news", "cal"]) });
const resources_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertDaycareFamily(user);
  const query = schema$d.parse(getQuery$1(event));
  return getFamilyResources(user, query.type);
});

const resources_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: resources_get
}, Symbol.toStringTag, { value: 'Module' }));

function clean(value) {
  return String(value || "").trim();
}
function normalizeName(value) {
  return clean(value).replace(/\s+/g, " ");
}
function assertStrongEnoughPassword(password) {
  if (password.length < 8) {
    throw publicError(400, "La contrase\xF1a debe tener al menos 8 caracteres.");
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw publicError(400, "Usa una contrase\xF1a con letras y n\xFAmeros.");
  }
}
async function listPublicDaycareSalas() {
  const rows = await legacyQuery(
    `SELECT id, sala, unidad
     FROM salas
     WHERE unidad IS NOT NULL AND TRIM(unidad) <> ''
     ORDER BY unidad ASC, id ASC`
  );
  return rows.map((row) => ({
    id: Number(row.id),
    sala: clean(row.sala),
    unidad: clean(row.unidad)
  }));
}
async function resolvePublicSala(salaId, unidad) {
  const sala = await legacyOne(
    `SELECT id, sala, unidad
     FROM salas
     WHERE id = ?
     LIMIT 1`,
    [salaId]
  );
  if (!sala) throw publicError(404, "No encontramos la sala seleccionada.");
  const requestedUnidad = clean(unidad);
  if (requestedUnidad && requestedUnidad !== clean(sala.unidad)) {
    throw publicError(400, "La unidad no coincide con la sala seleccionada.");
  }
  return {
    id: Number(sala.id),
    sala: clean(sala.sala),
    unidad: clean(sala.unidad)
  };
}
async function findExistingUsers(email) {
  return legacyQuery(
    `SELECT id, email, username, role, unidad, sala
     FROM users
     WHERE LOWER(email) = ? OR LOWER(username) = ?
     LIMIT 5`,
    [email, email]
  );
}
function daycareScopeFor(row) {
  const roles = csvToList(row.role);
  const unidades = csvToList(row.unidad);
  const sala = clean(row.sala);
  return hasRoleToken(roles, DAYCARE_FAMILY_ROLE) && unidades.length && sala ? { unidad: unidades[0], sala } : null;
}
async function registerDaycareFamily(input) {
  const parentName = normalizeName(input.parentName);
  const childName = normalizeName(input.childName);
  const email = normalizeEmail(input.email);
  if (!parentName) throw publicError(400, "Escribe el nombre de madre, padre o tutor.");
  if (!childName) throw publicError(400, "Escribe el nombre del ni\xF1o o ni\xF1a.");
  if (!email) throw publicError(400, "Escribe un correo v\xE1lido.");
  assertStrongEnoughPassword(input.password);
  const sala = await resolvePublicSala(input.sala, input.unidad);
  const existing = await findExistingUsers(email);
  if (existing.length > 1) {
    throw publicError(409, "Encontramos m\xE1s de una cuenta con ese correo. Solicita apoyo de administraci\xF3n.");
  }
  const current = existing[0];
  if (current) {
    const daycare = daycareScopeFor(current);
    if ((daycare == null ? void 0 : daycare.unidad) === sala.unidad && String(daycare.sala) === String(sala.id)) {
      throw publicError(409, "Este correo ya tiene acceso a guarder\xEDa. Ingresa con tu cuenta existente.");
    }
    if (daycare) {
      throw publicError(409, "Este correo ya est\xE1 vinculado a otra sala. Solicita apoyo de administraci\xF3n.");
    }
    throw publicError(409, "Este correo ya existe en Husky Pass. Solicita a administraci\xF3n activar guarder\xEDa en esa cuenta.");
  }
  const passwordHash = await bcrypt.hash(input.password, 10);
  const result = await legacyWrite(
    `INSERT INTO users (nombre_nino, username, email, password, plaintext, role, unidad, sala, displayName, picture)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      childName,
      email,
      email,
      passwordHash,
      null,
      DAYCARE_FAMILY_ROLE,
      sala.unidad,
      String(sala.id),
      parentName,
      clean(input.pictureUrl) || null
    ]
  );
  return {
    id: result.insertId,
    email,
    username: email,
    displayName: parentName,
    childName,
    unidad: sala.unidad,
    sala: String(sala.id),
    salaName: sala.sala,
    role: DAYCARE_FAMILY_ROLE
  };
}

const schema$c = z.object({
  parentName: z.string().trim().min(3).max(120),
  childName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(100),
  sala: z.coerce.number().int().positive(),
  unidad: z.string().trim().optional().nullable(),
  captchaToken: z.string().min(20),
  captchaAnswer: z.string().min(1).max(8),
  startedAt: z.coerce.number(),
  website: z.string().optional().nullable()
});
function field(parts, name) {
  var _a, _b;
  return ((_b = (_a = parts.find((part) => part.name === name && !part.filename)) == null ? void 0 : _a.data) == null ? void 0 : _b.toString("utf8")) || "";
}
const registration_post = defineEventHandler(async (event) => {
  var _a;
  const parts = await readMultipartFormData(event);
  if (!(parts == null ? void 0 : parts.length)) throw publicError(400, "Completa el formulario de registro.");
  const body = schema$c.parse({
    parentName: field(parts, "parentName"),
    childName: field(parts, "childName"),
    email: field(parts, "email"),
    password: field(parts, "password"),
    sala: field(parts, "sala"),
    unidad: field(parts, "unidad"),
    captchaToken: field(parts, "captchaToken"),
    captchaAnswer: field(parts, "captchaAnswer"),
    startedAt: field(parts, "startedAt"),
    website: field(parts, "website")
  });
  assertRegistrationAntibot(event, body);
  const filePart = parts.find((part) => {
    var _a2;
    return part.name === "picture" && ((_a2 = part.data) == null ? void 0 : _a2.length);
  });
  let pictureUrl = null;
  if ((_a = filePart == null ? void 0 : filePart.data) == null ? void 0 : _a.length) {
    const uploaded = await uploadToExternalService(
      { data: filePart.data, filename: filePart.filename, type: filePart.type },
      {
        folder: externalUploadFolder("daycare-registration", body.unidad || "unidad", `sala-${body.sala}`),
        maxBytes: 4 * 1024 * 1024,
        accept: "images",
        filenamePrefix: "foto-familia"
      }
    );
    pictureUrl = uploaded.absoluteUrl;
  }
  const registration = await registerDaycareFamily({ ...body, pictureUrl });
  return {
    ok: true,
    registration,
    message: "Registro de guarder\xEDa creado. Ya puedes iniciar sesi\xF3n con tu correo y contrase\xF1a."
  };
});

const registration_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: registration_post
}, Symbol.toStringTag, { value: 'Module' }));

const captcha_get = defineEventHandler(() => createCaptchaChallenge());

const captcha_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: captcha_get
}, Symbol.toStringTag, { value: 'Module' }));

const options_get$2 = defineEventHandler(async () => {
  const salas = await listPublicDaycareSalas();
  const unidades = Array.from(new Set(salas.map((sala) => sala.unidad))).sort((a, b) => a.localeCompare(b, "es"));
  return { unidades, salas };
});

const options_get$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: options_get$2
}, Symbol.toStringTag, { value: 'Module' }));

const options_get = defineEventHandler(async () => {
  return {
    variants: DEV_HUSKY_PASS_VARIANTS,
    scenarios: DEV_HUSKY_PASS_SCENARIOS,
    templates: await listMarbeteTemplates(),
    themes: marbeteTemplateThemes()
  };
});

const options_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: options_get
}, Symbol.toStringTag, { value: 'Module' }));

const schema$b = z.object({
  variant: z.string().optional().default("guarderia-cm"),
  scenario: z.string().optional().default("default"),
  format: z.enum(["pdf", "svg-preview", "readiness", "diagnostics"]).optional().default("pdf"),
  download: z.string().optional().default("")
});
const pass_get = defineEventHandler(async (event) => {
  const query = schema$b.parse(getQuery$1(event));
  const origin = getRequestURL(event).origin;
  const fixture = buildDevPrintableAuthorizedPerson({
    origin,
    variantId: query.variant,
    scenarioId: query.scenario
  });
  const templates = await listMarbeteTemplates();
  const template = selectDevHuskyPassTemplate(templates, fixture.variant);
  if (!template) throw publicError(503, "Plantilla de Husky Pass no disponible.");
  const templateSvg = await readMarbeteTemplateSvg(template);
  const renderValues = buildMarbeteRenderValues(fixture.data, origin);
  const renderedSvg = renderMarbeteSvg(templateSvg, fixture.data, origin);
  const pdfInput = { templateSvg, renderedSvg, values: renderValues.values, origin };
  const readiness = validateMarbeteRequirements(templateSvg, fixture.data, origin);
  const downloadName = marbeteDownloadName(fixture.data, template);
  const selectedExpectedTemplate = template.id === fixture.variant.expectedTemplateId;
  if (query.format === "readiness") {
    if (readiness.ok) await assertMarbetePdfAssets(pdfInput);
    setHeader(event, "Cache-Control", "no-store");
    return {
      ...readiness,
      template,
      themeKey: template.themeKey,
      downloadName,
      variant: fixture.variant,
      scenario: fixture.scenario,
      selectedExpectedTemplate
    };
  }
  if (query.format === "diagnostics") {
    let assetsOk = false;
    let assetError = null;
    try {
      await assertMarbetePdfAssets(pdfInput);
      assetsOk = true;
    } catch (error) {
      assetError = error;
    }
    setHeader(event, "Cache-Control", "no-store");
    return {
      ok: readiness.ok && assetsOk && selectedExpectedTemplate,
      readiness,
      assetsOk,
      assetError,
      template,
      expectedTemplateId: fixture.variant.expectedTemplateId,
      selectedExpectedTemplate,
      variant: fixture.variant,
      scenario: fixture.scenario,
      values: renderValues.values,
      downloadName
    };
  }
  if (query.format === "svg-preview") {
    setHeader(event, "Content-Type", "image/svg+xml; charset=utf-8");
    setHeader(event, "Cache-Control", "no-store");
    setHeader(event, "X-Husky-Marbete-Template", template.id);
    setHeader(event, "X-Husky-Marbete-Theme", template.themeKey);
    setHeader(event, "X-Husky-Marbete-Expected-Template", String(selectedExpectedTemplate));
    return renderedSvg;
  }
  await assertMarbetePdfAssets(pdfInput);
  const pdf = await renderMarbetePdf(pdfInput);
  setHeader(event, "Content-Type", "application/pdf");
  setHeader(event, "Cache-Control", "no-store");
  setHeader(event, "X-Husky-Marbete-Template", template.id);
  setHeader(event, "X-Husky-Marbete-Theme", template.themeKey);
  setHeader(event, "X-Husky-Marbete-Expected-Template", String(selectedExpectedTemplate));
  setHeader(event, "Content-Disposition", `${query.download === "1" ? "attachment" : "inline"}; filename="${downloadName}"`);
  return pdf;
});

const pass_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: pass_get
}, Symbol.toStringTag, { value: 'Module' }));

const schema$a = z.object({
  seed: z.string().optional().default("husky-pass"),
  label: z.string().optional().default("PA"),
  theme: z.string().optional().default("escolar"),
  mode: z.enum(["portrait", "wide", "tall", "transparent", "large", "slow"]).optional().default("portrait"),
  transparent: z.string().optional().default(""),
  large: z.string().optional().default(""),
  delay: z.coerce.number().int().min(0).max(5e3).optional().default(0)
});
const themeColors = {
  escolar: { primary: "#236188", soft: "#EEF7FB" },
  daycare: { primary: "#618B2F", soft: "#EDF6E5" },
  preescolar: { primary: "#E83F4B", soft: "#FFF1F2" },
  primaria: { primary: "#D99A08", soft: "#FFF7D7" },
  secundaria: { primary: "#2C7DB6", soft: "#EAF5FC" },
  iedis: { primary: "#007F92", soft: "#E9F8FA" }
};
function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function dimensions(mode) {
  if (mode === "wide") return { width: 720, height: 320 };
  if (mode === "tall") return { width: 280, height: 720 };
  return { width: 367, height: 485 };
}
function largePayload(enabled) {
  if (!enabled) return "";
  return Array.from({ length: 650 }, (_item, index) => {
    const x = index * 37 % 367;
    const y = index * 53 % 485;
    const opacity = 0.03 + index % 7 * 0.01;
    return `<circle cx="${x}" cy="${y}" r="${10 + index % 19}" fill="#ffffff" opacity="${opacity.toFixed(2)}"/>`;
  }).join("");
}
const photo_get = defineEventHandler(async (event) => {
  const query = schema$a.parse(getQuery$1(event));
  if (query.delay) await new Promise((resolve) => setTimeout(resolve, query.delay));
  const { width, height } = dimensions(query.mode);
  const colors = themeColors[query.theme] || themeColors.escolar;
  const transparent = Boolean(query.transparent || query.mode === "transparent");
  const seed = escapeXml(query.seed);
  const label = escapeXml(query.label.slice(0, 4).toUpperCase());
  const faceRadius = Math.min(width, height) * 0.16;
  const headX = width / 2;
  const headY = height * 0.33;
  const shoulderY = height * 0.82;
  const shirtColor = colors.primary;
  const background = transparent ? `<rect width="${width}" height="${height}" fill="transparent"/>` : `<rect width="${width}" height="${height}" rx="34" fill="${colors.soft}"/>`;
  const art = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="skin" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#ffe0c7"/>
      <stop offset="1" stop-color="#f0a776"/>
    </linearGradient>
    <linearGradient id="shirt" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${shirtColor}"/>
      <stop offset="1" stop-color="#263241"/>
    </linearGradient>
  </defs>
  ${background}
  <rect x="18" y="18" width="${width - 36}" height="${height - 36}" rx="28" fill="#ffffff" opacity=".42"/>
  ${largePayload(Boolean(query.large))}
  <ellipse cx="${headX}" cy="${height * 0.9}" rx="${width * 0.38}" ry="${height * 0.09}" fill="#111827" opacity=".14"/>
  <path d="M${width * 0.18} ${shoulderY} C ${width * 0.24} ${height * 0.58}, ${width * 0.76} ${height * 0.58}, ${width * 0.82} ${shoulderY} L${width * 0.88} ${height} H${width * 0.12} Z" fill="url(#shirt)"/>
  <path d="M${width * 0.36} ${height * 0.62} C ${width * 0.42} ${height * 0.72}, ${width * 0.58} ${height * 0.72}, ${width * 0.64} ${height * 0.62} L${width * 0.61} ${height * 0.84} H${width * 0.39} Z" fill="url(#skin)"/>
  <path d="M${headX - faceRadius * 1.2} ${headY - faceRadius * 0.2} C ${headX - faceRadius * 1.35} ${headY - faceRadius * 1.25}, ${headX - faceRadius * 0.45} ${headY - faceRadius * 1.65}, ${headX + faceRadius * 0.55} ${headY - faceRadius * 1.45} C ${headX + faceRadius * 1.52} ${headY - faceRadius * 1.22}, ${headX + faceRadius * 1.4} ${headY + faceRadius * 0.32}, ${headX + faceRadius * 0.92} ${headY + faceRadius * 0.9} C ${headX + faceRadius * 0.4} ${headY + faceRadius * 1.5}, ${headX - faceRadius * 0.52} ${headY + faceRadius * 1.43}, ${headX - faceRadius * 0.98} ${headY + faceRadius * 0.78} C ${headX - faceRadius * 1.22} ${headY + faceRadius * 0.44}, ${headX - faceRadius * 1.14} ${headY + faceRadius * 0.04}, ${headX - faceRadius * 1.2} ${headY - faceRadius * 0.2} Z" fill="#2f1f1b"/>
  <circle cx="${headX}" cy="${headY}" r="${faceRadius}" fill="url(#skin)"/>
  <path d="M${headX - faceRadius * 0.95} ${headY - faceRadius * 0.42} C ${headX - faceRadius * 0.5} ${headY - faceRadius * 0.92}, ${headX + faceRadius * 0.42} ${headY - faceRadius * 0.92}, ${headX + faceRadius * 0.96} ${headY - faceRadius * 0.32} C ${headX + faceRadius * 0.82} ${headY - faceRadius * 1.1}, ${headX - faceRadius * 0.85} ${headY - faceRadius * 1.35}, ${headX - faceRadius * 0.95} ${headY - faceRadius * 0.42} Z" fill="#2f1f1b"/>
  <circle cx="${headX - faceRadius * 0.36}" cy="${headY - faceRadius * 0.04}" r="${Math.max(3, faceRadius * 0.07)}" fill="#263241"/>
  <circle cx="${headX + faceRadius * 0.36}" cy="${headY - faceRadius * 0.04}" r="${Math.max(3, faceRadius * 0.07)}" fill="#263241"/>
  <path d="M${headX - faceRadius * 0.18} ${headY + faceRadius * 0.42} Q ${headX} ${headY + faceRadius * 0.58}, ${headX + faceRadius * 0.22} ${headY + faceRadius * 0.42}" fill="none" stroke="#854d3b" stroke-width="${Math.max(3, faceRadius * 0.06)}" stroke-linecap="round"/>
  <rect x="${width * 0.64}" y="${height * 0.66}" width="${width * 0.19}" height="${height * 0.1}" rx="${Math.min(width, height) * 0.03}" fill="#fff" opacity=".92"/>
  <circle cx="${width * 0.69}" cy="${height * 0.71}" r="${Math.min(width, height) * 0.025}" fill="${colors.primary}"/>
  <text x="${width * 0.76}" y="${height * 0.725}" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-weight="800" font-size="${Math.max(16, Math.min(width, height) * 0.055)}" fill="${colors.primary}">${label}</text>
  <text x="50%" y="${height - 34}" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-weight="700" font-size="18" fill="${colors.primary}">${seed}</text>
</svg>`;
  setHeader(event, "Content-Type", "image/svg+xml; charset=utf-8");
  setHeader(event, "Cache-Control", "no-store");
  return art;
});

const photo_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: photo_get
}, Symbol.toStringTag, { value: 'Module' }));

function firstQueryValue(value) {
  if (Array.isArray(value)) return String(value[0] || "").trim();
  return String(value || "").trim();
}
const index_get$2 = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  const query = getQuery$1(event);
  return getParentAttendance(user, {
    matricula: firstQueryValue(query.matricula),
    schoolYear: firstQueryValue(query.schoolYear)
  });
});

const index_get$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_get$2
}, Symbol.toStringTag, { value: 'Module' }));

const schema$9 = z.object({
  matricula: z.string().min(1),
  schoolYear: z.string().optional().nullable(),
  absenceId: z.coerce.number().int().positive(),
  motivo: z.string().trim().min(3).max(700)
});
const motivo_post = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  const body = schema$9.parse(await readBody(event));
  return updateParentAbsenceMotivo(user, body);
});

const motivo_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: motivo_post
}, Symbol.toStringTag, { value: 'Module' }));

const config_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  return withRequestBoundary(event, "personas-autorizadas.config.load", async () => {
    var _a;
    const [config, children] = await Promise.all([readPersonasConfig(), getFamilyChildren(user)]);
    const child = children.find((item) => item.isCurrent) || children[0] || null;
    const resolved = resolveSurveyForStudent(config, {
      matricula: (child == null ? void 0 : child.matricula) || user.username,
      plantel: (child == null ? void 0 : child.plantel) || ((_a = user.plantel) == null ? void 0 : _a[0]),
      nivelEdu: child == null ? void 0 : child.nivelEdu,
      campus: (child == null ? void 0 : child.campus) || user.campus
    });
    return {
      ...config,
      ...resolved
    };
  }, { userId: user.id });
});

const config_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: config_get
}, Symbol.toStringTag, { value: 'Module' }));

const schema$8 = z.object({ id: z.coerce.number().int().positive() });
const credential_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  return withRequestBoundary(event, "personas-autorizadas.credential.load", async () => {
    const query = schema$8.parse(getQuery$1(event));
    return getCredentialAuthorizedPersona(user, query.id);
  }, { userId: user.id });
});

const credential_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: credential_get
}, Symbol.toStringTag, { value: 'Module' }));

const schema$7 = z.object({
  src: z.string().min(32),
  personaId: z.number().int().positive().optional().nullable()
});
const faces_post = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  return withRequestBoundary(event, "personas-autorizadas.face.upload", async () => {
    const body = schema$7.parse(await readBody(event));
    const file = dataUrlToUploadFile(body.src, body.personaId ? `persona-${body.personaId}` : "persona-nueva");
    return uploadToExternalService(file, {
      folder: externalUploadFolder("personas-face", user.id),
      maxBytes: 2 * 1024 * 1024,
      accept: "images",
      filenamePrefix: body.personaId ? `persona-${body.personaId}` : "persona-nueva"
    });
  }, { userId: user.id });
});

const faces_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: faces_post
}, Symbol.toStringTag, { value: 'Module' }));

const _id__delete = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  return withRequestBoundary(event, "personas-autorizadas.family.delete", async () => {
    return await deleteAuthorizedPersona(user, Number(getRouterParam(event, "id")));
  }, { userId: user.id, personId: getRouterParam(event, "id") });
});

const _id__delete$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__delete
}, Symbol.toStringTag, { value: 'Module' }));

const index_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  return withRequestBoundary(event, "personas-autorizadas.family.load", () => getAuthorizedPersonas(user), { userId: user.id });
});

const index_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_get
}, Symbol.toStringTag, { value: 'Module' }));

const schema$6 = z.object({
  indice: z.coerce.number().int().min(1).max(4),
  id: z.number().int().positive().optional().nullable(),
  paternoP: z.string().optional().nullable(),
  maternoP: z.string().optional().nullable(),
  nombreP: z.string().min(1),
  parenP: z.string().min(1),
  foto: z.string().optional().nullable(),
  compressed_foto: z.string().optional().nullable(),
  fechaP: z.string().optional().nullable()
}).strict();
const index_post = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  return withRequestBoundary(event, "personas-autorizadas.family.save", async () => {
    const body = schema$6.parse(await readBody(event));
    return await upsertAuthorizedPersona(user, body);
  }, { userId: user.id });
});

const index_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_post
}, Symbol.toStringTag, { value: 'Module' }));

const schema$5 = z.object({
  id: z.coerce.number().int().positive(),
  download: z.string().optional().default(""),
  format: z.enum(["", "svg-preview", "readiness"]).optional().default("")
});
function firstIssue(issues) {
  return issues[0] || "Completa los datos solicitados para descargar el Husky Pass.";
}
const marbete_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  return withRequestBoundary(event, "personas-autorizadas.marbete.load", async () => {
    var _a;
    const query = schema$5.parse(getQuery$1(event));
    const data = await getCredentialAuthorizedPersona(user, query.id);
    const templates = await listMarbeteTemplates();
    if (!templates.length) throw publicError(503, "El Husky Pass no est\xE1 disponible en este momento. Solicita apoyo a la escuela.");
    const template = selectMarbeteTemplate(templates, { matricula: data.matricula, plantel: data.plantel, nivelEdu: data.nivelEdu });
    if (!template) throw publicError(503, "El Husky Pass no est\xE1 disponible para este alumno. Solicita apoyo a la escuela.");
    const origin = getRequestURL(event).origin;
    const templateSvg = await readMarbeteTemplateSvg(template);
    const requirementStatus = validateMarbeteRequirements(templateSvg, data, origin);
    const renderValues = buildMarbeteRenderValues(data, origin);
    const svg = renderMarbeteSvg(templateSvg, data, origin);
    const pdfInput = { templateSvg, renderedSvg: svg, values: renderValues.values, origin };
    const downloadName = marbeteDownloadName(data, template);
    if (query.format === "readiness") {
      const response = {
        ok: requirementStatus.ok,
        issues: requirementStatus.issues,
        template,
        themeKey: template.themeKey,
        downloadName
      };
      if (requirementStatus.ok) {
        try {
          await assertMarbetePdfAssets(pdfInput);
        } catch (error) {
          const failure = error;
          response.ok = false;
          response.issues = [((_a = failure == null ? void 0 : failure.data) == null ? void 0 : _a.statusMessage) || (failure == null ? void 0 : failure.statusMessage) || (failure == null ? void 0 : failure.message) || "Actualiza la foto para descargar el Husky Pass o solicita apoyo a la escuela."];
        }
      }
      setHeader(event, "Cache-Control", "private, no-store");
      return response;
    }
    if (!requirementStatus.ok) {
      throw publicError(422, firstIssue(requirementStatus.issues));
    }
    if (query.format === "svg-preview" && query.download !== "1") {
      setHeader(event, "Content-Type", "image/svg+xml; charset=utf-8");
      setHeader(event, "Cache-Control", "private, no-store");
      setHeader(event, "X-Husky-Marbete-Template", template.id);
      setHeader(event, "X-Husky-Marbete-Theme", template.themeKey);
      return svg;
    }
    await assertMarbetePdfAssets(pdfInput);
    const pdf = await renderMarbetePdf(pdfInput);
    setHeader(event, "Content-Type", "application/pdf");
    setHeader(event, "Cache-Control", "private, no-store");
    setHeader(event, "X-Husky-Marbete-Template", template.id);
    setHeader(event, "X-Husky-Marbete-Theme", template.themeKey);
    if (query.download === "1") {
      setHeader(event, "Content-Disposition", `attachment; filename="${downloadName}"`);
    } else {
      setHeader(event, "Content-Disposition", `inline; filename="${downloadName}"`);
    }
    return pdf;
  }, { userId: user.id });
});

const marbete_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: marbete_get
}, Symbol.toStringTag, { value: 'Module' }));

const schema$4 = z.object({
  src: z.string().min(64)
});
const photoSource_post = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  return withRequestBoundary(event, "personas-autorizadas.photo-source.upload", async () => {
    const body = schema$4.parse(await readBody(event));
    const file = dataUrlToUploadFile(body.src, "foto-original");
    return uploadToExternalService(file, {
      folder: externalUploadFolder("personas-source", user.id),
      maxBytes: 5 * 1024 * 1024,
      accept: "images",
      filenamePrefix: "foto-original"
    });
  }, { userId: user.id });
});

const photoSource_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: photoSource_post
}, Symbol.toStringTag, { value: 'Module' }));

const schema$3 = z.object({ id: z.coerce.number().int().positive() });
const scan_get = defineEventHandler(async (event) => {
  return withRequestBoundary(event, "personas-autorizadas.scan.load", async () => {
    const query = schema$3.parse(getQuery$1(event));
    return getScanAuthorizedPersona(query.id);
  }, {}, { expectedStatusCodes: [404] });
});

const scan_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: scan_get
}, Symbol.toStringTag, { value: 'Module' }));

const schema$2 = z.object({
  matricula: z.string().min(1)
});
const siblingSession_post = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  return withRequestBoundary(event, "personas-autorizadas.sibling.switch", async () => {
    const body = schema$2.parse(await readBody(event));
    const targetMatricula = normalizeMatricula(body.matricula);
    const siblings = await getFamilyChildren(user);
    const target = siblings.find((child) => child.canSwitch && normalizeMatricula(child.matricula) === targetMatricula);
    if (!target) {
      throw publicError(403, "El alumno no esta disponible para cambio directo.");
    }
    const legacyUser = await findLegacyFamilyByLogin(targetMatricula);
    if (!legacyUser) {
      throw publicError(404, "No encontramos una cuenta familiar activa para este alumno.");
    }
    const sessionUser = legacyUser.toSession("family");
    if (!hasFamilyScope(sessionUser, "personasAutorizadas")) {
      throw publicError(403, "La cuenta vinculada no tiene Personas Autorizadas habilitado.");
    }
    setAppSession(event, sessionUser);
    const resolved = resolveExperienceContext({
      routePath: "/familia/personas-autorizadas",
      user: sessionUser,
      matricula: target.matricula,
      plantel: target.plantel,
      nivelEdu: target.nivelEdu,
      campus: target.campus,
      grupo: target.grupo
    });
    setCookie(event, "user_segment", resolved.context.experience === "guarderia" ? "guarderia" : "escolar", { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
    return { user: sessionUser, loggedin: true };
  }, { userId: user.id });
});

const siblingSession_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: siblingSession_post
}, Symbol.toStringTag, { value: 'Module' }));

const schema$1 = z.object({
  foto: z.string().min(1)
});
const studentPhoto_post = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  return withRequestBoundary(event, "personas-autorizadas.student-photo.save", async () => {
    const body = schema$1.parse(await readBody(event));
    if (!/^https?:\/\//i.test(body.foto) && !body.foto.startsWith("/uploads/")) {
      throw publicError(400, "La foto no es valida.");
    }
    return updateStudentCredentialPhoto(user, body.foto);
  }, { userId: user.id });
});

const studentPhoto_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: studentPhoto_post
}, Symbol.toStringTag, { value: 'Module' }));

const student_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  return withRequestBoundary(event, "personas-autorizadas.student.load", () => getEditableStudentProfile(user), { userId: user.id });
});

const student_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: student_get
}, Symbol.toStringTag, { value: 'Module' }));

const editableFields = PARENT_EDITABLE_STUDENT_FIELDS;
const academicFields = /* @__PURE__ */ new Set(["grado", "grupo", "nivel", "nivelEdu", "ciclo", "plantel", "matricula", "servicio", "baja", "status", "estatus", "internal_status", "campus"]);
const valueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]).optional();
const schema = z.object(Object.fromEntries(editableFields.map((field) => [field, valueSchema]))).strict();
const student_post = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  return withRequestBoundary(event, "personas-autorizadas.student.save", async () => {
    const rawBody = await readBody(event);
    const body = (rawBody == null ? void 0 : rawBody.editable) && typeof rawBody.editable === "object" ? rawBody.editable : rawBody;
    const illegal = Object.keys(body || {}).filter((field) => academicFields.has(field) || !editableFields.includes(field));
    if (illegal.length) {
      logEvent("warn", "personas-autorizadas.student.illegal-field", { userId: user.id, illegalFields: illegal }, event);
      throw publicError(403, `Campo no editable por familia: ${illegal[0]}`);
    }
    const parsed = schema.parse(body);
    return updateEditableStudentProfile(user, parsed);
  }, { userId: user.id });
});

const student_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: student_post
}, Symbol.toStringTag, { value: 'Module' }));

function renderPayloadResponse(ssrContext) {
	return {
		body: encodeForwardSlashes(stringify(splitPayload(ssrContext).payload, ssrContext["~payloadReducers"])) ,
		statusCode: getResponseStatus(ssrContext.event),
		statusMessage: getResponseStatusText(ssrContext.event),
		headers: {
			"content-type": "application/json;charset=utf-8" ,
			"x-powered-by": "Nuxt"
		}
	};
}
function renderPayloadJsonScript(opts) {
	const contents = opts.data ? encodeForwardSlashes(stringify(opts.data, opts.ssrContext["~payloadReducers"])) : "";
	const payload = {
		"type": "application/json",
		"innerHTML": contents,
		"data-nuxt-data": appId,
		"data-ssr": !(opts.ssrContext.noSSR)
	};
	{
		payload.id = "__NUXT_DATA__";
	}
	if (opts.src) {
		payload["data-src"] = opts.src;
	}
	const config = uneval(opts.ssrContext.config);
	return [payload, { innerHTML: `window.__NUXT__={};window.__NUXT__.config=${config}` }];
}

function encodeForwardSlashes(str) {
	return str.replaceAll("/", "\\u002F");
}
function splitPayload(ssrContext) {
	const { data, prerenderedAt, ...initial } = ssrContext.payload;
	return {
		initial: {
			...initial,
			prerenderedAt
		},
		payload: {
			data,
			prerenderedAt
		}
	};
}

const renderSSRHeadOptions = {"omitLineBreaks":false};

// @ts-expect-error private property consumed by vite-generated url helpers
globalThis.__buildAssetsURL = buildAssetsURL;
// @ts-expect-error private property consumed by vite-generated url helpers
globalThis.__publicAssetsURL = publicAssetsURL;
const HAS_APP_TELEPORTS = !!(appTeleportAttrs.id);
const APP_TELEPORT_OPEN_TAG = HAS_APP_TELEPORTS ? `<${appTeleportTag}${propsToString(appTeleportAttrs)}>` : "";
const APP_TELEPORT_CLOSE_TAG = HAS_APP_TELEPORTS ? `</${appTeleportTag}>` : "";
const PAYLOAD_URL_RE = /^[^?]*\/_payload.json(?:\?.*)?$/ ;
const handler = defineRenderHandler((event) => {
	
	const ssrError = event.path.startsWith("/__nuxt_error") ? getQuery$1(event) : null;
	if (ssrError && !("__unenv__" in event.node.req)) {
		throw createError({
			status: 404,
			statusText: "Page Not Found: /__nuxt_error",
			message: "Page Not Found: /__nuxt_error"
		});
	}
	return renderRoute(event, ssrError);
});
async function renderRoute(event, ssrError) {
	const nitroApp = useNitroApp();
	
	const ssrContext = createSSRContext(event);
	
	const headEntryOptions = { mode: "server" };
	ssrContext.head.push(appHead, headEntryOptions);
	if (ssrError) {
		
		const status = ssrError.status || ssrError.statusCode;
		if (status) {
			
			ssrError.status = ssrError.statusCode = Number.parseInt(status);
		}
		setSSRError(ssrContext, ssrError);
	}
	
	const routeOptions = getRouteRules(event);
	if (routeOptions.ssr === false) {
		ssrContext.noSSR = true;
	}
	
	!ssrContext.noSSR && (NUXT_RUNTIME_PAYLOAD_EXTRACTION);
	const isRenderingPayload = (routeOptions.prerender) && PAYLOAD_URL_RE.test(ssrContext.url);
	if (isRenderingPayload) {
		const url = ssrContext.url.substring(0, ssrContext.url.lastIndexOf("/")) || "/";
		ssrContext.url = url;
		event._path = event.node.req.url = url;
	}
	
	const renderer = await getRenderer(ssrContext);
	const _rendered = await renderer.renderToString(ssrContext).catch(async (error) => {
		
		
		if ((ssrContext["~renderResponse"] || ssrContext._renderResponse) && error.message === "skipping render") {
			return {};
		}
		
		const _err = !ssrError && ssrContext.payload?.error || error;
		await ssrContext.nuxt?.hooks.callHook("app:error", _err);
		throw _err;
	});
	
	
	const inlinedStyles = [];
	await ssrContext.nuxt?.hooks.callHook("app:rendered", {
		ssrContext,
		renderResult: _rendered
	});
	if (ssrContext["~renderResponse"] || ssrContext._renderResponse) {
		
		return ssrContext["~renderResponse"] || ssrContext._renderResponse;
	}
	
	if (ssrContext.payload?.error && !ssrError) {
		throw ssrContext.payload.error;
	}
	
	if (isRenderingPayload) {
		const response = renderPayloadResponse(ssrContext);
		return response;
	}
	const NO_SCRIPTS = routeOptions.noScripts;
	
	const { styles, scripts } = getRequestDependencies(ssrContext, renderer.rendererContext);
	
	if (inlinedStyles.length) {
		ssrContext.head.push({ style: inlinedStyles });
	}
	const link = [];
	for (const resource of Object.values(styles)) {
		
		if ("inline" in getQuery(resource.file)) {
			continue;
		}
		
		
		
		link.push({
			rel: "stylesheet",
			href: renderer.rendererContext.buildAssetsURL(resource.file),
			crossorigin: ""
		});
	}
	if (link.length) {
		ssrContext.head.push({ link }, headEntryOptions);
	}
	if (!NO_SCRIPTS) {
		
		
		
		if (ssrContext["~lazyHydratedModules"]) {
			for (const id of ssrContext["~lazyHydratedModules"]) {
				ssrContext.modules?.delete(id);
			}
		}
		
		ssrContext.head.push({ link: getPreloadLinks(ssrContext, renderer.rendererContext) }, headEntryOptions);
		ssrContext.head.push({ link: getPrefetchLinks(ssrContext, renderer.rendererContext) }, headEntryOptions);
		
		ssrContext.head.push({ script: renderPayloadJsonScript({
			ssrContext,
			data: ssrContext.payload
		})  }, {
			...headEntryOptions,
			
			tagPosition: "bodyClose",
			tagPriority: "high"
		});
	}
	
	if (!routeOptions.noScripts) {
		const tagPosition = "head";
		ssrContext.head.push({ script: Object.values(scripts).map((resource) => ({
			type: resource.module ? "module" : null,
			src: renderer.rendererContext.buildAssetsURL(resource.file),
			defer: resource.module ? null : true,
			
			
			tagPosition,
			crossorigin: ""
		})) }, headEntryOptions);
	}
	const { headTags, bodyTags, bodyTagsOpen, htmlAttrs, bodyAttrs } = await renderSSRHead(ssrContext.head, renderSSRHeadOptions);
	
	const htmlContext = {
		htmlAttrs: htmlAttrs ? [htmlAttrs] : [],
		head: normalizeChunks([headTags]),
		bodyAttrs: bodyAttrs ? [bodyAttrs] : [],
		bodyPrepend: normalizeChunks([bodyTagsOpen, ssrContext.teleports?.body]),
		body: [replaceIslandTeleports(ssrContext, _rendered.html) , APP_TELEPORT_OPEN_TAG + (HAS_APP_TELEPORTS ? joinTags([ssrContext.teleports?.[`#${appTeleportAttrs.id}`]]) : "") + APP_TELEPORT_CLOSE_TAG],
		bodyAppend: [bodyTags]
	};
	
	await nitroApp.hooks.callHook("render:html", htmlContext, { event });
	
	return {
		body: renderHTMLDocument(htmlContext),
		statusCode: getResponseStatus(event),
		statusMessage: getResponseStatusText(event),
		headers: {
			"content-type": "text/html;charset=utf-8",
			"x-powered-by": "Nuxt"
		}
	};
}
function normalizeChunks(chunks) {
	const result = [];
	for (const _chunk of chunks) {
		const chunk = _chunk?.trim();
		if (chunk) {
			result.push(chunk);
		}
	}
	return result;
}
function joinTags(tags) {
	return tags.join("");
}
function joinAttrs(chunks) {
	if (chunks.length === 0) {
		return "";
	}
	return " " + chunks.join(" ");
}
function renderHTMLDocument(html) {
	return "<!DOCTYPE html>" + `<html${joinAttrs(html.htmlAttrs)}>` + `<head>${joinTags(html.head)}</head>` + `<body${joinAttrs(html.bodyAttrs)}>${joinTags(html.bodyPrepend)}${joinTags(html.body)}${joinTags(html.bodyAppend)}</body>` + "</html>";
}

const renderer = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: handler
}, Symbol.toStringTag, { value: 'Module' }));
//# sourceMappingURL=index.mjs.map
