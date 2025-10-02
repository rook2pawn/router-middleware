// src/index.ts
import type {
  App,
  Handler,
  ErrorHandler,
  Request,
  Response,
  AnyParams,
} from "./types.js";
import { wrap } from "./error.js";
import type { ImplHandler, ImplErrorHandler } from "./types.internal.js";
import {
  createRouteTables,
  addRoute,
  getRoute,
  allowedMethods,
  type Method,
  type RouteTables,
  type MethodMap,
} from "./method-table.js";

function augmentRes(res: any) {
  // Keep original end
  if (!res._rm_end && res.end) res._rm_end = res.end.bind(res);
  if (res.statusCode == null) res.statusCode = 200;

  res.status ??= (code: number) => {
    console.log("setting status", code);
    res.statusCode = code;
    return res;
  };

  res.set ??= (k: string, v: string) => {
    res.setHeader?.(k, v);
    return res;
  };

  res.json ??= (obj: unknown) => {
    if (!res.getHeader?.("Content-Type")) {
      res.setHeader?.("Content-Type", "application/json; charset=utf-8");
    }
    const payload = obj === undefined ? "" : JSON.stringify(obj);
    res._rm_end?.(payload);
  };

  res.send ??= (body: unknown) => {
    if (
      body !== null &&
      typeof body === "object" &&
      !Buffer?.isBuffer?.(body)
    ) {
      return res.json(body);
    }
    res._rm_end?.(body as any);
  };

  res.end ??= () => {
    res._rm_end?.();
  };

  return res;
}

// ---- tiny stateless helpers ----
function isErrMw(fn: Function) {
  return fn.length === 4;
}

// erase + async-safe at the boundary
function asImpl(h: Handler<any, any, any>): ImplHandler {
  return (req, res, next) => wrap(h as any)(req, res, next);
}
function asImplErr(h: ErrorHandler<any, any, any>): ImplErrorHandler {
  const runner = (err: any, req: any, res: any, next: any) =>
    (h as any)(err, req, res, next);
  return (err, req, res, next) => wrap(runner)(err, req, res, next);
}

// param matcher: compares a stored pattern (e.g. "/u/:id") to a URL path
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
    } else if (p !== u) return null;
  }
  return out;
}

export function createApp(): App {
  // ---- per-instance state ----
  const routes: RouteTables = createRouteTables(); // method -> (pattern -> chain)
  const middlewares: ImplHandler[] = [];
  const errorMiddlewares: ImplErrorHandler[] = [];
  let fileserver: ImplHandler | null = null;

  //  const app = {} as App;
  const app = ((req: Request<any, AnyParams>, res: Response<unknown>) => {
    (app as any).handle(req, res);
  }) as unknown as App;

  // use() overload impl
  (app as any).use = (first: any, ...rest: any[]) => {
    if (isErrMw(first)) {
      errorMiddlewares.push(asImplErr(first));
    } else {
      middlewares.push(...([first, ...rest] as Handler[]).map(asImpl));
    }
    return app;
  };

  // fileserver (GET/HEAD fallthrough only)
  (app as any).fileserver = (fs: Function) => {
    fileserver = asImpl(fs as any);
    return app;
  };

  // verbs -> register via method-table
  function addVerb(method: Method) {
    (app as any)[method.toLowerCase()] = (
      path: string,
      ...handlers: Handler[]
    ) => {
      addRoute(routes, method, path, handlers.map(asImpl));
      return app;
    };
  }
  (
    ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"] as const
  ).forEach(addVerb);

  // ---- dispatcher ----
  (app as any).handle = (
    req: Request<any, AnyParams>,
    res: Response<unknown>
  ) => {
    // add response helpers
    augmentRes(res);

    const method = (req as any).method as Method | string;
    const url = (req as any).url ?? (req as any).path ?? "/";

    // Find the method's table, then scan patterns to find a match
    const table: MethodMap | undefined = routes.get(method as Method);
    let matchedChain: ImplHandler[] = [];
    let matchedParams: Record<string, string> | null = null;
    let matchedPattern: string | null = null;

    if (table) {
      for (const [pattern, chain] of table) {
        const p = extractParams(pattern, url);
        if (p) {
          matchedChain = chain;
          matchedParams = p;
          matchedPattern = pattern;
          break;
        }
      }
    }

    // HEAD inherits GET chain if no explicit HEAD
    if (!matchedChain.length && method === "HEAD") {
      const getTable = routes.get("GET");
      if (getTable) {
        for (const [pattern, chain] of getTable) {
          const p = extractParams(pattern, url);
          if (p) {
            matchedChain = chain;
            matchedParams = p;
            matchedPattern = pattern;
            break;
          }
        }
      }
    }

    // Compose full stack
    const stack: ImplHandler[] = [...middlewares, ...matchedChain];

    // Inject params on req for matched routes
    if (matchedParams) {
      (req as any).params = matchedParams;
    }

    let i = 0;
    const next = (err?: any) => {
      if (err) return runErrors(err);
      const layer = stack[i++];
      if (layer) return layer(req, res, next);

      // OPTIONS / 405 helpers when a path exists under other methods
      if (method === "OPTIONS" && matchedPattern) {
        const allow = allowedMethods(routes, matchedPattern).join(", ");
        res.set("Allow", allow);
        // per spec, OPTIONS on existing path is 204 No Content
        // must not send body
        return (res as Response<void>).status(204 as any).send();
      }
      if (!matchedChain.length && matchedPattern) {
        const allow = allowedMethods(routes, matchedPattern).join(", ");
        // 405 Method Not Allowed
        // allow is required
        res.set("Allow", allow);
        res.statusCode = 405;
        return (res as Response<void>).json({
          error: "Method Not Allowed",
          allow: allow.split(", "),
        });
      }

      // Fileserver fallthrough for GET/HEAD
      if ((method === "GET" || method === "HEAD") && fileserver) {
        return fileserver(req, res, finalizeNotFound);
      }

      return finalizeNotFound();
    };

    const runErrors = (err: any) => {
      let j = 0;
      const nextErr = (e?: any) => {
        const layer = errorMiddlewares[j++];
        if (!layer) return finalizeError(e ?? err);
        return layer(e ?? err, req, res, nextErr);
      };
      nextErr(err);
    };
    type _SendType = typeof res.send;
    type _ResType = typeof res;
    // Hover these in your editor; you'll likely see _SendType is `() => void`

    // error 404
    const finalizeNotFound = () => {
      res.status(404).json({ error: "Not Found" });
    };

    // error 500
    const finalizeError = (e: any) => {
      if (!(res as any).headersSent) {
        res.statusCode = e?.statusCode ?? 500;
        res.json({ error: e?.message ?? "Internal Server Error" });
      }
    };

    next();
  };

  return app;
}

export type * from "./types.js";
export default createApp;
