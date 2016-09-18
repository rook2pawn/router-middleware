var setter = function(method,routes,regexroutes) {
  return function() {
    var args = [].concat.apply({},arguments).slice(1);
    if (typeof method == 'string') {
      var path = args[0];
      if (typeof path == 'string') {
        if (path.match(/:\w+/g) !== null) {
          var keys = path.match(/:[^\/]+/g).map(function(key) {
            return key.replace(/^:/,'') 
          })
          var z = path.replace(/:[^\/]+/g,'([^\\/]+)')
          var re = new RegExp(z)
          regexroutes.push({re:re,originalpath:path,keys:keys})
          routes[method.toUpperCase()][path] = args.slice(1)
        } else {
          routes[method.toUpperCase()][path] = args.slice(1)
        }
      } else if (typeof path == 'function') {
        if (routes[method.toUpperCase()].fns == undefined) 
          routes[method.toUpperCase()].fns = [];
        routes[method.toUpperCase()].fns.push({fn:path, middleware:args.slice(1)})
      }
    } else if (typeof method == 'number') {
      routes[method] = args[0];
    }
  }
}
module.exports = exports = setter
