var router = require('./index.js');
var request = require('supertest');
var app = router();
app.get('/user/:id',function(req,res) {
  console.log("PARAMS:",req.params);
})
app.get('/foobar',function(req,res) {
  console.log("haha")
})

  var x = request(app);
  x
  .get('/user/25215')
  .end(function(err,res) {
    console.log(arguments);
  })

