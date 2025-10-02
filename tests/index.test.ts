import request from "../../supertest-light";
import express from "../src/index.js";
import tape from "tape";

const app = express();
app.get("/user/:username/messages", (req, res) => {
  res.send(`Hello ${req.params.username}!`);
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
