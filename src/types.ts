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
}
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

/*
export interface App
  extends Registrar,
    RequestListener<typeof IncomingMessage, typeof ServerResponse> {}
    */
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
