var methods = require('methods')
var next = require('./lib/next')
var setCode = require('./lib/setCode')
var setMethod = require('./lib/setMethod')
var statuscodes = require('./lib/statuscodes')
var match = require('./lib/match')
var setter = require('./lib/setter')
var match = require('./lib/match')


function Handle() {
  if (!(this instanceof Handle)) return new Handle
  this.routes = {}
  this.regexroutes = []
  this.fileserver = undefined
  var that = this
  this.handle = function(req,res) {
    var result = match(req,that.routes,that.regexroutes)
    if (result !== undefined) {
      result[0](req,res,next.bind({req:req,res:res,index:0,that:that})); 
    } else if ((req.method == 'GET') && (that.fileserver !== undefined)) {
      that.fileserver(req,res)
    } else {
      that.handle[404](req,res)
    }
  }
  methods.forEach(function(method) {
    setMethod(method,this.handle,this.routes,this.regexroutes)
  },this)
  statuscodes.forEach(function(code) {
    setCode(code,this.handle,this.routes,this.regexroutes)
  },this)
  return this.handle
}
Handle.prototype.next = next
Handle.prototype.setFileserver = function(_fileserver) {
  this.fileserver = _fileserver
}
module.exports = exports = Handle
