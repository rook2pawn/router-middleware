var http = require('http')
var request = require('request')
var router = require('./index.js')
var app = router()

var server = http.createServer(app)
server.listen(5150)

app.get('/user/:username',function(req,res,next) {
  console.log("beep")
  next()
},function(req,res,next) {
  res.end(req.params.username)
})

request('http://localhost:5150/user/frank',function(err,resp,body) {
  console.log(body)
})
