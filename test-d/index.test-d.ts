import { expectType } from "tsd";
import type { Response } from "../src/types.js";

// --- Response<string> ---
{
  const rStr: Response<string> = {} as any;

  // send accepts string; returns void
  expectType<void>(rStr.send("ok"));

  // send accepts Buffer / Uint8Array too
  // @ts-ignore Buffer type if not in env typing; otherwise:
  // expectType<void>(rStr.send(Buffer.from("x")));
  expectType<void>(rStr.send(new Uint8Array([1, 2, 3])));

  // objects should go through json, not send
  // @ts-expect-error
  rStr.send({ nope: true });

  // end is chainable (this/Response<string>)
  expectType<Response<string>>(rStr.end());
}
// --- Response<void> ---
{
  const rVoid: Response<void> = {} as any;

  // still can send primitive payloads
  expectType<void>(rVoid.send("ok"));
  expectType<void>(rVoid.send(new Uint8Array([9])));

  // end is chainable
  expectType<Response<void>>(rVoid.end());

  // calling send with no args should be an error
  // @ts-expect-error
  rVoid.send();
}

// --- Response<{ id: string }> ---
{
  type OutUser = { id: string };
  const rObj: Response<OutUser> = {} as any;

  // json requires exact T (object-like)
  expectType<void>(rObj.json({ id: "u1" }));

  // send does NOT accept objects
  // @ts-expect-error
  rObj.send({ id: "u1" });

  // send still accepts primitive payloads if you really want to emit text
  expectType<void>(rObj.send("serialized"));

  // end is chainable
  expectType<Response<OutUser>>(rObj.end());
}
