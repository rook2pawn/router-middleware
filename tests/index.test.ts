import request from "supertest-light";
import rm from "../src/index.js";
import tape from "tape";

tape("GET /echo — string in, JSON out", async (t) => {
  const app = rm();
  function first(v?: string | string[]): string {
    return Array.isArray(v) ? v[0] ?? "" : v ?? "";
  }

  // GET handler typed as <Path, RB=string, RO=object>
  app.get<"/echo", string, { upper: string; length: number }>(
    "/echo",
    (req, res) => {
      const s = req.query?.q ?? ""; //    string
      res.json({ upper: first(s).toUpperCase(), length: s.length });
    }
  );

  const r = await request(app)
    .get("/echo?q=hello")
    .then((r) => r);
  t.plan(2);
  t.equal(r.statusCode, 200);
  t.same(JSON.parse(r.text), { upper: "HELLO", length: 5 });
  t.end();
});

tape("not found test", async (t) => {
  const app = rm();

  t.plan(1);
  const res = await request(app)
    .set("User-Agent", "Supertest-Light")
    .get("/nope")
    .then((res) => {
      t.equal(res.statusCode, 404);
    });
});
tape("use middleware test", async (t) => {
  t.plan(1);
  const app = rm();
  app.get("/health", (_req, res) => {
    res.send("ok");
  });

  let called = false;
  app.use((_req, _res, next) => {
    called = true;
    next();
  });
  const res = await request(app)
    .set("User-Agent", "Supertest-Light")
    .get("/health")
    .then((_res) => {
      t.equal(called, true);
    });
});
tape("404 still uses middleware test", async (t) => {
  // this test to be updated once path specific middleware is added
  const app = rm();

  t.plan(1);
  let called = false;
  app.use((_req, _res, next) => {
    called = true;
    next();
  });
  const res = await request(app)
    .set("User-Agent", "Supertest-Light")
    .get("/foobar")
    .then((_res) => {
      t.equal(called, true);
    });
});
tape("param test", async (t) => {
  const app = rm();

  app.get("/user/:username/messages", (req, res) => {
    res.send(`Hello ${req.params.username}!`);
  });

  t.plan(1);
  const res = await request(app)
    .set("User-Agent", "Supertest-Light")
    .get("/user/bart/messages")
    .then((res) => {
      t.equal(res.text, "Hello bart!");
    });
});

tape("post json test", async (t) => {
  const app = rm();
  app.post("/foobar", app.jsonParser(), (req, res) => {
    const { name } = req.body as { name?: string };
    res.json({ hello: name ?? "world" });
  });
  t.plan(1);
  const res = await request(app)
    .set("User-Agent", "Supertest-Light")
    .post("/foobar", { name: "bart" })
    .then((res) => {
      t.deepEqual(res.body, { hello: "bart" });
    });
});
