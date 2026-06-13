import process from 'node:process';globalThis._importMeta_={url:import.meta.url,env:process.env};import { tmpdir } from 'node:os';
import { Server } from 'node:http';
import { resolve, dirname, join, relative, extname } from 'node:path';
import nodeCrypto, { createHash, createHmac, timingSafeEqual, randomUUID, randomInt, randomBytes } from 'node:crypto';
import { parentPort, threadId } from 'node:worker_threads';
import { defineEventHandler, handleCacheHeaders, splitCookiesString, createEvent, fetchWithEvent, isEvent, eventHandler, setHeaders, createError, sendRedirect, proxyRequest, getRequestHeader, setResponseStatus, setResponseHeader, send, getRequestHeaders, getRequestURL, getResponseHeader, setResponseHeaders, removeResponseHeader, appendResponseHeader, createApp, createRouter as createRouter$1, toNodeListener, lazyEventHandler, getResponseStatus, getRouterParam, readBody, getQuery as getQuery$1, setCookie, getCookie, deleteCookie, setHeader, readMultipartFormData, getHeader, getResponseStatusText } from 'file://C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs';
import { z } from 'file://C:/Users/hp/husky-pass-crm/node_modules/zod/index.js';
import { JWT, OAuth2Client } from 'file://C:/Users/hp/husky-pass-crm/node_modules/google-auth-library/build/src/index.js';
import { readFile, readdir, mkdir, writeFile, rm } from 'node:fs/promises';
import bcrypt from 'file://C:/Users/hp/husky-pass-crm/node_modules/bcryptjs/index.js';
import { createPool } from 'file://C:/Users/hp/husky-pass-crm/node_modules/mysql2/promise.js';
import { createFetch, Headers as Headers$1, $fetch } from 'file://C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs';
import { promises, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { getRequestDependencies, getPreloadLinks, getPrefetchLinks, createRenderer } from 'file://C:/Users/hp/husky-pass-crm/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import { stringify, uneval } from 'file://C:/Users/hp/husky-pass-crm/node_modules/devalue/index.js';
import destr from 'file://C:/Users/hp/husky-pass-crm/node_modules/destr/dist/index.mjs';
import { parseURL, withoutBase, joinURL, getQuery, withQuery, withTrailingSlash, decodePath, withLeadingSlash, withoutTrailingSlash, joinRelativeURL } from 'file://C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs';
import { renderToString } from 'file://C:/Users/hp/husky-pass-crm/node_modules/vue/server-renderer/index.mjs';
import { propsToString, renderSSRHead } from 'file://C:/Users/hp/husky-pass-crm/node_modules/@unhead/ssr/dist/index.mjs';
import { createServerHead as createServerHead$1, CapoPlugin } from 'file://C:/Users/hp/husky-pass-crm/node_modules/unhead/dist/index.mjs';
import { klona } from 'file://C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs';
import defu, { defuFn } from 'file://C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs';
import { snakeCase } from 'file://C:/Users/hp/husky-pass-crm/node_modules/scule/dist/index.mjs';
import { createHooks } from 'file://C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs';
import { fetchNodeRequestHandler, callNodeRequestHandler } from 'file://C:/Users/hp/husky-pass-crm/node_modules/node-mock-http/dist/index.mjs';
import { createStorage, prefixStorage } from 'file://C:/Users/hp/husky-pass-crm/node_modules/unstorage/dist/index.mjs';
import unstorage_47drivers_47fs from 'file://C:/Users/hp/husky-pass-crm/node_modules/unstorage/drivers/fs.mjs';
import { digest } from 'file://C:/Users/hp/husky-pass-crm/node_modules/ohash/dist/index.mjs';
import { toRouteMatcher, createRouter } from 'file://C:/Users/hp/husky-pass-crm/node_modules/radix3/dist/index.mjs';
import consola, { consola as consola$1 } from 'file://C:/Users/hp/husky-pass-crm/node_modules/consola/dist/index.mjs';
import { ErrorParser } from 'file://C:/Users/hp/husky-pass-crm/node_modules/youch-core/build/index.js';
import { Youch } from 'file://C:/Users/hp/husky-pass-crm/node_modules/youch/build/index.js';
import { SourceMapConsumer } from 'file://C:/Users/hp/husky-pass-crm/node_modules/source-map/source-map.js';
import { AsyncLocalStorage } from 'node:async_hooks';
import { getContext } from 'file://C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs';
import { captureRawStackTrace, parseRawStackTrace } from 'file://C:/Users/hp/husky-pass-crm/node_modules/errx/dist/index.js';
import { isVNode, unref, version } from 'file://C:/Users/hp/husky-pass-crm/node_modules/vue/index.mjs';
import { fileURLToPath } from 'node:url';
import { dirname as dirname$1, resolve as resolve$1 } from 'file://C:/Users/hp/husky-pass-crm/node_modules/pathe/dist/index.mjs';
import { defineHeadPlugin } from 'file://C:/Users/hp/husky-pass-crm/node_modules/@unhead/shared/dist/index.mjs';

const serverAssets = [{"baseName":"server","dir":"C:/Users/hp/husky-pass-crm/server/assets"}];

const assets$1 = createStorage();

for (const asset of serverAssets) {
  assets$1.mount(asset.baseName, unstorage_47drivers_47fs({ base: asset.dir, ignore: (asset?.ignore || []) }));
}

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('root', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"C:/Users/hp/husky-pass-crm"}));
storage.mount('src', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"C:/Users/hp/husky-pass-crm/server"}));
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
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
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
    "connectionLimit": 10
  },
  "sipae": {
    "apiBaseUrl": "https://the-sipae-api.casitaapps.com",
    "timeoutMs": 10000
  },
  "externalUpload": {
    "url": "https://expediente.casitaapps.com"
  },
  "passwordRecovery": {
    "baseUrl": "",
    "tokenTtlMinutes": 30,
    "emailMode": "gmail",
    "fromEmail": "",
    "fromName": "Husky Pass",
    "googleServiceAccountEmail": "",
    "googleServiceAccountPrivateKey": "",
    "googleServiceAccountPrivateKeyBase64": "",
    "googleDelegatedUser": ""
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
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}
function normalizeError(error, isDev) {
  const cwd = typeof process.cwd === "function" ? process.cwd() : "/";
  const stack = (error.unhandled || error.fatal) ? [] : (error.stack || "").split("\n").splice(1).filter((line) => line.includes("at ")).map((line) => {
    const text = line.replace(cwd + "/", "./").replace("webpack:/", "").replace("file://", "").trim();
    return {
      text,
      internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
    };
  });
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage ?? (statusCode === 404 ? "Not Found" : "");
  const message = error.unhandled ? "internal server error" : error.message || error.toString();
  return {
    stack,
    statusCode,
    statusMessage,
    message
  };
}

const errorHandler$0 = (async function errorhandler(error, event) {
  const { stack, statusCode, statusMessage, message } = normalizeError(error);
  const errorObject = {
    url: event.path,
    statusCode,
    statusMessage,
    message,
    stack: statusCode !== 404 ? `<pre>${stack.map((i) => `<span class="stack${i.internal ? " internal" : ""}">${i.text}</span>`).join("\n")}</pre>` : "",
    // TODO: check and validate error.data for serialisation into query
    data: error.data
  };
  if (error.unhandled || error.fatal) {
    const tags = [
      "[nuxt]",
      "[request error]",
      error.unhandled && "[unhandled]",
      error.fatal && "[fatal]",
      Number(errorObject.statusCode) !== 200 && `[${errorObject.statusCode}]`
    ].filter(Boolean).join(" ");
    console.error(tags, (error.message || error.toString() || "internal server error") + "\n" + stack.map((l) => "  " + l.text).join("  \n"));
  }
  if (event.handled) {
    return;
  }
  setResponseStatus(event, errorObject.statusCode !== 200 && errorObject.statusCode || 500, errorObject.statusMessage);
  if (isJsonRequest(event)) {
    setResponseHeader(event, "Content-Type", "application/json");
    return send(event, JSON.stringify(errorObject));
  }
  const reqHeaders = getRequestHeaders(event);
  const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
  const res = isRenderingError ? null : await useNitroApp().localFetch(
    withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject),
    {
      headers: { ...reqHeaders, "x-nuxt-error": "true" },
      redirect: "manual"
    }
  ).catch(() => null);
  if (!res) {
    const { template } = await Promise.resolve().then(function () { return errorDev; }) ;
    {
      errorObject.description = errorObject.message;
    }
    if (event.handled) {
      return;
    }
    setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
    return send(event, template(errorObject));
  }
  const html = await res.text();
  if (event.handled) {
    return;
  }
  for (const [header, value] of res.headers.entries()) {
    setResponseHeader(event, header, value);
  }
  setResponseStatus(event, res.status && res.status !== 200 ? res.status : void 0, res.statusText);
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
  VNode: (data) => isVNode(data) ? { type: data.type, props: data.props } : void 0,
  URL: (data) => data instanceof URL ? data.toString() : void 0
};
const asyncContext = getContext("nuxt-dev", { asyncContext: true, AsyncLocalStorage });
const _4c4LjD6UWmdjG0L6PwcMg5j1Rb_sHAxFER5gpj7pLD4 = (nitroApp) => {
  const handler = nitroApp.h3App.handler;
  nitroApp.h3App.handler = (event) => {
    return asyncContext.callAsync({ logs: [], event }, () => handler(event));
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
      // Pass along filename to allow the client to display more info about where log comes from
      filename,
      // Clean up file names in stack trace
      stack: trace
    };
    ctx.logs.push(log);
  });
  nitroApp.hooks.hook("afterResponse", () => {
    const ctx = asyncContext.tryUse();
    if (!ctx) {
      return;
    }
    return nitroApp.hooks.callHook("dev:ssr-logs", { logs: ctx.logs, path: ctx.event.path });
  });
  nitroApp.hooks.hook("render:html", (htmlContext) => {
    const ctx = asyncContext.tryUse();
    if (!ctx) {
      return;
    }
    try {
      const reducers = Object.assign(/* @__PURE__ */ Object.create(null), devReducers, ctx.event.context._payloadReducers);
      htmlContext.bodyAppend.unshift(`<script type="application/json" data-nuxt-logs="${appId}">${stringify(ctx.logs, reducers)}<\/script>`);
    } catch (e) {
      const shortError = e instanceof Error && "toString" in e ? ` Received \`${e.toString()}\`.` : "";
      console.warn(`[nuxt] Failed to stringify dev server logs.${shortError} You can define your own reducer/reviver for rich types following the instructions in https://nuxt.com/docs/api/composables/use-nuxt-app#payload.`);
    }
  });
};
const EXCLUDE_TRACE_RE = /\/node_modules\/(?:.*\/)?(?:nuxt|nuxt-nightly|nuxt-edge|nuxt3|consola|@vue)\/|core\/runtime\/nitro/;
function onConsoleLog(callback) {
  consola$1.addReporter({
    log(logObj) {
      callback(logObj);
    }
  });
  consola$1.wrapConsole();
}

const plugins = [
  _4c4LjD6UWmdjG0L6PwcMg5j1Rb_sHAxFER5gpj7pLD4
];

const assets = {};

function readAsset (id) {
  const serverDir = dirname$1(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve$1(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1}};

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
const _lazy_AGB0Jh = () => Promise.resolve().then(function () { return renderer$1; });

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
  { route: '/__nuxt_error', handler: _lazy_AGB0Jh, lazy: true, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_AGB0Jh, lazy: true, middleware: false, method: undefined }
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
const server = new Server(toNodeListener(nitroApp.h3App));
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
      listener = server.listen(useRandomPort ? 0 : getSocketAddress(), () => {
        const address = server.address();
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
  server.closeAllConnections?.();
  await Promise.all([
    new Promise((resolve) => listener?.close(resolve)),
    nitroApp.hooks.callHook("close").catch(console.error)
  ]);
  parentPort?.postMessage({ event: "exit" });
}

const _messages = { "appName": "Nuxt", "version": "", "statusCode": 500, "statusMessage": "Server error", "description": "An error occurred in the application and the page could not be served. If you are the application owner, check your server logs for details.", "stack": "" };
const template$1 = (messages) => {
  messages = { ..._messages, ...messages };
  return '<!DOCTYPE html><html lang="en"><head><title>' + messages.statusCode + " - " + messages.statusMessage + " | " + messages.appName + `</title><meta charset="utf-8"><meta content="width=device-width,initial-scale=1.0,minimum-scale=1.0" name="viewport"><style>.spotlight{background:linear-gradient(45deg,#00dc82,#36e4da 50%,#0047e1);bottom:-40vh;filter:blur(30vh);height:60vh;opacity:.8}*,:after,:before{border-color:var(--un-default-border-color,#e5e7eb);border-style:solid;border-width:0;box-sizing:border-box}:after,:before{--un-content:""}html{line-height:1.5;-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;font-feature-settings:normal;font-variation-settings:normal;-moz-tab-size:4;tab-size:4;-webkit-tap-highlight-color:transparent}body{line-height:inherit;margin:0}h1{font-size:inherit;font-weight:inherit}pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-size:1em;font-variation-settings:normal}h1,p,pre{margin:0}*,:after,:before{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 transparent;--un-ring-shadow:0 0 transparent;--un-shadow-inset: ;--un-shadow:0 0 transparent;--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgba(147,197,253,.5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }.fixed{position:fixed}.left-0{left:0}.right-0{right:0}.z-10{z-index:10}.mb-6{margin-bottom:1.5rem}.mb-8{margin-bottom:2rem}.h-auto{height:auto}.min-h-screen{min-height:100vh}.flex{display:flex}.flex-1{flex:1 1 0%}.flex-col{flex-direction:column}.overflow-y-auto{overflow-y:auto}.rounded-t-md{border-top-left-radius:.375rem;border-top-right-radius:.375rem}.bg-black\\/5{background-color:#0000000d}.bg-white{--un-bg-opacity:1;background-color:rgb(255 255 255/var(--un-bg-opacity))}.p-8{padding:2rem}.px-10{padding-left:2.5rem;padding-right:2.5rem}.pt-14{padding-top:3.5rem}.text-6xl{font-size:3.75rem;line-height:1}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-black{--un-text-opacity:1;color:rgb(0 0 0/var(--un-text-opacity))}.font-light{font-weight:300}.font-medium{font-weight:500}.leading-tight{line-height:1.25}.font-sans{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji}.antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}@media (prefers-color-scheme:dark){.dark\\:bg-black{--un-bg-opacity:1;background-color:rgb(0 0 0/var(--un-bg-opacity))}.dark\\:bg-white\\/10{background-color:#ffffff1a}.dark\\:text-white{--un-text-opacity:1;color:rgb(255 255 255/var(--un-text-opacity))}}@media (min-width:640px){.sm\\:text-2xl{font-size:1.5rem;line-height:2rem}.sm\\:text-8xl{font-size:6rem;line-height:1}}</style><script>!function(){const e=document.createElement("link").relList;if(!(e&&e.supports&&e.supports("modulepreload"))){for(const e of document.querySelectorAll('link[rel="modulepreload"]'))r(e);new MutationObserver((e=>{for(const o of e)if("childList"===o.type)for(const e of o.addedNodes)"LINK"===e.tagName&&"modulepreload"===e.rel&&r(e)})).observe(document,{childList:!0,subtree:!0})}function r(e){if(e.ep)return;e.ep=!0;const r=function(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),"use-credentials"===e.crossOrigin?r.credentials="include":"anonymous"===e.crossOrigin?r.credentials="omit":r.credentials="same-origin",r}(e);fetch(e.href,r)}}();<\/script></head><body class="antialiased bg-white dark:bg-black dark:text-white flex flex-col font-sans min-h-screen pt-14 px-10 text-black"><div class="fixed left-0 right-0 spotlight"></div><h1 class="font-medium mb-6 sm:text-8xl text-6xl">` + messages.statusCode + '</h1><p class="font-light leading-tight mb-8 sm:text-2xl text-xl">' + messages.description + '</p><div class="bg-black/5 bg-white dark:bg-white/10 flex-1 h-auto overflow-y-auto rounded-t-md"><pre class="font-light leading-tight p-8 text-xl z-10">' + messages.stack + "</pre></div></body></html>";
};

const errorDev = /*#__PURE__*/Object.freeze({
  __proto__: null,
  template: template$1
});

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

const PA_COLORS = {
  daycare: "#618B2F",
  preescolar: "#E83F4B",
  primaria: "#FCBF2C",
  secundaria: "#66A8D8",
  iedis: "#007F92",
  gray: "#50535A",
  muted: "#86888C"
};
const THEME_LABELS = {
  daycare: "IECS",
  preescolar: "Preescolar",
  primaria: "Primaria",
  secundaria: "Secundaria",
  iedis: "IEDIS"
};
const THEME_SHORT_LABELS = {
  daycare: "Daycare",
  preescolar: "Preescolar",
  primaria: "Primaria",
  secundaria: "Secundaria",
  iedis: "IEDIS"
};
const THEME_ENGLISH_LABELS = {
  daycare: "Daycare",
  preescolar: "Preschool",
  primaria: "Elementary School",
  secundaria: "Middle School",
  iedis: "Institutional"
};
const THEME_LOGOS = {
  daycare: { logo: "/brand/iecs-logo.png", wordmark: "/brand/iecs-wordmark-gradient.png" },
  preescolar: { logo: "/brand/iecs-logo.png", wordmark: "/brand/iecs-wordmark-gradient.png" },
  primaria: { logo: "/brand/iedis-logo.png", wordmark: "/brand/iedis-wordmark-gradient.png" },
  secundaria: { logo: "/brand/iedis-logo.png", wordmark: "/brand/iedis-wordmark-gradient.png" },
  iedis: { logo: "/brand/iedis-logo.png", wordmark: "/brand/iedis-wordmark-gradient.png" }
};
const THEME_MASCOT_VARIANTS = {
  daycare: {
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
  },
  iedis: {
    header: "/personas-autorizadas/ambassadors/secundaria-hope.png",
    hero: "/personas-autorizadas/mascots/hope-secundaria/4-HOPE-SECUNDARIA/HOPE-1.png",
    empty: "/personas-autorizadas/mascots/hope-secundaria/4-HOPE-SECUNDARIA/HOPE-5.png",
    help: "/personas-autorizadas/mascots/hope-secundaria/4-HOPE-SECUNDARIA/HOPE-3.png",
    preview: "/personas-autorizadas/mascots/hope-secundaria/4-HOPE-SECUNDARIA/HOPE-7.png",
    transition: "/personas-autorizadas/mascots/hope-secundaria/4-HOPE-SECUNDARIA/HOPE-4.png"
  }
};
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
  return luminance > 0.68 ? "#2A2A2A" : "#FFFFFF";
}
function theme(key, primary) {
  return {
    key,
    label: THEME_LABELS[key],
    shortLabel: THEME_SHORT_LABELS[key],
    englishLabel: THEME_ENGLISH_LABELS[key],
    primary,
    contrast: contrastFor(primary),
    soft: alpha(primary, 0.12),
    border: alpha(primary, 0.28),
    muted: PA_COLORS.muted,
    gray: PA_COLORS.gray,
    institutional: PA_COLORS.iedis,
    mascot: THEME_MASCOT_VARIANTS[key].header,
    mascotVariants: THEME_MASCOT_VARIANTS[key],
    logo: THEME_LOGOS[key].logo,
    wordmark: THEME_LOGOS[key].wordmark
  };
}
const PERSONAS_THEMES = {
  daycare: theme("daycare", PA_COLORS.daycare),
  preescolar: theme("preescolar", PA_COLORS.preescolar),
  primaria: theme("primaria", PA_COLORS.primaria),
  secundaria: theme("secundaria", PA_COLORS.secundaria),
  iedis: theme("iedis", PA_COLORS.iedis)
};
function normalizePlantel(value) {
  return String(value || "").trim().toUpperCase();
}
function normalizeNivel(value) {
  return String(value || "").trim().toLowerCase();
}
function personasThemeKeyFromMatricula(value) {
  const matricula = normalizeMatricula(value);
  if (matricula.startsWith("PREEM") || matricula.startsWith("PREET")) return "preescolar";
  if (matricula.startsWith("PM") || matricula.startsWith("PT")) return "primaria";
  if (matricula.startsWith("SM") || matricula.startsWith("ST")) return "secundaria";
  return "daycare";
}
function resolvePersonasTheme(input) {
  const matricula = normalizeMatricula(input.matricula);
  if (matricula) return PERSONAS_THEMES[personasThemeKeyFromMatricula(matricula)];
  const explicit = String(input.themeKey || "").trim().toLowerCase();
  if (explicit && PERSONAS_THEMES[explicit]) return PERSONAS_THEMES[explicit];
  const plantel = normalizePlantel(input.plantel || input.campus);
  const nivel = normalizeNivel(input.nivelEdu);
  if (nivel.includes("preescolar") || nivel.includes("kinder") || nivel.includes("maternal")) return PERSONAS_THEMES.preescolar;
  if (plantel === "PT" || plantel === "PM" || nivel.includes("primaria") || nivel.includes("elementary")) return PERSONAS_THEMES.primaria;
  if (plantel === "ST" || plantel === "SM" || nivel.includes("secundaria") || nivel.includes("secondary")) return PERSONAS_THEMES.secundaria;
  if (plantel === "IEDIS" || nivel.includes("iedis")) return PERSONAS_THEMES.iedis;
  return PERSONAS_THEMES.daycare;
}
function allPersonasThemes() {
  return Object.values(PERSONAS_THEMES);
}
function personasInstitutionName(theme2) {
  return theme2.key === "daycare" || theme2.key === "preescolar" ? "IECS" : "IEDIS";
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
function errorSummary$1(error) {
  var _a;
  if (!error || typeof error !== "object") return { message: String(error || "unknown") };
  const candidate = error;
  return {
    message: candidate.sqlMessage || candidate.statusMessage || candidate.message || "unknown",
    code: candidate.code,
    errno: candidate.errno,
    sqlState: candidate.sqlState,
    statusCode: candidate.statusCode,
    statusMessage: candidate.statusMessage,
    stack: (_a = candidate.stack) == null ? void 0 : _a.split("\n").slice(0, 3).join("\n")
  };
}
function logSecurityDiagnostic(scope, error, context = {}) {
  const payload = {
    scope,
    at: (/* @__PURE__ */ new Date()).toISOString(),
    error: errorSummary$1(error),
    context: safeContext(context)
  };
  console.error(`[account-security:${scope}] ${JSON.stringify(payload)}`);
}
function logSecurityWarning(scope, context = {}) {
  const payload = {
    scope,
    at: (/* @__PURE__ */ new Date()).toISOString(),
    context: safeContext(context)
  };
  console.warn(`[account-security:${scope}] ${JSON.stringify(payload)}`);
}

function decodePrivateKey(raw, rawBase64) {
  const fromText = String(raw || "").trim();
  if (fromText) return fromText.replace(/\\n/g, "\n");
  const fromBase64 = String(rawBase64 || "").trim();
  if (!fromBase64) return "";
  try {
    return Buffer.from(fromBase64, "base64").toString("utf8").replace(/\\n/g, "\n");
  } catch {
    return "";
  }
}
function getRecoveryEmailConfig() {
  const config = useRuntimeConfig();
  const recovery = config.passwordRecovery || {};
  const mode = String(recovery.emailMode || "gmail").trim().toLowerCase() === "preview" ? "preview" : "gmail";
  const privateKey = decodePrivateKey(recovery.googleServiceAccountPrivateKey, recovery.googleServiceAccountPrivateKeyBase64);
  return {
    mode,
    fromEmail: String(recovery.fromEmail || "").trim(),
    fromName: String(recovery.fromName || "Husky Pass").trim(),
    serviceAccountEmail: String(recovery.googleServiceAccountEmail || "").trim(),
    privateKey,
    delegatedUser: String(recovery.googleDelegatedUser || "").trim()
  };
}
function assertGmailConfig(config) {
  const missing = [
    ["PASSWORD_RECOVERY_FROM_EMAIL", config.fromEmail],
    ["GOOGLE_SERVICE_ACCOUNT_EMAIL", config.serviceAccountEmail],
    ["GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64", config.privateKey],
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

const latestPreview_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: latestPreview_get
});

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
function defaultFamilyRoute(user) {
  const daycare = hasFamilyScope(user, "daycare");
  const personas = hasFamilyScope(user, "personasAutorizadas");
  if (daycare && personas) return "/familia";
  if (daycare) return "/familia/daycare";
  if (personas) return "/familia/personas-autorizadas";
  return "/login";
}

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
    throw createError({ statusCode: 403, statusMessage: "Acceso de guarder\xEDa no autorizado" });
  }
}
function assertPersonasAutorizadasFamily(user) {
  if (!hasFamilyProductScope(user, "personasAutorizadas")) {
    throw createError({ statusCode: 403, statusMessage: "Acceso a Personas Autorizadas no autorizado" });
  }
}
function assertDaycareAdmin(user) {
  if (user.kind !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Acceso administrativo no autorizado" });
  }
  if (isSuperAdmin(user)) return;
  const hasDaycarePermission = hasRoleToken(user.roles, DAYCARE_ADMIN_ROLE) || user.routes.some((route) => /guarder[ií]a|husky|daycare/i.test(route.route));
  if (!hasDaycarePermission || user.unidades.length === 0) {
    throw createError({ statusCode: 403, statusMessage: "El usuario no tiene alcance de guarder\xEDa" });
  }
}
function assertAccessHistoryAdmin(user) {
  if (user.kind !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Acceso administrativo no autorizado" });
  }
  if (isSuperAdmin(user)) return;
  const routeText = user.routes.map((route) => route.route).join(" ");
  const roleText = user.roles.join(" ");
  const hasReportAccess = /personas[_/-]?autorizadas|persona[-_]?autorizada|credencial|marbete|validar|historial|acceso|husky/i.test(`${routeText} ${roleText}`);
  if (!hasReportAccess) {
    throw createError({ statusCode: 403, statusMessage: "El usuario no tiene alcance para consultar historial de accesos." });
  }
}
function assertUnidadAccess(user, unidad) {
  if (isSuperAdmin(user)) return;
  if (!user.unidades.includes(unidad)) {
    throw createError({ statusCode: 403, statusMessage: "Unidad fuera del alcance del usuario" });
  }
}
function assertSalaAccess(user, sala) {
  var _a, _b;
  if (user.kind === "admin") return;
  const scopeSala = ((_b = (_a = user.scopes) == null ? void 0 : _a.daycare) == null ? void 0 : _b.sala) || user.sala;
  if (scopeSala && String(scopeSala) !== String(sala)) {
    throw createError({ statusCode: 403, statusMessage: "Sala fuera del alcance del usuario" });
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
    if (candidate.statusCode && candidate.statusMessage) return error;
    if (candidate.code === "PROTOCOL_SEQUENCE_TIMEOUT") {
      return createError({ statusCode: 504, statusMessage: "La consulta a base de datos excedi\xF3 el tiempo de espera. Intenta de nuevo." });
    }
    if (isTransientMysqlError$1(error)) {
      return createError({ statusCode: 503, statusMessage: "La conexi\xF3n a base de datos se perdi\xF3. Intenta de nuevo." });
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
    try {
      const [result] = await getPool().execute({ sql, values: params, timeout: DEFAULT_QUERY_TIMEOUT_MS$1 });
      return result;
    } catch (error) {
      lastError = error;
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
    if (candidate.statusCode && candidate.statusMessage) return error;
    if (candidate.code === "PROTOCOL_SEQUENCE_TIMEOUT") {
      return createError({ statusCode: 504, statusMessage: "La consulta de asistencia excedi\xF3 el tiempo de espera. Intenta de nuevo." });
    }
    if (isTransientMysqlError(error)) {
      return createError({ statusCode: 503, statusMessage: "La base de asistencia no est\xE1 disponible. Intenta de nuevo." });
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
    try {
      const [result] = await getAttendancePool().execute({ sql, values: params, timeout: DEFAULT_QUERY_TIMEOUT_MS });
      return result;
    } catch (error) {
      lastError = error;
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
  const raw = await readFile(join(process.cwd(), "public", "grupo-icons", "manifest.json"), "utf8");
  const parsed = JSON.parse(raw);
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
  if (!matricula) throw createError({ statusCode: 403, statusMessage: "La cuenta familiar no tiene matr\xEDcula vinculada." });
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
  if (!current) throw createError({ statusCode: 404, statusMessage: "No encontramos la matr\xEDcula vinculada a esta cuenta familiar." });
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
    throw createError({ statusCode: 404, statusMessage: "No encontramos alumnos vinculados a esta cuenta familiar." });
  }
  return children;
}
async function resolveAttendanceChild(user, matricula) {
  const children = await getAttendanceChildrenForFamily(user);
  const requested = normalizeMatricula(matricula);
  const selected = requested ? children.find((child) => child.matricula === requested) : children.find((child) => child.isCurrent) || children[0];
  if (!selected) {
    throw createError({ statusCode: 403, statusMessage: "El alumno solicitado no pertenece a esta cuenta familiar." });
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
  if (!row) throw createError({ statusCode: 404, statusMessage: "No encontramos la inasistencia solicitada." });
  const recordDate = dateOnly(row.fecha);
  if (!recordDate || !dateInRange(recordDate, selectedSchoolYear)) {
    throw createError({ statusCode: 403, statusMessage: "La inasistencia est\xE1 fuera del ciclo seleccionado." });
  }
  if (!dbAbsenceMatchesChild(selected, row)) {
    throw createError({ statusCode: 403, statusMessage: "La inasistencia no pertenece al alumno seleccionado." });
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

const accessHistory = /*#__PURE__*/Object.freeze({
  __proto__: null,
  accessHistoryCsv: accessHistoryCsv,
  getAdminAccessHistory: getAdminAccessHistory,
  getFamilyAccessHistory: getFamilyAccessHistory,
  resolveAccessHistoryRange: resolveAccessHistoryRange
});

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
    throw createError({ statusCode: 401, statusMessage: "Sesi\xF3n no v\xE1lida" });
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

const export_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: export_get
});

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

const index_get$7 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: index_get$6
});

const TEMPLATE_DIR = join(process.cwd(), "data", "marbete-templates");
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
  const themeKey = VALID_THEME_KEYS.has(row.themeKey) ? row.themeKey : "daycare";
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
async function listMarbeteTemplates() {
  await ensureTemplateDir();
  try {
    const raw = await readFile(TEMPLATE_INDEX, "utf8");
    const parsed = JSON.parse(raw);
    return parsed.map(normalizeTemplate).filter(Boolean);
  } catch {
    return [];
  }
}
function marbeteTemplateThemes() {
  return allPersonasThemes();
}
async function readMarbeteTemplateSvg(template) {
  const svg = await readFile(join(TEMPLATE_DIR, template.filename), "utf8");
  if (!svg.includes("<svg")) throw createError({ statusCode: 422, statusMessage: "La plantilla SVG no es valida." });
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
  return templates.find((template) => template.themeKey === "daycare") || templates[0];
}
async function saveMarbeteTemplate(input) {
  var _a, _b, _c, _d, _e, _f;
  if (!VALID_THEME_KEYS.has(input.themeKey)) {
    throw createError({ statusCode: 400, statusMessage: "Tema de plantilla invalido." });
  }
  const templates = await listMarbeteTemplates();
  const existingIndex = input.id ? templates.findIndex((template) => template.id === input.id) : -1;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const baseId = input.id || safeId(input.name || `${input.themeKey}-${input.nivel}`) || `template-${Date.now()}`;
  const existing = existingIndex >= 0 ? templates[existingIndex] : null;
  if (!existing && !((_b = (_a = input.file) == null ? void 0 : _a.data) == null ? void 0 : _b.length)) {
    throw createError({ statusCode: 400, statusMessage: "Agrega un archivo SVG para crear la plantilla." });
  }
  const filename = ((_d = (_c = input.file) == null ? void 0 : _c.data) == null ? void 0 : _d.length) ? filenameFor(`${safeId(baseId)}-${Date.now()}`) : (existing == null ? void 0 : existing.filename) || filenameFor(safeId(baseId));
  if ((_f = (_e = input.file) == null ? void 0 : _e.data) == null ? void 0 : _f.length) {
    const sourceName = String(input.file.filename || "");
    if (!sourceName.toLowerCase().endsWith(".svg")) throw createError({ statusCode: 415, statusMessage: "La plantilla debe ser SVG." });
    const text = input.file.data.toString("utf8");
    if (!text.includes("<svg")) throw createError({ statusCode: 422, statusMessage: "El archivo no parece ser una plantilla SVG valida." });
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
  if (!String(values.fullnameA || "").trim()) issues.push(missingLabelFor("fullnameA"));
  if (!String(values.matricula || "").trim()) issues.push(missingLabelFor("matricula"));
  if (!String(values.plantel || "").trim()) issues.push(missingLabelFor("plantel"));
  if (!String(values.nivel || values.nivelEdu || "").trim()) issues.push(missingLabelFor("nivel"));
  if (!String(values.grado || values.gradoA || "").trim()) issues.push(missingLabelFor("grado"));
  if (!String(values.grupo || values.grupoA || "").trim()) issues.push(missingLabelFor("grupo"));
  if (!String(values.validityLabel || "").trim()) issues.push(missingLabelFor("validityLabel"));
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
  if (!isSuperAdmin(user)) throw createError({ statusCode: 403, statusMessage: "Solo superadmin puede ver plantillas." });
  const id = String(getRouterParam(event, "id") || "");
  const template = (await listMarbeteTemplates()).find((item) => item.id === id);
  if (!template) throw createError({ statusCode: 404, statusMessage: "Plantilla no encontrada." });
  setHeader(event, "Content-Type", "image/svg+xml; charset=utf-8");
  setHeader(event, "Cache-Control", "private, no-store");
  return readMarbeteTemplateSvg(template);
});

const _id__get$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__get$2
});

const index_get$4 = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  if (!isSuperAdmin(user)) throw createError({ statusCode: 403, statusMessage: "Solo superadmin puede gestionar plantillas." });
  return {
    templates: await listMarbeteTemplates(),
    themes: marbeteTemplateThemes()
  };
});

const index_get$5 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: index_get$4
});

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
  if (!isSuperAdmin(user)) throw createError({ statusCode: 403, statusMessage: "Solo superadmin puede gestionar plantillas." });
  const parts = await readMultipartFormData(event);
  if (!(parts == null ? void 0 : parts.length)) throw createError({ statusCode: 400, statusMessage: "Formulario de plantilla vacio." });
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

const index_post$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: index_post$2
});

const CONFIG_DIR = join(process.cwd(), "data", "personas-autorizadas");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");
const ACCESS_ACTION_PATH = join(CONFIG_DIR, "access-actions.json");
const SURVEY_NIVEL_OPTIONS = [
  { key: "preescolar", label: "Preescolar" },
  { key: "primaria", label: "Primaria" },
  { key: "secundaria", label: "Secundaria" },
  { key: "daycare", label: "IECS / fallback" }
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
    preescolar: defaultSurvey("Encuesta Preescolar"),
    primaria: defaultSurvey("Encuesta Primaria"),
    secundaria: defaultSurvey("Encuesta Secundaria"),
    daycare: defaultSurvey("Encuesta IECS")
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
  } catch {
    await writePersonasConfig(defaultConfig);
    return defaultConfig;
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
  return key === "preescolar" || key === "primaria" || key === "secundaria" ? key : "daycare";
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
    rows = [];
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
    const template = selectMarbeteTemplate(templates, { matricula, plantel, nivelEdu: nivel, themeKey: theme.key });
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
      issues.push(issue("missingPrintableReadiness", missingRegisteredPhotos ? "Foto pendiente en persona registrada" : "Marbete no disponible"));
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
    const template = selectMarbeteTemplate(templates, {
      matricula: printable.matricula,
      plantel: printable.plantel,
      nivelEdu: printable.nivelEdu,
      themeKey: theme.key
    });
    let readiness = { ok: false, issues: ["Plantilla de Husky Pass no disponible."] };
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
  if (!isSuperAdmin(admin)) throw createError({ statusCode: 403, statusMessage: "Solo superadmin puede preparar acceso Husky Pass." });
  const body = schema$x.parse(await readBody(event));
  const user = await getPersonasAccessUser(body.userId);
  if (!user) throw createError({ statusCode: 404, statusMessage: "Familia no encontrada." });
  const userLogin = displayMatriculaCandidate(user.username);
  const login = user.email || userLogin || "";
  if (!login) throw createError({ statusCode: 422, statusMessage: "La familia no tiene correo ni usuario para preparar acceso." });
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

const accessAction_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: accessAction_post
});

const config_get$2 = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  if (!isSuperAdmin(user)) throw createError({ statusCode: 403, statusMessage: "Solo superadmin puede ver la configuracion de Personas Autorizadas." });
  return readPersonasConfig();
});

const config_get$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: config_get$2
});

const surveySchema = z.object({
  enabled: z.boolean().optional().default(false),
  title: z.string().trim().optional().default(""),
  embedUrl: z.string().trim().optional().default("")
});
const schema$w = z.object({
  surveyEnabled: z.boolean().optional().default(false),
  surveyTitle: z.string().trim().optional().default("Encuesta Personas Autorizadas"),
  surveyEmbedUrl: z.string().trim().optional().default(""),
  surveysByNivel: z.record(z.enum(["preescolar", "primaria", "secundaria", "daycare"]), surveySchema).optional(),
  conveniosUrl: z.string().trim().optional().default(""),
  helpUrl: z.string().trim().optional().default("")
});
function assertOptionalUrl(value, label) {
  if (!value || value.startsWith("/uploads/")) return;
  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("bad-protocol");
  } catch {
    throw createError({ statusCode: 400, statusMessage: `${label} debe ser una URL valida.` });
  }
}
const config_post = defineEventHandler(async (event) => {
  var _a;
  const user = requireSession(event, "admin");
  if (!isSuperAdmin(user)) throw createError({ statusCode: 403, statusMessage: "Solo superadmin puede configurar Personas Autorizadas." });
  const body = schema$w.parse(await readBody(event));
  if (body.surveyEnabled && !/^https:\/\/docs\.google\.com\/forms\//i.test(body.surveyEmbedUrl)) {
    throw createError({ statusCode: 400, statusMessage: "La encuesta activa debe ser un Google Form." });
  }
  for (const option of SURVEY_NIVEL_OPTIONS) {
    const survey = (_a = body.surveysByNivel) == null ? void 0 : _a[option.key];
    if (!survey) continue;
    if (survey.enabled && !/^https:\/\/docs\.google\.com\/forms\//i.test(survey.embedUrl)) {
      throw createError({ statusCode: 400, statusMessage: `La encuesta de ${option.label} debe ser un Google Form.` });
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

const config_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: config_post
});

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

function errorSummary(error) {
  var _a;
  if (!error || typeof error !== "object") return { message: String(error || "unknown") };
  const candidate = error;
  return {
    message: candidate.sqlMessage || candidate.statusMessage || candidate.message || "unknown",
    code: candidate.code,
    errno: candidate.errno,
    sqlState: candidate.sqlState,
    statusCode: candidate.statusCode,
    statusMessage: candidate.statusMessage,
    stack: (_a = candidate.stack) == null ? void 0 : _a.split("\n").slice(0, 3).join("\n")
  };
}
function logPersonasDiagnostic(scope, error, context = {}) {
  const payload = {
    scope,
    at: (/* @__PURE__ */ new Date()).toISOString(),
    error: errorSummary(error),
    context
  };
  console.error(`[personas-autorizadas:${scope}] ${JSON.stringify(payload)}`);
}
function logPersonasWarning(scope, context = {}) {
  const payload = {
    scope,
    at: (/* @__PURE__ */ new Date()).toISOString(),
    context
  };
  console.warn(`[personas-autorizadas:${scope}] ${JSON.stringify(payload)}`);
}

const FRIENDLY_TEXT_MESSAGE = "Necesitamos completar algunos datos antes de descargar el Husky Pass.";
const FRIENDLY_IMAGE_MESSAGE = "Para descargar el Husky Pass, actualiza la foto de la persona autorizada o solicita apoyo a la escuela.";
const FRIENDLY_RENDER_MESSAGE = "No pudimos preparar el Husky Pass en este momento. Intenta nuevamente o solicita apoyo a la escuela.";
const LOCAL_MONTSERRAT_CANDIDATES = [
  resolve(process.cwd(), "public/fonts/Montserrat-SemiBold.ttf"),
  resolve(process.cwd(), "public/fonts/Montserrat-SemiBold.woff2"),
  resolve(process.cwd(), "public/fonts/Montserrat.ttf"),
  resolve(process.cwd(), "node_modules/@fontsource/montserrat/files/montserrat-latin-600-normal.woff2"),
  resolve(process.cwd(), "node_modules/@fontsource/montserrat/files/montserrat-latin-ext-600-normal.woff2")
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
  return createError({
    statusCode,
    statusMessage,
    data: {
      diagnostic: {
        code,
        ...details
      }
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
  if (!/^https?:\/\//i.test(target)) {
    throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, "invalid-image-url", { key, url: publicDiagnosticUrl(target), reason: "not-http-or-public" });
  }
  let response;
  try {
    response = await fetch(target, { signal: AbortSignal.timeout(15e3) });
  } catch (error) {
    throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, "image-fetch-failed", {
      key,
      url: publicDiagnosticUrl(target),
      message: error instanceof Error ? error.message : String(error)
    });
  }
  if (!response.ok) {
    throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, "image-fetch-failed", {
      key,
      url: publicDiagnosticUrl(target),
      status: response.status,
      statusText: response.statusText
    });
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length) throw diagnosticError(422, FRIENDLY_IMAGE_MESSAGE, "image-empty", { key, url: publicDiagnosticUrl(target) });
  return {
    bytes,
    mime: assertRenderableImageMime(mimeFromContentType(response.headers.get("content-type"), target))
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
    "paternoP",
    "parenP",
    "fullnameP",
    "fullnameA",
    "matricula",
    "nivel",
    "grado",
    "grupo",
    "plantel",
    "validityLabel"
  ]);
}
function requiredImageKeys(input) {
  return unique(dynamicImageTokens(input.templateSvg));
}
function chromiumPath() {
  return CHROMIUM_CANDIDATES.find((candidate) => candidate && existsSync(candidate)) || "";
}
async function fontFaceCss() {
  const fontPath = LOCAL_MONTSERRAT_CANDIDATES.find((candidate) => candidate && existsSync(candidate)) || "";
  if (!fontPath) {
    throw diagnosticError(503, FRIENDLY_RENDER_MESSAGE, "font-not-found", {
      candidates: LOCAL_MONTSERRAT_CANDIDATES
    });
  }
  const bytes = await readFile(fontPath);
  const format = fontPath.endsWith(".woff2") ? "woff2" : "truetype";
  const mime = fontPath.endsWith(".woff2") ? "font/woff2" : "font/ttf";
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
async function composeMarbeteHtml(input) {
  const completeSvg = await inlineSvgImages(input.renderedSvg, input.origin);
  if (/{{\s*[^}]+\s*}}/.test(completeSvg)) {
    throw diagnosticError(422, FRIENDLY_TEXT_MESSAGE, "unresolved-svg-token", {
      tokens: Array.from(completeSvg.matchAll(/{{\s*([^}]+)\s*}}/g)).map((match) => match[1]).slice(0, 20)
    });
  }
  const fontCss = await fontFaceCss();
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
function runChromium(executable, htmlFile, pdfFile) {
  const args = [
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
  const executable = chromiumPath();
  if (!executable) {
    throw diagnosticError(503, FRIENDLY_RENDER_MESSAGE, "chromium-not-found", {
      candidates: CHROMIUM_CANDIDATES.filter(Boolean)
    });
  }
  const workDir = join(tmpdir(), `husky-pass-${randomUUID()}`);
  await mkdir(workDir, { recursive: true });
  const htmlFile = join(workDir, "husky-pass.html");
  const pdfFile = join(workDir, "husky-pass.pdf");
  try {
    await writeFile(htmlFile, html, "utf8");
    await runChromium(executable, htmlFile, pdfFile);
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
  const html = await composeMarbeteHtml(pdfInput);
  return renderHtmlToPdf(html);
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
  if (!isSuperAdmin(user)) throw createError({ statusCode: 403, statusMessage: "Solo superadmin puede generar Husky Pass." });
  const query = schema$v.parse(getQuery$1(event));
  const origin = getRequestURL(event).origin;
  const fixtureIndex = query.id - 9e3;
  const data = fixtureIndex >= 0 && fixtureIndex < DEV_HUSKY_PASS_VARIANTS.length ? buildDevPrintableAuthorizedPerson({ origin, variantId: DEV_HUSKY_PASS_VARIANTS[fixtureIndex].id, scenarioId: query.scenario }).data : await getSuperAdminPrintableAuthorizedPersona(query.id);
  if (!data) throw createError({ statusCode: 404, statusMessage: "Persona autorizada no encontrada." });
  const templates = await listMarbeteTemplates();
  const template = selectMarbeteTemplate(templates, {
    matricula: data.matricula,
    plantel: data.plantel,
    nivelEdu: data.nivelEdu
  });
  if (!template) throw createError({ statusCode: 503, statusMessage: "El Husky Pass no esta disponible para este alumno." });
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
    throw createError({ statusCode: 422, statusMessage: firstIssue$1(readiness.issues) });
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

const marbete_get$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: marbete_get$2
});

const schema$u = z.object({
  search: z.string().optional().default(""),
  plantel: z.string().optional().default(""),
  nivel: z.string().optional().default(""),
  fixture: z.string().optional().default(""),
  limit: z.coerce.number().int().min(10).max(200).optional().default(80)
});
const passSearch_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  if (!isSuperAdmin(user)) throw createError({ statusCode: 403, statusMessage: "Solo superadmin puede generar Husky Pass." });
  const query = schema$u.parse(getQuery$1(event));
  const origin = getRequestURL(event).origin;
  if (query.fixture === "1" && true) {
    const templates = await listMarbeteTemplates();
    const rows = await Promise.all(DEV_HUSKY_PASS_VARIANTS.map(async (variant) => {
      const fixture = buildDevPrintableAuthorizedPerson({ origin, variantId: variant.id, scenarioId: "default" });
      const template = selectDevHuskyPassTemplate(templates, fixture.variant);
      const theme = resolvePersonasTheme({
        matricula: fixture.data.matricula,
        plantel: fixture.data.plantel,
        nivelEdu: fixture.data.nivelEdu,
        themeKey: fixture.variant.themeKey
      });
      let readiness = { ok: false, issues: ["Plantilla de Husky Pass no disponible."] };
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

const passSearch_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: passSearch_get
});

const schema$t = z.object({
  plantel: z.string().optional().default(""),
  nivel: z.string().optional().default(""),
  status: z.string().optional().default("all"),
  search: z.string().optional().default(""),
  limit: z.coerce.number().int().min(25).max(400).optional().default(120)
});
const readiness_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  if (!isSuperAdmin(user)) throw createError({ statusCode: 403, statusMessage: "Solo superadmin puede consultar readiness PA." });
  return getPersonasReadiness(schema$t.parse(getQuery$1(event)));
});

const readiness_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: readiness_get
});

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
    throw createError({ statusCode: 400, statusMessage: "Destino de carga no v\xE1lido." });
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
  throw createError({ statusCode: 415, statusMessage: "Tipo de archivo no permitido." });
}
function assertFile(input, options) {
  var _a;
  const size = ((_a = input.data) == null ? void 0 : _a.byteLength) || 0;
  if (!size) throw createError({ statusCode: 400, statusMessage: "Selecciona un archivo para subir." });
  if (size > options.maxBytes) {
    const mb = Math.round(options.maxBytes / 1024 / 1024);
    throw createError({ statusCode: 413, statusMessage: `El archivo excede ${mb} MB.` });
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
    throw createError({ statusCode: 400, statusMessage: "Destino de carga no v\xE1lido." });
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
      throw createError({ statusCode: 502, statusMessage: "El servicio de carga no devolvi\xF3 una URL v\xE1lida." });
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
    throw createError({ statusCode: 502, statusMessage: "No fue posible subir el archivo al expediente externo." });
  }
}
function dataUrlToUploadFile(src, filenamePrefix) {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(src || ""));
  if (!match) throw createError({ statusCode: 415, statusMessage: "La imagen debe ser PNG, JPG o WEBP." });
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
  if (!isSuperAdmin(user)) throw createError({ statusCode: 403, statusMessage: "Solo superadmin puede subir archivos." });
  const parts = await readMultipartFormData(event);
  const filePart = parts == null ? void 0 : parts.find((part) => {
    var _a2;
    return part.name === "file" && ((_a2 = part.data) == null ? void 0 : _a2.length);
  });
  if (!((_a = filePart == null ? void 0 : filePart.data) == null ? void 0 : _a.length)) throw createError({ statusCode: 400, statusMessage: "Selecciona un archivo para subir." });
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

const uploads_post$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: uploads_post$2
});

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
    throw createError({ statusCode: 403, statusMessage: "Solo superadmin puede consultar el directorio de usuarios." });
  }
  const query = schema$s.parse(getQuery$1(event));
  return listSuperAdminDirectory(query);
});

const users_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: users_get
});

const schema$r = z.object({ credential: z.string().min(1) });
const google_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  if (!config.googleClientId) {
    throw createError({ statusCode: 500, statusMessage: "GOOGLE_CLIENT_ID no est\xE1 configurado." });
  }
  const body = schema$r.parse(await readBody(event));
  const client = new OAuth2Client(config.googleClientId);
  const ticket = await client.verifyIdToken({ idToken: body.credential, audience: config.googleClientId });
  const payload = ticket.getPayload();
  const email = normalizeEmail(payload == null ? void 0 : payload.email);
  if (!email.endsWith("@casitaiedis.edu.mx")) {
    throw createError({ statusCode: 403, statusMessage: "El correo no pertenece a la instituci\xF3n." });
  }
  const legacyUser = await findLegacyUserByEmail(email);
  let sessionUser;
  if (!legacyUser) {
    throw createError({ statusCode: 401, statusMessage: "No hay ninguna cuenta interna creada con ese correo." });
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

const google_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: google_post
});

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
  if (!current) throw createError({ statusCode: 401, statusMessage: "Sesi\xF3n no v\xE1lida" });
  if (!isSuperAdmin(current)) {
    throw createError({ statusCode: 403, statusMessage: "La impersonaci\xF3n de cuentas est\xE1 reservada para superadmin" });
  }
  const body = schema$q.parse(await readBody(event));
  const legacyUser = await findLegacyUserById(body.userId);
  if (!legacyUser) throw createError({ statusCode: 404, statusMessage: "Cuenta familiar no encontrada" });
  const familyUser = legacyUser.toSession("family");
  if (!familyUser.productScopes.length) {
    throw createError({ statusCode: 403, statusMessage: "La cuenta no tiene acceso familiar habilitado" });
  }
  familyUser.impersonation = {
    startedAt: Date.now(),
    mode: "account",
    admin: adminOrigin(current)
  };
  setAppSession(event, familyUser);
  setCookie(event, "user_segment", familyUser.productScopes.includes("daycare") ? "daycare" : "premium", { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  return { user: familyUser, loggedin: true };
});

const impersonate_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: impersonate_post
});

function assertFamilyOwner(user, ownerId) {
  if (String(user.id) !== String(ownerId)) {
    throw createError({ statusCode: 403, statusMessage: "Registro fuera del alcance de la cuenta familiar" });
  }
}
function normalizeString(value) {
  if (value === void 0 || value === null) return null;
  const normalized = String(value).trim();
  return normalized || null;
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
  if (!matricula) throw createError({ statusCode: 403, statusMessage: "La cuenta familiar no tiene matr\xEDcula vinculada." });
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
      throw createError({ statusCode: 500, statusMessage: "La tabla de matr\xEDcula no tiene la columna requerida." });
    }
    return matriculaColumnCache;
  } catch (error) {
    logPersonasDiagnostic("matricula-schema-inspection-failed", error, { table: "matricula", action: "SHOW COLUMNS" });
    throw createError({ statusCode: 500, statusMessage: "No fue posible validar la estructura de matr\xEDcula." });
  }
}
async function getUsersColumnSet() {
  if (usersColumnCache) return usersColumnCache;
  try {
    const rows = await legacyQuery("SHOW COLUMNS FROM users");
    usersColumnCache = new Set(rows.map((row) => String(row.Field || "").trim()).filter(Boolean));
    if (!usersColumnCache.has("id") || !usersColumnCache.has("username")) {
      logPersonasWarning("users-schema-missing-primary-columns", { table: "users", requiredColumns: ["id", "username"] });
      throw createError({ statusCode: 500, statusMessage: "La tabla de usuarios no tiene columnas requeridas." });
    }
    return usersColumnCache;
  } catch (error) {
    logPersonasDiagnostic("users-schema-inspection-failed", error, { table: "users", action: "SHOW COLUMNS" });
    throw createError({ statusCode: 500, statusMessage: "No fue posible validar la estructura de usuarios." });
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
      logPersonasWarning("matricula-schema-missing-columns", { scope, missingColumns: missing, table: "matricula" });
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
  if (!sala) throw createError({ statusCode: 404, statusMessage: "Sala no encontrada" });
  assertUnidadAccess(user, sala.unidad);
  return { id: Number(sala.id), sala: sala.sala, unidad: sala.unidad };
}
async function getFamilyDashboard(user) {
  var _a, _b;
  const unidad = (_a = user.scopes.daycare) == null ? void 0 : _a.unidad;
  const sala = (_b = user.scopes.daycare) == null ? void 0 : _b.sala;
  if (!unidad || !sala) throw createError({ statusCode: 403, statusMessage: "La cuenta no tiene alcance de guarder\xEDa" });
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
    throw createError({ statusCode: 500, statusMessage: "No hay campos de matr\xEDcula configurados para consulta familiar." });
  }
  try {
    const columns = selectFields.map(quoteIdentifier).join(", ");
    const row = await legacyOne(`SELECT ${columns} FROM matricula WHERE matricula = ? LIMIT 1`, [matricula]);
    if (!row) {
      logPersonasWarning("student-profile-matricula-not-found", { userId: user.id, matricula });
      throw createError({ statusCode: 404, statusMessage: "No encontramos la matr\xEDcula vinculada a esta cuenta familiar." });
    }
    const plantel = derivePlantelFromMatricula(matricula, row.nivel, user.campus || user.empresa);
    return pickStudentProfile(row, plantel, editableFields);
  } catch (error) {
    logPersonasDiagnostic("student-profile-load-failed", error, {
      userId: user.id,
      matricula,
      selectedColumns: selectFields,
      missingReadonlyColumns: STUDENT_READONLY_FIELDS.filter((field) => !columnSet.has(field)),
      missingEditableColumns: PARENT_EDITABLE_STUDENT_FIELDS.filter((field) => !columnSet.has(field))
    });
    throw error;
  }
}
async function updateEditableStudentProfile(user, patch) {
  const matricula = assertFamilyMatricula(user);
  const columnSet = await getMatriculaColumnSet();
  const entries = Object.entries(patch).filter(([field]) => PARENT_EDITABLE_STUDENT_FIELDS.includes(field));
  if (!entries.length) throw createError({ statusCode: 400, statusMessage: "No hay campos familiares autorizados para guardar." });
  const missingColumns = entries.map(([field]) => field).filter((field) => !columnSet.has(field));
  if (missingColumns.length) {
    logPersonasWarning("student-profile-update-missing-columns", { userId: user.id, matricula, missingColumns });
    throw createError({ statusCode: 400, statusMessage: "Algunos campos familiares no est\xE1n disponibles para actualizaci\xF3n." });
  }
  try {
    const assignments = entries.map(([field]) => `${quoteIdentifier(field)} = ?`).join(", ");
    const values = entries.map(([, value]) => normalizeString(value));
    const result = await legacyWrite(`UPDATE matricula SET ${assignments} WHERE matricula = ?`, [...values, matricula]);
    if (!result.affectedRows) {
      logPersonasWarning("student-profile-update-matricula-not-found", { userId: user.id, matricula, updatedFields: entries.map(([field]) => field) });
      throw createError({ statusCode: 404, statusMessage: "No encontramos la matr\xEDcula vinculada a esta cuenta familiar." });
    }
    return getEditableStudentProfile(user);
  } catch (error) {
    logPersonasDiagnostic("student-profile-update-failed", error, { userId: user.id, matricula, updatedFields: entries.map(([field]) => field) });
    throw error;
  }
}
async function updateStudentCredentialPhoto(user, photoUrl) {
  const matricula = assertFamilyMatricula(user);
  const columnSet = await getMatriculaColumnSet();
  if (!columnSet.has("foto")) {
    logPersonasWarning("student-photo-update-missing-column", { userId: user.id, matricula, missingColumn: "foto", table: "matricula" });
    throw createError({ statusCode: 400, statusMessage: "La foto del alumno no est\xE1 disponible para actualizaci\xF3n." });
  }
  const value = normalizeString(photoUrl);
  if (!value) throw createError({ statusCode: 400, statusMessage: "La foto es obligatoria." });
  try {
    const result = await legacyWrite("UPDATE matricula SET foto = ? WHERE matricula = ?", [value, matricula]);
    if (!result.affectedRows) {
      logPersonasWarning("student-photo-update-matricula-not-found", { userId: user.id, matricula });
      throw createError({ statusCode: 404, statusMessage: "No encontramos la matr\xEDcula vinculada a esta cuenta familiar." });
    }
    return getEditableStudentProfile(user);
  } catch (error) {
    logPersonasDiagnostic("student-photo-update-failed", error, { userId: user.id, matricula });
    throw error;
  }
}
async function getFamilyResources(user, type) {
  var _a, _b;
  const unidad = (_a = user.scopes.daycare) == null ? void 0 : _a.unidad;
  const sala = (_b = user.scopes.daycare) == null ? void 0 : _b.sala;
  if (!unidad || !sala) throw createError({ statusCode: 403, statusMessage: "La cuenta no tiene alcance de guarder\xEDa" });
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
    `${matriculaSelect(columnSet, "foto")} AS foto`,
    ...REQUIRED_PARENT_NAME_FIELDS.map((field) => `${matriculaSelect(columnSet, field)} AS ${field}`),
    `${usersSelect(userColumnSet, "id")} AS user_id`,
    `${usersSelect(userColumnSet, "campus")} AS campus`
  ].join(",\n       ");
  try {
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
    const missingParentColumns = REQUIRED_PARENT_NAME_FIELDS.filter((field) => !columnSet.has(field));
    if (missingParentColumns.length) {
      logPersonasWarning("siblings-required-parent-columns-missing", { userId: user.id, matricula: currentMatricula, missingColumns: missingParentColumns });
      const child = mapMatriculaChild({ ...current, user_id: current.user_id || user.id, campus: current.campus || user.campus }, currentMatricula, user.campus || user.empresa);
      return [{ ...child, siblingMatch: "unavailable", canSwitch: false }];
    }
    const missingParentValues = missingRequiredParentFields(current);
    const signature = completeParentSignature(current);
    if (!signature) {
      logPersonasWarning("siblings-parent-signature-incomplete", { userId: user.id, matricula: currentMatricula, missingFields: missingParentValues });
      const child = mapMatriculaChild({ ...current, user_id: current.user_id || user.id, campus: current.campus || user.campus }, currentMatricula, user.campus || user.empresa);
      return [{ ...child, siblingMatch: "unavailable", canSwitch: false }];
    }
    const candidateSelect = [
      `${matriculaSelect(columnSet, "matricula")} AS matricula`,
      `${matriculaSelect(columnSet, "apellido_paterno")} AS apellido_paterno`,
      `${matriculaSelect(columnSet, "apellido_materno")} AS apellido_materno`,
      `${matriculaSelect(columnSet, "nombres")} AS nombres`,
      `${matriculaSelect(columnSet, "grupo")} AS grupo`,
      `${matriculaSelect(columnSet, "grado")} AS grado`,
      `${matriculaSelect(columnSet, "nivel")} AS nivel`,
      `${matriculaSelect(columnSet, "foto")} AS foto`,
      ...REQUIRED_PARENT_NAME_FIELDS.map((field) => `${matriculaSelect(columnSet, field)} AS ${field}`),
      `${usersSelect(userColumnSet, "id")} AS user_id`,
      `${usersSelect(userColumnSet, "campus")} AS campus`
    ].join(",\n       ");
    const parentWhere = REQUIRED_PARENT_NAME_FIELDS.map((field) => `m.${quoteIdentifier(field)} IS NOT NULL AND TRIM(m.${quoteIdentifier(field)}) <> ''`).join("\n       AND ");
    const candidates = await legacyQuery(
      `SELECT
       ${candidateSelect}
     FROM matricula m
     LEFT JOIN users u ON u.username = m.matricula
     WHERE ${parentWhere}`
    );
    const seen = /* @__PURE__ */ new Set();
    const children = candidates.filter((row) => completeParentSignature(row) === signature).map((row) => mapMatriculaChild(row, currentMatricula, user.campus || user.empresa)).filter((child) => {
      const key = child.matricula || String(child.user_id || "");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => {
      if (a.isCurrent) return -1;
      if (b.isCurrent) return 1;
      return [a.paternoA, a.maternoA, a.nombreA].filter(Boolean).join(" ").localeCompare([b.paternoA, b.maternoA, b.nombreA].filter(Boolean).join(" "), "es");
    });
    if (!children.some((child) => child.isCurrent)) {
      children.unshift(mapMatriculaChild({ ...current, user_id: current.user_id || user.id, campus: current.campus || user.campus }, currentMatricula, user.campus || user.empresa));
    }
    if (children.length <= 1) {
      logPersonasWarning("siblings-no-additional-matches", { userId: user.id, matricula: currentMatricula, searchedCandidates: candidates.length });
    }
    if (children.length > 6) {
      logPersonasWarning("siblings-parent-signature-review-required", { userId: user.id, matricula: currentMatricula, matchedChildren: children.length });
      return children.map((child) => child.isCurrent ? child : { ...child, canSwitch: false, siblingMatch: "review" });
    }
    return children;
  } catch (error) {
    logPersonasDiagnostic("siblings-load-failed", error, { userId: user.id, matricula: currentMatricula });
    throw error;
  }
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
    if (!existing) throw createError({ statusCode: 404, statusMessage: "Recurso no encontrado" });
    if (String(existing.unidad) !== data.unidad || String(existing.sala) !== data.sala || String(existing.type) !== data.type) {
      throw createError({ statusCode: 403, statusMessage: "Recurso fuera del alcance de esta sala" });
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
  if (!row) throw createError({ statusCode: 404, statusMessage: "Recurso no encontrado" });
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
    if (!existing) throw createError({ statusCode: 404, statusMessage: "Cuenta familiar no encontrada" });
    const existingRole = String(existing.role || "").toUpperCase();
    const existingUnidades = String(existing.unidad || "").split(",").map((item) => item.trim()).filter(Boolean);
    const sameSala = String(existing.sala || "") === String(sala.id);
    const sameUnidad = existingUnidades.includes(sala.unidad);
    if (!existingRole.includes("HUSKY") || !sameSala || !sameUnidad) {
      throw createError({ statusCode: 403, statusMessage: "Cuenta familiar fuera del alcance de esta sala" });
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
      `SELECT id, CAST(id AS CHAR) qr, indice, paternoP, maternoP, nombreP, parenP, foto, compressed_foto, fechaP, user_id
       FROM personas_autorizadas
       WHERE user_id = ? AND indice BETWEEN 1 AND 4
       ORDER BY indice ASC, id ASC`,
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
    throw createError({ statusCode: 400, statusMessage: "\xCDndice de persona autorizada inv\xE1lido" });
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
  const existing = payload.id ? await legacyOne("SELECT id, user_id FROM personas_autorizadas WHERE id = ? LIMIT 1", [payload.id]) : await legacyOne("SELECT id, user_id FROM personas_autorizadas WHERE user_id = ? AND indice = ? ORDER BY id ASC LIMIT 1", [user.id, indice]);
  if (payload.id && !existing) throw createError({ statusCode: 404, statusMessage: "Persona autorizada no encontrada" });
  if (existing) {
    assertFamilyOwner(user, existing.user_id);
    await legacyWrite(
      `UPDATE personas_autorizadas
       SET indice = ?, paternoP = ?, maternoP = ?, nombreP = ?, parenP = ?, foto = ?, compressed_foto = ?, fechaP = ?, user_id = ?
       WHERE id = ? AND user_id = ?`,
      [indice, values.paternoP, values.maternoP, values.nombreP, values.parenP, values.foto, values.compressed_foto, values.fechaP, user.id, existing.id, user.id]
    );
    return { ...payload, id: Number(existing.id), indice, user_id: user.id, qr: String(existing.id) };
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
  if (!existing) throw createError({ statusCode: 404, statusMessage: "Persona autorizada no encontrada" });
  assertFamilyOwner(user, existing.user_id);
  await legacyWrite("DELETE FROM personas_autorizadas WHERE id = ? AND user_id = ?", [id, user.id]);
  return { ok: true };
}
async function getCredentialAuthorizedPersona(user, id) {
  var _a;
  const row = await legacyOne(
    `SELECT
       A.*,
       IFNULL(MAX(IFNULL(m.nivel, B.nivelEdu)), 'preescolar') AS nivelEdu,
       UPPER(MAX(u.username)) AS matricula,
       MAX(CASE
         WHEN LEFT(UPPER(u.username), 5) = 'PREEM' THEN 'PREEM'
         WHEN LEFT(UPPER(u.username), 5) = 'PREET' THEN 'PREET'
         WHEN LEFT(UPPER(u.username), 2) = 'DM' THEN 'CM'
         ELSE LEFT(UPPER(u.username), 2)
       END) AS plantel,
       MAX(CONCAT_WS(' ', IFNULL(m.nombres, B.nombreA), IFNULL(m.apellido_paterno, B.paternoA), IFNULL(m.apellido_materno, B.maternoA))) AS fullnameA,
       MAX(IFNULL(c.foto, IFNULL(m.foto, B.foto))) AS fotoA,
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
  if (!row) throw createError({ statusCode: 404, statusMessage: "Persona autorizada no encontrada" });
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
  const rows = await legacyQuery(
    `SELECT
       CONCAT(p.nombreP, ' ', p.paternoP, ' ', p.maternoP) AS fullnameP,
       CASE
         WHEN IFNULL(p.foto, '') <> '' THEN p.foto
         WHEN p.compressed_foto LIKE '%vision=marks-ok%' AND (p.compressed_foto LIKE 'http%' OR p.compressed_foto LIKE '/uploads/%') THEN p.compressed_foto
         WHEN p.compressed_foto LIKE '%vision=marks-ok%' THEN CONCAT('https://admin.casitaiedis.edu.mx/virtual/', p.compressed_foto)
         ELSE ''
       END AS fotoP,
       CONCAT(IFNULL(m.nombres, a.nombreA), ' ', IFNULL(m.apellido_paterno, a.paternoA), ' ', IFNULL(m.apellido_materno, a.maternoA)) AS fullnameA,
       MAX(c.foto) AS fotoA,
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
  if (!rows.length) throw createError({ statusCode: 404, statusMessage: "No se encontr\xF3 el registro" });
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
  if (!admin) throw createError({ statusCode: 401, statusMessage: "Sesi\xF3n no v\xE1lida" });
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
  setCookie(event, "user_segment", "daycare", { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  return { user: familyPreview, loggedin: true };
});

const previewDaycare_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: previewDaycare_post
});

const exit_post = defineEventHandler((event) => {
  var _a;
  const user = getAppSession(event).user;
  const admin = (_a = user == null ? void 0 : user.impersonation) == null ? void 0 : _a.admin;
  if (!user || !admin) {
    throw createError({ statusCode: 400, statusMessage: "No hay una vista familiar activa" });
  }
  setAppSession(event, admin);
  setCookie(event, "user_segment", "internal", { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  return { user: admin, loggedin: true };
});

const exit_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: exit_post
});

const schema$o = z.object({
  login: z.string().min(1),
  password: z.string().min(1)
});
const login_post = defineEventHandler(async (event) => {
  const body = schema$o.parse(await readBody(event));
  const legacyUser = await findLegacyFamilyByLogin(body.login.trim());
  if (!legacyUser) {
    throw createError({ statusCode: 401, statusMessage: "Usuario o contrase\xF1a incorrectos." });
  }
  const valid = await validateLegacyPassword(body.password, legacyUser.raw);
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: "Usuario o contrase\xF1a incorrectos." });
  }
  const sessionUser = legacyUser.toSession("family");
  if (!sessionUser.productScopes.length) {
    throw createError({ statusCode: 403, statusMessage: "La cuenta no tiene un acceso familiar habilitado." });
  }
  setAppSession(event, sessionUser);
  setCookie(event, "user_segment", hasFamilyScope(sessionUser, "daycare") ? "daycare" : "premium", { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  setCookie(event, "last_login_type", "php", { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  return { user: sessionUser, loggedin: true, defaultPath: defaultFamilyRoute(sessionUser) };
});

const login_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: login_post
});

const logout_post = defineEventHandler((event) => {
  clearAppSession(event);
  return { ok: true };
});

const logout_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: logout_post
});

const me_get = defineEventHandler((event) => {
  return getAppSession(event);
});

const me_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: me_get
});

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
    throw createError({ statusCode: 400, statusMessage: "La verificaci\xF3n CAPTCHA no es v\xE1lida." });
  }
  let decoded;
  try {
    decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    throw createError({ statusCode: 400, statusMessage: "La verificaci\xF3n CAPTCHA no es v\xE1lida." });
  }
  if (Date.now() > decoded.exp) {
    throw createError({ statusCode: 400, statusMessage: "La verificaci\xF3n CAPTCHA expir\xF3. Intenta de nuevo." });
  }
  if (Number(answer) !== decoded.answer) {
    throw createError({ statusCode: 400, statusMessage: "La respuesta CAPTCHA no coincide." });
  }
}
function assertRateLimit(key, options) {
  const now = Date.now();
  const previous = (rateBuckets.get(key) || []).filter((time) => now - time < options.windowMs);
  if (previous.length >= options.limit) {
    throw createError({ statusCode: 429, statusMessage: options.message });
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
    throw createError({ statusCode: 400, statusMessage: "No fue posible validar el registro." });
  }
  const startedAt = Number(input.startedAt || 0);
  const elapsed = Date.now() - startedAt;
  if (!Number.isFinite(startedAt) || elapsed < MIN_FORM_SECONDS * 1e3 || elapsed > MAX_FORM_MINUTES * 60 * 1e3) {
    throw createError({ statusCode: 400, statusMessage: "Vuelve a intentar el registro desde el formulario." });
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
    throw createError({ statusCode: 400, statusMessage: issues[0] });
  }
  if (body.currentPassword === body.password) {
    throw createError({ statusCode: 400, statusMessage: "La nueva contrase\xF1a debe ser diferente." });
  }
  try {
    const legacyUser = await findLegacyFamilyById(Number(user.id));
    if (!legacyUser) {
      logSecurityWarning("password-change-family-account-missing", { userId: user.id });
      throw createError({ statusCode: 403, statusMessage: "La cuenta familiar no est\xE1 disponible." });
    }
    const valid = await validateLegacyPassword(body.currentPassword, legacyUser.raw);
    if (!valid) {
      logSecurityWarning("password-change-current-password-invalid", { userId: user.id });
      throw createError({ statusCode: 400, statusMessage: "La contrase\xF1a actual no coincide." });
    }
    await updateLegacyFamilyPassword(Number(user.id), body.password);
    return { ok: true, message: "Contrase\xF1a actualizada." };
  } catch (error) {
    logSecurityDiagnostic("password-change-failed", error, { userId: user.id });
    throw error;
  }
});

const change_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: change_post
});

let schemaReady = false;
let devFileStore = false;
const TOKEN_BYTES = 32;
const ACCOUNT_KIND = "family";
const DEV_STORE_PATH = join(process.cwd(), "artifacts", "password-recovery-emails", "dev-token-store.json");
function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
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
  const minutes = Number(((_a = config.passwordRecovery) == null ? void 0 : _a.tokenTtlMinutes) || 30);
  return Math.max(5, Math.min(minutes, 24 * 60)) * 60 * 1e3;
}
function canUseDevFileStore() {
  var _a;
  const config = useRuntimeConfig();
  return String(((_a = config.passwordRecovery) == null ? void 0 : _a.emailMode) || "").toLowerCase() === "preview";
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
    throw createError({ statusCode: 500, statusMessage: "No fue posible preparar la recuperaci\xF3n de contrase\xF1a." });
  }
}
async function createPasswordRecoveryToken(input) {
  await ensurePasswordRecoverySchema();
  const expiresAt = new Date(Date.now() + tokenTtlMs());
  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  const tokenHash = hashToken(token);
  const email = input.email.trim().toLowerCase();
  try {
    if (devFileStore) {
      const store = await readDevStore();
      const now = Date.now();
      store.rows = store.rows.map((row) => {
        var _a;
        const expires = ((_a = parseMysqlUtc(row.expires_at)) == null ? void 0 : _a.getTime()) || 0;
        if (Number(row.user_id) === input.userId && row.account_kind === ACCOUNT_KIND && !row.used_at && !row.superseded_at && expires > now) {
          return { ...row, superseded_at: mysqlDateUtc(/* @__PURE__ */ new Date()) };
        }
        return row;
      });
      store.rows.push({
        id: store.nextId,
        user_id: input.userId,
        email,
        account_kind: ACCOUNT_KIND,
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
      [input.userId, ACCOUNT_KIND]
    );
    await legacyWrite(
      `INSERT INTO password_recovery_tokens
       (user_id, email, account_kind, token_hash, requested_ip_hash, user_agent_hash, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        input.userId,
        email,
        ACCOUNT_KIND,
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
    throw createError({ statusCode: 500, statusMessage: "No fue posible preparar el enlace de recuperaci\xF3n." });
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
      if (!row2 || row2.account_kind !== ACCOUNT_KIND) return { status: "invalid" };
      if (row2.used_at) return { status: "used", row: row2 };
      if (row2.superseded_at) return { status: "superseded", row: row2 };
      const expiresAt2 = parseMysqlUtc(row2.expires_at);
      if (!expiresAt2 || expiresAt2.getTime() <= Date.now()) return { status: "expired", row: row2 };
      return { status: "valid", row: row2 };
    }
    const row = await legacyOne(
      `SELECT id, user_id, email, account_kind, token_hash, expires_at, used_at, superseded_at, created_at
       FROM password_recovery_tokens
       WHERE token_hash = ?
       LIMIT 1`,
      [hashToken(token)]
    );
    if (!row || row.account_kind !== ACCOUNT_KIND) return { status: "invalid" };
    if (row.used_at) return { status: "used", row };
    if (row.superseded_at) return { status: "superseded", row };
    const expiresAt = parseMysqlUtc(row.expires_at);
    if (!expiresAt || expiresAt.getTime() <= Date.now()) return { status: "expired", row };
    return { status: "valid", row };
  } catch (error) {
    logSecurityDiagnostic("password-recovery-token-validate-failed", error, { tokenHash: securityHash(token) });
    throw createError({ statusCode: 500, statusMessage: "No fue posible validar el enlace." });
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
    throw createError({ statusCode: 400, statusMessage: passwordRecoveryStatusMessage(validation.status) });
  }
  const row = validation.row;
  const familyUser = await findLegacyFamilyById(Number(row.user_id));
  if (!familyUser) {
    logSecurityWarning("password-recovery-family-account-missing", {
      tokenId: row.id,
      userId: row.user_id,
      emailHash: securityHash(row.email)
    });
    throw createError({ statusCode: 400, statusMessage: "El enlace no es v\xE1lido." });
  }
  try {
    if (devFileStore) {
      const store = await readDevStore();
      let consumed = false;
      const nowLabel = mysqlDateUtc(/* @__PURE__ */ new Date());
      store.rows = store.rows.map((candidate) => {
        if (Number(candidate.id) === Number(row.id) && candidate.account_kind === ACCOUNT_KIND && !candidate.used_at && !candidate.superseded_at) {
          const expiresAt = parseMysqlUtc(candidate.expires_at);
          if (expiresAt && expiresAt.getTime() > Date.now()) {
            consumed = true;
            return { ...candidate, used_at: nowLabel };
          }
        }
        return candidate;
      });
      if (!consumed) throw createError({ statusCode: 400, statusMessage: "El enlace ya no est\xE1 disponible." });
      await writeDevStore(store);
    } else {
      const consumed = await legacyWrite(
        `UPDATE password_recovery_tokens
         SET used_at = UTC_TIMESTAMP()
         WHERE id = ? AND account_kind = ? AND used_at IS NULL AND superseded_at IS NULL AND expires_at > UTC_TIMESTAMP()`,
        [row.id, ACCOUNT_KIND]
      );
      if (consumed.affectedRows !== 1) {
        throw createError({ statusCode: 400, statusMessage: "El enlace ya no est\xE1 disponible." });
      }
    }
    await updateLegacyFamilyPassword(Number(row.user_id), password);
    if (devFileStore) {
      const store = await readDevStore();
      const nowLabel = mysqlDateUtc(/* @__PURE__ */ new Date());
      store.rows = store.rows.map((candidate) => Number(candidate.user_id) === Number(row.user_id) && candidate.account_kind === ACCOUNT_KIND && Number(candidate.id) !== Number(row.id) && !candidate.used_at ? { ...candidate, superseded_at: candidate.superseded_at || nowLabel } : candidate);
      await writeDevStore(store);
    } else {
      await legacyWrite(
        `UPDATE password_recovery_tokens
         SET superseded_at = COALESCE(superseded_at, UTC_TIMESTAMP())
         WHERE user_id = ? AND account_kind = ? AND id <> ? AND used_at IS NULL`,
        [row.user_id, ACCOUNT_KIND, row.id]
      );
    }
    return { userId: Number(row.user_id), email: row.email };
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
  email: z.string().trim().email()
});
const neutralMessage = "Si existe una cuenta familiar con ese correo, enviaremos un enlace para restablecer la contrase\xF1a.";
function resetBaseUrl(event) {
  var _a;
  const configured = String(((_a = useRuntimeConfig().passwordRecovery) == null ? void 0 : _a.baseUrl) || "").trim().replace(/\/+$/, "");
  return configured || getRequestURL(event).origin;
}
const forgot_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const body = schema$m.parse(await readBody(event));
  const email = body.email.toLowerCase();
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
    const recovery = await createPasswordRecoveryToken({
      event,
      userId: Number(sessionUser.id),
      email: sessionUser.email || email
    });
    const resetUrl = `${resetBaseUrl(event)}/restablecer-contrasena?token=${encodeURIComponent(recovery.token)}`;
    const theme = resolvePersonasTheme({
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
        theme
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

const forgot_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: forgot_post
});

const reset_get = defineEventHandler(async (event) => {
  const token = String(getQuery$1(event).token || "");
  const validation = await validatePasswordRecoveryToken(token);
  return {
    status: validation.status,
    valid: validation.status === "valid",
    message: passwordRecoveryStatusMessage(validation.status)
  };
});

const reset_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: reset_get
});

const schema$l = z.object({
  token: z.string().min(1),
  password: z.string().min(1),
  confirmation: z.string().min(1)
});
const reset_post = defineEventHandler(async (event) => {
  const body = schema$l.parse(await readBody(event));
  const issues = assertPasswordConfirmation(body.password, body.confirmation);
  if (issues.length) {
    throw createError({ statusCode: 400, statusMessage: issues[0] });
  }
  try {
    await resetPasswordWithRecoveryToken(body.token, body.password);
    return { ok: true, message: "Contrase\xF1a actualizada. Ya puedes iniciar sesi\xF3n." };
  } catch (error) {
    logSecurityDiagnostic("password-recovery-reset-failed", error, { tokenHash: securityHash(body.token) });
    throw error;
  }
});

const reset_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: reset_post
});

const schema$k = z.object({ sala: z.coerce.number().int().positive() });
const familyAccounts_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  assertDaycareAdmin(user);
  const query = schema$k.parse(getQuery$1(event));
  return getFamilyAccounts(user, query.sala);
});

const familyAccounts_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: familyAccounts_get
});

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

const familyAccounts_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: familyAccounts_post
});

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

const resources_get$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: resources_get$2
});

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

const resources_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: resources_post
});

const _id__delete$2 = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  assertDaycareAdmin(user);
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: "Recurso inv\xE1lido" });
  return deleteAdminResource(user, id);
});

const _id__delete$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__delete$2
});

const schema$g = z.object({ hidden: z.boolean() });
const _id__patch = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  assertDaycareAdmin(user);
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: "Recurso inv\xE1lido" });
  const body = schema$g.parse(await readBody(event));
  return setAdminResourceHidden(user, id, body.hidden);
});

const _id__patch$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__patch
});

const schema$f = z.object({ unidad: z.string().optional().default("") });
const salas_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  assertDaycareAdmin(user);
  const query = schema$f.parse(getQuery$1(event));
  if (!query.unidad.trim()) return [];
  return getSalasForUnidad(user, query.unidad);
});

const salas_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: salas_get
});

const _id__get = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  assertDaycareAdmin(user);
  return getSalaById(user, Number(getRouterParam(event, "id")));
});

const _id__get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__get
});

const overview_get$2 = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  assertDaycareAdmin(user);
  return getSalaOperationalOverview(user, Number(getRouterParam(event, "id")));
});

const overview_get$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: overview_get$2
});

const schema$e = z.object({ unidad: z.string().optional().default("") });
const overview_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "admin");
  assertDaycareAdmin(user);
  const query = schema$e.parse(getQuery$1(event));
  const unidad = query.unidad.trim();
  if (!unidad) return [];
  return getSalasOverviewForUnidad(user, unidad);
});

const overview_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: overview_get
});

const uploads_post = defineEventHandler(async (event) => {
  var _a, _b;
  const user = requireSession(event, "admin");
  assertDaycareAdmin(user);
  const parts = await readMultipartFormData(event);
  if (!(parts == null ? void 0 : parts.length)) throw createError({ statusCode: 400, statusMessage: "Selecciona un archivo para subir." });
  const salaPart = parts.find((part) => part.name === "sala");
  const filePart = parts.find((part) => {
    var _a2;
    return part.name === "file" && ((_a2 = part.data) == null ? void 0 : _a2.length);
  });
  const salaId = Number(((_a = salaPart == null ? void 0 : salaPart.data) == null ? void 0 : _a.toString("utf8")) || 0);
  if (!Number.isInteger(salaId) || salaId <= 0) throw createError({ statusCode: 400, statusMessage: "Sala inv\xE1lida para la carga." });
  if (!((_b = filePart == null ? void 0 : filePart.data) == null ? void 0 : _b.length)) throw createError({ statusCode: 400, statusMessage: "Archivo no recibido." });
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

const uploads_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: uploads_post
});

const dashboard_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertDaycareFamily(user);
  return getFamilyDashboard(user);
});

const dashboard_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: dashboard_get
});

const schema$d = z.object({ type: z.enum(["hw", "news", "cal"]) });
const resources_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertDaycareFamily(user);
  const query = schema$d.parse(getQuery$1(event));
  return getFamilyResources(user, query.type);
});

const resources_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: resources_get
});

function clean(value) {
  return String(value || "").trim();
}
function normalizeName(value) {
  return clean(value).replace(/\s+/g, " ");
}
function assertStrongEnoughPassword(password) {
  if (password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: "La contrase\xF1a debe tener al menos 8 caracteres." });
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw createError({ statusCode: 400, statusMessage: "Usa una contrase\xF1a con letras y n\xFAmeros." });
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
  if (!sala) throw createError({ statusCode: 404, statusMessage: "No encontramos la sala seleccionada." });
  const requestedUnidad = clean(unidad);
  if (requestedUnidad && requestedUnidad !== clean(sala.unidad)) {
    throw createError({ statusCode: 400, statusMessage: "La unidad no coincide con la sala seleccionada." });
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
  if (!parentName) throw createError({ statusCode: 400, statusMessage: "Escribe el nombre de madre, padre o tutor." });
  if (!childName) throw createError({ statusCode: 400, statusMessage: "Escribe el nombre del ni\xF1o o ni\xF1a." });
  if (!email) throw createError({ statusCode: 400, statusMessage: "Escribe un correo v\xE1lido." });
  assertStrongEnoughPassword(input.password);
  const sala = await resolvePublicSala(input.sala, input.unidad);
  const existing = await findExistingUsers(email);
  if (existing.length > 1) {
    throw createError({ statusCode: 409, statusMessage: "Encontramos m\xE1s de una cuenta con ese correo. Solicita apoyo de administraci\xF3n." });
  }
  const current = existing[0];
  if (current) {
    const daycare = daycareScopeFor(current);
    if ((daycare == null ? void 0 : daycare.unidad) === sala.unidad && String(daycare.sala) === String(sala.id)) {
      throw createError({ statusCode: 409, statusMessage: "Este correo ya tiene acceso a guarder\xEDa. Ingresa con tu cuenta existente." });
    }
    if (daycare) {
      throw createError({ statusCode: 409, statusMessage: "Este correo ya est\xE1 vinculado a otra sala. Solicita apoyo de administraci\xF3n." });
    }
    throw createError({ statusCode: 409, statusMessage: "Este correo ya existe en Husky Pass. Solicita a administraci\xF3n activar guarder\xEDa en esa cuenta." });
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
  if (!(parts == null ? void 0 : parts.length)) throw createError({ statusCode: 400, statusMessage: "Completa el formulario de registro." });
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

const registration_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: registration_post
});

const captcha_get = defineEventHandler(() => createCaptchaChallenge());

const captcha_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: captcha_get
});

const options_get$2 = defineEventHandler(async () => {
  const salas = await listPublicDaycareSalas();
  const unidades = Array.from(new Set(salas.map((sala) => sala.unidad))).sort((a, b) => a.localeCompare(b, "es"));
  return { unidades, salas };
});

const options_get$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: options_get$2
});

const options_get = defineEventHandler(async () => {
  return {
    variants: DEV_HUSKY_PASS_VARIANTS,
    scenarios: DEV_HUSKY_PASS_SCENARIOS,
    templates: await listMarbeteTemplates(),
    themes: marbeteTemplateThemes()
  };
});

const options_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: options_get
});

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
  if (!template) throw createError({ statusCode: 503, statusMessage: "Plantilla de Husky Pass no disponible." });
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

const pass_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: pass_get
});

const schema$a = z.object({
  seed: z.string().optional().default("husky-pass"),
  label: z.string().optional().default("PA"),
  theme: z.string().optional().default("daycare"),
  mode: z.enum(["portrait", "wide", "tall", "transparent", "large", "slow"]).optional().default("portrait"),
  transparent: z.string().optional().default(""),
  large: z.string().optional().default(""),
  delay: z.coerce.number().int().min(0).max(5e3).optional().default(0)
});
const themeColors = {
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
  const colors = themeColors[query.theme] || themeColors.daycare;
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

const photo_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: photo_get
});

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

const index_get$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: index_get$2
});

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

const motivo_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: motivo_post
});

const config_get = defineEventHandler(async (event) => {
  var _a;
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
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
});

const config_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: config_get
});

const schema$8 = z.object({ id: z.coerce.number().int().positive() });
const credential_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  const query = schema$8.parse(getQuery$1(event));
  return getCredentialAuthorizedPersona(user, query.id);
});

const credential_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: credential_get
});

const schema$7 = z.object({
  src: z.string().min(32),
  personaId: z.number().int().positive().optional().nullable()
});
const faces_post = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  try {
    const body = schema$7.parse(await readBody(event));
    const file = dataUrlToUploadFile(body.src, body.personaId ? `persona-${body.personaId}` : "persona-nueva");
    return uploadToExternalService(file, {
      folder: externalUploadFolder("personas-face", user.id),
      maxBytes: 2 * 1024 * 1024,
      accept: "images",
      filenamePrefix: body.personaId ? `persona-${body.personaId}` : "persona-nueva"
    });
  } catch (error) {
    logPersonasDiagnostic("face-image-api-store", error, { userId: user.id, username: user.username });
    throw error;
  }
});

const faces_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: faces_post
});

const _id__delete = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  try {
    return await deleteAuthorizedPersona(user, Number(getRouterParam(event, "id")));
  } catch (error) {
    logPersonasDiagnostic("family-people-api-delete", error, { userId: user.id, username: user.username, id: getRouterParam(event, "id") });
    throw error;
  }
});

const _id__delete$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__delete
});

const index_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  try {
    return await getAuthorizedPersonas(user);
  } catch (error) {
    logPersonasDiagnostic("family-people-api-load", error, { userId: user.id, username: user.username });
    throw error;
  }
});

const index_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: index_get
});

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
  try {
    const body = schema$6.parse(await readBody(event));
    return await upsertAuthorizedPersona(user, body);
  } catch (error) {
    logPersonasDiagnostic("family-people-api-save", error, { userId: user.id, username: user.username });
    throw error;
  }
});

const index_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: index_post
});

const schema$5 = z.object({
  id: z.coerce.number().int().positive(),
  download: z.string().optional().default(""),
  format: z.enum(["", "svg-preview", "readiness"]).optional().default("")
});
function firstIssue(issues) {
  return issues[0] || "Completa los datos solicitados para descargar el Husky Pass.";
}
const marbete_get = defineEventHandler(async (event) => {
  var _a;
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  const query = schema$5.parse(getQuery$1(event));
  const data = await getCredentialAuthorizedPersona(user, query.id);
  const templates = await listMarbeteTemplates();
  if (!templates.length) throw createError({ statusCode: 503, statusMessage: "El Husky Pass no est\xE1 disponible en este momento. Solicita apoyo a la escuela." });
  const template = selectMarbeteTemplate(templates, { matricula: data.matricula, plantel: data.plantel, nivelEdu: data.nivelEdu });
  if (!template) throw createError({ statusCode: 503, statusMessage: "El Husky Pass no est\xE1 disponible para este alumno. Solicita apoyo a la escuela." });
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
    throw createError({ statusCode: 422, statusMessage: firstIssue(requirementStatus.issues) });
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
});

const marbete_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: marbete_get
});

const schema$4 = z.object({
  src: z.string().min(64)
});
const photoSource_post = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  try {
    const body = schema$4.parse(await readBody(event));
    const file = dataUrlToUploadFile(body.src, "foto-original");
    return uploadToExternalService(file, {
      folder: externalUploadFolder("personas-source", user.id),
      maxBytes: 5 * 1024 * 1024,
      accept: "images",
      filenamePrefix: "foto-original"
    });
  } catch (error) {
    logPersonasDiagnostic("photo-source-api-upload", error, { userId: user.id, username: user.username });
    throw error;
  }
});

const photoSource_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: photoSource_post
});

const schema$3 = z.object({ id: z.coerce.number().int().positive() });
const scan_get = defineEventHandler(async (event) => {
  const query = schema$3.parse(getQuery$1(event));
  return getScanAuthorizedPersona(query.id);
});

const scan_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: scan_get
});

const schema$2 = z.object({
  matricula: z.string().min(1)
});
const siblingSession_post = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  try {
    const body = schema$2.parse(await readBody(event));
    const targetMatricula = normalizeMatricula(body.matricula);
    const siblings = await getFamilyChildren(user);
    const target = siblings.find((child) => child.canSwitch && normalizeMatricula(child.matricula) === targetMatricula);
    if (!target) {
      throw createError({ statusCode: 403, statusMessage: "El alumno no est\xE1 disponible para cambio directo." });
    }
    const legacyUser = await findLegacyFamilyByLogin(targetMatricula);
    if (!legacyUser) {
      throw createError({ statusCode: 404, statusMessage: "No encontramos una cuenta familiar activa para este alumno." });
    }
    const sessionUser = legacyUser.toSession("family");
    if (!hasFamilyScope(sessionUser, "personasAutorizadas")) {
      throw createError({ statusCode: 403, statusMessage: "La cuenta vinculada no tiene Personas Autorizadas habilitado." });
    }
    setAppSession(event, sessionUser);
    setCookie(event, "user_segment", hasFamilyScope(sessionUser, "daycare") ? "daycare" : "premium", { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
    return { user: sessionUser, loggedin: true };
  } catch (error) {
    logPersonasDiagnostic("sibling-session-api-switch", error, { userId: user.id, username: user.username });
    throw error;
  }
});

const siblingSession_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: siblingSession_post
});

const schema$1 = z.object({
  foto: z.string().min(1)
});
const studentPhoto_post = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  try {
    const body = schema$1.parse(await readBody(event));
    if (!/^https?:\/\//i.test(body.foto) && !body.foto.startsWith("/uploads/")) {
      throw createError({ statusCode: 400, statusMessage: "La foto no es v\xE1lida." });
    }
    return await updateStudentCredentialPhoto(user, body.foto);
  } catch (error) {
    logPersonasDiagnostic("student-photo-api-save", error, { userId: user.id, username: user.username });
    throw error;
  }
});

const studentPhoto_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: studentPhoto_post
});

const student_get = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  try {
    return await getEditableStudentProfile(user);
  } catch (error) {
    logPersonasDiagnostic("student-profile-api-load", error, { userId: user.id, username: user.username });
    throw error;
  }
});

const student_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: student_get
});

const editableFields = PARENT_EDITABLE_STUDENT_FIELDS;
const academicFields = /* @__PURE__ */ new Set(["grado", "grupo", "nivel", "nivelEdu", "ciclo", "plantel", "matricula", "servicio", "baja", "status", "estatus", "internal_status", "campus"]);
const valueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]).optional();
const schema = z.object(Object.fromEntries(editableFields.map((field) => [field, valueSchema]))).strict();
const student_post = defineEventHandler(async (event) => {
  const user = requireSession(event, "family");
  assertPersonasAutorizadasFamily(user);
  try {
    const rawBody = await readBody(event);
    const body = (rawBody == null ? void 0 : rawBody.editable) && typeof rawBody.editable === "object" ? rawBody.editable : rawBody;
    const illegal = Object.keys(body || {}).filter((field) => academicFields.has(field) || !editableFields.includes(field));
    if (illegal.length) {
      logPersonasDiagnostic("student-profile-illegal-field-attempt", new Error(`Campo no editable: ${illegal[0]}`), { userId: user.id, username: user.username, illegalFields: illegal });
      throw createError({ statusCode: 403, statusMessage: `Campo no editable por familia: ${illegal[0]}` });
    }
    const parsed = schema.parse(body);
    return await updateEditableStudentProfile(user, parsed);
  } catch (error) {
    logPersonasDiagnostic("student-profile-api-save", error, { userId: user.id, username: user.username });
    throw error;
  }
});

const student_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: student_post
});

const Vue3 = version[0] === "3";

function resolveUnref(r) {
  return typeof r === "function" ? r() : unref(r);
}
function resolveUnrefHeadInput(ref) {
  if (ref instanceof Promise || ref instanceof Date || ref instanceof RegExp)
    return ref;
  const root = resolveUnref(ref);
  if (!ref || !root)
    return root;
  if (Array.isArray(root))
    return root.map((r) => resolveUnrefHeadInput(r));
  if (typeof root === "object") {
    const resolved = {};
    for (const k in root) {
      if (!Object.prototype.hasOwnProperty.call(root, k)) {
        continue;
      }
      if (k === "titleTemplate" || k[0] === "o" && k[1] === "n") {
        resolved[k] = unref(root[k]);
        continue;
      }
      resolved[k] = resolveUnrefHeadInput(root[k]);
    }
    return resolved;
  }
  return root;
}

const VueReactivityPlugin = defineHeadPlugin({
  hooks: {
    "entries:resolve": (ctx) => {
      for (const entry of ctx.entries)
        entry.resolvedInput = resolveUnrefHeadInput(entry.input);
    }
  }
});

const headSymbol = "usehead";
function vueInstall(head) {
  const plugin = {
    install(app) {
      if (Vue3) {
        app.config.globalProperties.$unhead = head;
        app.config.globalProperties.$head = head;
        app.provide(headSymbol, head);
      }
    }
  };
  return plugin.install;
}
function createServerHead(options = {}) {
  const head = createServerHead$1(options);
  head.use(VueReactivityPlugin);
  head.install = vueInstall(head);
  return head;
}

const unheadPlugins = true ? [CapoPlugin({ track: true })] : [];

const renderSSRHeadOptions = {"omitLineBreaks":false};

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

globalThis.__buildAssetsURL = buildAssetsURL;
globalThis.__publicAssetsURL = publicAssetsURL;
const getClientManifest = () => import('file://C:/Users/hp/husky-pass-crm/.nuxt/dist/server/client.manifest.mjs').then((r) => r.default || r).then((r) => typeof r === "function" ? r() : r);
const getServerEntry = () => import('file://C:/Users/hp/husky-pass-crm/.nuxt/dist/server/server.mjs').then((r) => r.default || r);
const getSSRStyles = lazyCachedFunction(() => Promise.resolve().then(function () { return styles$1; }).then((r) => r.default || r));
const getSSRRenderer = lazyCachedFunction(async () => {
  const manifest = await getClientManifest();
  if (!manifest) {
    throw new Error("client.manifest is not available");
  }
  const createSSRApp = await getServerEntry();
  if (!createSSRApp) {
    throw new Error("Server bundle is not available");
  }
  const options = {
    manifest,
    renderToString: renderToString$1,
    buildAssetsURL
  };
  const renderer = createRenderer(createSSRApp, options);
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
  const manifest = await getClientManifest();
  const spaTemplate = await Promise.resolve().then(function () { return _virtual__spaTemplate; }).then((r) => r.template).catch(() => "").then((r) => {
    {
      return APP_ROOT_OPEN_TAG + r + APP_ROOT_CLOSE_TAG;
    }
  });
  const options = {
    manifest,
    renderToString: () => spaTemplate,
    buildAssetsURL
  };
  const renderer = createRenderer(() => () => {
  }, options);
  const result = await renderer.renderToString({});
  const renderToString = (ssrContext) => {
    const config = useRuntimeConfig(ssrContext.event);
    ssrContext.modules = ssrContext.modules || /* @__PURE__ */ new Set();
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
const ISLAND_SUFFIX_RE = /\.json(\?.*)?$/;
async function getIslandContext(event) {
  let url = event.path || "";
  const componentParts = url.substring("/__nuxt_island".length + 1).replace(ISLAND_SUFFIX_RE, "").split("_");
  const hashId = componentParts.length > 1 ? componentParts.pop() : void 0;
  const componentName = componentParts.join("_");
  const context = event.method === "GET" ? getQuery$1(event) : await readBody(event);
  const ctx = {
    url: "/",
    ...context,
    id: hashId,
    name: componentName,
    props: destr(context.props) || {},
    slots: {},
    components: {}
  };
  return ctx;
}
const HAS_APP_TELEPORTS = !!(appTeleportAttrs.id);
const APP_TELEPORT_OPEN_TAG = HAS_APP_TELEPORTS ? `<${appTeleportTag}${propsToString(appTeleportAttrs)}>` : "";
const APP_TELEPORT_CLOSE_TAG = HAS_APP_TELEPORTS ? `</${appTeleportTag}>` : "";
const APP_ROOT_OPEN_TAG = `<${appRootTag}${propsToString(appRootAttrs)}>`;
const APP_ROOT_CLOSE_TAG = `</${appRootTag}>`;
const PAYLOAD_URL_RE = /\/_payload.json(\?.*)?$/ ;
const ROOT_NODE_REGEX = new RegExp(`^<${appRootTag}[^>]*>([\\s\\S]*)<\\/${appRootTag}>$`);
const renderer = defineRenderHandler(async (event) => {
  const nitroApp = useNitroApp();
  const ssrError = event.path.startsWith("/__nuxt_error") ? getQuery$1(event) : null;
  if (ssrError && ssrError.statusCode) {
    ssrError.statusCode = Number.parseInt(ssrError.statusCode);
  }
  if (ssrError && !("__unenv__" in event.node.req)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Page Not Found: /__nuxt_error"
    });
  }
  const isRenderingIsland = event.path.startsWith("/__nuxt_island");
  const islandContext = isRenderingIsland ? await getIslandContext(event) : void 0;
  let url = ssrError?.url || islandContext?.url || event.path;
  const isRenderingPayload = PAYLOAD_URL_RE.test(url) && !isRenderingIsland;
  if (isRenderingPayload) {
    url = url.substring(0, url.lastIndexOf("/")) || "/";
    event._path = url;
    event.node.req.url = url;
  }
  const routeOptions = getRouteRules(event);
  const head = createServerHead({
    plugins: unheadPlugins
  });
  const headEntryOptions = { mode: "server" };
  if (!isRenderingIsland) {
    head.push(appHead, headEntryOptions);
  }
  const ssrContext = {
    url,
    event,
    runtimeConfig: useRuntimeConfig(event),
    noSSR: event.context.nuxt?.noSSR || routeOptions.ssr === false && !isRenderingIsland || (false),
    head,
    error: !!ssrError,
    nuxt: void 0,
    /* NuxtApp */
    payload: ssrError ? { error: ssrError } : {},
    _payloadReducers: /* @__PURE__ */ Object.create(null),
    modules: /* @__PURE__ */ new Set(),
    islandContext
  };
  const renderer = ssrContext.noSSR ? await getSPARenderer() : await getSSRRenderer();
  const _rendered = await renderer.renderToString(ssrContext).catch(async (error) => {
    if (ssrContext._renderResponse && error.message === "skipping render") {
      return {};
    }
    const _err = !ssrError && ssrContext.payload?.error || error;
    await ssrContext.nuxt?.hooks.callHook("app:error", _err);
    throw _err;
  });
  await ssrContext.nuxt?.hooks.callHook("app:rendered", { ssrContext, renderResult: _rendered });
  if (ssrContext._renderResponse) {
    return ssrContext._renderResponse;
  }
  if (ssrContext.payload?.error && !ssrError) {
    throw ssrContext.payload.error;
  }
  if (isRenderingPayload) {
    const response2 = renderPayloadResponse(ssrContext);
    return response2;
  }
  const inlinedStyles = isRenderingIsland ? await renderInlineStyles(ssrContext.modules ?? []) : [];
  const NO_SCRIPTS = routeOptions.experimentalNoScripts;
  const { styles, scripts } = getRequestDependencies(ssrContext, renderer.rendererContext);
  if (ssrContext._preloadManifest) {
    head.push({
      link: [
        { rel: "preload", as: "fetch", fetchpriority: "low", crossorigin: "anonymous", href: buildAssetsURL(`builds/meta/${ssrContext.runtimeConfig.app.buildId}.json`) }
      ]
    }, { ...headEntryOptions, tagPriority: "low" });
  }
  if (inlinedStyles.length) {
    head.push({ style: inlinedStyles });
  }
  {
    const link = [];
    for (const resource of Object.values(styles)) {
      if ("inline" in getQuery(resource.file)) {
        continue;
      }
      if (!isRenderingIsland || resource.file.includes("scoped") && !resource.file.includes("pages/")) {
        link.push({ rel: "stylesheet", href: renderer.rendererContext.buildAssetsURL(resource.file), crossorigin: "" });
      }
    }
    if (link.length) {
      head.push({ link }, headEntryOptions);
    }
  }
  if (!NO_SCRIPTS && !isRenderingIsland) {
    head.push({
      link: getPreloadLinks(ssrContext, renderer.rendererContext)
    }, headEntryOptions);
    head.push({
      link: getPrefetchLinks(ssrContext, renderer.rendererContext)
    }, headEntryOptions);
    head.push({
      script: renderPayloadJsonScript({ ssrContext, data: ssrContext.payload }) 
    }, {
      ...headEntryOptions,
      // this should come before another end of body scripts
      tagPosition: "bodyClose",
      tagPriority: "high"
    });
  }
  if (!routeOptions.experimentalNoScripts && !isRenderingIsland) {
    head.push({
      script: Object.values(scripts).map((resource) => ({
        type: resource.module ? "module" : null,
        src: renderer.rendererContext.buildAssetsURL(resource.file),
        defer: resource.module ? null : true,
        // if we are rendering script tag payloads that import an async payload
        // we need to ensure this resolves before executing the Nuxt entry
        tagPosition: "head",
        crossorigin: ""
      }))
    }, headEntryOptions);
  }
  const { headTags, bodyTags, bodyTagsOpen, htmlAttrs, bodyAttrs } = await renderSSRHead(head, renderSSRHeadOptions);
  const htmlContext = {
    island: isRenderingIsland,
    htmlAttrs: htmlAttrs ? [htmlAttrs] : [],
    head: normalizeChunks([headTags]),
    bodyAttrs: bodyAttrs ? [bodyAttrs] : [],
    bodyPrepend: normalizeChunks([bodyTagsOpen, ssrContext.teleports?.body]),
    body: [
      replaceIslandTeleports(ssrContext, _rendered.html) ,
      APP_TELEPORT_OPEN_TAG + (HAS_APP_TELEPORTS ? joinTags([ssrContext.teleports?.[`#${appTeleportAttrs.id}`]]) : "") + APP_TELEPORT_CLOSE_TAG
    ],
    bodyAppend: [bodyTags]
  };
  await nitroApp.hooks.callHook("render:html", htmlContext, { event });
  if (isRenderingIsland && islandContext) {
    const islandHead = {};
    for (const entry of head.headEntries()) {
      for (const [key, value] of Object.entries(resolveUnrefHeadInput(entry.input))) {
        const currentValue = islandHead[key];
        if (Array.isArray(currentValue)) {
          currentValue.push(...value);
        }
        islandHead[key] = value;
      }
    }
    islandHead.link ||= [];
    islandHead.style ||= [];
    const islandResponse = {
      id: islandContext.id,
      head: islandHead,
      html: getServerComponentHTML(htmlContext.body),
      components: getClientIslandResponse(ssrContext),
      slots: getSlotIslandResponse(ssrContext)
    };
    await nitroApp.hooks.callHook("render:island", islandResponse, { event, islandContext });
    const response2 = {
      body: JSON.stringify(islandResponse, null, 2),
      statusCode: getResponseStatus(event),
      statusMessage: getResponseStatusText(event),
      headers: {
        "content-type": "application/json;charset=utf-8",
        "x-powered-by": "Nuxt"
      }
    };
    return response2;
  }
  const response = {
    body: renderHTMLDocument(htmlContext),
    statusCode: getResponseStatus(event),
    statusMessage: getResponseStatusText(event),
    headers: {
      "content-type": "text/html;charset=utf-8",
      "x-powered-by": "Nuxt"
    }
  };
  return response;
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
function normalizeChunks(chunks) {
  return chunks.filter(Boolean).map((i) => i.trim());
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
  return `<!DOCTYPE html><html${joinAttrs(html.htmlAttrs)}><head>${joinTags(html.head)}</head><body${joinAttrs(html.bodyAttrs)}>${joinTags(html.bodyPrepend)}${joinTags(html.body)}${joinTags(html.bodyAppend)}</body></html>`;
}
async function renderInlineStyles(usedModules) {
  const styleMap = await getSSRStyles();
  const inlinedStyles = /* @__PURE__ */ new Set();
  for (const mod of usedModules) {
    if (mod in styleMap && styleMap[mod]) {
      for (const style of await styleMap[mod]()) {
        inlinedStyles.add(style);
      }
    }
  }
  return Array.from(inlinedStyles).map((style) => ({ innerHTML: style }));
}
function renderPayloadResponse(ssrContext) {
  return {
    body: stringify(splitPayload(ssrContext).payload, ssrContext._payloadReducers) ,
    statusCode: getResponseStatus(ssrContext.event),
    statusMessage: getResponseStatusText(ssrContext.event),
    headers: {
      "content-type": "application/json;charset=utf-8" ,
      "x-powered-by": "Nuxt"
    }
  };
}
function renderPayloadJsonScript(opts) {
  const contents = opts.data ? stringify(opts.data, opts.ssrContext._payloadReducers) : "";
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
  return [
    payload,
    {
      innerHTML: `window.__NUXT__={};window.__NUXT__.config=${config}`
    }
  ];
}
function splitPayload(ssrContext) {
  const { data, prerenderedAt, ...initial } = ssrContext.payload;
  return {
    initial: { ...initial, prerenderedAt },
    payload: { data, prerenderedAt }
  };
}
function getServerComponentHTML(body) {
  const match = body[0].match(ROOT_NODE_REGEX);
  return match?.[1] || body[0];
}
const SSR_SLOT_TELEPORT_MARKER = /^uid=([^;]*);slot=(.*)$/;
const SSR_CLIENT_TELEPORT_MARKER = /^uid=([^;]*);client=(.*)$/;
const SSR_CLIENT_SLOT_MARKER = /^island-slot=[^;]*;(.*)$/;
function getSlotIslandResponse(ssrContext) {
  if (!ssrContext.islandContext || !Object.keys(ssrContext.islandContext.slots).length) {
    return void 0;
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
    return void 0;
  }
  const response = {};
  for (const [clientUid, component] of Object.entries(ssrContext.islandContext.components)) {
    const html = ssrContext.teleports?.[clientUid]?.replaceAll("<!--teleport start anchor-->", "") || "";
    response[clientUid] = {
      ...component,
      html,
      slots: getComponentSlotTeleport(ssrContext.teleports ?? {})
    };
  }
  return response;
}
function getComponentSlotTeleport(teleports) {
  const entries = Object.entries(teleports);
  const slots = {};
  for (const [key, value] of entries) {
    const match = key.match(SSR_CLIENT_SLOT_MARKER);
    if (match) {
      const [, slot] = match;
      if (!slot) {
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

const renderer$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: renderer
});

const styles = {};

const styles$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: styles
});

const template = "";

const _virtual__spaTemplate = /*#__PURE__*/Object.freeze({
  __proto__: null,
  template: template
});
//# sourceMappingURL=index.mjs.map
