import tape from "tape";
import request from "supertest-light";
import rm from "../src/index.js";
import { Router } from "../src/router.js";

/**
 * Helpers
 */
function planEnd(t: tape.Test, n: number) {
  t.plan(n);
}

/**
 * 1) mounting a child router under a prefix
 */
tape("router: use('/api/v1', v1) prefixes child routes", async (t) => {
  const app = rm();
  const v1 = new Router();

  v1.get("/strategies", (_req, res) => {
    res.send("ok");
  });

  app.use("/api/v1", v1);

  planEnd(t, 2);
  const r = await request(app).get("/api/v1/strategies");
  t.equal(r.statusCode, 200);
  t.equal(r.text, "ok");
});

/**
 * 2) prefix middleware runs before the child route
 */
tape("router: prefix middleware runs before child route", async (t) => {
  const app = rm();
  const v1 = new Router();
  const order: string[] = [];

  // prefix-scoped middleware
  app.use("/api/v1", (_req, _res, next) => {
    order.push("mw");
    next();
  });

  v1.get("/ping", (_req, res) => {
    order.push("route");
    res.send("pong");
  });

  app.use("/api/v1", v1);

  planEnd(t, 3);
  const r = await request(app).get("/api/v1/ping");
  t.equal(r.statusCode, 200);
  t.equal(r.text, "pong");
  t.deepEqual(
    order,
    ["mw", "route"],
    "middleware precedes route under same prefix"
  );
});

/**
 * 3) method mismatch => 405 with Allow header
 */
tape("router: method mismatch returns 405 + Allow", async (t) => {
  const app = rm();
  const v1 = new Router();

  v1.get("/only-get", (_req, res) => res.send("ok"));
  app.use("/api/v1", v1);

  planEnd(t, 3);
  const r = await request(app).post("/api/v1/only-get");
  t.equal(r.statusCode, 405, "Method Not Allowed");
  t.ok(r.headers["allow"], "has Allow header");
  t.ok(r.headers["allow"].includes("GET"), "Allow includes GET");
});

/**
 * 4) prefix-scoped middleware does NOT run outside its prefix
 */
tape("router: prefix middleware is scoped", async (t) => {
  const app = rm();
  let hitV1 = 0;
  let hitV2 = 0;

  app.use("/api/v1", (_req, _res, next) => {
    hitV1++;
    next();
  });
  app.use("/api/v2", (_req, _res, next) => {
    hitV2++;
    next();
  });

  const v1 = new Router();
  const v2 = new Router();
  v1.get("/a", (_req, res) => res.send("v1"));
  v2.get("/b", (_req, res) => res.send("v2"));

  app.use("/api/v1", v1);
  app.use("/api/v2", v2);

  planEnd(t, 4);

  const r1 = await request(app).get("/api/v1/a");
  t.equal(r1.text, "v1");
  t.equal(hitV1, 1, "v1 middleware ran");

  const r2 = await request(app).get("/api/v2/b");
  t.equal(r2.text, "v2");
  t.equal(hitV2, 1, "v2 middleware ran (v1 did not)");
});

/**
 * 5) fallthrough when no route matches => 404 (and global middleware still runs)
 */
tape("router: 404 on miss; global middleware still runs", async (t) => {
  const app = rm();
  let called = false;

  // global middleware (no prefix)
  app.use((_req, _res, next) => {
    called = true;
    next();
  });

  const v1 = new Router();
  v1.get("/exists", (_req, res) => res.send("here"));
  app.use("/api/v1", v1);

  planEnd(t, 2);
  const r = await request(app).get("/api/v1/missing");
  t.equal(r.statusCode, 404);
  t.equal(called, true, "global middleware ran for 404");
});
