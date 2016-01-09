var http = require('http')
var router = require('./index.js')
var app = router()

var server = http.createServer(app)

var count = 0;
app.get('/foo',function(req,res,next) {
  count++
  next()
},function(req,res,next) {
  res.write(count.toString())
  res.end('\n')
})
server.listen(5150)
