import type {
  RequestListener,
  IncomingMessage,
  ServerResponse,
} from "node:http";

// Public-facing types
export type AnyParams = Record<string, string>;

export type PathParams<Path extends string> =
  // your existing path→params inference here
  AnyParams;

// keep your AnyParams the same
export type Request<
  RB = unknown,
  P = AnyParams,
  Q = Record<string, string | string[]>
> = IncomingMessage & {
  body: RB;
  params: P;
  query?: Q;
};

export interface Registrar {
  // Route verbs (fluent)
  get<Path extends string, RB = unknown, RO = unknown>(
    path: Path,
    ...handlers: OneOrMore<Handler<RB, RO, PathParams<Path>>>
  ): this;

  post<Path extends string, RB = unknown, RO = unknown>(
    path: Path,
    ...handlers: OneOrMore<Handler<RB, RO, PathParams<Path>>>
  ): this;

  put<Path extends string, RB = unknown, RO = unknown>(
    path: Path,
    ...handlers: OneOrMore<Handler<RB, RO, PathParams<Path>>>
  ): this;

  patch<Path extends string, RB = unknown, RO = unknown>(
    path: Path,
    ...handlers: OneOrMore<Handler<RB, RO, PathParams<Path>>>
  ): this;

  delete<Path extends string, RB = unknown, RO = unknown>(
    path: Path,
    ...handlers: OneOrMore<Handler<RB, RO, PathParams<Path>>>
  ): this;

  head<Path extends string, RB = unknown, RO = unknown>(
    path: Path,
    ...handlers: OneOrMore<Handler<RB, RO, PathParams<Path>>>
  ): this;

  options<Path extends string, RB = unknown, RO = unknown>(
    path: Path,
    ...handlers: OneOrMore<Handler<RB, RO, PathParams<Path>>>
  ): this;

  // --- use() overloads ---
  // global middleware(s)
  use(fn: Handler | ErrorHandler, ...more: Array<Handler | ErrorHandler>): this;

  // prefix-scoped middleware(s)
  use(
    prefix: string,
    fn: Handler | ErrorHandler,
    ...more: Array<Handler | ErrorHandler>
  ): this;

  // mount a child router (keep it 'unknown' to avoid circular type deps)
  use(prefix: string, router: unknown): this;

  // Built-in JSON body parser factory
  jsonParser(opts?: JsonOptions): Handler<any, any, AnyParams>;
}
// Deprecated: old Registrar interface
/*
export interface Registrar {
  get<Path extends string, RB = unknown, RO = unknown>(
    path: Path,
    ...handlers: OneOrMore<Handler<RB, RO, PathParams<Path>>>
  ): void;

  post<Path extends string, RB = unknown, RO = unknown>(
    path: Path,
    ...handlers: OneOrMore<Handler<RB, RO, PathParams<Path>>>
  ): void;

  put<Path extends string, RB = unknown, RO = unknown>(
    path: Path,
    ...handlers: OneOrMore<Handler<RB, RO, PathParams<Path>>>
  ): void;

  patch<Path extends string, RB = unknown, RO = unknown>(
    path: Path,
    ...handlers: OneOrMore<Handler<RB, RO, PathParams<Path>>>
  ): void;

  delete<Path extends string, RB = unknown, RO = unknown>(
    path: Path,
    ...handlers: OneOrMore<Handler<RB, RO, PathParams<Path>>>
  ): void;

  head<Path extends string, RB = unknown, RO = unknown>(
    path: Path,
    ...handlers: OneOrMore<Handler<RB, RO, PathParams<Path>>>
  ): void;

  options<Path extends string, RB = unknown, RO = unknown>(
    path: Path,
    ...handlers: OneOrMore<Handler<RB, RO, PathParams<Path>>>
  ): void;

  use(fn: Handler | ErrorHandler): void;
  // Built-in JSON body parser factory
  jsonParser(opts?: JsonOptions): Handler<any, any, AnyParams>;
}
*/
type NonVoid<T> = T extends void ? never : T;
type PrimitivePayload = string | Buffer | Uint8Array;
type ObjectLike = Record<string, unknown>;

// inherit .end from ServerResponse
export interface Response<RO = unknown>
  extends ServerResponse<IncomingMessage> {
  statusCode: number;
  status: (code: number) => Response<RO>;
  json(body: RO): void;
  send(body: string): void;
  send(body: Buffer): void;
  send(body: Uint8Array): void;
  set(name: string, value: string): Response<RO>;
}

export type Next = (err?: any) => void;

export type Handler<
  RB = unknown,
  RO = unknown,
  P extends AnyParams = AnyParams
> = (req: Request<RB, P>, res: Response<RO>, next: Next) => any;

export type ErrorHandler<
  RB = unknown,
  RO = unknown,
  P extends AnyParams = AnyParams
> = (err: any, req: Request<RB, P>, res: Response<RO>, next: Next) => any;

type OneOrMore<T> = [T, ...T[]];

export type App = RequestListener<
  typeof IncomingMessage,
  typeof ServerResponse
> &
  Registrar;

// intersection type to get both call signature and methods
// for consumers
export type AppType = RequestListener<
  typeof IncomingMessage,
  typeof ServerResponse
> &
  Registrar;

export type ByteLimit = number | `${number}${"b" | "kb" | "mb" | "gb"}`;
export interface JsonOptions {
  limit?: ByteLimit; // default '1mb'
  type?: string | RegExp; // default /application\/json/i
  strict?: boolean; // reject primitives if true (default false)
  keepRaw?: boolean; // attach req.rawBody as Buffer
  onError?: (
    err: Error,
    req: Request<any>,
    res: Response<any>,
    next: Next
  ) => void;
}
