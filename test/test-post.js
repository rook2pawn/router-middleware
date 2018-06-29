const request = require("supertest-light");
var test = require("tape");
var router = require("../index");
var response = require("response");
var fs = require("fs");
var qs = require("querystring");

test("test post", function(t) {
  t.plan(2);
  var app = router();
  app.post("/user", router.bodyParser, function(req, res) {
    t.ok(req.body);
    console.log("req body:", req.body.username)
    res.write(req.body.username);
    res.end();
  });
  request(app)
    .post("/user/", { username: "Manny", species: "cat" })
    .then((res) => {
      t.equal(res.text, "Manny");
    });
});

test("test post", function(t) {
  t.plan(3);
  var app = router();
  app.post("/user/:userId/notify", router.bodyParser, function(req, res) {
    t.ok(req.body.message);
    t.ok(req.params.userId);
    var username = req.params.userId;
    var message = req.body.message;
    res.write(username.concat(":").concat(message));
    res.end();
  });
  request(app)
    .post("/user/manny/notify",{message:"Hello!"})
    .then((res) => {
      t.equal(res.text, "manny:Hello!");
    });
});
