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
