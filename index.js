var methods = require('methods')
var setCode = require('./lib/setCode')
var setMethod = require('./lib/setMethod')
var statuscodes = require('./lib/statuscodes')
var setter = require('./lib/setter')
var match = require('./lib/match')
var path = require('path')
var fs = require('fs')


function Handle() {
  if (!(this instanceof Handle)) return new Handle
  this.routes = {}
  this.regexroutes = []
  this.fileserver = undefined
  this.props = {}
  this.engines = {}
  var that = this
  var render = function(basename, obj) {
    var res = this.res
    var viewEngine = that.props['view engine']
    var filePath = path.join(__dirname, that.props['views'], basename).concat(".").concat(viewEngine)
    if (fs.existsSync(filePath)) {
      that.engines[viewEngine](filePath,obj,function(err,rendered) {
        res.write(rendered)
        res.end()
      })
    } else {
      //throw new Error("res.render filepath:", filePath)
    }
  }
  var handle = function(req,res) {
    if (res.render === undefined) {
      res.render = render.bind({res:res})
    }
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
  handle.set = function(key,value) {
    that.props[key] = value
  }
  handle.engine = function(extension,enginecb) {
    that.engines[extension] = enginecb
  }
  return handle
}
Handle.prototype.setFileserver = function(_fileserver) {
  this.fileserver = _fileserver
}
module.exports = exports = Handle
