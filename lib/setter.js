var setter = function(method,routes,regexroutes) {
  return function() {
    var args = Array.from(arguments);
    if (typeof method == 'string') {
      var path = args[0];
      // the code from 7-20 turns predefined routes into capturing groups and forms a dynamic regex
      // so that regex can capture paramterized URL routes
      if (typeof path == 'string') {
//        console.log("original path:", path)
        if (path.match(/:\w+/g) !== null) {
          var keys = path.match(/:\w+/g).map(function(key) {
            return key.replace(/^:/,'') 
          })
//         console.log("Keys:", keys)
          var z = path.replace(/:\w+/g,'([^\\/]+)')
//          console.log("new path:", z)
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
