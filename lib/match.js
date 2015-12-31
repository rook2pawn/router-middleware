var url = require('url')
var match = function(req,routes,regexroutes) {
  var pathname = url.parse(req.url).pathname
  if (routes[req.method][pathname])
    return routes[req.method][pathname]
  var params = {}
  var originalpath;
  var found = false
  for (var i = 0; i < regexroutes.length; i++) {
    var obj = regexroutes[i]
    var result = pathname.match(obj.re)
    if (result !== null) {
      found = true
      originalpath = obj.originalpath
      obj.keys.forEach(function(key,idx) {
        params[key] = result[idx+1]
      })
      break;
    }
  }  
  if (found) {
    req.params = params
    return routes[req.method][originalpath]
  }
  return undefined
}
module.exports = exports = match
