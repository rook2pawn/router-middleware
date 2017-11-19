var server = require('http').createServer((req,res) => {
  res.end("Hello");
})
server.listen(3000);
