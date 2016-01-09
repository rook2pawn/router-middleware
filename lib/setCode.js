module.exports = exports = setCode
var setter = require('./setter')
function setCode(code,handle,routes,regexroutes) {
  handle[code] = setter(parseInt(code),routes,regexroutes)
}
