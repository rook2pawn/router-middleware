var url = require('url')
var match = require('./match')
var setter = require('./setter')

var routes = {}
var regexroutes = []
var fileserver

var next = function() {
  var pathname = url.parse(this.req.url).pathname
  if (pathname === undefined) 
    return
  this.index++;
  if (this.fnindex === undefined) {
    if ((this.req.method == 'GET') && (routes[this.req.method][pathname][this.index] === undefined) && (fileserver !== undefined)) {
      fileserver(this.req,this.res)
    } else 
      routes[this.req.method][pathname][this.index](this.req,this.res,next.bind({req:this.req,res:this.res,index:this.index}));
  } else {
    if ((this.req.method == 'GET') && (routes[this.req.method].fns[this.fnindex].middleware[this.index] === undefined) && (fileserver !== undefined)) {
      fileserver(this.req,this.res)
    } else 
      routes[this.req.method].fns[this.fnindex].middleware[this.index](this.req,this.res,next.bind({req:this.req,res:this.res,index:this.index,fnindex:this.fnindex}));
  }
}
var handle = function(req,res) {
  var result = match(req,routes,regexroutes)
  if (result !== undefined) {
    result[0](req,res,next.bind({req:req,res:res,index:0})); 
  } else if ((req.method == 'GET') && (fileserver !== undefined)) {
    fileserver(req,res)
  } else {
    handle[404](req,res)
  }
}
handle.setCode = function(code) {
  handle[code] = setter(parseInt(code),routes,regexroutes)
}
handle.setMethod = function(method) {
  routes[method.toUpperCase()] = {}
  handle[method] = setter(method,routes,regexroutes)
}
handle.fileserver = function(_fileserver) {
  fileserver = _fileserver
}
module.exports = exports = handle
