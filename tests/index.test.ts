import test from "node:test";
import assert from "node:assert/strict";
// value import (a real runtime value)
import createApp from "../src/index.ts";

// type-only imports (compile-time only)
import type { Request, Response } from "../src/index.ts";
function mkRes<T = unknown>() : Response<T> { 
  return {
    statusCode: 200,
    body: undefined as T | undefined,
    send(body) {
      this.body = body;
    },
  };
}
test("use middleware", () => {
  console.log("use middleware test");
  const app = createApp();
  let called = false;
  app.use((req, _res, next) => {
    console.log("in middleware");
    called = true;
    next();
  });
  const req = { method: "GET", url: "/", params: {} };
  const res = mkRes();
  app.handle(req, res);
  assert.equal(called, true);
  assert.equal(res.statusCode, 404);
});
test("hello world route", () => {
  const app = createApp();
  app.get("/hello", (_req, res) => {
    res.send("world");
  });
  const req = { method: "GET", url: "/hello", params: {} };
  const res = mkRes();
  app.handle(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body, "world");
});
test("not found", () => {
  const app = createApp();
  const req = { method: "GET", url: "/nope", params: {} };
  const res = mkRes();
  app.handle(req, res);
  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { error: "Not Found" });
});
//# sourceMappingURL=index.test.js.map
