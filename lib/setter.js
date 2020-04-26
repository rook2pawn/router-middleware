function setter({ path, middlewares, routes, regexRoutes, method }) {
  if (path.length > 1 && path.slice(-1) === "/") {
    path = path.slice(0, -1);
  }
  routes[method.toUpperCase()][path] = middlewares;
  if (path.match(/:\w+/g) !== null) {
    var keys = path.match(/:\w+/g).map(function (key) {
      return key.replace(/^:/, "");
    });
    var z = path.replace(/:\w+/g, "([^\\/]+)");
    var re = new RegExp(z);
    regexRoutes.push({ re: re, route: path, keys: keys });
    routes[method.toUpperCase()][path] = middlewares;
  }
}

module.exports = exports = setter;
