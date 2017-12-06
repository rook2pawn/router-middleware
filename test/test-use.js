var request = require("supertest");
var test = require("tape");
var router = require("../index");
var fs = require("fs");
var qs = require("querystring");

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
  var x = request(app);
  x.get("/bar").end(function(err, res) {
    t.equal(res.text, "baz");
  });
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
  var x = request(app);
  x.get("/bar").end(function(err, res) {
    t.equal(res.text, "baz");
  });
});
