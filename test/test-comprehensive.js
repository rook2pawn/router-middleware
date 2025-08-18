const request = require("supertest-light");
const test = require("tape");
const router = require("../index");
const fs = require("fs");
const qs = require("querystring");

test("test parameterization", function (t) {
  t.plan(2);
  const app = router();
  app.get("/user/:username/:postnumber", function (req, res) {
    t.equal(req.params.postnumber, "341");
    res.write(req.params.username);
    res.end();
  });
  request(app)
    .get("/user/frank/341")
    .then((res) => {
      t.equal(res.text, "frank");
    });
});
test("test parameterization using uuids and query", function (t) {
  t.plan(2);
  const qobj = { foo: "bar", life: "42" };
  const app = router();
  app.get("/user/:id", function (req, res) {
    console.log(req.params);
    console.log(req.query);
    t.deepEquals(req.query, qobj);
    res.write(req.params.id);
    res.end();
  });
  const id = "0efa7810-5a6e-4427-9b32-63c9102bbfe";
  request(app)
    .get(`/user/${id}?${qs.stringify(qobj)}`)
    .then((res) => {
      t.equal(res.text, id);
    });
});

test("multiple middleware,Accept,query", function (t) {
  const app = router();
  t.plan(1);
  app.get(
    "/user/:username",
    function (req, res, next) {
      next();
    },
    function (req, res, next) {
      res.end(req.params.username);
    }
  );
  request(app)
    .get("/user/frank")
    .set("Accept", "cool/beans")
    .then((res) => {
      t.equal(res.text, "frank");
    });
});
