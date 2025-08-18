const request = require("supertest-light");
const test = require("tape");
const router = require("../index");
const fs = require("fs");
const qs = require("querystring");

test("test parameterization", function(t) {
  t.plan(2);
  const testFileServer = function(req, res) {
    t.ok(true, "fileserver was hit on a next");
    res.write("beep");
    res.end();
  };
  const app = router();
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
