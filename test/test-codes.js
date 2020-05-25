const request = require("supertest-light");
const test = require("tape");
const router = require("../index");
const fs = require("fs");
const qs = require("querystring");

test("test 404", function (t) {
  t.plan(2);
  const app = router();
  request(app)
    .get("/user/frank/341")
    .then((res) => {
      t.equal(res.statusCode, 404);
      t.equal(res.text, "Not found");
    });
});
