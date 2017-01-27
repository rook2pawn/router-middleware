var router = require('./index.js');
var request = require('supertest');
var app = router();
app.get('/foobar',function(req,res) {
  console.log("haha")
})

  var x = request(app);
  x
  .get('/foobar')
  .end(function(err,res) {
    console.log(arguments);
  })
