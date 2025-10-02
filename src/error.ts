import type { Next } from "./types.js";

// wrap handlers so thrown errors go to next()
export const wrap =
  <T extends (...a: any[]) => any>(fn: T) =>
  (...a: Parameters<T>) =>
    Promise.resolve(fn(...a)).catch((err) => {
      const next = a[a.length - 1] as Next;
      next?.(err);
    });
export function isErrMw(fn: Function) {
  return fn.length === 4;
} // (err, req, res, next)
