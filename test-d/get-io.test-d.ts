import { expectType, expectError } from "tsd";
import { type Request, type Response } from "../src/types.js";
import createApp from "../src/index.js";

const app = createApp();

/**
 * 1) GET: string body in, string body out
 *    Generics: <Path, RB, RO>
 */
app.get<"/echo", string, string>("/echo", (req, res) => {
  // INPUT enforced:
  expectType<string>(req.body); // must be string
  expectType<Record<string, string>>(req.params); // PathParams is AnyParams
  expectType<Record<string, string | string[]> | undefined>(req.query);

  // OUTPUT enforced:
  res.send(req.body.toUpperCase()); // must send string
  expectType<void>(res.send("hello")); // send returns void

  // @ts-expect-error — RO is OutUser, so string is not allowed
  res.send({ nope: true }); // ❌ not a string
  expectType<Response<string>>(res.end()); // end returns void
});

/**
 * 2) GET: object body in, object body out
 */
type InUser = { id: string };
type OutUser = { id: string; username: string };

app.get<"/users/get", InUser, OutUser>("/users/get", (req, res) => {
  // must send OutUser
  expectType<void>(res.json({ id: req.body.id, username: "bart" }));

  // negative: missing prop
  // @ts-expect-error
  res.json({ id: "1" });

  // chaining
  expectType<Response<OutUser>>(res.end());
});
/*
 * 3) GET: no body (RB = never), object out
 *    Using `never` makes any access to req.body a type error.
 */

type SearchResult = { total: number; hits: Array<{ id: string }> };

app.get<"/search", never, SearchResult>("/search", (req, res) => {
  // Disallow body usage on GET handlers:
  // @ts-expect-error - `req.body` is never
  // you cannot read a prop on `never`
  req.body.foo;

  // You can still use query as you like:
  expectType<Record<string, string | string[]> | undefined>(req.query);

  res.json({ total: 0, hits: [] });
});

/**
 * 4) GET: RB = unknown, RO = string — demonstrate “must pass body to send”
 */
app.get<"/health", unknown, string>("/health", (_req, res) => {
  expectType<void>(res.send("OK"));
});
