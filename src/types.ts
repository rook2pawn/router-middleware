// Public-facing types
export type AnyParams = Record<string, string>;

export type PathParams<Path extends string> =
  // your existing path→params inference here
  AnyParams;

// body always required in response send
export type SendSig<RO> = (body: RO) => void;

export interface Request<RB = unknown, P extends AnyParams = AnyParams> {
  body: RB;
  params: P;
  query?: Record<string, string | string[]>;
  // plus whatever else you expose publicly
}

export interface Response<RO = unknown> {
  statusCode: number;
  headersSent?: boolean; // set by helpers, internal  use only

  status(code: number): this; //  chainable
  set(name: string, value: string): this; // chainable
  json(body: unknown): void; // terminal and sets content-type
  send: SendSig<RO>; // terminal
  end(): void; // the only way to finish without a body.
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

export interface App {
  use: {
    <RB = unknown, RO = unknown, P extends AnyParams = AnyParams>(
      ...fns: OneOrMore<Handler<RB, RO, P>>
    ): App;
    <RB = unknown, RO = unknown, P extends AnyParams = AnyParams>(
      fn: ErrorHandler<RB, RO, P>
    ): App;
  };
  get<Path extends string, RB = unknown, RO = unknown>(
    path: Path,
    ...handlers: OneOrMore<Handler<RB, RO, PathParams<Path>>>
  ): App;
  // post/put/delete/patch/head/options same pattern…
  handle(req: Request<any, AnyParams>, res: Response<any>): void;
}
