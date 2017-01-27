var methods = require('methods');
var render = require('./render');
var match = require('./match')
var setCode = require('./setCode')
var setMethod = require('./setMethod')
var streamrender = require('./streamrender');
var statuscodes = require('./statuscodes');

var Handle = function(context) {
  var _handle = function(req,res) {
    if (res.render === undefined) {
      res.render = render.bind({res:res,engines:context.engines,props:context.props})
    }
    if (res.streamrender === undefined) {
      res.streamrender = streamrender.bind({res:res,streamengines:context.streamengines,props:context.props})
    }
    if (req._index === undefined) 
      req._index = 0
    else 
      req._index++
    var result = match(req,context.routes,context.regexroutes)
    if (result !== undefined) {
      result[req._index](req,res,function() {
        _handle(req,res)
      })
    } else if ((req.method == 'GET') && (context.fileserver !== undefined)) {
      context.fileserver(req,res)
    } else {
      _handle[404](req,res)
    }
  }
  methods.forEach(function(method) {
    setMethod(method,_handle,context.routes,context.regexroutes)
  })
  statuscodes.forEach(function(code) {
    setCode(code,_handle,context.routes,context.regexroutes)
  })  
  _handle.set = function(key,value) {
    context.props[key] = value
  }
  _handle.engine = function(extension,enginecb) {
    context.engines[extension] = enginecb
  }
  _handle.streamengine = function(extension,enginecb) {
    context.streamengines[extension] = enginecb
  }
  _handle.fileserver = function(_fileserver) {
    context.fileserver = _fileserver
  }
  return _handle;
}
exports = module.exports = Handle;