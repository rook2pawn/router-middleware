var http = require('http');
var Router = require('.');
var app = Router();
var server = http.createServer(app);
app.get('/', (req,res,next) => {
  res.end("Hello");
})
server.listen(3000)
