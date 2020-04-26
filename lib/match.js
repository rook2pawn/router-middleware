const url = require("url");
const qs = require("querystring");
const match = ({ req, routes, regexRoutes }) => {
  const path = req.url;
  const method = req.method.toUpperCase();
  if (routes[method] && routes[method][path]) {
    // returns middleware
    return routes[method][path];
  }

  // else dynamic route, i.e. parameter based route e.g. GET /user/:userid
  const parsed = url.parse(req.url);
  const params = {};
  let route;
  let found = false;
  for (let i = 0; i < regexRoutes.length; i++) {
    let regexRoute = regexRoutes[i];
    let result = parsed.pathname.match(regexRoute.re);
    if (result !== null) {
      found = true;
      route = regexRoute.route;
      regexRoute.keys.forEach(function (key, idx) {
        params[key] = result[idx + 1];
      });
      break;
    }
  }
  if (found) {
    req.params = params;
    return routes[req.method][route];
  }
  return undefined;
};
module.exports = exports = match;
