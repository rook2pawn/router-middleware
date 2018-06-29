const request = require("supertest-light");
var test = require("tape");
var router = require("../index");
var response = require("response");
var fs = require("fs");
var qs = require("querystring");

test("test parameterization", function(t) {
  t.plan(2);
  var testFileServer = function(req, res) {
    t.ok(true, "fileserver was hit on a next");
    res.write("beep");
    res.end();
  };
  var app = router();
  app.fileserver(testFileServer);
  app.get("/foo", function(req, res, next) {
    next();
  });
  request(app)
  .get("/foo")
  .then((res) => {
    t.equals(res.text, "beep", "fileserver delivers the message");
    t.end();
  });
});
