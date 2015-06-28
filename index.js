var methods = require('methods')
var routes = {}
var status = require('./lib/statuscodes')
var statusroutes = {}
var setter = function(method) {
  return function() {
    var args = [].concat.apply({},arguments).slice(1);
    if (typeof method == 'string') {
      routes[method.toUpperCase()][args[0]] = args.slice(1);
    } else if (typeof method == 'number') {
      statusroutes[method] = args[0];
    }
  }
}
var next = function() {
    routes[this.req.method][this.req.url][++this.index](this.req,this.res,next.bind({req:this.req,res:this.res,index:this.index}));
}
var handle = function(req,res) {
  if (routes[req.method][req.url])
    routes[req.method][req.url][0](req,res,next.bind({req:req,res:res,index:0})); 
  else if ((req.method == 'GET') && (routes.fileserver !== undefined))
    routes.fileserver(req,res)
  else {
    statusroutes[404](req,res)
  }
}
methods.forEach(function(method) {
  routes[method.toUpperCase()] = {}
  handle[method] = setter(method)
})
status.forEach(function(code) {
  handle[code] = setter(parseInt(code))
})
handle.fileserver = function(fileserver) {
  routes.fileserver = fileserver
}
module.exports = exports = handle
