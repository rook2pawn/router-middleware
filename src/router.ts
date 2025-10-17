import { type Handler } from "./types.js";

export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type Route = { method: Method; path: string; handlers: Handler[] };
export type Mw = { prefix: string | null; handlers: Handler[] };

export const norm = (p: string) =>
  p === "" ? "/" : p.replace(/\/+$/, "") || "/";
export const join = (a: string, b: string) =>
  (a === "/" ? "" : norm(a)) + (b.startsWith("/") ? b : "/" + b);

export class Router {
  routes: Route[] = [];
  middlewares: Mw[] = [];

  private add(method: Method, path: string, ...handlers: Handler[]) {
    this.routes.push({ method, path: norm(path), handlers });
    return this;
  }

  get(path: string, ...h: Handler[]) {
    return this.add("GET", path, ...h);
  }
  post(path: string, ...h: Handler[]) {
    return this.add("POST", path, ...h);
  }
  put(path: string, ...h: Handler[]) {
    return this.add("PUT", path, ...h);
  }
  patch(path: string, ...h: Handler[]) {
    return this.add("PATCH", path, ...h);
  }
  del(path: string, ...h: Handler[]) {
    return this.add("DELETE", path, ...h);
  }

  // Overloads
  use(fn: Handler): this;
  use(prefix: string, fn: Handler): this;
  use(prefix: string, child: Router): this;
  use(prefixOrFn: string | Handler, maybe?: Router | Handler) {
    // use(fn) — global middleware
    if (typeof prefixOrFn === "function") {
      this.middlewares.push({ prefix: null, handlers: [prefixOrFn] });
      return this;
    }

    const prefix = norm(prefixOrFn);

    // use(prefix, childRouter) — copy child routes & middleware under prefix
    if (maybe instanceof Router) {
      for (const r of maybe.routes) {
        this.routes.push({
          method: r.method,
          path: join(prefix, r.path),
          handlers: r.handlers,
        });
      }
      for (const m of maybe.middlewares) {
        const effective = m.prefix ? join(prefix, m.prefix) : prefix;
        this.middlewares.push({ prefix: effective, handlers: m.handlers });
      }
      return this;
    }

    // use(prefix, fn) — prefix-scoped middleware
    if (typeof maybe === "function") {
      this.middlewares.push({ prefix, handlers: [maybe] });
      return this;
    }

    throw new Error(
      "use(fn), use(prefix, fn), or use(prefix, childRouter) expected"
    );
  }

  exportRoutes() {
    return this.routes.slice();
  }
  exportMiddlewares() {
    return this.middlewares.slice();
  }
}

export default Router;
