import request from "supertest-light";
import express from "../src/index.js";
import tape from "tape";

const app = express();
app.get("/user/:username/messages", (req, res) => {
  res.send(`Hello ${req.params.username}!`);
});
function first(v?: string | string[]): string {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

// GET handler typed as <Path, RB=string, RO=object>
app.get<"/echo", string, { upper: string; length: number }>(
  "/echo",
  (req, res) => {
    const s = req.query?.q ?? ""; //    string
    res.send({ upper: first(s).toUpperCase(), length: s.length });
  }
);

tape("GET /echo — string in, JSON out", async (t) => {
  const r = await request(app)
    .get("/echo?q=hello")
    .then((r) => r);
  t.plan(2);
  t.equal(r.statusCode, 200);
  t.same(JSON.parse(r.text), { upper: "HELLO", length: 5 });
  t.end();
});

tape("not found test", async (t) => {
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
  let called = false;
  app.use((req, _res, next) => {
    called = true;
    next();
  });
  const res = await request(app)
    .set("User-Agent", "Supertest-Light")
    .get("/")
    .then((res) => {
      t.equal(called, true);
    });
});
tape("param test", async (t) => {
  t.plan(1);
  const res = await request(app)
    .set("User-Agent", "Supertest-Light")
    .get("/user/bart/messages")
    .then((res) => {
      t.equal(res.text, "Hello bart!");
    });
});
