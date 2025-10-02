// src/query.ts
export type Query = Record<string, string | string[]>;

export function parseQueryFromURL(urlOrPath: string): Query {
  const u = new URL(urlOrPath, "http://local"); // path-only safe
  return searchParamsToObject(u.searchParams);
}

export function searchParamsToObject(sp: URLSearchParams): Query {
  const out: Query = {};
  for (const [rawKey, val] of sp) {
    // Support a[]=1&a[]=2 => { a: ["1","2"] }
    const key = rawKey.endsWith("[]") ? rawKey.slice(0, -2) : rawKey;
    if (key in out) {
      const cur = out[key];
      if (Array.isArray(cur)) cur.push(val);
      else out[key] = [cur as string, val];
    } else {
      // first seen
      out[key] = rawKey.endsWith("[]") ? [val] : val;
    }
  }
  return out;
}
