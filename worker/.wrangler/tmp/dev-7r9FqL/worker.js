var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.ts
var RAW = "https://raw.githubusercontent.com/dineshdb/adblocklist/main/lists";
var preamble = /* @__PURE__ */ __name((generated) => `
[Adblock Plus 2.0]
! Title: Nepali News Clean Filter
! Version: 0.1.0
! Expires: 1 days (update frequency)
! Homepage: https://dineshdb.github.io/adblocklist/
! License: https://dineshdb.github.io/adblocklist/LICENSE
!
! Please feel free to open an issue or contribute
! Repo: https://github.com/dineshdb/adblocklist
! For more info on rules, see https://adblockplus.org/filter-cheatsheet
! Generated at the edge: ${generated}
`, "preamble");
async function fetchList(name) {
  const res = await fetch(`${RAW}/${name}`, {
    cf: { cacheTtl: 3600, cacheEverything: true }
  });
  if (!res.ok) throw new Error(`upstream ${name}: ${res.status}`);
  return (await res.text()).split("\n").filter((l) => l.trim() !== "");
}
__name(fetchList, "fetchList");
function text(body, type, cache) {
  return new Response(body, {
    headers: {
      "content-type": type,
      "cache-control": cache,
      "access-control-allow-origin": "*"
    }
  });
}
__name(text, "text");
var worker_default = {
  async fetch(request) {
    const url = new URL(request.url);
    const generated = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    try {
      if (url.pathname === "/nepali-news-filters.txt") {
        const [sites, globalRules] = await Promise.all([
          fetchList("nepali-news-sites.txt"),
          fetchList("global-filter.txt")
        ]);
        const filters = sites.flatMap((site) => [
          `! ----- START ${site} -----`,
          `||${site}/*.gif`,
          `||.gif^$domain=${site},image`,
          `! ----- END ${site} -----`,
          ""
        ]);
        return text(
          [preamble(generated), globalRules.join("\n"), "", ...filters].join(
            "\n"
          ),
          "text/plain; charset=utf-8",
          "public, s-maxage=3600"
        );
      }
      if (url.pathname === "/hosts") {
        const sites = await fetchList("nepali-news-sites.txt");
        const body = [
          "# Nepali News Clean Filter \u2014 hosts variant",
          `# generated ${generated}`,
          "# https://github.com/dineshdb/adblocklist",
          "",
          ...sites.map((s) => `0.0.0.0 ${s}`)
        ].join("\n");
        return text(
          body,
          "text/plain; charset=utf-8",
          "public, s-maxage=3600"
        );
      }
      if (url.pathname === "/") {
        return text(
          `<!doctype html><meta charset=utf-8><title>Nepali News Clean Filter</title>
<body style="font-family:ui-monospace,monospace;max-width:60ch;margin:3rem auto;line-height:1.6">
<h1>Nepali News Clean Filter</h1>
<p>Filter list for Nepali news sites, rendered at the edge from
<a href=https://github.com/dineshdb/adblocklist>github.com/dineshdb/adblocklist</a>.</p>
<ul>
<li><a href=/nepali-news-filters.txt>/nepali-news-filters.txt</a> \u2014 Adblock Plus 2.0 list (subscribe URL)</li>
<li><a href=/hosts>/hosts</a> \u2014 0.0.0.0 hosts variant</li>
</ul>`,
          "text/html; charset=utf-8",
          "public, s-maxage=3600"
        );
      }
      return new Response("not found", { status: 404 });
    } catch (err) {
      return new Response(`upstream error: ${String(err)}`, {
        status: 502,
        headers: { "content-type": "text/plain" }
      });
    }
  }
};

// ../../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-J3iqIc/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-J3iqIc/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
