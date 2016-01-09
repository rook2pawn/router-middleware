module.exports = exports = setMethod
var setter = require('./setter')
function setMethod(method,handle,routes,regexroutes) {
  routes[method.toUpperCase()] = {}
  handle[method] = setter(method,routes,regexroutes)
}
