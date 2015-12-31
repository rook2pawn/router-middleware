var methods = require('methods')
var statuscodes = require('./lib/statuscodes')
var handle = require('./lib/handle')

methods.forEach(function(method) {
  handle.setMethod(method)
})
statuscodes.forEach(function(code) {
  handle.setCode(code)
})
module.exports = exports = handle
