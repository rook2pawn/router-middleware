var methods = require('methods')
var url = require('url')
var routes = {}
var status = require('./lib/statuscodes')
var statusroutes = {}
var setter = function(method) {
  return function() {
    var args = [].concat.apply({},arguments).slice(1);
    if (typeof method == 'string') {
      var path = args[0];
      if (typeof path == 'string')
        routes[method.toUpperCase()][path] = args.slice(1);
      else if (typeof path == 'function') {
        if (routes[method.toUpperCase()].fns == undefined) 
          routes[method.toUpperCase()].fns = [];
        routes[method.toUpperCase()].fns.push({fn:path, middleware:args.slice(1)})
      }
    } else if (typeof method == 'number') {
      statusroutes[method] = args[0];
    }
  }
}
var next = function() {
  var pathname = url.parse(this.req.url).pathname
  this.index++;
  if (this.fnindex === undefined) {
    if ((this.req.method == 'GET') && (routes[this.req.method][pathname][this.index] === undefined) && (routes.fileserver !== undefined)) {
      routes.fileserver(this.req,this.res)
    } else 
      routes[this.req.method][pathname][this.index](this.req,this.res,next.bind({req:this.req,res:this.res,index:this.index}));
  } else {
    if ((this.req.method == 'GET') && (routes[this.req.method].fns[this.fnindex].middleware[this.index] === undefined) && (routes.fileserver !== undefined)) {
      routes.fileserver(this.req,this.res)
    } else 
      routes[this.req.method].fns[this.fnindex].middleware[this.index](this.req,this.res,next.bind({req:this.req,res:this.res,index:this.index,fnindex:this.fnindex}));
  }
}
var handle = function(req,res) {
  var pathname = url.parse(req.url).pathname
  if (routes[req.method][pathname])
    routes[req.method][pathname][0](req,res,next.bind({req:req,res:res,index:0})); 
  else if (routes[req.method].fns !== undefined) {
    var list = routes[req.method].fns;
    for (var i = 0; i < list.length; i++) {
      if (list[i].fn(pathname,req) === true) {
        list[i].middleware[0](req,res,next.bind({req:req,res:res,index:0,fnindex:i})) 
        break;
      }
    }
  } else if ((req.method == 'GET') && (routes.fileserver !== undefined))
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
handle.statusroutes = statusroutes;
module.exports = exports = handle
