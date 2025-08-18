var http = require("http");
var router = require("./");
var app = router();
var server = http.createServer(app);

app.post("/user/:userId/email", router.bodyParser, function (req, res, next) {
  console.log("Query:", req.query);
  // { authToken: '1234' }
  console.log("Params:", req.params);
  // { userId: 'abc123' }
  console.log("Body:", req.body);
  return res.end(`user id was: ${req.params.userId}\n`);
});

server.listen(5150);

// curl -X POST -d '{"message" : "Hello World!"}' "http://localhost:5150/user/abc123/email?authToken=1234"
