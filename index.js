var methods = require('methods')
var routes = {}
var setter = function(method) {
  return function() {
    var args = [].concat.apply({},arguments).slice(1);
    routes[method.toUpperCase()][args[0]] = args.slice(1);
  }
}
var next = function() {
    routes[this.req.method][this.req.url][++this.index](this.req,this.res,next.bind({req:this.req,res:this.res,index:this.index}));
}
var handle = function(req,res) {
  if (routes[req.method][req.url])
    routes[req.method][req.url][0](req,res,next.bind({req:req,res:res,index:0}));
}
methods.forEach(function(method) {
  routes[method.toUpperCase()] = {}
  handle[method] = setter(method)
})
module.exports = exports = handle
