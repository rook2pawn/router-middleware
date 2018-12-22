const http = require("http");
const concat = require("concat-stream");
const request = require("supertest-light");
const test = require("tape");
const router = require("../index");
const fs = require("fs");
const qs = require("querystring");

test("test use", function(t) {
  t.plan(2);
  var app = router();
  app.use(function(req, res, next) {
    t.pass("use happens");
    next();
  });
  app.get("/bar", function(req, res) {
    res.write("baz");
    res.end();
  });
  request(app)
  .get("/bar")
  .then((res) => {
    t.equal(res.text, "baz");
  })
});

test("test multiple use", function(t) {
  t.plan(4);
  var app = router();
  app.use(function(req, res, next) {
    t.pass("use happens");
    next();
  });
  app.use(function(req, res, next) {
    t.pass("use happens");
    next();
  });
  app.use(function(req, res, next) {
    t.pass("use happens");
    next();
  });
  app.get("/bar", function(req, res) {
    res.write("baz");
    res.end();
  });
  request(app)
  .get("/bar")
  .then((res) => {
    t.equal(res.text, "baz");
  })
});
