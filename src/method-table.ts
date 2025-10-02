// Minimal internal types — import yours instead if you’ve got them
import type { ImplHandler } from "./types.internal.js";
export type Method =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

export type MethodMap = Map<string, ImplHandler[]>; // path -> chain
export type RouteTables = Map<Method, MethodMap>; // method -> MethodMap

export function createRouteTables(): RouteTables {
  return new Map();
}

export function methodTable(routes: RouteTables, method: Method): MethodMap {
  let table = routes.get(method);
  if (!table) {
    table = new Map<string, ImplHandler[]>();
    routes.set(method, table);
  }
  return table;
}

/** Append handlers to a route (creates the entry if missing). */
export function addRoute(
  routes: RouteTables,
  method: Method,
  path: string,
  handlers: ImplHandler[]
): void {
  const table = methodTable(routes, method);
  const chain = table.get(path) ?? [];
  if (!table.has(path)) table.set(path, chain);
  chain.push(...handlers);
}

/** Return the chain for an exact path; never undefined. */
export function getRoute(
  routes: RouteTables,
  method: Method,
  path: string
): readonly ImplHandler[] {
  const chain = routes.get(method)?.get(path);
  return chain ? chain : [];
}

/** Compute Allow header for a path (methods that have a handler for this path). */
export function allowedMethods(routes: RouteTables, path: string): Method[] {
  const out: Method[] = [];
  for (const [m, table] of routes) {
    if (table.has(path)) out.push(m);
  }
  return out.sort(); // stable order for tests
}

/** For tests/maintenance */
export function clear(routes: RouteTables): void {
  routes.clear();
}
