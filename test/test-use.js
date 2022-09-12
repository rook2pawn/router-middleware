const http = require("http");
const concat = require("concat-stream");
const request = require("supertest-light");
const test = require("tape");
const router = require("../index");
const fs = require("fs");
const qs = require("querystring");

test("test use", function (t) {
  t.plan(2);
  var app = router();
  app.use(function (req, res, next) {
    t.pass("use happens");
    next();
  });
  app.get("/bar", function (req, res) {
    res.write("baz");
    res.end();
  });
  request(app)
    .get("/bar")
    .then((res) => {
      t.equal(res.text, "baz");
    });
});

test("test multiple use", function (t) {
  t.plan(4);
  var app = router();
  app.use(function (req, res, next) {
    t.pass("use happens");
    next();
  });
  app.use(function (req, res, next) {
    t.pass("use happens");
    next();
  });
  app.use(function (req, res, next) {
    t.pass("use happens");
    next();
  });
  app.get("/bar", function (req, res) {
    res.write("baz");
    res.end();
  });
  request(app)
    .get("/bar")
    .then((res) => {
      t.equal(res.text, "baz");
    });
});

test("test use stop chain", function (t) {
  t.plan(4);
  var app = router();
  app.use(function (req, res, next) {
    t.pass("use happens");
    next();
  });
  app.use(function (req, res, next) {
    t.pass("use happens");
    next();
  });
  app.use(function (req, res, next) {
    t.pass("use happens");
    res.end("EARLY END");
  });
  app.get("/bar", function (req, res) {
    res.write("baz");
    res.end();
  });
  request(app)
    .get("/bar")
    .then((res) => {
      t.equal(res.text, "EARLY END");
    });
});

test("test use bodyParser", function (t) {
  t.plan(1);
  var app = router();
  app.use(router.bodyParser);
  app.post("/bar", function (req, res) {
    const { number } = req.body;
    const val = number * 3;
    res.write(val.toString());
    res.end();
  });
  request(app)
    .post("/bar", { number: 7 })
    .then((res) => {
      t.equal(res.text, "21");
    });
});
test("test use bodyParser without posting data", function (t) {
  t.plan(1);
  var app = router();
  app.use(router.bodyParser);
  app.post("/bar", function (req, res) {
    res.write("hello");
    res.end();
  });
  request(app)
    .post("/bar", { number: 7 })
    .then((res) => {
      t.equal(res.text, "hello");
    });
});
