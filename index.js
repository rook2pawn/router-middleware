var methods = require('methods')
var url = require('url')
var statuscodes = require('./lib/statuscodes')
var handle = require('./lib/handle')

methods.forEach(function(method) {
  handle.setMethod(method)
})

statuscodes.forEach(function(code) {
  handle.setCode(code)
})

handle.setstatusroutes(statusroutes)
module.exports = exports = handle
