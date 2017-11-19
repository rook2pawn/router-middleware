var url = require('url');
var qs = require('querystring');
var match = function(req,routes,regexroutes) {

  var path = req.url;
  if ((path.length > 1) && (path.slice(-1) === "/"))
    path = path.slice(0,-1);
  if (path.indexOf('?') !== -1) {
    var parsed = url.parse(req.url);
    req.query = qs.parse(parsed.query);
    path = parsed.pathname;
  }

  if (routes[req.method][path]) {
    return routes[req.method][path]
  }

  // else dynamic route
  var parsed = url.parse(req.url);
  var params = {}
  var originalpath;
  var found = false
  for (var i = 0; i < regexroutes.length; i++) {
    var obj = regexroutes[i]
    var result = parsed.pathname.match(obj.re)
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
