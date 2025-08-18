const request = require("supertest-light");
const test = require("tape");
const router = require("../index");
const fs = require("fs");
const qs = require("querystring");

test("test firewall", function (t) {
  t.plan(1);
  const app = router();
  app.post("/foo", router.firewall, function (req, res) {
    res.write(req.body.username);
    res.end();
  });
  request(app)
    .post("/?/?/?/?/api", {})
    .then((res) => {})
    .catch((e) => {
      t.equal(e.code, "ECONNRESET");
    });
});
