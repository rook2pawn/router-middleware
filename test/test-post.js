const request = require("supertest-light");
const test = require("tape");
const router = require("../index");
const fs = require("fs");
const qs = require("querystring");

test("test post, test removal of trailing slash", function (t) {
  t.plan(2);
  const app = router();
  app.post("/user", function (req, res) {
    t.ok(req.body);
    console.log("req body:", req.body.username);
    res.write(req.body.username);
    res.end();
  });
  request(app)
    .post("/user/", { username: "Manny", species: "cat" })
    .then((res) => {
      t.equal(res.text, "Manny");
    });
});

test("test post", function (t) {
  t.plan(3);
  const app = router();
  app.post("/user/:userId/notify", function (req, res) {
    t.ok(req.body.message);
    t.ok(req.params.userId);
    const username = req.params.userId;
    const message = req.body.message;
    res.write(username.concat(":").concat(message));
    res.end();
  });
  request(app)
    .post("/user/manny/notify", { message: "Hello!" })
    .then((res) => {
      t.equal(res.text, "manny:Hello!");
    });
});
