import type { AnyParams, Request, Response, Next } from "./types.js";

export type ImplHandler = (
  req: Request<any, AnyParams>,
  res: Response<any>,
  next: Next
) => any;

export type ImplErrorHandler = (
  err: any,
  req: Request<any, AnyParams>,
  res: Response<any>,
  next: Next
) => any;

// Partial bits of Node's IncomingMessage we use internally
export type NodeReqBits = { url?: string; method?: string; path?: string };
