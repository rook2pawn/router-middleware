function setter() {
  const context = this.context;
  const method = this.method;

  // initialize
  if (context.staticRoutes[method.toUpperCase()] === undefined)
    context.staticRoutes[method.toUpperCase()] = {};

  const args = Array.from(arguments);

  let path = args[0];
  const middleware = args.slice(1);
  if (path.match(/:\w+/g) !== null) {
    var keys = path.match(/:\w+/g).map(function(key) {
      return key.replace(/^:/, "");
    });
    var z = path.replace(/:\w+/g, "([^\\/]+)");
    var re = new RegExp(z);
    context.regexRoutes.push({ re: re, originalpath: path, keys: keys });
    context.staticRoutes[method.toUpperCase()][path] = middleware;
  } else {
    // remove trailing forward-slash
    if (path.length > 1 && path.slice(-1) === "/") {
      path = path.slice(0, -1);
    }
    context.staticRoutes[method.toUpperCase()][path] = middleware;
  }
}

module.exports = exports = setter;
