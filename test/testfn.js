var http = require('http');
var router = require('./')
var server = http.createServer(router);


router.fileserver(function(req,res) {
  console.log("FILESERVER!")
})
router.get(function(pathname) {
  console.log("pathname:", pathname)
  return true;
},function(req,res,next) {
  console.log("A")
  next()
},function(req,res,next) {
  console.log("B")
  next()
})
server.listen(3535)
