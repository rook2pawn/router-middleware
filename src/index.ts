export type Next = () => void;
export type Handler<
  TReqBody = unknown,
  TResOut = unknown,
  TParams extends Record<string, string> = Record<string, string>
> = (req: Request<TReqBody, TParams>, res: Response<TResOut>, next: Next) => void;

type AnyParams = Record<string, string>;
type AnyHandler = Handler<any, any, AnyParams>;


export interface Request<
TReqBody = unknown,
TParams extends Record<string, string> = Record<string, string>
> {
  method: string;
  url: string;
  params: TParams;
  body?: TReqBody;
}

export interface Response <TResBody = unknown, > {
  statusCode: number;
  body?: TResBody;
  send: (body: TResBody) => void;
}
export type PathParams<S extends string> =
  S extends `${string}:${infer Param}/${infer Rest}`
    ? (Param extends `${infer Name}?`
        ? { [K in Name]?: string }
        : { [K in Param]: string }) & PathParams<`/${Rest}`>
    : S extends `${string}:${infer Param}`
      ? (Param extends `${infer Name}?`
          ? { [K in Name]?: string }
          : { [K in Param]: string })
      : {};


export interface App {
  use: <RB = unknown, RO = unknown, P extends AnyParams = AnyParams>(
    fn: Handler<RB, RO, P>
  ) => App;

  get: <Path extends string, RB = unknown, RO = unknown>(
    path: Path,
    fn: Handler<RB, RO, PathParams<Path>>
  ) => App;

  // handle works on the erased shapes internally
  handle: (req: Request<any, AnyParams>, res: Response<any>) => void;
}
function extractParams(pattern: string, path: string): Record<string, string> | null {
  if (!pattern || !path) return null;

  // Trim query without allocating an array
  const q = path.indexOf("?");
  const pathname = q === -1 ? path : path.slice(0, q);

  const pSegs = pattern.split("/").filter(s => s.length > 0);
  const uSegs = pathname.split("/").filter(s => s.length > 0);

  if (pSegs.length !== uSegs.length) return null;

  const out: Record<string, string> = {};

  for (let i = 0; i < pSegs.length; i++) {
    const p = pSegs[i]!; // non-null: we checked lengths
    const u = uSegs[i]!; // non-null

    if (p.startsWith(":")) {
      const isOptional = p.endsWith("?");
      const name = isOptional ? p.slice(1, -1) : p.slice(1);

      // decode defensively in case of bad encodings
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


export function createApp(): App {
  const middlewares: AnyHandler[] = [];
  const routes: Array<{ method: string; path: string; fn: AnyHandler }> = [];

  const app: App = {
    use(fn) {
      middlewares.push(fn as AnyHandler); // erase to storage type
      return app;
    },

    get(path, fn) {
      routes.push({ method: "GET", path, fn: fn as AnyHandler }); // erase here too
      return app;
    },

    handle(req, res) {
      let routeFn: AnyHandler | undefined;
      let routeParams: AnyParams | undefined;

      for (const r of routes) {
        if (r.method !== req.method) continue;
        const params = extractParams(r.path, req.url);
        if (params) { routeFn = r.fn; routeParams = params; break; }
      }

      const stack: AnyHandler[] = [
        ...middlewares,
        routeFn ?? notFound as AnyHandler
      ];

      let idx = 0;
      const next: Next = () => {
        const layer = stack[idx++];
        if (!layer) return;
        if (routeParams) (req as Request<any, AnyParams>).params = routeParams;
        layer(req as Request<any, AnyParams>, res as Response<any>, next);
      };
      next();
    }
  };

  return app;
}
function matchRoute(
  method: string,
  url: string,
  routes: Array<{ method: string; path: string; fn: Handler }>
): Handler | undefined {
  return routes.find(r => r.method === method && r.path === url)?.fn;
}

const notFound: Handler = (_req, res) => {
  res.statusCode = 404;
  res.send({ error: "Not Found" });
};

export default createApp;
