var methods = require('methods')
var setCode = require('./lib/setCode')
var setMethod = require('./lib/setMethod')
var statuscodes = require('./lib/statuscodes')
var setter = require('./lib/setter')
var match = require('./lib/match')

function Handle(req,res) {
  if (!(this instanceof Handle)) return new Handle
  this.routes = {}
  this.regexroutes = []
  this.fileserver = undefined
  var that = this
  var handle = function(req,res) {
    if (req._index === undefined) 
      req._index = 0
    else 
      req._index++
    var result = match(req,that.routes,that.regexroutes)
    if (result !== undefined) {
      result[req._index](req,res,function() {
        handle(req,res)
      })
    } else if ((req.method == 'GET') && (that.fileserver !== undefined)) {
      this.fileserver(req,res)
    } else {
      handle[404](req,res)
    }
  }
  methods.forEach(function(method) {
    setMethod(method,handle,this.routes,this.regexroutes)
  },this)
  statuscodes.forEach(function(code) {
    setCode(code,handle,this.routes,this.regexroutes)
  },this)
  return handle
}
Handle.prototype.setFileserver = function(_fileserver) {
  this.fileserver = _fileserver
}
module.exports = exports = Handle
