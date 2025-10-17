// src/index.ts
import type {
  RequestListener,
  IncomingMessage,
  ServerResponse,
} from "node:http";
import type {
  App,
  Handler,
  AnyParams,
  Response,
  Request,
  ErrorHandler,
} from "./types.js";
import { parseQueryFromURL } from "./query.js";
import { jsonParser } from "./bodyParser.js";
import { Router, type Route, norm, join } from "./router.js";

/* ---------- types ---------- */
type JsonRes = Response<Record<string, unknown>>;

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
type ImplHandler = (
  req: any,
  res: any,
  next: (err?: any) => void
) => void | Promise<void>;
type ImplErrorHandler = (
  err: any,
  req: any,
  res: any,
  next: (err?: any) => void
) => void | Promise<void>;
type RouteEntry = { pattern: string; chain: ImplHandler[] };
type MethodMap = Map<string, RouteEntry[]>; // method -> list of (pattern, chain)
type NodeReqBits = {}; // internal additions if you want

/* ---------- tiny helpers ---------- */

// guardMw stages the prefixMatch test before invoking the real middleware
// part of the helpers for router.use(prefix, fn)
function guardMw(prefix: string, fn: Handler): ImplHandler {
  const impl = asImpl(fn);
  const p = norm(prefix);
  return (req, res, next) => {
    const urlPath = (req.url || "/").split("?")[0];
    if (prefixMatch(urlPath, p)) return impl(req, res, next);
    next(); // skip if outside prefix
  };
}

// guardErrMw stages the prefixMatch test before invoking the real error middleware
// part of the helpers for router.use(prefix, fn)
function guardErrMw(prefix: string, fn: ErrorHandler): ImplErrorHandler {
  const impl = asImplErr(fn);
  const p = norm(prefix);
  return (err, req, res, next) => {
    const urlPath = (req.url || "/").split("?")[0];
    if (prefixMatch(urlPath, p)) return impl(err, req, res, next);
    next(err); // keep propagating error if outside prefix
  };
}

function getChildRoutes(r: Router) {
  return (r as any).exportRoutes
    ? (r as any).exportRoutes()
    : (r as any).routes ?? [];
}
function getChildMws(r: Router) {
  return (r as any).exportMiddlewares
    ? (r as any).exportMiddlewares()
    : (r as any).middlewares ?? [];
}

function prefixMatch(urlPath: string, prefix: string) {
  return urlPath === prefix || urlPath.startsWith(prefix + "/");
}

function ensureTable(routes: MethodMap, method: Method): RouteEntry[] {
  let table = routes.get(method);
  if (!table) {
    table = [];
    routes.set(method, table);
  }
  return table;
}
function mountRouter(prefix: string, child: Router, routes: MethodMap) {
  const p = norm(prefix);
  for (const cr of getChildRoutes(child)) {
    const full = join(p, cr.path);
    const table = ensureTable(routes, cr.method as Method);
    table.push({ pattern: full, chain: cr.handlers.map(asImpl) });
  }
}

function isErrMw(fn: Function) {
  return fn.length === 4;
}
function asImpl(h: Handler<any, any, any>): ImplHandler {
  return (req, res, next) => {
    try {
      const maybe = (h as any)(req, res, next);
      if (maybe && typeof maybe.then === "function")
        (maybe as Promise<void>).catch(next);
    } catch (e) {
      next(e);
    }
  };
}
function asImplErr(h: ErrorHandler<any, any, any>): ImplErrorHandler {
  return (err, req, res, next) => {
    try {
      const maybe = (h as any)(err, req, res, next);
      if (maybe && typeof maybe.then === "function")
        (maybe as Promise<void>).catch(next);
    } catch (e) {
      next(e);
    }
  };
}

/** Compare a stored pattern (e.g. "/u/:id" or "/u/:id?") with a URL path, returning params or null */
function extractParams(
  pattern: string,
  urlPath: string
): Record<string, string> | null {
  if (!pattern || !urlPath) return null;
  const q = urlPath.indexOf("?");
  const path = q === -1 ? urlPath : urlPath.slice(0, q);

  const pSegs = pattern.split("/").filter(Boolean);
  const uSegs = path.split("/").filter(Boolean);
  if (pSegs.length !== uSegs.length) return null;

  const out: Record<string, string> = {};
  for (let i = 0; i < pSegs.length; i++) {
    const p = pSegs[i]!;
    const u = uSegs[i]!;
    if (p.startsWith(":")) {
      const isOptional = p.endsWith("?");
      const name = isOptional ? p.slice(1, -1) : p.slice(1);
      try {
        out[name] = decodeURIComponent(u);
      } catch {
        out[name] = u;
      }
    } else if (p !== u) {
      return null;
    }
  }
  return out;
}

/** Compute Allow header for the current URL by checking which methods have a matching pattern */
function allowedMethods(routes: MethodMap, url: string): Method[] {
  const allow: Method[] = [];
  (
    ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"] as Method[]
  ).forEach((m) => {
    const table = routes.get(m);
    if (!table) return;
    for (const { pattern } of table) {
      if (extractParams(pattern, url)) {
        allow.push(m);
        break;
      }
    }
  });
  // RFC says GET implies HEAD is allowed if GET exists; we include HEAD explicitly anyway
  return Array.from(new Set(allow));
}

/* ---------- response augmentation (safe) ---------- */
function augmentRes<T>(res: Response<T>): Response<T> {
  const anyRes = res as any;

  // Preserve original end so helpers can call it
  if (!anyRes._rm_end && anyRes.end) anyRes._rm_end = anyRes.end.bind(anyRes);
  if (anyRes.statusCode == null) anyRes.statusCode = 200;

  anyRes.status ??= ((code: number) => {
    anyRes.statusCode = code;
    return res;
  }) as Response<T>["status"];

  anyRes.set ??= ((name: string, value: string) => {
    anyRes.setHeader?.(name, value);
    return res;
  }) as Response<T>["set"];

  anyRes.json ??= ((obj: T) => {
    if (!anyRes.getHeader?.("Content-Type")) {
      anyRes.setHeader?.("Content-Type", "application/json; charset=utf-8");
    }
    const payload = obj === undefined ? "" : JSON.stringify(obj as any);
    (anyRes._rm_end ?? anyRes.end).call(anyRes, payload);
  }) as Response<T>["json"];

  anyRes.send ??= ((body: unknown) => {
    if (
      body !== null &&
      typeof body === "object" &&
      !Buffer?.isBuffer?.(body) &&
      !(body instanceof Uint8Array)
    ) {
      return anyRes.json(body);
    }
    if (
      typeof body === "string" ||
      Buffer?.isBuffer?.(body) ||
      body instanceof Uint8Array
    ) {
      if (!anyRes.getHeader?.("Content-Type")) {
        anyRes.setHeader?.("Content-Type", "text/plain; charset=utf-8");
      }
      anyRes._rm_end?.(body as any);
    } else {
      // fall back to JSON for non-string-ish values
      anyRes.json?.(body);
    }
  }) as Response<T>["send"];

  // Provide a no-arg end that defers to original
  anyRes.end = anyRes.end ?? ((() => anyRes._rm_end?.()) as Response<T>["end"]);

  return res;
}

/* ---------- app factory ---------- */
function createApp(): App {
  const routes: MethodMap = new Map(); // method -> [{pattern, chain}]
  const middlewares: ImplHandler[] = [];
  const errorMiddlewares: ImplErrorHandler[] = [];
  let fileserver: ImplHandler | null = null;

  const handle: RequestListener<
    typeof IncomingMessage,
    typeof ServerResponse
  > = (req, res) => {
    const reqX = req as Request<any, AnyParams> & NodeReqBits;
    const resX = res as Response<any>;

    // augment request/response
    (reqX as any).query = parseQueryFromURL(req.url ?? "/");
    augmentRes(resX);

    const method = (req.method as Method) ?? "GET";
    const url = req.url ?? "/";

    // Find matching chain + params under method
    const methodTable = routes.get(method);
    let matchedChain: ImplHandler[] = [];
    let matchedParams: Record<string, string> | null = null;
    let matchedPattern: string | null = null;

    const scanTable = (table?: RouteEntry[]) => {
      if (!table) return;
      for (const { pattern, chain } of table) {
        const p = extractParams(pattern, url);
        if (p) {
          matchedChain = chain;
          matchedParams = p;
          matchedPattern = pattern;
          break;
        }
      }
    };

    scanTable(methodTable);

    // HEAD inherits GET if no explicit HEAD
    if (!matchedChain.length && method === "HEAD") {
      scanTable(routes.get("GET"));
    }

    // Build execution stack
    const stack: ImplHandler[] = [...middlewares, ...matchedChain];

    // Inject params
    if (matchedParams) {
      (reqX as any).params = matchedParams;
    }

    let i = 0;

    const finalizeNotFound = () => {
      (resX as JsonRes).status(404).json({ error: "Not Found" });
    };

    const finalizeError = (e: any) => {
      if (!(resX as any).headersSent) {
        (resX as any).statusCode = e?.statusCode ?? 500;
        (resX as any).json?.({ error: e?.message ?? "Internal Server Error" });
      }
    };

    const runErrors = (err: any) => {
      let j = 0;
      const nextErr = (e?: any) => {
        const layer = errorMiddlewares[j++];
        if (!layer) return finalizeError(e ?? err);
        try {
          const maybe = layer(e ?? err, reqX, resX, nextErr);
          if (maybe && typeof (maybe as any).then === "function") {
            (maybe as Promise<void>).catch(nextErr);
          }
        } catch (inner) {
          nextErr(inner);
        }
      };
      nextErr(err);
    };

    const next = (err?: any) => {
      if (err) return runErrors(err);
      if ((resX as any).headersSent) return;

      const layer = stack[i++];
      if (layer) {
        try {
          const maybe = layer(reqX as any, resX as any, next);
          if (maybe && typeof (maybe as any).then === "function") {
            (maybe as Promise<void>).catch(next);
          }
        } catch (e) {
          next(e);
        }
        return;
      }

      // OPTIONS helper (only if the URL matches *some* registered pattern)
      if (method === "OPTIONS") {
        const allow = allowedMethods(routes, url);
        if (allow.length) {
          (resX as any).set?.("Allow", allow.join(", "));
          // No body for 204
          return (resX as Response<void>).status?.(204 as any).end?.();
        }
      }

      // 405 if this path exists under other methods
      if (!matchedChain.length) {
        const allow = allowedMethods(routes, url);
        if (allow.length) {
          (resX as any).set?.("Allow", allow.join(", "));
          (resX as any).statusCode = 405;
          return (resX as any).json?.({
            error: "Method Not Allowed",
            allow,
          });
        }
      }

      // Fileserver fallthrough for GET/HEAD
      if ((method === "GET" || method === "HEAD") && fileserver) {
        return fileserver(reqX as any, resX as any, finalizeNotFound);
      }

      return finalizeNotFound();
    };

    next();
  };

  // callable app
  const app = handle as unknown as App;

  function addVerb(method: Method) {
    (app as any)[method.toLowerCase()] = (
      path: string,
      ...handlers: Handler[]
    ) => {
      const chain = handlers.map(asImpl);
      const table = routes.get(method) ?? [];
      table.push({ pattern: path, chain });
      routes.set(method, table);
      return app;
    };
  }
  (
    ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"] as const
  ).forEach(addVerb);

  // middlewares / error middlewares
  (app as any).use = (first: any, ...rest: any[]) => {
    // 1) use(fn[, fn...]) — global middleware(s) and/or error middleware(s)
    if (
      typeof first === "function" &&
      (rest.length === 0 || typeof rest[0] === "function")
    ) {
      const fns = [first, ...rest].filter(Boolean);
      for (const fn of fns) {
        if (isErrMw(fn)) errorMiddlewares.push(asImplErr(fn));
        else middlewares.push(asImpl(fn));
      }
      return app;
    }

    // 2) use(prefix, router)
    if (typeof first === "string" && rest[0] instanceof Router) {
      if (rest.length > 1)
        throw new Error("use(prefix, router) expects exactly 2 args");
      mountRouter(first, rest[0] as Router, routes);
      return app;
    }

    // 3) use(prefix, fn[, fn...]) — prefix-scoped middleware(s)
    if (typeof first === "string" && typeof rest[0] === "function") {
      const prefix = first;
      const fns = rest.filter(Boolean);
      for (const fn of fns) {
        if (isErrMw(fn)) errorMiddlewares.push(guardErrMw(prefix, fn));
        else middlewares.push(guardMw(prefix, fn));
      }
      return app;
    }

    throw new Error(
      "use(fn...), use(prefix, fn...), or use(prefix, router) expected"
    );
  };
  // fileserver (GET/HEAD fallthrough)
  (app as any).fileserver = (fs: Function) => {
    fileserver = asImpl(fs as any);
    return app;
  };

  // optional explicit handle
  (app as any).handle = handle;

  // built-in JSON body parser middleware
  (app as any).jsonParser = jsonParser;

  return app;
}

/* re-export your public types */
export type { App, Handler, Request, Response } from "./types.js";
export { Router }; // re-export for named import
export default createApp; // default export is the app factory
