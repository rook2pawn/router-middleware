var http = require('http')
var request = require('request')
var router = require('./index.js')
var fs = require('fs')
var app = router()

var server = http.createServer(app)
server.listen(5150)

app.get('/user/:username',function(req,res,next) {
  console.log("beep")
  next()
},function(req,res,next) {
  res.end(req.params.username)
})
app.get('/', function(req,res,next) {
  res.render('index', { title: 'Hey', message: 'Hello there!'});
})

app.engine('ntl', function (filePath, options, callback) { // define the template engine
  fs.readFile(filePath, function (err, content) {
    if (err) return callback(new Error(err));
    // this is an extremely simple template engine
    var rendered = content.toString().replace('#title#', ''+ options.title +'')
    .replace('#message#', ''+ options.message +'');
    return callback(null, rendered);
  })
});
app.set('views', './views'); // specify the views directory
app.set('view engine', 'ntl'); // register the template engine

request('http://localhost:5150/user/frank',function(err,resp,body) {
  console.log(body)
})
request('http://localhost:5150/',function(err,resp,body) {
  console.log(body)
})
