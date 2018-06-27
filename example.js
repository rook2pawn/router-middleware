    var http = require('http')
    var router = require('./')
    var app = router();
    var server = http.createServer(app)

    app.post('/user/:userId/email', router.bodyParser, function(req,res,next) {

      console.log(req.query);
      // { authToken: '1234' }
      console.log(req.params);
      // { userId: 'abc123' }
      console.log(req.body);
    })

    server.listen(5150);

// curl -X POST -d '{"message" : "Hello World!"}' "http://localhost:5150/user/abc123/email?authToken=1234"
